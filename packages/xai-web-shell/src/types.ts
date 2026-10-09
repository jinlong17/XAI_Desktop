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
  | "wallet"     // bookkeeping
  | "target"     // metric tracker
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
  /**
   * Optional premium tier badge node passed from the host to the Topbar.
   * The host (apps/web/src/App.tsx) imports <PremiumTierBadge> from
   * @repo/plugin-web-settings-rest and passes it here. This render-prop pattern
   * avoids the circular dependency:
   *   plugin-web-settings-rest → plugin-web-settings-shell → xai-web-shell
   *   (would cycle back to plugin-web-settings-rest if xai-web-shell imported it).
   *
   * Extension 2026-05-26 — Premium Stripe Checkout stub (gap-closure row #8 F1).
   */
  premiumBadge?: ReactNode;
  /**
   * Optional Appearance status node passed from the host to the Topbar, which
   * renders it immediately after `premiumBadge` in `.topbar-controls`. The
   * host (apps/web/src/App.tsx) passes the Appearance package's status
   * component; it renders nothing unless an Appearance change has a settled
   * failure. The shell never inspects it (same render-prop pattern as
   * `premiumBadge`, no package dependency on the Appearance pane).
   *
   * CP-APPEARANCE-01 — Topbar status for unsaved Appearance changes.
   */
  appearanceStatus?: ReactNode;
  /**
   * Optional rail-order status node passed from the host to the Topbar, which
   * renders it immediately after the `appearanceStatus` slot and before the
   * appearance popover. The host (apps/web/src/App.tsx) passes
   * `<RailOrderStatus />`, a view of its App-scoped rail-order controller; it
   * renders nothing unless the sidebar order has a settled unsaved change or
   * the stored order is unavailable. The shell only passes it through.
   *
   * CP-APPRAIL-01 — Topbar status for the sidebar (rail) order.
   */
  railOrderStatus?: ReactNode;
  /**
   * Optional sign-out handler wired from the host (apps/web/src/App.tsx).
   * When provided, AvatarMenu routes the Sign Out click to this handler
   * (which calls client.auth.signOut + clearSessionStorage + redirect).
   * When absent, AvatarMenu shows DEV-only console.warn (backward-compatible).
   *
   * Bugfix: Audit Top-10 #1 / Rail-10 — AvatarMenu Sign-out prop pipeline.
   */
  onSignOut?: () => void;
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
  /**
   * Optional sign-out handler passed from Shell (which receives it from App.tsx).
   * Forwarded to AvatarMenu — when provided, routes Sign Out click to the host handler.
   * When absent, AvatarMenu falls back to DEV-only console.warn (backward-compatible).
   *
   * Bugfix: Audit Top-10 #1 / Rail-10 — AvatarMenu Sign-out prop pipeline.
   */
  onSignOut?: () => void;
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
  /**
   * Optional premium tier badge node rendered at the left end of topbar-controls.
   * The host (apps/web) passes <PremiumTierBadge /> from @repo/plugin-web-settings-rest
   * to avoid a circular dependency (plugin-web-settings-rest → plugin-web-settings-shell
   * → xai-web-shell would create a cycle if xai-web-shell imported from the plugin).
   *
   * Extension 2026-05-26 — Premium Stripe Checkout stub (gap-closure row #8 F1).
   */
  premiumBadge?: ReactNode;
  /**
   * Optional Appearance status node, rendered immediately after `premiumBadge`
   * in `.topbar-controls` (before the appearance popover). The host passes the
   * Appearance package's status component, which renders nothing unless an
   * Appearance change has a settled failure.
   *
   * CP-APPEARANCE-01 — Topbar status for unsaved Appearance changes.
   */
  appearanceStatus?: ReactNode;
  /**
   * Optional rail-order status node, rendered immediately after the
   * `appearanceStatus` slot in `.topbar-controls` (before the appearance
   * popover). The host passes `<RailOrderStatus />`, which renders nothing
   * unless the sidebar order has a settled unsaved change or the stored order
   * is unavailable.
   *
   * CP-APPRAIL-01 — Topbar status for the sidebar (rail) order.
   */
  railOrderStatus?: ReactNode;
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

// ---- Rail order (CP-APPRAIL-01) ---------------------------------------------

/**
 * What the Topbar rail-order status shows, or `null` when it renders nothing:
 * - `"failed"`: the current draft is settled unsuccessful (Retry, Discard, Export);
 * - `"saving"`: a Retry of a draft that already failed is pending (Retry inert);
 * - `"source"`: no draft, and the stored order is invalid or unreadable (Reload only).
 */
export type RailOrderStatusKind = "failed" | "saving" | "source";

/**
 * The App-scoped rail-order controller. App creates exactly one inside
 * `AccountStorageGate` with `useRailOrderController()` and provides it with
 * `<RailOrderProvider>`; `<AppRail>` and `<RailOrderStatus>` are its views. An
 * `<AppRail>` rendered without a provider owns its own controller.
 *
 * It owns the strict `xai_rail_order` binding (registered `json` path, strict
 * domain: an array of distinct strings), the draft and operation model,
 * Retry, Discard, Reload, Export, the unload warning and the sign-out step.
 * Drafts live as long as the controller; they never hold navigation.
 */
export interface RailOrderController {
  /** The language of the controller's copy (App passes the Appearance display language). */
  readonly lang: Lang;
  /**
   * The stored order the rail displays from: the draft's value if a draft
   * exists, else the committed bytes, else `DEFAULT_RAIL_ORDER` (absent,
   * invalid or unreadable bytes). The rail shows D(order, visible).
   */
  readonly order: readonly string[];
  /** An actual draft exists (pending or unresolved). */
  readonly hasDraft: boolean;
  /** The Topbar status state, or `null` when the status renders nothing. */
  readonly statusKind: RailOrderStatusKind | null;
  /** Retry is runnable now (a draft is settled unsuccessful and nothing is in flight for it). */
  readonly canRetry: boolean;
  /** The last Export failed; shown while a draft exists, cleared by the next panel action. */
  readonly exportFailed: boolean;
  /**
   * Admits one drop: merges the dropped visible order into the stored order
   * (R-1 index-slot merge) and enqueues exactly one absolute set. Returns
   * `false` and makes zero attempts when the order is not a permutation of the
   * currently displayed ids.
   */
  readonly drop: (order: readonly string[], visible: readonly string[]) => boolean;
  /** Re-attempts the held failed request exactly once; inert while pending. */
  readonly retry: () => void;
  /** Detaches the draft before a safe reread; zero set or remove attempts. */
  readonly discard: () => void;
  /** Rereads an invalid or unreadable source; refused while a draft exists. */
  readonly reload: () => void;
  /** Memory-only export of the draft (`rail-order-draft.json`). */
  readonly exportDraft: () => void;
  /**
   * The sign-out step: `true` without a draft (no prompt); with a draft one
   * `window.confirm` — Cancel resolves `false` and keeps the draft, OK
   * discards it with zero writes and resolves `true`.
   */
  readonly confirmSignOut: () => Promise<boolean>;
}

export interface RailOrderControllerOptions {
  /** Display language of the controller's copy. */
  readonly lang: Lang;
}

export interface RailOrderProviderProps {
  readonly controller: RailOrderController;
  readonly children?: ReactNode;
}

/** `<RailOrderStatus />` takes no props; it reads the provided controller. */
export type RailOrderStatusProps = Record<string, never>;
