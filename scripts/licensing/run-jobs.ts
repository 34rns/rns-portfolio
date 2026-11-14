export {};
const jobOrigin=process.env.NEXT_PUBLIC_SITE_URL,secret=process.env.LICENSE_JOBS_SECRET;
async function main(){
 if(!jobOrigin||!secret||secret.length<32)throw new Error("Set the verified site origin and a dedicated 32+ character job credential explicitly.");
 const response=await fetch(new URL("/api/internal/license-jobs",jobOrigin),{method:"POST",headers:{authorization:`Bearer ${secret}`},signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw new Error(`Job runner returned HTTP ${response.status}. Verify configuration without sharing credentials.`);
 const result=await response.json();process.stdout.write(JSON.stringify({processed:result.processed,failed:result.failed})+"\n");
}
void main().catch(error=>{process.stderr.write(`${error instanceof Error?error.message:"Job failed"}\n`);process.exitCode=1;});
