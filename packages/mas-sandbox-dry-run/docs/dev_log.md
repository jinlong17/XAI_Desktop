# mas-sandbox-dry-run — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | mas-sandbox-dry-run |
| Title | G0.6 MAS sandbox dry run |
| Roadmap | xai-g0-window-spike · feature #6 · G0.6 |
| Status | BLOCKED_EXTERNAL |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | Signed/sandbox runtime validation after G0.5 |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-verify (Codex inline) |
| Updated | 2026-05-19 22:44 PDT |
| Blockers | Apple Developer/signing or equivalent sandbox environment required for runtime evidence |

## Phase Plan

### Phase 1 — MAS notes prep

Status: DONE. Commit: `(this commit)`.

- Created MAS sandbox notes and entitlement draft.
- Avoided Tauri config, Cargo feature, entitlement, and capability changes in unattended mode.

### Phase 2 — MAS compile fallback

Status: DONE. Commit: `2fda0c8`.

- Added `mas-sandbox` Cargo feature.
- Guarded Rust-side Grid/control `.transparent(true)` builder calls so the non-private fallback compile path can omit them.
- Left default DMG/dev behavior unchanged.

## Review Notes

feature-review (Codex inline), 2026-05-19 15:04 PDT. Verdict: APPROVED for safe prep only.

## Verification Notes

feature-verify (Codex inline), 2026-05-19 22:54 PDT. Verdict: BLOCKED_EXTERNAL / COMPILE_FALLBACK_READY.

The private-API-disabled comparison now has compile evidence and a compile-only fallback. Default private path still passes `cargo check`. With `macOSPrivateApi=false`, the Tauri dependency `macos-private-api` feature temporarily disabled, and the new `mas-sandbox` feature enabled, `cargo check` passes. G0.6 remains blocked external on signed/sandbox runtime validation and fallback UX evidence, and is decoupled from G1 DMG/private path.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 15:03 PDT | feature-plan (Codex inline) | Step 0 and plan: user override skips blocked G0.3/G0.4 gates for MAS safe prep only. | — | feature-review |
| 2026-05-19 15:04 PDT | feature-review (Codex inline) | Approved safe-prep plan; no Tauri config/capability changes without runtime evidence. | — | feature-build |
| 2026-05-19 15:05 PDT | feature-build (Codex inline) | Created MAS sandbox notes, entitlement draft, and risk matrix. | (this commit) | feature-verify |
| 2026-05-19 15:05 PDT | feature-verify (Codex inline) | Marked BLOCKED because real sandbox/private-API acceptance cannot be automated here. | (this commit) | feature-build |
| 2026-05-19 22:25 PDT | feature-verify (Codex inline) | Temporarily tested with private API disabled; build fails on `.transparent(true)` in Grid/control window builders. Restored default config and Cargo feature. | `4537d2d` | MAS fallback design |
| 2026-05-19 22:44 PDT | feature-build/verify (Codex inline) | Added `mas-sandbox` compile fallback for Grid/control builders and verified both default and private-API-disabled compile paths. | `2fda0c8` | Signed/sandbox runtime validation |
| 2026-05-19 22:54 PDT | human + feature-verify (Codex inline) | Recorded Apple Developer/signed sandbox runtime validation as deferred external and decoupled it from G1 DMG/private path. | `1701583` | G1.1 |
