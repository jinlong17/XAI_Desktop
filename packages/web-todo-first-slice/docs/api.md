# web-todo-first-slice — API / Contract Notes

## Runtime Surface

This row owns the first real browser Todo module contract. It does not introduce a new backend API outside the shipped auth/sync/cache seams.

## Upstream Interfaces

| Surface | Assumption |
|---|---|
| `@repo/web-auth-device-session/web` | owns authenticated route gating, session state, device-bound fetch, and device failure cleanup |
| `@repo/core` route/capability types | remain the shared owner for `ConsoleRouteState`, `ConsoleViewCapabilities`, and `WebModuleRouteRegistration` |
| `@repo/core-data` | remains the only repository contract and encrypted data plane |
| `web-sync-blob-driver` | owns `/sync/pull` and `/sync/push` semantics; W7 only consumes the repo surface |
| `web-encrypted-indexeddb-cache` | owns encrypted durable local cache and memory-only search/sort rebuild behavior |
| `web-console-host-router` | owns `/app/:moduleId/*` routing and browser-safe capability injection |

## Downstream Interfaces

| Consumer | Contract this row must preserve |
|---|---|
| `web-realtime-metadata-sync` | can hydrate and reconcile the same Todo repo/module without replacing route or entity ownership |
| `web-offline-outbox-conflicts` | can reuse W7 repo records, soft-delete semantics, and fixtures |
| `web-productivity-habits-pomodoro` | can add sibling browser modules without moving Todo ownership out of `plugin-productivity` |
| `web-search-keyboard-theme` | can index/search the same Todo records and route identities |

## Route Contract

Frozen browser routes:

- `/app/todos`
- `/app/todos/:listId`
- `/app/todos/:listId/:todoId`

### Route semantics

- missing `listId`
  - resolves to default `smart:inbox`
- `listId`
  - identifies a locally derived smart list in W7
- `todoId`
  - identifies the selected Todo record for detail rendering
- refresh and deep-link restore
  - must reconstruct visible list/detail state from route params plus encrypted local repo state

### W7 list ids

- `smart:inbox`
- `smart:today`
- `smart:done`

Rules:

- unsupported list ids degrade to the default W7 list, not an unhandled crash
- route identity must remain serializable and compatible with the host `ConsoleRouteState`

## Browser-safe module registration contract

W7 should expose one package-owned module registration:

```ts
type TodoWebModuleRegistration = WebModuleRouteRegistration;
```

Required semantics:

- `moduleId` is `todos`
- child routes cover:
  - `""`
  - `":listId"`
  - `":listId/:todoId"`
- `apps/web` composes this registration but does not own Todo business rendering or data logic

## Persisted Todo contract

Persisted source of truth: repository-backed encrypted Todo records compatible with the shared `TodoEntity`.

Minimum required fields:

```ts
type WebTodoRecord = {
  id: string;
  entityType: "productivity.todo";
  schemaVersion: number;
  syncScope: "account-sync";
  title: string;
  done: boolean;
  labelIds: string[];
  dueAt?: string;
  notes?: string;
  projectId?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

Rules:

- W7 must not create a second Web-only persisted schema for the same entity.
- Optional fields added for W7 must be backward-compatible and serializable through the current encrypted Sync blob repo.
- Default list queries exclude `deletedAt`.

## CRUD contract

### Read

- list queries operate against the local encrypted repo/cache state
- detail reads resolve by `todoId` from the same repo state
- no route may depend on static `accountMocks` or hard-coded placeholder lists

### Create

- creates a repository record through `repo.put(...)`
- requires device-bound authenticated repo and unlocked DEK/write-ready crypto runtime

### Edit

- W7 edit scope:
  - `title`
  - `notes`
- updates go through repository mutation pipeline only

### Complete / uncomplete

- toggle `done` via repository update

### Delete

- user-facing delete is soft delete
- recommended write shape:
  - `deletedAt = <iso timestamp>`
  - `updatedAt = <iso timestamp>`
- hard purge is not the default W7 UI action

## Readiness / state contract

The module must expose explicit readiness lanes:

- `loading`
  - route mounted, repo bootstrap in progress
- `locked`
  - authenticated route but crypto runtime not write-ready
- `ready`
  - repo available and route can read/write
- `error`
  - typed bootstrap/read/write failure

Rules:

- authenticated-but-not-ready state must not silently fall back to LocalStorage or static mocks
- write actions must disable or fail explicitly when DEK/device-bound readiness is missing

## Error Semantics

| Error | Meaning | Required reaction |
|---|---|---|
| `todo_repo_unavailable` | repo/bootstrap seam is missing | show recoverable module error, no mock fallback |
| `todo_crypto_locked` | DEK not ready for write path | block write actions and surface locked state |
| `todo_device_session_missing` | no authenticated device-bound request seam | redirect or recover through auth/session owner |
| `todo_not_found` | route `todoId` does not resolve | keep list route mounted and clear detail selection |
| `todo_invalid_list` | unsupported `listId` | degrade to `smart:inbox` |
| `todo_soft_deleted` | selected record is soft deleted | clear detail selection and return to list |
| `todo_sync_write_failed` | repository mutation failed | keep explicit error lane; do not swap to mock storage |

## Idempotency And Navigation Notes

- revisiting `/app/todos` should deterministically resolve to `smart:inbox`
- repeated complete/uncomplete toggles should converge to the final persisted `done` value
- repeating a soft delete should be safe and keep the record excluded from active W7 lists
- route-driven selection must be stable across refresh/back/forward navigation

## Verify Remediation (2026-05-22)

- Runtime seam contract added for W7 web todo module:
  - `globalThis.__XAI_WEB_TODO_SESSION__` with `{ authState, accountId, deviceId, fetchSync }`.
  - `globalThis.__XAI_WEB_TODO_CRYPTO__` with `{ dekBase64, keyId, encryptionDeviceId }`.
  - `window` dispatch event `xai:web:todo-runtime-updated` when session/crypto snapshots change.
- `createBrowserTodoRepo` now rejects missing `accountId/deviceId/fetchSync` with `todo_device_session_missing` instead of falling back to `web-local-*` defaults.
- Route write-gate semantics are now lane-bound (`ready` only); locked/loading/error lanes never silently fall back to LocalStorage.
