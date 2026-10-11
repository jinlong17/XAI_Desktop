# Astra shared verification at 96c4915

Fixed product `96c491542e1a47847fcce0bd431491773dbabbf4`. Independent Astra execution of all assigned shared and Header layers has completed. **The main shared fix and regressions pass, but the explicitly supplied empty-token case still requires its narrow correction; do not accept the whole token boundary at96.** DateTime complete acceptance is separately pending the rest of its contract.

## Immutable results

| Group | Result / raw evidence here |
| --- | --- |
| New token/retry tests | Expanded15 fixed2c09719:9correctFAIL/6PASS (`uncertain-expanded-before-2c09719.log`). Same15 fixed96PASS (`uncertain-after-96c4915.log`). Added functional boundary and new-attempt positive make17PASS (`uncertain-functional-final-96c4915.log`). |
| Engine and original token contracts | engine21, token13, repair-boundaries7 allPASS; `engine21-shared-96c4915.log`, `token13-shared-96c4915.log`, `repair-boundaries-shared-96c4915.log`. |
| Hooks | Original9, dynamic5, functional diagnosis1 allPASS; corresponding `hooks9`, `dynamic`, `functional` logs. |
| Canonical and lifecycle protection | C29+8, D1shared8, D2foundation14/admission2 allPASS; corresponding `c29`, `c-boundaries8`, `d1-shared8`, `d2-foundation14`, `d2-admission2` logs. |
| Original storage package |22files/194tests allPASS, `storage-package-shared-96c4915.log`; an independent run of original package tests, distinct from the author's earlier execution. |
| Header |All Astra27 pass at96: boundaries5/recovery12/blur4/copy6 in `../web-dashboard-header-departure-astra/*-96c4915.log`. Parent/Sol own their assigned Header/other-caller matrices, not counted as Astra execution here. |

`verify-regressions.mjs` creates an immutable archive with fixed workspace aliases, copies the existing independent tests from that same archive into their original expected storage-test import context, and removes the temporary injected files before running the unmodified storage package. It changes no assertions or product source. The old Python runners had no consolidated cleanup/output redirection; this new owned runner keeps all new logs here and cleans its archive. This is a runner placement adaptation, not a product test overlay.

The new17 cover set/reset consumed token at a restored original baseline, invalid external source followed by restored intended/original bytes, transient read/lock denial, public hook repeated invalidated Retry, absolute-token refusal without invoking a functional updater, and the original functional retry-as-new-attempt positive. All original wrong-key/account/generation/kind/intent/consumed-token and no-token public reconciliation controls in token13 pass too.

## Remaining explicit-empty-token defect

Parent identified that `if (suppliedToken)` still conflates an explicitly supplied empty string with omitted token. Astra added two independent direct engine assertions using the public option shape: `reconcileToken:''`, current==expectedtrue, with absolute setfalse or reset. The string type permits this input; an invalid supplied credential must fail rather than become ordinary mutation authority.

`uncertain-empty-before-96c4915.log`: **17PASS/2correctFAIL**. The set returns success and writesfalse; reset returns success and removes the externaltrue. Both violate the no-mutation oracle. Required correction: distinguish undefined/no token from a supplied string including empty. An invalid empty string takes token verification and refuses without touching storage/publication. Do not normalize it into omitted-token semantics.

A strictly presence-check-only final delta can be verified with all19 new assertions, original token13/engine21 and the original storage package plus source review. The96 caller results remain explicitly96-attributed: production callers supply either no token or an engine-issued nonempty token, and those branches do not change under this delta. If any other shared behavior changes, expand the final regression accordingly. No previous failure or test log is overwritten.
