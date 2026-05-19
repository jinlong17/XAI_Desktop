# plugin-account — Test Strategy

> Wave-W0 scaffold. Tests focus on type-compilation gates and registration smoke.

## 1. Acceptance criteria

| # | Criterion | How verified |
|---|---|---|
| AC-1 | Package builds | `pnpm --filter @repo/plugin-account check-types` |
| AC-2 | account:* keys type-check in emitEvent | compile-smoke in register-plugin.ts |
| AC-3 | Red-line #4: no @tauri-apps/api direct import | grep clean on src/ |
| AC-4 | Red-line #9: no deep @repo/*/src/internal import | grep clean on src/ |
| AC-5 | registerAccountPlugin() registers; getPlugin('account') returns it | PluginRegistry integration test in feature-verify |

## 2. Compile-smoke gates (in register-plugin.ts)

- `_AssertAccountKeysInEventMap` type: `AccountEmitKeys extends keyof EventMap ? true : never`
  — errors at compile time if any account:* key is removed from EventMap.
- `_compileSmokeTypingOnly()`: positive `emitEvent('account:sync-started', { kind: 'push' })`
  + `@ts-expect-error` negative case — confirms payload shape enforcement.

## 3. Red-line lint (enforced in feature-verify)

```bash
grep -r "@tauri-apps/api" packages/plugin-account/src/   # must be empty
grep -r "@repo/.*/src/internal" packages/plugin-account/src/  # must be empty
```

## 4. Registration smoke

A test calling `registerAccountPlugin()` then `PluginRegistry.getPlugin('account')`
confirms the manifest is reachable and idempotent on double-call.
(Deferred to feature-verify; needs Vitest setup in plugin-account devDependencies.)

## 5. Out of scope (later rows)

Crypto vectors, SQLCipher driver, REST transport, account:* cross-device network tests.
