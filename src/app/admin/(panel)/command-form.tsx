"use client";
import { useActionState,useState } from "react";
import { licenseCommand,type CommandState } from "./licensing-actions";
import type { AppScope } from "@/lib/licensing/contracts";
export function CopyText({value,label="Copy"}:{value:string;label?:string}){const [state,setState]=useState("");return <button type="button" className="kg-button kg-button-subtle" onClick={async()=>{try{await navigator.clipboard.writeText(value);setState("Copied");}catch{setState("Select and copy the text below");}}}>{state||label}</button>;}
export function CommandForm({command,scope,data,label,children,danger=false,showResult=false}:{command:string;scope?:AppScope;data:unknown;label:string;children?:React.ReactNode;danger?:boolean;showResult?:boolean}){
 const [state,action,pending]=useActionState(licenseCommand,{} as CommandState);
 return <form action={action} className="kg-command"><input type="hidden" name="command" value={command}/><input type="hidden" name="scope" value={scope?JSON.stringify(scope):""}/><input type="hidden" name="data" value={JSON.stringify(data)}/>{children}<button disabled={pending} className={`kg-button ${danger?"kg-button-danger":""}`}>{pending?"Saving…":label}</button><p role={state.error?"alert":"status"} className={state.error?"kg-error":"kg-success"}>{state.error??(state.success?"Saved.":"")}</p>{showResult&&state.success&&state.result!=null&&<div className="kg-result"><pre>{JSON.stringify(state.result,null,2)}</pre><CopyText value={JSON.stringify(state.result,null,2)}/></div>}</form>;
}
