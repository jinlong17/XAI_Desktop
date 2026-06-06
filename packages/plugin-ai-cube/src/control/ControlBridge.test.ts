import { describe, expect, it } from "vitest";
import { assertAiCubeControlBridge } from "./ControlBridge";
import type { AiCubeControlBridge } from "./types";

describe("assertAiCubeControlBridge", () => {
  it("throws when provider is missing", () => {
    expect(() => assertAiCubeControlBridge(undefined)).toThrow(
      "useAiCubeControlBridge must be used within AiCubeControlProvider",
    );
  });

  it("returns the bridge object when present", () => {
    const bridge: AiCubeControlBridge = {
      shell: {
        isPanelOpen: false,
        togglePanel() {},
        closePanel() {},
        async startWindowDrag() {},
      },
      appearance: {
        cubeColor: "#111111",
        cubeTextColor: "#ffffff",
        cubeOpacity: 0.9,
        cubeSize: 60,
        cubeFontSize: 24,
        gridOpacity: 0.8,
        gridBlur: true,
        setCubeColor() {},
        setCubeTextColor() {},
        setCubeOpacity() {},
        setCubeSize() {},
        setCubeFontSize() {},
        setGridOpacity() {},
        setGridBlur() {},
      },
      actions: {
        async createGrid() {},
        async clearAllGrids() {},
        openClipboard() {},
        openPomodoro() {},
        openSearch() {},
        openPluginCenter() {},
        openSettings() {},
      },
    };

    expect(assertAiCubeControlBridge(bridge)).toBe(bridge);
  });
});
