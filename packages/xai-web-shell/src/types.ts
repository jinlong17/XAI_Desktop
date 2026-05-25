/**
 * @repo/xai-web-shell — type definitions.
 *
 * Public types re-exported from index.ts. Internal consumers may import
 * directly from this file; external consumers MUST use index.ts.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 */

import type { ConsoleModuleId, WebModuleRouteRegistration } from "@repo/core/types";

// ---- Re-exports from upstream packages for internal use ----
export type { Lang, Theme, Density, BgTone, RailPos } from "@repo/plugin-web-tokens";

// ---- WebShellIconName -------------------------------------------------------

/**
 * All icon glyph names supported by src/icons.tsx.
 * Add entries here when adding new icons to icons.tsx.
 */
export type WebShellIconName =
  | "sparkle"    // ai
  | "check"      // tasks
  | "kanban"     // board
  | "layout"     // dashboard
  | "calendar"   // calendar
  | "grid4"      // matrix
  | "timer"      // pomodoro
  | "pin"        // habits
  | "leaf"       // meditation
  | "countdown"  // countdown
  | "search"     // search
  | "chart"      // statistics
  | "sliders"    // settings
  | "paw"        // pet (rail bottom)
  | "sync"
  | "bell"
  | "help"
  | "sun"
  | "moon"
  | "monitor"
  | "star"
  | "download";

// ---- WebModuleSlotRegistration ----------------------------------------------

/**
 * A single module slot — the contract every W2 module satisfies in order to
 * appear in the AppRail and be routed by the host.
 *
 * Extends WebModuleRouteRegistration additively with shell-specific display +
 * ordering fields.
 *
 * Owner of the type: @repo/xai-web-shell (this package).
 * Owner of the concrete array: apps/web/src/routes/modules/registrations.tsx.
 */
export interface WebModuleSlotRegistration extends WebModuleRouteRegistration {
  /** Icon glyph name (matches src/icons.tsx). */
  icon: WebShellIconName;
  /** Rail order — lower numbers render first. Ties resolved by id alphabetical. */
  railOrder: number;
  /** i18n key used for the tooltip + AvatarMenu label. Format: "nav.<id>". */
  i18nKey: string;
  /** Visible in the rail? Settings is hidden (reachable via Topbar / Avatar). */
  showInRail: boolean;
}

// ---- Component prop types ---------------------------------------------------

import type { ReactNode } from "react";
import type { Lang, Theme, Density, RailPos } from "@repo/plugin-web-tokens";

export interface WebShellProviderProps {
  /** Full list of registered modules. Order is preserved here; AppRail sorts by railOrder. */
  modules: WebModuleSlotRegistration[];
  /** Active language — drives useI18n inside the shell. */
  lang: Lang;
  /** Active rail position — drives AppRail data-pos + AvatarMenu popover anchor. */
  railPos: RailPos;
  /** Pet toggle state — bound to the rail-bottom Pet button's active style. */
  petOn: boolean;
  /** Setter for petOn — invoked by the rail-bottom Pet button BEFORE the event emit. */
  setPetOn: (next: boolean) => void;
  children: ReactNode;
}

export interface ShellProps {
  /** Active language. */
  lang: Lang;
  setLang: (next: Lang) => void;
  /** Theme mode. */
  theme: Theme;
  setTheme: (next: Theme) => void;
  /** Density preset. */
  density: Density;
  setDensity: (next: Density) => void;
  /**
   * Optional callback wired by the host (apps/web/src/App.tsx) from
   * CommandPaletteProvider. When provided, Topbar renders a clickable button
   * instead of the readOnly search input (backwards-compatible — undefined
   * restores the original readOnly input).
   *
   * xai-web-cmdk gap-closure row #3 — P4 addition.
   */
  onOpenSearch?: () => void;
  /** Optional render-prop for the main pane — defaults to <Outlet/> from react-router. */
  children?: ReactNode;
}

export interface AppRailProps {
  /** Currently-active module id, used to highlight the matching button. */
  activeModuleId: ConsoleModuleId | null;
  /** Click handler — called with the module id BEFORE navigation. */
  onModuleClick: (moduleId: ConsoleModuleId) => void;
  /** Rail-bottom Pet click handler — called BEFORE the event emit. */
  onPetToggle: () => void;
  /**
   * Avatar-menu Settings shortcut handler.
   * Emits web:shell:module-change with source="shortcut" then navigates.
   * Kept separate from onModuleClick so the source enum is correct.
   */
  onAvatarOpenSettings: () => void;
  /**
   * Avatar-menu Statistics shortcut handler.
   * Emits web:shell:module-change with source="shortcut" then navigates.
   */
  onAvatarOpenStatistics: () => void;
}

export interface TopbarProps {
  lang: Lang;
  setLang: (next: Lang) => void;
  theme: Theme;
  setTheme: (next: Theme) => void;
  density: Density;
  setDensity: (next: Density) => void;
  /** Called when the Settings gear icon is clicked. Host emits + navigates. */
  onOpenSettings: () => void;
  /**
   * Optional callback from the command palette provider.
   * When provided: renders a clickable <button> instead of the readOnly input.
   * When absent: renders the original readOnly input (backwards-compatible).
   *
   * xai-web-cmdk gap-closure row #3 — P4 addition.
   */
  onOpenSearch?: () => void;
}

export interface AvatarMenuProps {
  /** Whether the menu popover is open. */
  open: boolean;
  /** Called when the scrim is clicked or Escape is pressed. */
  onClose: () => void;
  /** Settings entry handler — host emits + navigates. */
  onOpenSettings: () => void;
  /** Statistics entry handler — host emits + navigates. */
  onOpenStatistics: () => void;
  /** Sign-out handler — defaults to a placeholder warning in DEV. */
  onSignOut?: () => void;
}
