# Dashboard Clock recovery: parent host before baseline (CP-CLOCK-01, batch 69)

**Verdict: FROZEN.** This directory freezes the parent jsdom host before baseline for the Dashboard Clock caller (`xai_clock_style`, `xai_clock_tz`, and Dashboard departure participation) in the production `App` composition, against the before product `f9eb4b1`. It is contract r2 §14 item **E3** (§12 "Parent host baseline", "Cross-caller domain scan", "Oracle–contract consistency matrix").

Result: 46 cases, **13 PASS and 33 correct business FAILs, 0 `PRECONDITION`**, harness 6/6. Every row's outcome equals the E3 expectation (table below). The cross-caller seed scan finds no accepted oracle, runner, fixture or test that depends on an out-of-domain Clock seed.

This is evidence only. It changes no product source, product test, contract, oracle, ledger or control plane. It accepts nothing, does not authorize Terra and closes no 312 item.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, parent host verifier role, isolated worktree `.claude/worktrees/agent-a4ddc9155411f0787` (detached). It did not write the Clock contract (r1 or r2), is not batch 68's Sol, did not execute any AppRail batch and wrote no product code |
| Docs base (detached HEAD) | `bbd897117e681537225bb5e7959d8ae629b70e43` (control plane batch 69); log line 9 `runner_checkout_head=bbd8971…`, line 10 `product_tree_delta_files_vs_runner_head=0` |
| Requested before revision | `f9eb4b1` (log line 1) |
| Resolved commit / tree | `f9eb4b1f207bc4b46f547b90afc250424b3c8695` / `05887cf113639116b228a25041a37b3d5c69a322` (lines 2–3). Package trees (line 4): widgets `4d65ad16…`, grid `8e96464c…`, storage `782c79de…`, shell `4ea3eb5b…`, `apps/web` `61ddf717…`, all equal to the contract r2 header |
| Authority | `../web-dashboard-clock-recovery-contract/contract.md` r2 (`8bf6139`), SHA-256 `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`, **asserted by the runner** on every run (line 11); `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` "本轮唯一任务" (batch 69) and the CP-CLOCK-01 rows, including the batch-68 rulings (ruling 1: the drag ghost's "zero storage attempts" means zero set/remove attempts, reads recorded only) |
| Lockfile gate | All four values `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` (lines 17–20): contract gate, dependency checkout, `git show f9eb4b1:pnpm-lock.yaml`, extracted archive |
| Archive | **Streamed** (§12 rule 7): a spawned `git archive f9eb4b1` piped into `tar -x`, no fixed buffer. 148,408,320 bytes, SHA-256 `bb468cede8a9659d9798bdb4c7f0a528faedf3ddfb344fb946f159ce6305a097` (line 12), equal to the contract's byte count and to Sol's streamed hash |
| Archive product hash check | `archive_file_sha256 (50/50 equal the contract r2 source table)` (line 22): every row of the contract r2 header table |
| Dependency root | `XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop` (the main checkout), **read only**: nothing was installed, built, written or checked out there; no dev server or preview tool was started anywhere |
| Conventions reused | `../web-apprail-order-recovery-independent/` (runner `646bf047…`, fixture `314e2391…`, both read, neither imported) and the accepted Appearance parent harness rulings (memory data router over the production route table; `RouterProvider` from `react-router`). `../web-dashboard-clock-recovery-sol/` was read for selectors and consistency; no Sol file is imported or executed |
| Formal iterations | 1 (`before1`, authoritative). Two development probes, deleted (see "Iterations and probes") |

## Files and SHA-256

Every file in this directory except this README, which cannot carry its own hash.

| File | Role | SHA-256 |
| --- | --- | --- |
| `verify-fixed.mjs` | Runner | `5f4fc0793eb87337a568dba10cc405d0824b0640ff82ee892f7bb4507540fc18` |
| `host-fixture.tsx` | Fixture | `dc3b03d1cf6d65c7e168699faed49cadc24fb3b5063420f92d42f392c14b84e6` |
| `host.test.tsx` | Oracle | `aab7710eb8c286c6d55122ab88c2ff771f0dbbd8ffafb03d9dd4ff22c03d831b` |
| `host-before1-f9eb4b1.log` | **Authoritative** before log (1,074 lines) | `66bca14c95cb94cd06aa2e5671925d012e3a4d15b57496f745d4fe5ca251d154` |

The log header's `oracle_sha256` line (line 21) records exactly the three code hashes above.

## Command

From the repository root of this worktree:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-dashboard-clock-recovery-independent/verify-fixed.mjs f9eb4b1 host before1
# -> host f9eb4b1 (f9eb4b1f207b): vitest_exit=1 harness=PASS exit=1 cases=46 passed=13 failed=33 precondition=0 archive_bytes=148408320
```

**Fixed rerun (E8).** Run the unchanged files with a new suffix (`… verify-fixed.mjs <fixed-sha> host fixed1`) from a checkout whose Clock contract is still r2 (the runner asserts its hash) and with an `XAI_DEPS_ROOT` whose lockfile matches the revision (the runner refuses any other). Contract E8 requires every case to PASS.

## Runner guarantees (`verify-fixed.mjs`)

It is the accepted AppRail parent runner with these changes only: the owned directory and names; the provenance list (52 modules); the contract source table (the 50-row r2 header table); the streamed archive (the Sol pattern) with its byte count and SHA-256 in the header; the r2 contract-hash assertion; the product-tree delta record; and the widgets/grid/storage package trees in the header.

- **Immutable archive**, expanded into a fresh realpath temporary directory and deleted afterwards (no `xai-clock-host-*` directory remained).
- **Requested and resolved SHA** recorded (lines 1–3). **Lockfile gate** as above.
- **`@repo` pinned into the archive behind a guard.** Private `node_modules` per workspace: 448 read-only third-party links, 281 `@repo` links into the archive (line 24); 46 tsconfig `extends` checked, none unresolved (line 25); 75 exact-match aliases (line 26). The guard fails the run if a module is transformed from the dependency checkout's or this checkout's `packages/`, `apps/` or `docs/`, or if an unaliased `@repo` import resolves outside the archive. Result: `pin_unaliased_repo_imports=0` (line 1071), `pin_required_provenance_missing=none` (line 1072), 632 archive modules loaded (line 1074). Required provenance includes `App.tsx`, the router, `dashboardRegistration.tsx`, `departureCoordinator.tsx`, `settingsDeparture.ts`, `AccountStorageGate.tsx`, `AccountDataGate.tsx`, the storage engine and hooks, Shell/Topbar/AppRail/AvatarMenu/SignOutConfirmDialog, the four rail-order modules, the Appearance controller and copy, DashboardModule/DashboardGrid/DashHeader/WidgetShell/WidgetGhost, the widget registrations, `ClockWidget.tsx`, `MiniCalWidget.tsx`, `cityLibrary.ts`, DesktopPet, CmdK (`CommandPalette`, `readModuleStates`, `adapters/dashboard`), the event-bus emitter and the auth-session modules.
- **Harness checks** 6/6 (lines 895–900). **Refuses to overwrite** (checked before archiving, before writing, exclusive create). **Nonzero exit preserved:** `vitest_exit=1`, `exit=1` (lines 28, 30).
- **Versions:** Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, Node v24.16.0, tz America/Los_Angeles (line 15).

## Composition and instruments

The production `App` in the `apps/web/src/main.tsx` module order, the production route table `webHostRouteObjects` behind a fresh memory data router per mount (`RouterProvider` from `react-router`), mounted at `/app/dashboard`: `ProtectedAppRouteElement` → `App` → `AccountStorageGate` → `AccountDataGate` → `CommandPaletteProvider` → `AppearanceProvider` + `WebShellProvider` + `RailOrderProvider` + `Shell` (AppRail, Topbar with the Appearance and rail-order status slots), `DesktopPet`, `CommandPalette`; the Dashboard registration mounts the shared `DepartureCoordinator` around `DashboardModule` with the real Header, grid, shells, ghost and widget registrations. **The only synthetic input is `useWebAuthSession`** (account A, `coordinator` or `fallback` branch per case). Not executed, as in the accepted precedents: the `AppProviders` component tree, `bootstrapObservability()`, `registerServiceWorker()`, StrictMode. No network (all refused and counted; 0 attempts).

Test-owned instruments (none is a product input):
- the F-B002 attempt-logging Storage injector with key-scoped faults (self-check below);
- an exclusive/shared FIFO Web Lock manager as `navigator.locks` (FX2 proves a held lock keeps a product request waiting);
- the rule-12 `window.confirm` recorder, classifying each message by exact text as `rail` (`railOrderCopy.ts:56/:73`), `appearance` (`appearanceRecoveryCopy.ts:71/:98`) or `other`;
- a `window.location` stub, router-commit and History counters, a runtime-error recorder, a console recorder for "Invalid blocker state transition", a cancelable `beforeunload` probe;
- a StorageEvent dispatch counter, a bus recorder and a capture-phase `dragstart` counter (rule 13 precondition);
- a download harness (object URLs and anchor clicks observed);
- a **read-only coordinator probe**: it walks React's committed fiber tree from the render container to the `DepartureCoordinator` fiber and reads its guard ref and `guardVersion` state (hooks 2 and 3; shape asserted as a precondition). `guardVersion` counts every upstream register/unregister of the protected, byte-unchanged coordinator, so it observes participant (re)registrations without touching product code. It never calls a guard member;
- jsdom shims, including a MouseEvent-based `PointerEvent` (jsdom has none; the same shape as `xai-web-dashboard-grid/src/__tests__/setup.ts`), needed for the WidgetShell pointer drag.

**Seeds (seed rule, §12 rule 10).**

| Key | Seeded values and class | Where |
| --- | --- | --- |
| `xai_clock_style` | In-domain only (`classic` baseline; `split` in PC and o), asserted by `seedClock()` | every case except row a (absent) |
| `xai_clock_style` | Malformed, exactly the §5.2 set, asserted by `seedMalformed()` | row j source cases 021–025 only |
| `xai_clock_tz` | In-domain only (`local` baseline; `sydney` in PC, `tokyo` in o) | every case except row a (absent) |
| `xai_clock_tz` | Malformed, exactly the §5.2 set | row j cases 026–032 only |
| `xai_rail_order` | **Never seeded** (absent everywhere). Row q creates its rail draft by a failed drop; the bytes stay absent | — |
| The seven Appearance keys | **Never seeded** (absent). Only the `xai_pref_theme` per-key lock is held (row c independence) | — |
| `xai_dash_order` (device) | `["clock","mini-cal"]` (two registered ids; the Mini Calendar carries row f's `goTo`) | every case |
| Header note (account key of A), `xai_pref_dashboard_header_note_x` | `"Original note"`, `"0"` (the accepted Header suites' seeds) | every case |
| Generation marker of A | `{generation:"g1"}`, activated before mount | every case |

Post-mount Clock-byte changes are only other-document commits with a `StorageEvent` (rows i, j repair) or the identity channel (row o); none is an unobserved write. Faults are scoped to the key a case names: a quota on one Clock key, a key-scoped throwing `getItem` at load (row j), a quota on the Header note key (rows k, l), a quota on `xai_rail_order` (row q). Nothing is global at load.

## Per-case results (`host-before1-f9eb4b1.log`, lines 901–979)

"E3 expects" is contract §14 E3. Every FAIL is an `AssertionError` on a business assertion tagged with a hypothesis or contract clause; every first line is quoted from the log.

| # | Case (row) | E3 expects | Result | First failure (log line) |
| --- | --- | --- | --- | --- |
| 001 | FX1 F-B002 self-check | PASS (fixture) | PASS | — |
| 002 | FX2 Web Lock fixture | PASS (fixture) | PASS | — |
| 003 | FX3 composition and drivers | PASS (fixture) | PASS | — |
| 004 | PC clean control | PASS | PASS | — |
| 005 | a: 17 values, CmdK | PASS | PASS | — |
| 006 | b style | FAIL | **FAIL** | 907 "H1 §5.5 row b: the latest choice stays displayed after the failed write: expected 'classic' to be 'analog'" |
| 007 | b timezone | FAIL | **FAIL** | 909 "H2 … expected 'local' to be 'tokyo'" |
| 008 | c held, style | FAIL | **FAIL** | 911 "H3 §5.4 row c: no write lands while the real per-key lock is held: expected [ 'set:xai_clock_style=analog' ] to deeply equal []" |
| 009 | c held, timezone | FAIL | **FAIL** | 913 "H3 … expected [ 'set:xai_clock_tz=tokyo' ] …" |
| 010 | c lock independence | PASS | PASS | — |
| 011 | d AppRail click | FAIL | **FAIL** | 916 "H5 §7.3 row d: the AppRail click is held under \"Clock\": expected { held: false, … }" |
| 012 | e Back | FAIL | **FAIL** | 918 "H5 §7.3 row e: Back is held …: expected { held: false, … }" |
| 013 | e Forward | FAIL | **FAIL** | 920 "H5 §7.3 row e: Forward is held …" |
| 014 | f widget `goTo` | FAIL | **FAIL** | 922 "H5 §7.3 row f: the widget goTo is held …" |
| 015 | g coordinator branch | FAIL | **FAIL** | 924 "H5 §7.5 row g: the coordinator dialog appears for the Clock: expected { open: false, … }" (the zero-confirm assertion before it PASSED) |
| 016 | g fallback branch | FAIL | **FAIL** | 926 (same) |
| 017 | h settled | FAIL | **FAIL** | 928 "H5 §7.4 row h: a settled Clock draft warns …: expected { warned: false, attempts: +0 }" (the clean no-warning assertion before it PASSED) |
| 018 | h pending | FAIL | **FAIL** | 930 "H5 §7.4 row h: a pending Clock draft warns …" |
| 019 | i idle half | PASS | PASS | — |
| 020 | i drafted half | FAIL | **FAIL** | 933 "§5.6 §10.5 row i: the drafted style keeps the draft displayed as a preserved conflict; B's bytes stay: expected { shown: 'minimal', … }" |
| 021–034 | j: 12 malformed values and 2 key-scoped throwing reads | FAIL | **FAIL** ×14 | 935–961 "H4 §5.2 §5.7 row j: the source block with Reload only: expected { present: false, … }" (the no-route-error and default-display assertions before it PASSED) |
| 035 | k1 | FAIL | **FAIL** | 963 "H6 §6.6 row k1: two blocking participants are labelled \"Dashboard\"" (observed: "Dashboard header", line 1046; the held assertion before it PASSED) |
| 036 | k2 | FAIL | **FAIL** | 965 (same, H6) |
| 037 | l Export + Discard | PASS | PASS | — |
| 038 | l Header Retry auto-release | PASS | PASS | — |
| 039 | m removal | FAIL | **FAIL** | 969 "H1 H5 §7.6 row m: a failed Clock draft exists before the removal (block and unload warning)" |
| 040 | n widget drag | FAIL | **FAIL** | 971 "H1 §7.7 row n: after the drop the source block is still shown with the draft" (the ghost zero-write and zero-registration assertion before it PASSED) |
| 041 | o forced scope change | PASS | PASS | — |
| 042 | p ticks | PASS | PASS | — |
| 043 | q coordinator, Cancel half | PASS | PASS | — |
| 044 | q coordinator, OK half | FAIL | **FAIL** | 976 "H5 §7.5 row q attempt 2: the coordinator dialog appears for the Clock" (attempt 1 and the attempt-2 rail-discard and zero-Appearance assertions PASSED first) |
| 045 | q fallback, Cancel half | PASS | PASS | — |
| 046 | q fallback, OK half | FAIL | **FAIL** | 979 (same) |

Totals (line 894): `cases=46 passed=13 failed=33 skipped=0 precondition_failures=0 suite_errors=0 unhandled_error_lines=0 runtime_error_lines=0`.

**E3 reconciliation.** Correct FAILs: rows b (2), c held (2), d, e (2), f, g (2 branches), h (2), j (14), k (2), m, n; the drafted half of i; the OK half of q (2 branches). PASS: rows a, l (2), o, p; the idle half of i; the lock-independence run of c; the Cancel half of q (2 branches); the clean control; three fixture cases. **No outcome differs from the contract's expectation.**

## `PRECONDITION:` count

**0** (line 894). All 33 failures are business assertions.

## Topbar census (rule 11) and confirm recorder (rule 12), per row

Each case asserts the census at mount and again after each action before the business assertions that follow (67 call sites). The teardown writes one `census-recorder` observation per case (lines 982–1069).

| Rows | Census checks reached | Appearance status | Rail-order status | Recorder (rail / appearance / other) |
| --- | --- | --- | --- | --- |
| FX1, FX2 | 0 (no App mounted) | — | — | 0 / 0 / 0 |
| FX3, PC, a, b, c, d, e, f, h, i, j, k, l, m, n, o, p | 1–19 per case (a failing case stops at its first business failure) | absent everywhere | absent everywhere | 0 / 0 / 0 in every case |
| g (both branches) | 2 each | absent | absent | **0 / 0 / 0** (also asserted as a business PASS before the dialog assertion) |
| q Cancel half (both branches) | 4 each | absent | absent at mount; **present, draft name, closed** (`failed-closed`) after the failed drop and through attempt 1 | **1 / 0 / 0** (`rail:Cancel`) |
| q OK half (both branches) | 5 each | absent | `failed-closed` through attempt 1; absent after OK | **2 / 0 / 0** (`rail:Cancel`, `rail:OK`) |

No census violated; no `appearance` or `other` record in any case; no "Invalid blocker state transition" message (`blockerMessages: 0` in every case).

## Host-layer outcomes (H1–H8)

| ID | Host outcome | Evidence |
| --- | --- | --- |
| H1 | **Confirmed.** A quota-failed style choice is lost: the face stays on the old value, no block, no unload warning | 907; observation 990 (`shown classic`, bytes `classic`, block absent, `warned:false`); also 969, 971 |
| H2 | **Confirmed** for a city | 909; observation 992 |
| H3 | **Confirmed.** Writes ignore a test-held `prefMutationLockName(<key>)`: the bytes change immediately | 911, 913; observations 994, 996 (`lock:"test"`, `waiting:0`, `set:` landed) |
| H4 | **Confirmed** for all 12 malformed values and both key-scoped throwing reads: default shown silently, no source block or Reload, no route error, zero writes | 935–961; observations 1018–1044 |
| H5 | **Confirmed** at the host layer: an AppRail click (999), Back and Forward (1001, 1003), the Mini Calendar `goTo` (1005), sign-out in both branches (1007, 1009: identity invalidated, redirect, one backend sign-out) and `beforeunload` (1011, 1013) are not held or warned. **The rail-draft clause is confirmed by row q:** with a rail draft, sign-out asks only the rail prompt and, after OK, proceeds (1063, 1068) |
| H6 | **Confirmed** (label): with a failed Header save and a failed Clock choice the dialog is "Dashboard header has unsaved changes." (1046, 1048) |
| H7 | **Refuted (positive control PASS):** an idle Clock follows another document's commits and removal live, zero writes | case 019 |
| H8 | **Refuted (positive control PASS)** for mount (PC), ticks (p: 0 Clock reads, 0 writes over two 3.3 s windows, 1058) and the drag ghost (n: 0 Clock set/remove, **6 Clock-key reads recorded**, 0 upstream registrations, 1054) |

**Positive controls at `f9eb4b1`:** PC (zero-write mount, committed bytes displayed, no region, no warning, one unheld AppRail commit with `[{moduleId:"tasks",source:"app-rail"}]`, Back, zero-confirm sign-out); a (17 values, each exactly one write with exact bytes; `readModuleStates()` equal; CmdK query "analog" finds "Clock", 988); c independence (held rail-order and theme locks do not delay either Clock write); i idle; l (Header-only label, one Header file `{"version":1,"kind":"dashboard-note-draft","note":"Latest unsaved note","noteOffset":0}`, one commit on Discard, one auto-release on Header Retry); o (A → B → A through the identity channel, App remounted at a higher epoch, committed `split`/`tokyo` displayed, zero writes, 1056); p (zero re-registrations: `guardVersion` 3 → 3 in both windows, same guard object); q Cancel half (exactly one rail confirm, no dialog, Clock snapshot, guard identity and `guardVersion` unchanged, zero Clock set/remove, no download, rail draft and status kept, identity intact).

## F-B002 self-check (rules 8–9)

Case 001 (observation 981) installs tripwires on `accountScope.physicalKey` and `accountScope.capture` and drives ten wrapper calls, including the exact key-scoped faults the cases arm (a quota on a `xai_clock_style` write and a throwing `xai_clock_tz` read): `{"nested":0,"tripwire":0,"delegatedPerStep":[1,1,1,0,0,0,1,1,0,0],…,"faultsFired":[1,1,1,1,1],"bytesAfterFaultedSet":null,"bytesAfterFaultedRemove":"3","sessionStorageLogged":false}`, equal to the expected value. Both Clock keys and both lock names are computed at module load (asserted `xai:pref:v1:xai_clock_style` / `…_tz`); the Header note's account key is computed in setup before the wrappers are installed. `teardown()` re-checks zero nested Storage calls after every case; none occurred.

## Cross-caller domain scan (F-FD1, §12)

Scope: every file under `docs/reviews/` at `bbd8971` and the whole product tree at `f9eb4b1` (`apps/`, `packages/`), searched for `xai_clock_style`, `xai_clock_tz`, `clock_style`, `clock_tz`, `clockStyle`, `clockTz`, `data-clock-style`, `clk-tz`, `clk-style`, `ClockWidget`, `w-clock`, `data-tz-id`, `clock-recovery`, plus registry-wide or key-iterating seeders (`PREF_REGISTRY`, `resetAllPrefs`, `ACCOUNT_LOCAL_KEYS`, `localStorage.key(`) and every oracle that mounts the Dashboard.

| Finding | Seeds / asserts | Class | Effect |
| --- | --- | --- | --- |
| Sol oracles `../web-dashboard-clock-recovery-sol/` (`fixture.tsx`, `bytes`, `fields`, `queues`, `departure`, `continuity-export`) — this caller's own frozen oracles | Seed through `seed()` (asserts in-domain) and `seedMalformed()` (asserts the §5.2 set). Direct writes: `fields.test.tsx:257` `minimal`; `queues.test.tsx:233, :296` (in-domain conflict seeds); `departure.test.tsx:199` `bogus` (source-only case); `bytes.test.tsx:189–193` `external(split/paris/null)` | In-domain, or §5.2 values in source-truth cases only | Consistent with rule 10 and with this suite. No correction needed |
| This suite (`host.test.tsx`, `host-fixture.tsx`) | `seedClock()` / `seedMalformed()` as in the seed table | In-domain, or §5.2 in row j only | Consistent |
| Every other review oracle, runner, fixture and test (633 code files scanned) | **No hit** for either key or any Clock selector | — | None |
| Oracles that mount `/app/dashboard` as a route or destination (Sticky, Date & Time, Collaborate, Features, Notifications, Smart Lists, Pomodoro and coordinator-Astra hosts; AppRail Sol/native; Pomodoro native; the F1 callers runner; the Header native runner) | No Clock seed and no Clock assertion; where `xai_dash_order` is absent the Clock renders from absent keys (defaults) and is read only | Absent keys | Unaffected by stricter domains. After the fix they exercise a mounted, non-blocking Clock participant on Dashboard departures |
| Accepted Header suites (`../web-dashboard-header-departure-independent/*`, its buffer copies in `../web-apprail-order-recovery-final/host-suites/`) seed `xai_dash_order='[]'`; the Header native seeds `['mini-cal']`; `../web-sticky-recovery-f1/f1-callers-host.tsx:190` seeds `['mini-cal']` | No Clock key | — | **Observation:** the Clock widget is not mounted in the Header's accepted suites, so E17 does not exercise "Header blocking while a non-blocking Clock participant is registered". That case is covered by Sol D1 and by host row l here (both mount the Clock) |
| Product tests at `f9eb4b1`: `ClockWidget.test.tsx` (AC-CLOCK-3/-4 assert `analog`/`shanghai` synchronously after a click; AC-CLOCK-5 seeds `shanghai`; "invalid stored style falls back to classic" seeds `bogus`), `analogClockTicks.test.tsx` (seeds `analog`) | In-domain seeds, one intentional source-truth seed (`bogus`) | Its expectation (Classic face) still holds under A5 (default displayed). AC-CLOCK-3/-4 are the two tests §11 already marks for the lock fixture and awaited completion | Matches the §11 dispositions |
| `plugin-web-storage` `registry.test.ts:24–25`, `types.test-d.ts:36–42` | Registry entries / types | — | Unchanged keys and codecs |
| CmdK `__tests__/fixtures/realisticState.ts:172–173` (`clockStyle "classic"`, `clockTz "America/New_York"`), `__tests__/adapters/dashboard.test.ts:22, :30` | Adapter state objects, not storage | Not a stored seed | Unaffected (as the contract states) |

**Result:** no accepted oracle's expectation depends on an out-of-domain Clock seed; no corrected copy is needed before E24.

## Oracle–contract consistency matrix (OE-1/OE-2, §12)

Case numbers are this log's. No two cases, and no case and contract clause, contradict each other (see tension 1 for the reading of row 4).

| # | Rule pair | How this suite asserts it | Cases |
| --- | --- | --- | --- |
| 1 | Inline Export vs dialog Export | Settled failures expect the dialog Export to reach the Clock (k1: two files) and source-only expects no inline Export; pending states assert no block and no recovery region (hence no inline Export). Inline Export clicks are Sol/native scope | 035 (dialog, two files), 021–034 (no Export), 008–009 (pending: no block, no recovery region) |
| 2 | Pending vs settled | Pending: no block, a hold and an unload warning; settled: the FAILED block | pending 008, 009, 018; settled 006, 007, 017, 039, 040 |
| 3 | Source-only | Block with Reload only; no hold (AppRail click unheld), no unload warning, no Export | 021–034 |
| 4 | Conflict vs ordinary failure | Conflicts only in row i drafted, from another document's commit while the field holds a failed draft; every ordinary-failure case seeds before mount and never expects a conflict; idle StorageEvents (019, 021–034 repair, 041) expect projection, not a conflict | conflict 020; no conflict 019, 021–034, 041 |
| 5 | Discard's zero writes vs a commit in flight | Zero writes asserted only with the fault armed (failed requests) or nothing queued: dialog Discard (011, 014, 015, 016, 035, 044, 046), removal (039) | same |
| 6 | Removal vs route departure | Removal: no dialog, next click unheld; route change with a draft: held | 039 vs 011–016 |
| 7 | Labels | One blocking Clock: "Clock" (008, 009, 011–016, 040, 044, 046); two: "Dashboard" (035, 036); Header alone: "Dashboard header" (036 after Clock Retry, 037, 038, 039 after removal). With nothing blocking either label is accepted (003; ruling 3) | same |
| 8 | Combined `isCurrent` vs `isBlocking` | Single-participant cases expect the `f9eb4b1` outcome exactly | 037, 038 (PASS at `f9eb4b1`) |
| 9 | Ghost | Zero set/remove and zero upstream registrations over the drag; reads recorded (6); the ghost's display is never asserted against the draft | 040 |
| 10 | Seeds | In-domain except source-truth cases; `xai_rail_order` and Appearance keys absent | seed table |
| 11 | Ticks | Zero re-registrations without changes (and with a draft) | 042 |
| 12 | Sign-out steps | No rail/Appearance draft: zero confirms of every class (004, 015, 016, 044/046 attempt 3); row q: the rail confirm first, Cancel leaves the Clock and the coordinator untouched, OK leads to the dialog; no case expects an Appearance confirm | 004, 015, 016, 043–046 |
| 13 | Topbar statuses | Absent as a precondition everywhere, except the rail status `failed-closed` in row q | all; 043–046 |
| 14 | Rail drags vs AppRail clicks | Departures by one click on the button found by accessible name (no `dragstart` since mount, not `.dragging`); the only rail drag is row q's full `dragStart→dragEnter→dragOver→drop→dragEnd`, never followed by a rail click | all click cases; 043–046 |
| 15 | Clock-attributed vs navigation events | Zero product StorageEvents (004, 005); navigation events equal `f9eb4b1` (`[{tasks, app-rail}]` 004, 037; `[{calendar, mini-cal}]` observed 1005) | same |
| 16 | Release-once | AppRail/programmatic: exactly one PUSH commit; Back/Forward: exactly one POP commit to the ordinary location; sign-out: one invalidation, no router commit | 008, 009, 011–016, 035, 036, 037, 038, 044, 046 |

## Iterations and probes (disclosed)

- **Formal iterations:** one, `before1` (authoritative). No `before2` or `before3`.
- **Development probes (not evidence; logs deleted).** Two probe runs against the same `f9eb4b1` archive with the same runner:
  - `probe1` (log SHA-256 `300eb822…`): 46 cases, 13 PASS, 32 business FAILs, **1 PRECONDITION** (row n: jsdom has no `PointerEvent`, so WidgetShell's pointerdown had no `button` and no ghost rendered). Fix: the MouseEvent-based `PointerEvent` shim in the fixture.
  - Before `probe2`, two more oracle edits, both from a self-review of the oracles against a contract-conformant fixed product (no implementation was written): FX3's guard-label precondition now accepts "Dashboard header" or "Clock" (§6 item 6 and ruling 3: with nothing blocking, the first-registered participant names the guard), and 22 census checks were added after actions (rule 11).
  - `probe2` (log SHA-256 `31cd8850…`): 46 cases, 13 PASS, 33 business FAILs, 0 PRECONDITION, identical outcomes to `before1`.
  - No reference or scratch implementation of the Clock caller was written or run, in or outside the repository.

## Contract tensions and observations (none triggers a stop condition)

1. **Matrix row 4 vs host row i (drafted half).** Row 4 says a conflict case seeds external bytes after mount without a `StorageEvent`, and "every other case … dispatches a `StorageEvent` … and never expects a conflict". Row i (and §3 item 14, §5 item 6, §10 item 5) requires a drafted field to become a preserved conflict when document B commits, and a cross-document commit is always observed through a `StorageEvent`. This suite reads row 4 as the rule for ordinary-failure and idle cases (the OE-1 lesson: unobserved seeds must not create accidental conflicts) and follows row i's explicit text for the drafted half (case 020). The engine agrees (`usePrefAsync.ts:149–151`: a `storage` projection on an `error`/`conflict` binding sets `conflict` without moving the baseline). The controller may want to confirm this reading.
2. **Ruling 1 applied.** Row n asserts zero set/remove attempts by the drag; the 6 Clock-key reads during the drag are recorded only. Rows p and q use the same reading for "zero storage attempts".
3. **How "no participant registration" and "the Clock participant is not called" are observed.** The production App gives no public hook into the coordinator, so this suite reads the protected coordinator's `guardVersion` and guard ref through the committed fiber tree (read only). Row n requires zero upstream (re)registrations over the drag, which is slightly stronger than "the ghost registers nothing"; a fixed Clock participant that re-registered because of a drag alone would also fail it (§6 item 7 permits re-registration only on blocking-state, label or draft changes). Row q's "`exportDraft`/`discardDraft` not called" is observed through its effects: no download, an unchanged Clock snapshot, and an unchanged guard object and `guardVersion`.
4. **Back and Forward in jsdom** go through `router.navigate(-1|1)`, which the coordinator's programmatic wrapper intercepts; the replay commits a POP to the original entry (`{pathname,key,state}` equal to the ordinary navigation). Browser POP through the blocker is native scope (E11).
5. **Row o** drives the forced change as A → B → A through the identity channel (`AccountStorageGate.tsx:8, 39`): a single foreign identity leaves the gate waiting with the synthetic session, and the second announcement remounts App at a higher epoch (166 → 170).
6. **English only.** `xai_pref_lang` is an Appearance key and must stay absent (rule 10), so ZH wording is Sol (D2, D6 ZH) and native scope.
7. **Row a opens CmdK** because the row requires it; §9's "CmdK is closed in every run" governs presentation captures. The palette is closed again before the case ends.
8. **E17 coverage** (scan finding above): the Header's accepted suites never mount the Clock.

## Limitations

- jsdom only: synthetic `fireEvent` input, a `DataTransfer` stub for the rail drag, a MouseEvent-based `PointerEvent`, zero-size layout (the widget drag never reorders), `beforeunload` detected as a canceled event or assigned `returnValue`. Hit-tests, focus pixels, trusted CDP input, disk downloads and R-PET are native (E4, E9–E14).
- Composition: a memory data router stands in for `createBrowserRouter`; `AppProviders`' tree, observability, the service worker and StrictMode are not executed; the auth session is synthetic.
- Each failing case stops at its first business assertion; its later assertions (Retry, Stay/Discard, releases, the k1 two-file export, row q attempts 2–3) run for the first time on the fixed product (E8). Fixture corrections must use a new suffix, rerun against both archives and never weaken an assertion (§12).
- Third-party dependencies are reused read-only from `XAI_DEPS_ROOT`; the lockfile gate is a consistency check only. There is no static typecheck mode; Vitest's esbuild transform strips types without checking them.

## Not done here

No product, contract, oracle, ledger or control-plane change; no reference implementation; no push, merge or branch; no sub-agent; no dev server or preview tool; nothing written to the main checkout. Native before (E4) and the Clock F1-shape before (E5) are separate batches.
