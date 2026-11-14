from fastapi import Header, HTTPException
from .client import KeyGateClient, MemoryStorage, KeyGateError
import time

def require_license(app_id,environment,api_url,feature_key=None,*,transport=None,clock=time.time):
    def gate(authorization:str|None=Header(default=None),x_keygate_device:str|None=Header(default=None)):
        if not authorization or not authorization.startswith('Bearer ') or not x_keygate_device: raise HTTPException(403,'license_required')
        try:
            options={'clock':clock}
            if transport: options['transport']=transport
            client=KeyGateClient(app_id,environment,api_url,MemoryStorage({'deviceId':x_keygate_device,'token':authorization[7:],'activationKey':None,'lastSeenAt':0}),**options)
            access=client.validate_online()
            if feature_key and not any(f['key']==feature_key for f in access['features']): raise KeyGateError('feature_required')
            return access
        except (KeyGateError,ValueError): raise HTTPException(403,'license_required') from None
    return gate
