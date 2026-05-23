/**
 * AC-SHELL-3: webShellModuleRegistrations has 12 entries with
 * moduleId="matrix" at index 5 (railOrder 6).
 *
 * Verifies that the matrix placeholder was swapped for the real registration.
 */
import { describe, it, expect } from "vitest";
import { webShellModuleRegistrations } from "../shellRegistrations.js";

describe("shellRegistrations integration", () => {
  it("AC-SHELL-3: has exactly 12 entries", () => {
    expect(webShellModuleRegistrations).toHaveLength(12);
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

  it("AC-SHELL-3: all 12 entries have a moduleId", () => {
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
});
