import { describe, it, expect } from "vitest";
import { createSticky, deleteSticky, listStickies, moveSticky, reorderStickies, resizeSticky, updateSticky } from "../stickiesStore.js";
import { STICKY_DEFAULT_SIZE, STICKY_SIZE_LIMITS } from "../types.js";
import type { UserSticky } from "../types.js";

function makeStore(entries: Partial<UserSticky>[] = []): Record<string, UserSticky> {
  const store: Record<string, UserSticky> = {};
  entries.forEach((e, i) => {
    const sticky: UserSticky = {
      id: e.id ?? `sticky-${i}`,
      text: e.text ?? "note",
      color: e.color ?? "sun",
      createdAt: e.createdAt ?? `2026-05-28T0${i}:00:00.000Z`,
      ...(e.width !== undefined ? { width: e.width } : {}),
      ...(e.height !== undefined ? { height: e.height } : {}),
      ...(e.x !== undefined ? { x: e.x } : {}),
      ...(e.y !== undefined ? { y: e.y } : {}),
      ...(e.order !== undefined ? { order: e.order } : {}),
    };
    store[sticky.id] = sticky;
  });
  return store;
}

describe("AC-STORE-1: createSticky returns new store + created entity", () => {
  it("creates a new sticky with trimmed text and given color", () => {
    const store = {};
    const { next, created } = createSticky(store, { text: "  Hello  ", color: "mint" });
    expect(created.text).toBe("Hello");
    expect(created.color).toBe("mint");
    expect(created.width).toBe(STICKY_DEFAULT_SIZE.width);
    expect(created.height).toBe(STICKY_DEFAULT_SIZE.height);
    expect(created.x).toBe(12);
    expect(created.y).toBe(12);
    expect(created.order).toBe(0);
    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();
    expect(next[created.id]).toEqual(created);
  });
});

describe("AC-STORE-2: createSticky does not mutate original store", () => {
  it("original store is unchanged after create", () => {
    const store = makeStore([{ id: "s1" }]);
    const originalKeys = Object.keys(store);
    const { next } = createSticky(store, { text: "new", color: "sun" });
    expect(Object.keys(store)).toEqual(originalKeys);
    expect(store).not.toBe(next);
  });
});

describe("AC-STORE-3: createSticky appends to existing store", () => {
  it("pre-existing entries are preserved", () => {
    const store = makeStore([{ id: "s1", text: "first" }]);
    const { next, created } = createSticky(store, { text: "second", color: "peach" });
    expect(next["s1"]!.text).toBe("first");
    expect(next[created.id]!.text).toBe("second");
    expect(next[created.id]!.x).toBe(228);
    expect(next[created.id]!.y).toBe(12);
    expect(next[created.id]!.order).toBe(1);
    expect(Object.keys(next)).toHaveLength(2);
  });
});

describe("AC-STORE-4: deleteSticky removes the entry", () => {
  it("key is gone after delete", () => {
    const store = makeStore([{ id: "s1" }, { id: "s2" }]);
    const next = deleteSticky(store, "s1");
    expect(next["s1"]).toBeUndefined();
    expect(next["s2"]).toBeDefined();
  });
});

describe("AC-STORE-5: deleteSticky is a no-op when id missing", () => {
  it("returns same reference when id not found", () => {
    const store = makeStore([{ id: "s1" }]);
    const next = deleteSticky(store, "nonexistent");
    expect(next).toBe(store);
  });
});

describe("AC-STORE-6: deleteSticky does not mutate original store", () => {
  it("original store still has the key after delete", () => {
    const store = makeStore([{ id: "s1" }]);
    const next = deleteSticky(store, "s1");
    expect(store["s1"]).toBeDefined();
    expect(next).not.toBe(store);
  });
});

describe("AC-STORE-7: listStickies returns sorted array", () => {
  it("sorts by createdAt ASC then id ASC", () => {
    const store: Record<string, UserSticky> = {
      "s-b": { id: "s-b", text: "B", color: "sun", createdAt: "2026-05-28T02:00:00.000Z" },
      "s-a": { id: "s-a", text: "A", color: "sun", createdAt: "2026-05-28T01:00:00.000Z" },
      "s-c": { id: "s-c", text: "C", color: "sun", createdAt: "2026-05-28T01:00:00.000Z" },
    };
    const list = listStickies(store);
    // s-a and s-c share timestamp → id tie-break: s-a < s-c
    expect(list.map((s) => s.id)).toEqual(["s-a", "s-c", "s-b"]);
  });

  it("sorts by saved display order when present", () => {
    const store = makeStore([
      { id: "s-a", text: "A", createdAt: "2026-05-28T01:00:00.000Z", order: 2 },
      { id: "s-b", text: "B", createdAt: "2026-05-28T02:00:00.000Z", order: 0 },
      { id: "s-c", text: "C", createdAt: "2026-05-28T03:00:00.000Z", order: 1 },
    ]);
    expect(listStickies(store).map((s) => s.id)).toEqual(["s-b", "s-c", "s-a"]);
  });

  it("returns empty array for empty store", () => {
    expect(listStickies({})).toEqual([]);
  });
});

describe("AC-STORE-8: updateSticky edits an existing note without changing identity", () => {
  it("updates text/color/source and preserves id + createdAt", () => {
    const store = makeStore([{ id: "s1", text: "old", color: "sun", width: 240, height: 120 }]);
    const next = updateSticky(store, "s1", {
      text: "  updated  ",
      color: "teal",
      source: { type: "task", id: "task-1", title: "Task", tagLabel: "Work" },
    });
    expect(next).not.toBe(store);
    expect(next.s1?.id).toBe("s1");
    expect(next.s1?.createdAt).toBe(store.s1?.createdAt);
    expect(next.s1?.text).toBe("updated");
    expect(next.s1?.color).toBe("teal");
    expect(next.s1?.width).toBe(240);
    expect(next.s1?.height).toBe(120);
    expect(next.s1?.source?.tagLabel).toBe("Work");
  });

  it("returns the same reference when id is missing", () => {
    const store = makeStore([{ id: "s1" }]);
    expect(updateSticky(store, "missing", { text: "x", color: "sun" })).toBe(store);
  });
});

describe("AC-STORE-9: resizeSticky updates only dimensions", () => {
  it("persists clamped width/height without changing note content", () => {
    const store = makeStore([{ id: "s1", text: "keep", color: "mint" }]);
    const next = resizeSticky(store, "s1", { width: 999, height: 10 });
    expect(next).not.toBe(store);
    expect(next.s1?.text).toBe("keep");
    expect(next.s1?.color).toBe("mint");
    expect(next.s1?.width).toBe(STICKY_SIZE_LIMITS.maxWidth);
    expect(next.s1?.height).toBe(STICKY_SIZE_LIMITS.minHeight);
  });

  it("returns the same reference when id is missing", () => {
    const store = makeStore([{ id: "s1" }]);
    expect(resizeSticky(store, "missing", { width: 220, height: 140 })).toBe(store);
  });
});

describe("AC-STORE-10: reorderStickies persists display order", () => {
  it("rewrites order values without changing sticky content or size", () => {
    const store = makeStore([
      { id: "s1", text: "one", width: 220, height: 140, order: 0 },
      { id: "s2", text: "two", width: 230, height: 150, order: 1 },
      { id: "s3", text: "three", width: 240, height: 160, order: 2 },
    ]);
    const next = reorderStickies(store, ["s3", "s1", "s2"]);
    expect(next).not.toBe(store);
    expect(listStickies(next).map((s) => s.id)).toEqual(["s3", "s1", "s2"]);
    expect(next.s1?.text).toBe("one");
    expect(next.s1?.width).toBe(220);
    expect(next.s1?.height).toBe(140);
    expect(next.s3?.order).toBe(0);
    expect(next.s1?.order).toBe(1);
    expect(next.s2?.order).toBe(2);
  });

  it("ignores missing ids and appends omitted stickies", () => {
    const store = makeStore([
      { id: "s1", order: 0 },
      { id: "s2", order: 1 },
      { id: "s3", order: 2 },
    ]);
    const next = reorderStickies(store, ["missing", "s3"]);
    expect(listStickies(next).map((s) => s.id)).toEqual(["s3", "s1", "s2"]);
  });
});

describe("AC-STORE-11: moveSticky updates only free-form canvas position", () => {
  it("persists clamped x/y without changing content or size", () => {
    const store = makeStore([{ id: "s1", text: "move me", width: 220, height: 140, x: 12, y: 18 }]);
    const next = moveSticky(store, "s1", { x: 95.8, y: -20 });
    expect(next).not.toBe(store);
    expect(next.s1?.text).toBe("move me");
    expect(next.s1?.width).toBe(220);
    expect(next.s1?.height).toBe(140);
    expect(next.s1?.x).toBe(96);
    expect(next.s1?.y).toBe(0);
  });

  it("returns the same reference when id is missing", () => {
    const store = makeStore([{ id: "s1" }]);
    expect(moveSticky(store, "missing", { x: 40, y: 60 })).toBe(store);
  });
});
