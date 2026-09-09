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
const sourceCommit=process.env.AI_REF??'24da17d';
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
 const pkg=join(snapshot,'packages/plugin-web-ai-chat');
 const alias=[...aliases.entries()].map(([name,{folder,pkg}])=>{let t=pkg.exports?.['.'];if(typeof t==='object')t=t.import??t.default;return typeof t==='string'?{find:name,replacement:join(folder,t)}:null;}).filter(Boolean);
 alias.push({find:'react',replacement:join(root,'packages/plugin-web-ai-chat/node_modules/react')},{find:'react-dom',replacement:join(root,'packages/plugin-web-ai-chat/node_modules/react-dom')});
 alias.push({find:'@testing-library/react',replacement:join(root,'packages/plugin-web-ai-chat/node_modules/@testing-library/react')});
 const original=readFileSync(new URL('./original-contract.test.tsx',import.meta.url),'utf8');
 const test=join(snapshot,'docs/reviews/web-ai-preference-discard/save-contract.test.tsx');mkdirSync(join(snapshot,'docs/reviews/web-ai-preference-discard'),{recursive:true});writeFileSync(test,original);
 const config=join(snapshot,'independent.config.mjs');writeFileSync(config,`export default {resolve:{alias:${JSON.stringify(alias)}},esbuild:{jsx:'automatic'},test:{environment:'jsdom',setupFiles:[${JSON.stringify(join(pkg,'vitest.setup.ts'))}],include:['docs/reviews/web-ai-preference-discard/save-contract.test.tsx']}}`);
 try { const result=execFileSync(process.execPath,[join(root,'packages/plugin-web-ai-chat/node_modules/vitest/vitest.mjs'),'run','--config',config],{cwd:snapshot,encoding:'utf8',maxBuffer:10*1024*1024});writeFileSync(join(output,process.env.AI_TEST_LOG??'original-after.log'),result);console.log(result); }
 catch(error){writeFileSync(join(output,process.env.AI_TEST_LOG??'original-after.log'),String(error.stdout??'')+String(error.stderr??''));throw error;}
}finally{rmSync(directory,{recursive:true,force:true});}
