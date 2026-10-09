# Direct preference binding refresh at `f9eb4b1`

Luna-role read-only inventory (CP-LUNA-04, batch 66), generated on 2026-10-09
from the immutable product revision
`f9eb4b1f207bc4b46f547b90afc250424b3c8695`. The revision was requested as
`f9eb4b1` and resolved with `git rev-parse f9eb4b1^{commit}`; the resolved value
is the `revision` field of the evidence file. Same TypeScript AST scanner
([scan.mjs](scan.mjs), unchanged) and tracked `packages/**/*.tsx` boundary as
`419e56d`; tests excluded. Every file was read from the fixed Git revision with
`git show f9eb4b1:<path>`, not from a dirty workspace. Runtime: Node v24.16.0
with `typescript` resolved read-only from the main checkout's `node_modules` by
ancestor lookup (the CP-LUNA-02 and CP-LUNA-03 precedent; the worktree sits under
the main checkout directory and has no `node_modules` of its own). Nothing was
installed, and no file in the main checkout's working tree was modified.

Command: `node docs/reviews/web-d2-pref-binding-inventory/scan.mjs f9eb4b1`
(run once; exit status 0; no diagnostic attempt was needed).

The machine evidence is [bindings-f9eb4b1.json](bindings-f9eb4b1.json), 12171
bytes, SHA-256
`5ef90bd3fdacd56176cf1a34bbfcca9e136d5cc0db8b44050b21fc4d24f9132b`. The
comparison baseline is [bindings-419e56d.json](bindings-419e56d.json) (SHA-256
`cd5c349060432fc86b302bac87c74a1694c806f8e39166023859477e57214f29`) with its
summary [refresh-419e56d.md](refresh-419e56d.md).

Counts: 22 files / 47 binding sites / 26 distinct literal keys / 1 dynamic
site / 30 setter bindings (27 direct, 3 downstream-only) / 17 read-only
bindings.

## Counts and delta

| AST inventory field | `419e56d` | `f9eb4b1` | delta | Controller prediction |
| --- | ---: | ---: | ---: | ---: |
| Source files with a binding | 23 | 22 | -1 | 22 |
| Binding sites | 48 | 47 | -1 | 47 |
| Distinct literal keys | 27 | 26 | -1 | 26 |
| Dynamic binding sites | 1 | 1 | 0 | 1 |
| Bindings exposing a setter | 31 | 30 | -1 | 30 |
| Setter bindings with a direct in-file call | 28 | 27 | -1 | 27 |
| Setter bindings with downstream-only references | 3 | 3 | 0 | 3 |
| Read-only hook bindings | 17 | 17 | 0 | 17 |

The controller prediction recorded on the CP-LUNA-04 task card was treated as a
claim to verify, not as a target. All eight fields equal the scanner output, so
there is no difference to explain.

Delta from `419e56d`: exactly one row removed, no additions, no changed rows.
Rows were compared on file + key + setter, and then every other scanner field
(line, literal flag, direct calls, syntactic references).

### Removed row (1)

| File | Key | Setter | Key kind | `419e56d` line | Direct calls | Syntactic references |
| --- | --- | --- | --- | ---: | ---: | ---: |
| `packages/xai-web-shell/src/AppRail.tsx` | `xai_rail_order` | `setPrefOrder` | literal | 37 | 1 | 1 |

It was the only row in `AppRail.tsx` and the only `xai-web-shell` row, so the
row-bearing file count falls by one. It is a literal-key setter binding with one
direct call, so the binding-site, distinct-literal-key, setter-binding and
direct-call counts each fall by one; the dynamic, downstream-only and read-only
counts do not move. The key `xai_rail_order` appears in no other row at either
revision, so the distinct-literal-key count falls by one.

Source commit: `f9eb4b1`, subject
`fix(shell): recover AppRail order with protected drafts`. It is the only
non-merge commit in `419e56d..f9eb4b1` that touches `apps` or `packages`, and no
merge commit does. At `419e56d` the file had whole-word `usePref` text at lines
6 (header comment), 13 (import from `@repo/plugin-web-storage`) and 37
(`const [prefOrder, setPrefOrder] = usePref("xai_rail_order");`), plus the one
direct call `setPrefOrder(nextOrder as typeof prefOrder)` at line 89. At
`f9eb4b1` the file contains no whole-word `usePref` text and no
`usePrefAutosaveAsync` text; it imports `RailOrderControllerContext` and
`useRailOrderController` from `./internal/railOrderController.js` (line 29) and
calls `useRailOrderController({ lang })` at line 54. The file still exists; it
no longer contains a direct `usePref` call, which is why the row-bearing file
count falls by one.

### Changed and new files that produced no rows

`git diff --name-status 419e56d f9eb4b1 -- apps packages` lists 19 paths: two
under `apps/web/src/` and seventeen under `packages/xai-web-shell/`. The window
`419e56d..f9eb4b1` has 22 commits and `419e56d` is an ancestor of `f9eb4b1`.
Of the 19 paths, five are scanner-eligible (`packages/**/*.tsx`, excluding
`__tests__`); the host entry `App.tsx` is listed alongside them:

| File | Change | Whole-word `usePref` at `f9eb4b1` | `usePrefAutosaveAsync` at `f9eb4b1` | Rows added |
| --- | --- | --- | --- | ---: |
| `packages/xai-web-shell/src/internal/railOrderController.tsx` | new | none | lines 27 (import) and 276 (one call) | 0 |
| `packages/xai-web-shell/src/internal/RailOrderStatus.tsx` | new | none | none | 0 |
| `packages/xai-web-shell/src/Shell.tsx` | modified | none (none at `419e56d`) | none | 0 |
| `packages/xai-web-shell/src/Topbar.tsx` | modified | none (none at `419e56d`) | none | 0 |
| `packages/xai-web-shell/src/AppRail.tsx` | modified | none (lines 6, 13, 37 at `419e56d`) | none | -1 (the removed row) |
| `apps/web/src/App.tsx` | modified, outside scanner boundary | none (none at `419e56d`) | none | not scanned |

`railOrderController.tsx` imports `usePrefAutosaveAsync` from
`@repo/plugin-web-storage` (line 27) and calls it once, at line 276:
`usePrefAutosaveAsync("xai_rail_order", RAIL_ORDER_BINDING)`. That is a different
identifier from `usePref`, so the scanner records nothing for it, which matches
the expectation on the task card. This refresh makes no statement about how the
key is now read or written. `RailOrderStatus.tsx` contains neither identifier.
`App.tsx` is under `apps/`, outside the scanner boundary at both revisions.

The other fourteen changed paths are `App.tsx` (above, outside the boundary)
and thirteen that are not scanner-eligible: eight non-test files under
`packages/xai-web-shell/` (`docs/api.md`, `docs/test.md`, `src/index.ts`,
`src/types.ts`, `src/internal/railOrderCopy.ts`, `src/internal/railOrderModel.ts`,
`src/railOrderStatus.css` and `src/__tests__/railOrderModel.test.ts`), and five
`.tsx` files that are excluded as tests or fixtures (`Topbar.test.tsx`,
`AppRail.railorder.test.tsx`, `RailOrderStatus.test.tsx` and `railOrderFixture.tsx`
under the shell `__tests__`, and `apps/web/src/__tests__/App.railorder.test.tsx`).
Counted by path: 5 scanner-eligible + `App.tsx` + 13 other = 19.

## Package distribution

| Package directory (under `packages/`) | Files at `f9eb4b1` | Bindings at `419e56d` | Bindings at `f9eb4b1` | delta |
| --- | ---: | ---: | ---: | ---: |
| `xai-web-dashboard-widgets` | 9 | 11 | 11 | 0 |
| `plugin-web-settings-rest` | 3 | 10 | 10 | 0 |
| `plugin-web-board-workspaces` | 1 | 8 | 8 | 0 |
| `plugin-web-statistics` | 1 | 4 | 4 | 0 |
| `plugin-web-board-views` | 1 | 3 | 3 | 0 |
| `xai-web-calendar` | 1 | 3 | 3 | 0 |
| `plugin-web-board-core` | 1 | 2 | 2 | 0 |
| `xai-web-pet` | 1 | 2 | 2 | 0 |
| `plugin-web-pomodoro` | 1 | 1 | 1 | 0 |
| `xai-web-dashboard-grid` | 1 | 1 | 1 | 0 |
| `xai-web-settings-features-panel` | 1 | 1 | 1 | 0 |
| `xai-web-tasks` | 1 | 1 | 1 | 0 |
| `xai-web-shell` | 0 | 1 | 0 | -1 |
| Total | 22 | 48 | 47 | -1 |

The package names drop the `xai-web-` or `plugin-web-` prefix in the control
plane (for example `settings-rest` is `plugin-web-settings-rest`).

## Reconciliation checks

- The stored `counts` in both JSON files equal the counts recomputed from their
  own `rows`. The `boundary` string and the row field names are identical in the
  two files, and neither file contains two rows with the same file + key +
  setter.
- Of the 48 rows at `419e56d`, 47 match a row at `f9eb4b1` on file + key +
  setter and are identical in every other scanner field, keeping their relative
  order. The remaining row is the one removed above, and no row at `f9eb4b1`
  lacks a counterpart at `419e56d`.
- None of the 22 row-bearing files at `f9eb4b1` is among the 19 changed paths,
  so all 22 are byte-identical between `419e56d` and `f9eb4b1`.
  `AppRail.tsx` is the only one of the 23 row-bearing files at `419e56d` whose
  content differs.
- The scanner-eligible file set grows from 317 files at `419e56d` to 319 at
  `f9eb4b1`; the two additions are `internal/railOrderController.tsx` and
  `internal/RailOrderStatus.tsx`, and no eligible file was removed or renamed.
- Unchanged at both revisions: the remaining dynamic row (`prefKey` at
  `packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx`
  line 43, read-only, no setter), the three downstream-only setter bindings
  (`setRawWorkspaces` in `BoardWorkspacesModule.tsx`, `rawSetOrder` in
  `DashboardModule.tsx`, `setPetId` in `DesktopPet.tsx`) and the seventeen
  read-only rows.
- A textual `diff` of the two JSON files shows only six changed header lines
  (`revision` and the five count fields `files`, `bindings`, `literalKeys`,
  `setterBindings`, `directlyInvokedSetters`) plus nine deleted lines, which is
  the single removed row (nine lines per row); no line is inserted. The deleted `"file"` line names `AppRail.tsx`.
- Text cross-check: across the eligible files the standalone word `usePref`
  appears in 25 files at `419e56d` and 24 at `f9eb4b1`. At `f9eb4b1` those 24 are
  the 22 row-bearing files and the same two comment-only files as before
  (`packages/plugin-web-ai-chat/src/AiChatModule.tsx` and
  `packages/xai-web-matrix/src/MatrixModule.tsx`); neither is among the changed
  paths. The 25 at `419e56d` additionally include `AppRail.tsx`.

## Boundary and limits

This tracks direct legacy `usePref` bindings only: tracked `packages/**/*.tsx`,
excluding `__tests__`, direct identifier calls named `usePref`, and syntactic
setter references. It excludes wrapper, indirect, raw, ordinary
(`setPref`/`removePref`), timer, secret and non-TSX writers, other stores, and
side-effect consumers, and it is neither a full writer count nor a defect count.
In particular the scanner does not see:

- `.ts` files. For example `useFeaturePrefs.ts` (under
  `packages/xai-web-settings-features-panel/src/`) contains direct
  `usePref("xai_pref_features_*")` calls.
- Anything under `apps/`, including `apps/web/src/App.tsx`.
- Indirect readers such as `getPref`.
- Other binding identifiers. The AppRail order controller binds through
  `usePrefAutosaveAsync` (`internal/railOrderController.tsx` lines 27 and 276),
  and the Appearance controller does likewise; the scanner counts neither.

A read-only hook row does not prove its containing file has no writers, and a
setter row does not prove storage ownership, awaited success/refusal behavior,
recovery semantics, or product correctness; likewise a row's disappearance does
not say how the file now reads or writes the key. This refresh accepts nothing,
including the AppRail order caller, and closes no D2, REL, full312 or other 312
item; independent requirement evidence owns acceptance. It selects no caller,
orders no work and makes no risk or defect judgement; the JSON rows are
inventory input that a later scheduling step may read.
