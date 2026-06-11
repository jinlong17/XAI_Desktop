# desktop-local-first-backup-export-import - API

## Scope

This row defines backup/export/import and restore-verification contracts for representative desktop local-first data. It does not redefine storage selection, browser migration, offline queue semantics, reconnect replay, or cloud backup.

## Upstream Interfaces

| Surface | Role |
|---|---|
| `docs/adr/0012-phase3-local-first-storage.md` | live-path ownership, backup/live separation, and repo-validated restore authority |
| `packages/core-data/src/types.ts` | `Repo<T>`, `RepoRecord`, transaction, and metadata seams |
| `packages/core-data/src/entities.ts` | canonical representative entity families already shipped in the bridge |
| `packages/core-data/src/sync-outbox.ts` | authoritative `sync.outbox` audit/queue contract that must not be blindly restored |
| `packages/core-data/src/desktop-web-import.ts` | authoritative import-ledger/run record families that must not be blindly restored |
| `packages/plugin-web-storage/src/internal/desktopRepoBridge.ts` | shipped desktop bridge namespace and canonical record ownership |

## Downstream Consumers

| Consumer | Expected use |
|---|---|
| minimal desktop support/debug UI | trigger managed backup, explicit export/import, and inspect last verification result |
| `apps/web/src/providers/AppProviders.tsx` | thin desktop-only runtime exposure if needed |
| `desktop-phase3-integrated-rc-gate` | verify export/import/restore behavior and failure semantics |

## Contract Assumptions

### Restorable data surface

Restorable records are limited to representative canonical record families already owned by the shipped desktop bridge/runtime:

- `productivity.todo`
- `productivity.habit`
- `project.board`
- `project.card`
- `productivity.pomodoro_sessions`
- `project.workspace_state`
- `pet.state`
- `settings.pref`
- `calendar.provider_state`

### Excluded or audit-only data

These records may be summarized in the artifact, but row `#17` must not blindly restore them into live state:

- `sync.outbox`
- `desktop.web_import_ledger`
- `desktop.web_import_run`

If excluded state is present, verification/import must surface that as explicit partial semantics.

## Bundle Shape Assumptions

Planning contract only; build may refine names:

```ts
interface DesktopBackupBundleManifest {
  bundleVersion: 1;
  createdAt: string;
  sourceApp: "desktop-phase1-offline";
  bridgeNamespace: "xai-web-desktop-local-first-bridge";
  restorableEntityTypes: string[];
  excludedEntityTypes: string[];
  warnings: string[];
  restorableRecordCount: number;
  excludedRecordCount: number;
  restorableFingerprint: string;
}

interface DesktopBackupBundle {
  manifest: DesktopBackupBundleManifest;
  restorableRecords: RepoRecord[];
  audit?: {
    excludedQueueCount?: number;
    excludedImportLedgerCount?: number;
    excludedMutationIds?: string[];
  };
}
```

### Native command assumptions

Build may refine command names, but the behavior should stay aligned with three verbs:

- `create backup artifact`
  - default destination: managed app-data backup directory
  - optional destination path: explicit export
- `verify backup artifact`
  - no live mutation
  - returns bundle classification and restorable/excluded summaries
- `import backup artifact`
  - verify first
  - apply only supported/restorable records when explicitly requested
  - run post-apply verification and return final status

### Runtime bridge assumptions

If a desktop bridge helper is exposed from `@repo/plugin-web-storage`, keep it minimal and desktop-only:

```ts
interface DesktopBackupRuntime {
  createBackup(input?: { destinationPath?: string }): Promise<DesktopBackupReport>;
  verifyBackup(input: { path: string }): Promise<DesktopBackupReport>;
  importBackup(input: { path: string; apply?: boolean }): Promise<DesktopBackupReport>;
  getLastReport(): DesktopBackupReport | null;
}
```

## Error and Result Semantics

Recommended top-level statuses:

- `verified_full`
- `verified_partial`
- `restored`
- `restored_partial`
- `corrupt`
- `incompatible`
- `failed`

Recommended failure kinds:

| Kind | Meaning | Expected handling |
|---|---|---|
| `corrupt_bundle` | malformed JSON, checksum/fingerprint mismatch, or invalid record shape | fail before live mutation |
| `incompatible_bundle` | unsupported bundle version, schema/runtime mismatch, or disallowed entity family | fail before live mutation |
| `partial_restore` | excluded queue/import-ledger state was present or not safely restorable | return explicit warning/result, never fake full success |
| `repo_unavailable` | desktop repo seam or native command surface cannot open | fail visibly |
| `apply_failed` | live apply transaction failed | leave live state unchanged or rollback fully |
| `busy` | another backup/import/verify operation is active | fail fast without overlap |

## Permission and Boundary Notes

- Filesystem access stays host-owned in Tauri commands.
- Business packages must not import `@tauri-apps/api` directly.
- Browser runtime remains browser-only and should not expose active backup/import commands.
- Restore must not swap the live DB file directly and must not reintroduce stale `sync.outbox` rows as if they were current live queue state.

## Idempotency Notes

- Re-verifying the same artifact should yield the same classification for the same runtime rules.
- Re-importing an unchanged artifact into an already-matching live repo should be a no-op or an equivalent verified result, not duplicate records.
- Applying a partial-only artifact must remain deterministic: supported records restore, excluded records stay excluded, and warnings remain explicit.
