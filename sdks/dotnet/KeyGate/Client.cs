using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using NSec.Cryptography;
namespace Rns.KeyGate;

public sealed class KeyGateException(string code):Exception(code){public string Code{get;}=code;}
public record State(string DeviceId,string? Token,string? ActivationKey,DateTimeOffset LastSeen);
public interface IStorage{Task<State?> Read();Task Write(State state);}
public sealed class MemoryStorage:IStorage{private State? state;public Task<State?> Read()=>Task.FromResult(state);public Task Write(State value){state=value;return Task.CompletedTask;}}
public record Feature(string Key,DateTimeOffset? ExpiresAt);
public record Access(string LicenseId,string AppId,string Environment,string PlanKey,IReadOnlyList<Feature> Features,int Revision);
public sealed class Client{
 private readonly string appId,environment,apiUrl,issuer,initialDevice;
 private readonly IStorage storage;private readonly HttpClient http;private readonly Func<DateTimeOffset> clock;
 private readonly Dictionary<string,JsonNode> keys=[];
 private static DateTimeOffset Later(DateTimeOffset previous,DateTimeOffset current)=>current>previous?current:previous;
 public Client(string appId,string environment,string apiUrl,IStorage storage,string? deviceId=null,HttpClient? http=null,Func<DateTimeOffset>? clock=null){
  if(!Guid.TryParse(appId,out _)||environment is not("sandbox" or "live")||!Uri.TryCreate(apiUrl,UriKind.Absolute,out var uri)||uri.Scheme is not("https" or "http"))throw new KeyGateException("invalid_configuration");
  this.appId=appId;this.environment=environment;this.apiUrl=apiUrl.TrimEnd('/');issuer=Regex.Replace(this.apiUrl,@"/(?:api/)?v1$","");this.storage=storage;initialDevice=deviceId??Guid.NewGuid().ToString();this.http=http??new HttpClient{Timeout=TimeSpan.FromSeconds(10)};this.clock=clock??(()=>DateTimeOffset.UtcNow);
 }
 private async Task<State> Read(){
  try{var state=await storage.Read();if(state is null){state=new State(initialDevice,null,null,clock());await storage.Write(state);}if(state.DeviceId.Length is <8 or >256)throw new KeyGateException("storage_unavailable");if(clock()<state.LastSeen.AddSeconds(-30))throw new KeyGateException("clock_rollback");return state;}catch(KeyGateException){throw;}catch{throw new KeyGateException("storage_unavailable");}
 }
 private async Task Write(State state){try{await storage.Write(state);}catch{throw new KeyGateException("storage_unavailable");}}
 private static byte[] Decode(string value){if(!Regex.IsMatch(value,@"^[A-Za-z0-9_-]+$"))throw new KeyGateException("invalid_token");return Convert.FromBase64String(value.Replace('-','+').Replace('_','/')+new string('=',(4-value.Length%4)%4));}
 private async Task<JsonNode> Request(string path,JsonObject? data=null,string? idempotency=null){
  using var request=new HttpRequestMessage(data is null?HttpMethod.Get:HttpMethod.Post,apiUrl+"/"+path);if(data is not null)request.Content=new StringContent(data.ToJsonString(),Encoding.UTF8,"application/json");if(idempotency is not null)request.Headers.Add("Idempotency-Key",idempotency);
  HttpResponseMessage response;try{response=await http.SendAsync(request,HttpCompletionOption.ResponseHeadersRead);}catch(HttpRequestException){throw new KeyGateException("network_unavailable");}catch(TaskCanceledException){throw new KeyGateException("network_unavailable");}
  using(response){using var stream=await response.Content.ReadAsStreamAsync();using var buffer=new MemoryStream();var chunk=new byte[4096];int size;while((size=await stream.ReadAsync(chunk))>0){buffer.Write(chunk,0,size);if(buffer.Length>32768)throw new KeyGateException("invalid_response");}var result=JsonNode.Parse(buffer.ToArray())??throw new KeyGateException("invalid_response");if(!response.IsSuccessStatusCode){var state=await Read();await Write(state with{Token=null,LastSeen=Later(state.LastSeen,clock())});throw new KeyGateException(result["code"]?.GetValue<string>()??"access_rejected");}return result;}
 }
 public async Task<Access> VerifyToken(string token){
  try{
   var parts=token.Split('.');if(token.Length>16000||parts.Length!=3)throw new KeyGateException("invalid_token");var header=JsonNode.Parse(Decode(parts[0]))!;var kid=header["kid"]!.GetValue<string>();if(header["alg"]!.GetValue<string>()!="EdDSA"||header["typ"]!.GetValue<string>()!="JWT")throw new KeyGateException("invalid_token");
   if(!keys.ContainsKey(kid)){var result=await Request("public-key");var list=result["keys"]!.AsArray();if(list.Count>10)throw new KeyGateException("invalid_token");foreach(var key in list){keys[key!["kid"]!.GetValue<string>()]=key.DeepClone();}}
   if(!keys.TryGetValue(kid,out var jwk)||jwk["kty"]!.GetValue<string>()!="OKP"||jwk["crv"]!.GetValue<string>()!="Ed25519")throw new KeyGateException("invalid_token");var algorithm=SignatureAlgorithm.Ed25519;var publicKey=PublicKey.Import(algorithm,Decode(jwk["x"]!.GetValue<string>()),KeyBlobFormat.RawPublicKey);if(!algorithm.Verify(publicKey,Encoding.UTF8.GetBytes(parts[0]+"."+parts[1]),Decode(parts[2])))throw new KeyGateException("invalid_token");
   var claims=JsonNode.Parse(Decode(parts[1]))!;var state=await Read();var fingerprint=Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(state.DeviceId))).TrimEnd('=').Replace('+','-').Replace('/','_')[..22];var now=clock().ToUnixTimeSeconds();
   if(claims["v"]!.GetValue<string>()!="keygate.v1"||claims["iss"]!.GetValue<string>()!=issuer||claims["aud"]!.GetValue<string>()!=appId||claims["env"]!.GetValue<string>()!=environment||claims["kid"]!.GetValue<string>()!=kid||claims["dev"]!.GetValue<string>()!=fingerprint||claims["rev"]!.GetValue<int>()<1||claims["iat"]!.GetValue<long>()>now+30||claims["exp"]!.GetValue<long>()!=claims["offline_until"]!.GetValue<long>()||claims["exp"]!.GetValue<long>()<claims["iat"]!.GetValue<long>())throw new KeyGateException("invalid_token");if(claims["exp"]!.GetValue<long>()<=now)throw new KeyGateException("expired");var plan=claims["plan"]!.GetValue<string>();if(!Regex.IsMatch(plan,@"^[a-z][a-z0-9_-]{0,63}$"))throw new KeyGateException("invalid_token");var features=new List<Feature>();var items=claims["features"]!.AsArray();if(items.Count>100)throw new KeyGateException("invalid_token");foreach(var feature in items){var name=feature!["key"]!.GetValue<string>();if(!Regex.IsMatch(name,@"^[a-z][a-z0-9_-]{0,63}$"))throw new KeyGateException("invalid_token");var expiry=feature["expiresAt"] is null?(DateTimeOffset?)null:DateTimeOffset.Parse(feature["expiresAt"]!.GetValue<string>());if(expiry is null||expiry>clock())features.Add(new Feature(name,expiry));}return new Access(claims["sub"]!.GetValue<string>(),appId,environment,plan,features,claims["rev"]!.GetValue<int>());
  }catch(KeyGateException){throw;}catch{throw new KeyGateException("invalid_token");}
 }
 private async Task<JsonNode> Post(string path,JsonObject fields,string? idempotency=null){var state=await Read();fields["app_id"]=appId;fields["environment"]=environment;fields["device_id"]=state.DeviceId;return await Request(path,fields,idempotency);}
 private async Task<Access> Save(JsonNode result,string? activation=null){var token=result["token"]?.GetValue<string>()??throw new KeyGateException("invalid_response");var access=await VerifyToken(token);var state=await Read();await Write(state with{Token=token,ActivationKey=activation??result["activationKey"]?.GetValue<string>()??state.ActivationKey,LastSeen=Later(state.LastSeen,clock())});return access;}
 public async Task<Access> Redeem(string code){var state=await Read();var fields=new JsonObject{["code"]=code};if(state.ActivationKey is not null)fields["activation_key"]=state.ActivationKey;return await Save(await Post("redeem",fields,Guid.NewGuid().ToString()));}
 public async Task<Access> Activate(string key)=>await Save(await Post("activate",new JsonObject{["activation_key"]=key}),key);
 public async Task<Access> ValidateOnline(){var state=await Read();if(state.Token is null)throw new KeyGateException("locked");return await Save(await Post("validate",new JsonObject{["token"]=state.Token}));}
 public async Task<Access> Validate(){try{return await ValidateOnline();}catch(KeyGateException e)when(e.Code=="network_unavailable"){return await GetAccess();}}
 public async Task<Access> GetAccess(){var state=await Read();if(state.Token is null)throw new KeyGateException("locked");var access=await VerifyToken(state.Token);await Write(state with{LastSeen=Later(state.LastSeen,clock())});return access;}
 public async Task<bool> Can(string feature){try{return (await GetAccess()).Features.Any(f=>f.Key==feature);}catch{return false;}}
 public async Task Deactivate(){var state=await Read();if(state.Token is not null)await Post("deactivate",new JsonObject{["token"]=state.Token});await Write(state with{Token=null,LastSeen=Later(state.LastSeen,clock())});}
}
