# Smart Lists user-controlled recovery — bounded acceptance

Astra, Web. **Accept the complete defined [8565ca6 Smart Lists current-owner draft/export/departure slice](../web-smart-lists-recovery-contract/contract.md)** on fixed **a2c0fe0df5ef336b5cc98dc6bfc7d1eecf420a11**. The eight earlier failures and the two same-turn residual failures are independently repaired; their [6bf02de](review-6bf02de.md) and [115efb2](review-115efb2.md) reports/raw logs remain intact. This is not closure of full REL-05, REL-09, D2 or all Settings functionality.

## Fixed independent evidence

| Layer | Result | Raw log |
| --- | --- | --- |
| Original first-entry admission | 3/3 PASS | [entry](host-entry-astra-final-a2c0fe0.log) |
| Original actual composed host/data-router | 10/10 PASS | [host](host-astra-final-a2c0fe0.log) |
| Original Blob/export/owner capability | 8/8 PASS | [export](export-astra-final-a2c0fe0.log) |
| Actual App preflight | 5/5 PASS | [App](app-astra-final-a2c0fe0.log) |
| Original full storage-caller contract | 39/39 PASS | [39](original39-astra-final-a2c0fe0.log) |
| New navigation-interface and latest-save controls | 5/5 PASS | [wrapper](host-wrapper-astra-native-relative-a2c0fe0.log) |
| Fixed Settings package | 43 files, 286/286 PASS | [package](package-astra-final-a2c0fe0.log) |
| Settings and Web typechecks | Both PASS | [Settings](independent-a2c0fe0-settings-rest-types.log), [Web](independent-a2c0fe0-web-types.log) |

[Runner](verify-fixed.mjs), [new wrapper assertions](host-wrapper.test.tsx), and existing immutable export/host/entry/App assertions. All product imports come from a git archive of a2c0fe0; installed dependencies are reused with fixed workspace source aliases. No product overlay, parent fixture modification or author-log substitution. Counts describe distinct layers, not an additive coverage percentage.

The first wrapper execution is retained in [diagnostic](host-wrapper-astra-first-a2c0fe0.log): four pass, one assumed `/app/settings/notifications` for route-relative navigation inside the `/app/settings/*` splat. The **unwrapped actual data router** produces `/app/settings/smart_lists/notifications` for those same arguments. The final oracle establishes this native-router result explicitly and compares wrapped behavior with it; it does not change product code or weaken an intended destination requirement. This was a fixture expectation error, not a product regression. All five final assertions pass without unhandled errors.

## Source and repaired behavior

The host now reserves the first programmatic route before effects can observe competing requests. Its data-router wrapper saves the original `navigate`, dispatches with the router receiver via `Reflect.apply`, and retains the exact original `to`/options invocation for the eventual permitted transition. Later incompatible routes do not reach React Router to replace that continuation; sign-out sees the synchronous reservation and refuses. Browser-originated POP still enters the actual blocker predicate and retains the native continuation rather than synthesizing a PUSH.

Layout-effect installation follows the current router/path; cleanup restores the previous method only if this wrapper still owns the property. It does not overwrite an unrelated successor wrapper. Actual nonparticipating-pane navigation and full host unmount restore the original method and allow subsequent navigation. The wrapper is host-owned and mounted only with composed Settings, not a new global router implementation.

The new independent interface checks verify exact object pathname/search/hash, state, replace and preventScrollReset; route-relative/fromRouteId behavior against an unwrapped router; numeric Back plus a competing push and preserved Forward; nonparticipating Settings navigation and original function identity after unmount. The newer-map test holds the key, starts a route request, edits another row, then permits the older map write while failing the latest map. The dialog and latest visible selection remain, and only Retry's verified latest write releases the original route. This demonstrates that old success does not silently authorize departure with newer unsaved work.

Original controls additionally preserve captured owner/session invalidation, unmount cancellation, sign-out Promise single-flight, Stay/Escape, export remaining in the dialog, same-turn route priority, first target, physical bytes and keyboard containment. The unchanged pane's immutable capability checks prevent an old A callback from exporting or discarding B; current binding and current dirty state remain distinct. Actual App preflight tests retain account/auth-generation checks before invalidation/auth/clear/redirect. No provider network result is claimed.

`UNSAFE_DataRouterContext` is an intentional compatibility dependency: a future React Router upgrade must rerun the fixed wrapper/POP/relative/unmount controls and native history cases. The fixed installed router behavior is verified here; this does not promise arbitrary future router versions or coordination with untested third-party navigate replacements. No further generic router expansion is needed for the defined contract.

## Contract closure and parent native layers

The earlier 39-case acceptance continues to cover all twelve producers, sparse/empty/prototype/unknown data, invalid and unavailable source, latest full-map drafts, conflict, unchanged uncertainty retry, owner/generation/tombstone, actual migration and fixed package regressions. Export8 covers actual Blob schema, full storage denial, setup failures, pending/uncertain snapshots and stale capabilities. Host/App plus the new controls cover normal departure, first intent, focus, captured ownership, verified-latest completion and voluntary sign-out preflight. Browser unload is a warning mechanism, not durable storage.

Parent **348a095** independently passes fixeda2c0fe0 native same-turn routes, same-turn route/sign-out, Back, Back plus competing programmatic route, programmatic first intent, route/sign-out and owner cancellation. Parent **8d654ed** adds actual host-unmount original `router.navigate` identity restoration, external-page navigation/Back and no stale dialog. See [parent host report](../web-d2-smart-lists-host-native/review.md). Earlier **3e05d1b** at115efb2 covers actual downloaded file/full-denial/unload, native focus/journey and Chrome19233→19250 saved raw/actual-select checkpoint; unchanged pane/export code and the present full independent chain preserve that bounded evidence. The earlier reopen driver exit13 remains a diagnosed harness/cleanup issue, not a product failure. These are parent native executions, not Astra browser reruns, and no unsaved process-crash guarantee follows from saved checkpoint persistence.

The previously verified title-level status/recovery and complete-CSS viewport evidence remain applicable; no CSS changed in this repair. The original forced revocation, crash/kill and unavailable-storage durable recovery limits remain explicit. Other callers do not inherit this acceptance; SET-01 duplicate shell and SET-06 selector work remain separate.

The next mixed-scope participant is defined in the [Collaborate three-control contract](../web-collaborate-recovery-contract/contract.md). This commit contains independent review/tests/logs only, no product, ledger or parent evidence edits and no push.
