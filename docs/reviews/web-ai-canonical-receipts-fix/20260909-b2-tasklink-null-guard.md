# B2 Board task-link null guard

`ensureBoardTaskLink` now distinguishes a physically absent Tasks key from parsed `null`. Only physical absence may seed the initial task columns. JSON `null` and an otherwise valid envelope with `data: null` fail at intent before either Board or Tasks bytes change.

Verification: task-link package targeted suite 9 PASS; typecheck and lint PASS.
