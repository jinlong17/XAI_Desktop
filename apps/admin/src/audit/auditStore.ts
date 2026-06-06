/**
 * apps/admin/src/audit/auditStore.ts — fixture-seeded admin audit chain (row #5, P4).
 *
 * Builds the canonical admin-local `AdminAuditChain` seeded from slice #1's `AUDIT` display
 * fixture via the pure inverse field-map (`auditRowToSeedInput`), then exposes it as a
 * chain-backed `AuditReadModel` for the Audit page (composed through `../adapters`, NOT
 * imported by the page directly — R-1). NO real audit store / DB / network this row (real
 * store = rows #3–#5); the chain lives in memory and projects deterministically.
 *
 * Boundary (design.md, W0): contract-only, browser-side; pure seed; no I/O, no secret.
 *
 * Test strategy: apps/admin/docs/audit-ops-queue/test.md §1
 * (TT-AUDIT-READ-PROJECTION / TT-AUDIT-READ-VERIFY).
 */
import type { AuditReadModel, AuditFilter, AuditRow } from "../adapters/types";
import { AUDIT } from "../fixtures";
import { AdminAuditChain } from "./hashChain";
import { auditRowToSeedInput } from "./auditEvent";
import { projectAudit, verifyAuditReadModel } from "./auditedMutation";

/**
 * Build an `AdminAuditChain` seeded from the `AUDIT` fixture (oldest-first append order so the
 * chain `seq` is monotonic; the fixture is listed newest-first, so we reverse before seeding).
 * Pure + deterministic (default deterministic digest; `time → tsMs` via `parseAuditTime`).
 */
export function buildSeededAuditChain(rows: readonly AuditRow[] = AUDIT): AdminAuditChain {
  const chain = new AdminAuditChain();
  // Fixture is newest-first; append oldest-first so seq increases with time.
  for (const row of [...rows].reverse()) {
    chain.append(auditRowToSeedInput(row));
  }
  return chain;
}

/** The single canonical fixture-seeded chain backing the Audit page read model. */
export const adminAuditChain: AdminAuditChain = buildSeededAuditChain();

/**
 * Chain-backed `AuditReadModel` (slice #1 contract, no fork): `query()` projects the seeded
 * chain to `AuditRow[]` (newest-first, AuditFilter-filtered) via `projectAudit`. Integrity-
 * verifiable through `verify()`.
 */
export const auditChainReadModel: AuditReadModel & {
  verify(): void;
} = {
  query: (filter?: AuditFilter): AuditRow[] => projectAudit(adminAuditChain, filter),
  verify: (): void => verifyAuditReadModel(adminAuditChain),
};
