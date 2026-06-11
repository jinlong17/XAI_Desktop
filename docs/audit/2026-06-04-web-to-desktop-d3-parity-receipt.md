# Web -> Desktop D3 Parity Receipt - 2026-06-04

## Verdict

**CONDITIONAL_GO** for incremental Web -> Desktop synchronization.

The current desktop product is not a second business-logic rewrite. It is the
`apps/web` runtime mounted inside the Tauri desktop host, with desktop-only
repository, import, reconnect, backup, and native capability adapters attached
at runtime.

This receipt confirms the current D3 boundary is still an incremental contract:
new Web work should extend the relevant shared package and then add only the
desktop bridge/import/adapter delta required for that surface. It should not
rebuild the Mac desktop app from scratch unless a new ADR explicitly replaces
ADR-0011 / ADR-0012.

## Scope

- Asked workflow: "Web -> Desktop D3 parity receipt".
- Requested skill/SKU: `xai-web-to-desktop-sync`.
- Repo reality at execution time: no tracked `xai-web-to-desktop-sync` skill or agent exists in
  `.codex/skills`, `.teams/skills`, `.agents/skills`, or `.codex/agents`.
- Execution mode used here: inline audit receipt against the existing Workflow
  V2 desktop rows and runtime code.

Postscript: the missing skill was later confirmed to exist on `origin/web` and
was synced into the current `dev` working tree on 2026-06-04. The receipt above
records the execution-time fallback condition.

## D3 Authority

ADR-0012 D3 defines browser data as a Desktop import source, not the Desktop
live store. The import must remain idempotent, observable, retryable, and
default non-destructive. It explicitly does not authorize background bidirectional
sync between browser local storage and the Desktop live DB.

Implication: parity is not "copy every Web localStorage key into SQLite". Parity
is an allowlisted, auditable set of shared contracts plus explicit deferrals.

## Current Runtime Receipt

### Desktop host mounting

`apps/web/src/providers/AppProviders.tsx` is the active desktop mounting point.
It gates desktop behavior on `isDesktopHostRuntime`, mounts the local-first
repository bridge, and exposes desktop-only handles:

- `__XAI_DESKTOP_WEB_IMPORT__`
- `__XAI_DESKTOP_RECONNECT_SYNC__`
- `__XAI_DESKTOP_BACKUP__`

This confirms Desktop synchronization is attached to the Web runtime rather than
implemented as a separate duplicate UI stack.

### D3 import allowlist

`@repo/core-data` currently allowlists these import surfaces:

- `tasks`
- `habits`
- `pomodoro`
- `boards`
- `board-workspace`
- `pet`
- `settings`

`@repo/plugin-web-storage` maps those surfaces to known browser storage keys and
reconciles them into the desktop repository through deterministic fingerprints
and import ledger rows.

### Desktop live bridge allowlist

The desktop bridge currently writes supported live surfaces only:

- canonical tasks from `xai_task_cols`
- canonical habits from `xai_habits_state`
- pomodoro sessions from `xai_pomodoro_sessions`
- canonical boards/cards from `xai_boards_v2`
- board auxiliary state from `xai_active_board`, `xai_board_panels`,
  `xai_board_inbox`, `xai_board_view_by_id`
- pet state from `xai_pet_id`, `xai_pet_pos`
- settings records in the `xai_pref_*` family
- calendar provider state through the row #16 provider-state API

This matches the incremental desktop roadmap shape: active surfaces are bridged;
unsupported or future module surfaces are not silently promoted into the desktop
live DB.

## Explicit Non-Parity / Deferred Surfaces

The following Web keys exist in the registry but are not currently D3 import/live
repo surfaces unless a future row explicitly promotes them:

- dashboard/widget keys such as `xai_dash_order`, `xai_clock_style`,
  `xai_clock_tz`, `xai_zones`
- AI conversation/runtime UI keys such as `xai_ai_convos`, `xai_ai_insights`,
  `xai_ai_voice`, and provider/model preferences
- `xai_matrix_state`
- `xai_meditation_prefs`
- `xai_calendar_view`
- shell/appearance keys such as `xai_accent_hue`, `xai_rail_pos`,
  `xai_bg_tone`, `xai_rail_order`

These are not automatic blockers for the Mac desktop. They are explicit
incremental follow-up candidates. Promoting any of them should be a small
Web -> Desktop delta row with a clear owner, bridge/import semantics, tests, and
manual macOS residuals if interaction is required.

## Verification Run

Commands executed in this receipt:

```bash
pnpm --filter @repo/plugin-web-storage check-types
pnpm --filter @repo/plugin-web-storage test -- --run desktopWebDataMigration.import.test.ts desktopWebDataMigration.scan.test.ts desktopRepoBridge.test.ts
```

Result:

- `@repo/plugin-web-storage` typecheck: PASS
- D3 import/bridge focused tests: PASS, 3 files / 11 tests

No desktop implementation code was changed in this receipt.

## Incremental Rule For Future Web -> Desktop Work

When Web adds or materially changes a persisted surface:

1. Decide whether the surface is browser-only, desktop-live, import-only, backup
   relevant, reconnect relevant, or native-adapter relevant.
2. If desktop-live, extend the bridge at `@repo/plugin-web-storage` or the
   package-owned desktop adapter. Do not fork business logic into `apps/desktop`.
3. If first-run browser data matters, extend `DESKTOP_WEB_IMPORT_SURFACES` and
   add fingerprint/idempotency/corrupt-source tests.
4. If backup/restore matters, ensure the data is represented in the desktop repo
   before relying on `desktopBackup`.
5. If the surface remains browser-only, record that as an explicit deferral in
   the relevant feature docs or receipt.
6. Re-run focused package tests first, then `@repo/web` gates and a desktop Tauri
   build only when the touched code crosses host/runtime boundaries.

## Operator Answer

Yes: after Web is mostly built, Desktop development should be incremental.

The existing architecture already encodes this:

- ADR-0011: Desktop is React Web UI + Tauri + local-first, not full native rewrite.
- ADR-0012: Desktop owns SQLite/live DB; Web remains browser-storage owner.
- Roadmap rows #10-#18 shipped the desktop data stack as layered increments.
- Current runtime mounts desktop bridges into the Web app rather than duplicating
  Web business modules.

The correct next pattern is "receipt -> delta row -> verify", not "rebuild
desktop from zero".
