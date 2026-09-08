# Roadmap Seed — web-todo-first-slice

> web-ticktick-parity roadmap · feature #11 · wave W7 · first product slice
> Source PRD: docs/planning/sub-prds/web/PRD.md §3.1, §5.2, §10.1 · dev-plan Week 2
> Status hint: PENDING

## Requirement

Deliver the first real TickTick-style Web slice: `/app/todos` list/detail, create, edit title/notes, complete/uncomplete, delete/soft-delete, list selection, and refresh/deep-link restore, all backed by encrypted Sync blob data and local indexes rather than mocks.

## Hard constraints

- No static `accountMocks` or hard-coded `/console` content may satisfy this row.
- Data writes require DEK availability and go through `Repository<T>` + Sync blob mutation pipeline.
- The slice must provide enough fixture data and tests for later Realtime/offline rows to verify end-to-end behavior.

## Acceptance signal

A user can log in locally, open `/app/todos`, create/edit/complete a task, refresh the browser, and see the task restored from encrypted local/server-backed data.

## Dependencies (advisory — manifest is authoritative)

Depends On: web-auth-device-session, web-sync-blob-driver, web-encrypted-indexeddb-cache, web-console-host-router.
