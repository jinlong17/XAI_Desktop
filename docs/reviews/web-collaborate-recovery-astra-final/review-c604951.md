# Astra independent final review — Collaborate at c604951

## Verdict

**CHANGES_REQUIRED for the complete existing Collaborate recovery contract.** One reproducible P2 aggregate-status defect remains. This is an actual Astra follow-up execution; it does not rewrite the parent review's historical authorship or the earlier runtime-unavailable report.

Product source was fixed to **c604951acda9adb48c51e00dba6255757b1f2afc** via `git archive`. Current App/host coordinator work and Pomodoro evidence were excluded. No product, parent evidence or audit ledger was edited. Full 312-item objective remains unchanged; this review closes neither REL-05, REL-09 nor D2 and does not approve release/production deployment.

Reviewed authority: `../web-collaborate-recovery-contract/contract.md`. Read and reconciled the parent's `../web-collaborate-recovery-independent/acceptance-c604951.md`, source, original independent assertions and English/Chinese native evidence. The broad passing behavior remains useful evidence, but does not override the new correct failure below.

## P2 — aggregate Saved appears while another field still requires source recovery

Location at the fixed revision: `packages/plugin-web-settings-rest/src/panes/collaboratePane.tsx:160-168`, especially the status condition `!hasCurrentDraft() && anySaved`.

Trigger:

1. `show_avatars` has invalid saved bytes (`invalid-boolean`) or its initial `getItem` throws `SecurityError`.
2. Mount Collaborate. Its invalid/unavailable field correctly offers read-only Reload and is not an actual user draft.
3. Change the healthy account `default_share` selector to `edit`; the independent account write succeeds.
4. The pane now displays **Saved** through `role=status` while the avatars field still displays **Saved value needs recovery. Repair storage, then reload.**

Expected: the pane must not present an unqualified aggregate Saved status while a field remains failed/unrecoverable. Preserve field-specific recovery and truthful success feedback when all fields are healthy. Contract authority: “Aggregate status must not say Saved while any latest field is pending or failed” and the presentation requirement to distinguish Saved from source recovery. This is a presentation/truthfulness blocker, **not observed data loss or an incorrect storage commit**. The successful sibling really persists and the invalid original bytes remain intact.

Cause: `hasCurrentDraft()` correctly ignores initial source failures, but the Saved condition incorrectly uses that absence as proof that the whole pane is healthy. `needsRecovery` already sees the unresolved field; the Saved branch ignores it. Invalid-source state must not be turned into a fabricated draft merely to suppress Saved.

Independent component results against fixed product: `additional-controls-c604951.log`, **2 correct FAIL + 3 PASS**. Both failure variants reach the intended aggregate-status assertion, after asserting actual account bytes, current source recovery, no invented export and no beforeunload warning. Positive controls verify:

- All three healthy real controls persist their exact values and still display Saved.
- Read-only repair plus Reload removes source recovery and can display Saved again, with **zero new writes** and the successful sibling untouched.
- A new valid edit clears a previous export-setup error while retaining the latest quota draft; Retry commits its exact latest value.

Independent native Chrome reproduction: `native-c604951-source-invalid.log`, Chrome **152.0.7977.83**, isolated profile and real Storage. Actual observation: `statuses:["Saved"]`; raw avatars/mentions/share bytes **["invalid-boolean", null, "edit"]**; visible source-recovery instruction plus Reload. Correct native assertion fails on the simultaneous aggregate Saved. Browser/server/temp profile are cleaned by the runner. This run verifies the invalid-source variant; denied-read is independently reproduced by the component test. It is not production/auth/network or crash-durability evidence.

## Passing contract areas independently checked

The complete original assertions were pinned at **69c7bcd**, then run against the immutable c604951 product. `contracts-complete37-c604951.log`: **37/37 PASS**. `host-c604951.log`: **8/8 PASS**. Host/fixture files are identical between c604951 and69c7bcd; original product-archive contracts contained31 cases, so the initial `contracts-c604951.log` is explicitly a31-case subset. The37-case rerun uses all six later independent completion assertions. Do not add31+37, or package/native layers, into a coverage total.

| Contract dimension | Astra source/oracle reconciliation |
| --- | --- |
| Three keys and ownership | Each real control uses its own registered async autosave hook; account share is separated from device booleans. Strict validators, absent no-seed, invalid raw preservation, forged share option refusal, same-document/two-pane and external projection have passing original assertions. No three-key atomicity is claimed. |
| Locks, latest intent, attribution | Original37 actually hold the relevant physical/account locks, run migration fencing, rapid toggles, failed-only single-flight Retry and equal-value successor failure. Per-field draft object identity prevents an older success from clearing a newer same-valued operation. Source status is the new uncovered case above. |
| Partial success and source recovery | Matching success clears only its own draft; failed siblings retain choices. c604951 discardAll filters actual current drafts before reload, preserving saved/untouched siblings. Original37 includes exact read-attribution and field-repair isolation. |
| Uncertainty | Original37 inject post-write readback denial and verify unchanged token Retry without another write, external replacement refusal, changed desired value refusal and device-token survival across owner transition. |
| Mixed scope and lifetime | Source retains separate device/account sessions and invalidates composite decision tokens on epoch change. Original37 plus host8 prove A→B/lock privacy, surviving editable device work, old capability revocation and new current device-only guards. No forced-unmount durability is inferred. |
| Export and unload | Source exports explicit memory-only current unsaved fields into exact account/device objects, checks the composite token at download boundary, and cleans anchor/URL. Original assertions cover setup failures, denial, stale callbacks, exact current-draft schemas and unload lifetime. Initial source-only failures correctly do not become drafts or unload warnings. |
| Actual host | Reexecuted real Composed/DataRouter8 covers first-intent route and sign-out arbitration, Back/Stay/discard, Escape/focus, sibling success and latest-draft success cancellation. It imports fixed c604951 host source, not the concurrently evolving coordinator. |
| Presentation and inherited regression evidence | Read native English five-width/full-CSS evidence at2a536c1, Chinese at53a4d96 and c604951 host departure/download. Directly viewed both375 screenshots. Recovery is within first viewport, wraps, and actions meet44px targets. Source diff2a536c1→c604951 changes only targeted discard in Collaborate across reviewed pane/style/label/host/App paths; labels/styles/host/App are unchanged. Parent's package/Smart/App regression logs remain separately attributed, not rerun or misrepresented as new Astra executions. |

Native English/Chinese/download layers are inherited evidence reviewed by Astra; the new native status failure was executed by Astra. All distinguish controlled local fixtures from deployed auth behavior. Parent's previous broad acceptance is now superseded **for current complete-contract acceptance** by this reproducible omitted case; previous observed passes and historical authorship remain valid.

## Required narrow repair and reacceptance

Terra may own only Collaborate's aggregate status logic and an appropriate focused author test. Gate an unqualified Saved status on no pending state, no current drafts and no unresolved per-field recovery/error/conflict. Reuse existing state rather than introducing a parallel status machine. Do not delete Saved entirely, change source ownership/defaults, invent user drafts, alter storage/host/auth, hide the error or mark failed source healthy.

Sol/non-author must run the exact final `additional.test.tsx` unchanged against the fix: both negatives become PASS and all three positive controls stay PASS. Reexecute the native invalid-source oracle against that exact fix commit. Preserve c604951 before logs. Rerun original37 and host8 once to ensure no recovery or departure regression; appropriate focused package/type/lint checks suffice for a narrow display predicate. Astra then reviews the fixed delta and the complete existing contract before recommending acceptance of this caller. This does not close the broader numbered items.

Reproduction commands, from root (each log filename is immutable; use a fresh fourth-argument suffix for repeated component runs):

```sh
node docs/reviews/web-collaborate-recovery-astra-final/verify-fixed.mjs c604951 additional controls
node docs/reviews/web-collaborate-recovery-astra-final/verify-native.mjs c604951 source-invalid
```

The first new component run's `additional-c604951.log` failed an overly narrow expected wording regex before reaching the intended assertion. That fixture mistake is preserved and **not counted as a product failure**. `additional-corrected-c604951.log` reaches both correct status FAILs; `additional-controls-c604951.log` retains them plus the full positive controls. The final test source uses the actual localized English source-recovery text. No business expectation was weakened.

All processes started by this review completed. Own new evidence lives only in this directory. No push or ledger change was performed.
