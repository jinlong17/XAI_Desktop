# Design Snapshot — xai-web-event-bus

> Decision snapshot only. See `docs/reviews/xai-web-event-bus/20260523-discovery-review.md` for full alternatives, tradeoffs, and rationale.

## Selected Option

**Option B — Web-only adapter + EventMap host in `@repo/core`** (hybrid).

In one sentence: declare the `web:*` typed channel family on the existing `EventMap` in `packages/core/src/types/events.ts` (the source-of-truth file ADR-0007 §S7 mandates), but ship a thin **browser-only** bus implementation (`emitWebEvent` + `useWebEventListener`) inside `packages/xai-web-event-bus/src/`, because `@repo/core/events`' runtime (`emit` / `listen` from `@tauri-apps/api/event`) is Tauri-bound and will not work in the `apps/web/` Vite SPA.

| Field | Value |
|---|---|
| Review Doc Path | `docs/reviews/xai-web-event-bus/20260523-discovery-review.md` |
| Review Date | 2026-05-23 |
| ADR Anchor | `docs/adr/0007-xai-web-console-build-form.md` §S4 (port mapping) + §S7 (cross-module communication rule) + 冻结假设 §4 |
| Source Brief | `docs/reviews/xai-web-event-bus/20260523-roadmap-seed.md` |

## Frozen Assumptions

1. **EventMap source-of-truth stays in `@repo/core`.** All `web:*` channel entries are added to `packages/core/src/types/events.ts` — same single-file registry as desktop `organizer:*` / `console:*` / `project:*` events. ADR-0007 §S7 explicitly rejects creating a new EventMap host.
2. **Runtime is split.** Desktop continues to use `emitEvent` / `useEventListener` (Tauri-bound) for `organizer:*` / `project:*` / `console:*` channels. Web uses the new `emitWebEvent` / `useWebEventListener` (browser-bound) for `web:*` channels. Both share the same `EventMap` types at compile time.
3. **Browser-only transport: `EventTarget` + `CustomEvent`.** No new runtime dependency (no mitt / nanoevents / rxjs). Native `EventTarget` is universally available in browsers, has built-in once / abort-signal support, and is tree-shake free.
4. **Single bus instance per page.** A module-level `const bus = new EventTarget()` lives inside the package. There is no React context for the bus itself; the hooks close over the singleton. Same lifetime as the SPA tab.
5. **Naming convention from ADR-0007 §S7:** `web:<module>:<verb>-<noun>`. The five v1 channels are:
   - `web:shell:module-change` — `goTo(moduleId)` navigation + Dashboard MiniCal → Calendar deep-link
   - `web:settings:preference-changed` — Settings live broadcast of theme / density / accent-hue / rail-pos / bg-tone / font-scale / lang
   - `web:shell:pet-toggle` — Pet on/off from rail bottom
   - `web:pomodoro:session-finished` — placeholder declaration only (W2 row #14 emits)
   - `web:habits:checkin-recorded` — placeholder declaration only (W2 row #15 emits)
6. **No-op safety:** firing into a channel with zero listeners is a no-op (no throw, no warn). This matches `EventTarget.dispatchEvent` semantics.
7. **No memory leaks:** hook returns are wired through React `useEffect` cleanup; the bus uses `addEventListener` / `removeEventListener` pairs.
8. **No `any` in payloads:** every channel has a concrete TS interface. Lint rule `@typescript-eslint/no-explicit-any` will catch regressions.
9. **`index.ts` only public surface.** No deep imports from `packages/xai-web-event-bus/src/internal/` are allowed. Re-exports of `EventMap` keys from `@repo/core/types/events` are surfaced from this package for ergonomic discovery (`import { WebEventMap } from '@repo/xai-web-event-bus'`).
10. **Package name decision deferred to feature-build.** Working name in this plan: `@repo/xai-web-event-bus` (matches manifest slug and parallel-write directory). ADR-0007 §S7 forbids `@repo/plugin-web-events` *as a re-export wrapper of @repo/core/events*; the package this plan creates is **not** a re-export wrapper — it is a browser-only runtime adapter, which the ADR did not contemplate. The feature-review agent must confirm naming before feature-build commits a `package.json`.

## Dependency Overview

```
@repo/xai-web-event-bus
├── depends on (compile-time, types only):
│   └── @repo/core (workspace:*) — re-uses EventMap shape from packages/core/src/types/events.ts
├── depends on (runtime):
│   └── (none — uses native browser EventTarget)
├── dev-deps:
│   ├── react ^19.2.0 (peer; for the hook)
│   ├── @types/react 19.2.2
│   ├── vitest ^3.2.1
│   ├── jsdom ^26.1.0 (vitest environment for EventTarget + React hooks)
│   ├── @testing-library/react ^16 (cleanup verification)
│   └── @repo/typescript-config workspace:*
└── consumed by (downstream rows, none today):
    ├── xai-web-shell (row #5) — emits web:shell:module-change + web:shell:pet-toggle
    ├── xai-web-settings-appearance (row #22) — emits web:settings:preference-changed
    ├── xai-web-calendar (row #12) — listens to web:shell:module-change with detail payload
    ├── xai-web-dashboard-widgets (row #11) — emits web:shell:module-change deep-link from MiniCal
    ├── xai-web-pomodoro (row #14) — emits web:pomodoro:session-finished
    ├── xai-web-habits (row #15) — emits web:habits:checkin-recorded
    └── xai-web-statistics (row #20) — listens to web:pomodoro:* + web:habits:* + web:tasks:*
```

### Cross-package data flow (W1 + early W2)

```
┌──────────────────┐    web:shell:module-change    ┌──────────────────┐
│ apps/web App.tsx │ ─────────────────────────────▶│ host shell router │
│ (replaces goTo)  │                                └──────────────────┘
└──────────────────┘                                          ▲
        ▲                                                     │
        │ web:shell:module-change                             │
        │ {moduleId:"calendar", focusDate?:"2026-05-23"}      │
        │                                                     │
┌──────────────────┐                                          │
│ MiniCal widget   │ ─────────────────────────────────────────┘
│ (W2 row #11)     │
└──────────────────┘

┌──────────────────┐  web:settings:preference-changed  ┌──────────────────┐
│ SettingsAppearance│ ────────────────────────────────▶│ App.tsx <html>    │
│ pane (row #22)    │  {key, value}                    │ data-* attribute  │
└──────────────────┘                                    └──────────────────┘
```

## Out of Scope

- Persisting events (no event log / replay).
- Cross-tab/window sync (no BroadcastChannel in v1 — Web is single-tab SPA per ADR-0006).
- Cross-process bridge to Tauri host (`apps/web/` does not run inside Tauri; the desktop face uses a different bus).
- Migrating existing desktop `organizer:*` / `project:*` channels into the new adapter (out of scope by ADR-0007 §S7 — desktop keeps Tauri transport).
- A separate `@repo/plugin-web-events` re-export package (ADR-0007 §S7 explicit rejection still stands).
- **`manifest.json`** — this package is a Web platform shim, not a `plugin-*` business plugin. It does not participate in the `PluginRegistry` routing system. No `manifest.json` is created. The PLUGIN_MAP.md row for `@repo/xai-web-event-bus` documents its status without a plugin manifest. (Feature-review recommendation R-3, applied in P1.)

## Related Decisions

- ADR-0007 §S4 (file-level port mapping) — confirms `apps/web/src/App.tsx` is host shell with zero business logic; bus calls live in shell or modules.
- ADR-0007 §S7 (cross-module communication rule) — pins `web:<module>:<verb>-<noun>` naming + EventMap on `@repo/core`.
- ADR-0007 冻结假设 §4 — re-uses `@repo/core/events` typed-event layer. This plan honors the **type layer**; the **runtime layer** is split because the desktop runtime doesn't work in browsers.
- CLAUDE.md §"Code Boundaries" — Plugin-to-plugin interaction → `@repo/core/events`. The browser variant of this package is the Web compliance vehicle.
- W0.B SHIPPED precedent: `plugin-project` 16-scenario typed-event emit suite (commit `dcd7d52`) — same shape EventMap + Vitest mock pattern is the testing model.
