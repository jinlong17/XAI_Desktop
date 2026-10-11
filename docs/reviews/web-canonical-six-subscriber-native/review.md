# Six subscribers: whole Chrome process reopen verification

Status: fixed 4202c79 passes all six operations before and after whole-process restart; pre-integration failures retained. No production or AI-02 closure claim.

The runner archives a supplied Git commit and builds the actual Tasks and Calendar subscriber hooks with their event bus and public storage writer. It uses a temporary HTTP origin, isolated Chrome profile, and synthetic account data. Product source is resolved from the archive, excluding concurrent worktree edits.

Each of six operations (Tasks/Calendar create, update, delete) must persist both the business change and one receipt. Updates then receive a later human edit through the public ordinary writer. An external Node checkpoint retains the exact serialized records and target IDs before Chrome exits. The runner observes process exit after SIGTERM, starts a fresh Chrome process on the same origin/profile, and rejects a normal-exit claim if forced termination was needed.

After restart each operation must replay with the same target and unchanged persisted bytes, including the later human edit. A changed semantic operation with the old identity must conflict without writing. A fresh identity must create/update successfully with matching business data, or report a missing already-deleted target without changing storage. Results report each operation separately in both phases.

Run after the six-subscriber implementation is committed:

```sh
node docs/reviews/web-canonical-six-subscriber-native/verify-native.mjs <fixed-commit>
```

The JSON artifact records the fixed revision, both process IDs, per-case outcomes, and synthetic checkpoints. Initialization explicitly enables the experimental canonical writer. It does not prove the production activation/old-client upgrade gate, OS crash durability, browser UI close gestures, actual composer interactions, or AiChat/provider continuation. These remain separate acceptance work.

Preparation validation: runner JavaScript syntax checked with `node --check`; behavioral execution pending.

## Before integration: fixed db1eddc

The isolated native run reached all six actual subscriber hooks. Every initial operation returned a correlated `storage` failure under explicit activation, so the runner correctly refused to proceed to restart. This baseline predates the asynchronous canonical subscriber integration: activated legacy synchronous writes are rejected. It does not imply production activation is enabled. Evidence: `native-db1eddc.json`, command exited 1. Preserve the same assertions for the integration commit and report both phases independently.

## After integration: fixed 4202c79

The unchanged harness passed all six initial operations and all six reopened-process cases. Chrome PID 55570 exited after SIGTERM; new PID 55624 reused the isolated origin/profile. No forced termination was required. External checkpoints matched exact raw records after restart; original targets replayed without recreating deletes or overwriting later human edits, semantic conflicts preserved bytes, and fresh requests continued with verified business results. Evidence: native-4202c79.json (exit 0). This independently verifies the six real subscriber paths across fresh browser heaps, within the explicit test activation and synthetic-account scope above.
