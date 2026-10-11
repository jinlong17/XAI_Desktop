# Appearance EN/ZH visuals and keyboard at `5bbf473` (CP-APPEARANCE-01, batch 48, contract r3 §14 E14–E15)

**Verdict: FAIL.** E15 found a new real product failure on the fixed product `5bbf473`, and the batch stopped under the batch 48 stop rule.

**The failure: the selected accent swatch has no visible keyboard focus.**
- **The control.** In the Accent color row (主题色), the swatch matching the current accent hue carries the `.active` class. With the default accent (165) that is the first swatch, Sage.
- **What Chrome reports.** A trusted Tab focuses it and it matches `:focus-visible`. Its computed outline is `solid 2px oklch(0.21 0.012 230)` (`--text-1`) at offset 2 px: the selection ring. The unfocused selected swatch computes exactly the same outline.
- **By pixels.** The swatch focused, and the same control-relative clip after trusted Shift+Tab moves focus out of the swatch row, decode to identical pixels; the PNGs are byte-identical.
  - EN `a9a8821f…`, ZH `300ff1da…`.
  - The same holds with `xai_accent_hue` = 230 (Ocean selected): EN `e9af9a97…`, ZH `5bdf828d…`.
  - The same holds at `5cd63ff`, so the defect predates this caller.
- **Positive controls.** Non-selected swatches show the global focus ring: 537–587 own-region pixels change in EN, 555–561 in ZH.
- **The per-stop oracle.** The visible-focus oracle of the F-APP-1 ruling fails on this stop in all six Tab walks (EN and ZH; clean, drafts and source only). Its own region has 0 of 1,628 pixels changed.
- **The rule broken.** Contract §9 "Keyboard": "Trusted Tab reaches every control in DOM order with visible focus" (E15, gate 8).

**The F-APP-1 repair itself is verified.**
- The Font scale slider (字体大小) now shows the global ring: `solid 2px oklch(0.57 0.085 165 / 0.58)`, offset 2 px, the same as the hue slider.
- Focused and moved-on clips differ: EN `62f79bd0…` vs `6ad3f2c8…`, ZH `ab7f6fb4…` vs `31dd04a8…`.
- In all six walks 680–689 (EN) and 876 (ZH) pixels of its own region change.
- `5cd63ff` still reproduces the frozen batch 46 identical hashes `3a90a477…` (EN) and `a1343047…` (ZH).

**Everything else in E15 passed** in both languages:
- Tab order and visible focus at every other stop (378 of 384 stop captures; the 6 failures are this one swatch, once per walk);
- Enter and Space each firing once, with no Space scroll;
- slider steps;
- the reset confirmation;
- focus targets after Discard, Reload, Retry, Discard all and Reset;
- the Topbar status;
- Retry all by keyboard in every state.

**E14 was not run as evidence.**
- The stop rule applies, as in the batch 46 precedent.
- Development probes of both visual modes with the committed runner passed (3,426 checks each, 0 failed) and are disclosed in §10. They are observations, not evidence.

| Run | Checks | Preconditions | Product checks | Failed product checks | Runtime errors / console warnings | Key audit | Screenshots | Exit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EN `native-5bbf473-fixed1-keyboard-en.log` (1024×768) | 941 | 775 | 166 | 5, all the selected swatch (L128, L172, L272, L338, L370) | 0 / 0 | 1,683 of 1,683 events, 0 mismatches | 36 | 2 |
| ZH `native-5bbf473-fixed1-keyboard-zh.log` (375×812, mobile emulation) | 989 | 823 | 166 | 5, the same (L134, L180, L286, L356, L391) | 0 / 0 | 1,663 of 1,663 events, 0 mismatches | 36 | 2 |

- Exit 2 means the harness was valid and a product check failed.
- Both runs are harness-valid, `harnessValid: true` (EN L1053, ZH L1106).
- No precondition failed.

**Status.** This is verification only.
- It is not acceptance and authorizes nothing.
- It repairs nothing, under the stop rule. It changes no product source, product test, contract, ledger, control plane or existing evidence.
- Every earlier file in this directory was read only. Five of them were reused read-only and hash-checked (§2).
- Before the commit, `git status --porcelain --untracked-files=all` listed only the 77 new files of §2, all in this directory.
- It closes no 312 item.
- It does not push, merge, deploy, release or sync Web→Desktop.

## 1. Identity

| Item | Value |
| --- | --- |
| Executor | An independent Claude Opus 5.5 instance in the parent-role visual and keyboard verifier role (batch 48), not the batch 46 executor. It wrote none of: the contract, the Appearance caller or its fix, earlier evidence, the reused batch 45 fixture and instruments, or the batch 46 runner and probes. |
| Worktree | `.claude/worktrees/agent-a6f9fa3f4eefba273`. Detached at docs base `aa326b4f9cf4954ab6e17ca82083460a61077f1c` after `git fetch origin codex/web/full-product-audit-20260908`; clean before the work. |
| Fixed revision | Requested `5bbf473`, resolved `5bbf473872073472188957f430057412e8798131`, tree `a33efee5688ae1354521abbd8a82e689247a6768` (the `baseline` record, L9 in both logs). |
| Before revision | `5cd63ff652f02a2c726187fe12cbc796218d31c0`. Used for the focus references (§3, §4). |
| Product-tree equality | `git diff --name-only 5bbf473 HEAD -- apps packages package.json pnpm-lock.yaml` is empty (`baseline:docs-head-product-tree-equals-fixed`, L10). `5cd63ff..5bbf473` is exactly 25 files: the 24 Terra files plus `AppearancePane.focus-ring.test.tsx` (`baseline:fixed-delta-is-exactly-the-25-files-terra-24-plus-the-f-app-1-guard-test`, L13). `24073b5..5bbf473` is `styles.css` (+9) and the new test (+169) only. |
| Authority | Contract r3 (`706c9a3`), SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d`, re-derived in every run (L12). Relevant sections: §9 "Keyboard" and presentation, A2.1–A2.9, A9, §13 gates 8 and 9, §14 E14–E15. Control plane: "本轮唯一任务" (batch 48), the F-APP-1 rows and the CP-APPEARANCE-01 rulings. |
| Browser | `Chrome/154.0.8037.97` (HeadlessChrome, `--headless=new`), DevTools protocol 1.3, over the **pipe** transport (`--remote-debugging-pipe`, flattened sessions), isolated profile, deviceScaleFactor 1. The only Chrome on the host (`/Applications/Google Chrome.app`, Info.plist 154.0.8037.97). |
| Host and toolchain | macOS 27.0.1 (26A434), arm64; Node `v24.16.0`; esbuild `0.28.1` from the gated tree; react 19.2.0, react-dom 19.2.0, react-router 7.15.1. |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`, equal in six places: `XAI_DEPS_ROOT`, both revisions, both extracted archives and the contract gate (L11). A consistency check only. |
| Dependency root | The main checkout, read only. No install, build, checkout, dev server or preview tool ran there. A read-only mtime scan with the batch 46 scope found **0** newer entries among 3,188 after all runs (§11). |
| Network | Only the runner's own `127.0.0.1` server (ephemeral port); every other host resolves to NOTFOUND. 0 page network attempts (`run:no-non-local-network-attempt`, EN L1047, ZH L1100). |
| Evidence runs | Both started 2026-10-05T16:38:13Z in parallel. EN ended 16:42:34Z, ZH 16:42:42Z. |
| Iterations | keyboard-en 1 of 3 (`fixed1`); keyboard-zh 1 of 3 (`fixed1`); visual-en and visual-zh 0 of 3 (not run as evidence, stop rule). Development probes are disclosed in §11. |

## 2. Files and SHA-256

All 77 files are new and in this directory.
- The runner records its own hash and those of every reused input in each log's `baseline` record (`fileSha256`, L9).
- Every screenshot's SHA-256 on disk equals its `screenshot` record in the log (72 of 72 checked).
- Equal hashes between files are expected: identical pixels give identical PNGs.
- This receipt cannot carry its own hash.

| File | Lines / size | SHA-256 |
| --- | --- | --- |
| `verify-visual-keyboard-5bbf473.mjs` (runner copy, all four modes) | 2,975 lines, 233,571 B | `5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4` |
| `verify-visual-keyboard-5bbf473.diff` (unified diff, frozen runner → copy; 751 insertions, 11 deletions) | 921 lines, 73,777 B | `d0fe845b97dcf86dfb16c0b9fde18dc0dc04d83473038cbfa7045cf6c6563c19` |
| `native-5bbf473-fixed1-keyboard-en.log` (E15 EN, the frozen reproduction) | 1,053 lines, 479,957 B | `5df3288bd03b2a7b565b6cbb79d3dfdbffe9e103bf8e33553840a7f3c2bf7f93` |
| `native-5bbf473-fixed1-keyboard-zh.log` (E15 ZH, the frozen reproduction) | 1,106 lines, 482,964 B | `a95f812e8455177143071c65e2b4c0e52f4e25a2164b48936f7d7f869581779e` |
| 72 screenshots | see §12 | see §12 |
| `review-visual-keyboard-5bbf473.md` | — | this receipt |

**Reused read-only and hash-checked in every run** (`baseline:frozen-batch-45-fixture-and-prelude-and-e4-h14-log-reused-read-only-hash-checked` L15; `baseline:frozen-batch-46-probes-reused-read-only-and-frozen-runner-unchanged-hash-checked` L14):

| File | SHA-256 |
| --- | --- |
| `native-host-retryall-app.tsx` (batch 45 production App fixture) | `118f565783fc99e2642341e39ff9afa2df4a6cb937dc016ca41ab13ab1721c19` |
| `native-host-retryall-prelude.js` (batch 45 instruments) | `ad4d711a5639b6685f05ea9cf5742f77d17e5924a127453dcd42f1a117757e7b` |
| `native-5cd63ff-before1-h14.log` (frozen E4 H14; read by the visual modes only) | `3d1f5763d11207e6e4e24fc2678177aae0960a91fb933985c061b08bde54e02f` |
| `native-visual-keyboard-probes.js` (batch 46 probes) | `4df16575470d739d1655f32cd1bb0101c2b772552439f3ecfefded4f87bc02c4` |
| `verify-visual-keyboard.mjs` (batch 46 runner, the diff base; not executed) | `ac268a0af6263772c9e3976d30b7bc2f3502d52c3973de4daa976734aead0781` |

## 3. The failure: the selected accent swatch has no visible focus (E15)

### 3.1 Reproduction (section `swatch-focus`)

**Procedure, per case:**
1. A trusted Tab walk from the pane title (a non-focusable anchor) to the swatch.
2. The mouse is parked, and the frame is quiescent: no finite animation or transition is running.
3. A control-relative clip with a 10 px margin is captured as a stable frame (two consecutive identical captures).
4. Trusted Shift+Tab until focus leaves the swatch row, which lands on `density:compact` in the row above. No other swatch's ring or repaint is then inside the clip.
5. The same clip is captured again; the swatch's rect, clip and hover state are identical to the first capture.
6. Decoded pixels are compared over the whole clip and over the swatch's own region (its outline band plus its own box).

Positive controls: a non-selected swatch in the same document.

| Language, product, case | Swatch | Focused outline | Unfocused outline | Shift+Tab path | Pixels | PNG (focused / moved back) | Line |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EN, 5bbf473, default accent (Sage selected) | `swatch:0`, **selected** | solid 2px `oklch(0.21 0.012 230)` | the same | → `density:compact` | **identical**; own 0 / 1,936 | `a9a8821f…` / `a9a8821f…` | L123–L128 **FAIL** |
| EN, 5bbf473, default | `swatch:1` (positive control) | solid 2px accent ring | solid 1px `--border-1` | → `swatch:0` → `density:compact` | own 587 / 1,936 | `915430a6…` / `fb6da820…` | L137–L142 |
| EN, 5bbf473, `xai_accent_hue` 230 (Ocean selected) | `swatch:1`, **selected** | solid 2px `oklch(0.21 0.012 230)` | the same | → `swatch:0` → `density:compact` | **identical**; own 0 / 1,936 | `e9af9a97…` / `e9af9a97…` | L167–L172 **FAIL** |
| EN, 5bbf473, accent 230 | `swatch:2` (positive control) | solid 2px accent ring | solid 1px | → `swatch:1` → `swatch:0` → `density:compact` | own 563 / 1,936 | `8116afa1…` / `f80129c0…` | L181–L186 |
| EN, 5cd63ff, default | `swatch:0`, **selected** | solid 2px `oklch(0.21 0.012 230)` | the same | → `density:compact` | **identical**; own 0 | `a9a8821f…` / `a9a8821f…` | L211–L216 (reference) |
| EN, 5cd63ff, default | `swatch:1` | solid 2px accent ring | solid 1px | → `swatch:0` → `density:compact` | own 537 / 1,936 | `f6edfd04…` / `fb6da820…` | L225–L230 (reference) |
| ZH, 5bbf473, default | `swatch:0`, **selected** | solid 2px `oklch(0.21 0.012 230)` | the same | → `density:compact` | **identical**; own 0 / 1,936 | `300ff1da…` / `300ff1da…` | L129–L134 **FAIL** |
| ZH, 5bbf473, default | `swatch:1` | solid 2px accent ring | solid 1px | → `swatch:0` → `density:compact` | own 555 / 1,936 | `1f97781b…` / `4749df26…` | L143–L148 |
| ZH, 5bbf473, accent 230 | `swatch:1`, **selected** | solid 2px `oklch(0.21 0.012 230)` | the same | → `swatch:0` → `density:compact` | **identical**; own 0 / 1,936 | `5bdf828d…` / `5bdf828d…` | L175–L180 **FAIL** |
| ZH, 5bbf473, accent 230 | `swatch:2` | solid 2px accent ring | solid 1px | → `swatch:1` → `swatch:0` → `density:compact` | own 561 / 1,936 | `7c480559…` / `ad4a6ccb…` | L189–L194 |
| ZH, 5cd63ff, default | `swatch:0`, **selected** | solid 2px `oklch(0.21 0.012 230)` | the same | → `density:compact` | **identical**; own 0 | `300ff1da…` / `300ff1da…` | L221–L226 (reference) |
| ZH, 5cd63ff, default | `swatch:1` | solid 2px accent ring | solid 1px | → `swatch:0` → `density:compact` | own 561 / 1,936 | `1f97781b…` / `f6a04667…` | L235–L240 (reference) |

All captures were stable at the second shot.

The 5cd63ff selected-swatch clips are byte-identical to the fixed ones in both languages. The defect is therefore pre-existing and unchanged by Terra's work.

### 3.2 The same stop in every Tab walk (section `tab`, the per-stop oracle)

`swatch:0` fails in all six walks. Its own region shows 0 of 1,628 pixels changed:
- EN: clean L271, drafts L337, source L369;
- ZH: clean L285, drafts L355, source L390.

Its clips were saved: the `pixel-tab-*-swatch-0-*` screenshots, §12.

The whole clip does differ: 167, 144 and 167 px in EN, and 156 px in each ZH walk. All of those pixels lie inside the excluded ring area of the next stop, `swatch:1`, whose ring appears when it takes focus. They are not this swatch's own focus indicator.

### 3.3 Cause (source read, not changed)

- **The two rules.** `.accent-sw.active { outline: 2px solid var(--text-1); outline-offset: 2px; }` appears in two places, both unchanged since 5cd63ff:
  - the protected `packages/plugin-web-tokens/src/layout.css:1437–1440`;
  - the Appearance stylesheet `packages/xai-web-settings-appearance/src/styles.css:116–119`, in the part that predates this caller.
- **Specificity.** Both rules are (0,2,0). They outrank the global `button:focus-visible` ring `outline: 2px solid color-mix(in oklch, var(--accent) 58%, transparent); outline-offset: 2px` in `packages/plugin-web-tokens/src/tokens.css:246–253`, which is (0,1,1).
- **The result.** The selected swatch keeps its selection ring when focused. That ring has the same geometry as a focus ring, and it does not change with focus.
- **Markup.** `AppearancePane.tsx:261` sets `className={"accent-sw" + (Math.abs(values.accentHue - p.hue) < 3 ? " active" : "")}`. Exactly one swatch is selected whenever the accent equals a preset hue.
- **Only this rule.** In `layout.css`, `tokens.css`, the settings-shell stylesheet, the shell and the Appearance stylesheet, no other state-dependent `outline` rule applies to a pane control. The walks confirm that every other stop shows its ring.

### 3.4 Why earlier checks did not catch it

- **The frozen batch 46 check passes it.** `every-stop-focus-visible-with-an-outline-of-at-least-2px` requires only `:focus-visible` and a computed outline of at least 2 px (EN L254, L325). The selection ring is solid 2 px, so it passes; the F-APP-1 ruling added the pixel condition for exactly such cases.
- **A whole-clip pixel comparison also passes it.** With a 10 px margin the clip contains part of the neighbouring swatch, whose ring appears when focus moves on (§3.2). The runner therefore compares the stop's own region and excludes the next stop's ring area (§9).

### 3.5 What this does and does not imply

- §9 binds the fixed product, and §11 allows selectors under `.appearance-pane` in the Appearance stylesheet. A pane-scoped rule for a focused selected swatch, for example one keyed on `.accent-sw.active:focus-visible`, is within the caller's files, as F-APP-1 was.
- Whatever indicator is chosen must differ from the selection ring.
- The stop rule forbids this verifier to fix it, and no fix was tried. The controller decides ownership and design, including the protected `layout.css` copy of the rule.
- **Effect on the user.** Keyboard operation works: Space and Enter select a swatch exactly once (§5.2). But when focus reaches the selected swatch, nothing changes: the previous control's ring disappears and no new indicator appears.

## 4. The F-APP-1 repair, verified (section `focus-visibility` and the walks)

**Procedure (the batch 46 procedure):**
1. A trusted Tab to the slider.
2. A clip with a 10 px margin.
3. One more trusted Tab, so focus moves on.
4. The same control-relative clip again.

The hue slider is the positive control.

| | Product | `:focus-visible` | Computed outline | Focused vs moved on | Line |
| --- | --- | --- | --- | --- | --- |
| EN 1024×768, Font scale slider | 5bbf473 | true | **solid 2px `oklch(0.57 0.085 165 / 0.58)`, offset 2px** | **differ**: `62f79bd0…` vs `6ad3f2c8…` | L52–L58 (PASS) |
| EN, hue slider (positive control) | 5bbf473 | true | the same ring | differ: `121b8874…` vs `065dff6b…` | L40–L46 |
| EN, Font scale slider | 5cd63ff | true | `none` (`3px`, `oklch(0.21 0.012 230)`) | **identical**: `3a90a477…` both (the frozen batch 46 hash) | L91–L96 |
| ZH 375×812, Font scale slider | 5bbf473 | true | **solid 2px, the same ring** | **differ**: `ab7f6fb4…` vs `31dd04a8…` | L54–L60 (PASS) |
| ZH, hue slider | 5bbf473 | true | the same ring | differ: `b35454b7…` vs `776ef536…` | L42–L48 |
| ZH, Font scale slider | 5cd63ff | true | `none` | **identical**: `a1343047…` both (the frozen batch 46 hash) | L95–L100 |

**In the walks** (§5.1), the Font scale slider has a solid 2 px outline and its own region changes:
- EN: 680/2,624 (clean), 689/2,624 (drafts), 689/2,624 (source);
- ZH: 876/3,408 in each walk.

**Ring equality.** Its ring equals the hue slider's global ring in style, width, colour and offset. The repair does what the F-APP-1 ruling asked.

## 5. E15 results other than the failure (both languages PASS)

The runs used trusted CDP input only. Widths: EN 1024×768, ZH 375×812 with mobile emulation, as in batch 46.
- **Pet.** Each document hides the pet with the product's rail toggle (a trusted, hit-tested click; at 375 it is made at 1440 px).
- **Focus.** Focus moves only by Tab, Shift+Tab, or the product's own focus management. The exceptions are the batch 46 ones:
  - pointer anchors on non-focusable text;
  - one removable `tabindex` on the pane title, for the Space-scroll positive control.

Log lines are EN / ZH.

### 5.1 Tab order and visible focus

| Requirement | Result | Lines |
| --- | --- | --- |
| Tab reaches every control in DOM order | **Clean:** full cycles of 61 presses (EN) and 59 (ZH), one step outside the document at the wrap; equal to the DOM order of tabbable controls, rotated. The pane part is the 25 row controls, Retry all (`aria-disabled`, still a stop), Reset. | L250–L253 / L262–L265 |
| All seven unresolved | 78 / 76 presses. The pane stops run row by row, `retry:<field>` and `discard:<field>` after each field, then Retry all, Export, Discard all and Reset. | L321–L323 / L337–L339 |
| Topbar status before the appearance trigger | A stop immediately before the trigger | L324 / L340 |
| Source only (`xai_rail_pos` = `diagonal`) | `reload:railPos` after the sidebar cards, then the Font scale slider, Retry all (disabled) and Reset. The full source-only cycle also equals the DOM order. | L358, L368 / L378, L388 |
| Visible focus, frozen check (`:focus-visible`, outline ≥ 2 px, pane stops solid, centre-hit, in viewport) | PASS in the clean and drafts cycles | L254–L255, L325–L326 / L266–L267, L341–L342 |
| **Visible focus by pixels at every stop** (the F-APP-1 ruling's oracle) | EN 195 and ZH 189 stop captures in six full cycles. Every stop shows focus except `swatch:0` (§3.2). Weakest passing own-region change: EN 362 px (`lang:en`), ZH 81 px (`rail:任务`, see below). | EN L271, L337, L369 / ZH L285, L355, L390 |

**Own-region pixels changed / own-region pixels** for every pane control and caller target, in each walk; shell stops are summarised by group:

| Stop | EN clean | EN drafts | EN source | ZH clean | ZH drafts | ZH source |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `lang:en` | 362/2940 | 362/2940 | 362/2940 | 392/3920 | 392/3920 | 392/3920 |
| `lang:zh` | 516/3780 | 516/3780 | 516/3780 | 576/5040 | 576/5040 | 576/5040 |
| `theme:light` | 822/12524 | 826/12524 | 822/12524 | 775/10890 | 776/10890 | 775/10890 |
| `theme:dark` | 822/12524 | 820/12524 | 822/12524 | 772/10780 | 772/10780 | 772/10780 |
| `theme:system` | 918/12896 | 913/12896 | 918/12896 | 858/11220 | 858/11220 | 858/11220 |
| `density:comfortable` | 496/4326 | 496/4326 | 496/4326 | 320/2912 | 320/2912 | 320/2912 |
| `density:compact` | 532/3906 | 528/3906 | 532/3906 | 468/3528 | 468/3528 | 468/3528 |
| `swatch:0` (selected) | **FAIL** 0/1628 | **FAIL** 0/1628 | **FAIL** 0/1628 | **FAIL** 0/1628 | **FAIL** 0/1628 | **FAIL** 0/1628 |
| `swatch:1` | 437/1628 | 443/1628 | 437/1628 | 455/1628 | 455/1628 | 455/1628 |
| `swatch:2` | 435/1628 | 435/1628 | 435/1628 | 455/1628 | 455/1628 | 455/1628 |
| `swatch:3` | 446/1628 | 437/1628 | 437/1628 | 455/1628 | 455/1628 | 455/1628 |
| `swatch:4` | 437/1628 | 437/1628 | 437/1628 | 456/1628 | 456/1628 | 456/1628 |
| `swatch:5` | 546/1936 | 546/1936 | 546/1936 | 555/1936 | 553/1936 | 555/1936 |
| `hue-slider` | 739/3440 | 738/3440 | 739/3440 | 740/3440 | 740/3440 | 740/3440 |
| `tone:default` | 656/8556 | 682/8556 | 656/8556 | 650/9702 | 650/9702 | 650/9702 |
| `tone:cream` | 589/8680 | 581/8680 | 589/8680 | 651/9702 | 651/9702 | 651/9702 |
| `tone:mist` | 577/8556 | 577/8556 | 577/8556 | 818/10197 | 818/10197 | 818/10197 |
| `tone:lavender` | 621/9920 | 621/9920 | 621/9920 | 652/9800 | 652/9800 | 652/9800 |
| `tone:peach` | 583/8680 | 583/8680 | 583/8680 | 653/9800 | 653/9800 | 653/9800 |
| `tone:graphite` | 821/10044 | 821/10044 | 821/10044 | 822/10300 | 822/10300 | 822/10300 |
| `railpos:left` | 763/14715 | 864/14824 | 766/14715 | 585/8468 | 585/8468 | 585/8468 |
| `railpos:right` | 763/14715 | 761/14824 | 763/14715 | 577/8468 | 577/8468 | 577/8468 |
| `railpos:top` | 761/14715 | 760/14824 | 761/14715 | 585/8584 | 585/8584 | 585/8584 |
| `railpos:bottom` | 1006/15390 | 1001/15504 | 1002/15390 | 786/9048 | 786/9048 | 786/9048 |
| `font-slider` | 680/2624 | 689/2624 | 689/2624 | 876/3408 | 876/3408 | 876/3408 |
| `retry:<field>` ×7 | — | 426–432/3976 | — | — | 403/3584 | — |
| `discard:<field>` ×7 | — | 571–633/5096 | — | — | 495/3864 | — |
| `reload:railPos` | — | — | 563/4816 | — | — | 603/5376 |
| `retry-all` | 540/5035 | 507/5040 | 534/5035 | 529/5088 | 511/5096 | 529/5088 |
| `export` | — | 1030/10976 | — | — | 657/6728 | — |
| `discard-all` | — | 879/9408 | — | — | 625/6597 | — |
| `reset` | 831/8568 | 819/8568 | 819/8568 | 603/5376 | 603/5376 | 603/5376 |
| `topbar:status` | — | 720/6480 | — | — | 413/2646 | — |
| rail (shell) | 16 stops, min 402 | 16, min 402 | 16, min 402 | 14, min 81 | 14, min 81 | 14, min 81 |
| Topbar search and trigger (shell) | 2, min 1478 | 2, min 1478 | 2, min 1478 | 2, min 558 | 2, min 558 | 2, min 558 |
| settings sidebar (shell) | 14, min 528 | 14, min 528 | 14, min 528 | 14, min 720 | 14, min 720 | 14, min 720 |

**`rail:任务`, flagged for manual review.** It is the first item of the bottom rail at 375 px, a shell control outside this caller. It was flagged because its ring band had no comparable pixels (L284, L354, L389):
- the rail scroller clips the ring's top, bottom and left segments;
- the right segment lies in the 6 px gap that the next item's ring area shares, which the oracle excludes.

Its own box changes in 81 px. Development-probe clips of this stop (dev15, not committed) show a clearly visible rounded ring when focused and none after focus moves on.

**Recorded, not gated** (as in batch 46): in the ZH 375 cycles one rail button ends a few pixels outside the viewport when focused. This is the shell's bottom rail and not part of this caller.

### 5.2 Enter and Space activate once; no scroll on Space

There were 13 activations per language, in the same plan as batch 46. Each had:
- exactly 1 trusted keydown and 1 trusted click;
- exactly the expected writes;
- focus kept on the control, which showed the choice.

EN L396–L518 (table L519), ZH L419–L541 (table L542).

| Control | Key | Writes (exact) |
| --- | --- | --- |
| Theme Dark, System, Light | Space, Enter, Enter | `xai_pref_theme` = `"dark"`, `"system"`, `"light"` |
| Density Compact, Comfortable | Enter, Space | `xai_pref_density` = `"compact"`, `"comfortable"` |
| Accent swatches Ocean, Sunset | Space, Enter | `xai_accent_hue` = `230`, `35` |
| Background Lavender, Sage (`default`) | Enter, Space | `xai_bg_tone` = `lavender` with `xai_accent_hue` = `295`; `default` with `165` |
| Sidebar Right, Left | Space, Enter | `xai_rail_pos` = `right`, `left` |
| Language (the other one, then back) | Enter, Space | `xai_pref_lang` = `"zh"`/`"en"` (EN), `"en"`/`"zh"` (ZH) |

**Space-scroll detection.**
- **Positive control:** Space on the focused pane title scrolls `.module-settings` by 449 px (EN) and 652 px (ZH). That exceeds half the scrollport (358 and 346 px; EN L388, ZH L411).
- **All 15 Space presses per language did not page-scroll.**
- **Tolerances (control-plane ruling 4):**
  - clamps to a shorter range after a recovery block left (EN −114 px, ZH −108 px);
  - in ZH, scroll anchoring of 3 px after the density change and 13 px after the accepted reset.
- **ZH preparation.** For four ZH presses on bottom controls, the scroller was first moved up by at most 120 px, keeping the control in view (`space-scroll` records).

### 5.3 Slider steps

Each key press was exactly one edit: 1 `input` event and 1 write with exact bytes. The readout followed and focus stayed. EN L539–L553, ZH L564–L578.

| Slider | ArrowRight | ArrowLeft | Home | End | Final bytes |
| --- | --- | --- | --- | --- | --- |
| Accent hue | `166` (166°) | `165` | `0` | `360` | `360` |
| Font scale | `1.05` (105%) | `1` | `0.85` | `1.15` (115%) | `1.15` |

### 5.4 Reset confirmation by keyboard

The setup stored `theme` = `dark` and `density` = `compact`, then reached Reset by Tab.
- **Enter:** 1 confirm with the §5 text, declined. 0 get, set or remove attempts on any key; focus stayed on Reset (EN L575–L578 / ZH L602–L605).
- **Space:** 1 confirm, accepted. Exactly 2 removals; "Defaults restored." / "已恢复默认设置。" appeared; focus stayed on Reset (L581–L586 / L608–L613).
- **Partial reset, Enter** (`xai_rail_pos` removal denied): 1 confirm. No restored claim; focus stayed on Reset (L609–L612 / L638–L641).

### 5.5 Focus targets

| Action (keyboard) | Focus afterwards | EN / ZH |
| --- | --- | --- |
| Discard Density (Enter), 0 writes | `density:comfortable`, the selected segment | L642–L644 / L673–L675 |
| Discard Accent color (Space), 0 writes | the hue slider | L651–L655 / L682–L686 |
| Retry Theme that fails again (Space), 1 denied write | stays on `retry:theme`; the block is kept | L681–L685 / L714–L718 |
| Retry Theme that succeeds (Enter), 1 write | the block unmounts; focus on `theme:dark`, the selected card | L688–L690 / L721–L723 |
| Reload Sidebar position, unrepaired (Enter), 0 writes | `railpos:left`; the alert is kept and the bytes stay `diagonal` | L712–L714 / L747–L749 |
| Reload after an external repair to `top` (Space), 0 writes | `railpos:top`; the alert is cleared with no Saved claim | L718–L722 / L753–L757 |
| Discard all (Enter), 0 writes | Reset to defaults, inside the pane, never `<body>` | L752–L754 / L789–L791 |
| Accepted reset (Space) | stays on Reset | L586 / L613 |

### 5.6 Retry all by keyboard (A2.2, A2.5, A2.7)

| Requirement | Result | EN / ZH |
| --- | --- | --- |
| A Tab stop in every state | Clean, source-only and drafts cycles (§5.1); during an open pass with E empty (`aria-disabled`); after a member fails again (enabled). Both pass states were reached by Shift+Tab and Tab back, with zero writes. | L252, L323, L358, L964, L994, L996 / L264, L339, L378, L1013, L1045, L1047 |
| Disabled (clean; pending only, behind the real lock; source only): Enter and Space inert, focus kept, no scroll | 0 set or remove attempts, 0 application lock requests; still `aria-disabled` and focused | L776–L852 / L815–L895 |
| Enter starts one pass; full success | One write per member. "Appearance settings saved." / "外观设置已保存。". Retry all is now `aria-disabled` with no description, and focus stayed on it; no sampled frame had focus on `<body>`. No Topbar status. | L882–L885 / L927–L930 |
| Space starts one pass; partial result | One attempt per member. "1 appearance change is not saved." / "1 项外观更改未保存。". Focus on the enabled Retry all; Topbar status shown. | L915–L919 / L962–L966 |
| A second Enter and Space while a member is pending | 0 attempts; focus kept; disabled and described by the in-flight line; after release the held member was written once | L949–L965 / L998–L1014 |
| Open pass whose only member is held, with the fault armed | Disabled while open, focus kept; on release the member fails again, the button becomes enabled, focus stays and the count line describes it | L991–L996 / L1042–L1047 |

### 5.7 Topbar status and popover

From `/app/tasks`, after a failed Topbar theme choice:
- **Tab order.** A trusted click on the Topbar background, then Tab, Tab, reaches the search box and then the status, before the trigger.
- **Focus.** The status shows a 2 px solid ring and is centre-hit.
- **Enter and Space.** Each navigates exactly once to `/app/settings/appearance`: one `pushState`, one router commit, one trusted click, zero storage writes. EN L1027–L1039, ZH L1080–L1092.
- **Popover.** The order is search, status, trigger. Enter opens the popover and Escape closes it (L1043–L1044 / L1096–L1097).

## 6. Key audit (K-1)

- **Keys.** CDP `Input.dispatchKeyEvent` **without** `nativeVirtualKeyCode`. Enter and Space carry `text`; Shift+Tab is Tab with modifier 8.
- **Precondition.** At every document change and at the end, each document's capture-phase key trace must equal the runner's own presses exactly, in order and trusted (`run:keyboard-trace-contains-only-the-runner-key-presses`).

| Run | Checkpoints | Runner presses | Key events received | Expected | Untrusted | Mismatches | Line |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EN | 95 | 822 | 1,683 | 1,683 | 0 | 0 | L1048 |
| ZH | 95 | 812 | 1,663 | 1,663 | 0 | 0 | L1101 |

## 7. Runtime errors, console warnings, dialogs, network

- **Runtime errors: 0 in both runs.** This counts CDP exceptions, `console.error`/`console.assert` and renderer crashes, and includes the 5cd63ff reference documents (`run:runtime-errors-zero`, EN L1052, ZH L1105).
- **Console warnings: 0 in both runs** (`consoleWarnings: 0`, `consoleWarningsBySource: {}`).
- **Dialogs:** 7 per run, all planned (`run:no-unexpected-javascript-dialogs`, `run:every-planned-dialog-consumed`):
  - 3 reset confirmations (decline, accept, accept);
  - 4 runner-initiated `beforeunload` prompts.
- **Network:** 95 checkpoints, 0 attempts beyond the local origin, 0 non-local. One probe was counted separately: the prelude's own self-test (`selfTestProbes: 1`).

## 8. Provenance

| Item | Fixed (`5bbf473`) | 5cd63ff (references) |
| --- | --- | --- |
| Bundle inputs | 1,017: 625 archive-relative, 390 third-party, the `define` and the fixture. **0 foreign.** | 1,013: 621, 390 and 2. **0 foreign.** |
| `@repo/*` pinned to the archive | 320, **0 guard violations** | 320, **0 violations** |
| Required modules from the archive | 39 of 39; every required module outside the 25-file delta is byte-identical to 5cd63ff (`baseline:fixed:bundled-protected-modules-byte-identical-to-5cd63ff`, L4) | 36 of 36 |
| Bundle SHA-256 (js / css) | `4474593b139670c98ac5587a9e4b7e7ebf9e326da971650c4d16c74148dc0dc7` / `0c610179fc7d81611f698eb22640b2bf1b180424ccb446ac2eb5877d070a98c2` | `e1ca2db9b0d98c626209e74c45840d5f0eaf4f492bd3a2bcb41a1d7a043354ec` / `b4ca75d8a975eee883a777cd4f32af199cd4a8175669544a545d64f84dd2bc47` |
| Log lines | L1–L4 | L5–L8 |

- The bundle hashes are identical in the two runs.
- They differ from batch 46's because esbuild writes source paths relative to the temporary archive into comments, and this batch's scratch directory differs.

**The only synthetic input is the auth session.** The fixture's `WebAuthSessionProvider` gets a client whose `auth.getSession` resolves one session for `appearance-native-A`. The real `AccountDataGate` activates generation `g1`.

**Instruments:**
- the batch 45 prelude: storage log with faults, Web Lock fixture, history and dispatch spies, key/click/input traces, confirm recorder, frame sampler. Its self-test passed (L18);
- the batch 46 probes (read only; colour self-test L20);
- the runner's own page helper `window.__b48`: a JS global only, which places elements by `scrollIntoView` and decodes PNGs in the page for the decoder self-test;
- for the E14 cascade audit, temporarily adopted constructed stylesheets, removed afterwards (§10.2).

## 9. The runner copy: what changed against the frozen batch 46 runner

`verify-visual-keyboard-5bbf473.diff` is the full unified diff. Of the frozen runner's lines, exactly 11 are changed and none is removed:

| Change | Kind | Why |
| --- | --- | --- |
| Usage path and the `RUNNER` name | SHA-specific | The copy's own file name |
| `EXPECTED_FIXED_DELTA`: 25 files (adds `AppearancePane.focus-ring.test.tsx`); the precondition label | SHA-specific | Control plane batch 48 |
| Focus-visibility labels: `24073b5` → `5bbf473` (4 lines) | SHA-specific | Control plane batch 48 |
| `fileSha256` also records the frozen runner | Additive | Provenance of the diff base |
| `captureClip` adds the visual viewport's page offset (2 lines) | **Fix, disclosed** | CDP screenshot clips are page coordinates, and the frozen helper passed viewport-relative rects. The self-test confirms it: with the window scrolled by 158 px at EN 1024×768, a page-coordinate clip equals the viewport crop and a viewport-coordinate clip does not (EN L260–L261). Identical results while the window is not scrolled. Wherever the product is unchanged, batch 46's clip hashes reproduce: §12 #1–#3, #7, #8, #10–#12 (EN) and #37–#39, #43, #44, #46–#48 (ZH). Only the 5cd63ff hue rows (#9, #45) differ from batch 46's row hashes, and they now equal the fixed rows. |

**Additive sections (751 inserted lines).** No frozen check was removed or weakened:
1. **Frozen-input hash checks** for the batch 46 probes and runner (L14).
2. **E15 visible focus by pixels at every Tab stop** (`pixelFocusWalk`). After the frozen clean and drafts cycles, and in the source-only state, a second full cycle captures every stop twice:
   - focused, and again after focus moved on to the next stop;
   - the stop is scrolled to the same place by script both times;
   - each capture follows a quiescent frame and is a stable frame (two consecutive identical captures);
   - rect, clip and hover state must be equal in both captures.

   The decoded pixels of the stop's own region (its outline band ±2 px plus its own box, with the next stop's ring area excluded) must differ, and the computed outline must not be `none`.

   **Preconditions:**
   - every stop is captured in stable, aligned frames with comparable own pixels;
   - the walk visits exactly the frozen cycle's stops.

   **Self-tests:**
   - the runner's PNG decoder equals the browser's own decoding of the same screenshot (429 and 446 distinct colours; EN L258–L259, ZH L271–L272);
   - the clip-coordinate check above. ZH 375 cannot scroll the window, so that check is not exercised there.
3. **The reproduction section `swatch-focus`** (§3.1).
4. **The E14 cascade-order audit** (§10.2). It runs in the visual modes only.

**Hardening during development** (all before the evidence runs, §11):
- the clip box ignores `html`/`body` overflow, which propagates to the viewport;
- `inline: "center"` placement for the horizontal 375 px rail;
- quiescent and stable frames, after raster noise from a neighbouring swatch's `outline-color` transition was seen;
- leaving the swatch row in the reproduction;
- the own-region criterion, after a stop whose ring band was entirely clipped or shared.

## 10. E14: not run as evidence (stop rule); static audit and development observations

The batch 48 stop rule says to freeze the reproduction, commit and stop. As in batch 46, the visual modes were therefore not run as evidence:
- E14 has no committed logs or screenshots in this batch;
- the §9 screenshot set (all-seven at five widths, Topbar status, partial states, clean focused Retry all, pet-on 768) is for the next rerun.

What follows is reproducible from git (§10.1) or observed in development probes that are not committed (§10.2–§10.3).

### 10.1 Static selector audit (git; not a browser run)

- **Changed CSS.** `git diff --name-only 5cd63ff 5bbf473 -- '*.css'` lists only `packages/xai-web-settings-appearance/src/styles.css`.
- **Protected stylesheets.** `plugin-web-tokens`, `plugin-web-settings-shell` and `apps/web/src/styles` have an empty diff.
- **Prefix.** The fixed file (12,956 B, `2a417677…`) begins with the 24073b5 file (12,491 B, `c3d3393d…`), which begins with the 5cd63ff file (8,595 B, `1b17d1f4…`).
- **Additions.** 4,361 B and 139 lines appended, balanced. At-rules: `@media (max-width: 640px)` and `@media (max-width: 767px)` only.

The runner's `cssAudit` lists 16 added selectors in 15 rules; all 14 `css:*` checks pass (development probes dev11 and dev22):

| # | Added selector | Context | Scope |
| --- | --- | --- | --- |
| 1 | `.appearance-pane .bg-tones` | `@media (max-width: 640px)` | `.appearance-pane` (375 px containment, 3 columns) |
| 2 | `.appearance-pane .appearance-recovery-field` | — | `.appearance-pane` |
| 3 | `.appearance-pane .appearance-recovery-text` | — | `.appearance-pane` |
| 4 | `.appearance-pane .appearance-actions` | — | `.appearance-pane` (column, wrap, `flex-start`) |
| 5 | `.appearance-pane .appearance-status-line` | — | `.appearance-pane` |
| 6 | `.appearance-pane .appearance-actions-row` | — | `.appearance-pane` |
| 7 | `.appearance-pane .appearance-recovery-field > button` | — | `.appearance-pane` (44×44 minimum) |
| 8 | `.appearance-pane .appearance-actions button` | — | `.appearance-pane` (44×44 minimum) |
| 9 | `.appearance-pane .appearance-retry-all` | — | `.appearance-pane` (`border: 1px solid transparent`) |
| 10 | `.appearance-pane .appearance-actions .appearance-retry-all[aria-disabled="true"]` | — | `.appearance-pane`, **the disabled rule set** |
| 11 | `.appearance-status` | — | `.appearance-status*` |
| 12 | `.appearance-status:hover` | — | `.appearance-status*` |
| 13 | `.appearance-status-icon` | — | `.appearance-status*` |
| 14 | `.appearance-status` | `@media (max-width: 767px)` | `.appearance-status*` (`width: 44px; padding: 0`) |
| 15 | `.appearance-status-text` | `@media (max-width: 767px)` | `.appearance-status*` (`display: none`) |
| 16 | `.appearance-pane .slider-row input[type="range"]:focus-visible` | — | `.appearance-pane` (**the F-APP-1 rule**: `outline: 2px solid color-mix(in oklch, var(--accent) 58%, transparent); outline-offset: 2px`) |

**The disabled Retry all rule (#10)** declares only:
- `background-color: var(--bg-panel-2)`;
- `border-color: var(--border-1)`;
- `color: var(--text-3)`;
- `cursor: not-allowed`.

These are neutral tokens only, with no `--accent*`, `--red*` or `--danger` token and no `pointer-events`. No `.pane-footer` or `.pane-save` class is added.

### 10.2 Cascade-order audit (development observation, committed runner `54508918…`)

**The order change.** In the fixed bundle the Appearance stylesheet is section 7 of 28; at 5cd63ff it was section 25. The 18 stylesheets that now follow it instead of preceding it are:

> matrix, countdown, tasks, habits, pomodoro, time-tracker, bookkeeping, metric-tracker, meditation, calendar, board-core, dashboard-widgets, dashboard-grid, board-workspaces, `leaflet.css`, board-views, statistics, features-panel.

- Every other stylesheet is byte-identical to 5cd63ff, and the order of everything else is unchanged.
- The 5cd63ff order is exactly the fixed order with the Appearance stylesheet moved behind the 18 (precondition).

The runner audits every gated state at every width, `/app/tasks` with the Topbar status, and all 14 presentation loads: 51 audits per language.

| Measure | EN (dev22) | ZH (dev23) |
| --- | --- | --- |
| (a) Reorder equivalence: computed styles under the fixed order vs the 5cd63ff order (re-created by adopting copies of the Appearance, cmdk and global stylesheets; transitions and animations frozen; then restored) | **0 changed** of 60,775 element and pseudo-element entries (316–1,056 elements per audit, including `::before`, `::after` and the range thumb and track) | **0 changed** of 60,775 |
| (b) Overlap scan: rules of the 18 stylesheets (3,222, parsed by Chrome's own parser) targeting an element or pseudo-element that an Appearance rule targets, with a shared longhand | **0** | **0** |
| Rules of the 18 that match an Appearance target at all | Only `.mono` (matrix, habits, meditation, board-views) on the slider readouts `span.slider-val.mono`. It declares `font-family` and `font-variant-numeric`/`font-feature-settings`; the Appearance `.slider-val` rules declare `font-size`, `letter-spacing`, `color` and `min-width`: no shared longhand. | the same |
| Appearance rules exercised | 89 of 89 matched an element in at least one audited state | 89 of 89 |
| Positive controls (every audit) | A synthetic equal-specificity rule after the Appearance one is detected by both (a) and (b). Moving the real `layout.css` after the Appearance stylesheet changes 76 or more computed entries in each of the 46 pane audits. | the same |
| Restoration | The document's adopted stylesheets were restored after every audit | the same |

So none of the 18 stylesheets overrides any Appearance rule in the audited states (control-plane ruling 1 on the F-APP-1 row).

### 10.3 Other E14 development observations (dev22 EN, dev23 ZH; committed runner)

Both probes ran the whole visual mode: 3,426 checks and 1,757 product checks each, **0 failed**, 0 runtime errors, 0 console warnings, 26 planned dialogs. Per width:

| Width × height | States (pet hidden) | Failures | Document / detail / pane (scroll/client) | Smallest caller target EN / ZH | A2.8 separation EN / ZH (centre + 4 insets on Retry all) |
| --- | --- | --- | --- | --- | --- |
| 375×812 | clean, source-only, all seven, partial reset, partial pass, Topbar status | 0 | 375/375, 317/317, 289/289 | 64.11×44 / 57×44 | 145.81 / 145 px, 5 of 5, zero intersection |
| 414×896 | the same | 0 | 414/414, 356/356, 328/328 | 64.11×44 / 57×44 | 184.81 / 184 px, 5 of 5 |
| 768×1024 | the same, plus the open pass | 0 | 768/768, 648/648, 604/604 | 64.11×44 / 57×44 | 463.81 / 463 px, 5 of 5 |
| 1024×768 | the same as 375 | 0 | 1024/1024, 672/672, 608/608 | 64.11×44 / 57×44 | 483.81 / 483 px, 5 of 5, page at top and at end |
| 1440×900 | the same as 375 | 0 | 1440/1440, 738/738, 674/674 | 64.11×44 / 57×44 | 729.81 / 729 px, 5 of 5 |

- **H14 (a).** The EN 375 overflow is gone: pane 289/289, against 380/289 reproduced at 5cd63ff, equal to the frozen E4 log.
- **H14 (b)** reproduces at 768×1024 (5cd63ff).
- **Topbar breakpoint:**
  - 760, 761 and 767 px: status 44×44, icon only, summary hidden;
  - 768 and 1025 px: text visible (EN 112.8×44, ZH 88.5×44), summary visible.
- **Disabled Retry all:**
  - label contrast 3.795 (light, cream) to 5.078 (dark, default) in all 12 loads;
  - colours equal with accent 165 and 25;
  - enabled and disabled differ in colour, background and border;
  - the same box in both states;
  - a 2 px solid focus ring at 375 and 1440 in EN and ZH;
  - `aria-disabled="true"`, with no `disabled`, `title` or `aria-describedby`.
- **Pet-on runs.** Caller controls had uncovered centres in every state (36 checks per language), and no unchanged control was covered.
- **Development screenshots** (19 per probe) were looked at only to validate the harness. They are not part of this receipt's review.

## 11. Diagnostic iterations and development probes

**Diagnostic iterations:**
- keyboard-en and keyboard-zh: 1 of 3 each (`fixed1`), with no further iteration;
- visual-en and visual-zh: 0 of 3.

**Overwrite refusal.** After the committed runs, rerunning `keyboard-en fixed1` and `keyboard-zh fixed1` stopped with `Evidence exists; use a distinct suffix` (exit 1) before anything was written; the logs' hashes are unchanged.

**Development probes** came first, as harness development (batch 39 ruling 1). They wrote only to the session scratchpad through `XAI_NATIVE_EVIDENCE_DIR`, which the runner refuses inside the repository, and some used `XAI_VK_SECTIONS`, which is also refused for repository evidence. None is committed.

| Probe | Mode and sections | Result | Change that followed (harness only) |
| --- | --- | --- | --- |
| dev1 | visual-en `css`, CSS dump | PASS | The 18 later stylesheets and their selectors inspected |
| dev2 | visual-en `css`, clean @1440 | PASS | The cascade audit works; its matches are listed per audit |
| dev3 | keyboard-en `focus-visibility`, `tab` | precondition: the decoder self-test region (viewport centre) had 2 colours | Region moved to the hue slider's gradient. The Font scale slider is visible, and `3a90a477…` reproduces at 5cd63ff. |
| dev4 | keyboard-en `tab` | precondition: two rail stops got an empty clip | `html`/`body` overflow propagates to the viewport and no longer counts as a clipping box |
| dev5 | keyboard-en `tab` | **product: `swatch:0` has no own-ring change in all three walks**. The first sight of the finding. | Reproduction section designed |
| dev6 | keyboard-en `swatch-focus` | product (the finding). The accent-230 selected swatch showed 44 px of scattered anti-aliasing differences next to the neighbour's `outline-color` transition. | Captures wait for a quiescent frame |
| dev7 | keyboard-en `swatch-focus`, `tab` | product (the finding only) | — |
| dev8 | keyboard-en (all) | exit 2, the finding only | — |
| dev9 | keyboard-zh (all) | precondition: rail stops misaligned at 375 px (the horizontal rail scrolled between captures) | `inline: "center"` placement |
| dev10 | keyboard-zh (all) | exit 2, the finding only | — |
| dev11, dev12 | visual-en, visual-zh (all), an earlier revision whose visual-mode code is identical | PASS, 3,426 checks each | — |
| dev13 | keyboard-en `swatch-focus`, `tab` | The scattered differences recurred once in the accent-230 case (44 px band, 57 px box) | Stable frames (two identical consecutive captures); the reproduction leaves the swatch row |
| dev14–dev17 | 4 in parallel: EN ×2, ZH ×2, `swatch-focus`, `tab` | Deterministic. ZH flagged `rail:任务` with no comparable ring-band pixel (clipped and shared ring). | Own-region criterion (band plus own box); a stop without comparable own pixels is a precondition failure |
| dev18–dev21 | 4 in parallel, the same | Deterministic. The finding only; every capture stable at the second shot. | — |
| dev22, dev23 | visual-en, visual-zh (all), **committed runner** | PASS, 0 failed (§10) | — |

The committed runner is the one that produced dev22, dev23 and both evidence logs (`fileSha256`, L9).

**Main-checkout check.** A read-only mtime scan of the main checkout used the batch 46 scope:
- the top level (`.git` and `.claude` excluded);
- `node_modules` and `apps/web/node_modules` to depth 2;
- `apps` and `packages` to depth 3;
- `docs` to depth 2.

It examined 3,188 entries against a marker stamped at 2026-10-05T15:33:32Z, before the first run, and found **0** newer after all runs (16:48Z).

## 12. Screenshot review (all 72 opened and inspected)

**Method.**
- Small clips were upscaled 4–8× with nearest-neighbour scaling, side by side with their pair and a difference map.
- Row images were opened at native size.
- The criterion: is there a visible focus indicator on the focused control, and nothing broken?

All hashes match the log records. Lines are the `screenshot` records. Names omit the `native-5bbf473-fixed1-keyboard-` prefix.

| # | File | Size | Line | SHA-256 | Review |
| --- | --- | --- | --- | --- | --- |
| 1 | `en-5bbf473-hue-slider-focused.png` | 180×28 | L40 | `121b887475fa007ea5c2d360b0d9c926c4c4a558e0d58e6a8f5ee954d21e26d3` | Gradient track with a 2 px accent ring at 2 px offset. **Focus visible.** Equal to the batch 46 hash. |
| 2 | `en-5bbf473-hue-slider-unfocused.png` | 180×28 | L45 | `065dff6b8e7d30d34ec8a12d03c181e4298176deb864cc49312eedd174cb37eb` | The same track, no ring. |
| 3 | `en-5bbf473-hue-slider-focused-row.png` | 624×107 | L42 | `94eff7fbbdce7354bf2eecf3c399392ea37c00524405abedfce54fc41aaf7525` | "Accent color" row: six swatches (Sage with its dark selection ring), the ringed hue track, "165°". |
| 4 | `en-5bbf473-font-slider-focused.png` | 173×24 | L52 | `62f79bd03edcf94cb33a79161a33fb45e26cf567ad59cb8795d3a3ba84620fa5` | Grey track and green thumb **inside an accent ring**. **Focus visible: F-APP-1 repaired.** |
| 5 | `en-5bbf473-font-slider-unfocused.png` | 173×24 | L57 | `6ad3f2c8e99258bad51e4b8125ad9b29752a7ff4ac4ac0f217c3bdd2cea05803` | The plain track, no ring (Terra's moved-on hash). |
| 6 | `en-5bbf473-font-slider-focused-row.png` | 624×89 | L54 | `2f54bcdca7a3d255ef379b114556bdad1e8dfc540b4cb33bc783ae1f1b206fd0` | "Font scale / Global type scale": A, the ringed track, A, "100%". Focus is clearly marked. |
| 7–9 | `en-before-5cd63ff-hue-slider-{focused,unfocused,focused-row}.png` | 180×28, 180×28, 624×107 | L79, L84, L81 | `121b8874…`, `44656b7b8fbb2f733f37eb516b175033466564196ae883f11ae71078b8097a19`, `94eff7fb…` | As #1–#3 at 5cd63ff; ring when focused. |
| 10–11 | `en-before-5cd63ff-font-slider-{focused,unfocused}.png` | 173×24 | L91, L96 | `3a90a4773e80d89b51ab2d424d495c45a416a906c57f1160450deb66c8685616` (both) | Identical, no ring: the frozen F-APP-1 state at 5cd63ff. |
| 12 | `en-before-5cd63ff-font-slider-focused-row.png` | 624×89 | L93 | `38a2cb5672a4679ac5ab97abea3215eed7c0575f3436cc6f30d265038675d4a1` | Focused slider without any indicator (equal to batch 46's #6). |
| 13 | `en-swatch-5bbf473-swatch-0-focused.png` | 52×53 | L123 | `a9a8821fba60f6d89ce5251b77883d81e2d08e8d9e643574ac7a9b3895126173` | Sage with the dark selection ring. **No focus cue.** |
| 14 | `en-swatch-5bbf473-swatch-0-focused-row.png` | 624×107 | L125 | `5267b69f67151c0ad3ac2ee749ed4e3ed94ed3046c38297923665ea1a5078bf6` | Row with the focused selected Sage: it looks exactly like the unfocused selected state. **Failure reproduced.** |
| 15 | `en-swatch-5bbf473-swatch-0-focus-moved-back.png` | 52×53 | L127 | `a9a8821f…` | Identical to #13 (same bytes). |
| 16 | `en-swatch-5bbf473-swatch-1-focused.png` | 52×53 | L137 | `915430a6c6a25440c793a69d9c6ea7ecb743ccbb955243f17da749816acc5bde` | Ocean with an accent focus ring; part of Sage's dark ring at the left edge. **Focus visible.** |
| 17 | `en-swatch-5bbf473-swatch-1-focused-row.png` | 624×107 | L139 | `b79eefea5307534265d263c51dffa4d275571c864e8dae6ca0be09a77d676057` | Sage selected (dark ring), Ocean focused (light accent ring). |
| 18 | `en-swatch-5bbf473-swatch-1-focus-moved-back.png` | 52×53 | L141 | `fb6da820f2a76e231ed8820c91d5ce5e11f216466d22899c2fa72d3d198cd91c` | Ocean with only its thin border. |
| 19 | `en-swatch-5bbf473-accent-230-swatch-1-focused.png` | 52×53 | L167 | `e9af9a97ad387ffc3428715050013c7b677268640b03b71fbffc1b509f5a2c08` | Ocean, now selected, with the dark selection ring. **No focus cue.** |
| 20 | `en-swatch-5bbf473-accent-230-swatch-1-focused-row.png` | 624×107 | L169 | `08bcc4d335f7917bcbf869c72393fdae16f3902c4cba3107114b44290092ad90` | Row at "230°": the focused selected Ocean is indistinguishable from unfocused. **Failure reproduced.** |
| 21 | `en-swatch-5bbf473-accent-230-swatch-1-focus-moved-back.png` | 52×53 | L171 | `e9af9a97…` | Identical to #19. |
| 22 | `en-swatch-5bbf473-accent-230-swatch-2-focused.png` | 52×53 | L181 | `8116afa1cb81b69d7b25e5851e011d9980fcd94ba081998c09f071c1a9bff156` | Sunset with a blue-tinted (accent 230) focus ring. **Focus visible.** |
| 23 | `en-swatch-5bbf473-accent-230-swatch-2-focused-row.png` | 624×107 | L183 | `b2c86fcd46d368d8e6d9ef90475baeddb0fc9fb7930ca3427fccb481b0e92805` | Ocean selected, Sunset focused. |
| 24 | `en-swatch-5bbf473-accent-230-swatch-2-focus-moved-back.png` | 52×53 | L185 | `f80129c0d1df9eaca3f5d9d524e9af92bbe8350588e58ddbaf9178691e4fa4fd` | Sunset with only its border. |
| 25–27 | `en-swatch-before-5cd63ff-swatch-0-{focused,focused-row,focus-moved-back}.png` | 52×53, 624×107, 52×53 | L211, L213, L215 | `a9a8821f…`, `5267b69f…`, `a9a8821f…` | Byte-identical to #13–#15: **pre-existing**. |
| 28 | `en-swatch-before-5cd63ff-swatch-1-focused.png` | 52×53 | L225 | `f6edfd04b91e2d205adf4853de0764ef9a61360c98cf167ec7d2b1014b570a32` | Ocean with the focus ring. Visually equal to #16; 148 scattered anti-aliasing pixels differ between the two documents (§14). |
| 29 | `en-swatch-before-5cd63ff-swatch-1-focused-row.png` | 624×107 | L227 | `e2ba8864182a847288c0a7c9c9ed657ed536ce2c9289c03b7654bdf2af7bec77` | As #17 at 5cd63ff. |
| 30 | `en-swatch-before-5cd63ff-swatch-1-focus-moved-back.png` | 52×53 | L229 | `fb6da820…` | As #18. |
| 31, 32 | `en-pixel-tab-clean-swatch-0-{focused,moved-on}.png` | 52×53 | L266, L268 | `a9a8821f…`, `ef6a59e46df9e6a31be735709e479f5241d78d1cfda2a60e74e785a732e3e1ba` | Walk clips. Sage unchanged; the only difference is Ocean's ring appearing at the right edge (the excluded area). |
| 33, 34 | `en-pixel-tab-drafts-swatch-0-{focused,moved-on}.png` | 52×53 | L332, L334 | `6099e1547038ca2ba466c4dcefea9e4b723b87251c90657cdf331ecc22b48f67`, `8f8fe928076e132c9c6c202cf287f1c847fddbc8e9cc4299d32a10f4fabb0cef` | The same in the drafts state. |
| 35, 36 | `en-pixel-tab-source-swatch-0-{focused,moved-on}.png` | 52×53 | L364, L366 | `a9a8821f…`, `ef6a59e4…` | The same in the source-only state. |
| 37 | `zh-5bbf473-hue-slider-focused.png` | 180×28 | L42 | `b35454b779e480c30730c228ce49e7679dfa29a952d3a468f26bdcab4006353c` | Ringed hue track. **Focus visible.** Equal to batch 46. |
| 38 | `zh-5bbf473-hue-slider-unfocused.png` | 180×28 | L47 | `776ef536bffb8a828f3ad55f2eb561dd596fce776c7052b1ac66d06f28287346` | No ring. |
| 39 | `zh-5bbf473-hue-slider-focused-row.png` | 305×161 | L44 | `6690683af2d92de29123245f565079fd8f43cbbf3dda0a30e805a86f3e0c03a4` | "主题色 / 影响主操作色、链接、选中态" at 375; swatches, ringed track, "165°". CJK renders. |
| 40 | `zh-5bbf473-font-slider-focused.png` | 222×24 | L54 | `ab7f6fb4c4b41dcf043d0f969e1e79e0af286a4b065869419d17112d722ff20c` | Track and thumb **inside an accent ring**. **F-APP-1 repaired.** |
| 41 | `zh-5bbf473-font-slider-unfocused.png` | 222×24 | L59 | `31dd04a84afa2e94c660c87d485e77bf253de131ce20d7c98af17cfbac04c12d` | The plain track (Terra's moved-on hash). |
| 42 | `zh-5bbf473-font-slider-focused-row.png` | 305×125 | L56 | `c3f91273f703bf51d393f8c7e596a346cbde8d364769bfdcb904c0a97f03b531` | "字体大小 / 全局缩放": A, the ringed track, A, "100%". |
| 43–45 | `zh-before-5cd63ff-hue-slider-{focused,unfocused,focused-row}.png` | 180×28, 180×28, 305×161 | L83, L88, L85 | `b35454b7…`, `776ef536…`, `75f2a492660f7836b88069a754e4b7b7d7f2f6b56bbbe5f4e92e7734c93ab7c8` | As #37–#39 at 5cd63ff. |
| 46, 47 | `zh-before-5cd63ff-font-slider-{focused,unfocused}.png` | 222×24 | L95, L100 | `a1343047a35424ad288a7bf8de2c1f86eecce569a19b7e6455f281744d460771` (both) | Identical, no ring: the frozen F-APP-1 state. |
| 48 | `zh-before-5cd63ff-font-slider-focused-row.png` | 305×125 | L97 | `e78cdb9da51008263102403653bca1fb1c80b3c9e434681808c0cee6bf43d0ff` | No indicator (equal to batch 46's #18). |
| 49 | `zh-swatch-5bbf473-swatch-0-focused.png` | 52×53 | L129 | `300ff1da729435bafb9bf6a37b5a7a598ed156dc47d4ba5450641eb44846d7e9` | Selected Sage with its dark ring; **no focus cue.** |
| 50 | `zh-swatch-5bbf473-swatch-0-focused-row.png` | 305×161 | L131 | `6c05c8bdd5a27f73526c255ac0b15cb6e98e4bf0d393c04e832b22ac4e6bc31e` | 主题色 row at 375: the focused selected Sage looks unfocused. **Failure reproduced.** |
| 51 | `zh-swatch-5bbf473-swatch-0-focus-moved-back.png` | 52×53 | L133 | `300ff1da…` | Identical to #49. |
| 52 | `zh-swatch-5bbf473-swatch-1-focused.png` | 52×53 | L143 | `1f97781bd0237bff1e7dcb18925e677fd8d8704564dac49fda5b4e7fb7ff764d` | Ocean with the focus ring. **Visible.** |
| 53 | `zh-swatch-5bbf473-swatch-1-focused-row.png` | 305×161 | L145 | `330454fb37213040244a7982417341960c4a00c4be7d3d237c43931724e75b92` | Sage selected, Ocean focused. |
| 54 | `zh-swatch-5bbf473-swatch-1-focus-moved-back.png` | 52×53 | L147 | `4749df264cf1de8ce3fbbc42f4c01b33efd42ca33c85dc9f5949ae267700769d` | Ocean with its border only. |
| 55 | `zh-swatch-5bbf473-accent-230-swatch-1-focused.png` | 52×53 | L175 | `5bdf828dc1817c83eb6235b3f71b68788a113dea83a7e2391048386c4d49df85` | Ocean selected, dark ring; **no focus cue.** |
| 56 | `zh-swatch-5bbf473-accent-230-swatch-1-focused-row.png` | 305×161 | L177 | `e1c0a96621ba3d07f8b30400f735c7922d7221761f5f3cf451e66964989ef955` | Row at "230°": indistinguishable from unfocused. **Failure reproduced.** |
| 57 | `zh-swatch-5bbf473-accent-230-swatch-1-focus-moved-back.png` | 52×53 | L179 | `5bdf828d…` | Identical to #55. |
| 58 | `zh-swatch-5bbf473-accent-230-swatch-2-focused.png` | 52×53 | L189 | `7c480559625987c63b7d2f6e43d4a1f511bd2cde7ec2c33fc86724747bddbb94` | Sunset with a blue-tinted focus ring. **Visible.** |
| 59 | `zh-swatch-5bbf473-accent-230-swatch-2-focused-row.png` | 305×161 | L191 | `fe22e316af0f30976e46c07b8b508c6c1b1dbc721c3000260f94e459709c8667` | Ocean selected, Sunset focused. |
| 60 | `zh-swatch-5bbf473-accent-230-swatch-2-focus-moved-back.png` | 52×53 | L193 | `ad4a6ccb65ca8fdccd1d5378e86c70faa18d034414012669122ae80caf632c02` | Sunset with its border only. |
| 61–63 | `zh-swatch-before-5cd63ff-swatch-0-{focused,focused-row,focus-moved-back}.png` | 52×53, 305×161, 52×53 | L221, L223, L225 | `300ff1da…`, `6c05c8bd…`, `300ff1da…` | Byte-identical to #49–#51: **pre-existing**. |
| 64–66 | `zh-swatch-before-5cd63ff-swatch-1-{focused,focused-row,focus-moved-back}.png` | 52×53, 305×161, 52×53 | L235, L237, L239 | `1f97781b…`, `330454fb…`, `f6a04667b8a4f5ba55478b86ac8ba25961e68c8e546b44b528b5fc0b1f544395` | As #52–#54 at 5cd63ff. |
| 67, 68 | `zh-pixel-tab-clean-swatch-0-{focused,moved-on}.png` | 52×53 | L279, L281 | `300ff1da…`, `f545af0ab4a437f5750ec5847f461aeecf522492c38a58583994977c85bfb565` | Walk clips: Sage unchanged; Ocean's ring appears at the right edge only. |
| 69, 70 | `zh-pixel-tab-drafts-swatch-0-{focused,moved-on}.png` | 52×53 | L349, L351 | `a9a8821f…`, `a0e65e897e4cc196abcbcb12b11e7e07a48e3e1f633c544bcb7286f2873dc6a6` | The same. |
| 71, 72 | `zh-pixel-tab-source-swatch-0-{focused,moved-on}.png` | 52×53 | L384, L386 | `2f5fae71df11c7412f2e2377d8b4ef8ffdc54d3125d52083b67f95144dd52700`, `f4f3a978e7ae76e89f6b77c2d3bc6beeff04db761def426d3b8954779ba6452b` | The same. |

**Overall.**
- No image shows overlap, clipping or broken rendering, and all CJK glyphs render.
- The images confirm both conclusions:
  - the Font scale slider now shows the global ring;
  - the selected accent swatch never shows a focus indicator distinct from its selection ring.

## 13. Items for the controller

1. **The FAIL (§3).** The selected accent swatch has no visible focus in E15 (gate 8, contract §9 "Keyboard").
   - It is pre-existing and of the same class as F-APP-1: a selection-state outline rule of higher specificity, (0,2,0), overrides the global (0,1,1) focus ring.
   - It appears in the protected `layout.css` and in the 5cd63ff part of the Appearance stylesheet.
   - Ownership, ID and design of a fix are the controller's. Any indicator must differ from the selection ring.
2. **The F-APP-1 repair is effective (§4).** For the repair itself no further native work is needed. The rerun after the next fix still needs E14–E15 in full.
3. **Runner changes (§9) need review before reuse:**
   - **The `captureClip` fix.** CDP clips are page coordinates. Batch 46's images were taken with the window unscrolled, and their hashes reproduce here.
   - **The own-region pixel oracle.** It is stricter than a whole-clip comparison (§3.4) but still the F-APP-1 ruling's oracle.
   - **The stable-frame rule.**
   - **`kbFocusVisibility`.** It is unchanged except for its labels. It still compares whole clips, which is safe for the two sliders because the next control is in another row.
4. **E14 for the next rerun.** The development observations (§10) show no other presentation problem and no cascade override.
   - The cascade-order audit is implemented and was validated in 51 audits per language.
   - E14 still has to be run as evidence on the next fixed SHA, or the controller may rule on reuse through a delta audit, as for E7–E13.
5. **A non-blocking observation.** At 375 px the first rail item's focus ring is mostly clipped by the rail scroller; its visible part is shared with the gap of the next item (§5.1). This is shell, not this caller.

## 14. Limitations

- **Retained contract §15 exclusions:**
  - headless Chrome with an isolated profile;
  - a synthetic auth session and account;
  - not Tauri;
  - a development build without StrictMode;
  - a dependency tree reused from the main checkout (the lockfile gate is a consistency check only);
  - no external network, so system fonts render the text.
- **E15 widths.** One width per language: EN 1024×768, ZH 375×812 with mobile emulation, as in batch 46.
- **Pixel oracle:**
  - **Rendering differences between documents.** Anti-aliasing can differ between documents (148 px between #16 and #28, visually identical). Before the stable-frame rule, it also appeared once inside one document next to a neighbour's transition. The oracle compares two stable frames of one document. Every passing stop changed at least 81 own-region pixels: EN minimum 362, ZH 81, the latter on a shell stop reviewed in a development probe.
  - **Coverage.** The walks cover each state's default selection; the selected-swatch failure was shown for two different selected swatches. Other selection states (another theme card or tone selected) were not walked, but no other state-dependent outline rule applies to pane controls (§3.3).
  - **What it judges.** It judges a change attributable to the stop; it does not judge a minimum contrast for focus indicators. That is not a contract requirement.
- **Space-scroll tolerances:** a clamp to a shorter range, and anchoring below half the scrollport (control-plane ruling 4). In ZH, four bottom-control presses needed a script move of the scroller first, at most 120 px.
- **Script actions.** These are script actions by design:
  - lock holds and releases, storage faults, and the external repair of `xai_rail_pos`;
  - the scroll positive control's `tabindex`;
  - the placing `scrollIntoView` of the pixel walk;
  - the cascade audit's temporarily adopted stylesheets (visual modes only).

  Every user-facing activation is trusted input.
- **Not an accessibility audit.** There was no screen reader, forced-colours or high-contrast check.
- **E14 not run as evidence** (§10). The development logs, cascade audits and development screenshots are not committed.
