import json
from pathlib import Path
import pytest
from keygate import KeyGateClient, KeyGateError, MemoryStorage
F=json.loads((Path(__file__).parents[2]/"fixtures"/"contract.json").read_text(encoding="utf-8"))

def client():
    clock=[F['now']/1000];online=[True]
    def transport(url,body,headers):
        if not online[0]: raise OSError('offline')
        return (200,F['jwks'] if url.endswith('public-key') else F['response'])
    c=KeyGateClient(F['appId'],F['environment'],F['apiUrl'],MemoryStorage(),F['deviceId'],clock=lambda:clock[0],transport=transport)
    return c,clock,online

def test_signature_scope_feature_and_offline_deadlines():
    c,clock,online=client();c.redeem('SYNTHETIC-CODE');assert c.can('export')
    online[0]=False;clock[0]+=7200;assert not c.can('export');assert c.validate()['planKey']=='pro'
    clock[0]=F['now']/1000+72*3600
    with pytest.raises(KeyGateError,match='expired'): c.validate()
    assert not c.can('export')

def test_wrong_environment_tampering_rollback_and_online_boundary():
    c,clock,online=client();c.redeem('SYNTHETIC-CODE')
    with pytest.raises(KeyGateError,match='invalid_token'): c.verify_token(F['wrongEnvironment'])
    token=F['response']['token'];parts=token.split('.');parts[1]=parts[1][:-1]+('A' if parts[1][-1]!='A' else 'B')
    with pytest.raises(KeyGateError,match='invalid_token'): c.verify_token('.'.join(parts))
    clock[0]-=60
    with pytest.raises(KeyGateError,match='clock_rollback'): c.get_access()
    clock[0]+=60;online[0]=False
    with pytest.raises(KeyGateError,match='network_unavailable'): c.validate_online()

def test_fastapi_gate_requires_live_validation():
    from fastapi import FastAPI, Depends
    from fastapi.testclient import TestClient
    from keygate.fastapi import require_license
    c,clock,online=client();c.redeem('SYNTHETIC-CODE')
    app=FastAPI()
    @app.get('/pro')
    def pro(access=Depends(require_license(F['appId'],F['environment'],F['apiUrl'],'export',transport=c.transport,clock=lambda:clock[0]))):return {'protected':True}
    tc=TestClient(app);assert tc.get('/pro').status_code==403
    headers={'Authorization':'Bearer '+F['response']['token'],'X-KeyGate-Device':F['deviceId']}
    assert tc.get('/pro',headers=headers).status_code==200
    online[0]=False;assert tc.get('/pro',headers=headers).status_code==403
