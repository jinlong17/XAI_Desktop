import React from './packages/xai-web-meditation/node_modules/react/index.js';import {createRoot} from './packages/xai-web-meditation/node_modules/react-dom/client.js';
import {MeditationModule} from './packages/xai-web-meditation/src/MeditationModule.tsx';
import {accountScope,generationKey} from './packages/plugin-web-storage/src/index.ts';
import './packages/plugin-web-tokens/src/tokens.css';import './packages/plugin-web-tokens/src/layout.css';
const key=generationKey('native-med-A','one','xai_meditation_prefs'),bkey=generationKey('native-med-B','two','xai_meditation_prefs');
const original=Storage.prototype.setItem;let root=createRoot(document.getElementById('app')!);
function reset(){Storage.prototype.setItem=original;root.unmount();root=createRoot(document.getElementById('app')!);accountScope.activate(accountScope.lock('native-med-A'),'one');localStorage.removeItem(key);localStorage.setItem(bkey,'B sentinel');root.render(<MeditationModule lang="en"/>);}
(window as any).verify={reset,deny:()=>{Storage.prototype.setItem=function(k,v){if(k===key)throw new DOMException('Independent native quota','QuotaExceededError');return original.call(this,k,v)}},restore:()=>{Storage.prototype.setItem=original},raw:()=>localStorage.getItem(key),external:()=>{const raw=' {"newer":"independent bytes"} ';localStorage.setItem(key,raw);return raw},switchB:()=>accountScope.activate(accountScope.lock('native-med-B'),'two'),Bsafe:()=>localStorage.getItem(bkey)==='B sentinel'};reset();

import './packages/xai-web-meditation/src/styles.css';
