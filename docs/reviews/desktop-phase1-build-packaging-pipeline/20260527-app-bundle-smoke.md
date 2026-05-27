# App Bundle Smoke — desktop-phase1-build-packaging-pipeline

- Date: 2026-05-27 (PDT)
- Scope: ADR-0011 Phase 1 desktop `.app` artifact and startup-contract evidence

## Commands

```bash
pnpm --filter @repo/web build
pnpm --filter desktop dev
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm --filter desktop build
```

## Observed Results

- `pnpm --filter @repo/web build`: PASS.
- `pnpm --filter desktop dev`: PASS (bounded probe).
  - Script resolved to `tauri dev`.
  - Tauri ran `beforeDevCommand`: `VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web dev`.
  - Dev path continued into Rust host run (`cargo run --no-default-features`).
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`: PASS (47 passed, 0 failed).
- `pnpm --filter desktop build`: PASS.
  - Output: `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`.

## Artifact Evidence

- Confirmed bundle directory contains:
  - `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`

## Startup Contract Evidence

- Runtime output during bounded `desktop dev` probe included:
  - `🪟 Main window configured for standard app behavior`
- This aligns with Phase 1 expectations:
  - single normal window startup path
  - no overlay/control/grid auto-start contract in this packaging feature

## Manual GUI / Offline Checks

- Full GUI interaction checks (disable network, launch bundled `.app`, inspect route and window count) were not executed in this non-interactive CLI run.
- Best local substitute recorded here:
  - verified desktop script now routes through Tauri host startup path
  - verified `.app` artifact generation path
- Remaining manual checks for `feature-verify` on real macOS hardware:
  - disable network and launch bundled `.app`
  - confirm bundled local `/app` entry
  - confirm no overlay/control/grid default startup
