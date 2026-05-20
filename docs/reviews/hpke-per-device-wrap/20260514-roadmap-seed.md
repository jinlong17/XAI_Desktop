# Roadmap Seed — hpke-per-device-wrap

> sync-v1 roadmap · feature #13 · wave W1 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-06/T-08 (HPKE wrap path)
> Status hint: PENDING

## Requirement
Implement HPKE Base mode (RFC 9180, DHKEM(X25519, HKDF-SHA256) + HKDF-SHA256 + AES-256-GCM) seal/unseal of the DEK to each active device's `device_pub`, writing `device_dek_wraps` rows keyed `(account_id, device_id, key_id)`. The HPKE `info` (domain separation) MUST be distinct from `aad` (wrap metadata).

## Hard constraints
- FR-SY-76 (C-A/C-B): HPKE Base mode RFC 9180 with the exact suite above; `info` = CBOR-canonical wrap_aad_schema (domain sep), `aad` ≠ info (H-5) — keep the distinction (stride-cve §3 #5).
- Pin the chosen `hpke` crate + `cargo audit` + run RFC 9180 official vectors at the Phase 4.8 admission gate (stride-cve §3 #5); libsodium sealed_box fallback explicitly NOT recommended (would lose RFC 9180 info/aad binding).
- Code boundary: `apps/desktop/src-tauri/src/crypto/` per codebase-orientation §5/§6; consumes x25519 device keypair + deterministic-CBOR AAD.

## Threat model binding
- T11 / T1.1 (revoked device / malicious server): per-device HPKE wrap means revoking a device deletes its wrap rows; old device has no wrap to unseal (PRD §2 T11/T1.1, FR-SY-76, R-10.15).
- STRIDE Tampering / Information Disclosure across TB-7/TB-8 (server-held wrap ciphertext).

## Acceptance signal
HPKE seal/unseal round-trips the DEK for a given device_pub; RFC 9180 official vectors pass in CI (enters Phase 4.8 admission gate); info≠aad enforced and tested.

## Dependencies (advisory — manifest is authoritative)
Depends On: x25519-device-keypair, deterministic-cbor-aad (shipped)
