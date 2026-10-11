import { createAuthGenerationStore } from '../../../packages/web-auth-device-session/src/auth-generation-store';
import { createIndexedDbStore } from '../../../packages/web-auth-device-session/src/storage';
const store = createAuthGenerationStore();
if (new URLSearchParams(location.search).has('peer')) {
  addEventListener('message', async event => {
    if (event.origin !== location.origin || event.source !== parent) return;
    const { id, method, args } = event.data;
    const allowed = ['createCandidate', 'publish', 'revoke', 'getItem', 'setItem', 'readActive'];
    if (!allowed.includes(method)) return;
    try { parent.postMessage({ id, result: await (store as any)[method](...args) }, location.origin); }
    catch { parent.postMessage({ id, error: 'peer-operation-failed' }, location.origin); }
  });
} else {
  const assert = (value: unknown, message: string) => { if (!value) throw Error(message); };
  async function run() {
    const checks: string[] = [];
    const iframe = document.createElement('iframe'); iframe.src = '/?peer=1';
    const ready = new Promise(resolve => { iframe.onload = resolve; }); document.body.append(iframe); await ready;
    let sequence = 0;
    const rpc = (method: string, ...args: unknown[]) => new Promise<any>((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { removeEventListener('message', receive); reject(Error('peer timeout')); }, 5000);
      const receive = (event: MessageEvent) => {
        if (event.origin !== location.origin || event.source !== iframe.contentWindow || event.data.id !== id) return;
        clearTimeout(timer); removeEventListener('message', receive);
        if (event.data.error) reject(Error(event.data.error)); else resolve(event.data.result);
      };
      addEventListener('message', receive); iframe.contentWindow!.postMessage({ id, method, args }, location.origin);
    });
    const A = { generation: 'native-A' }, B = { generation: 'native-B' }, C = { generation: 'native-C' };
    await store.createCandidate(A); await store.setItem(A, 'session', 'A-original');
    await store.publish({ lease: A, owner: 'account-A', expectedActive: null });
    await rpc('createCandidate', B); await store.createCandidate(C);
    await rpc('setItem', B, 'session', 'B-original'); await store.setItem(C, 'session', 'C-original');
    const competing = await Promise.all([
      rpc('publish', { lease: B, owner: 'account-B', expectedActive: A.generation }),
      store.publish({ lease: C, owner: 'account-C', expectedActive: A.generation })
    ]);
    assert(competing.filter(result => result.status === 'applied').length === 1, 'CAS must produce one winner');
    assert(competing.filter(result => result.reason === 'active-changed').length === 1, 'CAS loser must be superseded');
    const winner = (await store.readActive())!;
    assert((await rpc('readActive')).generation === winner.generation, 'cross-context pointer mismatch');
    checks.push('native cross-context competing publication: exactly one winner');
    const winnerBytes = await store.getItem(winner, 'session');
    await rpc('revoke', { ...A, owner: 'account-A' });
    assert((await store.readActive())?.generation === winner.generation, 'old revoke changed pointer');
    assert(await store.getItem(winner, 'session') === winnerBytes, 'old revoke changed winner bytes');
    assert((await rpc('setItem', A, 'session', 'late-A')).reason === 'lease-revoked', 'old refresh resurrected');
    checks.push('old generation revoke and late writer preserve current generation bytes');
    const originalPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(value: any, key?: IDBValidKey) {
      const request = originalPut.call(this, value, key!); this.transaction.abort(); return request;
    };
    let failed;
    try { failed = await store.revoke(winner); } finally { IDBObjectStore.prototype.put = originalPut; }
    assert(failed.status === 'failed', 'aborted transaction falsely succeeded');
    assert((await store.readActive())?.generation === winner.generation, 'aborted transaction changed pointer');
    assert(await store.getItem(winner, 'session') === winnerBytes, 'aborted transaction changed bytes');
    checks.push('native IDB abort rolls back revocation and reports failure');
    await Promise.all([rpc('revoke', winner), store.setItem(winner, 'session', 'racing-refresh')]);
    assert(await store.readActive() === null, 'revoked pointer survived');
    assert(await rpc('getItem', winner, 'session') === null, 'cross-context writer resurrected revoked bytes');
    checks.push('cross-context revoke/write race cannot resurrect');
    const legacy = createIndexedDbStore(); const device = createIndexedDbStore({ storeName: 'device' });
    const raw = '  { "synthetic" : "old-auth-byte-fixture" }\n';
    await legacy.setItem('legacy-native', raw); await device.setItem('device', 'device-preserve');
    const imported = { generation: 'native-import' }; await store.createCandidate(imported);
    assert((await store.importLegacy({ lease: imported, owner: 'import-owner', expectedActive: null, legacyKey: 'legacy-native', expectedRaw: raw, destinationKey: 'session' })).status === 'applied', 'legacy import failed');
    assert(await store.getItem(imported, 'session') === raw, 'legacy copy changed bytes');
    await store.revoke({ ...imported, owner: 'import-owner' });
    assert(await legacy.getItem('legacy-native') === raw && await device.getItem('device') === 'device-preserve', 'legacy/device data changed');
    checks.push('legacy import retains exact original row and device identity');
    const recovery = await createAuthGenerationStore().readRecovery();
    assert(recovery.length === 3 && recovery.every(row => Object.keys(row).sort().join(',') === 'generation,owner,state'), 'recovery metadata contains unexpected data');
    assert((await store.createCandidate(imported)).reason === 'generation-exists', 'revoked generation reused');
    checks.push('fresh participant sees names-only tombstones and rejects generation reuse');
    iframe.remove();
    return { pass: true, checks, boundary: 'Isolated Chrome; native IDB in two JS contexts/one tab; no SDK coordinator, no production network; REL06 remains open.' };
  }
  run().then(result => fetch('/result', { method: 'POST', body: JSON.stringify(result) }))
    .catch(error => fetch('/result', { method: 'POST', body: JSON.stringify({ pass: false, error: String(error) }) }));
}
