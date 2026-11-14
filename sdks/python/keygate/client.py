"""Small synchronous KeyGate client. Valuable server operations use validate_online."""
import base64
import hashlib
import json
import math
import os
from pathlib import Path
import re
import time
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from uuid import uuid4, UUID
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

class KeyGateError(Exception):
    def __init__(self, code, request_id=None):
        self.code, self.request_id = code, request_id
        super().__init__(code)

class MemoryStorage:
    def __init__(self, value=None): self.value=value
    def read(self): return dict(self.value) if self.value else None
    def write(self, value): self.value=dict(value)

class FileStorage:
    """POSIX mode 0600. On Windows supply an OS-vault storage adapter for sensitive apps."""
    def __init__(self, path): self.path=Path(path)
    def read(self):
        if not self.path.exists(): return None
        return json.loads(self.path.read_text(encoding='utf-8'))
    def write(self, value):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary=self.path.with_name(self.path.name+'.'+uuid4().hex+'.tmp')
        try:
            fd=os.open(temporary,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
            with os.fdopen(fd,'w',encoding='utf-8') as f: json.dump(value,f)
            os.replace(temporary,self.path)
        finally:
            if temporary.exists(): temporary.unlink()

def _decode(value):
    if not isinstance(value,str) or not re.fullmatch(r'[A-Za-z0-9_-]+',value): raise ValueError()
    return base64.urlsafe_b64decode(value+'='*((-len(value))%4))

def _http(url,body,headers):
    request=Request(url,data=json.dumps(body).encode() if body is not None else None,headers=headers,method='POST' if body is not None else 'GET')
    try:
        with urlopen(request,timeout=10) as response:
            raw=response.read(32769)
            if len(raw)>32768: raise KeyGateError('invalid_response')
            return response.status,json.loads(raw)
    except HTTPError as error:
        return error.code,json.loads(error.read(32768))
    except (URLError,TimeoutError,OSError) as error:
        raise KeyGateError('network_unavailable') from error

def _date(value): return datetime.fromisoformat(value.replace('Z','+00:00')).timestamp()

class KeyGateClient:
    def __init__(self,app_id,environment,api_url,storage,device_id=None,*,clock=time.time,transport=_http,issuer=None):
        from urllib.parse import urlparse
        UUID(app_id)
        if environment not in ('sandbox','live') or urlparse(api_url).scheme not in ('http','https'): raise KeyGateError('invalid_configuration')
        self.app_id,self.environment,self.api_url=app_id,environment,api_url.rstrip('/')
        self.issuer=issuer or re.sub(r'/(?:api/)?v1$','',self.api_url)
        self.storage,self.clock,self.transport,self.keys=storage,clock,transport,{}
        try:
            state=storage.read()
            if state is None: storage.write({'deviceId':device_id or str(uuid4()),'token':None,'activationKey':None,'lastSeenAt':clock()})
            self._state()
        except Exception as error: raise KeyGateError('storage_unavailable') from error

    def _state(self):
        try:
            state=self.storage.read()
            if not state or not isinstance(state['deviceId'],str) or not 8<=len(state['deviceId'])<=256 or not math.isfinite(state['lastSeenAt']): raise ValueError()
            if self.clock()<state['lastSeenAt']-30: raise KeyGateError('clock_rollback')
            return state
        except KeyGateError: raise
        except Exception as error: raise KeyGateError('storage_unavailable') from error

    def _write(self,state):
        try: self.storage.write(state)
        except Exception as error: raise KeyGateError('storage_unavailable') from error

    def verify_token(self,token):
        try:
            if not isinstance(token,str) or len(token)>16000: raise ValueError()
            head,payload,signature=token.split('.')
            header=json.loads(_decode(head))
            if header.get('alg')!='EdDSA' or header.get('typ')!='JWT' or not isinstance(header.get('kid'),str): raise ValueError()
            if header['kid'] not in self.keys:
                status,result=self.transport(self.api_url+'/public-key',None,{})
                if status!=200 or not isinstance(result.get('keys'),list) or len(result['keys'])>10: raise ValueError()
                self.keys={key['kid']:key for key in result['keys']}
            key=self.keys[header['kid']]
            if key.get('kty')!='OKP' or key.get('crv')!='Ed25519': raise ValueError()
            Ed25519PublicKey.from_public_bytes(_decode(key['x'])).verify(_decode(signature),(head+'.'+payload).encode())
            claims=json.loads(_decode(payload));state=self._state();now=self.clock()
            dev=base64.urlsafe_b64encode(hashlib.sha256(state['deviceId'].encode()).digest()).decode().rstrip('=')[:22]
            if (claims.get('v'),claims.get('iss'),claims.get('aud'),claims.get('env'),claims.get('kid'),claims.get('dev'))!=('keygate.v1',self.issuer,self.app_id,self.environment,header['kid'],dev): raise ValueError()
            for field in ['iat','exp','offline_until','refresh_after']:
                if not isinstance(claims.get(field),(int,float)) or isinstance(claims[field],bool) or not math.isfinite(claims[field]): raise ValueError()
            if claims['exp']!=claims['offline_until'] or claims['exp']<claims['iat'] or claims['iat']>now+30 or not isinstance(claims.get('rev'),int) or claims['rev']<1 or not isinstance(claims.get('sub'),str) or not re.fullmatch('[a-z][a-z0-9_-]{0,63}',claims.get('plan','')): raise ValueError()
            if not isinstance(claims.get('features'),list) or len(claims['features'])>100: raise ValueError()
            for feature in claims['features']:
                if not re.fullmatch('[a-z][a-z0-9_-]{0,63}',feature.get('key','')): raise ValueError()
                if feature.get('expiresAt') is not None: _date(feature['expiresAt'])
            if claims['exp']<=now: raise KeyGateError('expired')
            return claims
        except KeyGateError: raise
        except Exception as error: raise KeyGateError('invalid_token') from error

    def _access(self,claims):
        return {'licenseId':claims['sub'],'appId':self.app_id,'environment':self.environment,'status':'active','planKey':claims['plan'],'features':[f for f in claims['features'] if f['expiresAt'] is None or _date(f['expiresAt'])>self.clock()],'expiresAt':claims.get('le'),'revision':claims['rev'],'deviceId':self._state()['deviceId']}

    def _post(self,path,fields,idempotency=None):
        state=self._state();headers={'content-type':'application/json'}
        if idempotency: headers['idempotency-key']=idempotency
        try: status,result=self.transport(self.api_url+'/'+path,{'app_id':self.app_id,'environment':self.environment,'device_id':state['deviceId'],**fields},headers)
        except OSError as error: raise KeyGateError('network_unavailable') from error
        if not isinstance(result,dict): raise KeyGateError('invalid_response')
        if status<200 or status>=300:
            self._write({**state,'token':None,'lastSeenAt':max(state['lastSeenAt'],self.clock())})
            raise KeyGateError(result.get('code','access_rejected'),result.get('requestId'))
        return result

    def _save(self,result,activation=None):
        claims=self.verify_token(result.get('token'));state=self._state()
        self._write({**state,'token':result['token'],'activationKey':activation or result.get('activationKey') or state.get('activationKey'),'lastSeenAt':max(state['lastSeenAt'],self.clock())})
        return self._access(claims)

    def redeem(self,code):
        state=self._state();fields={'code':code}
        if state.get('activationKey'): fields['activation_key']=state['activationKey']
        return self._save(self._post('redeem',fields,str(uuid4())))
    def activate(self,key): return self._save(self._post('activate',{'activation_key':key}),key)
    def validate_online(self):
        state=self._state()
        if not state.get('token'): raise KeyGateError('locked')
        return self._save(self._post('validate',{'token':state['token']}))
    def validate(self):
        try: return self.validate_online()
        except KeyGateError as error:
            if error.code!='network_unavailable': raise
            return self.get_access()
    def get_access(self):
        state=self._state()
        if not state.get('token'): raise KeyGateError('locked')
        access=self._access(self.verify_token(state['token']));self._write({**state,'lastSeenAt':max(state['lastSeenAt'],self.clock())});return access
    def can(self,feature):
        try: return any(f['key']==feature for f in self.get_access()['features'])
        except KeyGateError: return False
    def deactivate(self):
        state=self._state()
        if state.get('token'): self._post('deactivate',{'token':state['token']})
        self._write({**state,'token':None,'lastSeenAt':max(state['lastSeenAt'],self.clock())})
