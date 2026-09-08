# Discovery Review — xai-web-board-filter-share-map

> Wave-2 first row of `xai-web-console-gap-closure`. Extends 3 SHIPPED packages
> (`xai-web-board-core` row #7 / `xai-web-board-views` row #8 / `xai-web-board-workspaces` row #9).
> Combines the row #2 CSP-amend precedent with the row #3 EventMap-extension
> precedent, plus a NEW third-party dependency (Leaflet) integrated via
> lazy-load to honour the bundle budget.

| Field | Value |
|---|---|
| Slug | `xai-web-board-filter-share-map` |
| Seed Brief | `docs/reviews/xai-web-board-filter-share-map/20260524-roadmap-seed.md` |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #6 (W2 first) |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure; ≥5/9 gaps SHIPPED unblocks P1 desktop launch) |
| ADR Companion | ADR-0008 §S3 D3 (CSP — already amended this session for ai-chat row #2) |
| Dispatched By | `xai-roadmap-loop` SERIAL dispatch — Wave 2 first row, most complex W2 row |
| Author | Claude Opus 4.7 (1M context) — feature-plan |
| Date | 2026-05-25 |
| Status | NEEDS_REVIEW (feature-review) |

---

## 1. Problem Framing

`apps/web` ships the SHIPPED `BoardWorkspacesModule` orchestrator
(`packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx`) which
renders a header with three icon buttons that are currently disabled (audited
live):

```tsx
// BoardWorkspacesModule.tsx lines 345..350 (SHIPPED — disabled)
<button type="button" className="board-icon-btn" disabled>
  {STR_HEADER.filter[lang]}
</button>
<button type="button" className="board-icon-btn primary" disabled>
  {STR_HEADER.share[lang]}
</button>
```

The Map view (`packages/plugin-web-board-views/src/MapView.tsx`) is a static
SVG placeholder with 6 hard-coded mock pins — explicitly tagged in the file
header as "stays a placeholder until the schema is extended in a future row".

The gap-closure roadmap row #6 closes all three by:

1. **Filter** — in-memory render-only narrowing predicate that applies across
   all 6 board views. NO persistence in v1 (HC1).
2. **Share** — native `<dialog>` modal with a copyable mock URL + new typed
   event `web:board:share-requested`. NO real backend (HC2).
3. **Map** — real geographic visualization via Leaflet (lazy-loaded). Cards
   need an optional `location` field — additive schema extension in
   `xai-web-board-core` (HC3). Map tile fetch requires CSP amendment for
   `connect-src` + `img-src`.

### Current source baseline (verified live, 2026-05-25)

| Surface | File | Current state |
|---|---|---|
| Filter button | `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx:345-347` | `disabled` button, no handler, no popover |
| Share button | `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx:348-350` | `disabled` button, no handler, no modal |
| Map view | `packages/plugin-web-board-views/src/MapView.tsx:1-91` | static SVG, 6 hard-coded `PIN_POSITIONS`, no card data |
| Card schema | `packages/plugin-web-board-core/src/types.ts:34-53` | `BoardCard` has `id/title/labels?/members?/checklist?/due?/dueEn?/start?/dueLate?/attach?/cover?` — NO `location` field |
| EventMap | `packages/core/src/types/events.ts:198-210` | has `web:dashboard:add-widget-clicked` + `web:dashboard:widget-added`; NO `web:board:*` channels yet |
| CSP `_headers` | `apps/web/public/_headers:2` | `connect-src 'self' https://api.anthropic.com; img-src 'self' data: blob:` |
| CSP guard test | `apps/web/src/__tests__/csp.test.ts:23-37` | asserts `connect-src` contains `https://api.anthropic.com` — pattern set by row #2 |

### Test baseline (verified `it(/test(` counts, 2026-05-25)

| Package | Files | Tests |
|---|---|---|
| `@repo/plugin-web-board-core` | 12 | **104** |
| `@repo/plugin-web-board-views` | 11 | **90** |
| `@repo/plugin-web-board-workspaces` | 12 | **135** |
| `@repo/web` integration suite | 19 (incl. `router-modules.integration.test.tsx` 33 cases) | 100 |
| **Total directly impacted** | — | **329 baseline + 100 host** |

> NOTE — seed brief acceptance signal mentions "90 board-core + 135 board-workspaces + 75 board-views";
> ground-truth grep shows 104 / 90 / 135. The plan locks the **ground-truth numbers** for
> the verify gate (G2 / G3 / G4 below).

---

## 2. Candidate Options (with web research evidence)

Because this row introduces a NEW third-party dependency (map library) and
extends external network surface (tile server), web research is required per
feature-plan protocol step 4.

### A. Map library selection — Leaflet vs OpenLayers vs MapLibre GL JS

**Web search queries executed (2026-05-25):**

1. `Leaflet vs OpenLayers bundle size 2026 React lazy load tree-shaking comparison`
2. `OpenStreetMap tile usage policy 2026 attribution requirement free alternative carto`

**Bundle-size evidence** (sources at end):

| Library | Gzipped core | Dependencies | DOM / Canvas / WebGL | License |
|---|---|---|---|---|
| **Leaflet** | ~42 KB gzipped (~150 KB raw) | Zero runtime deps | DOM tiles (raster) | BSD-2-Clause |
| OpenLayers | 150–200 KB gzipped (80–120 KB after tree-shake) | Zero runtime deps | Canvas + WebGL (raster + vector) | BSD-2-Clause |
| MapLibre GL JS | ~200 KB gzipped + WebGL shaders | Zero runtime peers | WebGL (vector tiles) | BSD-3-Clause |

**Decision: Leaflet** — chosen on:

- Smallest bundle (~42 KB gzipped, dwarfed by other 5 views in row #8 combined).
- Zero runtime dependencies — fewest CSP / supply-chain risk surfaces.
- React-Leaflet (`react-leaflet`) is a thin wrapper (~10 KB) but adds a peer
  dependency on a library family that follows its own version cadence. **Decision:
  use vanilla Leaflet via `useRef` + `useEffect` (~30 LOC)** — avoids React-Leaflet's
  version-coupling risk and keeps the lazy chunk minimal. Pattern is well-established;
  cited in OneUpTime / Geoapify blog posts (sources below).
- Raster tiles suffice for v1 — we only need to plot pins. Vector tiles
  (MapLibre / OpenLayers) buy us nothing this row and double the bundle.
- License compatibility: BSD-2-Clause is permissive; no copyleft concern.

**Rejected alternatives:**

- **OpenLayers** — Larger bundle (3–5× Leaflet after gzip). Canvas/WebGL renderer
  is overkill for a few pins. Tree-shaking only partially reclaims the size delta.
- **MapLibre GL JS** — Requires WebGL (rules out Safari old + WebView edge cases),
  bigger bundle, and vector-tile sources need a separate JSON style spec — adds
  CSP surface AND build-config complexity. Premature for v1.
- **Google Maps JS API** — Requires an API key (against HC6 "no-API-key option
  preferred"), introduces Google as a security/privacy origin (CSP widens to
  `*.googleapis.com` + `*.gstatic.com`), and licensing has usage-based billing.
  Anti-fit for a static-hosted demo.

### B. Tile provider selection — OSM standard vs CartoDB vs OSM-US vs OpenMapTiles

**Per HC6** (free, no-API-key option preferred) and per the **OpenStreetMap
Tile Usage Policy** (sourced below), the candidates are:

| Provider | URL template | API key | Usage policy | Verdict |
|---|---|---|---|---|
| **OSM standard** | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | None | Heavy-use disallowed; attribution mandatory; clear User-Agent required; no offline | **Default for v1** (low traffic on a static demo page) |
| OSM US (USA only) | `https://tile.openstreetmap.us/...` | None | Same as OSM with USA focus | Reject — regional bias for a global product |
| CartoDB Positron / Voyager | `https://{a-d}.basemaps.cartocdn.com/{style}/{z}/{x}/{y}.png` | None for low-volume | Soft 75k tile/day soft cap; commercial use should arrange | Document as future swap option |
| MapTiler / Mapbox | various | Required | Free tier caps + key in client = CSP exposure of provider domain | Reject — key-in-client conflicts with HC6 |
| Self-host (raster) | own server | own | Operational cost | Reject — out of scope |

**Decision: OSM standard tiles** at `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
+ visible attribution "© OpenStreetMap contributors" rendered in the bottom-right
of the MapView (Leaflet does this by default but we MUST verify it's not hidden).
User-Agent string is set by the browser (we cannot override) — acceptable per
the policy's "best-effort" framing for browser clients. **Documented future-swap
trigger**: if MapView ever sees >1 req/sec average, the build executor migrates
to CartoDB or a self-hosted tile mirror in a follow-up row.

CSP impact:
- `connect-src` MUST add `https://tile.openstreetmap.org` (Leaflet uses `fetch`
  internally on some code paths and `<img>` elements on others).
- `img-src` MUST add `https://tile.openstreetmap.org` (tile images are loaded
  via `<img>`). Currently `img-src 'self' data: blob:` — extend to
  `img-src 'self' data: blob: https://tile.openstreetmap.org`.

### C. Share-URL generation strategy — `Date.now()` vs SubtleCrypto hash vs deterministic

| Option | Pros | Cons |
|---|---|---|
| Timestamp (`Date.now()` postfix) | Trivial; matches seed brief literal "current timestamp" | Non-deterministic — test must mock Date; URL changes every open (annoying UX) |
| `SubtleCrypto.digest("SHA-256", boardId)` (8 hex chars) | Deterministic, testable, no PII leakage (only board id hashed) | Async API; needs `await`; jsdom 26 supports it (verified) |
| `btoa(boardId)` (base64) | Simplest; deterministic | Reversible — exposes board id literal in URL (acceptable for a stub but worse than hash) |

**Decision: SubtleCrypto SHA-256 deterministic hash of `boardId`** (8-hex-char
prefix) → produces e.g. `https://xai-web.example/share/a1b2c3d4`. This:
- Is deterministic → testable without mocking `Date.now()`.
- Does not leak board id literal (board id is short-form like `b-default` — visible
  in URL is OK, but hash is friendlier to defenders).
- The "non-exploitable as a real link" check (cross-vendor verifier gate) is
  trivial: the URL path does NOT exist on the deployed origin; clicking it
  yields a 404. No backend route is added in this row.

### D. EventMap channel placement — extend or new?

Following the row #5 dashboard-add-widget-picker precedent (which added
`web:dashboard:widget-added` as a sibling to the pre-shipped
`web:dashboard:add-widget-clicked`), we add ONE new typed entry:

```ts
// Board share URL generated (owner: xai-web-board-filter-share-map gap-closure row #6)
'web:board:share-requested': {
  /** Board id whose share URL was generated. */
  boardId: string;
  /** Generated share URL (mock — no backend; deterministic SHA-256 hash). */
  url: string;
  /** Where the action originated. v1 closed union: 'header'. */
  source: 'header';
};
```

No consumer in this row (declaration-only, mirroring the row #5 pattern).
Future P1 desktop integration may consume.

### E. Filter state lift location — three candidates

The Filter predicate must narrow card lists across all 6 views (HC1 "across all
6 board views consistently"). Three placement options:

| Option | Place state | Pros | Cons |
|---|---|---|---|
| **α: BoardWorkspacesModule** (top) | `useState<FilterState>` next to `panels` | Single source of truth; matches existing module state shape; resets on board switch via key-on-`activeBoard.id` | All views receive a `filter` prop — 6 prop additions |
| β: Per-view internal | Each of 6 views owns its own filter | No cross-cutting prop change | Same UI repeated 6× — contradicts HC1 "consistently" |
| γ: Context provider | `<BoardFilterContext.Provider>` wrapping body | No prop drilling | New context = new architecture surface; overkill for a single state value; harder to test |

**Decision: α (BoardWorkspacesModule top-level state)**. Filter state is a
single `FilterState = { labels: Set<string>; members: Set<string>; dueRange: 'all' | 'overdue' | 'today' | 'week' }`
value held in `useState`. Reset on `activeBoard.id` change via:

```ts
useEffect(() => { setFilter(EMPTY_FILTER); }, [activeBoard.id]);
```

Each view component receives a `cards` array that has been **pre-filtered** by
a pure `applyFilter(lists, filter)` helper — views remain unaware that filtering
exists. This minimises view-component surface change and is testable in
isolation. Filter UI is a new popover that the Filter button opens.

### F. Share modal — `<dialog>` precedent

Per row #5 binding precedent (AddWidgetPicker uses native `<dialog>` +
`showModal()` + `dialog.close()`), the Share modal mirrors that pattern:

- Native `<dialog>` element via `useRef` + `useEffect`.
- Body: heading + read-only `<input>` containing the URL + Copy button + Close button.
- Clipboard: `navigator.clipboard.writeText(url)` with a fallback `document.execCommand('copy')`
  for older WebViews (jsdom 26 supports `navigator.clipboard` per the `dashboard-add-widget`
  test infrastructure). A 2-second "Copied!" affordance flips the button text.
- Backdrop click closes (target-equals-dialog pattern from REC-2 of row #5).
- ESC closes natively.
- Emits `web:board:share-requested` BEFORE closing (per row #5 REC-1 precedent —
  event fires synchronously while the URL is still owned by the modal).

### G. Card schema extension — `location?` shape

Additive optional field on `BoardCard` in `packages/plugin-web-board-core/src/types.ts`:

```ts
/** Optional geographic location for Map view rendering. Cards without
 *  this field render as empty-state in Map view (per HC4). */
location?: {
  lat: number;   // WGS84 latitude, -90..90
  lng: number;   // WGS84 longitude, -180..180
  /** Optional human-readable label rendered in the pin popup. */
  label?: string;
};
```

**Backwards compat**: existing `xai_boards_v2` data has no `location` field; all
existing cards thus have `location === undefined` → MapView renders the
empty-state. No migration. No registry edit (the registry stores `unknown` and
narrows via `isBoardCard` — the guard is widened to accept the optional field).

The guard MUST be widened *additively* (existing tests preserving the absence
of `location` MUST continue to pass). New tests cover the presence path.

---

## 3. Trade-offs

| Trade-off | Choice | Cost |
|---|---|---|
| Bundle size for Map view | Lazy-load Leaflet via `React.lazy(() => import("./MapView.js"))` so the ~42 KB Leaflet chunk only ships when the user clicks the Map tab | One added `<Suspense fallback={...}>` boundary; bundle-budget test asserts the chunk is separate |
| Filter UI complexity | v1: 3 facets only (labels / members / due-range); no full-text search; no save-as-preset | Future row can add saved filter presets without breaking the FilterState shape (additive extension) |
| Share-URL fidelity | Deterministic SHA-256 prefix — non-exploitable; does NOT round-trip back to a real board | Cross-vendor verifier must confirm the URL is 404 on the deployed origin (gate added) |
| Tile-provider lock-in | OSM standard tiles only; CartoDB documented as future swap | Heavy-use risk if usage scales (>1 req/sec avg) — runbook trigger documented |
| EventMap declaration-only | `web:board:share-requested` has no consumer in this row | Risk that consumer never materialises; mitigation: same pattern as row #5 — declaration-only is approved precedent |
| CSP amendment in-place vs new ADR | Amend ADR-0008 §S3 D3 in-place (binding-precedent rule from row #2) | Two `Amendments` rows in the frontmatter accumulate; not unbounded — wave 3 will add #7 OAuth + #8 Stripe at most |
| Filter resets on board switch (HC1 "reset on board switch") | useEffect on `activeBoard.id` clears `FilterState` | UX trade: user loses filter when switching boards; matches the in-memory contract |
| Test count grows ~30–40 new tests | Inflates `pnpm test` runtime by ~3–5 sec | Acceptable; sibling rows have similar deltas |

---

## 4. Recommendation

**Selected option set (all-or-nothing — locks at plan acceptance):**

| Sub-decision | Choice |
|---|---|
| D-Map-Lib | **Leaflet** (vanilla, no React-Leaflet); 42 KB gzipped; lazy-loaded |
| D-Tile-Provider | **OSM standard** tiles; attribution rendered; CartoDB as documented future swap |
| D-Share-URL | **SubtleCrypto SHA-256 → 8-hex-char prefix**; deterministic; non-exploitable |
| D-EventMap | **Extend** `EventMap` with one new entry `web:board:share-requested`; declaration-only |
| D-Filter-State | **α** (BoardWorkspacesModule top-level useState; reset on board change); applyFilter pure helper at view boundary |
| D-Share-Modal | **Native `<dialog>`** per row #5 binding precedent |
| D-Schema-Extension | **Additive optional `location?: { lat: number; lng: number; label?: string }` on `BoardCard`** in `xai-web-board-core` |
| D-CSP-Governance | **Amend ADR-0008 §S3 D3 in-place** per row #2 binding precedent; extend `connect-src` AND `img-src` to include `https://tile.openstreetmap.org` |
| D-Canonical-DevLog | **`packages/xai-web-board-views/docs/dev_log.md`** (Map is the largest sub-feature; that's the canonical home). Lineage cross-refs appended to board-workspaces + board-core dev_logs |

---

## 5. Risks Register

| ID | Risk | Severity | Likelihood | Mitigation | Phase |
|---|---|---|---|---|---|
| R1 | Leaflet vs OpenLayers wrong choice (we picked Leaflet for size; OpenLayers might handle 1000+ pins better someday) | Med | Low | Document trigger: if >500 pins per board, revisit with OpenLayers + Canvas renderer in a follow-up row | n/a (documented) |
| R2 | OSM tile usage policy violation under heavy use (>1 req/sec avg) | Med | Low | v1 traffic is single-developer demo; runbook trigger documents CartoDB / self-host migration; attribution rendered + browser-default User-Agent | n/a (documented) |
| R3 | Filter state lifting breaks existing per-view behavior (Calendar DnD, Timeline DnD, Table inline edits all currently receive `lists` unfiltered) | High | Low | `applyFilter` is pure; views still write back via `updateCard` (which goes to the SOURCE list, not the filtered one); test cases cover filter-then-DnD round-trip | P2 |
| R4 | Share mock URL leaks fingerprintable data (board id + timestamp) | Low | Low | SHA-256 hash of board id only — board id is short-form like `b-default`; no timestamp; not exploitable (404 on origin) | P4 |
| R5 | Map lazy-load chunk doesn't actually split (Vite config issue) | Med | Med | `React.lazy(() => import("./MapView.js"))` is standard Vite behavior; verify with `vite build --debug` + new test `build-manifest.test.ts` asserts a separate chunk exists | P5 + P6 |
| R6 | CSP tile-server allowlist too narrow (Leaflet might fetch from `*.tile.openstreetmap.org` retina variants) OR too broad (wildcards introduce risk) | Med | Med | Single origin `https://tile.openstreetmap.org` only — no subdomains needed; retina tiles use same origin with `@2x.png` suffix; document if retina is later enabled | P6 |
| R7 | `location` field schema migration if existing user data lacks it | Low | Low | Default to `undefined`; `isBoardCard` guard widened additively; no migration step needed; existing 104 board-core tests still pass | P1 |
| R8 | Filter UI overlay z-index conflicts with view picker dropdown / board switcher modal | Med | Low | Filter popover uses `position: absolute` anchored to button; existing layout uses `z-index: var(--z-popover)` token; reuse | P3 |
| R9 | Native `<dialog>` Share modal focus trap on Safari old (pre-15.4) | Low | Low | Per row #5 R4: Baseline 2022 + production precedent (DeleteAccountConfirmModal) | n/a (documented) |
| R10 | Lazy `<Suspense fallback>` shows blank for ~100ms on first Map click | Low | High | Fallback renders skeleton placeholder (4-line text "Loading map…" + spinner); acceptable trade for 42 KB savings on initial bundle | P5 |
| R11 | EventMap addition collides with concurrent W2 row #7 / #8 / #9 if they also extend `web:board:*` (none planned per seed briefs) | Low | Low | SERIAL dispatch eliminates concurrency; new key namespace `web:board:share-requested` distinct from any existing `web:*` key | P4 |
| R12 | Leaflet CSS asset (`leaflet/dist/leaflet.css`) must ship — needs CSS handling | Low | Med | Vite handles CSS side-effect imports natively; import via `import "leaflet/dist/leaflet.css"` inside lazy MapView module; CSS contributes to the lazy chunk | P5 |
| R13 | Cards with malformed `location` (e.g. `lat: NaN`, `lng: 200`) crash Leaflet | Med | Low | `isValidLocation(loc): boolean` guard filters cards before passing to Leaflet; out-of-range coords filtered out; tested | P5 |

---

## 6. Open Questions (for feature-review to surface)

- **Q1: Filter scope on Map view** — should Map render only the filtered cards
  (so filtering by label "urgent" hides non-urgent pins) OR all cards (Map is
  a special "geographic" view)? **Recommendation: filter applies to Map too**
  (consistent with HC1 "across all 6 board views consistently"). Cards without
  `location` are already empty-state regardless of filter.

- **Q2: Filter UI placement** — popover hanging off the Filter button (compact)
  vs sidebar drawer (more facets visible). **Recommendation: popover**, matching
  the prototype's compact header treatment and saving horizontal space.

- **Q3: Share modal copy button feedback duration** — 1 / 2 / 3 seconds?
  **Recommendation: 2 seconds** (matches the dashboard-add-widget-picker
  empty-state hint timing).

- **Q4: Map tile zoom level on first render** — fit all pins (`map.fitBounds`)
  vs world view (`setView([0, 0], 2)`). **Recommendation: `fitBounds`** with
  padding when ≥1 card has location; fall back to world view when ALL cards
  lack location (empty-state).

- **Q5: Empty-state message in MapView when no cards have `location`** — copy
  bilingual: en "No cards have a location yet. Add a location to a card to
  see it on the map." / zh "没有卡片设置了位置。在卡片上添加位置后即可在地图上看到。"
  The empty-state still renders an EMPTY map (tiles loaded, no pins) so the
  user understands the Map view is functional. **Recommendation: accept**.

---

## 7. Hard Constraint Compliance Matrix

| HC# | Constraint | Plan compliance |
|---|---|---|
| HC1 | Filter render-only (no persistence) + applies across all 6 views consistently + resets on board switch | ✅ FilterState in `useState`, no `usePref` call; pure `applyFilter` helper at view boundary; `useEffect` reset on `activeBoard.id` change |
| HC2 | Share = modal + read-only URL + EventMap entry + NO real backend | ✅ Native `<dialog>` modal; SubtleCrypto SHA-256 hash; new `web:board:share-requested` entry; URL is non-routable on origin (404 expected) |
| HC3 | Map = Leaflet (or OpenLayers); cards need optional `location` in xai-web-board-core schema additive | ✅ Leaflet chosen; `location?` added additively to `BoardCard`; existing tests preserved |
| HC4 | Cards without `location` render as empty-state in Map view, NOT errors | ✅ `<isValidLocation>` filter + bilingual empty-state copy (Q5) |
| HC5 | Map library MUST be lazy-loaded | ✅ `React.lazy(() => import("./MapView.js"))`; build-manifest test asserts separate chunk (R5 mitigation) |
| HC6 | Map tile CSP impact: extend `connect-src` AND `img-src`; free + no-API-key provider | ✅ OSM standard tiles; ADR-0008 §S3 D3 amended in-place per binding precedent; both directives extended |
| HC7 | P0 work; cross-vendor verify mandatory | ✅ Verify Cross-vendor = yes in dev_log; Codex `gpt-5.5-thinking medium` primary verifier (queued per ADR-0008 carve-out 24h pattern from W1 precedent) |
| HC8 | ADR-0008 §S3 D3 amendment in-place (NOT new ADR) per binding precedent | ✅ Amend in-place; add row to `Amendments` frontmatter; update `_headers`; extend CSP test |
| HC9 | Append-only dev_log lineage; SHIPPED Status Panels preserved verbatim | ✅ New "## Bugfix-Extension Lineage — gap-closure row #6 (2026-05-25)" block appended; existing SHIPPED Status Panels untouched |
| HC10 | Do NOT skip Step 0 — seed brief is Step 0 input | ✅ Seed brief at `docs/reviews/xai-web-board-filter-share-map/20260524-roadmap-seed.md` read first and cited |

---

## 8. Acceptance Signal Coverage

Maps the seed brief acceptance signals to the plan's verification gates:

| AC | Coverage |
|---|---|
| Filter by label "urgent" hides non-urgent cards across all 6 views | Tests `applyFilter` × each view rendering (6 cases) + integration test (BWM-EXT-1) |
| Share modal displays copyable URL; clipboard-copy works | Tests `ShareModal` (5 cases incl. clipboard mock + Copied flip + emit-before-close) |
| Map view shows pins; clicking pin highlights card | Tests `MapView` (~10 cases incl. tile load, pin render, pin click → onSelect callback, empty-state) |
| Existing 104+90+135 tests still PASS | Verify gates G1+G2+G3 below |
| New tests cover filter / share modal / Map empty-state | New AC families AC-FIL-* / AC-SHR-* / AC-MAP-* per test.md extension |
| Bundle analysis: Map library loaded ONLY when user clicks Map view | New `build-manifest.test.ts` (G7) asserts MapView chunk hash + size budget |
| Cross-vendor: Share URL not exploitable + Map tile CSP minimal | Verifier checklist (Codex cold-read) |

---

## 9. Sources

- [GeoDataTools — OpenLayers vs Leaflet](https://geodata.tools/blog/openlayers-vs-leaflet-comparison/)
- [Geoapify — Leaflet vs OpenLayers: Pros and Cons](https://www.geoapify.com/leaflet-vs-openlayers/)
- [OneUpTime — Optimize React Bundle Size with Tree Shaking and Dynamic Imports (2026-01)](https://oneuptime.com/blog/post/2026-01-15-optimize-react-bundle-size-tree-shaking/view)
- [NamasteDev — Tree-Shaking and Code-Splitting](https://namastedev.com/blog/tree-shaking-and-code-splitting-real-world-bundle-size-reductions/)
- [OSMF Operations — Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
- [OpenStreetMap Wiki — Tile usage policy](https://wiki.openstreetmap.org/wiki/Tile_usage_policy)
- [OpenStreetMap Wiki — Acceptable Use Policy](https://wiki.openstreetmap.org/wiki/Acceptable_Use_Policy)
- [OpenStreetMap Wiki — Blocked tiles](https://wiki.openstreetmap.org/wiki/Blocked_tiles)
