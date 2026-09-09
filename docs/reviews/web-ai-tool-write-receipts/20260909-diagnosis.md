# AI-02 creation request retry diagnosis

Web module. Current source unchanged in both create subscribers at 279a7f5. Actual hooks, event bus and Storage are used in jsdom. Quota is injected only at the physical key. Both tests first prove one rejected write and unchanged source bytes, remove the fault, resend exactly the same requestId, then require one record. Both correctly FAIL with zero records.

Cause: Tasks and Calendar create subscribers add requestId to seenRef before validation/persistence. setPref returns false but the id is already consumed, so a retry is silently skipped. AI Chat handleConfirmTool separately emits the request then constructs an unconditional successful tool_result without a business receipt (source evidence, not a full UI reproduction here).

Initial runner setup needed globals:true because Tasks setup imports jest-dom's global entrypoint; that configuration failure is not counted as product evidence. Final before.log is the two correct business failures.

Required complete AI-02 work: receipts correlated to request/account; confirmed persistence before model success; explicit quota, invalid/not-found and absent-subscriber failures; retry and idempotency across create/update/delete; no stale account execution. Fixing only seenRef placement for create does not complete AI-02.
