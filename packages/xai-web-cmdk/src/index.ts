/**
 * @repo/xai-web-cmdk — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/* or src/adapters/* directly.
 *
 * API contract: packages/xai-web-cmdk/docs/api.md §0
 * Design snapshot: packages/xai-web-cmdk/docs/design.md
 * Roadmap row: gap-closure row #3 (xai-web-cmdk-search)
 */

// ---- Side effects ----------------------------------------------------------
// CSS import (sideEffect — triggers once on first import of this barrel)
import "./styles.css";

// ---- Components ------------------------------------------------------------
export { CommandPalette } from "./CommandPalette.js";
export { CommandPaletteProvider } from "./CommandPaletteProvider.js";
export { PaletteInput } from "./PaletteInput.js";
export { PaletteList } from "./PaletteList.js";
export { PaletteResultRow } from "./PaletteResultRow.js";

// ---- Hook ------------------------------------------------------------------
export { useCommandPalette } from "./registration.js";

// ---- Adapter registration --------------------------------------------------
export { registerSearchAdapter } from "./internal/registry.js";

// ---- Test helpers ----------------------------------------------------------
export {
  getRegisteredAdapters,
  __resetCmdkRegistry,
} from "./internal/registry.js";

// ---- Pure helpers (also re-exported for sibling-package tests) -------------
export { escapeHtml } from "./internal/escapeHtml.js";
export { highlightMatch } from "./internal/highlightMatch.js";

// ---- Types -----------------------------------------------------------------
export type {
  SearchHit,
  SearchHitKind,
  ModuleSearchAdapter,
  UseCommandPalette,
  CommandPaletteProps,
  CommandPaletteProviderProps,
} from "./types.js";
