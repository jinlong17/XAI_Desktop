# plugin-account — Design Snapshot

> Wave-W0 scaffold only. Decision snapshot for the account + sync plugin structural seams.
> Full reasoning: `packages/roadmap-kickoff/docs/design.md` + `docs/reviews/roadmap-kickoff/`.

## Identity

- **Plugin**: `account`
- **Package**: `@repo/plugin-account`
- **Status**: In-Dev (signup/login orchestration shipped locally; runtime transport deferred)
- **PRD**: `docs/planning/sub-prds/sync/PRD.md` v0.6-DRAFT §5

## Selected Options

| Decision | Selected | Rationale |
|---|---|---|
| D-3 Manifest schema | A — live PluginManifest | Authoritative runtime contract |
| D-4 Registration | A — explicit registerAccountPlugin() | Greppable; red line #9 compliant |
| D-5 Event payloads | A — PLUGIN_SDK §4.1 shapes | PRD §5.7 FR-SY-39 |
| D-6 AppError scope | A — window.rs untouched | Blast radius bounded |

## Architecture

```
apps/desktop/src/main.tsx
  └─ registerAccountPlugin()
        └─ PluginRegistry.register(accountManifest, {})

@repo/plugin-account
  ├─ src/index.ts          (only public surface, red line #9)
  ├─ src/account.ts        (signup/login/refresh orchestration)
  ├─ src/sync-engine.ts    (plaintext outbox squash + one-shot pushBatch)
  ├─ src/register-plugin.ts (PluginRegistry.register + compile-smoke)
  ├─ src/types.ts           (KeyHandle branded type)
  └─ manifest.json          (live schema, enabled: false)
```

## Threat Model Seams

- **T6 / FR-SY-75**: `KeyHandle` branded TS type + `KeyHandle(u32)` Rust newtype
  ensure JS never holds raw key material. Enforcement deferred to a later crypto row.
- **STRIDE TB-3**: plugin-account must use `useTauriInvoke` from `@repo/core/hooks`
  for any IPC; direct `@tauri-apps/api` imports are red-line #4 violations.

## Frozen Assumptions

1. `enabled: false` — plugin is still hidden from runtime UI; host skips disabled plugins in getAllEnabled().
2. No components registered in wave-W0 (OverlayLayer, ControlWidget, etc. deferred).
3. `tauriCommands` declares the four `crypto_*` commands; `src/account.ts` and
   `src/sync-engine.ts` consume injected seams until live runtime wiring is added.

## Deferred

- Component implementations (login UI, sync status widget)
- Live Tauri crypto command client wiring
- SQLCipher `Repo` driver
- Hosted Supabase `/sync/push` Edge Function
