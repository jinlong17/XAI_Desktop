# Collaborate device-control recovery baseline

Parent, fixed product115efb2, real Chrome152 with isolated synthetic account and complete token/layout/settings styles. This prepares the next participant after Smart Lists entry arbitration; no Collaborate product change or contract acceptance occurs here.

Authoritative scope is `packages/plugin-web-storage/src/internal/accountOwnership.ts`: `xai_pref_collab_default_share` is account, while `show_avatars` and `mention_notify` are device. Registry defaults for both booleans are true. The actual Collaborate pane has two legacy `usePref` toggle producers and a separate already-async account selector. The fixture does not seed preference values, and initial mount leaves both physical device keys absent.

[Native log](native-115efb2-device-controls.log) correctly fails. After denying writes to exactly the two device keys, actual clicks attempt each key once. Both persisted bytes stay absent, but the requested false choices revert to true. Visible page text has no saving/failure/recovery indication. The first failed oracle is latest-choice retention; later explicit failure-text/Retry/Export assertions are not reached and are not counted as separate executed failures. The observed text and actual attempts are recorded before the assertion.

[Fixture](native.tsx), [runner](verify-native.mjs): `node docs/reviews/web-collaborate-recovery-native/verify-native.mjs <fixed-sha>`. Product imports come from immutable git archive; installed dependencies only are reused. The test uses actual Toggle callbacks, physical Storage fault and full styles. No provider calls, account migration, permission behavior, partial success, mixed-scope export payload, departure capability or durable draft semantics are proved. Those belong to the full three-control contract recommended in Astra [115efb2 review](../web-smart-lists-recovery-astra/review-115efb2.md). Do not convert the two device keys into account data to make one combined map. Original REL-05/09 and numbered statuses remain open.

## Complete-feature recovery before at a2c0fe0

Five separate modes extend the fixed baseline under the75aa0e8 contract, preserving the original `device-controls` assertions:

- [export-all](native-a2c0fe0-export-all.log): actual account selector plus both device controls fail; missing export control is the executed FAIL. The after oracle requires real disk `collaborate-draft.json` containing all three unsaved choices under `values.account` and `values.device`.
- [export-denied](native-a2c0fe0-export-denied.log): after those actual failed edits, all Storage reads/writes are refused before export; missing control FAIL. The after disk check reads bytes only through the fixture's captured native getter for physical-state assertions; product export must remain memory-only.
- [export-device-after-owner](native-a2c0fe0-export-device-after-owner.log): actual scope replacement drops old account selection to B's comment fallback, then missing export FAIL. The after file must contain only surviving device drafts with `account:{}`, preserve false device selections and retain unload protection.
- [partial-export](native-a2c0fe0-partial-export.log): account save is allowed, two device writes denied; missing export FAIL. The after file excludes the saved account field and contains only the two unsaved device fields.
- [host-departure](native-a2c0fe0-host-departure.log): the real composed registration/data router leaves Collaborate for Notifications despite the failed account draft. The after oracle requires pane retention and correctly labelled dialog, actual dialog disk export, Stay, and explicit Discard reaching the first target without writes.

The first four fail at the same missing capability in different fault/scope setups; they are not four unique defects. Their later schema/unload/physical-state assertions have not yet passed. Host cases use [actual-host fixture](native-host.tsx), while the other modes use the standalone actual pane. No synthetic router, auth-provider request, persistent unsaved repository or three-key transaction is claimed. Full migration/uncertainty/old-capability/field-isolation coverage remains the independent complete contract's responsibility. Run `node docs/reviews/web-collaborate-recovery-native/verify-native.mjs <fixed-sha> <mode>`; old logs are never overwritten.

## Fixed 2bbc696 initial after and pending gap

All six existing native modes pass on2bbc696, preserving actual device choices and correct disk scope in all export/host cases. A new pure-pending oracle holds the real first-device key lock, then clicks its actual toggle; [pending before](native-2bbc696-pending-export.log) correctly fails because Export is available only after errors. No early write occurs and the pending false choice is visible. The later download/release assertions are not reached on this version.

## Fixed 2b02dd3 complete parent native set

Seven modes pass on the fixed successor: [device controls](native-2b02dd3-device-controls.log), [all three drafts](native-2b02dd3-export-all.log), [all Storage denial](native-2b02dd3-export-denied.log), [new owner device-only](native-2b02dd3-export-device-after-owner.log), [partial success](native-2b02dd3-partial-export.log), [actual host journey](native-2b02dd3-host-departure.log), and [pure pending export](native-2b02dd3-pending-export.log). The final pending file contains only show_avatars:false in device and account:{}, preserves unload protection while held, then lock release stores false and removes protection. Exact raw/JSON business assertions remain unchanged.

This is not complete75aa independent acceptance. Actual migration, uncertainty/unchanged-token retry, invalid-source/field isolation, retained old capabilities, pending device continuity across identity change and old-success/newer-draft races still require the full reviewer matrix. No numbered closure or durable unsaved crash claim follows from these seven browser cases. Original logs and earlier six passes remain separately versioned.

## Settled rendering and actual Collaborate presentation

Parent extended the runner with a separate `host-visual` mode using the real composed-host fixture and existing complete token/layout/settings styles. It enables Runtime events before navigation and independently checks console errors/uncaught exceptions; existing seven business assertions are retained. Original evidence files cannot be overwritten.

Fixed `ae2d233` [native host check](native-ae2d233-host-visual.log) reproduces **Maximum update depth exceeded on mount**. Earlier native PASS records did not test console error absence and do not prove stable rendering. Terra's loop and old-capability repairs culminate in `e08cd8c`; separate parent component tests now pass30 and real-host tests pass8.

Fixed `e08cd8c` [visual before](native-e08cd8c-host-visual.log) reaches 375×812 but fails: recovery begins at510.19px and ends at1016.22px; Export begins at959.22px. All recovery buttons measured44px high and no horizontal document overflow, but the full recovery is not visible in the first viewport. Parent directly viewed [375px screenshot](collaborate-e08cd8c-375.png). Remaining widths are not executed after this first failure. Terra is assigned a narrow pane recovery layout fix retaining per-field identity/actions and44×44 targets; global Settings navigation is outside this repair.

Terra `1e81df0` groups status and short visible recovery actions per field, retaining full field-specific accessible names. [Five-width after](native-1e81df0-host-visual.log) passes375/414/768/1024/1440×812 with full composed-host CSS, no horizontal overflow, all recovery actions at least44×44, and zero Runtime errors. At375 the card ends803.31px, Export spans746.31–790.31px. Parent directly inspected [375px after](collaborate-1e81df0-375.png). This closes the measured English narrow recovery geometry gap only; the latest independent same-value successor draft-attribution issue is still open.

## Final current browser checkpoint2a536c1

All seven original business modes pass at2a536c1 with pre-navigation Runtime exception/error capture enabled. The separate `host-visual` mode passes the five recovery widths plus actual375 dialog geometry/focus/44px targets; `native-2a536c1-host-visual.log` ends with zero runtime errors. Parent directly viewed `collaborate-2a536c1-375-dialog.png`. Original failures and intermediate results remain unchanged. These checks use an isolated synthetic account/profile and real Chrome/disk downloads; they do not prove deployed authentication, crash-durable unsaved drafts or complete product launch readiness.
