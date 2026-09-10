import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { accountScope, generationKey, generationMarkerKey } from "../internal/accountScope.js";
import { mutatePref, prefMutationLockName } from "../internal/prefMutation.js";

const lock = async <T>(_name: string, _mode: "shared" | "exclusive", run: () => Promise<T>) => run();
function active() {
  const scope = accountScope.activate(accountScope.lock("pref-engine"), "one");
  localStorage.setItem(generationMarkerKey("pref-engine"), JSON.stringify({ generation: "one", migrationId: "fixture", previous: null }));
  return scope;
}
beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

it("serializes a functional account update under account then physical-key locks", async () => {
  const scope = active();
  const names: string[] = [];
  const observed = async <T>(name: string, mode: "shared" | "exclusive", run: () => Promise<T>) => { names.push(`${mode}:${name}`); return run(); };
  const options = { key: "xai_pref_async_counter", codec: "number" as const, defaultValue: 0, validate: (v: unknown): v is number => typeof v === "number", scope, accountLock: observed, keyLock: observed };
  expect((await mutatePref({ ...options, next: n => n + 1 })).ok).toBe(true);
  expect((await mutatePref({ ...options, next: n => n + 1 })).ok).toBe(true);
  expect(localStorage.getItem(generationKey("pref-engine", "one", "xai_pref_async_counter"))).toBe("2");
  expect(names[0]).toMatch(/^shared:/); expect(names[1]).toContain(`exclusive:${prefMutationLockName(generationKey("pref-engine", "one", "xai_pref_async_counter"))}`);
});

it("refuses invalid/null sources and a stale raw baseline without changing bytes", async () => {
  const scope = active(); const physical = generationKey("pref-engine", "one", "xai_pref_async_value");
  localStorage.setItem(physical, "null");
  const options = { key: "xai_pref_async_value", codec: "string" as const, defaultValue: "comment", validate: (v: unknown): v is string => v === "comment" || v === "edit", scope, accountLock: lock, keyLock: lock };
  expect(await mutatePref({ ...options, next: "edit" })).toMatchObject({ ok: false, reason: "invalid" });
  expect(localStorage.getItem(physical)).toBe("null");
  localStorage.setItem(physical, "comment");
  expect(await mutatePref({ ...options, expectedRaw: "view", next: "edit" })).toMatchObject({ ok: false, reason: "conflict" });
  expect(localStorage.getItem(physical)).toBe("comment");
});

it("refuses generic canonical mutations and publishes only after verified write", async () => {
  const scope = active(); const publish = vi.fn();
  const { subscribeSameTab } = await import("../internal/sameTabBus.js");
  const stop = subscribeSameTab("xai_pref_async_pub", publish, scope);
  const options = { key: "xai_pref_async_pub", codec: "string" as const, defaultValue: "comment", validate: (v: unknown): v is string => v === "comment" || v === "edit", scope, accountLock: lock, keyLock: lock };
  expect(await mutatePref({ ...options, next: "edit" })).toMatchObject({ ok: true, changed: true });
  expect(publish).toHaveBeenCalledTimes(1);
  expect(await mutatePref({ key: "xai_task_cols", codec: "json", defaultValue: [], validate: Array.isArray, next: [], scope, accountLock: lock, keyLock: lock })).toMatchObject({ ok: false, reason: "canonical" });
  stop();
});

it("consumes an opaque uncertain-write token only for the original baseline and intended bytes", async () => {
  const scope = active();
  const key = "xai_pref_async_token";
  const physical = generationKey("pref-engine", "one", key);
  const options = { key, codec: "string" as const, defaultValue: "comment", validate: (v: unknown): v is string => v === "comment" || v === "edit", scope, accountLock: lock, keyLock: lock };
  const notice = vi.fn();
  const { subscribeSameTab } = await import("../internal/sameTabBus.js");
  const stop = subscribeSameTab(key, notice, scope);
  const native = Storage.prototype.getItem;
  let reads = 0;
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, storedKey: string) {
    if (storedKey === physical && ++reads === 2) throw new Error("readback fault");
    return native.call(this, storedKey);
  });
  const uncertain = await mutatePref({ ...options, expectedRaw: null, next: "edit" });
  expect(uncertain).toMatchObject({ ok: false, reason: "readback-uncertain" });
  if (uncertain.ok || !uncertain.retryToken) throw new Error("expected opaque retry token");
  vi.restoreAllMocks();
  expect(await mutatePref({ ...options, expectedRaw: null, reconcileToken: "wrong", next: "edit" })).toMatchObject({ ok: false, reason: "conflict" });
  expect(await mutatePref({ ...options, expectedRaw: null, reconcileToken: uncertain.retryToken, next: "edit" })).toMatchObject({ ok: true, changed: false });
  expect(notice).toHaveBeenCalledTimes(1);
  expect(await mutatePref({ ...options, expectedRaw: null, reconcileToken: uncertain.retryToken, next: "edit" })).toMatchObject({ ok: false, reason: "conflict" });
  expect(notice).toHaveBeenCalledTimes(1);
  stop();
});

it("never lets an uncertain token cross keys, change intent, or survive an external replacement", async () => {
  const scope = active();
  const key = "xai_pref_async_token_external";
  const physical = generationKey("pref-engine", "one", key);
  const options = { key, codec: "string" as const, defaultValue: "comment", validate: (v: unknown): v is string => v === "comment" || v === "edit" || v === "view", scope, accountLock: lock, keyLock: lock };
  const notice = vi.fn();
  const { subscribeSameTab } = await import("../internal/sameTabBus.js");
  const stop = subscribeSameTab(key, notice, scope);
  const native = Storage.prototype.getItem;
  let reads = 0;
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, storedKey: string) {
    if (storedKey === physical && ++reads === 2) throw new Error("readback fault");
    return native.call(this, storedKey);
  });
  const uncertain = await mutatePref({ ...options, expectedRaw: null, next: "edit" });
  if (uncertain.ok || !uncertain.retryToken) throw new Error("expected opaque retry token");
  vi.restoreAllMocks();
  expect(await mutatePref({ ...options, expectedRaw: null, reconcileToken: uncertain.retryToken, next: "view" })).toMatchObject({ ok: false, reason: "conflict" });
  localStorage.setItem(generationKey("pref-engine", "one", "xai_pref_async_token_other"), "view");
  expect(await mutatePref({ ...options, key: "xai_pref_async_token_other", expectedRaw: null, reconcileToken: uncertain.retryToken, next: "edit" })).toMatchObject({ ok: false, reason: "conflict" });
  localStorage.setItem(physical, "view");
  expect(await mutatePref({ ...options, expectedRaw: null, reconcileToken: uncertain.retryToken, next: "edit" })).toMatchObject({ ok: false, reason: "conflict" });
  localStorage.setItem(physical, "edit");
  expect(await mutatePref({ ...options, expectedRaw: null, reconcileToken: uncertain.retryToken, next: "edit" })).toMatchObject({ ok: false, reason: "conflict" });
  expect(notice).not.toHaveBeenCalled();
  stop();
});
