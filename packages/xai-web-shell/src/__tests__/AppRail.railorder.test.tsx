/**
 * AppRail order recovery — RO-* (CP-APPRAIL-01).
 *
 * AppRail as a view of the rail-order controller, with the real storage hook,
 * engine, registry and codec, a local exclusive Web Lock fixture and an
 * attempt-counting Storage injector:
 *   RO-M  zero-write mounts and re-renders;
 *   RO-T  drag timing: one write at the drop, zero during dragover, zero on a
 *         cancelled gesture, external drops ignored, one intent per gesture;
 *   RO-R  R-1: hidden modules keep their stored index (index-slot merge);
 *   RO-S  source truth and crash safety for every contract §5 item 2 value;
 *   RO-F  failures keep the dropped order; Retry, Discard, held lock, export.
 *
 * Complements (never replaces) the frozen Sol oracles.
 */

import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_ORDER, KEY, LOCK, RAIL_IDS, REVERSED, action, drag, dragEnd, dragOver, dragStart, drop, external, flush, installRailLocks,
  installStorageProbe, mountHarness, mountStandalone, openPanel, raw, railButton, railIds, seed, status, visible, warns,
} from "./railOrderFixture.js";
import { displayRailOrder } from "../internal/railOrderModel.js";

const encode = (order: readonly string[]) => JSON.stringify(order);
const DEFAULT_DISPLAY = [...DEFAULT_ORDER, "bookkeeping", "metrics"];
const X = REVERSED[0]!;
const Y = REVERSED[3]!;
const MOVED = (() => { const next = [...REVERSED]; next.splice(0, 1); next.splice(3, 0, X); return next; })();

function setup() {
  const locks = installRailLocks();
  const storage = installStorageProbe();
  return { locks, storage };
}

describe("RO-M — zero-write mounts", () => {
  it("RO-M1 — absent bytes display the default with zero attempts to write; the status is absent", async () => {
    const { storage } = setup();
    await mountHarness();
    expect(railIds()).toEqual(DEFAULT_DISPLAY);
    expect(storage.railWrites(0)).toEqual([]);
    expect(status()).toBeNull();
    expect(warns()).toBe(false);
  });

  it("RO-M2 — a seeded order, a Features change and a standalone mount make zero attempts to write", async () => {
    const { storage } = setup();
    seed(encode(REVERSED));
    const view = await mountHarness();
    expect(railIds()).toEqual(REVERSED);
    view.setHidden(["board"]);
    await flush();
    expect(railIds()).toEqual(displayRailOrder(REVERSED, visible(["board"])));
    view.unmount();
    await mountStandalone(["habits"]);
    expect(railIds()).toEqual(displayRailOrder(REVERSED, visible(["habits"])));
    expect(storage.railWrites(0)).toEqual([]);
    expect(raw()).toBe(encode(REVERSED));
  });
});

describe("RO-T — one write per drop", () => {
  it("RO-T1 — dragover previews in memory with zero attempts; the drop writes exactly once with the merge bytes", async () => {
    const { storage } = setup();
    seed(encode(REVERSED));
    await mountHarness();
    const from = storage.mark();
    const gesture = dragStart(X);
    dragOver(gesture, Y);
    expect(railIds()).toEqual(MOVED);
    expect(railButton(X).classList.contains("dragging")).toBe(true);
    expect(storage.all(from).filter((item) => item.key === KEY)).toEqual([]);
    drop(gesture, Y);
    dragEnd(gesture);
    await flush();
    expect(storage.railWrites(from)).toEqual([encode(MOVED)]);
    expect(raw()).toBe(encode(MOVED));
    expect(railIds()).toEqual(MOVED);
    expect(railButton(X).classList.contains("dragging")).toBe(false);
    expect(status()).toBeNull();
  });

  it("RO-T2 — a two-step drag writes only the final preview, once", async () => {
    const { storage } = setup();
    seed(encode(REVERSED));
    await mountHarness();
    const from = storage.mark();
    const preview = await drag(X, [Y, REVERSED[8]!]);
    expect(storage.railWrites(from)).toEqual([encode(preview)]);
  });

  it.each([
    ["dragEnd without a drop", null],
    ["a release outside .rail-items", "outside"],
  ] as const)("RO-T3 — %s cancels: zero attempts and the preview reverts", async (_name, target) => {
    const { storage } = setup();
    seed(encode(REVERSED));
    await mountHarness();
    const from = storage.mark();
    await drag(X, [Y], target);
    expect(storage.railWrites(from)).toEqual([]);
    expect(railIds()).toEqual(REVERSED);
    expect(warns()).toBe(false);
  });

  it("RO-T4 — a drop on a gap and on the dragged button commit once; an unchanged order makes zero attempts", async () => {
    const { storage } = setup();
    seed(encode(REVERSED));
    await mountHarness();
    let from = storage.mark();
    const first = await drag(X, [Y], "gap");
    expect(storage.railWrites(from)).toEqual([encode(first)]);
    from = storage.mark();
    const second = await drag(first[2]!, [first[6]!], first[2]!);
    expect(storage.railWrites(from)).toEqual([encode(second)]);
    from = storage.mark();
    await drag(second[0]!, [second[0]!], second[0]!);
    expect(storage.railWrites(from)).toEqual([]);
  });

  it("RO-T5 — two drop events in one gesture admit one intent; an external drop is ignored", async () => {
    const { storage } = setup();
    seed(encode(REVERSED));
    await mountHarness();
    const from = storage.mark();
    const gesture = dragStart(X);
    dragOver(gesture, Y);
    drop(gesture, Y);
    drop(gesture, "gap");
    dragEnd(gesture);
    await flush();
    expect(storage.railWrites(from)).toEqual([encode(MOVED)]);
    const externalFrom = storage.mark();
    const target = railButton(REVERSED[5]!);
    fireEvent.dragEnter(target);
    fireEvent.dragOver(target);
    fireEvent.drop(target);
    await flush();
    expect(storage.railWrites(externalFrom)).toEqual([]);
  });

  it("RO-T6 — R changing mid-drag discards the preview: zero attempts, the rail shows D(S, R)", async () => {
    const { storage } = setup();
    seed(encode(REVERSED));
    const view = await mountHarness();
    const from = storage.mark();
    const gesture = dragStart(X);
    dragOver(gesture, Y);
    view.setHidden(["board"]);
    await flush();
    drop(gesture, "gap");
    dragEnd(gesture);
    await flush();
    expect(storage.railWrites(from)).toEqual([]);
    expect(railIds()).toEqual(displayRailOrder(REVERSED, visible(["board"])));
  });

  it("RO-T7 — clicks are suppressed during a gesture and navigate after it", async () => {
    setup();
    seed(encode(REVERSED));
    const view = await mountHarness();
    const gesture = dragStart(X);
    fireEvent.click(railButton("calendar"));
    expect(view.clicks).toEqual([]);
    dragEnd(gesture);
    await flush();
    fireEvent.click(railButton("calendar"));
    expect(view.clicks).toEqual(["calendar"]);
  });
});

describe("RO-R — R-1 index-slot merge in the rail", () => {
  it("RO-R1 — with Boards hidden the drop keeps board at its stored index; re-enabled it returns there", async () => {
    const { storage } = setup();
    const stored = ["calendar", "tasks", "board", ...RAIL_IDS.filter((id) => !["calendar", "tasks", "board"].includes(id))];
    seed(encode(stored));
    const view = await mountHarness({ hidden: ["board"] });
    const from = storage.mark();
    const preview = await drag("calendar", ["matrix"]);
    const written = JSON.parse(storage.railWrites(from)[0] ?? "null") as string[];
    expect(written[2]).toBe("board");
    expect(written.filter((id) => id !== "board")).toEqual(preview);
    view.setHidden([]);
    await flush();
    expect(railIds().indexOf("board")).toBe(2);
  });

  it("RO-R2 — unknown ids keep their stored index", async () => {
    const { storage } = setup();
    const stored = ["tasks", "ghost-module", ...RAIL_IDS.filter((id) => id !== "tasks")];
    seed(encode(stored));
    await mountHarness();
    const from = storage.mark();
    await drag("tasks", ["calendar"]);
    const written = JSON.parse(storage.railWrites(from)[0] ?? "null") as string[];
    expect(written[1]).toBe("ghost-module");
  });
});

describe("RO-S — source truth and crash safety (contract §5 item 2)", () => {
  const MALFORMED = [
    "{}", '{"tasks":1}', "1", "0", "-1", "true", "false", '"tasks"', "[1]", '["tasks",2]', "[null]", '[["tasks"]]',
    '["tasks","tasks"]', '["board","tasks","board"]', "null", "[tasks", "",
  ];
  it.each(MALFORMED)("RO-S1 — %j at load: no throw, the default display, the source status with Reload only, zero writes", async (bytes) => {
    const { storage } = setup();
    seed(bytes);
    await mountHarness();
    expect(railIds()).toEqual(DEFAULT_DISPLAY);
    expect(status()?.getAttribute("aria-label")).toBe("Saved sidebar order is unavailable. Review it.");
    openPanel();
    expect(action("reload")).not.toBeNull();
    expect(action("retry")).toBeNull();
    expect(warns()).toBe(false);
    fireEvent.click(action("reload")!);
    await flush();
    expect(storage.railWrites(0)).toEqual([]);
    expect(raw()).toBe(bytes);
  });

  it("RO-S2 — a throwing getItem at load is unavailable: default display and the source status", async () => {
    const { storage } = setup();
    seed(encode(REVERSED));
    storage.fault("get", KEY);
    await mountHarness();
    expect(railIds()).toEqual(DEFAULT_DISPLAY);
    expect(status()?.getAttribute("aria-label")).toBe("Saved sidebar order is unavailable. Review it.");
  });

  it("RO-S3 — a drag over `{}` is a refused failed draft; Retry refused again; Discard returns to the source state", async () => {
    const { storage } = setup();
    seed("{}");
    await mountHarness();
    const preview = await drag("tasks", ["calendar"]);
    expect(railIds()).toEqual(preview);
    expect(status()?.getAttribute("aria-label")).toBe("Sidebar order not saved. Review it.");
    openPanel();
    fireEvent.click(action("retry")!);
    await flush();
    expect(railIds()).toEqual(preview);
    fireEvent.click(action("discard")!);
    await flush();
    expect(railIds()).toEqual(DEFAULT_DISPLAY);
    expect(status()?.getAttribute("aria-label")).toBe("Saved sidebar order is unavailable. Review it.");
    expect(storage.railWrites(0)).toEqual([]);
    expect(raw()).toBe("{}");
  });

  it("RO-S4 — malformed bytes written by another document leave an idle rail in its source state without a throw", async () => {
    const { storage } = setup();
    seed(encode(REVERSED));
    await mountHarness();
    await external(KEY, "1");
    expect(railIds()).toEqual(DEFAULT_DISPLAY);
    expect(status()).not.toBeNull();
    await external(KEY, encode(REVERSED));
    expect(storage.railWrites(0)).toEqual([]);
  });
});

describe("RO-F — failures, Retry, Discard and the held lock", () => {
  it("RO-F1 — a quota failure keeps the dropped order with the status; Retry after recovery writes once", async () => {
    const { storage } = setup();
    seed(encode(REVERSED));
    await mountHarness();
    const quota = storage.fault("set", KEY);
    await drag(X, [Y]);
    expect(quota.fired()).toBe(1);
    expect(railIds()).toEqual(MOVED);
    expect(raw()).toBe(encode(REVERSED));
    expect(warns()).toBe(true);
    openPanel();
    quota.off();
    const from = storage.mark();
    fireEvent.click(action("retry")!);
    await flush();
    expect(storage.railWrites(from)).toEqual([encode(MOVED)]);
    expect(status()).toBeNull();
    expect(warns()).toBe(false);
  });

  it("RO-F2 — a held per-key lock keeps the bytes; no status while pending; one write after release", async () => {
    const { storage, locks } = setup();
    seed(encode(REVERSED));
    await mountHarness();
    const lock = await locks.hold(LOCK);
    const from = storage.mark();
    await drag(X, [Y]);
    expect(raw()).toBe(encode(REVERSED));
    expect(railIds()).toEqual(MOVED);
    expect(status()).toBeNull();
    expect(warns()).toBe(true);
    await lock.release();
    expect(storage.railWrites(from)).toEqual([encode(MOVED)]);
    expect(locks.requests.filter((name) => name === LOCK).length).toBe(1);
  });

  it("RO-F3 — without navigator.locks the write is refused and reported, never written unfenced", async () => {
    const { storage, locks } = setup();
    seed(encode(REVERSED));
    await mountHarness();
    locks.setMissing(true);
    await drag(X, [Y]);
    expect(storage.railWrites(0)).toEqual([]);
    expect(status()).not.toBeNull();
    locks.setMissing(false);
    openPanel();
    fireEvent.click(action("retry")!);
    await flush();
    expect(raw()).toBe(encode(MOVED));
  });

  it("RO-F4 — Discard makes zero attempts and returns to the committed order", async () => {
    const { storage } = setup();
    seed(encode(REVERSED));
    await mountHarness();
    storage.fault("set", KEY);
    await drag(X, [Y]);
    openPanel();
    const from = storage.mark();
    fireEvent.click(action("discard")!);
    await flush();
    expect(storage.railWrites(from)).toEqual([]);
    expect(railIds()).toEqual(REVERSED);
    expect(status()).toBeNull();
  });

  it("RO-F5 — the latest of two held drops wins; each drop makes one lock request", async () => {
    const { storage, locks } = setup();
    seed(encode(REVERSED));
    await mountHarness();
    const lock = await locks.hold(LOCK);
    const from = storage.mark();
    const first = await drag(X, [Y]);
    const second = await drag(first[6]!, [first[1]!]);
    await lock.release();
    expect(raw()).toBe(encode(second));
    expect(locks.requests.filter((name) => name === LOCK).length).toBe(2);
    expect(storage.railWrites(from).at(-1)).toBe(encode(second));
    expect(status()).toBeNull();
  });

  it("RO-F6 — a drop back to the committed order over a failed draft completes as the engine's verified no-op", async () => {
    const { storage } = setup();
    seed(encode(REVERSED));
    await mountHarness();
    const quota = storage.fault("set", KEY);
    await drag(X, [Y]);
    quota.off();
    const from = storage.mark();
    await drag(X, [REVERSED[1]!]);
    expect(railIds()).toEqual(REVERSED);
    expect(storage.railWrites(from)).toEqual([]);
    expect(status()).toBeNull();
  });

  it("RO-F7 — the committed order of another document updates an idle rail live", async () => {
    setup();
    seed(encode(REVERSED));
    await mountHarness();
    await external(KEY, encode(RAIL_IDS));
    expect(railIds()).toEqual([...RAIL_IDS]);
    await external(KEY, null);
    expect(railIds()).toEqual(DEFAULT_DISPLAY);
  });

  it("RO-F8 — a held write refuses on release after unmount", async () => {
    const { storage, locks } = setup();
    seed(encode(REVERSED));
    const view = await mountHarness();
    const lock = await locks.hold(LOCK);
    await drag(X, [Y]);
    view.unmount();
    const from = storage.mark();
    await lock.release();
    expect(storage.railWrites(from)).toEqual([]);
    expect(raw()).toBe(encode(REVERSED));
  });
});
