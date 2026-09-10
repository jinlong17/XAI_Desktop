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
