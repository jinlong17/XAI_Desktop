/**
 * Mode `reset` (contract section 12): all of section 6 — Reset to defaults as a recoverable, pane-scoped,
 * per-key remove operation. Hypotheses H5 (refused removal hidden behind a synthetic event), H6 at the hook
 * layer (mounted legacy usePref readers repainted to defaults), H7 (confirmation text) and H9 (truthful
 * "Defaults restored." and recovery controls); D2 (no StorageEvent); D3 (Features-local control).
 *
 * The H5/H6 probes mount the real, protected readers next to the pane: legacy `usePref` for the App's
 * appearance keys, AppRail order and DesktopPet keys, and the real `useFeaturePrefs` +
 * `filterModulesByFeaturePrefs` rail input. The production App composition is covered by downstream.test.tsx.
 */
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { usePref } from "@repo/plugin-web-storage";
import { filterModulesByFeaturePrefs, useFeaturePrefs } from "@repo/plugin-web-settings-features-panel";
import {
  accountTouches, attempts, blocking, board, button, bytes, bytesAll, calendar, clickReset, confirmer, dashboard, dispatched, discardOf,
  download, envelope, expectSingleDownload, exportButton, fault, featureWrites, FIELDS, fired, flush, habits, hold, IDS, keyLock, KEYS,
  lockAccount, mark, matrix, meditation, mount, msg, nativeSet, need, nullStorageEvents, others, pomodoro, pre, rejections, reloadOf,
  removesOn, RESET, resetButton, resetButtons, retryOf, says, seed, seedKey, setup, shown, shownAll, tasks, teardown, toggle, touches,
  unrelatedSnapshot, W, warns, writesOn, type Change, type FieldId, type Lang,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

const allOf = (value: boolean | null | string) => Object.fromEntries(IDS.map(id => [id, value])) as Record<FieldId, boolean | null | string>;
const only = (id: FieldId, change: Change) => envelope({ [id]: change } as Partial<Record<FieldId, Change>>);
const seedAllFalse = () => { for (const field of FIELDS) seed(field, "false"); };

// ---- Probes: the real, protected readers mounted beside the pane -------------------------------------

function LegacyReaders(): React.ReactElement {
  const [hue] = usePref("xai_accent_hue");
  const [tone] = usePref("xai_bg_tone");
  const [railPos] = usePref("xai_rail_pos");
  const [order] = usePref("xai_rail_order");
  const [petId] = usePref("xai_pet_id");
  const [petPos] = usePref("xai_pet_pos");
  return <output data-testid="sol-legacy-readers">{JSON.stringify({ hue, tone, railPos, order, petId, petPos })}</output>;
}
function RailInput(): React.ReactElement {
  const prefs = useFeaturePrefs();
  const visible = filterModulesByFeaturePrefs(IDS.map(moduleId => ({ moduleId })), prefs).map(entry => entry.moduleId);
  return <output data-testid="sol-rail-input">{JSON.stringify(visible)}</output>;
}
function probe(testId: string): unknown {
  const found = screen.queryAllByTestId(testId);
  pre(found.length === 1, `exactly one ${testId} probe rendered (got ${found.length})`);
  return JSON.parse(found[0]!.textContent ?? "null");
}
const CUSTOM_ORDER = ["statistics", "countdown", "meditation", "habits", "timetrack", "pomodoro", "matrix", "calendar", "dashboard", "board", "tasks", "ai"];
const STORED_READERS = { hue: 210, tone: "sage", railPos: "right", order: CUSTOM_ORDER, petId: "pip", petPos: { x: 300, y: 200 } };
function seedAppearanceRailAndPet(): void {
  seedKey("xai_accent_hue", "210");
  seedKey("xai_bg_tone", "sage");
  seedKey("xai_rail_pos", "right");
  seedKey("xai_rail_order", JSON.stringify(CUSTOM_ORDER));
  seedKey("xai_pet_id", "pip");
  seedKey("xai_pet_pos", JSON.stringify({ x: 300, y: 200 }));
}

// ---- Confirmation and control ---------------------------------------------------------------------

it.each(["en", "zh"] as const)("H7 the %s reset confirmation states the normative text, with no theme or layout claim", async lang => {
  const ui = mount(lang as Lang);
  await flush();
  const [message] = clickReset(ui, false);
  expect(message, `H7: the normative ${lang} confirmation text`).toBe(W[lang].confirm);
});

it("§6 D3 Reset to defaults is a Features-local control, not the shared SettingsFooter", async () => {
  const ui = mount();
  await flush();
  const control = resetButton(ui);
  expect(control.getAttribute("data-testid"), "§6/D3: the Features-local control carries data-testid features-reset-defaults").toBe("features-reset-defaults");
  expect(button(ui, "Save & apply"), "D3: no shared Save & apply").toBeNull();
});

// ---- Full reset -----------------------------------------------------------------------------------

it("H9 §6 an accepted reset reaches verified absence for all 8, never writes, and reports Defaults restored", async () => {
  seedAllFalse();
  const ui = mount();
  await flush();
  const from = mark();
  clickReset(ui, true);
  await flush(24);
  expect(bytesAll(), "all 8 keys absent").toStrictEqual(allOf(null));
  expect(shownAll(ui), "all 8 display the default on").toStrictEqual(allOf(true));
  expect(attempts(from, KEYS, ["set"]).length, "Reset never writes true").toBe(0);
  expect(says(W.en.restored), "H9: the truthful 'Defaults restored.' status after all 8 completed").toBe(true);
  for (const field of FIELDS) {
    expect(retryOf(ui, field), `${field.id}: no recovery after a verified reset`).toBeNull();
    expect(says(msg.notReset(field)), `${field.id}: no failure feedback`).toBe(false);
  }
  expect(blocking()).toBe(false);
  expect(warns()).toBe(false);
  expect(rejections).toEqual([]);
});

it("D2 §10.5 Reset to defaults dispatches no StorageEvent of any kind", async () => {
  seedAllFalse();
  const ui = mount();
  await flush();
  const from = dispatched.length;
  clickReset(ui, true);
  await flush(24);
  pre(bytesAll().tasks === null, "the reset ran");
  expect(nullStorageEvents(from), "D2: zero StorageEvents with key === null").toBe(0);
  expect(dispatched.length - from, "D2: the Features package dispatches no StorageEvent of any kind").toBe(0);
});

it("INV §6 §10.6 a full reset leaves every key other than the 8 byte-identical (snapshot comparison)", async () => {
  seedAllFalse();
  seedAppearanceRailAndPet();
  seedKey("xai_pref_lang", JSON.stringify("zh"));
  seedKey("xai_pref_theme", JSON.stringify("dark"));
  seedKey("xai_pref_sticky_color", "sky");
  seedKey("xai_pref_notif_enabled", "false");
  seedKey("xai_pref_smart_lists", "legacy-unscoped");
  seedKey("xai:account:v1:features-sol-A:g1:xai_pref_smart_lists", "account-scoped");
  seedKey("xai:account:v1:features-sol-B:gB:xai_pref_more_default_tag", "personal");
  const ui = mount();
  await flush();
  const before = unrelatedSnapshot();
  pre(Object.keys(before).length >= 13, "the unrelated snapshot holds the seeded keys and the A generation marker");
  clickReset(ui, true);
  await flush(24);
  expect(bytesAll(), "the 8 keys were removed").toStrictEqual(allOf(null));
  expect(unrelatedSnapshot(), "§6/§10.6: every other key keeps its exact bytes").toStrictEqual(before);
});

it("H6 (hook layer) mounted legacy usePref readers of accent hue, background tone, rail position, rail order and pet keep their stored values through Reset to defaults", async () => {
  seedAllFalse();
  seedAppearanceRailAndPet();
  const ui = mount("en", { extra: <LegacyReaders /> });
  await flush();
  pre(JSON.stringify(probe("sol-legacy-readers")) === JSON.stringify(STORED_READERS), "the legacy readers display the seeded values before the reset");
  clickReset(ui, true);
  await flush(24);
  pre(bytesAll().board === null, "the reset ran");
  expect(probe("sol-legacy-readers"), "H6: no legacy reader is repainted to its default; each keeps showing its stored value").toStrictEqual(STORED_READERS);
});

it("§6 an already-absent reset completes through verified no-ops: zero removes, zero writes, Defaults restored", async () => {
  const ui = mount();
  await flush();
  const from = mark();
  clickReset(ui, true);
  await flush(24);
  expect(featureWrites(from), "§6: already-absent keys complete through the engine's verified no-op; nothing is removed or seeded").toEqual([]);
  expect(bytesAll()).toStrictEqual(allOf(null));
  expect(shownAll(ui)).toStrictEqual(allOf(true));
  expect(says(W.en.restored), "H9: Defaults restored after 8 verified no-ops").toBe(true);
  expect(blocking()).toBe(false);
});

// ---- Per-field refusal (H5) ------------------------------------------------------------------------

describe.each(FIELDS)("H5 $id", field => {
  it(`H5 ${field.id}: a refused removal keeps a reset draft that displays on with failure feedback, Retry, Discard, Export and guard; Retry removes only that key and never writes true`, async () => {
    seedAllFalse();
    const refusal = fault({ op: "remove", key: field.key, label: `${field.id} remove refused` });
    const ui = mount();
    await flush();
    const from = mark();
    clickReset(ui, true);
    await flush(24);
    fired(refusal, `${field.id} remove`);
    expect(bytesAll(), "only the refused key keeps its bytes").toStrictEqual({ ...allOf(null), [field.id]: "false" });
    expect(shown(ui, field), "the reset draft displays the intended default").toBe(true);
    expect(says(msg.notReset(field)), `H5: "${msg.notReset(field)}" failure feedback`).toBe(true);
    const retry = need(retryOf(ui, field), `H5/H9: Retry ${field.label}`);
    need(discardOf(ui, field), `H9: Discard ${field.label}`);
    for (const sibling of others(field)) {
      expect(retryOf(ui, sibling), `${sibling.id}: a verified sibling has no recovery`).toBeNull();
      expect(says(msg.notReset(sibling)), `${sibling.id}: no failure feedback`).toBe(false);
    }
    expect(says(W.en.restored), "no Defaults restored while one reset is unresolved").toBe(false);
    expect(blocking(), "the unresolved reset is guarded").toBe(true);
    expect(warns(), "the unresolved reset warns on beforeunload").toBe(true);
    const harness = download();
    fireEvent.click(need(exportButton(ui), "H9: Export Features draft"));
    await flush(2);
    await expectSingleDownload(harness, only(field.id, RESET), "sparse reset export");
    refusal.off();
    const retried = mark();
    fireEvent.click(retry);
    await flush();
    expect(writesOn(retried, field), "Retry re-attempts the removal only, exactly once").toEqual(["<remove>"]);
    expect(featureWrites(retried).filter(entry => !entry.endsWith(field.key)), "successful fields are never removed again").toEqual([]);
    expect(attempts(from, KEYS, ["set"]).map(item => item.key), "a reset draft never writes true").toEqual([]);
    expect(bytes(field)).toBeNull();
    expect(retryOf(ui, field)).toBeNull();
    expect(says(msg.notReset(field))).toBe(false);
    expect(says(W.en.restored), "Defaults restored once all 8 resets completed").toBe(true);
    expect(blocking()).toBe(false);
    expect(rejections).toEqual([]);
  });
});

it("H5 (reader layer) with Calendar's removal refused, the real useFeaturePrefs rail input restores the other 7 and keeps Calendar off", async () => {
  seedAllFalse();
  const refusal = fault({ op: "remove", key: calendar.key, label: "calendar remove refused" });
  const ui = mount("en", { extra: <RailInput /> });
  await flush();
  pre(JSON.stringify(probe("sol-rail-input")) === "[]", "the rail input hides all 8 modules before the reset");
  clickReset(ui, true);
  await flush(24);
  fired(refusal, "calendar remove");
  expect(bytes(calendar), "Calendar's bytes stay false").toBe("false");
  expect(probe("sol-rail-input"), "H5: readers reflect committed bytes only; Calendar stays off while the other 7 are restored").toEqual(IDS.filter(id => id !== "calendar"));
  expect(shown(ui, calendar), "the pane shows the Calendar reset draft as on").toBe(true);
});

it("§6 partial reset: only unresolved fields remain drafts, export entries and guard reasons; Retry targets only them", async () => {
  seedAllFalse();
  const boardRefusal = fault({ op: "remove", key: board.key, label: "board remove refused" });
  const habitsRefusal = fault({ op: "remove", key: habits.key, label: "habits remove refused" });
  const ui = mount();
  await flush();
  const from = mark();
  clickReset(ui, true);
  await flush(24);
  fired(boardRefusal, "board remove");
  fired(habitsRefusal, "habits remove");
  expect(bytesAll(), "only the two refused keys keep their bytes").toStrictEqual({ ...allOf(null), board: "false", habits: "false" });
  expect(says(msg.notReset(board)), "H5: Boards failure feedback").toBe(true);
  expect(says(msg.notReset(habits)), "H5: Habits failure feedback").toBe(true);
  for (const field of FIELDS.filter(entry => entry !== board && entry !== habits)) expect(retryOf(ui, field), `${field.id} resolved`).toBeNull();
  let harness = download();
  fireEvent.click(need(exportButton(ui), "H9: Export Features draft"));
  await flush(2);
  await expectSingleDownload(harness, envelope({ board: RESET, habits: RESET }), "partial reset export");
  expect(blocking()).toBe(true);
  boardRefusal.off();
  const retried = mark();
  fireEvent.click(need(retryOf(ui, board), "H9: Retry Boards"));
  await flush();
  expect(writesOn(retried, board), "the Boards Retry removes once").toEqual(["<remove>"]);
  expect(touches(retried, others(board)), "the Boards Retry never touches a sibling").toEqual([]);
  expect(retryOf(ui, board)).toBeNull();
  need(retryOf(ui, habits), "Habits stays unresolved");
  expect(says(W.en.restored)).toBe(false);
  expect(blocking()).toBe(true);
  harness = download();
  fireEvent.click(need(exportButton(ui), "Export Features draft after a partial Retry"));
  await flush(2);
  await expectSingleDownload(harness, only("habits", RESET), "export keeps only the unresolved reset");
  habitsRefusal.off();
  fireEvent.click(need(retryOf(ui, habits), "Retry Habits"));
  await flush();
  for (const field of FIELDS) expect(removesOn(from, field), `${field.id}: remove attempts`).toBe(field === board || field === habits ? 2 : 1);
  expect(bytesAll()).toStrictEqual(allOf(null));
  expect(says(W.en.restored)).toBe(true);
  expect(blocking()).toBe(false);
});

it("H3 §6 a duplicate Reset to defaults while the batch is pending enqueues no duplicate removes", async () => {
  seedAllFalse();
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(calendar));
  const from = mark();
  clickReset(ui, true);
  await flush();
  expect(bytes(calendar), "H3: the held per-key lock keeps the pending Calendar removal from running").toBe("false");
  expect(says(msg.resetting(calendar)), `pending feedback "${msg.resetting(calendar)}"`).toBe(true);
  const again = resetButtons(ui);
  if (again.length === 1) {
    confirmer.answer = true;
    fireEvent.click(again[0]!);
    await flush();
  }
  await lock.release();
  for (const field of FIELDS) expect(removesOn(from, field), `${field.id}: exactly one remove attempt across both activations`).toBe(1);
  expect(bytesAll()).toStrictEqual(allOf(null));
  expect(says(W.en.restored)).toBe(true);
  expect(blocking()).toBe(false);
});

it("§6 REL-07 an invalid source refuses the reset and keeps the reset intent; Reset never purges malformed bytes", async () => {
  seed(tasks, "yes");
  seed(board, "false");
  const ui = mount();
  await flush();
  clickReset(ui, true);
  await flush(24);
  expect(bytes(tasks), "§6: Reset is never authority to purge malformed bytes").toBe("yes");
  expect(bytes(board), "the valid sibling is removed").toBeNull();
  expect(says(msg.notReset(tasks)), "the refused reset is reported").toBe(true);
  const retry = need(retryOf(ui, tasks), "H9: Retry Tasks");
  need(discardOf(ui, tasks), "H9: Discard Tasks");
  expect(shown(ui, tasks), "the reset draft displays the intended default").toBe(true);
  expect(blocking()).toBe(true);
  expect(says(W.en.restored)).toBe(false);
  const harness = download();
  fireEvent.click(need(exportButton(ui), "Export Features draft"));
  await flush(2);
  await expectSingleDownload(harness, only("tasks", RESET), "reset intent over an invalid source");
  const retried = mark();
  fireEvent.click(retry);
  await flush();
  expect(writesOn(retried, tasks), "Retry still refuses to purge").toEqual([]);
  expect(bytes(tasks)).toBe("yes");
  need(retryOf(ui, tasks), "the reset intent is kept until legitimate recovery or Discard");
  const discarded = mark();
  fireEvent.click(need(discardOf(ui, tasks), "Discard Tasks"));
  await flush();
  expect(featureWrites(discarded), "Discard makes zero set/remove attempts").toEqual([]);
  expect(says(msg.unavailable(tasks)), "Discard returns to the source-only alert").toBe(true);
  need(reloadOf(ui, tasks), "the source-only Reload returns");
  expect(blocking()).toBe(false);
});

it("§6 an unavailable source refuses the reset and keeps the reset intent; Discard returns to Reload-only", async () => {
  seed(meditation, "false");
  const denied = fault({ op: "get", key: meditation.key, label: "meditation read denied" });
  const ui = mount();
  await flush();
  fired(denied, "meditation mount read");
  clickReset(ui, true);
  await flush(24);
  expect(bytes(meditation), "§6: an unreadable source is never removed blindly").toBe("false");
  expect(says(msg.notReset(meditation)), "the refused reset is reported").toBe(true);
  need(retryOf(ui, meditation), "H9: Retry Meditation");
  expect(blocking()).toBe(true);
  const from = mark();
  fireEvent.click(need(discardOf(ui, meditation), "H9: Discard Meditation"));
  await flush();
  expect(featureWrites(from), "Discard makes zero set/remove attempts").toEqual([]);
  need(reloadOf(ui, meditation), "the source-only Reload returns while reads are denied");
  expect(blocking()).toBe(false);
});

it("§6 a removal whose readback is denied stays a reset draft; Retry verifies absence with exactly one total remove", async () => {
  seed(dashboard, "false");
  const ui = mount();
  await flush();
  const readback = fault({ op: "get", key: dashboard.key, after: { op: "remove", key: dashboard.key }, times: 1, label: "post-remove dashboard read" });
  const from = mark();
  clickReset(ui, true);
  await flush(24);
  pre(readback.armed && removesOn(from, dashboard) === 1 && bytes(dashboard) === null, "the removal physically happened and armed the denied readback");
  expect(readback.fired, "§6: Reset verifies absence by reading the key back").toBe(1);
  expect(shown(ui, dashboard)).toBe(true);
  expect(says(msg.notReset(dashboard)), "an unverified removal is reported as not reset").toBe(true);
  const retry = need(retryOf(ui, dashboard), "H9: Retry Dashboard");
  expect(says(W.en.restored), "no Defaults restored for an unverified removal").toBe(false);
  expect(blocking()).toBe(true);
  fireEvent.click(retry);
  await flush();
  expect(removesOn(from, dashboard), "Retry verifies absence with exactly one total remove").toBe(1);
  expect(retryOf(ui, dashboard)).toBeNull();
  expect(says(W.en.restored)).toBe(true);
  expect(blocking()).toBe(false);
});

it("H3 §6 a conflict during a held reset preserves the external bytes and the reset draft; Retry never removes them", async () => {
  seed(pomodoro, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(pomodoro));
  clickReset(ui, true);
  await flush();
  expect(bytes(pomodoro), "H3: the held per-key lock keeps the pending removal from running").toBe("false");
  nativeSet.call(localStorage, pomodoro.key, "true");
  await lock.release();
  expect(bytes(pomodoro), "the external replacement is preserved").toBe("true");
  expect(shown(ui, pomodoro), "the reset draft displays the intended default").toBe(true);
  const retry = need(retryOf(ui, pomodoro), "H9: Retry Pomodoro");
  need(discardOf(ui, pomodoro), "H9: Discard Pomodoro");
  expect(says(W.en.restored)).toBe(false);
  expect(blocking()).toBe(true);
  const from = mark();
  fireEvent.click(retry);
  await flush();
  expect(writesOn(from, pomodoro), "Retry never gains authority to remove the external bytes").toEqual([]);
  expect(bytes(pomodoro)).toBe("true");
  need(retryOf(ui, pomodoro), "the conflict stays preserved");
});

it("§6 an unrelated field still saves while another field's reset recovery is blocked", async () => {
  seed(habits, "false");
  const refusal = fault({ op: "remove", key: habits.key, label: "habits remove refused" });
  const ui = mount();
  await flush();
  clickReset(ui, true);
  await flush(24);
  fired(refusal, "habits remove");
  expect(says(msg.notReset(habits)), "H5: Habits failure feedback").toBe(true);
  toggle(ui, tasks);
  await flush();
  expect(bytes(tasks), "the unrelated field saves").toBe("false");
  expect(retryOf(ui, tasks)).toBeNull();
  need(retryOf(ui, habits), "the Habits reset recovery remains");
  expect(blocking()).toBe(true);
});

it("H9 §6 Defaults restored appears only when all 8 resets completed; a held reset reports it is being reset", async () => {
  seed(meditation, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(meditation));
  clickReset(ui, true);
  await flush();
  expect(bytes(meditation), "H3: the held per-key lock keeps the pending removal from running").toBe("false");
  expect(says(msg.resetting(meditation)), `pending feedback "${msg.resetting(meditation)}"`).toBe(true);
  expect(says(W.en.restored), "no Defaults restored while one reset is pending").toBe(false);
  expect(blocking(), "the pending reset is guarded").toBe(true);
  await lock.release();
  expect(bytes(meditation)).toBeNull();
  expect(says(msg.resetting(meditation)), "pending feedback clears").toBe(false);
  expect(says(W.en.restored), "H9: Defaults restored after the last reset completed").toBe(true);
  expect(blocking()).toBe(false);
});

it("INV §6 §7 Reset to defaults needs no active account: it removes all 8 while the account scope is locked", async () => {
  seedAllFalse();
  const ui = mount();
  await flush();
  lockAccount();
  await flush();
  clickReset(ui, true);
  await flush(24);
  expect(bytesAll(), "the batch works while locked").toStrictEqual(allOf(null));
  expect(accountTouches(), "no account physical key is touched").toEqual([]);
});

it("§5.7 one field's set fails while another field's reset succeeds; each settles independently", async () => {
  seed(board, "false");
  const ui = mount();
  await flush();
  clickReset(ui, true);
  await flush(24);
  expect(bytes(board), "the Boards reset succeeded").toBeNull();
  const quota = fault({ op: "set", key: tasks.key, label: "tasks quota" });
  toggle(ui, tasks);
  await flush();
  fired(quota, "tasks write");
  expect(shown(ui, tasks), "H1: the failed set keeps the latest choice").toBe(false);
  expect(says(msg.notSaved(tasks))).toBe(true);
  expect(says(msg.notReset(board))).toBe(false);
  expect(retryOf(ui, board)).toBeNull();
  expect(says(W.en.restored), "a newer contrary edit supersedes Defaults restored").toBe(false);
  expect(blocking()).toBe(true);
  quota.off();
  fireEvent.click(need(retryOf(ui, tasks), "H9: Retry Tasks"));
  await flush();
  expect(bytes(tasks)).toBe("false");
  expect(blocking()).toBe(false);
});

it("§5.7 one field's reset fails while another field's set succeeds; each settles independently", async () => {
  seed(board, "false");
  const refusal = fault({ op: "remove", key: board.key, label: "board remove refused" });
  const ui = mount();
  await flush();
  clickReset(ui, true);
  await flush(24);
  fired(refusal, "board remove");
  expect(says(msg.notReset(board)), "H5: Boards failure feedback").toBe(true);
  toggle(ui, tasks);
  await flush();
  expect(bytes(tasks), "the set saves independently").toBe("false");
  expect(retryOf(ui, tasks)).toBeNull();
  need(retryOf(ui, board), "the failed reset keeps Retry Boards");
  expect(blocking()).toBe(true);
  refusal.off();
  fireEvent.click(need(retryOf(ui, board), "Retry Boards"));
  await flush();
  expect(bytes(board)).toBeNull();
  expect(bytes(tasks), "the Boards reset Retry never touches Tasks").toBe("false");
  expect(blocking()).toBe(false);
});

it("§6 repeating an unchanged failed reset keeps its refusal; it never rebases or writes", async () => {
  seed(calendar, "false");
  const refusal = fault({ op: "remove", key: calendar.key, label: "calendar remove refused" });
  const ui = mount();
  await flush();
  clickReset(ui, true);
  await flush(24);
  fired(refusal, "calendar remove");
  expect(says(msg.notReset(calendar)), "H5: Calendar failure feedback").toBe(true);
  const from = mark();
  fireEvent.click(need(retryOf(ui, calendar), "H9: Retry Calendar"));
  await flush();
  expect(refusal.fired, "Retry re-attempted the removal").toBe(2);
  expect(attempts(from, [calendar.key], ["set"]), "a repeated reset never writes").toEqual([]);
  expect(bytes(calendar)).toBe("false");
  need(retryOf(ui, calendar), "the refusal is kept");
  expect(says(msg.notReset(calendar))).toBe(true);
  refusal.off();
  fireEvent.click(need(retryOf(ui, calendar), "Retry Calendar after the refusal is lifted"));
  await flush();
  expect(bytes(calendar)).toBeNull();
  expect(says(W.en.restored)).toBe(true);
});

it("§6 a clean completed batch may later receive a fresh reset; an intervening edit is a new intent", async () => {
  seed(board, "false");
  const ui = mount();
  await flush();
  clickReset(ui, true);
  await flush(24);
  expect(bytes(board)).toBeNull();
  expect(says(W.en.restored), "H9: Defaults restored after the first batch").toBe(true);
  toggle(ui, board);
  await flush();
  expect(bytes(board)).toBe("false");
  expect(says(W.en.restored), "the intervening edit supersedes the earlier Defaults restored").toBe(false);
  const from = mark();
  clickReset(ui, true);
  await flush(24);
  expect(removesOn(from, board), "the fresh reset removes the new bytes once").toBe(1);
  expect(bytes(board)).toBeNull();
  expect(says(W.en.restored)).toBe(true);
});

it("§5 ZH reset wording: pending, not reset and Defaults restored", async () => {
  seed(matrix, "false");
  seed(habits, "false");
  const refusal = fault({ op: "remove", key: habits.key, label: "habits remove refused" });
  const ui = mount("zh");
  await flush();
  const lock = await hold(keyLock(matrix));
  clickReset(ui, true);
  await flush();
  fired(refusal, "habits remove");
  expect(says(msg.resetting(matrix, "zh")), "ZH pending reset feedback").toBe(true);
  expect(says(msg.notReset(habits, "zh")), "ZH not-reset feedback").toBe(true);
  const retry = need(button(ui, "重试 习惯"), "ZH Retry action");
  await lock.release();
  refusal.off();
  fireEvent.click(retry);
  await flush();
  expect(says(W.zh.restored), "ZH Defaults restored").toBe(true);
});
