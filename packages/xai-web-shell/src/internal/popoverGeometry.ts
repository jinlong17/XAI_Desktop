/**
 * @internal — railPos → popover anchor mapping.
 *
 * Maps the 4 rail positions to their data-anchor strings per DESIGN.md §4.14.
 * Extracted here so both AvatarMenu.tsx and tests can import the same pure function.
 */

import type { RailPos } from "../types.js";

/**
 * Returns the data-anchor attribute value for the AvatarMenu popover based
 * on the current rail position.
 *
 * DESIGN.md §4.14 direction rules:
 *   left   → top-right  (左轨 → 右上展开)
 *   right  → top-left   (右轨 → 左上展开)
 *   top    → bottom-left (顶轨 → 左下展开)
 *   bottom → top-left   (底轨 → 左上展开)
 */
export function getPopoverAnchor(pos: RailPos): string {
  switch (pos) {
    case "left":   return "left-top-right";
    case "right":  return "right-top-left";
    case "top":    return "top-bottom-left";
    case "bottom": return "bottom-top-left";
    default:       return "left-top-right";
  }
}
