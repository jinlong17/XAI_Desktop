# CP-FEATURES-01 final acceptance at `5cd63ff`: ACCEPTED

- **Date:** 2026-10-04
- **Module:** `web`
- **Control-plane item:** CP-FEATURES-01 (Settings Features: all 8 module toggles and Reset to defaults), batch 32.
- **Reviewer:** Claude Opus 5.5, independent final-acceptance reviewer (Astra-role mapping: risk and final decision). It did not write the selection memo, the contract, any oracle or runner, the implementation, or any E1–E25 evidence, and it shares no context with those instances.
- **Verdict: ACCEPTED.**
  - All eight contract §13 gates reconcile the four required facts: source, a correct before failure, fixed independent behavior and the actual user surface (§2).
  - Every §14 item E1–E25 is present, was added by its expected producing commit and is unchanged since. I recomputed the SHA-256 of all 242 artifacts the E25 receipt enumerates (239 distinct files) from committed blobs, plus at least one principal artifact per item against its primary receipt: 0 mismatches (§4).
  - My own reading of the 11 §11 files finds that the implementation meets §5–§9 (§3). No product failure was found and nothing is frozen.
  - The six controller rulings are all **CONFIRMED** (§5). R-PET is confirmed as non-blocking with a sharpened follow-up record. The E6 package run is confirmed as present in the form of a self-report.

## 1. Fixed boundary

| Item | Value |
| --- | --- |
| Review checkout | Isolated worktree `.claude/worktrees/agent-a3f57a152c58f1e1b`. `git fetch origin codex/web/full-product-audit-20260908`, then `git checkout --detach 78e8de27cdcb72921674bfd25b41c98f19459334`; `git status` clean |
| Fixed product (Terra) | `5cd63ff652f02a2c726187fe12cbc796218d31c0`, tree `404bf819a42e20b3e4d372c18a981832ccd54954`, parent `8d53038` (the commit that recorded E4/E5 and authorized Terra) |
| Before product | `f359be6d838393e0f9e93efd80b88b5b09f6144e`, tree `2280bc7617d52dc6c4356da257d57940ecb174ec` |
| Ancestry and equality | `f359be6` → `5cd63ff` → `78e8de2`. `git diff --name-only 5cd63ff HEAD -- apps packages package.json pnpm-lock.yaml` is empty, so the docs head carries the fixed product unchanged |
| Product diff `f359be6..5cd63ff` | Exactly the 11 contract §11 files, +1590/−72: 4 added (`FeaturesPaneRecovery.test.tsx`, `featuresLockFixture.ts`, `internal/featuresRecovery.ts`, `internal/featuresRecoveryCopy.ts`) and 7 modified (`docs/api.md`, `docs/test.md`, `FeaturesPane.tsx`, `FeaturesPane.test.tsx`, `internal/featuresPane.tsx`, `styles.css`, `types.ts`). The full diff outside `docs/` is the same 11 files |
| Contract and selection | `web-features-recovery-contract/contract.md`, one commit `6ded3dc`, SHA-256 `84b0a9cf035b21a9779567fcfe7d0c22b069bf0209656fbf1b98613bbc32d0f4`. `web-next-caller-selection/selection-f359be6.md`, SHA-256 `ea05a5e4b5741188795bde95b3aadb90594c9c34e79326133f9b5798a3c764d1` |
| Lockfile | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` at `f359be6`, at `5cd63ff` and in the read-only dependency checkout |
| §14 ordering rule | E1–E5 were committed before Terra: `11e0afb` (E1, E2), `b732c27` (E3) and `4c5323f` (E4, E5) are ancestors of `5cd63ff` |
| Evidence immutability | The entire history of `web-features-recovery-{sol,independent,native,f1,final,contract}/` and `web-more-recovery-fb002/` consists of additions only: 324 entries, all `A` (35 + 6 + 100 + 8 + 90 + 1, plus 84 for F-B002). The More, Notifications and Date & Time oracle directories are unchanged since `d7358b9`; the Sticky directories only gained the E16/E24 logs |

## 2. Eight-gate reconciliation (contract §13)

Line numbers refer to `5cd63ff`. "Sol" is `web-features-recovery-sol/`, "host" is `web-features-recovery-independent/`, "native" is `web-features-recovery-native/`, "F1" is `web-features-recovery-f1/` and "final" is `web-features-recovery-final/`. Every before-log line and log total cited here was read by me; the remaining log facts are cited from the named receipts.

| Gate | Source (`5cd63ff`) | Correct before failure (`f359be6`) | Fixed independent behavior | Actual user surface | Verdict |
| --- | --- | --- | --- | --- | --- |
| **1. All 8 toggles** | One `usePrefAutosaveAsync` binding per key, in `featureIdOrder`, with a strict boolean validator and fixed hook order (`featuresRecovery.ts:85–87, 102–109`). A valid edit becomes a draft object before enqueue (`:158–162, 196–205`), and only that exact object settles its field (`:164–182`). A switch inverts the latest intent (`:207–211`). Retry is inert while pending (`:219–220`). Discard detaches first, then calls `meta.reload()` (`:231–239`); Reload refuses while a draft exists (`:244–250`). Source-only fields show Reload only (`FeaturesPane.tsx:201–204`). There is no `SettingsFooter`, raw Storage access or legacy `usePref`/`setPref` | Sol `fields` 0/49 (`fields-before2-f359be6.log` L1248). For example, L1255–1256 H1 "keeps displaying the latest choice … expected true to be false", and L1333–1334 H7 "no 'Saved' claim … expected true to be false". Host F-a 0/8 (switch snaps back; `host-before1-f359be6.log`). Positive controls PASS: `bytes` 17/17 (16 exact values, zero-write mount), `original` 6/6 | Sol `fields` 49/49, `bytes` 17/17 and `original` 6/6, with 0 `PRECONDITION` (E7). Host F-a 8/8 (E8). Features package 45/45 (E21). Covered: per-field H1/H2 ×8, 16 malformed sources, all 8 unresolved, conflict plus unrelated quota, targeted Discard with "Discard never reads or writes a sibling" (`fields.test.tsx:302`), Discard all, truthful Saved, no Save footer | Chrome, production App (E9, `native-5cd63ff-fixed1-controls.log`, 524 checks, 285 product): all 16 values by trusted click with exact bytes after a browser restart; turning a module on stores `"true"`; new-document reload with zero writes; source-only Reload-only states; a valid edit over `TRUE` never overwrites. EN/ZH presentation in E14 | **PASS** |
| **2. Reset to defaults** | Confirmation runs before any intent exists (`featuresRecovery.ts:253–256`), using the normative text (`featuresRecoveryCopy.ts:54, 75`). 8 typed reset intents and one batch identity are admitted synchronously (`:268–289`). Each field runs its own engine `reset()` (`:192`), with no rollback and no broadcast. A duplicate activation enqueues no removal (`:257–267`). A reset draft's Retry never reaches the hook's set path (`:221–222`). "Defaults restored." is set only by the last success of the current batch (`:175–177`) | Sol `reset` 2/31: L733–734 D2 "zero StorageEvents with key === null: expected 1 to be +0"; L740–741 H5 "Tasks was not reset to its default." missing; H7 wording L725–728; REL-07 purge L762–765. Native E4 h5: `H5-a` and `H5-d` are correct FAILs. Host R-route: the failed reset holds nothing (`host-before1-f359be6.log` L117–118). Positive controls PASS: decline makes 0 attempts, accept removes 8 | Sol `reset` 31/31 (E7). Host R-route PASS (E8). F1 `rb` releases only after the second Retry (E17) | Chrome, production App (E10, `native-5cd63ff-fixed1-reset.log`, 219/99). R0: decline makes 0 attempts. R1: 7 removes plus 1 verified no-op, 0 writes. R2/R3: one-key and two-key faults with targeted Retry. R4: uncertainty resolved with one remove. R5: conflict preserved. "Defaults restored." checked per frame; unrelated keys byte-identical ×6; 0 `key:null`, relocks or remounts (L226–227). Keyboard path in E15 | **PASS** |
| **3. Same-field and set/reset attribution** | Exact-draft authority (`:166`). Predecessor recovery never acknowledges the latest (`:183–189, 227–228`). The shared queue and coalescing are unchanged (`usePrefAsync.ts:169–289`; the storage tree is identical) | Sol `queues` 0/40, for example L606–607 H4 "the second activation inverts the latest intent … expected false to be true", and held-lock H3 at L590–605 | Sol `queues` 40/40 (E7): Q1–Q9 on Boards, H3/H4 ×8, O1–O7 on Habits and Matrix (set→reset, reset→set, reset→set→reset, both predecessor directions, equal displayed values, discard→new work) | E9: native held real lock with one write after release, uncertainty with one total write, second-document conflict preserved. E12 row i: the predecessor completes while the latest waits behind the real `prefMutationLockName`, then Retry releases exactly once (POP and PUSH) | **PASS** |
| **4. Device continuity and export** | An epoch change renews only the decision token; drafts are kept (`:126–130`). Live-scope checks refuse old capabilities before rerender (`:143–146`). The export is memory-only, rechecked before setup, after the Blob, after the URL and after append (just before the click), with best-effort cleanup (`:291–324`). The guard is registered per epoch (`:329–343`) | Sol `continuity-export` 3/26: the 3 passing cases are invariants (account isolation, unrelated lock, no export without a draft); 23 correct FAILs | Sol `continuity-export` 26/26 (E7): A→B→locked→A with a held device lock, an admitted reset batch across A→B, old callbacks refusing before and after rerender, shapes 1–6 and 9 in memory, setup failures, and epoch/unmount cancellation | E11 (`native-5cd63ff-fixed1-export.log`, 442/217): all nine §8 shapes as real Chrome downloads under total Storage denial, with zero attempts, one URL created and revoked, the anchor removed, and warning plus guard intact afterwards. Two setup failures show the localized error. I parsed all 10 disk files: each envelope is `{version:1, kind:"features-draft", changes:{device}}` only, and x5 holds 8 `reset` entries | **PASS** |
| **5. Production host/native** | `featuresPane.render` forwards its props (`internal/featuresPane.tsx`). `FeaturesPaneProps` gains only the optional `registerDepartureGuard` (`types.ts`). The guard label is `settings.features` and it blocks only while drafts exist (`:334–338`). `beforeunload` is attached only while drafts exist and reads memory only (`:345–356`). Focus management: `FeaturesPane.tsx:43–57, 188–193`. Host, coordinator and router are unchanged | Host 7/33 (E3): every H8 form leaves. Sidebar at L65–66, sign-out resolves `true` at L81–82, `beforeunload` not prevented at L112–113. Native E4 h10: the 375 px grid overflows the pane in EN and ZH (correct FAIL). F1 E5: `before-not-held` for r1, d1, r2 and rb | Host 40/40 (E8). E12 `native-5cd63ff-fixed1-host.log`: 750 checks, rows a–n, 46 row gates, 0 runtime errors. F1 `features` `fixed-pass` (E17) | E12 in Chrome on the actual ComposedSettings with full Shell (composition confirmed in §5.7). E14: EN/ZH at 375/414/768/1024/1440, every control hit-tested, ≥44×44, contained, overflow fixed (pane 289/289). Selector audit: 13 occurrences, 12 distinct, all `.features-pane`. E15: keyboard. The R-PET observation is confirmed non-blocking (§5.1) | **PASS** |
| **6. Downstream readers and cross-module isolation** | No `StorageEvent`, `dispatchEvent`, `BroadcastChannel`, `postMessage` or `CustomEvent` anywhere in the Features product source (my search). Readers are unchanged (object ids equal) and learn of commits through the engine's same-tab publication (`prefMutation.ts:177, 192, 214, 239`) | Sol `downstream` 9/15: L377–378 "no relock, gate screen or remount … accountScopeChanged: true …". Native E4 h6 `§10.5-during` is a correct FAIL (`AccountDataGate` relock and remount); H6 is confirmed at the hook layer (Sol `reset` case 007). Reader controls PASS at `f359be6`: 17 + 18 (E2), 17/17 (E21) | Sol `downstream` 15/15 and readers 17 + 18 (E7). E18 search: 9 delta rows, all in §11 files. E19 protected paths empty. E20 storage check-types and lifecycle (case 004). E21 readers at both SHAs. E22 web 28/156, including `railFeatureFilter`, the three composition tests, `cmdkIntegration` and `departureCoordinator.blocker` | E13 (`native-5cd63ff-fixed1-downstream.log`, 343/140) in the production App: rail, route and search truth; 12 operations with 0 `key:null`, 0 scope transitions and 0 replaced nodes across 499 frames (L258–259); AppRail drag after a reset keeps the stored order; unrelated keys byte-identical; two documents follow each other, and a failed draft in the second document becomes a preserved conflict | **PASS** |
| **7. F1 regression** | The coordinator is unchanged (`apps` tree identical). The guard re-registers on every draft change with a token that is stable within an epoch (`:329–343`) | E5: Features before state is not held (`f1-f359be6-features-before1.log`, 8 deferred failures). Selfcheck is harness-valid (105) | E16: all 10 frozen F1 invocations PASS with unchanged runner hashes. E17: `fixed-pass`, 102 checks; each of r1, d1, r2 and rb has exactly one live `proceed()` and 0 non-live calls; rb keeps holding after Retry Calendar | Chrome 154 with the production router and coordinator; trusted Back through `Page.navigateToHistoryEntry` | **PASS** |
| **8. Final regression** | Only the 11 §11 files changed. There is no shared delta. All added selectors are under `.features-pane` | n/a (regression row). The `f359be6` controls reproduce every accepted count | E18–E24 PASS (`0056299`); the More `boundaries` row is resolved by F-B002 (§5.3). The selector and shared-delta clauses are not triggered | The host suites mount the production composition, and they pass | **PASS** |

**Acceptance condition.** Every row reconciles all four facts. None of the excluded shortcuts applies:
- the toggles are not converted without Reset (gate 2);
- the unconditional "Saved" footer is gone (D3, `SettingsFooter` has 0 occurrences);
- the `key:null` event is gone (E10/E13: 0 dispatched or delivered);
- recovery ships with host, export and cross-module evidence (E11–E13).

## 3. Independent source review against §5–§9

I read all 11 files at `5cd63ff`, the full `f359be6..5cd63ff` diff, and the shared hook and engine they consume (`usePrefAsync.ts`, `usePrefAutosaveAsync.ts`, `prefMutation.ts`, `accountScope.ts`; all unchanged).

- **§5 interface.** There is exactly one binding per key, with `validate: typeof value === "boolean"` composed with the codec boundary. The pane makes no raw Storage access and no Storage-event dispatch, adds no second persistence effect, no lock layer and no forced rebase. Legacy `usePref`/`setPref` behavior is untouched.
- **§5 items 1–3.** Mount reads only. Absence displays the hook's registry default. Invalid or unreadable sources become `state: "unavailable"` with Reload only (`:369–370`), are excluded from drafts, export, guard and warning, and suppress Saved (`:372–382`). All controls are closure-bound, so no DOM value is submitted.
- **§5 items 4–8.** Identity, operation and session are established before enqueue. Completion authority is object identity. A predecessor's success never acknowledges the latest. A late completion after Discard, Reload or unmount is ignored because `draftsRef` was detached or replaced (`:135–138, 166, 235`). Discard all visits only current drafts. Saved needs a genuine matching success and no draft, pending operation or source issue. This is the same rule as the accepted Sticky caller (`stickyPane.tsx:147, 155, 293` at `f359be6`).
- **§6.** Declining touches nothing: `liveScope()` and `confirm` touch no Storage, and `accountScope.capture()` is an in-memory read. Acceptance admits 8 typed intents. An unresolved reset is adopted by a later batch without rebasing. A refused or invalid source keeps the reset draft without purging. An already-absent key completes through the engine's verified no-op. "Defaults restored." is shown only when the last outstanding success belongs to the current batch and no newer edit or discard cleared that batch.
- **§7.** The 8 keys stay unscoped device keys, and the engine takes no account lock for device keys (`prefMutation.ts:244`). After an epoch change, old guards and inline callbacks refuse even before rerender, and fresh ones protect the surviving drafts. Unmount detaches everything without undoing commits.
- **§8.** The export envelope, filename, sparse entries, the no-empty-download rule, the permission rechecks, the error path and best-effort cleanup all match the contract text.
- **§9.** The guard registers whenever the host provides the hook and blocks only while drafts exist. The `docs/api.md` §5.1 wording says exactly that, which satisfies the §11 wording requirement. `beforeunload` is draft-only and storage-free. CSS is additive only (84/0) and scoped, and the existing rules are byte-unchanged (the fixed file begins with the before file).
- **Wording.** Every §5 normative string matches `featuresRecoveryCopy.ts` exactly in EN and ZH. Per-field buttons show `Retry`/`Discard`/`Reload` with accessible names `Retry <Label>` and so on, as in the accepted Sticky caller. The switch accessible name is unchanged (UX-05 retained).
- **Terra's disclosed open question** (a set still in flight when Reset is accepted, which then fails). The hook blocks the queued reset behind the failed set, so the field reads "<Label> was not reset to its default." Retry re-runs the superseded set, then the queued removal runs. The final bytes are the reset's verified absence. By my source trace, no false Saved or "Defaults restored." can appear on this path, and Discard detaches with zero writes.
  - This follows §5 item 5 ("Retry advances the predecessor without acknowledging the latest") and the accepted More precedent.
  - §6's "Retry … never writes `true`" sits in the "failed remove" context. The implementation does guard that case (`:221–222`), and Sol O6 proves 0 set attempts.
  - The variant is not in the frozen O1–O7 orderings: O1 has the in-flight predecessor succeed, and O4 has the predecessor fail before the reset. **Non-blocking**; see follow-up 2.

## 4. §14 checklist E1–E25: artifact paths and SHA-256

**How I checked.**
- `acceptance-check.mjs` recomputes all 242 entries of `final/hashes-features-final-v1.log` (239 distinct files; E15 repeats E14's two logs, and E20 cites E7's `bytes` log) from `git cat-file blob`. E6 uses `5cd63ff:<path>`.
- Each artifact's last commit and its adding commit must equal the producing commit I assigned independently.
- Each hash is then looked up in the item's primary receipt. For E18–E24 the primary record is the E25 receipt together with its hashes log; the principal checks below use the E25 receipt text alone.
- Result: **0 mismatches, 0 provenance failures, 0 artifacts absent from their primary receipt** (`acceptance-check-accept2-5cd63ff.log` §6).

The table gives one principal artifact per item. I recomputed each and found it in full in the named receipt (log §7).

| ID | Producing commit | Principal artifact (relative to `docs/reviews/`) and SHA-256, recomputed here | Found in | All artifacts of the item |
| --- | --- | --- | --- | --- |
| E1 | `11e0afb` | `web-features-recovery-sol/verify-fixed.mjs` `b5ac75fa1bc5ff65352afb5b598dc7309fb7435aa9ca96518dfd1d7ffb2f2f16`; `fixture.tsx` `f0b5d272695026f8e60df6dd2dbf5889790b3d2e834256259e86bb0432050ef8`. The lockfile gate is recorded in every log (L14–16) | Sol `README.md` | 9/9 |
| E2 | `11e0afb` | `web-features-recovery-sol/fields-before2-f359be6.log` `fe4b248b7d4499ea6128c23d86fef2b4c2bee1f38cd74338508e7ec10815214c`; `downstream-before2-f359be6.log` `9edea2867023e070049dc9de2c704868f2791a5250bbf2051a2e619abad55589` | Sol `README.md` | 15/15 |
| E3 | `b732c27` | `web-features-recovery-independent/host-before1-f359be6.log` `977fc6565d5a18973473d3cd551d78eeb0213676732645fde2af5afa7dd098c0` | host `before-f359be6.md` | 4/4 |
| E4 | `4c5323f` | `web-features-recovery-native/native-f359be6-before1-h6.log` `579bf9811810b4b2163db39346e637dec59811a257aa31467976f38e53dd4efc`; `native-f359be6-before1-h10-375-zh.png` `6b59000f2421ad076fea878cc4be0e9e86c99f70b15d505f7ee70a34e0b94c15` | native `before-f359be6.md` | 18/18 |
| E5 | `4c5323f` | `web-features-recovery-f1/f1-f359be6-features-before1.log` `59f9761abbaccc18c44464779034aa9d6ff0d6ce89bc89d4457a825f127db98e` | F1 `before-f359be6.md` | 5/5 |
| E6 | `5cd63ff` | `packages/xai-web-settings-features-panel/src/internal/featuresRecovery.ts` `0e73fadd1cb941ca8f26e86a38c493fe9da94a278c335798a92accbff5f74e6f`, plus the other 10 §11 files (log §3). The commit object `git cat-file commit 5cd63ff` has SHA-256 `4f3df9954b0de2833fe1e07dbf28a0252450f7873f4eae28dac9899fe9cee1a3`; its message carries Terra's package run (§5.5) | E25 receipt (full); E7 receipt (8-hex for 5 files) | 11/11 |
| E7 | `eb37a59` | `web-features-recovery-sol/reset-fixed1-5cd63ff.log` `921b37e892573b23f34ffd5680b9d0e3a8371f1d66880bb7ae94098c23526b39` | Sol `fixed-5cd63ff.md` | 10/10 |
| E8 | `eb37a59` | `web-features-recovery-independent/host-fixed1-5cd63ff.log` `244f7dd7498ba49c6f466d030380581ae0db903876c7be02ef03a77294117f80` | host `fixed-5cd63ff.md` | 2/2 |
| E9 | `58a93ef` | `web-features-recovery-native/native-5cd63ff-fixed1-controls.log` `8330678fb3b657762a63a3039dcdba428a0d58c3e61996fae88c9fba66247848` | `review-controls-reset-export-5cd63ff.md` | 6/6 |
| E10 | `58a93ef` | `native-5cd63ff-fixed1-reset.log` `1fd92c92022cf520cc38f2ee04b8925801ae65a2115701645d41c0feaf334eba` | same | 1/1 |
| E11 | `58a93ef` | `native-5cd63ff-fixed1-export-x5-all-eight-pending-resets-features-draft.json` `ad6554f8d0dd15b83e8f4a32ae5f5cedfef757aee3d7d4995366ab48997679fd` | same | 11/11 |
| E12 | `312b27c` | `native-5cd63ff-fixed1-host.log` `f025b831b432df2c31a6c295560d25923705f30e21332eb8e792e023f5c9cb0d` | `review-host-downstream-5cd63ff.md` | 6/6 |
| E13 | `312b27c` | `native-5cd63ff-fixed1-downstream.log` `fefe8af14dfec7bb906404a329de3c0ec4bea806c20f9e34eaabe53f9f748fd6` | same | 3/3 |
| E14 | `5905e37` | `native-5cd63ff-v2-visual-zh.log` `663d8916ea41fe13b5dde42d6c49822c01ae4f2508f7139e1b86ad5740b38ee9`; `native-5cd63ff-v2-visual-zh-768-pet-on-clean.png` `bc54641a97ca69886db868724bf4f458caa6913bf331658259ef17e855843340`. All 24 v2 PNGs equal their log `screenshot` records (12 + 12) | `review-visual-keyboard-5cd63ff.md`; ZH v2 log | 29/29 plus 26/26 superseded v1 |
| E15 | `5905e37` | `native-5cd63ff-v2-visual.log` `b7b7e7c9b9494ce982fc4670ebe1cd41e8e9b60ec8501949e11fe772c5d6df43` | `review-visual-keyboard-5cd63ff.md` | 2/2 |
| E16 | `eb37a59` | `web-sticky-recovery-f1/f1-5cd63ff-race-fixed1.log` `dfed2d12257a4d7473766778c01f8cb9beb3b44e80620e5e0308d1adf036e0d5`; `f1-5cd63ff-sticky-fixed1.log` `433e56ae89d7994ce5c686f3f88c1c59ed37b9e2bd8396db222658bdece1862b` | F1 `fixed-5cd63ff.md` | 10/10 |
| E17 | `eb37a59` | `web-features-recovery-f1/f1-5cd63ff-features-fixed1.log` `5bdbb3d9a2ebf45337dd3cc2eec38e1f6895116b078b4d848359ca38d5b21215` | F1 `fixed-5cd63ff.md` | 3/3 |
| E18 | `0056299` | `web-features-recovery-final/search-features-final-v1-5cd63ff.log` `57dc6adba1565d837f39c789920c13228a148e94f0b2d792cb83890d02f1fd9c` | E25 receipt | 2/2 |
| E19 | `0056299` | `protected-diff-features-final-v1-5cd63ff.log` `0175c76f6446c5abde699a02bfcab7c5c754c03ce3785a73f3438e5341d3f388` | E25 receipt | 1/1 |
| E20 | `0056299` | `storage-check-types-features-final-v1-5cd63ff.log` `df76f1e83868c79cccf3e9f0fb1fd5d0c7790466d9037d5cd89747ab3e13baf2`; `web-features-recovery-sol/bytes-features-final-v1-5cd63ff.log` `0d2f23da630919de1c167434c356b1b5d6fbb2c9ec9f31efbf9c2b0171099012` | E25 receipt | 4/4 |
| E21 | `0056299` | `features-test-features-final-v1-5cd63ff.log` `9064c0690e9147c3e694043feb19294379c420c93bda641a045820364b7cb398`; before control `features-readers-features-final-v1-f359be6.log` `1d44db6b9b928e96b682aa1d9432d7d260278060522fbb7e68d66cd319135e8b` | E25 receipt | 9/9 |
| E22 | `0056299` | `web-test-features-final-v1-5cd63ff.log` `c70646978dad479295ed334c0269c5b2d0b42828966a68ccd34b803ab4cc716c` | E25 receipt | 6/6 |
| E23 | `0056299` | `settings-shell-test-features-final-v1-5cd63ff.log` `c684b28662db1e7478f8eac01c432888effe087eaec1342beed09526066e179f` | E25 receipt | 2/2 |
| E24 | `0056299` | `settings-rest-test-features-final-v1-5cd63ff.log` `cf265ad048948e13b2e5cab9fccbcedf3a680cbbb35996c19ee9d60cf9bc4288`; `compare-accepted-features-final-v1.log` `2a451804edab8d6e6ca4e835103eab6d2f33450e9bf187632dafb5d8b00e557c` | E25 receipt | 47/47 |
| E25 | `0056299` | `web-features-recovery-final/review-final-regressions-5cd63ff.md` `eab9c343f4ab0198c506d0d77bc956cbe905898324a6494fd603a4840b3a9f40` (equals the control plane's `eab9c343…`); `hashes-features-final-v1.log` `9b5b6230db8580595d29a85154dec5aba4b4a966cb4a91c50167daebecdfee15` | E25 §10 | Its §7 table lists E1–E24 (24/24) |

**Content assertions** (log §10, all PASS):
- **Sol before2 totals** equal the E2 receipt: 17/0, 0/49, 2/29, 0/40, 3/23, 9/6, 6/0, 17/0 and 18/0, with 0 `PRECONDITION:` lines.
- **Sol fixed1:** every mode passes, with 0 preconditions.
- **Host:** 7/33 before and 40/40 fixed.
- **Native before:** the h5, h6 and h10 requirement failures are exactly the correct FAILs.
- **Native fixed:** each log ends `pass:true`, with 0 `"pass":false` records and 0 runtime errors.
- **F1:** E16 is 10/10 PASS with no `Invalid blocker state transition`; E17 is `fixed-pass`.
- **E21–E24:** totals as receipted.

No ID is absent, so no later item stands in for an earlier one.

## 5. Rulings

### 5.1 R-PET: **CONFIRMED** (non-blocking), with a sharpened record

**Facts I verified** (log §12; screenshots #12, #23 and #24 viewed):
- **The pet.** At 768×1024 the default DesktopPet box is 660–732 × 916–988.
- **`5cd63ff` EN.** The "Reset to defaults" button spans 576.45–717. Its center hit lands on `reset`, and 2 of 5 points land on the pet.
- **`5cd63ff` ZH.** "恢复默认" spans 633–717. Its center hit lands on `pet:ellipse`, and 3 of 5 points land on the pet; about 27 px on the left stay free.
- **`f359be6`.** The inert "Save & apply"/"保存生效" was covered in both languages, and Reset was free.
- **Other widths.** There is no pet coverage at 375, 414, 1024 or 1440 in either product or language.

**Why I confirm.**
1. The occluder is the protected App-level overlay. `xai-web-pet` and `apps` have identical object ids (my check), and §11 forbids touching them.
2. §10 item 5 treats the pet as an unrelated module whose id and position must not change. The accepted Sticky and Features E12 compositions mount without it. "Not covered" is therefore judged against the caller's own composition, which, as in the accepted Sticky dialog ruling, includes the host overlays the caller owns.
3. The occlusion band is created by the pet's default placement. It covers whatever right-aligned control ends the scroll range at 768×1024; at `f359be6` that was the footer's primary action. A pane-local evasion cannot satisfy an oracle about the pet's placement.
4. Reset stays operable:
   - by keyboard (E15: Enter and Space on Reset each open the confirmation exactly once);
   - by pointer, through the EN center and the free left edge of the ZH button;
   - by dragging the pet, or by using the rail pet toggle, which is visible at 768.

   Reset also never acts without a confirmation.

**Not minimized.** D3's right alignment moved a *functional* control into a band that previously covered only an inert one. This is a real, user-visible defect at a common tablet viewport. Keep the frozen reproduction (E14 receipt §10; screenshots #11, #12, #23, #24; the v2 log observation lines) and append it under UX-03 and SHELL-05. The impact beyond 768×1024 is uninvestigated.

**Optional mitigation.** If the controller wants a mitigation before UX-03 is scheduled, a `.features-pane`-scoped change inside §11 is possible, for example bottom clearance or left-aligning the reset row. It would mitigate this instance only, not the class, and this acceptance does not require it.

### 5.2 Batch 30 runner substitution: **CONFIRMED**

- **Why the old runners could not be used.**
  - `web-more-recovery-sol/verify-fixed.mjs` L15–27 and `web-notifications-recovery-astra/verify-fixed.mjs` L4 symlink `node_modules` from their own checkout root. They have no lockfile gate and no module guard.
  - In a fresh worktree they would need an install, which was forbidden, and they would still not pin `@repo`.
- **The re-hosting runner keeps the old semantics.** `final/verify-callers.mjs` (`7e1aa8b2…`) keeps each suite's copies, include, `setupFiles` (the settings-rest setup, or none for the host suites), react and router aliasing (L71–117), root = archive, jsdom and globals (L169–177). It also asserts that config in a harness check (L379–382), and it adds the lockfile gate, exact aliases and the pin guard.
- **The oracles are unchanged.** `git diff --name-status d7358b9 HEAD` shows no change to any More, Notifications or Date & Time oracle or helper.
- **The counts reproduce.** The `f359be6` controls reproduce every accepted count and console-block count (`compare-accepted-features-final-v1.log` §C); its only 2 DIFFs are F-B002.
- **Residual.** The re-hosting is not a byte-identical reproduction of the old environment. It can only tighten provenance, never loosen it.

### 5.3 E24 More under F-B002: **CONFIRMED**

- **The mechanism is real.** `accountScope.physicalKey()` reads `localStorage.getItem("<prefix>deleted")` for account keys (`accountScope.ts:66–71`). The frozen case-002 spy evaluates `physical(unavailable)` inside itself, so it re-enters without bound.
- **The defect is unrelated to Features.**
  - More, settings-rest and storage are identical at `f359be6` and `5cd63ff` (my object-id check).
  - The More Sol oracle mounts the More pane alone.
  - All other More suites MATCH: fields 22, reset 20, queues 14, owner-export 13, original 15 and host 11.
- **The corrected oracle is a minimal, deterministic fix.**
  - It differs from the frozen file only on L18–19 (my line diff). The frozen oracle and fixture are unchanged (`dcbaf57e…`, `b117d204…`), and all 83 batch-31 files recompute to their receipt values.
  - Recomputed by me from the 72 committed run logs:
    - full file: 10/10 runs all-pass at each of `7b216a3`, `f359be6` and `5cd63ff`, with 0 RangeErrors;
    - case 002 alone: 3/3 at each SHA;
    - at `afbfb24`: case 002 fails on the business assertion `expected null to be 'invalid-bool'` in 13/13 runs.
- **My own rerun** at `5cd63ff` gave 10/10 with case 002 PASSED and 0 RangeErrors (§7).
- **Conclusion.** The accepted count of 79 holds deterministically under the corrected oracle, and the frozen oracle's nondeterminism is an oracle defect.
- **Condition carried forward (C-FB002).** Future More `boundaries` regressions run the corrected oracle beside the frozen original.

### 5.4 Controller decisions 2 (D3) and 4 (focus targets): **both CONFIRMED**

**D3 is implemented exactly as specified.**
- Features renders no `SettingsFooter`: 0 occurrences in the product source.
- Reset is a Features-local button with the same label, `data-testid="features-reset-defaults"` and at least 44×44 (E14: EN 140.55×44, ZH 84×44).
- The confirmation text is the §5 text in EN and ZH, and each field reports its own result.
- `SettingsFooter`, `confirmAction` and `resetAllPrefs` are untouched: the settings-shell tree is identical and E23 passes 54/54. Appearance keeps the footer (its tree is identical).

**Why D3 is right.**
- The pane autosaves.
- The footer's "Saved" was unconditional, and its confirmation falsely claimed that theme and layout would be cleared. Both were H7, confirmed at `f359be6`.
- The accepted More and Sticky callers have no Save footer either.
- Its one side effect is R-PET (§5.1).

**The focus targets.**
- **What the contract requires (§9):** the field's switch after a keyboard Discard or Reload, and focus inside `.features-pane`, never `<body>`, after Discard all.
- **Where the source puts it:**
  - Discard and Reload focus the switch (`FeaturesPane.tsx:46–53`);
  - a block that unmounts while focused returns focus to the switch (`:188–193`), which covers a successful Retry;
  - Discard all focuses Reset (`:54–57`), the next control in DOM order and inside the pane.
- **What E15 verified** (EN 1024 and ZH 375):
  - Discard, Reload (with and without repair) and a successful Retry each leave focus on the switch;
  - a failing Retry keeps focus on Retry;
  - Discard all leaves a visible focus on Reset, inside the pane.
- **Why Reset is a sound target.** Activating it only opens a confirmation.

### 5.5 E6 form: **CONFIRMED** (E6 is present, as a self-report)

- **What E6 requires:** the fixed SHA, a §11-only diff, and Terra's package run.
- **What I re-derived:** the first two (§1, log §3).
- **Where the package run is recorded.** It is in the `5cd63ff` commit message ("Tests: features package 45/45 … @repo/web 156/156 …"). That message is content-addressed by the commit id, and the raw commit object's SHA-256 is `4f3df995…`, so the record has an immutable path and hash.
- **Why that form is acceptable.**
  - Batch 25 limited Terra to the §11 files (control plane "允许修改文件（已执行）"), so a log under `docs/` was not permitted. The commit message was the only permitted channel.
  - It is an author self-report and not independent. E6's role, however, is the author's self-check, and the independent E21 (45/45 from the fixed archive, per-file counts equal) corroborates its content.
  - E6 is therefore not missing, and nothing later is substituting for it.

### 5.6 E14 receipt §12 item 3 (status after keyboard Discard all): **CONFIRMED** (matches §5 item 7)

- **The state at that moment.** At EN L1098 and ZH L1097 there are zero mutations and zero recovery blocks. All 8 displayed values equal the stored bytes (my check), and focus is on Reset.
- **The last completed operation** in that mount was the keyboard Retry of Boards, a genuine success of its field's latest intent. Only discards followed, and they are not operations.
- **Source.**
  - The outcome is set only by a matching exact-draft success (`featuresRecovery.ts:164–182`), and new edits and resets clear it.
  - The status is suppressed while any draft, pending operation or source issue exists (`:372–382`).
  - These are the accepted Sticky semantics.
- **The claim is literally true:** every displayed value is saved.
- **UX note (non-blocking, UX-04).** The line *appears* at the moment of Discard all, because it was suppressed while drafts existed, so a reader may associate it with the discard. E10 R5 shows the same pattern (`native-5cd63ff-fixed1-reset.log` L219).

### 5.7 Additional confirmations requested by the control plane

- **E11 composition: CONFIRMED.** E11 ran in the Settings host composition. `AccountDataGate.tsx:99` keys the business subtree by `kind:accountId:generation:epoch`, so any scope change unmounts the pane in the production App. §8 shapes 7 and 8 (and §7 "Survival while mounted") cannot occur there.
- **E12 composition: CONFIRMED.** E12 also ran in the Settings host composition, for the same reason: row k cannot occur in the production App.
  - §9 asks for the "actual composition, full Shell". E12 meets that with the production Shell, the production rail-filter derivation, the production ComposedSettings, coordinator and router, and the real `accountScope`.
  - Production-App readers, the real module route and the pet are covered by E13; E9 and E10 also ran in the production App.
  - In-memory drafts are lost when an account change remounts the pane. That is REL-09, excluded by §7 and §16.

## 6. Exclusions, retained limitations and protected paths

- **Protected paths (my check).** All 13 contract §10 item 8 paths have identical object ids at `f359be6` and `5cd63ff`, among them storage, settings-shell, shell, pet, cmdk, tokens, appearance, settings-rest, the dashboards, `apps`, `package.json` and `pnpm-lock.yaml`. All 16 Features-package files outside §11 are identical, including `src/index.ts`, `featureIds.ts`, the four reader files, `FeatureThumb.tsx`, `package.json`, the configs, `docs/design.md`, `docs/dev_log.md` and `docs/verify-report.md`.
- **§16 exclusions are respected.**
  - There is no SET-03 change: catalog, disable rules, landing page, CmdK refresh and AppRail pruning are untouched.
  - Appearance, `App.tsx` and Topbar are untouched, as are `Toggle`, `SettingsFooter` and `resetAllPrefs`.
  - The switch accessible-name copy is unchanged (`FeaturesPane.tsx:138`).
  - Malformed bytes are deliberately not repaired: Reset refuses invalid sources and does not purge them (Sol `reset` 020/021; E9).
  - There are no global reset, migration, deletion, data-export, D2, Tauri or production-auth changes, and nothing is claimed for REL-09.
- **§15 retained limitations** are disclosed in every receipt: headless Chrome, synthetic accounts, not Tauri, synthetic `beforeunload`, the direct sign-out preflight, a development build without StrictMode, reused dependency trees and script clicks in race windows.

## 7. This review's own checks and its single rerun

**Commands.** All were run from the worktree root. `XAI_DEPS_ROOT` is the main checkout, used read-only; nothing was installed, built or written there.

```sh
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-acceptance/acceptance-check.mjs accept2        # exit 0, 322 checks, 0 failures
TMPDIR=<session scratchpad>/tmp XAI_FB002_OUTPUT_DIR=$PWD/docs/reviews/web-features-recovery-acceptance \
  XAI_DEPS_ROOT=$D node docs/reviews/web-more-recovery-fb002/verify-fb002.mjs 5cd63ff corrected full accept1   # exit 0, 10/10
```

**`acceptance-check.mjs`** is new and read-only. It runs no product code and calls git only inside this worktree. It checks:
- fixed points and the lockfile gate;
- the §14 ordering;
- E6, through the §11 diff, hashes, the types and registration deltas, and the CSS scope;
- E19, through object ids;
- E18, through `git grep` delta rows at both SHAs, plus extra zero-mechanism searches;
- every E-artifact hash, with its provenance and primary-receipt presence;
- PNG and JSON integrity;
- log contents;
- F-B002;
- the ruling facts.

The log records the runner's own SHA-256 (`7b3665f0…`).

**The rerun** reuses the batch-31 runner (`d2150cd4…`) unchanged. It has a lockfile gate, records all four lockfile values, pins `@repo` with a guard (0 unaliased), and records the corrected oracle `2e88c1db…` and the frozen fixture `b117d204…`. Its result is 10/10 with 0 RangeErrors, at a load average of about 3.2–3.7.
- The runner's fixed header says "(redirected; not evidence)" for any redirected run. That label refers to batch-31 evidence: this log is this acceptance's own rerun.
- `find -newer` on a pre-run marker found no change in the dependency root's `node_modules` (depth 2), any `packages/*/node_modules` (depth 3) or `apps/web/node_modules`. The temporary archive was removed.

**Dry runs and supersession.**
- Two dry runs of the check script wrote only to the session scratchpad. The first exposed my own parser treating the `@media` prelude as a selector, and I fixed the parser.
- A first in-directory run, `accept1`, also passed (322 checks). I moved it to the scratchpad and did not commit it, because it lacked the runner-hash header line. Its SHA-256 is `9b9239e259f3b1db531fb3d3d22b27d6d3a91a892aaaa1cace31333d4b3312a3`.

**Files added by this review** (the receipt's own hash is reported in the hand-back):

| File | SHA-256 |
| --- | --- |
| `acceptance-check.mjs` | `7b3665f00fd7372c3849025b89a51eec1e60ebd25e0860bd811e8ee6b7a64e64` |
| `acceptance-check-accept2-5cd63ff.log` | `ace027d147b635e578e6ed2c6489c537f65ef35cac736e7f345145ffb1b5d8a1` |
| `corrected-full-accept1-5cd63ff.log` | `09dbc1ccfb23fac71d7a1c801f0a95e6952d4457fbef7441a8be504f25d3b4bf` |
| `acceptance-5cd63ff.md` | this receipt |

## 8. Non-blocking follow-ups

1. **R-PET to UX-03/SHELL-05.** Append the frozen 768×1024 reproduction with its caller-induced aspect (D3 moved Reset into the band). The proposed oracle is that the default-position pet covers no interactive control's center, or that scroll ranges reserve a pet safe area. An interim `.features-pane`-scoped mitigation is optional.
2. **In-flight predecessor set + Reset + predecessor failure** (Terra's open question). The behavior is conformant, but Retry re-writes the superseded set value before the removal, which is a transient write and a possible rail flicker. Add this ordering to the regression oracles. Consider a future design that re-issues `reset()` to supersede the failed predecessor, if the controller wants a removal-only recovery here.
3. **Status after Discard or Discard all** can re-surface an earlier "Features settings saved." (§5.6). UX-04 may clear or rephrase it on discard; this applies equally to the accepted Sticky caller.
4. **More `boundaries`:** run the corrected oracle beside the frozen one in future regressions (C-FB002).
5. **Process.** Give the implementer a designated evidence path for its own package run, or have the controller capture it, so that E6-style items become log artifacts.
6. **Stale test title.** AC-PANE-6's title still names `SettingsFooter`; Terra disclosed this.
7. **Demo scope** is not separately exercised for Reset. The device path is independent of scope kind (`prefMutation.ts:244`, `usePrefAsync.ts:98`), and the stricter locked case is covered (Sol `reset` 026).
8. **Pre-existing visual items** (the Toggle shape, thumbnail cropping, the Meditation artwork, a departure dialog without a backdrop) and the English "on/off" in ZH switch names (UX-05) remain open, as the receipts record.

## 9. Limitations of this review

- **What I re-executed.** I re-executed no native, Chrome, visual, F1 or package suite. E4 and E9–E17 are verified through committed-log content, hashes and receipts, not reruns. My only execution was the single jsdom rerun in §7.
- **What hashes prove.** They prove the integrity and provenance of committed artifacts, not that each run happened as described. That rests on the independent producing verifiers.
- **Screenshots.** I opened three (EN and ZH 768 pet-on fixed, ZH 768 pet-on before). The other 45 were hash-checked only, against their log records.
- **Source review.** It is careful reading, not a formal proof. Behavior outside the frozen oracles (follow-up 2) is judged by tracing the code.
- **The rerun** is one run under one load. It corroborates F-B002's resolution; it does not guarantee determinism.
- **Retained exclusions.** The contract §15 exclusions apply unchanged.

## 10. Scope statement

- **What this acceptance covers.** It covers only the CP-FEATURES-01 recovery caller: the Settings Features pane's 8 module toggles and Reset to defaults, at `5cd63ff`.
- **What it closes: nothing in the ledger.** It does not close SET-03, REL-05, REL-07, REL-09, REL-10, UX-03, UX-04, UX-05, SHELL-02, SHELL-03, SHELL-05, QA-01/03/04/09, D2/REL/AI or any other 312 item. It is not business or release completion, and it changes no formal count.
- **What it authorizes: nothing beyond the verdict.** It authorizes no deployment, release, branch promotion or Web→Desktop sync. Any Desktop flow needs the ADR-0013 D3 gate.
- **What this review changed.** It changed no product file, test, runner, oracle, existing evidence, contract, ledger or control-plane file. It adds only the four files listed in §7. Nothing was pushed, merged, rebased or branched, and no sub-agent was spawned.
