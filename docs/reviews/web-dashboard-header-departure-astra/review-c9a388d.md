# Astra c9a388d: position repair passes; blur lifecycle rejected

Fixed product `c9a388dfb965648496f62e486bae30555d56662c`. **CHANGES_REQUIRED** for the complete Header contract. Position latest-operation repair and targeted recovery/export checks pass; three new public blur/pointer lifecycle assertions fail. All executions below use the existing immutable archive runner and real component/official event setup. The app-supplied `isDepartureTarget` callback is exercised as a public optional protocol in the lifecycle fixture, not a mocked product hook or a claim about actual app selectors.

## Independent results

| Layer | Fixed execution | Result |
| --- | --- | --- |
| Original boundary failures plus exact B and failed-new-Same positives | boundaries-c9a388d.log | 5/5 PASS |
| Targeted read/write isolation and export failures/owner/locked effects | recovery-outcome-c9a388d.log | Original eight checks PASS |
| New preflight failure survives predecessor: no Retry, successful explicit Retry, explicit Retry with new-value quota failure | recovery-outcome-c9a388d.log | Three checks PASS; whole recovery group11/11 |
| Same corrected recovery oracles at previous product9193353 | recovery-outcome-9193353.log | Eight PASS, three correct settlement FAILs |
| Unrelated parent rerender, unrelated pointer release, window focus loss, ordinary blur control | blur-c9a388d.log | Three correct FAILs, ordinary blur PASS |

### Retry oracle correction, with before evidence retained

The first c9 run in `recovery-c9a388d.log` passed nine cases and failed the Retry variant because that assertion demanded native40/continued guard even after the user explicitly retried and the new70 was genuinely persisted. That demand was over-constrained; it is **not a c9 product failure**. The historical log remains intact.

The final sequence now asserts business outcomes instead of requiring one implementation: without Retry, native40/UI70 remains guarded; with restored storage and explicit Retry, native70/UI70 can clear only after that actual success; with actual setItem70 denied, native40/UI70 must remain guarded. All three fail correctly at919 and pass atc9. This correction does not erase the earlier confirmed loss (native40/UI40/guard false) or suppress an actual product failure. It adds a real retry-failure control as well as allowing legitimate successful retry.

Source review corroborates the repair: old success no longer clears a distinct newer failure, and a caller-preflight refusal carries no hook retry token. A new explicit retry follows its own edit/result. Existing note/device protocols and uncertainty semantics remain dependencies for the final combined regression.

## New fixed public failures

**P1 — ordinary blur save disappears on parent rerender.** Open/edit the real Header input, focus it through its real focus timer, call its actual blur, then rerender Header with only the parent's `now` clock prop advanced before the deferred timer executes. After timers settle, physical note remains Original A instead of latest edited text. Normal blur with no intervening rerender saves correctly. c9 installs pointer listeners in an effect depending on `saveDraft`; the hook result changes that callback each render, and cleanup cancels the pending ordinary save. The Dashboard's regular tick makes unrelated parent rerender a real lifecycle boundary. Keep listeners stable and preserve the correct pending blur action across unrelated renders without applying it to a successor session/account.

**P1 — unrelated pointer-up saves before the navigation pointer is released.** Pointer7 begins on a recognized navigation candidate; real input blur is deferred. While7 stays held, pointer8 releases. c9's boolean candidate treats any pointer-up as settlement, writes the latest text and can remove the protection before pointer7's later navigation click. Expected original bytes until the relevant pointer finishes/resolves; canceling the correct pointer must restore ordinary blur behavior. The failing run stops at the premature-save assertion; its later correct-cancel positive remains to be reached by the fixed after run.

**P2 — a canceled pointer strands later keyboard blur.** Navigation pointer7 blurs the editor, then the window loses focus and no pointer-up returns. On returning to the still-open input, an ordinary focus/blur without any pointer event cannot save: native remains Original A. The candidate boolean was never canceled. The test permits either safe ordinary save when the canceled candidate settles or preserving it until the later ordinary blur; it requires that the later normal operation work without inventing an unavailable pointer-up. Dispose/cancel/window-loss behavior must clear the obsolete candidate and keep the captured session/scope safe.

These three failures substantiate the earlier read-only advice. They are separate from the native slow AppRail/widget failures that the parent/Sol own. Larger timeouts do not repair wrong lifecycle ownership.

## Remaining review boundaries

Terra is independently implementing stable listener/latest callback, pointer identity/target cancellation and broader host-owned recognition. This report makes no PASS claim for that active dirty code. Final actual app target recognition must still be validated against rail/widget and supported Topbar/Avatar navigation, with ordinary Tab/non-navigation save as positive controls. The Header component tests do not substitute for real Shell event paths.

Parent/Sol own the final native layouts, source/owner/export modes, original parent2/device5/reload4, host first-intent/pending sequences and shared regressions. Their separately reported passes remain valid within those scopes. A new fixed product must pass original boundaries5, recovery11 and blur4 unchanged, plus that final full contract matrix. No Header, REL or D2 acceptance is made here.
