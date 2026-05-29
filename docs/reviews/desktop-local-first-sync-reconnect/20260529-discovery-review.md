# Discovery Review - desktop-local-first-sync-reconnect

## Reviewed Inputs

- `docs/reviews/desktop-local-first-sync-reconnect/20260528-roadmap-seed.md`
- `docs/reviews/desktop-local-first-offline-edit-queue/20260529-feature-brief.md`
- `packages/desktop-local-first-offline-edit-queue/docs/api.md`
- `packages/desktop-local-first-offline-edit-queue/docs/dev_log.md`
- `packages/core-data/src/offline-edit-queue.ts`
- `packages/core-data/src/sync-outbox.ts`
- `packages/plugin-account/src/sync-engine.ts`
- `packages/web-auth-device-session/src/session.tsx`
- `apps/web/src/providers/AppProviders.tsx`
- `packages/plugin-web-storage/src/internal/desktopRepoBridge.ts`

## Current State

Row `#13` is shipped. It added durable queue state directly to `sync.outbox` with `queueStatus`, `boundaryKey`, `localRevision`, retry failure fields, conflict timestamps, and rollback safety metadata. The helper layer can stage only representative `account-sync` entity families and explicitly refuses device-local records.

The desktop bridge now writes representative tasks, habits, boards, and cards through `stageOfflineEditMutation`. Its queue boundary key is the authenticated account id when present and `local-session` otherwise. The row `#13` contract says remote replay and acknowledgement belong to row `#14`.

The web account/session layer already exposes authenticated state, access token, device id, and device-bound fetch seams through `web-auth-device-session` and `AppProviders`. Desktop offline runtime disables live Supabase device transport unless configured and online. `plugin-account` already has a generic sync push transport and revision-conflict result vocabulary, but its older in-memory outbox shape does not directly match row `#13` `sync.outbox` rows.

## Primary Decision

Implement row `#14` as a replay coordinator over the row `#13` `sync.outbox` contract, with an injected transport and explicit preflight. The coordinator should live at the lowest shared layer that owns queue semantics, likely `@repo/core-data`, while any app/runtime bridge stays thin and optional.

## Rationale

- Keeps row `#13` as the single durable queue seam.
- Avoids a second app-owned queue or a parallel "successful sync" flag.
- Lets verification cover reconnect replay deterministically with mock transports.
- Keeps real cloud collaboration gated by account/network/transport availability.
- Leaves hosted Supabase provisioning and full pull/merge behavior to future rows or external environment gates.

## Alternative A - Directly Reuse `plugin-account.pushBatch`

Rejected for this row as the primary seam. `plugin-account` push helpers expect plaintext entries and crypto/revision dependencies, while row `#13` stores a serialized queue payload envelope inside `sync.outbox`. Build may add an adapter if low-risk, but the row should not force a broad account plugin rewrite to meet the controlled smoke path.

## Alternative B - Local Success Without Transport

Rejected. Marking queued edits as synced merely because network returns would weaken the acceptance criteria and row `#13` truthfulness. A success state is allowed only after a replay transport returns an acknowledgement or duplicate result for the mutation id.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Success state weakens row `#13` "no fake remote success" contract | Add success metadata only in row `#14` and only after transport ack. Keep failures/conflicts durable. |
| `navigator.onLine` is unreliable by itself | Treat it as one injected signal, not proof of replay readiness. Transport errors still mark retryable failure/deferred. |
| Existing queue summaries accidentally count acknowledged entries | Define pending summaries/status filters explicitly and test success exclusion. |
| Account/cloud UI becomes available offline | Keep AppProviders/web-auth-device-session gating unchanged or strengthened; add tests for offline/unconfigured modes if touched. |
| Real Supabase credentials unavailable | Use mock replay transport for automated gates and classify live hosted smoke as external. |

## Recommended Build Shape

1. Add replay preflight and transport types next to the row `#13` queue helpers.
2. Add status transition helpers for remote acknowledgement and reconnect failure/conflict.
3. Add a deterministic replay runner that processes a bounded batch in commit sequence order.
4. Add a thin desktop/web runtime bridge to run the controlled smoke path when the app has account/network/transport context.
5. Keep live cloud transport optional and gated; tests use mock transport.

## Review Focus

- Is `@repo/core-data` the correct owner for the replay coordinator, with runtime adapters outside it?
- Should acknowledged rows use a new `synced` status or a separate replay-result audit record?
- Are the preflight gates strict enough for desktop offline/unconfigured account modes?
- Are tests sufficient to prove conflicts are marked and not overwritten?
