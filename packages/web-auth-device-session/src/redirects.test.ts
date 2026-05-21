import { describe, expect, it } from "vitest";
import { resolveSafeNextPath } from "./redirects";

describe("resolveSafeNextPath", () => {
  it("accepts app-relative paths in allowlist", () => {
    const result = resolveSafeNextPath("/app/tasks?view=today");
    expect(result).toEqual({ path: "/app/tasks?view=today", rejected: false });
  });

  it("rejects absolute urls", () => {
    const result = resolveSafeNextPath("https://evil.example/app");
    expect(result.path).toBe("/app");
    expect(result.rejected).toBe(true);
    expect(result.reason).toBe("absolute_url");
  });

  it("rejects protocol-relative targets", () => {
    const result = resolveSafeNextPath("//evil.example/app");
    expect(result.path).toBe("/app");
    expect(result.rejected).toBe(true);
    expect(result.reason).toBe("protocol_relative");
  });

  it("rejects unsupported local paths", () => {
    const result = resolveSafeNextPath("/settings");
    expect(result.path).toBe("/app");
    expect(result.rejected).toBe(true);
    expect(result.reason).toBe("path_not_allowed");
  });
});
