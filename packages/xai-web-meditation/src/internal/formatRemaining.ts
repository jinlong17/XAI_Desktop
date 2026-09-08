/**
 * @internal — formatRemaining.ts
 *
 * Format a seconds-remaining number as a `mm:ss` pair of zero-padded
 * strings. Negative inputs clamp to 00:00.
 *
 * Used by MeditationPlayer's countdown text. Pure function.
 */

export function formatRemaining(remainingSec: number): { mm: string; ss: string } {
  const safe = Math.max(0, Math.floor(remainingSec));
  return {
    mm: String(Math.floor(safe / 60)).padStart(2, "0"),
    ss: String(safe % 60).padStart(2, "0"),
  };
}
