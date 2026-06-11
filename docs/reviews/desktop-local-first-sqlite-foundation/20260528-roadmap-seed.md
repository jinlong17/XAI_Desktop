# Roadmap Seed - desktop-local-first-sqlite-foundation

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase3
> Branch: dev

## Requirement

Implement the selected local database foundation, likely SQLite via the Tauri/Rust layer, with migrations, typed repository boundary, backup-safe file location, and test fixtures.

## Hard constraints

- Do not start until `desktop-local-first-storage-adr` is SHIPPED.
- Follow the ADR's selected storage, migration, conflict, and backup-location decisions rather than hardcoding the advisory SQLite assumption.
- Keep business entity logic out of the Tauri host; expose typed repository boundaries.

## Acceptance signal

The desktop app has a tested local database foundation with migrations, typed repository APIs, file-location policy, fixture support, and no browser Web behavior regression.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-local-first-storage-adr` SHIPPED.
