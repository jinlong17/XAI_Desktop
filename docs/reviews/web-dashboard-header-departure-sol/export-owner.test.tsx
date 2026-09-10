import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import { activate, beginMove, captureDownload, changeNote, flush, guard, mount, move, nativeGet, nativeSet, noteKey, offsetKey, setup } from "./fixture";

beforeEach(setup);
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("current memory export survives complete storage denial and preserves both sources", async () => {
  const ui = mount();
  changeNote(ui, "Latest memory note");
  beginMove(ui.note); move(ui.note, 75);
  const beforeNote = nativeGet.call(localStorage, noteKey);
  const beforeOffset = nativeGet.call(localStorage, offsetKey);
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); });
  const download = captureDownload();
  await act(async () => { guard()?.exportDraft(); });
  expect(await download.read()).toEqual({ version: 1, kind: "dashboard-note-draft", note: "Latest memory note", noteOffset: 75 });
  expect(download.click).toHaveBeenCalledTimes(1);
  expect(download.revoke).toHaveBeenCalledWith("blob:header-sol");
  expect(nativeGet.call(localStorage, noteKey)).toBe(beforeNote);
  expect(nativeGet.call(localStorage, offsetKey)).toBe(beforeOffset);
  expect(guard()?.isBlocking()).toBe(true);
});

it("synchronous owner change during URL setup cancels click and old discard", async () => {
  const ui = mount();
  changeNote(ui, "Secret A");
  const old = guard()!;
  const download = captureDownload(() => { accountScope.lock("header-sol-B"); });
  await act(async () => { old.exportDraft(); });
  expect(download.click).not.toHaveBeenCalled();
  old.discardDraft();
  expect(old.isCurrent()).toBe(false);
});

it("locked device-only export uses empty note and current finite offset", async () => {
  const ui = mount();
  beginMove(ui.note); move(ui.note, 64);
  act(() => { accountScope.lock("locked"); });
  await flush();
  const download = captureDownload();
  await act(async () => { guard()?.exportDraft(); });
  expect(await download.read()).toEqual({ version: 1, kind: "dashboard-note-draft", note: "", noteOffset: 64 });
});

it("A draft stays unload-only in B and never enters fresh B export", async () => {
  const ui = mount();
  changeNote(ui, "Frozen A secret");
  act(() => { activate("header-sol-B"); });
  const bKey = accountScope.physicalKey("xai_pref_dashboard_header_note");
  nativeSet.call(localStorage, bKey, "Current B");
  await flush();
  expect(ui.container.textContent).not.toContain("Frozen A secret");
  beginMove(ui.note); move(ui.note, 44);
  const download = captureDownload();
  await act(async () => { guard()?.exportDraft(); });
  expect((await download.read()).note).not.toBe("Frozen A secret");
});

it("click failure cleans resources and retains recovery state", async () => {
  const ui = mount();
  changeNote(ui, "Keep after click failure");
  const download = captureDownload();
  download.click.mockImplementation(() => { throw new Error("click failed"); });
  await act(async () => { guard()?.exportDraft(); });
  expect(ui.getByText("Export failed. Please retry.")).toBeTruthy();
  expect(download.revoke).toHaveBeenCalledWith("blob:header-sol");
  expect(guard()?.isBlocking()).toBe(true);
});
