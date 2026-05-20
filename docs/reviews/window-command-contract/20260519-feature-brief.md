# Feature Brief — window-command-contract

| Field | Value |
|---|---|
| Feature | window-command-contract |
| Gate | G1 — native foundation |
| Source | docs/planning/execution/G1-native-foundation.md §G1.1 |
| Date | 2026-05-19 |
| Executor | Codex serial inline conductor |

## Requirement

Prepare the G1.1 Window Command Contract so that, after G0 is unblocked, implementation can stabilize Grid window lifecycle commands around Rust-owned labels, typed inputs/outputs, and code/message errors.

## Scope

- Document target contract types and implementation phases.
- Cross-check against `docs/contracts/tauri-commands-v0.md`.
- Do not modify production Rust/TS command code while G0 remains BLOCKED.
- Mark implementation BLOCKED_BY_G0.

## Non-goals

- No `commands/window.rs` production changes.
- No capability allowlist changes.
- No `packages/core/src/types/window.ts` production file creation yet.
- No G1 claim of implementation readiness.

## Acceptance

- Feature docs exist with target types, API contract, test plan, and dev_log.
- Status is BLOCKED because G0 has not reached Go/Conditional Go.
- Deferred gate clearly points to G0 manual evidence.

## Tests

- Safe prep check: docs exist.
- Deferred implementation checks:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
  - `pnpm --filter @repo/core test`
  - `pnpm --filter desktop build`

## Contract Impact

Planning only. `docs/contracts/tauri-commands-v0.md` already contains the target command names and error shape; no contract change is made until implementation starts.

