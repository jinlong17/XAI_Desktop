# roadmap-kickoff — Design Snapshot

> Decision snapshot only. Full reasoning: `docs/reviews/roadmap-kickoff/20260519-discovery-review.md`.

## Identity

- **Workflow**: FEATURE_DEV
- **Target (roadmap slug)**: `roadmap-kickoff`
- **Title**: Sync v1 foundational scaffold (plugin-account + core-data + shared infra)
- **Roadmap**: sync-v1 · feature #1 · wave W0 · Phase 0.3 · dev-plan T-05
- **Source PRD**: `docs/planning/sub-prds/sync/PRD.md` v0.6-DRAFT
- **Naming rationale**: `roadmap-kickoff` is the canonical roadmap slug for the
  foundational scaffold that unblocks every other wave-0 row. It is a multi-package
  scaffold, not a single plugin slice, so it is also the workflow-state anchor.

## Selected Options

| Decision | Selected | One-line rationale |
|---|---|---|
| D-1 Core layout | A — target current `@repo/core` subpath layout | Hard-constraint mandated; minimal blast radius; no `core-*` split |
| D-2 dev_log location | A — `packages/roadmap-kickoff/docs/dev_log.md` | reconcile is keyed on the roadmap slug; scaffold spans many packages |
| D-3 Manifest schema | A — live `PluginManifest` schema (organizer's) | Live TS interface is the runtime contract; PLUGIN_SDK §2 is deferred target |
| D-4 Registration | A — explicit `registerAccountPlugin()` from `main.tsx` | `index.ts` single surface (red line #9); greppable; `register.ts` deferred |
| D-5 Event payloads | A — PLUGIN_SDK §4.1 shapes verbatim | Matches PRD §5.7 FR-SY-39 local-bus semantics |
| D-6 AppError scope | A — new `error.rs`, E3xxx populated, window.rs untouched | Deliver the seam without destabilizing shipping window commands |

- **Review Doc**: `docs/reviews/roadmap-kickoff/20260519-discovery-review.md`
- **Review Date**: 2026-05-19
- **Status when written**: NEEDS_REVIEW (awaiting feature-review)

## Frozen Assumptions

1. Live `@repo/core` exposes subpaths `.` `./types` `./events` `./hooks`
   `./registry` `./store`. Event types: `packages/core/src/types/events.ts`. Event
   runtime: `packages/core/src/events/{emitter,listener,index}.ts`. Hooks barrel:
   `packages/core/src/hooks/index.ts` (only `useWindow` today).
2. Live `PluginManifest` interface = `packages/core/src/types/plugin.ts`
   (`name, version, displayName, description, author, enabled, contentTypes,
   windows, events{emit,listen}, dependencies, tauriCommands`).
3. `PluginRegistry.register(manifest, components)` is the singleton in
   `packages/core/src/registry/plugin-registry.ts`.
4. Existing Rust commands return `Result<(), String>`; no `AppError` exists yet.
   `Cargo.toml` has zero crypto/http deps and **none are added by this scaffold**.
5. `main.tsx` is a 39-line window router with no plugin imports today.
6. PLUGIN_MAP has no account/core-data rows; status vocabulary includes `Planned`.
7. This is a scaffold: zero crypto implementation, zero networking, zero SQLite
   driver. Only structural seams.

## Dependency Overview

```
Host (apps/desktop/src/main.tsx)
  └─ imports @repo/plugin-account  →  calls registerAccountPlugin()
                                          │
@repo/plugin-account ── depends on ──> @repo/core   (events, hooks, registry, types)
        │                              (later: @repo/core-data — mocked until Stable)
        └─ src/index.ts barrel (only public surface, red line #9)

@repo/core-data ── depends on ──> @repo/core only   (never plugin-account; red line #8)

Rust: apps/desktop/src-tauri/src/error.rs (AppError)  ←  mod error; in lib.rs
        (existing commands/window.rs left on Result<(),String>; not migrated)
```

- Dependency direction (red line #8): `Host → Plugin → Core`. `core-data` →
  `core` only. Never reversed.
- Plugin↔plugin only via `@repo/core/events` (red line #3). No deep imports
  (red line #9). No `@tauri-apps/api` in plugins (red line #4 — use
  `useTauriInvoke`). No dynamic loading (red line #12 — static registration).

## Threat Model

- **T6 / FR-SY-75 (malicious plugin, same-process):** scaffold plans the structural
  seams only —
  - `KeyHandle` opaque-handle placeholder: Rust newtype `KeyHandle(u32)` seam in a
    new `src-tauri/src/crypto/mod.rs` placeholder module; mirrored TS branded type
    `KeyHandle` in `plugin-account/src/types.ts`. JS never holds raw key material.
  - Capability-allowlist surface: a documented (commented placeholder) marker for
    the future `crypto_*` plugin-account/core-data-only scope. Enforcement is a
    later row; the seam is named so later rows have a fixed target.
- **STRIDE EoP / TB-3 (JS↔IPC):** `useTauriInvoke` (in `packages/core/src/hooks/`,
  exported via `@repo/core/hooks`) is the single sanctioned JS→IPC chokepoint.
  Plugins must not import `@tauri-apps/api` directly. Downstream rows harden it.

## Deferred reconciliations (explicitly out of this scaffold)

- PLUGIN_SDK §2 richer manifest schema vs live schema — defer; live is authoritative.
- PLUGIN_SDK §6 `src/register.ts` side-effect pattern — defer; scaffold uses explicit
  `registerAccountPlugin()`. Revisit when organizer is also registry-wired.
- `core-events`/`core-registry` package split — out of sync-v1 scope entirely.
- Migrating `commands/window.rs` to `AppError` — later wave.
- SQLCipher / REST driver inside `core-data` — later wave (scaffold = abstract Repo
  interface + in-memory stub only).
- Crypto crate selection (Argon2id/AES-GCM/X25519/HPKE/ciborium) — later wave's
  technology decision; not in scaffold scope.
