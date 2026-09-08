/**
 * @internal — getScene.ts
 *
 * Resolves a SceneId to its Scene descriptor (id + grad + accent).
 * Returns the "ocean" scene as a safety net if the lookup misses —
 * impossible at runtime when `id` comes from a validated MeditationPrefs.
 */

import type { CustomScene, Scene, SceneId } from "../types.js";
import { SCENES, sceneFromCustom } from "./scenes.js";

/** Resolve a SceneId → Scene. Falls back to "ocean" (SCENES[1]) on miss. */
export function getScene(id: SceneId, customScenes: readonly CustomScene[] = []): Scene {
  if (id.startsWith("custom:")) {
    const custom = customScenes.find((scene) => scene.id === id);
    if (custom) return sceneFromCustom(custom);
  }
  const found = SCENES.find((s) => s.id === id);
  if (!found) {
    return SCENES[1]!;
  }
  return found;
}
