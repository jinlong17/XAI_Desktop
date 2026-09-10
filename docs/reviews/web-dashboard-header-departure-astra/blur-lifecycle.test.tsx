import React from 'react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render} from '@testing-library/react';
import {DashHeader} from '../../../packages/xai-web-dashboard-grid/src/DashHeader';
import {nativeGet,noteKey,setup} from '../web-dashboard-header-departure-sol/fixture';
beforeEach(()=>{setup();vi.useFakeTimers();});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});
const base={lang:'en' as const,now:new Date('2026-09-10T10:00:00Z'),isDeparturePending:()=>false,isDepartureTarget:(target:EventTarget|null)=>target instanceof Element&&Boolean(target.closest('[data-nav-candidate]'))};
async function opened(){const ui=render(<><DashHeader {...base}/><button data-nav-candidate>Navigation candidate</button></>);fireEvent.click(ui.getByRole('button',{name:'Edit dashboard note'}));await act(async()=>{await vi.advanceTimersByTimeAsync(0);});const input=ui.getByRole('textbox') as HTMLInputElement;expect(document.activeElement).toBe(input);fireEvent.change(input,{target:{value:'Ordinary blur latest'}});return{...ui,input,nav:ui.getByRole('button',{name:'Navigation candidate'})};}
const settle=async()=>act(async()=>{await vi.advanceTimersByTimeAsync(20);});

it('ordinary blur still saves when an unrelated parent clock prop rerenders before its timer',async()=>{
  const ui=await opened();
  act(()=>{ui.input.blur();ui.rerender(<><DashHeader {...base} now={new Date('2026-09-10T10:00:01Z')}/><button data-nav-candidate>Navigation candidate</button></>);});
  await settle();
  expect(nativeGet.call(localStorage,noteKey),'parent clock update cannot cancel ordinary blur persistence').toBe('Ordinary blur latest');
  expect(ui.queryByRole('textbox')).toBeNull();
});

it('an unrelated pointer release cannot settle the navigation pointer that deferred blur',async()=>{
  const ui=await opened();fireEvent.pointerDown(ui.nav,{pointerId:7,button:0});act(()=>ui.input.blur());await settle();
  expect(nativeGet.call(localStorage,noteKey)).toBe('Original A');
  fireEvent.pointerUp(window,{pointerId:8,button:0});await settle();
  expect(nativeGet.call(localStorage,noteKey),'pointer7 is still held and may yet navigate').toBe('Original A');
  fireEvent.pointerCancel(window,{pointerId:7});await settle();
  expect(nativeGet.call(localStorage,noteKey),'canceling the actual candidate restores ordinary blur behavior').toBe('Ordinary blur latest');
});

it('window focus loss cannot strand a canceled pointer and suppress a later ordinary keyboard blur',async()=>{
  const ui=await opened();fireEvent.pointerDown(ui.nav,{pointerId:7,button:0});act(()=>ui.input.blur());
  fireEvent.blur(window);await settle();
  // Either the canceled candidate already saved safely, or the still-open editor
  // remains available. A later ordinary focus/blur must work without pointerup.
  const input=ui.queryByRole('textbox') as HTMLInputElement|null;
  if(input){act(()=>{input.focus();input.blur();});await settle();}
  expect(nativeGet.call(localStorage,noteKey)).toBe('Ordinary blur latest');
});

it('normal blur without navigation or rerender persists the latest note',async()=>{
  const ui=await opened();act(()=>ui.input.blur());await settle();
  expect(nativeGet.call(localStorage,noteKey)).toBe('Ordinary blur latest');expect(ui.queryByRole('textbox')).toBeNull();
});
