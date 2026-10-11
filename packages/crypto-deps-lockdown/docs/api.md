# crypto-deps-lockdown — Contract Surface

> This is **not** a plugin. The "API / contract" for this row is the **CI gate
> spec + pinned-version table + cargo-deny policy + the `verify_strict`
> enforcement contract**. Shapes below are the authoritative interface.

## 1. CI gate contract (`.github/workflows/supply-chain-security.yml`)

Triggers: `pull_request` (all branches) + `push` to `main`.
All jobs are **required to pass**; any failure **blocks merge** (subject to the
branch-protection toggle, R-4).

| Job | Command (authoritative intent) | Pass condition | Fail = block |
|---|---|---|---|
| `rust-pins` | `scripts/ci/check-exact-pins.sh` + `cargo metadata --locked --manifest-path apps/desktop/src-tauri/Cargo.toml` + `scripts/ci/check-verify-strict.sh` | all 7 crates use `=x.y.z` literal pin; `Cargo.lock` in sync with manifest (`--locked` does not need to rewrite); no non-strict ed25519 verify pattern present | yes |
| `cargo-deny` | `cargo deny --manifest-path apps/desktop/src-tauri/Cargo.toml --all-features check advisories bans licenses sources` | zero RustSec advisories; no banned/version-floor-violating crate; all licenses in allow/exceptions; all sources in allowlist | yes |
| `osv-scanner` | SHA256-verified `osv-scanner` v2.3.8 binary; `scan source --config=scripts/ci/osv-scanner.toml --lockfile=pnpm-lock.yaml --lockfile=apps/desktop/src-tauri/Cargo.lock` | zero unreviewed OSV advisories; scanner reports **non-zero parsed-package counts** (no silent skip); reviewed Tauri Linux GTK/unic exceptions must stay dated and narrow | yes |

**Injected-advisory acceptance signal:** introducing a crate/lockfile entry with
a known RustSec or OSV advisory MUST turn at least one job red. (test.md §1
AC-INJECT.)

## 2. Pinned-version table (`apps/desktop/src-tauri/Cargo.toml`)

All 7 added as `{ version = "=x.y.z", optional = true, ... }` under
`[dependencies]`; gathered under a `crypto` feature umbrella (off by default).
Concrete `=x.y.z` patch values resolved by feature-build at implementation time
against crates.io and filled into this table (the **floor** is the contract;
the exact patch is recorded for reproducibility).

| Crate | Exact pin | Floor (hard constraint) | Notes |
|---|---|---|---|
| `argon2` | `=0.5.3` | latest stable line | password hashing (Argon2id) |
| `aes-gcm` | `=0.10.3` | **`>= 0.10`** (stride-cve §3 #2/#3) | AEAD |
| `x25519-dalek` | `=2.0.1` | line that pulls `curve25519-dalek >= 4` | ECDH; resolved transitive `curve25519-dalek = 4.1.3` |
| `ed25519-dalek` | `=2.2.0` | **`>= 2`** (RUSTSEC-2022-0093, stride-cve §3 #4) | signatures; verify_strict contract §4 |
| `curve25519-dalek` (transitive, pinned via bans) | `4.1.3` resolved via `x25519-dalek`+`ed25519-dalek`; enforced `>= 4` by `deny.toml [bans]` | **`>= 4`** | transitive of the dalek crates |
| `hpke` | `=0.12.0` | latest stable line | hybrid public-key enc; feature set chosen later |
| `rusqlite` (+ `sqlcipher`/bundled) | `=0.32.1` | latest stable line | SQLCipher via `bundled-sqlcipher` feature |
| `reqwest` | `=0.12.28` | latest stable line | REST driver transport (rustls-tls feature) |

> If a crate cannot be added while keeping `cargo check` green even when
> feature-gated off, feature-build records it as a documented deferred pin with
> rationale (R-1) — but D-7 (`optional = true` + umbrella) is expected to make
> all 7 addable with no compile/transitive cost.

## 3. cargo-deny policy contract (`apps/desktop/src-tauri/deny.toml`)

Authoritative shape (concrete crate/version literals filled by feature-build):

```toml
[advisories]
# RustSec DB; any advisory on the resolved graph = error.
yanked = "deny"
# `ignore = []` — NO blanket ignores; an advisory must be fixed or get a
# dated, reviewed, justified single-id ignore entry (none at plan time).

[bans]
# Version-floor enforcement = the machine-checked half of the verify_strict
# / fix-line constraints (design.md D-5).
deny = [
  { name = "ed25519-dalek",    version = "<2" },
  { name = "curve25519-dalek", version = "<4" },
  { name = "aes-gcm",          version = "<0.10" },
]
multiple-versions = "warn"   # informational; not a blocker in this row

[licenses]
# Curated permissive allow list (discovery D-6).
allow = [
  "MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause",
  "ISC", "Zlib", "Unicode-3.0", "Unicode-DFS-2016",
]
confidence-threshold = 0.9
# SQLCipher community-edition determination (BSD-style; vendored source).
# This [[licenses.clarify]] / exceptions entry IS the encoded determination —
# not a separate policy doc (brief: "CI gate, not a policy doc").
# Attribution obligation (about/licenses UI) deferred to a later row.
# [[licenses.clarify]] / [[licenses.exceptions]] for libsqlite3-sys / sqlcipher
# filled with exact crate id+version by feature-build.

[sources]
unknown-registry = "deny"
unknown-git      = "deny"
allow-registry   = ["https://github.com/rust-lang/crates.io-index"]
# allow-git = [ ... ] only if a target crate requires a git source (none expected)
```

Contract guarantees:
- **No blanket `advisories.ignore`** — every advisory either fails CI or has a
  single dated, justified, reviewed ignore id (zero at plan time).
- The SQLCipher determination lives **in `deny.toml`** (machine-checked), not in
  prose.
- `[sources]` denies unknown registries/git → blocks registry-swap / typosquat.

## 4. `ED25519_VERIFY_STRICT` enforcement contract (the boundary-safe seam)

Because no ed25519-dalek code is consumed in this row and the code boundary
forbids plugin/Host code, runtime enforcement is **planted, not executed now**:

- **Contract statement (binding on the future crypto row):** any Ed25519
  signature verification in this codebase MUST use
  `VerifyingKey::verify_strict` (rejects non-canonical / malleable encodings),
  never the permissive `verify`. Decoupled keypair signing APIs (RUSTSEC-2022-0093
  root cause) MUST NOT be used; only v2 `hazmat` if ever, with explicit review.
- **Machine enforcement available now:** `ed25519-dalek` exact-pin `>= 2` +
  `deny.toml [bans] ed25519-dalek < 2` — the vulnerable decoupled API is not on
  the safe surface in v2.
- **Planted trip-wire:** `scripts/ci/check-verify-strict.sh` greps
  `apps/desktop/src-tauri/src/` for an Ed25519 non-strict verify pattern
  (e.g. a `\.verify\(` call on an ed25519 verifying key without `_strict`). It
  is **inert today** (no such code) and **fires automatically** the moment the
  future crypto row writes verification code with the wrong call — converting a
  "can't enforce at runtime yet" into a durable CI guard with zero code written
  here. The grep's exact regex is finalized in feature-build to avoid false
  positives against unrelated `.verify(` (e.g. tauri/serde) by scoping to a
  crypto path + ed25519 identifier.

## 5. Error / failure semantics

- Every gate failure is **hard** (non-zero exit → red check → merge blocked).
  No warn-only crypto/advisory gate in this row (`multiple-versions = "warn"` is
  the only intentionally non-blocking signal and is informational).
- `osv-scanner` must **fail loudly on a parse error** of `pnpm-lock.yaml`
  (treated as gate failure, not skip) — guards R-2.
- `cargo ... --locked` failure (stale `Cargo.lock`) = gate failure (forces lock
  refresh PR) — guards reproducibility (D-4).

## 6. Idempotency / permission

- The workflow is read-only against the repo (no writes, no publish, no token
  beyond default `GITHUB_TOKEN` read scope). No secrets required.
- Re-running the workflow on the same commit is deterministic given the
  committed `Cargo.lock` + pinned advisory-DB snapshot (advisory DB freshness is
  expected drift — a new advisory legitimately turning a previously-green commit
  red is the *desired* behavior, not a flake).
