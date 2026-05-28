# desktop-statusbar-quick-actions — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-statusbar-quick-actions |
| Title | Phase 2 Desktop Status Bar Quick Actions |
| Current Phase | FEATURE_REVIEW |
| Status | APPROVED |
| Suggested Next | feature-build |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-review (Codex, gpt-5 inline) |
| Updated | 2026-05-28 02:58 PDT |
| Brief | `docs/reviews/desktop-statusbar-quick-actions/20260528-feature-brief.md` |
| Discovery Review | `docs/reviews/desktop-statusbar-quick-actions/20260528-discovery-review.md` |
| Risks | Owning-module quick-action contracts for pomodoro and tasks do not exist yet; real macOS tray/focus behavior still requires hardware verification; native status must reflect feature-disabled states from the web runtime rather than assuming modules are always available. |
| Review Notes | APPROVED. Discovery, design, API, and test artifacts align with current repo reality and the roadmap constraints. Keep implementation anchored to the existing browser-safe adapter pattern used by `desktop-native-notifications-reminders`, preserve `main`-window-only native scope, and treat `commands/menubar.rs` as prior art rather than the ownership boundary. |

## Phase Plan

### Phase 1 — Native Status Bar Foundation

Status: TODO

- Add a dedicated Rust-owned statusbar module/state under `apps/desktop/src-tauri/src/`.
- Install the tray/status-bar icon and native menu during startup.
- Implement `main`-window focus/show behavior only.

### Phase 2 — Browser-safe Desktop Bridge

Status: TODO

- Add a feature-owned browser-safe bridge package boundary for status snapshots and incoming quick-action requests.
- Mount the bridge from `apps/web/src/providers/AppProviders.tsx`.
- Keep the desktop adapter host-owned and outside the `apps/web` bundle.

### Phase 3 — Owning Quick-action Contracts

Status: TODO

- Additive contract on `@repo/plugin-web-pomodoro` for `desktopAction=start-focus`.
- Additive contract on `@repo/plugin-web-tasks` for `smart=today`.
- Reflect feature-disabled and unsupported states back into the native status snapshot.

### Phase 4 — Verification and Status Polish

Status: TODO

- Add Rust/menu tests, browser-safe bridge tests, and owning-module contract tests.
- Run web build, cargo test, and desktop app-bundle build gates.
- Record real macOS status-bar/focus/manual smoke expectations.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-28 02:51 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: normalized the roadmap seed into a canonical feature brief, reviewed the shipped normal-window desktop host plus existing tray/menu and active web-module surfaces, checked current Tauri tray/menu docs, and wrote discovery/design/api/test/dev_log artifacts. Recommended a new Rust-owned status bar module plus a feature-owned browser-safe desktop bridge, with additive quick-action contracts owned by `@repo/plugin-web-pomodoro` and `@repo/plugin-web-tasks` instead of host-side business logic. | — | feature-review |
| 2026-05-28 02:58 PDT | feature-review (Codex, gpt-5 inline) | Review pass: verified the planning artifacts against the current roadmap row, active Phase 1 desktop host, shipped browser-safe desktop bridge precedent, and stable owning web surfaces. Confirmed the plan keeps native shell behavior in Rust, keeps pomodoro/tasks semantics in their owning packages, preserves the normal-window boundary, and defines a phase split that `feature-build` can execute sequentially. | — | feature-build |
