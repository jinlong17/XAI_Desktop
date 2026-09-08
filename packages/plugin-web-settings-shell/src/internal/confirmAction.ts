/**
 * @internal — confirmAction.ts
 * Thin wrapper over `window.confirm` so tests can stub the call.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §2.3
 */

export function confirmAction(message: string): boolean {
  if (typeof window === "undefined" || typeof window.confirm !== "function") {
    // SSR or non-browser env — default to false (no destructive action).
    return false;
  }
  return window.confirm(message);
}
