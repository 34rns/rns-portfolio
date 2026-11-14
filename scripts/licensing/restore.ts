import { readFile, stat } from "node:fs/promises";
import { assertTestDatabase } from "./check-test-env";
import { createLicenseStore } from "../../src/lib/licensing/transaction-store";
import { restoreBackup } from "../../src/lib/licensing/backup";

async function main(){
 const args=process.argv.slice(2),value=(name:string)=>{const index=args.indexOf(name);return index>=0?args[index+1]:undefined;};
 const target=value("--target"),file=value("--file"),mode=args.includes("--apply")?"apply":"validate";
 if(!target||!file)throw new Error("Use --target with an isolated _test/_demo PostgreSQL URL and --file with a private backup. Default is validate-only; --apply requires an empty target.");
 assertTestDatabase(target, "");
 if((await stat(file)).size>25*1024*1024)throw new Error("Backup exceeds the 25 MiB limit.");
 const report=await restoreBackup(createLicenseStore(target),JSON.parse(await readFile(file,"utf8")),mode);
 process.stdout.write(JSON.stringify(report)+"\n");
}
void main().catch(error=>{process.stderr.write(`Restore refused: ${error instanceof Error?error.message:"invalid backup"}\n`);process.exitCode=1;});
