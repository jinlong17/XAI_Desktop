import { join } from 'node:path';
import { mkdir, readFile } from 'node:fs/promises';
import { requireThat, Owner, Journal, Artifacts, durableFile, sha256, Refusal } from './driver.mjs';
/** No direct argv entrypoint. A fresh, source-bound typed root launch guard is mandatory. */
export async function runQualification(context) {
  const {m,admission,output,owner,launchGuard}=context;
  requireThat(admission.kind==='qualification'&&launchGuard?.registrationSHA&&launchGuard?.cardHash&&launchGuard?.reservationHash,'QUALIFICATION_GUARD','launch.mjs exact root admission required');
  const artifacts=new Artifacts(output,admission.requiredArtifacts,admission.optionalArtifacts,owner),journal=await Journal.create(join(output,'journal.jsonl'),owner);const records=[];let primary=null;const failures=[];
  async function paired(id,expected,scenario) {
    requireThat(m.controlCases.includes(id),'CONTROL_ID',id);let positive;try{positive=await scenario(false);}catch(e){throw new Refusal('CONTROL_POSITIVE_FAILED',`${id}: ${e.stack}`);}
    const yes={id,side:'positive',status:'OBSERVED_PENDING_REVIEW',value:positive};await artifacts.write(`controls/${id}.positive.json`,JSON.stringify(yes,null,2));records.push(yes);
    let actual=null;try{await scenario(true);}catch(e){actual=e;}
    requireThat(actual&&actual.code===expected.code&&actual.stage===expected.stage&&actual.faultId===expected.faultId&&actual.value!==undefined&&Number.isFinite(actual.counter)&&actual.counter>0,'CONTROL_UNRELATED',`${id}: expected ${JSON.stringify(expected)}, got ${actual?.stack??'no rejection'}`);
    const no={id,side:'negative',status:'CAUSAL_REJECTION_PENDING_REVIEW',expected,actual:{code:actual.code,stage:actual.stage,faultId:actual.faultId,value:actual.value,counter:actual.counter,error:String(actual)}};await artifacts.write(`controls/${id}.negative.json`,JSON.stringify(no,null,2));records.push(no);await journal.record('paired-causal-control',{positive:yes,negative:no});
  }
  try {
    await mkdir(join(output,'controls-scratch'));await mkdir(join(output,'chrome-profile'));await artifacts.write('admission-copy.json',JSON.stringify(admission,null,2));
    const node=await import('./qualification-controls.test.mjs');const staticResult=await node.runControls({...context,journal,artifacts},paired);
    const browser=await import('./browser-controls.mjs');const browserResult=await browser.browserQualification({...context,journal,artifacts},paired);
    const complete=m.controlCases.every(id=>records.filter(r=>r.id===id).length===2);const gaps=[...staticResult.sourceGaps,...browserResult.missing];
    requireThat(complete&&gaps.length===0,'QUALIFICATION_SOURCE_GAP','missing actual-path pairs or source implementation',{stage:'qualification-completeness',faultId:'control-source-gap',value:{complete,gaps,missing:m.controlCases.filter(id=>!records.some(r=>r.id===id))},counter:gaps.length});
  }catch(e){primary=e;failures.push({stage:'work',error:String(e),code:e.code});}
  finally {
    const terminal=await owner.stop();failures.push(...terminal.faults);try{await journal.record('qualification-terminal',{primary:primary&&String(primary),failures,records:records.length});}catch(e){failures.push({stage:'journal-flush',error:String(e)});}try{await journal.close();}catch(e){failures.push({stage:'journal-close',error:String(e)});}
    const census=await artifacts.census({scratch:['controls-scratch','chrome-profile'],exclude:['artifact-index.json','final-outcome.json','qualification-controls.json']}).catch(e=>({complete:false,error:String(e)}));if(!census.complete)failures.push({stage:'artifacts',census});
    // Final durability errors propagate to the outer launcher; never a stale qualified file.
    await durableFile(join(output,'qualification-controls.json'),JSON.stringify({status:'UNQUALIFIED_PENDING_INDEPENDENT_REVIEW',records,failures},null,2));await durableFile(join(output,'artifact-index.json'),JSON.stringify(census,null,2));await durableFile(join(output,'final-outcome.json'),JSON.stringify({status:failures.length?'REFUSED_OR_FAIL':'OBSERVED_PENDING_REVIEW',failures,quarantined:terminal.quarantined},null,2));
  }
  requireThat(!primary&&!failures.length,'QUALIFICATION_FAILED',JSON.stringify(failures));return {records,hash:sha256(JSON.stringify(records)),status:'OBSERVED_PENDING_INDEPENDENT_REVIEW'};
}
