# Cross-Vendor Smoke — xai-web-calendar-week-day-views

> Gap-closure roadmap row #4.
> Status: TEMPLATE — awaiting operator real-browser evidence for ADR-0009 D2 G2.
> Vehicle: `pnpm --filter @repo/web dev:mock-auth`.
> Route: `/app/calendar`.

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
| CAL-1 | Toggle Month -> Week -> Day; view content changes without route crash or console error. | Pending | Pending | Pending | Pending |  |
| CAL-2 | Focused/active date is preserved while toggling between Month, Week, and Day. | Pending | Pending | Pending | Pending |  |
| CAL-3 | Multi-hour event renders as one continuous block in Week view and Day view. | Pending | Pending | Pending | Pending |  |
| CAL-4 | Navigate to 2026-03-08 US Pacific spring-forward day; 23-hour grid renders without overlapping event blocks. | Pending | Pending | Pending | Pending |  |
| CAL-5 | Navigate to 2026-11-01 US Pacific fall-back day; 25-hour grid renders without duplicate-row visual corruption. | Pending | Pending | Pending | Pending |  |
| CAL-6 | `xai_calendar_view` persists: choose Day, reload, and confirm Day view returns. | Pending | Pending | Pending | Pending |  |
| CAL-7 | iOS touch scroll over hour rows works without accidental view-toggle or stuck hover state. | N/A | N/A | N/A | Pending |  |

## Evidence

Paste screenshots, console snippets, and exact browser versions here.

## Sign-off

| Role | Name | Date | Verdict |
|---|---|---|---|
| Operator |  |  | Pending |

