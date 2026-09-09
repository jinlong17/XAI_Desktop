# Six-subscriber semantic snapshot repair — Astra bounded acceptance

Web. Fixed product `8503b71723c9e6c94614eb264a3408cefdd127c8`. **Accept the C six-subscriber integration within its reviewed scope.** The original Tasks semantic-snapshot failure is repaired; all 11 original independent subscriber assertions pass unchanged against an immutable git archive.

Run: `node docs/reviews/web-board-workspace-astra-review/verify-six-subscribers.mjs 8503b71 six-subscriber-independent`.

Evidence: `six-subscriber-independent-8503b71.log`, independently generated in this review. The pre-existing author run was renamed `author-run-six-subscriber-independent-8503b71.log` before executing. It is not counted as independent proof. Original `six-subscriber-independent-4202c79.log` and its correct FAIL remain unchanged.

Source review confirms the locked Tasks update now uses the same locally captured `patch.bucket`, `patch.tag`, and `patch.title` that form the durable operation signature. It no longer rereads the caller's mutable `p` inside the mutation. The original injected payload mutation now records signature `later/work` **and** actual bucket/tag `later/work`, while its original input object has changed. No mutation/signature oracle was weakened.

The same run also retains six lifecycle replay cases, real supported later-human-edit preservation, unchanged bytes/target on replay, changed-operation conflicts, fresh missing-delete refusal, no early reply during lock wait, queued account-change refusal and quota/retry checks. Previous broader evidence remains at its actual revision: [4202c79 review](20260909-six-subscribers-4202c79-review.md), including independently rerun durable/event-bus suites and parent `646a539` native whole-Chrome reopen/actual AiChat synthetic continuation PASS. Those native suites were not rerun at `8503b71`; the intervening reviewed product repair is the narrow captured-patch change plus its regression test.

This bounded acceptance does not close full AI-02, D1 ordinary callers, D2 account lifecycle coordination, old-client rollout/activation, or release readiness. Full Calendar's previously reproduced 20 FAIL remain open; they were not rerun or relabeled here. Tasks D1 is still under implementation (`0a294bc` cascade/detail awaits are partial progress); normalization, recovery UI, all ordinary writer coverage and their regressions require a separate fixed-hash review. Typecheck success alone is not Tasks D1 acceptance. No overall audit completion count changes.
