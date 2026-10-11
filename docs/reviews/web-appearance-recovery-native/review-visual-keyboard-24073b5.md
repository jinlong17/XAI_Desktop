# Appearance EN/ZH visuals and keyboard at `24073b5` (CP-APPEARANCE-01, batch 46, contract r3 §14 E14–E15)

**Verdict: FAIL.** E15 found a real product failure, and the batch stopped under the batch 46 stop rule.

**The failure.** The Font scale slider (`字体大小`) receives keyboard focus, but focus is not visible.
- A trusted Tab focuses it, and it matches `:focus-visible`.
- Its computed `outline-style` is `none`.
- A capture of the focused slider is byte-identical to a capture of the same slider after focus has moved on, in EN and in ZH.
- This violates contract §9 "Keyboard": "Trusted Tab reaches every control in DOM order with visible focus". It falls under E15, "Tab order and visible focus" (gate 8).

**Everything else in E15 passed** in both languages. This covers Tab order, Enter and Space each firing once, slider steps, the reset confirmation, focus targets, the Topbar status and Retry all by keyboard.

**E14 was not run as evidence.** The stop rule says "freeze the reproduction, commit, and stop", so the visual modes were not run (§9 below).

| Run | Checks | Preconditions | Product checks | Failed product checks | Runtime errors / console warnings | Key audit | Screenshots | Exit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EN `native-24073b5-fixed1-keyboard-en.log` (1024×768) | 798 | 638 | 160 | 5, all the Font scale slider's visible focus | 0 / 0 | 1,155 of 1,155 events, 0 mismatches | 12 | 2 |
| ZH `native-24073b5-fixed1-keyboard-zh.log` (375×812, mobile emulation) | 840 | 680 | 160 | 5, the same | 0 / 0 | 1,147 of 1,147 events, 0 mismatches | 12 | 2 |

Exit 2 means the harness was valid and a product check failed. Both runs are harness-valid, `harnessValid: true` (EN L877, ZH L921).

**Status.** This is verification only.
- It is not acceptance, and it authorizes nothing.
- It repairs nothing, by the stop rule. It changes no product source, product test, contract, ledger, control plane or existing evidence.
- Every earlier file in this directory was read only. Two of them were reused read-only and hash-checked: the batch 45 fixture and its instruments, and the frozen E4 H14 log.
- Before the commit, `git status --porcelain --untracked-files=all` listed only the 29 new files below, all in this directory.
- It closes no 312 item.
- It does not push, merge, deploy, release or sync Web→Desktop.

## 1. Identity

| Item | Value |
| --- | --- |
| Executor | An independent Claude Opus 5.5 instance in the parent-role visual and keyboard verifier role (batch 46). It wrote none of the following: the contract, the Appearance caller, earlier Appearance evidence, or the reused batch 45 fixture and instruments. |
| Worktree | `.claude/worktrees/agent-a4966d9ebb74d332b`. Detached at docs base `9b3b52088c087d338d3cb4f1b81b2200146efded` after `git fetch origin codex/web/full-product-audit-20260908`, and clean before the work. |
| Fixed revision | Requested `24073b5`, resolved `24073b522262d8b4bec0abfa29347db28adbdd9e`, tree `95b4aaff59927eee82248a6133e357e9c70e04ec` (the `baseline` record, L9 in both logs). |
| Before revision | `5cd63ff652f02a2c726187fe12cbc796218d31c0`. Used only for the focus-visibility reference (§3). |
| Product-tree equality | `git diff --name-only 24073b5 HEAD -- apps packages package.json pnpm-lock.yaml` is empty (`baseline:docs-head-product-tree-equals-fixed`). `5cd63ff..24073b5` is exactly the 24 Terra files (`baseline:fixed-delta-is-exactly-the-24-terra-files`). |
| Authority | The authority is `../web-appearance-recovery-contract/contract.md` r3 (`706c9a3`). Its SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d` is re-derived in every run (`baseline:contract-r3-hash`). The relevant sections are §9 "Keyboard", §9 presentation, A2.1–A2.9, A9, §13 gates 8 and 9, and §14 E14–E15. The control plane is `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`: "本轮唯一任务" (batch 46) and the CP-APPEARANCE-01 rows. |
| Browser | `Chrome/154.0.8037.97` (HeadlessChrome, `--headless=new`), DevTools protocol 1.3. It runs over the **pipe** transport (`--remote-debugging-pipe`, flattened sessions), with an isolated profile and deviceScaleFactor 1. The binary is the only Chrome on the host (`/Applications/Google Chrome.app`, Info.plist 154.0.8037.97). |
| Host and toolchain | macOS 27.0.1 (26A434), arm64; Node `v24.16.0`; esbuild `0.28.1` from the gated tree; react 19.2.0, react-dom 19.2.0, react-router 7.15.1. |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`. It is equal in six places: `XAI_DEPS_ROOT`, both revisions, both extracted archives, and the contract gate (`baseline:lockfile-gate`). This is a consistency check only. |
| Dependency root | The main checkout, read only. No install, build, checkout, dev server or preview tool ran there. An mtime scan covered 3,833 entries against a marker stamped at 06:39:52, before the first run: top level; `node_modules` and `apps/web/node_modules` to depth 2; `apps` and `packages` to depth 3; `docs` to depth 2; `.git` and `.claude` excluded. It found **0** newer entries after all runs. |
| Network | Only the runner's own `127.0.0.1` server (ephemeral port). Every other host resolves to NOTFOUND. There were 0 page network attempts (`run:no-non-local-network-attempt`). |
| Iterations | keyboard-en 1 of 3 (`fixed1`); keyboard-zh 1 of 3 (`fixed1`); visual-en and visual-zh 0 of 3 (not run, stop rule). Development probes are disclosed in §10. |

## 2. Files and SHA-256

All 29 files are new and in this directory.
- Each log's `baseline` record (`fileSha256`, L9) records the runner, the probes, the reused fixture and prelude, and the E4 log. These equal the committed files.
- Every screenshot's SHA-256 on disk equals its `screenshot` record in the log (24 of 24 checked).
- Equal hashes are expected: identical pixels give identical PNGs (§3).
- This receipt cannot carry its own hash.

| File | Lines / size | SHA-256 |
| --- | --- | --- |
| `verify-visual-keyboard.mjs` (runner, all four modes) | 2,235 lines | `ac268a0af6263772c9e3976d30b7bc2f3502d52c3973de4daa976734aead0781` |
| `native-visual-keyboard-probes.js` (read-only page probes) | 693 lines | `4df16575470d739d1655f32cd1bb0101c2b772552439f3ecfefded4f87bc02c4` |
| `native-24073b5-fixed1-keyboard-en.log` (E15 EN, the frozen reproduction) | 877 lines, 269,918 B | `18bddfb635fd5a61654f7ec893fa8253fc54c512c83b33601967f11a4aff104b` |
| `native-24073b5-fixed1-keyboard-zh.log` (E15 ZH, the frozen reproduction) | 921 lines, 276,525 B | `602acda97843fd8a24844b6fa23d2ac8a092746931df9be0c5640041e0430837` |
| `native-24073b5-fixed1-keyboard-en-24073b5-font-slider-focused.png` | 173×24 | `3a90a4773e80d89b51ab2d424d495c45a416a906c57f1160450deb66c8685616` |
| `native-24073b5-fixed1-keyboard-en-24073b5-font-slider-unfocused.png` | 173×24 | `3a90a4773e80d89b51ab2d424d495c45a416a906c57f1160450deb66c8685616` |
| `native-24073b5-fixed1-keyboard-en-24073b5-font-slider-focused-row.png` | 624×89 | `38a2cb5672a4679ac5ab97abea3215eed7c0575f3436cc6f30d265038675d4a1` |
| `native-24073b5-fixed1-keyboard-en-24073b5-hue-slider-focused.png` | 180×28 | `121b887475fa007ea5c2d360b0d9c926c4c4a558e0d58e6a8f5ee954d21e26d3` |
| `native-24073b5-fixed1-keyboard-en-24073b5-hue-slider-unfocused.png` | 180×28 | `065dff6b8e7d30d34ec8a12d03c181e4298176deb864cc49312eedd174cb37eb` |
| `native-24073b5-fixed1-keyboard-en-24073b5-hue-slider-focused-row.png` | 624×107 | `94eff7fbbdce7354bf2eecf3c399392ea37c00524405abedfce54fc41aaf7525` |
| `native-24073b5-fixed1-keyboard-en-before-5cd63ff-font-slider-focused.png` | 173×24 | `3a90a4773e80d89b51ab2d424d495c45a416a906c57f1160450deb66c8685616` |
| `native-24073b5-fixed1-keyboard-en-before-5cd63ff-font-slider-unfocused.png` | 173×24 | `3a90a4773e80d89b51ab2d424d495c45a416a906c57f1160450deb66c8685616` |
| `native-24073b5-fixed1-keyboard-en-before-5cd63ff-font-slider-focused-row.png` | 624×89 | `38a2cb5672a4679ac5ab97abea3215eed7c0575f3436cc6f30d265038675d4a1` |
| `native-24073b5-fixed1-keyboard-en-before-5cd63ff-hue-slider-focused.png` | 180×28 | `121b887475fa007ea5c2d360b0d9c926c4c4a558e0d58e6a8f5ee954d21e26d3` |
| `native-24073b5-fixed1-keyboard-en-before-5cd63ff-hue-slider-unfocused.png` | 180×28 | `44656b7b8fbb2f733f37eb516b175033466564196ae883f11ae71078b8097a19` |
| `native-24073b5-fixed1-keyboard-en-before-5cd63ff-hue-slider-focused-row.png` | 624×107 | `e0d08ea0f966a9caea7d2f84eb806e74d37e41370be311e8083b571ef7cdd6d6` |
| `native-24073b5-fixed1-keyboard-zh-24073b5-font-slider-focused.png` | 222×24 | `a1343047a35424ad288a7bf8de2c1f86eecce569a19b7e6455f281744d460771` |
| `native-24073b5-fixed1-keyboard-zh-24073b5-font-slider-unfocused.png` | 222×24 | `a1343047a35424ad288a7bf8de2c1f86eecce569a19b7e6455f281744d460771` |
| `native-24073b5-fixed1-keyboard-zh-24073b5-font-slider-focused-row.png` | 305×125 | `e78cdb9da51008263102403653bca1fb1c80b3c9e434681808c0cee6bf43d0ff` |
| `native-24073b5-fixed1-keyboard-zh-24073b5-hue-slider-focused.png` | 180×28 | `b35454b779e480c30730c228ce49e7679dfa29a952d3a468f26bdcab4006353c` |
| `native-24073b5-fixed1-keyboard-zh-24073b5-hue-slider-unfocused.png` | 180×28 | `776ef536bffb8a828f3ad55f2eb561dd596fce776c7052b1ac66d06f28287346` |
| `native-24073b5-fixed1-keyboard-zh-24073b5-hue-slider-focused-row.png` | 305×161 | `6690683af2d92de29123245f565079fd8f43cbbf3dda0a30e805a86f3e0c03a4` |
| `native-24073b5-fixed1-keyboard-zh-before-5cd63ff-font-slider-focused.png` | 222×24 | `a1343047a35424ad288a7bf8de2c1f86eecce569a19b7e6455f281744d460771` |
| `native-24073b5-fixed1-keyboard-zh-before-5cd63ff-font-slider-unfocused.png` | 222×24 | `a1343047a35424ad288a7bf8de2c1f86eecce569a19b7e6455f281744d460771` |
| `native-24073b5-fixed1-keyboard-zh-before-5cd63ff-font-slider-focused-row.png` | 305×125 | `e78cdb9da51008263102403653bca1fb1c80b3c9e434681808c0cee6bf43d0ff` |
| `native-24073b5-fixed1-keyboard-zh-before-5cd63ff-hue-slider-focused.png` | 180×28 | `b35454b779e480c30730c228ce49e7679dfa29a952d3a468f26bdcab4006353c` |
| `native-24073b5-fixed1-keyboard-zh-before-5cd63ff-hue-slider-unfocused.png` | 180×28 | `776ef536bffb8a828f3ad55f2eb561dd596fce776c7052b1ac66d06f28287346` |
| `native-24073b5-fixed1-keyboard-zh-before-5cd63ff-hue-slider-focused-row.png` | 305×161 | `b3e684bfa01e95ca75d86b85be00270198c66e042ecabc4a64e6ac323e17a884` |
| `review-visual-keyboard-24073b5.md` | — | this receipt |

**Reused read-only and hash-checked.** Each run checks these three files (`baseline:frozen-batch-45-fixture-and-prelude-and-e4-h14-log-reused-read-only-hash-checked`):

| File | SHA-256 |
| --- | --- |
| `native-host-retryall-app.tsx` (batch 45 production App fixture) | `118f565783fc99e2642341e39ff9afa2df4a6cb937dc016ca41ab13ab1721c19` |
| `native-host-retryall-prelude.js` (batch 45 instruments) | `ad4d711a5639b6685f05ea9cf5742f77d17e5924a127453dcd42f1a117757e7b` |
| `native-5cd63ff-before1-h14.log` (frozen E4 H14) | `3d1f5763d11207e6e4e24fc2678177aae0960a91fb933985c061b08bde54e02f` |

The keyboard modes do not read the E4 H14 log; they only check its hash. The visual modes read it.

## 3. The failure: the Font scale slider has no visible focus (E15)

**Reproduction.** The `focus-visibility` section of each run does the following:
1. A trusted click on the pane title, a non-focusable anchor, then trusted Tabs until the slider has focus.
2. A clip of the slider with a 10 px margin, whose position is relative to the control.
3. One more trusted Tab, so focus moves on to the next control.
4. The same control-relative clip again.

The runner checks two preconditions (EN L42 and L54, ZH L44 and L56):
- the control has the same fractional offsets in both captures, so the clips align pixel for pixel;
- focus has left the control.

The hue slider is the positive control. The same procedure runs on the 5cd63ff product.

| | Product | `:focus-visible` | Computed outline | Focused vs. focus moved on | Log |
| --- | --- | --- | --- | --- | --- |
| EN 1024×768, Font scale slider | 24073b5 | true | `none` (`3px`, `oklch(0.21 0.012 230)`) | **byte-identical** (`3a90a477…` both) | L57 (FAIL), L97 |
| EN, hue slider (positive control) | 24073b5 | true | `solid 2px oklch(0.57 0.085 165 / 0.58)`, offset 2 px | differ (`121b8874…` vs `065dff6b…`) | L45, L97 |
| EN, Font scale slider | 5cd63ff | true | `none` | **byte-identical**; also byte-identical to 24073b5 | L96 |
| EN, hue slider | 5cd63ff | true | `solid 2px` | differ | L84 |
| ZH 375×812, Font scale slider | 24073b5 | true | `none` | **byte-identical** (`a1343047…` both) | L59 (FAIL), L101 |
| ZH, hue slider (positive control) | 24073b5 | true | `solid 2px` | differ (`b35454b7…` vs `776ef536…`) | L47, L101 |
| ZH, Font scale slider | 5cd63ff | true | `none` | **byte-identical**; also identical to 24073b5 | L100 |

**The same defect appears in every Tab walk** (§4.1).
- **Where:** the clean cycle (EN L120–L121, ZH L126–L127) and the drafts cycle (EN L174–L175, ZH L183–L184).
- **Check one:** every stop is `:focus-visible` with an outline of at least 2 px.
- **Check two:** every pane stop has a solid ring, is uncovered and is in the viewport.
- **Result:** each walk fails exactly on `font-slider`, which has `outline-style: none`. Every other stop has a 2 px solid outline. That is 58 of 59 controls (EN clean), 75 of 76 (EN drafts), 56 of 57 (ZH clean) and 73 of 74 (ZH drafts).

**Cause.** This is read from source and not changed.
- `packages/plugin-web-tokens/src/layout.css:1353–1360` declares `.slider-row input[type="range"] { …; outline: none; }`. Its specificity is (0,2,1).
- That beats the global focus ring `input:focus-visible { outline: 2px solid … }` in `tokens.css:246–253`, which is (0,1,1).
- The hue slider's own `outline: none` is on `.hue-slider`, at (0,1,0) (in `layout.css:1452` and in the Appearance stylesheet, `styles.css:137–152`). It loses to the focus ring, so the hue slider shows it.
- The Font scale slider sits in `<div className="slider-row" data-appearance-control="fontScale">` (`AppearancePane.tsx:361` at 24073b5; `:401` at 5cd63ff). A search of the product source under `apps` and `packages` at 24073b5 finds the `slider-row` class only there. (`accent-slider-row` is a different class.)
- `plugin-web-tokens` is unchanged between 5cd63ff and 24073b5, so the defect predates this caller.

**What this does and does not imply.**
- §9 binds the fixed product, and §11 lets the caller add selectors under `.appearance-pane` in the Appearance stylesheet. A pane-scoped focus rule is within the caller's files.
- The stop rule forbids this verifier to fix it, so no fix was tried.
- The controller decides how to proceed: whether the fix belongs to this caller, and how it relates to the shared `layout.css` rule.

**Effect on the user.** The slider still works by keyboard: arrow keys, Home and End step it (§4.3). Nothing marks it as focused, though. The row captures show it: the focused hue slider has an accent ring around the track, and the focused Font scale slider looks exactly like the unfocused one (§11).

## 4. E15 results other than the failure (both languages PASS)

The runs used trusted CDP keys only. The widths are EN 1024×768 and ZH 375×812 (mobile emulation), as in the Features E15 precedent.
- **Pet hidden.** Each document hides the pet through the product's own rail toggle, with a trusted, hit-tested click. At 375 the click is made at 1440 px, where the toggle is shown.
- **Focus moves only by Tab or Shift+Tab, or by the product's own focus management.** There are two exceptions:
  - pointer anchors on non-focusable text set the sequential-navigation starting point;
  - one removable `tabindex` on the pane title serves as the Space-scroll positive control.

Unless a row says otherwise, the log lines are EN / ZH.

### 4.1 Tab order and visible focus

| Requirement | Result | Lines |
| --- | --- | --- |
| Tab reaches every control in DOM order | **Clean:** a full cycle from the pane-title anchor. It covers the pane (25 row controls, then Retry all, which is `aria-disabled` and still a stop, then Reset), the rail, the Topbar (search, appearance trigger) and the settings sidebar, and returns to `lang:en`. It took 61 presses in EN and 59 in ZH, with one step outside the document at the wrap. It equals the DOM-order list of every tabbable element, rotated (59 controls EN, 57 ZH). | L116–L118 / L122–L124 |
| Clean state has no Topbar status stop | PASS | L119 / L125 |
| All seven unresolved | The full cycle equals DOM order: 76 controls EN, 74 ZH. The pane stops run row, then `retry:<field>` and `discard:<field>` for each field, then Retry all (enabled), Export, Discard all and Reset. | L170–L172 / L179–L181 |
| The Topbar status is a Tab stop immediately before the appearance trigger | It is at index 60, followed by the trigger at 61 (EN). In ZH they are at 58 and 59. | L173 / L182 |
| Source only (`xai_rail_pos` = `diagonal`) | `railpos:bottom`, then `reload:railPos`, then `font-slider`, then Retry all (disabled), then Reset | L195 / L207 |
| Visible focus | Every stop except the Font scale slider has `:focus-visible` and a 2 px solid outline. Pane and status stops are also center-hit and in the viewport. The slider is the failure in §3. | L120–L121, L174–L175 / L126–L127, L183–L184 |

Recorded, not gated: in the ZH 375 cycles one rail button, `rail:时间追踪`, ends 7 px outside the viewport when focused. This is the shell's bottom rail and is not part of this caller (L128, L185 ZH).

### 4.2 Enter and Space activate once; no scroll on Space

There were 13 activations per language. Every one had exactly 1 trusted keydown, 1 keypress and 1 keyup, as the key audit confirms, and 1 trusted click. It produced exactly the expected writes and nothing else. Focus stayed on the control, and the control showed the choice (`aria-selected` or `.active`).

| Control | Key | Writes (exact) | EN / ZH |
| --- | --- | --- | --- |
| Theme Dark, System, Light | Space, Enter, Enter | `xai_pref_theme` = `"dark"`, `"system"`, `"light"` | L220–L243 / L234–L257 |
| Density Compact, Comfortable | Enter, Space | `xai_pref_density` = `"compact"`, `"comfortable"` | L249–L263 / L263–L277 |
| Accent swatches Ocean, Sunset | Space, Enter | `xai_accent_hue` = `230`, `35` | L269–L283 / L283–L297 |
| Background Lavender, Sage (`default`) | Enter, Space | two writes each: `xai_bg_tone` = `lavender` with `xai_accent_hue` = `295`; `default` with `165` | L289–L303 / L303–L317 |
| Sidebar Right, Left | Space, Enter | `xai_rail_pos` = `right`, `left`; the rail moves and focus stays on the card | L309–L323 / L323–L337 |
| Language (the other language, then back) | Enter, Space | `xai_pref_lang` = `"zh"` then `"en"` (EN); `"en"` then `"zh"` (ZH); focus stays across the switch of the whole UI | L329–L343 / L343–L357 |

**Space-scroll detection.**
- **Positive control:** Space on the focused pane title, a non-interactive element, scrolls `.module-settings` by 449 px in EN and 652 px in ZH. That exceeds half the scrollport (358 and 346 px), so a page scroll would have been seen (L213 / L227).
- **All 15 Space presses per language did not page-scroll.** In every one the page could still scroll further (`detectable`).
- **ZH preparation.** For 4 ZH presses on bottom controls, the settings scroller was first moved up by at most 120 px, keeping the control in view, so that a page scroll could show.
- **Small offset changes.** The only ones were a clamp to a shorter range after a recovery block left (EN −114 px, ZH −108 px), and in ZH scroll anchoring of 3 px after the density change and 13 px after the reset. The focused control moved by less than half the scrollport (`space-scroll` records).

### 4.3 Slider steps

Each key press was exactly one edit: 1 `input` event and 1 write with exact bytes, waited to completion. The readout followed and focus stayed (L364–L378 / L380–L394).

| Slider | ArrowRight | ArrowLeft | Home | End | Final bytes |
| --- | --- | --- | --- | --- | --- |
| Accent hue | `166` (166°) | `165` | `0` | `360` | `360` |
| Font scale | `1.05` (105%) | `1` | `0.85` | `1.15` (115%) | `1.15` |

### 4.4 Reset confirmation by keyboard

The setup stored `theme` = `dark` and `density` = `compact`, then reached Reset by Tab.
- **Enter:** exactly 1 native confirm with the §5 text, declined. There were 0 get, set or remove attempts on any key, no state change, and focus stayed on Reset (L399–L403 / L417–L421).
- **Space:** exactly 1 confirm, accepted. It made exactly 2 removals (`xai_pref_theme`, `xai_pref_density`) and 0 sets, the four absent keys took verified no-ops, "Defaults restored." / "已恢复默认设置。" appeared, and focus stayed on Reset (L405–L411 / L423–L429).
- **Partial reset, Enter** (`xai_rail_pos` removal denied): 1 confirm. Theme was removed; the sidebar removal was refused and the block read "… was not reset to its default.". There was no restored claim, and focus stayed on Reset (L433–L437 / L453–L457).

### 4.5 Focus targets

| Action (keyboard) | Focus afterwards | EN / ZH |
| --- | --- | --- |
| Discard Density (Enter), 0 writes | `density:comfortable`, the selected segment | L466–L469 / L488–L491 |
| Discard Accent color (Space), 0 writes | the hue slider | L475–L480 / L497–L502 |
| Retry Theme that fails again (Space), 1 denied write | stays on `retry:theme`; the block is kept | L505–L510 / L529–L534 |
| Retry Theme that succeeds (Enter), 1 write | the block unmounts; focus goes to `theme:dark`, the selected card | L512–L515 / L536–L539 |
| Reload Sidebar position, unrepaired (Enter), 0 writes | `railpos:left`; the alert is kept and the bytes stay `diagonal` | L536–L539 / L562–L565 |
| Reload after an external repair to `top` (Space), 0 writes | `railpos:top`; the alert is cleared with no Saved claim | L542–L547 / L568–L573 |
| Discard all (Enter), 0 writes | Reset to defaults, inside the pane, never `<body>` | L576–L579 / L604–L607 |
| Accepted reset (Space) | stays on Reset | L411 / L429 |

### 4.6 Retry all by keyboard (A2.2, A2.5, A2.7)

| Requirement | Result | EN / ZH |
| --- | --- | --- |
| A Tab stop in every state | Reached by Tab in the clean, source-only and drafts (enabled) walks, and from the Font scale row label in the pending-only and partial states. During an open pass with E empty it is `aria-disabled`. After a member fails again it is enabled. In both pass states it was reached by Shift+Tab and then Tab back, with zero writes. | L118, L172, L195, L789, L819, L821 / L124, L181, L207, L829, L861, L863 |
| Disabled (clean, pending only behind the real lock, source only): Enter and Space inert, focus kept, no scroll | Each made 0 set or remove attempts and 0 application lock requests. The button stayed `aria-disabled` and focused, and nothing scrolled. | L600–L677 / L630–L711 |
| Enter starts one pass; full success | Exactly one write per member (`theme` `"dark"`, `density` `"compact"`). The line read "Appearance settings saved." / "外观设置已保存。". Retry all is now `aria-disabled` with no description, and focus stayed on it; no sampled frame had focus on `<body>` or anywhere else. There was no Topbar status. | L706–L710 / L742–L746 |
| Space starts one pass; partial result | One attempt per member: accent denied again, sidebar written. The line read "1 appearance change is not saved." / "1 项外观更改未保存。". Focus stayed on the enabled Retry all, and the Topbar status was shown. | L739–L744 / L777–L782 |
| A second Enter and Space while a member is pending | With the theme member held behind the real lock and the background and accent members done, both made 0 attempts. Focus was kept, and the button was `aria-disabled` and described by the in-flight line. After release the held member was written once and focus stayed. | L773–L790 / L813–L830 |
| Open pass whose only member is held, with the fault armed | Disabled while the pass is open, with focus kept. On release the member fails again; the button becomes enabled, focus stays, and the count line describes it. | L815–L821 / L857–L863 |

### 4.7 Topbar status and popover

From `/app/tasks`, after a failed Topbar theme choice:
- **Tab order.** A trusted click on the Topbar background, which focuses nothing, then Tab, Tab reaches the search box and then the status, before the trigger.
- **Focus.** The status shows a 2 px solid ring and is center-hit.
- **Enter and Space.** Each navigates exactly once to `/app/settings/appearance`: one `pushState`, one router commit, one trusted click, zero storage writes. EN L852–L864; ZH L896–L908.
- **Popover.** The order is search, status, trigger. Enter on the trigger opens the popover and Escape closes it, which is unchanged behavior (L868–L869 / L912–L913).

## 5. Key audit (K-1)

Keys are CDP `Input.dispatchKeyEvent` without `nativeVirtualKeyCode`. Enter and Space carry `text`. Shift+Tab is Tab with modifier 8.

At every document change and at the end, each document's capture-phase key trace must equal exactly the runner's own presses, in order and trusted: `keydown`, a `keypress` for Enter and Space, and `keyup`. This is the run-level precondition `run:keyboard-trace-contains-only-the-runner-key-presses`.

| Run | Checkpoints | Runner presses | Key events received | Expected | Untrusted | Mismatches | Line |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EN | 83 | 558 | 1,155 | 1,155 | 0 | 0 | L872 |
| ZH | 83 | 554 | 1,147 | 1,147 | 0 | 0 | L916 |

## 6. Runtime errors, console warnings, dialogs, network

- **Runtime errors:** 0 in both runs. That counts CDP exceptions, `console.error` and `console.assert`, and renderer crashes. It includes 0 in the 5cd63ff reference documents (`run:runtime-errors-zero`, EN L876, ZH L920; `run:5cd63ff-reference-runtime-errors` L875 / L919).
- **Console warnings:** 0 in both runs (`consoleWarnings: 0`, `consoleWarningsBySource: {}` in the `result` record).
- **Dialogs.** Every dialog was planned (`run:no-unexpected-javascript-dialogs`, `run:every-planned-dialog-consumed`):
  - 3 planned reset confirmations per run (decline, accept, accept);
  - 4 runner-initiated `beforeunload` prompts, from navigating away from documents with drafts.
- **Network:** 83 checkpoints, 0 attempts beyond the local origin, 0 non-local.

## 7. Provenance

| Item | Fixed (`24073b5`) | 5cd63ff (focus-visibility reference) |
| --- | --- | --- |
| Bundle inputs | 1,017: 625 archive-relative, 390 third-party, the `define`, and the fixture. **0 foreign.** | 1,013: 621, 390 and 2. **0 foreign.** |
| `@repo/*` pinned to the archive | 320, **0 guard violations** | 320, **0 violations** |
| Required modules from the archive | 39 of 39. Composition, router, gates, Appearance package, settings shell, Topbar, Shell, AppRail, DesktopPet, CmdK, storage engine, tokens (`tokens.css`, `layout.css`), `pet.css`, `global.css`. Every required module outside the 24-file delta is byte-identical to 5cd63ff. | 36 of 36 |
| Bundle SHA-256 (js / css) | `be14eb3167c65fe2a2388658aea671311035f896f41e4840eac810d53fa590b5` / `d58dfc44acd68008145cf09c17d90334164b2c6edc2b05a7a95c66bd8d259d24` | `5c580ca74f6ded08ca50fc143481588a259e5d99887b1513b6788386b8753b4f` / `7682f7e81ef51e3808d33c3647b40ebd7b43cebc56fa4244a4674288c23c5dc6` |
| Log lines | L1–L4 | L5–L8 |

The bundle hashes are identical in the two runs. They differ from batch 45's only because esbuild writes source paths relative to the temporary archive into comments.

**The only synthetic input is the auth session.** The fixture's `WebAuthSessionProvider` gets a client whose `auth.getSession` resolves one session for `appearance-native-A`. The real `AccountDataGate` activates generation `g1`.

**Instruments.**
- **Batch 45 instruments (reused).** The prelude is served before the bundle. Its self-test passes on the product-free seed page (L16). Its parts:
  - attempt-level Storage log with faults;
  - Web Lock fixture;
  - history and dispatch spies;
  - key, click and input traces;
  - confirm recorder;
  - frame sampler.
- **New probes.** `native-visual-keyboard-probes.js` is served after the prelude. It is read-only: it patches nothing and wraps nothing. Its colour-converter self-test passes on the seed page (L18).
- **Faults.** Per-key `setItem` and `removeItem` denials, raised as a DOMException that never reaches storage.
- **Locks.** Real held per-key locks through `navigator.locks`.

## 8. Static selector audit (git; not a browser evidence run)

This is reproducible from git: `git diff 5cd63ff 24073b5 -- '*.css'`, then `git show <rev>:packages/xai-web-settings-appearance/src/styles.css`. It was computed by the runner's `cssAudit` in development probe `dev3`, which is not committed. It is given here for the fix window and the E14 rerun; it was not part of the frozen runs.
- `5cd63ff..24073b5` changes one stylesheet, `packages/xai-web-settings-appearance/src/styles.css`, from `1b17d1f4…` (8,595 B) to `c3d3393d…` (12,491 B).
- The fixed file begins byte-for-byte with the 5cd63ff file and appends 130 lines (3,896 B).
- `plugin-web-tokens`, `plugin-web-settings-shell` and `apps/web/src/styles` have an empty diff.
- The only at-rules are `@media (max-width: 640px)` and `@media (max-width: 767px)`.

| # | Added selector | Context | Scope |
| --- | --- | --- | --- |
| 1 | `.appearance-pane .bg-tones` | `@media (max-width: 640px)` | `.appearance-pane`, the 375 px containment override (3 columns) |
| 2 | `.appearance-pane .appearance-recovery-field` | — | `.appearance-pane` |
| 3 | `.appearance-pane .appearance-recovery-text` | — | `.appearance-pane` |
| 4 | `.appearance-pane .appearance-actions` | — | `.appearance-pane` (column, `flex-wrap: wrap`, `justify-content: flex-start`) |
| 5 | `.appearance-pane .appearance-status-line` | — | `.appearance-pane` |
| 6 | `.appearance-pane .appearance-actions-row` | — | `.appearance-pane` |
| 7 | `.appearance-pane .appearance-recovery-field > button` | — | `.appearance-pane` (44×44 minimum) |
| 8 | `.appearance-pane .appearance-actions button` | — | `.appearance-pane` (44×44 minimum) |
| 9 | `.appearance-pane .appearance-retry-all` | — | `.appearance-pane` (`border: 1px solid transparent`, one box in both states) |
| 10 | `.appearance-pane .appearance-actions .appearance-retry-all[aria-disabled="true"]` | — | `.appearance-pane`, **the disabled rule set** |
| 11 | `.appearance-status` | — | `.appearance-status*` (Topbar status) |
| 12 | `.appearance-status:hover` | — | `.appearance-status*` |
| 13 | `.appearance-status-icon` | — | `.appearance-status*` |
| 14 | `.appearance-status` | `@media (max-width: 767px)` | `.appearance-status*` (`width: 44px; padding: 0`) |
| 15 | `.appearance-status-text` | `@media (max-width: 767px)` | `.appearance-status*` (`display: none`: icon only below 768 px) |

**The disabled Retry all rule (#10)** is exactly one rule set under `.appearance-pane`, keyed on `[aria-disabled="true"]`. It declares only:
- `background-color: var(--bg-panel-2)`;
- `border-color: var(--border-1)`;
- `color: var(--text-3)`;
- `cursor: not-allowed`.

It uses neutral `--bg-*`, `--border-*` and `--text-*` tokens only. It has no `--accent*`, `--red*` or `--danger` token and no `pointer-events`. Every selector falls within §9's scopes, and no `.pane-footer` or `.pane-save` class was added.

## 9. E14: not run as evidence (stop rule), with development observations

The runner implements `visual-en` and `visual-zh` (see the runner header). Neither was run as evidence: E15 had already produced a frozen product failure, and the batch 46 stop rule says to stop. E14 therefore has no evidence tables, gate measurements, contrast measurements, screenshots or screenshot review in this batch. All of these are for the post-fix rerun.

**Development probes of the visual modes.** These are disclosed only; they are not evidence and were not committed. They exercised:
- the static audit (§8);
- the bundle-level CSS audit;
- the 5cd63ff references at five widths in EN;
- the fixed states at 375×812 in EN: clean, source only, all seven, partial reset, partial pass and Topbar status. The dev5 probe ran 542 checks, 303 of them product checks, all PASS.

What those probes showed:
- **H14 reproduces the frozen E4 log exactly.**
  - (a) EN 375 at 5cd63ff: the pane is 289/380 (client/scroll) and Graphite spans 348.91–418.06.
  - (b) At 768×1024 the pet covers the center of "Save & apply" at the top (604.36–717 × 962–1006) and at the end of the scroll range (939.05–983.05). The pet box is 660–732 × 916–988.
- **At 375 EN on 24073b5:**
  - Retry all sits at 38–121.19 px. That is 145.81 px left of the pet's left edge (267), with 5 of 5 points on the button and zero intersection, in every state, enabled and disabled.
  - Its accessible name is "Retry all". It has no description while disabled, and the status line describes it while enabled.
  - The disabled button shows a 2 px solid focus ring.
  - Every row element's computed style equals 5cd63ff except the scoped ≤640 px palette grid: 64 differences in widths, heights and `grid-template-columns`. The tone cards are now 91 px wide, never narrower.

## 10. Diagnostic iterations and development probes

- **Diagnostic iterations:** keyboard-en 1 of 3 and keyboard-zh 1 of 3, both `fixed1`, with no further iteration. visual-en and visual-zh 0 of 3.
- **Overwrite refusal.** After the committed runs, rerunning `keyboard-en fixed1` and `keyboard-zh fixed1` stopped with `Evidence exists; use a distinct suffix` (exit 1) before anything was archived.

**Development probes** came first, under batch 39 ruling 1. They wrote outside the repository to the session scratchpad through `XAI_NATIVE_EVIDENCE_DIR`, which the runner refuses inside the repository. They used `XAI_VK_SECTIONS` and `XAI_VK_WIDTHS` filters, which are likewise refused for repository evidence. None is committed.

| Probe | Mode and sections | Result | Change that followed (harness only) |
| --- | --- | --- | --- |
| dev1 | visual-en css, before | precondition: the 5cd63ff pane has no `data-appearance-control`, so the descriptors failed | Descriptors fall back to the SettingRow index, which works in both products |
| dev2 | visual-en css, before | deferred product check failed: the bundle-CSS prefix and suffix diff is huge | The Appearance stylesheet is emitted earlier in the fixed bundle (§12 item 2). The audit became section-based (each stylesheet compared by path). A computed-style comparison of the rows against 5cd63ff was added. |
| dev3 | visual-en css, before | PASS | — |
| dev4 | visual-en before | PASS | `scrolled()` showed that the page itself scrolls at 1024×768. Topbar measurements now reset the page scroll, and the A2.8 end-of-range probes run at the page's top and end. |
| dev5 | visual-en before, states @375 | PASS (542 checks) | — |
| dev6 | keyboard-en tab | product: Font scale slider `outline-style: none` | **This is the finding.** Visible-focus checks became deferred, so the rest of E15 still runs. |
| dev7 | keyboard-en focus-visibility | product: focused and unfocused PNGs identical, in both products | Pixel reproduction with the hue-slider positive control |
| dev8 | keyboard-en activation, sliders | PASS | Scroll positive control measured after arming |
| dev9 | keyboard-en reset, focus, retry-all, topbar | product: "Space on Retry all scrolled" | A misreading. The content shrank when a recovery block left, so the offset clamped (696 to 582, the focused control moved 0.44 px). The Space check became clamp-aware, with a detectability preparation. |
| dev10 | keyboard-en retry-all, topbar | PASS | — |
| dev11 | keyboard-zh (all) | precondition: the pet-toggle label was looked up in the stored language, but the drafts scenario starts in the other language | `petOff` uses the current UI language |
| dev12 | keyboard-zh (all) | product: "Space on density Comfortable scrolled" | A misreading: scroll anchoring of +3 px after the density change. The check now requires a change smaller than half the scrollport, beside the clamp. A real Space page scroll is at least half the scrollport, as the positive control requires (449 and 652 px). **This relaxes an assertion. It was disclosed and made before the evidence runs.** |
| dev13 | keyboard-zh (all) | precondition: one runner-initiated `beforeunload` counted as unexpected | A stale 2.5 s timer reset the navigation window. The window became token-based (4 s). |
| dev14 | keyboard-zh (all) | exit 2, only the 5 Font scale focus checks | — |
| dev15 | keyboard-en (all) | exit 2, only the same 5 | Row-context captures added |
| dev16 | keyboard-zh retry-all | PASS | Shift+Tab and Tab re-entry into Retry all added during and after a pass |

The committed runner and probes are the files that dev14–dev16 used, plus the dev16 additions and header text.

## 11. Screenshot review (all 24 opened and inspected)

Short images were opened whole at native resolution. The criterion: is focus visible on the focused control?

| # | Image | Review |
| --- | --- | --- |
| 1 | EN `24073b5-hue-slider-focused` | Hue track with a clear accent-colored ring around it, 2 px at a 2 px offset; the thumb is at 165. **Focus visible.** |
| 2 | EN `24073b5-hue-slider-unfocused` | The same track with no ring. |
| 3 | EN `24073b5-hue-slider-focused-row` | "Accent color" row: 6 swatches (Sage has its dark "selected" ring), the preview dot, the ringed hue track and "165°". **Focus visible.** |
| 4 | EN `24073b5-font-slider-focused` | Grey 4 px track and green thumb. **No indicator.** |
| 5 | EN `24073b5-font-slider-unfocused` | Identical to #4: same bytes. |
| 6 | EN `24073b5-font-slider-focused-row` | "Font scale / Global type scale" row with "A", the track and thumb, "A" and "100%". Nothing shows that the slider has focus. **Failure reproduced.** |
| 7–9 | EN `before-5cd63ff-hue-slider-*` | Same as #1–#3 at 5cd63ff: ring when focused, none when unfocused. |
| 10–12 | EN `before-5cd63ff-font-slider-*` | Same as #4–#6. #10 and #11 are byte-identical to #4; #12 is byte-identical to #6. **Pre-existing.** |
| 13 | ZH `24073b5-hue-slider-focused` | Ringed hue track. **Focus visible.** |
| 14 | ZH `24073b5-hue-slider-unfocused` | No ring. |
| 15 | ZH `24073b5-hue-slider-focused-row` | "主题色 / 影响主操作色、链接、选中态" row at 375: swatches, preview dot, ringed track, "165°". All CJK glyphs render. |
| 16 | ZH `24073b5-font-slider-focused` | Track and thumb, **no indicator.** |
| 17 | ZH `24073b5-font-slider-unfocused` | Identical to #16: same bytes. |
| 18 | ZH `24073b5-font-slider-focused-row` | "字体大小 / 全局缩放" row at 375: "A", the track and thumb, "A" and "100%". **Nothing shows focus. Failure reproduced.** |
| 19–24 | ZH `before-5cd63ff-*` | Same as #13–#18 at 5cd63ff. The Font scale images are byte-identical to the 24073b5 ones, so the defect is **pre-existing**. |

No image shows overlap, clipping or broken rendering. The only finding is the missing focus indicator on the Font scale slider.

## 12. Items for the controller (fix window and the E14/E15 rerun)

1. **The FAIL (§3).** E15 visible focus on the Font scale slider: pre-existing, caused by the protected shared `layout.css` rule, and fixable with a pane-scoped rule. The fix and its ownership are the controller's to decide.
2. **Cascade order.** This comes from development probe `dev3`, not from evidence.
   - App now imports the Appearance package, so in the bundled CSS the Appearance stylesheet comes right after `pet.css`. At 5cd63ff it came after the Features panel stylesheet.
   - Eighteen stylesheets now follow it instead of preceding it: matrix through the Features panel.
   - Every bundled stylesheet other than the Appearance one is byte-identical. The Appearance one is the 5cd63ff file plus exactly the 15 scoped additions.
   - A static scan of the 18 moved stylesheets found only `.features-pane .pane-title` and `.features-pane .pane-intro` sharing an Appearance class. Those apply to a different pane.
   - At 375 EN the rows' computed styles equal 5cd63ff, apart from the expected palette grid.
   - The E14 rerun repeats this comparison at five widths. It is recorded here so that the cascade change is reviewed deliberately.
3. **Topbar "every Topbar control stays … at least 44×44"** (§9).
   - At 1440 px the pre-existing search box (420×36) and appearance trigger (210.53×36) are 36 px tall. This was measured on 5cd63ff in development probes (dev3, dev4), not in evidence. At 24073b5 the same size follows: the clean-state Topbar markup equals 5cd63ff (E13 chrome invariance), and its CSS in `layout.css` is unchanged. The E14 rerun measures it. These sizes are defined in protected `layout.css`, and the contract's §9 CSS scopes do not allow the caller to change them.
   - The status itself is 44 px.
   - The runner reads "stays" as non-regression: with the status visible, a pre-existing Topbar control keeps its own height, keeps 44 px wherever it had it, and stays at least 44 px wide.
   - The controller should confirm or replace this reading before the E14 rerun.
4. **At 1024×768 the page itself scrolls vertically** (the html is 926 px tall) in both products.
   - The runner takes the A2.8 end-of-range probes with `.module-settings` at its end, and with the page at its top and at its end.
   - It requires the button to be in the viewport in at least one page position.
5. **Rerun.** Both E14 modes (`visual-en`, `visual-zh`) and both E15 modes on the repaired product, with this runner (new suffixes). Then E18–E25 and E27.

## 13. Limitations

- **Retained contract §15 exclusions:**
  - headless Chrome with an isolated profile;
  - a synthetic auth session and a synthetic account;
  - not Tauri;
  - a development build without StrictMode;
  - a dependency tree reused from the main checkout (the lockfile gate is a consistency check only);
  - no external network, so system fonts render the text.
- **E15 widths.** E15 ran at one width per language, EN 1024×768 and ZH 375×812 with mobile emulation, as in the Features E15 precedent.
- **Pixels.** Visible focus is judged by `:focus-visible`, the computed outline, and the pixel comparison of the control's clip (10 px margin). A focus cue drawn farther than 10 px from the control would not be seen in the clip, but none exists in the CSS (§3).
- **Space-scroll checks:**
  - they tolerate a clamp to a shorter range and scroll anchoring of less than half the scrollport (§10, dev12);
  - in ZH, four bottom-control presses needed a script move of the scroller (at most 120 px) first, so that a page scroll could be detected.
- **Script actions.** Lock holds and releases, storage faults, one external repair of `xai_rail_pos` (Reload scenario), and the scroll positive control's `tabindex` are script actions by design. Every user-facing activation is trusted input.
- **Export not pressed by keyboard.** Export appears in the Tab order (§4.1) but was not activated by keyboard; it is covered by E11 and E26.
- **Not an accessibility audit.** There was no screen-reader output, forced colors or high-contrast check.
- **E14 not run** (§9), and the visual modes of the committed runner are validated only as far as the development probes in §10.
