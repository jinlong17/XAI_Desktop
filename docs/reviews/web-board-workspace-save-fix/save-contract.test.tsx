import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BoardWorkspacesModule } from '../../../packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.js';
import { makeDefaultBoards, loadWorkspacesOrDefault } from '../../../packages/plugin-web-board-core/src/index.js';
import { accountScope, setPref } from '../../../packages/plugin-web-storage/src/index.js';
afterEach(()=>{cleanup();vi.restoreAllMocks();});
const workspaceKey=()=>accountScope.physicalKey('xai_board_workspaces');
const boardKey=()=>accountScope.physicalKey('xai_boards_v2');
const activeKey=()=>accountScope.physicalKey('xai_active_board');
function seed(workspaces=loadWorkspacesOrDefault(null)){
 const boards=makeDefaultBoards();setPref('xai_board_workspaces',workspaces);setPref('xai_boards_v2',boards);setPref('xai_active_board',boards[0]!.id);return boards;
}
function open(){render(<BoardWorkspacesModule lang="en"/>);fireEvent.click(screen.getByTestId('bv-switch'));}
function readBlob(blob:Blob){return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(reader.error);reader.onload=()=>resolve(String(reader.result));reader.readAsText(blob);});}
for(const kind of ['create','rename','recolor','delete','pick'])it(`${kind} rejected write remains visibly recoverable`,()=>{
 const wsKey=accountScope.physicalKey('xai_board_workspaces'),boardKey=accountScope.physicalKey('xai_boards_v2'),activeKey=accountScope.physicalKey('xai_active_board');
 const boards=makeDefaultBoards(),workspaces=[...loadWorkspacesOrDefault(null),{id:'empty',name:{en:'Empty',zh:'空'},color:'red'}];localStorage.setItem(wsKey,JSON.stringify(workspaces));localStorage.setItem(boardKey,JSON.stringify(boards));localStorage.setItem(activeKey,boards[0]!.id);
 render(<BoardWorkspacesModule lang="en"/>);fireEvent.click(screen.getByTestId('bv-switch'));const key=kind==='pick'?activeKey:wsKey,original=localStorage.getItem(key),native=Storage.prototype.setItem;let attempts=0;vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===key){attempts++;throw new DOMException('quota','QuotaExceededError');}native.call(this,k,v);});
 if(kind==='create'){fireEvent.click(screen.getByTestId('bs-new-workspace'));fireEvent.change(screen.getByTestId('bs-ws-new-name'),{target:{value:'Unsaved workspace'}});fireEvent.click(screen.getByTestId('bs-ws-new-add'));}
 if(kind==='rename'){fireEvent.click(screen.getByTestId('bs-ws-rename-empty'));fireEvent.change(screen.getByTestId('bs-ws-rename-input-empty'),{target:{value:'Unsaved rename'}});fireEvent.keyDown(screen.getByTestId('bs-ws-rename-input-empty'),{key:'Enter'});}
 if(kind==='recolor')fireEvent.click(screen.getByTestId('bs-ws-recolor-empty'));
 if(kind==='delete')fireEvent.click(screen.getByTestId('bs-ws-delete-empty'));
 if(kind==='pick')fireEvent.click(screen.getByTestId(`bs-card-${boards[1]!.id}`));
 expect(attempts).toBe(1);expect(localStorage.getItem(key)).toBe(original);expect(screen.getByTestId('bs-scrim')).toBeInTheDocument();expect(screen.getByRole('alert')).toHaveTextContent(/not saved|failed/i);
 if(kind==='create')expect(screen.getByTestId('bs-ws-new-name')).toHaveValue('Unsaved workspace');if(kind==='rename')expect(screen.getByTestId('bs-ws-rename-input-empty')).toHaveValue('Unsaved rename');
});

it('workspace create keeps its stable id, exports the latest name, and retries once',async()=>{
 const boards=seed();open();const original=localStorage.getItem(workspaceKey())!;
 const native=Storage.prototype.setItem, proposals:string[]=[];
 const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key,value){if(key===workspaceKey()){proposals.push(value);throw new DOMException('quota','QuotaExceededError');}native.call(this,key,value);});
 fireEvent.click(screen.getByTestId('bs-new-workspace'));fireEvent.change(screen.getByTestId('bs-ws-new-name'),{target:{value:'First workspace'}});fireEvent.click(screen.getByTestId('bs-ws-new-add'));
 expect(screen.getByRole('alert')).toBeInTheDocument();expect(localStorage.getItem(workspaceKey())).toBe(original);
 fireEvent.change(screen.getByTestId('bs-ws-new-name'),{target:{value:'Latest workspace'}});fireEvent.click(screen.getByText('Retry workspace change'));
 const first=JSON.parse(proposals[0]!).at(-1),second=JSON.parse(proposals[1]!).at(-1);expect(first.id).toBe(second.id);expect(second.name.en).toBe('Latest workspace');
 let exported:Blob|undefined;vi.stubGlobal('URL',{createObjectURL:(blob:Blob)=>{exported=blob;return 'blob:test';},revokeObjectURL:()=>{}});vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
 fireEvent.click(screen.getByText('Export workspace draft'));const draft=JSON.parse(await readBlob(exported!));expect(draft.action.createdId).toBe(first.id);expect(draft.action.name).toBe('Latest workspace');expect(draft.storedWorkspaces).toBe(original);
 fault.mockRestore();fireEvent.click(screen.getByText('Retry workspace change'));const saved=JSON.parse(localStorage.getItem(workspaceKey())!);expect(saved.filter((ws:{name:{en:string}})=>ws.name.en==='Latest workspace')).toHaveLength(1);expect(saved.at(-1).id).toBe(first.id);expect(screen.queryByRole('alert')).toBeNull();expect(boards).toHaveLength(3);
});

it('normal board pick persists from an absent active id, and failed pick retries without leaving the switcher',()=>{
 const boards=seed();localStorage.removeItem(activeKey());open();fireEvent.click(screen.getByTestId(`bs-card-${boards[1]!.id}`));expect(localStorage.getItem(activeKey())).toBe(boards[1]!.id);expect(screen.queryByTestId('bs-scrim')).toBeNull();
 cleanup();setPref('xai_active_board',boards[0]!.id);open();const native=Storage.prototype.setItem;const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key,value){if(key===activeKey())throw new DOMException('quota','QuotaExceededError');native.call(this,key,value);});
 fireEvent.click(screen.getByTestId(`bs-card-${boards[1]!.id}`));expect(screen.getByRole('alert')).toHaveTextContent(/not saved|failed/i);expect(screen.getByTestId('bs-scrim')).toBeInTheDocument();fault.mockRestore();fireEvent.click(screen.getByText('Retry workspace change'));expect(localStorage.getItem(activeKey())).toBe(boards[1]!.id);expect(screen.queryByTestId('bs-scrim')).toBeNull();
});

it('empty workspace deletion succeeds while last and nonempty workspace deletion remain unavailable',()=>{
 const empty={id:'empty',name:{en:'Empty',zh:'空'},color:'red'};seed([...loadWorkspacesOrDefault(null),empty]);open();fireEvent.click(screen.getByTestId('bs-ws-delete-empty'));expect(JSON.parse(localStorage.getItem(workspaceKey())!).some((ws:{id:string})=>ws.id==='empty')).toBe(false);expect(screen.queryByTestId('bs-ws-delete-ws-personal')).toBeNull();
 cleanup();const only={id:'only',name:{en:'Only',zh:'仅有'},color:'red'};seed([only]);open();expect(screen.queryByTestId('bs-ws-delete-only')).toBeNull();
});

it('external replacement or deletion wins, then discard leaves the current rendered data operable',()=>{
 const empty={id:'empty',name:{en:'Empty',zh:'空'},color:'red'};seed([...loadWorkspacesOrDefault(null),empty]);open();const native=Storage.prototype.setItem;const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key,value){if(key===workspaceKey())throw new DOMException('quota','QuotaExceededError');native.call(this,key,value);});
 fireEvent.click(screen.getByTestId('bs-ws-rename-empty'));fireEvent.change(screen.getByTestId('bs-ws-rename-input-empty'),{target:{value:'Local draft'}});fireEvent.keyDown(screen.getByTestId('bs-ws-rename-input-empty'),{key:'Enter'});fault.mockRestore();
 const external=JSON.stringify([...loadWorkspacesOrDefault(null),{...empty,name:{en:'External winner',zh:'外部胜者'}}]);localStorage.setItem(workspaceKey(),external);fireEvent.click(screen.getByText('Retry workspace change'));expect(localStorage.getItem(workspaceKey())).toBe(external);expect(screen.getByRole('alert')).toHaveTextContent('Newer workspace data');
 act(()=>window.dispatchEvent(new StorageEvent('storage',{key:workspaceKey(),newValue:external,storageArea:localStorage})));fireEvent.click(screen.getByText('Discard workspace change'));expect(screen.queryByRole('alert')).toBeNull();fireEvent.click(screen.getByTestId('bs-ws-rename-empty'));expect(screen.getByTestId('bs-ws-rename-input-empty')).toHaveValue('External winner');
 fireEvent.keyDown(screen.getByTestId('bs-ws-rename-input-empty'),{key:'Escape'});localStorage.removeItem(workspaceKey());fireEvent.click(screen.getByTestId('bs-ws-recolor-empty'));expect(localStorage.getItem(workspaceKey())).toBeNull();expect(screen.getByRole('alert')).toHaveTextContent('Newer workspace data');
});

it('a pending A workspace draft cannot retry or export into account B',()=>{
 seed();open();const native=Storage.prototype.setItem;const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key,value){if(key===workspaceKey())throw new DOMException('quota','QuotaExceededError');native.call(this,key,value);});
 fireEvent.click(screen.getByTestId('bs-new-workspace'));fireEvent.change(screen.getByTestId('bs-ws-new-name'),{target:{value:'A draft'}});fireEvent.click(screen.getByTestId('bs-ws-new-add'));fault.mockRestore();const aKey=workspaceKey(),aBytes=localStorage.getItem(aKey);
 act(()=>accountScope.activate(accountScope.lock('B'),'B'));const bKey=workspaceKey(),bBytes=localStorage.getItem(bKey);fireEvent.click(screen.getByText('Retry workspace change'));fireEvent.click(screen.getByText('Export workspace draft'));expect(localStorage.getItem(aKey)).toBe(aBytes);expect(localStorage.getItem(bKey)).toBe(bBytes);expect(screen.getByRole('alert')).toHaveTextContent('Export failed');
});
