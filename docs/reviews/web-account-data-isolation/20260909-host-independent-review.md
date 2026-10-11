# REL-03 host and account gate independent review

Reviewer scope: parent-written `AccountStorageGate`, `AccountDataGate` and CSS, Web route hierarchy, `AppProviders` runtime invalidation, and auth session publication. Product source was read only by this reviewer. AI secret implementation is excluded from independent acceptance because this reviewer authored it.

## Findings and repair evidence

1. **P1 — same-account cross-tab announcement revoked live storage scopes.** Opening another tab for A unconditionally locked an already active A scope. AccountDataGate's identity dependencies did not change, so it never reopened the workspace. The same event invalidated a pending A migration token. Independent pre-fix execution reproduced **2 FAIL / 1 PASS**: active A became locked; pending A's epoch changed; actual A→B was correctly locked. Parent repaired AccountStorageGate to ignore same-account metadata, leaving generation-change handling to the generation marker listener.
2. **P1 — unauthenticated app routes were blocked before their auth guards mounted.** App's data gate replaced the subtree containing the child route guard, so `/` and `/app/*` could remain on account waiting rather than redirecting to login. Parent wrapped the app parent route in the existing ProtectedAppRouteElement. Independent tests use the real WebAuthSessionProvider, route tree, and auth guards, and a deliberately blocking App fixture to prove the auth guard executes first.

## Independent execution after parent repairs

Command from repository root:

```sh
pnpm --dir packages/plugin-web-storage exec vitest run --config ../../docs/reviews/web-account-data-isolation/host-review.config.mjs
```

Result: **2 files, 6 tests PASS**, 2026-09-09 local execution. Coverage:

- Same-account announcement preserves an open A workspace and its exact storage scope.
- Same-account announcement preserves an uninitialized A migration transition.
- Actual A→B announcement hides A contents and requests refreshed identity while the old auth snapshot remains A.
- Same-account announcement during awaited secret staging preserves the token; the original migration completes and Continue opens the workspace.
- Unauthenticated `/app/tasks?filter=active` redirects to `/auth/login`, preserving the complete `next` path/query.
- Unauthenticated `/` redirects via the configured default app route to login, preserving `/app/ai` as `next`.

Test boundaries: host event tests use real AccountStorageGate/AccountDataGate/accountScope/migration with deterministic auth snapshot and secret participant fixtures. Route tests retain real auth provider and guards, while stubbing feature registrations, App content and login rendering. The test-only navigator lock serializes an individual migration; it does not claim real cross-process Web Lock coverage. Native Node AbortController is used by the router test to match Node Request's signal realm under jsdom.

Further read-only checks found no additional demonstrated blocking defect in generation marker invalidation, account-ready subtree keys, demo namespace selection, stale nonce lease completion guards, or error/rollback UI recovery. This is bounded review evidence, not whole-product acceptance or independent verification of AI encryption. Parent owns joined browser, other-owner verification, release and TODO status.
