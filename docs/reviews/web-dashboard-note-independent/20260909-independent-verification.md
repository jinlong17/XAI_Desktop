# Dashboard header note recovery — independent verification

Product `8eb163d`, author evidence `88fd5c1`, before `8eb163d^`. Reviewer did not author this implementation. All product / @repo imports are pinned by Git archive; third-party dependencies use installed libraries.

Conclusion: Dashboard header note content recovery passes the assigned independent checks. The author's position/device and navigation-warning boundaries are accurately stated. **Whole Dashboard and REL05 remain open.**

## Independent runs

```sh
node docs/reviews/web-dashboard-note-independent/verify-native.mjs --before
node docs/reviews/web-dashboard-note-independent/verify-native.mjs
node docs/reviews/web-dashboard-note-independent/verify-tests.mjs
```

Before intentionally exits 1: actual DashHeader quota leaves persisted `Original note`, but closes input and shows no failure. After exits 0, five native groups PASS:

1. Quota keeps actual input, unsaved error, and original bytes.
2. Edit the failed draft to latest text; actual Chrome downloads dashboard-note-draft.json. Read disk JSON and assert kind, current note and noteOffset=0; remove file; retry saves current text and closes input. No Blob/anchor interception.
3. Clear-note quota preserves previous saved bytes while input retains empty intended value; retry persists empty string.
4. External raw changes to `External winner`; old retry preserves those bytes and the obsolete local draft.
5. Switch A→B while old recovery remains mounted; Retry and Export change neither account, produce no download, and report export failure.

Native browser: Chrome 152.0.7977.83, synthetic accounts, temporary profile/download directory, actual React component/stylesheet, native Storage and download. DOM click/input drives controls; not claimed as human-pointer or full Dashboard route E2E.

Pinned full package: **22 files / 196 tests PASS**. Original author test assertions are retained. This includes component-level offset quota/latest-offset retry and newer device position preservation; these are not labelled native position/drag verification.

## Source and scope review

- DashHeader consumes note/offset autosave results rather than immediately closing after state updates. The editor closes after confirmed note persistence; failed clear remains an empty draft.
- Captured account and original raw baselines are checked on subsequent save/retry. Export repeats the captured-owner check. Note remains account-owned, offset device-local.
- Export retains editor text, while successful save follows the existing whitespace/120-character normalization contract.
- beforeunload is installed for dirty/failed state and removed by effect cleanup. This is browser-mediated warning only, not durable drafts or guaranteed navigation blocking.
- The author report explicitly distinguishes local comparison from cross-tab atomic CAS, after-anchor OS download failures from Blob-preparation failures, and note recovery from grid/widget consumers. Independent checks find no scope inflation.

No product files were changed. No new blocker found for this note sub-scope. Independent verification does not approve full REL05, all dashboard saves, widget layout/appearance, cross-tab transactions, cross-reload recovery, production deployment, or cross-browser behavior.
