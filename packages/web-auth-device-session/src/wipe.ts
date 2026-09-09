/**
 * Legacy, origin-wide database reset. Not an account deletion participant.
 * Shared auth/AI databases contain other owners: account cleanup must use
 * their captured-owner row erasers instead. Do not extend this historical list.
 */
export const ACCOUNT_LOCAL_WIPE_IDB_NAMES: readonly string[] = Object.freeze([
  "web-encrypted-cache",
  "xai-web-ai-secrets",
  "xai-web-auth",
]);

/**
 * @deprecated Origin-wide legacy reset, never suitable for deleting one account.
 * Resolves only when every delete request reports success. A blocked request
 * rejects even if it later completes: deleteDatabase cannot be cancelled and
 * callers must inspect/retry instead of reporting complete cleanup.
 */
export async function wipeRegisteredIDB(): Promise<void> {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is unavailable; database cleanup was not performed");
  }
  const results = await Promise.allSettled(
    ACCOUNT_LOCAL_WIPE_IDB_NAMES.map(name => new Promise<void>((resolve, reject) => {
      const failure = (reason: string, cause?: unknown) => {
        const error = new Error(`Database ${name} was not confirmed deleted: ${reason}`, { cause });
        error.name = "DatabaseWipeError";
        reject(error);
      };
      try {
        const request = indexedDB.deleteDatabase(name);
        request.onsuccess = () => resolve();
        request.onerror = () => failure("request failed", request.error);
        request.onblocked = () => failure("blocked by an open connection; close it and retry");
      } catch (error) {
        failure("request could not start", error);
      }
    })),
  );
  const failures = results.flatMap(result => result.status === "rejected" ? [result.reason] : []);
  if (failures.length) throw new AggregateError(failures, "Database cleanup is incomplete; some requests may finish later");
}
