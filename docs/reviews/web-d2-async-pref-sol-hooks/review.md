# D2 async preference hook sessions

- Module: Web
- Author: Sol
- Engine dependency: `6504589`
- Hook implementation: `d6184ee`
- Scope: registered async preference hook session, ordering, retry and projection behavior

## Change

`usePrefAsync` now owns one ordered controller per key/account-generation binding. Absolute edits coalesce only within their queue position, reset is an ordering barrier, failures pause queued work, and Retry shares an already active attempt. A binding change or unmount disposes the old controller and makes its queued validator refuse before mutation; stale callbacks cannot update the current session.

The controller tracks the committed raw baseline separately from the visible draft. A successful earlier edit therefore cannot mark or display a newer draft as saved. Functional updates remain evaluated once by the engine under the physical-key lock and deliberately omit an absolute raw baseline. Reset and absolute writes carry their verified predecessor baseline.

Same-tab notifications and browser `storage` events re-read and validate the physical binding. Clean sessions adopt valid storage; pending or failed drafts remain visible and become conflicts. Explicit reload creates a fresh session and re-subscribes it. `usePrefAutosaveAsync` tags its draft by key/account epoch so A's draft is never rendered in B or a later same-key session.

For readback-uncertain writes, only the failed request retains the engine-issued opaque retry token. Retry returns it with the original baseline; new edits, reset, binding changes and remounts do not inherit it. The verified retry publishes to a clean sibling without a second physical write.

## Author verification

| Check | Result |
| --- | --- |
| Focused hook contract | 9/9 passed |
| Storage package | 22/22 files, 185/185 tests passed |
| Storage TypeScript | passed |
| Settings package | 42/42 files, 282/282 tests passed |
| Settings TypeScript | passed |

The focused cases cover two functional hook instances, A-to-B rebinding, unmount/remount, invalidated queued work, edit-reset-new-edit ordering, visible newer-draft preservation, active Retry singleflight, clean/dirty browser storage projection, reload re-subscription, same-tab sibling projection and opaque uncertain-commit recovery.

Raw logs are stored beside this report. They were produced with the exact Storage and Settings package trees committed by `d6184ee`; intervening HEAD changes were review documentation only.

## Boundary

The existing Collaborate pane already consumes the registered async autosave hook, so no pane source change was required. Parent-owned native Chrome checks remain the independent UI/Web Locks evidence. This bounded commit does not add the still-required open-ended suffix/codec/default/validator hook binding, migrate other consumers, or close D2.
