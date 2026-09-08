/**
 * meditation adapter — ME1..ME4
 * test.md §3 P2
 */
import { it, expect, beforeEach } from "vitest";
import { __resetCmdkRegistry } from "../../internal/registry.js";
import { meditationAdapter } from "../../adapters/meditation.js";

beforeEach(() => {
  __resetCmdkRegistry();
});

it("ME1 — empty query → module-jump", () => {
  const hits = meditationAdapter("", {});
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("ME2 — scene name alias match", () => {
  const hits = meditationAdapter("forest", {});
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("ME3 — sound name alias match", () => {
  const hits = meditationAdapter("rain sounds", { scene: "forest" });
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("ME4 — opaque state defensive → module-jump on alias", () => {
  // State that doesn't match but alias does
  const hits = meditationAdapter("calm", "not-an-object");
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});
