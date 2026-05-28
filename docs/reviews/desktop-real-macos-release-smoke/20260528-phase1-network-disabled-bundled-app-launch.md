# Phase 1 — Network-disabled Bundled `/app` Launch (2026-05-28)

## Residual Under Test

- Feature: `desktop-real-macos-release-smoke`
- Residual: network-disabled bundled `/app` launch
- Required classification set: `PASS` | `BLOCKED_REPO` | `BLOCKED_ENVIRONMENT` | `DEFERRED_OUT_OF_SCOPE`

## Artifact Provenance

- Branch: `dev`
- Commit under test: `6e92061872b2421676f7d9e0b4096d1464215c89`
- Host OS:
  - `ProductVersion: 26.5`
  - `BuildVersion: 25F71`
  - `uname -a: Darwin ... arm64`
- Fresh build/test commands executed in this run:
  - `pnpm --filter @repo/web build` (PASS)
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` (PASS, `60 passed; 0 failed`)
  - `pnpm --filter desktop build` (PASS)
  - `pnpm --filter desktop build:dmg` (PASS)
  - `pnpm --filter desktop build` (PASS, rerun to restore `.app` bundle after dmg bundling cleanup)
- Bundled app artifact:
  - Path: `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`
  - mtime: `2026-05-28 01:19:41 PDT`
  - Binary SHA-256: `9b09d141dec7ce516324d7a9ca47dbd0dd8f449ce19379d4eef1463ebc997c50`

## Environment Conditions

- Execution context was a non-interactive CLI automation run.
- No trustworthy GUI route observation (`/app` vs `/auth/login`) could be captured in this session.
- No controlled network-disable/enable hardware step was executed by this run.

## Result

- Classification: `BLOCKED_ENVIRONMENT`
- Reason: the residual requires an operator-observed real-macOS GUI launch while network is disabled; this session could produce fresh artifacts but could not execute and verify the required interactive launch condition.

## Repo-side Defect Check

- No repo-side regression was reproduced from available non-GUI evidence.
- No code changes were made.
