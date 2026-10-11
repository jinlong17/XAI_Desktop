# crypto-deps-lockdown — Test Strategy

> This row has **no product code**. "Tests" are the CI gate itself plus
> meta-assertions that the gate actually blocks. The acceptance signal is
> *negative*: an injected advisory MUST turn CI red.

## 1. Acceptance criteria (must all pass)

| # | Criterion | How verified |
|---|---|---|
| AC-1 | All 7 crypto crates present in `Cargo.toml` with literal `=x.y.z` pin | `scripts/ci/check-exact-pins.sh` exits 0; manual diff inspection |
| AC-2 | `ed25519-dalek` pinned `>= 2.x` | grep `Cargo.toml`; `deny.toml [bans] <2` present |
| AC-3 | `curve25519-dalek >= 4` and `aes-gcm >= 0.10` enforced | `deny.toml [bans]` entries; `cargo deny check bans` green |
| AC-4 | `Cargo.lock` committed and in sync (`--locked` clean) | `cargo metadata --locked` exits 0; `Cargo.lock` tracked by git |
| AC-5 | `cargo deny check advisories bans licenses sources` runs green on the clean tree | run job locally / in CI; exit 0 |
| AC-6 | SQLCipher community-edition determination encoded in `deny.toml` (not prose) | inspect `deny.toml` licenses clarify/exceptions for sqlcipher/libsqlite3-sys |
| AC-7 | `[sources]` denies unknown registry/git | `deny.toml` inspection; `cargo deny check sources` green |
| AC-8 | osv-scanner runs from a SHA256-verified pinned binary and reports **non-zero** parsed package counts for `pnpm-lock.yaml` and `apps/desktop/src-tauri/Cargo.lock` | CI/local log shows scanned > 0 packages, exit 0 on clean tree after only dated reviewed exceptions |
| AC-9 | `verify_strict` trip-wire script exists and exits 0 today (inert — no ed25519 code) | run `scripts/ci/check-verify-strict.sh`; exit 0 |
| AC-10 | Code boundary clean: only Cargo.toml/Cargo.lock/deny.toml/.github/workflows/scripts/ci + anchor docs changed | `git diff --name-only` ∩ {plugin-*, apps/desktop/src/, packages/core/} = ∅ |
| AC-INJECT | **Negative gate proof:** a deliberately injected RustSec **and** OSV advisory each turn at least one job red | temporary local injection (an advisory'd version / a known-vuln npm dep on a throwaway branch), observe red, revert; documented in dev_log Work Log |

## 2. Gate-as-test coverage

- **rust-pins job:** asserts pin syntax + lock freshness + inert verify_strict
  grep. The job *is* the test; its red/green is the assertion.
- **cargo-deny job:** four sub-checks (advisories/bans/licenses/sources). Each is
  an independent fail surface; AC-2..AC-7 map onto them.
- **osv-scanner job:** JS/npm side; AC-8 + the OSV half of AC-INJECT.

## 3. Negative / regression coverage (the load-bearing test)

`AC-INJECT` is the primary correctness proof — a supply-chain gate that never
fails is worthless. feature-verify (or feature-build, recorded in Work Log)
must, on a throwaway local branch:
1. add a crate version with a known RustSec advisory → confirm `cargo-deny`
   (and/or `rust-pins`) job goes red;
2. add an npm dependency with a known OSV advisory → confirm `osv-scanner`
   job goes red;
3. revert both; confirm green again.
This proves the gate *blocks*, satisfying the brief's acceptance signal.

## 4. verify_strict seam coverage

- Today: `check-verify-strict.sh` exits 0 (no ed25519 code) — AC-9.
- Planted-future assertion (documented, not run now): when the future crypto
  row introduces ed25519 verification, the script must go red if `verify` is
  used instead of `verify_strict`. test.md of the future crypto row inherits
  this; recorded here as the contract origin.

## 5. Mock strategy

- No mocks. This is real CI tooling against the real dependency graph and real
  advisory databases (RustSec / OSV.dev). The advisory DBs are the live source
  of truth by design (a new upstream advisory legitimately failing CI is
  intended behavior, not a flake).
- `osv-scanner` binary pinned to v2.3.8 and SHA256-verified to neutralize action
  wrapper drift (R-2); no behavioral mocking.

## 6. Out of scope (later rows)

- Crypto algorithm correctness vectors, KeyVault tests, capability-allowlist
  enforcement tests — later crypto rows.
- General build/test CI — separate future row.
- macOS multi-window verification — N/A (no UI/window change).
  **Verify Cross-vendor: no.**
