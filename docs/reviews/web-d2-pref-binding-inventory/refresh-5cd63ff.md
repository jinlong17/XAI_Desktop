# Direct preference binding refresh at `5cd63ff`

Luna-role read-only inventory (CP-LUNA-02, batch 33), generated on 2026-10-04
from the immutable product revision
`5cd63ff652f02a2c726187fe12cbc796218d31c0`. The revision was requested as
`5cd63ff` and resolved with `git rev-parse 5cd63ff^{commit}`; the resolved value
is the `revision` field of the evidence file. Same TypeScript AST scanner
([scan.mjs](scan.mjs), unchanged since the commit that introduced it) and
tracked `packages/**/*.tsx` boundary as `f359be6`; tests excluded. Every file was
read from the fixed Git revision with `git show 5cd63ff:<path>`, not from a
dirty workspace. Runtime: Node v24.16.0 with `typescript` 5.9.2, the version
pinned in the root `package.json` and `pnpm-lock.yaml`.

Command: `node docs/reviews/web-d2-pref-binding-inventory/scan.mjs 5cd63ff`
(run once; exit status 0; no diagnostic attempt was needed).

The machine evidence is [bindings-5cd63ff.json](bindings-5cd63ff.json), 13111
bytes, SHA-256
`694a93966ab6c76a0ef8ea07dea41165cea801e4c071b513b3e9513e8e898e2f`. The
comparison baseline is [bindings-f359be6.json](bindings-f359be6.json) with its
summary [refresh-f359be6.md](refresh-f359be6.md).

Counts: 24 files / 51 binding sites / 30 distinct literal keys / 1 dynamic
site / 31 setter bindings (28 direct, 3 downstream-only) / 20 read-only
bindings.

## Counts and delta

| AST inventory field | `f359be6` | `5cd63ff` | delta |
| --- | ---: | ---: | ---: |
| Source files with a binding | 25 | 24 | -1 |
| Binding sites | 52 | 51 | -1 |
| Distinct literal keys | 30 | 30 | 0 |
| Dynamic binding sites | 2 | 1 | -1 |
| Bindings exposing a setter | 32 | 31 | -1 |
| Setter bindings with a direct in-file call | 29 | 28 | -1 |
| Setter bindings with downstream-only references | 3 | 3 | 0 |
| Read-only hook bindings | 20 | 20 | 0 |

Delta from `f359be6`: exactly one row removed, in `FeaturesPane.tsx`; no
additions, no other removed rows, no changed rows. The removed row is a
dynamic-key setter binding with one direct in-file call and one syntactic
reference, so the dynamic-site, setter and direct-call counts fall by one each.
It was the only row in its file, so the row-bearing file count and the binding
count also fall by one. The literal-key, downstream-only and read-only counts do
not move, because the removed row has no literal key, is not downstream-only and
exposes a setter. Rows were compared on file + key + setter, not on line
numbers.

### `packages/xai-web-settings-features-panel/src/FeaturesPane.tsx` (1 row removed)

| Removed key | Removed setter | Key kind | `f359be6` line | Direct calls | Syntactic references |
| --- | --- | --- | ---: | ---: | ---: |
| `prefKey` | `setOn` | dynamic | 69 | 1 | 1 |

Source commit: `5cd63ff` (`fix(settings): recover Features toggles and resets`),
the only commit in `f359be6..5cd63ff` that touches `apps` or `packages`, and the
only commit in that window that touches this file. At `f359be6` line 69 reads
`const [on, setOn] = usePref(prefKey) as readonly [...]` inside `FeatureCard`.
At `5cd63ff` the file contains no `usePref` text at all (eight lines mention it
at `f359be6`: the import, doc comments and the call) and no
`@repo/plugin-web-storage` import. The same commit adds
`src/internal/featuresRecovery.ts`, which `FeaturesPane.tsx` imports as
`useFeaturesRecovery`. That new file is `.ts`, outside the scanner's `.tsx`
boundary, and it calls `usePrefAutosaveAsync` (a different identifier from
`usePref`) for the eight `xai_pref_features_*` keys at lines 102-109. The
scanner records none of this, and this refresh makes no statement about how
those keys are now read or written.

The file still exists at `5cd63ff`; it no longer contains a direct `usePref`
call, which is why the row-bearing file count falls by one. The removed row had
no literal key, so the literal-key set is unchanged.

## Reconciliation checks

- The stored `counts` in both JSON files equal the counts recomputed from their
  own `rows`. The `boundary` string and the row field names are identical in the
  two files, and neither file contains two rows with the same file + key +
  setter.
- Of the 52 rows at `f359be6`, 51 match a row at `5cd63ff` on file + key +
  setter; those 51 are also identical in every other scanner field (line number,
  literal flag, direct-call count, syntactic-reference count) and keep their
  relative order. The remaining row is the one removed above, and no row at
  `5cd63ff` lacks a counterpart at `f359be6`.
- All 24 row-bearing files at `5cd63ff` are byte-identical between `f359be6` and
  `5cd63ff` (`git diff --quiet f359be6 5cd63ff -- <file>` succeeds for each).
  `FeaturesPane.tsx` is the only one of the 25 row-bearing files at `f359be6`
  that differs.
- The window `f359be6..5cd63ff` has 29 commits and `f359be6` is an ancestor of
  `5cd63ff`. `git diff --name-only f359be6 5cd63ff -- apps packages` lists
  eleven paths, all under `packages/xai-web-settings-features-panel/` and none
  under `apps/`. Only two scanner-eligible files (`packages/**/*.tsx`, excluding
  `__tests__`) changed in it, both in `5cd63ff`: `src/FeaturesPane.tsx` and
  `src/internal/featuresPane.tsx`. The latter has no `usePref(` text at either
  revision, so it contributes no row to either side. The other `.tsx` paths
  touched there are under `__tests__` and are excluded by the scanner. The
  scanner-eligible file set is identical at both revisions (314 files); no
  eligible file was added, renamed or deleted.
- Unchanged at both revisions: the remaining dynamic row (`prefKey` at
  `packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx` line
  43, read-only, no setter, in a file that is byte-identical between the two
  revisions), the three downstream-only setter bindings (`setRawWorkspaces` in
  `BoardWorkspacesModule.tsx`, `rawSetOrder` in `DashboardModule.tsx`, `setPetId`
  in `DesktopPet.tsx`), all twenty read-only rows, and the set of 30 distinct
  literal keys.
- A textual `diff` of the two JSON files shows only the six header lines
  (`revision` and five count fields: `files`, `bindings`, `dynamicSites`,
  `setterBindings`, `directlyInvokedSetters`) changed plus nine deleted lines,
  which is one row at nine lines; the one deleted `"file"` line names
  `FeaturesPane.tsx`.

## Boundary and limits

This tracks direct legacy `usePref` bindings only: tracked `packages/**/*.tsx`,
excluding `__tests__`, direct identifier calls named `usePref`, and syntactic
setter references. It excludes wrapper, indirect, raw, ordinary
(`setPref`/`removePref`), timer, secret and non-TSX writers, other stores, and
side-effect consumers, and it is neither a full writer count nor a defect count.
In particular the scanner does not see `useFeaturePrefs.ts` (a `.ts` file under
`packages/xai-web-settings-features-panel/src/`, which at `5cd63ff` contains
direct `usePref("xai_pref_features_*")` calls at lines 18-25) or CmdK `getPref`
reads (`packages/xai-web-cmdk`), and it does not see `.ts` hooks such as
`featuresRecovery.ts`. A read-only hook row does not prove its containing file
has no writers, and a setter row does not prove storage ownership, awaited
success/refusal behavior, recovery semantics, or product correctness; likewise a
row's disappearance does not say how the file now reads or writes the key. It
accepts nothing, including the Features caller, and closes no D2, REL, full312
or other 312 item; independent requirement evidence owns acceptance. This
refresh selects no caller, orders no work and makes no risk or defect judgement;
the JSON rows are inventory input that a later scheduling step may read.
