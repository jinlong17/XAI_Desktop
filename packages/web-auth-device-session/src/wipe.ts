/**
 * wipe.ts — Account-delete local-data wipe helpers.
 *
 * Extension 2026-05-26 — gap-closure row #9 (Account-delete wire).
 *
 * Exports:
 * - ACCOUNT_LOCAL_WIPE_IDB_NAMES: frozen list of known IDB database names.
 * - wipeRegisteredIDB(): clears all databases in the above list via
 *   indexedDB.deleteDatabase() (parallel via Promise.allSettled).
 *
 * IMPORTANT: This list MUST be manually extended whenever a new package
 * introduces a new IndexedDB database. See JSDoc on ACCOUNT_LOCAL_WIPE_IDB_NAMES.
 *
 * NOT using indexedDB.databases() because Safari + older browsers do not
 * implement that API consistently (FA-7 of design.md §"2026-05-26 Extension").
 *
 * API contract: packages/web-auth-device-session/docs/api.md §"Account-delete helper"
 */

/**
 * Known IndexedDB database names used by the web client.
 *
 * MUST be extended whenever a new package introduces a new IDB database.
 * Used by the account-delete flow to clear durable encrypted local data
 * after a successful backend deletion.
 *
 * NOT derived from `indexedDB.databases()` because Safari + older browsers
 * do not implement that API consistently.
 *
 * Databases at row-#9-time (2026-05-26):
 * - "web-encrypted-cache" — core-data indexeddb-sync-blob (WEB_CACHE_DB_PREFIX)
 * - "xai-web-ai-secrets" — xai-web-ai-chat encrypted secrets IDB
 * - "xai-web-auth" — web-auth-device-session Supabase auth storage
 *
 * @since 2026-05-26 (gap-closure row #9)
 */
export const ACCOUNT_LOCAL_WIPE_IDB_NAMES: readonly string[] = Object.freeze([
  "web-encrypted-cache",
  "xai-web-ai-secrets",
  "xai-web-auth",
]);

/**
 * Deletes all IndexedDB databases listed in ACCOUNT_LOCAL_WIPE_IDB_NAMES
 * using Promise.allSettled (parallel; best-effort — individual failures are
 * non-throwing, consistent with R1 of design.md §"2026-05-26 Extension").
 *
 * Called AFTER a successful backend account-delete + signOut, as part of the
 * local-clear sequence:
 *   1. registry-list localStorage wipe (PREF_REGISTRY keys via removePref)
 *   2. IDB wipe (this function)
 *   3. window.location.assign("/")
 *
 * @since 2026-05-26 (gap-closure row #9)
 */
export async function wipeRegisteredIDB(): Promise<void> {
  if (typeof indexedDB === "undefined") {
    // SSR / non-browser environment — no-op.
    return;
  }

  await Promise.allSettled(
    ACCOUNT_LOCAL_WIPE_IDB_NAMES.map(
      (name) =>
        new Promise<void>((resolve) => {
          const req = indexedDB.deleteDatabase(name);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve(); // best-effort
          req.onblocked = () => resolve(); // best-effort
        }),
    ),
  );
}
