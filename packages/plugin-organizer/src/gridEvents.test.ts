import { describe, expect, it } from "vitest";
import {
  hasGridId,
  isFileDropPayload,
  isGridCreateRequestPayload,
  isGridStatePayload,
  isGridUpdatePayload,
  toDroppedFile,
} from "./gridEvents";

describe("grid event guards", () => {
  it("rejects events without a valid gridId", () => {
    expect(hasGridId({})).toBe(false);
    expect(hasGridId({ gridId: "" })).toBe(false);
    expect(hasGridId({ gridId: "grid-1" })).toBe(true);
  });

  it("guards scoped grid update and state payloads", () => {
    expect(isGridUpdatePayload({ gridId: "grid-1", changes: {} })).toBe(true);
    expect(isGridUpdatePayload({ changes: {} })).toBe(false);

    expect(isGridStatePayload({ gridId: "grid-1", grid: {}, items: {} })).toBe(true);
    expect(isGridStatePayload({ gridId: "grid-1", grid: {} })).toBe(false);
  });

  it("guards create requests and file drops", () => {
    expect(
      isGridCreateRequestPayload({
        rect: { x: 1, y: 2, width: 220, height: 220 },
        source: "control",
      }),
    ).toBe(true);
    expect(isGridCreateRequestPayload({ rect: { x: 1, y: 2 } })).toBe(false);

    expect(
      isFileDropPayload({
        gridId: "grid-1",
        files: [{ path: "/Applications/Test.app", name: "Test.app", kind: "app" }],
      }),
    ).toBe(true);
    expect(isFileDropPayload({ files: [] })).toBe(false);
  });

  it("converts paths to dropped file payloads", () => {
    expect(toDroppedFile("/Applications/QuickTime Player.app")).toMatchObject({
      path: "/Applications/QuickTime Player.app",
      name: "QuickTime Player.app",
      kind: "app",
      securityScope: "none",
    });
  });
});
