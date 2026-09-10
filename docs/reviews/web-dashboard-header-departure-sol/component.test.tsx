import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import { beginMove, changeNote, finishMove, flush, guard, mount, move, nativeGet, nativeSet, noteKey, offsetKey, setup, unload } from "./fixture";

beforeEach(setup);
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("clean, no-move and source-only states do not fabricate current host draft truth", async () => {
  const ui = mount();
  expect(guard()?.isBlocking()).toBe(false);
  beginMove(ui.note); finishMove(ui.note, 0); await flush();
  expect(guard()?.isBlocking()).toBe(false);
  expect(unload()).toBe(false);
  ui.unmount();
  nativeSet.call(localStorage, offsetKey, "null");
  const source = mount(); await flush();
  expect(source.getByRole("button", { name: "Reload note position" })).toBeTruthy();
  expect(guard()?.isBlocking()).toBe(false);
  expect(unload()).toBe(false);
});

it("unsubmitted note and moved unfinished gesture are independent current drafts", async () => {
  const ui = mount();
  changeNote(ui, "Unsubmitted latest");
  expect(guard()?.isBlocking()).toBe(true);
  expect(nativeGet.call(localStorage, noteKey)).toBe("Original A");
  fireEvent.keyDown(ui.input(), { key: "Escape" });
  beginMove(ui.note); move(ui.note, 70);
  expect(guard()?.isBlocking()).toBe(true);
  expect(nativeGet.call(localStorage, offsetKey)).toBe("0");
  expect(unload()).toBe(true);
});

it("one sibling success cannot release the other failed field", async () => {
  const ui = mount();
  const baseSet = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === offsetKey) throw new Error("offset quota");
    baseSet.call(this, key, value);
  });
  changeNote(ui, "Saved note"); ui.save();
  await flush(20);
  beginMove(ui.note); move(ui.note, 80); finishMove(ui.note, 80);
  await flush(20);
  expect(nativeGet.call(localStorage, noteKey)).toBe("Saved note");
  expect(nativeGet.call(localStorage, offsetKey)).toBe("0");
  expect(guard()?.isBlocking()).toBe(true);
});

it("discard detaches current work and late completion cannot resurrect it", async () => {
  const ui = mount();
  changeNote(ui, "Discard me");
  beginMove(ui.note); move(ui.note, 55);
  const stale = guard();
  await act(async () => { stale?.discardDraft(); });
  expect(guard()?.isBlocking()).toBe(false);
  expect(nativeGet.call(localStorage, noteKey)).toBe("Original A");
  expect(nativeGet.call(localStorage, offsetKey)).toBe("0");
  await flush(20);
  expect(guard()?.isBlocking()).toBe(false);
});

it("owner change revokes old capability but fresh device recovery remains permitted", async () => {
  const ui = mount();
  beginMove(ui.note); move(ui.note, 60);
  const old = guard()!;
  act(() => { accountScope.lock("header-sol-B"); });
  expect(old.isCurrent()).toBe(false);
  expect(old.isBlocking()).toBe(false);
  old.discardDraft();
  expect(guard()?.isCurrent()).toBe(true);
  expect(guard()?.isBlocking()).toBe(true);
});
