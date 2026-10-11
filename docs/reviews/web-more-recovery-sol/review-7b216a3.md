# Sol independent More recovery verification — `7b216a3`

## Verdict

**PASS for the bounded More caller matrix.** The unchanged final Sol oracle passes 79/79 at `7b216a3d5a4947d0f66da042fb275302737fb762`. The current product-owned More suite separately passes 15/15. This report does not close the complete More contract, the parent-owned actual host/native gates, Astra final acceptance, full312, REL, D2, or release readiness.

## Pinned revisions and attribution

- Before: `afbfb24d6f7311366b77852eda927d08467478c2`.
- First implementation reviewed: `982ab682eb924ec8fc349aa884d092052245575d` (`27efbf2` + `f4c3c62` + `982ab68`). It passed 59/79 independent cases and failed 20/79.
- Final implementation reviewed: `7b216a3d5a4947d0f66da042fb275302737fb762`.
- `git diff --exit-code afbfb24..7b216a3 -- packages/plugin-web-storage pnpm-lock.yaml package.json` exited 0. The shared storage hook, mutation engine, root dependency manifest, and lockfile are unchanged, so the recovered behavior is attributable to the More caller.
- The 79 Sol tests are reviewer-owned. The 12 inherited baseline More cases and 3 current product-author additions are reported separately and are not relabelled as Sol coverage.

## Exact results

| Matrix | Cases | `afbfb24` | `7b216a3` | Business coverage |
| --- | ---: | ---: | ---: | --- |
| Fields | 22 | 2 pass / 20 fail | 22 pass | All 15 domains/defaults/codecs/owners, six booleans including two equivalent accessible pressed-state buttons, absent zero-write, invalid/unavailable source, all15 latest failure/Retry, malformed selects and independent feedback |
| Reset | 20 | 2 pass / 18 fail | 20 pass | All15 physical removal/default projection, already-absent no-op, all15 per-field remove refusal/Retry, locked refusal/fresh reopen, stale A first click under B zero mutation, mixed device/account partial failure |
| Queues | 14 | 0 pass / 14 fail | 14 pass | Device/account set→reset and reset→set, successful and failed predecessor/latest in both directions, repeated predecessor failure, reset→edit→reset, duplicate pending actions, uncertainty one-remove, temporary denial/conflict, discard→new same-field work |
| Boundaries | 10 | 0 pass / 10 fail | 10 pass | Missing/rejected locks, invalid/unavailable reset, missing committed marker, deleted source recovery, held account lifecycle lock with device independence, set-default vs remove, source Reload isolation, targeted discard, conflict plus unrelated quota, all-discard/new work |
| Owner/export | 13 | 1 pass / 12 fail | 13 pass | Exact all15 and sparse mixed memory export, valid admitted device reset continuity, A-private disposal, A→B→locked and same-account epoch, lifecycle independence, unmount, Blob/URL/append owner invalidation, export setup/click recovery |
| **Sol total** | **79** | **5 pass / 74 fail** | **79 pass** | Independent bounded caller evidence |
| Existing/product More suite | 12 before / 15 final | 12 pass | 15 pass | Preserved MP1–MP10 and two REL-03 cases; final also contains product-authored MP8b, MP8c and MP11 |

The authoritative raw logs and their role are indexed in `README.md`. Every final log records `revision=7b216a3`, the same resolved full SHA, and `exit=0`.

## Independent defect found and repaired

At `982ab68`, all 15 per-field remove-refusal cases kept the old saved control value instead of displaying the reset intent's registry default. The same caller defect broke five set→reset/latest-reset queue cases. The cause was the More `current(field)` projection: it overlaid `set` drafts but allowed `reset` drafts to fall through to the persisted hook value. `7b216a3` projects the registry default for a current typed reset draft while retaining `set(default)` as a distinct stored value. The unchanged 20 affected tests and all other 59 independent cases pass after that repair.

During review, several preliminary failures were correctly rejected as reviewer errors: a no-op edit used a value equal to its initial value; a B fixture overwrote the shared device key and created a legitimate external conflict; an equivalent accessible button was overconstrained to `role=checkbox`; and old private physical keys were derived only after scope invalidation. Those logs remain diagnostic and do not contribute to the final result.

## Additional checks

- `pnpm --filter @repo/plugin-web-settings-rest typecheck`: PASS, independently run at `7b216a3`.
- `pnpm --filter @repo/plugin-web-settings-rest lint`: PASS, independently run at `7b216a3`.
- Immutable current product regression: 15/15 PASS.
- Immutable inherited baseline regression: 12/12 PASS.

## Remaining acceptance boundary

This evidence verifies the More pane through an isolated real storage/hook/caller composition with actual account scopes and named-lock fixtures. It does not substitute for the parent-owned production Settings host/navigation/signout/beforeunload matrix, native trusted controls and disk downloads, visual/focus/hit-target review, broader Settings/Web regression, or Astra's final contract reconciliation. No broader audit item is closed by this report alone.
