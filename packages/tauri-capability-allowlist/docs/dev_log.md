# tauri-capability-allowlist — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | tauri-capability-allowlist |
| Title | G2.5 Tauri capability allowlist audit + db scope file |
| Roadmap | xai-g2-data-security-foundation · feature #6 · G2.5 |
| Status | READY_TO_SHIP |
| Current Phase | VERIFY |
| Suggested Next | manual ship only; MAS signed-runtime smoke deferred |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-build + feature-verify (Claude Code, Track A) |
| Updated | 2026-05-20 00:58 PDT |
| Blockers | None for desktop dev path; MAS / signed-runtime smoke remains in `xai-v1.deferred-gates.md` |

## Phase Plan

### Phase 1 — Audit + database capability file

Status: DONE.

- Audited `apps/desktop/src-tauri/capabilities/`:
  - `default.json` — main / control / grid_* core surface.
  - `plugin-account-crypto.json` — account / control crypto seam.
  - `plugin-account-keychain.json` — account / control Keychain seam.
- Added `apps/desktop/src-tauri/capabilities/plugin-data-database.json`
  scoped to `main`, `control`, `grid_*`, `account`, `console`. Widget /
  pet / ai-cube windows explicitly excluded.
- Added defence-in-depth `DATABASE_ALLOWED_WINDOWS` runtime check in
  `commands/database.rs` so a future capability widening cannot grant
  widget / pet windows the `db_*` surface silently.
- 2 new cargo tests cover the allow-list and rejection paths.
- Recorded the full audit (windows ↔ commands ↔ enforcement layer) in
  `apps/desktop/src-tauri/capabilities/AUDIT.md`.
- Updated `docs/contracts/tauri-commands-v0.md` §6.1 with the
  capability file reference and §7 with the audit pointer.

### Phase 2 — Verify

Status: DONE.

- `cargo check --features crypto`: PASS.
- `cargo test --features crypto database::` : 9 tests PASS (7 prior + 2
  allow-list).
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`: PASS.

Deferred / out-of-scope for G2.5:

- MAS sandbox capability validation (signed runtime smoke). Remains on
  G0.6 / G2.7 external-blocked rows.
- `tauri-plugin-opener` minimization. Recorded in AUDIT.md as a
  follow-up.
- Capability files for `widget_*` / `pet` / `ai_cube`. Track B/C plugin
  scopes own these when those plugins land in production.

## Verification Notes

feature-verify (Claude Code, Track A), 2026-05-20 00:58 PDT. Verdict: READY_TO_SHIP.

Every JS-callable command now has:

1. A capability file declaring its allowed windows.
2. A custom invoke_handler with a defence-in-depth window-origin check
   matching the capability file's window list.

Widget / pet / ai-cube windows cannot reach `db_*`, `crypto_*`, or
`secret_*` even via mis-attached capability files.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-20 00:58 PDT | feature-build + feature-verify (Claude Code, Track A) | Added `plugin-data-database.json`, `AUDIT.md`, runtime allow-list with 2 new cargo tests, contract doc cross-refs. | pending commit | manual ship only; continue roadmap |
