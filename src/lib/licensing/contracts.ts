import { z } from "zod";
export const environmentSchema = z.enum(["sandbox", "live"]);
export type Environment = z.infer<typeof environmentSchema>;
export type AppScope = { appId: string; environment: Environment };
export const keySchema = z.string().regex(/^[a-z][a-z0-9_-]{0,63}$/);
const isoDate = z.iso.datetime();
const origin = z.string().max(256).refine((value) => {
  try { const url = new URL(value); return ["https:", "http:", "chrome-extension:"].includes(url.protocol) && url.origin === value && !url.username && !url.password; } catch { return false; }
}, "Enter an exact origin, for example https://your-app.com.");
export const planSchema = z.object({ key: keySchema, name: z.string().min(1).max(80), priority: z.number().int().min(0).max(1000).default(0), featureKeys: z.array(keySchema).max(100).default([]) }).strict();
export const featureSchema = z.object({ key: keySchema, name: z.string().min(1).max(80), description: z.string().max(500).default("") }).strict();
export const appInputSchema = z.object({
  name: z.string().trim().min(1).max(100), slug: keySchema,
  linkedProjectId: z.uuid().nullable().default(null),
  bindingMode: z.enum(["device", "account"]).default("device"), maxDevices: z.number().int().min(1).max(100).default(2),
  offlineHours: z.number().int().min(1).max(720).default(72), expiryGraceHours: z.number().int().min(0).max(720).default(0),
  lockBehavior: z.enum(["downgrade", "hard-lock", "read-only", "custom-message"]).default("downgrade"),
  lockMessage: z.string().max(500).default("Your Pro access has ended. Redeem a new code to continue."),
  allowedOrigins: z.array(origin).max(30).default([]),
  branding: z.object({accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#FFC900"), logoUrl: z.union([z.literal(""),z.url().max(2000)]).default(""), title: z.string().max(100).default("Unlock Pro"), successMessage: z.string().max(300).default("Your access is ready."), font: z.enum(["system","archivo","serif"]).default("archivo")}).strict().default({accent:"#FFC900",logoUrl:"",title:"Unlock Pro",successMessage:"Your access is ready.",font:"archivo"}),
  plans: z.array(planSchema).min(1).max(30).default([{key:"free",name:"Free",priority:0,featureKeys:[]},{key:"pro",name:"Pro",priority:10,featureKeys:[]}]),
  features: z.array(featureSchema).max(100).default([]),
}).strict().superRefine((app, ctx) => {
  for (const [field, entries] of [["plans",app.plans],["features",app.features]] as const) if(new Set(entries.map(x=>x.key)).size!==entries.length) ctx.addIssue({code:"custom",path:[field],message:"Keys must be unique in this app."});
  for(const plan of app.plans) if(plan.featureKeys.some(key=>!app.features.some(feature=>feature.key===key))) ctx.addIssue({code:"custom",path:["plans"],message:"Plan refers to an undefined feature."});
  if(app.lockBehavior === "downgrade" && !app.plans.some(plan=>plan.key==="free")) ctx.addIssue({code:"custom",path:["plans"],message:"Downgrade needs a free plan."});
});
export type AppInput = z.infer<typeof appInputSchema>;
export const generateCodesSchema = z.object({
  type:z.enum(["lifetime","timed","trial","bundle"]), planKey:keySchema.default("pro"), featureKeys:z.array(keySchema).max(100).default([]),
  durationSeconds:z.number().int().min(60).max(315360000).optional(), calendarMonths:z.number().int().min(1).max(120).optional(), accessUntil:isoDate.optional(), redeemBy:isoDate.optional(),
  stackable:z.boolean().default(false), maxRedemptions:z.number().int().min(1).max(10000).default(1), maxDevices:z.number().int().min(1).max(100).optional(),
  prefix:z.string().regex(/^[A-Z]{2,16}$/).default("RNS"), count:z.number().int().min(1).max(10000).default(100), campaignId:z.uuid().nullable().default(null), note:z.string().max(1000).default(""),
}).strict().superRefine((input,ctx)=>{
  const durations=[input.durationSeconds,input.calendarMonths,input.accessUntil].filter(x=>x!==undefined);
  if(durations.length>1 || (input.type!=="lifetime" && durations.length!==1) || (input.type==="lifetime" && durations.length)) ctx.addIssue({code:"custom",message:"Choose exactly one duration for timed/trial/bundle access, none for lifetime."});
});
export type GenerateCodesInput = z.infer<typeof generateCodesSchema>;
export type GrantInput = Pick<GenerateCodesInput,"type"|"planKey"|"featureKeys"|"durationSeconds"|"calendarMonths"|"accessUntil"|"stackable">;
export const redeemInputSchema = z.object({app_id:z.uuid(),environment:environmentSchema,code:z.string().min(1).max(128),device_id:z.string().min(8).max(256),user_id:z.string().min(1).max(256).optional(),activation_key:z.string().min(20).max(128).optional(),meta:z.record(z.string().max(32),z.string().max(256)).optional()}).strict();
export const staffRoleSchema=z.enum(["owner","admin","helper","viewer"]);
export type StaffRole=z.infer<typeof staffRoleSchema>;
export type Principal={kind:"staff"|"api";id:string;role?:StaffRole;appIds:string[];environments:Environment[];capabilities:string[];authenticatedAt?:number};
export type Binding={deviceId:string;trustedSubject?:string};
export type AccessStatus="active"|"paused"|"revoked"|"expired";
export type AccessSnapshot={licenseId:string;source:"app"|"legacy";appId:string;environment:Environment;status:AccessStatus;planKey:string;features:{key:string;expiresAt:string|null}[];expiresAt:string|null;revision:number;deviceId:string};
export type AccessResponse={access:AccessSnapshot;token:string|null;refreshAfter:string|null;offlineUntil:string|null;activationKey?:string};
export type Page<T>={items:T[];nextCursor:string|null;total:number};
export type CommandResult<T>={ok:true;value:T}|{ok:false;code:string;requestId:string;retryAfterSeconds?:number};
export type IdentityProof={principal:Principal;subject:string};
export class LicenseDomainError extends Error {constructor(public code:string,public status=400){super(code);}}
