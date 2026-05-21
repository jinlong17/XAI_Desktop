import { describe, expect, it } from "vitest";
import { resolveAuthCompletionRoute } from "./WebAuthPage";

describe("resolveAuthCompletionRoute", () => {
  it("detects oauth callback route", () => {
    expect(resolveAuthCompletionRoute("/auth/callback")).toBe("oauth-callback");
  });

  it("detects email verify route", () => {
    expect(resolveAuthCompletionRoute("/auth/verify")).toBe("email-verify");
  });

  it("returns null for non-completion routes", () => {
    expect(resolveAuthCompletionRoute("/auth/login")).toBeNull();
  });
});
