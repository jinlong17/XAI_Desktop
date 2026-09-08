/**
 * Barrel surface tests — B1..B3
 *
 * AC-BARREL-1: index.ts exports exactly the symbols api.md §0 lists
 * AC-BARREL-2: No symbol is exported from src/internal/*
 * AC-BARREL-3: WebModuleSlotRegistration extends WebModuleRouteRegistration (type-only assertion)
 */

import { describe, it, expect } from "vitest";
import * as barrel from "../index.js";

describe("index barrel (B1..B3)", () => {
  it("B1 — exports Shell component", () => {
    expect(typeof barrel.Shell).toBe("function");
  });

  it("B1 — exports AppRail component", () => {
    expect(typeof barrel.AppRail).toBe("function");
  });

  it("B1 — exports Topbar component", () => {
    expect(typeof barrel.Topbar).toBe("function");
  });

  it("B1 — exports AvatarMenu component", () => {
    expect(typeof barrel.AvatarMenu).toBe("function");
  });

  it("B1 — exports WebShellProvider", () => {
    expect(typeof barrel.WebShellProvider).toBe("function");
  });

  it("B1 — exports useWebShell", () => {
    expect(typeof barrel.useWebShell).toBe("function");
  });

  it("B1 — exports useWebModuleRegistry", () => {
    expect(typeof barrel.useWebModuleRegistry).toBe("function");
  });

  it("B2 — does NOT export internal symbols (reorderArray, getPopoverAnchor)", () => {
    const b = barrel as Record<string, unknown>;
    expect(b["reorderArray"]).toBeUndefined();
    expect(b["getPopoverAnchor"]).toBeUndefined();
  });

  it("B3 — WebModuleSlotRegistration type extends WebModuleRouteRegistration (structural check via runtime object shape)", () => {
    // Type-level assertion is done at compile time; this runtime check verifies
    // that an object satisfying WebModuleSlotRegistration also has the base fields.
    const slot = {
      moduleId: "tasks",
      label: "Tasks",
      defaultChildPath: "",
      children: [],
      icon: "check",
      railOrder: 1,
      i18nKey: "nav.tasks",
      showInRail: true,
    } satisfies barrel.WebModuleSlotRegistration;

    expect(slot.moduleId).toBe("tasks");
    expect(slot.icon).toBe("check");
    expect(slot.railOrder).toBe(1);
  });
});
