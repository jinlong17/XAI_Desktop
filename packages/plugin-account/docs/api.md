# plugin-account — API / Interface Contracts

> Wave-W0 scaffold. Public surface is minimal; implementation deferred to later rows.

## 1. Public surface (`src/index.ts` barrel)

The barrel exports registration, `KeyHandle`, mnemonic helpers, account
signup/login orchestration from `src/account.ts`, the Phase 0.3 sync push/pull
engine from `src/sync-engine.ts`, and sync lifecycle emission helpers from
`src/sync-status.ts`.

## 2. `registerAccountPlugin(): void`

Calls `PluginRegistry.register(accountManifest, {})` (idempotent — `Map.set`).
Called once from `apps/desktop/src/main.tsx` above `ReactDOM.createRoot`.
No sync logic, no IPC, no side effects beyond registry insertion.

## 3. `KeyHandle` type

```ts
export type KeyHandle = number & { readonly __brand: 'KeyHandle' };
```

Opaque branded type. JS receives/passes back this integer only;
raw key material never crosses IPC. Enforcement via Rust `KeyHandle(u32)` seam
in `apps/desktop/src-tauri/src/crypto/mod.rs` (later row).

## 4. Events (declared in manifest.json `events.emit`)

| Key | Payload | Direction |
|---|---|---|
| `account:logged-in` | `{ userId: string }` | emit-only |
| `account:logged-out` | `{ userId: string }` | emit-only |
| `account:sync-started` | `{ kind: 'push' \| 'pull' }` | emit-only |
| `account:sync-completed` | `{ kind: 'push' \| 'pull'; durationMs: number }` | emit-only |
| `account:sync-failed` | `{ kind: 'push' \| 'pull'; error: string }` | emit-only |

- `account:sync-failed.error` is a human-readable string (mirrors AppError Display).
- Other plugins listen via `useEventListener`; they must not emit account:* events.

## 5. Manifest

See `manifest.json` — `enabled: false`, four `crypto_*` command declarations, no components.

## 6. Account orchestration

See `packages/account-signup-login/docs/api.md` for the current local contract.
The key invariant is that `masterPassword` and `secretKey` are accepted only by
the injected crypto seam, while auth transport receives derived auth/check fields.

## 7. Sync engine

See `packages/sync-engine-push/docs/api.md` for the push-side
`createSyncOutbox`, `pushBatch`, `createSyncPushHttpTransport`, and UUIDv7
mutation-id contracts.

See `packages/sync-engine-pull/docs/api.md` for pull-side
`pullBatch`, `applyServerRecords`, global cursor, and rollback-classification
contracts.

The key push invariant is that JS submits entity metadata and plaintext to the
injected crypto seam; Rust `crypto_encrypt_for` owns CBOR AAD construction.

## 8. Sync status emission

`createSyncStatusEmitter()` and `runObservedSync()` are the plugin-account owned
helpers for FR-SY-45. They are the only public helpers that emit:

- `account:sync-started`
- `account:sync-completed`
- `account:sync-failed`

Host code may listen to these events to update shell surfaces such as the
menu-bar icon, but must not emit `account:*` events itself.

## 9. Single-table todo sync store

`createTodoSyncStore(driver)` is the Phase 0.3 local todo entity seam. It owns
`account_todos` and `sync_outbox` SQL statements through the injected
`SqliteDriver`.

`putTodo(todo, { mutationId })` writes the entity row and outbox row in one
driver transaction. `applyRemoteTodo(todo)` applies decrypted pull records
without creating a new outbox entry.
