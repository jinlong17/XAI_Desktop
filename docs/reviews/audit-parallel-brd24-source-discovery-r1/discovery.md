# BRD-24 whole-source discovery (author 1/3)

**Result:** source-only proposal for independent review. This document records fixed-source facts and a bounded future scope; it does not qualify the behavior, provide before evidence, accept the original item, or authorize implementation.

## Fixed identity and original row

- Dispatch card: `BRD-24/SOURCE-DISCOVERY1`, Workflow C / primary workflow B, module `web`, no children.
- Registration parent: `57f693e512f9db0837aac529a5f2c70d8903bff6`.
- Fixed control-plane input: `a68c2295c1aa0db359b0a62cb38317b29168c24c`.
- Fixed product source: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`.
- Original attachment: goal-objective SHA-256 `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`.
- The full inputs and individual SHA-256 hashes are in the sibling `inputs.sha256`. Product facts below are read from the fixed product tree; task authority and retained history are read from the fixed control-plane tree and task card.

The immutable scope-map entry is `BRD-24`, P2, kind 修复, original action **“Map支持当前语言、tile失败、离线和重试”**, acceptance **“地图不可用时有位置列表；保留视角且可取消加载”**, original module `web`, primary workflow `B`, formal state `pending`, retained execution record `pending` with no evidence, and execution state `needs_fixed_scope_discovery`. This discovery preserves the full action: current language; tile failure; offline; retry; a location list when the map is unavailable; retained viewport; and cancellable loading. It does not split, rename, or claim acceptance of this leaf.

## Fixed-source map and current facts

The finite Web package path is `packages/plugin-web-board-views/`. The real map component is `src/MapView.tsx`; its provider loader and location/persistence helpers are under `src/internal/`; lazy export is `src/index.ts`; map styles and component tests are in this package. The route-level production caller at this product SHA is `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx`, which passes `filteredLists`, the current `lang`, and `openCard` as `onSelectCard` to `MapView` (around lines 1349–1356). The caller wraps it in `Suspense` with an empty busy fallback. The legacy `plugin-web-board-views/src/BoardModule.tsx` is another package caller, but the Workspaces module is the active shell composition identified by the fixed source.

| Requirement area | Fixed source fact at `f9eb4b1` | Gap or limit in static evidence |
|---|---|---|
| Language | `lang` is passed into `MapView`. Its inline strings localize loading and the no-pin heading/body. Pin popup title extraction always selects `.en`; provider/load error is rendered as the raw rejection string. The Leaflet popup content is built during map initialization. | The full user-facing string surface, including provider controls/errors and popup title behavior, has no complete bilingual contract. A `lang` prop alone does not show runtime localization. |
| Tile failure | A Leaflet OSM tile layer is created from the fixed `https://tile.openstreetmap.org/{z}/{x}/{y}.png` URL with attribution and `maxZoom: 19`. No tile `tileerror` handler, tile-failure state, fallback action, or manual retry control appears in `MapView.tsx`. | Static code does not establish how a real provider/browser behaves after partial or total tile failure. Do not infer success or failure from historical logs or API prose. |
| Offline | No online/offline event or status handling is present in the map component or its loader. CSP source text allows the OSM tile origin in `connect-src` and `img-src`. | CSP allowance is not connectivity evidence. Offline semantics and the transition from partial tile failure to “map unavailable” remain unqualified. No provider request was made. |
| Retry | The Leaflet dynamic import is cached as one module promise; a rejection is caught and displayed. There is no user retry action, reset path from the error UI, or tile-layer retry orchestration in this component. | Import retry, tile retry, repeated retry behavior, and stale/repeated completion behavior are unverified. The cached promise may retain a rejection until separately reset; no runtime claim is made. |
| List fallback | Valid `BoardCard.location` values become markers. With no valid pins, the component renders a no-pins overlay over the map. Its loader-error branch renders only a warning and raw error string. No location list appears in either branch. | Acceptance requires an actual location list when the map is unavailable. Whether partially available tiles count as unavailable and how list rows map back to cards need contract-level definition. |
| Viewport | The component creates an in-memory Leaflet map. It calls `fitBounds` for multiple pins, `setView` for one pin, or `setView([35.6762, 139.6503], 2)` for zero pins. The effect depends on serialized pins and `onSelectCard`; cleanup removes the map and clears readiness. | Pin changes/callback identity can rebuild the map and re-fit it. No viewport snapshot/restore or viewport preference exists in this component. Language is not an effect dependency. `docs/api.md` §S15.4 describes `[0,0]` for the zero-pin view while the fixed component uses Tokyo coordinates; treat that documentation as stale on this detail. Retention boundaries are not settled by source. |
| Cancellable loading | The effect-local `cancelled` boolean suppresses state updates after cleanup and prevents post-cleanup map setup after the Leaflet import settles. Cleanup removes an initialized map. | This is lifecycle guarding, not a user-visible cancel action and not proof that the import or in-flight tile image requests are aborted. No `AbortController`/provider request cancellation seam is present in the map source. |
| Location data | Board core defines optional `CardLocation` (`lat`, `lng`, optional label) and validates finite coordinate bounds. Seed data has example locations. `MapView` consumes board lists; the live caller supplies filtered persisted Board data. | The bounded production-component search found no location editor in the checked Board card-detail/creator surfaces. Coordinate provenance beyond persisted card data and shipped seed fixtures is unknown; no new editor, schema, geocoder, or coordinate writer is proposed. |
| View preference / account lifecycle | `xai_board_view_by_id` persists selected view by board id. Storage declares it account-owned; board state is separately persisted by the existing account-owned Board keys. | This key stores view selection, not map camera state. Reusing it for viewport would alter account data semantics and is outside this discovery. No additional storage key is authorized. |

The current map-source failure catch handles Leaflet module-load rejection, but the separate React lazy chunk load is outside the component. The active caller shown above has `Suspense`; no map-specific user-facing error boundary is present in that call site. Provider and chunk failure recovery at the host boundary remain an impact-review question, not an assumed capability.

### Existing docs and fixtures

The fixed `docs/api.md` describes a bilingual error fallback, a Leaflet retry expectation, and tile/CSP behavior; the implementation does not provide equivalent map state or recovery UI. The same doc’s zero-pin center differs from the component. These are source/documentation contradictions, not proof of runtime behavior or permission to update canonical docs in this discovery. `docs/test.md` and `src/__tests__/MapView.test.tsx` cover component structure, successful Leaflet setup, pins/popups, bounds/default center, and the no-pin state. The frozen tests mock Leaflet and do not establish actual tile, offline, retry, cancellation, or viewport behavior. `docs/dev_log.md` contains historical implementation/test/ship claims; those are historical records only and are not reused as current acceptance evidence.

## Candidate future scope and locks

This is a finite impact proposal only. It does not grant these writes. If a later exact single-writer task is admitted, the smallest source candidate is:

| Candidate | Reason and likely role |
|---|---|
| `packages/plugin-web-board-views/src/MapView.tsx` | Map state, localized state, list fallback, retry/cancel affordances, viewport lifetime, tile-layer events. |
| `packages/plugin-web-board-views/src/__tests__/MapView.test.tsx` | Frozen Leaflet/tile-layer fixtures for failure, retry, cancellation/stale completion, language changes, list semantics, and viewport retention. |
| `packages/plugin-web-board-views/src/styles.css` | Responsive map/list presentation and visible, focusable controls if required by the accepted contract. |
| `packages/plugin-web-board-views/docs/api.md`, `docs/test.md`, `docs/design.md` | Align the owning package contract, fixtures, and design after a separately accepted contract; existing API prose conflicts with source. |

The following are read-only impact context and remain locked to their existing owners: `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx` and `src/__tests__/BoardWorkspacesModule.test.tsx` (shared production caller and callback integration); `packages/plugin-web-board-core/src/BoardModule.tsx`, `src/types.ts`, and `src/internal/seed/board-data.ts` (Board schema/state and seeded location producer); `packages/plugin-web-storage` ownership/registry/account lifecycle code (actual tree path is `packages/plugin-web-storage/src/internal/registry.ts` and `accountOwnership.ts`); the account-owned Board data path; `apps/web/public/_headers`, CSP tests, host route and lazy-loading boundary; and the external Leaflet/OSM provider seam. Any required edit there needs a new exact impact assessment and single-writer grant. No web-to-app D3, host, account lifecycle, shared Board caller, provider configuration, or external-service scope is opened here.

## Contract questions to record, without choosing policy

The original acceptance is retained verbatim. Before implementation, the owner contract should resolve only what source cannot determine:

1. Which user-facing map surfaces must follow the current language, including errors, controls, location labels, and card titles.
2. Which failure threshold makes the map “unavailable” (a tile failure, all tiles, or a separate import failure), and whether partial map content remains usable alongside the list.
3. What retry action covers (Leaflet import, tile layer, or both), how repeated failures are represented, and how a successful retry clears prior failure state.
4. Which state must survive to satisfy “保留视角”: retries and data/language rerenders, or also leaving the Map view and switching boards. The latter may cross into persisted account-owned state and requires a separate ownership decision.
5. What the user can cancel, when the control is available, and what “cancelled” means for import completion and provider tile work. Static cleanup is not taken as a cancellation oracle.

These are recorded decision points, not policy selections or questions sent to the user. Until resolved, partial-tile classification, offline detection, retry limits, persistence, and cancellation guarantees are `UNKNOWN`, not zero-work or passing behavior.

## Future evidence and acceptance gates

A separate admitted implementation must begin from the fixed source with a contract and a reproducible before failure/oracle. Its component fixtures should deterministically drive Leaflet import rejection, tile `tileerror`/partial-vs-total failure, offline/reconnection state if selected by contract, retry success/failure, cancel followed by late completion, language changes, location-list contents and selection, and camera retention across each agreed lifecycle boundary. Tests must assert both positive behavior and negative behavior (no stale error/list overwrite, no duplicate map or unhandled completion, no loss of unaffected card/list data). Accessible keyboard/focus behavior and mobile layout need explicit browser evidence; mock-only tests cannot establish those.

The later fixed run must include the accepted contract’s frozen component fixtures and the affected BoardWorkspaces caller regression, then the Web package/type/build/CSP and routed browser acceptance that the owning plan requires. Storage/account lifecycle regressions are required only if a separately authorized persistence change touches those seams. Any native/desktop evidence is `UNKNOWN` and is not authorized by this Web source task; a later cross-module effect must pass the project’s D3/module gate. Independent verification and independent full-scope business acceptance remain separate gates. Controller reconciliation must preserve the original ledger state/counts, followed by inventory refresh and remote ancestry/sync evidence under the controller’s existing process.

No tests, build, lint, browser, native, server, qualification, provider probe, credential lookup, or network request was run for this discovery. The source proposal alone is not BRD24 acceptance.

## Scope-map and retained-history reconciliation

The fixed scope map parses as 312 unique items with `completed=13`, `verification_pending=3`, `in_progress=3`, `pending=293`, and `unclosed=299`. `BRD-24` remains `pending`; its retained execution evidence remains empty. `BRD-12` and `BRD-28` also remain their own original `pending` entries. Their histories, exhausted shared Board caller units, and all other original locks are preserved; this report neither restarts nor renames them. No ledger, global control plane, canonical contract, source code, runner, fixture, or acceptance state was changed.

## Budget and stop record

- Authorized work used: one bounded static source-discovery pass and one source report; no child agents.
- Limits retained from the task card: discovery cap 3; static pass ≤120 seconds; total wall ≤30 minutes; owned-process drain ≤30 seconds; runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/network/children = 0.
- No product policy was selected. Missing runtime/provider/native history remains `UNKNOWN`; it is not reported as zero, pass, or failure.
- Adoption requires a fresh whole-source independent review before any later source-only adoption. The root controller owns serial reception and all global-state updates.
