# Features EN/ZH five-width presentation and keyboard at `5cd63ff` (CP-FEATURES-01, batch 29, contract §14 E14–E15)

**Verdict: PASS for both evidence runs (`v2`; EN `visual`, ZH `visual-zh`), with one flagged cross-module observation that needs a controller ruling (§10).**

| Run | Checks | Preconditions | Product checks (deferred) | Failures | Runtime exceptions / `console.error` | Console warnings | Screenshots | Exit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EN `native-5cd63ff-v2-visual.log` | 1040 | 371 | 669 (515) | 0 | 0 / 0 | 2 (expected decode warnings for the malformed Matrix bytes of the source-only state) | 12 | 0 |
| ZH `native-5cd63ff-v2-visual-zh.log` | 1039 | 370 | 669 (515) | 0 | 0 / 0 | 2 (same) | 12 | 0 |

- **E14, every control, every width, both languages.** In five states, every control was scrolled into view and hit-tested at its center and four inset points. It was horizontally contained (in `.settings-detail`; dialog actions in the dialog box and the viewport, as accepted for Sticky), inside the viewport and visible. The five states were: clean (8 switches and Reset), all 8 fields unresolved (8 switches, 16 Retry/Discard, Export, Discard all and Reset), partial reset, source-only Reload, and the departure dialog (its three actions). The document, `.settings-detail`, the pane, the section block, the grid and every ancestor scroller never scroll or overflow horizontally. Every recovery, reset and dialog target is at least 44×44 at every width; the smallest is exactly 44 px tall.
- **The 375 px overflow is fixed.** At `f359be6` the pane is 289/293 px (client/scroll; the frozen E4 H10 value, which this run reproduces exactly). At `5cd63ff` it is 289/289; the grid is 280/280 and every card sits inside the detail's content box. Card tracks equal `f359be6` at all five widths, and clean card boxes, thumbnails and switch geometry are identical.
- **Selector audit.** `f359be6..5cd63ff` changes one stylesheet only, `packages/xai-web-settings-features-panel/src/styles.css`. It adds 84 lines in one hunk and removes 0. All 13 new selector occurrences (12 distinct) begin with `.features-pane`; the only at-rule is `@media (max-width: 640px)`.
- **E15 keyboard** (EN at 1024×768, ZH at 375×812, trusted CDP keys only):
  - Tab reaches every control in DOM order with a visible 2 px focus outline.
  - Space and Enter each activate a switch exactly once (one write; no page scroll on Space, proven detectable by a positive control). They also open the reset confirmation exactly once.
  - The dialog takes focus, wraps Tab and Shift+Tab, treats Escape as Stay and returns focus to the prior element.
  - Focus lands on the field's switch after a keyboard Discard, Reload (with or without repair) and successful Retry, and on Reset to defaults after Discard all (controller decision 4).
- **Screenshots.** All 24 `v2` images (12 per language) were opened and reviewed by hand (§8). No overlap, clipping, truncation, misalignment, unreadable text or broken switch rendering was introduced by this caller.
- **Flagged, not gated (§10).** In the production App the DesktopPet is on by default. At its default position at 768×1024 it covers the pane's last right-aligned action:
  - `f359be6`: the center of "Save & apply" in both languages;
  - `5cd63ff` EN: the right third of "Reset to defaults" (its center is clickable);
  - `5cd63ff` ZH: the center of "恢复默认".

  The gated checks follow the accepted Sticky and Features E12 compositions, which ran without the pet. The controller decides whether §9 "not covered" includes the protected pet at its default position. If it does, §10 is the frozen reproduction.

**Status.**
- This is independent verification only. It is **not acceptance**.
- It changes no product file, contract, ledger, control plane or existing evidence: it only adds files to this directory.
- It closes no 312 item. REL-05, REL-07, REL-10, UX-04, UX-05, QA-01, QA-03, QA-04, QA-09, SET-03 and D2/REL/AI stay open.
- It does not push, merge, deploy, release or sync Web→Desktop.
- Final regression (batch 30, E18–E25) and independent acceptance (batch 31) remain.

## 1. Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance in the parent-role visual and keyboard verifier role (batch 29). It did not write the contract, the Features caller, the earlier Features evidence or any reused harness |
| Worktree | `.claude/worktrees/agent-af4f8003cd5d6f02f`, detached at docs base `4c4e901a90b498a4d1a183b143b69e626a3caa6d` (clean before the runs) |
| Candidate | requested `5cd63ff` → resolved `5cd63ff652f02a2c726187fe12cbc796218d31c0`, tree `404bf819a42e20b3e4d372c18a981832ccd54954` (line 1 of every log) |
| Geometry reference | immutable `git archive f359be6d838393e0f9e93efd80b88b5b09f6144e` (the contract's before product), plus the frozen E4 log `native-f359be6-before1-h10.log` (read-only, SHA-256 `46213534…728dd`, recorded in each log's line 1) |
| Product tree equality | `git diff --name-only 5cd63ff HEAD -- apps packages package.json pnpm-lock.yaml` is empty (L2 precondition). The `f359be6..5cd63ff` product delta is the 11 Features-package files only (L6). Every bundled archive module outside the Features package is byte-identical between the two archives (L7: 0 drifted) |
| Dependency gate | `XAI_DEPS_ROOT` is the main checkout, read-only. `pnpm-lock.yaml` SHA-256 is `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for the dependency tree, both archives and both extracted lockfiles (L3) |
| Provenance guard | Every `@repo/*` specifier (320 per bundle) is pinned to its archive's own package export. A guard plugin fails the build on any module loaded from `packages/`, `apps/` or `docs/` of the dependency checkout or this worktree: 0 violations, 0 foreign inputs. Archive modules: 618 at `f359be6`, 620 at `5cd63ff` (the two new helpers). All 21 required modules were bundled from their archive, plus the two fixed-only helpers (L4–L5) |
| Bundles (v2 EN) | `f359be6` JS `3de7c68f…`, CSS `ce8c0d44261b8e3c…`, byte-identical to the frozen E4 before bundle CSS. `5cd63ff` JS `0f86b480…`, CSS `b4ca75d8a975eee8…`. The JS differs per language because of the language constant; the CSS is identical in all four logs |
| Browser and toolchain | Chrome `154.0.8037.97` headless (`--headless=new`, protocol 1.3); Node `v24.16.0`; esbuild `0.28.1`; react 19.2.0, react-dom 19.2.0, react-router 7.15.1; deviceScaleFactor 1 |
| Viewports | 375×812 and 414×896 with mobile emulation; 768×1024, 1024×768 and 1440×900 |
| Network | Two local `127.0.0.1` servers on ephemeral ports, one per archive, so the two products never share storage. `--host-resolver-rules` maps every other host to NOTFOUND. Local Chrome DevTools only |
| Composition | Production App, as in `./native-fixed.tsx` (E9/E10/E13): the `apps/web/src/main.tsx` module order and the production router under `RouterProvider`. `/app/settings/features` renders App, then AccountStorageGate, AccountDataGate, Shell (AppRail, Topbar), DesktopPet, CommandPalette, then ComposedSettings (DepartureCoordinator, `settingsDeparture`), then the real Features pane, hook, engine, registry and codec. **The only synthetic input is the auth session.** Language is the user's stored `xai_pref_lang`, seeded on a product-free `/seed` page |
| Evidence iterations | **2 of 3 per language.** `v1` (EN and ZH) is kept and labelled **superseded for screenshot fidelity** (§11). `v2` is the evidence. No third iteration |

## 2. Commands

Run from the worktree root. `XAI_NATIVE_TMPDIR` only places the temporary archives and the Chrome profile in the session scratchpad; the runner deletes them.

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
XAI_NATIVE_TMPDIR=<session scratchpad>/tmp \
  node docs/reviews/web-features-recovery-native/verify-visual-fixed.mjs 5cd63ff visual v2
# -> PASS docs/reviews/web-features-recovery-native/native-5cd63ff-v2-visual.log checks=1040 product=669 screenshots=12 exit=0

XAI_DEPS_ROOT=… XAI_NATIVE_TMPDIR=… node docs/reviews/web-features-recovery-native/verify-visual-fixed.mjs 5cd63ff visual-zh v2
# -> PASS docs/reviews/web-features-recovery-native/native-5cd63ff-v2-visual-zh.log checks=1039 product=669 screenshots=12 exit=0
```

- **Superseded runs.** The same commands with suffix `v1` gave `PASS … native-5cd63ff-v1-visual.log checks=1013 product=669 screenshots=12 exit=0` and `PASS … native-5cd63ff-v1-visual-zh.log checks=1012 product=669 screenshots=12 exit=0`. They were produced by the previous harness revision (§11).
- **Exit codes.** 0 means the harness is valid and every check passes; 2 means the harness is valid and a product check failed; 1 means a precondition failed.
- **Overwrite refusal.** Rerunning an existing suffix stops with `Evidence exists; use a distinct suffix` before anything is archived (verified with `visual v1`). Logs and screenshots are written with the `wx` flag.

## 3. New files and SHA-256

Harness and logs (all in this directory):

| File | Lines | SHA-256 |
| --- | --- | --- |
| `verify-visual-fixed.mjs` (runner) | 1406 | `8da2be3d93ae40ee7407fd0f717961748b5f1c59dc288a982a1b5d52d6ecaaa4` |
| `native-visual-fixed.tsx` (fixture) | 617 | `caf96cd5b4d087416692ba1d6507973e4a5febde9047be01ecaf84d893a88117` |
| `native-5cd63ff-v2-visual.log` (EN evidence) | 1139 | `b7b7e7c9b9494ce982fc4670ebe1cd41e8e9b60ec8501949e11fe772c5d6df43` |
| `native-5cd63ff-v2-visual-zh.log` (ZH evidence) | 1138 | `663d8916ea41fe13b5dde42d6c49822c01ae4f2508f7139e1b86ad5740b38ee9` |
| `native-5cd63ff-v1-visual.log` (EN, superseded) | 1112 | `7cd75102620783d9f6306100a27816ac27b2ec41ef63098a25623878ee6f3c80` |
| `native-5cd63ff-v1-visual-zh.log` (ZH, superseded) | 1111 | `46e1ce436ebf86cd84fa55389356ae1e630d2731d72dbe753975f3ef14058431` |
| `review-visual-keyboard-5cd63ff.md` | — | this receipt |

- Each `v2` log records the runner and fixture hashes above in its line 1 (`fileSha256`).
- Each `v1` log records `9b8b7b69…24953` (runner) and `7a6561e6…1d70b` (fixture), the previous revision (§11).
- The SHA-256 of all 48 screenshots on disk equals the `screenshot` records in their logs (48/48 checked). The 24 `v2` hashes are listed in §8 and the 24 `v1` hashes in §11.
- The commit adds 55 files: 2 harness files, 4 logs, 48 PNGs and this receipt.

## 4. Method

**Instruments.** All are fixture-owned and installed in the fixture body, after module evaluation and before render:
- an attempt-level Storage log, with per-key `setItem` and `removeItem` denial (DOMException `SecurityError`, never reaching storage);
- a `window.confirm` recorder (the native dialog is answered through `Page.handleJavaScriptDialog` by plan; any unplanned dialog fails the run);
- a capture-phase trace of keydown, keypress, keyup, click and focusin, recording `isTrusted`;
- read-only geometry, hit-test, overflow, overlap, text-clip, scroll and focus probes.

Seeds and physical reads use the captured native Storage functions and are never counted.

**DesktopPet.** The production App mounts the pet on (`App.tsx` `useState(true)`).
- In the clean state, after a fresh mount at each width, the default-position coverage of every control is recorded for both products (observation, §10).
- The gated checks then run with the pet turned off through the product's own rail pet toggle: a trusted, hit-tested click at 1440 px, the width where `.rail-bottom` is shown at every evidence state.
- This matches the accepted Sticky E14 and Features E12 compositions, which ran without the pet.

**States.** All are reached through trusted input; results are `width` records.

| State | How it is reached | Width records (EN / ZH) |
| --- | --- | --- |
| Clean | Fresh seed and mount per width for each product. `5cd63ff` mounts make zero writes to the 8 keys | L171–336 / L170–335 |
| All 8 unresolved | `setItem` denied for the 8 keys, then 8 trusted switch clicks. Each produces exactly one denied `false` write; bytes stay absent; eight "… was not saved." alerts appear, plus Export and Discard all (L364–370 / L363–369) | L395–519 / L394–518 |
| Departure dialog | Over the all-8 state: a trusted, hit-tested click on the sidebar row after Features (`sidebar:Smart Lists` / `智能清单`). The wording is "Unsaved Features draft" / "Features has unsaved changes." (ZH "未保存的功能草稿" / "功能有未保存的更改。"). The route is held; Stay keeps the route and all 8 drafts | L554–631 / L553–630 |
| Partial reset | After Discard all (zero writes): 8 keys seeded `false`, remount, `removeItem` denied on Calendar and Habits, trusted Reset, the confirmation accepted. One remove per key (6 ok, 2 denied), zero writes; "Calendar/Habits was not reset to its default." (ZH "日历/习惯未恢复默认。"); no "Defaults restored." (L655–661 / L654–660) | L686–792 / L685–791 |
| Source-only Reload | After Discard all: Matrix seeded with out-of-domain `yes`, remount. "Saved Matrix is unavailable. Reload it; this is not a new unsaved change." (ZH "已保存的四象限不可用。请重新读取；这不是新的未保存更改。") with Reload only; no pane actions, no Saved claim, bytes kept (L808–809 / L807–808) | L833–935 / L832–934 |

**Per-control check.**
- `scrollIntoView({block:"center"})`, then `elementFromPoint` at the center and four inset points. For the rounded 46×44 switch the insets are ±0.2 of its box, inside the round shape.
- Horizontal containment in `.settings-detail`'s border box (also recorded for its content box), inside the viewport, visible.
- Recovery, pane-action, Reset and dialog targets at least 44×44, with no internal text overflow.

**Layout check.**
- No horizontal overflow, and `scrollLeft` 0, for the document, `.settings-detail`, `.features-pane`, the section block, the grid and every ancestor scroller. Only `.module-settings` scrolls.
- No overlap (area > 0.5 px²) among sibling parts: pane children, cards, card children, card head, recovery parts, actions, footer and dialog children.
- No clipped card name or description, recovery message, status, export error or dialog message.
- No card past the detail's content box.

**Geometry reference.** `f359be6` is measured in the same composition, language and widths in two states:
- clean, after a fresh mount per width;
- all eight switches off, set by trusted clicks in its own origin. This is the state-matched reference for the all-8 drafts, which also display off.

Comparisons require equal displayed switch values (precondition).

**Screenshots.**
- **Full-pane captures** (all-8, partial, Reload, clean) grow the viewport height until no scroll container around the pane overflows, then clip to the `.settings-detail` band at full width.
  - Growing the height would remove the scroll container's 10 px classic scrollbar and widen the content. The `v2` harness therefore pins that scroller's `scrollbar-gutter` during the capture only.
  - It requires the captured pane layout to equal the realistic-viewport layout exactly: boxes, offsets within the pane and grid tracks; 28–55 parts per capture.
  - It requires the realistic layout to be restored afterwards. These are 27 preconditions per run (§11).
- **Dialog and pet captures** are realistic-viewport images.
- **All hit-tests** run at the realistic heights.

## 5. Per-language, per-width results

Each cell shows **controls checked**, then **hit-test / containment / viewport / under-44 / clipped failures**, then the smallest 44-px target (width × height). Rows L are the `width` records.

### EN (`native-5cd63ff-v2-visual.log`)

| State | 375 | 414 | 768 | 1024 | 1440 |
| --- | --- | --- | --- | --- | --- |
| Clean (9) | 0/0/0/0/0, 140.55×44 | same | same | same | same |
| All 8 unresolved (27) | 0/0/0/0/0, 121×44 | 0/0/0/0/0, 132×44 | 0/0/0/0/0, 140.55×44 | 0/0/0/0/0, 140.55×44 | 0/0/0/0/0, 137×44 |
| Dialog actions (3) | 0/0/0/0/0, 50.39×44 | same | same | same | same |
| Partial reset (15) | 0/0/0/0/0, 121×44 | 0/0/0/0/0, 132×44 | 0/0/0/0/0, 140.55×44 | 0/0/0/0/0, 140.55×44 | 0/0/0/0/0, 137×44 |
| Source-only Reload (10) | 0/0/0/0/0, 140.55×44 | same | same | same | same |
| Document scroll/client | 375/375 | 414/414 | 768/768 | 1024/1024 | 1440/1440 |
| `.settings-detail` | 317/317 | 356/356 | 648/648 | 672/672 | 738/738 |
| `.features-pane` | 289/289 | 328/328 | 604/604 | 608/608 | 674/674 |
| Smallest gap, pane control to detail edge | 14 px | 14 px | 22 px | 32 px | 32 px |

### ZH (`native-5cd63ff-v2-visual-zh.log`)

| State | 375 | 414 | 768 | 1024 | 1440 |
| --- | --- | --- | --- | --- | --- |
| Clean (9) | 0/0/0/0/0, 84×44 | same | same | same | same |
| All 8 unresolved (27) | 0/0/0/0/0, 84×44 | same | same | same | same |
| Dialog actions (3) | 0/0/0/0/0, 49.78×44 | same | same | same | same |
| Partial reset (15) | 0/0/0/0/0, 84×44 | same | same | same | same |
| Source-only Reload (10) | 0/0/0/0/0, 84×44 | same | same | same | same |
| Document / detail / pane | as EN | as EN | as EN | as EN | as EN |

**Other checks, every state and width, both languages.**
- Every expected control is present, in the expected DOM order (`pane-controls-in-dom-order`).
- No overlap; no clipped text; every card inside the detail's content box.
- Clean `5cd63ff` mounts make zero writes to the 8 keys, render no Save footer, keep the "Reset to defaults"/"恢复默认" label and show no status claim.

**Dialog box.**
- Fully inside the viewport, with no horizontal overflow, at all five widths.
- The Tab-focused Stay keeps a 2 px solid outline at every width (`dialog:<width>:focused-action-visible-outline`).
- Its actions are judged against the dialog box and the viewport: the dialog is the protected coordinator's viewport-fixed overlay, unchanged since `f359be6` (Sticky ruling). The raw `inDetail` relation is logged per width.

## 6. 375 px overflow fix and geometry comparison with `f359be6`

**Frozen E4 reproduced.** Measured right after a fresh `f359be6` mount, this run's horizontal geometry equals the frozen E4 H10 records exactly. The deep-equal preconditions are L27 (375 EN), L97 (1440 EN) and ZH L27; the observations are L26 and L96 in each log. The values are:
- detail box 24–341 (317) and content box 38–327;
- pane 38–327, client/scroll 289/293;
- section block 287/292;
- grid 51–314 (263/280, `280px`);
- all 8 cards at 51–331;
- switches at 270–316.

The before overflow of exactly 4 px is a positive control (L28: `h10-overflow-reproduced-positive-control`).

| Width | `f359be6` tracks | `5cd63ff` tracks | Pane client/scroll (before → fixed) | Section block client/scroll, inline padding | Grid client/scroll |
| --- | --- | --- | --- | --- | --- |
| 375 | `280px` | `280px` | 289/**293** → 289/289 | 287/**292**, 12 px → 287/287, **3.5 px** | 263/**280** → 280/280 |
| 414 | `302px` | `302px` | 328/328 → 328/328 | 326/326, 12 px → same | 302/302 → same |
| 768 | `570px` | `570px` | 604/604 → same | 602/602, 16 px → same | 570/570 → same |
| 1024 | `574px` | `574px` | 608/608 → same | 606/606, 16 px → same | 574/574 → same |
| 1440 | `312px 312px` | `312px 312px` | 674/674 → same | 672/672, 16 px → same | 640/640 → same |

- **At 375 px.** The fixed grid is 42.5–322.5 px (280 px) inside the content box 38–327. Every card is 42.5–322.5, the track still 280 px. The overflow into the detail padding (cards to 331 px) is gone.
- **Where the fix acts.** The scoped override reduces only the section block's inline padding, to 3.5 px at 375. At the other four widths the padding equals `f359be6` (12/16 px), so no width gains or loses a column.
- **Gated per width** (`clean:<w>:…`, both languages):
  - `grid-tracks-not-narrower-than-f359be6`;
  - `cards-not-narrower-than-f359be6`;
  - `clean-card-boxes-equal-f359be6`: width and height equal. EN heights are 251.52 px at 375 and 1440; 231.27 px at 768 and 1024; at 414, 231.27 for Tasks and 251.52 for the others. ZH heights are 231.27 px everywhere;
  - `thumbnails-not-smaller-than-f359be6` (250×130 at 375);
  - `card-box-css-unchanged`;
  - `switch-track-knob-and-card-alignment-equal-f359be6`: 46×44 box, knob 22×22 at (22, 2) on and at (2, 2) off, right inset 0 and top offset 15 in the card.
- **All-8 state.** Compared with the all-off `f359be6` reference: tracks, card widths, thumbnails and the off-state switch geometry are equal at all five widths.
- **Partial and Reload states.** Compared with clean `f359be6`: equal as well.
- **Measurement stability.** `v1` and `v2` give identical tables, geometry and pet observations; only the screenshots differ (§11).

## 7. Selector audit

`git diff f359be6 5cd63ff` touches one stylesheet, logged as `css-diff` (L9 in both logs):
- **File:** `packages/xai-web-settings-features-panel/src/styles.css`, SHA-256 `db4a5f24…027e` → `65fdf6f0…b5c3`; no other `*.css` file changed.
- **One hunk** `@@ -136,0 +137,84 @@`: 84 lines added, 0 removed. The fixed file begins byte-for-byte with the `f359be6` file (L13), so `.features-grid`, `.feat-*` and `.disabled-feature-fallback*` are byte-unchanged.
- **Protected styles unchanged:** `plugin-web-settings-shell` (including `.toggle` and `.pane-footer`), `plugin-web-tokens` and `apps/web/src/styles` have an empty diff (L16).

| # | Selector (in source order) | Scope / note |
| --- | --- | --- |
| 1 | `.features-pane > div.setting-block` | scoped override of the shell's section-block inline padding: `clamp(0px, calc((100% - 282px) / 2), 16px)` |
| 2 | `@media (max-width: 640px) .features-pane > div.setting-block` | same, at most 12 px (the shell's mobile value) |
| 3 | `.features-pane .features-grid` | scoped override `repeat(auto-fill, minmax(min(280px, 100%), 1fr))`, the §9 "`.features-pane`-scoped override" for the 280 px minimum |
| 4 | `.features-pane .features-recovery-field` | new |
| 5 | `.features-pane .features-recovery-text` | new |
| 6 | `.features-pane .features-recovery-field > button:only-of-type` | new (Reload spans the row) |
| 7 | `.features-pane .features-recovery-field > button` | new (44×44 minimum) |
| 8 | `.features-pane .features-recovery-actions > button` | new (44×44 minimum) |
| 9 | `.features-pane .features-recovery-reset` | new (44×44 minimum) |
| 10 | `.features-pane .features-recovery-actions` | new |
| 11 | `.features-pane .features-recovery-error` | new |
| 12 | `.features-pane .features-recovery-footer` | new |
| 13 | `.features-pane .features-recovery-status` | new |

Checks that pass (L10–L16):
- `css:diff-parse-balanced`;
- `css:only-the-features-stylesheet-changed`;
- `css:additions-only-no-line-removed`;
- `css:existing-rules-byte-unchanged-fixed-stylesheet-extends-f359be6`;
- `css:every-new-selector-scoped-under-features-pane`;
- `css:at-rules-are-media-only`;
- `css:shell-toggle-pane-footer-tokens-and-global-styles-unchanged`.

Every selector begins with `.features-pane`, so no other caller's native visual mode is triggered (contract §13 row 8).

## 8. Manual screenshot review (every `v2` image opened and inspected)

**How.** Each tall image was inspected at native resolution in 1000 px tiles cut into the session scratchpad (the committed files are untouched); short images were opened whole. Criteria: overlap, clipping, truncation, misalignment, unreadable text, broken switch rendering.

**Recurring pre-existing items.** Each is identical to `f359be6` by geometry check or by the frozen and before captures, and is listed once here.
- **(P1) Switch shape.** The shared Toggle renders as a 46×44 round shape with the knob near the top: green with the knob right when on, grey with the knob left when off. The geometry equals `f359be6` (§6).
- **(P2) Thumbnail artwork cropping.** The FeatureThumb SVGs are cropped inside their fixed-height (130 px) box: at the right edge in narrow cards (Boards columns, the Calendar grid), and top and bottom in the wide single-column cards at 768 and 1024 px. The thumbnail boxes equal `f359be6`, and FeatureThumb and `.feat-thumb` are unchanged and protected.
- **(P3) Meditation artwork.** The thumbnail draws "03:44" over its ring by design.

| # | Image (SHA-256) | Manual review |
| --- | --- | --- |
| 1 | EN `native-5cd63ff-v2-visual-375-before-f359be6-clean.png` (`3bb9ce61…7d1f`) | Before product: all 8 cards on. The cards visibly run past the section block's right border (H10 b). The shared footer stacks "Save & apply" (primary) above "Reset to defaults". Reference only. (P1)(P2) |
| 2 | EN `…-375-clean.png` (`fea0baa6…1a69`) | Fixed clean pane. Cards sit inside the section block with its border visible on both sides, and the same card content and wrapping as #1. The footer has a divider and a right-aligned "Reset to defaults"; there is no "Save & apply" and no status text. No issue. (P1)(P2)(P3) |
| 3 | EN `…-375-all8.png` (`95db81ce…9bef`) | Eight off switches. Each card reads "… was not saved." above Retry and Discard in two equal columns, then the thumbnail. "Export Features draft" and "Discard all changes" stack on two lines; then the divider and Reset on the right. No overlap, clipping or truncation; all text readable. (P1)(P2)(P3) |
| 4 | EN `…-414-all8.png` (`a649f0c8…ec9e`) | As #3 with 302 px cards and a 12 px block inset. Export and Discard all still stack. No issue. (P1)(P2)(P3) |
| 5 | EN `…-768-all8.png` (`81a548d4…cf76`) | Dark rail at the left. One column of 570 px cards (the realistic layout). Retry and Discard span the card in two columns. Export and Discard all share one row; Reset is bottom-right. No issue. (P1)(P2)(P3) |
| 6 | EN `…-1024-all8.png` (`0fec378a…2184`) | Settings sidebar with Features active; one column of 574 px cards, otherwise as #5. Nothing collides with the sidebar or the panel edge. No issue. (P1)(P2)(P3) |
| 7 | EN `…-1440-all8.png` (`10133f6d…bdbc`) | Two columns of 312 px cards. Where a description wraps to two lines (Boards, Calendar), that card's message and buttons sit one line lower than its row neighbour's: content-driven flow, not overlap. Actions share one row; Reset is right. No issue. (P1)(P3) |
| 8 | EN `…-375-dialog.png` (`8cb486b0…1ada`) | Bottom decision surface: "Features has unsaved changes.". Stay is focused with a visible outline; "Export current draft" is on the same row and "Discard local changes and leave" on a second row. All are inside the viewport with margins. The surface covers the bottom rail band and has no backdrop (pre-existing, protected coordinator). Behind it, the 2-column sidebar shows Features active. No clipping. |
| 9 | EN `…-375-partial.png` (`45467c29…5220`) | All 8 switches on. Calendar and Habits show "… was not reset to its default." (each fits one line) with Retry and Discard. Export and Discard all stack; Reset is right; no "Defaults restored.". No issue. (P1)(P2)(P3) |
| 10 | EN `…-375-reload.png` (`1a61ef25…d97e`) | Matrix shows the default "on" switch and "Saved Matrix is unavailable. Reload it; this is not a new unsaved change." on two lines above a full-width Reload button. No pane actions, no status. No issue. (P1)(P2)(P3) |
| 11 | EN `…-768-pet-on-before-f359be6-clean.png` (`a1964558…44db8`) | Frozen §10 reproduction, before product: the default-position pet sits over "Save & apply" (only "Save & a" is visible); "Reset to defaults" to its left is free. |
| 12 | EN `…-768-pet-on-clean.png` (`d4d1ae1a…8c8496`) | Frozen §10 reproduction, fixed product: the pet sits over the right third of "Reset to defaults" ("Reset to def" visible); the left part and the center are free. |
| 13 | ZH `native-5cd63ff-v2-visual-zh-375-before-f359be6-clean.png` (`2953a2c2…5817`) | Before product in ZH: cards run past the block's right border (H10 b, ZH). The footer stacks 保存生效 above 恢复默认. Reference only. (P1)(P2) |
| 14 | ZH `…-zh-375-clean.png` (`25459678…db57`) | Fixed clean pane in ZH. Cards sit inside the block; 任务…冥想 and their one-line descriptions render. Divider and 恢复默认 (84×44) on the right. No issue. (P1)(P2)(P3) |
| 15 | ZH `…-zh-375-all8.png` (`6245b7b0…2f61`) | All CJK glyphs render. Each card reads "…未保存。" above 重试 and 放弃. 导出功能草稿 and 放弃全部更改 share one row; then the divider and 恢复默认. No overlap, clipping or truncation. (P1)(P2)(P3) |
| 16 | ZH `…-zh-414-all8.png` (`8486eac7…5719`) | As #15 with 302 px cards. No issue. (P1)(P2)(P3) |
| 17 | ZH `…-zh-768-all8.png` (`8799077b…2272`) | Rail at the left; one column of 570 px cards; 重试 and 放弃 span the card. No issue. (P1)(P2)(P3) |
| 18 | ZH `…-zh-1024-all8.png` (`6049e79b…4396`) | Chinese sidebar (设置, with 功能 active); one column of 574 px cards. No issue. (P1)(P2)(P3) |
| 19 | ZH `…-zh-1440-all8.png` (`8dc88e96…e72e`) | Two columns; the one-line ZH descriptions keep rows aligned. Actions share one row; 恢复默认 is right. No issue. (P1)(P3) |
| 20 | ZH `…-zh-375-dialog.png` (`3d2fdb65…86ab`) | "功能有未保存的更改。"; 留下 is focused with an outline; 导出当前草稿 is on the same row and 放弃本地更改并离开 on a second row. Fully inside the viewport; no backdrop (pre-existing). |
| 21 | ZH `…-zh-375-partial.png` (`66d76d81…6271`) | All on; 日历未恢复默认。 and 习惯未恢复默认。 appear with 重试 and 放弃. Actions share one row; 恢复默认 is right; no 已恢复默认设置。. No issue. (P1)(P2)(P3) |
| 22 | ZH `…-zh-375-reload.png` (`84e07ed5…492a`) | 四象限 reads "已保存的四象限不可用。请重新读取；这不是新的未保存更改。", wrapping at a normal CJK break, above a full-width 重新读取. No issue. (P1)(P2)(P3) |
| 23 | ZH `…-zh-768-pet-on-before-f359be6-clean.png` (`32b9dff7…2cdff`) | Frozen §10 reproduction, before product: the pet covers the right half of 保存生效; 恢复默认 is free. |
| 24 | ZH `…-zh-768-pet-on-clean.png` (`bc54641a…43340`) | Frozen §10 reproduction, fixed product: the pet covers most of 恢复默认 (only "恢复" visible), including its center. |

**Result.** No image shows a presentation defect introduced by this caller. The pet overlap in #11, #12, #23 and #24 is the flagged observation of §10.

## 9. Keyboard and focus results (E15)

Trusted CDP `Input.dispatchKeyEvent` only.
- **Focus placement.** Focus moves only by Tab or Shift+Tab, and by the product's own focus management. The single exception is one fixture-owned, removable `tabindex` used for the scroll positive control.
- **Widths.** EN runs at 1024×768 (records L952–L1134). ZH runs at 375×812 (records L951–L1133).

| Requirement (§9 Keyboard; controller decision 4) | Result, EN 1024 and ZH 375 | Log lines EN / ZH |
| --- | --- | --- |
| Tab reaches every control in DOM order with visible focus | **Clean:** 26 presses from the sequential-navigation start point, which is the rail pet toggle used to hide the pet (EN; recorded as `body` in ZH because the toggle is hidden at 375). The walk passes 2 topbar stops and 14 sidebar rows, then the 9 pane controls in DOM order (8 switches, Reset), then leaves the document. **All 8:** Shift+Tab from `switch:meditation` walks back the 21 preceding pane controls in reverse DOM order and exits to `sidebar:About`/`sidebar:关于`. Tab then walks all 27 controls in DOM order (switch, Retry, Discard ×8; Export; Discard all; Reset). **Source-only:** 10 controls, with Reload directly after `switch:matrix`. Every pane stop matches `:focus-visible`, has a 2 px solid outline in `oklch(0.57 0.085 165 / 0.58)` at a 2 px offset, is center-hit (uncovered) and is in the viewport. The focus-scroll overhang is at most 0.39 px EN and 0 ZH: sub-pixel, from whole-pixel focus scrolling over fractional card heights; tolerated below 1 px and recorded per stop | L952, L1072, L1117 / L951, L1071, L1116 |
| Space and Enter activate a switch exactly once; no page scroll on Space; `aria-checked` follows the draft | 14 activations per language. **Success path:** Tasks Space → `false`, Enter → `true`; Boards Enter → `false`, Space → `true`; Calendar Enter → `false`; Meditation Space → `false`. **Denied path:** alternating Space and Enter on all 8. Each activation has exactly 1 trusted keydown and keyup on the switch, 1 trusted click and exactly 1 `set` with the expected bytes (turning a module on stores `"true"`, never a removal), and 0 other writes. `aria-checked`, the `on` class and the "— on/off" name agree; denied drafts keep the stored bytes; focus stays on the switch. For Space, every scroll offset and the switch's top and bottom are unchanged. **Positive control:** Space on a focused non-interactive intro scrolls `.module-settings` (EN 0→676, ZH 180→832), so a Space-triggered scroll would have been seen | L954–L989 and L1008–L1061 / L953–L988 and L1007–L1060 |
| Reset confirmation, keyboard path | **Enter on Reset:** exactly 1 native confirm with the §5 text, 1 trusted click, declined. 0 get/set/remove attempts on the 8 keys and 0 writes anywhere; no state change; focus stays on Reset. **Space on Reset:** exactly 1 confirm, accepted. One remove per stored key (Tasks, Boards, Calendar, Meditation), 0 sets, no remove for the 4 absent keys; "Defaults restored." / "已恢复默认设置。"; all on; focus stays on Reset. **Partial reset by keyboard** (Matrix `removeItem` denied): 1 confirm; Boards removed and Matrix denied; 0 sets; "Matrix was not reset to its default." / "四象限未恢复默认。" kept, with no restored claim; focus stays on Reset | L998, L1003, L1126 / L997, L1002, L1125 |
| Dialog: focus enters, Tab and Shift+Tab wrap, Escape = Stay, focus returns | **Opened by Enter on the Tab-focused `sidebar:About`/`关于`:** focus enters the dialog. Tab goes Stay → Export → Discard → Stay (wrap); Shift+Tab goes Discard (wrap) → Export → Stay, each with a visible outline. Escape closes it with location `{pathname, key, state}` unchanged and 6 drafts kept; focus returns to the sidebar row. **Opened by `router.navigate('/app/tasks')` with focus on `switch:pomodoro`:** Shift+Tab from the container wraps to the last action and Tab to the first; Escape returns focus to `switch:pomodoro`. **Enter on the focused Stay:** exactly 1 trusted click; the dialog closes; focus returns to `switch:habits` | L1084, L1091, L1096 / L1083, L1090, L1095 |
| Focus after a successful Retry → that field's switch | Retry Boards by Enter after its write is allowed again: 1 write (`false`, ok), the block is removed, focus → `switch:board`. (A Retry that still fails, Tasks: 1 denied attempt, the block stays, and focus stays on `retry:tasks`, so it is not lost.) | L1076 (L1073) / L1075 (L1072) |
| Focus after Discard → that field's switch | Space on Discard Tasks: 1 click, 0 writes, the block is removed, Tasks displays its stored state (on), focus → `switch:tasks` | L1079 / L1078 |
| Focus after Discard all → Reset to defaults (inside `.features-pane`) | Enter on Discard all: 1 click, 0 writes; all blocks and the Export/Discard-all row are removed; displayed values equal the stored bytes; focus → `reset`, visible, inside the pane | L1098 / L1097 |
| Focus after Reload → that field's switch | Enter on Reload Matrix with `yes` still stored: 0 writes, the alert is kept, focus → `switch:matrix`. After an external repair to `false`, Space on Reload: 0 writes, the alert is cleared, no Saved claim, Matrix displays off, focus → `switch:matrix` | L1118, L1122 / L1117, L1121 |
| Additional: Retry of a reset draft | Enter on Retry Matrix (`not-reset`): exactly 1 remove, never a write. The block is removed and focus → `switch:matrix`. The status then reads "Defaults restored." / "已恢复默认设置。" (recorded, not gated; E10 owns the status) | L1130, L1133 / L1129, L1132 |

## 10. Flagged for a controller ruling: DesktopPet default position at 768×1024 (observation, not gated)

**Facts.** The source is the `pet-on-default-position` observations (EN L29–L98 before and L142–L309 fixed; ZH L29–L97 and L141–L308), screenshots #11, #12, #23 and #24.

- **Mount state.** The production App mounts the pet on after every load (`App.tsx` `useState(true)`). Its default position is the viewport's bottom-right corner with a 24 px inset (`resolveDefaultPetPos`); at 768×1024 its box is 660–732 × 916–988.
- **Why it overlaps.** The pane's last control cannot be scrolled above that band at 768×1024: it ends the `.module-settings` scroll range.
- **`f359be6`.** "Save & apply" (EN, 604.36–717 × 934.63–978.63) and "保存生效" (ZH, 607–717 × 935.38–979.38) have their centers on the pet, with 3 of 5 points on the pet in both languages. The old "Reset to defaults" / "恢复默认" to their left is free.
- **`5cd63ff` EN.** "Reset to defaults" (576.45–717 × 934.63–978.63) has its center on the button, with 2 of 5 points (the right insets) on the pet.
- **`5cd63ff` ZH.** "恢复默认" (633–717 × 935.38–979.38, 84 px wide) has its center on the pet, with 3 of 5 points on the pet.
- **Other widths.** There is no pet coverage at 375, 414, 1024 or 1440 in either product or language.

**Reading (verifier's).**
- **The occluder is protected.** It is the DesktopPet (`xai-web-pet`, App level), outside the caller's §11 files.
- **The occlusion is pre-existing in kind.** The same pixel region covered `f359be6`'s "Save & apply".
- **Why it now lands on Reset.** The approved D3 change removed "Save & apply" and right-aligned the Features-local Reset, so the covered control is now Reset instead of the inert Save.
- **Other access paths.**
  - The keyboard reaches Reset (§9).
  - At 768 px the rail's pet toggle is visible.
  - The pet is draggable.
  - In EN the button's center stays clickable.
- **Precedent.** The accepted Sticky E14 and Features E12 visual and host compositions ran without the pet, and this run's gated checks follow them, so the result above is PASS.

**Decision needed.** Should §9 "It is not covered" include the production DesktopPet at its default position?
- **If yes:** this section, its four screenshots and log lines are the frozen reproduction.
  - Contract section: §9 "Responsive presentation".
  - Impact: at 768×1024 with the default pet, a pointer click at the center of the ZH Reset button lands on the pet, and the right third of the EN button is covered. Other paths remain.
  - Any repair would be the controller's and would be ordered separately. This verifier fixes nothing.
- **If no:** this is a candidate for pet/shell follow-up work outside CP-FEATURES-01.

## 11. Diagnostic iterations and harness development disclosure

**`v1` (iteration 1, kept, superseded for screenshot fidelity).**
- **What passed.** Both `v1` runs passed every check, and their tables, geometry and pet observations are identical to `v2`.
- **The defect.** On review, the `v1` full-pane captures did not reproduce the realistic layout. Growing the viewport height removed the `.module-settings` classic scrollbar (10 px at all five widths), so the captured content was 10 px wider than at the realistic viewport.
  - At 768 and 1024 px this crossed the grid's two-column threshold: two ~281 px columns instead of one 570/574 px column (seen in `v1` 768 and 1024).
  - At 375, 414 and 1440 px the cards were wider than reality.
- **The fix.** `v2` adds the capture-only gutter pin and the three capture-fidelity preconditions per full-pane capture (27 per run). The only difference between the harnesses is that edit: `captureTall` in the runner, and `captureGeometry`, `classicScroller`, `pinScrollbarGutter` and `unpinScrollbarGutter` (plus three `verify` exports) in the fixture.
- **Byte-for-byte check.** Reversing exactly that edit on the committed files reproduces the `v1` runner `9b8b7b698e07a8d118ac9bf2215c317d0e0693715ff8ec6a571525d7afe24953` and fixture `7a6561e625885d10f66893ed0106226ad92d61101e92f1f0852e832378f1d70b`. This was verified in the session scratchpad; it is not committed.
- **Status of `v1` images.** They are not evidence. I opened EN 375, 414, 768 and 1024 all-8 (the defect is visible at 768 and 1024). Their hashes:

| `v1` screenshot | SHA-256 |
| --- | --- |
| EN `native-5cd63ff-v1-visual-375-before-f359be6-clean.png` | `67cfc1f4fe5ec97280e0bcd60ce1c3677ffc8ab21deb1a8aded7d968c4343f1a` |
| EN `…-v1-visual-768-pet-on-before-f359be6-clean.png` | `f2679c671570e9fa2e065660c3c879a0df7bcfcd5cb05cfb50d24c10c893758d` |
| EN `…-v1-visual-375-clean.png` | `4da3b23add90c7261ee638f111582746fb815af698cc3cdca20f2f4ee8d6cf16` |
| EN `…-v1-visual-768-pet-on-clean.png` | `199f13945e776011652fda6830690936af9cc011ac3dda3d4e63df90b5325f56` |
| EN `…-v1-visual-375-all8.png` | `dab0d90ec18e3d95b7fa885c0fffff44d06dd09ba431d6bf0ed3765d670497bb` |
| EN `…-v1-visual-414-all8.png` | `78ae2bb9e039da21a3e55f5a475a839031dd260ebc6a8e9abc993676f934eee6` |
| EN `…-v1-visual-768-all8.png` | `72f5cca1d11ab0da283871e60f57ae81c97a06d10d2e70eaa1810859460d4ef7` |
| EN `…-v1-visual-1024-all8.png` | `98ecf45993cbbf58c7fef42a703d5724be5aea1570f6f4319b151aee07caddf9` |
| EN `…-v1-visual-1440-all8.png` | `7b98ddd30063323d10d2f3d4ca76f41c5cbad9505d46bf72a217a377f0545fa8` |
| EN `…-v1-visual-375-dialog.png` | `8cb486b0ca654eaaee7adc71e6b62f500a01ee070967d83815287fad00591ada` (viewport capture; byte-identical to `v2`) |
| EN `…-v1-visual-375-partial.png` | `c5ab06c07bced9ddbeffcebb4f9e53020c72110461827e05b19b342012a58bb3` |
| EN `…-v1-visual-375-reload.png` | `ca4e322582e55f77b7b2eb95f72eced7a9be8093189120d0831ccaf4fa0584fb` |
| ZH `…-v1-visual-zh-375-before-f359be6-clean.png` | `cde08209d08880aa6d057f27203248d455be649ebd46fda3ba1c77d23105eaed` |
| ZH `…-v1-visual-zh-768-pet-on-before-f359be6-clean.png` | `fb893351ba747270a2c0dd7d604348bdde05f25038c807683d18be4f13021fee` |
| ZH `…-v1-visual-zh-375-clean.png` | `d2fad6c15d9530b67416b8bb9ec4c6a15e1482080f347fa91676d312124bb4d7` |
| ZH `…-v1-visual-zh-768-pet-on-clean.png` | `bc54641a97ca69886db868724bf4f458caa6913bf331658259ef17e855843340` (viewport capture; byte-identical to `v2`) |
| ZH `…-v1-visual-zh-375-all8.png` | `f8a6cec23c73c39f75115356c316c706a4239ec0171c4831e267a5d5b7e44ea9` |
| ZH `…-v1-visual-zh-414-all8.png` | `8547ef1bbb66bf93bc823039ccb56418d98189eeac7f35af7b635ec00e73cd55` |
| ZH `…-v1-visual-zh-768-all8.png` | `b27d76b7dd04af1b899572d425b0d22a7dbb6381474d162ed3b9e63635c43da3` |
| ZH `…-v1-visual-zh-1024-all8.png` | `8f56e7df07f7c33e3d958bfae0f0f455e4e2ebe63fc1cfb9493dc0300df5caea` |
| ZH `…-v1-visual-zh-1440-all8.png` | `857076f71ae389e66121d30a75a857df21032428f0173082e150f98dfe47b24c` |
| ZH `…-v1-visual-zh-375-dialog.png` | `3d2fdb65506cf5cf06628bb8f5326258e0d28f494a68267f9726d7699ae586ab` (viewport capture; byte-identical to `v2`) |
| ZH `…-v1-visual-zh-375-partial.png` | `97042931bb6ebe4c219dc24117683bd2518f076f15a8eddd90c6ba99c780ef09` |
| ZH `…-v1-visual-zh-375-reload.png` | `3f89e21adab7616d3901bfb6d33b90fe3eaff1fe72960862a6058d9de7be1a9a` |

**Development probes (before `v1`, not evidence, not committed).** They ran with evidence redirected to the session scratchpad through `XAI_VISUAL_EVIDENCE_DIR`, which the runner refuses inside the repository. They were EN `dev1`, `dev2`, `dev3`, `dev5`, `dev6` and `dev7`, and ZH `dev4` and `dev6`. They found only harness issues:

| Probe | Issue found | Change made |
| --- | --- | --- |
| `dev1` | esbuild's `<define:import.meta.env>` pseudo-input was counted as an archive file in the drift precondition | Filter it out |
| `dev2` | The clean Tab-walk visibility check failed because a focused switch ended 0.03 px past the viewport bottom against a 0.01 px tolerance | Tolerate a sub-pixel (< 1 px) focus-scroll overhang and record the overhang of every stop. Disclosed because it relaxes a threshold; it was made before any evidence run, and the largest recorded overhang in evidence is 0.39 px |
| `dev5` | In the Enter-on-Stay flow the harness pressed Tab before the coordinator's focus effect had moved focus into the dialog | Wait (bounded, 3 s) for focus to enter. In that flow this is a new product check, `keyboard:dialog-focus-enters-before-enter-on-stay` |
| — | Not tied to a failure | Recorded the Tab-walk start point; added the 768 pet-on captures |
| `dev7` | Validated the capture-fidelity fix | Made after `v1` |

No probe showed a product failure. `dev3`, `dev4` and `dev6` passed in both languages with the same results.

## 12. Other non-gating observations

None of these is a §9 requirement failure, and none is introduced by this caller's presentation.

1. **(P1)–(P3)** are pre-existing presentation (§8): the Toggle shape, thumbnail artwork cropping in its fixed 130 px box, and the Meditation artwork.
2. **Departure dialog.** It has no backdrop and covers the bottom rail band at 375 px. This is pre-existing in the protected coordinator, as noted for More and Sticky.
3. **Status after Discard all.** After the keyboard Discard all, the status line reads "Features settings saved." (L1098). Earlier keyboard operations in the same mount committed: the Boards Retry and the K2 writes. This matches the §5 item 7 rule (a genuine latest success in this mount and no current drafts). It is recorded for the acceptance reviewer; E9 and Sol own Saved truth.
4. **Accessible names in ZH.** Switch names embed English "on/off" in ZH (for example "任务 — on"). This is unchanged and kept by contract (UX-05).
5. **Card alignment at 1440 EN.** Cards in the same grid row align their internal content only when descriptions wrap alike (§8 #7).

## 13. Limitations

- **Environment.**
  - Headless Chrome 154 on macOS, with mobile emulation at 375 and 414 (mouse and keyboard input, no touch).
  - A synthetic auth session in a real production App composition; not Tauri.
  - A React development build bundled by esbuild from the archive, without StrictMode. `AppProviders`' component, `bootstrapObservability()` and `registerServiceWorker()` are not mounted or called, as in E4, E9 and E13.
  - No external network, so the Google Fonts stylesheet is not loaded and system fonts render the text. Text-wrapping heights may differ from production; the 280 px track logic does not depend on fonts.
  - Dependency trees are reused read-only; the lockfile gate is a consistency check only.
- **DesktopPet.** The gated checks ran with the pet off; its default position was observed only in the clean state of each width (§10). The pet's tip bubble and other positions were not explored.
- **Screenshots.** Full-pane captures pin the scroll container's scrollbar gutter for the duration of the capture. Each capture is proven layout-equal to the realistic viewport, but it is not the literal on-screen frame at one scroll position. Viewport heights are the verifier's choice; the contract specifies widths only.
- **Keyboard scope.** One width per language (EN 1024, ZH 375). Visible focus is judged from `:focus-visible`, the computed outline and the uncovered, in-viewport state of each stop, plus the focused Stay in the dialog captures; there is no per-stop pixel comparison.
- **Dialog containment.** Judged against the dialog box and the viewport (the Sticky ruling).
- **Not an accessibility audit.** No screen reader output, forced colors, zoom beyond these widths, high-contrast or dark theme.
