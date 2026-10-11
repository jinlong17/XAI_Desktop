
import { createIndexedDbStore } from './packages/web-auth-device-session/src/storage.ts';
const assert = (condition, message) => { if (!condition) throw Error(message); };
const open = (version, store) => new Promise((resolve,reject) => {
 const r = indexedDB.open('xai-web-auth', version);
 r.onupgradeneeded = () => { if(store) r.result.createObjectStore(store); };
 r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
 r.onblocked = () => reject(Error('unexpected open block'));
});
const clear = () => new Promise((resolve,reject) => {
 const r=indexedDB.deleteDatabase('xai-web-auth');
 r.onsuccess=resolve; r.onerror=()=>reject(r.error); r.onblocked=()=>reject(Error('leaked connection'));
});
(async () => {
 let count=0;
 for(const order of ['session-first','device-first','concurrent']) {
  await clear();
  const s=createIndexedDbStore(); const d=createIndexedDbStore({storeName:'device'});
  if(order==='session-first'){await s.setItem('token','A');await d.setItem('id','B');}
  if(order==='device-first'){await d.setItem('id','B');await s.setItem('token','A');}
  if(order==='concurrent')await Promise.all([s.setItem('token','A'),d.setItem('id','B')]);
  assert(await s.getItem('token')==='A',order+' session');assert(await d.getItem('id')==='B',order+' device');
  const db=await open();assert(db.version===2 && db.objectStoreNames.length===2,order+' schema');db.close();count++;
 }
 for(const name of ['session','device']) {
  await clear();const db=await open(1,name);
  await new Promise((resolve,reject)=>{const tx=db.transaction(name,'readwrite');tx.objectStore(name).put('old','legacy');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
  const store=createIndexedDbStore({storeName:name});assert(await store.getItem('legacy')==='old',name+' migration');
  const other=createIndexedDbStore({storeName:name==='session'?'device':'session'});await other.setItem('new','new');
  assert(await store.getItem('legacy')==='old',name+' preserve');count++;
 }
 const a=createIndexedDbStore({dbName:'warm-custom',storeName:'alpha'});
 await a.setItem('old','preserved');
 const b=createIndexedDbStore({dbName:'warm-custom',storeName:'beta'});
 await Promise.all([a.setItem('new','A'),b.setItem('new','B')]);
 assert(await a.getItem('old')==='preserved' && await a.getItem('new')==='A' && await b.getItem('new')==='B','warm concurrent custom upgrade');count++;
 
 // Independently added native blocked upgrade / retry case.
 const hold=await new Promise((resolve,reject)=>{const r=indexedDB.open('blocked-native',1);r.onupgradeneeded=()=>r.result.createObjectStore('alpha');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
 await new Promise((resolve,reject)=>{const t=hold.transaction('alpha','readwrite');t.objectStore('alpha').put('original','keep');t.oncomplete=resolve;t.onerror=()=>reject(t.error)});
 const beta=createIndexedDbStore({dbName:'blocked-native',storeName:'beta'});let blocked=false;try{await beta.setItem('new','B')}catch{blocked=true}assert(blocked,'blocked upgrade rejects instead of claiming success');hold.close();await new Promise(r=>setTimeout(r,100));await beta.setItem('new','B');const alpha=createIndexedDbStore({dbName:'blocked-native',storeName:'alpha'});assert(await alpha.getItem('keep')==='original','blocked upgrade retained original');assert(await beta.getItem('new')==='B','blocked retry released opening and queue');count++;
 // Native abort and synchronous DataError cannot poison the operation queue.
 const fail=createIndexedDbStore({dbName:'native-failure',storeName:'first'});await fail.setItem('keep','original');const native=IDBObjectStore.prototype.put;let once=true;IDBObjectStore.prototype.put=function(...args){const request=native.apply(this,args);if(once&&this.transaction.db.name==='native-failure'){once=false;this.transaction.abort()}return request};let aborted=false;try{await fail.setItem('aborted','no')}catch{aborted=true}IDBObjectStore.prototype.put=native;assert(aborted,'actual abort rejects');const extension=createIndexedDbStore({dbName:'native-failure',storeName:'extension'});await extension.setItem('safe','yes');assert(await fail.getItem('aborted')===null,'abort not committed');assert(await fail.getItem('keep')==='original','abort preserves old');count++;
 let syncFailed=false;try{await fail.setItem(undefined,'bad-key')}catch{syncFailed=true}assert(syncFailed,'native DataError rejects');await fail.setItem('after','yes');assert(await fail.getItem('after')==='yes','sync failure queue released');count++;
 await clear();window.nativeResult={status:'PASS',checks:count,scope:'original6 + native blocked retry + abort + synchronous failure'};

})().catch(e=>{window.nativeResult={status:'FAIL',error:e.stack}});
