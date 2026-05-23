/**
 * Module-level constants for @repo/plugin-web-habits.
 *
 * Re-exported via index.ts for test isolation (tests can clear localStorage
 * by key without string-literal duplication).
 */

/**
 * The WebPrefKey used by HabitsModule to persist habit state.
 * Must match the key registered in packages/plugin-web-storage/src/internal/registry.ts.
 */
export const HABITS_STORAGE_KEY = "xai_habits_state" as const;
