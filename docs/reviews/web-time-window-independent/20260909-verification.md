# TT-01 independent window accounting verification

Date: 2026-09-09. Module: web. Reviewed commit: `c5b08a723a47cf8cec59a585a714195efa98b1ba`. Verdict: **PASS for TT-01 window accounting**, subject to explicit limits below. No product edits or deployment performed.

## Execution and independence

```sh
TZ=America/Los_Angeles node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-time-tracker-window-accounting/window-reproduction.config.mjs
node docs/reviews/web-time-window-independent/verify-native-window.mjs
```

The original **11/11 assertions pass unchanged**. They remain separate from the author's 63-test suite; no combined coverage total is claimed. The native probe builds a Git archive of c5b08a7 and pins every workspace import to that archive, excluding parallel working-tree edits. Real Chrome 152.0.7977.83 uses isolated temporary profile and download folder, localhost only, and the actual TimeTrackerModule, TimeTrackerWidget, repository and accounting helpers. Date.now/new Date without arguments use a fixed clock; native timezone rules are selected with Chrome timezone emulation. No real account/profile/data or server is accessed.

Native fixture independently combines: a crossing Work session, a paused multi-segment Study session, a current running session, a wholly future ended session, a 70,750ms session crossing an hour, and a session ending exactly at the window boundary. Expectations are hand-calculated contributions, not copies of the implementation formula.

## Native business results

- Today/week/month: **6,070,750ms**, four contributing source entries. Widget displays `1h 41m`, top category Study, one running entry and 600,000ms active elapsed time. Previous day's contribution is 70 minutes. Year/all includes both days for **10,270,750ms** (display `2h 51m`) and five source entries; future session excluded.
- All **20 Insights types** mounted together and checked. Ten fixed/lifecycle cards retain their exact text/tooltip evidence while the report range changes; ten selected-range cards change according to week/month/year/all. Reversed custom dates select the same inclusive civil date range. Category shares, tracked-day denominator, weekday/hour bins, goal proportions, peak hour, longest contribution, subcategories and recent full-session semantics are independently checked.
- A real downloaded week CSV contains exactly the four contributing source IDs; its contribution sum is **6,070,750ms**. The precise source exports `70750` without rounded-minute loss; paused source contributes 3,600,000ms, excluding the pause/prior day. Original source ISO times and `America/Los_Angeles` timezone remain explicit. Read-only report operations leave persisted source JSON byte-for-byte unchanged.
- Opening the cross-midnight source editor shows full original `2026-05-31T23:30` through `2026-06-01T00:30`, not the clipped interval. Cancel leaves bytes unchanged. Saving a note retains its original ID and complete segment; other source records remain exactly unchanged.
- Range-delete confirmation explicitly warns about deleting time outside the window. Cancel leaves bytes unchanged. Confirm deletes complete intersecting source IDs, including the crossing source; the exact-boundary-ended and future sources survive. Derived clipped records are never persisted or mistaken for separate entities.

### All Insights window map checked

| Fixed or lifecycle semantics (unchanged across report selection) | Selected report-window semantics |
| --- | --- |
| today-total, week-total, month-total | avg-day, days-tracked |
| current (full current elapsed) | donut-range, cat-ranking |
| donut-today, goal-progress | sub-split, by-weekday |
| trend-7d, trend-30d, heatmap | by-hour, range-summary |
| recent-sessions (full occurred sessions) | category-mosaic, focus-rhythm |

Each selected range change checks these groups independently, rather than accepting a correct header while ignoring its cards. Detailed 20-card text/tooltips are retained in `20260909-native-window.log`.

### Native DST matrix

| Zone/date | Day contribution and downloaded CSV ms | Distinct hour-bin assertion |
| --- | --- | --- |
| America/Los_Angeles, 2026-03-08 | 82,800,000 (23h) | 02:00 bin = 0 |
| America/Los_Angeles, 2026-11-01 | 90,000,000 (25h) | repeated 01:00 bin = 7,200,000 |
| Australia/Lord_Howe, 2026-04-05 | 88,200,000 (24.5h) | 01:00 bin = 5,400,000 |
| Australia/Lord_Howe, 2026-10-04 | 84,600,000 (23.5h) | 02:00 bin = 1,800,000 |

For every row, main selected-day display, exact day/hour totals and real CSV agree; the current-day widget separately reports only the ten-minute tail. Five CSV downloads total (rich week + four DST days) were read and parsed from Chrome's actual files. Downloads/profile are removed after validation; fixtures and logged assertions are reproducible.

## Non-blocking UX observation

Main day header displays total duration including active entries but counts only completed rows: rich fixture `1h 41m · 3`, while snapshot entriesToday and report count are 4 (three completed + one running). This follows existing doneForDay display semantics; duration accounting is correct. Label the count explicitly or align it with the total in a later TT UX item. Parent confirmed this is not a TT-01 computation blocker. Initial probe expectation was adjusted to distinguish completed-list count from all contributing sources, with both values retained in evidence.

## Boundaries and numbering correction

- **TT-04 is category-deletion transaction safety. TT-07 is performance/scaling.** Earlier diagnosis/fix prose calling TT-04 performance is incorrect; do not propagate that numbering into the ledger or handoff.
- TT-03 hourly/rhythm/CSV work overlaps this implementation and is exercised here; this does not automatically close any broader TT-03 acceptance not represented by these cases.
- TT-02 multi-segment editing remains separate. Native edit-save here intentionally uses one crossing source segment with minute-aligned endpoints. It does not establish that existing multi-segment editors preserve pauses or sub-minute timestamps after edits.
- Minute-wise hour aggregation and record scanning were not benchmarked; no TT-07 performance verdict. No quota failure, cross-tab transaction, deployment, cloud sync or browser-close background execution was exercised by this accounting probe.
- Date range before Unix epoch, every possible custom date, and all historical timezone transitions are not exhaustively covered. Native DST uses two modern zones and four specifically asserted boundaries.
- No cross-vendor PASS claimed. No product files, original 11 assertions or task ledger modified. Evidence-only commit uses explicit --only paths; parent owns final TODO/release decisions.
