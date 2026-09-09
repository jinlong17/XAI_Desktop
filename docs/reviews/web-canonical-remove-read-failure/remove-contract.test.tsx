import { afterEach, expect, it, vi } from 'vitest';
import { accountScope } from '../../../packages/plugin-web-storage/src/internal/accountScope.js';
import { removePref } from '../../../packages/plugin-web-storage/src/internal/storage.js';
afterEach(()=>{vi.restoreAllMocks();localStorage.clear();});
for(const denied of [true,false])it(denied?'failed read must not authorize canonical removal':'readable envelope refuses legacy removal',()=>{
 const owner=accountScope.activate(accountScope.lock('remove-review'),'g');
 const key=accountScope.physicalKey('xai_task_cols',owner);
 const raw=JSON.stringify({format:'xai-command-state',version:1,revision:1,data:[],receipts:{request:{operationVersion:1,signature:'create',result:{ok:true,targetId:'task'},committedAt:'2026-09-09T00:00:00Z'}}});
 localStorage.setItem(key,raw);const get=Storage.prototype.getItem;const remove=Storage.prototype.removeItem;
 let attempts=0;vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(this:Storage,k){if(denied&&k===key)throw new DOMException('read denied','SecurityError');return get.call(this,k);});
 vi.spyOn(Storage.prototype,'removeItem').mockImplementation(function(this:Storage,k){if(k===key)attempts++;return remove.call(this,k);});
 removePref('xai_task_cols',owner);
 expect.soft(attempts).toBe(0);expect(get.call(localStorage,key)).toBe(raw);
});
