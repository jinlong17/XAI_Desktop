/**
 * Mode `departure` (contract r2 section 12, cases D1–D13; sections 6 and 7 items 3–6): `DashboardModule` with a
 * recording coordinator registration, and the production Dashboard registration with the shared coordinator inside the
 * real Shell (AppRail, Topbar) on a memory router.
 *
 * Positive controls that must PASS at `f9eb4b1`: D1 (Header-only equivalence; the expected values are the recorded
 * `f9eb4b1` outcomes of the accepted Header path), D10 (ticks) and D5's zero-confirm recorder (no App steps run in
 * Sol, so the recorder must hold zero calls in total; contract section 12 rule 12).
 *
 * Every departure through the AppRail selects `.app-rail .rail-items .rail-btn` by its accessible name and activates
 * it by a single click (rule 13); the Topbar census asserts both App-level statuses absent (rule 11). Release-once
 * follows rule 16: one router commit for programmatic navigation and AppRail clicks, one POP commit for Back/Forward,
 * and for sign-out one resolution and no router commit.
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import type { ComponentType } from "react";
import { act, fireEvent } from "@testing-library/react";
import { webShellModuleRegistrations } from "../../../apps/web/src/routes/modules/shellRegistrations";
import { requestSettingsDeparture } from "../../../apps/web/src/routes/modules/settingsDeparture";
import {
  action, assertSelfCheck, attempts, blockState, bus, bytes, census, choose, clickRail, clockMounted, clockShell, clockWrites, configureRoute,
  confirmer, confirmsByClass, DASH_ORDER_KEY, departures, dialog, dialogButton, dialogFor, dialogState, download, endWidgetDrag, envelope,
  exportButton, expectQuiet, FAILED, failChoice, failHeaderSave, fieldWrites, flush, ghostClock, headerNoteKey, headerRetry, historyMutations,
  hold, HEADER_DRAFT, KEY, LOCK, mark, mountClock, mountModule, mountRoute, moveWidgetDrag, need, NONE, nonNavigationBus, observe, pre,
  probeWidget, productStorageEvents, raw, recorder, region, seed, seedHeader, seedKey, setup, shown, startWidgetDrag, teardown, unload,
  W, wait, warns, writes, click, nativeSet, type Lang, type RouteMount,
} from "./fixture";

const dashboard = webShellModuleRegistrations.find(entry => entry.moduleId === "dashboard");
const DashboardRoute = dashboard?.children?.find(child => child.path === "")?.render as ComponentType | undefined;
configureRoute(DashboardRoute as ComponentType, webShellModuleRegistrations as unknown[]);

let noteKey = "";
beforeEach(() => {
  setup();
  noteKey = headerNoteKey();
  seedHeader(noteKey);
  seedKey(DASH_ORDER_KEY, JSON.stringify(["clock", "mini-cal"]));
  seed("style", "classic");
  seed("timezone", "local");
});
afterEach(() => { teardown(); });

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  assertSelfCheck();
  pre(typeof DashboardRoute === "function", "the production Dashboard route component is resolved from the archive's shell registrations");
});

/** The Header's accepted export of this fixture's failed note save, as recorded at f9eb4b1 (D1). */
const HEADER_EXPORT = { version: 1, kind: "dashboard-note-draft", note: HEADER_DRAFT, noteOffset: 0 };

async function route(options: { lang?: Lang; entries?: string[]; index?: number; strict?: boolean } = {}): Promise<RouteMount> {
  const app = await mountRoute(options);
  census("mount");
  pre(clockMounted(), "the Clock widget is mounted on the Dashboard");
  return app;
}
const held = (app: RouteMount): boolean => app.router.state.location.pathname === "/app/dashboard";

// ---------------------------------------------------------------------------
// D1 Header-only equivalence (positive control at f9eb4b1)
// ---------------------------------------------------------------------------

it("D1 Header-only equivalence: an AppRail click is held under \"Dashboard header\"; dialog Export downloads the Header file once; dialog Discard proceeds once", async () => {
  const app = await route();
  await failHeaderSave(noteKey);
  const from = app.locations.length;
  const busFrom = bus.length;
  clickRail("tasks");
  await flush();
  census("held");
  expect(held(app), "D1 the AppRail click is held").toBe(true);
  expect(dialogState(), "D1 the dialog names the Header").toStrictEqual(dialogFor(W.en.header));
  expect(bus.slice(busFrom).map(event => event.detail), "§10.7 navigation-caused shell events as at f9eb4b1").toStrictEqual([{ moduleId: "tasks", source: "app-rail" }]);
  const harness = download();
  click(need(dialogButton(W.en.dialogExport), "D1 dialog Export"));
  await flush();
  expect(harness.clicks.map(entry => entry.download), "D1 one Header file").toEqual(["dashboard-note-draft.json"]);
  expect(await harness.jsonFor("dashboard-note-draft.json"), "D1 the Header export content").toStrictEqual(HEADER_EXPORT);
  expect(held(app), "D1 Export never releases navigation").toBe(true);
  const discarded = mark();
  click(need(dialogButton(W.en.dialogDiscard), "D1 dialog Discard"));
  await flush();
  expect(departures(app, from), "D1 exactly one navigation commit to the AppRail target").toEqual(["PUSH:/app/tasks"]);
  expect(attemptsOn(discarded, [noteKey, KEY.style, KEY.timezone]), "D1 dialog Discard writes nothing").toEqual([]);
  expect(confirmer.calls, "rule 12 zero confirms").toEqual([]);
  expectQuiet("D1 discard");
});

it("D1 Header-only equivalence: a successful Header Retry auto-releases the held AppRail click exactly once", async () => {
  const app = await route();
  const noteQuota = await failHeaderSave(noteKey);
  const from = app.locations.length;
  clickRail("tasks");
  await flush();
  expect(held(app), "D1 held").toBe(true);
  expect(dialogState()).toStrictEqual(dialogFor(W.en.header));
  noteQuota.off();
  click(headerRetry());
  await flush(24);
  expect(raw(noteKey), "D1 the Header Retry saved the note").toBe(HEADER_DRAFT);
  expect(departures(app, from), "D1 exactly one auto-release").toEqual(["PUSH:/app/tasks"]);
  expect(dialog(), "the dialog closed").toBeNull();
  expectQuiet("D1 auto-release");
});

it("D1 Header-only equivalence: sign-out with a failed Header save is held under \"Dashboard header\"; Stay resolves false; zero confirms", async () => {
  const app = await route();
  await failHeaderSave(noteKey);
  let outcome: unknown = "pending";
  await act(async () => { void requestSettingsDeparture("sign-out").then(value => { outcome = value; }); });
  await flush();
  expect(outcome, "D1 the sign-out request is pending").toBe("pending");
  expect(dialogState()).toStrictEqual(dialogFor(W.en.header));
  click(need(dialogButton(W.en.stay), "D1 Stay"));
  await flush();
  expect(outcome, "D1 Stay resolves false").toBe(false);
  expect(historyMutations(app), "D1 zero history mutations").toEqual([]);
  expect(confirmer.calls, "rule 12 zero confirms").toEqual([]);
  expectQuiet("D1 sign-out");
});

function attemptsOn(from: number, keys: string[]): string[] {
  return writes(from).filter(entry => keys.some(key => entry.startsWith(`set:${key}=`) || entry === `remove:${key}`));
}

// ---------------------------------------------------------------------------
// D2 a Clock failure holds navigation under "Clock"
// ---------------------------------------------------------------------------

it("D2 H5 §7.3 a failed Clock choice holds programmatic navigation under \"Clock\"; dialog Export exports the Clock draft; Stay keeps everything; dialog Discard writes nothing and navigates once", async () => {
  const app = await route();
  await failChoice("style", "analog");
  const from = app.locations.length;
  await act(async () => { await app.router.navigate("/app/tasks"); });
  await flush();
  census("held");
  expect(held(app), "H5 §7.3 programmatic navigation is held while the Clock has a failed draft").toBe(true);
  expect(dialogState(), "§5 the dialog names the Clock").toStrictEqual(dialogFor(W.en.participant));
  const harness = download();
  click(need(dialogButton(W.en.dialogExport), "§7.3 dialog Export"));
  await flush();
  expect(harness.clicks.map(entry => entry.download), "§8 the dialog Export downloads clock-draft.json once").toEqual(["clock-draft.json"]);
  expect(await harness.jsonFor("clock-draft.json")).toStrictEqual(envelope({ style: "analog" }));
  expect(held(app), "§7.3 Export never releases navigation").toBe(true);
  expect(blockState("style"), "§7.3 Export never clears drafts").toStrictEqual(FAILED);
  click(need(dialogButton(W.en.stay), "§7.3 Stay"));
  await flush();
  expect(historyMutations(app, from), "§7.3 Stay: zero history mutations").toEqual([]);
  expect(blockState("style"), "§7.3 Stay keeps the draft").toStrictEqual(FAILED);
  expect(shown("style")).toBe("analog");
  clickRail("tasks");
  await flush();
  expect(held(app), "§7.3 the next AppRail click is held again").toBe(true);
  const discarded = mark();
  click(need(dialogButton(W.en.dialogDiscard), "§7.3 dialog Discard"));
  await flush();
  expect(clockWrites(discarded), "§6.7 dialog Discard makes zero set/remove attempts on both Clock keys").toEqual([]);
  expect(departures(app, from), "rule 16 exactly one navigation").toEqual(["PUSH:/app/tasks"]);
  expect(bytes("style")).toBe("classic");
  expect(productStorageEvents(), "§10.7 zero Clock StorageEvents").toEqual([]);
  expect(nonNavigationBus(), "§10.7 zero Clock bus events").toEqual([]);
  expectQuiet("D2");
});

it("D2 H5 §7.3 ZH: a failed Clock timezone choice holds an AppRail click under \"时钟\"", async () => {
  const app = await route({ lang: "zh" });
  await failChoice("timezone", "tokyo");
  clickRail("tasks", "zh");
  await flush();
  census("held");
  expect(held(app), "H5 the AppRail click is held").toBe(true);
  expect(dialogState(), "§5 the ZH dialog names 时钟").toStrictEqual(dialogFor(W.zh.participant, "zh"));
  expectQuiet("D2 zh");
});

it("D2 H5 §7.3 row f: a failed Clock choice holds the Mini Calendar goTo; Stay keeps the Dashboard; Discard navigates once", async () => {
  const app = await route();
  await failChoice("style", "split");
  const jump = document.querySelector<HTMLElement>(".mc-jump");
  pre(jump, "the Mini Calendar open action is mounted");
  const from = app.locations.length;
  fireEvent.click(jump);
  await flush();
  expect(held(app), "H5 the widget goTo is held").toBe(true);
  expect(dialogState()).toStrictEqual(dialogFor(W.en.participant));
  click(need(dialogButton(W.en.stay), "Stay"));
  await flush();
  expect(held(app), "Stay keeps the Dashboard").toBe(true);
  fireEvent.click(jump);
  await flush();
  click(need(dialogButton(W.en.dialogDiscard), "dialog Discard"));
  await flush();
  expect(departures(app, from), "rule 16 exactly one navigation to the Calendar").toEqual(["PUSH:/app/calendar"]);
  expectQuiet("D2 goTo");
});

it("D2 matrix row 3 §6.7: a source-only Clock issue (malformed bytes) never holds sign-out or an AppRail click", async () => {
  nativeSet.call(localStorage, KEY.style, "bogus");
  pre(raw(KEY.style) === "bogus", "seeded malformed style bytes (a section 5 item 2 value; source-truth case)");
  const app = await route();
  const from = app.locations.length;
  let outcome: unknown = "pending";
  await act(async () => { void requestSettingsDeparture("sign-out").then(value => { outcome = value; }); });
  await flush();
  expect(outcome, "§6.7 a source-only issue is never blocking: sign-out resolves true").toBe(true);
  expect(dialog(), "no dialog for a source-only issue").toBeNull();
  clickRail("tasks");
  await flush();
  expect(departures(app, from), "§6.7 matrix row 3: the AppRail click is not held").toEqual(["PUSH:/app/tasks"]);
  expect(raw(KEY.style), "the malformed bytes are never rewritten").toBe("bogus");
  expect(confirmer.calls).toEqual([]);
  expectQuiet("D2 source-only");
});

// ---------------------------------------------------------------------------
// D3 a pending Clock write behind the real lock
// ---------------------------------------------------------------------------

it("D3 H5 §6.8 a pending write behind the real lock holds an AppRail click; dialog Export exports the pending draft; on release exactly one write and one auto-release", async () => {
  const app = await route();
  const lock = await hold(LOCK.style);
  const from = mark();
  choose("style", "analog");
  await flush();
  expect(bytes("style"), "H3 the held per-key lock keeps the bytes unchanged").toBe("classic");
  expect(blockState("style"), "matrix row 2: pending shows no block").toStrictEqual(NONE);
  expect(exportButton(), "matrix row 1: no inline Export for pending-only").toBeNull();
  const locationsFrom = app.locations.length;
  clickRail("tasks");
  await flush();
  expect(held(app), "H5 §6.7 a pending draft blocks").toBe(true);
  expect(dialogState()).toStrictEqual(dialogFor(W.en.participant));
  const harness = download();
  click(need(dialogButton(W.en.dialogExport), "matrix row 1: the dialog Export works for pending-only"));
  await flush();
  expect(harness.clicks.map(entry => entry.download)).toEqual(["clock-draft.json"]);
  expect(await harness.jsonFor("clock-draft.json"), "§8 the pending draft is exported").toStrictEqual(envelope({ style: "analog" }));
  await lock.release();
  await flush(24);
  expect(fieldWrites(from, "style"), "§6.8 exactly one write").toEqual(["analog"]);
  expect(departures(app, locationsFrom), "§6.8 rule 16 the intent is released exactly once to the AppRail target").toEqual(["PUSH:/app/tasks"]);
  expect(dialog()).toBeNull();
  expectQuiet("D3");
});

it("D3 §5.8 a write in flight when dialog Discard runs may commit the latest choice; nothing throws and no rejection is left", async () => {
  const app = await route();
  const lock = await hold(LOCK.style);
  choose("style", "analog");
  await flush();
  expect(bytes("style"), "H3 the held per-key lock keeps the bytes unchanged").toBe("classic");
  const from = app.locations.length;
  clickRail("tasks");
  await flush();
  expect(held(app), "H5 held").toBe(true);
  click(need(dialogButton(W.en.dialogDiscard), "dialog Discard"));
  await flush();
  expect(departures(app, from), "rule 16 one navigation").toEqual(["PUSH:/app/tasks"]);
  await lock.release();
  expect(["classic", "analog"].includes(bytes("style") ?? ""), "§5.8 the bytes are the committed baseline or the in-flight latest choice").toBe(true);
  expectQuiet("D3 in-flight discard");
});

// ---------------------------------------------------------------------------
// D4 POP
// ---------------------------------------------------------------------------

for (const direction of ["Back", "Forward"] as const) {
  it(`D4 H5 §7.3 a failed Clock choice holds ${direction} (POP); a successful Retry releases it exactly once`, async () => {
    const app = direction === "Back"
      ? await route({ entries: ["/app/tasks", "/app/dashboard"], index: 1 })
      : await route({ entries: ["/app/dashboard", "/app/tasks"], index: 0 });
    const injected = await failChoice("style", "minimal");
    const from = app.locations.length;
    await act(async () => { await app.router.navigate(direction === "Back" ? -1 : 1); });
    await flush();
    expect(held(app), `H5 ${direction} is held`).toBe(true);
    expect(dialogState()).toStrictEqual(dialogFor(W.en.participant));
    injected.off();
    const retried = mark();
    click(need(action("style", "retry"), "§5.5 Retry Clock style"));
    await flush(24);
    expect(fieldWrites(retried, "style"), "one write").toEqual(["minimal"]);
    expect(departures(app, from), "§6.8 rule 16 one POP release").toEqual(["POP:/app/tasks"]);
    expect(dialog()).toBeNull();
    expectQuiet(`D4 ${direction}`);
  });
}

// ---------------------------------------------------------------------------
// D5 sign-out through requestSettingsDeparture
// ---------------------------------------------------------------------------

it("D5 H5 §7.5 sign-out with a Clock draft is held: Stay resolves false with zero history mutations; Discard resolves true with zero writes and no router commit", async () => {
  const app = await route();
  await failChoice("style", "analog");
  let first: unknown = "pending";
  await act(async () => { void requestSettingsDeparture("sign-out").then(value => { first = value; }); });
  await flush();
  expect(first, "H5 §7.5 the sign-out request is held").toBe("pending");
  expect(dialogState()).toStrictEqual(dialogFor(W.en.participant));
  click(need(dialogButton(W.en.stay), "Stay"));
  await flush();
  expect(first, "§7.5 Stay resolves false").toBe(false);
  expect(historyMutations(app), "zero history mutations").toEqual([]);
  expect(blockState("style"), "drafts kept").toStrictEqual(FAILED);
  let second: unknown = "pending";
  await act(async () => { void requestSettingsDeparture("sign-out").then(value => { second = value; }); });
  await flush();
  const discarded = mark();
  click(need(dialogButton(W.en.dialogDiscard), "dialog Discard"));
  await flush();
  expect(second, "§7.5 Discard resolves true").toBe(true);
  expect(clockWrites(discarded), "§7.5 zero writes on both Clock keys").toEqual([]);
  expect(historyMutations(app), "rule 16 sign-out makes no router commit").toEqual([]);
  expect(confirmer.calls, "rule 12 zero confirms").toEqual([]);
  expectQuiet("D5");
});

it("D5 rule 12 recorder (positive control): with a Clock draft and no App steps, every sign-out path records zero window.confirm calls of every class", async () => {
  await route();
  await failChoice("style", "analog");
  const settle = async (choice: "stay" | "discard"): Promise<unknown> => {
    let outcome: unknown = "pending";
    await act(async () => { void requestSettingsDeparture("sign-out").then(value => { outcome = value; }); });
    await flush();
    expect(confirmsByClass(), "rule 12 zero confirms when the dialog appears or the request resolves").toStrictEqual({ rail: 0, appearance: 0, other: 0 });
    const button = dialogButton(choice === "stay" ? W.en.stay : W.en.dialogDiscard);
    if (button) { click(button); await flush(); }
    return outcome;
  };
  await settle("stay");
  await settle("discard");
  expect(confirmer.calls, "rule 12 zero confirms in total").toEqual([]);
  expectQuiet("D5 recorder");
});

// ---------------------------------------------------------------------------
// D6 combined Header and Clock (host row k)
// ---------------------------------------------------------------------------

it("D6 H6 k1: a failed Header save and a failed Clock choice hold an AppRail click under \"Dashboard\"; dialog Export exports both once; dialog Discard discards both and navigates once", async () => {
  const app = await route();
  await failHeaderSave(noteKey);
  await failChoice("style", "analog");
  const from = app.locations.length;
  clickRail("tasks");
  await flush();
  census("held");
  expect(held(app), "held").toBe(true);
  expect(dialogState(), "H6 §6.6 two blocking participants are labelled \"Dashboard\"").toStrictEqual(dialogFor(W.en.combined));
  const harness = download();
  click(need(dialogButton(W.en.dialogExport), "dialog Export"));
  await flush();
  expect([...harness.clicks.map(entry => entry.download)].sort(), "H6 §6.6 one activation exports each participant exactly once").toEqual(["clock-draft.json", "dashboard-note-draft.json"]);
  expect(await harness.jsonFor("clock-draft.json")).toStrictEqual(envelope({ style: "analog" }));
  expect(await harness.jsonFor("dashboard-note-draft.json"), "the Header file keeps its accepted format").toStrictEqual(HEADER_EXPORT);
  const discarded = mark();
  click(need(dialogButton(W.en.dialogDiscard), "dialog Discard"));
  await flush();
  expect(attemptsOn(discarded, [noteKey, KEY.style, KEY.timezone]), "H6 dialog Discard writes nothing").toEqual([]);
  expect(departures(app, from), "rule 16 exactly one navigation").toEqual(["PUSH:/app/tasks"]);
  expectQuiet("D6 k1");
});

it("D6 H6 k2: a Clock Retry success keeps the hold under \"Dashboard header\"; a Header Retry success then releases it once", async () => {
  const app = await route();
  const noteQuota = await failHeaderSave(noteKey);
  const clockQuota = await failChoice("style", "analog");
  const from = app.locations.length;
  clickRail("tasks");
  await flush();
  expect(dialogState(), "H6 the combined label").toStrictEqual(dialogFor(W.en.combined));
  clockQuota.off();
  click(need(action("style", "retry"), "§5.5 Retry Clock style"));
  await flush(24);
  expect(bytes("style")).toBe("analog");
  expect(held(app), "§6.8 the Header still blocks: the hold continues").toBe(true);
  expect(dialogState(), "§6.6 one blocking participant: the Header's label").toStrictEqual(dialogFor(W.en.header));
  noteQuota.off();
  click(headerRetry());
  await flush(24);
  expect(departures(app, from), "rule 16 one release").toEqual(["PUSH:/app/tasks"]);
  expectQuiet("D6 k2");
});

it("D6 H6 ZH: the combined label is \"工作台\"", async () => {
  const app = await route({ lang: "zh" });
  await failHeaderSave(noteKey, "zh");
  await failChoice("style", "analog");
  clickRail("tasks", "zh");
  await flush();
  expect(held(app)).toBe(true);
  expect(dialogState(), "H6 the ZH combined label").toStrictEqual(dialogFor(W.zh.combined, "zh"));
  expectQuiet("D6 zh");
});

// ---------------------------------------------------------------------------
// D7 combined members through the recording registration (section 6 items 2–6)
// ---------------------------------------------------------------------------

interface Fake { token: object; label: string; current: boolean; blocking: boolean; exports: number; discards: number; throws: boolean }
function fake(label: string): Fake { return { token: {}, label, current: true, blocking: true, exports: 0, discards: 0, throws: false }; }
const calls: string[] = [];
function guardOf(entry: Fake) {
  return {
    token: entry.token,
    label: entry.label,
    isCurrent: () => entry.current,
    isBlocking: () => entry.blocking,
    exportDraft: () => { entry.exports += 1; calls.push(`export:${entry.label}`); if (entry.throws) throw new Error("clock-sol probe export throws"); },
    discardDraft: () => { entry.discards += 1; calls.push(`discard:${entry.label}`); if (entry.throws) throw new Error("clock-sol probe discard throws"); },
  };
}

it("D7 §6.2–§6.6 the widget render context carries one stable registration; the combined guard follows the participant set, labels, order, isCurrent/isBlocking and identity-based unregister", async () => {
  calls.length = 0;
  seedKey(DASH_ORDER_KEY, JSON.stringify(["clock", "clock-sol-probe"]));
  const record = recorder();
  const probe = probeWidget();
  const view = await mountModule({ record, extra: [probe.registration] });
  const registration = need(probe.seen.at(-1), "§5/§6.3 the widget render context carries registerDepartureGuard");
  view.rerender("zh");
  await flush();
  view.rerender("en");
  await flush();
  expect(new Set(probe.seen).size, "§6.2 the registration function is referentially stable for the mount").toBe(1);
  expect(record.blocking(), "a clean Dashboard does not block").toBe(false);
  const p1 = fake("P1");
  const p2 = fake("P2");
  let off1!: () => void;
  let off2!: () => void;
  await act(async () => { off1 = registration(guardOf(p1) as never); });
  expect(record.blocking(), "§6.6 one participant current and blocking blocks").toBe(true);
  expect(record.label(), "§6.6 exactly one blocking: its label").toBe("P1");
  await act(async () => { off2 = registration(guardOf(p2) as never); });
  expect(record.label(), "§6.6 two blocking: \"Dashboard\"").toBe(W.en.combined);
  const tokens = new Set(record.calls.filter(entry => entry.kind === "register").map(entry => entry.guard.token));
  expect(tokens.size, "§6.5 every upstream combined guard carries the aggregator's one stable token").toBe(1);
  p1.throws = true;
  act(() => { record.current()!.exportDraft(); });
  expect(calls.filter(entry => entry.startsWith("export:")), "§6.6 exportDraft calls each blocking participant once, in participant order; a throw does not stop the others").toEqual(["export:P1", "export:P2"]);
  p1.throws = false;
  p2.current = false;
  expect(record.current()!.isCurrent(), "§6.6 isCurrent requires every participant current").toBe(false);
  expect(record.current()!.isBlocking(), "§6.6 isBlocking: one participant current and blocking").toBe(true);
  expect(record.label(), "§6.6 exactly one current and blocking: its label").toBe("P1");
  p2.current = true;
  const replacement = fake("P1 replacement");
  const replaced = { ...replacement, token: p1.token };
  let offReplaced!: () => void;
  await act(async () => { offReplaced = registration(guardOf(replaced) as never); });
  await act(async () => { off1(); });
  expect(record.label(), "§6.4 an unregister removes only the guard object it registered").toBe(W.en.combined);
  await act(async () => { off2(); });
  expect(record.label(), "§6.4 the replacement keeps its first-seen position and stays registered").toBe("P1 replacement");
  calls.length = 0;
  act(() => { record.current()!.discardDraft(); });
  expect(calls, "§6.6 discardDraft calls each blocking participant once").toEqual(["discard:P1 replacement"]);
  replaced.blocking = false;
  expect(record.blocking(), "no participant blocking").toBe(false);
  expect(([W.en.header, W.en.participant] as string[]).includes(record.label() ?? ""), `§6.6 none blocking: the first current participant's label (got ${record.label()})`).toBe(true);
  await act(async () => { offReplaced(); });
  expectQuiet("D7");
});

// ---------------------------------------------------------------------------
// D8 ghost, D9 removal, D10 ticks, D11 standalone module, D12 unload
// ---------------------------------------------------------------------------

it("D8 §7.7 the drag ghost is inert: zero writes and no participant registration over the drag; the source keeps its draft and its hold", async () => {
  seedKey(DASH_ORDER_KEY, JSON.stringify(["clock"]));
  const record = recorder();
  await mountModule({ record });
  await failChoice("style", "analog");
  const registrations = record.calls.length;
  const from = mark();
  await startWidgetDrag();
  pre(ghostClock(), "the ghost renders a Clock");
  await moveWidgetDrag();
  await endWidgetDrag();
  expect(writes(from), "§7.7 zero set/remove attempts over the drag").toEqual([]);
  expect(record.calls.length, "§7.7 the ghost registers no participant (no upstream change)").toBe(registrations);
  expect(blockState("style"), "H1 §7.7 the source keeps its failed-draft block after the drop").toStrictEqual(FAILED);
  expect({ blocking: record.blocking(), label: record.label() }, "§7.7 departure is still held by the Clock").toStrictEqual({ blocking: true, label: W.en.participant });
  expectQuiet("D8");
});

it("D9 §7.6 A7 removing the Clock widget discards its drafts with zero Clock writes, unregisters the participant and removes the unload warning", async () => {
  seedKey(DASH_ORDER_KEY, JSON.stringify(["clock"]));
  const record = recorder();
  await mountModule({ record });
  await failChoice("style", "analog");
  expect({ blocking: record.blocking(), label: record.label() }, "§6.7 the failed Clock draft blocks before removal").toStrictEqual({ blocking: true, label: W.en.participant });
  const remove = clockShell().querySelector<HTMLElement>(".widget-shell__remove");
  pre(remove, "the Clock widget's remove button is present");
  const from = mark();
  fireEvent.click(remove);
  await flush();
  pre(!clockMounted(), "the removal's order write succeeded and the Clock unmounted");
  expect(clockWrites(from), "§7.6 zero set/remove attempts on both Clock keys by the Clock").toEqual([]);
  expect(record.blocking(), "§7.6 no Clock participant after removal").toBe(false);
  expect(warns(), "§7.6 the unload warning is removed").toBe(false);
  expect(dialog(), "matrix row 6: removal discards without a dialog").toBeNull();
  expectQuiet("D9");
});

it("D10 §6.7 ticks (positive control): over three ticks with no edits, and again with a failed choice present, zero registrations and zero Clock-key storage attempts", async () => {
  seedKey(DASH_ORDER_KEY, JSON.stringify(["clock"]));
  const record = recorder();
  await mountModule({ record });
  const clean = record.calls.length;
  const cleanFrom = mark();
  await wait(3300);
  expect(record.calls.length - clean, "§6.7 zero re-registrations across ticks without changes").toBe(0);
  expect(writes(cleanFrom), "zero writes across ticks").toEqual([]);
  expect(attemptsCount(cleanFrom), "§6.7 zero storage attempts on the Clock keys across ticks").toBe(0);
  const injected = await failChoice("style", "analog");
  await flush();
  const drafted = record.calls.length;
  const draftedFrom = mark();
  await wait(3300);
  expect(record.calls.length - drafted, "§6.7 zero additional re-registrations across ticks with a draft").toBe(0);
  expect(attemptsCount(draftedFrom), "zero Clock-key storage attempts across ticks with a draft").toBe(0);
  injected.off();
  observe("D10 registrations", { clean, drafted, total: record.calls.length });
  expectQuiet("D10");
});

/** Every storage attempt (get/set/remove) on either Clock key since `from`. */
const attemptsCount = (from: number): number => attempts(from, [KEY.style, KEY.timezone]).length;

it("D11 a standalone DashboardModule without a registration: the Clock records and recovers with no participation and no throw", async () => {
  seedKey(DASH_ORDER_KEY, JSON.stringify(["clock"]));
  await mountModule();
  const injected = await failChoice("timezone", "dubai");
  expect(blockState("timezone"), "H2 §6.1 the Clock records its failure without a coordinator").toStrictEqual(FAILED);
  injected.off();
  click(need(action("timezone", "retry"), "§5.5 Retry Clock timezone"));
  await flush();
  expect(bytes("timezone")).toBe("dubai");
  expect(blockState("timezone")).toStrictEqual(NONE);
  expectQuiet("D11");
});

it("D12 §7.4 beforeunload warns only while a Clock draft exists (pending or settled), with zero storage attempts in the handler; not when clean; not after Discard or unmount", async () => {
  const view = await mountClock();
  expect(warns(), "clean: no warning").toBe(false);
  const lock = await hold(LOCK.style);
  choose("style", "analog");
  await flush();
  const pending = unload();
  expect(pending, "H5 §7.4 a pending draft warns, with zero storage attempts in the handler").toStrictEqual({ warned: true, attempts: 0 });
  await lock.release();
  expect(warns(), "no warning after the success").toBe(false);
  const first = await failChoice("timezone", "la");
  expect(unload(), "§7.4 a settled draft warns with zero attempts").toStrictEqual({ warned: true, attempts: 0 });
  click(need(action("timezone", "discard"), "§5.8 Discard Clock timezone"));
  await flush();
  expect(warns(), "§7.4 no warning after Discard").toBe(false);
  first.off();
  await failChoice("timezone", "la");
  expect(warns()).toBe(true);
  view.unmount();
  expect(warns(), "§7.9 no warning after unmount").toBe(false);
  expectQuiet("D12");
});

// ---------------------------------------------------------------------------
// D13 StrictMode
// ---------------------------------------------------------------------------

it("D13 §6.1 inside <StrictMode>: a failed Clock choice holds an AppRail click under \"Clock\" and dialog Discard navigates once (D2)", async () => {
  const app = await route({ strict: true });
  await failChoice("style", "analog");
  const from = app.locations.length;
  clickRail("tasks");
  await flush();
  expect(held(app), "§6.1 the aggregator survives the StrictMode effect re-run: held").toBe(true);
  expect(dialogState()).toStrictEqual(dialogFor(W.en.participant));
  click(need(dialogButton(W.en.dialogDiscard), "dialog Discard"));
  await flush();
  expect(departures(app, from)).toEqual(["PUSH:/app/tasks"]);
  expectQuiet("D13 D2");
});

it("D13 §6.1 inside <StrictMode>: the combined Header and Clock hold is labelled \"Dashboard\" and dialog Export exports both once (D6)", async () => {
  const app = await route({ strict: true });
  await failHeaderSave(noteKey);
  await failChoice("style", "analog");
  const from = app.locations.length;
  clickRail("tasks");
  await flush();
  expect(dialogState(), "§6.1 H6 the combined label inside StrictMode").toStrictEqual(dialogFor(W.en.combined));
  const harness = download();
  click(need(dialogButton(W.en.dialogExport), "dialog Export"));
  await flush();
  expect([...harness.clicks.map(entry => entry.download)].sort()).toEqual(["clock-draft.json", "dashboard-note-draft.json"]);
  click(need(dialogButton(W.en.dialogDiscard), "dialog Discard"));
  await flush();
  expect(departures(app, from)).toEqual(["PUSH:/app/tasks"]);
  expectQuiet("D13 D6");
});
