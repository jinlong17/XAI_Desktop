# desktop-local-first-sync-reconnect - Test Strategy

## Core Verification Matrix

| Case | Expected |
|---|---|
| offline preflight | `network_unavailable`, no queue row marked successful |
| unauthenticated preflight | `account_required`, no queue row marked successful |
| missing device preflight | `device_required`, no queue row marked successful |
| missing transport | `transport_unavailable`, no queue row marked successful |
| empty queue | `queue_empty`, no status mutation |
| ack result | mutation becomes durably acknowledged and leaves pending queue summary |
| duplicate result | mutation is treated as acknowledged because mutation id is already accepted remotely |
| conflict result | mutation becomes `conflict`; local entity is not overwritten |
| retryable failure | mutation becomes or stays retryable with incremented retry metadata |
| rollback-pending row | replay skips it and preserves rollback semantics |

## Targeted Test Files

Preferred additions:

- `packages/core-data/tests/reconnect-sync-replay.test.ts`
- `packages/plugin-web-storage/src/__tests__/desktopReconnectSync.test.ts` if bridge wiring is added
- `packages/web-auth-device-session/src/device-session.test.ts` only if session/device API changes
- `packages/plugin-account/tests/sync-engine.test.ts` only if account sync adapter changes
- `apps/web/src/providers/AppProviders.test.tsx` or existing provider/router integration tests if provider wiring changes

## Required Commands

Always run:

```bash
pnpm --filter @repo/core-data test
pnpm --filter @repo/core-data check-types
```

Run when touched:

```bash
pnpm --filter @repo/plugin-web-storage test
pnpm --filter @repo/plugin-web-storage check-types
pnpm --filter @repo/web-auth-device-session test
pnpm --filter @repo/web-auth-device-session check-types
pnpm --filter @repo/plugin-account test
pnpm --filter @repo/plugin-account check-types
pnpm --filter @repo/web test
pnpm --filter @repo/web check-types
```

Final cross-stack gates:

```bash
pnpm --filter @repo/web build
pnpm --filter desktop tauri build --debug --bundles app
```

## Manual/External Classification

Live hosted Supabase replay, real two-device conflict smoke, and real macOS reconnect UX are external/manual follow-ups unless credentials and hardware are explicitly available in the build environment. They must not block the controlled mock transport acceptance path.

## Regression Assertions

- Existing row `#13` offline queue tests continue to pass.
- Device-local surfaces remain non-queueable.
- `rollback_not_safe` still marks conflict instead of overwriting newer local state.
- Browser-only runtime does not expose desktop reconnect sync as an active capability.
- Network-required account/cloud surfaces remain gated in desktop offline/unconfigured modes.
