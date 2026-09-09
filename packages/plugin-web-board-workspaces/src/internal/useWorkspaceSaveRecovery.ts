import { useRef, useState } from 'react';
import { accountScope } from '@repo/plugin-web-storage';
import { BOARD_MEMBER_PALETTE, loadBoardsOrDefault, loadWorkspacesOrDefault } from '@repo/plugin-web-board-core';
export type WorkspaceAction = 'create' | 'rename' | 'recolor' | 'delete' | 'pick';
export function useWorkspaceSaveRecovery(rawWorkspaces: unknown, rawBoards: unknown, activeId: string | null, save: (next: unknown) => boolean, select: (id: string) => boolean) {
 const [owner] = useState(()=>accountScope.capture());
 const pending=useRef<{kind:WorkspaceAction;id?:string;createdId:string;name?:string;workspaceRaw:string|null;boardRaw:string|null;activeRaw:string|null}|null>(null);
 const [error,setError]=useState<string|null>(null);
 const read=(key:string)=>{accountScope.assertCurrent(owner);return localStorage.getItem(accountScope.physicalKey(key,owner));};
 function run(kind:WorkspaceAction,id?:string,name?:string):boolean {
  try {
   const wsRaw=read('xai_board_workspaces'),boardRaw=read('xai_boards_v2'),activeRaw=read('xai_active_board');
   const action=pending.current??{kind,id,createdId:`ws-${crypto.randomUUID()}`,name,workspaceRaw:wsRaw,boardRaw,activeRaw};pending.current=action;
   if(action.kind!==kind||action.id!==id)throw Error('Resolve the previous change before starting another.');
   action.name=name;
   const matches=(raw:string|null,rendered:unknown)=>raw===null?rendered===null:JSON.stringify(JSON.parse(raw))===JSON.stringify(rendered);
   if(kind==='pick'){
    if(boardRaw!==action.boardRaw||!matches(boardRaw,rawBoards)||activeRaw!==action.activeRaw||activeRaw!==(activeId || null))throw Error('Saved board selection or data changed. Export and reopen.');
    if(!loadBoardsOrDefault(rawBoards).some(b=>b.id===id))throw Error('This board is no longer available.');
    if(!select(id!))throw Error('Opening the board failed. Retry the same selection.');
   }else{
    if(wsRaw!==action.workspaceRaw||!matches(wsRaw,rawWorkspaces))throw Error('Newer workspace data exists. Export and reopen.');
    const workspaces=loadWorkspacesOrDefault(rawWorkspaces),target=workspaces.find(w=>w.id===id);let next=workspaces;
    if(kind==='create'||kind==='rename')if(!name?.trim())throw Error('Enter a workspace name.');
    if(kind!=='create'&&!target)throw Error('This workspace is no longer available.');
    if(kind==='create')next=[...workspaces,{id:action.createdId,name:{en:name!.trim(),zh:name!.trim()},color:BOARD_MEMBER_PALETTE[workspaces.length%BOARD_MEMBER_PALETTE.length]!}];
    if(kind==='rename')next=workspaces.map(w=>w.id===id?{...w,name:{en:name!.trim(),zh:name!.trim()}}:w);
    if(kind==='recolor')next=workspaces.map(w=>w.id===id?{...w,color:BOARD_MEMBER_PALETTE[(BOARD_MEMBER_PALETTE.indexOf(w.color)+1)%BOARD_MEMBER_PALETTE.length]!}:w);
    if(kind==='delete'){
     if(boardRaw!==action.boardRaw||!matches(boardRaw,rawBoards))throw Error('Board membership changed. Reopen before deleting.');
     if(workspaces.length<=1)throw Error('The last workspace cannot be deleted.');
     if(loadBoardsOrDefault(rawBoards).some(b=>b.workspaceId===id))throw Error('Only empty workspaces can be deleted. Move their boards first.');
     next=workspaces.filter(w=>w.id!==id);
    }
    if(!save(next))throw Error('Workspace change was not saved. Retry or export.');
   }
   pending.current=null;setError(null);return true;
  }catch(failure){setError(String(failure));return false;}
 }
 return {run,error,pending:pending.current,discard(){pending.current=null;setError(null);},snapshot(name?:string){return {version:1,kind:'workspace-change-draft',action:{...pending.current,...(name!==undefined?{name}:{})},storedWorkspaces:read('xai_board_workspaces'),storedBoards:read('xai_boards_v2'),storedActive:read('xai_active_board')};}};
}
