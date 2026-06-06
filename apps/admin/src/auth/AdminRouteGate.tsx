/**
 * apps/admin/src/auth/AdminRouteGate.tsx — admin route guard (Phase 2).
 *
 * Composes the SHIPPED read-only session (`useWebAuthSession()` from
 * `@repo/web-auth-device-session`) with the admin-claim predicate
 * (`adminClaim.ts`). This is the permission boundary that AC-1 exercises with a
 * negative (non-admin denied) + positive (admin allowed) test.
 *
 * Composition mirrors the upstream `resolveAppRouteGuard` / `AppRouteGate`
 * pattern in `packages/web-auth-device-session/src/guards.tsx`:
 *   - a pure resolver (`resolveAdminRouteGuard`) maps (state, claim) → resolution
 *   - a component (`AdminRouteGate`) renders children only when allowed, renders
 *     a fallback otherwise, and fires an effect-driven redirect.
 *
 * `AdminGuardResolution` is a clean EXTENSION of the upstream `GuardResolution`
 * shape: it adds the admin-specific `"not_admin"` reason on top of the auth gate.
 *
 * Fail-closed contract (api.md §3, test.md §2):
 *   - state === "loading"                       → { allow: false }                (render fallback; no redirect)
 *   - state !== "authenticated"                 → { allow: false, redirectTo: "/auth/login?next=...", reason: "auth_required" }
 *   - authenticated AND claim.isAdmin === false → { allow: false, redirectTo: "/forbidden",          reason: "not_admin" }
 *   - authenticated AND claim.isAdmin === true  → { allow: true }
 *
 * Test strategy: apps/admin/docs/test.md §2 (TT-GUARD-*).
 */
import { useEffect, type PropsWithChildren, type ReactNode } from "react";
import { useWebAuthSession } from "@repo/web-auth-device-session";
import {
  mockAdminClaimPredicate,
  type AdminClaim,
  type AdminClaimPredicate,
} from "./adminClaim";

type AuthState = "loading" | "authenticated" | "unauthenticated" | "unconfigured";

export interface AdminGuardResolution {
  allow: boolean;
  redirectTo?: string;
  /** Extends the upstream GuardResolution reason set with the admin gate's "not_admin". */
  reason?: "auth_required" | "not_admin";
}

/**
 * Pure resolver: maps the read-only session state + the admin claim to a guard
 * resolution. Fails closed at every branch. No side effects.
 */
export function resolveAdminRouteGuard(
  state: AuthState,
  claim: AdminClaim,
  nextPath?: string,
): AdminGuardResolution {
  // Loading: do not redirect yet; render fallback while the session resolves.
  if (state === "loading") {
    return { allow: false };
  }

  // Not authenticated (unauthenticated / unconfigured): auth gate denies first.
  if (state !== "authenticated") {
    const next = nextPath ?? currentPath();
    return {
      allow: false,
      redirectTo: `/auth/login?next=${encodeURIComponent(next)}`,
      reason: "auth_required",
    };
  }

  // Authenticated but not an admin: admin gate denies (fail closed).
  if (!claim.isAdmin) {
    return { allow: false, redirectTo: "/forbidden", reason: "not_admin" };
  }

  // Authenticated AND admin: allow.
  return { allow: true };
}

function currentPath(): string {
  if (typeof window !== "undefined") {
    return `${window.location.pathname}${window.location.search}`;
  }
  return "/";
}

function maybeRedirect(
  target: string | undefined,
  navigate?: (path: string) => void,
): void {
  if (!target) {
    return;
  }
  if (navigate) {
    navigate(target);
    return;
  }
  if (typeof window !== "undefined") {
    window.location.assign(target);
  }
}

export interface AdminRouteGateProps extends PropsWithChildren {
  fallback?: ReactNode;
  navigate?: (path: string) => void;
  /** Injectable for testing; defaults to the slice-1 mock predicate. */
  predicate?: AdminClaimPredicate;
}

/**
 * Renders `children` ONLY when the session is authenticated AND the admin claim
 * is granted. Otherwise renders `fallback` and (if a redirect target exists)
 * fires a redirect via the injected `navigate` or `window.location.assign`.
 */
export function AdminRouteGate({
  children,
  fallback = null,
  navigate,
  predicate = mockAdminClaimPredicate,
}: AdminRouteGateProps) {
  const { state, session } = useWebAuthSession();
  const claim = predicate(session);
  const guard = resolveAdminRouteGuard(state, claim);

  useEffect(() => {
    maybeRedirect(guard.redirectTo, navigate);
  }, [guard.redirectTo, navigate]);

  if (!guard.allow) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
