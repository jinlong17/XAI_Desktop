# Roadmap Seed — data-export-encrypted

> sync-v1 roadmap · feature #44 · wave W5 · Phase 5
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-50
> Status hint: PENDING

## Requirement
Full encrypted data export: pull all decrypted local SQLite tables → produce `xai-export-<date>.json.age` (default encrypted); plus a Markdown subset (todos/notes/habits/pomodoro) packaged as `.zip.age`. Plaintext export requires a second confirmation + red warning.

## Hard constraints
- Export key derived from BOTH factors: `HKDF(master_password ‖ secret_key, salt="xai.export.v1", info=date) → 32B` — master_password alone is dictionary-weak (FR-SY-70 / M-8 / C-10).
- Clipboard never exported; plaintext export requires second confirmation + red warning + "iCloud Drive loses E2E protection" prompt (FR-SY-50 / FR-SY-51).
- Code boundary: export UI + flow in `packages/plugin-account/`; SQLCipher decrypted read via `core-data` repo; age key derivation via Rust KeyVault command (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T13 (backup leak — Time Machine / iCloud Backup) — export file default-encrypted so a leaked export stays opaque.
- PRD §11 R-10.10 (local SQLite read under disk-image dump) — export reuses the dual-factor-derived key.

## Acceptance signal
PRD §10.2 export-encryption verification: `xai-export.json.age` cannot be decrypted without the master_password (+ secret_key); Markdown `.zip.age` is encrypted under the same derivation; plaintext path is gated behind a second confirmation.

## Dependencies (advisory — manifest is authoritative)
Depends On: hardening-admission-gate, sqlcipher-local-db. Blocked by #37 Phase 4.8 → Phase 5 gate.
