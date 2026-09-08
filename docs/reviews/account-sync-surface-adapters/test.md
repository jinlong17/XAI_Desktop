# account-sync-surface-adapters - Test Plan

## Planning-Phase Validation

This feature-plan run is docs-only. No runtime/unit/manual product tests are
required at the planning step.

The planning artifacts should be reviewed for:

- authority traceability back to rows #1-#5, ADR-0013 D3/D4,
  `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, and paused `sync-v1`;
- complete Web/App/Plugin adapter coverage;
- preservation of repository-only plugin access and local-first exclusions;
- explicit paused-lane handling for plugin runtime and sync-v1 runtime work;
- absence of new `RepoRecord`, `syncScope`, crypto, or device-identity
  definitions.

## Build-Phase Acceptance Checks

When the docs-only build phase creates
`docs/contracts/account-sync-surface-adapters.md`, review it against these
gates:

- Web adapter table includes writable entity classes, local-only exclusions,
  sync-status/conflict inputs, offline ownership, and D3 routing notes.
- App adapter table includes writable entity classes, local-only exclusions,
  SQLite/SQLCipher + Keychain/Tauri ownership, sync-status/conflict inputs, and
  offline ownership.
- Plugin adapter table includes entity declaration rules, repository-only
  access, forbidden direct store access, and read-only sync-status/conflict
  consumption boundaries.
- Downstream routing clearly separates `web`, `app`, `plugin`, and `sync`
  follow-up work.
- The contract does not unpause plugin runtime or sync-v1 runtime work.
- The contract is registered in `docs/contracts/README.md`.

## Later Runtime Verification Matrix

This row should require later implementation rows to prove:

- repository-only plugin usage;
- `device-local` and local-only fields never enter account-sync transport;
- Web and App adapters render the same conflict/remediation meanings while using
  their own local runtime seams;
- Desktop-impacting Web changes carry D3 classification before App adaptation;
- no plugin surface acquires direct push/pull, secure-key, or direct DB access.

## Mock Strategy

- `@repo/core-data` remains `In-Dev`; any future implementation examples should
  stay contract-level or mock-first rather than claiming stable runtime
  integration.
- `plugin-account`, `plugin-productivity`, `plugin-labels`, and `plugin-project`
  remain non-stable dependency authorities in `docs/PLUGIN_MAP.md`; the contract
  may cite their entity ownership, but later consuming rows must preserve
  mock-first discipline where a stable implementation seam does not yet exist.

## Commands

No mandatory test command runs for the planning phase.

Recommended verification during later build/verify phases:

```bash
git diff --check -- docs/contracts/README.md docs/contracts/account-sync-surface-adapters.md docs/reviews/account-sync-surface-adapters
rg -n "RepoRecord|syncScope|device identity|D3|D4|plugin" docs/contracts/account-sync-surface-adapters.md docs/reviews/account-sync-surface-adapters
```
