# kdf-primitives — Design Snapshot

## Identity

- Workflow: FEATURE_DEV
- Target: `kdf-primitives`
- Roadmap: sync-v1 · feature #3 · wave W0 · Phase 0.3
- Source brief: `docs/reviews/kdf-primitives/20260514-roadmap-seed.md`
- Scope: Rust-only KDF primitives under `apps/desktop/src-tauri/src/crypto/`.

## Decisions

| Decision | Selected | Rationale |
|---|---|---|
| Feature gating | `#[cfg(feature = "crypto")]` modules | Keeps default Tauri builds free of crypto transitive compile cost while enabling real primitive tests with `--features crypto`. |
| KEK derivation | Argon2id v=19, t=3, m=64MiB, p=4, `secret=secret_key`, output 32B | Matches PRD §3.2 / FR-SY-73 exactly and binds the 128-bit Secret Key as an Argon2 secret pepper. |
| `auth_password` | HKDF-SHA256(`master_password || secret_key`, salt=`email || xai.auth.v1`, info=`xai.auth.v1`) -> 16B, then Argon2id t=1/m=16MiB/p=1 -> 32B | Separates Supabase Auth material from KEK material and preserves the H-L dual-factor invariant. |
| HKDF helpers | `derive_db_key(KEK)` and `derive_recovery_seed(DEK)` with fixed domain strings | Future SQLCipher and Ed25519 recovery rows get one audited domain-separated helper. |
| Direct deps | Exact-pinned `hkdf`, `sha2`, `zeroize`, optional under `crypto` | `hkdf`/`sha2` are required for helpers; `zeroize` wipes temporary auth intermediate buffers. |

## Security Notes

- The weaker `auth_password` Argon2id parameters are deliberate: the input is a 16B HKDF output over `master_password || secret_key`, so an attacker needs the 128-bit Secret Key as well as the master password. This is the compensating control required by the seed brief.
- `auth_hkdf_salt(email)` uses caller-provided email bytes plus the domain separator. Email canonicalization belongs in account flow code, not this primitive.
- Raw master password and Secret Key inputs are borrowed slices and cannot be wiped by this module. Temporary owned buffers are zeroized.

## Deferred

- Cross-vendor review/verify was skipped by the 24h autorun contract and recorded in `docs/workflow/roadmap/sync-v1.deferred-gates.md`.
- Tauri command exposure belongs to `crypto-tauri-commands` (#19), not this row.

