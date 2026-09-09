/** Durable metadata only: survives sign-out, reload and partial local cleanup. */
import { accountPrefix, deleteAccountLocalData, type AccountScope } from "@repo/plugin-web-storage";
import { clearAccountAiSecrets } from "@repo/plugin-web-ai-chat";

export interface AccountDeletionReceipt {
  readonly version: 1;
  readonly accountId: string;
  readonly kind: "account" | "demo";
  readonly generation: string;
  readonly phase: "pending" | "local-data-cleared" | "complete";
  readonly updatedAt: string;
}
const RECEIPT_EVENT = "xai:account-deletion-receipt";
function receiptKey(accountId: string, demo: boolean): string {
  // The tombstone itself is the durable receipt: one atomic metadata write
  // precedes every destructive operation. The storage eraser preserves it.
  return `${accountPrefix(accountId, demo)}deleted`;
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
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object") throw new Error("Invalid account deletion receipt");
  const r = value as Partial<AccountDeletionReceipt>;
  if (r.version !== 1 || r.accountId !== accountId || r.kind !== (demo ? "demo" : "account") ||
      typeof r.generation !== "string" || !r.generation || typeof r.updatedAt !== "string" ||
      !["pending", "local-data-cleared", "complete"].includes(r.phase ?? "")) throw new Error("Invalid account deletion receipt");
  return { version: 1, accountId, kind: r.kind, generation: r.generation, phase: r.phase!, updatedAt: r.updatedAt };
}
export function beginAccountLocalDeletion(scope: AccountScope): AccountDeletionReceipt {
  if (scope.kind === "locked" || !scope.accountId || !scope.generation) throw new Error("Captured account is required");
  return write({ version: 1, accountId: scope.accountId, kind: scope.kind, generation: scope.generation, phase: "pending", updatedAt: new Date().toISOString() });
}
/** Explicit retry of already-authorized LOCAL erasure; never calls the server or signs out. */
export async function resumeAccountLocalDeletion(receipt: AccountDeletionReceipt): Promise<AccountDeletionReceipt> {
  const saved = readAccountDeletionReceipt(receipt.accountId, receipt.kind === "demo");
  if (!saved || saved.generation !== receipt.generation) throw new Error("Account deletion receipt no longer matches");
  if (saved.phase === "complete") return saved;
  const scope: AccountScope = Object.freeze({ kind: saved.kind, accountId: saved.accountId, generation: saved.generation, epoch: -1 });
  deleteAccountLocalData(scope);
  const cleared = write({ ...saved, phase: "local-data-cleared", updatedAt: new Date().toISOString() });
  await clearAccountAiSecrets(scope);
  return write({ ...cleared, phase: "complete", updatedAt: new Date().toISOString() });
}
