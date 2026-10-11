/**
 * Mode `queues` (contract r2 section 12; section 5 items 4–6): a real held per-key lock (H3); rapid choices and
 * coalescing with final bytes; the predecessor/latest orderings (the predecessor succeeds and the latest fails; the
 * predecessor fails while the latest stays queued and Retry advances the predecessor first; repeated failed-predecessor
 * recovery; a later failure of the latest); a Retry while pending is inert; uncertainty reconciled with one total write
 * across a denied read and a denied lock; external replacement and removal as preserved conflicts, including
 * restoration of the original bytes; new work after Discard survives; interleaved style and timezone work.
 *
 * Conflicts are created only by an unobserved external change after mount (consistency matrix row 4). Zero writes are
 * asserted only for queued or held work, or with the fault armed (matrix row 5). Pending states expect no block, a
 * departure-relevant unload warning and no inline Export (matrix rows 1–2).
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  action, assertSelfCheck, blockState, bytes, choose, clockWrites, controlsEnabled, exportButton, expectQuiet, FAILED, fault, fieldWrites,
  fired, flush, hold, KEY, LOCK, locks, mark, mountClock, nativeRemove, nativeSet, NONE, quota, region, seed, setup, shown, successClaim,
  teardown, warns, writes, click, need, pre, type Field,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  assertSelfCheck();
});

interface Plan { readonly field: Field; readonly stored: string; readonly a: string; readonly b: string; readonly c: string }
const PLANS: readonly Plan[] = [
  { field: "style", stored: "classic", a: "split", b: "analog", c: "minimal" },
  { field: "timezone", stored: "local", a: "tokyo", b: "paris", c: "sydney" },
];

for (const { field, stored, a, b, c } of PLANS) {
  it(`H3 §5.4 ${field}: a held per-key lock keeps the bytes unchanged while the choice displays immediately, controls stay enabled, no block; one write after release`, async () => {
    seed(field, stored);
    await mountClock();
    const lock = await hold(LOCK[field]);
    const from = mark();
    choose(field, a);
    await flush();
    expect(bytes(field), "H3 the held per-key lock keeps the bytes unchanged").toBe(stored);
    expect(shown(field), "§5.4 the choice displays immediately").toBe(a);
    expect(controlsEnabled(), "§5.4 controls stay enabled while pending").toBe(true);
    expect(blockState(field), "§5.7 a pending field shows no block or text").toStrictEqual(NONE);
    expect(exportButton(), "matrix row 1: no inline Export for pending-only").toBeNull();
    expect(warns(), "matrix row 2: pending work warns on unload").toBe(true);
    await lock.release();
    expect(fieldWrites(from, field), "exactly one write of the choice after release").toEqual([a]);
    expect(bytes(field)).toBe(a);
    expect(region(), "no region after the success").toBeNull();
    expect(warns()).toBe(false);
    expect(successClaim()).toBe(false);
    expectQuiet(`held ${field}`);
  });

  it(`§5.4 ${field}: rapid choices behind a held lock display the latest at once; the final bytes equal the last choice`, async () => {
    seed(field, stored);
    await mountClock();
    const lock = await hold(LOCK[field]);
    const from = mark();
    choose(field, a);
    choose(field, c);
    choose(field, b);
    await flush();
    expect(bytes(field), "H3 nothing is written while the lock is held").toBe(stored);
    expect(shown(field), "the latest intent displays").toBe(b);
    expect(blockState(field)).toStrictEqual(NONE);
    await lock.release();
    const written = fieldWrites(from, field);
    expect(bytes(field), "§5.4 the final bytes equal the last choice").toBe(b);
    expect(written.at(-1), "the last write is the last choice").toBe(b);
    expect(written.every(value => [a, b, c].includes(value)) && written.length <= 3, `writes are a coalesced subsequence of the choices: ${JSON.stringify(written)}`).toBe(true);
    expect(shown(field)).toBe(b);
    expect(blockState(field)).toStrictEqual(NONE);
    expect(warns()).toBe(false);
    expectQuiet(`rapid ${field}`);
  });

  it(`§5.5 ${field}: the predecessor succeeds and the latest fails; the latest stays displayed with Retry; Retry writes it once`, async () => {
    seed(field, stored);
    await mountClock();
    const lock = await hold(LOCK[field]);
    choose(field, a);
    await flush();
    const latestQuota = quota(field, { value: b });
    choose(field, b);
    await flush();
    expect(bytes(field), "H3 the held per-key lock keeps the bytes unchanged").toBe(stored);
    await lock.release();
    fired(latestQuota, `write of ${b}`);
    expect(bytes(field), "the predecessor committed").toBe(a);
    expect(shown(field), "§5.4 an earlier completion never makes the later choice look settled").toBe(b);
    expect(blockState(field), "§5.7 the failed latest shows the failed-draft block").toStrictEqual(FAILED);
    latestQuota.off();
    const retried = mark();
    click(need(action(field, "retry"), "§5.5 Retry"));
    await flush();
    expect(fieldWrites(retried, field), "one write of the latest").toEqual([b]);
    expect(bytes(field)).toBe(b);
    expect(blockState(field)).toStrictEqual(NONE);
    expectQuiet(`predecessor ok latest fails ${field}`);
  });

  it(`§5.5 ${field}: the predecessor fails while the latest stays queued; the field shows the failed-draft block; Retry advances the predecessor, then the latest runs as its own attempt`, async () => {
    seed(field, stored);
    await mountClock();
    const lock = await hold(LOCK[field]);
    const predecessorQuota = quota(field, { value: a });
    choose(field, a);
    await flush();
    choose(field, b);
    await flush();
    expect(bytes(field), "H3 the held per-key lock keeps the bytes unchanged").toBe(stored);
    await lock.release();
    fired(predecessorQuota, `write of ${a}`);
    expect(bytes(field), "the predecessor failed").toBe(stored);
    expect(shown(field), "the latest stays displayed").toBe(b);
    expect(blockState(field), "§5.7 a latest intent queued behind a failed predecessor is settled unsuccessful").toStrictEqual(FAILED);
    expect(fieldWrites(0, field).filter(value => value === b), "the queued latest has not run").toEqual([]);
    predecessorQuota.off();
    const retried = mark();
    click(need(action(field, "retry"), "§5.5 Retry"));
    await flush();
    expect(fieldWrites(retried, field), "§5.5 Retry advances the predecessor, then the latest runs as its own first attempt").toEqual([a, b]);
    expect(bytes(field)).toBe(b);
    expect(blockState(field)).toStrictEqual(NONE);
    expect(warns()).toBe(false);
    expectQuiet(`predecessor fails ${field}`);
  });

  it(`§5.5 ${field}: repeated failed-predecessor recovery, then a later failure of the latest`, async () => {
    seed(field, stored);
    await mountClock();
    const lock = await hold(LOCK[field]);
    const predecessorQuota = quota(field, { value: a, times: 2 });
    choose(field, a);
    await flush();
    choose(field, b);
    await flush();
    expect(bytes(field), "H3 the held per-key lock keeps the bytes unchanged").toBe(stored);
    await lock.release();
    expect(blockState(field), "first predecessor failure").toStrictEqual(FAILED);
    click(need(action(field, "retry"), "§5.5 Retry 1"));
    await flush();
    fired(predecessorQuota, "two predecessor writes", 2);
    expect(bytes(field), "the repeated predecessor failure keeps the bytes").toBe(stored);
    expect(shown(field), "the latest stays displayed").toBe(b);
    expect(blockState(field), "§5.5 repeated failed-predecessor recovery keeps the block").toStrictEqual(FAILED);
    const latestQuota = quota(field, { value: b });
    const retried = mark();
    click(need(action(field, "retry"), "§5.5 Retry 2"));
    await flush();
    fired(latestQuota, `write of ${b}`);
    expect(fieldWrites(retried, field), "the predecessor commits, then the latest fails").toEqual([a, `${b}!`]);
    expect(bytes(field)).toBe(a);
    expect(shown(field), "§5.5 a later failure of the latest keeps it displayed").toBe(b);
    expect(blockState(field)).toStrictEqual(FAILED);
    latestQuota.off();
    const final = mark();
    click(need(action(field, "retry"), "§5.5 Retry 3"));
    await flush();
    expect(fieldWrites(final, field)).toEqual([b]);
    expect(bytes(field)).toBe(b);
    expect(blockState(field)).toStrictEqual(NONE);
    expectQuiet(`repeated recovery ${field}`);
  });

  it(`§5.5 ${field}: a Retry while the field is pending is inert or idempotent (exactly one write after release)`, async () => {
    seed(field, stored);
    await mountClock();
    const injected = quota(field);
    choose(field, a);
    await flush();
    fired(injected, `write of ${a}`);
    expect(blockState(field), `${field === "style" ? "H1" : "H2"} the failed choice shows the block`).toStrictEqual(FAILED);
    injected.off();
    const lock = await hold(LOCK[field]);
    const from = mark();
    click(need(action(field, "retry"), "§5.5 Retry"));
    await flush();
    const again = action(field, "retry");
    if (again) click(again);
    await flush();
    expect(bytes(field), "H3 the Retry waits behind the held lock").toBe(stored);
    expect(blockState(field), "§5.7 a pending Retry shows no block").toStrictEqual(NONE);
    await lock.release();
    expect(fieldWrites(from, field), "§5.5 exactly one write").toEqual([a]);
    expect(bytes(field)).toBe(a);
    expectQuiet(`pending retry ${field}`);
  });

  it(`§5.6 ${field}: an uncertain write keeps its grant across a denied read and a denied lock and reconciles with exactly one total write`, async () => {
    seed(field, stored);
    await mountClock();
    const from = mark();
    const readback = fault({ op: "get", key: KEY[field], after: { op: "set", key: KEY[field], value: a }, times: 1, label: "post-write read" });
    choose(field, a);
    await flush();
    expect(blockState(field), "§5.6 an unverified (readback-uncertain) write is a settled unsuccessful draft").toStrictEqual(FAILED);
    fired(readback, "post-write read");
    pre(bytes(field) === a, "the uncertain write physically reached storage");
    expect(shown(field)).toBe(a);
    expect(successClaim()).toBe(false);
    const deniedRead = fault({ op: "get", key: KEY[field], times: 1, label: "denied verification read" });
    click(need(action(field, "retry"), "§5.5 Retry under a denied read"));
    await flush();
    expect(deniedRead.fired, "the Retry verification attempted a read").toBe(1);
    expect(blockState(field), "the grant survives a temporarily denied read").toStrictEqual(FAILED);
    const manager = locks();
    const before = manager.log.length;
    manager.deny(LOCK[field]);
    click(need(action(field, "retry"), "§5.5 Retry under a denied lock"));
    await flush();
    expect(manager.rejectedFor(LOCK[field], before), "the Retry requested the denied per-key lock").toBeGreaterThan(0);
    expect(blockState(field), "the grant survives a temporarily denied lock").toStrictEqual(FAILED);
    manager.allow(LOCK[field]);
    click(need(action(field, "retry"), "§5.5 Retry after restoration"));
    await flush();
    expect(fieldWrites(from, field), "§5.6 the uncertainty reconciles with exactly one total write").toEqual([a]);
    expect(bytes(field)).toBe(a);
    expect(blockState(field)).toStrictEqual(NONE);
    expect(region()).toBeNull();
    expectQuiet(`uncertain ${field}`);
  });

  it(`§5.6 ${field}: an external replacement stays a preserved conflict; repeated Retry never overwrites; Discard rereads with zero writes`, async () => {
    seed(field, stored);
    await mountClock();
    const lock = await hold(LOCK[field]);
    choose(field, a);
    await flush();
    expect(bytes(field), "H3 the held per-key lock serializes the write").toBe(stored);
    nativeSet.call(localStorage, KEY[field], c);
    pre(bytes(field) === c, "unobserved external replacement after mount (matrix row 4)");
    await lock.release();
    expect(bytes(field), "§5.6 the external replacement is preserved").toBe(c);
    expect(shown(field), "the latest choice stays displayed").toBe(a);
    expect(blockState(field), "§5.7 a conflict is a settled unsuccessful draft").toStrictEqual(FAILED);
    expect(warns()).toBe(true);
    const from = mark();
    click(need(action(field, "retry"), "§5.5 Retry 1"));
    await flush();
    click(need(action(field, "retry"), "§5.5 Retry 2"));
    await flush();
    expect(fieldWrites(from, field), "§5.6 repeated Retry never gains authority to overwrite").toEqual([]);
    expect(bytes(field)).toBe(c);
    expect(blockState(field), "the conflict stays preserved").toStrictEqual(FAILED);
    const discarded = mark();
    click(need(action(field, "discard"), "§5.5 Discard on the conflict"));
    await flush();
    expect(writes(discarded), "Discard makes zero set/remove attempts").toEqual([]);
    expect(shown(field), "Discard rereads the external value").toBe(c);
    expect(blockState(field)).toStrictEqual(NONE);
    expect(warns()).toBe(false);
    expectQuiet(`replacement ${field}`);
  });

  it(`§5.6 ${field}: an external removal stays a preserved conflict; Retry never recreates the key; Discard shows the default`, async () => {
    seed(field, stored === "classic" || stored === "local" ? c : stored);
    const baseline = bytes(field)!;
    await mountClock();
    const lock = await hold(LOCK[field]);
    choose(field, a);
    await flush();
    expect(bytes(field), "H3 the held per-key lock serializes the write").toBe(baseline);
    nativeRemove.call(localStorage, KEY[field]);
    pre(bytes(field) === null, "unobserved external removal after mount (matrix row 4)");
    await lock.release();
    expect(bytes(field), "§5.6 the external removal is preserved").toBeNull();
    expect(shown(field)).toBe(a);
    expect(blockState(field)).toStrictEqual(FAILED);
    const from = mark();
    click(need(action(field, "retry"), "§5.5 Retry 1"));
    await flush();
    click(need(action(field, "retry"), "§5.5 Retry 2"));
    await flush();
    expect(fieldWrites(from, field), "§5.6 repeated Retry never recreates the removed key").toEqual([]);
    expect(bytes(field)).toBeNull();
    expect(blockState(field), "the removal conflict stays preserved").toStrictEqual(FAILED);
    click(need(action(field, "discard"), "§5.5 Discard on the removal"));
    await flush();
    expect(shown(field), "Discard shows the default for the absent key").toBe(field === "style" ? "classic" : "local");
    expect(blockState(field)).toStrictEqual(NONE);
    expectQuiet(`removal ${field}`);
  });

  it(`§5.6 ${field}: an uncertain write whose original bytes are externally restored stays a conflict; a distinct new choice is a new operation`, async () => {
    seed(field, stored);
    await mountClock();
    const readback = fault({ op: "get", key: KEY[field], after: { op: "set", key: KEY[field], value: a }, times: 1, label: "post-write read" });
    choose(field, a);
    await flush();
    expect(blockState(field), "§5.6 the unverified write is reported as not saved").toStrictEqual(FAILED);
    fired(readback, "post-write read");
    pre(bytes(field) === a, "the uncertain write physically reached storage");
    nativeSet.call(localStorage, KEY[field], stored);
    pre(bytes(field) === stored, "original baseline bytes restored externally (unobserved, matrix row 4)");
    const from = mark();
    click(need(action(field, "retry"), "§5.5 Retry 1"));
    await flush();
    expect(bytes(field), "§5.6 the restored original bytes are preserved").toBe(stored);
    expect(blockState(field), "the external restoration stays a conflict").toStrictEqual(FAILED);
    click(need(action(field, "retry"), "§5.5 Retry 2"));
    await flush();
    expect(fieldWrites(from, field), "§5.6 repeated Retry never gains authority to overwrite").toEqual([]);
    choose(field, b);
    await flush();
    expect(shown(field), "the distinct new choice is displayed").toBe(b);
    expect(bytes(field), "the distinct new choice settles as its own operation").toBe(b);
    expect(blockState(field)).toStrictEqual(NONE);
    expectQuiet(`restoration ${field}`);
  });

  it(`§5.8 ${field}: Discard of a latest queued behind a failed predecessor makes zero writes; new work afterwards survives and the discarded work never lands`, async () => {
    seed(field, stored);
    await mountClock();
    const lock = await hold(LOCK[field]);
    const predecessorQuota = quota(field, { value: a });
    choose(field, a);
    await flush();
    choose(field, b);
    await flush();
    expect(bytes(field), "H3 the held per-key lock keeps the bytes unchanged").toBe(stored);
    await lock.release();
    fired(predecessorQuota, `write of ${a}`);
    expect(blockState(field)).toStrictEqual(FAILED);
    predecessorQuota.off();
    const from = mark();
    click(need(action(field, "discard"), "§5.5 Discard"));
    await flush();
    expect(clockWrites(from), "§5.8 Discard of queued and held work makes zero writes").toEqual([]);
    expect(shown(field), "the display returns to the committed bytes").toBe(stored);
    choose(field, c);
    await flush();
    expect(fieldWrites(from, field), "only the new work is written; the discarded operations never write").toEqual([c]);
    expect(bytes(field)).toBe(c);
    expect(shown(field), "a late completion never revives discarded state").toBe(c);
    expect(blockState(field)).toStrictEqual(NONE);
    expectQuiet(`new work after discard ${field}`);
  });
}

it("§5.7 interleaved style and timezone work: each key's own lock serializes only its own write; each completes with one write", async () => {
  seed("style", "classic");
  seed("timezone", "local");
  await mountClock();
  const styleLock = await hold(LOCK.style);
  const timezoneLock = await hold(LOCK.timezone);
  const from = mark();
  choose("style", "analog");
  choose("timezone", "berlin");
  await flush();
  expect({ style: bytes("style"), timezone: bytes("timezone") }, "H3 both writes wait behind their own held locks").toStrictEqual({ style: "classic", timezone: "local" });
  expect({ style: shown("style"), timezone: shown("timezone") }).toStrictEqual({ style: "analog", timezone: "berlin" });
  await timezoneLock.release();
  expect(bytes("timezone"), "the timezone completes on its own lock").toBe("berlin");
  expect(bytes("style"), "the style still waits on its own lock").toBe("classic");
  expect(warns(), "the pending style still warns").toBe(true);
  await styleLock.release();
  expect(clockWrites(from), "one write per key, timezone first").toEqual([`set:${KEY.timezone}=berlin`, `set:${KEY.style}=analog`]);
  expect({ style: blockState("style"), timezone: blockState("timezone") }).toStrictEqual({ style: NONE, timezone: NONE });
  expect(warns()).toBe(false);
  expectQuiet("interleaved");
});
