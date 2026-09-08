# Seed Brief — xai-web-calendar-week-day-views

| 字段 | 值 |
|---|---|
| Roadmap | docs/workflow/roadmap/xai-web-console-gap-closure.md row #4 (W1) |
| 父 Brief | docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-gap-closure-source.md §Gap 3 |
| 父 ADR | ADR-0009 §D2-G3 |
| 候选包 | packages/xai-web-calendar (#12 SHIPPED — extend) |

## Requirement (1-3 sentences)

Replace the "coming soon" placeholders for Week view and Day view in `xai-web-calendar` with real implementations. Week view = 7-column × 24-row time grid; Day view = single-column time grid. Three-view toggle (Month/Week/Day) persists last-selected view per `xai_calendar_view` registry key + keeps the active date when switching views.

## Hard Constraints

- Reuse existing event source from Month view; do NOT introduce a parallel event store.
- Week view: 7 cols × 24 hour-rows × event overlay (events that span multiple hours render as multi-row blocks).
- Day view: 1 col × 24 hour-rows × event overlay; intended for dense single-day inspection.
- Toggle UI: pill-segmented control in calendar header (Month / Week / Day).
- New persistence key `xai_calendar_view` (= `month` | `week` | `day`) — register in `plugin-web-storage`.
- Active-date preservation: switching views keeps the user's "focused date" stable (centered in viewport).
- DESIGN.md §calendar module form fidelity: visual style must match prototype's Month view (typography, color tokens).
- DO NOT add event-creation/editing UI overhaul — reuse existing Month modal flow.
- Per ADR-0009 D4: P0 work.

## Acceptance Signal

- Toggle Month → Week → Day → Month preserves the centered date.
- Events spanning 9:00-11:00 render as a continuous 2-row block in Week + Day, not two 1-row stubs.
- All 90 existing calendar plugin tests still PASS; new tests cover 24-hour rendering + multi-hour event spans + view toggle + persistence.
- Performance: switching views completes in < 50ms on a month with 50 events.
- Verify Cross-vendor: Codex cold-read confirms timezone handling is consistent across Month/Week/Day (no off-by-one at midnight or DST boundaries).
