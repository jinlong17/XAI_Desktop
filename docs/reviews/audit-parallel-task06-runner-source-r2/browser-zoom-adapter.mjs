/** Genuine macOS Chrome View menu zoom. Never changes device/page/pinch scale. */
import {execFile} from 'node:child_process';
import {fail,hash} from './run-unit.mjs';
export async function browserZoom({page,scope,card,zoom,record}){
 if(![100,200].includes(zoom)||card.platform!=='darwin'||card.chromeBundle!=='com.google.Chrome')fail('ZOOM_ENVIRONMENT','Admitted visible macOS Google Chrome environment required');
 const metric=()=>page.evaluate('({width:innerWidth,height:innerHeight,dpr:devicePixelRatio,visualScale:visualViewport.scale,outerWidth,outerHeight,href:location.href})');
 const before=await metric();let child;
 // Require already foreground and target active; NEVER activate, force focus or synthesize a DOM key.
 const script=['tell application "System Events"','set p to first application process whose bundle identifier is "com.google.Chrome"','if frontmost of p is false then error "ZOOM_FOREGROUND"','tell p','click menu item "Actual Size" of menu "View" of menu bar 1',...(zoom===200?Array(5).fill('click menu item "Zoom In" of menu "View" of menu bar 1'):[]),'end tell','end tell'].join('\n');
 const run=()=>new Promise((res,rej)=>{child=execFile('/usr/bin/osascript',['-e',script],{maxBuffer:1024*1024},(e,stdout,stderr)=>{record('genuine-zoom-menu',{scriptSha256:hash(script),stdout,stderr});e?rej(e):res();});});
 await scope.operation('native-browser-zoom-menu',run,{ms:8000,cancel:()=>{child?.kill('SIGKILL');}});
 await page.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');const after=await metric();
 if(after.visualScale!==1||zoom===200&&Math.abs(after.dpr/before.dpr-2)>0.01||zoom===100&&Math.abs(after.dpr-card.nativeDevicePixelRatio)>0.01)fail('ZOOM_MEASUREMENT','Menu zoom did not yield measured real zoom',{before,after,zoom});
 record('genuine-zoom-measurement',{before,after,zoom,mechanism:'Chrome View menu',nominal:card.nominalViewport});return {before,after,zoom};
}
