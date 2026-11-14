<?php
require __DIR__.'/../src/Client.php';
use Rns\KeyGate\Client;use Rns\KeyGate\MemoryStorage;
$f=json_decode(file_get_contents(__DIR__.'/../../fixtures/contract.json'),true,512,JSON_THROW_ON_ERROR);$now=$f['now']/1000;$online=true;
$transport=function($url,$body,$headers)use($f,&$online){if(!$online)throw new RuntimeException('network_unavailable');return [200,str_ends_with($url,'public-key')?$f['jwks']:$f['response']];};
$c=new Client($f['appId'],$f['environment'],$f['apiUrl'],new MemoryStorage(),$f['deviceId'],function()use(&$now){return $now;},$transport);
function check($value,$message){if(!$value)throw new RuntimeException($message);}
$c->redeem('SYNTHETIC-CODE');check($c->can('export'),'feature should unlock');
try{$c->verifyToken($f['wrongEnvironment']);throw new LogicException('wrong environment accepted');}catch(RuntimeException $e){check($e->getMessage()==='invalid_token','unexpected scope error');}
$online=false;$now+=7200;check(!$c->can('export'),'expired feature accepted');check($c->validate()['planKey']==='pro','offline base failed');
try{$c->validateOnline();throw new LogicException('backend accepted offline');}catch(RuntimeException $e){check($e->getMessage()==='network_unavailable','unexpected offline error');}
$now=$f['now']/1000-60;try{$c->getAccess();throw new LogicException('rollback accepted');}catch(RuntimeException $e){check($e->getMessage()==='clock_rollback','unexpected clock error');}
$now=$f['now']/1000+72*3600;check(!$c->can('export'),'deadline accepted');echo "PHP signed contract passed\n";
