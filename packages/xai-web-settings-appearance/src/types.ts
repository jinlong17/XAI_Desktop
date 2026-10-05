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

// ---- App-scoped Appearance controller (CP-APPEARANCE-01) ---------------------
// Contract: docs/reviews/web-appearance-recovery-contract/contract.md r3 (A2–A7, §5–§8).

/** The seven Appearance fields, named by their `WebPreferenceChange` keys. */
export type AppearanceFieldId = "lang" | "theme" | "density" | "accentHue" | "bgTone" | "railPos" | "fontScale";

/**
 * Display values of the seven fields: the latest intent while a draft exists,
 * otherwise the strictly validated stored value, otherwise the default. These
 * are what the pane, the Topbar and `<html>` show and apply.
 */
export interface AppearanceValues {
  readonly lang: import("@repo/plugin-web-tokens").Lang;
  readonly theme: import("@repo/plugin-web-tokens").Theme;
  readonly density: import("@repo/plugin-web-tokens").Density;
  readonly accentHue: number;
  readonly bgTone: import("@repo/plugin-web-tokens").BgTone;
  readonly railPos: import("@repo/plugin-web-tokens").RailPos;
  readonly fontScale: number;
}

/**
 * One field's recovery state: `clean`, pending (`saving` / `resetting`),
 * settled unsuccessful (`not-saved` / `not-reset`) or source-only
 * (`unavailable`: invalid or unreadable stored bytes, Reload only).
 */
export type AppearanceFieldState = "clean" | "saving" | "resetting" | "not-saved" | "not-reset" | "unavailable";

/** The pane status line (A2.4), first matching rule wins; `none` renders empty. */
export type AppearanceStatusLine =
  | { readonly kind: "none" }
  | { readonly kind: "retrying" }
  | { readonly kind: "export-failed" }
  | { readonly kind: "not-saved"; readonly count: number }
  | { readonly kind: "saved" }
  | { readonly kind: "restored" };

/**
 * The single App-scoped Appearance controller. App creates it once (inside
 * `AccountStorageGate`) with `useAppearanceController()` and provides it with
 * `<AppearanceProvider>`; the Settings pane and the Topbar status are views of
 * it. A standalone `<AppearancePane lang>` without a provider owns its own.
 *
 * Every write goes through the accepted `usePrefAutosaveAsync` engine. There is
 * no Settings route guard and no `web:settings:preference-changed` emission.
 */
export interface AppearanceController {
  readonly values: AppearanceValues;
  readonly fieldStates: Readonly<Record<AppearanceFieldId, AppearanceFieldState>>;
  /** Actual current set or reset drafts exist (pending or unresolved). */
  readonly hasDraft: boolean;
  /** |E|: fields whose draft is settled unsuccessful (what Retry all retries). */
  readonly unsavedCount: number;
  /** Retry all is enabled if and only if E is non-empty (A2.2). */
  readonly retryAllEnabled: boolean;
  /** A Retry all pass has at least one attached, pending member. */
  readonly passOpen: boolean;
  readonly statusLine: AppearanceStatusLine;
  readonly setLang: (next: import("@repo/plugin-web-tokens").Lang) => void;
  readonly setTheme: (next: import("@repo/plugin-web-tokens").Theme) => void;
  readonly setDensity: (next: import("@repo/plugin-web-tokens").Density) => void;
  readonly setAccentHue: (next: number) => void;
  readonly setRailPos: (next: import("@repo/plugin-web-tokens").RailPos) => void;
  readonly setFontScale: (next: number) => void;
  /** A background choice: two intents, the tone then its hue as the accent. */
  readonly chooseBgTone: (tone: import("@repo/plugin-web-tokens").BgTone, hue: number) => void;
  readonly retry: (field: AppearanceFieldId) => void;
  readonly discard: (field: AppearanceFieldId) => void;
  readonly reload: (field: AppearanceFieldId) => void;
  readonly discardAll: () => void;
  /** One attempt per field in E, in display order; inert while E is empty. */
  readonly retryAll: () => void;
  /** Memory-only `appearance-draft.json` export of the current drafts. */
  readonly exportDraft: () => void;
  /** Asks `confirmReset` before any intent exists; declining touches nothing. */
  readonly resetToDefaults: (confirmReset: () => boolean) => void;
  /**
   * The sign-out step: resolves `true` without a prompt when no draft exists;
   * otherwise asks `window.confirm` once — Cancel resolves `false` and keeps
   * everything, OK discards every draft with zero writes and resolves `true`.
   */
  readonly confirmSignOut: () => Promise<boolean>;
  /** Registers a mounted pane (success lines are only claimed while one is mounted). */
  readonly attachPane: () => () => void;
}

/** Props of `<AppearanceProvider>`: provides an existing controller to its subtree. */
export interface AppearanceProviderProps {
  readonly controller: AppearanceController;
  readonly children?: import("react").ReactNode;
}

/** Props of the Topbar status (`<AppearanceStatus>`). */
export interface AppearanceStatusProps {
  /** Host callback: emits the shortcut module-change event and navigates to the pane. */
  readonly onReview: () => void;
}
