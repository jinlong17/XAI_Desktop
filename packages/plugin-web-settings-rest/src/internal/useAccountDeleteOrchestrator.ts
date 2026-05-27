/**
 * @internal — useAccountDeleteOrchestrator.ts
 *
 * Orchestration hook for the Account-Delete flow.
 * NOT exported from barrel — used only by DeleteAccountConfirmModal.tsx.
 *
 * Two execution paths:
 * - Live-auth (VITE_WEB_AUTH_MODE !== "mock-authenticated"):
 *     deleteAccount(supabaseClient) → signOut (inside deleteAccount) →
 *     registry-list localStorage wipe → IDB wipe → window.location.assign("/")
 * - Mock-auth (VITE_WEB_AUTH_MODE === "mock-authenticated"):
 *     skip backend + signOut →
 *     registry-list localStorage wipe → IDB wipe → window.location.assign("/")
 *
 * Orchestration sequence enforces HC3 (DEL-ORCH-3): backend SUCCESS precedes
 * any local mutation in live-auth mode. On failure, local state is NOT touched.
 *
 * API contract: packages/plugin-web-settings-rest/docs/api.md §8.3
 * Design: design.md §"2026-05-26 Extension" FA-12
 * Test: test.md §7.3 P3 — DEL-ORCH-1..4, DEL-WIPE-1..2, DEL-IDEM-1, DEL-IDB-LIST-1
 */

import * as React from "react";
import {
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
} from "@repo/core";
import { PREF_REGISTRY, removePref } from "@repo/plugin-web-storage";
import type { WebPrefKey } from "@repo/plugin-web-storage";
import {
  deleteAccount,
  AccountDeleteError,
  ACCOUNT_LOCAL_WIPE_IDB_NAMES,
  wipeRegisteredIDB,
} from "@repo/web-auth-device-session";
import { useWebAuthSession } from "@repo/web-auth-device-session/web";

type OrchestratorState = "idle" | "submitting" | "wiping" | "success" | "failure";

export interface UseAccountDeleteOrchestratorResult {
  readonly state: OrchestratorState;
  readonly error: AccountDeleteError | null;
  readonly isMockAuth: boolean;
  readonly submit: () => Promise<void>;
  readonly reset: () => void;
}

function isMockAuthMode(): boolean {
  // Vite replaces import.meta.env.* at build time.
  // At test time (vitest), import.meta.env is available and vi.stubEnv patches it.
  return import.meta.env.VITE_WEB_AUTH_MODE === "mock-authenticated";
}

function isDesktopOfflineRuntimeProfile(): boolean {
  const runtimeProfile = resolveWebRuntimeProfile(
    import.meta.env as Record<string, string | undefined>,
  );
  return isDesktopPhase1OfflineRuntime(runtimeProfile);
}

export function useAccountDeleteOrchestrator(): UseAccountDeleteOrchestratorResult {
  const [state, setState] = React.useState<OrchestratorState>("idle");
  const [error, setError] = React.useState<AccountDeleteError | null>(null);
  const isSubmittingRef = React.useRef(false);

  const IS_LOCAL_ONLY_DELETE_MODE =
    isMockAuthMode() || isDesktopOfflineRuntimeProfile();

  const { client: supabaseClient } = useWebAuthSession();

  const submit = React.useCallback(async () => {
    // DEL-IDEM-1: idempotent — if already submitting, no-op.
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setState("submitting");
    setError(null);

    // Read env mode at call-time (dynamic, not captured at hook init) for testability.
    const currentIsLocalOnlyDeleteMode =
      isMockAuthMode() || isDesktopOfflineRuntimeProfile();

    try {
      if (!currentIsLocalOnlyDeleteMode) {
        // Live-auth: call backend FIRST (DEL-ORCH-3 sequencing).
        // supabaseClient is obtained from the SHIPPED session context.
        if (!supabaseClient) {
          throw new AccountDeleteError("unauthorized", "No active Supabase session");
        }
        // deleteAccount internally calls signOut (best-effort) on success.
        // Idempotency (DEL-ORCH-4): if deleteAccount throws kind="already_deleted",
        // treat as success and proceed to local wipe (account is gone).
        try {
          await deleteAccount(supabaseClient);
        } catch (err) {
          if (err instanceof AccountDeleteError && err.kind === "already_deleted") {
            // Idempotent — proceed to wipe (account already deleted server-side).
          } else {
            throw err;
          }
        }
      }
      // Local-only mode (mock-auth or desktop/offline runtime profile):
      // skip backend + signOut and proceed directly to local wipe.

      // Local wipe (same in both paths — HC3: only reached AFTER backend success or mock skip).
      setState("wiping");

      // 1. Iterate Object.keys(PREF_REGISTRY) → removePref per key (sequential).
      // NEVER localStorage.clear() (DEL-WILDCARD-GUARD).
      for (const key of Object.keys(PREF_REGISTRY) as WebPrefKey[]) {
        removePref(key);
      }

      // 2. IDB wipe via ACCOUNT_LOCAL_WIPE_IDB_NAMES (DEL-WIPE-2).
      await wipeRegisteredIDB();

      // 3. Redirect — full-page navigation forces clean React tree.
      setState("success");
      window.location.assign("/");
    } catch (err) {
      const deleteErr =
        err instanceof AccountDeleteError
          ? err
          : new AccountDeleteError("unknown", String(err), err);
      setError(deleteErr);
      setState("failure");
    } finally {
      isSubmittingRef.current = false;
    }
  }, [supabaseClient]);

  const reset = React.useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return {
    state,
    error,
    isMockAuth: IS_LOCAL_ONLY_DELETE_MODE,
    submit,
    reset,
  };
}

// Re-export ACCOUNT_LOCAL_WIPE_IDB_NAMES for tests that need to assert the frozen list.
export { ACCOUNT_LOCAL_WIPE_IDB_NAMES };
