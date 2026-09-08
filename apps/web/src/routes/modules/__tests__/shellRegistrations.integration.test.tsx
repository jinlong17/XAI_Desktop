/**
 * AC-SHELL-3: webShellModuleRegistrations has 15 entries with
 * moduleId="matrix" at index 5 (railOrder 6).
 *
 * Verifies that the matrix placeholder was swapped for the real registration.
 */
import { describe, it, expect } from "vitest";
import { webShellModuleRegistrations } from "../shellRegistrations.js";

describe("shellRegistrations integration", () => {
  it("AC-SHELL-3: has exactly 15 entries", () => {
    expect(webShellModuleRegistrations).toHaveLength(15);
  });

  it("AC-SHELL-3: matrix registration is at index 5 with moduleId='matrix'", () => {
    const matrixReg = webShellModuleRegistrations[5]!;
    expect(matrixReg.moduleId).toBe("matrix");
  });

  it("AC-SHELL-3: matrix entry is NOT a placeholder (has real render function, not ModuleRoutePlaceholderPage)", () => {
    const matrixReg = webShellModuleRegistrations[5]!;
    expect(matrixReg).toBeDefined();
    expect(matrixReg.children[0]!.render).toBeDefined();
    // The real registration uses MatrixSlotHost, not ModuleRoutePlaceholderPage
    expect(matrixReg.children[0]!.render.name).not.toBe("ModuleRoutePlaceholderPage");
  });

  it("AC-SHELL-3: all 15 entries have a moduleId", () => {
    for (const reg of webShellModuleRegistrations) {
      expect(typeof reg.moduleId).toBe("string");
      expect(reg.moduleId.length).toBeGreaterThan(0);
    }
  });

  it("AC-SHELL-2 (meditation row #16): meditation slot is swapped (not a placeholder)", () => {
    const meditation = webShellModuleRegistrations.find((r) => r.moduleId === "meditation");
    expect(meditation).toBeDefined();
    expect(meditation!.icon).toBe("leaf");
    expect(meditation!.railOrder).toBe(9);
    expect(meditation!.showInRail).toBe(true);
    expect(meditation!.children[0]!.render.name).not.toBe("ModuleRoutePlaceholderPage");
  });

  it("AC-TIMETRACK: time tracker slot is registered after pomodoro", () => {
    const timetrack = webShellModuleRegistrations.find((r) => r.moduleId === "timetrack");
    expect(timetrack).toBeDefined();
    expect(timetrack!.icon).toBe("timer");
    expect(timetrack!.railOrder).toBe(7.5);
    expect(timetrack!.showInRail).toBe(true);
    expect(timetrack!.i18nKey).toBe("nav.timetrack");
  });

  it("AC-BOOKKEEPING: bookkeeping slot is registered after time tracker", () => {
    const bookkeeping = webShellModuleRegistrations.find((r) => r.moduleId === "bookkeeping");
    expect(bookkeeping).toBeDefined();
    expect(bookkeeping!.icon).toBe("wallet");
    expect(bookkeeping!.railOrder).toBe(7.6);
    expect(bookkeeping!.showInRail).toBe(true);
    expect(bookkeeping!.i18nKey).toBe("nav.bookkeeping");
    expect(bookkeeping!.children[0]!.render.name).not.toBe("ModuleRoutePlaceholderPage");
  });

  it("AC-METRICS: metrics slot is registered after bookkeeping", () => {
    const metrics = webShellModuleRegistrations.find((r) => r.moduleId === "metrics");
    expect(metrics).toBeDefined();
    expect(metrics!.icon).toBe("target");
    expect(metrics!.railOrder).toBe(7.7);
    expect(metrics!.showInRail).toBe(true);
    expect(metrics!.i18nKey).toBe("nav.metrics");
    expect(metrics!.children[0]!.render.name).not.toBe("ModuleRoutePlaceholderPage");
  });

  // AC-HOST-1..4 (dashboard-grid row #10)
  it("AC-HOST-1: exactly one entry has moduleId='dashboard'", () => {
    const matches = webShellModuleRegistrations.filter((r) => r.moduleId === "dashboard");
    expect(matches).toHaveLength(1);
  });

  it("AC-HOST-2/3: dashboard slot is the real dashboardGridSlotRegistration (not a placeholder)", () => {
    const dashboard = webShellModuleRegistrations.find((r) => r.moduleId === "dashboard");
    expect(dashboard).toBeDefined();
    expect(dashboard!.children[0]!.render.name).not.toBe("ModuleRoutePlaceholderPage");
  });

  it("AC-HOST-4: dashboard rail order remains 4", () => {
    const dashboard = webShellModuleRegistrations.find((r) => r.moduleId === "dashboard");
    expect(dashboard!.railOrder).toBe(4);
    expect(dashboard!.icon).toBe("layout");
    expect(dashboard!.showInRail).toBe(true);
    expect(dashboard!.i18nKey).toBe("nav.dashboard");
  });
});
