/**
 * types.test-d.ts — Compile-time type checks for public prop types.
 *
 * These are type assertions (expectTypeOf from vitest) — they fail at
 * compile time if the types are wrong.
 */

import { describe, it, expectTypeOf } from "vitest";
import type { DesktopPetProps, PetPickerProps, PetId } from "../types.js";

describe("DesktopPetProps type", () => {
  it("on prop is strictly boolean (not boolean | undefined)", () => {
    expectTypeOf<DesktopPetProps["on"]>().toEqualTypeOf<boolean>();
  });

  it("lang prop is Lang ('en' | 'zh')", () => {
    expectTypeOf<DesktopPetProps["lang"]>().toEqualTypeOf<"en" | "zh">();
  });
});

describe("PetPickerProps type", () => {
  it("current prop is PetId", () => {
    expectTypeOf<PetPickerProps["current"]>().toEqualTypeOf<PetId>();
  });

  it("open prop is strictly boolean", () => {
    expectTypeOf<PetPickerProps["open"]>().toEqualTypeOf<boolean>();
  });

  it("onClose is a function returning void", () => {
    expectTypeOf<PetPickerProps["onClose"]>().toEqualTypeOf<() => void>();
  });

  it("onSelect accepts PetId and returns void", () => {
    expectTypeOf<PetPickerProps["onSelect"]>().toEqualTypeOf<(next: PetId) => void>();
  });
});
