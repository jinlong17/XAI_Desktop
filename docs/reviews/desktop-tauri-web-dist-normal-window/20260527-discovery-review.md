# Discovery Review — desktop-tauri-web-dist-normal-window

## Problem Framing

ADR-0011 redefines P1 as a normal Tauri Mac app that wraps `apps/web` static assets. The current `apps/desktop` host still implements the superseded overlay product:

- `tauri.conf.json` points to the desktop Vite app (`beforeDevCommand: pnpm dev`, `devUrl: http://localhost:1420`, `frontendDist: ../dist`) and configures a transparent, undecorated, non-resizable, skip-taskbar window.
- `lib.rs` still configures the main window as an overlay, resizes it to the full monitor, installs the sync tray surface, and creates the `control` window at startup.
- `window_ext.rs` still owns overlay-specific behaviors: all-spaces, transparent background, desktop icon window levels, and `ignoresMouseEvents`.
- `commands/window.rs` still exposes `grid_*` and `console` lifecycle behavior tied to legacy multi-window scope.
- `App.tsx` still mounts `@repo/plugin-organizer`, DnD, Settings, and click-through UI assumptions.

At the same time, `apps/web` is already the intended Phase 1 UI source:

- `apps/web/package.json` exposes stable `dev` and `build` scripts.
- `apps/web/vite.config.ts` already builds a real dist with a Vite manifest.
- ADR-0011 and the 2026-05-26 audit both treat `apps/web` as sufficient UI parity for the Phase 1 wrap.

## External Research

No external research required. This feature is an internal host reconfiguration and de-scope of legacy desktop surfaces.

## Candidate Options

### Option A — Repoint Tauri directly to `apps/web` and demote the desktop React shell to legacy fallback

Change Tauri dev/build to consume `apps/web`, turn the main window into a normal resizable app window, stop overlay/control/grid startup, and remove the Phase 3 capability surface from active use.

Pros:

- Matches ADR-0011 exactly.
- Keeps Phase 1 focused on shell conversion, not UI porting.
- Minimizes accidental dependency on legacy organizer overlay code.

Cons:

- `apps/desktop/src/App.tsx` becomes non-primary and should be reduced to a minimal stub to avoid drift.
- Some legacy Rust/window command code may remain in-tree but inactive until later cleanup.

### Option B — Keep Tauri pointed at the desktop Vite app and port `apps/web` into that shell

Rebuild the current desktop React app as a new normal-window host while retaining `apps/desktop` as the primary frontend bundle.

Pros:

- Leaves Tauri build wiring mostly local to `apps/desktop`.
- Keeps `App.tsx` on the active path.

Cons:

- Repeats the same UI assembly work already solved in `apps/web`.
- Increases the risk of dual-shell drift between `dev` and `web`.
- Conflicts with ADR-0011's chosen "wrap `apps/web` dist" direction.

### Option C — Embed `apps/web` inside the existing desktop frontend shell

Use an iframe or secondary mount path so the current desktop bundle still boots but hosts the web UI inside it.

Pros:

- Appears to preserve current code paths.

Cons:

- Adds an unnecessary shell-within-a-shell.
- Retains overlay-era providers, routes, and capability assumptions.
- Makes later Phase 1 debugging and packaging harder, not easier.

## Recommendation

Choose Option A.

The repo already has the correct UI source in `apps/web`, and the main blocker is the superseded desktop shell. The safest Phase 1 move is to repoint Tauri to the web app, make the main window normal and decorated/resizable, and stop exposing the legacy overlay/control/grid lifecycle at startup.

## Selected Execution Notes

- `tauri.conf.json` should switch dev/build ownership from the desktop Vite app to `apps/web`.
- `apps/desktop/package.json` should reflect that Tauri dev/build now proxy `apps/web` scripts instead of the legacy desktop frontend.
- `App.tsx` should no longer import organizer/DnD/provider stacks that encode click-through overlay behavior; it should become a minimal fallback or compatibility stub only.
- `lib.rs` should stop calling overlay-specific setup, full-monitor resize logic, tray bootstrap tied to the old sync surface, and `control` window creation.
- `window_ext.rs` should be reduced to normal-window helpers only; overlay-specific level and click-through helpers move out of the active Phase 1 path.
- Capabilities should no longer grant `control`, `console`, or `grid_*` window surface by default for Phase 1.

## Risks

- `desktop-web-auth-offline-mode` is a required follow-on. Repointing to `apps/web` alone does not guarantee `/app` opens offline.
- Disabling legacy window commands too aggressively could break unplanned desktop consumers; feature-build must confirm there is no active Phase 1 caller before removing registrations.
- The tray/status surface is Phase 2 scope, but `lib.rs` currently boots it during app setup. The build phase must explicitly decide whether to remove startup entirely or leave inert code only.
- The relative `frontendDist` path from `apps/desktop/src-tauri` to `apps/web/dist` must be validated on real build commands, not inferred only from docs.

## Open Questions

- Should `commands/window.rs` stay compiled but unregistered, or should Phase 1 return an explicit `unsupported` error for legacy callers? Recommendation: unregister first; only add explicit errors if a real caller remains.
- Should the repo keep a browsable `apps/desktop` frontend fallback after the Tauri handoff, or reduce it to a small maintenance stub immediately? Recommendation: reduce it immediately to avoid accidental overlay regressions.

## Phased Build Outline

1. Repoint Tauri dev/build to `apps/web`, and reduce `App.tsx` to non-overlay fallback.
2. Remove overlay/control/grid startup and normalise the main window setup in Rust/macOS helpers.
3. Narrow capabilities and command registration, then verify normal window launch, no hidden overlay startup, and bundled static launch with network disabled.
