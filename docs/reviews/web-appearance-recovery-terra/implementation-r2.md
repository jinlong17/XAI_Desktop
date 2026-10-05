# Terra run record r2 — CP-APPEARANCE-01, F-APP-1 fix (control-plane batch 47)

**Record only.** This is Terra's record of the bounded repair of real product failure F-APP-1, frozen in batch 46 (`../web-appearance-recovery-native/review-visual-keyboard-24073b5.md`).
- Terra implemented. Terra does not verify or accept its own work, and nothing here is acceptance evidence.
- It closes no 312 item. It changes no frozen oracle, contract, evidence file, ledger or control plane.
- Nothing was pushed, merged, rebased or branched, and no subagent was spawned.

## 1. Identity and inputs

| Item | Value |
| --- | --- |
| Caller and role | CP-APPEARANCE-01, Terra (implementation), batch 47. A new independent Claude Opus 5.5 instance, not the batch 40 Terra instance, and not a verifier. |
| Failure | F-APP-1. The Font scale slider (`AppearancePane.tsx:361`) takes keyboard focus and matches `:focus-visible`, but its computed `outline-style` is `none`. Sources: receipt §3; logs `native-24073b5-fixed1-keyboard-{en,zh}.log`; the control-plane row "真实产品失败 F-APP-1" and `## 本轮唯一任务`. |
| Start point | Detached at `9b76076a5c6f22e81a09f4ddbdf3115d0e637fa7` after `git fetch origin codex/web/full-product-audit-20260908`; `git status` clean. |
| Product baseline | `24073b522262d8b4bec0abfa29347db28adbdd9e`. `git diff --name-only 24073b5 9b76076 -- apps packages package.json pnpm-lock.yaml` was empty. |
| Product commit | `5bbf473872073472188957f430057412e8798131`, parent `9b76076a5c6f22e81a09f4ddbdf3115d0e637fa7`, tree `a33efee5688ae1354521abbd8a82e689247a6768`. Subject `fix(settings): show focus ring on Appearance font scale slider`. |
| Record commit | The commit right after the product commit. It adds only this file and six `r2-*.log` files, all in this directory. |
| Lockfile | Unchanged. `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`, the contract gate. |
| Worktree | `/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop/.claude/worktrees/agent-a44fa37ea5fea831c` |
| Toolchain | Node `v24.16.0`, pnpm `9.0.0`, vitest `3.2.7`, TypeScript `5.9.2`, Vite `7.3.6`, Chrome `154.0.8037.97` (headless, pre-check only) |

## 2. Setup

| Command (worktree root) | Result |
| --- | --- |
| `git fetch origin codex/web/full-product-audit-20260908` | Fetched to `FETCH_HEAD`. |
| `git checkout --detach 9b76076a5c6f22e81a09f4ddbdf3115d0e637fa7` | `HEAD is now at 9b76076`; `git status` clean. |
| `git diff --name-only 24073b5 HEAD -- apps packages package.json pnpm-lock.yaml` | Empty. `24073b5` is an ancestor of `9b76076`. |
| `pnpm install --frozen-lockfile --offline` | **Exit 0.** `Lockfile is up to date, resolution step is skipped`; 599 packages, 0 downloaded; `Done in 7.8s`. Afterwards `git status` was still clean and the lockfile hash unchanged. The log stayed in the session scratchpad. |
| `pnpm --filter @repo/plugin-web-settings-appearance run test` at `9b76076`, before any change | **Exit 0.** 9 files, 126 tests, the same as r1 at `24073b5`. Log: `r2-baseline-appearance-test.log`. |

## 3. Root cause (re-read at the fixed product, not changed)

- **The losing ring.** `packages/plugin-web-tokens/src/tokens.css:246–253` sets the global ring through `button:focus-visible, input:focus-visible, …`: `outline: 2px solid color-mix(in oklch, var(--accent) 58%, transparent); outline-offset: 2px`. For this element the matching selector is `input:focus-visible`, at specificity (0,1,1).
- **The winning rule.** `packages/plugin-web-tokens/src/layout.css:1353–1360` sets `.slider-row input[type="range"] { …; outline: none; }`, at (0,2,1). It wins, so the computed outline style is `none`. Chrome reports it as `none`, `3px`, `oklch(0.21 0.012 230)`.
- **Nothing else competes.** A search of every `.css` file under `apps` and `packages` found:
  - no other rule that sets this element's outline;
  - no `@layer` anywhere;
  - one `outline … !important`, which is `.med-focus-clock .frameless` in the meditation package and cannot match.
- **Only one slider is affected.** In product markup, `slider-row` appears only at `AppearancePane.tsx:361`. The hue slider sits in `.accent-slider-row` and already shows the global ring.
- **No clipping.** None of the slider's wrappers sets `overflow`: `.setting-row` in tokens and in the settings shell, `.sr-ctrl`, `.slider-row`. A ring drawn 4 px outside the track is therefore not cut off; §7 confirms this by pixels.

So the fix fits inside `packages/xai-web-settings-appearance/src/styles.css`. No tokens change is needed, and the stop condition did not apply.

## 4. The change (product commit `5bbf473`)

### 4.1 `packages/xai-web-settings-appearance/src/styles.css`: append only

These 9 lines were appended after the former last line 510, the `}` that closes `@media (max-width: 767px)`. The first appended line is blank.

```css

/* F-APP-1: the Font scale slider showed no keyboard focus. The shared
   `.slider-row input[type="range"] { outline: none }` in plugin-web-tokens
   layout.css (0,2,1) outranks the global `input:focus-visible` ring in
   tokens.css (0,1,1); this pane-scoped rule (0,4,1) restores that same ring. */
.appearance-pane .slider-row input[type="range"]:focus-visible {
  outline: 2px solid color-mix(in oklch, var(--accent) 58%, transparent);
  outline-offset: 2px;
}
```

- **Specificity: (0,4,1).** `.appearance-pane`, `.slider-row`, `[type="range"]` and `:focus-visible` count 4 in the second place; `input` counts 1 in the third. That exceeds both (0,2,1) and (0,1,1). The rule wins wherever the bundler places the Appearance stylesheet (receipt §12 item 2 notes that its position moved).
- **Declarations.** They are byte-identical to `tokens.css:251–252`.
- **Scope.** The rule is top level, inside no at-rule, and scoped under `.appearance-pane`. It applies only while the slider is `:focus-visible`. An outline takes no layout space and does not change hit-testing.
- **Byte proof.**
  - The first 12,491 bytes of the new file hash to `c3d3393d48b98b61aa4f218d4eec7ff61ed56b5ab2961961e368f3d24ba192bf`, which is the whole file at `24073b5`.
  - 465 bytes were appended. The new file is 12,956 bytes and 519 lines; SHA-256 `2a417677e2160ccc57cde0079dd1bcf41c6b59e3375eb200b23958b00ade081a`, blob `3d7833c`.
  - `git diff --numstat`: `9 0`.

### 4.2 Optional test: `src/__tests__/AppearancePane.focus-ring.test.tsx` (new, 169 lines)

SHA-256 `caea5da64db325d3d0e7484ec9ce1a527cf6a061fe3d45bda379146172d708a5`, blob `b6072bc`.
- **Inputs.** It reads `../styles.css`, and reads the protected `plugin-web-tokens/src/layout.css` and `tokens.css` (read only).
- **Parsing.** A small parser for flat stylesheets throws on unbalanced braces.
- **Specificity.** A counter throws on functional pseudo-classes, so a change to `:where()` or `:is()` fails loudly instead of being miscounted.

| # | Test | Asserts |
| --- | --- | --- |
| 1 | `styles.css has one top-level rule for the focused Font scale slider that declares only the ring` | Exactly one rule has that selector. It is not part of a selector list, sits inside no at-rule, and declares exactly `outline` and `outline-offset` with the values above. |
| 2 | `the ring equals the global input:focus-visible ring in tokens.css` | The single top-level tokens rule that lists `input:focus-visible` declares the same two values. |
| 3 | `its selector outranks every layout.css rule that sets the outline of the range input in .slider-row` | The root-cause rule is found, with `outline: none`. The calculator gives (0,2,1) and (0,1,1) on the two known selectors and (0,4,1) on ours, which beats every such layout.css selector. None of their outline declarations is `!important`. |
| 4 | `without :focus-visible the selector reaches exactly the Font scale slider` | The jsdom-rendered pane has 2 range inputs. The selector without `:focus-visible` matches exactly one of them, `aria-label="Font scale"`. |

**Why it is meaningful.** The test fails if the rule is:
- removed;
- wrapped in an at-rule;
- weakened, for example with `:where()`;
- drifted away from the global ring;
- orphaned by a markup change.

**Its limit.** jsdom computes no cascade and cannot judge `:focus-visible` or whether a ring is visible. The native E14–E15 rerun is that oracle.

**Red before green.**
- **Setup.** The new test was present, and the stylesheet was temporarily set back to its `24073b5` bytes (`c3d3393d…`).
- **Result.** The test file failed in test 1 only (`expected [] to have a length of 1 but got +0`): 1 failed, 3 passed, exit 1. Log: `r2-negative-control-focus-ring-test.log`, at HEAD `9b76076`, before the test file was committed.
- **Restore.** The stylesheet was then restored and re-hashed (`2a417677…`) before the commit.

## 5. Product diff against `24073b5`

`git diff --name-only 24073b5 5bbf473 -- apps packages package.json pnpm-lock.yaml` lists exactly the two allowed files:

| + | − | File |
| ---: | ---: | --- |
| 169 | 0 | `packages/xai-web-settings-appearance/src/__tests__/AppearancePane.focus-ring.test.tsx` (new) |
| 9 | 0 | `packages/xai-web-settings-appearance/src/styles.css` (append) |

`git diff-tree -r 5bbf473` lists the same two paths and nothing else.
- Untouched: tokens, contract, evidence, ledgers, control plane, `package.json` files and the lockfile.
- There is no runtime JS or TS source change.

## 6. Self-checks at the product commit `5bbf473` (raw logs in this directory)

All four ran from the worktree root, with a clean tree at `HEAD = 5bbf473`.

| Command | Exit | Result | Log (SHA-256) |
| --- | --- | --- | --- |
| `pnpm --filter @repo/plugin-web-settings-appearance run test` | 0 | 10 files, 130 tests passed: the 126 earlier tests plus 4 new (`AppearancePane.focus-ring.test.tsx (4 tests)`). Stderr is unchanged from r1: 9 blocks, all pre-existing, all from `appearanceDefaults.test.ts`. | `r2-appearance-test.log` (`4e2ee96b4924c207c916151f2cb647d838ff8a391d71f409e36e44d31b855ffa`) |
| `pnpm --filter @repo/plugin-web-settings-appearance run typecheck` (`tsc --noEmit`) | 0 | No diagnostics. | `r2-appearance-typecheck.log` (`9ece7f20a510ce7a7f8700ed828ad14455b0270c6664ae3bfa4cf9b849a47e0a`) |
| `pnpm --filter @repo/plugin-web-settings-appearance run lint` (`eslint --max-warnings 0 .`) | 0 | 0 warnings. | `r2-appearance-lint.log` (`f416e8cdc0fa11d356fc7b28f03331f5a219bee530d449926b1c7915c3f65f7e`) |
| `pnpm --filter @repo/web run test` | 0 | 29 files, 178 tests passed, the same as r1. | `r2-web-test.log` (`d78ba934ac9b0b70b55e20ed562b729cc7c42c80f97b273130031923599272de`) |

**Supporting logs:**
- `r2-baseline-appearance-test.log` (`f9a2e8ed14af3de637f1c508e1f4d7f11b93b7b59602d998f47f7a53e71882eb`): 9 files and 126 tests at `9b76076` (§2);
- `r2-negative-control-focus-ring-test.log` (`f34be4b2a7a1957f74ac94b17cc39c096eb3ab20ad7888ac1f7e7cfa31d46145`): the red run (§4.2).

**Dry runs.** The same four commands also ran on the same content before the commit, with the same results. Those logs stayed in the scratchpad; the table above supersedes them.

## 7. Native pre-check (optional; disclosure only, logs and PNGs not committed)

**Setup.**
- **Server.** The worktree's own Vite dev server, started from `apps/web` with `VITE_WEB_AUTH_MODE=mock-authenticated pnpm exec vite --port 51819 --strictPort --host 127.0.0.1`.
  - This is the app's documented local verification mode. It needs no credentials and no account.
  - `curl` confirmed that it served the worktree's `styles.css`, including the new rule.
  - It was stopped afterwards, and no listener remained.
- **Browser.** Headless Chrome 154.0.8037.97 over the pipe transport, with a flattened session.
  - The profile was an isolated temporary one in the scratchpad, removed afterwards.
  - `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`.
  - deviceScaleFactor 1, focus emulation on.
- **Harness.** A scratch script that mirrors the batch 46 runner's focus-visibility procedure. The frozen runner could not be used: its `baseline:fixed-delta-is-exactly-the-24-terra-files` gate refuses any SHA other than `24073b5`, and evidence files must not be edited.

**Procedure.** For each slider (the hue slider is the positive control):
1. A trusted click, hit-tested at the centre, on a non-focusable anchor. For the Font scale slider this is the row label; for the hue slider, the accent preview dot. Clicks use CDP `Input.dispatchMouseEvent`.
2. One trusted Tab: `Input.dispatchKeyEvent` with `rawKeyDown` and `keyUp`, `key` and `code` `Tab`, `windowsVirtualKeyCode` 9, and **no `nativeVirtualKeyCode`** (K-1).
3. A clip around the focused control with a 10 px margin. The clip was converted to page coordinates, because at 1024×768 the window had scrolled by 26 and 136 px.
4. One more trusted Tab. Focus moved on to Retry all, or to the Sage tone card after the hue slider. The control's fractional offsets did not change.
5. The same control-relative clip again, then a SHA-256 comparison of the two PNGs.

A capture-phase key trace had to equal exactly the presses, all trusted.

**Script actions (disclosed).**
- `scrollIntoView` on each anchor.
- `visibility: hidden` on the DesktopPet root `.pet-wrap`, so no animation can enter a clip. The frozen runner used the product's rail toggle instead.
- A read-only scan of `document.styleSheets` for the new selector.

These were trusted clicks on the product's own controls:
- the demo data gate ("Start without importing", then "Continue to workspace");
- the switch to 简体中文.

**Results.** The Font scale columns refer to the Font scale slider. "Moved on" is the same clip after focus left the control.

| Run | Viewport | Stylesheet | Rule served | Font scale `:focus-visible` | Font scale computed outline | Font scale clip, focused vs. moved on | Hue (positive control) | Key trace | Errors / warnings |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fixed-en | 1024×768 | fixed (`2a417677…`) | 1 | true | `solid 2px oklch(0.57 0.085 165 / 0.58)`, offset 2px | **differ**: 173×24, `360c333c…` vs `6ad3f2c8…` | solid 2px; differ | 8 of 8 trusted | 0 / 0 |
| fixed-zh | 375×812, mobile | fixed | 1 | true | the same | **differ**: 222×24, `4d2f08ad…` vs `31dd04a8…` | solid 2px; differ | 8 of 8 trusted | 0 / 0 |
| prefix-en (negative control) | 1024×768 | `24073b5` bytes (`c3d3393d…`) | 0 | true | `none` (`3px`, `oklch(0.21 0.012 230)`) | **identical**: `3a90a477…` both | solid 2px; differ | 8 of 8 trusted | 0 / 0 |
| prefix-zh (negative control) | 375×812, mobile | `24073b5` bytes | 0 | true | `none` | **identical**: `a1343047…` both | solid 2px; differ | 8 of 8 trusted | 0 / 0 |
| fixed-en-2 (after the restore) | 1024×768 | fixed | 1 | true | `solid 2px …` | differ; the same bytes as fixed-en | the same bytes as fixed-en | 8 of 8 trusted | 0 / 0 |

- **The same ring as the global one.** On the fixed product the Font scale ring matches the hue slider's computed ring in style, width, colour and offset, in both languages.
- **The negative controls match the frozen result byte for byte.** The pre-fix Font scale clips hash to `3a90a477…` (EN) and `a1343047…` (ZH), the exact hashes in the receipt (§2, §3). The probe therefore sees what the batch 46 runner saw.
- **Determinism.** The fixed-en rerun repeated every hash.
- **Images reviewed.**
  - The focused rows, EN "Font scale" and ZH "字体大小", show an accent ring around the Font scale track, like the ring around the hue track.
  - The moved-on clip shows the plain grey track.
- **Network.** Each run made 652 requests. Each had 1 non-local attempt, the Google Fonts stylesheet linked from `apps/web/index.html`, which resolved to NOTFOUND. The frozen runner served its own HTML, so it had no such link. There were no dialogs.

**Not evidence.** Vite dev mode with the mock-authenticated demo scope is not the batch 45/46 production-App fixture bundle. Only the batch 48 E14–E15 rerun on this SHA counts.

## 8. Isolation of the main checkout

Nothing was installed into, written to or served from the main checkout, and no preview tool was used.

A read-only mtime scan of the main checkout ran after all runs, with the batch 46 scope:
- top level;
- `node_modules` and `apps/web/node_modules` to depth 2;
- `apps` and `packages` to depth 3;
- `docs` to depth 2;
- `.git` and `.claude` excluded.

It examined 3,833 entries and found **0** newer than a marker stamped at 08:03:19 −0700, before the install. The worktree's own commits do write into the shared git object store, which the scan excludes by design.

## 9. Deviations and judgment calls

1. **The optional test checks more than the brief's two assertions.** Beyond "the rule exists with the declarations" and "its specificity exceeds the layout rule", it also checks:
   - equality with the global ring in tokens.css;
   - that the rule sits inside no at-rule;
   - that no competing declaration is `!important`;
   - that the selector reaches the slider in jsdom.

   All of this is in the one allowed file, and it only reads the tokens files.
2. **The test is coupled to the root cause, by design.** Test 3 requires the layout.css `outline: none` rule to exist, so the comparison cannot pass vacuously. If the tokens and a11y follow-up removes that rule, the test fails and points to revisiting the pane rule in that change.
3. **The package docs are not updated.** `packages/xai-web-settings-appearance/docs/test.md` does not list the new test file, because this batch allows only `styles.css` and the test in the product diff. This is left to the controller.
4. **The logs use an `r2-` prefix**, so no r1 file in this directory is overwritten (new files only). Two logs beyond the four self-checks are committed (§6), because the product commit message cites them.
5. **The working tree was temporarily swapped**, for the unit negative control before the product commit and for the native negative controls after it. Each time, `styles.css` was set to its `24073b5` bytes and then restored. Each restore was checked by SHA-256 (`2a417677…`), and `git status` then showed no product change.
6. **The pre-check harness was a scratch script, not the frozen runner** (§7). The differences are listed there.

## 10. Notes for the controller

- **Next step per the control plane:** batch 48, E14–E15 on `5bbf473` with new suffixes. The frozen runner hard-codes the 24-file fixed delta (`EXPECTED_FIXED_DELTA`) and the `24073b5` labels, so a run on the new SHA needs the controller's handling.
- **For the delta audit in the final regression:** relative to `24073b5`, the product delta is the 9 appended CSS lines and one test file. No runtime JS or TS source changed.
- **Tokens follow-up (unchanged):** `layout.css` `.slider-row input[type="range"] { outline: none }` remains the root cause, in protected tokens.
