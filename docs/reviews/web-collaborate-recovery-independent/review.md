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

## Stable guard regression and recovery

`977369e` fixes the composed-host mount loop: original seven host scenarios PASS, but the original pending-device old-guard test fails. The stable callbacks now read current refs and the old guard's discard callback clears the surviving device draft after A→B. The added explicit old-export test also reproduces a stale capability issuing a download. `contracts-old-capability-977369e.log` has 28 PASS / 2 FAIL, both old capability revocation failures; the original 29-test result remains separately preserved.

Terra `e08cd8c` binds blocking/export/discard operations to the guard's captured composite token. Fixed `contracts-token-fixed-e08cd8c.log`: **30/30 PASS**. Fixed `host-token-fixed-e08cd8c.log`: original **7/7 PASS**. Extended `host-latest-e08cd8c.log`: **8/8 PASS**, including an older verified share write followed by a newer failed share intent keeping the first navigation blocked until the latest Retry succeeds.

The independent native runner now enables Runtime events before navigation and fails on console errors or uncaught runtime exceptions. Fixed `ae2d233` fails at actual browser mount with React's maximum-update-depth message, confirming the component-level loop. Fixed `e08cd8c` reaches visual measurement without that mount error, but fails the first 375px recovery geometry oracle. See the native review. This remains a partial acceptance; full presentation and affected regressions are not waived.

## Same-value successor attribution remains a confirmed blocker

On `1e81df0`, the extended31-test suite has30 PASS /1 FAIL in `contracts-aba-lock-1e81df0.log`. Hold the actual account preference key; select edit, then view and edit while the first operation is pending. Allow the first key admission/physical edit write, reject the second key admission. The hook correctly retains the failed latest operation and Retry, but the pane's earlier success callback clears the latest equal-valued draft because it compares only session and value. `beforeunload` is incorrectly removed and the export draft is lost. Terra is assigned per-edit draft identity matching; no shared engine change is authorized.

The first fixture (`contracts-aba-e08cd8c.log`) expected two physical writes for equal successive values and failed before exercising this defect. The engine correctly treats matching committed raw as a no-op, so that diagnostic is not a product defect. The corrected fixture observes/rejects the actual second physical-key lock admission, which is required even for a no-op, and reaches the incorrect draft-clear oracle. Both logs are retained.

## Current checkpoint — product2a536c1

Terra changes success matching to per-edit draft identity. The original same-value lock-rejection oracle now passes. Parent fixed-revision verification:

- Independent contracts:31/31 PASS, `contracts-final-batch-2a536c1.log`.
- Real composed host:8/8 PASS, `host-final-batch-2a536c1.log`.
- Native current pane/device/export/denial/partial/owner/departure/pending: all seven modes PASS with Runtime error checks enabled, in the sibling native directory.
- Full CSS:375/414/768/1024/1440 recovery geometry PASS; actual375 departure dialog is within viewport, correctly labelled, focus-contained, and all actions44px or larger. Parent directly inspected the final375 dialog screenshot. Runtime errors:0.
- Affected unchanged Smart Lists host10, entry3, wrapper5, export8 and App5 PASS on the same fixed product. Settings package43 files/292 tests PASS. These overlapping layers are deliberately not combined into a coverage total.
- Settings-rest typecheck and Web check-types PASS on workspace HEAD2a536c1 with only parent reviewer artifacts dirty.
- Settings-rest lint **FAIL** on one existing `smartListsPane.tsx:119` exhaustive-deps warning (`scope` is an unnecessary dependency). The file is byte-identical between accepted Smart Listsa2c0fe0 and2a536c1 (`git diff --exit-code`=0). No Collaborate lint findings. Do not describe all checks as green, or silently change previously accepted Smart Lists semantics to suppress it.

This checkpoint resolves the reproduced pending-export feedback, composed-host render loop, stale combined callbacks, mobile recovery geometry and same-value successor draft defects. It does not itself close a numbered audit item or substitute for the complete feature decision. Before that decision, reconcile the contract's remaining explicit edges (including only-current-draft targeted all-discard, localized recovery presentation and additional export setup/click cleanup variants), and handle the existing lint warning under a narrow separate ownership decision. Forced auth unmount, browser crash, durable unavailable-storage drafts and global REL-05/REL-09/D2 remain open.
