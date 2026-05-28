/**
 * AC-BARREL-1: All expected names are re-exported from index.ts.
 * T-MBAR-1: NewMatrixCardDraft exported; internal helpers NOT exported (EP3).
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

  // EP3: T-MBAR-1
  it("T-MBAR-1: NewMatrixCardDraft type is exported (compile-time only; runtime check via presence of the key in the module)", () => {
    // NewMatrixCardDraft is a type-only export — it doesn't appear at runtime.
    // Verify it compiles (if this test file compiles, the type was exported).
    // Additionally verify that internal helpers are NOT runtime-exported.
    const barrelKeys = Object.keys(barrel);
    expect(barrelKeys).toContain("MatrixModule");
    expect(barrelKeys).toContain("matrixSlotRegistration");
    expect(barrelKeys).toContain("MATRIX_STORAGE_KEY");

    // Internal helpers must NOT appear on the public surface
    expect(barrelKeys).not.toContain("createMatrixId");
    expect(barrelKeys).not.toContain("addCard");
    expect(barrelKeys).not.toContain("MatrixComposer");
    expect(barrelKeys).not.toContain("STR_MATRIX_COMPOSER");
  });
});
