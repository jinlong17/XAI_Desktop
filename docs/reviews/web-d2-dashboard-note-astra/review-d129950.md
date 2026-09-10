# Dashboard account note caller — final bounded acceptance

Astra, Web, 2026-09-09. Independently reviewed fixed product **d12995059eb0388cdc2f5b34c18a3f0077681797** against the complete [9aac0ea caller contract](../web-d2-dashboard-note-contract/contract.md) and [53fb95d review](review-f532ad5.md). **Accept the defined account-content caller and preservation of its existing note/position recovery behavior.** All three independently reproduced defects are repaired; the original failing logs and eleven assertions remain unchanged.

## Independent fixed evidence

Every execution below uses `git archive d129950` and aliases workspace source into that archive. No product/test overlay or author log was substituted. The exact same independent eleven-case file from 53fb95d was run, with a fresh log suffix.

| Layer | Result |
| --- | --- |
| Original independent eleven cases | **11/11 PASS**, [raw log](independent-astra-after-d129950.log): three repaired failures plus eight unchanged controls |
| Original parent component assertions, rerun by Astra | **2/2 PASS**, [raw log](original-parent-astra-after-d129950.log) |
| Full original Dashboard package, rerun by Astra | **24 files / 213 tests PASS**, [raw log](package-astra-after-d129950.log) |
| Fixed types, workspace aliases to archive | **PASS**, [raw log](independent-d129950-dashboard-types.log) |

Reproduce using the existing [runner](verify-fixed.mjs) with `d129950 independent <new-suffix>`, `d129950 original-parent <new-suffix>` and `d129950 package <new-suffix>`. [Type runner](run-types.py) takes the fixed revision. Do not overwrite earlier logs.

Separate parent evidence **662ef40**, inspected and attributed here: original component two PASS; [real Chrome four + whole-process reopen four PASS](../web-d2-dashboard-note-native/native-d129950-repair.json), PID 62907 → 63004, including one-write uncertain Retry. A separate [actual device-only drag/export before-after](../web-d2-dashboard-device-export-native/review.md) has f532ad5 FAIL/no downloaded file and d129950 PASS/real JSON read from disk (`note: "Original note"`, `noteOffset: 40`), while both persisted values stay unchanged by the failed position save/export. These are parent native executions, not my executions; do not combine their counts with component coverage.

## Repair review and preserved contracts

- **Account masking:** frozen recovery uses the current account hook projection for the visible header and updates its committed display without discarding the old session/draft. Old operation completion is still ignored after the account effect detaches it. The unchanged test proves no A committed text or draft appears under B, unload protection remains, both physical notes stay intact, and old Retry/Export still refuse. The normal clean A→B editor control also passes.
- **Position-only export:** an existing note session still requires matching current owner and refuses frozen sessions. When no note session exists, export validates a current account key context and snapshots the current display plus latest device offset. It no longer incorrectly requires an editor to have been opened. The independent Blob oracle passes; parent's actual browser download corroborates the file payload. The device key remains device-owned and its write protocol is untouched. Note-conflict export and injected URL setup failure controls pass.
- **Retry normalization:** Retry now runs the existing note normalizer and updates the submitted draft, then compares the normalized intended value with the failed operation's text. Equal submitted intent retains the existing hook retry/token; changed intended text uses a new hook edit and ordinary frozen-baseline validation. The changed-draft whitespace test passes. Package uncertainty control and parent native one-write Retry pass; this does not create permission to overwrite an external replacement.

The shared storage source has **no diff** between f532ad5 and d129950. Accepted 20a4591 hooks/6504589 engine remain dependencies rather than reopened review scope. The repair adds one package account-masking test; no prior assertion was deleted or weakened.

The complete prior review's contract matrix now resolves as follows: explicit Save/Enter/blur and string Clear; absent account mount; normalization; actual async completion and editable pending state; repeated same-attempt single write; successive new submission; Clear followed by newer text; edit-session and frozen physical baseline; external storage event and queued external replacement; quota/latest recovery; unchanged uncertain retry; account isolation; export payload/error; and beforeunload ownership all have source support plus passing evidence in this chain. Existing general header/EN-ZH/drag/clamp/device raw-conflict assertions remain in the independently passing package. Unsubmitted Escape followed by fresh external-source reopening and pending Escape both remain verified. Promise rejections still enter the explicit failure handler; no raw or legacy note setter fallback was introduced.

No additional product changes are requested for this defined slice. Native locking/process reopen, component ownership/fault oracles, downloaded-file verification and parent visual evidence have distinct scopes. Parent's accepted CSS repair 56fe1de/0320995 is not independently re-certified by this storage review.

**Limits unchanged:** this does not convert the legacy device-position writer or remove its allowed absent-mount `0`; make note/position writes atomic; persist unsaved drafts across process exit; authorize old-client activation; complete other Dashboard writers; or close full D2, AI-02, REL-05 or Dashboard-wide product acceptance. No deployment, push, product source change or ledger edit was performed by this review.
