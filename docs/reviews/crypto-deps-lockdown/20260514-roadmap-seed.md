# Roadmap Seed — crypto-deps-lockdown

> sync-v1 roadmap · feature #2 · wave W0 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-06/T-07 prerequisite (stride-cve §3.1)
> Status hint: PENDING

## Requirement
Exact-pin the 7 cryptographic dependencies (`argon2`, `aes-gcm`, `x25519-dalek`, `ed25519-dalek`, `hpke`, `rusqlite`+`sqlcipher`, `reqwest`-based REST driver) in `Cargo.toml` with `=x.y.z` / `--locked` CI, and add `cargo audit` + `cargo deny` (license whitelist incl. SQLCipher community-edition + source whitelist) + npm `osv-scanner` as a **blocking CI gate** — any advisory blocks merge. Lowest-cost/highest-leverage hardening; runs before any crypto crate is used.

## Hard constraints
- `ed25519-dalek` MUST be ≥ 2.x and code-level enforce `verify_strict` (RUSTSEC-2022-0093 class, stride-cve §3 #4).
- `cargo audit`/`cargo deny`/`osv-scanner` are a **CI gate, not a policy doc** (stride-cve §3.1 item 2); `cargo deny` license whitelist must encode SQLCipher community-edition determination.
- Pin curve25519-dalek ≥ 4 fix line; `aes-gcm` ≥ 0.10.x fix line (stride-cve §3 #2/#3).
- Code boundary: `apps/desktop/src-tauri/Cargo.toml` + CI workflow under repo CI config; no plugin/Host code.

## Threat model binding
- GAP-T3' (supply-chain Elevation-of-Privilege, stride-cve §2.4/§2.5) mitigating T10; closes the "policy-only, no engineering gate" gap.
- STRIDE Elevation-of-Privilege across TB-12 (dependency supply chain).

## Acceptance signal
CI fails the build on any injected RustSec/OSV advisory; all 7 crates exact-pinned and `--locked` enforced; `ed25519-dalek` ≥ 2.x present.

## Dependencies (advisory — manifest is authoritative)
Depends On: roadmap-kickoff (shipped)
