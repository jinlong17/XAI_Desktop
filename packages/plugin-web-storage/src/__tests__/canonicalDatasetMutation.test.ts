import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { accountPrefix, accountScope, generationMarkerKey, type AccountScope } from "../internal/accountScope.js";
import {
  canonicalCommandReceiptId,
  canonicalCommandSignature,
  commitCanonicalCommand,
  mutateCanonicalDataset,
  readCanonicalCommandState,
  setCanonicalCommandActivationForTests,
  type CanonicalDatasetInput,
} from "../internal/canonicalCommandState.js";
import { _clearAllListeners, subscribeSameTab } from "../internal/storage.js";

type Domain = { items: string[] };
const validate = (value: unknown): value is Domain => typeof value === "object" && value !== null
  && !Array.isArray(value) && Array.isArray((value as { items?: unknown }).items)
  && (value as { items: unknown[] }).items.every(item => typeof item === "string");

function activate(id = "ordinary-writer", generation = "fixture"): AccountScope {
  const scope = accountScope.activate(accountScope.lock(id), generation);
  localStorage.setItem(generationMarkerKey(id), JSON.stringify({ generation, migrationId: "test", previous: null }));
  return scope;
}
function key(scope: AccountScope): string { return accountScope.physicalKey("xai_task_cols", scope); }
function input(scope: AccountScope, overrides: Partial<CanonicalDatasetInput<Domain>> = {}): CanonicalDatasetInput<Domain> {
  return { key: "xai_task_cols", scope, validate, mutate: data => ({ ok: true, data: { items: [...data.items, "human"] } }), ...overrides };
}

beforeEach(() => {
  localStorage.clear();
  _clearAllListeners();
  setCanonicalCommandActivationForTests(true);
  vi.stubGlobal("navigator", { locks: { request: vi.fn(async (_name: string, callback: () => Promise<unknown>) => callback()) } });
});
afterEach(() => { setCanonicalCommandActivationForTests(false); _clearAllListeners(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("ordinary canonical dataset writer", () => {
  it("preserves a command receipt, commits once, and publishes domain data despite a faulty listener", async () => {
    const scope = activate();
    await expect(commitCanonicalCommand({
      key: "xai_task_cols", scope, channel: "web:tasks:create", requestId: "ai-1", operation: { title: "AI" },
      validate, initialize: () => ({ items: [] }), mutate: data => ({ ok: true, data: { items: [...data.items, "AI"] }, targetId: "ai" }),
    })).resolves.toMatchObject({ ok: true });
    const receiptId = canonicalCommandReceiptId("web:tasks:create", "ai-1")!;
    const seen: Domain[] = [];
    subscribeSameTab("xai_task_cols", value => { seen.push(value as Domain); }, scope);
    subscribeSameTab("xai_task_cols", () => { throw new Error("observer failed"); }, scope);
    const set = vi.spyOn(Storage.prototype, "setItem");
    await expect(mutateCanonicalDataset(input(scope))).resolves.toEqual({ ok: true, data: { items: ["AI", "human"] }, revision: 2, changed: true });
    expect(set.mock.calls.filter(([target]) => target === key(scope))).toHaveLength(1);
    expect(seen).toEqual([{ items: ["AI", "human"] }]);
    const state = readCanonicalCommandState<Domain>(JSON.parse(localStorage.getItem(key(scope))!));
    expect(state.status).toBe("envelope");
    if (state.status === "envelope") expect(state.envelope.receipts[receiptId]).toBeDefined();
  });

  it("permits an ordinary edit at receipt capacity and keeps receipts on domain clear", async () => {
    const scope = activate();
    const receipts = Object.fromEntries(Array.from({ length: 512 }, (_, index) => [
      `r-${index}`, { operationVersion: 1, signature: `sig-${index}`, result: { ok: true, targetId: "t" }, committedAt: "2026-09-09T00:00:00.000Z" },
    ]));
    localStorage.setItem(key(scope), JSON.stringify({ format: "xai-command-state", version: 1, revision: 3, data: { items: ["old"] }, receipts }));
    await expect(mutateCanonicalDataset(input(scope, { mutate: () => ({ ok: true, data: { items: [] } }) }))).resolves.toMatchObject({ ok: true, data: { items: [] } });
    const state = readCanonicalCommandState<Domain>(JSON.parse(localStorage.getItem(key(scope))!));
    expect(state.status).toBe("envelope");
    if (state.status === "envelope") expect(Object.keys(state.envelope.receipts)).toHaveLength(512);
  });

  it("does not seed or overwrite invalid present bytes, and rejects a stale snapshot revision", async () => {
    const scope = activate();
    const physical = key(scope);
    localStorage.setItem(physical, "null");
    await expect(mutateCanonicalDataset(input(scope, { initialize: () => ({ items: [] }) }))).resolves.toEqual({ ok: false, reason: "recovery-required" });
    expect(localStorage.getItem(physical)).toBe("null");
    localStorage.setItem(physical, JSON.stringify({ format: "xai-command-state", version: 1, revision: 4, data: { items: [] }, receipts: {} }));
    await expect(mutateCanonicalDataset(input(scope, { expectedRevision: 3 }))).resolves.toEqual({ ok: false, reason: "conflict" });
  });

  it("rechecks the owner boundary under the shared lock before writing", async () => {
    const scope = activate();
    const physical = key(scope);
    const raw = JSON.stringify({ items: [] });
    localStorage.setItem(physical, raw);
    await expect(mutateCanonicalDataset(input(scope, { mutate: data => {
      activate("replacement");
      return { ok: true, data: { items: [...data.items, "human"] } };
    } }))).resolves.toEqual({ ok: false, reason: "account-changed" });
    expect(localStorage.getItem(physical)).toBe(raw);
    expect(localStorage.getItem(`${accountPrefix(scope.accountId!)}deleted`)).toBeNull();
  });
});
