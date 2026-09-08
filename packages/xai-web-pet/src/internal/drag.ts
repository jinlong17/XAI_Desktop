/**
 * drag.ts — Pure clamp helper for pet position.
 *
 * clampPos() ensures the pet stays within visible viewport bounds.
 * No React. Tested in isolation.
 *
 * Clamp math (mirrors prototype pet.jsx lines 241-243):
 *   x: max(EDGE_GUARD_PX, min(w - PET_BODY_PX - EDGE_GUARD_PX, x))
 *   y: max(EDGE_GUARD_PX, min(h - PET_BODY_PX - EDGE_GUARD_PX, y))
 *
 * With EDGE_GUARD_PX=8 and PET_BODY_PX=84, upper bound = w - 92.
 * The prototype uses `w - 96` which equals `w - 84 - 12` — we use
 * `w - 84 - 8 = w - 92` (slightly more conservative) as documented in api.md §3.2.
 */

import type { PetPos } from "../types.js";
import { EDGE_GUARD_PX, PET_BODY_PX } from "./timing.js";

export interface Viewport {
  w: number;
  h: number;
}

/**
 * Clamp a raw drag position to keep the pet inside the viewport.
 *
 * @param raw - The unclamped {x, y} coordinates from pointer events.
 * @param viewport - The current window inner dimensions.
 * @returns A new {x, y} clamped to the safe area.
 */
export function clampPos(raw: PetPos, viewport: Viewport): PetPos {
  const maxX = viewport.w - PET_BODY_PX - EDGE_GUARD_PX;
  const maxY = viewport.h - PET_BODY_PX - EDGE_GUARD_PX;
  return {
    x: Math.max(EDGE_GUARD_PX, Math.min(maxX, raw.x)),
    y: Math.max(EDGE_GUARD_PX, Math.min(maxY, raw.y)),
  };
}
