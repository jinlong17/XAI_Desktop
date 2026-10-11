import React from 'react';
import {createRoot} from 'react-dom/client';
import {accountScope} from './packages/plugin-web-storage/src/index';
import {CountdownModule} from './packages/plugin-web-countdown/src/CountdownModule';

import './packages/plugin-web-tokens/src/tokens.css';
import './packages/plugin-web-tokens/src/layout.css';
import './packages/plugin-web-countdown/src/styles.css';
accountScope.activate(accountScope.lock('independent-A'),'A');
const initial=[];
const key=accountScope.physicalKey('xai_countdowns');localStorage.setItem(key,JSON.stringify(initial));
const nativeSet=Storage.prototype.setItem;
(window as any).verify={key,initial,deny(){Storage.prototype.setItem=function(k,v){if(k===key)throw new DOMException('independent quota','QuotaExceededError');nativeSet.call(this,k,v)}},restore(){Storage.prototype.setItem=nativeSet},switch(){accountScope.activate(accountScope.lock('independent-B'),'B');return accountScope.physicalKey('xai_countdowns')}};
createRoot(document.getElementById('app')!).render(<CountdownModule lang="en"/>);
