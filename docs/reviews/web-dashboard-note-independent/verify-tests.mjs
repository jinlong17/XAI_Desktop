/** Real Chrome, isolated profile/download directory. Synthetic fixtures only. No server auth. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, readdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const output=fileURLToPath(new URL('./',import.meta.url));
const directory=mkdtempSync(join(tmpdir(),'xai-metrics-save-'));
const sourceCommit='8eb163d';
const snapshot=join(directory,'source');mkdirSync(snapshot);
execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',sourceCommit],{cwd:root,maxBuffer:100*1024*1024})});
symlinkSync(join(root,'node_modules'),join(snapshot,'node_modules'));
const aliases=new Map();
for(const name of readdirSync(join(snapshot,'packages'))){
 const folder=join(snapshot,'packages',name);
 try{const pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));aliases.set(pkg.name,{folder,pkg});symlinkSync(join(root,'packages',name,'node_modules'),join(folder,'node_modules'));}catch{}
}
const pinnedPackages={name:'pinned-workspace-packages',setup(build){build.onResolve({filter:/^@repo\//},args=>{const parts=args.path.split('/');const entry=aliases.get(parts.slice(0,2).join('/'));if(!entry)return;const sub=parts.length>2?'./'+parts.slice(2).join('/'):'.';let target=entry.pkg.exports?.[sub];if(typeof target==='object')target=target.import??target.default;if(typeof target!=='string')throw Error('Unresolved pinned export '+args.path);return {path:join(entry.folder,target)};});}};


try{
 const pkg=join(snapshot,'packages/xai-web-dashboard-grid');
 const alias=[...aliases.entries()].map(([name,{folder,pkg}])=>{let t=pkg.exports?.['.'];if(typeof t==='object')t=t.import??t.default;return typeof t==='string'?{find:name,replacement:join(folder,t)}:null;}).filter(Boolean);
 alias.push({find:'react',replacement:join(root,'packages/xai-web-dashboard-grid/node_modules/react')},{find:'react-dom',replacement:join(root,'packages/xai-web-dashboard-grid/node_modules/react-dom')});
 const config=join(pkg,'independent.config.mjs');writeFileSync(config,`export default {resolve:{alias:${JSON.stringify(alias)}},test:{environment:'jsdom',setupFiles:['./src/__tests__/setup.ts']}}`);
 const result=execFileSync(process.execPath,[join(root,'packages/xai-web-dashboard-grid/node_modules/vitest/vitest.mjs'),'run','--config',config],{cwd:pkg,encoding:'utf8',maxBuffer:10*1024*1024});writeFileSync(join(output,'tests.log'),result);console.log(result);
}finally{rmSync(directory,{recursive:true,force:true});}
