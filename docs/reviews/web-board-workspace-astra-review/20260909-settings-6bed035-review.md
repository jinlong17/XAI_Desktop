# Settings 6bed035 — queued snapshot repaired, active-flight ownership remains

Astra, Web, 2026-09-09. Product fixed `6bed035ea3fff1f82d5b533cf2fddff03511bacb`. **Accept the queued-entry raw replacement repair; the complete defined Settings durable-deletion slice still awaits one P2 single-flight ownership fix.** The previous eight groups remain accepted as repaired; no full D2/provider/old-client/AI-02/REL-05 conclusion follows. No product or Sol Board evidence was changed.

The ten-line source patch captures the physical deleted raw before requesting the recovery workflow lock and passes it through to the locked continuation. A changed pending raw refuses instead of becoming a new expected snapshot. A matching-identity complete observation still returns idempotently, preserving a second context observing the first context's successful completion. Both original queued entry cases pass independently, as do the original seven slice and sixteen actual orchestrator assertions.

## Remaining P2: a different raw request inherits the active old operation

`resumeAccountLocalDeletion` still computes `recoveryFlights`' key from kind/account/business generation/version/authGeneration alone. Even after reading a different entryRaw, it returns the existing Promise without matching that raw to the active operation. Thus the original edb8ab3 requirement to avoid sharing an operation authorized by another raw token remains incomplete.

The new bounded case starts an actual same-page recovery and holds its synthetic secret participant. It replaces the physical pending receipt with a valid record having the same immutable identity fields and a new updatedAt/raw, then explicitly calls recovery with that new receipt and its own auth callback. Fixed 6bed035 returns the **identical old Promise** (`sharesOldPromise:true`). After the old secret operation releases, the old raw mismatch correctly rejects; both callers inherit that rejection, the new auth callback is never called and the valid new receipt stays pending.

This does **not** erase or overwrite the replacement receipt, and is not the already-repaired P1 queued-data-loss defect. It incorrectly assigns a legitimate new recovery request to a superseded operation, forcing another retry. The independent test requires a separate authorized outcome: old operation rejects without old auth; the new operation waits its turn, validates its own entry raw, completes, and invokes only its new auth callback.

Minimum ownership is only Settings `accountDeletionRecovery.ts`'s in-page map key/active-entry raw matching plus focused tests. Associate each active Promise with its captured raw token using an unambiguous identity/key; do not return it for another raw token. Preserve the existing workflow lock, account lock order, queued raw rejection and completed-observation exception. Identical active work may still share a Promise; a different raw entry must acquire its own workflow turn. No new architecture or broad D2 change is needed.

## Independent fixed evidence

| Scope | Result | Own artifact |
| --- | --- | --- |
| Original queued entry refusal/control | 2 PASS | `d2-settings-entry-snapshot-astra-6bed035.log` |
| Same cases plus active old-flight/new-raw request | 2 PASS / 1 correct FAIL | `d2-settings-entry-snapshot-astra-active-6bed035.log` |
| Original seven slice boundaries | 7 PASS | `d2-settings-slice-astra-6bed035.log` |
| Original actual orchestrator boundaries | 16 PASS | `d2-settings-orchestrator-astra-6bed035.log` |

All executions use git archive 6bed035 with reviewer-owned fixtures; only the new active-map case was added. Old before logs remain. No C/storage/full package rerun was needed for this one-file patch after b152399's independent full passing chain; author aa345b5 package282/types PASS remains separately attributed.

Parent `50e913a` provides independent fixed 6bed035 original consumer4 PASS, real Chrome native4 and whole-process reopen4 PASS (PID 15247 → 15295), including the original queued raw refusal, retained account/IndexedDB data and preserved replacement bytes. Earlier a2f4709 native before failure stays retained. I read that evidence; I did not duplicate the browser run. Those probes do not exercise this new active same-page different-raw call.

```sh
node docs/reviews/web-board-workspace-astra-review/verify-d2-settings.mjs 6bed035 d2-settings-entry-snapshot astra-active
node docs/reviews/web-board-workspace-astra-review/verify-d2-settings.mjs 6bed035 d2-settings-slice astra
node docs/reviews/web-board-workspace-astra-review/verify-d2-settings.mjs 6bed035 d2-settings-orchestrator astra
```

Use a new revision/suffix after the map fix. The entry suite now has three cases; retain all three business outcomes and the existing cross-context completed idempotence. These plus the already-established passing source/native scope are sufficient for the next bounded decision; no unrelated probe expansion is required. The prior b152399/c35898f repairs are not reopened by this P2. No ledger, production activation or deployment changed; no push was performed.
