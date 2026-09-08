/**
 * registry — R1..R5
 * api.md §3 + test.md §3 P1
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  registerSearchAdapter,
  getRegisteredAdapters,
  __resetCmdkRegistry,
} from "../internal/registry.js";
import type { ModuleSearchAdapter } from "../types.js";

const noopAdapter: ModuleSearchAdapter = () => [];

beforeEach(() => {
  __resetCmdkRegistry();
});

describe("registry", () => {
  it("R1 — registerSearchAdapter stores adapter", () => {
    registerSearchAdapter("tasks", noopAdapter);
    const adapters = getRegisteredAdapters();
    expect(adapters.has("tasks")).toBe(true);
    expect(adapters.get("tasks")).toBe(noopAdapter);
  });

  it("R2 — duplicate registration warns in dev, replaces silently", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const adapter1: ModuleSearchAdapter = () => [];
    const adapter2: ModuleSearchAdapter = () => [];

    registerSearchAdapter("tasks", adapter1);
    registerSearchAdapter("tasks", adapter2);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain("tasks");
    expect(getRegisteredAdapters().get("tasks")).toBe(adapter2);

    process.env.NODE_ENV = originalNodeEnv;
    warnSpy.mockRestore();
  });

  it("R3 — getRegisteredAdapters returns Map with all registered entries", () => {
    const taskAdapter: ModuleSearchAdapter = () => [];
    const boardAdapter: ModuleSearchAdapter = () => [];
    registerSearchAdapter("tasks", taskAdapter);
    registerSearchAdapter("board", boardAdapter);

    const map = getRegisteredAdapters();
    expect(map.size).toBe(2);
    expect(map.get("tasks")).toBe(taskAdapter);
    expect(map.get("board")).toBe(boardAdapter);
  });

  it("R4 — __resetCmdkRegistry clears the Map", () => {
    registerSearchAdapter("tasks", noopAdapter);
    expect(getRegisteredAdapters().size).toBe(1);
    __resetCmdkRegistry();
    expect(getRegisteredAdapters().size).toBe(0);
  });

  it("R5 — registered adapter retrievable by getRegisteredAdapters().get(moduleId)", () => {
    registerSearchAdapter("pomodoro", noopAdapter);
    const retrieved = getRegisteredAdapters().get("pomodoro");
    expect(retrieved).toBeDefined();
    // Verify it is callable
    const result = retrieved?.("test", {});
    expect(Array.isArray(result)).toBe(true);
  });
});
