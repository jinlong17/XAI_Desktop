# STAT-01 / POMO-03 independent verification

Baseline `2b1759ba6cb5e017d62f3fd38ab4866dad2c06c0`. No product edits. Native runner pins the whole Git snapshot including all @repo imports; actual PomodoroModule, application PomodoroSessionHost and StatisticsModule are rendered in real isolated Chrome152, with actual scoped localStorage. Native clock advances are deterministic synthetic instants, not claims of six minutes of elapsed wall testing.

## Baseline finding / status

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
