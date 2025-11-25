import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * ## SettingsContext (Canvas Controls)
 *
 * Wrap the host UI with `SettingsProvider` so both the micro-kernel and plugins
 * can read or change canvas styling without touching window management logic.
 *
 * ```tsx
 * import { SettingsProvider, useSettings } from "../context/SettingsContext";
 *
 * const { canvasOpacity, setCanvasOpacity } = useSettings();
 * setCanvasOpacity(0.42); // updates host background overlay + plugin affordances
 * ```
 */

export interface SettingsState {
  canvasOpacity: number;
  isBlurEnabled: boolean;
  cubeColor: string;
  cubeTextColor: string;
  cubeOpacity: number;
  cubeSize: number;
  cubeFontSize: number;
  gridOpacity: number;
  gridBlur: boolean;
}

export interface SettingsContextValue extends SettingsState {
  setCanvasOpacity: (value: number) => void;
  setBlurEnabled: (value: boolean) => void;
  setCubeColor: (value: string) => void;
  setCubeTextColor: (value: string) => void;
  setCubeOpacity: (value: number) => void;
  setCubeSize: (value: number) => void;
  setCubeFontSize: (value: number) => void;
  setGridOpacity: (value: number) => void;
  setGridBlur: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const DEFAULT_SETTINGS: SettingsState = {
  canvasOpacity: 0.35,
  isBlurEnabled: true,
  cubeColor: "#6366f1",
  cubeTextColor: "#ffffff",
  cubeOpacity: 0.9,
  cubeSize: 60,
  cubeFontSize: 24,
  gridOpacity: 0.8,
  gridBlur: true,
};

export const MOCK_DATA = [
  { name: "Glass Overlay", value: "0.35 opacity for subtle tint" },
  { name: "Focus Bubble", value: "Blur on to isolate work area" },
  { name: "Edge Dock", value: "Remember last AI cube location" },
];

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [canvasOpacity, setCanvasOpacityState] = useState<number>(
    DEFAULT_SETTINGS.canvasOpacity,
  );
  const [isBlurEnabled, setBlurEnabledState] = useState<boolean>(
    DEFAULT_SETTINGS.isBlurEnabled,
  );
  const [cubeOpacity, setCubeOpacityState] = useState<number>(DEFAULT_SETTINGS.cubeOpacity);
  const [cubeColor, setCubeColorState] = useState<string>(DEFAULT_SETTINGS.cubeColor);
  const [cubeTextColor, setCubeTextColorState] = useState<string>(DEFAULT_SETTINGS.cubeTextColor);
  const [cubeSize, setCubeSizeState] = useState<number>(DEFAULT_SETTINGS.cubeSize);
  const [cubeFontSize, setCubeFontSizeState] = useState<number>(
    DEFAULT_SETTINGS.cubeFontSize,
  );
  const [gridOpacity, setGridOpacityState] = useState<number>(DEFAULT_SETTINGS.gridOpacity);
  const [gridBlur, setGridBlurState] = useState<boolean>(DEFAULT_SETTINGS.gridBlur);

  const setCanvasOpacity = useCallback((value: number) => {
    // Clamp to a sensible range so plugins cannot make the window unreadable.
    const nextValue = Math.min(1, Math.max(0, value));
    setCanvasOpacityState(nextValue);
  }, []);

  const setBlurEnabled = useCallback((value: boolean) => {
    setBlurEnabledState(value);
  }, []);

  const setCubeOpacity = useCallback((value: number) => {
    const nextValue = Math.min(1, Math.max(0.1, value));
    setCubeOpacityState(nextValue);
  }, []);

  const setCubeColor = useCallback((value: string) => {
    // Basic HEX validation; fall back to previous color if invalid.
    const isHex = /^#([0-9a-fA-F]{6})$/.test(value);
    if (isHex) {
      setCubeColorState(value);
    }
  }, []);

  const setCubeTextColor = useCallback((value: string) => {
    const isHex = /^#([0-9a-fA-F]{6})$/.test(value);
    if (isHex) {
      setCubeTextColorState(value);
    }
  }, []);

  const setCubeSize = useCallback((value: number) => {
    // Allow user customization within sensible desktop bounds.
    const nextValue = Math.min(120, Math.max(40, value));
    setCubeSizeState(nextValue);
  }, []);

  const setCubeFontSize = useCallback((value: number) => {
    const nextValue = Math.min(60, Math.max(12, value));
    setCubeFontSizeState(nextValue);
  }, []);

  const setGridOpacity = useCallback((value: number) => {
    const nextValue = Math.min(1, Math.max(0.1, value));
    setGridOpacityState(nextValue);
  }, []);

  const setGridBlur = useCallback((value: boolean) => {
    setGridBlurState(value);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      canvasOpacity,
      isBlurEnabled,
      cubeOpacity,
      cubeColor,
      cubeTextColor,
      cubeSize,
      cubeFontSize,
      gridOpacity,
      gridBlur,
      setCanvasOpacity,
      setBlurEnabled,
      setCubeColor,
      setCubeTextColor,
      setCubeOpacity,
      setCubeSize,
      setCubeFontSize,
      setGridOpacity,
      setGridBlur,
    }),
    [
      canvasOpacity,
      cubeFontSize,
      cubeColor,
      cubeTextColor,
      cubeOpacity,
      cubeSize,
      gridBlur,
      gridOpacity,
      isBlurEnabled,
      setBlurEnabled,
      setCanvasOpacity,
      setCubeFontSize,
      setCubeColor,
      setCubeTextColor,
      setCubeOpacity,
      setCubeSize,
      setGridBlur,
      setGridOpacity,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);

  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return ctx;
}
