# Settings durable deletion — bounded independent acceptance

Astra, Web, 2026-09-09. **Accept the currently defined Settings durable-deletion slice at `a1f73c9143b533fb1f70466ca5148039fcdaa83e`.** This closes the remaining P2 from `ea6dc67` within the existing `0203c56` / `ea5ba0b` contract. It does not close full D2, AI-02, REL-05, ordinary provider coordination, old-client admission or any Board scope. No product, shared ledger or other review owner's files were changed; no push was performed.

## Final narrow repair and independent result

The product patch changes only the in-page recovery map key to include the captured physical `entryRaw`. Identical-token work can still share its Promise. A different raw token gets its own workflow turn rather than inheriting the obsolete operation's result. Entry raw capture, lock-after-entry comparison, complete-observation idempotence, generation-independent recovery → account ordering and later participant/phase checks are unchanged.

Fresh archive-only replay of the exact three entry assertions: **3 PASS**, `d2-settings-entry-snapshot-astra-a1f73c9.log`.

- Unchanged queued entry completes once.
- Replaced queued entry refuses, preserving replacement receipt/data and dispatching no secret/auth participant.
- With an old same-page operation active, a valid new raw request no longer shares its Promise (`sharesOldPromise:false`). The old operation rejects with oldAuth=0; the new operation completes with newAuth=1 and its own completed receipt.

The original 6bed035 FAIL/control logs remain unchanged. No assertion or fixture was edited in this final replay. The helper uses deterministic named shared/exclusive locks and synthetic participants; it is not presented as browser or external-auth execution.

## Evidence supporting the defined slice

This one-line fix completes the previously reviewed chain rather than restarting the audit. Astra's fixed b152399 review retained independent orchestrator16, slice7, package42 files/282 tests, foundation14, admission2, C29+8 and D1 shared8 PASS. Astra's fixed 6bed035 replay retained entry2, slice7 and orchestrator16 PASS, including independent-module completed idempotence. The previous eight repair groups remain accepted; the last active-map case now passes at a1f73c9. Author `3457632` reports its own final entry/slice/orchestrator/package regression; those logs are separate from this independent execution.

Parent independent `0eec9a7` verifies fixed a1f73c9 original consumer4 PASS, real Chrome native4 and whole-process reopen4 PASS (PID 19223 → 19287). The native cases cover held-account waiting, same-page and independent iframe recovery, queued-token refusal, captured account/IndexedDB separation and persisted receipt bytes. I read and attribute that evidence; I did not rerun it. Old native failures and intermediate passes remain preserved. It does not claim real server deletion/auth network delivery, arbitrary old-client cooperation or exactly-once crash side effects.

Within this defined scope the code and evidence establish: strict storage-owned receipt decoding and physical ownership binding; actual confirmed-server operationId/raw/captured A/auth admission including A→B; non-destructive unknown outcomes; account-wide local cleanup with receipt retention; complete only after local-data-cleared; marker conflict refusal and valid marker-missing retry; per-token in-page flight ownership and cross-context workflow serialization; raw checks across participants and phase publication; idempotent completed observation with account/domain locks released during participants. Failure/retry remains at-least-once for idempotent captured external cleanup after a crash, not a multi-store atomic transaction.

```sh
node docs/reviews/web-board-workspace-astra-review/verify-d2-settings.mjs a1f73c9 d2-settings-entry-snapshot astra
```

Use a fresh suffix for another execution. No further unrelated probe is required to accept this slice.

## Next minimum D2 logical batch — shared async hooks and one caller

The existing caller-owner checklist remains the starting inventory, not evidence of all-writer completion. Fixed a1f73c9 still exports synchronous `usePref` and `usePrefAutosave`: `usePref.ts` evaluates updater functions against a React ref, calls `setPref`, and exposes a void reset; `usePrefAutosave.ts` calls `setPrefAutosave` and returns a boolean retry. Their account writers therefore have not yet joined D2 coordination.

Before expanding writer conversion, the parent reports nine Board Task-link package failures in both the earlier author fixed snapshot 8105cc9 and later 99c36b0, potentially involving D2 lock/complete-marker fixtures. Their previously accepted product paths must not be assumed newly broken or dismissed as fixture-only without isolation. First assign a bounded pinned diagnosis to Terra/Sol: preserve the nine failures, adapt only genuine native-signature/marker initialization seams, and check actual Task-link business oracles; repair product behavior if a failure survives valid fixtures. This is attributed parent/author information, not a Board investigation or acceptance in this report.

Recommended next bounded batch after that regression is classified:

1. Add explicit Promise-result account-pref/autosave hook entry points and export them, preserving existing boolean/void signatures for unconverted callers. Use existing captured-owner/marker/tombstone account coordination; keep production coordinated admission closed. For functional read-modify-write, resolve against a validated persisted baseline under the necessary same-physical-key serialization, rather than calculating from a stale React ref before the lock wait. Canonical Tasks/Calendar keys must retain their domain-validated receipt-preserving engine or explicit refusal; a generic pref hook must not bypass it.
2. Give save/reset/remove/retry truthful pending/committed/refused outcomes. Only a matching latest operation can update saved status or clear recovery. Preserve the latest draft while a write waits; queued A→B, migration or deletion must refuse old-owner work. A failed reset cannot display a successful default. Autosave debounce/queued completion must not overwrite a newer draft or mark it saved because an older value committed. Publish same-tab state only from successful persistence and retain no-op behavior.
3. Convert **one concrete non-canonical Settings preference/autosave consumer** with visible pending/failure/retry behavior to prove the hook/caller contract end to end, then record its ownership in the checklist. This is the next logical implementation unit; do not globally change every hook caller to Promise semantics or claim the whole inventory converted.

Minimum acceptance for that batch: real hook plus selected rendered caller, deferred account lock, failed set/remove, old completion versus newer draft/reset, same-tab observers, A→B and persistent generation/tombstone changes, and an independently scheduled migration-versus-current-async-writer case. Retain the original migration/source comparison oracles and the now-accepted deletion tests. Then fan out to remaining indirect metadata/conversation callers, direct business writers, timer controllers and ordinary secret-store writers under their existing ownership contracts.

This is a next-batch recommendation only. No hook or new-domain implementation is performed here; current Settings acceptance must not be used as full account-writer/rollout admission.
