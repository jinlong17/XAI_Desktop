/**
 * Mode `drag` (contract r1 section 12, section 6): exactly one write at the drop and zero during dragOver (H3);
 * cancellation by dragEnd without drop, including a release outside the rail (H4); a drop on a gap and on the dragged
 * button itself; an unchanged order makes zero writes; R or the committed order changing mid-drag; click
 * suppression; the `dragging` class; an external drop ignored; one gesture admits at most one intent.
 *
 * Every drag fires the full jsdom sequence dragStart → dragEnter → dragOver (one or more) → drop → dragEnd on the
 * real DOM nodes with a DataTransfer stub; cancellations omit drop. No case calls a component handler directly.
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import {
  configureApp, configureRegistrations, displayOf, drag, dragEnd, dragOver, dragOverGap, dragStart, drop, encode, external, featureKey, flush,
  go, mark, merge, mountApp, nativeGet, mountStandalone, observe, pre, RAIL_IDS, railButton, railIds, railItems, railWrites, raw, REVERSED, seedHidden,
  seedOrder, SELF_CHECK_DELEGATION, setup, status, storageSelfCheck, teardown, transfer, visible, warns,
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
const Y2 = REVERSED[8]!;
async function mounted(): Promise<Awaited<ReturnType<typeof mountApp>>> {
  seedOrder(REVERSED);
  const app = await mountApp("/app/tasks");
  pre(JSON.stringify(railIds()) === JSON.stringify(REVERSED), "the rail shows the seeded custom order (all modules visible)");
  return app;
}

// ---------------------------------------------------------------------------
// H3: one write per drop, none during dragover
// ---------------------------------------------------------------------------

it("H3 §6.2/§6.3 a one-step drag: the preview shows P with zero attempts during dragstart/dragenter/dragover; the drop makes exactly one write with the A2 merge", async () => {
  await mounted();
  const from = mark();
  const gesture = dragStart(X);
  dragOver(gesture, X, Y1);
  await flush();
  expect(railIds(), "§6.2: the rail displays the preview P").toEqual(gesture.expected);
  expect(railWrites(from), "H3 §6.2: zero storage attempts during dragstart, dragenter and dragover").toEqual([]);
  drop(gesture, Y1);
  dragEnd(gesture, X);
  await flush();
  const expected = merge(REVERSED, RAIL_IDS, gesture.expected)!;
  expect(railWrites(from), "§6.3: exactly one setItem at the drop, with the A2 merge bytes").toEqual([encode(expected)]);
  expect(raw(), "the committed bytes").toBe(encode(expected));
  expect(railIds(), "the rail shows the dropped order").toEqual(gesture.expected);
  expect(status(), "no status after a successful drop").toBeNull();
});

it("H3 §6.2/§6.3 a two-step drag (two different targets): zero attempts across both dragovers, exactly one write of the final preview at the drop", async () => {
  await mounted();
  const from = mark();
  const gesture = dragStart(X);
  dragOver(gesture, X, Y1);
  await flush();
  dragOver(gesture, X, Y2);
  await flush();
  const preview = railIds();
  const beforeDrop = railWrites(from);
  // Iteration 2: the drop runs before the assertions so that the log records the attempts at the drop too.
  const dropMark = mark();
  drop(gesture, Y2);
  dragEnd(gesture, X);
  await flush();
  observe("two-step attempts", { beforeDrop, atDropAndDragend: railWrites(dropMark), bytes: raw() });
  expect(preview, "§6.2: the rail displays the second preview").toEqual(gesture.expected);
  expect(beforeDrop, "H3: zero storage attempts across two order-changing dragovers").toEqual([]);
  expect(railWrites(from), "§6.3/§6.5: one gesture, exactly one write").toEqual([encode(merge(REVERSED, RAIL_IDS, gesture.expected)!)]);
});

it("H3 A3 a standalone AppRail (its own controller) also writes once at the drop and never during dragover", async () => {
  seedOrder(REVERSED);
  await mountStandalone();
  const from = mark();
  const gesture = dragStart(X);
  dragOver(gesture, X, Y1);
  await flush();
  expect(railWrites(from), "H3: zero attempts during dragover in a standalone AppRail").toEqual([]);
  drop(gesture, Y1);
  dragEnd(gesture, X);
  await flush();
  expect(railWrites(from), "exactly one write at the drop").toEqual([encode(gesture.expected)]);
});

// ---------------------------------------------------------------------------
// H4: cancelled gestures revert with zero writes
// ---------------------------------------------------------------------------

it("H4 §6.4 dragEnd without a drop (Escape or a cancelled drag) reverts the preview with zero attempts", async () => {
  await mounted();
  const from = mark();
  const preview = await drag(X, [Y1], null);
  observe("cancelled drag", { preview, attempts: railWrites(from), bytes: raw(), rail: railIds() });
  expect(railWrites(from), "H4: a cancelled drag makes zero storage attempts").toEqual([]);
  expect(raw(), "H4: the bytes keep the committed order").toBe(encode(REVERSED));
  expect(railIds(), "§6.4: the preview reverts to the committed order").toEqual([...REVERSED]);
  expect(status(), "no status").toBeNull();
  expect(warns(), "no unload warning").toBe(false);
});

it("H4 §6.4 a two-step drag released outside the rail on the main content (a drop there) reverts with zero attempts", async () => {
  await mounted();
  const from = mark();
  await drag(X, [Y1, Y2], "outside");
  expect(railWrites(from), "H4: a release outside .rail-items makes zero storage attempts").toEqual([]);
  expect(raw(), "H4: the bytes keep the committed order").toBe(encode(REVERSED));
  expect(railIds(), "§6.4: the preview reverts").toEqual([...REVERSED]);
});

it("H4 §6.4 a drop accepted by a text input outside the rail reverts with zero attempts", async () => {
  await mounted();
  const input = document.createElement("input");
  input.type = "text";
  input.setAttribute("data-sol", "drop-target");
  (document.querySelector(".app-main") ?? document.body).appendChild(input);
  try {
    const from = mark();
    const gesture = dragStart(X);
    dragOver(gesture, X, Y1);
    fireEvent.dragEnter(input, { dataTransfer: gesture.transfer });
    fireEvent.dragOver(input, { dataTransfer: gesture.transfer });
    fireEvent.drop(input, { dataTransfer: gesture.transfer });
    dragEnd(gesture, X);
    await flush();
    expect(railWrites(from), "H4/host row r: a drop on a text input makes zero rail writes").toEqual([]);
    expect(railIds(), "the preview reverts").toEqual([...REVERSED]);
  } finally { input.remove(); }
});

// ---------------------------------------------------------------------------
// Section 6 item 3: drop targets and unchanged orders
// ---------------------------------------------------------------------------

it("H3 §6.3 a drop on a gap of .rail-items commits exactly one write with the A2 merge", async () => {
  await mounted();
  const from = mark();
  const gesture = dragStart(X);
  dragOver(gesture, X, Y1);
  dragOverGap(gesture);
  await flush();
  expect(railWrites(from), "H3: zero attempts before the drop").toEqual([]);
  drop(gesture, "gap");
  dragEnd(gesture, X);
  await flush();
  expect(railWrites(from), "§6.3: a drop on a gap is accepted: exactly one write").toEqual([encode(merge(REVERSED, RAIL_IDS, gesture.expected)!)]);
});

it("H3 §6.3 a drop on the dragged button itself commits exactly one write (the drop target's identity never matters)", async () => {
  await mounted();
  const from = mark();
  const gesture = dragStart(X);
  dragOver(gesture, X, Y1);
  await flush();
  expect(railWrites(from), "H3: zero attempts before the drop").toEqual([]);
  drop(gesture, X);
  dragEnd(gesture, X);
  await flush();
  expect(railWrites(from), "§6.3: exactly one write").toEqual([encode(merge(REVERSED, RAIL_IDS, gesture.expected)!)]);
});

it("PC §6.3 an unchanged order (dragover only on the dragged button, then a drop) makes zero attempts", async () => {
  await mounted();
  const from = mark();
  await drag(X, [X], X);
  expect(railWrites(from), "§6.3: P equals D0, zero attempts").toEqual([]);
  expect(railIds(), "the order is unchanged").toEqual([...REVERSED]);
  expect(status(), "no status").toBeNull();
});

it("PC §6.3 a dragover on a gap only, then a drop on the gap, makes zero attempts", async () => {
  await mounted();
  const from = mark();
  const gesture = dragStart(X);
  dragOverGap(gesture);
  drop(gesture, "gap");
  dragEnd(gesture, X);
  await flush();
  expect(railWrites(from), "§6.3: P equals D0, zero attempts").toEqual([]);
});

it("§6.5 one gesture admits at most one intent: two drop events in one gesture make at most one write", async () => {
  await mounted();
  const from = mark();
  const gesture = dragStart(X);
  dragOver(gesture, X, Y1);
  drop(gesture, Y1);
  drop(gesture, "gap");
  dragEnd(gesture, X);
  await flush();
  expect(railWrites(from), "§6.5: exactly one write for the gesture").toEqual([encode(merge(REVERSED, RAIL_IDS, gesture.expected)!)]);
});

it("§6.5 two successive gestures make exactly one write each; the second merges over the first's committed order", async () => {
  await mounted();
  const from = mark();
  const first = await drag(X, [Y1]);
  const afterFirst = railWrites(from);
  const second = await drag(first[5]!, [first[1]!]);
  const expectedFirst = merge(REVERSED, RAIL_IDS, first)!;
  expect(afterFirst, "H3/§6.5: the first gesture made exactly one write").toEqual([encode(expectedFirst)]);
  expect(railWrites(from), "§6.5: the second gesture made exactly one more write").toEqual([encode(expectedFirst), encode(merge(expectedFirst, RAIL_IDS, second)!)]);
});

it("PC §6.5 an external drop (no rail dragstart in this document) on a rail button is ignored with zero attempts", async () => {
  await mounted();
  const from = mark();
  const external = transfer({ "text/plain": "board", "text/uri-list": "https://example.invalid/" });
  const target = railButton(Y1);
  fireEvent.dragEnter(target, { dataTransfer: external });
  fireEvent.dragOver(target, { dataTransfer: external });
  fireEvent.drop(target, { dataTransfer: external });
  await flush();
  expect(railWrites(from), "§6.5: an external drop makes zero attempts").toEqual([]);
  expect(railIds(), "the order is unchanged").toEqual([...REVERSED]);
});

// ---------------------------------------------------------------------------
// Section 6 item 7: live changes during a drag
// ---------------------------------------------------------------------------

it("§6.7 R changes mid-drag (Boards turned off in another document): the drop makes zero attempts and the rail shows D(S, R)", async () => {
  seedHidden([]);
  await mounted();
  const from = mark();
  const gesture = dragStart(X);
  dragOver(gesture, X, Y1);
  await external(featureKey("board"), "false");
  pre(nativeGet.call(localStorage, featureKey("board")) === "false", "the Features change from the other document was delivered");
  drop(gesture, railIds().includes(Y1) ? Y1 : "gap");
  dragEnd(gesture, X);
  await flush();
  expect(railWrites(from), "§6.7: zero attempts when P is no longer a permutation of D(S, R)").toEqual([]);
  expect(raw(), "the bytes are unchanged").toBe(encode(REVERSED));
  expect(railIds(), "the rail shows D(S, R) for the current S and R").toEqual(displayOf(REVERSED, visible(["board"])));
});

it("§6.7 the committed order changing mid-drag (another document): the drop still commits, merging over S at drop time", async () => {
  await mounted();
  const other = [...RAIL_IDS];
  const from = mark();
  const gesture = dragStart(X);
  dragOver(gesture, X, Y1);
  await flush();
  expect(railWrites(from), "H3: zero attempts during dragover").toEqual([]);
  await external("xai_rail_order", encode(other));
  drop(gesture, Y1);
  dragEnd(gesture, X);
  await flush();
  const expected = merge(other, RAIL_IDS, gesture.expected)!;
  expect(railWrites(from), "§6.7: exactly one write with merge(S at drop time, R, P)").toEqual([encode(expected)]);
  expect(raw(), "the committed bytes").toBe(encode(expected));
});

// ---------------------------------------------------------------------------
// Section 6 items 1 and 6: dragging class and click suppression (positive controls)
// ---------------------------------------------------------------------------

it("PC §6.1 the dragged button carries the `dragging` class during the gesture and loses it at dragend", async () => {
  await mounted();
  const gesture = dragStart(X);
  expect(railButton(X).classList.contains("dragging"), "§6.1: the dragging class during the gesture").toBe(true);
  dragEnd(gesture, X);
  await flush();
  expect(railButton(X).classList.contains("dragging"), "the dragging class is removed after dragend").toBe(false);
});

it("PC §6.6 a click on a rail button during a drag does not navigate; after the gesture ends, clicks navigate as before", async () => {
  const app = await mounted();
  const gesture = dragStart(X);
  fireEvent.click(railButton("calendar"));
  await flush();
  expect(app.router.state.location.pathname, "§6.6: click suppression while dragging").toBe("/app/tasks");
  dragEnd(gesture, X);
  await flush();
  fireEvent.click(railButton("calendar"));
  await flush();
  expect(app.router.state.location.pathname, "§6.6: after the gesture a click navigates").toBe("/app/calendar");
  await go(app, "/app/tasks");
  expect(railItems(), "the rail stays mounted across navigation").not.toBeNull();
});
