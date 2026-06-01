/**
 * AC-SHELL-3: webShellModuleRegistrations has 13 entries with
 * moduleId="matrix" at index 5 (railOrder 6).
 *
 * Verifies that the matrix placeholder was swapped for the real registration.
 */
import { describe, it, expect } from "vitest";
import { webShellModuleRegistrations } from "../shellRegistrations.js";

describe("shellRegistrations integration", () => {
  it("AC-SHELL-3: has exactly 13 entries", () => {
    expect(webShellModuleRegistrations).toHaveLength(13);
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

  it("AC-SHELL-3: all 13 entries have a moduleId", () => {
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
