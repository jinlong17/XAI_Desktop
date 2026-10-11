/** Correctness regressions: expected to FAIL until REL-05 is fixed. No storage adapter mocks. */
import React from '../../../packages/xai-web-tasks/node_modules/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,renderHook} from '../../../packages/xai-web-tasks/node_modules/@testing-library/react';
import {TasksModule} from '../../../packages/xai-web-tasks/src/TasksModule';
import {SEED_TASK_COLS} from '../../../packages/xai-web-tasks/src/internal/seed/tasksMock';
import {accountScope,generationKey,generationMarkerKey} from '../../../packages/plugin-web-storage/src/index';
import {createSeedBookkeepingState} from '../../../packages/plugin-web-bookkeeping/src/internal/defaults';
import {useBookkeepingState} from '../../../packages/plugin-web-bookkeeping/src/internal/storage';
const account='rel05-independent-A';
const physical=(key:string)=>generationKey(account,'fixture',key);
const bKey=generationKey('rel05-independent-B','fixture','xai_bk_state_v2');
beforeEach(()=>{localStorage.clear();const t=accountScope.lock(account);localStorage.setItem(generationMarkerKey(account),JSON.stringify({generation:'fixture',migrationId:'fixture',previous:null}));accountScope.activate(t,'fixture');localStorage.setItem(bKey,'B original bytes');HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};});
afterEach(()=>{vi.restoreAllMocks();cleanup();localStorage.clear();});
function rejectWrite(key:string){const original=Storage.prototype.setItem;return vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(k,v){if(this===localStorage&&k===key)throw new DOMException('Synthetic full quota','QuotaExceededError');return original.call(this,k,v);});}
it('Tasks retains the open composer and draft when native Storage rejects its write',()=>{
 const raw=JSON.stringify(SEED_TASK_COLS);localStorage.setItem(physical('xai_task_cols'),raw);render(React.createElement(TasksModule,{lang:'en'}));
 fireEvent.click(document.querySelector('.icon-btn[aria-label="Add"]')!);const title=document.querySelector('#task-composer-title-input')!;fireEvent.change(title,{target:{value:'REL05 unrecoverable draft'}});
 const committedBefore=localStorage.getItem(physical('xai_task_cols'));rejectWrite(physical('xai_task_cols'));fireEvent.click(document.querySelector('.task-composer__btn--primary')!);
 expect(localStorage.getItem(physical('xai_task_cols'))).toBe(committedBefore);expect(localStorage.getItem(bKey)).toBe('B original bytes');
 const dialog=document.querySelector('dialog.task-composer');console.log('REL05 Tasks observed',JSON.stringify({persistedUnchanged:true,composerOpen:!!dialog?.hasAttribute('open'),draft:(document.querySelector('#task-composer-title-input') as HTMLInputElement|null)?.value??null,visibleFailure:!!document.querySelector('[role="alert"]')}));
 expect(dialog?.hasAttribute('open'),'Failed Save must keep editor open').toBe(true);expect((document.querySelector('#task-composer-title-input') as HTMLInputElement).value).toBe('REL05 unrecoverable draft');
});
it('Bookkeeping does not publish proposed business state when its canonical native write fails',()=>{
 const initial=createSeedBookkeepingState();initial.budgetTotal=100;initial.prefs={...initial.prefs,billsView:'detail'};const raw=JSON.stringify(initial);localStorage.setItem(physical('xai_bk_state_v2'),raw);localStorage.setItem('xai_bk_view','detail');
 const {result}=renderHook(()=>useBookkeepingState());rejectWrite(physical('xai_bk_state_v2'));
 act(()=>result.current[1](previous=>({...previous,budgetTotal:200,prefs:{...previous.prefs,billsView:'overview'}})));
 expect(localStorage.getItem(physical('xai_bk_state_v2'))).toBe(raw);expect(localStorage.getItem(bKey)).toBe('B original bytes');
 console.log('REL05 Bookkeeping observed',JSON.stringify({persistedBudget:JSON.parse(localStorage.getItem(physical('xai_bk_state_v2'))!).budgetTotal,renderedBudget:result.current[0].budgetTotal,deviceView:localStorage.getItem('xai_bk_view')}));
 expect(result.current[0].budgetTotal,'Failed write must not be published as committed balance').toBe(100);expect(localStorage.getItem('xai_bk_view'),'Canonical failure must not silently publish ancillary layout writes').toBe('detail');
});
