# API - xai-web-board-responsive-smoke

## Runtime API

No runtime API is introduced by this row.

## Test Hook Contract

The smoke flow relies on existing stable hooks:

| Surface | Hook |
|---|---|
| Module root | `board-workspaces-module` |
| View picker | `view-picker` |
| Board view button | `vp-btn-board` |
| Table view button | `vp-btn-table` |
| Calendar view button | `vp-btn-calendar` |
| Timeline view button | `vp-btn-timeline` |
| Kanban lists | `board-lists` |
| Card | `board-card` |
| Table wrapper | `board-table-wrap` |
| Table row | `board-table-row` |
| Calendar | `board-cal` |
| Timeline | `board-timeline` |
| Card detail modal | `card-detail-modal` |
| Detail title | `card-detail-title-input` |
| Detail description | `card-detail-description` |
| Detail start date | `card-detail-start-date` |
| Detail due date | `card-detail-due-date` |

## Storage Contract

No new storage key is added. Smoke uses the default board seed and may clear
local browser state before validation to avoid stale local mutations.

## Event Contract

No new event is added. Existing Board events remain unchanged.

## Acceptance Contract

The row can be marked shipped when desktop and mobile browser evidence shows
the required surfaces render without blank page, framework overlay, relevant
console errors, or unreachable card detail controls.
