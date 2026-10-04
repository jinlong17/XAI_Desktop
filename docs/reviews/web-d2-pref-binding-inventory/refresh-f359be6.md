# Direct preference binding refresh at `f359be6`

Luna-role read-only inventory (CP-LUNA-01, batch 20), generated on 2026-10-04
from the immutable product revision
`f359be6d838393e0f9e93efd80b88b5b09f6144e`. Same TypeScript AST scanner
([scan.mjs](scan.mjs)) and tracked `packages/**/*.tsx` boundary as `afbfb24`;
tests excluded. Every file was read from the fixed Git revision with
`git show f359be6:<path>`, not from a dirty workspace.

Command: `node docs/reviews/web-d2-pref-binding-inventory/scan.mjs f359be6`.

The machine evidence is [bindings-f359be6.json](bindings-f359be6.json); the
comparison baseline is [bindings-afbfb24.json](bindings-afbfb24.json) with its
summary [refresh-afbfb24.md](refresh-afbfb24.md).

Counts: 25 files / 52 binding sites / 30 distinct literal keys / 2 dynamic
sites / 32 setter bindings (29 direct, 3 downstream-only) / 20 read-only
bindings.

## Counts and delta

| AST inventory field | `afbfb24` | `f359be6` | delta |
| --- | ---: | ---: | ---: |
| Source files with a binding | 27 | 25 | -2 |
| Binding sites | 72 | 52 | -20 |
| Distinct literal keys | 50 | 30 | -20 |
| Dynamic binding sites | 2 | 2 | 0 |
| Bindings exposing a setter | 52 | 32 | -20 |
| Setter bindings with a direct in-file call | 49 | 29 | -20 |
| Setter bindings with downstream-only references | 3 | 3 | 0 |
| Read-only hook bindings | 20 | 20 | 0 |

Delta from `afbfb24`: exactly twenty rows removed, fifteen in `morePane.tsx` and
five in `stickyPane.tsx`; no additions, no other removed rows, no changed rows.
Each removed row is a literal-key setter binding with one direct in-file call
and one syntactic reference, so the setter and direct-call counts fall by the
same twenty while the downstream-only and read-only counts do not move. Dynamic
sites are unchanged. Rows were compared on file + key + setter, not on line
numbers.

### `packages/plugin-web-settings-rest/src/panes/morePane.tsx` (15 rows removed)

Source commits: the file's direct `usePref(` call count goes from 15 to 0 at
`27efbf2` (`fix(settings): recover More edits and reset defaults`). The three
later commits that touch the file in this window (`f4c3c62`, `982ab68`,
`7b216a3`) leave it at 0, so the file's commits in this window run from
`27efbf2` through `7b216a3`.

| Removed key | Removed setter | `afbfb24` line |
| --- | --- | ---: |
| `xai_pref_more_win_type` | `setWinType` | 129 |
| `xai_pref_more_launch_at_login` | `setLaunch` | 133 |
| `xai_pref_more_minimize_on_launch` | `setMinimize` | 137 |
| `xai_pref_more_date_recognition` | `setDateRec` | 141 |
| `xai_pref_more_remove_date_text` | `setRemoveDateText` | 145 |
| `xai_pref_more_remove_tags` | `setRemoveTags` | 149 |
| `xai_pref_more_url_parse` | `setUrlParse` | 153 |
| `xai_pref_more_default_date` | `setDefaultDate` | 157 |
| `xai_pref_more_default_rem_due` | `setDefaultRem` | 161 |
| `xai_pref_more_default_rem_all` | `setDefaultRemAll` | 165 |
| `xai_pref_more_default_pri` | `setDefaultPri` | 169 |
| `xai_pref_more_default_tag` | `setDefaultTag` | 173 |
| `xai_pref_more_default_list` | `setDefaultList` | 177 |
| `xai_pref_more_add_to` | `setAddTo` | 181 |
| `xai_pref_more_overdue_at` | `setOverdueAt` | 185 |

### `packages/plugin-web-settings-rest/src/panes/stickyPane.tsx` (5 rows removed)

Source commit: `210abdf`, the only commit that touches the file in this window
(subject: `fix(settings): recover Sticky edits and departures`); the file's
direct `usePref(` call count goes from 5 to 0 there.

| Removed key | Removed setter | `afbfb24` line |
| --- | --- | ---: |
| `xai_pref_sticky_color` | `setColor` | 39 |
| `xai_pref_sticky_font` | `setFont` | 43 |
| `xai_pref_sticky_pin_default` | `setPin` | 47 |
| `xai_pref_sticky_restore_size` | `setRestore` | 51 |
| `xai_pref_sticky_grid_spacing` | `setSpacing` | 55 |

Both files still exist at `f359be6`; they no longer contain a direct `usePref`
call, which is why the row-bearing file count falls by two. All twenty removed
literal keys are absent from the `f359be6` literal-key set, matching the -20
change in distinct literal keys.

## Reconciliation checks

- The stored `counts` in both JSON files equal the counts recomputed from their
  own `rows`.
- Of the 72 rows at `afbfb24`, 52 match a row at `f359be6` on file + key +
  setter; those 52 are also identical in every other scanner field (literal
  flag, direct-call count, syntactic-reference count) and in line number.
- All 25 row-bearing files at `f359be6` are byte-identical between `afbfb24`
  and `f359be6` (`git diff afbfb24 f359be6 -- <file>` is empty for each).
- The window `afbfb24..f359be6` has 55 commits. Only three scanner-eligible
  files (`packages/**/*.tsx`, excluding `__tests__`) changed in it:
  `morePane.tsx` (`27efbf2`, `f4c3c62`, `982ab68`, `7b216a3`), `stickyPane.tsx`
  (`210abdf`) and
  `packages/plugin-web-settings-rest/src/internal/StickyColorPalette.tsx`
  (`210abdf`). The last has no direct `usePref` call at either revision, so it
  contributes no row to either side. No scanner-eligible file was added,
  renamed or deleted.
- Unchanged at both revisions: the two dynamic rows (`prefKey` in
  `packages/xai-web-settings-features-panel/src/FeaturesPane.tsx` line 69 and
  `withDisabledFallback.tsx` line 43), the three downstream-only setter
  bindings (`setRawWorkspaces` in `BoardWorkspacesModule.tsx`, `rawSetOrder` in
  `DashboardModule.tsx`, `setPetId` in `DesktopPet.tsx`) and all twenty
  read-only rows.
- A textual `diff` of the two JSON files shows only the six header lines
  (`revision` and five count fields) changed plus 180 deleted lines, which is
  twenty rows at nine lines each; the deleted `"file"` fields are fifteen
  `morePane.tsx` and five `stickyPane.tsx`.

## Boundary and limits

This tracks direct legacy `usePref` bindings only: tracked `packages/**/*.tsx`,
excluding `__tests__`, direct identifier calls named `usePref`, and syntactic
setter references. It excludes wrapper, indirect, raw, ordinary
(`setPref`/`removePref`), timer, secret and non-TSX writers, other stores, and
side-effect consumers, and it is neither a full writer count nor a defect count.
A read-only hook row does not prove its containing file has no writers, and a
setter row does not prove storage ownership, awaited success/refusal behavior,
recovery semantics, or product correctness. It accepts nothing, including More
and Sticky, and closes no D2, REL, full312 or other 312 item; independent
requirement evidence owns acceptance. This refresh selects no caller, orders no
work and makes no risk or defect judgement; the JSON rows are inventory input
that a later scheduling step may read.
