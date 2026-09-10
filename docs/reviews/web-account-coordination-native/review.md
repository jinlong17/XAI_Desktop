# Native account coordination adapter — independent failure evidence

Parent, Web, fixed `e9ff409`, 2026-09-09. Actual installed Chrome, immutable source archive with pinned workspace imports, native navigator.locks, isolated profile and synthetic accounts. No production state or provider traffic.

All three initial checks fail: direct shared adapter invocation throws `Illegal invocation`; public `setPrefAutosaveAccount` refuses despite native locks being available; actual `migrateAccount` throws the same native invocation error. `native-e9ff409.json` retains results. No reopen phase runs after failed initial checks.

`browserAccountLock` extracts `navigator.locks.request` then calls it without its LockManager receiver. In this Chrome the actual native method has `.length === 2`, also disproving the implementation's assumption that arity below three indicates a test adapter. A receiver-only repair that retains that branch would request the default exclusive mode instead of the required shared mode. The direct native test queries the held lock mode inside the callback, so merely making the invocation stop throwing cannot satisfy it.

Required narrow repair: call the method with its native receiver and explicit `{mode}`. Correct older test adapters at the test boundary; do not infer runtime API support from function arity. Retain truthful typed refusal and all account/dataset ordering. This is a prerequisite for the D2 foundation and affects canonical callers already connected in that commit, not only future unconverted callers. Astra independently reviews remaining foundation semantics.

```sh
node docs/reviews/web-account-coordination-native/verify-native.mjs e9ff409
```

The suite's subsequent restart phase, if initial checks pass on a repair, only verifies persisted autosave bytes. It does not establish all-client coordination, every UI writer, universal old-client admission, multi-store atomicity or D2 completion.
