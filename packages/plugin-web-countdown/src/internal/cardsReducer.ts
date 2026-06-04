/**
 * @internal — cardsReducer.ts
 *
 * Pure functions for mutating CountdownCard arrays.
 * None of these functions perform storage IO — callers pass the prev array
 * and receive a new array.
 *
 * API contract: packages/xai-web-countdown/docs/api.md §5.2–5.3
 */

import type { CountdownCard } from "../types.js";
import { bumpPastDateForward, todayDateString } from "./countdownMath.js";

// --------------------------------------------------------------------------
// ID generation
// --------------------------------------------------------------------------

/**
 * Generate a new card id of the form "cd_<8-char base36>".
 * Collision probability is negligible at human-scale card counts.
 */
export function newCardId(): string {
  return "cd_" + Math.floor(Math.random() * 36 ** 8).toString(36).padStart(8, "0");
}

// --------------------------------------------------------------------------
// Mutation functions — all pure, return new arrays
// --------------------------------------------------------------------------

/**
 * Append a new card (auto-generated id) to the array.
 *
 * If the generated id collides with an existing card, re-rolls once.
 * (Double-collision probability is astronomically low.)
 */
export function addCard(
  prev: CountdownCard[],
  draft: Omit<CountdownCard, "id">,
): CountdownCard[] {
  let id = newCardId();
  if (prev.some((c) => c.id === id)) {
    id = newCardId();
  }
  const stamp = new Date().toISOString();
  return [...prev, { ...draft, id, created_at: draft.created_at ?? stamp, updated_at: stamp }];
}

/**
 * Replace fields on the card with the matching id.
 * If `id` is not found, returns the same array reference (no-op).
 */
export function updateCard(
  prev: CountdownCard[],
  id: string,
  patch: Partial<Omit<CountdownCard, "id">>,
): CountdownCard[] {
  const idx = prev.findIndex((c) => c.id === id);
  if (idx === -1) return prev;
  const updated = [...prev];
  const existing = prev[idx];
  if (!existing) return prev;
  updated[idx] = { ...existing, ...patch, updated_at: new Date().toISOString() };
  return updated;
}

/**
 * Soft-delete the card with the matching id so history can display it.
 * If `id` is not found, returns the same array reference (no-op).
 */
export function deleteCard(prev: CountdownCard[], id: string): CountdownCard[] {
  const idx = prev.findIndex((c) => c.id === id);
  if (idx === -1) return prev;
  const stamp = new Date().toISOString();
  const updated = [...prev];
  const existing = prev[idx];
  if (!existing) return prev;
  updated[idx] = {
    ...existing,
    status: "deleted",
    is_hidden: true,
    deleted_at: stamp,
    updated_at: stamp,
  };
  return updated;
}

export function hideCard(prev: CountdownCard[], id: string, hidden = true): CountdownCard[] {
  return updateCard(prev, id, { is_hidden: hidden });
}

export function pinCard(prev: CountdownCard[], id: string, pinned: boolean): CountdownCard[] {
  return updateCard(prev, id, { is_pinned: pinned });
}

export function duplicateCard(prev: CountdownCard[], id: string): CountdownCard[] {
  const card = prev.find((item) => item.id === id);
  if (!card) return prev;
  const stamp = new Date().toISOString();
  return addCard(prev, {
    ...card,
    title: {
      en: card.title.en ? `${card.title.en} Copy` : "Countdown Copy",
      zh: card.title.zh ? `${card.title.zh} 副本` : "倒计时副本",
    },
    status: "active",
    is_hidden: false,
    is_pinned: false,
    source: "custom",
    preset_id: null,
    created_at: stamp,
    updated_at: stamp,
    deleted_at: null,
  });
}

export function restoreCard(prev: CountdownCard[], id: string, now = new Date()): CountdownCard[] {
  const card = prev.find((item) => item.id === id);
  if (!card) return prev;
  const target = new Date(`${card.target_date}T${card.target_time ?? "00:00"}:00`);
  const target_date = Number.isFinite(target.getTime()) && target.getTime() < now.getTime()
    ? bumpPastDateForward(card.target_date, now)
    : card.target_date;
  return updateCard(prev, id, {
    target_date,
    start_date: todayDateString(now),
    status: "active",
    is_hidden: false,
    deleted_at: null,
  });
}
