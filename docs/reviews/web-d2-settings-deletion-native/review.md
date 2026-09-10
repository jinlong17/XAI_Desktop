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

## Independent repaired run

The unchanged native cases pass at `a6ad06d` (two initial PASS), followed by both exact receipt/account/IndexedDB checks after observed Chrome SIGTERM exit and reopen, PID 1391 → 1415. `native-a6ad06d.json` is parent-produced. Both repair-phase author observations are retained separately as `author-native-051d7fa.json` and `author-native-a6ad06d.json`; they are not independent evidence.

Parent also reran the four original Settings consumer assertions at this fixed revision, all PASS in `../web-d2-settings-deletion-independent/independent-a6ad06d.log`. The prior unpinned author log is preserved as `author-unpinned-HEAD.log` and not used to establish a fixed product result. Astra's complete implementation-contract review remains pending, including server-confirmed A→B orchestrator admission and phase/receipt validation beyond these bounded cases.

## Independent cross-context extension

Astra c35898f rejects the full a6ad06d slice. Parent added a same-origin iframe running its own actual Settings module instance in native Chrome, sharing only origin storage and native WebLocks. The parent holds its synthetic auth participant pending, starts the iframe recovery and then releases it. Both recovery calls must complete with one total auth participant, and existing account/secret/idempotence and process-reopen assertions must hold. This is distinct browser execution contexts, not two calls sharing a module map. It does not claim separate top-level tabs or real auth/server deletion.

Fixed a6ad06d retains both original initial PASS controls, while the new cross-context case correctly fails with `Account deletion receipt changed during cleanup`. The first recovery rejects after the competing context advances the receipt; later success/account/reopen assertions are not claimed reached. `native-a6ad06d-cross-context-before.json` preserves this result separately from the earlier two-case passing run. Runner now accepts an optional evidence suffix to preserve prior results.

```sh
node docs/reviews/web-d2-settings-deletion-native/verify-native.mjs a6ad06d cross-context-before
```

## Cross-context repaired run

Parent independently ran the expanded unchanged three-case native suite at fixed `f43dff6`: held account lock, same-page recovery and independent iframe recovery all PASS, then all three exact persisted receipt/account/IndexedDB checks PASS after observed process exit and restart (Chrome PID 6223 → 6253). No forced termination fallback was used. Evidence is `native-f43dff6-parent-cross-context-after.json`; the author's separate run is retained as `author-native-f43dff6.json`. This verifies the recovery lock repair within the probe scope. Confirmed server-success A→B admission and original operationId binding remain under implementation, so this does not accept the complete Settings/D2 slice.

Parent fixed integrated `b152399` rerun after confirmed-begin and full receipt-identity changes: all three initial native cases and all three process-reopen checks PASS, Chrome PID 8948 → 9122; evidence `native-b152399-parent-final.json`. Original consumer four assertions also PASS in `../web-d2-settings-deletion-independent/independent-b152399.log`. These retain their bounded recovery scope; actual confirmed-server hook cases remain separately reviewed.

## Queued entry snapshot extension

Astra edb8ab3 isolates the remaining entry-token gap. Parent reproduced it with an actually held native recovery lock at fixed b152399. While a recovery call waits, only the pending receipt's updatedAt/raw changes. After release the old call incorrectly fulfills. Expanded native run preserves three original PASS controls and records one correct FAIL in `native-b152399-queued-before.json`; no reopen is claimed for that failed run. The repaired-case oracle requires refusal, zero synthetic auth calls, exact replacement receipt, retained A/B content and actual IndexedDB secrets, then the same bytes after whole-browser reopen. Later assertions are not claimed reached in the failing before run.
