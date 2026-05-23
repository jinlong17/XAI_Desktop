/**
 * Module-level constants for @repo/plugin-web-matrix.
 *
 * Re-exported via index.ts for test isolation (tests can clear localStorage
 * by key without string-literal duplication).
 */

/**
 * The WebPrefKey used by MatrixModule to persist quadrant state.
 * Must match the key registered in packages/plugin-web-storage/src/internal/registry.ts.
 */
export const MATRIX_STORAGE_KEY = "xai_matrix_state" as const;
