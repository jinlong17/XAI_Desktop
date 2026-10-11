/** Fixed product type/lint gate, with workspace namespace links redirected into archive. */
import {mkdtempSync,readdirSync,readFileSync,mkdirSync,symlinkSync,existsSync,rmSync,writeFileSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {join} from 'node:path';import {tmpdir} from 'node:os';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url)),out=fileURLToPath(new URL('./',import.meta.url));
const revision=process.argv[2];if(!revision)throw Error('Fixed revision required');const sha=execFileSync('git',['rev-parse',revision],{cwd:root,encoding:'utf8'}).trim();
const output=join(out,`types-lint-${revision}${process.argv[3]?"-"+process.argv[3]:""}.log`);if(existsSync(output))throw Error('Evidence exists');const dir=mkdtempSync(join(tmpdir(),'xai-dt-types-'));const results=[];
try{
 execFileSync('tar',['-x','-C',dir],{input:execFileSync('git',['archive',sha],{cwd:root,maxBuffer:150*1024*1024})});
 const packages=new Map();for(const name of readdirSync(join(dir,'packages'))){const path=join(dir,'packages',name,'package.json');if(existsSync(path)){const pkg=JSON.parse(readFileSync(path,'utf8'));if(pkg.name?.startsWith('@repo/'))packages.set(pkg.name.slice(6),join(dir,'packages',name));}}
 const dependencyLinks=relative=>{const live=join(root,relative,'node_modules'),target=join(dir,relative,'node_modules');if(!existsSync(live))return;mkdirSync(target,{recursive:true});for(const name of readdirSync(live)){if(name==='@repo')continue;symlinkSync(join(live,name),join(target,name));}mkdirSync(join(target,'@repo'));for(const [name,path] of packages)symlinkSync(path,join(target,'@repo',name));};
 dependencyLinks('');for(const name of readdirSync(join(dir,'packages')))dependencyLinks('packages/'+name);dependencyLinks('apps/web');
 const gates=[['web-types','apps/web','tsc',['--noEmit']],['web-lint','apps/web','eslint',['--max-warnings','0','.']],['settings-types','packages/plugin-web-settings-rest','tsc',['--noEmit']],['settings-lint','packages/plugin-web-settings-rest','eslint',['--max-warnings','0','.']],['storage-types','packages/plugin-web-storage','tsc',['--noEmit']]];
 for(const [name,cwd,bin,args] of gates){const executable=[join(root,cwd,'node_modules/.bin',bin),join(root,'apps/web/node_modules/.bin',bin),join(root,'node_modules/.bin',bin)].find(existsSync);if(!executable)throw Error('Missing installed CLI '+bin);const r=spawnSync(executable,args,{cwd:join(dir,cwd),encoding:'utf8',maxBuffer:12*1024*1024});if(r.error)throw r.error;results.push({name,exit:r.status,stdout:r.stdout,stderr:r.stderr});console.log(name,'exit='+r.status);if(r.status!==0)process.exitCode=r.status??1;}
}finally{writeFileSync(output,JSON.stringify({revision,sha,workspaceLinks:'archive',results},null,2)+'\n');rmSync(dir,{recursive:true,force:true});}
