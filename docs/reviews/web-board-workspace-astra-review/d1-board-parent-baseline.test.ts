import {createTestLockManager} from './d1-web-locks-fixture.js';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {accountScope,generationMarkerKey,setCanonicalCommandActivationForTests} from '@repo/plugin-web-storage';
import {makeDefaultBoards} from '@repo/plugin-web-board-core';
import {ensureBoardTaskLink} from '../../../packages/plugin-web-board-workspaces/src/internal/taskLinkCommand.js';
const taskKey=()=>accountScope.physicalKey('xai_task_cols');
const boardKey=()=>accountScope.physicalKey('xai_boards_v2');
const receipt={operationVersion:1,signature:'preserve',result:{ok:true,targetId:'prior'},committedAt:'2026-09-09T00:00:00Z'};
const empty=()=>[{id:'overdue',key:'overdue',count:0,tasks:[]},{id:'next7',key:'next_7_days',count:0,tasks:[]},{id:'later',key:'later',count:0,tasks:[]},{id:'nodate',key:'no_date',count:0,tasks:[]}];
const boardCard=()=>JSON.parse(localStorage.getItem(boardKey())!)[0].lists.flatMap((list:any)=>list.cards).find((card:any)=>card.id==='bc1');
beforeEach(()=>{localStorage.clear();accountScope.activate(accountScope.lock('board-canonical'),'g1');localStorage.setItem(generationMarkerKey('board-canonical'),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));setCanonicalCommandActivationForTests(true);vi.stubGlobal('navigator',{locks:createTestLockManager()});localStorage.setItem(boardKey(),JSON.stringify(makeDefaultBoards()));});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();setCanonicalCommandActivationForTests(false);});
it.each(['absent','envelope'])('Board link completes through the canonical Tasks writer with %s source and remains idempotent',async source=>{
 if(source==='envelope')localStorage.setItem(taskKey(),JSON.stringify({format:'xai-command-state',version:1,revision:3,data:empty(),receipts:{prior:receipt}}));
 const result=await ensureBoardTaskLink('b-default','bc1',accountScope.capture());expect(result).toEqual({ok:true});
 const stored=JSON.parse(localStorage.getItem(taskKey())!);expect(stored.format).toBe('xai-command-state');
 const linked=stored.data.flatMap((col:any)=>[...col.tasks,...(col.completed??[])]).filter((row:any)=>row.source?.boardId==='b-default'&&row.source.cardId==='bc1');expect(linked).toHaveLength(1);
 expect(stored.receipts).toEqual(source==='envelope'?{prior:receipt}:{});expect(boardCard().taskLink.taskId).toBe(linked[0].id);expect(boardCard().taskLink.pending).toBeUndefined();
 const raw=localStorage.getItem(taskKey());expect(await ensureBoardTaskLink('b-default','bc1',accountScope.capture())).toEqual({ok:true});expect(localStorage.getItem(taskKey())).toBe(raw);
});
it.each(['null',JSON.stringify({format:'xai-command-state',version:1,revision:1,data:null,receipts:{}})])('invalid present Tasks domain refuses before publishing intent: %s',async raw=>{
 localStorage.setItem(taskKey(),raw);const before=localStorage.getItem(boardKey());expect(await ensureBoardTaskLink('b-default','bc1',accountScope.capture())).toMatchObject({ok:false,phase:'intent'});expect(localStorage.getItem(boardKey())).toBe(before);expect(localStorage.getItem(taskKey())).toBe(raw);
});
