# Feature Brief - desktop-local-first-web-data-migration

> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5.3-codex inline)
> Source: `docs/reviews/desktop-local-first-web-data-migration/20260528-roadmap-seed.md`
> Roadmap: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#12`

## Feature Title

Desktop Local-First Web Data Migration

## Canonical Name

`desktop-local-first-web-data-migration`

## Naming Rationale

The roadmap slug is already the correct boundary. This row does not redesign the repository bridge or introduce offline queue/sync semantics. It plans the browser-data import layer that moves existing Web-owned data into the shipped desktop local-first store using the row `#11` canonical record surfaces.

## Motivation

Row `#11` shipped the desktop repository bridge, but existing user data can still live only in browser storage from prior pure-Web or pre-bridge desktop sessions. The active desktop product is still `apps/web` under `desktop-phase1-offline`, so row `#12` must define how desktop first-run and explicit import can pull representative Web data into the local-first store without:

- corrupting browser Web behavior
- mutating browser-owned source data
- crossing account/session boundaries blindly
- leaking into row `#13` queue/sync-log, row `#14` reconnect sync, row `#17` backup/export/import, or unsupported notes

The relevant source inventory is split across:

- `localStorage` representative user data already bridged by row `#11`
- browser-owned IndexedDB stores for auth, encrypted cache, and AI secrets that must remain observable but not silently re-homed into the desktop store

## Target Outcome

Ship an approved implementation plan that:

- inventories the current browser storage surfaces and maps the representative ones to row `#11` canonical repo targets
- defines first-run eligibility scan semantics and explicit import execution semantics
- guarantees idempotent, observable, and safely retryable import behavior
- handles partial or corrupt source data per surface without damaging browser behavior or deleting good desktop data
- preserves account/user boundary evidence for later sync rows
- leaves browser-owned IndexedDB auth/cache/secret stores untouched unless a canonical row-owned desktop target exists

## In Scope

- representative import coverage for:
  - tasks
  - habits
  - pomodoro sessions
  - boards/cards
  - board auxiliary workspace state
  - pet basic state
  - local settings
- first-run eligibility scan and explicit re-import trigger semantics
- per-surface import reconciliation, fingerprinting, and import-run observability
- browser-owned IndexedDB inventory and explicit skip/defer rules
- safe retry and boundary rules for multi-account or changed-source cases

## Out of Scope

- redesigning the row `#11` repository bridge
- row `#13` offline edit queue or durable sync-log work
- row `#14` reconnect sync
- row `#16` calendar degraded mode
- row `#17` backup/export/import UX or snapshot policy
- Phase 3 integrated RC work
- overlay/control/grid/organizer restoration
- hidden note-content model invention
- importing browser auth/session stores, AI secret stores, or encrypted sync-cache blobs into the desktop live store
- non-representative Web modules such as countdown, matrix, dashboard widgets, meditation, AI conversation history, or future repo-backed todo experiments unless review explicitly widens scope

## Hard Constraints

- Build on the shipped row `#11` canonical bridge surfaces; do not invent a second repository bridge.
- Browser source data must stay non-destructively readable by pure Web sessions after desktop import.
- Import must be idempotent, observable, and reversible or safely retryable. This plan chooses safe retryability as the required baseline.
- Respect ADR-0012 ownership boundaries: browser storage remains browser-owned; desktop live store remains SQLite-owned.
- Respect user/account boundaries. A first-run import must not silently merge browser data from a different remembered account context into an already-imported desktop profile.
- Keep notes unsupported unless repo evidence proves a canonical active note owner.

## Dependency Hints

- Governing ADR: `docs/adr/0012-phase3-local-first-storage.md`
- Shipped bridge baseline: `packages/desktop-local-first-repository-bridge/docs/dev_log.md`
- Shipped foundation seam: `packages/desktop-local-first-sqlite-foundation/docs/api.md`
- Active desktop runtime mount: `apps/web/src/providers/AppProviders.tsx`
- Runtime discriminator: `packages/core/src/utils/runtime-profile.ts`
- Browser storage owner and bridge mount: `packages/plugin-web-storage/src/internal/{registry.ts,storage.ts,desktopRepoBridge.ts}`
- Browser IndexedDB inventory evidence:
  - `packages/web-auth-device-session/src/storage.ts`
  - `packages/web-auth-device-session/src/wipe.ts`
  - `packages/plugin-web-ai-chat/src/internal/secretStore.ts`
  - `packages/core-data/src/indexeddb-sync-blob.ts`

## Acceptance Signal

The plan clearly defines:

- which representative browser surfaces import into which canonical repo targets
- how first-run scan and explicit import differ
- how same-source reruns no-op safely
- how changed-source reruns reconcile safely
- how corrupt or skipped surfaces are reported without mutating browser source
- why browser-owned IndexedDB stores are observed and deferred rather than imported
- which build phases and tests are required before row `#12` can move to implementation
