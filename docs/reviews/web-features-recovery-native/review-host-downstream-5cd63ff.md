# Features native host matrix and production-App downstream (CP-FEATURES-01, batch 28, contract §14 E12, E13)

**Verdict: PASS for both modes** (`host` = E12, `downstream` = E13), each on its first committed diagnostic iteration (`fixed1`). No product failure was observed. Both logs end with `pass: true`, 0 failed checks, 0 failed row gates, 0 runtime exceptions, 0 console errors or warnings, 0 unexpected JavaScript dialogs and 0 non-local network attempts.

**Status.** This is verification only:
- It is not acceptance and it authorizes nothing.
- It changes no product source, product test, contract, ledger, control plane or existing evidence. Every earlier file in this directory and in `../web-sticky-recovery-native/` was read only; `git status` before the commit lists only the new files below.
- It closes no 312 item: REL-05, REL-07, REL-09, REL-10, UX-04, UX-05, SET-03, SHELL-02, SHELL-03, QA-01, QA-03, QA-04, QA-09 and D2/REL/AI stay open.
- E14 (visual), E15 (keyboard), E18–E25 and the final acceptance belong to later batches.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, parent-role native verifier, in its own isolated worktree. It did not write the contract, the implementation or any earlier Features evidence. |
| Worktree | `.claude/worktrees/agent-a22111b3ac4294652`, detached at docs base `557ea3bccc4aa75916b5ff5dd71ff2f1acdda777` (clean before the work) |
| Fixed revision | requested `5cd63ff` → resolved `5cd63ff652f02a2c726187fe12cbc796218d31c0`, tree `404bf819a42e20b3e4d372c18a981832ccd54954` (L1 of both logs) |
| Product-tree equality | `git diff --name-only 5cd63ff HEAD -- apps packages package.json pnpm-lock.yaml` is empty (checked before the work; precondition L2 of both logs) |
| Fixed delta | `f359be6..5cd63ff` changes 11 files, all under `packages/xai-web-settings-features-panel/` (precondition L6). Five of them are bundled (`FeaturesPane.tsx`, `internal/featuresPane.tsx`, `internal/featuresRecovery.ts`, `internal/featuresRecoveryCopy.ts`, `styles.css`). Every other bundled archive module is byte-identical to `f359be6`: 555 in the host bundle, 615 in the App bundle, 0 drifted (precondition L7) |
| Authority | `../web-features-recovery-contract/contract.md` §9 (guard, host matrix rows a–n with the row i, m and n step lists, beforeunload), §10 items 2–7, §13 gates 5 and 6, §14 E12 and E13; `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` CP-FEATURES-01 (including the `AccountDataGate` fact and the E11 composition note) and "本轮唯一任务" (batch 28) |
| Browser | `Chrome/154.0.8037.97` (HeadlessChrome, `--headless=new`), protocol 1.3; isolated profile and download directory; viewport 1280×900 at DPR 1 |
| Toolchain | Node `v24.16.0`; esbuild `0.28.1` from the gated tree; react 19.2.0, react-dom 19.2.0, react-router 7.15.1 |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for `XAI_DEPS_ROOT` (the main checkout, read only), `git show 5cd63ff:pnpm-lock.yaml` and the extracted archive (L1 `lockfileSha256`; precondition L3). A consistency check only. |
| Network | Only the local `127.0.0.1` server (ephemeral port) and local Chrome DevTools; every other host resolves to NOTFOUND |
| Diagnostic iterations | `host` 1 of 3 (`fixed1`); `downstream` 1 of 3 (`fixed1`). Development probes are disclosed below. |

## Files and SHA-256

All files are new, under `docs/reviews/web-features-recovery-native/`. Each log's L1 `fileSha256` records its runner, the shared harness, its fixture and the prelude; they equal the committed files.

| File | Lines | SHA-256 |
| --- | --- | --- |
| `verify-native-host.mjs` (E12 runner) | 1303 | `9688043d0c9635ce7e1607393b00fbf1000a6b5fbc1a3be467f3727ba703eba6` |
| `verify-native-downstream.mjs` (E13 runner) | 671 | `82df29615abbc366e31a7cb0f1073395f6a8f8611644b4d6e6c600e1af60be5b` |
| `native-host-harness.mjs` (shared harness: archive, pin + guard, lockfile gate, server, Chrome, log) | 517 | `499fca4c54c2f197ec54cec229859e970ca988da95f7d3b8b87f09456fecf4e4` |
| `native-host-matrix.tsx` (Settings host fixture, E12) | 250 | `819573b03e089c1ffc2cb10119c25019509b3b9f5381e83df03b551738a9c64f` |
| `native-downstream.tsx` (production App fixture, E13) | 146 | `9b77055ea3ad625db957f854988ae9bc4b549b953c5cc667be321d465331cb63` |
| `native-host-prelude.js` (instruments) | 875 | `01acaa5dd43d02cb85d8e8c6cb46b97153f51162e6263e5128cb24251a069675` |
| `native-5cd63ff-fixed1-host.log` | 804 | `f025b831b432df2c31a6c295560d25923705f30e21332eb8e792e023f5c9cb0d` |
| `native-5cd63ff-fixed1-downstream.log` | 371 | `fefe8af14dfec7bb906404a329de3c0ec4bea806c20f9e34eaabe53f9f748fd6` |

## Commands

From the root of this worktree, sequentially, one Chrome session per mode:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
XAI_NATIVE_TMPDIR=<session scratch directory> \
  node docs/reviews/web-features-recovery-native/verify-native-host.mjs 5cd63ff host fixed1
XAI_DEPS_ROOT=... XAI_NATIVE_TMPDIR=... \
  node docs/reviews/web-features-recovery-native/verify-native-downstream.mjs 5cd63ff downstream fixed1
```

Console lines:

- `PASS docs/reviews/web-features-recovery-native/native-5cd63ff-fixed1-host.log checks=750 product=341 deferredFailures=0 exit=0`
- `PASS docs/reviews/web-features-recovery-native/native-5cd63ff-fixed1-downstream.log checks=343 product=140 deferredFailures=0 exit=0`

Exit 0 = harness valid and every check and row gate PASS; 2 = harness valid and a product check or row gate failed; 1 = a precondition failed (harness invalid). Rerunning an existing suffix stops with `Evidence exists; use a distinct suffix` (exit 1) before anything is archived; verified for both modes after the committed runs, and both logs' SHA-256 were unchanged afterwards. Logs are written with `wx`. The temporary archive, profile, download directory and bundle were deleted after each run.

**Development probes (disclosed).** Following the precedent of this directory, I ran development probes with `XAI_NATIVE_EVIDENCE_DIR` set to the session scratch directory (the harness refuses that variable inside the repository). None is committed.
- `host dev1` and `downstream dev1`: both PASS with the same check counts as the committed runs.
- One harness-only correction followed. The record helper let a detail field called `name` overwrite the record kind: the E13 `operation` records and one E12 precondition (whose detail carried the lock name) were mislabelled. The kind is now kept, those two detail fields were renamed (`op`, `lockName`), and row a's record gained a `case` label. No assertion, expectation or scenario changed.
- `host dev2` and `downstream dev2`, run concurrently as a robustness probe: both PASS. Their logs record the same four file hashes as the committed logs.

## Harness

**Compositions**, both bundled from the immutable archive (`@repo/*` pinned to the archive's package exports; a guard fails the build on any module from the `packages/`, `apps/` or `docs/` tree of either checkout):

- **E12: the Settings host composition** (`native-host-matrix.tsx`). This is "actual composition, full Shell" (contract §9) under the production router:
  - the production `Shell` (AppRail, Topbar) in `WebShellProvider`;
  - the rail modules are the production `webShellModuleRegistrations` filtered by the production `useFeaturePrefs` + `filterModulesByFeaturePrefs`, exactly as `App.tsx:179–183` derives them;
  - the production ComposedSettings (`DepartureCoordinator`, `settingsDeparture`, sidebar and detail);
  - React Router's production `createBrowserRouter`, mounted with `RouterProvider` from `react-router/dom` as in `apps/web/src/main.tsx`;
  - the real fixed Features pane, `usePrefAutosaveAsync`, `mutatePref`, registry, codec and `accountScope`, with real `activate`/`lock` transitions on synthetic accounts.

  Module routes (`/app/:moduleId/*`): for the 8 toggleable modules, the production `withDisabledFallback` guard (its real legacy `usePref` reader and the real `DisabledFeatureFallback`) wraps a placeholder module body. Other ids render a placeholder. The real module bodies are mounted only in E13.

  Why not the production App: `AccountDataGate` keys its business subtree by scope kind, account, generation and epoch, so an epoch change unmounts the pane, and row k ("cancels the old intent while fresh device protection remains") cannot occur there. This is the control plane's E11 composition note, and it follows the accepted Sticky host precedent. Sign-out uses the real departure preflight `requestSettingsDeparture("sign-out")` (contract §15 retained exclusion).
- **E13: the production App composition** (`native-downstream.tsx`). It uses the module and stylesheet order of `main.tsx` and the production router instance from `routes/router.tsx` under `RouterProvider`: `ProtectedAppRouteElement` → `App` → `AccountStorageGate` → `AccountDataGate` → `CommandPaletteProvider` → `WebShellProvider` (with the App's own rail filter) + `Shell` + `DesktopPet` + `CommandPalette` → `AppRouteElement` → ComposedSettings or a module route wrapped by the production `withDisabledFallback` (the real Boards module when Boards is on).

  **The only synthetic input is the auth session.** A client whose `auth.getSession` resolves one session for `features-native-A` is served through the real `WebAuthSessionProvider` with the production `invalidateAccountIdentity`. The real `AccountDataGate` activates generation `g1` at every mount (`…:account-data-gate-activated-account` preconditions). The second document of item 7 is a second page target in the same browser profile loading the same production App page; it starts on the product-free seed page, so CDP runtime capture is on before the App loads.

**Instruments** (`native-host-prelude.js`, a classic script served before the bundle and alone on a product-free seed page, where its self-test passes, L9–L10 of both logs). They:
- trace Storage at attempt level: every attempt is logged before any fault decision. Faults: total denial, per-key denial, a **value-specific `setItem` denial** (row i: only the latest value is refused) and one-shot readback denial;
- instrument `window.dispatchEvent` (every `StorageEvent` with its key, contract §10 item 5) and add a first-registered `storage` listener (delivered events, trusted or synthetic);
- trace Web Locks (application vs fixture), with fixture hold/release of the **real** `prefMutationLockName(key)` and a fixture "middle" request queued behind the engine's own request for the same lock name;
- wrap `history.pushState`/`replaceState` (log, then delegate), trace `popstate`, and track `beforeunload` listeners;
- keep a sequence-stamped `console.error` trace and detect an error element (React Router's default or the production `RouteErrorBoundary`);
- trace object URLs and the export anchor, record `window.confirm` calls, refuse every non-local network request, and trace trusted input (click, keydown, drag);
- run armed DOM observers (`<html>` attributes, insertion/removal of the gate screen, `.app`, rail, pet, Settings shell, sidebar, detail and pane), check element identity, and sample every rendered frame with `requestAnimationFrame` (accent hue, background tone, rail position, rail order, pet animation and position, gate, pane);
- provide read-only views of the pane, the departure dialog, the command palette and a synthetic cancelable `beforeunload` (handler storage attempts counted).

The fixtures add archive-backed facts only: the router, its location and commit trace (a commit is a new location key), real lock names, scope transitions, sign-out results and unmount.

**History counters.** `pushState`/`replaceState` count calls to the wrapped methods, `popstate` counts events, and `commits` counts router location-key changes. History-stack integrity is checked from three sources: CDP `Page.getNavigationHistory` entry ids, Navigation API entry keys and ids, and `history.length`.

**Input.** Every activation is a trusted CDP mouse event after a centre hit-test (`input:centre-hit-test:*` preconditions). Escape is a trusted key event. Browser Back and Forward go through `Page.navigateToHistoryEntry`, which is the browser's own traversal, not page script; c11 is one page-script `history.back()`. Programmatic intents use the production router. The real `window.confirm` is answered by plan through `Page.handleJavaScriptDialog`. The AppRail drag uses `Input.setInterceptDrags` + `Input.dispatchDragEvent`.

**Gates.** E12 has a per-row runtime gate: the page's `console.error` trace, the error-element detector and CDP exceptions/console errors since the previous gate, with no gaps. The 46 row gates are recorded without stopping the run, and any failed gate fails the run (L802). Both modes end with `run:runtime-errors-zero` (E12 L803, E13 L370).

## E12 — contract §9 host matrix (Settings host composition): PASS

Counts: 750 checks = 409 preconditions + 341 product checks (including 46 row gates, all PASS). The stack used for row c is P = `/app/settings/date_time` (state `{token:"host-P"}`), S = Features (own key, state `null`), X = `/app/settings/hotkeys` (state `{token:"host-X"}`) (L53). The dialog in every held case is exactly "Unsaved Features draft" / "Features has unsaved changes." with Stay, Export current draft, and Discard local changes and leave. It never shows the "Smart Lists" fallback.

| Row | What ran (all drafts are real failed or held Features operations) | Verdict | Log lines |
| --- | --- | --- | --- |
| a | Trusted, hit-tested sidebar "Hotkeys" with a failed Matrix draft: held, no history mutation, stack unchanged. A second trusted row ("Date & Time") while pending is ignored. Discard-and-leave releases once: 1 commit, 1 `pushState` with the commit's key, 0 `replaceState`, zero writes and removes. | PASS | 336, 338–339, 344, 348–349; gate 351 |
| b | Trusted AppRail "Tasks": held, URL, history, pane and dialog kept. Programmatic `router.navigate("/app/tasks")`: held. AppRail releases also run in m2, n1 and n2. | PASS | 389, 391–394, 400, 402–404; gates 396, 406 |
| c | Back and **guarded Forward**, with `{pathname,key,state}` deep equality:<ul><li>c1 Back + Stay and c4 Forward + Stay: location deep-equals S, stack intact (the forward entry kept), draft kept, 0 push/replace/commit.</li><li>c2 Back and c5 Forward + discard-and-leave: deep-equal P or X, POP release once, zero writes and removes.</li><li>c3 Back and c6 Forward + latest-completion release (the write held behind the real lock completes): deep-equal P or X, exactly one write.</li><li>c7 `navigate(-1)` + discard and c8 `navigate(1)` + Stay.</li><li>c9 Back, c10 Forward and c11 script `history.back()` released by the user's Retry: deep-equal target, exactly one commit and one popstate, 0 push/replace, latest persisted once.</li></ul>Every held state keeps the stack intact (CDP ids and Navigation API keys); every unguarded return remounts Features clean. | PASS | c1 59–62, 66–70; c2 75–78, 82–85; c3 96–103; c4 114–117, 121–125; c5 130–133, 137–140; c6 151–158; c7 167–168, 172–174; c8 183–184, 188–189; c9 201–203, 207–210; c10 221–223, 227–230; c11 240–242, 246–249; returns 89–90, 107–108, 144–145, 162–163, 178–179, 214–215, 234–235, 253–254; gates 72, 87, 105, 127, 142, 160, 176, 191, 212, 232, 251 |
| d | d1 `navigate("../hotkeys", {relative:"path", state:{token:"host-d1"}})` held with no history mutation; Retry releases one PUSH commit with that state and one `pushState` whose `usr` is the state. d2 `navigate("../date_time", {…, state:{token:"host-d2"}, replace:true})` + discard-and-leave: one REPLACE commit with that state, one `replaceState` with `usr`, 0 push, history length and index unchanged, zero writes. | PASS | 434, 436, 440–442; 451, 456–459; gates 444, 461 |
| e | Clean sign-out preflight resolves `true` with no dialog. With a failed Tasks draft, sign-out is held (`pending`) and resolves **`false` on Stay**: location and device draft survive, bytes unchanged, 0 history mutation, still warning. Discard resolves `true` with zero writes. | PASS | 466, 470, 472, 476–478, 481, 486–487; gates 480, 489 |
| f | Route vs route: the first wins, one commit to Hotkeys, the second (`date_time`) never pushed. Route vs sign-out: the later sign-out resolves `false` while the route is held, then the route is released. Sign-out vs route: sign-out wins (`true`), the later route is dropped (0 commits). Zero writes in each. | PASS | 493, 498–499; 509, 511, 515; 525, 527, 531; gates 501, 517, 533 |
| g | g1 Stay keeps URL, history, pane and the draft (dialog closed); a fresh intent after Stay prompts again. g2 trusted Escape with focus inside the dialog = Stay. g3 "Export current draft" from the dialog: an actual Chrome download deep-equal to `{"version":1,"kind":"features-draft","changes":{"device":{"matrix":{"operation":"set","value":false}}}}` (103 B, `68d488d7…`). It made zero storage attempts, created one URL and revoked the same one, removed the anchor, and kept URL, history, pane and dialog. A fresh intent after export + Stay prompts again. | PASS | 367–371, 375; 379–384; 411–416; 425, 430–432; gates 378, 386, 418, 433 |
| h | Two failing fields (Boards, Dashboard):<ul><li>offscreen: viewport 1280×420, both recovery blocks scrolled out of view (container `.module-settings`, top −869 and −540); a trusted AppRail intent is still held;</li><li>hidden: page `hidden` behind a foreground tab; a programmatic intent is held and stays held when visible again;</li><li>repairing one field (Retry Boards) keeps holding;</li><li>a newer edit held behind the real Calendar lock keeps holding after the last failure is repaired;</li><li>releasing that lock releases the intent once (1 commit, 1 push).</li></ul> | PASS | 541–542, 545, 547; 553–555; 561; 570; 573–574; gates 549, 557, 563, 572, 576 |
| i | **Same-field ordering**, in two variants: POP (browser Back, Tasks) and PUSH (trusted sidebar, Dashboard). Steps:<ol><li>The predecessor (off) completes with exactly one write while the latest (on) is genuinely held: the latest is queued in the hook, then waits on the real `prefMutationLockName` behind the fixture's middle request.</li><li>Location deep-equal S, dialog open, 0 push/replace/popstate/commit, stack intact, "is saving." shown with no Saved claim.</li><li>The latest fails through the injected value-specific `setItem` fault (`denied-value`). Its read of the predecessor's bytes precedes the set, so it is not a conflict. Still held, 0 history mutations.</li><li>Retry releases **exactly once**: POP gives one commit to P's key, 1 popstate, 0 push/replace, stack intact. PUSH gives one PUSH commit to Hotkeys and exactly one `pushState` with that commit's key, 0 replace, 0 popstate. Dialog closed, latest persisted once.</li></ol> | PASS | POP 259, 262–263, 266, 268–274, 276–278, 283–286; PUSH 296, 299–300, 304, 306–312, 314–316, 321–323; gates 288, 325 |
| j | j1: all 8 fields failed; dialog "Discard local changes and leave" releases once (1 commit, 1 push, 0 replace/popstate) with **zero writes and zero removes on any key**; bytes unchanged; dialog closed; unload listener gone. j2: pane "Discard all changes" during a held intent releases once with zero writes. | PASS | 602, 606, 611–613; 626, 631; gates 615, 633 |
| k | k1 A→B (epoch renewed) cancels the held route intent (dialog closed, 0 commits); the device draft survives and still warns; a fresh intent is guarded; the old intent is never replayed. k2 B→locked: the old sign-out resolves `false`, the draft survives, a fresh sign-out is guarded (Stay `false`). k3 locked→A: the held POP intent is reset with the stack intact; a fresh Back is guarded. | PASS | 738, 742, 744–747, 751, 756; 759, 761–764, 769; 774, 776, 779, 784; gates 758, 771, 786 |
| l | Unmount with a pending sign-out: the sign-out settles `false`; the `beforeunload` listener is removed (active 0, warn `false` with 0 attempts); the coordinator's router wrapper is removed; zero writes and committed bytes kept. Afterwards the sign-out preflight is `true` and a navigation commits normally (1 commit, 1 push). | PASS | 787, 789–795; gate 797 |
| m | **Reset batch release** with `removeItem` faults on Calendar and Habits (6 other keys reset, 0 writes, 0 `key:null`), in two runs. m1 holds a Back departure; m2 holds a trusted AppRail departure to Tasks. In each: Retry Calendar succeeds (one remove) and the departure **keeps holding** with 0 history mutations; Retry Habits releases **exactly once** with zero runtime errors. m1: one POP commit to the previous entry, 1 popstate, 0 push/replace, stack intact. m2: one PUSH commit to `/app/tasks`, exactly one `pushState` with that key, 0 replace/popstate. | PASS | m1 638–645, 648, 650, 654–655, 660–662, 665; m2 671–677, 680, 682, 686–687, 692–694; gates 656, 664, 688, 696 |
| n | **Held target turned off.** n1: a failed Matrix draft holds a trusted AppRail departure to Boards. Turning Boards off commits (one write `false`); the intent keeps holding, and the rail drops Boards. Once all work is clean (Retry Matrix), it releases **exactly once to `/app/board`** (one PUSH commit, one `pushState` to `/app/board`, no retargeting), and the route renders `DisabledFeatureFallback` (`data-feature-id="board"`, "Boards"). n2 (additional): the held write itself turns the target (Habits) off; release once to `/app/habits` and the fallback. | PASS | 704, 706, 709–711, 715–717; 727, 729–731; gates 719, 733 |

**beforeunload** (synthetic cancelable event, with listener tracking):
- It is silent with zero handler storage attempts when the state is source-only (Reload-only alerts for malformed Tasks bytes and a throwing Boards read; zero mount writes; sign-out preflight `true`) and when clean (L30–L34, L43–L44).
- It warns, with exactly one active listener and zero handler storage attempts, whenever set drafts exist (L70, L125, L371, L384, L478, L747, L789).
- It is silent again after discard (L487). Unmount removes the listener (L791).
- Zero `key:null` StorageEvents were dispatched in the whole E12 document (L798).

### History counters for rows c, i and m

Values from the `history-counters` record (host log L801); "held" is the window of the blocked intent, and the second value is the window from the deciding action to the settled result. A blocked POP always shows two popstate events (the browser's traversal and React Router's restoring `history.go`) with 0 commits and 0 push/replace.

| Row / case | Held window (push / replace / popstate / commits) | Decision window (push / replace / popstate / commits) |
| --- | --- | --- |
| c1 Back + Stay | 0 / 0 / 2 / 0 | 0 / 0 / 2 / 0 (window includes the blocked traversal) |
| c2 Back + discard-and-leave | — | 0 / 0 / 3 / 1 (blocked traversal 2 + release 1) |
| c3 Back + latest completion | 0 / 0 / 2 / 0 | 0 / 0 / 1 / 1 |
| c4 Forward + Stay | 0 / 0 / 2 / 0 | 0 / 0 / 2 / 0 (window includes the blocked traversal) |
| c5 Forward + discard-and-leave | — | 0 / 0 / 3 / 1 (blocked traversal 2 + release 1) |
| c6 Forward + latest completion | 0 / 0 / 2 / 0 | 0 / 0 / 1 / 1 |
| c7 `navigate(-1)` + discard | — | 0 / 0 / 1 / 1 |
| c8 `navigate(1)` + Stay | — | 0 / 0 / 0 / 0 |
| c9 Back + Retry | 0 / 0 / 2 / 0 | 0 / 0 / 1 / 1 |
| c10 Forward + Retry | 0 / 0 / 2 / 0 | 0 / 0 / 1 / 1 |
| c11 script `history.back()` + Retry | 0 / 0 / 2 / 0 | 0 / 0 / 1 / 1 |
| i-pop blocked Back / step 2 / step 3 | 0 / 0 / 2 / 0 | step 2: 0 / 0 / 0 / 0; step 3: 0 / 0 / 0 / 0 |
| i-pop step 4 (Retry) | — | 0 / 0 / 1 / 1 (commit to P's key, POP) |
| i-push blocked sidebar / step 2 / step 3 | 0 / 0 / 0 / 0 | step 2: 0 / 0 / 0 / 0; step 3: 0 / 0 / 0 / 0 |
| i-push step 4 (Retry) | — | 1 / 0 / 0 / 1 (PUSH to Hotkeys, the push carries the commit's key) |
| m1 blocked Back / after Retry Calendar | 0 / 0 / 2 / 0 | 0 / 0 / 0 / 0 (still held) |
| m1 after Retry Habits | — | 0 / 0 / 1 / 1 (POP to `/app/settings/date_time`) |
| m2 blocked AppRail / after Retry Calendar | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 (still held) |
| m2 after Retry Habits | — | 1 / 0 / 0 / 1 (PUSH to `/app/tasks`) |

## E13 — contract §10 items 2–7 (production App): PASS

Counts: 343 checks = 203 preconditions + 140 product checks.

**Seeds and baseline:**
- seeds: accent hue `210`, background tone `lavender`, rail position `right`, the production rail ids in reverse order as the stored custom order, pet `pip` at `{x:300,y:200}`, plus `xai_pref_sticky_color` and an unrelated probe key; all 8 Features keys absent;
- displayed (L29): `--accent-hue` 210 (`--accent` `oklch(57% 0.085 210)`), body background `oklch(0.96 0.022 295)`, rail right on `<html>`, `.app` and `.app-rail` (x 1218–1280, grid `2 / 1 / span 2`), the custom rail order, pet `pet-anim-hop` at `translate(300px, 200px)`;
- zero write or remove attempts on the 8 keys at mount (L31).

| §10 item | What ran | Verdict | Log lines |
| --- | --- | --- | --- |
| 2 Rail truth (same tab, no reload) | <ul><li>A committed Boards "off" removes the rail entry (o1).</li><li>A pending toggle held behind the real Calendar lock (o2) and a failed Matrix toggle (o3) leave the rail unchanged.</li><li>A successful Retry (o4) and the released held write (o5) update it.</li><li>A full reset restores all 8 (o8).</li><li>A partial reset with Calendar's removal refused restores only Boards and Habits (o10); Retry Calendar restores it (o11).</li><li>After every operation the rail equals the stored order filtered by the committed bytes, in the same document instance.</li></ul> | PASS | 42, 55, 67, 87, 103, 150, 191, 211; per operation 48, 61, 73, 93, 109, 124, 141, 156, 182, 197, 217, 254 |
| 3 Route truth | <ul><li>Deep link `/app/board` while Boards is stored off: `DisabledFeatureFallback` (`board`, "Boards"), no Boards module, rail without Boards, zero Features writes at mount.</li><li>After an "on" commit, a trusted AppRail click renders the real Boards module (`board-workspaces-module`) in the same document (one PUSH commit).</li></ul> | PASS | 270–273, 283, 286 |
| 4 Search truth | At each palette open (trusted search-box click; closed by Escape), the toggleable modules listed equal those whose committed bytes are not `false`: all 8 (d0); Boards excluded while the held Calendar and failed Matrix stay listed (s1); Matrix gone after its Retry (s2); all 8 after the full reset (s3); Calendar excluded after the partial reset (s4). The same holds in the second document (t1, t2). | PASS | 37, 80, 82, 100, 164, 205, 316, 329 |
| 5 Cross-module isolation | <ul><li>12 operations, each with every instrument armed: toggle commit (o1), held toggle (o2), failed toggle (o3), set Retry (o4), released held write (o5), failed + Discard (o6), Discard all (o7), full reset (o8), three committed toggles (o9), partial reset (o10), reset Retry (o11), Reload of a source-only field (o12).</li><li>In each: 0 `key:null` StorageEvents dispatched or delivered; no account relock or scope transition; no gate screen, no watched removal, the same `.app`, rail, pet, Settings shell, sidebar, detail and pane nodes and the same document instance.</li><li>**Every rendered frame** (499 in total) keeps accent hue, background tone, rail position (`<html>` and `.app-rail`), pet animation and position, and a rail order derived from the stored order.</li><li>Afterwards the computed styles, rail x-geometry and pet position equal the baseline, and the bytes of accent hue, tone, rail position, rail order, pet id and pet position are unchanged (uninstrumented and DevTools).</li><li>Totals (L258–L259): 0 key:null, 0 transitions, 0 gate insertions, 0 removals, 0 replaced nodes, 0 changed frames.</li><li>**AppRail drag after the reset**: a trusted drag (Statistics onto Meditation) persisted `reorder(stored custom order)`, not the default-derived order.</li></ul> | PASS | o1 43–49, o2 56–62, o3 68–74, o4 88–94, o5 104–110, o6 119–125, o7 136–142, o8 151–158, o9 177–183, o10 192–199, o11 212–219, o12 249–256 (7 isolation checks per operation, 8 where the unrelated-key check applies); 258–259; drag 222–227 |
| 6 Unrelated keys | Full reset (o8), partial reset (o10), reset Retry (o11) and Reload (o12): every localStorage key other than the 8 is byte-identical before and after. As an observation, no other key changed in any of the 12 operations. | PASS | 158, 199, 219, 256; `operation` records |
| 7 Two documents | <ul><li>doc2 (a second production App tab on `/app/board`) follows doc1's committed Boards "off" through a trusted, keyed native storage event (`newValue "false"`, never key null): DisabledFeatureFallback, rail without Boards, CmdK without Boards, same doc2 instance.</li><li>It follows doc1's full reset (`newValue null`): the real Boards module, rail and CmdK with Boards.</li><li>Both documents: 0 key:null, no relock, no remount, appearance and rail as at baseline.</li><li>**Preserved conflict**: doc2 holds a failed Boards draft (off, baseline absent) and doc1 commits `false` then `true`. doc2's Retry makes no write and leaves doc1's `true`; "Boards was not saved." and the latest choice stay; a repeated Retry never overwrites; Discard makes zero writes and shows doc1's value.</li></ul> | PASS | 305, 309–311, 316; 321–324, 329; 331–335; 345, 348, 351–352, 356–357, 361, 365–366 |

Per-operation facts (`operation` records):

| Operation | Frames sampled | Attempts on the 8 keys (reads / writes / removes) |
| --- | --- | --- |
| o1 toggle commit (Boards off) | 35 | 4 / 1 / 0 |
| o2 held toggle (Calendar, real lock) | 53 | 0 / 0 / 0 (while held) |
| o3 failed toggle (Matrix) | 42 | 1 / 1 (denied) / 0 |
| o4 Retry (Matrix) | 35 | 4 / 1 / 0 |
| o5 held write released (Calendar) | 31 | 4 / 1 / 0 |
| o6 failed + Discard (Tasks) | 40 | 2 / 1 (denied) / 0 |
| o7 Discard all (Tasks, Pomodoro) | 45 | 4 / 2 (denied) / 0 |
| o8 full reset | 43 | 17 / 0 / 3 |
| o9 three committed toggles | 33 | 12 / 3 / 0 |
| o10 partial reset (Calendar refused) | 43 | 14 / 0 / 3 |
| o11 reset Retry (Calendar) | 35 | 4 / 0 / 1 |
| o12 Reload (Dashboard read fault, then lifted) | 64 | 2 / 0 / 0 |

## Provenance

| Item | E12 host bundle | E13 App bundle |
| --- | --- | --- |
| Bundle inputs | 631 = 561 archive-relative (560 archive files + the virtual `import.meta.env` define) + 69 third-party + the fixture; **0 foreign** | 1012 = 621 archive-relative (620 + the define) + 390 third-party + the fixture; **0 foreign** |
| Guard | 285 pinned `@repo/*` resolutions, **0 violations**, 560 archive modules loaded | 320 pinned, **0 violations**, 620 archive modules loaded |
| Required modules from the archive (SHA-256 in L1) | 28 of 28: host, coordinator, storage engine and hooks, legacy `usePref`, readers `useFeaturePrefs`, `filterModulesByFeaturePrefs`, `withDisabledFallback`, `DisabledFeatureFallback` | 46 of 46: the above plus `App.tsx`, router, route gates, `AppProviders`, `AccountStorageGate`, `AccountDataGate`, `SettingsFooter`, `confirmAction`, AppRail, Shell, Topbar, `DesktopPet`, `CommandPalette`, `readModuleStates`, `buildIndex`, event bus, tokens `apply.ts`, Boards registration, auth `session.tsx` and `guards.tsx` |
| Byte identity with `f359be6` | every bundled archive module outside the fixed delta (555), 0 drifted | every bundled archive module outside the fixed delta (615), 0 drifted |
| Bundle SHA-256 | js `a31d115c…`, css `30daa7b9…` | js `97fb9a30…`, css `7682f7e8…` |
| Network | zero page network attempts; server saw 1 app document (all navigation in-document) | zero page network attempts; server saw 8 app documents (mounts, deep links, doc2) |

## Observations (recorded, not verdicts)

- In the Settings host, the rail filter drops a module the moment its "off" commits (n1 L711). The held AppRail intent keeps its original target and is not retargeted, and the module route then shows the production fallback.
- A held per-key operation makes zero attempts on its key while the lock is held (o2): the engine reads only after acquiring the lock.
- After the AppRail drag (which changes the stored rail order by design), later rail expectations derive from the new stored order (L227–L228). The E13 operations after the drag (o12, route and two-document checks) were judged against that order.
- E12's server log shows 77 favicon requests (one per same-document navigation), all served locally with 204.

## Limitations

- These are the retained contract §15 exclusions: headless Chrome with an isolated profile; synthetic auth session and synthetic accounts; not Tauri; development build without StrictMode; dependency tree reused from the main checkout (the lockfile gate is a consistency check only).
- `beforeunload` is a synthetic cancelable event; the real browser prompt was not exercised.
- Sign-out runs through the direct departure preflight (`requestSettingsDeparture("sign-out")`), as in the accepted Sticky host evidence. The production AvatarMenu sign-out button and the real auth sign-out were not driven.
- E12 ran in the Settings host composition (actual ComposedSettings, full Shell with the production rail filter, production router library), not in the production App, for the reason under Harness. In E12 the module bodies behind `withDisabledFallback` are placeholders, and the DesktopPet is off. E13 covers the production App, the real module route and the pet.
- Same-turn intents (row f), programmatic intents and c11 are script calls by design. The hidden-document case hides the page with a foreground `about:blank` target and focus emulation switched off.
- The second document is a second tab of the same profile running the production App. The hold of a real lock lives in the page that holds it; no cross-document lock contention was exercised here.
- Keyboard checks beyond the Escape of row g and the palette close, visual and responsive presentation, and focus targets are E14/E15 (batch 29). E18–E25 and acceptance are later batches.
