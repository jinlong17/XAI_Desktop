# REL-05 — persistence result and recoverable draft diagnosis

Baseline: `992f688` plus parent host integration `a8e3a03`. Module: web. Scope: shared storage contracts and consumer save boundaries; no cloud-sync expansion.

## Current source evidence

1. `packages/plugin-web-storage/src/internal/storage.ts` `setPref` already returns false for serialization, unavailable storage and quota failures. Replacing it with another boolean helper alone cannot fix the product gap.
2. `internal/usePref.ts` only updates the committed value when `setPref` succeeds, but its setter discards that boolean. Consumers cannot distinguish rejected writes. `internal/usePrefAutosave.ts` returns void; failed autosaves have neither a visible failed state nor a user retry handle.
3. `packages/xai-web-tasks/src/TasksModule.tsx` `handleComposerSave` calls void `persistCols` and then closes the composer unconditionally. The metadata setters also update React state before checking `setPrefAutosave`. The exact user-facing failure needs a storage-fault browser/component regression, rather than assuming the imperative helper's tests cover drafts.
4. `packages/plugin-web-bookkeeping/src/internal/storage.ts` `writeString` catches every write exception and returns normally. `writeBookkeepingState` attempts five independent writes and dispatches an update anyway; `useBookkeepingState` then advances its in-memory state. This permits both false in-memory success and partial state/preference commits.
5. Time Tracker and Metrics repository writes propagate exceptions but their hooks expose void setters. Throwing does not itself provide a recoverable editor or retry/export experience. Their initial reads can also throw on denied storage; read/corrupt/empty-state classification overlaps REL-07 and must stay separately evidenced.

## Implementation strategy

- Establish a shared discriminated write result with stable reasons (quota, unavailable, serialization, revoked account) and explicit unchanged/committed outcomes. Keep captured account scope throughout; failed work must never be replayed into a different account.
- Surface commit results from hooks and repositories without inventing a second storage namespace. Expose unsaved state and explicit retry/export for locally held drafts; do not overwrite a newer draft on a late result.
- Make each save action close/reset its editor only after commit. Update Tasks, Board editors, Habits, Calendar, AI input/notes and each standalone repository through a consumer inventory, rather than claiming a shared-hook change closes all consumers.
- Define canonical Bookkeeping business state and device layout write semantics. A partial preference failure must have an honest separate result; coordinate with REL-04's export coverage manifest instead of adding another copy of layout values.
- Add fault injection at actual native Storage/IDB boundaries and assert business outcomes: old committed data survives, proposed content remains recoverable, failure is visible, retry after access returns succeeds once, and account switches revoke retry. Retain existing happy-path assertions.

## Acceptance still missing

This is source diagnosis, not a reproduced runtime PASS. No REL-05 task is closed. Required next evidence: quota/denied-storage composer regression; Bookkeeping partial-write regression; lifecycle/retry tests; and real-browser failed save followed by recoverable retry/export. Cross-tab entity merge and schema repair remain REL-08/11 concerns.
