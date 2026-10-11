import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {act,cleanup,render} from '@testing-library/react';
import {accountScope,generationMarkerKey} from '@repo/plugin-web-storage';
import {DashHeader} from '../../../packages/xai-web-dashboard-grid/src/DashHeader';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
const key='xai_pref_dashboard_header_note_x',get=Storage.prototype.getItem;
beforeEach(()=>{localStorage.clear();accountScope.activate(accountScope.lock('device-source-A'),'g1');localStorage.setItem(generationMarkerKey('device-source-A'),JSON.stringify({generation:'g1',migrationId:'test',previous:null}));vi.stubGlobal('navigator',{locks:createTestLockManager()});});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
async function mount(){const ui=render(<DashHeader lang="en" now={new Date('2026-09-09T10:00:00Z')}/>);await act(async()=>{await new Promise(r=>setTimeout(r,0));});return ui;}
it('JSON null remains untouched and exposes existing source recovery instead of silently showing a healthy default',async()=>{localStorage.setItem(key,'null');const writes=vi.spyOn(Storage.prototype,'setItem');const ui=await mount();expect(localStorage.getItem(key)).toBe('null');expect(writes.mock.calls.filter(c=>c[0]===key)).toEqual([]);expect(ui.queryByRole('alert'),'9f invalid source must show recovery').not.toBeNull();});
it('unavailable position source stays untouched and exposes recovery',async()=>{localStorage.setItem(key,'80');vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(this:Storage,k){if(k===key)throw Error('device read unavailable');return get.call(this,k);});const writes=vi.spyOn(Storage.prototype,'setItem');const ui=await mount();expect(get.call(localStorage,key)).toBe('80');expect(writes.mock.calls.filter(c=>c[0]===key)).toEqual([]);expect(ui.queryByRole('alert'),'9f read failure must show recovery').not.toBeNull();});
it('truly absent position displays a healthy default with no alert or seed',async()=>{const ui=await mount();expect(localStorage.getItem(key)).toBeNull();expect(ui.queryByRole('alert')).toBeNull();});
