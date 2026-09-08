# Roadmap Seed — xai-web-shell

> xai-web-console roadmap · feature #5 · wave W1 · Foundation
> Source PRD: web design/DESIGN.md §3 (信息架构), §4.14 (Avatar Menu), §7 (个性化与主题)
> Source Code: web design/shell.jsx (AppRail + Topbar + AvatarMenu), web design/app.jsx (root state + useEffects)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port the App root + AppRail + Topbar + AvatarMenu into the new build form. The shell owns: module-switching state, lang/theme/density/font-scale/accentHue/railPos/bgTone/petOn root state with their useEffects that mutate `data-*` attributes on `<html>`, drag-reorderable rail items (xai_rail_order), 4-direction rail layout (Left/Right/Top/Bottom Dock), avatar menu with direction-aware popover position, and the EN/中文 + Light/Dark/System + Comfortable/Compact + Settings-icon controls in the Topbar.

## Hard constraints

- Shell must NOT import any module file directly — modules register via a slot/registry pattern so the rail can render without taking a wave-2 dep.
- Drag-reorder for rail items must persist to `xai_rail_order` (DESIGN.md §9.2) and survive reload.
- Avatar-menu popover position must follow DESIGN.md §4.14 direction rules (Left=顶右展开, Right=顶左展开, Top=左下展开, Bottom=左上展开).
- Pet toggle button at rail bottom must fire the `pet.toggle` event on the event bus, not direct-call pet code.
- Search input ⌘K shortcut is a placeholder per DESIGN.md §11; do not implement the search panel here.

## Acceptance signal

App boots to a working shell at apps/web/src/, modules can register via the slot, switching between them updates the URL/route, all 4 rail positions render correctly, the avatar menu opens in the right corner per position, and reload preserves rail order + railPos + theme + density.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-build-form-adr, xai-web-tokens-and-i18n, xai-web-persistence-contract, xai-web-event-bus.
