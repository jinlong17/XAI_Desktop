# P0-Foxtrot — Native DnD vs Transparent Click-Through Spike

**Feature**: P0-Foxtrot honest path provenance for `reveal_in_finder` / `open_path`
**Base commit**: `b3358ba` (codex/track-a-desktop-foundation)
**Phase**: Phase 1 (spike) — outcome drives the decision to enter Phase 2
**Author**: Claude Code, Track A (worktree-isolated)
**Date**: 2026-05-20

## 1. The five spike questions, answered

### Q1 — `WebviewWindowBuilder::disable_drag_drop_handler()` scope

The Tauri 2 API `disable_drag_drop_handler()` is a **per-webview** opt-out
defined on `WebviewWindowBuilder` and `WebviewBuilder`. It does NOT toggle
a global; it disables the native drag-drop OS handler for the specific
webview being built.

Sources:
- `~/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/tauri-2.11.2/src/webview/webview_window.rs:1029-1034` — `pub fn disable_drag_drop_handler(mut self) -> Self`
- `~/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/tauri-2.11.2/src/webview/mod.rs:973` — underlying webview builder method.

Configuration file knob: `tauri.conf.json` exposes the same flag as
`dragDropEnabled` (per-window, default `true`). Source:
- `~/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/tauri-utils-2.9.2/src/config.rs:1943-1947` — `pub drag_drop_enabled: bool` with `default = "default_true"` and serde alias `drag-drop-enabled`.

Practical consequence: **there is no "global enable / per-window disable"
mode toggle**. Each webview is independently configured. If a window is
built programmatically via `WebviewWindowBuilder` and never calls
`.disable_drag_drop_handler()`, the OS handler is attached and emits
`tauri://drag-enter` / `tauri://drag-over` / `tauri://drag-drop` /
`tauri://drag-leave` to that window's label.

### Q2 — Does `create_grid_window` configure `dragDropEnabled`?

No. `create_grid_window` builds each `grid_*` webview via
`WebviewWindowBuilder::new(...)` and never calls
`.disable_drag_drop_handler()`. Therefore `grid_*` windows already use
the Tauri default `drag_drop_enabled = true` and receive native
`tauri://drag-drop` events with absolute filesystem paths.

Citations:
- `apps/desktop/src-tauri/src/commands/window.rs:107-152` — `create_grid_window` body. The builder chain (`title` → `inner_size` → `position` → `transparent(true)` (gated) → `decorations(false)` → `shadow(false)` → `skip_taskbar(true)` → `resizable(false)` → `visible(true)` → `always_on_top(false)` → `build()`) has no `disable_drag_drop_handler()` call.
- `apps/desktop/src-tauri/tauri.conf.json` has a `windows` array but only declares the static `main` window (lines 14-32). The `control` window and all `grid_*` windows are spawned dynamically from Rust, so they inherit the Tauri builder default (`drag_drop_enabled = true`).
- `apps/desktop/src-tauri/src/lib.rs:128-159` — `control` window built without `.disable_drag_drop_handler()` either.

### Q3 — Native DnD on a `grid_*` window already works

Yes. The drop path is **already implemented end-to-end** in the codebase:

- `apps/desktop/src-tauri/src/commands/window.rs:107-152` builds each grid webview with the Tauri default (drag-drop enabled).
- `packages/plugin-organizer/src/OrganizerGridContent.tsx:318-326` listens to `TauriEvent.DRAG_DROP` and reads absolute paths off `event.payload.paths: string[]`.
- `packages/plugin-organizer/src/OrganizerGridContent.tsx:291-298` emits the absolute paths cross-window via `ORGANIZER_FILE_DROP_EVENT`.
- `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts:220-232` consumes `ORGANIZER_FILE_DROP_EVENT` on the `main` window and forwards `(gridId, absolute_paths)` to `OrganizerLayer.handleGridFileDrop`.

In other words, **the missing piece is NOT a wiring change to native DnD
on grid windows — that is already live**. The missing piece is that
`OrganizerLayer.handleGridFileDrop` (and the `main`-window drop path)
never invokes `register_path_bookmark`. So `reveal_in_finder` /
`open_path` for any item dropped into a Grid still fails with
`E3004 — no user-authorized bookmark`.

This is the production wiring P0 that Codex flagged in
`docs/workflow/roadmap/codex-reviews/p0-echo-bookmark-provenance/rerun-output.md`.

### Q4 — Drop on the click-through `main` window

The `main` window is configured with `setIgnoresMouseEvents_(YES)` in
`apps/desktop/src-tauri/src/platform/macos/window_ext.rs:48`. This NSWindow
flag causes AppKit to forward **all** mouse events (including drag-drop
sessions) to the window behind. Empirically and per Apple docs, a
click-through NSWindow does NOT receive `NSDraggingDestination` callbacks
at all — the events are routed to whatever is underneath (the Finder
desktop, in our case).

Consequence: **the `main` window CANNOT receive native drag-drop**,
regardless of whether `drag_drop_enabled` is true or false in tauri.conf.
The HTML5 listeners attached today in `useFileDrop` only fire because of
edge cases inside the WebView surface itself when keyboard-driven drag
gestures interact with the page; they have never produced absolute paths
because HTML5 `File.path` is not exposed.

Available options:

- **(a) Accept grid-only drops as the contract.** The `main` window
  becomes a pure visual overlay; the "drop on empty desktop to create a
  new Grid" gesture is not supported through the click-through window.
  The user must (i) drop into an existing Grid window, or (ii) use the
  control window's `+` button to create a Grid first, then drop into it.
- **(b) Add a hit-test "hot zone" on `main` that temporarily becomes
  non-click-through during a drag.** Requires a global drag-session
  detection mechanism (e.g. a Spaces-level NSDraggingDestination on the
  AI cube control window, then transition the main window to
  `setIgnoresMouseEvents_(NO)` for the duration of the drag, then
  restore on `dragExited` / `concludeDragOperation`). This is custom
  AppKit work that touches `platform/macos/window_ext.rs` and is
  arguably out of P0-Foxtrot's stated "stay disciplined" scope.
- **(c) Roll back G3-E3 to BLOCKED_EXTERNAL** and admit that honest
  provenance requires the G2.7 MAS sandbox bookmark store as the
  structural fix.

### Q5 — End-to-end reading of `tauri.conf.json`, `lib.rs`, `window.rs`

Read in full. Key conclusions:

- `tauri.conf.json:31` sets `"dragDropEnabled": false` ONLY for the static `main` window declaration. This is currently a no-op because the click-through NSWindow flag suppresses drag-drop entirely (see Q4). Leaving it as `false` documents the intent that `main` is not a drop target.
- `lib.rs:128-159` builds `control` without `.disable_drag_drop_handler()`. The control window is opaque, focusable, and could in principle receive drops — but its on-screen footprint is the 96x96 AI cube (`apps/desktop/src-tauri/src/lib.rs:135-136`), so it is not a viable user drop surface.
- `commands/window.rs:107-152` builds every `grid_*` window without `.disable_drag_drop_handler()`. These are the de-facto drop surfaces.
- `platform/macos/window_ext.rs:48` enforces `setIgnoresMouseEvents_(YES)` on `main`; `window_ext.rs:72` and `window_ext.rs:94` keep `control` and grid windows interactive.

## 2. Recommended path

**(a) + targeted bookmark wiring fix.** The current architecture is
**already** the "native DnD only fires on `grid_*` windows" design.
The bookmark P0 collapses to two changes, both inside the existing
event-routing seam:

1. Inside `OrganizerGridContent.handleFileDrop`, register every absolute
   path with `BookmarkRegistry` BEFORE emitting `ORGANIZER_FILE_DROP_EVENT`.
   (Cleanest: the grid window has direct IPC access via
   `useTauriInvoke`, and the paths are still in absolute form at this
   point.)
2. Inside `OrganizerLayer.handleGridFileDrop`, also register defensively
   — this is the main-window receiver of the cross-window event, and
   registering there ensures the bookmark survives even if a future
   refactor moves the IPC bridge.

The HTML5-based `useFileDrop` hook on the `main` window can stay as a
visual hint (drop-zone outline animation) but must NOT pretend to deliver
real paths. The hook should be retitled / clipped to "main-window visual
drag indicator" and stop calling `registerBookmark` with basenames. The
existing absolute-path flow through `OrganizerGridContent` is the only
honest provenance source we have today.

### Why this is the minimum honest fix

- **No `tauri.conf.json` change needed** — native DnD is already on for
  `grid_*` windows.
- **No `lib.rs` change needed** — `main` and `control` cannot receive
  drops anyway (click-through / footprint), so `.disable_drag_drop_handler()`
  is redundant.
- **No `window.rs` change needed** — grid windows already have it.
- **One real wiring fix**: register absolute paths from
  `OrganizerGridContent` (the only place that has them) before emitting
  cross-window. This is the change Codex's review asks for ("Wire a real
  production `FinderClient` into the path-first drop hook and prove the
  registration call is reached on actual user drop").

## 3. Impact on G1.2 SHIPPED + G1.4 invariants

**G1.2** (grid-shell-organizer-content split): SHIPPED status is reaffirmed
without modification. The recommended path does not touch
`OrganizerGridContent`'s public surface, does not change event names,
does not alter the `ORGANIZER_FILE_DROP_EVENT` payload shape, and does
not change which package owns the drop UI. The only addition is one
extra IPC call (`register_path_bookmark`) inside the existing
`handleFileDrop` callback before the existing `emit(ORGANIZER_FILE_DROP_EVENT)`
call. G1.2 invariants:
- Host owns native window providers + drag chrome — UNCHANGED.
- Organizer owns Grid business UI + cross-window state events +
  path-first drop wiring — STILL THE CASE (just one extra IPC call
  on the existing path).
- Public API surface (`OrganizerGridContent`) — UNCHANGED.

**G1.4** (scoped grid events): UNCHANGED. The recommended path uses the
same `ORGANIZER_FILE_DROP_EVENT` channel and the same `gridId` scoping
that landed in G1.4. No new events are introduced; no event scope is
changed.

**Transparent click-through (`main` window)**: UNCHANGED. No NSWindow
flag changes; no `setIgnoresMouseEvents_` toggle; no
`disable_drag_drop_handler` calls added or removed. The user-visible
click-through behavior is preserved bit-identically.

## 4. Decision

**Phase 2 is FEASIBLE on a narrower path than originally outlined.**

The original prompt anticipated a larger change set (toggle
`dragDropEnabled` globally + per-window-disable for `main`/`control` +
rewrite `useFileDrop` to listen on Tauri events). The spike shows that
**most of that work is already done**: `grid_*` windows already use
native DnD and `OrganizerGridContent.tsx` already consumes the absolute
paths. The remaining gap is purely **the bookmark-registration call on
the path that already has absolute paths**.

Recommended Phase 2 scope (minimum honest fix):

- `packages/plugin-organizer/src/OrganizerGridContent.tsx` — accept an
  optional `finderClient: FinderClient` prop and call
  `client.registerBookmark(path)` for each path in `handleFileDrop`
  before emitting `ORGANIZER_FILE_DROP_EVENT`.
- `apps/desktop/src/` GridWindow shell — construct a `FinderClient` via
  `createFinderClient(useTauriInvoke().invoke)` and pass it into
  `OrganizerGridContent`.
- `packages/plugin-organizer/src/OrganizerLayer.tsx` — defensive
  bookmark registration on the main-window-side receiver
  (`handleGridFileDrop`), constructing its own `FinderClient` via the
  Host's `useTauriInvoke`.
- `packages/plugin-organizer/src/hooks/useFileDrop.ts` — stop calling
  `registerBookmark` with basenames; rename the file/path semantics to
  "visual drag indicator" or remove the bookmark hook entirely.
  Existing HTML5 listeners stay only for the drop-outline animation on
  the `main` window (they don't deliver real paths anyway).
- Cargo integration test in `apps/desktop/src-tauri/src/commands/finder.rs`
  or a new `finder_bookmark_integration.rs` test module: exercise
  `register_path_bookmark` → `reveal_in_finder` through the public IPC
  surface (not via `insert_canonical`).
- Doc updates to `docs/contracts/tauri-commands-v0.md` §4 and the
  G3-E3 / G1.2 / G1.4 dev_logs noting that the bookmark registration is
  performed inside the Grid window (the only window with absolute
  paths), not on the `main` window.

The originally-anticipated changes to `tauri.conf.json`, `lib.rs`, and
`window.rs` are **not required** — those windows are already
correctly configured for our drop model.

## 5. Caveat — why we still keep the click-through `main` invariant

Even if a future iteration wants the "drop on empty desktop creates a
new Grid" UX, that requires (b) from §1 Q4: an AppKit transition that
temporarily disables click-through during an active drag. That work is
explicitly NOT in P0-Foxtrot's scope and would land as a separate
feature (e.g. `xai-g3.dnd-zone-hot-swap`) with its own review cycle.

## 6. Outcome

This spike clears Phase 2 to proceed under the narrowed scope described
in §4. The implementation will be committed under the
`fix(useFileDrop, OrganizerGridContent, OrganizerLayer): wire bookmark
registration on the native drag-drop path (P0 Foxtrot)` title (renamed
from the originally-suggested title because the actual file footprint
turned out to be JS + tests + docs only).
