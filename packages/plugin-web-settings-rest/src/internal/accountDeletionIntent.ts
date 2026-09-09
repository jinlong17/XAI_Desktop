/** A durable intent is evidence of a request, never authorization for local erasure. */
import { accountPrefix, type AccountScope } from "@repo/plugin-web-storage";

export interface AccountDeletionIntent {
  version: 1;
  accountId: string;
  generation: string;
  operationId: string;
  phase: "server-outcome-unknown";
  createdAt: string;
}
const EVENT = "xai:account-deletion-intent";
const keyFor = (accountId: string) => `${accountPrefix(accountId)}deletion-intent`;
export function prepareAccountDeletionIntent(scope: AccountScope): AccountDeletionIntent {
  if (scope.kind !== "account" || !scope.accountId || !scope.generation) throw new Error("An authenticated account is required");
  // A later rejected request cannot resolve an earlier request's lost response.
  // Preserve even unreadable metadata rather than overwriting recovery evidence.
  if (localStorage.getItem(keyFor(scope.accountId)) !== null) throw new Error("A prior account deletion outcome must be resolved before another request");
  const intent: AccountDeletionIntent = { version: 1, accountId: scope.accountId, generation: scope.generation, operationId: crypto.randomUUID(), phase: "server-outcome-unknown", createdAt: new Date().toISOString() };
  const raw = JSON.stringify(intent);
  localStorage.setItem(keyFor(intent.accountId), raw);
  if (localStorage.getItem(keyFor(intent.accountId)) !== raw) throw new Error("Deletion intent could not be verified");
  window.dispatchEvent(new Event(EVENT));
  return intent;
}
export function discardRejectedDeletionIntent(intent: AccountDeletionIntent): void {
  const key = keyFor(intent.accountId);
  const raw = localStorage.getItem(key);
  if (!raw) return;
  const current = JSON.parse(raw) as Partial<AccountDeletionIntent>;
  if (current.operationId !== intent.operationId) return;
  localStorage.removeItem(key);
  window.dispatchEvent(new Event(EVENT));
}
export function hasUnconfirmedAccountDeletion(): boolean {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("xai:account:v1:") || !key.endsWith(":deletion-intent")) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    let value: Partial<AccountDeletionIntent>;
    try { value = JSON.parse(raw) as Partial<AccountDeletionIntent>; } catch { continue; }
    if (!value || value.version !== 1 || value.phase !== "server-outcome-unknown" || typeof value.accountId !== "string" || key !== keyFor(value.accountId) || typeof value.operationId !== "string" || typeof value.generation !== "string") continue;
    // A durable local receipt supersedes the unknown outcome: the server confirmed.
    const receipt = localStorage.getItem(`${accountPrefix(value.accountId)}deleted`);
    if (receipt) {
      try { const r = JSON.parse(receipt); if (r?.version === 1 && r.accountId === value.accountId && ["pending", "local-data-cleared", "complete"].includes(r.phase)) continue; } catch { /* Keep the uncertain outcome visible. */ }
    }
    return true;
  }
  return false;
}
export function subscribeDeletionIntent(listener: () => void): () => void {
  const storage = (event: StorageEvent) => { if (event.key === null || event.key.endsWith(":deletion-intent") || event.key.endsWith(":deleted")) listener(); };
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", storage);
  return () => { window.removeEventListener(EVENT, listener); window.removeEventListener("storage", storage); };
}
