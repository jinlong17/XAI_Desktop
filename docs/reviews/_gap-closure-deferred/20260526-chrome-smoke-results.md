# Chrome Smoke Results — Category 3 / ADR-0009 D2 G2

Date: 2026-05-26  
Runner: Codex parent session  
Browser: Google Chrome 148.0.7778.179 on macOS, controlled through Codex Chrome Extension  
App vehicle: `VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web exec vite --host 127.0.0.1 --port 3000`  
Base URL: `http://127.0.0.1:3000`  

## Summary

This is real Chrome smoke evidence for the local mock-auth app only. It does not satisfy the full Category 3 gate because Safari macOS, Firefox macOS, and iOS Safari are still untested, and Chrome itself produced failures below.

| Row | Chrome status | Evidence |
|---|---|---|
| #1 `xai-web-pomodoro-counters-test-fix` | PASS (partial) | `/app/pomodoro` renders Pomodoro, overview counters, Start. Clicking Start changes timer to `24:59`, state to Focusing, and shows Pause/End. Did not wait for a full completed session. |
| #2 `xai-web-ai-chat-real-llm-adapter` | PARTIAL / FINDINGS | AI settings pane renders via sidebar click with Provider/API Key/Streaming controls. `/app/settings/ai` deep link incorrectly renders Account pane. `/app/ai` send path works at UI level but returns "Please configure your API key"; real provider streaming not tested because no operator API key was provided. |
| #3 `xai-web-cmdk-search` | FAIL | CmdK modal opens via Meta+K / topbar search, but queries `pomodoro`, `task`, and `tomato` all show `No results`. This fails the expected "tomato -> pomodoro" smoke path. |
| #4 `xai-web-calendar-week-day-views` | PASS (partial) | Month/Week/Day toggle works. Day view persisted after reload and showed hour rows plus sample events. DST dates were not fully exercised in Chrome in this pass. |
| #5 `xai-web-dashboard-add-widget-picker` | PASS | Add Widget opens native `dialog.add-widget-picker` with "All widgets are on your dashboard" empty state; Escape closes it. |
| #6 `xai-web-board-filter-share-map` | PARTIAL / FINDINGS | FilterPopover opens with Labels/Members/Due Range. Share modal opens with "Share link / Copy / Close". Map view renders Leaflet controls and OSM attribution, but shows "No location pins"; pin click/highlight scenario cannot pass with current sample data. |
| #7 `xai-web-settings-integrations-3rd-party` | PARTIAL / FINDINGS | Integrations pane renders via sidebar click with Notion / Google Calendar / Linear Connect buttons. Invalid callback URL scrubs `code` and `state` immediately. `/app/settings/integrations` deep link incorrectly renders Account pane. Real provider OAuth authorization not completed. |
| #8 `xai-web-settings-premium-stripe` | PARTIAL / FINDINGS | Premium pane renders via sidebar click with non-dismissible v1 disclosure. Success and cancel callback routes render; success sets visible `Premium (stub)` badge. `/app/settings/premium` deep link incorrectly renders Account pane. Upgrade Payment Link navigation not tested because `VITE_STRIPE_PAYMENT_LINK_URL` is unset, leaving the button disabled. |
| #9 `xai-web-settings-account-delete-wire` | PASS (partial) | `/app/settings/account` renders Account pane. Delete Account opens 2-step modal. Lowercase `delete` leaves final submit disabled; exact `DELETE` enables it. Final destructive submit and live-auth failure path were not executed. |

## Findings

### C3-CHROME-1 — Settings pane deep links do not select the requested pane

Observed:

- `/app/settings/ai` renders the Account pane, not AI.
- `/app/settings/integrations` renders the Account pane, not Integrations.
- `/app/settings/premium` renders the Account pane, not Premium.
- `/app/settings/account` appears correct only because Account is the default active pane.

Impact:

- Smoke files that list `/app/settings/<pane>` as the route are currently not executable as written.
- `apps/web/src/host/capabilities.ts` has a `navigateTo(\`/app/settings/${section}\`)` path shape, so host-level "open settings section" commands may also land on Account unless the Settings module reads the route tail.

### C3-CHROME-2 — CmdK opens but search results are empty

Observed:

- Topbar search button opens `.cmdk-modal`.
- Meta+K opens `.cmdk-modal`.
- Query `pomodoro` => `No results`.
- Query `task` => `No results`.
- Query `tomato` => `No results`.

Impact:

- Fails the Category 3 row #3 happy path: type `tomato` -> finds Pomodoro sessions / route jump.

### C3-CHROME-3 — Board Map renders but has no pins

Observed:

- Map tab renders Leaflet controls and `© OpenStreetMap contributors`.
- Visible map state says `No location pins`.

Impact:

- OSM render smoke passes.
- Pin-render and pin-click/highlight scenarios do not pass with current sample data.

### C3-CHROME-4 — Real external flows remain untested

Not tested in this Chrome pass:

- Real LLM streaming with an operator-owned provider key.
- Real OAuth authorization with Notion / Google Calendar / Linear.
- Stripe Payment Link navigation, because `VITE_STRIPE_PAYMENT_LINK_URL` is not configured.
- Final Account Delete submit, to avoid destructive local wipe during this shared session.

## Console

Chrome console error log: none captured during the automated pass.

## Gate Interpretation

ADR-0009 D2 G2 remains PENDING.

This Chrome pass is useful evidence, but it is not a full G2 pass:

- Chrome has findings that need triage or documented acceptance.
- Safari macOS, Firefox macOS, and iOS Safari still require operator/manual smoke.
- External/provider-backed flows need credentials or configured public URLs before they can be marked PASS.

