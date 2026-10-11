# Dv1 Dashboard device position — independent review

Astra, Web, 2026-09-09. Contract: [9f1b20a](../web-d2-device-autosave-contract/contract.md), Dv1 only. Fixed product **76edb0c9b36ca7afee327e095840124ef208a94a**. **Not accepted: two gesture ownership/recovery defects remain.** The account note acceptance and shared async hook/engine acceptance stand; Dv2 Pomodoro has not been implemented or reviewed by this task.

## Fixed executions

The [runner](verify-fixed.mjs) creates full immutable git archives, aliases all workspace product imports to them and adds only this independent [13-case fixture](contracts.test.tsx). Actual `DashHeader`, real jsdom Storage and the existing name/mode-aware lock manager run; the hook/engine is not mocked. No dirty product was used. DOM geometry is deterministic; this is component evidence, not native browser evidence.

| Layer | Result |
| --- | --- |
| Final identical 13-case fixture at legacy cbbbd8a | **10 FAIL / 3 PASS**, [before](independent-astra-final-before-cbbbd8a.log) |
| Final 13-case fixture at 76edb0c | **2 FAIL / 11 PASS**, [after](independent-astra-contract-final-76edb0c.log) |
| Unchanged independent account-note eleven at 76edb0c | **11/11 PASS**, [log](account-note-astra-after-76edb0c.log) |
| Original Dashboard package at 76edb0c | **24 files / 214 tests PASS**, [log](package-astra-after-76edb0c.log) |
| Fixed package types with archived workspace paths | **PASS**, [log](independent-76edb0c-dashboard-types.log) |

Parent **083d83d**, separately executed: original component three PASS, native offset three + two persisted page reloads PASS, account-note native four + whole Chrome process reopen four PASS (PID 68533 → 68601), and actual position-only download PASS. These are parent evidence, not my execution; do not sum their counts into a coverage claim. Their scenarios do not cover the two failures below.

Exploratory logs remain intact: [initial legacy twelve](independent-astra-before-cbbbd8a.log), [initial new twelve](independent-astra-after-76edb0c.log) and [properly settled twelve](independent-astra-settled-76edb0c.log). Two initial post-write unload assertions observed the interval between physical commit and async UI completion. The fixture was corrected only by awaiting `flush()` after the successful raw write in cases 1 and 8; their business assertions were retained. The settled twelve show one real failure. Case 13 then tests the existing contract's other necessary interleaving: an earlier commit while the next gesture is still collecting movement, rather than both gestures already submitted. Both final before and after run the same thirteen assertions. These early scheduling artifacts are not reported as extra product defects.

Reproduce: `node docs/reviews/web-d2-device-offset-astra/verify-fixed.mjs <fixed-hash> independent <fresh-suffix>`; modes `account-note`, `original-parent`, `package` are also available. `run-types.py <fixed-hash>` performs fixed package types. Never overwrite the original logs.

## P2 — a moved, unsubmitted gesture lacks beforeunload protection

Case 1 begins a drag and moves 20 then 40 pixels without pointer-up. The new correct behavior keeps physical bytes at `0` and visibly shows 40. **beforeunload is not prevented**, even though the latest position exists only in this page. The exact assertion is `expect.soft(unload()).toBe(true)` before `finish(...)`. On pointer-up, the single final write and clean completed recovery checks pass.

Source: `DashHeader.tsx:208–212` computes offset unresolved state from an active submitted operation or issue, omitting a moved current gesture. Lines 229–234 therefore install no guard before submission. Moving state exists but does not participate in unsaved detection.

Minimal repair: include a moved, still-active gesture in the position's dirty/recovery state and notify React when its status changes. Retain the warning through pending, failure/conflict and newer gesture work; clear only after current state is actually verified or deliberately discarded. A click with no movement must remain clean. Do not change the new pointer-up/cancel persistence policy back to per-move writes just to suppress this failure.

## P1 — an earlier completion discards the newer open gesture's desired value and baseline

Case 13 holds the device key lock. Drag 1 submits 40. Before it commits, drag 2 begins from visible 40 and moves another 30, displaying 70, **without ending**. Release the lock: the first write correctly commits 40. A subsequent resize should keep the desired 70, and ending drag 2 should commit 70 against its verified predecessor.

Actual: the resize snaps visible position to **40px**, then pointer-up leaves physical bytes **40** rather than 70. The correct assertions are `ui.position() === "70px"` after resize and physical key `=== "70"` after the second gesture ends. The newer intended position is lost and the caller refuses its stale baseline; no external writer was involved.

Source: `settleOffset` at lines 367–379 unconditionally assigns `offsetDesiredRef.current = result.value` on first success, even while a newer gesture owns the visible value. Resize reads that overwritten desired ref. The newer `OffsetGesture.raw` remains the original `0`, so `submitOffset` later compares it against the verified first result `40` and refuses. This differs from the passing case 7 where both gestures were already submitted before release.

Minimal repair ownership: **only `packages/xai-web-dashboard-grid/src/DashHeader.tsx` offset gesture/operation state and its focused tests**, optionally its already-authorized local helper. Preserve the newer gesture's desired/visible coordinate and update its baseline only when a matching, verified local predecessor proves the transition. Record enough operation/gesture identity to distinguish this from an unrelated success, changed binding, failed predecessor or external raw replacement. Never generally rebase all gestures to current physical bytes. Keep strict physical/hook source checks before enqueue and the engine's locked baseline check. Preserve current clamp behavior, latest-position export and account-note recovery.

## Passing scope and remaining acceptance

The new implementation correctly removes the legacy effect and its account-dependent device reader. The fixed after controls pass pointer-cancel final commit/no click write; resize clamp/shrink/expand without writing; clean storage event adoption; dirty event and non-event external replacement preservation; queued external replacement refusal; two already-submitted gesture ordering; quota retaining latest second position with inspected JSON Blob and Retry; unchanged uncertain one-write reconciliation; uncertain Retry refusing external replacement; pending device write across A→B→locked; and device write proceeding while an unrelated account lifecycle lock is held. The no-mount/key-lock/clean-account-switch basics are independently covered by the parent's unchanged three.

The accepted account-note eleven remain unchanged and passing, including owner masking, old-account Retry/Export refusal, note normalization, uncertain token recovery and position-only export. The original package recovery test changed only its position setup to explicitly seed `0`, which is legitimate after removing mount seeding; quota/latest/external raw assertions remain intact. New cancellation/resize package tests pass. Storage source was not part of this caller change, and its prior accepted schema/lock/token guarantees are retained dependencies, not newly claimed broad verification.

Next acceptance is bounded: rerun this same thirteen-case fixture, keep the eleven passing controls, account-note eleven, original parent three and package/types. The two new assertions must pass without weakening external-baseline or owner protection. Parent native probes remain useful integration regressions; they do not replace these new interleavings. No further unrelated domain investigation is requested on this rejected revision.

No product, parent suite or ledger was edited; no push or deployment. Dv1 remains open pending these two repairs. Dv2's six preferences, the full direct/indirect writer inventory, active timer/history, global reset/providers, old clients and full D2/AI-02/REL-05 remain separate work.
