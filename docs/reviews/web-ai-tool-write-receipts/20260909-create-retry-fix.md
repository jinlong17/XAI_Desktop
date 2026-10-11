# AI creation retries after failed persistence

Bounded AI-02 progress, not full acceptance. Both Tasks and Calendar create subscribers now add requestId to the seen set only when setPref returns true. Failed requests can be retried with the same id; a successful replay remains deduplicated. No model-success receipt is added in this change, and update/delete subscribers remain separate work.

Original correct assertions unchanged: before 2 FAIL, after 2 PASS. Real hooks/event bus/Storage are used, without mocking the business setter.

Validation:
- Tasks full package: 18 files / 165 tests PASS.
- Initial concurrent Calendar run: 342 PASS / 1 timeout plus delayed URL.revokeObjectURL test-double cleanup exception. Retained package-tests.log; do not label that run PASS.
- Calendar full rerun with maxWorkers=2: 46 files / 343 tests PASS, original assertions and timeout unchanged.
- Corrected Calendar export test uses fake timers to execute and assert URL revocation before restoring globals; focused save-recovery 4 tests PASS and lint PASS afterward. This fixes test ownership of a delayed callback, not a production download failure.
- Both package type checks and lint PASS. Initial attempted @repo/xai-web-* filters matched no projects and are not verification; actual package names @repo/plugin-web-* were used for accepted runs.

Still open: business receipts before AI success, missing subscribers/invalid ids, update/delete recovery, account-bound requests and durable idempotency across remounts. No real provider or production profile was used. Independent verification pending.
