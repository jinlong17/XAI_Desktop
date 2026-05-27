# Feature Brief — desktop-tauri-web-dist-normal-window

| Field | Value |
|---|---|
| Feature | desktop-tauri-web-dist-normal-window |
| Title | Phase 1 Desktop Normal Window Loading `apps/web` Dist |
| Date | 2026-05-27 |
| Source | ADR-0011 §D1 Phase 1 first milestone; `docs/audit/2026-05-26-patch-roadmap-source.md` first-wave feature #1 |
| Executor | feature-plan (gpt-5.3-codex) |

## Requirement

Convert `apps/desktop` from the legacy transparent overlay/grid/control host into a normal Tauri Mac app window that loads `apps/web` static assets for Phase 1.

## Naming Rationale

`desktop-tauri-web-dist-normal-window` is already the canonical slug in ADR-0011 follow-up audit material, PLUGIN_MAP, and the patch roadmap source. The name is precise about all three responsibilities:

- `desktop` — scope is the `dev` branch desktop host.
- `tauri-web-dist` — Tauri must load `apps/web` dev/build output instead of the legacy desktop Vite shell.
- `normal-window` — the main window becomes a standard resizable app window, not a transparent overlay.

## Scope

- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/src/lib.rs`
- `apps/desktop/src-tauri/src/platform/macos/window_ext.rs`
- `apps/desktop/src-tauri/src/commands/window.rs`
- `apps/desktop/src-tauri/capabilities/*`
- `apps/desktop/src/App.tsx`
- `apps/desktop/package.json`

## Non-goals

- No Phase 2 native work: notifications, status bar, global hotkeys, auto-update, full desktop polish.
- No `apps/web` source edits in this feature.
- No desktop auth/offline-session policy changes beyond documenting the dependency on the next feature.
- No revival of legacy overlay/grid/control/plugin-organizer runtime behavior.

## Acceptance

- Planning artifacts exist for this feature: brief, discovery review, design, api, test, and dev_log.
- Discovery review covers both the current overlay scaffold and the `apps/web` dev/build contract.
- The design locks the selected approach: repoint Tauri to `apps/web`, disable overlay/control/grid startup, and narrow the exposed desktop capability surface to Phase 1 needs.
- The phase plan is suitable for later `feature-review` and phased `feature-build`.

## Deferred Validation

- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri dev`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- Manual macOS smoke for normal window chrome, no overlay startup, and bundled static launch with network disabled
