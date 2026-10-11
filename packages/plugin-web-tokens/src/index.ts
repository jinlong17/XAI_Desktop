// Side-effect CSS imports — applied once globally when this package is imported.
// Vite/Rollup will not tree-shake these because of "sideEffects" in package.json.
import "./tokens.css";
import "./layout.css";

// Types (added in P2)
export type { Lang, Theme, Density, BgTone, RailPos } from "./types.js";

// i18n (added in P2)
export { I18N, useI18n } from "./i18n.js";
export type { I18NBundle } from "./i18n.js";

// apply* DOM helpers (added in P2)
export {
  applyTheme,
  applyDensity,
  applyFontScale,
  applyAccentHue,
  applyBgTone,
  applyRailPos,
} from "./apply.js";

export { localDateKey, parseLocalDateKey, addLocalDays, startOfLocalDay, nextLocalDayStart } from "./localDate.js";
export { useLocalDayClock } from "./useLocalDayClock.js";
