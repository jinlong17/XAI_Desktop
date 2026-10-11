# Features native controls, reset and on-disk export (CP-FEATURES-01, batch 27, contract §14 E9, E10, E11)

**Verdict: PASS for all three modes** (`controls` = E9, `reset` = E10, `export` = E11), each on its first committed diagnostic iteration (`fixed1`). No product failure was observed. Every log ends with `pass: true`, 0 runtime exceptions, 0 console errors, 0 unexpected JavaScript dialogs and 0 non-local network attempts.

**Status.** This is verification only:
- It is not acceptance and it authorizes nothing.
- It changes no product source, product test, contract, ledger, control plane or existing evidence. The before-stage files in this directory (`verify-native-before.mjs`, `native-app.tsx`, `native-prelude.js`, the `before1` logs and screenshots, `before-f359be6.md`) were read only; their SHA-256 still equal the before receipt.
- It closes no 312 item: REL-05, REL-07, REL-10, UX-04, UX-05, QA-01, QA-03, QA-04, QA-09, SET-03 and D2/REL/AI stay open.
- E12 (host matrix a–n), E13 (production-App downstream), E14 (visual), E15 (keyboard), E18–E25 and final acceptance belong to later batches.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, parent-role native verifier, in its own isolated worktree. It did not write the contract, the implementation or any earlier Features evidence. |
| Worktree | `.claude/worktrees/agent-a226b5a0433668f64`, detached at docs base `9d6419213b360f287c4208d6d91fd95b3b8b6b8d` (clean before the run) |
| Fixed revision | requested `5cd63ff` → resolved `5cd63ff652f02a2c726187fe12cbc796218d31c0`, tree `404bf819a42e20b3e4d372c18a981832ccd54954` (L1 of every log) |
| Product-tree equality | `git diff --name-only 5cd63ff HEAD -- apps packages package.json pnpm-lock.yaml` is empty (precondition L2 of every log) |
| Fixed delta | `git diff --name-only f359be6 5cd63ff -- apps packages package.json pnpm-lock.yaml` lists 11 files, all under `packages/xai-web-settings-features-panel/` (L1 `fixedVsBefore`; precondition L6). Every bundled reader, host and storage module outside the features package is byte-identical to `f359be6` (precondition L7: 0 drifted of the 28 such required modules in the App bundle and of the 16 in the host bundle) |
| Authority | `../web-features-recovery-contract/contract.md` §2, §5 (normative wording), §6, §7, §8 (nine disk shapes), §13 gates 1–4, §14 E9–E11; `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` CP-FEATURES-01 (including the `AccountDataGate` key-null fact) and "本轮唯一任务" (batch 27) |
| Browser | `Chrome/154.0.8037.97` (HeadlessChrome, `--headless=new`), protocol 1.3; isolated profile and download directory; viewport 1280×900 at DPR 1 |
| Toolchain | Node `v24.16.0`; esbuild `0.28.1` from the gated tree; react 19.2.0, react-dom 19.2.0, react-router 7.15.1 |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for `XAI_DEPS_ROOT` (the main checkout, read-only), `git show 5cd63ff:pnpm-lock.yaml` and the extracted archive (L1 `lockfileSha256`; precondition L3). A consistency check only. |
| Network | Only the local `127.0.0.1` server (ephemeral port) and local Chrome DevTools; every other host resolves to NOTFOUND |
| Diagnostic iterations | `controls` 1 of 3 (`fixed1`); `reset` 1 of 3 (`fixed1`); `export` 1 of 3 (`fixed1`). Development probes are disclosed below. |

## Files and SHA-256

All files are new, under `docs/reviews/web-features-recovery-native/`. Each log's L1 `fileSha256` records the runner, both fixtures and the prelude; they equal the committed files.

| File | Lines | SHA-256 |
| --- | --- | --- |
| `verify-native-fixed.mjs` (runner) | 1469 | `ea3332f3f97317c41fe5d2de394f139f4eda60897b2fd86426c3cbc6db5f9a4d` |
| `native-fixed.tsx` (production App fixture, E9/E10) | 120 | `1540a29b091fcf52582e9fe394bdea241f0b5658d6a8893a89041752c9f8104b` |
| `native-fixed-host.tsx` (Settings host fixture, E11) | 100 | `50c58cb09ece7fc74792a8f6a561987ee8d413979e314aba6f5f070b1eb5d4cb` |
| `native-fixed-prelude.js` (instruments) | 602 | `cfc19a7e28507df6a06b7138a9d494855e4f5cf95164b40fcc6833d10c086493` |
| `native-5cd63ff-fixed1-controls.log` | 548 | `8330678fb3b657762a63a3039dcdba428a0d58c3e61996fae88c9fba66247848` |
| `native-5cd63ff-fixed1-reset.log` | 232 | `1fd92c92022cf520cc38f2ee04b8925801ae65a2115701645d41c0feaf334eba` |
| `native-5cd63ff-fixed1-export.log` | 471 | `982e92ae892949dcc4df00265c37547af627b0000c75bb6028e900273af2acef` |
| `native-5cd63ff-fixed1-export-x1-sparse-set-one-field-features-draft.json` (102 B) | — | `0595a4bad538a9a40de2846ec28989ddcb6fb55b74d16120bd559107a96c8ed2` |
| `native-5cd63ff-fixed1-export-x2-sparse-reset-one-field-after-partial-reset-features-draft.json` (91 B) | — | `5f2603dd90ca3c06fb2b2cdcf1cda532847ff5c1bed4a44ca45a08feac4a4a05` |
| `native-5cd63ff-fixed1-export-x3-mixed-set-and-reset-features-draft.json` (133 B) | — | `34e06d50143bf99fbe8cf82aacbf722eac89f24ddf48d9fa0247201783c2ff70` |
| `native-5cd63ff-fixed1-export-x4-all-eight-sets-features-draft.json` (410 B) | — | `46870d5298728c4b802547c1ddf1838b765fcd46043739688b197106d24ddf59` |
| `native-5cd63ff-fixed1-export-x5-all-eight-pending-resets-features-draft.json` (317 B) | — | `ad6554f8d0dd15b83e8f4a32ae5f5cedfef757aee3d7d4995366ab48997679fd` |
| `native-5cd63ff-fixed1-export-x6-departure-dialog-features-draft.json` (151 B) | — | `ff4f07241029de22606701b8d11e2c7cb3cf61a504ef97a022af6644e2d01650` |
| `native-5cd63ff-fixed1-export-x7-fresh-locked-after-a-to-locked-features-draft.json` (198 B) | — | `73bbb7938beb145acbdbadbd59c6b0cb4ed9be1d4d2b1e93ef9708f688627859` |
| `native-5cd63ff-fixed1-export-x8-fresh-b-after-a-to-b-features-draft.json` (240 B) | — | `44bf82216dc48515004d37249c9b3790aea739ec960bc63a20f49446e066b382` |
| `native-5cd63ff-fixed1-export-x9-held-real-lock-features-draft.json` (285 B) | — | `f1a65a6df2cccf13473cedc2285bcca4c7ed97d869c4231b48dbb34be7bd4994` |
| `native-5cd63ff-fixed1-export-x10b-recovered-after-click-failure-features-draft.json` (240 B) | — | `44bf82216dc48515004d37249c9b3790aea739ec960bc63a20f49446e066b382` |

The JSON files are the exact bytes Chrome wrote to the download directory (no trailing newline). x8 and x10b are byte-identical by design: the same four drafts were exported. Each SHA-256 is also recorded in the export log's `disk-export` record and in L466 `export-summary`.

## Commands

From the root of this worktree, one Chrome session (with restarts in `controls`) per mode, sequentially:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-features-recovery-native/verify-native-fixed.mjs 5cd63ff controls fixed1
XAI_DEPS_ROOT=... node docs/reviews/web-features-recovery-native/verify-native-fixed.mjs 5cd63ff reset fixed1
XAI_DEPS_ROOT=... node docs/reviews/web-features-recovery-native/verify-native-fixed.mjs 5cd63ff export fixed1
```

`XAI_NATIVE_TMPDIR` pointed at the session scratch directory; the temporary archive, profile, download directory and bundle were deleted after each run. Console lines:

- `PASS docs/reviews/web-features-recovery-native/native-5cd63ff-fixed1-controls.log checks=524 product=285 exit=0`
- `PASS docs/reviews/web-features-recovery-native/native-5cd63ff-fixed1-reset.log checks=219 product=99 exit=0`
- `PASS docs/reviews/web-features-recovery-native/native-5cd63ff-fixed1-export.log checks=442 product=217 exit=0`

Exit 0 = harness valid and every check PASS; 2 = harness valid and a product check failed (the run stops there); 1 = a precondition failed (harness invalid). Rerunning an existing suffix stops with `Evidence exists; use a distinct suffix` before anything is archived (verified for `controls fixed1`); artifacts are written with an existence precondition and `wx`.

**Development probes (disclosed).** Following the before-stage precedent, I ran development probes with `XAI_NATIVE_EVIDENCE_DIR` set to the session scratch directory (the runner refuses that variable inside the repository): `reset dev1` PASS, `controls dev1` PASS, `export dev1` stopped at X4, `export dev2` PASS. None is committed. The only change after a probe was in the X4 scenario: Habits still stored `false` (its removal had been refused in X2), so its first activation (off) equals the stored bytes and the engine completes it as a verified no-op save without a write. That is correct compare-before-write behaviour (`prefMutation.ts`), and my scenario had wrongly expected a refused set. X4 now asserts that no-op explicitly (export L148) and uses a second activation (on) for the refused set. No assertion was weakened; one check was added. The committed runs used the unchanged final files.

## Harness

- **Two compositions, both bundled from the immutable archive** (`@repo/*` pinned to the archive's package exports; a guard fails the build on any module from the `packages/`, `apps/` or `docs/` tree of either checkout):
  - **E9 and E10: the production App composition** (`native-fixed.tsx`, following the before fixture `native-app.tsx`): the module and stylesheet order of `apps/web/src/main.tsx`; the production router instance from `routes/router.tsx` under `RouterProvider` at `/app/settings/features`: `ProtectedAppRouteElement` → `App` → `AccountStorageGate` → `AccountDataGate` → `CommandPaletteProvider` → `WebShellProvider` + `Shell` (AppRail, Topbar) + `DesktopPet` + `CommandPalette` → `AppRouteElement` → ComposedSettings (`DepartureCoordinator`, `settingsDeparture`, sidebar, detail) → the real fixed Features pane, `usePrefAutosaveAsync`, `mutatePref`, registry and codec. **The only synthetic input is the auth session** (a client whose `auth.getSession` resolves one session for the synthetic account `features-native-A`, the shape of the product's own mock client); the real `WebAuthSessionProvider` with the production `invalidateAccountIdentity` serves it, and the real `AccountDataGate` activates generation `g1` (precondition `…:account-data-gate-activated-account` at every mount). Bundle: 1012 inputs = 621 archive-relative + 390 third-party + the fixture, 0 foreign; 320 pinned `@repo` resolutions; 620 archive modules observed by the guard; all 37 required modules from the archive (L1, preconditions L4–L5).
  - **E11: the Settings host composition** (`native-fixed-host.tsx`, following the accepted Sticky export fixture `../web-sticky-recovery-native/native.tsx`, not modified): the production `Shell` inside `WebShellProvider` with the production `webShellModuleRegistrations`, and the production ComposedSettings under React Router's `createBrowserRouter`, with the real `accountScope` driven through real `activate`/`lock` transitions. Reason: contract §8 shapes 7 and 8 need a fresh locked export after A→locked and a fresh B export after A→B **while the pane stays mounted** (§7 "Survival while mounted"); in the production App, `AccountDataGate` keys its business subtree by scope kind, account, generation and epoch, so any scope change unmounts the pane by design (forced-authentication durability is REL-09, contract §7 and §16). Bundle: 630 inputs = 561 archive-relative + 68 third-party + the fixture, 0 foreign; 285 pinned resolutions; 560 archive modules; all 21 required modules (L1, L4–L5).
- **Instruments** (`native-fixed-prelude.js`, a classic script served before the bundle and alone on a product-free seed page, where its self-test passes at L9–L10 of every log):
  - attempt-level Storage tracing: every `getItem`/`setItem`/`removeItem`/`key`/`clear`/`length` attempt is logged **before** any fault decision and before delegation. Faults: total denial, per-key read/write/remove denial, and one-shot readback denial after the next successful `setItem` or `removeItem` of a key. Read faults that must exist before mount are installed by `Page.addScriptToEvaluateOnNewDocument` (`window.__nativeFaultPlan`);
  - the instrumented `window.dispatchEvent` (contract §10 item 5) counting every `StorageEvent` and its key, plus a first-registered `storage` listener counting delivered events (trusted or synthetic);
  - `LockManager.request` tracing (application vs fixture) and fixture hold/release of the **real** `prefMutationLockName("xai_pref_features_<id>")` (precondition `…:real-lock-names-and-unscoped-physical-keys` at every App mount; export L18);
  - `URL.createObjectURL`/`revokeObjectURL`, the export anchor's click and its body insertion/removal, with one-shot create or click failure hooks;
  - a `window.confirm` recorder (call and return are sequence-stamped; the dialog stays native and is answered through `Page.handleJavaScriptDialog`);
  - armed DOM observers and element identity for the account-gate screen, `.app`, AppRail, DesktopPet, `.settings-shell`, sidebar, detail and Features pane, and an armed `requestAnimationFrame` sampler of the pane status and recovery-block count;
  - network recorders refusing anything non-local; read-only views of the pane, the departure dialog and a synthetic cancelable `beforeunload` (handler storage attempts counted).
- **Input and bytes.** Every activation is trusted CDP mouse input after a centre hit-test (`input:centre-hit-test:*` preconditions; trusted `click` events recorded in the capture phase). Bytes are read uninstrumented and cross-checked through CDP `DOMStorage`. Seeds are written on the seed page before the application mounts.
- **Second document.** An independent same-origin tab (`/external`, no product code and no instruments) created with `Target.createTarget` writes through its own `localStorage`; the first document receives a native keyed `storage` event.

## E9 — controls (production App): PASS

| Required item | Result | Log lines (`native-5cd63ff-fixed1-controls.log`) |
| --- | --- | --- |
| Initial absent mount: 8 keys absent, all on displayed, zero write/remove attempts on the 8 keys (32 reads), clean (no recovery, no Saved claim, no Save footer, only "Reset to defaults"), zero key:null, no unload warning | PASS | 19–25 |
| **All 16 values by trusted input**, exact bytes at the unscoped key after each (uninstrumented and DevTools), exactly one write attempt with the exact value, the real device lock `xai:pref:v1:xai_pref_features_<id>` and no account lock or account-key mutation, displayed `aria-checked`, truthful "Features settings saved.", zero key:null; then a **graceful browser restart** on the same profile: exact bytes, displayed values and zero mount write/remove attempts in the fresh process | PASS ×16 | table below; summary 443 |
| Turning a module back on stores `true` (never a removal) | PASS ×8 | the even-numbered values below (`one-exact-write-attempt` shows `set …=true`, `removes: []`) |
| **New-document reload** (same browser, `Page.reload`): exact bytes, displayed values, zero mount write/remove attempts on the 8 keys, clean | PASS | 444 (new instance), 445–450 |
| **Native held per-key lock** (Matrix on→off): the fixture holds the real Matrix lock; pending "Matrix is saving." with Retry/Discard, latest choice displayed, no Saved claim, bytes unchanged (`true`, both reads) and zero writes, the engine's request pending on the same lock, `beforeunload` warns; Retry while pending is inert (0 attempts, 0 lock requests); after release exactly one write (`false`) and Saved | PASS | 451, 454–458, 462, 463, 464 |
| **Readback uncertainty** (Pomodoro on→off): the write lands and its readback is denied once; "Pomodoro was not saved." with the latest choice, no false Saved, warning; Retry reconciles with **exactly one total write** and Saved | PASS | 465–466, 469 (fault fired), 470, 471, 475 |
| **Second-document conflict** (Habits on→off, uncertain): the other document restores the original baseline bytes `true` (ABA); the first document receives the keyed native event (not key:null); Retry preserves the external bytes with no further write, the recovery stays and the latest choice is kept; a repeated Retry never overwrites; Discard makes zero writes, shows the external value and stops warning; Discard rereads only Habits | PASS | 476, 479–480, 484–486, 490, 491, 495, 499, 500 |
| **Source-only states**: bytes `1`, `TRUE`, `yes`, empty string, `"true"` (JSON-quoted), ` true` and a throwing read (fault plan before mount): each field shows "Saved <Label> is unavailable. Reload it; this is not a new unsaved change." with **Reload only**, the default is displayed, the valid field is unaffected, no Saved claim, no draft or export, mount never rewrites, purges or normalizes the bytes, no unload warning | PASS | 511 (fault plan fired), 512–516 |
| Source-only never holds a departure (trusted sidebar to About leaves; back to Features shows the same alerts with zero writes) | PASS | 520, 524–525 |
| Reload of a malformed field rereads, keeps its alert and bytes, never writes; Reload after the read fault is lifted repairs Habits without a Saved claim | PASS | 529, 534 |
| A valid edit over a malformed source (Boards `TRUE`) is a failed draft with Retry/Discard, export and warning; the bytes are never overwritten (0 write attempts); Discard returns to Reload-only with zero writes | PASS | 537, 538, 542 |
| Zero key:null, zero runtime errors, no unexpected dialogs, zero non-local network | PASS | 543, 545–547; result 548 |

The 16 values (trusted click, exact bytes, one write, device lock, Saved, then restart bytes, restart display, restart zero writes):

| # | Value | Trusted | Bytes | DevTools | One write | Lock | Saved | Restart bytes | Restart display | Restart zero writes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `tasks=false` | 29 | 31 | 32 | 33 | 34 | 36 | 46 | 48 | 49 |
| 2 | `tasks=true` | 55 | 57 | 58 | 59 | 60 | 62 | 72 | 74 | 75 |
| 3 | `board=false` | 81 | 83 | 84 | 85 | 86 | 88 | 98 | 100 | 101 |
| 4 | `board=true` | 107 | 109 | 110 | 111 | 112 | 114 | 124 | 126 | 127 |
| 5 | `dashboard=false` | 133 | 135 | 136 | 137 | 138 | 140 | 150 | 152 | 153 |
| 6 | `dashboard=true` | 159 | 161 | 162 | 163 | 164 | 166 | 176 | 178 | 179 |
| 7 | `calendar=false` | 185 | 187 | 188 | 189 | 190 | 192 | 202 | 204 | 205 |
| 8 | `calendar=true` | 211 | 213 | 214 | 215 | 216 | 218 | 228 | 230 | 231 |
| 9 | `matrix=false` | 237 | 239 | 240 | 241 | 242 | 244 | 254 | 256 | 257 |
| 10 | `matrix=true` | 263 | 265 | 266 | 267 | 268 | 270 | 280 | 282 | 283 |
| 11 | `pomodoro=false` | 289 | 291 | 292 | 293 | 294 | 296 | 306 | 308 | 309 |
| 12 | `pomodoro=true` | 315 | 317 | 318 | 319 | 320 | 322 | 332 | 334 | 335 |
| 13 | `habits=false` | 341 | 343 | 344 | 345 | 346 | 348 | 358 | 360 | 361 |
| 14 | `habits=true` | 367 | 369 | 370 | 371 | 372 | 374 | 384 | 386 | 387 |
| 15 | `meditation=false` | 393 | 395 | 396 | 397 | 398 | 400 | 410 | 412 | 413 |
| 16 | `meditation=true` | 419 | 421 | 422 | 423 | 424 | 426 | 436 | 438 | 439 |

## E10 — Reset to defaults (production App): PASS

Six scenarios, each on a fresh seed and mount, with unrelated keys seeded (accent hue `210`, background tone `lavender`, pet `pip` at `{x:300,y:200}`, `xai_pref_sticky_color` `mint`, a probe key, plus the generation marker). Each mount is first checked clean with zero write/remove attempts.

| Required item | Result | Log lines (`native-5cd63ff-fixed1-reset.log`) |
| --- | --- | --- |
| **Declined confirmation** (R0, all 8 stored `false`): the normative text "Turn all 8 modules back on? This only changes which modules are shown; your data is kept." asked once and declined; **zero get/set/remove attempts from the trusted activation (seq 88) to the confirm return (seq 90)**, zero attempts of any kind on any key in the whole 600 ms window (global total 0), no state change (no recovery, no status, all off displayed and stored, no warning) | PASS | 29, 30 (traced), 31, 32, 33 |
| **Accepted** (R1: 6 keys `false`, Habits `true`, Meditation absent): the normative confirmation accepted; exactly 7 removes, all `ok`, on the 7 present keys and none on Meditation (verified no-op); **zero writes of any kind** (never writes `true`); all 8 keys absent (both reads); all on displayed, no recovery, "Defaults restored." in the status region, no warning; only the 8 device-key locks, no account lock or account-key mutation | PASS | 59–64 |
| **One-key removeItem fault** (R2, Calendar): 7 removed, Calendar refused and kept `false`; a reset draft "Calendar was not reset to its default." with Retry/Discard showing the intended default; no "Defaults restored.", export and warning present; a repeated refused Retry targets only Calendar (1 attempt, denied); after the fault is lifted, Retry makes **exactly one remove (Calendar)**, successful fields are not removed again, and only then "Defaults restored." | PASS | 91 (fault fired), 92–94, 98, 102, 103 |
| **Two-key faults** (R3, Boards and Habits): 6 removed, 2 reset drafts; Retry Boards makes one remove and Habits stays unresolved with no "Defaults restored."; Retry Habits makes one remove and then "Defaults restored." | PASS | 130 (faults fired), 131, 135, 139 |
| **Uncertainty** (R4, Pomodoro): the remove lands and its readback is denied once; the reset draft stays with no "Defaults restored."; Retry verifies absence with **exactly one total remove** and no write, then "Defaults restored." | PASS | 166 (fault fired), 167, 171 |
| **External conflict** (R5, Matrix): the refused reset keeps its draft; the other document writes `true`; Retry preserves the external bytes with **zero removes or writes**; the reset draft stays, no "Defaults restored."; a repeated Retry never removes; Discard makes zero writes, shows the external value (on) and stops warning; "Defaults restored." is never claimed after the discarded reset | PASS | 198–199, 204 (external write), 208, 209, 213, 217, 218 |
| **Truthful "Defaults restored."** per rendered frame: no frame shows it while any recovery block exists | PASS ×6 | 38, 69, 108, 144, 176, 224 |
| **Unrelated-key snapshot unchanged** (every localStorage key other than the 8, including the marker and `xai:auth:identity-change`) | PASS ×6 | 37, 68, 107, 143, 175, 223 |
| **Zero key:null StorageEvents** dispatched or delivered | PASS ×6 | 34, 65, 104, 140, 172, 220 |
| **No account relock** (no `accountScope` transition after the scenario mark; scope stays `account:features-native-A`) | PASS ×6 | 35, 66, 105, 141, 173, 221 |
| **No host remount and no gate screen** (`.app`, AppRail, DesktopPet, `.settings-shell`, sidebar, detail and pane are the same nodes; no watched removal; no gate insertion) | PASS ×6 | 36, 67, 106, 142, 174, 222 |
| Throughout (6 scenarios): key:null dispatched 0, delivered 0, relocks 0, scope transitions 0, gate insertions 0, watched removals 0, replaced nodes 0 | PASS | 226 (record), 227 |
| Zero runtime errors, only the 6 planned confirmations, zero non-local network | PASS | 229–231; result 232 |

## E11 — on-disk export (Settings host composition): PASS

Every export runs under **total Storage denial** (every Storage operation throws; precondition: the injector fires and logs one denied read immediately before). For each one the log asserts: attempt-level reads, writes, removes and other operations all **zero** during the export window; exactly one object URL created and **that same URL revoked**; the anchor appended, clicked once with that URL and **removed** (0 anchors left); the actual Chrome download parsed from disk and **deep-equal to the full envelope**; a single `features-draft.json`; no account bucket, physical key, account id or timestamp; zero key:null; location unchanged; the drafts and pane actions kept; afterwards a cancelable `beforeunload` **still warns** with zero handler storage attempts, and a trusted sidebar departure is **still blocked** by the "Unsaved Features draft" dialog ("Features has unsaved changes.") until Stay, with zero storage attempts in the guard window.

| §8 shape | Scenario | Disk envelope `changes.device` | Zero attempts | URL | Anchor | Deep-equal | Warns | Guard | Disk SHA-256 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 sparse set, one field | X1: Tasks off refused | `tasks: set false` | 33 | 35 | 36 | 37 | 47 | 51 | `0595a4ba…` (L41) |
| 2 sparse reset left from a partial reset | X2: Reset with Habits' remove refused; 7 others completed | `habits: reset` | 70 | 72 | 73 | 74 | 84 | 88 | `5f2603dd…` (L78) |
| 3 mixed set and reset | X3: Boards off refused + Habits reset draft | `board: set false`, `habits: reset` | 104 | 106 | 107 | 108 | 118 | 122 | `34e06d50…` (L112) |
| 4 all 8 sets | X4: 8 refused sets, Boards/Matrix/Habits on, others off | 8 × `set` | 166 | 168 | 169 | 170 | 180 | 184 | `46870d52…` (L174) |
| 5 **all 8 pending resets** | X5: all 8 real locks held, Reset accepted, 8 × "is being reset to its default." | 8 × `reset` | 203 | 205 | 206 | 207 | 218 | 222 | `ad6554f8…` (L211) |
| 6 departure dialog | X6: trusted sidebar departure held; "Export current draft"; the dialog stays open and identical, location key unchanged | `dashboard`, `pomodoro`: `set false` | 246 | 248 | 249 | 250 | 260 | 264, 268 | `ff4f0724…` (L254) |
| 7 fresh locked after A→locked | X7: drafts survive, new draft in the locked scope | `dashboard`, `pomodoro`, `meditation`: `set false` | 287 | 289 | 290 | 291 | 301 | 305 | `73bbb793…` (L295) |
| 8 fresh B after A→B | X8: locked→A→B, drafts survive, new draft in B | `tasks`, `dashboard`, `pomodoro`, `meditation`: `set false` | 324 | 326 | 327 | 328 | 338 | 342 | `44bf8221…` (L332) |
| 9 one operation held behind a real lock | X9: Calendar's real lock held, "Calendar is saving." | the 4 above + `calendar: set false` | 359 | 361 | 362 | 363 | 374 | 378 | `f1a65a6d…` (L367) |

Supporting facts:
- Start: the pane is entered by a trusted sidebar click with its own history key; zero-write mount; clean control without warning (export L17, L19–L21).
- X2: the normative confirmation and the partial reset leaving only Habits (L60–L61); the remove fault fired (L62); the other keys were removed without writes and no "Defaults restored." was shown (L63).
- X4: Habits' first activation equals its stored bytes and is a verified no-op save (L148); displayed latest choices (L159).
- X5: the engine waits on all 8 real locks (L196); the export never releases them and changes no bytes (L217); after release the resets complete with exactly one remove (Habits) and "Defaults restored." (L228).
- X6: the departure was held before the export (L239); the dialog stayed open and identical (L258); Stay kept the location (L264).
- X7/X8: real transitions A→locked (epoch 2→3) and locked→A→B (epoch 3→5→7) (L280, L317); drafts survive each (L276, L311, L313); scope preconditions L275, L312.
- X9: the engine waits on the real Calendar lock (L352); the export never releases it and Calendar stays absent (L373); after release exactly one write (L384).
- **Native setup failures** under total denial: X10a, the anchor click throws once: "Export failed. Please retry." shown, no download, zero attempts, one URL created and the same revoked, anchor appended, clicked once and removed, drafts kept, warning and guard intact (L390–L409). X10b, the recovered export writes the same 4-draft envelope and clears the error (L416–L439, disk L425). X10c, `createObjectURL` throws once: the localized error, no URL, no anchor, no click, zero attempts, drafts, warning and guard intact (L446–L463).
- Run: zero key:null over the whole document (L465), zero non-local network, no unexpected dialogs (two planned confirmations), zero runtime errors (L468–L470; result L471).

## Counts that the controller asked for

| Count | controls | reset | export |
| --- | --- | --- | --- |
| Checks / product checks (runner counters, result record) | 524 / 285 | 219 / 99 | 442 / 217 |
| Failed checks; `PRECONDITION` failures | 0; 0 | 0; 0 | 0; 0 |
| key:null StorageEvents dispatched / delivered | 0 / 0 (every step) | 0 / 0 (L226) | 0 / 0 (L465) |
| Account relocks / host remounts / gate insertions | not applicable (no Features reset) | 0 / 0 / 0 (L226–L227) | not applicable (host composition without `AccountDataGate`) |
| Runtime exceptions + console errors | 0 | 0 | 0 |
| Console warnings | 6 (legacy `getPref` "decode failed" warnings, one per malformed key, from the App's legacy readers while the malformed bytes were seeded) | 0 | 0 |

**Log-field quirk (no verdict affected).** Two passing precondition records in the export log, `export:account-a-active` (L13) and `export:x7:starts-in-account-a` (L274), show `"kind":"account"` instead of `"kind":"precondition"`, because the scope object passed as details was spread after the check kind. Both are `pre(...)` calls; the runner's counters are computed independently (442 checks, 217 product, so 225 preconditions).

## Observations (recorded, not verdicts)

- Every App mount makes two writes and one remove on non-Features keys (a random `lswt-*` writability probe and `xai:auth:identity-change`); the 8 Features keys see reads only (e.g. controls L22: 32 reads, 0 writes, 0 removes on the 8 keys).
- After discarding a conflicted reset whose 7 siblings succeeded, the status reads "Features settings saved." (reset L219). This matches contract §5 item 7 (a genuine success in this mount and no remaining work); "Defaults restored." is correctly not shown (L218).
- After discarding the ABA-conflicted Habits set, the status is empty (controls L501).
- Focus never fell to `<body>`: it stayed on "Reset to defaults" after a reset, and on the field's switch after a per-field Reload, Retry or Discard (controls L530; reset integrity observations L39, L70, L109, L145, L177, L225). Keyboard and focus targets are E15.

## Limitations

- Headless Chrome with an isolated profile; synthetic auth session and synthetic accounts; not Tauri; development build without StrictMode; dependency tree reused from the main checkout (the lockfile gate is a consistency check only). These are the contract §15 retained exclusions.
- `beforeunload` is a synthetic cancelable event (contract §15); the real prompt was not exercised.
- "On-disk bytes" for E9 are proven by a graceful browser close and a fresh browser process on the same profile reading the bytes through the page and DevTools; the LevelDB files themselves were not parsed.
- E11 ran in the Settings host composition (actual ComposedSettings with the full Shell), not in the production App, for the reason given under Harness; E9 and E10 ran in the production App.
- The second document is an independent same-origin tab without product code, not a second App instance; the fixture-held lock lives in the same page.
- The declined-reset window check is global between the trusted activation and the confirm return, and Features-key-only (global recorded, 0) for the surrounding 600 ms.
- Not covered here: host matrix rows a–n (E12), production-App downstream readers (E13), visual (E14), keyboard (E15), and every later item.
