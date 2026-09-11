# Notifications recovery — Terra implementation report

Fixed implementation: `6b90b220459facdc80a42e4de6c4073c2b57f1eb` plus the focused author test commit.
This is implementation evidence, not complete Notifications acceptance.

## Implemented caller boundary

All eight existing device-owned preferences now use `usePrefAutosaveAsync` with
runtime validators. Sound retains its five-value domain and quiet start/end
accept only zero-padded `HH:mm` values. Every valid edit has a local identity;
only that draft's own completion can clear it. A Retry behind a failed
predecessor advances the public queue but does not gain authority over the
latest queued draft.

Quiet-time visibility does not dispose its field recovery. Hidden start/end
drafts remain field-labelled, exportable, discardable, guardable and retryable.
The pane supplies sparse `notifications-draft.json` export, field/all discard,
source-only Reload, live-scope departure guard and synchronous unload warning.
Shared storage, ownership, auth and Settings coordination are unchanged.

## Author verification

| Command | Result |
| --- | --- |
| `pnpm --filter @repo/plugin-web-settings-rest exec vitest run src/__tests__/notificationsPane.test.tsx` | PASS — 10 tests |
| `pnpm --filter @repo/plugin-web-settings-rest typecheck` | PASS |
| `pnpm --filter @repo/plugin-web-settings-rest lint` | PASS |

NF10 holds a failed `quiet_start` draft, turns quiet mode off so the native time
inputs disappear, and verifies the hidden draft still blocks departure and is
exportable. Its own Retry then writes the exact retained time and releases the
guard. Existing NF5 emits an unrelated React act warning but the suite exits
successfully.

## Remaining independent gates

Sol owns the immutable caller matrix. Parent owns the actual composed
Settings/Shell and native browser checks. Astra decides whether the full
contract, including all source, queue, uncertainty, owner, export and layout
requirements, is accepted.

## Per-field invalid time feedback repair

Sol's independent boundaries oracle found that a single input-error slot let a
second malformed quiet-time value erase the first field's feedback, and let an
unrelated valid sound change erase both. Input feedback is now a sparse field
set. Only a valid edit, Discard, or source Reload of the same field removes its
entry. Invalid DOM text remains neither a draft nor export/guard work, while a
Saved status requires both clean drafts and an empty invalid-feedback set.

NF11 verifies malformed start and end feedback coexist, a valid Sound write
leaves both intact, and a valid start edit clears only start. Targeted pane
tests, typecheck and lint pass after this repair; Sol reruns its immutable
boundaries oracle independently.
