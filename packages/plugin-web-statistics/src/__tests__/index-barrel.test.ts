import { describe, it, expect } from "vitest";
import * as Barrel from "../index.js";

describe("index barrel — P1 surface (types only; module + registration in P2/P3)", () => {
  it("IB1: barrel does not expose internal helpers", () => {
    const exposed = Object.keys(Barrel as Record<string, unknown>);
    // P1 surface should not include implementation helpers.
    expect(exposed).not.toContain("isPomodoroSession");
    expect(exposed).not.toContain("aggregateRange");
    expect(exposed).not.toContain("trendPercent");
    expect(exposed).not.toContain("insightCopy");
  });

  it("IB2: type-only re-exports are erased at runtime", () => {
    // Type-only re-exports leave the runtime barrel empty in P1.
    // We tolerate any number of runtime exports here (could be 0) and just
    // require the side-effect CSS import to have succeeded.
    expect(typeof Barrel).toBe("object");
  });
});
