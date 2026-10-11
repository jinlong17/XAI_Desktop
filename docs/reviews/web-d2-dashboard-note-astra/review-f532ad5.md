# Dashboard account note caller — independent bounded review

Astra, Web, 2026-09-09. Fixed product **f532ad5923fb459bce73c0471d31a43aa62dc73d**. Scope: [9aac0ea caller contract](../web-d2-dashboard-note-contract/contract.md). **Not accepted yet: three caller defects remain.** The accepted shared engine/hooks are not reopened; no product or ledger was changed. Parent's subsequent CSS work is outside this fixed behavioral review.

## Independent evidence and provenance

I read the fixed caller source, diffed both original test files against 9aac0ea, and executed the actual `DashHeader` in an immutable full repository archive. Workspace imports resolve to that archive; node_modules supplies dependency runtimes only. The independent lock fixture queues by actual lock name and shared/exclusive mode. It does not replace the storage engine or hook. Existing package tests retain their own immediate-lock fixtures; those are not native concurrency evidence.

| Layer | Result / raw evidence |
| --- | --- |
| New actual-component contract cases | **8 PASS / 3 FAIL**, [original raw log](independent-astra-f532ad5.log), [unchanged assertions for repair](contracts.test.tsx) |
| Parent's original account-lock and absent-mount assertions, executed by Astra | **2/2 PASS**, [log](original-parent-astra-f532ad5.log) |
| Original Dashboard package, executed by Astra | **24 files / 212 tests PASS**, [log](package-astra-f532ad5.log), including original recovery four, header sixteen and author operation four |
| Fixed package type check with archived workspace paths | **PASS**, [log](independent-f532ad5-dashboard-types.log) |
| Parent native, separate execution | Parent **9106bd3** records fixed f532ad5 four initial cases and four whole-Chrome reopen checks PASS, PID 57507 → 57598. [Raw native result](../web-d2-dashboard-note-native/native-f532ad5-final.json): held account lock, absent mount, quota/latest retry, uncertain unchanged retry (one physical write). Old c793 uncertainty FAIL remains preserved. This is attributed parent evidence, not my native execution. |

The first three component logs were emitted before the runner added a full-hash header; their revision `f532ad5` resolves to the full immutable hash above. No source overlay was applied. Reproduce with `node docs/reviews/web-d2-dashboard-note-astra/verify-fixed.mjs f532ad5` and `python3 docs/reviews/web-d2-dashboard-note-astra/run-types.py f532ad5`; use a fresh fourth-argument suffix when rerunning so the original before logs remain intact.

## Three confirmed defects and minimal repair ownership

All three belong to `packages/xai-web-dashboard-grid/src/DashHeader.tsx` plus its focused tests. No shared hook/engine API change, key ownership change or device writer migration is needed.

### P1 — frozen A recovery still displays A's committed text under B

Actual sequence: A contains `Original A`; open the editor, type `Secret A draft`, Save while A's account lock is held, activate B and seed B's own note. The draft textbox is hidden, old Retry/Export refuse, both accounts' physical bytes are preserved, and unload protection remains. **However, B's visible header still contains `Original A`.** The test deliberately checks both masking and persistence; only masking fails.

Source: the account effect (lines 228–236) sets `frozenSession` and exits editing, but leaves `committedNote` attached to A. The clean projection effect (lines 225–227) is blocked by the retained old `sessionRef`, while the display branch (lines 472–480) renders `committedNote` unconditionally. This violates the contract's account-display isolation even though the engine correctly refuses the old queued write.

Repair: separate owner-bound recoverable A state from the current-owner rendered display. Mask every A note string on account/epoch mismatch while retaining its inert unsaved session and unload guard. Continue refusing the old recovery actions under B; do not fix display by discarding A's unsaved state or granting its export to B. Current-owner display may use B's verified projection or a neutral placeholder. Preserve normal clean A→B editing (independent control passes).

### P2 — position-only failed recovery cannot export

Actual sequence: mount a valid note without opening its editor; drag device offset to 90 while injecting only its setItem failure; click the existing Export note draft recovery action. **No Blob is created; Export fails.** The expected existing-format export is `{version:1, kind:"dashboard-note-draft", note:"Original A", noteOffset:90}`. This is a regression of the shared recovery action, not a request to convert the device writer.

Source: export at lines 509–512 requires `sessionRef.current` even when only offset persistence failed and the user has never started a note edit (or a note edit already completed). A note editor session is not the only legitimate recovery context.

Repair: capture/validate an appropriate owner-bound export snapshot for the no-active-note-session case while exporting the latest offset and current-owner committed note. Retain strict old/frozen-account refusal when a note recovery session exists; do not simply remove all owner checks. Keep filename, JSON format, failure-retains-draft, object-URL error behavior and existing device raw conflict rules. Do not acquire account ownership for the device key.

### P2 — changed-draft Retry bypasses existing normalization

Actual sequence: fail note Save on quota, type `  Latest    text  ` into the retained editor, restore storage, click Retry. **The write succeeds and closes the editor with exactly those unnormalized bytes**, instead of existing explicit-save result `Latest text`.

Source: ordinary Save/Enter/blur call `normalizeHeaderNote` at lines 350–353; Retry directly submits `draftRef.current` at line 368. Before this migration Retry used the normalized save flow. The contract explicitly preserves whitespace collapse/trim and the 120-character submission rule.

Repair: apply the same submission normalization when Retry represents a changed draft, update the visible submitted draft consistently, and use an ordinary new hook edit for that changed intent. The unchanged failed operation must still use its original hook retry/token; normalization must not transfer an old uncertain token to changed text. Preserve the parent one-write uncertain-retry PASS and the external-baseline refusal controls.

## Whole defined caller contract assessment

| Existing requirement | Assessment at this revision |
| --- | --- |
| Account string content; device JSON offset separate | Source and tests align; device remains legacy and its absent mount may write `0`. No account/device atomicity claim. |
| Explicit Save/Enter/blur, string Clear, no account mount seed | Original parent two and package controls PASS. Clear writes empty string, not remove. Initial/changed-source checks are strict reads; no note autosave mount effect exists. |
| Normalization and length | General Save test PASS; changed Retry defect above remains. |
| Pending editable/newer intent/duplicate events | Independent duplicate Save+Enter+blur yields one note write and truthful unload state; newer explicit submission while first is queued reaches `Second`; Clear→new text retains editor and warning then saves that text. All PASS. |
| Operation/session result ownership | Completion is gated by the active operation object and session/text match; newer draft advances only to the earlier verified result baseline. Independent pending and repeated-submit controls PASS. Escape pending passes original author test rerun; unsubmitted Escape→external update→fresh reopen/save independently PASS. |
| Frozen editing raw; external changes before/inside lock wait | Dirty storage event cannot rebase local draft; locked queued external replacement preserved; both independent PASS. Original author's no-event external replacement also PASS in package. |
| Actual async result and failure | Results and Promise rejection handlers feed failure recovery rather than boolean truthiness. Original quota/latest, failed Clear and pending tests independently pass as part of package. No fallback sync note write. |
| Uncertain unchanged Retry | Caller exception delegates reconciliation to accepted engine token; author test rerun PASS and parent native before/after + one-write/reopen evidence PASS. Changed/external writes continue through normal locked baseline validation. |
| Accounts | Old queued write/export refusal PASS and normal clean B editing PASS; frozen A committed display FAIL above. |
| Recovery export | Dirty note conflict exports inspected Blob with latest note/offset and expected format; injected URL setup failure preserves text/unload guard. Both independent PASS. Position-only context FAIL above. |
| beforeunload | Independent dirty/pending/newer-after-Clear/export failure/frozen account guards PASS; clean duplicate completion clears warning. No crash-durable unsaved-draft claim. |
| Legacy position behavior and general header | Existing position quota/latest retry/external raw refusal, drag behavior, greeting/date/language/add actions remain in independently passing package. Original test diff only adds valid markers/async lock fixtures and moves checks into actual awaited completion; business/raw assertions were not deleted or replaced with simulated saves. |
| Native and visual | Parent native four + process reopen four preserve their exact scope. CSS/target findings and repair belong to the parent/Terra visual review; neither component jsdom nor CSS-free native evidence proves those. |

## Minimal acceptance chain after repair

Rerun this exact eleven-case file with new log suffix: the three failures must turn green while all eight controls remain. Retain original parent two, the original recovery/header/operation tests, package types and package regression. In particular, keep old-account Retry/Export refusal, unchanged-token one-write Retry, and no implicit raw rebasing; do not repair the failure by weakening those checks. Parent's native probe can confirm integration after the fixed repair; native account masking or export probes are useful only for these repaired boundaries, not grounds to widen the product scope.

This fixed revision is rejected for the defined **account-content caller plus preserved existing recovery behavior**. Shared async-pref acceptance stands. Device offset conversion, other Dashboard persistence, all remaining D2 writers, old-client activation, full D2/AI-02/REL-05 and product-wide Dashboard acceptance remain separate work.
