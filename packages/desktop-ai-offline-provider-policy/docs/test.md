# desktop-ai-offline-provider-policy - Test Strategy

## Core Coverage

| Area | Cases |
|---|---|
| policy resolver | anthropic ready / no key / offline; openai-compatible no base URL / remote ready / loopback-local deferred |
| chat gating | offline profile does not call `fetch`; missing key does not synthesize provider success; loopback-local deferred does not call `fetch` |
| settings gating | Test Connection disabled/copy for offline, no key, no base URL, and local-provider-deferred states |
| regression | existing streaming/error tests still pass for real request paths when policy is `ready` |

## Preferred Test Files

- `packages/plugin-web-ai-chat/src/__tests__/providerPolicy.test.ts`
- `packages/plugin-web-ai-chat/src/__tests__/claudeStreamAdapter.test.ts`
- `packages/plugin-web-ai-chat/src/__tests__/AiChatModule.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/aiPane.test.tsx`
- `packages/core/tests/runtime-profile.test.ts` only if runtime-profile helpers change

## Required Commands

Always run:

```bash
pnpm --filter @repo/plugin-web-ai-chat test
pnpm --filter @repo/plugin-web-ai-chat typecheck
pnpm --filter @repo/plugin-web-settings-rest test
pnpm --filter @repo/plugin-web-settings-rest typecheck
```

Run when touched:

```bash
pnpm --filter @repo/core test
pnpm --filter @repo/core check-types
pnpm --filter @repo/plugin-web-storage test
pnpm --filter @repo/plugin-web-storage check-types
pnpm --filter @repo/web test
pnpm --filter @repo/web check-types
```

Final integration gates:

```bash
pnpm --filter @repo/web build
pnpm --filter desktop tauri build --debug --bundles app
```

## Manual / External Classification

- Real macOS offline/online toggle smoke in the Tauri desktop shell is still a manual follow-up for verify/ship.
- Real Ollama/local-daemon smoke is not required for this row because no local-provider execution path is being enabled.

## Regression Assertions

- `@repo/plugin-web-ai-chat` keeps existing key storage and transport error semantics for real online requests.
- `@repo/plugin-web-settings-rest` AI pane still uses encrypted key storage and never writes keys to localStorage.
- No code path silently turns a loopback/local-looking base URL into supported behavior.
- No new account, sync, calendar, backup/export/import, or native AI bridge scope leaks into the row.
