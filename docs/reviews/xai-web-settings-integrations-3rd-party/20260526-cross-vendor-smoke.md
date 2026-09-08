# Cross-Vendor Smoke — xai-web-settings-integrations-3rd-party

> Gap-closure roadmap row #7.
> Status: TEMPLATE — awaiting operator real-browser evidence for ADR-0009 D2 G2.
> Vehicle: `pnpm --filter @repo/web dev:mock-auth`.
> Route: `/app/settings/integrations`.

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
| INT-1 | Notion, Google Calendar, and Linear cards render with Connect buttons and current stub status. | Pending | Pending | Pending | Pending |  |
| INT-2 | Connect Notion starts same-tab authorize flow and creates sessionStorage state/code_verifier with TTL. | Pending | Pending | Pending | Pending |  |
| INT-3 | Callback URL with `?code=&state=` is scrubbed immediately after handler mount; final URL contains no `code` or `state`. | Pending | Pending | Pending | Pending | Confirm in address bar / history entry. |
| INT-4 | Valid callback shows success banner and connected badge. | Pending | Pending | Pending | Pending |  |
| INT-5 | Invalid/mismatched state shows error banner and does not mark provider connected. | Pending | Pending | Pending | Pending |  |
| INT-6 | sessionStorage OAuth material is cleared after success and after invalid-state failure. | Pending | Pending | Pending | Pending |  |
| INT-7 | Disconnect clears local provider state. | Pending | Pending | Pending | Pending |  |
| INT-8 | Safari ITP / private-mode behavior is recorded if sessionStorage is restricted. | N/A | Pending | N/A | Pending |  |

## Evidence

Paste screenshots, URL-bar observations, sessionStorage notes, and exact browser versions here.

## Sign-off

| Role | Name | Date | Verdict |
|---|---|---|---|
| Operator |  |  | Pending |

