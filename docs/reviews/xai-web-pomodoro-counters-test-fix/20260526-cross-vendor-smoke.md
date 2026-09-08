# Cross-Vendor Smoke — xai-web-pomodoro-counters-test-fix

> Gap-closure roadmap row #1.
> Status: TEMPLATE — awaiting operator real-browser evidence for ADR-0009 D2 G2.
> Vehicle: `pnpm --filter @repo/web dev:mock-auth`.
> Route: `/app/pomodoro`.

## Scope

This row was a test-only fix for Pomodoro derived counters. Manual smoke still needs to prove the shipped Pomodoro UI continues to update today/session counters correctly in real browsers.

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
| POM-1 | `/app/pomodoro` renders the timer, overview cards, and focus record list without console errors. | Pending | Pending | Pending | Pending |  |
| POM-2 | Start a focus session, then pause/resume; visible timer state remains consistent after tab background/foreground. | Pending | Pending | Pending | Pending |  |
| POM-3 | End/complete a focus session; today's focus count and duration cards update without reload. | Pending | Pending | Pending | Pending |  |
| POM-4 | Reload the page; persisted sessions still render and derived counters match the record list. | Pending | Pending | Pending | Pending |  |
| POM-5 | Browser local date boundary sanity: manually inspect a session dated today and confirm it is included only in today's counters. | Pending | Pending | Pending | Pending |  |
| POM-6 | Reduced-motion mode does not break timer controls or card updates. | Pending | Pending | Pending | Optional |  |

## Evidence

Paste screenshots, console snippets, and exact browser versions here.

## Sign-off

| Role | Name | Date | Verdict |
|---|---|---|---|
| Operator |  |  | Pending |

