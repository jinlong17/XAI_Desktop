/**
 * Pure ops for panel + inbox state.
 *
 * - `loadPanelsOrDefault` / `loadInboxOrDefault` narrow opaque registry values
 *   to the typed shapes at the consumer boundary.
 * - `togglePanelInvariant` is the SOLE writer that enforces the "at least one
 *   panel open" invariant.
 *
 * No side effects; no `Date.now()`; no `Math.random()`. Fully unit-testable.
 */

import type { BoardPanelStateShape, InboxCardShape } from "./types.js";
import { isBoardPanelState, isInboxCardArray } from "./guards.js";

/** Default panel state when no registry payload exists or it is malformed. */
export const DEFAULT_PANEL_STATE: BoardPanelStateShape = Object.freeze({
  inbox: false,
  planner: false,
  board: true,
}) as BoardPanelStateShape;

/** 3-item seed inbox — verbatim port of `module-board.jsx` lines 106..110. */
export const INBOX_SEED: readonly InboxCardShape[] = Object.freeze([
  {
    id: "ix1",
    text: { en: "Capture from email, Slack, and Teams", zh: "从邮件 / Slack / Teams 捕获" },
  },
  { id: "ix2", text: { en: "Dive into Trello basics", zh: "了解项目板基础" } },
  { id: "ix3", text: { en: "See it, send it, save it for later", zh: "看到了就发到收件箱" } },
]) as readonly InboxCardShape[];

/**
 * Narrow an unknown registry payload to a typed panel state.
 *
 * Accepts:
 *   - `[<object>]` (length-1 array — our canonical write shape)
 *   - `<object>` (bare object — for forward compat with prototype's legacy shape)
 *
 * Anything else (null / undefined / empty array / non-array / malformed object)
 * falls back to `DEFAULT_PANEL_STATE`. After narrowing, the multi-panel
 * invariant is enforced.
 */
export function loadPanelsOrDefault(raw: unknown): BoardPanelStateShape {
  let candidate: unknown = raw;
  if (Array.isArray(raw)) {
    if (raw.length === 0) return { ...DEFAULT_PANEL_STATE };
    candidate = raw[0];
  }
  if (!isBoardPanelState(candidate)) return { ...DEFAULT_PANEL_STATE };
  // Invariant: at least one panel open.
  if (!candidate.inbox && !candidate.planner && !candidate.board) {
    return { ...DEFAULT_PANEL_STATE };
  }
  return { inbox: candidate.inbox, planner: candidate.planner, board: candidate.board };
}

/**
 * Narrow an unknown registry payload to a typed inbox array.
 *
 * Returns the seed inbox on rejection.
 */
export function loadInboxOrDefault(raw: unknown): InboxCardShape[] {
  if (isInboxCardArray(raw)) {
    // Already typed; copy the array but preserve item references so React's
    // shallow equality reuses keys.
    return raw.slice();
  }
  // Fall back to seed — deep-copy each item so callers can mutate freely.
  return INBOX_SEED.map((item) => ({ id: item.id, text: { en: item.text.en, zh: item.text.zh } }));
}

/**
 * Toggle one panel, then enforce the "at least one open" invariant.
 *
 * If the toggle would zero-out all three, force `board: true` (matches
 * `module-board.jsx:98`).
 */
export function togglePanelInvariant(
  prev: BoardPanelStateShape,
  key: keyof BoardPanelStateShape,
): BoardPanelStateShape {
  const next: BoardPanelStateShape = {
    inbox: key === "inbox" ? !prev.inbox : prev.inbox,
    planner: key === "planner" ? !prev.planner : prev.planner,
    board: key === "board" ? !prev.board : prev.board,
  };
  if (!next.inbox && !next.planner && !next.board) {
    return { inbox: false, planner: false, board: true };
  }
  return next;
}

/** True iff the panel state has exactly one panel open. Used to pick layout class. */
export function isSinglePanelOpen(panels: BoardPanelStateShape): boolean {
  const n = (panels.inbox ? 1 : 0) + (panels.planner ? 1 : 0) + (panels.board ? 1 : 0);
  return n === 1;
}
