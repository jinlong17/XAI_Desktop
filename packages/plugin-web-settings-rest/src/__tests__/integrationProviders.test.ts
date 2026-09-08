/**
 * IP1..IP4 — Integration provider config tests (test.md §5.3 P1)
 */
import { describe, it, expect } from "vitest";
import { PROVIDERS } from "../internal/integrationProviders.js";
import { PREF_REGISTRY } from "@repo/plugin-web-storage";

describe("PROVIDERS config", () => {
  it("IP1: PROVIDERS has exactly 3 entries (Notion, GCal, Linear)", () => {
    expect(PROVIDERS.length).toBe(3);
    const ids = PROVIDERS.map((p) => p.id);
    expect(ids).toContain("notion");
    expect(ids).toContain("gcal");
    expect(ids).toContain("linear");
  });

  it("IP2: every authorizeUrl and tokenUrl starts with https://", () => {
    for (const provider of PROVIDERS) {
      expect(
        provider.authorizeUrl,
        `authorizeUrl for ${provider.id} must be https://`,
      ).toMatch(/^https:\/\//);
      expect(
        provider.tokenUrl,
        `tokenUrl for ${provider.id} must be https://`,
      ).toMatch(/^https:\/\//);
    }
  });

  it("IP3: every prefKey matches a registered key in PREF_REGISTRY", () => {
    for (const provider of PROVIDERS) {
      expect(
        provider.prefKey in PREF_REGISTRY,
        `prefKey ${provider.prefKey} not found in PREF_REGISTRY`,
      ).toBe(true);
    }
  });

  it("IP4: every IntegrationProviderId is in the type union (runtime check)", () => {
    const validIds: readonly string[] = ["notion", "gcal", "linear"];
    for (const provider of PROVIDERS) {
      expect(validIds).toContain(provider.id);
    }
  });
});
