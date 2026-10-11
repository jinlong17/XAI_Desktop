import { readFile, realpath, readdir } from 'node:fs/promises';
import { resolve, join, dirname, relative, extname } from 'node:path';
import { createRequire } from 'node:module';
import { assertAlias, assertHash, requireThat, sha256, contained, Refusal } from './driver.mjs';
export async function packageNames(archiveRoot) {
  const archive=await realpath(archiveRoot),map=new Map();
  for(const directory of await readdir(join(archive,'packages'),{withFileTypes:true})) {
    if(!directory.isDirectory())continue;const metadataPath=join(archive,'packages',directory.name,'package.json');let bytes;
    try{bytes=await readFile(metadataPath);}catch(e){if(e.code==='ENOENT')continue;throw e;}
    const metadata=JSON.parse(bytes);if(typeof metadata.name!=='string')continue;
    requireThat(!map.has(metadata.name),'PACKAGE_DUPLICATE',metadata.name,{stage:'resolve',faultId:'resolver-name',value:metadata.name,counter:1});
    map.set(metadata.name,{directory:dirname(metadataPath),metadata,metadataHash:sha256(bytes),metadataPath});
  }
  return map;
}
function exportTarget(entry) {
  if(typeof entry==='string')return entry;
  if(entry&&typeof entry==='object'&&!Array.isArray(entry))for(const condition of ['browser','import','default'])if(entry[condition])return exportTarget(entry[condition]);
  return null;
}
export async function resolvePublic(map,archive,source) {
  const pieces=source.slice('@repo/'.length).split('/'),name=`@repo/${pieces.shift()}`,sub=pieces.length?`./${pieces.join('/')}`:'.',pkg=map.get(name);
  requireThat(pkg,'PACKAGE_UNKNOWN',name,{stage:'resolve',faultId:'resolver-name',value:name,counter:1});
  const exports=pkg.metadata.exports;const target=exportTarget(typeof exports==='string'&&sub==='.'?exports:exports?.[sub]??(sub==='.'&&!Object.keys(exports??{}).some(k=>k.startsWith('.'))?exports:null));
  requireThat(target?.startsWith('./'),'EXPORT_UNKNOWN',source,{stage:'resolve',faultId:'resolver-name',value:sub,counter:1});const file=await realpath(resolve(pkg.directory,target));assertAlias(archive,file);assertAlias(await realpath(pkg.directory),file);return {file,pkg,sub};
}
export async function makeConfig({archiveRoot,dependencyRoot,fixturePath,output,port,expectedLockHash,record}) {
  const archive=await realpath(archiveRoot),deps=await realpath(dependencyRoot),fixture=await realpath(fixturePath),sourceRoot=dirname(fixture);const map=await packageNames(archive);
  assertHash(await readFile(join(archive,'pnpm-lock.yaml')),expectedLockHash,'lock');const requireDependency=createRequire(join(deps,'package.json'));const knownVirtual=new Set(['\0vite/modulepreload-polyfill']);
  const consumed=new Set();
  const log=async recordValue=>{await record({...recordValue,archive,dependencyRoot:deps});};
  async function checked(file,source,importer) {
    const raw=file.split('?')[0];const real=await realpath(raw);
    requireThat(contained(archive,real)||contained(deps,real)||contained(sourceRoot,real),'CLOSURE',real,{stage:'resolve',faultId:'resolver-outside',value:real,counter:1});
    if(!consumed.has(real)){consumed.add(real);await log({kind:'file',source,importer,path:real,hash:sha256(await readFile(real))});}return real;
  }
  return {configFile:false,root:join(output,'build'),envDir:join(output,'empty-env'),envPrefix:'MET05_ENV_DISABLED_',cacheDir:join(output,'cache/vite'),publicDir:false,appType:'spa',
    define:{'import.meta.env.VITE_WEB_AUTH_MODE':JSON.stringify('live'),'import.meta.env.VITE_SUPABASE_URL':JSON.stringify(`http://127.0.0.1:${port}`),'import.meta.env.VITE_SUPABASE_ANON_KEY':JSON.stringify('synthetic-local-only-no-production-key')},
    optimizeDeps:{noDiscovery:true,include:[],exclude:[...map.keys()]},esbuild:{jsx:'automatic'},resolve:{preserveSymlinks:false,dedupe:['react','react-dom'],conditions:['browser','import','default']},
    server:{host:'127.0.0.1',port,strictPort:true,fs:{strict:true,allow:[archive,deps,sourceRoot,join(output,'build')]},cors:false,watch:{ignored:['**/archive/**','**/dependencies/**']},hmr:false},
    plugins:[{name:'met05-full-source-closure',enforce:'pre',
      async resolveId(source,importer) {
        if(source.startsWith('__met_archive_host__/'))return checked(resolve(archive,'apps/web/src',source.slice('__met_archive_host__/'.length)),source,importer);
        if(source.startsWith('@repo/')){const found=await resolvePublic(map,archive,source);await log({kind:'public-export',source,importer,path:found.file,package:found.pkg.metadata.name,physicalDirectory:relative(archive,found.pkg.directory),metadataHash:found.pkg.metadataHash});return checked(found.file,source,importer);}
        if(source.startsWith('\0')){requireThat(knownVirtual.has(source),'VIRTUAL_SOURCE',source);return null;}
        if(!source.startsWith('.')&&!source.startsWith('/')&&!source.startsWith('data:')) {
          // Browser dependencies only from the owned copied node_modules tree.
          let target;try{target=requireDependency.resolve(source);}catch(e){throw new Refusal('DEPENDENCY_RESOLVE',source,{stage:'resolve',faultId:'resolver-name',value:source,counter:1});}
          requireThat(contained(deps,await realpath(target)),'DEPENDENCY_ESCAPE',target);return checked(target,source,importer);
        }
        return null;
      },
      async load(id) {const file=id.split('?')[0];if(file.startsWith('/')&&extname(file))await checked(file,id,null);else if(file.startsWith('\0'))requireThat(knownVirtual.has(file),'VIRTUAL_SOURCE',file);return null;},
      async transform(code,id){if(id.startsWith('\0')){requireThat(knownVirtual.has(id),'VIRTUAL_SOURCE',id);await log({kind:'generated',id,hash:sha256(code)});}return null;},
    }]};
}
