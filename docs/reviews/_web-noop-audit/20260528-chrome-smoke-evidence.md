# Chrome Real-Browser Smoke Evidence — Audit Top-10 + Option A fixes

**Date:** 2026-05-28
**Browser:** Chromium (via Claude Preview MCP), real DOM + real localStorage
**Server:** `apps/web` Vite dev (`VITE_WEB_AUTH_MODE=mock-authenticated`, port 3000)
**Method:** Drove the live app — clicked real buttons, filled real composers, read real `localStorage`, reloaded to test persistence. NOT jsdom; NOT static analysis.
**Authority:** Discharges the Chrome portion of the cross-vendor smoke debt deferred per ADR-0008 §S3 across the 2026-05-27→28 Audit fix wave. Safari / Firefox / iOS Safari remain deferred (no real-device access from this session).

---

## Result: 12 / 12 fixes PASS in real Chrome

| # | Feature | What was clicked | Evidence | Verdict |
|---|---|---|---|---|
| 1 | Sign-out (AvatarMenu) | Avatar → Sign Out | `SignOutConfirmDialog` opened ("Sign out? You'll be signed out of this browser…"); Cancel preserved session (still on `/app/`) | ✅ PASS |
| 2 | Calendar `+` event | toolbar `+` → fill → Save | `EventComposer` opened (Title/Date/Start/End/Color×5/Recurrence); created event in DOM; persisted to `xai_calendar_events` | ✅ PASS |
| 3 | Tasks `+` add card | column `+` → fill → Add | `TaskComposer` opened (default bucket = clicked column); created in DOM; persisted to `xai_task_cols`; **survived hard reload** | ✅ PASS |
| 4 | Matrix Add | quadrant `+` → fill → Add | `MatrixComposer` opened (default quadrant = clicked); created in DOM; persisted to `xai_matrix_state` | ✅ PASS |
| 5 | Board onOpenCard | clicked a board card | `CardDetailDialog` opened ("Pet animation rig", LIST/CHECKLIST) — the former 5-view dead callback now wired | ✅ PASS |
| 6 | Stickies `+` (+delete) | widget `+` → fill → Save; then `×` delete | `StickyComposer` opened (Note/Color×5); created + persisted to `xai_dashboard_stickies`; delete removed from DOM + storage | ✅ PASS |
| 7 | Topbar persist | clicked Compact + 中文, reloaded | `xai_pref_density="compact"` + `xai_pref_lang="zh"` written; **survived reload** + consumed (`data-density=compact`, UI rendered Chinese) | ✅ PASS |
| 8 | Rail icons HIDE | inspected rail | Rail shows only 12 real nav routes + settings; **no sync/notif/help** no-op icons | ✅ PASS |
| 9 | Widget remove | "Remove Weather widget" | `weather` removed from `xai_dash_order` + gone from DOM | ✅ PASS |
| 10 | About links disabled | inspected About pane | All 4 (Changelog/Privacy/Terms/Feedback) = `<span aria-disabled="true" title="Coming soon">`, `cursor:not-allowed`, `opacity:0.55`, **0 anchors** | ✅ PASS |
| B-12 | Delete board confirm | board trash → dialog | `BoardDeleteConfirmDialog` (mode=board) opened with warning; Cancel preserved board (DOM + `xai_boards_v2`) | ✅ PASS |
| B-28 | Delete inbox card confirm | added card → Remove → dialog | `BoardDeleteConfirmDialog` (mode=card) opened; Delete card removed from DOM + `xai_board_inbox` | ✅ PASS |

## Persistence keys exercised (real round-trips)

`xai_task_cols`, `xai_matrix_state`, `xai_calendar_events`, `xai_dashboard_stickies`, `xai_dash_order`, `xai_pref_density`, `xai_pref_lang`, `xai_boards_v2`, `xai_board_inbox` — all confirmed read/write in a real browser.

## Notes / limitations

- Server required `VITE_WEB_AUTH_MODE=mock-authenticated` to reach `/app/*` (auth wall otherwise). Real-auth + external-provider flows NOT covered here.
- `dialog[open]` selector intermittently failed to match the confirm modals (composers may not be native `<dialog>` in all cases, or render-timing) — verified via screenshot + text/state instead. Non-blocking; functional behavior confirmed visually.
- Test artifacts (SMOKE-0528 task/matrix/calendar entries) live only in the preview browser's localStorage — they do NOT touch the repo or any committed fixture.

## Still deferred (NOT covered by this pass)

- **Safari 17 / Firefox 121 / iOS Safari** — no real-device access from this session. Still required before next `xai-web-deploy-cloudflare` ship per ADR-0008 §S3.
- Real-auth sign-out completion (only the confirm dialog was exercised; actual sign-out not executed to preserve the smoke session).
- The 2 genuine RED tests from the recheck (meditation `AC-PICK-6`, board-views `FVI-Timeline` date-drift) are test-brittleness, unrelated to these 12 fixes — separate fast-follow.
- Non-fix gaps from the recheck remain (mock widgets Mail/Upcoming/Weather, Tasks T-10 completion persistence, smart-list filtering, AI tool layer, Statistics real aggregation).
