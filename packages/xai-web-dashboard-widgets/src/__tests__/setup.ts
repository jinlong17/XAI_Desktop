/**
 * Vitest setup — @repo/plugin-web-dashboard-widgets.
 *
 * Re-uses the same minimal jsdom polyfill surface as row #10. Widgets in this
 * row do not handle pointer events directly (drag is owned by row #10), so
 * we keep this lean.
 */
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  // Reset persisted prefs between tests so order doesn't leak.
  try {
    localStorage.clear();
  } catch {
    /* jsdom edge: nothing to do */
  }
});
