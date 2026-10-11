import { readFile, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { assertHash, requireThat, sha256 } from './driver.mjs';
import { packageNames, resolvePublic } from './vite.config.mjs';
/** Semantic source gate inspects exact archived bytes; hashing alone is not its oracle. */
export async function sourceGate({m,row,archiveRoot,artifacts}) {
  const archive=await realpath(archiveRoot),observations=[];
  for(const entry of m.productClosure)assertHash(await readFile(join(archive,entry.path)),entry.hash,entry.path);
  const need=async(path,fragments)=>{const source=await readFile(join(archive,path),'utf8');const checks=fragments.map(text=>({text,present:source.includes(text),line:source.slice(0,source.indexOf(text)).split('\n').length}));requireThat(checks.every(c=>c.present),'SOURCE_SEMANTIC',path,{stage:'source-trace',faultId:path,value:checks,counter:1});observations.push({path,hash:sha256(source),checks});return source;};
  await need('packages/plugin-web-metric-tracker/src/MetricTrackerModule.tsx',[
    '{ id: "weight", icon: "target", zh: "体重", en: "Weight", active: true }',
    '{ id: "sleep", icon: "moon", zh: "睡眠", en: "Sleep", active: false }',
    '{ id: "water", icon: "droplet", zh: "饮水", en: "Water", active: false }',
    '{ id: "exercise", icon: "activity", zh: "运动", en: "Exercise", active: false }',
    '{ id: "custom", icon: "plus", zh: "自定义", en: "Custom", active: false }',
    'aria-selected={tab.active} disabled={!tab.active}', 't(lang, "计划中", "Planned")','metricId: "weight"','onClick={openNewDraft}','className="mt-record-note"']);
  await need('packages/plugin-web-metric-tracker/src/internal/storage.ts',['activeMetricId: "weight"','value["metricId"] === "weight"','records:','accountScope.physicalKey(METRIC_TRACKER_STATE_KEY, scope)','window.localStorage.setItem','const records = Array.isArray(value["records"]) ? value["records"].filter(isWeightRecord)']);
  await need('packages/plugin-web-metric-tracker/src/registration.tsx',['metrics','MetricTrackerModule']);
  await need('apps/web/src/routes/router.tsx',['path: "app"','<ProtectedAppRouteElement><App /></ProtectedAppRouteElement>','path: ":moduleId/*"','<AppRouteElement />']);
  await need('apps/web/src/App.tsx',['AccountStorageGate','webShellModuleRegistrations']);
  await need('apps/web/src/providers/AppProviders.tsx',['<AccountDeletionRecoveryBridge />','<DeviceSessionBridge transport={transport}>','<TodoWebRuntimeBridge','config={authMode === "live" ? config : null}']);
  await need('packages/web-auth-device-session/src/session.tsx',['props.config ? <ManagedAuthSessionProvider','createAuthGenerationCoordinator','identityCallback.current?.(owner)']);
  await need('packages/plugin-web-storage/src/AccountDataGate.tsx',['if (ready) return <Fragment key={`${scope.kind}:${scope.accountId}:${scope.generation}:${scope.epoch}`}>','accountScope.activate(token, marker.generation, demo)']);
  await need('packages/plugin-web-storage/src/internal/accountScope.ts',['physicalKey(key: string, scope: AccountScope = current)','assertCurrent(scope)','return generationKey(scope.accountId, scope.generation, key, scope.kind === \'demo\')']);
  const map=await packageNames(archive);const aliases=[];
  for(const name of map.keys())if(name.startsWith('@repo/')){const exported=map.get(name).metadata.exports;if(exported)for(const sub of Object.keys(exported).filter(k=>k==='.'||k.startsWith('./'))){const alias=sub==='.'?name:`${name}/${sub.slice(2)}`;try{const r=await resolvePublic(map,archive,alias);aliases.push({alias,path:r.file,metadataHash:r.pkg.metadataHash});}catch(e){if(!sub.includes('*'))throw e;}}}
  const result={row:row.id,product:m.productSHA,observations,aliases,semantics:'source observations pending independent review, not runtime product proof'};await artifacts.write('source-observations.json',JSON.stringify(result,null,2));return result;
}
