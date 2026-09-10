# Collaborate independent review — partial, not accepted

Web module. Parent non-author review pins product `2b02dd3`. Author commits and native browser evidence are separate layers. New Astra Agent initialization is unavailable due to the runtime thread limit; these checks are parent independent execution, not an external Astra Agent acceptance.

## Current result

`contracts-first-2b02dd3.log`: original 16/16 PASS. Extended fixed suite in `contracts-boundaries-corrected-2b02dd3.log`: **23 PASS, 1 FAIL / 24**. This does not close Collaborate or REL-05/REL-09/D2.

Confirmed issue: hold the actual avatars preference mutation lock, click the real Toggle to create a pending false draft, then make `URL.createObjectURL` throw during explicit Export. The pure-pending recovery area does not render the localized export failure message. The error state is only displayed inside the save-error/conflict branch. The quota-draft control displays the error correctly. Terra is assigned only the narrow presentation fix and author tests; parent retains this failure oracle.

The initial `contracts-boundaries-2b02dd3.log` has two failures because both message assertions expected “export failed” instead of the actual localized “Could not export the draft”. That fixture wording error is corrected without changing product or business expectations. Only the remaining pure-pending failure is a product finding. Both original logs are retained.

## Proven component scope

Real pane producers, no hook mocks: absent mount/rerender no writes; each physical key saved independently; three invalid-source mounts retain raw bytes; each key lock delays actual commit; account-exclusive lock leaves device writing independent; three same-turn toggles retain latest draft; invalid-source repair preserves sibling failure; pending device survives account switch while old combined guard is inert; unchanged uncertain Retry does not duplicate write; source conflict discard preserves a sibling; clean external source projection; forged selector rejection; missing-lock draft retention; retry only failed field; stale unmount guard; owner change during URL setup cancels click and revokes URL; quota export error retention.

Locks use the named shared/exclusive test fixture, not native Web Locks. Export in these tests captures actual Blob contents and anchor calls, not disk download. Separate native evidence has seven browser scenarios on `2b02dd3`; do not add test counts across layers or treat those seven as the full contract.

## Still required before complete acceptance

Actual migration controller fencing; source-unavailable repair; older-success/newer-failure and ABA sequencing; uncertainty external replacement, edited targets and account changes; complete composed-host mixed-scope pending/success/owner/sign-out scenarios; rendered Collaborate recovery at 375/414/768/1024/1440 with full CSS, focus and 44px controls; affected Smart Lists host/entry/export and App preflight regression; final package/type checks. Acceptance must reconcile every row in `web-collaborate-recovery-contract/contract.md`.

Runner archives the requested immutable product revision and overlays only reviewer assertions/fixture. Existing evidence filenames cannot be overwritten. No product source changes, deployment, or numbered closure in this reviewer checkpoint.

## Extended review on ae2d233

Terra fixes the pure-pending export message in `ae2d233`. `contracts-migration-corrected-ae2d233.log` is **29/29 PASS**, including the unchanged export-error oracle, actual account migration fencing with independent device save, read-unavailable repair, and device uncertainty after external change or account change.

The first extended uncertainty-edited assertion wrongly required an immediate second write. The accepted engine contract gives changed targets a normal original baseline, not the old uncertainty token; because the first write changed raw storage without acknowledged readback, the new target must remain a conflict. The corrected oracle requires only one physical write, unchanged committed false, latest intended true retained, and unchanged Retry refusing to overwrite. Both first diagnostic logs remain preserved. This is a fixture expectation correction, not a product defect or weakened baseline protection. Forged selector coverage now inserts a real forged option before dispatching its value.

### Confirmed real composed-host mount loop — not accepted

`host-bounded-loop-ae2d233.log`: all seven scenarios stop at the common initial mount oracle because React reports **Maximum update depth exceeded**. These are seven reproductions of one mount defect, not seven independently reached navigation failures. Real `composedSettingsRegistration`, WebShellProvider and memory data router are used, with Node-compatible AbortController.

Initial `host-mixed-ae2d233.log` only contains the terminated worker IPC diagnostic. The worker consumed sustained CPU without settling. After source inspection identified the guard-registration feedback path, the worker was stopped, and the independent oracle was made bounded: intercept only React's explicit maximum-update-depth diagnostic, record it and throw, then assert no such diagnostic at mount. Ordinary console output is retained. It now fails deterministically in under a second rather than spinning. No product mocks or guard replacement were introduced.

Likely feedback path: the pane guard depends on newly allocated translator/function and preference result identities; its registration effect calls the host's state-changing registration on every render. Terra is assigned a caller-local stabilization with current scope/session/draft semantics preserved. Do not modify the accepted host arbitration to hide the loop.

The prior seven native interaction PASS results did not assert absence of React update-depth errors; they are insufficient to accept settled rendering. Full host assertions must be reached after this defect is fixed. Numbered closure remains unchanged.
