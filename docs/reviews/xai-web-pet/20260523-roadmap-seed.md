# Roadmap Seed — xai-web-pet

> xai-web-console roadmap · feature #19 · wave W2 · Module
> Source PRD: web design/DESIGN.md §4.13 (Desktop Pet)
> Source Code: web design/pet.jsx (DesktopPet + PetPicker)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port the Desktop Pet: 8 original characters (Mochi mint ball / Pip bird / Sprout sapling / Lumi bulb / Drip droplet / Pebble stone / Star / Ember flame) with their distinct animations (bob / hop / sway / glow / still / twinkle / flicker), full-window draggable position persisted to `xai_pet_pos`, click → happy state + random tip bubble, "switch pet" link in bubble → opens PetPicker selector (with live preview of each), and rail-bottom 🐾 button toggles `petOn` (already wired via shell's event bus per xai-web-shell hard constraint).

## Hard constraints

- Pet identity persisted to `xai_pet_id`; pet position to `xai_pet_pos`.
- Each pet's animation MUST use CSS transforms (no JS animation loop) for battery friendliness.
- PetPicker preview MUST show the animation, not a static frame.
- Tip bubble strings bilingual (i18n key `pet.tips.<id>`).

## Acceptance signal

All 8 pets render with their correct animation, drag-anywhere persists position, click triggers happy state + bilingual tip, picker opens via bubble link, and rail toggle hides/shows the pet (via event bus from shell).

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-shell.
