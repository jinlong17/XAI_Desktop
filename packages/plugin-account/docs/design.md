# plugin-account — Design Snapshot

> Wave-W0 scaffold only. Decision snapshot for the account + sync plugin structural seams.
> Full reasoning: `packages/roadmap-kickoff/docs/design.md` + `docs/reviews/roadmap-kickoff/`.

## Identity

- **Plugin**: `account`
- **Package**: `@repo/plugin-account`
- **Status**: Planned (wave-W0 scaffold — no active functionality)
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

1. `enabled: false` — plugin is Planned; host skips disabled plugins in getAllEnabled().
2. No components registered in wave-W0 (OverlayLayer, ControlWidget, etc. deferred).
3. `tauriCommands: []` — no crypto commands in scaffold; the Rust seam is in
   `src-tauri/src/crypto/mod.rs` only.

## Deferred

- Component implementations (login UI, sync status widget)
- Tauri crypto command wiring
- SQLCipher `Repo` driver
- REST transport driver
