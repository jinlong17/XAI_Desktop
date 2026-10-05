/**
 * Mode `queues` (contract r3 section 12): section 5 items 4–6 shown fully for one root field (theme) and one
 * registered field (railPos); the held per-key lock for all seven pane fields and the three Topbar fields (H8);
 * cross-surface latest intent with a real held lock (host row n in Sol form) and H5; slider streams; the section 6
 * orderings on theme and railPos, including a Topbar edit during a pending batch; and the controller-ruling-5 cases
 * `fu2-retry-theme` and `fu2-retry-railPos` (per-field Retry), which must FAIL at their step 1 at 5cd63ff.
 *
 * Held-lock cases take the real `prefMutationLockName(<key>)` lock through the exclusive fixture; the product's own
 * request must queue behind it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import {
  ACCENT, applied, appliedFor, BG, byId, bytes, choose, chooseTopbar, clickReset, configureApp, DENSITY, discardOf, download, enabled, enc,
  envelope, expectSingleDownload, exportButton, fault, FIELDS, fired, flush, FONT, hold, keyLock, LANG, locks, mark, mountApp, msg,
  nativeRemove, nativeSet, need, paneControl, pre, RAIL, rejections, RESET, retryAll, retryOf, RULING5, runRuling5, sameFrame, saveAndApply,
  says, seedValue, SET, setSlider, setup, shown, statusText, successShown, teardown, THEME, topbarChecked, topbarOption, topbarStatus,
  topbarStatusNamed, uiLang, W, warns, writes, writesOn,
  type Field, type FieldId, type Value,
  storageSelfCheck as fb002SelfCheck, SELF_CHECK_DELEGATION as FB002_DELEGATION, observe as fb002Observe, pre as fb002Pre,
} from "./fixture";

const auth = vi.hoisted(() => {
  const state = { calls: 0 };
  const value: Record<string, unknown> = {
    state: "authenticated",
    session: { user: { id: "appearance-sol-A" } },
    client: null,
    coordinator: undefined,
    authError: null,
    signOutFailed: false,
    reportSignOutFailure: undefined,
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: async () => null,
    ensureDeviceIdentity: async () => "appearance-sol-device",
    clearSessionStorage: async () => undefined,
    setSession: () => undefined,
  };
  return { state, value };
});
vi.mock("../../../packages/web-auth-device-session/src/session", async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, useWebAuthSession: () => { auth.state.calls += 1; return auth.value; } };
});

import { webHostRouteObjects } from "../../../apps/web/src/routes/router";

configureApp(webHostRouteObjects);
beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  const result = fb002SelfCheck();
  fb002Observe("F-B002 self-check", result);
  fb002Pre(result.nested === 0 && result.tripwire === 0 && JSON.stringify(result.delegatedPerCall) === JSON.stringify(FB002_DELEGATION), `F-B002 self-check: ${JSON.stringify(result)}`);
});

/** Stored value, predecessor and latest choice for the two fields shown fully. */
const PLAN: Record<"theme" | "railPos", { stored: Value; a: Value; b: Value }> = {
  theme: { stored: "dark", a: "system", b: "light" },
  railPos: { stored: "top", a: "right", b: "bottom" },
};
const CHOICE: Record<FieldId, Value> = { lang: "zh", theme: "dark", density: "compact", accentHue: 230, bgTone: "mist", railPos: "right", fontScale: 1.1 };
const OTHER: Record<FieldId, Value> = { lang: "en", theme: "light", density: "comfortable", accentHue: 165, bgTone: "default", railPos: "left", fontScale: 1 };

async function pick(field: Field, value: Value): Promise<void> {
  if (field === FONT) {
    if (shown(FONT) === value) { setSlider(FONT, value === 1.05 ? 1.1 : 1.05); await flush(); }
    setSlider(FONT, value);
    return;
  }
  choose(field, value);
}

// ---------------------------------------------------------------------------
// Section 5 items 4–6 for theme (root) and railPos (registered)
// ---------------------------------------------------------------------------

describe.each([THEME, RAIL].map(field => ({ id: field.id as "theme" | "railPos" })))("§5 $id", ({ id }) => {
  const X = byId(id);
  const { stored, a, b } = PLAN[id];
  const enc_ = (value: Value) => enc(X, value);

  it(`Q1 ${id}: the predecessor succeeds while the latest fails; Retry settles only the latest`, async () => {
    seedValue(X, stored);
    await mountApp();
    const lock = await hold(keyLock(X));
    const failLatest = fault({ op: "set", key: X.key, value: enc_(b), label: "latest quota" });
    choose(X, a);
    choose(X, b);
    await flush();
    expect(bytes(X), "H8: both choices wait behind the held per-key lock").toBe(enc_(stored));
    await lock.release();
    fired(failLatest, "latest write");
    expect(shown(X), "§5.5: the latest choice stays displayed").toBe(b);
    expect(bytes(X), "the predecessor committed").toBe(enc_(a));
    expect(says(msg.notSaved(X)), "§5.5 failed feedback for the latest").toBe(true);
    const retry = need(retryOf(X), `H12: Retry ${X.label.en}`);
    expect(topbarStatus(), "the failed latest shows the Topbar status").not.toBeNull();
    expect(warns(), "the failed latest warns on unload").toBe(true);
    expect(successShown(), "the predecessor's success is not a saved claim for the latest").toBe(false);
    failLatest.off();
    const from = mark();
    fireEvent.click(retry);
    await flush();
    expect(writesOn(from, X), "Retry writes only the latest").toEqual([enc_(b)]);
    expect(bytes(X)).toBe(enc_(b));
    expect(retryOf(X)).toBeNull();
    expect(warns()).toBe(false);
    expect(statusText(), "the latest success shows the saved line").toBe(W.en.saved);
    expect(rejections).toEqual([]);
  });

  it(`Q2 ${id}: a failed predecessor blocks the queued latest; repeated predecessor failure; Retry advances the predecessor without acknowledging the latest`, async () => {
    seedValue(X, stored);
    await mountApp();
    const lock = await hold(keyLock(X));
    const failFirst = fault({ op: "set", key: X.key, value: enc_(a), label: "predecessor quota" });
    const failLatest = fault({ op: "set", key: X.key, value: enc_(b), label: "latest quota" });
    choose(X, a);
    choose(X, b);
    await flush();
    expect(bytes(X), "H8: both choices wait behind the held per-key lock").toBe(enc_(stored));
    await lock.release();
    fired(failFirst, "predecessor write");
    expect(shown(X), "§5.5: the latest choice stays displayed").toBe(b);
    expect(bytes(X), "nothing committed").toBe(enc_(stored));
    const retry = need(retryOf(X), `H12: Retry ${X.label.en}`);
    expect(successShown()).toBe(false);
    fireEvent.click(retry);
    await flush();
    fired(failFirst, "repeated predecessor write", 2);
    expect(bytes(X), "the repeated predecessor failure writes nothing").toBe(enc_(stored));
    need(retryOf(X), "the field stays recoverable after a repeated predecessor failure");
    failFirst.off();
    fireEvent.click(need(retryOf(X), "Retry after the predecessor fault is lifted"));
    await flush();
    fired(failLatest, "latest write after the predecessor advanced");
    expect(bytes(X), "Retry advanced the predecessor").toBe(enc_(a));
    expect(shown(X), "the latest choice is still displayed").toBe(b);
    need(retryOf(X), "the predecessor's success never acknowledges the failed latest");
    expect(successShown(), "no saved line while the latest is unresolved").toBe(false);
    failLatest.off();
    fireEvent.click(need(retryOf(X), "Retry for the latest"));
    await flush();
    expect(bytes(X)).toBe(enc_(b));
    expect(retryOf(X)).toBeNull();
    expect(statusText()).toBe(W.en.saved);
  });

  it(`Q3 ${id}: a Retry while the field is pending is inert`, async () => {
    seedValue(X, stored);
    await mountApp();
    const quota = fault({ op: "set", key: X.key, label: "quota" });
    choose(X, a);
    await flush();
    fired(quota, "first write");
    expect(shown(X), "§5.5: the failed choice stays displayed").toBe(a);
    const retry = need(retryOf(X), `H12: Retry ${X.label.en}`);
    const lock = await hold(keyLock(X));
    quota.off();
    const from = mark();
    fireEvent.click(retry);
    await flush(2);
    fireEvent.click(retry);
    const current = retryOf(X);
    if (current && current !== retry) fireEvent.click(current);
    await flush();
    expect(writesOn(from, X), "nothing is written while the lock is held").toEqual([]);
    await lock.release();
    expect(writesOn(from, X), "a pending Retry is inert: exactly one write after release").toEqual([enc_(a)]);
    expect(bytes(X)).toBe(enc_(a));
    expect(retryOf(X)).toBeNull();
  });

  it(`Q4 ${id}: an equal-value successor after intervening input stays its own operation`, async () => {
    seedValue(X, stored);
    await mountApp();
    choose(X, a);
    await flush();
    expect(bytes(X), "first choice saved").toBe(enc_(a));
    choose(X, b);
    await flush();
    expect(bytes(X), "intervening choice saved").toBe(enc_(b));
    const quota = fault({ op: "set", key: X.key, value: enc_(a), label: "returning quota" });
    choose(X, a);
    await flush();
    fired(quota, "returning write");
    expect(shown(X), "§5.5: the returning choice stays displayed").toBe(a);
    expect(bytes(X)).toBe(enc_(b));
    expect(says(msg.notSaved(X)), "an earlier equal-value success is not evidence for the newer attempt").toBe(true);
    const retry = need(retryOf(X), `H12: Retry ${X.label.en}`);
    expect(successShown()).toBe(false);
    quota.off();
    fireEvent.click(retry);
    await flush();
    expect(bytes(X)).toBe(enc_(a));
    expect(retryOf(X)).toBeNull();
  });

  it(`Q5 ${id}: uncertainty keeps its grant across a denied read and a denied lock and reconciles with exactly one total write`, async () => {
    seedValue(X, stored);
    await mountApp();
    const from = mark();
    const readback = fault({ op: "get", key: X.key, after: { op: "set", key: X.key, value: enc_(a) }, times: 1, label: "post-write read" });
    choose(X, a);
    await flush();
    expect(shown(X), "the latest choice stays displayed").toBe(a);
    expect(says(msg.notSaved(X)), "§5.6: an unverified (readback-uncertain) write is reported as not saved").toBe(true);
    fired(readback, "post-write read");
    pre(bytes(X) === enc_(a), "the uncertain write physically reached storage");
    need(retryOf(X), `H12: an uncertain write keeps Retry ${X.label.en}`);
    expect(successShown(), "no saved line for an unverified write").toBe(false);
    const deniedRead = fault({ op: "get", key: X.key, times: 1, label: "denied verification read" });
    fireEvent.click(need(retryOf(X), "Retry under a denied read"));
    await flush();
    expect(deniedRead.fired, "the Retry verification attempted a read").toBe(1);
    need(retryOf(X), "the grant survives a temporarily denied read");
    const manager = locks();
    const before = manager.log.length;
    manager.deny(keyLock(X));
    fireEvent.click(need(retryOf(X), "Retry under a denied lock"));
    await flush();
    expect(manager.rejectedFor(keyLock(X), before), "the Retry requested the denied per-key lock").toBeGreaterThan(0);
    need(retryOf(X), "the grant survives a temporarily denied lock");
    manager.allow(keyLock(X));
    fireEvent.click(need(retryOf(X), "Retry after restoration"));
    await flush();
    expect(writesOn(from, X), "§5.6: the uncertainty reconciles with exactly one total write").toEqual([enc_(a)]);
    expect(bytes(X)).toBe(enc_(a));
    expect(retryOf(X)).toBeNull();
    expect(statusText()).toBe(W.en.saved);
  });

  it(`Q6 ${id}: an external replacement stays a preserved conflict; repeated Retry never overwrites; Discard rereads with zero writes`, async () => {
    seedValue(X, stored);
    await mountApp();
    const lock = await hold(keyLock(X));
    choose(X, a);
    await flush();
    expect(bytes(X), "H8: the held per-key lock serializes the write").toBe(enc_(stored));
    nativeSet.call(localStorage, X.key, enc_(b));
    pre(bytes(X) === enc_(b), "external replacement present");
    await lock.release();
    expect(bytes(X), "§5.6: the external replacement is preserved").toBe(enc_(b));
    expect(shown(X), "the latest choice stays displayed").toBe(a);
    const retry = need(retryOf(X), `H12: Retry ${X.label.en}`);
    need(discardOf(X), `H12: Discard ${X.label.en}`);
    expect(warns()).toBe(true);
    expect(successShown()).toBe(false);
    const from = mark();
    fireEvent.click(retry);
    await flush();
    fireEvent.click(retryOf(X) ?? retry);
    await flush();
    expect(writesOn(from, X), "§5.6: repeated Retry never gains authority to overwrite").toEqual([]);
    expect(bytes(X)).toBe(enc_(b));
    need(retryOf(X), "the conflict stays preserved");
    const discarded = mark();
    fireEvent.click(need(discardOf(X), `Discard ${X.label.en} on the conflict`));
    await flush();
    expect(writes(discarded), "Discard makes zero set/remove attempts").toEqual([]);
    expect(shown(X), "Discard rereads the external value").toBe(b);
    expect(retryOf(X)).toBeNull();
    expect(warns()).toBe(false);
  });

  it(`Q7 ${id}: an external removal stays a preserved conflict; Retry never recreates the key; Discard shows the default`, async () => {
    seedValue(X, stored);
    await mountApp();
    const lock = await hold(keyLock(X));
    choose(X, a);
    await flush();
    expect(bytes(X), "H8: the held per-key lock serializes the write").toBe(enc_(stored));
    nativeRemove.call(localStorage, X.key);
    pre(bytes(X) === null, "external removal present");
    await lock.release();
    expect(bytes(X), "§5.6: the external removal is preserved").toBeNull();
    expect(shown(X)).toBe(a);
    const retry = need(retryOf(X), `H12: Retry ${X.label.en}`);
    const from = mark();
    fireEvent.click(retry);
    await flush();
    fireEvent.click(retryOf(X) ?? retry);
    await flush();
    expect(writesOn(from, X), "§5.6: repeated Retry never recreates the removed key").toEqual([]);
    expect(bytes(X)).toBeNull();
    need(retryOf(X), "the removal conflict stays preserved");
    fireEvent.click(need(discardOf(X), `Discard ${X.label.en} on the removal`));
    await flush();
    expect(shown(X), "Discard shows the default for the absent key").toBe(X.defaultValue);
    expect(retryOf(X)).toBeNull();
  });

  it(`Q8 ${id}: an uncertain write whose original bytes are externally restored stays a conflict; a distinct new choice is a new operation`, async () => {
    seedValue(X, stored);
    await mountApp();
    const readback = fault({ op: "get", key: X.key, after: { op: "set", key: X.key, value: enc_(a) }, times: 1, label: "post-write read" });
    choose(X, a);
    await flush();
    expect(says(msg.notSaved(X)), "§5.6: the unverified write is reported as not saved").toBe(true);
    fired(readback, "post-write read");
    pre(bytes(X) === enc_(a), "the uncertain write physically reached storage");
    const retry = need(retryOf(X), `H12: Retry ${X.label.en}`);
    nativeSet.call(localStorage, X.key, enc_(stored));
    pre(bytes(X) === enc_(stored), "original baseline bytes restored externally");
    const from = mark();
    fireEvent.click(retry);
    await flush();
    expect(bytes(X), "§5.6: the restored original bytes are preserved").toBe(enc_(stored));
    need(retryOf(X), "the external restoration stays a conflict");
    expect(successShown()).toBe(false);
    fireEvent.click(retryOf(X) ?? retry);
    await flush();
    expect(writesOn(from, X), "§5.6: repeated Retry never gains authority to overwrite").toEqual([]);
    choose(X, b);
    await flush();
    expect(shown(X), "the distinct new choice is displayed").toBe(b);
    expect(bytes(X), "the distinct new choice settles as its own operation").toBe(enc_(b));
    expect(retryOf(X)).toBeNull();
  });

  it(`Q9 ${id}: new work after a discard survives; the discarded held operation never writes`, async () => {
    seedValue(X, stored);
    await mountApp();
    const lock = await hold(keyLock(X));
    choose(X, a);
    await flush();
    expect(bytes(X), "H8: the held per-key lock serializes the write").toBe(enc_(stored));
    expect(warns(), "pending held work warns on unload").toBe(true);
    const from = mark();
    fireEvent.click(need(discardOf(X), `H12: Discard ${X.label.en}`));
    await flush();
    expect(writes(from), "discard is zero-write").toEqual([]);
    expect(shown(X), "discard returns to the stored value").toBe(stored);
    choose(X, b);
    await flush();
    expect(shown(X), "the new work is displayed").toBe(b);
    await lock.release();
    expect(writesOn(from, X), "only the new work is written; the discarded operation never writes").toEqual([enc_(b)]);
    expect(bytes(X)).toBe(enc_(b));
    expect(shown(X), "a late completion never revives discarded state").toBe(b);
    expect(retryOf(X)).toBeNull();
    expect(statusText()).toBe(W.en.saved);
  });
});

// ---------------------------------------------------------------------------
// The held per-key lock (H8): all seven pane fields and the three Topbar fields
// ---------------------------------------------------------------------------

describe.each(FIELDS.map(field => ({ id: field.id })))("H8 pane $id", ({ id }) => {
  const field = byId(id);
  it(`H8 ${id}: a held per-key lock serializes the write while the latest choice displays and applies immediately and the controls stay enabled`, async () => {
    await mountApp();
    const lock = await hold(keyLock(field));
    const from = mark();
    await pick(field, CHOICE[id]);
    await flush();
    const lang = uiLang();
    expect(bytes(field), "H8: the held per-key lock keeps the physical bytes unchanged").toBeNull();
    expect(locks().waiting(keyLock(field), "product"), "H8: the write queues behind the held per-key lock").toBeGreaterThan(0);
    expect(shown(field, lang), "§5.4 the latest choice displays immediately").toBe(CHOICE[id]);
    expect(applied(field), "§5.4 the latest choice applies immediately").toBe(appliedFor(field, CHOICE[id]));
    expect(says(msg.saving(field, lang)), `pending feedback "${msg.saving(field, lang)}"`).toBe(true);
    expect(enabled(paneControl(field, OTHER[id], lang)), "§5.4 controls stay enabled while the operation is pending").toBe(true);
    expect(topbarStatus(), "§7.2 a pending-only write shows no Topbar status").toBeNull();
    expect(successShown(), "no saved line while pending").toBe(false);
    expect(warns(), "§7.3 pending work warns on unload").toBe(true);
    await lock.release();
    expect(writesOn(from, field), "exactly the latest bytes are written after release").toEqual([enc(field, CHOICE[id])]);
    expect(says(msg.saving(field, uiLang())), "pending feedback clears").toBe(false);
    expect(warns()).toBe(false);
    expect(statusText(), "the completed latest success shows the saved line").toBe(W[uiLang()].saved);
  });
});

describe.each([LANG, THEME, DENSITY].map(field => ({ id: field.id })))("H8 Topbar $id", ({ id }) => {
  const field = byId(id);
  it(`H8 ${id}: a Topbar choice held behind the real per-key lock shows no status, keeps the options enabled and writes exactly once after release`, async () => {
    await mountApp();
    const lock = await hold(keyLock(field));
    const from = mark();
    chooseTopbar(field, CHOICE[id]);
    await flush();
    const lang = uiLang();
    expect(bytes(field), "H8: the held per-key lock keeps the Topbar write pending").toBeNull();
    expect(topbarChecked(field, lang), "the Topbar shows the choice").toBe(CHOICE[id]);
    expect(applied(field), "the document applies the choice").toBe(appliedFor(field, CHOICE[id]));
    expect(enabled(topbarOption(field, OTHER[id], lang)), "host row c: the Topbar options stay enabled").toBe(true);
    expect(topbarStatus(), "host row c: no Topbar status while pending").toBeNull();
    await lock.release();
    expect(writesOn(from, field), "host row c: exactly one write after release").toEqual([enc(field, CHOICE[id])]);
    expect(topbarStatus(), "no Topbar status after the success").toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Cross-surface latest intent (host row n in Sol form) and H5
// ---------------------------------------------------------------------------

const sameState = () => ({ pane: shown(THEME), topbar: topbarChecked(THEME), doc: applied(THEME) });
const stateOf = (value: Value) => ({ pane: value, topbar: value, doc: appliedFor(THEME, value) });

it("H5 H8 §5.4 pane theme edit then Topbar theme edit with the first held: the latest wins, both surfaces agree in every sampled frame, one lock request per edit", async () => {
  await mountApp();
  const name = keyLock(THEME);
  const lock = await hold(name);
  const before = locks().log.length;
  choose(THEME, "dark");
  await sameFrame();
  expect(sameState(), "§5.4/§10.3: a pane edit is visible on both surfaces in the same frame").toStrictEqual(stateOf("dark"));
  chooseTopbar(THEME, "system");
  await sameFrame();
  expect(sameState(), "H5 §5.4: a Topbar edit is visible in the pane in the same frame").toStrictEqual(stateOf("system"));
  await flush();
  expect(bytes(THEME), "H8: both edits wait behind the held per-key lock").toBeNull();
  const plan = locks().plan(name, 0);
  await lock.release();
  await plan.waitHeld();
  expect(sameState(), "the older completion never makes the newer intent look saved").toStrictEqual(stateOf("system"));
  expect(says(msg.saving(THEME)), "the newer intent is still saving").toBe(true);
  expect(successShown()).toBe(false);
  await plan.release();
  expect(bytes(THEME), "the latest intent's bytes are final").toBe(enc(THEME, "system"));
  expect(locks().productRequests(name, before), "host row n: each edit makes exactly one per-key lock request").toBe(2);
  expect(sameState()).toStrictEqual(stateOf("system"));
});

it("H5 H8 §5.4 Topbar theme edit then pane theme edit with the first held: the latest wins and both surfaces agree", async () => {
  await mountApp();
  const name = keyLock(THEME);
  const lock = await hold(name);
  const before = locks().log.length;
  chooseTopbar(THEME, "dark");
  await sameFrame();
  expect(sameState(), "H5 §5.4: a Topbar edit is visible in the pane in the same frame").toStrictEqual(stateOf("dark"));
  choose(THEME, "system");
  await sameFrame();
  expect(sameState(), "§5.4: the pane edit is visible on both surfaces").toStrictEqual(stateOf("system"));
  await flush();
  expect(bytes(THEME), "H8: both edits wait behind the held per-key lock").toBeNull();
  await lock.release();
  expect(bytes(THEME)).toBe(enc(THEME, "system"));
  expect(locks().productRequests(name, before), "host row n: each edit makes exactly one per-key lock request").toBe(2);
  expect(sameState()).toStrictEqual(stateOf("system"));
});

it.each([THEME, DENSITY].map(field => ({ id: field.id })))("H5 $id: with the pane mounted a Topbar choice is reflected in the pane in the same frame", async ({ id }) => {
  const field = byId(id);
  await mountApp();
  const value = id === "theme" ? "dark" : "compact";
  chooseTopbar(field, value);
  await sameFrame();
  expect(shown(field), "H5: the pane reflects the Topbar choice").toBe(value);
  expect(applied(field)).toBe(appliedFor(field, value));
});

it.each([THEME, DENSITY].map(field => ({ id: field.id })))("H5 $id: after a Topbar choice no bottom action reverts it (the bottom action is activated when present)", async ({ id }) => {
  const field = byId(id);
  await mountApp();
  const value = id === "theme" ? "dark" : "compact";
  chooseTopbar(field, value);
  await flush();
  pre(bytes(field) === enc(field, value), "the Topbar choice was stored");
  const bottom = saveAndApply() ?? retryAll();
  if (bottom) fireEvent.click(bottom);
  await flush();
  expect(bytes(field), "H5: the bottom action never writes the pane's stale value over the Topbar choice").toBe(enc(field, value));
  expect(applied(field), "H5: the Topbar choice stays applied").toBe(appliedFor(field, value));
  expect(topbarChecked(field), "H5: the Topbar keeps the choice").toBe(value);
});

// ---------------------------------------------------------------------------
// Slider streams
// ---------------------------------------------------------------------------

it.each([
  { id: "fontScale" as const, stream: [0.9, 0.95, 1.05] },
  { id: "accentHue" as const, stream: [10, 20, 30] },
])("H8 §5.4 $id slider stream: every input is a new latest intent; the final bytes equal the last value; an earlier completion never makes a later value look saved", async ({ id, stream }) => {
  const field = byId(id);
  await mountApp();
  const name = keyLock(field);
  const lock = await hold(name);
  for (const value of stream) setSlider(field, value);
  await flush();
  const last = stream.at(-1)!;
  expect(bytes(field), "H8: the held per-key lock keeps the stream pending").toBeNull();
  expect(shown(field), "§5.4 the last value is displayed").toBe(last);
  expect(applied(field), "§5.4 the last value is applied").toBe(last);
  const plan = locks().plan(name, 0);
  await lock.release();
  await plan.waitHeld();
  expect(shown(field), "an earlier completion never replaces the displayed latest value").toBe(last);
  expect(says(msg.saving(field)), "the latest value is still saving").toBe(true);
  expect(successShown(), "an earlier completion never makes the later value look saved").toBe(false);
  await plan.release();
  expect(bytes(field), "§5.4 the final bytes equal the last value").toBe(enc(field, last));
  expect(statusText()).toBe(W.en.saved);
});

// ---------------------------------------------------------------------------
// Section 6 orderings on theme and railPos (the other five Reset keys start absent)
// ---------------------------------------------------------------------------

describe.each([THEME, RAIL].map(field => ({ id: field.id as "theme" | "railPos" })))("§6 orderings $id", ({ id }) => {
  const X = byId(id);
  const { stored, a } = PLAN[id];
  const enc_ = (value: Value) => enc(X, value);

  it(`O1 ${id}: pending set → Reset to defaults; the reset is the latest intent and its completion governs`, async () => {
    seedValue(X, stored);
    await mountApp();
    const lock = await hold(keyLock(X));
    choose(X, a);
    await flush();
    expect(bytes(X), "H8: the held per-key lock keeps the pending set from writing").toBe(enc_(stored));
    clickReset(true);
    await flush();
    expect(shown(X), "the reset intent displays the default").toBe(X.defaultValue);
    expect(says(msg.resetting(X)), `pending reset feedback "${msg.resetting(X)}"`).toBe(true);
    expect(successShown(), "no Defaults restored while the reset is pending").toBe(false);
    expect(warns()).toBe(true);
    await lock.release();
    expect(bytes(X), "the latest reset leaves verified absence").toBeNull();
    expect(shown(X)).toBe(X.defaultValue);
    expect(says(msg.notSaved(X)), "the superseded set never surfaces as a failure").toBe(false);
    expect(says(msg.notReset(X))).toBe(false);
    expect(retryOf(X)).toBeNull();
    expect(statusText(), "H9: Defaults restored after all six matching resets completed").toBe(W.en.restored);
    expect(warns()).toBe(false);
  });

  it(`O2 ${id}: pending Reset to defaults → set; the newer set governs and Defaults restored is not claimed`, async () => {
    seedValue(X, stored);
    await mountApp();
    const lock = await hold(keyLock(X));
    clickReset(true);
    await flush();
    expect(bytes(X), "H8: the held per-key lock keeps the pending reset from changing the bytes").toBe(enc_(stored));
    expect(shown(X), "the pending reset displays the default").toBe(X.defaultValue);
    choose(X, a);
    await flush();
    expect(shown(X), "the newer set displays immediately").toBe(a);
    await lock.release();
    expect(bytes(X), "the newer set's completion governs the stored value").toBe(enc_(a));
    expect(shown(X)).toBe(a);
    expect(says(msg.notReset(X)), "the superseded reset never surfaces as a failure").toBe(false);
    expect(says(msg.notSaved(X))).toBe(false);
    expect(retryOf(X)).toBeNull();
    expect(says(W.en.restored), "a newer contrary edit supersedes Defaults restored").toBe(false);
  });

  it(`O3 ${id}: reset → set → reset; the queued set is superseded silently and the final reset governs`, async () => {
    seedValue(X, stored);
    await mountApp();
    const lock = await hold(keyLock(X));
    const from = mark();
    clickReset(true);
    await flush();
    expect(bytes(X), "H8: the held per-key lock keeps the pending reset from changing the bytes").toBe(enc_(stored));
    choose(X, a);
    await flush();
    expect(shown(X)).toBe(a);
    clickReset(true);
    await flush();
    expect(shown(X), "the latest reset displays the default").toBe(X.defaultValue);
    await lock.release();
    expect(bytes(X), "verified absence").toBeNull();
    expect(writesOn(from, X).filter(entry => entry !== "<remove>"), "the superseded queued set never writes").toEqual([]);
    expect(says(msg.notSaved(X)), "the superseded set never surfaces as a failure").toBe(false);
    expect(says(msg.notReset(X))).toBe(false);
    expect(statusText(), "the final reset batch completed").toBe(W.en.restored);
  });

  it(`O4 ${id}: a failed predecessor set → Reset to defaults; the reset succeeds and the failed set never surfaces`, async () => {
    seedValue(X, stored);
    await mountApp();
    const quota = fault({ op: "set", key: X.key, label: `${id} quota` });
    choose(X, a);
    await flush();
    fired(quota, `${id} write`);
    expect(shown(X), "§5.5: the failed set keeps the latest choice").toBe(a);
    need(retryOf(X), `H12: Retry ${X.label.en}`);
    const from = mark();
    clickReset(true);
    await flush();
    expect(bytes(X), "the latest reset removed the bytes").toBeNull();
    expect(writesOn(from, X).filter(entry => entry !== "<remove>"), "the reset never writes").toEqual([]);
    expect(says(msg.notSaved(X)), "the superseded failed set no longer surfaces").toBe(false);
    expect(retryOf(X)).toBeNull();
    expect(statusText()).toBe(W.en.restored);
  });

  it(`O5 ${id}: a failed predecessor reset → set; the latest set governs and the failed reset never surfaces`, async () => {
    seedValue(X, stored);
    await mountApp();
    const refusal = fault({ op: "remove", key: X.key, label: `${id} remove refused` });
    const from = mark();
    clickReset(true);
    await flush();
    expect(writesOn(from, X), `H9 §6: the reset attempts one removal of ${X.key}`).toEqual(["<remove>!"]);
    fired(refusal, `${id} remove`);
    expect(bytes(X), "the refused removal left the bytes").toBe(enc_(stored));
    expect(says(msg.notReset(X)), `H9: "${msg.notReset(X)}" failure feedback`).toBe(true);
    expect(shown(X), "the reset draft displays the intended default").toBe(X.defaultValue);
    choose(X, a);
    await flush();
    expect(shown(X), "the latest set displays").toBe(a);
    expect(bytes(X)).toBe(enc_(a));
    expect(says(msg.notReset(X)), "the superseded failed reset no longer surfaces").toBe(false);
    expect(says(msg.notSaved(X))).toBe(false);
    expect(retryOf(X)).toBeNull();
    expect(says(W.en.restored), "the newer set supersedes Defaults restored").toBe(false);
  });

  it(`O6 ${id}: a failed set and a failed reset with equal displayed values stay distinct intents`, async () => {
    seedValue(X, stored);
    await mountApp();
    const quota = fault({ op: "set", key: X.key, value: enc_(X.defaultValue), label: `${id} quota` });
    choose(X, X.defaultValue);
    await flush();
    fired(quota, `${id} write`);
    expect(shown(X), "§5.5: the failed set of the default value displays the default").toBe(X.defaultValue);
    const first = download();
    fireEvent.click(need(exportButton(), "H12: Export Appearance draft"));
    await flush(2);
    await expectSingleDownload(first, envelope({ [X.id]: SET(X.defaultValue) }), "failed set export");
    const refusal = fault({ op: "remove", key: X.key, label: `${id} remove refused` });
    const from = mark();
    clickReset(true);
    await flush();
    expect(writesOn(from, X), `§6: the reset attempts one removal of ${X.key}`).toEqual(["<remove>!"]);
    fired(refusal, `${id} remove`);
    expect(shown(X), "the reset draft also displays the default").toBe(X.defaultValue);
    expect(says(msg.notReset(X)), "the latest intent is a reset, reported as not reset").toBe(true);
    expect(says(msg.notSaved(X)), "the superseded set is no longer reported").toBe(false);
    const second = download();
    fireEvent.click(need(exportButton(), "Export Appearance draft for the reset draft"));
    await flush(2);
    await expectSingleDownload(second, envelope({ [X.id]: RESET }), "a failed reset exports a reset entry, never a saved default");
    refusal.off();
    quota.off();
    fireEvent.click(need(retryOf(X), `Retry ${X.label.en} for the reset draft`));
    await flush();
    expect(bytes(X), "Retry of the reset draft removes").toBeNull();
    expect(writesOn(from, X), "a reset draft's Retry never writes: the refused removal, then the Retry removal").toEqual(["<remove>!", "<remove>"]);
    expect(retryOf(X)).toBeNull();
  });

  it(`O7 ${id}: discard of a reset draft, then new same-field work survives`, async () => {
    seedValue(X, stored);
    await mountApp();
    const refusal = fault({ op: "remove", key: X.key, label: `${id} remove refused` });
    const resetFrom = mark();
    clickReset(true);
    await flush();
    expect(writesOn(resetFrom, X), `H9 §6: the reset attempts one removal of ${X.key}`).toEqual(["<remove>!"]);
    fired(refusal, `${id} remove`);
    expect(says(msg.notReset(X)), `H9: "${msg.notReset(X)}" failure feedback`).toBe(true);
    const from = mark();
    fireEvent.click(need(discardOf(X), `H12: Discard ${X.label.en}`));
    await flush();
    expect(writes(from), "Discard makes zero set/remove attempts").toEqual([]);
    expect(shown(X), "Discard rereads the stored value").toBe(stored);
    refusal.off();
    choose(X, a);
    await flush();
    expect(bytes(X), "the new same-field work is saved").toBe(enc_(a));
    expect(retryOf(X)).toBeNull();
    expect(says(msg.notReset(X)), "the discarded reset never revives").toBe(false);
  });
});

it.each([THEME, DENSITY].map(field => ({ id: field.id })))("H8 §6 a Topbar $id edit during a pending reset batch supersedes that field's reset intent", async ({ id }) => {
  const field = byId(id);
  const stored = id === "theme" ? "dark" : "compact";
  const value = id === "theme" ? "system" : "compact";
  seedValue(field, stored);
  await mountApp();
  const lock = await hold(keyLock(field));
  clickReset(true);
  await flush();
  expect(bytes(field), "H8: the held per-key lock keeps the pending reset from changing the bytes").toBe(enc(field, stored));
  chooseTopbar(field, value);
  await flush();
  expect(shown(field), "the Topbar edit is the latest intent on both surfaces").toBe(value);
  await lock.release();
  expect(bytes(field), "§6: the Topbar choice governs the stored value").toBe(enc(field, value));
  expect(says(msg.notReset(field)), "the superseded reset never surfaces as a failure").toBe(false);
  expect(says(W.en.restored), "a newer contrary edit supersedes Defaults restored").toBe(false);
});

// ---------------------------------------------------------------------------
// Independent settlement: a conflict coexisting with an unrelated quota failure
// ---------------------------------------------------------------------------

it("H8 §5.7 a conflict on railPos coexists with an unrelated theme quota failure; each settles independently", async () => {
  seedValue(RAIL, "top");
  await mountApp();
  const lock = await hold(keyLock(RAIL));
  choose(RAIL, "right");
  await flush();
  expect(bytes(RAIL), "H8: the held per-key lock serializes the rail write").toBe("top");
  nativeSet.call(localStorage, RAIL.key, "bottom");
  const quota = fault({ op: "set", key: THEME.key, label: "theme quota" });
  choose(THEME, "dark");
  await flush();
  fired(quota, "theme write");
  await lock.release();
  expect(bytes(RAIL), "§5.6 the external rail bytes are preserved").toBe("bottom");
  expect({ rail: Boolean(retryOf(RAIL)), theme: says(msg.notSaved(THEME)) }, "§5.7 both fields are unresolved").toStrictEqual({ rail: true, theme: true });
  expect(statusText(), "two unresolved").toBe(W.en.count(2));
  quota.off();
  fireEvent.click(need(retryOf(THEME), "H12: Retry Theme"));
  await flush();
  expect(bytes(THEME), "the theme Retry succeeds independently").toBe(enc(THEME, "dark"));
  expect(bytes(RAIL), "the rail conflict is untouched").toBe("bottom");
  need(retryOf(RAIL), "the rail conflict stays recoverable");
  expect(statusText(), "one unresolved").toBe(W.en.count(1));
});

// ---------------------------------------------------------------------------
// Controller ruling 5: the inherited Features follow-up 2 ordering, per-field Retry
// ---------------------------------------------------------------------------

it("R5 fu2-retry-theme: in-flight set + Reset + set failure, recovered by Retry Theme: the failed set, one re-write of the superseded value, then one removal; final verified absence", async () => {
  await runRuling5(RULING5["fu2-retry-theme"]);
});

it("R5 fu2-retry-railPos: in-flight set + Reset + set failure, recovered by Retry Sidebar position: the failed set, one re-write of the superseded value, then one removal; final verified absence", async () => {
  await runRuling5(RULING5["fu2-retry-railPos"]);
});

// Referenced for the shared vocabulary.
void ACCENT; void BG; void topbarStatusNamed;
