/**
 * @internal — defaults.ts
 * Compile-time default values for the 7 canonical WebPreferenceKey emits
 * issued by `resetAllPrefs()`.
 *
 * Four of the seven (theme/density/fontScale/lang) are NOT persisted via
 * `usePref` — they are `useState` in `apps/web/src/App.tsx`. The chassis
 * still emits them at reset so listeners that bridge to those `useState`
 * values can react. The other three (accentHue/railPos/bgTone) are
 * persisted via `usePref` and the registry holds their defaults; we
 * duplicate them here as a single source-of-truth table to keep the
 * emit set stable even if the registry shifts in a future row.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §5.1
 */

import type { WebPreferenceChange } from "@repo/core/types";

export const RESET_DEFAULTS: readonly WebPreferenceChange[] = [
  { key: "theme",      value: "light" },
  { key: "density",    value: "comfortable" },
  { key: "fontScale",  value: 1 },
  { key: "accentHue",  value: 165 },
  { key: "railPos",    value: "left" },
  { key: "bgTone",     value: "default" },
  { key: "lang",       value: "en" },
] as const;
