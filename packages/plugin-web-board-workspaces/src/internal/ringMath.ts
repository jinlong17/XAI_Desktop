/**
 * Pure ring-chart math for the PM Status Overview banner.
 *
 * - `computeRingSegments(lists, lang)` returns one segment per non-empty list,
 *   in the same order as `lists`. Each segment carries its label, count, and
 *   resolved CSS color.
 * - `computeDonePct(lists)` returns the % of cards belonging to the "Done"
 *   list (matched by `/done|完成/` on its bilingual customName).
 *
 * Both helpers are pure / referentially transparent — no `Date.now()`, no
 * `Math.random()`, no DOM access.
 */

import type { BoardListData, BoardListColorId } from "@repo/plugin-web-board-core";
import { LIST_COLOR_PALETTE } from "@repo/plugin-web-board-core";
import type { RingSegment } from "./types.js";

const ACCENT_FALLBACK = "var(--accent)";

/** Resolve a list's `color` id to a CSS color string, falling back to accent. */
function resolveListColor(colorId: BoardListColorId | null | undefined): string {
  if (!colorId) return ACCENT_FALLBACK;
  const entry = LIST_COLOR_PALETTE.find((e) => e.id === colorId);
  return entry ? entry.cssVar : ACCENT_FALLBACK;
}

/** Resolve a list's display label given the active language. */
function resolveListLabel(list: BoardListData, lang: "en" | "zh"): string {
  if (list.customName) {
    const v = list.customName[lang];
    if (typeof v === "string" && v.length > 0) return v;
  }
  if (list.key) return list.key;
  return "Untitled";
}

/**
 * Return ring segments for the PM Status Overview chart.
 *
 * Filters out empty lists (matches `module-board.jsx:1427` —
 * `lists.filter(l => l.cards.length > 0)`).
 */
export function computeRingSegments(
  lists: readonly BoardListData[],
  lang: "en" | "zh",
): RingSegment[] {
  const out: RingSegment[] = [];
  for (const list of lists) {
    if (list.cards.length === 0) continue;
    out.push({
      listId: list.id,
      label: resolveListLabel(list, lang),
      count: list.cards.length,
      color: resolveListColor(list.color),
    });
  }
  return out;
}

/**
 * Return the rounded % of cards in the "Done" list.
 *
 * The "Done" list is matched by `/done|完成/` on the concatenation of
 * `customName.en + " " + customName.zh` (matches `module-board.jsx:1424`).
 * Returns 0 when total === 0.
 */
export function computeDonePct(lists: readonly BoardListData[]): number {
  let total = 0;
  let done = 0;
  for (const list of lists) {
    total += list.cards.length;
    const en = list.customName?.en ?? "";
    const zh = list.customName?.zh ?? "";
    if (/done|完成/.test(en + " " + zh)) {
      done += list.cards.length;
    }
  }
  if (total === 0) return 0;
  return Math.round((100 * done) / total);
}
