# Appearance recovery Sol before oracles (CP-APPEARANCE-01, batch 37)

**Verdict: FROZEN.** This directory freezes the Sol jsdom business oracles for the Settings Appearance caller (the seven device fields, the App root-preference writer, the Topbar quick switcher, Reset to defaults and the bottom Retry all) against the before product `5cd63ff`, before any implementation: contract r3 §14 items **E1** (oracle files and runner with a SHA-256 receipt, the lockfile gate and the F-B002 spy self-check) and **E2** (before logs for the eight §12 modes). It freezes evidence only. It implements nothing, changes no product source, product test, contract, ledger or control plane, accepts nothing, does not authorize Terra, and closes no 312 item.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol role mapping, isolated worktree `.claude/worktrees/agent-a641c015e74532b06`; did not write the contract or any product code |
| Docs base (detached HEAD) | `2b9f81d8017e78fa9ff86fe96fc3a5e313ad24ac` (control plane batch 37) |
| Requested before revision | `5cd63ff` |
| Resolved commit / tree | `5cd63ff652f02a2c726187fe12cbc796218d31c0` / `404bf819a42e20b3e4d372c18a981832ccd54954`; Appearance package tree `ce183d17e8606067c3bc97d7e3b6645ee656fe9e`, `xai-web-shell` tree `0f0fed40fe94a9de5c79eb273d1103757a807a9c`, `apps/web` tree `2fbf99f3ebea93b2ac136727267639790ecf3f4a` (all three equal the contract header) |
| Authority | `../web-appearance-recovery-contract/contract.md` r3 (`706c9a3`, SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d`, re-derived) §2–§10, §12, §13 rows 1–6 and 9, §14 E1/E2; `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` CP-APPEARANCE-01 rows and "本轮唯一任务" (batch 37) |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for the dependency checkout (`XAI_DEPS_ROOT`), `git show 5cd63ff:pnpm-lock.yaml` and the extracted archive; the runner also asserts equality with the contract's gate constant. All four values are recorded in every log header |
| Archive product hash check | Every log header lists 18 archive file hashes. The 12 contract-listed sources all match the contract table: `AppearancePane.tsx` `552eb224…`, `internal/appearancePane.tsx` `34b93820…`, `types.ts` `18d5894e…`, `index.ts` `10bfbed1…`, `styles.css` `1b17d1f4…`, `App.tsx` `5d10dba6…`, `Topbar.tsx` `70ba299e…`, `Shell.tsx` `7d46423f…`, shell `types.ts` `92b68b2b…`, `departureCoordinator.tsx` `0844a697…`, `SettingsFooter.tsx` `afecc734…`, `usePrefAsync.ts` `541fae97…` |
| Diagnostic iterations | 3 of 3 per Sol mode (`before1`, `before2` superseded; `before3` **authoritative**). `original` ran exactly once (`before2`). No iteration was caused by a precondition or harness failure (there were none); see "Iteration history" |

## Files and SHA-256

Every new file in this directory except this README (which cannot carry its own hash).

| File | SHA-256 |
| --- | --- |
| `verify-fixed.mjs` (runner) | `a451df6aa05fcae5b6fb77266d6ef8d990b4e97b91755c0723f442239fbf5c1e` |
| `fixture.tsx` | `acd26ad860c90e1a688232db2f8da4b2d016b7a537d53afb3fea528f584666e3` |
| `bytes.test.tsx` | `c8338077dab16ca2e095a82dce2d667797d9a33bce8f666a78a57082930e45b0` |
| `fields.test.tsx` | `3ff72da5b1a037b0bbd93fbb910cb0772c6306d495871d8a5fb14c3305acc794` |
| `reset.test.tsx` | `3f9f3f86570c1c8f9350532fb0a5fbc03c2a4f92ac74e9fa959956811a2e6595` |
| `queues.test.tsx` | `1d6c85c28224a2fc1dace8ee754873fd3d2b716264f9b812c753a816b6ac2d66` |
| `continuity-export.test.tsx` | `776da524f7479e03d067c2426345df1fb30e518581c7bbfd33a0f1d0838e79ce` |
| `host.test.tsx` | `49528aa335cb9f2db87faf152656b6c55011bf5856b69998c9c31dabbffc3eab` |
| `retry-all.test.tsx` | `d851c75a5ca80470e928b52425521d8b549d3e91738796ac9f84708d793c513c` |
| `bytes-before3-5cd63ff.log` (authoritative) | `a4fa76da5c6e08a34d8451040dc6a7c160efb2cf63420d4914e6d1218e0f0956` |
| `fields-before3-5cd63ff.log` (authoritative) | `9c8bd67d6e739d7e436c0d5d340816ccb7070af5176e7664886ad3855fcbeff0` |
| `reset-before3-5cd63ff.log` (authoritative) | `cb2e1c0206298a647e8c4a556f6a45e08affda5e2c672ff2302f7f23e1dafb6e` |
| `queues-before3-5cd63ff.log` (authoritative) | `7084597c2a248b23b8ef7d0a8a16cf8ac5111fa07d09f8b2c8c8b64743a60125` |
| `continuity-export-before3-5cd63ff.log` (authoritative) | `2582df8f5cacf0939b5ca39f04269eb7e2d4f5ced54967e6b1b5aa832d22178a` |
| `host-before3-5cd63ff.log` (authoritative) | `e12c6068eb25dc0b51e08683245014a5864e42b39e0322153d8f19adc69f06b0` |
| `retry-all-before3-5cd63ff.log` (authoritative) | `ba661294ede1bf4045e348d5d24912c5f9eb4d101d51357c3a62604776f0b919` |
| `original-before2-5cd63ff.log` (authoritative; its only run) | `bd61c8159b16541388735c107b493bf3418205caab235488a17be9caa5c60a9b` |
| `bytes-before2-5cd63ff.log` (superseded) | `69c405ea8f17e208b0193ba7a8ee2d85e4d8ef80fceb63a999e2cd29660f8eeb` |
| `fields-before2-5cd63ff.log` (superseded) | `2351736a0e38aae996c8d691c8ddcde1ab6e466be4529ff84d940752a424bff8` |
| `reset-before2-5cd63ff.log` (superseded) | `391e47fe088809ba5fd604fdbda4322aea879918700c62898a485c02ffb3ab8a` |
| `queues-before2-5cd63ff.log` (superseded) | `50a0a77327f97b6f32306ef71eb37016425e14085a517f0eeb6a019891943545` |
| `continuity-export-before2-5cd63ff.log` (superseded) | `49739fca5ad9b58aa88d1b82ea3bca3408ab2021fdea75cc0ec18a5f4a877919` |
| `host-before2-5cd63ff.log` (superseded) | `4e2b3f16f9a541a4f64599388f6298b65c3651cb42b9c15256954a1f37f53cef` |
| `retry-all-before2-5cd63ff.log` (superseded) | `8bf3c7edfd071d3a16c1d63fc7125265fe3d6728dd3408338bae5d04802acb2e` |
| `bytes-before1-5cd63ff.log` (superseded) | `d8c83793c648121fb7942b352ec5b4cd6fa57ee373481b29e31b6e6b424fbde7` |
| `fields-before1-5cd63ff.log` (superseded) | `dcd04a84a4616abb7795124cd63d8ad8e535bbc42f7f901c8f8ad8d38b2ca0d5` |
| `reset-before1-5cd63ff.log` (superseded) | `1868bb4dc87277f726049116b0b5be149e96c2996f46c395f900dd7b9b7b88c6` |
| `queues-before1-5cd63ff.log` (superseded) | `4b646d2bb2451f7f0716148d332b91d30e712fd95a57a1d0af7776c1d301d31d` |
| `continuity-export-before1-5cd63ff.log` (superseded) | `a3d2b85c07e80e26eb52c8f18378e43b3d88b3e7f0e10b966d8de03643a78736` |
| `host-before1-5cd63ff.log` (superseded) | `53d599bb14de50644c17cf3121a236b4795ef04fe5a868a1c11d2c295d04b956` |
| `retry-all-before1-5cd63ff.log` (superseded) | `77dc445a6381d86196a81afd1f4266d38a2a77c7ce0fa8b1cfebf556710e8ac1` |
| `typecheck-static1-5cd63ff.log` (static check) | `9c85bcaf354deffe462b620ffda29ea4a2505508ec8a1e1a60864e411c420e9a` |
| `typecheck-static2-5cd63ff.log` (static check) | `96a5082a09de3a83b57d37c770660a940d414d54025fac4630f2ee0d25412501` |
| `typecheck-static3-5cd63ff.log` (static check) | `6d31830df8087b01d31b0cc614129086cc7f6665f5fc57acf2aee4e4d94e41c4` |
| `typecheck-static4-5cd63ff.log` (static check) | `20c9387aea19e56d2b031657668ac8ec1c22561861897798ddd266d9d97f6c81` |

All seven `before3` headers carry one identical `oracle_sha256` line, equal to the table above, so the authoritative Sol logs were produced by exactly these files. The runner hash `a451df6a…` is identical in all 26 logs (it never changed). The `before1` headers differ for `fixture.tsx` (`bfce8935…`) and every test file except `bytes.test.tsx`; the `before2` headers (including `original-before2`) differ only for `fields.test.tsx` (`b70ed970…`) and `reset.test.tsx` (`354f5bda…`). `original` executes only the archive's own tests and no oracle file, so its single run is unaffected by the iteration-3 changes.

## Commands

From the repository root of this worktree (the dependency root is read only: nothing is written, installed, built or checked out there):

```sh
DEPS=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop
# Static typecheck of the oracle files inside the archive (executes no product or oracle code)
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-sol/verify-fixed.mjs 5cd63ff typecheck static<N>
# Iteration 1: bytes first (fixture validity), then the other six Sol modes
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-sol/verify-fixed.mjs 5cd63ff <mode> before1
# Iteration 2: the seven Sol modes, then original (its only run)
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-sol/verify-fixed.mjs 5cd63ff <mode> before2
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-sol/verify-fixed.mjs 5cd63ff original before2
# Iteration 3 (authoritative): the seven Sol modes
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-sol/verify-fixed.mjs 5cd63ff <mode> before3
```

Sol modes: `bytes`, `fields`, `reset`, `queues`, `continuity-export`, `host`, `retry-all`; plus `original` (eight §12 modes; `all` runs the eight). Fixed reruns (E7) use the unchanged files with a new suffix, for example `… verify-fixed.mjs <fixed-sha> <mode> fixed1`, and an `XAI_DEPS_ROOT` whose lockfile matches that revision (the runner refuses any other).

## Runner guarantees (`verify-fixed.mjs`)

- Expands `git archive <resolved commit>` into a fresh realpath temporary directory and asserts SHA-256 equality of the dependency checkout's lockfile, the committed lockfile, the extracted lockfile and the contract gate.
- Copies the eight oracle files into `docs/reviews/web-appearance-recovery-sol/` inside the archive and verifies each copy against the evidence hash.
- Gives every archive workspace (`packages/*`, `apps/*`) a private `node_modules`: read-only third-party links from `XAI_DEPS_ROOT` (448) and `@repo` links to the archive's own folders for every declared workspace dependency (281), so Node and tsconfig `extends` resolution stay inside the archive (46 `extends` checked, none unresolved). The oracle directory gets links to the single `react`, `react-dom`, `@testing-library/react`, `@testing-library/user-event`, `react-router`, `vitest` and `@types/react` instances.
- **Pin and guard:** 75 exact-match aliases map every archive `packages/*` export specifier to the archive file. A guard plugin fails the run if any module is transformed from the dependency checkout's `packages/`, `apps/` or `docs/`, fails any unaliased `@repo` import that resolves outside the archive, and records every archive module. In every authoritative log: `pin_unaliased_repo_imports=0` and `pin_required_provenance_missing=none`; each App mode required 22 product modules from the archive (the Appearance pane and registry entry, `usePref`, `usePrefAsync`, `prefMutation`, `accountScope`, `storage`, `App.tsx`, `router.tsx`, `RouteGateElements.tsx`, `composedSettingsRegistration.tsx`, `departureCoordinator.tsx`, `AccountStorageGate.tsx`, `AccountDataGate.tsx`, `Shell.tsx`, `Topbar.tsx`, `AppRail.tsx`, `DesktopPet.tsx`, `CommandPalette.tsx`, the event-bus emitter and the auth `session.tsx`/`guards.tsx`), and `bytes` 23 (also `NotFoundPage.tsx`).
- `original` runs three Vitest invocations in one log, each under its own package semantics: the seven Appearance package test files (jsdom, globals, its `vitest.setup.ts`), `packages/xai-web-shell/src/__tests__/Topbar.test.tsx` (jsdom, no globals, the shell setup), and `apps/web` `App.lazy-init`, `App.signout`, `shell.theme`, `shell.smoke` (jsdom, no globals, no setup). Harness checks run per invocation (18 in total).
- Writes `requested_revision`, `resolved_commit`, `resolved_tree`, package trees, the four lockfile values, the oracle and runner hashes, 18 archive file hashes, versions (Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, TypeScript 5.9.2, Node v24.16.0), Vitest stdout and stderr, and a runner summary with one `case NNN PASSED|FAILED [PRECONDITION] | <name>` line per case (plus the failure's first line), the PRECONDITION count, the harness checks and the module-pin record.
- **Refuses to overwrite:** checked before archiving, again before writing, and by an exclusive create. Verified after the runs: rerunning `bytes before2` exited 1 with `Evidence exists; use a new suffix` before archiving anything.
- **Preserves nonzero exit codes:** the first nonzero Vitest (or tsc) status; 2 when Vitest exits 0 but a harness check fails.
- Keeps Vite caches and bundled-config temp files inside the temporary archive and deletes it afterwards (no `xai-appearance-sol-*` directory remains).
- Filters only React's "not wrapped in act(...)" console warning. Product console output (quota and decode warnings, the 5cd63ff route-error stack traces) is kept in the logs.

## Before results at `5cd63ff` (authoritative)

| Mode | Passed | Failed | Total | `PRECONDITION` | Exit | Harness | Authoritative log |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `bytes` | 65 | 0 | 65 | 0 | 0 | 6/6 | `bytes-before3-5cd63ff.log` |
| `fields` | 1 | 88 | 89 | 0 | 1 | 6/6 | `fields-before3-5cd63ff.log` |
| `reset` | 4 | 30 | 34 | 0 | 1 | 6/6 | `reset-before3-5cd63ff.log` |
| `queues` | 1 | 55 | 56 | 0 | 1 | 6/6 | `queues-before3-5cd63ff.log` |
| `continuity-export` | 4 | 22 | 26 | 0 | 1 | 6/6 | `continuity-export-before3-5cd63ff.log` |
| `host` | 6 | 27 | 33 | 0 | 1 | 6/6 | `host-before3-5cd63ff.log` |
| `retry-all` | 2 | 46 | 48 | 0 | 1 | 6/6 | `retry-all-before3-5cd63ff.log` |
| `original` | 97 | 0 | 97 | 0 | 0 | 18/18 | `original-before2-5cd63ff.log` |

The Sol matrix has 351 cases: 83 PASS (11 FIXTURE, 65 positive controls labelled `PC`, 3 invariants labelled `INV`, 2 coverage-count cases and 2 recorded requirements: `bytes` L192 and `host` L626) and 268 correct business FAILs. `original` has 97 PASS (Appearance package 50, `Topbar.test.tsx` 23, `apps/web` 24). Every failure is an `AssertionError` on a business assertion carrying an `H<n>`, `A2.<n>`, `§<n>` or `R5` tag; no failure is a `PRECONDITION`, selector, fixture or harness error (no `TypeError`), no log reports a suite error, and no log reports an unhandled error or rejection.

## Hypotheses

`L<n>` is a line of the named authoritative log (`before3` for the Sol modes; `original-before2` for `original`). Each case line is followed by its failure's first line. H11 belongs to the parent host baseline (E3); H14 is native only (E4); H3, H5, H6, H10, H15 and H17 run again natively in E4.

| ID | Disposition | Evidence |
| --- | --- | --- |
| H1 | **confirmed** | `fields` L2144/L2154/L2164: after a failed write the accent, background and sidebar controls revert ("expected 165 to be 230", "'default' to be 'mist'", "'left' to be 'right'"); the choice is lost. L2146/L2156/L2166 the same over committed baselines. No export exists for a failed registered set: `continuity-export` L460 and L462 ("Export Appearance draft: expected null"); no Retry all: `retry-all` L1092. Also `queues` L1132–L1136, `host` L646. |
| H2 | **confirmed** | `fields` L2114 (language), L2124 (theme), L2134 (density), L2174 (font scale): the assertions that the choice stays displayed and applied and that the bytes keep the old value pass; the first failure is the missing feedback, e.g. "H2/H12: \"语言未保存。\" failed feedback: expected false to be true". "Reverts after reload" follows from the unchanged bytes and the App's lazy read of stored bytes at mount (`original` L316–L323, APP-LP1–5 and `readLocalPref`); it is not separately asserted. |
| H3 | **confirmed** | `fields` L2184/L2186/L2188: a failed Topbar language, theme or density choice stays checked and applied with the bytes unchanged (passing), and "H3/§7.2: the Topbar status appears for the failed Topbar choice: expected null not to be null". `host` L617, L619, L623. |
| H4 | **confirmed** | `fields` L2272: after a failed accent write, "Save & apply" shows the flash: "H4: no 'Saved'/'已保存' after a failed write …: expected true to be false". |
| H5 | **confirmed** | `queues` L1172/L1174: a Topbar theme or density change is not reflected in the pane ("expected 'light' to be 'dark'"); L1176/L1178: "Save & apply" then writes the pane's stale value over the Topbar choice ("expected '\"light\"' to be '\"dark\"'", "'\"comfortable\"' to be '\"compact\"'"); also L1168, L1170, `host` L644 and the H15 observations (`retry-all` L49, L54). |
| H6 | **confirmed** for all nine listed values | `fields` L2190 (`"fr"`), L2196 (`null`), L2198 (`1`), L2216 (`0`), L2218 (`-1`), L2220 (`null`), L2222 (`"big"`), L2228 (`"1"`), L2232 (`Infinity`): "… must not make the /app route render the route error boundary: expected 'Route Error (app)' to be null"; observations L111, L126, L129, L174, L177, L184, L187, L206, L212. **Additional, not listed in H6:** `xai_pref_lang` = `"EN"` also crashes `/app` (L2200, observation L132), and an `Infinity` accent written by another document crashes the running App (`host` L650). |
| H7 | **confirmed** | Observations in `fields`: L236 `xai_rail_pos=diagonal` reaches `<html data-rail-pos="diagonal">` and `.app[data-rail-pos="diagonal"]`; L252 and L261 `xai_bg_tone=sage`/`neon` reach `data-bg-tone`; L209 `xai_accent_hue=abc` silently shows and applies 165. Case lines L2240, L2248, L2250 (no valid option displayed), L2230 ("H7/H12: … source alert: expected false to be true"), throwing reads L2262–L2266 (silent default, no alert), Reload never offered L2148/L2158/L2168. |
| H8 | **confirmed** | `queues` L1148–L1160 (seven pane fields) and L1162–L1166 (three Topbar fields): with `prefMutationLockName(<key>)` held by the test, "H8: the held per-key lock keeps the physical bytes unchanged: expected '<choice>' to be null"; the reset ignores held locks too (`reset` L747, L763, L773, L785); missing and rejected lock capability are ignored (`fields` L2284, L2286). |
| H9 | **confirmed** | Confirmation text: `reset` L735 (EN) and L737 (ZH), observations L35/L38 ("Reset every preference to defaults? …"). A refused registered removal is swallowed with no feedback: L755/L757/L759/L796 (the refused key keeps its old value on screen, EN and ZH) and L775 (no "was not reset" message). Root fields are reset by writing default values: L741 and observation L47 (`set:xai_pref_theme="light"`, `set:xai_pref_density="comfortable"`, `set:xai_pref_font_scale=1` beside three removals), L749/L751/L753. No "Defaults restored." truth: L745 ("the pane status line is always rendered: expected null not to be null"). |
| H10 | **confirmed** | `host` L658/L660/L662/L664: a committed theme, density, font scale or language change from another document is not reflected ("expected 'light' to be 'dark'", "'comfortable' to be 'compact'", "1 to be 1.1", "'en' to be 'zh'"). The three registered keys still propagate (`bytes` L191, PASS). |
| H12 | **confirmed** | No Discard, Reload, Retry, Export or status line exists: `fields` L2116 ("Discard Language: expected null"), L2118 (no source alert or Reload), L2270 ("H12 A2.4: the pane status line is always rendered: expected null not to be null", no truthful saved line), `reset` L745 (no "Defaults restored."), `queues` L1114 ("Retry Theme: expected null"), `continuity-export` L458–L493 (no Export). |
| H13 | **confirmed** | `fields` L2282: the tone commits (the passing `xai_bg_tone` assertion precedes) and "H13: the accent keeps displaying the tone's hue after its write failed: expected 165 to be 230", silently. |
| H15 | **confirmed** | `retry-all` L1080 (EN) and L1082 (ZH) with observations L49/L54: the bottom action is "Save & apply"/"保存生效"; zero attempts on the failed accent key; all four root keys rewritten raw from the pane's values (`theme` `"light"` from the stale mirror overwrites the Topbar's Dark choice, and the Topbar then shows Light; `density` written while its per-key lock was held; `lang` rewritten although it never failed); a denied font-scale write is swallowed (`"1!"`, fault fired once) and the flash still shows; flash present immediately and gone after 1.9 s; no per-field result. |
| H16 | **confirmed** | `retry-all` L1084–L1162: 34 of these 40 cases fail "H16/H17: Retry all is always rendered while the pane is mounted (A2.2): expected null not to be null" once their failures are set up — including one failure (L1092), all seven (L1096), failed Reset items (L1104), the scope, exclusion, duplicate, supersession, late-completion, feedback and focus cases, and host rows o and p (L1150, L1152). The other six fail earlier in their setup on H8, §5.6, H12 or A2.1 assertions (L1108, L1110, L1112, L1142, L1160, L1162). |
| H17 | **confirmed** | `retry-all` L1076 (EN) and L1078 (ZH) with observations L39/L44: in the clean state the bottom action is "Save & apply"/"保存生效" with neither `aria-disabled` nor `disabled`; one activation makes exactly four `setItem` attempts (language, theme, density, font scale) with the pane's values, so absent root keys gain default bytes, zero attempts on the three registered keys, and "Saved"/"已保存" flashes (present immediately, gone after 1.9 s). The disabled state does not exist: L1084, L1086, L1088, L1090. |

No hypothesis was refuted. Every confirmed failure is a requirement that the same unchanged assertions must PASS on the fixed product.

**Further correct FAILs without a hypothesis number** (section requirements): malformed root bytes are applied raw — `theme` `"neon"`/`"Dark"`/`123` reach `data-theme`, `density` `"cozy"`/`{}` reach `data-density`, font scale `2`/`0.5` become 32 px/8 px, accent `-5`/`361`/`12.5` are applied (`fields` L2202–L2214, L2224–L2226, L2234–L2238, observations L141–L199, L219–L229); Reset purges malformed and unreadable bytes and removes absent keys (`reset` L743, L765, L767, L769); readback uncertainty is not reported (`reset` L771, `queues` L1120/L1138); the beforeunload, sign-out-step and isolation requirements of §7 and §10 item 7 (`host` L627, L632–L639, L668; `reset` L790).

## Controller ruling 5: the four inherited-ordering cases

Each runs in EN in the production App with the exclusive Web Lock fixture, the attempt-level Storage injector and the `window.confirm` recorder, exactly as contract §12 steps 1–6 specify (one shared routine, `runRuling5` in `fixture.tsx`). All four are **correct business FAILs at step 1** at `5cd63ff`: the pane write ignores the held per-key lock and changes the bytes immediately (H8), so later steps and their preconditions are never evaluated. None is a precondition failure.

| Case | Mode | Log line | Step-1 failure |
| --- | --- | --- | --- |
| `fu2-retry-theme` | `queues` | L1218 | "R5 fu2-retry-theme step 1 (H8): while the per-key lock is held the bytes are still the baseline: expected '\"dark\"' to be '\"system\"'" |
| `fu2-retry-railPos` | `queues` | L1220 | "R5 fu2-retry-railPos step 1 (H8): … expected 'right' to be 'bottom'" |
| `fu2-retry-all-theme` | `retry-all` | L1164 | "R5 fu2-retry-all-theme step 1 (H8): … expected '\"dark\"' to be '\"system\"'" |
| `fu2-retry-all-railPos` | `retry-all` | L1166 | "R5 fu2-retry-all-railPos step 1 (H8): … expected 'right' to be 'bottom'" |

Steps 2–6 assert, on the fixed product: the default displayed and applied with the five absent keys completing as verified no-ops without `removeItem`; exactly one thrown `setItem(<key>, <choice>)` and zero `removeItem`, the baseline kept, "<Label> was not reset to its default.", the Topbar status and no success line (Retry all enabled in the `retry-all` cases); then, with the fixture programmed to grant the next acquisition of the key's lock and hold the one after it, the attempt log since recovery being exactly the re-written superseded set while the removal is held (the field still showing the default and "is being reset", the pass open with Retry all disabled), and finally exactly [set, removal] since recovery, [failed set, set, removal] over the case, verified absence, every other key equal to the snapshot, no "Appearance settings saved.", "Defaults restored." (required in the `retry-all` cases), no Topbar status, no unload warning, and focus kept on the disabled Retry all. The programmed hold is proven by the lock FIXTURE (`bytes` L130).

## Positive controls PASS at `5cd63ff`

| §12 positive control | Evidence |
| --- | --- |
| Zero-write mount | `bytes` L135 (absent: App on the Appearance route, popover open and close twice, unmount, reload: zero set/remove on every key), L136 (valid stored bytes for all seven keys: zero on every key), L137 (`/app/tasks` and back: zero on the seven keys; observation L46 records no other-key writes) |
| Absent defaults | `bytes` L134 (pane, `<html>`, `.app`, readouts, Topbar summary and checked state) |
| Normal persistence and exact bytes for every value (pane and Topbar) | `bytes` L139–L171 (33 pane values: language 2, theme 3, density 2, font scale 7, accent 6 presets plus 0/220/360, rail 4, background 6 each with its paired accent bytes), L173–L179 (7 Topbar values), L180–L186 (a value equal to the default is stored, never removed) |
| "Save & apply" present and operable with today's bytes | `retry-all` L1075 and observation L34: four root `setItem` attempts `"en"`, `"light"`, `"comfortable"`, `1`; the three registered keys untouched; the flash shows |
| Declined reset confirmation makes zero attempts | `reset` L739 |
| A working reset removes the three registered keys | `reset` L740 |
| APP-LP1–5 | `original` L316–L320 (and the three `readLocalPref` unit tests L321–L323) |
| The Topbar persistence tests | `original` L308–L315 (TP1-Persist … TP3b-Persist and TP-Persist-Quota-Safe), with TP0–TP7 and TB-PREMIUM-1 in L293–L307 |
| The §10 item 10 tests in the `original` scope | `original` L243–L292 (all 50 Appearance package tests, including AC-SAVE-1/2, AC-RESET-1–6, AC-LIVE-1–8 and AC-RENDER-1–8), L324–L330 (`App.signout`, 7), L331–L335 (`shell.smoke`), L336–L339 (`shell.theme`) |
| Lifecycle classification | `bytes` L133 (device ownership, device-preference, device-recovery, retain, retain-on-device; physical key = logical key; per-key lock names; registry codecs and defaults of the three registered keys; the four root keys unregistered) |

Also passing at `5cd63ff` (invariants and recorded requirements that bind the fixed product): byte compatibility with the unchanged `readLocalPref`, `NotFoundPage` and `AccountStorageGate` readers for every root value written through the App (`bytes` L187–L190); the registered keys follow another document (`bytes` L191); valid stored bytes displayed at mount (`bytes` L192, observation L42); every other key byte-identical through a reset (`reset` L789); no account key, marker or lifecycle lock touched and an unrelated held account lock never delaying device work (`continuity-export` L454, L455); no Export or Discard all without a draft (`continuity-export` L476); no unload warning in a clean or source-only state (`host` L625, L626); sign-out without drafts making zero confirm calls and completing as before in both the fallback and the coordinator branch (`host` L631, L636); the system theme following its media-query listener (`host` L643).

## F-B002 self-check

- **Rule implemented:** the attempt-counting wrappers on `Storage.prototype` record the attempt and then delegate exactly once to the captured native method; a faulted attempt throws before delegating. They never call `accountScope.physicalKey`, `getPref`, `readRawPref`, any other Storage method or any product helper. All seven keys are device keys (physical key = logical key); account-key isolation assertions use prefix constants (`xai:account:v1:`, `xai:demo:v1:`) evaluated outside the wrappers. Bytes are read and seeded through the captured native methods, outside the counters.
- **Proof in every oracle file:** each of the seven test files runs `storageSelfCheck()` as its first case: with tripwires installed on `accountScope.physicalKey` and `accountScope.capture`, ten wrapper calls (plain, value-faulted, after-remove-armed and totally denied) must delegate `[1,1,0,1,1,0,1,0,0,0]` times with zero nested wrapper entries and zero tripwire hits. Result in all seven logs (L31 of each authoritative log): `{"nested":0,"tripwire":0,"delegatedPerCall":[1,1,0,1,1,0,1,0,0,0]}` — PASS (`bytes` L128, `fields` L2113, `reset` L734, `queues` L1111, `continuity-export` L447, `host` L610, `retry-all` L1074).
- **Per-case guard:** a re-entrancy depth counter runs inside the wrappers for every case, and `teardown()` throws a `PRECONDITION` if any case saw a nested Storage call. None did (zero PRECONDITION lines in 351 cases).

## Fixture validity proof

- **Storage injector** (`bytes` L129): get/set/remove attempts are logged in call order before delegation; a faulted `setItem` throws `QuotaExceededError`, is logged as thrown and never reaches storage; one-shot faults stop; after-remove and after-set faults stay unarmed until their write or removal (value-specific arming honoured) and then fire once; a value-specific write fault fires only for its value; a faulted `removeItem` never removes; total denial fires for all three operations; disarmed faults stop; only `localStorage` is counted. Every `fired(...)` precondition in the business cases held.
- **Exclusive Web Lock fixture** (`bytes` L130): grants are asynchronous; a held name keeps exactly one queued product waiter, granted only after release, while an independent name is granted at once; shared holders coexist while an exclusive request waits; deny rejects; the missing capability is explicit; a **programmed hold** grants N product acquisitions normally and holds the next behind an exclusive test hold, and never shares a name another holder already holds. Unsupported request shapes become `PRECONDITION` errors in teardown; none occurred, so no accidental `lock-unavailable` result was possible. Every "the test exclusively holds <name>" precondition held.
- **accountScope, confirm recorder, StorageEvent counter, bus spy, unload probe, download harness, media query** (`bytes` L131): a real A→B transition advances the epoch while device keys stay unscoped; `window.confirm` is recorded and answered; oracle-dispatched StorageEvents are counted and excluded from product counts; the `web:settings:preference-changed` and `web:shell:module-change` spies start empty; a canceling or `returnValue`-assigning `beforeunload` listener is detected; object URL, anchor append, click and revoke are observed; the dark-scheme media query is controllable.
- **Production App composition** (`bytes` L132): the substituted `useWebAuthSession` served `App`, `AppRouteGate` and `AccountStorageGate`; the real Appearance pane rendered in the production Settings detail; the Topbar, Shell, AppRail and DesktopPet rendered; `AccountDataGate` activated account A; zero fetch/XHR/WebSocket/EventSource attempts. A demo scope (`VITE_WEB_AUTH_MODE=mock-authenticated` stubbed) also mounted the production App with a demo scope (precondition held in `reset` L794).
- **Selectors:** controls only through the §2/§5 selectors and accessible names — role and name for every button, menu item and slider (scoped to the pane, the Topbar dialog, the Settings sidebar, the AppRail or the sign-out dialog), the §2 classes (`.theme-card`, `.accent-sw`, `.bg-tone-card`, `.rail-pos-card`) only to disambiguate equal names (the "Sage" swatch and tone), the §5 testids (`appearance-retry-all`, `appearance-status-line`, `appearance-status`, `appearance-reset-defaults`, `[data-appearance-recovery]`) asserted as business requirements.

## Oracle inventory by §12 mode

| Mode | Coverage |
| --- | --- |
| `bytes` (65) | Five FIXTURE cases; lifecycle classification; absent defaults; three zero-write mounts; 33 pane and 7 Topbar values with exact bytes; seven default-value stores; reader byte compatibility (`readLocalPref`, `NotFoundPage`, `AccountStorageGate`); registered cross-document propagation; stored display |
| `fields` (89) | Per field ×7: latest-choice failure and Retry with the truthful saved line, targeted Discard (zero writes, rereads only its field, committed value and language restored), Reload repair, valid edit over malformed bytes, late completion after Discard; Topbar failure ×3; all 33 §5 item 2 malformed values and a throwing read ×7 (no throw, default displayed and applied, Reload-only alert, zero writes); a direct saved-line case; H4; all seven unresolved with Discard all and with a targeted Retry; background dual intent ×3 (H13); missing and rejected lock; ZH wording |
| `reset` (34) | Normative confirmation EN/ZH; declined zero attempts; registered removal; six verified absences that never write and keep language; verified no-ops; a direct "Defaults restored." case; status timing with a held removal; refusal ×6 with reset drafts; partial reset; duplicate Reset; invalid registered and root sources, an unreadable source; readback uncertainty; conflict; unrelated save; set/reset in both directions; repeated refusal; fresh batch; batch continuing while unmounted; pane-local control; unrelated keys; zero broadcasts; locked scope (standalone); demo scope (production App); ZH wording |
| `queues` (56) | Q1–Q9 for theme (root) and railPos (registered): predecessor/latest orderings, pending Retry inert, equal-value successor, uncertainty across a denied read and lock, external replacement, removal and restoration conflicts, new work after discard; held lock ×7 pane and ×3 Topbar; cross-surface latest intent both directions with one lock request per edit; H5 (pane reflection, bottom-action revert); slider streams ×2; §6 orderings O1–O7 ×2; Topbar edit during a pending batch ×2; conflict plus unrelated quota; ruling-5 `fu2-retry-theme`, `fu2-retry-railPos` |
| `continuity-export` (26) | Sol layer with a standalone controller under real accountScope: A→B→locked→A, a same-account epoch change, an admitted batch across A→B, account-isolation and unrelated-lock invariants, unmount refusal; §8 shapes 1–8 in memory under total denial (attempt counters, one URL created and revoked, anchor removed, warning and Topbar status kept); exclusions; no empty download; Blob/URL/append/click setup failures EN and ZH; unmount during Blob/URL/append; export after A→B |
| `host` (33) | §7.1 no route guard (sidebar, AppRail, programmatic, Back/Forward); §7.2 Topbar status (Review navigates once through the shortcut event; placement after the premium badge slot; pending-only renders nothing; ZH name); §7.3 `beforeunload`; §7.4 sign-out step in the fallback and coordinator branches (no drafts, Cancel, OK); forced remount through the identity channel; §10.3 display truth (system theme listener, one controller, `.app[data-rail-pos]`, language draft); §10.4 malformed values written while running ×4; H10 ×4 and a drafted conflict; §10.7 isolation across every operation |
| `retry-all` (48) | PC-BEFORE; H17 EN/ZH; H15 EN/ZH; disabled state in the clean, pending-only and source-only states (attributes, Tab stop, inert click/Enter/Space, focus kept); clean-state status line; enabled with one (EN/ZH) and seven failures; scope (pane and Topbar sets, background, slider stream, failed Reset items, malformed source, conflict, uncertainty, failed predecessor); exclusions; duplicates (same turn, while pending, per-field in both orders); supersession (pane, Topbar, background, Reset); late completions (Discard, Discard all, sign-out, unmount, remount); A2.4 rules 1–3 EN/ZH; A2.5 focus (keyboard full success, partial, host row s); host rows o and p; export during a pass; two passes; per-field Retry after a repeated failure; Retry all during a Reset batch; no old button; ruling-5 `fu2-retry-all-theme`, `fu2-retry-all-railPos` |
| `original` (97) | The archive's own Appearance package tests (7 files), `Topbar.test.tsx`, `App.lazy-init`, `App.signout`, `shell.theme`, `shell.smoke` |

## Precondition policy

- A `PRECONDITION:` error marks a fixture or selector failure, never a product failure: a control found through the stable selectors, seeded bytes present, the injector, lock fixture, confirm recorder and StorageEvent counter installed, a test-held lock confirmed, a programmed hold engaged, an armed fault observed.
- Product behaviour that is itself a contract requirement is asserted as business and placed **before** the matching fault-observed precondition wherever the before product might not reach the faulted operation: the reset attempting `removeItem` of a root key (`reset` L749–L753, `queues` L1192/L1196), a readback-uncertain write being reported (`queues` L1120, L1126, `retry-all` L1108), and the ruling-5 step-3 attempt log. So a before product that never performs the operation fails on the business assertion, never on a precondition.
- At `5cd63ff` the absence of Retry all, recovery controls, the status line or the Topbar status is a business failure (`need(...)`), never a precondition.
- No case uses private product calls; every value comes from a closure-bound control, a range input change event, the Topbar menu, Reset, the recovery UI or another document's simulated commit.

## Iteration history

1. **`before1`** (all seven Sol modes; `bytes` first): zero PRECONDITION lines, every failure a business assertion, every positive control passing. Superseded.
2. **`before2`** (all seven Sol modes, then `original`'s only run): a review of the assertions that `5cd63ff` never reaches found two latent false failures for a correct fixed product, fixed without weakening any assertion — the sign-out helper toggled the avatar menu closed on a second sign-out in one test (it stays open after a Cancel), and the Topbar-status placement check required the testid element itself to be a direct child of `.topbar-controls` (the contract allows a wrapper node; the corrected check requires the status node to sit immediately after the premium-badge slot and before the popover). An explicit F-B002 self-check case was added to every oracle file. Outcomes were identical to `before1` (diffed case by case) plus the seven passing self-checks.
3. **`before3`** (all seven Sol modes, authoritative): two direct cases (`fields` L2270, `reset` L745) give H12 and H9 direct log support for the missing saved and "Defaults restored." lines, and a non-asserting observation in every source-at-load case gives H6/H7 direct evidence of what reaches `<html>` and `.app`. Outcomes were identical to `before2` (diffed) plus the two new correct FAILs.

The `typecheck` mode (logs `typecheck-static1`–`4`) ran `tsc --noEmit` over the oracle files inside the archive before iterations 1, 2 and 3 and executed no product or oracle code; `static1` found three type-level diagnostics (two TypeScript narrowings of mutable fault counters and one literal-array `includes`), fixed before `before1`; `static2`–`4` report zero oracle diagnostics (product-file diagnostics such as `import.meta.env` typing are counted and ignored).

## Contract/source observations (none blocks freezing)

1. **H6 omits `"EN"`.** `xai_pref_lang` = `"EN"` (in the §5 item 2 table) also crashes every `/app` route at `5cd63ff` (`useI18n("EN")` throws); the oracles cover it, so the fixed product must not crash on it.
2. **Malformed root bytes are applied raw** (the root-field analogue of H7, not a numbered hypothesis): see "Further correct FAILs".
3. **Zero-write mount scope.** §5 item 1 asks for zero set/remove attempts "on every other key" on "any route". `TasksModule.tsx:131–134` can persist its seeded canonical dataset on mount, which is outside this unit, so the every-key assertion is applied to the Appearance route with the popover and a reload (`bytes` L135–L136), and `/app/tasks` asserts the seven keys (L137). In jsdom `/app/tasks` made no other-key writes (observation L46).
4. **PC-BEFORE is deliberately conditional.** At `5cd63ff` it drives "Save & apply" and checks today's bytes; on a product without that button it asserts its absence and Retry all's presence (A2.1), so the same unchanged case passes on both products.
5. **The `original` scope is narrower than §10 item 10.** Composition tests, `cmdkIntegration`, `railFeatureFilter`, `departureCoordinator.blocker`, the router tests and the rest of the shell suite belong to E21–E23 (final verifier); they were not run here (no full package suite beyond `original`).
6. **Interpretations encoded (binding on the fixed product):** a genuine latest success (a plain edit, a completed held write or a successful Retry) shows "Appearance settings saved." when no draft, pending operation or source issue remains (H12, gate 1, the Features precedent); a reset batch or a pass that completes while the pane is unmounted makes no success claim on remount (A2.4 rule 4 with §5 item 7); a late completion after Discard of a held, not-yet-started write never writes (the engine's live validator refuses it).
7. **Mount remount at `5cd63ff`.** `AccountDataGate` locks and re-activates the scope once at mount, which remounts the App subtree; the Appearance pane's DOM-seeded mirrors are therefore seeded after App's first effects, so the before pane displays stored values (`bytes` L192). This is a property of the composition, not a hypothesis.
8. The contract has no conflict-specific wording; conflict oracles assert preserved bytes, recovery controls and the absence of success, and use the "was not saved" / "was not reset" lines for the drafted field.

## Limitations

- **jsdom only.** "The same frame" is approximated by settling React work and microtasks without a timer turn; layout, hit-tests, pet occlusion, 44×44 targets, contrast, the disabled-state presentation, page scroll on Space and the visible "Not saved" text are native (E4, E14, E15). The Topbar status is checked by role, accessible name, testid and placement only.
- **Keyboard and pointer input** come from `@testing-library/user-event` (synthetic, not trusted); `beforeunload` is detected as a canceled event or an assigned `returnValue`; the exclusive lock fixture does not reproduce browser lock-manager timing; downloads are observed, not saved (the native disk shapes are E11).
- **Cross-document behaviour** is simulated by native byte changes followed by a dispatched `StorageEvent`, and the identity channel by `StorageEvent`s on `xai:auth:identity-change`.
- **Composition differences:** the production route objects run in a memory router (not `createBrowserRouter`); `AppProviders` is not mounted because the auth hook is substituted and there is no network client; jsdom shims are Node's `AbortController`, `ResizeObserver`, `requestAnimationFrame`, a controllable `matchMedia`, `HTMLDialogElement.showModal`/`close`, and, in sign-out cases, a `window.location` recorder; network constructors refuse.
- **Deeper assertions not yet reached.** At `5cd63ff` almost every case ends at its first business assertion, so the export envelopes, Retry all attempt lists, pass feedback, focus and ruling-5 steps 2–6 first execute on the fixed product. Their harness paths are proven by the FIXTURE cases (including the programmed lock hold). Any later fixture correction must use a new suffix, rerun against both archives and never weaken a business assertion (§12).
- **Coupling to the shared engine.** Some oracles encode the contract's demand to preserve the shared queue, coalescing, baseline, reconciliation and lock semantics as observable attempt sequences and lock-request counts (for example, two lock requests for two cross-surface edits, one total write for an uncertainty, Retry all invoking members in display order).
- **Unhandled rejections** are observed through the Vitest worker's `unhandledRejection` event and window `error` events; Vitest also reports none.
- **Dependency reuse.** Third-party dependencies come read-only from `XAI_DEPS_ROOT`; the lockfile gate is a consistency check only.
