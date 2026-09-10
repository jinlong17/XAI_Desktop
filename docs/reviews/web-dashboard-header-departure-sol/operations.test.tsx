import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent } from "@testing-library/react";
import { accountLifecycleLockName } from "../../../packages/plugin-web-storage/src/internal/accountCoordination";
import { prefMutationLockName } from "../../../packages/plugin-web-storage/src/internal/prefMutation";
import { beginMove, changeNote, finishMove, flush, guard, mount, move, nativeGet, nativeSet, noteKey, offsetKey, setup } from "./fixture";

beforeEach(setup);
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

async function hold(name: string) {
  let release!: () => void;
  let entered!: () => void;
  const ready = new Promise<void>(resolve => { entered = resolve; });
  const gate = new Promise<void>(resolve => { release = resolve; });
  const held = navigator.locks.request(name, { mode: "exclusive" }, () => { entered(); return gate; });
  await ready;
  return async () => { await act(async () => { release(); await held; }); };
}

function externalOffset(raw: string) {
  const oldValue = nativeGet.call(localStorage, offsetKey);
  nativeSet.call(localStorage, offsetKey, raw);
  window.dispatchEvent(new StorageEvent("storage", { key: offsetKey, oldValue, newValue: raw, storageArea: localStorage }));
}

function enterNote(ui: ReturnType<typeof mount>, value: string) {
  if (!ui.queryByRole("textbox")) ui.edit();
  if (!ui.queryByRole("textbox")) ui.edit();
  fireEvent.change(ui.input(), { target: { value } });
}

it("pending Retry cannot attribute predecessor success to a newer queued failure", async () => {
  const ui = mount();
  await flush();
  const release = await hold(accountLifecycleLockName("header-sol-A"));
  let writes = 0;
  const baseSet = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === noteKey && ++writes === 2) throw new Error("latest quota");
    baseSet.call(this, key, value);
  });
  changeNote(ui, "First pending"); ui.save();
  fireEvent.change(ui.input(), { target: { value: "Latest queued" } }); ui.save();
  fireEvent.click(ui.getByRole("button", { name: "Retry note save" }));
  await release(); await flush(20);
  expect(nativeGet.call(localStorage, noteKey)).toBe("First pending");
  expect(ui.input().value).toBe("Latest queued");
  expect(guard()?.isBlocking()).toBe(true);
});

it("equal-value predecessor success cannot clear a newer equal-value failed intent", async () => {
  const ui = mount();
  await flush();
  const release = await hold(accountLifecycleLockName("header-sol-A"));
  let sameWrites = 0;
  const baseSet = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === noteKey && value === "Same value" && ++sameWrites === 2) throw new Error("new same-value quota");
    baseSet.call(this, key, value);
  });
  enterNote(ui, "Same value"); ui.save();
  enterNote(ui, "Different revision"); ui.save();
  enterNote(ui, "Same value"); ui.save();
  await release(); await flush(24);
  expect(nativeGet.call(localStorage, noteKey)).toBe("Same value");
  expect(ui.input().value).toBe("Same value");
  expect(guard()?.isBlocking()).toBe(true);
});

it("note failure with position success and the reverse each keep only the failed sibling guarded", async () => {
  const ui = mount();
  await flush();
  const baseSet = Storage.prototype.setItem;
  let failNote = true;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (failNote && key === noteKey) throw new Error("note quota");
    baseSet.call(this, key, value);
  });
  beginMove(ui.note); move(ui.note, 45); finishMove(ui.note, 45);
  await flush(20);
  enterNote(ui, "Failed note"); ui.save();
  await flush(20);
  expect(nativeGet.call(localStorage, offsetKey)).toBe("45");
  expect(nativeGet.call(localStorage, noteKey)).toBe("Original A");
  expect(guard()?.isBlocking()).toBe(true);
  failNote = false;
  fireEvent.click(ui.getByRole("button", { name: "Retry note save" })); await flush(20);
  expect(nativeGet.call(localStorage, noteKey)).toBe("Failed note");
  expect(guard()?.isBlocking()).toBe(false);

  vi.restoreAllMocks();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === offsetKey) throw new Error("offset quota");
    baseSet.call(this, key, value);
  });
  enterNote(ui, "Second saved note"); ui.save();
  beginMove(ui.note, 8); move(ui.note, 70, 8); finishMove(ui.note, 70, 8);
  await flush(20);
  expect(nativeGet.call(localStorage, noteKey)).toBe("Second saved note");
  expect(nativeGet.call(localStorage, offsetKey)).toBe("45");
  expect(guard()?.isBlocking()).toBe(true);
});

it("unchanged uncertainty retry verifies once; changed external bytes retain recovery", async () => {
  const ui = mount();
  await flush();
  let armed = false;
  let writes = 0;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    nativeSet.call(this, key, value);
    if (key === offsetKey) { armed = true; writes += 1; }
  });
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) {
    if (key === offsetKey && armed) { armed = false; throw new Error("readback unavailable"); }
    return nativeGet.call(this, key);
  });
  beginMove(ui.note); move(ui.note, 40); finishMove(ui.note, 40); await flush(20);
  expect(guard()?.isBlocking()).toBe(true);
  fireEvent.click(ui.getByRole("button", { name: "Retry note save" })); await flush(20);
  expect(writes).toBe(1);
  expect(guard()?.isBlocking()).toBe(false);

  beginMove(ui.note, 9); move(ui.note, 20, 9); finishMove(ui.note, 20, 9); await flush(20);
  act(() => externalOffset("95"));
  fireEvent.click(ui.getByRole("button", { name: "Retry note save" })); await flush(20);
  expect(nativeGet.call(localStorage, offsetKey)).toBe("95");
  expect(guard()?.isBlocking()).toBe(true);
});

it("discard during held position persistence prevents its late callback from restoring recovery", async () => {
  const ui = mount();
  await flush();
  const release = await hold(prefMutationLockName(offsetKey));
  beginMove(ui.note); move(ui.note, 66); finishMove(ui.note, 66);
  expect(guard()?.isBlocking()).toBe(true);
  await act(async () => { guard()?.discardDraft(); });
  expect(guard()?.isBlocking()).toBe(false);
  await release(); await flush(20);
  expect(nativeGet.call(localStorage, offsetKey)).toBe("0");
  expect(guard()?.isBlocking()).toBe(false);
});
