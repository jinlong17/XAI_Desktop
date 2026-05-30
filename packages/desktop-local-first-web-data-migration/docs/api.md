# desktop-local-first-web-data-migration - API

## Scope

This row defines the browser-to-desktop import contract for representative Web data only. It does not define sync queueing, reconnect, backup/export/import UX, or browser-auth/cache/secret migration.

## Upstream Interfaces

| Surface | Role |
|---|---|
| `docs/adr/0012-phase3-local-first-storage.md` | ownership and deferral authority |
| `packages/desktop-local-first-repository-bridge/docs/api.md` | canonical row `#11` desktop repo targets |
| `packages/core-data/src/types.ts` | `Repo<T>`, `RepoRecord`, `MigrationResult`, transaction semantics |
| `packages/plugin-web-storage/src/internal/{registry.ts,storage.ts,desktopRepoBridge.ts}` | browser key registry, browser read path, canonical mapping evidence |
| `apps/web/src/providers/AppProviders.tsx` | desktop runtime mount point and auth/runtime context |
| `packages/web-auth-device-session/` | optional account-boundary evidence and browser-owned IDB inventory |

## Downstream Consumers

| Consumer | Expected use |
|---|---|
| `AppProviders` | first-run scan trigger only |
| settings/debug UI consumer | explicit import trigger and status display |
| `desktop-local-first-offline-edit-queue` | assumes imported canonical records already exist |
| `desktop-local-first-sync-reconnect` | assumes imported account-boundary evidence exists |
| `desktop-local-first-backup-export-import` | may later reuse import ledger evidence for richer restore UX |

## Contract Assumptions

### Trigger contract

Two modes are sufficient for row `#12`:

```ts
type DesktopWebImportTrigger = "first-run-scan" | "explicit-import";
```

### Request shape assumptions

```ts
interface DesktopWebImportRequest {
  trigger: "first-run-scan" | "explicit-import";
  boundaryKey: string; // session.user.id or "local-session"
  surfaces?: Array<
    "tasks" |
    "habits" |
    "pomodoro" |
    "boards" |
    "board-workspace" |
    "pet" |
    "settings"
  >;
  dryRun?: boolean; // true for first-run-scan
  allowBoundaryOverride?: boolean; // explicit only
}
```

### Response shape assumptions

```ts
type DesktopWebImportSurfaceStatus =
  | "imported"
  | "unchanged"
  | "empty"
  | "skipped"
  | "corrupt"
  | "failed";

interface DesktopWebImportSurfaceResult {
  surface: string;
  status: DesktopWebImportSurfaceStatus;
  sourceFingerprint?: string;
  importedCount?: number;
  deletedCount?: number;
  unchangedCount?: number;
  skippedReason?: "browser_owned_store" | "unsupported_surface" | "boundary_conflict";
  message?: string;
}

interface DesktopWebImportResult {
  runId: string;
  trigger: "first-run-scan" | "explicit-import";
  boundaryKey: string;
  wrote: boolean;
  results: DesktopWebImportSurfaceResult[];
  skippedIndexedDbStores: string[];
}
```

These are planning contracts only. Build may refine field names, but the behavior must remain aligned.

## Representative Surface Mapping

| Source | Target | Notes |
|---|---|---|
| `xai_task_cols` | `productivity.todo` | deterministic ids; reconcile stale imported ids safely |
| `xai_habits_state` | `productivity.habit` | deterministic ids; replace completion payloads by id |
| `xai_pomodoro_sessions` | `productivity.pomodoro_sessions` | single record replace |
| `xai_boards_v2` | `project.board` + `project.card` | same canonical split as row `#11` |
| `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, `xai_board_view_by_id` | `project.workspace_state` | per-slot replace |
| `xai_pet_id`, `xai_pet_pos` | `pet.state` | per-slot replace |
| present bridged settings keys | `settings.pref` | import explicit present source values only |

## Error Semantics

| Kind | Meaning | Expected handling |
|---|---|---|
| `repo_unavailable` | desktop repo seam cannot open or bootstrap | first-run scan may still report source inventory; execute path fails visibly |
| `boundary_conflict` | current import boundary differs from previously imported boundary without override | suppress automatic execution; require explicit warning path |
| `corrupt_source` | source key/store exists but cannot be decoded into the expected shape | report per surface, skip mutation for that surface |
| `unsupported_surface` | notes or non-approved surfaces requested | report skipped; do not fake success |
| `write_failed` | repo reconcile transaction failed | preserve browser source, keep prior good repo data if transaction aborts |
| `busy` | another import run is already active | fail fast; do not overlap |

## Permission and Boundary Notes

- Import executes only in `desktop-phase1-offline`.
- Browser runtime remains browser-only.
- No direct Tauri imports are needed in business packages; import logic must keep consuming the shipped repo seam.
- Import must not delete or rewrite browser source keys/stores.
- Browser-owned IndexedDB stores must be reported and skipped, not mutated.

## Idempotency Notes

- unchanged-source reruns must be true no-ops
- changed-source reruns must reconcile only the previously imported ids for that surface
- import bookkeeping must be per surface, not one opaque global blob
- a corrupt source must not be treated as an empty source delete
- settings import should not synthesize absent defaults into destructive resets

## Observability Notes

- first-run scan must be able to return a report without writing
- explicit import must emit or expose a durable run summary
- skipped IndexedDB stores and unsupported notes must have explicit reason strings
- if build needs cross-component progress broadcast, it should add a typed event in `@repo/core`; otherwise local provider state is enough
