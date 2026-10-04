# Features actual-host fixed rerun at `5cd63ff` (CP-FEATURES-01, batch 26, contract §14 E8)

**Verdict: PASS (independent verification only).** The frozen parent-role actual-host oracle and runner were rerun unchanged on the fixed product `5cd63ff`. All 40 of 40 cases pass:

- **33 correct before-FAILs turned PASS:** 24 per-field cases, 8 H8 navigation forms and 1 failed reset.
- **7 before-PASS cases stayed PASS:** 3 FIXTURE checks and positive controls PC1–PC4.
- **No case went PASS → FAIL.**
- The log has zero `PRECONDITION:` lines, zero runtime-error lines, zero unhandled errors and empty stderr.

This receipt is independent verification only. It is **not acceptance**, and it closes no 312 item: REL-05, REL-07, REL-10, UX-04, UX-05, QA-01, QA-03, QA-04, QA-09, SET-03 and D2/REL/AI stay open. It adds files only. No product file, oracle, runner, existing log, receipt, contract, ledger or control plane was changed. Nothing was pushed, merged, rebased, tagged, deployed, released or synced Web→Desktop.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol role mapping, isolated worktree `.claude/worktrees/agent-a35a2025129fe062c`. It did not write the contract, this oracle, the implementation or any F1 runner |
| Requested fixed revision | `5cd63ff` |
| Resolved fixed commit / tree | `5cd63ff652f02a2c726187fe12cbc796218d31c0` / `404bf819a42e20b3e4d372c18a981832ccd54954`; features package tree `3f25c84b5b582719d74fda8872db4e6e1db388f1` |
| Before (frozen E3) | `host-before1-f359be6.log` at `f359be6d838393e0f9e93efd80b88b5b09f6144e` |
| Docs base (detached HEAD) | `c516fced2ec8c6fb6a8054c6e6858c315fa4b84c`. `git diff --name-only 5cd63ff HEAD -- apps packages package.json pnpm-lock.yaml` is empty. The log records `runner_checkout_head=c516fce…` (L9) |
| Product delta `f359be6..5cd63ff` | 11 files, all under `packages/xai-web-settings-features-panel/` (contract §11); see `../web-features-recovery-sol/fixed-5cd63ff.md` |
| Lockfile gate | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for `XAI_DEPS_ROOT` (main checkout, read-only), `git show 5cd63ff:pnpm-lock.yaml` and the extracted archive (L14–L16) |
| Runtime | Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, Node v24.16.0. These are the same as in `before1` |
| Runs | One run, suffix `fixed1`. There was no environment failure |

## Command

From the worktree root, on 2026-10-04:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-features-recovery-independent/verify-fixed.mjs 5cd63ff host fixed1
```

Console: `host 5cd63ff (5cd63ff652f0): vitest_exit=0 harness=PASS exit=0 cases=40 passed=40 failed=0 precondition=0`. The runner exited with status 0.

## Frozen integrity (checked before the run and again after it)

| File | SHA-256 (recomputed = `before-f359be6.md`) |
| --- | --- |
| `host.test.tsx` (oracle, 988 lines) | `816e870ac123f12fced9a35285936627c8d86c3390fb0b905bcf0419d5f722f6` |
| `verify-fixed.mjs` (runner, 393 lines) | `d92901b477567a08ced08ec0c37318b5af31e2f459320dfa9b0caa7e93de72c1` |
| `host-before1-f359be6.log` (891 lines) | `977fc6565d5a18973473d3cd551d78eeb0213676732645fde2af5afa7dd098c0` |

- The fixed log's `oracle_sha256` line (L17) records `host.test.tsx=816e870a…` and `verify-fixed.mjs=d92901b4…`. Both equal the table and the `before1` header.
- The runner re-checked the copied oracle inside the archive.
- The guard's forbidden roots (L23) cover the `packages/`, `apps/` and `docs/` trees of both the dependency checkout and this worktree.
- All 74 files in the four Features/F1 evidence directories were unchanged after the run.

## New log (this directory)

| Log | Lines | SHA-256 | Result |
| --- | --- | --- | --- |
| `host-fixed1-5cd63ff.log` | 155 | `244f7dd7498ba49c6f466d030380581ae0db903876c7be02ef03a77294117f80` | 40 / 40 passed; `vitest_exit=0`, `harness_checks=PASS (6/6)`, `exit=0` (L24–L26) |

**Log layout:**
- Vitest totals: `Tests  40 passed (40)` at L88.
- Runner summary: from L96; the totals line L98 reads `precondition_failures=0 suite_errors=0 unhandled_error_lines=0 runtime_error_lines=0`.
- Harness checks: 6/6 at L99–L104.
- Per-case list: L105–L144.
- OBSERVED facts: L145–L150.
- Module pins: L151–L155. There are 560 archive modules, 2 more than `before1`'s 558: the new internal helpers `featuresRecovery.ts` and `featuresRecoveryCopy.ts`. There are 0 unaliased `@repo` imports, and none of the 21 required host modules is missing.

The stderr block is empty. At `before1` it held 32 `[plugin-web-storage] quota exceeded …` warnings from the legacy writer. The fixed pane no longer writes through that path.

## Before → fixed, per case

Cases were matched by full name, and the case order is identical in both logs. Case NNN is at fixed-log line 104+NNN.

| Group | Cases | `before1` at `f359be6` | `fixed1` at `5cd63ff` |
| --- | --- | --- | --- |
| FIXTURE validity | 001–003 | PASS | **PASS** |
| Positive controls PC1–PC4 | 004–007 | PASS | **PASS** |
| F-a latest choice kept after a denied write [H1 host], ×8 | 008–015 | FAIL | **PASS** |
| F-b Settings sidebar departure held [H8 route], ×8 | 016–023 | FAIL | **PASS** |
| F-c voluntary sign-out held, `false` on Stay [H8 sign-out], ×8 | 024–031 | FAIL | **PASS** |
| N-rail, N-programmatic, N-back-pop, N-forward-pop, N-back-delta, N-forward-delta, N-relative (Boards) [H8] | 032–038 | FAIL | **PASS** |
| N-beforeunload, warns with zero storage attempts [H8] | 039 | FAIL | **PASS** |
| R-route, failed Reset (Calendar removal denied), departure held [H5/H8] | 040 | FAIL | **PASS** |
| **Total** | 40 | 7 PASS / 33 FAIL | **40 PASS** |

**Transitions:** 33 FAIL→PASS (008–040), 7 PASS→PASS (001–007), 0 PASS→FAIL, 0 FAIL→FAIL.

The fixed-only assertions listed in the before receipt ("Fixed-product assertions not reached at `f359be6`") executed here for the first time. They passed in every held case:

- the URL stays on Features;
- the `Unsaved Features draft` dialog opens, never the fallback;
- Stay keeps the route, the router location, the history stack (zero `pushState`/`replaceState`) and the latest intent on display;
- zero Features attempts during the departure;
- zero runtime errors;
- sign-out resolves `false` on Stay with account A still active;
- the beforeunload handler makes zero storage attempts.

## Recorded facts (OBSERVED, not asserted): before → fixed

| Fact | `before1` | `fixed1` |
| --- | --- | --- |
| PC4 clean reset: confirmation text | `Reset every preference to defaults? This clears saved theme, layout, and module toggles.` | `Turn all 8 modules back on? This only changes which modules are shown; your data is kept.` (L148) |
| PC4: set attempts / remove attempts | 0 / 8 | 0 / 8 |
| PC4: `key:null` StorageEvents | 1 | **0** |
| PC4: account scope relocked, account-gate screen shown, Features/sidebar/AppRail remounted | yes, yes, yes (all 8 original switches detached) | **no, no, no** (0 switches detached) |
| PC4: displayed after settle | all 8 on (after the remount) | all 8 on, on the original switches (the 4 seeded-off switches went `false` → `true`) |
| R-route failed reset: remove attempts | 8, Calendar `threw:true` | 8, Calendar `threw:true` (L150) |
| R-route: bytes after | Calendar `"false"`, the other 7 absent | Calendar `"false"`, the other 7 absent |
| R-route: `key:null` events, relock, gate, remount | 1, yes, yes, yes | **0, no, no, no** |
| R-route: Calendar displayed | off (re-read after the remount) | **on**: the unresolved reset intent, contract §6, with the departure held (case 040) |
| N-beforeunload: prevented / storage attempts | `false` / 0 | **`true`** / 0 (L149) |
| PC1-beforeunload (clean) | not prevented | not prevented (L147) |
| FIXTURE marker event (the instruments' own relock probe) | relock and gate detected | relock and gate detected (L146); the instruments still work |

So the reset's synthetic `key:null` event, which made `AccountDataGate` relock the account and remount the whole host, no longer occurs. `AccountDataGate.tsx` itself is unchanged (`7519485b…` in both logs).

## Product hashes recorded by the runner (16 files, L18)

- **Changed.** Three files, all in the contract §11 set; this is the expected Terra delta:

  | File | `f359be6` | `5cd63ff` |
  | --- | --- | --- |
  | `FeaturesPane.tsx` | `987c3825…` | `54a3f10c…` |
  | `internal/featuresPane.tsx` | `14053daa…` | `572bdd47…` |
  | `types.ts` | `bd6b3599…` | `f97c4e62…` |

- **Unchanged.** All 13 other recorded files are identical: features `index.ts`, `AccountDataGate.tsx`, `usePref.ts`, `storage.ts`, `usePrefAsync.ts`, `prefMutation.ts`, `SettingsFooter.tsx` `afecc734…`, `Shell.tsx`, `AppRail.tsx`, `composedSettingsRegistration.tsx`, `departureCoordinator.tsx` `0844a697…`, `settingsDeparture.ts` and `shellRegistrations.tsx`.

## Non-passing cases

None.

## Limitations

These are carried over from the before receipt and still apply.

- **jsdom, not Chrome or Tauri.** Input is synthetic `fireEvent`. There is no hit-testing, keyboard, focus or responsive check. jsdom's `History` timing differs from browsers. A beforeunload warning is detected as a canceled cancelable `Event`.
- **Reduced host.**
  - `AccountDataGate` is mounted directly, without the auth session, `PomodoroSessionHost` or the AI secret participant.
  - There is no App rail filter, `CommandPalette`, `DesktopPet` or appearance effects.
  - Destinations outside Settings are placeholders. The account is synthetic, and the run is EN only.
  - Production-App effects are covered by Sol `downstream` (E7) and natively by E13.
- **Coverage.** The full §9 matrix rows a–n with exactly-once release behind a real held lock, keyboard and EN/ZH presentation are E9–E15, not this rerun. One `fixed1` run.
- **Dependencies** are reused read-only from `XAI_DEPS_ROOT`; the lockfile gate is a consistency check only.
