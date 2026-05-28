# desktop-global-hotkey-quick-open — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-global-hotkey-quick-open |
| Title | Phase 2 Desktop Global Hotkey Quick Open |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (Codex, gpt-5.3-codex inline) |
| Updated | 2026-05-28 04:18 PDT |
| Brief | `docs/reviews/desktop-global-hotkey-quick-open/20260528-feature-brief.md` |
| Discovery Review | `docs/reviews/desktop-global-hotkey-quick-open/20260528-discovery-review.md` |
| Risks | Real macOS conflict behavior and the recreate-if-absent `main`-window path still need hardware verification; the selected `AppProviders` bridge must keep `apps/web` browser-safe while native menu changes continue to push fresh snapshots into Settings. |
| Blockers | — |
| Review Notes | APPROVED. The revise pass made the Tauri capability boundary explicit in discovery/design/api/test (`apps/desktop/src-tauri/capabilities/default.json` only, `windows: ["main"]` preserved, no guest `global-shortcut:*` permissions) and froze the browser-safe integration boundary to an `AppProviders`-mounted bridge with `hotkeysPane.tsx` as a pure consumer. Build may proceed phase by phase; residual risk remains limited to real-macOS conflict behavior and `main`-window recreate validation during verify. |

## Phase Plan

### Phase 1 — Native Shortcut Foundation

Status: DONE

- Add the official Tauri global-shortcut plugin dependency and startup init.
- Audit `apps/desktop/src-tauri/capabilities/default.json` as the only capability file in scope; preserve `windows: ["main"]`, keep the existing host-bridge permissions, and do not add guest `global-shortcut:*` permissions.
- Add a dedicated Rust module for registration, unregistration, trigger handling, snapshot publication, and runtime-state classification.
- Implement a safe `main`-window show/focus helper that never touches overlay/grid/control windows.

### Phase 2 — Host Config Migration and Persistence

Status: DONE

- Extend `app_config.rs` from schema v1 to v2 with `quickOpen`.
- Migrate existing config forward without losing `window.main`.
- Persist only desired quick-open preference fields and keep runtime failure state in memory.

### Phase 3 — Browser-safe Settings Bridge and Menu Recovery

Status: DONE

- Add `packages/desktop-global-hotkey-quick-open/` with a browser-safe `/web` entrypoint and host-injected adapter contract.
- Mount the bridge from `apps/web/src/providers/AppProviders.tsx`; `packages/plugin-web-settings-rest/src/panes/hotkeysPane.tsx` stays a consumer of feature state.
- Extend the existing Settings hotkeys pane with a desktop quick-open section.
- Add minimal Help-menu disable/reset actions wired to the same host apply path.

### Phase 4 — Verification Surface

Status: DONE

- Add Rust tests for migration, preset mapping, registration-state classification, and menu IDs.
- Add browser-safe settings tests for snapshot display, disabled state, preset changes, and conflict rendering.
- Run cargo/web/desktop build gates and record real macOS manual smoke expectations.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-28 03:37 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: normalized the roadmap seed into a formal feature brief, reviewed the shipped normal-window desktop host plus the existing host config/menu ownership boundaries, compared official and lower-level global-shortcut options against current Tauri 2 guidance, and wrote discovery/design/api/test/dev_log artifacts. Recommended the official Rust-side Tauri global-shortcut plugin, a v2 extension of the existing `app-config.json`, runtime-only conflict state, a browser-safe desktop hotkey package for the Settings hotkeys pane, and minimal Help-menu disable/reset recovery actions. | — | feature-review |
| 2026-05-28 03:50 PDT | feature-review (Codex, gpt-5 inline) | Review verdict REVISE. The plan is directionally correct, but it does not yet carry the repo's required Tauri capability-file surface into the implementation phases and it leaves the browser-safe bridge mount/lifecycle choice implicit. Sent back to feature-plan to lock those boundaries in discovery/design/api/test/dev_log before build starts. | — | feature-plan |
| 2026-05-28 03:54 PDT | feature-plan (Codex, gpt-5 inline) | Revise pass: froze `apps/desktop/src-tauri/capabilities/default.json` as the only capability file in scope, documented the exact retained permission surface plus the explicit non-use of guest `global-shortcut:*` permissions, and locked the browser-safe runtime boundary to an `AppProviders`-mounted bridge with `hotkeysPane.tsx` as a pure consumer. Updated discovery/design/api/test/dev_log so native menu changes and settings writes now share one Rust apply path and one subscription lifecycle. | — | feature-review |
| 2026-05-28 04:00 PDT | feature-review (Codex, gpt-5 inline) | Review verdict APPROVED. Re-checked the revised discovery/design/api/test/dev_log set and confirmed the prior blockers are resolved: the capability surface is now explicitly frozen to `apps/desktop/src-tauri/capabilities/default.json` with `windows: ["main"]` preserved and no guest `global-shortcut:*` permissions, and the browser-safe integration boundary is locked to an `AppProviders`-mounted bridge with `hotkeysPane.tsx` consuming shared feature state. | — | feature-build |
| 2026-05-28 04:18 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 1 implementation: added Rust-owned global shortcut foundation with `tauri-plugin-global-shortcut`, new `commands/global_hotkey.rs`, main-window allowlist checks, snapshot command contract, trigger-to-main-window focus path, startup initialization, and native Help-menu disable/reset hooks. | `88453fd0` feat(tauri): Phase 1 — add desktop quick-open global shortcut | Phase 2 |
| 2026-05-28 04:18 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 2 implementation: upgraded `app_config` schema v1→v2 with `quickOpen` persistence (`presetId` / `accelerator` / `enabled`), added migration helpers and tests, and wired quick-open preference save/load through command and menu apply paths while keeping runtime conflict/native errors in memory. | `88453fd0` feat(tauri): Phase 1 — add desktop quick-open global shortcut | Phase 3 |
| 2026-05-28 04:18 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 3 implementation: added browser-safe `@repo/desktop-global-hotkey-quick-open` package, mounted bridge in `apps/web/src/providers/AppProviders.tsx`, extended `hotkeysPane.tsx` as a pure consumer with preset/disable/reset controls and status badges, and injected host adapter script without introducing `@tauri-apps/*` or `__TAURI__` into web source. | `d8607e17` feat(desktop): Phase 3 — mount browser-safe quick-open bridge; `f0168856` feat(plugin-web-settings-rest): Phase 3 — quick-open controls in hotkeys pane | Phase 4 |
| 2026-05-28 04:18 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 4 verification surface: expanded Rust/unit and web bridge/pane tests; executed required gates (`cargo test`, package tests, web provider test, web build browser-safety check, capability grep, and desktop debug app bundle build). Evidence confirms `default.json` keeps `windows: [\"main\"]` and no guest `global-shortcut:*` permission entries were added. | `88453fd0`; `d8607e17`; `f0168856` | feature-verify |
