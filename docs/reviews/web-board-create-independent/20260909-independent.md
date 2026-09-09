# REL-05 BoardCreator independent acceptance

Product fixed at `885a111`; author evidence `0223180` was read for orientation only. The verifier did not implement or change BoardCreator. The native runner creates a complete git-archive source snapshot of885a111 and resolves workspace imports against that snapshot. Installed node_modules provide third-party dependencies. Source and tests in the active shared worktree cannot change the pinned product under test.

## Native execution

Run `node docs/reviews/web-board-create-independent/verify-native.mjs`. Native headless Chrome PID67820 used an isolated temporary profile and download directory on loopback HTTP. Actual BoardWorkspacesModule and BoardCreator are mounted. The synthetic fixture seeds scoped accountA data; a native Storage.prototype interceptor counts all canonical/active writes and selectively throws QuotaExceededError. No production endpoint or real user profile is used.

The author runner supplied browser/fixture infrastructure. This independent run reviewed the product implementation and strengthened assertions: unchanged active bytes in addition to zero attempts, dirty input retention, canonical write-count preservation across both another failed opening and a successful retry, creator closure only after success, exactly one real downloaded file, external-conflict text preservation, and an additional account-switch case after partial creation success. It is not merely a rerun of the author's PASS log.

## Results — PASS within scope

1. Canonical creation quota: editor and entered name remain; explicit error appears; canonical bytes remain exactly unchanged; active-selection attempts are zero and active bytes are unchanged.
2. Latest draft: change the failed input to `Latest native board`, download exactly one native JSON file, read and parse it from the temporary filesystem. Its latest draft name matches, its stored snapshot matches original canonical bytes, and committedBoardId is null. Restore writes and retry: exactly one matching board exists.
3. Partial success: canonical creation succeeds while active-selection storage fails. UI explicitly says the board was created and disables editing. Retry once while failure continues, then restore writes and retry again. Both retries perform zero additional canonical writes, preserve exact canonical bytes, and final active ID equals the originally created ID. The creator closes only after successful opening.
4. External conflict: after rejected creation, another writer changes canonical bytes. Retry preserves those newer bytes and the uncommitted `Obsolete` draft/editor.
5. SwitchA→B after rejected canonical creation: retry/export preserve both accounts' bytes, create no download and display export rejection.
6. SwitchA→B after partial canonical success: old retry cannot attempt active selection, cannot mutate either account's canonical data, and cannot export. The already createdA board remains stored.

Raw outcomes: `native-results.log` and `native-runner.log`. Browser is stopped before temporary profile/download removal. Product source is unchanged.

## Scope and limits

This is bounded independent acceptance of BoardCreator recovery. Ordered canonical/active writes are not a transaction; partial success is explicitly represented while the creator is open. Closing/reloading discards the in-memory recovery intent, while a successfully created board remains durable. Baseline comparison is not a cross-tab atomic CAS guarantee. Normal board onPick, workspace creation/CRUD, broader Board editing and overall REL-05 remain open. No deployment, whole-product acceptance or cloud durability is inferred. Actual file export success is checked; browser/OS download failures after anchor invocation are outside application acknowledgement.
