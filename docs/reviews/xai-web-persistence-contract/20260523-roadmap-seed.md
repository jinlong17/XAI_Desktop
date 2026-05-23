# Roadmap Seed — xai-web-persistence-contract

> xai-web-console roadmap · feature #3 · wave W1 · Foundation
> Source PRD: web design/DESIGN.md §9 (数据模型与持久化), §9.2 持久化键
> Source Code: web design/app.jsx (xai_accent_hue/rail_pos/bg_tone), web design/shell.jsx (xai_rail_order), web design/pet.jsx (xai_pet_*)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Stand up a typed localStorage key registry that owns every `xai_*` key listed in DESIGN.md §9.2 (accent_hue, rail_pos, bg_tone, rail_order, pet_pos, pet_id, task_cols, boards_v2, active_board, board_panels, board_inbox, dash_order, clock_style, clock_tz, zones, ai_convos, ai_insights, ai_voice, pref_*). Provide a single `usePref<T>(key, default)` hook used by every module, plus a `xai_pref_*` autosaver for the Settings panel.

## Hard constraints

- All key names MUST match DESIGN.md §9.2 byte-for-byte (downstream prototype data must round-trip on import).
- The registry MUST surface a versioning hook so future schema migrations can be added without breaking old user data.
- Hook must be SSR-safe (apps/web is Vite SPA but settings might prerender) — fall back to defaults on `typeof window === 'undefined'`.
- Provide an import path (e.g., `@repo/plugin-web-storage` or `apps/web/src/lib/usePref.ts`) that the rest of the wave can depend on without circular deps.

## Acceptance signal

Every key in DESIGN.md §9.2 has a typed entry in the registry, the hook compiles, a smoke test stores+reads a value, and SSR import does not throw.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-build-form-adr.
