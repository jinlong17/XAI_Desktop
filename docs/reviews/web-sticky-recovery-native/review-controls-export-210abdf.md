# Sticky native controls and on-disk export (CP-STICKY-01, batch 8)

**Verdict: PASS for both modes, `controls` and `export`.** No product failure was observed. Both runs passed on their first diagnostic iteration. Each recorded 0 runtime exceptions, 0 console errors and 0 unexpected JavaScript dialogs.

**Status.** This is verification only:
- It is not acceptance.
- It changes no product source, test, contract, ledger, control plane or existing evidence.
- It closes no 312 item: SET-12, REL-05, QA-01/03/04/09 and D2/REL/AI stay open.

The host matrix (§9 a–l), EN/ZH visual and keyboard checks, final regression and independent acceptance belong to later batches.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, parent-role native verifier. It did not write the contract, the oracles or the implementation. |
| Worktree | `.claude/worktrees/agent-ad098d1916642b5cc`, detached at docs base `c18db8103a69ea62c635d4b4d5d59a4630c7ee30` |
| Fixed candidate | requested `210abdf` → resolved `210abdf77562660372c47086db02bd21e870deb5`. Both logs record it (line 2 of each). |
| Product tree equality | `git diff --name-only 210abdf HEAD -- apps packages package.json pnpm-lock.yaml` is empty. Both logs assert this at line 3 (`baseline:docs-head-product-tree-equals-fixed`). |
| Product under test | Immutable `git archive 210abdf`. Every `@repo/*` import is pinned to the archive's packages. |
| Bundle provenance | 628 inputs: 559 from the archive, 68 third-party, the fixture itself, 0 foreign. Counts are recorded at line 2 of each log; line 5 asserts 0 foreign inputs and that every listed product file is in the bundle. |
| Dependency gate | `XAI_DEPS_ROOT` = main checkout, read-only. `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for both the dependency checkout and `git show 210abdf:pnpm-lock.yaml`. This is a consistency check only. |
| Browser | `Chrome/154.0.8037.97` (protocol 1.3): headless `--headless=new`, isolated profile and download directory, viewport 1280×813 at DPR 1 |
| Toolchain | Node `v24.16.0`; esbuild `0.28.1` from the gated tree |
| Network | Only the local `127.0.0.1` server (ephemeral port) and local Chrome DevTools |
| Diagnostic iterations | `controls` 1 of 3 (`n1`); `export` 1 of 3 (`n1`). No other verifier run exists. |

## Files and SHA-256

All files are new, under `docs/reviews/web-sticky-recovery-native/`.

| File | SHA-256 |
| --- | --- |
| `native.tsx` (fixture) | `db5807ef66ead00d70bd5a58fa4769561391cf254d223ef5a6485575ecec68ad` |
| `verify-native.mjs` (runner) | `14846f8034727d143a1c86266310cc72194209c7b3cca7fc2ac03d6fad2c9204` |
| `native-210abdf-n1-controls.log` (511 lines) | `502f78dd7c125ba7defba7d6db49306e17ab2ee4d606c95bd1d7299dfbba9ef5` |
| `native-210abdf-n1-export.log` (317 lines) | `2065832922429aa866f288064433090a28cf1de12cb31c6b4e27dd179075ff17` |
| `native-210abdf-n1-export-x1-sparse-one-field-sticky-draft.json` | `3e43a9426f234877da6e9c7b9a05d262dd7bf8b80415e609d0ce15ee2e835471` |
| `native-210abdf-n1-export-x2-all-five-sticky-draft.json` | `becd15433fbed7d1228ba886542ba5b666da043d5c555cede2b7c8d066d39695` |
| `native-210abdf-n1-export-x3-departure-dialog-sticky-draft.json` | `6ce999b2443cc5806a653cb15d05bd36cd34575cb05498e81309cf4deb088856` |
| `native-210abdf-n1-export-x4-fresh-locked-after-a-to-locked-sticky-draft.json` | `41e1e23c4fba43ef13cedeb6fd0cc1b9d1444e06a0cb36a3867e6954557bd98c` |
| `native-210abdf-n1-export-x5-fresh-b-after-a-to-b-sticky-draft.json` | `236cecaa6966e60d270f1f37a96e1d448029fd816fabbf6dd6899be904aece71` |
| `native-210abdf-n1-export-x6-held-real-lock-sticky-draft.json` | `73bdb1ff3c22defd31a39428ccba656c1d921a0543fb5b01514a2bc91b4a17a6` |
| `native-210abdf-n1-export-x7-recovered-after-click-failure-sticky-draft.json` | `236cecaa6966e60d270f1f37a96e1d448029fd816fabbf6dd6899be904aece71` |

**Notes on the table:**
- Both log baselines (line 2) record the fixture and runner hashes above. They also record:
  - bundle `74baf9e99ecef566e27b4a0094f23453c56921e6e55eba3eee6230b69a33a4ac` and bundle CSS `4253982fdba00ac6ae532227159f59876025f274edb8c13ca9413cb4e7a7ee09`;
  - the archive SHA-256 of 11 product files: `stickyPane.tsx`, `StickyColorPalette.tsx`, `localI18n.ts`, `styles.css`, `prefMutation.ts`, `usePrefAsync.ts`, `usePrefAutosaveAsync.ts`, `accountScope.ts`, `departureCoordinator.tsx`, `composedSettingsRegistration.tsx` and `settingsDeparture.ts`.
- x5 and x7-recovered share a hash because their bytes are identical: both export the same four drafts.

## Commands

Run from the worktree root. `XAI_NATIVE_TMPDIR` only places the runner's temporary archive, profile and download directory in the session scratchpad. The runner deletes them afterwards.

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
XAI_NATIVE_TMPDIR=<session scratchpad> \
node docs/reviews/web-sticky-recovery-native/verify-native.mjs 210abdf controls n1

XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
XAI_NATIVE_TMPDIR=<session scratchpad> \
node docs/reviews/web-sticky-recovery-native/verify-native.mjs 210abdf export n1
```

Console results:
- `PASS docs/reviews/web-sticky-recovery-native/native-210abdf-n1-controls.log checks=482`
- `PASS docs/reviews/web-sticky-recovery-native/native-210abdf-n1-export.log checks=295`

## Harness

**Composition.** This follows `../web-more-recovery-native/native.tsx`. Everything comes from the archive:
- the production `Shell` inside `WebShellProvider`, with `webShellModuleRegistrations`;
- the production `ComposedSettings` (`DepartureCoordinator` and `settingsDeparture`);
- React Router's production `createBrowserRouter` over real browser history, starting at `/app/settings/sticky`;
- the real Sticky pane, `usePrefAutosaveAsync`, `mutatePref`, registry, codec and `accountScope`;
- `tokens.css`, `layout.css`, the Settings-rest `styles.css` and `apps/web` `global.css`.

The route table is `/app` → Shell, with `settings/*` → ComposedSettings and `:moduleId/*` → a destination. It omits the production auth gate, because accounts are synthetic.

**Attempt-level Storage counters.** The fixture wraps Storage `getItem`, `setItem`, `removeItem`, `key`, `clear` and the `length` getter.
- Each attempt is logged before any fault decision and before delegation, for every Storage area.
- This differs from More, which counted only successful writes.

**Faults:**
- per-key denial of reads, writes or removes;
- total denial of every Storage operation;
- one-shot readback denial, armed by the next successful write of a key, to produce engine uncertainty.

**Web Locks.** `LockManager.prototype.request` logs each name before delegating.
- The fixture can hold and release the real `prefMutationLockName("xai_pref_sticky_<field>")` lock.
- `navigator.locks.query()` proves which locks are held and which are pending.

**Export tracing:**
- `URL.createObjectURL`/`revokeObjectURL`;
- the export anchor's `click`;
- a `<body>` MutationObserver for the `sticky-draft.json` anchor;
- one-shot hooks that make `createObjectURL` or the anchor click throw.

**Input.** CDP `Input.dispatchMouseEvent` at the element center, only after `elementFromPoint` hit-tests the control. The native select gets `Input.dispatchKeyEvent` typeahead. A capture-phase trace confirms the resulting events were trusted (`isTrusted`).

**Second document.** A separate same-origin CDP target (`/external`) that does not load the fixture.

**Physical bytes.** Each value is read three ways:
1. through the captured native Storage getter, so the read is uncounted;
2. independently through CDP `DOMStorage.getDOMStorageItems`, outside page JavaScript;
3. in `controls` mode, after a graceful `Browser.close` and relaunch on the same profile. This proves the bytes were persisted outside the renderer and survive a browser restart.

## Mode `controls`: all PASS

Log: `native-210abdf-n1-controls.log`.

| Required item | Result | Log lines |
| --- | --- | --- |
| Initial absent mount: all five keys absent, defaults displayed, zero write/remove attempts, no recovery or Saved claim | PASS | 8–12 |
| Trusted input for all 25 domain values, exact bytes at the unscoped key after each | PASS | see the table below; every value block has 18 records |
| New-document reload (same browser, `Page.reload`) shows the stored values with zero mount write/remove attempts | PASS | 462–467. Sticky: 5 reads, 0 writes, 0 removes; global: 9 reads, 0 mutations. `random` is shown as the literal sentinel (467). |
| Native held lock: the edit shows pending and the physical bytes do not change; it persists after release | PASS | 468 (precondition: the real font lock is held), 470 (pending), 471, 472, 473, 474, 475 |
| Native readback uncertainty: Retry reconciles with exactly one total write | PASS | 480 (fault fired), 481, 482, 486 |
| Second-document conflict: the external replacement is preserved and recovery stays visible | PASS | 490, 494–495 (precondition and setup), 499, 500, 504, 508 |
| Zero runtime errors and no unexpected dialogs | PASS | 509, 510; final record 511 |

**Held lock (line references):**
- 470: `Font Size is saving.`
- 471: the select shows `small`.
- 472: bytes stay `xl` on both read paths, with zero font write attempts.
- 473: the real lock `xai:pref:v1:xai_pref_sticky_font` is both held and pending.
- 474: after release there is exactly one write, `small`.
- 475: Saved is shown.

**Readback uncertainty (line references):**
- 480: the write `false` succeeded and its readback was denied once.
- 481: `Pin by Default was not saved.`, with Retry and Discard; bytes are `false`.
- 482: no false Saved.
- 486: after Retry, Saved is shown and recovery is cleared. The pin key saw exactly one write attempt in total and zero removes.

**Second-document conflict (line references):**
- 490: setup. The color `mint` was written and its readback denied.
- 494–495: an independent same-origin document wrote `coral`.
- 499: after Retry the bytes stay `coral` on both read paths. The main document made exactly one color write, `mint`.
- 500: recovery is still visible, the draft `mint` is still displayed, there is no Saved, and `beforeunload` warns.
- 504: a repeated Retry still writes nothing.
- 508: Discard makes zero write/remove attempts and shows `coral`.

**The 25 values.** Every value block checks:
- a trusted event on the control;
- that the edit persisted;
- the exact five-key physical state at the unscoped keys;
- the DevTools bytes;
- exactly one write attempt, with the exact value and outcome `ok`, and no removes;
- that the real device lock `xai:pref:v1:xai_pref_sticky_<field>` was requested, with no `:lifecycle` lock and no account-key mutation;
- the displayed state and Saved truth.

After each value, the browser restarts gracefully (exit code 0) on the same profile. The new document's mount then re-checks:
- physical bytes and DevTools bytes;
- the displayed stored values;
- zero mount write/remove attempts;
- a clean mount.

Key to the line columns:
- **Trusted:** the trusted event on the control.
- **Exact bytes:** the five-key physical state right after the edit.
- **One write:** exactly one write attempt, with the exact value.
- **Restart bytes:** the physical bytes in the new document after the restart.
- **Restart display:** the displayed values after the restart.
- **Restart zero writes:** zero mount write/remove attempts after the restart.

| # | Value (input) | Trusted | Exact bytes | One write | Restart bytes | Restart display | Restart zero writes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `color=sun` (mouse; equals the default, still stored) | 16 | 18 | 20 | 26 | 28 | 29 |
| 2 | `color=peach` | 34 | 36 | 38 | 44 | 46 | 47 |
| 3 | `color=coral` | 52 | 54 | 56 | 62 | 64 | 65 |
| 4 | `color=sky` | 70 | 72 | 74 | 80 | 82 | 83 |
| 5 | `color=indigo` | 88 | 90 | 92 | 98 | 100 | 101 |
| 6 | `color=lilac` | 106 | 108 | 110 | 116 | 118 | 119 |
| 7 | `color=mint` | 124 | 126 | 128 | 134 | 136 | 137 |
| 8 | `color=white` | 142 | 144 | 146 | 152 | 154 | 155 |
| 9 | `color=silver` | 160 | 162 | 164 | 170 | 172 | 173 |
| 10 | `color=graphite` | 178 | 180 | 182 | 188 | 190 | 191 |
| 11 | `color=navy` | 196 | 198 | 200 | 206 | 208 | 209 |
| 12 | `color=midnight` | 214 | 216 | 218 | 224 | 226 | 227 |
| 13 | `color=random` (raw sentinel `random`) | 232 | 234 | 236 | 242 | 244 | 245 |
| 14 | `font=small` (native select, key `s`) | 249 | 251 | 253 | 259 | 261 | 262 |
| 15 | `font=normal` (key `n`) | 266 | 268 | 270 | 276 | 278 | 279 |
| 16 | `font=large` (key `l`; equals the default, still stored) | 283 | 285 | 287 | 293 | 295 | 296 |
| 17 | `font=xl` (key `e`) | 300 | 302 | 304 | 310 | 312 | 313 |
| 18 | `pin_default=false` (switch) | 318 | 320 | 322 | 328 | 330 | 331 |
| 19 | `pin_default=true` (equals the default, still stored) | 336 | 338 | 340 | 346 | 348 | 349 |
| 20 | `restore_size=true` (switch) | 354 | 356 | 358 | 364 | 366 | 367 |
| 21 | `restore_size=false` (equals the default, still stored) | 372 | 374 | 376 | 382 | 384 | 385 |
| 22 | `grid_spacing=none` (card) | 390 | 392 | 394 | 400 | 402 | 403 |
| 23 | `grid_spacing=normal` (equals the default, still stored) | 408 | 410 | 412 | 418 | 420 | 421 |
| 24 | `grid_spacing=large` | 426 | 428 | 430 | 436 | 438 | 439 |
| 25 | `grid_spacing=xl` | 444 | 446 | 448 | 454 | 456 | 457 |

## Mode `export`: all PASS

Log: `native-210abdf-n1-export.log`.

**Setup:**
- The run starts at `/app/settings/hotkeys`.
- A trusted sidebar click on "Sticky Note" gives the Sticky entry its own history key, `nr92mk4u` (line 14).
- That mount is absent and makes zero writes (12).
- A clean positive control makes no beforeunload warning (13).

**Drafts.** Drafts are failed or pending edits, made with trusted input, while writes to the five Sticky keys are denied:
- x1 color (18, with the fault proven to fire at 19);
- x2 all five (49–58);
- x3: targeted discards, which make zero write/remove attempts (96–97), then the dialog is opened by a trusted sidebar click (101);
- x4: the drafts survive A→locked, epoch 2→3 (136, 140), and a new spacing draft is made in the locked scope (139);
- x5: the drafts survive locked→A (169) and A→B, epoch →7 (171, 174), and a new font draft is made in B (173);
- x6: the pin switch is pending behind the real held lock (203, 206, 207).

**Assertions on every export:**
1. Total storage denial is armed. Before the click, a probe proves the attempt injector fires and throws ("denial" column).
2. Exactly one actual Chrome download, `sticky-draft.json`, is read from disk and deep-equals the full envelope ("disk JSON" column). It is kept as an artifact.
3. Attempt-level counters show 0 reads, 0 writes, 0 removes and 0 other operations during the export ("zero" column).
4. Exactly one object URL is created, and that same URL is revoked ("URL" column).
5. The anchor is appended, clicked once with that URL, and removed; none remains in the DOM ("anchor" column).
6. The location `{pathname, key}` is unchanged ("location" column).
7. The drafts are kept ("drafts" column).
8. Afterwards, still under total denial:
   - a cancelable `beforeunload` is prevented, with 0 handler storage attempts ("warns" column);
   - a trusted sidebar click on Hotkeys is still held by the dialog `Unsaved Sticky Note draft`, with the location key unchanged ("guard" column);
   - Stay returns to Sticky ("Stay" column).

   Every guard window made 0 storage attempts. This is recorded in each "Stay" record, but it is not a gated assertion.

| Shape | Envelope `values.device` | Denial | Disk JSON | Zero | URL | Anchor | Location | Drafts | Warns | Guard | Stay |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| x1 sparse one field | `{color:"mint"}` | 20 | 25, 30, 31 | 26 | 28 | 29 | 35 | 37 | 38 | 42 | 46 |
| x2 all five (3 strings, 2 booleans) | `{color:"mint",font:"xl",pin_default:false,restore_size:true,grid_spacing:"xl"}` | 59 | 64, 69, 70 | 65 | 67 | 68 | 74 | 76 | 77 | 81 | 85 |
| x3 departure dialog (`Export current draft`) | `{color:"mint",restore_size:true}` | 102 | 107, 112, 113 | 108 | 110 | 111 | 117 (key unchanged) | 119 | 120 | 124 (Stay), 128 | 132 |
| x4 fresh locked after A→locked | `{color:"mint",restore_size:true,grid_spacing:"large"}` | 141 | 146, 151, 152 | 147 | 149 | 150 | 156 | 158 | 159 | 163 | 167 |
| x5 fresh B after A→B | `{color:"mint",font:"small",restore_size:true,grid_spacing:"large"}` | 175 | 180, 185, 186 | 181 | 183 | 184 | 190 | 192 | 193 | 197 | 201 |
| x6 one operation held behind the real lock | `{color:"mint",font:"small",pin_default:false,restore_size:true,grid_spacing:"large"}` | 208 | 213, 218, 219 | 214 | 216 | 217 | 223 | 225 | 227 | 231 | 235 |
| x7 native setup failure: the anchor click throws | no file | 238 | 244 (no file written) | 245 | 247 | 248 | 250 | 252 | 253 | 257 | 261 |
| x7 recovered export after the failure | `{color:"mint",font:"small",restore_size:true,grid_spacing:"large"}` | 263 | 268, 273, 274 | 269 | 271 | 272 | 278 | 280 | 281 | 285 | 289 |
| x8 extra setup failure: `createObjectURL` throws | no file | 291 | 297 (no file written) | 298 | 300 (no URL, anchor or click) | 300 | 301 | 303 | 304 | 308 | 312 |

**Per-shape specifics:**
- **x3 (dialog).** The dialog stays open and is unchanged after the export (118). The router location key stays `nr92mk4u` (117).
- **x6 (held lock):**
  - The export leaves the fixture's lock held and the engine's request still pending, with no pin bytes written (226).
  - After release, the held operation persists exactly once, as `false` (237).
- **x7 (anchor click throws):**
  - The localized `Export failed. Please retry.` is visible (243).
  - The click failure fired once (249).
  - One URL was created and the same URL revoked (247). The anchor was removed (248).
  - The drafts and guard were kept (252, 257).
- **x7 recovered.** The recovered export clears the error (277).
- **x8 (createObjectURL throws).** The same localized error is shown (296), with no URL, anchor or click (300).
- **Every successful export** shows no export error (lines 34, 73, 116, 155, 189, 222, 277).
- **Run end.** Zero runtime errors and no unexpected dialogs (315, 316). Final record at 317.

## Contract §14 conversions exercised natively

- **Attempt-level counters on every native export.** They are recorded before delegation and are zero for reads, writes and removes in all nine export windows, including both failures.
- **Warning and guard after every export.** Asserted after all nine exports, including the locked, B, held-lock and failure exports.
- **One native setup failure.** Anchor-click failure (x7), plus a `createObjectURL` failure (x8). Blob/URL/append epoch timing remains Sol evidence (§8).

## Product failures

None. No assertion failed, and nothing is frozen.

## Iterations and harness development

**Verifier runs.** Exactly one run per mode (`n1`), and both passed. No failed or discarded verifier run exists.

**Harness-development probes.** Before the runs, two probes ran in the session scratchpad. They are not committed, and they are not verifier runs:
1. A CDP capability probe on a blank non-product page. It confirmed the `DOMStorage.getDOMStorageItems` `storageKey`/`securityOrigin` shapes, and that a localStorage value survives a graceful `Browser.close` and relaunch on the same profile.
2. A build-only esbuild compile of `native.tsx` against the `210abdf` archive. It opened no browser and made no assertions; it reported 0 foreign inputs.

No product verdict was drawn from either probe, and both scratch directories were deleted.

## Log notes

Two check records have one field overwritten by a key of the same name in their details object:
- `controls` line 468: `name` holds the lock name instead of `check`.
- `export` line 134: `kind` holds the scope kind `account` instead of `precondition`.

Both records keep their `id` and `pass: true`. A runner failure is thrown from the computed result, never from the record. No details object contains `id` or `pass`.

Totals:
- `controls`: 482 checks (132 precondition, including line 468, and 350 product).
- `export`: 295 checks (162 precondition, counting line 134, and 133 product).

The pipeline did not capture the node exit code separately from `tail`. By construction, the runner sets a nonzero exit code on any failure. Both logs end with `{"name":"native","pass":true,…}`.

## Limitations and exclusions

**Browser and hosting:**
- Headless Chrome 154 on macOS. This is not headed Chrome, Tauri or production hosting.
- Synthetic accounts move through the real `accountScope`: A → locked id `sticky-native-locked` → A → B.
- There is no production authentication or live logout, and no auth route gate.
- React's development build is used (the esbuild default), without StrictMode, as in the More precedent.
- Dependencies come from a reused tree. The lockfile gate is a consistency check only.

**Simulated or indirect checks:**
- `beforeunload` is a synthetic cancelable `Event`, because `BeforeUnloadEvent` cannot be constructed; no real unload dialog is shown.
- The native select is focused programmatically before the trusted keypresses. Trusted Tab traversal, focus visibility and the dialog focus trap belong to batch 9.
- "On-disk" bytes are proven through three paths: the native getter, CDP DOMStorage, and a graceful browser restart on the same profile with Chrome's shutdown flush. LevelDB files were not parsed directly.
- Named-property access such as `localStorage.foo` cannot be intercepted by prototype instrumentation. `key`, `length` and `clear` are counted.

**Scope:**
- EN only, at one 1280×813 viewport. Not run here: the §9 host matrix (a–l), EN/ZH at five widths, every-control hit-tests at each width, 44 px targets, screenshots, guarded Forward and same-field exactly-once release with history counters. These are batch 9.
- Epoch or unmount cancellation during Blob, URL or append stays Sol evidence (§8).
- Final regression (batch 10) and independent acceptance (batch 11) are pending.
- No deployment, release, branch promotion or Web→Desktop sync.
