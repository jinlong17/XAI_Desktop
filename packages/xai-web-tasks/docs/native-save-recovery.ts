import React from '../node_modules/react';
import { createRoot } from '../node_modules/react-dom/client';
import type { TaskCol } from '../src/types';
import { TasksModule } from '../src/TasksModule';
import { SEED_TASK_COLS } from '../src/internal/seed/tasksMock';
import { accountScope, generationKey, generationMarkerKey } from '../../plugin-web-storage/src/index';
const wait = () => new Promise(resolve => setTimeout(resolve, 100));
const assert = (value: unknown, message: string) => { if (!value) throw Error(message); };
const key = (account: string) => generationKey(account, 'fixture', 'xai_task_cols');
const originalSet = Storage.prototype.setItem;
let blocked = false;
Storage.prototype.setItem = function(k, v) {
  if (blocked && this === localStorage && k === key('A')) throw new DOMException('Synthetic full quota', 'QuotaExceededError');
  return originalSet.call(this, k, v);
};
const container = document.createElement('main'); document.body.append(container);
const root = createRoot(container);
const click = (selector: string) => { const button=container.querySelector(selector) as HTMLButtonElement; assert(button, `Missing ${selector}`); button.click(); };
const title = async (value: string) => {
  const input=container.querySelector('#task-composer-title-input') as HTMLInputElement;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input,value);
  input.dispatchEvent(new Event('input',{bubbles:true})); await wait();
};
async function run() {
  localStorage.setItem(generationMarkerKey('A'),JSON.stringify({generation:'fixture',migrationId:'fixture',previous:null}));
  accountScope.activate(accountScope.lock('A'),'fixture'); localStorage.setItem(key('A'),JSON.stringify(SEED_TASK_COLS));
  root.render(React.createElement(TasksModule,{lang:'en'})); await wait();
  click('.icon-btn[aria-label="Add"]'); await wait(); await title('Native failed draft');
  const before=localStorage.getItem(key('A')); blocked=true; click('.task-composer__btn--primary'); await wait();
  assert(localStorage.getItem(key('A'))===before,'Quota failure changed committed data');
  assert(container.querySelector('dialog')?.hasAttribute('open'),'Failed save closed the composer');
  assert(container.querySelector('[role="alert"]'),'Failure is not visible');
  await title('Latest native draft');
  // Inspect the actual generated Blob URL; prevent a probe download outside its temp profile.
  const nativeClick=HTMLAnchorElement.prototype.click; let exported: unknown=null;
  HTMLAnchorElement.prototype.click=function(){void fetch(this.href).then(response=>response.json()).then(value=>{exported=value;});};
  try {
    const button=[...container.querySelectorAll('button')].find(button=>button.textContent==='Export draft');assert(button,'Export control missing');button!.click();await wait();
    assert((exported as {draft?:{title?:string}} | null)?.draft?.title==='Latest native draft','Export omitted latest form edits');
  } finally { HTMLAnchorElement.prototype.click=nativeClick; }
  blocked=false;click('.task-composer__btn--primary');await wait();
  const cards=(JSON.parse(localStorage.getItem(key('A'))!) as TaskCol[]).flatMap(column=>column.tasks);
  assert(cards.filter(card=>card.title.en==='Latest native draft').length===1,'Retry did not create exactly one task');
  assert(!container.querySelector('dialog')?.hasAttribute('open'),'Successful save did not close');
  click('.icon-btn[aria-label="Add"]');await wait();await title('A pending private task');blocked=true;click('.task-composer__btn--primary');await wait();blocked=false;
  localStorage.setItem(key('B'),'B original bytes');accountScope.activate(accountScope.lock('B'),'fixture');await wait();click('.task-composer__btn--primary');await wait();
  assert(localStorage.getItem(key('B'))==='B original bytes','Old retry wrote to B');
  assert(!localStorage.getItem(key('A'))!.includes('A pending private task'),'Revoked retry wrote to A');
  return {pass:true,checks:['native quota preserves committed bytes and editor','visible failure and latest-draft Blob export','successful retry creates one task and closes','account switch revokes old retry']};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:'FAIL '+error.stack})).finally(()=>{Storage.prototype.setItem=originalSet;root.unmount();});
