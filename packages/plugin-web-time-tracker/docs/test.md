# Time Tracker Test Plan

Existing focused automated coverage (test inventory; not a new execution):

- Time helper duration/day/week behavior.
- Module bilingual render.
- Start, pause, resume, and end persistence.
- Manual record persistence.
- Subcategory start picker.
- Category editor persistence.
- Configurable insights board render.
- Insight hover metadata and richer insight cards after tracking time.
- Insight Year/Custom range controls, CSV export affordance, and confirmed range deletion.
- Shell registration shape.

A separately authorized release verification should also smoke `/app/timetrack` in the web shell and confirm the dashboard Time Tracker widget opens the module.


## REL-01 amendment — 2026-09-09 local civil time

This section supersedes historical UTC-day / fixed-24-hour / 2026-Pacific-only assumptions above. User time zone currently follows the browser/device; `xai_pref_dt_timezone` is a display boolean, not a stored IANA choice. Civil `YYYY-MM-DD` keys are date identities and existing keys are not shifted. Absolute ISO/epoch values keep their instant. Natural-day boundaries use the next local midnight (23/24/25 hours and fractional DST days), not 86,400,000 milliseconds.

Shared owner: `@repo/plugin-web-tokens` public `localDateKey`, `parseLocalDateKey`, `addLocalDays`, `startOfLocalDay`, `nextLocalDayStart`, `useLocalDayClock`. The hook refreshes on midnight, focus, pageshow, visible and a 60-second system-clock/time-zone calibration. It cleans timers/listeners on unmount and makes no closed-page execution promise. User-selected historical dates are preserved when today advances.

Regression evidence is tracked in `docs/reviews/web-local-time-contract/dev_log.md`; focused localDate suites run under UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Full feature suites retain unrelated behavior coverage. Independent verification remains a separate workflow step.

REL-01 changes civil-day navigation/refresh behavior. TT-01 window allocation was subsequently independently accepted at `c5b08a723a47cf8cec59a585a714195efa98b1ba` ([report](../../../docs/reviews/web-time-window-independent/20260909-verification.md)); TT-03 hourly/rhythm/CSV acceptance uses `cd3146b8c241a6ac5434a10e555ae813b2cc2961` ([report](../../../docs/reviews/web-time-hour-independent/20260909-review.md)). Report-window projections retain source identity and do not replace persisted source segments. Running segment epoch values remain absolute instants. These are historical acceptances, not new executions in this documentation iteration.


## TT08 static source and historical evidence map — 2026-10-10

The [canonical PRD](../../../docs/product/time-tracker/prd.md), [design](design.md) and [API](api.md) describe current P0 source `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. Existing tests below are referenced/read, not run in TT08:

| Existing test source | Relevant behavior |
|---|---|
| [sessionController.test.ts](../src/__tests__/sessionController.test.ts) | Locked source checks, single/newly-running enforcement and distinct multi sessions. |
| [sessionInvariants.test.ts](../src/__tests__/sessionInvariants.test.ts) | Pause gaps, replay/terminal safety and interval invariants. |
| [sessionEditor.test.tsx](../src/__tests__/sessionEditor.test.tsx) | Default-Single End and start confirmation and atomic session switch; source-preserving metadata edits and mounted editor retention on failed save. |
| [TimeTrackerModule.test.tsx](../src/__tests__/TimeTrackerModule.test.tsx) | Bilingual module and Start; multiple distinct sessions seeded with the raw `localStorage.setItem("xai_tt_mode", "multi")` fixture, without selector interaction. |
| [windowAccounting.test.ts](../src/__tests__/windowAccounting.test.ts), [windowConsumers.test.tsx](../src/__tests__/windowConsumers.test.tsx) | Intersections, source identity and report consumers. |
| [localDate.test.ts](../src/__tests__/localDate.test.ts), [dayRollover.test.tsx](../src/__tests__/dayRollover.test.tsx) | Local civil dates and idle/current-day rollover while preserving selected history. |

No existing automated package test or TT02 native test exercises the mode selector UI. The EN/ZH selector correspondence is a static reading of [TimeTrackerModule.tsx](../src/TimeTrackerModule.tsx) at P0 lines 789–791 only; the raw-key Multi fixtures and historical native Single Start evidence do not establish selector interaction coverage.

| Historical accepted evidence | Fixed source and exact reported result | Limits retained |
|---|---|---|
| [TT01 window report](../../../docs/reviews/web-time-window-independent/20260909-verification.md), report commit `8d951e93ea2935f2b7a06dcc9b25851ea1b6b783` | `c5b08a723a47cf8cec59a585a714195efa98b1ba`: original 11/11 assertions; native all 20 Insights, five actual CSV downloads, two DST zones/four boundaries. Separate author 63-test suite is not a combined total. | Exact source/window totals; completed-row count differs from active-inclusive duration and remains a UX residual. Not multi-segment editor, transactions, quota, performance, release or cross-vendor proof. |
| [TT02 session report](../../../docs/reviews/web-time-tracker-session-independent/20260909-report.md), report commit `082766b1a6413a6a746641c93541954c717dfcfc` | `64caa5a678ce9943a0e7aa03609095153c5131e2`, including `ba2065859782ab787989e147f22ca84358c6f5b1`: 5/5 invariant, 11/11 original window, 78/78 package tests, 11/11 native assertions. These overlap; never sum them as coverage. | Real two-tab single Start/locks/conflict/no-lock/replay/export/download evidence; Multi also has unit evidence, not native multi→single conversion acceptance. Unit shims differ from native Web Locks. Native viewport 1440px; no mobile visual or cross-vendor verdict. Multi-segment interval edit disabled; no import/repair. Initial runner resolution failure was retained before React alias correction. |
| [TT03 hour report](../../../docs/reviews/web-time-hour-independent/20260909-review.md) | `cd3146b8c241a6ac5434a10e555ae813b2cc2961`: exact 29,875ms/40,875ms hour remainders, explicit range/timezone/source metadata, all 20 Insights, two-zone DST, five CSV files; 11 files/82 package tests. | Reused TT01 native fixture/oracles; initial replay then added remainder/UTC assertions, not an unrelated suite. Empty terminal stdout is not PASS evidence; structured assertions/process result were used. Repeated wall-hour bins retain elapsed/UTC distinctions. No TT04/TT07, all historical offset transitions, universal accessibility or release verdict. |
| [REL01 actual-consumer report](../../../docs/reviews/web-local-time-consumers-independent/20260909-review.md) | Initial `58f4076` idle TT midnight failure retained; fixed `91497787b9ca7deabf88a3683d5a344699c39bf6` covers six actual consumer midnight behaviors and TT selected-history preservation. Separate UTC/Pacific/Shanghai/Lord Howe calculation-plus-Calendar matrix. | Original Metrics native evidence reused plus two targeted current component assertions (four filtered), not a six-test PASS or fresh native run. No OS background/server jobs/production/cloud-timezone/cross-vendor proof. |

TT01/TT02/TT03/REL01 remain historical accepted outcomes at their recorded sources, not fresh runtime certification of P0. TT02→P0 adds the local-day module refresh/selected-day changes and dayRollover test, so the entire package is not TT02-identical. Original failures, raw logs, fixtures, runners and screenshots remain unchanged. DASH07 widget controls, TT04 category transactions, TT05–07 remaining work, REL04, GOV04/GOV05 and external/release obligations retain their separate gates.

For this five-document delta, meaningful checks are exact-path whitespace/scope checks, link/file correspondence and frozen source/evidence hash comparison. Zero package tests/typecheck/lint/build, browser/native probes or historical reruns are required or claimed. The existing EN/ZH selector, Start confirmation and controller/error surface already correspond to the docs; this static check does not assert visual/keyboard acceptance. Candidate verification remains pending: fresh independent exact-commit verifier and actual cross-tool gate → separately authorized documentation-only status publication → fresh Astra full-chain acceptance → root reconciliation/inventory. Independent Codex actors are not cross-vendor evidence. The family verification cap remains three; no candidate verification attempt was consumed by authorship. Applicable Clock/affected-runtime/final regression obligations are neither run nor waived by TT08.
