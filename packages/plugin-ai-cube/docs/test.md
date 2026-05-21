# plugin-ai-cube Test Strategy

## Unit Coverage

- registration test:
  - `registerAiCubePlugin()` registers manifest + control widget in `PluginRegistry`
  - repeated registration remains idempotent
- control provider test:
  - consumer without provider throws invariant error
  - provider passes shell / settings / actions adapters through correctly
- preview-mode test:
  - conversation surface renders explicit preview / disabled state in Phase 0–3
  - send action cannot pretend to call real AI
- settings IA test:
  - canvas actions and appearance sections render separately
  - `MOCK_DATA` debug block is absent
- token/icon adoption smoke:
  - key control-surface components import from `@repo/ui/tokens` and/or `@repo/ui/icons`

## Contract Coverage

- `pnpm --filter @repo/plugin-ai-cube check-types`
- `pnpm --filter @repo/plugin-ai-cube test`
- `pnpm --filter @repo/core test` if registry-facing code or typed-event helpers are touched
- `pnpm --filter desktop build`

Static/grep checks:

- `apps/desktop/src/components/AiAssistant/AiCube.tsx` and `apps/desktop/src/components/Settings/SettingsPanel.tsx` no longer hold business UI implementation
- `apps/desktop/src/windows/ControlWindow.tsx` only keeps shell/provider/bridge logic
- `apps/desktop/src/main.tsx` contains static `registerAiCubePlugin()` wiring
- `packages/plugin-ai-cube/src` is the only home for control-surface business UI

## Regression / Manual Scenarios

- control window:
  - single click toggles panel correctly
  - drag moves Cube without accidentally toggling panel
  - blur outside the control window dismisses the panel
- tray actions:
  - create-grid action still creates/cascades grids correctly
  - clear-all still routes to organizer clear request
  - placeholder actions show correct disabled / coming-soon semantics
- appearance settings:
  - Cube appearance controls still update visible control surface
  - Grid appearance controls still affect existing grid visuals through the current Host bridge
- preview panel:
  - transcript / suggestions render without implying Phase 4 AI is enabled

## Mock Strategy

- `@repo/ui` F1 exports are consumed directly as same-wave dependency; no separate mock needed
- `plugin-organizer` is Stable, but F2 should still integrate through Host-owned callbacks rather than plugin-to-plugin direct imports inside `plugin-ai-cube`
- `clipboard`, `pomodoro`, and global search have no stable plugin owners in current `PLUGIN_MAP`; use disabled buttons, preview affordances, or host no-op adapters only
- no real LLM, no remote APIs, no new Tauri command mocks required for F2

## Acceptance Trace

1. Host no longer owns AI Cube / Settings business UI → grep + desktop build
2. Static registration path exists → registry unit test + `main.tsx` evidence
3. Phase 0–3 tray actions present → component tests + manual desktop verification
4. SettingsPanel debug block removed and IA improved → UI tests + source grep
5. Drag vs click correctness on real macOS → manual verification checklist

## Latest Execution Evidence (2026-05-21)

- `pnpm --filter @repo/plugin-ai-cube check-types` ✅
- `pnpm --filter @repo/plugin-ai-cube test` ✅ (24 tests)
- `pnpm --filter desktop build` ✅
- Contract grep evidence:
  - `apps/desktop/src/windows/ControlWindow.tsx` renders `ControlHost`.
  - Host business files `apps/desktop/src/components/AiAssistant/AiCube.tsx` and `apps/desktop/src/components/Settings/SettingsPanel.tsx` removed.
  - `packages/plugin-ai-cube/src/control/preview.ts` keeps placeholder actions disabled for clipboard/pomodoro/search.
