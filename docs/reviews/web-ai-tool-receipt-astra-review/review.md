# Astra main review — AI-02 durable business receipts

## Decision and evidence anchor

Module: **web**. Reviewed product commit: **daff8ef2c69f5543f161f309c345b0e138808b35**. Review-only output; no product changes and no push. Parent's consumer inventory at **905b116** was reviewed as supplementary input. Board workspace dirty files belong to Terra and were not changed.

**Keep full AI-02 in_progress. Keep full REL-05 open. No numbered item is closed by this review.** The objective remains all 312 audit items, with 13 formally completed at this handoff. `daff8ef` is a bounded receipt-phase implementation, not durable request idempotency.

The receipt phase has a sound basic shape: AI subscribes before dispatch, binds owner plus a fresh attempt, and sends the model success only after a matching business success. The six handlers inspect the storage write result. Invalid/absent mutation targets and missing subscribers cannot use the former unconditional model success path. Failed storage writes do not enter the in-memory committed cache. Sol must independently accept this bounded phase; an author's green package suite is not that acceptance.

New independent evidence: `durable-replay.test.tsx`, run against unchanged daff8ef product source, **6 correct FAIL / 6 cases**, log `durable-replay-before.log`. Each case commits with the real hook/event bus/native jsdom Storage, unmounts, reactivates the **same account and same generation**, supplies the new valid owner and attempt, then repeats the original request ID. Physical storage key equality is explicitly asserted.

| Operation | Correct requirement | Observed daff8ef failure |
|---|---|---|
| Tasks create | Same target and unchanged bytes | A second task and different target ID |
| Calendar create | Same target and unchanged bytes | A second event and different target ID |
| Tasks update | Replay original result; preserve later human edit | Reapplies old title over newer title |
| Calendar update | Replay original result; preserve later human edit | Reapplies old title and changes updatedAt |
| Tasks delete | Replay success even though target is absent | Returns failure for missing target |
| Calendar delete | Replay success after deleting the last event | Returns failure for missing target |

These are lifecycle integration failures, **not native browser reload evidence**. The update fixture deliberately writes a later independent domain edit to demonstrate replay effects; the future schema test must make that edit through the ordinary supported writer so that it preserves receipt metadata. Preserve the desired assertions and original FAIL log when adapting that fixture to the new storage format.

Command from repository root:

```sh
packages/plugin-web-ai-chat/node_modules/.bin/vitest run --config docs/reviews/web-ai-tool-receipt-astra-review/verify.config.mjs
```

The initial root `pnpm exec vitest` invocation could not find a root Vitest binary; the package-local command above executed all six tests in 1.13s and exited 1 on the intended business assertions. There are no running test processes from this review.

## Findings

1. **P1 — durable deduplication is missing.** `packages/xai-web-event-bus/src/toolWriteReceipt.ts:8-10,30-39` keeps results only in a WeakMap keyed by the actual account-scope object. `accountScope.lock/activate` replaces that object although persisted generation data may remain identical. A full page reload also loses the map. A delete target cannot carry its own receipt after removal. New epoch is valid transport identity, not a reason to execute a committed business request again.
2. **P1 — single-write data/receipt atomicity is not yet present.** Currently domain bytes commit in `perform()` and only afterward does a volatile cache entry appear. An interrupted or missing acknowledgement leaves no durable answer. A future separate-key receipt journal would retain an interruption window and is rejected as the architecture for this feature.
3. **P1 gate — all writers must preserve and coordinate the receipt-bearing record.** A same-key envelope solves the local commit boundary, but ordinary whole-state writes can erase receipts or lose another tab's mutations unless every writer participates. Tasks seed/migration/write callbacks, Calendar CRUD, Board task linking, imports/resets and lifecycle paths matter, not just the six AI handlers. A lock around only AI handlers cannot substantiate either full AI-02 concurrent replay safety or REL-08.
4. **Verification gaps for the bounded phase:** wrong/late attempt, wrong owner/channel, timeout followed by retry, unmount while waiting, double Confirm, same request ID with changed content, quota/denied access and native final data need independent evidence. Sol owns this phase's verification. `requestToolWrite.ts` implements correlation and a 1500ms timeout, but source inspection is not a delayed-reply test. Timeout means outcome unconfirmed; it cannot prove the business write did not occur.
5. **P1 — nonexistent Calendar date can commit with success.** Parent independently reproduced create and update of `2026-02-31` with the real subscribers: **2 correct FAIL**, evidence commit **dd10cb8**, `../web-ai-calendar-invalid-date/review.md`. This review read the evidence without rerunning those tests. Regex plus `Date.parse` does not prove a real civil date; the stored string remains invalid. The defect predates daff8ef, but it blocks the full AI-02 business-success claim and must not be moved entirely out of scope into CAL/REL-11. A bounded persistence-acknowledgement verdict remains distinct from complete semantic validity. Add the A1 repair below before durable work. Other argument semantics requiring checks include create fallback for explicitly malformed date/time, nonfinite duration, and silent clamping that differs from the confirmed operation. Tasks creation defaults unknown buckets/tags. Defaults for genuinely omitted optional inputs may remain only when they match the confirmation contract.
6. **Secondary canonicalization and malformed-state risk:** current signature uses `JSON.stringify(operation)` and therefore property insertion order, rather than a canonical validated operation. Malformed existing storage must never silently become a seed and overwrite original bytes during the format migration.
7. **Documentation and compatibility:** subscriber comments still describe old bounded useRef sets. The request owner/attempt fields remain optional for trusted legacy in-process callers; AI itself always supplies both. That compatibility is not authorization for an old AI owner to be rebound to a new account. No untrusted plugin boundary is claimed for the in-process event bus.

## Approved next implementation architecture

Use a **versioned canonical envelope inside each existing account-owned physical key**, separately for `xai_task_cols` and `xai_calendar_events`:

```ts
type CanonicalCommandState<T> = {
  format: 'xai-command-state';
  version: 1;
  revision: number;
  data: T;
  receipts: Record<string, {
    operationVersion: 1;
    signature: string;
    result: { ok: true; targetId: string };
    committedAt: string;
  }>;
};
```

This is an implementation contract, not code already present. Receipt identity is channel plus requestId within the account's persisted dataset. Validate length and use safe own-property lookup/keys (including `__proto__` cases); do not accidentally turn receipt IDs into object prototypes. Signature canonicalizes validated semantic fields, preserving array order where meaningful and sorting object keys; omit requestedAt, attemptId and runtime owner epoch. Reject a changed operation for an existing identity. Receipt scope follows the account dataset; transport scope still uses the currently captured kind/accountId/generation/epoch. Copying a dataset into a new authorized account generation must preserve its receipts, rather than treating a generation migration as permission to replay mutations.

The durable command does the following while holding the common lock for the physical key:

1. Recheck captured owner, deletion tombstone and committed-generation marker after acquiring the lock. Read the current canonical record with a **result-bearing** reader that distinguishes absent, valid legacy, valid envelope, corrupt, unsupported, and storage unavailable. No corrupt-to-default write path.
2. Find the receipt before checking whether the original target still exists. Identical committed operation returns the saved result without changing data/revision/timestamps; a conflicting signature returns request-conflict. Fresh delete of a missing ID still returns not-found.
3. Validate the operation and current domain schema. Compute mutation from the current data, or reject a stale UI snapshot by revision/domain baseline. All validation and computation occur before storage mutation.
4. Add success receipt and resulting data to one envelope, increment revision, encode and **setItem exactly once**. Quota/denied storage means neither data nor receipt committed. Do not publish success before that single write returns.
5. Publish the ordinary domain-change notification and correlate the business reply to the current attempt. If the reply is lost after commit, a later attempt finds the receipt. Keep a bounded in-flight optimization only if its correctness does not depend on page lifetime.

Ordinary UI writes use the same canonical writer and preserve the latest receipts read under the lock, even when their domain snapshot contains no metadata. `getPref/usePref` continue exposing domain data to read-only consumers; `readRawPref` continues meaning actual persisted bytes. Add an explicit decoded snapshot/revision API for conflict-sensitive callers rather than silently redefining raw data. StorageEvent decoding must use the same keyed envelope decoder as initial and same-tab reads.

Use the existing supported-browser Web Locks approach for this localStorage design, with **all writers of each canonical key** acquiring the same named exclusive lock. Lock bodies perform the final read/validate/write without unrelated awaited work. Web Locks unavailable means visible failure, not an unlocked fallback. Introduce a targeted async canonical command/set API and adapt affected UI recovery callbacks to await committed results; do not return boolean true before a Promise resolves. Legacy synchronous `setPref` must not remain an uncoordinated bypass for these keys once the concurrency stage is enabled. Unrelated preference keys retain their existing contract.

If lock participation cannot be completed cleanly, stop the migration stage for architecture review; an IndexedDB transaction over one domain+receipt record is an alternative that also requires adapting every writer. Merely changing the storage backend does not fix stale UI snapshots. There is no approval here to silently keep a two-key journal or implement AI-only locking and call it complete.

Cross-tab coordination for these two domains is an AI-02 prerequisite for the claimed idempotency guarantee. It is **not closure of full REL-08**, which requires inventory and real-browser acceptance for every affected whole-object store across the product. The parent retains REL-08 as a separate full-scope item.

## Compatibility, retention and lifecycle rules

- Valid legacy Tasks arrays / Calendar event maps read without migration writes. The first successful write upgrades domain data and a receipt together. Quota failure preserves the exact legacy bytes. Envelope recognition uses an explicit marker/version and validates domain plus receipt shapes; unknown versions and corrupt records remain recoverable and unwritable.
- Delete receipts are retained in the envelope even when the final entity is deleted. They are operation records, not fake task/event entities. Do not use an entity ID as a fake event to carry metadata.
- Ordinary delete-all/reset clears domain data through the canonical writer but retains committed receipts. If a product action deliberately creates a new dataset, it must also invalidate old pending commands and explain that boundary. Never silently reset receipt history to recover storage capacity.
- No TTL/LRU eviction that permits an old identity to execute again. Enforce explicit record/byte capacity and reject new commands before mutation; known receipt replay must still work at capacity. A future pruning design needs retained rejection tombstones or an explicit, enforced expiry contract, not just a smaller cache.
- Account raw recovery export keeps the whole envelope and its original bytes. User-facing task/event export projects only domain data and documents omissions. Backup/restore, migration validators and Undo must distinguish these formats; do not strip receipts during an ordinary same-account dataset migration. Unknown future format still exports as raw recovery data.
- Account deletion removes owned receipt-bearing records with the rest of the account namespace and preserves the account deletion barrier. Waiting writers must recheck that barrier after lock acquisition. Import/rollback/reset paths must coordinate with active command writers; generation checks and restore locks need evidence, not assumptions.
- An old app tab that does not understand the envelope must not silently overwrite it. Include stale-version/tab upgrade handling in rollout tests; do not claim all writers are coordinated while an active old writer still bypasses the protocol.
- This is local Web account storage work. It does not activate the paused account cloud-sync module or promote anything to Desktop. D3/D4 and release gates remain separate.

## Implementation phases and exact ownership

The parent assigns one Terra implementation owner at a time; Sol remains a non-author verifier. No parallel edits to shared storage or the same package. Current Board workspace files remain owned by its existing Terra worker. `taskLinkCommand.ts` is a separate file but any subsequent Board module edit requires explicit handoff from that worker.

| Phase | Terra-owned product surface | Required handoff before next phase |
|---|---|---|
| A: freeze receipt phase | Existing daff8ef only unless Sol finds a bounded blocker; core events, event-bus toolWriteReceipt, AI requestToolWrite/AiChatModule, four subscribers | Sol fixed-hash native/correlation results; leave AI-02 open |
| A1: Calendar semantic validity | Calendar create/update subscribers plus shared pure civil-date validator in Calendar; AI toolRegistry only if it silently rewrites explicit invalid input before validation | Preserve dd10cb8 original 2 FAIL assertions; invalid month/day and non-leap Feb 29 refuse without writes, valid leap day passes, rejected request ID can be corrected and retried once; no implicit success for a changed confirmed operation |
| B: canonical representation and compatibility | `plugin-web-storage/src/internal/{storage,usePref,registry,accountMigrationValidation}.ts`, new keyed envelope/snapshot codec, public index; Tasks/Calendar accountMigration validators; Calendar `eventStore/useUserCalEvents.ts`; Board `internal/taskLinkCommand.ts`; direct raw consumers found by parent inventory | Legacy/envelope roundtrip, unknown/corrupt refusal, same-tab/StorageEvent projections, exact raw export/restore, ordinary writer preserves receipts; no tool enables envelope until all affected readers/writers are compatible |
| C: durable six commands | event-bus helper interface and four domain subscribers; domain validation/canonical signatures; AI requestToolWrite transport only as needed | Six original lifecycle FAIL assertions become PASS, reload and crash-after-commit replay including last-event deletion; missing/invalid/quota still fail truthfully |
| D: concurrent writers | Targeted async canonical API; TasksModule seed/normal save/recovery callbacks; Calendar CRUD/recovery callers; Board taskLinkCommand caller if signature becomes async; generic reset/import/rollback pathways touching these keys | All same-key writers share lock, no sync bypass; two real tabs interleave AI/AI and AI/UI commands with no lost data/receipts; unavailable lock and stale-owner wait fail closed |
| E: final reconciliation | Tasks/Calendar/AI/event-bus API/design/test docs; storage lifecycle docs and audit evidence, assigned exact paths before edits | Sol complete acceptance plus Astra full-scope review; parent updates ledger only if all AI-02 gates pass |

Phases B-D may need one integration branch/change set because there must not be a shipped intermediate state where envelope metadata reaches old readers or bypass writers erase receipts. Commit boundaries can still be small and reviewable, but a commit alone is not deployability. Each phase records its own partial status. The precise list is refined using `../web-canonical-receipt-migration-inventory/review.md` and the actual diff before implementation; grep matches are not completeness proof.

Known direct domain/raw adaptation points verified by this review: `usePref.ts` decodes StorageEvent.newValue directly; Calendar `useUserCalEvents.ts` compares parsed raw bytes against projected events; Board `taskLinkCommand.ts` parses Tasks raw bytes then requires identity equality from loadTaskColsOrSeed; accountMigrationValidation validates decoded raw through domain validators. TasksModule performs a seed/legacy normalization write plus ordinary writes. Read-only projections that must regress: AI contextProvider, Statistics, Mail/MiniCal/Upcoming/StatTasks, CmdK, StickyComposer and Board task linkage. Generic export/delete/reset/rollback enumerate keys without naming them literally and must be audited separately.

## Full AI-02 acceptance matrix for Sol, then Astra

All checks use a fixed author commit and preserve correct earlier FAIL assertions. Native evidence uses an isolated browser profile and real storage; a synthetic provider is labelled synthetic and its outgoing tool_result is captured. A provider production check, if used, remains a separately labelled evidence layer. Count independent scenarios, not sums of overlapping package test totals.

1. **Six operations:** Tasks/Calendar create/update/delete, correct target/value/count, native raw final data, and exactly one bounded model continuation containing the matching tool_use_id only after committed success. Include delete of the last Calendar event and Tasks target in the documented valid state.
2. **Failure truth:** quota, denied get/write access, corrupt/unsupported records, empty/illegal ID, missing ID, invalid patch and no subscriber never emit successful model feedback or lose original bytes; confirmation and retry remain usable. Include nonexistent civil date/non-leap Feb 29 refusal, valid leap-day control, invalid input followed by corrected same-ID retry, and exact confirmation-to-committed time/duration. Restore storage and retry original identity to commit once.
3. **Correlation/lifecycle:** wrong request/channel/owner/attempt replies do not finish the current attempt; late attempt 1 during attempt 2 is ignored; timeout after a real commit retries through the saved receipt; duplicate Confirm/StrictMode/subscriber remount cannot execute twice. Unmount and A→B/locked/deleted account while waiting clean up, never write to the new account or report old success there.
4. **Durable replay:** all six operations after actual browser reload/new tab and same-account reactivation; same bytes/revision/target on replay. A replayed update preserves a later user edit; a replayed delete succeeds with the target absent; fresh-ID delete of missing target fails. Same identity plus changed operation conflicts even after reload; semantic property-order equivalence does not conflict.
5. **Commit interruption:** deterministic interruption immediately before the single canonical write leaves old data and no receipt; immediately after the write but before reply leaves new data plus receipt, and retry performs no second mutation. Do not use two independent setItems in the test and call them a transaction.
6. **Concurrent native tabs:** synchronized barriers exercise same-ID duplicate create/update/delete, different-ID concurrent additions, UI write vs AI receipt, Tasks seed/normalization, Calendar edit and Board task-link. Inspect final entities and receipts from a fresh read in both tabs. Conflict rejections are visible and recoverable. No deletion resurrection, no lost record, no receipt loss. Apply equivalent checks to import/reset/rollback or explicitly keep those blockers open.
7. **Schema/lifecycle:** valid legacy data, new envelope, unknown version, invalid JSON, malformed receipts, capacity, migration/Undo/restore, actual downloads, account erase and old-version writer behavior. Assert domain consumers neither display/count metadata nor reject legitimate saves because raw envelope differs from projected data.
8. **Regression and final review:** appropriate full package suites/typechecks/lint and affected Web integration; rerun existing Board TASK-02 partial-write/link identity and REL-05 Tasks/Calendar recovery assertions. Astra reviews all outstanding findings and required scope before recommending AI-02 closure. No automatic REL-04/05/08 or release closure.

## Board workspace lightweight plan review

Read `web-board-workspace-save-fix/CHECKPOINT.md` and the paused hook. Captured owner, stable candidate ID, preserving editor on failed boolean result, raw baselines and empty/non-last deletion are a reasonable bounded design. No architecture reversal requested. Terra was advised to verify rename onBlur versus Retry/Export/Discard; export of latest rename after external target deletion; null/string-codec normal pick and failed retry; same mounted hook A→B rejection; and Discard restoring real operability. Raw preflight is not a cross-tab transaction. This is a lightweight source review, not independent acceptance of the evolving Board implementation or full REL-05.
