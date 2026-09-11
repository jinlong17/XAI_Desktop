import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent} from '@testing-library/react';
import {flush,guard,hold,keys,mount,nativeGet,nativeSet,setup,unload} from '../web-date-time-recovery-sol/fixture';
beforeEach(setup);afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
for(const failLatest of [false,true])it(`Retry after a newer queued choice observes only that choice's own success=${!failLatest}`,async()=>{
  const ui=mount();await flush();const release=await hold(keys[0]);
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key:string,value:string){if(key===keys[0]&&value==='saturday'&&failLatest)throw Error('actual latest Saturday quota');nativeSet.call(this,key,value);});
  fireEvent.change(ui.select(),{target:{value:'sunday'}});
  fireEvent.change(ui.select(),{target:{value:'saturday'}});
  fireEvent.click(ui.getByRole('button',{name:/Retry.*Start week on/i}));
  fireEvent.click(ui.getByRole('button',{name:/Retry.*Start week on/i}));
  expect(guard()?.isBlocking()).toBe(true);await release();await flush(24);
  expect(nativeGet.call(localStorage,keys[0])).toBe(failLatest?'sunday':'saturday');
  expect(ui.select().value).toBe('saturday');expect.soft(guard()?.isBlocking()).toBe(failLatest);expect.soft(unload()).toBe(failLatest);
  if(failLatest)expect(ui.getByRole('button',{name:'Export Date & Time draft'})).toBeTruthy();
});
it('same-field source Reload cannot later acknowledge a different value as the retained draft Retry',async()=>{
  nativeSet.call(localStorage,keys[0],'invalid-week');const ui=mount();await flush();
  fireEvent.change(ui.select(),{target:{value:'sunday'}});await flush(16);expect(guard()?.isBlocking()).toBe(true);
  nativeSet.call(localStorage,keys[0],'monday');
  const reload=ui.queryByRole('button',{name:/Reload.*Start week on/i});
  if(reload){fireEvent.click(reload);await flush(16);expect(ui.select().value).toBe('sunday');expect(guard()?.isBlocking()).toBe(true);}
  fireEvent.click(ui.getByRole('button',{name:/Retry.*Start week on/i}));await flush(16);
  // Either retain the unresolved Sunday against its original failed baseline,
  // or truly commit Sunday through an explicitly permitted retry. A verified
  // Monday cannot acknowledge the user's retained Sunday.
  const raw=nativeGet.call(localStorage,keys[0]);expect(ui.select().value).toBe('sunday');
  expect(raw==='sunday'||guard()?.isBlocking()===true).toBe(true);
});
it('source-only repaired Reload remains a clean read-only positive control',async()=>{
  nativeSet.call(localStorage,keys[0],'invalid-week');const ui=mount();await flush();nativeSet.call(localStorage,keys[0],'saturday');const writes=vi.spyOn(Storage.prototype,'setItem');
  fireEvent.click(ui.getByRole('button',{name:/Reload.*Start week on/i}));await flush(16);expect(ui.select().value).toBe('saturday');expect(nativeGet.call(localStorage,keys[0])).toBe('saturday');expect(writes).not.toHaveBeenCalled();expect(guard()?.isBlocking()).toBe(false);expect(unload()).toBe(false);
});
it('latest queued choice remains recoverable when its predecessor fails before it runs',async()=>{
  const ui=mount();await flush();const release=await hold(keys[0]);let deny=true;
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key:string,value:string){if(key===keys[0]&&value==='sunday'&&deny)throw Error('predecessor Sunday quota');nativeSet.call(this,key,value);});
  fireEvent.change(ui.select(),{target:{value:'sunday'}});
  fireEvent.change(ui.select(),{target:{value:'saturday'}});
  await release();await flush(24);
  expect(nativeGet.call(localStorage,keys[0])).toBe('monday');expect(ui.select().value).toBe('saturday');expect(guard()?.isBlocking()).toBe(true);
  deny=false;
  fireEvent.click(ui.getByRole('button',{name:/Retry.*Start week on/i}));await flush(24);
  expect(nativeGet.call(localStorage,keys[0])).toBe('saturday');expect(ui.select().value).toBe('saturday');expect(guard()?.isBlocking()).toBe(false);expect(unload()).toBe(false);
});
