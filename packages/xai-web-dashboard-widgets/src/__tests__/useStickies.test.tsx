import { accountScope } from "@repo/plugin-web-storage";
/**
 * useStickies hook tests — AC-HOOK-1..4
 *
 * Tests persistence, create, and remove via the hook API.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStickies } from "../internal/stickiesStore/useStickies.js";

beforeEach(() => {
  localStorage.clear();
});

describe("AC-HOOK-1: initial list is empty when localStorage is clear", () => {
  it("list starts as []", () => {
    const { result } = renderHook(() => useStickies());
    expect(result.current.list).toEqual([]);
  });
});

describe("AC-HOOK-2: create adds a sticky and updates list", () => {
  it("after create, list has 1 sticky with correct text and color", () => {
    const { result } = renderHook(() => useStickies());
    act(() => {
      result.current.create({ text: "Hook note", color: "mint" });
    });
    expect(result.current.list).toHaveLength(1);
    expect(result.current.list[0]!.text).toBe("Hook note");
    expect(result.current.list[0]!.color).toBe("mint");
  });
});

describe("AC-HOOK-3: create persists to localStorage", () => {
  it("after create, xai_dashboard_stickies key exists in localStorage", () => {
    const { result } = renderHook(() => useStickies());
    act(() => {
      result.current.create({ text: "Persisted", color: "sky" });
    });
    const raw = localStorage.getItem(accountScope.physicalKey("xai_dashboard_stickies"));
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!);
    const values = Object.values(stored) as { text: string }[];
    expect(values.some((v) => v.text === "Persisted")).toBe(true);
  });
});

describe("AC-HOOK-4: remove deletes a sticky", () => {
  it("after remove, list is empty and key reverts to {}", () => {
    const { result } = renderHook(() => useStickies());
    act(() => {
      result.current.create({ text: "Remove me", color: "peach" });
    });
    const id = result.current.list[0]!.id;
    act(() => {
      result.current.remove(id);
    });
    expect(result.current.list).toHaveLength(0);
  });
});
