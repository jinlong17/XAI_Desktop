# Desktop Design System — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-design-system |
| Title | Desktop Design System (Wave 0) |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | codex / feature-auto-build |
| Updated | 2026-05-21 03:09 PDT |
| Blockers | none |

## Package Ownership

- Workflow target: `desktop-design-system`
- Owning package for implementation/docs: `packages/ui/`
- Source Step 0 brief: `docs/reviews/desktop-ux-rebuild/20260521-feature-brief.md` → F1 handoff extracted into `docs/reviews/desktop-design-system/20260521-feature-brief.md`

## Naming Rationale

- `desktop-design-system` is the canonical feature slug because F2/F3 depend on it as a shared outcome.
- `packages/ui/` is the implementation owner because the work is generic UI infrastructure, not plugin business logic.

## Phase Plan

### Phase 1 — Shared Contract

- add token modules for color / space / radius / shadow / motion / typography
- add icon baseline contract and alias map
- widen `@repo/ui` exports to support token/icon modules
- keep naming semantic and non-business-specific

### Phase 2 — Proof Integration

- remove `App.css` debug helpers or all remaining references
- wire one minimal real consumer to `@repo/ui/tokens`
- keep the proof intentionally narrow; no full visual redesign in F1

## Phase Results

| Phase | Status | Commits | Notes |
|---|---|---|---|
| Phase 1 — Shared Contract | DONE | `72b2c67` | Added semantic token modules, icon baseline contract + alias map, and widened `@repo/ui` subpath exports (`button/card/code/tokens/icons`). |
| Phase 2 — Proof Integration | DONE | `638cf74` | Removed debug helper class usage from organizer/App.css and wired `SmartContainer` to consume `@repo/ui/tokens`. |

## Risks

- `@repo/ui` export-map changes may break current import paths if not done carefully
- a single proof consumer may overfit token naming toward organizer-specific needs
- leaving `@repo/ui` as In-Dev means F2/F3 must treat it as same-wave dependency, not pre-existing stable infra

## Review Focus

- confirm `desktop-design-system` as canonical slug while using `packages/ui/docs` as the owning package location
- confirm ADR-lite outcome: tokens/icon baseline live in `@repo/ui`, but package does not become Stable in F1
- confirm two-phase build split is sufficient for acceptance criteria without scope creep

## Review Notes

feature-review (Codex inline), 2026-05-21 10:39 PDT. Verdict: APPROVED.

The plan is executable as scoped. Discovery evidence matches the current workspace (`packages/ui/package.json` export limitation, `App.css` debug helpers, and organizer debug-class usage), the `packages/ui/` ownership decision stays inside architecture boundaries, and the two-phase split is reviewable without forcing an early `@repo/ui` stability promotion.

Non-blocking recommendations:

- Keep Phase 1 changes contained to `packages/ui/` export surface, token/icon modules, and docs so rollback stays trivial.
- Prefer `SmartContainer` as the proof consumer because it already carries the debug-class debt cited by the acceptance criteria.
- Treat `pnpm --filter desktop build` and targeted consumer typecheck as the primary contract smoke tests; do not assume `@repo/ui` has an independent build step.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-21 02:46 PDT | gpt-5.4 / feature-plan | Fresh planning pass: derived canonical slug `desktop-design-system`, extracted an F1-local Step 0 brief from the program brief, created discovery/design/api/test/dev_log artifacts under `docs/reviews/desktop-design-system/` and `packages/ui/docs/`, and fixed ownership on `packages/ui/` without touching unrelated workflow files. | — | feature-review |
| 2026-05-21 10:39 PDT | gpt-5.4 / feature-review | Reviewed the F1 planning artifacts against workspace reality and approved the scoped two-phase plan. Wrote review notes, promoted Status Panel to APPROVED, and pointed Suggested Next to `feature-build`. | — | feature-build |
| 2026-05-21 03:02 PDT | codex / feature-auto-build | Completed Phase 1 (Shared Contract): added `packages/ui/src/tokens.ts` (color/space/radius/shadow/motion/typography + `designTokens`), `packages/ui/src/icons.tsx` (`DesktopIcon`, `desktopIconRegistry`, `DesktopIconName`, `iconAliasMap`), and expanded `@repo/ui` export surface for token/icon modules while keeping existing component exports compatible. Tests: `pnpm --filter @repo/ui check-types` (pass). | `72b2c67` | feature-auto-build |
| 2026-05-21 03:08 PDT | codex / feature-auto-build | Completed Phase 2 (Proof Integration): removed `border/border-red-500/opacity-50` debug-class dependency from `SmartContainer`, removed corresponding debug helper rules from `apps/desktop/src/App.css`, and wired `SmartContainer` token consumption via `@repo/ui/tokens`; linked organizer workspace dep to `@repo/ui` for contract resolution. Tests: `pnpm --filter @repo/ui check-types` (pass), `pnpm --filter @repo/plugin-organizer check-types` (pass), `pnpm --filter desktop build` (pass). Evidence: `rg -n \"@repo/ui/tokens\" packages/plugin-organizer/src/SmartContainer.tsx` matched import; no `border-red-500` / `opacity-50` matches remain under `apps/desktop/src` + `packages/plugin-organizer/src`. | `638cf74` | feature-verify |
