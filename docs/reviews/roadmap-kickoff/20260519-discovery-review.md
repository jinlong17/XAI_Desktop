# Discovery Review — roadmap-kickoff

> sync-v1 roadmap · feature #1 · wave W0 · Phase 0.3 · Source PRD `docs/planning/sub-prds/sync/PRD.md` v0.6-DRAFT · dev-plan T-05
> Mode: Fresh · Executor: feature-plan (Claude Opus) · Date: 2026-05-19
> Job: 2a941912 (re-dispatch; prior attempt b8b06068 DEAD)
> Worktree: `.claude/worktrees/roadmap-w1-roadmap-kickoff` · base HEAD `18a51d1`

---

## 1. Problem framing

The Sync v1 feature set has no place to live. Every wave-0 row of the sync-v1 roadmap
edits one of: `packages/plugin-account/`, `packages/core-data/`, the `@repo/core`
`EventMap`, a core Tauri-invoke hook, the Rust `AppError` enum, `PLUGIN_MAP.md`, or
`main.tsx` static registration. None of these scaffolding seams exist in the live
worktree (verified against `18a51d1`). `roadmap-kickoff` is the foundational scaffold
that creates exactly those seams — no business logic, no crypto implementation, no
networking — so that every other wave-0 row can be started in parallel without merge
contention or "where does this go" ambiguity.

This is a structural-scaffold feature, not a product feature. Success = compile +
register + type-check + every downstream row unblocked.

### Live-code verification (orientation report re-confirmed against `18a51d1`)

The dated codebase-orientation report (2026-05-14) was re-verified file-by-file in
this worktree. All claims hold:

| Claim | Live verification | Status |
|---|---|---|
| `packages/plugin-account/` does not exist | tree inspection | CONFIRMED — must create |
| `packages/core-data/` does not exist | tree inspection | CONFIRMED — must create |
| `EventMap` has only organizer/app keys | `packages/core/src/types/events.ts` (15 lines, no `account:*`) | CONFIRMED |
| Only `useWindow` hook in core | `packages/core/src/hooks/index.ts` exports only `useWindow` | CONFIRMED — `useTauriInvoke` is net-new |
| `@repo/core` subpath layout (no `core-*` split) | `packages/core/package.json` exports `.` `./types` `./events` `./hooks` `./registry` `./store` | CONFIRMED — target current layout |
| Rust commands return `Result<(), String>`, no `AppError` | `commands/window.rs` lines 14, 73, 111 | CONFIRMED — `AppError` is net-new |
| `Cargo.toml` has zero crypto/http deps | `Cargo.toml` lines 20–29 | CONFIRMED (no new deps needed for this scaffold) |
| `main.tsx` has no plugin imports / no registration wiring | `apps/desktop/src/main.tsx` (39 lines, only window-router) | CONFIRMED |
| organizer has no `register.ts` | `Glob packages/plugin-organizer/src/register*` → none | CONFIRMED — see Decision D-4 |
| PLUGIN_MAP has no account/core-data rows | `docs/PLUGIN_MAP.md` | CONFIRMED — add `Planned` rows |
| `PluginRegistry.register(manifest, components)` singleton | `packages/core/src/registry/plugin-registry.ts` | CONFIRMED |
| Manifest schema is the simpler live one (not PLUGIN_SDK §2) | `packages/plugin-organizer/manifest.json` + `types/plugin.ts` | CONFIRMED — see Decision D-3 |

The orientation report is therefore treated as accurate. No drift found.

---

## 2. Candidate options

### Decision D-1 — Core package layout target

- **Option A (chosen): Target the current `@repo/core` subpath layout.** Add
  `account:*` to `packages/core/src/types/events.ts`; add `useTauriInvoke` to
  `packages/core/src/hooks/` exported via `@repo/core/hooks`. `core-data` is a
  genuinely new top-level package `packages/core-data/` (`@repo/core-data`).
- Option B: Drive the `core-events`/`core-data`/`core-registry` package split that
  PLUGIN_SDK references as a target spec.

**Tradeoff:** Option B aligns the tree to the long-term PLUGIN_SDK target but forces
a monorepo re-split as a Phase-0 prerequisite, blocking every wave-0 row on a risky
infra refactor. Option A keeps the blast radius minimal and is explicitly mandated by
the run's hard constraints. `core-data` is new regardless under both options.

**Recommendation: Option A.** Hard-constraint-mandated; minimal blast radius; the
`core-*` split is out of sync-v1 scope.

### Decision D-2 — Where the roadmap workflow dev_log lives

- **Option A (chosen):** Workflow four-piece docs at
  `packages/roadmap-kickoff/docs/{design,api,test,dev_log}.md`. `roadmap-kickoff` is
  a docs-only workflow anchor package (no `src/`, no build target) whose sole purpose
  is to host the reconcile-keyed Status Panel.
- Option B: Put the dev_log inside `packages/plugin-account/docs/`.

**Tradeoff:** `xai-roadmap-loop` reconcile mechanically reads
`packages/<slug>/docs/dev_log.md` keyed on the canonical roadmap slug
`roadmap-kickoff`. Option B would break reconcile (slug ≠ `plugin-account`) and is
also semantically wrong (this scaffold spans two packages + core + Rust + host, not
just plugin-account). Option A satisfies the reconcile contract and correctly models
a multi-package scaffold.

**Recommendation: Option A.** Final dev_log path:
`packages/roadmap-kickoff/docs/dev_log.md`. `plugin-account` still gets its own
standard plugin docs four-piece per the "Adding a New Plugin" convention, but those
are plugin-local docs, not the roadmap state machine.

### Decision D-3 — Manifest schema

- **Option A (chosen):** Follow the **live** manifest schema (the one
  `packages/plugin-organizer/manifest.json` uses and `types/plugin.ts` validates):
  `name, version, displayName, description, author, enabled, contentTypes, windows,
  events{emit,listen}, dependencies, tauriCommands`.
- Option B: Follow the richer PLUGIN_SDK §2 target schema.

**Tradeoff:** PLUGIN_SDK §2 is a target spec; the live `PluginManifest` TS interface
(`packages/core/src/types/plugin.ts`) is the actual runtime contract. A manifest that
doesn't match the live interface won't type-check / register. Per the documentation
contract, when `manifest.json` is touched it must stay aligned with actual runtime
loading behavior.

**Recommendation: Option A.** Match live runtime; note the PLUGIN_SDK gap in
`design.md` as a deferred reconciliation.

### Decision D-4 — Plugin registration pattern

- **Option A (chosen):** Static side-effect registration via an explicit import line
  in `main.tsx` that imports `@repo/plugin-account` and calls
  `PluginRegistry.register(manifest, components)`. Since organizer has **no**
  `register.ts` today and is not yet wired through the registry, `plugin-account`
  establishes the minimal viable pattern: a barrel `src/index.ts` exporting a
  `registerAccountPlugin()` function called once from `main.tsx`.
- Option B: Adopt the PLUGIN_SDK §6 `src/register.ts` side-effect module pattern
  (`import '@repo/plugin-account/register'`).

**Tradeoff:** Option B is the PLUGIN_SDK target but requires a new package subpath
export and a side-effect-import convention not yet used anywhere in the live repo —
introducing a convention divergence in a scaffold whose job is to be boring. Option A
keeps `index.ts` as the single public surface (red line #9) and uses an explicit
`registerAccountPlugin()` call, which is greppable and test-friendly. Red line #12
(no dynamic loading, compile-time static set) is satisfied either way.

**Recommendation: Option A** for the scaffold; record the `register.ts` adoption as
a deferred convention decision in `design.md` (a later wave may revisit when
organizer is also wired through the registry).

### Decision D-5 — `account:*` event payload shapes

Adopt the PLUGIN_SDK §4.1 shapes verbatim (re-confirmed by orientation report §3):

```ts
'account:logged-in':      { userId: string };
'account:logged-out':     { userId: string };
'account:sync-started':   { kind: 'push' | 'pull' };
'account:sync-completed': { kind: 'push' | 'pull'; durationMs: number };
'account:sync-failed':    { kind: 'push' | 'pull'; error: string };
```

These are **local-bus** signals (PRD §5.7 FR-SY-39: same-account multi-window
coordination stays on local events; only cross-device goes through Sync). No network
semantics on these keys. plugin-account is the sole owner/emitter; downstream
plugins may only listen.

### Decision D-6 — `AppError` thiserror enum scope (scaffold only)

- **Option A (chosen):** Introduce a unified `AppError` thiserror enum in a new
  `apps/desktop/src-tauri/src/error.rs` with the four code families
  (`E1xxx` system / `E2xxx` business / `E3xxx` sync / `E4xxx` AI) declared as
  documented variants, but for this scaffold **only the `E3xxx` sync variants are
  concretely populated** plus a generic `E1000` internal fallback. `commands/window.rs`
  is NOT migrated off `Result<(), String>` in this wave (out of code-boundary scope:
  the run boundary lists `src-tauri/src/` for the `AppError` enum, not a window.rs
  rewrite — keeping window.rs untouched avoids touching shipping behavior).
- Option B: Migrate all existing commands to `AppError` now.

**Tradeoff:** Option B is a larger blast radius touching working window commands
(red-line-adjacent: window behavior is macOS-hardware-sensitive). Option A delivers
the seam (`AppError` compiles, `E3xxx` codes exist, `From` impls + serde wiring ready)
without destabilizing existing commands. Downstream sync rows consume `AppError`;
a later wave can migrate window.rs.

**Recommendation: Option A.** Add `mod error;` to `lib.rs`; do not change the
existing `invoke_handler!` signatures.

### No external research required

This is purely internal scaffolding against an already-decided stack (Tauri 2 +
React 19 + the existing `@repo/core` infra). The crypto crate selection (Argon2id,
AES-GCM, X25519, HPKE, ciborium, etc.) is a **later wave's** technology decision,
explicitly out of scaffold scope — this row only plans the structural seams. No
library comparison, no WebSearch performed or needed.

---

## 3. Threat model binding (reflected in design.md §Threat Model)

- **T6 (malicious plugin / same-process), FR-SY-75:** This scaffold establishes the
  structural foundation for the `crypto_*` capability-allowlist + KeyVault
  opaque-handle architecture that all later crypto rows depend on. Concretely the
  scaffold plans (not implements):
  - A `KeyHandle` opaque-handle placeholder type (`KeyHandle(u32)` newtype in
    Rust `crypto` module seam; mirrored as an opaque branded `KeyHandle` TS type in
    `plugin-account/src/types.ts`) so JS never holds raw key material.
  - The capability-allowlist surface: a documented (commented, not yet enforced)
    placeholder in the capabilities layer naming the future `crypto_*`
    plugin-account/core-data-only scope. Enforcement is a later row; the seam is named
    here so later rows have a fixed target.
- **STRIDE Elevation-of-Privilege, TB-3 (JS↔IPC):** The new `useTauriInvoke` core
  hook is established as the **single JS→IPC chokepoint** (red line #4: plugins must
  not import `@tauri-apps/api` directly). The scaffold makes this the only sanctioned
  invoke path; downstream features harden it (argument validation, capability checks).

---

## 4. Recommendation (summary)

Scaffold-only, current-layout-targeted, minimal-blast-radius. Create two new packages
(`plugin-account` docs-and-barrel + `core-data` repo-abstraction skeleton), extend
core (`EventMap` + `useTauriInvoke`), add the Rust `AppError` E3xxx seam, wire static
registration in `main.tsx`, add `Planned` PLUGIN_MAP rows. Workflow state machine
lives at `packages/roadmap-kickoff/docs/dev_log.md` per the reconcile contract.

---

## 5. Risks & open questions

| ID | Risk | Mitigation |
|---|---|---|
| R-1 | Touching `main.tsx` could regress the window router | Add a single registration call ABOVE `ReactDOM.createRoot`; do not alter the `Router()` function body. Verify `pnpm dev` still routes. |
| R-2 | `AppError` serde shape must round-trip through Tauri IPC to JS without breaking existing `Result<(), String>` commands | Do not change existing command signatures (D-6 Option A). New enum derives `Serialize`; window.rs untouched. |
| R-3 | New workspace packages not picked up by pnpm/turbo | Follow the exact `package.json`/`tsconfig.json` shape of `plugin-organizer` (`exports` map `.` → `./src/index.ts`, extends `@repo/typescript-config`). Acceptance phase runs `pnpm install` + `check-types`. |
| R-4 | `core-data` depending on plugin-account or vice-versa would invert red line #8 | `core-data` depends only on `@repo/core`; `plugin-account` depends on `@repo/core` (+ later `@repo/core-data`). Documented in design.md dependency overview. |
| R-5 | Manifest drift vs PLUGIN_SDK target schema | Explicitly documented as a deferred reconciliation in design.md; live schema is authoritative for runtime. |
| R-6 | `register.ts` convention divergence (D-4) | Scaffold uses explicit `registerAccountPlugin()`; deferred-decision note in design.md so a later wave can unify. |
| OQ-1 | Should organizer also be wired through the registry in this wave? | Out of scope — code boundary excludes `plugin-organizer`. Flag for roadmap backlog. |
| OQ-2 | Exact `core-data` repo interface surface (SQLite vs in-memory testing mock) | Scaffold defines the abstract `Repo` interface + an in-memory stub only; SQLCipher driver is a later wave. Noted in api.md. |

---

## 6. Acceptance signal (plan phases converge here)

1. `packages/plugin-account/` and `packages/core-data/` build (`pnpm install` clean,
   `check-types` passes).
2. `account:*` keys type-check in `emitEvent`/`useEventListener` (a compile-time
   smoke usage in plugin-account proves it).
3. Rust `AppError` E3xxx enum compiles (`cargo check` in `src-tauri/`).
4. `PLUGIN_MAP.md` shows `account` and `@repo/core-data` as `Planned`.
5. `main.tsx` statically registers plugin-account; `pnpm dev` window routing
   unregressed.
6. Every wave-0 row can be started (seams exist at all boundary paths).
