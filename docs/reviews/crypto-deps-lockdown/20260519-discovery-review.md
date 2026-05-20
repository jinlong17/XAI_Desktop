# Discovery Review — crypto-deps-lockdown

> sync-v1 roadmap · feature #2 · wave W0 · Phase 0.3
> Brief: `docs/reviews/crypto-deps-lockdown/20260514-roadmap-seed.md`
> Author: feature-plan (Claude Opus) · Date: 2026-05-19 · Mode: Fresh

## 1. Problem framing

The sync-v1 roadmap will consume 7 high-value cryptographic / data dependencies
(`argon2`, `aes-gcm`, `x25519-dalek`, `ed25519-dalek`, `hpke`,
`rusqlite`+`sqlcipher`, a `reqwest`-based REST driver). A single unpinned or
advisory-affected crypto crate is a **supply-chain Elevation-of-Privilege**
(GAP-T3 → T10, STRIDE EoP across TB-12). The roadmap previously had this as a
*policy-only* item with **no engineering gate** — that gap is exactly what this
feature closes.

This is deliberately the **lowest-cost / highest-leverage** hardening row and is
scheduled to run **before any crypto crate is consumed**. It is a CI + Cargo
manifest supply-chain lockdown, **not** a React plugin and **not** crypto
implementation.

Key live-state findings driving the plan (verified in this worktree):

- **No CI exists.** `.github/` is entirely absent; `Glob .github/**/*` →
  no files. There is no `.gitlab-ci.yml`, no `deny.toml`, no `audit.toml`.
  → This feature *creates the repo's first CI workflow*.
- `apps/desktop/src-tauri/Cargo.toml` (verified) has **zero crypto/http deps**.
  Only `tauri`, `tauri-plugin-opener`, `serde`, `serde_json`, `thiserror`,
  plus macOS `cocoa`/`core-graphics`/`core-foundation`. None of the 7 target
  crates is present yet.
- `apps/desktop/src-tauri/src/crypto/mod.rs` exists as a **scaffold placeholder**
  (roadmap-kickoff Phase 2): `pub struct KeyHandle(pub u32);` plus a
  `CRYPTO_CAPABILITY_ALLOWLIST` comment marker. No crypto algorithm code.
- Root tooling: `pnpm@9.0.0`, Turborepo `^2.6.1`, Node `>=18`, scripts
  `build/dev/lint/check-types`. No `test` script at root (per-package Vitest).

### Central design tension (explicitly resolved here)

The brief requires "**code-level** enforce `verify_strict`" for `ed25519-dalek`,
**but** the code boundary forbids plugin/Host code **and** no crypto crate is
consumed yet (this row runs *before* crypto use). You cannot write a runtime
`verify_strict` call against a crate that is not a dependency.

**Resolution (decision D-5 below):** the `verify_strict` requirement is
satisfied in this row by **three non-runtime mechanisms** that are legitimate
inside the code boundary:

1. **A version floor** — `ed25519-dalek = "=2.x.y"` exact-pin ≥ 2.0 makes the
   *vulnerable decoupled-keypair signing API* (RUSTSEC-2022-0093 root cause)
   unreachable; v2 removed it from the safe surface (moved to `hazmat`).
2. **A `cargo-deny` `bans` rule** denying `ed25519-dalek < 2` (and
   `curve25519-dalek < 4`, `aes-gcm < 0.10`) — a machine-enforced version gate.
3. **A named contract + lint seam** — `api.md` records the
   `ED25519_VERIFY_STRICT` contract, and the CI gate greps
   `src-tauri/src/crypto/` for a forbidden `\.verify\(` (non-strict) once any
   ed25519 code lands. The grep is **inert today** (no such code) and becomes
   active automatically when the crypto row writes code — i.e. the enforcement
   point is *planted now, fires later*, with zero plugin/Host code written in
   this row.

This converts an impossible "runtime call now" into a durable
**policy-as-code + planted-lint** seam consistent with the boundary.

## 2. Candidate options

### D-1 — Rust advisory tooling: cargo-audit vs cargo-deny vs both

| Option | Description | Verdict |
|---|---|---|
| A | `cargo-audit` only | Rejected — no license / source / bans governance; brief explicitly requires license whitelist + source whitelist + version bans |
| B | `cargo-deny` only | **Selected** — `cargo deny check` covers `advisories` (same RustSec DB as audit), `licenses`, `bans`, `sources` in one tool/config; subsumes audit |
| C | both audit + deny | Rejected as redundant — deny's `advisories` reads the identical RustSec DB; running both doubles CI time with no added coverage. (Brief lists "cargo audit + cargo deny" descriptively; the requirement is the *capability*, and `cargo deny check advisories` *is* the audit capability.) |

Evidence: cargo-deny's `advisories` check uses the same RustSec advisory database
as cargo-audit and additionally enforces licenses/bans/sources; it "subsumes
cargo-audit" for projects that also need license/source policy. (See sources.)
Decision: **one tool, `cargo-deny`**, configured with all four checks. The brief's
intent (a blocking advisory + license + source gate) is fully met.

### D-2 — npm/JS advisory tooling

| Option | Description | Verdict |
|---|---|---|
| A | `osv-scanner` (Google) via official GitHub Action, `fail-on-vuln` | **Selected** — brief mandates `osv-scanner`; supports pnpm lockfiles; has a blocking `fail-on-vuln` parameter; OSV.dev cross-ecosystem DB |
| B | `pnpm audit` | Rejected — brief specifies osv-scanner; pnpm audit DB is narrower and advisory format differs |

Note: osv-scanner has had historical pnpm-lock parsing edge cases (tracked
upstream). Mitigation: pin the scanner action to a known-good release tag and
scan the repo's `pnpm-lock.yaml` explicitly; record the action ref in the
workflow as a frozen assumption. Validated in test.md AC for parser success.

### D-3 — CI platform

| Option | Description | Verdict |
|---|---|---|
| A | GitHub Actions (`.github/workflows/`) | **Selected** — repo is on GitHub (origin), no other CI present; osv-scanner ships an official GH Action; standard for Tauri/Rust + pnpm |
| B | local git hook only | Rejected — brief requires a *merge-blocking* gate; a local hook is bypassable and is "policy not gate" |

### D-4 — `--locked` enforcement strategy

| Option | Description | Verdict |
|---|---|---|
| A | commit `Cargo.lock`; CI runs `cargo <cmd> --locked` + `cargo-deny` | **Selected** — `--locked` makes CI fail if `Cargo.lock` is stale vs `Cargo.toml`; `=x.y.z` pins + committed lock = reproducible. (Lockfile is the authoritative resolved graph.) |
| B | exact-pin only, no `--locked` | Rejected — exact-pin still lets transitive deps float; brief explicitly requires `--locked` |

### D-5 — `ed25519-dalek verify_strict` enforcement point (the tension)

| Option | Description | Verdict |
|---|---|---|
| A | write a runtime `verify_strict` call now | **Impossible / boundary-violating** — no ed25519-dalek dependency yet; runtime crypto code would be Host/plugin-adjacent and out of this row's scope |
| B | version floor + cargo-deny `bans` + named contract + planted grep-lint that is inert until crypto code lands | **Selected** — see §1 "Central design tension". Machine-enforced version gate now; runtime enforcement seam planted for the future crypto row to satisfy |
| C | doc-only note | Rejected — brief explicitly says "CI gate, not a policy doc" |

### D-6 — cargo-deny license policy for SQLCipher

SQLCipher Community Edition is distributed under a **BSD-style** (zlib/BSD,
SQLite-public-domain-derived) license; the vendored/`bundled-sqlcipher` source
compiles in under that BSD-style license (Zetetic). Decision: the `deny.toml`
`[licenses].allow` list encodes a permissive set
(`MIT`, `Apache-2.0`, `BSD-2-Clause`, `BSD-3-Clause`, `ISC`, `Zlib`,
`Unicode-3.0`, `Unicode-DFS-2016`) and a documented per-crate
`[[licenses.clarify]]` / `[[licenses.exceptions]]` entry for the `sqlcipher`/
`libsqlite3-sys`-bundled source explicitly recording the **SQLCipher
community-edition determination** (BSD-style, attribution obligation noted for a
later "about/licenses" UI row — out of scope here, but recorded). `[sources]`
restricts crates to crates.io (+ an explicit allowlist for any required git
source) so a typosquat/registry-swap is blocked.

## 3. Tradeoffs

- **Exact-pin (`=x.y.z`) cost:** dependency upgrades become explicit PRs. This is
  intentional for crypto crates — upgrades must be reviewed, not automatic. Risk
  of "pin rot" (staying on an advisory-affected pin) is *itself caught* by the
  blocking advisory gate, which will fail CI the moment a pinned version gains an
  advisory → forces the upgrade PR. Self-healing pressure.
- **One-tool (cargo-deny) vs two:** slightly less defense-in-diversity than
  running audit *and* deny, but identical advisory DB; the marginal value is zero
  and CI stays fast. Accepted.
- **CI-from-zero:** this is the repo's first workflow. Scope is held tight to the
  security gate only (no build/test matrix sprawl) to keep the row low-cost; a
  general build CI is a separate future row, explicitly out of scope.
- **Planted-but-inert grep lint:** until crypto code exists the `verify_strict`
  grep can't *prove* correctness, only *forbid* the non-strict pattern. Accepted:
  the version floor + bans rule carry the real enforcement now; the grep is a
  trip-wire for the future row. Documented as a known limitation.
- **osv-scanner pnpm parsing:** mitigated by pinned action ref + an explicit
  AC that the scanner must successfully parse `pnpm-lock.yaml` (no silent skip).

## 4. Recommendation

Implement a single new GitHub Actions workflow
`.github/workflows/supply-chain-security.yml` that, on every PR and push to
`main`, runs three **blocking** jobs:

1. **rust-pins** — `cargo verify-project` + `cargo update --locked --dry-run`
   (or `cargo metadata --locked`) to assert `Cargo.lock` is in sync, plus a
   script asserting all 7 target crates use `=x.y.z` exact-pin syntax in
   `apps/desktop/src-tauri/Cargo.toml`.
2. **cargo-deny** — `cargo deny --all-features check advisories bans licenses
   sources` using a new `apps/desktop/src-tauri/deny.toml`.
3. **osv-scanner** — official action, `fail-on-vuln: true`, scanning
   `pnpm-lock.yaml` (+ `Cargo.lock` as defense-in-depth).

Plus: add the 7 crypto deps **exact-pinned** to `Cargo.toml` at their fix-line
floors (or, if a crate cannot be added compiling without its consuming code,
record it as a pinned-but-`optional`/feature-gated or a documented deferred pin —
resolved per-crate in design.md D-7), and commit the resulting `Cargo.lock`.
Plant the `verify_strict` contract + inert grep-lint.

The "API contract" for this non-plugin feature is: **the CI gate spec + the
pinned-version table + the `deny.toml` policy + the `ED25519_VERIFY_STRICT`
enforcement contract** — captured in `api.md`.

## 5. Risks & open questions

- **R-1 (build break from adding crypto crates):** adding all 7 crates to
  `Cargo.toml` with no consuming code may pull heavy transitive trees and *could*
  fail `cargo check` if features are misconfigured (e.g. `hpke` needs a chosen
  AEAD/KEM feature set; `rusqlite` needs `bundled-sqlcipher`). **Mitigation /
  open question for feature-review:** decide per-crate whether to add now as
  `optional = true` (feature-gated, zero compile cost until enabled) vs add fully.
  design.md D-7 proposes `optional = true` + a `crypto` feature umbrella so the
  pins + lock are real and gate-tested *without* forcing transitive compile or
  touching crypto code. **This is the top item for review to confirm.**
- **R-2 (osv-scanner pnpm-lock parse failure):** historical upstream issue.
  Mitigation: pinned action ref; AC asserts non-empty scanned-package count.
- **R-3 (no `Cargo.lock` committed yet?):** verify whether `Cargo.lock` is
  tracked; if `.gitignore` excludes it (common for libs), the `--locked` strategy
  requires un-ignoring + committing it. feature-build must check.
- **R-4 (first-CI org settings):** making the gate *merge-blocking* requires a
  GitHub branch-protection "required status check" — a repo-admin action outside
  the code. The workflow makes the *check exist*; flipping it to required is a
  documented human ship step (recorded in dev_log + handoff).
- **R-5 (license-list false positive):** an unforeseen transitive crate with a
  copyleft/odd license could block CI on first run. Mitigation: deny.toml ships
  with the curated allow list from D-6; first CI run is expected to surface any
  surprise, resolved by an explicit reviewed `exceptions` entry (not by widening
  the allow list).
- **Open question:** exact fix-line patch versions for each of the 7 crates at
  build time (e.g. latest `ed25519-dalek 2.x`, `aes-gcm 0.10.x`,
  `curve25519-dalek 4.x`). The plan fixes the *floor + exact-pin discipline*;
  feature-build resolves concrete `=x.y.z` patch numbers against the registry at
  implementation time and records them in the pinned-version table.

## 6. External research log

- cargo-deny vs cargo-audit (same RustSec DB; deny subsumes audit, adds
  licenses/bans/sources):
  https://github.com/EmbarkStudios/cargo-deny/issues/386 ,
  https://blog.logrocket.com/comparing-rust-supply-chain-safety-tools/ ,
  https://embarkstudios.github.io/cargo-deny/cli/check.html
- RUSTSEC-2022-0093 (ed25519-dalek decoupled-keypair oracle; fixed in v2.0,
  unsafe API moved to `hazmat`):
  https://rustsec.org/advisories/RUSTSEC-2022-0093 ,
  https://docs.rs/ed25519-dalek/latest/ed25519_dalek/struct.VerifyingKey.html
- SQLCipher Community Edition = BSD-style, vendored source BSD-style, attribution
  obligation: https://www.zetetic.net/sqlcipher/license/ ,
  https://github.com/sqlcipher/sqlcipher/blob/master/SQLITE_LICENSE.md
- osv-scanner GitHub Action, pnpm lockfile support, `fail-on-vuln` blocking,
  pnpm-lock parser edge cases:
  https://google.github.io/osv-scanner/github-action/ ,
  https://google.github.io/osv-scanner/supported-languages-and-lockfiles/ ,
  https://github.com/google/osv-scanner/issues/931
