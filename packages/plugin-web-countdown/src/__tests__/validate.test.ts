/**
 * validate.test.ts — Tests V1..V8
 *
 * V1: accepts valid card
 * V2: rejects missing id
 * V3: rejects missing title.en
 * V4: rejects missing title.zh
 * V5: rejects missing target_date
 * V6: rejects variant=image with null cover_url
 * V7: rejects variant=light with non-null cover_url
 * V8: tolerates extra fields
 */

import { describe, it, expect } from "vitest";
import { isCountdownCard } from "../internal/validate.js";
import { FIXTURE_FUTURE, FIXTURE_LIGHT } from "../__fixtures__/cards.js";

describe("isCountdownCard", () => {
  it("V1: accepts a valid image card", () => {
    expect(isCountdownCard(FIXTURE_FUTURE)).toBe(true);
  });

  it("V1b: accepts a valid light card", () => {
    expect(isCountdownCard(FIXTURE_LIGHT)).toBe(true);
  });

  it("V2: rejects missing id", () => {
    expect(isCountdownCard({ ...FIXTURE_FUTURE, id: "" })).toBe(false);
    expect(isCountdownCard({ ...FIXTURE_FUTURE, id: undefined })).toBe(false);
  });

  it("V3: rejects missing title.en", () => {
    expect(
      isCountdownCard({ ...FIXTURE_FUTURE, title: { zh: "周末" } }),
    ).toBe(false);
  });

  it("V4: rejects missing title.zh", () => {
    expect(
      isCountdownCard({ ...FIXTURE_FUTURE, title: { en: "Weekend" } }),
    ).toBe(false);
  });

  it("V5: rejects missing / invalid target_date", () => {
    expect(isCountdownCard({ ...FIXTURE_FUTURE, target_date: "" })).toBe(false);
    expect(isCountdownCard({ ...FIXTURE_FUTURE, target_date: "2026/05/30" })).toBe(false);
    expect(isCountdownCard({ ...FIXTURE_FUTURE, target_date: "not-a-date" })).toBe(false);
    expect(isCountdownCard({ ...FIXTURE_FUTURE, target_date: undefined })).toBe(false);
  });

  it("V6: rejects variant=image with null cover_url", () => {
    expect(
      isCountdownCard({ ...FIXTURE_FUTURE, variant: "image", cover_url: null }),
    ).toBe(false);
  });

  it("V7: rejects variant=light with non-null cover_url", () => {
    expect(
      isCountdownCard({ ...FIXTURE_LIGHT, variant: "light", cover_url: "preset:dusk" }),
    ).toBe(false);
  });

  it("V8: tolerates extra fields (not strict)", () => {
    expect(isCountdownCard({ ...FIXTURE_FUTURE, extra: "ignored" })).toBe(true);
  });

  it("rejects null", () => {
    expect(isCountdownCard(null)).toBe(false);
  });

  it("rejects non-object primitives", () => {
    expect(isCountdownCard(42)).toBe(false);
    expect(isCountdownCard("string")).toBe(false);
    expect(isCountdownCard(undefined)).toBe(false);
  });

  it("rejects wrong variant value", () => {
    expect(
      isCountdownCard({ ...FIXTURE_FUTURE, variant: "dark" }),
    ).toBe(false);
  });
});
