/**
 * @internal — keyboardCombo.ts
 *
 * Detects the Cmd+K (macOS) / Ctrl+K (other OS) keyboard shortcut.
 *
 * Returns false if:
 * - The event target is a focused <textarea> (users can type "K" in text areas).
 * - The event target has contentEditable === "true".
 * - Alt or Shift modifiers are held.
 * - The wrong modifier is used (Ctrl on Mac, Cmd on non-Mac).
 * - The key is not "k" or "K".
 *
 * api.md §10
 */

/**
 * Returns true iff the KeyboardEvent matches the Cmd+K / Ctrl+K combo for
 * the current platform, and the target is NOT a text input.
 */
export function matchesCmdK(e: KeyboardEvent): boolean {
  // Key check (case-insensitive)
  if (e.key !== "k" && e.key !== "K") {
    return false;
  }

  // Reject Alt or Shift modifiers
  if (e.altKey || e.shiftKey) {
    return false;
  }

  // Platform detection: macOS uses metaKey; others use ctrlKey
  const isMac =
    typeof navigator !== "undefined" &&
    (navigator.platform.startsWith("Mac") ||
      navigator.userAgent.includes("Mac"));

  if (isMac) {
    // Cmd+K: metaKey must be true, ctrlKey must be false
    if (!e.metaKey || e.ctrlKey) {
      return false;
    }
  } else {
    // Ctrl+K: ctrlKey must be true, metaKey must be false
    if (!e.ctrlKey || e.metaKey) {
      return false;
    }
  }

  // Reject if target is a textarea or contentEditable element
  const target = e.target as HTMLElement | null;
  if (target) {
    if (target.tagName === "TEXTAREA") {
      return false;
    }
    if (target.tagName === "INPUT") {
      return false;
    }
    if (target.contentEditable === "true") {
      return false;
    }
  }

  return true;
}
