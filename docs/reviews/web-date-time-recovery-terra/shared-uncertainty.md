# Shared uncertainty authorization fix — Terra verification

Authorized architecture decision: Astra `869565d`,
`web-date-time-recovery-astra/shared-uncertainty-decision.md`.

The shared mutation engine now treats a supplied reconciliation token as a
one-time verification grant only. It validates the token's physical key,
original baseline, operation kind and intended bytes while holding the existing
physical-key lock. A restored or changed external value returns conflict with no
write/remove/publication. Temporary unavailable reads preserve the grant for a
later retry. `usePrefAsync` also preserves an existing token across failures
that issue no replacement token. Functional updater retries remain new attempts
and do not authenticate an absolute token.

Author checks at this commit:

| Command | Result |
| --- | --- |
| `pnpm --filter @repo/plugin-web-storage test -- prefMutation.test.ts usePrefAsync.contract.test.tsx` | PASS — 23 tests |
| `pnpm --filter @repo/plugin-web-storage check-types` | PASS |
| `pnpm --filter @repo/plugin-web-storage test` | PASS — 22 files, 194 tests |

`@repo/plugin-web-storage` has no lint script or package-local ESLint config.
The full test command emitted existing SSR/React `act(...)` diagnostic warnings
from unrelated legacy tests and exited successfully.

This is author verification only. Astra's immutable six-case shared oracle,
Sol's Date & Time suite, and parent native/host plus affected-caller regressions
remain required before acceptance.
