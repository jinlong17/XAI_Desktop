# Dv1 Dashboard device position — final bounded acceptance

Astra, Web, 2026-09-09. Final fixed product **830dd2b659cc053a566b3401b710c10441647bba**, superseding the initial-source repair a572381. **Accept the complete defined Dv1 portion of [9f1b20a](../web-d2-device-autosave-contract/contract.md)**: coordinated device position gestures, preserved account-note behavior, recovery/export, and strict source feedback. The earlier [gesture rejection](review-76edb0c.md) and [source-feedback rejection](review-68ea7a3.md), their raw failures and scheduling diagnostics remain unchanged. No residual issue is requested for this bounded slice.

## Independently executed fixed evidence

All executions use immutable full repository archives and archived workspace source aliases. No author output, dirty product or fallback save implementation is substituted. The original source three, device thirteen and account-note eleven assertions were not changed.

| Layer at final 830dd2b | Result / raw log |
| --- | --- |
| Original source feedback | **3/3 PASS**, [log](source-feedback-astra-final-830dd2b.log) |
| Original device gesture contract | **13/13 PASS**, [log](independent-astra-final-830dd2b.log) |
| Original accepted account-note regression | **11/11 PASS**, [log](account-note-astra-final-830dd2b.log) |
| Original full Dashboard package | **24 files / 215 tests PASS**, [log](package-astra-final-830dd2b.log) |
| Fixed package types with archived dependency paths | **PASS**, [log](independent-830dd2b-dashboard-types.log) |
| New 830-specific Reload/old-completion oracle | **1/1 PASS**, [after](reload-pending-astra-after-830dd2b.log); identical assertion at a572381 **correct FAIL**, [before](reload-pending-astra-before-a572381.log) |

The separately preserved a572381 source3/device13/account-note11 logs are passing evidence only for that earlier revision; they do not replace final 830 execution. Terra's added test-only commit 0027a6c and author db5041f explain the Reload interleaving; they are not included in the above 215 package count. The new [independent Reload fixture](reload-pending.test.tsx) uses the existing name/mode-aware lock manager and explicitly waits for release and the old callback to settle.

Use [verify-fixed.mjs](verify-fixed.mjs) with a fixed revision, mode `source-feedback`, `independent`, `account-note`, `reload-pending` or `package`, and a fresh suffix. [run-types.py](run-types.py) accepts the fixed revision. New modes never alter the prior test files or old logs.

## Source repair review

`offsetSourceIssue` now propagates invalid/unavailable source metadata into effective recovery; error metadata is also included. JSON null/read failure therefore does not masquerade as a healthy default. Original bytes receive no application write. Truly absent position remains healthy/defaulted without a seed or alert. The new Reload note position action calls the accepted hook's read-only `meta.reload()`, never edit/reset/remove.

The final 830 follow-up detaches the active offset operation before Reload and records that exact operation in an ignored-settlement set. The old callback consumes its own marker and cannot restore an obsolete error or mutate the new controller's display. It does not blanket-clear previously failed operation/token state. Ordinary unchanged Retry retains its original hook retry; new intended values retain normal baseline checks.

The independent new sequence seeds JSON null, holds the real logical device-key fixture lock, then performs an actual moved gesture/pointer-up. Explicit Reload cancels that queued old attempt. A deliberate external fixture repair sets the source to 80, followed by a second explicit Reload. After releasing the old lock and waiting for its completion, final 830 keeps physical 80, visual 80px, no alert and **zero application writes**. At a572381 the old completion reintroduces the alert; this is why passing initial-source tests alone did not justify accepting a572 as the final product. External repair bytes are fixture setup for the recovery scenario, not a replacement for a user save.

The previously accepted gesture repairs remain intact: active moved gesture participates in unsaved state; only a matching verified local predecessor advances a later gesture's captured raw; newer desired coordinates are not overwritten by earlier completion. External raw mismatches still refuse, and device mutation still has no account admission dependency. Shared hook/engine source is unchanged in this repair chain; no new protocol or activation claim is made.

## Complete Dv1 contract disposition

| Dv1 requirement | Accepted evidence and boundary |
| --- | --- |
| Device ownership/physical JSON key | Same unscoped `xai_pref_dashboard_header_note_x`; finite-number validator and existing numeric presentation clamp. No registry/ownership change or conversion to an account key. |
| No default/normalization write | Original parent no-mount assertion, native integration, source absence control and resize tests. Absent/default differs from JSON null or read failure. |
| Explicit gesture persistence | Pointer movement only changes local desired/visible position; moved pointer-up/cancel submits final value; no-move click writes nothing; post-drag click suppression preserved. |
| Physical-key wait and account independence | Parent original key-lock/account-switch cases plus independent pending A→B→locked and unrelated held account-lock controls. Device operations are not cancelled by account changes. |
| Gesture baseline and succession | Dirty event/non-event replacement and queued replacement refuse without overwriting; two submitted gestures and first-commit/second-open-gesture interleavings preserve latest intent and valid predecessor base. |
| Resize behavior | Clamp is presentation-only; expansion restores desired coordinate; neither resize nor prior completion seeds or overwrites the device source. |
| Async failure and uncertainty | Quota retains latest second gesture; actual Retry persists latest; own uncertain unchanged retry uses one physical write; external replacement defeats uncertain retry. No blanket rebase or fallback write. |
| Recovery/source | Initial invalid/unavailable alert plus healthy absence control; explicit read-only source Reload; ignored old settlement after Reload; source bytes preserved. |
| Export and unload | Actual Blob includes latest offset and safe note; source/account-note regression preserves failed export behavior, owner restrictions and format. Dirty gesture, pending/error/conflict and newer work retain unload guard; verified clean completion clears it. |
| Account note and existing header | All original independent eleven note cases and original package assertions pass, including account masking, failed Clear, normalized latest Retry, frozen raw, unchanged token, old-account Export refusal, general header/drag/language behavior. |

Parent native evidence remains separate from these component executions. Parent **4138ddb** verifies a572 initial invalid/unavailable recovery with actual Chrome, explicit Reload to 80, visual80 and zero application writes, plus its native five/four page reloads. The parent's final 830 raw logs were also inspected: [invalid](../web-d2-device-source-native/native-830dd2b-invalid.log) and [unavailable](../web-d2-device-source-native/native-830dd2b-unavailable.log) both PASS with appWrites0; [device integration](../web-d2-device-offset-native/native-830dd2b.log) has five PASS and four saved-position Page.reload checks. They are parent executions, not mine. No whole-process survival of an unsaved gesture or production/old-client lock guarantee is inferred. The earlier 76 expanded native overlap timeout was recorded by the parent as a diagnostic limitation; it is not used as evidence of a product failure here.

Dv1 can release its caller ownership for the next approved Dv2 implementation. **Dv2 Pomodoro's six device preferences remains open** with its own existing before oracles. This acceptance does not complete indirect/direct writers elsewhere, timer active/history, global reset/providers, old cached clients, full D2/AI-02/REL-05 or all Dashboard product gates. No product, parent evidence, ledger, deployment or push was changed by this review.
