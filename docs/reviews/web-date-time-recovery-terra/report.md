# Date & Time recovery — Terra implementation report

Product baseline: `73b4eb9`. This report accompanies the Date & Time caller
implementation only; it is not an acceptance record.

## Implemented caller behavior

- Replaced the five synchronous preference mutations with five independently
  validated `usePrefAutosaveAsync` bindings for the existing device keys.
- Added field/session/operation draft identities. A visible choice is retained
  until that exact operation verifies; later equal values remain distinct work.
- Added field Retry, Discard/reload, source-only Reload, sparse in-memory
  `date-time-draft.json` export, all-current discard, beforeunload protection,
  and the optional composed-Settings departure guard.
- Device drafts remain in memory across owner epochs while old guard callbacks
  are revoked; a fresh locked guard can still protect current device work.
- Added scoped recovery layout controls with 44px minimum targets and documented
  the optional guard bridge and export format in the package API.

## Author verification

| Command | Result |
| --- | --- |
| `pnpm --filter @repo/plugin-web-settings-rest test -- dateTimePane.test.tsx` | PASS — 6 tests |
| `pnpm --filter @repo/plugin-web-settings-rest typecheck` | PASS |
| `pnpm --filter @repo/plugin-web-settings-rest lint` | PASS |
| `pnpm --filter @repo/plugin-web-settings-rest test` | PASS — 43 files, 293 tests |

The package suite printed pre-existing React `act(...)` warnings from
`morePane.test.tsx`; the command exited successfully and Date & Time tests did
not emit warnings.

I also attempted to invoke Sol's public tests directly through the package
Vitest command. That package configuration includes only `src/__tests__`, so it
reported `No test files found`; this is a runner-configuration mismatch, not a
product test result. Sol's archive verifier must run those tests against the
fixed commit as specified by the contract.

## Still required outside author scope

Sol must run its immutable core, recovery and advanced suites. Parent must run
the composed Settings/full Shell and native browser matrix. Astra retains final
contract acceptance, including sparse disk export, source/error, lifecycle,
owner-epoch and responsive interaction evidence.

## Queued predecessor recovery repair

The `611062e` caller gate correctly stopped a predecessor Promise from clearing
a newer queued draft, but it also rejected Retry before that newer draft could
settle. The shared hook intentionally leaves its queue stopped on a failed
predecessor. The caller now admits Retry only when the latest draft either
failed itself or is queued behind a public hook `error`/`conflict` state.

When it is the latter, the caller uses the public hook Retry only to advance the
predecessor. Its result can clear neither the latest draft nor its recovery UI;
the latest edit's original Promise still has sole settlement authority. A
failed predecessor recovery releases the local duplicate-Retry guard so the
user can try again. The shared hook/engine queue and Promise API are unchanged.

| Command | Result |
| --- | --- |
| `pnpm --filter @repo/plugin-web-settings-rest exec vitest run src/__tests__/dateTimePane.test.tsx` | PASS — 8 tests, including DT8 predecessor failure → queued latest failure → own Retry recovery |
| `pnpm --filter @repo/plugin-web-settings-rest typecheck` | PASS |
| `pnpm --filter @repo/plugin-web-settings-rest lint` | PASS |

DT8 holds the real `start_week` physical-key lock, queues Sunday then Saturday,
denies Sunday, advances it through Retry, then denies Saturday. It verifies the
physical Sunday predecessor result does not clear the visible Saturday draft;
only Saturday's own later Retry writes Saturday and removes recovery.
