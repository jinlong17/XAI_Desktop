import { ownershipForKey } from './accountOwnership.js';
import { accountLifecycleLockName, browserAccountLock, type AccountCoordinationLock } from './accountCoordination.js';

export type AccountScope = Readonly<{
  kind: 'locked' | 'account' | 'demo';
  accountId: string | null;
  generation: string | null;
  epoch: number;
}>;
export class AccountScopeError extends Error {
  readonly code = 'ACCOUNT_SCOPE_UNAVAILABLE';
  constructor() { super('Account storage is locked or the operation belongs to a previous account.'); }
}
export function accountPrefix(accountId: string, demo = false): string {
  if (!accountId.trim()) throw new AccountScopeError();
  return `xai:${demo ? 'demo' : 'account'}:v1:${encodeURIComponent(accountId)}:`;
}
export function generationMarkerKey(accountId: string, demo = false): string {
  return `${accountPrefix(accountId, demo)}committed-generation`;
}
export function generationKey(accountId: string, generation: string, key: string, demo = false): string {
  if (!generation) throw new AccountScopeError();
  return `${accountPrefix(accountId, demo)}${encodeURIComponent(generation)}:${encodeURIComponent(key)}`;
}

/** Every async writer and hook setter must capture a handle, not look up the next account. */
export function createAccountScopeController() {
  let current: AccountScope = Object.freeze({ kind: 'locked', accountId: null, generation: null, epoch: 0 });
  const listeners = new Set<() => void>();
  const publish = () => { for (const listener of listeners) listener(); };
  const capture = () => current;
  const assertCurrent = (scope: AccountScope) => {
    if (scope !== current) throw new AccountScopeError();
  };
  return {
    capture,
    assertCurrent,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    lock(accountId: string | null = null) {
      current = Object.freeze({ kind: 'locked', accountId, generation: null, epoch: current.epoch + 1 });
      publish();
      return current;
    },
    activate(transition: AccountScope, generation: string, demo = false) {
      assertCurrent(transition);
      if (!transition.accountId || !generation) throw new AccountScopeError();
      current = Object.freeze({ kind: demo ? 'demo' : 'account', accountId: transition.accountId, generation, epoch: current.epoch + 1 });
      publish();
      return current;
    },
    physicalKey(key: string, scope: AccountScope = current) {
      if (ownershipForKey(key) === 'device') return key;
      assertCurrent(scope);
      if (scope.kind === 'locked' || !scope.accountId || !scope.generation) throw new AccountScopeError();
      if (typeof localStorage !== 'undefined' && localStorage.getItem(`${accountPrefix(scope.accountId, scope.kind === 'demo')}deleted`) !== null) throw new AccountScopeError();
      return generationKey(scope.accountId, scope.generation, key, scope.kind === 'demo');
    },
    isReady(scope: AccountScope = current) { return scope === current && scope.kind !== 'locked'; },
  };
}
export type AccountScopeController = ReturnType<typeof createAccountScopeController>;
export const accountScope = createAccountScopeController();

export type ScopedStorageWriteResult = Readonly<{ ok: true }> | Readonly<{ ok: false; reason: 'lock-unavailable' | 'account-changed' | 'recovery-required' | 'storage' }>;

export function createScopedStorage(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>, controller = accountScope) {
  const scope = controller.capture();
  const assertMarker = () => {
    controller.assertCurrent(scope);
    if ((scope.kind !== 'account' && scope.kind !== 'demo') || !scope.accountId || !scope.generation) throw new Error('account-changed');
    const raw = storage.getItem(generationMarkerKey(scope.accountId, scope.kind === 'demo'));
    if (raw === null) throw new Error('recovery-required');
    const marker: unknown = JSON.parse(raw);
    if (!marker || typeof marker !== 'object' || (marker as { generation?: unknown }).generation !== scope.generation) throw new Error('recovery-required');
  };
  const coordinated = async (key: string, write: () => void, lock: AccountCoordinationLock = browserAccountLock): Promise<ScopedStorageWriteResult> => {
    try {
      if (ownershipForKey(key) === 'device') { write(); return { ok: true }; }
      if (!scope.accountId || scope.kind === 'locked') return { ok: false, reason: 'account-changed' };
      return await lock(accountLifecycleLockName(scope.accountId, scope.kind === 'demo'), 'shared', async () => {
        assertMarker(); write(); return { ok: true };
      });
    } catch (error) {
      if (error instanceof AccountScopeError) return { ok: false, reason: 'account-changed' };
      const reason = error instanceof Error ? error.message : '';
      if (reason === 'account-changed' || reason === 'recovery-required') return { ok: false, reason };
      return { ok: false, reason: reason.includes('lock') ? 'lock-unavailable' : 'storage' };
    }
  };
  return {
    scope,
    getItem(key: string) { return storage.getItem(controller.physicalKey(key, scope)); },
    setItem(key: string, value: string) { storage.setItem(controller.physicalKey(key, scope), value); },
    removeItem(key: string) { storage.removeItem(controller.physicalKey(key, scope)); },
    setItemAccount(key: string, value: string, lock?: AccountCoordinationLock) { return coordinated(key, () => storage.setItem(controller.physicalKey(key, scope), value), lock); },
    removeItemAccount(key: string, lock?: AccountCoordinationLock) { return coordinated(key, () => storage.removeItem(controller.physicalKey(key, scope)), lock); },
    assertCurrent() { controller.assertCurrent(scope); },
  };
}
