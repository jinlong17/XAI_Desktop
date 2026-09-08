# web-sync-crypto-contract-preflight — API / Contract Notes

## Runtime API

None yet. This is a docs-only preflight row.

## Browser Crypto Contract

| Surface | Frozen contract |
|---|---|
| Argon2id | Browser runtime uses an independent implementation, not Rust WASM parity-by-code. Output must match RFC 9106 and repo fixtures. |
| AES-GCM | Browser runtime uses `WebCrypto` AES-GCM. No custom browser-side nonce field is serialized. |
| Envelope | Wire payload carries base64-encoded binary envelope `blob`; header fields are `v`, `kdf_v`, `key_id`, `encryption_device_id`, `counter`. |
| Deterministic CBOR AAD | Browser must reproduce the shipped fixed-schema bytes exactly; AAD is recomputed, not transmitted as a source-of-truth wire field. |
| HPKE | Browser runtime uses modular HPKE with X25519/HKDF-SHA256 semantics matching shipped Sync rows. |
| Recovery primitives | If Web signs or verifies recovery proofs, it must pass the shipped Ed25519/RFC gate before the flow can ship. |

## `/sync/pull`

### Request

- Method: `GET`
- Path: `/sync/pull`
- Query:
  - `since_commit_seq=<string>`
  - `limit=<number>`
- Required headers:
  - `Authorization: Bearer <jwt>`
  - `Accept-Version: sync.protocol=1`
  - `X-Device-Id: <uuid>`

### Response

```ts
type PullResponse = {
  records: Array<{
    entity_type: string;
    entity_id: string;
    revision: string;
    key_id: number;
    blob: string; // base64 envelope
    commit_seq: string;
    soft_deleted: boolean;
    hard_deleted: boolean;
    originator_device_id: string;
  }>;
  next_commit_seq: string;
  current_account_commit_seq: string;
  has_more: boolean;
};
```

### Frozen semantics

- `since_commit_seq` / `commit_seq` are the authority. `since_seq` is not an accepted wire alias.
- `revision`, `commit_seq`, and `current_account_commit_seq` stay as JSON strings for BIGINT safety.
- `originator_device_id === own_device_id` is a self-echo ignore path, not a server error.

## `/sync/push`

### Request

- Method: `POST`
- Path: `/sync/push`
- Required headers:
  - `Authorization: Bearer <jwt>`
  - `Accept-Version: sync.protocol=1`
  - `X-Device-Id: <uuid>`

### Body

```ts
type PushRequest = {
  records: Array<{
    entity_type: string;
    entity_id: string;
    mutation_id: string;
    base_revision: string | null;
    proposed_revision: string;
    blob: string; // base64 envelope
    client_updated_at: number;
    soft_delete: boolean;
    hard_delete: boolean;
    causal_deps?: Array<{
      entity_id: string;
      max_seen_revision: string;
    }>;
  }>;
};
```

### Frozen semantics

- Browser driver computes `proposed_revision = base_revision + 1` locally before encryption, but serializes both as strings on the wire.
- Wire payload carries the full envelope in `blob`; it does not split out `blob_nonce` or `blob_aad`.
- `entity_type` stays per record, matching shipped client/edge seams.

## `sync_events.seq` / Realtime

| Field | Frozen meaning |
|---|---|
| `commit_seq` | The only authoritative ordering value for pull/realtime/account monotonicity. |
| `sync_events.seq` | Allowed only as a naming alias for the same monotone value. It must not diverge from `commit_seq`. |
| Realtime payload | Metadata only; no encrypted record body is merged directly from the event. |

Baseline metadata payload:

```ts
type RealtimeMetadata = {
  entity_type: string;
  entity_id: string;
  commit_seq: string;
  originator_device_id: string;
};
```

## `blob_aad`

### Frozen semantics

- `blob_aad` is a derived authenticated context, not a business field.
- It is not the authority for transport, persistence, or filtering.
- It is recomputed from fixed schema inputs on encrypt/decrypt.

### Required `BlobAad` schema

1. `aad_version`
2. `account_id`
3. `entity_type`
4. `entity_id`
5. `proposed_revision`
6. `key_id`
7. `deleted_flag`
8. `schema_version`
9. `encryption_device_id`

## `X-Device-Id`

### Permission semantics

- Required on all `/sync/*` requests.
- Required on device/session/account RPCs except the bootstrap path that creates the first server-side device row.
- Missing or unknown device: `401`.
- Revoked device: `403` with `device_revoked` semantics.

### Client contract

- Web must force local logout / cache clear / reconnect flow on `device_revoked`.
- Web must not silently retry business APIs without the header.

## Error Semantics

| Error | Meaning |
|---|---|
| `E3015` | entity-level rollback / revision mismatch class |
| `E3024` | account-level commit sequence rollback |
| `E3027` | nonce reuse detected by server-side ledger |
| `device_revoked` | device row is revoked even if auth token still refreshes |
| `version_required` | missing `Accept-Version` |
| `envelope_version_too_old` | stale envelope protocol version |

## Mock / Idempotency Notes

- Local mocks must preserve these wire shapes and error semantics exactly.
- Duplicate `mutation_id` must preserve idempotent replay semantics rather than creating a new revision.
- No local mock may invent a second sequence authority or a different AAD/envelope layout.
