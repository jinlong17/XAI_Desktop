/**
 * Mode `merge` (contract r1 section 12): the A2 properties P1–P7 over generated in-domain cases — every one of the
 * eight toggleable modules hidden in turn, three hidden at once, unknown ids, `settings` in the stored order, absent
 * and `[]` bases, and a non-permutation input (no merge, no write) — and the App-level R-1 end to end through the
 * real Features pane (H5).
 *
 * The pure merge helper is internal to the fixed product and its API is not normative, so the properties are
 * asserted on the bytes the real AppRail writes: a standalone AppRail inside the real WebShellProvider, whose modules
 * are the production registrations filtered by the real Features filter (exactly App's R), with the real storage
 * engine underneath. The expected value always comes from this oracle's own merge (fixture `merge`), written from A2.
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import {
  BOARD_AT_2, configureApp, configureRegistrations, DEFAULT_ORDER, displayOf, drag, dragEnd, dragOver, dragStart, drop, encode, featureKey,
  featureSwitch, flush, mark, merge, mountApp, mountStandalone, observe, pre, propertyFailures, RAIL_IDS, railIds, railWrites, raw, REVERSED,
  seedHidden, seedOrder, SELF_CHECK_DELEGATION, setup, storageSelfCheck, teardown, TOGGLEABLE, visible,
} from "./fixture";
import { nativeGet } from "./fixture";

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

it("FIXTURE the oracle merge implements A2 on hand-checked examples", () => {
  pre(JSON.stringify(merge(["a", "x", "b"], ["a", "b"], ["b", "a"])) === JSON.stringify(["b", "x", "a"]), "hidden x keeps index 1");
  pre(JSON.stringify(merge(["a", "b"], ["a", "b", "c"], ["c", "a", "b"])) === JSON.stringify(["c", "a", "b"]), "a new visible id is placed by P and the remainder appended");
  pre(JSON.stringify(merge([], ["a", "b"], ["b", "a"])) === JSON.stringify(["b", "a"]), "an empty base stores P");
  pre(merge(["a", "b"], ["a", "b"], ["a"]) === null, "a non-permutation has no merge");
  pre(JSON.stringify(displayOf(["x", "b", "a"], ["a", "b", "c"])) === JSON.stringify(["b", "a", "c"]), "D(S, R) skips non-visible ids and appends R \\ S in R order");
  pre(propertyFailures(["a", "x", "b"], ["a", "b"], ["b", "a"], ["b", "x", "a"]).length === 0, "the property checker accepts a correct merge");
  pre(propertyFailures(["a", "x", "b"], ["a", "b"], ["b", "a"], ["b", "a"]).some(name => name.startsWith("P2")), "the property checker rejects a pruned value");
});

/**
 * One generated case on the standalone AppRail: seed S and R, drag the first displayed module over the k-th, check the
 * written bytes against the oracle merge and P1–P4, then re-enable every module and check P5 for each hidden id that
 * had a stored index and only visible ids before it.
 */
async function generated(tag: string, stored: readonly string[] | null, hidden: readonly string[], k = 4): Promise<void> {
  if (stored !== null) seedOrder(stored);
  const base = stored ?? DEFAULT_ORDER;
  const rail = visible(hidden);
  const view = await mountStandalone(hidden);
  pre(JSON.stringify(railIds()) === JSON.stringify(displayOf(base, rail)), `${tag}: the standalone rail displays D(S, R)`);
  const shown = railIds();
  const from = mark();
  const order = await drag(shown[0]!, [shown[k]!]);
  const expected = merge(base, rail, order);
  pre(expected !== null, `${tag}: P is a permutation of D(S, R)`);
  const written: unknown = JSON.parse(raw() ?? "null");
  observe(`${tag} written`, { stored: base, hidden, order, written, expected });
  expect(propertyFailures(base, rail, order, written), `${tag}: P1–P4 hold for the written value (H5 when a P2 fails)`).toEqual([]);
  expect(raw(), `${tag}: the bytes are exactly the A2 merge`).toBe(encode(expected));
  expect(railWrites(from).filter(entry => !entry.endsWith("!")).length, `${tag}: one write for one drop`).toBe(1);
  expect(railIds(), `${tag}: the rail displays P`).toEqual(order);
  view.setHidden([]);
  await flush();
  const after = railIds();
  for (const id of hidden) {
    const index = base.indexOf(id);
    if (index < 0) continue;
    if (!expected.slice(0, index).every(entry => RAIL_IDS.includes(entry))) continue;
    expect(after.indexOf(id), `${tag}: P5 re-enabled ${id} displays at its stored index ${index}`).toBe(index);
  }
}

for (const id of TOGGLEABLE) {
  it(`H5 A2 P1–P5 ${id} hidden over a full custom order: the drop keeps ${id} at its stored index and it returns there when re-enabled`, async () => {
    await generated(`${id} hidden`, REVERSED, [id]);
  });
}

it("H5 A2 P1–P5 three modules hidden at once (Boards, Habits, Pomodoro)", async () => {
  await generated("three hidden", REVERSED, ["board", "habits", "pomodoro"]);
});

it("H5 A2 P1–P5 three different modules hidden at once (Tasks, Calendar, Meditation) with the drag reaching the far end", async () => {
  await generated("three hidden far", BOARD_AT_2, ["tasks", "calendar", "meditation"], 9);
});

it("H5 A2 P2/P3 unknown ids keep their stored indices (REL-07: bytes this build does not understand are never destroyed)", async () => {
  const stored = ["ghost-module", "tasks", "board", "ghost-2", ...RAIL_IDS.filter(id => !["tasks", "board"].includes(id))];
  await generated("unknown ids", stored, []);
});

it("H5 A2 P2 `settings` and a hidden module in the stored order both keep their indices", async () => {
  const stored = ["matrix", "settings", "habits", ...RAIL_IDS.filter(id => !["matrix", "habits"].includes(id))];
  await generated("settings and habits hidden", stored, ["habits"]);
});

it("H5 A2 P7 absent bytes with Habits hidden: `habits` keeps its default index 7", async () => {
  await generated("P7 absent habits", null, ["habits"]);
  expect((JSON.parse(raw() ?? "[]") as string[])[7], "P7: habits keeps index 7 of DEFAULT_RAIL_ORDER").toBe("habits");
});

it("H5 A2 P7 absent bytes with Boards and Meditation hidden keep their default indices", async () => {
  await generated("P7 absent board+meditation", null, ["board", "meditation"]);
});

it("PC A2 P3/P4 a `[]` base with Boards hidden stores exactly P (nothing to keep)", async () => {
  await generated("[] base", [], ["board"]);
});

it("PC A2 P6 every module visible over a full custom order: S' = P", async () => {
  await generated("P6 all visible", REVERSED, []);
  expect(JSON.parse(raw()!), "P6: S' equals P").toEqual(railIds());
});

it("§6.7 A2 a non-permutation input (R changes mid-drag: Boards re-enabled) makes no merge and zero writes", async () => {
  seedOrder(BOARD_AT_2);
  const view = await mountStandalone(["board"]);
  const shown = railIds();
  const from = mark();
  const gesture = dragStart(shown[0]!);
  dragOver(gesture, shown[0]!, shown[3]!);
  view.setHidden([]);
  await flush();
  pre(merge(BOARD_AT_2, visible([]), gesture.expected) === null, "the preview P is no longer a permutation of D(S, R) for the new R");
  drop(gesture, shown[3]!);
  dragEnd(gesture, shown[0]!);
  await flush();
  expect(railWrites(from), "§6.7: zero attempts when P is not a permutation of D(S, R) at drop time").toEqual([]);
  expect(raw(), "the bytes are unchanged").toBe(encode(BOARD_AT_2));
  expect(railIds(), "the rail displays D(S, R) for the current S and R").toEqual(displayOf(BOARD_AT_2, RAIL_IDS));
});

// ---------------------------------------------------------------------------
// App-level R-1 end to end through the real Features pane (host row c at the Sol layer)
// ---------------------------------------------------------------------------

it("H5 R-1 end to end: Boards turned off in the real Features pane, a drag, then Boards back on — `board` keeps index 2 and returns there", async () => {
  seedOrder(BOARD_AT_2);
  seedHidden([]);
  await mountApp("/app/settings/features");
  pre(JSON.stringify(railIds()) === JSON.stringify([...BOARD_AT_2]), "the rail shows the custom order with Boards at index 2");
  fireEvent.click(featureSwitch("board"));
  await flush(24);
  pre(nativeGet.call(localStorage, featureKey("board")) === "false" && !railIds().includes("board"), "the Features pane turned Boards off and the rail hides it");
  const rail = visible(["board"]);
  const from = mark();
  const order = await drag("calendar", ["matrix"]);
  const expected = merge(BOARD_AT_2, rail, order);
  pre(expected !== null, "P is a permutation of D(S, R)");
  const writtenRaw = raw();
  const written: unknown = JSON.parse(writtenRaw ?? "null");
  // Iteration 2: Boards is re-enabled before the assertions so that the log records where it returns.
  fireEvent.click(featureSwitch("board"));
  await flush(24);
  pre(nativeGet.call(localStorage, featureKey("board")) === "true", "the Features pane turned Boards back on");
  const afterReenable = railIds();
  observe("R-1 end to end", { order, written, expected, afterReenable });
  expect(propertyFailures(BOARD_AT_2, rail, order, written), "H5/R-1: P1–P4 for the written value").toEqual([]);
  expect(writtenRaw, "H5/R-1: the bytes keep `board` at index 2 and their visible filter equals the dropped order").toBe(encode(expected));
  expect(afterReenable.indexOf("board"), "H5/R-1 P5: Boards displays at index 2 again").toBe(2);
  expect(railWrites(from).filter(entry => !entry.endsWith("!")).length, "exactly one rail write for the one drop; the Features toggles wrote nothing").toBe(1);
});

it("H5 R-1 in the production App with Habits hidden at load: the drop keeps `habits` at its stored index", async () => {
  seedOrder(REVERSED);
  seedHidden(["habits"]);
  await mountApp("/app/tasks");
  const rail = visible(["habits"]);
  pre(JSON.stringify(railIds()) === JSON.stringify(displayOf(REVERSED, rail)), "the App rail displays D(S, R)");
  const order = await drag(railIds()[1]!, [railIds()[6]!]);
  const expected = merge(REVERSED, rail, order)!;
  expect(raw(), "H5: the production App writes the A2 merge").toBe(encode(expected));
  expect((JSON.parse(raw() ?? "[]") as string[]).indexOf("habits"), "H5 P2: habits keeps its stored index").toBe(REVERSED.indexOf("habits"));
});
