using System.Text.Json.Nodes;
using System.Net;
using Rns.KeyGate;
var f=JsonNode.Parse(File.ReadAllText("sdks/fixtures/contract.json"))!;
var now=DateTimeOffset.FromUnixTimeMilliseconds(f["now"]!.GetValue<long>());var online=true;
var transport=new FixtureTransport(()=>online,f);
var client=new Client(f["appId"]!.GetValue<string>(),"sandbox",f["apiUrl"]!.GetValue<string>(),new MemoryStorage(),f["deviceId"]!.GetValue<string>(),new HttpClient(transport),()=>now);
await client.Redeem("SYNTHETIC-CODE");if(!await client.Can("export"))throw new Exception("Feature should unlock");
try{await client.VerifyToken(f["wrongEnvironment"]!.GetValue<string>());throw new Exception("Scope accepted");}catch(KeyGateException e)when(e.Code=="invalid_token"){}
online=false;now=now.AddHours(2);if(await client.Can("export"))throw new Exception("Expired feature accepted");await client.Validate();
try{await client.ValidateOnline();throw new Exception("Backend accepted offline");}catch(KeyGateException e)when(e.Code=="network_unavailable"){}
for(var i=0;i<220;i++){now=now.AddSeconds(-20);if(await client.Can("export"))throw new Exception("Stepped rollback restored expired feature");}
now=DateTimeOffset.FromUnixTimeMilliseconds(f["now"]!.GetValue<long>()).AddSeconds(-60);try{await client.GetAccess();throw new Exception("Rollback accepted");}catch(KeyGateException e)when(e.Code=="clock_rollback"){}
now=DateTimeOffset.FromUnixTimeMilliseconds(f["now"]!.GetValue<long>()).AddHours(72);if(await client.Can("export"))throw new Exception("Offline deadline accepted");
Console.WriteLine(".NET signed contract passed");
sealed class FixtureTransport(Func<bool> online,JsonNode fixture):HttpMessageHandler{
 protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken cancellation){if(!online())throw new HttpRequestException("offline");return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK){Content=new StringContent(request.RequestUri!.AbsolutePath.EndsWith("public-key")?fixture["jwks"]!.ToJsonString():fixture["response"]!.ToJsonString())});}
}
