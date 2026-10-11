# Features Sol fixed reruns at `5cd63ff` (CP-FEATURES-01, batch 26, contract §14 E7)

**Verdict: PASS (independent verification only).** The frozen Sol oracles and runner were rerun unchanged on the fixed product `5cd63ff`. All nine modes pass: 219 of 219 cases, zero `PRECONDITION:` lines, every harness check PASS, zero suite errors and zero unhandled errors.

- **147 correct before-FAILs turned PASS.**
- **72 before-PASS cases stayed PASS:** 31 Sol cases (FIXTURE checks, positive controls, invariants and requirements of refuted hypotheses), AC-PANE-1–6 and the 35 reader tests.
- **No case went PASS → FAIL.**

This receipt is independent verification only. It is **not acceptance**, and it closes no 312 item: REL-05, REL-07, REL-10, UX-04, UX-05, QA-01, QA-03, QA-04, QA-09, SET-03 and D2/REL/AI stay open. It adds files only. No product file, oracle, runner, existing log, receipt, contract, ledger or control plane was changed. Nothing was pushed, merged, rebased, tagged, deployed, released or synced Web→Desktop.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol role mapping, isolated worktree `.claude/worktrees/agent-a35a2025129fe062c`. It did not write the contract, the oracles, the implementation or any F1 runner |
| Requested fixed revision | `5cd63ff` |
| Resolved fixed commit / tree | `5cd63ff652f02a2c726187fe12cbc796218d31c0` / `404bf819a42e20b3e4d372c18a981832ccd54954`. The features package tree is `3f25c84b5b582719d74fda8872db4e6e1db388f1`; it was `074659c0…` at `f359be6` |
| Before revision (frozen E2) | `f359be6d838393e0f9e93efd80b88b5b09f6144e`, logs `*-before2-f359be6.log` |
| Docs base (detached HEAD) | `c516fced2ec8c6fb6a8054c6e6858c315fa4b84c` (the control-plane commit that registered batch 26). `git diff --name-only 5cd63ff HEAD -- apps packages package.json pnpm-lock.yaml` is empty. Every log records `runner_checkout_head=c516fce…` (L9) |
| Product delta `f359be6..5cd63ff` | 11 files, all under `packages/xai-web-settings-features-panel/` (contract §11): `docs/api.md`, `docs/test.md`, `src/FeaturesPane.tsx`, `src/__tests__/FeaturesPane.test.tsx`, `src/__tests__/FeaturesPaneRecovery.test.tsx` (A), `src/__tests__/featuresLockFixture.ts` (A), `src/internal/featuresPane.tsx`, `src/internal/featuresRecovery.ts` (A), `src/internal/featuresRecoveryCopy.ts` (A), `src/styles.css`, `src/types.ts` |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for `XAI_DEPS_ROOT` (main checkout, read-only), `git show 5cd63ff:pnpm-lock.yaml` and the extracted archive. All three are recorded in every log (L14–L16) |
| Runtime | Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, Node v24.16.0, darwin-arm64, tz America/Los_Angeles. These are the same as in `before2` |
| Runs | One run, suffix `fixed1`, every mode exactly once (`all`). There was no environment failure, so no second run exists |

## Command

From the worktree root, on 2026-10-04:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-features-recovery-sol/verify-fixed.mjs 5cd63ff all fixed1
```

Console output; the runner exited with status 0:

```text
bytes 5cd63ff (5cd63ff652f0): vitest_exit=0 harness=PASS exit=0 cases=17 passed=17 failed=0 precondition=0
fields 5cd63ff (5cd63ff652f0): vitest_exit=0 harness=PASS exit=0 cases=49 passed=49 failed=0 precondition=0
reset 5cd63ff (5cd63ff652f0): vitest_exit=0 harness=PASS exit=0 cases=31 passed=31 failed=0 precondition=0
queues 5cd63ff (5cd63ff652f0): vitest_exit=0 harness=PASS exit=0 cases=40 passed=40 failed=0 precondition=0
continuity-export 5cd63ff (5cd63ff652f0): vitest_exit=0 harness=PASS exit=0 cases=26 passed=26 failed=0 precondition=0
downstream 5cd63ff (5cd63ff652f0): vitest_exit=0 harness=PASS exit=0 cases=15 passed=15 failed=0 precondition=0
original 5cd63ff (5cd63ff652f0): vitest_exit=0 harness=PASS exit=0 cases=6 passed=6 failed=0 precondition=0
readers-features 5cd63ff (5cd63ff652f0): vitest_exit=0 harness=PASS exit=0 cases=17 passed=17 failed=0 precondition=0
readers-web 5cd63ff (5cd63ff652f0): vitest_exit=0 harness=PASS exit=0 cases=18 passed=18 failed=0 precondition=0
```

## Frozen integrity (checked before the run and again after it)

Each SHA-256 was recomputed and compared with `README.md` (the E1/E2 receipt). All 23 matched. A pre-run snapshot of all 74 files in the four Features/F1 evidence directories was rechecked after the last run, and all 74 were unchanged. `git log --name-status` over those directories shows only `A` entries.

| File | SHA-256 (recomputed = receipt) |
| --- | --- |
| `fixture.tsx` | `f0b5d272695026f8e60df6dd2dbf5889790b3d2e834256259e86bb0432050ef8` |
| `bytes.test.tsx` | `904cb0de88eb5047365309df501ebbb8cb725a485963d23df022e7bbd26aba14` |
| `fields.test.tsx` | `506d54cbc39d0b69c53e7f45d4e3fa90ae77ae99f2ea68beb23d7540f08c0bc4` |
| `reset.test.tsx` | `dc4ee31e52a5800f30e7dbd924834e25f6f8a77dd5e88c8262443e1c322ac8e9` |
| `queues.test.tsx` | `d58160748187b7d7a7aeabfc620b694e7bc1e2714d37491aa99dbf8d8cb16f2b` |
| `continuity-export.test.tsx` | `1e3066f963edc15ba161937d26cbee949cb2886f1c3122740fd4c7c143c5a55a` |
| `downstream.test.tsx` | `88cf89c821b5f51abf2e4f373d1047304d51bb8817b33a1d7b8094516d38624d` |
| `verify-fixed.mjs` | `b5ac75fa1bc5ff65352afb5b598dc7309fb7435aa9ca96518dfd1d7ffb2f2f16` |
| the nine `*-before2-f359be6.log` (authoritative E2) | equal to the README table (`0fa71cff…`, `fe4b248b…`, `5bf992a3…`, `dfcd7145…`, `85280a82…`, `9edea286…`, `97d0b5e7…`, `cba3c7a7…`, `f40e0a74…`) |
| the six superseded `*-before1-f359be6.log` | equal to the README table |

All nine `fixed1` headers carry the same `oracle_sha256` line (L17), and it equals the table above. The runner also verified each copied oracle inside the archive. The fixed logs were therefore produced by exactly the frozen files.

## New logs (this directory)

| Log | Lines | SHA-256 | Passed / total | Exit | Harness |
| --- | --- | --- | --- | --- | --- |
| `bytes-fixed1-5cd63ff.log` | 87 | `4d11dba35115be267792648fae4a9778f5ee1c5014c79573be0e64938b5c0899` | 17 / 17 | 0 | 6/6 |
| `fields-fixed1-5cd63ff.log` | 151 | `aacb34b45d2708a9079883aec1d3be603d01ba1046812f7599060bf96ac4e011` | 49 / 49 | 0 | 6/6 |
| `reset-fixed1-5cd63ff.log` | 115 | `921b37e892573b23f34ffd5680b9d0e3a8371f1d66880bb7ae94098c23526b39` | 31 / 31 | 0 | 6/6 |
| `queues-fixed1-5cd63ff.log` | 133 | `0e63151160923c96abdb3663352a6e6770d0bd8af4fb23623642a452687e76b1` | 40 / 40 | 0 | 6/6 |
| `continuity-export-fixed1-5cd63ff.log` | 105 | `95b7fe30662ee1b1db8f4272ecfc71953b27a8eaa8d57f695b7c40454490076b` | 26 / 26 | 0 | 6/6 |
| `downstream-fixed1-5cd63ff.log` | 239 | `8c8beec7e825754ea530f979b7d66700133bc65599fe37e6a181d2d7199eafd0` | 15 / 15 | 0 | 6/6 |
| `original-fixed1-5cd63ff.log` | 65 | `8a9d7dd2603c0dceffc8593cc104f26492a07068c04789a37afd998b10b84801` | 6 / 6 | 0 | 6/6 |
| `readers-features-fixed1-5cd63ff.log` | 87 | `e6e34d87e4779fa887be547d6e0059e57c992af74d2d1b24e20bf5aa297c0213` | 17 / 17 | 0 | 6/6 |
| `readers-web-fixed1-5cd63ff.log` | 89 | `cb69a961fbc67fe4f4316cc5ad0c2e3b9dfa9e63ab6f0b067ea535d7203575b9` | 18 / 18 | 0 | 6/6 |

**Log layout.** Every log has the header (L1–L25; `harness_checks` at L24, `exit` at L25), Vitest stdout and stderr, and the runner summary.

| Mode | Totals line | Per-case lines |
| --- | --- | --- |
| bytes | L59 | L66–L82 |
| fields | L91 | L98–L146 |
| reset | L73 | L80–L110 |
| queues | L82 | L89–L128 |
| continuity-export | L68 | L75–L100 |
| downstream | L213 | L220–L234 |
| original | L48 | L55–L60 |
| readers-features | L59 | L66–L82 |
| readers-web | L60 | L67–L84 |

Every totals line reads `precondition_failures=0 suite_errors=0 unhandled_error_lines=0`. Across the nine logs there is no `PRECONDITION:`, `FAILED`, `AssertionError`, `TypeError` or `Unhandled` line.

## Before → fixed, per mode

Cases were matched by full name. In every mode the fixed log has the same case names in the same order as `before2`, so case numbers below identify the same case in both logs.

| Mode | `before2` at `f359be6` (pass / fail) | `fixed1` at `5cd63ff` (pass / fail) | FAIL→PASS | PASS→PASS | PASS→FAIL | FAIL→FAIL |
| --- | --- | --- | --- | --- | --- | --- |
| bytes | 17 / 0 | 17 / 0 | 0 | 17 | 0 | 0 |
| fields | 0 / 49 | 49 / 0 | 49 | 0 | 0 | 0 |
| reset | 2 / 29 | 31 / 0 | 29 | 2 | 0 | 0 |
| queues | 0 / 40 | 40 / 0 | 40 | 0 | 0 | 0 |
| continuity-export | 3 / 23 | 26 / 0 | 23 | 3 | 0 | 0 |
| downstream | 9 / 6 | 15 / 0 | 6 | 9 | 0 | 0 |
| original (AC-PANE-1–6) | 6 / 0 | 6 / 0 | 0 | 6 | 0 | 0 |
| readers-features | 17 / 0 | 17 / 0 | 0 | 17 | 0 | 0 |
| readers-web | 18 / 0 | 18 / 0 | 0 | 18 | 0 | 0 |
| **Total** | **72 / 147** | **219 / 0** | **147** | **72** | **0** | **0** |

### Every before-FAIL that turned PASS (147)

- **fields, 001–049 (all 49).**
  - H1, failed write with Retry, Discard, Export, guard and warning, ×8: 001, 003, 005, 007, 009, 011, 013, 015.
  - H2, throwing read with a Reload-only alert, ×8: 002, 004, 006, 008, 010, 012, 014, 016.
  - H2, 16 malformed sources (`1`, `True`, `0`, `yes`, `TRUE`, empty, `"true"`, ` true`): 017–032.
  - §5.2 valid edits over invalid and unavailable sources: 033, 034.
  - §5.8 same-turn Reload refusal: 035.
  - §5.7 and §5.8, partial and targeted recovery: 036 (all 8 unresolved), 037 (conflict plus quota), 038 (targeted Discard).
  - H9 truthful Saved: 039.
  - H7 / D3, no Saved claim and no shared Save & apply footer: 040.
  - H3 missing and rejected Web Lock capability: 041, 042.
  - §9 guard registration and blocking: 043.
  - H9 uncertainty: 044.
  - Sibling source error and repair: 045, 046.
  - Discard all visits only drafts: 047.
  - ZH wording and ZH export failure: 048, 049.
- **reset, 29 of 31.**
  - H7 normative EN/ZH confirmation: 001, 002.
  - §6/D3 Features-local control: 003.
  - H9 verified absence and Defaults restored: 004.
  - D2, no StorageEvent of any kind: 005.
  - H6 at the hook layer: 007.
  - Already-absent no-op: 008.
  - H5 per-field refusal, ×8: 009–016.
  - H5 at the reader layer: 017.
  - Partial reset: 018.
  - H3 duplicate reset while pending: 019.
  - REL-07, invalid source refusal with no purge: 020.
  - Unavailable source: 021.
  - Readback uncertainty with exactly one remove: 022.
  - H3 conflict during a held reset: 023.
  - Unrelated save: 024.
  - H9 status timing: 025.
  - Set/reset failure in both directions: 027, 028.
  - Repeated refusal: 029.
  - Fresh batch: 030.
  - ZH reset wording: 031.
- **queues, 001–040 (all 40).**
  - Q1–Q9 on Boards: 001–009.
  - H3 held per-key lock, ×8: 010–017.
  - H4 same-turn double activation, ×8: 018–025.
  - H3 with H4 under a held lock: 026.
  - O1–O7 set/reset orderings on Habits: 027–033.
  - O1–O7 set/reset orderings on Matrix: 034–040.
- **continuity-export, 23 of 26.**
  - §7 A→B→locked→A with old callbacks, the same-account epoch and an admitted reset batch across A→B: 001–004.
  - §8 shapes 1–6 and 9 under total denial: 007–013.
  - Exclusions: 014.
  - Blob, URL, append and click setup failures: 016–019.
  - Epoch change at blob, URL and append: 020–022.
  - Unmount at blob, URL and append: 023–025.
  - Unmount cleanup: 026.
- **downstream, 6 of 15.**
  - H3 rail held: 007.
  - H1 rail and Retry: 008.
  - H3 CmdK truth: 009.
  - H5 partial reset in the production App: 010.
  - D2 §10.5, zero `key:null` and unchanged appearance, rail and pet through the full sequence: 011.
  - §10.5 "during", with no account relock, no account-gate screen and no remount: 013.

### Before-PASS cases that stayed PASS (positive controls and invariants, 72)

- **bytes 001–017:**
  - 3 FIXTURE checks: the storage injector, the Web Lock fixture, and the accountScope/host/download/confirm/StorageEvent fixtures;
  - the registry and lifecycle contract for the 8 keys;
  - all 16 values with exact bytes;
  - zero-write mounts (absent and valid);
  - standalone render;
  - a declined confirmation makes zero attempts;
  - an accepted reset removes all 8 keys.
- **reset 006** (every unrelated key byte-identical) and **026** (reset while locked).
- **continuity-export 005, 006** (account isolation, unrelated lock) and **015** (no Export without a draft).
- **downstream:**
  - 001 FIXTURE (production App composition);
  - 002 zero writes at mount;
  - 003 rail filter for all 8;
  - 004 deep-link fallback;
  - 005 CmdK;
  - 006 full reset restores 8 rail entries;
  - 012 and 014 (H6 as stated, refuted, still binding);
  - 015 (§10.6 snapshot).
- **original 001–006 (AC-PANE-1–6), readers-features 001–017 and readers-web 001–018:** the §10 item 10 reader tests, 35/35.

## Hypotheses: before evidence → fixed product

Every log line the README cites as evidence was mapped to its `before2` case number, and that case was then looked up in `fixed1`. Every cited case is PASS in `fixed1`.

| ID | `before2` disposition | README evidence → case numbers | Fixed (`fixed1`) |
| --- | --- | --- | --- |
| H1 | confirmed | fields 001–015 (odd) (L1255–L1283); queues 003, 004 (L576, L578); continuity-export 002, 007, 010 (L533, L541, L547); downstream 008 (L368) | **all PASS** |
| H2 | confirmed | fields 002–016 (even) (throwing read); 017–032 (16 malformed sources, L1287–L1318); 033 (L1319) | **all PASS** |
| H3 | confirmed | queues 010–017 (L590–L605) and 001, 006, 007, 009, 026–029; fields 041, 042 (L1335–L1338) and 037; downstream 007, 009; reset 019, 023, 025; continuity-export 004, 011 | **all PASS** |
| H4 | confirmed | queues 018–025 (L606–L621) | **all PASS** |
| H5 (pane and reader layers) | confirmed | reset 009–016 (L740–L755), 017 (L756); downstream 010 (L372) | **all PASS** |
| H6 (hook layer) | confirmed | reset 007 (L736) | **PASS** |
| H6 (production App, as stated) | refuted, PASS, still binding | downstream 012 (L376), 014 (L379) | **still PASS** |
| §10.5 "during" and D2 | correct FAIL | downstream 013 (L377), 011 (L374); reset 005 (L733) | **all PASS** |
| H7 | confirmed | fields 040 (L1333); reset 001, 002 (L725–L728); §6/D3 control reset 003 (L729) | **all PASS** |
| H9 | confirmed | fields 039, 044, 047, 035, 046 (L1331, L1341, L1347, L1323, L1345); reset 004 (L731), 030 (L781); queues 002, 005, 008 (L574, L580, L586) | **all PASS** |
| Further section requirements | correct FAIL | reset 008 (already-absent no-op, L738); reset 020, 021 (no purge, REL-07, L762–L765); reset 022 (readback, L766); fields 043 (§9 guard, L1339) | **all PASS** |

H8 belongs to the parent host (E8, `../web-features-recovery-independent/fixed-5cd63ff.md`). H10 and the native parts of H5 and H6 belong to E4 and the later native batches.

## Product hashes recorded by the runner

The runner records 13 archive files in each log (L18).

- **Changed `f359be6` → `5cd63ff`.** Five files, all in the contract §11 set; this is the expected Terra delta:

  | File | `f359be6` | `5cd63ff` |
  | --- | --- | --- |
  | `src/FeaturesPane.tsx` | `987c3825…` | `54a3f10c…` |
  | `src/internal/featuresPane.tsx` | `14053daa…` | `572bdd47…` |
  | `src/types.ts` | `bd6b3599…` | `f97c4e62…` |
  | `src/styles.css` | `db4a5f24…` | `65fdf6f0…` |
  | `src/__tests__/FeaturesPane.test.tsx` | `2d42bdc3…` | `993f0d06…` |

- **Unchanged.** The protected files `apps/web/src/App.tsx` `5d10dba6…`, `AccountDataGate.tsx` `7519485b…`, `usePref.ts` `e1f2c913…`, `usePrefAsync.ts` `541fae97…` and `prefMutation.ts` `3f8840ac…` are identical. So are the features `index.ts`, `vitest.setup.ts` and `vitest.config.ts`.
- **Module pins.** Each mode now loads 2 more archive modules than in `before2`: the two new internal helpers, `featuresRecovery.ts` and `featuresRecoveryCopy.ts`. `original` loads 3 more, because the modified test also imports `featuresLockFixture.ts`.
  - The pinning was otherwise unchanged: 0 unaliased `@repo` imports, 75 aliases, and 46 tsconfig `extends`, none unresolved.
  - No required provenance module was missing. For `downstream` these include `App.tsx`, `AccountDataGate.tsx`, `AppRail.tsx`, `DesktopPet.tsx`, `CommandPalette.tsx` and the auth session and guards.

## Observations

1. **`original` runs the fixed archive's own test file.** That file is in §11 and Terra changed it: `git diff f359be6 5cd63ff` shows 7 lines added and 2 removed.
   - AC-PANE-3 and AC-PANE-6 became `async`, call `installFeaturesLockFixture()` and `await flushFeatures()` after the click.
   - The business assertions and the test titles are unchanged. AC-PANE-6's title still says "SettingsFooter", which Terra disclosed as stale wording.
   - The same six AC-PANE assertions pass at both revisions.
2. **`downstream` stderr contains product diagnostics only.** `xai_rail_order contains unknown id …` warnings come from the rail filter while modules are off. A `decode failed for xai_pref_features_meditation` warning comes from the oracle's deliberately malformed seed `"TRUE"` (`downstream.test.tsx:388`) before Reload in the D2 sequence. The `before2` log contains the same kinds of message. No error, no unhandled rejection, no failing case.
3. **No non-passing case**, so no first assertion is reported.

## Limitations

- **jsdom only**, as in the E1/E2 receipt:
  - the exclusive lock fixture does not reproduce browser lock-manager timing;
  - downloads are observed, not saved; native disk JSON is E11;
  - beforeunload is detected as a canceled cancelable event;
  - keyboard, trusted input, hit-tests, 44 px targets and layout are out of scope.
- **Composition.** `downstream` mounts the production `App` in a memory router with only the auth-session hook substituted (see the README). The two-document item (§10 item 7) and the native downstream are E13.
- **Coverage.** One `fixed1` run per mode. The fixed-only assertions that first executed here behaved as the frozen oracles define them; this receipt does not re-derive the oracles' contract coverage.
- **Dependencies** are reused read-only from `XAI_DEPS_ROOT`; the lockfile gate is a consistency check only.
- **Out of scope.** E9–E15 (native controls, reset, export, host matrix, downstream, visual, keyboard) and E18–E25 (final regression and the enumerated receipt) are not covered here.
