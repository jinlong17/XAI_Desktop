import React from 'react';
import {createRoot} from 'react-dom/client';
import {accountScope} from './packages/plugin-web-storage/src/index';
import {CalendarModule} from './packages/xai-web-calendar/src/CalendarModule';

import './packages/plugin-web-tokens/src/tokens.css';
import './packages/plugin-web-tokens/src/layout.css';
import './packages/xai-web-calendar/src/styles.css';
accountScope.activate(accountScope.lock('independent-A'),'A');
const now=new Date();const day=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
const initial={original:{id:'original',title:'Original event',startISO:day+'T09:00',endISO:day+'T10:00',colorPreset:'rose',recurrence:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}};
const key=accountScope.physicalKey('xai_calendar_events');localStorage.setItem(key,JSON.stringify(initial));
const nativeSet=Storage.prototype.setItem;
(window as any).verify={key,initial,deny(){Storage.prototype.setItem=function(k,v){if(k===key)throw new DOMException('independent quota','QuotaExceededError');nativeSet.call(this,k,v)}},restore(){Storage.prototype.setItem=nativeSet},switch(){accountScope.activate(accountScope.lock('independent-B'),'B');return accountScope.physicalKey('xai_calendar_events')}};
createRoot(document.getElementById('app')!).render(<CalendarModule lang="en"/>);
