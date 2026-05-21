# G10-S1 DMG Release Candidate Dev Log

Workflow: Feature Dev

Executor: Track F Codex worker

Updated: 2026-05-21

Suggested Next: feature-verify on signed macOS hardware

## Work Log

- Brief: verify local DMG prerequisites and document release steps.
- Implementation: added `docs/release/dmg-build.md` with commands, expected outputs, smoke steps, and signing gates.
- Verification: `pnpm --filter desktop build` passed; `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --release` passed.
- Deferred: signing, notarization, stapling, and real DMG install smoke.
