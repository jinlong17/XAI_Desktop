# nonce-lease-server Design

## Scope

Feature #24 implements the server-side nonce uniqueness anchor for Sync v1:

- authenticated nonce lease RPC
- database-enforced `used_nonces` writes for nonce-consuming tables
- append-only guard for `used_nonces`

The macOS Keychain `high_water` anchor remains a secondary client-side guard
owned by the Keychain/runtime path.

## Lease RPC

`fn_grant_nonce_lease(account_id, key_id, count)` derives the caller device
from the JWT `device_id` claim. The function requires:

- `auth.uid() = account_id`
- the JWT device is active and not revoked
- the requested key is active or staging
- `count > 0`

The RPC locks the caller's `sync_devices` row, then locks the latest matching
lease row before inserting the next range. The first range starts at `0`;
subsequent ranges start at previous `lease_end + 1`. Ranges at or beyond
`0xFFFFFF00` are rejected so downstream re-key can take over before the GCM
counter space is exhausted.

## Used Nonce Ledger

Triggers on `encrypted_blobs`, `staging_blobs`, and
`encrypted_blobs_conflict_shadow` insert into `used_nonces` in the same
transaction. The `(account_id, key_id, encryption_device_id, counter)` primary
key is the hard duplicate nonce barrier across live blobs, hard-deleted blobs,
staging rows, and conflict shadow rows.

`used_nonces` has update/delete triggers that always raise, preserving the
append-only invariant.
