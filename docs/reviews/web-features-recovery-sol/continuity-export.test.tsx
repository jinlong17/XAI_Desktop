/**
 * Mode `continuity-export` (contract section 12): section 7 (device continuity and host permission) and
 * section 8 (sparse memory export) apart from the native disk shapes, at the Sol jsdom layer.
 *
 * Real accountScope transitions (A→B→locked→A and a same-account epoch change), real held device-key locks,
 * attempt-level storage counters under total denial, and Blob/URL/append/click setup faults. Native disk
 * JSON for the nine section 8 shapes belongs to the parent/native batches (E11); this file asserts the same
 * envelopes in memory, including shape 5 (all 8 pending resets).
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import { accountLifecycleLockName } from "@repo/plugin-web-storage";
import {
  accountTouches, activate, attempts, blocking, board, bytes, bytesAll, calendar, clickReset, confirmer, dashboard, denyAllStorage,
  discardAllButton, discardOf, download, envelope, expectSingleDownload, exportButton, fault, featureWrites, FIELDS, fired, flush, guard,
  habits, hold, host, IDS, keyLock, KEYS, lockAccount, locks, mark, matrix, meditation, mount, msg, need, OWNER_A, OWNER_B, pomodoro, pre,
  rejections, RESET, resetButton, retryOf, says, seed, SET, setup, shown, shownAll, stubBlob, tasks, teardown, toggle, unload, W, warns,
  writesOn, type Change, type Field, type FieldId, type Holder, type Ui,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

const allOf = (value: boolean | null | string) => Object.fromEntries(IDS.map(id => [id, value])) as Record<FieldId, boolean | null | string>;
const changes = (entries: Partial<Record<FieldId, Change>>) => envelope(entries);

/** Fails `field` writes with a quota error and toggles it so a real failed set draft exists. */
async function failedSetDraft(ui: Ui, field: Field) {
  const quota = fault({ op: "set", key: field.key, label: `${field.id} quota` });
  const before = shown(ui, field);
  toggle(ui, field);
  await flush();
  fired(quota, `${field.id} write`);
  expect(shown(ui, field), `H1: the failed ${field.id} keeps the latest choice`).toBe(!before);
  return quota;
}

/** Refuses `field`'s removal and runs an accepted Reset to defaults so a real reset draft exists. */
async function failedResetDraft(ui: Ui, field: Field) {
  const refusal = fault({ op: "remove", key: field.key, label: `${field.id} remove refused` });
  clickReset(ui, true);
  await flush(24);
  fired(refusal, `${field.id} remove`);
  expect(says(msg.notReset(field)), `H5: "${msg.notReset(field)}" failure feedback`).toBe(true);
  return refusal;
}

// ---------------------------------------------------------------------------
// Section 7: device continuity and host permission
// ---------------------------------------------------------------------------

it("§7 A→B→locked→A: a held device operation survives; old guards refuse before and after rerender; fresh B and locked guards guard and export (shapes 7, 8)", async () => {
  seed(board, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(board));
  toggle(ui, board);
  await flush();
  expect(bytes(board), "H3: the held per-key lock serializes the write").toBe("false");
  const oldA = need(guard(), "§9: departure guard registered");
  expect(blocking(), "held device work blocks").toBe(true);
  const harnessB = download();
  activate(OWNER_B, "gB");
  expect(oldA.isCurrent(), "the old A guard refuses before rerender (isCurrent)").toBe(false);
  expect(oldA.isBlocking(), "the old A guard refuses before rerender (isBlocking)").toBe(false);
  oldA.exportDraft();
  oldA.discardDraft();
  expect(harnessB.created.length + harnessB.clicks.length, "a stale same-turn guard export is refused").toBe(0);
  await flush();
  const freshB = need(guard(), "a fresh B guard is registered");
  expect(freshB.token, "the epoch change renews the decision token").not.toBe(oldA.token);
  expect(freshB.isCurrent() && freshB.isBlocking(), "fresh B permission guards the surviving device draft").toBe(true);
  expect(shown(ui, board), "the old discard never erased device work").toBe(true);
  oldA.exportDraft();
  expect(harnessB.clicks.length, "the old guard still refuses after rerender").toBe(0);
  expect(oldA.isCurrent()).toBe(false);
  const denialB = denyAllStorage();
  const fromB = mark();
  act(() => { freshB.exportDraft(); });
  await flush(2);
  expect(attempts(fromB), "the fresh B export makes zero storage attempts").toEqual([]);
  denialB.off();
  await expectSingleDownload(harnessB, changes({ board: SET(true) }), "shape 8: fresh B export after A→B");
  const harnessLocked = download();
  lockAccount();
  expect(freshB.isCurrent(), "the B guard refuses after B→locked").toBe(false);
  freshB.exportDraft();
  expect(harnessLocked.clicks.length, "the stale B export is refused").toBe(0);
  await flush();
  const freshLocked = need(guard(), "a fresh locked guard is registered");
  expect(freshLocked.token).not.toBe(freshB.token);
  expect(blocking(), "fresh locked permission guards the device draft").toBe(true);
  const denialLocked = denyAllStorage();
  const fromLocked = mark();
  act(() => { freshLocked.exportDraft(); });
  await flush(2);
  expect(attempts(fromLocked), "the fresh locked export makes zero storage attempts").toEqual([]);
  denialLocked.off();
  await expectSingleDownload(harnessLocked, changes({ board: SET(true) }), "shape 7: fresh locked export after A→locked");
  activate(OWNER_A, "g1");
  await flush();
  const freshA = need(guard(), "a fresh A guard is registered");
  expect(freshA.token, "a return to A never inherits the old decision").not.toBe(oldA.token);
  expect(freshA.token).not.toBe(freshLocked.token);
  expect(blocking(), "a return to A guards the surviving draft").toBe(true);
  expect(locks().heldBy(keyLock(board)), "the device operation stayed behind the real held lock").toBe("test");
  await lock.release();
  const finished = bytes(board) === "true" && retryOf(ui, board) === null && !blocking();
  const recovering = shown(ui, board) === true && retryOf(ui, board) !== null && blocking();
  expect(finished || recovering, "the held operation finishes or keeps its own recovery after A→B→locked→A").toBe(true);
  expect(accountTouches(), "no account physical key or marker is touched").toEqual([]);
  expect(locks().productNames().filter(name => name !== keyLock(board)), "no account lifecycle or other lock is requested").toEqual([]);
  expect(rejections, "no unhandled rejection").toEqual([]);
});

it("§7 old inline Retry, Discard, Discard all, Export and Reset callbacks refuse before rerender; device work survives under fresh permission", async () => {
  seed(matrix, "false");
  const ui = mount();
  await flush();
  const quota = await failedSetDraft(ui, tasks);
  const retry = need(retryOf(ui, tasks), "H9: Retry Tasks");
  const discard = need(discardOf(ui, tasks), "H9: Discard Tasks");
  const discardAll = need(discardAllButton(ui), "H9: Discard all changes");
  const exportControl = need(exportButton(ui), "H9: Export Features draft");
  const resetControl = resetButton(ui);
  const old = need(guard(), "§9: departure guard registered");
  quota.off();
  const harness = download();
  const from = mark();
  confirmer.answer = true;
  activate(OWNER_A, "g2");
  pre(host.current === old, "the old inline callbacks are invoked before the epoch rerender");
  exportControl.click();
  discard.click();
  discardAll.click();
  retry.click();
  resetControl.click();
  expect(harness.created.length + harness.clicks.length, "the old inline Export refuses").toBe(0);
  await flush();
  expect(featureWrites(from), "the old inline Retry and Reset callbacks refuse: zero set/remove attempts").toEqual([]);
  expect(bytes(matrix), "the old inline Reset never removes device bytes").toBe("false");
  expect(shown(ui, tasks), "old inline Discard callbacks never erase device work").toBe(false);
  const fresh = need(guard(), "a fresh guard is registered after the epoch change");
  expect(fresh.token, "the epoch change renews the decision token").not.toBe(old.token);
  expect(blocking(), "fresh permission guards the surviving device draft").toBe(true);
  act(() => { fresh.exportDraft(); });
  await flush(2);
  await expectSingleDownload(harness, changes({ tasks: SET(false) }), "fresh export after a same-account epoch change");
  fireEvent.click(need(retryOf(ui, tasks), "the fresh Retry"));
  await flush();
  expect(bytes(tasks), "the fresh Retry saves the surviving device draft").toBe("false");
  expect(retryOf(ui, tasks)).toBeNull();
  expect(blocking()).toBe(false);
});

it("§7 same-account epoch change with a held device lock: old guard refuses; fresh guard exports and discards with zero writes", async () => {
  seed(dashboard, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(dashboard));
  toggle(ui, dashboard);
  await flush();
  expect(bytes(dashboard), "H3: the held per-key lock serializes the write").toBe("false");
  const old = need(guard(), "§9: departure guard registered");
  activate(OWNER_A, "g2");
  expect(old.isCurrent(), "the old guard refuses before rerender").toBe(false);
  expect(old.isBlocking()).toBe(false);
  await flush();
  const fresh = need(guard(), "a fresh guard is registered after the epoch change");
  expect(fresh.token).not.toBe(old.token);
  expect(blocking(), "fresh permission guards the held device draft").toBe(true);
  const harness = download();
  act(() => { fresh.exportDraft(); });
  await flush(2);
  await expectSingleDownload(harness, changes({ dashboard: SET(true) }), "fresh export of a held operation after an epoch change");
  const from = mark();
  act(() => { fresh.discardDraft(); });
  await flush();
  expect(featureWrites(from), "the fresh discard is zero-write").toEqual([]);
  expect(shown(ui, dashboard), "the fresh discard returns to the stored value").toBe(false);
  expect(blocking()).toBe(false);
  await lock.release();
  expect(writesOn(from, dashboard), "the discarded held operation never writes").toEqual([]);
  expect(bytes(dashboard)).toBe("false");
  expect(shown(ui, dashboard), "a late completion never revives discarded state").toBe(false);
});

it("§7 an admitted reset batch survives A→B: the old guard refuses; a fresh B guard exports the pending reset; the held removal finishes or keeps its recovery", async () => {
  seed(board, "false");
  seed(calendar, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(calendar));
  clickReset(ui, true);
  await flush();
  expect(bytes(calendar), "H3: the held per-key lock keeps the admitted Calendar removal pending").toBe("false");
  expect(bytes(board), "the unheld Boards removal completed").toBeNull();
  const oldA = need(guard(), "§9: departure guard registered");
  expect(blocking(), "the pending reset is guarded").toBe(true);
  const harness = download();
  activate(OWNER_B, "gB");
  expect(oldA.isCurrent(), "the old A guard refuses before rerender").toBe(false);
  oldA.exportDraft();
  oldA.discardDraft();
  expect(harness.created.length + harness.clicks.length, "the stale guard export is refused").toBe(0);
  await flush();
  const freshB = need(guard(), "a fresh B guard is registered");
  expect(freshB.token).not.toBe(oldA.token);
  expect(blocking(), "fresh B permission guards the pending reset").toBe(true);
  act(() => { freshB.exportDraft(); });
  await flush(2);
  await expectSingleDownload(harness, changes({ calendar: RESET }), "fresh B export of a pending reset");
  expect(locks().heldBy(keyLock(calendar)), "the admitted removal stayed behind the real held lock").toBe("test");
  await lock.release();
  const finished = bytes(calendar) === null && retryOf(ui, calendar) === null && !blocking();
  const recovering = shown(ui, calendar) === true && retryOf(ui, calendar) !== null && blocking();
  expect(finished || recovering, "the admitted device reset finishes or keeps its own recovery after A→B").toBe(true);
  expect(accountTouches(), "no account physical key or marker is touched").toEqual([]);
});

it("INV §7 edits and a reset across A→B→locked→A never touch account keys, markers or lifecycle locks", async () => {
  const ui = mount();
  await flush();
  toggle(ui, tasks);
  toggle(ui, board);
  await flush();
  activate(OWNER_B, "gB");
  await flush();
  toggle(ui, dashboard);
  await flush();
  lockAccount();
  await flush();
  toggle(ui, calendar);
  await flush();
  activate(OWNER_A, "g1");
  await flush();
  clickReset(ui, true);
  await flush(24);
  toggle(ui, matrix);
  await flush();
  expect(accountTouches(), "no account physical key or marker is touched").toEqual([]);
  expect(locks().productNames().filter(name => !KEYS.map(key => `xai:pref:v1:${key}`).includes(name)), "only Features per-key locks may be requested").toEqual([]);
  expect(bytesAll(), "device edits and the reset persist across account transitions").toStrictEqual({ ...allOf(null), matrix: "false" });
});

it("INV §7 an unrelated held account lifecycle lock never delays a device edit or a reset", async () => {
  seed(board, "false");
  const ui = mount();
  await flush();
  const account = await hold(accountLifecycleLockName(OWNER_A));
  toggle(ui, tasks);
  await flush();
  expect(bytes(tasks), "the device write completes while the account lock is held").toBe("false");
  expect(says(msg.saving(tasks)), "no lingering pending state").toBe(false);
  clickReset(ui, true);
  await flush(24);
  expect(bytesAll(), "the device reset completes while the account lock is held").toStrictEqual(allOf(null));
  await account.release();
});

// ---------------------------------------------------------------------------
// Section 8: sparse memory export (shapes 1–6 and 9 in memory; 7 and 8 above)
// ---------------------------------------------------------------------------

async function exportUnderDenial(ui: Ui, tag: string, expected: unknown): Promise<void> {
  const exportControl = need(exportButton(ui), `H9: Export Features draft (${tag})`);
  const harness = download();
  const denial = denyAllStorage();
  const from = mark();
  fireEvent.click(exportControl);
  await flush(2);
  expect(attempts(from), `${tag}: export makes zero getItem, setItem or removeItem attempts`).toEqual([]);
  await expectSingleDownload(harness, expected, tag);
  const warning = unload();
  expect(warning.warned, `${tag}: beforeunload still warns after the export`).toBe(true);
  expect(warning.attempts, `${tag}: the warning makes zero storage attempts`).toBe(0);
  expect(blocking(), `${tag}: the guard still blocks after the export`).toBe(true);
  denial.off();
}

it("§8 shape 1: a sparse one-field set export is memory-only under total storage denial", async () => {
  const ui = mount();
  await flush();
  await failedSetDraft(ui, habits);
  await exportUnderDenial(ui, "shape 1 sparse set", changes({ habits: SET(false) }));
  need(retryOf(ui, habits), "the draft is kept after the export");
});

it("§8 shape 2: a sparse reset left over from a partial reset is exported as a reset entry, never a saved default", async () => {
  for (const field of FIELDS) seed(field, "false");
  const ui = mount();
  await flush();
  await failedResetDraft(ui, matrix);
  await exportUnderDenial(ui, "shape 2 sparse reset", changes({ matrix: RESET }));
  need(retryOf(ui, matrix), "the reset draft is kept after the export");
});

it("§8 shape 3: mixed set and reset entries", async () => {
  seed(board, "false");
  const ui = mount();
  await flush();
  await failedResetDraft(ui, board);
  await failedSetDraft(ui, tasks);
  await exportUnderDenial(ui, "shape 3 mixed", changes({ board: RESET, tasks: SET(false) }));
});

it("§8 shape 4: all 8 sets", async () => {
  const ui = mount();
  await flush();
  const quotas = FIELDS.map(field => fault({ op: "set", key: field.key, label: `${field.id} quota` }));
  for (const field of FIELDS) toggle(ui, field);
  await flush();
  FIELDS.forEach((field, index) => fired(quotas[index]!, `${field.id} write`));
  expect(shownAll(ui), "H1: all 8 latest choices stay displayed").toStrictEqual(allOf(false));
  await exportUnderDenial(ui, "shape 4 all 8 sets", changes(Object.fromEntries(IDS.map(id => [id, SET(false)])) as Partial<Record<FieldId, Change>>));
});

it("§8 shape 5: all 8 pending resets behind held locks", async () => {
  for (const field of FIELDS) seed(field, "false");
  const ui = mount();
  await flush();
  const holders: Holder[] = [];
  for (const field of FIELDS) holders.push(await hold(keyLock(field)));
  clickReset(ui, true);
  await flush();
  expect(bytesAll(), "H3: every held per-key lock keeps its removal pending").toStrictEqual(allOf("false"));
  expect(shownAll(ui), "all 8 pending resets display the default").toStrictEqual(allOf(true));
  for (const field of FIELDS) expect(says(msg.resetting(field)), `pending reset feedback for ${field.id}`).toBe(true);
  await exportUnderDenial(ui, "shape 5 all 8 pending resets", changes(Object.fromEntries(IDS.map(id => [id, RESET])) as Partial<Record<FieldId, Change>>));
  for (const holder of holders) await holder.release();
  expect(bytesAll(), "the pending resets complete after release").toStrictEqual(allOf(null));
  expect(says(W.en.restored)).toBe(true);
  expect(blocking()).toBe(false);
});

it("§8 shape 6: a dialog export through the registered guard is memory-only and changes nothing", async () => {
  seed(pomodoro, "false");
  const ui = mount();
  await flush();
  await failedResetDraft(ui, pomodoro);
  await failedSetDraft(ui, calendar);
  const current = need(guard(), "§9: departure guard registered");
  const harness = download();
  const denial = denyAllStorage();
  const from = mark();
  act(() => { current.exportDraft(); });
  await flush(2);
  expect(attempts(from), "the dialog export makes zero getItem, setItem or removeItem attempts").toEqual([]);
  await expectSingleDownload(harness, changes({ calendar: SET(false), pomodoro: RESET }), "shape 6 dialog export");
  const warning = unload();
  expect(warning.warned).toBe(true);
  expect(warning.attempts).toBe(0);
  expect(blocking(), "the dialog export never discards or releases").toBe(true);
  denial.off();
  expect(bytesAll(), "the dialog export never saves or resets").toStrictEqual({ ...allOf(null), pomodoro: "false" });
});

it("§8 shape 9: an export while one operation is held behind a real lock includes it and releases, saves or retries nothing", async () => {
  seed(board, "false");
  const ui = mount();
  await flush();
  const quota = await failedSetDraft(ui, tasks);
  const lock = await hold(keyLock(board));
  toggle(ui, board);
  await flush();
  expect(bytes(board), "H3: the held per-key lock serializes the Boards write").toBe("false");
  await exportUnderDenial(ui, "shape 9 held operation", changes({ tasks: SET(false), board: SET(true) }));
  expect(locks().heldBy(keyLock(board)), "the export never releases the held lock").toBe("test");
  quota.off();
  await lock.release();
  expect(bytes(board), "the held operation completes after release").toBe("true");
  expect(bytes(tasks), "the export never retried the failed Tasks").toBeNull();
  need(retryOf(ui, tasks), "the failed Tasks keeps its Retry");
});

it("§8 the export excludes saved, default and source-only fields", async () => {
  seed(pomodoro, "TRUE");
  const ui = mount();
  await flush();
  toggle(ui, meditation);
  await flush();
  expect(bytes(meditation), "the Meditation edit saved").toBe("false");
  await failedSetDraft(ui, board);
  await exportUnderDenial(ui, "sparse export beside saved, default and source-only siblings", changes({ board: SET(false) }));
});

it("INV §8 without an actual draft there is no Export control and no empty download", async () => {
  seed(pomodoro, "TRUE");
  const ui = mount();
  await flush();
  toggle(ui, matrix);
  await flush();
  expect(exportButton(ui), "no Export control without actual drafts").toBeNull();
  const harness = download();
  act(() => { guard()?.exportDraft(); });
  await flush(2);
  expect(harness.created.length + harness.clicks.length, "no empty download").toBe(0);
});

it.each(["blob", "url", "append", "click"] as const)("§8 a %s setup failure shows the localized export error, keeps drafts and guard, and cleans up", async stage => {
  const ui = mount();
  await flush();
  await failedSetDraft(ui, calendar);
  const exportControl = need(exportButton(ui), "H9: Export Features draft");
  const harness = download();
  let thrown = 0;
  const failOnce = (what: string) => () => { thrown += 1; throw new Error(`${what} setup`); };
  if (stage === "blob") { stubBlob(harness); harness.hooks.blob = phase => { if (phase === "before") failOnce("blob")(); }; }
  if (stage === "url") harness.hooks.create = failOnce("url");
  if (stage === "append") harness.hooks.beforeAppend = failOnce("append");
  if (stage === "click") harness.hooks.click = failOnce("click");
  fireEvent.click(exportControl);
  await flush(2);
  expect(thrown, `the export reached the ${stage} stage`).toBe(1);
  expect(says(W.en.exportFailed), `"${W.en.exportFailed}" after a ${stage} failure`).toBe(true);
  expect(harness.anchorsInDocument().length, "the anchor is removed").toBe(0);
  expect(harness.revoked, "every created object URL is revoked").toEqual(harness.created);
  need(retryOf(ui, calendar), "the draft is kept after a failed export");
  expect(blocking(), "the guard is kept after a failed export").toBe(true);
  expect(warns(), "beforeunload still warns after a failed export").toBe(true);
  harness.hooks = {};
  vi.unstubAllGlobals();
  const retried = download();
  fireEvent.click(need(exportButton(ui), "Export Features draft after a failed export"));
  await flush(2);
  await expectSingleDownload(retried, changes({ calendar: SET(false) }), `export retry after a ${stage} failure`);
});

it.each(["blob", "url", "append"] as const)("§8 an epoch change during %s cancels the click and cleans up; fresh permission exports", async stage => {
  const ui = mount();
  await flush();
  await failedSetDraft(ui, habits);
  const old = need(guard(), "§9: departure guard registered");
  const harness = download();
  let invalidated = 0;
  const invalidate = () => { invalidated += 1; activate(OWNER_B, "gB"); };
  if (stage === "blob") { stubBlob(harness); harness.hooks.blob = phase => { if (phase === "after") invalidate(); }; }
  if (stage === "url") harness.hooks.create = invalidate;
  if (stage === "append") harness.hooks.afterAppend = invalidate;
  act(() => { old.exportDraft(); });
  await flush(2);
  expect(invalidated, `the export reached the ${stage} stage`).toBe(1);
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
  await expectSingleDownload(retried, changes({ habits: SET(false) }), `fresh B export after a ${stage}-time epoch change`);
});

it.each(["blob", "url", "append"] as const)("§8 an unmount during %s cancels the click and cleans up", async stage => {
  const ui = mount();
  await flush();
  await failedSetDraft(ui, pomodoro);
  const old = need(guard(), "§9: departure guard registered");
  const harness = download();
  let unmounted = 0;
  const unmount = () => { unmounted += 1; ui.unmount(); };
  if (stage === "blob") { stubBlob(harness); harness.hooks.blob = phase => { if (phase === "after") unmount(); }; }
  if (stage === "url") harness.hooks.create = unmount;
  if (stage === "append") harness.hooks.afterAppend = unmount;
  act(() => { old.exportDraft(); });
  await flush(2);
  expect(unmounted, `the export reached the ${stage} stage`).toBe(1);
  expect(harness.clicks.length, "the export never clicks after unmount").toBe(0);
  expect(harness.revoked, "every created object URL is revoked").toEqual(harness.created);
  expect(harness.anchorsInDocument().length, "the anchor is removed").toBe(0);
  expect(old.isCurrent(), "the unmounted guard is no longer current").toBe(false);
});

it("§7 §9 unmount removes the guard and the beforeunload listener, detaches old callbacks, and never undoes committed writes or removals", async () => {
  seed(board, "false");
  const ui = mount();
  await flush();
  clickReset(ui, true);
  await flush(24);
  expect(bytes(board), "a committed removal before unmount").toBeNull();
  toggle(ui, dashboard);
  await flush();
  expect(bytes(dashboard), "a committed write before unmount").toBe("false");
  await failedSetDraft(ui, calendar);
  const old = need(guard(), "§9: departure guard registered");
  expect(warns(), "beforeunload warns before unmount").toBe(true);
  const retry = need(retryOf(ui, calendar), "H9: Retry Calendar");
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
  expect(bytes(dashboard), "unmount never undoes committed writes").toBe("false");
  expect(bytes(board), "unmount never undoes committed removals").toBeNull();
});
