# XAI Desktop Progress Snapshot

> This is the single source of truth for current project progress.
> Last Updated: 2026-03-02

---

## Current Stage

The project is in a **stabilization + architecture decision** phase:

- Core desktop interaction foundation is implemented.
- File drop flow is implemented with HTML5 drag/drop fallback.
- Main blocker remains macOS window level and desktop click-through behavior.

---

## Completed

### Core Experience
- Transparent desktop host window (Tauri + macOS private API enabled).
- Grid system (`useGridSystem`, `SmartContainer`) with drag/resize/fold/lock and persistence.
- Organizer layer orchestration (`OrganizerLayer`) in multi-window mode.
- AI entry and settings panel (`AiCube`, `SettingsPanel`) integrated.

### File Drop
- `useFileDrop` hook exists and is wired in organizer flow.
- Main window file drop can create a new grid when no target grid is found.
- Grid window drop path can append dropped files into target grid state.

---

## In Progress / Blocked

### Critical Blocker
- **Desktop click-through vs interactive capture conflict on macOS window levels**.
  - Window at normal level can interact, but blocks desktop icon clicks.
  - Window at very low level avoids blocking, but loses visibility/interaction.
  - Requires architecture choice, not only local code patching.

---

## Risk Notes

- Some historical docs still describe removed or paused `efficiency` modules.
- Multiple documents use outdated absolute paths and old pre-migration file links.
- Several "final verification" docs are checklists without executed result records.

---

## Next Decision

Choose one primary strategy for desktop-level UX:

1. Multi-window widget architecture (recommended practical path).
2. Mode-switching interaction model (quick and stable fallback).
3. Native desktop extension direction (highest effort, best deep integration).

---

## Canonical References

- Development status: `docs/development/PROGRESS_SNAPSHOT.md` (this file)
- Architecture baseline: `docs/architecture/ARCHITECTURE_AND_DEV_GUIDE.md`
- Technical deep dive: `docs/development/TECHNICAL_STATUS.md`
- Historical implementation reports: `docs/reports/`
- Historical test traces: `docs/testing/`
