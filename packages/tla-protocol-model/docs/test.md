# tla-protocol-model — Test

Static checks:

```bash
rg "DeviceRevocation|NewDeviceJoin|ConcurrentRekey|OfflineReplay|FullRecovery|DuplicateMutation" docs/spec/sync.tla docs/spec/sync.cfg
wc -l docs/spec/sync.tla docs/spec/sync.cfg
```

TLC model check (2026-05-23 toolchain: Homebrew `openjdk@21` + `tla2tools.jar`
v1.8.0):

```bash
java -jar /tmp/tla2tools.jar -deadlock -workers 2 \
  -config docs/spec/sync.cfg docs/spec/sync.tla
```

Results (2026-05-23 01:57:05 PDT):

- Scenario marker/static coverage check passed.
- TLC exhaustively explored the bounded model (Devices={d1,d2},
  MutationIds={m1,m2}, MaxCommit=2, plus `CONSTRAINT StateConstraint`).
- 12,165,098 states generated, 1,685,800 distinct states found, depth 22,
  0 states left on queue.
- All seven invariants hold (`TypeOK`, `RevokedNotActive`,
  `RecoveredDevicesHaveDEK`, `AppliedAndConflictDisjoint`,
  `PendingDevicesAreKnown`, `CommitWithinBound`, `NoCommitPastDeviceView`)
  and no deadlock is reachable.

Two spec-level over-assertions were uncovered by TLC and fixed in the model
itself; both are documented in `docs/spec/sync-model-check.md` Model Fixes
section. They are spec corrections, not protocol/implementation changes.

Re-run:

- Rerun the TLC command whenever `docs/spec/sync.tla` or `docs/spec/sync.cfg`
  changes.
- If a counterexample appears, either tighten the protocol model, weaken the
  invariant with a documented justification, or record the residual gap as a
  new known limitation before treating #33 as still complete.
