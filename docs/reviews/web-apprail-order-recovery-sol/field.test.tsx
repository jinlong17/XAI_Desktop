/**
 * Mode `field` (contract r1 section 12, section 5 items 3–7): each failure kind keeps the latest order displayed
 * (H2); Retry once; a pending Retry is inert; Discard with zero writes; the four predecessor orderings; a verified
 * no-op back to the committed order; uncertainty reconciled with one total write; external replacement, removal and
 * restoration preserved as conflicts; late completions after Discard and unmount ignored; the held real per-key lock
 * (H6). Production App with only the auth-session hook substituted; the exclusive Web Lock fixture; the attempt-level
 * Storage injector. Recovery controls are reached only through the section 5 stable selectors.
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import {
  actionsShown, configureApp, configureRegistrations, DEFAULT_ORDER, displayOf, drag, encode, failedDrop, fault, fired, flush, hold, KEY,
  LOCK, lockState, locks, mark, merge, message, messageRole, mountApp, nativeRemove, nativeSet, need, observe, openPanel, panelAction, pre,
  prefTrigger, RAIL_IDS, railButton, railIds, railSuccessClaim, railWrites, raw, rejections, REVERSED, runtimeErrors, seedKey, seedOrder,
  SELF_CHECK_DELEGATION, setup, status, statusNamed, storageSelfCheck, teardown, uiLang, user, W, warns, attempts,
} from "./fixture";

const auth = vi.hoisted(() => {
  const value: Record<string, unknown> = {
    state: "authenticated",
    session: { user: { id: "apprail-sol-A" } },
    client: null,
    coordinator: undefined,
    authError: null,
    signOutFailed: false,
    reportSignOutFailure: undefined,
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: async () => null,
    ensureDeviceIdentity: async () => "apprail-sol-device",
    clearSessionStorage: async () => undefined,
    setSession: () => undefined,
  };
  return { value };
});
vi.mock("../../../packages/web-auth-device-session/src/session", async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, useWebAuthSession: () => auth.value };
});

import { webHostRouteObjects } from "../../../apps/web/src/routes/router";
import { webShellModuleRegistrations } from "../../../apps/web/src/routes/modules/shellRegistrations";

configureApp(webHostRouteObjects);
configureRegistrations(webShellModuleRegistrations);
beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  const result = storageSelfCheck();
  observe("F-B002 self-check", result);
  pre(result.nested === 0 && result.tripwire === 0 && JSON.stringify(result.delegatedPerCall) === JSON.stringify(SELF_CHECK_DELEGATION), `F-B002 self-check: ${JSON.stringify(result)}`);
});

const X = REVERSED[0]!;
const Y1 = REVERSED[3]!;
async function mounted(): Promise<Awaited<ReturnType<typeof mountApp>>> {
  seedOrder(REVERSED);
  const app = await mountApp("/app/tasks");
  pre(JSON.stringify(railIds()) === JSON.stringify(REVERSED), "the rail shows the seeded custom order (all modules visible)");
  return app;
}
/** A settled unsuccessful draft: the latest order displayed, the draft status, the panel with Retry, Discard, Export. */
function expectFailedDraft(tag: string, order: readonly string[], hypothesis = "H2"): void {
  expect(railIds(), `${hypothesis} ${tag}: the latest dropped order stays displayed`).toEqual(order);
  need(statusNamed("draft"), `${hypothesis} ${tag}: the Topbar status with the draft accessible name "${W[uiLang()].statusDraft}"`);
  openPanel(tag);
  expect(message(), `${tag}: "${W[uiLang()].notSaved}"`).toBe(W[uiLang()].notSaved);
  expect(messageRole(), `${tag}: the failure message is an alert`).toBe("alert");
  expect(actionsShown(), `${tag}: Retry, Discard and Export`).toEqual(["retry", "discard", "export"]);
  expect(railSuccessClaim(), `${tag}: no success claim`).toBe(false);
  expect(warns(), `${tag}: the unload warning while the draft exists`).toBe(true);
}
const isAction = (element: Element | null, testid: string): boolean => element?.getAttribute("data-testid") === testid;

// ---------------------------------------------------------------------------
// Section 5 item 4: each failure kind keeps the latest choice, displayed (H2)
// ---------------------------------------------------------------------------

it("H2 §5.4 a quota failure keeps the dropped order displayed with the status, Retry, Discard and Export; the bytes keep the old order", async () => {
  await mounted();
  const { order, quota } = await failedDrop(X, [Y1]);
  fired(quota, "the rail write");
  observe("quota-failed drop", { dropped: order, rail: railIds(), status: status() !== null, retry: document.querySelector('[data-testid="rail-order-retry"]') !== null, unloadWarning: warns(), bytes: raw() });
  expectFailedDraft("quota", order);
  expect(raw(), "H2: the bytes keep the old order").toBe(encode(REVERSED));
  expect(rejections, "no unhandled rejection").toEqual([]);
});

it("H2 §5.4 a throwing setItem (not quota) keeps the dropped order displayed as a failed draft", async () => {
  await mounted();
  const { order, quota } = await failedDrop(X, [Y1], { generic: true });
  fired(quota, "the rail write");
  expectFailedDraft("setItem throws", order);
  expect(raw(), "the bytes keep the old order").toBe(encode(REVERSED));
});

it("H2 §5.4 a throwing getItem during the write is a failed draft; after the read recovers, Retry makes exactly one write", async () => {
  await mounted();
  const unreadable = fault({ op: "get", key: KEY, label: "xai_rail_order read during the write" });
  const from = mark();
  const order = await drag(X, [Y1]);
  fired(unreadable, "the write-time read");
  expectFailedDraft("throwing getItem", order);
  expect(railWrites(from), "nothing is written while the read throws").toEqual([]);
  unreadable.off();
  const retryFrom = mark();
  fireEvent.click(panelAction("retry", "after the read recovers"));
  await flush();
  expect(railWrites(retryFrom), "§5.7: Retry makes exactly one write").toEqual([encode(merge(REVERSED, RAIL_IDS, order)!)]);
  expect(status(), "the status disappears after the verified success").toBeNull();
});

it("H6 §5.4 without navigator.locks every rail write is refused and reported, never written unfenced; Retry after the capability returns writes once", async () => {
  await mounted();
  lockState.missing = true;
  const from = mark();
  const order = await drag(X, [Y1]);
  expect(raw(), "H6/D2 item 3: no unfenced write without Web Locks").toBe(encode(REVERSED));
  expect(railWrites(from), "zero set attempts without the lock").toEqual([]);
  expectFailedDraft("missing Web Locks", order);
  lockState.missing = false;
  const retryFrom = mark();
  fireEvent.click(panelAction("retry", "after Web Locks return"));
  await flush();
  expect(railWrites(retryFrom), "exactly one write after the capability returns").toEqual([encode(merge(REVERSED, RAIL_IDS, order)!)]);
  expect(status(), "no status after the success").toBeNull();
});

it("H6 §5.4 a rejected per-key Web Lock is a failed draft with zero writes; Retry after the lock is allowed writes once", async () => {
  await mounted();
  locks().deny(LOCK);
  const before = locks().log.length;
  const from = mark();
  const order = await drag(X, [Y1]);
  expect(raw(), "H6: a rejected lock never writes").toBe(encode(REVERSED));
  expect(locks().rejectedFor(LOCK, before), "the write requested the per-key lock").toBeGreaterThan(0);
  expect(railWrites(from), "zero set attempts").toEqual([]);
  expectFailedDraft("rejected lock", order);
  locks().allow(LOCK);
  fireEvent.click(panelAction("retry", "after the lock is allowed"));
  await flush();
  expect(raw(), "the Retry committed the A2 merge").toBe(encode(merge(REVERSED, RAIL_IDS, order)!));
});

// ---------------------------------------------------------------------------
// Section 5 item 7: Retry, pending Retry, Discard
// ---------------------------------------------------------------------------

it("H2 §5.7 Retry re-attempts exactly once; after a success the status unmounts and focus moves to .topbar-pref-trigger", async () => {
  await mounted();
  const { order, quota } = await failedDrop(X, [Y1]);
  expectFailedDraft("before Retry", order);
  quota.off();
  const retry = panelAction("retry", "Retry");
  const from = mark();
  await user().click(retry);
  await flush();
  expect(railWrites(from), "§5.7: exactly one write").toEqual([encode(merge(REVERSED, RAIL_IDS, order)!)]);
  expect(status(), "§7.2: the status unmounts after the verified success").toBeNull();
  expect(document.activeElement, "§7.2: focus moves to .topbar-pref-trigger, never <body>").toBe(prefTrigger());
  expect(warns(), "no unload warning after the success").toBe(false);
  expect(railIds(), "the committed order stays displayed").toEqual(order);
});

it("H2 §5.7 a Retry that fails again makes exactly one attempt, keeps the draft and leaves focus on Retry", async () => {
  await mounted();
  const { order, quota } = await failedDrop(X, [Y1]);
  expectFailedDraft("before the failing Retry", order);
  const retry = panelAction("retry", "failing Retry");
  const from = mark();
  await user().click(retry);
  await flush();
  expect(railWrites(from), "§5.7: exactly one attempt, which threw").toEqual([`${encode(merge(REVERSED, RAIL_IDS, order)!)}!`]);
  fired(quota, "the Retry write", 2);
  expect(message(), "the failure message stays").toBe(W.en.notSaved);
  expect(isAction(document.activeElement, "rail-order-retry"), "§9: after a failed Retry focus stays on Retry").toBe(true);
  expect(railIds(), "the draft stays displayed").toEqual(order);
});

it("H2 §5.7 a Retry while the field is pending is inert: the saving message, one lock request, one write after release", async () => {
  await mounted();
  const { order, quota } = await failedDrop(X, [Y1]);
  expectFailedDraft("before the held Retry", order);
  quota.off();
  const lock = await hold(LOCK);
  const before = locks().log.length;
  const from = mark();
  fireEvent.click(panelAction("retry", "held Retry"));
  await flush();
  expect(status(), "A8 rule (a): the status stays rendered while a Retry of that draft is pending").not.toBeNull();
  expect(message(), `§7.2: "${W.en.saving}" while the Retry is pending`).toBe(W.en.saving);
  expect(messageRole(), "the saving message is a status").toBe("status");
  const retryAgain = need(document.querySelector<HTMLButtonElement>('[data-testid="rail-order-retry"]'), "§7.2: Retry stays rendered (inert) while pending");
  fireEvent.click(retryAgain);
  await flush();
  expect(locks().productRequests(LOCK, before), "§5.7: the pending Retry is inert (one lock request)").toBe(1);
  expect(railWrites(from), "nothing is written while held").toEqual([]);
  await lock.release();
  expect(railWrites(from), "exactly one write after release").toEqual([encode(merge(REVERSED, RAIL_IDS, order)!)]);
  expect(status(), "the status disappears").toBeNull();
});

it("H2 §5.7 Discard makes zero set or remove attempts, returns to the committed order and moves focus to .topbar-pref-trigger", async () => {
  await mounted();
  const { order } = await failedDrop(X, [Y1]);
  expectFailedDraft("before Discard", order);
  const discard = panelAction("discard", "Discard");
  const from = mark();
  await user().click(discard);
  await flush();
  expect(railWrites(from), "§5.7: Discard makes zero set or remove attempts").toEqual([]);
  expect(railIds(), "§5.7: the rail returns to the committed order").toEqual([...REVERSED]);
  expect(status(), "the status disappears").toBeNull();
  expect(document.activeElement, "§7.2: focus moves to .topbar-pref-trigger").toBe(prefTrigger());
  expect(warns(), "no unload warning").toBe(false);
});

it("H2 §5.3 a drop back to the committed order over a failed draft is admitted and completes as the engine's verified no-op", async () => {
  await mounted();
  const { order, quota } = await failedDrop(X, [Y1]);
  expectFailedDraft("before the drop back", order);
  quota.off();
  const from = mark();
  const back = await drag(X, [REVERSED[1]!]);
  pre(JSON.stringify(back) === JSON.stringify(REVERSED), "the second gesture restores the committed order");
  expect(railWrites(from), "§5.3: the verified no-op makes zero set attempts").toEqual([]);
  expect(status(), "§5.3: the matching latest success clears the draft").toBeNull();
  expect(railIds(), "the committed order displays").toEqual([...REVERSED]);
  expect(warns(), "no unload warning").toBe(false);
});

// ---------------------------------------------------------------------------
// H6 and section 5 item 3: held lock, identity and latest authority
// ---------------------------------------------------------------------------

it("H6 §5.3 while the real per-key lock is held the bytes are unchanged, the dropped order displays, no status shows and the rail stays operable; one write after release", async () => {
  const app = await mounted();
  const lock = await hold(LOCK);
  const from = mark();
  const order = await drag(X, [Y1]);
  expect(raw(), "H6: the held per-key lock keeps the bytes unchanged").toBe(encode(REVERSED));
  expect(railIds(), "§5.3: the draft displays at once").toEqual(order);
  expect(status(), "A8: a first attempt that is only pending shows no status").toBeNull();
  expect(warns(), "§7.3: the unload warning while the draft is pending").toBe(true);
  fireEvent.click(railButton("calendar"));
  await flush();
  expect(app.router.state.location.pathname, "§5.3: the rail stays operable while held").toBe("/app/calendar");
  await lock.release();
  expect(railWrites(from), "exactly one write after release").toEqual([encode(merge(REVERSED, RAIL_IDS, order)!)]);
  expect(warns(), "no warning after the success").toBe(false);
});

async function twoHeldDrops(): Promise<{ lock: Awaited<ReturnType<typeof hold>>; first: string[]; second: string[]; merged1: string[]; merged2: string[]; before: number; from: number }> {
  await mounted();
  const lock = await hold(LOCK);
  const before = locks().log.length;
  const from = mark();
  const first = await drag(X, [Y1]);
  expect(raw(), "H6: the held lock keeps the bytes unchanged").toBe(encode(REVERSED));
  const merged1 = merge(REVERSED, RAIL_IDS, first)!;
  const second = await drag(first[6]!, [first[1]!]);
  const merged2 = merge(merged1, RAIL_IDS, second)!;
  expect(railIds(), "§5.3: the newer drop supersedes and displays").toEqual(second);
  return { lock, first, second, merged1, merged2, before, from };
}

it("H6 §5.3 host row f: a second drop while the first is held — the latest wins, each drop makes exactly one lock request, the first never acknowledges the second", async () => {
  const run = await twoHeldDrops();
  await run.lock.release();
  expect(raw(), "§5.3: the final bytes are the second merge").toBe(encode(run.merged2));
  expect(locks().productRequests(LOCK, run.before), "host row f: exactly one per-key lock request per drop").toBe(2);
  const written = railWrites(run.from);
  expect(written.at(-1), "the last write is the second merge").toBe(encode(run.merged2));
  expect(written.length <= 2, "at most one write per drop").toBe(true);
  expect(status(), "no status after the latest success").toBeNull();
  expect(railIds(), "the latest order displays").toEqual(run.second);
});

it("H6 §5.4 ordering 1: the predecessor succeeds and the latest fails — the latest stays displayed with the status; Retry writes it", async () => {
  const run = await twoHeldDrops();
  const latest = fault({ op: "set", key: KEY, value: encode(run.merged2), label: "latest fails" });
  await run.lock.release();
  fired(latest, "the latest write");
  expect(raw(), "the predecessor committed").toBe(encode(run.merged1));
  expectFailedDraft("ordering 1", run.second);
  latest.off();
  fireEvent.click(panelAction("retry", "ordering 1 Retry"));
  await flush();
  expect(raw(), "Retry commits the latest").toBe(encode(run.merged2));
  expect(status(), "no status after the latest success").toBeNull();
});

it("H6 §5.4 ordering 2: the predecessor fails while the latest is queued; Retry advances the predecessor without acknowledging the latest, which then commits", async () => {
  const run = await twoHeldDrops();
  const predecessor = fault({ op: "set", key: KEY, value: encode(run.merged1), times: 1, label: "predecessor fails once" });
  await run.lock.release();
  fired(predecessor, "the predecessor write");
  expect(raw(), "the queue is held: nothing committed").toBe(encode(REVERSED));
  expectFailedDraft("ordering 2", run.second);
  const from = mark();
  fireEvent.click(panelAction("retry", "ordering 2 Retry"));
  await flush();
  expect(railWrites(from), "§5.7: Retry re-runs the held predecessor with its own value, then the queued latest runs").toEqual([encode(run.merged1), encode(run.merged2)]);
  expect(raw(), "the latest commits").toBe(encode(run.merged2));
  expect(status(), "only the latest success clears the draft").toBeNull();
});

it("H6 §5.4 ordering 3: repeated failed-predecessor recovery — the first Retry fails again with one attempt, the second succeeds", async () => {
  const run = await twoHeldDrops();
  const predecessor = fault({ op: "set", key: KEY, value: encode(run.merged1), times: 2, label: "predecessor fails twice" });
  await run.lock.release();
  fired(predecessor, "the predecessor write");
  expectFailedDraft("ordering 3", run.second);
  const from = mark();
  fireEvent.click(panelAction("retry", "ordering 3 first Retry"));
  await flush();
  expect(railWrites(from), "the first Retry makes exactly one attempt, which threw").toEqual([`${encode(run.merged1)}!`]);
  expectFailedDraft("ordering 3 after the first Retry", run.second);
  fireEvent.click(panelAction("retry", "ordering 3 second Retry"));
  await flush();
  expect(raw(), "the latest commits after recovery").toBe(encode(run.merged2));
  expect(status(), "no status").toBeNull();
});

it("H6 §5.4 ordering 4: a later failure of the latest — Retry fails again, then succeeds", async () => {
  const run = await twoHeldDrops();
  const latest = fault({ op: "set", key: KEY, value: encode(run.merged2), times: 2, label: "latest fails twice" });
  await run.lock.release();
  fired(latest, "the latest write");
  expect(raw(), "the predecessor committed").toBe(encode(run.merged1));
  expectFailedDraft("ordering 4", run.second);
  fireEvent.click(panelAction("retry", "ordering 4 first Retry"));
  await flush();
  fired(latest, "the Retry write", 2);
  expectFailedDraft("ordering 4 after the first Retry", run.second);
  fireEvent.click(panelAction("retry", "ordering 4 second Retry"));
  await flush();
  expect(raw(), "the latest commits").toBe(encode(run.merged2));
  expect(status(), "no status").toBeNull();
});

// ---------------------------------------------------------------------------
// Section 5 item 5: uncertainty and conflict
// ---------------------------------------------------------------------------

it("§5.5 an uncertain write keeps its grant across a denied read and a denied lock and reconciles with exactly one total write", async () => {
  await mounted();
  const from = mark();
  const merged = merge(REVERSED, RAIL_IDS, (() => { const p = [...REVERSED]; p.splice(0, 1); p.splice(3, 0, X); return p; })())!;
  const readback = fault({ op: "get", key: KEY, after: { op: "set", key: KEY, value: encode(merged) }, times: 1, label: "post-write read" });
  const order = await drag(X, [Y1]);
  pre(JSON.stringify(order) === JSON.stringify(merged), "the oracle predicted the dropped order");
  expect(railIds(), "the latest order stays displayed").toEqual(order);
  need(statusNamed("draft"), "§5.5: an unverified (readback-uncertain) write is reported as not saved");
  fired(readback, "post-write read");
  pre(raw() === encode(merged), "the uncertain write physically reached storage");
  const deniedRead = fault({ op: "get", key: KEY, times: 1, label: "denied verification read" });
  fireEvent.click(panelAction("retry", "Retry under a denied read"));
  await flush();
  expect(deniedRead.fired, "the Retry verification attempted a read").toBe(1);
  need(statusNamed("draft"), "the grant survives a temporarily denied read");
  const before = locks().log.length;
  locks().deny(LOCK);
  fireEvent.click(panelAction("retry", "Retry under a denied lock"));
  await flush();
  expect(locks().rejectedFor(LOCK, before), "the Retry requested the denied per-key lock").toBeGreaterThan(0);
  need(statusNamed("draft"), "the grant survives a temporarily denied lock");
  locks().allow(LOCK);
  fireEvent.click(panelAction("retry", "Retry after restoration"));
  await flush();
  expect(railWrites(from), "§5.5: the uncertainty reconciles with exactly one total write").toEqual([encode(merged)]);
  expect(raw(), "the bytes are the merge").toBe(encode(merged));
  expect(status(), "no status after reconciliation").toBeNull();
});

it("§5.5 an external replacement during a held write stays a preserved conflict; repeated Retry never overwrites; Discard adopts it with zero writes", async () => {
  await mounted();
  const lock = await hold(LOCK);
  const order = await drag(X, [Y1]);
  expect(raw(), "H6: the held per-key lock serializes the write").toBe(encode(REVERSED));
  const replacement = [...RAIL_IDS];
  nativeSet.call(localStorage, KEY, encode(replacement));
  pre(raw() === encode(replacement), "external replacement present (unobserved, OE-1)");
  await lock.release();
  expect(raw(), "§5.5: the external replacement is preserved").toBe(encode(replacement));
  expectFailedDraft("conflict", order, "§5.5");
  const from = mark();
  fireEvent.click(panelAction("retry", "conflict Retry"));
  await flush();
  fireEvent.click(panelAction("retry", "conflict Retry again"));
  await flush();
  expect(railWrites(from), "§5.5: repeated Retry never gains authority to overwrite").toEqual([]);
  expect(raw(), "still the replacement").toBe(encode(replacement));
  fireEvent.click(panelAction("discard", "conflict Discard"));
  await flush();
  expect(railWrites(from), "Discard makes zero attempts").toEqual([]);
  expect(railIds(), "Discard adopts the committed replacement").toEqual(replacement);
  expect(status(), "no status").toBeNull();
});

it("§5.5 an external removal during a held write stays a preserved conflict; Retry never recreates the key; Discard shows the default", async () => {
  await mounted();
  const lock = await hold(LOCK);
  const order = await drag(X, [Y1]);
  expect(raw(), "H6: the held per-key lock serializes the write").toBe(encode(REVERSED));
  nativeRemove.call(localStorage, KEY);
  pre(raw() === null, "external removal present");
  await lock.release();
  expect(raw(), "§5.5: the external removal is preserved").toBeNull();
  expectFailedDraft("removal conflict", order, "§5.5");
  const from = mark();
  fireEvent.click(panelAction("retry", "removal Retry"));
  await flush();
  fireEvent.click(panelAction("retry", "removal Retry again"));
  await flush();
  expect(railWrites(from), "§5.5: repeated Retry never recreates the removed key").toEqual([]);
  expect(raw(), "still absent").toBeNull();
  fireEvent.click(panelAction("discard", "removal Discard"));
  await flush();
  expect(railIds(), "Discard shows the default display").toEqual(displayOf(DEFAULT_ORDER, RAIL_IDS));
});

it("§5.5 an uncertain write whose original bytes are externally restored stays a conflict; a distinct new drop is a new operation", async () => {
  await mounted();
  const predicted = (() => { const p = [...REVERSED]; p.splice(0, 1); p.splice(3, 0, X); return p; })();
  const readback = fault({ op: "get", key: KEY, after: { op: "set", key: KEY, value: encode(predicted) }, times: 1, label: "post-write read" });
  const order = await drag(X, [Y1]);
  pre(JSON.stringify(order) === JSON.stringify(predicted), "the oracle predicted the dropped order");
  need(statusNamed("draft"), "§5.5: the unverified write is reported as not saved");
  fired(readback, "post-write read");
  pre(raw() === encode(order), "the uncertain write physically reached storage");
  nativeSet.call(localStorage, KEY, encode(REVERSED));
  pre(raw() === encode(REVERSED), "original baseline bytes restored externally");
  const from = mark();
  fireEvent.click(panelAction("retry", "Retry after restoration"));
  await flush();
  expect(raw(), "§5.5: the restored original bytes are preserved").toBe(encode(REVERSED));
  need(statusNamed("draft"), "the external restoration stays a conflict");
  fireEvent.click(panelAction("retry", "Retry after restoration again"));
  await flush();
  expect(railWrites(from), "§5.5: repeated Retry never gains authority to overwrite").toEqual([]);
  const third = await drag(order[7]!, [order[2]!]);
  expect(railIds(), "the distinct new drop is displayed").toEqual(third);
  expect(raw(), "the new drop settles as its own operation").toBe(encode(merge(order, RAIL_IDS, third)!));
  expect(status(), "no status after the new operation").toBeNull();
});

// ---------------------------------------------------------------------------
// Section 5 item 7: late completions
// ---------------------------------------------------------------------------

it("H2 §5.7 a late completion after Discard never revives the discarded order or writes", async () => {
  await mounted();
  const { order, quota } = await failedDrop(X, [Y1]);
  expectFailedDraft("before the held Retry", order);
  quota.off();
  const lock = await hold(LOCK);
  fireEvent.click(panelAction("retry", "held Retry"));
  await flush();
  const from = mark();
  fireEvent.click(panelAction("discard", "Discard during the held Retry"));
  await flush();
  expect(railIds(), "Discard returns to the committed order").toEqual([...REVERSED]);
  await lock.release();
  expect(railWrites(from), "§5.7: the late completion after Discard never writes").toEqual([]);
  expect(railIds(), "§5.7: the discarded order is never revived").toEqual([...REVERSED]);
  expect(status(), "no status").toBeNull();
  expect(warns(), "no unload warning").toBe(false);
});

it("H6 §7.6 a held write when the App unmounts refuses on release (live disposal state); no runtime error or rejection", async () => {
  const app = await mounted();
  const lock = await hold(LOCK);
  await drag(X, [Y1]);
  expect(raw(), "H6: the held per-key lock keeps the bytes unchanged").toBe(encode(REVERSED));
  app.unmount();
  const from = mark();
  await lock.release();
  expect(railWrites(from), "§7.6: old callbacks refuse after unmount").toEqual([]);
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
  expect(rejections, "no unhandled rejection").toEqual([]);
});

// ---------------------------------------------------------------------------
// Wording in Chinese
// ---------------------------------------------------------------------------

it("H2 §5 a failed drop in Chinese: the draft accessible name, the message and the action names", async () => {
  seedOrder(REVERSED);
  seedKey("xai_pref_lang", JSON.stringify("zh"));
  await mountApp("/app/tasks");
  pre(uiLang() === "zh", "the UI is in Chinese");
  const { order } = await failedDrop(X, [Y1]);
  expect(railIds(), "H2: the dropped order stays displayed").toEqual(order);
  need(statusNamed("draft", "zh"), `the ZH draft accessible name "${W.zh.statusDraft}"`);
  openPanel("ZH");
  expect(message(), "the ZH failure message").toBe(W.zh.notSaved);
  for (const kind of ["retry", "discard", "export"] as const) {
    const element = panelAction(kind, `ZH ${kind}`, "zh");
    expect((element.textContent ?? "").includes(W.zh[kind].label), `ZH visible label "${W.zh[kind].label}"`).toBe(true);
  }
  expect(attempts(0, [KEY], ["remove"]), "no removal of the key").toEqual([]);
});
