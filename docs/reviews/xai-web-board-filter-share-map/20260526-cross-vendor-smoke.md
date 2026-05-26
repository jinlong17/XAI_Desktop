# Cross-Vendor Smoke — xai-web-board-filter-share-map

> Gap-closure roadmap row #6.
> Status: TEMPLATE — awaiting operator real-browser evidence for ADR-0009 D2 G2.
> Vehicle: `pnpm --filter @repo/web dev:mock-auth`.
> Route: `/app/board`.

## Browser Matrix

| Browser | Target | Status | Version / Device | Notes |
|---|---|---|---|---|
| Chrome macOS | 120+ / macOS 14+ | Pending |  |  |
| Safari macOS | 17+ / macOS 14+ | Pending |  |  |
| Firefox macOS | 121+ / macOS 14+ | Pending |  |  |
| Safari iOS | 17+ / iOS 17+ | Pending |  |  |

## Scenario Matrix

| ID | Check | Chrome | Safari | Firefox | iOS Safari | Notes |
|---|---|---|---|---|---|---|
| BRD-1 | FilterPopover opens/closes; ESC and outside-click both dismiss it. | Pending | Pending | Pending | Pending |  |
| BRD-2 | Apply a label/member/due filter; cards narrow consistently across Kanban, Table, Timeline, Calendar, List, and Map views. | Pending | Pending | Pending | Pending |  |
| BRD-3 | Clearing filters restores the original card set without changing active board data. | Pending | Pending | Pending | Pending |  |
| BRD-4 | Share modal opens; copy action exposes a deterministic mock URL and shows copied feedback. | Pending | Pending | Pending | Pending | Safari clipboard restrictions may require manual copy fallback. |
| BRD-5 | Map view lazy-loads Leaflet only after first Map tab click; no eager Leaflet chunk before Map. | Pending | Pending | Pending | Optional | Use Network panel where available. |
| BRD-6 | OSM tiles render and attribution is visible; pins appear for cards with location. | Pending | Pending | Pending | Pending |  |
| BRD-7 | Clicking a pin highlights or focuses the corresponding card. | Pending | Pending | Pending | Pending |  |
| BRD-8 | Empty-location state renders when no card has a valid location. | Pending | Pending | Pending | Pending |  |

## Evidence

Paste screenshots, console snippets, Network panel notes, and exact browser versions here.

## Sign-off

| Role | Name | Date | Verdict |
|---|---|---|---|
| Operator |  |  | Pending |

