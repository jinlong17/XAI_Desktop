# Feature Brief — desktop-phase1-build-packaging-pipeline

| Field | Value |
|---|---|
| Feature | desktop-phase1-build-packaging-pipeline |
| Title | Phase 1 Desktop Build and Packaging Pipeline |
| Date | 2026-05-27 |
| Source | ADR-0011 Phase 1 first wave; `docs/audit/2026-05-26-patch-roadmap-source.md` first-wave feature #3 |
| Executor | feature-plan (Codex, gpt-5.4 inline) |

## Requirement

Wire the Phase 1 Tauri desktop wrapper so `apps/desktop` has clear package scripts, builds against the already-shipped `apps/web` static dist, and can produce a locally verifiable Mac artifact with an offline launch smoke path.

## Naming Rationale

`desktop-phase1-build-packaging-pipeline` is already the canonical slug in ADR-0011 follow-up audit material and the patch roadmap source. The name matches the actual gap:

- `desktop` — scope is the Phase 1 Tauri host on `dev`
- `phase1` — no Phase 2 native polish or Phase 3 local-first work
- `build-packaging-pipeline` — the missing work is the packaging entrypoint, artifact verification path, and DMG/app-bundle validation contract

## Scope

- Desktop package script contract in `apps/desktop/package.json`
- Tauri build ownership and artifact contract in `apps/desktop/src-tauri/tauri.conf.json`
- Local packaging verification docs and smoke workflow:
  - `docs/release/dmg-build.md`
  - feature-local review evidence under `docs/reviews/desktop-phase1-build-packaging-pipeline/`
- Offline launch smoke path for the built desktop artifact
- Verification that default startup remains a single normal window and does not reactivate overlay/control/grid startup

## Non-goals

- No redesign of `apps/web` modules or web business logic
- No reintroduction of overlay/control/grid startup behavior
- No Phase 2 native work: notifications, status bar, global hotkeys, auto-update, full menu expansion
- No Phase 3 SQLite, local-first repository, sync, or cloud-account architecture
- No deletion of the quarantined legacy overlay/control/grid implementation
- No mandatory signing, notarization, updater, or CI pipeline rollout beyond documenting exact local blockers

## Acceptance

- Planning artifacts exist for this feature: brief, discovery review, design, api, test, and dev_log
- The plan makes `apps/desktop` the canonical packaging entrypoint instead of a loose set of raw Tauri commands
- The selected option keeps `frontendDist = ../../web/dist` and the existing desktop mock-auth build hooks as the Phase 1 source-of-truth contract
- Verification requirements cover both:
  - successful `.app` bundle generation and offline launch smoke
  - `.dmg` generation when the local macOS packaging toolchain cooperates, or exact blocker capture plus best local substitute when it does not
- The plan explicitly checks that default launch is still one normal window with no overlay/control/grid startup

## Current Baseline

- `desktop-tauri-web-dist-normal-window` is SHIPPED and already repointed Tauri to `apps/web`
- `desktop-web-auth-offline-mode` is READY_TO_SHIP and already makes `tauri dev` / `tauri build` inject `VITE_WEB_AUTH_MODE=mock-authenticated`
- `apps/desktop/src-tauri/tauri.conf.json` already points `frontendDist` at `../../web/dist`
- Prior verification already proved `pnpm --filter desktop tauri build --debug --bundles app` can produce `X Desktop.app`
- A local planning-time check on 2026-05-27 reached the DMG stage with `pnpm --filter desktop tauri build --debug --bundles dmg`, but stalled after `Running bundle_dmg.sh` when Tauri spawned `/usr/bin/osascript ... createdmg.tmp ...` and no `.dmg` was emitted before manual termination

## Deferred Validation

- `pnpm --filter desktop dev`
- `pnpm --filter desktop build`
- `pnpm --filter desktop build:dmg`
- `pnpm --filter desktop smoke:offline` or equivalent scripted smoke path chosen during build
- `pnpm --filter @repo/web build`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- Manual macOS app-bundle launch with network disabled
- Manual macOS DMG mount/install/launch if local DMG creation becomes available
