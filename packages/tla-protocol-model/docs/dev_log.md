# tla-protocol-model — Dev Log

## 2026-05-23 01:57 PDT

- Installed Homebrew `openjdk@21` (OpenJDK 21.0.11) and ran TLC v1.8.0
  against `docs/spec/sync.tla` + `docs/spec/sync.cfg`.
- TLC found two spec-level over-assertions (not implementation bugs); both
  fixed in the model:
  1. `RecoveredDevicesHaveDEK` weakened to `recovered ∩ active` so a
     revoke-after-recovery transition no longer falsely violates the
     invariant.
  2. `ReplayPending` success branch now cleans matching `conflictShadow`
     records by `mutation` id so a retry-after-conflict path no longer leaves
     stale conflict entries when the mutation finally applies.
- Bounded the model to `Devices={d1,d2}`, `MutationIds={m1,m2}`, `MaxCommit=2`
  and added `CONSTRAINT StateConstraint` (`|pending| <= 2`,
  `|conflictShadow| <= 2`) to keep the state space tractable; an earlier
  3x3x3 attempt exploded to 975M states / 67 min without converging. The
  bounded model still triggers all six mandatory scenarios via the existing
  actions.
- TLC result: 12,165,098 states generated, 1,685,800 distinct states found,
  depth 22, `0 states left on queue`, all seven invariants hold, no deadlock.
- See `docs/spec/sync-model-check.md` for the full evidence (toolchain,
  command, fixes, run summary).

## 2026-05-20 14:55 PDT

- Implemented TypeScript state-space exploration fallback for nonce lease and rekey state transitions.
- Verified invariant coverage, deadlock absence, and eventual rekey swap.
- Verification: `pnpm --filter @repo/tla-protocol-model test`; package `check-types`.

## Status Panel

| Field | Value |
|---|---|
| Feature | tla-protocol-model |
| Status | SHIPPED |
| Executor | Claude (W0.D, 2026-05-23) |
| Updated | 2026-05-23 01:57 PDT |

## Work Log

| Timestamp | Action | Verification | Next |
|---|---|---|---|
| 2026-05-19 04:26 PDT | Added `docs/spec/sync.tla`, `docs/spec/sync.cfg`, and model-check notes covering the six mandatory scenarios plus explicit account_commit_seq equivocation limitation. | Static scenario marker check passed; TLC jar downloaded; TLC execution blocked by missing Java Runtime. | Install Java and run `java -jar /tmp/tla2tools.jar -deadlock -workers 2 docs/spec/sync.tla`. |
| 2026-05-23 01:57 PDT | Installed `openjdk@21` via Homebrew; ran TLC v1.8.0 with bounded model + state constraint; fixed two TLC-discovered over-assertions in `sync.tla`. | TLC bounded run completed in 20s: 12.1M states / 1.69M distinct / depth 22 / 0 in queue / all 7 invariants pass / no deadlock. | Treat sync W3 row #33 as complete; recheck after any future change to `sync.tla` or `sync.cfg`. |
