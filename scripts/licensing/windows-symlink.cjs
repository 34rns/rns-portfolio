const fs=require("node:fs"),path=require("node:path");
const original=fs.symlinkSync;
fs.symlinkSync=function(target,destination,type){
 try{return original(target,destination,type);}catch(error){
  const workspace=path.resolve(process.cwd()),resolved=path.resolve(path.dirname(destination),target);
  const generated=[path.join(workspace,".next"),path.join(workspace,".open-next")];
  if(process.platform!=="win32"||error.code!=="EPERM"||!generated.some(root=>path.resolve(destination).startsWith(root+path.sep))||!resolved.startsWith(workspace+path.sep)||!fs.statSync(resolved).isDirectory())throw error;
  return original(resolved,destination,"junction");
 }
};
