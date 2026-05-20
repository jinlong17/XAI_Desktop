# Roadmap Seed — rfc-test-vectors-gate

> sync-v1 roadmap · feature #35 · wave W3 · Phase 4.8
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-B6 + stride-cve.md §3.1
> Status hint: PENDING

## Requirement
GAP-T3' admission item: run the official RFC test vectors for the three security-critical crypto crate classes plus canonical CBOR — RFC 9106 (Argon2id), RFC 8032 (Ed25519), RFC 9180 (HPKE), RFC 8949 §4.2 (deterministic CBOR) — and assert code-level `ed25519-dalek verify_strict` is enforced. CI-gated alongside the existing CBOR vectors (R-10.17).

## Hard constraints
- Run official RFC vectors: RFC 9106 (Argon2id KEK params), RFC 8032 (Ed25519 sign/verify), RFC 9180 (HPKE Base mode DHKEM-X25519 + HKDF-SHA256 + AES-256-GCM), RFC 8949 §4.2 (deterministic CBOR) (stride-cve.md §3.1 item 3, PRD §7.1.4).
- `ed25519-dalek` MUST be ≥ 2.x with code-level enforced `verify_strict` (historical RUSTSEC-2022-0093 Chalkias double-pubkey / malleability class) — assertion required (stride-cve.md §3 dep #4, §3.1 item 4).
- 3 CBOR AAD vectors (blob / wrap / recovery message) cross-checked Rust `ciborium` + JS `cbor-x` + Python `cbor2`, bytes-identical, CI-forced (PRD §7.1.4, R-10.17); fixture at `apps/desktop/src-tauri/tests/fixtures/cbor_aad_vectors.json`.
- This is a hard blocking Phase 4.8 admission gate (same gate as existing CBOR vectors) (stride-cve.md §3.1, dep crates exact-pinned by crypto-deps-lockdown #2).
- Code boundary: vectors + harness in `apps/desktop/src-tauri/tests/` (cargo test) + cross-impl JS/Python; CI gate config (codebase-orientation §5/§6, CLAUDE.md §Code Boundaries).

## Threat model binding
- GAP-T3' supply-chain Elevation-of-Privilege (stride-cve.md §2.5, §3.1); R-10.17 (CBOR canonical encoding inconsistency); R-10.16 (Ed25519 verify_strict).
- STRIDE Elevation-of-Privilege — backdoored crypto dep = full zero-knowledge EoP (stride-cve.md §2.4 T10 GAP-T3').

## Acceptance signal
RFC 9106/8032/9180/8949 official vectors pass in Rust; `verify_strict` enforcement asserted; 3 CBOR vectors byte-identical across Rust/JS/Python; CI blocks merge on any vector failure (PRD §10.x, stride-cve.md §3.1, dev-plan T-B6 + §5.1 crypto/aad_cbor 100%).

## Dependencies (advisory — manifest is authoritative)
Depends On: crypto-deps-lockdown, ed25519-recovery-signing, hpke-per-device-wrap, deterministic-cbor-aad (all shipped).
