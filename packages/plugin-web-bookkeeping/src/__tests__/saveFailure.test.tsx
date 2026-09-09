import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { accountScope, generationKey } from '@repo/plugin-web-storage';
import { BookkeepingModule } from '../BookkeepingModule.js';
import { createSeedBookkeepingState, BOOKKEEPING_STATE_KEY, BOOKKEEPING_VIEW_KEY, BOOKKEEPING_STORAGE_EVENT } from '../internal/defaults.js';
import { useBookkeepingState, writeBookkeepingState } from '../internal/storage.js';
let key:string;
beforeEach(()=>{
 const scope=accountScope.activate(accountScope.lock('save-A'),'one');key=accountScope.physicalKey(BOOKKEEPING_STATE_KEY,scope);
 const original=createSeedBookkeepingState();const seed={...original,budgetTotal:100,prefs:{...original.prefs,billsView:'detail' as const}};
 localStorage.setItem(key,JSON.stringify(seed));localStorage.setItem(BOOKKEEPING_VIEW_KEY,'detail');
});
afterEach(()=>vi.restoreAllMocks());
function reject(physical:string) {
 const original=Storage.prototype.setItem;
 return vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===physical)throw new DOMException('quota','QuotaExceededError');original.call(this,k,v);});
}
it('canonical rejection throws in repository and neither advances device mirrors nor dispatches success',()=>{
 const old=localStorage.getItem(key);const listener=vi.fn();window.addEventListener(BOOKKEEPING_STORAGE_EVENT,listener);
 const spy=reject(key);const seed=createSeedBookkeepingState();const proposed={...seed,prefs:{...seed.prefs,billsView:'overview' as const}};
 expect(()=>writeBookkeepingState(proposed)).toThrow('quota');
 expect(localStorage.getItem(key)).toBe(old);expect(localStorage.getItem(BOOKKEEPING_VIEW_KEY)).toBe('detail');
 expect(spy).toHaveBeenCalledTimes(1);expect(listener).not.toHaveBeenCalled();window.removeEventListener(BOOKKEEPING_STORAGE_EVENT,listener);
});
it('retains failed proposal separately, prevents replacement, exports it and retries it once',()=>{
 const {result}=renderHook(()=>useBookkeepingState());const failure=reject(key);
 act(()=>expect(result.current[1](old=>({...old,budgetTotal:200}))).toBe(false));
 expect(result.current[0].budgetTotal).toBe(100);
 expect(result.current[2].pending?.value.budgetTotal).toBe(200);
 expect(JSON.parse(result.current[2].exportDraft()).state.budgetTotal).toBe(200);
 act(()=>expect(result.current[1](old=>({...old,budgetTotal:999}))).toBe(false));
 expect(result.current[2].pending?.value.budgetTotal).toBe(200);
 failure.mockRestore();act(()=>expect(result.current[2].retry()).toBe(true));
 expect(result.current[0].budgetTotal).toBe(200);expect(result.current[2].pending).toBeNull();
});
it('reports partial device failure and retries mirrors without rewriting canonical records',()=>{
 const {result}=renderHook(()=>useBookkeepingState());const failure=reject(BOOKKEEPING_VIEW_KEY);
 act(()=>result.current[1](old=>({...old,budgetTotal:200,prefs:{...old.prefs,billsView:'overview'}})));
 expect(JSON.parse(localStorage.getItem(key)!).budgetTotal).toBe(200);
 expect(result.current[0].budgetTotal).toBe(200);expect(result.current[0].prefs.billsView).toBe('detail');
 expect(result.current[2].pending).toMatchObject({canonicalCommitted:true,failure:'device'});
 failure.mockRestore();const writes=vi.spyOn(Storage.prototype,'setItem');
 act(()=>expect(result.current[2].retry()).toBe(true));
 expect(writes.mock.calls.some(([k])=>k===key)).toBe(false);
 expect(result.current[0].prefs.billsView).toBe('overview');
});
it('rejects a retained A retry/export after switching to B',()=>{
 const {result}=renderHook(()=>useBookkeepingState());const failure=reject(key);
 act(()=>result.current[1](old=>({...old,budgetTotal:200})));failure.mockRestore();
 const retry=result.current[2].retry,exportDraft=result.current[2].exportDraft;
 const b=accountScope.activate(accountScope.lock('save-B'),'one');const bKey=generationKey('save-B','one',BOOKKEEPING_STATE_KEY);localStorage.setItem(bKey,'B sentinel');
 act(()=>expect(retry()).toBe(false));expect(exportDraft).toThrow();expect(localStorage.getItem(bKey)).toBe('B sentinel');expect(accountScope.capture()).toBe(b);
});
it('does not overwrite a newer canonical value on retry',()=>{
 const {result}=renderHook(()=>useBookkeepingState());const failure=reject(key);
 act(()=>result.current[1](old=>({...old,budgetTotal:200})));failure.mockRestore();
 localStorage.setItem(key,'newer bytes');act(()=>expect(result.current[2].retry()).toBe(false));
 expect(localStorage.getItem(key)).toBe('newer bytes');expect(result.current[2].pending?.failure).toBe('conflict');
});
it('record editor keeps complete entered draft, shows recovery, and closes only after retry succeeds',()=>{
 render(<BookkeepingModule lang="zh" />);
 fireEvent.click(screen.getAllByRole('button',{name:/记一笔/})[0]!);
 fireEvent.click(screen.getByRole('button',{name:'1'}));fireEvent.click(screen.getByRole('button',{name:'2'}));
 const note=screen.getByPlaceholderText('点下方模板或手动输入');fireEvent.change(note,{target:{value:'quota lunch draft'}});
 const failure=reject(key);fireEvent.click(screen.getByRole('button',{name:'保存'}));
 expect(note).toHaveValue('quota lunch draft');expect(screen.getByRole('alertdialog')).toHaveTextContent('未能保存');
 expect(screen.getByRole('button',{name:'导出草稿'})).toBeInTheDocument();
 expect(document.querySelector('.bk-workspace')).toHaveAttribute('inert');
 failure.mockRestore();fireEvent.click(screen.getByRole('button',{name:'重试保存'}));
 expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
 expect(screen.queryByRole('heading',{name:'记一笔'})).not.toBeInTheDocument();
 expect(JSON.parse(localStorage.getItem(key)!).tx.filter((row:{note:string})=>row.note==='quota lunch draft')).toHaveLength(1);
});
it.each([
 ['新建账本','账本名称'],['新建账户','账户名称'],['分类与备注','名称'],
])('%s editor retains fields on failure and explicit discard keeps original bytes', (button,label)=>{
 const original=localStorage.getItem(key);render(<BookkeepingModule lang="zh" />);
 fireEvent.click(screen.getByRole('button',{name:button}));
 const field=screen.getByLabelText(label);fireEvent.change(field,{target:{value:'retained editor value'}});
 reject(key);fireEvent.click(screen.getByRole('button',{name:button==='分类与备注'?'保存全部':'保存'}));
 expect(field).toHaveValue('retained editor value');expect(screen.getByRole('alertdialog')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'放弃未保存更改'}));
 expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();expect(localStorage.getItem(key)).toBe(original);
});
it.each([
 ['周期','新建周期','金额','81'],['投资','新增持仓','持有份额','22'],
])('%s editor retains a failed save until retry', (tab,button,label,value)=>{
 render(<BookkeepingModule lang="zh" />);fireEvent.click(within(document.querySelector('.bk-tabs') as HTMLElement).getByRole('button',{name:tab}));
 fireEvent.click(screen.getByRole('button',{name:button}));
 if(tab==='投资') fireEvent.change(screen.getByLabelText('名称'),{target:{value:'draft holding'}});
 const field=screen.getByLabelText(label);fireEvent.change(field,{target:{value}});
 const failure=reject(key);fireEvent.click(screen.getByRole('button',{name:button==='分类与备注'?'保存全部':'保存'}));
 expect(field).toHaveValue(value);expect(screen.getByRole('alertdialog')).toBeInTheDocument();
 failure.mockRestore();fireEvent.click(screen.getByRole('button',{name:'重试保存'}));
 expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
});

it('CSV import keeps parsed rows after a rejected commit and imports only once after retry',async()=>{
 vi.useRealTimers();render(<BookkeepingModule lang="zh" />);
 fireEvent.click(screen.getByRole('button',{name:'导入 / 导出'}));fireEvent.click(screen.getByRole('button',{name:'导入'}));
 const file=new File(['date,time,type,category,sub,amount,currency,account,note\n2026-06-02,12:00,expense,food,,12,CNY,wx,csv retained draft'],'records.csv',{type:'text/csv'});
 fireEvent.change(document.querySelector('input[type="file"]')!,{target:{files:[file]}});
 const confirm=await screen.findByRole('button',{name:'确认导入'});
 const failure=reject(key);fireEvent.click(confirm);
 expect(screen.getByText('csv retained draft')).toBeInTheDocument();expect(screen.getByRole('alertdialog')).toBeInTheDocument();
 failure.mockRestore();fireEvent.click(screen.getByRole('button',{name:'重试保存'}));
 expect(JSON.parse(localStorage.getItem(key)!).tx.filter((row:{note:string})=>row.note==='csv retained draft')).toHaveLength(1);
});

it('inline budget blur preserves entered value and committed bytes when saving fails',()=>{
 render(<BookkeepingModule lang="zh" />);
 fireEvent.click(within(document.querySelector('.bk-tabs') as HTMLElement).getByRole('button',{name:'预算'}));
 fireEvent.click(document.querySelector('.bk-total-val')!);
 const input=document.querySelector('.bk-budget-total-row input')!;
 fireEvent.change(input,{target:{value:'250'}});reject(key);fireEvent.blur(input);
 expect(input).toHaveValue('250');expect(screen.getByRole('alertdialog')).toBeInTheDocument();
 expect(JSON.parse(localStorage.getItem(key)!).budgetTotal).toBe(100);
});
