# Smart Lists draft recovery — Terra evidence

Product commit: **`ef97c1f`**. Contract: `8565ca6`.

The Smart Lists pane now retains a current-owner in-memory draft, exports the exact latest full map as `smart-lists-draft.json`, registers `beforeunload` only for that unsaved draft, and exposes a typed pane departure guard. The actual composed Settings host derives its active pane from the committed URL, uses the data-router blocker, keeps the blocked Smart Lists pane mounted, and gives Stay, Export, and Discard/leave actions. Voluntary App sign-out asks the host delegate before identity invalidation and rechecks the captured account scope and auth owner/generation after the decision.

Author checks at `ef97c1f`:

- Smart Lists focused package tests: 10 passed.
- App sign-out focused tests: 7 passed.
- `@repo/plugin-web-settings-rest`, `@repo/plugin-web-settings-shell`, and `@repo/web` typecheck/lint passed.
- Existing full storage caller acceptance remains `a663891`; this commit does not change its engine or fixtures.

Parent-owned native fixtures and logs under `docs/reviews/web-d2-smart-lists-draft-native/` were intentionally not modified or committed. Independent follow-up must run the actual Blob/download, full Storage-denied export, beforeunload, real composed data-router, and sign-out matrices against `ef97c1f`; this author note does not close REL-05, REL-09, D2, or release gates.
