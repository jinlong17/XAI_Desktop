/** Account deletion owns only the captured account. Server success precedes local cleanup. */
import * as React from "react";
import { accountScope } from "@repo/plugin-web-storage";
import { beginAccountLocalDeletion, resumeAccountLocalDeletion } from "./accountDeletionRecovery.js";
import {
  deleteAccount,
  AccountDeleteError,
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

export function useAccountDeleteOrchestrator(): UseAccountDeleteOrchestratorResult {
  const [state, setState] = React.useState<OrchestratorState>("idle");
  const [error, setError] = React.useState<AccountDeleteError | null>(null);
  const isSubmittingRef = React.useRef(false);

  const IS_MOCK_AUTH = isMockAuthMode();

  const { client: supabaseClient, session, clearSessionStorage } = useWebAuthSession();
  const [scope] = React.useState(() => accountScope.capture());

  const submit = React.useCallback(async () => {
    // DEL-IDEM-1: idempotent — if already submitting, no-op.
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setState("submitting");
    setError(null);

    // Read env mode at call-time (dynamic, not captured at hook init) for testability.
    const currentIsMockAuth = isMockAuthMode();

    try {
      accountScope.assertCurrent(scope);
      if (scope.kind === "locked" || !scope.accountId || !scope.generation) {
        throw new AccountDeleteError("unauthorized", "Unlock the account before deleting its data");
      }
      if (currentIsMockAuth && scope.kind !== "demo") throw new AccountDeleteError("unauthorized", "Demo deletion requires a demo account");
      if (!currentIsMockAuth) {
        // Live-auth: call backend FIRST (DEL-ORCH-3 sequencing).
        // supabaseClient is obtained from the SHIPPED session context.
        if (!supabaseClient || session?.user.id !== scope.accountId || !session.access_token || scope.kind !== "account") {
          throw new AccountDeleteError("unauthorized", "No active Supabase session");
        }
        // Suppress implicit signOut: the shared client may already belong to B.
        // Idempotency (DEL-ORCH-4): if deleteAccount throws kind="already_deleted",
        // treat as success and proceed to local wipe (account is gone).
        try {
          await deleteAccount(supabaseClient, { accessToken: session.access_token, signOutAfterDelete: false });
        } catch (err) {
          if (err instanceof AccountDeleteError && err.kind === "already_deleted") {
            // Idempotent — proceed to wipe (account already deleted server-side).
          } else {
            throw err;
          }
        }
      }
      // Mock-auth: skip backend + signOut — proceed directly to local wipe.

      // Local wipe (same in both paths — HC3: only reached AFTER backend success or mock skip).
      setState("wiping");

      // Explicit owner operations may finish after A has signed out or B has
      // signed in. They never resolve the mutable current account after an await.
      const receipt = beginAccountLocalDeletion(scope);
      await resumeAccountLocalDeletion(receipt);

      if (accountScope.capture() === scope) {
        const clearing = clearSessionStorage(); // synchronously invalidates A
        const clearedScope = accountScope.capture();
        await clearing;
        // A late clear must not navigate away from a newly active B.
        if (accountScope.capture() === clearedScope) window.location.assign("/");
      }
      setState("success");
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
  }, [supabaseClient, session, clearSessionStorage, scope]);

  const reset = React.useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return {
    state,
    error,
    isMockAuth: IS_MOCK_AUTH,
    submit,
    reset,
  };
}
