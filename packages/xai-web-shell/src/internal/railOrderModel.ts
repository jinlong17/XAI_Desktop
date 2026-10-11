/**
 * @internal — the pure rail-order model (CP-APPRAIL-01).
 *
 * Pure functions only: no React, no storage, no DOM.
 *
 * - `isRailOrder` is the strict A5 domain of `xai_rail_order`: a JSON array
 *   whose every element is a string, with no string twice. `[]`, unknown ids,
 *   `settings` and empty strings are in-domain. Everything else is refused
 *   (never repaired).
 * - `displayRailOrder` is the unchanged display reconcile D(S, R) of contract
 *   §2: the ids of S that are visible, in S order, then the visible ids that S
 *   lacks, in R order.
 * - `mergeRailOrder` is the A2 index-slot merge that realizes the product
 *   owner's decision R-1: a drag reorders only the visible modules; every id
 *   that is not visible (Features-hidden, non-rail or unknown) keeps its stored
 *   index, so a re-enabled module returns to its previous place.
 *
 * Contract: docs/reviews/web-apprail-order-recovery-contract/contract.md r1,
 * R-1, A2 and A5.
 */

/** A5: a JSON array of strings in which no string occurs twice. */
export function isRailOrder(value: unknown): value is string[] {
  if (!Array.isArray(value)) return false;
  const seen = new Set<string>();
  for (let index = 0; index < value.length; index += 1) {
    const item: unknown = value[index];
    if (typeof item !== "string" || seen.has(item)) return false;
    seen.add(item);
  }
  return true;
}

/**
 * D(S, R): every id of `stored` that is in `visible`, in stored order, then
 * every id of `visible` that `stored` lacks, in `visible` order. Never throws
 * and never repeats an id.
 */
export function displayRailOrder(stored: readonly string[], visible: readonly string[]): string[] {
  const rail = new Set(visible);
  const shown: string[] = [];
  const seen = new Set<string>();
  for (const id of stored) {
    if (rail.has(id) && !seen.has(id)) {
      shown.push(id);
      seen.add(id);
    }
  }
  for (const id of visible) {
    if (!seen.has(id)) {
      shown.push(id);
      seen.add(id);
    }
  }
  return shown;
}

/** True when `candidate` holds exactly the ids of `base` (both without repeats), in any order. */
export function isRailPermutation(candidate: readonly string[], base: readonly string[]): boolean {
  if (candidate.length !== base.length) return false;
  const members = new Set(base);
  if (members.size !== base.length) return false;
  const seen = new Set<string>();
  for (const id of candidate) {
    if (!members.has(id) || seen.has(id)) return false;
    seen.add(id);
  }
  return true;
}

/** True when both orders hold the same ids at the same indices. */
export function sameRailOrder(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) if (left[index] !== right[index]) return false;
  return true;
}

/**
 * A2 index-slot merge S' = merge(S, R, P). Walk S from index 0: an element in
 * R is replaced by the next element of P; an element not in R stays where it
 * is. When the walk ends, append the remaining elements of P in order.
 *
 * Returns `null` (no merge, no write) when P is not a permutation of D(S, R)
 * or the stored order is outside the strict domain.
 *
 * Properties (contract A2): filter(S', R) = P (P1); every non-visible id keeps
 * its index (P2); S' is in-domain and its set is S ∪ R (P3); |S'| = |S| + |R \ S|
 * (P4); when every element of S is visible, S' = P (P6).
 */
export function mergeRailOrder(
  stored: readonly string[],
  visible: readonly string[],
  order: readonly string[],
): string[] | null {
  if (!isRailOrder(stored as unknown)) return null;
  if (!isRailPermutation(order, displayRailOrder(stored, visible))) return null;
  const rail = new Set(visible);
  const merged: string[] = [];
  let next = 0;
  for (const id of stored) {
    if (rail.has(id)) {
      merged.push(order[next]!);
      next += 1;
    } else {
      merged.push(id);
    }
  }
  while (next < order.length) {
    merged.push(order[next]!);
    next += 1;
  }
  return isRailOrder(merged) ? merged : null;
}
