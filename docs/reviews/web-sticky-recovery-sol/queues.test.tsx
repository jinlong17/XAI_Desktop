/**
 * Gate "Same-field queue attribution" (contract section 13), shown for the palette (string) and the
 * Pin by Default switch (boolean), plus H5 (same-turn switch activations) and H6 (per-key lock) for all five.
 *
 * Held-lock cases take the real `prefMutationLockName("xai_pref_sticky_<field>")` lock through the
 * exclusive fixture; the product's own request must queue behind it.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import {
  blocking, bytes, cases, chooseAlt, choose, color, discardOf, enabled, fault, fired, flush, guard, hold, keyLock, locks, mark, mount, msg,
  nativeRemove, nativeSet, need, pin, pre, raw, rejections, restore, retryOf, says, seed, setup, shown, stickyWrites, switchOf, teardown,
  toggle, W, warns, writesOn, type FieldCase, type Ui, type Value,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

interface Plan {
  readonly name: string;
  readonly entry: FieldCase;
  readonly seed: Value;
  /** Predecessor choice from `seed`. */
  readonly first: Value;
  /** Latest choice after `first`. */
  readonly latest: Value;
  /** External replacement written while the predecessor is held. */
  readonly external: Value;
  /** Choice whose post-write verification read is faulted (one edit from `seed`). */
  readonly uncertain: Value;
  /** A distinct new choice after the uncertain conflict. */
  readonly fresh: Value;
  /** New work chosen after a discard (one edit from `seed`). */
  readonly renewed: Value;
  /** Performs the next choice through the public control (a switch inverts its latest intent). */
  perform(ui: Ui, value: Value): void;
}
const plans: readonly Plan[] = [
  { name: "palette", entry: color, seed: "sky", first: "coral", latest: "mint", external: "graphite", uncertain: "navy", fresh: "indigo", renewed: "mint", perform: (ui, value) => choose(ui, color, value) },
  { name: "switch", entry: pin, seed: false, first: true, latest: false, external: true, uncertain: true, fresh: false, renewed: true, perform: ui => toggle(ui, pin) },
];

describe.each(plans)("$name", p => {
  const e = p.entry;

  it(`Q1 ${p.name}: the predecessor succeeds while the latest fails; Retry settles only the latest`, async () => {
    seed(e, raw(p.seed));
    const ui = mount();
    await flush();
    const lock = await hold(keyLock(e));
    const failLatest = fault({ op: "set", key: e.key, value: raw(p.latest), label: "latest quota" });
    p.perform(ui, p.first);
    p.perform(ui, p.latest);
    await flush();
    expect(bytes(e), "H6: both choices wait behind the held per-key lock").toBe(raw(p.seed));
    await lock.release();
    fired(failLatest, "latest write");
    expect(shown(ui, e), "H1: the latest choice stays displayed").toBe(p.latest);
    expect(bytes(e), "the predecessor committed").toBe(raw(p.first));
    expect(says(msg.notSaved(e)), "failed feedback for the latest").toBe(true);
    const retry = need(retryOf(ui, e), `H8: Retry ${e.label}`);
    expect(blocking(), "the failed latest stays guarded").toBe(true);
    expect(warns(), "the failed latest warns on beforeunload").toBe(true);
    expect(says(W.en.saved), "the predecessor's success is not a Saved for the latest").toBe(false);
    failLatest.off();
    const from = mark();
    fireEvent.click(retry);
    await flush();
    expect(writesOn(from, e), "Retry writes only the latest").toEqual([raw(p.latest)]);
    expect(bytes(e)).toBe(raw(p.latest));
    expect(retryOf(ui, e)).toBeNull();
    expect(blocking()).toBe(false);
    expect(says(W.en.saved)).toBe(true);
    expect(rejections).toEqual([]);
  });

  it(`Q2 ${p.name}: a failed predecessor blocks the queued latest; repeated predecessor failure; Retry advances the predecessor without acknowledging the latest`, async () => {
    seed(e, raw(p.seed));
    const ui = mount();
    await flush();
    const lock = await hold(keyLock(e));
    const failFirst = fault({ op: "set", key: e.key, value: raw(p.first), label: "predecessor quota" });
    const failLatest = fault({ op: "set", key: e.key, value: raw(p.latest), label: "latest quota" });
    p.perform(ui, p.first);
    p.perform(ui, p.latest);
    await flush();
    expect(bytes(e), "H6: both choices wait behind the held per-key lock").toBe(raw(p.seed));
    await lock.release();
    fired(failFirst, "predecessor write");
    expect(shown(ui, e), "H1: the latest choice stays displayed").toBe(p.latest);
    expect(bytes(e), "nothing committed").toBe(raw(p.seed));
    const retry = need(retryOf(ui, e), `H8: Retry ${e.label}`);
    expect(blocking()).toBe(true);
    expect(says(W.en.saved)).toBe(false);
    fireEvent.click(retry);
    await flush();
    fired(failFirst, "repeated predecessor write", 2);
    expect(bytes(e), "the repeated predecessor failure writes nothing").toBe(raw(p.seed));
    need(retryOf(ui, e), "the field stays recoverable after a repeated predecessor failure");
    expect(blocking()).toBe(true);
    failFirst.off();
    fireEvent.click(need(retryOf(ui, e), `Retry ${e.label} after the predecessor fault is lifted`));
    await flush();
    fired(failLatest, "latest write after the predecessor advanced");
    expect(bytes(e), "Retry advanced the predecessor").toBe(raw(p.first));
    expect(shown(ui, e), "the latest choice is still displayed").toBe(p.latest);
    need(retryOf(ui, e), "the predecessor's success never acknowledges the failed latest");
    expect(says(W.en.saved), "no Saved while the latest is unresolved").toBe(false);
    expect(blocking()).toBe(true);
    failLatest.off();
    fireEvent.click(need(retryOf(ui, e), `Retry ${e.label} for the latest`));
    await flush();
    expect(bytes(e)).toBe(raw(p.latest));
    expect(retryOf(ui, e)).toBeNull();
    expect(blocking()).toBe(false);
    expect(says(W.en.saved)).toBe(true);
  });

  it(`Q3 ${p.name}: a Retry while the field is pending is inert`, async () => {
    seed(e, raw(p.seed));
    const ui = mount();
    await flush();
    const quota = fault({ op: "set", key: e.key, label: "quota" });
    p.perform(ui, p.first);
    await flush();
    fired(quota, "first write");
    expect(shown(ui, e), "H1: the failed choice stays displayed").toBe(p.first);
    const retry = need(retryOf(ui, e), `H8: Retry ${e.label}`);
    const lock = await hold(keyLock(e));
    quota.off();
    const from = mark();
    fireEvent.click(retry);
    await flush(2);
    fireEvent.click(retry);
    const current = retryOf(ui, e);
    if (current && current !== retry) fireEvent.click(current);
    await flush();
    expect(writesOn(from, e), "nothing is written while the lock is held").toEqual([]);
    await lock.release();
    expect(writesOn(from, e), "a pending Retry is inert: exactly one write after release").toEqual([raw(p.first)]);
    expect(bytes(e)).toBe(raw(p.first));
    expect(retryOf(ui, e)).toBeNull();
    expect(blocking()).toBe(false);
  });

  it(`Q4 ${p.name}: an equal-value successor after intervening input stays its own operation`, async () => {
    seed(e, raw(p.seed));
    const ui = mount();
    await flush();
    p.perform(ui, p.first);
    await flush();
    expect(bytes(e), "first choice saved").toBe(raw(p.first));
    p.perform(ui, p.latest);
    await flush();
    expect(bytes(e), "intervening choice saved").toBe(raw(p.latest));
    const quota = fault({ op: "set", key: e.key, value: raw(p.first), label: "returning quota" });
    p.perform(ui, p.first);
    await flush();
    fired(quota, "returning write");
    expect(shown(ui, e), "H1: the returning choice stays displayed").toBe(p.first);
    expect(bytes(e)).toBe(raw(p.latest));
    expect(says(msg.notSaved(e)), "an earlier equal-value success is not evidence for the newer attempt").toBe(true);
    const retry = need(retryOf(ui, e), `H8: Retry ${e.label}`);
    expect(says(W.en.saved)).toBe(false);
    expect(blocking()).toBe(true);
    quota.off();
    fireEvent.click(retry);
    await flush();
    expect(bytes(e)).toBe(raw(p.first));
    expect(retryOf(ui, e)).toBeNull();
    expect(blocking()).toBe(false);
  });

  it(`Q5 ${p.name}: uncertainty keeps its grant across a denied read and a denied lock and reconciles with exactly one total write`, async () => {
    seed(e, raw(p.seed));
    const ui = mount();
    await flush();
    const from = mark();
    const readback = fault({ op: "get", key: e.key, afterSet: { key: e.key, value: raw(p.uncertain) }, times: 1, label: "post-write read" });
    p.perform(ui, p.uncertain);
    await flush();
    fired(readback, "post-write read");
    pre(bytes(e) === raw(p.uncertain), "the uncertain write physically reached storage");
    expect(shown(ui, e)).toBe(p.uncertain);
    need(retryOf(ui, e), `H8: an uncertain write keeps Retry ${e.label}`);
    expect(says(W.en.saved), "no Saved for an unverified write").toBe(false);
    expect(blocking()).toBe(true);
    const deniedRead = fault({ op: "get", key: e.key, times: 1, label: "denied verification read" });
    fireEvent.click(need(retryOf(ui, e), "Retry under a denied read"));
    await flush();
    fired(deniedRead, "Retry verification read");
    need(retryOf(ui, e), "the grant survives a temporarily denied read");
    expect(says(W.en.saved)).toBe(false);
    const manager = locks();
    const before = manager.log.length;
    manager.deny(keyLock(e));
    fireEvent.click(need(retryOf(ui, e), "Retry under a denied lock"));
    await flush();
    pre(manager.rejectedFor(keyLock(e), before) > 0, "the denied per-key lock was requested by Retry");
    need(retryOf(ui, e), "the grant survives a temporarily denied lock");
    expect(says(W.en.saved)).toBe(false);
    manager.allow(keyLock(e));
    fireEvent.click(need(retryOf(ui, e), "Retry after restoration"));
    await flush();
    expect(writesOn(from, e), "the uncertainty reconciles with exactly one total write").toEqual([raw(p.uncertain)]);
    expect(bytes(e)).toBe(raw(p.uncertain));
    expect(retryOf(ui, e)).toBeNull();
    expect(blocking()).toBe(false);
    expect(says(W.en.saved)).toBe(true);
  });

  it(`Q6 ${p.name}: an external replacement stays a preserved conflict; repeated Retry never overwrites; Discard rereads with zero writes`, async () => {
    seed(e, raw(p.seed));
    const ui = mount();
    await flush();
    const lock = await hold(keyLock(e));
    p.perform(ui, p.first);
    await flush();
    expect(bytes(e), "H6: the held per-key lock serializes the write").toBe(raw(p.seed));
    nativeSet.call(localStorage, e.key, raw(p.external));
    pre(bytes(e) === raw(p.external), "external replacement present");
    await lock.release();
    expect(bytes(e), "the external replacement is preserved").toBe(raw(p.external));
    expect(shown(ui, e), "H1: the latest choice stays displayed").toBe(p.first);
    const retry = need(retryOf(ui, e), `H8: Retry ${e.label}`);
    need(discardOf(ui, e), `H8: Discard ${e.label}`);
    expect(blocking()).toBe(true);
    expect(says(W.en.saved)).toBe(false);
    const from = mark();
    fireEvent.click(retry);
    await flush();
    fireEvent.click(retryOf(ui, e) ?? retry);
    await flush();
    expect(writesOn(from, e), "repeated Retry never gains authority to overwrite").toEqual([]);
    expect(bytes(e)).toBe(raw(p.external));
    need(retryOf(ui, e), "the conflict stays preserved");
    const discarded = mark();
    fireEvent.click(need(discardOf(ui, e), `Discard ${e.label} on the conflict`));
    await flush();
    expect(stickyWrites(discarded), "Discard makes zero set/remove attempts").toEqual([]);
    expect(shown(ui, e), "Discard rereads the external value").toBe(p.external);
    expect(retryOf(ui, e)).toBeNull();
    expect(blocking()).toBe(false);
    expect(bytes(e)).toBe(raw(p.external));
  });

  it(`Q7 ${p.name}: an external removal stays a preserved conflict; Retry never recreates the key; Discard shows the default`, async () => {
    seed(e, raw(p.seed));
    const ui = mount();
    await flush();
    const lock = await hold(keyLock(e));
    p.perform(ui, p.first);
    await flush();
    expect(bytes(e), "H6: the held per-key lock serializes the write").toBe(raw(p.seed));
    nativeRemove.call(localStorage, e.key);
    pre(bytes(e) === null, "external removal present");
    await lock.release();
    expect(bytes(e), "the external removal is preserved").toBeNull();
    expect(shown(ui, e), "H1: the latest choice stays displayed").toBe(p.first);
    const retry = need(retryOf(ui, e), `H8: Retry ${e.label}`);
    need(discardOf(ui, e), `H8: Discard ${e.label}`);
    expect(blocking()).toBe(true);
    const from = mark();
    fireEvent.click(retry);
    await flush();
    fireEvent.click(retryOf(ui, e) ?? retry);
    await flush();
    expect(writesOn(from, e), "repeated Retry never recreates the removed key").toEqual([]);
    expect(bytes(e)).toBeNull();
    need(retryOf(ui, e), "the removal conflict stays preserved");
    const discarded = mark();
    fireEvent.click(need(discardOf(ui, e), `Discard ${e.label} on the removal`));
    await flush();
    expect(stickyWrites(discarded), "Discard makes zero set/remove attempts").toEqual([]);
    expect(shown(ui, e), "Discard shows the registry default for the absent key").toBe(e.default);
    expect(retryOf(ui, e)).toBeNull();
    expect(blocking()).toBe(false);
  });

  it(`Q8 ${p.name}: an uncertain write whose original bytes are externally restored stays a conflict; a distinct new choice is a new operation`, async () => {
    seed(e, raw(p.seed));
    const ui = mount();
    await flush();
    const readback = fault({ op: "get", key: e.key, afterSet: { key: e.key, value: raw(p.uncertain) }, times: 1, label: "post-write read" });
    p.perform(ui, p.uncertain);
    await flush();
    fired(readback, "post-write read");
    pre(bytes(e) === raw(p.uncertain), "the uncertain write physically reached storage");
    const retry = need(retryOf(ui, e), `H8: an uncertain write keeps Retry ${e.label}`);
    nativeSet.call(localStorage, e.key, raw(p.seed));
    pre(bytes(e) === raw(p.seed), "original baseline bytes restored externally");
    const from = mark();
    fireEvent.click(retry);
    await flush();
    expect(bytes(e), "the restored original bytes are preserved").toBe(raw(p.seed));
    need(retryOf(ui, e), "the external restoration stays a conflict");
    expect(says(W.en.saved)).toBe(false);
    expect(blocking()).toBe(true);
    fireEvent.click(retryOf(ui, e) ?? retry);
    await flush();
    expect(writesOn(from, e), "repeated Retry never gains authority to overwrite").toEqual([]);
    expect(bytes(e)).toBe(raw(p.seed));
    p.perform(ui, p.fresh);
    await flush();
    expect(shown(ui, e), "the distinct new choice is displayed").toBe(p.fresh);
    expect(bytes(e), "the distinct new choice settles as its own operation").toBe(raw(p.fresh));
    expect(retryOf(ui, e)).toBeNull();
    expect(blocking()).toBe(false);
  });

  it(`Q9 ${p.name}: new work after a discard survives; the discarded held operation never writes`, async () => {
    seed(e, raw(p.seed));
    const ui = mount();
    await flush();
    const lock = await hold(keyLock(e));
    p.perform(ui, p.first);
    await flush();
    expect(bytes(e), "H6: the held per-key lock serializes the write").toBe(raw(p.seed));
    const current = need(guard(), "H7: departure guard registered");
    expect(blocking(), "pending held work is protected").toBe(true);
    const from = mark();
    act(() => { current.discardDraft(); });
    await flush();
    expect(stickyWrites(from), "discard is zero-write").toEqual([]);
    expect(shown(ui, e), "discard returns to the stored value").toBe(p.seed);
    expect(blocking()).toBe(false);
    p.perform(ui, p.renewed);
    await flush();
    expect(shown(ui, e), "the new work is displayed").toBe(p.renewed);
    await lock.release();
    expect(writesOn(from, e), "only the new work is written; the discarded operation never writes").toEqual([raw(p.renewed)]);
    expect(bytes(e)).toBe(raw(p.renewed));
    expect(shown(ui, e), "a late completion never revives discarded state").toBe(p.renewed);
    expect(retryOf(ui, e)).toBeNull();
    expect(blocking()).toBe(false);
    expect(says(W.en.saved)).toBe(true);
  });
});

describe.each(cases)("H6 $field", entry => {
  it(`H6 ${entry.field}: a held per-key lock serializes the write while the latest choice shows immediately and controls stay enabled`, async () => {
    seed(entry, raw(entry.seed));
    const ui = mount();
    await flush();
    const lock = await hold(keyLock(entry));
    const from = mark();
    chooseAlt(ui, entry);
    await flush();
    expect(shown(ui, entry), "the latest choice displays immediately").toBe(entry.alt);
    expect(bytes(entry), "H6: the held per-key lock keeps the physical bytes unchanged").toBe(raw(entry.seed));
    expect(locks().waiting(keyLock(entry), "product"), "H6: the write queues behind the held per-key lock").toBeGreaterThan(0);
    expect(says(msg.saving(entry)), `pending feedback "${msg.saving(entry)}"`).toBe(true);
    expect(enabled(ui, entry), "controls stay enabled while the operation is pending").toBe(true);
    expect(says(W.en.saved), "no Saved while pending").toBe(false);
    expect(blocking(), "pending work is protected by the guard").toBe(true);
    await lock.release();
    expect(writesOn(from, entry), "exactly the latest bytes are written after release").toEqual([raw(entry.alt)]);
    expect(bytes(entry)).toBe(raw(entry.alt));
    expect(shown(ui, entry)).toBe(entry.alt);
    expect(says(msg.saving(entry)), "pending feedback clears").toBe(false);
    expect(blocking()).toBe(false);
    expect(says(W.en.saved)).toBe(true);
  });
});

it("H6 coalesced palette choices A→B→C during a held lock settle only the latest", async () => {
  seed(color, "sky");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(color));
  const from = mark();
  choose(ui, color, "coral");
  choose(ui, color, "mint");
  choose(ui, color, "navy");
  await flush();
  expect(shown(ui, color), "the latest palette choice displays immediately").toBe("navy");
  expect(bytes(color), "H6: the held per-key lock serializes the writes").toBe("sky");
  await lock.release();
  expect(writesOn(from, color), "B is coalesced away: only the running predecessor and the latest are written").toEqual(["coral", "navy"]);
  expect(bytes(color)).toBe("navy");
  expect(shown(ui, color)).toBe("navy");
  expect(retryOf(ui, color)).toBeNull();
  expect(blocking()).toBe(false);
  expect(says(W.en.saved)).toBe(true);
});

it.each([pin, restore])("H5 $field: two same-turn activations invert the latest intent and return to the original through two operations", async entry => {
  seed(entry, raw(entry.seed));
  const ui = mount();
  await flush();
  const control = switchOf(ui, entry);
  const from = mark();
  act(() => { control.click(); control.click(); });
  await flush();
  expect(shown(ui, entry), "H5: the second activation inverts the latest intent, not the rendered closure").toBe(entry.seed);
  expect(bytes(entry), "the stored value returns to the original").toBe(raw(entry.seed));
  expect(writesOn(from, entry), "two operations: the inversion and the return").toEqual([raw(!entry.seed), raw(entry.seed)]);
  expect(retryOf(ui, entry)).toBeNull();
  expect(blocking()).toBe(false);
});

it("H5/H6 two Pin by Default activations during a held lock return to the original through two operations", async () => {
  seed(pin, "false");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(pin));
  const from = mark();
  toggle(ui, pin);
  await flush();
  expect(shown(ui, pin), "the first activation displays immediately").toBe(true);
  expect(bytes(pin), "H6: the held per-key lock keeps the first write pending").toBe("false");
  toggle(ui, pin);
  await flush();
  expect(shown(ui, pin), "the second activation inverts the latest intent").toBe(false);
  expect(bytes(pin), "H6: the held per-key lock keeps the second write pending").toBe("false");
  await lock.release();
  expect(writesOn(from, pin), "two operations after release").toEqual(["true", "false"]);
  expect(bytes(pin)).toBe("false");
  expect(retryOf(ui, pin)).toBeNull();
  expect(blocking()).toBe(false);
});
