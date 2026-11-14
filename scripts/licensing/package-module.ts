import { mkdir, readFile, writeFile, lstat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const docs = ["README.md","CONTRIBUTING.md","SECURITY.md","sdk-matrix.md","hosting-preflight.md","release-checklist.md","rollback.md"];
const intendedFiles = {
 "javascript":["package.json","tsconfig.json","README.md","src/index.ts","src/browser.ts","src/node.ts"],
 "middleware":["README.md","index.ts","express.ts","hono.ts","next.ts"],
 "python":["pyproject.toml","README.md","keygate/__init__.py","keygate/client.py","keygate/fastapi.py","tests/test_contract.py"],
 "go":["README.md","go.mod","client.go","client_test.go"],
 "php":["README.md","composer.json","src/Client.php","tests/contract.php"],
 "dotnet":["README.md","KeyGate/KeyGate.csproj","KeyGate/Client.cs","KeyGate.Tests/KeyGate.Tests.csproj","KeyGate.Tests/Program.cs"],
 "dart":["README.md","pubspec.yaml","lib/keygate.dart","test/contract_test.dart"],
 "kotlin":["README.md","build.gradle.kts","src/main/kotlin/keygate/KeyGateClient.kt","src/test/kotlin/keygate/ContractTest.kt"],
 "swift":["README.md","Package.swift","Sources/KeyGate/Client.swift","Tests/KeyGateTests/ContractTests.swift"],
 "fixtures":["contract.json"],
};
export async function packageIntegrationKit(root: string, output: string) {
 root = path.resolve(root); output = path.resolve(output);
 if (root === output || root.startsWith(`${output}${path.sep}`) || output.startsWith(`${root}${path.sep}`) && !output.startsWith(path.join(root,".local")+path.sep)) throw new Error("Use a separate output or .local directory.");
 try { await lstat(output); throw new Error("Package output already exists; choose a new directory."); } catch(error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
 const files: {path:string;sha256:string;bytes:number}[]=[];
 const copy=async(relative:string) => {
  const source=path.join(root,relative),stat=await lstat(source).catch(()=>null); if(!stat||stat.isSymbolicLink())return;
  if(!stat.isFile())return;
  const data=await readFile(source);
  if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(data.toString()))throw new Error("Private key material found; package refused.");
  const target=path.join(output,relative);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,data);
  files.push({path:relative.split(path.sep).join("/"),sha256:createHash("sha256").update(data).digest("hex"),bytes:data.length});
 };
 for(const [sdk,names] of Object.entries(intendedFiles))for(const name of names)await copy(path.join("sdks",sdk,name));
 for(const name of ["license-demo/web/index.html","android/KeystoreStorage.kt","flutter/secure_storage.dart","ios/KeychainStorage.swift"])await copy(path.join("examples",name));
 await copy("INTEGRATION.md");
 for(const name of docs)await copy(path.join("docs/licensing",name));
 await mkdir(output,{recursive:true});files.sort((a,b)=>a.path.localeCompare(b.path));
 const report={kind:"keygate.integration-kit.v1",standaloneBackend:false,files};await writeFile(path.join(output,"manifest.json"),JSON.stringify(report,null,2));return report;
}
if(process.argv[1]?.endsWith("package-module.ts")){
 const output=process.argv[2]??path.join(".local",`integration-kit-${Date.now()}`);
 packageIntegrationKit(process.cwd(),output).then(report=>process.stdout.write(`Prepared ${report.files.length} source/doc files in ${path.resolve(output)}. Review ownership before public distribution.\n`)).catch(error=>{process.stderr.write(`${error instanceof Error?error.message:"Package failed"}\n`);process.exitCode=1;});
}
