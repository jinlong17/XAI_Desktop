# recovery-proof-edge-function Dev Log

## 2026-05-20 14:55 PDT

- Implemented recovery proof edge mock with registered Ed25519 public keys, one-time challenge use, and replay rejection.
- Verification: `pnpm --filter @repo/recovery-proof-edge-function test`; `pnpm --filter web test:recovery`; package `check-types`.

| Timestamp | Change | Verification | Notes |
|---|---|---|---|
| 2026-05-19 04:07 PDT | Added recovery proof Edge Function core handler and lightweight index entry. | `pnpm --filter web test:recovery` passed. | Live DB/verifier adapter remains deferred by #9. |
| 2026-05-19 04:07 PDT | Added canonical CBOR encoder, payload hash helper, challenge issue/verify flow, and E3014 rejection paths. | `pnpm --filter web check-types` passed after digest input type fix. | The first typecheck failed on DOM BufferSource narrowing; fixed locally. |
