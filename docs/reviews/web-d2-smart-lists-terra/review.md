# Smart Lists caller implementation — Terra evidence

Author implementation commit: **`40ffbe1`** (`fix(settings): recover Smart Lists map saves`). Contract input: [Smart Lists caller contract](../web-d2-smart-lists-contract/contract.md) at accepted `1666f42`.

## Product change

`smartListsPane` now uses the accepted registered `usePrefAutosaveAsync("xai_pref_smart_lists", { validate: isSmartListsMap })` binding. The caller owns a session-bound latest full-map draft, so its twelve rendered selectors preserve sibling and unknown string entries while coalesced/failed operations retain the newest desired map.

The narrow helper accepts empty and sparse JSON objects, checks each present known row against `show` / `if-not-empty` / `hide`, preserves unknown string entries, and copies own fields into a null-prototype output map. Missing known rows continue to render `show` without a mount write or seed.

The pane shows localized Saving, Saved, and Not saved feedback. Invalid/unavailable sources are disabled until explicit reload after repair. Conflicts retain the local map and expose Retry plus the explicit whole-map action **Discard local Smart Lists changes and reload saved choices**. Scoped recovery CSS keeps select and recovery-action touch targets at least 44px and wraps action buttons.

## Author verification

At `40ffbe1`:

- `pnpm --filter @repo/plugin-web-settings-rest test -- smartListsPane.test.tsx smartListsRecovery.test.tsx` — 2 files / 10 tests passed.
- `pnpm --filter @repo/plugin-web-settings-rest test` — 43 files / 286 tests passed. The pre-existing `morePane.test.tsx` emits React `act(...)` warnings; this batch does not modify that test or pane.
- `pnpm --filter @repo/plugin-web-settings-rest lint` — passed with zero warnings.
- `pnpm --filter @repo/plugin-web-settings-rest typecheck` — passed.
- `git diff --check` — passed before product commit.

The new caller tests cover every one of the twelve rendered selects across all three modes; sparse map persistence; unknown and own `__proto__` extension preservation; invalid-source read-only behavior plus repaired-source reload with zero application writes; quota failure with a combined latest-map Retry; and dirty external replacement held through an explicit discard/reload with zero reload writes. Existing `SL1`–`SL6` remain unchanged and pass.

## Baseline and remaining independent work

This author evidence does not replace the parent fixtures. Before this commit, parent component baseline `b3ecc69` retained its original lock/quota failures and absent-map control; parent native baseline `1267f50` additionally retained the dirty other-document replacement failure. Parent owns rerunning the fixed component and native matrices, whole-process saved-state reopen, and the five-viewport visual runner against `40ffbe1`. Astra independently accepts or rejects the fixed product afterward.

No registry, async preference engine/hook, account coordination, migration/deletion, global reset, provider, Tasks filtering, timer, or rollout source changed in `40ffbe1`. This commit makes the Smart Lists settings writer recoverable; it does not close D2, AI-02, REL-05, release, or deployment gates.
