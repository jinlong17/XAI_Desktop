# Smart Lists actual native browser baseline

Parent fixed archive `3b02e2a`, actual Smart Lists pane, synthetic complete account, real Chrome Web Locks; CSS intentionally omitted. [Before result](native-3b02e2a-before.json), [probe](native-probe.ts), [runner](verify-native.mjs).

Three correct failures reproduce the separate parent component baseline: actual row change writes early under held account lifecycle exclusive lock and held physical preference-key exclusive lock; quota loses the latest two selections. Empty-map mount remains a passing compatibility control with all twelve rows showing existing `show` fallbacks and no default write.

The unchanged after probe will also require latest pending selection, actual Retry saving both changed fields plus the unknown string extension, and a whole Chrome process exit/reopen with both exact final map bytes and actual re-rendered select values restored. These latter after/reopen assertions did not pass or run on this failing baseline. Four representative browser cases are not full twelve-producer/schema/migration coverage; Astra owns complete contract acceptance. No production data or running timer is involved.
