# sync-engine-pull Dev Log

| Timestamp | Change | Verification | Notes |
|---|---|---|---|
| 2026-05-19 03:59 PDT | Added pull-side types, `pullBatch`, `applyServerRecords`, HTTP transport, and E3015/E3024 errors to `sync-engine.ts`. | `pnpm --filter @repo/plugin-account check-types` passed. | Reuses the #26 engine contract file. |
| 2026-05-19 03:59 PDT | Extended `tests/sync-engine.test.ts` with H-6 classification and global cursor cases. | `pnpm --filter @repo/plugin-account test` passed. | Covers idempotent duplicate, legit re-encrypt, true rollback, account rollback, and no entity_type query param. |
