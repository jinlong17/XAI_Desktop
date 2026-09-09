# REL-05 Dashboard header note recovery

Module: Web. Product scope is DashHeader note content and horizontal note position only. The note remains account-owned; position remains device-local. Shared usePrefAutosave is reused without modification. No grid/widget save-path completion is claimed.

## Diagnosis and correct before oracle

Fixed `88108ed`: actual DashHeader in isolated native Chrome receives text input, then Storage.prototype.setItem throws QuotaExceededError only for the captured account note key. The original persisted note remains, but the editor closes and there is no unsaved indication, retry or export. `20260909-before.log` is a deliberate failing business oracle, not a repair PASS. The runner freezes all25 loaded product source files via git show and loads the real Dashboard stylesheet with its module wrapper.

## Implementation `8eb163d`

Both autosave results are consumed. Failed note save/clear retains the editor and its latest text. Recovery actions retry the current text and failed position, or export current text and position as JSON. Successful note persistence is checked before closing its editor. Content is normalized under the existing120-character contract on save; the export retains current editor text.

A captured account handle and captured raw baselines guard subsequent submission/retry. If the saved raw bytes changed, keep the draft and explain the conflict rather than overwrite them. Old-account callbacks cannot retry or export into the next account. Existing successful raw values update the local baseline; a failed save never adopts another writer's data. These are best-effort localStorage preflight comparisons, not a cross-tab atomic CAS protocol: an external write between preflight and effect remains outside this fix's guarantee.

The unsaved notice explicitly says the draft only stays on this page. A dirty editor or save failure registers beforeunload; cleanup removes the listener. This is a browser navigation warning, subject to browser policy, not durable recovery: SPA unmount, force quit and rejected browser prompts can lose the in-memory draft. Export/retry is the recovery path before leaving. No additional storage key or unload-time write is introduced.

## Verification

- Full package:22files196tests PASS; check-types and lint exit0 (`20260909-tests.log`). Four new recovery tests cover latest text retry, dirty navigation warning, failed clear, account/raw conflicts, latest position retry and newer device position preservation.
- Existing fixture baseline: the unchanged4 suites from fixed88108ed were copied to an isolated temporary package and executed with installed workspace dependencies. They reproduce8FAIL/22PASS (`20260909-existing-fixture-before.log`): locked account assumptions and raw account-key assertions. Test-only setup now activates a synthetic account, and assertions resolve physical account keys. Business expectations remain unchanged. These are fixture repairs, not widget product fixes.
- Fixed8eb163d nativeChrome66601: original failure oracle nowPASS; latest note exports/retries, external newer raw is preserved with the dirty editor, and oldA retry/export after activatingB cannot change either account's saved data. Original and after logs retain build warnings about import.meta/IIFE development flags.
- Fixed8eb163d nativeChrome66911: actual native anchor download is directed by CDP into a temporary downloads directory. Exactly one `dashboard-note-draft.json` is read from disk, parsed, and checked for `note:"Latest note"` and `noteOffset:0`. A synthetic createObjectURL failure first verifies explicit export failure feedback; after restoring the native function the real download succeeds (`20260909-download-after.log`). No real user Downloads directory/profile or production service is used. Browser/OS failures occurring after a successful anchor click lack an application acknowledgement and are not covered by the preparation-failure test.

## Handoff

Author implementation and evidence are ready for independent verification. This is not independent acceptance, overall Dashboard completion, REL-05 closure, cross-tab transaction safety, or production acceptance. Position quota/conflict coverage is component-level; native evidence focuses on note text recovery and actual file export.
