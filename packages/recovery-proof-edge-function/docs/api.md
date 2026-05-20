# recovery-proof-edge-function API

## Files

- `apps/web/supabase/functions/recovery-proof/handler.ts`
- `apps/web/supabase/functions/recovery-proof/index.ts`
- `apps/web/supabase/tests/recovery-proof.test.ts`

## Core Functions

```ts
issueRecoveryChallenge(deps, accountId)
verifyRecoveryPatch(deps, request)
recoveryPayloadHash(payload)
encodeRecoveryMessage(message)
```

## Errors

All invalid proof paths throw:

```text
E3014: recovery proof signature failed
```

This includes missing/expired/used challenges, account mismatch, payload hash
mismatch, disallowed payload fields, and signature verification failure.

## Deferred Binding

`RecoveryProofVerifier` must be bound to strict Ed25519 verification in the
hosted Edge runtime. The client-side signer remains the Rust
`crypto_recovery_sign` command.
