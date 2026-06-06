/**
 * apps/admin/src/auth/adminClaim.ts — typed admin-claim predicate (Phase 2).
 *
 * The admin-claim is the CORE permission boundary of slice #1. It is a pure,
 * side-effect-free predicate that derives an `AdminClaim` from the read-only
 * browser session exposed by `@repo/web-auth-device-session`.
 *
 * Boundary discipline (design.md assumption #4, api.md §2):
 *   - The upstream session contract (`@repo/web-auth-device-session`) is consumed
 *     READ-ONLY and is NOT modified this slice. No admin claim is modeled upstream,
 *     so the claim is derived locally by THIS mock predicate.
 *   - The `Session` type is taken from the upstream package's public context-value
 *     type (`WebAuthSessionContextValue["session"]`) rather than importing
 *     `@supabase/supabase-js` directly — this keeps admin from taking a new direct
 *     dependency and proves the seam is the upstream session shape, unchanged.
 *   - The predicate is the SINGLE gate this slice. Real RBAC permission keys +
 *     server enforcement = row #2. There are NO enforcement keys here.
 *
 * Fail-closed contract (api.md §2, test.md §2):
 *   - `session === null`                          → { isAdmin: false }
 *   - session present, no admin marker            → { isAdmin: false }
 *   - session present WITH explicit admin marker  → { isAdmin: true }
 *   - never throws; always returns a defined AdminClaim
 *   - no network, no storage writes (pure)
 *
 * Test strategy: apps/admin/docs/test.md §2 (TT-PREDICATE-*).
 */
import type { WebAuthSessionContextValue } from "@repo/web-auth-device-session";

/**
 * The exact upstream session type, surfaced WITHOUT a new direct dependency on
 * `@supabase/supabase-js`. `WebAuthSessionContextValue["session"]` is
 * `Session | null`; `NonNullable<...>` recovers the `Session` shape.
 */
export type AdminSession = NonNullable<WebAuthSessionContextValue["session"]>;

export interface AdminClaim {
  isAdmin: boolean;
  /** opaque role label for display only; NOT an enforcement key (RBAC = row #2) */
  role?: string;
}

/** Pure predicate: derives an admin claim from the session. Fails CLOSED. */
export type AdminClaimPredicate = (session: AdminSession | null) => AdminClaim;

/**
 * Build-time mock-claim escape hatch (design.md assumption #3, .env.example).
 *
 * When `VITE_ADMIN_MOCK_CLAIM === "true"` AND a session is present, the mock
 * treats the authenticated session as an admin. This is the `mock-authenticated`
 * posture for slice #1 — it lets the surface be exercised locally WITHOUT any
 * real admin-claim source (which is row #2). It is read once, here, with no
 * side effects. It does NOT grant access without an authenticated session: the
 * route guard still requires `state === "authenticated"`, so an absent session
 * still fails closed.
 */
function mockClaimFlagEnabled(): boolean {
  // import.meta.env is statically replaced by Vite at build time; reading it is
  // pure (no I/O). Accessed directly (not via an indirection) so Vitest's
  // `vi.stubEnv` and Vite's define-replacement both intercept the read.
  return import.meta.env?.VITE_ADMIN_MOCK_CLAIM === "true";
}

/**
 * Reads the admin marker off a session WITHOUT assuming a concrete Supabase
 * shape (the upstream `Session` carries `user.app_metadata`, an arbitrary
 * record). We read it defensively so a malformed session can never throw.
 */
function sessionHasAdminMarker(session: AdminSession): boolean {
  // Defensive structural read; never assumes the field exists or its type.
  const user = (session as { user?: { app_metadata?: Record<string, unknown> } })
    .user;
  const appMetadata = user?.app_metadata;
  return appMetadata?.["xai_admin"] === true;
}

/**
 * Slice #1 mock implementation — fails closed on null / unknown.
 *
 * An admin claim is granted only when EITHER:
 *   (a) the session explicitly carries `user.app_metadata.xai_admin === true`, OR
 *   (b) the build-time `VITE_ADMIN_MOCK_CLAIM` flag is "true" AND a session exists.
 * In every other case (including `null`), it returns `{ isAdmin: false }`.
 */
export const mockAdminClaimPredicate: AdminClaimPredicate = (session) => {
  // Fail closed: no session → never admin.
  if (!session) {
    return { isAdmin: false };
  }

  try {
    if (sessionHasAdminMarker(session)) {
      return { isAdmin: true, role: "admin" };
    }
    if (mockClaimFlagEnabled()) {
      // mock-authenticated posture: an authenticated session is treated as admin
      // ONLY for the isolated local/dev admin surface (slice #1). No secrets, no
      // enforcement keys, no production effect.
      return { isAdmin: true, role: "mock-admin" };
    }
  } catch {
    // A malformed session must never throw — fall through to fail-closed.
    return { isAdmin: false };
  }

  return { isAdmin: false };
};
