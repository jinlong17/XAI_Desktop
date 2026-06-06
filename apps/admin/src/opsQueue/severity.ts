/**
 * apps/admin/src/opsQueue/severity.ts — ops-queue severity contract (row #5, P3, Axis D / D2).
 *
 * A typed `OpsSeverity` ordinal + a PURE, DETERMINISTIC tone(+count)→severity map + a total,
 * stable comparator. Severity is DERIVED from slice #1's existing `OpsQueueItem` fields
 * (`tone` + `count`) — NO production ops data is invented and NO fixture is rewritten
 * (ADR-lite #4). Real risky-login/ticket/billing aggregation = row #3.
 *
 * Boundary (design.md, W0): contract-only, browser-side; pure functions; no I/O, no secret;
 * additive over slice #1's UNCHANGED `OpsQueueItem`.
 *
 * Test strategy: apps/admin/docs/audit-ops-queue/test.md §1
 * (TT-OPS-SEVERITY-MAP / TT-OPS-SEVERITY-COVERS-ALL-QUEUES / TT-OPS-RANK-DETERMINISTIC).
 */
import type { OpsQueueItem, Tone } from "../adapters/types";

/** Severity ordinal — higher = more urgent. */
export type OpsSeverity = "critical" | "high" | "warning" | "info";

/** Total order over severities (critical > high > warning > info). */
export const SEVERITY_ORDER: Record<OpsSeverity, number> = {
  critical: 3,
  high: 2,
  warning: 1,
  info: 0,
};

/**
 * Count threshold at/above which a `danger`-tone queue escalates from `high` to `critical`.
 * PINNED here (TT-OPS-SEVERITY-MAP) so the map is deterministic. Chosen so the two prototype
 * `danger` queues split: risk (count 14) → critical; highcost (count 11) → high.
 */
export const DANGER_CRITICAL_THRESHOLD = 12;

/**
 * Base tone → severity (before the danger count-escalation). Pure, total over `Tone`.
 *   danger  → high   (escalates to critical at/above the threshold; see toSeverity)
 *   warning → warning
 *   info    → info
 *   muted   → info
 */
const TONE_BASE_SEVERITY: Record<Tone, OpsSeverity> = {
  danger: "high",
  warning: "warning",
  info: "info",
  muted: "info",
};

/**
 * Deterministic tone(+count)→severity map (no fixture rewrite). Pure + total.
 * `danger` with `count >= DANGER_CRITICAL_THRESHOLD` escalates to `critical`; otherwise the
 * base tone mapping applies.
 */
export function toSeverity(item: OpsQueueItem): OpsSeverity {
  const base = TONE_BASE_SEVERITY[item.tone];
  if (item.tone === "danger" && item.count >= DANGER_CRITICAL_THRESHOLD) {
    return "critical";
  }
  return base;
}

/**
 * Pure comparator: severity DESC, then count DESC. Total + consistent (antisymmetric;
 * equal-severity-equal-count → 0, so a stable sort preserves input order). This is what
 * disambiguates the prototype's tone collisions (danger×2, warning×2) by count.
 */
export function severityRank(a: OpsQueueItem, b: OpsQueueItem): number {
  const sa = SEVERITY_ORDER[toSeverity(a)];
  const sb = SEVERITY_ORDER[toSeverity(b)];
  if (sa !== sb) return sb - sa; // severity desc
  return b.count - a.count; // then count desc
}
