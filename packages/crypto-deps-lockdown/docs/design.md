# crypto-deps-lockdown — Design Snapshot

> Decision snapshot only. Full reasoning:
> `docs/reviews/crypto-deps-lockdown/20260519-discovery-review.md`.

## Identity

- **Workflow**: FEATURE_DEV
- **Target (roadmap slug)**: `crypto-deps-lockdown`
- **Title**: Exact-pin 7 crypto deps + blocking supply-chain CI gate
- **Roadmap**: sync-v1 · feature #2 · wave W0 · Phase 0.3 ·
  prerequisite of dev-plan T-06/T-07 (stride-cve §3.1)
- **Source brief**: `docs/reviews/crypto-deps-lockdown/20260514-roadmap-seed.md`
- **Naming rationale**: `crypto-deps-lockdown` is the canonical roadmap slug for
  the supply-chain hardening row. It is **not a React plugin** — there is no
  `packages/crypto-deps-lockdown/src/`. The package dir exists *only* to anchor
  the four-piece workflow docs (same anchor-docs convention as roadmap-kickoff,
  whose `xai-roadmap-loop` reconcile reads dev_log by slug).

## Selected Options

| # | Decision | Selected | One-line rationale |
|---|---|---|---|
| D-1 | Rust advisory tool | B — `cargo-deny` only | `cargo deny check` advisories use same RustSec DB as audit + add licenses/bans/sources; subsumes audit; faster CI |
| D-2 | JS advisory tool | A — `osv-scanner` official GH Action, `fail-on-vuln: true` | brief-mandated; pnpm-lock support; blocking flag |
| D-3 | CI platform | A — GitHub Actions (`.github/workflows/`) | repo on GitHub, no CI exists, osv-scanner ships GH Action |
| D-4 | `--locked` strategy | A — commit `Cargo.lock` + `--locked` in CI | exact-pin + committed lock = reproducible; CI fails on stale lock |
| D-5 | `verify_strict` enforcement point | B — version floor + cargo-deny `bans` + named contract + planted inert grep-lint | runtime call impossible (no dep yet, boundary forbids plugin/Host code); policy-as-code now, trip-wire for future crypto row |
| D-6 | SQLCipher license policy | curated permissive `allow` + explicit reviewed `exceptions`/`clarify` for sqlcipher BSD-style | encodes community-edition determination in `deny.toml`, not a doc |
| D-7 | How to add 7 crates without crypto code | `optional = true` + a `crypto` feature umbrella; pins + lock real, no transitive compile, no crypto code | resolves R-1; **review must confirm** |

- **Review Doc**: `docs/reviews/crypto-deps-lockdown/20260519-discovery-review.md`
- **Review Date**: 2026-05-19
- **Status when written**: NEEDS_REVIEW (awaiting feature-review)

## Code boundary (hard)

- **In scope (only):**
  - `apps/desktop/src-tauri/Cargo.toml` (add 7 exact-pinned deps + `crypto`
    feature umbrella)
  - `apps/desktop/src-tauri/Cargo.lock` (committed; possibly un-gitignored)
  - `apps/desktop/src-tauri/deny.toml` (new — cargo-deny policy)
  - `.github/workflows/supply-chain-security.yml` (new — the repo's first CI)
  - `scripts/ci/` helper(s) for the exact-pin assertion + `verify_strict` grep
  - `packages/crypto-deps-lockdown/docs/*` (anchor docs)
- **Explicitly OUT of scope:** any `packages/plugin-*`, `apps/desktop/src/`,
  `packages/core/`, any crypto algorithm code, any Rust command, any
  `invoke_handler!` change, `commands/window.rs`. macOS window constants
  untouched.

## Frozen Assumptions

1. **No CI exists today.** `.github/` absent; this row creates the first
   workflow. No existing `deny.toml`/`audit.toml`/`.gitlab-ci.yml`.
2. `apps/desktop/src-tauri/Cargo.toml` currently has **zero crypto/http deps**
   (only tauri/serde/serde_json/thiserror + macOS frameworks).
3. The 7 target crates: `argon2`, `aes-gcm`, `x25519-dalek`, `ed25519-dalek`,
   `hpke`, `rusqlite`(+`sqlcipher`/bundled), and a `reqwest`-based REST driver
   crate (`reqwest`).
4. Version floors (hard constraints): `ed25519-dalek >= 2`,
   `curve25519-dalek >= 4`, `aes-gcm >= 0.10`. Exact patch `=x.y.z` resolved by
   feature-build against the registry at implementation time and recorded in the
   pinned-version table (api.md §2).
5. `crypto/mod.rs` scaffold (`KeyHandle(u32)` + `CRYPTO_CAPABILITY_ALLOWLIST`)
   from roadmap-kickoff stays untouched; no ed25519 code exists, so the planted
   `verify_strict` grep is inert today by design.
6. SQLCipher Community Edition = BSD-style; vendored source BSD-style
   (Zetetic / SQLITE_LICENSE). Attribution obligation noted for a future
   about/licenses UI row (out of scope here).
7. Making the gate *merge-blocking* needs a GitHub branch-protection "required
   check" toggle — a repo-admin action, recorded as a human ship step (R-4).
8. **Automation Mode: D-Codex+Cursor · Verify Cross-vendor: no.**

## Dependency Overview

```
.github/workflows/supply-chain-security.yml   (NEW — first CI workflow)
  ├─ job rust-pins    → scripts/ci/check-exact-pins.sh   (asserts =x.y.z on 7 crates)
  │                      + cargo metadata --locked        (asserts Cargo.lock fresh)
  │                      + scripts/ci/check-verify-strict.sh (inert grep trip-wire)
  ├─ job cargo-deny   → cargo deny --all-features check advisories bans licenses sources
  │                      reads apps/desktop/src-tauri/deny.toml
  └─ job osv-scanner  → google/osv-scanner GH Action, fail-on-vuln:true
                         scans pnpm-lock.yaml (+ Cargo.lock)

apps/desktop/src-tauri/Cargo.toml
  └─ [dependencies] argon2/aes-gcm/x25519-dalek/ed25519-dalek/hpke/rusqlite/reqwest
       all `=x.y.z`, `optional = true`
  └─ [features] crypto = [ ...the 7... ]   (umbrella; OFF by default → no
       transitive compile cost, no crypto code, pins+lock still real & gated)
  └─ Cargo.lock committed (D-4)
```

- No package depends on `crypto-deps-lockdown` (it's a CI/manifest row, not a
  library). It is a *prerequisite gate* for T-06/T-07, not a code dependency.
- Red lines: untouched — zero plugin/Host/core code; dependency-direction rules
  N/A (no new TS/Rust modules).

## Threat Model

- **GAP-T3 → T10, STRIDE EoP across TB-12 (dependency supply chain):** the three
  blocking CI jobs are the engineering gate that closes the prior policy-only
  gap. Any RustSec/OSV advisory on a pinned crate fails the build → cannot merge.
- **RUSTSEC-2022-0093 class (ed25519-dalek decoupled-keypair oracle):** mitigated
  by `=2.x` exact-pin floor + cargo-deny `bans` denying `< 2`; the unsafe API was
  removed from the safe surface in v2 (moved to `hazmat`). The
  `ED25519_VERIFY_STRICT` contract + inert grep is the planted runtime trip-wire
  the future crypto row must satisfy.
- **stride-cve §3 #2/#3:** `aes-gcm >= 0.10` and `curve25519-dalek >= 4` fix-line
  floors enforced by cargo-deny `bans`.
- **Typosquat / registry-swap:** `deny.toml [sources]` restricts to crates.io
  (+ explicit git allowlist if needed).
- **Pin rot:** exact-pins could stagnate on a later-advisory'd version — the
  advisory gate itself fails CI when that happens, forcing the upgrade PR
  (self-healing pressure).

## Deferred (explicitly out of this row)

- General build/test CI matrix — separate future row.
- Crypto algorithm implementation, KeyVault, capability-allowlist *enforcement*
  — later crypto rows (this row only plants pins + the verify_strict seam).
- About/licenses attribution UI for SQLCipher — later UI row (obligation
  recorded in deny.toml comment + here).
- Flipping the check to GitHub "required" — repo-admin human ship step (R-4).
