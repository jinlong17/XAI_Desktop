/**
 * @repo/plugin-web-countdown — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/.
 *
 * API contract: packages/xai-web-countdown/docs/api.md §0
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 */

// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// ---- Components ------------------------------------------------------------
export { CountdownModule } from "./CountdownModule.js";

// ---- Slot registration (consumed by apps/web shellRegistrations.tsx) -------
export { countdownWebModuleRegistration } from "./registration.js";

// ---- Public types ----------------------------------------------------------
export type {
  CountdownCard,
  CountdownVariant,
  ImagePresetId,
  ImagePreset,
} from "./types.js";

// ---- Constants -------------------------------------------------------------
export { IMAGE_PRESETS } from "./internal/presets.js";
