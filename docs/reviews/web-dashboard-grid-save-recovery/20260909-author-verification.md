# Dashboard grid persistence author verification

Product `72296ec`; additional reconciliation regression `33723a1`. Original fixed diagnosis `ced3a3e` retains seven failing business assertions and one passing control at source81f5623. This report is author verification, not independent acceptance. DashHeader is unchanged. Full Dashboard / REL05 remains open.

## Fix and contracts

- Layout/appearance remain account-owned. Shared package-local map persistence captures account scope, subscribes to the correct physical key, and compares raw bytes before even the first write without a storage event. An old A callback cannot seed B with A's map.
- Only successful persistence updates the committed layout/appearance UI. Failure retains the latest proposal separately; subsequent resize/appearance edits update that proposal. Explicit Retry / Export / Discard-and-reload are visible. Newer raw remains untouched; old-owner exports are rejected.
- Order remains device-owned. The Module is now the sole order owner for its Grid; a standalone Grid still owns its order. This avoids two mount-time reconciliation writers racing on the same key. The four-element useDashOrder tuple remains compatible; recovery is a named property.
- Add/remove do not hide widgets, emit widget-added, or close picker before confirmed persistence. Failed actions retry once with their captured intent; successful callbacks are cleared. Drag order failures are visible and recoverable. Failed sanitize write is not marked complete and can retry.
- Grid recovery is visible in the native picker when it is open, and in the page otherwise. Recovery controls are at least44px. Resize window listeners are cleaned on unmount or identity change.

## Results

- Original seven failing assertions plus passing control: all pass unchanged (copied to gridSaveRecovery.test.tsx with unused-import cleanup only). These remain actual hook/component + Storage fault paths, not mocked setter returns.
- Full package: **23 files / 208 tests PASS**. New tests also cover latest pending layout, appearance reset, old-owner export, add retry event exactly once, remove retry, and failed mount reconciliation recovery.
- check-types and lint: exit0.
- Native Chrome on fixed72296ec: **6 groups PASS**:
  1. Actual resize handle / window pointer events under quota retain committed cols=2 and raw `{}`; a later resize is the exported proposal, actual downloaded JSON contains latest cols and original raw; retry commits it.
  2. Actual appearance panel Rose selection fails visibly then retries successfully.
  3. Actual picker add fails with zero success events and remains open; retry saves bravo and emits once before closing.
  4. Actual remove failure keeps bravo rendered; retry persists removal.
  5. External raw update without event is not overwritten; discard reloads it; a subsequent physical-key StorageEvent refreshes rendered dimensions.
  6. After A→B, old actual resize handler and export change neither account's saved layout and produce no download.

Native uses a temporary Chrome profile/download directory, synthetic widget registrations, actual DashboardModule/Grid/WidgetShell and Storage, all product/@repo imports pinned to Git archive. Input uses DOM click and PointerEvent handlers, not human mouse automation; physical event is deliberately dispatched, not called a real second-tab event. File export is a real Chrome download; no anchor/Blob interception. Source attribution distinguishes these native checks from component-only before/after tests.

Commands:

```sh
# Original broken snapshot, intentionally non-zero:
node docs/reviews/web-dashboard-grid-save-diagnosis/verify.mjs
# Fixed native implementation:
node docs/reviews/web-dashboard-grid-save-recovery/verify-native.mjs
pnpm --filter @repo/plugin-web-dashboard-grid test
pnpm --filter @repo/plugin-web-dashboard-grid check-types
pnpm --filter @repo/plugin-web-dashboard-grid lint
```

## Limits and remaining product scope

No cross-tab atomic CAS, persistent draft/WAL, cross-reload unsaved recovery, global Dashboard capability completion, or release approval is claimed. Stored/committed values recover on reload; unsaved proposals require explicit export before leaving. Grid appearance/layout is still a per-widget map and no account cloud-sync capability was unfrozen. The previously verified note implementation and independent report are untouched. Other feature consumers remain part of open REL05.
