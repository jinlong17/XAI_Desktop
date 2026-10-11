# AppRail order recovery Sol before oracles (CP-APPRAIL-01, batch 56)

**Verdict: FROZEN.** This directory freezes the Sol jsdom business oracles for the AppRail order caller against the before product `419e56d`, before any implementation exists. It covers contract r1 §15:

- **E1:** the oracle files and runner with a SHA-256 receipt, the lockfile gate, the F-B002 spy self-check, the pre-registered corrected copy C-RD1, its staging-runner copy and both diffs.
- **E2:** the before logs of the eight §12 Sol modes, with per-case outcomes for H1–H11, and the Features `downstream` runs at `419e56d` (frozen, C-FD1, C-RD1).

It freezes evidence only. It changes no product source, product test, contract, ledger or control plane. It accepts nothing, does not authorize Terra and closes no 312 item.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol role, isolated worktree `.claude/worktrees/agent-a3a92131069217b4c`. It did not write the contract or any product code |
| Docs base (detached HEAD) | `1094d96776b26c020632823eb84fdb7e8768b489` (control plane batch 56); every log header records `runner_checkout_head=1094d96…` |
| Requested before revision | `419e56d` |
| Resolved commit / tree | `419e56de9f23e4467fea806fbd4a990e1f429941` / `7aabbd832be446aeca1441eff34f2fd35945290a`. Package trees: `xai-web-shell` `372b08be267a7dd7f734c8ff0c770a7ca3a87cf1`, `apps/web` `23f1070ec28841df45d13c12f0523e679f46dcba`. All three equal the contract header |
| Authority | `../web-apprail-order-recovery-contract/contract.md` r1 (`f7726d7`, SHA-256 `b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde`, re-derived), in particular R-1, A1–A11, §5–§10, §12, §13 and §15 E1/E2; `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` "本轮唯一任务" (batch 56) and the CP-APPRAIL-01 row with its 8 controller confirmations |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for all four values: the dependency checkout (`XAI_DEPS_ROOT`), `git show 419e56d:pnpm-lock.yaml`, the extracted archive and the contract gate constant. Every Sol log header records them at lines 12–15 |
| Archive product hash check | Every Sol log header lists 18 archive file hashes (line 17). All 13 files of the contract's header table match it exactly: `AppRail.tsx` `6312caa1…`, `internal/dnd.ts` `a538b51f…`, `registry.tsx` `b621abbe…`, `Topbar.tsx` `87b24334…`, `Shell.tsx` `1f5fc6c7…`, shell `types.ts` `ada0b296…`, shell `index.ts` `c404a971…`, `AppRail.test.tsx` `cbe41791…`, `Topbar.test.tsx` `b3a068ea…`, `App.tsx` `24461a52…`, storage `registry.ts` `dd961a21…`, `layout.css` `9397dc73…`, `departureCoordinator.tsx` `0844a697…` |
| Diagnostic iterations | `before1` for all eight modes. `before2`, which adds observations only, for `domain`, `merge`, `drag`, `field` and `host`. No mode needed a third. See "Iteration history" |

## Files and SHA-256

Every file in this directory except this README (which cannot carry its own hash).

| File | Role | SHA-256 |
| --- | --- | --- |
| `verify-fixed.mjs` | Sol runner (E1) | `e944cb226e3fa342727c913547ff5084e0ad38fad5293ed306cb512bf9f5a4e8` |
| `fixture.tsx` | Shared fixture (E1) | `07c4f87674e5a14d7cbeffc4cd8ae18d0c9d725cfe052ce45b55fb631720c236` |
| `bytes.test.tsx` | Oracle (E1) | `d4827472827f284178944dd621198a39d7b7ffc34be19781714e61f91103d6cd` |
| `domain.test.tsx` | Oracle (E1) | `f7b55802a73251b6eb1b0f0cb0d3d39d798fdb9ff7c472ee4b57a5abca4cea0a` |
| `merge.test.tsx` | Oracle (E1) | `05f6e01081156e2d32076606f2b4f314f33246d6b96b0ab7ffa644a9de8d377a` |
| `drag.test.tsx` | Oracle (E1) | `4be85f28b053eeed2606e8118641c7ffd93b1a078ce298c3343facfc3fd23063` |
| `field.test.tsx` | Oracle (E1) | `21e7b77f7135bb1debe446f48bafdc9f3f4a3a5b1796084094bbac140f995846` |
| `continuity-export.test.tsx` | Oracle (E1) | `b92790b3f989e66b5e3b549995c58abcaee88d5acb700e7f2c31af577f5dd5fc` |
| `host.test.tsx` | Oracle (E1) | `b89a4f6e2ebc12cf4a4952b17deb6ea7c793818198ad16562610f63ec47a4b03` |
| `features-downstream.c-rd1.test.tsx` | C-RD1 corrected copy (E1, A11) | `6c57164ef5040444dad96fbf5933e90b095d465c64bdd6e8e5f3dcb6be2d1c7a` |
| `features-downstream.c-rd1.vs-c-fd1.diff` | C-RD1 against C-FD1: one added line | `bf33200be7aa0180fc7c8de7f0c6c2bb7724162233ff71c0659339741ace55d6` |
| `features-downstream.c-rd1.vs-frozen.diff` | C-RD1 against the frozen Features oracle: three changed lines | `735a177231d7028aad4f4c42fff25eefd932d893690f97624a9b48c8ba66c838` |
| `diag-features-sol-c-rd1.mjs` | C-RD1 staging-runner copy | `7d6e8c3fdce61fb66e7be26ebac9908144401eaa722cea10f86f129dd5cdcbe0` |
| `diag-features-sol-c-rd1.diff` | Staging runner against the C-FD1 staging runner | `4c40b96ea8a6f45db66095203d9117fb3c2e004135376d7114d5ce235ce57b77` |
| `bytes-before1-419e56d.log` | **Authoritative** | `94c87889a14f0a6097b6ad2c70fa92dd145f654d0fa53f0449aa86e4c7ffcc1b` |
| `domain-before2-419e56d.log` | **Authoritative** | `efe8658ec7efea8deb61c5a4afc821bd98e124128dc6cfb7c9951339e8ab6776` |
| `merge-before2-419e56d.log` | **Authoritative** | `9f6b774e883776ee9d73ffc9fc18ae27c642bf72130033e8d473cd1b77e2057e` |
| `drag-before2-419e56d.log` | **Authoritative** | `3df73969687379518111bc96d2677038834c80d3c6b02a9bf5269be7e27d5b25` |
| `field-before2-419e56d.log` | **Authoritative** | `504c34d9c98dc2010929bebaf1573e7687bc0171965cb355c62d4e9bd57a76e5` |
| `continuity-export-before1-419e56d.log` | **Authoritative** | `14c6c566e36cdbd921fb58531b556862c6ba9492e3e6d648dbd3fd6e4b145dd7` |
| `host-before2-419e56d.log` | **Authoritative** | `1d8c588233e65dc0b2cd5224b213e9668ebe454c52b0dcd612da55eafe875a2d` |
| `original-before1-419e56d.log` | **Authoritative** (its only run) | `de227f44c18bc79f72d9bb613c1d46475a5647357a4d2aab48b8cdd6fd3d5d8b` |
| `domain-before1-419e56d.log` | Superseded | `8a82bcfbf36cf7ad927db513a31af2d367d97c69eb5e077241c893c2c8644bda` |
| `merge-before1-419e56d.log` | Superseded | `65af987dd8ed716827b94b6f8e383255100409c21e43655ea9ede71939b5f0e6` |
| `drag-before1-419e56d.log` | Superseded | `3153df6bfd41171abfaca330f0fe05bbbfbb42e7754e186e98d993325f179c74` |
| `field-before1-419e56d.log` | Superseded | `bc051ce2b05a00015fa9467f0a9ab76095f5474bf231d35401f19ba9a656874e` |
| `host-before1-419e56d.log` | Superseded | `a8bc5c340a06b3b3a9674c7494884887d276172b1f4fb5c86e4593006de83026` |
| `typecheck-static1-419e56d.log` | Static check (not a §12 mode) | `bc62b4efb5e86bb8ab1be6700402fadacc44af82563e6a5cadfce64b244716a5` |
| `features-sol-downstream-c-rd1-before1-419e56d.log` | C-RD1 run (E2) | `c8f5ff44c2ca25c6560d6a0321bb96c3a002e7389a4e013f09f7c3c0bf687a4b` |
| `features-sol-downstream-c-fd1-before1-419e56d.log` | C-FD1 run (E2) | `dbfc3a7330ee158d2b1b0eb1f26a5ddd88b52c461afe965f80daac98d81a0cc3` |
| `features-sol-downstream-frozen-before1-419e56d.log` | Frozen Features oracle run (E2) | `856955626108b06a7c05c001c293802a356fe9e69e27ab33b017256be4d1f452` |

**Oracle hashes in the log headers.**
- The `before2` headers (`domain`, `merge`, `drag`, `field`, `host`) carry the same `oracle_sha256` line, equal to the table above.
- The `before1` headers and `typecheck-static1` carry one shared line that differs from the table only for the five files changed in iteration 2:
  - `domain.test.tsx` `9dc5784b574768b1f71c13260aa68aabed9a80322497224e689ebe3cb316b989`
  - `merge.test.tsx` `dd6961f6463db641601a369d5dd135e135d99b888dfee8bbbdc77cb42b50d2c6`
  - `drag.test.tsx` `8a8da1134fceb5a90ec7de7c7453d617d6ffe496ce42c6f953903d31a2e54f17`
  - `field.test.tsx` `440f08929d625558d14dbd3084d22a26e3e899214071419a51dad8f1832c67fc`
  - `host.test.tsx` `e9b64c02373c552775d64ba603572a2467c4b4d909930682cfcbaf13aa7c2bc3`
- So the authoritative `bytes` and `continuity-export` logs were produced by exactly the frozen `fixture.tsx`, `bytes.test.tsx` and `continuity-export.test.tsx`.
- `original` runs only the archive's own tests and no oracle file.
- The runner hash `e944cb22…` and the fixture hash `07c4f876…` are identical in all 14 Sol logs.

## Commands

From the repository root of this worktree. The dependency root is read only: nothing is written, installed, built or checked out there, and no dev server was started.

```sh
DEPS=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop
# Static typecheck of the oracle files inside the archive (executes no product or oracle code)
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-apprail-order-recovery-sol/verify-fixed.mjs 419e56d typecheck static1
# Iteration 1: the eight section 12 modes (bytes, domain, merge, drag, field, continuity-export, host, original)
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-apprail-order-recovery-sol/verify-fixed.mjs 419e56d <mode> before1
# Iteration 2 (observation-only additions): domain, merge, drag, field, host
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-apprail-order-recovery-sol/verify-fixed.mjs 419e56d <mode> before2
# C-RD1 (A11), through its staging-runner copy
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-apprail-order-recovery-sol/diag-features-sol-c-rd1.mjs 419e56d downstream before1
```

**Fixed reruns (E7).** Use the unchanged files with a new suffix, for example `… verify-fixed.mjs <fixed-sha> <mode> fixed1`, and an `XAI_DEPS_ROOT` whose lockfile matches that revision; the runner refuses any other. `all` runs the eight modes in order.

**The frozen and C-FD1 Features runs.** Their committed runners write logs next to themselves, in directories this batch may not touch. So both were executed byte-identical from a scratch mirror of `docs/reviews/` outside the repository, and their logs were copied verbatim into this directory:
- The mirror held `web-features-recovery-sol/{verify-fixed.mjs,*.tsx}`, `web-appearance-recovery-final/diag-features-sol-corrected.mjs` and `diagnostics/features-downstream.corrected.test.tsx`.
- Each file's SHA-256 was checked before the run: `b5ac75fa…`, `downstream.test.tsx` `88cf89c8…`, `fixture.tsx` `f0b5d272…`, `cfe596be…` and `7bb5ad3c…`.
- git read this worktree's object store read only, through `GIT_DIR`.
- The commands were `node <mirror>/web-features-recovery-sol/verify-fixed.mjs 419e56d downstream apprail-sol-before1` and `node <mirror>/web-appearance-recovery-final/diag-features-sol-corrected.mjs 419e56d downstream apprail-sol-before1`.
- They wrote `downstream-apprail-sol-before1-419e56d.log` and `features-sol-downstream-corrected-apprail-sol-before1-419e56d.log`. These are stored here as `features-sol-downstream-frozen-before1-419e56d.log` and `features-sol-downstream-c-fd1-before1-419e56d.log`.
- Their headers record `resolved_commit=419e56de…`, `runner_checkout_head=1094d96…`, the four lockfile hashes and the frozen runner and oracle hashes (`verify-fixed.mjs=b5ac75fa…`; C-FD1 also `diagnostic_runner_sha256=cfe596be…`). The `command=` line shows each runner's own repository-relative path.

## Runner guarantees (`verify-fixed.mjs`)

It is derived from the accepted Appearance Sol runner, with the same archive, gate, pin and guard design.
- **Archive and lockfile gate.** It expands `git archive <resolved commit>` into a fresh realpath temporary directory. It asserts SHA-256 equality of the dependency checkout's lockfile, the committed lockfile, the extracted lockfile and the contract gate.
- **Oracle staging.** It copies the eight oracle files into `docs/reviews/web-apprail-order-recovery-sol/` inside the archive and verifies each copy against its evidence hash.
- **Private node_modules.** Every archive workspace gets its own: 448 read-only third-party links from `XAI_DEPS_ROOT`, and 281 `@repo` links to the archive's own folders. Node and tsconfig `extends` resolution therefore stay inside the archive (46 `extends` checked, none unresolved). The oracle directory links the single `react`, `react-dom`, `@testing-library/react`, `@testing-library/user-event`, `react-router`, `vitest` and `@types/react` instances.
- **Pin and guard.**
  - 75 exact-match aliases map every archive `packages/*` export specifier to the archive file.
  - A guard plugin fails the run if any module is transformed from the dependency checkout's `packages/`, `apps/` or `docs/`, or if an unaliased `@repo` import resolves outside the archive. It records every archive module.
  - Every authoritative log shows `pin_unaliased_repo_imports=0` and `pin_required_provenance_missing=none`. Each Sol mode required 27 product modules from the archive (`bytes` 29: also `dataExport.ts` and `lifecycleDeclaration.ts`); `original` required 5 (shell) and 4 (`apps/web`). They include `AppRail.tsx`, `registry.tsx`, `internal/dnd.ts`, `Shell.tsx`, `Topbar.tsx`, the storage `usePref`/`usePrefAsync`/`prefMutation`/`accountScope`/`storage`, `App.tsx`, `router.tsx`, `RouteGateElements.tsx`, `RouteErrorBoundary.tsx`, `shellRegistrations.tsx`, `composedSettingsRegistration.tsx`, `departureCoordinator.tsx`, `AccountStorageGate.tsx`, `AccountDataGate.tsx`, the Features filter and reader, `AppearancePane.tsx`, `DesktopPet.tsx`, `CommandPalette.tsx`, the event-bus emitter and the auth `session.tsx`/`guards.tsx`.
- **Semantics.** The Sol modes run under the owning package's (`xai-web-shell`) test semantics: jsdom, no globals, its `src/__tests__/setup.ts`. `original` runs two Vitest invocations in one log, each under its own package semantics: the shell tests (shell semantics) and the `apps/web` tests (jsdom, no globals, no setup). Six harness checks run per invocation.
- **Log contents.**
  - `requested_revision`, `resolved_commit`, `resolved_tree` and the package trees;
  - the four lockfile values, the oracle and runner hashes, and the 18 archive file hashes;
  - versions: Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, TypeScript 5.9.2, Node v24.16.0;
  - Vitest stdout and stderr, and a runner summary with one `case NNN PASSED|FAILED [PRECONDITION] | <name>` line per case, followed by the failure's first line;
  - the PRECONDITION count, the harness checks and the module-pin record.
- **Refuses to overwrite.** It checks before archiving, again before writing, and creates the log exclusively.
- **Preserves nonzero exit codes.** It exits with the first nonzero Vitest (or tsc) status, or 2 when Vitest exits 0 but a harness check fails. Every failing mode exited 1; `original` and `typecheck` exited 0.
- **Cleanup.** Vite caches stay inside the temporary archive, which is deleted afterwards. Only React's "not wrapped in act(...)" warning is filtered.

## Before results at `419e56d` (authoritative)

| Mode | Passed | Failed | Total | `PRECONDITION` | Exit | Harness | Authoritative log |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `bytes` | 21 | 5 | 26 | 0 | 1 | 6/6 | `bytes-before1-419e56d.log` |
| `domain` | 1 | 30 | 31 | 0 | 1 | 6/6 | `domain-before2-419e56d.log` |
| `merge` | 4 | 17 | 21 | 0 | 1 | 6/6 | `merge-before2-419e56d.log` |
| `drag` | 8 | 10 | 18 | 0 | 1 | 6/6 | `drag-before2-419e56d.log` |
| `field` | 1 | 23 | 24 | 0 | 1 | 6/6 | `field-before2-419e56d.log` |
| `continuity-export` | 4 | 18 | 22 | 0 | 1 | 6/6 | `continuity-export-before1-419e56d.log` |
| `host` | 7 | 26 | 33 | 0 | 1 | 6/6 | `host-before2-419e56d.log` |
| `original` | 121 | 0 | 121 | 0 | 0 | 12/12 | `original-before1-419e56d.log` |

**Sol matrix.** It has 175 cases: 46 PASS and 129 correct business FAILs.
- The 46 passes are 13 FIXTURE cases (the F-B002 self-check in each of the seven files, the injector, the lock fixture, the harness, the App composition, the drag driver and the merge model) and 33 positive controls or invariants.
- Every failure is an `AssertionError` on a business assertion carrying an `H<n>`, `A<n>`, `P<n>` or `§<n>` tag. No failure is a PRECONDITION, selector, fixture or harness error, no log reports a suite error, and no log reports an unhandled error or rejection.

**`original`.** It has 121 PASS:
- shell 76: `AppRail.test.tsx` 25, `internal/dnd.test.ts` 9, `Topbar.test.tsx` 24, `Shell.smoke.test.tsx` 9, `index-barrel.test.ts` 9;
- `apps/web` 45: `App.appearance` 22, `App.lazy-init` 8, `App.signout` 7, `shell.smoke` 5, `railFeatureFilter` 3.

**Static check.** `typecheck-static1` ran `tsc --noEmit` over the oracle files inside the archive and executed no code. It found 0 oracle diagnostics; 10 product `import.meta.env` typing diagnostics were ignored, as in the Appearance precedent.

## C-RD1 (A11) and the Features `downstream` runs at `419e56d`

**C-RD1** (`features-downstream.c-rd1.test.tsx`) is the C-FD1 copy (`../web-appearance-recovery-final/diagnostics/features-downstream.corrected.test.tsx`, `7bb5ad3c…`, re-derived) plus exactly one added line, `fireEvent.drop(buttons[2]!, { dataTransfer: transfer });`, before case 014's `fireEvent.dragEnd` (line 511).
- `features-downstream.c-rd1.vs-c-fd1.diff` shows exactly one `+` line and no `-` line.
- `features-downstream.c-rd1.vs-frozen.diff` against the frozen `../web-features-recovery-sol/downstream.test.tsx` (`88cf89c8…`) shows three changed lines: C-FD1's two token edits (`sage` to `mist`, lines 164 and 186) and the one added line.

**The staging-runner copy** (`diag-features-sol-c-rd1.mjs`) is the C-FD1 staging runner (`cfe596be…`) with only these changes, all shown in `diag-features-sol-c-rd1.diff`:
- the staged file and its recorded hash: the `diagnostics` constant points to this directory, `CORRECTED` is `features-downstream.c-rd1.test.tsx`, and `CORRECTED_SHA256` is `6c57164e…`;
- the log path, `features-sol-<mode>-c-rd1-<suffix>-<rev>.log`;
- the header's `command=` line, which names this file;
- a leading comment block.

**Results at `419e56d`.** All three match the contract §13 predictions exactly.

| Oracle | Result | `PRECONDITION` | Exit | Contract prediction at `419e56d` | Log |
| --- | --- | --- | --- | --- | --- |
| Frozen Features `downstream` | 14/15. Case 012 fails PRECONDITION (F-FD1: `xai_bg_tone` `sage` is out of domain, so `bgTone` displays `null`), lines 248–249 | 1 | 1 | 14/15 (case 012, F-FD1) | `features-sol-downstream-frozen-before1-419e56d.log` (totals line 230) |
| C-FD1 | 15/15 | 0 | 0 | 15/15 | `features-sol-downstream-c-fd1-before1-419e56d.log` (totals line 214) |
| C-RD1 | **15/15**. Case 014 passes, because the added `drop` has no handler at `419e56d` and `dragOver` already wrote | 0 | 0 | 15/15 | `features-sol-downstream-c-rd1-before1-419e56d.log` (totals line 214) |

## Hypotheses

`L<n>` is a line of the named authoritative log. Each case line is followed by its failure's first line. The `SOL-OBS` lines are non-asserting observations recorded before the case's assertions.

| ID | Disposition | Evidence |
| --- | --- | --- |
| H1 | **Confirmed** for all seven values | `domain` L2514–L2527: for each of `{}`, `{"tasks":1}`, `1`, `0`, `-1`, `true` and `false` the result is "/app/tasks must not render the route error boundary: expected 'Route Error (app): prefOrder is not i…' to be null". Observations L34, L38, L43, L48, L55, L60 and L65 record "Route Error (app): prefOrder is not iterable" on `/app/tasks`, `/app/settings/appearance` and `/app/dashboard`, again on `/app/settings/appearance` after a reload, with no rail and no status (`"status":false`) anywhere, so no UI can repair it. The ZH case (L2550) and the drag and Reload cases over `{}` (L2552, L2570) fail on the same route error. **Beyond H1:** `{}` or `1` written by another document while the App runs also crashes it (L2560/L2562; observations L135, L140), and the export shape over `{}` fails the same way (`continuity-export` L506–L507) |
| H2 | **Confirmed** | `field` L644–L645: "the latest dropped order stays displayed: expected [ 'statistics', 'countdown', … ] to deeply equal [ 'countdown', 'meditation', … ]", so the rail returns to the stored order. Observation L35 shows, after a quota-failed drop, `status:false`, `retry:false`, `unloadWarning:false`, and bytes equal to the old order. A throwing `setItem` and a throwing write-time `getItem` behave the same (L646–L649). Every recovery case (L654–L663, L684, L688) and every export case (`continuity-export` L502–L528) fails on the same silent revert |
| H3 | **Confirmed** | `drag` L315–L316: "zero storage attempts across two order-changing dragovers: expected [ …(2) ]". Observation L37 shows two `setItem` attempts during dragover (`beforeDrop`) and none at the drop (`atDropAndDragend: []`). One-step drags (L313–L314), the standalone AppRail (L317–L318), gap and self drops (L325–L328) and the mid-drag order change (L336–L337) all write during dragover |
| H4 | **Confirmed** | `drag` L319–L324: dragEnd without a drop, a release on the main content and a drop on a text input each make attempts ("expected [ Array(1) ] / [ …(2) ]"). Observation L44 shows the cancelled preview persisted in the bytes and in the rail |
| H5 | **Confirmed** | `bytes` L259–L268: with Boards hidden, three hidden modules, `ghost-module`, `settings` and absent bytes with Boards hidden, the written bytes prune the non-visible id (for example L264 "expected '["ai","board",…' to be '["ai","ghost-module","board",…'"). `merge` L671–L698: P2 fails for each of the eight toggleable modules, both three-hidden sets, unknown ids, `settings` and both P7 cases. End to end through the real Features pane (L703–L704), observation L116 shows the written order without `board`, and after re-enabling Boards it displays **last** (`afterReenable` ends with `"board"`), not at index 2. App-level case L705–L706 |
| H6 | **Confirmed** | `field` L664–L665 and L666–L687: "the held per-key lock keeps the bytes unchanged: expected '["countdown",…' to be '["statistics",…'": the bytes change immediately while `prefMutationLockName("xai_rail_order")` is held by the test. A missing or rejected Web Lock is also ignored (L650–L653). Sol-layer lifetime cases fail the same way (`continuity-export` L490–L499) |
| H7 | **Confirmed** | `domain`: `"tasks"`, `[1]`, `["tasks",2]`, `[null]` and `[["tasks"]]` are silently **filtered** (L2528–L2537; observations L70–L90). The string is iterated per character, so the rail shows R order and not the default. `null`, `[tasks` and `""` are silently **defaulted** with no source alert or Reload (L2542–L2547: "shows the Topbar rail status with the source accessible name …: expected null"; observations L105–L115 show `"status":false` on every route). The next drag silently overwrites the bytes: L2554–L2555 "expected '["tasks","board","dashboard","ai",…' to be '[1]'" |
| H8 | **Confirmed** | `domain` L2538–L2541; observations L95 (`["tasks","tasks",…]`: Tasks rendered twice) and L100 (`["board","tasks","board",…]`: Boards rendered twice). A drag over the duplicate silently overwrites it (L2556–L2557). Written by another document, the duplicate also renders twice (L2564–L2565, observation L143) |
| H9 | **Confirmed** | `host`: there is no Topbar status for an unsaved rail order (L571 and every §7.2 case through L619, "the Topbar rail status for an unsaved rail order: expected null"). `beforeunload` is not prevented (L591: "expected { warned: false, attempts: +0 } to strictly equal { warned: true, … }"; also L569). Sign-out runs no rail step in either branch (L595–L604, L607–L616: "exactly one confirm with the rail text: expected []"; ZH L617). Observations L62, L67, L80 and L85 show sign-out from `/app/tasks` **proceeding** without a rail prompt (`redirect:true`, `identityInvalidated:true`, `backend:1`) |
| H10 | **Confirmed** | `domain` L2548–L2549: a throwing `getItem("xai_rail_order")` shows no source status. Observation L118 shows the silent default display. A drag over it is a silent no-op: the rail reverts (L2558–L2559) |
| H11 | **Refuted as a defect (positive control PASS)** | `bytes` L270: a committed order in another document updates the idle rail live, and a removal there displays the default, with zero writes |

Every confirmed failure is a requirement that the same unchanged assertions must PASS on the fixed product. No hypothesis was refuted except the H11 control, which is meant to pass.

**Further correct FAILs without a hypothesis number** (section requirements):
- §6.7: R changing mid-drag still writes (`merge` L701–L702, `drag` L334–L335).
- §5.5: uncertainty and conflicts are not reported (`field` L676–L683).
- §8: no export (`continuity-export`).
- §10.3 and §10.7: one controller and isolation, unreachable without a status (`host` L622–L625).

## Positive controls PASS at `419e56d` (contract §12)

| Positive control | Evidence |
| --- | --- |
| Zero-write mount | `bytes` L251 (three host-row-a routes, the Topbar popover open and closed on the Appearance route writing no key, and a reload: zero set/remove on `xai_rail_order`; observation L44 shows no other-key writes), L252 (a seeded custom order on four routes), L253 (re-renders from a Features toggle, a rail-position change and a language change from another document; observation L49), L254 (standalone AppRail) |
| Absent and `[]` displays | `bytes` L248 (12 defaults, then Bookkeeping and Metrics, with no status and no warning), L249 (`[]`: R order), L250 (seeded and unknown/non-rail ids) |
| Final bytes of a successful all-visible drag (P6) | `bytes` L255–L258 (over a custom order, absent bytes and `[]`, and a two-step drag); `merge` L699–L700 |
| Rail-click navigation | `drag` L339 (suppressed during a drag, navigates afterwards); also L338 (`dragging` class) and L329–L333 (unchanged order, gap-only, external drop) |
| Sign-out without a rail draft | `host` L593 and L605 (fallback and coordinator: zero confirms, sequence completes); L594 and L606 (with an Appearance draft only, the confirm list is exactly the Appearance text) |
| H11 | `bytes` L270 |
| f3 | Parent-owned (E5, rail F1-shape runner); not part of this batch |
| The `original` mode | `original-before1-419e56d.log` L611 (121/121) |
| §10 item 10 tests in the `original` scope | The shell's `AppRail`, `internal/dnd`, `Topbar`, `Shell.smoke` and `index-barrel`; `apps/web` `App.appearance`, `App.signout`, `App.lazy-init`, `shell.smoke` and `railFeatureFilter`. The rest of §10 item 10 (`event-emit`, `registry`, `AvatarMenu`, `SignOutConfirmDialog`, the composition, `cmdkIntegration`, `departureCoordinator.blocker` and router tests, and the storage tests) belongs to E21/E22 (final verifier) |
| Lifecycle classification | `bytes` L247: device ownership; device-preference, device-recovery, retain, retain-on-device; physical key = logical key; registry entry `json`/1/`xai-web-shell`/`shell`/12 defaults; lock name `xai:pref:v1:xai_rail_order` |

**Also passing at `419e56d`** (invariants that bind the fixed product):
- byte compatibility through the unchanged legacy `getPref` and `exportDeviceRecoveryData()` (`bytes` L269);
- rail markup preserved (L271);
- Features toggles, a toggle failure with Retry, and the Features Reset to defaults make zero attempts on the order key (`host` L621);
- an unrelated held account lifecycle lock never delays a rail write, and rail operations touch no account key or lock (`continuity-export` L500–L501; observation L46: no product lock at `419e56d`);
- no Export without a draft (L512);
- no status or warning in a clean state (`host` L568);
- `§6.5` at most one write per gesture (`drag` L331–L332).

## F-B002 self-check

- **Rule implemented.** The attempt-counting wrappers on `Storage.prototype` record the attempt and then delegate exactly once to the captured native method; a faulted attempt throws before delegating. They never call `accountScope.physicalKey`, `getPref`, `readRawPref`, any other Storage method or any product helper.
  - `xai_rail_order` is a device key (physical key = logical key).
  - Its lock name `LOCK = prefMutationLockName("xai_rail_order")` is computed once at module load, before any wrapper is installed, and asserted equal to `xai:pref:v1:xai_rail_order`.
  - Account-key isolation uses prefix constants (`xai:account:v1:`, `xai:demo:v1:`) evaluated outside the wrappers.
  - Bytes are read and seeded through the captured native methods, outside the counters.
- **Proof in every oracle file.** Each of the seven test files runs `storageSelfCheck()` as its first case. With tripwires installed on `accountScope.physicalKey` and `accountScope.capture`, ten wrapper calls on `xai_rail_order` (plain, value-faulted, after-remove-armed and totally denied) must delegate `[1,1,0,1,1,0,1,0,0,0]` times, with zero nested wrapper entries and zero tripwire hits.
  - Result in every authoritative log, at L31: `{"nested":0,"tripwire":0,"delegatedPerCall":[1,1,0,1,1,0,1,0,0,0]}`, PASS.
  - The self-check cases: `bytes` L241, `domain` L2513, `merge` L669, `drag` L312, `field` L643, `continuity-export` L489, `host` L567.
- **Per-case guard.** A re-entrancy depth counter runs inside the wrappers for every case, and `teardown()` throws a `PRECONDITION` if any case saw a nested Storage call. None did: zero PRECONDITION lines in 175 cases, at both iterations.

## Fixture validity proof (`bytes` FIXTURE cases, L241–L246)

- **Storage injector** (L242). Get, set and remove attempts are logged in call order before delegation.
  - A faulted `setItem` throws `QuotaExceededError` (or a plain `Error` for the generic fault), is logged as thrown and never reaches storage.
  - One-shot faults stop. A value-keyed after-set fault arms only after its exact value. A value-specific write fault fires only for its value.
  - Total denial fires for all three operations, and a disarmed fault stops.
  - Only `localStorage` is counted.
- **Exclusive Web Lock fixture** (L243).
  - Grants are asynchronous. A held name keeps exactly one queued product waiter, granted only after release, while an independent name is granted at once.
  - Deny rejects. A programmed hold grants N acquisitions and holds the next. The missing capability is explicit.
  - The test can exclusively hold the real `xai:pref:v1:xai_rail_order` lock.
  - Unsupported request shapes become `PRECONDITION` errors in teardown. None occurred, so no accidental `lock-unavailable` result was possible.
- **Recorders** (L244). A real A→B transition advances the epoch while `xai_rail_order` stays unscoped. Also observable: the `window.confirm` recorder, the StorageEvent counter (oracle-sent events excluded from product counts), the bus spies, the `beforeunload` probe, and the download harness (object URL, anchor, click, revoke).
- **Production App composition** (L245).
  - The substituted `useWebAuthSession` served `App` and its gates, with no route error.
  - The Topbar, the Shell, the AppRail with its `.rail-bottom` pet button outside `.rail-items`, and DesktopPet all render. AccountDataGate activated account A, and there were zero network attempts.
  - The production rail registry equals the contract's 14 ids in order, and `settings` has `showInRail: false`.
  - The real Features filter removes exactly a hidden module.
- **Drag driver** (L246).
  - The full sequence dragstart → dragenter → dragover → drop → dragend reaches the document in order, on real rail nodes, with one DataTransfer stub.
  - dragenter targets the hovered slot's button.
  - The oracle's expected preview is the §6.2 reorder.
- **Merge model** (`merge` L670). The oracle's own A2 merge, D(S, R) and property checker are verified on hand-checked examples, including rejecting a pruned value.
- **Selectors.** Controls are reached only through the §5 stable selectors and accessible names:
  - `.app-rail .rail-items .rail-btn` by accessible name;
  - `[data-testid="rail-order-status"]` together with its normative accessible name;
  - `rail-order-panel`, `rail-order-message`, `rail-order-retry`, `-discard`, `-export` and `-reload`, each with its normative accessible name;
  - the Features switches by `[data-feature-id] [role="switch"]`;
  - the avatar menu and sign-out dialog by role and name.

## Oracle inventory by §12 mode

| Mode | Coverage |
| --- | --- |
| `bytes` (26) | Six FIXTURE cases. Lifecycle classification. Absent, `[]` and seeded displays. Zero-write mounts (three routes, popover, reload, seeded, re-renders, standalone). Exact bytes for P6 over a custom order, absent bytes, `[]` and a two-step drag. R-1 with one and three hidden, `ghost-module`, `settings`, and P7 over absent bytes. Byte compatibility (legacy `getPref`, device recovery export). H11. Markup |
| `domain` (31) | All 17 §5 item 2 values at load, each on the three host-row-a routes (no route error, D(DEFAULT, R), source status with Reload only, panel message and role, no warning, zero writes, bytes unchanged). A throwing read. ZH status and panel. A drag over `{}`, `[1]`, a duplicate and an unreadable source (a refused failed draft, Retry refused, Discard back to the default with the source status returning, bytes unchanged). Four malformed values written by a second document while idle, and `{}` over a drafted field (preserved conflict). Reload after an unobserved repair and after an observed repair |
| `merge` (21) | FIXTURE checks. P1–P5 with each of the eight toggleable modules hidden. Two three-hidden sets. Unknown ids. `settings` with a hidden module. P7 twice over absent bytes. A `[]` base. P6. A non-permutation input (R changing mid-drag). R-1 end to end through the real Features pane. R-1 in the production App |
| `drag` (18) | H3 one-step, two-step and standalone. H4: dragEnd without a drop, a release on the main content, a drop on a text input. A drop on a gap and on the dragged button. An unchanged order. A gap-only gesture. At most one intent per gesture. Successive gestures. An external drop. R changing mid-drag. The committed order changing mid-drag. The `dragging` class. Click suppression |
| `field` (24) | Failure kinds: quota, a throwing `setItem`, a throwing write-time `getItem`, missing and rejected Web Locks. Retry once (focus to `.topbar-pref-trigger`). A failing Retry (one attempt, focus stays). A pending Retry is inert ("is saving.", one lock request). Discard (zero writes, focus). The §5.3 verified no-op. The held real lock (H6, the rail stays operable, no pending-only status). Host row f. The four predecessor orderings. Uncertainty with one total write. External replacement, removal and restoration conflicts. Late completion after Discard. Unmount refusal. ZH wording |
| `continuity-export` (22) | Sol-layer lifetime with the standalone controller: A→B, A→locked, locked→A, epoch. Unmount refusal. An unrelated account lock. No account machinery. The five §8 shapes in memory under total storage denial (attempt counters, one URL created and revoked, anchor removed, warning, status, focus stays on Export). Export only with a draft. Blob, URL, append and click setup failures with a re-export. A ZH setup failure, with the line cleared by the next panel action. Unmount during Blob, URL and append |
| `host` (33) | A8 render conditions (clean, pending-only, settled). Status button attributes, pointer and Enter/Space toggling, DOM and Tab order, Escape focus return, outside `mousedown`, keyboard Retry focus target. Placement after the Appearance status and before `.topbar-pref`. ZH names. No route guard: rail, sidebar, Back/Forward with history entry equality. `beforeunload`. The sign-out step in both branches (no draft; Appearance only; rail Cancel and OK; both OK and OK; OK then Cancel; rail Cancel never asks Appearance; ZH). Forced remount (REL-09). Features toggles never writing the order. One controller in the same frame. §10.7 isolation |
| `original` (121) | The archive's own shell and `apps/web` tests listed above |

## Seed rule, consistency matrix and validity rules (contract §12)

- **Seeds.**
  - Every seeded order is in-domain, asserted by `seedOrder` as a precondition: `REVERSED` (the 14 rail ids reversed), `BOARD_AT_2`, `[]`, `RAIL_IDS`, and orders with `ghost-module`, `ghost-2` or `settings` only in the cases that test their preservation.
  - Features keys are seeded as exactly `"true"`/`"false"`. Appearance keys stay absent except `xai_pref_lang` = `"zh"` in ZH cases, an in-domain value.
  - Malformed seeds come only from the §5 item 2 table, through `seedMalformed`, which asserts their class, and only in `domain` and H1/H7/H8/H10-named cases.
- **Expected bytes** always come from the oracle's own A2 merge (`fixture.tsx` `merge`), written from the contract text. No product helper is imported.
- **Events.** Every jsdom drag fires dragStart → dragEnter → dragOver (one or more) → drop → dragEnd on real nodes; cancellations omit the drop. No case calls a component handler.
- **Consistency with accepted rules.**
  - P6 cases expect S' = P exactly, the same bytes the accepted Features oracles expect.
  - No oracle expects pruning.
  - **OE-1.** An unobserved external change, made through native bytes without an event, is used only during a held write and expected to be a conflict. Another document's changes are simulated as native bytes followed by a StorageEvent, and an idle binding follows them.
  - **OE-2.** Every display expectation is computed as D(S, R) for the current R.
  - The sign-out confirm lists without a rail draft equal the Appearance expectation (APP-AP7 class).
  - No oracle contradicts A1–A11 or the eight controller confirmations: index slots, unknown ids kept, the source-only status, cancel reverts, two prompts with the rail first, an App-created controller, C-RD1, and the rerun breadth.

## Iteration history

1. **`before1`** (all eight modes, plus `typecheck-static1` before it). There were zero PRECONDITION lines, every failure was a business assertion, and every positive control passed. `bytes`, `continuity-export` and `original` are authoritative from this iteration.
2. **`before2`** (`domain`, `merge`, `drag`, `field`, `host`). Observation-only additions give direct log support to parts of H1 (every route and a reload), H5 (where a re-enabled Boards returns), H3 (attempts at the drop), H4 (bytes after a cancel), H2 (status, Retry and warning after a failed drop) and H9 (the sign-out outcome).
   - No assertion was removed or weakened. The `merge` R-1 case and the `drag` two-step case now evaluate the same assertions after the extra steps; the `domain` at-load cases sweep the routes and a reload first, then assert on a reloaded App.
   - Outcomes were identical to `before1`: every case line and every failure's first line, compared mechanically.

## Disclosed development probes (none committed, none in the repository)

1. **Probes at `419e56d` before freezing.** Development runs of earlier drafts of the oracles were run from a scratch mirror of this directory outside the repository (`GIT_DIR` read-only), with their logs kept in scratch. They found and fixed fixture and selector issues before `before1`:
   - a device-recovery-export field path (`device.records`);
   - crash-ordering preconditions in two `domain` cases (a business route-error assertion now precedes any rail interaction; `statusNamed` tolerates a missing Topbar);
   - a success-claim detector that matched the word "saved." inside "was not saved.";
   - host cases reordered so that their first assertion is the H9 status or confirm list.
2. **Reference-realization probe.** To look for false failures that the fixed product could hit, a throwaway reference realization of contract r1 was written only in the scratch directory and overlaid onto the extracted `419e56d` archive in a scratch-only copy of the runner. It never touched the repository or the dependency checkout, and it is not committed. It consisted of:
   - an App-scoped controller on `usePrefAutosaveAsync("xai_rail_order", { validate })` with the A2 merge, A8 status, panel, Retry, Discard, Reload, Export, unload and sign-out step;
   - an AppRail that reorders on both dragenter and dragover and writes once at the drop;
   - the Topbar and Shell slot;
   - the `App.tsx` provider and sign-out step.

   With it, all seven Sol modes passed (bytes 26/26, domain 31/31, merge 21/21, drag 18/18, field 24/24, continuity-export 22/22, host 33/33, re-checked after iteration 2), C-RD1 passed 15/15, and C-FD1 gave 14/15 with case 014 PRECONDITION, matching the §13 predictions for the fixed SHA.

   The probe also exposed one driver hazard, which was fixed before freezing. An implementation that reorders on dragenter *and* dragover would oscillate under a driver that fires both events at the same node. The frozen driver therefore targets the button displayed at the hovered slot, as a browser does.
3. **Mutation probe.** A deliberately broken copy of the reference realization was run against the oracles. Each of the six injected defects was caught by the intended cases:
   - pruning merge: `merge` 17 failures;
   - status while pending: `host` A8;
   - no Escape focus return: `host` §7.2;
   - export reading storage: all five `continuity-export` shapes;
   - sign-out OK keeping the draft: `host` OK then Cancel, both branches;
   - writes on dragover: `drag` 10 failures.

These probes are aids for oracle validity only. They are not evidence about the fixed product and they do not constrain Terra's design. Any API the reference used, such as `useRailOrderController({ lang })` and `RailOrderProvider controller=`, is not assumed by any oracle.

## Contract/source observations (none blocks freezing)

1. **The H7 string case is filtered, not defaulted.** `"tasks"` is iterated per character, so 419e56d shows R order (`ai` first), as contract §3 item 2 states. The oracles require D(DEFAULT, R) on the fixed product, as §5 item 2 requires.
2. **H5 also covers non-rail and unknown ids.** `settings` and `ghost-module` are pruned at 419e56d (`bytes` L263–L266), which A2's uniform non-visible rule replaces.
3. **Running crash.** A malformed value written by a second document crashes the running App at 419e56d (`domain` observations L135 and L140). §10 item 4 already requires the fix; it is recorded beyond H1, which is stated for load only.
4. **dragenter/dragover.** §6 item 2 allows a preview update on both events. The jsdom driver is built so that its outcome is identical whether the product reorders on dragenter, dragover or both (see the reference probe). Native drags (§6 item 8) hover at a fixed point and are unaffected.
5. **"Pure-model" P1–P7** are asserted on the bytes the real AppRail writes: a standalone AppRail inside the real WebShellProvider, with the production registrations filtered by the real Features filter. The pure helper is internal and its API is not normative.
6. **The Sol-layer lifetime** (§7, "controller mounted under a real accountScope without the gate") uses the standalone AppRail's own controller (A3). The App-created controller's constructor and provider props are not normative, so no oracle calls them. §8 export cases run in the production App, through the only normative Export surface: the Topbar panel.
7. **"No storage attempt" on panel toggling** (§7 item 2) is asserted as zero get/set/remove on `xai_rail_order` and zero set/remove on any key. Unrelated reads by other App components are not attributed to the rail.
8. **The zero-write mount scope** follows the Appearance precedent: zero writes on every key for the Appearance route with the popover open and closed, and zero writes on `xai_rail_order` across the three routes and a reload. Other-key writes are observed: none occurred (`bytes` observation L44).

## Limitations

- **jsdom only.** "The same frame" is approximated by settling React work without a timer turn. Layout, hit-tests, 44×44 targets, R-PET, the 768 px visible-text breakpoint, CSS scope and focus-ring pixels belong to native E9–E14.
- **Input.** Pointer and keyboard input come from `@testing-library/user-event` and `fireEvent`, which are synthetic, not trusted. `beforeunload` is detected as a canceled event or an assigned `returnValue`. The exclusive lock fixture does not reproduce browser lock-manager timing. Downloads are observed, not saved; the native disk shapes are E11.
- **Cross-document behaviour** is simulated by native byte changes plus a dispatched `StorageEvent`, and the identity channel by `StorageEvent`s on `xai:auth:identity-change`.
- **Composition.** The production route objects run in a memory router, and `AppProviders` is not mounted, because the auth hook is substituted and there is no network client.
- **Deeper assertions not yet reached.** At 419e56d most cases end at their first business assertion, so the panel states, focus targets, export envelopes, predecessor orderings and conflict paths first execute on the fixed product. Their harness paths are proven by the FIXTURE cases and were exercised against the scratch-only reference realization (development probe 2), which is not evidence about the fixed product. Any later fixture correction must use a new suffix, rerun against both archives and never weaken an assertion (§12).
- **Engine coupling.** Some oracles encode the contract's demand to preserve the shared queue, baseline, reconciliation and lock semantics as observable attempt sequences and lock-request counts. Examples: `[merged1, merged2]` after a Retry of a failed predecessor, one lock request per drop, and one total write for an uncertainty.
- **Scope.** The parent host baseline (E3), native before (E4) and the rail F1-shape runner (E5) are not part of this batch.
- **Dependency reuse.** Third-party dependencies come read-only from `XAI_DEPS_ROOT`; the lockfile gate is a consistency check only.
