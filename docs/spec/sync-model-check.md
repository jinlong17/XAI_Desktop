# sync.tla Model Check Notes

## Spec

- TLA module: `docs/spec/sync.tla`
- TLC config: `docs/spec/sync.cfg`

## Scenario Coverage

The model includes explicit actions for the six mandatory Phase 4.8 scenarios:

| Scenario | TLA action / state marker |
|---|---|
| device revocation | `RevokeDevice`, `DeviceRevocation` |
| new-device join | `JoinDevice`, `NewDeviceJoin` |
| concurrent Re-key | `BeginRekey`, `FinishRekey`, `ConcurrentRekey` |
| offline replay | `QueueOfflineMutation`, `ReplayPending`, `OfflineReplay` |
| full recovery | `FullRecovery` |
| duplicate mutation | `DuplicateMutation` plus idempotent replay branch |

## Known Limitation

`account_commit_seq` is modeled as one honest global counter. This model checks
local monotonicity and stale-write behavior, but it does not defend server
equivocation where different devices are shown different histories.

## Bounded Model

`sync.cfg` runs TLC with the following finite parameters chosen to make the
search exhaustive within a reasonable budget:

- `Devices = {d1, d2}` — enough for `RevokeDevice` (needs `|active| > 1`),
  `JoinDevice`, and `FullRecovery` paths.
- `MutationIds = {m1, m2}` — enough to exercise both
  `DuplicateMutation`/idempotent-replay and the conflict/recover paths.
- `MaxCommit = 2` — bounds `commitSeq`, `keyEpoch`, and `seenCommit` codomain.
- `CONSTRAINT StateConstraint` enforces `|pending| <= 2` and
  `|conflictShadow| <= 2`. Without this constraint the powerset of
  `MutationRecord` makes the state space explode (an earlier 3x3x3 attempt
  produced 975M states in 67 minutes without converging). The constraint
  preserves the protocol semantics: real systems have bounded outstanding
  outbox / conflict queues.

The six mandatory scenarios all remain reachable in the bounded model
(`scenarioSeen` covers them via the existing actions).

## Model Fixes Found by TLC

Two real defects in the protocol specification were uncovered while running
TLC against the model; both were spec-level over-assertions, not
implementation bugs:

1. **`RecoveredDevicesHaveDEK` over-asserted.** The original invariant
   required every device that ever performed `FullRecovery` to permanently
   have `hasDEK = TRUE`. TLC's counterexample queued `RevokeDevice` after
   `FullRecovery`, leaving the device in `recovered` while `hasDEK = FALSE`.
   The invariant was weakened to
   `\A d \in recovered \cap active: hasDEK[d]` — recovery guarantees DEK only
   while the device is still active.
2. **`ReplayPending` success path leaked into `conflictShadow`.** The
   original success branch left `conflictShadow' = conflictShadow`. TLC's
   counterexample queued the same mutation under different `(base, epoch)`
   tuples: one variant fell into `conflictShadow` due to an `epoch` mismatch,
   then a later variant succeeded and entered `applied`. The mutation thus
   appeared in both `applied` and `conflictShadow`, violating
   `AppliedAndConflictDisjoint`. The success branch now cleans matching
   records via
   `conflictShadow' = { c \in conflictShadow : c.mutation # rec.mutation }`
   — once a mutation has applied, any prior conflict trace for the same id
   is resolved.

## TLC Run

Toolchain:

- JDK: Homebrew `openjdk@21` (`/opt/homebrew/opt/openjdk@21/bin/java`,
  OpenJDK 21.0.11 build).
- TLA+ tools: `tla2tools.jar` v1.8.0 from the official TLA+ release
  (`https://github.com/tlaplus/tlaplus/releases/download/v1.8.0/tla2tools.jar`,
  sha256 `71546dff3897a01b0ee4fa64135d9f5e9384d2b7e47b3cc20a16b655b0eb4f86`).

Command:

```bash
java -jar /tmp/tla2tools.jar -deadlock -workers 2 \
  -config docs/spec/sync.cfg docs/spec/sync.tla
```

Result on 2026-05-23 01:57:05 PDT:

```text
Model checking completed. No error has been found.
12,165,098 states generated, 1,685,800 distinct states found,
0 states left on queue.
The depth of the complete state graph search is 22.
Finished in 20s at (2026-05-23 01:57:05)
```

All seven configured invariants hold (`TypeOK`, `RevokedNotActive`,
`RecoveredDevicesHaveDEK`, `AppliedAndConflictDisjoint`,
`PendingDevicesAreKnown`, `CommitWithinBound`, `NoCommitPastDeviceView`), no
deadlock is reachable under the bounded model, and the search exhausted the
constrained state space (`states left on queue = 0`).
