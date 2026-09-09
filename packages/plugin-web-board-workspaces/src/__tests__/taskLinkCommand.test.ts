import {it,expect,vi} from 'vitest';
import {accountScope} from '@repo/plugin-web-storage';
import {makeDefaultBoards,archiveCard,restoreCard,moveCardToList,archiveList,restoreList} from '@repo/plugin-web-board-core';
import type {Board,BoardCardData} from '@repo/plugin-web-board-core';
import {loadTaskColsOrSeed} from '@repo/plugin-web-tasks';
import type {TaskCol,TaskCard} from '@repo/plugin-web-tasks';
import {ensureBoardTaskLink} from '../internal/taskLinkCommand.js';
const boardKey=()=>accountScope.physicalKey('xai_boards_v2'),taskKey=()=>accountScope.physicalKey('xai_task_cols');
function seed(){localStorage.setItem(boardKey(),JSON.stringify(makeDefaultBoards()));}
function card():BoardCardData{return (JSON.parse(localStorage.getItem(boardKey())!) as Board[])[0]!.lists.flatMap(l=>l.cards).find(c=>c.id==='bc1')!;}
function task():TaskCard{return (JSON.parse(localStorage.getItem(taskKey())!) as TaskCol[]).flatMap(c=>[...c.tasks,...(c.completed??[])]).find(t=>t.source?.cardId==='bc1')!;}
it.each(['intent','task','acknowledgement'] as const)('%s write failure is honest and retry resumes the retained intent exactly once',phase=>{
 seed();const scope=accountScope.capture(),native=Storage.prototype.setItem;let boardsWrites=0;
 const fail=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key,value){if(key===boardKey())boardsWrites++;if((phase==='intent'&&key===boardKey())||(phase==='task'&&key===taskKey())||(phase==='acknowledgement'&&key===boardKey()&&boardsWrites===2))throw new DOMException('quota','QuotaExceededError');native.call(this,key,value)});
 const result=ensureBoardTaskLink('b-default','bc1',scope);expect(result).toMatchObject({ok:false,phase});
 if(phase==='intent'){expect(card().taskLink).toBeUndefined();expect(localStorage.getItem(taskKey())).toBeNull();}
 else{expect(card().taskLink!.pending).toBeDefined();if(phase==='task')expect(localStorage.getItem(taskKey())).toBeNull();else expect(task()).toBeDefined();}
 fail.mockRestore();const saved=phase==='acknowledgement'?task():null;
 expect(ensureBoardTaskLink('b-default','bc1',scope)).toEqual({ok:true});expect(card().taskLink!.pending).toBeUndefined();if(saved)expect(task()).toEqual(saved);
 expect((JSON.parse(localStorage.getItem(taskKey())!) as TaskCol[]).flatMap(c=>c.tasks).filter(t=>t.source?.cardId==='bc1')).toHaveLength(1);
});
it('pending link follows stable card through move and card/list archive restoration',()=>{
 seed();const scope=accountScope.capture(),native=Storage.prototype.setItem;const fail=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===taskKey())throw Error('quota');native.call(this,k,v)});ensureBoardTaskLink('b-default','bc1',scope);fail.mockRestore();
 const boards=JSON.parse(localStorage.getItem(boardKey())!) as Board[],board=boards[0]!,original=card().taskLink!;
 const target=board.lists[1]!.id;
 board.lists=moveCardToList(board.lists,'bc1','b-backlog',target);
 board.lists=restoreCard(archiveCard(board.lists,target,'bc1'),target,'bc1');
 board.lists=restoreList(archiveList(board.lists,target,{template:board.template}),target,{template:board.template});
 localStorage.setItem(boardKey(),JSON.stringify(boards));expect(card().taskLink).toEqual(original);
 expect(ensureBoardTaskLink('b-default','bc1',scope)).toEqual({ok:true});expect(task().source!.listId).toBe(target);expect(task().id).toBe(original.taskId);
});
it('old account callback cannot write B or erase A pending intent',()=>{
 seed();const captured=accountScope.capture(),aKey=boardKey(),bytes=localStorage.getItem(aKey);accountScope.activate(accountScope.lock('other'),'fixture');
 expect(ensureBoardTaskLink('b-default','bc1',captured).ok).toBe(false);expect(localStorage.getItem(boardKey())).toBeNull();expect(localStorage.getItem(aKey)).toBe(bytes);
});

it('legacy task ID collision never overwrites another source or publishes a false link',()=>{
 seed();const cols=loadTaskColsOrSeed(null);cols[0]={...cols[0]!,tasks:[{id:'bt-b-default-bc1',title:{en:'unrelated',zh:'unrelated'}}]};
 const bytes=JSON.stringify(cols);localStorage.setItem(taskKey(),bytes);
 expect(ensureBoardTaskLink('b-default','bc1',accountScope.capture())).toMatchObject({ok:false,phase:'intent'});
 expect(localStorage.getItem(taskKey())).toBe(bytes);expect(card().taskLink).toBeUndefined();
});

it('reads task data from an envelope but leaves durable receipt bytes untouched until the coordinated writer lands',()=>{
 seed();const scope=accountScope.capture();
 const raw=JSON.stringify({format:'xai-command-state',version:1,revision:2,data:loadTaskColsOrSeed(null),receipts:{'ai:task-create':{operationVersion:1,signature:'tasks:create:v1',result:{ok:true,targetId:'older-task'},committedAt:'2026-09-09T12:00:00.000Z'}}});
 localStorage.setItem(taskKey(),raw);
 expect(ensureBoardTaskLink('b-default','bc1',scope)).toMatchObject({ok:false,phase:'task'});
 expect(localStorage.getItem(taskKey())).toBe(raw);
 expect(card().taskLink?.pending).toBeDefined();
});
it.each([JSON.stringify(null),JSON.stringify({format:'xai-command-state',version:1,revision:1,data:null,receipts:{}})])('invalid non-absent task bytes %s never save Board intent',raw=>{
 seed();const scope=accountScope.capture(),before=localStorage.getItem(boardKey());localStorage.setItem(taskKey(),raw);
 expect(ensureBoardTaskLink('b-default','bc1',scope)).toMatchObject({ok:false,phase:'intent'});
 expect(localStorage.getItem(boardKey())).toBe(before);expect(localStorage.getItem(taskKey())).toBe(raw);
});
