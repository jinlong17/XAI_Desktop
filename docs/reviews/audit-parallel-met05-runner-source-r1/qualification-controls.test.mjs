/** SOURCE ONLY: this file has never been executed by its author. Fresh qualifier owns invocation. */
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Journal, lifecycle, loggedChild, archive, Artifacts, plannedOracle, noEffect, loggedOracle, assertHash, assertAlias, assertTrust, admit, sha256, deadline } from './driver.mjs';

const valid = () => ({ lang:'en',module:'actual-metrics',logEnabled:true,tabs:[['weight','Weight',false,true],['sleep','Sleep Planned',true,false],['water','Water Planned',true,false],['exercise','Exercise Planned',true,false],['custom','Custom Planned',true,false]].map(([id,text,disabled,selected])=>({id,text,disabled,selected})) });
test('M9 actual observation predicates: positive and each missing Planned label',()=>{
  plannedOracle(valid());for(const id of ['sleep','water','exercise']){const s=valid();s.tabs.find(t=>t.id===id).text=id;assert.throws(()=>plannedOracle(s),/BUSINESS/);}
});
test('M9 enabled planned control and concrete write attempt must fail',()=>{
  const s=valid();s.tabs.find(t=>t.id==='sleep').disabled=false;assert.throws(()=>plannedOracle(s),/BUSINESS/);
  const b={url:'x',content:'Weight',dialogs:0,bytes:{a:'unchanged'},writes:0,removes:0};noEffect(b,{...b});assert.throws(()=>noEffect(b,{...b,writes:1}),/BUSINESS/);
});
test('M9 suppressed Log cannot be accepted as functioning Weight',()=>{
  const b={key:'a',bytes:{a:JSON.stringify({activeMetricId:'weight',records:[]})}};
  assert.throws(()=>loggedOracle(b,b,71.25,'positive'),/BUSINESS/);
  const a={key:'a',bytes:{a:JSON.stringify({activeMetricId:'weight',records:[{metricId:'weight',value:71.25,unit:'kg',note:'positive'}]})}};loggedOracle(b,a,71.25,'positive');
});
test('M9 provenance/hash/alias/trust positives and causal invalids',()=>{
  assertHash('bytes',sha256('bytes'),'control');assert.throws(()=>assertHash('corrupt',sha256('bytes'),'control'),/HASH/);
  assertAlias('/archive','/archive/packages/metrics');assert.throws(()=>assertAlias('/archive','/other/packages/metrics'),/ALIAS/);
  assertTrust({transport:'cdp-pipe',trusted:true,hitVerified:true},[{isTrusted:true}]);
  assert.throws(()=>assertTrust({transport:'dom-click',trusted:false,hitVerified:true},[{isTrusted:false}]),/TRUST/);
});
test('unknown M8 lifetime refuses; actor/transport/newfilename cannot reset it',()=>{
  const unit='REL-05/metrics-native-save-retry',m={units:{[unit]:{rows:['M8-retry'],correspondence:'REL05',knownNativeLowerBound:2,lifetime:'unknown'}}};
  assert.throws(()=>admit(unit,{units:{}},m),/BUDGET/);
  assert.throws(()=>admit(unit,{units:{[unit]:{registered:true,totalKnown:true,used:0,cap:3,purposeHash:sha256(JSON.stringify(m.units[unit]))}}},m),/BUDGET/);
});
async function sandbox() {const root=await mkdtemp(join(tmpdir(),'met05-qualified-control-'));return {root,journal:await Journal.create(join(root,'journal.jsonl'))};}
test('lifecycle preserves original failure, bounded cleanup failure and durable late outcome',async()=>{
  const {root,journal}=await sandbox();let result;
  await assert.rejects(lifecycle({journal,work:async()=>{throw new Error('causal-work-fault');},cleanup:async()=>{throw new Error('causal-cleanup-fault');},finalize:async r=>{result=r;}}),/causal-work-fault/);
  assert.match(result.failure,/causal-work-fault/);assert.match(result.cleanupFailure,/causal-cleanup-fault/);const text=await readFile(join(root,'journal.jsonl'),'utf8');assert.match(text,/late-final-outcome/);assert.match(text,/cleanup-failure/);
});
test('child stdout/stderr flush and late nonzero exit are preserved',async()=>{
  const {root,journal}=await sandbox();
  await assert.rejects(loggedChild(process.execPath,['-e',"process.stdout.write('started');process.stderr.write('late failure');setTimeout(()=>process.exit(7),20)"],{cwd:root,prefix:join(root,'child'),journal}),/CHILD/);
  await journal.close();assert.equal(await readFile(join(root,'child.stdout.log'),'utf8'),'started');assert.equal(await readFile(join(root,'child.stderr.log'),'utf8'),'late failure');assert.match(await readFile(join(root,'journal.jsonl'),'utf8'),/"code":7/);
});
test('deadline kills actual hung child and logs closed streams',async()=>{
  const {root,journal}=await sandbox();await assert.rejects(loggedChild(process.execPath,['-e',"process.stdout.write('before hang');setInterval(()=>{},1000)"],{cwd:root,prefix:join(root,'hang'),journal,ms:100}),/CHILD/);await journal.close();assert.match(await readFile(join(root,'journal.jsonl'),'utf8'),/"timedOut":true/);
});
test('no clobber and finite artifact paths',async()=>{
  const {root,journal}=await sandbox();const a=new Artifacts(root,['one.json']);await a.write('one.json','first');await assert.rejects(a.write('one.json','replacement'),/EEXIST/);await assert.rejects(a.write('../escape','bad'),/OUTPUT/);assert.equal(await readFile(join(root,'one.json'),'utf8'),'first');await journal.close();
});
test('deadline produces refusal instead of success',async()=>{let aborted=false;await assert.rejects(deadline(new Promise(()=>{}),20,()=>{aborted=true;},'control'),/DEADLINE/);assert.equal(aborted,true);});

/** Mandatory browser controls: each uses a distinct isolated synthetic document, NEVER product DOM.
 * Fresh qualifier must supply an independently reviewed pipe host capable of document HTML replacement.
 * DOM-click is used only as the rejected trust control and never as product evidence.
 */
export async function browserQualification({ createIsolated, record }) {
  const results=[];
  const html=(fault='none')=>`<!doctype html><meta name="viewport" content="width=device-width"><div class="module-metrics"><button class="mt-primary">Log</button><div class="mt-tabs">${['Weight','Sleep','Water','Exercise','Custom'].map((name,i)=>`<button aria-selected="${i===0}" ${i && !(fault==='enabled-sideeffect' && i===1)?'disabled':''}>${name}${i && fault!==`missing-${name.toLowerCase()}`?' Planned':''}</button>`).join('')}</div></div><script>window.writes=0;window.audit=[];for(const t of ['click','keydown','keyup'])document.addEventListener(t,e=>audit.push({type:t,isTrusted:e.isTrusted,key:e.key}),true);document.querySelector('.mt-primary').addEventListener('click',()=>{${fault==='suppressed-log'?'':"const d=document.createElement('div');d.setAttribute('role','dialog');document.body.append(d);"}});document.querySelectorAll('.mt-tabs button')[1].addEventListener('click',()=>writes++);</script>`;
  for(const fault of ['none','missing-sleep','missing-water','missing-exercise','enabled-sideeffect','suppressed-log','dom-click']){
    const page=await createIsolated(html(fault));let rejected=false;let failure=null;
    try {
      const observation=await page.observe();if(fault!=='enabled-sideeffect')plannedOracle(observation);
      if(fault==='enabled-sideeffect'){const before=await page.observe();await page.pointer('.mt-tabs button:nth-child(2)');noEffect(before,await page.observe());}
      if(fault==='dom-click'){await page.evaluate("document.querySelector('.mt-primary').click()");assertTrust({transport:'dom-click',trusted:false,hitVerified:true},await page.audit());}
      else {await page.pointer('.mt-primary');const after=await page.observe();if(after.dialogs!==1)throw new Error('Log did not open');}
    }catch(error){rejected=true;failure=String(error);}finally{await page.dispose();}
    assert.equal(rejected,fault!=='none',`control ${fault}`);const row={fault,rejected,failure};results.push(row);await record(row);
  }
  return results;
}
test('archive streaming positive, injected broken stream and late tar nonzero fail causally',async()=>{
  const {root,journal}=await sandbox();const repo=join(root,'repo');await import('node:fs/promises').then(fs=>fs.mkdir(repo));
  execFileSync('git',['init','--quiet'],{cwd:repo});await writeFile(join(repo,'one.txt'),'archive bytes');execFileSync('git',['add','one.txt'],{cwd:repo});execFileSync('git',['-c','user.name=MET05 qualifier control','-c','user.email=synthetic@example.invalid','-c','core.hooksPath=/dev/null','commit','-qm','qualification only'],{cwd:repo});const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
  await archive(repo,sha,join(root,'valid'),journal,join(root,'valid'));assert.equal(await readFile(join(root,'valid/one.txt'),'utf8'),'archive bytes');
  await assert.rejects(archive(repo,sha,join(root,'broken'),journal,join(root,'broken'),1000,{breakStream:true}),/ARCHIVE/);
  await assert.rejects(archive(repo,sha,join(root,'late'),journal,join(root,'late'),1000,{tarCommand:[process.execPath,'-e',"process.stdin.resume();process.stdin.on('end',()=>{process.stderr.write('late tar failure');process.exit(9)})"]}),/ARCHIVE/);await journal.close();assert.match(await readFile(join(root,'late.tar.stderr.log'),'utf8'),/late tar failure/);assert.match(await readFile(join(root,'journal.jsonl'),'utf8'),/archive-final/);
});
