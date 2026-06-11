# desktop-local-first-storage-adr - Test Strategy

## Validation Strategy

This row is documentation-only, so validation focuses on architecture completeness and downstream testability.

## 1. Discovery / Review Coverage

- Confirm the discovery review evaluates all three candidate families:
  - SQLite
  - IndexedDB
  - file-first JSON
- Confirm the recommendation cites current repo evidence instead of generic assumptions
- Confirm the plan distinguishes evidence packages from actual decision authority

## 2. ADR Acceptance Coverage

The future ADR build must be reviewable against these checks:

- storage choice is explicit
- live DB path policy is explicit
- backup/export location policy is explicit
- browser import boundary is explicit
- sync-log and conflict semantics are explicit
- repository contract ownership is explicit
- required seam references are explicit (`Repo`, `RepoRecord`, `SyncScope`, `sync-outbox`)
- snapshot scope decision is explicit (deferred to `desktop-local-first-backup-export-import`)
- later-row unlock rules are explicit

## 3. Downstream Contract Coverage

Reviewers should verify that the plan leaves later rows with no foundational ambiguity:

- `desktop-local-first-sqlite-foundation`
  - can implement migrations and file policy without reopening engine choice
- `desktop-local-first-repository-bridge`
  - can target a stable repository seam
- `desktop-local-first-web-data-migration`
  - can implement idempotent browser-safe import
- `desktop-local-first-offline-edit-queue`
  - can implement queue states against a frozen sync-log model
- `desktop-local-first-sync-reconnect`
  - can rely on explicit conflict and retry guarantees
- `desktop-local-first-backup-export-import`
  - can implement export/restore UX without redefining live-store boundaries

## 4. Mock Strategy

- No production mocks are needed in this planning row
- During later implementation:
  - browser import sources should be mockable from `@repo/plugin-web-storage` and IndexedDB fixtures
  - desktop repository behavior should be mockable through `@repo/core-data` test drivers
  - queue/conflict scenarios should be testable without live network services

## 5. Manual Review Checklist

- The row remains an ADR gate and does not drift into implementation
- Overlay/control/grid and organizer restoration stay out of scope
- Web browser behavior remains preserved, not redefined
- SQLCipher and earlier SQLite work are treated as evidence, not as pre-approved architecture
