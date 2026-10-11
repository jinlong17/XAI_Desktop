# STAT-01 / POMO-03 independent verification

Baseline `2b1759ba6cb5e017d62f3fd38ab4866dad2c06c0`. No product edits. Native runner pins the whole Git snapshot including all @repo imports; actual PomodoroModule, application PomodoroSessionHost and StatisticsModule are rendered in real isolated Chrome152, with actual scoped localStorage. Native clock advances are deterministic synthetic instants, not claims of six minutes of elapsed wall testing.

## Final numbered conclusions at `ab94f84`

- **STAT-01: PASS**, complete for its current elapsed-time / legacy compatibility acceptance contract.
- **POMO-03: PASS**, complete for its current early-End record/list/statistics acceptance contract.

Fix `ab94f84` follows Statistics implementation `2b1759b`. The same actual native session now displays one `1:00` row labeled `Ended early · Incomplete`; Chinese also displays 未完成. Real Pomodoro overview shows completed round counts0/0 and actual focus durations1m/1m, agreeing with actual Statistics route/reload KPI1minute. The persisted session remains completed=false and elapsedMs60,000 after five paused minutes. This closes the independently found visibility and duration-sum gaps without incorrectly counting an incomplete round as completed.

The same zero/two short sessions/five invalid or missing elapsed cases, current range notices, heatmap/hour/range totals and raw-byte preservation assertions pass on the fixed snapshot. Original STAT01 three correct assertions were independently rerun3PASS; STAT02 was explicitly filtered out and is not accepted. No author package totals are added to independent coverage.

Run:

```
STAT_VERIFY_REF=ab94f84 STAT_EXPECT_FIXED=1 STAT_VERIFY_LOG=20260909-native-stat-after.log STAT_SCREENSHOT=390px-statistics-zh-after.png node docs/reviews/web-statistics-time-independent/verify-native-stat.mjs
```

Evidence: `20260909-native-stat-after.log`, `20260909-original-stat01-three.log`, and three390px screenshots: `390px-pomodoro-incomplete-after.png`, `390px-statistics-en-after.png`, `390px-statistics-zh-after.png`. All screenshots visually inspected; the incomplete record and both overview durations are visible together, bilingual Statistics text wraps within the viewport. Original before log/screenshot remain unchanged. No product source changes by verifier.

STAT02/03/04, entire Statistics/Pomodoro release, cross-device synchronization and historical data repair remain separate. Range/date limitations below are explicitly retained and do not change the measured-duration conclusion.

## Baseline finding / status (preserved)

Statistics measured-duration aggregation passes the cases below, but the numbered items cannot yet be closed: **POMO FocusRecordList hides all incomplete focus records**, so an early-End row never appears or carries an incomplete label. This contradicts the requested list/KPI agreement and POMO03's explicit incomplete record requirement. Found in source and independently reproduced with actual native modules. Parent is fixing this separate gap.

Also reviewed: Pomodoro `sumTodaysFocusMs` and `sumTotalFocusMs` exclude incomplete sessions, not just completion counts. This duration-scope mismatch was sent to the parent for explicit correction or truthful completed-only labels; successful round counts themselves can legitimately remain completed-only.

## Independent baseline evidence

Run `node docs/reviews/web-statistics-time-independent/verify-native-stat.mjs`.

- Actual Pomodoro controller starts a25-minute configuration, runs25seconds, pauses5minutes, resumes35seconds, then ends. Canonical row: durationMs1,500,000; elapsedMs60,000; completed=false; wall time six minutes. Actual record list has zero rows (**defect**).
- Route to actual Statistics with host retained: focus KPI `0h 1m`. Actual Page.reload reading persisted row still shows `0h 1m`.
- Native fixture adds elapsed0, two15-second records, and five unmeasured records (missing, negative, greater than configured duration, string, null), plus an old out-of-window unknown. Independently expected sum: 60+0+15+15=90seconds =1.5minutes; unknown count5.
- Actual KPI, range buckets, hour distribution sum and today's heatmap all equal1.5minutes. Week/month/current five-month view agree. No per-row minute rounding. Old out-of-window unknown is not counted by the current view notice.
- English and Chinese notices both state5 excluded unmeasured records. Raw persisted JSON is byte-identical after reading, switching ranges/language and rendering.
- Actual CSS/tokens loaded at390px; Chinese notice lies x20..360 and document scroll width390. Screenshot visually inspected: notice and KPI readable; no horizontal overflow. See `390px-statistics-zh.png`.

Evidence `20260909-native-stat-before.log`. The baseline probe records partial success rather than pretending its missing-list condition passed.

## Range/date review — retain separate work

All time is currently five monthly buckets ending in this month, not entire history. Hour distribution attributes the full elapsed duration to the finish hour; midnight/day attribution also follows finishedAt rather than a pause-segment timeline. Week/month windows extend to their calendar end (not strictly now). These are existing STAT03/04 range/date/definition concerns, not fixed by elapsedMs adoption. STAT02's invented undated task bucket remains explicitly unaccepted. Invalid finishedAt cannot be attributed to a range and is excluded; no schema repair is claimed. No full Statistics feature or deployment acceptance is implied.
