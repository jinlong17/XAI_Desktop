import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { usePref } from '../internal/usePref.js';
import { accountScope, generationKey } from '../internal/accountScope.js';
let result: ReturnType<typeof usePref<'xai_ai_model_default'>>;
let node: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const key=generationKey('A','fixture','xai_ai_model_default');
function Probe(){result=usePref('xai_ai_model_default');return createElement('output',null,String(result[0]));}
beforeEach(()=>{vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);localStorage.clear();accountScope.activate(accountScope.lock('A'),'fixture');localStorage.setItem(key,JSON.stringify('original'));node=document.createElement('div');document.body.append(node);root=createRoot(node);act(()=>root.render(createElement(Probe)));});
afterEach(()=>{act(()=>root.unmount());node.remove();vi.restoreAllMocks();vi.unstubAllGlobals();localStorage.clear();});
it('returns false after a native quota rejection without changing the committed value',()=>{
 const original=Storage.prototype.setItem;vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this: Storage,k,v){if(k===key)throw new DOMException('Full','QuotaExceededError');return original.call(this,k,v);});
 let ok: boolean|undefined;act(()=>{ok=result[1]('proposed');});expect(ok).toBe(false);expect(result[0]).toBe('original');expect(localStorage.getItem(key)).toBe('"original"');
});
it('returns true and advances consecutive functional writes without a stale render snapshot',()=>{const outcomes:boolean[]=[];act(()=>{outcomes.push(result[1](previous=>previous+'-one'));outcomes.push(result[1](previous=>previous+'-two'));});expect(outcomes).toEqual([true,true]);expect(result[0]).toBe('original-one-two');expect(localStorage.getItem(key)).toBe('"original-one-two"');});
it('a captured setter returns false after the account changes and leaves B untouched',()=>{const setter=result[1];const bKey=generationKey('B','fixture','xai_ai_model_default');localStorage.setItem(bKey,'"B original"');act(()=>accountScope.activate(accountScope.lock('B'),'fixture'));let ok:boolean|undefined;act(()=>{ok=setter('A late value');});expect(ok).toBe(false);expect(localStorage.getItem(key)).toBe('"original"');expect(localStorage.getItem(bKey)).toBe('"B original"');});
