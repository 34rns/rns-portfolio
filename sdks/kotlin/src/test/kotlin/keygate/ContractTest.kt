package keygate
import org.json.JSONObject
import java.io.File
fun main(){
 val f=JSONObject(File("sdks/fixtures/contract.json").readText());var now=f.getLong("now");var online=true
 val client=KeyGateClient(f.getString("appId"),"sandbox",f.getString("apiUrl"),MemoryStorage(),f.getString("deviceId"),{now},{url,_,_->if(!online)throw KeyGateError("network_unavailable");200 to if(url.endsWith("public-key"))f.getJSONObject("jwks") else f.getJSONObject("response")})
 client.redeem("SYNTHETIC-CODE");check(client.can("export"))
 try{client.verifyToken(f.getString("wrongEnvironment"));error("wrong environment accepted")}catch(e:KeyGateError){check(e.code=="invalid_token")}
 online=false;now+=7200000;check(!client.can("export"));check(client.validate().getString("planKey")=="pro")
 try{client.validateOnline();error("backend accepted offline")}catch(e:KeyGateError){check(e.code=="network_unavailable")}
 now=f.getLong("now")-60000;try{client.getAccess();error("clock rollback accepted")}catch(e:KeyGateError){check(e.code=="clock_rollback")}
 now=f.getLong("now")+72*3600000;check(!client.can("export"));println("Kotlin signed contract passed")
}
