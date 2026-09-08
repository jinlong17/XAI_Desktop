/**
 * @internal — scenes.ts
 *
 * Source: web design/i18n.js:629–635 (MOCK.meditationScenes).
 * All gradient + accent values verbatim from the prototype; already in oklch.
 * Per frozen assumption 6 (docs/design.md §1) and AC-TOKENS-1 / AC-TOKENS-2
 * (docs/test.md §2.7) — no hex literals; all colors are oklch or via
 * other token-compliant CSS functions.
 */

import type { BaseSceneId, CustomScene, Scene } from "../types.js";

/** All 5 scenes in the order they appear in the scene picker. */
export const SCENES: readonly Scene[] = [
  {
    id: "forest",
    grad: "linear-gradient(160deg, oklch(45% 0.07 145), oklch(20% 0.04 145))",
    accent: "oklch(82% 0.10 145)",
    animation: "particles",
    defaultSound: "forest",
  },
  {
    id: "ocean",
    grad: "linear-gradient(160deg, oklch(50% 0.10 230), oklch(22% 0.06 230))",
    accent: "oklch(85% 0.10 220)",
    animation: "waves",
    defaultSound: "waves",
  },
  {
    id: "night",
    grad: "linear-gradient(160deg, oklch(28% 0.05 280), oklch(12% 0.04 260))",
    accent: "oklch(85% 0.08 280)",
    animation: "aurora",
    defaultSound: "whiteNoise",
  },
  {
    id: "rain",
    grad: "linear-gradient(160deg, oklch(40% 0.04 240), oklch(18% 0.02 240))",
    accent: "oklch(80% 0.06 240)",
    animation: "rain",
    defaultSound: "rain",
  },
  {
    id: "void",
    grad: "linear-gradient(160deg, oklch(18% 0.01 220), oklch(8% 0.01 220))",
    accent: "oklch(90% 0.005 220)",
    animation: "still",
    defaultSound: "whiteNoise",
  },
];

/** Fixed particle count — hardcoded per docs/dev_log.md Q11 resolution. */
export const PARTICLE_COUNT = 18 as const;

export const BASE_SCENE_IDS = SCENES.map((scene) => scene.id) as readonly BaseSceneId[];

export function sceneFromCustom(custom: CustomScene): Scene {
  return {
    id: custom.id,
    name: custom.name,
    grad: `radial-gradient(circle at 28% 18%, ${custom.gradientFrom}, transparent 46%), linear-gradient(160deg, ${custom.background}, ${custom.gradientTo})`,
    accent: custom.clockColors.highlight,
    animation: custom.animation,
    defaultSound: custom.sound,
    defaultClock: custom.clock,
    defaultClockScale: custom.clockScale,
    defaultClockColors: custom.clockColors,
    defaultDurationMode: custom.durationMode,
    defaultDuration: custom.duration,
    defaultCustomDuration: custom.customDuration,
  };
}
