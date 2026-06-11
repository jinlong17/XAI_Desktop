# Roadmap Seed - desktop-local-first-web-data-migration

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase3
> Branch: dev

## Requirement

Migrate or import existing Web localStorage/IndexedDB user data into the desktop local-first store without corrupting browser Web behavior.

## Hard constraints

- Migration must be idempotent, observable, and reversible or safely retryable.
- Do not mutate browser Web data in a way that breaks pure Web sessions.
- Respect the storage ADR's user/account boundary and backup semantics.

## Acceptance signal

Desktop first-run or explicit import can move representative Web data into the local-first store, handles partial/corrupt data safely, and leaves browser Web behavior intact.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-local-first-repository-bridge` SHIPPED.
