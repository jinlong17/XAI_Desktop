# tla-protocol-model — Test

Checks attempted during autorun:

```bash
rg "DeviceRevocation|NewDeviceJoin|ConcurrentRekey|OfflineReplay|FullRecovery|DuplicateMutation" docs/spec/sync.tla docs/spec/sync.cfg
wc -l docs/spec/sync.tla docs/spec/sync.cfg
curl -L --fail --silent --show-error -o /tmp/tla2tools.jar https://github.com/tlaplus/tlaplus/releases/download/v1.8.0/tla2tools.jar
java -jar /tmp/tla2tools.jar -deadlock -workers 2 docs/spec/sync.tla
```

Results:

- Scenario marker/static coverage check passed.
- `sync.tla` and `sync.cfg` exist.
- TLC jar downloaded to `/tmp/tla2tools.jar`.
- TLC did not run because the machine has no Java Runtime.

Required follow-up:

- Install a JRE/JDK.
- Rerun the TLC command.
- If TLC reports a counterexample, either fix the model/protocol or add a
  concrete known limitation before treating #33 as complete.
