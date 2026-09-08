# tla-protocol-model — API

This feature has no runtime API.

Spec entry points:

- Module: `docs/spec/sync.tla`
- Config: `docs/spec/sync.cfg`

TLC command:

```bash
java -jar /tmp/tla2tools.jar -deadlock -workers 2 \
  -config docs/spec/sync.cfg docs/spec/sync.tla
```

The bounded model (Devices={d1,d2}, MutationIds={m1,m2}, MaxCommit=2, plus
`CONSTRAINT StateConstraint`) completes exhaustively in ~20s. See
`docs/spec/sync-model-check.md` for the toolchain (Homebrew openjdk@21 +
tla2tools.jar v1.8.0), pass evidence, and the two spec-level invariant fixes
TLC uncovered.
