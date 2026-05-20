# roadmap-kickoff — Test Strategy

> This is a structural scaffold. "Tests" are mostly compile/build/register gates
> plus a few smoke assertions. No product behavior to test yet.

## 1. Acceptance criteria (must all pass)

| # | Criterion | How verified |
|---|---|---|
| AC-1 | `packages/plugin-account/` builds | `pnpm install` clean + `pnpm --filter @repo/plugin-account check-types` |
| AC-2 | `packages/core-data/` builds | `pnpm --filter @repo/core-data check-types` |
| AC-3 | `account:*` keys type-check in `emitEvent`/`useEventListener` | compile-smoke usage in plugin-account referencing a declared+emitted key; `check-types` passes |
| AC-4 | Rust `AppError` E3xxx enum compiles | `cargo check` in `apps/desktop/src-tauri/` |
| AC-5 | Existing window commands still compile unchanged | same `cargo check`; `commands/window.rs` diff = empty |
| AC-6 | `PLUGIN_MAP.md` shows `account` + `@repo/core-data` as `Planned` | doc inspection |
| AC-7 | `main.tsx` statically registers plugin-account; routing unregressed | `pnpm dev` in `apps/desktop/`; main/grid/control routes load |
| AC-8 | `@repo/core` core test suite still green | `pnpm --filter @repo/core test` (Vitest) |
| AC-9 | Every wave-0 boundary seam exists | checklist: events.ts key, hooks/useTauriInvoke, error.rs, plugin-account barrel, core-data barrel, PLUGIN_MAP rows, main.tsx call |

## 2. Unit coverage

- **`useTauriInvoke`**: Vitest test in `packages/core` mocking
  `@tauri-apps/api/core` `invoke` — assert the hook forwards `(cmd, args)` and
  resolves/rejects pass-through. (New test file; keeps `pnpm --filter @repo/core
  test` meaningful.)
- **`account:*` typing**: a `// @ts-expect-error` negative case (wrong payload
  shape) + a positive `emitEvent('account:sync-started', { kind: 'push' })` in a
  type-only test fixture inside plugin-account proves the EventMap gate.
- **`core-data` in-memory repo**: minimal Vitest covering `createInMemoryRepo()`
  `put`/`get`/`delete`/`list` round-trip (the testing mock other rows will depend on).

## 3. Contract coverage

- **Manifest ↔ runtime**: assert `accountManifest` satisfies the live
  `PluginManifest` interface (compile-time, via `import type`); assert every
  `events.emit` entry is a real `keyof EventMap`.
- **Registration**: a test that calls `registerAccountPlugin()` then
  `PluginRegistry.getPlugin('account')` returns the registration (idempotent on
  double-call).
- **Red-line lint**: grep assertion that `packages/plugin-account/src/**` contains
  no `from '@tauri-apps/api'` import (red line #4) and no deep `@repo/*/src/internal`
  import (red line #9).

## 4. Rust coverage

- `cargo check` (compile gate) — primary.
- A `#[test]` in `error.rs` asserting each `E3xxx` variant's `to_string()` starts
  with its expected `E3xxx` code prefix (stable error-code contract for JS).
- `cargo test` in `apps/desktop/src-tauri/` must remain green (no existing tests
  broken; window.rs untouched).

## 5. E2E / regression

- Manual `pnpm dev` smoke on macOS: main overlay, a grid window, control window all
  still render and route (R-1 regression guard for the `main.tsx` edit).
- No multi-window cross-vendor verification required (**Verify Cross-vendor: no**).

## 6. Mock strategy

- `@tauri-apps/api/core` `invoke` mocked in Vitest for `useTauriInvoke` (no real
  IPC in unit tests — PLUGIN_SDK §7.2: plugins testable with zero Tauri).
- `core-data` `createInMemoryRepo()` is itself the mock other wave-0 rows use; it
  has no external deps.
- plugin-account marked `Planned` → any future dependent must mock it until Stable.
- Crypto/KeyVault NOT mocked here (no crypto impl in scaffold; `KeyHandle` is a
  type seam only).

## 7. Out of scope (later rows)

Crypto vectors (`cbor_aad_vectors.json`), SQLCipher driver tests, REST driver
tests, capability-allowlist enforcement tests, `account:*` cross-device network
tests. The scaffold only proves the seams compile/register.
