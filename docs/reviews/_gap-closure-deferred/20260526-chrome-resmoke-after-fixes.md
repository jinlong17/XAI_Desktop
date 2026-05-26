# Chrome Re-Smoke After Claude Fixes — Category 3 / ADR-0009 D2 G2

Date: 2026-05-26  
Runner: Codex parent session  
Browser: Google Chrome 148.0.7778.179 on macOS, controlled through Codex Chrome Extension  
App vehicle: `VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web exec vite --host 127.0.0.1 --port 3000`  
Code under test: `main` at `5d1d3a0`

## Summary

Claude pushed three fix commits:

- `c91f768` — C3-CHROME-1 Settings deep links
- `3ecadc1` — C3-CHROME-2 CmdK adapter side effects
- `5d1d3a0` — C3-CHROME-3 Board seed locations

Re-smoke result:

| Finding | Re-smoke status | Evidence |
|---|---|---|
| C3-CHROME-1 Settings deep links | FAIL | `/app/settings/ai`, `/app/settings/integrations`, and `/app/settings/premium` still render Account in the real app. DOM shows `.settings-detail[data-pane="account"]` and active sidebar row `Account`. |
| C3-CHROME-2 CmdK no results | PASS | CmdK modal opens and queries now return results: `pomodoro` -> `PomodoroPomodoro`, `task` -> `stat-tasks`, `tomato` -> `Pomodoro`. |
| C3-CHROME-3 Board Map no pins | FAIL | `/app/board` -> Map still shows `No location pins` on both `127.0.0.1` existing-origin and fresh `localhost` origin. OSM/Leaflet render is present, but card pins are absent. |

ADR-0009 D2 G2 remains PENDING.

## Detailed Evidence

### C3-CHROME-1 — Settings deep links still fail

Observed in Chrome:

| Path | Expected | Actual |
|---|---|---|
| `/app/settings/ai` | AI pane | Account pane |
| `/app/settings/integrations` | Integrations pane | Account pane |
| `/app/settings/premium` | Premium pane | Account pane |
| `/app/settings/account` | Account pane | Account pane |

DOM evidence for failed paths:

- `.settings-detail[data-pane]` = `account`
- active sidebar row = `Account`

Likely cause from code inspection:

- `c91f768` updated `packages/plugin-web-settings-shell/src/SettingsModule.tsx`.
- The real app route uses `apps/web/src/routes/modules/composedSettingsRegistration.tsx`, whose `ComposedSettingsModule` still owns `useState<SettingsPaneId>("account")` and does not read `useParams()` / URL splat.
- Therefore the fixed package component is not the component mounted by the production `apps/web` settings route.

### C3-CHROME-2 — CmdK search now passes

Observed in Chrome:

| Query | Result |
|---|---|
| `pomodoro` | `PomodoroPomodoro`, no `No results` |
| `task` | `stat-tasks`, no `No results` |
| `tomato` | `Pomodoro`, no `No results` |

This confirms `3ecadc1` fixed the production bundle tree-shaking issue caught by the first Chrome smoke.

### C3-CHROME-3 — Board Map still has no pins

Observed in Chrome:

- Map tab renders Leaflet controls and `© OpenStreetMap contributors`.
- Visible body still says `No location pins`.
- Fresh-origin retest on `http://localhost:3000/app/board` also says `No location pins`.

Likely cause from code inspection:

- `5d1d3a0` added `location` fields to `packages/plugin-web-board-core/src/internal/seed/board-data.ts`.
- The real app route is `@repo/plugin-web-board-workspaces` (`packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx`) wrapping MapView with workspace/multi-board data.
- The fresh-origin board title was `Project Management`, and the module still rendered no cards with `location`.
- So the seed edited in board-core is not sufficient for the production `/app/board` workspace route smoke.

## Automated Test Commands

All three targeted package test suites pass:

| Command | Result |
|---|---|
| `pnpm --filter @repo/plugin-web-settings-shell test` | PASS — 11 files, 54 tests |
| `pnpm --filter @repo/xai-web-cmdk test` | PASS — 24 files, 138 tests |
| `pnpm --filter @repo/plugin-web-board-core test` | PASS — 12 files, 108 tests |

`plugin-web-board-core` tests print React `act(...)` warnings in `BoardModule.test.tsx`, but exit 0.

## Gate Interpretation

Chrome-only G2 cannot be marked PASS yet.

What is fixed:

- C3-CHROME-2 CmdK production search is fixed.

What still needs repair or explicit acceptance:

- C3-CHROME-1 must be fixed in `apps/web/src/routes/modules/composedSettingsRegistration.tsx`, not only in `plugin-web-settings-shell`.
- C3-CHROME-3 must seed or migrate location-bearing cards in the actual `plugin-web-board-workspaces` production route data path, or the smoke expectation must be changed to accept the no-pin state.

