# Sync v1 — Codebase Orientation Report

> Pattern: codebase-explorer (read entry points → map module graph → surface conventions → "where Sync slots in")
> Date: 2026-05-14 · Branch: `refactor/microkernel-plugin-architecture`
> Scope: orient for decomposing `docs/planning/sub-prds/sync/PRD.md` into a roadmap.
> Not exhaustive — actionable for roadmap decomposition only.

---

## 0. TL;DR for roadmap decomposition

- The Sync layer's two product homes — **`packages/plugin-account/`** and **`packages/core-data/`** — **DO NOT EXIST YET**. The current `packages/` tree has only `core`, `ui`, `plugin-organizer` (+ shared configs). Both are *new packages* the roadmap must create from scratch (slot points identified in §6).
- The Rust backend (`apps/desktop/src-tauri/`) is **minimal**: 1 command domain (`window`), 1 platform adapter (`macos`), no crypto, no networking. Sync adds a whole new `crypto/` module + `commands/crypto.rs` + REST driver. `Cargo.toml` has **zero crypto/HTTP deps** today.
- Infra conventions are **already codified and strict** (SYSTEM_ARCHITECTURE §4 12 red lines; PLUGIN_SDK contract). The current code is a *subset* of what PLUGIN_SDK describes — PLUGIN_SDK is the **target** spec (mentions `core-events`, `core-data`, `core-registry`, `ConsoleView`, `register.ts`), the **actual** code is the simpler Wave-3 state. Roadmap must reconcile target-vs-actual (see §4 gap table).
- The `account:*` EventMap entries Sync needs are **specified in PLUGIN_SDK §4.1 but NOT yet in the actual `packages/core/src/types/events.ts`** (which only has organizer + app events). Adding them is a concrete early Sync task.

---

## 1. Module graph (actual, current state)

```
apps/desktop/                      Host shell (Tauri + React 19)
├── src/
│   ├── main.tsx                   Hash router: "/"=App, "#/grid?id="=GridWindow, "#/control"=ControlWindow
│   ├── App.tsx                    Main overlay window root
│   ├── windows/{GridWindow,ControlWindow}.tsx
│   ├── context/{InteractiveContext,SettingsContext}.tsx
│   └── providers/DndProvider.tsx
└── src-tauri/                     Rust backend (minimal)
    ├── src/
    │   ├── main.rs                bin entry → desktop_lib::run()
    │   ├── lib.rs                 Builder: state mgmt + invoke_handler + setup (~100 lines)
    │   ├── commands/
    │   │   ├── mod.rs             `pub mod window;`  ← only ONE domain today
    │   │   └── window.rs          create/update/close_grid_window (129 lines)
    │   └── platform/
    │       ├── mod.rs
    │       └── macos/{mod.rs,window_ext.rs}  NSWindow level / click-through
    ├── Cargo.toml                 tauri, tauri-plugin-opener, serde, serde_json,
    │                              cocoa/core-graphics/core-foundation (macOS).
    │                              NO crypto/http/sqlite deps.
    └── capabilities/default.json  windows:["main","control","grid_*"]; core:* + opener perms only

packages/
├── core/      (@repo/core, Stable)        Infra. Subpath exports: . /types /events /hooks /registry /store
│   └── src/
│       ├── index.ts               re-exports types, events, hooks, registry
│       ├── types/{events,grid,plugin,window,index}.ts
│       ├── events/{emitter,listener,index}.ts   emitEvent() + useEventListener()
│       ├── registry/{plugin-registry,plugin-host,index}.ts  PluginRegistry singleton
│       ├── hooks/{useWindow,index}.ts
│       └── store/index.ts         PLACEHOLDER (comment only — Zustand planned Wave 3)
├── ui/        (@repo/ui, In-Dev)          3 stub components (button/card/code)
├── plugin-organizer/  (@repo/plugin-organizer, Stable)  reference plugin
│   ├── manifest.json              actual manifest (simpler than PLUGIN_SDK §2 schema)
│   └── src/index.ts               barrel — the ONLY public surface
├── eslint-config/  typescript-config/     shared tooling
└── (NO plugin-account/ — Sync main home, MUST CREATE)
    (NO core-data/      — Sync REST/SQLite driver home, MUST CREATE)

apps/web/    Next.js scaffold (kept per SYSTEM_ARCHITECTURE §11, not in Sync scope)
```

Dependency direction (enforced red line #8): `Host → Plugin → Core/UI`. Never reverse. Plugin↔Plugin only via `@repo/core/events`.

---

## 2. Entry points Sync features will plug into

| Entry point | File (absolute) | How Sync uses it |
|---|---|---|
| Plugin registration singleton | `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/packages/core/src/registry/plugin-registry.ts` | `PluginRegistry.register(manifest, components)` — `plugin-account` registers its ConsoleView/SettingsSection here |
| Plugin public surface | `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/packages/plugin-organizer/src/index.ts` | Pattern: a plugin's `src/index.ts` is its ONLY export (red line #9). `plugin-account/src/index.ts` follows this. Note: actual organizer has NO `register.ts` yet; PLUGIN_SDK §6 mandates one — Sync should adopt the `register.ts` side-effect pattern. |
| Host static registration | `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/apps/desktop/src/main.tsx` | Per SYSTEM_ARCHITECTURE §10 step 4: add an import line registering the new plugin (currently main.tsx has NO plugin imports — organizer not yet wired through registry; Sync work may need to establish the registration wiring). |
| Typed events map | `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/packages/core/src/types/events.ts` | Add `account:*` keys to `EventMap` (see §3). Compile-time gate for emit/listen. |
| Event emitter / listener | `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/packages/core/src/events/{emitter,listener}.ts` | `emitEvent('account:sync-started', {...})` / `useEventListener('account:logged-in', cb)` |
| Tauri command registration | `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/apps/desktop/src-tauri/src/lib.rs` (`invoke_handler` macro) + `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/apps/desktop/src-tauri/src/commands/mod.rs` (`pub mod ...`) | Add `crypto::*` commands to both. PRD §7.1.5 expects `src-tauri/src/crypto/aad.rs` + `envelope.rs`; PRD/dev-plan §4.2 expect `commands/crypto.rs` with `crypto_encrypt_for`, `crypto_unwrap_dek_for_device`, etc. |
| Tauri capability allowlist | `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/apps/desktop/src-tauri/capabilities/default.json` | FR-SY-75: `crypto_*` commands must be allowlisted to plugin-account/core-data only. Today this file has only `core:*`/`opener:*` perms — Sync adds a scoped capability. |
| State management | `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/packages/core/src/store/index.ts` | Currently a placeholder comment (Zustand "Wave 3"). Sync's `sync_state`/queue local state needs a real store — either core/store or plugin-account-private slice. |

---

## 3. Typed-event naming convention (Sync MUST follow)

Source of truth: SYSTEM_ARCHITECTURE §6 & §6.1, PLUGIN_SDK §4.3, and the live `EventMap`.

**Actual `EventMap`** (`packages/core/src/types/events.ts`) — only these exist today:

```ts
export interface EventMap {
  'organizer:grid-update': { gridId: string; changes: Partial<GridBox> };
  'organizer:grid-close': { gridId: string };
  'organizer:file-drop': { gridId: string; files: string[] };
  'organizer:grid-window-ready': { gridId: string };
  'organizer:create-grid-request': { rect: Rect };
  'app:interactive-mode-changed': { interactive: boolean };
  'app:settings-changed': { key: string; value: unknown };
}
```

**Naming rules (enforced):**
- Format: `<plugin>:<verb-or-noun>`, all-lowercase, hyphen-separated. e.g. `organizer:grid-update`, `app:interactive-mode-changed`.
- One event = one owner plugin. Only the owner may `emit`; others may only `listen`. No cross-prefix borrowing.
- Prefix ownership table (SYSTEM_ARCHITECTURE §6.1): `app:`=Host/global, `organizer:`=plugin-organizer, `account:`=plugin-account (+sync), `ai:`, `clipboard:`, `widgets:`, `todo:`/`productivity:`.
- New event lifecycle (strict order): **(1)** add typed key to `EventMap` → **(2)** declare in plugin `manifest.json` `events.emit`/`events.listen` → **(3)** only then use in code.
- Type-safe wrappers: `emitEvent<K extends keyof EventMap>(event, payload)` and `useEventListener<K>(event, handler)`. Payloads must be serializable. Never `window.postMessage` / cross-window DOM.

**Sync's events (specified in PLUGIN_SDK §4.1, NOT yet in actual EventMap — concrete early task):**

```ts
'account:logged-in':     { userId: string };
'account:logged-out':    { userId: string };
'account:sync-started':  { kind: 'push' | 'pull' };
'account:sync-completed':{ kind: 'push' | 'pull'; durationMs: number };
'account:sync-failed':   { kind: 'push' | 'pull'; error: string };
```

Note (PRD §5.7 FR-SY-39): same-account multi-window coordination stays on **local `core-events`** (SQLite WAL shared). Only cross-device goes through Sync. So `account:*` events are local-bus signals, not network messages.

---

## 4. Conventions that constrain Sync (with the actual-vs-target gap)

From CLAUDE.md §Code Boundaries + SYSTEM_ARCHITECTURE §3/§4/§9 + PLUGIN_SDK:

| Constraint | Rule | Sync implication |
|---|---|---|
| Red line #1/#8 | Business logic only in `packages/plugin-*/`; deps strictly `Host → Plugin → Core/UI` | All sync/account business logic lives in `plugin-account` (+ data access in `core-data`). Host (`apps/desktop/src/`) gets zero sync logic. |
| Red line #4 | Plugins must NOT call `@tauri-apps/api` directly — wrap via `@repo/core/hooks` | crypto/REST Tauri invokes need a typed `useTauriInvoke`-style hook in core (PLUGIN_SDK §5.1 names it; **does not exist yet** in `packages/core/src/hooks/` — only `useWindow`). New core infra task. |
| Red line #3/#5 | Plugin↔plugin only via `@repo/core/events`; all payloads typed in `@repo/core/types` | `account:*` typed events as §3. |
| Red line #9 | `index.ts` is a plugin's only public surface; no deep imports | `plugin-account/src/index.ts` barrel; PRD §4.1 types go in `packages/plugin-account/src/types.ts` (plugin-local) — global types in `packages/core/src/types/`. |
| Red line #2 | No cross-plugin internal imports | plugin-account listens to `productivity:*`/`organizer:*`/`labels:*` (per PLUGIN_SDK §9.11) ONLY via EventMap, never importing those plugins. |
| Red line #12 | No runtime dynamic plugin loading; compile-time set, static import | plugin-account registered by a static import line in `main.tsx`. |
| SYS §9 | `lib.rs` config/registration only, no business logic; commands split by domain in `commands/<domain>.rs`; macOS code under `platform/macos/` with `#[cfg]` | Sync Rust: new `commands/crypto.rs` (+ `mod.rs` decl + `lib.rs` handler entry). Crypto core under new `src-tauri/src/crypto/` (`aad.rs`, `envelope.rs` per PRD §7.1.5). macOS Keychain access via `security-framework` under `platform/macos/`. |
| SYS §5 / capabilities | Tauri command names `<domain>_<verb>`; declared in plugin manifest `tauriCommands`; capability allowlist | `crypto_encrypt_for`, `crypto_unwrap_dek_for_device`, `crypto_wrap_dek_for_devices`, `crypto_recovery_sign` (PRD §5.2 FR-SY-75 / dev-plan §4.2). Allowlist scoped (FR-SY-75). |
| SYS §5.3 errors | Unified `AppError` enum; codes `E1xxx` system / `E2xxx` business / **`E3xxx` sync** / `E4xxx` AI | Sync error codes are `E3xxx` (PRD §7.6). `AppError` enum does not exist in Rust yet — current commands return `Result<(), String>`. New infra. |
| PLUGIN_MAP | Only Stable/Production plugins are dependable; Planned/In-Dev must be mocked | plugin-account/core-data start at **Planned**; everything depending on them must mock until Stable. PLUGIN_MAP has no row for account/core-data — add rows (SYS §10 step 5). |
| PLUGIN_SDK §7.2 | Plugins must be testable with NO Tauri / NO other plugin: zero direct `@tauri-apps/api`, in-memory event bus + `@repo/core-data/testing` repo mock | Sync test strategy: crypto via Rust `cargo test` + cross-impl CBOR/bip39 vectors (PRD §7.1.4 fixtures at `apps/desktop/src-tauri/tests/fixtures/cbor_aad_vectors.json`); plugin-account JS independently testable with mocked core. |
| SYS §7 / SYS §11 | Persistence currently localStorage `xai-desktop-layout`; SQLite is a *future* target ("不做数据库迁移" today) | `core-data` introduces the SQLite (SQLCipher) layer + `localStorage→SQLite` migration — this is net-new infra Sync's dev-plan §2 explicitly schedules in Phase 0 sub-stage 0.3. |

**Actual-vs-target reconciliation (important for the roadmap):** PLUGIN_SDK and the Sync PRD reference package names that DON'T match the current tree — `@repo/core-events`, `@repo/core-data`, `@repo/core-registry`, `@repo/plugin-*/register`. The **current** repo collapses events/registry/types into the single `@repo/core` package (subpath exports `./events`, `./registry`, `./types`) and organizer has no `register.ts`. The roadmap must decide per wave whether Sync (a) targets the current `@repo/core` subpath layout, or (b) drives the `core-*` package split. Recommend (a) for Phase 0 skeleton to avoid blocking on a monorepo re-split; treat `core-data` as a genuinely new package regardless.

---

## 5. Rust backend — current state vs. Sync needs

**Current (`apps/desktop/src-tauri/`):**
- `lib.rs`: `tauri::Builder` with `GridWindowsState` (Mutex<HashMap>), `invoke_handler![commands::window::{create,update,close}_grid_window]`, setup wires main/control windows + macOS config.
- `commands/mod.rs`: `pub mod window;` (only domain).
- `commands/window.rs`: 3 commands, return `Result<(), String>` (no typed error enum), `println!` logging.
- `platform/macos/`: NSWindow level / click-through (`window_ext.rs`).
- `Cargo.toml` deps: `tauri` (macos-private-api), `tauri-plugin-opener`, `serde`, `serde_json`; macOS: `cocoa`, `core-graphics`, `core-foundation`. **No** `argon2`, `aes-gcm`, `x25519`, `ed25519`, `hpke`, `ciborium`, `zeroize`, `bip39`, `rusqlite`/`sqlcipher`, `reqwest`, `security-framework`.
- `capabilities/default.json`: `core:*` + `opener:*` only.

**Sync adds (per PRD §3/§5.2/§7 + dev-plan §3/§4.2):**
- New `src-tauri/src/crypto/` module: `aad.rs` (deterministic CBOR via `ciborium` + custom canonical writer), `envelope.rs` (AEAD envelope), KeyVault (DEK + device_priv resident in Rust, JS gets opaque `key_handle: u32`, FR-SY-75), nonce-counter table.
- New `commands/crypto.rs`: `crypto_encrypt_for`, `crypto_unwrap_dek_for_device`, `crypto_wrap_dek_for_devices`, `crypto_recovery_sign` (+ register in `mod.rs` & `lib.rs` handler).
- Crypto crates: Argon2id, AES-GCM, X25519, Ed25519, HPKE, `ciborium`, `zeroize`, `bip39`, SQLCipher (local DB encryption FR-SY-74).
- macOS Keychain via `security-framework` under `platform/macos/` (KEK storage, FR-SY-09).
- Unified `AppError` thiserror enum with `E3xxx` sync codes (replaces ad-hoc `Result<(), String>`).
- Scoped Tauri capability for `crypto_*` (allowlist to plugin-account/core-data only).
- Test fixtures dir `src-tauri/tests/` with cross-implementation vectors.

---

## 6. Where Sync slots in (concrete create-map)

| Sync artifact | Path (to CREATE — does not exist) | Notes |
|---|---|---|
| Account/sync plugin (main home) | `packages/plugin-account/` | New package. Follow SYS §10 + PLUGIN_SDK §6/§8. `package.json` name `@repo/plugin-account`; `manifest.json`; `src/index.ts` barrel; `src/register.ts`; `src/types.ts` (PRD §4.1 TS types); `src/components/` (ConsoleView, SettingsSection — login/keys/sync-status UI); `src/hooks/`, `src/repo/`; `docs/{design,api,test,dev_log}.md`. PLUGIN_MAP row: status `Planned`. |
| Data access + REST driver | `packages/core-data/` | New package. Owns SQLite (SQLCipher) repo abstraction + sync coordination hooks + (Phase 4.5) REST driver for web. Phase 0 = local SQLite driver + sync adapter only (dev-plan §2 line 93–94). Provides `@repo/core-data/testing` in-memory repo for plugin tests (PLUGIN_SDK §7.2). |
| Rust crypto core | `apps/desktop/src-tauri/src/crypto/{aad.rs,envelope.rs,...}` | New module dir; declare `mod crypto;` in `lib.rs`. |
| Rust crypto commands | `apps/desktop/src-tauri/src/commands/crypto.rs` | Add `pub mod crypto;` to `commands/mod.rs`; add entries to `invoke_handler!` in `lib.rs`. |
| Crypto test vectors | `apps/desktop/src-tauri/tests/fixtures/cbor_aad_vectors.json` | PRD §7.1.4 — Rust/JS/Python cross-check, CI-gated. |
| EventMap extension | edit `packages/core/src/types/events.ts` | Add `account:*` keys (§3). |
| Tauri-invoke hook (infra) | `packages/core/src/hooks/` (new file, e.g. `useTauriInvoke.ts`) + export via `hooks/index.ts` | Red line #4 requires plugins not to import `@tauri-apps/api` directly; only `useWindow` exists today. |
| Capability scope | edit `apps/desktop/src-tauri/capabilities/` (new scoped capability file or extend default.json) | FR-SY-75 allowlist `crypto_*`. |
| Host registration | edit `apps/desktop/src/main.tsx` | Add `import '@repo/plugin-account/register';` (SYS §10 step 4). |
| Plugin map | edit `docs/PLUGIN_MAP.md` | Add rows: `account` (plugin) + `@repo/core-data` (core package), status `Planned`. |

**Phase ordering anchor (from `sync/dev-plan.md`):** Phase 0 sub-stage 0.3 (skeleton, ~18–24 work-days) = Supabase backend + end-to-end single-table sync + `localStorage→SQLite` migration + account register/login + per-device DEK wrap. Phase 4.8 = protocol hardening gate (TLA+/property tests BEFORE Phase 5 implementation). Phase 5 (~6–7 weeks) = full entity coverage + beta hardening. Console roadmap can only start after Sync sub-stage 0.3 skeleton is ready; Web only after Console Stable + Sync full (Phase 5).

---

## 7. Reference / source-of-truth files

- Constitution / red lines: `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/docs/SYSTEM_ARCHITECTURE.md`
- Plugin contract (manifest/registry/EventMap/commands/SOP): `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/docs/PLUGIN_SDK.md`
- Global plugin state machine: `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/docs/PLUGIN_MAP.md`
- Code boundaries: `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/CLAUDE.md` (§Code Boundaries)
- Sync PRD: `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/docs/planning/sub-prds/sync/PRD.md` (1792 lines; §3 key hierarchy, §5 FRs, §6 schema, §7 protocol)
- Sync dev-plan (phases/tasks/Rust command contracts): `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/docs/planning/sub-prds/sync/dev-plan.md` (§1 phases, §2 prereqs, §3 task breakdown, §4 interface contracts)
- Reference plugin (sample for new plugin): `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/packages/plugin-organizer/`
