import { describe, it, expect } from "vitest";
import { createSticky, deleteSticky, listStickies } from "../stickiesStore.js";
import type { UserSticky } from "../types.js";

function makeStore(entries: Partial<UserSticky>[] = []): Record<string, UserSticky> {
  const store: Record<string, UserSticky> = {};
  entries.forEach((e, i) => {
    const sticky: UserSticky = {
      id: e.id ?? `sticky-${i}`,
      text: e.text ?? "note",
      color: e.color ?? "sun",
      createdAt: e.createdAt ?? `2026-05-28T0${i}:00:00.000Z`,
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

  it("returns empty array for empty store", () => {
    expect(listStickies({})).toEqual([]);
  });
});
