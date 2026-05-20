# rekey-two-phase — Design

Feature #32 implements the local core of the two-phase Sync Re-key flow.

## Implemented Core

- `packages/plugin-account/src/rekey.ts` owns the client-side orchestration
  state machine:
  - staging key insertion model
  - immediate old-key quarantine
  - active-device grant filtering
  - mnemonic/proof gate with `E3028`
  - staging records that preserve entity revision
  - swap completion model that retires old key, activates new key, clears
    quarantine, and rotates the recovery signing public key
  - restart classification for init, 30%, 70%, before-swap, and after-swap
- `apps/web/supabase/migrations/20260519000010_rekey_two_phase.sql` adds local
  server primitives:
  - `fn_start_rekey`
  - `fn_complete_rekey_swap`
  - old-key quarantine trigger returning `E3033`
- `/sync/push` core rejects pushes encrypted with the quarantined current key as
  `E3033`.
- The nonce ledger trigger now allows the second phase of a rekey swap to move a
  nonce already reserved by `staging_blobs` into `encrypted_blobs`.

## Boundaries

- Real UI mnemonic backfill is not implemented in this row.
- Rust `crypto_*` HPKE/recovery proof commands are represented by local seams;
  real Tauri invocation is deferred.
- Hosted Supabase deployment and process-level kill-9 rehearsals are deferred.
