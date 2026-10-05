# Terra run record r3 — CP-APPEARANCE-01, F-APP-2 fix and same-class focus audit (control-plane batch 49)

**Record only.** This is Terra's record of the bounded repair of real product failure F-APP-2, frozen in batch 48 (`../web-appearance-recovery-native/review-visual-keyboard-5bbf473.md`), and of the same-class audit the control plane required first.
- Terra implemented. Terra does not verify or accept its own work, and nothing here is acceptance evidence.
- It closes no 312 item. It changes no frozen oracle, contract, evidence file, ledger or control plane.
- Nothing was pushed, merged, rebased or branched, and no subagent was spawned.

## 1. Identity and inputs

| Item | Value |
| --- | --- |
| Caller and role | CP-APPEARANCE-01, Terra (implementation), batch 49. A new independent Claude Opus 5.5 instance, not the batch 40 or batch 47 Terra instance, and not a verifier. |
| Failure | F-APP-2. The selected accent swatch (`.accent-sw.active`, `AppearancePane.tsx:261`) takes keyboard focus and matches `:focus-visible`, but its outline stays the selection ring `solid 2px var(--text-1)` at offset 2px, so focused and unfocused captures are byte-identical. Sources: receipt §3; logs `native-5bbf473-fixed1-keyboard-{en,zh}.log`; the control-plane rows "真实产品失败 F-APP-2" and "F-APP-1 修复（批次 47）", and `## 本轮唯一任务` (batch 49). |
| Start point | Detached at `6fedfd1d92908c6beaa82e7c0e5dcb2dda876a30` after `git fetch origin codex/web/full-product-audit-20260908`; `git status` clean. |
| Product baseline | `5bbf473872073472188957f430057412e8798131`. `git diff --name-only 5bbf473 6fedfd1 -- apps packages package.json pnpm-lock.yaml` was empty. |
| Product commit | `419e56de9f23e4467fea806fbd4a990e1f429941`, parent `6fedfd1d92908c6beaa82e7c0e5dcb2dda876a30`, tree `7aabbd832be446aeca1441eff34f2fd35945290a`. Subject `fix(settings): show focus on selected Appearance options`. |
| Record commit | The commit right after the product commit. It adds only this file and six `r3-*.log` files, all in this directory. |
| Lockfile | Unchanged. `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`, the contract gate. |
| Worktree | `/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop/.claude/worktrees/agent-a4249842bc08beeb0` |
| Toolchain | Node `v24.16.0`, pnpm `9.0.0`, vitest `3.2.7`, TypeScript `5.9.2`, Vite `7.3.6`, postcss `8.5.15` (static audit), Chrome `154.0.8037.97` (headless, pre-check only) |

## 2. Setup

| Command (worktree root) | Result |
| --- | --- |
| `git fetch origin codex/web/full-product-audit-20260908` | Fetched to `FETCH_HEAD`. |
| `git checkout --detach 6fedfd1d92908c6beaa82e7c0e5dcb2dda876a30` | `HEAD is now at 6fedfd1`; `git status` clean. |
| `git diff --name-only 5bbf473 HEAD -- apps packages package.json pnpm-lock.yaml` | Empty. `5bbf473` is an ancestor of `6fedfd1`. `24073b5..5bbf473` is `styles.css` (+9) and `AppearancePane.focus-ring.test.tsx` (+169) only. |
| `pnpm install --frozen-lockfile --offline` | **Exit 0.** `Lockfile is up to date, resolution step is skipped`; 599 packages, 0 downloaded; `Done in 8s`. Afterwards `git status` was still clean and the lockfile hash unchanged. The log stayed in the session scratchpad. |

No separate baseline test run was made: the product tree at `6fedfd1` equals `5bbf473`, whose Appearance run is `r2-appearance-test.log` (10 files, 130 tests).

## 3. Same-class audit (done first)

### 3.1 Method

Three independent passes, all read only.

1. **Static: every stylesheet the Web app can load, and one more.**
   - Inputs: the 28 tracked CSS files imported from `packages/*/src` and `apps/web/src` (`git grep` of `import "…css"`), plus `leaflet/dist/leaflet.css` (imported by `plugin-web-board-views`): 29 stylesheets, 5,311 postcss rule nodes at `5bbf473`, including keyframe steps.
   - One of them, `plugin-organizer/src/resize-handles.css`, belongs to a desktop plugin that `@repo/web` does not depend on. The other 28 are the Web app's stylesheets.
   - With postcss 8.5.15, every rule that declares an outline-family property, or whose selector uses `:focus`, `:focus-visible` or `:focus-within`, was listed with its file and line, at-rule context, per-selector specificity, and declarations.
   - **137 rules at `5bbf473`, 138 at `419e56d`** (the new rule). Raw output with the script's source: `r3-static-focus-audit.log`.
2. **Browser matching of those rules against the live controls (pre-check harness, §8).**
   - Each listed selector, with its user-action pseudo-classes removed, was tested with `Element.matches` against every pane control and the Topbar status. Pseudo-element selectors were skipped, since they never style the control's own outline.
   - This covered every selection state of every option group (§3.3), the sliders, the clean, failed-write and source-issue states, and the Topbar status, in four configurations.
   - **484 control-state records, 0 selector errors.**
3. **Browser CSSOM: Chrome's own parse of every loaded stylesheet.**
   - On the fixed product, for the same controls and states, every CSSOM style rule (including those nested in `@media`) that matches the control and declares `outline*` or `box-shadow`.
   - `document.styleSheets` held 29 sheets: all 28 Web stylesheets of pass 1, and the Google Fonts link from `apps/web/index.html`, which is cross-origin and failed to load (network blocked).

**What counts as masking:** a rule that reaches a focusable control and sets its outline at a specificity equal to or above the global ring's, `button:focus-visible` / `input:focus-visible` at (0,1,1) in `tokens.css:246–253`, without itself drawing the global ring. Examples: `outline: none`, or a selection ring that does not change with focus. Overflow clipping of the ring by an ancestor was also checked (§3.4).

### 3.2 Audit table: pane controls and the Topbar status

Specificity is (a,b,c). "Native" is the pre-check's own-region changed-pixel minimum, focused against blurred, on the fixed product (§8). The four figures are EN light 1024, ZH light 375, EN dark 1024 and ZH dark 375.

| # | Control (DOM) | States audited | Rules that reach it and set outline or box-shadow (file:line, selector, specificity, declaration) | Masks the global ring? | Decision |
| --- | --- | --- | --- | --- | --- |
| 1 | Language segment `lang:en`, `lang:zh`: `.seg > button[aria-selected]` (in the pane, first row) | `aria-selected` true and false (each option selected once), hover, `:focus-visible` | `tokens.css:246` `button:focus-visible` (0,1,1): the ring. `tokens.css:327–331` `.seg button[aria-selected="true"]` (0,2,1): `box-shadow: var(--shadow-1)`, background, colour; **no outline**. `tokens.css:326` `.seg button:hover` (0,2,1): colour only. | **No.** The selection cue is background and shadow, and the ring is added on focus. | No change. Native 392 / 420 / 384 / 412. |
| 2 | Theme cards `theme:light`, `theme:dark`, `theme:system`: `button.theme-card(.active)` | `.active` on each card, hover, `:focus-visible` | The ring only. `layout.css:1333` and `styles.css:42–44` `.theme-card.active` (0,2,0): `border-color` only. | **No.** | No change. Native 848 / 772 / 848 / 772. |
| 3 | Density segment `density:comfortable`, `density:compact`: `.seg > button[aria-selected]` | as #1 | as #1 | **No.** | No change. Native 468 / 340 / 460 / 332. |
| 4a | Accent swatches, not selected: `button.accent-sw` | each swatch unselected under all six selections, hover, `:focus-visible` | `layout.css:1427–1435` and `styles.css:97–110` `.accent-sw` (0,1,0): `outline: 1px solid var(--border-1)`. `tokens.css:246` ring (0,1,1). `layout.css:1436`, `styles.css:112–114` `.accent-sw:hover`: transform only. | **No.** (0,1,0) loses to the ring's (0,1,1). | No change. Native 352 / 352 / 276 / 276. |
| 4b | **Accent swatch, selected**: `button.accent-sw.active` | each of the six swatches selected (Sage default, Ocean, Sunset, Rose, Violet, Amber), `:focus-visible`, hover | `layout.css:1437–1440` and `styles.css:116–119` `.accent-sw.active` (0,2,0): `outline: 2px solid var(--text-1); outline-offset: 2px`. Rules 4a. No rule anywhere gives a swatch a `box-shadow` (passes 2 and 3). | **Yes: F-APP-2.** (0,2,0) beats (0,1,1), and the selection ring does not change with focus. Pre-fix: 0 own pixels changed in all 24 cases (6 selections × 4 configurations). | **Fixed** by the appended rule (0,4,0), §4. Native after the fix: 770–788 own pixels changed. |
| 5 | Hue slider: `input[type="range"].hue-slider` in `.accent-slider-row` | non-default value (230), `:focus-visible` | `layout.css:1452–1465` and `styles.css:137–152` `.hue-slider` (0,1,0): `outline: none`. `tokens.css:247` `input:focus-visible` (0,1,1): the ring. | **No.** (0,1,0) loses to (0,1,1). | No change. Native 706 / 704 / 704 / 704. |
| 6 | Background tone cards `tone:*`: `button.bg-tone-card.bgt-*(.active)` | `.active` on each of the six tones (each also changes the accent), hover, `:focus-visible` | The ring only. `layout.css:1393`, `styles.css:200–202` `.bg-tone-card.active` (0,2,0): `border-color`. `layout.css:1392`, `styles.css:196–198` `:hover`: transform. | **No.** | No change. Native 720 / 736 / 720 / 736. |
| 7 | Rail position cards `railpos:*`: `button.rail-pos-card.rp-*(.active)` | `.active` on each of the four positions (the shell rail moves), `:focus-visible` | The ring only. `layout.css:226`, `styles.css:265–267` `.rail-pos-card.active` (0,2,0): `border-color`. | **No.** | No change. Native 924 / 712 / 920 / 704. |
| 8 | Font scale slider: `.slider-row > input[type="range"]` | non-default value (1.1), `:focus-visible` | `layout.css:1353–1360` `.slider-row input[type="range"]` (0,2,1): `outline: none`. `styles.css:516–519` (F-APP-1) `.appearance-pane .slider-row input[type="range"]:focus-visible` (0,4,1): the ring. | Masked by tokens, **repaired by F-APP-1** (`5bbf473`). | No change. Native 652 / 848 / 644 / 840. |
| 9 | Field recovery Retry and Discard (`not-saved`), and Reload (`unavailable`): `.appearance-recovery-field > button.btn.ghost` | after a failed theme write; with an unreadable stored rail position | The ring only. `tokens.css:344–365` `.btn`, `.btn.ghost`, `:hover`, `:active`, and `styles.css:451–458`: sizing, background, border, transform; **no outline**. | **No.** | No change. Native: Retry/Discard at least 452; Reload 520 / 560 / 520 / 560. |
| 10 | Retry all: `button.btn.primary.appearance-retry-all`, enabled and `[aria-disabled="true"]` | clean (disabled), after a failed write (enabled) | The ring only. `tokens.css:354–358` `.btn.primary(:hover)`: background. `styles.css:462–464` (0,2,0): `border: 1px solid transparent`. `styles.css:469–474` `.appearance-pane .appearance-actions .appearance-retry-all[aria-disabled="true"]` (0,4,0): background, border colour, colour, cursor; **no outline**. | **No.** | No change. Native, disabled 556 / 560 / 556 / 560; enabled at least 452. |
| 11 | Export and Discard all: `.appearance-actions-row > button.btn.ghost` | while a draft exists | The ring only (as #9). | **No.** | No change. Native at least 452. |
| 12 | Reset to defaults: `button.btn.ghost.appearance-reset` | clean, after a failed write | The ring only (as #9). | **No.** | No change. Native at least 452. |
| 13 | **Topbar status**: `button.appearance-status` in `.topbar-controls` | after a failed write (EN and ZH, light and dark, 1024 and 375) | The ring only. `styles.css:477–510` `.appearance-status`, `:hover` and the 767px media rule: box, background, width; **no outline**. No `.topbar` or `.topbar-controls` rule sets `outline` or `overflow`. | **No.** | No change. Native 684 / 408 / 668 / 392. |

**Not applicable.**
- **States the pane does not use.** `aria-checked`, `:checked` and the native `disabled` attribute appear on no pane control. Retry all uses `aria-disabled` only, which is #10.
- **`.account-data-gate :focus-visible` (0,2,0)** (`plugin-web-storage/src/AccountDataGate.css:15`). It would outrank the ring, but the class exists only on the gate's own blocking `<main>`. Once ready, the gate renders its children in a bare Fragment (`AccountDataGate.tsx:99`), so it never wraps the pane or the Topbar.
- **The remaining 128 statically listed rules.** Of the 137, nine reach a pane control or the Topbar status:
  - the global ring rule;
  - `.accent-sw` ×2;
  - `.accent-sw.active` ×2;
  - `.hue-slider` ×2;
  - `.slider-row input[type="range"]`;
  - the F-APP-1 rule.

  The other 128 reached none of them in any state walked (browser pass). They target other modules' classes, the account gate above, or the Topbar popover (§3.5).

### 3.3 States walked

Every option of every group was selected once, by keyboard, in each of the four configurations. Each group's non-default options came first, and the default was restored last:
- Language 2;
- Theme 3;
- Density 2;
- Accent 6;
- Background tone 6;
- Rail position 4.

Under each selection, every option of that group was checked focused against blurred: 105 group checks per configuration.

Also checked, per configuration:
- the two sliders at non-default values;
- the clean action area (Retry all disabled, Reset);
- the failed-write state (Retry, Discard, Retry all enabled, Export, Discard all, Reset, Topbar status);
- the source-issue state (Reload).

### 3.4 Clipping

**Pane controls.** No ancestor of a pane control between the control and `.settings-detail` sets `overflow`:
- `.sr-ctrl` has no rule at all;
- the option containers, `.setting-row` and `.appearance-pane` set none.

The settings-shell `overflow` rules are on:
- the `.module-settings` scroller;
- `.settings-shell` (`hidden` above 900px, `visible` below);
- `.settings-detail` (`visible` at 641–900px);
- the sidebar's `.list-row .grow` text.

`.settings-detail`'s padding (28px 32px; 22px at 641–900px; 16px 14px at 640px and below) is wider than any ring, including the new one at 6px.

**Topbar status.** No ancestor clips it.

**Pixel check.** The pixel oracle (§8) found every ring inside its control's own region in all four configurations.

### 3.5 Same-class findings outside this caller's scope (reported, not changed)

1. **Topbar quick-switch popover options**: `.topbar-pref-option`, `role="menuitemradio"` with `aria-checked`, in `xai-web-shell/src/Topbar.tsx:145–205`.
   - **Masking.** `layout.css:453–457` `.topbar-pref-option:hover, .topbar-pref-option:focus-visible { background: color-mix(in oklch, var(--accent) 13%, var(--bg-panel)); outline: none }` (0,2,0) removes the ring.
   - **Override.** `layout.css:459–463` `.topbar-pref-option[aria-checked="true"] { background: … 17% …; … }` (0,2,0) comes later and overrides the focus background.
   - **Effect.** A focused checked option is pixel-identical to an unfocused one: 0 own pixels changed (raw 0) for every checked option, in all four configurations, before and after this fix.
   - **Unchecked options** get only the tint. In light theme that is 8,870–12,255 px. In dark theme about 13,100 px change, each by less than 24 per channel.
   - This is the F-APP-2 class, but in shell CSS (protected `layout.css`), outside the audit scope (pane and Topbar status) and outside this batch's only allowed file. A compliant fix needs a tokens or shell change. **For the controller.**
2. **`.topbar-pref-settings:focus-visible`** (`layout.css:512–517`) also replaces the ring with a tint. That tint is identical to hover, and there is no selected state. Shell, reported only.
3. **The 375px rail clipping of `rail:任务`** was already recorded by batch 48 and was not re-audited.

### 3.6 Conclusion

Within the pane and the Topbar status, the only masking rules are:
- the two copies of `.accent-sw.active` (F-APP-2), fixed here;
- `layout.css` `.slider-row input[type="range"]` (F-APP-1), already repaired at `5bbf473`.

No other in-pane fix was needed, and the stop condition did not apply.

## 4. The change (product commit `419e56d`)

### 4.1 `packages/xai-web-settings-appearance/src/styles.css`: append only

These 13 lines were appended after the former last line 519, the `}` that closes the F-APP-1 rule. The first appended line is blank.

```css

/* F-APP-2: the selected accent swatch showed no keyboard focus. Its selection
   ring `.accent-sw.active { outline: 2px solid var(--text-1); outline-offset:
   2px }` (0,2,0), in plugin-web-tokens layout.css and above in this file,
   outranks the global `button:focus-visible` ring in tokens.css (0,1,1) and
   does not change with focus. This pane-scoped rule (0,4,0) draws the global
   ring 2px further out and keeps the selection as a 2px box-shadow ring in the
   selection colour inside it. Outline and box-shadow take no layout space. */
.appearance-pane .accent-sw.active:focus-visible {
  outline: 2px solid color-mix(in oklch, var(--accent) 58%, transparent);
  outline-offset: 4px;
  box-shadow: 0 0 0 2px var(--text-1);
}
```

- **Specificity: (0,4,0).** `.appearance-pane`, `.accent-sw`, `.active` and `:focus-visible` count 4 in the second place.
  - It beats both `.accent-sw.active` copies at (0,2,0), both `.accent-sw` copies at (0,1,0), and the global ring at (0,1,1).
  - So it wins wherever the bundler places the Appearance stylesheet, with no `!important`.
- **Declarations.**
  - `outline` is byte-identical to `tokens.css:251`, the global ring's colour and 2px thickness.
  - `box-shadow: 0 0 0 2px var(--text-1)` repeats the selection ring's colour and width.
- **Geometry, measured outward from the swatch's border-box edge.** The 2px panel-colour border lies inside the box in every state.
  - Unfocused selected: a 2px gap, then the 2px selection ring at 2–4px.
  - Focused selected: the selection ring as a box-shadow at 0–2px, a 2px gap, then the accent focus ring at 4–6px.
  - So the focused selected swatch differs from the unfocused one, and the selection stays visible.
  - It also differs from a focused unselected swatch, which has the accent ring at 2–4px and no dark ring.
  - The ring's outer edge reaches across the 6px inter-swatch gap. At the closest point it overlaps the neighbour's 1px `--border-1` outline in a lens about 1×8px, and covers none of the neighbour's border or fill.
- **Composition.** No stylesheet gives a swatch a `box-shadow`, as passes 2 and 3 confirm: the unfocused computed `box-shadow` is `none` in all four configurations. The new `box-shadow` therefore replaces nothing, and no composition is needed. The guard test fails if one is added later (§5, test 3).
- **Scope.** The rule is top level, inside no at-rule, scoped under `.appearance-pane`, and applies only while the selected swatch is `:focus-visible`. Mouse focus does not match `:focus-visible` on a button, so pointer users keep the plain selection ring.
  - Outline and box-shadow take no layout space and do not change hit-testing.
  - Of the ring properties, `.accent-sw` transitions only `outline-color` (besides `transform`). The ring colour therefore fades in over `--dur-fast` while offset and shadow switch at once.
- **Byte proof.**
  - The first 12,956 bytes of the new file are byte-identical to the whole `5bbf473` file. `cmp` of that prefix exits 0, and it hashes to `2a417677e2160ccc57cde0079dd1bcf41c6b59e3375eb200b23958b00ade081a`.
  - The first 12,491 bytes hash to `c3d3393d48b98b61aa4f218d4eec7ff61ed56b5ab2961961e368f3d24ba192bf`, the whole `24073b5` file.
  - 737 bytes were appended. The new file is 13,693 bytes and 532 lines; SHA-256 `cd95e4a921e334d7ac47fc7e808ffa3e79b664c45fbf754049be33f649f250ce`, blob `3dbce95`.
  - `git diff --numstat 5bbf473 419e56d`: `13 0`.

**Design alternatives considered.**
- Offset 3px would avoid touching the neighbour's outline but leaves a 1px gap.
- An inset selection ring would move the selection inside the colour.
- Keeping the selection ring in place would need an opaque gap colour that only approximates the panel behind it.

The upscaled pre-check clips were reviewed in light and dark: the chosen form reads as "selected and focused" in both.

## 5. Optional tests: `src/__tests__/AppearancePane.selected-focus.test.tsx` (new, 331 lines)

SHA-256 `598f3418b4ca12cd168d907b2c45d76bcf79ab839ebb6c3a0e40938144cd9dcd`, blob `0a246b0`. The F-APP-1 guard `AppearancePane.focus-ring.test.tsx` is unchanged.

**Inputs.** It reads `../styles.css`, and reads the protected `plugin-web-tokens/src/{tokens,layout}.css` and `plugin-web-settings-shell/src/styles.css` (read only).

**Helpers.** It uses the F-APP-1 parser and specificity counter, which throw on unbalanced braces and on functional pseudo-classes. The parser additionally skips keyframe blocks.

**States.** The audit tests render the real pane and the real `AppearanceStatus` under one `AppearanceProvider`, as App does, with the package's Web Lock fixture. The failed write is a `setItem` spy that throws for `xai_pref_theme`.

| # | Test | Asserts |
| --- | --- | --- |
| 1 | `styles.css has one top-level rule for the focused selected swatch: the global ring further out, the selection ring as a box-shadow` | Exactly one rule has the selector. It is not part of a list, sits inside no at-rule, and declares exactly `outline`, `outline-offset: 4px` and `box-shadow: 0 0 0 2px var(--text-1)`. |
| 2 | `its outline is the global button:focus-visible ring, and its box-shadow repeats the selection ring inside it` | The single top-level tokens ring rule declares the same outline. Both `.accent-sw.active` copies (layout.css, styles.css) are `2px solid var(--text-1)` at 2px. The box-shadow equals `0 0 0 <width> <colour>` of that ring. The offset exceeds 2px, and the gap from shadow to ring is 2px. |
| 3 | `its selector outranks every rule that sets a swatch's outline or box-shadow; none of those uses !important or sets a box-shadow` | DOM-matched competitors among the four sheets are exactly `.accent-sw` ×2, `.accent-sw.active` ×2 and `button:focus-visible`. Ours is (0,4,0) and beats each. None is `!important`, and none sets `box-shadow`. |
| 4 | `without :focus-visible the selector reaches exactly the selected swatch, whichever is selected` | Exactly Sage by default; exactly Ocean after choosing Ocean. |
| 5 | `clean pane: the only outline rules at or above the global ring are the two known roots, each outranked by its pane fix` | 27 controls. The masking set is exactly `layout.css \| .accent-sw.active`, `layout.css \| .slider-row input[type="range"]` and `styles.css \| .accent-sw.active`. Each is outranked on every control it reaches by a pane `:focus-visible` rule that draws the global ring. |
| 6 | `after a failed write (recovery Retry/Discard, Retry all enabled, Export, Discard all, Topbar status) nothing else masks the ring` | 32 controls, the same masking set, and nothing unrepaired. |
| 7 | `with an unreadable stored value (Reload only) nothing else masks the ring` | 28 controls (with Reload), the same, nothing unrepaired. |

**Why it is meaningful.**
- Tests 1–4 fail if the rule is removed, wrapped, weakened, drifted from the global ring or from the selection ring, or orphaned.
- Tests 5–7 fail if any rule in these four sheets starts to mask a rendered pane control or the Topbar status at or above the ring without a pane fix. That makes the audit's conclusion a regression guard for this failure class.

**Its limits.**
- jsdom computes no cascade and cannot judge `:focus-visible` or pixels. The native E14–E15 rerun is that oracle.
- It reads 4 of the 28 Web stylesheets. The other 24 are covered by the static log and the native pre-check, not by this unit test.
- Like F-APP-1's test 3, tests 2, 3 and 5–7 are coupled to the tokens root causes by design. If the tokens follow-up removes them, these tests fail and point to revisiting the pane rules in that change.

**Red before green.**
- **Setup.** The new test was present, and the stylesheet was temporarily set back to its `5bbf473` bytes (`2a417677…`).
- **Result.** 4 failed, 3 passed, exit 1. Test 1 failed with `expected [] to have a length of 1 but got +0`. Tests 5–7 each failed with exactly two unrepaired entries, both `.accent-sw.active` copies on `<button class="accent-sw active">`. Log: `r3-negative-control-selected-focus-test.log`, at HEAD `6fedfd1`, before the commit.
- **Restore.** The stylesheet was then restored from a scratch copy and re-hashed (`cd95e4a9…`) before staging.

## 6. Product diffs

**Against `5bbf473`.** `git diff --name-only 5bbf473 419e56d -- apps packages package.json pnpm-lock.yaml` lists exactly the two allowed files. `git diff-tree -r 419e56d` lists the same two paths.

| + | − | File |
| ---: | ---: | --- |
| 331 | 0 | `packages/xai-web-settings-appearance/src/__tests__/AppearancePane.selected-focus.test.tsx` (new) |
| 13 | 0 | `packages/xai-web-settings-appearance/src/styles.css` (append) |

**Against `24073b5`.** `git diff --name-only 24073b5 419e56d -- apps packages package.json pnpm-lock.yaml` lists only `styles.css` and test files:

| + | − | File |
| ---: | ---: | --- |
| 169 | 0 | `packages/xai-web-settings-appearance/src/__tests__/AppearancePane.focus-ring.test.tsx` (F-APP-1, unchanged since `5bbf473`) |
| 331 | 0 | `packages/xai-web-settings-appearance/src/__tests__/AppearancePane.selected-focus.test.tsx` (new) |
| 22 | 0 | `packages/xai-web-settings-appearance/src/styles.css` (two appends: F-APP-1 9 lines, F-APP-2 13 lines) |

**Untouched:**
- tokens, settings shell and shell;
- contract, evidence, ledgers and control plane;
- the `package.json` files and the lockfile.

There is no runtime JS or TS source change.

## 7. Self-checks at the product commit `419e56d` (raw logs in this directory)

All four ran from the worktree root, at `HEAD = 419e56d`, with only the untracked record files present.

| Command | Exit | Result | Log (SHA-256) |
| --- | --- | --- | --- |
| `pnpm --filter @repo/plugin-web-settings-appearance run test` | 0 | 11 files, 137 tests passed: the 130 earlier tests plus 7 new (`AppearancePane.selected-focus.test.tsx (7 tests)`). Stderr is unchanged from r2: 9 blocks, all pre-existing, all from `appearanceDefaults.test.ts`. | `r3-appearance-test.log` (`539cb4bb5f662dc9ad547366a25a6524646a84850e5280989c06cecfc50972c2`) |
| `pnpm --filter @repo/plugin-web-settings-appearance run typecheck` (`tsc --noEmit`) | 0 | No diagnostics. | `r3-appearance-typecheck.log` (`9b553be3ed678ba062fca60631902573eadaf6aa64cc4e0ed25af6ae6d2c7c1e`) |
| `pnpm --filter @repo/plugin-web-settings-appearance run lint` (`eslint --max-warnings 0 .`) | 0 | 0 warnings. | `r3-appearance-lint.log` (`2c7befd3a86112300adb146b3a3778cbecf9b816c729c9190c520bb5caa7c06d`) |
| `pnpm --filter @repo/web run test` | 0 | 29 files, 178 tests passed, the same as r2. 2 stderr blocks, the same count as r2. | `r3-web-test.log` (`0adfb87352250db6fb11f706ead2f94bbf7bcc3fb228c4867e4ccb22d851d246`) |

**Supporting logs:**
- `r3-negative-control-selected-focus-test.log` (`9fdd4b8c7669461e393d668510cf6ef96f546538e61db64cce9a2c16ad403ffb`): the red run (§5);
- `r3-static-focus-audit.log` (`ab72785296e7dafb7291ee032c9ec67f987726a4e9ed0af556b33aacfde4f08b`): the static audit at `419e56d`, 138 rules, exit 0, with the script source (§3.1).

**Dry runs.** The same four commands also ran on the same content before the commit, with the same results. Those logs stayed in the scratchpad; the table above supersedes them.

## 8. Native pre-check (optional; disclosure only, logs and PNGs not committed)

**Setup.**
- **Server.** The worktree's own Vite dev server, started from `apps/web` with `VITE_WEB_AUTH_MODE=mock-authenticated vite --port 41731 --strictPort --host 127.0.0.1`.
  - This is the app's documented local verification mode. It needs no credentials and no account.
  - Each run logged the on-disk `styles.css` hash and read the CSSOM for the F-APP-2 rule.
  - The first server ended with the interrupted session (deviation 4). A second instance, identical, served the CSSOM pass and was stopped afterwards.
- **Browser.** Headless Chrome 154.0.8037.97 over the pipe transport, with flattened sessions.
  - Each run used an isolated temporary profile in the scratchpad, removed afterwards.
  - `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`.
  - deviceScaleFactor 1.
- **Configurations, one Chrome each, run in parallel:**
  - EN light 1024×768;
  - ZH light 375×812 (mobile emulation);
  - EN dark 1024×768;
  - ZH dark 375×812.
- **Harness.** A scratch script, not the frozen batch 48 runner. That runner hard-codes the `5bbf473` delta and labels, and evidence files must not be edited.

**Input.**
- Keys: CDP `Input.dispatchKeyEvent` `keyDown` and `keyUp`, with `key`, `code` and `windowsVirtualKeyCode`, and **no `nativeVirtualKeyCode`** (K-1). Space carries `text`.
- Focus moved only by trusted Tab. After every Tab sequence, `document.activeElement` had to be the expected control and match `:focus-visible`.
- Blur was a trusted, hit-tested click on a non-focusable anchor:
  - the row's `.sr-label`, which also sets the sequential-focus starting point;
  - the recovery text or status line;
  - the Topbar background;
  - the popover heading.
- 480–485 key presses per configuration.

**Oracle per check.**
1. Blurred capture, then focused capture, then blurred again.
2. Each capture is an element-relative clip in page coordinates. The root had been scrolled by script or focus placement, 26 to 158 px, which repeats the batch 48 `captureClip` lesson.
3. Each capture follows a quiescent frame (no finite animation running) and is stable (two identical consecutive captures).
4. All three captures need the same size and sub-pixel phase.
5. The own region is the border box inflated by 8px. A pixel changes when some channel moves by 24 or more; the raster noise seen in development probes was 15 or less.
6. Visible means 30 or more changed own pixels, the two blurred captures equal, and `:focus-visible` true.

**Script actions (disclosed).**
- `scrollIntoView` placement of rows and anchors.
- A `Storage.prototype.setItem` wrapper injected at document start. It throws only while the harness sets a predicate, and was used for one failed theme write.
- `localStorage.setItem('xai_rail_pos', 'diagonal')` and a reload for the source-issue state, then `'left'`.
- Read-only CSSOM and `getAnimations()` reads.

These were trusted product interactions:
- the demo data gate ("Start without importing", then "Continue to workspace");
- hiding the pet with the product's rail toggle at 1440 px;
- every selection, by Tab then Space;
- Discard all, by Enter;
- opening the Topbar popover by its trigger, and closing it with Escape.

**Results** (124 checks per configuration: 117 pane or Topbar-status checks plus 7 out-of-scope popover options):

| Run (UTC) | Stylesheet served | F-APP-2 rule in CSSOM | Pane and status checks not visible | Selected swatch, own pixels changed (6 selections) | Minimum of every other pane and status check | Popover, checked options | Misaligned / unstable / not `:focus-visible` / runtime errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Negative control 17:31:16–17:32:53 | `2a417677…` (`5bbf473`) | 0 | **24** (6 per configuration, all the selected swatch) | **0** in all 24 (raw 0, once 1) | 352 / 340 / 276 / 276 | 0 (raw 0) | 0 / 0 / 0 / 0 |
| Fixed 17:34:54–17:36:35 | `cd95e4a9…` (= `419e56d`) | 1, exact text as §4.1 | **0** | **770–788** (raw 818–820) | 352 / 340 / 276 / 276 (unchanged) | 0 (raw 0), out of scope (§3.5) | 0 / 0 / 0 / 0 |

- **Computed style of the selected swatch on the fixed product.**
  - Unfocused: `solid 2px oklch(0.21 0.012 230)` at 2px, box-shadow `none` (light); `oklch(0.96 0.005 200)` (dark).
  - Focused: `solid 2px oklch(0.57 0.085 <accent> / 0.58)` at 4px (light; `0.72 …` dark), with box-shadow `<text-1> 0px 0px 0px 2px`.
  - So the ring is the global one, and the selection colour persists.
- **CSSOM pass** (fixed product, 18:05:00–18:05:10, 21 control kinds). It shows exactly the rules listed in §3.2 for every control, and no other `outline` or `box-shadow` rule from any of the 28 loaded Web stylesheets.
- **Images reviewed.** Upscaled clips of the selected Sage, Ocean and Amber swatches, light and dark:
  - pre-fix, focused equals unfocused;
  - fixed, the dark (light in dark theme) selection ring hugs the swatch, and the accent focus ring sits 2px outside it.
- **Harness development (all pre-fix, same stylesheet).**
  - The first probes found and fixed four issues: page-coordinate clips, a Topbar anchor off-screen after root scrolling, a noise threshold, and waiting for pending saves (a field-local "saving" block shifted rows).
  - Two earlier full negative-control matrices preceded the reported one. The first stopped in ZH dark on that save race. The second lacked the clean Retry all and Reload checks, which were then added.
  - None of this changed a product conclusion.

**Not evidence.** Vite dev mode with the mock-authenticated demo scope is not the batch 45/46 production-App fixture bundle. Only the batch 50 E14–E15 run on this SHA counts.

## 9. Isolation of the main checkout

Nothing was installed into, written to or served from the main checkout, and no preview tool was used.

A read-only mtime scan of the main checkout ran after all runs, with the batch 46 scope:
- top level;
- `node_modules` and `apps/web/node_modules` to depth 2;
- `apps` and `packages` to depth 3;
- `docs` to depth 2;
- `.git` and `.claude` excluded.

It examined 3,825 entries and found **0** newer than 2026-10-05 10:01:00 −0700, before this worktree's checkout and install. The worktree's own commits do write into the shared git object store, which the scan excludes by design.

## 10. Deviations and judgment calls

1. **Offset 4px, not the global 2px.** The brief suggested a larger offset, so the focused selected swatch's ring sits at 4px. Its colour and thickness are the global ring's.
2. **The optional test checks more than existence and specificity.** It also guards the audit's conclusion (tests 5–7), over the real clean, failed-write and source-issue states plus the Topbar status. It only reads the tokens and settings-shell files.
3. **A new test file rather than an extended one**, so the `5bbf473` F-APP-1 guard stays byte-identical. The small CSS parser and specificity counter are therefore duplicated from it; the parser also skips keyframe blocks.
4. **The session was interrupted after the fixed pre-check.**
   - All four fixed runs had written their summaries and logs, and had removed their Chrome profiles. The Node processes then did not exit, since the harness had no forced exit. The tool call was moved to the background, and the controller observed a stall.
   - On resume, the harness got a forced exit and the server was restarted from the same worktree for the CSSOM pass.
   - No product file was changed in between, as the hash checks show (`cd95e4a9…` before and after).
5. **The working tree was temporarily swapped** for the unit negative control: `styles.css` was set to its `5bbf473` bytes, then restored and checked by SHA-256 before staging.
6. **The pre-check oracle differs from batch 48's.**
   - It compares focused against blurred, with focus on `<body>`, rather than against the next stop, so only the control's own focus changes.
   - It uses a per-pixel delta threshold of 24.
   - Per-stop own-region counts are therefore not comparable one to one with the batch 48 receipt.
7. **The static audit log embeds its script source.** The script itself lives in the session scratchpad and is not a committed file.
8. **Imprecise wording in the product commit message.** It says the audit "covered 137 outline and focus rules in all 29 Web stylesheets". Precisely, the 29 are the 28 Web stylesheets plus the desktop-only `plugin-organizer/src/resize-handles.css` (§3.1), a superset. The commit was not amended, so its SHA stays the one the self-check logs record.
9. **The package docs are not updated.** `packages/xai-web-settings-appearance/docs/test.md` lists neither the F-APP-1 nor the F-APP-2 guard test, because this batch allows only `styles.css` and tests in the product diff.

## 11. Notes for the controller

- **Next step per the control plane:** batch 50, E14–E15 on `419e56d`, with the per-stop pixel walk in each group's non-default selected state.
- **Geometry the walk will meet on the selected swatch.** Focused, the ring is at offset 4px, the outer edge 6px from the border box, and a 2px `var(--text-1)` box-shadow sits at 0–2px. An own-region band derived from the focused computed outline covers 2–8px.
- **For the delta audit in the final regression:** relative to `24073b5`, the product delta is 22 appended CSS lines and two test files. No runtime JS or TS source changed.
- **Same-class item outside this caller (§3.5):** the Topbar popover's checked options show no focus (shell `layout.css:453–463`). This needs a shell/tokens change, with its own native check.
- **Tokens follow-up (unchanged and extended):**
  - `layout.css` `.slider-row input[type="range"] { outline: none }` (F-APP-1) remains;
  - `layout.css` `.accent-sw.active` (F-APP-2) remains;
  - so does its duplicate at `styles.css:116–119`, which this batch could not edit.

  Both guard tests are coupled to these by design.
