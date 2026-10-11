# AppRail order recovery: rail F1-shape before evidence (CP-APPRAIL-01, batch 58, E5)

**Verdict: FROZEN.** This directory freezes the new rail F1-shape runner, its host fixture and their before logs for the AppRail order caller (`xai_rail_order`), against the before product `419e56d`. It is contract r1 §15 item **E5** (§12 "Rail F1-shape before").

- `selfcheck`: **harness-valid** (exit 0). Every assertion is a precondition and all 165 checks pass, including six positive controls with zero F1 signatures.
- `railorder`: **before-correct** (exit 2, the designed code for a harness-valid run whose fixed-stage oracle fails). f1 `before-no-rail-step`, f2 `before-unprotected`, f3 `before-pass-control`, exactly the correct before states of contract §12.
- **F1 signatures: zero** in every case of both runs: zero duplicate `proceed()` calls, zero non-live blocker calls, zero invalid-transition throws, zero runtime errors.
- The frozen F1 prelude is reused read-only and hash-checked. The K-1 key audit holds in both runs.

This is evidence only. It changes no product source, product test, contract, prior evidence, ledger or control plane. It accepts nothing, does not authorize Terra and closes no 312 item.

## 1. Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, parent native verifier role, isolated worktree `.claude/worktrees/agent-ac30bd6d871d15a1b` (the same executor as `../web-apprail-order-recovery-native/before-419e56d.md`) |
| Docs base (detached HEAD) | `d961694ef8160664238fa1c0da590f68da4663a5`; both logs record `docsHead` (line 2) |
| Requested before revision | `419e56d` |
| Resolved commit / tree | `419e56de9f23e4467fea806fbd4a990e1f429941` / `7aabbd832be446aeca1441eff34f2fd35945290a` (line 2) |
| Authority | `../web-apprail-order-recovery-contract/contract.md` r1 (`f7726d7`, SHA-256 `b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde`, checked by `baseline:contract-r1-hash`): §5 wording, §6 item 8, §7 item 4, §12 "Rail F1-shape before" (f1–f3), §15 E5 and E16. Also `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`, "本轮唯一任务" (batch 58) |
| Conventions read (not imported, executed or modified) | `../web-appearance-recovery-f1/verify-f1-appearance.mjs` (`f570b5c9…`), its fixture `f1-appearance-host.tsx` (`19b4601f…`) and the K-1 corrected copy `../web-native-keyinput-k1/verify-f1-appearance-k1.mjs` (`e9fbc590…`). The runner records and checks these three hashes (`baseline:reference-files-unchanged`) |
| Frozen prelude | `../web-sticky-recovery-f1/f1-prelude.js`, reused **read-only** and served unchanged. Its SHA-256 must equal `67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670` both in the working tree and as the blob committed at HEAD, or the runner stops before building; recorded with its last commit `0ba68d7…` (line 2, `frozenPrelude`; precondition `baseline:frozen-prelude-hash-equals-committed`) |
| Iterations | One authoritative run per mode (`before1`). No diagnostic iteration was needed. Development probes are disclosed in §6 |

## 2. Files and SHA-256

| File | Role | SHA-256 |
| --- | --- | --- |
| `verify-f1-railorder.mjs` | Runner (`selfcheck`, `railorder`) | `6385b6488c668c72d7743a692d91a991cdc276ebd0608a08d57524599a257789` |
| `f1-railorder-host.tsx` | Host fixture (production `App` composition) | `fb6a8eb2e494cdc52d8354f3f321f04f113c4841506a8a5af45d27996dbafb7b` |
| `f1-419e56d-selfcheck-before1.log` | **Authoritative** selfcheck log (174 lines) | `2c31dacd95eec4ff9e94b0a9bb27ee69faae66bc2b203c666c54ff8d8a7db33a` |
| `f1-419e56d-railorder-before1.log` | **Authoritative** railorder log (111 lines) | `3108774b08a066e8aa1584e576d97e154c892a92513006f6cc8c1b5902f064cd` |

Both logs record exactly the two code hashes above (line 2, `fileSha256`). This receipt cannot carry its own hash.

## 3. Commands

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
XAI_NATIVE_TMPDIR=<scratchpad>/tmp \
  node docs/reviews/web-apprail-order-recovery-f1/verify-f1-railorder.mjs 419e56d selfcheck before1
# -> PASS ... verdict=harness-valid checks=165 exit=0
XAI_DEPS_ROOT=… XAI_NATIVE_TMPDIR=… \
  node docs/reviews/web-apprail-order-recovery-f1/verify-f1-railorder.mjs 419e56d railorder before1
# -> VALID-ORACLE-FAIL ... verdict=before-correct checks=104 exit=2 f1:before-no-rail-step f2:before-unprotected f3:before-pass-control
```

The dependency root was read only; nothing was installed or started there. Exit codes: 0 = pass (selfcheck harness-valid / railorder fixed-pass); 2 = harness valid but the railorder oracle failed, including the expected `before-correct`; 1 = harness invalid. The runner refuses to overwrite a log. **E16** reruns this file unchanged at the fixed SHA with a new suffix; its only SHA binding is the docs-head product-delta precondition, so it must run from a docs head whose product tree equals the fixed revision.

## 4. Harness, provenance and transport

- **Archive, lockfile, guard.** Immutable `git archive 419e56de…`; lockfile gate `df05f2dd…9aeab9` four ways (line 2, `lockfileSha256`); `@repo/*` pinned to the archive's exports behind a guard that fails on any module from the `packages/`, `apps/` or `docs/` trees of either checkout: zero violations, zero foreign inputs, 625 archive modules, all 25 required modules bundled from the archive (`AppRail.tsx`, `internal/dnd.ts`, `registry.tsx`, `AvatarMenu.tsx`, `SignOutConfirmDialog.tsx`, `App.tsx`, `departureCoordinator.tsx`, `settingsDeparture.ts`, the More pane, storage `usePref.ts`, `storage.ts`, `usePrefAsync.ts`, `prefMutation.ts`, among others). Bundle SHA-256 `3dacd41022f4b3473058f3467e083af086f3dd56e9224aa119cdeb10811bd0db` in both runs.
- **Composition.** `f1-railorder-host.tsx` is a copy of the Appearance F1 host with only these changes (header comment lists them): the synthetic account, session, marker-migration and confirm-probe names; the Appearance-only label imports (`dark`, `ocean`) replaced by the archive's own rail `nav` labels; a **passive** capture-phase drag recorder (`dragstart`, `dragenter`, `dragover`, `dragleave`, `drop`, `dragend` with `isTrusted`; never `preventDefault`/`stopPropagation`); read-only `verify` fields for the rail (`railNames`, `railOrderStatus` reading `[data-testid="rail-order-status"]`, the `xai_rail_order` lock name) and `drags` in the windowed view. The production `App` composition (main.tsx order, production router instance, `WebAuthSessionProvider` with the production `invalidateAccountIdentity`), the storage fault and attempt tracing, the router-level navigate trace, the blocker wrappers and the frozen prelude's React commit observer are unchanged. **The only synthetic input is the auth session**; `App.handleSignOut` takes its fallback branch.
- **Browser and transport.** `Chrome/155.0.8059.39`, Node v24.16.0, esbuild 0.28.1, React 19.2.0, react-router 7.15.1 (line 2). Headless, isolated profile, every host except `127.0.0.1` mapped to NOTFOUND. DevTools over the **pipe** (`--remote-debugging-pipe`, one flattened page session), not the WebSocket of the Appearance F1 runner. `window.location.assign("/")` at the end of a sign-out is observed through the Fetch domain and answered 204 so the document stays inspectable.
- **Trusted input.** Clicks by `Input.dispatchMouseEvent` after a centre hit-test. Rail drags as contract §6 item 8: `Input.setInterceptDrags`, mouse press and move on the source, `Input.dispatchDragEvent` `dragEnter`, `dragOver`, a resting-pointer `dragOver`, and `drop`; source and target centre-hit-tested and uncovered; every recorded drag event must be trusted, with a trusted `dragstart` on the source rail button, a `dragover` on the target, exactly one `drop` inside `.rail-items` and a `dragend` (preconditions `*:every-recorded-drag-event-trusted`, `*:trusted-dragstart-dragover-drop-dragend`).
- **K-1 key audit.** `pressEscape()` sends no `nativeVirtualKeyCode`. A passive recorder installed in every new document (`Page.addScriptToEvaluateOnNewDocument`) is read before every navigation and at the end; precondition `run:k1-keyboard-trace-contains-only-the-runner-key-presses`. selfcheck (line 172–173): 7 documents, 1 runner press, 1 keydown, 1 keyup, 0 keypress, 0 mismatches. railorder (line 109–110): 4 documents, 0 presses, 0 keydowns, 0 mismatches.

## 5. Results

### 5.1 `selfcheck` (harness validity), `f1-419e56d-selfcheck-before1.log`

All 165 checks are preconditions and all pass (`result`, line 174: `harnessValid: true`, `verdict: "harness-valid"`). Baseline (line 2 and the following checks): product delta empty, lockfile gate, frozen prelude hash, contract r1 hash, reference-file hashes, guard, required modules, no mount runtime errors, the React commit observer active with the coordinator observed and zero hook errors. Instruments: storage faults and attempt logging, the StorageEvent dispatch counter, a real `window.confirm` answered through CDP, the router-level navigate and commit traces. Surfaces without edits: the `xai_rail_order` and More lock names, 14 rail buttons (first, third and last centre-hit-tested), no rail-order status in the clean state, the Settings sidebar row, the avatar menu and sign-out dialog (Cancel keeps the identity), Escape closes the avatar menu, and zero writes on the rail and More keys.

| Positive control | Result | F1 counts | Line |
| --- | --- | --- | --- |
| pc1 sidebar-release | A programmatic sidebar departure is held by the More draft; one More Retry releases it once to `/app/settings/appearance` (one PUSH commit) | proceeds 0, non-live 0, duplicate 0, runtime errors 0 | 60 |
| pc2 back-release | A browser Back is held; one More Retry releases it with exactly one live `proceed()` from `blocked` and one POP commit | proceeds 1, non-live 0, duplicate 0, runtime errors 0 | 83 |
| pc3 signout-held-stay | Sign-out through the real UI with a More draft: the coordinator holds, Stay resolves false, identity intact, zero history mutations | all 0 | 111 |
| pc4 signout-proceeds | Sign-out from `/app/tasks` without drafts: identity invalidated, one `signOut`, a request for `/`, no dialog | all 0 | 132 |
| pc5 trusted-rail-drag | A trusted all-visible drag and drop: every drag event trusted; the final bytes equal the reordered display order (P6) | all 0 | 147 |
| pc6 rail-click-release | An AppRail click on Tasks from the More pane is held by the More draft; one More Retry releases it exactly once to `/app/tasks` (one PUSH commit, one navigate replay, zero blocker calls) | all 0 | 165 |

`selfcheck:positive-controls-zero-f1-signature` passes (line 169).

### 5.2 `railorder` (f1–f3), `f1-419e56d-railorder-before1.log`

Each case first proves its failed rail draft: a trusted rail drag and drop with `setItem("xai_rail_order")` failing (`QuotaExceededError`), the fault armed and observed (three denied set attempts during `dragover`) and the bytes unchanged. Product assertions are deferred and recorded; the before states are decided from them.

| Case | Scenario (contract §12) | Observed at `419e56d` | State | F1 counts | Lines |
| --- | --- | --- | --- | --- | --- |
| **f1** | Sign-out with a failed rail draft and a More draft held by the coordinator; rail OK, then a successful More Retry | Zero `window.confirm` (no rail step; deferred FAIL line 40). The coordinator dialog "Unsaved More draft" holds the sign-out (line 41). After closing the AvatarMenu by its scrim, one successful More Retry releases the sign-out exactly once: one `client.auth.signOut`, one document request for `/`, More written once (line 47). No rail status after the failed drag (`railStatusAfterFailedDrag: null`) | `before-no-rail-step` | proceeds 0, duplicate 0, non-live 0, invalid transitions 0, runtime errors 0 | 40–49 |
| **f2** | Sign-out from `/app/tasks` with a failed rail draft; Cancel at the rail step | Zero `window.confirm` (deferred FAIL line 72); the sign-out resolved true: identity invalidated, one `signOut`, one request for `/` (deferred FAIL line 73); no rail status (deferred FAIL line 74) | `before-unprotected` | all 0 | 72–76 |
| **f3** | AppRail click away from the More pane with a held More draft, while a rail draft exists; a successful More Retry releases the click | The click on Tasks is held by the coordinator (line 102); one More Retry releases it exactly once to `/app/tasks`: one PUSH commit, one navigate replay, zero blocker calls, More written once (line 103); no rail status exists (a rail draft cannot exist at the revision) | `before-pass-control` | all 0 | 102–105 |

Summary (line 106): states equal the expected before map, `signatureFree: true`. Result (line 111): `verdict: "before-correct"`, deferred failures exactly the four fixed-stage assertions of f1 and f2 above.

## 6. Development probes (disclosed)

Development probes ran the same runner with `XAI_F1_EVIDENCE_DIR` in the session scratchpad, outside the repository. None of their output is committed or cited.

| Probe | Mode | Outcome | Change made afterwards |
| --- | --- | --- | --- |
| probe1 | selfcheck | harness-valid (same as `before1`) | None |
| probe1 | railorder | Harness-valid, but f1 classified `fail`: the oracle required exactly one "locked" scope transition, while every completed sign-out (pc4 included) moves the scope to "locked" three times (identity invalidation, then the session provider's follow-up epochs) | The f1 release-once oracle now counts one `client.auth.signOut` call and the document requests for `/`, and records the number of locked transitions (comment in the runner). No other change |
| probe2 | railorder | `before-correct` (same as `before1`) | None |

The resting-pointer `dragOver` in `railDragDrop` comes from the native runner's development probe 1 (`../web-apprail-order-recovery-native/before-419e56d.md` §8) and was present before any F1 probe.

## 7. Observations for the controller

1. **"One live `proceed()`" in contract §12.** The contract says every fixed f-run requires one live `proceed()`, zero non-live blocker calls and one router commit. That holds literally only for a browser POP departure (as pc2). f3's release is the coordinator's programmatic-intent path, one replay of `router.navigate` with zero blocker calls, as in the accepted Appearance a1 and pc1; f1 and f2 are sign-out flows with no router commit. This runner therefore judges "released exactly once" by the mechanism used: release count (navigate replays to the target plus live proceeds) = 1, zero non-live blocker calls, one commit for f3, and one `signOut` for f1. The E16 verifier should read the contract sentence that way; this is a wording point, not a contradiction with the source.
2. **Fallback auth branch only.** The synthetic session has no coordinator, so these cases exercise `handleSignOut`'s fallback branch, as the Appearance F1-shape did.
3. **Unrelated Tasks alert.** f2 and pc4/pc5 mount `/app/tasks`, where the Tasks module shows its own pre-existing save-failure alert in this composition (see the native receipt §6 item 1). It does not affect any F1 count.

## 8. Limitations

Headless Chrome with a synthetic auth session, a development build and dependency trees reused read-only behind the lockfile gate; not Tauri. The f-cases need trusted pointer input only (one trusted Escape exists in `selfcheck`).
