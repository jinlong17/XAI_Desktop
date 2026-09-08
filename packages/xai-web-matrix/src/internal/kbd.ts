/**
 * @internal — kbd.ts
 * Keyboard a11y fallback: maps a Ctrl/Cmd + Arrow keydown to a target Quadrant.
 *
 * Mapping (design.md §6.3):
 *   ArrowLeft:  Q2→Q1, Q1→Q2(wrap), Q4→Q3, Q3→Q4(wrap)
 *   ArrowRight: mirror
 *   ArrowUp:    Q3→Q1, Q4→Q2, Q1→Q3(wrap), Q2→Q4(wrap)
 *   ArrowDown:  mirror
 *
 * Modifier requirement: Ctrl or Cmd (metaKey) must be held.
 * Plain ArrowKeys do NOT trigger a move (avoids text-input collision).
 */

import type { Quadrant } from "../types.js";

/** Grid layout for wrap-around mapping:
 *   Q1 | Q2
 *   Q3 | Q4
 */
const GRID: [Quadrant, Quadrant, Quadrant, Quadrant] = ["q1", "q2", "q3", "q4"];

function gridPos(q: Quadrant): { row: number; col: number } {
  switch (q) {
    case "q1": return { row: 0, col: 0 };
    case "q2": return { row: 0, col: 1 };
    case "q3": return { row: 1, col: 0 };
    case "q4": return { row: 1, col: 1 };
  }
}

function fromGridPos(row: number, col: number): Quadrant {
  // GRID has exactly 4 entries; row ∈ {0,1} and col ∈ {0,1} so index is always 0-3
  return GRID[row * 2 + col] as Quadrant;
}

/**
 * Handles a keyboard event on a focused card.
 *
 * @param e   The keyboard event.
 * @param from  The quadrant the focused card is currently in.
 * @returns The target Quadrant to move to, or null if the event is not a
 *          handled Ctrl/Cmd+Arrow combination.
 */
export function handleKbdMove(
  e: KeyboardEvent | React.KeyboardEvent<HTMLElement>,
  from: Quadrant,
): Quadrant | null {
  // Modifier requirement: must hold Ctrl or Cmd (metaKey)
  if (!e.ctrlKey && !e.metaKey) return null;

  const { row, col } = gridPos(from);
  let targetRow = row;
  let targetCol = col;

  switch (e.key) {
    case "ArrowLeft":
      targetCol = col === 0 ? 1 : 0; // wrap
      break;
    case "ArrowRight":
      targetCol = col === 1 ? 0 : 1; // wrap
      break;
    case "ArrowUp":
      targetRow = row === 0 ? 1 : 0; // wrap
      break;
    case "ArrowDown":
      targetRow = row === 1 ? 0 : 1; // wrap
      break;
    default:
      return null;
  }

  const target = fromGridPos(targetRow, targetCol);
  if (target === from) return null; // no-op (shouldn't happen with 2x2)
  return target;
}

// Import React type for the overloaded signature
import type React from "react";
