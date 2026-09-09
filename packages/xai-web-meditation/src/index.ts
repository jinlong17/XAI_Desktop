import "./internal/accountMigration.js";
/**
 * @repo/plugin-web-meditation — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/ directly.
 *
 * Side-effect CSS: applied once globally when this package is first imported.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 * Design: packages/xai-web-meditation/docs/design.md §1
 */

// Side-effect CSS import
import "./styles.css";

// ---- Components -------------------------------------------------------------
export { MeditationModule, default } from "./MeditationModule.js";

// ---- Slot registration (consumed by apps/web shellRegistrations.tsx) --------
export { meditationSlotRegistration } from "./registration.js";

// ---- Public types -----------------------------------------------------------
export type {
  BaseSceneId,
  CustomSceneId,
  SceneId,
  ClockVariant,
  ClockScale,
  ClockColorPalette,
  AmbientSoundId,
  PresetDuration,
  Duration,
  DurationMode,
  SceneAnimation,
  CustomScene,
  Scene,
  MeditationPrefs,
  MeditationModuleProps,
} from "./types.js";

// ---- Constants --------------------------------------------------------------
export { MEDITATION_STORAGE_KEY, PRESET_DURATIONS } from "./constants.js";
