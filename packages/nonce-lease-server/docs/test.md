# nonce-lease-server Test Notes

## Local Verification

Run:

```bash
pnpm --filter web test:nonce
pnpm --filter web check-types
```

The Vitest harness starts a temporary `postgres:16-alpine` container, creates
local-only Supabase `auth` and `realtime` shims, applies migrations
`20260519000001` through `20260519000008`, and seeds an account with active
and revoked devices.

Verified:

- sequential leases are `0..2`, then `3..4`
- revoked devices cannot request leases
- clients cannot directly read or mutate `nonce_lease`
- `encrypted_blobs` writes record source `blob`
- hard-deleted blob nonce reuse is rejected by `used_nonces`
- `staging_blobs` and `encrypted_blobs_conflict_shadow` record their sources
- `used_nonces` cannot be deleted

## Deferred

Live Supabase verification is blocked by `supabase-project-provisioning` (#9).
macOS Keychain `high_water` backup-rollback rehearsal is a runtime/device gate
and is recorded in deferred gates.
