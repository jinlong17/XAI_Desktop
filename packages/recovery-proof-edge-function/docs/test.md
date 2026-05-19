# recovery-proof-edge-function Test Notes

Run:

```bash
pnpm --filter web test:recovery
pnpm --filter web check-types
```

Verified:

- challenge is 32 bytes
- challenge TTL is five minutes
- payload hash uses canonical CBOR over the full payload
- verifier receives server-encoded recovery message bytes
- successful proof marks challenge used and updates account payload
- replayed challenge is rejected
- tampered payload hash is rejected
- disallowed payload field is rejected
- expired challenge is rejected
- signature failure is rejected

Deferred:

- hosted Supabase deploy
- persistent challenge table/cleanup
- strict Ed25519 provider binding in Edge runtime
- end-to-end PATCH `/auth/me` with real Rust signature
