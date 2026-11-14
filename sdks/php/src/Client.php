<?php
declare(strict_types=1);
namespace Rns\KeyGate;
use RuntimeException;use Throwable;use Closure;

interface Storage{public function read():?array;public function write(array $value):void;}
final class MemoryStorage implements Storage{
 public ?array $value=null;
 public function read():?array{return $this->value;}
 public function write(array $value):void{$this->value=$value;}
}
final class Client{
 public Closure $clock;private Closure $transport;private array $keys=[];
 private string $issuer;
 public function __construct(private string $appId,private string $environment,private string $apiUrl,private Storage $storage,?string $deviceId=null,?callable $clock=null,?callable $transport=null){
  if(!preg_match('/^[a-f0-9-]{36}$/i',$appId)||!in_array($environment,['sandbox','live'],true)||!in_array(parse_url($apiUrl,PHP_URL_SCHEME),['http','https'],true)||!function_exists('sodium_crypto_sign_verify_detached'))throw new RuntimeException('invalid_configuration');
  $this->apiUrl=rtrim($apiUrl,'/');$this->issuer=preg_replace('~/(?:api/)?v1$~','',$this->apiUrl);$this->clock=Closure::fromCallable($clock??fn()=>microtime(true));$this->transport=Closure::fromCallable($transport??self::http(...));
  try{if($storage->read()===null)$storage->write(['deviceId'=>$deviceId??bin2hex(random_bytes(16)),'token'=>null,'activationKey'=>null,'lastSeenAt'=>($this->clock)()]);$this->state();}catch(Throwable $e){throw new RuntimeException('storage_unavailable',0,$e);}
 }
 private function state():array{
  try{$s=$this->storage->read();if(!$s||!is_string($s['deviceId']??null)||strlen($s['deviceId'])<8||strlen($s['deviceId'])>256||!is_numeric($s['lastSeenAt']??null))throw new RuntimeException('storage_unavailable');if(($this->clock)()<$s['lastSeenAt']-30)throw new RuntimeException('clock_rollback');return $s;}catch(RuntimeException $e){throw $e;}catch(Throwable $e){throw new RuntimeException('storage_unavailable',0,$e);}
 }
 private function write(array $state):void{try{$this->storage->write($state);}catch(Throwable $e){throw new RuntimeException('storage_unavailable',0,$e);}}
 private static function decode(string $value):string{if(!preg_match('/^[A-Za-z0-9_-]+$/D',$value))throw new RuntimeException('invalid_token');$decoded=base64_decode(strtr($value,'-_','+/').str_repeat('=',(4-strlen($value)%4)%4),true);if($decoded===false)throw new RuntimeException('invalid_token');return $decoded;}
 private static function http(string $url,?array $body,array $headers):array{
  if(!function_exists('curl_init'))throw new RuntimeException('curl_required');$curl=curl_init($url);$list=[];foreach($headers as $k=>$v)$list[]=$k.': '.$v;
  curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>5,CURLOPT_TIMEOUT=>10,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_HTTPHEADER=>$list,CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS|CURLPROTO_HTTP]);if($body!==null)curl_setopt_array($curl,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>json_encode($body,JSON_THROW_ON_ERROR)]);
  $raw=curl_exec($curl);$status=curl_getinfo($curl,CURLINFO_RESPONSE_CODE);if($raw===false)throw new RuntimeException('network_unavailable');if(strlen($raw)>32768)throw new RuntimeException('invalid_response');return [$status,json_decode($raw,true,512,JSON_THROW_ON_ERROR)];
 }
 public function verifyToken(string $token):array{
  try{
   if(strlen($token)>16000)throw new RuntimeException('invalid_token');$parts=explode('.',$token);if(count($parts)!==3)throw new RuntimeException('invalid_token');[$head,$payload,$signature]=$parts;$h=json_decode(self::decode($head),true,512,JSON_THROW_ON_ERROR);if(($h['alg']??null)!=='EdDSA'||($h['typ']??null)!=='JWT'||!is_string($h['kid']??null))throw new RuntimeException('invalid_token');
   if(!isset($this->keys[$h['kid']])){[$status,$result]=($this->transport)($this->apiUrl.'/public-key',null,[]);if($status!==200||!is_array($result['keys']??null)||count($result['keys'])>10)throw new RuntimeException('invalid_token');foreach($result['keys'] as $key)$this->keys[$key['kid']]=$key;}
   $key=$this->keys[$h['kid']]??null;if(!$key||$key['kty']!=='OKP'||$key['crv']!=='Ed25519'||!sodium_crypto_sign_verify_detached(self::decode($signature),$head.'.'.$payload,self::decode($key['x'])))throw new RuntimeException('invalid_token');
   $c=json_decode(self::decode($payload),true,512,JSON_THROW_ON_ERROR);$state=$this->state();$now=($this->clock)();$dev=substr(rtrim(strtr(base64_encode(hash('sha256',$state['deviceId'],true)),'+/','-_'),'='),0,22);
   if(($c['v']??null)!=='keygate.v1'||($c['iss']??null)!==$this->issuer||($c['aud']??null)!==$this->appId||($c['env']??null)!==$this->environment||($c['kid']??null)!==$h['kid']||($c['dev']??null)!==$dev||!is_string($c['sub']??null)||!is_int($c['rev']??null)||$c['rev']<1||!preg_match('/^[a-z][a-z0-9_-]{0,63}$/D',$c['plan']??''))throw new RuntimeException('invalid_token');
   foreach(['iat','exp','offline_until','refresh_after'] as $field)if(!is_int($c[$field]??null)&&!is_float($c[$field]??null)||!is_finite((float)$c[$field]))throw new RuntimeException('invalid_token');if($c['exp']!==$c['offline_until']||$c['exp']<$c['iat']||$c['iat']>$now+30||!is_array($c['features']??null)||count($c['features'])>100)throw new RuntimeException('invalid_token');
   foreach($c['features'] as $f)if(!preg_match('/^[a-z][a-z0-9_-]{0,63}$/D',$f['key']??'')||($f['expiresAt']!==null&&strtotime($f['expiresAt'])===false))throw new RuntimeException('invalid_token');if($c['exp']<=$now)throw new RuntimeException('expired');return $c;
  }catch(RuntimeException $e){throw $e;}catch(Throwable $e){throw new RuntimeException('invalid_token',0,$e);}
 }
 private function access(array $c):array{return ['licenseId'=>$c['sub'],'appId'=>$this->appId,'environment'=>$this->environment,'status'=>'active','planKey'=>$c['plan'],'features'=>array_values(array_filter($c['features'],fn($f)=>$f['expiresAt']===null||strtotime($f['expiresAt'])>($this->clock)())),'revision'=>$c['rev'],'expiresAt'=>$c['le']??null];}
 private function post(string $path,array $fields,?string $idempotency=null):array{
  $state=$this->state();$headers=['content-type'=>'application/json'];if($idempotency)$headers['idempotency-key']=$idempotency;[$status,$result]=($this->transport)($this->apiUrl.'/'.$path,array_merge(['app_id'=>$this->appId,'environment'=>$this->environment,'device_id'=>$state['deviceId']],$fields),$headers);
  if($status<200||$status>=300){$this->write(array_merge($state,['token'=>null,'lastSeenAt'=>max($state['lastSeenAt'],($this->clock)())]));throw new RuntimeException($result['code']??'access_rejected');}return $result;
 }
 private function save(array $result,?string $activation=null):array{if(!is_string($result['token']??null))throw new RuntimeException('invalid_response');$claims=$this->verifyToken($result['token']);$state=$this->state();$this->write(array_merge($state,['token'=>$result['token'],'activationKey'=>$activation??$result['activationKey']??$state['activationKey'],'lastSeenAt'=>max($state['lastSeenAt'],($this->clock)())]));return $this->access($claims);}
 public function redeem(string $code):array{$s=$this->state();$fields=['code'=>$code];if($s['activationKey'])$fields['activation_key']=$s['activationKey'];return $this->save($this->post('redeem',$fields,bin2hex(random_bytes(16))));}
 public function activate(string $key):array{return $this->save($this->post('activate',['activation_key'=>$key]),$key);}
 public function validateOnline():array{$s=$this->state();if(!$s['token'])throw new RuntimeException('locked');return $this->save($this->post('validate',['token'=>$s['token']]));}
 public function validate():array{try{return $this->validateOnline();}catch(RuntimeException $e){if($e->getMessage()!=='network_unavailable')throw $e;return $this->getAccess();}}
 public function getAccess():array{$s=$this->state();if(!$s['token'])throw new RuntimeException('locked');$access=$this->access($this->verifyToken($s['token']));$this->write(array_merge($s,['lastSeenAt'=>max($s['lastSeenAt'],($this->clock)())]));return $access;}
 public function can(string $feature):bool{try{foreach($this->getAccess()['features'] as $f)if($f['key']===$feature)return true;return false;}catch(Throwable){return false;}}
 public function deactivate():void{$s=$this->state();if($s['token'])$this->post('deactivate',['token'=>$s['token']]);$this->write(array_merge($s,['token'=>null,'lastSeenAt'=>max($s['lastSeenAt'],($this->clock)())]));}
}
