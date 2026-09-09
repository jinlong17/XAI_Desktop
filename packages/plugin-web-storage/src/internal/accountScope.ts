import { ownershipForKey } from './accountOwnership.js';

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

export function createScopedStorage(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>, controller = accountScope) {
  const scope = controller.capture();
  return {
    scope,
    getItem(key: string) { return storage.getItem(controller.physicalKey(key, scope)); },
    setItem(key: string, value: string) { storage.setItem(controller.physicalKey(key, scope), value); },
    removeItem(key: string) { storage.removeItem(controller.physicalKey(key, scope)); },
    assertCurrent() { controller.assertCurrent(scope); },
  };
}
