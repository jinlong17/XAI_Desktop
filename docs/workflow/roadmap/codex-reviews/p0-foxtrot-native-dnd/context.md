Feature ID: P0-Foxtrot (Echo escalation closing)
Branch: codex/track-a-desktop-foundation
Commit under review: a8c847b (cherry-picked from worktree-agent-aca75a40250c7df46 commit 32c241c)

# Context

Codex round-4 returned BLOCKED on Echo's bookmark-provenance fix (`520737c`) because:
1. `OrganizerLayer.tsx` did not pass a `FinderClient` to `useFileDrop`, so `register_path_bookmark` was dead code in production.
2. `useFileDrop` reads HTML5 `File.name` (basename), so even if wired, the registration call would be rejected by `validate_user_path` (requires absolute path).

The Foxtrot sub-agent was tasked to spike whether native Tauri DnD can co-exist with transparent click-through windows, and if feasible, switch the DnD source to Tauri's `tauri://drag-drop` events.

# Spike outcome (read SPIKE-FINDINGS.md)

The sub-agent discovered the architecture was already correct:
- `grid_*` windows already accept native Tauri DnD by default (no `tauri.conf.json` change needed).
- `packages/plugin-organizer/src/OrganizerGridContent.tsx` ALREADY consumes `tauri://drag-drop` events and gets absolute paths.
- The `main` (transparent click-through) window CANNOT receive native DnD anyway because `setIgnoresMouseEvents_(YES)` routes drag sessions through to whatever is behind the window. This is a macOS AppKit constraint, not a bug.
- Therefore the original "switch from HTML5 to Tauri native" task was *wrong* — the production drop path already uses Tauri native and absolute paths. What was actually missing was the `register_path_bookmark` call inside the existing absolute-path flow.

# Files changed (14 = 12 modified + 2 new)

- packages/plugin-organizer/src/OrganizerGridContent.tsx (modified) — main fix point: bookmark registration injected into existing `handleFileDrop` flow.
- packages/plugin-organizer/src/OrganizerLayer.tsx (modified) — defensive registration on the cross-window event receiver.
- packages/plugin-organizer/src/hooks/useFileDrop.ts (modified) — updated for clarity / type hints.
- packages/plugin-organizer/src/hooks/useFileDrop.test.ts (new) — 4 new vitest cases.
- packages/plugin-organizer/src/finderClient.ts (modified)
- apps/desktop/src/windows/GridWindow.tsx (modified) — wires FinderClient through.
- apps/desktop/src-tauri/src/commands/finder.rs (modified) — replaces the `insert_canonical`-based test with IPC integration tests.
- apps/desktop/src-tauri/src/commands/bookmarks.rs (modified)
- apps/desktop/src-tauri/src/lib.rs (read for verification — no change)
- apps/desktop/src-tauri/tauri.conf.json (read for verification — no change)
- apps/desktop/src-tauri/src/commands/window.rs (read for verification — no change)
- docs/contracts/tauri-commands-v0.md (modified)
- docs/workflow/roadmap/codex-reviews/p0-foxtrot-native-dnd/SPIKE-FINDINGS.md (new) — full architectural analysis.
- docs/workflow/roadmap/codex-reviews/g3-organizer-batch/PROCESS-NOTE.md (modified)
- packages/grid-shell-organizer-content/docs/dev_log.md (modified) — G1.2 SHIPPED reaffirmed.

# What to evaluate

1. Is the production flow now honest? Specifically: when a user drops a file onto a Grid window, does the absolute path travel `Tauri native DnD → useFileDrop / OrganizerGridContent → finderClient.registerBookmark → BookmarkRegistry`? Cite the exact files/lines.
2. Did Foxtrot fix the Echo P0a (OrganizerLayer wiring)? It claims the wiring is now at OrganizerGridContent — confirm that ALL realistic production drop paths reach the registration call.
3. Did Foxtrot fix the Echo P0b (basename vs absolute path)? The claim is that the existing Tauri DnD path already provides absolute paths. Verify by reading useFileDrop / OrganizerGridContent.
4. Did Foxtrot address the Echo P1 (test sidesteps public API via `insert_canonical`)? The new tests should exercise `register_path_bookmark → reveal/open` through the IPC surface (Tauri's `get_ipc_response` JSON dispatcher).
5. Was G1.2 SHIPPED preserved? The transparent click-through behavior and the existing Organizer public API must not be disturbed.
6. Are there gaps the sub-agent declared upfront (e.g. Open-panel registration still TODO, in-memory registry still session-scoped)? Those are explicit non-goals; don't penalize.

# Verdict guidance

- **APPROVED**: production drop path reaches `register_path_bookmark` with absolute paths; integration test exercises the public IPC surface; G1.2 SHIPPED preserved.
- **REVISE**: production drop path reaches it for SOME drop UI but not all; or test still sidesteps the public surface.
- **BLOCKED**: bookmark registration is still unreachable from real user actions, OR transparent click-through is broken.

# Out of scope

- Open-panel registration wiring.
- Persistent bookmark store across restarts.
- macOS NSURL security-scoped bookmark (G2.7).
