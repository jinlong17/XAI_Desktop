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
