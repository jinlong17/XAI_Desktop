# Discovery Review — desktop-full-macos-menu-polish

## Problem Framing

The shipped Phase 1 menu feature established the minimum native shell contract, but the current menu is still a partial implementation of a desktop-grade macOS menu:

- `app_menu.rs` has the required top-level sections, but `File`, `View`, and `Window` are still thin and do not yet present a fuller native action set
- the `Help` section already mixes support entries with quick-open shortcut controls, but there is no explicit menu-state model for when custom items should be disabled
- `lib.rs` now runs three adjacent native surfaces in the same startup path:
  - app menu
  - status bar/tray
  - global hotkey initialization
- the new work must improve the app menu without turning into tray/hotkey expansion or reopening the shipped config-store feature

Repo reality that shapes the plan:

- `apps/desktop/src-tauri/src/app_menu.rs` is the correct ownership boundary for native menu structure and custom menu item IDs
- `apps/desktop/src-tauri/src/app_config.rs` is already the host-owned persistence seam and can absorb tiny menu-support state only if strictly necessary
- `apps/desktop/src-tauri/src/commands/global_hotkey.rs` already exposes narrow menu-safe helpers for quick-open reset/disable, so no new hotkey surface is required
- `apps/desktop/src-tauri/src/commands/statusbar.rs` already demonstrates native item enable/disable updates, which is a good pattern reference for menu-state handling
- `apps/desktop/src-tauri/src/lib.rs` remains the correct place to compose startup wiring, but should stay a shell composition layer rather than becoming a menu-behavior dumping ground

## External Research

No external research required.

Reason:

- This feature does not involve new library selection, dependency choice, or open-source adoption
- The required work is an incremental refinement of existing Tauri-native menu/config/hotkey seams already present in this repo

## Candidate Options

### Option A — Keep menu structure static and only add a few more predefined items

Extend `app_menu.rs` with more standard `File` / `View` / `Window` actions, but keep custom menu items always enabled and continue routing all custom logic directly from the current event matcher.

Pros:

- Smallest code diff
- Minimal new state management
- Preserves the current shipped architecture

Cons:

- Does not satisfy the requirement for correct disabled states
- Lets `Help` keep growing ad hoc without a normalized command grouping
- Leaves diagnostics/support behavior harder to verify and reason about

### Option B — Add a native menu model with section ownership and explicit custom-item state

Keep menu construction in `app_menu.rs`, but formalize:

- section-by-section ownership (`File`, `Edit`, `View`, `Window`, `Help`)
- a stable ID set for custom menu items
- a small native menu-state updater for custom enabled/disabled behavior
- narrow integration with existing support seams such as config reset/reveal and quick-open helpers

Pros:

- Best match for the requirement
- Keeps native shell ownership in Rust
- Reuses existing stable host seams instead of inventing new ones
- Makes testing and manual verification clearer because custom items have explicit state rules

Cons:

- Slightly more implementation work than a pure static menu
- Requires careful boundary discipline so state logic does not spread into host business logic

### Option C — Push more of the menu behavior into guest-side JS or plugin events

Keep the Rust shell thin and depend on the web runtime or plugin event bridges to decide labels, enablement, and action dispatch for most custom items.

Pros:

- Could centralize some action knowledge in JS if the web UI already owns it
- Could make future app-shell actions feel more dynamic

Cons:

- Wrong direction for native shell ownership
- Risks moving business logic into host glue
- Adds coupling between startup-time shell behavior and web runtime readiness
- Harder to keep within the current Phase 1 boundary

## Recommendation

Choose Option B.

The menu is already native and already incremental, so the correct next step is not a rewrite. The right move is to polish the current Rust-owned menu into a fuller macOS contract with explicit custom-item IDs, grouped ownership by section, and a tiny state model for enabled/disabled behavior.

## Recommended Menu Shape

### App submenu

Keep the standard macOS app submenu as the first slot, owned purely by Tauri predefined actions:

- `About`
- `Services`
- `Hide`
- `Hide Others`
- `Show All`
- `Quit`

No custom business logic should live here.

### File

Recommended Phase 2 coverage:

- keep `Close Window`
- add only standard window-safe/native-safe items that clearly apply to the normal main window surface
- avoid any file-import/export ambitions unless a real existing command already exists

Reason:

- the app currently does not have a native document model
- this section should not become a back door for feature expansion

### Edit

Keep predefined native edit actions:

- `Undo`
- `Redo`
- `Cut`
- `Copy`
- `Paste`
- `Select All`

No custom work is needed here unless verify finds a real behavior issue.

### View

Recommended Phase 2 coverage:

- keep `Enter Full Screen`
- consider only minimal view/window presentation actions that apply to the normal main window
- do not add overlay-mode toggles, grid toggles, or debug panels that would reactivate deferred surfaces

### Window

Recommended Phase 2 coverage:

- `Minimize`
- `Zoom`/maximize equivalent via Tauri predefined item
- `Bring All to Front`
- optional separator plus narrow custom window reset/focus behavior only if it clearly belongs here instead of `Help`

### Help

Recommended custom item grouping:

- support:
  - `Reveal Config Folder`
- diagnostics/recovery:
  - `Reset Main Window State`
- tiny existing hotkey integration:
  - `Disable Quick Open Shortcut`
  - `Reset Quick Open Shortcut to Default`

Rule:

- keep hotkey items only because they already exist as stable tiny integrations
- do not add shortcut customization, picker UI, or broader hotkey commands in this feature

## Disabled-State Strategy

Custom item enablement should be explicit and native-side.

Recommended rules:

- `Reveal Config Folder`
  - enabled when the app config directory resolves successfully
  - disabled if path resolution fails or the host is in a degraded startup state
- `Reset Main Window State`
  - enabled only when the `main` window is present and reset can run safely
- `Disable Quick Open Shortcut`
  - enabled only when quick open is currently enabled
- `Reset Quick Open Shortcut to Default`
  - enabled when quick open is not already at the default active configuration, or when recovery from conflict/disabled state is meaningful

Implementation direction:

- create a small native menu snapshot/helper inside `app_menu.rs` or a tightly adjacent Rust module
- update only custom item state; leave predefined native actions to the platform
- use existing `global_hotkey` state and main-window presence as inputs
- do not create a new cross-window event protocol unless build discovers a real unmet need

## Dependency and Boundary Notes

- Upstream dependency:
  - `desktop-basic-macos-menu-config-store` SHIPPED
- Native shell ownership:
  - `apps/desktop/src-tauri/src/app_menu.rs`
  - `apps/desktop/src-tauri/src/lib.rs`
  - `apps/desktop/src-tauri/src/app_config.rs`
- Tiny integration-only dependencies:
  - `apps/desktop/src-tauri/src/commands/global_hotkey.rs`
  - `apps/desktop/src-tauri/src/commands/statusbar.rs` as a pattern reference, not as a scope target
- Forbidden expansion:
  - no new plugin business logic in `apps/desktop/src/`
  - no overlay/control/grid activation
  - no status bar redesign

## Risks

- Menu polish can silently widen into tray or hotkey product work if custom actions are not tightly bounded
- Native predefined items may behave differently from expectations across macOS versions, so manual hardware verification remains required
- Disabled-state logic can become brittle if it duplicates business state rather than depending on narrow native facts
- Misplacing custom items between `Window` and `Help` can make the menu feel inconsistent if section ownership is not documented

## Open Questions

- Should `Reset Main Window State` remain under `Help` as a support action, or move under `Window` as a window-recovery action? Recommendation: decide in build based on final menu grouping, but keep the command contract unchanged.
- Does the current Tauri menu API used in this repo expose every desired predefined window/view action directly, or will one or two custom handlers be needed? Recommendation: prefer predefined items first and add custom handlers only when a needed standard action is missing.
- Should quick-open item labels reflect runtime conflict/disabled state text? Recommendation: keep labels simple in this feature and use enabled/disabled state rather than verbose dynamic labels unless manual testing proves that insufficient.

## Phased Implementation Recommendation

### Phase 1 — Menu Section Polish

- Expand `app_menu.rs` into a fuller macOS-standard section layout
- Normalize custom item IDs and group ownership by section
- Keep predefined native items first wherever available

### Phase 2 — Native Action Wiring and Disabled States

- Add a small native custom-item state updater
- Reuse existing `main` window presence, config resolution, and quick-open runtime state as inputs
- Keep event handling in the Tauri shell
- Avoid new event buses or host-business seams unless strictly necessary

### Phase 3 — Diagnostics/Support Validation

- Finalize support/diagnostic item placement
- Add tests for menu section contract, custom item IDs, and enabled/disabled logic
- Record real-macOS manual residual checks for menu behavior, quick-open recovery items, and main-window actions
