import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { IDBFactory } from '../../../packages/web-auth-device-session/node_modules/fake-indexeddb/build/esm/index.js';
import { createAuthSessionStorage } from '../../../packages/web-auth-device-session/src/storage';
import { getPref, setPref } from '../../../packages/plugin-web-storage/src/index';
import { aiKeyStorage } from '../../../packages/plugin-web-ai-chat/src/internal/secretStore';

beforeEach(() => {
  const data = new Map<string, string>();
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('crypto', webcrypto);
  vi.stubGlobal('window', { dispatchEvent: () => true });
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  });
});
afterEach(() => vi.unstubAllGlobals());

// Characterization only: PASS means the leakage is reproduced, not fixed.
it('business state survives auth removal and is read by the next account', async () => {
  const auth = createAuthSessionStorage();
  await auth.setItem('xai-web-auth', JSON.stringify({ user: { id: 'A' } }));
  setPref('xai_ai_convos', [{ id: 'private-A', title: 'private content A' }]);
  await auth.removeItem('xai-web-auth');
  await auth.setItem('xai-web-auth', JSON.stringify({ user: { id: 'B' } }));
  expect(getPref('xai_ai_convos')).toEqual([{ id: 'private-A', title: 'private content A' }]);
});

it('BYOK saved by A is still decrypted after auth switches to B', async () => {
  const auth = createAuthSessionStorage();
  await auth.setItem('xai-web-auth', JSON.stringify({ user: { id: 'A' } }));
  await aiKeyStorage.saveKey('anthropic', 'synthetic-key-A');
  await auth.removeItem('xai-web-auth');
  await auth.setItem('xai-web-auth', JSON.stringify({ user: { id: 'B' } }));
  expect(await aiKeyStorage.loadKey('anthropic')).toBe('synthetic-key-A');
});
