import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,act} from '@testing-library/react';
import {CalendarModule} from '../../../packages/xai-web-calendar/src/CalendarModule.js';
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
it('completion of a pending old create must not close the subsequently opened editor or erase its draft',async()=>{
 render(<CalendarModule lang="en"/>);fireEvent.click(screen.getByLabelText('Add event'));
 const input=()=>document.getElementById('event-composer-title-input') as HTMLInputElement;
 const dialog=()=>document.querySelector('dialog.event-composer') as HTMLDialogElement;
 fireEvent.change(input(),{target:{value:'Old pending create'}});
 let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);
 vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>{await gate;return run();}}});
 fireEvent.click(screen.getByRole('button',{name:'Save'}));fireEvent.click(screen.getByRole('button',{name:'Cancel'}));
 if(dialog().open){ // A product may explicitly prevent dismissing pending work.
   expect(input().value).toBe('Old pending create');await act(async()=>{release();await gate;});return;
 }
 fireEvent.click(screen.getByLabelText('Add event'));fireEvent.change(input(),{target:{value:'New unsaved editor draft'}});
 expect(dialog().open).toBe(true);await act(async()=>{release();await gate;});await act(async()=>{});
 console.log('old-completion-new-editor',JSON.stringify({editorOpen:dialog().open,latestDraft:input().value}));
 expect.soft(input().value).toBe('New unsaved editor draft');expect(dialog().open).toBe(true);
});
