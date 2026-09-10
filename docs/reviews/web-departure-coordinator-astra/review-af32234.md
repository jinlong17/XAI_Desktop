# Astra review — departure coordinator extraction

**ACCEPT the bounded mechanical extraction at af32234025e0424c4f479b083460332fb1541877.** No reproducible regression found. This is a generic non-author source review plus new public-boundary tests, not a Workflow V2 execution or a Pomodoro acceptance.

Compared exact parent **7ec7c0afc0dfcdadf928e206991a43cdc8c7d0c8** with af32234. The product diff contains exactly `apps/web/src/routes/modules/composedSettingsRegistration.tsx` and new `departureCoordinator.tsx`. `settingsDeparture.ts`, App, public Pane guard types and Collaborate product source are unchanged. Current Sol/Pomodoro/host worktree changes were excluded through `git archive af32234`; no product or parent's logs were written by this reviewer.

## Source-level equivalence and component-boundary review

| Concern | Comparison and finding |
| --- | --- |
| Guard lifecycle | Same guardRef/guardVersion, token-matched unregister and captured intent guard checks moved into the coordinator. Pending decisions still use the captured guard, with `isCurrent` revocation before `isBlocking` auto-continue. Structural `DepartureGuard` matches the existing readonly token/optional label/functions interface; no cast or data translation was inserted. |
| Stable callback boundary | `registerDepartureGuard` remains a zero-dependency callback; new `isDeparturePending` is likewise stable and reads the intent ref. The render-prop object itself is newly created each render, but the child component identity and callback references remain stable. The current registrar is the stable imported `registerSettingsDepartureDelegate`; adding it to the effect dependencies is necessary and does not cause current caller churn. |
| First intent | Reservation before React Router's blocked transition, programmatic navigate interception, route/sign-out mutual exclusion, matching-intent completion and pending sidebar suppression are preserved. New `isDeparturePending()` replaces direct access to the same ref condition. No new intent queue or feature-local arbitration was introduced. |
| Relative/object/numeric navigation | Same `resolvePath`/numeric admission check, captured original navigate method, `Reflect.apply` receiver and exact original to/options replay. Numeric POP and subsequent Forward behavior, object search/hash/state/replace/preventScrollReset and `fromRouteId`/relative resolution remain covered by actual public router outcomes. This accepts preservation of the current supported behavior, not proof of every possible router configuration. |
| Layout and route context | Coordinator introduces a React Fragment, no DOM wrapper or route boundary. Sidebar/detail/dialog DOM ordering and classes remain the same. `useLocation` and DataRouterContext are read under the same matched route context. Localized labels/focus trap/Stay/Escape/export/discard move intact. The generic component retains the old Smart Lists fallback when a participant omits a label; future features must supply their correct label. |
| Unmount | Wrapper cleanup restores the captured original router method only while its own wrapper is installed. Pending sign-out resolves false; route reset and dialog/focus cleanup remain. Newer independently registered Settings delegates remain protected by unchanged identity-matched unregister. |
| Settings compatibility | The unchanged singleton API still accepts reason `sign-out`, stores a delegate, invokes its Promise-returning request method and defaults to true with no participant. Injection only relocates registration; existing App preflight/auth behavior is untouched. |

## Newly executed Astra evidence

All tests run against immutable af32234 product and package sources, using real React/DataRouter and the public Settings departure bridge. Generic test guards are deliberate controlled capabilities, not a claim about any particular future feature's draft state. No engine, router result, persistence result or coordinator implementation is mocked.

- `boundary-af32234.log`: **3/3 PASS**. New independent tests show:
  1. Parent English/Chinese rerenders while a first route intent is pending keep one participant mount/registration and one delegate registration. Both exposed callback references stay stable. Export preserves location; explicit discard executes once and reaches the first route with original state, then restores original navigate.
  2. Duplicate sign-out requests share the same pending Promise. Unmount rejects it, does not discard/export, unregisters the feature and restores navigate; a subsequent direct navigation works with its state intact. The no-participant helper behavior remains true.
  3. Unmount of the old coordinator does not unregister a newer delegate installed in the same compatibility singleton.
- `wrapper-af32234.log`: original fixed **5/5 PASS**. Object/search/hash/state/replace/scroll options, actual relative router control, numeric Back/Forward first intent, nonparticipant/unmount method restoration and latest-failed-draft blocking remain intact. These original assertions were executed directly from the archived revision without edits.

Reproduce from repository root:

```sh
node docs/reviews/web-departure-coordinator-astra/verify-fixed.mjs af32234
```

Logs refuse overwrite; a fresh optional fourth argument provides a suffix for repeat runs. Both suites exited0; temporary archive directories were removed. No tests/processes remain running.

## Separately attributed existing evidence

Read the parent's fixed af32234 independent logs: Smart host10, entry3, wrapper5, App5 in `../web-smart-lists-recovery-astra/*parent-extract-af32234.log`, and actual Collaborate host8 in `../web-collaborate-recovery-independent/host-parent-extract-af32234.log`; each reports the exact af32234 hash and exit0. Those are parent executions, not relabelled Astra runs. Sol's author Web types/lint/package and regression results are supplementary, not the sole acceptance basis. Do not sum overlapping wrapper/host/package layers into a coverage total.

## Handoff boundary

This accepts extraction of existing Settings behavior into the reusable host component. It does **not** accept Pomodoro wiring, timer lifecycle, preferences, auth changes, production behavior or arbitrary simultaneous active coordinators. Any next feature integration must independently prove guard registration/disposal, stable registrar/label, first-intent coordination and the feature's own draft/owner semantics. In particular, there is no Pomodoro caller hookup in af32234 and no Pomodoro PASS from this review.

The parent may record the extraction as accepted. No full numbered audit item is closed; the312-item objective and existing open REL-05/REL-09/D2 scope remain unchanged. No push, deployment, branch promotion or ledger edit was performed. All new Astra artifacts are confined to this directory.
