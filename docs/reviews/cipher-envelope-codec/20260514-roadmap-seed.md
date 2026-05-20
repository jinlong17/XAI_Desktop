# Roadmap Seed — cipher-envelope-codec

> sync-v1 roadmap · feature #7 · wave W0 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-06 (envelope.rs)
> Status hint: PENDING

## Requirement
Implement serialization/deserialization of the encryption envelope `{ v: u8, kdf_v: u8, key_id: u32 LE, encryption_device_id: u64 LE, counter: u32 LE, ciphertext: var, tag: 16B }`, including nonce reconstruction from `(encryption_device_id, counter)` on decrypt. AAD is NOT stored in the envelope — it is recomputed per FR-SY-67.

## Hard constraints
- FR-SY-08 (C-C): nonce is not stored separately in the envelope — derived from `(encryption_device_id ‖ counter)`; AAD not in envelope, recomputed via §7.1 deterministic CBOR; v=1, kdf_v=1, key_id ≥ 1.
- T12 downgrade defense: client rejects envelopes below its known min_version; `v`/`kdf_v` fields fixed (PRD §2 T12, §7.7).
- Code boundary: `apps/desktop/src-tauri/src/crypto/envelope.rs` per codebase-orientation §5/§6; wraps the ciphertext+tag produced by `aes-gcm-aead-core`.

## Threat model binding
- T1 (C-C/C-G): nonce-rebuild + fixed version fields bind ciphertext context and block nonce/version tampering (FR-SY-08, R-10.18).
- STRIDE Tampering across TB-6/TB-7 (network transport / server storage).

## Acceptance signal
Envelope round-trip serialize/deserialize is byte-stable; nonce correctly reconstructed on decrypt; malformed/short envelope parses without panic (FR-SY-14 precursor); fuzz-clean.

## Dependencies (advisory — manifest is authoritative)
Depends On: aes-gcm-aead-core (shipped)
