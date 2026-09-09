import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {renderHook,act,cleanup} from '@testing-library/react';
import {accountScope,usePref,setCanonicalCommandActivationForTests} from '@repo/plugin-web-storage';
beforeEach(()=>{localStorage.clear();accountScope.activate(accountScope.lock('reset-outcome'),'g1');setCanonicalCommandActivationForTests(false);});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('reset must preserve local state if the removal read and its outcome read fail after a successful preflight',async()=>{
 const physical=accountScope.physicalKey('xai_calendar_events');const data={e1:{title:'Keep legacy bytes'}};const raw=JSON.stringify(data);localStorage.setItem(physical,raw);
 const {result}=renderHook(()=>usePref('xai_calendar_events'));const native=Storage.prototype.getItem;let reads=0;
 vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(k){if(k===physical&&++reads>=2)throw new DOMException('denied','SecurityError');return native.call(this,k);});
 const remove=vi.spyOn(Storage.prototype,'removeItem');await act(async()=>result.current[2].reset());
 console.log('reset-failed-read',JSON.stringify({reads,removeCalls:remove.mock.calls.length,localValue:result.current[0],isDefault:result.current[2].isDefault}));
 expect(remove).not.toHaveBeenCalled();vi.restoreAllMocks();expect(localStorage.getItem(physical)).toBe(raw);expect.soft(result.current[0]).toEqual(data);expect(result.current[2].isDefault).toBe(false);
});
it('a readable legacy removal still resets only after actual successful removal',async()=>{
 const physical=accountScope.physicalKey('xai_calendar_events');localStorage.setItem(physical,JSON.stringify({e1:{title:'Legacy'}}));
 const {result}=renderHook(()=>usePref('xai_calendar_events'));await act(async()=>result.current[2].reset());expect(localStorage.getItem(physical)).toBeNull();expect(result.current[0]).toEqual({});expect(result.current[2].isDefault).toBe(true);
});
