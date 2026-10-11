import './packages/plugin-web-tokens/src/tokens.css';
import './packages/plugin-web-tokens/src/layout.css';
import './packages/plugin-web-ai-chat/src/styles.css';
import React from './packages/plugin-web-ai-chat/node_modules/react/index.js';
import { createRoot } from './packages/plugin-web-ai-chat/node_modules/react-dom/client.js';
import { AiChatModule } from './packages/plugin-web-ai-chat/src/AiChatModule.tsx';
import { accountScope } from './packages/plugin-web-storage/src/index.ts';
const set=Storage.prototype.setItem;let denied=false,writes=0,iteration=0;
Storage.prototype.setItem=function(k,v){if(k==='xai_ai_insights'||k==='xai_ai_voice'){if(denied)throw new DOMException('synthetic quota','QuotaExceededError');writes++;}set.call(this,k,v);};
const root=createRoot(document.getElementById('app')!);
function reset(){denied=false;accountScope.activate(accountScope.lock('ai-preference-A-'+iteration),'native');set.call(localStorage,'xai_ai_insights','true');set.call(localStorage,'xai_ai_voice','false');writes=0;root.render(<AiChatModule key={++iteration} lang="en"/>);}
reset();
(window as any).probe={reset,deny:(v:boolean)=>{denied=v},writes:()=>writes,deviceValues:()=>['insights','voice'].map(p=>localStorage.getItem('xai_ai_'+p)),state:(p:string)=>({raw:localStorage.getItem('xai_ai_'+p),on:p==='insights'?!!document.querySelector('.ai-insights-toggle.on'):!!document.querySelector('button[aria-label="Voice on"]'),writes}),external:(p:string)=>set.call(localStorage,'xai_ai_'+p,p==='insights'?'false':'true'),switchB:()=>accountScope.activate(accountScope.lock('ai-preference-B'),'native')};
