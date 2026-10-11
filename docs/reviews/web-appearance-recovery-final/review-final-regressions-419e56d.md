# Appearance final regression receipt (E18–E25, E27) at `419e56d`

- **Caller:** CP-APPEARANCE-01, Settings Appearance (seven device fields, the App root-preference writer, the Topbar quick switcher and Retry all), module `web`, control-plane batch 51.
- **Contract:** `../web-appearance-recovery-contract/contract.md` r3 (`706c9a3`, SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d`, re-derived), §10 items 8–12, §11, §13 row 10, §14 E1–E27.
- **Fixed product:** `419e56de9f23e4467fea806fbd4a990e1f429941`. **Before:** `5cd63ff652f02a2c726187fe12cbc796218d31c0`. **Earlier fixed (delta audit):** `24073b522262d8b4bec0abfa29347db28adbdd9e`.
- **Verifier:** independent final-regression verifier (Sol role), Claude Opus 5.5, worktree `.claude/worktrees/agent-a0dc0b66ab01c83fd`, detached at control-plane commit `68686c562da3cd4885577178ca03d8ecf4be3094` after `git fetch origin codex/web/full-product-audit-20260908`; `git status` was clean. I am not Terra, did not author the contract, an oracle, a runner I reused, or any earlier batch of this caller.

**This receipt is the final-regression gate only.** It is not caller acceptance (batch 52). It closes no 312 item (SET-01, SET-02, SHELL-04/05/06, REL-05/07/09/10, UX-03/04/05, QA-01/03/04/09, D2/REL/AI stay open) and authorizes no deployment, release, branch promotion or Web→Desktop sync.

## Verdict

**PASS (final-regression gate), with one frozen finding that needs a controller ruling before acceptance: F-FD1 (§7).** No product failure was observed in any gate.

- **F-FD1.** The accepted Features Sol `downstream` oracle is 14/15 at `419e56d` (accepted 15/15). The only non-pass is case 012's **precondition**: the oracle seeds `xai_bg_tone = "sage"` and expects the App to display it. Contract r3 §5 item 2 lists `sage` as malformed (the field is unavailable and displays its default), which is exactly the H7 fix this caller had to make. Deterministic (v1 and v2 at `419e56d`, and at `24073b5`). A two-token diagnostic copy that seeds the in-domain `"mist"` passes 15/15 at both `419e56d` and `5cd63ff`. The count difference is therefore explained, so the stop condition did not trigger. The precedent is OE-1/OE-2 and C-FB002: the controller rules how E24 judges this case.
- **Deviations that need acknowledgement** (§2.3): E25 runs through a copy of the Features harness (one caller-bound precondition generalized, plus the K-1 key audit), because the unchanged frozen runner refuses at that precondition (log committed). E17 runs through the K-1 corrected copy, because the frozen runner sends `nativeVirtualKeyCode`. Every native run used its frozen DevTools-WebSocket transport, not the pipe transport.
- **Carry-over (§5):** `24073b5..419e56d` changes exactly the two appended `:focus-visible` rules and two test files. All 12 production `.js` files are byte-identical; the entry chunk keeps its bytes under a new hashed name. The esbuild bundles that the E9–E13/E26 native runs executed are reproduced exactly from `24073b5` and are byte-identical from `419e56d`. E9–E13 and E26 carry over.

| Gate | Fresh result at `419e56d` | Accepted receipt / control | Exit | Match |
| --- | --- | --- | --- | --- |
| E18 §10.9 search | 30 patterns, 102 changed rows, all in §11 files; Appearance product source 0 × each of 10 forbidden spellings; `Topbar.tsx` 0 `localStorage`; `App.tsx` 0 `writeLocalPref`/`localStorage.setItem`/preference-changed subscriber/`usePref(`; `readLocalPref` byte-identical (L86–96 → L87–97, `3675ffe3…`), every other `localStorage` line a comment | per-file counts at `5cd63ff` (same log) | 0 | yes (118/118 assertions, 64/64 harness, shared with E19) |
| E19 §10.8 protected paths | 13/13 fully protected paths identical object ids; shell 5 changed, all §11, 27/27 other blobs identical; apps 2 changed, 267/267; Appearance 19 changed, all §11, 14/14 other paths identical (incl. the 11 §11-protected files); product diff and full diff outside `docs/` = the 26 §11 files (+4111/−666) | contract §10.8, §11 | 0 | yes |
| E20 storage check-types | `tsc --noEmit` exit 0, 0 diagnostics; 315 program files (46 archive, 269 store) | Features final `5cd63ff` 315/46; accepted exit 0 | 0 | yes |
| E20 Sol lifecycle | `bytes` 65/65; case 006 "PC §2 §10.11 lifecycle" (`bytes.test.tsx` L271–277) PASSED | `bytes-fixed1-24073b5` and `bytes-before3-5cd63ff` PASSED | 0 | yes |
| E21 Appearance | test 11 files / 137 / 137; typecheck exit 0 (384 program files, 85 archive); lint exit 0 (25 files, 0/0) | Terra r3 11 / 137 per-file equal | 0/0/0 | yes |
| E21 before control | §11 "Unchanged": 3 whole files 22/22 and 9 named cases 9/9, identical at `5cd63ff` and `419e56d`; every case block byte-identical (E19 log) | same names and statuses at both | 0 | yes |
| E22 shell | test 9 / 115 / 115; check-types exit 0 (355/60); lint exit 0 (24 files) | Terra r1 9 / 115 per-file equal | 0/0/0 | yes |
| E22 before control | 8 unchanged files 91/91; Topbar TP0–TP7 and TB-PREMIUM-1 15/15, identical at both revisions | same | 0 | yes |
| E23 web | test 29 / 178 / 178 (`App.lazy-init` 8, `App.signout` 7, every §10.10 file present); check-types exit 0 (1384/667); lint exit 0 (83 files) | `5cd63ff` control 28 / 156 (= accepted Features final per file); delta exactly `App.appearance.test.tsx` (22); Terra r3 29/178 per file | 0/0/0 | yes |
| E24 Features | Sol bytes 17, fields 49, reset 31, queues 40, continuity-export 26, **downstream 14/15 (F-FD1)**, original 6; host 40; package 7/45 | 17/49/31/40/26/15/6; 40; 45 | 0 except downstream 1 | yes except **F-FD1** |
| E24 More | Sol fields 22, reset 20, queues 14, owner-export 13; `boundaries` frozen 10/10 (recorded as it fell), corrected 10/10, 0 RangeError (C-FB002); original 15; host 11 | 22/20/14/13; 10; 15; 11 | 0 | yes |
| E24 Sticky | Sol 13 + 47 + 27 + 22 = 109; original 10; host 28 (ordered titles and oracle hash lines equal) | `post1-f359be6` | 0 | yes |
| E24 Notifications | Sol 11 + 3 + 2 + 4 + 10 + 11 = 41; Astra boundaries 24; Astra host 15; parent host 12 | accepted | 0 | yes |
| E24 Date & Time / settings-shell / settings-rest | 7 / 11 files 54 / 44 files 314 (per file equal) | 7 / 54 / 44 · 314 | 0 | yes |
| E25 Features native downstream | frozen runner: refuses at `baseline:fixed-delta-only-in-features-package` only (exit 1, expected); E25 copy: **PASS**, 344 checks (343 + K-1 audit), 140/140 product, 0 runtime errors, 0 console warnings, 7 presses = 7 keydowns | accepted E13 `5cd63ff` 343 / 140 | 1 / 0 | yes (sequence equal after the mapped precondition) |

## 1. Fixed points and execution rules

- `git diff --name-only 419e56d HEAD -- apps packages package.json pnpm-lock.yaml` is empty: the docs head carries the fixed product unchanged.
- **Dependencies.** `XAI_DEPS_ROOT` = the main checkout, read only: no install, build, dev server or preview there. A read-only mtime scan after all runs (top level, `node_modules` and `apps/web/node_modules` to depth 2, `apps`/`packages` to depth 3, `docs` to depth 2, every `.vite`) found no entry newer than the session start outside `.git`/`.claude`. Nothing was installed in this worktree.
- **Every execution:** an immutable `git archive` of the requested SHA in a fresh temp directory, deleted afterwards; lockfile gate `df05f2dd…aeab9` for the dependency checkout, `git show <rev>:pnpm-lock.yaml` and the extracted archive; `@repo/*` pinned into the archive with that runner's guard (Vitest: exact-match aliases + guard plugin, `pin_unaliased_repo_imports=0`; tsc: `--listFiles` with `elsewhere=0`; ESLint: resolution hook, `pin_violations=0`; esbuild: exact-export pin + checkout guard); requested and resolved SHA in every log; refusal to overwrite; nonzero exits preserved (continuity-export 1, Features downstream 1, frozen E25 runner 1, `compare-accepted` 1).
- **Native:** Chrome 154.0.8037.97 headless, the build of every earlier native batch; no runner I invoked sends `nativeVirtualKeyCode` (E16 runners: 0 occurrences; E17 through the K-1 copy; E25 harness `pressKey` sends only `windowsVirtualKeyCode`); key audits passed where a runner has one (E17 2 = 2 and 3 = 3; E25 7 = 7). No headless Chrome process or `xai-*` temp directory remained.
- **Runtime:** Node v24.16.0, Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, TypeScript 5.9.2, ESLint 9.39.1, esbuild 0.28.1, macOS 27.0.1 arm64, tz America/Los_Angeles. Official runs 2026-10-05 20:23:41Z–20:47:32Z.

## 2. Runners

### 2.1 Reused unchanged (hash = its accepted receipt)

| Runner | SHA-256 | Used for |
| --- | --- | --- |
| `../web-appearance-recovery-sol/verify-fixed.mjs` | `a451df6aa05fcae5…` | E7 (8 modes), E20 lifecycle |
| `../web-appearance-recovery-oracle-erratum/verify-erratum.mjs` | `354c220b0cddb699…` | E7 corrected copy (OE ruling) |
| `../web-appearance-recovery-independent/verify-fixed.mjs` | `6aac35631594d11a…` | E8 |
| `../web-features-recovery-final/verify-packages.mjs` | `f7758f28fd98cba9…` | E20 storage; E24 settings-shell, settings-rest, Features package |
| `../web-features-recovery-final/verify-callers.mjs` | `7e1aa8b244ed9f63…` | E24 More, Notifications, Date & Time (17 modes) |
| `../web-more-recovery-fb002/verify-fb002.mjs` | `d2150cd4794f7a51…` | E24 More corrected `boundaries` |
| `../web-features-recovery-sol/verify-fixed.mjs`, `../web-features-recovery-independent/verify-fixed.mjs` | `b5ac75fa…`, `d92901b4…` | E24 Features Sol 7 modes, host |
| `../web-sticky-recovery-sol/verify-fixed.mjs`, `../web-sticky-recovery-independent/verify-fixed.mjs` | `3fba4b3b…`, `5a8ea1dd…` | E24 Sticky |
| `../web-sticky-recovery-f1/verify-f1{,-callers,-race}.mjs`, `../web-features-recovery-f1/verify-f1-features.mjs` | `816bd261…`, `88ccca3d…`, `3d009ac0…`, `d0ac8c68…` | E16 (12 invocations) |
| `../web-native-keyinput-k1/verify-f1-appearance-k1.mjs` (K-1 corrected copy) | `e9fbc5905fbace2c…` | E17 (§2.3) |
| `../web-features-recovery-native/verify-native-downstream.mjs` + `native-host-harness.mjs` | `82df2961…` + `499fca4c…` | E25 frozen attempt (refusal) |

### 2.2 New in this directory

The evidence runners (`verify-static.mjs`, `verify-packages.mjs`, `verify-delta.mjs` and the four E25 files) had their hashes recorded at 20:23:24Z, before the first evidence run, and are unchanged since. The read-only comparison and hash tools and the diagnostics were written afterwards. They execute no product code, except the diagnostics, which are not gate evidence.

| File | SHA-256 | Covers |
| --- | --- | --- |
| `verify-static.mjs` | `8f6352fd162d4decac3e66f3b1c67fe5e95e2aa8a1a28738e886c2081254aca5` | E18, E19, E6 §11 hashes, §11 "Unchanged" case identity. The Features `verify-static.mjs` hard-codes Features patterns, §11 and paths |
| `verify-packages.mjs` | `8f9fb90f38717515c9ba9606b4f99c643d61c0523a07adbbe071982adb864e80` | E21–E23: copy of the Features package runner with an Appearance/shell/web mode table and name-filtered "Unchanged" controls whose executed set must equal the §11 list exactly |
| `verify-delta.mjs` | `a5b02d192304222a390131c81bad92ed2aecd749f4a9ad6a7f43a29e20473bb9` | delta audit (§5) |
| `verify-native-downstream.mjs`, `native-downstream.tsx`, `native-host-prelude.js` | `82df2961…`, `9b77055e…`, `01acaa5d…` (byte-identical to the frozen files) | E25 copy |
| `native-host-harness.mjs` (+ `native-host-harness.e25.diff` `40287c36…`) | `afa313f8e3562fe931871ae0182d0faa2193ac0291478c0c75ca266abc5e71cf` | E25 copy: one removed line (the caller-bound precondition) and marked additions only |
| `compare-accepted.mjs`, `compare-reruns.mjs`, `hash-evidence.mjs` | `b411eb3d…`, `60d2c440…`, `1ef935b5…` | read-only comparison and E27 tools |
| `diag-features-sol-corrected.mjs`, `diagnostics/*` | see §9 | F-FD1 and F1-bundle diagnostics (not gate evidence) |

### 2.3 Deviations (each needs controller acknowledgement; acceptance reviews them)

1. **E25 through a copy.** The frozen harness's precondition `baseline:fixed-delta-only-in-features-package` requires the `f359be6..fixed` delta to lie in the Features package; that is true only at `5cd63ff`. Run unchanged at `419e56d` (`../web-features-recovery-native/native-419e56d-appearance-final-v1-downstream.log`, `273ecc12…`) it refuses there and nowhere else: lockfile, guard, required-module and docs-head preconditions all pass first. The copy replaces it with `baseline:fixed-delta-is-features-then-appearance-section-11`: the delta must be exactly `f359be6..5cd63ff` (non-empty, all Features) plus the 26 Appearance §11 files. Every other precondition is unchanged, including "every bundled archive module outside the delta is byte-identical to `f359be6`" (PASS). It also adds the K-1 key audit the K-1 ruling asks of native runners. A build-only probe beforehand showed that all 46 required modules are still bundled and that there is zero drift outside the delta (§9).
2. **E17 through the K-1 corrected copy.** The frozen `verify-f1-appearance.mjs` (`f570b5c9…`) sends `nativeVirtualKeyCode` 27. The K-1 ruling: frozen logs stay authoritative, and future native runs drop the field and audit keys. The copy `e9fbc590…` (batch 44) differs only in that. Compared with the frozen `fixed1` logs, the check sequences are identical apart from the audit precondition.
3. **Transport.** The batch asks for pipe transport. Every native runner invoked here uses the DevTools WebSocket it was frozen with: the 12 E16 runners, the K-1 copy, and the E25 frozen runner and copy. E16 requires unchanged runner hashes, so changing transport would break E16 or widen the E25 deviation, and no new native runner was written. A dropped socket can only surface as a harness error, never a pass. None occurred: every run completed with its full check count.
4. **Runner substitution for E18–E23** as in batch 30: new runners only where the frozen ones are hard-coded to Features. Fidelity: same conventions, and the controls reproduce accepted counts (web `5cd63ff` 28/156 equals the accepted Features final per file; unchanged Appearance and shell cases identical at both revisions).

## 3. Reproduction (official runs, in order) and exit codes

From the worktree root, `D=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop`, `S=<session scratchpad>/b51-native-tmp`, suffix `appearance-final-v1` unless stated:

```sh
XAI_DEPS_ROOT=$D node docs/reviews/web-appearance-recovery-final/verify-static.mjs 419e56d 5cd63ff appearance-final-v1        # 0
XAI_DEPS_ROOT=$D node docs/reviews/web-appearance-recovery-final/verify-delta.mjs 419e56d 24073b5 appearance-final-v1         # 0
XAI_DEPS_ROOT=$D node docs/reviews/web-appearance-recovery-sol/verify-fixed.mjs 419e56d <mode> appearance-final-v1           # bytes fields reset queues host retry-all original: 0; continuity-export: 1 (OE-1/OE-2)
XAI_DEPS_ROOT=$D node docs/reviews/web-appearance-recovery-oracle-erratum/verify-erratum.mjs 419e56d corrected appearance-final-v1   # 0
XAI_DEPS_ROOT=$D node docs/reviews/web-appearance-recovery-independent/verify-fixed.mjs 419e56d host appearance-final-v1      # 0
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-final/verify-packages.mjs 419e56d <storage-check-types|settings-shell-test|settings-rest-test|features-test> appearance-final-v1   # 0 each
XAI_DEPS_ROOT=$D node docs/reviews/web-appearance-recovery-final/verify-packages.mjs 419e56d <appearance-test|appearance-unchanged-files|appearance-unchanged-cases|appearance-typecheck|appearance-lint|shell-test|shell-unchanged-files|shell-topbar-unchanged|shell-check-types|shell-lint|web-test|web-check-types|web-lint> appearance-final-v1   # 0 each
XAI_DEPS_ROOT=$D node docs/reviews/web-appearance-recovery-final/verify-packages.mjs 5cd63ff <appearance-unchanged-files|appearance-unchanged-cases|shell-unchanged-files|shell-topbar-unchanged|web-test> appearance-final-v1   # 0 each
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-final/verify-callers.mjs 419e56d all appearance-final-v1            # 0 (17 modes)
XAI_DEPS_ROOT=$D node docs/reviews/web-more-recovery-fb002/verify-fb002.mjs 419e56d corrected full appearance-final-v1        # 0
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-sol/verify-fixed.mjs 419e56d <mode> appearance-final-v1             # bytes fields reset queues continuity-export original: 0; downstream: 1 (F-FD1)
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-sol/verify-fixed.mjs 419e56d downstream appearance-final-v2        # 1 (F-FD1, diagnostic iteration 2)
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-sol/verify-fixed.mjs 24073b5 downstream appearance-final-v1        # 1 (F-FD1 diagnostic)
XAI_DEPS_ROOT=$D node docs/reviews/web-appearance-recovery-final/diag-features-sol-corrected.mjs <419e56d|5cd63ff> downstream appearance-final-v1   # 0, 0 (F-FD1 diagnostic)
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-independent/verify-fixed.mjs 419e56d host appearance-final-v1        # 0
XAI_DEPS_ROOT=$D node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs 419e56d <bytes|fields|queues|continuity-export|original> appearance-final-v1   # 0 each
XAI_DEPS_ROOT=$D node docs/reviews/web-sticky-recovery-independent/verify-fixed.mjs 419e56d host appearance-final-v1         # 0
XAI_DEPS_ROOT=$D XAI_NATIVE_TMPDIR=$S node docs/reviews/web-sticky-recovery-f1/verify-f1.mjs 419e56d <sticky|more|collaborate> appearance-final-v1   # 0 each
XAI_DEPS_ROOT=$D XAI_NATIVE_TMPDIR=$S node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs 419e56d <selfcheck|notifications|date-time|smart-lists|header|pomodoro> appearance-final-v1   # 0 each
XAI_DEPS_ROOT=$D XAI_NATIVE_TMPDIR=$S node docs/reviews/web-sticky-recovery-f1/verify-f1-race.mjs 419e56d race appearance-final-v1        # 0
XAI_DEPS_ROOT=$D XAI_NATIVE_TMPDIR=$S node docs/reviews/web-features-recovery-f1/verify-f1-features.mjs 419e56d <selfcheck|features> appearance-final-v1   # 0 each
XAI_DEPS_ROOT=$D XAI_NATIVE_TMPDIR=$S node docs/reviews/web-native-keyinput-k1/verify-f1-appearance-k1.mjs 419e56d <selfcheck|appearance> appearance-final-v1   # 0 each
XAI_DEPS_ROOT=$D XAI_NATIVE_TMPDIR=$S node docs/reviews/web-features-recovery-native/verify-native-downstream.mjs 419e56d downstream appearance-final-v1   # 1 (expected refusal, §2.3)
XAI_DEPS_ROOT=$D XAI_NATIVE_TMPDIR=$S node docs/reviews/web-appearance-recovery-final/verify-native-downstream.mjs 419e56d downstream appearance-final-v1  # 0
XAI_DEPS_ROOT=$D node docs/reviews/web-appearance-recovery-final/diagnostics/f1-bundle-depth.mjs appearance-final-v1        # 0 (diagnostic)
node docs/reviews/web-appearance-recovery-final/compare-reruns.mjs appearance-final-v1                                     # 0: 26 MATCH, 0 DIFF
node docs/reviews/web-appearance-recovery-final/compare-accepted.mjs appearance-final-v1                                   # 1: 54 MATCH, 1 DIFF (F-FD1)
node docs/reviews/web-appearance-recovery-final/hash-evidence.mjs appearance-final-v1                                      # 0: 0 failures
```

**Iterations.** One run per unit (iteration 1 of 3), except Features Sol `downstream` at `419e56d`, which used 2 of 3 (v1 official, v2 determinism). The E25 frozen refusal and the E25 copy are separate units, one run each. No log is superseded.

## 4. Per-gate detail

### E18 — §10 item 9 (`search-appearance-final-v1-419e56d.log`)
- **Scope.** Every committed file outside `docs/` and `*.md`, text only: 2126 files at `419e56d`, 2116 at `5cd63ff`. Each per-file count is cross-checked against `git grep -I -c -F` (64/64 harness).
- **Patterns (30).** The seven keys; `web:settings:preference-changed`; `readLocalPref`, `writeLocalPref`, `persistAndSet`; `setPref(`, `removePref(`, `usePref(`, `usePrefAutosaveAsync(`, `emitWebEvent(`, `resetAllPrefs`; `new StorageEvent`, `dispatchEvent(`; `SettingsFooter`, `pane-footer`, `pane-save`; the six `apply*(`; `WebShellProvider`, `useWebShell(`.
- **102 delta rows, all in §11 files.** No file outside §11 changed any count.
  - Removed writers: `writeLocalPref` 5 → 0 and the `persistAndSet` call sites in `App.tsx`/`Topbar.tsx`.
  - `AppearancePane.tsx`: `emitWebEvent(` 14 → 0, `setPref(` 4 → 0, `usePref(` 3 → 0, key literals 13 → 0.
  - New hits only in the controller, the new tests and `App.appearance.test.tsx`.
- **Gated zeros.**
  - Appearance product source (11 non-test files under `src/` at `419e56d`, 7 at `5cd63ff`, stylesheet included): 0 for each of `localStorage`, `setPref(`, `removePref(`, `usePref(`, `emitWebEvent(`, `new StorageEvent`, `dispatchEvent(`, `SettingsFooter`, `pane-footer`, `pane-save`.
  - `Topbar.tsx`: 0 `localStorage` (was 6).
  - `App.tsx`: 0 `writeLocalPref`, 0 `localStorage.setItem`, 0 `onWebEvent("web:settings:preference-changed"`, 0 `usePref(`.
  - `readLocalPref` is byte-identical: `5cd63ff` L86–96 and `419e56d` L87–97, both `3675ffe3ba163e40…`. The only `localStorage` lines outside it are the comments at L78 and L80.

### E19 — §10 item 8 (`protected-diff-appearance-final-v1-419e56d.log`)
- **Fully protected.** 13 paths with identical object ids and an empty `git diff`: storage `782c79de…`, settings-shell `8fe33026…`, tokens `3ea90345…`, core `6bfdb0ea…`, event-bus `c68c77fa…`, pet `6594df5e…`, cmdk `a8c733f2…`, features `3f25c84b…`, settings-rest `21f0bbb6…`, dashboard-grid `8e96464c…`, dashboard-widgets `4d65ad16…`, `package.json`, `pnpm-lock.yaml`.
- **Partially protected.**
  - `xai-web-shell`: 5 changed, all §11; 27/27 other paths have identical blob ids.
  - `apps`: 2 changed (`App.tsx` and the new `App.appearance.test.tsx`); 267/267 others identical.
  - Appearance package: 19 changed, all §11; 14/14 other paths identical. Among them are the 11 §11-protected files (`internal/appearancePane.tsx`, `constants.ts`, `appearanceDefaults.ts`, `package.json`, `manifest.json`, the four configs, `docs/design.md`, `docs/dev_log.md`) and the three "Unchanged" test files.
- **Diffs.** The product-scope diff and the full unrestricted diff outside `docs/` (722 entries, 696 under `docs/`) are exactly the 26 §11 files: +4111/−666. Each file matches a §11 category, with 4 new internal modules (the limit is 4).
- **§11 test dispositions.** All 24 "Unchanged" case blocks (AC-RENDER-1/2/4–7, AC-I18N-1–3, TP0–TP7, TB-PREMIUM-1) are byte-identical at both revisions. So are the three "Unchanged" files (AC-DEF, AC-CONST, AC-REG).

### E20 — storage and lifecycle
- `../web-features-recovery-final/storage-check-types-appearance-final-v1-419e56d.log` (`ae923a15…`): exit 0, 0 diagnostics, 315 program files (46 archive, 269 store, 0 elsewhere). This equals the Features final at `5cd63ff`.
- `../web-appearance-recovery-sol/bytes-appearance-final-v1-419e56d.log` (`cf616e93…`): case 006 (`bytes.test.tsx` L271–277: `lifecycleForKey` gives `device`, `device-preference`, `device-recovery`, `retain`, `retain-on-device` for all seven keys, and physical key = logical key) PASSED. It was also PASSED in E7 `fixed1` and E2 `before3`.

### E21–E23 — packages (logs `<mode>-appearance-final-v1-<rev>.log` in this directory)
- **Appearance.**
  - 11 files / 137: `AppearanceController` 49, `AppearanceRetryAll` 27, `focus-ring` 4, `selected-focus` 7, plus the 7 earlier files. Per file equal to Terra r3 (`r3-appearance-test.log` `539cb4bb…`).
  - The required product modules (pane, four internal modules, `usePrefAutosaveAsync.ts`, engine) were loaded from the archive.
- **Shell.** 9 / 115, per file equal to Terra r1 (`shell-test.log` `59a9d0bb…`).
- **Web.**
  - 29 / 178. The required files ran: `App.lazy-init` (8 = APP-LP1–5 + 3 `readLocalPref`), `App.signout` 7, `shell.smoke`, `shell.theme`, the three composition tests, `cmdkIntegration`, `railFeatureFilter`, `departureCoordinator.blocker`, `router.integration`, `router-modules.integration`, `App.appearance` 22.
  - Per file equal to Terra r3 (`r3-web-test.log` `0adfb873…`).
  - The `5cd63ff` control is 28 / 156, per file equal to the accepted Features final. So §10 item 10 passes from both archives.
- **Typecheck/lint.** All exit 0, with 0 diagnostics or problems and 0 pin violations.

### E24 — accepted callers (`compare-accepted-appearance-final-v1.log` `2151a375…`: 54 MATCH, 1 DIFF = F-FD1)
Every suite equals its accepted log in exit status, totals, per-file counts, case names and statuses or ordered titles, console blocks, oracle hash lines and PRECONDITION counts, except Features Sol `downstream` case 012 (§7). Notes:
- **More `boundaries`.** The frozen oracle fell 10/10 this time; it is nondeterministic (F-B002). The corrected oracle (`corrected-full-appearance-final-v1-419e56d.log` `6ea3eb54…`) is 10/10 with 0 RangeError cases or lines, and its names equal batch 31. Under C-FB002 the corrected oracle judges.
- **Sticky** logs equal `post1-f359be6` in ordered titles and `oracle_sha256`.
- **Notifications, Date & Time, settings-rest** equal the accepted `sticky-final-v1-f359be6` logs.
- **settings-shell** equals the Features final at `5cd63ff`; no independent accepted receipt exists.

### E25 — Features native downstream (`native-419e56d-appearance-final-v1-downstream.log` `937572d8…`)
- **PASS.** 344 checks; 140 product checks, all PASS; 0 deferred failures, 0 runtime errors, 0 console warnings; 3 dialogs, as accepted.
- **Comparison with the accepted E13** (`native-5cd63ff-fixed1-downstream.log` `fefe8af1…`): the check-id/kind/pass sequence is identical once the one precondition id is mapped and the audit check is removed (`compare-reruns` row "E25 copy").
- **Bundle provenance.** `fixedDelta` = 11 Features + 26 Appearance files; protected drift 0, archive drift 0.

## 5. Delta audit `24073b5..419e56d` (`delta-appearance-final-v1-419e56d.log` `3ef91d3d…`, 21/21 assertions, 18/18 harness)

**5.1 Source.**
- **The diff is exactly three files**, both product-scoped and in the full diff outside `docs/`:
  - `M packages/xai-web-settings-appearance/src/styles.css` (+22/−0);
  - `A …/src/__tests__/AppearancePane.focus-ring.test.tsx` (+169);
  - `A …/src/__tests__/AppearancePane.selected-focus.test.tsx` (+331).
- **Append-only.** The product commits are `5bbf473` then `419e56d`. At each step `styles.css` starts with its predecessor byte for byte.
- **The appended text, comments removed, is exactly two top-level rules:**
  - `.appearance-pane .slider-row input[type="range"]:focus-visible { outline; outline-offset: 2px }`;
  - `.appearance-pane .accent-sw.active:focus-visible { outline; outline-offset: 4px; box-shadow: 0 0 0 2px var(--text-1) }`.
  - There are no at-rules and no `!important`.
- **The new tests are inert in production.** No non-test, non-Markdown file under `apps/` or `packages/` references them.

**5.2 Production bundle** (`vite build`, the archive's own `build` script; VITE_* variables: none present; private `node_modules`).
- **Sizes.** Each revision emits 32 files: 12 `.js`, 6 `.css`, 11 `.map`.
- **JavaScript.**
  - The multiset of `.js` SHA-256 values is identical. 11 files keep their name and bytes.
  - The entry chunk keeps its bytes (`ba1a354e628d98fc…`) but is renamed `index-BqSMclxF.js` → `index-uLn9obA9.js`, because Vite folds the CSS a chunk imports into its file-name hash.
- **CSS.** The only CSS change is the renamed entry stylesheet (`index-CjQjEzbp.css` `3553424d…` → `index-BvZai5Q-.css` `73615926…`). It is a pure insertion of exactly the two minified rules, at offset 9180.
- **Other files.** `index.html`, `.vite/manifest.json` and the entry chunk's source map are identical once the two renamed names are substituted.
- **Provenance.** 695 source-map sources: 531 in the archive, 164 in the store, 0 virtual, 0 elsewhere, 0 from a checkout.
- **Conclusion:** the production JavaScript is byte-identical, and only one file name differs, for the stated reason.

**5.3 The bundles the native evidence executed.** These were rebuilt with the frozen runners' exact esbuild options, fixtures and layout; the fixtures and runners equal the hashes logged by the original runs.
- **The bundle text depends on depth.** It carries `../…` module comments whose length depends on the snapshot directory's depth. So the earlier revision is rebuilt until the logged hashes are reproduced exactly.

| Native evidence | Logged at `24073b5` (JS / CSS) | Reproduced at depth | `419e56d` JS | `419e56d` CSS delta |
| --- | --- | --- | --- | --- |
| E9–E11 `verify-native-fixed.mjs` | `be21e32d…` / `d58dfc44…` | 10 | `be21e32d…` (identical) | +9 lines = the two rules (`60ce850a…`, equal to the CSS batch 50 logged at `419e56d`) |
| E12/E13/E26 `verify-native-host-retryall.mjs` `fixed` | `4474593b…` / `560080db…` | 9 | `4474593b…` (identical) | +9 lines = the two rules (`f31c5664…`) |
| E12 variant `fixed-coord` | `1b43c073…` / `560080db…` | 9 | `1b43c073…` (identical) | same |

- **The F1 bundles behave the same way** (`diagnostics/f1-bundle-depth-appearance-final-v1.log` `eb2972a6…`). For all five F1 fixtures the JS is identical across the two revisions at every depth from 8 to 12. Batch 42's logged hashes reproduce at depth 10, and this batch's at depth 9.
- **So the different JS hashes in the E16/E17 logs are a run-environment artifact**, not a product difference.

**5.4 What the CSS delta can and cannot affect.**
- **What it can affect.** Both rules match only an element that is `:focus-visible` inside `.appearance-pane`:
  - the font-scale slider;
  - the selected accent swatch.

  They set only `outline`, `outline-offset` and `box-shadow`. Those are paint properties. They take no layout space and add no scrollable overflow, and outlines and box-shadows are not part of hit-testing. The delta can therefore change only the painted pixels around those two controls while they hold keyboard focus.
- **What it cannot affect:** DOM, storage bytes, events, attributes, focus order, which element matches `:focus-visible`, `elementFromPoint` hit-tests, `getBoundingClientRect` geometry, scroll extents, and computed `display` or `pointer-events`.
- **The E9–E13/E26 runners read none of what it can affect:**
  - they have no outline, box-shadow or pixel comparisons;
  - their `getComputedStyle` reads are `display` and `pointerEvents`;
  - `:focus-visible` is read only through `matches()`.
  - Their E13/E26 screenshots are manual-review records of other controls.
- **Where focus pixels are evidence:** E14–E15, which ran on `419e56d` and passed (`2696855`).

**5.5 Carry-over.** E9, E10, E11, E12, E13 and E26 (produced at `24073b5`) carry over to `419e56d`. The product delta is two paint-only rules and two inert tests, the JavaScript those runs executed is byte-identical, and nothing they asserted can observe the delta. Final acceptance reviews this carry-over (control plane, batch 46 ruling item 4).

## 6. Cheap reruns at `419e56d` vs `24073b5` (`compare-reruns-appearance-final-v1.log` `143afeba…`: 26 MATCH, 0 DIFF)

- **E7 (Sol).**
  - **Same case names and statuses as `fixed1`** in `bytes` 65/65, `fields` 89/89, `reset` 34/34, `queues` 56/56, `host` 33/33 and `retry-all` 48/48. The `oracle_sha256` lines are equal and PRECONDITION is 0. The four ruling-5 cases pass.
  - **Frozen `continuity-export` 24/26.** Exactly cases 006 (OE-1) and 007 (OE-2) fail, with first lines identical to `24073b5`.
  - **Corrected copy 26/26** (`d2ce51d3…`). Its names equal the frozen file's, so the adjudicated result is 26/26 (OE ruling).
  - **`original` 185/185.** All 174 `24073b5` names are present and PASS. The 11 extra cases are exactly those of the two new guard test files.
- **E8.** Parent host 33/33, identical case by case (`e0105168…`).
- **E16.** All 12 PASS with unchanged runner hashes.
  - The check sequences (id, kind, pass) are identical to `fixed1`: 62/62/62, 31, 72, 72, 90, 98, 78, 183, 105 and 102 checks. So are the verdicts and the outcomes (excluding `staleCommits`, as batch 42 did) and the recorded product-file hashes.
  - No log mentions `Invalid blocker state transition`, and runtime errors are 0. The JS bundle hashes are explained in §5.3.
- **E17** (K-1 copy).
  - `selfcheck` is harness-valid with 135 checks (134 + audit). `appearance` is fixed-pass with 123 checks (122 + audit); a1–a4 are all `fixed-pass`, and the F1 signature is 0.
  - Without the audit check, the sequences equal the frozen `fixed1`; with it, they equal K-1 `k1corr1`. The audit saw 2 = 2 and 3 = 3 presses.

## 7. Frozen finding F-FD1: the Features Sol `downstream` oracle seeds an out-of-domain background tone

**Facts.**
- **Logs.**
  - `../web-features-recovery-sol/downstream-appearance-final-v1-419e56d.log` (`647ce30c…`) and its v2 (`07597a7a…`) are 14/15. So is `downstream-appearance-final-v1-24073b5.log` (`0257de07…`).
  - The only non-pass is case 012, "H6 §10.5 after a full reset the App's accent hue, background tone, rail position, AppRail order and DesktopPet id and position, and their bytes, are unchanged". It is `FAILED PRECONDITION`: "the App displays the seeded appearance, rail order and pet".
- **What differs.** The observed display equals the oracle's `SEEDED_DISPLAY` in every field except `bgTone`: `null` (default), where `"sage"` was expected (`downstream.test.tsx` L164, L186).
- **Every other case passes.** That includes 011 and 013–015, which seed the same `"sage"` and assert unchanged appearance, rail, pet and bytes through a Features reset.
- **Cause, by contract.** r3 §2 (`:169`) places `"sage"` outside the strict domain. §5 item 2 (`:494–511`) lists `xai_bg_tone` `sage` as malformed: the field is unavailable, displays and applies its default, and its bytes are never rewritten. H7 (`:1101`) is the before behaviour this caller had to remove: "`xai_bg_tone` `sage`/`neon` reach `<html>`". The frozen Appearance Sol oracle asserts the refusal (`fields.test.tsx:277`), and it passes at `419e56d` (E7).
- **Diagnostic.** `diagnostics/features-downstream.corrected.test.tsx` (`7bb5ad3c…`; diff `features-downstream.corrected.diff`) changes only L164 and L186, from `"sage"` to the in-domain, non-default `"mist"`. Run by `diag-features-sol-corrected.mjs` (`cfe596be…`, a copy of the Features Sol runner whose only changes are staging that file and the log path, shown in `diagnostics/diag-features-sol-corrected.diff`):
  - **15/15 at `419e56d`** (`618e0f43…`);
  - **15/15 at `5cd63ff`** (`92d35591…`);
  - the case names equal the accepted log.

**Impact.**
- **Not a product failure.** At `419e56d` the App refuses an out-of-domain stored tone as contract r3 requires, and the Features isolation that case 012 protects holds with an in-domain seed.
- **The accepted count does not reproduce.** The Features Sol downstream count of 15 cannot be reproduced at `419e56d` by the frozen oracle, deterministically, because the oracle encodes the pre-fix pass-through.
- **Ruling needed.** The controller rules whether E24 judges this case by the corrected copy, as OE-1/OE-2 (E7) and C-FB002 (More) were judged. This receipt does not change the frozen oracle.

## 8. E27 enumeration: E1–E26

**Method** (`hashes-appearance-final-v1.log` `d14a4173a62001aa1064a30400d01284f85ca2ba13713afd9b81f28dfab9e3d5`, written by `hash-evidence.mjs`).
- **Derived file lists.** Each committed item's artifact list is every file its producing commit added under the item's directory, so nothing is listed by hand.
- **Re-derived hashes.** Every file's SHA-256 was re-derived: **590 committed artifact entries plus 107 new files**.
- **Provenance.** For each committed artifact, the producing commit is the last commit to touch it and the file is unchanged since. Result: 0 failures, 0 missing, 0 unclassified new files, 0 tracked files modified.
- **Receipt lookups.** Every hash was looked up in the item's receipt and in the control plane.
- I therefore re-derived **all** hashes, not just one per item; the table quotes the principal ones. Paths are relative to `docs/reviews/`.

| ID | Producing commit(s) | Artifacts and SHA-256 (re-derived; receipt match) | Verdict |
| --- | --- | --- | --- |
| E1 | `bd09456` | `web-appearance-recovery-sol/`: `README.md` `575514d5f2c7b7c69a1296a91515d2a48da4efec8cc71d23c06c76b2a9f3805e` (= control plane `575514d5…`), `verify-fixed.mjs` `a451df6aa05fcae5b6fb77266d6ef8d990b4e97b91755c0723f442239fbf5c1e`, `fixture.tsx` `acd26ad8…`, oracles `bytes` `c8338077…`, `fields` `3ff72da5…`, `reset` `3f9f3f86…`, `queues` `1d6c85c2…`, `continuity-export` `776da524…`, `host` `49528aa3…`, `retry-all` `d851c75a…`. 10 files; 9 full matches in the README | present, frozen |
| E2 | `bd09456` | 26 logs. Authoritative `before3`: `bytes` `a4fa76da5c6e08a34d8451040dc6a7c160efb2cf63420d4914e6d1218e0f0956`, `fields` `9c8bd67d…`, `reset` `cb2e1c02…`, `queues` `7084597c…`, `continuity-export` `2582df8f…`, `host` `e12c6068…`, `retry-all` `ba661294…`; `original-before2` `bd61c815…`; plus `before1`/`before2` and `typecheck-static1–4`. 26/26 full matches | present |
| E3 | `b997235` | `web-appearance-recovery-independent/`: `README.md` `61d3b101ed72a96520faad83f9d1f3947991d4e1527b14342b2f34f1e0e111d6`, `host-before3-5cd63ff.log` `2ffcab96a6a1397149c47c1d1dfa89925aa77e09dbc93e0341ac052f5f3cc306`, `verify-fixed.mjs` `6aac3563…`, `host-fixture.tsx` `ba137f58…`, `host.test.tsx` `27589cb6…`, `before1/2` superseded. 7 files; 6 full | present |
| E4 | `72538d1`; supplementary `6b9f0ee` (K-1) | `web-appearance-recovery-native/before-5cd63ff.md` `1040306d539471ede6f1f4e276af482b516f4f605bdc741f2737bebe934452be`, `verify-native-before.mjs` `6c925da3…`, logs `h3` `088396c9…`, `h5` `e8952896…`, `h6` `4a7df4c9…`, `h10` `9bb5fc76…`, `h14` `3d1f5763…`, `h15` `33b8d947…`, `h17` `0677f985…`, 47 PNGs. 58 files; 57 full. **K-1:** `web-native-keyinput-k1/review-k1.md` `18a98325b5ff04960087967260017237fda9d2be67ef97f91bffa26e14eaf04b`, 82 files, 81 full; verdict NO-CONCLUSION-CHANGE (E4 h3/h5/h10/h15 affected-conclusion-unchanged, h6/h14/h17 unaffected) | present; frozen logs authoritative, K-1 supplementary |
| E5 | `72538d1`; supplementary `6b9f0ee` | `web-appearance-recovery-f1/before-5cd63ff.md` `ddd1f4924641b56dbbc03b1dd342fc743f28aab4a22dbace485b22a3f8a55935`, `verify-f1-appearance.mjs` `f570b5c9…`, `f1-appearance-host.tsx` `19b4601f…`, `f1-5cd63ff-selfcheck-before1.log` `01876092…`, `f1-5cd63ff-appearance-before1.log` `6da3c371…`. 5 files; 4 full. K-1: E5 affected-conclusion-unchanged | present |
| E6 | **r1** `24073b5` + `4874170`; **r2** `5bbf473` + `0d34bf2`; **r3** `419e56d` + `5766c1e` | **r1** `web-appearance-recovery-terra/implementation.md` `6e07573a8a5881155be91cf002ba27624c9911497c285c91fb0806f747eb5e58` and 9 logs (for example `appearance-test.log` `f99fc194…` 126/126, `shell-test.log` `59a9d0bb…` 115/115, `web-test.log` `74a9d29f…` 178/178). r1's record lists commands, exits and counts but no hashes, so this receipt supplies them (hashes log). **r2** `implementation-r2.md` `3aa3a24c…`, 6 logs, 6/6 in the record (`r2-appearance-test.log` `4e2ee96b…` 130/130). **r3** `implementation-r3.md` `c6bdb848…`, 6 logs, 6/6 in the record (`r3-appearance-test.log` `539cb4bb…` 137/137, `r3-web-test.log` `0adfb873…` 178/178). **Product:** the 26 §11 files at `419e56d`, 26/26 equal to the E19 log (for example `App.tsx` `24461a52a34c83d9e9e51dc92d99db6d76e4c56435bec3e5293e0937a8cc935a`, `styles.css` `cd95e4a9…`, `internal/appearanceController.tsx` `64d6c8b7…`, `Topbar.tsx` `87b24334…`). `git diff --name-only 5cd63ff 419e56d -- apps packages package.json pnpm-lock.yaml` = the 26 §11 files (E19) | present |
| E7 | `31d6335` (at `24073b5`) + basis `26cfce8` (OE); rerun this batch | `web-appearance-recovery-sol/fixed-24073b5.md` `59b8b56fb6765ea35d34a98b5c51a01f0fb4914c9c9193c617bfb8490ef6b149`; `fixed1` logs `bytes` `a4588ba5…`, `fields` `dc35680f…`, `reset` `5a72a30b…`, `queues` `b7ec55fe…`, `continuity-export` `bcff6ee0…`, `host` `d4c13cf8…`, `retry-all` `4a20985a…`, `original` `595b96ed…`; corrected `corrected-fixed1-24073b5.log` `4c0f4051…`. OE: `review-oe.md` `63e7eed0313baebb5255a8aa1144ba66a30bef0e83426377d40418d2dacc220b`, `continuity-export.corrected.test.tsx` `6e9c7def…`, 15 files. **Rerun at `419e56d`:** `bytes-appearance-final-v1-419e56d.log` `cf616e933931eda06ffa7cd08e886de74322a8573e28cfee13b3d26fe11bcfbf`, `continuity-export` `ecb2cf50…`, `original` `946c8481…`, corrected `d2ce51d3…` (§6) | PASS under the OE ruling (at both SHAs) |
| E8 | `31d6335`; rerun this batch | `web-appearance-recovery-independent/host-fixed1-24073b5.log` `b2425a58806178d0f89a1966a19ce78996191ac759e6e5a99a306b2725b1c4b1`; rerun `host-appearance-final-v1-419e56d.log` `e010516873a940f6e61b997a1086a97b4a2b0b1e62beb1c81e43c492c6eae334` | PASS (both) |
| E9 | `3419542` | `web-appearance-recovery-native/review-controls-reset-export-24073b5.md` `287477b8b4f4a5a4304d6117dd495e40c467d6af18fe4addaa621ef9c82e55c0`, `native-24073b5-fixed1-controls.log` `ccf7acb2d3152e8b1db7340dc9a60185d38c40c5a99362e0e7f4f04ca87384fa`, `verify-native-fixed.mjs` `62491556…`, fixture and prelude. 5 files | PASS at `24073b5`; carried over (§5) |
| E10 | `3419542` | `native-24073b5-fixed1-reset.log` `5b6fe71481c0049694f4919b0c1991678b6d125263d9b3efa951448176157809` | PASS; carried over |
| E11 | `3419542` | `native-24073b5-fixed1-export.log` `c3ac58b0e1d6096525c28991f46b5b26e6762e4fe2ca69a6625a7481a20e3e9c` + 9 disk JSONs (for example x5 `e5912d04…`). 10 files | PASS; carried over |
| E12 | `32e6753` | `review-host-downstream-retryall-24073b5.md` `ea10ba23e2c0ba6df2d55a2d066e50c432430a6b37a9f758b2a8b63ac3a00020`, `native-24073b5-fixed1-host.log` `57ba2c11dc53391831f64d666a7211dbcee79ed95be828b388ccff6eeb1a0d06`, `verify-native-host-retryall.mjs` `8af7adf4…`, fixture, prelude, export JSON. 6 files | PASS; carried over |
| E13 | `32e6753` | `native-24073b5-fixed1-downstream.log` `8da81f7e0101bae29e9c98fc33916afe84f66bbc4573c4f785e0247cf1eaa472` + 17 crash PNGs (for example `accentHue-Infinity-en` `08b64524…`). 18 files | PASS; carried over |
| E14 | `2696855` (PASS at `419e56d`); history `5307b6f` (FAIL at `24073b5`, F-APP-1) and `bacdbbc` (FAIL at `5bbf473`, F-APP-2) | `review-visual-keyboard-419e56d.md` `89ee14cdca69bf91e5c7fa117572a5dd9e17f51bdd2cbec616cb3910af06a0cc`, `native-419e56d-fixed1-visual-en.log` `0e8e642b…`, `-visual-zh.log` `43097916…`, runner `verify-visual-keyboard-419e56d.mjs` `d5fc3262…` and its diff, PNGs; 161 files with E15. History: `review-visual-keyboard-24073b5.md` `f0d6e7af2b2c4f44a9e33b93745ce74dd30f7cfa1599b10418afbae0cf0e9fd4` (29 files), `review-visual-keyboard-5bbf473.md` `7095689bf4f97dc81bd9213841fec13b0223128746d8c4f69c12aa32fe775ace` (77 files) | PASS (`2696855`); the two FAILs kept as history |
| E15 | `2696855` | `native-419e56d-fixed1-keyboard-en.log` `2c96feb68ae200a4232981cfa79cc13bbefaf04e59abba533e0b57e9a8e7d486`, `-keyboard-zh.log` `cfe5d63f71368fa3c8f76c25d57fff0e180348ab404a3e1868615c9f01ffca9e` and keyboard PNGs | PASS |
| E16 | `31d6335` (at `24073b5`); rerun this batch | `web-sticky-recovery-f1/f1-24073b5-sticky-fixed1.log` `2d72ef3dabc4613557a65712c2f6508da0a1f0dc20f98469938e235cb43455c1` (and 9 more), `web-features-recovery-f1/f1-24073b5-features-fixed1.log` `3920208e…`. Rerun: `f1-419e56d-sticky-appearance-final-v1.log` `b610ed8c76af343b523e4616607a9b53de55989edb53d3750566063b8b506e8e`, `race` `227ba931…`, Features `68e80ec3…` (12 logs) | PASS (both) |
| E17 | `31d6335`; K-1 `6b9f0ee`; rerun this batch | `web-appearance-recovery-f1/f1-24073b5-appearance-fixed1.log` `815196e8533fd70fe7104866d7de96215696e8ac708f2d13715c555e2ff0346e`, `-selfcheck-fixed1.log` `14aa082e…`; K-1 `f1-24073b5-appearance-k1corr1.log` `7244ec85…`, `-selfcheck-k1corr1.log` `e7056176…`. Rerun via the K-1 copy: `web-native-keyinput-k1/f1-419e56d-appearance-appearance-final-v1.log` `ef30c1d8b415962d842360b02a2011b90e791303f73d56892e3b742a6ad5e326`, `-selfcheck-…` `b5ed382d…` | PASS (fixed-pass, a1–a4) |
| E18 | this batch | `search-appearance-final-v1-419e56d.log` `aa26ba18cbb1db5377c5f867ad09e911d20ef46094e2ac3d7580b0cead27f00e`; runner `verify-static.mjs` `8f6352fd…` | PASS |
| E19 | this batch | `protected-diff-appearance-final-v1-419e56d.log` `c67781ff16589825025ed267d535aaa82b51dfc71cfe4d6cf7829fc4232a3083` | PASS |
| E20 | this batch | `../web-features-recovery-final/storage-check-types-appearance-final-v1-419e56d.log` `ae923a15e1a42085d7014a541eb9f05728d23d73b2b75b035c67afad40039896`; lifecycle in `../web-appearance-recovery-sol/bytes-appearance-final-v1-419e56d.log` `cf616e93…` | PASS |
| E21 | this batch | `appearance-test-appearance-final-v1-419e56d.log` `4b986489a694c22f3c49e1bbab18f789e94ed081dbb6307e6dbff70f3773f934`, typecheck `f80cfbc7…`, lint `f073633f…`; controls `appearance-unchanged-files` `cd392439…`/`9bdafdf4…` and `-cases` `c3dbdf55…`/`7da93e6d…` (`419e56d`/`5cd63ff`); runner `verify-packages.mjs` `8f9fb90f…` | PASS |
| E22 | this batch | `shell-test-appearance-final-v1-419e56d.log` `ea8348139704afd4176c926e66e8ae716d96e5fae8cde306c4de01a622caa220`, check-types `95786d58…`, lint `f5945835…`; controls `shell-unchanged-files` `2feab553…`/`9bb6a97e…`, `shell-topbar-unchanged` `484e7bf3…`/`5996321e…` | PASS |
| E23 | this batch | `web-test-appearance-final-v1-419e56d.log` `9c8c470225bbae25f2503804bed47af0666a4eee20cd79570d585022ec916c58`, check-types `1de3385d…`, lint `223ab8e3…`; control `web-test-…-5cd63ff.log` `e0ac5106…` | PASS |
| E24 | this batch | 36 logs (§4; hashes log class "E24"), for example Features `downstream-appearance-final-v1-419e56d.log` `647ce30c112fb4192b03bf5f9d3d448d78c9c00d686f6f95835c53dcbbbf4b8f`, More corrected `6ea3eb54…`, Sticky host `ec948594…`; F-FD1 diagnostics (8 files); comparison `compare-accepted-appearance-final-v1.log` `2151a375520ca7e35342defa4e15224af492ab1e51243c1919c59025302b2980` | PASS except **F-FD1** (needs ruling) |
| E25 | this batch | `native-419e56d-appearance-final-v1-downstream.log` `937572d82d950c00af92b7c496924915a988850a64a736941d7a849a551a76d3`; frozen refusal `../web-features-recovery-native/native-419e56d-appearance-final-v1-downstream.log` `273ecc12…`; harness copy `afa313f8…` | PASS (via the copy, §2.3) |
| E26 | `32e6753` | `native-24073b5-fixed1-retryall.log` `dc7f27e859d99408e1607f8628cd5e83e64acd6e6b6132633f7577c09ef75d42` + 4 PNGs (for example `en-partial-result` `967c58bd…`). 5 files | PASS at `24073b5`; carried over (§5) |

**Citations required by the batch.**
- **K-1.** `../web-native-keyinput-k1/review-k1.md` (`18a98325…`): no conclusion changed. Its corrected copy is the E17 runner here.
- **OE erratum.** `../web-appearance-recovery-oracle-erratum/review-oe.md` (`63e7eed0…`). The corrected copy judges cases 006/007 under the E7 ruling: 26/26 at `419e56d`.
- **C-FB002.** The corrected More `boundaries` oracle is 10/10 at `419e56d`; the frozen oracle is recorded as it fell (10/10).
- **F-APP-1/2.** Both were fixed by the two appended rules (`5bbf473`, `419e56d`). The guard tests are in E21 (4 + 7 PASS). E14–E15 PASS at `2696855`.
- **F-APP-3** (Topbar popover options show no focus change). The control plane rules it out of this caller's scope (popover content protected; UX-05 follow-up). It is observed without a gate in the E14–E15 receipt, screenshots #85–#96 and #143–#154. Final acceptance confirms or overturns. This batch did not re-judge it.
- **R-PET.** Judged in E14 (`review-visual-keyboard-419e56d.md`): with the pet hidden, no failure at the five widths; with the pet on, no caller control covered; Retry all is 145.81–729.81 px from the pet box. The rule itself (Features acceptance §5.1, contract A9/§9) is for final acceptance to confirm.

## 9. Development smoke runs, probes and diagnostics (disclosed; not gate evidence)

All development outputs went to the session scratchpad except the committed diagnostics.

- **Development probes (scratchpad).**
  - `probe-downstream-build.mjs`: a build-only replica of the frozen E25 harness's preconditions at `5cd63ff` and `419e56d`. It showed that only the delta precondition fails.
  - `probe-bundle-depth.mjs`: depth dependence of the bundle hash, which found depth 10 for E9–E11.
- **Smoke runs** (`XAI_FINAL_OUTPUT_DIR` / `XAI_NATIVE_EVIDENCE_DIR` redirected):
  - `verify-static` ×1 (pass).
  - `verify-packages` ×4.
    - `appearance-unchanged-cases@5cd63ff` and `shell-topbar-unchanged@419e56d` passed.
    - `shell-test@419e56d` failed only the harness check on `include`: the shell config sets none, so the expectation was corrected to "none configured". The re-smoke passed.
  - `verify-delta` ×2. The first asserted same-named `.js` files and failed on the renamed entry chunk; the criterion was corrected to content identity with byte-identical renames, then passed.
  - E25 copy ×1 (pass).
- **Freeze.** Runner hashes were recorded at 20:23:24Z, before the first official run, and are unchanged.
- **Dry runs of the read-only tools.** `compare-reruns` ×2: the first had two matcher bugs, the `[appearance-package]` name prefix and F1 bundle hashes compared across different depths. `compare-accepted` ×1 and `hash-evidence` ×1.
- **Committed diagnostics.**
  - F-FD1: frozen `downstream` v2 at `419e56d` and v1 at `24073b5`; the corrected oracle at `419e56d` and `5cd63ff` with its generator, the diagnostic runner copy and both diffs.
  - `diagnostics/f1-bundle-depth.mjs` (`9e8719a0…`) and its log (`eb2972a6…`).

## 10. New files (this commit; additions only)

107 files plus this receipt and `hashes-appearance-final-v1.log`. They are classified, with their SHA-256, in the hashes log: E18 2, E19 1, E20 1, E21 7, E22 7, E21–E23 runner 1, E23 4, E24 36, F-FD1 diagnostics 8, E25 7, E7 rerun 9, E8 rerun 1, E16 rerun 12, E17 rerun 2, delta audit 4, comparisons and tools 5.

- **In this directory:**
  - runners, tools, logs, `diagnostics/`;
  - the E25 copies.
- **In existing runners' directories,** each with suffix `appearance-final-v1` (`-v2` once):
  - `web-appearance-recovery-sol` 8;
  - `web-appearance-recovery-oracle-erratum` 1;
  - `web-appearance-recovery-independent` 1;
  - `web-features-recovery-final` 21;
  - `web-features-recovery-sol` 9 (7 + v2 + `24073b5`);
  - `web-features-recovery-independent` 1;
  - `web-sticky-recovery-sol` 5;
  - `web-sticky-recovery-independent` 1;
  - `web-more-recovery-fb002/logs` 1;
  - `web-sticky-recovery-f1` 10;
  - `web-features-recovery-f1` 2;
  - `web-native-keyinput-k1` 2;
  - `web-features-recovery-native` 1.
- No existing file was modified or deleted (hashes log: `tracked_files_modified=0`).

## 11. Not verified / limitations

- **jsdom and headless Chrome only.** Not Tauri, synthetic accounts, no StrictMode; dependencies reused read only (the lockfile gate is a consistency check).
- **Not rerun here.** E9–E13 and E26 are carried over by the delta audit (§5), not rerun. E14–E15 are cited (`2696855`); their screenshots were hash-checked, not re-inspected.
- **Single runs.** Each unit ran once (F-FD1 twice). Timing-dependent defects cannot be excluded by one pass; the frozen More `boundaries` oracle remains nondeterministic (F-B002).
- **The E25 and E17 deviations** (§2.3) are disclosed for acceptance review. Transport stayed WebSocket.
- **Terra's E6 self-reports** are corroborated by the independent counts (E21–E23 equal r3/r1 per file); they were not observed live.
- **F-FD1** needs a controller ruling. This receipt does not modify the frozen Features oracle.

## 12. Remaining boundary

- CP-APPEARANCE-01 stays `verification_pending` until independent final acceptance (batch 52). That review must reconcile every §13 row and §14 item: source, before failure, fixed result and user surface.
- It must also confirm or overturn:
  - the F-FD1 ruling;
  - the E25 copy and the E17 K-1 copy;
  - the transport deviation;
  - the E9–E13/E26 carry-over;
  - R-PET, the OE corrected-copy use, the K-1 conclusion, F-APP-3 out of scope, the Topbar breakpoint erratum and the Space tolerance (control plane).
- Acceptance would not close any 312 item, and would not authorize deployment, release or Web→Desktop sync. Any Desktop flow needs the ADR-0013 D3 gate.
