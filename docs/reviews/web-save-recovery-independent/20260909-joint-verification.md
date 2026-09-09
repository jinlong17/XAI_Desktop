# REL-05 independent joint verification — Tasks and Bookkeeping failed writes

Date: 2026-09-09. Module: web. Verdict: **PASS for the reviewed save-failure recovery scope**, with the limits below. No release/deployment approval or browser-close draft durability is implied.

## Baseline and execution

Reviewed Tasks/shared usePref fix `dd744f5` and Bookkeeping fix `9222519`. The final native browser bundle is built from immutable Git archive `9222519f52c1292a4556268803612e0a04da3b7c`, including both. Workspace package imports are pinned to this archive; installed third-party dependencies are reused. Source fixture is independent of the author probes. No product file or author test is changed.

```sh
node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-storage-write-results/independent-write-failure.config.mjs
node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-save-recovery-independent/joint-save.config.mjs
node docs/reviews/web-save-recovery-independent/verify-native-save.mjs
```

Results: original aff8175 component probe **2/2 PASS unchanged**; new independent joint component probe **13/13 PASS**; isolated native Chrome **PASS with three actual JSON downloads**. These counts describe these probes, not package-wide coverage, and are not added to author suite totals. The initial independent test's JSX runtime resolution error was fixed in its own config before collecting the passing component log; it was not a product failure.

## Coverage and observed business outcomes

| Area | Evidence and result |
| --- | --- |
| Original Tasks draft loss | Original probe now keeps composer open and retains rejected draft. Native Chrome then edits the failed title again, downloads the latest title, and saves exactly one task after storage is restored. Composer closes only after success. |
| Original Bookkeeping false committed state | Original probe retains budget 100 and device view detail after rejected canonical write. Proposed values do not appear as committed. |
| Bookkeeping record editor | Native canonical write denied: original bytes survive, entered note remains in a pending snapshot, workspace becomes inert and recovery panel receives focus. Actual downloaded JSON has exactly one proposed row with the note. Retry commits one new record and closes the failure state. |
| Multiple Bookkeeping editors | Independent components exercise ledger, account, categories, recurring and investment editors. Fields survive failures. Explicit discard preserves canonical bytes; retries write canonical once. |
| Pending proposal protection | Another proposed edit while Bookkeeping recovery is pending cannot overwrite the retained draft. Two immediate retries commit one transaction only. |
| Partial device mirrors | Independent native and component probes reject bills-view and calendar-mode mirrors simultaneously. Canonical budget 222 commits; successful dashboard-order mirror survives; failed mirrors remain old. Export explicitly says canonicalCommitted=true. Two retries repair mirrors without another canonical write or duplicate record. |
| Tasks detail | Failed save retains title, multiline notes and explicit due date. Retry persists exactly one matching task with all three fields. Failed deletion keeps the detail panel and persisted record. |
| Tasks metadata | List/tag editor failure keeps dialog and fields, does not publish failed metadata; retry creates exactly one entry. |
| Account replacement | Independent components cover stale Tasks detail retry/export and Bookkeeping retry/export. Native Bookkeeping pending actions after B activation neither download A data nor mutate A/B bytes. Failure is visible; synthetic B sentinels remain unchanged. |
| Narrow-screen recovery | Native 390px screenshot inspected. Bookkeeping alert is within horizontal viewport (left 16, right 374), visible at y592–820; retained editor remains behind the recovery panel. No clipped recovery text/actions. |

Evidence files: `20260909-original-regression.log`, `20260909-joint-component.log`, `20260909-native-save.log`, `390px-bookkeeping-recovery.png`, and the independent harness/test sources in this directory. Native file downloads are read and parsed from Chrome's actual temporary download folder; Blob creation, anchor clicks and storage APIs are not replaced with success mocks. The precise failing localStorage setItem keys are fault-injected; other storage remains native. All data are synthetic and profiles/download files are removed afterwards.

## Non-blocking UI observation

The three Bookkeeping recovery buttons measure 40px high at 390px. Project Frontend Responsive Design Standards prefers 44px touch targets. Reported to author for a small correction; this does not invalidate data preservation/retry assertions. Screenshot and geometry log describe the reviewed 9222519 baseline exactly.

## Remaining scope and known limitations

- Drafts remain in current mounted component memory. Leaving, refreshing or closing the browser is not established as recoverable by this fix; users must export before leaving. That is a separate durability requirement, not a hidden PASS here.
- Cross-tab transaction/merge correctness remains separate. Bookkeeping detects changed canonical bytes before retry, but check/write is not atomic. Tasks list/tag removal writes task references and metadata separately; a metadata failure can leave references changed while metadata remains. The implementation and author explicitly do not claim a two-key transaction.
- CSV import and budget inline editor have author tests; they were reviewed as close-on-success callbacks but not independently replayed in this joint probe. Category/ledger/account/recurring/investment are independently covered as listed. Do not represent every possible editor action as exercised.
- Tests cover specific quota failures, not all browser permission-denial modes, tab crashes, serialization errors, alternate locales or full production host navigation. Native screenshot uses package CSS and actual module components, not a hosted production route.
- No real backend, user account, browser profile, cloud synchronization or production data was accessed. No cross-vendor PASS is claimed. Parent owns overall REL-05, TODO and release decisions.

## Follow-up — 44px touch targets independently verified

Author correction `45d0665` increases Bookkeeping recovery controls to 44px. Re-ran the full native probe against that immutable revision with `REL05_VERIFY_REF=45d0665 REL05_VERIFY_LOG=20260909-native-44px.log REL05_SCREENSHOT=390px-bookkeeping-recovery-44px.png`. All three controls now measure exactly 44px at 390px; panel stays inside viewport (x16–374, y588–820). Updated screenshot inspected. All three actual draft downloads, Tasks/BK retry, partial mirror and B-boundary checks still PASS. The earlier 40px observation remains historical evidence and is now resolved. Original baseline log/screenshot preserved.
