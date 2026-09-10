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
