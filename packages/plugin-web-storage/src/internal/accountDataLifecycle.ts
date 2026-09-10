import { accountPrefix, accountScope, generationKey, generationMarkerKey, hasCommittedGenerationMarker, type AccountScope } from './accountScope.js';
import { accountLifecycleLockName, browserAccountLock, type AccountCoordinationLock } from './accountCoordination.js';
import { ownershipForKey } from './accountOwnership.js';
import { recoveryKeyExclusion } from './lifecycleDeclaration.js';
import { makeExportManifest, type ExportOmission } from './dataExport.js';
import { accountDeletionReceiptKey, decodeAccountDeletionReceipt, type AccountDeletionReceipt } from './accountDeletionReceipt.js';
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;
function prefix(scope: AccountScope) {
  if (scope.kind === 'locked' || !scope.accountId || !scope.generation) throw new Error('A captured authenticated account scope is required.');
  return accountPrefix(scope.accountId, scope.kind === 'demo');
}
function keys(storage: Store) {
  const result: string[]=[];
  for(let index=0;index<storage.length;index++) { const key=storage.key(index);if(key!==null) result.push(key); }
  return result;
}
/** Export explicitly captured owner data, even if auth changed while a request was running. */
export function exportAccountLocalData(scope: AccountScope, storage: Store = localStorage) {
  prefix(scope);
  const ownedPrefix=generationKey(scope.accountId!,scope.generation!,'',scope.kind==='demo');
  const records: Record<string,string>={};
  const omitted: ExportOmission[]=[];
  for(const physical of keys(storage)) {
    if(!physical.startsWith(ownedPrefix)) continue;
    const logical=decodeURIComponent(physical.slice(ownedPrefix.length));
    if(ownershipForKey(logical)!=='account') continue;
    const reason=recoveryKeyExclusion(logical);
    if(reason) { omitted.push({section:'account',key:logical,reason}); continue; }
    const raw=storage.getItem(physical);
    if(raw!==null) records[logical]=raw;
  }
  return {version:1 as const,kind:'account-records' as const,accountId:scope.accountId!,generation:scope.generation!,records,manifest:makeExportManifest('account-current-generation',{account:records},['captured-account-current-generation-records'],['device-preferences','other-accounts','prior-and-candidate-generations','unassigned-originals-and-archives','auth-session-and-oauth-state','byok-and-device-cryptographic-material','cloud-data'],omitted)};
}
/** After confirmed account deletion: never target whatever account is current now. */
export function deleteAccountLocalData(scope: AccountScope, storage: Store = localStorage): void {
  if ((scope.kind !== 'account' && scope.kind !== 'demo') || !scope.accountId || !scope.generation) throw new Error('A captured authenticated account scope is required.');
  const ownedPrefix=prefix(scope), tombstone=`${ownedPrefix}deleted`;
  // Stop older tabs from creating new account records while scoped cleanup is in progress.
  if (storage.getItem(tombstone) === null) storage.setItem(tombstone, JSON.stringify({
    version: 1, accountId: scope.accountId, kind: scope.kind, generation: scope.generation, phase: 'pending', updatedAt: new Date().toISOString(),
  } satisfies AccountDeletionReceipt));
  for(const key of keys(storage)) if(key.startsWith(ownedPrefix) && key!==tombstone) storage.removeItem(key);
}

export type AccountDeletionResult = Readonly<{ ok: true }> | Readonly<{ ok: false; reason: 'lock-unavailable' | 'account-changed' | 'recovery-required' | 'storage' }>;
export type AccountDeletionResumeResult = Readonly<{ ok: true; receipt: AccountDeletionReceipt; raw: string }> | Readonly<{ ok: false; reason: 'lock-unavailable' | 'receipt-changed' | 'recovery-required' | 'storage' }>;

function eraseUnderReceipt(receipt: AccountDeletionReceipt, storage: Store): void {
  const ownedPrefix = accountPrefix(receipt.accountId, receipt.kind === 'demo');
  const tombstone = accountDeletionReceiptKey(receipt.accountId, receipt.kind === 'demo');
  for (const key of keys(storage)) if (key.startsWith(ownedPrefix) && key !== tombstone) storage.removeItem(key);
}

/** Resume only a complete, matching durable deletion receipt; never infer authority from a tombstone string. */
export async function resumeAccountLocalDataDeletion(
  expected: AccountDeletionReceipt,
  expectedRaw: string,
  storage: Store = localStorage,
  lock: AccountCoordinationLock = browserAccountLock,
): Promise<AccountDeletionResumeResult> {
  const demo = expected.kind === 'demo';
  try {
    return await lock(accountLifecycleLockName(expected.accountId, demo), 'exclusive', async () => {
      const receiptKey = accountDeletionReceiptKey(expected.accountId, demo);
      const raw = storage.getItem(receiptKey);
      const current = decodeAccountDeletionReceipt(raw, expected.accountId, demo);
      if (!current || raw !== expectedRaw || current.generation !== expected.generation || current.version !== expected.version
        || current.phase !== expected.phase || current.authGeneration !== expected.authGeneration) return { ok: false, reason: 'receipt-changed' } as const;
      if (current.phase === 'complete') return { ok: true, receipt: current, raw } as const;
      const markerRaw = storage.getItem(generationMarkerKey(expected.accountId, demo));
      if (markerRaw !== null && !hasCommittedGenerationMarker(markerRaw, expected.generation)) return { ok: false, reason: 'recovery-required' } as const;
      // A partial deletion intentionally removes the old marker; the validated
      // receipt remains the only authority for a later resume.
      if (markerRaw !== null) storage.removeItem(generationMarkerKey(expected.accountId, demo));
      eraseUnderReceipt(current, storage);
      const next: AccountDeletionReceipt = { ...current, phase: 'local-data-cleared', updatedAt: new Date().toISOString() };
      const nextRaw = JSON.stringify(next);
      storage.setItem(receiptKey, nextRaw);
      if (storage.getItem(receiptKey) !== nextRaw) return { ok: false, reason: 'storage' } as const;
      return { ok: true, receipt: next, raw: nextRaw } as const;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return { ok: false, reason: message.toLowerCase().includes('lock') ? 'lock-unavailable' : 'storage' };
  }
}

export async function completeAccountLocalDataDeletion(
  expected: AccountDeletionReceipt, expectedRaw: string, storage: Store = localStorage, lock: AccountCoordinationLock = browserAccountLock,
): Promise<AccountDeletionResumeResult> {
  const demo = expected.kind === 'demo';
  try {
    return await lock(accountLifecycleLockName(expected.accountId, demo), 'exclusive', async () => {
      const key = accountDeletionReceiptKey(expected.accountId, demo), raw = storage.getItem(key);
      const current = decodeAccountDeletionReceipt(raw, expected.accountId, demo);
      if (!current || raw !== expectedRaw || current.phase !== expected.phase || current.generation !== expected.generation || current.authGeneration !== expected.authGeneration) return { ok: false, reason: 'receipt-changed' } as const;
      if (current.phase === 'complete') return { ok: true, receipt: current, raw } as const;
      if (current.phase !== 'local-data-cleared') return { ok: false, reason: 'recovery-required' } as const;
      const next: AccountDeletionReceipt = { ...current, phase: 'complete', updatedAt: new Date().toISOString() }, nextRaw = JSON.stringify(next);
      storage.setItem(key, nextRaw);
      if (storage.getItem(key) !== nextRaw) return { ok: false, reason: 'storage' } as const;
      return { ok: true, receipt: next, raw: nextRaw } as const;
    });
  } catch (error) { return { ok: false, reason: error instanceof Error && error.message.toLowerCase().includes('lock') ? 'lock-unavailable' : 'storage' }; }
}

/** Exclusive, retry-safe local account cleanup. Existing synchronous callers remain uncoordinated. */
export async function deleteAccountLocalDataAccount(
  scope: AccountScope,
  storage: Store = localStorage,
  lock: AccountCoordinationLock = browserAccountLock,
): Promise<AccountDeletionResult> {
  if (!scope.accountId || scope.kind === 'locked') return { ok: false, reason: 'account-changed' };
  try {
    return await lock(accountLifecycleLockName(scope.accountId, scope.kind === 'demo'), 'exclusive', async () => {
      try { accountScope.assertCurrent(scope); } catch { return { ok: false, reason: 'account-changed' } as const; }
      const ownedPrefix = prefix(scope);
      const tombstone = `${ownedPrefix}deleted`;
      const markerRaw = storage.getItem(generationMarkerKey(scope.accountId!, scope.kind === 'demo'));
      const tombstoneRaw = storage.getItem(tombstone);
      const receipt = decodeAccountDeletionReceipt(tombstoneRaw, scope.accountId!, scope.kind === 'demo');
      if (tombstoneRaw !== null && (!receipt || receipt.generation !== scope.generation || (markerRaw !== null && !hasCommittedGenerationMarker(markerRaw, scope.generation)))) {
        return { ok: false, reason: 'recovery-required' } as const;
      }
      if (tombstoneRaw === null && !hasCommittedGenerationMarker(markerRaw, scope.generation!)) {
        return { ok: false, reason: 'recovery-required' } as const;
      }
      deleteAccountLocalData(scope, storage);
      return { ok: true } as const;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return { ok: false, reason: message.includes('lock') ? 'lock-unavailable' : 'storage' };
  }
}
