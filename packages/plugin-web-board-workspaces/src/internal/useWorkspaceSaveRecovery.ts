import { useRef, useState } from 'react';
import { accountScope } from '@repo/plugin-web-storage';
import { BOARD_MEMBER_PALETTE, isBoardWorkspaceArray, loadBoardsOrDefault, loadWorkspacesOrDefault, readBoardStorage } from '@repo/plugin-web-board-core';
export type WorkspaceAction = 'create' | 'rename' | 'recolor' | 'delete' | 'pick';
export function useWorkspaceSaveRecovery(rawWorkspaces: unknown, rawBoards: unknown, activeId: string | null, save: (next: unknown) => boolean, select: (id: string) => boolean) {
 const [owner] = useState(()=>accountScope.capture());
 const pending=useRef<{kind:WorkspaceAction;id?:string;createdId:string;name?:string;workspaceRaw:string|null;boardRaw:string|null;activeRaw:string|null}|null>(null);
 const [error,setError]=useState<string|null>(null);
 const read=(key:string)=>{accountScope.assertCurrent(owner);return localStorage.getItem(accountScope.physicalKey(key,owner));};
 const decode=(raw:string, label:string):unknown=>{try{return JSON.parse(raw);}catch{throw Error(`Saved ${label} data is unusable. Export and reopen.`);}};
 const same=(stored:unknown, rendered:unknown)=>JSON.stringify(stored)===JSON.stringify(rendered);
 const workspacesFrom=(raw:string|null,rendered:unknown)=>{
  if(raw===null){if(rendered!==null)throw Error('Newer workspace data exists. Export and reopen.');return loadWorkspacesOrDefault(null);}
  const stored=decode(raw,'workspace');
  if(!isBoardWorkspaceArray(stored)||stored.length===0)throw Error('Saved workspace data is unusable. Export and reopen.');
  if(!same(stored,rendered))throw Error('Newer workspace data exists. Export and reopen.');
  return stored;
 };
 const boardsFrom=(raw:string|null,rendered:unknown)=>{
  if(raw===null){if(rendered!==null)throw Error('Saved board selection or data changed. Export and reopen.');return loadBoardsOrDefault(null);}
  const stored=decode(raw,'board');
  const readResult=readBoardStorage(stored);
  if(readResult.status!=='valid')throw Error('Saved board data is unusable. Export and reopen.');
  if(!same(stored,rendered))throw Error('Saved board selection or data changed. Export and reopen.');
  return readResult.boards;
 };
 function run(kind:WorkspaceAction,id?:string,name?:string):boolean {
  try {
   const wsRaw=read('xai_board_workspaces'),boardRaw=read('xai_boards_v2'),activeRaw=read('xai_active_board');
   const action=pending.current??{kind,id,createdId:`ws-${crypto.randomUUID()}`,name,workspaceRaw:wsRaw,boardRaw,activeRaw};pending.current=action;
   if(action.kind!==kind||action.id!==id)throw Error('Resolve the previous change before starting another.');
   action.name=name;
   if(kind==='pick'){
    if(boardRaw!==action.boardRaw||activeRaw!==action.activeRaw||activeRaw!==(activeId || null))throw Error('Saved board selection or data changed. Export and reopen.');
    if(!boardsFrom(boardRaw,rawBoards).some(b=>b.id===id))throw Error('This board is no longer available.');
    if(!select(id!))throw Error('Opening the board failed. Retry the same selection.');
   }else{
    if(wsRaw!==action.workspaceRaw)throw Error('Newer workspace data exists. Export and reopen.');
    const workspaces=workspacesFrom(wsRaw,rawWorkspaces),target=workspaces.find(w=>w.id===id);let next=workspaces;
    if(kind==='create'||kind==='rename')if(!name?.trim())throw Error('Enter a workspace name.');
    if(kind!=='create'&&!target)throw Error('This workspace is no longer available.');
    if(kind==='create')next=[...workspaces,{id:action.createdId,name:{en:name!.trim(),zh:name!.trim()},color:BOARD_MEMBER_PALETTE[workspaces.length%BOARD_MEMBER_PALETTE.length]!}];
    if(kind==='rename')next=workspaces.map(w=>w.id===id?{...w,name:{en:name!.trim(),zh:name!.trim()}}:w);
    if(kind==='recolor')next=workspaces.map(w=>w.id===id?{...w,color:BOARD_MEMBER_PALETTE[(BOARD_MEMBER_PALETTE.indexOf(w.color)+1)%BOARD_MEMBER_PALETTE.length]!}:w);
    if(kind==='delete'){
     if(boardRaw!==action.boardRaw)throw Error('Board membership changed. Reopen before deleting.');
     const boards=boardsFrom(boardRaw,rawBoards);
     if(workspaces.length<=1)throw Error('The last workspace cannot be deleted.');
     if(boards.some(b=>b.workspaceId===id))throw Error('Only empty workspaces can be deleted. Move their boards first.');
     next=workspaces.filter(w=>w.id!==id);
    }
    if(!save(next))throw Error('Workspace change was not saved. Retry or export.');
   }
   pending.current=null;setError(null);return true;
  }catch(failure){setError(String(failure));return false;}
 }
 return {run,error,pending:pending.current,discard(){pending.current=null;setError(null);},snapshot(name?:string){return {version:1,kind:'workspace-change-draft',action:{...pending.current,...(name!==undefined?{name}:{})},storedWorkspaces:read('xai_board_workspaces'),storedBoards:read('xai_boards_v2'),storedActive:read('xai_active_board')};}};
}
