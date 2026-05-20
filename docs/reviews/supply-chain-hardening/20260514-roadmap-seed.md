# Roadmap Seed — supply-chain-hardening

> sync-v1 roadmap · feature #46 · wave W5 · Phase 5
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-82
> Status hint: PENDING

## Requirement
Harden the supply chain: `cargo vet` / `cargo crev` review of all crypto deps; Sigstore npm signature verification on the pnpm lockfile; GitHub `actions/dependency-review-action` to block high-risk deps; Tauri strict capability allowlist; reproducible (hermetic Docker + SHA256) build; quarterly CVE runbook.

## Hard constraints
- All crypto stays Rust-side (`aes-gcm`/`argon2`/`bip39`/`sqlcipher` etc.) behind Tauri commands; TS never holds raw keys (R-18 ① / dev-plan §6).
- Auto-update must verify signatures (main PRD §5.10.1); Tauri capability strict allowlist limits the IPC surface (R-18 ⑤⑥); reproducible build SHA256 published in release notes (R-18 ⑦).
- Builds on `crypto-deps-lockdown` (#2, GAP-T3') — extends, does not replace, the exact-pin + cargo audit/deny + osv-scanner CI gate.
- Code boundary: CI workflows + cargo config + capability files under `apps/desktop/src-tauri/capabilities/` and repo CI; runbook in `docs/runbook/` (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T10 (supply chain — npm / crates / Tauri auto-update) — cargo vet + Sigstore + dependency-review + signed auto-update + strict capability allowlist.
- PRD §11 R-18 (supply chain attack); stride-cve.md GAP-T3' supply-chain EoP class.

## Acceptance signal
CI blocks a deliberately introduced high-risk dependency; crypto deps pass `cargo vet`/`crev`; npm provenance verified against the lockfile; a reproducible build yields the SHA256 recorded in release notes; quarterly CVE runbook exists.

## Dependencies (advisory — manifest is authoritative)
Depends On: hardening-admission-gate, crypto-deps-lockdown. Blocked by #37 Phase 4.8 → Phase 5 gate.
