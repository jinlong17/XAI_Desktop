# REL-02 shared auth database diagnosis

Module: web. Baseline reproduction before implementation: `pnpm --filter @repo/web-auth-device-session test -- src/storage-indexeddb.test.ts` failed 1/1 with `NotFoundError: No objectStore named device in this database`. The actual IndexedDB emulator replaces only browser storage; package public adapters run unchanged.

Strategy and state are recorded in the owner dev_log. Default v2 must contain both stores and retain v1 records. Failed or blocked opens must not poison retries or leak late connections. Custom database and store names remain supported.

## Implementation receipt

- Commit: `0141ecb` (`fix(web-auth-device-session): migrate shared auth database safely`).
- `pnpm --filter @repo/web-auth-device-session test`: 12 files, 52 tests PASS (10 new IndexedDB regressions).
- `pnpm --filter @repo/web-auth-device-session check-types`: PASS.
- `pnpm --filter @repo/web check-types`: PASS.
- `git diff --check`: PASS before commit.
- State: FIX_READY_FOR_VERIFY. Independent review and real-browser/live-auth validation not claimed. No push by bug-fix agent.
