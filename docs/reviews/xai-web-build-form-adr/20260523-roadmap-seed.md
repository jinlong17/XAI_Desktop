# Roadmap Seed — xai-web-build-form-adr

> xai-web-console roadmap · feature #1 · wave W0 · BUILD FORM ADR
> Source PRD: web design/DESIGN.md §10 (技术架构), §13 (后续可扩展方向)
> Source Code: web design/index.html, web design/app.jsx
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23). User decision on 2026-05-23: migrate to TS modules under apps/web/ + packages/plugin-web-*; this ADR records the port mapping.

## Requirement

Produce an ADR that locks the migration from the Babel-in-browser flat-file form (web design/*.jsx) into TypeScript modules under apps/web/src/ + new packages/plugin-web-*. The ADR must enumerate the file-by-file port mapping, the JSX→TSX strategy, the global-window-namespace → typed-import strategy, the localStorage key registry hand-off, and how the new code coexists with the SHIPPED web-ticktick-parity platform spine (auth-device-session, browser-crypto-runtime, sync-blob-driver, encrypted-indexeddb-cache, console-host-router, security-csp-sentry).

## Hard constraints

- No product code edits in this feature; documentation/ADR only.
- ADR must call out which web-ticktick-parity PENDING rows are SUPERSEDED by xai-web-console (productivity-habits-pomodoro, project-label-calendar, search-keyboard-theme, statistics-views) and mark them paused in this roadmap's Rationale.
- ADR must reference DESIGN.md §9.2 persistence keys as the canonical local-state contract for the new modules.
- ADR must specify whether each module becomes a packages/plugin-web-* package or an apps/web/src/modules/<name>/ folder, and the rule for cross-module communication (typed event bus, no direct imports).

## Acceptance signal

`docs/adr/NNNN-xai-web-console-build-form.md` exists, is Accepted, and downstream feature plans can cite it without re-opening the build-form debate.

## Dependencies (advisory — manifest is authoritative)

Depends On: none.
