package keygate
import java.net.HttpURLConnection
import java.net.URI
import java.security.MessageDigest
import java.time.Instant
import java.util.Base64
import java.util.UUID
import org.json.JSONObject
import org.json.JSONArray
import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters
import org.bouncycastle.crypto.signers.Ed25519Signer

class KeyGateError(val code:String):Exception(code)
data class State(val deviceId:String,val token:String?=null,val activationKey:String?=null,val lastSeenAt:Long=0)
interface Storage{fun read():State?;fun write(state:State)}
class MemoryStorage:Storage{private var state:State?=null;override fun read()=state;override fun write(state:State){this.state=state}}
class VaultStorage(val readText:()->String?,val writeText:(String)->Unit):Storage{
 override fun read():State?=readText()?.let{val o=JSONObject(it);State(o.getString("deviceId"),if(o.isNull("token"))null else o.getString("token"),if(o.isNull("activationKey"))null else o.getString("activationKey"),o.getLong("lastSeenAt"))}
 override fun write(state:State){writeText(JSONObject().put("deviceId",state.deviceId).put("token",state.token?:JSONObject.NULL).put("activationKey",state.activationKey?:JSONObject.NULL).put("lastSeenAt",state.lastSeenAt).toString())}
}
typealias Transport=(String,JSONObject?,Map<String,String>)->Pair<Int,JSONObject>
class KeyGateClient(val appId:String,val environment:String,apiUrl:String,val storage:Storage,val initialDevice:String=UUID.randomUUID().toString(),val clock:()->Long=System::currentTimeMillis,val transport:Transport=::http){
 private val apiUrl=apiUrl.trimEnd('/');private val issuer=this.apiUrl.replace(Regex("/(?:api/)?v1$"),"");private val keys=mutableMapOf<String,JSONObject>()
 init{if(!Regex("^[a-f0-9-]{36}$",RegexOption.IGNORE_CASE).matches(appId)||environment !in listOf("sandbox","live")||URI(apiUrl).scheme !in listOf("http","https"))throw KeyGateError("invalid_configuration")}
 private fun state():State{try{val s=storage.read()?:State(initialDevice,lastSeenAt=clock()).also(storage::write);if(s.deviceId.length !in 8..256)throw KeyGateError("storage_unavailable");if(clock()<s.lastSeenAt-30000)throw KeyGateError("clock_rollback");return s}catch(e:KeyGateError){throw e}catch(_:Exception){throw KeyGateError("storage_unavailable")}}
 private fun write(s:State){try{storage.write(s)}catch(_:Exception){throw KeyGateError("storage_unavailable")}}
 private fun request(path:String,body:JSONObject?,headers:Map<String,String> = emptyMap()):JSONObject{val(status,result)=transport("$apiUrl/$path",body,headers);if(status !in 200..299){val s=state();write(s.copy(token=null,lastSeenAt=maxOf(clock(),s.lastSeenAt)));throw KeyGateError(result.optString("code","access_rejected"))};return result}
 private fun decode(s:String):ByteArray{if(!Regex("^[A-Za-z0-9_-]+$").matches(s))throw KeyGateError("invalid_token");return Base64.getUrlDecoder().decode(s)}
 @Synchronized fun verifyToken(token:String):JSONObject{
  try{val parts=token.split('.');if(parts.size!=3||token.length>16000)throw KeyGateError("invalid_token");val h=JSONObject(String(decode(parts[0]),Charsets.UTF_8));if(h.getString("alg")!="EdDSA"||h.getString("typ")!="JWT")throw KeyGateError("invalid_token");val kid=h.getString("kid");if(!keys.containsKey(kid)){val list=request("public-key",null).getJSONArray("keys");if(list.length()>10)throw KeyGateError("invalid_token");for(i in 0 until list.length()){val k=list.getJSONObject(i);keys[k.getString("kid")]=k}}
   val key=keys[kid]?:throw KeyGateError("invalid_token");if(key.getString("kty")!="OKP"||key.getString("crv")!="Ed25519")throw KeyGateError("invalid_token");val verifier=Ed25519Signer();verifier.init(false,Ed25519PublicKeyParameters(decode(key.getString("x")),0));val message="${parts[0]}.${parts[1]}".toByteArray();verifier.update(message,0,message.size);if(!verifier.verifySignature(decode(parts[2])))throw KeyGateError("invalid_token");
   val c=JSONObject(String(decode(parts[1]),Charsets.UTF_8));val s=state();val fingerprint=Base64.getUrlEncoder().withoutPadding().encodeToString(MessageDigest.getInstance("SHA-256").digest(s.deviceId.toByteArray())).take(22);val now=clock()/1000.0
   if(c.getString("v")!="keygate.v1"||c.getString("iss")!=issuer||c.getString("aud")!=appId||c.getString("env")!=environment||c.getString("kid")!=kid||c.getString("dev")!=fingerprint||c.getInt("rev")<1||c.getLong("iat")>now+30||c.getLong("exp")!=c.getLong("offline_until")||c.getLong("exp")<c.getLong("iat")||!Regex("^[a-z][a-z0-9_-]{0,63}$").matches(c.getString("plan")))throw KeyGateError("invalid_token");if(c.getLong("exp")<=now)throw KeyGateError("expired");c.getString("sub");val features=c.getJSONArray("features");if(features.length()>100)throw KeyGateError("invalid_token");for(i in 0 until features.length()){val f=features.getJSONObject(i);if(!Regex("^[a-z][a-z0-9_-]{0,63}$").matches(f.getString("key")))throw KeyGateError("invalid_token");if(!f.isNull("expiresAt"))Instant.parse(f.getString("expiresAt"))};return c
  }catch(e:KeyGateError){throw e}catch(_:Exception){throw KeyGateError("invalid_token")}
 }
 private fun access(c:JSONObject):JSONObject{val features=JSONArray();val list=c.getJSONArray("features");for(i in 0 until list.length()){val f=list.getJSONObject(i);if(f.isNull("expiresAt")||Instant.parse(f.getString("expiresAt")).toEpochMilli()>clock())features.put(f)};return JSONObject().put("licenseId",c.getString("sub")).put("appId",appId).put("environment",environment).put("status","active").put("planKey",c.getString("plan")).put("features",features).put("revision",c.getInt("rev"))}
 private fun post(path:String,body:JSONObject,requestId:String?=null):JSONObject{body.put("app_id",appId).put("environment",environment).put("device_id",state().deviceId);return request(path,body,mapOf("content-type" to "application/json")+if(requestId!=null)mapOf("idempotency-key" to requestId)else emptyMap())}
 private fun save(result:JSONObject,activation:String?=null):JSONObject{val token=result.getString("token");val claims=verifyToken(token);val s=state();write(s.copy(token=token,activationKey=activation?:if(!result.isNull("activationKey"))result.getString("activationKey")else s.activationKey,lastSeenAt=maxOf(clock(),s.lastSeenAt)));return access(claims)}
 @Synchronized fun redeem(code:String):JSONObject{val body=JSONObject().put("code",code);state().activationKey?.let{body.put("activation_key",it)};return save(post("redeem",body,UUID.randomUUID().toString()))}
 @Synchronized fun activate(key:String)=save(post("activate",JSONObject().put("activation_key",key)),key)
 @Synchronized fun validateOnline():JSONObject{val token=state().token?:throw KeyGateError("locked");return save(post("validate",JSONObject().put("token",token)))}
 @Synchronized fun validate():JSONObject{try{return validateOnline()}catch(e:KeyGateError){if(e.code!="network_unavailable")throw e;return getAccess()}}
 @Synchronized fun getAccess():JSONObject{val s=state();val token=s.token?:throw KeyGateError("locked");val result=access(verifyToken(token));write(s.copy(lastSeenAt=maxOf(clock(),s.lastSeenAt)));return result}
 @Synchronized fun can(feature:String):Boolean{try{val list=getAccess().getJSONArray("features");return(0 until list.length()).any{list.getJSONObject(it).getString("key")==feature}}catch(_:Exception){return false}}
 @Synchronized fun deactivate(){val s=state();s.token?.let{post("deactivate",JSONObject().put("token",it))};write(s.copy(token=null,lastSeenAt=maxOf(clock(),s.lastSeenAt)))}
 companion object{private fun http(url:String,body:JSONObject?,headers:Map<String,String>):Pair<Int,JSONObject>{val connection=URI(url).toURL().openConnection() as HttpURLConnection;connection.connectTimeout=5000;connection.readTimeout=10000;connection.instanceFollowRedirects=false;headers.forEach(connection::setRequestProperty);try{if(body!=null){connection.requestMethod="POST";connection.doOutput=true;connection.outputStream.use{it.write(body.toString().toByteArray())}};val status=connection.responseCode;val stream=if(status in 200..299)connection.inputStream else connection.errorStream;val bytes=java.io.ByteArrayOutputStream();stream.use{val buffer=ByteArray(4096);while(true){val size=it.read(buffer);if(size<0)break;bytes.write(buffer,0,size);if(bytes.size()>32768)throw KeyGateError("invalid_response")}};return status to JSONObject(bytes.toString("UTF-8"))}catch(e:KeyGateError){throw e}catch(_:java.io.IOException){throw KeyGateError("network_unavailable")}finally{connection.disconnect()}}}
}
