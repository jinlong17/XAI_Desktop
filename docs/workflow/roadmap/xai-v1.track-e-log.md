# XAI v1 Track E — G9 Sync Hardening Log

## 2026-05-20 14:55 PDT Checkpoint

Scope: `codex/track-e-sync-hardening`, no ship, no push.

Implemented all requested G9 hardening Epics with local-only verification:

- G9-E1: deterministic CBOR serializer/deserializer, protocol AAD builder/verifier, stable vectors, and round-trip tests.
- G9-S1: TypeScript state-space fallback for nonce/rekey invariants, deadlock checks, and swap reachability.
- G9-E2: in-memory nonce lease RPC model, duplicate nonce rejection, renew/release/progress tracking, and plugin-account nonce manager.
- G9-E3: X25519 device keys, Ed25519 recovery signing, HPKE-style per-device DEK wrap, device registration, pairing approval, rate limiting, and max-device guard.
- G9-E4: two-phase rekey checkpoint store and kill-9 resume flow.
- G9-E5: four mock recovery rehearsals.
- G9-E6: audit hash chain, tamper detection, privacy-safe telemetry, and Sentry breadcrumb placeholder.
- G9-E7: plugin-account quota, rate limit, support feedback, encrypted export, and delete-account plan.
- Supabase tests: Docker/Postgres paths replaced with Vitest-only mocks for nonce, rekey, audit, RLS, and RLS fuzz. Migration SQL is smoke-checked locally by expected function/policy names.

Verification passed:

- All 14 new scaffold package `test` commands.
- `pnpm --filter @repo/plugin-account test` (42 tests).
- `pnpm --filter web test:nonce`, `test:rekey`, `test:audit`, `test:rls`, `test:rls-fuzz`, `test:protocol`, `test:push`, `test:recovery`.
- `pnpm --filter @repo/plugin-account check-types`.
- `pnpm --filter web check-types`.
- New package `check-types` passed after changing scaffold tsconfigs to relative shared config and root tool invocation.

Deferred gates:

- Hosted Supabase deployment remains intentionally deferred; no remote project was used.
- Independent crypto review and official RFC vector admission remain deferred for release hardening.
- Real multi-device/macOS Keychain runtime rehearsals remain deferred to hardware/runtime gates.
