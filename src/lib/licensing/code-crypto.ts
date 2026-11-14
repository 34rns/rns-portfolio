import { randomBytes, randomInt } from "node:crypto";
import { lookupHash } from "../security/secrets";
const alphabet="23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export function generateRedeemCode(prefix:string):string{
  let entropy="";for(let i=0;i<16;i++)entropy+=alphabet[randomInt(alphabet.length)];
  return `${prefix}-${entropy.match(/.{4}/g)!.join("-")}`;
}
export function normalizeRedeemCode(key:string):string|null{const value=key.trim().toUpperCase();return /^[A-Z]{2,16}-(?:[2-9A-HJ-NP-Z]{4}-){3}[2-9A-HJ-NP-Z]{4}$/.test(value)?value:null;}
export function codeLookup(scope:{appId:string;environment:string},key:string):string{return lookupHash(`redeem:${scope.appId}:${scope.environment}:${key}`);}
export function deviceHash(deviceId:string):string{return lookupHash(`device:${deviceId}`);}
export function activationKey():string{return randomBytes(16).toString("base64url");}
