# Dashboard Clock recovery Sol before oracles (CP-CLOCK-01, batch 68)

**Verdict: FROZEN.** This directory freezes the Sol jsdom business oracles for the Dashboard Clock caller (`xai_clock_style`, `xai_clock_tz`, and Dashboard departure participation) against the before product `f9eb4b1`, before any implementation exists. It covers contract r2 §14:

- **E1:** the oracle files and runner with a SHA-256 receipt; the lockfile gate; the archive byte count and the streaming method; the F-B002 spy self-check; the in-domain seed table; the §12 consistency matrix with case references.
- **E2:** the before logs of the six §12 Sol modes (`bytes`, `fields`, `queues`, `departure`, `continuity-export`, `original`), with per-case outcomes for H1–H6 and the positive controls (H7, H8, D1, D10, D5's zero-confirm recorder).

It freezes evidence only. It changes no product source, product test, contract, ledger or control plane. It accepts nothing, does not authorize Terra and closes no 312 item.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol role, isolated worktree `.claude/worktrees/agent-a00cdc82590c0763c` (detached). It did not write the Clock contract (r1 or r2), did not execute any AppRail batch and wrote no product code |
| Docs base (detached HEAD) | `40f07b23fa3a92a221af9dff86617bd69da2be23` (control plane batch 68). Every log header records `runner_checkout_head=40f07b2…` and `product_tree_delta_files_vs_runner_head=0` |
| Requested before revision | `f9eb4b1` |
| Resolved commit / tree | `f9eb4b1f207bc4b46f547b90afc250424b3c8695` / `05887cf113639116b228a25041a37b3d5c69a322`. Package trees recorded in every header: `xai-web-dashboard-widgets` `4d65ad16…`, `xai-web-dashboard-grid` `8e96464c…`, `plugin-web-storage` `782c79de…`, `xai-web-shell` `4ea3eb5b…`. All equal the contract r2 header |
| Authority | `../web-dashboard-clock-recovery-contract/contract.md` r2 (`8bf6139`), SHA-256 `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`, re-derived and **asserted by the runner** on every run (`contract_r2_sha256=` header line); `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` "本轮唯一任务" (batch 68) and the CP-CLOCK-01 rows (A1–A9 and the five §17 answers confirmed) |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for all four values: the dependency checkout, `git show f9eb4b1:pnpm-lock.yaml`, the extracted archive and the runner constant. Every log header records them |
| Archive | **Streamed** (contract §12 rule 7): a spawned `git archive f9eb4b1` piped into `tar -x`, no fixed buffer. Streamed byte count **148,408,320** (equal to the contract's figure for `f9eb4b1`), streamed SHA-256 `bb468cede8a9659d9798bdb4c7f0a528faedf3ddfb344fb946f159ce6305a097`. Every log header records both (`archive_method=stream … archive_bytes=148408320 archive_sha256=bb468ced…`) |
| Archive product hash check | Every header lists 50 archive file hashes (`archive_file_sha256`). All 50 equal the contract r2 header table exactly (checked by script against the table; 0 mismatches) |
| Dependency root | `XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop` (the main checkout), **read only**: nothing was installed, built, written or checked out there, and no dev server or preview tool was started anywhere |
| Diagnostic iterations | `before1` for all six modes. `before2` for `departure` only (one added positive case, no assertion weakened). No mode needed a third. See "Iteration history" |

## Files and SHA-256

Every file in this directory except this README (which cannot carry its own hash).

| File | Role | SHA-256 |
| --- | --- | --- |
| `verify-fixed.mjs` | Sol runner (E1) | `8b2c95c2a29763d2a5d11aaa9d22c8ebf6782b3275b79d2a1901e1486ac80d20` |
| `fixture.tsx` | Shared fixture (E1) | `589d065cb314928e29082a30aa861d288af7823aacbf1c91b6f944b4811bac00` |
| `bytes.test.tsx` | Oracle (E1) | `996dd32e0ee034ac2d57bcd86b48dfe803290431b0ef8503d8232a730e8c5215` |
| `fields.test.tsx` | Oracle (E1) | `4c6af5f6a41cae2c1a54c4771b7fdea7a705668d5dae0f316d0d5a8837258cef` |
| `queues.test.tsx` | Oracle (E1) | `a2be7088a07278a85f5a3b74c091ec7346f34ffb563f7b0e570baad9de9cb850` |
| `departure.test.tsx` | Oracle (E1) | `8d7c517cdc485929131c1d30d7b55c33e37c495d3da75cec7647c8545285c456` |
| `continuity-export.test.tsx` | Oracle (E1) | `17d021a2a4873c788f2586d20bf2931a70b9c06e5417e0940704e64701513135` |
| `bytes-before1-f9eb4b1.log` | **Authoritative** | `d4caee6efcdfa5b9f07335d1b6e96e68ad9285faa281956ba3fd733214f3f3db` |
| `fields-before1-f9eb4b1.log` | **Authoritative** | `ecd476918907883bdbeaf6fb311373c826bdc3977ce4789ce452bc662206b43d` |
| `queues-before1-f9eb4b1.log` | **Authoritative** | `49d3790edbd2a83e12dde5a3d054d63188f8653c432cfe828074835245abc72c` |
| `departure-before2-f9eb4b1.log` | **Authoritative** | `5c281f5febc962661e1c1b1bd495f8dba1dc8ad8660cbfaa072aa682c54566df` |
| `continuity-export-before1-f9eb4b1.log` | **Authoritative** | `d9331e2cade52e583d954195e00a23f21a6d5379504db15411af0591a5764d13` |
| `original-before1-f9eb4b1.log` | **Authoritative** (its only run) | `2c8ee26d1ad1bec62673b187a86264b2757aa3a517b6c091d47b0fb53be3758e` |
| `departure-before1-f9eb4b1.log` | Superseded (kept) | `1b889fab607d2c22382c21e9e0dee28e1d6cf2344dcc586667e07fafade1fb5f` |
| `typecheck-static1-f9eb4b1.log` | Static check (not a §12 mode) | `99bbd7ced9e45c2fde2eb2255ab7451ce8cdd89234218bf96a83b793cb13d3fa` |

**Oracle hashes in the log headers.**
- The `before2` header (`departure`) carries an `oracle_sha256` line equal to the table above.
- The `before1` headers and `typecheck-static1` carry one shared line that differs from the table only in `departure.test.tsx=613d0a8b97ca943425eb4614ca0eb351dab71dd24705e04cf9248acb66f42ecc` (the file before the iteration-2 addition).
- So the authoritative `bytes`, `fields`, `queues` and `continuity-export` logs were produced by exactly the frozen `fixture.tsx` and their frozen test files; `original` runs only the archive's own tests.
- The runner hash `8b2c95c2…` and the fixture hash `589d065c…` are identical in all eight logs.

## Commands

From the repository root of this worktree. The dependency root is read only.

```sh
DEPS=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop
# Iteration 1: the six section 12 modes (bytes, fields, queues, departure, continuity-export, original); runner exit 1
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-dashboard-clock-recovery-sol/verify-fixed.mjs f9eb4b1 all before1
# Static typecheck of the oracle files inside the archive (executes no product or oracle code); runner exit 0
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-dashboard-clock-recovery-sol/verify-fixed.mjs f9eb4b1 typecheck static1
# Iteration 2 (one added positive case): departure; runner exit 1
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-dashboard-clock-recovery-sol/verify-fixed.mjs f9eb4b1 departure before2
```

**Fixed reruns (E7).** Use the unchanged files with a new suffix, for example `… verify-fixed.mjs <fixed-sha> all fixed1`, from a checkout whose Clock contract is still r2 (the runner asserts its hash) and with an `XAI_DEPS_ROOT` whose lockfile matches that revision (the runner refuses any other). Contract §14 E7 requires all six modes to PASS with zero `PRECONDITION` lines.

## Runner guarantees (`verify-fixed.mjs`)

Derived from the accepted AppRail Sol runner (`../web-apprail-order-recovery-sol/verify-fixed.mjs`, `e944cb22…`): same lockfile gate, pin and guard design. Changes:
- **Archive (rule 7).** The archive is streamed from a spawned `git archive` into `tar -x`; the runner counts and hashes the streamed bytes and records them. There is no `maxBuffer` on the archive path.
- **Contract pin.** The runner asserts the r2 contract SHA-256 at the runner checkout before anything runs, and records the count of product-tree files that differ between the revision and the runner HEAD (0 here).
- **Modes and semantics.** `bytes`, `fields`, `queues` and `continuity-export` run under the Clock's owning package semantics (`xai-web-dashboard-widgets`: jsdom, no globals, its `src/__tests__/setup.ts`). `departure` runs under the departure host's semantics (`xai-web-dashboard-grid`: jsdom, no globals, its setup). `original` runs both packages' own tests (`src/**/*.test.{ts,tsx}`), each under its own semantics, in one log.
- **Oracle staging.** It copies the six oracle files into `docs/reviews/web-dashboard-clock-recovery-sol/` inside the archive and verifies each copy against its evidence hash.
- **Private node_modules.** Every archive workspace gets its own: 448 read-only third-party links from `XAI_DEPS_ROOT` and 281 `@repo` links into the archive (46 tsconfig `extends` checked, none unresolved). The oracle directory links the single `react`, `react-dom`, `@testing-library/react`, `react-router`, `vitest` and `@types/react` instances.
- **Pin and guard.** 75 exact-match aliases map every archive `packages/*` export specifier to the archive file. A guard plugin fails the run if any module is transformed from the dependency checkout's `packages/`, `apps/` or `docs/`, or if an unaliased `@repo` import resolves outside the archive. Every authoritative log shows `pin_unaliased_repo_imports=0` and `pin_required_provenance_missing=none`. Required archive provenance: 18 modules for `fields`, `queues`, `continuity-export` (`ClockWidget.tsx`, `registrations.tsx`, `cityLibrary.ts`, `DashboardModule.tsx`, `DashboardGrid.tsx`, `DashHeader.tsx`, `WidgetShell.tsx`, `WidgetGhost.tsx`, and the storage `usePref`, `usePrefAsync`, `usePrefAutosaveAsync`, `prefMutation`, `accountScope`, `storage`, `registry`); 21 for `bytes` (also `lifecycleDeclaration.ts` and the CmdK `readModuleStates.ts` and `adapters/dashboard.ts`); 23 for `departure` (also `departureCoordinator.tsx`, `dashboardRegistration.tsx`, `settingsDeparture.ts`, `shellRegistrations.tsx`, the shell `Shell.tsx`, `AppRail.tsx`, `Topbar.tsx` and the event-bus emitter); `original` 3 (widgets) and 3 (grid).
- **Log contents.** Requested and resolved revision and tree, package trees, archive method, byte count and SHA-256, contract hash, the four lockfile values, the oracle and runner hashes, the 50 archive file hashes, versions (Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, TypeScript 5.9.2, Node v24.16.0, tz America/Los_Angeles), Vitest stdout and stderr, and a runner summary with one `case NNN PASSED|FAILED [PRECONDITION] | <name>` line per case followed by the failure's first line, the PRECONDITION count, six harness checks per invocation and the module-pin record.
- **Refuses to overwrite** (checked before archiving, again before writing, exclusive create). **Preserves nonzero exit codes**: the first nonzero Vitest (or tsc) status, or 2 when Vitest exits 0 but a harness check fails. Only React's "not wrapped in act(...)" warning is filtered. Vite caches stay inside the temporary archive, which is deleted afterwards.

## Before results at `f9eb4b1` (authoritative)

| Mode | Passed | Failed | Total | `PRECONDITION` | Exit | Harness | Authoritative log (totals line) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `bytes` | 45 | 0 | 45 | 0 | 0 | 6/6 | `bytes-before1-f9eb4b1.log` (L103) |
| `fields` | 1 | 37 | 38 | 0 | 1 | 6/6 | `fields-before1-f9eb4b1.log` (L921) |
| `queues` | 1 | 23 | 24 | 0 | 1 | 6/6 | `queues-before1-f9eb4b1.log` (L529) |
| `departure` | 7 | 18 | 25 | 0 | 1 | 6/6 | `departure-before2-f9eb4b1.log` (L526) |
| `continuity-export` | 4 | 19 | 23 | 0 | 1 | 6/6 | `continuity-export-before1-f9eb4b1.log` (L383) |
| `original` | 579 | 0 | 579 | 0 | 0 | 12/12 | `original-before1-f9eb4b1.log` (L683) |

**Sol matrix (five oracle modes): 155 cases, 58 PASS and 97 correct business FAILs, 0 `PRECONDITION`.**
- The 58 passes are 6 FIXTURE cases (the F-B002 self-check in each of the five files, and the Web Lock exclusivity self-check) and 52 positive controls or invariants.
- **Every failure is an `AssertionError` on a business assertion** whose message carries an `H<n>`, `D<n>`, `A<n>` or `§<n>` tag (checked by script: 97/97 first lines are `AssertionError: <tag> …`). No failure is a PRECONDITION, selector, fixture or harness error; no log reports a suite error, an unhandled error or a rejection (`unhandled_error_lines=0` everywhere).

**`original`.** 579/579 PASS: `xai-web-dashboard-widgets` 34 files / 351 tests and `xai-web-dashboard-grid` 25 files / 228 tests (equal to contract E22's 25 files / 228 tests).

**Static check.** `typecheck-static1` ran `tsc --noEmit` over the oracle files inside the archive and executed no code: 0 oracle diagnostics; 2 product `import.meta.env` typing diagnostics (`plugin-web-settings-rest`) were ignored, as in the Appearance and AppRail precedents.

## Hypotheses (contract §12)

`L<n>` is a line of the named authoritative log; each case line is followed by its failure's first line.

| ID | Disposition | Evidence |
| --- | --- | --- |
| H1 | **Confirmed** | `fields` L929–L934: a quota failure, a throwing `setItem` and a throwing write-time `getItem` each leave the face on the old value ("the latest choice stays displayed …: expected 'classic' to be 'analog'"); the choice is lost, with no block, Retry, Discard or Export. L935–L938: with `navigator.locks` missing or the per-key lock denied, the legacy write lands unfenced ("expected 'analog' to be 'classic'"). Also ZH L951, both-fields L995, independent settlement L997, `continuity-export` L402 and every inline-Export case L406–L430 ("the inline Export renders …: expected null not to be null"), `departure` D8 L563 and D11 L568 |
| H2 | **Confirmed** for a city and for Local time | `fields` L939–L948 (city `tokyo` over `local`, all five kinds) and L949–L950 (Local time over `sydney`: "expected 'sydney' to be 'local'"), ZH L953; `continuity-export` L408–L410 |
| H3 | **Confirmed** | `queues` L537–L581: "the held per-key lock keeps the bytes unchanged: expected 'split' to be 'classic'" — the bytes change immediately while `prefMutationLockName("xai_clock_style")` (or `…_tz`) is held by the test, including rapid choices, orderings, conflicts, Discard and interleaved work (L581: both keys written at once). Also `continuity-export` L394–L400 (Sol-layer lifetime), `fields` L999 and L1001, `departure` L544–L547 |
| H4 | **Confirmed** for all 12 malformed values and both key-scoped throwing reads | `fields` L955–L986: for each of `bogus`, `Analog`, `""`, ` classic`, `"analog"` and `mars`, `Shanghai`, `UTC+8`, `Asia/Shanghai`, `new-york`, `""`, `"local"`, and for a `getItem` that throws for one Clock key, "the field shows the source message with Reload only: expected { present: false … }" — the default displays silently, with no source alert or Reload (the default-display assertion before it passes). ZH L983–L986. Beyond H4: a valid choice silently overwrites the malformed bytes (L987–L990, "expected 'minimal' to be 'bogus'") |
| H5 | **Confirmed** for the Sol-reachable surfaces | `departure-before2` L537–L542 (programmatic navigation, an AppRail click in ZH and the Mini Calendar `goTo`: "is held: expected false to be true"), L548–L551 (Back and Forward POP), L552–L553 (sign-out: "the sign-out request is held: expected true to be 'pending'"), L570–L571 (`beforeunload`: "expected { warned: false … } to strictly equal { warned: true … }"), and nothing can be exported (`continuity-export` L406–L430). **Not exercised in Sol:** the clause "with a rail draft as well, sign-out asks only the rail prompt and then proceeds" needs the production `App` sign-out sequence; it belongs to host row q and F1 case c5 (E3, E5). Sol has no App steps (rule 12) |
| H6 | **Confirmed** (label) | `departure-before2` L555–L560 and L574–L575: with a failed Header save and a failed Clock choice the dialog is `{"aria":"Unsaved Dashboard header draft","text":"Dashboard header has unsaved changes."}` (log L287–L299), ZH `未保存的工作台备注草稿` (L343). The Export/Discard coverage assertions that follow are not reached at `f9eb4b1`; they bind the fixed product |
| H7 | **Refuted as a defect (positive control PASS)** | `bytes` L152 (case 043): an idle Clock follows committed changes and removals from another document live, with zero writes |
| H8 | **Refuted as a defect (positive control PASS)** | `bytes` L112 (absent mount), L149 (three ticks, a language change, the popover opened and closed twice), L150 (`DashboardModule` mounts with and without a registration), L151 (the drag ghost: zero writes over the whole widget drag; the ghost shows the committed bytes) |

H9 and H10 are native (E4) and not part of this batch. Every confirmed failure is a requirement that the same unchanged assertions must PASS on the fixed product.

**Further correct FAILs without a hypothesis number** (section requirements): §5.2/A5 never overwrite malformed bytes (`fields` L987–L990); §5.8 targeted Discard (L991–L994); §5.6 uncertainty and conflicts (`queues` L549–L555, L571–L577); §6.2–§6.6 aggregator members (`departure` D7 L561: "the widget render context carries registerDepartureGuard: expected null"); §6.7/§7.6 removal (D9 L565); §7.9 unmount refusal (`continuity-export` L404); §6.1 StrictMode (D13 L572–L575).

## Positive controls PASS at `f9eb4b1` (contract §12 "Validity and positive controls")

| Positive control | Evidence |
| --- | --- |
| Zero-write mount, including the ghost (H8) | `bytes` L112, L149–L151 |
| Absent defaults | `bytes` L112 |
| Exact bytes for all 17 values through the UI | `bytes` L113–L129 (4 styles, 13 timezones; each exactly one set attempt with the exact bytes, zero sibling and other-key writes, zero StorageEvents and bus events, display truth including the displayed time) |
| A value equal to the default is stored, never removal | `bytes` L130 |
| Display truth for bytes written by `f9eb4b1` (all 17 seeded values) | `bytes` L131–L147; ZH labels L148 |
| Cross-document live update of an idle widget (H7) | `bytes` L152 |
| Lifecycle classification | `bytes` L153 |
| CmdK reads and adapter | `bytes` L154 |
| D1 Header-only equivalence | `departure-before2` L534 (AppRail click held under "Dashboard header"; dialog Export downloads `dashboard-note-draft.json` once with `{"version":1,"kind":"dashboard-note-draft","note":"Latest unsaved note","noteOffset":0}`; the navigation event is exactly `[{moduleId:"tasks",source:"app-rail"}]`; dialog Discard: zero writes, one commit), L535 (Header Retry auto-release: one commit), L536 (sign-out held under the Header, Stay resolves `false`, zero confirms) |
| D10 ticks | `departure-before2` L567 (two 3.3 s windows: zero registrations and zero Clock-key storage attempts, clean and with a failed choice present) |
| D5 zero-confirm recorder | `departure-before2` L554 (zero `window.confirm` records of every class at each dialog and resolution) |
| Source-only never holds (matrix row 3) | `departure-before2` L543 (added in iteration 2) |
| Lock independence (§7.1, host row c in Sol form) and no account machinery | `continuity-export` L391–L393 |
| `original` | `original-before1-f9eb4b1.log` L683 (579/579) |

## F-B002 self-check (rules 8–9)

Each oracle file's first case runs `storageSelfCheck()` with a tripwire on `accountScope.physicalKey` and `accountScope.capture`: `{"nested":0,"tripwire":0,"delegatedPerCall":[1,1,0,1,1,0,1,0,0,0]}` in all five files (e.g. `bytes` L33, `fields` L33, `queues` L33, `departure-before2` L33, `continuity-export` L33). The wrappers record and then delegate exactly once; a faulted attempt never delegates. Both Clock keys are device keys (physical key = logical key) and both per-key lock names are computed at module load, before any wrapper is installed (asserted equal to `xai:pref:v1:xai_clock_style` / `…_tz`). The one account key an oracle names (the Header note) is computed by the case before mounting. `teardown()` re-asserts zero nested wrapper entries after every case. The Web Lock fixture's exclusivity is proven separately (`bytes` L36: `{"waitedWhileHeld":true,"grantedAfter":true}`).

## In-domain seed table (F-FD1, rule 10)

| Key | Seeded values and class | Where |
| --- | --- | --- |
| `xai_clock_style` | In-domain only (`classic`, `split`, `minimal`, `analog`), always asserted by `seed()` | every mode |
| `xai_clock_style` | Malformed, exactly the §5.2 set (`bogus`, `Analog`, `""`, ` classic`, `"analog"`), asserted by `seedMalformed()` | source-truth cases only: `fields` 015–019, 029, 031; `departure` D2 source-only (`bogus`) |
| `xai_clock_tz` | In-domain only (all 13 ids) | every mode |
| `xai_clock_tz` | Malformed, exactly the §5.2 set (`mars`, `Shanghai`, `UTC+8`, `Asia/Shanghai`, `new-york`, `""`, `"local"`) | `fields` 021–027, 030, 032 |
| `xai_rail_order` | **Never seeded** (absent everywhere). Only its per-key lock is held | `continuity-export` 004 |
| The seven Appearance keys | **Never seeded** (absent). Only the `xai_pref_theme` per-key lock is held | `continuity-export` 004 |
| `xai_dash_order` (device) | Valid widget-id arrays: `["clock"]`, `["clock","mini-cal"]`, `["clock","clock-sol-probe"]` (the probe is a registered widget in that mount) | `bytes` 041–042; `departure` (default `["clock","mini-cal"]`; D7–D11) |
| Header note (account key of `clock-sol-A`) and `xai_pref_dashboard_header_note_x` | `"Original note"` and `"0"`, the accepted Header departure suites' seeds | `departure` |
| Generation markers | `clock-sol-A`/`g1` (setup), `clock-sol-B`/`g1`, `clock-sol-A`/`g2` through `activate()` | setup; `continuity-export` 005–009 |

**Faults** are scoped to the key a case names: quota/generic `setItem` on one Clock key (optionally one exact value); a write-time or post-write (`after: set`) `getItem` on one Clock key; a key-scoped throwing `getItem` at load (source truth); the per-key lock of one Clock key denied; `navigator.locks` missing (the contract-listed "missing Web Lock capability" failure, armed after mount, in a widget-only mount); total denial only in the export cases, armed after the draft is established. Nothing is global at load.

## §12 consistency matrix with case references (OE-1/OE-2)

Case numbers are `NNN` of the named log. No two cases, and no case and contract clause, contradict each other.

| # | Rule pair | How the oracles assert it | Cases |
| --- | --- | --- | --- |
| 1 | Inline Export vs dialog Export | Settled-unsuccessful states expect the inline Export; pending-only states expect none (and a working dialog Export); source-only expects none | inline present: `fields` 002–014, `continuity-export` 011–023; pending none: `queues` 002/013, `departure` 009; dialog Export for pending-only: `departure` 009; source-only none: `fields` 015–030 |
| 2 | Pending vs settled | Pending: no block, an unload warning; settled: the block | pending: `queues` 002/013, 007/018 (pending Retry hides the block), `departure` 009, 023 (D12), `continuity-export` 005–008; settled: `fields` 002–014 |
| 3 | Source-only | Block with Reload only; no hold, no unload warning, no export entry | `fields` 015–030; no hold: `departure` 008 |
| 4 | Conflict vs ordinary failure | Conflicts only from an unobserved external change after mount (`nativeSet`/`nativeRemove` while the write is held, or an external restoration after an uncertain write); every other case seeds before mount or dispatches a `StorageEvent` and never expects a conflict | conflicts: `queues` 009–011, 020–022, `fields` 037; StorageEvent repairs expecting no conflict: `fields` 015–030; H7 `bytes` 043 |
| 5 | Discard's zero writes vs an in-flight commit | Zero writes asserted only for queued/held work or with the fault armed; an in-flight write may commit | zero writes: `fields` 031–034, `queues` 012/023, `departure` 005 (fault armed), `fields` 038 (held work after unmount); in flight: `departure` 010 (bytes are the baseline or the latest) |
| 6 | Removal vs route departure | Removal discards without a dialog; a route change with drafts is held | `departure` 020 (D9) vs 005–007, 011–012 |
| 7 | Labels | One blocking participant: its label; two or more: `Dashboard`/`工作台`; the Header alone: `Dashboard header`/`工作台备注` | `departure` 002–004 (Header), 005–007 (Clock, ZH 时钟), 015–017 and 025 (combined, ZH 工作台), 016 (back to the Header after a Clock Retry), 018 (D7) |
| 8 | Combined `isCurrent` vs `isBlocking` | Every participant current vs any participant current and blocking; single-participant cases expect the `f9eb4b1` outcome | `departure` 018 (D7: one non-current participant ⇒ `isCurrent` false, `isBlocking` true); 002–004 (D1) |
| 9 | Ghost | Zero writes and no participant from the ghost; its display may equal the committed bytes | `bytes` 042; `departure` 019 (D8). The ghost's display is never asserted against the source draft |
| 10 | Seeds | In-domain except source-truth cases; `xai_rail_order` and Appearance keys absent | seed table above |
| 11 | Ticks | Zero re-registrations without changes, at both SHAs | `bytes` 040; `departure` 021 (D10) |
| 12 | Sign-out steps | Sol has no App steps: zero confirms of every class, in total | `departure` 004, 013, 014 (recorder), 008 |
| 13 | Topbar statuses | Absent, as a precondition (`census()` at mount and when held). In Sol the Shell's status slots are unset, so a status cannot render; row q/c5 are host/F1 | every `departure` route case |
| 14 | Rail drags vs AppRail clicks | Departure by a single click on the button selected by accessible name, after asserting it exists, is not `.dragging` and no `dragstart` fired since mount; Sol performs no rail drag | `departure` 002–003, 005–006, 008–010, 015–017, 024–025 |
| 15 | Clock-attributed vs navigation events | Clock: zero StorageEvents and zero non-navigation bus events; navigation: equal to `f9eb4b1` | `bytes` 004–020; `fields` 002–014; `departure` 002 (exactly `[{tasks, app-rail}]`), 005 |
| 16 | Release-once | Programmatic and AppRail: one router commit; POP: one POP commit; sign-out: one resolution and no router commit | `departure` 002–003, 005, 007, 009–010, 011–012, 013, 015–016, 024–025 |

## D-cases (contract §12 `departure`) and other §12 coverage

| D | Cases (`departure-before2`) | At `f9eb4b1` |
| --- | --- | --- |
| D1 | 002–004 | PASS (positive control) |
| D2 | 005 (programmatic + AppRail, dialog Export, Stay, Discard), 006 (ZH), 007 (Mini Calendar `goTo`, host row f) | FAIL (H5) |
| D2 source-only | 008 | PASS (matrix row 3) |
| D3 | 009 (pending behind the real lock; dialog Export; one write and one auto-release), 010 (in-flight dialog Discard) | FAIL (H3) |
| D4 | 011 (Back), 012 (Forward) | FAIL (H5) |
| D5 | 013 (Stay false, Discard true, zero writes, no router commit); 014 recorder | 013 FAIL (H5); 014 PASS |
| D6 | 015 (k1), 016 (k2), 017 (ZH) | FAIL (H6) |
| D7 | 018 (stable registration; labels; participant order; one throwing participant; `isCurrent`/`isBlocking`; identity-based unregister; stable upstream token) | FAIL (§6.3: no registration in the render context) |
| D8 | 019 | FAIL (H1 after the drag; the zero-write and no-registration parts pass) |
| D9 | 020 | FAIL (§6.7) |
| D10 | 021 | PASS (positive control) |
| D11 | 022 | FAIL (H2) |
| D12 | 023 | FAIL (H5) |
| D13 | 024 (D2 in StrictMode), 025 (D6 in StrictMode) | FAIL (H5, H6) |

`continuity-export`: §7.1 positive controls 002–004; Sol-layer lifetime A→B, A→locked, locked→A and epoch 005–008; failed draft across A→B 009; unmount refusal 010; §8 shapes 1–4 under total denial 011–014; pending sibling 015; ZH 016; setup failure EN/ZH with the error cleared by the next Clock action 017–018; click failure 019; unmount during Blob, URL and append 020–022; no side effects 023.

## Iteration history and development probes (disclosed)

- **Development probes (not counted, disclosed).** Before the formal runs the oracles were exercised against the same `f9eb4b1` archive with suffix `probe1` (`bytes`, `fields`, `queues`, `departure`, `continuity-export`, `original`, `typecheck`). Those probe logs were deleted and are not evidence. They led to: business tags on two untagged assertions; `continuity-export` provenance (it does not load `apps/web`); removing the type-only `types.ts` from the grid provenance; one oracle type annotation; and confirming the D1 Header export literal `noteOffset: 0` (the "recorded `f9eb4b1` run" of D1).
- **Scratch self-check implementation (disclosed; not committed; never evidence).** To check that the oracles are satisfiable and consistent with the contract (the OE lesson), a throwaway Clock controller, recovery region and aggregator were written **outside the repository** (scratchpad) and overlaid on the extracted `f9eb4b1` archive by a scratch copy of the runner that writes its logs to the scratchpad. It is not a reference implementation and is not offered to Terra. Results: run `sc1` 153/154 — it exposed one oracle fixture bug (D12 reused a still-armed quota fault, so the second fault's precondition could never fire; it would have been a PRECONDITION at the fixed product); fixed before freezing; runs `sc2`/`sc3` with the final files: 154/154 across the five oracle modes (0 PRECONDITION); run `sc4` after the iteration-2 addition: `departure` 25/25.
- **Iteration 1 (`before1`).** All six modes; every failure a business assertion, 0 PRECONDITION.
- **Iteration 2 (`before2`, `departure` only).** One case added: "D2 matrix row 3 §6.7: a source-only Clock issue never holds sign-out or an AppRail click" (positive at both SHAs), so that matrix row 3's "no hold" has a case reference. No existing assertion changed; `departure-before1-f9eb4b1.log` is kept (superseded, same 18 FAILs plus one fewer PASS).

## Contract tensions recorded (no oracle bent; no stop condition triggered)

1. **Ghost "zero storage attempts" vs "displays committed bytes".** §6.3/A3, §7.7 and host row n say the ghost "makes zero storage attempts" and also displays the committed bytes; the consistency matrix row 9 and gate 1 say "zero writes". Sol follows matrix row 9 (zero writes, no participant) and records the ghost's reads as an observation: 6 Clock-key `getItem` attempts during the drag at `f9eb4b1` (`bytes` L79). The stricter reading (zero reads) is not asserted by Sol; the controller may want to fix which reading binds parent row n.
2. **In-flight vs held work after unmount.** §7.6 says an in-flight write may still commit; matrix row 5 allows zero-write assertions for queued or held work. Sol asserts zero writes only for work held behind the test's per-key lock after unmount (`fields` 038) and allows either outcome for an in-flight dialog Discard (`departure` 010).
3. **D7 "none blocking" label.** The first-seen order of the Header and the Clock participants is not fixed by the contract (it depends on effect timing), so with no participant blocking Sol accepts either `Dashboard header` or `Clock` (D7, last assertion). Participant order is asserted only among the probe participants whose registration order the oracle controls.
4. **H5 rail-draft clause and the Topbar census.** Not reachable without the production `App` (rule 12: Sol has no App steps). Deferred to host row q and F1 case c5 (E3, E5) as the contract plans.
5. **Ordering readings taken from the contract text.** After a failed predecessor, Retry rewrites the predecessor before the queued latest runs (`queues` 005/016, writes `[a, b]`, §5.5); after an externally restored uncertain write, a distinct new choice settles as its own operation (`queues` 011/022, §5.6, as the accepted Appearance Q8). Both were satisfied by the scratch self-check on the unchanged engine.

## Not done here

No product, contract, ledger or control-plane change; no reference implementation committed; no push, merge or branch; no sub-agent; no dev server or preview tool; nothing written to the main checkout. Parent host (E3), native (E4) and Clock F1-shape (E5) baselines are separate batches.
