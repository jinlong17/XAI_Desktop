# desktop-local-first-repository-bridge - Test Strategy

## Test Goals

Prove that the active desktop app can bridge supported offline entity surfaces into the shipped local-first repository without regressing browser behavior or blurring row boundaries.

## Unit Coverage

### Shared contract / core-data

- entity-type normalization for newly added bridge records
- bridge status/error unions
- repo record codecs or serializers for pomodoro, pet, and settings
- typed workspace auxiliary record codecs for `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, and `xai_board_view_by_id`
- idempotent per-key/per-record write semantics

### Active entity packages

- tasks desktop repo bridge behavior
- habits desktop repo bridge behavior
- pomodoro desktop repo bridge behavior
- board/workspaces desktop repo bridge behavior
- pet basic-state desktop repo bridge behavior
- local settings desktop repo bridge behavior
- unsupported notes behavior remains explicit and test-covered
- browser-only consumers continue to work when the bridge is inactive

## Contract Coverage

- desktop runtime activates only under `desktop-phase1-offline`
- browser runtime remains browser-only
- repo-first read plus browser fallback behavior is explicit and deterministic
- unreadable or absent repo/browser states return the expected safe empty state
- browser-visible writes in desktop runtime do not silently hide repo write failures
- core-data contract and runtime docs stay aligned for any new repo entity families

## E2E / Regression Scenarios

- desktop runtime with empty repo + existing browser state
- desktop runtime with populated repo + browser state present
- desktop runtime with unreadable browser cache and empty repo
- browser runtime with no repo available
- settings pane changes under desktop runtime preserve browser behavior and also bridge to repo
- board workspace view/panel/inbox changes under desktop runtime preserve browser behavior and also bridge to repo
- notes requests under desktop runtime return explicit unsupported behavior
- explicit browser-safety tests confirm the wrapped web runtime still avoids direct Tauri imports in active entity packages and still fail-closes desktop-only paths when the repo seam is absent
- desktop app bundle still builds with the bridge enabled

## Mock Strategy

- `@repo/core-data/testing` plus fake invoke seams for repo-side contract tests
- active entity package tests use browser-local fixtures plus injected repo doubles
- AppProviders-level tests verify mount/gating only; host tests do not own business serialization logic
- notes unsupported behavior uses deterministic fixtures, not placeholder TODO assertions
- `@repo/web` integration tests cover `desktop-phase1-offline` mount/gating so browser-safe behavior is verified outside package-local unit tests

## Verification Gates

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/plugin-web-tasks test`
- `pnpm --filter @repo/plugin-web-habits test`
- `pnpm --filter @repo/plugin-web-pomodoro test`
- `pnpm --filter @repo/plugin-web-board-core test`
- `pnpm --filter @repo/plugin-web-board-core typecheck`
- `pnpm --filter @repo/plugin-web-board-workspaces test`
- `pnpm --filter @repo/plugin-web-board-workspaces typecheck`
- `pnpm --filter @repo/plugin-web-pet test`
- `pnpm --filter @repo/plugin-web-storage test`
- `pnpm --filter @repo/plugin-web-storage check-types`
- `pnpm --filter @repo/plugin-web-settings-shell test`
- `pnpm --filter @repo/plugin-web-settings-shell typecheck`
- `pnpm --filter @repo/plugin-web-settings-rest test`
- `pnpm --filter @repo/plugin-web-settings-rest typecheck`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-1 | Desktop runtime bridge activation is explicit and browser runtime remains unchanged |
| AC-2 | Supported entity groups can read from repo with deterministic browser fallback |
| AC-3 | Supported desktop writes bridge into the repo without silently masking failures |
| AC-4 | Project, pomodoro, pet, settings, and board auxiliary-state contract gaps are normalized before bridge writes land |
| AC-5 | Notes remains explicitly unsupported unless review re-scopes the row |
| AC-6 | Browser-safe `@repo/web` test, check-types, and build gates still pass |
| AC-7 | Desktop Tauri app bundle still passes |
