/**
 * Unit assertions on formatRemaining — used by AC-PLAYER-5, AC-PLAYER-9.
 */
import { describe, it, expect } from "vitest";
import { formatRemaining } from "../internal/formatRemaining.js";

describe("formatRemaining", () => {
  it("formats whole minutes", () => {
    expect(formatRemaining(900)).toEqual({ mm: "15", ss: "00" });
  });

  it("formats minutes + seconds", () => {
    expect(formatRemaining(125)).toEqual({ mm: "02", ss: "05" });
  });

  it("AC-PLAYER-9: clamps zero to 00:00", () => {
    expect(formatRemaining(0)).toEqual({ mm: "00", ss: "00" });
  });

  it("clamps negative to 00:00", () => {
    expect(formatRemaining(-10)).toEqual({ mm: "00", ss: "00" });
  });

  it("floors fractional seconds", () => {
    expect(formatRemaining(59.9)).toEqual({ mm: "00", ss: "59" });
  });

  it("pads single-digit minutes/seconds", () => {
    expect(formatRemaining(5)).toEqual({ mm: "00", ss: "05" });
    expect(formatRemaining(65)).toEqual({ mm: "01", ss: "05" });
  });

  it("handles large values", () => {
    expect(formatRemaining(3599)).toEqual({ mm: "59", ss: "59" });
  });
});
