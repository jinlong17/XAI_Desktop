# XAI v1 Deferred Gates — 2026-05-19

> **PAUSED (2026-05-24, per Web P0 Priority Override).** Web Console (`docs/workflow/roadmap/xai-web-console.md`) is the active roadmap. Do NOT start new work on this roadmap. SHIPPED rows remain authoritative for their domain; in-flight items: complete-or-park. Resumes only after P0 Web gap-closure ships and ADR-0009 (Web → Desktop Pivot Plan) is Accepted. Full rationale: `docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-brief.md`.

## Entry 1

- Feature: xai-g0-window-spike manifest
- Gate: G0
- Deferred gate: Manifest review
- Why deferred: The run is operating in 24h unattended mode and no human review is available.
- Risk: The manifest decomposition may need human adjustment before later G0 production-risk tasks, especially tasks involving native window behavior, MAS sandbox strategy, and product fallback decisions.
- What was done instead: Initialized a conservative serial manifest directly from `docs/planning/execution/G0-window-spike.md`, with each execution-pack task mapped to one feature. Only the low-risk G0.1 evidence-anchor task is eligible before human review.
- Later human action: Review `docs/workflow/roadmap/xai-g0-window-spike.md` against roadmap-prompts §6 checklist before authorizing G0.2+.
- Suggested verification command / environment: `sed -n '1,220p' docs/workflow/roadmap/xai-g0-window-spike.md`
- Files/commits affected: docs/workflow/roadmap/xai-g0-window-spike.md; commits `3b571f6`, `c3b29b0`, `6b121ea`, `4ea65ec`, `82ab268`, `33627df`

## Entry 2

- Feature: window-ground-truth
- Gate: G0
- Deferred gate: Cross-vendor feature-review
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no separate reviewer is available in unattended mode.
- Risk: The same executor planned and reviewed the low-risk G0.1 docs/evidence setup, so review independence is weaker than normal Workflow V2.
- What was done instead: Performed an inline review against discovery/design/api/test/dev_log gates and limited scope to branch/evidence documentation only.
- Later human action: Review `docs/reviews/window-ground-truth/20260519-discovery-review.md` and `packages/window-ground-truth/docs/dev_log.md` before treating G0.1 as externally reviewed.
- Suggested verification command / environment: `sed -n '1,140p' packages/window-ground-truth/docs/dev_log.md`
- Files/commits affected: packages/window-ground-truth/docs/dev_log.md; docs/workflow/roadmap/xai-v1.deferred-gates.md; commits `3b571f6`, `c3b29b0`

## Entry 3

- Feature: window-ground-truth
- Gate: G0
- Deferred gate: Cross-vendor feature-verify
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no independent verifier is available in unattended mode.
- Risk: The same executor performed final verification, so Workflow V2 independence is weaker than normal.
- What was done instead: Re-ran the exact G0.1 acceptance checks and reviewed commit `3b571f6` for docs-only scope and commit convention compliance.
- Later human action: Independently review commit `3b571f6` and the evidence README before shipping or using G0.1 as a reviewed base for higher-risk G0 tasks.
- Suggested verification command / environment: `git show --stat --oneline 3b571f6 && git branch --show-current && sw_vers`
- Files/commits affected: commit `3b571f6`; packages/window-ground-truth/docs/dev_log.md; docs/workflow/roadmap/xai-g0-window-spike.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md

## Entry 4

- Feature: grid-window-prototype
- Gate: G0
- Deferred gate: Human ship of prerequisite `window-ground-truth`
- Why deferred: The run is explicitly forbidden from running ship or pushing, but the 24h unattended goal requires continuing to the next eligible local G0 task when safe.
- Risk: G0.2 proceeds from local `READY_TO_SHIP` evidence instead of a human-shipped prerequisite.
- What was done instead: Limited G0.2 to the next explicit execution-pack task and changed only local dependency semantics for this row to `ready_to_ship`.
- Later human action: Review and ship `window-ground-truth` before relying on G0.2 evidence outside this local spike branch.
- Suggested verification command / environment: `git show --stat --oneline 3b571f6 c3b29b0 && sed -n '1,80p' docs/workflow/roadmap/xai-g0-window-spike.md`
- Files/commits affected: docs/workflow/roadmap/xai-g0-window-spike.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md; packages/grid-window-prototype/docs/dev_log.md; commits `6b121ea`, `4ea65ec`

## Entry 5

- Feature: grid-window-prototype
- Gate: G0
- Deferred gate: Cross-vendor feature-review
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no independent reviewer is available in unattended mode.
- Risk: The same executor planned and reviewed a frontend/native-window spike.
- What was done instead: Performed an inline review focused on boundary control: no new Tauri command, no EventMap change, no Organizer persistence changes, and a visibly G0-only fallback.
- Later human action: Review `docs/reviews/grid-window-prototype/20260519-discovery-review.md` and `packages/grid-window-prototype/docs/dev_log.md` before treating G0.2 as externally reviewed.
- Suggested verification command / environment: `sed -n '1,140p' packages/grid-window-prototype/docs/dev_log.md`
- Files/commits affected: packages/grid-window-prototype/docs/dev_log.md; docs/workflow/roadmap/xai-v1.deferred-gates.md; commit `6b121ea`

## Entry 6

- Feature: grid-window-prototype
- Gate: G0
- Deferred gate: Real Tauri alpha/beta window runtime evidence
- Why deferred: Initially deferred because the unattended run could not open the desktop app, click Grid windows, or inspect per-window DevTools logs as a human.
- Risk: Automated build checks alone did not prove native windows were visible, independently closable, or that targeted events were isolated at runtime.
- What was done instead: Implemented the fallback panel and targeted `emitTo(windowLabel, ...)` path; patched runtime defects through `14e04c2`, `01e5167`, `b8c34fe`, `7b7ff35`, `f65a1b5`, and `a33c74d`; reran typecheck/build/Rust check.
- Later human action: Optional independent replay of the G0.2 manual evidence path: run the app, drag the AI cube across the desktop, click `+ New Grid`, confirm native Grid windows appear, verify Grid drag and control focus behavior, then attach logs/screenshots under `docs/reviews/window-ground-truth/grid-window-prototype/`.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev`, then use the DevTools snippets in `docs/reviews/window-ground-truth/grid-window-prototype/README.md`.
- Files/commits affected: `6b121ea`, `14e04c2`, `01e5167`, `b8c34fe`, `7b7ff35`, `f65a1b5`, `a33c74d`; apps/desktop/src/windows/GridWindow.tsx; apps/desktop/src/windows/ControlWindow.tsx; apps/desktop/src/components/AiAssistant/AiCube.tsx; packages/plugin-organizer/src/OrganizerLayer.tsx; packages/plugin-organizer/src/useGridSystem.tsx; apps/desktop/src-tauri/src/platform/macos/window_ext.rs; docs/reviews/window-ground-truth/grid-window-prototype/README.md

## Entry 7

- Feature: grid-window-prototype
- Gate: G0
- Deferred gate: Cross-vendor feature-verify
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no independent verifier is available in unattended mode.
- Risk: The same executor implemented and verified a frontend/native-window spike.
- What was done instead: Re-ran automated checks, inspected commit boundaries, and recorded the post-report routing fix.
- Later human action: Independently review commits `6b121ea`, `14e04c2`, `01e5167`, `b8c34fe`, `7b7ff35`, `f65a1b5`, and `a33c74d`, then rerun the manual Tauri evidence path if stricter review is needed before ship.
- Suggested verification command / environment: `git show --stat --oneline 6b121ea 14e04c2 01e5167 b8c34fe 7b7ff35 f65a1b5 a33c74d && pnpm --filter desktop exec tsc --noEmit && pnpm --filter @repo/plugin-organizer check-types && pnpm --filter desktop build && cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`
- Files/commits affected: `6b121ea`, `14e04c2`, `01e5167`, `b8c34fe`, `7b7ff35`, `f65a1b5`, `a33c74d`; packages/grid-window-prototype/docs/dev_log.md; docs/workflow/roadmap/xai-g0-window-spike.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md; docs/contracts/events-v0.md

## Entry 8

- Feature: click-through-matrix
- Gate: G0
- Deferred gate: Real macOS click-through matrix — RESOLVED 2026-05-19 22:25 PDT
- Why deferred: Initially deferred because unattended Codex could not perform real hit-test checks and private-API comparison.
- Risk: CLOSED for G0.3 evidence. MAS fallback risk remains tracked under G0.6 because the private-API-disabled path cannot compile the current transparent-window implementation.
- What was done instead: Recorded human evidence that transparent clicks work, Grid item pointer delivery flashes, and resize handles drag in the default runtime. Then temporarily disabled the private API path (`"macOSPrivateApi": false` plus the Rust `macos-private-api` Cargo feature) and confirmed `pnpm --filter desktop tauri dev` fails at compile time on `.transparent(true)` in Grid/control window builders.
- Later human action: Optional independent replay before ship; no remaining G0.3 blocker. For MAS, continue G0.6 fallback/sandbox validation.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev` with default config; for non-private path, temporarily set `"macOSPrivateApi": false` and disable the Rust `macos-private-api` Cargo feature, then confirm the documented compile failure unless a fallback has been implemented.
- Files/commits affected: docs/reviews/window-ground-truth/click-through-matrix/README.md; packages/click-through-matrix/docs/*; docs/adr/0005-window-foundation.md; commits `82ab268`, `7a1b9dd`, `e7fc4ab`, `fafe818`, `4537d2d`

## Entry 9

- Feature: finder-dnd-path
- Gate: G0
- Deferred gate: Real Finder DnD path-first matrix — RESOLVED 2026-05-19 22:09 PDT
- Why deferred: Initially deferred because unattended Codex could not perform real Finder drag/drop. It is now resolved by human screenshots covering file, folder, `.app`, post-dedupe `.app`, and alias path-form evidence.
- Risk: CLOSED for G0.4. Remaining MAS security-scoped bookmark risk is tracked separately under G0.6/G1.
- What was done instead: Recorded screenshot evidence of `tauri://drag-drop` file, folder, `.app`, and alias path delivery; fixed GridWindow duplicate risk in `58c926d`; fixed Organizer per-path duplicate risk in `18b48da`; recorded alias policy in ADR-0005 as `PRESERVE_ALIAS_PATH`.
- Later human action: Optional independent replay before ship; no remaining G0.4 blocker.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev` on macOS with Finder; use file, folder, `.app`, and alias drops; confirm GridWindow `Finder DnD` panel paths and console lines beginning with `[G0 Finder DnD] path-first drop`.
- Files/commits affected: docs/reviews/window-ground-truth/finder-dnd-path/README.md; packages/finder-dnd-path/docs/*; apps/desktop/src/windows/GridWindow.tsx; packages/plugin-organizer/src/OrganizerLayer.tsx; docs/adr/0005-window-foundation.md; commits `33627df`, `7a1b9dd`, `7e20ca8`, `58c926d`, `18b48da`, `d982dab`, `5e98083`

## Entry 10

- Feature: spaces-multimonitor-matrix
- Gate: G0
- Deferred gate: User override to skip blocked G0.3/G0.4 dependencies for safe prep — RESOLVED 2026-05-19 22:54 PDT
- Why deferred: The user explicitly instructed to skip and continue while G0.3/G0.4 were still blocked on real hardware evidence. G0.3 and G0.4 have since moved to READY_TO_SHIP.
- Risk: CLOSED for G0.5. Optional screenshot replay remains possible before ship.
- What was done instead: Limited G0.5 to documentation/matrix preparation and static evidence until the user later confirmed Grid follows across Spaces/multi-display on the DELL setup.
- Later human action: Optional independent screenshot replay before ship.
- Suggested verification command / environment: `sed -n '1,120p' docs/workflow/roadmap/xai-g0-window-spike.md`
- Files/commits affected: docs/workflow/roadmap/xai-g0-window-spike.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md; commits `2fb6bac`, `bcc5785`

## Entry 11

- Feature: spaces-multimonitor-matrix
- Gate: G0
- Deferred gate: Real Spaces/fullscreen/multi-display matrix — RESOLVED 2026-05-19 22:54 PDT
- Why deferred: The acceptance requires real Mission Control, multiple Spaces, fullscreen-app, and multi-display observations.
- Risk: CLOSED for current DMG/private path; optional independent replay remains a pre-ship confidence check.
- What was done instead: Created the evidence matrix template, recorded current display facts, recorded source-level collection behavior/window level findings, avoided changing window behavior without live proof, then recorded user manual confirmation that Grid follows across Spaces/multi-display.
- Later human action: Optional: run `pnpm --filter desktop tauri dev`, replay the matrix, and attach screenshots/logs under `docs/reviews/window-ground-truth/spaces-multimonitor-matrix/`.
- Suggested verification command / environment: Optional replay: `pnpm --filter desktop tauri dev` on macOS with LG + DELL displays, Mission Control, multiple Spaces, and fullscreen app.
- Files/commits affected: docs/reviews/window-ground-truth/spaces-multimonitor-matrix/README.md; packages/spaces-multimonitor-matrix/docs/*; commits `2fb6bac`, `bcc5785`

## Entry 12

- Feature: mas-sandbox-dry-run
- Gate: G0
- Deferred gate: User override to skip blocked G0.3/G0.4 dependencies for MAS safe prep
- Why deferred: The user explicitly instructed to skip and continue while G0.3/G0.4 were still blocked and MAS conclusions depended on those results. G0.3 and G0.4 have since moved to READY_TO_SHIP, but MAS fallback/sandbox evidence remains blocked.
- Risk: MAS prep now has compile evidence and a compile-only fallback, but cannot produce a complete MAS feasibility conclusion without signed/sandbox runtime evidence.
- What was done instead: Limited G0.6 to documentation/risk-prep, then added the `mas-sandbox` compile fallback guard and verified private-API-disabled `cargo check`.
- Later human action: Perform MAS/private-API runtime validation with the fallback enabled.
- Suggested verification command / environment: `sed -n '1,140p' docs/reviews/window-ground-truth/mas-sandbox-dry-run/mas-sandbox-notes.md`
- Files/commits affected: docs/workflow/roadmap/xai-g0-window-spike.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md; commits `071a192`, `4537d2d`, `2fda0c8`

## Entry 13

- Feature: mas-sandbox-dry-run
- Gate: G0
- Deferred gate: Real MAS sandbox and fallback validation — DEFERRED_EXTERNAL
- Why deferred: The acceptance requires signed/sandbox runtime evidence and Apple Developer/signing or equivalent sandbox environment, which is unavailable now. The compile-only `mas-sandbox` fallback builds without Rust-side transparent constructors, but runtime validation still needs that environment.
- Risk: G0 cannot decide a complete MAS path until the fallback is tested under sandbox/signing and the downgraded UX is accepted.
- What was done instead: Created MAS notes, entitlement draft, risk matrix, private-API-disabled compile evidence, and the `mas-sandbox` compile fallback. Restored `"macOSPrivateApi": true` and the Rust `macos-private-api` Cargo feature after temporary tests.
- Later human action: Run signed/sandbox validation with the `mas-sandbox` fallback once Apple Developer/signing or equivalent sandbox environment exists, then update `mas-sandbox-notes.md`.
- Suggested verification command / environment: Build/run desktop with private API disabled after fallback implementation and sandbox entitlements on macOS; Apple Developer signing may be required for final evidence.
- Files/commits affected: docs/reviews/window-ground-truth/mas-sandbox-dry-run/mas-sandbox-notes.md; packages/mas-sandbox-dry-run/docs/*; commits `071a192`, `4537d2d`, `2fda0c8`

## Entry 14

- Feature: window-command-contract
- Gate: G1
- Deferred gate: G0 Go/Conditional Go prerequisite
- Why deferred: The user explicitly instructed to skip and continue, but G1 production implementation requires G0 to pass or choose a fallback path.
- Risk: Implementing window command lifecycle before G0 decisions could encode the wrong click-through, DnD, Spaces, or MAS assumptions.
- What was done instead: Created docs/contract safe prep only and marked the feature BLOCKED.
- Later human action: Complete/review G0 evidence and decide Go/Conditional Go or fallback, then rerun feature-build for `window-command-contract`.
- Suggested verification command / environment: Review `docs/workflow/roadmap/xai-g0-window-spike.md` and all G0 evidence folders before G1 implementation.
- Files/commits affected: docs/workflow/roadmap/xai-g1-native-foundation.md; packages/window-command-contract/docs/*; commit `9c7b52f`

## Entry 15

- Feature: host-business-residuals
- Gate: G1
- Deferred gate: Cross-vendor feature-review/verify
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no independent reviewer/verifier is available in unattended mode.
- Risk: The same executor audited and verified the Host residual list.
- What was done instead: Used a direct `rg` scan over `apps/desktop/src` and created an explicit file-by-file residual inventory.
- Later human action: Review `docs/planning/execution/host-residuals.md` before starting G1.2/G1.6 cleanup implementation.
- Suggested verification command / environment: `rg -n "AiCube|SettingsPanel|useSyncMenuBarStatus|OrganizerLayer|create-grid-request|useGridSystem" apps/desktop/src -g '*.{ts,tsx}'`
- Files/commits affected: docs/planning/execution/host-residuals.md; packages/host-business-residuals/docs/*; commit `c6dbd77`

## Entry 16

- Feature: grid-shell-organizer-content
- Gate: G1
- Deferred gate: G0/G1.1 prerequisite for production shell/content split — RESOLVED 2026-05-19 23:09 PDT
- Why deferred: The user instructed to continue, but G1.2 production implementation depended on G0 Go/Conditional Go and the G1.1 Window Command Contract. G0 is now Conditional Go and G1.1 is READY_TO_SHIP.
- Risk: CLOSED for the prerequisite gate. G1.2 implementation still requires normal feature-build and feature-verify.
- What was done instead: Created docs-only feature brief, discovery review, design, API, test plan, and dev_log describing the target boundary and blockers.
- Later human action: None for this prerequisite gate; ship remains human-only after G1.2 reaches READY_TO_SHIP.
- Suggested verification command / environment: `sed -n '1,220p' docs/reviews/grid-shell-organizer-content/20260519-discovery-review.md`
- Files/commits affected: docs/reviews/grid-shell-organizer-content/*; packages/grid-shell-organizer-content/docs/*; commit `eaae46e`

## Entry 17

- Feature: multi-grid-event-scope
- Gate: G1
- Deferred gate: G1.2 prerequisite for production event migration — RESOLVED 2026-05-19 23:22 PDT
- Why deferred: The user instructed to continue earlier, but G1.4 should wait until the Grid shell/content split defines the final Host/Organizer public boundary.
- Risk: CLOSED for the prerequisite gate. G1.4 still needs its own feature-build and feature-verify.
- What was done instead: Created docs-only feature brief, discovery review, design, API, test plan, and dev_log describing current aliases, contract drift, and target migration.
- Later human action: None for this prerequisite gate; proceed to G1.4 production build.
- Suggested verification command / environment: `sed -n '1,220p' docs/reviews/multi-grid-event-scope/20260519-discovery-review.md`
- Files/commits affected: docs/reviews/multi-grid-event-scope/*; packages/multi-grid-event-scope/docs/*; commit `a7d4803`

## Entry 18

- Feature: native-dnd-path-first
- Gate: G1
- Deferred gate: MAS sandbox decision
- Why deferred: G1.3 production implementation now has G0.4 Finder payload evidence, but still depends on MAS security-scope behavior.
- Risk: Implementing path-first DnD before MAS evidence could choose the wrong persisted security-scope/bookmark model.
- What was done instead: Created docs-only feature brief, discovery review, design, API, test plan, and dev_log mapping current HTML5/Tauri/Organizer drop paths. G0.4 later resolved with `PRESERVE_ALIAS_PATH` in ADR-0005.
- Later human action: Complete MAS sandbox dry run, then rerun feature-build for DnD implementation.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev` and MAS sandbox dry-run environment on macOS; confirm dropped paths can be converted into any required security-scoped access model.
- Files/commits affected: docs/reviews/native-dnd-path-first/*; packages/native-dnd-path-first/docs/*; commit `707a8d1`

## Entry 19

- Feature: grid-persistence
- Gate: G1
- Deferred gate: G2 Repository v0
- Why deferred: G1.5 production implementation depends on the G2 repository contract/migration path.
- Risk: Implementing persistence now would extend direct `localStorage` use or invent a repository shape ahead of the authoritative G2 contract.
- What was done instead: Created docs-only feature brief, discovery review, design, API, test plan, and dev_log mapping current localStorage behavior and target repository boundary.
- Later human action: Complete G2 Repository v0, then rerun feature-build for Grid persistence and localStorage migration.
- Suggested verification command / environment: `sed -n '1,220p' docs/reviews/grid-persistence/20260519-discovery-review.md`
- Files/commits affected: docs/reviews/grid-persistence/*; packages/grid-persistence/docs/*; commit `dcf2750`

## Entry 20

- Feature: window-command-contract
- Gate: G1
- Deferred gate: Cross-vendor feature-verify
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, so no independent cross-vendor verifier was available.
- Risk: The same Codex execution context implemented and verified the G1.1 command contract, which reduces independent review coverage for IPC shape and window lifecycle edge cases.
- What was done instead: Ran inline feature-verify with `cargo check`, core and Organizer type checks, desktop build, and a contract consistency scan across Rust commands, TS types, Organizer manifest/hook, and `docs/contracts/tauri-commands-v0.md`.
- Later human action: Review `dce4fb9` and `packages/window-command-contract/docs/dev_log.md`, then run manual ship only if acceptable.
- Suggested verification command / environment: `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml && pnpm --filter @repo/core check-types && pnpm --filter @repo/plugin-organizer check-types && pnpm --filter desktop build`
- Files/commits affected: apps/desktop/src-tauri/src/commands/window.rs; apps/desktop/src-tauri/src/lib.rs; packages/core/src/types/window.ts; packages/plugin-organizer/src/hooks/useGridWindow.ts; docs/contracts/tauri-commands-v0.md; commits `dce4fb9`, `1fa8c75`

## Entry 21

- Feature: grid-shell-organizer-content
- Gate: G1
- Deferred gate: Cross-vendor feature-verify
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, so no independent cross-vendor verifier was available.
- Risk: The same Codex execution context implemented and verified the Host/Organizer content boundary refactor.
- What was done instead: Ran inline feature-verify with plugin-organizer type checking, desktop build, Host forbidden-import boundary scan, public API scan, and file existence checks.
- Later human action: Review `26d9f57` and `packages/grid-shell-organizer-content/docs/dev_log.md`, then run manual ship only if acceptable.
- Suggested verification command / environment: `pnpm --filter @repo/plugin-organizer check-types && pnpm --filter desktop build`
- Files/commits affected: apps/desktop/src/windows/GridWindow.tsx; packages/plugin-organizer/src/OrganizerGridContent.tsx; packages/plugin-organizer/src/index.ts; docs/contracts/plugin-organizer-public-api-v0.md; commits `26d9f57`, `03ca86a`

## Entry 22

- Feature: grid-shell-organizer-content
- Gate: G1
- Deferred gate: Manual native two-Grid runtime smoke
- Why deferred: Automated Codex verification cannot visually confirm two native Grid windows, scoped update/close/drop/toggle behavior, and drag behavior in the running macOS app without human/manual UI interaction.
- Risk: The refactor moved code without intended behavior changes, but a native runtime smoke could still catch provider wiring, window event, or DnD regressions that TypeScript/build checks cannot see.
- What was done instead: Preserved existing event names and payloads, moved content code behind the public Organizer API, and ran type/build/boundary checks.
- Later human action: Run the desktop app, create two Grid windows, move/resize/close/toggle each, and drop a Finder path into one Grid to confirm scoped behavior.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev` on macOS, then use Control `+ New Grid` twice and verify only the target Grid changes on updates/drops.
- Files/commits affected: apps/desktop/src/windows/GridWindow.tsx; packages/plugin-organizer/src/OrganizerGridContent.tsx; commit `26d9f57`

## Entry 23

- Feature: multi-grid-event-scope
- Gate: G1
- Deferred gate: Cross-vendor feature-verify
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, so no independent cross-vendor verifier was available.
- Risk: The same Codex execution context implemented and verified the event migration.
- What was done instead: Ran inline feature-verify with core and Organizer type checks, Organizer guard tests, desktop build, legacy event scan, target event/API scan, and file existence checks.
- Later human action: Review `78aef01` and `packages/multi-grid-event-scope/docs/dev_log.md`, then run manual ship only if acceptable.
- Suggested verification command / environment: `pnpm --filter @repo/core check-types && pnpm --filter @repo/plugin-organizer check-types && pnpm --filter @repo/plugin-organizer test && pnpm --filter desktop build`
- Files/commits affected: packages/plugin-organizer/src/gridEvents.ts; packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts; packages/plugin-organizer/src/OrganizerGridContent.tsx; packages/core/src/types/events.ts; docs/contracts/events-v0.md; commits `78aef01`, `59da1e5`

## Entry 24

- Feature: multi-grid-event-scope
- Gate: G1
- Deferred gate: Manual two-Grid runtime event-scope smoke
- Why deferred: Automated Codex verification cannot visually operate two native Grid windows and confirm update/drop/close isolation plus listener cleanup in the running macOS app without human/manual UI interaction.
- Risk: Runtime Tauri event routing could still reveal duplicate listener, wrong-window, or close/drop isolation issues that type checks and guard tests cannot fully prove.
- What was done instead: Added runtime guards for missing `gridId`, migrated production event names, preserved create-request compatibility aliases as listeners only, and added guard tests.
- Later human action: Run the desktop app, create two Grid windows, update/close/drop in each, and confirm only the matching `gridId` changes.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev` on macOS, then use Control `+ New Grid` twice and exercise update, close, and Finder drop on each Grid.
- Files/commits affected: packages/plugin-organizer/src/gridEvents.ts; packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts; packages/plugin-organizer/src/OrganizerGridContent.tsx; commit `78aef01`

## Entry 23

- Feature: mas-sandbox-dry-run (G0.6)
- Gate: G0 ship gate
- Deferred gate: G0.6 not shipped — BLOCKED_EXTERNAL (Apple Developer signing)
- Why deferred: G0.6 production implementation requires a signed/sandboxed Apple Developer environment for MAS runtime evidence. The `mas-sandbox` compile fallback passes private-API-disabled `cargo check`, but runtime sandbox behavior cannot be validated without Apple Developer signing or an equivalent sandbox environment.
- Risk: G0.6 cannot verify the MAS path until signing is available. This does not block G1 native foundation, which proceeds on the DMG/private path under the Conditional Go decision.
- What was done instead: G0.1-G0.5 were shipped to `origin/spike/window-ground-truth` on 2026-05-19. G0.6 is explicitly excluded from this ship and remains BLOCKED_EXTERNAL.
- Later human action: When Apple Developer signing/sandbox environment is available, complete G0.6 runtime validation and ship separately.
- Suggested verification command / environment: Build/run desktop with `mas-sandbox` feature and private API disabled after obtaining Apple Developer signing; verify sandbox entitlements and window transparency fallback behavior.
- Files/commits affected: docs/workflow/roadmap/xai-g0-window-spike.md (G0.6 row); packages/mas-sandbox-dry-run/docs/*; commits `071a192`, `4537d2d`, `2fda0c8`

## Entry 25

- Feature: xai-g2-data-security-foundation manifest
- Gate: G2
- Deferred gate: Manifest review
- Why deferred: The run is operating in unattended serial Codex mode and no human/cross-vendor reviewer is available to approve the newly initialized G2 manifest.
- Risk: The G2 decomposition may need human adjustment, especially around previously shipped sync-v1 artifacts, opaque-handle security semantics, and MAS/Supabase external gates.
- What was done instead: Initialized a conservative G2 manifest from the authoritative execution pack, marked only G2.1 `repository-v0-contract` as ELIGIBLE, and left external/security/runtime rows as WAITING, RECONCILE_AFTER_G2.1, or BLOCKED_EXTERNAL.
- Later human action: Review `docs/workflow/roadmap/xai-g2-data-security-foundation.md` before shipping any G2 feature.
- Suggested verification command / environment: `sed -n '1,220p' docs/workflow/roadmap/xai-g2-data-security-foundation.md`
- Files/commits affected: docs/workflow/roadmap/xai-g2-data-security-foundation.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md; docs/workflow/roadmap/xai-v1.deferred-gates.md
