# Native Settings recovery — fixed before evidence

Parent independent, Web, 2026-09-09, product fixed `ea5ba0b`. The runner extracts an immutable archive, resolves workspace imports to it and launches an isolated Chrome profile. It executes actual Settings recovery, native WebLocks, and actual IndexedDB secret cleanup with opaque synthetic A/B rows. The auth cleanup callback is synthetic and records captured identity; no server deletion, provider request, actual account or credential is used.

`native-ea5ba0b.json` reproduces two correct failures:

1. A native account shared lock is held while recovery starts. Existing recovery erases A and advances its receipt before that lock is released.
2. Two actual concurrent recovery calls for A, with B current, dispatch the synthetic captured-auth participant twice. The future protocol requires compatible live coordinators to serialize and observe completion before repeating it.

The tests use real locks, not a mocked request adapter. They release and await the held lock/operation before reporting the first assertion. No restart phase runs after initial failures. Later account/secret/idempotence assertions in each case are not claimed reached after a failing earlier assertion.

On a repaired implementation the unchanged cases additionally verify exact A cleanup, B local/IndexedDB preservation and current-account identity, absence of an account lifecycle lock during the auth participant, and completed retry as a no-op. If initial checks all pass, whole-process SIGTERM/reopen checks exact receipt bytes and account/secret separation. This does not claim auth-store integration, UI interaction, crash-exactly-once delivery or universal old-client safety.

```sh
node docs/reviews/web-d2-settings-deletion-native/verify-native.mjs ea5ba0b
```
