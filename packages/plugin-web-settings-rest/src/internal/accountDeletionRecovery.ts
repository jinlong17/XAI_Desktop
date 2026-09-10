/** Durable metadata only: survives sign-out, reload and partial local cleanup. */
import {
  accountDeletionReceiptKey, accountLifecycleLockName, accountScope, browserAccountLock,
  completeAccountLocalDataDeletion, decodeAccountDeletionReceipt, generationMarkerKey,
  hasCommittedGenerationMarker, resumeAccountLocalDataDeletion, type AccountDeletionReceipt, type AccountScope,
} from "@repo/plugin-web-storage";
import { clearAccountAiSecrets } from "@repo/plugin-web-ai-chat";

export type { AccountDeletionReceipt } from "@repo/plugin-web-storage";
export type AccountAuthCleanup = (captured: { generation: string; owner: string }) => Promise<void>;
const RECEIPT_EVENT = "xai:account-deletion-receipt";
const recoveryFlights = new Map<string, Promise<AccountDeletionReceipt>>();
function receiptKey(accountId: string, demo: boolean): string {
  // The tombstone itself is the durable receipt: one atomic metadata write
  // precedes every destructive operation. The storage eraser preserves it.
  return accountDeletionReceiptKey(accountId, demo);
}
export function subscribeAccountDeletionReceipts(listener: () => void): () => void {
  const storage = (event: StorageEvent) => { if (event.key === null || event.key.endsWith(":deleted")) listener(); };
  window.addEventListener(RECEIPT_EVENT, listener);
  window.addEventListener("storage", storage);
  return () => { window.removeEventListener(RECEIPT_EVENT, listener); window.removeEventListener("storage", storage); };
}
export function listPendingAccountDeletions(): AccountDeletionReceipt[] {
  const pending: AccountDeletionReceipt[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const match = key?.match(/^xai:(account|demo):v1:([^:]+):deleted$/);
    if (!match) continue;
    try {
      const receipt = readAccountDeletionReceipt(decodeURIComponent(match[2]!), match[1] === "demo");
      if (receipt && receipt.phase !== "complete") pending.push(receipt);
    } catch (error) {
      if (error instanceof DOMException) throw error;
      // Malformed metadata cannot authorize erasure of an account.
    }
  }
  return pending;
}

function write(receipt: AccountDeletionReceipt): AccountDeletionReceipt {
  localStorage.setItem(receiptKey(receipt.accountId, receipt.kind === "demo"), JSON.stringify(receipt));
  window.dispatchEvent(new Event(RECEIPT_EVENT));
  return receipt;
}
export function readAccountDeletionReceipt(accountId: string, demo = false): AccountDeletionReceipt | null {
  const raw = localStorage.getItem(receiptKey(accountId, demo));
  if (!raw) return null;
  const receipt = decodeAccountDeletionReceipt(raw, accountId, demo);
  if (!receipt) throw new Error("Invalid account deletion receipt");
  return receipt;
}
export async function beginAccountLocalDeletion(scope: AccountScope, authGeneration?: string): Promise<AccountDeletionReceipt> {
  if (scope.kind === "locked" || !scope.accountId || !scope.generation) throw new Error("Captured account is required");
  if (authGeneration !== undefined && (scope.kind !== 'account' || !authGeneration)) throw new Error('Invalid captured auth generation');
  return browserAccountLock(accountLifecycleLockName(scope.accountId, scope.kind === 'demo'), 'exclusive', async () => {
    accountScope.assertCurrent(scope);
    const marker = localStorage.getItem(generationMarkerKey(scope.accountId!, scope.kind === 'demo'));
    if (!hasCommittedGenerationMarker(marker, scope.generation!)) throw new Error('Account deletion requires a complete current marker');
    const key = receiptKey(scope.accountId!, scope.kind === 'demo');
    if (localStorage.getItem(key) !== null) throw new Error('A prior account deletion receipt must be resolved first');
    return write({ version: authGeneration ? 2 : 1, accountId: scope.accountId!, kind: scope.kind as 'account' | 'demo', generation: scope.generation!, phase: "pending", updatedAt: new Date().toISOString(),
      ...(authGeneration ? { authGeneration } : {}) });
  });
}
/** Retry confirmed local erasure; auth cleanup must target only the captured generation. */
async function resumeAccountLocalDeletionOnce(receipt: AccountDeletionReceipt, clearAuth?: AccountAuthCleanup): Promise<AccountDeletionReceipt> {
  const key = receiptKey(receipt.accountId, receipt.kind === 'demo');
  const expectedRaw = localStorage.getItem(key);
  const saved = readAccountDeletionReceipt(receipt.accountId, receipt.kind === "demo");
  if (!saved || !expectedRaw || saved.generation !== receipt.generation || saved.version !== receipt.version
    || saved.authGeneration !== receipt.authGeneration) throw new Error("Account deletion receipt no longer matches");
  if (saved.phase === "complete") return saved;
  if (saved.authGeneration && !clearAuth) throw new Error('Authentication cleanup is unavailable; recovery remains pending');
  const local = await resumeAccountLocalDataDeletion(saved, expectedRaw);
  if (!local.ok) throw new Error(`Local account cleanup refused: ${local.reason}`);
  const cleared = local.receipt;
  const scope: AccountScope = Object.freeze({ kind: saved.kind, accountId: saved.accountId, generation: saved.generation, epoch: -1 });
  await Promise.resolve();
  if (localStorage.getItem(key) !== local.raw) throw new Error('Account deletion receipt changed before secret cleanup');
  await clearAccountAiSecrets(scope);
  if (localStorage.getItem(key) !== local.raw) throw new Error('Account deletion receipt changed during cleanup');
  if (saved.authGeneration) await clearAuth!({ generation: saved.authGeneration, owner: saved.accountId });
  const currentRaw = localStorage.getItem(key);
  if (currentRaw !== local.raw) throw new Error('Account deletion receipt changed during cleanup');
  const complete = await completeAccountLocalDataDeletion(cleared, local.raw);
  if (!complete.ok) throw new Error(`Account deletion completion refused: ${complete.reason}`);
  return complete.receipt;
}

/** Same-page recovery callers share one captured-owner workflow; storage still
 * supplies the short cross-tab account-exclusive sections. */
export function resumeAccountLocalDeletion(receipt: AccountDeletionReceipt, clearAuth?: AccountAuthCleanup): Promise<AccountDeletionReceipt> {
  const key = `${receipt.kind}:${receipt.accountId}:${receipt.generation}`;
  const active = recoveryFlights.get(key);
  if (active) return active;
  const operation = resumeAccountLocalDeletionOnce(receipt, clearAuth);
  recoveryFlights.set(key, operation);
  void operation.then(
    () => { if (recoveryFlights.get(key) === operation) recoveryFlights.delete(key); },
    () => { if (recoveryFlights.get(key) === operation) recoveryFlights.delete(key); },
  );
  return operation;
}
