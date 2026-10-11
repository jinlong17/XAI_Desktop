import {act,renderHook,render,screen,fireEvent} from '@testing-library/react';
import {beforeEach,it,expect,vi} from 'vitest';
import {makeDefaultBoards,createBoardStorageEnvelope,readBoardStorage} from '@repo/plugin-web-board-core';
import {accountScope} from '@repo/plugin-web-storage';
import {useBoardDetailSaveRecovery} from '../../../packages/plugin-web-board-workspaces/src/internal/useBoardDetailSaveRecovery';
import {BoardWorkspacesModule} from '../../../packages/plugin-web-board-workspaces/src/BoardWorkspacesModule';
vi.mock('@repo/xai-web-event-bus',()=>({emitWebEvent:vi.fn(),onWebEvent:vi.fn(()=>()=>{}),useWebEventListener:vi.fn()}));
const target={boardId:'b-default',listId:'b-backlog',cardId:'bc1'};
const key=()=>accountScope.physicalKey('xai_boards_v2');
const card=(boards:any[])=>boards[0].lists[0].cards[0];
function seed(){const initial=createBoardStorageEnvelope(makeDefaultBoards(),{migratedAt:'2026-09-09T00:00:00.000Z'});localStorage.setItem(key(),JSON.stringify(initial));return initial;}
beforeEach(()=>{localStorage.clear();accountScope.activate(accountScope.lock('consumer-test'),'fixture');});
it.each(['checklist','attachment','activity'])('independent %s oracle: two rejected physical writes; latest append only; all other canonical data unchanged; no duplicate on repeat retry',kind=>{
 const original=seed(); const raw=localStorage.getItem(key()); let fails=2; const native=Storage.prototype.setItem;
 const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(k,v){if(k===key() && fails-->0)throw new DOMException('quota','QuotaExceededError');native.call(this,k,v);});
 const save=vi.fn((v:unknown)=>{try{localStorage.setItem(key(),JSON.stringify(v));return true;}catch{return false;}});
 const {result}=renderHook(()=>useBoardDetailSaveRecovery(save));
 const draft:any=kind==='checklist'?{kind,text:'early'}:kind==='attachment'?{kind,providerId:'github',url:'https://github.com/acme/early',title:'early'}:{kind,body:'early',authorName:'Independent'};
 act(()=>expect(result.current.submit(target,draft)).toBe(false));
 const proposal=result.current.pending!;const latest:any=kind==='checklist'?{kind,text:' final independent '}:kind==='attachment'?{kind,providerId:'linear',url:'https://linear.app/acme/issue/X-42',title:'final independent'}:{...draft,body:' final independent '};
 act(()=>{result.current.updateDraft(target,latest);expect(result.current.retry()).toBe(false);});
 expect(localStorage.getItem(key())).toBe(raw);expect(result.current.pending?.proposalId).toBe(proposal.proposalId);
 act(()=>expect(result.current.retry()).toBe(true));
 const actual=JSON.parse(localStorage.getItem(key())!); const parsed=readBoardStorage(actual);expect(parsed.status).toBe('valid');if(parsed.status!=='valid')throw Error('invalid');
 const field=kind==='checklist'?'checklistItems':kind==='attachment'?'attachments':'activity';
 const rows=(card(parsed.boards) as any)[field];const entry=rows.find((e:any)=>e.id===proposal.proposalId);expect(rows.filter((e:any)=>e.id===proposal.proposalId)).toHaveLength(1);
 if(kind==='attachment')expect(entry).toMatchObject({title:latest.title,url:latest.url,source:{providerId:'linear'}});else expect(entry[kind==='checklist'?'text':'body']).toBe('final independent');
 if(kind==='activity')expect(entry.createdAt).toBe(proposal.createdAt);
 const expected=JSON.parse(JSON.stringify(original));const expectedRead=readBoardStorage(expected);if(expectedRead.status!=='valid')throw Error('invalid');
 // Remove exactly the proposed entry, then compare whole persisted envelope against baseline.
 const originalRows=(card(expectedRead.boards) as any)[field];
 (card(parsed.boards) as any)[field]=rows.filter((e:any)=>e.id!==proposal.proposalId);
 if(originalRows===undefined){
 if(kind==='checklist')expect(rows.filter((e:any)=>e.id!==proposal.proposalId)).toEqual(Array.from({length:card(expectedRead.boards).checklist.total},(_,i)=>({id:`legacy-bc1-${i+1}`,text:`Item ${i+1}`,done:i<card(expectedRead.boards).checklist.done})));
 delete (card(parsed.boards) as any)[field];
 }
 // The fixture has a legacy checklist counter. The append must increment only total.
 if(kind==='checklist'){
 expect(card(parsed.boards).checklist).toEqual({...card(expectedRead.boards).checklist,total:card(expectedRead.boards).checklist.total+1});
 card(parsed.boards).checklist=card(expectedRead.boards).checklist;
 }
 expect(parsed.boards).toEqual(expectedRead.boards);
 expect({...actual,boards:undefined}).toEqual({...expected,boards:undefined});
 const committed=localStorage.getItem(key());act(()=>expect(result.current.retry()).toBe(false));expect(localStorage.getItem(key())).toBe(committed);expect(save).toHaveBeenCalledTimes(3);fault.mockRestore();
});
it('proposal collision preserves external data and draft; discard does not persist',()=>{
 seed();const save=vi.fn(()=>false);const {result}=renderHook(()=>useBoardDetailSaveRecovery(save));act(()=>{result.current.submit(target,{kind:'activity',body:'mine',authorName:'Me'});});
 const id=result.current.pending!.proposalId;const external:any=makeDefaultBoards();card(external).activity=[{id,type:'comment',body:'external conflict',createdAt:result.current.pending!.createdAt,authorId:'local-user',authorName:'Me'}];
 const raw=JSON.stringify(external);localStorage.setItem(key(),raw);act(()=>expect(result.current.retry()).toBe(false));expect(result.current.pending?.proposalId).toBe(id);expect(localStorage.getItem(key())).toBe(raw);
 act(()=>result.current.discard());expect(result.current.pending).toBeNull();expect(localStorage.getItem(key())).toBe(raw);expect(save).toHaveBeenCalledOnce();
});
it('discard clears only failed append, retains other typed input, never appends via close',()=>{
 seed();render(<BoardWorkspacesModule lang="en"/>);fireEvent.click(screen.getAllByTestId('board-card')[0]);const native=Storage.prototype.setItem;
 const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(k,v){if(k===key())throw new DOMException('quota','QuotaExceededError');native.call(this,k,v);});
 fireEvent.change(screen.getByTestId('card-detail-checklist-input'),{target:{value:'discard me'}});fireEvent.click(screen.getByTestId('card-detail-checklist-add'));fault.mockRestore();
 const raw=localStorage.getItem(key());fireEvent.change(screen.getByTestId('card-detail-activity-input'),{target:{value:'other untouched text'}});fireEvent.click(screen.getByTestId('card-detail-discard-draft'));
 expect(screen.getByTestId('card-detail-checklist-input')).toHaveValue('');expect(screen.getByTestId('card-detail-activity-input')).toHaveValue('other untouched text');expect(screen.queryByTestId('card-detail-save-recovery')).toBeNull();fireEvent.click(screen.getByTestId('card-detail-close'));expect(localStorage.getItem(key())).toBe(raw);
});
it.each(['table','calendar','timeline'])('real %s view callback persists intended patch without losing unrelated board data',view=>{
 const boards:any=makeDefaultBoards();const d=new Date();const iso=(offset:number)=>{const n=new Date(d);n.setDate(n.getDate()+offset);return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;};
 boards[0].lists[0].cards=[card(boards)];card(boards).dueDate=iso(2);card(boards).startDate=iso(1);localStorage.setItem(key(),JSON.stringify(boards));localStorage.setItem(accountScope.physicalKey('xai_board_view_by_id'),JSON.stringify({'b-default':view}));
 render(<BoardWorkspacesModule lang="en"/>);
 const mountedBaseline=JSON.parse(localStorage.getItem(key())!);
 if(view==='table'){fireEvent.click(screen.getAllByTestId('td-priority')[0]);fireEvent.click(screen.getByTestId('priority-set-high'));}
 if(view==='calendar'){fireEvent.drop(screen.getByTestId('cal-cell-15'),{dataTransfer:{getData:()=>JSON.stringify({cardId:'bc1',listId:'b-backlog'})}});}
 if(view==='timeline'){
 vi.spyOn(Element.prototype,'getBoundingClientRect').mockReturnValue({width:900,height:48,left:0,top:0,right:900,bottom:48,x:0,y:0,toJSON:()=>({})});
 const event=(el:EventTarget,type:string,x:number)=>{const e=new Event(type,{bubbles:true});Object.defineProperty(e,'clientX',{value:x});fireEvent(el,e);};
 event(screen.getAllByTestId('tl-bar-body')[0],'pointerdown',100);event(window,'pointermove',130);event(window,'pointerup',130);
 }
 const parsed=readBoardStorage(JSON.parse(localStorage.getItem(key())!));expect(parsed.status).toBe('valid');if(parsed.status!=='valid')throw Error('invalid');
 const expected=JSON.parse(JSON.stringify(mountedBaseline));
 if(view==='table')card(expected).priority='high';
 if(view==='calendar')card(expected).dueDate=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-15`;
 if(view==='timeline'){card(expected).dueDate=iso(3);card(expected).startDate=iso(2);const start=iso(2).split('-');card(expected).start=`${Number(start[1])}/${Number(start[2])}`;}
 if(view!=='table'){const due=card(expected).dueDate.split('-');card(expected).due=`${Number(due[1])}/${Number(due[2])}`;card(expected).dueLate=false;}
 expect(parsed.boards).toEqual(expected);
});
