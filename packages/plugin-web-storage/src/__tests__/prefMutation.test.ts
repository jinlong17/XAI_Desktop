import { beforeEach, expect, it, vi } from "vitest";
import { accountScope, generationKey, generationMarkerKey } from "../internal/accountScope.js";
import { mutatePref, prefMutationLockName } from "../internal/prefMutation.js";

const lock = async <T>(_name: string, _mode: "shared" | "exclusive", run: () => Promise<T>) => run();
function active() {
  const scope = accountScope.activate(accountScope.lock("pref-engine"), "one");
  localStorage.setItem(generationMarkerKey("pref-engine"), JSON.stringify({ generation: "one", migrationId: "fixture", previous: null }));
  return scope;
}
beforeEach(() => localStorage.clear());

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
