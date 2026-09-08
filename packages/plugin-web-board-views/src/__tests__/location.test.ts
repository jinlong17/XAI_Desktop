/**
 * Tests for isValidLocation guard — LOC-1..LOC-6
 * Gap-closure row #6 — board-views slice
 */
import { describe, test, expect } from "vitest";
import { isValidLocation } from "../internal/location.js";

describe("isValidLocation", () => {
  test("LOC-1 valid: lat+lng in range, no label", () => {
    expect(isValidLocation({ lat: 35.6762, lng: 139.6503 })).toBe(true);
  });

  test("LOC-2 valid: boundary values lat=90 lng=-180, with label string", () => {
    expect(isValidLocation({ lat: 90, lng: -180, label: "North Pole area" })).toBe(true);
  });

  test("LOC-3 invalid: NaN lat rejected", () => {
    expect(isValidLocation({ lat: NaN, lng: 0 })).toBe(false);
  });

  test("LOC-4 invalid: Infinity lng rejected", () => {
    expect(isValidLocation({ lat: 0, lng: Infinity })).toBe(false);
  });

  test("LOC-5 invalid: lat out of range (>90)", () => {
    expect(isValidLocation({ lat: 91, lng: 0 })).toBe(false);
  });

  test("LOC-6 invalid: non-string label rejected", () => {
    expect(isValidLocation({ lat: 0, lng: 0, label: 42 })).toBe(false);
  });
});
