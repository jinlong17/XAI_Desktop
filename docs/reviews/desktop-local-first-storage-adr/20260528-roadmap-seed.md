# Roadmap Seed - desktop-local-first-storage-adr

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase3
> Branch: dev

## Requirement

Draft and accept the Phase 3 storage ADR. Decide SQLite vs IndexedDB vs file storage, define sync log, migrations, conflict model, repository interfaces, and the Web/Desktop boundary.

## Hard constraints

- This ADR must ship before Phase 3 storage implementation starts unless the manifest is explicitly edited by a human.
- Reconcile existing evidence packages such as `sqlcipher-local-db`, `core-data-sqlite-driver`, and Web storage contracts without treating them as automatic decisions.
- Preserve Web browser behavior and define migration/import boundaries before code changes.

## Acceptance signal

An accepted ADR exists and future Phase 3 rows can cite storage choice, migration rules, conflict semantics, repository interfaces, backup location, and Web/Desktop ownership without reopening the architecture.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-phase2-integrated-rc-gate` SHIPPED, unless a human explicitly accepts parallel ADR planning.
