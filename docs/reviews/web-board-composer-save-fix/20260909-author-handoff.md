# REL-05 Board card/list composer recovery

Web module. Author implementation `279a7f5`, followed by deletion-conflict correction `dea0af6`. This report covers new-card and new-list composers. Parent explicitly extended the second correction to the previously accepted BoardCreator after detecting the same null-deletion defect. These are separate paths, not automatic closure of the broader Board module.

## Correct failures and implementation

The parent's untouched `docs/reviews/web-board-card-save-recovery/save-contract.test.tsx` verifies quota rejection count>0, unchanged canonical bytes, retained input and visible error. It initially failed because the composer closed. It passes unchanged after these fixes (`original-contract-after.log`). Separately, a fixed885a111 native Chrome run fails the same retained-editor/error business oracle (`native-before.log`, `native-before-results.log`). A failure reproduction is not labelled repair PASS.

New card/list submissions now use a page-local recovery hook with captured account, destination board/list, original raw baseline and stable candidate entity ID. Each failed retry may update the latest title, but reuses that candidate ID. Only successful canonical persistence clears/closes the composer. Failures display a notice with retry, actual JSON export and explicit discard. Opening another composer or cancelling via its original button/Escape while failed cannot silently lose the pending draft; explicit discard resets it. These optional BoardView controls default to the previous behavior for other callers.

The hook checks newer raw data and destination identity before writing. It also checks external deletion before the first attempt: rawnull is accepted only when the source state was genuinely null. A stale nonnull in-memory Board array cannot recreate a deleted canonical key. Parent identified this during source review. Native fixed279a7f5 and fixed885a111 reproduce the deletion defect in composer and BoardCreator respectively (`native-null-before.log`, `creator-null-before.log`); dea0af6 fixes both. Two positive initialization tests retain valid null-storage/null-source creation behavior.

Export contains current editor text, proposal identity and `proposal.baseline` (original bytes), plus `stored` (current bytes at export). These fields are intentionally distinct for conflict recovery. Scope assertion happens before reading/exporting; oldA retry/export after switchingB cannot mutate or export either account's content.

## Validation

- Workspaces package:25files299tests PASS, typecheck and lint exit0 (`tests.log`).
- Board core:21files207tests PASS, typecheck and lint exit0 (`core-tests.log`). Changes after that run affect only workspace hooks/tests; core was unchanged.
- Original parent contract:1PASS unchanged (`original-contract-after.log`).
- Native runner archives the requested Git revision into an isolated source tree and aliases workspace imports to that snapshot, uses temporary Chrome profile/download folders and synthetic account data, and injects native Storage failures on the canonical key only. No real user profile or production service is used.
- Fixeddea0af6 native evidence: card and list quotas retain inputs/raw bytes; multiple rejected attempts reuse the candidate ID; actual disk downloads parse to the latest text and matching stable ID; restored retries persist one entity and close only after success. External updated/deleted raw and account switching are explicitly checked (`native-after.log`, `native-results.log`).
- Separate fixeddea0af6 native BoardCreator deletion check retains the creator/error and leaves the deleted key absent (`creator-null-after.log`, `creator-null-results.log`).

An initial native harness run accidentally compared an initialization write against a failed candidate write. Its failed assertion is retained in `native-harness-initial-attempt.log`; the fixture now resets candidate-attempt capture when it enables quota injection, matching its existing write-count reset. This changes fixture accounting, not the stable-ID oracle or product. The initial `check-types` command had no matching script; the actual package `typecheck` was subsequently executed and is the recorded check.

## Other writeLists calls and limits

writeLists now returns the existing setRawBoards boolean. Existing callers for list color, card/list moves, rename, archive, restore, delete and card detail patch continue their prior behavior; this work does not claim their failure paths are fixed. BoardCreator's partial create/open behavior and TASK02 link command were not rewritten. The only BoardCreator change is the separately reproduced first-submit external-deletion guard.

The baseline comparison is localStorage preflight, not cross-tab atomic CAS; another write between check and mutation remains possible. Recovery is in memory while the module remains mounted. Navigation, account-gate unmount or browser close can discard it; the UI directs retry/export before leaving. No new storage key, cloud sync, unload write, general board editing acceptance or overall REL-05 closure is claimed. Actual file creation is tested; browser/OS failures after anchor click are not acknowledged by this UI.

Status: author work ready for independent verification. Parent will separately reverify composer and BoardCreator deletion boundaries.
