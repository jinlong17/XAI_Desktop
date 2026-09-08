# plugin-ai-cube Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | plugin-ai-cube |
| Title | AI Cube Control Surface Integration (F2) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | workflow complete |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | gpt-5 / ship |
| Updated | 2026-05-21 03:47 PDT |
| Blockers | none |

## Package Ownership

- Workflow target: `plugin-ai-cube`
- Owning package: `packages/plugin-ai-cube/`
- Source Step 0 brief: `docs/reviews/desktop-ux-rebuild/20260521-feature-brief.md` → F2 handoff extracted into `docs/reviews/plugin-ai-cube/20260521-feature-brief.md`

## Existing Runtime Baseline

- 2026-05-20 scaffold already landed:
  - mock conversation hook and UI (`AiCubePanel`, `MessageBubble`, `InputBar`, `ActionSuggestion`, `PrivacyGateDialog`, `CostGuard`, `OfflineFallback`)
  - local privacy redaction and cost/offline guards
  - Repository v0 adapters/providers for conversation history and daily cost usage
- This planning pass treats that scaffold as reusable input, not as the final desktop control-surface integration.

## Naming Rationale

- `plugin-ai-cube` is both the canonical workflow target and the runtime owner because this feature's outcome is to make the existing package the real control-window business surface.
- The title emphasizes F2's scope: desktop integration + boundary cleanup, not generic AI capability expansion.

## Phase Plan

### Phase 1 — Registration And Shell Boundary

- add `registerAiCubePlugin()` under `packages/plugin-ai-cube/`
- wire static registration in `apps/desktop/src/main.tsx`
- convert `ControlWindow` to shell/provider/bridge only
- decide whether `ControlWindow` renders `ControlHost` or a direct registry lookup for `ai-cube`

### Phase 2 — Plugin-owned Control Surface

- move Cube trigger, tray actions, panel shell, and settings IA into `packages/plugin-ai-cube/`
- remove Host business implementations for `AiCube.tsx` / `SettingsPanel.tsx`
- consume F1 `@repo/ui` token/icon exports for AI Cube visual refresh
- present conversation UI in preview-only mode for Phase 0–3

### Phase 3 — Action Wiring And Verification

- keep organizer create-grid / clear-all through Host bridge callbacks
- keep clipboard / pomodoro / search as placeholder or disabled actions until stable owners exist
- add registration/provider/UI tests and desktop contract checks
- run real macOS click-vs-drag manual verification

## Risks

- plugin registry integration may tempt build work to reintroduce Host-specific business assembly if the provider contract is not kept crisp
- preview-mode messaging may be too subtle and violate PRD phase expectations
- current drag/click threshold logic has real-device sensitivity and must be verified outside headless tests
- shared settings state is intentionally left as a temporary Host adapter; scope creep into a full settings refactor would delay F2

## Review Focus

- confirm Option B from discovery: static registration + plugin-owned control widget + Host adapter/provider shell
- confirm D2: visible conversation preview is acceptable only if clearly labeled as Phase 4-disabled
- confirm F2 should not absorb Organizer or settings-architecture migration beyond the temporary adapter boundary
- confirm `plugin-ai-cube` should be treated as a Fresh planning target despite older scaffold docs/content

## Review Notes

- Approved with two execution guardrails: `ControlWindow` should render the registered widget through `ControlHost`, and Phase 0–3 conversation affordances must stay explicitly preview/disabled rather than implying live AI.
- Placeholder tray actions for clipboard, pomodoro, and search remain disabled or no-op adapters until their owning plugins are Stable/Production; F2 must not absorb F3 organizer or broader settings extraction.

## Verification Summary

- Reviewed commits `e50bcdd`, `f573d06`, `881bb13`, and `d6e67ae` against the F2 plan, commit convention, and phase boundaries. Phase 1 owns registration/host shell migration, Phase 2 deletes Host business UI only, Phase 3 owns tests/docs/PLUGIN_MAP sync, and `d6e67ae` is a docs-only follow-up that backfills Phase 3 evidence.
- Re-ran `pnpm --filter @repo/plugin-ai-cube check-types`, `pnpm --filter @repo/plugin-ai-cube test`, `pnpm --filter @repo/core test`, and `pnpm --filter desktop build` successfully.
- Verified source/grep evidence for all acceptance gates: Host no longer contains `AiCube.tsx` / `SettingsPanel.tsx`, `ControlWindow` renders `ControlHost` inside `AiCubeControlProvider`, `registerAiCubePlugin()` is statically wired and idempotent, `PLUGIN_MAP` + four-piece docs are synced, Phase 0-3 tray actions are present with clipboard/pomodoro/search disabled, and the conversation surface is explicitly preview-only with disabled send.

## Residual Risks

- Real macOS hardware verification for click-vs-drag behavior remains pending; headless/unit coverage cannot prove native drag handoff feel or accidental post-drag toggle behavior.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-21 03:22 PDT | gpt-5.4 / feature-plan | Fresh planning pass: extracted the F2-local brief from `desktop-ux-rebuild`, created `docs/reviews/plugin-ai-cube/20260521-discovery-review.md`, and rewrote `packages/plugin-ai-cube/docs/{design,api,test,dev_log}.md` into V2 planning artifacts scoped to control-window integration, preview gating, static registration, and Host boundary cleanup. | — | feature-review |
| 2026-05-21 03:27 PDT | gpt-5.4 / feature-review | Reviewed the F2 planning artifacts against Workflow V2 gates and approved the plan as executable. Locked the implementation guardrails around `ControlHost` rendering, preview-only conversation affordances, and placeholder action scope. | — | feature-build |
| 2026-05-21 03:35 PDT | gpt-5 / feature-auto-build | Phase 1 — Registration and shell boundary: added `registerAiCubePlugin()`, enabled and aligned plugin manifest, wired static registration in `apps/desktop/src/main.tsx`, and converted `ControlWindow` to shell/provider/bridge rendering via `ControlHost`. | `e50bcdd` | feature-auto-build |
| 2026-05-21 03:36 PDT | gpt-5 / feature-auto-build | Phase 2 — Plugin-owned control surface boundary cleanup: removed Host business implementations (`apps/desktop/src/components/AiAssistant/AiCube.tsx`, `apps/desktop/src/components/Settings/SettingsPanel.tsx`) after plugin-owned control widget took over. | `f573d06` | feature-auto-build |
| 2026-05-21 03:38 PDT | gpt-5 / feature-auto-build | Phase 3 — Action wiring and verification: kept organizer callbacks in Host bridge (`createGrid` / `clearAllGrids`), kept clipboard/pomodoro/search disabled placeholders, added registration/provider/preview tests, and ran desktop contract checks. Evidence: `pnpm --filter @repo/plugin-ai-cube check-types` pass; `pnpm --filter @repo/plugin-ai-cube test` pass (24 tests); `pnpm --filter desktop build` pass; `ControlWindow` renders `ControlHost`; preview status text explicitly marks Phase 0–3 disabled mode. | `881bb13` | feature-verify |
| 2026-05-21 03:45 PDT | gpt-5 / feature-verify | Verification pass: reviewed `e50bcdd`, `f573d06`, `881bb13`, and `d6e67ae` for commit intent, contract alignment, and phase boundaries; re-ran typecheck, tests, registry coverage, and desktop build; confirmed Host cleanup, static/idempotent registration, preview-only conversation UI, and disabled placeholder tray actions. Residual risk limited to pending real macOS click-vs-drag verification. | `e50bcdd`, `f573d06`, `881bb13`, `d6e67ae` | ship |
| 2026-05-21 03:47 PDT | gpt-5 / ship | Shipped plugin-ai-cube on `main`: verified commit quality/scope, committed pending verify-status dev_log update (`341295b`), and pushed `origin/main` (range `6563570..341295b`) without staging organizer or other unrelated dirty files. | `e50bcdd`, `f573d06`, `881bb13`, `d6e67ae`, `341295b` | workflow complete |
