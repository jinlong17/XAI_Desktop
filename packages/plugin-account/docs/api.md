# plugin-account — API / Interface Contracts

> Wave-W0 scaffold. Public surface is minimal; implementation deferred to later rows.

## 1. Public surface (`src/index.ts` barrel)

The barrel exports registration, `KeyHandle`, mnemonic helpers, and account
signup/login orchestration from `src/account.ts`.

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
