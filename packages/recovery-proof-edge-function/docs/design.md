# recovery-proof-edge-function Design

## Scope

Feature #29 authors the recovery proof Edge Function core under
`apps/web/supabase/functions/recovery-proof/`.

Live Supabase database adapter, hosted deploy, and strict Ed25519 provider
binding are deferred until Supabase provisioning (#9). The core protocol logic
is isolated behind `RecoveryProofDatabase` and `RecoveryProofVerifier`.

## Flow

1. `issueRecoveryChallenge()` creates a 32-byte random challenge with a 5
   minute TTL and stores it through the DB seam.
2. `verifyRecoveryPatch()` validates challenge existence, account ownership,
   unexpired state, and single-use status.
3. The new payload is checked against an allowlist of account fields.
4. The server computes `SHA256(CBOR_canonical(new_payload))`.
5. The hash must match `message.payloadCanonicalHash`.
6. The server CBOR-encodes the unique recovery message schema:
   `{1:msg_v, 2:challenge_id, 3:account_id, 4:payload_canonical_hash, 5:ts}`.
7. The injected verifier checks Ed25519 signature validity against
   `accounts.recovery_signing_pub`.
8. On success, the challenge is marked used and the account update runs through
   the DB seam.

All proof failures map to E3014.
