import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { accountLifecycleLockName } from "../internal/accountCoordination.js";
import { accountScope, generationKey, generationMarkerKey, type AccountScope } from "../internal/accountScope.js";
import { prefMutationLockName } from "../internal/prefMutation.js";
import { subscribeSameTab } from "../internal/sameTabBus.js";
import { usePrefAsync } from "../internal/usePrefAsync.js";
import { usePrefAutosaveAsync } from "../internal/usePrefAutosaveAsync.js";

type Run<T = unknown> = () => T | Promise<T>;
function createNamedLockManager() {
  type Job = { mode: LockMode; enter: () => void };
  const states = new Map<string, { readers: number; writer: boolean; queue: Job[] }>();
  function request<T>(name: string, optionsOrRun: LockOptions | Run<T>, maybeRun?: Run<T>): Promise<T> {
    const mode = typeof optionsOrRun === "function" ? "exclusive" : optionsOrRun.mode ?? "exclusive";
    const run = typeof optionsOrRun === "function" ? optionsOrRun : maybeRun;
    if (!run) return Promise.reject(new TypeError("Web Locks callback is required"));
    const state = states.get(name) ?? { readers: 0, writer: false, queue: [] };
    states.set(name, state);
    const drain = () => {
      while (!state.writer && state.queue.length > 0) {
        const job = state.queue[0]!;
        if (job.mode === "exclusive" && state.readers > 0) return;
        state.queue.shift();
        job.enter();
        if (job.mode === "exclusive") return;
      }
    };
    return new Promise<T>((resolve, reject) => {
      state.queue.push({ mode, enter: () => {
        if (mode === "shared") state.readers += 1;
        else state.writer = true;
        const release = () => { if (mode === "shared") state.readers -= 1; else state.writer = false; drain(); };
        let result: T | Promise<T>;
        try { result = run(); } catch (error) { release(); reject(error); return; }
        void Promise.resolve(result).then(
          value => { release(); resolve(value); },
          error => { release(); reject(error); },
        );
      } });
      drain();
    });
  }
  return { request };
}

const validShare = (value: unknown): value is "comment" | "edit" | "view" => value === "comment" || value === "edit" || value === "view";
const validNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const prefKey = "xai_pref_collab_default_share" as const;
function activate(id: string, generation = "g1"): AccountScope {
  const scope = accountScope.activate(accountScope.lock(id), generation);
  localStorage.setItem(generationMarkerKey(id), JSON.stringify({ generation, migrationId: "test", previous: null }));
  return scope;
}
function physical(scope = accountScope.capture()): string {
  if (!scope.accountId || !scope.generation) throw new Error("active account required");
  return generationKey(scope.accountId, scope.generation, prefKey, scope.kind === "demo");
}
function holdLifecycle(id: string) {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const held = navigator.locks.request(accountLifecycleLockName(id), { mode: "exclusive" }, () => gate);
  return { release, held };
}

const mounted: Array<{ node: HTMLDivElement; root: Root }> = [];
function renderPrefHook<T>(hook: () => T) {
  const node = document.createElement("div");
  document.body.appendChild(node);
  const root = createRoot(node);
  let current!: T;
  function Probe(): ReactNode { current = hook(); return null; }
  act(() => { root.render(createElement(Probe)); });
  const mountedRoot = { node, root };
  mounted.push(mountedRoot);
  return {
    result: { get current() { return current; } },
    unmount() {
      act(() => { root.unmount(); });
      node.remove();
      const index = mounted.indexOf(mountedRoot);
      if (index >= 0) mounted.splice(index, 1);
    },
  };
}

beforeEach(() => {
  localStorage.clear();
  activate("async-hooks-A");
  vi.stubGlobal("navigator", { locks: createNamedLockManager() });
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});
afterEach(() => {
  for (const { node, root } of mounted.splice(0)) { act(() => { root.unmount(); }); node.remove(); }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("serializes independent functional hooks against the latest persisted value", async () => {
  localStorage.setItem("xai_accent_hue", "165");
  const first = renderPrefHook(() => usePrefAsync("xai_accent_hue", { validate: validNumber }));
  const second = renderPrefHook(() => usePrefAsync("xai_accent_hue", { validate: validNumber }));
  const addFirst = vi.fn((value: number) => value + 1);
  const addSecond = vi.fn((value: number) => value + 1);
  await act(async () => { await Promise.all([first.result.current[1](addFirst), second.result.current[1](addSecond)]); });
  expect(localStorage.getItem("xai_accent_hue")).toBe("167");
  expect(addFirst).toHaveBeenCalledTimes(1);
  expect(addSecond).toHaveBeenCalledTimes(1);
});

it("hides an A draft in B and old completion cannot affect the B session", async () => {
  const aScope = accountScope.capture();
  localStorage.setItem(physical(aScope), "comment");
  const hook = renderPrefHook(() => usePrefAutosaveAsync(prefKey, { validate: validShare }));
  const held = holdLifecycle("async-hooks-A");
  let old!: Promise<unknown>;
  act(() => { old = hook.result.current.edit("view"); });
  let bScope!: AccountScope;
  localStorage.setItem(generationKey("async-hooks-B", "g2", prefKey), "edit");
  act(() => { bScope = activate("async-hooks-B", "g2"); });
  await act(async () => { await Promise.resolve(); });
  expect(hook.result.current.value).toBe("edit");
  await act(async () => { await hook.result.current.edit("comment"); });
  held.release();
  await act(async () => { await held.held; await old; });
  expect(localStorage.getItem(physical(aScope))).toBe("comment");
  expect(localStorage.getItem(physical(bScope))).toBe("comment");
  expect(hook.result.current.value).toBe("comment");
  expect(hook.result.current.meta.status).toBe("saved");
});

it("invalidates queued work on unmount and a same-key remount stays independent", async () => {
  const scope = accountScope.capture();
  localStorage.setItem(physical(scope), "comment");
  const held = holdLifecycle("async-hooks-A");
  const old = renderPrefHook(() => usePrefAutosaveAsync(prefKey, { validate: validShare }));
  let first!: Promise<unknown>;
  let second!: Promise<unknown>;
  act(() => { first = old.result.current.edit("edit"); second = old.result.current.edit("view"); });
  old.unmount();
  const fresh = renderPrefHook(() => usePrefAutosaveAsync(prefKey, { validate: validShare }));
  expect(fresh.result.current.value).toBe("comment");
  held.release();
  await act(async () => { await held.held; await Promise.all([first, second]); });
  expect(localStorage.getItem(physical(scope))).toBe("comment");
  expect(fresh.result.current.value).toBe("comment");
});

it("orders pending edit, reset, and newer edit and only the latest becomes Saved", async () => {
  const scope = accountScope.capture();
  localStorage.setItem(physical(scope), "comment");
  const hook = renderPrefHook(() => usePrefAutosaveAsync(prefKey, { validate: validShare }));
  const held = holdLifecycle("async-hooks-A");
  let edit!: Promise<unknown>;
  let reset!: Promise<unknown>;
  let latest!: Promise<unknown>;
  act(() => {
    edit = hook.result.current.edit("edit");
    reset = hook.result.current.reset();
    latest = hook.result.current.edit("view");
  });
  expect(hook.result.current.value).toBe("view");
  held.release();
  await act(async () => { await held.held; await Promise.all([edit, reset, latest]); });
  expect(localStorage.getItem(physical(scope))).toBe("view");
  expect(hook.result.current.value).toBe("view");
  expect(hook.result.current.meta.status).toBe("saved");
});

it("does not revert a newer visible draft when its predecessor commits", async () => {
  const scope = accountScope.capture();
  const key = physical(scope);
  localStorage.setItem(key, "comment");
  const hook = renderPrefHook(() => usePrefAutosaveAsync(prefKey, { validate: validShare }));
  let releaseSecond!: () => void;
  let secondLock: Promise<unknown> | null = null;
  const unsubscribe = subscribeSameTab(prefKey, () => {
    if (secondLock !== null) return;
    const gate = new Promise<void>(resolve => { releaseSecond = resolve; });
    secondLock = navigator.locks.request(prefMutationLockName(key), () => gate);
  }, scope);
  let first!: Promise<unknown>;
  let second!: Promise<unknown>;
  act(() => { first = hook.result.current.edit("edit"); second = hook.result.current.edit("view"); });
  await act(async () => { await first; await Promise.resolve(); });
  expect(localStorage.getItem(key)).toBe("edit");
  expect(hook.result.current.value).toBe("view");
  expect(hook.result.current.meta.status).toBe("pending");
  releaseSecond();
  await act(async () => { await secondLock!; await second; });
  unsubscribe();
  expect(localStorage.getItem(key)).toBe("view");
  expect(hook.result.current.meta.status).toBe("saved");
});

it("shares an active retry attempt and performs one physical write", async () => {
  const scope = accountScope.capture();
  localStorage.setItem(physical(scope), "comment");
  const hook = renderPrefHook(() => usePrefAutosaveAsync(prefKey, { validate: validShare }));
  const held = holdLifecycle("async-hooks-A");
  const writes = vi.spyOn(Storage.prototype, "setItem");
  let edit!: Promise<unknown>;
  let retryA!: Promise<unknown>;
  let retryB!: Promise<unknown>;
  act(() => {
    edit = hook.result.current.edit("view");
    retryA = hook.result.current.retry();
    retryB = hook.result.current.retry();
  });
  held.release();
  await act(async () => { await held.held; await Promise.all([edit, retryA, retryB]); });
  expect(writes.mock.calls.filter(([key]) => key === physical(scope))).toHaveLength(1);
  expect(localStorage.getItem(physical(scope))).toBe("view");
});

it("adopts a clean storage event but preserves a pending draft as a conflict", async () => {
  const scope = accountScope.capture();
  const key = physical(scope);
  localStorage.setItem(key, "comment");
  const hook = renderPrefHook(() => usePrefAutosaveAsync(prefKey, { validate: validShare }));
  localStorage.setItem(key, "edit");
  act(() => { window.dispatchEvent(new StorageEvent("storage", { key, newValue: "edit", oldValue: "comment", storageArea: localStorage })); });
  await act(async () => { await Promise.resolve(); });
  expect(hook.result.current.value).toBe("edit");

  const held = holdLifecycle("async-hooks-A");
  let pending!: Promise<unknown>;
  act(() => { pending = hook.result.current.edit("view"); });
  localStorage.setItem(key, "comment");
  act(() => { window.dispatchEvent(new StorageEvent("storage", { key, newValue: "comment", oldValue: "edit", storageArea: localStorage })); });
  expect(hook.result.current.value).toBe("view");
  held.release();
  await act(async () => { await held.held; await pending; });
  expect(localStorage.getItem(key)).toBe("comment");
  expect(hook.result.current.value).toBe("view");
  expect(hook.result.current.meta.status).toBe("conflict");

  act(() => { hook.result.current.meta.reload(); });
  expect(hook.result.current.value).toBe("comment");
  const peer = renderPrefHook(() => usePrefAutosaveAsync(prefKey, { validate: validShare }));
  await act(async () => { await peer.result.current.edit("edit"); });
  expect(hook.result.current.value).toBe("edit");
});

it("projects a verified same-tab save into a clean sibling hook", async () => {
  const scope = accountScope.capture();
  localStorage.setItem(physical(scope), "comment");
  const first = renderPrefHook(() => usePrefAutosaveAsync(prefKey, { validate: validShare }));
  const second = renderPrefHook(() => usePrefAutosaveAsync(prefKey, { validate: validShare }));
  await act(async () => { await first.result.current.edit("view"); });
  await act(async () => { await Promise.resolve(); });
  expect(second.result.current.value).toBe("view");
  expect(second.result.current.meta.status).toBe("idle");
});

it("retries an engine-attributed uncertain commit without a second write or false conflict", async () => {
  const scope = accountScope.capture();
  const key = physical(scope);
  localStorage.setItem(key, "comment");
  const hook = renderPrefHook(() => usePrefAutosaveAsync(prefKey, { validate: validShare }));
  const sibling = renderPrefHook(() => usePrefAutosaveAsync(prefKey, { validate: validShare }));
  const nativeGet = Storage.prototype.getItem;
  const nativeSet = Storage.prototype.setItem;
  let committed = false;
  let failedReadback = false;
  const writes = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, target, value) {
    nativeSet.call(this, target, value);
    if (target === key) committed = true;
  });
  const reads = vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, target) {
    if (target === key && committed && !failedReadback) {
      failedReadback = true;
      throw new DOMException("readback", "SecurityError");
    }
    return nativeGet.call(this, target);
  });

  let failedResult!: Awaited<ReturnType<typeof hook.result.current.edit>>;
  await act(async () => { failedResult = await hook.result.current.edit("view"); });
  expect(failedResult).toMatchObject({ ok: false, reason: "readback-uncertain" });
  expect(localStorage.getItem(key)).toBe("view");
  expect(hook.result.current.value).toBe("view");
  expect(hook.result.current.meta.status).toBe("error");
  expect(sibling.result.current.value).toBe("comment");

  reads.mockRestore();
  await act(async () => { await Promise.all([hook.result.current.retry(), hook.result.current.retry()]); });
  expect(writes.mock.calls.filter(([target]) => target === key)).toHaveLength(1);
  expect(hook.result.current.meta.status).toBe("saved");
  expect(sibling.result.current.value).toBe("view");
});
