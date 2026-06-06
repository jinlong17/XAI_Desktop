/**
 * TT-GUARD-* — admin route guard tests (Phase 2).
 *
 * Covers the fail-closed resolver contract (api.md §3, test.md §2) AND the
 * component-level behavior (renders children only when allowed; renders fallback
 * + fires navigate otherwise). TT-GUARD-DENY (non-admin) and TT-GUARD-ALLOW
 * (admin) are the CORE AC-1 negative/positive tests.
 *
 * The upstream `useWebAuthSession` hook is mocked to inject deterministic session
 * state without standing up a real Supabase client — this keeps the test on the
 * READ-ONLY session contract seam (no upstream modification).
 *
 * Design authority: apps/admin/docs/api.md §3, apps/admin/docs/test.md §2.
 * Phase: P2 (admin auth gate).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  resolveAdminRouteGuard,
  AdminRouteGate,
} from "./AdminRouteGate";
import type { AdminClaim } from "./adminClaim";

// ---- Mock the upstream read-only session hook (seam injection) ----
const mockUseWebAuthSession = vi.fn();
vi.mock("@repo/web-auth-device-session", () => ({
  useWebAuthSession: () => mockUseWebAuthSession(),
  // Provider is a passthrough in tests (we inject state via the hook mock).
  WebAuthSessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const ADMIN: AdminClaim = { isAdmin: true, role: "admin" };
const NON_ADMIN: AdminClaim = { isAdmin: false };

describe("TT-GUARD: resolveAdminRouteGuard (pure resolver, fail-closed)", () => {
  it("TT-GUARD-LOADING: state=loading → { allow:false } and NO redirect", () => {
    const g = resolveAdminRouteGuard("loading", NON_ADMIN, "/x");
    expect(g.allow).toBe(false);
    expect(g.redirectTo).toBeUndefined();
  });

  it("TT-GUARD-UNAUTH: state=unauthenticated → redirect to /auth/login with reason auth_required", () => {
    const g = resolveAdminRouteGuard("unauthenticated", NON_ADMIN, "/dashboard");
    expect(g.allow).toBe(false);
    expect(g.reason).toBe("auth_required");
    expect(g.redirectTo).toContain("/auth/login?next=");
    expect(g.redirectTo).toContain(encodeURIComponent("/dashboard"));
  });

  it("TT-GUARD-UNCONFIGURED: state=unconfigured → auth_required (fail closed, no real config)", () => {
    const g = resolveAdminRouteGuard("unconfigured", ADMIN, "/dashboard");
    // Even with an admin claim, an unconfigured/unauthenticated session is denied.
    expect(g.allow).toBe(false);
    expect(g.reason).toBe("auth_required");
  });

  it("TT-GUARD-DENY: authenticated + isAdmin:false → redirect /forbidden, reason not_admin (CORE negative, AC-1)", () => {
    const g = resolveAdminRouteGuard("authenticated", NON_ADMIN);
    expect(g.allow).toBe(false);
    expect(g.redirectTo).toBe("/forbidden");
    expect(g.reason).toBe("not_admin");
  });

  it("TT-GUARD-ALLOW: authenticated + isAdmin:true → { allow:true } (CORE positive, AC-1)", () => {
    const g = resolveAdminRouteGuard("authenticated", ADMIN);
    expect(g.allow).toBe(true);
    expect(g.redirectTo).toBeUndefined();
    expect(g.reason).toBeUndefined();
  });
});

describe("TT-GUARD: AdminRouteGate (component behavior)", () => {
  beforeEach(() => {
    mockUseWebAuthSession.mockReset();
  });

  // globals:false → Testing Library's auto-cleanup is not registered; do it manually
  // so rendered DOM does not leak across test cases.
  afterEach(() => {
    cleanup();
  });

  it("TT-GUARD-ALLOW-RENDER: admin session renders children", () => {
    mockUseWebAuthSession.mockReturnValue({ state: "authenticated", session: {} });
    const navigate = vi.fn();
    render(
      <AdminRouteGate
        navigate={navigate}
        predicate={() => ADMIN}
        fallback={<div>denied</div>}
      >
        <div>secret-admin-content</div>
      </AdminRouteGate>,
    );
    expect(screen.getByText("secret-admin-content")).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("TT-GUARD-DENY-RENDER: non-admin renders fallback + fires navigate(/forbidden)", () => {
    mockUseWebAuthSession.mockReturnValue({ state: "authenticated", session: {} });
    const navigate = vi.fn();
    render(
      <AdminRouteGate
        navigate={navigate}
        predicate={() => NON_ADMIN}
        fallback={<div>access-denied</div>}
      >
        <div>secret-admin-content</div>
      </AdminRouteGate>,
    );
    expect(screen.getByText("access-denied")).toBeTruthy();
    expect(screen.queryByText("secret-admin-content")).toBeNull();
    expect(navigate).toHaveBeenCalledWith("/forbidden");
  });

  it("TT-GUARD-UNAUTH-RENDER: unauthenticated renders fallback + fires navigate(/auth/login...)", () => {
    mockUseWebAuthSession.mockReturnValue({ state: "unauthenticated", session: null });
    const navigate = vi.fn();
    render(
      <AdminRouteGate navigate={navigate} predicate={() => NON_ADMIN} fallback={<div>login-first</div>}>
        <div>secret-admin-content</div>
      </AdminRouteGate>,
    );
    expect(screen.getByText("login-first")).toBeTruthy();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0]?.[0]).toContain("/auth/login?next=");
  });

  it("TT-GUARD-LOADING-RENDER: loading renders fallback, no navigate", () => {
    mockUseWebAuthSession.mockReturnValue({ state: "loading", session: null });
    const navigate = vi.fn();
    render(
      <AdminRouteGate navigate={navigate} predicate={() => NON_ADMIN} fallback={<div>spinner</div>}>
        <div>secret-admin-content</div>
      </AdminRouteGate>,
    );
    expect(screen.getByText("spinner")).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });
});
