# Terra run record — CP-APPEARANCE-01 (control-plane batch 40)

**Record only.** This is Terra's implementation record for the Settings → Appearance recovery caller under contract r3 (§14 item E6). Terra implemented; Terra does not verify or accept its own work. Nothing here is acceptance evidence, closes a 312 item, or changes a frozen oracle, the contract, a ledger or the control plane.

## 1. Identity and inputs

| Item | Value |
| --- | --- |
| Caller / role | CP-APPEARANCE-01, Terra (implementation), batch 40 |
| Contract | `docs/reviews/web-appearance-recovery-contract/contract.md` r3, last commit `706c9a3186e27d80f7c05f065981f111cf80e3a7`, SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d` (verified before any work, and again at the end) |
| Start point | detached at `94f8cf81d748805470ed22e3a0bf1c10eb9f5b52` after `git fetch origin codex/web/full-product-audit-20260908`; `git status` clean |
| Product baseline | `5cd63ff652f02a2c726187fe12cbc796218d31c0`; `git diff --name-only 5cd63ff 94f8cf8 -- apps packages package.json pnpm-lock.yaml` was empty |
| Product commit | `24073b522262d8b4bec0abfa29347db28adbdd9e`, parent `94f8cf81d748805470ed22e3a0bf1c10eb9f5b52`, tree `95b4aaff59927eee82248a6133e357e9c70e04ec`, subject `fix(settings): recover Appearance preferences with Retry all` |
| Record commit | the commit immediately after the product commit; it adds only this directory |
| Lockfile | unchanged; `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` (the contract gate) |
| Worktree | `/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop/.claude/worktrees/agent-af4a4f142fbb6336f` |

## 2. Setup commands

| Command (worktree root) | Result |
| --- | --- |
| `git fetch origin codex/web/full-product-audit-20260908` | fetched to `FETCH_HEAD` (exit status not separately captured; normal output) |
| `git checkout --detach 94f8cf81d748805470ed22e3a0bf1c10eb9f5b52` | `HEAD is now at 94f8cf8`; `git status`: clean |
| `shasum -a 256 docs/reviews/web-appearance-recovery-contract/contract.md` | `ef1b573c…d90d` (matches the brief) |
| `pnpm install --frozen-lockfile --offline` | first run: 599 packages linked, `Done in 9.6s` (the zsh wrapper printed no `PIPESTATUS`, so the exit status was not captured); rerun at the end: **exit 0**, `Lockfile is up to date, resolution step is skipped` / `Already up to date` |

## 3. Product diff (`git diff --numstat 5cd63ff 24073b5 -- apps packages package.json pnpm-lock.yaml`)

`git diff --name-only 5cd63ff 24073b5 -- apps packages package.json pnpm-lock.yaml` lists exactly the 24 files below, all inside contract §11. No `package.json`, lockfile, config, registry, engine, settings-shell, tokens, router, coordinator or other-caller file is touched.

| + | − | File | §11 slot |
| ---: | ---: | --- | --- |
| 82 | 112 | `apps/web/src/App.tsx` | App |
| 452 | 0 | `apps/web/src/__tests__/App.appearance.test.tsx` (new) | App, new `App.appearance*` test |
| 117 | 112 | `packages/xai-web-settings-appearance/docs/api.md` | Appearance sections |
| 65 | 58 | `packages/xai-web-settings-appearance/docs/test.md` | Appearance sections |
| 215 | 191 | `packages/xai-web-settings-appearance/src/AppearancePane.tsx` | pane |
| 443 | 0 | `packages/xai-web-settings-appearance/src/__tests__/AppearanceController.test.tsx` (new) | new local test |
| 5 | 5 | `packages/xai-web-settings-appearance/src/__tests__/AppearancePane.bilingual.test.tsx` | disposition (AC-I18N-4) |
| 34 | 61 | `packages/xai-web-settings-appearance/src/__tests__/AppearancePane.live-binding.test.tsx` | dispositions (AC-LIVE-*) |
| 4 | 2 | `packages/xai-web-settings-appearance/src/__tests__/AppearancePane.rendering.test.tsx` | dispositions (AC-RENDER-3, -8) |
| 142 | 53 | `packages/xai-web-settings-appearance/src/__tests__/AppearancePane.save-reset.test.tsx` | dispositions (AC-SAVE-*, AC-RESET-*) |
| 605 | 0 | `packages/xai-web-settings-appearance/src/__tests__/AppearanceRetryAll.test.tsx` (new) | required Retry all tests |
| 119 | 0 | `packages/xai-web-settings-appearance/src/__tests__/appearanceLockFixture.ts` (new) | local Web Lock fixture |
| 15 | 0 | `packages/xai-web-settings-appearance/src/index.ts` | additive exports |
| 94 | 0 | `packages/xai-web-settings-appearance/src/internal/AppearanceActions.tsx` (new) | internal 4/4: bottom action area |
| 51 | 0 | `packages/xai-web-settings-appearance/src/internal/AppearanceStatus.tsx` (new) | internal 3/4: Topbar status |
| 660 | 0 | `packages/xai-web-settings-appearance/src/internal/appearanceController.tsx` (new) | internal 1/4: controller |
| 103 | 0 | `packages/xai-web-settings-appearance/src/internal/appearanceRecoveryCopy.ts` (new) | internal 2/4: EN/ZH copy |
| 130 | 0 | `packages/xai-web-settings-appearance/src/styles.css` | additive scoped selectors (the fixed file begins with the before file) |
| 98 | 0 | `packages/xai-web-settings-appearance/src/types.ts` | additive types |
| 22 | 1 | `packages/xai-web-shell/docs/api.md` | Topbar section (§2.3) |
| 2 | 0 | `packages/xai-web-shell/src/Shell.tsx` | pass-through |
| 11 | 29 | `packages/xai-web-shell/src/Topbar.tsx` | setters once, zero Storage, slot |
| 100 | 42 | `packages/xai-web-shell/src/__tests__/Topbar.test.tsx` | dispositions |
| 20 | 0 | `packages/xai-web-shell/src/types.ts` | additive optional `appearanceStatus` |
| **3589** | **666** | 24 files | |

## 4. Self-checks at the product commit (raw logs in this directory)

All nine runs used `HEAD = 24073b5`, the worktree root as cwd, and `FORCE_COLOR=0 NO_COLOR=1`; each log starts with the command, cwd, HEAD and start time and ends with `# exit: <code>`.

| Log | Command | Exit | Result |
| --- | --- | ---: | --- |
| `appearance-test.log` | `pnpm --filter @repo/plugin-web-settings-appearance run test` | 0 | 9 files, **126 passed** / 126 |
| `appearance-typecheck.log` | `pnpm --filter @repo/plugin-web-settings-appearance run typecheck` | 0 | `tsc --noEmit` clean |
| `appearance-lint.log` | `pnpm --filter @repo/plugin-web-settings-appearance run lint` | 0 | `eslint --max-warnings 0` clean |
| `shell-test.log` | `pnpm --filter @repo/xai-web-shell run test` | 0 | 9 files, **115 passed** / 115 |
| `shell-check-types.log` | `pnpm --filter @repo/xai-web-shell run check-types` | 0 | clean |
| `shell-lint.log` | `pnpm --filter @repo/xai-web-shell run lint` | 0 | clean |
| `web-test.log` | `pnpm --filter @repo/web run test` | 0 | 29 files, **178 passed** / 178 |
| `web-check-types.log` | `pnpm --filter @repo/web run check-types` | 0 | clean |
| `web-lint.log` | `pnpm --filter @repo/web run lint` | 0 | clean |

Per-file counts of the touched or new test files: Appearance `AppearancePane.rendering` 8 (8 before), `.bilingual` 4 (4), `.live-binding` 8 (8), `.save-reset` 8 (8), `AppearanceRetryAll` 27 (RA1–RA27), `AppearanceController` 49 (AC1–AC17, AC4 over 33 malformed values); shell `Topbar.test.tsx` 24 (23 before: 15 unchanged, 7 Persist replaced, Quota-Safe moved to APP-AP2, TP-STATUS-1/2 added); web `App.appearance.test.tsx` 22 (APP-AP1–AP12 and AP2b, AP9 over 10 values). The `stderr` lines in the logs come from unchanged tests (`appearanceDefaults` storage refusals, shell rail-order warnings, `build-manifest` skip notices without a `dist/`).

## 5. Implementation map

Paths: `AC` = `packages/xai-web-settings-appearance/src/internal/appearanceController.tsx`, `AA` = `…/internal/AppearanceActions.tsx`, `AS` = `…/internal/AppearanceStatus.tsx`, `RC` = `…/internal/appearanceRecoveryCopy.ts`, `AP` = `…/src/AppearancePane.tsx`, `CSS` = `…/src/styles.css`, `TB` = `packages/xai-web-shell/src/Topbar.tsx`, `APP` = `apps/web/src/App.tsx`.

- **A2.1 Labels.** `RC:61` / `RC:89` (`Retry all` / `全部重试`) rendered unchanged in every state (`AA:63`); `aria-describedby` only while enabled or a pass is open (`AA:48`, `AA:60`); the line is non-empty then (status rules `AC:572–576`). No "Save & apply", "Saved" or "已保存" exists in the pane (the shared footer is no longer mounted).
- **A2.2 Visibility and enabled state.** Always rendered native `<button type="button">` (`AA:55–64`); enabled iff E is non-empty (`AC:565`, `AC:630`), else `aria-disabled="true"` and never `disabled` (`AA:59`); activation always delegates and E is derived live, so a disabled activation is inert (`AC:371–375`). Disabled look: one rule set of colours and cursor only, neutral tokens (`CSS:469–474`); same box as the enabled `.btn.primary` through a transparent 1 px border (`CSS:462–464`) and the 44×44 minimum (`CSS:451–458`); `pointer-events` and the global focus ring untouched.
- **A2.3 Scope and attempts.** E = `canRetry` (`AC:179–186`): an actual draft, no retry in flight, and either a settled failure of a set draft or the engine's rendered failure for this draft (`failedShown`, `AC:169–172`, rendered `meta` newer than the draft's `admittedMeta`); a reset draft is eligible only while the engine holds its failed request, so its Retry is always a removal. `retryAll` (`AC:371–387`) creates a pass and calls `startRetry` (`AC:294–310`) once per member in display order (`AC:58–60`) before any settlement; `startRetry` calls `binding.retry()` exactly once, which re-runs the engine's held failed request with its own kind and token (`usePrefAsync.ts:262–276`); only a set draft whose own request already settled can reach the engine's set path (`:278`), which re-writes that draft's displayed value. A member queued behind a failed predecessor is settled through `settlePredecessor` (`AC:248–255`), so the predecessor's result never acknowledges the newer draft and the latest proceeds as its own attempt. `retryActive` makes repeats, a second activation and a per-field Retry inert (`AC:182`). No storage, `StorageEvent`, event bus, lock or rebase path exists in the controller.
- **Attribution and late completions.** Exact-draft identity: `admit` (`AC:258–271`) supersedes the previous draft as `gone`; `settle` (`AC:231–247`) ignores any completion whose draft is no longer the field's draft or after disposal; member outcomes via `resolveMember` (`AC:207–215`); `detach` (`AC:313–325`) for Discard, Discard all and sign-out OK; disposal clears drafts, passes and claims (`AC:579–589`).
- **A2.4 Feedback.** Per-field blocks with saving / resetting / not saved / not reset / unavailable messages and Retry + Discard, or Reload only (`AP:417–450`, copy `RC:46–99`). Status line precedence: retrying > export failed while a draft exists > count > success > empty (`AC:572–576`, text `AA:34–43`, element `AA:51–53`); success only via `closePass` (`AC:188–204`) or `recordSuccess` (`AC:218–229`) while a pane is mounted (`attachPane`, `AC:478–486`, `AP:94`), nothing is pending, failed or source-invalid (`quiet`, `AC:568–571`); "Defaults restored." only for the current reset batch.
- **A2.5 Focus.** No programmatic focus move on activation or on enabled/disabled transitions (the button never unmounts or becomes unfocusable). Focus moves only away from unmounting elements: a recovery block that unmounts while focused hands focus to the field's selected control (`AP:421–426`, `AP:98–108` with `data-appearance-control` targets); Discard and Reload focus the field (`AP:110–117`); Discard all focuses Reset (`AP:118–121`).
- **A2.6 Interactions.** Per-field Retry and Retry all share `startRetry`; Discard during a pass detaches one member; Discard all closes the pass (`AC:363–370`); an accepted Reset during a pass supersedes its six fields' members and leaves a language member (`AC:425–462`); declined Reset makes zero attempts (`AC:426–433`); the Topbar status reads the same E (`AS:22`); `beforeunload` follows drafts (`AC:614–623`); the sign-out step detaches members on OK (`AC:463–477`).
- **A2.7 Accessibility.** Native button, Tab stop in DOM order in every state; ≥ 44×44 sized to content (`CSS:451–458`); EN/ZH copy in the displayed language; name equals label.
- **A2.8 Placement.** Pane-local block at the end of `.appearance-pane` (`AP:380–386`): status line, then Retry all first at the inline start, Export and Discard all (only while drafts exist), then Reset on its own line (`AA:50–92`); normal flow, start-aligned, wrapping, no `.pane-footer`/`.pane-save` class (`CSS:422–447`).
- **A2.9 Vehicle.** Pane-local component `AA`; eligibility, passes, attribution and status in the App-scoped controller `AC`; `SettingsFooter`, `confirmAction` and `resetAllPrefs` untouched.
- **A3 One App-scoped controller.** `useAppearanceController` (`AC:512–650`) owns the seven bindings (`AC:514–521`), the operation and recovery model (`AC:161–488`), DOM application and the system-theme listener (`AC:592–611`), the unload warning (`AC:614–623`) and the sign-out step (`AC:463–477`); `AppearanceProvider` (`AC:655–660`). App creates it once in `AppInner`, which renders inside `AccountStorageGate` (`APP:127–128`, `APP:236–240`), provides it (`APP:187`, `APP:222`), feeds `lang`/`theme`/`density`/`railPos` to `WebShellProvider`, Shell and DesktopPet (`APP:188–214`) and its edits to the Topbar setters (`APP:201–205`). A standalone pane owns its own controller (`AP:46–57`). The pane emits nothing and App subscribes to nothing.
- **A4 Root keys.** `usePrefAutosaveAsync("lang" | "theme" | "density" | "font_scale", { codec: "json", defaultValue, validate })` (`AC:91–94`, `AC:514–516`, `AC:521`); registered keys `xai_accent_hue`, `xai_bg_tone`, `xai_rail_pos` with strict caller validators (`AC:96–98`, `AC:517–520`). No registry, ownership, codec or lifecycle change.
- **A5 Protection.** No route guard is registered anywhere. Topbar status `AS:20–51` through the shell slot (`TB:116`, `Shell.tsx:84`, `xai-web-shell/src/types.ts:131`, `:205`) with the review callback (`APP:132–136`, `APP:208`); `beforeunload` (`AC:614–623`); sign-out step awaited immediately before both `requestSettingsDeparture("sign-out")` calls (`APP:154`, `APP:161`, `APP:171`).
- **A6 Strict domains.** Validators (`AC:67–88`); display falls back to the default for invalid stored values (`displayValue`, `AC:490–493`); invalid/unavailable sources render the Reload-only alert (`AC:553–564`, `AP:434–437`); nothing is rewritten; a valid edit over them is refused by the engine and kept as a failed draft.
- **A7 Reset.** Pane-local Reset (`AA:81–91`) with the truthful confirm (`AP:122–124`, `RC:67–68`, `RC:95`); six reset intents and one batch identity admitted synchronously (`AC:444–461`); `xai_pref_lang` never touched (`AC:62`); a duplicate Reset while pending enqueues no duplicate removal (`AC:435–443`).
- **Topbar (shell).** `TB:82–84` call each setter once with the option's value and make no Storage attempt; `persistAndSet` is removed.
- **Rulings 3 and 4.** Ruling 3: display values come only from the strict bindings and are applied in layout effects, with no DOM mirrors (`AC:542–550`, `AC:592–597`); jsdom AC1 and APP-AP1; a native spot check (§10) showed the pane, the Topbar summary and `<html>` agreeing after a fresh load. Ruling 4: the review callback performs one `navigate` (`APP:135`) and the controller never touches the router; the F1 `appearance` pre-check reports `releases=1`, one `router.navigate`, zero duplicate `proceed()` and zero non-live blocker calls (§7).

## 6. Test dispositions applied (§11)

| Existing tests | Applied |
| --- | --- |
| AC-RENDER-1, -2, -4–7; AC-I18N-1–3; AC-DEF-1–9; AC-CONST-*; AC-REG-1–4; Topbar TP0–TP7, TB-PREMIUM-1 | unchanged |
| AC-RENDER-3, -8 | seed `xai_pref_theme` = `"dark"` / `xai_pref_font_scale` = `1.1`; same assertions |
| AC-LIVE-1, -2, -7 | DOM assertions kept; lock fixture; real completion awaited; emission assertions dropped |
| AC-LIVE-3–6 | byte assertions after real completion; emission assertions dropped |
| AC-LIVE-8 | replaced: 简体中文 persists `"zh"`, selected, no `data-lang` |
| AC-SAVE-1, -2 | replaced by Retry all tests (disabled with `aria-disabled`, no "Save & apply"/"Saved", zero attempts; enabled for a failed field, exactly one re-attempt, no Saved claim before a genuine latest success) |
| AC-RESET-1–6, AC-I18N-4 | adapted to the pane-local Reset (role/name "Reset to defaults", 恢复默认), counting injector for the declined case |
| Topbar TP1-Persist … TP3b-Persist (7) | replaced: setter once, zero Storage attempts (per-test counting wrapper) |
| Topbar TP-Persist-Quota-Safe | replaced by APP-AP2 (App level) |
| New required Retry all tests | `AppearanceRetryAll.test.tsx` RA1–RA27 with the real engine, the exclusive Web Lock fixture and attempt-logging Storage spies |

## 7. Frozen-runner pre-checks (disclosure)

Run from the worktree root with `XAI_DEPS_ROOT=<worktree>` (lockfile gate passed in every run). Frozen runner, fixture and oracle files were never edited. `<scratch>` is the session scratchpad outside the repository.

Commands and exit codes:

| Suffix | Command | Exit |
| --- | --- | ---: |
| `terrapre1` | `XAI_DEPS_ROOT=<worktree> timeout 900 node docs/reviews/web-appearance-recovery-sol/verify-fixed.mjs 7be576163fcabb94ecfda661ef9b418b6a00685a <mode> terrapre1`, once per mode `bytes`, `fields`, `reset`, `queues`, `continuity-export`, `host`, `retry-all` | 0 each, except `continuity-export` 1 |
| `terrapre1` | `XAI_DEPS_ROOT=<worktree> timeout 900 node docs/reviews/web-appearance-recovery-independent/verify-fixed.mjs 7be5761… host terrapre1` | 0 |
| `terrapre1` | `XAI_DEPS_ROOT=<worktree> XAI_F1_EVIDENCE_DIR=<scratch>/f1-evidence XAI_NATIVE_TMPDIR=<scratch>/native-tmp timeout 1200 node docs/reviews/web-appearance-recovery-f1/verify-f1-appearance.mjs 7be5761… appearance terrapre1` | 1 (harness invalid) |
| `terrapre2` | `XAI_DEPS_ROOT=<worktree> node docs/reviews/web-appearance-recovery-sol/verify-fixed.mjs 24073b522262d8b4bec0abfa29347db28adbdd9e all terrapre2` (the eight §12 modes) | 1 (`continuity-export`) |
| `terrapre2` | `XAI_DEPS_ROOT=<worktree> node docs/reviews/web-appearance-recovery-independent/verify-fixed.mjs 24073b5… host terrapre2` | 0 |
| `terrapre2` | `XAI_DEPS_ROOT=<worktree> XAI_F1_EVIDENCE_DIR=<scratch>/terra-precheck2/f1 XAI_NATIVE_TMPDIR=<scratch>/terra-precheck2/native-tmp node docs/reviews/web-appearance-recovery-f1/verify-f1-appearance.mjs 24073b5… selfcheck terrapre2`, then the same with `appearance` | 0, 0 |

**7.1 `terrapre1` — unreferenced candidate commit object `7be576163fcabb94ecfda661ef9b418b6a00685a`** (tree `43de144d…`, parent `94f8cf8`, created with a temporary `GIT_INDEX_FILE` + `git write-tree` + `git commit-tree`; never on a branch). Its product tree preceded the final test, doc and small source/CSS edits (`git diff --stat 7be5761 24073b5 -- apps packages`: 16 files), so these results are superseded by 7.2.

| Runner / mode | Outcome |
| --- | --- |
| Sol `bytes` / `fields` / `reset` / `queues` | PASS 65/65, 89/89, 34/34, 56/56 |
| Sol `continuity-export` | harness PASS, **24/26** (cases 006, 007 failed — see §9) |
| Sol `host` / `retry-all` | PASS 33/33, 48/48 |
| Sol `original` | not run |
| Parent host | PASS 33/33 |
| F1 `appearance` | HARNESS-FAIL `PRECONDITION: baseline:docs-head-product-tree-equals-revision` (HEAD was not the candidate); no product case ran |

**7.2 `terrapre2` — product commit `24073b5`** (2026-10-05, 07:39–07:43 UTC):

| Runner / mode | Outcome |
| --- | --- |
| Sol `bytes` | harness PASS, 65/65 |
| Sol `fields` | harness PASS, 89/89 |
| Sol `reset` | harness PASS, 34/34 |
| Sol `queues` | harness PASS, 56/56 |
| Sol `continuity-export` | harness PASS, **24/26**, exit 1: case 006 and case 007 failed (§9) |
| Sol `host` | harness PASS, 33/33 |
| Sol `retry-all` | harness PASS, 48/48 |
| Sol `original` | harness PASS, 174/174 |
| Parent host (`web-appearance-recovery-independent`) | vitest exit 0, harness PASS, 33/33 |
| F1 `selfcheck` | `verdict=harness-valid`, checks=134, exit 0 |
| F1 `appearance` | `verdict=fixed-pass`, checks=122, exit 0; a1–a4 `fixed-pass`; every case zero duplicate `proceed()`, zero non-live blocker calls, zero invalid-transition throws, zero runtime errors; a1 one release with one `router.navigate` |

**7.3 Log handling.** The Sol and parent runners write `<mode>-<suffix>-<revision>.log` beside themselves inside the frozen directories; the logs were moved out to the session scratchpad after each runner invocation, so those directories were byte-identical to `HEAD` again before any commit (`git status` and `git diff HEAD -- docs/reviews` show only this directory). In `terrapre1` the Sol `host` and parent `host` logs share one file name and the second move overwrote the first in the scratchpad; both had printed `33/33` on the console before the move (the `terrapre2` logs were kept in separate folders). F1 logs went straight outside the repository through `XAI_F1_EVIDENCE_DIR`, with Chrome profiles under `XAI_NATIVE_TMPDIR`, both in the scratchpad. No pre-check log is committed, and all were deleted before hand-back.

## 8. Deviations and judgment calls

1. **Controller placement.** Created in `AppInner` (inside `AccountStorageGate` → `CommandPaletteProvider`), not in `App()`, so `App()` stays byte-unchanged as §11 requires. A scope change remounts `AppInner` with the committed bytes (REL-09).
2. **Recovery blocks are siblings after each `SettingRow`.** The protected `SettingRow` has no slot; each block renders directly below its row. Each control container gained a `data-appearance-control` attribute for focus targeting.
3. **Disabled Retry all colours.** `--bg-panel-2` background, `--border-1` border, `--text-3` label, `cursor: not-allowed`. `--text-2` was first tried and looked too close to the ghost Reset button; Terra's own dev-server measurement gave 3.79–5.06:1 for `--text-3` (3:1 required) and 7.48–9.26:1 for `--text-2`, light and dark with the six tones. Parent measurement (§9 "Disabled Retry all presentation") remains authoritative.
4. **Base border rule.** `.appearance-pane .appearance-retry-all { border: 1px solid transparent; }` applies in both states so the disabled rule changes colours only and the box never changes.
5. **Topbar status text breakpoint at 767 px.** Contract §5 says the visible text shows "where the Topbar summary is visible (above 760 px)". The summary is actually hidden up to 767 px (`plugin-web-tokens/src/layout.css:1838` at ≤ 760 px and `:2061–2063` in the 641–767 px block), so the status is icon-only (44×44) at `max-width: 767px` and shows the text from 768 px, following the summary.
6. **Phone containment.** `.appearance-pane .bg-tones` uses three columns at ≤ 640 px (H14 a); cards get wider, never narrower.
7. **Topbar test helper.** Storage attempts are counted by a per-test `countStorage()` wrapper restored with `onTestFinished`, so the unchanged Topbar tests run with no added spies.
8. **Keyboard in jsdom.** jsdom does not synthesize Enter/Space → click for buttons, so RA tests model keyboard activation as focus + click; native keyboard proof belongs to E15/E26.
9. **App test environment.** `App.appearance.test.tsx` replaces `AbortController` with Node's own implementation (`transferableAbortController().constructor`) so that react-router's data-router `navigate` can build a `Request` in jsdom; it is restored with `vi.unstubAllGlobals()` after each test. Test-only.
10. **Extra local tests.** `AppearanceController.test.tsx` (A3/A5/A6, export, recovery focus) is added beside the required Retry all tests, under the "new Appearance-local test files" allowance.
11. **Exported types.** `index.ts` adds `AppearanceFieldId`, `AppearanceValues`, `AppearanceFieldState`, `AppearanceStatusLine`, `AppearanceController`, `AppearanceProviderProps` and `AppearanceStatusProps` with the three runtime exports ("with their types"); existing exports are unchanged.

## 9. Open questions for the controller

1. **Sol `continuity-export` case 006** (`continuity-export.test.tsx:180–193`). After the standalone mount, the oracle seeds `xai_rail_pos = top` and `xai_bg_tone = peach` with the native setter (`fixture.tsx:358–362`, no `StorageEvent`), accepts Reset, and expects all three keys absent. The engine's removal compares against the binding's last observed bytes (absent), finds external bytes, and refuses with a conflict, so `rail` stays `top` and `bg` stays `peach` (received `{accent: null, bg: "peach", rail: "top"}`). Contract §6 ("A conflict preserves the external bytes and the reset draft"; "does not rebase") and A2.3 ("A conflict is never overwritten") require that. Passing would take a caller preflight re-read or a forced rebase before the removal, which the contract forbids. Terra did not bend the implementation; the oracle appears to contradict the contract.
2. **Sol `continuity-export` case 007** (`continuity-export.test.tsx:195–221`). The oracle writes accent `295`, then arms a quota fault for the `xai_bg_tone` set only and chooses the Mist tone, then expects `xai_accent_hue` to still be `"295"`. Contract §2 (`:175`) and §5 item 4 (`:521`) make a background choice two intents, the tone and the tone's hue as the accent. The accent write of Mist's hue `230` therefore succeeds (received `"230"`). That is a later legitimate write, not an undo. The oracle appears to contradict the contract.
3. **Topbar status breakpoint** (§8 item 5): please confirm that following the summary's actual visibility (≥ 768 px) satisfies "above 760 px".

## 10. Other disclosures

- **Main-checkout Vite cache.** Early in the session, `preview_start` with the tracked `.claude/launch.json` entry `web-mock-auth` started `pnpm --filter @repo/web dev:mock-auth` in the **main checkout's** `apps/web` (not the worktree). Vite logged `Re-optimizing dependencies because lockfile has changed` at 00:23:46 local time, so it rewrote the main checkout's git-ignored dependency-optimizer cache under `apps/web/node_modules/.vite/`. Terra stopped it with `preview_stop` right after reading its log and ran no checks against it. No tracked file in the main checkout was changed. The browser tab it opened at `http://localhost:3000` was then pointed at the worktree server.
- **Native spot checks (development only).** A worktree dev server (`VITE_WEB_AUTH_MODE=mock-authenticated npx vite --port 3317 --strictPort` in the worktree's `apps/web`, stopped afterwards) was driven in the Browser pane:
  - 375: no horizontal overflow, every new target at least 44×44, Topbar status 44×44 icon-only.
  - 768×1024: the default pet box 660–732 × 916–988 against Retry all at x 113–196. That is 464 px of separation, five hit points on the button, both in view and at the end of the scroll range.
  - 1440: status "Not saved", 112×44, before `.topbar-pref`.
  - Keyboard: a real Tab gives the disabled Retry all a 2 px solid focus ring; Enter and Space are inert and keep focus.
  - Final fresh load with all seven keys seeded: pane, Topbar summary and `<html>` agreed, with no recovery block, no Topbar status, disabled Retry all and an empty status line.

  These runs changed only browser storage for the dev origins `localhost:3317`, plus `localhost:3000` from the tab above. The seven keys seeded in the last check were removed afterwards. These are not acceptance evidence.
- **Object store.** The candidate object `7be5761` (and its tree and blobs) remains unreferenced in the shared object database until normal garbage collection; Terra ran no `gc`/`prune`. The temporary index file lived in the scratchpad.
- No push, merge, rebase, branch, stash or subagent. Nothing was written to the main checkout's tracked files.
