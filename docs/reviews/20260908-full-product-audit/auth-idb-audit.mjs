/**
 * Read-only audit reproduction for web 9257be4.
 * Run from any directory: node /path/to/repo/docs/reviews/20260908-full-product-audit/auth-idb-audit.mjs
 * Requires the repository's installed lockfile dependencies (pnpm install).
 * All IndexedDB operations use a new fake-indexeddb factory in Node memory.
 * No browser storage, network, credentials, or real user data are accessed.
 * Exit 0 means both expected schema failures were reproduced; 1 means review the changed result.
 */
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const fakeIdbPath = join(root, 'node_modules/.pnpm/fake-indexeddb@6.2.5/node_modules/fake-indexeddb/build/esm/index.js');
const source = `
  export { IDBFactory } from ${JSON.stringify(fakeIdbPath)};
  export { createIndexedDbStore } from './packages/web-auth-device-session/src/storage.ts';
  export { createDeviceIdentityStore } from './packages/web-auth-device-session/src/device-store.ts';
`;
const bundled = await build({
  stdin: { contents: source, resolveDir: root, sourcefile: 'auth-idb-audit-entry.ts', loader: 'ts' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  logLevel: 'silent',
});
const { IDBFactory, createIndexedDbStore, createDeviceIdentityStore } = await import(
  `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`
);

async function inspectStores() {
  return new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.open('xai-web-auth');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const names = Array.from(request.result.objectStoreNames);
      request.result.close();
      resolve(names);
    };
  });
}

async function scenario(label, first, second) {
  globalThis.indexedDB = new IDBFactory();
  await first();
  try {
    await second();
    console.log(`${label}: UNEXPECTED_SUCCESS (schema may be fixed; review this audit)`);
    process.exitCode = 1;
  } catch (error) {
    console.log(`${label}: ${error.name}: ${error.message}`);
    if (error.name !== 'NotFoundError') process.exitCode = 1;
  }
  console.log(`${label}_OBJECT_STORES: ${JSON.stringify(await inspectStores())}`);
}

console.log('Environment: Node + fake-indexeddb@6.2.5; source bundled by esbuild@0.28.1');
console.log('Safety: isolated in-memory factories; no browser, network, or real user data');
await scenario(
  'AUTH_THEN_DEVICE',
  () => createIndexedDbStore().setItem('audit-dummy-session', 'dummy'),
  () => createDeviceIdentityStore().ensure(() => 'audit-dummy-device'),
);
await scenario(
  'DEVICE_THEN_AUTH',
  () => createDeviceIdentityStore().ensure(() => 'audit-dummy-device'),
  () => createIndexedDbStore().setItem('audit-dummy-session', 'dummy'),
);
console.log(process.exitCode ? 'AUDIT_RESULT: REVIEW_REQUIRED' : 'AUDIT_RESULT: BOTH_SCHEMA_FAILURES_REPRODUCED');
