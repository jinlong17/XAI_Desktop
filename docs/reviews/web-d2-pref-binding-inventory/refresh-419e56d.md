# Direct preference binding refresh at `419e56d`

Luna-role read-only inventory (CP-LUNA-03, batch 53), generated on 2026-10-05
from the immutable product revision
`419e56de9f23e4467fea806fbd4a990e1f429941`. The revision was requested as
`419e56d` and resolved with `git rev-parse 419e56d^{commit}`; the resolved value
is the `revision` field of the evidence file. Same TypeScript AST scanner
([scan.mjs](scan.mjs), unchanged since the commit that introduced it) and
tracked `packages/**/*.tsx` boundary as `5cd63ff`; tests excluded. Every file was
read from the fixed Git revision with `git show 419e56d:<path>`, not from a
dirty workspace. Runtime: Node v24.16.0 with `typescript` 5.9.2, the version
pinned in the root `package.json` and `pnpm-lock.yaml`. The worktree has no
`node_modules` of its own; `typescript` resolved read-only from the main
checkout's `node_modules` by ancestor lookup (the CP-LUNA-02 precedent). Nothing
was installed, and no file in the main checkout's working tree was modified.

Command: `node docs/reviews/web-d2-pref-binding-inventory/scan.mjs 419e56d`
(run once; exit status 0; no diagnostic attempt was needed).

The machine evidence is [bindings-419e56d.json](bindings-419e56d.json), 12399
bytes, SHA-256
`cd5c349060432fc86b302bac87c74a1694c806f8e39166023859477e57214f29`. The
comparison baseline is [bindings-5cd63ff.json](bindings-5cd63ff.json) with its
summary [refresh-5cd63ff.md](refresh-5cd63ff.md).

Counts: 23 files / 48 binding sites / 27 distinct literal keys / 1 dynamic
site / 31 setter bindings (28 direct, 3 downstream-only) / 17 read-only
bindings.

## Counts and delta

| AST inventory field | `5cd63ff` | `419e56d` | delta | Controller prediction |
| --- | ---: | ---: | ---: | ---: |
| Source files with a binding | 24 | 23 | -1 | 23 |
| Binding sites | 51 | 48 | -3 | 48 |
| Distinct literal keys | 30 | 27 | -3 | 27 |
| Dynamic binding sites | 1 | 1 | 0 | 1 |
| Bindings exposing a setter | 31 | 31 | 0 | 31 |
| Setter bindings with a direct in-file call | 28 | 28 | 0 | 28 |
| Setter bindings with downstream-only references | 3 | 3 | 0 | 3 |
| Read-only hook bindings | 20 | 17 | -3 | 17 |

The controller prediction recorded on the CP-LUNA-03 task card was treated as a
claim to verify, not as a target. All eight fields equal the scanner output, so
there is no difference to explain.

Delta from `5cd63ff`: exactly three rows removed, all in `AppearancePane.tsx`;
no additions, no other removed rows, no changed rows. The three removed rows
are read-only literal-key bindings (no setter), so the binding-site and
read-only counts fall by three each, while the dynamic-site, setter,
direct-call and downstream-only counts do not move. They were the only rows in
their file, so the row-bearing file count falls by one. None of the three keys
appears in any other row at `419e56d`, so the distinct literal-key count falls
by three. Rows were compared on file + key + setter, not on line numbers.

### `packages/xai-web-settings-appearance/src/AppearancePane.tsx` (3 rows removed)

| Removed key | Setter | Key kind | `5cd63ff` line | Direct calls | Syntactic references |
| --- | --- | --- | ---: | ---: | ---: |
| `xai_accent_hue` | none | literal | 52 | 0 | 0 |
| `xai_rail_pos` | none | literal | 53 | 0 | 0 |
| `xai_bg_tone` | none | literal | 55 | 0 | 0 |

Source commit: `24073b5`, subject
`fix(settings): recover Appearance preferences with Retry all`. It is the only
commit in `5cd63ff..419e56d` that touches this file. At `5cd63ff` each removed
row is a one-element array pattern over a cast `usePref` call, so there is no
setter:

- line 52: `const [accentHue] = usePref("xai_accent_hue") as readonly [...]`
- line 53: `const [railPosRaw] = usePref("xai_rail_pos") as readonly [...]`
- line 55: `const [bgToneRaw] = usePref("xai_bg_tone") as readonly [...]`

At `419e56d` the file contains no `usePref` text at all (six lines mention it at
`5cd63ff`: the header comment at line 8, the import at line 36, the comment at
line 51 and the three calls above) and no `@repo/plugin-web-storage`, `setPref`
or `removePref` text. It now imports `useAppearanceController` from
`./internal/appearanceController.js` (line 36) and calls it at line 55. The file
still exists at `419e56d`; it no longer contains a direct `usePref` call, which
is why the row-bearing file count falls by one.

### Changed files that produced no rows

The window adds four files under `src/internal/` in
`packages/xai-web-settings-appearance`: three `.tsx` files, which enter the
scanner's eligible set, and `appearanceRecoveryCopy.ts`, a `.ts` file outside
the boundary. The task card describes the new internal files as `.tsx`; three of
the four are. Together with the two changed shell files, the five eligible
files other than `AppearancePane.tsx` add no rows:

| File | Change | Source commit | Whole-word `usePref` text | Rows added |
| --- | --- | --- | --- | ---: |
| `packages/xai-web-settings-appearance/src/internal/AppearanceActions.tsx` | new | `24073b5` | none | 0 |
| `packages/xai-web-settings-appearance/src/internal/AppearanceStatus.tsx` | new | `24073b5` | none | 0 |
| `packages/xai-web-settings-appearance/src/internal/appearanceController.tsx` | new | `24073b5` | none (see below) | 0 |
| `packages/xai-web-shell/src/Shell.tsx` | modified | `24073b5` | none at either revision | 0 |
| `packages/xai-web-shell/src/Topbar.tsx` | modified | `24073b5` | none at either revision | 0 |

`appearanceController.tsx` imports `usePrefAutosaveAsync` from
`@repo/plugin-web-storage` (line 33) and calls it seven times, at lines 514-517
and 519-521, for `lang`, `theme`, `density`, `xai_accent_hue`, `xai_bg_tone`,
`xai_rail_pos` and `font_scale` (line 518 is a comment). That is a different
identifier from `usePref`, so the scanner records none of it, and this refresh
makes no statement about how those keys are now read or written. The only
`xai-web-shell` row at either revision is `AppRail.tsx` line 37
(`xai_rail_order`, setter `setPrefOrder`, one direct call, one syntactic
reference), in a file that is byte-identical between the two revisions.

## Package distribution

| Package directory (under `packages/`) | Files at `419e56d` | Bindings at `5cd63ff` | Bindings at `419e56d` | delta |
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
| `xai-web-shell` | 1 | 1 | 1 | 0 |
| `xai-web-tasks` | 1 | 1 | 1 | 0 |
| `xai-web-settings-appearance` | 0 | 3 | 0 | -3 |
| Total | 23 | 51 | 48 | -3 |

The package names in the control plane drop the `xai-web-` or `plugin-web-`
prefix (for example `settings-rest` is `plugin-web-settings-rest`).

## Reconciliation checks

- The stored `counts` in both JSON files equal the counts recomputed from their
  own `rows`. The `boundary` string and the row field names are identical in the
  two files, and neither file contains two rows with the same file + key +
  setter.
- Of the 51 rows at `5cd63ff`, 48 match a row at `419e56d` on file + key +
  setter; those 48 are also identical in every other scanner field (line
  number, literal flag, direct-call count, syntactic-reference count) and keep
  their relative order. The remaining three rows are the ones removed above, and
  no row at `419e56d` lacks a counterpart at `5cd63ff`.
- All 23 row-bearing files at `419e56d` are byte-identical between `5cd63ff` and
  `419e56d` (the blob object IDs from `git rev-parse <revision>:<path>` are
  equal for each, and none of them is among the 26 changed paths below).
  `AppearancePane.tsx` is the only one of the 24 row-bearing files at `5cd63ff`
  whose content differs (blob `5b3de2c` to `18bb9c8`).
- The window `5cd63ff..419e56d` has 52 commits and `5cd63ff` is an ancestor of
  `419e56d`. `git diff --name-only 5cd63ff 419e56d -- apps packages` lists 26
  paths: two under `apps/web/src/` (`App.tsx` and
  `__tests__/App.appearance.test.tsx`), nineteen under
  `packages/xai-web-settings-appearance/` and five under
  `packages/xai-web-shell/`; this is the Appearance-caller set. Three non-merge
  commits touch those paths and no merge commit does: `24073b5` (24 paths,
  including all six scanner-eligible ones below), `5bbf473` (a new
  `AppearancePane.focus-ring.test.tsx` and `styles.css`) and `419e56d` (a new
  `AppearancePane.selected-focus.test.tsx` and `styles.css`).
- Of those 26 paths, six are scanner-eligible (`packages/**/*.tsx`, excluding
  `__tests__`): `AppearancePane.tsx`, `Shell.tsx` and `Topbar.tsx` (modified)
  and `internal/AppearanceActions.tsx`, `internal/AppearanceStatus.tsx` and
  `internal/appearanceController.tsx` (new). The other twenty are the two
  `apps/` files, nine `.tsx` test files under `__tests__`, five `.ts` files
  (`index.ts`, `types.ts`, `internal/appearanceRecoveryCopy.ts`,
  `__tests__/appearanceLockFixture.ts` and the shell `types.ts`), three `.md`
  files and `styles.css`.
- The scanner-eligible file set grows from 314 files at `5cd63ff` to 317 at
  `419e56d`; the three additions are the three new `internal/*.tsx` files, and
  no eligible file was removed or renamed.
- Unchanged at both revisions: the remaining dynamic row (`prefKey` at
  `packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx` line
  43, read-only, no setter), the three downstream-only setter bindings
  (`setRawWorkspaces` in `BoardWorkspacesModule.tsx`, `rawSetOrder` in
  `DashboardModule.tsx`, `setPetId` in `DesktopPet.tsx`), the seventeen
  remaining read-only rows (the twenty at `5cd63ff` minus the three removed),
  and the 27 distinct literal keys (the thirty at `5cd63ff` minus
  `xai_accent_hue`, `xai_rail_pos` and `xai_bg_tone`).
- A textual `diff` of the two JSON files shows only five changed header lines
  (`revision` and the four count fields `files`, `bindings`, `literalKeys`,
  `readOnlyBindings`) plus 27 deleted lines, which is three rows at nine lines
  each; no line is inserted. The deleted `"file"` lines all name
  `AppearancePane.tsx`.
- Text cross-check at `419e56d`: across the 317 eligible files the standalone
  word `usePref` appears only in the 23 row-bearing files and in two files that
  mention it in comments only (`packages/plugin-web-ai-chat/src/AiChatModule.tsx`
  lines 7 and 107, and `packages/xai-web-matrix/src/MatrixModule.tsx` line 5);
  neither of those two is among the 26 changed paths.

## Boundary and limits

This tracks direct legacy `usePref` bindings only: tracked `packages/**/*.tsx`,
excluding `__tests__`, direct identifier calls named `usePref`, and syntactic
setter references. It excludes wrapper, indirect, raw, ordinary
(`setPref`/`removePref`), timer, secret and non-TSX writers, other stores, and
side-effect consumers, and it is neither a full writer count nor a defect count.
In particular the scanner does not see:

- `.ts` files. For example `useFeaturePrefs.ts` (under
  `packages/xai-web-settings-features-panel/src/`) contains direct
  `usePref("xai_pref_features_*")` calls at lines 18-25 at `419e56d`.
- Anything under `apps/`. `apps/web/src/App.tsx` contains three whole-word
  `usePref` calls at `5cd63ff` (lines 135-137, for `xai_accent_hue`,
  `xai_rail_pos` and `xai_bg_tone`) and no whole-word `usePref` text at
  `419e56d`. The file was outside the boundary at both revisions, so those lines
  appear in neither JSON file.
- Indirect readers such as `getPref`, for example in `packages/xai-web-cmdk`
  (`src/CommandPalette.tsx` lines 29 and 204, and calls between lines 29 and 55
  of `src/internal/readModuleStates.ts`).
- Other binding identifiers. The Appearance controller binds through
  `usePrefAutosaveAsync` (`appearanceController.tsx` lines 33 and 514-521),
  which the scanner does not count.

A read-only hook row does not prove its containing file has no writers, and a
setter row does not prove storage ownership, awaited success/refusal behavior,
recovery semantics, or product correctness; likewise a row's disappearance does
not say how the file now reads or writes the key. This refresh accepts nothing,
including the Appearance caller, and closes no D2, REL, full312 or other 312
item; independent requirement evidence owns acceptance. It selects no caller,
orders no work and makes no risk or defect judgement; the JSON rows are
inventory input that a later scheduling step may read.
