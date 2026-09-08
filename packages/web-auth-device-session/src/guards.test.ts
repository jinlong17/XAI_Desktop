import { describe, expect, it } from "vitest";
import { resolveAppRouteGuard, resolveAuthRouteGuard } from "./guards";

describe("route guards", () => {
  it("redirects authenticated users away from auth pages", () => {
    const result = resolveAuthRouteGuard("authenticated");
    expect(result).toEqual({
      allow: false,
      redirectTo: "/app",
      reason: "already_authenticated"
    });
  });

  it("redirects unauthenticated users to login with safe next", () => {
    const result = resolveAppRouteGuard("unauthenticated", "/app/projects?tab=today");
    expect(result).toEqual({
      allow: false,
      redirectTo: "/auth/login?next=%2Fapp%2Fprojects%3Ftab%3Dtoday",
      reason: "auth_required"
    });
  });

  it("allows authenticated users on app pages", () => {
    expect(resolveAppRouteGuard("authenticated", "/app")).toEqual({ allow: true });
  });
});
