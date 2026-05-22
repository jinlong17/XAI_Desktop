import { describe, expect, it } from "vitest";
import { resolveRouteGroup } from "./routeGroup";

describe("resolveRouteGroup", () => {
  it("classifies landing routes", () => {
    expect(resolveRouteGroup("/")).toBe("landing");
  });

  it("classifies auth routes", () => {
    expect(resolveRouteGroup("/auth/login")).toBe("auth");
  });

  it("classifies app and module routes", () => {
    expect(resolveRouteGroup("/app")).toBe("app");
    expect(resolveRouteGroup("/app/todos/inbox")).toBe("module");
  });

  it("falls back to unknown for unmatched routes", () => {
    expect(resolveRouteGroup("/foo/bar")).toBe("unknown");
  });
});
