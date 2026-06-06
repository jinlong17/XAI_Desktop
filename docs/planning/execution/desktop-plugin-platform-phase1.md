# Desktop Plugin Platform Phase 1 — System Foundation

> Status: Phase 1 system foundation complete on `codex/plugin/platform-runtime-phase1`; Phase 2 common capability code path complete on `codex/plugin/common-capabilities-phase2`; next gate is real macOS host smoke before concrete plugin package unfreeze.
> Scope: system-level desktop plugin platform only. Do not build concrete clipboard / widgets / pet / meditation features in this phase.
> Module: `plugin`
> Branch: `codex/plugin/common-capabilities-phase2` -> `desktop-plugin-next` -> `desktop-next` only after operator confirmation

## 1. Classification Receipt

| Field | Value |
|---|---|
| Verdict | `plugin` · high confidence |
| Why | The work is desktop plugin platform runtime: multi-window / overlay / Plugin Center / Widget Host / SDK / instance lifecycle. Tauri code may physically live in `apps/desktop`, but product ownership is `plugin`. |
| Frozen? | Platform runtime / G1 active gate is not frozen. Phase 1 foundation and Phase 2 common capability code path are implemented. Concrete plugin packages remain paused until real macOS host smoke and operator confirmation. |
| Doc division | PRD: `docs/planning/sub-prds/plugin/PRD.md`; boundary: `docs/MODULE_BOUNDARIES.md`; SDK: `docs/PLUGIN_SDK.md`; dashboard: `docs/workflow/project/dashboard-state.json`; branch policy: ADR-0013. |
| Dashboard update | Product line `plugin` should show `Phase 2 common capability code path complete`, `desktop-plugin-next` as the long plugin line, current short branch `codex/plugin/common-capabilities-phase2`, and concrete plugin packages paused pending host smoke / operator confirmation. |

## 2. Goal

Make the desktop plugin platform usable before adding more plugin features.

The first usable milestone is now implemented as a system foundation:

1. App can open a lightweight Plugin Center.
2. Plugin Center can list built-in plugins from manifest-derived entries.
3. User can create one `PluginInstance`.
4. Host can create, focus, move, resize, hide, disable, and delete that instance.
5. Instance configuration persists in the device-local store and is ready for restart/manual smoke.
6. Concrete plugin packages remain mock-first until this platform path is proven.

## 3. Non-Goals

- Do not build the full clipboard product.
- Do not build the full widget catalog.
- Do not build pet AI / persona behavior.
- Do not add third-party plugin marketplace or remote install.
- Do not sync plugin instance state to the account cloud by default.
- Do not merge Web changes directly into `dev`.
- Do not touch `desktop-next` or `dev` without operator confirmation.

## 4. Phase Order

### Phase 1A — Contract and Registry

| Step | Output | Acceptance |
|---|---|---|
| P1A-1 | `PluginInstance`, `PluginCenterEntry`, `AddToDesktopRequest`, and lifecycle types move from docs-only to code contract | Typecheck passes; fixture proves manifest status and instance defaults |
| P1A-2 | Manifest-to-center adapter | Stable organizer is available; planned packages show unavailable / planned; disabled manifests do not mount automatically |
| P1A-3 | Device-local instance store | create / update / disable / hide / delete / migration tests pass |

### Phase 1B — Host Bridge

| Step | Output | Acceptance |
|---|---|---|
| P1B-1 | Generic plugin window adapter over existing Tauri window commands | create / close / focus / move / resize commands have label allowlist and typed errors |
| P1B-2 | Placement and behavior model | opacity, click-through, pinned, all-spaces, size, and display fields are stored even if some are no-op fallback at first |
| P1B-3 | Manual native smoke plan | Real macOS smoke checklist exists before claiming runtime complete |

### Phase 1C — Plugin Center MVP

| Step | Output | Acceptance |
|---|---|---|
| P1C-1 | Plugin Center shell window | App can open/focus Plugin Center from a host entry point |
| P1C-2 | Built-in plugin list | Organizer appears as shipped; widgets / clipboard / pet appear as planned or unavailable |
| P1C-3 | Add-to-desktop flow | One low-risk sample entry creates a persisted instance; restart restores it |
| P1C-4 | Instance management | enable / disable / hide / delete / reset position actions are covered by tests |

### Phase 1D — Documentation and Dashboard Closeout

| Step | Output | Acceptance |
|---|---|---|
| P1D-1 | PRD / SDK / module map updated with real implementation status | No doc still says the entire plugin line is frozen |
| P1D-2 | Dashboard refreshed | Product line shows platform runtime progress and package paused status |
| P1D-3 | Release log entry | Verification and risk are recorded without claiming user-facing plugin features shipped |

### Phase 1 closeout evidence (2026-06-06)

| Step | Commit | Current result |
|---|---|---|
| P1A-1 | `ed9c10e` | `PluginInstance`, `PluginCenterEntry`, `AddToDesktopRequest`, config and lifecycle types landed in `packages/core`. |
| P1A-2 | `78d7b86` | Manifest-to-center adapter maps registered plugins into center entries; planned/disabled entries do not auto-mount. |
| P1A-3 | `64c6434` | Device-local instance store supports create / update / enable / disable / hide / delete / migration. |
| P1B-1 | `8958966` | Generic plugin window adapter wraps grid window commands with typed snapshots and source allowlist. |
| P1B-2 | `ec4f2d3` | Placement / behavior / style model carries opacity, click-through, pinned, all-spaces, size, display and Space fields; unsupported native fields report no-op fallback in `nativeApplied`. |
| P1B-3 | `d185463` | Native smoke checklist exists for create, move, resize, focus, close, restart restore, multi-display / Space, click-through and pin fallback. |
| P1C-1 | `201e8cf` | App host can open/focus the Plugin Center shell window. |
| P1C-2 | `68957f9` | Built-in catalog lists organizer as addable and planned plugin families as locked/unavailable. |
| P1C-3 | `bf7ab16` | Plugin Center add flow creates a low-risk persisted instance and creates a window through the adapter. |
| P1C-4 | `5a410de` | Instance actions cover enable, disable, hide, delete, reset position, size preset, opacity and style mode. |

Phase 1 completion means the platform runtime foundation and governance docs are closed. It does not mean clipboard, widgets, pet, meditation, quick bookkeeping, time tracking, task glance, calendar glance, sticky notes, folder widgets or shortcut widgets are feature-complete. Those remain Phase 2/3 work.

## 8. Phase 2 Progress

| Step | Output | Status |
|---|---|---|
| P2-1 | Restart restore for enabled instances | Complete: `restoreEnabledPluginInstancesOnDesktop()` loads device-local instances and recreates windows only for `enabled` instances. |
| P2-2 | Native fallback display | Complete: `summarizePluginWindowNativeApplication()` and Plugin Center show applied / fallback / not-requested state for placement, size, opacity, click-through, pinned and all-spaces. |
| P2-3 | Capability denial display | Complete: `summarizePluginWindowCapabilityError()` and Plugin Center show code, severity, recoverable state and capability scope for denied or failed window lifecycle commands. |
| P2-4 | Pin / click-through / all-spaces / opacity native application | Complete: grid commands accept optional `native` options, Rust applies click-through / pinned / all-spaces / opacity, and snapshots report `nativeApplied`. |
| P2-5 | Low-risk sample widget complete flow | Complete: Plugin Center exposes host-local `sample-widget`; AddToDesktop persists the instance, opens a grid window and GridWindow renders sample content from the device-local instance store. |
| P2-6 | Real macOS host smoke gate | Pending: checklist refreshed in `docs/reviews/desktop-plugin-platform-runtime/20260606-native-window-smoke-checklist.md`; desktop typecheck preflight is unblocked, but build/dev smoke still requires an operator environment with `pnpm` and real macOS manual evidence. |

## 5. Required Interfaces

| Interface | Owner | Notes |
|---|---|---|
| `PluginInstance` | `plugin` contract | Schema versioned; default `syncScope: device-local` |
| `PluginCenterEntry` | `plugin` contract | Derived from manifest plus maturity/status registry |
| Window create / focus / close / update | host physical implementation, `plugin` product ownership | Only host can call Tauri / AppKit; plugin packages consume typed bridge |
| Placement / style / behavior store | `plugin` | Must preserve disabled instance config |
| EventMap | shared core | Use typed events for cross-plugin coordination; no direct sibling plugin imports |
| Native command allowlist | `app` host | Runtime denial must remain explicit and tested |

## 6. Small-Step Commit Flow

Use this for every implementation slice:

1. Start from the right branch:
   - If long branch exists: branch from `desktop-plugin-next`.
   - If it does not exist: ask operator to create it from the agreed `desktop-next` / `dev` base.
   - Short branch pattern: `codex/plugin/<small-scope>`.
2. Before editing:
   - Run `git status --short --branch`.
   - Identify unrelated dirty files and do not stage them.
   - Classify the slice as `plugin` and name whether it is platform runtime or concrete plugin package.
3. Edit one system ability only:
   - Good: `PluginInstance` store only.
   - Good: generic plugin window adapter only.
   - Bad: window adapter + Widget Host UI + pet feature in one commit.
4. Verify locally:
   - Typecheck the touched package.
   - Run targeted tests for the touched package.
   - For host/Tauri changes, run `pnpm --filter desktop build` and relevant cargo tests.
   - For dashboard/docs changes, run `pnpm dashboard` and dashboard verifiers.
5. Stage exact files:
   - Use `git add <explicit files>`.
   - Run `git diff --cached --check`.
6. Commit with this body:

```text
feat(plugin-platform): <one system ability>

Why:
- <the platform dependency this removes>

What:
- <the concrete contract / host / test change>

Scope:
- <exact module boundary; note App host vs plugin ownership split if needed>

Risk:
- <native window, storage, migration, manual smoke, or none>

Docs:
- <docs updated or not needed>

Tests:
- <commands and results>
```

7. Push the short branch:
   - `git push -u origin codex/plugin/<small-scope>`
8. Only merge to `desktop-plugin-next` after feature-verify or an equivalent review says READY.

## 7. Overall Goal Prompt

Copy this into a fresh Codex session when you want to start the ordered development run:

```text
Goal:
推进 XAI Desktop 的桌面插件平台 Phase 1 系统底座，不做具体插件功能堆叠。

Module classification:
- Product module: plugin
- Scope type: platform runtime / G1 active gate
- Not concrete plugin package work

Branch:
- Use `codex/plugin/platform-runtime-phase1` as the short branch.
- Base it from `desktop-plugin-next` if it exists.
- If `desktop-plugin-next` does not exist, stop and ask operator to confirm the base from `desktop-next` or current `dev`; do not create or touch `dev` without confirmation.

Primary docs:
- docs/MODULE_BOUNDARIES.md
- docs/PRODUCT_MODULE_MAP.md
- docs/PLUGIN_MAP.md
- docs/PLUGIN_SDK.md
- docs/planning/sub-prds/plugin/PRD.md
- docs/planning/execution/desktop-plugin-platform-phase1.md
- docs/adr/0013-branch-sync-governance.md

Objective:
Build the system-level desktop plugin platform in small verified commits:
1. Typed PluginInstance / PluginCenterEntry / AddToDesktop contract.
2. Device-local plugin instance store and lifecycle.
3. Generic plugin window adapter over host/Tauri commands.
4. Plugin Center MVP shell and built-in plugin list.
5. Add-to-desktop flow for one low-risk sample entry.
6. Instance actions: add, delete, enable, disable, hide, pin, move, resize, opacity/style.
7. Dashboard and release-log update after each visible platform increment.

Hard boundaries:
- Do not implement concrete clipboard/widgets/pet/meditation product features in Phase 1.
- Do not rebuild Web modules as desktop plugins.
- Do not import sibling plugin internals; use index.ts, manifest, registry, and @repo/core/events.
- Plugin package entities default to syncScope: device-local; account-sync requires a separate D4 gate.
- Tauri/AppKit commands may live in apps/desktop host, but product ownership remains plugin platform when the intent is multi-window/overlay/widget runtime.
- Do not merge Web directly into dev; Web-to-App sharing must go through D3.

Small-step commit rule:
- One commit = one system ability.
- Commit body must include Why / What / Scope / Risk / Docs / Tests.
- Stage exact files only.
- Run git diff --cached --check before every commit.

Verification expectation:
- For TS packages: targeted check-types + tests.
- For desktop host changes: pnpm --filter desktop build plus relevant cargo tests.
- For dashboard/docs changes: pnpm dashboard plus dashboard verifiers.
- Manual macOS smoke is required before claiming window runtime complete.

Output:
- Keep a running dev_log or review note with each step, commands, pass/fail, and remaining blockers.
- Stop after each major phase with a clear handoff before moving to concrete plugin packages.
```
