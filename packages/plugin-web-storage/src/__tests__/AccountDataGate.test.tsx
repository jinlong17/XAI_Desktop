import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AccountDataGate } from '../AccountDataGate.js';
import { accountScope, createScopedStorage, generationKey, generationMarkerKey } from '../internal/accountScope.js';
import type { SecretMigrationParticipant } from '../internal/accountMigration.js';

let root: Root;
let container: HTMLDivElement;
let reads: (string | null)[];
function Content() {
  const value = createScopedStorage(localStorage).getItem('xai_task_cols');
  reads.push(value);
  return <p data-private-content>{value ?? 'empty workspace'}</p>;
}
async function show(accountId = 'A', secrets?: SecretMigrationParticipant) {
  await act(async () => root.render(<AccountDataGate authenticated accountId={accountId} secrets={secrets}><Content /></AccountDataGate>));
}
async function click(text: string) {
  const button = [...container.querySelectorAll('button')].find(node => node.textContent === text);
  if (!button) throw Error(`Missing button: ${text}`);
  await act(async () => button.click());
}
beforeEach(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear(); accountScope.lock(); reads = [];
  vi.stubGlobal('navigator', { locks: { request: async (_name: string, run: () => Promise<unknown>) => run() } });
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

it('keeps unowned data hidden and start-empty preserves the original archive', async () => {
  localStorage.setItem('xai_task_cols', 'PRIVATE LEGACY TEXT');
  await show();
  expect(reads).toEqual([]);
  expect(container.textContent).not.toContain('PRIVATE LEGACY TEXT');
  await click('Start without importing');
  expect(reads).toEqual([]);
  await click('Continue to workspace');
  expect(reads.at(-1)).toBeNull();
  expect(localStorage.getItem('xai_task_cols')).toBe('PRIVATE LEGACY TEXT');
});
it('revokes A handles before B mounts and never gives B an A value', async () => {
  await show(); await click('Start without importing'); await click('Continue to workspace');
  const a = createScopedStorage(localStorage); a.setItem('xai_task_cols', 'A ONLY');
  await show('B');
  expect(() => a.setItem('xai_task_cols', 'late')).toThrow();
  expect(container.querySelector('[data-private-content]')).toBeNull();
  await click('Start without importing'); await click('Continue to workspace');
  expect(reads.at(-1)).toBeNull();
  expect(localStorage.getItem(generationKey('A', a.scope.generation!, 'xai_task_cols'))).toBe('A ONLY');
});
it('cancels pending migration when the identity changes before secret staging finishes', async () => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  const secrets = { stage: () => pending, verify: async () => {} };
  await show('A', secrets);
  await click('Start without importing');
  await show('B');
  await act(async () => { release(); await pending; });
  expect(localStorage.getItem(generationMarkerKey('A'))).toBeNull();
  expect(container.querySelector('[data-private-content]')).toBeNull();
});
it('allows undo without deleting the original data or exposing a partial generation', async () => {
  localStorage.setItem('xai_task_cols', 'original bytes');
  await show(); await click('Start without importing'); await click('Undo this import');
  expect(localStorage.getItem(generationMarkerKey('A'))).toBeNull();
  expect(localStorage.getItem('xai_task_cols')).toBe('original bytes');
  expect(reads).toEqual([]);
});
it('switches to a committed generation from another tab and remounts its readers', async () => {
  await show(); await click('Start without importing'); await click('Continue to workspace');
  localStorage.setItem(generationKey('A', 'new-generation', 'xai_task_cols'), 'new account version');
  localStorage.setItem(generationMarkerKey('A'), JSON.stringify({ generation: 'new-generation', migrationId: 'new', previous: null }));
  await act(async () => window.dispatchEvent(new StorageEvent('storage', { key: generationMarkerKey('A') })));
  expect(reads.at(-1)).toBe('new account version');
});
