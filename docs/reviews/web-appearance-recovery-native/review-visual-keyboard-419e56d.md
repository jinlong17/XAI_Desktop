# Appearance EN/ZH visuals and keyboard at `419e56d` (CP-APPEARANCE-01, batch 50, contract r3 §14 E14–E15)

**Verdict: PASS.** E14 (EN/ZH five-width visual) and E15 (keyboard) ran in full on the fixed product `419e56d` in real headless Chrome. Every gated check passed in all four runs; there is no product failure within this caller's scope.

- **F-APP-1 stays repaired.** The Font scale slider shows the global focus ring in every Tab walk (674–697 own-region pixels change in EN, 870–876 in ZH). Its clips equal batch 48's hashes, and 5cd63ff still reproduces the frozen identical hashes.
- **F-APP-2 is repaired.**
  - The selected accent swatch now shows a focus indicator distinct from its selection ring: 830–832 own-region pixels change in EN and 841–862 in ZH, against 0 at 5cd63ff, which reproduces batch 48's frozen identical hashes.
  - The selection ring stays visible while focused: in the 0.75–1.25 px band outside the swatch edge, 100% of pixels are the computed `--text-1` colour, in light and dark. The control, a focused non-selected swatch, has 0% there.
  - The focus ring uses the global ring's colour and width, and the box does not move.
- **Per-stop pixel walks with non-default selections.** There are 8 walks per language: the three batch 48 walks and five new ones.
  - Every option group is walked on a non-default selection: theme (system, dark), density (compact), accent (swatches 1–5), background (cream, lavender, mist, peach, graphite), sidebar (top, bottom, right); language as 中文 in the ZH run.
  - Both sliders are at non-default values. The walks cover the clean, failed-write (with the Topbar status) and source-issue states, in the light and dark themes, in both languages.
  - 1,000 stop captures (EN 508, ZH 492): every stop's own ring or box differs between focused and moved-on.
- **E14.** Pet-hidden and pet-on runs, the A2.8 Retry all gate, the Topbar breakpoint, the selector and cascade-order audits and the measured disabled presentation all pass at 375, 414, 768, 1024 and 1440 in EN and ZH. The EN 375 overflow is gone (pane 289/289).
- **F-APP-3 (observation only, not gated)** is frozen as committed evidence (§6). In the Topbar quick-switch popover, a focused checked `menuitemradio` changes 0 own pixels, in EN and ZH, light and dark. A focused unchecked one only gains a faint tint: interior contrast 1.16–1.21 against unfocused. The computed outline is `none` throughout.

| Run | Checks | Preconditions | Product checks | Failed | Runtime errors / console warnings | Key audit | Screenshots | Exit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `native-419e56d-fixed1-visual-en.log` (five widths and 760/761/767/768/1025) | 3,437 | 1,671 | 1,766 | 0 | 0 / 0 | 40 of 40 events, 0 mismatches | 19 | 0 |
| `native-419e56d-fixed1-visual-zh.log` (the same) | 3,437 | 1,671 | 1,766 | 0 | 0 / 0 | 40 of 40, 0 mismatches | 19 | 0 |
| `native-419e56d-fixed1-keyboard-en.log` (1024×768) | 1,398 | 1,152 | 246 | 0 | 0 / 0 | 3,137 of 3,137, 0 mismatches | 58 | 0 |
| `native-419e56d-fixed1-keyboard-zh.log` (375×812, mobile emulation) | 1,468 | 1,222 | 246 | 0 | 0 / 0 | 3,077 of 3,077, 0 mismatches | 58 | 0 |

- All four runs are `pass: true`, `harnessValid: true`: visual L3688, keyboard EN L1565, ZH L1650.
- No precondition failed.
- Each mode ran once as evidence (`fixed1`, 1 of 3 iterations).

**Status.** This is verification only.
- It is not acceptance and authorizes nothing.
- It repairs nothing and changes no product source, product test, contract, ledger, control plane or existing evidence. Every earlier file in this directory was only read; six were reused read-only and hash-checked (§2).
- Before the commit, `git status --porcelain --untracked-files=all` listed only the 161 new files of §2, all in this directory.
- It closes no 312 item and does not push, merge, deploy, release or sync Web→Desktop.

## 1. Identity

| Item | Value |
| --- | --- |
| Executor | An independent Claude Opus 5.5 instance in the parent-role visual and keyboard verifier role (batch 50), not the batch 46 or 48 executor. It wrote none of: the contract, the Appearance caller or its two fixes, earlier evidence, the reused batch 45 fixture and instruments, the batch 46 probes, or the batch 46 and 48 runners. |
| Worktree | `.claude/worktrees/agent-a4d9952b2188b4924`. Detached at docs base `2302b474b213a83a2af90b921d12f6e386f907df` after `git fetch origin codex/web/full-product-audit-20260908`; clean before the work. |
| Fixed revision | Requested `419e56d`, resolved `419e56de9f23e4467fea806fbd4a990e1f429941`, tree `7aabbd832be446aeca1441eff34f2fd35945290a` (`baseline`, L9 in all four logs). |
| Before revision | `5cd63ff652f02a2c726187fe12cbc796218d31c0`: pet captures and H14 references (E14), the 5cd63ff Topbar reference, and the focus references (E15). |
| Product tree | `git diff --name-only 419e56d HEAD -- apps packages package.json pnpm-lock.yaml` is empty (L10). `5cd63ff..419e56d` is exactly the 26 files: Terra's 24, the F-APP-1 and F-APP-2 guard tests (L13). `24073b5..419e56d` is `styles.css` and the two guard tests; `5bbf473..419e56d` is `styles.css` and `AppearancePane.selected-focus.test.tsx` (L18). |
| Authority | Contract r3 (`706c9a3`), SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d`, re-derived in every run (L12). Sections: A2.1–A2.9, A9, §9, §13 gates 8 and 9, §14 E14–E15; lines 193, 858, 888 and 1214 (the protected popover). Control plane: "本轮唯一任务" (batch 50) and the CP-APPEARANCE-01 rows (F-APP-1, F-APP-2, F-APP-3 and the rulings). |
| Browser | `Chrome/154.0.8037.97` (HeadlessChrome, `--headless=new`), DevTools protocol 1.3, over the **pipe** transport (`--remote-debugging-pipe`, flattened sessions), isolated profile, deviceScaleFactor 1. The only Chrome on the host (`/Applications/Google Chrome.app`, Info.plist 154.0.8037.97). |
| Host and toolchain | macOS 27.0.1 (26A434), arm64; Node `v24.16.0`; esbuild `0.28.1` from the gated tree; react 19.2.0, react-dom 19.2.0, react-router 7.15.1. |
| Lockfile gate | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`, equal in six places: `XAI_DEPS_ROOT`, both revisions, both extracted archives and the contract gate (L11). A consistency check only. |
| Dependency root | The main checkout, read only. No install, build, checkout, dev server or preview tool ran there. A read-only mtime scan with the batch 46 scope found **0** newer entries among 3,808 after all runs (§11). |
| Network | Only the runner's own `127.0.0.1` server (ephemeral port); every other host resolves to NOTFOUND. 0 page network attempts (`run:no-non-local-network-attempt`: visual L3682, keyboard EN L1559, ZH L1644). |
| Viewports (recorded in `baseline`) | 375×812 and 414×896 with mobile emulation; 768×1024; 1024×768; 1440×900; breakpoint probes 760, 761, 767, 768 (×1024) and 1025 (×768). E15: EN 1024×768, ZH 375×812 with mobile emulation. |
| Evidence runs | Visual EN and ZH in parallel, 19:17:57Z–19:22:18Z; keyboard EN and ZH in parallel, 19:22:37Z–19:30:37Z (2026-10-05). |
| Iterations | Each of the four modes 1 of 3 (`fixed1`). Development probes dev1–dev14 are disclosed in §11. |

## 2. Files and SHA-256

All 161 files are new and in this directory. The runner records its own hash and those of every reused input in each log's `baseline` record (`fileSha256`, L9). Every screenshot's SHA-256 on disk equals its `screenshot` record in the log (154 of 154 checked). Equal hashes between files are expected: identical pixels give identical PNGs. This receipt cannot carry its own hash.

| File | Lines / size | SHA-256 |
| --- | --- | --- |
| `verify-visual-keyboard-419e56d.mjs` (runner copy, all four modes) | 3,468 lines, 278,359 B | `d5fc3262ebd5c0b1c1c95b28d7866b7301190186653991ffb3b8cf0fdc976bcf` |
| `verify-visual-keyboard-419e56d.diff` (unified diff, batch 48 runner → copy; 502 insertions, 9 deletions, 20 hunks) | 680 lines, 60,623 B | `63a89eab831798d3c1bc9f27e3453195e189cc46903d7f3b8e15eefff25f9173` |
| `native-419e56d-fixed1-visual-en.log` (E14 EN) | 3,688 lines, 2,536,932 B | `0e8e642b60e8f8211357211456bb8d4ecf0931ec8ce7a98ec9cd9781e7b9277b` |
| `native-419e56d-fixed1-visual-zh.log` (E14 ZH) | 3,688 lines, 2,517,644 B | `43097916cb3fc721909fa95c2fba487f1a1eab8369a84563e54186fd511903c5` |
| `native-419e56d-fixed1-keyboard-en.log` (E15 EN, F-APP-3 EN) | 1,565 lines, 922,529 B | `2c96feb68ae200a4232981cfa79cc13bbefaf04e59abba533e0b57e9a8e7d486` |
| `native-419e56d-fixed1-keyboard-zh.log` (E15 ZH, F-APP-3 ZH) | 1,650 lines, 921,445 B | `cfe5d63f71368fa3c8f76c25d57fff0e180348ab404a3e1868615c9f01ffca9e` |
| 154 screenshots | see §12 | see §12 |
| `review-visual-keyboard-419e56d.md` | — | this receipt |

**Reused read-only and hash-checked in every run** (L14, L15, L17):

| File | SHA-256 |
| --- | --- |
| `native-host-retryall-app.tsx` (batch 45 production App fixture) | `118f565783fc99e2642341e39ff9afa2df4a6cb937dc016ca41ab13ab1721c19` |
| `native-host-retryall-prelude.js` (batch 45 instruments) | `ad4d711a5639b6685f05ea9cf5742f77d17e5924a127453dcd42f1a117757e7b` |
| `native-5cd63ff-before1-h14.log` (frozen E4 H14; read by the visual modes) | `3d1f5763d11207e6e4e24fc2678177aae0960a91fb933985c061b08bde54e02f` |
| `native-visual-keyboard-probes.js` (batch 46 probes) | `4df16575470d739d1655f32cd1bb0101c2b772552439f3ecfefded4f87bc02c4` |
| `verify-visual-keyboard.mjs` (batch 46 runner; not executed) | `ac268a0af6263772c9e3976d30b7bc2f3502d52c3973de4daa976734aead0781` |
| `verify-visual-keyboard-5bbf473.mjs` (batch 48 runner, the diff base; not executed) | `5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4` |

## 3. E14: EN/ZH five-width visual (both languages PASS)

The batch 46/48 visual modes ran unchanged except for two additive checks (§3.5, §3.6). Every state was set up by trusted input in the production App. Each control was probed after scrolling it into view, with the pet hidden by its own rail toggle (gated), and again with the pet on at its default position (R-PET).

### 3.1 Pet hidden: per width (every state, every control)

| Width × height | States | Controls per state | Failed checks | Document / detail / pane (scroll/client) | Smallest caller target EN / ZH | Retry all box EN / ZH |
| --- | --- | --- | --- | --- | --- | --- |
| 375×812 (mobile) | clean, source-only, all seven, partial reset, partial pass, Topbar status | 27, 28, 43, 33, 31, 31 | 0 | 375/375, 317/317, 289/289 | 64.11×44 / 57×44 (`retry:lang`) | 83.19×44 / 84×44 |
| 414×896 (mobile) | the same | the same | 0 | 414/414, 356/356, 328/328 | the same | the same |
| 768×1024 | the same, plus the open pass | the same, plus 31 | 0 | 768/768, 648/648, 604/604 | the same | the same |
| 1024×768 | as at 375 | the same | 0 | 1024/1024, 672/672, 608/608 | the same | the same |
| 1440×900 | as at 375 | the same | 0 | 1440/1440, 738/738, 674/674 | the same | the same |

- Each control is checked for:
  - a centre hit and four inset hits after scrolling it into view;
  - containment in `.settings-detail` and its content box (Topbar controls in `.topbar` and the viewport);
  - being inside the viewport and visible;
  - no horizontal scroll of the document, detail, pane or any ancestor scroller, before and after scrolling every control into view;
  - no overlap between sibling parts and no clipped label.
- **44×44:** every caller target (recovery buttons, Retry all, Export, Discard all, Reset, Topbar status) is at least 44×44 at every width (control-plane ruling 2).
- **Bottom action area:** status line, then Retry all first, Export, Discard all, then Reset alone. Normal flow, start-aligned, wrapping, no `.pane-footer`/`.pane-save`.
- **Clean rows** have computed styles equal to 5cd63ff except the scoped ≤640 px palette grid. Existing row controls are not smaller than at 5cd63ff.
- **H14 (a): the EN 375 overflow is gone.** The pane is 289/289 in every state at 375 in both languages. 5cd63ff still reproduces 380/289 in EN (Graphite card 348.91–418.06), equal to the frozen E4 log (EN L61). ZH has no overflow in either product (ZH L61).

### 3.2 The A2.8 Retry all gate (pet on, default position)

| Width | Separation from the pet (px) EN / ZH | Centre + 4 insets on the button | Intersection with the pet box | Probes |
| --- | --- | --- | --- | --- |
| 375 | 145.81 / 145 | 5 of 5 | 0 | after scrolling into view; `.module-settings` at the end of its range |
| 414 | 184.81 / 184 | 5 of 5 | 0 | the same |
| 768 (×1024) | 463.81 / 463 | 5 of 5 | 0 | the same |
| 1024 (×768) | 483.81 / 483 | 5 of 5 | 0 | the same, with the page at the top (0) and at the end (158) |
| 1440 | 729.81 / 729 | 5 of 5 | 0 | the same |

- **States:**
  - all seven, partial reset, partial pass and Topbar status, with Retry all enabled;
  - clean and source-only, disabled;
  - at 768, the open pass held behind the real lock, disabled and described by the in-flight line.
- Retry all was at least 44×44 and inside `.settings-detail` in every probe. The pet was never hovered or focused.
- **402 A2.8 checks per language, 0 failed:** 371 product and 31 preconditions, including "scrolled to the end of the settings range".

### 3.3 Pet on: the R-PET run

- **Coverage:** 36 pet-on runs per language (31 pane documents and 5 on `/app/tasks`), with 1,093 control probes per language.
- **Caller controls:** every caller-added or moved control has an uncovered centre (36 of 36 checks per language).
- **Unchanged controls:** none was covered by the pet after scrolling into view, so no UX-03/SHELL-05 entry arises from this run.
- **5cd63ff reference (H14 b)** reproduces at 768×1024 at the top and the end of the range. It equals the frozen E4 box: centre on `pet:wrap`, separation −57 px, intersection 1,482 and 2,508 px² (EN and ZH L94, L98).

### 3.4 Topbar with the status visible, and the breakpoint

| Width | Status | Text | Summary | Search | Trigger |
| --- | --- | --- | --- | --- | --- |
| 760, 761, 767 (×1024) | 44×44 | hidden (icon only) | hidden | 634, 635, 641 ×44 | 44×44 |
| 768 (×1024) | EN 112.8×44, ZH 88.5×44 | visible | visible | EN 341.2×44, ZH 401.02×44 | EN 196×44, ZH 160.48×44 |
| 1025 (×768) | EN 112.8×44, ZH 88.5×44 | visible | visible | 420×36 | EN 207.98×36, ZH 160.48×36 |

- **The breakpoint follows the ruling:** text from 768 px, icon only at 761–767.
- **The status state at all five widths, on the pane and on `/app/tasks`:**
  - every Topbar control is inside the viewport and the Topbar, centre- and inset-hit, and visible;
  - there is no Topbar overflow;
  - the status sits immediately before the trigger, with its normative name and text.
- **Pre-existing controls keep their clean-state height and stay at least 44 wide** with the status visible (control-plane ruling 2).

### 3.5 Pre-existing Topbar controls against 5cd63ff (additive check; the 44×44 ruling)

In the clean state, the fixed Topbar controls are exactly the 5cd63ff set, with **equal** sizes at every width (EN L3164–L3172; ZH the same lines):
- search: 303×44, 342×44, 420×44, 420×44 and 420×36;
- trigger: 44×44 at 375 and 414; EN 196×44 and ZH 160.48×44 at 768 and 1024; EN 210.53×36 and ZH 160.48×36 at 1440.

The 36 px heights at 1440 are pre-existing, unchanged, and judged as no regression.

### 3.6 Selector audit (static, git) and the two focus rules

- **Changed CSS.** Only `packages/xai-web-settings-appearance/src/styles.css` changed. The tokens, settings-shell and global styles have an empty diff.
- **Prefix chain.** The fixed file (13,693 B, `cd95e4a9…`) begins with the 5bbf473 file (12,956 B, `2a417677…`). That begins with the 24073b5 file (12,491 B, `c3d3393d…`), which begins with the 5cd63ff file (8,595 B, `1b17d1f4…`).
- **Additions since 5cd63ff.** 5,098 B and 152 lines, balanced. At-rules: `@media (max-width: 640px)` and `@media (max-width: 767px)` only.
- **Checks.** All 18 `css:*` checks pass (EN and ZH L20–L41): 14 inherited from batch 48 and 4 additive focus-rule checks.

| # | Added selector | Context | Declarations |
| --- | --- | --- | --- |
| 1 | `.appearance-pane .bg-tones` | `@media (max-width: 640px)` | `grid-template-columns: repeat(3, minmax(0, 1fr))` |
| 2 | `.appearance-pane .appearance-recovery-field` | — | flex, wrap, gap 8px, padding, border `--border-1`, background `--bg-panel-2` |
| 3 | `.appearance-pane .appearance-recovery-text` | — | `flex: 1 1 100%`, wrapping, `--fs-sm`, `--text-1` |
| 4 | `.appearance-pane .appearance-actions` | — | column flex, `flex-wrap: wrap`, `justify-content: flex-start`, gap 10px, top border |
| 5 | `.appearance-pane .appearance-status-line` | — | wrapping, `--fs-sm`, `--text-2` |
| 6 | `.appearance-pane .appearance-actions-row` | — | flex, wrap, `flex-start`, gap 8px |
| 7 | `.appearance-pane .appearance-recovery-field > button` | — | `min-width: 44px; min-height: 44px` |
| 8 | `.appearance-pane .appearance-actions button` | — | `min-width: 44px; min-height: 44px` |
| 9 | `.appearance-pane .appearance-retry-all` | — | `border: 1px solid transparent` |
| 10 | `.appearance-pane .appearance-actions .appearance-retry-all[aria-disabled="true"]` | — | **the disabled rule set:** `background-color: var(--bg-panel-2); border-color: var(--border-1); color: var(--text-3); cursor: not-allowed` |
| 11 | `.appearance-status` | — | inline-flex, 44×44 minimum, amber-tinted border and background, `--text-1`, pill |
| 12 | `.appearance-status:hover` | — | background only |
| 13 | `.appearance-status-icon` | — | `flex: 0 0 auto` |
| 14 | `.appearance-status` | `@media (max-width: 767px)` | `width: 44px; padding: 0` |
| 15 | `.appearance-status-text` | `@media (max-width: 767px)` | `display: none` |
| 16 | `.appearance-pane .slider-row input[type="range"]:focus-visible` | — | **F-APP-1:** `outline: 2px solid color-mix(in oklch, var(--accent) 58%, transparent); outline-offset: 2px` |
| 17 | `.appearance-pane .accent-sw.active:focus-visible` | — | **F-APP-2:** `outline: 2px solid color-mix(in oklch, var(--accent) 58%, transparent); outline-offset: 4px; box-shadow: 0 0 0 2px var(--text-1)` |

- **The disabled rule (#10)** declares only colours and the cursor, from the neutral tokens `--bg-panel-2`, `--border-1` and `--text-3`. It uses no `--accent*`, `--red*` or `--danger` token and sets no `pointer-events`.
- **The focus rules (additive audit, L37–L41).**
  - The F-APP-1 increment is 465 B and 9 lines; the F-APP-2 increment is 737 B and 13 lines. Each is one rule, appended, outside any at-rule and pane-scoped.
  - Both use the outline shorthand of the global ring in `tokens.css` (`button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible, [role="button"]:focus-visible`: `2px solid color-mix(in oklch, var(--accent) 58%, transparent)`, offset 2px).
  - F-APP-1 keeps the global offset. F-APP-2 draws it at 4 px and keeps the selection as a `0 0 0 2px var(--text-1)` box-shadow. It declares only `outline`, `outline-offset` and `box-shadow`, so it takes no layout.

### 3.7 Cascade-order audit (control-plane F-APP-1 ruling 1)

**The order change.** In the fixed bundle the Appearance stylesheet is section 7 of 28; at 5cd63ff it was section 25. The 18 stylesheets that now follow it are:

> matrix, countdown, tasks, habits, pomodoro, time-tracker, bookkeeping, metric-tracker, meditation, calendar, board-core, dashboard-widgets, dashboard-grid, board-workspaces, `leaflet.css`, board-views, statistics, features-panel.

Every other stylesheet is byte-identical to 5cd63ff (`css:bundle-*`, L34–L35).

The audit ran in every gated state at every width, on `/app/tasks` with the status, and in all 14 presentation loads: **51 audits per language**.

| Measure | EN | ZH |
| --- | --- | --- |
| (a) Reorder equivalence: computed styles under the fixed order vs the 5cd63ff order, re-created by adopted copies, with transitions frozen, then restored | **0 changed** of 60,775 entries (952–3,168 per audit) | **0 changed** of 60,775 |
| (b) Overlap scan: rules of the 18 stylesheets targeting an Appearance target with a shared longhand | **0** | **0** |
| Rules of the 18 matching an Appearance target at all | Only `.mono` (matrix, habits, meditation, board-views) on `span.slider-val.mono`. It declares `font-family` and `font-variant-numeric`/`font-feature-settings`; the Appearance `.slider-val` rules declare `font-size`, `letter-spacing`, `color` and `min-width`. No shared longhand. | the same |
| Appearance rules exercised | **90 of 90** matched an element in some audited state, including the F-APP-2 rule (89 in batch 48 plus this one) | 90 of 90 |
| Positive controls (every audit) | The synthetic equal-specificity rule is detected by (a) and (b). Moving the real `layout.css` after the Appearance stylesheet changes at least 76 entries in every pane audit. | the same |

None of the 18 stylesheets overrides an Appearance rule in any audited state (cascade table, L3680 in both logs).

### 3.8 Disabled Retry all presentation, measured (A2.2; 1440, clean, pet hidden)

**Contrast** (label over the effective background, sRGB, effective opacity 1). The values are identical in EN and ZH:

| Theme | default | cream | mist | lavender | peach | graphite |
| --- | --- | --- | --- | --- | --- | --- |
| light (label `oklch(0.58 0.008 230)` = rgb 118,123,126) | 4.084 | **3.795** | 3.928 | 3.908 | 3.883 | 3.922 |
| dark (label `oklch(0.62 0.006 200)` = rgb 130,135,135) | **5.078** | 4.54 | 4.637 | 4.55 | 4.555 | 4.761 |

All 12 loads are at least 3:1. The colour conversions agree with the browser canvas, and no layer has an image, filter or text decoration.

- **Accent independence.** `color`, `background-color` and `border-color` are equal with the accent absent (165) and seeded as 25. The positive control shows the accent token changing from `oklch(57% 0.085 165)` to `oklch(57% 0.085 25)` (L3640, L3642 in both logs).
- **Distinction.**
  - Disabled: `oklch(0.58 0.008 230)` on `oklch(0.984 0.004 235)`, border `oklch(0.898 0.008 230)`.
  - Enabled (one failed sidebar write): `rgb(255, 255, 255)` on `oklch(0.57 0.085 165)`, transparent border, contrast 4.275.
  - Colour, background and border differ, and opacity is 1 in both.
  - The box is the same in both states: EN 83.19×44, ZH 84×44, with the same padding, border widths and font.
  - Across widths, the clean and all-seven boxes are also equal.
- **Focus ring.** At 375 and 1440 in EN and ZH, a trusted Tab focuses the disabled button. It matches `:focus-visible` and shows `solid 2px oklch(0.57 0.085 165 / 0.58)` at offset 2 px, centre-hit. No `disabled` attribute is set (EN and ZH L220, L2662). The screenshots are #3, #14, #22 and #33.
- **Attributes, in every disabled state (clean and source-only at all widths, open pass at 768):**
  - `aria-disabled="true"`;
  - no `disabled`, `title` or `aria-describedby`;
  - `pointer-events: auto`, `tabIndex` 0;
  - AX role `button`, name `Retry all`/`全部重试` equal to the visible label, no description.

  In the open pass, the in-flight line describes it. Enabled, it carries no `aria-disabled` and is described by the status line.

### 3.9 Dialogs and runtime (visual)

- **Dialogs:** 26 per language, all planned and consumed: 5 accepted reset confirmations and 21 runner-initiated `beforeunload` prompts on leaving documents with drafts.
- **Runtime:** 0 runtime errors and 0 console warnings (L3687).

## 4. E15: keyboard (both languages PASS)

The runs used trusted CDP input only (§7). Widths: EN 1024×768, ZH 375×812 with mobile emulation, as in batches 46 and 48.
- Each document hides the pet with the product's rail toggle (a trusted, hit-tested click; at 375 it is made at 1440 px).
- Focus moves only by Tab, Shift+Tab or the product's own focus management. The exceptions are the batch 46 ones: pointer anchors on non-focusable text, and one removable `tabindex` for the Space-scroll positive control.

Log lines are EN / ZH.

### 4.1 Tab order and visible focus (the frozen checks)

| Requirement | Result | Lines |
| --- | --- | --- |
| Tab reaches every control in DOM order | Clean: full cycles of 61 (EN) and 59 (ZH) presses, equal to the DOM order of tabbable controls (rotated). The pane part is the 25 row controls, Retry all (`aria-disabled`, still a stop), then Reset. | L254–L255 / L266–L267 |
| All seven unresolved | 78 / 76 presses. The recovery stops follow each field; then Retry all, Export, Discard all and Reset. | L321–L322 / L337–L338 |
| Topbar status before the appearance trigger | A stop immediately before the trigger | L323 / L339 |
| Source only (`xai_rail_pos` = `diagonal`) | `reload:railPos` after the sidebar cards, then the Font scale slider, Retry all (disabled) and Reset | L353, L359 / L373, L379 |
| Visible focus, frozen check (`:focus-visible`, outline ≥ 2 px; pane stops solid, centre-hit, in viewport) | PASS in the clean and drafts cycles | L257–L258, L324–L325 / L269–L270, L340–L341 |

### 4.2 Visible focus by pixels at every stop: 8 walks per language

The oracle is batch 48's `pixelFocusWalk`, unchanged.
- Each stop is captured twice: focused, and again after focus moved on to the next stop.
- Both captures are stable frames after a quiescent frame, with the same scroll, rect and hover.
- The decoded pixels of the stop's own region must differ, and the computed outline must not be `none`. The own region is its outline band plus its own box, excluding the next stop's ring area.

| Walk | State | Theme | Stops EN / ZH | Failed | Lines (every stop has visible focus) |
| --- | --- | --- | --- | --- | --- |
| `tab:clean` (batch 48) | clean, default selections | light | 59 / 57 | 0 | L271 / L285 |
| `tab:drafts` (batch 48) | all seven failed, Topbar status | light | 76 / 74 | 0 | L333 / L351 |
| `tab:source` (batch 48) | source issue | light | 60 / 58 | 0 | L361 / L382 |
| `sel-light-a` | clean | light (`system`) | 59 / 57 | 0 | L1073 / L1130 |
| `sel-light-b` | clean | light (`system`) | 59 / 57 | 0 | L1115 / L1176 |
| `sel-dark-clean` | clean | dark | 59 / 57 | 0 | L1157 / L1222 |
| `sel-dark-failed` | all seven failed, Topbar status | dark | 76 / 74 | 0 | L1231 / L1300 |
| `sel-dark-source` | source issue | dark | 60 / 58 | 0 | L1275 / L1348 |

**Totals.**
- EN: 508 stop captures, 0 failed.
- ZH: 492, 0 failed.
- Weakest own-region change:
  - EN 350 px (`lang:en`);
  - ZH 81–86 px, on `rail:任务`, the first bottom-rail item at 375. This is the shell stop already flagged in batch 48: the rail scroller clips its ring. It is flagged weak, not failed, and it is outside this caller.

**Self-tests (L261, L263 / L274, L276):**
- The runner's PNG decoder equals the browser's own decoding (429 and 446 distinct colours).
- CDP clips are page coordinates. With the EN window scrolled by 158 px, the page-coordinate clip equals the viewport crop and a viewport-coordinate clip does not. The ZH window cannot scroll.

**The five selection walks (additive):**
- Before each walk, the exact selection is a precondition: the selected controls, both slider values, the applied theme, and the state's recovery blocks.
- After the walk, each selected control, both sliders, and the state's own caller stop must show visible focus by its own pixels.
- Values are own-region pixels changed, EN / ZH.

| Walk | Selected (beyond the language segment) | Sliders (hue, font) | Focal stops: own-region pixels changed, EN / ZH |
| --- | --- | --- | --- |
| `sel-light-a` | theme `system`, `density:compact`, `swatch:2` (Sunset), `tone:cream`, `railpos:top` (chosen by a trusted click and saved, §11) | 35, 0.9 | system 918/858, compact 534/460, swatch:2 663/672, cream 627/649, top 750/581, hue 738/740, font 680/876 |
| `sel-light-b` | `system`, `compact`, `swatch:4` (Violet), `tone:lavender`, `railpos:bottom` | 295, 1.1 | 918/858, 527/460, swatch:4 663/680, lavender 656/648, bottom 970/778, hue 754/740, font 680/876 |
| `sel-dark-clean` | `theme:dark`, `compact`, `swatch:1` (Ocean), `tone:mist`, `railpos:right` | 230, 1.05 | dark 822/771, 514/458, swatch:1 663/672, mist 589/814, right 757/573, hue 755/740, font 682/870 |
| `sel-dark-failed` | drafted and failed: `dark`, `compact`, `tone:peach`, then `swatch:3` (Rose), `railpos:top`; all seven fields failed | 355, 1.05 | dark 905/771, 512/458, swatch:3 663/671, peach 605/649, top 747/579, hue 769/740, font 697/876, **Topbar status 511/354**, Retry all 488/492 |
| `sel-dark-source` | `dark`, `compact`, `swatch:5` (Amber), `tone:graphite`; `xai_rail_pos` = `diagonal`, so the default `left` is shown with Reload | 75, 1.15 | dark 822/771, 527/458, swatch:5 849/841, graphite 820/814, left 761/580, hue 739/740, font 674/870, Reload 547/583 |

**Language.** The selected segment is `lang:en` in the EN run (350/362 px changed) and the non-default `lang:zh` in every ZH walk (558–576 px).

**Coverage.** Each walk visits every control, so the unselected options of each group are walked too. Across the 8 walks per language, these options were walked while **selected**:

| Group | Selected while walked |
| --- | --- |
| Theme | `light` (the 3 batch 48 walks), `system` (`sel-light-a`, `sel-light-b`), `dark` (the 3 dark walks) |
| Density | `comfortable` (batch 48 walks), `compact` (all 5 selection walks) |
| Accent swatch | `swatch:0` (batch 48 walks), `swatch:1`–`swatch:5` (one selection walk each) |
| Background | `default` (batch 48 walks), `cream`, `lavender`, `mist`, `peach`, `graphite` (one selection walk each) |
| Sidebar | `left` (batch 48 walks; `sel-dark-source` shows the default), `top` (`sel-light-a`, `sel-dark-failed`), `bottom` (`sel-light-b`), `right` (`sel-dark-clean`) |
| Language | `lang:en` (EN run), `lang:zh` (ZH run, the non-default) |
| Sliders | hue 165 (batch 48 walks), 35, 295, 230, 355 and 75; font 1.0 (batch 48 walks), 0.9, 1.1, 1.05 and 1.15 |

**Own-region pixels changed for every pane control and caller stop, all 8 walks** (minimum–maximum over the walks):

| Stop | EN (walks) | EN min–max | ZH (walks) | ZH min–max |
| --- | --- | --- | --- | --- |
| `lang:en` / `lang:zh` | 8 / 8 | 350–362 / 500–516 | 8 / 8 | 379–392 / 558–576 |
| `theme:light` / `dark` / `system` | 8 each | 821–826 / 820–905 / 913–918 | 8 each | 774–776 / 771–772 / 856–858 |
| `density:comfortable` / `compact` | 8 each | 471–496 / 512–534 | 8 each | 311–320 / 458–468 |
| `swatch:0` … `swatch:5` | 8 each | 405–849 (selected ones 662–849) | 8 each | 397–841 (selected ones 671–841) |
| `hue-slider` | 8 | 736–769 | 8 | 740 |
| `tone:*` (6) | 8 each | 577–825 | 8 each | 648–822 |
| `railpos:left` / `right` / `top` / `bottom` | 8 each | 753–819 / 757–769 / 747–761 / 970–1010 | 8 each | 580–585 / 573–577 / 579–585 / 777–786 |
| `font-slider` | 8 | 674–697 | 8 | 870–876 |
| `retry:<field>` ×7 / `discard:<field>` ×7 | 14 / 14 | 417–449 / 555–633 | 14 / 14 | 392–403 / 483–495 |
| `retry-all` | 8 | 488–549 | 8 | 492–529 |
| `export` / `discard-all` | 2 / 2 | 876–1030 / 858–887 | 2 / 2 | 633–657 / 601–625 |
| `reset` | 8 | 783–831 | 8 | 583–603 |
| `reload:railPos` | 2 | 547–563 | 2 | 583–603 |
| `topbar:status` | 2 | 511–720 | 2 | 354–413 |
| shell stops (rail, Topbar search and trigger, settings sidebar) | 256 | min 352 | 240 | min 81 (`rail:任务`) |

### 4.3 The selected accent swatch

**The batch 48 reproduction section now passes.** Procedure:
1. A trusted Tab to the swatch.
2. A stable frame of a control-relative clip.
3. Trusted Shift+Tab out of the swatch row, to `density:compact`.
4. The same clip again.

| Language, product, case | Swatch | Focused outline | Unfocused outline | Own pixels changed | PNG focused / moved back | Line |
| --- | --- | --- | --- | --- | --- | --- |
| EN, 419e56d, default (Sage selected) | `swatch:0`, **selected** | solid 2px at **4 px** (global colour) + `box-shadow` | solid 2px at 2 px (selection) | **830** / 2,304 | `efa3b968…` / `22ae3bab…` | L131 **PASS** |
| EN, 419e56d | `swatch:1` (positive control) | solid 2px at 2 px | solid 1px | 537 / 1,936 | `a450127b…` / `e2048ed2…` | — |
| EN, 419e56d, accent 230 (Ocean selected) | `swatch:1`, **selected** | solid 2px at 4 px + `box-shadow` | solid 2px at 2 px | **832** / 2,304 | `40366c16…` / `54858f2b…` | L175 **PASS** |
| EN, 419e56d, accent 230 | `swatch:2` | solid 2px at 2 px | solid 1px | 545 / 1,936 | `89ba2075…` / `eef15f6e…` | — |
| EN, 5cd63ff (reference) | `swatch:0`, selected | solid 2px at 2 px | the same | **0** (identical) | `a9a8821f…` both (batch 48's frozen hash) | observation |
| EN, 5cd63ff | `swatch:1` | solid 2px at 2 px | solid 1px | 587 / 1,936 | `915430a6…` / `fb6da820…` | — |
| ZH, 419e56d, default | `swatch:0`, **selected** | solid 2px at 4 px + `box-shadow` | solid 2px at 2 px | **841** / 2,304 | `6e001129…` / `b4f04d2e…` | L137 **PASS** |
| ZH, 419e56d | `swatch:1` | solid 2px at 2 px | solid 1px | 555 / 1,936 | `e6173422…` / `9723354f…` | — |
| ZH, 419e56d, accent 230 | `swatch:1`, **selected** | solid 2px at 4 px + `box-shadow` | solid 2px at 2 px | **857** / 2,304 | `f78e2d96…` / `7b4b5826…` | L183 **PASS** |
| ZH, 419e56d, accent 230 | `swatch:2` | solid 2px at 2 px | solid 1px | 561 / 1,936 | `7c480559…` / `2019fe06…` | — |
| ZH, 5cd63ff (reference) | `swatch:0`, selected | solid 2px at 2 px | the same | **0** (identical) | `300ff1da…` both (batch 48's frozen hash) | observation |
| ZH, 5cd63ff | `swatch:1` | solid 2px at 2 px | solid 1px | 555 / 1,936 | `1f97781b…` / `4749df26…` | — |

**The selection ring stays visible while focused (additive section).** Light and dark; a focused non-selected swatch is the control.
- The swatch is a 32 px circle; the band distance is radial from its edge.
- The bands are the anti-aliasing-free cores of the rings, because a pixel spans at most ±0.71 px radially:
  - 0.75–1.25 px is the core of the 2 px box-shadow ring;
  - 2.75–3.25 px is the core of the 2 px selection outline at offset 2.
- Fractions are of pixels within 28 levels per channel of the computed ring colour, converted by the browser canvas.

| Theme, selected (control) | Own pixels changed, focused vs unfocused, EN / ZH | Focused: ring colour in 0.75–1.25 px | Unfocused: ring colour in 2.75–3.25 px | Control: ring colour in 0.75–1.25 px | Focused outline | Focused `box-shadow` |
| --- | --- | --- | --- | --- | --- | --- |
| light, Sage `swatch:0` (`swatch:1`) | 830 / 841 of 2,304 | **1.0** / 1.0 | 1.0 / 1.0 | **0** / 0 | solid 2px, offset 4px, `oklch(0.57 0.085 165 / 0.58)` | `oklch(0.21 0.012 230) 0px 0px 0px 2px` |
| light, Violet `swatch:4` (`swatch:5`) | 831 / 862 | 1.0 / 1.0 | 1.0 / 1.0 | 0 / 0 | the same, hue 295 | the same |
| dark, Ocean `swatch:1` (`swatch:2`) | 832 / 856 | 1.0 / 1.0 | 1.0 / 1.0 | 0 / 0 | solid 2px, offset 4px, `oklch(0.72 0.085 230 / 0.58)` | `oklch(0.96 0.005 200) 0px 0px 0px 2px` |
| dark, Sage `swatch:0` (`swatch:1`) | 831 / 842 | 1.0 / 1.0 | 1.0 / 1.0 | 0 / 0 | the same, hue 165 | the same |

Checks per case (EN / ZH), all PASS:
- focused and selected differs from selected and unfocused: L1323, L1364, L1405, L1446 / L1398, L1441, L1484, L1527;
- the selection ring is still visible while focused: L1324, L1365, L1406, L1447 / L1399, L1442, L1485, L1528;
- the focus indicator uses the global ring's colour and width, equal to the control swatch's ring, and the selection colour is kept: L1325, … / L1400, …;
- no layout change, the same box focused and unfocused: L1326, … / L1401, ….

Measurement validity is a precondition in every case: the unfocused selection outline is the ring colour, and the control has none inside. The table is at L1450 / L1531.

### 4.4 The F-APP-1 slider (frozen section `focus-visibility`)

| | Product | Computed outline when focused | Focused vs moved on | Line |
| --- | --- | --- | --- | --- |
| EN Font scale | 419e56d | solid 2px `oklch(0.57 0.085 165 / 0.58)`, offset 2px | **differ**: `62f79bd0…` / `6ad3f2c8…` (batch 48's hashes) | L61 PASS |
| EN hue (positive control) | 419e56d | the same ring | differ: `c148a9e2…` / `065dff6b…` | precondition |
| EN Font scale | 5cd63ff | `none` (3px, `oklch(0.21 0.012 230)`) | **identical** `3a90a477…` (batch 46's frozen hash) | observation |
| ZH Font scale | 419e56d | the same ring | **differ**: `ab7f6fb4…` / `31dd04a8…` (batch 48's hashes) | L63 PASS |
| ZH hue | 419e56d | the same ring | differ: `b35454b7…` / `776ef536…` | precondition |
| ZH Font scale | 5cd63ff | `none` | **identical** `a1343047…` (batch 46's frozen hash) | observation |

The table is at L101 / L105.

### 4.5 Other §9 keyboard requirements (all PASS, both languages)

| Requirement | Result | EN / ZH |
| --- | --- | --- |
| Enter and Space activate once | 13 activations per language. Each is exactly 1 trusted keydown and 1 trusted click, exactly the expected writes, and focus kept on the control, which shows the choice. Theme dark/system/light, density, swatches 230/35, background lavender (+295) and default (+165), sidebar right/left, language and back. | L391–L509, table L510 / table L533 |
| No page scroll on Space | Positive control: Space on the pane title scrolls 449 px (EN) and 652 px (ZH), more than half the scrollport (358, 346). All 15 Space presses per language did not page-scroll. Tolerances (ruling 4): one clamp after a recovery block left (EN −114 px, ZH −108 px), and in ZH anchoring of +3 px (density) and +13 px (accepted reset). For four ZH presses on bottom controls, the scroller was first moved up 44–120 px, keeping the control in view. | L379 / L402 |
| Slider steps | ArrowRight, ArrowLeft, Home and End: one edit each, with exact bytes, readout and focus kept. Hue 166, 165, 0, 360; font 1.05, 1, 0.85, 1.15. | L544 / L569 |
| Reset confirmation | Enter declined: 0 get/set/remove attempts, focus on Reset. Space accepted: 2 removals, "Defaults restored.", focus on Reset. Partial (sidebar removal denied): no restored claim, focus on Reset. | L569, L577, L603 / L596, L604, L632 |
| Focus targets | Discard by Enter → the selected density segment; Discard by Space → the hue slider; Retry that fails again → stays; Retry that succeeds → the selected theme card; Reload unrepaired → `railpos:left` with the alert kept; Reload after an external repair → `railpos:top`, no saved claim; Discard all → Reset inside the pane, never `<body>` | L635, L646, L676, L681, L705, L713, L745 / L666, L677, L709, L714, L740, L748, L782 |
| Retry all, disabled (clean, pending only behind the real lock, source only) | Enter and Space: 0 operations, 0 lock requests, focus kept, still `aria-disabled`, no Space scroll | L769–L843 / L808–L886 |
| Retry all: Enter, full success | One write per member; "Appearance settings saved." / "外观设置已保存。"; Retry all now `aria-disabled` without description; focus stayed on it in every sampled frame, never `<body>`; no Topbar status | L875–L876 / L920–L921 |
| Retry all: Space, partial | Count line 1; focus on the enabled Retry all; Topbar status shown | L910 / L957 |
| Second Enter and Space while pending | 0 attempts, focus kept; described by the in-flight line; a Tab stop in the open pass; after release the held member was written once | L942–L956 / L991–L1005 |
| Open pass, member fails again | Disabled while open with focus kept; on release enabled, focus stays, the count line describes it; a Tab stop in both states | L984–L987 / L1035–L1038 |
| Topbar status | From `/app/tasks`: search, then status, then trigger. A 2 px solid ring. Enter and Space each navigate exactly once to the pane (1 push, 1 commit, 1 click, 0 writes). Enter opens the popover and Escape closes it. | L1018–L1035 / L1071–L1088 |

## 5. Key audit (K-1)

- **Keys.** CDP `Input.dispatchKeyEvent` **without** `nativeVirtualKeyCode`. Enter and Space carry `text`; Shift+Tab is Tab with modifier 8.
- **Precondition.** At every document change and at the end, each document's capture-phase key trace must equal the runner's own presses exactly, in order and trusted (`run:keyboard-trace-contains-only-the-runner-key-presses`).

| Run | Checkpoints | Runner presses | Key events received | Expected | Untrusted | Mismatches | Line |
| --- | --- | --- | --- | --- | --- | --- | --- |
| visual EN | 207 | 20 | 40 | 40 | 0 | 0 | L3683 |
| visual ZH | 207 | 20 | 40 | 40 | 0 | 0 | L3683 |
| keyboard EN | 139 | 1,548 | 3,137 | 3,137 | 0 | 0 | L1560 |
| keyboard ZH | 139 | 1,518 | 3,077 | 3,077 | 0 | 0 | L1645 |

## 6. F-APP-3 observation (not gated): Topbar popover options

**Procedure.**
1. A trusted click on the Topbar's own background, then trusted Tab to the trigger. Before this, the window is scrolled to the top by script, because the pet toggle's click had scrolled it at 1024×768.
2. A trusted Enter opens the popover.
3. Trusted Tab walks its seven `menuitemradio` options. Each is captured focused and again after focus moved on, in batch 48's stable, aligned frames.
4. Recorded: its own-region pixel change; the computed outline and background, focused and unfocused; and the modal colour of its interior in both captures, with their contrast ratio.

| Language | Theme | Option | Checked | Focused outline | Background: focused → unfocused | Own pixels changed | Interior contrast, focused vs unfocused |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EN | light | English | yes | `none` | `oklch(0.926895 0.0144913 165)` → the same | **0** / 16,376 | 1.0 |
| EN | light | 中文 | no | `none` | `oklch(0.944095 0.0110933 165)` → transparent | 13,093 / 18,212 | 1.172 |
| EN | light | Light | yes | `none` | the checked tint → the same | **0** / 16,376 | 1.0 |
| EN | light | Dark | no | `none` | the 13% tint → transparent | 13,122 / 16,376 | 1.163 |
| EN | light | System | no | `none` | the same | 13,111 / 18,212 | 1.172 |
| EN | light | Comfortable | yes | `none` | the checked tint → the same | **0** / 16,376 | 1.0 |
| EN | light | Compact | no | `none` | the 13% tint → transparent | 13,091 / 18,212 | 1.163 |
| EN | dark | English | yes | `none` | `oklch(0.305 0.02441 218.95)` → the same | **0** | 1.0 |
| EN | dark | 中文 / Light / System / Compact | no | `none` | `oklch(0.285 0.02149 221.55)` → transparent | 13,103 / 13,107 / 13,124 / 13,110 | 1.213, 1.213, 1.213, 1.21 |
| EN | dark | Dark, Comfortable | yes | `none` | the checked tint → the same | **0**, **0** | 1.0 |
| ZH | light | 中文, 浅色, 舒适 | yes | `none` | `oklch(0.926895 0.0144913 165)` → the same | **0**, **0**, **0** | 1.0 |
| ZH | light | English, 深色, 跟随系统, 紧凑 | no | `none` | `oklch(0.944095 0.0110933 165)` → transparent | 13,065 / 13,076 / 13,083 / 13,072 | 1.172 each |
| ZH | dark | 中文, 深色, 舒适 | yes | `none` | `oklch(0.305 0.02441 218.95)` → the same | **0**, **0**, **0** | 1.0 |
| ZH | dark | English, 浅色, 跟随系统, 紧凑 | no | `none` | `oklch(0.285 0.02149 221.55)` → transparent | 13,071 / 13,073 / 13,087 / 13,082 | 1.213 each |

- **Summary.** In both languages and both themes, all 12 checked options change 0 own pixels when focused. All 16 unchecked options change their whole interior, but only to a faint tint: contrast 1.163–1.213 against unfocused, which is lower than the checked options' own tint against the panel.
- **Computed styles.** `outline-style` is `none` in every state. Chrome reports `outline-width: 3px` and, when focused, `outline-offset: 2px` from the global rule, but neither is painted.
- **Records.** Rows are `observation` records. Tables: EN L1555 (summary L1556), ZH L1640 (summary L1641).
- **Screenshots.** For each language and theme: the panel with the checked option focused, the panel with the unchecked option focused, and both options' clip pairs (§12 #85–#96 EN, #143–#154 ZH).
- **This matches the controller's F-APP-3 description.** `layout.css:453–457` gives `.topbar-pref-option:focus-visible` `outline: none` and a 13% tint. The later `[aria-checked="true"]` rule at `:459–463`, of equal specificity, sets the 17% checked tint and wins on a checked option.
- **Scope.** The popover is protected, unchanged chrome under contract lines 193, 858, 888 and 1214. This is therefore evidence for the UX-05 follow-up only. It is not gated, and the stop rule does not apply.

## 7. Trusted input, runtime errors, dialogs, network

- **Input:** every user-facing activation is a trusted CDP mouse or key event. Script actions are listed in §14.
- **Runtime errors: 0 in all four runs.** This counts CDP exceptions, `console.error`/`console.assert` and renderer crashes, and includes the 5cd63ff reference documents (`run:runtime-errors-zero`: visual L3687, keyboard EN L1564, ZH L1649).
- **Console warnings: 0 in all four runs.**
- **Dialogs, all planned and consumed** (`run:no-unexpected-javascript-dialogs`, `run:every-planned-dialog-consumed`):
  - visual: 26 per language (§3.9);
  - keyboard: 9 per language. These are 3 reset confirmations (decline, accept, accept) and 6 runner-initiated `beforeunload` prompts: after the drafts walk, the partial reset, two Retry all cases, the Topbar status case and `sel-dark-failed`.
- **Network:** visual 207 and keyboard 139 checkpoints. 0 attempts beyond the local origin and 0 non-local; the prelude's self-test probe was counted separately (1).

## 8. Provenance

| Item | Fixed (`419e56d`) | 5cd63ff (references) |
| --- | --- | --- |
| Bundle inputs | 1,017: 625 archive-relative, 390 third-party, the `define` and the fixture. **0 foreign.** | 1,013: 621, 390 and 2. **0 foreign.** |
| `@repo/*` pinned to the archive | 320, **0 guard violations** | 320, **0 violations** |
| Required modules from the archive | 39 of 39. Every required module outside the 26-file delta is byte-identical to 5cd63ff (L4). | 36 of 36 |
| Bundle SHA-256 (js / css), identical in all four runs | `be14eb3167c65fe2a2388658aea671311035f896f41e4840eac810d53fa590b5` / `60ce850af515c4af4a4862135fb68940f7373193a8c30485ef98d0ab23bef937` | `5c580ca74f6ded08ca50fc143481588a259e5d99887b1513b6788386b8753b4f` / `7682f7e81ef51e3808d33c3647b40ebd7b43cebc56fa4244a4674288c23c5dc6` |

**The only synthetic input is the auth session.** The fixture's `WebAuthSessionProvider` gets a client whose `auth.getSession` resolves one session for `appearance-native-A`. The real `AccountDataGate` activates generation `g1`.

**Instruments:**
- the batch 45 prelude, self-test passed (visual L44, keyboard L21);
- the batch 46 probes (colour self-test visual L46, keyboard L23);
- batch 48's page helper `__b48` and this copy's `__b50` (a JS global only: pane selection state, computed style facts, canvas colour conversion, the popover box; no DOM change);
- the cascade audit's temporarily adopted stylesheets, removed afterwards.

## 9. The runner copy: what changed against the batch 48 runner

`verify-visual-keyboard-419e56d.diff` is the full unified diff: 502 insertions and 9 deletions in 20 hunks. **Exactly 9 lines of the batch 48 runner change, and every one is SHA-specific:**

| Changed line(s) | Why |
| --- | --- |
| Usage path; `RUNNER` name | The copy's own file name |
| `EXPECTED_FIXED_DELTA` comment (2 lines) and the precondition label `baseline:fixed-delta-is-exactly-the-26-files-…` | 26 files relative to 5cd63ff; the list itself only gains `AppearancePane.selected-focus.test.tsx` (an inserted line) |
| `kbFocusVisibility` labels `5bbf473` → `419e56d` (4 lines) | The fixed revision's label in check IDs, screenshot names and states |

**Everything else is inserted. No batch 48 check is removed or weakened.** The insertions are needed because batch 50 requires evidence the batch 48 runner did not produce: selection walks in both themes, the selection ring, and the F-APP-3 observation.
1. A new header block describing this copy. The batch 46 and 48 header blocks are kept, apart from the usage line above.
2. A hash check of the batch 48 runner (the diff base), and the product increments over 24073b5 and 5bbf473 (`baseline-batch50`, L16–L18).
3. Progress lines on stderr at section boundaries (the logs are unchanged), so no run is silent for minutes.
4. E14: the focus-rule audit (§3.6) and the clean-state Topbar comparison with 5cd63ff (§3.5).
5. E15: the selection walks, the selected-swatch ring section, and the `unzoomed` precondition and page helper they use (§4.2, §4.3).
6. The F-APP-3 observation (§6).

The batch 48 additions (the `captureClip` page-coordinate fix, the per-stop pixel oracle, the stable-frame rule, the reproduction section and the cascade audit) are inherited unchanged.

## 10. Requirement checklist (batch 50 task §2)

| Requirement | Where | Result |
| --- | --- | --- |
| E14 five widths, EN and ZH, viewport heights recorded | §1, §3.1 | PASS |
| Pet hidden: centre hit after scroll, uncovered, containment, no horizontal scroll (EN 375 overflow gone), 44×44 per the ruling | §3.1, §3.5 | PASS |
| Pet shown: the R-PET run | §3.3 | PASS (no control covered) |
| Topbar containment with the status; 767 and 768 probes | §3.4 | PASS |
| Selector audit with both focus rules and the disabled declarations; cascade-order audit | §3.6, §3.7 | PASS |
| A2.8 gate at five widths in the all-seven, partial-reset, partial-pass (enabled), clean, source-only (disabled) states and the 768 open pass | §3.2 | PASS |
| Disabled presentation: contrast in both themes × six tones, accent independence, distinction, focus ring, attributes | §3.8 | PASS |
| §9 screenshots reviewed | §12 | 154 of 154 reviewed |
| E15 §9 keyboard and Retry all requirements | §4.1, §4.5 | PASS |
| Per-stop pixel walks over non-default selections of every group, both sliders, the clean, failed-write and source states, the Topbar status, light and dark | §4.2 | PASS (1,000 stop captures) |
| Selected swatch: focused+selected ≠ selected+unfocused; the selection ring stays visible | §4.3 | PASS |
| F-APP-3 observation frozen | §6 | recorded, not gated |

## 11. Diagnostic iterations, development probes, main checkout

**Diagnostic iterations:** visual-en, visual-zh, keyboard-en and keyboard-zh 1 of 3 each (`fixed1`).

**Overwrite refusal.** After the committed runs, rerunning each mode with `fixed1` stopped with `Evidence exists; use a distinct suffix` (exit 1) before anything was written. The logs' hashes are unchanged.

**Development probes** came first, as harness development (batch 39 ruling 1). They wrote only to the session scratchpad through `XAI_NATIVE_EVIDENCE_DIR`, which the runner refuses inside the repository. Some used `XAI_VK_SECTIONS` or `XAI_VK_WIDTHS`, which are also refused for repository evidence. None is committed.

| Probe | Mode and sections | Result | Change that followed (harness only) |
| --- | --- | --- | --- |
| dev1 | keyboard-en, the three new sections | The 5 selection walks passed (0 failed stops); the selected-swatch ring passed. A harness stop in the F-APP-3 section: `topbar-background-point`, because the pet toggle's click had scrolled the 1024×768 window and the Topbar was out of view. | Scroll the window to the top (script) before the Topbar background click. The ring bands were narrowed to their anti-aliasing-free cores: the 0.5–1.5 px band measured 0.84–0.86 because of subpixel anti-aliasing at its edges. |
| dev2 | visual-en `css`, `before`, `states` at 375 | PASS (621 checks); the new E14 checks work | — |
| dev3 | keyboard-en `swatch-ring`, `popover-focus` | PASS | — |
| dev4 | keyboard-zh, the three new sections | Harness stop in batch 48's own clip-coordinate self-test. It ran in the first selection walk because the probe skipped the frozen walks. | Investigated in dev5–dev8 |
| dev5 | keyboard-zh `selection-walks` with a temporary debug record | The visual viewport was zoomed: `visualViewport.scale` 1.0027778, width 373.96 of 375. Full-viewport and clip captures of the same region differ (1,411 px); clip vs clip and full vs full are identical. | — |
| dev6 | the same, with temporary scale records | The zoom is already present after mount and the pet toggle | — |
| dev7 | the same, with a temporary loop over single seeded values | Only `xai_rail_pos` = `top` triggers it, and only through `petOff`'s 375 → 1440 → 375 viewport round trip (scale 1 at mount) | — |
| dev8 | the same, with the four sidebar positions and CDP `Emulation.resetPageScaleFactor` | `right`, `bottom` and `left` do not trigger it; the reset does not clear it | All temporary code removed. `sel-light-a` stores the default sidebar and selects Top by a trusted click once the pet is hidden: a successful autosave, so the state stays clean. Every new section gates on an `unzoomed` precondition (scale 1, full width). |
| dev9 | keyboard-zh, the three new sections | PASS (507 checks) | — |
| dev10 | keyboard-en `selection-walks` | PASS | — |
| dev11, dev12 | visual-en, visual-zh (all) | PASS, 3,437 checks each | — |
| dev13, dev14 | keyboard-en, keyboard-zh (all) | PASS, 1,398 and 1,468 checks | — |

dev9–dev14 ran the committed runner (`d5fc3262…`, recorded in their baselines), which also produced the four evidence logs (L9).

**Main-checkout check.** A read-only mtime scan with the batch 46 scope:
- the top level (`.git` and `.claude` excluded);
- `node_modules` and `apps/web/node_modules` to depth 2;
- `apps` and `packages` to depth 3;
- `docs` to depth 2.

It examined 3,808 entries against a marker stamped in the session scratchpad at 2026-10-05T18:31:05Z, before any probe. It found **0** newer entries both before the probes and after all runs (19:31:20Z).

## 12. Screenshot review (all 154 opened and inspected)

**Method.**
- Full-page and viewport captures were opened at native size, scaled to fit.
- Small clips were reviewed in composites built in the scratchpad (not committed): each pair upscaled 2–6× with nearest-neighbour scaling, side by side with a difference map. Row and panel images were stacked at native size.
- The criteria: no overlap, clipping or broken rendering; CJK renders; caller controls contained and clear of the pet; and, for focus clips, a visible indicator on the focused control.

Hashes are the on-disk SHA-256 and equal the log records. Lines are the `screenshot` records. Names omit the `native-419e56d-fixed1-<mode>-` prefix.

| # | Mode | File | Size | Line | SHA-256 | Review |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | visual-en | `768-pet-on-before-5cd63ff-top.png` | 768×1024 | L96 | `73ab5f7a57102c9717e842a84928405173e912ae778b8f86249f664bd9553aad` | 5cd63ff clean at 768×1024, pet on, scroller at the top: the pet sits over the right part of the sticky "Save & apply"; centre covered (H14 b), equal to the frozen E4 box. |
| 2 | visual-en | `768-pet-on-before-5cd63ff-end.png` | 768×1024 | L100 | `ae9fdc8beeae4721fc2f886c1333d56f97befd0f95116439a8ff7c82a963312a` | 5cd63ff at the end of the range: the pet covers the right half of "Save & apply"; "Reset to defaults" uncovered (H14 b). |
| 3 | visual-en | `375-clean-retry-all-disabled-focused.png` | 375×812 | L223 | `b807a324ec0538468ed0f6281429a90845f22080e089515d1276ed68b903c4c0` | Clean at 375: Retry all grey and legible with the 2 px accent focus ring; "Reset to defaults" alone below; empty status line; no failure or success cue. |
| 4 | visual-en | `375-all-seven.png` | 375×2409 | L421 | `c8e06451ff1a00c4effe1846ee0a73add0664c24dc73bd2cf12096020d769d70` | Full pane at 375: seven recovery blocks with Retry/Discard, "7 appearance changes are not saved.", Retry all first (enabled), Export, Discard all, "Reset to defaults" alone; palette in three columns, no overflow, nothing clipped. |
| 5 | visual-en | `375-partial-reset.png` | 375×1860 | L514 | `8bc2fa37619429bb234c13b596bd8f033657661be5d2f74e9f520a5761ed6d5e` | Two "not reset to its default" blocks (Theme, Background palette), "2 appearance changes are not saved.", Retry all enabled first, "Reset to defaults" alone. |
| 6 | visual-en | `375-partial-pass.png` | 375×1727 | L614 | `385c14adae099880f796d441525faae0cc67de0c7422965621858653c1139f7d` | One Accent color block, "1 appearance change is not saved.", Retry all enabled first, "Reset to defaults" alone. |
| 7 | visual-en | `375-topbar-status-tasks.png` | 375×812 | L690 | `b6b5aa20544b8a6ce2ef32bd15600c409bb624acdf4a9211a0e171b4a3e6c040` | /app/tasks in dark (the failed Topbar dark choice stays applied); Topbar: search, status icon-only 44×44, trigger. The Tasks page's own save-failure banner is the pre-existing, unrelated condition of batch 39 ruling 5. |
| 8 | visual-en | `375-topbar-status-pane.png` | 375×812 | L738 | `77f151f2d0566d47a2e9e257688f676b807bc4843f82700dc32ed014302f605a` | Pane in dark at the end of the range: "1 appearance change is not saved.", Retry all enabled first, Export, Discard all, "Reset to defaults" alone; status icon in the Topbar. |
| 9 | visual-en | `414-all-seven.png` | 414×2425 | L1018 | `9e8f6f36c38c84292ce024778c9ab74606ddbf5811385ee34e936186c418ce98` | Full pane at 414: seven blocks, "7 appearance changes are not saved.", the action group, "Reset to defaults" alone; contained, no clipping. |
| 10 | visual-en | `768-pet-on-clean-end.png` | 768×1024 | L1357 | `dccfebba7bb0bd76d5ba7e06f6d3b11fff93baf7d916a27451b9e7d7b83885a5` | Clean, pet on, end of range: disabled Retry all and "Reset to defaults" at the inline start, far from the pet in the corner. |
| 11 | visual-en | `768-pet-on-all-seven-end.png` | 768×1024 | L1546 | `cb5bf8327f112bf0e91d5e77c00b42425028c9eceffb63b1e5a92ca1e1a4a832` | All seven, pet on, end of range: "Not saved" text in the Topbar; the action row on one line, clear of the pet. The ring on the Font scale slider is the keyboard focus left by the setup (the F-APP-1 ring). |
| 12 | visual-en | `768-all-seven.png` | 768×2264 | L1597 | `605aaccc692d584b4d99837e635e89d0ce8f2efdac1072b30f8bccc6110c21d9` | Full pane at 768: seven blocks, one action row, "Reset to defaults" alone; contained. |
| 13 | visual-en | `1024-all-seven.png` | 1024×1946 | L2267 | `520491218ee4abe79106110c49d91604f24e12cf5e4d79c9e953ff8c424d9e6f` | Full pane at 1024 (two-column settings): every block inside the detail column, action row, "Reset to defaults" alone. |
| 14 | visual-en | `1440-clean-retry-all-disabled-focused.png` | 1440×900 | L2665 | `9d73cdb446b6d20fe5ac189ea1de49ed714611f42dd510e273e7d77424d9c5e2` | Clean at 1440: disabled Retry all with the focus ring, "Reset to defaults" below; no Topbar status; summary "EN · Light · Comfortable". |
| 15 | visual-en | `1440-all-seven.png` | 1440×1935 | L2859 | `52e42be75f78c025adba514dcb2890c166f2947029a54cc4dace3e05fe320d56` | Full pane at 1440: complete and contained. |
| 16 | visual-en | `1440-topbar-status-tasks.png` | 1440×900 | L3110 | `b1ca2e9bffb7a531ffc06930c8dbbfd7579b131cd8cd93dece3366b796a8b2df` | /app/tasks in dark: status "Not saved" with icon and text immediately before the trigger; the pre-existing Tasks banner is unrelated. |
| 17 | visual-en | `1440-topbar-status-pane.png` | 1440×900 | L3158 | `24bfb64b39de925eea77d7b59aae3af13f58b90d9f9cb87f1b5e47f6b6da2c26` | Pane in dark: "1 appearance change is not saved.", Retry all enabled first; Topbar status with text. |
| 18 | visual-en | `767-topbar-status-breakpoint.png` | 767×60 | L3219 | `aa9481f8fe77b7722aa35ed597c2fbd4bb54e07d008cb3f5147b476e87ce7514` | Topbar at 767: status icon-only (44×44), trigger icon-only, summary hidden. |
| 19 | visual-en | `768-topbar-status-breakpoint.png` | 768×60 | L3228 | `c21876e6389749339060ce699837060e34b493884762b9407e2ef9d184cf8299` | Topbar at 768: status text and summary visible (the summary's truncation is the same at 5cd63ff). |
| 20 | visual-zh | `768-pet-on-before-5cd63ff-top.png` | 768×1024 | L96 | `68070535614aebae5f4df2ed0bd838e18f19f16c1bf38ae7abcdc06e284c7a58` | 5cd63ff clean at 768×1024, pet on, scroller at the top: the pet sits over the right part of the sticky "保存生效"; centre covered (H14 b), equal to the frozen E4 box. |
| 21 | visual-zh | `768-pet-on-before-5cd63ff-end.png` | 768×1024 | L100 | `f825d6b58497369e5862a428f35630e7f72e103242204293d06c62fe4094f6bd` | 5cd63ff at the end of the range: the pet covers the right half of "保存生效"; "恢复默认" uncovered (H14 b). |
| 22 | visual-zh | `375-clean-retry-all-disabled-focused.png` | 375×812 | L223 | `a11438e1245468dc55cdaa1383ad91ede324aa7766542ce876e5663987afcbcb` | Clean at 375: 全部重试 grey and legible with the 2 px accent focus ring; "恢复默认" alone below; empty status line; no failure or success cue. |
| 23 | visual-zh | `375-all-seven.png` | 375×2389 | L421 | `ebb298ae2f064a4967fc5b6d6035b827cede332d8024533d05dadb6d0c22a932` | Full pane at 375: seven recovery blocks with Retry/Discard, "7 项外观更改未保存。", 全部重试 first (enabled), Export, Discard all, "恢复默认" alone; palette in three columns, no overflow, nothing clipped. |
| 24 | visual-zh | `375-partial-reset.png` | 375×1821 | L514 | `11bf7139b41d3950a591448a0b85279b739e3f145a2228d964ed5aa9f57f7bdd` | Two "not reset to its default" blocks (Theme, Background palette), "2 项外观更改未保存。", 全部重试 enabled first, "恢复默认" alone. |
| 25 | visual-zh | `375-partial-pass.png` | 375×1708 | L614 | `4ed72af642976f63e913e6a11f8d8ab827b04043a3ee5479f6a25b66115f5411` | One Accent color block, "1 项外观更改未保存。", 全部重试 enabled first, "恢复默认" alone. |
| 26 | visual-zh | `375-topbar-status-tasks.png` | 375×812 | L690 | `b8b86e2127d2931e8fcec2a9855e42d22de8ea54dec2beff0df13f1f5056929a` | /app/tasks in dark (the failed Topbar dark choice stays applied); Topbar: search, status icon-only 44×44, trigger. The Tasks page's own save-failure banner is the pre-existing, unrelated condition of batch 39 ruling 5. |
| 27 | visual-zh | `375-topbar-status-pane.png` | 375×812 | L738 | `d62b9ba3a1b98cc771c12f97e492ee07e54fb622f44570deca548e2450aea585` | Pane in dark at the end of the range: "1 项外观更改未保存。", 全部重试 enabled first, Export, Discard all, "恢复默认" alone; status icon in the Topbar. |
| 28 | visual-zh | `414-all-seven.png` | 414×2353 | L1018 | `2463d03d5f4e81934ddbcf18b218c78deb48d98d4a4893d37753544e3c8bb7f2` | Full pane at 414: seven blocks, "7 项外观更改未保存。", the action group, "恢复默认" alone; contained, no clipping. |
| 29 | visual-zh | `768-pet-on-clean-end.png` | 768×1024 | L1357 | `a058ea9190fa4190721a7a365a772c07138a994384aee85eec7ea4f0a5006cbb` | Clean, pet on, end of range: disabled 全部重试 and "恢复默认" at the inline start, far from the pet in the corner. |
| 30 | visual-zh | `768-pet-on-all-seven-end.png` | 768×1024 | L1546 | `707df8e944335f633573b445cd7feb8d5d57820f2f720bcb2748a16b2140de0e` | All seven, pet on, end of range: "未保存" text in the Topbar; the action row on one line, clear of the pet. The ring on the Font scale slider is the keyboard focus left by the setup (the F-APP-1 ring). |
| 31 | visual-zh | `768-all-seven.png` | 768×2264 | L1597 | `02da234cd4c8ebfaf98624ddaccf181d88c5a640eddf09d1104032a9eb757b66` | Full pane at 768: seven blocks, one action row, "恢复默认" alone; contained. |
| 32 | visual-zh | `1024-all-seven.png` | 1024×1935 | L2267 | `b7b07a503cb72ba1cb7a51735c0f75c75800f5fc69eb25b8bafbd8b5196b2a12` | Full pane at 1024 (two-column settings): every block inside the detail column, action row, "恢复默认" alone. |
| 33 | visual-zh | `1440-clean-retry-all-disabled-focused.png` | 1440×900 | L2665 | `b42cf14f1346b409fd80a12f3763f08fec5a4c3ed7264f4242feea476ad8b430` | Clean at 1440: disabled 全部重试 with the focus ring, "恢复默认" below; no Topbar status; summary "中文 · 浅色 · 舒适". |
| 34 | visual-zh | `1440-all-seven.png` | 1440×1935 | L2859 | `02a0dd329110dc73845648e19bcfed4c66e869160808def8c320df943ebceaf9` | Full pane at 1440: complete and contained. |
| 35 | visual-zh | `1440-topbar-status-tasks.png` | 1440×900 | L3110 | `46839106d01d09436dc0bffdc34292d7474e48dd5ddd8b8010ca497eded91aff` | /app/tasks in dark: status "未保存" with icon and text immediately before the trigger; the pre-existing Tasks banner is unrelated. |
| 36 | visual-zh | `1440-topbar-status-pane.png` | 1440×900 | L3158 | `abd773ebdeba358e51b4ffe775ad5b943fc64e8a910fc5c3fa34dbeba777cbb3` | Pane in dark: "1 项外观更改未保存。", 全部重试 enabled first; Topbar status with text. |
| 37 | visual-zh | `767-topbar-status-breakpoint.png` | 767×60 | L3219 | `c2df5d00c817a5767313ec8696149c0374293957d656a799f6f266af0f2fab94` | Topbar at 767: status icon-only (44×44), trigger icon-only, summary hidden. |
| 38 | visual-zh | `768-topbar-status-breakpoint.png` | 768×60 | L3228 | `2ed9edd10c8b6cd1417ce9cae1e8717032f1c3aa345d491fb17cd38943fd701c` | Topbar at 768: status text and summary visible. |
| 39 | keyboard-en | `419e56d-hue-slider-focused.png` | 180×28 | L43 | `c148a9e2ef0470ec85857d9e60ad44773f3dd26cfa48a77bde7e20126c4d96ac` | Hue track inside the 2 px accent ring. Focus visible. |
| 40 | keyboard-en | `419e56d-hue-slider-focused-row.png` | 624×107 | L45 | `c99eb4519145b628ce7a90443f9f98c0f6f38aa4df902cecb279286e24429a7b` | Accent color row: swatches (Sage selected), ringed hue track, 165°. |
| 41 | keyboard-en | `419e56d-hue-slider-unfocused.png` | 180×28 | L48 | `065dff6b8e7d30d34ec8a12d03c181e4298176deb864cc49312eedd174cb37eb` | The same track, no ring. |
| 42 | keyboard-en | `419e56d-font-slider-focused.png` | 173×24 | L55 | `62f79bd03edcf94cb33a79161a33fb45e26cf567ad59cb8795d3a3ba84620fa5` | Font scale track inside the accent ring (F-APP-1). Focus visible; the batch 48 hash. |
| 43 | keyboard-en | `419e56d-font-slider-focused-row.png` | 624×89 | L57 | `2f54bcdca7a3d255ef379b114556bdad1e8dfc540b4cb33bc783ae1f1b206fd0` | Font scale row with the ringed track, 100%. |
| 44 | keyboard-en | `419e56d-font-slider-unfocused.png` | 173×24 | L60 | `6ad3f2c8e99258bad51e4b8125ad9b29752a7ff4ac4ac0f217c3bdd2cea05803` | The plain track; the batch 48 hash. |
| 45 | keyboard-en | `before-5cd63ff-hue-slider-focused.png` | 180×28 | L82 | `121b887475fa007ea5c2d360b0d9c926c4c4a558e0d58e6a8f5ee954d21e26d3` | 5cd63ff: ringed hue track. |
| 46 | keyboard-en | `before-5cd63ff-hue-slider-focused-row.png` | 624×107 | L84 | `e0d08ea0f966a9caea7d2f84eb806e74d37e41370be311e8083b571ef7cdd6d6` | 5cd63ff Accent color row with the ringed track. |
| 47 | keyboard-en | `before-5cd63ff-hue-slider-unfocused.png` | 180×28 | L87 | `44656b7b8fbb2f733f37eb516b175033466564196ae883f11ae71078b8097a19` | 5cd63ff: no ring. |
| 48 | keyboard-en | `before-5cd63ff-font-slider-focused.png` | 173×24 | L94 | `3a90a4773e80d89b51ab2d424d495c45a416a906c57f1160450deb66c8685616` | 5cd63ff: no ring; byte-identical to the unfocused clip (the frozen batch 46 hash). |
| 49 | keyboard-en | `before-5cd63ff-font-slider-focused-row.png` | 624×89 | L96 | `38a2cb5672a4679ac5ab97abea3215eed7c0575f3436cc6f30d265038675d4a1` | 5cd63ff Font scale row: focused slider without any indicator. |
| 50 | keyboard-en | `before-5cd63ff-font-slider-unfocused.png` | 173×24 | L99 | `3a90a4773e80d89b51ab2d424d495c45a416a906c57f1160450deb66c8685616` | Identical to the focused clip: the F-APP-1 state at 5cd63ff. |
| 51 | keyboard-en | `swatch-419e56d-swatch-0-focused.png` | 52×53 | L126 | `efa3b968320eef41e6f788cd7c4bfc9684fbc5cf3b7f7aac807bb26c2d51964f` | Selected Sage focused: the 2 px selection ring hugging the swatch and the global ring outside it. F-APP-2 repaired. |
| 52 | keyboard-en | `swatch-419e56d-swatch-0-focused-row.png` | 624×107 | L128 | `24854c20aa1409ee0584d5310a5ca1ee508e9eb260f6b84ceaea7a070380ddcf` | Row: the focused selected Sage is clearly distinct from the unfocused selection look. |
| 53 | keyboard-en | `swatch-419e56d-swatch-0-focus-moved-back.png` | 52×53 | L130 | `22ae3bab7cb9ad2b21cd0caac4d33312b0c5d22e8f8b766b3c78dda87ff23d9c` | Selected Sage unfocused: the selection outline only. |
| 54 | keyboard-en | `swatch-419e56d-swatch-1-focused.png` | 52×53 | L140 | `a450127b738d77b9af8f2e9bd334f7e13bdfaf7541bed45b0589493fdf66743e` | Non-selected Ocean with the global focus ring (positive control). |
| 55 | keyboard-en | `swatch-419e56d-swatch-1-focused-row.png` | 624×107 | L142 | `e8e951013732bf1af3efaad01fd6e1de9e85fc4e4e1e38576c26c0aa399abf58` | Sage selected, Ocean focused. |
| 56 | keyboard-en | `swatch-419e56d-swatch-1-focus-moved-back.png` | 52×53 | L144 | `e2048ed25a8d7f084f9ff862afa5f30728c422e16bcdd9746414ecce81a05472` | Ocean with its thin border only. |
| 57 | keyboard-en | `swatch-419e56d-accent-230-swatch-1-focused.png` | 52×53 | L170 | `40366c16ef906fc33af7524a33b22b994042ebd7185cfa8274efa97b31700945` | Selected Ocean (accent 230) focused: selection ring plus the outer blue-tinted ring. |
| 58 | keyboard-en | `swatch-419e56d-accent-230-swatch-1-focused-row.png` | 624×107 | L172 | `879a7916bb99c30a03bf2920a1c5347a83dda005a6fe0cd8e6282b4d0ecccabb` | Row at 230°: the focused selected Ocean is distinct. |
| 59 | keyboard-en | `swatch-419e56d-accent-230-swatch-1-focus-moved-back.png` | 52×53 | L174 | `54858f2b20b98e4d606dba8f7e17c9746ee776cce5e5aa177db360116c2988a2` | Selected Ocean unfocused: selection ring only. |
| 60 | keyboard-en | `swatch-419e56d-accent-230-swatch-2-focused.png` | 52×53 | L184 | `89ba207537da902705cdccdf1bfe1fb4822dc42a88714d53f11cc9f2dc19cb52` | Sunset with the focus ring (positive control). |
| 61 | keyboard-en | `swatch-419e56d-accent-230-swatch-2-focused-row.png` | 624×107 | L186 | `477bc9a3a94b7046bfe3508b2bf2db82cf78072cd1f4eeed113ee1fc61fcf467` | Ocean selected, Sunset focused. |
| 62 | keyboard-en | `swatch-419e56d-accent-230-swatch-2-focus-moved-back.png` | 52×53 | L188 | `eef15f6ebf217a25810eca06aaac0b58af3012c909a89642ed255ddb47265387` | Sunset with its border only. |
| 63 | keyboard-en | `swatch-before-5cd63ff-swatch-0-focused.png` | 52×53 | L214 | `a9a8821fba60f6d89ce5251b77883d81e2d08e8d9e643574ac7a9b3895126173` | 5cd63ff selected Sage focused: selection ring only, no focus cue (batch 48's frozen hash). |
| 64 | keyboard-en | `swatch-before-5cd63ff-swatch-0-focused-row.png` | 624×107 | L216 | `5267b69f67151c0ad3ac2ee749ed4e3ed94ed3046c38297923665ea1a5078bf6` | 5cd63ff row: the focused selected Sage looks unfocused. |
| 65 | keyboard-en | `swatch-before-5cd63ff-swatch-0-focus-moved-back.png` | 52×53 | L218 | `a9a8821fba60f6d89ce5251b77883d81e2d08e8d9e643574ac7a9b3895126173` | Byte-identical to the focused clip: the pre-existing F-APP-2 state. |
| 66 | keyboard-en | `swatch-before-5cd63ff-swatch-1-focused.png` | 52×53 | L228 | `915430a6c6a25440c793a69d9c6ea7ecb743ccbb955243f17da749816acc5bde` | 5cd63ff non-selected Ocean with the focus ring. |
| 67 | keyboard-en | `swatch-before-5cd63ff-swatch-1-focused-row.png` | 624×107 | L230 | `b79eefea5307534265d263c51dffa4d275571c864e8dae6ca0be09a77d676057` | 5cd63ff row: Sage selected, Ocean focused. |
| 68 | keyboard-en | `swatch-before-5cd63ff-swatch-1-focus-moved-back.png` | 52×53 | L232 | `fb6da820f2a76e231ed8820c91d5ce5e11f216466d22899c2fa72d3d198cd91c` | 5cd63ff Ocean with its border only. |
| 69 | keyboard-en | `selring-light-swatch-0-focused.png` | 52×53 | L1314 | `efa3b968320eef41e6f788cd7c4bfc9684fbc5cf3b7f7aac807bb26c2d51964f` | Light, selected Sage focused: the dark 2 px selection ring hugs the swatch; the global ring sits 2 px further out. |
| 70 | keyboard-en | `selring-light-swatch-0-focused-row.png` | 624×107 | L1316 | `24854c20aa1409ee0584d5310a5ca1ee508e9eb260f6b84ceaea7a070380ddcf` | Light Accent color row with the focused selected Sage; selection still evident. |
| 71 | keyboard-en | `selring-light-swatch-0-unfocused.png` | 52×53 | L1318 | `22ae3bab7cb9ad2b21cd0caac4d33312b0c5d22e8f8b766b3c78dda87ff23d9c` | Light, selected Sage unfocused: the dark selection outline only. |
| 72 | keyboard-en | `selring-light-swatch-0-control-swatch-1-focused.png` | 52×53 | L1320 | `b3ba0ad4b6da6169a489bc4ac8188ec5c86952a12dc53c2d8380a7a37a5c11f4` | Control: focused non-selected Ocean shows only the global ring; nothing hugs the swatch. |
| 73 | keyboard-en | `selring-light-swatch-4-focused.png` | 52×53 | L1355 | `43048bfd836106e4f9f90a7751f7a566477c728bb26478ad151c4ed46a2849bd` | Light, selected Violet (295) focused: the dark 2 px selection ring hugs the swatch; the global ring sits 2 px further out. |
| 74 | keyboard-en | `selring-light-swatch-4-focused-row.png` | 624×107 | L1357 | `3d3c8682f401bba3a7d7f3454a076b2fa3518330fb662ef5abb4a89f20e46356` | Light Accent color row with the focused selected Violet (295); selection still evident. |
| 75 | keyboard-en | `selring-light-swatch-4-unfocused.png` | 52×53 | L1359 | `f2886e577638542624fe54479bdd7cf297d2df957c7694d2b7bd4637748abe69` | Light, selected Violet (295) unfocused: the dark selection outline only. |
| 76 | keyboard-en | `selring-light-swatch-4-control-swatch-5-focused.png` | 52×53 | L1361 | `dd4aa3ebc082ffd961836716aaf769c5fa7b199a6a6530495607a2f5aa349a54` | Control: focused non-selected Amber shows only the global ring; nothing hugs the swatch. |
| 77 | keyboard-en | `selring-dark-swatch-1-focused.png` | 52×53 | L1396 | `4f56d72b561fe669791b74d32af1600ef080f03bd18aa809b75d25157fd90f05` | Dark, selected Ocean (230) focused: the white 2 px selection ring hugs the swatch; the global ring sits 2 px further out. |
| 78 | keyboard-en | `selring-dark-swatch-1-focused-row.png` | 624×107 | L1398 | `e1ecad6d6c98e08d43db9e3c9bba775354a5d02a383a2496e18e60fc93eb5976` | Dark Accent color row with the focused selected Ocean (230); selection still evident. |
| 79 | keyboard-en | `selring-dark-swatch-1-unfocused.png` | 52×53 | L1400 | `375bf40e5b9dad866096e73d29e4dbfbdead51f32ee833f731975ed969577d18` | Dark, selected Ocean (230) unfocused: the white selection outline only. |
| 80 | keyboard-en | `selring-dark-swatch-1-control-swatch-2-focused.png` | 52×53 | L1402 | `e0812c5473ad360f3226b220136e6c9ef39bf70efd5732e901a1d1c8d2cf9b60` | Control: focused non-selected Sunset shows only the global ring; nothing hugs the swatch. |
| 81 | keyboard-en | `selring-dark-swatch-0-focused.png` | 52×53 | L1437 | `49db5dab03514e7dd585aa47072a71999b8701d333947747526d475679fd582d` | Dark, selected Sage focused: the white 2 px selection ring hugs the swatch; the global ring sits 2 px further out. |
| 82 | keyboard-en | `selring-dark-swatch-0-focused-row.png` | 624×107 | L1439 | `6bc41df476b371ceb2d7f5978269687deafdb346bae4d679c704881cc8e8d94d` | Dark Accent color row with the focused selected Sage; selection still evident. |
| 83 | keyboard-en | `selring-dark-swatch-0-unfocused.png` | 52×53 | L1441 | `ec04834ae4b0d26249775808401a2d9b6efdba840410dee8e110b5fdde56c258` | Dark, selected Sage unfocused: the white selection outline only. |
| 84 | keyboard-en | `selring-dark-swatch-0-control-swatch-1-focused.png` | 52×53 | L1443 | `b7ac86ca9e455a1425d9f3638e2f4930337954205fa65609b6cf468673379fa7` | Control: focused non-selected Ocean shows only the global ring; nothing hugs the swatch. |
| 85 | keyboard-en | `popover-light-checked-focused-panel.png` | 342×571 | L1480 | `5cc402769161f689478b631acda51db08277f44dc05898de981cc76a34981c30` | F-APP-3, light theme: the popover with the checked Theme option "Light" focused; it is indistinguishable from the other checked options (no outline, same tint). |
| 86 | keyboard-en | `popover-light-checked-option-focused.png` | 320×65 | L1483 | `7cb2c7098c24c38329490fc1ccf9a302052d3e9938457b15b2047609277d6b69` | Checked "Light" focused: checked tint and check mark only; no focus cue. |
| 87 | keyboard-en | `popover-light-checked-option-moved-on.png` | 320×65 | L1485 | `8455d71cfd7f6f5ec2cad49c93224ed489a3a8033aac612806658d873c2d62b9` | Checked "Light" after focus moved on: its own pixels are identical; only the next option's tint shows at the clip's lower edge. |
| 88 | keyboard-en | `popover-light-unchecked-focused-panel.png` | 342×571 | L1488 | `9d9415592472bd62c02275e39bcc47f2cb32466cd93e297df1ade51e9b74efbd` | F-APP-3, light theme: the unchecked "Dark" focused shows only a faint tint, close to the checked options' tint but without the check. |
| 89 | keyboard-en | `popover-light-unchecked-option-focused.png` | 320×65 | L1491 | `598beb4b400a979a6d024b502ed7916bc5aeb2c8c13dbfb671dbbca7ce0e4c07` | Unchecked "Dark" focused: faint tint, no outline. |
| 90 | keyboard-en | `popover-light-unchecked-option-moved-on.png` | 320×65 | L1493 | `ff2a05f06c3e53c1c2d96be37e9049d1e921e6f09ecc95630d57dafa35ba66dc` | Unchecked "Dark" unfocused: no tint. |
| 91 | keyboard-en | `popover-dark-checked-focused-panel.png` | 342×571 | L1534 | `f4292e5cccd1c23abf3e5677a031c3b07e4e678bc028949ee6b294016d0398ce` | F-APP-3, dark theme: the popover with the checked Theme option "Dark" focused; it is indistinguishable from the other checked options (no outline, same tint). |
| 92 | keyboard-en | `popover-dark-checked-option-focused.png` | 320×65 | L1537 | `fc2409958e5b61a43ebf43be44fd5fc8d5395e3d160da642d66d5649e22bf435` | Checked "Dark" focused: checked tint and check mark only; no focus cue. |
| 93 | keyboard-en | `popover-dark-checked-option-moved-on.png` | 320×65 | L1539 | `6945346c1cbb856d896e391a0741f994a87e99fda2250717312d615b44ae0be6` | Checked "Dark" after focus moved on: its own pixels are identical; only the next option's tint shows at the clip's lower edge. |
| 94 | keyboard-en | `popover-dark-unchecked-focused-panel.png` | 342×571 | L1542 | `7cccfbd6525c6c10df3c2ba377e2ff323d89543a6e8c964b4a541626c102c2d4` | F-APP-3, dark theme: the unchecked "System" focused shows only a faint tint, close to the checked options' tint but without the check. |
| 95 | keyboard-en | `popover-dark-unchecked-option-focused.png` | 320×65 | L1545 | `d6b6e8e2c713d1387dc3cfa369073420091fedd1c9a66fda61b03af8a56afd29` | Unchecked "System" focused: faint tint, no outline. |
| 96 | keyboard-en | `popover-dark-unchecked-option-moved-on.png` | 320×65 | L1547 | `95a5c8c0a3dcfe761ecf1645c975bfc644029fed8a974f1b5482d1e499357aea` | Unchecked "System" unfocused: no tint. |
| 97 | keyboard-zh | `419e56d-hue-slider-focused.png` | 180×28 | L45 | `b35454b779e480c30730c228ce49e7679dfa29a952d3a468f26bdcab4006353c` | Hue track inside the 2 px accent ring. Focus visible. |
| 98 | keyboard-zh | `419e56d-hue-slider-focused-row.png` | 305×161 | L47 | `42bb43dc99f7144877e8eb4eca51bcc4485cb78540e27d409380d62f35bba784` | Accent color row: swatches (Sage selected), ringed hue track, 165°. |
| 99 | keyboard-zh | `419e56d-hue-slider-unfocused.png` | 180×28 | L50 | `776ef536bffb8a828f3ad55f2eb561dd596fce776c7052b1ac66d06f28287346` | The same track, no ring. |
| 100 | keyboard-zh | `419e56d-font-slider-focused.png` | 222×24 | L57 | `ab7f6fb4c4b41dcf043d0f969e1e79e0af286a4b065869419d17112d722ff20c` | Font scale track inside the accent ring (F-APP-1). Focus visible; the batch 48 hash. |
| 101 | keyboard-zh | `419e56d-font-slider-focused-row.png` | 305×125 | L59 | `c3f91273f703bf51d393f8c7e596a346cbde8d364769bfdcb904c0a97f03b531` | Font scale row with the ringed track, 100%. |
| 102 | keyboard-zh | `419e56d-font-slider-unfocused.png` | 222×24 | L62 | `31dd04a84afa2e94c660c87d485e77bf253de131ce20d7c98af17cfbac04c12d` | The plain track; the batch 48 hash. |
| 103 | keyboard-zh | `before-5cd63ff-hue-slider-focused.png` | 180×28 | L86 | `b35454b779e480c30730c228ce49e7679dfa29a952d3a468f26bdcab4006353c` | 5cd63ff: ringed hue track. |
| 104 | keyboard-zh | `before-5cd63ff-hue-slider-focused-row.png` | 305×161 | L88 | `b3e684bfa01e95ca75d86b85be00270198c66e042ecabc4a64e6ac323e17a884` | 5cd63ff Accent color row with the ringed track. |
| 105 | keyboard-zh | `before-5cd63ff-hue-slider-unfocused.png` | 180×28 | L91 | `776ef536bffb8a828f3ad55f2eb561dd596fce776c7052b1ac66d06f28287346` | 5cd63ff: no ring. |
| 106 | keyboard-zh | `before-5cd63ff-font-slider-focused.png` | 222×24 | L98 | `a1343047a35424ad288a7bf8de2c1f86eecce569a19b7e6455f281744d460771` | 5cd63ff: no ring; byte-identical to the unfocused clip (the frozen batch 46 hash). |
| 107 | keyboard-zh | `before-5cd63ff-font-slider-focused-row.png` | 305×125 | L100 | `e78cdb9da51008263102403653bca1fb1c80b3c9e434681808c0cee6bf43d0ff` | 5cd63ff Font scale row: focused slider without any indicator. |
| 108 | keyboard-zh | `before-5cd63ff-font-slider-unfocused.png` | 222×24 | L103 | `a1343047a35424ad288a7bf8de2c1f86eecce569a19b7e6455f281744d460771` | Identical to the focused clip: the F-APP-1 state at 5cd63ff. |
| 109 | keyboard-zh | `swatch-419e56d-swatch-0-focused.png` | 52×53 | L132 | `6e001129e799a8627df1c9376926a8dbefa82860d52beec962068bd558a0bfcd` | Selected Sage focused: the 2 px selection ring hugging the swatch and the global ring outside it. F-APP-2 repaired. |
| 110 | keyboard-zh | `swatch-419e56d-swatch-0-focused-row.png` | 305×161 | L134 | `35713addf08210a30d15845fd4b920a464f2668889217133a85442a0ed247969` | Row: the focused selected Sage is clearly distinct from the unfocused selection look. |
| 111 | keyboard-zh | `swatch-419e56d-swatch-0-focus-moved-back.png` | 52×53 | L136 | `b4f04d2eb2b8be330291abde4c72a2e7c762ccc8875eafa0220382a7781a2801` | Selected Sage unfocused: the selection outline only. |
| 112 | keyboard-zh | `swatch-419e56d-swatch-1-focused.png` | 52×53 | L146 | `e61734225a1c56d0f9f1f0df017b08bbde0f2cf8ada68672c7b6b09f6c78765d` | Non-selected Ocean with the global focus ring (positive control). |
| 113 | keyboard-zh | `swatch-419e56d-swatch-1-focused-row.png` | 305×161 | L148 | `e2657e221f5531b7cf8ebd6fcafcd288f48d3f06baefd78319d7d15d571b3e44` | Sage selected, Ocean focused. |
| 114 | keyboard-zh | `swatch-419e56d-swatch-1-focus-moved-back.png` | 52×53 | L150 | `9723354fd55c826a947c4ab49326ee8256d1159a3531963d128dfd6a3fbafc9f` | Ocean with its thin border only. |
| 115 | keyboard-zh | `swatch-419e56d-accent-230-swatch-1-focused.png` | 52×53 | L178 | `f78e2d96dbfc3dad8ad7413b581d1a000c01ff1cf3bca09971fc61c20553dc7c` | Selected Ocean (accent 230) focused: selection ring plus the outer blue-tinted ring. |
| 116 | keyboard-zh | `swatch-419e56d-accent-230-swatch-1-focused-row.png` | 305×161 | L180 | `a29149e7f53bd951be3452ea1be5c42d7b6b860be40a1c0997d853c3a55b7b02` | Row at 230°: the focused selected Ocean is distinct. |
| 117 | keyboard-zh | `swatch-419e56d-accent-230-swatch-1-focus-moved-back.png` | 52×53 | L182 | `7b4b5826465517881034f787989a5744f15c1295227864013a38bca32166b98c` | Selected Ocean unfocused: selection ring only. |
| 118 | keyboard-zh | `swatch-419e56d-accent-230-swatch-2-focused.png` | 52×53 | L192 | `7c480559625987c63b7d2f6e43d4a1f511bd2cde7ec2c33fc86724747bddbb94` | Sunset with the focus ring (positive control). |
| 119 | keyboard-zh | `swatch-419e56d-accent-230-swatch-2-focused-row.png` | 305×161 | L194 | `b9b9a0e8e2ba9e1a9c754c943fb2a348f50f35fadc1fc0454236f194fa1fd8ce` | Ocean selected, Sunset focused. |
| 120 | keyboard-zh | `swatch-419e56d-accent-230-swatch-2-focus-moved-back.png` | 52×53 | L196 | `2019fe06be6e5fbd9298436f71558a31b121e56dae12d8d89ca9f3a8c90d80de` | Sunset with its border only. |
| 121 | keyboard-zh | `swatch-before-5cd63ff-swatch-0-focused.png` | 52×53 | L224 | `300ff1da729435bafb9bf6a37b5a7a598ed156dc47d4ba5450641eb44846d7e9` | 5cd63ff selected Sage focused: selection ring only, no focus cue (batch 48's frozen hash). |
| 122 | keyboard-zh | `swatch-before-5cd63ff-swatch-0-focused-row.png` | 305×161 | L226 | `6c05c8bdd5a27f73526c255ac0b15cb6e98e4bf0d393c04e832b22ac4e6bc31e` | 5cd63ff row: the focused selected Sage looks unfocused. |
| 123 | keyboard-zh | `swatch-before-5cd63ff-swatch-0-focus-moved-back.png` | 52×53 | L228 | `300ff1da729435bafb9bf6a37b5a7a598ed156dc47d4ba5450641eb44846d7e9` | Byte-identical to the focused clip: the pre-existing F-APP-2 state. |
| 124 | keyboard-zh | `swatch-before-5cd63ff-swatch-1-focused.png` | 52×53 | L238 | `1f97781bd0237bff1e7dcb18925e677fd8d8704564dac49fda5b4e7fb7ff764d` | 5cd63ff non-selected Ocean with the focus ring. |
| 125 | keyboard-zh | `swatch-before-5cd63ff-swatch-1-focused-row.png` | 305×161 | L240 | `330454fb37213040244a7982417341960c4a00c4be7d3d237c43931724e75b92` | 5cd63ff row: Sage selected, Ocean focused. |
| 126 | keyboard-zh | `swatch-before-5cd63ff-swatch-1-focus-moved-back.png` | 52×53 | L242 | `4749df264cf1de8ce3fbbc42f4c01b33efd42ca33c85dc9f5949ae267700769d` | 5cd63ff Ocean with its border only. |
| 127 | keyboard-zh | `selring-light-swatch-0-focused.png` | 52×53 | L1389 | `6e001129e799a8627df1c9376926a8dbefa82860d52beec962068bd558a0bfcd` | Light, selected Sage focused: the dark 2 px selection ring hugs the swatch; the global ring sits 2 px further out. |
| 128 | keyboard-zh | `selring-light-swatch-0-focused-row.png` | 305×161 | L1391 | `35713addf08210a30d15845fd4b920a464f2668889217133a85442a0ed247969` | Light Accent color row with the focused selected Sage; selection still evident. |
| 129 | keyboard-zh | `selring-light-swatch-0-unfocused.png` | 52×53 | L1393 | `b4f04d2eb2b8be330291abde4c72a2e7c762ccc8875eafa0220382a7781a2801` | Light, selected Sage unfocused: the dark selection outline only. |
| 130 | keyboard-zh | `selring-light-swatch-0-control-swatch-1-focused.png` | 52×53 | L1395 | `1f97781bd0237bff1e7dcb18925e677fd8d8704564dac49fda5b4e7fb7ff764d` | Control: focused non-selected Ocean shows only the global ring; nothing hugs the swatch. |
| 131 | keyboard-zh | `selring-light-swatch-4-focused.png` | 52×53 | L1432 | `f58159cff10e1cb4df2423f8e7033f36cf1f32dbb8a15e883bd73e6339f08bd9` | Light, selected Violet (295) focused: the dark 2 px selection ring hugs the swatch; the global ring sits 2 px further out. |
| 132 | keyboard-zh | `selring-light-swatch-4-focused-row.png` | 305×161 | L1434 | `b00b1873f4515be6f72d9a05ffda7a898757b5bcaf6cdd64f56c9699cbe4bace` | Light Accent color row with the focused selected Violet (295); selection still evident. |
| 133 | keyboard-zh | `selring-light-swatch-4-unfocused.png` | 52×53 | L1436 | `47f35ac8f76fc051e145647d609428fd296032eeee852947701a645128314b04` | Light, selected Violet (295) unfocused: the dark selection outline only. |
| 134 | keyboard-zh | `selring-light-swatch-4-control-swatch-5-focused.png` | 52×53 | L1438 | `491f56ebaef1c274fd6b5129cb4dcad845dafba1af910993e9f7d394aae4a1a5` | Control: focused non-selected Amber shows only the global ring; nothing hugs the swatch. |
| 135 | keyboard-zh | `selring-dark-swatch-1-focused.png` | 52×53 | L1475 | `5b2da3958360308ba8691ce55d6d220c03ffe9937a83162047fde2f8a37fa098` | Dark, selected Ocean (230) focused: the white 2 px selection ring hugs the swatch; the global ring sits 2 px further out. |
| 136 | keyboard-zh | `selring-dark-swatch-1-focused-row.png` | 305×161 | L1477 | `d8311aa105bda9f4f8b001ff0cd207e4876e0639773c258561c04044a7278259` | Dark Accent color row with the focused selected Ocean (230); selection still evident. |
| 137 | keyboard-zh | `selring-dark-swatch-1-unfocused.png` | 52×53 | L1479 | `33e1315d8c592828afa9899c3320a30e80d26480aadea7c427f8882e523bd7ea` | Dark, selected Ocean (230) unfocused: the white selection outline only. |
| 138 | keyboard-zh | `selring-dark-swatch-1-control-swatch-2-focused.png` | 52×53 | L1481 | `bd676cba3b016e9de00ce62dd9875f7c8d2cfc86d6b79f6ef4aeb5e0d4d7eb47` | Control: focused non-selected Sunset shows only the global ring; nothing hugs the swatch. |
| 139 | keyboard-zh | `selring-dark-swatch-0-focused.png` | 52×53 | L1518 | `3cf1ddbd1fdb430832ebf7926f6f85ee974ddf8dc93cebc967c621c1e3cf0b5f` | Dark, selected Sage focused: the white 2 px selection ring hugs the swatch; the global ring sits 2 px further out. |
| 140 | keyboard-zh | `selring-dark-swatch-0-focused-row.png` | 305×161 | L1520 | `f9c9df0e67b96788d4b6329f58bf0cbcc5b3d227cb010ea5b96473841c4b75a4` | Dark Accent color row with the focused selected Sage; selection still evident. |
| 141 | keyboard-zh | `selring-dark-swatch-0-unfocused.png` | 52×53 | L1522 | `9feef5e60e485475967d89c8df8d95d1eca2801be17ff7160cc7c52cbaf5eec3` | Dark, selected Sage unfocused: the white selection outline only. |
| 142 | keyboard-zh | `selring-dark-swatch-0-control-swatch-1-focused.png` | 52×53 | L1524 | `f1cf53259bb2c38995785a51633a3e0e49b01f15ea14c83479013aed5449f185` | Control: focused non-selected Ocean shows only the global ring; nothing hugs the swatch. |
| 143 | keyboard-zh | `popover-light-checked-focused-panel.png` | 371×539 | L1563 | `d4043841c0f4a6fff8f42e7ed54590dc956db91707a371a6951f15c98c79d243` | F-APP-3, light theme: the popover with the checked 主题 option "浅色" focused; it is indistinguishable from the other checked options (no outline, same tint). |
| 144 | keyboard-zh | `popover-light-checked-option-focused.png` | 349×61 | L1566 | `50d6957925815ae5ac48b6ac3c909d4c0cd85a77ebe873bab30fc0732325fe69` | Checked "浅色" focused: checked tint and check mark only; no focus cue. |
| 145 | keyboard-zh | `popover-light-checked-option-moved-on.png` | 349×61 | L1568 | `6fceb1d067d4bc0713c5829b430cdb4ba0a804fe0dbcd3679e1d7c4273224458` | Checked "浅色" after focus moved on: its own pixels are identical; only the next option's tint shows at the clip's lower edge. |
| 146 | keyboard-zh | `popover-light-unchecked-focused-panel.png` | 371×539 | L1571 | `43d6f1578b4cd3de1ef4dc4118009ebb133d98d7aa5bf84d724c821609f82f66` | F-APP-3, light theme: the unchecked "深色" focused shows only a faint tint, close to the checked options' tint but without the check. |
| 147 | keyboard-zh | `popover-light-unchecked-option-focused.png` | 349×61 | L1574 | `aed98c68cb557870738d70d2a7322d868254788317c4e734031288e97a429bef` | Unchecked "深色" focused: faint tint, no outline. |
| 148 | keyboard-zh | `popover-light-unchecked-option-moved-on.png` | 349×61 | L1576 | `3254ec12639a631bc792b30a31f2a1ebd9fafce411dc8f88c26340faca989d94` | Unchecked "深色" unfocused: no tint. |
| 149 | keyboard-zh | `popover-dark-checked-focused-panel.png` | 371×539 | L1619 | `44187499b035f79919e9e60aecb616cc1f0d42e1d5426a9952d2b9a2b245cfa7` | F-APP-3, dark theme: the popover with the checked 主题 option "深色" focused; it is indistinguishable from the other checked options (no outline, same tint). |
| 150 | keyboard-zh | `popover-dark-checked-option-focused.png` | 349×61 | L1622 | `5df3c1d7af3b4c112d9284062514dc73eb687b12da06f11a5b542b16cae64a1e` | Checked "深色" focused: checked tint and check mark only; no focus cue. |
| 151 | keyboard-zh | `popover-dark-checked-option-moved-on.png` | 349×61 | L1624 | `141e128cc431c655c1bbd05f12feafdd78d7dba1ed27d5d71dd647bec0521e92` | Checked "深色" after focus moved on: its own pixels are identical; only the next option's tint shows at the clip's lower edge. |
| 152 | keyboard-zh | `popover-dark-unchecked-focused-panel.png` | 371×539 | L1627 | `9c6ba25c9d4d138a0c5e6dfeb281390eefe227eb13fcb8252df5d70c0836daf9` | F-APP-3, dark theme: the unchecked "跟随系统" focused shows only a faint tint, close to the checked options' tint but without the check. |
| 153 | keyboard-zh | `popover-dark-unchecked-option-focused.png` | 349×61 | L1630 | `32b91c9e97fcd42fd41de84e1ae249564361efcf4c1a644540be5fa21f25282c` | Unchecked "跟随系统" focused: faint tint, no outline. |
| 154 | keyboard-zh | `popover-dark-unchecked-option-moved-on.png` | 349×61 | L1632 | `221273599d683c3b5cdc5419d01644115c84120a6400eb815c04a0628791991b` | Unchecked "跟随系统" unfocused: no tint. |

**Overall.**
- No image shows overlap, clipping or broken rendering, and all CJK glyphs render.
- The images confirm the logs:
  - every caller control is contained and clear of the pet;
  - the Topbar switches between icon-only and text at 768;
  - the disabled Retry all is neutral, legible and focus-ringed;
  - both sliders and the selected swatch show focus at 419e56d, and not at 5cd63ff;
  - the selection ring hugs the focused selected swatch in both themes;
  - the popover's checked option shows no focus cue.
- **Two pre-existing conditions appear and are not part of this caller:**
  - the Tasks page's "Could not save" banner on `/app/tasks` (batch 39 ruling 5);
  - the Topbar summary's truncation at 768 in EN, the same as at 5cd63ff.

## 13. Items for the controller

1. **PASS.** E14 and E15 are complete at `419e56d` in EN and ZH. F-APP-1 and F-APP-2 are verified repaired, including the selection-ring visibility requirement of the F-APP-2 ruling.
2. **F-APP-3 is frozen as evidence** (§6; screenshots §12 #85–#96 and #143–#154). It is for the UX-05 follow-up; final acceptance confirms or overturns the ruling.
   - Checked options: 0 pixels change on focus.
   - Unchecked options: a 1.16–1.21 contrast tint.
3. **A harness note for future runners.** The pet toggle's 375 → 1440 → 375 viewport round trip, with a **stored** top sidebar, leaves Chrome's mobile visual viewport zoomed (scale 1.0027778).
   - Clip-vs-clip comparisons (the walk oracle) are unaffected. A full-viewport-vs-clip comparison, such as batch 48's clip self-test, fails.
   - No frozen state stores `top`: the batch 48 walks and the E14 states use `right` or the default. This runner's new sections avoid the trigger and gate on an unzoomed viewport (§11).
4. **`rail:任务`.** At 375 its ring is mostly clipped by the rail scroller (81–86 own-region pixels), as in batch 48. It is shell, not this caller, and is recorded again for the manual follow-up.
5. **Rendering varies slightly between documents.** Identical-looking clips can hash differently between documents: in EN, the 419e56d and 5cd63ff hue-slider focus clips swapped hashes with batch 48's. The oracle always compares two stable frames of one document.

## 14. Limitations

- **Retained contract §15 exclusions:**
  - headless Chrome with an isolated profile;
  - a synthetic auth session and account;
  - not Tauri;
  - a development build without StrictMode;
  - a dependency tree reused from the main checkout (the lockfile gate is a consistency check only);
  - no external network, so system fonts render the text.
- **E15 widths.** One width per language: EN 1024×768, ZH 375×812 with mobile emulation.
- **Language group.** Its non-default selection (中文) is walked in the ZH run. The EN run walks English selected; selecting the other language switches the whole UI.
- **Pixel oracle:**
  - **What it judges.** It judges a change attributable to the stop, not a minimum contrast for focus indicators, which the contract does not require. The global ring is `--accent` at 58% alpha, faint on light backgrounds (for example §12 #69 and #127).
  - **Rendering differences.** Anti-aliasing can differ between documents, as in batch 48.
- **Ring measurement.** It assumes the swatch's circular geometry (`border-radius: 999px`, 32 px box) and a tolerance of 28 levels per channel. Its validity is a precondition in every case (§4.3).
- **F-APP-3.** An observation only; the interior contrast is between the modal colours of two captures.
- **Space-scroll tolerances:** a clamp to a shorter range, and anchoring below half the scrollport (control-plane ruling 4). In ZH, four bottom-control presses needed a script move of the scroller first, 44–120 px.
- **Script actions.** These are script actions by design:
  - lock holds and releases, storage faults, and the external repair of `xai_rail_pos`;
  - the scroll positive control's `tabindex`;
  - the placing `scrollIntoView` of the pixel walk;
  - window scrolls to the top before Topbar probes;
  - the cascade audit's temporarily adopted stylesheets.

  Every user-facing activation is trusted input.
- **Not an accessibility audit.** There was no screen reader, forced-colours or high-contrast check.
