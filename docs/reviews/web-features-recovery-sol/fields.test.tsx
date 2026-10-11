/**
 * Mode `fields` (contract section 12): section 5 items 1–8 for all 8 toggles — per-field failure and Retry,
 * source truth (throwing reads and malformed bytes), Saved truth, targeted recovery, the pane-layer guard,
 * and the normative EN/ZH wording. Hypotheses H1, H2, H3 (lock capability), H7 (Save & apply) and H9.
 *
 * Every business assertion states the fixed-product requirement. It is expected to FAIL at f359be6 wherever
 * the tagged hypothesis holds, and must PASS unchanged on the fixed product.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import {
  blocking, board, button, byId, bytes, bytesAll, calendar, dashboard, discardAllButton, discardOf, download, envelope, expectSingleDownload,
  exportButton, fault, featureWrites, FIELDS, fired, flush, guard, habits, hold, IDS, keyLock, lockState, locks, mark, matrix, meditation,
  mount, msg, nativeSet, need, others, pomodoro, pre, raw, rejections, reloadOf, retryOf, says, seed, SET, setup, shown, shownAll, switchOf,
  tasks, teardown, toggle, touches, unload, W, warns, writesOn, type Field, type FieldId,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

const allOf = (value: boolean | null | string) => Object.fromEntries(IDS.map(id => [id, value])) as Record<FieldId, boolean | null | string>;
/** Even-indexed fields start absent (on) and are turned off; odd-indexed fields start stored "false" and are turned back on. */
const planOf = (index: number) => (index % 2 === 0 ? { seed: null, next: false } : { seed: "false", next: true });
const indexed = FIELDS.map((field, index) => ({ field, index, id: field.id }));

describe.each(indexed)("$id", ({ field, index }) => {
  it(`H1 ${field.id}: a failed write keeps the latest choice with failed feedback, Retry, Discard, Export, guard and warning; Retry saves exact bytes`, async () => {
    const plan = planOf(index);
    if (plan.seed !== null) seed(field, plan.seed);
    const ui = mount();
    await flush();
    const quota = fault({ op: "set", key: field.key, label: `${field.id} quota` });
    toggle(ui, field);
    await flush();
    fired(quota, `${field.id} write`);
    expect(shown(ui, field), `H1: ${field.id} keeps displaying the latest choice after its write failed`).toBe(plan.next);
    expect(bytes(field), "the previous bytes remain after the failed write").toBe(plan.seed);
    expect(says(msg.notSaved(field)), `H1/H9: "${msg.notSaved(field)}" failed feedback`).toBe(true);
    const retry = need(retryOf(ui, field), `H9: Retry ${field.label}`);
    need(discardOf(ui, field), `H9: Discard ${field.label}`);
    need(exportButton(ui), "H9: Export Features draft");
    expect(blocking(), "§9: the departure guard blocks while the failed choice is unsaved").toBe(true);
    expect(warns(), "§9: beforeunload warns while the failed choice is unsaved").toBe(true);
    expect(says(W.en.saved), "H7: no false Saved while work is unresolved").toBe(false);
    quota.off();
    const from = mark();
    fireEvent.click(retry);
    await flush();
    expect(writesOn(from, field), "Retry writes exactly the latest bytes once").toEqual([raw(plan.next)]);
    expect(bytes(field)).toBe(raw(plan.next));
    expect(shown(ui, field)).toBe(plan.next);
    expect(retryOf(ui, field), "the matching latest success clears the field's recovery").toBeNull();
    expect(says(msg.notSaved(field)), "the failed feedback clears after the latest success").toBe(false);
    expect(blocking(), "no departure block after the latest success").toBe(false);
    expect(warns(), "no beforeunload warning after the latest success").toBe(false);
    expect(says(W.en.saved), "H9: a genuine latest success with no outstanding issue shows Saved").toBe(true);
    expect(rejections, "no unhandled rejection").toEqual([]);
  });

  it(`H2 ${field.id}: a throwing read shows the default with a Reload-only source alert; Reload repairs with zero writes and no Saved`, async () => {
    seed(field, "false");
    const denied = fault({ op: "get", key: field.key, label: `${field.id} read denied` });
    const from = mark();
    const ui = mount();
    await flush();
    fired(denied, `${field.id} mount read`);
    expect(shown(ui, field), "an unavailable source displays the registry default (on)").toBe(true);
    expect(says(msg.unavailable(field)), `H2: "${msg.unavailable(field)}" source alert`).toBe(true);
    const reload = need(reloadOf(ui, field), `H2/H9: Reload ${field.label}`);
    expect(retryOf(ui, field), "source-only: no Retry").toBeNull();
    expect(discardOf(ui, field), "source-only: no Discard").toBeNull();
    expect(exportButton(ui), "source-only: no export").toBeNull();
    expect(blocking(), "source-only: no departure guard block").toBe(false);
    expect(warns(), "source-only: no beforeunload warning").toBe(false);
    expect(says(W.en.saved), "no Saved claim").toBe(false);
    expect(featureWrites(from), "mount never rewrites or purges the source").toEqual([]);
    denied.off();
    const repair = mark();
    fireEvent.click(reload);
    await flush();
    expect(featureWrites(repair), "Reload makes zero set/remove attempts").toEqual([]);
    expect(touches(repair, others(field)), "Reload rereads only its own field").toEqual([]);
    expect(shown(ui, field), "Reload shows the stored value").toBe(false);
    expect(says(msg.unavailable(field)), "Reload clears the source alert").toBe(false);
    expect(says(W.en.saved), "a source-only repair never claims a save by itself").toBe(false);
    expect(bytes(field)).toBe("false");
  });
});

const VARIANTS = ["1", "0", "TRUE", "True", "yes", "", '"true"', " true"] as const;
const invalidSources: ReadonlyArray<readonly [FieldId, string]> = FIELDS.flatMap((field, index) => [
  [field.id, VARIANTS[index]!] as const,
  [field.id, VARIANTS[(index + 3) % VARIANTS.length]!] as const,
]);

it.each(invalidSources)("H2 %s=%j: malformed bytes display the default with a Reload-only alert; mount and Reload never normalize them", async (id, stored) => {
  const field = byId(id);
  seed(field, stored);
  const from = mark();
  const ui = mount();
  await flush();
  expect(shown(ui, field), "an invalid source displays the registry default (on), never a decoded guess").toBe(true);
  expect(says(msg.unavailable(field)), `H2: "${msg.unavailable(field)}" source alert`).toBe(true);
  const reload = need(reloadOf(ui, field), `H2/H9: Reload ${field.label}`);
  expect(retryOf(ui, field), "source-only: no Retry").toBeNull();
  expect(discardOf(ui, field), "source-only: no Discard").toBeNull();
  expect(exportButton(ui), "source-only: no export").toBeNull();
  expect(blocking(), "source-only: no departure guard block").toBe(false);
  expect(warns(), "source-only: no beforeunload warning").toBe(false);
  expect(says(W.en.saved), "no Saved claim").toBe(false);
  fireEvent.click(reload);
  await flush();
  expect(says(msg.unavailable(field)), "Reload of still-invalid bytes keeps the alert").toBe(true);
  expect(featureWrites(from), "mount and Reload never rewrite, purge or normalize").toEqual([]);
  expect(bytes(field)).toBe(stored);
});

it("H2 §5.2 a valid toggle over invalid bytes is a failed draft that never overwrites them; Retry never gains authority; Discard is zero-write and returns to Reload-only", async () => {
  seed(board, "yes");
  const ui = mount();
  await flush();
  toggle(ui, board);
  await flush();
  expect(shown(ui, board), "the valid choice is displayed as the latest draft").toBe(false);
  expect(bytes(board), "H2/§5.2: a valid edit never silently overwrites an invalid source").toBe("yes");
  expect(says(msg.notSaved(board)), "failed feedback").toBe(true);
  const retry = need(retryOf(ui, board), "H9: Retry Boards");
  need(discardOf(ui, board), "H9: Discard Boards");
  expect(blocking(), "the draft is guarded").toBe(true);
  expect(warns(), "the draft warns on beforeunload").toBe(true);
  const harness = download();
  fireEvent.click(need(exportButton(ui), "H9: Export Features draft"));
  await flush(2);
  await expectSingleDownload(harness, envelope({ board: SET(false) }), "draft over an invalid source");
  const retried = mark();
  fireEvent.click(retry);
  await flush();
  expect(writesOn(retried, board), "Retry never gains authority over the invalid source").toEqual([]);
  expect(bytes(board)).toBe("yes");
  const from = mark();
  fireEvent.click(need(discardOf(ui, board), "Discard Boards after Retry"));
  await flush();
  expect(featureWrites(from), "Discard makes zero set/remove attempts").toEqual([]);
  expect(bytes(board)).toBe("yes");
  expect(shown(ui, board), "after Discard the invalid source displays the default").toBe(true);
  expect(says(msg.unavailable(board)), "the source alert returns after Discard").toBe(true);
  need(reloadOf(ui, board), "the source-only Reload returns");
  expect(retryOf(ui, board)).toBeNull();
  expect(blocking()).toBe(false);
  expect(warns()).toBe(false);
});

it("H1 H2 §5.2 a valid toggle over an unavailable source is a failed draft; bytes untouched; Discard returns to Reload-only", async () => {
  seed(calendar, "true");
  const denied = fault({ op: "get", key: calendar.key, label: "calendar read denied" });
  const ui = mount();
  await flush();
  fired(denied, "calendar mount read");
  const from = mark();
  toggle(ui, calendar);
  await flush();
  expect(shown(ui, calendar), "H1/H2: the toggle keeps displaying the latest intent").toBe(false);
  expect(bytes(calendar), "the unreadable source is never overwritten").toBe("true");
  expect(says(msg.notSaved(calendar)), "failed feedback").toBe(true);
  need(retryOf(ui, calendar), "H9: Retry Calendar");
  const discard = need(discardOf(ui, calendar), "H9: Discard Calendar");
  expect(blocking()).toBe(true);
  expect(warns()).toBe(true);
  fireEvent.click(discard);
  await flush();
  expect(featureWrites(from), "neither the edit nor Discard writes the unreadable source").toEqual([]);
  expect(shown(ui, calendar), "the unreadable source displays the default").toBe(true);
  need(reloadOf(ui, calendar), "the source-only Reload returns while reads are still denied");
  expect(blocking()).toBe(false);
  expect(warns()).toBe(false);
});

it("§5.8 Reload refuses at invocation time to erase the same field's actual draft", async () => {
  seed(habits, "yes");
  const ui = mount();
  await flush();
  const reload = need(reloadOf(ui, habits), "H2/H9: Reload Habits");
  const control = switchOf(ui, habits);
  act(() => { control.click(); reload.click(); });
  await flush();
  expect(shown(ui, habits), "the actual draft survives a same-turn Reload").toBe(false);
  expect(bytes(habits), "the invalid source is untouched").toBe("yes");
  need(retryOf(ui, habits), "the draft keeps Retry Habits");
  expect(blocking(), "the draft stays guarded").toBe(true);
  const later = reloadOf(ui, habits);
  if (later) {
    fireEvent.click(later);
    await flush();
    expect(shown(ui, habits), "a later Reload also refuses to erase the draft").toBe(false);
    need(retryOf(ui, habits), "the draft keeps Retry after a later Reload");
  }
  const harness = download();
  act(() => { guard()?.exportDraft(); });
  await flush(2);
  await expectSingleDownload(harness, envelope({ habits: SET(false) }), "draft after a refused Reload");
});

it("§5.7 all 8 unresolved at once; a targeted Retry never touches siblings; Discard all is zero-write and visits only drafts", async () => {
  const ui = mount();
  await flush();
  const quotas = FIELDS.map(field => fault({ op: "set", key: field.key, label: `${field.id} quota` }));
  for (const field of FIELDS) toggle(ui, field);
  await flush();
  FIELDS.forEach((field, index) => fired(quotas[index]!, `${field.id} write`));
  expect(shownAll(ui), "H1: all 8 latest choices stay displayed").toStrictEqual(allOf(false));
  for (const field of FIELDS) {
    expect(says(msg.notSaved(field)), `${field.id} failed feedback`).toBe(true);
    need(retryOf(ui, field), `H9: Retry ${field.label}`);
    need(discardOf(ui, field), `H9: Discard ${field.label}`);
  }
  need(exportButton(ui), "H9: Export Features draft");
  need(discardAllButton(ui), "H9: Discard all changes");
  expect(blocking()).toBe(true);
  expect(warns()).toBe(true);
  expect(says(W.en.saved)).toBe(false);
  quotas[FIELDS.indexOf(calendar)]!.off();
  const retried = mark();
  fireEvent.click(need(retryOf(ui, calendar), "Retry Calendar"));
  await flush();
  expect(bytes(calendar), "the targeted Retry saves its field").toBe("false");
  expect(retryOf(ui, calendar), "the retried field is resolved").toBeNull();
  expect(touches(retried, others(calendar)), "a successful field never retries, rewrites or rereads a sibling").toEqual([]);
  for (const field of others(calendar)) need(retryOf(ui, field), `${field.id} stays unresolved`);
  expect(says(W.en.saved), "no general Saved while siblings are unresolved").toBe(false);
  expect(blocking()).toBe(true);
  const discarded = mark();
  fireEvent.click(need(discardAllButton(ui), "Discard all changes after a partial Retry"));
  await flush();
  expect(featureWrites(discarded), "Discard all makes zero set/remove attempts").toEqual([]);
  expect(touches(discarded, [calendar]), "Discard all visits only actual current drafts").toEqual([]);
  expect(shownAll(ui), "Discard all returns each draft to its stored value").toStrictEqual({ ...allOf(true), calendar: false });
  for (const field of FIELDS) expect(retryOf(ui, field), `${field.id} recovery cleared`).toBeNull();
  expect(blocking()).toBe(false);
  expect(warns()).toBe(false);
  expect(bytesAll(), "only the retried field was ever written").toStrictEqual({ ...allOf(null), calendar: "false" });
});

it("§5.7 a Boards conflict coexists with an unrelated Matrix quota failure; each settles independently and Retry never overwrites the conflict", async () => {
  seed(board, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(board));
  toggle(ui, board);
  await flush();
  expect(bytes(board), "H3: the held per-key lock serializes the Boards write").toBe("false");
  nativeSet.call(localStorage, board.key, "true");
  const quota = fault({ op: "set", key: matrix.key, label: "matrix quota" });
  toggle(ui, matrix);
  await flush();
  fired(quota, "matrix write");
  await lock.release();
  expect(bytes(board), "the external replacement is preserved").toBe("true");
  expect(shown(ui, board), "the latest Boards choice stays displayed").toBe(true);
  need(retryOf(ui, board), "the conflict keeps Retry Boards");
  need(discardOf(ui, board), "the conflict keeps Discard Boards");
  expect(says(msg.notSaved(matrix)), "Matrix failed feedback").toBe(true);
  const matrixRetry = need(retryOf(ui, matrix), "Retry Matrix");
  expect(blocking()).toBe(true);
  expect(says(W.en.saved)).toBe(false);
  quota.off();
  const retried = mark();
  fireEvent.click(matrixRetry);
  await flush();
  expect(bytes(matrix)).toBe("false");
  expect(retryOf(ui, matrix)).toBeNull();
  expect(touches(retried, [board]), "the Matrix Retry never touches the conflicting Boards field").toEqual([]);
  need(retryOf(ui, board), "the Boards conflict remains");
  expect(bytes(board)).toBe("true");
  expect(says(W.en.saved), "no general Saved while the conflict remains").toBe(false);
  const again = mark();
  fireEvent.click(need(retryOf(ui, board), "Retry Boards on the conflict"));
  await flush();
  expect(writesOn(again, board), "a repeated Retry never gains authority to overwrite").toEqual([]);
  expect(bytes(board)).toBe("true");
  need(retryOf(ui, board), "the conflict stays preserved after Retry");
  expect(blocking()).toBe(true);
});

it("§5.8 a targeted Discard is zero-write, rereads only its field and leaves sibling work exportable", async () => {
  seed(pomodoro, "false");
  const ui = mount();
  await flush();
  const tasksQuota = fault({ op: "set", key: tasks.key, label: "tasks quota" });
  const pomodoroQuota = fault({ op: "set", key: pomodoro.key, label: "pomodoro quota" });
  toggle(ui, tasks);
  toggle(ui, pomodoro);
  await flush();
  fired(tasksQuota, "tasks write");
  fired(pomodoroQuota, "pomodoro write");
  expect(shown(ui, tasks), "H1: the failed Tasks keeps the latest choice").toBe(false);
  expect(shown(ui, pomodoro), "H1: the failed Pomodoro keeps the latest choice").toBe(true);
  const discard = need(discardOf(ui, tasks), "H9: Discard Tasks");
  const from = mark();
  fireEvent.click(discard);
  await flush();
  expect(featureWrites(from), "Discard makes zero set/remove attempts").toEqual([]);
  expect(touches(from, others(tasks)), "Discard never reads or writes a sibling").toEqual([]);
  expect(shown(ui, tasks), "Discard rereads the stored (absent) Tasks: on").toBe(true);
  expect(retryOf(ui, tasks)).toBeNull();
  expect(says(msg.notSaved(tasks))).toBe(false);
  need(retryOf(ui, pomodoro), "the sibling draft keeps its Retry");
  expect(blocking()).toBe(true);
  const harness = download();
  fireEvent.click(need(exportButton(ui), "Export Features draft"));
  await flush(2);
  await expectSingleDownload(harness, envelope({ pomodoro: SET(true) }), "sparse export after a targeted discard");
});

it("H9 §5.7 Saved appears only after a genuine latest success with no pending work", async () => {
  const ui = mount();
  await flush();
  expect(says(W.en.saved), "a clean mount makes no Saved claim").toBe(false);
  toggle(ui, dashboard);
  await flush();
  expect(bytes(dashboard)).toBe("false");
  expect(says(W.en.saved), "H9: a genuine latest success shows the truthful Saved status").toBe(true);
  const lock = await hold(keyLock(dashboard));
  toggle(ui, dashboard);
  await flush();
  expect(says(msg.saving(dashboard)), `pending feedback "${msg.saving(dashboard)}" while the operation is held`).toBe(true);
  expect(says(W.en.saved), "no Saved while an operation is pending").toBe(false);
  await lock.release();
  expect(bytes(dashboard)).toBe("true");
  expect(says(W.en.saved), "Saved returns after the latest success").toBe(true);
});

it("H7 D3 after a failed toggle nothing claims Saved, and Features renders no shared Save & apply footer", async () => {
  const ui = mount();
  await flush();
  const quota = fault({ op: "set", key: tasks.key, label: "tasks quota" });
  toggle(ui, tasks);
  await flush();
  fired(quota, "tasks write");
  const save = button(ui, "Save & apply");
  if (save) {
    fireEvent.click(save);
    await flush(2);
  }
  expect(says("Saved"), "H7: no 'Saved' claim anywhere after a failed toggle (Save & apply exercised when present)").toBe(false);
  expect(save, "H7/D3: Features renders no shared 'Save & apply' control").toBeNull();
  expect(ui.container.querySelector('[data-testid="settings-footer-save"]'), "D3: the shared SettingsFooter save button is not rendered").toBeNull();
});

it.each(["missing", "rejected"] as const)("H3 §5.5 a %s Web Lock capability keeps the latest Matrix choice with failed feedback and no write; Retry after restoration saves", async variant => {
  seed(matrix, "false");
  const ui = mount();
  await flush();
  const manager = locks();
  const accessesBefore = lockState.accesses;
  const requestsBefore = manager.log.length;
  if (variant === "missing") lockState.missing = true;
  else manager.deny(keyLock(matrix));
  toggle(ui, matrix);
  await flush();
  if (variant === "missing") expect(lockState.accesses - accessesBefore, "H3: the write consults the Web Lock capability").toBeGreaterThan(0);
  else expect(manager.rejectedFor(keyLock(matrix), requestsBefore), "H3: the write requests the per-key Web Lock").toBeGreaterThan(0);
  expect(shown(ui, matrix), "the latest choice stays displayed").toBe(true);
  expect(bytes(matrix), "no write without the per-key lock").toBe("false");
  expect(says(msg.notSaved(matrix)), "failed feedback").toBe(true);
  const retry = need(retryOf(ui, matrix), "H9: Retry Matrix");
  expect(says(W.en.saved)).toBe(false);
  expect(blocking()).toBe(true);
  expect(rejections, "no unhandled rejection").toEqual([]);
  lockState.missing = false;
  manager.allow(keyLock(matrix));
  fireEvent.click(retry);
  await flush();
  expect(bytes(matrix)).toBe("true");
  expect(retryOf(ui, matrix)).toBeNull();
  expect(blocking()).toBe(false);
  expect(says(W.en.saved)).toBe(true);
});

it("§9 the Features guard registers whenever the host provides the hook and blocks only while drafts exist; a failed toggle blocks and warns; source-only states never block or warn", async () => {
  seed(pomodoro, "TRUE");
  const ui = mount();
  await flush();
  const atMount = need(guard(), "§9: FeaturesPane registers its departure guard whenever the host provides the hook (clean mount)");
  expect(atMount.label, "the guard label is Features").toBe(W.en.guardLabel);
  expect(blocking(), "a source-only state never blocks").toBe(false);
  expect(unload().warned, "a source-only state never warns").toBe(false);
  const quota = fault({ op: "set", key: meditation.key, label: "meditation quota" });
  toggle(ui, meditation);
  await flush();
  fired(quota, "meditation write");
  const current = need(guard(), "§9: FeaturesPane registers the optional departure guard");
  expect(current.label, "the guard label is Features, never the Smart Lists fallback").toBe(W.en.guardLabel);
  expect(current.isCurrent(), "the registered guard is current").toBe(true);
  expect(current.isBlocking(), "the guard blocks while a failed choice is unsaved").toBe(true);
  const warning = unload();
  expect(warning.warned, "beforeunload warns while a failed choice is unsaved").toBe(true);
  expect(warning.attempts, "the beforeunload handler makes zero storage attempts").toBe(0);
  fireEvent.click(need(discardOf(ui, meditation), "Discard Meditation"));
  await flush();
  expect(blocking(), "no block after the draft is discarded").toBe(false);
  expect(unload().warned, "no warning after the draft is discarded").toBe(false);
});

it("H9 §5.6 an uncertain write exposes Retry, Discard, Export and Discard all instead of a silent success", async () => {
  const ui = mount();
  await flush();
  const readback = fault({ op: "get", key: habits.key, after: { op: "set", key: habits.key, value: "false" }, times: 1, label: "post-write habits read" });
  toggle(ui, habits);
  await flush();
  fired(readback, "post-write habits read");
  pre(bytes(habits) === "false", "the uncertain write physically reached storage");
  expect(shown(ui, habits), "the latest choice stays displayed").toBe(false);
  const retry = need(retryOf(ui, habits), "H9: Retry Habits");
  need(discardOf(ui, habits), "H9: Discard Habits");
  need(exportButton(ui), "H9: Export Features draft");
  need(discardAllButton(ui), "H9: Discard all changes");
  expect(says(W.en.saved), "no false Saved for an unverified write").toBe(false);
  const from = mark();
  fireEvent.click(retry);
  await flush();
  expect(retryOf(ui, habits), "Retry verifies the uncertain write").toBeNull();
  expect(writesOn(from, habits), "verification needs no second write").toEqual([]);
  expect(bytes(habits)).toBe("false");
  expect(says(W.en.saved)).toBe(true);
});

it("H2 §5.7 a sibling source error suppresses Saved even after a successful edit", async () => {
  seed(pomodoro, "TRUE");
  const ui = mount();
  await flush();
  toggle(ui, tasks);
  await flush();
  expect(bytes(tasks)).toBe("false");
  expect(says(msg.unavailable(pomodoro)), "H2: the Pomodoro source alert").toBe(true);
  expect(says(W.en.saved), "no general Saved while a sibling source error exists").toBe(false);
  expect(retryOf(ui, tasks), "the successful Tasks has no recovery").toBeNull();
  expect(blocking(), "a source-only sibling never blocks").toBe(false);
});

it("§5.7 §5.8 a sibling source-only Reload repair clears its alert without claiming Saved or acknowledging failed work", async () => {
  seed(pomodoro, "TRUE");
  const ui = mount();
  await flush();
  const quota = fault({ op: "set", key: board.key, label: "board quota" });
  toggle(ui, board);
  await flush();
  fired(quota, "board write");
  const reload = need(reloadOf(ui, pomodoro), "H2/H9: Reload Pomodoro");
  nativeSet.call(localStorage, pomodoro.key, "false");
  const from = mark();
  fireEvent.click(reload);
  await flush();
  expect(featureWrites(from), "Reload makes zero set/remove attempts").toEqual([]);
  expect(touches(from, others(pomodoro)), "Reload rereads only its own field").toEqual([]);
  expect(says(msg.unavailable(pomodoro)), "the repaired source alert clears").toBe(false);
  expect(shown(ui, pomodoro)).toBe(false);
  expect(says(msg.notSaved(board)), "source repair never acknowledges the failed Boards work").toBe(true);
  need(retryOf(ui, board), "the failed Boards keeps Retry");
  expect(says(W.en.saved)).toBe(false);
  expect(blocking()).toBe(true);
});

it("§5.8 Discard all visits only actual drafts: a source-only sibling is untouched", async () => {
  seed(pomodoro, "TRUE");
  const ui = mount();
  await flush();
  const quota = fault({ op: "set", key: board.key, label: "board quota" });
  toggle(ui, board);
  await flush();
  fired(quota, "board write");
  const discardAll = need(discardAllButton(ui), "H9: Discard all changes");
  const from = mark();
  fireEvent.click(discardAll);
  await flush();
  expect(featureWrites(from), "Discard all makes zero set/remove attempts").toEqual([]);
  expect(touches(from, others(board)), "Discard all never visits non-draft fields").toEqual([]);
  expect(shown(ui, board), "the Boards draft returns to its stored value").toBe(true);
  expect(retryOf(ui, board)).toBeNull();
  expect(says(msg.unavailable(pomodoro)), "the source-only alert remains").toBe(true);
  need(reloadOf(ui, pomodoro), "the source-only Reload remains");
  expect(bytes(pomodoro)).toBe("TRUE");
  expect(blocking()).toBe(false);
});

it("§5 ZH wording: source alert, failed feedback, per-field and pane actions, Saved, pending and guard label", async () => {
  seed(matrix, "yes");
  const ui = mount("zh");
  await flush();
  expect(says(msg.unavailable(matrix, "zh")), "ZH source alert").toBe(true);
  const reload = need(button(ui, "重新读取 四象限"), "ZH Reload action");
  const quota = fault({ op: "set", key: tasks.key, label: "tasks quota" });
  toggle(ui, tasks);
  await flush();
  fired(quota, "tasks write");
  expect(says("任务未保存。"), "ZH failed feedback").toBe(true);
  const retry = need(button(ui, "重试 任务"), "ZH Retry action");
  need(button(ui, "放弃 任务"), "ZH Discard action");
  need(button(ui, "导出功能草稿"), "ZH Export action");
  need(button(ui, "放弃全部更改"), "ZH Discard all action");
  expect(guard()?.label, "ZH guard label").toBe("功能");
  nativeSet.call(localStorage, matrix.key, "true");
  fireEvent.click(reload);
  await flush();
  quota.off();
  fireEvent.click(retry);
  await flush();
  expect(says("功能设置已保存。"), "ZH Saved status").toBe(true);
  const lock = await hold(keyLock(board));
  toggle(ui, board);
  await flush();
  expect(says("项目板正在保存。"), "ZH pending feedback").toBe(true);
  await lock.release();
});

it("§5 ZH export failure status", async () => {
  const ui = mount("zh");
  await flush();
  const quota = fault({ op: "set", key: calendar.key, label: "calendar quota" });
  toggle(ui, calendar);
  await flush();
  fired(quota, "calendar write");
  expect(shown(ui, calendar), "H1: the failed Calendar keeps the latest choice").toBe(false);
  const exportZh = need(button(ui, "导出功能草稿"), "ZH Export action");
  const harness = download();
  let thrown = 0;
  harness.hooks.create = () => { thrown += 1; throw new Error("url setup"); };
  fireEvent.click(exportZh);
  await flush(2);
  expect(thrown, "the export attempted to create an object URL").toBe(1);
  expect(says("导出失败，请重试。"), "ZH export failure status").toBe(true);
  need(button(ui, "重试 日历"), "the draft is kept after a failed export");
});
