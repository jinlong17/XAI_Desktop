# AI-02 bounded receipt phase — Sol independent acceptance

## Verdict

Fixed product revision: `daff8ef2c69f5543f161f309c345b0e138808b35`.

The bounded receipt phase independently passes its native-browser acceptance checks. This does **not** close AI-02. Page-reload/new-process durable idempotency, cross-tab serialization and crash boundaries remain open, and Calendar civil-date validation is a separately known full-AI-02 business-semantics blocker at this fixed revision.

No product source was changed by this review. The earlier author-reported 23 focused tests and package totals were not reused as independent evidence and were not rerun.

## Environment and isolation

Command:

```bash
node docs/reviews/web-ai-tool-receipt-sol-independent/verify-native.mjs daff8ef
```

The runner resolves the full commit, expands `git archive` into a temporary source tree and resolves all `@repo/*` imports from that snapshot. It launches the installed native Google Chrome 152 binary with a fresh temporary profile and removes the profile and source tree after exit. Accounts, tasks and calendar rows are synthetic. The provider adapter is replaced at bundle time by a deterministic local tool-use stream, so no provider key, real account or production endpoint is used.

Successful raw output is preserved in `native.log`.

## Independently verified business contracts

For each of Tasks create/update/delete and Calendar create/update/delete, the runner mounts the real React subscriber hooks over the real event bus and native `localStorage`:

1. One exact canonical-key `QuotaExceededError` returns a `storage` failure receipt and preserves the preceding canonical bytes.
2. Retrying the same requestId with a fresh attemptId after storage recovery persists the operation and returns success with the actual target id.
3. Unmounting and remounting all subscribers, then replaying that successful request with a third attemptId, returns the cached success but leaves canonical bytes unchanged. The write does not execute twice during the page lifetime.
4. Reusing the requestId and channel with a changed payload returns `request-conflict` and leaves bytes unchanged.
5. For all four update/delete tools, blank ids return `invalid`; nonexistent ids return `not-found`; neither changes bytes.
6. For all six tools, a request captured under account A and emitted after activation of account B returns `account-changed`; both A and B canonical bytes remain unchanged.

The probe then drives the actual `AiChatModule` composer, confirmation button and stream continuation for all six tools. The first exact-key quota failure keeps the confirmation visible, displays a failure and leaves model-call count at one. After storage recovery, a second Confirm persists the business state, removes the card and emits the matching success `tool_result` in the second stream. The final data oracle checks persisted fields, generated create target ids, updated bilingual task titles and event times. Calendar delete explicitly verifies that deleting the last event persists `{}` before the model success continuation.

Actual AI UI checks also cover both blank and missing ids for every update/delete tool. Each failure retains the confirmation, leaves canonical bytes unchanged and does not send model success. All six tools separately run without any business subscriber; each times out visibly, retains the confirmation and leaves model-call count at one.

For delayed receipt correlation, attempt 1 is allowed to time out. During attempt 2, a forged success receipt for attempt 1 does not remove the card or advance the model. Only the matching attempt-2 receipt advances the model. A separate unfaulted Calendar-delete control persists an empty final store before its success continuation.

## Open scope and secondary finding

The successful replay cache is a page-lifetime `WeakMap` keyed by the current `AccountScope` object. This review proves subscriber remount behavior only. It is not a durable receipt journal and cannot establish exactly-once behavior after a page reload, process restart or new account epoch. Full AI-02 must remain open until the owned durable schema, six-operation reload matrix, shared writer serialization, cross-tab concurrency and crash recovery are implemented and independently accepted.

The shared helper currently signs operations with plain `JSON.stringify`. Native characterization confirms that replaying a semantically identical multi-property patch with a different property insertion order returns `request-conflict`. The current AI tool registry constructs patch keys in stable order, so this does not fail the bounded UI path, but the shared idempotency helper is not canonical and should be corrected or explicitly constrained before it becomes a general durable protocol.

This fixed revision also does not establish complete Calendar input semantics. Impossible civil dates are outside this receipt-phase PASS and remain a separate blocker. No hosted login, real model provider, cross-tab race, full browser reload, crash injection or production deployment was tested here.
