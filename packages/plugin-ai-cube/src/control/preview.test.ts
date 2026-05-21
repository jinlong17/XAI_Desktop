import { describe, expect, it } from "vitest";
import {
  PREVIEW_STATUS_TEXT,
  isPreviewActionEnabled,
} from "./preview";

describe("preview gating", () => {
  it("keeps preview messaging explicit for Phase 0-3", () => {
    expect(PREVIEW_STATUS_TEXT).toContain("Phase 0-3");
    expect(PREVIEW_STATUS_TEXT.toLowerCase()).toContain("disabled");
  });

  it("keeps placeholder actions disabled until owning plugins stabilize", () => {
    expect(isPreviewActionEnabled("create-grid")).toBe(true);
    expect(isPreviewActionEnabled("clear-grids")).toBe(true);
    expect(isPreviewActionEnabled("clipboard")).toBe(false);
    expect(isPreviewActionEnabled("pomodoro")).toBe(false);
    expect(isPreviewActionEnabled("search")).toBe(false);
  });
});
