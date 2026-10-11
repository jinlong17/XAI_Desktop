# AI-02 receipt protocol phase — implementation handoff

Web scope. This phase extends the parent `e45f78e` create-retry fix; it is **not full AI-02 completion**. Work paused on parent instruction for the user's model-role transition. No envelope migration started and no push performed.

## Implemented

- Core typed request channels carry optional captured owner + attemptId. AI always supplies both, appended after registry payload construction. Existing ownerless direct event callers are a trusted in-process compatibility path; an owner-bearing request is never downgraded to ownerless or rebound to the current account.
- One typed `web:ai:tool-write-receipt` correlates requestId/channel/attempt/owner, success/failure and target id.
- Four real Tasks/Calendar subscribers bind captured scope to getPref/setPref, validate target/operation, and emit success only after true persistence. Quota errors remain retryable. Empty/nonexistent update/delete ids cannot succeed.
- Shared event-bus helper stores successful request signatures/results in a page-lifetime WeakMap keyed by the actual account-scope object. Subscriber remount/StrictMode reconstruction preserves success deduplication; identical retry returns a receipt for its new attempt without executing again. Reusing an id with a different payload fails. The capacity limit fails closed instead of evicting ids and risking duplicates.
- AI subscribes before emit, awaits matching business receipt, rejects timeout/no subscriber and account replacement, retains the confirmation card on failure, and reports model tool_result success only after a success receipt. Confirm/Cancel cannot race a pending receipt. Composer sends cannot replace a pending tool confirmation.

## Evidence and scope

`no-subscriber.test.tsx` is an actual AiChatModule + synthetic stream test. Before, model calls=2 without a business subscriber (correct FAIL). After, calls=1, visible failure and retained confirmation (PASS). Before log is preserved unchanged.

`subscriber-contract.test.tsx`: 22 cases using real hooks, typed event bus, native jsdom Storage, and actual AiChatModule where applicable. Six operations each cover quota then same-id retry then subscriber remount idempotence; four update/delete variants cover empty/missing id; six cover old-owner request rejection after A→B; six actual Confirm paths prove no model success before successful storage retry. With the no-subscriber test: 23 PASS. These are component integrations, not native Chrome/provider/production proof.

Parent original two create-retry assertions were not modified and remain 2 PASS. Full package logs: AI 278, Tasks 165, Calendar 343, event bus 18, all PASS; do not sum overlapping totals into independent coverage. AI/Tasks/Calendar/event-bus typechecks and lint pass. Bus lint prints the existing Node module-type performance warning, not a lint failure.

Three old AI bounded-round-trip tests now supply an explicit mock successful business receipt because they test adapter/one-followup behavior. Their existing outcome assertions were retained. This mock is not persistence evidence; actual failure/success integrations above supply that evidence. A parallel initial full run had an unrelated 5s crypto test timeout under contention; the subsequent complete AI package run passed without changing that test or timeout.

## Outstanding before AI-02 closure

1. **Durable request idempotency remains open.** The cache survives subscriber remount, not an entire browser reload or a new account epoch. No claim of a persistent delete receipt/tombstone is made. Tasks can potentially carry receipt metadata in their canonical columns, but Calendar's `Record<id,event>` has no legitimate metadata carrier after deleting the last event. A canonical envelope or explicit tombstone schema requires migration plus every consumer read/write adapter; do not inject fake events or use a separate-key journal and call it atomic.
2. Native Chrome actual end-to-end tool receipts and independent verification have not run for this phase. Native Chat draft downloads from the prior REL05 work do not verify these tool writes.
3. Add focused late-attempt/timeout/retry tests and evaluate unmount cancellation. Current helper ignores old attempt receipts and observes account replacement by implementation, while the current integration matrix covers old-owner dispatch. Do not equate those with complete delayed-reply fault coverage.
4. Decide persistence strategy and schema ownership before expanding into Calendar/Tasks canonical writers. Existing same-tab synchronous writes are not cross-tab transactions.
5. Review date validation and legacy default behavior separately: existing Calendar create date/time fallback and same-day clamping largely remain. This receipt phase rejects invalid write outcomes but is not complete semantic calendar validation.
6. Presentation can improve: failure alert currently includes the internal reason token, and retry uses the existing Confirm button. This is visible truthful failure, not final UX polish.
7. Package docs describing old fire-and-forget behavior still need full contract reconciliation after durable receipt scope is settled; this handoff is the accurate current receipt-phase contract.

## Exact owned surface

- `packages/core/src/types/events.ts`
- `packages/xai-web-event-bus/src/index.ts`, `src/toolWriteReceipt.ts`
- `packages/xai-web-tasks/src/internal/aiCreateSubscriber.ts`, `aiMutateSubscriber.ts`
- `packages/xai-web-calendar/src/internal/aiCreateSubscriber.ts`, `aiMutateSubscriber.ts`
- `packages/plugin-web-ai-chat/src/AiChatModule.tsx`, `src/internal/requestToolWrite.ts`, `src/__tests__/AiChatModule.test.tsx`
- this review directory.

Parent separately owns `plugin-web-ai-chat/src/internal/useChatPreference.ts` follow-up. It was not edited in this phase. Other agents' dashboard/board/preference review files are not part of this commit.

All command processes started by this phase have completed; no browser/profile/server process was created for AI-02. The latest exec session 14934 completed exit 0. No pending process handle requires resumption.

## Next operator/model action

Read Git status and this commit's exact diff; preserve unrelated work. Independently review the protocol implementation and run the supplied original-two + 23 contracts before accepting the bounded phase. Assign durable envelope/tombstone migration separately with explicit consumer ownership, then add reload/late-response/cross-tab acceptance. Keep AI-02 open until those scope decisions and required checks are satisfied.
