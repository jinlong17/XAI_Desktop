import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { accountPrefix, accountScope, generationKey } from "@repo/plugin-web-storage";
import { clearAccountAiSecrets } from "@repo/plugin-web-ai-chat";
import { AccountDeletionRecoveryNotice } from "../AccountDeletionRecoveryNotice.js";
import { beginAccountLocalDeletion, listPendingAccountDeletions, readAccountDeletionReceipt, resumeAccountLocalDeletion } from "../internal/accountDeletionRecovery.js";
vi.mock("@repo/plugin-web-ai-chat", () => ({ clearAccountAiSecrets: vi.fn() }));
const keyA = generationKey("A-private-id", "g1", "xai_task_cols");
const keyB = generationKey("B-private-id", "g2", "xai_task_cols");
const tombstone = `${accountPrefix("A-private-id")}deleted`;
function start() {
  const scope = accountScope.activate(accountScope.lock("A-private-id"), "g1");
  return beginAccountLocalDeletion(scope);
}
beforeEach(() => {
  vi.clearAllMocks(); vi.mocked(clearAccountAiSecrets).mockResolvedValue(undefined);
  localStorage.setItem(keyA, "A business"); localStorage.setItem(keyB, "B business");
  localStorage.setItem("xai_task_cols", "unowned content"); localStorage.setItem("xai_lang", "zh");
});
function preserved() {
  expect(localStorage.getItem(keyB)).toBe("B business");
  expect(localStorage.getItem("xai_task_cols")).toBe("unowned content");
  expect(localStorage.getItem("xai_lang")).toBe("zh");
}

describe("durable local deletion recovery", () => {
  it('keeps captured authentication cleanup pending after failure and retries that generation after reload', async () => {
    const scope = accountScope.activate(accountScope.lock('A-private-id'), 'g1');
    const receipt = beginAccountLocalDeletion(scope, 'auth-A-original');
    expect(receipt.version).toBe(2);
    const clearAuth = vi.fn().mockRejectedValueOnce(new Error('blocked auth IDB')).mockResolvedValueOnce(undefined);
    await expect(resumeAccountLocalDeletion(receipt, clearAuth)).rejects.toThrow('blocked auth IDB');
    expect(readAccountDeletionReceipt('A-private-id')?.phase).toBe('local-data-cleared');
    expect(listPendingAccountDeletions()).toHaveLength(1);
    accountScope.activate(accountScope.lock('B-private-id'), 'g2');
    const reloaded = JSON.parse(localStorage.getItem(tombstone)!);
    await resumeAccountLocalDeletion(reloaded, clearAuth);
    expect(clearAuth).toHaveBeenNthCalledWith(2, { generation: 'auth-A-original', owner: 'A-private-id' });
    expect(readAccountDeletionReceipt('A-private-id')?.phase).toBe('complete');
    expect(accountScope.capture().accountId).toBe('B-private-id'); preserved();
  });
  it('never silently completes an auth-bound receipt when cleanup is unavailable', async () => {
    const scope = accountScope.activate(accountScope.lock('A-private-id'), 'g1');
    const receipt = beginAccountLocalDeletion(scope, 'auth-A-original');
    await expect(resumeAccountLocalDeletion(receipt)).rejects.toThrow('unavailable');
    expect(readAccountDeletionReceipt('A-private-id')?.phase).toBe('pending');
    expect(localStorage.getItem(keyA)).toBe('A business');
  });
  it("commits metadata as the tombstone before destructive work", () => {
    const receipt = start();
    expect(JSON.parse(localStorage.getItem(tombstone)!)).toEqual(receipt);
    expect(receipt.phase).toBe("pending");
    expect(Object.keys(receipt).sort()).toEqual(["accountId", "generation", "kind", "phase", "updatedAt", "version"]);
    expect(localStorage.getItem(keyA)).toBe("A business");
    expect(listPendingAccountDeletions()).toEqual([receipt]);
  });
  it("finishes only captured A after scope and in-memory state changed to B", async () => {
    start();
    const serialized = localStorage.getItem(tombstone)!;
    accountScope.activate(accountScope.lock("B-private-id"), "g2");
    const restored = JSON.parse(serialized);
    await resumeAccountLocalDeletion(restored);
    expect(localStorage.getItem(keyA)).toBeNull(); preserved();
    expect(clearAccountAiSecrets).toHaveBeenCalledWith(expect.objectContaining({ accountId: "A-private-id", kind: "account", generation: "g1" }));
    expect(accountScope.capture().accountId).toBe("B-private-id");
    expect(readAccountDeletionReceipt("A-private-id")?.phase).toBe("complete");
    expect(listPendingAccountDeletions()).toEqual([]);
  });
  it("retains a retryable receipt after secret cleanup fails and marks complete only on success", async () => {
    const receipt = start(); vi.mocked(clearAccountAiSecrets).mockRejectedValueOnce(new Error("blocked IDB"));
    await expect(resumeAccountLocalDeletion(receipt)).rejects.toThrow("blocked IDB");
    expect(readAccountDeletionReceipt("A-private-id")?.phase).toBe("local-data-cleared"); preserved();
    await resumeAccountLocalDeletion(readAccountDeletionReceipt("A-private-id")!);
    expect(readAccountDeletionReceipt("A-private-id")?.phase).toBe("complete");
  });
  it("does not mark a successful receipt if the final metadata write fails", async () => {
    const receipt = start(); const original = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === tombstone && JSON.parse(value).phase === "complete") throw new DOMException("full", "QuotaExceededError");
      return original.call(this, key, value);
    });
    await expect(resumeAccountLocalDeletion(receipt)).rejects.toThrow("full");
    expect(readAccountDeletionReceipt("A-private-id")?.phase).toBe("local-data-cleared"); preserved();
  });
  it("does not authorize cleanup from mismatched-owner, incomplete or legacy metadata", () => {
    localStorage.setItem(tombstone, JSON.stringify({ version: 1, accountId: "B-private-id", kind: "account", generation: "g2", phase: "pending", updatedAt: "now" }));
    expect(listPendingAccountDeletions()).toEqual([]);
    localStorage.setItem(tombstone, "1"); expect(listPendingAccountDeletions()).toEqual([]);
    localStorage.setItem(tombstone, "{invalid"); expect(listPendingAccountDeletions()).toEqual([]);
    expect(clearAccountAiSecrets).not.toHaveBeenCalled(); preserved();
  });
});

describe("recovery notice outside authenticated routes", () => {
  it("survives unmount/remount, shows no identity/content, and completes local cleanup while signed out", async () => {
    start(); accountScope.lock(null);
    const first = render(<AccountDeletionRecoveryNotice />);
    expect(screen.getByRole("button", { name: "Retry local cleanup" })).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("A-private-id"); expect(document.body.textContent).not.toContain("A business");
    first.unmount();
    render(<AccountDeletionRecoveryNotice />);
    fireEvent.click(screen.getByRole("button", { name: "Retry local cleanup" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Retry local cleanup" })).not.toBeInTheDocument());
    expect(localStorage.getItem(keyA)).toBeNull(); preserved();
    expect(accountScope.capture().kind).toBe("locked");
  });
  it("keeps the failure visible and allows explicit retry without touching B", async () => {
    start(); accountScope.activate(accountScope.lock("B-private-id"), "g2");
    vi.mocked(clearAccountAiSecrets).mockRejectedValueOnce(new Error("blocked"));
    render(<AccountDeletionRecoveryNotice lang="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Retry local cleanup" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Local cleanup could not finish"));
    preserved(); expect(readAccountDeletionReceipt("A-private-id")?.phase).not.toBe("complete");
    fireEvent.click(screen.getByRole("button", { name: "Retry local cleanup" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(accountScope.capture().accountId).toBe("B-private-id"); preserved();
  });
  it("appears when an already-mounted sign-in page receives a new pending receipt", async () => {
    render(<AccountDeletionRecoveryNotice lang="zh" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    act(() => { start(); });
    expect(screen.getByRole("button", { name: "重试本地清理" })).toBeInTheDocument();
  });
});
