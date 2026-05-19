# roadmap-kickoff — API / Interface Contracts

> Contract assumptions for the scaffold. Shapes are seams; impl is later rows.

## 1. EventMap extension (`packages/core/src/types/events.ts`)

Add to `interface EventMap` (plugin-account is sole owner/emitter; others listen only):

```ts
// Account / Sync events (local-bus signals; PRD §5.7 FR-SY-39 — NOT network messages)
'account:logged-in':      { userId: string };
'account:logged-out':     { userId: string };
'account:sync-started':   { kind: 'push' | 'pull' };
'account:sync-completed': { kind: 'push' | 'pull'; durationMs: number };
'account:sync-failed':    { kind: 'push' | 'pull'; error: string };
```

- **Lifecycle gate (strict):** key added to `EventMap` → declared in
  `plugin-account/manifest.json` `events.emit` → only then used. The scaffold's
  compile-smoke usage must reference a declared+emitted key.
- **Error semantics:** `account:sync-failed.error` is a human-readable string
  (mirrors the eventual `AppError` `Display`); structured codes flow through Tauri
  command `Result`, not events.
- **Idempotency/permission:** events are fire-and-forget broadcasts; no ack. Only
  plugin-account emits (manifest-enforced ownership).

## 2. `useTauriInvoke` core hook (`packages/core/src/hooks/useTauriInvoke.ts`)

The single sanctioned JS→IPC chokepoint (red line #4, TB-3).

```ts
// packages/core/src/hooks/useTauriInvoke.ts
import { invoke } from '@tauri-apps/api/core';

/** Type-safe wrapper around Tauri invoke. The ONLY place plugins reach IPC. */
export function useTauriInvoke(): {
  invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
};
```

- Exported via `packages/core/src/hooks/index.ts` →
  `export { useTauriInvoke } from './useTauriInvoke';` → reachable as
  `import { useTauriInvoke } from '@repo/core/hooks'`.
- **Error semantics:** rejects with the raw Tauri error (string today; structured
  `AppError` once commands adopt it). The hook does not swallow or remap errors in
  the scaffold — hardening (validation, capability checks) is a later row.
- **Permission:** plugins MUST use this hook; importing `@tauri-apps/api` directly
  from a plugin is a red-line #4 violation enforced in review.
- **Idempotency:** pass-through; the hook adds no retry/dedupe semantics.

## 3. Rust `AppError` (`apps/desktop/src-tauri/src/error.rs`)

```rust
// thiserror enum; serde-serializable for Tauri IPC return.
#[derive(Debug, thiserror::Error, serde::Serialize)]
pub enum AppError {
    // E1xxx system (generic fallback only in scaffold)
    #[error("E1000: internal error: {0}")]
    Internal(String),

    // E3xxx sync (concretely populated in scaffold)
    #[error("E3000: sync not initialized")]
    SyncNotInitialized,
    #[error("E3001: sync auth required")]
    SyncAuthRequired,
    #[error("E3002: sync transport failed: {0}")]
    SyncTransport(String),
    #[error("E3003: sync conflict")]
    SyncConflict,
    // (E2xxx business / E4xxx AI families documented, not populated in scaffold)
}

pub type AppResult<T> = Result<T, AppError>;
```

- `mod error;` added to `lib.rs`. **Existing `commands/window.rs` is NOT migrated**
  (stays `Result<(), String>`) — D-6 Option A, out of scaffold blast radius.
- **Error code contract:** every variant's `Display` begins with its `E<family><nnn>`
  code so JS can parse a stable prefix. Serde shape = externally-tagged enum (default
  derive); downstream rows may add a `#[serde(tag=...)]` if needed — not in scaffold.
- **Idempotency/permission:** N/A (error type only). No command wiring changes; no
  `invoke_handler!` signature changes. `thiserror` must be added to `Cargo.toml`
  `[dependencies]` (the only new crate — a pure-macro derive crate, no crypto/http).

## 4. `KeyHandle` opaque-handle seam (T6 / FR-SY-75)

- Rust (`src-tauri/src/crypto/mod.rs` placeholder): `pub struct KeyHandle(u32);`
  with no public constructor exposed to commands in the scaffold (seam only).
- TS (`plugin-account/src/types.ts`): branded opaque type so JS cannot fabricate one:
  ```ts
  export type KeyHandle = number & { readonly __brand: 'KeyHandle' };
  ```
- **Contract:** raw key material never crosses IPC; only `KeyHandle` values do.
  Enforcement (KeyVault) is a later crypto row; the scaffold fixes the type seam.

## 5. `@repo/plugin-account` public surface (`src/index.ts` — only export)

```ts
export { registerAccountPlugin } from './register-plugin';
export type { KeyHandle /*, ...future account types */ } from './types';
```

- `registerAccountPlugin(): void` calls
  `PluginRegistry.register(accountManifest, accountComponents)` (idempotent — safe
  to call once from `main.tsx`).
- `manifest.json` (live schema): `name: "account"`, `enabled: false` (Planned —
  not yet active), `events.emit: ["account:logged-in", ...]`, `dependencies:
  ["@repo/core"]`, `tauriCommands: []` (no crypto commands in scaffold).
- No deep imports permitted (red line #9). `src/internal/` if present is private.

## 6. `@repo/core-data` public surface (`src/index.ts` — only export)

```ts
export type { Repo, RepoRecord } from './types';
export { createInMemoryRepo } from './testing';
```

- `Repo` = abstract async CRUD interface seam (`get/put/delete/list`). SQLCipher
  driver is a later row. `createInMemoryRepo()` is the `@repo/core-data/testing`
  mock for plugin tests (PLUGIN_SDK §7.2 contract).
- Depends only on `@repo/core` (red line #8). `tsconfig.json`/`package.json` mirror
  organizer's shape (`exports` `.` → `./src/index.ts`, extends
  `@repo/typescript-config/react-library.json`).

## 7. PLUGIN_MAP rows (`docs/PLUGIN_MAP.md`)

- Core Packages table: add `@repo/core-data | packages/core-data/ | Planned | Sync
  数据访问 + REST 驱动骨架 | 2026-05-19`.
- Plugins table: add `account | packages/plugin-account/ | Planned | sync/PRD §5 |
  @repo/core | 2026-05-19`.

## 8. Host registration (`apps/desktop/src/main.tsx`)

- Add `import { registerAccountPlugin } from '@repo/plugin-account';` and a single
  `registerAccountPlugin();` call placed ABOVE `ReactDOM.createRoot`. The `Router()`
  function body is NOT modified (R-1). Red line #1/#8: no sync logic in host —
  registration call only.
