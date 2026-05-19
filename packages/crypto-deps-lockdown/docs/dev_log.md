# crypto-deps-lockdown — Dev Log (Workflow State Machine)

> Roadmap workflow state anchor. `xai-roadmap-loop` reconcile reads this file by
> slug: `packages/crypto-deps-lockdown/docs/dev_log.md`.

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | crypto-deps-lockdown |
| Title | Exact-pin 7 crypto deps + blocking supply-chain CI gate |
| Roadmap | sync-v1 · feature #2 · wave W0 · Phase 0.3 · prereq of T-06/T-07 |
| Status | APPROVED |
| Current Phase | FEATURE_REVIEW |
| Suggested Next | feature-build |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | no |
| Executor | feature-review (Claude Opus) |
| Updated | 2026-05-19 17:32 |

## Phase Plan

> `feature-build` executes ONE phase per run, then stops for human confirmation.
> Phases are ordered so each leaves the tree in a non-broken state.

### Phase 1 — Exact-pin manifest + committed lock
- Add the 7 crypto crates to `apps/desktop/src-tauri/Cargo.toml`
  `[dependencies]` as `{ version = "=x.y.z", optional = true }` (D-7), resolving
  concrete `=x.y.z` patch numbers against crates.io at floors:
  `ed25519-dalek >= 2`, `aes-gcm >= 0.10`, `x25519-dalek` line pulling
  `curve25519-dalek >= 4`, `rusqlite` w/ `bundled-sqlcipher`, `argon2`, `hpke`,
  `reqwest` (rustls).
- Add `[features] crypto = [ ... 7 dep/<name> ... ]`, OFF by default.
- Ensure `Cargo.lock` is tracked (un-gitignore if needed, R-3) and committed.
- Fill the api.md §2 pinned-version table with the concrete patch numbers.
- Gate: `cargo metadata --locked --manifest-path apps/desktop/src-tauri/Cargo.toml`
  exits 0; `cargo check` still green (crypto feature off → no transitive compile).

### Phase 2 — cargo-deny policy
- New `apps/desktop/src-tauri/deny.toml` per api.md §3: `[advisories]` (no
  blanket ignore), `[bans]` (ed25519-dalek<2 / curve25519-dalek<4 / aes-gcm<0.10),
  `[licenses]` permissive allow + the SQLCipher community-edition
  clarify/exceptions entry (D-6), `[sources]` crates.io-only.
- Gate: `cargo deny --manifest-path apps/desktop/src-tauri/Cargo.toml
  --all-features check advisories bans licenses sources` exits 0 on clean tree
  (resolve any first-run license surprise via a reviewed `exceptions` entry,
  R-5 — never by widening `allow`).

### Phase 3 — CI workflow + helper scripts (first CI in repo)
- New `.github/workflows/supply-chain-security.yml`: triggers `pull_request` +
  `push: main`; three blocking jobs `rust-pins`, `cargo-deny`, `osv-scanner`
  (osv action pinned ref, `fail-on-vuln: true`, scans `pnpm-lock.yaml` +
  `Cargo.lock`).
- New `scripts/ci/check-exact-pins.sh` (asserts `=x.y.z` on all 7),
  `scripts/ci/check-verify-strict.sh` (scoped ed25519 non-strict grep; inert
  today, exits 0).
- Gate: workflow YAML lint-valid; scripts exit 0 locally on clean tree;
  AC-1..AC-10 green.

### Phase 4 — Negative gate proof (AC-INJECT) + boundary sweep
- On a throwaway local branch: inject one RustSec-advisory'd crate version and
  one OSV-advisory'd npm dep; confirm the respective job goes red; revert;
  confirm green. Record evidence in Work Log.
- `git diff --name-only` boundary sweep (AC-10).
- Gate: AC-INJECT proven both sides; boundary clean → READY_FOR_VERIFY.

## Risks

See discovery review §5. Top:
- **R-1** (top review item): adding 7 crates may break `cargo check` via heavy
  transitive trees / feature misconfig. Mitigation D-7 = `optional = true` +
  `crypto` umbrella OFF by default → pins+lock real, zero transitive compile,
  zero crypto code. **feature-review must confirm D-7.**
- **R-3**: `Cargo.lock` may be gitignored (lib default) — must un-ignore +
  commit for `--locked` strategy.
- **R-4**: merge-blocking requires a GitHub branch-protection "required check"
  toggle = repo-admin human ship step (not code).
- R-2 (osv pnpm-lock parse), R-5 (license first-run false positive).

## Review Notes

> APPROVED. All 5 gates pass. D-7 confirmed sound: `optional = true` + OFF-by-default `crypto` umbrella keeps `cargo check` green (optional dep with no feature/`dep:` reference is not compiled) while `=x.y.z` pins + committed `Cargo.lock` + `--locked` remain real and enforced; P1 gate is the correct falsifiable test. D-5 confirmed boundary-safe: scaffold `crypto/mod.rs` independently verified inert (only `KeyHandle(u32)` + comment, zero `.verify(`), grep genuinely inert today; acceptance signal met by machine enforcement (exact-pin >=2 + `deny.toml [bans] ed25519-dalek <2`), not prose. D-6 confirmed: SQLCipher determination encoded as `deny.toml` exceptions/clarify entry, not a doc. Phase 3 3-job plan concrete; AC-INJECT (P4) is the load-bearing falsification proving the gate blocks. Phasing additive, non-broken each step. Live-state claims independently re-verified (no `.github/`, zero crypto deps in Cargo.toml, scaffold inert). Non-blocking carry-into-build recommendations: (1) R-3 — `Cargo.lock` already exists and is NOT gitignored (`src-tauri/.gitignore` only ignores `/target/` + `/gen/schemas`); narrow Phase 1 to "verify `git ls-files` tracks it, commit if untracked" — no un-ignore action expected. (2) Phase 3 — pin `google/osv-scanner-action` to a commit SHA (not just a tag) for first-CI supply-chain hygiene consistent with this row's own thesis. 0 blockers, 2 recommendations.

## Iterations

(none — initial Fresh plan)

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 17:05 | feature-plan (Claude Opus) | Fresh plan. Live-verified: NO CI exists (.github/ absent); Cargo.toml has zero crypto deps; crypto/mod.rs scaffold inert. Resolved the verify_strict-vs-boundary tension (D-5: version floor + cargo-deny bans + named contract + planted inert grep). Web-researched cargo-deny⊇cargo-audit, RUSTSEC-2022-0093, SQLCipher BSD-style, osv-scanner. Wrote discovery review + design/api/test/dev_log; 4-phase plan. Worktree base HEAD 46847e9, branch feat/crypto-deps-lockdown. | — | feature-review |
| 2026-05-19 17:32 | feature-review (Claude Opus) | Reviewed discovery + design/api/test + 4-phase plan against 5 gates. Independently re-verified all live-state claims (no .github/, zero crypto deps, crypto/mod.rs inert, Cargo.lock present & not gitignored). Confirmed D-7/D-5/D-6 + Phase-3 CI concreteness + non-broken phasing. APPROVED, 0 blockers, 2 non-blocking build recommendations. | — | feature-build |
