import { accountPrefix } from "./accountScope.js";

export type AccountDeletionPhase = "pending" | "local-data-cleared" | "complete";
export type AccountDeletionReceipt = Readonly<{
  version: 1 | 2; accountId: string; kind: "account" | "demo"; generation: string;
  phase: AccountDeletionPhase; updatedAt: string; authGeneration?: string;
}>;

export function accountDeletionReceiptKey(accountId: string, demo = false): string {
  return `${accountPrefix(accountId, demo)}deleted`;
}

export function decodeAccountDeletionReceipt(raw: string | null, accountId: string, demo = false): AccountDeletionReceipt | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const receipt = value as Partial<AccountDeletionReceipt>;
    if ((receipt.version !== 1 && receipt.version !== 2) || receipt.accountId !== accountId
      || receipt.kind !== (demo ? "demo" : "account") || typeof receipt.generation !== "string" || !receipt.generation
      || typeof receipt.updatedAt !== "string" || !Number.isFinite(Date.parse(receipt.updatedAt))
      || (receipt.phase !== "pending" && receipt.phase !== "local-data-cleared" && receipt.phase !== "complete")) return null;
    if (receipt.version === 2 && (receipt.kind !== "account" || typeof receipt.authGeneration !== "string" || !receipt.authGeneration)) return null;
    if (receipt.version === 1 && receipt.authGeneration !== undefined) return null;
    return receipt as AccountDeletionReceipt;
  } catch { return null; }
}
