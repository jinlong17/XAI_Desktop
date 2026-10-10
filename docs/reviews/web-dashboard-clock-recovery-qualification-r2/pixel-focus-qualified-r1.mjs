import { createHash } from "node:crypto";
import { inflateSync } from "node:zlib";
import { isDeepStrictEqual } from "node:util";
const sha256=(v)=>createHash("sha256").update(v).digest("hex");
const delay=(ms)=>new Promise(r=>setTimeout(r,ms));
/** UNQUALIFIED Q1 candidate. Original decoder and aligned compareFocusBand preserved. */
export function createQualifiedPixelOracle({ main, evaluate, press, pre, checkDeferred, record, observe, clickAnchor, parkMouse, pageOffset, saveShot, currentWidth, HEIGHTS, short, PANE, KEYBOARD_WIDTH }) {
/** A minimal PNG decoder (8-bit RGB/RGBA, non-interlaced; Chrome's screenshot encoding), self-tested against the browser. */
function decodePng(buffer) {
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw Error("not a PNG");
  let offset = 8;
  let header = null;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") header = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), bitDepth: data[8], colorType: data[9], interlace: data[12] };
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    offset += 12 + length;
  }
  if (!header || header.bitDepth !== 8 || ![2, 6].includes(header.colorType) || header.interlace !== 0) throw Error(`unsupported PNG ${JSON.stringify(header)}`);
  const { width, height } = header;
  const channels = header.colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = new Uint8Array(width * height * 4);
  let previous = new Uint8Array(stride);
  let current = new Uint8Array(stride);
  let position = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[position];
    position += 1;
    for (let x = 0; x < stride; x += 1) {
      const value = raw[position + x];
      const left = x >= channels ? current[x - channels] : 0;
      const up = previous[x];
      const upLeft = x >= channels ? previous[x - channels] : 0;
      let decoded;
      if (filter === 0) decoded = value;
      else if (filter === 1) decoded = value + left;
      else if (filter === 2) decoded = value + up;
      else if (filter === 3) decoded = value + ((left + up) >> 1);
      else if (filter === 4) {
        const estimate = left + up - upLeft;
        const pa = Math.abs(estimate - left);
        const pb = Math.abs(estimate - up);
        const pc = Math.abs(estimate - upLeft);
        decoded = value + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft);
      } else throw Error(`bad PNG filter ${filter}`);
      current[x] = decoded & 255;
    }
    position += stride;
    for (let x = 0; x < width; x += 1) {
      const target = (y * width + x) * 4;
      out[target] = current[x * channels];
      out[target + 1] = current[x * channels + 1];
      out[target + 2] = current[x * channels + 2];
      out[target + 3] = channels === 4 ? current[x * channels + 3] : 255;
    }
    [previous, current] = [current, previous];
  }
  return { width, height, data: out };
}
const rgbaSha256 = (image) => sha256(Buffer.from(image.data.buffer, image.data.byteOffset, image.data.byteLength));
const PIXEL_MARGIN = 10;
/** Page helper for the pixel walk: a JS global only (no DOM change); placing = scrollIntoView of the measured element. */
const B48_PAGE_HELPER = `(() => {
  if (window.__q1) return "present";
  const visibleBox = (element) => {
    let box = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
    let fixed = getComputedStyle(element).position === "fixed";
    const rootStyle = getComputedStyle(document.documentElement);
    const bodyPropagates = rootStyle.overflowX === "visible" && rootStyle.overflowY === "visible";
    for (let node = element.parentElement; node && !fixed; node = node.parentElement) {
      const style = getComputedStyle(node);
      // The root's overflow (and the body's, when the root's is visible) applies to the viewport, not to a box.
      const propagatesToViewport = node === document.documentElement || (node === document.body && bodyPropagates);
      if (!propagatesToViewport && (style.overflowX !== "visible" || style.overflowY !== "visible")) {
        const rect = node.getBoundingClientRect();
        const left = rect.left + node.clientLeft;
        const top = rect.top + node.clientTop;
        box = { left: Math.max(box.left, left), top: Math.max(box.top, top), right: Math.min(box.right, left + node.clientWidth), bottom: Math.min(box.bottom, top + node.clientHeight) };
      }
      if (style.position === "fixed") fixed = true;
    }
    return box;
  };
  const scrolls = (element) => {
    const out = [{ name: "window", x: scrollX, y: scrollY }];
    for (let node = element.parentElement; node; node = node.parentElement) if (node.scrollTop || node.scrollLeft) out.push({ name: node.tagName.toLowerCase() + "." + String(node.className).trim().split(/\\s+/).join("."), x: node.scrollLeft, y: node.scrollTop });
    return out;
  };
  const outlineOf = (element) => { const style = getComputedStyle(element); return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) || 0, offset: Number.parseFloat(style.outlineOffset) || 0, color: style.outlineColor }; };
  const ids = new WeakMap(); let serial = 0;
  const nodeId = (node) => { if (!ids.has(node)) ids.set(node, ++serial); return ids.get(node); };
  const eligible = () => [...document.querySelectorAll('a[href], area[href], button, input:not([type="hidden"]), select, textarea, iframe, summary, [tabindex], [contenteditable=""], [contenteditable="true"]')].filter(e => e.tabIndex >= 0 && !e.disabled && !e.closest('[inert]') && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
  const rectOf = (e) => { const r=e.getBoundingClientRect(); return {left:r.left,top:r.top,right:r.right,bottom:r.bottom}; };
  const census = () => eligible().map(e => ({ node:nodeId(e), desc:window.__visual.activeDesc && e === document.activeElement ? window.__visual.activeDesc() : null, tabindex:e.tabIndex, rect:rectOf(e), outline:outlineOf(e) }));
  const metadata = (element,clip) => {
    const ancestors=[]; for(let n=element.parentElement;n;n=n.parentElement) ancestors.push({node:nodeId(n),rect:rectOf(n),scroll:{x:n.scrollLeft,y:n.scrollTop},transform:getComputedStyle(n).transform});
    const hover=[...document.querySelectorAll(':hover')].map(nodeId);
    const c=clip; const r=element.getBoundingClientRect(); const mask=[]; const occluders=new Map(); const nativeRingHits=new Map();
    for(let y=0;y<c.height;y++) for(let x=0;x<c.width;x++) {
      const X=Math.max(r.left+0.1,Math.min(r.right-0.1,c.x+x+0.5)); const Y=Math.max(r.top+0.1,Math.min(r.bottom-0.1,c.y+y+0.5));
      const actualX=c.x+x+0.5,actualY=c.y+y+0.5; const ringHit=document.elementFromPoint(actualX,actualY); if(actualX<r.left||actualX>r.right||actualY<r.top||actualY>r.bottom){const chain=[];for(let n=ringHit;n&&chain.length<8;n=n.parentElement)chain.push({node:nodeId(n),tag:n.tagName,className:typeof n.className==='string'?n.className:null});const key=JSON.stringify(chain);nativeRingHits.set(key,(nativeRingHits.get(key)||0)+1);} const hit=document.elementFromPoint(X,Y); const own=!!hit && element.contains(hit); mask.push(own?1:0);
      if(!own) { const chain=[]; for(let n=hit;n && chain.length<8;n=n.parentElement) chain.push({node:nodeId(n),tag:n.tagName,className:typeof n.className==='string'?n.className:null}); const key=JSON.stringify(chain); occluders.set(key,(occluders.get(key)||0)+1); }
    }
    // Conservatively reject foreign paint in the measured region, including hit-test-invisible overlays.
    const paintOverlaps=[...document.querySelectorAll('body *')].filter(n=>n!==element&&!element.contains(n)&&!n.contains(element)).map(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return {node:nodeId(n),tag:n.tagName,className:typeof n.className==='string'?n.className:null,rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom},display:s.display,visibility:s.visibility,opacity:Number(s.opacity),pointerEvents:s.pointerEvents};}).filter(n=>n.display!=='none'&&n.visibility==='visible'&&n.opacity>0&&n.rect.right>c.x&&n.rect.left<c.x+c.width&&n.rect.bottom>c.y&&n.rect.top<c.y+c.height);
    const ambiguousEffects=[element,...(()=>{const a=[];for(let n=element.parentElement;n;n=n.parentElement)a.push(n);return a;})()].flatMap(n=>{const s=getComputedStyle(n),effects=[];if(s.clipPath!=='none'||s.maskImage!=='none')effects.push({node:nodeId(n),clipPath:s.clipPath,maskImage:s.maskImage});for(const pseudo of ['::before','::after']){const p=getComputedStyle(n,pseudo);if(p.content!=='none'&&p.content!=='normal'&&p.display!=='none'&&p.visibility==='visible')effects.push({node:nodeId(n),pseudo,content:p.content,position:p.position});}return effects;});
    return {node:nodeId(element),ancestors,hover,paintOverlaps,ambiguousEffects,nativeRingHits:[...nativeRingHits].map(([chain,pixels])=>({chain:JSON.parse(chain),pixels})),window:{x:scrollX,y:scrollY,vx:visualViewport.pageLeft,vy:visualViewport.pageTop,scale:visualViewport.scale,width:innerWidth,height:innerHeight,dpr:devicePixelRatio},census:census(),mask:btoa(String.fromCharCode(...mask)),occluders:[...occluders].map(([chain,pixels])=>({chain:JSON.parse(chain),pixels})),running:document.getAnimations().filter(a=>a.playState==='running').length};
  };
  const real = (element) => Boolean(element) && element !== document.body && element !== document.documentElement && element.isConnected;
  const place = async (element, margin) => {
    if (!real(element)) return { ok: false, reason: "no element" };
    // Captures follow a quiescent frame: finite transitions/animations (e.g. a neighbour's outline-color transition) have
    // finished before and after the placing scroll, so anti-aliasing noise of a running transition cannot pass as a ring.
    const settledBefore = await window.__visual.settle();
    element.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
    const settledAfter = await window.__visual.settle();
    const rect = element.getBoundingClientRect();
    const vis = visibleBox(element);
    const x0 = Math.ceil(Math.max(vis.left, Math.floor(rect.left) - margin));
    const y0 = Math.ceil(Math.max(vis.top, Math.floor(rect.top) - margin));
    const x1 = Math.floor(Math.min(vis.right, Math.ceil(rect.right) + margin));
    const y1 = Math.floor(Math.min(vis.bottom, Math.ceil(rect.bottom) + margin));
    const hoveredList = document.querySelectorAll(":hover");
    const hovered = hoveredList.length ? hoveredList[hoveredList.length - 1] : null;
    const clip={x:x0,y:y0,width:x1-x0,height:y1-y0};
    const meta=metadata(element,clip);
    return { meta, ok: x1 - x0 > 0 && y1 - y0 > 0 && settledBefore.running === 0 && settledAfter.running === 0, rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }, vis, clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, scroll: scrolls(element), outline: outlineOf(element),
      hovered: hovered ? hovered.tagName.toLowerCase() + "." + String(hovered.className).trim().split(/\\s+/).join(".") : null, settled: [settledBefore.frames, settledAfter.frames, settledAfter.running] };
  };
  window.__q1 = {
    stopElement: null,
    census, activeNode(){return document.activeElement===document.body||document.activeElement===document.documentElement?null:nodeId(document.activeElement);},
    metadataAgain(){const r=this.stopElement.getBoundingClientRect();const vis=visibleBox(this.stopElement); const clip={x:Math.ceil(Math.max(vis.left,Math.floor(r.left)-10)),y:Math.ceil(Math.max(vis.top,Math.floor(r.top)-10))};clip.width=Math.floor(Math.min(vis.right,Math.ceil(r.right)+10))-clip.x;clip.height=Math.floor(Math.min(vis.bottom,Math.ceil(r.bottom)+10))-clip.y;return metadata(this.stopElement,clip);},
    placeFocused(margin) { this.stopElement = document.activeElement; return place(this.stopElement, margin); },
    async placeAgain(margin) {
      const result = await place(this.stopElement, margin);
      const now = document.activeElement;
      result.stillFocused = now === this.stopElement;
      result.next = real(now) ? { node:nodeId(now), rect: (({ left, top, right, bottom }) => ({ left, top, right, bottom }))(now.getBoundingClientRect()), outline: outlineOf(now) } : null;
      return result;
    },
    async decode(base64) {
      const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(bitmap, 0, 0);
      const data = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
      const digest = await crypto.subtle.digest("SHA-256", data);
      return { width: bitmap.width, height: bitmap.height, sha256: Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("") };
    },
  };
  return "installed";
})()`;
async function shotViewportClip(clip) {
  const offset = await pageOffset();
  const shot = await main.cdp("Page.captureScreenshot", { format: "png", clip: { x: clip.x + offset.x, y: clip.y + offset.y, width: clip.width, height: clip.height, scale: 1 }, captureBeyondViewport: false });
  return { base64: shot.data, buffer: Buffer.from(shot.data, "base64"), offset };
}
/** A stable frame: the clip is captured until two consecutive captures (120 ms apart) are byte-identical, at most 6
 *  captures, so a transient raster state (seen next to a neighbour's repaint in development) is never compared. */
async function stableViewportClip(clip) {
  let previous = await shotViewportClip(clip);
  for (let attempt = 2; attempt <= 6; attempt += 1) {
    await delay(120);
    const next = await shotViewportClip(clip);
    if (next.buffer.equals(previous.buffer)) return { ...next, attempts: attempt, stable: true };
    previous = next;
  }
  return { ...previous, attempts: 6, stable: false };
}
const crop = (image, x0, y0, width, height) => {
  const out = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) out.set(image.data.subarray(((y0 + y) * image.width + x0) * 4, ((y0 + y) * image.width + x0 + width) * 4), y * width * 4);
  return { width, height, data: out };
};
/** Once per run: (1) this decoder equals the browser's own PNG decoding; (2) CDP clips are page coordinates (exercised with the window scrolled when the page can scroll). */
async function pixelSelfTests(id) {
  await parkMouse();
  const viewport = await evaluate("({ width: innerWidth, height: innerHeight, pageMax: document.documentElement.scrollHeight - document.documentElement.clientHeight })");
  // A content-rich region: the hue slider's gradient track with a margin (scrolled into view by the probe).
  const regionAround = (rect) => ({ x: Math.max(0, Math.floor(rect.left) - 10), y: Math.max(0, Math.floor(rect.top) - 10), width: Math.min(160, Math.ceil(rect.width) + 20), height: Math.ceil(rect.height) + 20 });
  const hue = await evaluate(`__visual.probe("hue-slider")`);
  pre(`${id}:pixel-self-test-region-found`, hue.found && hue.inViewport, { hue });
  const region = regionAround(hue.rect);
  const sample = await shotViewportClip(region);
  const own = decodePng(sample.buffer);
  const browserDecode = await evaluate(`__q1.decode(${JSON.stringify(sample.base64)})`);
  const distinct = new Set();
  for (let index = 0; index < own.data.length; index += 4) distinct.add(`${own.data[index]},${own.data[index + 1]},${own.data[index + 2]},${own.data[index + 3]}`);
  record("pixel-self-test-decoder", { id, region, own: { width: own.width, height: own.height, sha256: rgbaSha256(own), distinctColours: distinct.size }, browser: browserDecode, png: sha256(sample.buffer) });
  pre(`${id}:png-decoder-equals-the-browser-decoding-of-the-same-screenshot`, own.width === browserDecode.width && own.height === browserDecode.height && rgbaSha256(own) === browserDecode.sha256 && distinct.size > 8, { own: rgbaSha256(own), browser: browserDecode, distinctColours: distinct.size });
  const scrolled = viewport.pageMax > 0 ? await evaluate("__visual.scrollWindowTo('end')") : { y: 0, max: 0 };
  await delay(150);
  const hueNow = await evaluate(`__visual.probe("hue-slider", false)`);
  const scrolledRegion = hueNow.found && hueNow.inViewport ? regionAround(hueNow.rect) : region;
  const full = decodePng(Buffer.from((await main.cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false })).data, "base64"));
  const clipped = decodePng((await shotViewportClip(scrolledRegion)).buffer);
  const naive = decodePng(Buffer.from((await main.cdp("Page.captureScreenshot", { format: "png", clip: { ...scrolledRegion, scale: 1 }, captureBeyondViewport: false })).data, "base64"));
  const reference = crop(full, scrolledRegion.x, scrolledRegion.y, scrolledRegion.width, scrolledRegion.height);
  const pageCoordinatesMatch = rgbaSha256(clipped) === rgbaSha256(reference);
  const viewportCoordinatesMatch = rgbaSha256(naive) === rgbaSha256(reference);
  record("pixel-self-test-clip-coordinates", { id, windowScroll: scrolled, pageMax: viewport.pageMax, region: scrolledRegion, pageCoordinatesMatch, viewportCoordinatesMatch, exercised: scrolled.y > 0 });
  pre(`${id}:cdp-clip-in-page-coordinates-equals-the-viewport-crop${scrolled.y > 0 ? "-with-the-window-scrolled" : "-window-not-scrollable"}`, pageCoordinatesMatch && (scrolled.y > 0 ? !viewportCoordinatesMatch : true), { pageCoordinatesMatch, viewportCoordinatesMatch, scrolled });
  await evaluate("__visual.scrollWindowTo(0)");
  await delay(100);
}
function compareFocusBand(focusedBuffer, movedBuffer, first, again) {
  const a = decodePng(focusedBuffer);
  const b = decodePng(movedBuffer);
  const rect = { left: first.rect.left - first.clip.x, top: first.rect.top - first.clip.y, right: first.rect.right - first.clip.x, bottom: first.rect.bottom - first.clip.y };
  const inner = first.outline.offset - 2;
  const outer = first.outline.offset + first.outline.width + 2;
  let next = null;
  if (again.next) {
    const pad = (again.next.outline.style === "none" ? 0 : Math.max(0, again.next.outline.offset) + again.next.outline.width) + 3;
    next = { left: again.next.rect.left - again.clip.x - pad, top: again.next.rect.top - again.clip.y - pad, right: again.next.rect.right - again.clip.x + pad, bottom: again.next.rect.bottom - again.clip.y + pad };
  }
  let bandPixels = 0;
  let bandDiff = 0;
  let interiorPixels = 0;
  let interiorDiff = 0;
  let surroundDiff = 0;
  let excluded = 0;
  let totalDiff = 0;
  for (let y = 0; y < a.height; y += 1) {
    for (let x = 0; x < a.width; x += 1) {
      const index = (y * a.width + x) * 4;
      const differs = a.data[index] !== b.data[index] || a.data[index + 1] !== b.data[index + 1] || a.data[index + 2] !== b.data[index + 2] || a.data[index + 3] !== b.data[index + 3];
      if (differs) totalDiff += 1;
      const X = x + 0.5;
      const Y = y + 0.5;
      if (next && X >= next.left && X <= next.right && Y >= next.top && Y <= next.bottom) { excluded += 1; continue; }
      const dx = Math.max(rect.left - X, 0, X - rect.right);
      const dy = Math.max(rect.top - Y, 0, Y - rect.bottom);
      const distance = dx > 0 || dy > 0 ? Math.max(dx, dy) : -Math.min(X - rect.left, rect.right - X, Y - rect.top, rect.bottom - Y);
      if (distance >= inner && distance <= outer) { bandPixels += 1; if (differs) bandDiff += 1; }
      else if (distance < inner) { interiorPixels += 1; if (differs) interiorDiff += 1; }
      else if (differs) surroundDiff += 1;
    }
  }
  // The stop's OWN region is its outline band plus its own box (the next stop's ring area excluded): with aligned, stable
  // frames, identical scroll and hover, a change there can only come from the stop's own focus state.
  return { size: `${a.width}x${a.height}`, sameSize: a.width === b.width && a.height === b.height, bandPixels, bandDiff, bandRatio: bandPixels ? Math.round((bandDiff / bandPixels) * 1000) / 1000 : 0,
    interiorPixels, interiorDiff, ownPixels: bandPixels + interiorPixels, ownDiff: bandDiff + interiorDiff, surroundDiff, excluded, totalDiff };
}
/** Native full frames are retained. Stability is regional, never inferred from ticking pixels elsewhere. */
async function stableNativeRegion(first) {
  let previous=null;
  for(let attempt=1;attempt<=6;attempt++) {
    const shot=await main.cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    const item={base64:shot.data,buffer:Buffer.from(shot.data,'base64'),offset:await pageOffset(),capturedAt:new Date().toISOString()};
    const image=decodePng(item.buffer);
    pre('q1:native-frame-dpr-and-viewport', image.width===first.meta.window.width && image.height===first.meta.window.height && first.meta.window.dpr===1 && first.meta.window.scale===1,{image:{width:image.width,height:image.height},window:first.meta.window});
    const region=crop(image,first.clip.x,first.clip.y,first.clip.width,first.clip.height);
    const meta=await evaluate('__q1.metadataAgain()');
    const steady=isDeepStrictEqual(meta,first.meta);
    if(previous && steady && rgbaSha256(region)===previous.region) return {...item,previous:previous.item,attempts:attempt,stable:true,meta};
    previous={region:rgbaSha256(region),item}; await delay(120);
  }
  return {...previous.item,attempts:6,stable:false,previous:previous.item};
}
const sameEdges=(a,b)=>['left','top','right','bottom'].every(k=>Math.abs(a[k]-b[k])<0.01);
function stableContext(a,b) {
  return isDeepStrictEqual(a.meta.window,b.meta.window) && isDeepStrictEqual(a.meta.hover,b.meta.hover) && isDeepStrictEqual(a.scroll,b.scroll) && isDeepStrictEqual(a.meta.ancestors,b.meta.ancestors) && a.meta.running===0 && b.meta.running===0;
}
function unionClip(a,b) {
  const pad=(p)=>Math.max(0,p.outline.offset)+p.outline.width+3;
  const x=Math.floor(Math.min(a.rect.left-pad(a),b.rect.left-pad(b))),y=Math.floor(Math.min(a.rect.top-pad(a),b.rect.top-pad(b)));
  const right=Math.ceil(Math.max(a.rect.right+pad(a),b.rect.right+pad(b))),bottom=Math.ceil(Math.max(a.rect.bottom+pad(a),b.rect.bottom+pad(b)));
  const v=a.meta.window;
  if(x<0||y<0||right>v.width||bottom>v.height||[a,b].some(p=>x<p.vis.left||y<p.vis.top||right>p.vis.right||bottom>p.vis.bottom)) return null;
  return {x,y,width:right-x,height:bottom-y};
}
function compareOutside(firstShot,movedShot,first,again,clip) {
  const cropFrame=(item)=>crop(decodePng(item.buffer),clip.x,clip.y,clip.width,clip.height);
  const A=cropFrame(firstShot),B=cropFrame(movedShot);
  const focusedStable=rgbaSha256(A)===rgbaSha256(cropFrame(firstShot.previous));
  const movedStable=rgbaSha256(B)===rgbaSha256(cropFrame(movedShot.previous));
  const nextNode=again.next?.node;
  const beforeNext=first.meta.census.find(n=>n.node===nextNode);
  const excludes=[beforeNext,again.next].filter(Boolean).map(n=>{const p=(n.outline.style==='none'?0:Math.max(0,n.outline.offset)+n.outline.width)+3;return {left:n.rect.left-p,top:n.rect.top-p,right:n.rect.right+p,bottom:n.rect.bottom+p};});
  const mask=(p,X,Y)=>{const x=Math.floor(X-p.clip.x),y=Math.floor(Y-p.clip.y);if(x<0||y<0||x>=p.clip.width||y>=p.clip.height)return false;return Buffer.from(p.meta.mask,'base64')[y*p.clip.width+x]===1;};
  const distance=(r,X,Y)=>{const dx=Math.max(r.left-X,0,X-r.right),dy=Math.max(r.top-Y,0,Y-r.bottom);return dx>0||dy>0?Math.max(dx,dy):-Math.min(X-r.left,r.right-X,Y-r.top,r.bottom-Y);};
  let ownPixels=0,ownDiff=0,bandPixels=0,bandDiff=0,interiorPixels=0,interiorDiff=0,excluded=0,occluded=0,totalDiff=0;
  for(let y=0;y<A.height;y++)for(let x=0;x<A.width;x++) {
    const X=x+clip.x+0.5,Y=y+clip.y+0.5,i=(y*A.width+x)*4;
    const differs=[0,1,2,3].some(k=>A.data[i+k]!==B.data[i+k]);if(differs)totalDiff++;
    if(excludes.some(r=>X>=r.left&&X<=r.right&&Y>=r.top&&Y<=r.bottom)){excluded++;continue;}
    const ds=[first,again].map(p=>distance(p.rect,X,Y));
    const own=ds.some((v,j)=>v<=([first,again][j].outline.offset+[first,again][j].outline.width+2));
    if(!own)continue;
    if(!mask(first,X,Y)||!mask(again,X,Y)){occluded++;continue;}
    ownPixels++;if(differs)ownDiff++;
    const band=ds.some((v,j)=>v>=([first,again][j].outline.offset-2));
    if(band){bandPixels++;if(differs)bandDiff++;}else{interiorPixels++;if(differs)interiorDiff++;}
  }
  const nextAllowed=new Set([nextNode]);
  const unknownPaint=[...first.meta.paintOverlaps,...again.meta.paintOverlaps].filter(n=>!nextAllowed.has(n.node));
  const ambiguousEffects=[...first.meta.ambiguousEffects,...again.meta.ambiguousEffects];
  const fullyOccluded=Buffer.from(first.meta.mask,'base64').every(v=>v===0);
  return {sameSize:true,size:`${A.width}x${A.height}`,focusedStable,movedStable,ownPixels,ownDiff,bandPixels,bandDiff,bandRatio:bandPixels?Math.round(bandDiff/bandPixels*1000)/1000:0,interiorPixels,interiorDiff,excluded,occluded,totalDiff,fullyOccluded,unknownPaint,ambiguousEffects,excludes};
}
let pixelSelfTested = false;
const pixelWalkLog = [];
/** Full trusted Tab cycle. Clock remains exactly aligned; outside stops use actual union frames. */
async function pixelFocusWalk(id, { anchor = `${PANE} .pane-title`, max = 140, expectedStops = null } = {}) {
  pre(`${id}:pixel-walk-helper-installed`,['installed','present'].includes(await evaluate(B48_PAGE_HELPER)));
  if(!pixelSelfTested){await pixelSelfTests(id);pixelSelfTested=true;}
  await clickAnchor(anchor,`${id}:pixel-walk-anchor`);await parkMouse();
  const tabbable=await evaluate('__visual.tabbables()');
  const initial=await evaluate('__q1.census()');
  pre(`${id}:census-unique-native-nodes-and-descriptors`,initial.length===tabbable.length&&new Set(initial.map(n=>n.node)).size===initial.length&&new Set(tabbable).size===tabbable.length&&initial.every(n=>n.tabindex===0),{initial,tabbable});
  const visited=[],nodeVisits=[],rows=[],invalid=[];let first=null,pending=null,closed=false;
  const walkName=id.replace(/[^a-z0-9]+/gi,'-');
  for(let index=0;index<max;index++) {
    await press('Tab');const now=await evaluate('__visual.focusInfo()');
    const census=await evaluate('__q1.census()');
    pre(`${id}:census-unchanged-at-${index}`,isDeepStrictEqual(census.map(n=>({node:n.node,tabindex:n.tabindex})),initial.map(n=>({node:n.node,tabindex:n.tabindex}))),{initial,census});
    const activeNode=await evaluate('__q1.activeNode()');
    if(pending){
      const again=await evaluate(`__q1.placeAgain(${PIXEL_MARGIN})`);
      const clock=pending.desc.startsWith('clock:');
      const context=stableContext(pending.first,again)&&!again.stillFocused;
      const aligned=pending.first.ok&&again.ok&&context&&isDeepStrictEqual(again.clip,pending.first.clip)&&again.hovered===pending.first.hovered&&sameEdges(again.rect,pending.first.rect);
      const priorNext=pending.first.meta.census.find(n=>n.node===again.next?.node);
      const nextChanged=priorNext&&again.next&&!sameEdges(priorNext.rect,again.next.rect);
      // Scope: exactly aligned outside stops retain the original semantics. The independently qualified
      // union exception is invoked only for actual outside target bounds changes. A changed overlapping next stop makes an aligned
      // outside comparison causally inconclusive; it never grants entry to the union exception.
      const targetMoved=!sameEdges(pending.first.rect,again.rect);
      const unionPath=!clock&&targetMoved;
      const targetPad=Math.max(0,pending.first.outline.offset)+pending.first.outline.width+2;
      const ownBox={left:pending.first.rect.left-targetPad,top:pending.first.rect.top-targetPad,right:pending.first.rect.right+targetPad,bottom:pending.first.rect.bottom+targetPad};
      const overlapsOwn=(n)=>{const p=Math.max(0,n.outline.offset)+n.outline.width+3;return n.rect.right+p>ownBox.left&&n.rect.left-p<ownBox.right&&n.rect.bottom+p>ownBox.top&&n.rect.top-p<ownBox.bottom;};
      const ambiguousNext=!clock&&!unionPath&&nextChanged&&[priorNext,again.next].some(overlapsOwn);
      const union=unionPath&&context?unionClip(pending.first,again):null;
      const focused=unionPath?pending.native:pending.shot;
      const moved=unionPath?(union&&pending.first.ok&&again.ok?await stableNativeRegion(again):null):(aligned?await stableViewportClip(again.clip):null);
      const comparison=unionPath?(moved?.stable&&focused?.stable?compareOutside(focused,moved,pending.first,again,union):null):(aligned&&moved?.stable&&focused.stable?compareFocusBand(focused.buffer,moved.buffer,pending.first,again):null);
      const valid=!!comparison&&!ambiguousNext&&(unionPath?comparison.focusedStable&&comparison.movedStable&&(comparison.fullyOccluded||(comparison.ownPixels>0&&comparison.occluded===0&&comparison.unknownPaint.length===0&&comparison.ambiguousEffects.length===0)):comparison.ownPixels>0);
      if(!valid)invalid.push({desc:pending.desc,clock,context,aligned,targetMoved,ambiguousNext,union,first:pending.first,again,comparison});
      const row={desc:pending.desc,node:pending.node,next:now.isBody?'body':now.desc,ownership:clock?'Clock':'outside-Clock',targetMoved,ambiguousNext,method:unionPath?'native-viewport-union-r1':'aligned-original',focusVisible:pending.focus.focusVisible,outline:pending.first.outline,first:pending.first,again,clip:unionPath?union:pending.first.clip,captures:{focused:focused?.attempts,movedOn:moved?.attempts},focusedPng:sha256(focused?.buffer||Buffer.alloc(0)),movedOnPng:moved?sha256(moved.buffer):null,...(comparison||{}),valid,visible:valid&&pending.first.outline.style!=='none'&&comparison.ownDiff>0};
      row.screenshots=[];
      const safe=`${walkName}-${rows.length}-${pending.desc.replace(/[^a-z0-9]+/gi,'-')}`;
      for(const [state,item] of [['focused',focused],['moved-on',moved],['focused-repeat',focused?.previous],['moved-on-repeat',moved?.previous],['outside-native-context',!unionPath?pending.native:null],['outside-native-context-repeat',!unionPath?pending.native?.previous:null]])if(item?.base64)row.screenshots.push((await saveShot(`${safe}-${state}`,item.base64,{state,clip:row.clip,first:pending.first.rect,again:again.rect,nativeFullViewport:unionPath||state.startsWith('outside-native')})).file);
      rows.push(row);pending=null;
    }
    if(!now.isBody&&activeNode===first){closed=true;break;}
    visited.push(now.isBody?'body':now.desc);
    if(!now.isBody){
      if(first===null)first=activeNode;
      nodeVisits.push(activeNode);
      const placed=await evaluate(`__q1.placeFocused(${PIXEL_MARGIN})`);
      const clock=now.desc.startsWith('clock:');
      const shot=placed.ok?await stableViewportClip(placed.clip):{buffer:Buffer.alloc(0),stable:false,attempts:0};
      const native=!clock&&placed.ok?await stableNativeRegion(placed):null;
      pending={desc:now.desc,node:activeNode,focus:now,first:placed,shot,native};
    }
  }
  const inside=visited.filter(d=>d!=='body'),start=tabbable.indexOf(inside[0]),rotated=start>=0?[...tabbable.slice(start),...tabbable.slice(0,start)]:[];
  pre(`${id}:full-native-cycle-census-closure`,closed&&rows.length===initial.length&&new Set(nodeVisits).size===initial.length&&initial.every(n=>nodeVisits.includes(n.node))&&visited.filter(d=>d==='body').length<=1&&isDeepStrictEqual(inside,rotated)&&(!expectedStops||isDeepStrictEqual(inside,expectedStops)),{closed,initial,visited,nodeVisits,rows:rows.length,rotated,expectedStops});
  record('pixel-focus-walk',{id,width:KEYBOARD_WIDTH,stops:rows.length,failed:rows.filter(r=>!r.visible).map(r=>r.desc),rows,invalid});
  pre(`${id}:all-stops-valid-stable-attributable-captures`,invalid.length===0,{invalid});
  const failed=rows.filter(r=>!r.visible);
  checkDeferred(`${id}:every-tab-stop-has-visible-focus-computed-outline-not-none-and-focused-vs-moved-on-pixels-differ-in-its-own-ring-or-box`,failed.length===0,{failed,rows});
  pixelWalkLog.push({id,stops:rows.length,failed:failed.map(r=>r.desc)});return rows;
}

return { pixelFocusWalk, pixelWalkLog };
}
