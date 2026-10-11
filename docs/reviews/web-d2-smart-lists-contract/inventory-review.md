# Remaining usePref bindings — source review for next-batch selection

Astra, Web, 2026-09-09. Input is parent **03b0363**, [AST scan and fixed JSON](../web-d2-pref-binding-inventory/bindings-ce38758.json) at **ce3875835e6e4d516ff844715a0c266ecf835468**. The next planning point **40079c7** changes only Pomodoro CSS in `packages`; the binding and writer source below is unchanged. This is classification for sequencing, not complete D2 writer acceptance.

I reviewed the scanner's restrictions and fixed rows, checked the important downstream/direct bypasses in source, and grouped rows using the fixed `accountOwnership.ts` declarations. The reported **31 files / 88 bindings / 66 unique literal keys / 2 dynamic sites / 68 setter bindings / 65 directly invoked setters / 3 downstream-only / 20 getter-only bindings** are the parent's AST result, not 88 independently established writers. The scanner counts binding sites and syntactic identifier references, not symbol-aware data flow, number of write operations or reachable production instances. One setter can be invoked several times; one key can be exposed by multiple packages.

| Product group | Binding classification | Next-step implications |
| --- | --- | --- |
| Board core/views/workspaces | 13 bindings: 12 setters + 1 Tasks getter, all account | Multiple board/selection/view/filter/workspace paths and existing recovery helpers; preserve their accepted recovery contracts when separately coordinating. |
| Settings-rest | 46 setter bindings: 12 account + 34 device | Account includes integration callbacks plus disconnect, AI provider/base/model, More list/tag defaults, and Smart Lists. Device includes dates/notifications/sticky/other preferences and the two remaining Collaborate toggles. One pane is not all Settings. |
| Calendar | 2 device setters + 1 account Board getter | Week-start and view settings are separate from accepted canonical events. |
| Dashboard order | 1 device setter passed downstream | Real reorder/add/remove/sanitization writer, not a read-only binding. |
| Dashboard widgets | 3 setters (Clock style/timezone device; WorldClocks zones account), 8 account getters | Do not migrate read-only Tasks/Calendar/Pomodoro/Habits projections merely to reduce counts. |
| DesktopPet Web surface | 2 device setters | Selection handed to picker; position includes gestures and mount/resize clamp writes. Requires a complete caller/session contract later. |
| Appearance | 3 device getter-only bindings | Still writes through direct `setPref` and has direct remove/reset. Getter-only does not mean writer-free component. |
| Features | 1 dynamic setter + 1 dynamic getter | Feature keys originate in the registered feature configuration; classified device. Bulk reset uses another path. Neither dynamic site is an unbounded new key authority. |
| AppRail | 1 device setter | Reordering remains a separate caller. |
| Pomodoro/Statistics/Tasks | 1 + 4 + 1 getter-only bindings | Existing projections remain synchronous readers. Timer/session and canonical writers live elsewhere and are not counted here. |

## Downstream and adjacent paths checked

- `BoardWorkspacesModule.tsx:343,531` passes `setRawWorkspaces` to `internal/useWorkspaceSaveRecovery.ts` as `save`. The helper actually invokes it and gates its synchronous recovery flow on boolean results. Merely dropping a destructured setter would lose this writer.
- `DashboardModule.tsx:50–54` passes `rawSetOrder` to `internal/useOrderSaveRecovery.ts`. That helper calls the boolean setter before its `after` callback. The module also submits sanitation/add/remove/reorder proposals. This is not already migrated by accepting the separate DashHeader note/offset.
- `DesktopPet.tsx:188,247` passes `setPetId` to `PetPicker`; `PetPicker.tsx:83–84` invokes `onSelect` then immediately closes. Its async completion semantics will require attention in that future slice.
- `AppearancePane.tsx:103,111,113,122` calls direct `setPref` for hue/background/rail position while using getter-only `usePref` bindings. `AppearancePane.tsx:177` removes preferences; related wrapper hooks/events are outside this exact scan.
- `plugin-web-board-workspaces/src/internal/taskLinkCommand.ts:58` calls direct `setPref` for the Board intent. Accepted task-link business recovery does not make this sync account writer participate in D2.
- `plugin-web-settings-shell/src/internal/resetAllPrefs.ts:29–36` enumerates the registry and calls synchronous `removePref`. Therefore even a migrated Smart Lists pane does not mean every possible writer/remover of its physical key is coordinated. Lifecycle migration/deletion/import and public API writers are separate surfaces.

The scan excludes `.ts` wrapper hooks, computed/member/aliased storage APIs, apps, non-localStorage stores, direct/scoped mutations, and functions outside these direct calls. Legacy `usePrefAutosave` non-test TSX callers have been converted in the accepted slices; this does not exhaust those excluded paths. Account/device ownership is explicit in `accountOwnership.ts`, not inferred from registry category or `xai_pref_` prefix. Canonical Tasks/Calendar engines, raw business writers, timers and secret stores keep their separate D2 checklist rows.

**Selected next bounded product group:** all 12 Smart Lists visibility controls in Settings, one account-owned map. [Implementation and acceptance contract](contract.md). It advances a real account caller without combining provider/network, timer settlement, global Reset or unrelated device preferences. All remaining groups above stay open; no rollout admission is changed.
