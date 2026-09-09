import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AccountStorageGate } from '../../../apps/web/src/providers/AccountStorageGate.js';
import { accountScope, generationMarkerKey } from '../../../packages/plugin-web-storage/src/index.js';
const auth = vi.hoisted(()=>({ refreshSession:vi.fn(async()=>({user:{id:'A'}})), session:{user:{id:'A'}},state:'authenticated' }));
vi.mock('@repo/web-auth-device-session/web',()=>({useWebAuthSession:()=>auth}));
const secretHooks = vi.hoisted(()=>({stage:vi.fn(async()=>{}),verify:vi.fn(async()=>{})}));
vi.mock('@repo/plugin-web-ai-chat',()=>({aiSecretMigrationParticipant:secretHooks}));
let root:Root, container:HTMLDivElement;
beforeEach(()=>{
 (globalThis as unknown as {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
 localStorage.clear();accountScope.lock();auth.refreshSession.mockClear();secretHooks.stage.mockReset();secretHooks.stage.mockResolvedValue(undefined);
 Object.defineProperty(navigator,'locks',{configurable:true,value:{request:async(_name:string,run:()=>Promise<unknown>)=>run()}});
 container=document.createElement('div');document.body.append(container);root=createRoot(container);
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();});
async function show(){await act(async()=>root.render(<AccountStorageGate><p data-private>A workspace</p></AccountStorageGate>));}
async function remote(id:string|null){await act(async()=>{window.dispatchEvent(new StorageEvent('storage',{key:'xai:auth:identity-change',newValue:JSON.stringify({accountId:id,nonce:'remote'})}));});}
it('same-account tab metadata preserves an already open workspace',async()=>{
 localStorage.setItem(generationMarkerKey('A'),JSON.stringify({generation:'g1',migrationId:'g1',previous:null}));
 await show();expect(container.querySelector('[data-private]')).not.toBeNull();const scope=accountScope.capture();
 await remote('A');expect(accountScope.capture()).toBe(scope);expect(container.querySelector('[data-private]')).not.toBeNull();
});
it('same-account tab metadata does not revoke a migration transition',async()=>{
 await show();const transition=accountScope.capture();expect(transition.kind).toBe('locked');expect(transition.accountId).toBe('A');
 await remote('A');expect(accountScope.capture()).toBe(transition);
});
it('different-account tab metadata hides old contents until auth confirms the identity',async()=>{
 localStorage.setItem(generationMarkerKey('A'),JSON.stringify({generation:'g1',migrationId:'g1',previous:null}));
 await show();await remote('B');expect(container.querySelector('[data-private]')).toBeNull();expect(accountScope.capture().kind).toBe('locked');expect(auth.refreshSession).toHaveBeenCalledOnce();
});

it('same-account announcement during secret staging completes the original migration',async()=>{
 let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});
 secretHooks.stage.mockImplementationOnce(()=>pending);
 await show();const token=accountScope.capture();
 await act(async()=>{Array.from(container.querySelectorAll('button')).find(b=>b.textContent==='Start without importing')!.click();});
 expect(secretHooks.stage).toHaveBeenCalledOnce();expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
 await remote('A');expect(accountScope.capture()).toBe(token);
 await act(async()=>{release();await pending;});
 expect(container.textContent).toContain('Your choice is saved');
 await act(async()=>{Array.from(container.querySelectorAll('button')).find(b=>b.textContent==='Continue to workspace')!.click();});
 expect(container.querySelector('[data-private]')).not.toBeNull();expect(accountScope.capture().kind).toBe('account');
});
