/**
 * @internal — getScene.ts
 *
 * Resolves a SceneId to its Scene descriptor (id + grad + accent).
 * Returns the "ocean" scene as a safety net if the lookup misses —
 * impossible at runtime when `id` comes from a validated MeditationPrefs.
 */

import type { Scene, SceneId } from "../types.js";
import { SCENES } from "./scenes.js";

/** Resolve a SceneId → Scene. Falls back to "ocean" (SCENES[1]) on miss. */
export function getScene(id: SceneId): Scene {
  const found = SCENES.find((s) => s.id === id);
  if (!found) {
    // Safety net — should be unreachable at runtime since SceneId is a
    // literal union and the persisted blob is validated by validatePrefs.
    return SCENES[1]!;
  }
  return found;
}
