# desktop-calendar-sync-degraded-mode - API

## Scope

This row defines desktop degraded-mode contracts for provider-backed calendar sync. It does not define a full provider transport, a local-first provider event store, or offline provider writes.

## Upstream Interfaces

| Surface | Role |
|---|---|
| `docs/adr/0011-p1-react-tauri-local-first-hybrid.md` | marks third-party calendar sync as degradable, not local-first |
| `docs/adr/0012-phase3-local-first-storage.md` | desktop storage and reconnect authority |
| `packages/xai-web-calendar/` | active local calendar owner |
| `packages/plugin-web-settings-rest/` | provider connect/status owner |
| `packages/plugin-web-storage/` | desktop local-first bridge and reconnect runtime exposure |
| `packages/core-data/src/reconnect-sync.ts` | shipped reconnect preflight/outcome semantics |

## Downstream Consumers

| Consumer | Expected use |
|---|---|
| `@repo/plugin-web-calendar` | read local-vs-provider degraded state and render honest offline UX |
| `@repo/plugin-web-settings-rest` | render provider availability, reconnect-needed, and online-only action state |
| `@repo/plugin-web-storage` | persist/hydrate calendar provider-state records and expose reconnect follow-up glue |
| `apps/web/src/providers/AppProviders.tsx` | mount only; no calendar business logic |

## Recommended Shared Record

```ts
interface CalendarProviderStateEntity extends RepoRecord {
  entityType: "calendar.provider_state";
  syncScope: "device-local";
  providerId: "gcal";
  syncMode: "online-only";
  connectionState: "connected" | "disconnected";
  availability:
    | "ready"
    | "offline"
    | "auth-required"
    | "transport-unavailable";
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastFailureCode?: string;
  lastFailureMessage?: string;
  needsReconnectRefresh: boolean;
}
```

Rules:

- `syncMode` stays `"online-only"` for third-party providers in this row.
- Record scope is `device-local`.
- This record stores provider sync health, not canonical provider event data.

## Local State vs Provider State

### Local state

- `xai_calendar_view`
- `xai_pref_week_start`
- module-local active date/focus state
- local reminder-capable visible calendar surface

### Provider state

- provider connection/syncability
- reconnect-needed flag
- last sync attempt/success/failure metadata

These two state families must not be conflated in UI copy or storage shape.

## Offline Action Semantics

- offline provider action must never be reported as provider success
- acceptable offline behaviors:
  - disabled action with explicit message
  - mark `needsReconnectRefresh = true` without minting a fake provider write
- unacceptable behavior:
  - staging provider mutations in the row `#13` outbox as if the provider were local-first
  - silently treating `connected = true` as `syncable = true`

## Reconnect Semantics

Recommended calendar-facing runtime contract:

```ts
interface DesktopCalendarSyncRuntime {
  preflight(): Promise<
    | "ready"
    | "network_unavailable"
    | "account_required"
    | "device_required"
    | "transport_unavailable"
    | "queue_empty"
  >;
  reconcileProviders(options?: { providerIds?: Array<"gcal"> }): Promise<{
    attemptedProviders: string[];
    reconciledProviders: string[];
    deferredProviders: string[];
    failures: Array<{ providerId: string; code: string; message: string }>;
  }>;
}
```

Rules:

- provider reconciliation may reuse row `#14` gating semantics, but it must not broaden row `#14` into a generic provider transport owner
- `needsReconnectRefresh` clears only after real successful provider reconciliation
- failure leaves durable failure metadata visible

## Package Boundaries

| Package | Allowed role |
|---|---|
| `@repo/core-data` | typed provider-state record and generic helpers |
| `@repo/plugin-web-storage` | desktop bridge persistence/hydration and reconnect glue |
| `@repo/plugin-web-calendar` | local calendar degraded-mode read/render logic |
| `@repo/plugin-web-settings-rest` | provider controls and messaging |
| `@repo/web` | provider/runtime mount and integration tests only |

Not allowed:

- host-owned calendar business logic in `apps/web/src/providers/`
- direct runtime dependency on `plugin-calendar`
- fake provider-local outbox entries that imply offline success

## Error / Status Semantics

Recommended UI-facing statuses:

| Status | Meaning |
|---|---|
| `local-ready` | local calendar state is available; provider sync not currently needed |
| `provider-offline` | local calendar state is available, but provider sync is unavailable because the runtime is offline |
| `provider-auth-required` | connection exists or was expected, but auth/session is unavailable |
| `provider-transport-unavailable` | runtime cannot attempt provider reconciliation |
| `provider-needs-reconnect` | the user attempted a provider action or the runtime detected stale provider state and must retry after reconnect |
| `provider-sync-failed` | last provider reconcile failed and remains visible |

The UI may compress labels, but storage must keep the distinction.

## Idempotency Notes

- repeated offline launches must not duplicate provider-state records
- repeated reconnect attempts should update the same provider record, not append opaque duplicates
- falling back to local calendar state must be side-effect free
- build must preserve browser runtime behavior when desktop bridge/runtime is inactive

