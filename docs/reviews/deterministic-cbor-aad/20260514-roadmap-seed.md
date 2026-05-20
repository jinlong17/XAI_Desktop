# Roadmap Seed — deterministic-cbor-aad

> sync-v1 roadmap · feature #5 · wave W0 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-06 (AAD canonical writer, part of crypto module)
> Status hint: PENDING

## Requirement
Implement RFC 8949 §4.2 deterministic (canonical) CBOR encoding for the AEAD AAD: integer-keyed maps with the fixed blob schema (9 fields incl. account_id / entity_type / entity_id / proposed_revision / key_id / deleted_flag / schema_version / encryption_device_id per §7.1.2.1) plus the wrap and recovery-message AAD schemas (§7.1.2.2/3). AAD is computed on-the-fly by client encrypt/decrypt, never stored in the envelope. Ship 3 cross-implementation test vectors.

## Hard constraints
- PRD §3.1 invariant #6 / FR-SY-67 (C-G): AAD MUST be deterministic CBOR per RFC 8949 §4.2; the v0.2 `||` concatenation scheme is abolished; Rust uses `ciborium` + a custom canonical writer.
- 3 test vectors MUST enter the Phase 4.8 admission gate, cross-verified Rust (`ciborium`) + JS (`cbor-x`) + Python (`cbor2`) (R-10.17 / FR-SY-67).
- Code boundary: `apps/desktop/src-tauri/src/crypto/aad.rs` + fixtures at `apps/desktop/src-tauri/tests/fixtures/cbor_aad_vectors.json` per codebase-orientation §5/§6.

## Threat model binding
- T1.1 (malicious server / active write): AAD context-binding blocks blob-swap (server copies blob A into blob B's slot → decrypt fails) — FR-SY-67, C-G, R-10.17.
- STRIDE Tampering across TB-7/TB-8 (Supabase Postgres / Edge Function).

## Acceptance signal
The 3 cross-impl vectors encode byte-identically across Rust/JS/Python in CI; integration test: server copies blob A into blob B's position → client decrypt fails (PRD §10.x admission item).

## Dependencies (advisory — manifest is authoritative)
Depends On: crypto-deps-lockdown (shipped)
