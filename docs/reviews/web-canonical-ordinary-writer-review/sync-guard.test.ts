import {afterEach,expect,it} from 'vitest';
import {accountScope,generationMarkerKey} from '../../../packages/plugin-web-storage/src/internal/accountScope.js';
import {setCanonicalCommandActivationForTests} from '../../../packages/plugin-web-storage/src/internal/canonicalCommandState.js';
import {setPref,removePref} from '../../../packages/plugin-web-storage/src/internal/storage.js';
const next={inserted:{id:'inserted',title:'Bypass',startISO:'2026-09-09T09:00',endISO:'2026-09-09T10:00',colorPreset:'mint',recurrence:null,createdAt:'2026-09-09T00:00:00Z',updatedAt:'2026-09-09T00:00:00Z'}} as const;
function setup(enabled:boolean,raw:string|null){
 const scope=accountScope.activate(accountScope.lock('sync-guard-review'),'g');
 localStorage.setItem(generationMarkerKey('sync-guard-review'),JSON.stringify({generation:'g',migrationId:'review',previous:null}));
 const key=accountScope.physicalKey('xai_calendar_events',scope);
 if(raw!==null)localStorage.setItem(key,raw);
 setCanonicalCommandActivationForTests(enabled);
 return {scope,key};
}
afterEach(()=>{setCanonicalCommandActivationForTests(false);localStorage.clear();});
for(const raw of [null,'{}'])it(`activated synchronous setter must refuse ${raw===null?'physical absence':'legacy domain'} without writing`,()=>{
 const {scope,key}=setup(true,raw);
 expect.soft(setPref('xai_calendar_events',next,scope)).toBe(false);
 expect(localStorage.getItem(key)).toBe(raw);
});
it('activated synchronous removal must refuse legacy domain',()=>{
 const {scope,key}=setup(true,'{}');
 removePref('xai_calendar_events',scope);
 expect(localStorage.getItem(key)).toBe('{}');
});
it('disabled protocol retains the existing legacy setter positive control',()=>{
 const {scope,key}=setup(false,'{}');
 expect(setPref('xai_calendar_events',next,scope)).toBe(true);
 expect(localStorage.getItem(key)).toBe(JSON.stringify(next));
});
