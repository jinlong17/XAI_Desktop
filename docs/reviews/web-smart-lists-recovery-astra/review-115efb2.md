# Smart Lists recovery: original defects repaired, first-entry arbitration still fails

Astra independent review, Web. Fixed product **115efb2337ac45f9cf6ba3113f9ea34d10ab985e**. The original [286bcc7 rejection](review-6bf02de.md) cases now all pass independently, but **the complete [8565ca6 departure contract](../web-smart-lists-recovery-contract/contract.md) remains unaccepted** because two same-turn first-intent cases fail. This is the existing repeated-operation/first-intent boundary, not a new provider or storage scope. Preserve the earlier 39-case storage acceptance and the repaired owner-capability, focus, save-completion and settled-intent controls.

## Immutable independent results

| Layer | Result | Raw evidence |
| --- | --- | --- |
| Original export/capability | 8/8 PASS | [export](export-astra-final-115efb2.log) |
| Original actual composed host + real data router | 10/10 PASS | [host](host-astra-final-115efb2.log) |
| Original actual App preflight | 5/5 PASS | [App](app-astra-final-115efb2.log) |
| Original unchanged storage contract | 39/39 PASS | [storage caller](original39-astra-final-115efb2.log) |
| Original Settings package | 43 files, 286/286 PASS | [package](package-astra-final-115efb2.log) |
| Settings / Web types | Both PASS | [Settings](independent-115efb2-settings-rest-types.log), [Web](independent-115efb2-web-types.log) |
| New original-contract entry ordering | **2 FAIL / 1 PASS** | [entry](host-entry-astra-first-115efb2.log) |

[Runner](verify-fixed.mjs) and [new entry assertions](host-entry.test.tsx). Every product import resolves into git archive115efb2; installed dependency runtimes are reused, no product overlay or dirty-source import. The original export8/host10/App5/39 assertions were not changed. The runner only adds the separate entry file/mode. The new file uses the original host fixture, actual composed registration, WebShellProvider and createMemoryRouter; it does not replace the router blocker/delegate or inject internal intent state. Native AbortController matches Node Request as documented in the retained earlier diagnosis. No unhandled errors appear in the new execution.

## Confirmed residual: intent ownership starts after the route attempt

`composedSettingsRegistration.tsx` calls `useBlocker` with a predicate that only returns `canBlock()`. The route intent is stored later in `useEffect` after the blocked state renders. In contrast, the sign-out delegate assigns its intent synchronously. Therefore invocation order and effect-observation order differ.

1. **P1 — first route can be replaced by sign-out before the effect runs.** With a real quota-failed Smart draft, call actual `router.navigate(Notifications)`, then `requestSettingsDeparture('sign-out')` synchronously inside one act. Flush, then choose Discard. Expected: competing sign-out resolves false, only Notifications proceeds. Actual: sign-out resolves **true**, and the route remains Smart Lists. The later request receives authorization from a decision belonging to the earlier route attempt. This host result does not assert a live auth network call; the independently passing App checks would receive the wrong upstream permission.
2. **P2 — first programmatic route can be replaced before the effect runs.** In one act, navigate Notifications then Date & Time. After flush and Discard, actual destination is **Date & Time**, rather than Notifications. This is the same original-destination contract as the existing separated-turn test; that test now passes because its first effect has already captured the continuation.
3. **Control PASS:** sign-out first then route, also synchronously in one act, grants only sign-out and keeps the route at Smart. First-intent arbitration works when the first request follows the already-synchronous sign-out path.

These are real public invocation sequences against the actual data router. No synthetic change to a guard or pending ref creates the failure. The old source already exhibited related settled-intent failures; its immutable logs remain unchanged. No new native same-turn result is claimed.

## Minimal repair and preserved semantics

Ownership remains **`apps/web/src/routes/modules/composedSettingsRegistration.tsx`**, with an optional narrow host departure helper and its tests if necessary. Reserve the first route attempt synchronously at admission, tied to its immutable guard/session, before any later route/sign-out can win. Attach/retain the corresponding original transition continuation safely when available. Merely moving the same capture to a layout effect still leaves a synchronous admission gap. Returning false for an incompatible second route is not rejection: it would allow that navigation unblocked.

The implementation must coordinate admission and continuation without turning a POP into a push, replaying a newer blocker continuation as the original, or firing React state updates unsafely inside a routing predicate. A host-local reservation and pending-transition model is allowed; product factoring belongs to the author. Preserve native Back/Forward and first POP plus competing route, exactly-once completion, Stay resetting the captured decision, same sign-out Promise sharing, and cancellation on owner/disposal. Do not change storage/auth APIs, pane business schema, physical keys or activation.

The pane's new immutable binding token and captured scope fix the stale A capability; export/discard check that binding, and `isCurrent` is now separate from `isBlocking`. Original stale export/B-discard cases pass. Current latest-map saving now releases the captured route; source still requires matching latest full map and saved status before clearing the draft. The accepted hook handles pending newer edits; there is no reason here to remove those protections. Old-save/new-edit semantics remain required in the repaired state model; neither an earlier success nor a clean but stale binding may grant a later request. Existing focus wrap, owner cancellation and all original assertions must remain intact.

Minimum next chain: unchanged new entry3 + export8/host10/App5, original39, fixed Settings286/types, and retained native first-route/POP/owner/mixed-intent/keyboard controls. Add actual browser same-turn navigation evidence if needed for the chosen router coordination. No unrelated regression expansion is necessary.

## Parent evidence, separate from this execution

Parent **3e05d1b** independently passes fixed115efb2 seven actual native modes: programmatic intent, owner/sign-out, route/sign-out, focus trap, Back/Forward, Back plus later programmatic route, and full journey. Actual disk export/full-denial/unload pass, and native5 plus whole-Chrome **19233→19250** confirm saved raw and actual select values after reopen. See [host native report](../web-d2-smart-lists-host-native/review.md) and [draft/download report](../web-d2-smart-lists-draft-native/review.md). These modes separate attempts across browser interactions; they do not contradict the new same-turn failures. Parent's first reopen driver exit13 was diagnosed and retained; corrected child-exit handling/cleanup passed the unchanged business assertions. It is not a product failure or unsaved-crash durability proof.

## Next participant: Collaborate requires all three controls, with mixed ownership

Read-only suggestion, **not implementation or acceptance**. Fixed source `packages/plugin-web-settings-rest/src/panes/collaboratePane.tsx` has three live controls. Storage `internal/accountOwnership.ts` and `internal/registry.ts` establish:

| Control / logical key | Scope / domain | Current caller |
| --- | --- | --- |
| default_share | account; comment/edit/view; default comment | async autosave already |
| show_avatars | device; boolean; default true | legacy usePref setter |
| mention_notify | device; boolean; default true | legacy usePref setter |

The next complete feature batch should migrate both booleans through the accepted explicit async hooks, preserve the account/device split and three existing physical keys, and supply truthful per-field pending/error/retry/source/discard state. No mount seeding and no whole-three-key atomicity claim. Partial success must retain other fields' latest drafts; retry only intended failed operations and preserve uncertainty tokens. Device writes/drafts remain independent of A→B; account draft and capability do not transfer into B. Locks remain the existing per-key/account protocol according to each key's ownership.

Design a versioned **scope-labelled** three-choice export with current-authorized account value and device values, not a fabricated account map. Before author implementation, specify whether account replacement refuses an old combined export or offers a newly captured device-only export; stale callbacks must never combine A data with B. Account replacement must invalidate old departure permission without silently discarding unrelated device drafts. That is a necessary mixed-scope participant design decision; do not copy the Smart all-account reset policy blindly.

Reuse the host guard only after its entry arbitration is repaired. Complete this participant's export under full storage failure, beforeunload, actual host navigation/sign-out Stay/Export/Discard and capability invalidation. Preserve no-Save-footer live controls. Required independent cases include all three actual producers, partial successes, latest toggles, source/conflict isolation, unchanged-token retry, account lock/migration fencing for default_share, device continued editing across A→B, actual downloaded payload, unload and the real composed host. Own pane/i18n/scoped styles/tests plus only necessary typed guard/host generalization; no accountOwnership, registry domain, engine, provider or shared global reset expansion is currently justified.

Full REL-05/REL-09/D2 and other callers remain open. This review changes only independent evidence; no product, parent files or ledger edits, and no push.

Parent native addendum **3ddd9ff**: fixed115efb2 also correctly fails two actual Chrome same-turn modes, with both calls in one `Runtime.evaluate` and no intervening yield. `same-turn-routes` reaches later Appearance after Discard; `same-turn-route-signout` observes the later sign-out still pending where it should already be refused. This independently confirms the admission gap in the browser; its earlier-stage pending oracle is separate from Astra's post-Discard true-permission assertion. See the parent host native report/logs; no parent evidence was modified or copied into this commit.
