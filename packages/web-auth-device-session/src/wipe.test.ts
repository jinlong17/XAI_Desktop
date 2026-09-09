import { afterEach, expect, it, vi } from "vitest";
import { ACCOUNT_LOCAL_WIPE_IDB_NAMES, wipeRegisteredIDB } from "./wipe";

afterEach(() => vi.unstubAllGlobals());
function factory() {
  const requests: Record<string, { onsuccess?: () => void; onerror?: () => void; onblocked?: () => void; error?: DOMException }> = {};
  const deleteDatabase = vi.fn((name: string) => requests[name] = {});
  vi.stubGlobal("indexedDB", { deleteDatabase });
  return { requests, deleteDatabase };
}
it("resolves only after every database reports success", async () => {
  const { requests } = factory();
  const work = wipeRegisteredIDB();
  for (const name of ACCOUNT_LOCAL_WIPE_IDB_NAMES) requests[name]!.onsuccess!();
  await expect(work).resolves.toBeUndefined();
});
it("reports blocked and failed stores even if a blocked deletion later succeeds", async () => {
  const { requests } = factory();
  const work = wipeRegisteredIDB();
  requests["web-encrypted-cache"]!.onsuccess!();
  requests["xai-web-auth"]!.error = new DOMException("Synthetic failure", "UnknownError");
  requests["xai-web-auth"]!.onerror!();
  requests["xai-web-ai-secrets"]!.onblocked!();
  requests["xai-web-ai-secrets"]!.onsuccess!();
  const error = await work.catch(error => error);
  expect(error).toBeInstanceOf(AggregateError);
  expect(error.errors).toHaveLength(2);
  expect(error.errors.map((item: Error) => item.message).join(" ")).toMatch(/xai-web-auth/);
  expect(error.errors.map((item: Error) => item.message).join(" ")).toMatch(/xai-web-ai-secrets/);
});
it("a fresh retry can succeed after the blocker is removed", async () => {
  const { requests } = factory();
  const first = wipeRegisteredIDB();
  for (const name of ACCOUNT_LOCAL_WIPE_IDB_NAMES) requests[name]!.onblocked!();
  await expect(first).rejects.toBeInstanceOf(AggregateError);
  const retry = wipeRegisteredIDB();
  for (const name of ACCOUNT_LOCAL_WIPE_IDB_NAMES) requests[name]!.onsuccess!();
  await expect(retry).resolves.toBeUndefined();
});
it("rejects unavailable IndexedDB instead of claiming no-op success", async () => {
  vi.stubGlobal("indexedDB", undefined);
  await expect(wipeRegisteredIDB()).rejects.toThrow("unavailable");
});
it("reports synchronous request failures", async () => {
  vi.stubGlobal("indexedDB", { deleteDatabase: () => { throw new DOMException("Denied", "SecurityError"); } });
  const error = await wipeRegisteredIDB().catch(error => error);
  expect(error).toBeInstanceOf(AggregateError);
  expect(error.errors).toHaveLength(ACCOUNT_LOCAL_WIPE_IDB_NAMES.length);
});
