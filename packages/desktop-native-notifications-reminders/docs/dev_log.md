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
| Updated | 2026-05-28 02:41 PDT |
| Risks | Denied/unsupported automated coverage is now explicit, and manual-smoke cases are recorded with deterministic BLOCKED_ENVIRONMENT provenance. Independent feature-verify still must confirm final gate disposition. |

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

## Verification Result

- Commit review:
  - `d416f6c5`, `ad5bc71d`, `70176923`, `6f3f6ecc`, and `cca1f129` all follow the required `type(scope): summary` format with Why / What / Scope / Risk / Docs / Tests bodies where applicable.
  - `cca1f129` is a narrow docs-only follow-up that records the R1 hash in `dev_log.md` and does not mix feature behavior changes into a documentation commit.
- Independent checks rerun by feature-verify:
  - `pnpm --filter @repo/desktop-native-notifications-reminders test -- src/bridge.test.tsx src/runtime.test.ts`
  - `pnpm --filter @repo/desktop-native-notifications-reminders check-types`
  - `pnpm --filter @repo/plugin-web-tasks test -- src/__tests__/projectDesktopTaskReminderEntries.test.ts`
  - `pnpm --filter @repo/plugin-web-calendar test -- src/__tests__/projectDesktopCalendarReminderEntries.test.ts`
  - `pnpm --filter @repo/plugin-web-storage test -- src/__tests__/registry.test.ts`
  - `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/notificationsPane.test.tsx`
  - `pnpm --filter @repo/web test -- src/providers/AppProviders.test.tsx`
  - `pnpm --filter @repo/web build`
  - `rg "@tauri-apps|__TAURI__" apps/web/src packages/desktop-native-notifications-reminders/src` → clean
  - `rg "@tauri-apps|__TAURI__" apps/web/dist/assets/*.js` → clean
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
  - `pnpm --filter desktop tauri build --debug --bundles app`
- Resolved blocker re-check:
  - Calendar delivery is no longer short-circuited by the task toggle. The focused bridge test verifies `task=false` plus `calendar=true` still delivers the calendar reminder path.
  - The exported `/web` runtime now emits the explicit `disabled` state when `xai_pref_notif_enabled=false`, and that state persists through unsupported-count refreshes.
- Blocking findings:
  - The verification contract in `packages/desktop-native-notifications-reminders/docs/test.md` still requires explicit denied / unsupported-state evidence in the runtime/UI surface, but the current automated coverage does not exercise those cases. `notificationsPane.test.tsx` covers only the `permission-required` path, and `runtime.test.ts` covers only the `disabled` path, leaving the promised denied / unsupported-state assertions unverified.
  - Phase 3 and `test.md` also require real macOS smoke evidence for permission granted, permission denied, disabled, task reminder, pomodoro completion, calendar reminder, and unsupported scenarios. No such smoke evidence is recorded in this feature’s docs or work log, so the feature-verify gate is still incomplete even though the automated build/test gates are green.
- Repair R2 resolution notes:
  - Added denied/unsupported runtime coverage in `packages/desktop-native-notifications-reminders/src/runtime.test.ts`:
    - denied via `requestDesktopNotificationPermission()`
    - unsupported via `adapter_unavailable`
    - unsupported via `non_desktop_runtime`
  - Added denied/unsupported UI copy coverage in `packages/plugin-web-settings-rest/src/__tests__/notificationsPane.test.tsx`.
  - Recorded deterministic non-interactive manual smoke artifact at `packages/desktop-native-notifications-reminders/docs/manual_smoke_evidence.md`, classifying each required macOS smoke scenario as `BLOCKED_ENVIRONMENT` with exact shell/session provenance and no PASS claims.

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
| 2026-05-28 02:20 PDT | feature-verify (Codex, gpt-5.3-codex inline) | Verification pass: reviewed commits `d416f6c5`, `ad5bc71d`, and `70176923` against the approved discovery/design/api/test docs and reran the documented command set. Browser-safety, package tests, web build, Rust tests, and the debug app bundle all passed, but verification is blocked by two contract issues: calendar delivery is incorrectly short-circuited by the task-source gate in `packages/desktop-native-notifications-reminders/src/bridge.tsx`, and the exported `/web` runtime never emits the explicit `disabled` status promised in `api.md`. | `d416f6c5 ad5bc71d 70176923` | feature-build |
| 2026-05-28 02:27 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Repair pass — fixed blocked delivery/runtime contracts only: `bridge.tsx` no longer returns early on task-source gating so calendar delivery stays independently governed by `xai_pref_notif_push_calendar`; `runtime.ts` now maps `xai_pref_notif_enabled=false` to explicit `disabled` status across refresh + permission + unsupported-count updates. Added focused tests `src/bridge.test.tsx` and `src/runtime.test.ts` covering both blockers (`task off + calendar on` delivery independence and runtime disabled snapshot emission/persistence). Executed: `pnpm --filter @repo/desktop-native-notifications-reminders test -- src/bridge.test.tsx src/runtime.test.ts` and `pnpm --filter @repo/desktop-native-notifications-reminders check-types` (all pass). | `6f3f6ecc` | feature-verify |
| 2026-05-28 02:33 PDT | feature-verify (Codex, gpt-5.3-codex inline) | Post-R1 verification pass: reviewed commits `d416f6c5`, `ad5bc71d`, `70176923`, `6f3f6ecc`, and `cca1f129`; reran the focused repair tests, package tests, browser-safety checks, `pnpm --filter @repo/web build`, `cargo test`, and `pnpm --filter desktop tauri build --debug --bundles app`. The repaired runtime blockers are fixed, but verification remains blocked because denied / unsupported-state evidence required by `test.md` is still missing from automated coverage, and the planned real macOS smoke evidence for granted / denied / disabled / task / pomodoro / calendar / unsupported cases is not recorded. | `d416f6c5 ad5bc71d 70176923 6f3f6ecc cca1f129` | feature-build |
| 2026-05-28 02:41 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Repair R2 — addressed remaining verify blockers without scope drift: added focused denied/unsupported runtime tests (`requestDesktopNotificationPermission` denied, desktop adapter unavailable unsupported, non-desktop runtime unsupported), added Notifications pane denied/unsupported copy assertions, and added deterministic manual-smoke evidence artifact with `BLOCKED_ENVIRONMENT` classification for all required real-macOS smoke cases because this run is non-interactive (`stdin_tty=no`, `TERM=dumb`). Executed: `pnpm --filter @repo/desktop-native-notifications-reminders test -- src/runtime.test.ts`, `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/notificationsPane.test.tsx`, `pnpm --filter @repo/desktop-native-notifications-reminders check-types`, `pnpm --filter desktop tauri build --debug --bundles app` (all pass). | `b1239840` | feature-verify |
