/** Sole runtime entrypoint for BOTH lanes. Root card is an immutable Git blob.
 * Workers validate root-issued reservations locally; they never edit root registries. */
import { execFileSync } from 'node:child_process';
import { readFile, realpath, mkdir, open } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readManifest, sha256, requireThat, assertHash, safeDirectory, durableFile, Owner, admissionUnit, contained } from './driver.mjs';
const HERE=dirname(fileURLToPath(import.meta.url));
const HASH=/^[a-f0-9]{64}$/,SHA=/^[a-f0-9]{40}$/;
function equal(a,b,label) {requireThat(JSON.stringify(a)===JSON.stringify(b),'ADMISSION_BINDING',label);}
export function validateReservation(a,card,m,manifestHash) {
  requireThat(a?.schema==='MET05-root-reservation-v2'&&card?.schema==='MET05-root-card-v2','ADMISSION_SCHEMA','typed root reservation/card');
  requireThat(a.kind==='business'||a.kind==='qualification','ADMISSION_KIND',a.kind);
  requireThat(card.rootActor==='/root'&&a.rootActor===card.rootActor&&card.task==='MET05'&&a.task==='MET05','ROOT_ACTOR','sole root authority');
  equal(card.reservationDigest,sha256(JSON.stringify(a)),'reservation bytes canonical digest');
  requireThat(typeof a.actor==='string'&&!m.actors.excludedForQualification.includes(a.actor)&&a.actor!=='/root','ACTOR','fresh actor excluding all historical authors/reviewers');
  requireThat(a.reservationId===card.reservationId&&/^[a-zA-Z0-9_-]{12,100}$/.test(a.reservationId),'RESERVATION_ID','typed fixed ID');
  equal(a.manifestHash,manifestHash,'manifest');equal(a.productSHA,m.productSHA,'product');equal(a.history.sourceAuthor,m.history.sourceAuthor,'cumulative author history');requireThat(a.history.sourceReviewUsed>=m.history.sourceReview.used+1&&a.history.sourceReviewUsed<=3,'REVIEW_HISTORY','fresh review2 required; retained review1 not reset');
  requireThat(Array.isArray(a.rowIds)&&new Set(a.rowIds).size===a.rowIds.length&&a.rowIds.length>0&&a.rowIds.every(id=>m.rows.some(r=>r.id===id)),'ROW_IDS','finite existing rows');
  const ordered=m.rows.filter(r=>a.rowIds.includes(r.id)).map(r=>r.id);equal(ordered,a.rowIds,'original ordered row membership');equal(card.rowIds,a.rowIds,'root exact lane rows');
  equal(card.requiredArtifacts,a.requiredArtifacts,'exact required lane');equal(card.optionalArtifacts,a.optionalArtifacts,'exact optional lane');
  requireThat(a.requiredArtifacts.every(p=>m.artifacts.includes(p))&&a.optionalArtifacts.every(p=>m.artifacts.includes(p))&&new Set([...a.requiredArtifacts,...a.optionalArtifacts]).size===a.requiredArtifacts.length+a.optionalArtifacts.length,'ARTIFACT_LANE','finite nonoverlapping paths');
  const expected=m.lanes[a.laneId];requireThat(expected&&expected.kind===a.kind,'LANE_ID',a.laneId);equal(a.rowIds,expected.rows,'complete named lane; subset requires separate source-bound lane, not ad hoc filtering');
  equal(a.requiredArtifacts,expected.required,'all mandatory artifacts for lane');equal(a.optionalArtifacts,expected.optional,'finite optional artifacts');
  requireThat(a.outerRoot===card.outerRoot&&a.outputRoot===card.outputRoot&&a.ownerWorktree===card.ownerWorktree&&a.resources.origin===`http://127.0.0.1:${a.resources.port}`&&a.resources.profile===join(a.outputRoot,'chrome-profile'),'OWNERSHIP','registered origin/profile/owned paths');
  requireThat(Number.isSafeInteger(a.resources.port)&&a.resources.port>=1024&&a.resources.port<=65535&&a.resources.deadlineMs>0&&a.resources.deadlineMs<=m.runDeadlineMs,'RESOURCE','finite resource/deadline');
  requireThat(a.consumption?.status==='reserved-and-consumed-at-launch'&&a.consumption?.includesRefusals===true&&a.consumption?.invocation===a.reservationId&&HASH.test(a.consumption.rootLedgerHash),'CONSUMPTION','refusals permanently consumed, never worker resets');
  for(const unit of new Set(a.rowIds.map(id=>m.rows.find(r=>r.id===id).unit)))admissionUnit(unit,a,m);
  requireThat(a.sourceFiles&&Object.keys(a.sourceFiles).length===m.runtimeSourceFiles.length,'SOURCE_FILES','exact source closure');for(const name of m.runtimeSourceFiles)requireThat(HASH.test(a.sourceFiles[name]),'SOURCE_FILES',name);
  requireThat(a.receipts?.sourceReview&&a.receipts.sourceReview.kind==='source-review'&&a.receipts.sourceReview.status==='APPROVED','SOURCE_REVIEW','source currently REVISE: new genuine approval required');
  requireThat(!m.sourceGap||Object.keys(m.sourceGap).length===0,'SOURCE_GAP','precise frozen M5 context gap; business AND qualification prohibited from treating source as approved residual');
  if(a.kind==='business')requireThat(a.receipts.qualification?.status==='QUALIFIED'&&a.receipts.qualificationReview?.status==='APPROVED'&&a.receipts.adoption?.status==='ADOPTED','BUSINESS_GATES','qualified independently reviewed root adopted source');
  if(a.kind==='qualification')requireThat(a.qualificationUnit?.cap===3&&a.qualificationUnit.completeHistory===true&&a.qualificationUnit.total<3&&a.qualificationUnit.history.length===a.qualificationUnit.total&&a.qualificationUnit.history.every(h=>HASH.test(h.receiptHash)),'QUALIFICATION_BUDGET','permanent complete native/control qualification history including refusals');
  return a;
}
export async function verifyReceipt(ref,repo,subject,excluded) {
  requireThat(ref&&SHA.test(ref.commit)&&HASH.test(ref.hash)&&typeof ref.path==='string'&&!ref.path.startsWith('/')&&!ref.path.split('/').includes('..'),'RECEIPT_REF','immutable complete receipt');
  const bytes=execFileSync('git',['show',`${ref.commit}:${ref.path}`],{cwd:repo});assertHash(bytes,ref.hash,'receipt');const receipt=JSON.parse(bytes);requireThat(receipt.schema==='MET05-independent-receipt-v2'&&receipt.kind===ref.kind&&receipt.status===ref.status&&receipt.subject===subject&&receipt.actor===ref.actor&&!excluded.includes(receipt.actor),'RECEIPT_CONTENT','exact independent actor/subject/verdict');return receipt;
}
export async function launch(registrationSHA,cardPath,reservationPath) {
  const repo=await realpath(resolve(HERE,'../../..'));requireThat(SHA.test(registrationSHA)&&typeof cardPath==='string'&&!cardPath.startsWith('/')&&!cardPath.split('/').includes('..'),'ROOT_CARD','immutable registration identity');
  const cardBytes=execFileSync('git',['show',`${registrationSHA}:${cardPath}`],{cwd:repo});const card=JSON.parse(cardBytes);
  // The outer resource is registered independently of the inner evidence root.
  // EEXIST/malformed reservation/journal failure are captured here without overwrite.
  requireThat(card.schema==='MET05-root-card-v2'&&card.rootActor==='/root'&&card.ownerWorktree===repo&&contained(repo,card.outerRoot)&&contained(repo,card.outputRoot),'OUTER_ROOT','registered owner exact paths');
  await safeDirectory(dirname(card.outerRoot),{create:true});await mkdir(card.outerRoot);await safeDirectory(card.outerRoot);const owner=new Owner();let primary=null,result=null;const outer=[];
  try {
    const reservationBytes=await readFile(reservationPath);await durableFile(join(card.outerRoot,'reservation-copy.json'),reservationBytes);
    const manifestBytes=await readFile(join(HERE,'execution-manifest.json'));await durableFile(join(card.outerRoot,'manifest-copy.json'),manifestBytes);const m=JSON.parse(manifestBytes),a=validateReservation(JSON.parse(reservationBytes),card,m,sha256(manifestBytes));
    equal(await realpath(a.ownerWorktree),repo,'owned checkout');for(const [name,hash] of Object.entries(a.sourceFiles))assertHash(await readFile(join(HERE,name)),hash,name);
    const sourceDigest=sha256(JSON.stringify(a.sourceFiles));for(const r of Object.values(a.receipts))await verifyReceipt(r,repo,sourceDigest,r.kind==='adoption'?[]:m.actors.excludedForQualification);
    requireThat(a.receipts.sourceReview.actor!==a.actor,'INDEPENDENCE','qualifier distinct from source reviewer');if(a.receipts.adoption)requireThat(a.receipts.adoption.actor==='/root','ADOPTION_ROOT','sole root adoption');
    for(const tool of [a.tools.node,a.chrome])assertHash(await readFile(await realpath(tool.path)),tool.hash,'tool binary');
    // This claim is local evidence of one consumed root reservation, not a registry edit.
    await safeDirectory(join(repo,a.claimDirectory),{create:true});await durableFile(join(repo,a.claimDirectory,`${a.reservationId}.claim.json`),JSON.stringify({registrationSHA,cardPath,reservation:a.reservationId,consumption:a.consumption,actor:a.actor}));
    await safeDirectory(dirname(a.outputRoot),{create:true});await mkdir(a.outputRoot);await safeDirectory(a.outputRoot);
    if(a.kind==='qualification'){const q=await import('./qualification-runner.mjs');result=await q.runQualification({m,admission:a,root:repo,output:a.outputRoot,owner,launchGuard:{registrationSHA,cardHash:sha256(cardBytes),reservationHash:sha256(reservationBytes)}});}
    else {const driver=await import('./driver.mjs');result=await driver.main({m,admission:a,root:repo,output:a.outputRoot,owner});}
  }catch(e){primary=e;outer.push({stage:'outer-or-inner',error:String(e),code:e.code,stack:e.stack});}
  finally {
    const stopped=await owner.stop();outer.push(...stopped.faults);const status=primary||outer.length?'REFUSED_OR_FAIL':'OBSERVED_PENDING_REVIEW';
    // Terminal file is last: every teardown/journal/finalize error propagates into it.
    await durableFile(join(card.outerRoot,'stdout.log'),result?JSON.stringify(result)+'\n':'');await durableFile(join(card.outerRoot,'stderr.log'),outer.map(r=>JSON.stringify(r)).join('\n')+'\n');
    const hashes=[];for(const name of ['reservation-copy.json','manifest-copy.json','stdout.log','stderr.log'])try{const bytes=await readFile(join(card.outerRoot,name));hashes.push({name,hash:sha256(bytes),bytes:bytes.length});}catch(e){outer.push({stage:'outer-missing',name,error:String(e)});}
    await durableFile(join(card.outerRoot,'terminal.json'),JSON.stringify({status:outer.length?'REFUSED_OR_FAIL':status,registrationSHA,cardPath,consumption:card.reservationId,primary:primary&&String(primary),faults:outer,quarantined:stopped.quarantined,hashes},null,2));
  }
  requireThat(!primary&&!outer.length,'OUTER_FAILURE',JSON.stringify(outer));return result;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))launch(...process.argv.slice(2)).catch(e=>{process.stderr.write(`${e.stack}\n`);process.exitCode=1;});
