/**
 * @repo/xai-web-shell — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 + §S6
 */

// ---- Components (added incrementally per phase) ----------------------------
export { Topbar }           from "./Topbar.js";
export { AppRail }          from "./AppRail.js";
export { AvatarMenu }       from "./AvatarMenu.js";
export { Shell }            from "./Shell.js";

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
