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

## TLC Attempt

Command attempted:

```bash
curl -L --fail --silent --show-error -o /tmp/tla2tools.jar \
  https://github.com/tlaplus/tlaplus/releases/download/v1.8.0/tla2tools.jar
java -jar /tmp/tla2tools.jar -deadlock -workers 2 docs/spec/sync.tla
```

Result on this machine:

```text
Unable to locate a Java Runtime.
```

The jar downloaded to `/tmp/tla2tools.jar`, but macOS has no Java Runtime
installed. TLC model checking is therefore blocked in this autorun and must be
rerun after installing a JRE/JDK.
