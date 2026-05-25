# Seed Brief — xai-web-dashboard-add-widget-picker

| 字段 | 值 |
|---|---|
| Roadmap | docs/workflow/roadmap/xai-web-console-gap-closure.md row #5 (W1) |
| 父 Brief | docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-gap-closure-source.md §Gap 5 |
| 父 ADR | ADR-0009 §D2-G3 |
| 候选包 | packages/xai-web-dashboard-grid (#10 SHIPPED) + packages/xai-web-dashboard-widgets (#11 SHIPPED) — extend |

## Requirement (1-3 sentences)

Build a modal Add-Widget picker that closes the loop on the existing `web:dashboard:add-widget-clicked` event. Lists the 10 widgets exported by `xai-web-dashboard-widgets` with preview thumbnails. Selecting one appends its id to `xai_dash_order` (existing registry key) and the grid re-renders to include it.

## Hard Constraints

- UI: native `<dialog>` modal (same pattern as Settings panes).
- Source of widget list: read `dashboardWidgetRegistrations` export from `xai-web-dashboard-widgets` (#11). Do NOT hard-code the 10 widget IDs in the picker — derive from registration array.
- Preview thumbnails: render each widget at a fixed size (e.g. 160×120) in a scaled-down container; reuse the widget's own component (read-only mode if possible, else accept that some widgets show live data — document in design.md).
- Persistence: append to existing `xai_dash_order` registry key; do NOT introduce a new key.
- Duplicate handling: if user selects a widget already in `xai_dash_order`, show "Already added" feedback and do nothing (do NOT duplicate).
- Emit `web:dashboard:widget-added` (typed, new event — extend `xai-web-event-bus` EventMap).
- DESIGN.md §dashboard widget gallery: visual style must match the prototype's gallery panel (grid of cards).
- Per ADR-0009 D4: P0 work. Smallest scope of all gap-closure rows.

## Acceptance Signal

- Click "Add Widget" → modal opens with 10 widget cards.
- Click a card → modal closes, widget appears in dashboard grid in correct position per existing FLIP-reorder logic.
- Already-added widget shows "Already added" badge, click is no-op.
- All 93/104/70/54 existing dashboard plugin tests still PASS; new tests cover picker open/close/select/dedupe.
- Verify Cross-vendor: Codex cold-read confirms no race condition between picker close and grid re-render.
