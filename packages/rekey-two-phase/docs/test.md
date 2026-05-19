# rekey-two-phase — Test Report

## 2026-05-19 Local Autorun

Passed:

- `pnpm --filter @repo/plugin-account test -- tests/rekey.test.ts`
- `pnpm --filter @repo/plugin-account check-types`
- `pnpm --filter @repo/plugin-account test`
- `pnpm --filter web test:rekey`
- `pnpm --filter web check-types`
- `pnpm --filter web test:nonce`
- `pnpm --filter web lint`

Coverage:

- Quarantine starts immediately on rekey begin.
- Old-key writes are rejected as `E3033`.
- Staged blobs preserve original entity revision.
- Missing mnemonic confirmation or old recovery proof rejects swap as `E3028`.
- Successful swap retires old key, activates new key, clears quarantine, rotates
  recovery public key, and makes old mnemonic invalid/new mnemonic valid.
- Restart classification covers init, 30%, 70%, before-swap, and after-swap.
- SQL swap preserves revision and moves staged bytes into `encrypted_blobs`.

## Deferred Verification

- Real blocking mnemonic backfill UI.
- Real Rust/Tauri `crypto_*` HPKE and recovery proof invocation.
- Hosted Supabase deploy and service_role Edge Function wiring.
- Real process-level `kill -9` rehearsals at each crash point.
- Two-Mac/device revocation end-to-end rekey.
