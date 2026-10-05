# K-1: native key-injection integrity (CP-APPEARANCE-01, batch 44)

**Verdict: NO-CONCLUSION-CHANGE.** No conclusion recorded in already-committed evidence changes. This is neither `CONCLUSION-CHANGED` nor `BLOCKED`.

- **K-1 is real and reproduces on this host** (macOS 27.0.1 arm64, Chrome 154.0.8037.97, the build of E4, E5 and E17). In headless Chrome on macOS, a CDP `keyDown` that carries `nativeVirtualKeyCode` starts an endless stream of trusted keydowns when the page does not consume the key. The stream runs at roughly 1,000–3,500 per second.
  - With a Windows code, the replays are `key: "Unidentified"`; their `code` is the macOS key at that number (27 → `Minus`, 39 → `Quote`).
  - With a text key, the replay is the character itself.
- **Which runner keys started streams:**
  - Escape (27/27) in the before and F1 runners did, in every focus context unless the page called `preventDefault`.
  - ArrowRight (39/39) did not in the one place it is used: the focused range slider consumes it.
  - Tab (9/9) never did.
  - The Date & Time typeahead (`nativeVirtualKeyCode` 1 or 36) never did in its only context, a focused `<select>`.
  - The Date & Time focus keys carry no `nativeVirtualKeyCode` and never did.
- **Classification:**

| Evidence | Modes | Classification |
| --- | --- | --- |
| E4 (Appearance native before, `5cd63ff`) | h3, h5, h10, h15 | `affected-conclusion-unchanged` |
| E4 | h6, h14 (send no key), h17 (Tab only) | `unaffected` |
| E5 (Appearance F1 before, `5cd63ff`) | selfcheck, appearance | `affected-conclusion-unchanged` |
| E17 (Appearance F1 fixed, `24073b5`) | selfcheck, appearance | `affected-conclusion-unchanged` |
| Date & Time (accepted caller, fixed `d9d9fdd`; all committed native logs) | all 22 modes | `unaffected` |

- **Proof for every affected mode:**
  - **In-context reproduction.** Each affected mode was rerun at its original product SHA with the frozen dispatch plus a passive key audit. This counted the stray keydowns per document in the real App.
  - **Corrected rerun.** Each was also rerun with `nativeVirtualKeyCode` dropped, under a key-audit precondition.
  - **Comparison.** The comparison is check by check. Every precondition sequence, verdict, fact, product check and case outcome is identical to the committed log in all 18 comparisons. So are the result records.
- **One descriptive measurement changes, not a conclusion.** E4 H15's "Saved" flash was recorded as 110 of 133 frames spanning 1817 ms (`../web-appearance-recovery-native/before-5cd63ff.md` L254; the control-plane E4 row says "闪现 1817ms"). It was measured after about 1,470 (EN) and 1,490 (ZH) stray keydowns had hit the document. Without the stream it is 108 of 133 frames, 1783 ms, exactly H17's clean value. H15-d ("Saved" for about 1.8 s in every case) holds either way.

**Status.** This is verification only.
- It is not acceptance, and it authorizes nothing.
- It changes no product source, product test, contract, ledger, control plane, frozen runner or existing log; every output is a new file in this directory.
- It closes no 312 item.

## Identity

| Item | Value |
| --- | --- |
| Executor | An independent Claude Opus 5.5 instance in the Sol role, in its own isolated worktree. It wrote none of the runners, logs, contracts or product code under review |
| Worktree | `.claude/worktrees/agent-a13b90df274b77f4b`. Detached at docs base `bc1f5f41cebb5c4c9834d8c41659f58e665d2bc6` after `git fetch origin codex/web/full-product-audit-20260908`, and clean before work |
| Product revisions rerun | Requested `5cd63ff`, resolved `5cd63ff652f02a2c726187fe12cbc796218d31c0` (E4, E5). Requested `24073b5`, resolved `24073b522262d8b4bec0abfa29347db28adbdd9e` (E17). Date & Time (`d9d9fdd`, accepted) was not rerun (§5) |
| Docs heads used for the reruns | `963036b77e5a08d62f72fe24783019c5f3760257` for the `5cd63ff` runs, which is exactly the docs head of the original E4 and E5 runs. The frozen precondition `baseline:docs-head-product-tree-equals-revision` needs a HEAD whose product tree is `5cd63ff`, so this worktree was detached to `963036b` for those runs and returned to `bc1f5f4`. `bc1f5f4` was used for the `24073b5` runs: its product tree equals `24073b5`, and the original E17 used `662de52`. The product delta is empty in every K-1 run log |
| Browser | `Chrome/154.0.8037.97` (HeadlessChrome, `--headless=new`), the build recorded by every E4, E5 and E17 log. The installed binary is the only Chrome on the host (`plutil` Info.plist 154.0.8037.97) |
| Host and toolchain | macOS 27.0.1 (26A434), arm64; Node `v24.16.0`; esbuild 0.28.1 from the gated tree |
| Lockfile gate | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`, equal in four places in every K-1 run: `XAI_DEPS_ROOT`, the revision, the extracted archive, and the gate constant. `d9d9fdd` and `f359be6` carry the same lockfile |
| Provenance (every K-1 run log, L1) | `5cd63ff`: 1013 bundle inputs, 621 from the archive. `24073b5`: 1017 inputs, 625 from the archive. Both have 0 foreign inputs, 0 guard violations and 320 `@repo` specifiers pinned to the archive, the same as the original batches |
| Transport | CDP over the DevTools WebSocket, as in the three frozen runners (pipe transport is used only by `verify-native-fixed.mjs`) |
| Dependency root | The main checkout, read only. An mtime scan against a marker taken before the first rerun looked at 3,623 entries: top level; `node_modules` and `apps/web/node_modules` to depth 2; `apps` and `docs` to depth 2; `packages` to depth 3; `.claude/` excluded. The only newer entry is the shared `.git` directory. Its own metadata entry, `.git/worktrees/agent-a13b90df274b77f4b`, changed through this worktree's two `git checkout --detach`. No tracked file, `node_modules`, `apps`, `packages` or `docs` entry changed. No dev server, install or build touched it |
| Diagnostic iterations | Each of the 18 rerun units ran once (iteration 1 of 3, suffix `k1repro1` or `k1corr1`). Development probes are disclosed in §8 |

## 1. Inventory of the keys each runner sends

| Runner (SHA-256) | Key | Events and pairing | `key` / `code` | `windowsVirtualKeyCode` | `nativeVirtualKeyCode` (macOS meaning) | `text` | Call sites |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `../web-appearance-recovery-native/verify-native-before.mjs` (`6c925da3…`; the hash in L1 of all seven `native-5cd63ff-before1-*.log`) | Tab | `press()` L514–519 with `KEYS` L509–513: one `rawKeyDown` then one `keyUp`, both carrying the same four fields; no modifiers; 60 ms delay | `Tab` / `Tab` | 9 | **9** (`kVK_ANSI_V`) | none | L932 (h10, document B: font row label → font slider); L1258 (h17 walk, 27 presses per language) |
| | Escape | same | `Escape` / `Escape` | 27 | **27** (`kVK_ANSI_Minus`) | none | Only through `closeTopbar` L534–537 (L535, sent only while the Topbar popover is open): h3 L721 (6 cases); h5 L758 and L784 (inspect), 2 per language; h10 L945 (document B), 1 per language; h15 L1156 and L1197 (inspect), 2 per language |
| | ArrowRight | same | `ArrowRight` / `ArrowRight` | 39 | **39** (`kVK_ANSI_Quote`) | none | L934, L936 (h10, document B: font slider 1 → 1.05 → 1.1) |
| | — | — | — | — | — | — | h6 (L799–905) and h14 (L994–1126) send no key |
| `../web-appearance-recovery-f1/verify-f1-appearance.mjs` (`f570b5c9…`; the hash in the baseline of the E5 `before1` and E17 `fixed1` logs) | Escape (the only key) | `pressEscape()` L313–317: one `rawKeyDown` then one `keyUp`, both carrying the four fields; 80 ms delay | `Escape` / `Escape` | 27 | **27** (`kVK_ANSI_Minus`) | none | L523 in `failTopbarTheme` (closes the Topbar popover after the denied Dark choice), used by a1 L796, a3 L884 and a4 L927; selfcheck L646 (Topbar popover on the surface check) and L661 (AvatarMenu still open after the sign-out dialog's Cancel) |
| `../web-date-time-recovery-native/verify-native.mjs` (HEAD `6b0694b` version; the key code is byte-identical in every committed version `ff865fb`, `8407ab8`, `340953c`, `d45f415`, `60694fa`, `315b47d`, `6b0694b`) | typeahead `s` | `change(0)` L41: one `keyDown` **with text** (so keydown and keypress), then one `keyUp` **without** `nativeVirtualKeyCode` or text. Sent right after `.dt-pane select` is focused by script. A capture trace of keydown, keyup, input and change is installed on document before the press and read 200 ms after it | `s` / `KeyS` | 83 | **1** (`kVK_ANSI_S`, the correct macOS code), keyDown only | `s` | controls L94, clean L97, export-all L80, visual L86, latest-pending-retry L68 (2), predecessor-failure L66 (2), source-reload L62 |
| | typeahead `周` (visual-zh only) | same | `周` / `""` | 0 | **36** (`kVK_Return`), keyDown only | `周` | visual-zh L86 |
| | Shift+Tab, Tab, Escape (focus mode) | `rawKeyDown` + `keyUp` each; Shift+Tab with `modifiers: 8` | `Tab`/`Tab`, `Escape`/`Escape` | 9, 27 | **none** | none | L84 |
| | — | — | — | — | — | — | All other modes send no key. The six `73b4eb9` input-setup diagnostics (review.md: "excluded from product verdict") came from uncommitted predecessors whose key code is not in the repository |

In none of the three runners is an Enter or Space sent, a key held, or a key repeated. Every activation, including F1 "Stay", is a trusted mouse click.

**Scope check.** `git grep nativeVirtualKeyCode` at `bc1f5f4` finds it sent only by these three runners; `verify-native-fixed.mjs` and its logs mention it only to say it is not sent. Fourteen other committed runner scripts under `docs/` reference CDP key input (`Input.dispatchKeyEvent` or `Input.insertText`), `verify-native-fixed.mjs` among them. None sends the field, and none uses Puppeteer or Playwright.

## 2. Reproduction on a probe page

**Method** (`probe-keys.mjs`, `probe-page.html`; logs `probe-{runner,reference,mechanism,followup}-r2.log`):
- **Page.** A product-free page with a document-level capture recorder for keydown, keypress, keyup, beforeinput, input, change, click, cancel, close and focusin. The recorder keeps `isTrusted`, key, code, keyCode, receipt time and target.
- **Browser.** A fresh headless Chrome process and profile for each of the 171 trials, with each runner's exact launch flags, the WebSocket transport, `Emulation.setFocusEmulationEnabled` and `Page.bringToFront`.
- **Trial.** A trusted click on a neutral pad, then a focus context, then one dispatch through a verbatim copy of the runner's function (source lines cited in the script). The recorder is read at 250, 1000 and 2500 ms, and at 7500 ms when a stream exists.
- **"Stray"** means every keyboard event beyond the runner's own: one keydown and one keyup per press, plus one keypress for a text key, each carrying the dispatched key value.
- **The 11 contexts:**
  - `body`, `button`, `text`, `range`, `select` (English options), `selectzh` (Chinese options);
  - `popover`: Topbar-shaped. A document keydown handler removes the popover on Escape without `preventDefault`, so focus falls to `<body>`, as `Topbar.tsx:79` does at `5cd63ff` and `:59` at `24073b5`;
  - `popover-prevent`: the same, with `preventDefault`;
  - `dialog`: a native modal `<dialog>` with a focused button;
  - `deptrap`: the `departureCoordinator.tsx:260–285` shape (Escape: `preventDefault` and close; Tab: wrap at the edges with `preventDefault`);
  - `tablast`: the last focusable element.

**Per key (runner forms and reference; `probe-runner-r2.log`, `probe-reference-r2.log`):**

| Form (source) | Key and fields | Streams | Clean (no stray event) | Stray events | Onset after dispatch | Rate in 1.0–2.5 s | Stray by 7.5 s |
| --- | --- | --- | --- | --- | --- | --- | --- |
| before `press()` L514–519 | Tab, wvk 9, nvk 9 | **0 of 11** | all 11 | — | — | — | — |
| before `press()` | Escape, wvk 27, nvk 27 | **9 of 11** | `popover-prevent`, `deptrap` | trusted keydown `Unidentified` / `Minus` / keyCode 189, timeStamp 0 | 2.0–5.3 ms | 2,186–3,314/s | 14,647–20,165 |
| before `press()` | ArrowRight, wvk 39, nvk 39 | **9 of 11** | `text`, **`range`** | trusted keydown `Unidentified` / `Quote` / 222 | 2.1–4.2 ms | 2,601–3,335/s | 19,166–20,308 |
| F1 `pressEscape()` L313–317 | Escape, wvk 27, nvk 27 | **9 of 11** | `popover-prevent`, `deptrap` | keydown `Unidentified` / `Minus` / 189 | 2.0–5.1 ms | 2,247–3,279/s | 14,705–20,040 |
| D&T typeahead L41 | `s`, keyDown + text, wvk 83, nvk 1; keyUp without | **8 of 11** | `text`, **`select`**, `selectzh` | replays of the character: keydown `s`/`KeyS`/83 + keypress `s` | 11.5–13.6 ms | 4,088–5,503 events/s | 32,470–34,940 events |
| D&T typeahead L41 (visual-zh) | `周`, keyDown + text, wvk 0, nvk 36; keyUp without | **8 of 11** | `text`, `select`, **`selectzh`** | replays: keydown `周`/`Enter`/13 + keypress `周` | 11.3–15.2 ms | 3,567–4,939 events/s | 32,054–34,490 events |
| D&T focus mode L84 | Shift+Tab, Tab, Escape; no nvk | **0 of 33** | all | — | — | — | — |
| Reference: `verify-native-fixed.mjs` `KEYDEFS` L675, `press()` L681–688 | Tab, Escape, ArrowRight; no nvk | **0 of 33** | all | — | — | — | — |

The stray events never had an effect. Every input, change, click, cancel or close in these trials came from the runner's own key: the one Escape closing the native dialog, the one ArrowRight stepping the slider, the one typed or typeahead character.

**Mechanism** (`probe-mechanism-r2.log`; variants, not runner forms):

| Variant | Contexts body, button, popover, select | Stray kind |
| --- | --- | --- |
| Escape, `nativeVirtualKeyCode` 27 on keyDown only | 4 of 4 stream | `Unidentified`/`Minus` |
| Escape, 27 on keyUp only | 0 of 4 | — |
| Escape, macOS-correct 53 (`kVK_Escape`) on both | 4 of 4 stream | **real `Escape` keydowns** |
| Tab, macOS-correct 48 on both | 0 of 4 | — |
| ArrowRight, macOS-correct 124 on both | 4 of 4 stream | **real `ArrowRight` keydowns** |
| `s` with text, 1 on both | 3 of 4 (not on the select) | `s` keydown + keypress |
| `s` raw (no text), 83 on both | 4 of 4, including the select | `Unidentified`/`Numpad1`/97 |

**What triggers it:**
- A keyDown that carries `nativeVirtualKeyCode` and that the page does not consume starts it. Consumed means `preventDefault`, or the focused control's own keyboard behaviour: focus navigation for Tab, a value step on a range, caret movement or insertion in a text input, typeahead in a select.
- Closing a native modal dialog with Escape does not count as consumed.
- Without the field nothing streams: 0 of 66 trials.
- The field on the keyUp alone never streams.
- The Windows codes only decide what the replays look like. With the macOS-correct code, the real key would be replayed, for example a stream of real Escape keydowns.

**Lifetime and reach** (`probe-followup-r2.log`, frozen before-runner Escape in the `popover` context):

| Variant | Result |
| --- | --- |
| `long` (30 s) | Does not stop by itself: 43,485 stray keydowns in 30 s; the rate decays from 1,757/s to 1,015/s; no input, change or click |
| `reach` | Stray keydowns go to the focused element: text input 1,811, slider 1,855, select 1,833, Chinese select 1,789, button 1,756, button in an open modal dialog 1,591 (about 1 s each). **No value change, no input, change or click, no dialog cancel or close** |
| `click` | A trusted click on a button does not stop it (2,675/s → 2,315/s) |
| `fixedkey` | One corrected Escape (no field) does not stop it (2,508/s → 2,634/s) |
| `prevent` | A page `preventDefault` on the stray keydown stops it at once (3,114/s → 0) |
| `navigate`, `reload` | **The stream ends with the document:** 0 keyboard events in the new document after `Page.navigate` or `Page.reload` |
| `newtab` | **It follows the foreground tab.** With tab B (opened before the dispatch, as h10 opens its document B) brought to front, A gets 0/s and B gets 6,085 in 2 s; with A back in front, A gets 2,135/s |
| `close` | After A is closed, B gets 6,804 in 2 s |
| `confirm-accept`, `confirm-cancel` | While a real `window.confirm` is open, 0 keyboard events reach the page; the confirm returns exactly the CDP answer (`true` / `false`); the stream resumes afterwards |

The two probe passes agree on stream presence in every one of the 169 trials they share (§8).

**Date & Time: the runs' own key traces** (`dt-traces-k1.mjs` → `dt-traces-k1.log`, all 109 committed logs):
- **32 typeahead logs (37 presses).** Each trace holds only the runner's own keydown (and its input, change and keyup). The runs used Chrome 152.0.7977.83, 153.0.8010.36 (the accepted `d9d9fdd` set) and 154.0.8037.97. Across them all there are **0 stray keydowns** in the 200 ms after the press. A stream would have put roughly 370–510 keydowns into that window: the probe's onset for this dispatch is 11–15 ms, at about 2,000–2,750 keydowns per second.
- **6 input-setup diagnostics.** Four have traces with only the predecessor's ArrowDown/Enter; two have none.
- **6 focus-mode logs** send no `nativeVirtualKeyCode`.
- **65 logs** send no key.

## 3. In-context reproduction: the frozen dispatch with a key audit

`verify-native-before-k1-repro.mjs` and `verify-f1-appearance-k1-repro.mjs` are the frozen runners with their key dispatch unchanged. The only addition is a passive window capture-phase key recorder in every new document. It is read before every navigation, reload and page close, and the per-document count is recorded as the observation `k1:keyboard-audit`, with no precondition. Same Chrome build, same product SHA, same docs head as the originals.

| Unit (log, audit line) | Runner presses | Stray keydowns per document | Where the conclusions were evaluated |
| --- | --- | --- | --- |
| E4 h3 (`native-5cd63ff-k1repro1-h3.log` L214) | 6 Escape | 220, 252, 250, 259, 254, 252: one per case, only in the document between `closeTopbar` and its reload; **0 in all six post-reload documents** | fact a and verdict b of each case before the Escape; fact c in the post-reload document |
| E4 h5 (L96) | 4 Escape | 14,031 (EN document), 21,257 (ZH document) | H5-a and H5-b during the stream |
| E4 h10 (L128) | per language, in B: 1 Tab, 2 ArrowRight, 1 Escape | Tab and ArrowRight: 0 (consumed). All 9,882 stray keydowns carry Escape's signature `Unidentified`/`Minus`/189; none carries ArrowRight's `Quote`/222 or Tab's `KeyV`. B: 259 per language after its Escape. **A (the idle document under test): 4,566 (EN) and 4,798 (ZH)** after being brought to front; 0 after A's reload | the slider preconditions (Tab focus, font scale `"1.1"`) before the Escape; H10 verdicts in A during the stream; the reload fact in a clean document |
| E4 h15 (L112) | 4 Escape | 11,341 (EN), 14,095 (ZH) | H15-a to H15-e during the stream |
| E4 h17 (L101) | 54 Tab (27 per language) | **0** (54 keydowns, 54 keyups) | — |
| E5 selfcheck (`f1-5cd63ff-selfcheck-k1repro1.log` L140) | 2 Escape | 12,390 in the surface-check document; **0 in the pc1–pc4 documents** | surface preconditions during the stream; positive controls clean |
| E5 appearance (L118) | 3 Escape | a1 2,178; a2 0 (sends no key); a3 17,455; a4 10,388 | a1, a3 and a4 product checks during the stream; a2 clean |
| E17 selfcheck (`f1-24073b5-selfcheck-k1repro1.log` L140) | 2 Escape | 8,842; pc1–pc4 0 | as E5 |
| E17 appearance (L129) | 3 Escape | a1 6,656; a2 0; a3 10,788; a4 17,481 | as E5 |

All nine reproduction runs give the committed outcomes check by check (`comparison-k1.log` comparison records at L63, L82, L87, L98, L113, L177, L182, L201 and L206), with the same verdict and the same check count.

**Footprint inside the committed evidence.** The before prelude gives every keydown it records a sequence number (`native-prelude.js:460–461`), so stray keydowns raise the sequence of every later record.
- In the committed `native-5cd63ff-before1-h15.log`, the activation attempts start at sequence 1574 (EN) and 1597 (ZH). The corrected rerun has 104 and 104 there, and the reproduction 1488 and 1520. So the committed h15 run itself received about 1,470 (EN) and 1,493 (ZH) stray keydowns before the activation.
- In the committed H17 log the same record has 148, equal to the clean reruns, so there was no stream there.
- The other committed logs carry no sequence-numbered record after their Escape. For them, presence is established by the deterministic reproduction above.

## 4. Corrected reruns and the check-by-check comparison

`verify-native-before-k1.mjs` and `verify-f1-appearance-k1.mjs` are the frozen runners with only two changes:
- `press()`/`pressEscape()` send no `nativeVirtualKeyCode`, as the reference `verify-native-fixed.mjs` does;
- the same key audit runs as a run-level precondition, `run:k1-keyboard-trace-contains-only-the-runner-key-presses`. Every document must have received exactly the runner's presses, in order, trusted, with no keypress.

Fixtures (`native-app.tsx`, `native-prelude.js`, `f1-appearance-host.tsx`) are byte-identical copies. `diff` against the frozen runners shows only those lines. `compare-k1.mjs` compares each committed log with each K-1 log:
- every precondition as an ordered sequence (the K-1 precondition excluded);
- every verdict and fact (native), or every deferred product check and case outcome (F1);
- the result record;
- all verdict, fact and observation evidence after volatile fields are dropped (timing, frame samples, sequence numbers, screenshots, router keys, ephemeral port).

| Unit | Corrected run (exit) | Key audit | Preconditions (ordered) | Verdicts / facts / product checks / outcomes | Result record | Evidence records |
| --- | --- | --- | --- | --- | --- | --- |
| E4 h3 | `native-5cd63ff-k1corr1-h3.log`, valid, exit 2 (correct before FAILs) | 6 presses = 6 keydowns over 18 documents (L214–215) | 177 = 177, identical | 18 of 18 identical (6 verdicts FAIL, 12 facts observed) | identical | 31 of 31 identical |
| E4 h5 | `…-h5.log`, exit 2 | 4 = 4 (L96–97) | 83 = 83 | 4 of 4 | identical | 9 of 9 |
| E4 h10 | `…-h10.log`, exit 2 | 8 = 8 (L128–129) | 107 = 107 | 10 of 10 (8 verdicts, 2 facts) | identical | 17 of 17 |
| E4 h15 | `…-h15.log`, exit 2 | 4 = 4 (L112–113) | 91 = 91 | 10 of 10 | identical (2 = 2 product console warnings: "quota exceeded for xai_accent_hue") | 13 of 17; the 4 others differ only in the sequence numbers inside attempt strings (+1,470 / +1,493 in the committed log) and in the flash frame count (110 committed, 108 corrected); flash span 1817 ms committed, 1783 ms corrected |
| E4 h17 | `…-h17.log`, exit 2 | 54 = 54 (L101–102) | 78 = 78 | 10 of 10 (6 verdicts, 4 facts) | identical | 18 of 18 |
| E5 selfcheck | `f1-5cd63ff-selfcheck-k1corr1.log`, PASS harness-valid, exit 0 | 2 = 2 (L140–141) | 134 = 134 | 4 of 4 positive-control outcomes | identical | 4 of 4 |
| E5 appearance | `f1-5cd63ff-appearance-k1corr1.log`, before-correct, exit 2 | 3 = 3 (L118–119) | 97 = 97 | 18 of 18 (14 deferred product checks, 6 of them the correct before failures; 4 case states `before-absent`, `before-no-indicator`, `before-no-appearance-step`, `before-unprotected`; F1 signature 0) | identical (the 1 product warning) | 5 of 5 |
| E17 selfcheck | `f1-24073b5-selfcheck-k1corr1.log`, PASS, exit 0 | 2 = 2 (L140–141) | 134 = 134 | 4 of 4 | identical | 4 of 4 |
| E17 appearance | `f1-24073b5-appearance-k1corr1.log`, fixed-pass, exit 0 | 3 = 3 (L129–130) | 103 = 103 | 23 of 23 (19 product checks, 4 cases `fixed-pass`, F1 signature 0) | identical | 5 of 5 |

`comparison-k1.log` records L2–L62 (native, corrected), L63–L123 (native, reproduction), L124–L176 (F1, corrected) and L177–L229 (F1, reproduction) hold the same data per check.

## 5. Classification of each evidence item

**Why stray events could not change these conclusions (analysis), confirmed by the corrected reruns:**
- **No product handler matches them.**
  - Every keyboard handler mounted on the routes these runners send keys on (`/app/settings/*`, `/app/calendar`, `/app/tasks`) matches a named `key`: `Topbar.tsx:79` (`5cd63ff`) / `:59` (`24073b5`) Escape; `AvatarMenu.tsx:56` Escape; `departureCoordinator.tsx:261,266` Escape/Tab; `SettingsSidebar.tsx:60` and `composedSettingsRegistration.tsx:93` Enter/Space; `CommandPalette.tsx:94` with `keyboardCombo.ts:22` Cmd/Ctrl+K; `host/capabilities.ts:120` registered shortcut keys.
  - Only two product handlers anywhere compare `code`: Pomodoro (`PomodoroModule.tsx:457`) and Time Tracker (`TimeTrackerModule.tsx:1953`). Both match only `Space` and are mounted only on their own module routes (`pomodoroRegistration.tsx:20–31`; `plugin-web-time-tracker/src/registration.tsx:10–21`), which no runner visits.
  - No product handler compares `keyCode` or `which`.
  - A keydown with `key: "Unidentified"` and code `Minus` or `Quote` therefore matches none of them.
- **No default action fires.** The probe's `reach` trial shows none on a text input, slider, select, button or modal-dialog button.
- **User activation adds nothing.** Stray keydowns do grant transient user activation, but every affected flow had already received trusted clicks, so sticky activation was present anyway.
- **JavaScript dialogs are not touched.** While a `window.confirm` is open, no key event reaches the page.

| Evidence item | Classification | Reasoning and references |
| --- | --- | --- |
| **E4 h3** (`native-5cd63ff-before1-h3.log`) | `affected-conclusion-unchanged` | Each case's Escape (L721) streamed 220–259 stray keydowns into the App document until its reload. Facts a and verdicts b were evaluated before the Escape, and facts c after the reload in a document with 0 stray events. Fact c depends on bytes carried across the reload, which the stream could only have changed through a write; none occurred. Corrected rerun identical (§4) |
| **E4 h5** | `affected-conclusion-unchanged` | H5-a (pane not reflecting the Topbar change) and H5-b ("Save & apply" reverts it) were evaluated during a stream of about 14,000 (EN) and 21,000 (ZH) stray keydowns. The trusted click on "Save & apply" and the bytes are identical without the stream (§4) |
| **E4 h6** | `unaffected` | Sends no key (L799–905); no `nativeVirtualKeyCode` is ever dispatched. Not rerun |
| **E4 h10** | `affected-conclusion-unchanged` | Tab (L932) and ArrowRight (L934, L936) were consumed: focus moved, and the slider stepped to `"1.1"` with 0 stray events. In context, every stray keydown carries Escape's signature, and none carries ArrowRight's `Quote` or Tab's `KeyV`. The Escape in B (L945) streamed, and the stream followed the foreground tab into the idle document A (about 4,600 per language) while the four H10 verdicts were evaluated there. The reload fact was evaluated after A's reload with 0 stray events. Corrected rerun identical, including A's observed state (§4) |
| **E4 h14** | `unaffected` | Sends no key (L994–1126). Not rerun |
| **E4 h15** | `affected-conclusion-unchanged` | H15-a to H15-e were evaluated during the stream. The committed log carries the stream's sequence footprint (§3). All verdicts and attempt lists are identical without the stream. **Descriptive value affected:** the "Saved" flash of 110/133 frames over 1817 ms (`before-5cd63ff.md` L254; control-plane E4 row) becomes 108/133 frames over 1783 ms without the stream (EN and ZH), the same as H17 (`before-5cd63ff.md` L261). The claim "Saved for about 1.8 s in every case" and H15-d FAIL are unchanged |
| **E4 h17** | `unaffected` | Tab with `nativeVirtualKeyCode` 9 is consumed by focus navigation: 0 stray events in every probe context and in context (54 keydowns for 54 presses). The committed sequence (148) equals the clean value. "27 trusted Tab presses to Save & apply", the `:focus-visible` observation and H17-a to H17-c stand as recorded |
| **E5 selfcheck** (`f1-5cd63ff-selfcheck-before1.log`) | `affected-conclusion-unchanged` | The two Escapes (L646, L661) streamed during the surface checks (popover closes on Escape, clean state, avatar menu, sign-out dialog Cancel, zero writes). The stream ended at pc1's navigation, so pc1–pc4 ran with 0 stray events. `harness-valid`; identical without the stream |
| **E5 appearance** (`f1-5cd63ff-appearance-before1.log`) | `affected-conclusion-unchanged` | a1, a3 and a4 ran after `failTopbarTheme`'s Escape (L523) during the stream; a2 sends no key and ran in a fresh document. The four before states, the 6 correct product failures, F1 signature 0 and the confirm answers (a3 OK, a4 Cancel) are identical without the stream (§4) |
| **E17 selfcheck** (`f1-24073b5-selfcheck-fixed1.log`) | `affected-conclusion-unchanged` | As E5 selfcheck; identical without the stream |
| **E17 appearance** (`f1-24073b5-appearance-fixed1.log`) | `affected-conclusion-unchanged` | As E5 appearance; `fixed-pass` with all 19 product checks, one `navigate` replay release in a1 (ruling 4), a3 Stay `false`, a4 Cancel `false`, and F1 signature 0, identical without the stream (§4) |
| **Date & Time, typeahead modes**: controls, clean, export-all, visual, visual-zh, latest-pending-retry, predecessor-failure, source-reload (all SHAs, including the accepted `native-d9d9fdd-queue-fixed-*` and the visual evidence `native-18f4e82-visual-fix-*`) | `unaffected` | The typeahead carries `nativeVirtualKeyCode` (1 or 36), but it is always sent to a focused `<select>`, which consumes it. Every one of the 37 traced presses shows only the runner's own keydown in its 200 ms trace (Chrome 152, 153 and 154). The probe confirms the exact dispatch on a focused English or Chinese select gives 0 stray events. Its later steps are mouse clicks and reads |
| **Date & Time, focus mode** (`e9213fb`, `18f4e82`, `96c4915`, `611062e`, `d9d9fdd`, `f359be6`) | `unaffected` | Shift+Tab, Tab and Escape carry no `nativeVirtualKeyCode` (L84): 0 of 33 such probe trials streamed |
| **Date & Time, all other modes**: route, rail, signout, unload, pending, uncertainty, uncertainty-conflict, uncertainty-read-retry, crossdoc-conflict, export-sparse, owner, source, toggle-states | `unaffected` | No key is sent |
| **Date & Time, six `73b4eb9` input-setup diagnostics** | `unaffected` (no conclusion) | Excluded from the product verdict by review.md; produced by uncommitted predecessors. The four recorded traces show only that predecessor's own ArrowDown/Enter |

No item is `conclusion-changed`. The stop condition was not met, and the evidence of every item is left as committed.

## 6. Files and SHA-256

All files are new, under `docs/reviews/web-native-keyinput-k1/`; this receipt cannot carry its own hash. Each K-1 run log's L1 `fileSha256` records its runner copy, fixture and prelude, matching this table. The `verify-native-before.mjs` and `verify-f1-appearance.mjs` keys there name the copy that ran.

| File | Lines / bytes | SHA-256 |
| --- | --- | --- |
| `compare-k1.mjs` | 130 lines | `a6fac8f15a7172e2774499cf7e57d936299a0066394bc4b2f63306b748725a51` |
| `dt-traces-k1.mjs` | 58 lines | `05d8e73f263e95255925e625cb2495af844e39e59574381d48e5045675c36202` |
| `f1-appearance-host.tsx` | 393 lines | `19b4601f971c8892e674651244541f7e9635027dc5fe2cb56187a9a71a3dadef` |
| `native-app.tsx` | 156 lines | `d980511d1266c3750c8456b949fc362cd37aee276e0b5d7894b52cfc34744b59` |
| `native-prelude.js` | 530 lines | `6eae5f7f7479de5822a5bb322205cde77931b939c7ed7bf7d8b5fc005fbe8dcf` |
| `probe-keys.mjs` | 491 lines | `b97906198c1a57e816d97d31f9aa35e8022f8c5c162517a1ce31d9011a03f999` |
| `probe-page.html` | 188 lines | `b4913f5e3ee7dba9d047ec07860b306f8e29eb9bdf65cd3c097f27e07c179559` |
| `verify-f1-appearance-k1-repro.mjs` | 1051 lines | `2f58c2c14ca379acbd25afe67ac82aa570b95ba7e52592ea0fbe656ee9eda242` |
| `verify-f1-appearance-k1.mjs` | 1055 lines | `e9fbc5905fbace2c5716190baf7e93fd2295bb890b663cb7fd7c90ca2115896d` |
| `verify-native-before-k1-repro.mjs` | 1450 lines | `095a3aec62dc0ed52ff168cbbb7215eba27c11acccb4b77ff7ddc07e3f9a7651` |
| `verify-native-before-k1.mjs` | 1454 lines | `d2ec37387a8ad62619886ebed232ecf4b11d7c5d6d238272b39b6a088ad1cbd1` |
| `probe-followup-r2.log` | 13 lines | `6bb03aec67ab4ec58e72ee5d2fa512f4c58d71c869df01a7e6ac7e6fc74be662` |
| `probe-mechanism-r2.log` | 30 lines | `b85e508fecc011ba1f4fc3f1189961c59f92bef1abfd353e4ba9ae0bec3e23e5` |
| `probe-reference-r2.log` | 35 lines | `e752e2d6701a5e9f8084acd7a971af25165f0b473723d18490d0a252eda8ae3f` |
| `probe-runner-r2.log` | 101 lines | `bf75cfe73ea864c5012f5dd4d99834c5d42e8accc695f0aebbd2b8207b6280cb` |
| `comparison-k1.log` | 229 lines | `f1c724d115d1bbe616e855d43fb8b7a7da42329c7f4b76abad68345e06e4ddd7` |
| `dt-traces-k1.log` | 110 lines | `2e61d2745fc3d75c085f44081496b9f4121c2735303b487885b860dfa11a0abc` |
| `f1-24073b5-appearance-k1repro1.log` | 130 lines | `98c70f485e9729483fc7b89e1baac7022c88e9f20283ade7f43183ad763c67ac` |
| `f1-24073b5-selfcheck-k1repro1.log` | 141 lines | `dc35a8bea00c026d53fba80a4f91fc1705b325ec5545bc3f958f32aaf2279812` |
| `f1-5cd63ff-appearance-k1repro1.log` | 119 lines | `463987d70d6b4151040213d934d342c195198635533a0af349a9fc6c2c914bf3` |
| `f1-5cd63ff-selfcheck-k1repro1.log` | 141 lines | `c3580f54cc559bfa2c3269209e04476b5dc677bb73b9268b7135a621613243d7` |
| `native-5cd63ff-k1repro1-h10.log` | 132 lines | `1c2fdce3093482597dc42535d5e63fb925f116d289a5a7ff99a9a233f2663c70` |
| `native-5cd63ff-k1repro1-h15.log` | 116 lines | `3f164a881b2469c8cf35d2069f2eeffdfa71d60f7e076f493d4a85035697e469` |
| `native-5cd63ff-k1repro1-h17.log` | 105 lines | `1b7c7cfd53cce694240d4ba7361ef0d14b4cccfb46b5fdd78ac53b08674aeaf0` |
| `native-5cd63ff-k1repro1-h3.log` | 218 lines | `8f1ae478b10da866dac6255506e18b3a96a65d97a441af1e54068262ded53bae` |
| `native-5cd63ff-k1repro1-h5.log` | 100 lines | `e70cddb49838b1379d42969cf8943ca892a6b0bd0a542aa1ca791d2632b3349c` |
| `f1-24073b5-appearance-k1corr1.log` | 131 lines | `7244ec851aa3ad309aacb00fb707b32d620153882b1416d92e041c8eabbf58dd` |
| `f1-24073b5-selfcheck-k1corr1.log` | 142 lines | `e7056176972d53fd185aa0bc46f7552cc07640746aafe60cb2d91f1d981aa9e2` |
| `f1-5cd63ff-appearance-k1corr1.log` | 120 lines | `47d3576b6a204684b8dd7921bdfff9d3f5bd14de8f0e342a4d2d101fc30334cf` |
| `f1-5cd63ff-selfcheck-k1corr1.log` | 142 lines | `3ee3e2a5de8427e520b1da586e5626f5b29c4bcee3d9a0523d0653a8dfaca99a` |
| `native-5cd63ff-k1corr1-h10.log` | 133 lines | `fc1ef884a8b0bd2595a26ae8eab04eee9f7d7a0fc5171fb61215bb96e79de2aa` |
| `native-5cd63ff-k1corr1-h15.log` | 117 lines | `7828f22abed8e395cbab442a56f5110c622330734f22aec10b7eb1e915d675d1` |
| `native-5cd63ff-k1corr1-h17.log` | 106 lines | `4bb062a1754c5c2baf6730287d0c82d679ec8fc8d8c60f50e14aeb8501053f12` |
| `native-5cd63ff-k1corr1-h3.log` | 219 lines | `e7433a552b985428e47250d08a07a21e899203adc8f237b06dba6e717232e763` |
| `native-5cd63ff-k1corr1-h5.log` | 101 lines | `ede37c1d5e6a3d9ea42dd0d05d9fb03a7abfbe931edd13b2d26cff0d9f646c36` |
| `native-5cd63ff-k1corr1-h10-en-A-after-B-commits.png` | 123058 B | `cfef9525e82484668b3fa56026a997553a2d8b12cc385d697caf28892357d721` |
| `native-5cd63ff-k1corr1-h10-en-A-after-reload.png` | 108269 B | `c330980eeb3cd57f695399c951ec1265b215d1e99d584adf8a89163b43837add` |
| `native-5cd63ff-k1corr1-h10-zh-A-after-B-commits.png` | 113681 B | `d450b6c8bbce1f0fcd14838b6015b22be082c4700de7e7f24a5e292dea42d382` |
| `native-5cd63ff-k1corr1-h10-zh-A-after-reload.png` | 114395 B | `f1da81a0b2898838544b1921194139458d5be4b2f5b83ad6af66b58dfeef0f57` |
| `native-5cd63ff-k1corr1-h15-en-before-activation.png` | 114023 B | `27269c8c89fe41f198e972128e9643babdf5be11d081c799f7745e719d7582cd` |
| `native-5cd63ff-k1corr1-h15-en-saved-flash.png` | 106324 B | `069164da7696fcd716b1f373e0d2063b52e1a270f8e8d0e5b9626db13762646a` |
| `native-5cd63ff-k1corr1-h15-zh-before-activation.png` | 104914 B | `c91361d0f05c9dc4b7240ca2b9c11a7f7d10b5dceef54abf1490aa85484d28d5` |
| `native-5cd63ff-k1corr1-h15-zh-saved-flash.png` | 99358 B | `fa5857af450430be189e8f9961b6152b46dfd84508428a76026139647593f36e` |
| `native-5cd63ff-k1corr1-h17-en-saved-flash.png` | 107771 B | `cc100f3d4f84c1445147f15434211f1cf132b492d3dbe7c29dd09ac5f614336c` |
| `native-5cd63ff-k1corr1-h17-en-stored-before-activation.png` | 107102 B | `4808df0298221da3f7eeb5e0c77c79cff98d5b757b81852268b095b047362eb0` |
| `native-5cd63ff-k1corr1-h17-en-tab-focused.png` | 108288 B | `d82d2c13472fc82e893c0dcf6f02689a90ffc8813357b72414b297932d60b668` |
| `native-5cd63ff-k1corr1-h17-zh-saved-flash.png` | 100848 B | `349a98bde02d264ca40201716872a664e8ba4c79fbffe6a09474baa92086fe8b` |
| `native-5cd63ff-k1corr1-h17-zh-tab-focused.png` | 101385 B | `deb5b34e0ff7bf1d1b448577ff947a0f0822ecc845bbf196fa46aacc1a2bb5d9` |
| `native-5cd63ff-k1corr1-h3-en-density-applied.png` | 204421 B | `f5d4f8c3cc443e26d406d0868c85c81af595777668c488117d0fb9dbd0b50f36` |
| `native-5cd63ff-k1corr1-h3-en-lang-applied.png` | 201652 B | `e2432cffd5586cbc848d998d5ef0fe94c5a3d7a637abe1ce195fdaa7a2bd77d9` |
| `native-5cd63ff-k1corr1-h3-en-theme-applied.png` | 190617 B | `96903223dd6c9bdd66ed9532cae01ae49a93f84120522dc792c0032a1bd6c3b8` |
| `native-5cd63ff-k1corr1-h3-zh-density-applied.png` | 205428 B | `9b3c3d20e8586c915fa57c9339e4be366d0d4ad0ac7f4190a590dd26915c40c2` |
| `native-5cd63ff-k1corr1-h3-zh-lang-applied.png` | 201432 B | `a7159e8606afd0c86522c8d16d80624442676ac326b3b8160e776df6b3196b95` |
| `native-5cd63ff-k1corr1-h3-zh-theme-applied.png` | 191826 B | `b203f73f2de1ab3436955c5bbd9bcfb900980a60cea81f391310b3504e9420bc` |
| `native-5cd63ff-k1corr1-h5-en-after-save-and-apply.png` | 107706 B | `b852f5e1e0bf445fa58edab8f905565e74179ddd52cb090cbca5aa70607e1a3a` |
| `native-5cd63ff-k1corr1-h5-en-after-topbar-change.png` | 107105 B | `327c968871c1efb24728817c749fcaf01bd839ae7083e7fc3f056d5c5a603f5e` |
| `native-5cd63ff-k1corr1-h5-zh-after-save-and-apply.png` | 101068 B | `309d3b6c5172736959d74d624d83ae2762192a672851a7e9faaf495d53411a59` |
| `native-5cd63ff-k1corr1-h5-zh-after-topbar-change.png` | 100984 B | `1494f9e982c4ad63ca060a0a0f3d4e7a07f642c44e5c882c6ed9c687a87667af` |
| `native-5cd63ff-k1repro1-h10-en-A-after-B-commits.png` | 123215 B | `7098785548213a358665090b67a3b0baa2bdd78c401b072bd89d6a7c042abf87` |
| `native-5cd63ff-k1repro1-h10-en-A-after-reload.png` | 108269 B | `c330980eeb3cd57f695399c951ec1265b215d1e99d584adf8a89163b43837add` |
| `native-5cd63ff-k1repro1-h10-zh-A-after-B-commits.png` | 113718 B | `7d7a64a5d20440da4ea2ec8186c86dc48d058b1ed84cf43784ece67194e68892` |
| `native-5cd63ff-k1repro1-h10-zh-A-after-reload.png` | 114395 B | `f1da81a0b2898838544b1921194139458d5be4b2f5b83ad6af66b58dfeef0f57` |
| `native-5cd63ff-k1repro1-h15-en-before-activation.png` | 114023 B | `431599119e93f8edc8ac43bba8131dce347da074965034c2664086e625a4be2e` |
| `native-5cd63ff-k1repro1-h15-en-saved-flash.png` | 107291 B | `cffb77871ad05d2a22f2939a4ff13dd1bce0fddfea0991d74084f4c8952d7250` |
| `native-5cd63ff-k1repro1-h15-zh-before-activation.png` | 104914 B | `c91361d0f05c9dc4b7240ca2b9c11a7f7d10b5dceef54abf1490aa85484d28d5` |
| `native-5cd63ff-k1repro1-h15-zh-saved-flash.png` | 100334 B | `1590fcc4f6fd3e3d4fda6eb05d21f06e34cf89cbc0ca251914638b25f113b117` |
| `native-5cd63ff-k1repro1-h17-en-saved-flash.png` | 107771 B | `5b4d4d321c8577fe9d8c577353db44a99a97c65672ae92c0ca24466a4c27850d` |
| `native-5cd63ff-k1repro1-h17-en-stored-before-activation.png` | 107104 B | `740549b7c15878df31b721b9414a4fedb00f111c5c642841540d0e3f1d87fc94` |
| `native-5cd63ff-k1repro1-h17-en-tab-focused.png` | 108288 B | `d82d2c13472fc82e893c0dcf6f02689a90ffc8813357b72414b297932d60b668` |
| `native-5cd63ff-k1repro1-h17-zh-saved-flash.png` | 100854 B | `2f0bbc6b84aedca7ad43a47a31f18fe07b75d559f3a1e5e14f8e488da04ad845` |
| `native-5cd63ff-k1repro1-h17-zh-tab-focused.png` | 101385 B | `deb5b34e0ff7bf1d1b448577ff947a0f0822ecc845bbf196fa46aacc1a2bb5d9` |
| `native-5cd63ff-k1repro1-h3-en-density-applied.png` | 204421 B | `f5d4f8c3cc443e26d406d0868c85c81af595777668c488117d0fb9dbd0b50f36` |
| `native-5cd63ff-k1repro1-h3-en-lang-applied.png` | 201601 B | `adfb24315a176487eae4013f3a834d49c2877eb5e50b8a6310af327b6e0b13f1` |
| `native-5cd63ff-k1repro1-h3-en-theme-applied.png` | 190617 B | `96903223dd6c9bdd66ed9532cae01ae49a93f84120522dc792c0032a1bd6c3b8` |
| `native-5cd63ff-k1repro1-h3-zh-density-applied.png` | 205365 B | `8d27180e8db3ea36704b3b05a6f449af8653113d0146917aa3f44f8dc0cf81c9` |
| `native-5cd63ff-k1repro1-h3-zh-lang-applied.png` | 201432 B | `a7159e8606afd0c86522c8d16d80624442676ac326b3b8160e776df6b3196b95` |
| `native-5cd63ff-k1repro1-h3-zh-theme-applied.png` | 191826 B | `b203f73f2de1ab3436955c5bbd9bcfb900980a60cea81f391310b3504e9420bc` |
| `native-5cd63ff-k1repro1-h5-en-after-save-and-apply.png` | 108598 B | `94463b5f632c977097765feac9dcd8df12bfa778703448df8cffb45eb8fe74f1` |
| `native-5cd63ff-k1repro1-h5-en-after-topbar-change.png` | 107105 B | `327c968871c1efb24728817c749fcaf01bd839ae7083e7fc3f056d5c5a603f5e` |
| `native-5cd63ff-k1repro1-h5-zh-after-save-and-apply.png` | 102037 B | `f3c3bbfbd6a38ca3e507cec70a191c33ffe5ec10fccb4c84779db273e8030527` |
| `native-5cd63ff-k1repro1-h5-zh-after-topbar-change.png` | 100984 B | `1494f9e982c4ad63ca060a0a0f3d4e7a07f642c44e5c882c6ed9c687a87667af` |

The superseded first probe pass (§8) is not committed. Its hashes:

| File | SHA-256 |
| --- | --- |
| `probe-runner-k1.log` | `b5f2875a68932f196036d26a3727932a3e06d9e93fd0087bcc89f1e73fe33d04` |
| `probe-reference-k1.log` | `ee365a5ae84661a7c739ab88d93b865f2b890bc4a7f771fded6735a53077b5b9` |
| `probe-mechanism-k1.log` | `cbf1cf4aa425c52e80c400f778e683f3d1580a3025cc5b654965a9ff5c828bbb` |
| `probe-followup-k1.log` | `78cae7087c62829104e49a719d4ef146d6480b8474a66a237011f8d874b9c03f` |

## 7. Commands

From the root of this worktree. `XAI_NATIVE_TMPDIR` pointed at the session scratchpad; each runner deleted its temporary archive, profile and bundle.

```sh
# Probe (HEAD bc1f5f4)
node docs/reviews/web-native-keyinput-k1/probe-keys.mjs runner r2      # also: reference, mechanism, followup
node docs/reviews/web-native-keyinput-k1/dt-traces-k1.mjs > docs/reviews/web-native-keyinput-k1/dt-traces-k1.log

# E4 and E5 at 5cd63ff (HEAD temporarily detached to 963036b, the original E4/E5 docs head)
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-native-keyinput-k1/verify-native-before-k1-repro.mjs 5cd63ff h3 k1repro1   # h5 h10 h15 h17
XAI_DEPS_ROOT=... node docs/reviews/web-native-keyinput-k1/verify-native-before-k1.mjs 5cd63ff h3 k1corr1   # h5 h10 h15 h17
XAI_DEPS_ROOT=... node docs/reviews/web-native-keyinput-k1/verify-f1-appearance-k1-repro.mjs 5cd63ff selfcheck k1repro1   # appearance
XAI_DEPS_ROOT=... node docs/reviews/web-native-keyinput-k1/verify-f1-appearance-k1.mjs 5cd63ff selfcheck k1corr1   # appearance

# E17 at 24073b5 (HEAD bc1f5f4)
XAI_DEPS_ROOT=... node docs/reviews/web-native-keyinput-k1/verify-f1-appearance-k1-repro.mjs 24073b5 selfcheck k1repro1   # appearance
XAI_DEPS_ROOT=... node docs/reviews/web-native-keyinput-k1/verify-f1-appearance-k1.mjs 24073b5 selfcheck k1corr1   # appearance

# Comparison (from docs/reviews; the pairs, in order, are those of the comparison records in comparison-k1.log)
node web-native-keyinput-k1/compare-k1.mjs native <committed.log> <k1.log> ...
node web-native-keyinput-k1/compare-k1.mjs f1 <committed.log> <k1.log> ...
```

**Console lines:**
- **Reproduction runs:**
  - `VALID … k1repro1-h3.log checks=195 exit=2`; h5 `87`; h10 `117`; h15 `101`; h17 `88`;
  - `PASS f1-5cd63ff-selfcheck-k1repro1.log verdict=harness-valid checks=134 exit=0`;
  - `VALID-ORACLE-FAIL f1-5cd63ff-appearance-k1repro1.log verdict=before-correct checks=111 exit=2`;
  - E17: `PASS … checks=134` and `PASS … verdict=fixed-pass checks=122`.
- **Corrected runs:** the same verdicts with one more check each (the K-1 precondition): 196, 88, 118, 102, 89, 135, 112, 135, 123.
- **Run times:** 25–36 s each.

## 8. Development probes and process disclosure

- **Probe development** (scratchpad only, not committed): `smoke dev1` (3 trials); `followup dev2`–`dev4` (second-tab and confirm variants).
- **First probe pass (`k1`), superseded.** All four groups ran once with an earlier revision of `probe-keys.mjs` and `probe-page.html`. Two follow-up trials failed: a WebSocket attach to a new tab is refused while another tab of the browser streams. The script was then changed in four ways:
  - the second tab is opened before the dispatch, as h10 does;
  - the reach trial attributes events per target;
  - the onset also counts replays of the runner's own key;
  - the confirm variants were added.

  The page gained per-target counters. All groups were rerun as `r2` with the final files, and only `r2` is committed. Pass 1 and pass 2 agree on stream presence in all 169 trials they share (99 runner, 33 reference, 28 mechanism, 9 follow-up), and the superseded logs' hashes are listed in §6.
- **Rerun units.** All 18 ran once with the final copies. No diagnostic iteration was used, no runner copy changed after its first run, and every log's L1 hash equals §6.
- **HEAD movement.** This worktree was detached to `963036b` for the `5cd63ff` units and returned to `bc1f5f4` before anything else; `git status` showed only this directory in both states.
- **Not touched:** frozen runners, frozen logs, the frozen F1 prelude (read only, hash `67bbfaa7…` checked by every F1 run), contracts, ledgers, the control plane and product files.

## 9. Limitations

1. **Browser builds.** Only Chrome 154.0.8037.97 is installed. The probe characterizes 154, the build of E4, E5 and E17. The Date & Time runs on Chrome 152 and 153 (the accepted `d9d9fdd` set is 153) cannot be re-probed. For their typeahead presses the evidence is each run's own 200 ms capture trace, which is independent of the build. For their focus-mode keys it is the absence of `nativeVirtualKeyCode`, which no tested no-field form ever streamed on 154.
2. **Stray presence in most committed logs is reproduced, not observed.** Only the committed h15 log records the stream directly (§3). For h3, h5, h10, E5 and E17, presence in the original runs rests on a reproduction that is deterministic on the same build: 169 of 169 matching trials across two probe passes, and the in-context reruns. The classification of those items as affected is therefore deliberately conservative.
3. **The mechanism is inferred from behaviour; Chrome's source was not inspected.** The behaviour: the keyDown-only trigger; consumed or default-prevented keys never stream; `preventDefault` stops a running stream; a new document ends it; it follows the focused tab; replays carry the macOS key's code and the event's text. The inference is a browser re-dispatch of an unconsumed native key event.
4. **The probe page is product-free.** Its contexts imitate the runners' handler shapes. The real App contexts are covered by the in-context runs for E4, E5 and E17.
5. **Rates and counts vary.** They depend on load and decay over time on the probe page; they are illustrative. The conclusions rest on presence or absence and on identical outcomes.
6. **The comparison treats some fields as volatile.** They are timing, frame samples, sequence numbers, screenshots, router keys and the ephemeral port. Their differences are reported for h15 and are not counted as outcome changes. Screenshots were not compared pixel by pixel; two corrected screenshots were inspected (h15 EN flash, h10 ZH document A) and match the recorded states.
7. **Some modes were not rerun.** E4 h6 and h14 send no key. Date & Time was not rerun: no Chrome 153 is available, and its logs carry their own traces.
8. **Not determined:** whether keys sent through other CDP paths, such as `Input.insertText` or keys with text but without the field, behave the same. No runner in scope uses them.

## 10. Notes for the controller (non-binding)

- **Drop `nativeVirtualKeyCode` entirely; do not correct it.** The control-plane rule for future native batches is right. A macOS-correct code would replay the real key (endless real Escape or ArrowRight keydowns), which is worse than the `Unidentified` replays of the Windows codes. The audit of `verify-native-fixed.mjs` (or the K-1 audit here) catches any recurrence.
- **The Date & Time typeahead form is safe only where it is used.** On a focused `<select>` it is consumed. Reused against an element that does not consume it, it would stream real characters (`s`, or `周` with code `Enter`) into whatever has focus.
- **If H15's flash duration is quoted again,** "1817 ms" should be read as measured under the K-1 stream; the clean value is 1783 ms (108 frames).
