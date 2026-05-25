# Seed Brief — xai-web-board-filter-share-map

| 字段 | 值 |
|---|---|
| Roadmap | docs/workflow/roadmap/xai-web-console-gap-closure.md row #6 (W2) |
| 父 Brief | docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-gap-closure-source.md §Gap 4 |
| 父 ADR | ADR-0009 §D2-G3 |
| 候选包 | packages/xai-web-board-views (#8 SHIPPED) + packages/xai-web-board-workspaces (#9 SHIPPED) — extend |

## Requirement (1-3 sentences)

Implement three currently-disabled Board features: (a) Filter — by label / member / due range; (b) Share — generate read-only link (mock for v1, real backend deferred to P1); (c) Map view — replace SVG placeholder with real Leaflet-based geographic visualization of cards' `location` field. Filter is in-memory (no persistence); Share is UI-only stub; Map is a real third-party library integration.

## Hard Constraints

- Filter: render-only effect (no persistence in v1); selecting filters narrows visible cards across all 6 board views consistently. State held in component, reset on board switch.
- Share: clicking "Share" opens a modal with a read-only generated URL (mock: deterministic hash of board id + current timestamp). Emit `web:board:share-requested` event (extend EventMap). NO real backend call.
- Map view: integrate Leaflet (or OpenLayers — decide in feature-plan based on bundle budget; Leaflet ~150KB, OpenLayers ~250KB). Requires cards to have a `location` field — extend Card schema in `xai-web-board-core` (#7) carefully (additive, optional field, no breaking change).
- Cards without `location` field: render as empty-state in Map view, not as errors.
- Bundle budget: Map view's library MUST be lazy-loaded (dynamic import) so it doesn't bloat initial bundle.
- CSP impact: Map tiles fetch from a tile server (OSM, Carto, etc.) — must extend `connect-src` and `img-src`. Confirm tile provider in feature-plan (free, no-API-key option preferred).
- Per ADR-0009 D4: P0 work.

## Acceptance Signal

- Filter by label "urgent" hides all non-urgent cards across Board / Table / Calendar / Dashboard / Timeline / Map views.
- Share modal displays a copyable URL; clipboard-copy button works.
- Map view shows pins for cards with `location`; clicking a pin highlights the card.
- Existing 90+135 tests still PASS; new tests cover filter logic + share modal + Map empty-state.
- Bundle analysis: Map library loaded only when user clicks Map view.
- Verify Cross-vendor: Codex cold-read confirms (a) Share mock URL is not exploitable as real link, (b) Map tile CSP allowlist is minimal.
