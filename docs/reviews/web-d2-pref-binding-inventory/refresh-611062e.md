# Direct typed preference binding refresh at `611062e`

Luna read-only inventory, generated on 2026-09-11 from the immutable product
revision `611062ee2eb80727440c731c62a09626ca87d8eb`. The scanner read each
source file with `git show 611062e:<path>` and used the existing TypeScript AST
method in [scan.mjs](scan.mjs); it did not inspect the current dirty working
tree. The machine evidence is [bindings-611062e.json](bindings-611062e.json).

The fixed source contains the Date & Time five-control conversion: the old
direct `usePref` rows for those controls are absent. This is an inventory delta
only and does not accept the Date & Time caller or any broader audit item.

## Counts and delta

| AST inventory field | `c9a388d` | `611062e` | delta |
| --- | ---: | ---: | ---: |
| Source files with a binding | 29 | 28 | -1 |
| Binding sites | 85 | 80 | -5 |
| Distinct literal keys | 63 | 58 | -5 |
| Dynamic binding sites | 2 | 2 | 0 |
| Bindings exposing a setter | 65 | 60 | -5 |
| Setter bindings with a direct in-file call | 62 | 57 | -5 |
| Setter bindings with downstream-only references | 3 | 3 | 0 |
| Read-only hook bindings | 20 | 20 | 0 |

The exact removed rows are all in
`packages/plugin-web-settings-rest/src/panes/dateTimePane.tsx`:

| Removed key | Removed setter |
| --- | --- |
| `xai_pref_dt_start_week` | `setStartWeek` |
| `xai_pref_dt_lunar` | `setLunar` |
| `xai_pref_dt_week_numbers` | `setShowWk` |
| `xai_pref_dt_holidays` | `setShowHoliday` |
| `xai_pref_dt_timezone` | `setTz` |

No new direct `usePref` binding rows or literal keys were found. The removed
file is the one Date & Time pane above; all other 28 source files in the prior
inventory remain represented. Dynamic sites remain two, and their expressions
are preserved in the JSON evidence.

## Remaining Settings scheduling input

These are direct `usePref` setter binding counts under the same AST boundary at
`611062e`. `direct calls` is the scanner's syntactic in-file call count; it is
not a complete writer count. `CallbackPage` is included because it is part of
the Settings integrations caller surface.

| Settings source | Binding sites | Setter bindings | Direct-call setter bindings |
| --- | ---: | ---: | ---: |
| `packages/plugin-web-settings-rest/src/CallbackPage.tsx` | 3 | 3 | 3 |
| `packages/plugin-web-settings-rest/src/panes/aiPane.tsx` | 4 | 4 | 4 |
| `packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx` | 3 | 3 | 3 |
| `packages/plugin-web-settings-rest/src/panes/morePane.tsx` | 15 | 15 | 15 |
| `packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx` | 8 | 8 | 8 |
| `packages/plugin-web-settings-rest/src/panes/stickyPane.tsx` | 5 | 5 | 5 |
| `packages/xai-web-settings-features-panel/src/FeaturesPane.tsx` | 1 | 1 | 1 |
| `packages/xai-web-settings-appearance/src/AppearancePane.tsx` | 3 | 0 | 0 |
| `packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx` | 1 | 0 | 0 |

Date & Time is no longer in the remaining direct-hook rows (0 old direct
setter bindings after conversion). The remaining Settings rows above total 39
setter bindings, all directly invoked under this scanner, plus four read-only
hook rows and one dynamic setter row shown in the JSON. The pane-level counts do
not select an implementation batch or determine caller acceptance.

## Boundary and limits

This is the same narrow inventory as `bindings-c9a388d.json`: tracked
`packages/**/*.tsx`, excluding `__tests__`, direct identifier calls named
`usePref`, and syntactic setter references. It excludes wrappers and indirect
calls, non-TSX implementations, ordinary `setPref`/`removePref`, raw or
computed keys, other stores, timers, secrets, and side-effect consumers. A
read-only hook row does not prove its containing file has no writers, and a
setter row does not prove storage ownership, awaited success/refusal behavior,
recovery semantics, or product correctness. This refresh is scheduling input;
it makes no architecture choice, caller acceptance, D2 closure, REL closure,
or full312 claim.
