# usePref committed-write result

REL-05 makes the existing `usePref` setter return `boolean` instead of discarding `setPref`'s outcome. Callers that ignore the return value remain source-compatible.

- `true`: the value is committed, or identical bytes were already committed. The hook advances its committed state and functional-updater reference.
- `false`: serialization, unavailable storage, quota, a revoked private account scope, or SSR prevented committing. The hook keeps the preceding committed value. Consumers retain their proposed draft and display recovery UI.
- The setter captures its original account scope. A retained callback cannot select the next account after a transition.
- This does not convert other consumers, `usePrefAutosave`, or `meta.reset` into recoverable editors. It does not promise filesystem durability, cross-tab conflict merging, or classified error reasons.

`src/__tests__/usePref.writeResult.test.tsx` verifies native Storage quota failure, two consecutive functional writes in one React batch, and a retained setter after A→B. Tasks demonstrates conditional-close, same-account retry and explicit draft export; see `packages/xai-web-tasks/docs/api.md`.
