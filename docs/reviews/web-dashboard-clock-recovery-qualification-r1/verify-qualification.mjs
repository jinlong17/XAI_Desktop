/** Q1 isolated oracle qualification. UNQUALIFIED until separate Q2 PASS.
 * Native input is pipe CDP; retained screenshots are never rescaled or registered.
 * --calibrate only serves inert controls. No product or recovery implementation.
 */
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import {isDeepStrictEqual} from 'node:util';
import {spawn,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync,mkdtempSync,mkdirSync,readdirSync,rmSync} from 'node:fs';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {createQualifiedPixelOracle} from './pixel-focus-qualified-r1.mjs';
const output=fileURLToPath(new URL('./',import.meta.url)),root=fileURLToPath(new URL('../../../',import.meta.url));
const P0='f9eb4b1f207bc4b46f547b90afc250424b3c8695',PARENT='710fd8421ed651ec366c5bb5e3b15fa5151ec7e6';
const sha256=b=>createHash('sha256').update(b).digest('hex');
const git=(...a)=>execFileSync('git',a,{cwd:root,maxBuffer:30*1024*1024});
const blockOf=source=>{const start=source.indexOf('\n/** A minimal PNG decoder (8-bit')+1,fn=source.indexOf('\nasync function pixelFocusWalk(',start)+1,end=source.indexOf('\n}\n',fn)+3;return{block:source.slice(start,end),fn:source.slice(fn,end)};};
const refs=[
 {unit:'appearance-fapp1',product:'24073b522262d8b4bec0abfa29347db28adbdd9e',evidence:'5307b6f514c8d0343de02869fb469b853d38cb7e',runner:'docs/reviews/web-appearance-recovery-native/verify-visual-keyboard.mjs',prefix:'docs/reviews/web-appearance-recovery-native/native-24073b5-fixed1-keyboard-',expected:'F-APP-1 FAIL: font slider, 5 failed checks per language; harness valid; E14 unlaunched'},
 {unit:'appearance-fapp2',product:'5bbf473872073472188957f430057412e8798131',evidence:'bacdbbc17d395e320cd100234aa5738cdbae3414',runner:'docs/reviews/web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs',prefix:'docs/reviews/web-appearance-recovery-native/native-5bbf473-fixed1-keyboard-',expected:'F-APP-2 FAIL: selected swatch, 5 failed checks per language; repaired font slider PASS; E14 unlaunched'},
 {unit:'appearance-accepted',product:'419e56de9f23e4467fea806fbd4a990e1f429941',evidence:'2696855b80a20d2c18da6304d2c13f67fce40b8a',runner:'docs/reviews/web-appearance-recovery-native/verify-visual-keyboard-419e56d.mjs',prefix:'docs/reviews/web-appearance-recovery-native/native-419e56d-fixed1-',expected:'Accepted Appearance E14/E15 PASS; F-APP-3 Topbar popover observation retained'},
 {unit:'apprail-accepted',product:P0,evidence:'5c6bcd2830f08f3b0fc4a5bfc902268004484d86',runner:'docs/reviews/web-apprail-order-recovery-native/verify-native-keyboard-f9eb4b1.mjs',prefix:'docs/reviews/web-apprail-order-recovery-native/native-f9eb4b1-fixed1-keyboard-',expected:'Accepted AppRail E14 PASS; F-E14-1 partial panel occlusion observation retained'}
];
export function inventory(){
 const refSource=git('show','bacdbbc17d395e320cd100234aa5738cdbae3414:docs/reviews/web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs').toString(),frozen=blockOf(refSource);
 const cp=git('show',PARENT+':docs/reviews/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md');
 if(sha256(cp)!=='46f1e38ca3c454251de2ed2778949a156bf471240b88308da27e491591e79409')throw Error('authorization blob mismatch');
 if(sha256(refSource)!=='5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4'||sha256(frozen.block)!=='e024c90e7c038fc4bd704b159bd7a144abc2fb34cfe7583eda8c8d0c6c2e5a43'||sha256(frozen.fn)!=='1cdb0c13e10219267a2a03118d58c09744ee88f875c0dd29b4071a69c17a0620')throw Error('frozen identity mismatch');
 const hist=refs.map(ref=>{
  const paths=git('ls-tree','-r','--name-only',ref.evidence,'--',ref.runner.split('/').slice(0,-1).join('/')).toString().trim().split('\n');
  const inputs=paths.filter(p=>p===ref.runner||/\.(mjs|tsx|js|md)$/.test(p)||p.startsWith(ref.prefix));
  const hashes=Object.fromEntries(inputs.map(p=>[p,sha256(git('show',ref.evidence+':'+p))]));
  const source=git('show',ref.evidence+':'+ref.runner).toString();
  const matrix={modes:['keyboard-en','keyboard-zh'],viewports:{en:{width:1024,height:768,mobile:false},zh:{width:375,height:812,mobile:true},petToggleRoundTrip:{width:1440,height:900,mobile:false,conditional:true}},themes:['light','dark'],allHistoricalSections:source.match(/const SECTIONS[^\n]*/)?.[0]||null,fullFocusStates:ref.unit==='apprail-accepted'?['control-419e56d-clean-light','control-419e56d-clean-dark','clean-light','clean-dark','failed-closed-light','failed-closed-dark','failed-open-light','failed-open-dark','source-open-light','source-open-dark','order-failed-light-premium-badge-appearance-draft-panel-opened-by-Enter','order-source-light-premium-badge-panel-opened-by-Enter']:['focus-visibility-fixed-default-light-hue-slider-font-slider','focus-visibility-before-5cd63ff-default-light-hue-slider-font-slider','tab-clean-light','tab-drafts-all-seven-opposite-language-nondefault-dark','tab-source-railPos-diagonal-light','discard-density-Enter-accentHue-Space','retry-theme-dark-failing-Space-success-Enter','reload-railPos-diagonal-unrepaired-Enter-external-top-repaired-Space','discard-all-Enter-focus-reset','retry-all-disabled-clean-pending-source','retry-all-open-pass-held-then-success','retry-all-open-pass-held-then-new-failure','topbar-status-on-appTasks-Enter-Space-return-to-Appearance',...(ref.unit!=='appearance-fapp1'?['selected-swatch-fixed-default-light-0-and-1','selected-swatch-fixed-hue230-light-1-and-2','selected-swatch-before-5cd63ff-default-light-0-and-1']:[]),...(ref.unit==='appearance-accepted'?['sel-light-a-system-compact-hue35-cream-font0.9-top','sel-light-b-system-compact-hue295-lavender-font1.1-bottom','sel-dark-clean-dark-compact-hue230-mist-font1.05-right','sel-dark-failed-seven-actual-faults-hue355-peach-font1.05-top','sel-dark-source-hue75-graphite-font1.15-railPos-diagonal','selected-ring-light-default-swatch0-v1','selected-ring-light-hue295-swatch4-v5','selected-ring-dark-hue230-swatch1-v2','selected-ring-dark-default-swatch0-v1','popover-focus-light-active-light-inactive-dark-all-seven-options','popover-focus-dark-active-dark-inactive-system-all-seven-options']:[])],unrerun:ref.unit==='apprail-accepted'?['activate (general action/storage/Space-scroll section, including private-focus positive scroll control)','non-focus downstream visual/cascade audit']:['visual-en','visual-zh','runVisual/css/before/states/breakpoints/presentation','cascadeAudit call paths in fixedState/appTasks/disabledPresentation','captureTall/pinScrollbarGutter','kbActivation/private-focus scrollPositiveControl','kbSliders/ArrowLeft/Home/End value persistence','kbReset/general reset persistence/confirmation; focus-targets via kbFocusTargets retained']};
  return {...ref,productTree:git('rev-parse',ref.product+'^{tree}').toString().trim(),evidenceTree:git('rev-parse',ref.evidence+'^{tree}').toString().trim(),productSubtrees:Object.fromEntries(['apps','packages','package.json','pnpm-lock.yaml'].map(p=>[p,git('rev-parse',ref.product+':'+p).toString().trim()])),docsProductDelta:git('diff','--name-only',ref.product,ref.evidence,'--','apps','packages','package.json','pnpm-lock.yaml').toString().trim(),matrix,inputs:hashes,retainedPairsComplete:false,reproductionRequired:true,viewportCallSites:source.split('\n').map((text,i)=>({line:i+1,text})).filter(x=>/setViewport\(|Emulation.setDeviceMetricsOverride/.test(x.text)),orchestration:historicalSource(ref),sourceInjections:source.split('\n').map((l,i)=>({line:i+1,text:l})).filter(x=>/adoptedStyleSheets|CSSStyleSheet|adopt.*copies|cascadeAudit/.test(x.text))};
 });
 return {parent:PARENT,product:P0,productTree:git('rev-parse',P0+'^{tree}').toString().trim(),authorization:sha256(cp),historical:hist,original:{file:sha256(refSource),block:sha256(frozen.block),function:sha256(frozen.fn)},candidate:blockOf(readFileSync(join(output,'pixel-focus-qualified-r1.mjs'),'utf8'))};
}
// Q1 explicitly extracted FOCUS orchestration; all original input/reference guards remain live.
export function historicalSource(ref){
 const original=git('show',ref.evidence+':'+ref.runner).toString();
 let source=original;const changes=[];
 const change=(reason,from,to)=>{if(!source.includes(from))throw Error('Extraction anchor missing: '+reason);changes.push({reason,from,to});source=source.replace(from,to);};
 change('Independent qualified-module import', 'import { createHash } from "node:crypto";', 'import { createHash } from "node:crypto";\nimport {createQualifiedPixelOracle} from "./q1-pixel-focus-qualified-r1.mjs";');
 if(!source.includes('from "node:zlib"'))change('Frozen decoder dependency only','import { isDeepStrictEqual } from "node:util";','import { isDeepStrictEqual } from "node:util";\nimport {inflateSync} from "node:zlib";');
 // Historical original files are preserved in a matching detached archive checkout. Generated driver has a new name.
 change('PNG names keep iteration last','const file = `${prefix}-${name}.png`;','const file = `${prefix.replace(/-i[123]$/,"")}-${name}-${suffix}.png`;');
 change('Distinct Q1 output, formal registered orchestration','const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? output;', 'const evidenceDir = process.env.XAI_Q1_OUT;\nif(!evidenceDir)throw Error("Q1 registered evidence directory required");');
 change('Unique full-product evidence prefix', 'const prefix = `native-${short}-${suffix}-${mode}`;', `const prefix = \`q1-${ref.unit}-\${resolved}-\${mode}-\${suffix}\`;`);
 // Stream archive bytes directly into tar. Existing lock, pin/guard, protected module and product equality assertions stay.
 const archiveLine=source.split('\n').find(l=>l.includes('execFileSync("tar", ["-x", "-C", snapshot]'));
 if(!archiveLine)throw Error('No exact historical archive transport anchor');
 change('Guard-preserving streamed immutable archive',archiveLine,'  await q1StreamArchive(revision,snapshot);');
 change('Await streamed archive construction','function extractArchive(revision) {','async function extractArchive(revision) {');
 for(const from of ['const archive = extractArchive(', 'const { snapshot, aliases } = extractArchive(', 'const fixedArchive = extractArchive(', 'const beforeArchive = extractArchive('])if(source.includes(from))change('Await identical archive result',from,from.replace('= extractArchive(','= await extractArchive('));
 if(source.includes('? extractArchive(BEFORE_REVISION) : null'))change('Await identical before control archive','? extractArchive(BEFORE_REVISION) : null','? await extractArchive(BEFORE_REVISION) : null');
 const appearance=ref.unit.startsWith('appearance-');
 if(appearance){
  // Retain every original contracted focus path. General persistence/reset/slider activation and visual cascade are unrerun.
  change('Explicit FOCUS matrix; no probe section filtering','const selected = (name) => SECTIONS === null || SECTIONS.includes(name);', 'const selected = (name) => ["focus-visibility","swatch-focus","tab","focus","retry-all","topbar","selection-walks","swatch-ring","popover-focus"].includes(name);');
  const start=source.indexOf('async function clickDesc('),end=source.indexOf('\n}\n',start)+3;
  if(start<0||end<=start)throw Error('Missing descriptor click');
  const before=source.slice(start,end);
  const after=`async function clickDesc(desc,label=desc,page=main){
  const selector=await evaluate(\`(()=>{const matches=[...document.querySelectorAll('button,input,a[href],[role="menuitemradio"]')].filter(e=>__visual.describeForQ1(e)===\${JSON.stringify(desc)});if(matches.length!==1)return null;const e=matches[0],all=[...document.querySelectorAll(e.tagName.toLowerCase())];return e.tagName.toLowerCase()+':nth-of-type('+([ ...e.parentElement.children].filter(n=>n.tagName===e.tagName).indexOf(e)+1)+')';})()\`,page);
  // Resolve exact native identity via the unchanged probe (no tagging). Stable hit-tested point is dispatched below.
  let p=await evaluate(\`__visual.probe(\${JSON.stringify(desc)})\`,page);pre(\`input:exactly-one-control:\${label}\`,p.found&&!p.ambiguous,{desc,p});
  for(let i=0;i<25;i++){await delay(80);const n=await evaluate(\`__visual.probe(\${JSON.stringify(desc)})\`,page);const steady=n.found&&Math.abs(n.rect.left-p.rect.left)<.5&&Math.abs(n.rect.top-p.rect.top)<.5;p=n;if(steady)break;}
  pre(\`input:centre-hit-test:\${label}\`,p.centerHit,{desc,p});const x=p.rect.left+p.rect.width/2,y=p.rect.top+p.rect.height/2;
  await input("Input.dispatchMouseEvent",{type:"mouseMoved",x,y},page);await input("Input.dispatchMouseEvent",{type:"mousePressed",x,y,button:"left",buttons:1,clickCount:1},page);await input("Input.dispatchMouseEvent",{type:"mouseReleased",x,y,button:"left",buttons:0,clickCount:1},page);await delay(60);return{x:round(x),y:round(y),width:p.rect.width,height:p.rect.height};
}`.replace(/  const selector=[\s\S]*?\n  \/\/ Resolve/,'  // Resolve');
  change('Read-only native identity and same stable centre click; no DOM tagging',before,after);
  if(ref.unit==='appearance-fapp1'){
   const start=source.indexOf('async function kbTabOrder()'),end=source.indexOf('\nasync function kbActivation()',start),originalTab=source.slice(start,end);
   const candidateTab=originalTab.replaceAll('    visibleFocusCheck(id, stops);','    visibleFocusCheck(id, stops);\n    await q1EquivalentWalk(id,{expectedStops:inside});').replace('    check(`${id}:pane-stops-in-dom-order-reload-after-the-sidebar-cards-retry-all-then-reset`,','    await q1EquivalentWalk(id);\n    check(`${id}:pane-stops-in-dom-order-reload-after-the-sidebar-cards-retry-all-then-reset`,');
   change('Add frozen-old/qualified full walks to three original F-APP-1 focus states; original assertions retained',originalTab,candidateTab);
  }else{
   // No edit to the frozen function/block: redirect caller sites only.
   source=source.replaceAll('await pixelFocusWalk(', 'await q1EquivalentWalk(');changes.push({reason:'Redirect original pixel caller sites to old/new wrapper; original frozen function/block unchanged',from:'await pixelFocusWalk(',to:'await q1EquivalentWalk('});
  }
 }else{
  change('Explicit FOCUS sections; non-focus activation/positive private-focus control unrerun','const selected = (name) => !ONLY || ONLY.includes(name);','const selected = (name) => ["walks","order"].includes(name);');
  source=source.replaceAll('await pixelFocusWalk(', 'await q1EquivalentWalk(');changes.push({reason:'Old/new wrapper at original full pixel walk caller',from:'await pixelFocusWalk(',to:'await q1EquivalentWalk('});
  // The order section has a real panel-opening Enter setup: add a stable complete measurement AFTER that setup.
  const anchor='    await endSegment(segment, ZERO);\n  }\n}\n\n// ---------------------------------------------------------------------------------------------------\n// Section "activate"';
  change('Measure original failed/source order state after its panel-opening setup with a full native census',anchor,'    await q1EquivalentWalk(id,{anchor:\'[data-testid="rail-order-message"]\'});\n'+anchor);
  const start=source.indexOf('  const tagged = await ev(page, `(() => {',source.indexOf('async function failTopbarTheme(')),end=source.indexOf('  const fired = ',start);
  const originalTag=source.slice(start,end);
  const readOnly=`  const selector=\`#topbar-pref-panel section[aria-label="\${facts0.labels[lang].settings.theme}"] [role="menuitemradio"][aria-label="\${facts0.labels[lang].settings.dark}"]\`;
  pre(\`\${label}:exactly-one-dark-option\`,await ev(page,\`document.querySelectorAll(\${JSON.stringify(selector)}).length===1\`));
  await trustedClick(page,selector,\`\${label}:topbar-dark\`);
`;
  change('Same exact theme option resolved read-only; no DOM target attributes',originalTag,readOnly);
 }
 if(appearance){
  for(const name of ['kbFocusVisibility','kbSelectedSwatchFocus','kbSelectedSwatchRing']){
   const start=source.indexOf('async function '+name+'(');if(start<0)continue;
   const end=source.indexOf('\nasync function ',start+1);const part=source.slice(start,end<0?source.length:end);
   const marker='  }\n  record(';const at=part.lastIndexOf(marker);if(at<0)throw Error('No custom-state closure '+name);
   const changed=part.slice(0,at)+'    await q1EquivalentWalk(id,{observationOnly:true});\n'+part.slice(at);
   change('Whole native cycle in every original custom focal state '+name,part,changed);
  }
  if(source.includes('async function kbPopoverFocusObservation(')){
   const from='    await press("Escape");\n    pre(`${id}:escape-closed-the-popover`';
   change('Whole native census in each open-popover light/dark state; nongated F-APP-3 stays observation',from,'    await q1EquivalentWalk(id,{anchor:".topbar-pref-panel .topbar-pref-head",observationOnly:true});\n'+from);
  }
 }
 const frozen=blockOf(git('show','bacdbbc17d395e320cd100234aa5738cdbae3414:docs/reviews/web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs').toString()).block;
 const q1Offset=ref.unit==='appearance-fapp1'?'async function pageOffset(page=main){return evaluate("({x:visualViewport.pageLeft,y:visualViewport.pageTop,scrollX,scrollY,scale:visualViewport.scale})",page);}\n':'';
 const glue=`\n${q1Offset}async function q1StreamArchive(revision,snapshot){
  await new Promise((resolve,reject)=>{const archive=spawn("git",["archive",revision],{cwd:root,stdio:["ignore","pipe","pipe"]}),tar=spawn("tar",["-x","-C",snapshot],{stdio:["pipe","ignore","pipe"]});let a=null,t=null,bytes=0,errors="";archive.stdout.on("data",d=>bytes+=d.length);archive.stdout.pipe(tar.stdin);archive.stderr.on("data",d=>errors+=d);tar.stderr.on("data",d=>errors+=d);const done=()=>{if(a===null||t===null)return;if(a!==0||t!==0)reject(Error("Archive refused "+revision+" "+errors));else{record("q1-streamed-archive",{revision,bytes});resolve();}};for(const p of [archive,tar])p.on("error",reject);archive.on("close",c=>{a=c;done();});tar.on("close",c=>{t=c;done();});});
}
const q1OriginalFactory=Function("ctx","inflateSync","isDeepStrictEqual","sha256","delay","const {main,evaluate,press,pre,checkDeferred,record,observe,clickAnchor,parkMouse,pageOffset,saveShot,currentWidth,HEIGHTS,short,PANE,KEYBOARD_WIDTH}=ctx;"+${JSON.stringify(frozen)}+";return {pixelFocusWalk,pixelWalkLog};");
let q1OldOracle=null,q1NewOracle=null,q1ObservationOnly=false;
async function q1EquivalentWalk(id,options={}){
  q1ObservationOnly=!!options.observationOnly;
  const ctx={main,evaluate,press,pre,checkDeferred,record,observe,clickAnchor,parkMouse,pageOffset,saveShot,currentWidth,HEIGHTS,short,PANE,KEYBOARD_WIDTH};
  const oldCtx={...ctx,saveShot:(name,...args)=>saveShot("q1-old-"+name,...args),record:(name,details)=>record("q1-old-"+name,details)};
  ${ref.unit==='appearance-fapp1'?'oldCtx.checkDeferred=(id,pass,details)=>record("q1-additional-old-measurement",{id,pass,...details});':''}
  const oldCheck=oldCtx.checkDeferred;oldCtx.checkDeferred=(id,pass,details)=>q1ObservationOnly?record("q1-additional-old-measurement",{id,pass,...details}):oldCheck(id,pass,details);
  q1OldOracle??=q1OriginalFactory(oldCtx,inflateSync,isDeepStrictEqual,sha256,delay);
  const oldRows=await q1OldOracle.pixelFocusWalk(id,options);
  const newCtx={...ctx,saveShot:(name,...args)=>saveShot("q1-new-"+name,...args),record:(name,details)=>record("q1-new-"+name,details),checkDeferred:(id,pass,details)=>record("q1-new-observation",{id,pass,...details})};
  q1NewOracle??=createQualifiedPixelOracle(newCtx);
  const newRows=await q1NewOracle.pixelFocusWalk(id,options);
  const verdict=rows=>rows.map(r=>({desc:r.desc,visible:r.visible}));record("q1-native-equivalence",{id,original:verdict(oldRows),candidate:verdict(newRows)});
  pre(id+":q1-full-stop-original-candidate-equivalence",isDeepStrictEqual(verdict(oldRows),verdict(newRows)));return oldRows;
}
`;
 const runMarker='// Run\n// ---------------------------------------------------------------------------------------------------';
 change('Separately versioned measurement orchestration before original run',runMarker,runMarker+glue);
 // Original headers remain historical provenance text. Explicit executable bookkeeping shows actual orchestration identity.
 return {source,sha256:sha256(source),originalSha256:sha256(original),changes,original};
}

const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function browser(){
 const profile=mkdtempSync(join(tmpdir(),'xai-q1-inert-profile-'));
 const proc=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-sync','--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','ignore','pipe','pipe']});
 let seq=0,pending=new Map(),buffer='',events=[];
 proc.stdio[4].on('data',data=>{buffer+=data.toString();let end;while((end=buffer.indexOf('\0'))>=0){const m=JSON.parse(buffer.slice(0,end));buffer=buffer.slice(end+1);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p?.reject(Error(JSON.stringify(m.error)));else p?.resolve(m.result);}else events.push(m);}});
 proc.on('exit',()=>{for(const p of pending.values())p.reject(Error('Chrome exited'));pending.clear();});
 const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});proc.stdio[3].write(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})})+'\0');});
 const target=await send('Target.createTarget',{url:'about:blank'}),session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;
 const cdp=(method,params={})=>send(method,params,session);
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Accessibility.enable');await cdp('DOM.enable');
 return{cdp,events,version:await send('Browser.getVersion'),async close(){try{await send('Browser.close');}catch{}if(proc.exitCode===null)proc.kill('SIGTERM');rmSync(profile,{recursive:true,force:true});}};
}
function originalPixelFactory(ctx){
 const ref=git('show','bacdbbc17d395e320cd100234aa5738cdbae3414:docs/reviews/web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs').toString(),frozen=blockOf(ref);
 if(sha256(ref)!=='5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4'||sha256(frozen.block)!=='e024c90e7c038fc4bd704b159bd7a144abc2fb34cfe7583eda8c8d0c6c2e5a43'||sha256(frozen.fn)!=='1cdb0c13e10219267a2a03118d58c09744ee88f875c0dd29b4071a69c17a0620')throw Error('Original controls identity mismatch');
 return Function('ctx','inflateSync','isDeepStrictEqual','sha256','delay','const {main,evaluate,press,pre,checkDeferred,record,observe,clickAnchor,parkMouse,pageOffset,saveShot,currentWidth,HEIGHTS,short,PANE,KEYBOARD_WIDTH}=ctx;'+frozen.block+';return {pixelFocusWalk,pixelWalkLog};')(ctx,inflateSync,isDeepStrictEqual,sha256,delay);
}
const FOCUS_CASES=['transformed-next-only','unselected','selected','active','inactive','transformed','no-focus','masked','outline-none','occluded','next-only','next-overlap','scroll-drift','ancestor-scroll','hover-drift','unstable','missing-stop','duplicate-stop','closure','excess-body','body-landing','partial-occluded','ring-occluded','clipped'];
const INVALID=new Set(['scroll-drift','ancestor-scroll','hover-drift','unstable','missing-stop','duplicate-stop','closure','excess-body','partial-occluded','ring-occluded','clipped','next-overlap']);
const RELOAD_CASES=['valid','synonym','missing-label','wrong-visible','wrong-accessible','wrong-field','duplicate','missing-action','retry','discard','export','inline-export','outside-block','wrong-message'];
function reloadJudge(){const source=readFileSync(join(output,'verify-native-geometry-reload-r1.mjs'),'utf8'),start=source.indexOf('  const judgeReload = ')+22,end=source.indexOf('\n  // Q1_RELOAD_JUDGE_END',start);return Function('return ('+source.slice(start,end).trim().replace(/;$/,'')+')')();}
async function reloadObservation(b){
 const ax=new Map((await b.cdp('Accessibility.getFullAXTree')).nodes.filter(n=>!n.ignored&&n.backendDOMNodeId&&n.name).map(n=>[n.backendDOMNodeId,n.name.value]));
 const doc=await b.cdp('DOM.getDocument',{depth:0}),blocks=[];
 for(const field of ['style','timezone']){const nodes=(await b.cdp('DOM.querySelectorAll',{nodeId:doc.root.nodeId,selector:'[data-clock-recovery="'+field+'"]'})).nodeIds;
 for(const nodeId of nodes){const obj=await b.cdp('DOM.resolveNode',{nodeId}),text=await b.cdp('Runtime.callFunctionOn',{objectId:obj.object.objectId,functionDeclaration:'function(){return this.textContent;}',returnByValue:true}),actions=[];
 for(const id of (await b.cdp('DOM.querySelectorAll',{nodeId,selector:'button'})).nodeIds){const n=await b.cdp('DOM.describeNode',{nodeId:id}),o=await b.cdp('DOM.resolveNode',{nodeId:id}),v=await b.cdp('Runtime.callFunctionOn',{objectId:o.object.objectId,functionDeclaration:'function(){return this.innerText;}',returnByValue:true});actions.push({visible:v.result.value,accessible:ax.get(n.node.backendNodeId)??null});}blocks.push({field,text:text.result.value,actions});}}
 return blocks;
}
async function isolated(unit,iteration,calibration=false){
 const prefix=`q1-${unit}-${P0}-${calibration?'development-calibration':'controls'}-i${iteration}`;
 const logPath=join(output,prefix+'.log');if(existsSync(logPath))throw Error('Refuse overwrite '+logPath);
 const records=[],files=[],presses=[],result={status:'UNQUALIFIED',formal:!calibration,unit,iteration,checks:0,failures:0};
 const record=(name,value={})=>records.push({name,...value});
 const pre=(id,condition,detail={})=>{result.checks++;record('check',{id,kind:'precondition',pass:!!condition,...detail});if(!condition)throw Error('PRECONDITION: '+id);};
 const checkDeferred=(id,condition,detail={})=>record('business',{id,pass:!!condition,...detail});
 const observe=(id,detail={})=>record('observation',{id,...detail});
 const server=createServer((req,res)=>{const url=new URL(req.url,'http://127.0.0.1');const path=join(output,unit==='focus-controls'?'focus-controls.html':'reload-controls.html');res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(readFileSync(path));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 let b=null;
 try{
  b=await browser();record('baseline',{product:P0,parent:PARENT,browser:b.version,origin,isolatedInertFixture:true,source:Object.fromEntries(['verify-qualification.mjs','pixel-focus-qualified-r1.mjs','focus-controls.html','reload-controls.html','verify-native-geometry-reload-r1.mjs'].map(f=>[f,sha256(readFileSync(join(output,f)))]))});
  const evaluate=async expression=>{const r=await b.cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text+' '+r.exceptionDetails.exception?.description);return r.result.value;};
  const input=async(type,params)=>{await b.cdp(type,params);};
  let pressCount=0,variant='';
  const press=async key=>{pressCount++;if(variant==='hover-drift'&&pressCount===2)await input('Input.dispatchMouseEvent',{type:'mouseMoved',x:150,y:100});const reverse=(variant==='duplicate-stop'||variant==='excess-body')&&pressCount===4;const actual=key,modifiers=reverse?8:0;const code=key==='Tab'?'Tab':key==='Enter'?'Enter':'Space',vk=key==='Tab'?9:key==='Enter'?13:32;presses.push({type:'keydown',key:actual,shiftKey:!!modifiers},{type:'keyup',key:actual,shiftKey:!!modifiers});await input('Input.dispatchKeyEvent',{type:'rawKeyDown',key:actual,code,windowsVirtualKeyCode:vk,modifiers});await input('Input.dispatchKeyEvent',{type:'keyUp',key:actual,code,windowsVirtualKeyCode:vk,modifiers});await delay(30);};
  const parkMouse=()=>input('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:2});
  const clickAnchor=async(selector,id)=>{const p=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;return {x,y,hit:e.contains(document.elementFromPoint(x,y))};})()`);pre(id+':hit-tested',p.hit,{p});for(const type of ['mouseMoved','mousePressed','mouseReleased'])await input('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,...(type!=='mouseMoved'?{button:'left',clickCount:1}:{})});};
  const saveShot=async(name,data,details)=>{const path=`q1-${unit}-${P0}-${calibration?'development-calibration':'controls'}-${name}-i${iteration}.png`;writeFileSync(join(output,path),Buffer.from(data,'base64'),{flag:'wx'});const item={file:path,sha256:sha256(Buffer.from(data,'base64')),...details};files.push(item);record('screenshot',item);return item;};
  const languages=calibration?['en']:['en','zh'],themes=calibration?['light']:['light','dark'],widths=calibration?[375]:[375,768,1440];
  const cases=unit==='focus-controls'?(calibration?['transformed','partial-occluded','ring-occluded']:FOCUS_CASES):RELOAD_CASES;
  record('coverage',{languages,themes,widths,cases,field:unit==='reload-controls'?['style','timezone']:null,calibration});
  for(const lang of languages)for(const theme of themes)for(const width of widths)for(const test of cases)for(const field of (unit==='reload-controls'?['style','timezone']:['style'])){
   variant=test;pressCount=0;const id=`${lang}-${theme}-${width}-${test}-${field}`;
   await b.cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
   await b.cdp('Page.navigate',{url:origin+'/?'+new URLSearchParams({lang,theme,case:test,field})});
   for(let count=0;count<100;count++){if(await evaluate('document.readyState=== "complete" && !!document.querySelector("#blocks, #target")'))break;await delay(20);}
   const screenshot=(await b.cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data;await saveShot(id+'-initial',screenshot,{width,height:900});
   if(unit==='reload-controls'){
    const blocks=await reloadObservation(b),exportPresent=await evaluate('!!document.querySelector("[data-testid=clock-export-draft]")'),actual=reloadJudge()(blocks,field,lang,exportPresent),expected=test==='valid'||(test==='synonym'&&lang==='en');
    const original=blocks.length===1&&await evaluate(`(()=>{const controls=[...document.querySelectorAll('button')].map(e=>e.getAttribute('aria-label')||e.title||e.textContent?.trim());return controls.some(name=>/Reload|重新加载/.test(name??''));})()`);
    record('reload-control',{id,blocks,inlineExport:exportPresent,actual,expected,original});pre(id+':exact-visible-and-AX-name-discrimination',actual===expected,{actual,expected});
   }else{
    const ctx={main:b,evaluate,press,pre,checkDeferred,record,observe,clickAnchor,parkMouse,pageOffset:()=>evaluate('({x:visualViewport.pageLeft,y:visualViewport.pageTop,scrollX,scrollY,scale:visualViewport.scale})'),saveShot,currentWidth:width,HEIGHTS:{[width]:900},short:P0.slice(0,7),PANE:'.controls',KEYBOARD_WIDTH:width};
    let oldActual=null,oldError=null,oldFrames=0;
    const oldCtx={...ctx,main:{cdp:async(method,params)=>{const value=await b.cdp(method,params);if(method==='Page.captureScreenshot')await saveShot(id+'-original-native-frame-'+(++oldFrames),value.data,{original:true,method,params,nativeUnscaled:true});return value;}},pre:(name,condition,details)=>pre(name+':original',condition,details),record:(name,details)=>record('original-'+name,details),saveShot:(name,...args)=>saveShot(id+'-original-'+name,...args)};
    try{const rows=await originalPixelFactory(oldCtx).pixelFocusWalk(id,{anchor:'#anchor',max:test==='closure'?2:12});oldActual=rows.find(r=>r.desc.includes('target'))?.visible??false;if(test==='body-landing'){await clickAnchor('#target',id+':original-action');oldActual=!(await evaluate('document.activeElement===document.body'));}}catch(e){oldError=e.message;}
    record('original-focus-control',{id,actual:oldActual,error:oldError,frames:oldFrames,expectedDisposition:['transformed','partial-occluded','ring-occluded','transformed-next-only'].includes(test)?'original-aligned-refusal':'original-measurement-retained-without-retroactive-rewrite'});
    if(test==='transformed')pre(id+':original-transformed-aligned-refusal-preserved',!!oldError&&/stable-aligned|aligned|captured-twice/.test(oldError),{oldError});
    const oldAudit=await evaluate('keyAudit'),oldTrace=presses.splice(0);pre(id+':original-trusted-passive-key-audit',oldAudit.every(x=>x.trusted)&&isDeepStrictEqual(oldAudit.map(({type,key,shiftKey})=>({type,key,shiftKey})),oldTrace),{oldAudit,oldTrace});
    // Reload the same inert fixture for the candidate: original negative controls may have removed their own nodes.
    await b.cdp('Page.navigate',{url:origin+'/?'+new URLSearchParams({lang,theme,case:test,field})});for(let count=0;count<100;count++){if(await evaluate('document.readyState=== "complete" && !!document.querySelector("#target")'))break;await delay(20);}pressCount=0;
    let actual=null,error=null;
    try{const rows=await createQualifiedPixelOracle(ctx).pixelFocusWalk(id,{anchor:'#anchor',max:test==='closure'?2:12});actual=rows.find(r=>r.desc.includes('target'))?.visible??false;if(test==='body-landing'){await clickAnchor('#target',id+':action');actual=!(await evaluate('document.activeElement===document.body'));}}catch(e){error=e.message;}
    const expected=INVALID.has(test)?'invalid':['no-focus','masked','outline-none','occluded','next-only','transformed-next-only','body-landing'].includes(test)?false:true;
    record('focus-control',{id,actual,error,expected,expectedDisposition:expected==='invalid'?'intentionally-induced-measurement-precondition-refusal':expected===false?'valid-measurement-visible-focus-or-body-landing-failure':'valid-measurement-visible-focus-pass'});pre(id+':candidate-discrimination',expected==='invalid'?!!error&&new RegExp(['missing-stop','duplicate-stop','excess-body'].includes(test)?'census|full-native-cycle-census-closure':test==='closure'?'full-native-cycle-census-closure':'all-stops-valid-stable-attributable-captures').test(error):error===null&&actual===expected,{actual,error,expected});
    const audit=await evaluate('keyAudit'),trace=presses.splice(0);pre(id+':trusted-passive-key-audit',audit.every(x=>x.trusted)&&isDeepStrictEqual(audit.map(({type,key,shiftKey})=>({type,key,shiftKey})),trace),{audit,trace});
   }
  }
  result.status='AUTHOR_CONTROLS_PASS_UNQUALIFIED';
 }catch(e){result.status='BLOCKED';result.error=e.stack;result.failures++;record('stop',{error:e.stack});process.exitCode=1;}
 finally{if(b)await b.close();await new Promise(r=>server.close(r));result.artifacts=files;record('result',result);writeFileSync(logPath,records.map(x=>JSON.stringify(x)).join('\n')+'\n',{flag:'wx'});writeFileSync(join(output,prefix+'.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({log:logPath,...result,artifacts:files.length}));}
}
async function streamArchive(revision,destination){
 await new Promise((resolve,reject)=>{const a=spawn('git',['archive',revision],{cwd:root,stdio:['ignore','pipe','pipe']}),t=spawn('tar',['-x','-C',destination],{stdio:['pipe','ignore','pipe']});let ac=null,tc=null,error='';a.stdout.pipe(t.stdin);for(const p of [a,t]){p.on('error',reject);p.stderr.on('data',b=>error+=b);}const done=()=>{if(ac===null||tc===null)return;if(ac||tc)reject(Error(`archive refused ${revision}: ${error}`));else resolve();};a.on('close',n=>{ac=n;done();});t.on('close',n=>{tc=n;done();});});
}
async function matchingCheckout(evidence){
 const checkout=mkdtempSync(join(tmpdir(),'xai-q1-matching-'+evidence.slice(0,7)+'-'));
 await streamArchive(evidence,checkout);execFileSync('git',['init','-q',checkout]);
 const objects=resolve(root,git('rev-parse','--git-common-dir').toString().trim(),'objects');
 mkdirSync(join(checkout,'.git/objects/info'),{recursive:true});writeFileSync(join(checkout,'.git/objects/info/alternates'),objects+'\n',{flag:'wx'});
 execFileSync('git',['-C',checkout,'update-ref','HEAD',evidence]);
 const actual=execFileSync('git',['-C',checkout,'rev-parse','HEAD'],{encoding:'utf8'}).trim();if(actual!==evidence)throw Error('Matching archive docs HEAD mismatch');return checkout;
}
function subprocess(command,args,env){return new Promise((resolve,reject)=>{const p=spawn(command,args,{cwd:root,env:{...process.env,...env},stdio:['ignore','pipe','pipe']});let stdout='',stderr='';p.stdout.on('data',b=>{stdout+=b;process.stdout.write(b);});p.stderr.on('data',b=>{stderr+=b;process.stderr.write(b);});p.on('error',reject);p.on('close',(code,signal)=>resolve({code,signal,stdout,stderr}));});}
export function geometrySource(phase){
 const path=phase==='old'?'docs/reviews/web-dashboard-clock-recovery-native/verify-native-geometry.mjs':'docs/reviews/web-dashboard-clock-recovery-qualification-r1/verify-native-geometry-reload-r1.mjs';
 const original=phase==='old'?git('show',PARENT+':'+path).toString():readFileSync(join(root,path),'utf8');let source=original;const changes=[];
 const change=(reason,from,to)=>{if(!source.includes(from))throw Error('Geometry extraction anchor '+reason);source=source.replace(from,to);changes.push({reason,from,to});};
 change('Exact registered formal output','const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? '+(phase==='old'?'output':'candidateOutput')+';','const evidenceDir=process.env.XAI_Q1_OUT;\nif(!evidenceDir)throw Error("Q1 output required");');
 change('Original fixture stays immutable, source has independent location',phase==='old'?'const output = fileURLToPath(new URL("./", import.meta.url));':'const output = fileURLToPath(new URL("../web-dashboard-clock-recovery-native/", import.meta.url));','const output = fileURLToPath(new URL("../web-dashboard-clock-recovery-native/", import.meta.url));');
 // The geometry origin already streams git archive through tar, with digest/exit guards; retain it unchanged.
 const oldLog=phase==='old'?'`native-${short}-${suffix}-${mode}.log`':'`q1-geometry-reload-p0-${resolved}-${mode}-${suffix}.log`';
 change('Separate original/corrected full-product outputs',oldLog,`\`q1-geometry-reload-p0-\${resolved}-${phase}-\${mode}-\${suffix}.log\``);
 const shot=phase==='old'?'`native-${short}-${suffix}-${mode}-${name}.png`':'`q1-geometry-reload-p0-${resolved}-${mode}-${name}-${suffix}.png`';
 change('Native screenshots, iteration last',shot,`\`q1-geometry-reload-p0-\${resolved}-${phase}-\${mode}-\${name}-\${suffix}.png\``);
 return {source,sha256:sha256(source),originalSha256:sha256(original),changes,original};
}
async function composedUnit(unit,iteration){
 const ref=refs.find(r=>r.unit===unit),product=ref?.product??P0,evidence=ref?.evidence??PARENT;
 const logFile=join(output,`q1-${unit}-${product}-orchestration-i${iteration}.log`),summaryFile=join(output,`q1-${unit}-${product}-orchestration-i${iteration}.json`);
 if(existsSync(logFile)||existsSync(summaryFile))throw Error('Refuse orchestration overwrite');
 const records=[],status={unit,iteration,status:'UNQUALIFIED',product,evidence,formal:true,children:[]};let checkout;
 try{
  checkout=await matchingCheckout(evidence);const dir=join(checkout,'docs/reviews/web-dashboard-clock-recovery-qualification-r1');mkdirSync(dir,{recursive:true});
  for(const name of ['pixel-focus-qualified-r1.mjs','native-clock-focus-probes-r1.js'])writeFileSync(join(dir,name),readFileSync(join(output,name)),{flag:'wx'});
  if(ref){
   const generated=historicalSource(ref),historicalDir=join(checkout,dirname(ref.runner));writeFileSync(join(historicalDir,'q1-pixel-focus-qualified-r1.mjs'),readFileSync(join(output,'pixel-focus-qualified-r1.mjs')),{flag:'wx'});
   const driver=join(historicalDir,`q1-${unit}-driver.mjs`);writeFileSync(driver,generated.source,{flag:'wx'});
   for(const lang of ['en','zh']){
    const child=await subprocess(process.execPath,[driver,product,'keyboard-'+lang,'i'+iteration],{XAI_Q1_OUT:output,XAI_DEPS_ROOT:'/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop'});
    status.children.push({mode:'keyboard-'+lang,...child,sourceSha256:generated.sha256});records.push({name:'child-exit',mode:'keyboard-'+lang,...child});
    const log=join(output,`q1-${unit}-${product}-keyboard-${lang}-i${iteration}.log`);if(!existsSync(log))throw Error('Historical refusal before retained inner log: '+child.stderr);
    const raw=readFileSync(log,'utf8').trim().split('\n').map(JSON.parse),result=raw.findLast(x=>x.name==='result');
    const expectedFail=unit==='appearance-fapp1'||unit==='appearance-fapp2';if(!result?.harnessValid||child.code!==(expectedFail?2:0))throw Error('Historical native outcome contradiction '+JSON.stringify(result));
    const oldFailures=raw.filter(x=>x.name==='check'&&x.kind==='product'&&!x.pass);if(expectedFail&&oldFailures.length!==5)throw Error('Original failure count changed '+oldFailures.length);
   }
  }else{
   for(const phase of ['old','new']){
    const generated=geometrySource(phase),driver=join(dir,'q1-geometry-'+phase+'.mjs');writeFileSync(driver,generated.source,{flag:'wx'});
    const child=await subprocess(process.execPath,[driver,P0,'geometry','i'+iteration],{XAI_Q1_OUT:output,XAI_DEPS_ROOT:'/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop'});status.children.push({phase,...child,sourceSha256:generated.sha256});records.push({name:'child-exit',phase,...child});
    const log=join(output,`q1-${unit}-${P0}-${phase}-geometry-i${iteration}.log`);if(!existsSync(log))throw Error('Geometry refusal before inner log: '+child.stderr);
    const raw=readFileSync(log,'utf8').trim().split('\n').map(JSON.parse),verdicts=raw.filter(x=>x.name==='verdict'),count=(suffix,holds)=>verdicts.filter(x=>x.id.endsWith(suffix)&&x.requirementHolds===holds).length;
    const actual={obstruction:count('pet-hidden-every-Clock-control-centre-uncovered',false),failedMissing:count('failed-field-recovery-controls-present',false),sourceMissing:count('source-only-reload-present',false),overflowPass:count('no-horizontal-document-or-Dashboard-overflow',true)};
    if(child.code!==0||JSON.stringify(actual)!==JSON.stringify({obstruction:48,failedMissing:30,sourceMissing:20,overflowPass:60}))throw Error('P0 original/corrected full geometry contradiction '+JSON.stringify(actual));records.push({name:'geometry-preserved-before',phase,actual});
   }
  }
  status.status='AUTHOR_EQUIVALENCE_PASS_UNQUALIFIED';
 }catch(e){status.status='BLOCKED';status.error=e.stack;process.exitCode=1;records.push({name:'stop',error:e.stack});}
 finally{if(checkout)rmSync(checkout,{recursive:true,force:true});records.push({name:'result',...status});writeFileSync(logFile,records.map(x=>JSON.stringify(x)).join('\n')+'\n',{flag:'wx'});writeFileSync(summaryFile,JSON.stringify(status,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({unit,status:status.status,logFile}));}
}

function readFrozenManifest(){
 const bytes=readFileSync(join(output,'manifest.md')),match=bytes.toString().match(/<!-- Q1_FROZEN_JSON -->\s*```json\n([\s\S]*?)\n```/);if(!match)throw Error('No fixed machine manifest');
 return {hash:sha256(bytes),data:JSON.parse(match[1])};
}
function reserveFormal(unit,iteration){
 const ref=refs.find(r=>r.unit===unit),product=ref?.product??P0,prefix=`q1-${unit}-${product}-reservation-`;
 if(!['focus-controls','reload-controls','geometry-reload-p0',...refs.map(r=>r.unit)].includes(unit)||![1,2,3].includes(iteration))throw Error('Unregistered formal unit/cap');
 const prior=readdirSync(output).filter(n=>n.startsWith(prefix)&&/-i[123]\.json$/.test(n));
 if(prior.length>=3||iteration!==prior.length+1)throw Error('Cumulative formal cap/order: '+unit+' used '+prior.length);
 const path=join(output,prefix+`i${iteration}.json`),receipt={unit,product,iteration,formalDiagnostic:true,includesRefusals:true,startedAt:new Date().toISOString(),status:'RESERVED_NOT_RUN'};
 writeFileSync(path,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
 try{
  const frozen=readFrozenManifest();receipt.manifestSha256=frozen.hash;
  if(process.env.XAI_Q1_FORMAL_AUTH!==frozen.hash)throw Error('No controller scheduling receipt for frozen manifest');
  for(const [file,expected] of Object.entries(frozen.data.files))if(sha256(readFileSync(join(output,file)))!==expected)throw Error('Frozen source/input mismatch '+file);
  const inputs=inventory();for(const history of inputs.historical){if(history.docsProductDelta!=='')throw Error('Historical document/product mismatch '+history.unit);if(historicalSource(history).sha256!==frozen.data.generated[history.unit])throw Error('Historical orchestration hash mismatch '+history.unit);}
  for(const phase of ['old','new'])if(geometrySource(phase).sha256!==frozen.data.generated['geometry-'+phase])throw Error('Geometry orchestration hash mismatch '+phase);
  if(inputs.authorization!==frozen.data.authorization||inputs.productTree!==frozen.data.productTree)throw Error('Authorization/product tree mismatch');
  receipt.status='PREFLIGHT_PASSED';
 }catch(e){receipt.status='REFUSED_FORMAL_DIAGNOSTIC';receipt.error=e.stack;writeFileSync(path,JSON.stringify(receipt,null,2)+'\n');throw e;}
 writeFileSync(path,JSON.stringify(receipt,null,2)+'\n');return path;
}

const [command,unit,iterationText]=process.argv.slice(2);
if(command==='--inventory'){const inv=inventory();inv.candidate={block:sha256(inv.candidate.block),function:sha256(inv.candidate.fn)};console.log(JSON.stringify(inv,null,2));}
else if(command==='--calibrate'){if(unit!=='focus-controls')throw Error('Only isolated focus static calibration registered');await isolated(unit,Number(iterationText),true);}
else if(command==='--formal'){
 const iteration=Number(iterationText);reserveFormal(unit,iteration);
 if(['focus-controls','reload-controls'].includes(unit))await isolated(unit,iteration,false);else if([...refs.map(r=>r.unit),'geometry-reload-p0'].includes(unit))await composedUnit(unit,iteration);else throw Error('Unregistered unit');
}else if(command)throw Error('Unsupported command');
