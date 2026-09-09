# REL-01 independent verification

Verdict: **PASS / READY_TO_SHIP for REL-01**, after the independently discovered Metrics instant-preservation defect was fixed in `8edd51d`. This is a feature-scoped verdict, not acceptance of all 312 tasks, current unfinished REL-03 integration, deployment, browser-closed background jobs, or account synchronization.

## Reviewed scope

Reviewed `2f04bd4`, `337d2b8`, `a81b1f9`, and follow-up `8edd51d`; checked the diagnosis, implementation receipts and parent integration receipt. The original UTC/local mismatch and fixed-24-hour expressions are replaced by local civil-day helpers, consumer clock subscriptions and actual local offset transitions. Public dependencies remain in tokens; no business code moved to core or host. Existing date identities are retained; Tasks legacy unknown-year records are not assigned guessed dates.

The parent reports 870 package tests and Web typecheck/build, but this verifier did not reuse that as an independent PASS. Independently reran tokens + Metrics: 55 + 16 tests passed (71 unique cases in this layer). Real Chromium probes below call source implementations and mount real React components with native localStorage. They use disposable profiles and local HTTP only; no user profile, production records or authenticated services were accessed.

## Found and repaired during verification

`MetricTrackerModule` originally reconstructed every edited record from HH:MM, even when only weight or notes changed. A real Chromium UI save converted Pacific fall-back `2026-11-01T09:30:00.000Z` into `08:30:00.000Z`; an ordinary `2026-09-09T18:30:45.123Z` became `18:30:00.000Z`. This broke the absolute-instant contract. See the preserved `verify-browser-metric-instant.log` before receipt.

Parent fixed this in `8edd51d`: retain original measuredAt when displayed civil date/time are unchanged. The after probe confirms both values now remain exactly equal, including fold choice and sub-minute precision. Explicitly changing time to 03:15 still writes the requested new instant: respectively `2026-11-01T11:15:00.000Z` and `2026-09-09T10:15:00.000Z`. See `verify-browser-metric-instant-after.log`; probe now throws on mismatch instead of relying on exit success alone.

## Independent browser acceptance

- `verify-browser-six-date-matrix.mjs` passed separately in UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Input is the same absolute instant `2026-09-09T06:30Z`; expected day is Sep 8 in Pacific and Sep 9 in the other three zones. It verifies Habits day keys, TT day keys, Statistics midnight, Metrics end-of-day, Tasks actual dueDate filtering, and Calendar rendered today cell. This is five consumer calculation paths plus a rendered Calendar, not six complete feature walkthroughs.
- Fixed known UTC boundary values independently anchor Statistics and Metrics assertions. Calendar DST day lengths are checked against known values: Pacific 23/25h; Lord Howe 24.5/23.5h; UTC/Shanghai 24h. Row durations sum to those values. Fold placement resolves 01:30 to the earlier occurrence; spring half-hour placement resolves 02:30 to elapsed row 2.
- The Calendar UI is then moved to Dec 31; after pageshow on Jan 1, it preserves the viewed December month. Clicking Today selects the rendered Jan 1 cell. This checks both resume freshness and preservation of user navigation.
- `verify-browser-day-recovery.mjs` passed in Pacific: actual Tasks Tomorrow contains the Jan 1 record on Dec 31, then excludes it after a Jan 1 focus event; Today contains it. Native persisted columns regroup it with dueDate and Board source intact. Legacy yearless record remains in its original column. Component unmount/remount restores the persisted task; a later pageshow refreshes the actual shared hook to Jan 4.
- The browser clock seam replaces Date only in the disposable fixture page; DOM rendering, React updates, event dispatch, date arithmetic and localStorage are real Chromium. Focus/pageshow are controlled events, not a claim that an OS background session or whole-browser shutdown was exercised. The probes do not validate UI styling because imported CSS is omitted from the test bundle.

## Baseline control and limitations

While reviewing REL-01, another worker modified plugin-web-storage for REL-03 in the shared worktree. The first Tasks fixture run read the new account scope instead of the intended legacy key. This was fixture/baseline contamination, not a REL-01 failure. Tasks and six-feature browser probes therefore pin **only plugin-web-storage source to `a81b1f9` using esbuild onLoad + git show**. Other product modules use current source, including the Metrics follow-up. This is explicitly not a full current-worktree integration PASS; the parent must run the combined integration gates after REL-03 completes.

The committed package suites cover Tasks create/edit/move/source preservation and legacy validation; browser probes independently cover its real persistence and date projection. Some broader per-feature business issues remain intentionally in separate TODOs: TT cross-midnight allocation, Pomodoro persisted runtime, account scope, gap-time event policy, and scheduled background execution. No deployment, native lifecycle or cross-vendor PASS is claimed. Claude OAuth was unavailable; this is a distinct Codex verifier.

## Evidence / commands

- `TZ=America/Los_Angeles node docs/reviews/web-local-time-contract/verify-browser-metric-instant.mjs`
- `TZ=America/Los_Angeles node docs/reviews/web-local-time-contract/verify-browser-day-recovery.mjs`
- `TZ=<UTC|America/Los_Angeles|Asia/Shanghai|Australia/Lord_Howe> node docs/reviews/web-local-time-contract/verify-browser-six-date-matrix.mjs`
- `pnpm --filter @repo/plugin-web-tokens --filter @repo/plugin-web-metric-tracker test`

Result logs are adjacent to the probe scripts. Esbuild warns that development-only import.meta guards are empty in an IIFE; the probes reach all assertions and produce explicit PASS JSON. No product code or workflow status file was edited by this verifier; the parent owns dev_log/TODO/commit updates.
