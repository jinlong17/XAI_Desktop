/**
 * Named timing constants for DesktopPet behaviour.
 *
 * Port of timings inlined in web design/pet.jsx:
 *   - Tip rotation cycle: 12 000 ms
 *   - First-tip dismiss: 5 500 ms
 *   - Bubble regrow delay: 400 ms
 *   - Happy mood duration: 1 600 ms
 *
 * Layout / clamp constants:
 *   - EDGE_GUARD_PX: minimum pixel distance from viewport edge
 *   - PET_BODY_PX: visual width/height of the pet body div (84 px + padding)
 *   - BUBBLE_GUARD_PX: threshold for bubble side-flip (pos.x > w - this)
 */

/** Interval between tip-bubble cycles (ms). */
export const TIP_CYCLE_MS = 12_000;

/** Delay before the very first tip bubble auto-dismisses (ms). */
export const TIP_FIRST_DISMISS_MS = 5_500;

/** Delay between hiding the old tip and showing the next one (ms). */
export const TIP_REGROW_MS = 400;

/** Duration of the happy mood after a click (ms). */
export const HAPPY_DURATION_MS = 1_600;

/** Minimum pixel distance to keep from any viewport edge. */
export const EDGE_GUARD_PX = 8;

/**
 * Effective "size" of the pet body used in the upper-bound clamp.
 * The prototype uses `w - 96`; we decompose it as PET_BODY_PX + EDGE_GUARD_PX
 * so the clamp formula reads:
 *   max(EDGE_GUARD_PX, min(w - PET_BODY_PX - EDGE_GUARD_PX, x))
 * which equals the prototype's `min(w - 96, x)` when EDGE_GUARD_PX = 8.
 */
export const PET_BODY_PX = 84;

/**
 * Threshold (from right edge) at which the tip bubble flips to the left.
 *   if (pos.x > window.innerWidth - BUBBLE_GUARD_PX) → bubble-left
 */
export const BUBBLE_GUARD_PX = 280;
