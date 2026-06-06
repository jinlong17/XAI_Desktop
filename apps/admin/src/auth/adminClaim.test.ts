/**
 * TT-PREDICATE-* — admin-claim predicate unit tests (Phase 2).
 *
 * Exercises the fail-closed contract of `mockAdminClaimPredicate` (api.md §2,
 * test.md §2). The predicate is the CORE permission boundary of slice #1, so the
 * negative tests (null + non-admin) are MANDATORY.
 *
 * Design authority: apps/admin/docs/api.md §2, apps/admin/docs/test.md §2.
 * Phase: P2 (admin auth gate).
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  mockAdminClaimPredicate,
  type AdminSession,
} from "./adminClaim";

/** Minimal structural session matching the shape the predicate reads. */
function makeSession(appMetadata?: Record<string, unknown>): AdminSession {
  return {
    user: { app_metadata: appMetadata ?? {} },
  } as unknown as AdminSession;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("TT-PREDICATE: mockAdminClaimPredicate (fail-closed)", () => {
  it("TT-PREDICATE-NULL: predicate(null) → { isAdmin: false } (fail closed)", () => {
    // MANDATORY negative.
    expect(mockAdminClaimPredicate(null)).toEqual({ isAdmin: false });
  });

  it("TT-PREDICATE-NON-ADMIN: session present, no admin marker → { isAdmin: false }", () => {
    // MANDATORY negative. Ensure the mock-claim flag is OFF for this case.
    vi.stubEnv("VITE_ADMIN_MOCK_CLAIM", "false");
    const session = makeSession({ some_other_flag: true });
    expect(mockAdminClaimPredicate(session)).toEqual({ isAdmin: false });
  });

  it("TT-PREDICATE-ADMIN: session with xai_admin marker → { isAdmin: true }", () => {
    vi.stubEnv("VITE_ADMIN_MOCK_CLAIM", "false");
    const session = makeSession({ xai_admin: true });
    const claim = mockAdminClaimPredicate(session);
    expect(claim.isAdmin).toBe(true);
  });

  it("TT-PREDICATE-MOCK-FLAG: VITE_ADMIN_MOCK_CLAIM=true + session → admin (mock-authenticated)", () => {
    vi.stubEnv("VITE_ADMIN_MOCK_CLAIM", "true");
    const session = makeSession();
    expect(mockAdminClaimPredicate(session).isAdmin).toBe(true);
  });

  it("TT-PREDICATE-MOCK-FLAG-FAILS-CLOSED: VITE_ADMIN_MOCK_CLAIM=true but NO session → still denied", () => {
    // The mock flag must NOT grant access without an authenticated session.
    vi.stubEnv("VITE_ADMIN_MOCK_CLAIM", "true");
    expect(mockAdminClaimPredicate(null)).toEqual({ isAdmin: false });
  });

  it("TT-PREDICATE-NO-THROW: malformed session never throws; returns defined AdminClaim", () => {
    vi.stubEnv("VITE_ADMIN_MOCK_CLAIM", "false");
    const malformed = [
      {} as AdminSession,
      { user: null } as unknown as AdminSession,
      { user: {} } as unknown as AdminSession,
      { user: { app_metadata: null } } as unknown as AdminSession,
      { user: { app_metadata: "nope" } } as unknown as AdminSession,
    ];
    for (const s of malformed) {
      const claim = mockAdminClaimPredicate(s);
      expect(claim).toBeDefined();
      expect(typeof claim.isAdmin).toBe("boolean");
      expect(claim.isAdmin).toBe(false);
    }
  });

  it("TT-PREDICATE-PURE: no network / no storage side effects", () => {
    vi.stubEnv("VITE_ADMIN_MOCK_CLAIM", "true");
    const fetchSpy = vi.spyOn(globalThis, "fetch" as never).mockImplementation(
      () => {
        throw new Error("predicate must not call fetch");
      },
    );
    // localStorage may be undefined in the test env; only spy if present.
    const setItemSpy =
      typeof localStorage !== "undefined"
        ? vi.spyOn(Storage.prototype, "setItem")
        : null;

    mockAdminClaimPredicate(makeSession({ xai_admin: true }));
    mockAdminClaimPredicate(null);

    expect(fetchSpy).not.toHaveBeenCalled();
    if (setItemSpy) {
      expect(setItemSpy).not.toHaveBeenCalled();
      setItemSpy.mockRestore();
    }
    fetchSpy.mockRestore();
  });
});
