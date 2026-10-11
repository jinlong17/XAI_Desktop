# More recovery caller — independent final acceptance

Date: 2026-10-03. Module: `web`. Reviewer: Claude Opus 5.5, cross-vendor independent final reviewer. **Verdict: ACCEPT — the complete More recovery caller (CP-MORE-01) at `7b216a3`, within the contract's stated scope.**

No product failure was found. This review was read-only: no product, test, verifier, prior evidence, ledger, control-plane, workflow, deployment or release file changed, and no subagents were used. Only this report is committed.

## Fixed source and evidence boundary

- Contract: [`next-more-contract.md`](../web-notifications-recovery-astra/next-more-contract.md). Gate table at lines 106–113, sparse export at lines 80–88, actual host at lines 90–98.
- Before product: `afbfb24d6f7311366b77852eda927d08467478c2`. Fixed product: `7b216a3d5a4947d0f66da042fb275302737fb762`. Prior Astra BLOCKED: `5ac1244`.
- Review HEAD: detached and clean at `0c0ff15e4a7ad37d6dfc7f920c5f1a377fe42a2f`. The isolated worktree was created at `main` (`9a61669`). On controller instruction it was detached to `0c0ff15` before any review step, with nothing committed.
- `git diff --name-only afbfb24 7b216a3 -- apps packages package.json pnpm-lock.yaml` lists exactly More's pane, stylesheet and product test.
  - `7b216a3..HEAD` on the same paths changes only Calendar `canonicalSubscriberHarness.ts`/`setup.ts` and Meditation `setup.ts` test support.
  - The pane blob `cfe10f55…` and stylesheet blob `f11f3fc0…` are identical at `7b216a3` and HEAD.
  - Shared storage, the Settings shell and `apps/web/src/routes` have no `afbfb24..7b216a3` delta.
  - The stylesheet delta is one additive hunk (+34/−0), entirely `.more-pane` / `.more-recovery-*` selectors.
- Ownership and defaults agree with the contract table and the pane (`morePane.tsx:17–19`):
  - `registry.ts:701–835` defines all 15 as schemaVersion 1 entries with the contract's codecs and defaults.
  - `accountOwnership.ts:67–81` declares 13 device keys plus `default_tag`/`default_list` as account keys.
- The `web-more-recovery-evidence` tree `cac7ae22…` is identical at original `c3ab20d` (= `origin/codex/archive/audit-more-b1b2-evidence-c3ab20d`), at the cherry-pick `c0c9ec5` and at HEAD. `0c0ff15` changes only the control plane.

Recomputed SHA-256 values, all matching their receipts:

| Artifact | SHA-256 | Compared with |
| --- | --- | --- |
| `verify-gaps.mjs` | `48c9c868f35913ead021fe9b1ee7c4bf9b532c07bc6efc7ae4791f47f32d24f4` | completion receipt |
| B1 log | `3ef902db56e308146e6f8d23ed35db2c70d90062ede66fd22d0cec586a1bff5a` | completion receipt |
| B2 log | `4717bbaeb77d02c9e5cabe3e0801f6e1d897f31824ada606886da1a336436c84` | completion receipt |
| sparse-reset / locked-device-reset JSON | `f5079a1d387560940c2b258f705880ac3f80edf77c87b713c0ed92fd65b4f5d5` (identical payloads) | completion receipt and B1 log |
| mixed-set-reset JSON | `6263bc9087b81d8705eaf2248bffac7b9727509ed09e31361eb51dba8ea49f5b` | completion receipt and B1 log |
| `native.tsx` fixture | `966cfc812c6a923a00896fd08b348389966fc1004111cd15d9bec9bec4d02077` | completion receipt |
| N2 log / N3 log | `1c66866b4943143138e88dc5aec18ede599d88fe62273fa965c035a48d1e4582` / `14512c1913ef71396759d62d057c4e96e094b5d6c4c4bb9a11fff1d8c2719283` | Astra BLOCKED report |
| `verify-native.mjs` | `6d840e1fcb4fa96ea64cfc5ed8ab17cc77426320150c09c0f74b420244945ce7` | Astra BLOCKED report |

Other evidence also matched:

- N1 (`a0735c68…`), N4 EN (`29b22e9f…`), N4 ZH (`25f4bcd9…`) and the fixed host log (`cc2e2abb…`) match their review files.
- All 17 hashes in the final-regression receipt match their logs.
- The archive lockfile (`df05f2dd…`) equals both the `7b216a3` lockfile and the dependency checkout's lockfile.

## Six contract gates

| Gate | Verdict | Reconciliation (source → before → fixed → surface) |
| --- | --- | --- |
| All15 ordinary fields | **PASS** | **Source:** strict domains (`morePane.tsx:23–33`); 15 `usePrefAutosaveAsync` bindings (:45–59); draft identity established before enqueue (:72–76, :90–94); per-field recovery and source-only Reload (:137); both checkboxes are native `<button aria-pressed>` (:138). **Before:** Sol fields 2 pass / 20 fail; the frozen host baseline loses the device choice and both private latest choices. **Fixed:** Sol fields 22/22; product suite 15/15, keeping MP1–MP10 and both REL-03 tests with only async/`act`/fixture adjustments. **Surface:** N1 drives all 15 controls with trusted input and checks exact device bytes plus private `xai:account:v1:more-native-A:g1:*` keys, then a new-document reload with zero mount writes; N4 adds trusted Space on a checkbox. |
| Full15 Reset | **PASS** | **Source:** a mount-captured scope refuses stale/locked/no-generation resets before any mutation (:109); duplicate batches are suppressed (:110); all 15 typed reset intents are admitted before submission (:112–113); a reset draft displays the registry default (:132); "restored to defaults" requires an unsuperseded batch with no remaining work (:82). **Before:** Sol reset 2/18; host reset assertions escape. **Fixed:** Sol reset 20/20 (all15 removal, absent no-op, per-field refusal/Retry, locked refusal plus fresh reopen, stale A under B with zero mutation, mixed partial failure); both REL-03 invariants kept. **Surface:** N1 removes exactly 15 unique keys (13 + 2) and preserves the unrelated sentinel; N3 and B1 show partial reset with targeted Retry. |
| Mixed set/reset attribution | **PASS** | **Source:** completion acts only on the exact current draft object (:78); a predecessor Retry cannot settle the latest draft (:85, :95–104). **Before:** Sol queues 0/14, boundaries 0/10. **Fixed:** 14/14 and 10/10, with a named case for every item in row 110: both failure directions; repeated failed predecessor; duplicate pending Reset/Retry; reset→edit→reset at default equality; set(default) vs remove; uncertainty with one remove; restored-external-bytes conflict; discard-all then new same-field work. Owner-direction partial success is in the reset and owner/export suites. **Surface:** B2 adds the same-field host ordering. |
| Owner and export | **PASS** | **Source:** private drafts require the live scope (:69). Export reads only in-memory drafts, rechecks permission before the Blob, after the URL, after append and before click, and always removes the anchor and revokes the URL (:115–124). The envelope builder is owner/operation-generic (:118). **Before:** Sol owner/export 1/12; `afbfb24` had no export or guard. **Fixed:** Sol 13/13, covering the all15 held-reset envelope with attempt-level storage denial, blob/url/append invalidation, url/click failure, epoch, unmount and A→B→locked. **Surface (native disk JSON):** N3 provides sparse set, mixed-owner set via the dialog, all15 set and locked device set; B1 provides sparse reset, mixed set+reset and locked device-only reset. |
| Production host/native | **PASS** | **Source:** the guard is forwarded through `morePane.render` (:126, :156). The unchanged coordinator finishes a held intent once, when the guard stops blocking (`departureCoordinator.tsx:97–104, 175–183`). **Before:** frozen host baseline 10 fail / 1 pass (route and signout escape). **Fixed and surface:** frozen host 11/11. N2 covers same-turn first intent, AppRail, relative state, Back/Forward, two-field partial release, Stay/Escape/focus, epoch and unmount. N3 covers held locks, uncertainty and second-document conflict. N4 covers EN/ZH at five widths with no horizontal overflow, hit-tested recovery and dialog actions of at least 44 px, focus wrap and 10 screenshots. B2 covers the production sidebar, history-key identity and same-field exactly-once release. |
| Final regression | **PASS** | Hash-verified logs, each exit 0 from the immutable `7b216a3` archive: Settings-rest 43 files / 300 tests; Web 27/146; Notifications Sol 41 (11 + 30); Astra boundaries 24; Astra host 15; parent host 12; DateTime 7; Settings typecheck/lint, Web check-types/lint and storage check-types. No shared delta requires reopening foundation acceptance. I inspected these logs but did not rerun them; the brief prohibits full matrices. |

## B1/B2 closure

**B1 — closed.**

- **Real disk download:** `verify-gaps.mjs` bundles the fixture from `git archive 7b216a3`, after a lockfile-hash gate (:27–29). Chrome downloads into an isolated directory (:97). The verifier parses the on-disk file and `deepEqual`s the whole envelope (:141–146), so an extra field, wrong owner bucket or invented reset value would fail.
- **Shapes covered (:160–179):**
  - Sparse reset: a partial reset in which only the `win_type` removal is denied, while the 14 sibling removals settle.
  - Mixed set/reset: a failed private `default_tag` set produces a payload with `reset` and `set` in different owner buckets.
  - Locked device-only: `verify.lock()` hides the private draft, and the locked export holds only the device reset.
- **Per-export checks:** every export runs under total storage denial and asserts one created object URL, revocation of that same URL, and removal of the anchor (:149–152).
- **Result:** together with N3, every export shape named in contract line 88 now has native disk evidence.

**B2 — closed.**

- **Sidebar:** trusted CDP mouse events with a hit test (:105–111) target the production `.settings-sidebar .list-row` (`composedSettingsRegistration.tsx:81–99`).
- **History identity:** `deepEqual` on `{path, key, state}` (:188–204).
  - A blocked Back and Stay keep the More key.
  - Discard completes the original POP and restores the Date & Time key; Forward restores the More key.
  - A recreated entry would carry a new key, and a PUSH would have cut off the forward entry, so these assertions prove identity rather than path equality.
- **Same-field ordering:** the predecessor completed while the latest operation was genuinely pending.
  - The hand-built middle lock name equals `prefMutationLockName` (`prefMutation.ts:33–34`). The engine holds that lock exclusively around the write (:153), via `navigator.locks.request` (`accountCoordination.ts:16`).
  - The shared hook runs one request at a time per field and starts `full` only after `tray` settles (`usePrefAsync.ts:169–172, 206–214`).
  - Physical `tray` plus `gapMiddleReady` (:224) therefore proves the predecessor finished while `full` waited behind the middle lock. The reverse order would have timed out.
- **Hold assertions:** location, open dialog and zero history mutations are checked at that point (:225–228). They are checked again after `full` fails through the injected `setItem` fault (:232–235). The fault, not a conflict, caused the failure: the request carries `expectedRaw='tray'` (`usePrefAsync.ts:177`).
- **Release exactly once:** Retrying the latest request persists `full` (:238–251). The run then shows exactly one router location commit, one `pushState`, zero `replaceState` and zero `popstate`, with the dialog closed and no `beforeunload`.

## Control-plane precision notes

1. **`storageUnchanged`: confirmed; non-blocking limitation.**
   - **Mechanism:** the fixture adds to `writes`/`removes` only after the native call succeeds (`native.tsx:34–35`), but records every `getItem` attempt (`native.tsx:36`). Under `denyAll` (`verify-gaps.mjs:166, 172, 178`) the write and remove counters cannot move. `attempts()`/`removeAttempts()` (`native.tsx:52`) are never asserted.
   - **What B1 proves:** zero read attempts on any key during export, and a correct export under total denial. Both are what line 88 requires. It does not prove zero write or remove attempts, so the receipt's "counters were unchanged" is literal but not attempt-level for writes and removes.
   - **Why non-blocking:** "Export never saves" is established separately.
     - In source, `exportDraft` (`morePane.tsx:115–124`) calls no edit, reset, retry, reload or Storage API.
     - Sol owner/export case 1 spies on `getItem`/`setItem`/`removeItem` at attempt level and asserts `not.toHaveBeenCalled()` with all 15 resets held.
2. **Departure-warning claim: confirmed; non-blocking.**
   - **Mechanism:** `warning()` is evaluated once (`verify-gaps.mjs:177`), after the first two exports and the lock, and before the locked export. Its value is not logged, so "export retained the departure warning" overstates B1 alone.
   - **Why non-blocking:** line 88's requirement that export never saves, discards or releases a held route is evidenced elsewhere.
     - N3 asserts the warning after every native export (`verify-native.mjs:334`), and asserts that the dialog export keeps the route and dialog (:403–404).
     - In B1, the reset draft reappears in each later payload.
     - The export source mutates no draft or guard state.
   - **Residual:** there is no native warning check after the final locked export.
3. **"all15" in line 88: non-blocking limitation; the requirement is met as written.**
   - **Text:** line 88 qualifies only "sparse" by operation and lists "all15" without a qualifier. N3 log line 25 is a native disk all15 export (13 device + 2 account).
   - **Line 86's all15 pending-reset rule** is asserted exactly by Sol owner/export case 1, but at the Blob layer rather than on disk.
   - **Native coverage of the parts:** B1 shows reset-entry serialization on disk, and N3 shows the 13/2 owner split. A single generic expression builds every entry (`morePane.tsx:118`).
   - **Not natively observed:** an all15 pending-reset file, or any account-bucket `reset` entry on disk.
   - **Interpretation:** the contract author's own B1 named only the sparse-reset and mixed-operation gaps. Demanding another native file would read in a qualifier the text does not contain.

## Optional bounded reproduction

Each mode ran once with suffix `reviewer-20261003`, `XAI_DEPS_ROOT` set to the main checkout (matching lockfile), and headless Chrome `154.0.8037.97` (the receipt used `153.0.8010.50`).

- Both modes exited 0 with `pass:true` and 0 runtime errors.
- The three B1 JSON files were byte-identical to the committed artifacts.
- B1 log `9fb711c380e8877d9dfd974bb440e3b58375b98e6341ce491eafee6e1638e06d`; B2 log `0fb3b2174554c93237b144e772d53a2b51d9450af36f2cf5724d4b06d5d39477`. They differ from the committed logs only in browser version, artifact names and random location keys.
- All five transient files were deleted before this commit.

## Retained limitations (non-blocking)

- **Test environment:** real headless Chrome with synthetic local accounts and deliberate Storage/Web Lock injection.
  - This is not Tauri execution or production authentication.
  - `signout()` calls the departure preflight directly rather than a live provider logout.
  - Synthetic `beforeunload` dispatch proves the handler exists, not crash durability.
- **Proved at the jsdom caller layer only (Sol, real storage/hook/engine with lock fixtures):** the all15 pending-reset envelope, Blob/URL/append invalidation, url/click setup failure, and export of held operations under total denial.
- **Forward navigation:** exercised only as an unguarded return (N2/B2). Guarded POP departure is exercised through Back, which uses the same blocker path.
- **Responsive reachability:** N4 hit-tests only the recovery and dialog actions at the five widths. Reachability of the 15 controls and Reset Default at those widths rests on zero horizontal overflow and the screenshots. N1 drove every control at a single viewport. N4 is not a full accessibility-conformance audit.
- **Locked refusal wording:** the locked/no-account full-reset refusal reuses the stale-scope text "Account changed. Reopen settings and retry." (`morePane.tsx:109, 140`). The contract prescribes no wording and Sol's oracle accepts this text. The refusal makes zero mutations and claims no restored defaults.
- **Not rerun here:** the Sol, host, N1–N4 and final-regression results were inspected through hash-verified logs, not rerun by this reviewer.
- **Dependency trees:** the archive runners reuse local dependency trees. Lockfile equality is a consistency check, not a supply-chain attestation.

## Scope of this acceptance

**Accepting this caller does NOT close SET-09, REL-03, REL-05, any 312 item, D2/REL/AI, Tasks default consumption, template CRUD, native launch/tray/window behavior, deployment, or release.** It changes no formal counts and no controller state. The ledgers (`ALL-TODO-CURRENT.md`, `EXECUTION.json`, `EXECUTION.md`) and the control plane are untouched; recording this acceptance there is a separate controller step. Sticky remains outside this task. There is no branch promotion, push, Web→Desktop sync, deployment or release.
