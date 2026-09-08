# Chrome Cycle-3 Re-Smoke After Production-Layer Fixes

Date: 2026-05-26  
Runner: Codex parent session  
Browser: Google Chrome 148.0.7778.179 on macOS, controlled through Codex Chrome Extension  
Code under test: `main` at `debc51a`  
App vehicle: `VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web exec vite --force --host 0.0.0.0 --port 3000`

## Summary

Cycle-3 confirms that the production-layer fixes are effective for the intended first-run Chrome smoke path.

| Finding | Cycle-3 status | Evidence |
|---|---|---|
| C3-CHROME-1 Settings deep links | PASS | `/app/settings/ai`, `/app/settings/integrations`, `/app/settings/premium`, and `/app/settings/account` each select the expected pane. DOM `.settings-detail[data-pane]` matches `ai`, `integrations`, `premium`, `account`. |
| C3-CHROME-2 CmdK no results | PASS | CmdK returns results for `pomodoro`, `task`, and `tomato`; none show `No results`. |
| C3-CHROME-3 Board Map no pins | PASS for fresh first-run origin; stale-origin caveat | Fresh origin `http://10.252.59.152:3000/app/board` renders 3 Leaflet marker icons and no `No location pins` empty state. Existing `127.0.0.1` / `localhost` origins still show no pins because this Chrome profile has older persisted `xai_boards_v2` data from pre-fix smoke runs. |

Chrome-only re-smoke for the three Codex findings is now PASS, with a storage caveat for existing local test origins. Full ADR-0009 D2 G2 still depends on the project owner's accepted browser matrix policy for Safari macOS / Firefox macOS / iOS Safari and external-provider flows.

## C3-CHROME-1 Evidence

| Path | Expected pane | Chrome result |
|---|---|---|
| `/app/settings/ai` | AI | PASS — body contains `API Key`; DOM active pane = `ai`; active sidebar row = `AI`. |
| `/app/settings/integrations` | Integrations | PASS — body contains `CONNECTED PROVIDERS`; DOM active pane = `integrations`; active sidebar row = `Integrations & Import`. |
| `/app/settings/premium` | Premium | PASS — body contains `Unlock Premium Features`; DOM active pane = `premium`; active sidebar row = `Premium`. |
| `/app/settings/account` | Account | PASS — body contains `Aki Chen`; DOM active pane = `account`; active sidebar row = `Account`. |

## C3-CHROME-2 Evidence

| Query | Chrome result |
|---|---|
| `pomodoro` | `PomodoroPomodoro`; no `No results`; optionCount = 2 |
| `task` | `stat-tasks`; no `No results`; optionCount = 1 |
| `tomato` | `Pomodoro`; no `No results`; optionCount = 1 |

## C3-CHROME-3 Evidence

The Map fix was validated on a fresh origin because prior Chrome smoke runs had already persisted old board data on `127.0.0.1` and `localhost`.

| Origin | Chrome result |
|---|---|
| `http://10.252.59.152:3000/app/board` | PASS — body does not contain `No location pins`; OSM attribution visible; 3 `.leaflet-marker-icon` elements rendered. |
| `http://127.0.0.1:3000/app/board` | Stale local data caveat — still shows `No location pins` because persisted `xai_boards_v2` predates the seed-location fix. |
| `http://localhost:3000/app/board` | Stale local data caveat — still shows `No location pins` because persisted `xai_boards_v2` predates the seed-location fix. |

## Console

No app console errors were observed. Chrome emitted one extension-scoped error from `chrome-extension://lkmpdpkkkeeoiodlnmlichcmfmdjbjic/mf.js` (`Params are not set`), unrelated to the app origin.

## Gate Interpretation

The three Chrome findings from Codex's original smoke are resolved for the fresh Chrome first-run path:

- C3-CHROME-1: PASS
- C3-CHROME-2: PASS
- C3-CHROME-3: PASS on fresh first-run origin

Do not treat stale local origins as proof of regression unless the product wants a migration/backfill that injects `location` into already-persisted demo boards.

