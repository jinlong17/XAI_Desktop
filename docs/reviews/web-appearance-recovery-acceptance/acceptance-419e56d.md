# CP-APPEARANCE-01 final acceptance at `419e56d`: ACCEPTED

- **Date:** 2026-10-05
- **Module:** `web`
- **Control-plane item:** CP-APPEARANCE-01, batch 52. The caller covers the Settings Appearance pane (seven device fields), the App root-preference writer, the Topbar quick switcher and the bottom Retry all.
- **Reviewer:** Claude Opus 5.5, independent final-acceptance reviewer (Astra-role mapping). I did not write the selection memo, any contract revision, any oracle, runner or fixture under review, the implementation, or any E1–E27 evidence, and I share no context with those instances.
- **Verdict: ACCEPTED.**
  - All ten contract §13 gates reconcile the four required facts: source, a correct before failure, fixed independent behaviour and the actual user surface (§3).
  - Every §14 item E1–E27 is present. I re-derived all 697 SHA-256 values of the E27 hash log (590 committed artifacts plus the 107 batch-51 files): 0 mismatches. Every committed artifact's last commit is its producing commit. For every ID, at least one principal artifact was re-derived and found in its producer's own receipt (§5).
  - My own reading of the 26 §11 files finds that the implementation meets A1–A9 and §5–§10 (§4). Both product-owner decisions are implemented (§2).
  - All 15 items put to this review are **CONFIRMED** (§6), with stated qualifications on items 6 and 11.
  - No product failure was found. No targeted rerun was needed (§8).

This acceptance covers only this recovery caller (§11).

## 1. Fixed boundary

| Item | Value |
| --- | --- |
| Review checkout | Isolated worktree `.claude/worktrees/agent-a186ea951fa059eaf`. I ran `git fetch origin codex/web/full-product-audit-20260908`, then `git checkout --detach 8c88dd2b629a509faa6cd153b53456b01b8758bb`; `git status` was clean |
| Fixed product | `419e56de9f23e4467fea806fbd4a990e1f429941`. Terra rounds: r1 `24073b522262d8b4bec0abfa29347db28adbdd9e`, r2 `5bbf473872073472188957f430057412e8798131` (F-APP-1), r3 `419e56d` (F-APP-2) |
| Before product | `5cd63ff652f02a2c726187fe12cbc796218d31c0` |
| Docs head equality | `git diff --name-only 419e56d HEAD -- apps packages package.json pnpm-lock.yaml` is empty (check A2) |
| Product diff `5cd63ff..419e56d` | Exactly 26 files, +4111/−666, each a §11 file: Appearance package (pane, `types.ts`, `index.ts`, `styles.css`, docs, tests, and exactly four new internal modules), shell (`Topbar.tsx`, `Shell.tsx`, `types.ts`, `Topbar.test.tsx`, `docs/api.md`), `App.tsx` and the new `App.appearance.test.tsx`. The full diff outside `docs/` is the same 26 files (checks C1–C3) |
| Delta `24073b5..419e56d` outside `docs/` | `styles.css` and the two guard tests only; `styles.css` is an append-only byte-prefix chain `5cd63ff` (8,595 B) ⊂ `24073b5` (12,491 B) ⊂ `5bbf473` (12,956 B) ⊂ `419e56d` (13,693 B) (C7–C9) |
| Contract | `web-appearance-recovery-contract/contract.md` r3, `706c9a3`, SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d`, re-derived at HEAD and at `706c9a3`. History is exactly r1 `e9fbdb7` → r2 `b2e5eb2` → r3 `706c9a3` (B1–B6) |
| Lockfile | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` at `5cd63ff` and `419e56d` (A3). I installed nothing and executed nothing from the dependency root |
| §14 ordering rules | E1–E5 (`bd09456`, `b997235`, `72538d1`) precede Terra `24073b5` on the linear branch. E26 (`32e6753`) and E14–E15 (`2696855`) precede E27 (`c6d1ed4`) |
| Evidence immutability | The full history of `web-appearance-recovery-{sol,independent,native,f1,terra,oracle-erratum,final,contract}/`, `web-native-keyinput-k1/` and `web-more-recovery-fb002/` has 696 `A` entries and 2 `M` entries. The two `M` are the in-place contract revisions r2 and r3. Batch 51 (`c6d1ed4`) is 109 additions; batch 52 registration (`8c88dd2`) changes only the control plane |

## 2. The two product-owner decisions

| Decision (control plane) | Implementation at `419e56d` | Evidence | Result |
| --- | --- | --- | --- |
| **One** (`2f728f1`, B-2 option ii): keep autosave; keep a bottom button; turn it into a real Retry all | Every edit is admitted and submitted immediately through the engine (`appearanceController.tsx:283–291`). `SettingsFooter` is no longer mounted: zero `SettingsFooter`, `pane-footer` and `pane-save` in the package source (D1). The pane-local action area renders Retry all (`AppearanceActions.tsx:55–64`), which re-attempts only settled failures, once each (`appearanceController.tsx:371–387`, `:294–310`). `SettingsFooter`, `confirmAction` and `resetAllPrefs` are byte-unchanged (C6) | Before: H15 and H17 confirmed (Sol `retry-all` before3; E4 h15, h17). Fixed: Sol `retry-all` 48/48 at both fixed SHAs (F3); E26 PASS, including "no old button" in every frame | **Implemented** |
| **Two** (`51db323`): Retry all is always shown, and disabled when nothing can be retried | The button is unconditional JSX, never wrapped in a condition (D12). `aria-disabled={enabled ? undefined : "true"}`; no `disabled`, `inert`, `hidden` or `tabIndex` (D12). Activation always delegates to `retryAll`, which derives E live and returns before any state change when E is empty (`appearanceController.tsx:371–375`, D19). One neutral rule set changes only the colours and the cursor (`styles.css:469–474`, D28), on the same box (`:462–464`) | E8 clean disabled case; E12 row s (clean, pending-only, source-only); E14 §3.8 measured presentation (contrast 3.795–5.078, accent-independent, distinct, same box, focus ring, attributes); E15 (Enter/Space inert, focus kept, no scroll) | **Implemented** |

## 3. Ten-gate reconciliation (contract §13)

Line numbers refer to `419e56d`. "Sol" is `web-appearance-recovery-sol/`, "host" is `web-appearance-recovery-independent/`, "native" is `web-appearance-recovery-native/`, "F1" is `web-appearance-recovery-f1/`, "final" is `web-appearance-recovery-final/`, and "AC" is `packages/xai-web-settings-appearance/src/internal/appearanceController.tsx`. Every count below that is marked F*n* was parsed by my checker from the raw log, not taken from a receipt (`acceptance-checks-419e56d.log`).

| Gate | Source (`419e56d`) | Correct before failure (`5cd63ff`) | Fixed independent behaviour | Actual user surface | Verdict |
| --- | --- | --- | --- | --- | --- |
| **1. All seven fields** | Seven strict bindings in a fixed hook order (AC `:514–521`). Validators equal the §2 domains (AC `:67–88`, D20). Display falls back from draft to valid stored bytes to the default (AC `:490–493`). The `unavailable` state is source-only with Reload only (AC `:553–564`; `AppearancePane.tsx:417–450`). Discard detaches before `meta.reload()` (AC `:313–325`). Completions are attributed to the exact draft (AC `:231–255`) | Sol `fields` before3: 1 pass, 88 correct FAIL, 0 PRECONDITION (F1). H1, H2, H4, H6, H7, H12 and H13 confirmed (Sol README). E4 h6: 10 values crash `/app` | Sol `fields` 89/89 and `bytes` 65/65 at `24073b5` and `419e56d` (F3). E9 native controls PASS, 1,345 checks (F10): 40 values by trusted input with exact bytes; source-only per key; held lock; uncertainty with one write; second-document conflict; 14 cross-surface steps with 0 inconsistent snapshots | Production `App` in Chrome (E9). E14 all-seven screenshots at five widths in EN and ZH. I viewed EN 768: seven blocks with Retry and Discard, and the latest choices displayed | **PASS** |
| **2. Reset to defaults** | `resetToDefaults` (AC `:425–462`). The confirm runs first, with the normative text (`AppearancePane.tsx:122–124`, D23). Six typed reset intents and a batch; language excluded (AC `:62`, `:444–461`). A duplicate enqueues no removal (AC `:435–443`). A failed reset is eligible only while the engine holds its failed request, so its Retry is a removal (AC `:179–186`; `usePrefAsync.ts:262–276`) | Sol `reset` before3: 4 pass, 30 correct FAIL (F1). H9 confirmed: the "every preference" text, a swallowed removal failure, root keys written as defaults, no "Defaults restored." | Sol `reset` 34/34 at both fixed SHAs (F3), including the demo-scope run. E10 native reset PASS, 288 checks (F10): decline makes zero attempts; six removals with zero writes; language untouched; uncertainty with one remove; conflict preserved; "Defaults restored." checked per frame | Production `App` (E10). E14 partial-reset screenshots at 375 EN/ZH | **PASS** |
| **3. Ordering and cross-surface latest intent** | One draft per field across both surfaces (`admit`, AC `:258–271`). Predecessor recovery never acknowledges the latest (AC `:248–255`). The Topbar setters are the controller's edits (`App.tsx:200–205`; `Topbar.tsx:82–84`). The engine queue is unchanged (storage tree identical, C4) | Sol `queues` before3: 1 pass, 55 correct FAIL (F1); H5 and H8. Each ruling-5 case is a business FAIL at step 1 (F2), for example "expected '"dark"' to be '"system"'" | Sol `queues` 56/56 at both fixed SHAs, including `fu2-retry-theme` and `fu2-retry-railPos` (F3, F5). I read `runRuling5` (`fixture.tsx:1276–1370`): it asserts the transient `[set]` while the removal is held, `[set, removal]` after release, `[failed set, set, removal]` over the case, and verified absence. E12 row n: the latest wins, one lock request per edit, sameness in every sampled frame | E12 native frames. E15 slider steps: ArrowRight, ArrowLeft, Home and End are one edit each, with exact bytes | **PASS** |
| **4. Device continuity and export** | Device-only bindings, with no account key, lock or marker. Unmount disposal (AC `:579–589`). Memory-only export with liveness rechecks before setup and after the Blob, URL and append, plus best-effort cleanup (AC `:388–424`) | Sol `continuity-export` before3: 4 pass, 22 correct FAIL (F1); no Export (H12) | Frozen oracle 24/26 at both fixed SHAs. The only failures are 006 and 007, which are OE-1 and OE-2, neither a PRECONDITION (F4). Corrected copy 26/26 (F4). E11 native export PASS, 389 checks (F10): eight §8 disk shapes under total denial, plus two setup failures | Real Chrome downloads, parsed from disk (E11, nine JSONs) | **PASS** (OE ruling, §6 item 2) |
| **5. Production host and protection** | One controller in `AppInner`, inside `AccountStorageGate` (`App.tsx:127–128`, `:236–240`), provided at `:187` (D7). Topbar slot `Topbar.tsx:114–117`, `Shell.tsx:84`, shell types `:131`, `:205` (D10). The status renders only while E is non-empty (`AppearanceStatus.tsx:22`, D17). Review emits the shortcut event, then navigates once (`App.tsx:132–136`, D9). The sign-out step comes immediately before both `requestSettingsDeparture("sign-out")` calls (`:161–162`, `:171–172`, D6). `beforeunload` is registered only while drafts exist (AC `:614–623`). There is no route guard (D36) | E3 host before3: 4 pass, 29 correct FAIL, 0 PRECONDITION (F7); H11, H16 and H17. E4 h3, h5, h10, h15 and h17. E5 a1–a4 before-correct (F9) | E8 host 33/33 at both fixed SHAs (F6). E12 rows a–s PASS, 1,956 checks, with history counters and 0 runtime errors (F10). E17 a1–a4 fixed-pass with F1 signature 0 (F13) | E12 runs the production router through `react-router/dom`, as `main.tsx` does (`native-host-retryall-app.tsx:51`). Topbar status screenshots: 375 icon only, 1440 "Not saved" | **PASS** |
| **6. Downstream, crash safety, chrome invariance and isolation** | Strict validation plus a default display means no throwing consumer receives a malformed value (AC `:490–502`). `readLocalPref` is byte-identical (D4). There is no event, `StorageEvent` or raw storage path (D1, D3, D22). In the clean state the status renders no node | E2: H6, H7 and H10 confirmed. E4 h6: 10 values crash every `/app` route, and so does `Infinity` from a second document. I viewed `native-5cd63ff-before1-h6-en-accent-hue-infinity.png`: the whole page is "Route Error (app)" | E13 PASS, 1,768 checks (F10). It covers byte compatibility in both directions; display truth; 33 malformed values at load and 9 written into a running App, with no route error; live propagation of all seven fields; 42 clean-chrome comparisons identical to `5cd63ff`; and 12 operations with 0 `StorageEvent` and 0 preference-changed events. E18 search (118/118) and E19 protected diff (F14). E20–E23 (F16, F17) | E13 crash screenshots. I viewed the fixed `accentHue-Infinity-en`: the App renders | **PASS** |
| **7. F1 regression** | Every `apps/` file except `App.tsx` and the new test is unchanged, including the coordinator (C1; E19 267/267). The caller registers no guard | E5 before-correct: a1 before-absent, a2 before-no-indicator, a3 before-no-appearance-step, a4 before-unprotected. Selfcheck harness-valid (F9) | E16: all 12 frozen invocations PASS at `24073b5` (`31d6335`) and at `419e56d`, with unchanged runner hashes and no "Invalid blocker state transition" (F12). E17 fixed-pass at both SHAs (F13) | Native Chrome F1 runs in the production composition | **PASS** |
| **8. Presentation and keyboard** | Appended CSS only: 17 selectors, all in the §9 scopes (D26). Only the 640 px and 767 px media blocks (D27). The F-APP-1 and F-APP-2 rules are paint-only (D30, D31). Retry all is ≥ 44×44 and sized to its content (`styles.css:451–458`) | E4 h14: (a) EN 375 overflow (Graphite card, 91 px); (b) the 768×1024 pet over "Save & apply" at the top and end of the scroll range. I viewed `native-419e56d-fixed1-visual-en-768-pet-on-before-5cd63ff-end.png` | E14 PASS, 3,437 checks per language (F11): pet-hidden 0 failures; EN 375 overflow gone (289/289); pet-on, no caller control covered; cascade audit 0 changes in 60,775 values; disabled presentation measured. E15 PASS, 1,398 and 1,468 checks (F11): 1,000 per-stop pixel captures with 0 failures; F-APP-1 and F-APP-2 repaired. Historical FAILs `5307b6f` and `bacdbbc` kept | 154 screenshots reviewed by batch 50. I viewed nine (§8) | **PASS** (§6 items 5, 6, 10–12) |
| **9. Retry all** | Native button, always rendered, `aria-disabled` if and only if E is empty, never `disabled` (`AppearanceActions.tsx:55–64`). Described only while enabled or a pass is open (`:47–48`, `:60`). E is derived live (AC `:179–186`, `:371–387`), one attempt per member in display order (AC `:58–60`, `:294–310`). Pass records and attribution (AC `:126–130`, `:188–215`). Status precedence (AC `:565–576`). Order and placement (`AppearanceActions.tsx:50–92`; `styles.css:422–447`) | Sol `retry-all` before3: 2 pass, 46 correct FAIL (F1). H15, H16 and H17 confirmed; both ruling-5 Retry all cases fail at step 1 (F2). E3 H16-a/b/c and H17. E4 h15 (root keys rewritten, 1.8 s flash) and h17 (four root `setItem` calls in the clean state) | Sol `retry-all` 48/48 at both fixed SHAs, including both ruling-5 cases (F3, F5). E8 clean disabled case. E12 rows o–s. E26 PASS, 521 checks (F10). E14 A2.8 gate: 402 checks per language, 145.81–729.81 px from the pet, in every state. E15 Retry all keyboard checks | I viewed the clean disabled-and-focused state at 1440 EN, the 768 pet-on all-seven end state, and the ZH 375 partial result | **PASS** |
| **10. Final regression and affected callers** | Only the 26 §11 files changed. No selector lies outside the §9 scopes and there is no shared delta, so no affected-caller visual rerun is triggered. D37: the reordered Appearance stylesheet binds only to Appearance markup | Controls at `5cd63ff`: web 28/156 (F16); the unchanged Appearance and shell cases are identical at both SHAs (E21, E22) | E6 (three rounds); E18–E25 and E27 at `c6d1ed4`. Comparisons: compare-accepted 54 MATCH / 1 DIFF, the DIFF being F-FD1 (F18); compare-reruns 26 MATCH / 0 DIFF (F26); delta audit 21/21 (F15). E25 PASS via its copy (F23–F25) | Native E25 in the production composition | **PASS** (§6 items 3, 7, 8, 13) |

## 4. Independent source review against A1–A9 and §5–§10

I read all 26 files at `419e56d` and `git diff 5cd63ff 419e56d`. I also read the protected engine paths the controller relies on: `usePrefAsync.ts:142–302` and `usePrefAutosaveAsync.ts`.

| Clause | Implementation | Finding |
| --- | --- | --- |
| A1 scope | 26 files, all §11 (C1–C3). The 13 protected trees and files are identical (C4). The 11 §11-protected Appearance files are unchanged (C5) | Met |
| A2, A2.1 | Copy constants `Retry all`/`全部重试` in every state (`appearanceRecoveryCopy.ts:61`, `:89`). `aria-describedby` only while enabled or a pass is open (D13). No old strings (D25) | Met |
| A2.2 | See §2, decision two. Activation with E empty makes no state change: the early return comes before `clearPaneLine` (D19) | Met |
| A2.3 | `canRetry` requires an actual draft and no Retry in flight; then either a settled set failure or a rendered held failure (AC `:169–186`). `meta` is a new object every render (`usePrefAsync.ts:302`), so `failedShown` means "a render after admission shows error or conflict". The engine `retry()` re-runs the held request with its own kind and token (`:262–276`). A reset draft never reaches the set path at `:278`. `retryActive` makes repeats inert. Late completions fail the identity test (AC `:233`, `:251`) | Met |
| A2.4 | Precedence: open pass, then export failure while a draft exists, then count, then success, then empty (AC `:572–576`). Success requires `quiet` (no draft, nothing pending, no source issue) and a mounted pane (AC `:196`, `:219`, `:568–571`). "Defaults restored." only for the current batch (AC `:201`, `:223`) | Met |
| A2.5 | No programmatic focus move on activation or on an enabled/disabled transition; the button never unmounts. Focus moves only from unmounting blocks and after Discard all (`AppearancePane.tsx:98–121`, `:421–426`) | Met |
| A2.6 | Per-field Retry and Retry all share `startRetry`. Discard detaches one member. Discard all closes the pass. Reset supersedes members on its six fields while a language member continues (AC `:425–462`). The sign-out step's OK detaches every draft (AC `:463–477`) | Met |
| A2.7–A2.9 | Native button in DOM order; ≥ 44×44 sized to content; the area is at the end of `.appearance-pane`, in normal flow, start-aligned and wrapping (`styles.css:422–447`). Logic lives in the controller; the vehicle is pane-local | Met (gate measured in E14) |
| A3 | One controller per owner. A standalone pane owns its own (`AppearancePane.tsx:46–57`). App creates exactly one (D7). The event path is retired (D3, D22) | Met |
| A4 | Root keys use the suffix path with the `json` codec; the registered keys use the registered path (D21). No registry or codec change (C4) | Met |
| A5, §7 | No route guard; Topbar status; `beforeunload`; sign-out step. Forced transitions are never blocked: the gate remounts App (E12 row k) | Met |
| A6 | Refuse, never repair. A valid edit over malformed bytes is a failed draft (E7, E9) | Met. See the follow-up on externally repaired sources, §9 item 3 |
| A7, §6 | See gate 2. Root keys move from writing defaults to removal (E10: six removals, zero writes) | Met |
| A8 | The "Unchanged" cases are byte-identical at both SHAs (E19, E21, E22). The replaced tests are exactly TP1–TP3b-Persist (setter called once, zero storage attempts), plus TP-Persist-Quota-Safe moved to APP-AP2. Two slot tests, TP-STATUS-1/2, were added | Met. The additions are test-only, in a permitted file |
| A9, §9 | R-PET applied as specified (E14 §3.2–3.3) | Met |
| §5 items 1–9 | Zero-write mounts (Sol `bytes`; E9). Source truth (E9, E12 row l). DOM inputs keep the clamp and the finite check (`AppearancePane.tsx:128–143`). Identity and latest authority (gate 3). Failures keep the choice (gate 1). Uncertainty and conflict (E7, E9). Truthful status (gate 9). Recovery actions (AC `:340–370`). Retry all (gate 9). The 22 EN/ZH copy pairs equal the §5 table (D23, D24) | Met |
| §8 | Sparse set/reset envelope; memory only (gate 4) | Met |
| §10 items 1–12 | Gates 6 and 10; E18–E25 | Met |

## 5. §14 checklist E1–E27: artifact paths and SHA-256

**Method.** `verify-acceptance.mjs` (section E) does three things:
- it re-derives every one of the 697 hashes in the E27 hash log `web-appearance-recovery-final/hashes-appearance-final-v1.log`, all equal;
- it checks that each committed artifact's last commit is its listed producing commit (`git log -1`);
- independently of E27, it re-derives the principal artifacts below and checks that each hash appears in its producer's own receipt (full hash, or the control plane's 8-hex prefix), that git added the file once in that commit, and that the file is unchanged since.

All rows pass; paths are relative to `docs/reviews/`.

| ID | Producing commit | Principal artifact: SHA-256 (re-derived by me) | Cited in | Status |
| --- | --- | --- | --- | --- |
| E1 | `bd09456` | `web-appearance-recovery-sol/verify-fixed.mjs`: `a451df6aa05fcae5b6fb77266d6ef8d990b4e97b91755c0723f442239fbf5c1e`; `retry-all.test.tsx`: `d851c75a5ca80470e928b52425521d8b549d3e91738796ac9f84708d793c513c`; `queues.test.tsx`: `1d6c85c28224a2fc1dace8ee754873fd3d2b716264f9b812c753a816b6ac2d66`; `README.md`: `575514d5f2c7b7c69a1296a91515d2a48da4efec8cc71d23c06c76b2a9f3805e` | Sol README; control plane | Present. F-B002 self-check PASS in all seven oracle files |
| E2 | `bd09456` | `web-appearance-recovery-sol/retry-all-before3-5cd63ff.log`: `ba661294ede1bf4045e348d5d24912c5f9eb4d101d51357c3a62604776f0b919`; `queues-before3-5cd63ff.log`: `7084597c2a248b23b8ef7d0a8a16cf8ac5111fa07d09f8b2c8c8b64743a60125`; `fields-before3-5cd63ff.log`: `9c8bd67d6e739d7e436c0d5d340816ccb7070af5176e7664886ad3855fcbeff0` | Sol README | Present. Correct FAILs, 0 PRECONDITION (F1, F2) |
| E3 | `b997235` | `web-appearance-recovery-independent/host-before3-5cd63ff.log`: `2ffcab96a6a1397149c47c1d1dfa89925aa77e09dbc93e0341ac052f5f3cc306`; `README.md`: `61d3b101ed72a96520faad83f9d1f3947991d4e1527b14342b2f34f1e0e111d6` | host README; control plane | Present (F7) |
| E4 | `72538d1`; K-1 supplement `6b9f0ee` | `web-appearance-recovery-native/before-5cd63ff.md`: `1040306d539471ede6f1f4e276af482b516f4f605bdc741f2737bebe934452be`; `native-5cd63ff-before1-h14.log`: `3d1f5763d11207e6e4e24fc2678177aae0960a91fb933985c061b08bde54e02f`; `-h15.log`: `33b8d9471aeda3b633d17db1fa401e38da55212c12461b54def848fb3d339722`; `-h17.log`: `0677f985760b9e7078d54e631e40cc77bc98e941d1c27879f0796a8229d985e5`; `web-native-keyinput-k1/review-k1.md`: `18a98325b5ff04960087967260017237fda9d2be67ef97f91bffa26e14eaf04b` | Native before receipt; control plane | Present. All 7 modes harness-valid with correct FAILs (F8) |
| E5 | `72538d1` | `web-appearance-recovery-f1/before-5cd63ff.md`: `ddd1f4924641b56dbbc03b1dd342fc743f28aab4a22dbace485b22a3f8a55935`; `f1-5cd63ff-appearance-before1.log`: `6da3c371cf1f8a49eb5128bbe89bf386a4eda254b350dfcdb6c5337fd9c501ea` | F1 receipt; control plane | Present (F9) |
| E6 | r1 `24073b5` + `4874170`; r2 `5bbf473` + `0d34bf2`; r3 `419e56d` + `5766c1e` | `web-appearance-recovery-terra/implementation.md`: `6e07573a8a5881155be91cf002ba27624c9911497c285c91fb0806f747eb5e58`; `appearance-test.log`: `f99fc19499cbaafceeae159067cac80a5cf417dcc844936872e44a432b77447d`; `r2-appearance-test.log`: `4e2ee96b4924c207c916151f2cb647d838ff8a391d71f409e36e44d31b855ffa`; `r3-appearance-test.log`: `539cb4bb5f662dc9ad547366a25a6524646a84850e5280989c06cecfc50972c2`; `r3-web-test.log`: `0adfb87352250db6fb11f706ead2f94bbf7bcc3fb228c4867e4ccb22d851d246`. Product: the 26 §11 blobs at `419e56d` re-derived 26/26 against the E19 log; for example `App.tsx` is `24461a52a34c83d9e9e51dc92d99db6d76e4c56435bec3e5293e0937a8cc935a` | E27 receipt; the r2 and r3 records | Present. The r1 record carries no self-hashes; they are pinned by E27 and re-derived here |
| E7 | `31d6335` at `24073b5`; OE basis `26cfce8`; rerun `c6d1ed4` | `web-appearance-recovery-sol/fixed-24073b5.md`: `59b8b56fb6765ea35d34a98b5c51a01f0fb4914c9c9193c617bfb8490ef6b149`; `retry-all-fixed1-24073b5.log`: `4a20985a777208bd885e3345732a14e4db291475e1f3ee98be5fbc803dae714f`; `queues-fixed1-24073b5.log`: `b7ec55fe24cc9211b8c34699b42ecccf168b1d6f9c28147594e8cb29487a1710`; `web-appearance-recovery-oracle-erratum/review-oe.md`: `63e7eed0313baebb5255a8aa1144ba66a30bef0e83426377d40418d2dacc220b`; `continuity-export.corrected.test.tsx`: `6e9c7def13a5128534a245653c90414c805a5af7597e7a12644189a258a5909a`; rerun `retry-all-appearance-final-v1-419e56d.log`: `e87c05693358d7d368ac66bc5be73f6e7af638cfbae3fc546635bf65ff2370e4`; `corrected-appearance-final-v1-419e56d.log`: `d2ce51d322271487a45e421e93693763d7faf81e365fc3a22bad292348a19bfa` | Sol fixed receipt; OE review; E27 receipt and hash log; control plane | PASS at both SHAs under the OE ruling (F3–F5) |
| E8 | `31d6335`; rerun `c6d1ed4` | `web-appearance-recovery-independent/host-fixed1-24073b5.log`: `b2425a58806178d0f89a1966a19ce78996191ac759e6e5a99a306b2725b1c4b1`; `host-appearance-final-v1-419e56d.log`: `e010516873a940f6e61b997a1086a97b4a2b0b1e62beb1c81e43c492c6eae334` | Sol fixed receipt; E27 receipt | PASS, 33/33 at both SHAs (F6) |
| E9 | `3419542` | `web-appearance-recovery-native/review-controls-reset-export-24073b5.md`: `287477b8b4f4a5a4304d6117dd495e40c467d6af18fe4addaa621ef9c82e55c0`; `native-24073b5-fixed1-controls.log`: `ccf7acb2d3152e8b1db7340dc9a60185d38c40c5a99362e0e7f4f04ca87384fa` | Native controls receipt; control plane | PASS; carried over (§6 item 4) |
| E10 | `3419542` | `web-appearance-recovery-native/native-24073b5-fixed1-reset.log`: `5b6fe71481c0049694f4919b0c1991678b6d125263d9b3efa951448176157809` | Native controls receipt | PASS; carried over |
| E11 | `3419542` | `web-appearance-recovery-native/native-24073b5-fixed1-export.log`: `c3ac58b0e1d6096525c28991f46b5b26e6762e4fe2ca69a6625a7481a20e3e9c` | Native controls receipt | PASS; carried over |
| E12 | `32e6753` | `web-appearance-recovery-native/review-host-downstream-retryall-24073b5.md`: `ea10ba23e2c0ba6df2d55a2d066e50c432430a6b37a9f758b2a8b63ac3a00020`; `native-24073b5-fixed1-host.log`: `57ba2c11dc53391831f64d666a7211dbcee79ed95be828b388ccff6eeb1a0d06` | Native host receipt; control plane | PASS; carried over |
| E13 | `32e6753` | `web-appearance-recovery-native/native-24073b5-fixed1-downstream.log`: `8da81f7e0101bae29e9c98fc33916afe84f66bbc4573c4f785e0247cf1eaa472` | Native host receipt | PASS; carried over |
| E14 | `2696855`; history `5307b6f`, `bacdbbc` | `web-appearance-recovery-native/review-visual-keyboard-419e56d.md`: `89ee14cdca69bf91e5c7fa117572a5dd9e17f51bdd2cbec616cb3910af06a0cc`; `native-419e56d-fixed1-visual-en.log`: `0e8e642b60e8f8211357211456bb8d4ecf0931ec8ce7a98ec9cd9781e7b9277b`; `-visual-zh.log`: `43097916cb3fc721909fa95c2fba487f1a1eab8369a84563e54186fd511903c5` | Visual receipt; control plane | PASS at `419e56d` (F11). The two historical FAIL sets re-derived 29/29 and 77/77 |
| E15 | `2696855` | `web-appearance-recovery-native/native-419e56d-fixed1-keyboard-en.log`: `2c96feb68ae200a4232981cfa79cc13bbefaf04e59abba533e0b57e9a8e7d486`; `-keyboard-zh.log`: `cfe5d63f71368fa3c8f76c25d57fff0e180348ab404a3e1868615c9f01ffca9e` | Visual receipt | PASS (F11) |
| E16 | `31d6335`; rerun `c6d1ed4` | `web-sticky-recovery-f1/f1-24073b5-sticky-fixed1.log`: `2d72ef3dabc4613557a65712c2f6508da0a1f0dc20f98469938e235cb43455c1`; `f1-419e56d-sticky-appearance-final-v1.log`: `b610ed8c76af343b523e4616607a9b53de55989edb53d3750566063b8b506e8e`; `web-features-recovery-f1/f1-419e56d-features-appearance-final-v1.log`: `68e80ec39c20d976b723e808c70f48c1f6317843be9a4d883083c8ba63ba5e64` | Sol fixed receipt; E27 receipt | PASS, 12/12 (F12) |
| E17 | `31d6335`; rerun `c6d1ed4` (K-1 copy) | `web-appearance-recovery-f1/f1-24073b5-appearance-fixed1.log`: `815196e8533fd70fe7104866d7de96215696e8ac708f2d13715c555e2ff0346e`; `web-native-keyinput-k1/f1-419e56d-appearance-appearance-final-v1.log`: `ef30c1d8b415962d842360b02a2011b90e791303f73d56892e3b742a6ad5e326` | Sol fixed receipt; E27 receipt | PASS, fixed-pass (F13) |
| E18 | `c6d1ed4` | `web-appearance-recovery-final/search-appearance-final-v1-419e56d.log`: `aa26ba18cbb1db5377c5f867ad09e911d20ef46094e2ac3d7580b0cead27f00e` | E27 receipt | PASS (F14) |
| E19 | `c6d1ed4` | `web-appearance-recovery-final/protected-diff-appearance-final-v1-419e56d.log`: `c67781ff16589825025ed267d535aaa82b51dfc71cfe4d6cf7829fc4232a3083` | E27 receipt | PASS (F14) |
| E20 | `c6d1ed4` | `web-features-recovery-final/storage-check-types-appearance-final-v1-419e56d.log`: `ae923a15e1a42085d7014a541eb9f05728d23d73b2b75b035c67afad40039896`; `web-appearance-recovery-sol/bytes-appearance-final-v1-419e56d.log`: `cf616e933931eda06ffa7cd08e886de74322a8573e28cfee13b3d26fe11bcfbf` | E27 receipt | PASS |
| E21 | `c6d1ed4` | `web-appearance-recovery-final/appearance-test-appearance-final-v1-419e56d.log`: `4b986489a694c22f3c49e1bbab18f789e94ed081dbb6307e6dbff70f3773f934` | E27 receipt | PASS, 137/137 (F16, F17) |
| E22 | `c6d1ed4` | `web-appearance-recovery-final/shell-test-appearance-final-v1-419e56d.log`: `ea8348139704afd4176c926e66e8ae716d96e5fae8cde306c4de01a622caa220` | E27 receipt | PASS, 115/115 |
| E23 | `c6d1ed4` | `web-appearance-recovery-final/web-test-appearance-final-v1-419e56d.log`: `9c8c470225bbae25f2503804bed47af0666a4eee20cd79570d585022ec916c58` | E27 receipt | PASS, 178/178 (156/156 control at `5cd63ff`) |
| E24 | `c6d1ed4` | `web-appearance-recovery-final/compare-accepted-appearance-final-v1.log`: `2151a375520ca7e35342defa4e15224af492ab1e51243c1919c59025302b2980`; `web-features-recovery-sol/downstream-appearance-final-v1-419e56d.log`: `647ce30c112fb4192b03bf5f9d3d448d78c9c00d686f6f95835c53dcbbbf4b8f`; `web-more-recovery-fb002/logs/corrected-full-appearance-final-v1-419e56d.log`: `6ea3eb542a95866636856d42735ff7cf2da2d9ff2597efe08cc41d08a4412cb4` | E27 receipt | PASS under F-FD1 and C-FB002 (F18–F22) |
| E25 | `c6d1ed4` | `web-appearance-recovery-final/native-419e56d-appearance-final-v1-downstream.log`: `937572d82d950c00af92b7c496924915a988850a64a736941d7a849a551a76d3` | E27 receipt | PASS via the copy (F23–F25) |
| E26 | `32e6753` | `web-appearance-recovery-native/native-24073b5-fixed1-retryall.log`: `dc7f27e859d99408e1607f8628cd5e83e64acd6e6b6132633f7577c09ef75d42` | Native host receipt; E27 receipt | PASS; carried over |
| E27 | `c6d1ed4` | `web-appearance-recovery-final/review-final-regressions-419e56d.md`: `094112c33f864a858028d42d426745352878557cf4799e1a77d719944d5949c6`; `hashes-appearance-final-v1.log`: `d14a4173a62001aa1064a30400d01284f85ca2ba13713afd9b81f28dfab9e3d5` | Control plane; E27 receipt | Present. Enumerates E1–E26 in order, once each (check E-27) |

No ID is absent or mismatched.

## 6. Rulings

1. **Contract revisions r1 → r2 → r3 and the controller rulings on the r2 and r3 open questions: CONFIRMED.**
   - **The revisions are what they claim.** Each revision commit touched only the contract; r1 also added the selection memo (B4–B6). A1 and A3–A9 are byte-identical across r1, r2 and r3 (B7, B8). r3 counts H1–H17, gates 1–10 and E1–E27, each once (B9).
   - **r2 implements decision one.** It moves from option (i) to option (ii), matching selection memo §7.2 B-2.
   - **r3 implements decision two and ruling 5.**
   - **The r2 rulings are implemented as decided** (control plane, "总控裁定（r2 开放问题 2–6）"):
     - the copy, which D23 checks against the §5 table;
     - the non-sticky, start-aligned area (`styles.css:422–447`);
     - the counts;
     - the inherited ordering, made a Sol oracle in r3 §12 and passing at both fixed SHAs.
   - **The r3 confirmations hold in the product:**
     - the export-failure line only while a draft exists (AC `:574`);
     - focus kept on the disabled button;
     - no description outside a pass;
     - the neutral disabled thresholds;
     - "Defaults restored." required only in the Retry all ruling-5 cases (`fixture.tsx:1363–1364`).
2. **OE-1/OE-2, E7 `continuity-export` judged by the corrected copy: CONFIRMED.**
   - **The corrected copy differs from the frozen oracle by exactly three lines:** two seeds moved before the mount, and `"295"` changed to `"230"` (my `diff`).
   - **OE-1.** The frozen case seeded bytes after the mount, without a `StorageEvent`. Contract §5 item 6 and §6 require that unobserved external bytes be preserved as a conflict, and §5 forbids a pre-flight or rebase. The frozen suite itself asserts that conflict (`reset.test.tsx:330–346`).
   - **OE-2.** A background choice also writes the tone's hue, which is 230 for Mist (`constants.ts:25`; contract §2 and §5 item 4). The frozen suite asserts `"230"` for the same sequence (`fields.test.tsx:415–425`).
   - **The raw logs match.** The frozen oracle fails exactly 006 and 007 at both fixed SHAs, and the corrected copy is 26/26 (F4).
3. **K-1, no conclusion changed; E17 and E25 run through corrected copies: CONFIRMED.**
   - `review-k1.md` compares every affected unit check by check (18 pairs) and classifies each item. The only descriptive change is the H15 flash, 1,817 ms against 1,783 ms.
   - My own scan shows that only the frozen `verify-native-before.mjs` and `verify-f1-appearance.mjs` send `nativeVirtualKeyCode`. No fixed-product runner (E9–E15, E26), the K-1 copy or the E25 harness copy sends it (F27). The fixed runs passed their key audits.
4. **E9–E13 and E26 carry over to `419e56d` by the delta audit: CONFIRMED.**
   - **The delta is paint-only.** Outside `docs/` it is `styles.css` plus two test files, and the CSS is append-only (C7–C9). The appended text is two `:focus-visible` rules declaring only `outline`, `outline-offset` and `box-shadow` (D30, D31). These affect neither hit-testing, layout, DOM, storage nor events.
   - **The bundles are identical.** The delta audit (21/21, F15) found the production `vite build` JS byte-identical, and reproduced the esbuild bundles that the E9–E13/E26 runs executed (`be21e32d…`, `4474593b…`, `1b43c073…`) from both revisions.
   - **Those runners cannot observe it.** They read no outline or box-shadow pixels. Focus pixels are E14–E15, which ran at `419e56d`.
5. **F-APP-1 and F-APP-2 fixes and the same-class audit: CONFIRMED.**
   - **Root causes are where claimed.** Both are in protected tokens CSS (D33):
     - `.slider-row input[type="range"] { outline: none }` at (0,2,1), F-APP-1;
     - `.accent-sw.active` with a static ring at (0,2,0), F-APP-2.
   - **Each fix is one appended, pane-scoped rule.** F-APP-1 copies the global ring declaration byte for byte (D30, D32). F-APP-2 adds the ring at offset 4 px and keeps the selection as a `box-shadow` (D31).
   - **The same-class audit is thorough.** It was three-layer (static, browser matching and CSSOM) and found no other in-pane masking. E15's 1,000 per-stop pixel captures with 0 failures corroborate it, as does the F-APP-2 own-region change of 830–862 px against 0 at `5cd63ff`.
   - **The surface shows the fix.** I viewed `native-419e56d-fixed1-keyboard-en-selring-dark-swatch-1-focused-row.png`: the selection ring and the focus ring are both visible.
6. **F-APP-3 (Topbar popover option focus) is outside this caller's scope and recorded under UX-05: CONFIRMED, with a qualification.**
   - **The defect is real and pre-existing.** Checked options change 0 own pixels when focused, in both languages and themes, and I saw this in `…popover-light-checked-focused-panel.png`. The cause is `layout.css:453–463`, unchanged from `5cd63ff`.
   - **The contract preserves the popover.** It does so at line 193 (roles and options), line 858 ("keyboard behavior is unchanged"), line 888 (chrome invariance with the popover open) and line 1214 (content changes excluded). §11 limits `Topbar.tsx` edits to the setter calls and the slot ("Nothing else"). A CSS fix needs a selector outside the §9 scopes in protected tokens.
   - **Qualification:** the quick switcher is one of this caller's three writer surfaces, so the follow-up should be scheduled with priority in UX-05. Two guard tests (`AppearancePane.focus-ring.test.tsx` test 3 and `AppearancePane.selected-focus.test.tsx`) are coupled to the tokens rules and must be updated with that change.
7. **F-FD1, Features downstream case 012 judged by the corrected copy with condition C-FD1: CONFIRMED.**
   - **Facts in the logs:**
     - At `419e56d` the frozen oracle fails only case 012, as a PRECONDITION (F19).
     - The two-line change from `"sage"` to `"mist"` is the entire diff (F21).
     - The corrected copy passes 15/15 at `419e56d` and at `5cd63ff` (F20).
   - **Why `"sage"` is malformed.** Contract r3 §2 places `"sage"` outside the strict domain, A6 refuses it, and selection B-6 says so. No pane version ever wrote it: the Sage tone's id is `default`, and no CSS rule exists for it. H7 names it as a defect to remove.
   - **The isolation still holds.** The Features property the case protects holds with an in-domain seed, and cases 011 and 013–015 still pass with the frozen `"sage"` seed.
   - C-FD1 follows the C-FB002 precedent.
8. **C-FB002, More `boundaries` uses the corrected oracle: CONFIRMED.** The corrected oracle is 10/10 at `419e56d` with 0 RangeError (F22). The frozen oracle is recorded as it fell (10/10 this time; nondeterministic by F-B002).
9. **R-PET, only Retry all is held to the strict pet gate: CONFIRMED.**
   - **The contract scopes it this way.** A2.8 and §9 apply geometric separation and five-point probes to Retry all only. A9 keeps the uncovered-centre rule, blocking, for every other control this caller adds or moves.
   - **Both rules hold in E14.** Retry all is 145.81–729.81 px from the pet at five widths, enabled and disabled, including 768×1024 and the end of the scroll range. With the pet on, no caller control is covered.
   - **The pet is untouched.** The protected `xai-web-pet` tree is identical (C4), and the Features acceptance §5.1 precedent applies.
10. **Topbar breakpoint erratum, status text from 768 px: CONFIRMED.**
    - **The rule and its gloss conflict.** Contract line 606's normative rule is "where the Topbar summary is visible". Its parenthetical "(above 760 px)" is wrong.
    - **The CSS facts.** The summary is hidden at ≤ 760 px and again at 641–767 px, and only width-capped at 768–1024 px (D34). The status text is hidden at ≤ 767 px (D35).
    - **The measurement.** E14 §3.4 measured 760, 761 and 767 icon-only, and text from 768.
11. **44×44 applies only to this caller's new or changed targets: CONFIRMED, with a qualification.**
    - **Literal reading.** §9's bullet "every Topbar control stays … at least 44×44" with the status visible would include the pre-existing search box and trigger, which are 36 px tall above 1024 px.
    - **That reading cannot be met under the contract.** Enlarging them would need protected tokens CSS or an out-of-scope selector, and would break clean-state chrome invariance (§10 item 6).
    - **The bullet's purpose is met.** Adding the status shrinks nothing: E14 §3.5 shows identical sizes against `5cd63ff` at every width. All caller targets are ≥ 44×44.
    - **Qualification:** the 36 px Topbar heights are a pre-existing a11y item for UX-05/SHELL.
12. **Space tolerance and the 1024 page-scroll probing: CONFIRMED.**
    - **Space.** The tolerances (one negative clamp after a recovery block unmounts, and anchoring of +3/+13 px) were fixed before the evidence runs and disclosed. A positive control proves that a real Space scroll (449/652 px, more than half the scrollport) is caught. A native `<button>` has no Space-scroll default.
    - **1024 page scroll.** At 1024×768 the page itself scrolls, so the A2.8 probes ran at the page top and at its end. The horizontal separation (483.81 px) alone excludes overlap.
13. **Harness deviations: CONFIRMED.**
    - **E3 router import.** This deviation is jsdom only. `react-router/dom`'s `RouterProvider` resolved a second `react-router` copy and only adds `flushSync`. Every native fixture renders the production router through `react-router/dom`, as `main.tsx` does.
    - **Development probes outside the iteration cap.** This is consistent with the Features E4/E5 precedent. The probes are disclosed, their outputs stayed outside the repository, they are harness-only, and the runner copies weaken nothing (the batch 50 copy changes 9 SHA-specific lines and inserts 502).
    - **The E25 copy.** It removes exactly one line, the caller-bound precondition, and replaces it with a stricter one: the delta must be exactly the Features delta plus the 26 §11 files. It adds a K-1 audit, and the runner, fixture and prelude are byte-identical (F24, F25).
    - **The E17 copy** follows the K-1 ruling.
    - **WebSocket transport kept.** E16 requires unchanged runner hashes. A dropped socket can surface only as a harness error, and every run completed its full check count.
14. **Contract line 606 parenthetical erratum and the Terra implementation deviations: CONFIRMED.**
    - **The erratum** is as in item 10.
    - **r1's eleven deviations** (`implementation.md` §8) stay within §11:
      - the controller in `AppInner` keeps `App()` unchanged;
      - recovery blocks are siblings of the unchanged `SettingRow`s;
      - the neutral disabled tokens and the transparent base border;
      - the 767 px breakpoint;
      - the scoped `.bg-tones` containment;
      - test-only helpers;
      - additive type exports.
    - **r2's and r3's deviations** are test scope, the 4 px offset, a disclosed stall and an imprecise commit-message count.
    - **Three further notes:**
      - The two added Topbar slot tests are test-only.
      - Terra's r1 `preview_start` in the main checkout rewrote only git-ignored Vite cache. It is disclosed, the evidence runs from archives, and it is non-blocking.
      - The r3 note that `styles.css:116–119` duplicates the tokens rule is correct; §9 required existing rules to stay byte-unchanged.
15. **`docs/test.md` does not list the two guard tests; non-blocking docs follow-up: CONFIRMED.**
    - §11 requires the Appearance docs to describe six things: the controller, the absent route guard, the Topbar slot, the sign-out step, the retired event path and Retry all. `docs/api.md` and `docs/test.md` at `419e56d` describe all six (my read).
    - Listing every test file is not required, and batches 47 and 49 could not touch docs.

**Additional confirmations** (controller observations this review relied on):
- **§5 item 1, zero-write mounts.** Natively, every App mount writes `xai:auth:identity-change` and a supabase `lswt-` probe. Both come from code byte-identical to `5cd63ff`, outside this unit. Sol `bytes` shows zero attempts on every key with the auth hook substituted. The requirement's purpose, no write by this unit, is met.
- **Batch 39 ruling 3.** Display values come from the stored bytes: pane, Topbar and `<html>` agree after a fresh load (E9).
- **Batch 39 ruling 4.** Host row m and a1 release exactly once, by one `router.navigate` replay, with 0 non-live blocker calls (E12, E17).
- **Batch 46 ruling 1, cascade order.** E14 found 0 changes in 60,775 computed values. My D37 extends this to the whole app: all 83 unscoped selectors of the original Appearance sheet carry a class that no other module uses, so the earlier bundle position cannot restyle other modules. The positive control N7 shows that the class search finds `pane-title` in 9 files and `active` in 160.

## 7. Exclusions, retained limitations and protected paths

- **§10 item 8 protected paths are unchanged.** They are storage, settings-shell, tokens, core, event bus, pet, CmdK, the Features panel, settings-rest, dashboard-grid, dashboard-widgets, `package.json` and `pnpm-lock.yaml`. All 13 have identical trees or blobs (C4). So are every non-§11 shell and `apps/` path (C1; E19) and the 11 §11-protected Appearance files (C5).
- **§16 exclusions are respected:**
  - body-text scaling is untouched;
  - the popover content is untouched;
  - language is not reset;
  - the pet is not moved or restyled;
  - `SettingsFooter`, `resetAllPrefs` and `RESET_DEFAULTS` remain without a production mount;
  - the core event type is kept;
  - malformed bytes are never repaired;
  - without Web Locks, writes are refused;
  - there is no automatic retry, no Retry all outside the pane, no sticky bar, no native `disabled` and no disabled-state wording.
- **§15 retained limitations stay as disclosed:**
  - headless Chrome and synthetic auth;
  - not Tauri;
  - synthetic `beforeunload`;
  - no StrictMode;
  - reused dependency trees;
  - REL-09: drafts are lost when a scope change remounts App (E12 row k);
  - the inherited Features follow-up 2 transient write is asserted, not removed.

## 8. This review's own checks (no rerun)

`verify-acceptance.mjs` is read-only. It executes no product application code. The one exception is evaluating the pure copy module from the `419e56d` git object, with its types stripped in memory, to compare strings. It ran once as evidence:
- command: `node docs/reviews/web-appearance-recovery-acceptance/verify-acceptance.mjs 419e56d`;
- 2026-10-05T21:31:51Z;
- **228/228 PASS, exit 0**.

The log is `acceptance-checks-419e56d.log`. Re-invoking with the same suffix refuses before writing (exit 1, verified).

**What the checker covers:**
- **A, B:** identity and the contract.
- **C:** product scope.
- **D1–D37:** product static checks, including the copy, the CSS, the Retry all markup, the sign-out step, the slot, the erratum facts and the stylesheet binding.
- **E:** evidence hashes.
- **F:** outcomes parsed from raw logs.
- **N1–N7:** negative and positive controls proving that the hash, tree, copy, CSS-scope, log-parsing, §11 and class-search checks can fail.

**Development smoke runs.** Five development smoke runs (`dev1`–`dev5`) wrote only to the session scratchpad. The first two fixed harness errors in my own checker: settings-shell internal paths; the docs-only commits that interleave the product delta; and the batch-51 hash-entry format. The later ones added the negative controls and D37. No check was weakened.

**Why no targeted rerun was needed.** Every conclusion rests on committed evidence that I re-hashed and whose outcomes I parsed from the raw logs. The carry-over rests on byte-identical JavaScript (§6 item 4). No evidence conflicts or is missing. Nothing was installed, built or served, and the main checkout was not touched.

**Screenshots I opened** (paths in `web-appearance-recovery-native/`):
- `native-419e56d-fixed1-visual-en-768-pet-on-before-5cd63ff-end.png`;
- `…-768-pet-on-all-seven-end.png`;
- `…-en-1440-clean-retry-all-disabled-focused.png`;
- `…-zh-375-partial-pass.png`;
- `…-en-375-topbar-status-tasks.png`;
- `native-419e56d-fixed1-keyboard-en-selring-dark-swatch-1-focused-row.png`;
- `…-popover-light-checked-focused-panel.png`;
- `native-5cd63ff-before1-h6-en-accent-hue-infinity.png`;
- `native-24073b5-fixed1-downstream-crash-accentHue-Infinity-en.png`.

Each matched its log.

## 9. Non-blocking follow-ups

1. **UX-05 (priority): F-APP-3**, the popover option focus (`layout.css:453–463`), together with the tokens roots of F-APP-1/2 (`layout.css` `.slider-row … outline: none`, `.accent-sw.active`) and the duplicate at Appearance `styles.css:116–119`. Update the two guard tests in the same change.
2. **UX-05/SHELL:**
   - the pre-existing 36 px Topbar search and trigger heights above 1024 px;
   - the faint global focus ring (accent at 58% alpha);
   - the AppRail `rail:任务` ring clipped at 375 px;
   - the AvatarMenu still open after the sign-out confirmation.
3. **REL-07 (UX):** a source-only field repaired by another document keeps its Reload-only alert until Reload (E12 observation 2). This is consistent with A6 and comes from the protected engine (`usePrefAsync.ts:149–151`).
4. **Docs:** list `AppearancePane.focus-ring.test.tsx` and `AppearancePane.selected-focus.test.tsx` in `packages/xai-web-settings-appearance/docs/test.md`.
5. **Conditions to carry:**
   - C-FD1 and C-FB002: future Features downstream and More `boundaries` regressions run the corrected copies beside the frozen ones;
   - OE: any regression containing Sol `continuity-export` runs its corrected copy;
   - K-1: future native runners send no `nativeVirtualKeyCode` and audit keys.
6. **Shared-engine note (A4):** this caller is the first device-classified production consumer of the open-ended `usePrefAutosaveAsync` branch. A defect found there later is a shared defect under §11.

## 10. Limitations of this review

- I did not rerun any product test or native run. The carry-over and every fixed result rest on committed logs whose hashes and outcomes I verified, not on live observation.
- I opened nine of the 154 E14–E15 screenshots and the before/after crash captures. The rest are hash-verified only.
- The static checks are pattern- and parser-based. Each has a positive or negative control where vacuity was possible (N1–N7).
- jsdom, headless Chrome and synthetic-account limits are inherited (§7).

## 11. Scope statement

This acceptance covers only the CP-APPEARANCE-01 recovery caller at fixed `419e56d`.
- It closes none of SET-01, SET-02, SHELL-04, SHELL-05, SHELL-06, UX-03, UX-04, UX-05, REL-05, REL-07, REL-09, REL-10, QA-01/03/04/09, D2/REL/AI, or any other 312 item.
- It is not business or release completion.
- It authorizes no deployment, release, branch promotion or Web→Desktop sync. Any Desktop flow needs the ADR-0013 D3 gate.

## 12. Files added by this review

All new, in `docs/reviews/web-appearance-recovery-acceptance/`:

| File | SHA-256 |
| --- | --- |
| `verify-acceptance.mjs` | `07aacf31cd125c979cff7c846b2741ed53f4b33454c4e70adf470054def1223d` |
| `acceptance-checks-419e56d.log` | `7c9902e2ec586b2b4511d46da2e3fe577f0827506c1266b5134705e2abcb6caf` |
| `acceptance-419e56d.md` | this file (cannot carry its own hash) |
