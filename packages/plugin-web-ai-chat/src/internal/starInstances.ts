/**
 * starInstances — pure 60-entry star generator for the .ai-stars layer.
 *
 * Deterministic; no entropy; frozen. Mirrors the artifact's
 * `Array.from({length:60}).map((_,i)=>…)` block verbatim.
 *
 * Design: packages/xai-web-ai-chat/docs/api.md §5.3
 */

export interface StarInstance {
  readonly left: string;              // "X%"  X = (i*53)%100
  readonly top: string;               // "Y%"  Y = (i*97)%100
  readonly animationDelay: string;    // "Ds"  D = (i%7) * 0.7
  readonly animationDuration: string; // "DDs" DD = 3 + (i%5)
  readonly opacity: number;           // 0.3 + (i%5) * 0.15
}

const STAR_COUNT = 60;

function computeStarInstances(): readonly StarInstance[] {
  const out: StarInstance[] = [];
  for (let i = 0; i < STAR_COUNT; i += 1) {
    const entry: StarInstance = Object.freeze({
      left: `${(i * 53) % 100}%`,
      top: `${(i * 97) % 100}%`,
      animationDelay: `${(i % 7) * 0.7}s`,
      animationDuration: `${3 + (i % 5)}s`,
      opacity: 0.3 + (i % 5) * 0.15,
    });
    out.push(entry);
  }
  return Object.freeze(out);
}

const INSTANCES = computeStarInstances();

export function getStarInstances(): readonly StarInstance[] {
  return INSTANCES;
}
