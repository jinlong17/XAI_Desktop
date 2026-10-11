import { readFileSync, realpathSync, appendFileSync } from 'node:fs';
import { resolve, relative, dirname, sep } from 'node:path';
import { sha256, requireThat, assertAlias } from './driver.mjs';
/** Used only by a subsequently qualified build adapter; no server starts on import. */
export function makeConfig({ archiveRoot, dependencyRoot, fixturePath, hostMode, closureLog, expectedLockHash }) {
  const archive=realpathSync(archiveRoot), deps=realpathSync(dependencyRoot), fixture=realpathSync(fixturePath);
  requireThat(hostMode==='live','AUTH','mock-authenticated selects demo namespace; synthetic public client uses live account gate');
  requireThat(sha256(readFileSync(resolve(archive,'pnpm-lock.yaml')))===expectedLockHash,'HASH','archive lock');
  const inside=(root,path)=>{const r=relative(root,path);return r===''||(!r.startsWith(`..${sep}`)&&r!=='..'&&!r.startsWith(sep));};
  return { root:dirname(fixture), cacheDir:resolve(dirname(closureLog),'vite-cache'), envDir:resolve(dirname(closureLog),'empty-env'), define:{'import.meta.env.VITE_WEB_AUTH_MODE':JSON.stringify('live')}, server:{host:'127.0.0.1',strictPort:true,fs:{strict:true,allow:[archive,dirname(fixture),deps]}}, resolve:{preserveSymlinks:false,dedupe:['react','react-dom']}, plugins:[{
    name:'met05-archive-import-closure',enforce:'pre',
    async resolveId(source, importer) {
      if(source.startsWith('__met_archive_host__/')) return resolve(archive,'apps/web/src',source.slice('__met_archive_host__/'.length));
      if(!source.startsWith('@repo/')) return null;
      const body=source.slice('@repo/'.length),slash=body.indexOf('/'),name=slash<0?body:body.slice(0,slash),sub=slash<0?'.':`./${body.slice(slash+1)}`;
      const pkg=resolve(archive,'packages',name),metadata=JSON.parse(readFileSync(resolve(pkg,'package.json'),'utf8'));
      let target=metadata.exports?.[sub]; if(typeof target==='object') target=target.import ?? target.default;
      requireThat(typeof target==='string','ALIAS',`${source}: no public export`);
      const path=realpathSync(resolve(pkg,target));assertAlias(archive,path); appendFileSync(closureLog,`${JSON.stringify({source,importer,resolved:path,hash:sha256(readFileSync(path))})}\n`);return path;
    },
    load(id) { const file=id.split('?')[0];if(!file.startsWith('/'))return null;const real=realpathSync(file);requireThat(inside(archive,real)||(inside(deps,real)&&real.includes(`${sep}node_modules${sep}`))||real===fixture,'CLOSURE',real);if(file.includes(`${sep}packages${sep}`)&&!real.includes(`${sep}node_modules${sep}`))assertAlias(archive,real);return null; },
  }] };
}
