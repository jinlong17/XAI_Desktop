import React from '../../../packages/xai-web-tasks/node_modules/react';
import {cleanup,fireEvent,render} from '../../../packages/xai-web-tasks/node_modules/@testing-library/react';
import {afterEach,it,expect,vi} from 'vitest';
import {accountScope,generationMarkerKey} from '../../../packages/plugin-web-storage/src/index';
import {MeditationModule} from '../../../packages/xai-web-meditation/src/MeditationModule';
afterEach(()=>{cleanup();vi.restoreAllMocks();localStorage.clear()});
it('reproduces MED failed new scene retry silently persisting no scene',()=>{
 localStorage.clear();const locked=accountScope.lock('consumer-A');localStorage.setItem(generationMarkerKey('consumer-A'),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));accountScope.activate(locked,'g1');const key=accountScope.physicalKey('xai_meditation_prefs');
 const {container}=render(<MeditationModule lang="en"/>);const input=container.querySelector('.scene-editor input[type=text]') || container.querySelector('.field-row input[type=text]');expect(input).not.toBeNull();fireEvent.change(input!,{target:{value:'Independent unsaved scene'}});
 const native=Storage.prototype.setItem;const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(k,v){if(k===key)throw new DOMException('quota','QuotaExceededError');native.call(this,k,v)});
 fireEvent.click(container.querySelector('.save-scene')!);expect(localStorage.getItem(key)).toBeNull();expect(container.querySelector('[role=alert]')).toBeNull();expect((input as HTMLInputElement).value).toBe('Independent unsaved scene');
 fault.mockRestore();fireEvent.click(container.querySelector('.save-scene')!);const saved=JSON.parse(localStorage.getItem(key)!);expect(saved.customScenes).toEqual([]);expect(saved.scene.startsWith('custom:')).toBe(true);
});
