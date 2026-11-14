import { build } from "esbuild";
void build({entryPoints:["src/widget/index.ts"],bundle:true,minify:true,platform:"browser",format:"iife",target:"es2022",outfile:"public/widget.js"}).catch(()=>{process.exitCode=1;});
