# Plugin Labels API

## Entity

```ts
interface Label {
  id: string;
  entityType: "labels.label";
  schemaVersion: 1;
  syncScope: "account-sync";
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  /** Set by RepoAdapter on soft-delete; absent on hard-delete adapters. */
  deletedAt?: string;
}
```

## Public Surface

- `LabelStoreProvider`
- `useLabelStore`
- `LabelPicker`
- `LabelBadge`
- `LocalStorageAdapter`
- Local types from `src/types.ts`

## Cross-window typed events (added in W0.B, 2026-05-23)

`useLabelStore` emits via `@repo/core/events`' `emitEvent` after every successful mutation. The emit is advisory — it must not break the underlying store operation. Each emit site uses `.catch(() => undefined)` so that non-Tauri runtimes (where `emit` rejects) do not surface the failure to the caller. This extends the `void emitEvent(...)` style already used in `plugin-account/register-plugin.ts` with an explicit `.catch()` for non-Tauri shells, matching `plugin-productivity`'s sibling row (shipped 2026-05-23).

EventMap entries are declared in `packages/core/src/types/events.ts`, appended after the `productivity:*` block.

### `labels:created`

Fires once per successful `useLabelStore.createLabel(input)` call, after `adapter.save(label)` resolves and before `createLabel` returns. Throws inside `createLabel` (e.g. empty name) do not emit.

```ts
'labels:created': {
  /** Newly created label id. */
  id: string;
  /** Display name at create time (trimmed). */
  name: string;
  /** Hex color string assigned (caller-provided or fallback). */
  color: string;
  /** Optional icon glyph identifier if provided by caller. */
  icon?: string;
  /** Owning entity type — always 'labels.label' (constant). */
  entityType: 'labels.label';
  /** Version at create — always 1. */
  version: number;
  /** ISO timestamp the store stamped at creation (matches Label.createdAt). */
  createdAt: string;
};
```

### `labels:updated`

Fires once per successful `useLabelStore.updateLabel(id, patch)` call, after `adapter.save(next)` resolves and before `updateLabel` returns. If `adapter.getById(id)` returns `null` at the top of `updateLabel`, the function early-returns and **no emit fires** (silent no-op on stale id).

```ts
'labels:updated': {
  /** Updated label id. */
  id: string;
  /** Post-update display name (trimmed). */
  name: string;
  /** Post-update hex color. */
  color: string;
  /** Post-update optional icon glyph identifier. */
  icon?: string;
  /** Bumped version (current.version + 1). */
  version: number;
  /** ISO timestamp the store stamped at update (matches Label.updatedAt). */
  updatedAt: string;
};
```

### `labels:deleted`

Fires once per successful `useLabelStore.deleteLabel(id)` call. `deleteLabel` performs a pre-read via `adapter.getById(id)` to capture the live `version`. If the pre-read returns `null`, the function silent-no-ops (no adapter delete, no emit). Otherwise it calls `adapter.delete(id)`, then emits.

```ts
'labels:deleted': {
  /** Deleted label id. */
  id: string;
  /** Version at delete time — the live version just before deletion. */
  version: number;
  /** ISO timestamp the store sampled at delete time. Event timestamp, not a tombstone query. */
  deletedAt: string;
};
```

Adapter semantic note:
- `LocalStorageAdapter.delete()` is a hard delete (row removed).
- `RepoAdapter.delete()` is a soft delete (sets its own `deletedAt`, bumps `version`).
- The `labels:deleted` payload's `deletedAt` is **store-sampled**, not adapter-sampled. It may differ from `RepoAdapter`'s persisted `deletedAt` by microseconds. Consumers should treat the emit's `deletedAt` as an event timestamp.

## Error semantics

| Operation | Failure mode | Effect on emit |
|---|---|---|
| `createLabel` throws (empty name after trim) | `Error("Label name is required")` propagates | No emit. |
| `adapter.save` rejects in `createLabel`/`updateLabel` | Rejection propagates to caller | No emit (emit is after the awaited adapter call). |
| `adapter.delete` rejects in `deleteLabel` | Rejection propagates to caller | No emit (same reason). |
| `emitEvent` rejects (non-Tauri runtime) | Swallowed by `.catch(() => undefined)` at the emit site | Operation reported success; caller unaffected. |
| Stale id in `updateLabel`/`deleteLabel` (pre-read returns `null`) | Silent no-op | No emit. |

## Permission / idempotency / security

- No new permission prompts. `emitEvent` uses the existing Tauri event channel.
- Emit is not idempotent — each successful action fires exactly once. Repeated identical actions (e.g. two consecutive `updateLabel` calls with the same patch) fire twice; consumers must dedup if needed.
- Payloads carry domain identifiers (`id`, `name`, `color`, `icon?`, `entityType`, `version`, `createdAt | updatedAt | deletedAt`) only — no PII, no token, no encrypted blob.
