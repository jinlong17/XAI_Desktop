# Features recovery Sol before oracles (CP-FEATURES-01, batch 22)

**Verdict: FROZEN.** This directory freezes the Sol jsdom business oracles for the Settings Features caller (all 8 module toggles and Reset to defaults) before any implementation: contract §14 items **E1** (oracle files and runner with SHA-256 receipt and lockfile gate) and **E2** (before logs for the seven §12 modes). It freezes oracles only. It implements nothing, changes no product source or product test, accepts nothing, does not authorize Terra, and closes no 312 item (REL-05, REL-07, REL-10, UX-04, UX-05, QA-01, QA-03, QA-04, QA-09, SET-03 and D2/REL/AI stay open).

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol role mapping, isolated worktree; did not write the contract or any product code |
| Requested fixed revision | `f359be6` |
| Resolved fixed commit / tree | `f359be6d838393e0f9e93efd80b88b5b09f6144e` / `2280bc7617d52dc6c4356da257d57940ecb174ec`; features package tree `074659c050fadd11ed3ff99274e441b48771b490` (equals the contract) |
| Docs base (detached HEAD) | `4a54f7648cbed30d884f9e6976ece93a42ac92f6`; `git diff --name-only f359be6 HEAD -- apps packages package.json pnpm-lock.yaml` is empty |
| Authority | `../web-features-recovery-contract/contract.md` §2, §3, §5–§8, §10, §12, §13 rows 1–4 and 6, §14 E1/E2; `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` CP-FEATURES-01 and "本轮唯一任务" (batch 22) |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for the dependency checkout, `git show f359be6:pnpm-lock.yaml` and the extracted archive (all three recorded in every log header) |
| Archive product hash check | `FeaturesPane.tsx` in the archive = `987c38250554f05eee185073f92fdfafc504b5e3f9c183658fc5aeb583ce50ea`, `internal/featuresPane.tsx` = `14053daa…`, as the contract states (every log header lists 13 archive file hashes) |
| Diagnostic iterations | 2 of 3: `before1` (iteration 1, superseded) and `before2` (**authoritative E2 set**). `original` ran once (in `before2`). |

## Files and SHA-256

| File | SHA-256 |
| --- | --- |
| `fixture.tsx` | `f0b5d272695026f8e60df6dd2dbf5889790b3d2e834256259e86bb0432050ef8` |
| `bytes.test.tsx` | `904cb0de88eb5047365309df501ebbb8cb725a485963d23df022e7bbd26aba14` |
| `fields.test.tsx` | `506d54cbc39d0b69c53e7f45d4e3fa90ae77ae99f2ea68beb23d7540f08c0bc4` |
| `reset.test.tsx` | `dc4ee31e52a5800f30e7dbd924834e25f6f8a77dd5e88c8262443e1c322ac8e9` |
| `queues.test.tsx` | `d58160748187b7d7a7aeabfc620b694e7bc1e2714d37491aa99dbf8d8cb16f2b` |
| `continuity-export.test.tsx` | `1e3066f963edc15ba161937d26cbee949cb2886f1c3122740fd4c7c143c5a55a` |
| `downstream.test.tsx` | `88cf89c821b5f51abf2e4f373d1047304d51bb8817b33a1d7b8094516d38624d` |
| `verify-fixed.mjs` | `b5ac75fa1bc5ff65352afb5b598dc7309fb7435aa9ca96518dfd1d7ffb2f2f16` |
| `bytes-before2-f359be6.log` | `0fa71cffbda4712682ce406c2d53dff7b450849478ead57d9fb01769b06bf14b` |
| `fields-before2-f359be6.log` | `fe4b248b7d4499ea6128c23d86fef2b4c2bee1f38cd74338508e7ec10815214c` |
| `reset-before2-f359be6.log` | `5bf992a355875cc466efda5f59c3ab843670ad096cd70edbdecabe0785e8c978` |
| `queues-before2-f359be6.log` | `dfcd7145a3f8bb4477971d220cb0b9ee88627957d5c08d6b5a173db0648459b7` |
| `continuity-export-before2-f359be6.log` | `85280a8247159306b19fa322fdd22e763bd10d17a09c00106eb0889bfdfe1d62` |
| `downstream-before2-f359be6.log` | `9edea2867023e070049dc9de2c704868f2791a5250bbf2051a2e619abad55589` |
| `original-before2-f359be6.log` | `97d0b5e7c31c70f5b1c61901b15d859f392ad1340d7fcfaf676c378b98c0f0f0` |
| `readers-features-before2-f359be6.log` | `cba3c7a7a320294203a2f7b6237b5795ac11e3c2a413a690875af277a80d1c31` |
| `readers-web-before2-f359be6.log` | `f40e0a741c231a8dbf62cf38bda1dc1f82658c7afed7a636ce2d4e1894cc798b` |
| `bytes-before1-f359be6.log` (superseded) | `8647a57ed901201b38df6fec16cbfe8f4b2f59aefb0a7b7a989f027df233e620` |
| `fields-before1-f359be6.log` (superseded) | `13587821162336031f706efb9d6aceb99b6e536eaa0626eca80323d39ccd3628` |
| `reset-before1-f359be6.log` (superseded) | `ea644ceef6cc3c681feb7546d22671e075ba8449a87aa18675edc276c9b12c45` |
| `queues-before1-f359be6.log` (superseded) | `402aafd478c140e8e6a70d17ea4cae618237c370a0e202b5973ca303463f7c6f` |
| `continuity-export-before1-f359be6.log` (superseded) | `e7dc6b2dca6feb1873932bf8837ddb0e46a633b956616450610bf7927a168c37` |
| `downstream-before1-f359be6.log` (superseded) | `0845eea40788ed8c3d37bac3d534604fc0f617148bb6432f06066c40e6356bdd` |

All nine `before2` headers carry one identical `oracle_sha256` line, and it equals the table above, so the authoritative logs were produced by exactly these files. The six `before1` headers carry one identical line that differs only for the three files changed in iteration 2: `fields.test.tsx=7711e9f7…`, `downstream.test.tsx=8d916cce…`, `verify-fixed.mjs=432c30c3…`.

## Commands

From the repository root of this worktree:

```sh
# Iteration 1 (superseded diagnostics), one mode at a time
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-features-recovery-sol/verify-fixed.mjs f359be6 bytes before1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-features-recovery-sol/verify-fixed.mjs f359be6 <fields|reset|queues|continuity-export|downstream> before1
# Iteration 2 (authoritative): every mode, including original (its only run) and the reader controls
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-features-recovery-sol/verify-fixed.mjs f359be6 all before2
```

Fixed reruns (E7) use the unchanged files and a new suffix, for example `... verify-fixed.mjs <fixed-sha> <mode> fixed1`, with an `XAI_DEPS_ROOT` checkout whose lockfile matches that SHA. Modes: `bytes`, `fields`, `reset`, `queues`, `continuity-export`, `downstream`, `original` (the seven §12 modes) plus `readers-features` and `readers-web` (the §10 item 10 reader tests as the §12 positive control), or `all`.

Before the first run, a static esbuild syntax transform and a `tsc --noEmit` pass over the oracle files inside an archive of `f359be6` executed no product or oracle code and reported zero oracle diagnostics.

## Runner guarantees (`verify-fixed.mjs`)

- Expands `git archive <resolved commit>` into a fresh realpath temporary directory and asserts SHA-256 equality of the dependency checkout's lockfile, the committed lockfile and the extracted lockfile.
- Copies the seven oracle files into `docs/reviews/web-features-recovery-sol/` inside the archive and verifies each copy against the evidence hash.
- Gives every archive workspace (`packages/*`, `apps/*`) a private `node_modules`: read-only third-party links from `XAI_DEPS_ROOT`, and `@repo` links to the archive's own folders for every declared workspace dependency, so Node and tsconfig `extends` resolution stay inside the archive (46 tsconfig `extends` checked, none unresolved). The oracle directory gets links to the single `react`, `react-dom`, `@testing-library/react` and `react-router` instances.
- Aliases every archive `packages/*` export specifier exactly (75 aliases) to the archive file. A guard plugin fails the run if any module is transformed from the dependency checkout's `packages/`, `apps/` or `docs/`, fails any unaliased `@repo` import that resolves outside the archive (there were none), and records every archive module; a harness check requires the mode's product modules (25 for `downstream`, including `apps/web/src/App.tsx`, `AccountDataGate.tsx`, `AppRail.tsx`, `DesktopPet.tsx`, `CommandPalette.tsx`, the event-bus emitter and the auth `session.tsx`/`guards.tsx`) to have been loaded from the archive.
- Writes `requested_revision`, `resolved_commit`, `resolved_tree`, all three lockfile hashes, the oracle and runner hashes, 13 archive file hashes, versions (Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, Node v24.16.0), Vitest stdout and stderr, and a runner summary: one `case NNN PASSED|FAILED [PRECONDITION] | <name>` line per case with the failure's first line, the PRECONDITION count, six harness checks and the module-pin record.
- Refuses to overwrite: checked before archiving, again before writing, and by an exclusive create. Verified: rerunning `bytes before2` exited 1 with `Evidence exists; use a new suffix` before archiving anything.
- Preserves nonzero exit codes (first nonzero Vitest status; 2 when Vitest exits 0 but a harness check fails).
- Keeps Vite caches and the bundled-config temp files inside the temporary archive and deletes it afterwards. No `xai-features-sol-*` directory remains, and the dependency checkout's `.vite`/`.vite-temp` directories predate this batch.
- Filters only React's "not wrapped in act(...)" console warning.

## Before results at `f359be6` (authoritative `before2`)

| Mode | Passed | Failed | Total | `PRECONDITION` | Exit | Harness |
| --- | --- | --- | --- | --- | --- | --- |
| `bytes` | 17 | 0 | 17 | 0 | 0 | 6/6 |
| `fields` | 0 | 49 | 49 | 0 | 1 | 6/6 |
| `reset` | 2 | 29 | 31 | 0 | 1 | 6/6 |
| `queues` | 0 | 40 | 40 | 0 | 1 | 6/6 |
| `continuity-export` | 3 | 23 | 26 | 0 | 1 | 6/6 |
| `downstream` | 9 | 6 | 15 | 0 | 1 | 6/6 |
| `original` (AC-PANE-1–6) | 6 | 0 | 6 | 0 | 0 | 6/6 |
| `readers-features` (§10 item 10) | 17 | 0 | 17 | 0 | 0 | 6/6 |
| `readers-web` (§10 item 10) | 18 | 0 | 18 | 0 | 0 | 6/6 |

The Sol matrix has 178 cases: 31 PASS (3 bytes FIXTURE + 1 downstream FIXTURE; 18 positive controls; 9 invariants or refuted-hypothesis requirements) and 147 correct business FAILs. No failure is a precondition, selector or fixture failure, and no log reports a suite error or an unhandled error or rejection.

**Iteration 1 (`before1`, superseded).** `bytes` 17/17, `fields` 0/49, `reset` 2/31, `queues` 0/40, `continuity-export` 3/26 (identical outcomes to `before2`), and `downstream` 8 passed / 7 failed with **one PRECONDITION** (L398–399): my H6 "after" case seeded Boards `false`, so Boards was legitimately absent from the rail while the expected display listed all 14 rail entries. Iteration 2 seeds Boards as stored `true` (the reset still performs a real removal; rail membership stays constant) without changing any business assertion. Iteration 2 also only strengthened oracles: the §9 case now also requires guard registration at a clean mount (§9/§11: "registers whenever the host provides the hook"), the D2 sequence now checks the App's unrelated displayed values after every Features operation (§10 item 5), and the runner gained the two reader-control modes. `original` was not run in iteration 1.

## Hypotheses H1–H7 and H9

Line numbers refer to the named `before2` log. H8 belongs to the parent host baseline (E3); H10 and the native parts of H5 and H6 belong to E4.

| ID | Disposition | Evidence | Notes |
| --- | --- | --- | --- |
| H1 | **confirmed** | `fields` L1255–1256 `H1: tasks keeps displaying the latest choice after its write failed: expected true to be false`; the same for board L1259, dashboard L1263, calendar L1267, matrix L1271, pomodoro L1275, habits L1279, meditation L1283 (both directions: off and back on). Also `queues` L576, L578; `continuity-export` L533, L541, L547; `downstream` L368–369 (production App: the rail and the bytes stay unchanged, the pane snaps back). | No feedback, Retry or export exists to recover the choice (H9). |
| H2 | **confirmed** | Throwing read, all 8: `fields` L1257–1258 `H2: "Saved Tasks is unavailable. Reload it; this is not a new unsaved change." source alert: expected false to be true`, then L1261 … L1285. Malformed bytes, 16 cases covering `1`, `0`, `TRUE`, `True`, `yes`, empty, `"true"` and ` true` on every field: L1287–1318. `fields` L1319–1320: a valid toggle silently overwrote the invalid `yes` with `false`. | In every source case the first assertion (the default "on" is displayed) passes; the failure is the missing alert or Reload. |
| H3 | **confirmed** | All 8 under the real held lock: `queues` L590–605, e.g. `H3: the held per-key lock keeps the physical bytes unchanged: expected 'false' to be null`. `fields` L1335–1338: `H3: the write consults the Web Lock capability: expected 0 to be greater than 0` and `…requests the per-key Web Lock…`. Also `queues` L572–573, L582–585, L588–589, L622–629; `fields` L1327–1328; `downstream` L366–367, L370–371. The raw reset also ignores held locks: `reset` L760–761, L768–769, L772–773; `continuity-export` L536–537, L548–549. | The test exclusively held `prefMutationLockName("xai_pref_features_<id>")` (precondition held) while f359be6 wrote anyway. |
| H4 | **confirmed** | `queues` L606–621, all 8: `H4: the second activation inverts the latest intent, not the rendered closure: expected false to be true` (and `true to be false` for fields starting off). | Two same-turn activations end on the opposite of the latest intent. |
| H5 | **confirmed** (pane and reader layers) | Refused removal, all 8: `reset` L740–755, e.g. `H5: "Tasks was not reset to its default." failure feedback: expected false to be true`; in each case the preceding assertions passed: only the refused key keeps `"false"` and its switch shows on. Reader layer: `reset` L756–757, the real `useFeaturePrefs` rail input shows all 8 modules while Calendar's bytes stay `"false"`. Production App: `downstream` L372–373, no failure feedback or Retry. | In the production App the "pane and rail show on" part is masked: the same reset remounts the App (see H6), so the rail re-reads Calendar as off (rail assertions passed before L373). The native part is E4. |
| H6 (hook layer) | **confirmed** | `reset` L736–737 and diff L205–249: mounted legacy `usePref` readers of `xai_accent_hue`, `xai_bg_tone`, `xai_rail_pos`, `xai_rail_order`, `xai_pet_id`, `xai_pet_pos` were repainted to 165, `default`, `left`, the default rail order, `mochi` and `{24,24}` while their bytes were unchanged. | The mechanism holds for every legacy reader that stays mounted. |
| H6 (production App, as stated) | **refuted** (PASS, still binding) | `downstream` L376 (case 012 PASS): after the reset, accent hue, background tone, rail position, AppRail order, pet id and position, and their bytes equal the seeded values. L379 (case 014 PASS): a drag after the reset persists an order derived from the stored custom order. | Not because the reset is harmless: see the next row. The native part is E4. |
| §10.5 "during" (related finding) | **correct FAIL** | `downstream` L377–378, diff L333–337: `accountGateShown: true`, `accountScopeChanged: true`, `paneRemounted: true`, `petRemounted: true`, `railRemounted: true`. Also `reset` L733–734 and `downstream` L374–375: `D2: … key === null: expected 1 to be +0`. | The reset's `key: null` StorageEvent makes `AccountDataGate` relock and re-activate account A, so the whole workspace is replaced by the account-gate screen and remounted (see Contract/source mismatches, item 1). |
| H7 | **confirmed** | `fields` L1333–1334: `H7: no 'Saved' claim anywhere after a failed toggle (Save & apply exercised when present): expected true to be false`. `reset` L725–728 with L122 and L138: the confirmation says `Reset every preference to defaults? This clears saved theme, layout, and module toggles.` / `确定恢复所有设置为默认值？这会清除保存的主题、布局和模块开关。` | `reset` L729–730 (§6/D3): the reset control is the shared footer's `settings-footer-reset`. |
| H9 | **confirmed** | `fields` L1331–1332 `H9: a genuine latest success shows the truthful Saved status: expected false to be true`; L1341–1342 `H9: Retry Habits: expected null not to be null`; L1347–1348 `H9: Discard all changes`; L1323–1324 and L1345–1346 Reload missing. `reset` L731–732 `H9: the truthful 'Defaults restored.' status after all 8 completed: expected false to be true`, L781–782. `queues` L574–575, L580–581, L586–587. | f359be6 renders no recovery UI at all, so per-field Discard and Export never appear either; their deeper assertions first execute on the fixed product. |

No listed hypothesis was refuted outright except H6 as stated for the production App, and that requirement still binds the fixed product. Every confirmed failure is a requirement that the same unchanged assertions must PASS on the fixed product.

**Further correct FAILs (section requirements, no hypothesis number):** §6 already-absent reset makes 8 raw removes instead of verified no-ops (`reset` L738–739); Reset purges malformed and unreadable bytes (`reset` L762–765, REL-07); Reset never verifies absence by readback (`reset` L766–767); §6/D3 control (`reset` L729–730); §9 no departure guard (`fields` L1339–1340).

## Positive controls PASS at `f359be6`

- `bytes` L66–82: storage injector, Web Lock and accountScope/host/download/confirm/StorageEvent fixtures (L66–68); registry codec boolean, default `true`, schema 1, category `pref`, device ownership, lifecycle `device-recovery`/`retain`/`retain-on-device`, unscoped physical key, per-key lock name, and `featureIdOrder`/`featurePrefKey` (L69); all 16 values with exact bytes at the unscoped key, `true` stored rather than removed (L70–77); absent zero-write mount with defaults on across rerenders and EN/ZH (L78); valid zero-write mount (L79); standalone `render({lang})` (L80); declined confirmation makes zero get/set/remove attempts (L81); accepted reset removes all 8 and never writes (L82).
- `downstream` L360–364: the production App mount (FIXTURE); App readers and route guards make zero writes (L361); the rail filter updates after a successful toggle, all 8 (L362); clean navigation to an off module's fallback and back to the original module (L363); CmdK search truth (L364).
- `original` L55–60: AC-PANE-1–6, 6/6.
- `readers-features` L66–82 (AC-FB-1–3, AC-REG-1–3, AC-FILTER-1–4, AC-PREFS-1–3, AC-WRAP-1–4) and `readers-web` L67–84 (`cmdkIntegration` CI1–CI5, the two composition tests and `settingsPaneComposition.test.tsx`, `railFeatureFilter` AC-APP-1–3): the §10 item 10 reader tests, 35/35, each under its package's own test semantics.
- Invariants and refuted-hypothesis requirements that PASS: `reset` L735 (every unrelated key byte-identical), L774 (reset while locked); `continuity-export` L538, L539, L556; `downstream` L365 (a full reset restores all 8 rail entries), L376 and L379 (H6 as stated, refuted), L380 (§10.6 snapshot).
- Not run by Sol: clean sign-out (parent host baseline, E3). E21 re-runs the reader tests from the fixed archive.

## Fixture validity proof

- **Storage injector** (`bytes` L66): get/set/remove attempts are logged in call order before delegation; a faulted `setItem` throws `QuotaExceededError`, is logged with `threw` and never reaches storage; after-set and after-remove read faults stay unarmed until their write or removal and then fire once; a faulted `removeItem` never removes; total denial fires for all three operations; disarmed faults stop; only `localStorage` is counted. In the business cases every `fired(...)` precondition held: zero `PRECONDITION` lines across the 178 Sol cases.
- **Web Lock fixture** (`bytes` L67): grants are asynchronous; a held name keeps exactly one queued product waiter, granted only after release, while an independent name is granted at once; shared holders coexist while an exclusive request waits; deny rejects with a lock error; the missing capability is explicit; no unsupported request shape. In every held-lock case the precondition "the test exclusively holds <name>" held. Teardown converts any unsupported lock request into a `PRECONDITION` error; none occurred, so no accidental `lock-unavailable` was possible.
- **accountScope, host registry, download harness, confirm recorder, StorageEvent counter** (`bytes` L68): real A→B→locked→A and same-account generation changes advance the epoch while the 8 keys stay unscoped; token-keyed guard registration; URL create/append/click/revoke and Blob contents observed; `window.confirm` recorded and answered; keyed and `key: null` StorageEvents counted and still delivered.
- **Production App composition** (`downstream` L360): the substituted `useWebAuthSession` served the App, `AppRouteGate` and `AccountStorageGate`; the real Features pane, AppRail (14 entries), DesktopPet and `AccountDataGate` (account A activated) rendered; the real event bus carried the production CmdK `web:search:invoked` event; zero fetch/XHR/WebSocket/EventSource attempts. The runner's provenance check confirmed 25 product modules from the archive.

## Oracle inventory by contract gate

| Gate (§13) | Oracle file and cases |
| --- | --- |
| 1. All 8 toggles | `bytes.test.tsx` (17) and `fields.test.tsx` (49): per-field failure and Retry ×8; throwing read ×8; 16 malformed sources; valid edits over invalid and unavailable sources; same-turn Reload refusal; all 8 unresolved with targeted Retry and Discard all; conflict plus unrelated quota; targeted Discard; truthful Saved; H7 Save & apply; missing/rejected lock; guard and beforeunload; uncertainty; sibling source error; source repair isolation; Discard all visits only drafts; EN/ZH wording and export failure. Plus `original`. |
| 2. Reset to defaults | `reset.test.tsx` (31): confirmation text EN/ZH; Features-local control; verified absence and Defaults restored; no StorageEvent; unrelated-key snapshot; H6 hook layer; already-absent no-op; per-field refusal ×8; H5 reader layer; partial reset; duplicate reset; invalid and unavailable source refusal; readback uncertainty; conflict; unrelated save; status timing; locked; set/reset failure in both directions; repeated refusal; fresh batch; ZH wording. |
| 3. Same-field and set/reset attribution | `queues.test.tsx` (40): Q1–Q9 for Boards; held lock ×8 (H3); same-turn double activation ×8 (H4); double activation under a held lock; O1–O7 set/reset orderings on Habits and Matrix. |
| 4. Device continuity and export | `continuity-export.test.tsx` (26): A→B→locked→A with a held lock and fresh B/locked exports (shapes 7, 8); old inline Retry/Discard/Discard all/Export/Reset callbacks; same-account epoch change; an admitted reset batch across A→B; account-isolation and unrelated-lock invariants; shapes 1–6 and 9 in memory under total denial (shape 5: all 8 pending resets); exclusions; no empty download; blob/url/append/click setup failures; epoch change and unmount at blob/url/append; unmount cleanup. |
| 6. Downstream readers and isolation | `downstream.test.tsx` (15): §10 items 2–6 in the production App; plus `readers-features`/`readers-web`. |

## Precondition policy

- A `PRECONDITION:` error marks a fixture or selector failure, never a product failure: control found through the stable selectors only (`[data-feature-id="<id>"] [role="switch"]`, the Reset to defaults/恢复默认 button by role and name, recovery UI by the §5 roles and names), seeded bytes present, the injector, lock fixture, confirm recorder and StorageEvent counter installed, an armed fault observed through the counter, or a test-held lock confirmed.
- Product behavior that is itself a contract requirement is asserted as business, not as a precondition: the Web Lock capability consulted or the per-key lock requested (H3), the reset confirmation asked exactly once, readback after a removal, a repeated reset or a denied-read/denied-lock Retry re-attempting its operation, and an export reaching a setup stage. Fault observation after an edit, a reset or a Retry ("fault armed and observed") stays a precondition, as §12 prescribes, and so do the action checks that give a comparison its meaning ("the reset ran" before the H6/§10.5/§10.6 comparisons, "the drag-reorder persisted a changed rail order" before the drag comparison; the reset itself is proven by business cases elsewhere). At f359be6 every precondition held.
- No case uses private calls; every value comes from a closure-bound switch, Reset to defaults, the recovery UI or the registered guard.

## Contract/source mismatches

None blocks freezing. Observations:

1. **§3 item 6 omits a `key: null` listener.** `packages/plugin-web-storage/src/AccountDataGate.tsx:66–69` treats `event.key === null` as a generation-marker change: it calls `accountScope.lock(accountId)` and bumps `retry`; the retry effect (`:44–57`) re-activates the marker generation (`:52`), and the keyed `Fragment` (`:99`) remounts the whole business subtree. In the production composition the Features reset therefore shows the account-gate screen for a commit and remounts the App, rail, pet, CmdK provider and the Features pane itself (`downstream` L333–337). Consequences: H6 as stated is not observable after settle in the production App (refuted there, confirmed at the hook layer), and H5's "pane and rail show on" is masked in production. The §10 item 5 requirements ("during and after") are encoded unchanged and bind the fixed product; E4 should look for the same interruption natively (likely a visible one-frame flash, since the re-activation runs in a passive effect).
2. §12's positive-control list mixes layers: clean sign-out belongs to the parent host baseline (E3); the reader tests are run here as a before control (`readers-*`) and again by the final verifier (E21).
3. The §5 wording table has no conflict-specific message, so conflict oracles assert recovery controls, preserved bytes, the guard and the absence of Saved, but no message text.
4. §6 specifies `data-testid="features-reset-defaults"` in addition to the role/name selector of §12; the oracles select by role and name and assert the testid as a §6/D3 business requirement (`reset` L729–730).

## Retained limitations

- **jsdom only.** The exclusive lock fixture does not reproduce browser lock-manager timing; downloads are observed, not saved (native disk JSON for the nine §8 shapes is E11); a beforeunload warning is detected as a canceled cancelable event; keyboard, trusted input, hit-tests, 44 px targets and layout (§9, H10) are out of Sol scope; the StorageEvent counter sees dispatches through `window.dispatchEvent`.
- **Deeper assertions not yet reached.** At f359be6 no draft, reset draft or recovery UI exists, so the export, permission-epoch and unmount cases first fail on H1/H5/H9/H3. Their zero-attempt counters, single URL create/revoke, anchor removal, whole-envelope equality and cancellation assertions first execute on the fixed product; their harness paths are proven by the FIXTURE cases.
- **Coupling to the shared engine.** Some oracles encode the contract's demand to preserve the shared queue, coalescing, baseline and uncertainty semantics as observable attempt sequences (two operations for a double activation, one write or one remove for an uncertainty, zero sibling attempts, exactly one remove per key across a duplicate reset). Under §12, any later fixture correction must use a new suffix and must not weaken a business assertion.
- **Accepted alternative renderings.** Reload may be hidden or refuse while a draft exists; a pending Retry may be removed or inert; a held operation or an admitted reset may finish or keep its own recovery after an epoch change; a duplicate Reset control may be hidden or disabled while a batch is pending.
- **Guard timing.** The guard must be registered at a clean mount whenever the host provides the hook, and must block only while actual drafts (including pending operations) exist.
- **Downstream composition.** The production route objects run in a memory router (`createMemoryRouter(webHostRouteObjects)`) rather than `createBrowserRouter`; `AppProviders` (the auth provider layer, the todo runtime bridge and the deletion-recovery bridge) is not mounted because its role is replaced by the hook substitution and there is no network client; jsdom shims are Node's `AbortController`, `ResizeObserver`, `requestAnimationFrame` and `matchMedia`. The two-document item (§10 item 7) is native (E13).
- **Unhandled rejections** are observed through the Vitest worker's Node `unhandledRejection` event; Vitest also reports none.
- **Dependency reuse.** Third-party dependencies come read-only from `XAI_DEPS_ROOT`; the lockfile gate is a consistency check only.
