# Board D1 repair and Calendar publication cleanup — bounded acceptance

Astra, non-author; Web; 2026-09-09. Product snapshots `728822d189c0d0c7ad2848ea562682a27046808a` (Board) and `2fed98475ea6c3ba3943bb698c5e94ff7b4330c9` (Calendar). Only independent review artifacts changed.

**Accept both bounded changes.** The three Board findings in `b4344a4` are repaired without changing their assertions. Calendar's redundant post-commit legacy setter is removed while actual domain publication, failure and UI behavior remain correct. This accepts Board's ordered intent → canonical Tasks → acknowledgement path and this Calendar cleanup; it does not close the whole Board feature, D1, AI-02 or REL-05.

## Board repair review

`taskLinkCommand.ts` now distinguishes physical presence from decoded value and requires a valid persisted Board source. JSON null and truly missing Board bytes cannot fabricate a source from defaults; legitimate absent Tasks still initializes under the shared canonical writer. `sameTaskLink` compares source, task ID, creation time, both localized pending title values and due date before the locked Task mutation and again before acknowledgement. An old operation therefore preserves the newer same-ID pending request and honestly reports acknowledgement failure after an already committed Task. The existing Task check also refuses a different pending payload instead of clearing it merely because a Task with that deterministic ID exists. No cross-key atomicity is claimed.

The Module resets the task-link error when the active-card session changes, alongside its existing operation counter/pending reset. Our actual UI tests prove both settled error isolation and old delayed completion isolation. Existing phase/quota/retry and stable-card move behavior remains covered. The added author tests supplement rather than replace the earlier assertions.

Fresh independent archive executions, all PASS:

| Own artifact | Coverage |
| --- | --- |
| `d1-board-parent-baseline-astra-728822d.log` | Original 4: absent/envelope Tasks success, durable receipt/idempotence, present null/envelope-null refusal |
| `d1-board-boundaries-astra-728822d.log` | Unchanged 15: prior three failures plus corrupt/queued source, ID, owner/generation, move, pending/quota/retry/session controls |
| `d1-board-repair-astra-728822d.log` | New 4: truly absent Board refusal; queued same-ID pending or creation-time replacement; existing Task versus different pending retry refusal |

The command is intentionally conservative when the retained pending payload differs from the existing Task: it refuses for review and does not overwrite that Task or silently acknowledge the newer payload. This is not automatic reconciliation of human edits. General concurrent Board whole-object writes and cross-key transactions remain outside this acceptance.

## Calendar cleanup review

The product diff only removes `setEventsRaw(result.data)` and its destructured setter/dependency from `useUserCalEvents`. It still awaits `mutateCanonicalDataset`, returns null on failure and returns committed domain data on success. Real domain validation, owner capture, absent initialization and locked entity preconditions are unchanged. Reactive projection continues through `usePref` and the canonical writer's same-tab publication.

| Own artifact | Coverage |
| --- | --- |
| `d1-calendar-independent-astra-2fed984.log` | Original 11: real Calendar domain validation, queued save/delete, create concurrency, quota/latest draft, Promise rejection, missing target and A→B |
| `d1-calendar-publication-astra-2fed984.log` | New 2: actual two-hook create/update/delete propagation, exactly one write/publication per success, retained receipt, zero legacy-write warnings; quota failure publishes nothing and preserves both hooks/raw bytes |

All 13 PASS. The publication test invokes the real hook and storage implementation; it does not replace the removed setter with a mock. Before logs, including Calendar warnings and earlier failures, remain intact.

## Reproduction and evidence boundaries

```sh
node docs/reviews/web-board-workspace-astra-review/verify-d1-board.mjs 728822d d1-board-parent-baseline astra
node docs/reviews/web-board-workspace-astra-review/verify-d1-board.mjs 728822d d1-board-boundaries astra
node docs/reviews/web-board-workspace-astra-review/verify-d1-board.mjs 728822d d1-board-repair astra
node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs 2fed984 d1-calendar-independent astra
node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs 2fed984 d1-calendar-publication astra
```

Runners use fixed archives and new `astra` suffixes; parent logs were neither overwritten nor attributed to this reviewer. Parent `ab3a150` independently had Board's 4+15 PASS; `7f19aec` records Board package 318 PASS and Calendar 26 PASS. Author Calendar package 372/types/lint PASS remains author evidence. Those already sufficient broad repetitions were not rerun mechanically here; this review adds source analysis, unchanged critical independent assertions and targeted new checks. No native browser run or full Tasks repair acceptance is added.

Tasks' six failures in `0143952`, Board detail checklist/attachment/comment draft-loss work, account-wide D2, old-client rollout and production activation remain separate. D2 implementation entry requirements are specified in `20260909-d2-implementation-entry-contract.md`; the existing architecture is sufficient to begin that bounded work, not to claim its completion.
