# Roadmap Seed — xai-web-event-bus

> xai-web-console roadmap · feature #4 · wave W1 · Foundation
> Source PRD: web design/DESIGN.md §10.3 (组件/模块通信)
> Source Code: web design/app.jsx (goTo prop), CLAUDE.md §"Code Boundaries" (typed events rule)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Provide a typed event bus + minimal shared store for cross-module signaling so module-to-module interaction does not go through direct imports (per CLAUDE.md `Plugin-to-plugin interaction → @repo/core/events`). Must support: `goTo(moduleId)` navigation (DESIGN.md §10.3), Settings → live theme/density/accent/rail-pos broadcast, Dashboard mini-cal → Calendar deep-link, pet-on toggle from rail bottom.

## Hard constraints

- Reuse `@repo/core/events` typed-event pattern from the desktop project where it semantically fits; if a Web-specific module is cleaner, document the choice.
- Event payload shapes MUST be typed (no `any`) and exported from a single source of truth file.
- No module is allowed to direct-import another module's internals; the bus is the only cross-module surface (`index.ts` only).
- Bus MUST be a no-op safe (no-listener fires must not throw) and MUST not memory-leak (cleanup on unmount).

## Acceptance signal

Two distinct module placeholders can subscribe + emit through the bus, a unit test asserts payload typing, and an unused listener cleans up correctly.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-build-form-adr.
