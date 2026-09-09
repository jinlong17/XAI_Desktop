# REL-02 shared auth database diagnosis

Module: web. Baseline reproduction before implementation: `pnpm --filter @repo/web-auth-device-session test -- src/storage-indexeddb.test.ts` failed 1/1 with `NotFoundError: No objectStore named device in this database`. The actual IndexedDB emulator replaces only browser storage; package public adapters run unchanged.

Strategy and state are recorded in the owner dev_log. Default v2 must contain both stores and retain v1 records. Failed or blocked opens must not poison retries or leak late connections. Custom database and store names remain supported.
