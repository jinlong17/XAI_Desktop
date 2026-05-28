import { describe, expect, it } from "vitest";
import { resolveWebBuildSourcemapPolicy } from "./sourcemapPolicy";

describe("resolveWebBuildSourcemapPolicy", () => {
  it("defaults to false when no opt-in env is provided", () => {
    expect(resolveWebBuildSourcemapPolicy(undefined)).toBe(false);
  });

  it("enables hidden sourcemaps only for explicit truthy opt-in", () => {
    expect(resolveWebBuildSourcemapPolicy("1")).toBe("hidden");
    expect(resolveWebBuildSourcemapPolicy("true")).toBe("hidden");
    expect(resolveWebBuildSourcemapPolicy("yes")).toBe("hidden");
  });

  it("keeps sourcemaps disabled for non-truthy values", () => {
    expect(resolveWebBuildSourcemapPolicy("0")).toBe(false);
    expect(resolveWebBuildSourcemapPolicy("false")).toBe(false);
    expect(resolveWebBuildSourcemapPolicy("no")).toBe(false);
  });
});
