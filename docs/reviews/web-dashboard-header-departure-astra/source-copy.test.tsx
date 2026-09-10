import React from 'react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render} from '@testing-library/react';
import {DashHeader} from '../../../packages/xai-web-dashboard-grid/src/DashHeader';
import {activate,flush,nativeGet,nativeSet,noteKey,offsetKey,setup,unload} from '../web-dashboard-header-departure-sol/fixture';
beforeEach(setup);afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
const positionOnlyCopy=/The saved note position source is unavailable|备注位置的已保存来源不可用/;
for(const lang of ['en','zh'] as const){
  it(`${lang}: frozen A-only recovery cannot falsely report a healthy position source unavailable`,async()=>{
    const ui=render(<DashHeader lang={lang} now={new Date('2026-09-10T10:00:00Z')}/>);
    fireEvent.click(ui.getByRole('button',{name:lang==='en'?'Edit dashboard note':'编辑工作台备注'}));
    fireEvent.change(ui.getByRole('textbox'),{target:{value:'Private A draft'}});
    await act(async()=>{activate('copy-B');});await flush();
    expect(ui.container.textContent).not.toContain('Private A draft');expect(unload()).toBe(true);
    expect(nativeGet.call(localStorage,offsetKey)).toBe('0');
    expect(ui.queryByRole('button',{name:lang==='en'?'Reload note position':'重新读取备注位置'})).toBeNull();
    expect(ui.getByText(/The previous account's note draft remains protected|此前账户的备注草稿保留在此会话中/)).toBeTruthy();
    expect(ui.queryByText(positionOnlyCopy),'a frozen account note does not imply broken position storage').toBeNull();
  });
  it(`${lang}: note-only read failure identifies note recovery without falsely blaming healthy position`,async()=>{
    vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(this:Storage,key:string){if(key===noteKey)throw Error('note source unavailable');return nativeGet.call(this,key);});
    const ui=render(<DashHeader lang={lang} now={new Date('2026-09-10T10:00:00Z')}/>);await flush();
    expect(ui.getByRole('button',{name:lang==='en'?'Reload dashboard note':'重新读取备注'})).toBeTruthy();
    expect(ui.queryByRole('button',{name:lang==='en'?'Reload note position':'重新读取备注位置'})).toBeNull();
    expect(nativeGet.call(localStorage,offsetKey)).toBe('0');expect(unload()).toBe(false);
    expect(ui.getByRole('alert')).toBeTruthy();expect(ui.queryByText(positionOnlyCopy),'only note reads failed').toBeNull();
  });
  it(`${lang}: actual position source failure retains the established localized message and read-only action`,async()=>{
    nativeSet.call(localStorage,offsetKey,'null');const ui=render(<DashHeader lang={lang} now={new Date('2026-09-10T10:00:00Z')}/>);await flush();
    expect(ui.getByText(positionOnlyCopy)).toBeTruthy();expect(ui.getByRole('button',{name:lang==='en'?'Reload note position':'重新读取备注位置'})).toBeTruthy();
    expect(nativeGet.call(localStorage,offsetKey)).toBe('null');expect(unload()).toBe(false);
  });
}
