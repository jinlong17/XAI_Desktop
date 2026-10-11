# Six durable subscribers — Astra non-author review

Web. Fixed product `4202c7931e90d0adae91d928fcf45c42830f7e90`, authored by Sol. All local executions resolve product imports from immutable git archives. Concurrent Tasks/Board implementation was excluded. The separate reset repair was independently accepted at review commit `c58a647` against product `d8412d3` (26/26 original assertions), not folded into this verdict.

**Verdict: six-operation durable replay and native continuation paths have strong bounded PASS evidence, but retain one Tasks update semantic-snapshot blocker.** This integration is not fully accepted until that narrow defect is repaired. Full AI-02/D1/D2 and public activation remain open. No overall completion count changes.

## Evidence layers

| Evidence | Result | Source |
| --- | --- | --- |
| New Astra subscriber contracts | 10 PASS / 1 correct FAIL | `six-subscriber-independent-4202c79.log` |
| Sol adapted durable suite, independently rerun | 10/10 PASS | `six-author-durable-rerun-4202c79.log` |
| Event-bus bridge tests, independently rerun | 4/4 PASS | `six-eventbus-rerun-4202c79.log` |
| Full Calendar package, independently rerun | 45/50 files, 352/372 tests; 20 FAIL | `six-calendar-full-rerun-4202c79.log` |
| Parent fixed native whole-Chrome reopen | Six initial + six reopened cases PASS | `646a539`, [native reopen review](../web-canonical-six-subscriber-native/review.md) |
| Parent fixed native actual AiChat continuation | All six quota/double-confirm/retry cases PASS | `646a539`, [native continuation review](../web-ai-canonical-continuation-native/review.md) |

Run local suites with `node docs/reviews/web-board-workspace-astra-review/verify-six-subscribers.mjs 4202c79 <suite>`. My tests use actual subscribers/event bus/jsdom Storage and deterministic serialized lock callbacks. The six primary cases preserve the original business oracles: remount + new valid same-generation owner returns the original target, unchanged raw bytes, later human edit preserved, and deleted-target receipt replay succeeds. Fixtures now use a real four-bucket Tasks domain and human edits use public `mutateCanonicalDataset`; the original pre-canonical six FAIL files remain unchanged. This is a schema/API adaptation, not relaxed replay assertions.

The parent native reviews and JSON artifacts were read in this review; I did not rerun them. Their fixed hash matches this product. Chrome PID 55570 exited after SIGTERM and PID 55624 reopened the same isolated profile/origin; exact saved records/targets and later human edits replayed, conflicts preserved bytes and fresh commands continued. The actual AiChat UI suite observes one write attempt under quota, no success continuation, then one retry commit and one matching tool_result continuation whose entry sees already committed bytes. It uses a synthetic stream adapter, no live provider network, and explicit test activation. Neither native suite proves production rollout, OS crash durability or all ordinary writer concurrency. Original native `db1eddc` failures remain retained.

## Confirmed blocker: signature and queued Tasks mutation can diverge

`packages/xai-web-tasks/src/internal/aiMutateSubscriber.ts`, update handler, correctly builds a copied `patch` for `operation:{id,patch}`. Its locked `mutate` nevertheless continues to read `p.bucket` and `p.tag`, where `p` is the caller's mutable original `payload.patch` object.

The independent counterexample dispatches a real update with `{title:'Tool edit',tag:'work',bucket:'later'}` and pauses the actual lock callback. It then changes that original in-process patch to `tag:'personal',bucket:'nodate'` before releasing the lock. The command replies success and commits:

- Durable signature: original `work/later` semantic fields.
- Actual task: `personal/nodate`.
- Both expected original bucket/tag assertions correctly FAIL; raw diagnostic output is retained.

This proves the receipt does not necessarily describe the committed operation across the asynchronous boundary. It is a deterministic mutable-event-payload seam, not a claim that the actual AiChat UI currently mutates this object, an untrusted plugin exploit, or a failure of the primitive lock itself. The same frozen semantic values must feed both receipt signature and business mutation.

Minimum ownership: only the Tasks `aiMutateSubscriber.ts` update closure plus its focused regression. Read the already captured/validated `patch.bucket` and `patch.tag` inside the mutation; do not reread `p`. The remaining captured `id`/trimmed `title` are local values. Keep all earlier native/replay PASS evidence and the correct new FAIL assertion, then rerun against the repair hash.

## Other findings and bounded conclusions

- `executeToolWrite` now awaits durable results, maps failures and correlates channel/request/attempt/owner. Its WeakMap authority and raw-JSON signature early return were removed. Independent queued Tasks/Calendar creates emit no early receipt; an intervening owner switch refuses without writes. Quota refuses with exact original bytes and retry succeeds. Six replay cases check one first canonical write and zero replay writes.
- Calendar create retains omitted defaults in its signature and resolves them only for the first mutation; Sol's midnight replay test was independently rerun. Calendar domain validation is the committed strict guard; Tasks uses its owner validator. The bridge/primitive does not itself validate production provider semantics, and no such claim is made.
- Full Calendar remains red. The first archive attempt had one additional test-root ENOENT because a source-boundary test reads from `process.cwd()`; `six-calendar-full-rerun-4202c79-harness-root-attempt.log` preserves that runner issue. Correct package root/cwd removed that extra failure without changing product/tests; the final 20 FAIL match the five known files.
- The full-suite failures include old `setPref('xai_calendar_events', ...)` fixture seeding rejected under activation. `CalendarModule.saveRecovery.test.tsx` also contains immediate synchronous recovery assertions after the now-async Save callback; its new-event cases must await the actual outcome and inspect envelope data. Therefore not all 20 failures should be described solely as failed seed setup. Preserve business assertions, adapt fixtures through supported initialization/writers and await commit; never restore the sync bypass or change expected recovery behavior just to make the suite green.

The existing independent async Calendar recovery/reset suite has its own fixed-hash acceptance, but does not erase the red full-package evidence. Tasks/Board normal writer conversion, all account migration writers and the old-client activation gate remain unresolved separate work. This review adds a narrow semantic-snapshot repair requirement before accepting the six-subscriber integration; it does not close full AI-02 or any broader release item.
