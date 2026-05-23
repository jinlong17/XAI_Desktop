/**
 * AC-BARREL-1: All expected names are re-exported from index.ts.
 */
import { describe, it, expect } from "vitest";
import * as barrel from "../index.js";

describe("index barrel exports", () => {
  it("AC-BARREL-1: exports MatrixModule, default, matrixSlotRegistration, MATRIX_STORAGE_KEY", () => {
    expect(barrel.MatrixModule).toBeDefined();
    expect(barrel.default).toBeDefined();
    expect(barrel.matrixSlotRegistration).toBeDefined();
    expect(barrel.MATRIX_STORAGE_KEY).toBe("xai_matrix_state");
  });

  it("AC-BARREL-1: default === MatrixModule", () => {
    expect(barrel.default).toBe(barrel.MatrixModule);
  });
});
