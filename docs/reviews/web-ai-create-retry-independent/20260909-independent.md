# Bounded AI Tasks/Calendar create retry — independent verification

Implementation fixed at `e45f78e`. Verifier did not author either subscriber change and made no product changes. Product and original test sources are loaded from git-archive snapshots; workspace imports resolve inside those snapshots. Installed node_modules supply dependencies. This prevents current shared-worktree edits from changing the tested source.

## Original assertions

Run `python3 docs/reviews/web-ai-create-retry-independent/verify-original-contract.py`. The original `docs/reviews/web-ai-tool-write-receipts/save-contract.test.tsx` is unchanged: both Tasks and Calendar storage-failure/same-requestId recovery assertions PASS against fixede45f78e (`original-contract.log`,2tests). Only test-runner workspace aliases and canonical temporary paths are adjusted for snapshot execution; assertions and fixture setup remain original.

Two initial runner failures occurred before tests executed: this machine's Python tarfile lacks the newer filter keyword, and macOS /var versus /private/var aliases caused a Vite setup-file resolution failure. Both diagnostic logs are retained. The final runner uses the trusted local Git archive and resolved filesystem paths. Neither failure is counted as a product test result.

## Independent native controls

Run `node docs/reviews/web-ai-create-retry-independent/verify-native.mjs`. Native Chrome PID76757 with an isolated temporary profile mounts the actual two zero-UI subscriber hooks. Events are emitted through the actual typed Web event bus. Scoped synthetic records start empty; native Storage.prototype.setItem counts each attempt and throws QuotaExceededError for the selected store. No model, external account, production endpoint or real user profile is used.

Both Tasks and Calendar pass three controls (`native-results.log`, `native-runner.log`):

1. A rejected write attempts storage once and preserves exact original bytes. Restore storage and emit the same requestId: exactly one record is persisted. Emit that successful ID again with changed content: zero additional storage attempts and identical persisted bytes.
2. Emit a whitespace-only title: no write occurs. Correct the title and reuse its requestId: exactly one new record is persisted. Invalid requests therefore do not consume their retry ID.
3. A normal first successful request creates one record. Repeating it performs no additional storage write and preserves exact bytes.

## Source review and limits

The two changes add request IDs to the seen-set only after setPref returns true. This is the relevant business boundary for rejected-write retry. The set remains in-memory and bounded at100 entries, with the existing full-set reset behavior when reaching capacity. It is not durable request deduplication across reloads, remounts, multiple subscriber instances or arbitrary long sessions; no such guarantee is inferred.

These subscribers still return void and do not emit a model-visible durable write receipt. The missing-subscriber case and model/tool acknowledgement protocol were not implemented by this commit. Existing seed fallback, malformed data handling, cross-tab races and account-event lifetime semantics were not changed or accepted here. This is bounded subscriber retry PASS only; overall AI-02 and REL-05 remain open.
