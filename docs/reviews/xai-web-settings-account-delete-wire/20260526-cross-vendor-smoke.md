# Cross-Vendor Smoke — xai-web-settings-account-delete-wire

> Gap-closure roadmap row #9.
> Status: TEMPLATE — awaiting operator real-browser evidence for ADR-0009 D2 G2.
> Vehicle: `pnpm --filter @repo/web dev:mock-auth`.
> Route: `/app/settings/account`.

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
| DEL-1 | Account pane renders mock-auth non-dismissible warning banner. | Pending | Pending | Pending | Pending |  |
| DEL-2 | Delete Account opens step-1 modal; continuing emits deprecated compatibility event only at step 1. | Pending | Pending | Pending | Pending | Event console listener optional. |
| DEL-3 | Step-2 modal keeps submit disabled for `delete`, ` DELETE `, and any non-exact text. | Pending | Pending | Pending | Pending |  |
| DEL-4 | Typing exact `DELETE` enables final submit. | Pending | Pending | Pending | Pending |  |
| DEL-5 | Mock-auth submit wipes registry-listed localStorage keys and registered IndexedDB names, then redirects to `/`. | Pending | Pending | Pending | Pending | Verify no `localStorage.clear()` broad wipe by checking unrelated test key if needed. |
| DEL-6 | Reload after redirect shows clean auth/local state for web console. | Pending | Pending | Pending | Pending |  |
| DEL-7 | Network/backend failure path does not clear local state before backend success. | Pending | Pending | Pending | Optional | Requires live-auth or mocked failure path. |
| DEL-8 | Real-auth Supabase Edge Function path tested, or explicitly marked Deferred if not deployed. | Deferred | Deferred | Deferred | Deferred | Fill when backend is available. |

## Evidence

Paste screenshots, localStorage/IndexedDB observations, console notes, and exact browser versions here.

## Sign-off

| Role | Name | Date | Verdict |
|---|---|---|---|
| Operator |  |  | Pending |

