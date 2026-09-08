/**
 * AC-SHELL-1 + AC-SHELL-2: matrixSlotRegistration shape + render.
 */
import { describe, it, expect } from "vitest";
import { matrixSlotRegistration } from "../registration.js";

describe("matrixSlotRegistration", () => {
  it("AC-SHELL-1: has expected field values", () => {
    expect(matrixSlotRegistration.moduleId).toBe("matrix");
    expect(matrixSlotRegistration.label).toBe("Matrix");
    expect(matrixSlotRegistration.defaultChildPath).toBe("");
    expect(matrixSlotRegistration.icon).toBe("grid4");
    expect(matrixSlotRegistration.railOrder).toBe(6);
    expect(matrixSlotRegistration.i18nKey).toBe("nav.matrix");
    expect(matrixSlotRegistration.showInRail).toBe(true);
  });

  it("AC-SHELL-1: children array has two entries with correct paths", () => {
    expect(matrixSlotRegistration.children).toHaveLength(2);
    expect(matrixSlotRegistration.children[0]?.path).toBe("");
    expect(matrixSlotRegistration.children[1]?.path).toBe("*");
  });

  it("AC-SHELL-2: children[0].render is a function", () => {
    expect(typeof matrixSlotRegistration.children[0]?.render).toBe("function");
  });

  it("AC-SHELL-2: children[1].render is a function", () => {
    expect(typeof matrixSlotRegistration.children[1]?.render).toBe("function");
  });
});
