# Smart Lists departure recovery — independent rejection

Astra, Web, 2026-09-09. Product **6bf02dee63d25a9fa16050aa252e5ae61428830a**, including ef97c1f. **Do not accept the complete [8565ca6 recovery/departure contract](../web-smart-lists-recovery-contract/contract.md) yet.** Eight independent failing cases expose session capability and departure-intent defects; the original 39-case persistence acceptance remains valid. This is not a reversal of the successful current-draft export controls or an account-storage/auth implementation defect.

## Fixed independent executions

| Layer | Result / raw evidence |
| --- | --- |
| New draft/export/capability cases | **7 PASS / 1 FAIL**, [export](export-astra-first-6bf02de.log) |
| Real composed host, data router and WebShellProvider | **3 PASS / 7 FAIL**, [final host](host-astra-final-6bf02de.log) |
| Actual App sign-out preflight with controlled auth/decision participants | **5/5 PASS**, [App](app-astra-bound-6bf02de.log) |
| Original unchanged storage caller assertions | **39/39 PASS**, [original](original39-astra-after-6bf02de.log) |
| Original fixed Settings package | **43 files / 286 tests PASS**, [package](package-astra-after-6bf02de.log) |
| Fixed Settings and Web types | **PASS**, [Settings](independent-6bf02de-settings-rest-types.log), [Web](independent-6bf02de-web-types.log) |

[Runner](verify-fixed.mjs), [export assertions](export.test.tsx), [host assertions](host.test.tsx), [actual App assertions](app.test.tsx), [type runner](run-types.py). All product imports resolve into an immutable git archive. Dependencies alone are reused; there is no product overlay or dirty-source acceptance. The original committed 39-case fixture is read from that archive. UI actions use actual handlers, and migration/raw initialization from the earlier suite remains explicit fixture work.

The initial host/App attempts failed to collect because the review directory lacked a direct react-router runtime resolution. Those diagnostic logs remain. After adding the runtime alias, the first host attempt hit a Node Request versus jsdom AbortSignal realm mismatch; it has four unhandled errors and is **not** a product acceptance/failure matrix. The final host fixture supplies a matching native AbortController for Node Request, retaining actual router navigation and all business expectations. No unhandled errors remain. The final focus oracle asserts focus wrapping, not a particular `preventDefault` implementation; the earlier extra event-mechanism assertion is retained in the earlier log, not a separate defect.

## 1. P1 — a retained A capability becomes authority over B's draft

`smartListsPane.tsx` constructs a guard with `token: draftRef`; that ref survives account epochs. `hasCurrentDraft`, `exportDraft` and `discardDraft` consult the current live ref rather than a captured creation scope. `isCurrent` is assigned `hasCurrentDraft`, so it also conflates a current clean binding with a stale binding.

Reproduction: retain A's registered guard, switch to B in the same mounted pane, create B's quota-failed second-row draft, then invoke the retained A capability. **`oldGuard.isCurrent()` returns true; its export downloads B's map; its discard clears B's hasDraft/beforeunload protection.** In this direct-capability case B's visible selection remains hide; do not misreport it as a physical overwrite. It is still wrong operation/owner attribution and hides B's recovery affordances.

Repair the pane capability, not just host buttons: create an immutable per-binding owner/epoch capability token; every query/action verifies that exact captured session and the matching draft. `isCurrent()` means the original binding is still current even if now clean. `isBlocking()` separately means that binding has a current unsaved draft. Old callbacks must return inert/refused after owner change and cannot export, discard, clear UI flags or unregister B's replacement capability. Preserve memory-only export under full storage denial; do not add a storage read to its owner check.

## 2. P1 — stale sign-out intent remains active and can discard B

`signOutIntentRef` contains a numeric token/Promise but no captured guard/session. Owner changes do not resolve/cancel `signOutDecision`: the existing stale-owner effect only handles a route blocker. Later `discardAndLeave` reads **the new current `guardRef`**.

Two host cases confirm the consequences. A→B while the sign-out decision is open leaves its Promise unsettled and the dialog visible. If B then creates a new failed draft, clicking the old decision's Discard **resolves old permission true and changes B's visible hide selection back to show** through B's current guard. No physical B write is claimed; its unsaved draft is discarded without B having initiated that decision.

Capture immutable guard/session ownership in each departure intent. On mismatch, cancel all that intent's promises false, remove its dialog and revoke its actions before accepting a new B intent. Closing/disposal already resolves a pending request false in the passing unmount control; account replacement requires equivalent cancellation while the composed host stays mounted.

## 3. P1 — route and sign-out decisions are independent and both get authorized

The host tracks the React Router blocker separately from `signOutDecision`. It permits both to be active, and a single Discard calls both `blocker.proceed()` and `signOutDecision(true)`.

- Sign-out first, then programmatic Notifications: the one decision grants sign-out **and navigates to Notifications**, instead of retaining only the original sign-out intent.
- Route first, then sign-out request: one discard navigates to the route **and returns true to the unrelated sign-out caller**, which should be rejected/cancelled.

Use **one departure decision state machine** for both kinds. First active intent wins; duplicate same-intent requests may share its result, incompatible later intents must be explicitly refused/coalesced without gaining authorization or replacing the target. Discard/Stay/export/completion/owner invalidation each resolve only that captured intent once. Numeric tokens that are never checked do not establish this contract.

## 4. P2 — programmatic navigation still replaces the original route

The narrow fix disables sidebar handlers while blocked but retains no original router transition. Start Notifications, then call the real router's `navigate('/app/settings/date_time')` while the first decision is open. Discard reaches **Date & Time**, not Notifications. The parent independently confirms the analogous Appearance destination in real Chrome.

Capture the original transition/continuation, including route history semantics, as part of the single intent. Do not execute the newest `blocker.proceed` merely because it is on the latest render. Stay must cancel competing queued transitions; permitted Discard/verified-save must resume the original route once. Preserve actual Back/Forward behavior rather than replacing a POP with a new push to a similar URL. The independent Back→Stay→Back→Discard control currently passes and must stay passing.

## 5. P2 — successful pending save cancels, instead of completing, the requested departure

Hold the physical key lock, edit the map, request Notifications and export the pending draft from the dialog. On release, the latest map is correctly saved. **The route remains Smart Lists**, although the contract permits the already-requested navigation after its current draft is verified. The pane's `isCurrent: hasCurrentDraft` returns false after success; the host interprets that as stale and calls reset instead of proceed.

Keep binding validity separate from dirty state and from revoked/disposed identity. A current clean/saved binding may release only its captured original departure, while a stale binding cancels it. Do not allow a previous success to release a newer unsaved map. This correction belongs with findings 1–4's session/intent model.

## 6. P2 — modal focus is transferred but not contained

The div has `role=dialog`, `aria-modal=true`, initial focus and an Escape handler, but no focus containment/inert background mechanism. The independent key event on the final action does not wrap focus to the first action. Focus entry, Escape and return to the original select pass; they are not substitutes for Tab/Shift+Tab containment.

Keep keyboard focus inside the actual modal, support reverse cycling and return focus after Stay/Escape. A proper native modal or a correctly implemented custom focus trap is acceptable. Use native keyboard evidence for any browser-managed modal behavior that jsdom does not implement; do not change the business focus-containment requirement merely to fit a mock.

## Passing controls and source boundaries

The seven passing export controls use an actual Blob containing the latest complete map and own prototype fields under full read/write denial; Blob/URL/anchor exceptions retain draft/error/guard; clean and initial-invalid mounts do not invent drafts; pending/conflicted beforeunload is registered; explicit discard clears it; uncertain export retains the actual intended map and Retry verifies one write; owner change during URL creation revokes without clicking. No persistent-source read is needed for export. These successful local cases do not grant an old guard authority over a new session.

The host also passes repeated same sign-out request single-flight, Stay resolving both false, and unmount cancellation/unregistration. The corrected native-signal fixture passes ordinary Back navigation preservation/discard. The original39 tests confirm map schemas, all twelve producers, owner write refusal, actual migration and preservation of old data remain good.

The five App tests execute the actual App handler and AvatarMenu confirmation, with non-vacuous element assertions, the real host departure registration API, a controlled pending decision and instrumented auth participants. Before resolution there is no account invalidation, auth dispatch, clear or redirect. Stay, changed account scope and changed auth generation all refuse; allowed original identity dispatches exactly its captured coordinator generation. The legacy fallback Stay is also inert. These establish App's downstream checks, **not safety of the upstream host deciding which guard to discard**; that is where the confirmed B-draft loss occurs. No live provider-network result is claimed.

## Parent native/visual evidence

Parent **b18939e** retains the real programmatic-destination failure and the separately scoped browser passes. At fixed6bf02de the original sidebar journey/intent/focus cases pass, actual downloaded map and Stay/Escape behavior pass, and original Smart native5 plus observed Chrome **10817→10832** saved raw/actual-select checkpoint pass. Complete CSS at five widths×812 and viewed375 moves failure feedback from y912 to y69 with 44px controls in the first viewport. These resolve the earlier presentation problem. They do not cover simultaneous route/sign-out, account-replaced dialogs, reusable stale capabilities or focus trapping. [Host report](../web-d2-smart-lists-host-native/review.md), [export/unload](../web-d2-smart-lists-draft-native/review.md), [visual](../web-d2-smart-lists-visual/review.md). All are parent executions, not Astra native reruns.

## Exact repair ownership and minimum next chain

Sol should repair the **whole shared departure intent/session model**, retaining the original8565ca6 boundaries:

- `packages/plugin-web-settings-rest/src/panes/smartListsPane.tsx`: captured owner/epoch guard capability, separate current/dirty checks, guarded export/discard/unregister.
- `packages/plugin-web-settings-shell/src/types.ts` and its type export only if needed to make immutable session/intent results explicit.
- `apps/web/src/routes/modules/composedSettingsRegistration.tsx` and `settingsDeparture.ts` (or its narrow host helper): one route/sign-out decision, original transition preservation, owner/disposal cancellation, current-save completion and modal focus behavior. Narrow related CSS/labels/tests are allowed.
- Existing `apps/web/src/App.tsx` preflight is passing. Preserve it; change only a necessary typed delegate interface adaptation, never remove captured scope/auth-generation checks.

Do not change storage hooks/engine, auth coordinator/provider implementation, physical keys, global reset, Tasks filtering or production activation. Do not fix only sidebar input, suppress Promise rejection or weaken old business assertions.

Required after chain: unchanged export8, host10 and actual App5 with the corrected test runtime; original39; fixed Settings package and Settings/Web types; retained parent real programmatic/sidebar/draft/unload/visual oracles; add native coverage for the repaired modality or competing/owner decision where relevant. Original source/diagnostic logs remain separate. Once these fail groups are resolved, stop at the defined recovery slice rather than opening unrelated providers/timers. Forced auth revocation/crash durability and all other callers' REL-05/09 gaps remain explicit; no numbered gate is closed here. Exact independent files only, no product/parent/ledger change, no push.
