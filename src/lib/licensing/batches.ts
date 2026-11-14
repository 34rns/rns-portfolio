import { generateCodesSchema, LicenseDomainError, type AppScope, type GenerateCodesInput, type Principal } from "./contracts";
import type { AppStore } from "./transaction-store";
import { assertCapability } from "../auth/permissions";
import { lookupHash } from "../security/secrets";
import { audit } from "./apps";
import { issueCodes } from "./access";
type Batch={id:string;input:GenerateCodesInput;count:number;created_count:number;status:string;request_hash:string};
export async function startCodeBatch(store:AppStore,principal:Principal,scope:AppScope,input:unknown,key:string):Promise<Batch>{
  assertCapability(principal,"codes.generate",scope);const parsed=generateCodesSchema.parse(input);
  if(!key||key.length>128)throw new LicenseDomainError("idempotency_required");
  if(principal.role==="helper" && parsed.count>100)throw new LicenseDomainError("helper_batch_limit",403);
  const requestHash=lookupHash(JSON.stringify(parsed)),hash=lookupHash(`batch:${scope.appId}:${scope.environment}:${key}`);
  return store.transaction(async tx=>{
    await tx.query("INSERT INTO redeem_batches(app_id,environment,input,count,idempotency_hash,request_hash) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(app_id,environment,idempotency_hash) DO NOTHING",[scope.appId,scope.environment,JSON.stringify(parsed),parsed.count,hash,requestHash]);
    const [batch]=await tx.query<Batch>("SELECT * FROM redeem_batches WHERE app_id=$1 AND environment=$2 AND idempotency_hash=$3",[scope.appId,scope.environment,hash]);
    if(batch.request_hash!==requestHash)throw new LicenseDomainError("idempotency_conflict",409);return batch;
  });
}
export async function processCodeBatch(store:AppStore,principal:Principal,scope:AppScope,id:string):Promise<{created:number;complete:boolean}>{
  assertCapability(principal,"codes.generate",scope);
  return store.transaction(async tx=>{
    const [batch]=await tx.query<Batch>("SELECT * FROM redeem_batches WHERE id=$1 AND app_id=$2 AND environment=$3 FOR UPDATE",[id,scope.appId,scope.environment]);
    if(!batch)throw new LicenseDomainError("not_found",404);
    if(batch.status==="cancelled"||batch.status==="complete")return {created:0,complete:batch.status==="complete"};
    const count=Math.min(100,batch.count-batch.created_count);
    // Reuse the same transaction, including code and audit inserts; a crash rolls the chunk back.
    const codes=await issueCodes({read:fn=>fn(tx),transaction:fn=>fn(tx)},principal,scope,{...batch.input,count});
    await tx.query("UPDATE redeem_codes SET batch_id=$1 WHERE id=ANY($2::uuid[])",[id,codes.map(c=>c.id)]);
    const complete=batch.created_count+count===batch.count;
    await tx.query("UPDATE redeem_batches SET created_count=created_count+$2,status=$3 WHERE id=$1",[id,count,complete?"complete":"pending"]);
    return {created:count,complete};
  });
}
export async function cancelCodeBatch(store:AppStore,principal:Principal,scope:AppScope,id:string){
  assertCapability(principal,"codes.generate",scope);await store.transaction(async tx=>{await tx.query("UPDATE redeem_batches SET status='cancelled' WHERE id=$1 AND app_id=$2 AND environment=$3 AND status='pending'",[id,scope.appId,scope.environment]);await audit(tx,principal,"batch.cancelled",scope.appId,id,{},scope.environment);});
}
