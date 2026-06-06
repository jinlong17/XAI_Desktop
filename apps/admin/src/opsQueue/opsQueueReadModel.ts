/**
 * apps/admin/src/opsQueue/opsQueueReadModel.ts — severity-ranked ops-queue read model
 * (row #5, P3, Axis D / D2).
 *
 * Returns slice #1's `OpsQueueItem`s SEVERITY-RANKED (severity desc, then count desc),
 * each annotated with its derived `OpsSeverity`. Built ON slice #1's Overview read model
 * (`overviewAdapter.getOpsQueue()`) — it does NOT re-reach into fixtures and does NOT
 * rewrite or fork `OpsQueueItem` (additive: `RankedOpsQueueItem extends OpsQueueItem`).
 *
 * Boundary (design.md, W0): contract-only, browser-side; pure; no I/O, no secret.
 *
 * Test strategy: apps/admin/docs/audit-ops-queue/test.md §1
 * (TT-OPS-READMODEL-RANKED / TT-OPS-STABLE-SORT / TT-OPS-READMODEL-CONTRACT-SHAPE).
 */
import type { OpsQueueItem } from "../adapters/types";
import { overviewAdapter } from "../adapters";
import { toSeverity, severityRank, type OpsSeverity } from "./severity";

/** Slice #1 `OpsQueueItem` + a derived severity. Additive — original shape preserved (no fork). */
export interface RankedOpsQueueItem extends OpsQueueItem {
  severity: OpsSeverity;
}

export interface OpsQueueReadModel {
  /** queues severity-ranked (severity desc, then count desc); deterministic + stable */
  ranked(): RankedOpsQueueItem[];
}

/**
 * Build a severity-ranked ops-queue read model.
 *
 * @param source the source ops queues. Defaults to slice #1's Overview read model
 *   (`overviewAdapter.getOpsQueue()`) so the read model composes the EXISTING seam rather
 *   than re-reaching into fixtures. Pass an explicit array in tests for determinism.
 *
 * `ranked()` is pure (operates on a COPY), deterministic, and STABLE (equal-severity-equal-
 * count items keep input order — `severityRank` returns 0 for them and the sort is stable),
 * and never drops/adds items (output length === input length).
 */
export function createOpsQueueReadModel(
  source?: OpsQueueItem[],
): OpsQueueReadModel {
  return {
    ranked(): RankedOpsQueueItem[] {
      const items = source ?? overviewAdapter.getOpsQueue();
      return items
        .slice() // never mutate the source
        .sort(severityRank)
        .map((item) => ({ ...item, severity: toSeverity(item) }));
    },
  };
}
