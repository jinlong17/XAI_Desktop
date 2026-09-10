# Dashboard focus note — bounded async account-caller contract

Astra, Web, 2026-09-09. Read-only implementation/acceptance handoff for Terra. Inputs: [a82efa0 shared contract](../web-d2-async-pref-contract/contract.md), [next callers](../web-d2-async-pref-contract/next-callers.md), actual `packages/xai-web-dashboard-grid/src/DashHeader.tsx`, its current `DashHeader.test.tsx` and four `DashHeader.recovery.test.tsx` cases, and parent [9557005 baseline](../web-d2-dashboard-note-independent/review.md). Those two failures were independently executed by the parent against `fa4b306`; this document does not claim a new runtime execution.

**Prepare this caller implementation, but do not declare it ready until the shared hooks' six failures are fixed and independently accepted, and the dynamic binding is independently accepted.** Engine `6504589` already has [bounded acceptance](../web-d2-async-pref-astra-engine/review-6504589.md). Registered hooks `d6184ee` currently have [six independent failures](../web-d2-async-pref-astra-hooks/review.md); a green engine or native subset does not waive them. Dynamic overload `69c8318` is a fixed API reference, not an accepted dependency yet. This task writes only the contract; it implements nothing and changes no ledger.

## Scope and unchanged business behavior

| Data / capability | Scope for this caller batch |
| --- | --- |
| `dashboard_header_note` → `xai_pref_dashboard_header_note` | **Account** content. Move the actual note Save/Clear/Retry flow from sync autosave to the explicit async dynamic hook. Account marker, owner, raw baseline and account→physical-key locks apply. |
| `dashboard_header_note_x` → `xai_pref_dashboard_header_note_x` | **Device** position, JSON number. Keep the existing writer/protocol and drag/clamp/recovery behavior. Do not make it an account preference or claim it is fully converted. |
| Greeting/date/Add-widget/grid layout | Preserve existing UI and callbacks; no feature work. |

Authority for the two ownership classes is `plugin-web-storage/src/internal/accountOwnership.ts:46–47`. The parent explicitly approved splitting this first account-content batch from the device-position migration. Legacy offset autosave currently writes `0` on an absent mount; that behavior is a named later item. **The no-mount-write assertion here applies to the account note key.** Do not weaken the parent account-key assertion or market the result as “all DashHeader mount writes removed.” Device conversion and its default policy stay on the caller checklist for a later batch.

The note is currently an explicit editor: typing changes a local draft, and Save button, Enter and blur submit it. Do not turn input `onChange` into persistence just because the shared helper is named autosave. Keep whitespace collapsing/trimming and the existing 120-character `slice`/input-limit behavior at explicit submission. Read existing strings without a mount normalization/write. Empty string is a valid saved note; physical absence is a distinct initial state.

**Clear saves `""`; it does not call the new hook's physical-remove `reset()`.** The existing recovery test explicitly checks empty-string bytes after retry. There is no new Reset Note or global reset product action in this batch. Escape remains cancellation of an unsubmitted edit when there is no pending/failed/conflicted save; it must not quietly close an active save or failed recovery session.

## Fixed dynamic API contract

Sol confirmed and fixed this overload in `69c8318`; use its accepted successor with the same declared binding contract:

```ts
usePrefAutosaveAsync<T>(suffix, {
  codec: "string" | "number" | "boolean" | "json",
  defaultValue: T,
  validate: (value: unknown) => value is T,
})
// => { value, edit(value): Promise<PrefMutationResult<T>>,
//      retry(), reset(), meta: PrefAsyncMeta<T> }
```

For the note, pass suffix **`dashboard_header_note`**, codec **`string`**, default **`""`**, and a stable string validator. Do not pass the full pref key, use JSON string encoding, cast a dynamic suffix to `WebPrefKey`, or initialize an independent fallback writer. Physical note bytes stay ordinary strings. Caller normalization limits submitted text; a string validator need not silently trim or reject a previously stored string just to normalize it on mount.

Binding ownership comes from storage classification. The public dynamic options require suffix/codec/default/validator; invalid configuration is not a recoverable user save. The current API reference composes the same controller as the registered hook, so fixes for draft/session/validation/device behavior must be in its independently accepted dependency before this caller is accepted. No private token-map access or guessed setter options are authorized.

## Caller state and save contract

1. **Separate committed note, current text draft and submitted operation.** Capture an editor/session identity, account identity/generation/scope, physical key and exact raw baseline when editing opens. Store the proposed normalized text and edit sequence when submitting. A new blur/Save/Enter for the same active unchanged operation shares that attempt; it does not create another physical write. A genuinely newer edit is a new operation.
2. **Keep the draft editable while pending.** Show localized Saving feedback and retain the textbox. New keystrokes remain visible. The older completion may advance the verified committed baseline for its own operation, but may close the editor only when owner, editor session and current edit sequence still match that submitted text. A completion must not close a newly opened editor or replace a newer draft with its normalized predecessor.
3. **Freeze the editing baseline, not only the hook's current read snapshot.** While the caller is collecting local text, the shared hook can still be clean and adopt an external storage event. That must not silently rebase an old editor draft. Before submitting, compare the captured editor baseline with a strict current physical read and the hook's current raw snapshot; owner/source/raw disagreement is refusal. Do not treat a caught read error as physical absence. Submit through `edit()` with no intervening await between the successful caller checks and enqueueing; the accepted engine's captured raw check inside its key lock closes the later wait race. Caller preflight does not replace locked validation.
4. **Await the real result.** A Promise's truthiness, `value` changing optimistically, an effect seeing old Saved, or a successful raw reread alone is not permission to close the editor. Use the operation's returned result plus matching session/sequence. Catch a rejected Promise defensively and keep the draft/error. No success-critical fallback sync setter after the async call.
5. **Retry the latest intent truthfully.** An unchanged failed submission uses the hook's `retry()` so an engine-issued uncertain token and original baseline stay attached to that operation. Do not call `edit(sameText)` instead and lose its token. If the user changed the draft after failure, submit the new normalized value through a new operation; do not transfer the old token to changed text, Clear, another owner or another editor session. Preserve original/external raw conflicts; neither Retry nor a new local edit grants overwrite of a changed external baseline.
6. **Clear has the same ordering and recovery rules.** Show an editable empty draft while the empty-string write is pending. On fault, retain it while the old saved text remains physically intact. Clear success may close only its unchanged session; typing after Clear must survive the older completion. No implicit transition to physical absence.
7. **No account-note mount write.** Absent note displays the placeholder while its physical key stays absent. Initial read failure/unavailable source must not become empty-string seed permission. Rerenders, locale/time updates, opening/canceling the editor and device drag/resize must not seed or normalize the account note. Saving an intentionally empty draft is a legitimate explicit operation.

Do not blindly delete the existing caller `baseline/canWrite/submitting` protection when replacing hooks. Refactor it into explicit operation ownership; retain what is necessary for the caller-local editor baseline. Conversely, do not retain a success effect that closes based on any globally Saved state. The shared hook and the editor have different responsibilities.

## External changes, accounts and recovery UI

- Clean note display may adopt a valid same-tab/cross-document update. A locally edited or failed note keeps its current text and becomes a conflict. Reopen/reload/discard must be an explicit user action; conflict Retry cannot silently adopt a new baseline and write over external text.
- On A→B, old submitted/queued A operations cannot write B or close B's editor. Mask A's draft from B's display; keep any failed/uncommitted A recovery state in memory until explicit discard or safe owner-matching recovery rather than treating account change as a successful save. A newly opened B editor has a fresh B scope/raw/session and cannot inherit A's token or failed operation. Freezing the old session with the existing account-changed recovery message is acceptable; adding durable cross-account draft storage is not part of this batch.
- Preserve the original recovery assertion: old-account Retry and Export refuse and leave both A's external bytes and B's original bytes unchanged. Do not export A's text under B. Existing tests may await the real outcome or select an explicitly retained old-session recovery action; they may not replace this with a raw setter or drop the assertion because a hook rebinds automatically.
- Keep note and offset outcomes separate. Account-note refusal must not reclassify the device key or use the note's account marker as device authorization. Preserve the device-specific raw-baseline conflict check and quota/latest-offset retry. This batch retains its legacy write protocol and makes no claim of account/device atomicity. The existing shared recovery section can aggregate “anything unsaved,” but cannot claim note Saved merely because offset succeeded, or vice versa.
- Preserve the export format/behavior: downloadable `dashboard-note-draft.json`, `version: 1`, `kind: "dashboard-note-draft"`, latest editable note text and latest offset. Snapshot those fields under a valid owner/session check at the click. Failed export leaves the text, editor and warning intact and offers the existing retry message. Revoking an object URL must not erase a draft. Do not add a server export or new persistence store.
- `beforeunload` protection applies while text differs from committed state, a note/offset operation is pending or failed, or a conflict/frozen unsaved session remains. It clears only after all relevant state is actually saved or deliberately discarded. A prior operation resolving while the user has typed newer text must not remove this warning. Do not claim browser unload can await or complete an async save.

Save/Enter/blur/Clear/Retry and export buttons need consistent focus/event handling: clicking a recovery button may trigger blur, but may not accidentally submit a second operation, discard a newer draft, or bypass a conflict. Keep the existing prevention of inappropriate blur/double submit and drag-click suppression. Preserve EN/ZH labels, accessibility names, note-length behavior and pointer/resize bounds.

## Ownership and delivery

Terra may edit only:

- `packages/xai-web-dashboard-grid/src/DashHeader.tsx` and, if the component warrants it, one small note-session helper under that package's `src/internal/`.
- `src/__tests__/DashHeader.test.tsx`, `src/__tests__/DashHeader.recovery.test.tsx`, and a focused new note async/session test file or test-only named-lock helper.
- Minimal package-local styles/localized note feedback if the existing classes need Saving/error state support.
- Author evidence and the relevant caller-owner checklist entry, recording **account content converted / device offset legacy pending**.

Do not edit Sol's storage hooks, the accepted engine, registry ownership, Dashboard grid/widget recovery, Pomodoro, lifecycle/deletion or shared account activation. If an accepted hook cannot express this contract safely, report the exact interface seam for its owner; do not patch around it with a raw write or duplicate autosave effect. Parent independent tests/logs remain parent-owned and unchanged.

Existing recovery fixtures use incomplete account markers and synchronous expectations. They may gain complete synthetic markers and real name/mode-aware locks, and must await actual async UI outcomes. Physical fixture seeding is permitted only for initial state. Keep all four business oracles: quota/latest text/beforeunload; raw conflict and old-account Retry/Export; failed Clear followed by empty-string retry; and device latest-position quota/retry/external conflict. Keep current general header/drag/greeting tests. The legacy offset `"0"` assertion remains legitimate for this scope; it is not an account-note seed allowance.

## Minimum verifiable completion

| Evidence layer | Required outcome |
| --- | --- |
| Parent original two (`9557005`) | Under held account exclusive, original account bytes remain untouched and latest draft/editor stay visible; after release the intended note commits. An absent account key stays absent through mount. Run the unchanged parent runner against the fixed caller hash. |
| Existing recovery four and general header tests | Preserve all prior outcomes with truthful async waits; no weakened byte, draft, export, account or device assertions. |
| Actual component operation sequence | Save/Enter/blur duplicate events produce one commit; newer typing during pending stays open; success closes only its unchanged submission; Clear→new edit retains the newer draft; Escape cannot hide pending/failed work. |
| Fault and uncertainty | Actual set/read failures keep the latest draft and correct old bytes where no commit occurred. Uncertain readback followed by unchanged Retry becomes verified Saved with one physical write; changed draft/token mismatch and external replacement do not inherit overwrite authority. |
| Ownership/baseline | A→B and same-key close/reopen isolate old callbacks; old-account export/refusal stays intact. External raw change during local editing and during lock wait is preserved; explicit reopen establishes a new baseline rather than implicit Retry rebasing. |
| Recovery outputs | Inspect downloaded Blob JSON for latest text/offset and format; inject object-URL/download setup failure. Check beforeunload during dirty/pending/error/newer-edit and after successful clean completion. |
| Fixed regression | Run Dashboard package/type checks against the fixed product archive; retain the accepted hook/engine focused contract evidence for the dependency. Only rerun broader shared suites when a dependency changed. |
| Native integration | Actual DashHeader in Chrome, real held account lock, quota/latest retry and uncertainty, one owner switch, plus persisted reload/reopen check. Distinguish component mocks from native locks and do not claim crash-durable unsaved drafts. |

Author handoff needs a fixed product hash, precise dependency hashes and raw logs separated by layer. Independent acceptance must rerun original FAIL assertions and inspect actual user-visible/persisted outcomes. Neither this plan nor a type-check completes the caller. Even after this account-content batch passes, device-position conversion, remaining hook callers/open-ended domains, full D2, AI-02 and REL-05 remain separate open work.
