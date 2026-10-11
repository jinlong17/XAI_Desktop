/**
 * Gate "Device continuity and export" (contract sections 7, 8 and 13) at the Sol jsdom layer.
 *
 * Real accountScope transitions (A→B→locked→A and a same-account epoch change), a real held device-key
 * lock, attempt-level storage counters under total denial, and Blob/URL/append/click setup faults.
 * Native disk JSON evidence for the section 8 shapes is out of Sol scope (parent/native batches).
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { accountLifecycleLockName } from "@repo/plugin-web-storage";
import { act, fireEvent } from "@testing-library/react";
import {
  accountTouches, activate, attempts, blocking, bytes, bytesAll, cases, choose, color, denyAllStorage, discardAllButton, discardOf, download, envelope,
  expectSingleDownload, exportButton, fault, fired, flush, font, guard, hold, host, keyLock, lockAccount, locks, malformFont, mark, mount, msg, need,
  pin, pre, rejections, restore, retryOf, says, seed, setup, shown, shownAll, spacing, stickyKeys, stickyWrites, stubBlob, teardown, toggle, unload,
  W, warns, writesOn, type Ui,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

/** Fails `entry` writes with a quota error and edits it so a real failed draft exists. */
async function failedColorDraft(ui: Ui, value = "mint") {
  const quota = fault({ op: "set", key: color.key, label: "color quota" });
  choose(ui, color, value);
  await flush();
  fired(quota, "color write");
  expect(shown(ui, color), "H1: the failed color keeps the latest choice").toBe(value);
  return quota;
}

it("§7 A→B→locked→A: a held device operation survives; old guards refuse before and after rerender; fresh guards export", async () => {
  seed(color, "sky");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(color));
  choose(ui, color, "mint");
  await flush();
  expect(bytes(color), "H6: the held per-key lock serializes the write").toBe("sky");
  const oldA = need(guard(), "H7: departure guard registered");
  expect(blocking(), "held device work blocks").toBe(true);
  const harnessB = download();
  activate("sticky-sol-B", "gB");
  expect(oldA.isCurrent(), "the old A guard refuses before rerender (isCurrent)").toBe(false);
  expect(oldA.isBlocking(), "the old A guard refuses before rerender (isBlocking)").toBe(false);
  oldA.exportDraft();
  oldA.discardDraft();
  expect(harnessB.created.length + harnessB.clicks.length, "a stale same-turn guard export is refused").toBe(0);
  await flush();
  const freshB = need(guard(), "a fresh B guard is registered");
  expect(freshB.token, "the epoch change renews the decision token").not.toBe(oldA.token);
  expect(freshB.isCurrent() && freshB.isBlocking(), "fresh B permission guards the surviving device draft").toBe(true);
  expect(shown(ui, color), "the old discard never erased device work").toBe("mint");
  oldA.exportDraft();
  expect(harnessB.clicks.length, "the old guard still refuses after rerender").toBe(0);
  expect(oldA.isCurrent()).toBe(false);
  act(() => { freshB.exportDraft(); });
  await flush(2);
  await expectSingleDownload(harnessB, envelope({ color: "mint" }), "fresh B export after A→B");
  const harnessLocked = download();
  lockAccount();
  expect(freshB.isCurrent(), "the B guard refuses after B→locked").toBe(false);
  freshB.exportDraft();
  expect(harnessLocked.clicks.length, "the stale B export is refused").toBe(0);
  await flush();
  const freshLocked = need(guard(), "a fresh locked guard is registered");
  expect(freshLocked.token).not.toBe(freshB.token);
  expect(blocking(), "fresh locked permission guards the device draft").toBe(true);
  act(() => { freshLocked.exportDraft(); });
  await flush(2);
  await expectSingleDownload(harnessLocked, envelope({ color: "mint" }), "fresh locked export after A→locked");
  activate("sticky-sol-A", "g1");
  await flush();
  const freshA = need(guard(), "a fresh A guard is registered");
  expect(freshA.token, "a return to A never inherits the old decision").not.toBe(oldA.token);
  expect(freshA.token).not.toBe(freshLocked.token);
  expect(blocking(), "a return to A guards the surviving draft").toBe(true);
  expect(locks().heldBy(keyLock(color)), "the device operation stayed behind the real held lock").toBe("test");
  await lock.release();
  const finished = bytes(color) === "mint" && retryOf(ui, color) === null && !blocking();
  const recovering = shown(ui, color) === "mint" && retryOf(ui, color) !== null && blocking();
  expect(finished || recovering, "the held operation finishes or keeps its own recovery after A→B→locked→A").toBe(true);
  expect(accountTouches(), "no account physical key or marker is touched").toEqual([]);
  expect(locks().productNames().filter(name => name !== keyLock(color)), "no account lifecycle or other lock is requested").toEqual([]);
  expect(rejections, "no unhandled rejection").toEqual([]);
});

it("§7 old inline Retry, Discard, Discard all and Export callbacks refuse before rerender; device work survives under fresh permission", async () => {
  seed(color, "sky");
  const ui = mount();
  await flush();
  const quota = await failedColorDraft(ui);
  const retry = need(retryOf(ui, color), "H8: Retry Default Color");
  const discard = need(discardOf(ui, color), "H8: Discard Default Color");
  const discardAll = need(discardAllButton(ui), "H8: Discard all changes");
  const exportControl = need(exportButton(ui), "H8: Export Sticky Note draft");
  const old = need(guard(), "H7: departure guard registered");
  quota.off();
  const harness = download();
  const from = mark();
  activate("sticky-sol-A", "g2");
  pre(host.current === old, "the old inline callbacks are invoked before the epoch rerender");
  exportControl.click();
  discard.click();
  discardAll.click();
  retry.click();
  expect(harness.created.length + harness.clicks.length, "the old inline Export refuses").toBe(0);
  await flush();
  expect(writesOn(from, color), "the old inline Retry refuses").toEqual([]);
  expect(shown(ui, color), "old inline Discard callbacks never erase device work").toBe("mint");
  const fresh = need(guard(), "a fresh guard is registered after the epoch change");
  expect(fresh.token, "the epoch change renews the decision token").not.toBe(old.token);
  expect(blocking(), "fresh permission guards the surviving device draft").toBe(true);
  act(() => { fresh.exportDraft(); });
  await flush(2);
  await expectSingleDownload(harness, envelope({ color: "mint" }), "fresh export after a same-account epoch change");
  fireEvent.click(need(retryOf(ui, color), "the fresh Retry"));
  await flush();
  expect(bytes(color), "the fresh Retry saves the surviving device draft").toBe("mint");
  expect(retryOf(ui, color)).toBeNull();
  expect(blocking()).toBe(false);
});

it("§7 same-account epoch change with a held device lock: old guard refuses; fresh guard exports and discards with zero writes", async () => {
  seed(spacing, "large");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(spacing));
  choose(ui, spacing, "xl");
  await flush();
  expect(bytes(spacing), "H6: the held per-key lock serializes the write").toBe("large");
  const old = need(guard(), "H7: departure guard registered");
  activate("sticky-sol-A", "g2");
  expect(old.isCurrent(), "the old guard refuses before rerender").toBe(false);
  expect(old.isBlocking()).toBe(false);
  await flush();
  const fresh = need(guard(), "a fresh guard is registered after the epoch change");
  expect(fresh.token).not.toBe(old.token);
  expect(blocking(), "fresh permission guards the held device draft").toBe(true);
  const harness = download();
  act(() => { fresh.exportDraft(); });
  await flush(2);
  await expectSingleDownload(harness, envelope({ grid_spacing: "xl" }), "fresh export of a held operation after an epoch change");
  const from = mark();
  act(() => { fresh.discardDraft(); });
  await flush();
  expect(stickyWrites(from), "the fresh discard is zero-write").toEqual([]);
  expect(shown(ui, spacing), "the fresh discard returns to the stored value").toBe("large");
  expect(blocking()).toBe(false);
  await lock.release();
  expect(writesOn(from, spacing), "the discarded held operation never writes").toEqual([]);
  expect(bytes(spacing)).toBe("large");
  expect(shown(ui, spacing), "a late completion never revives discarded state").toBe("large");
});

it("INV §7 edits across A→B→locked→A never touch account keys, markers or lifecycle locks", async () => {
  const ui = mount();
  await flush();
  choose(ui, color, "mint");
  choose(ui, font, "xl");
  toggle(ui, pin);
  toggle(ui, restore);
  choose(ui, spacing, "none");
  await flush();
  activate("sticky-sol-B", "gB");
  await flush();
  choose(ui, color, "coral");
  await flush();
  lockAccount();
  await flush();
  toggle(ui, pin);
  await flush();
  activate("sticky-sol-A", "g1");
  await flush();
  choose(ui, spacing, "xl");
  await flush();
  expect(accountTouches(), "no account physical key or marker is touched").toEqual([]);
  expect(locks().productNames().filter(name => !stickyKeys.map(key => `xai:pref:v1:${key}`).includes(name)), "only Sticky per-key locks may be requested").toEqual([]);
  expect(bytesAll(), "device edits persist across account transitions").toStrictEqual({ color: "coral", font: "xl", pin_default: "true", restore_size: "true", grid_spacing: "xl" });
});

it("INV §7 an unrelated held account lifecycle lock never delays a device edit", async () => {
  seed(color, "sky");
  const ui = mount();
  await flush();
  const account = await hold(accountLifecycleLockName("sticky-sol-A"));
  choose(ui, color, "mint");
  await flush();
  expect(bytes(color), "the device write completes while the account lock is held").toBe("mint");
  expect(says(msg.saving(color)), "no lingering pending state").toBe(false);
  await account.release();
});

it("§8 a sparse one-field export is memory-only under total storage denial", async () => {
  const ui = mount();
  await flush();
  const quota = fault({ op: "set", key: spacing.key, label: "spacing quota" });
  choose(ui, spacing, "xl");
  await flush();
  fired(quota, "spacing write");
  expect(shown(ui, spacing), "H1: the failed spacing keeps the latest choice").toBe("xl");
  const exportControl = need(exportButton(ui), "H8: Export Sticky Note draft");
  const harness = download();
  const denial = denyAllStorage();
  const from = mark();
  fireEvent.click(exportControl);
  await flush(2);
  expect(attempts(from), "export makes zero getItem, setItem or removeItem attempts").toEqual([]);
  await expectSingleDownload(harness, envelope({ grid_spacing: "xl" }), "sparse one-field export");
  const warning = unload();
  expect(warning.warned, "beforeunload still warns after the export").toBe(true);
  expect(warning.attempts, "the warning makes zero storage attempts").toBe(0);
  expect(blocking(), "the guard still blocks after the export").toBe(true);
  need(retryOf(ui, spacing), "the draft is kept after the export");
  denial.off();
});

it("§8 the all-five export (three strings, two booleans) equals the contract envelope under total storage denial", async () => {
  const ui = mount();
  await flush();
  const quotas = cases.map(entry => fault({ op: "set", key: entry.key, label: `${entry.field} quota` }));
  choose(ui, color, "mint");
  choose(ui, font, "xl");
  toggle(ui, pin);
  toggle(ui, restore);
  choose(ui, spacing, "xl");
  await flush();
  cases.forEach((entry, index) => fired(quotas[index]!, `${entry.field} write`));
  expect(shownAll(ui), "H1: all five latest choices stay displayed").toStrictEqual({ color: "mint", font: "xl", pin_default: false, restore_size: true, grid_spacing: "xl" });
  const exportControl = need(exportButton(ui), "H8: Export Sticky Note draft");
  const harness = download();
  const denial = denyAllStorage();
  const from = mark();
  fireEvent.click(exportControl);
  await flush(2);
  expect(attempts(from), "export makes zero getItem, setItem or removeItem attempts").toEqual([]);
  await expectSingleDownload(harness, { version: 1, kind: "sticky-draft", values: { device: { color: "mint", font: "xl", pin_default: false, restore_size: true, grid_spacing: "xl" } } }, "all-five export");
  const warning = unload();
  expect(warning.warned).toBe(true);
  expect(warning.attempts).toBe(0);
  expect(blocking()).toBe(true);
  denial.off();
});

it("§8 a dialog export through the registered guard is memory-only and changes nothing", async () => {
  seed(color, "sky");
  seed(restore, "true");
  const ui = mount();
  await flush();
  await failedColorDraft(ui);
  const restoreQuota = fault({ op: "set", key: restore.key, label: "restore quota" });
  toggle(ui, restore);
  await flush();
  fired(restoreQuota, "restore write");
  const current = need(guard(), "H7: departure guard registered");
  const harness = download();
  const denial = denyAllStorage();
  const from = mark();
  act(() => { current.exportDraft(); });
  await flush(2);
  expect(attempts(from), "the dialog export makes zero getItem, setItem or removeItem attempts").toEqual([]);
  await expectSingleDownload(harness, envelope({ color: "mint", restore_size: false }), "dialog export");
  const warning = unload();
  expect(warning.warned).toBe(true);
  expect(warning.attempts).toBe(0);
  expect(blocking(), "the dialog export never discards or releases").toBe(true);
  expect(bytesAll(), "the dialog export never saves").toStrictEqual({ color: "sky", font: null, pin_default: null, restore_size: "true", grid_spacing: null });
  denial.off();
});

it("§8 an export while one operation is held behind a real lock includes it and releases, saves or retries nothing", async () => {
  seed(color, "sky");
  seed(font, "small");
  const ui = mount();
  await flush();
  const quota = fault({ op: "set", key: font.key, label: "font quota" });
  choose(ui, font, "xl");
  await flush();
  fired(quota, "font write");
  expect(shown(ui, font), "H1: the failed font keeps the latest choice").toBe("xl");
  const lock = await hold(keyLock(color));
  choose(ui, color, "mint");
  await flush();
  expect(bytes(color), "H6: the held per-key lock serializes the color write").toBe("sky");
  const exportControl = need(exportButton(ui), "H8: Export Sticky Note draft");
  const harness = download();
  const denial = denyAllStorage();
  const from = mark();
  fireEvent.click(exportControl);
  await flush(2);
  expect(attempts(from), "export makes zero getItem, setItem or removeItem attempts").toEqual([]);
  await expectSingleDownload(harness, envelope({ color: "mint", font: "xl" }), "export with a held operation");
  expect(locks().heldBy(keyLock(color)), "the export never releases the held lock").toBe("test");
  const warning = unload();
  expect(warning.warned).toBe(true);
  expect(warning.attempts).toBe(0);
  expect(blocking()).toBe(true);
  denial.off();
  quota.off();
  await lock.release();
  expect(bytes(color), "the held operation completes after release").toBe("mint");
  expect(bytes(font), "the export never retried the failed font").toBe("small");
  need(retryOf(ui, font), "the failed font keeps its Retry");
});

it("§8 the export excludes saved, default, source-only and input-error-only fields", async () => {
  seed(color, "sky");
  seed(pin, "TRUE");
  const ui = mount();
  await flush();
  toggle(ui, restore);
  await flush();
  expect(bytes(restore), "the restore edit saved").toBe("true");
  malformFont(ui, "injected");
  await flush();
  await failedColorDraft(ui);
  const exportControl = need(exportButton(ui), "H8: Export Sticky Note draft");
  const harness = download();
  const denial = denyAllStorage();
  const from = mark();
  fireEvent.click(exportControl);
  await flush(2);
  expect(attempts(from), "export makes zero getItem, setItem or removeItem attempts").toEqual([]);
  await expectSingleDownload(harness, envelope({ color: "mint" }), "sparse export beside saved, default, source-only and input-error siblings");
  denial.off();
});

it("INV §8 without an actual draft there is no Export control and no empty download", async () => {
  seed(pin, "TRUE");
  const ui = mount();
  await flush();
  malformFont(ui, "injected");
  await flush();
  choose(ui, spacing, "xl");
  await flush();
  expect(exportButton(ui), "no Export control without actual drafts").toBeNull();
  const harness = download();
  act(() => { guard()?.exportDraft(); });
  await flush(2);
  expect(harness.created.length + harness.clicks.length, "no empty download").toBe(0);
});

it.each(["blob", "url", "append", "click"] as const)("§8 a %s setup failure shows the localized export error, keeps drafts and guard, and cleans up", async stage => {
  seed(color, "sky");
  const ui = mount();
  await flush();
  await failedColorDraft(ui);
  const exportControl = need(exportButton(ui), "H8: Export Sticky Note draft");
  const harness = download();
  let thrown = 0;
  const failOnce = (what: string) => () => { thrown += 1; throw new Error(`${what} setup`); };
  if (stage === "blob") { stubBlob(harness); harness.hooks.blob = phase => { if (phase === "before") failOnce("blob")(); }; }
  if (stage === "url") harness.hooks.create = failOnce("url");
  if (stage === "append") harness.hooks.beforeAppend = failOnce("append");
  if (stage === "click") harness.hooks.click = failOnce("click");
  fireEvent.click(exportControl);
  await flush(2);
  pre(thrown === 1, `${stage} setup fault armed and observed`);
  expect(says(W.en.exportFailed), `"${W.en.exportFailed}" after a ${stage} failure`).toBe(true);
  expect(harness.anchorsInDocument().length, "the anchor is removed").toBe(0);
  expect(harness.revoked, "every created object URL is revoked").toEqual(harness.created);
  need(retryOf(ui, color), "the draft is kept after a failed export");
  expect(blocking(), "the guard is kept after a failed export").toBe(true);
  expect(warns(), "beforeunload still warns after a failed export").toBe(true);
  harness.hooks = {};
  vi.unstubAllGlobals();
  const retried = download();
  fireEvent.click(need(exportButton(ui), "Export Sticky Note draft after a failed export"));
  await flush(2);
  await expectSingleDownload(retried, envelope({ color: "mint" }), `export retry after a ${stage} failure`);
});

it.each(["blob", "url", "append"] as const)("§8 an epoch change during %s cancels the click and cleans up; fresh permission exports", async stage => {
  seed(color, "sky");
  const ui = mount();
  await flush();
  await failedColorDraft(ui);
  const old = need(guard(), "H7: departure guard registered");
  const harness = download();
  let invalidated = 0;
  const invalidate = () => { invalidated += 1; activate("sticky-sol-B", "gB"); };
  if (stage === "blob") { stubBlob(harness); harness.hooks.blob = phase => { if (phase === "after") invalidate(); }; }
  if (stage === "url") harness.hooks.create = invalidate;
  if (stage === "append") harness.hooks.afterAppend = invalidate;
  act(() => { old.exportDraft(); });
  await flush(2);
  pre(invalidated === 1, `${stage}-time epoch change armed and observed`);
  expect(harness.clicks.length, "the obsolete export never clicks").toBe(0);
  expect(harness.revoked, "every created object URL is revoked").toEqual(harness.created);
  expect(harness.anchorsInDocument().length, "the anchor is removed").toBe(0);
  expect(old.isCurrent(), "the old guard is no longer current").toBe(false);
  harness.hooks = {};
  vi.unstubAllGlobals();
  const fresh = need(guard(), "a fresh B guard is registered");
  expect(fresh.token).not.toBe(old.token);
  const retried = download();
  act(() => { fresh.exportDraft(); });
  await flush(2);
  await expectSingleDownload(retried, envelope({ color: "mint" }), `fresh B export after a ${stage}-time epoch change`);
});

it.each(["blob", "url", "append"] as const)("§8 an unmount during %s cancels the click and cleans up", async stage => {
  seed(color, "sky");
  const ui = mount();
  await flush();
  await failedColorDraft(ui);
  const old = need(guard(), "H7: departure guard registered");
  const harness = download();
  let unmounted = 0;
  const unmount = () => { unmounted += 1; ui.unmount(); };
  if (stage === "blob") { stubBlob(harness); harness.hooks.blob = phase => { if (phase === "after") unmount(); }; }
  if (stage === "url") harness.hooks.create = unmount;
  if (stage === "append") harness.hooks.afterAppend = unmount;
  act(() => { old.exportDraft(); });
  await flush(2);
  pre(unmounted === 1, `${stage}-time unmount armed and observed`);
  expect(harness.clicks.length, "the export never clicks after unmount").toBe(0);
  expect(harness.revoked, "every created object URL is revoked").toEqual(harness.created);
  expect(harness.anchorsInDocument().length, "the anchor is removed").toBe(0);
  expect(old.isCurrent(), "the unmounted guard is no longer current").toBe(false);
});

it("§7/§9 unmount removes the guard and the beforeunload listener and detaches old callbacks", async () => {
  seed(color, "sky");
  seed(spacing, "large");
  const ui = mount();
  await flush();
  choose(ui, spacing, "xl");
  await flush();
  expect(bytes(spacing), "a committed write before unmount").toBe("xl");
  await failedColorDraft(ui);
  const old = need(guard(), "H7: departure guard registered");
  expect(warns(), "H7: beforeunload warns before unmount").toBe(true);
  const retry = need(retryOf(ui, color), "H8: Retry Default Color");
  ui.unmount();
  expect(host.current, "the registration cleanup ran on unmount").toBeNull();
  expect(host.unregistered.some(item => item.token === old.token), "the current token was unregistered").toBe(true);
  const harness = download();
  const from = mark();
  expect(unload().warned, "the beforeunload listener was removed").toBe(false);
  expect(old.isCurrent()).toBe(false);
  expect(old.isBlocking()).toBe(false);
  old.exportDraft();
  old.discardDraft();
  retry.click();
  await flush();
  expect(attempts(from), "detached callbacks make zero storage attempts").toEqual([]);
  expect(harness.created.length + harness.clicks.length, "a detached export never downloads").toBe(0);
  expect(bytes(spacing), "unmount never undoes committed writes").toBe("xl");
});
