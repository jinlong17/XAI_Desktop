/**
 * @repo/xai-web-shell — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 + §S6
 */

// Side-effect CSS — the rail-order status styles (CP-APPRAIL-01), scoped to
// selectors that begin with .rail-order-status.
import "./railOrderStatus.css";

// ---- Components (added incrementally per phase) ----------------------------
export { Topbar }           from "./Topbar.js";
export { AppRail }          from "./AppRail.js";
export { AvatarMenu }       from "./AvatarMenu.js";
export { Shell }            from "./Shell.js";
export { SignOutConfirmDialog } from "./SignOutConfirmDialog.js";

// ---- Registry (provider + hooks) -------------------------------------------
export { WebShellProvider } from "./registry.js";
export { useWebShell }      from "./registry.js";
export { useWebModuleRegistry } from "./registry.js";

// ---- Types -----------------------------------------------------------------
export type {
  WebModuleSlotRegistration,
  WebShellProviderProps,
  ShellProps,
  AppRailProps,
  TopbarProps,
  AvatarMenuProps,
  WebShellIconName,
} from "./types.js";
export type { SignOutConfirmDialogProps } from "./SignOutConfirmDialog.js";

// ---- App-scoped rail-order controller (CP-APPRAIL-01) ----------------------
// App creates the controller once with useRailOrderController() and provides
// it with <RailOrderProvider>; <AppRail> and <RailOrderStatus> are its views.
export { RailOrderProvider, useRailOrderController } from "./internal/railOrderController.js";
export { RailOrderStatus } from "./internal/RailOrderStatus.js";
export type {
  RailOrderController,
  RailOrderControllerOptions,
  RailOrderProviderProps,
  RailOrderStatusKind,
  RailOrderStatusProps,
} from "./types.js";
