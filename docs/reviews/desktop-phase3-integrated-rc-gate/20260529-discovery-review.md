# Discovery Review - desktop-phase3-integrated-rc-gate

> Feature: `desktop-phase3-integrated-rc-gate`
> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5 inline)
> Research mode: internal repo evidence only
> External research: No external research required

## 1. Problem Framing

Rows `#10` through `#17` are individually shipped, but Phase 3 still lacks one composed RC verdict. Without an integrated gate, the roadmap can only say that isolated capabilities landed, not that the active desktop runtime behaves coherently across:

- offline local-first surfaces
- reconnect replay
- backup/export/import
- AI degraded behavior
- calendar degraded behavior

This row is the checkpoint before P3 Future unlock, so the key question is not "what feature do we build next?" but "what evidence shape proves the shipped Phase 3 stack is good enough to ship as one unit?"

## 2. Repo Evidence

### 2.1 Roadmap and dependency state

- `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
  - row `#18` is `IN_PROGRESS`
  - rows `#10` through `#17` are `SHIPPED`
- row ownership already exists in package docs for:
  - SQLite foundation
  - repository bridge
  - web-data import
  - offline queue
  - reconnect replay
  - AI offline provider policy
  - calendar degraded mode
  - backup/export/import

This means row `#18` should compose evidence, not invent a second implementation program.

### 2.2 Active runtime seam is already exposed

- `apps/web/src/providers/AppProviders.tsx`
  - mounts `mountDesktopLocalFirstRepositoryBridge(isDesktopOfflineRuntime)`
  - exposes desktop globals for:
    - `__XAI_DESKTOP_WEB_IMPORT__`
    - `__XAI_DESKTOP_RECONNECT_SYNC__`
    - `__XAI_DESKTOP_BACKUP__`
- `packages/plugin-web-storage/src/index.ts`
  - exports the bridge/runtime helpers used by those globals:
    - `runDesktopLocalFirstWebDataImport`
    - `getDesktopLocalFirstReconnectSyncPreflight`
    - `runDesktopLocalFirstReconnectSync`
    - `runDesktopLocalFirstCalendarProviderReconnect`
    - `createDesktopLocalFirstBackupArtifact`
    - `verifyDesktopLocalFirstBackupArtifact`
    - `importDesktopLocalFirstBackupArtifact`

The integrated gate can therefore reuse real runtime seams instead of inventing ad hoc test-only entry points unless a very small report helper becomes necessary.

### 2.3 Upstream package/test surface is already concrete

From the shipped Phase 3 docs, the current executable surface already includes:

- shared/core:
  - `pnpm --filter @repo/core-data test`
  - `pnpm --filter @repo/core-data check-types`
- bridge/runtime:
  - `pnpm --filter @repo/plugin-web-storage test`
  - `pnpm --filter @repo/plugin-web-storage check-types`
- local-first modules:
  - `pnpm --filter @repo/plugin-web-tasks test`
  - `pnpm --filter @repo/plugin-web-board-core test`
  - `pnpm --filter @repo/plugin-web-board-core typecheck`
  - `pnpm --filter @repo/plugin-web-board-workspaces test`
  - `pnpm --filter @repo/plugin-web-board-workspaces typecheck`
  - `pnpm --filter @repo/plugin-web-habits test`
  - `pnpm --filter @repo/plugin-web-pomodoro test`
  - `pnpm --filter @repo/plugin-web-pet test`
  - `pnpm --filter @repo/plugin-web-settings-shell test`
  - `pnpm --filter @repo/plugin-web-settings-shell typecheck`
  - `pnpm --filter @repo/plugin-web-settings-rest test`
  - `pnpm --filter @repo/plugin-web-settings-rest typecheck`
- degraded online-only surfaces:
  - `pnpm --filter @repo/plugin-web-ai-chat test`
  - `pnpm --filter @repo/plugin-web-ai-chat typecheck`
  - `pnpm --filter @repo/plugin-web-calendar test`
  - `pnpm --filter @repo/plugin-web-calendar check-types`
- app-level gates:
  - `pnpm --filter @repo/web test`
  - `pnpm --filter @repo/web check-types`
  - `pnpm --filter @repo/web build`
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
  - `pnpm --filter desktop tauri build --debug --bundles app`

### 2.4 Notes is a real contract gap, not a missing sentence

The requirement summary mentions notes, but repo truth is explicit:

- `packages/core-data/src/desktop-bridge.ts`
  - exports `NOTES_UNSUPPORTED_ERROR`
- row `#11` repository-bridge docs freeze notes as unsupported
- row `#12` migration docs also freeze notes as unsupported
- current shell registration truth in `apps/web/src/routes/modules/shellRegistrations.tsx` does not register a notes module

Therefore row `#18` cannot honestly promise offline create/edit/relaunch for notes without reopening implementation scope that upstream rows explicitly deferred.

## 3. Candidate Options

### Option A - Dedicated integrated Phase 3 RC gate with split evidence planes

Create one integrated gate that:

- reruns the current repo-side package/web/rust/desktop baseline
- executes or records manual desktop smoke for offline/relaunch/reconnect/backup/degraded flows
- classifies each surface with one explicit outcome
- keeps notes as a contract-truth check instead of fake CRUD proof
- publishes one final integrated RC verdict

Pros:

- fits the roadmap row exactly
- reuses current runtime seams and current package gates
- preserves honest split between repo-side readiness and manual/macOS residuals
- exposes the notes mismatch instead of hiding it

Cons:

- requires a report-oriented build pass, not just "all upstream rows are shipped"
- may need a tiny helper or evidence harness if the current runtime globals are insufficient

### Option B - Treat row `#18` as satisfied by upstream shipped rows plus a short summary

Use shipped status from rows `#10` through `#17` as enough evidence and publish only a lightweight recap.

Pros:

- minimal work
- no new integrated artifact structure needed

Cons:

- fails the acceptance signal for an integrated RC evidence report
- does not prove cross-surface composition
- does not create a clear place to classify notes, reconnect, backup, AI, and calendar residuals together

### Option C - Reopen Phase 3 implementation inside row `#18`

Use the integrated gate as a place to add missing product behavior, especially notes or new unified UI.

Pros:

- could close some real product gaps in one place

Cons:

- directly violates the row charter as an evidence gate
- blurs ownership across already shipped rows
- would let build drift into unbounded new feature work

## 4. Recommendation

Recommend Option A.

This repo already has the core pieces. The missing artifact is the integrated verdict, not a new product slice. Option A is the only approach that satisfies the roadmap contract, uses existing owners, and keeps ship-time truth honest.

## 5. Recommended Evidence Model

### Phase 1 - Integrated repo-side baseline and dependency ledger

Publish:

- `docs/reviews/desktop-phase3-integrated-rc-gate/20260529-phase1-integrated-repo-baseline.md`

Purpose:

- snapshot rows `#10` through `#17`
- rerun the canonical executable gate set
- record which evidence is freshly rerun versus inherited

### Phase 2 - Offline local-first surface matrix

Publish:

- `docs/reviews/desktop-phase3-integrated-rc-gate/20260529-phase2-offline-local-first-matrix.md`

Surfaces:

- tasks
- board
- habits
- pomodoro
- notes contract truth
- pet
- settings

Purpose:

- verify offline create/edit/relaunch expectations for the active surfaces
- verify notes remains explicitly unsupported instead of silently succeeding
- separate repo-side PASS evidence from manual/macOS-only evidence when required

### Phase 3 - Reconnect, backup, and degraded online-only matrix

Publish:

- `docs/reviews/desktop-phase3-integrated-rc-gate/20260529-phase3-reconnect-backup-degraded-matrix.md`

Surfaces:

- reconnect sync
- backup/restore
- AI provider policy
- calendar degraded/reconnect

Purpose:

- verify the existing runtime helpers and package behavior compose
- record degraded behavior instead of assuming online-only surfaces become local-first

### Phase 4 - Final integrated RC verdict

Publish:

- `docs/reviews/desktop-phase3-integrated-rc-gate/20260529-phase4-integrated-rc-verdict.md`

Required contents:

- repo-side readiness summary
- one classification row per integrated surface
- notes contract-truth verdict
- cross-surface interaction notes
- manual/macOS residuals section
- explicit statement on whether row `#18` is ready for `feature-verify` and later `ship`

## 6. Classification Rules

Recommended result types:

- `PASS`
- `BLOCKED_REPO`
- `BLOCKED_ENVIRONMENT`
- `DEFERRED_OUT_OF_SCOPE`

Recommended interpretation:

- `PASS`
  - direct evidence exists and the surface meets its approved contract
- `BLOCKED_REPO`
  - a repo-owned defect reproduced against the approved contract
- `BLOCKED_ENVIRONMENT`
  - required real-macOS or operator-controlled execution was unavailable or untrustworthy
- `DEFERRED_OUT_OF_SCOPE`
  - the surface was intentionally not implemented by upstream contract, most notably notes

## 7. Risks and Open Questions

### 7.1 Notes requirement versus repo truth

This is the main planning risk. The user requirement names notes, but the shipped upstream contract says notes is unsupported. Recommendation:

- do not reopen note-model implementation in this row
- classify notes explicitly in the final integrated report
- treat any desire for real note CRUD as a future feature, not a row `#18` blocker repair

### 7.2 Manual desktop evidence remains separate

Offline relaunch, reconnect smoke, and backup/restore UX may require real desktop execution. The integrated gate should still publish repo-side readiness even when some manual steps remain `BLOCKED_ENVIRONMENT`.

### 7.3 Helper creep

If build cannot produce a clean report from existing runtime seams, a small report helper may be justified. Anything broader than a narrow helper should be rejected as scope drift.
