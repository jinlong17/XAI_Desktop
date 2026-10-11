import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, symlinkSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os"; import { join } from "node:path"; import { fileURLToPath } from "node:url"; import { execFileSync, spawnSync } from "node:child_process";
const root=fileURLToPath(new URL("../../../",import.meta.url)),evidence=fileURLToPath(new URL("./",import.meta.url)),revision=process.argv[2];if(!revision)throw Error("Pinned revision required");const commit=execFileSync("git",["rev-parse",revision],{cwd:root,encoding:"utf8"}).trim(),dir=mkdtempSync(join(tmpdir(),"xai-dt-sol-"));
try{execFileSync("tar",["-x","-C",dir],{input:execFileSync("git",["archive",commit],{cwd:root,maxBuffer:100*1024*1024})});symlinkSync(join(root,"node_modules"),join(dir,"node_modules"));const aliases=[];for(const name of readdirSync(join(dir,"packages"))){const folder=join(dir,"packages",name);let pkg;try{pkg=JSON.parse(readFileSync(join(folder,"package.json"),"utf8"))}catch{continue}symlinkSync(join(root,"packages",name,"node_modules"),join(folder,"node_modules"));for(const [key,value] of Object.entries(pkg.exports??{})){const target=typeof value==="string"?value:value.import??value.default;if(typeof target==="string"&&!key.includes("*"))aliases.push({find:pkg.name+(key==="."?"":key.slice(1)),replacement:join(folder,target)})}}aliases.sort((a,b)=>b.find.length-a.find.length);aliases.push({find:"react",replacement:join(root,"packages/plugin-web-settings-rest/node_modules/react")},{find:"@testing-library/react",replacement:join(root,"packages/plugin-web-settings-rest/node_modules/@testing-library/react")});
const ownDir="docs/reviews/web-date-time-recovery-astra";
const storageTests=join(dir,"packages/plugin-web-storage/src/__tests__");
const suites=[
 ["engine21","web-d2-async-pref-astra-engine/engine.test.ts"],
 ["token13","web-d2-async-pref-astra-engine/retry-token.test.ts"],
 ["repair-boundaries","web-d2-async-pref-astra-engine/repair-boundaries.test.ts"],
 ["hooks9","web-d2-async-pref-astra-hooks/hooks.test.tsx"],
 ["dynamic","web-d2-async-pref-astra-hooks/dynamic-final.test.tsx"],
 ["functional","web-d2-async-pref-astra-hooks/functional-diagnosis.test.tsx"],
 ["c29",null,"docs/reviews/web-board-workspace-astra-review/c-primitive-contract.test.ts"],
 ["c-boundaries8",null,"docs/reviews/web-board-workspace-astra-review/c-primitive-boundaries.test.ts"],
 ["d1-shared8",null,"docs/reviews/web-board-workspace-astra-review/d1-shared-writer.test.tsx"],
 ["d2-foundation14",null,"docs/reviews/web-board-workspace-astra-review/d2-foundation-independent.test.ts"],
 ["d2-admission2",null,"docs/reviews/web-board-workspace-astra-review/d2-deletion-admission.test.ts"],
 ["storage-package",null,"packages/plugin-web-storage/src/__tests__/**/*.{test,spec}.{ts,tsx}"]
];
for(const [name,source,original] of suites){
 if(process.argv[3]&&process.argv[3]!==name)continue;
 let injected=null;
 if(source){injected=join(storageTests,"astraIndependent.test."+(source.endsWith("tsx")?"tsx":"ts"));copyFileSync(join(dir,"docs/reviews",source),injected);copyFileSync(join(dir,"docs/reviews/web-d2-async-pref-astra-hooks/named-lock-fixture.ts"),join(storageTests,"named-lock-fixture.ts"));}
 const config=join(dir,"astra-regression.config.mjs");
 writeFileSync(config,"export default "+JSON.stringify({root:dir,resolve:{alias:aliases},esbuild:{jsx:"automatic"},test:{globals:false,clearMocks:true,restoreMocks:true,environment:"jsdom",include:[injected??original]}}));
 const result=spawnSync(join(root,"packages/plugin-web-settings-rest/node_modules/.bin/vitest"),["run","--config",config],{cwd:dir,encoding:"utf8",maxBuffer:30*1024*1024});
 const output=join(evidence,`${name}-${process.argv[4]??"shared"}-${revision}.log`);if(existsSync(output))throw Error("Evidence exists; use fresh suffix");
 writeFileSync(output,`revision=${revision} fixed_commit=${commit} original_assertions=${source??original}\nexit=${result.status}\n${result.stdout}\n${result.stderr}`.trimEnd()+"\n");
 console.log(name,"exit="+result.status,result.stdout.slice(-850));if(result.status!==0)process.exitCode=result.status??1;
 if(injected){rmSync(injected);rmSync(join(storageTests,"named-lock-fixture.ts"));}
}
}finally{rmSync(dir,{recursive:true,force:true})}
