# desktop-native-notifications-reminders — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-native-notifications-reminders |
| Title | Phase 2 Desktop Native Notifications and Reminder Presentation |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (Codex, gpt-5.3-codex inline) |
| Updated | 2026-05-28 02:13 PDT |
| Risks | The build must preserve the browser-safety gate by keeping native notification access behind a host-injected adapter, and task/calendar reminder support must remain limited to the exact public v1 subsets documented in `api.md` rather than drifting into hidden storage or sync semantics. |

## Review Notes

- Remaining blocker resolved. The revised artifacts now consistently target the real stable public packages `@repo/plugin-web-tasks` and `@repo/plugin-web-calendar`, while keeping directory-path references at `packages/xai-web-tasks/` and `packages/xai-web-calendar/` where applicable.
- The previously approved browser-safe runtime seam remains intact: `apps/web` imports only `@repo/desktop-native-notifications-reminders/web`, the bridge stays browser-safe, and the Tauri notification guest surface remains isolated behind host-injected `window.__XAI_DESKTOP_NOTIFICATION__`.
- The exact v1 supported subsets and explicit `unsupported` semantics for task/calendar reminder projection remain intact and implementation-safe.

## Revision Response

- Addressed in this revise pass:
  - public projector/export targets now consistently use `@repo/plugin-web-tasks` and `@repo/plugin-web-calendar` in the discovery review, design snapshot, API contract, test plan, and Phase 2 plan text
  - directory-path references remain unchanged where they correctly point to `packages/xai-web-tasks/` and `packages/xai-web-calendar/`
- Intentionally not changed:
  - the approved browser-safe `@repo/desktop-native-notifications-reminders/web` plus host-injected `window.__XAI_DESKTOP_NOTIFICATION__` seam
  - the exact frozen v1 projector support boundaries and `unsupported` semantics

## Phase Plan

### Phase 1 — Native Transport and Injected Adapter

Status: DONE

- Add the official Tauri notifications plugin in the desktop host.
- Enable the minimum Tauri config/runtime support needed for a host-injected adapter.
- Inject `window.__XAI_DESKTOP_NOTIFICATION__` from the desktop host, outside the `apps/web` bundle.
- Create a feature-owned browser-safe `/web` bridge for permission state, quiet hours, dedup, and status mapping.

### Phase 2 — Reminder Source Projectors and Settings Integration

Status: DONE

- Reuse the existing stable pomodoro completion event.
- Add `projectDesktopTaskReminderEntries(...)` to `@repo/plugin-web-tasks` with support limited to parseable absolute `TaskCard.date` values and all-day reminder prefs only.
- Add `projectDesktopCalendarReminderEntries(...)` to `@repo/plugin-web-calendar` with support limited to timed events in the active month dataset.
- Add calendar notification toggle/status wiring in Settings.
- Leave habit notification wiring untouched in this row.

### Phase 3 — Verification and Smoke Evidence

Status: DONE (implementation-side evidence complete; real macOS prompt/smoke retained for feature-verify gate)

- Add web/unit coverage for the browser-safe bridge and injected adapter seam.
- Add projector coverage for the exact task/calendar subsets and `unsupported` results.
- Run web build + browser-safety grep + cargo + desktop bundle verification.
- Record real macOS smoke evidence for:
  - permission granted
  - permission denied
  - disabled
  - task reminder
  - pomodoro completion
  - calendar reminder
  - unsupported

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-28 01:29 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: read the roadmap seed, workflow docs, PLUGIN_MAP, desktop host/native menu baseline, stable web notification prefs, and current pomodoro/task/calendar surfaces. Selected the official Tauri notification plugin plus a feature-owned desktop bridge as the recommended design. Constrained runtime dependencies to stable web packages only, required additive public reminder-candidate exports for tasks/calendar, and documented explicit `disabled` / `denied` / `unsupported` states so Phase 2 does not drift into Phase 3 storage or sync work. | — | feature-review |
| 2026-05-28 01:37 PDT | feature-review (Codex inline) | Review pass: validated the roadmap seed, discovery report, desktop host/native menu baseline, existing web notification prefs, browser-safety guard, and current pomodoro/task/calendar package surfaces. Sent the plan back for revision because the desktop-only Tauri notification import seam is not yet frozen against the active `apps/web` browser-safety contract, and because the task/calendar reminder-source contract still leaves Phase 2 acceptance dependent on uncommitted assumptions about representable reminder data. | — | feature-plan |
| 2026-05-28 01:42 PDT | feature-plan (Codex, gpt-5.3-codex inline) | Revise pass: re-read the review notes plus the live host/runtime/task/calendar code. Froze a browser-safe runtime split where `apps/web` mounts only `@repo/desktop-native-notifications-reminders/web`, the desktop host injects `window.__XAI_DESKTOP_NOTIFICATION__` outside the `apps/web` bundle, and the browser-safety build gate remains authoritative. Replaced vague task/calendar assumptions with exact additive exports (`projectDesktopTaskReminderEntries(...)`, `projectDesktopCalendarReminderEntries(...)`), exact v1 supported inputs, and explicit `unsupported` reasons for non-representable shapes. Updated discovery/design/api/test to match and returned the row to review. | — | feature-review |
| 2026-05-28 01:50 PDT | feature-review (Codex, gpt-5.3-codex inline) | Re-review pass: confirmed the two prior blockers are resolved in substance. The browser-safe runtime seam is now correctly frozen around `@repo/desktop-native-notifications-reminders/web` plus host-injected `window.__XAI_DESKTOP_NOTIFICATION__`, and the task/calendar reminder-source contract now defines exact v1 supported subsets with explicit `unsupported` semantics. Sent the plan back for one more revise pass because the revised artifacts still identify the task/calendar projector targets as nonexistent packages (`@repo/xai-web-tasks`, `@repo/xai-web-calendar`) instead of the real stable public packages `@repo/plugin-web-tasks` and `@repo/plugin-web-calendar`, which keeps the contract from being implementation-safe. | — | feature-plan |
| 2026-05-28 01:52 PDT | feature-plan (Codex, gpt-5.3-codex inline) | Second revise pass: applied the review-note package-target correction across the discovery review, design snapshot, API contract, test plan, and Phase 2 plan text. Public projector/export references now consistently target `@repo/plugin-web-tasks` and `@repo/plugin-web-calendar`, while directory paths remain `packages/xai-web-tasks/` and `packages/xai-web-calendar/`. Preserved the approved browser-safe `@repo/desktop-native-notifications-reminders/web` plus host-injected `window.__XAI_DESKTOP_NOTIFICATION__` seam and kept the exact frozen v1 projector/`unsupported` semantics unchanged. | — | feature-review |
| 2026-05-28 01:54 PDT | feature-review (Codex, gpt-5.4 inline) | Final re-review pass: verified against repo truth that the remaining package/export blocker is resolved in the discovery review, design snapshot, API contract, test plan, and phase plan. Confirmed the real public packages are `@repo/plugin-web-tasks` and `@repo/plugin-web-calendar`, their directories remain `packages/xai-web-tasks/` and `packages/xai-web-calendar/`, and the previously approved browser-safe adapter seam plus exact v1 `unsupported` semantics remain intact. Marked the plan APPROVED for implementation. | — | feature-build |
| 2026-05-28 02:09 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 1 — Native transport and injected adapter: added `tauri-plugin-notification`, enabled `app.withGlobalTauri`, granted `notification:default` capability, injected `window.__XAI_DESKTOP_NOTIFICATION__` through a host-owned init script, scaffolded `@repo/desktop-native-notifications-reminders` (`./web` browser-safe surface), mounted bridge at `apps/web/src/providers/AppProviders.tsx`, and added public v1 reminder projector exports on `@repo/plugin-web-tasks` / `@repo/plugin-web-calendar`. | `d416f6c5` | Phase 2 |
| 2026-05-28 02:10 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 2 — Reminder source integration: wired new `xai_pref_notif_push_calendar` pref + registry tests, connected Notifications pane calendar toggle and desktop permission/status copy/action to runtime snapshot, and preserved habit toggle untouched. | `ad5bc71d` | Phase 3 |
| 2026-05-28 02:13 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 3 — Verification evidence and tests: added projector unit coverage for task/calendar v1 subset + unsupported semantics; validated browser-safe bridge mount test; executed web build/no-tauri-leak grep, Rust tests, and debug app bundle build. `plugin-web-storage` parity test referencing `web design/DESIGN.md` remains environment-deferred because that file is absent in this checkout; targeted registry test passed. | `(this commit)` | feature-verify |
