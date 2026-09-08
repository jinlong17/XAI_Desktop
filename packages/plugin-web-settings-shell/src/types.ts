/**
 * Public types for @repo/plugin-web-settings-shell.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §1
 * Design: packages/xai-web-settings-shell/docs/design.md
 */

import type * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { WebShellIconName } from "@repo/xai-web-shell";
import type { WebPreferenceChange } from "@repo/core/types";

// ---- SettingsPaneId ---------------------------------------------------------

/**
 * All 13 settings pane ids — order matches `web design/module-settings.jsx`
 * lines 27-50 and DESIGN.md §4.12.
 */
export type SettingsPaneId =
  | "account"
  | "premium"
  | "features"
  | "smart_lists"
  | "notifications"
  | "date_time"
  | "appearance"
  | "ai"
  | "more"
  | "integrations"
  | "collaborate"
  | "sticky"
  | "hotkeys"
  | "about";

// ---- Pane + PaneRenderProps -------------------------------------------------

export interface PaneRenderProps {
  /** Active language. */
  readonly lang: Lang;
}

export interface Pane {
  /** Stable id, used as React key + active-state selector. */
  readonly id: SettingsPaneId;
  /** Icon glyph for the sidebar entry. Must exist in @repo/xai-web-shell icons. */
  readonly icon: WebShellIconName;
  /** i18n dotted key for the sidebar label. Format: "settings.<id>" matching i18n.ts bundle. */
  readonly i18nKey: `settings.${string}`;
  /** Renders the right-side detail content for this pane. Sibling rows REPLACE this fn. */
  readonly render: (props: PaneRenderProps) => React.ReactElement;
}

// ---- SettingsModuleProps ----------------------------------------------------

export interface SettingsModuleProps {
  /** Active language — threaded down from `useWebShell().lang` by registration wrapper. */
  lang: Lang;
}

// ---- Atom props -------------------------------------------------------------

export interface ToggleProps {
  /** Current on/off state. */
  on: boolean;
  /** Click handler — fires synchronously, no event arg. */
  onChange: () => void;
  /** Optional aria-label override. */
  ariaLabel?: string;
}

export interface SettingRowProps {
  /** Visible label string (already i18n-resolved). */
  label: string;
  /** Optional description string under the label. */
  desc?: string;
  /** Control element rendered in the right slot. */
  children: React.ReactNode;
  /** Inline style override (passthrough — keeps source parity). */
  style?: React.CSSProperties;
}

export interface SectionBlockProps {
  /** Section children (typically a sequence of `<SettingRow>`). */
  children: React.ReactNode;
  /** Inline style override (passthrough — keeps source parity). */
  style?: React.CSSProperties;
}

export interface SettingsFooterProps {
  /**
   * Save handler. Returns the array of changes to broadcast. Empty array =
   * no event emitted but the "Saved" flash still shows (matches source UX).
   */
  onSave: () => WebPreferenceChange[];
  /**
   * Reset handler. Defaults to `resetAllPrefs()` if omitted. Override for
   * pane-scoped resets in future rows.
   */
  onReset?: () => void;
  /** Active language for bilingual button labels. */
  lang: Lang;
}
