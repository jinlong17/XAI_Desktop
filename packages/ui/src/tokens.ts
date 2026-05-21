export const colorTokens = {
  surfaceCanvas: "#f8fafc",
  surfaceGlass: "rgba(255, 255, 255, 0.82)",
  surfaceOverlay: "rgba(15, 23, 42, 0.9)",
  borderSubtle: "rgba(255, 255, 255, 0.12)",
  borderStrong: "rgba(17, 24, 39, 0.25)",
  textPrimary: "#0b1220",
  textSecondary: "#475569",
  textOnDark: "#f8fafc",
  accentPrimary: "#3b82f6",
  accentSuccess: "#10b981",
} as const;

export const spaceTokens = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radiusTokens = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const shadowTokens = {
  panel: "0 12px 32px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.08)",
  panelDragging:
    "0 16px 40px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
  overlay: "0 10px 30px rgba(0, 0, 0, 0.35)",
} as const;

export const motionTokens = {
  durationFastMs: 120,
  durationBaseMs: 160,
  durationSlowMs: 200,
  easingStandard: "ease",
  easingEmphasis: "cubic-bezier(0.2, 0.7, 0.2, 1)",
} as const;

export const typographyTokens = {
  fontFamilySans:
    "\"Space Grotesk\", \"SF Pro Display\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  fontSizeBodyPx: 14,
  fontSizeLabelPx: 13,
  fontWeightMedium: 500,
  fontWeightSemibold: 600,
  lineHeightBody: 1.5,
  letterSpacingTight: 0.2,
} as const;

export const designTokens = {
  color: colorTokens,
  space: spaceTokens,
  radius: radiusTokens,
  shadow: shadowTokens,
  motion: motionTokens,
  typography: typographyTokens,
} as const;
