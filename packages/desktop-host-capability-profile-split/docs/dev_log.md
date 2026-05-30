# dev_log.md — desktop-host-capability-profile-split

## Status Panel

- **Workflow**: FEATURE_DEV
- **Target**: desktop-host-capability-profile-split
- **Title**: Desktop Host / Capability Signal Split
- **Current Phase**: SHIP
- **Executor**: claude-sonnet-4-6
- **Updated**: 2026-05-30 10:00
- **Status**: SHIPPED
- **Suggested Next**: —
- **Blockers**: none

## Phase Plan

> `feature-build` runs ONE phase per invocation, then stops for confirmation.
> Each phase is independently build-able + test-able.

### Phase 1 — Core host signal (foundation)
- Add `resolveDesktopHost(env?, globals?)` / `isDesktopHost(host)` /
  `DesktopHost` / `XAI_DESKTOP_HOST_TAURI` / `XAI_DESKTOP_HOST_NONE` to
  `packages/core/src/utils/runtime-profile.ts` (or sibling `desktop-host.ts`).
- Re-export via `packages/core/src/utils/index.ts`.
- Add core Vitest (test.md §P1). Keep existing profile tests green.
- Est. commits: 1–2. Test: `pnpm --filter @repo/core test`.

### Phase 2 — Switch capability gates + host wiring
- Switch `isDesktopPhase1OfflineRuntime(runtimeProfile)` → `isDesktopHost(host)`
  in: notifications runtime (:64/:139/:180, keep adapter AND on :180),
  statusbar runtime (:150), auto-update runtime (:125/:147).
- Switch `AppProviders` host wiring (294–295/302–310/313/335–340): flip
  `isDesktopOfflineRuntime` source from profile to
  `isDesktopHost(resolveDesktopHost(import.meta.env))`. `plugin-web-storage`
  needs NO change — its `enabled` flag is caller-supplied (confirmed).
- `desktop-global-hotkey-quick-open` needs NO change — already adapter-only
  (confirmed, resolves O2).
- Update affected Vitest suites (env stub → host stub).
- DO NOT touch KEEP callsites.
- Est. commits: 2–4 (split by package; do not mix big refactor + behaviour).
  Test: per-package Vitest + `@repo/core`.

### Phase 3 — tauri.conf injection + wiring + smoke
- Add `VITE_XAI_DESKTOP_HOST=tauri` to `tauri.conf.json` `beforeBuildCommand` /
  `beforeDevCommand`. Do NOT reintroduce `desktop-phase1-offline`.
- Build desktop; run R-UI-1..3 + R-CAP-1..4 + R-WEB-1 (test.md §3) on real macOS.
- Est. commits: 1. Verify: `pnpm dev` in `apps/desktop/`.

## Risks

- R1 UI-alignment regression — gated by KEEP/MOVE table; manual smoke required.
- R2 tauri.conf env re-coupling — new var capability-only; guard note.
- O1 host-signal source — RESOLVED by review: Option A canonical, optional pure
  env-absent fallback only.
- O2 global-hotkey gate presence — RESOLVED: already adapter-only, no change.
- O3 last-data-cache-polish indicator — RESOLVED by review: KEEP on UI profile.
- (Resolved) R3 stale line numbers — all MOVE files verified this session.
- (Resolved) R4 `plugin-web-storage` seam — confirmed caller-supplied `enabled`,
  no internal gate; no storage package change needed.

## Review Notes

- APPROVED with O1 resolved as: Option A is the canonical host signal
  (`VITE_XAI_DESKTOP_HOST=tauri`). An optional pure fallback to
  `globals.__TAURI_INTERNALS__` is acceptable only inside the core resolver,
  only when the env is absent, and tests must assert env precedence plus no
  ambient global reads without injection.
- O3 resolved as KEEP: `desktop-last-data-cache-polish` remains on
  `runtimeProfile`. Its contract and badge copy are explicitly "Offline:
  showing cached local data"; moving it to the host signal would regress the
  just-shipped `web-live` UI alignment by showing offline-state UI in the live
  desktop wrapper.
- The KEEP/MOVE gate split is accurate. One wording fix for build: "28" is the
  occurrence count of `isDesktopPhase1OfflineRuntime(...)`, not 28 files.
- Additional direct `desktop-phase1-offline` references exist outside the gate
  inventory and are NON-BLOCKING for this feature: `packages/core-data/src/desktop-backup.ts`
  uses it as legacy `sourceApp` bundle metadata, and several module prop types /
  tests use it as a runtime-profile override literal. Leave those unchanged in
  this feature; any rename would be a separate schema/migration scope.
- The non-regression guard is sound: Organizer visibility stays on `App.tsx`
  KEEP logic, Boards seeding stays on `BoardWorkspacesModule.tsx` KEEP logic,
  and `/app` auto-entry stays protected by `VITE_WEB_AUTH_MODE=mock-authenticated`
  in `LandingPage.tsx`.

## Carve-out note

Touches `apps/web` (P0 maintenance-only — `AppProviders` only). Justified as a
P1 desktop-host repair under ADR-0011 §S5 (desktop reuses `apps/web`). Cite in
ship commit body. (`plugin-web-storage` is NOT modified — its bridge `enabled` is
caller-supplied.)

## Work Log

### Round 1 — 2026-05-30 — feature-plan (claude-opus-4-8)
- **Goal**: Normalize the host/capability decoupling brief; produce discovery
  review + four-doc set.
- **Done**: Created feature-brief, discovery-review (with full repo-wide
  `isDesktopPhase1OfflineRuntime` callsite inventory + KEEP/MOVE classification +
  3-option signal-source analysis, recommend A+C with optional B fallback),
  design (decision snapshot), api (new `@repo/core` surface + per-module
  contract), test (P1/P2/P3 + UI-alignment regression guards), this dev_log.
  Verified callsites via grep (28 files); surfaced extra callsites the brief
  missed (auto-update :147, notifications :139/:180, App.tsx:122,
  LandingPage:28). Read + verified ALL MOVE-set files this session: AppProviders
  (294-363), notifications/statusbar/auto-update runtimes, global-hotkey runtime,
  core runtime-profile + barrel, tauri.conf.json, plugin-web-storage bridge.
  Confirmed (a) plugin-web-storage needs NO internal change (`enabled` is
  caller-supplied), (b) desktop-global-hotkey-quick-open is already adapter-only
  (resolves O2), so the only apps/web MOVE site is AppProviders.
- **Commits**: — (planning only; no code)
- **Tests**: — (none run; plan phase)
- **Risks**: R1/R2 + open O1/O3 (R3/R4/O2 resolved this session).
- **Handoff**: Start feature-review for desktop-host-capability-profile-split.

### Round 2 — 2026-05-30 02:10 PDT — feature-review (gpt-5.4)
- **Goal**: Review the discovery/design/api/test/dev_log plan against the live
  codebase and resolve the open review questions.
- **Done**: Re-read the required planning artifacts and audited the live
  `isDesktopPhase1OfflineRuntime(...)` / `desktop-phase1-offline` references in
  `apps/web`, `@repo/core`, `desktop-*`, `plugin-web-settings-rest`,
  `plugin-web-board-*`, `xai-web-tasks`, `xai-web-habits`, and
  `desktop-last-data-cache-polish`. Confirmed the host/capability MOVE set is
  accurate, `plugin-web-storage` and `desktop-global-hotkey-quick-open` do not
  need direct changes, O1 should be env-first Option A with optional pure
  fallback, and O3 should remain KEEP on the UI profile. Noted one non-blocking
  inventory wording fix ("28" = occurrences, not files) and two non-gating
  residual string-reference groups (backup `sourceApp` metadata; runtime-profile
  override literals/tests) that should stay out of this feature.
- **Commits**: — (review only; no code)
- **Tests**: — (no commands run beyond source/doc audit)
- **Risks**: Manual macOS smoke remains required in Phase 3; backup artifact
  metadata rename is intentionally deferred because it would widen scope into
  schema compatibility.
- **Handoff**: Start feature-build for desktop-host-capability-profile-split.

### Round 3 — 2026-05-30 02:24 PDT — feature-auto-build (gpt-5.3-codex) — Phase 1
- **Goal**: Implement Phase 1 core host signal foundation in `@repo/core`.
- **Done**: Added `XAI_DESKTOP_HOST_TAURI`, `XAI_DESKTOP_HOST_NONE`,
  `DesktopHost`, `resolveDesktopHost(env, globals)`, and `isDesktopHost` to
  `packages/core/src/utils/runtime-profile.ts` with env-first resolution and
  env-absent pure `__TAURI_INTERNALS__` fallback. Extended
  `packages/core/tests/runtime-profile.test.ts` with host resolver/predicate
  coverage while keeping existing runtime-profile assertions.
- **Commits**: `13f8787a` (`feat(core): Phase 1 — add desktop host resolver`)
- **Tests**: `pnpm --filter @repo/core test` (pass; 3 files / 17 tests)
- **Risks**: Low; runtime-profile UI gates unchanged.
- **Handoff**: Continue Phase 2 in feature-auto-build.

### Round 4 — 2026-05-30 02:27 PDT — feature-auto-build (gpt-5.3-codex) — Phase 2
- **Goal**: Switch MOVE-set capability gates and host wiring from UI profile to
  desktop host signal.
- **Done**: Updated `AppProviders` to derive desktop capability wiring from
  `isDesktopHost(resolveDesktopHost(import.meta.env))`; migrated
  notifications/statusbar/updater runtimes to `isDesktopHost` gating while
  retaining adapter guards; updated related tests to use
  `VITE_XAI_DESKTOP_HOST`.
- **Commits**: `3c38ec55` (`feat(desktop): Phase 2 — split host capability gates`)
- **Tests**:
  - `pnpm --filter @repo/core test` (pass)
  - `pnpm --filter @repo/desktop-native-notifications-reminders test` (pass)
  - `pnpm --filter @repo/desktop-statusbar-quick-actions test` (pass)
  - `pnpm --filter @repo/desktop-auto-update-release-channel test` (pass)
  - `pnpm --filter @repo/web test -- src/providers/AppProviders.test.tsx` (pass)
- **Risks**: Medium-change area across multiple packages; mitigated by package-level
  Vitest coverage and targeted host-wiring test.
- **Handoff**: Continue Phase 3 in feature-auto-build.

### Round 5 — 2026-05-30 02:28 PDT — feature-auto-build (gpt-5.3-codex) — Phase 3
- **Goal**: Inject canonical desktop host env in tauri wrapper commands and run
  implementation-side smoke evidence.
- **Done**: Added `VITE_XAI_DESKTOP_HOST=tauri` to desktop
  `tauri.conf.json` `beforeDevCommand`/`beforeBuildCommand` without
  reintroducing `desktop-phase1-offline`. Verified web build path under host env
  and AppProviders host-wiring test coverage.
- **Commits**: `8ddc869a` (`chore(desktop): Phase 3 — inject desktop host env`)
- **Tests**:
  - `VITE_XAI_DESKTOP_HOST=tauri VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web build` (pass)
  - `pnpm --filter @repo/web test -- src/providers/AppProviders.test.tsx` (pass)
- **Risks**: Real macOS interactive smoke (`R-UI-1..3`, `R-CAP-1..4`, `R-WEB-1`)
  is still required in `feature-verify`/manual gate; not fully automatable here.
- **Handoff**: Start feature-verify for desktop-host-capability-profile-split.

### Round 6 — 2026-05-30 02:31 PDT — feature-verify (gpt-5-codex)
- **Goal**: Verify phase commit boundaries, contract adherence, docs alignment,
  and repo-side automated checks for desktop host/capability signal split.
- **Done**: Reviewed commits `13f8787a`, `3c38ec55`, `8ddc869a`, and `aa2bde85`
  against the approved discovery/design/api/test/dev_log contract. Confirmed the
  canonical host signal remains `VITE_XAI_DESKTOP_HOST=tauri`, the optional
  `__TAURI_INTERNALS__` fallback exists only inside the pure core resolver and
  only when env is absent, `desktop-last-data-cache-polish` and other KEEP
  callsites remain on `runtimeProfile`, the MOVE set is limited to `AppProviders`
  plus notifications/statusbar/updater runtimes, `plugin-web-storage` stays a
  caller-supplied enable seam, and no direct `desktop-phase1-offline` widening
  was introduced. Revalidated organizer-hidden / boards default-board /
  mock-auth `/app` protections by boundary audit: Phase 2 touched none of the
  KEEP UI gate files.
- **Commits**: `13f8787a`, `3c38ec55`, `8ddc869a`, `aa2bde85`
- **Tests**:
  - `git diff --check 13f8787a^..aa2bde85`
  - `pnpm --filter @repo/core test`
  - `pnpm --filter @repo/desktop-native-notifications-reminders test`
  - `pnpm --filter @repo/desktop-statusbar-quick-actions test`
  - `pnpm --filter @repo/desktop-auto-update-release-channel test`
  - `pnpm --filter @repo/web test -- src/providers/AppProviders.test.tsx`
  - `pnpm --filter @repo/web build`
  - `VITE_XAI_DESKTOP_HOST=tauri VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web build`
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- **Risks**: Manual real-macOS smoke remains external residual evidence:
  `R-UI-1..3`, `R-CAP-1..4`, and `R-WEB-1` were not executed interactively in
  this non-UI session.
- **Handoff**: Start ship for desktop-host-capability-profile-split.

### Round 7 — 2026-05-30 10:00 PDT — ship (claude-sonnet-4-6)
- **Goal**: Verify READY_TO_SHIP gate, commit verify writeback, push 5 commits to origin/dev, and mark SHIPPED.
- **Done**: Confirmed feature-verify evidence in Round 6 (all automated checks listed). Validated hard
  constraints: Organizer KEEP callsite intact (`App.tsx:122`), `AppProviders` fully migrated to
  `isDesktopHost`, `tauri.conf.json` injects `VITE_XAI_DESKTOP_HOST=tauri` without `desktop-phase1-offline`.
  Committed verify writeback + SHIPPED state write; pushed 5 commits to origin/dev.
- **Commits**: `13f8787a` (Phase 1), `3c38ec55` (Phase 2), `8ddc869a` (Phase 3), `aa2bde85` (docs), ship-writeback commit
- **Tests**: All feature-verify checks reconfirmed; dist gitignored (no binary artifacts in push).
- **Risks**: Manual macOS smoke (`R-UI-1..3`, `R-CAP-1..4`, `R-WEB-1`) remains external residual evidence per feature-verify.
- **Handoff**: Workflow complete.
