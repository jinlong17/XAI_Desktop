# Sticky EN/ZH five-width presentation and keyboard at `f359be6` (CP-STICKY-01, batch 15)

**Verdict: PASS for both runs (`visual` = EN, `visual-zh` = ZH).** Each run: 577 checks (123 preconditions, 454 product checks, 340 of them deferred so that every width is measured), 0 failures, 0 runtime exceptions, 0 `console.error`, 0 console warnings, 9 screenshots, exit 0.

- **Every control, every width, both languages.** The 13 swatches, the font select, both switches and the 4 spacing cards were checked in four states: clean, all five fields unresolved, source-only Reload, and the departure dialog (its three actions). Each control was scrolled into view and hit-tested at its center plus four inset points. Each was horizontally contained (in `.settings-detail`; dialog actions in the dialog box and the viewport, see §5) and inside the viewport. The document, `.settings-detail`, the pane and the only scroll container (`.module-settings`) never scroll horizontally.
- **Sizing.** Every recovery button (Retry, Discard, Reload), pane action (Export, Discard all) and dialog action is at least 44×44 at every width; the smallest measured target is exactly 44 px. Swatch and card geometry equals 2023526 when both show the same values. Switch track, knob and row alignment equal 2023526. The stylesheet diff `2023526..f359be6` only adds selectors under `.sticky-recovery-*`.
- **Screenshots.** All 18 were opened and reviewed by hand (§7). There is no overlap, clipping, truncation, misalignment, unreadable text or broken rendering introduced by this caller. The clean 375 px capture is byte-identical to the 2023526 capture in both languages.
- **Keyboard** (EN at 1024×768, ZH at 375×812): 105 keyboard checks per language pass. Trusted Tab reaches every control in DOM order with a visible 2 px focus outline. Space and Enter activate a swatch, a card and both switches exactly once, with no page scroll on Space; a positive control proves the scroll detector works. The native select changes once per keyboard choice. ARIA state follows the displayed draft. The dialog takes focus, wraps Tab and Shift+Tab, treats Escape as Stay and returns focus to the prior element.

**Status.** This is independent verification only. It is **not acceptance**. It changes no product file, no existing evidence, contract, ledger or control plane. It closes no 312 item: `SET-12`, `REL-05`, `QA-01`, `QA-03`, `QA-04`, `QA-09` and D2/REL/AI stay open. It does not push, merge, deploy, release or sync Web→Desktop. Final regression (batch 16) and independent acceptance (batch 17) remain.

## 1. Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, parent-role visual and keyboard verifier for batch 15. It did not write the contract, the Sticky caller, the coordinator fix, the oracles or any earlier harness |
| Worktree | `.claude/worktrees/agent-a0869daa99d6c945b`, detached at docs base `a0df253363fd0ffdaff34563031905bdc8220c11` (clean before the runs) |
| Candidate | requested `f359be6` → resolved `f359be6d838393e0f9e93efd80b88b5b09f6144e` (line 1 of each log) |
| Geometry reference | requested and resolved `20235269749dad514833d76c27b958f694d0e4e9` (the contract's before product), used only for the as-is geometry comparison |
| Product tree equality | `git diff --name-only f359be6 HEAD -- apps packages package.json pnpm-lock.yaml` is empty; both logs assert it (`productDeltaVsDocsHead: ""`) |
| Dependency gate | `XAI_DEPS_ROOT` = main checkout, read-only. `pnpm-lock.yaml` SHA-256 `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for the dependency tree and both archives |
| Browser / toolchain | Chrome `154.0.8037.97` headless (`--headless=new`, protocol 1.3); Node `v24.16.0`; esbuild `0.28.1`; deviceScaleFactor 1 |
| Viewports | 375×812 and 414×896 (mobile emulation), 768×1024, 1024×768, 1440×900 (desktop) |
| Network | Only two local `127.0.0.1` servers (ephemeral ports, one per archive, so the two products never share storage) and local Chrome DevTools |
| Evidence iterations | `visual` and `visual-zh` each ran exactly once as evidence (suffix `v1`). No product failure, so no `v2`. Harness development runs are disclosed in §10 |

## 2. Commands

Run from the worktree root. `XAI_NATIVE_TMPDIR` only places the temporary archives and the Chrome profile in the session scratchpad; the runner deletes them.

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
XAI_NATIVE_TMPDIR=<session scratchpad>/tmp \
  node docs/reviews/web-sticky-recovery-native/verify-visual.mjs f359be6 visual v1
# -> PASS docs/reviews/web-sticky-recovery-native/native-f359be6-v1-visual.log checks=577 screenshots=9   (exit 0)

XAI_DEPS_ROOT=… XAI_NATIVE_TMPDIR=… node docs/reviews/web-sticky-recovery-native/verify-visual.mjs f359be6 visual-zh v1
# -> PASS docs/reviews/web-sticky-recovery-native/native-f359be6-v1-visual-zh.log checks=577 screenshots=9   (exit 0)
```

## 3. New files and hashes

Runner and fixture hashes equal the `runnerSha256` and `fixtureSha256` recorded on line 1 of both logs. Each screenshot hash equals the value logged in its `screenshot` record.

| File | SHA-256 | Size |
| --- | --- | --- |
| `verify-visual.mjs` (runner) | `82992939865e550222ff1ce247c6d1433575ae13284dacbd60f73e216fdeea46` | 1092 lines |
| `native-visual.tsx` (fixture) | `af3f853bb8e9dc5d66f1a03fa7e006e965260e6d7198d19c8d0d966a3d258e89` | 531 lines |
| `native-f359be6-v1-visual.log` | `f75916a9bc335c109811c1933302a732d925a09127f5373dff800dbf5ce33357` | 649 lines |
| `native-f359be6-v1-visual-zh.log` | `bb9893b20fef0e143aaa814e497d8eebc40ababb78d72ffe8a985b194a571f19` | 649 lines |
| `native-f359be6-v1-visual-375-all5.png` | `0f77ba04144b287e2839681dfe5f24218d438aa52aa2f00b0e5ac78d091042ad` | 375×1412 |
| `native-f359be6-v1-visual-414-all5.png` | `caa1382ce775ae0c758f3c3db84beca16c0714af19d41f9a4e1ab1ebcedabfdf` | 414×1335 |
| `native-f359be6-v1-visual-768-all5.png` | `342b73523a0cb801cae29c8439fb20e3ef1cd6ac4d3d8c3b772780d73febabba` | 768×1088 |
| `native-f359be6-v1-visual-1024-all5.png` | `689ba7e69526bd11a29cf37ef9ec877947dbd570fb0cac1e20eb0466131256f1` | 1024×985 |
| `native-f359be6-v1-visual-1440-all5.png` | `217845b3c53eb738f62aaf593c672fbeb2f5f1894ed8c2f332332e9d900302bc` | 1440×985 |
| `native-f359be6-v1-visual-375-dialog.png` | `a502965b7b6e03ed26858be938602d5809e53257c03236b39fd3d901726df820` | 375×812 |
| `native-f359be6-v1-visual-375-reload.png` | `c29627c0e589da9855b0f77ab7011b2edf329ef73b6498bbea96389b2357f80b` | 375×993 |
| `native-f359be6-v1-visual-375-clean.png` | `44392c06b2d7846b116f383d12a1122dac042c9124ac740513ed6cd33037b430` | 375×892 |
| `native-f359be6-v1-visual-375-before-2023526-clean.png` | `44392c06b2d7846b116f383d12a1122dac042c9124ac740513ed6cd33037b430` (identical to the fixed clean capture) | 375×892 |
| `native-f359be6-v1-visual-zh-375-all5.png` | `a14e4685aee01b708703aac39fb31b08f44bbe6cca8bb1bab632c73c7fe39c9a` | 375×1320 |
| `native-f359be6-v1-visual-zh-414-all5.png` | `54a1e6efd0a76eead6645f687f559f0569e0b7f58a7a1e08085edaee12f7cf37` | 414×1243 |
| `native-f359be6-v1-visual-zh-768-all5.png` | `d8d96055b6af2de241c28fad4719cf4c41610bd0fb7c4f1cd65e05b5bece90a5` | 768×1068 |
| `native-f359be6-v1-visual-zh-1024-all5.png` | `9a658ef4134320058786049c3ff77df02b45b8157479a73e1a3c4d5d258a4f49` | 1024×965 |
| `native-f359be6-v1-visual-zh-1440-all5.png` | `30592be6890b72f8200869c483f41734750d6d6893cc58cb27134b78d8f3ce4f` | 1440×965 |
| `native-f359be6-v1-visual-zh-375-dialog.png` | `278257e2389e061e62af694771ee2a5180121b6f779950f26a2160ece0e874a2` | 375×812 |
| `native-f359be6-v1-visual-zh-375-reload.png` | `cb4638b24db5dbb668d837639e5d2bcbf67d37b55a0ebf5fe1f7f27985b1bed0` | 375×953 |
| `native-f359be6-v1-visual-zh-375-clean.png` | `650bcb70335735771434fac03a6de0128d717d077fbb36b09a5dc91928fdfae9` | 375×852 |
| `native-f359be6-v1-visual-zh-375-before-2023526-clean.png` | `650bcb70335735771434fac03a6de0128d717d077fbb36b09a5dc91928fdfae9` (identical to the fixed clean capture) | 375×852 |
| `review-visual-f359be6.md` | this receipt | — |

**Reused patterns, unchanged.** Line 1 of each log also records the hashes of the four earlier harness files. These were read as patterns and are neither imported nor changed. The hashes equal the frozen values in `post-f359be6.md`: `native-host.tsx` `f9b09180…`, `verify-host.mjs` `77996177…`, `native.tsx` `db5807ef…`, `verify-native.mjs` `14846f80…`.

**Bundles (line 1).**

| Log | Fixed bundle js / css | 2023526 bundle js / css | Inputs per bundle |
| --- | --- | --- | --- |
| EN | `d72a3b82…` / `4a9b4fb5…` | `5fe63f0a…` / `ef0a1533…` | 629: 559 archive, 69 third-party, fixture; 0 foreign |
| ZH | `362e149f…` / `4a9b4fb5…` | `ecb310ec…` / `ef0a1533…` | 629: 559 archive, 69 third-party, fixture; 0 foreign |

- The js differs between languages only by the `__STICKY_VISUAL_LANG__` constant; the CSS is identical.
- Product hashes for 13 files are recorded for both archives. Between the archives, only these four differ:
  - `stickyPane.tsx`, `StickyColorPalette.tsx`, `localI18n.ts` and settings-rest `styles.css` (the caller);
  - `departureCoordinator.tsx` (the F1 fix).
- These are equal in both archives: settings-shell `styles.css`, `Toggle.tsx`, `SettingRow.tsx`, tokens `tokens.css` and `layout.css`, `apps/web` `global.css`, `composedSettingsRegistration.tsx` and `Shell.tsx`.

## 4. Method

- **Composition.** The fixture reuses the batch-9 composition:
  - the production Shell and WebShellProvider with the production module registrations;
  - the production ComposedSettings (sidebar, DepartureCoordinator, settingsDeparture) under React Router's `createBrowserRouter` and `RouterProvider` from `react-router/dom`, at `/app/settings/sticky`;
  - the real Sticky pane, hook and engine;
  - a synthetic account.
  Language is a build-time constant passed to WebShellProvider and Shell, as the production App passes `lang`. `<html lang="en">` stays as in the production `index.html`.
- **Instruments.** All are fixture-owned:
  - an attempt-level Storage log, with per-key setItem denial (DOMException `SecurityError`);
  - a capture-phase trace of `keydown`/`keypress`/`keyup`/`click`/`change`/`input`/`focusin`, recording `isTrusted`;
  - read-only geometry, hit-test, overflow, scroll and focus probes.
  Fixture seeding uses captured native Storage functions and is never counted.
- **States.** Every state is reached through trusted input; the font select is focused by script, then typed into by a trusted key. Results are logged as `width` records, lines 75–507.
  - **Clean.**
  - **All five unresolved.** Writes for the five keys are denied, then: swatch `mint`, typeahead font `xl`, both switches toggled, card `xl`. This yields five `… was not saved.` blocks (10 Retry/Discard buttons) plus Export and Discard all. Exactly one denied write per field; the stored bytes stay absent (L182).
  - **Departure dialog.** It opens over the all-five state by a trusted, hit-tested sidebar click (L321).
  - **Source-only Reload.** After Discard all (zero writes), the font key is seeded with out-of-domain `huge` and the page reloaded.
- **Per-control check.**
  - `scrollIntoView({block:"center"})`, then `elementFromPoint` at the center and four inset points. For round swatches and switches the inset points are ±0.2 from center, inside the circle.
  - Horizontal containment within `.settings-detail`'s border box.
  - Inside the viewport, visible, and no internal text overflow for buttons and cards.
  - Each recovery, pane and dialog target at least 44×44.
- **Layout check.** No horizontal overflow and `scrollLeft === 0` for `document.documentElement`, `.settings-detail` and `.sticky-pane`, plus every ancestor scroll container (only `.module-settings` scrolls). Pairwise overlap is checked across sibling parts: pane children, section children, setting-row parts, recovery-block parts, swatches, cards, pane actions and dialog parts. Text boxes in recovery messages and the dialog are checked for clipping.
- **Geometry reference.** 2023526 is measured at the same five widths and language in two states: clean, and showing the same values as the all-five drafts (`mint`/`xl`/off/on/`xl`, set by trusted input in its own origin).
  - **Why matched states.** A pressed card renders a bold label (`layout.css` `.sn-sp.active .sn-sp-label { font-weight: 600 }`), so widths are only comparable when the same card is pressed. The runner refuses (precondition) to compare unless pressed, checked and select states match.
- **Screenshots.**
  - **All-five, Reload and clean captures** are full-pane captures. The viewport height is grown until no scroll container around the pane overflows (`remainingOverflow: 0` in every `screenshot` record), the image is clipped to the `.settings-detail` band at full viewport width, and the realistic height is restored. All hit-tests run at the realistic heights.
  - **Dialog captures** are realistic-viewport images with the trusted-Tab-focused Stay action.

## 5. Per-language, per-width results

Each cell shows **controls checked / hit-test / containment / in-viewport**, then the smallest target width × height over the 44 px targets. Document, detail and `.module-settings` widths are `scrollWidth/clientWidth`.

### EN (`native-f359be6-v1-visual.log`)

| State (log lines) | 375 | 414 | 768 | 1024 | 1440 |
| --- | --- | --- | --- | --- | --- |
| Clean (L75–162) | 20 ✓✓✓ | 20 ✓✓✓ | 20 ✓✓✓ | 20 ✓✓✓ | 20 ✓✓✓ |
| All five unresolved (L205–309) | 32 ✓✓✓, 112.3×44 | 32 ✓✓✓, 131.8×44 | 32 ✓✓✓, 48.11×44 | 32 ✓✓✓, 48.11×44 | 32 ✓✓✓, 48.11×44 |
| Dialog actions (L339–412) | 3 ✓✓✓, 50.39×44 | 3 ✓✓✓, 50.39×44 | 3 ✓✓✓, 50.39×44 | 3 ✓✓✓, 50.39×44 | 3 ✓✓✓, 50.39×44 |
| Source-only Reload (L440–507) | 21 ✓✓✓, 257×44 | 21 ✓✓✓, 296×44 | 21 ✓✓✓, 57.95×44 | 21 ✓✓✓, 57.95×44 | 21 ✓✓✓, 57.95×44 |
| Document | 375/375 | 414/414 | 768/768 | 1024/1024 | 1440/1440 |
| `.settings-detail` | 317/317 | 356/356 | 648/648 | 672/672 | 738/738 |
| `.module-settings` | 365/365 | 404/404 | 686/686 | 942/942 | 1378/1378 (1368/1368 with its scrollbar) |
| Smallest gap from a pane control to the detail edge | 30 px | 30 px | 38 px | 48 px | 48 px |

### ZH (`native-f359be6-v1-visual-zh.log`)

| State (log lines) | 375 | 414 | 768 | 1024 | 1440 |
| --- | --- | --- | --- | --- | --- |
| Clean (L75–162) | 20 ✓✓✓ | 20 ✓✓✓ | 20 ✓✓✓ | 20 ✓✓✓ | 20 ✓✓✓ |
| All five unresolved (L205–309) | 32 ✓✓✓, 103×44 | 32 ✓✓✓, 103×44 | 32 ✓✓✓, 44×44 | 32 ✓✓✓, 44×44 | 32 ✓✓✓, 44×44 |
| Dialog actions (L339–412) | 3 ✓✓✓, 49.78×44 | 3 ✓✓✓, 49.78×44 | 3 ✓✓✓, 49.78×44 | 3 ✓✓✓, 49.78×44 | 3 ✓✓✓, 49.78×44 |
| Source-only Reload (L440–507) | 21 ✓✓✓, 257×44 | 21 ✓✓✓, 296×44 | 21 ✓✓✓, 68.48×44 | 21 ✓✓✓, 68.48×44 | 21 ✓✓✓, 68.48×44 |
| Document / detail / `.module-settings` | as EN | as EN | as EN | as EN | as EN |

- **Other checks, every state and width.** No overlap; no clipped recovery or dialog text; buttons and cards free of internal text overflow; every expected control present in the expected DOM order (`pane-controls-in-dom-order`).
- **Dialog box.** Fully inside the viewport, with no horizontal overflow, at all five widths. The focused Stay action keeps a 2 px solid outline at every width (`dialog:<width>:focused-action-visible-outline`).
- **Dialog wording and route.** The wording is exact: EN `Unsaved Sticky Note draft` / `Sticky Note has unsaved changes.`; ZH `未保存的便签草稿` / `便签有未保存的更改。`. The route is held, and Stay keeps the route and all five drafts.

**Dialog containment (interpretation, flagged).** The departure dialog is rendered by the protected coordinator as a viewport-fixed overlay:
- CSS `.settings-departure-dialog { position: fixed; inset: auto 1rem 1rem; max-inline-size: min(100% - 2rem, 34rem) }`, unchanged since 2023526 and shared by every Settings caller;
- it is not a descendant of `.settings-detail`.
Its actions were therefore checked against the dialog box and the viewport, which is also what the accepted More visual audit used.

The raw relation to `.settings-detail` is logged per width as `inDetail`:

| Width | Actions inside `.settings-detail` horizontally | Why |
| --- | --- | --- |
| 375, 414 | all three | — |
| 768 | Export and Discard only | Stay starts at the dialog's 16 px left inset, left of the detail's 91 px edge |
| 1024, 1440 | none | The dialog sits at the viewport's left, over the rail and sidebar |

A literal "inside `.settings-detail`" reading would require a coordinator change. That surface is protected and outside the caller's §11 files, so it cannot be a Sticky caller defect. The acceptance reviewer should confirm this reading.

## 6. Geometry comparison with 2023526 and stylesheet check

60 geometry checks per language pass (`swatches-not-smaller…`, `cards-not-smaller…`, `swatch-order-ids-and-css-variable-backgrounds-preserved`, `spacing-ids-and-card-box-preserved`, `color-variables-unchanged`, `switch-track-knob-and-row-alignment-equal-2023526`; log lines 57–308). The 2023526 reference measurements are `before-width` records L17–49.

| Element | 2023526 | f359be6 | Result |
| --- | --- | --- | --- |
| Swatches (13) | 30×30 at every width and language | 30×30 | Equal. Inline `background` styles, computed backgrounds, order and `data-color-id` are identical. The conic `random` swatch is preserved. The 12 `--sticky-note-color-*` values are equal |
| Cards, clean (EN) | none 60, normal* 61.36, large 68, xl 87.53 (×68.69) | same | Equal; padding 10 px, min-width 60 px, border and radius identical (* = pressed) |
| Cards, matched / all-five (EN) | none 60, normal 60.25, large 68, xl* 88.81 (×68.69) | same | Equal |
| Cards, clean and matched (ZH) | none 60, normal 60, large 68, xl 78 (×68.69) | same | Equal |
| Switches | 46×44 box; knob 22×22 at (22,2) when on and (2,2) when off; same offset from the row content box | same at every width and state | Equal: track, knob and row alignment preserved. In the all-five state the restore row also shows its 1 px bottom divider, because a recovery block now follows it (`.setting-row:last-child` no longer matches). The pin row always has this divider. Alignment is measured against the row content box, so the divider is recorded, not counted |
| Font select | EN 106×44, ZH 57×44 | same | Equal (recorded) |
| Clean 375 px capture | `44392c06…` (EN), `650bcb70…` (ZH) | same hashes | Pixel-identical |

**Stylesheet.** `git diff 2023526 f359be6 -- '*.css'` (logged as `css-diff`, L6):
- touches only `packages/plugin-web-settings-rest/src/styles.css`: 42 lines added, 0 removed, so existing `.sn-*` rules and color variables are unchanged;
- the only at-rule is `@media (min-width: 768px)`;
- all 14 new selector occurrences (10 at top level, 4 inside the media block) are under `.sticky-recovery-*`. The distinct selectors are `.sticky-recovery-field`, `.sticky-recovery-text`, `.sticky-recovery-text > span`, `.sticky-recovery-field button`, `.sticky-recovery-actions button`, `.sticky-recovery-field button:only-of-type`, `.sticky-recovery-actions`, `.sticky-recovery-actions p` and `.sticky-recovery-saved`;
- checks `css:only-settings-rest-stylesheet-changed`, `css:additions-only-existing-rules-unchanged`, `css:new-selectors-scoped-to-sticky-pane-or-sticky-recovery` and `css:at-rules-are-media-only` pass.

## 7. Manual screenshot review (every image opened and inspected)

Review criteria: overlap, clipping, truncation, misalignment, unreadable text, broken switch rendering.

**Recurring pre-existing items.** These appear identically in the 2023526 captures (byte-identical clean images) or in the accepted More captures. They are listed once here and referenced as (P1)–(P3) below.
- **(P1) Switch shape.** The shared Toggle renders as a 46×44 round shape with the knob 2 px from the top: `.module-settings .toggle { width: 46px; height: 26px; min-height: 44px }`. It is identical at 2023526 and in the accepted More capture. Contract §9 requires this alignment to be preserved, not repaired.
- **(P2) White swatch.** The `white` swatch is nearly invisible on the white panel; it shows as a gap in the palette row.
- **(P3) Text-style buttons.** Recovery and pane actions render as text-style buttons with no border or background, because of the global `button` reset. They are legible and at least 44×44, as in the accepted More captures.

| # | Image | Manual review |
| --- | --- | --- |
| 1 | EN 375 all-five | Complete pane from title to Discard all. Swatches wrap 7+6; the pressed `mint` ring is visible. Each `… was not saved.` line sits above Retry/Discard in two equal columns. "Extra-Large" is fully visible in the select. Recovery blocks sit inside the rounded section box under each switch. Cards wrap 3+1 with the pressed card bold. Export and Discard all stack on two lines. No overlap, clipping, truncation or misalignment; all text readable. (P1)(P2)(P3) |
| 2 | EN 414 all-five | As #1. The palette's first row holds 8 slots (white invisible after mint), and all four cards fit one row. No issue. (P1)(P2)(P3) |
| 3 | EN 768 all-five | Single-column Settings with the dark rail at the left. All 13 swatches on one row. Recovery rows put the message left and Retry/Discard right on one line. The font label stacks above the select. Export and Discard all share one line. No issue. (P1)(P2)(P3) |
| 4 | EN 1024 all-five | Sidebar shown with Sticky Note active. Detail rows are aligned: label left, select or switch right; recovery rows align with their messages. Nothing collides with the sidebar or the panel edge. No issue. (P1)(P2)(P3) |
| 5 | EN 1440 all-five | As #4, with a wider bounded panel. Long description wraps cleanly. No issue. (P1)(P2)(P3) |
| 6 | EN 375 dialog | Bottom decision surface reads "Sticky Note has unsaved changes.". Stay is focused with a visible outline; Export current draft is on the same row and "Discard local changes and leave" on a second row. All three are fully inside the viewport with margins. The surface covers the bottom rail band and has no backdrop (pre-existing, as noted for More). No clipping or truncation. |
| 7 | EN 375 source-only Reload | "Saved Font Size is unavailable. Reload it; this is not a new unsaved change." wraps on two lines above a full-width Reload button. The select displays the default "Large". No other alerts. No issue. (P1)(P2) |
| 8 | EN 375 clean | Clean pane, default values (sun, Large, pin on, restore off, Normal). No issue. (P1)(P2) |
| 9 | EN 375 clean at 2023526 | Byte-identical to #8 (same SHA-256), so the clean presentation is unchanged. (P1)(P2) |
| 10 | ZH 375 all-five | All CJK glyphs render. 便签 description, 默认颜色, `…未保存。` lines with 重试/放弃; the select shows 特大 completely; 恢复默认尺寸 description wraps inside the section box; cards wrap 3+1. 导出便签草稿 and 放弃全部更改 share one line. No overlap, clipping or truncation. (P1)(P2)(P3) |
| 11 | ZH 414 all-five | As #10; all four cards (无/普通/大/特大) fit one row. No issue. (P1)(P2)(P3) |
| 12 | ZH 768 all-five | Single column with the dark rail. Message left, 重试/放弃 right on one line. No issue. (P1)(P2)(P3) |
| 13 | ZH 1024 all-five | Chinese sidebar with 便签 active. Rows and recovery lines aligned; nothing overlaps. No issue. (P1)(P2)(P3) |
| 14 | ZH 1440 all-five | As #13, wider. No issue. (P1)(P2)(P3) |
| 15 | ZH 375 dialog | "便签有未保存的更改。"; 留下 is focused with an outline; 导出当前草稿 shares the row; 放弃本地更改并离开 is on a second row. Fully inside the viewport. No issue (no backdrop, pre-existing). |
| 16 | ZH 375 source-only Reload | "已保存的字体大小不可用。请重新读取；这不是新的未保存更改。" wraps at a normal CJK break above a full-width 重新读取 button. The select shows 大. No issue. (P1)(P2) |
| 17 | ZH 375 clean | Clean pane with Chinese labels. No issue. (P1)(P2) |
| 18 | ZH 375 clean at 2023526 | Byte-identical to #17. (P1)(P2) |

## 8. Keyboard results

Trusted CDP `Input.dispatchKeyEvent` only. Every focus move in this section is a Tab or Shift+Tab press, except that one fixture-owned, removable `tabindex` is used as the scroll positive control.

| Requirement (§9 Keyboard) | EN 1024×768 | ZH 375×812 |
| --- | --- | --- |
| Tab reaches every control in DOM order with visible focus | **Clean:** 53 presses from the document start: 32 Shell and sidebar stops (16 rail, 2 topbar, 14 sidebar rows), then the 20 pane controls in exact DOM order, then focus leaves the document (L512–514). **All five unresolved:** from the last activated card, Shift+Tab walks back through the 26 preceding controls in reverse DOM order and exits to `sidebar:About`; Tab then walks all 32 controls in DOM order (L611–614). **Source-only:** a fresh walk from the document start reaches 21 controls including Reload, in DOM order (L638–640). Every pane stop matches `:focus-visible`, has a 2 px solid outline in `oklch(0.57 0.085 165 / 0.58)` with 2 px offset, and is in the viewport and uncovered | **Clean:** 51 presses, with 30 stops before the pane (the 375 px rail exposes 14 items, plus 2 topbar and 14 sidebar rows), then the 20 controls in DOM order. **All five:** 26 controls back to `sidebar:关于`, then 32 forward. **Source-only:** 21 controls. Identical outline (L512–514, L611–614, L638–640) |
| Space and Enter activate exactly once (swatch, card, switch) | Each activation shows one trusted keydown, one keyup, one trusted click on the target and exactly one write. Success path: swatch Space `mint`, swatch Enter `navy`, pin Space `false`, pin Enter `true`, restore Space `true`, restore Enter `false`, card Space `xl`, card Enter `none` (L519–576). Final bytes are `navy`/`xl`/`true`/`false`/`none` (L577). No write to any other key | Identical sequence and bytes (L519–577) |
| No page scroll on Space | Every scroll offset (window and all pane ancestors) and the control's top/bottom are unchanged for every Space activation. **Positive control:** Space on a focused, non-interactive pane paragraph scrolls `.module-settings` 0 → 35 px (L516), so a Space-triggered scroll would have been seen | Unchanged at `.module-settings` scrollTop 602. The positive control scrolls 188 → 605 px (L516) |
| Native select changes once per keyboard choice | Typeahead `s` → `small` and `e` → `xl`: one trusted `change` and one write each (L532–537). Under denial, `n` → `normal`: one change and one denied write; the stored bytes stay `xl` (L586–587) | CJK typeahead `小` → `small`, `特` → `xl`, `普` → `normal`, with the same counts (L532–537, L586–587) |
| `aria-pressed` / `aria-checked` reflect the displayed draft | With writes denied, each field gets a failed draft by keyboard: coral Space, select `normal`, pin Space → `false`, restore Enter → `true`, card Enter `large`. ARIA follows the draft, `.active`/`.on` agree with ARIA (0 mismatches), and the stored bytes are unchanged (L578–610). All five unresolved by keyboard (L610) | Same (L578–610) |
| Recovery buttons by keyboard (additional) | Enter on Retry Default Color: one click, one write attempt, still failed (L615–616). Space on Discard Font Size: one click, zero writes, block removed (L617–618). Enter on Discard all: one click, zero writes, all blocks removed (L633–634). Enter on Reload Font Size: one click, zero writes, one read of that key, out-of-domain bytes and the alert kept (L641–642) | Same (L615–642) |
| Dialog: focus enters, Tab/Shift+Tab wrap, Escape = Stay, focus returns | Opened with Enter on the trusted-focused `sidebar:About` row. Focus moves to the dialog. Tab goes Stay → Export → Discard → Stay (wrap); Shift+Tab goes Discard (wrap) → Export → Stay, each with a visible outline. Escape closes it with location `{pathname, key, state}` unchanged and four drafts kept; focus returns to `sidebar:About` (L621–625). Opened by `router.navigate('/app/tasks')` with focus on `color:sun`: Shift+Tab from the container wraps to the last action, Tab to the first, and Escape returns focus to `color:sun` (L627–629). Enter on the focused Stay: one click, dialog closed, focus back on `switch:pin_default` (L631–632) | Same with `sidebar:关于` (L621–632) |

## 9. Non-gating observations

None of these is a §9 requirement; none is introduced by this caller's presentation.

1. **Focus after removing the activated button.** After keyboard activation of "Discard <field>" or "Discard all changes", the activated button is removed with its block and focus falls to `<body>` (`keyboard-summary` L644, `postDiscardFocus` and `postDiscardAllFocus`). Contract §9 does not specify post-discard focus, so it is recorded, not gated. Retry and Reload keep focus on their buttons. This is a possible accessibility follow-up for the controller; it was not checked on other callers.
2. **(P1) Switch shape.** The shared Toggle's 46×44 round shape with a top-aligned knob is pre-existing and unchanged (§6, §7). Notifications and Date & Time carry their own scoped track-centering rules; the Sticky contract requires preservation instead. Candidate for SET-12 or QA follow-up.
3. **(P2) and (P3).** The low-contrast `white` swatch, and recovery and pane actions styled as plain text buttons. Both are pre-existing or precedent presentation and are not specified by the contract.
4. **Restore row divider.** In the recovery state the restore row shows the same 1 px divider the pin row always has (§6).
5. **Dialog backdrop.** The dialog has no backdrop (pre-existing, as noted for More).

## 10. Harness development disclosure

Before the counted runs, the runner was developed with probe runs whose output went to the session scratchpad through `XAI_VISUAL_EVIDENCE_DIR`. They are not evidence and are not committed: EN `dev1`–`dev5`, ZH `dev3`–`dev5`.

The probes found only harness defects, all corrected before `v1`:
- a record-field collision (a details `id` overrode the check `id`; a screenshot `name` overrode the record name);
- select checks that indexed raw events instead of the mapped arrays;
- card widths compared across different pressed states (bold active label), now state-matched against a 2023526 reference showing the same values;
- the switch-in-row metric used the row's border box, so the restore row's appearing divider moved its center by 0.5 px; it now uses the row content box and records the divider;
- the Space no-scroll check compared the full rect, which a bold pressed label shifts horizontally; it now compares scroll offsets and vertical position.

No probe showed a product failure. `dev3`–`dev5` passed in both languages with the same results as `v1`.

## 11. Limitations

- **Environment.** Headless Chrome 154 on macOS with mobile emulation for 375 and 414 (mouse and keyboard input, no touch). Synthetic account, no auth gate, not Tauri. React development build bundled by esbuild from the archive (not the Vite production build; no `StrictMode` wrapper, as in batches 8 and 9). Dependency trees are reused from the main checkout, with the lockfile gate as a consistency check only.
- **Screenshots.** Captures for the all-five, Reload and clean states grow the viewport height to show the whole pane; hit-tests and dialog captures use the realistic heights. Viewport heights are the verifier's choice; the contract specifies widths only.
- **Keyboard scope.** Keyboard was checked at one width per language (EN 1024, ZH 375). At 1024×768 EN the scroller has only 35 px of room, which the positive control shows is enough to detect a Space scroll.
- **Visible focus.** Judged from `:focus-visible`, the computed outline and the in-viewport/uncovered state of each stop, plus the focused Stay in the dialog captures. There is no per-stop pixel comparison.
- **Dialog containment.** Judged against the dialog box and viewport (§5, flagged).
- **Not an accessibility audit.** This is not a full accessibility conformance audit: no screen reader output, forced colors, zoom beyond these widths, high-contrast themes or dark theme.
