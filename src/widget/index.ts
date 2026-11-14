import { createBrowserClient } from "../../sdks/javascript/src/browser";
import type { Access } from "../../sdks/javascript/src/index";

const script=document.currentScript as HTMLScriptElement|null;
async function mount(){
  if(!script?.dataset.app)return;
  const appId=script.dataset.app,environment=script.dataset.environment==="live"?"live":"sandbox";
  const apiUrl=new URL("/v1",script.src).href;
  const client=createBrowserClient({appId,environment,apiUrl});
  const elements=()=>Array.from(document.querySelectorAll<HTMLElement>("[data-keygate]"));
  function apply(access:Access|null){
    for(const element of elements()){
      const feature=element.dataset.keygate;
      const allowed=!!access&&(feature==="pro"?access.planKey!=="free":access.features.some(f=>f.key===feature));
      element.hidden=!allowed;element.inert=!allowed;
      element.dataset.keygateState=allowed?"unlocked":"locked";
    }
    host.dispatchEvent(new CustomEvent("keygate:access",{bubbles:true,detail:{active:!!access,plan:access?.planKey??"free"}}));
  }
  const host=document.createElement("div");host.dataset.keygateWidget=appId;
  const root=host.attachShadow({mode:"open"});
  const style=document.createElement("style");style.textContent=`:host{font-family:system-ui,sans-serif;color:#20241f}button,input{font:inherit;box-sizing:border-box}button{cursor:pointer;border:1px solid #d6dccf;border-radius:8px;padding:12px 18px;background:#fff;color:#20241f;min-height:44px}button:disabled{opacity:.6;cursor:wait}button:focus-visible,input:focus-visible{outline:3px solid #49663f;outline-offset:3px}.primary{background:var(--accent,#ffc900);color:var(--accent-ink,#171b15);font-weight:600;border-color:transparent}dialog{box-sizing:border-box;width:min(440px,calc(100% - 32px));border:1px solid #d6dccf;border-radius:16px;padding:28px;color:#20241f;background:#fff}dialog::backdrop{background:#14201599}header{display:flex;justify-content:space-between;align-items:center;gap:16px}h2{font-size:24px;letter-spacing:-.04em;margin:0}p{font-size:14px;line-height:1.65}label{display:block;font-size:14px;font-weight:600}input{display:block;width:100%;margin:10px 0 20px;padding:14px;border:1px solid #ced4c8;border-radius:8px;background:#fff;color:#20241f}form>.primary{width:100%}small{display:block;color:#56604f;font-size:12px;line-height:1.6;margin-top:18px}.message{min-height:24px}.tabs{display:flex;gap:8px;margin:20px 0}.tabs button[aria-pressed=true]{background:#eaf0df}.close{padding:8px 12px}.sandbox{color:#755300;font-size:12px}`;
  root.append(style);
  const trigger=document.createElement("button");trigger.className="primary";trigger.textContent="Unlock Pro";
  const dialog=document.createElement("dialog");dialog.setAttribute("aria-labelledby","keygate-title");
  dialog.innerHTML=`<header><h2 id="keygate-title">Unlock Pro</h2><button class="close" aria-label="Close redeem dialog">×</button></header><p class="sandbox"></p><div class="tabs"><button type="button" aria-pressed="true">Redeem code</button><button type="button" aria-pressed="false">Activate device</button></div><form><label>Your redeem code<input required autocomplete="off" maxlength="128" name="code"></label><button class="primary">Unlock access</button></form><p class="message" role="status" aria-live="polite"></p><small>Keep activation credentials private. Valuable downloads and APIs need access checks on their server.</small><button class="deactivate" hidden>Deactivate this device</button>`;
  root.append(trigger,dialog);document.body.append(host);
  const title=dialog.querySelector("h2")!,input=dialog.querySelector("input")!,form=dialog.querySelector("form")!,submit=form.querySelector("button")!,message=dialog.querySelector<HTMLElement>(".message")!,deactivate=dialog.querySelector<HTMLButtonElement>(".deactivate")!,tabs=Array.from(dialog.querySelectorAll<HTMLButtonElement>(".tabs button"));
  if(environment==="sandbox")dialog.querySelector(".sandbox")!.textContent="Sandbox — test access only";
  let mode="redeem",busy=false,successMessage="Your access is ready.",bindingMode="device";
  const show=()=>{if(!dialog.open){dialog.showModal();input.focus();}};
  trigger.addEventListener("click",show);
  document.querySelectorAll<HTMLElement>("[data-keygate-open]").forEach(element=>element.addEventListener("click",show));
  dialog.querySelector(".close")!.addEventListener("click",()=>dialog.close());
  tabs.forEach((tab,index)=>tab.addEventListener("click",()=>{if(busy)return;mode=index?"activate":"redeem";tabs.forEach((t,i)=>t.setAttribute("aria-pressed",String(index===i)));form.querySelector("label")!.firstChild!.textContent=index?"Activation credential":"Your redeem code";input.value="";submit.textContent=index?"Activate device":"Unlock access";message.textContent="";input.focus();}));
  async function refresh(){try{const access=await client.validate();apply(access);deactivate.hidden=false;trigger.textContent="Manage access";}catch{apply(null);deactivate.hidden=true;trigger.textContent="Unlock Pro";}}
  form.addEventListener("submit",async event=>{event.preventDefault();if(busy)return;if(bindingMode==="account"){message.textContent="Redeem inside your signed-in app so its backend can verify your account.";return;}busy=true;submit.disabled=true;message.textContent="Checking access…";try{const access=mode==="redeem"?await client.redeem(input.value):await client.activate(input.value);apply(access);message.textContent=successMessage;deactivate.hidden=false;trigger.textContent="Manage access";input.value="";}catch(error){apply(null);message.textContent=error instanceof Error?error.message.replaceAll("_"," "):"Access could not be verified.";}finally{busy=false;submit.disabled=false;}});
  deactivate.addEventListener("click",async()=>{if(busy)return;busy=true;deactivate.disabled=true;try{await client.deactivate();apply(null);deactivate.hidden=true;trigger.textContent="Unlock Pro";message.textContent="Device deactivated. Your slot is available again.";}catch{message.textContent="Could not deactivate. Try again when you are online.";}finally{busy=false;deactivate.disabled=false;}});
  apply(null);
  try{const response=await fetch(`${apiUrl}/app?app_id=${encodeURIComponent(appId)}&environment=${environment}`,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error();const app=await response.json();bindingMode=app.bindingMode;title.textContent=app.branding.title;successMessage=app.branding.successMessage;if(/^#[0-9a-f]{6}$/i.test(app.branding.accent)){host.style.setProperty("--accent",app.branding.accent);const rgb=app.branding.accent.slice(1).match(/../g)!.map((v:string)=>parseInt(v,16));host.style.setProperty("--accent-ink",rgb.reduce((s:number,v:number,i:number)=>s+v*[.299,.587,.114][i],0)>150?"#171b15":"#ffffff");}}catch{message.textContent="Product settings are unavailable. Check the App ID and allowed origin.";}
  await refresh();
  const timer=window.setInterval(()=>void refresh(),60000);
  window.addEventListener("online",()=>void refresh());
  window.addEventListener("pagehide",()=>clearInterval(timer),{once:true});
}
const failLocked=()=>{document.querySelectorAll<HTMLElement>("[data-keygate]").forEach(element=>{element.hidden=true;element.inert=true;element.dataset.keygateState="locked";});const message=document.createElement("p");message.textContent="Premium access is unavailable. Check product configuration or contact support.";message.setAttribute("role","status");document.body.append(message);};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>void mount().catch(failLocked),{once:true});else void mount().catch(failLocked);
