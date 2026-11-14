import { getLicenseStore } from "@/lib/licensing/transaction-store";
import { runLicenseJobs } from "@/lib/licensing/webhooks";
import { safeEqual } from "@/lib/security/secrets";
export async function POST(request:Request){const secret=process.env.LICENSE_JOBS_SECRET;if(!secret||secret.length<32||!safeEqual(request.headers.get("authorization")??"",`Bearer ${secret}`))return Response.json({code:"unauthorized"},{status:401,headers:{"cache-control":"no-store"}});try{return Response.json(await runLicenseJobs(getLicenseStore(),new Date(),20),{headers:{"cache-control":"no-store"}});}catch{return Response.json({code:"storage_unavailable"},{status:503,headers:{"cache-control":"no-store"}});}}
