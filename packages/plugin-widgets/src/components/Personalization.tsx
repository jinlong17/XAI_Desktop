import type { CSSProperties } from "react";
import type { ThemeTokens, WidgetPreferences } from "../types";

export const defaultThemeTokens: ThemeTokens = {
  background: "rgba(255,255,255,0.82)",
  foreground: "#172033",
  muted: "#64748b",
  border: "rgba(15,23,42,0.16)",
  accent: "#2563eb",
  danger: "#dc2626",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  radius: "10px",
};

export function themeTokensToCss(tokens: ThemeTokens): CSSProperties {
  return {
    "--xai-widget-bg": tokens.background,
    "--xai-widget-fg": tokens.foreground,
    "--xai-widget-muted": tokens.muted,
    "--xai-widget-border": tokens.border,
    "--xai-widget-accent": tokens.accent,
    "--xai-widget-danger": tokens.danger,
    "--xai-widget-font": tokens.fontFamily,
    "--xai-widget-radius": tokens.radius,
  } as CSSProperties;
}

export function WallpaperAwareContrast({ preferences }: { preferences: WidgetPreferences }) {
  const message =
    preferences.wallpaperTone === "dark"
      ? "High contrast enabled for dark wallpaper tone"
      : preferences.wallpaperTone === "light"
        ? "Standard contrast enabled for light wallpaper tone"
        : "Mixed wallpaper tone uses elevated contrast";
  return <span style={{ color: "var(--xai-widget-muted)", fontSize: 12 }}>{message}</span>;
}
