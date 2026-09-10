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
