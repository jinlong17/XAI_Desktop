# REL-03 independent joined verification

Verdict: **REL-03 scoped local-account isolation verification PASS after repairs `96d1914`, `a8e3a03` and `992f688`. This does not close REL-06 or claim hosted-auth/cross-vendor verification.**

Reviewer did not implement product changes. Review baseline includes commits `44fa05c`, `ebb91c2`, `8b8497b`, `85451f6`, `e1cbe5c`, `575cfd9`, `fae9398`. Settings recovery was initially in progress; final committed implementation `992f688` and host `a8e3a03` were subsequently independently verified as described below. No real user profile, credentials, hosted auth or external API was used.

## Reproducible blocking failure

Run from repository root:

```sh
node docs/reviews/web-account-data-isolation/verify-browser-joint-independent.mjs
```

The harness bundles the real Web `webShellModuleRegistrations` export with esbuild's normal package side-effect handling, checks every `ACCOUNT_LOCAL_KEYS` importer, then exercises real Chrome localStorage, IndexedDB, WebCrypto and Web Locks in an isolated temporary profile. No package storage or encryption mocks are used.

Actual result: 14 owner validators are unavailable after bundling:

- `xai_board_filter_by_id`, `xai_board_inbox`, `xai_board_panels`, `xai_board_workspaces`, `xai_boards_v2`
- `xai_calendar_events`, `xai_countdowns`, `xai_dashboard_stickies`, `xai_dashboard_weather`
- `xai_habits_state`, `xai_matrix_state`, `xai_meditation_prefs`, `xai_pomodoro_sessions`, `xai_task_cols`

Owner `index.ts` files import `./internal/accountMigration.js` for registration, but package `sideEffects` arrays omit that file. Matrix and Dashboard Widgets also omit their index entry. The bundler emits `ignored-bare-import` warnings and removes the registrations. Importing valid legacy Tasks through `migrateAccount` consequently rejects with `Module format validator is unavailable; retain this category until validation is available.` Original data survives, but the explicitly promised import action cannot complete. The failing output is retained in `20260909-joint-browser-before.log`.

This is not a hypothetical optimization concern: it reproduces both through Tasks' public index and the real host registration graph. The previously written unbundled migration guard suite independently ran **38/38 PASS**, demonstrating its coverage gap. Fix package metadata or make required initialization explicit, and retain a bundled importer coverage check.

## Verified repair

Repair commit `96d1914` retains owner registration modules in 13 package `sideEffects` declarations. The default command was independently rerun with normal annotations enabled: **exit 0, seven joined checks PASS**. Every account-local importer survives the actual host registration graph. The added final-marker quota fault happens after real secret staging and proves the old generation remains visible while staged data and ciphertext remain unpublished. The before-fix blocker is resolved. `20260909-joint-browser-after.log` retains the successful output.

## Diagnostic downstream checks

Before expanding the harness to the entire host graph, a diagnostic run with a temporary diagnostic annotations bypass (removed from the final runner) completed five joined checks with real Chrome storage/crypto/locks:

1. Complex bilingual Tasks with source-link metadata, multiline notes and original JSON whitespace imported byte-for-byte. Unknown corrupt legacy bytes and original v1 AES-GCM ciphertext remained unchanged in quarantine/archive. A separately adopted synthetic legacy Anthropic key and preexisting DeepSeek key both loaded from the new account generation.
2. Rollback restored the prior generation, removed imported data/key visibility, retained preexisting custom account data/key, and revoked the old generation's writer.
3. A pending crypto save rejected after A→B; B could not load A's data/key.
4. Demo A had independent data and BYOK despite the same account identifier.
5. Exporting and deleting captured A while B was current preserved B's content/key, original unowned records and device preference.

Ignoring annotations is a diagnostic bypass only and is **not** release acceptance. The default command subsequently passed after product repair `96d1914`, as recorded above. The joined helper probe does not simulate a hosted Supabase response. A separate rendered Settings recovery probe was later independently rerun as below.

## Additional read-only observations

- Raw localStorage scan across Web feature packages found private repositories using `accountScope.physicalKey`; remaining raw calls inspected are classified device preferences or the host's appearance settings. This is a bounded source scan, not a formal absence proof for arbitrary future keys.
- Settings' new JSON deletion receipt initially disagreed with storage's `=== '1'` tombstone check. This was reported immediately. Current source was subsequently observed using `!== null` and preserving an existing tombstone during account erasure; the final Settings commit was subsequently independently verified.
- Cross-vendor verification is not claimed; the known Claude authentication failure remains an external verification limitation.

## Artifacts

- `joint-browser-probe.ts`: independent joined assertions and synthetic fixture creation.
- `verify-browser-joint-independent.mjs`: isolated browser runner, automatic process/profile cleanup.
- `20260909-joint-browser-before.log`: actual pre-fix bundled failure.

Current tombstone compatibility was also reviewed in committed repair `5ae7b7a`: any non-null deletion tombstone fails closed, and account cleanup preserves existing JSON recovery metadata. Consumer test-fixture update `23b83e4` was observed but not counted as independent test execution here.

## Final Settings and host verification

Against `992f688` / `a8e3a03`, the final joined native-Chrome probe independently passed **eight checks**. The eighth starts an actual JSON deletion receipt for C, rejects a stale C writer, switches to B, injects a real IndexedDB open failure during C cleanup, proves the receipt remains `local-data-cleared`, restores IndexedDB, retries cleanup successfully, and verifies B's content and encrypted key remain untouched. Updated successful output is in `20260909-joint-browser-after.log`.

Independently executed:

- Settings `oauthState`, `accountDeletionRecovery`, `CallbackPage`, `useAccountDeleteOrchestrator`: **4 files / 41 tests PASS**.
- Host review and route review: **2 files / 6 tests PASS** (executed from `packages/plugin-web-storage`, as required by that config's relative include).
- Owner migration guard suite: **1 file / 38 tests PASS** (executed from repository root). The native bundled probe additionally prevents its earlier tree-shaking blind spot.
- Reviewed and reran `packages/plugin-web-settings-rest/docs/verify-browser-deletion-recovery.mjs`: **PASS**, full-page reload with pending receipt, signed-out recovery notice, then B active while A localStorage/real IndexedDB cleanup finishes. Synthetic opaque ciphertext is sufficient for that deletion-only UI check; the joined independent probe separately exercises actual AES-GCM secret adoption/load/rollback.

Boundaries retained: these are isolated local browser and component tests, not hosted Supabase E2E, whole-browser process-kill recovery, Cloudflare deployment, or cross-vendor verification. If the very first receipt write fails after server deletion already succeeds, there is no durable local receipt to recover after reopening; this is a remaining REL-06 persistence-failure task and is not closed by REL-03. Existing wrong-directory test invocations returned no tests and were corrected to the intended working directories; only the actual passing executions above are counted.
