/**
 * Mode `queues` (contract section 12): section 5 items 4–6 shown fully for the Boards switch, the held per-key
 * lock (H3) and same-turn double activation (H4) for all 8 switches, and the section 6 set/reset orderings on
 * two fields (Habits and Matrix).
 *
 * Held-lock cases take the real `prefMutationLockName("xai_pref_features_<id>")` lock through the exclusive
 * fixture; the product's own request must queue behind it.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import {
  blocking, board, bytes, clickReset, discardOf, download, enabled, envelope, expectSingleDownload, exportButton, fault, FIELDS, fired,
  flush, guard, habits, hold, keyLock, locks, mark, matrix, mount, msg, nativeRemove, nativeSet, need, pre, raw, rejections, removesOn,
  RESET, retryOf, says, seed, SET, setup, shown, switchOf, teardown, toggle, W, warns, writesOn, type Field,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

// Boards plan: stored "false"; the predecessor turns it on, the latest turns it back off.
const B = board;

it("Q1 Boards: the predecessor succeeds while the latest fails; Retry settles only the latest", async () => {
  seed(B, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(B));
  const failLatest = fault({ op: "set", key: B.key, value: "false", label: "latest quota" });
  toggle(ui, B);
  toggle(ui, B);
  await flush();
  expect(bytes(B), "H3: both choices wait behind the held per-key lock").toBe("false");
  await lock.release();
  fired(failLatest, "latest write");
  expect(shown(ui, B), "H1: the latest choice stays displayed").toBe(false);
  expect(bytes(B), "the predecessor committed").toBe("true");
  expect(says(msg.notSaved(B)), "failed feedback for the latest").toBe(true);
  const retry = need(retryOf(ui, B), "H9: Retry Boards");
  expect(blocking(), "the failed latest stays guarded").toBe(true);
  expect(warns(), "the failed latest warns on beforeunload").toBe(true);
  expect(says(W.en.saved), "the predecessor's success is not a Saved for the latest").toBe(false);
  failLatest.off();
  const from = mark();
  fireEvent.click(retry);
  await flush();
  expect(writesOn(from, B), "Retry writes only the latest").toEqual(["false"]);
  expect(bytes(B)).toBe("false");
  expect(retryOf(ui, B)).toBeNull();
  expect(blocking()).toBe(false);
  expect(says(W.en.saved)).toBe(true);
  expect(rejections).toEqual([]);
});

it("Q2 Boards: a failed predecessor blocks the queued latest; repeated predecessor failure; Retry advances the predecessor without acknowledging the latest", async () => {
  seed(B, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(B));
  const failFirst = fault({ op: "set", key: B.key, value: "true", label: "predecessor quota" });
  const failLatest = fault({ op: "set", key: B.key, value: "false", label: "latest quota" });
  toggle(ui, B);
  toggle(ui, B);
  await flush();
  expect(bytes(B), "H3: both choices wait behind the held per-key lock").toBe("false");
  await lock.release();
  fired(failFirst, "predecessor write");
  expect(shown(ui, B), "H1: the latest choice stays displayed").toBe(false);
  expect(bytes(B), "nothing committed").toBe("false");
  const retry = need(retryOf(ui, B), "H9: Retry Boards");
  expect(blocking()).toBe(true);
  expect(says(W.en.saved)).toBe(false);
  fireEvent.click(retry);
  await flush();
  fired(failFirst, "repeated predecessor write", 2);
  expect(bytes(B), "the repeated predecessor failure writes nothing").toBe("false");
  need(retryOf(ui, B), "the field stays recoverable after a repeated predecessor failure");
  expect(blocking()).toBe(true);
  failFirst.off();
  fireEvent.click(need(retryOf(ui, B), "Retry Boards after the predecessor fault is lifted"));
  await flush();
  fired(failLatest, "latest write after the predecessor advanced");
  expect(bytes(B), "Retry advanced the predecessor").toBe("true");
  expect(shown(ui, B), "the latest choice is still displayed").toBe(false);
  need(retryOf(ui, B), "the predecessor's success never acknowledges the failed latest");
  expect(says(W.en.saved), "no Saved while the latest is unresolved").toBe(false);
  expect(blocking()).toBe(true);
  failLatest.off();
  fireEvent.click(need(retryOf(ui, B), "Retry Boards for the latest"));
  await flush();
  expect(bytes(B)).toBe("false");
  expect(retryOf(ui, B)).toBeNull();
  expect(blocking()).toBe(false);
  expect(says(W.en.saved)).toBe(true);
});

it("Q3 Boards: a Retry while the field is pending is inert", async () => {
  seed(B, "false");
  const ui = mount();
  await flush();
  const quota = fault({ op: "set", key: B.key, label: "quota" });
  toggle(ui, B);
  await flush();
  fired(quota, "first write");
  expect(shown(ui, B), "H1: the failed choice stays displayed").toBe(true);
  const retry = need(retryOf(ui, B), "H9: Retry Boards");
  const lock = await hold(keyLock(B));
  quota.off();
  const from = mark();
  fireEvent.click(retry);
  await flush(2);
  fireEvent.click(retry);
  const current = retryOf(ui, B);
  if (current && current !== retry) fireEvent.click(current);
  await flush();
  expect(writesOn(from, B), "nothing is written while the lock is held").toEqual([]);
  await lock.release();
  expect(writesOn(from, B), "a pending Retry is inert: exactly one write after release").toEqual(["true"]);
  expect(bytes(B)).toBe("true");
  expect(retryOf(ui, B)).toBeNull();
  expect(blocking()).toBe(false);
});

it("Q4 Boards: an equal-value successor after intervening input stays its own operation", async () => {
  seed(B, "false");
  const ui = mount();
  await flush();
  toggle(ui, B);
  await flush();
  expect(bytes(B), "first choice saved").toBe("true");
  toggle(ui, B);
  await flush();
  expect(bytes(B), "intervening choice saved").toBe("false");
  const quota = fault({ op: "set", key: B.key, value: "true", label: "returning quota" });
  toggle(ui, B);
  await flush();
  fired(quota, "returning write");
  expect(shown(ui, B), "H1: the returning choice stays displayed").toBe(true);
  expect(bytes(B)).toBe("false");
  expect(says(msg.notSaved(B)), "an earlier equal-value success is not evidence for the newer attempt").toBe(true);
  const retry = need(retryOf(ui, B), "H9: Retry Boards");
  expect(says(W.en.saved)).toBe(false);
  expect(blocking()).toBe(true);
  quota.off();
  fireEvent.click(retry);
  await flush();
  expect(bytes(B)).toBe("true");
  expect(retryOf(ui, B)).toBeNull();
  expect(blocking()).toBe(false);
});

it("Q5 Boards: uncertainty keeps its grant across a denied read and a denied lock and reconciles with exactly one total write", async () => {
  seed(B, "false");
  const ui = mount();
  await flush();
  const from = mark();
  const readback = fault({ op: "get", key: B.key, after: { op: "set", key: B.key, value: "true" }, times: 1, label: "post-write read" });
  toggle(ui, B);
  await flush();
  fired(readback, "post-write read");
  pre(bytes(B) === "true", "the uncertain write physically reached storage");
  expect(shown(ui, B)).toBe(true);
  need(retryOf(ui, B), "H9: an uncertain write keeps Retry Boards");
  expect(says(W.en.saved), "no Saved for an unverified write").toBe(false);
  expect(blocking()).toBe(true);
  const deniedRead = fault({ op: "get", key: B.key, times: 1, label: "denied verification read" });
  fireEvent.click(need(retryOf(ui, B), "Retry under a denied read"));
  await flush();
  expect(deniedRead.fired, "the Retry verification attempted a read").toBe(1);
  need(retryOf(ui, B), "the grant survives a temporarily denied read");
  expect(says(W.en.saved)).toBe(false);
  const manager = locks();
  const before = manager.log.length;
  manager.deny(keyLock(B));
  fireEvent.click(need(retryOf(ui, B), "Retry under a denied lock"));
  await flush();
  expect(manager.rejectedFor(keyLock(B), before), "the Retry requested the denied per-key lock").toBeGreaterThan(0);
  need(retryOf(ui, B), "the grant survives a temporarily denied lock");
  expect(says(W.en.saved)).toBe(false);
  manager.allow(keyLock(B));
  fireEvent.click(need(retryOf(ui, B), "Retry after restoration"));
  await flush();
  expect(writesOn(from, B), "the uncertainty reconciles with exactly one total write").toEqual(["true"]);
  expect(bytes(B)).toBe("true");
  expect(retryOf(ui, B)).toBeNull();
  expect(blocking()).toBe(false);
  expect(says(W.en.saved)).toBe(true);
});

it("Q6 Boards: an external replacement stays a preserved conflict; repeated Retry never overwrites; Discard rereads with zero writes", async () => {
  seed(B, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(B));
  toggle(ui, B);
  await flush();
  expect(bytes(B), "H3: the held per-key lock serializes the write").toBe("false");
  nativeSet.call(localStorage, B.key, "true");
  pre(bytes(B) === "true", "external replacement present");
  await lock.release();
  expect(bytes(B), "the external replacement is preserved").toBe("true");
  expect(shown(ui, B), "H1: the latest choice stays displayed").toBe(true);
  const retry = need(retryOf(ui, B), "H9: Retry Boards");
  need(discardOf(ui, B), "H9: Discard Boards");
  expect(blocking()).toBe(true);
  expect(says(W.en.saved)).toBe(false);
  const from = mark();
  fireEvent.click(retry);
  await flush();
  fireEvent.click(retryOf(ui, B) ?? retry);
  await flush();
  expect(writesOn(from, B), "repeated Retry never gains authority to overwrite").toEqual([]);
  expect(bytes(B)).toBe("true");
  need(retryOf(ui, B), "the conflict stays preserved");
  const discarded = mark();
  fireEvent.click(need(discardOf(ui, B), "Discard Boards on the conflict"));
  await flush();
  expect(writesOn(discarded, B), "Discard makes zero set/remove attempts").toEqual([]);
  expect(shown(ui, B), "Discard rereads the external value").toBe(true);
  expect(retryOf(ui, B)).toBeNull();
  expect(blocking()).toBe(false);
  expect(bytes(B)).toBe("true");
});

it("Q7 Boards: an external removal stays a preserved conflict; Retry never recreates the key; Discard shows the default", async () => {
  seed(B, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(B));
  toggle(ui, B);
  await flush();
  expect(bytes(B), "H3: the held per-key lock serializes the write").toBe("false");
  nativeRemove.call(localStorage, B.key);
  pre(bytes(B) === null, "external removal present");
  await lock.release();
  expect(bytes(B), "the external removal is preserved").toBeNull();
  expect(shown(ui, B), "H1: the latest choice stays displayed").toBe(true);
  const retry = need(retryOf(ui, B), "H9: Retry Boards");
  need(discardOf(ui, B), "H9: Discard Boards");
  expect(blocking()).toBe(true);
  const from = mark();
  fireEvent.click(retry);
  await flush();
  fireEvent.click(retryOf(ui, B) ?? retry);
  await flush();
  expect(writesOn(from, B), "repeated Retry never recreates the removed key").toEqual([]);
  expect(bytes(B)).toBeNull();
  need(retryOf(ui, B), "the removal conflict stays preserved");
  const discarded = mark();
  fireEvent.click(need(discardOf(ui, B), "Discard Boards on the removal"));
  await flush();
  expect(writesOn(discarded, B), "Discard makes zero set/remove attempts").toEqual([]);
  expect(shown(ui, B), "Discard shows the registry default for the absent key").toBe(true);
  expect(retryOf(ui, B)).toBeNull();
  expect(blocking()).toBe(false);
});

it("Q8 Boards: an uncertain write whose original bytes are externally restored stays a conflict; a distinct new choice is a new operation", async () => {
  seed(B, "false");
  const ui = mount();
  await flush();
  const readback = fault({ op: "get", key: B.key, after: { op: "set", key: B.key, value: "true" }, times: 1, label: "post-write read" });
  toggle(ui, B);
  await flush();
  fired(readback, "post-write read");
  pre(bytes(B) === "true", "the uncertain write physically reached storage");
  const retry = need(retryOf(ui, B), "H9: an uncertain write keeps Retry Boards");
  nativeSet.call(localStorage, B.key, "false");
  pre(bytes(B) === "false", "original baseline bytes restored externally");
  const from = mark();
  fireEvent.click(retry);
  await flush();
  expect(bytes(B), "the restored original bytes are preserved").toBe("false");
  need(retryOf(ui, B), "the external restoration stays a conflict");
  expect(says(W.en.saved)).toBe(false);
  expect(blocking()).toBe(true);
  fireEvent.click(retryOf(ui, B) ?? retry);
  await flush();
  expect(writesOn(from, B), "repeated Retry never gains authority to overwrite").toEqual([]);
  expect(bytes(B)).toBe("false");
  toggle(ui, B);
  await flush();
  expect(shown(ui, B), "the distinct new choice is displayed").toBe(false);
  expect(bytes(B), "the distinct new choice settles as its own operation").toBe("false");
  expect(retryOf(ui, B)).toBeNull();
  expect(blocking()).toBe(false);
});

it("Q9 Boards: new work after a discard survives; the discarded held operation never writes", async () => {
  seed(B, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(B));
  toggle(ui, B);
  await flush();
  expect(bytes(B), "H3: the held per-key lock serializes the write").toBe("false");
  const current = need(guard(), "§9: departure guard registered");
  expect(blocking(), "pending held work is protected").toBe(true);
  const from = mark();
  act(() => { current.discardDraft(); });
  await flush();
  expect(writesOn(from, B), "discard is zero-write").toEqual([]);
  expect(shown(ui, B), "discard returns to the stored value").toBe(false);
  expect(blocking()).toBe(false);
  toggle(ui, B);
  await flush();
  expect(shown(ui, B), "the new work is displayed").toBe(true);
  await lock.release();
  expect(writesOn(from, B), "only the new work is written; the discarded operation never writes").toEqual(["true"]);
  expect(bytes(B)).toBe("true");
  expect(shown(ui, B), "a late completion never revives discarded state").toBe(true);
  expect(retryOf(ui, B)).toBeNull();
  expect(blocking()).toBe(false);
  expect(says(W.en.saved)).toBe(true);
});

const alternating = FIELDS.map((field, index) => ({ field, id: field.id, stored: index % 2 === 0 ? null : "false" }));

describe.each(alternating)("H3 $id", ({ field, stored }) => {
  it(`H3 ${field.id}: a held per-key lock serializes the write while the latest choice shows immediately and the switch stays enabled`, async () => {
    if (stored !== null) seed(field, stored);
    const original = stored === null;
    const ui = mount();
    await flush();
    const lock = await hold(keyLock(field));
    const from = mark();
    toggle(ui, field);
    await flush();
    expect(shown(ui, field), "the latest choice displays immediately").toBe(!original);
    expect(bytes(field), "H3: the held per-key lock keeps the physical bytes unchanged").toBe(stored);
    expect(locks().waiting(keyLock(field), "product"), "H3: the write queues behind the held per-key lock").toBeGreaterThan(0);
    expect(says(msg.saving(field)), `pending feedback "${msg.saving(field)}"`).toBe(true);
    expect(enabled(ui, field), "the switch stays enabled while the operation is pending").toBe(true);
    expect(says(W.en.saved), "no Saved while pending").toBe(false);
    expect(blocking(), "pending work is protected by the guard").toBe(true);
    await lock.release();
    expect(writesOn(from, field), "exactly the latest bytes are written after release").toEqual([raw(!original)]);
    expect(bytes(field)).toBe(raw(!original));
    expect(shown(ui, field)).toBe(!original);
    expect(says(msg.saving(field)), "pending feedback clears").toBe(false);
    expect(blocking()).toBe(false);
    expect(says(W.en.saved)).toBe(true);
  });
});

describe.each(alternating)("H4 $id", ({ field, stored }) => {
  it(`H4 ${field.id}: two same-turn activations invert the latest intent and return to the original through two operations`, async () => {
    if (stored !== null) seed(field, stored);
    const original = stored === null;
    const ui = mount();
    await flush();
    const control = switchOf(ui, field);
    const from = mark();
    act(() => { control.click(); control.click(); });
    await flush();
    expect(shown(ui, field), "H4: the second activation inverts the latest intent, not the rendered closure").toBe(original);
    expect(bytes(field), "the stored value returns to the original value (on is stored as true)").toBe(raw(original));
    expect(writesOn(from, field), "two operations: the inversion and the return").toEqual([raw(!original), raw(original)]);
    expect(retryOf(ui, field)).toBeNull();
    expect(blocking()).toBe(false);
  });
});

it("H3 H4 two Boards activations during a held lock return to the original through two operations", async () => {
  seed(B, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(B));
  const from = mark();
  toggle(ui, B);
  await flush();
  expect(shown(ui, B), "the first activation displays immediately").toBe(true);
  expect(bytes(B), "H3: the held per-key lock keeps the first write pending").toBe("false");
  toggle(ui, B);
  await flush();
  expect(shown(ui, B), "H4: the second activation inverts the latest intent").toBe(false);
  expect(bytes(B), "H3: the held per-key lock keeps the second write pending").toBe("false");
  await lock.release();
  expect(writesOn(from, B), "two operations after release").toEqual(["true", "false"]);
  expect(bytes(B)).toBe("false");
  expect(retryOf(ui, B)).toBeNull();
  expect(blocking()).toBe(false);
});

// ---------------------------------------------------------------------------
// Section 6 orderings on two fields. Every field starts stored "false"; the other seven start absent, so
// their part of each Reset to defaults is a verified no-op.
// ---------------------------------------------------------------------------

describe.each([habits, matrix].map(field => ({ field, id: field.id })))("§6 orderings $id", ({ field }) => {
  const X: Field = field;

  it(`O1 ${X.id}: pending set → Reset to defaults; the reset is the latest intent and its completion governs`, async () => {
    seed(X, "false");
    const ui = mount();
    await flush();
    const lock = await hold(keyLock(X));
    toggle(ui, X);
    await flush();
    expect(bytes(X), "H3: the held per-key lock keeps the pending set from writing").toBe("false");
    clickReset(ui, true);
    await flush();
    expect(shown(ui, X), "the reset intent displays the default").toBe(true);
    expect(says(msg.resetting(X)), `pending reset feedback "${msg.resetting(X)}"`).toBe(true);
    expect(says(W.en.restored), "no Defaults restored while the reset is pending").toBe(false);
    expect(blocking(), "pending work is guarded").toBe(true);
    await lock.release();
    expect(bytes(X), "the latest reset leaves verified absence").toBeNull();
    expect(shown(ui, X)).toBe(true);
    expect(says(msg.notSaved(X)), "the superseded set never surfaces as a failure").toBe(false);
    expect(says(msg.notReset(X))).toBe(false);
    expect(retryOf(ui, X)).toBeNull();
    expect(says(W.en.restored), "H9: Defaults restored after all 8 matching resets completed").toBe(true);
    expect(blocking()).toBe(false);
    expect(rejections).toEqual([]);
  });

  it(`O2 ${X.id}: pending Reset to defaults → set; the newer set governs and Defaults restored is not claimed`, async () => {
    seed(X, "false");
    const ui = mount();
    await flush();
    const lock = await hold(keyLock(X));
    clickReset(ui, true);
    await flush();
    expect(bytes(X), "H3: the held per-key lock keeps the pending reset from removing").toBe("false");
    expect(shown(ui, X), "the pending reset displays the default").toBe(true);
    toggle(ui, X);
    await flush();
    expect(shown(ui, X), "the newer set displays immediately").toBe(false);
    await lock.release();
    expect(bytes(X), "the newer set's completion governs the stored value").toBe("false");
    expect(shown(ui, X)).toBe(false);
    expect(says(msg.notReset(X)), "the superseded reset never surfaces as a failure").toBe(false);
    expect(says(msg.notSaved(X))).toBe(false);
    expect(retryOf(ui, X)).toBeNull();
    expect(says(W.en.restored), "a newer contrary edit supersedes Defaults restored").toBe(false);
    expect(blocking()).toBe(false);
  });

  it(`O3 ${X.id}: reset → set → reset; the queued set is superseded silently and the final reset governs`, async () => {
    seed(X, "false");
    const ui = mount();
    await flush();
    const lock = await hold(keyLock(X));
    const from = mark();
    clickReset(ui, true);
    await flush();
    expect(bytes(X), "H3: the held per-key lock keeps the pending reset from removing").toBe("false");
    toggle(ui, X);
    await flush();
    expect(shown(ui, X)).toBe(false);
    clickReset(ui, true);
    await flush();
    expect(shown(ui, X), "the latest reset displays the default").toBe(true);
    await lock.release();
    expect(bytes(X), "verified absence").toBeNull();
    expect(writesOn(from, X).filter(entry => entry !== "<remove>"), "the superseded queued set never writes").toEqual([]);
    expect(says(msg.notSaved(X)), "the superseded set never surfaces as a failure").toBe(false);
    expect(says(msg.notReset(X))).toBe(false);
    expect(retryOf(ui, X)).toBeNull();
    expect(says(W.en.restored), "the final reset batch completed").toBe(true);
    expect(blocking()).toBe(false);
  });

  it(`O4 ${X.id}: a failed predecessor set → Reset to defaults; the reset succeeds and the failed set never surfaces`, async () => {
    seed(X, "false");
    const ui = mount();
    await flush();
    const quota = fault({ op: "set", key: X.key, label: `${X.id} quota` });
    toggle(ui, X);
    await flush();
    fired(quota, `${X.id} write`);
    expect(shown(ui, X), "H1: the failed set keeps the latest choice").toBe(true);
    need(retryOf(ui, X), `H9: Retry ${X.label}`);
    const from = mark();
    clickReset(ui, true);
    await flush();
    expect(bytes(X), "the latest reset removed the bytes").toBeNull();
    expect(attempts_set(from, X), "the reset never writes").toEqual([]);
    expect(shown(ui, X)).toBe(true);
    expect(says(msg.notSaved(X)), "the superseded failed set no longer surfaces").toBe(false);
    expect(retryOf(ui, X)).toBeNull();
    expect(says(W.en.restored)).toBe(true);
    expect(blocking()).toBe(false);
  });

  it(`O5 ${X.id}: a failed predecessor reset → set; the latest set governs and the failed reset never surfaces`, async () => {
    seed(X, "false");
    const ui = mount();
    await flush();
    const refusal = fault({ op: "remove", key: X.key, label: `${X.id} remove refused` });
    clickReset(ui, true);
    await flush();
    fired(refusal, `${X.id} remove`);
    expect(bytes(X), "the refused removal left the bytes").toBe("false");
    expect(says(msg.notReset(X)), `H5: "${msg.notReset(X)}" failure feedback`).toBe(true);
    expect(shown(ui, X), "the reset draft displays the intended default").toBe(true);
    toggle(ui, X);
    await flush();
    expect(shown(ui, X), "the latest set displays").toBe(false);
    expect(bytes(X)).toBe("false");
    expect(says(msg.notReset(X)), "the superseded failed reset no longer surfaces").toBe(false);
    expect(says(msg.notSaved(X))).toBe(false);
    expect(retryOf(ui, X)).toBeNull();
    expect(says(W.en.restored), "the newer set supersedes Defaults restored").toBe(false);
    expect(blocking()).toBe(false);
  });

  it(`O6 ${X.id}: a failed set and a failed reset with equal displayed values stay distinct intents`, async () => {
    seed(X, "false");
    const ui = mount();
    await flush();
    const quota = fault({ op: "set", key: X.key, value: "true", label: `${X.id} quota` });
    toggle(ui, X);
    await flush();
    fired(quota, `${X.id} write`);
    expect(shown(ui, X), "H1: the failed set displays on").toBe(true);
    const first = download();
    fireEvent.click(need(exportButton(ui), "H9: Export Features draft"));
    await flush(2);
    await expectSingleDownload(first, envelope({ [X.id]: SET(true) }), "failed set export");
    const refusal = fault({ op: "remove", key: X.key, label: `${X.id} remove refused` });
    const from = mark();
    clickReset(ui, true);
    await flush();
    fired(refusal, `${X.id} remove`);
    expect(shown(ui, X), "the reset draft also displays on").toBe(true);
    expect(says(msg.notReset(X)), "the latest intent is a reset, reported as not reset").toBe(true);
    expect(says(msg.notSaved(X)), "the superseded set is no longer reported").toBe(false);
    const second = download();
    fireEvent.click(need(exportButton(ui), "Export Features draft for the reset draft"));
    await flush(2);
    await expectSingleDownload(second, envelope({ [X.id]: RESET }), "failed reset export is a reset entry, never a saved default");
    refusal.off();
    quota.off();
    fireEvent.click(need(retryOf(ui, X), `Retry ${X.label} for the reset draft`));
    await flush();
    expect(bytes(X), "Retry of the reset draft removes").toBeNull();
    expect(attempts_set(from, X), "a reset draft's Retry never writes true").toEqual([]);
    expect(removesOn(from, X), "exactly two remove attempts: the refused one and the Retry").toBe(2);
    expect(retryOf(ui, X)).toBeNull();
    expect(blocking()).toBe(false);
  });

  it(`O7 ${X.id}: discard of a reset draft, then new same-field work survives`, async () => {
    seed(X, "false");
    const ui = mount();
    await flush();
    const refusal = fault({ op: "remove", key: X.key, label: `${X.id} remove refused` });
    clickReset(ui, true);
    await flush();
    fired(refusal, `${X.id} remove`);
    expect(says(msg.notReset(X)), `H5: "${msg.notReset(X)}" failure feedback`).toBe(true);
    const from = mark();
    fireEvent.click(need(discardOf(ui, X), `H9: Discard ${X.label}`));
    await flush();
    expect(writesOn(from, X), "Discard makes zero set/remove attempts").toEqual([]);
    expect(shown(ui, X), "Discard rereads the stored value").toBe(false);
    expect(blocking()).toBe(false);
    refusal.off();
    toggle(ui, X);
    await flush();
    expect(bytes(X), "the new same-field work is saved").toBe("true");
    expect(shown(ui, X)).toBe(true);
    expect(retryOf(ui, X)).toBeNull();
    expect(says(msg.notReset(X)), "the discarded reset never revives").toBe(false);
    expect(blocking()).toBe(false);
  });
});

function attempts_set(from: number, field: Field): string[] {
  return writesOn(from, field).filter(entry => entry !== "<remove>");
}
