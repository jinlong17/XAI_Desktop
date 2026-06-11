import { describe, expect, it } from "vitest";
import { applyMobileRuntimeAttributes, getMobileRuntimeFlags } from "./runtime";

describe("getMobileRuntimeFlags", () => {
  it("detects standalone display mode", () => {
    const flags = getMobileRuntimeFlags({
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
      maxTouchPoints: 5,
      standalone: true,
      displayModeStandalone: true,
      capacitorNative: false,
    });

    expect(flags.isMobileLike).toBe(true);
    expect(flags.isStandalone).toBe(true);
    expect(flags.isCapacitor).toBe(false);
  });

  it("detects Capacitor native shell", () => {
    const flags = getMobileRuntimeFlags({
      userAgent: "Mozilla/5.0 (Linux; Android 15)",
      maxTouchPoints: 5,
      standalone: false,
      displayModeStandalone: false,
      capacitorNative: true,
    });

    expect(flags.isMobileLike).toBe(true);
    expect(flags.isStandalone).toBe(true);
    expect(flags.isCapacitor).toBe(true);
  });

  it("applies runtime flags as document data attributes", () => {
    const element = document.createElement("html");

    applyMobileRuntimeAttributes(element, {
      isMobileLike: true,
      isStandalone: false,
      isCapacitor: true,
    });

    expect(element.dataset.mobileLike).toBe("true");
    expect(element.dataset.mobileStandalone).toBe("false");
    expect(element.dataset.mobileCapacitor).toBe("true");
  });
});
