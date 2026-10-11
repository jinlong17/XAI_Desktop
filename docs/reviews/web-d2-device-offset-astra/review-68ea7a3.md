# Dv1 device position — gesture repair accepted; one source-feedback gap

Astra, Web, 2026-09-09. Fixed product **68ea7a35b8d0755c18f9d65c1c1bfcea43ae41c8**. The [b0b3016 two gesture defects](review-76edb0c.md) are independently repaired, with all original controls preserved. **Do not accept the complete [9f Dv1 contract](../web-d2-device-autosave-contract/contract.md) yet: one P2 caller source-feedback requirement remains, represented by two failing cases and one healthy-absence control.** This is not data overwrite and not a shared-engine failure.

## Fixed independent evidence

All executions below use immutable git archives with archived workspace source aliases. Author output was not used as independent proof. Original thirteen assertions are unchanged; their files/logs from b0b3016 remain intact.

| Layer | Result |
| --- | --- |
| Original independent gesture thirteen | **13/13 PASS**, [log](independent-astra-final-68ea7a3.log) |
| Original independent account-note eleven | **11/11 PASS**, [log](account-note-astra-final-68ea7a3.log) |
| Original Dashboard package | **24 files / 214 tests PASS**, [log](package-astra-final-68ea7a3.log) |
| Fixed Dashboard types | **PASS**, [log](independent-68ea7a3-dashboard-types.log) |
| Minimal existing-contract source feedback | **2 FAIL / 1 PASS**, [log](source-feedback-astra-final-68ea7a3.log), [three-case fixture](source-feedback.test.tsx) |

The runner gained only a separate `source-feedback` mode; it does not modify or weaken the thirteen-case fixture. Reproduce with `node docs/reviews/web-d2-device-offset-astra/verify-fixed.mjs 68ea7a3 source-feedback <fresh-suffix>`, or modes `independent`, `account-note`, `package`; types use `run-types.py`.

Terra's execution of the original thirteen was originally left in this directory; the author moved and committed that log as **8763c5e**. It is author evidence. My final-suffix executions above were separately run. Parent reports fixed real CDP gesture checks and saved reloads; those are integration evidence for their named cases and do not test this initial-source feedback branch. Earlier parent native/account-note/export evidence remains attributed as in the prior report, not merged into these counts.

## The two original failures are resolved

- `offsetGestureDirty` now participates in unresolved state. A moved gesture protects beforeunload before pointer-up; click/no movement remains clean. Completed current position clears the warning, while pending/newer/failed states retain it.
- On verified success, a still-active gesture baseline advances only when its raw matches the completed local operation's original raw. The old result no longer unconditionally overwrites a newer desired position. Active operation identity still governs clearing the current operation/error. Physical/hook raw comparison remains before submission, and the engine checks inside the key lock. The original first40→second-open70→resize→pointer-up70 oracle now passes; external replacement and uncertainty controls also remain passing.

Storage source did not change in this narrow repair. No new token capability, raw write fallback, account dependence or general external rebase was introduced. Account note remains independently accepted and its eleven regressions pass here.

## Remaining P2 — invalid/unavailable position source is silently presented as healthy default

The original 9f shared caller rules explicitly require: **“Invalid encoding/domain and read failure retain their raw bytes, show unsaved/source recovery, and cannot become absent initialization permission.”** The final source review found that `offsetSave.meta` is not reflected in the caller's unresolved/error state until a gesture or submitted operation sets local `offsetIssue`. This was not introduced by the gesture repair; it was previously untested caller metadata propagation.

The minimal cases render actual DashHeader without any user edit:

1. Physical device key is JSON `null`. It stays `null` and receives **zero writes** (passing protection). The shared hook classifies it invalid, but **no recovery alert appears** (failing caller requirement).
2. Physical device key contains `80`, and reads for that exact key throw. Original `80` remains and receives **zero writes** (passing protection). The shared hook exposes unavailable/error, but **no recovery alert appears** (same caller failure).
3. Truly absent device key: stays absent, displays the legitimate default without an alert. **PASS.** This distinguishes source error from healthy absence and prevents an indiscriminate error-on-default workaround.

Source evidence: `DashHeader.tsx` derives `offsetIssue` from local state initialized null, and combines pending/local issue/gesture dirty for `offsetUnresolved`. The accepted shared hook's `readSnapshot`/`initialView` correctly distinguishes `invalid`, `unavailable` and `absent`; the caller does not include these initial metadata states in recovery. An attempt to drag can eventually surface an error, but silently waiting for an unrelated user write does not meet the source-feedback contract.

### Minimal repair ownership and acceptance

Only `packages/xai-web-dashboard-grid/src/DashHeader.tsx` offset feedback/recovery wiring and focused tests. Reflect the binding's invalid/unavailable source metadata in effective device recovery status without converting the fallback into a saved value, mutating storage, or changing account-note errors. Allow an explicit source reread when there is no failed submitted mutation, using the existing hook reload mechanism if necessary; rereading a repaired source must not implicitly save/reset it. Keep true absence healthy. Do not turn Retry into a corrupt-data overwrite or physical remove action.

When a real failed mutation exists, preserve its current latest-draft/original-baseline/token retry semantics; do not blanket-reload and discard it merely to clear an error. Keep the newly accepted thirteen gesture controls and eleven account-note controls unchanged. The three source cases must pass at a fixed repair, plus necessary package/types. No additional unrelated test expansion is requested.

The current implementation still meets the independently verified coordinated gesture, no-seed, clean/dirty event, source-write protection, device A→B independence, unchanged uncertainty, export and account-note preservation assertions. The only newly reported refusal is **source recovery feedback**, not a reopening of the two gesture fixes or the accepted shared engine/hooks. Dv1 remains pending this narrow caller repair; Dv2 and full D2/AI-02/REL-05 remain outside acceptance. No product/parent test/ledger changes or push were performed.
