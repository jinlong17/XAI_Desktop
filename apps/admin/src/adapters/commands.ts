/**
 * apps/admin/src/adapters/commands.ts — destructive command adapter (NO-OP).
 *
 * Slice #1 preserves the destructive UI affordances (type-to-confirm ConfirmModal)
 * but wires them to NO-OP mocks: every command resolves
 * `{ ok: true, noop: true, reason: "slice-1-mock-no-write" }` WITHOUT performing
 * any write, network call, or persistence (api.md §5, AC-4).
 *
 * Real RBAC + audit-on-mutation + real mutation = rows #2–#5. There is NO
 * production write path here, by construction.
 *
 * Test strategy: apps/admin/docs/test.md §2 (TT-CMD-NOOP).
 */
import type { AdminCommandAdapter, NoOpResult } from "./types";

const NO_OP: NoOpResult = {
  ok: true,
  noop: true,
  reason: "slice-1-mock-no-write",
};

/** Returns the canonical no-op result; performs no side effect of any kind. */
function noop(): Promise<NoOpResult> {
  return Promise.resolve({ ...NO_OP });
}

export const mockAdminCommandAdapter: AdminCommandAdapter = {
  banUser: () => noop(),
  bulkBan: () => noop(),
  setFeatureRollout: () => noop(),
  transferOwnership: () => noop(),
  setProviderRouting: () => noop(),
  setQuota: () => noop(),
};
