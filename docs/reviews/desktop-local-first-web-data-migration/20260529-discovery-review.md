# Discovery Review - desktop-local-first-web-data-migration

> Feature: `desktop-local-first-web-data-migration`
> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5.3-codex inline)
> Research mode: internal repo evidence only
> External research: No external research required

## 1. Problem Framing

The desktop app already mounts the row `#11` repository bridge in `desktop-phase1-offline`, but that bridge only affects current desktop reads and writes. It does not import historical browser-owned data into the SQLite live store. Existing users can therefore have representative data still living only in browser storage:

- `localStorage` for tasks, habits, pomodoro, board workspace state, pet basic state, and settings
- IndexedDB for browser auth/session state, encrypted cache blobs, and AI secrets

Row `#12` must plan a migration/import layer that pulls the representative user data into the desktop local-first store while leaving browser Web behavior intact. The plan must stay inside the shipped bridge/foundation boundary and must not mutate browser source data in a way that breaks pure Web sessions.

## 2. Repo Evidence

### 2.1 Runtime and bridge baseline

- `apps/web/src/providers/AppProviders.tsx`
  - mounts `mountDesktopLocalFirstRepositoryBridge(...)` only when runtime resolves to `desktop-phase1-offline`
- `packages/core/src/utils/runtime-profile.ts`
  - freezes the runtime split to `web-live` vs `desktop-phase1-offline`
- `packages/plugin-web-storage/src/internal/storage.ts`
  - still writes browser-visible state to `localStorage`
  - also forwards desktop writes through `writeDesktopRepoValue(...)`
- `packages/plugin-web-storage/src/internal/desktopRepoBridge.ts`
  - row `#11` already maps representative browser keys to canonical repo records
- `packages/desktop-local-first-repository-bridge/docs/dev_log.md`
  - row `#11` shipped and explicitly deferred browser migration/import to row `#12`

### 2.2 Representative localStorage surfaces now in scope

| Surface | Browser source | Canonical desktop target from row `#11` | Scope call |
|---|---|---|---|
| Tasks | `xai_task_cols` | `productivity.todo` | import |
| Habits | `xai_habits_state` | `productivity.habit` | import |
| Pomodoro | `xai_pomodoro_sessions` | `productivity.pomodoro_sessions` | import |
| Boards | `xai_boards_v2` | `project.board` + `project.card` | import |
| Board auxiliary | `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, `xai_board_view_by_id` | `project.workspace_state` | import |
| Pet basic state | `xai_pet_id`, `xai_pet_pos` | `pet.state` | import |
| Settings | registry-backed `xai_*` / `xai_pref_*` keys already bridged by row `#11` | `settings.pref` | import |
| Notes | no canonical active owner | unsupported | defer |

Shape evidence is already concrete in:

- `packages/xai-web-tasks/src/types.ts`
- `packages/xai-web-habits/src/types.ts`
- `packages/plugin-web-pomodoro/src/types.ts`
- `packages/plugin-web-board-core/src/types.ts`
- `packages/plugin-web-board-workspaces/src/internal/types.ts`
- `packages/xai-web-pet/src/types.ts`
- `packages/plugin-web-storage/src/__tests__/desktopRepoBridge.test.ts`

### 2.3 Browser IndexedDB inventory

The repo currently documents three browser-owned IndexedDB databases:

| IndexedDB database | Evidence | Current ownership | Scope call |
|---|---|---|---|
| `web-encrypted-cache` | `packages/core-data/src/indexeddb-sync-blob.ts`, `packages/web-auth-device-session/src/wipe.ts` | browser encrypted cache/sync blob plane | observe and skip |
| `xai-web-ai-secrets` | `packages/plugin-web-ai-chat/src/internal/secretStore.ts`, `packages/web-auth-device-session/src/wipe.ts` | browser-only AI API secret store | observe and skip |
| `xai-web-auth` | `packages/web-auth-device-session/src/storage.ts`, `packages/web-auth-device-session/src/wipe.ts` | browser auth/session storage | observe and skip |

Why these are out of import scope now:

- ADR-0012 freezes browser IndexedDB cache/sync/auth ownership on the browser side.
- None of the three has a row `#11` canonical desktop target in the representative migration set requested for row `#12`.
- Copying them into the desktop live store risks corrupting browser auth, secret, or cache expectations while adding no approved Phase 3 value.

Recommendation: row `#12` should inventory these stores and report them as skipped browser-owned sources, not import them.

## 3. Candidate Trigger Models

### Option A - Silent automatic first-run import

On first desktop run, if the desktop repo is empty and browser data exists, import immediately with no user-visible decision.

Pros:

- simplest user path
- no extra explicit UI required

Cons:

- weak observability
- higher risk when source is partial, corrupt, or tied to a different remembered account context
- harder to explain or safely rerun when import results differ from expectation

### Option B - First-run eligibility scan plus explicit execution

On first desktop run, scan browser storage and compute an import report. If eligible data exists, surface a one-time import CTA. The same engine also supports an explicit re-import action later.

Pros:

- satisfies the "desktop first-run or explicit import" requirement without silent mutation
- gives observability before any write
- creates a natural retry path
- easier to protect account-boundary conflicts

Cons:

- requires minimal import-state UI/CTA wiring
- more moving parts than a silent auto-run

### Option C - Explicit import only

Never scan or prompt on first run. Import happens only when the user chooses an import action.

Pros:

- maximum safety
- easiest to explain

Cons:

- poor first-run experience for migrated desktop users
- easy to miss unless users know the feature exists

## 4. Candidate Execution Models

### Option 1 - Direct upsert only

Read browser source and blindly `put` the canonical records into the row `#11` repo targets.

Pros:

- simple to build

Cons:

- no stable no-op detection
- stale previously imported records are hard to delete safely
- weak retry story
- weak observability

### Option 2 - Transactional per-surface reconcile with import ledger

For each surface, normalize source into a canonical projection, compute a stable fingerprint, compare it against the last successful import for the same boundary, and reconcile the repo transactionally. Record the result in a dedicated import ledger.

Pros:

- strong idempotency
- safe retry semantics
- explicit per-surface observability
- precise stale-record cleanup for previously imported record ids

Cons:

- needs metadata records and reconciliation logic

### Option 3 - Stage raw browser blobs in a separate namespace first

Copy browser payloads into a staging namespace, then transform them into canonical records in a later step.

Pros:

- raw-source traceability

Cons:

- duplicates data planes
- looks like a parallel bridge design
- exceeds the practical scope of row `#12`

## 5. Recommendation

Recommend Option B for triggers and Option 2 for execution.

### 5.1 Why this fits the repo

- It builds directly on the shipped row `#11` canonical mapping instead of creating a second bridge.
- It keeps browser source non-destructive and observable.
- It uses the shipped SQLite transaction primitive through the existing `Repo.transaction(...)` / `db_put_batch` path.
- It gives row `#13` / `#14` / `#17` clean downstream evidence instead of ambiguous one-shot side effects.

### 5.2 Trigger semantics

Use one import engine with two entry modes:

1. `first-run-scan`
   - runs only in `desktop-phase1-offline`
   - reads browser storage and computes an eligibility report
   - does not mutate repo or browser source
   - auto-executes only if product review later explicitly approves that behavior; default row `#12` recommendation is prompt-before-write

2. `explicit-import`
   - user-triggered rerun from a desktop-facing settings/debug entry point
   - can re-import changed surfaces
   - must surface account-boundary warnings and skipped-surface reasons

### 5.3 Reconciliation rules

For each imported surface:

- read browser source without mutating it
- validate and normalize it into the same canonical projection already used by row `#11`
- compute a stable fingerprint from the normalized source
- compare that fingerprint with the last successful import state for the same surface and account boundary
- if equal: report `unchanged` and do not rewrite repo timestamps
- if different: run a transaction that upserts current projection rows and deletes only the previously imported record ids for that surface that are no longer present

This requires a dedicated import ledger, but not a bridge redesign. A separate namespace such as `xai-web-desktop-local-first-import` is sufficient.

### 5.4 Safe-retry strategy

This row should guarantee safe retryability, not a full rollback UX.

Why retry is safe:

- browser source remains untouched
- each surface imports transactionally
- unchanged-source reruns no-op by fingerprint
- changed-source reruns reconcile against the prior imported record-id set
- corrupt surfaces do not delete good desktop data

### 5.5 Partial and corrupt data handling

Import status must be tracked per surface:

- `imported`
- `unchanged`
- `empty`
- `skipped`
- `corrupt`
- `failed`

Rules:

- one corrupt surface does not block healthy surfaces by default
- malformed browser JSON must not be coerced into destructive empty imports
- a corrupt source should report diagnostic detail and skip repo mutation for that surface
- browser-owned IndexedDB stores should report `skipped` with reason `browser_owned_store`

### 5.6 User/account boundary

The current repo seam is namespace-based rather than fully account-partitioned, so row `#12` must at least preserve boundary evidence in the import ledger.

Recommended boundary key:

- `currentAccountKey = session.user.id` when present
- fallback `local-session` when no authenticated user is present

Rules:

- record the boundary key on every import run
- first-run auto execution must not silently run if the desktop profile already has successful imports recorded for a different boundary key
- explicit import may proceed across a boundary mismatch only after a visible warning/confirmation path
- downstream sync rows can later use this ledger evidence to decide whether imported account-sync records are safe to push

### 5.7 Representative coverage decision table

| Surface | Browser source | Import projection | Reconcile rule |
|---|---|---|---|
| Tasks | `xai_task_cols` | deterministic `productivity.todo` ids derived from task cards | upsert current todo set, delete prior imported todo ids for task surface that disappeared |
| Habits | `xai_habits_state` | deterministic `productivity.habit` ids | upsert current habits, replace completion payloads by id |
| Pomodoro | `xai_pomodoro_sessions` | single `productivity.pomodoro_sessions` record | replace record when fingerprint changes |
| Boards/cards | `xai_boards_v2` | `project.board` + `project.card` | reconcile board/card ids separately inside one surface transaction |
| Board auxiliary | `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, `xai_board_view_by_id` | four `project.workspace_state` rows keyed by storage slot | replace per slot |
| Pet | `xai_pet_id`, `xai_pet_pos` | two `pet.state` rows keyed by storage slot | replace per slot |
| Settings | present bridged `xai_*` / `xai_pref_*` values only | one `settings.pref` record per key | replace only imported keys; do not synthesize absent defaults as destructive deletes unless review approves |

### 5.8 Why settings should not import every default

For row `#12`, importing only materially present settings keys is safer than synthesizing the entire registry default set:

- it avoids rewriting the desktop repo with defaults the user never explicitly set
- it keeps reruns deterministic against actual browser state
- it avoids making row `#12` look like row `#17` restore/reset behavior

## 6. Risks and Open Questions

### Risks

- Tasks and board projections encode browser-specific metadata inside canonical records today; build must reuse the row `#11` mapping helpers rather than silently inventing a second transform.
- If import UI is placed in settings, build must keep settings as a consumer of import state, not the owner of import business logic.
- A same-machine desktop profile may see stale browser data from a different Web account unless boundary conflict checks are enforced.

### Open questions for review

1. Should first-run desktop import prompt immediately after eligibility scan, or only expose a passive banner?
2. Is `local-session` an acceptable fallback boundary key for first-run scans when auth is absent, or should account-sync surfaces be blocked until authenticated?
3. Should settings import treat missing keys as "leave desktop repo as-is" or "reset previously imported settings rows to default"? This plan recommends "leave as-is" for safety.

## 7. Implementation Boundary Recommendation

- Workflow/docs anchor only:
  - `packages/desktop-local-first-web-data-migration/docs/*`
- Shared generic import ledger and fingerprint helpers:
  - `packages/core-data/`
- Browser storage read + row `#11` mapper reuse:
  - `packages/plugin-web-storage/`
- Runtime mount / first-run scan trigger only:
  - `apps/web/src/providers/AppProviders.tsx`
- Explicit import UI consumer, if needed:
  - `packages/plugin-web-settings-shell/` or `packages/plugin-web-settings-rest/`

No production logic should move into `apps/desktop/src/` or `packages/core/`.
