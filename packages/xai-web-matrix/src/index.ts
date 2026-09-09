import "./internal/accountMigration.js";
/**
 * @repo/plugin-web-matrix — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/ directly.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 * Design: design.md §1.1 frozen assumption 2
 */

// ---- Components ---------------------------------------------------------------
export { MatrixModule, default } from "./MatrixModule.js";

// ---- Registration (shell slot) ------------------------------------------------
export { matrixSlotRegistration } from "./registration.js";

// ---- Constants ----------------------------------------------------------------
export { MATRIX_STORAGE_KEY } from "./constants.js";

// ---- Types (re-exported for downstream tests + future xai-web-tasks join) -----
export type { MatrixCard, MatrixState, Quadrant, MatrixModuleProps, NewMatrixCardDraft } from "./types.js";
