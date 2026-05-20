# rekey-two-phase — API

## Plugin Account Exports

- `beginRekey(input)`
- `stageRekeyBlobs(session, blobs)`
- `completeRekeySwap(account, session, gate)`
- `assertRekeyProofGate(gate)`
- `assertCanPushWithKey(account, keyId)`
- `resumeRekeyAfterCrash(session, point)`
- `validateCurrentMnemonic(session, phrase)`

Error constants:

- `REKEY_PROOF_ERROR = "E3028"`
- `KEY_QUARANTINED_ERROR = "E3033"`

## Server SQL

- `fn_start_rekey(p_account_id, p_new_key_id)`
- `fn_complete_rekey_swap(p_account_id, p_rekey_session_id, p_old_key_id, p_new_key_id, p_new_recovery_signing_pub, p_mnemonic_confirmed, p_old_recovery_proof_valid)`

## Test Entrypoints

- `pnpm --filter @repo/plugin-account test -- tests/rekey.test.ts`
- `pnpm --filter web test:rekey`
