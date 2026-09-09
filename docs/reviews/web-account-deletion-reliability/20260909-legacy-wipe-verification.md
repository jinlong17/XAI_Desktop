# Legacy IndexedDB reset verification

The public historical helper resolved on success, error and blocked events. No current product account-delete caller was found; repairing its result does not authorize its use on shared account data. It is now deprecated and requires every request to succeed, otherwise an AggregateError reports the affected database names. Unavailable IDB rejects instead of claiming a no-op success.

- Auth package: 14 files / 75 tests PASS; typecheck PASS.
- Native Chrome: `node docs/reviews/web-account-deletion-reliability/verify-browser-wipe.mjs` PASS. A second same-origin page context holds the AI database open. The reset rejects identifying the blocker. Releasing the connection and retrying succeeds; fresh opens of all three historical names contain no object stores.
- Native deleteDatabase is not cancellable: a rejected blocked request may finish later. This is documented, rather than represented as an atomic rollback.

No normal account flow calls this helper. No user profile was accessed. The result does not prove per-account erasure, auth persistence cleanup, held transaction quiescence, two-tab acknowledgement or process-kill recovery. Complete REL-06 remains open.
