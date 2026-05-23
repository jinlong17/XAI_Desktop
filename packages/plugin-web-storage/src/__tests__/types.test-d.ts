/**
 * Type-level tests — AC-TYPE-1..6
 * Uses vitest's expectTypeOf for compile-time assertions.
 *
 * These tests do NOT run at runtime; they are checked by `vitest run`'s
 * type-checking pass (and by `check-types`).
 */

import { describe, it, expectTypeOf } from "vitest";
import type { WebPrefValue } from "../internal/registry.js";
import type { RailPos, ClockStyle } from "../internal/registry.js";
import { setPref, getPref } from "../internal/storage.js";
import { usePref } from "../internal/usePref.js";

// ---------------------------------------------------------------------------
// AC-TYPE-1: WebPrefValue<"xai_accent_hue"> is number
// ---------------------------------------------------------------------------

describe("AC-TYPE-1: WebPrefValue<'xai_accent_hue'> is number", () => {
  it("type assertion", () => {
    expectTypeOf<WebPrefValue<"xai_accent_hue">>().toEqualTypeOf<number>();
  });
});

// ---------------------------------------------------------------------------
// AC-TYPE-2: WebPrefValue<"xai_rail_pos"> is the literal union
// ---------------------------------------------------------------------------

describe("AC-TYPE-2: WebPrefValue<'xai_rail_pos'> is RailPos union", () => {
  it("type assertion", () => {
    expectTypeOf<WebPrefValue<"xai_rail_pos">>().toEqualTypeOf<RailPos>();
  });
});

// ---------------------------------------------------------------------------
// AC-TYPE-3: usePref("xai_clock_style") first element is ClockStyle
// ---------------------------------------------------------------------------

describe("AC-TYPE-3: usePref('xai_clock_style') tuple element 0 is ClockStyle", () => {
  it("type assertion (compile-time only)", () => {
    // We assert the return type of usePref without actually calling it
    type ReturnTuple = ReturnType<typeof usePref<"xai_clock_style">>;
    type ValueType = ReturnTuple[0];
    expectTypeOf<ValueType>().toEqualTypeOf<ClockStyle>();
  });
});

// ---------------------------------------------------------------------------
// AC-TYPE-4: setPref("xai_accent_hue", "abc") is a TypeScript error
// ---------------------------------------------------------------------------

describe("AC-TYPE-4: setPref(xai_accent_hue, 'abc') is a compile-time error", () => {
  it("@ts-expect-error: string is not assignable to number", () => {
    // @ts-expect-error — 'abc' is string, but xai_accent_hue expects number
    setPref("xai_accent_hue", "abc");
  });
});

// ---------------------------------------------------------------------------
// AC-TYPE-5: usePref("not_a_key") is a TypeScript error
// ---------------------------------------------------------------------------

describe("AC-TYPE-5: usePref('not_a_key') is a compile-time error", () => {
  it("@ts-expect-error — 'not_a_key' is not a WebPrefKey", () => {
    // @ts-expect-error — 'not_a_key' is not assignable to WebPrefKey
    usePref("not_a_key");
  });
});

// ---------------------------------------------------------------------------
// AC-TYPE-6: getPref return types are inferred
// ---------------------------------------------------------------------------

describe("AC-TYPE-6: getPref return types are inferred", () => {
  it("getPref('xai_accent_hue') return type is number", () => {
    // Verify that calling getPref with a known key returns the correct type
    type AccentHueReturn = ReturnType<typeof getPref<"xai_accent_hue">>;
    expectTypeOf<AccentHueReturn>().toEqualTypeOf<number>();
  });
});
