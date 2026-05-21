# plugin-console — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | plugin-console |
| Title | Console TickTick parity host shell |
| Status | READY_TO_SHIP |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | ship |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | feature-verify (Codex, gpt-5.4) |
| Updated | 2026-05-21 12:33 PDT |
| Blockers | None |

## Legacy Context

The prior `plugin-console` docs described a two-pane scaffold and incorrectly treated that package as `READY_FOR_VERIFY`. That state is superseded by this V2 parity plan; the current feature target is the full three-pane Console shell aligned to the Console PRD and the 2026-05-21 audit/brief set.

## Phase Plan

### Phase 1 — Freeze Console contracts and registration boundary

Status: DONE.

- Add `ConsoleView` types, registry slot accessors, manifest typing, and typed `console:*` events under `@repo/core`.
- Align `plugin-console/manifest.json` with `windows.console` and console sidebar metadata expectations.
- Register `plugin-console` in `docs/PLUGIN_MAP.md` without attempting broad PLUGIN_MAP cleanup.

Gate:
- Reviewer can point to one frozen cross-plugin Console contract surface and one canonical manifest/registry rule set.

### Phase 2 — Build desktop console shell and native window lifecycle

Status: DONE.

- Rebuild `plugin-console` into the Sidebar/List/Detail shell with persisted pane widths, nav state, theme/density/font scale state, search/notification/settings containers, and placeholder/error matrices.
- Add desktop route registration plus Tauri console window commands for open/close/focus/get/set frame.
- Use Contract Mock providers for business modules and account sync state.
- Require `pnpm --filter desktop build` as the explicit host-routing automated gate for this phase.

Gate:
- Console window opens independently from overlay and restores shell state without real business integrations yet.

### Phase 3 — Integrate `plugin-productivity` ConsoleViews

Status: DONE.

- Precondition: satisfied on 2026-05-21 by the canonical `plugin-productivity` row in `docs/PLUGIN_MAP.md` with explicit state/dependency note.
- Because `plugin-productivity` remains `In-Dev`, keep mock-first discipline outside the scoped Phase 3 integration boundary.
- Export/register ConsoleViews for tasks, pomodoro, habits, and matrix once the authority gate is cleared.
- Wire keyboard-first flows, search participation, and shell capability usage without breaking plugin boundaries.

Gate:
- All `plugin-productivity` Phase 2 modules are usable inside the Console shell with real plugin exports, and the dependency state is traceable to `docs/PLUGIN_MAP.md`.

### Phase 4 — Integrate `plugin-labels` and shell extension slots

Status: DONE.

- Precondition: satisfied on 2026-05-21 by the canonical `plugin-labels` row in `docs/PLUGIN_MAP.md` with explicit state/dependency note.
- Because `plugin-labels` remains `In-Dev`, keep mock-first discipline outside the scoped Phase 4 integration boundary.
- Export/register Labels ConsoleView plus required search/settings/sidebar contributions once the authority gate is cleared.
- Replace remaining label mocks and close the last user-facing module gap in the planned scope.

Gate:
- Labels are fully usable inside Console and reachable through keyboard navigation and Cmd+K, and the dependency state is traceable to `docs/PLUGIN_MAP.md`.

### Phase 5 — Reconcile overlay consistency and readiness gates

Status: DONE.

- Finish revision/ack/reconcile wiring between Console and overlay listeners.
- Harden timeout/error/degrade behavior and capture deferred real-macOS verification gates.

Gate:
- Automated checks can validate contract behavior, and deferred manual gates are explicit for later verify/ship.

## Risks

- `@repo/core` contract changes can create breaking churn if `ConsoleViewProps` or registry slot shapes are not frozen early.
- `@repo/ui` is still In-Dev; any shared split-pane primitives must stay minimal to avoid scope inflation.
- `plugin-productivity` and `plugin-labels` are now canonical `In-Dev` dependencies in `docs/PLUGIN_MAP.md`; non-stable coupling risk remains high if Phase 3/4 expand beyond frozen contract boundaries.
- Tauri menu bar / multi-Space / Stage Manager behavior still needs real hardware verification and may force host-level adjustments late.
- The current repo already contains PLUGIN_MAP drift and pre-V2 console docs; reviewers need to judge only the scoped parity fixes in this feature.

## Review Notes

- Blocker: the planning set treats `plugin-productivity` and `plugin-labels` as `READY_FOR_VERIFY` dependencies in the brief/discovery/design docs, but `docs/PLUGIN_MAP.md` does not list either plugin at all. Because PLUGIN_MAP is the repo's dependency authority, the plan currently lacks a canonical status source for Phase 3/4 integration and for when Contract Mock retirement is allowed.
- Required revision: update the planning artifacts so dependency status language is anchored to `docs/PLUGIN_MAP.md`. Either add the minimum PLUGIN_MAP rows needed for `plugin-productivity` / `plugin-labels` with non-stable states plus mock-first guidance, or explicitly make Phase 3/4 contingent on a separate PLUGIN_MAP reconciliation by the owning tracks before real integration begins.
- Recommendation: extend `packages/plugin-console/docs/test.md` with a desktop host typecheck/build check covering the planned `apps/desktop/src/` route changes, so Phase 2 host wiring has an explicit automated gate in addition to package checks and `cargo test`.

## Review Notes — Round 2 (feature-review, APPROVED)

- Verdict: APPROVED. The Revise pass resolved the Round 1 blocker correctly and the planning set is executable with no blocking ambiguity.
- Verified against repo ground truth:
  - `docs/PLUGIN_MAP.md` genuinely lists neither `plugin-productivity`, `plugin-labels`, nor `plugin-console`/`console` — the discovery report's authority-gap claim is accurate, not assumed.
  - `packages/plugin-productivity/` and `packages/plugin-labels/` exist on disk as real packages (`@repo/plugin-productivity`, `@repo/plugin-labels`), matching the docs' "directories exist but unregistered" framing.
  - `packages/plugin-console/manifest.json` confirms `windows.control=true` and `enabled=false`, matching discovery §1 evidence verbatim.
  - `pnpm --filter desktop build` uses a valid filter — the desktop app package is named `desktop`.
- Dependency claims are consistent across all six docs: brief, discovery, design, api, test, and dev_log all treat `plugin-productivity`/`plugin-labels` as authority-missing dependencies; Phase 3/4 are `BLOCKED_BY_AUTHORITY` with explicit `PLUGIN_MAP.md` preconditions owned by the respective tracks.
- api.md is internally consistent with design.md (ConsoleView contract family, ConsoleViewProps, typed `console:*` events, manifest typings all aligned), and test.md covers the API contract (registry/manifest/Tauri-command/event/host-routing contract sections).
- Phase 2 host-routing gate `pnpm --filter desktop build` is concretely specified in both test.md automated checks and the dev_log Phase 2 block.
- Recommendation (non-blocking): a separate `pnpm --filter desktop check-types` was suggested in Round 1; the plan added the build gate instead. The build gate subsumes route-wiring typecheck, so this is acceptable. Optionally add the desktop typecheck during Phase 2 build for faster feedback.
- Findings summary: 0 blockers, 1 recommendation.

## Revision Response

- Resolved by revising the brief/discovery/design/api/test/dev_log set so `plugin-productivity` and `plugin-labels` are now treated as authority-missing dependencies, not as implicitly ready integration targets.
- Phase 3 and Phase 4 now carry explicit `docs/PLUGIN_MAP.md` preconditions owned by those tracks; Phase 2 remains executable with Contract Mock.
- Added `pnpm --filter desktop build` to the automated checks and called it out as the Phase 2 host-routing gate.

## Verify Notes — Round 1 (feature-verify, BLOCKED)

- Verdict: BLOCKED.
- Commit/message hygiene:
  - Reviewed `1c1af64`, `bcacbda`, `5b43712`, `52cc140`, `6f2c67a`, `831791f`, `dce3230`, and the authority-unblock commit `be9189d`.
  - Each commit keeps a single dominant intent and the commit bodies follow `docs/conventions/COMMIT_CONVENTION.md`.
  - `dce3230` correctly supersedes the earlier docs-only `52cc140`; both remain part of the feature trace, but `be9189d` is also required context because it is the actual PLUGIN_MAP authority change consumed by Phase 3/4.
- Verification checks run:
  - PASS: `pnpm --filter @repo/core check-types`
  - PASS: `pnpm --filter @repo/core test` (8/8)
  - PASS: `pnpm --filter @repo/plugin-console check-types`
  - PASS: `pnpm --filter @repo/plugin-productivity check-types`
  - PASS: `pnpm --filter @repo/plugin-labels check-types`
  - PASS: `pnpm --filter desktop build`
  - PASS: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` (47/47)
  - FAIL: `pnpm --filter @repo/plugin-console test` → `vitest: command not found`
  - FAIL: `pnpm --filter @repo/plugin-productivity test` → `vitest: command not found`
  - FAIL: `pnpm --filter @repo/plugin-labels test` → `vitest: command not found`
- Blocker 1 — required package tests are not runnable:
  - `packages/plugin-console`, `packages/plugin-productivity`, and `packages/plugin-labels` all declare `vitest` in `devDependencies`, but their local `node_modules/.bin/` directories expose only `tsc`/`tsserver` while `packages/core/node_modules/.bin/` includes `vitest`.
  - Because `packages/plugin-console/docs/test.md` explicitly requires `pnpm --filter @repo/plugin-console test`, verify cannot promote the feature to `READY_TO_SHIP` while the package-level test gate is non-executable.
- Blocker 2 — the shipped runtime still misses the approved manifest-driven sidebar contract:
  - The approved planning/PRD/audit set requires sidebar entries to be declared by `manifest.ui.consoleSidebar` and surfaced through `pluginRegistry.getConsoleSidebarEntries()`.
  - Current runtime instead renders module entries from `ConsoleViewRegistration.sidebar`, while `packages/plugin-console/manifest.json`, `packages/plugin-productivity/manifest.json`, and `packages/plugin-labels/manifest.json` omit `ui.consoleSidebar` entirely and `ConsoleLayout` hardcodes the Calendar/Widgets placeholders.
  - This is contract drift, not just documentation wording: the repo now types `ui.consoleSidebar`, but the Console host still does not consume it as the canonical registration surface promised by the approved docs.
- Non-blocking note:
  - The Phase 5 reconcile path remains a shell-local mock-safe ack chain; real macOS multi-window verification is still deferred exactly as documented.

## Fix Notes — Round 1 (feature-auto-build, unblock verify)

- Blocker 1 resolved — package-level Vitest gates are executable and passing:
  - Added package-level `vitest.config.ts` for `plugin-console`, `plugin-productivity`, and `plugin-labels` with workspace alias mapping for `@repo/core*` and `@repo/core-data/testing`.
  - Updated each package `test`/`test:watch` script to execute the workspace-resolved binary at `node ../core/node_modules/vitest/vitest.mjs`.
  - PASS: `pnpm --filter @repo/plugin-console test` (5/5)
  - PASS: `pnpm --filter @repo/plugin-productivity test` (7/7)
  - PASS: `pnpm --filter @repo/plugin-labels test` (7/7)
- Blocker 2 resolved — sidebar registration now follows manifest-driven contract:
  - Added `ui.consoleSidebar.entries` to `packages/plugin-console/manifest.json`, `packages/plugin-productivity/manifest.json`, and `packages/plugin-labels/manifest.json`.
  - Switched plugin registration to import `manifest.json` as runtime source of truth, removing duplicated sidebar metadata drift in `register-plugin.ts`.
  - Refactored `@repo/core` registry to build `getConsoleViewRegistrations()` from manifest sidebar entries + `ConsoleViews` render mapping (instead of `ConsoleViewRegistration.sidebar` as the upstream source).
  - Removed `ConsoleLayout` hardcoded module entries and now consume only registry-provided items; placeholder rendering is driven by `sidebar.placeholder`.
- Regression gates in this fix run:
  - PASS: `pnpm --filter @repo/plugin-console check-types`
  - PASS: `pnpm --filter @repo/plugin-productivity check-types`
  - PASS: `pnpm --filter @repo/plugin-labels check-types`
  - PASS: `pnpm --filter @repo/core check-types`
  - PASS: `pnpm --filter @repo/core test` (8/8)
  - PASS: `pnpm --filter desktop build`

## Verification Notes — Round 2 (feature-verify, PASS)

- Reviewed `1c1af64`, `bcacbda`, `5b43712`, `be9189d`, `52cc140`, `6f2c67a`, `831791f`, `dce3230`, and `de0021e`.
- Commit scope and message format are acceptable across the feature series:
  - Each commit stays within a single dominant phase or workflow-state update.
  - Commit subjects and bodies follow `docs/conventions/COMMIT_CONVENTION.md`.
- Verification checks run from the current tree:
  - PASS: `pnpm --filter @repo/core check-types`
  - PASS: `pnpm --filter @repo/core test` (8/8)
  - PASS: `pnpm --filter @repo/plugin-console check-types`
  - PASS: `pnpm --filter @repo/plugin-console test` (5/5)
  - PASS: `pnpm --filter @repo/plugin-productivity check-types`
  - PASS: `pnpm --filter @repo/plugin-productivity test` (7/7)
  - PASS: `pnpm --filter @repo/plugin-labels check-types`
  - PASS: `pnpm --filter @repo/plugin-labels test` (7/7)
  - PASS: `pnpm --filter desktop build`
  - PASS: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` (47/47)
- Contract alignment confirmed for the blocker-fix round:
  - Sidebar registration authority now comes from `manifest.ui.consoleSidebar.entries`.
  - Console/productivity/labels register files import manifest metadata as the runtime source of truth.
  - `PluginRegistry.getConsoleViewRegistrations()` synthesizes runtime registrations from manifest sidebar entries plus `ConsoleViews` renderers.
  - `ConsoleLayout` no longer hardcodes module entries and consumes registry-provided placeholder metadata.
- Residual risks:
  - Real macOS `pnpm --filter desktop tauri dev` verification for menu bar, multi-Space, Stage Manager, and live window lifecycle remains deferred.
  - Missing-view enforcement still depends on the current registration/test discipline; the registry does not yet expose a dedicated failing validator for future manifest/render mismatches.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-21 03:22 PDT | feature-plan (Codex inline) | Continue plan: canonicalized the feature target to `plugin-console`, created the canonical brief/discovery pair, replaced the old scaffold docs with a contract-first parity plan, resolved the Contract Mock sequencing, and split the oversized scope into five independently reviewable build phases. | — | feature-review |
| 2026-05-21 03:30 PDT | feature-review (Codex inline) | Review pass: returned REVISE because Phase 3/4 dependency readiness for `plugin-productivity` and `plugin-labels` is not grounded in `docs/PLUGIN_MAP.md`, and added one test-plan recommendation for host route verification. | — | feature-plan |
| 2026-05-21 03:33 PDT | feature-plan (Codex inline) | Revise plan: reconciled all planning docs to `docs/PLUGIN_MAP.md`, converted `plugin-productivity` and `plugin-labels` into explicit authority-gated Phase 3/4 dependencies, and added `pnpm --filter desktop build` as the Phase 2 host-routing gate. | — | feature-review |
| 2026-05-21 04:05 PDT | feature-review (Claude Code, claude-opus-4-7) | Cross-executor review pass (Codex plan -> Claude review): verified the authority-gap dependency claims against repo ground truth (PLUGIN_MAP.md, package dirs, manifest.json, desktop filter), confirmed api.md/design.md consistency and test.md contract coverage, and confirmed Phase 2/3/4 gates are concrete. Verdict APPROVED, 0 blockers / 1 recommendation. Flipped Status Panel to APPROVED. | — | feature-build |
| 2026-05-21 11:24 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 1 — Freeze Console contracts and registration boundary: added `@repo/core` Console contracts (`ConsoleView*` types, `windows.console`, `ui.consoleSidebar`, typed `console:*` events), added PluginRegistry Console slot accessors, aligned `plugin-console/manifest.json` with console window/sidebar metadata, and added `plugin-console` row to `docs/PLUGIN_MAP.md` without touching productivity/labels authority rows. | `1c1af64` feat(plugin-console): Phase 1 — freeze console contracts | feature-auto-build |
| 2026-05-21 11:44 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 2 — Build desktop console shell and native window lifecycle: rebuilt `ConsoleLayout` into Sidebar/List/Detail shell with persisted shell state (pane widths/nav/theme/density/font), added contract-mock ConsoleViews + plugin registration (`registerConsolePlugin`), registered desktop `#/console` route and `ConsoleWindow`, wired control action to open console window, and added Tauri console window commands (`open/close/focus/get/set_console_window_frame`) with persisted frame state and allowlist checks. | `bcacbda` feat(plugin-console): Phase 2 — console shell and window lifecycle | feature-auto-build |
| 2026-05-21 11:47 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 5 — Reconcile overlay consistency and readiness gates (mock-safe subset): added reconcile→ack mock event chain (`console:reconcile-requested` + `console:ack-applied`) inside the console shell capabilities, implemented 200ms timeout partial-result degradation for slot search providers, surfaced degrade/ack state in shell header, and kept real-macOS multi-window gates deferred for verify. | `5b43712` feat(plugin-console): Phase 5 — reconcile and degrade gates | feature-auto-build |
| 2026-05-21 11:57 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Blocker fix for Phase 3/4 authority gate: added canonical `plugin-productivity` and `plugin-labels` rows to `docs/PLUGIN_MAP.md` with explicit state/dependency notes, then moved Phase 3/4 from `BLOCKED_BY_AUTHORITY` to `PENDING` and cleared Status Panel blockers for follow-up implementation runs. | `be9189d` docs(plugin-console): add Phase 3/4 dependency authority rows | feature-auto-build |
| 2026-05-21 12:06 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 3 — Integrate `plugin-productivity` ConsoleViews: added real productivity ConsoleView exports (tasks/pomodoro/habits/matrix), added `registerProductivityPlugin()` static startup wiring, removed productivity mock slots from console registration, and kept labels mocked for Phase 4 boundary. Tests: `pnpm --filter @repo/plugin-productivity check-types`; `pnpm --filter @repo/plugin-console check-types`; `pnpm --filter desktop build`. | `6f2c67a` feat(plugin-console): Phase 3 — integrate productivity ConsoleViews | feature-auto-build |
| 2026-05-21 12:11 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 4 — Integrate `plugin-labels` and shell extension slots: added real labels ConsoleView export + registration, wired startup `registerLabelsPlugin()`, removed remaining labels mock slots from console registration, and deleted obsolete `plugin-console/src/mockViews.tsx`. Tests: `pnpm --filter @repo/plugin-labels check-types`; `pnpm --filter @repo/plugin-productivity check-types`; `pnpm --filter @repo/plugin-console check-types`; `pnpm --filter desktop build`. Note: `pnpm --filter @repo/plugin-productivity test` and `pnpm --filter @repo/plugin-labels test` both fail locally with `vitest: command not found`. | `831791f` feat(plugin-console): Phase 4 — integrate labels ConsoleView slots | feature-verify |
| 2026-05-21 12:18 PDT | feature-verify (Codex, gpt-5.4) | Verification BLOCKED after reviewing commits `1c1af64`, `bcacbda`, `5b43712`, `52cc140`, `6f2c67a`, `831791f`, `dce3230`, and `be9189d`. Automated checks passed for core type/test, plugin check-types, desktop build, and Rust tests, but the required package-level Vitest gates for `plugin-console`, `plugin-productivity`, and `plugin-labels` are non-runnable (`vitest: command not found`). Contract review also found that the approved manifest-driven `ui.consoleSidebar` sidebar registration model is still not implemented; runtime navigation remains driven by `ConsoleViewRegistration.sidebar` plus hardcoded placeholder entries. | `1c1af64`, `bcacbda`, `5b43712`, `52cc140`, `6f2c67a`, `831791f`, `dce3230`, `be9189d` | feature-build |
| 2026-05-21 12:27 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Fix round for verify blockers: made package-level Vitest gates executable via package `vitest.config.ts` + workspace vitest binary path, migrated sidebar registration authority to manifest `ui.consoleSidebar.entries`, removed ConsoleLayout hardcoded sidebar entries, and switched registry assembly to manifest-driven entries with placeholder-aware fallback rendering. Tests: `pnpm --filter @repo/plugin-console test`; `pnpm --filter @repo/plugin-productivity test`; `pnpm --filter @repo/plugin-labels test`; `pnpm --filter @repo/plugin-console check-types`; `pnpm --filter @repo/plugin-productivity check-types`; `pnpm --filter @repo/plugin-labels check-types`; `pnpm --filter @repo/core check-types`; `pnpm --filter @repo/core test`; `pnpm --filter desktop build`. | `de0021e` fix(plugin-console): unblock verify blockers | feature-verify |
| 2026-05-21 12:33 PDT | feature-verify (Codex, gpt-5.4) | Verification PASS after reviewing the full feature commit set through `de0021e`, re-running core/plugin/desktop/Rust checks, and confirming the manifest-driven sidebar contract is active in the current tree. Promoted status to `READY_TO_SHIP`; remaining risks are limited to deferred real-macOS windowing validation and future hardening of manifest/render mismatch enforcement. | `1c1af64`, `bcacbda`, `5b43712`, `be9189d`, `52cc140`, `6f2c67a`, `831791f`, `dce3230`, `de0021e` | ship |
