/**
 * Types for @repo/plugin-web-settings-appearance.
 *
 * API contract: packages/xai-web-settings-appearance/docs/api.md §1
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 */

export type { Lang, Theme, Density, BgTone, RailPos } from "@repo/plugin-web-tokens";

/** Pane props — frozen at { lang } per chassis PaneRenderProps. */
export interface AppearancePaneProps {
  readonly lang: import("@repo/plugin-web-tokens").Lang;
}

/** Display option for the Background palette row. 6 ids (tokens-side subset). */
export interface BgToneOption {
  readonly id: import("@repo/plugin-web-tokens").BgTone;
  readonly name: { readonly en: string; readonly zh: string };
  readonly hue: number;
}

/** Display option for the 6 hue-preset accent chips. */
export interface HuePreset {
  readonly id: string;
  readonly hue: number;
  readonly name: { readonly en: string; readonly zh: string };
}

/** Display option for the rail-position picker. */
export interface RailPosOption {
  readonly id: import("@repo/plugin-web-tokens").RailPos;
  readonly label: { readonly en: string; readonly zh: string };
}

/** Frozen reset defaults — parity-tested against chassis defaults.ts. */
export interface AppearanceDefaults {
  readonly theme: import("@repo/plugin-web-tokens").Theme;        // "light"
  readonly density: import("@repo/plugin-web-tokens").Density;    // "comfortable"
  readonly fontScale: number;                                       // 1
  readonly accentHue: number;                                       // 165
  readonly railPos: import("@repo/plugin-web-tokens").RailPos;     // "left"
  readonly bgTone: import("@repo/plugin-web-tokens").BgTone;       // "default"
  // lang intentionally omitted — per-pane Reset does NOT touch language.
}
