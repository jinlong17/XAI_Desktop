---
name: codebase-explorer
description: Use when orienting in an unfamiliar codebase or building an architecture map — drives the upstream codebase-explorer pattern (read entry points, map module graph, surface conventions, produce orientation report). Triggers — explore this codebase, orientation map, architecture review, where does X live, onboard me to this repo.
---

# codebase-explorer

**Purpose.** Provide a repeatable orientation pass over an unfamiliar codebase: read the entry points, map the module graph, surface naming/architecture conventions, and produce a short orientation report the user can act on. The shim is description-triggered: agents load it when the conversation matches one of the trigger phrases below.

## Triggers

- "explore this codebase"
- "orientation map"
- "architecture review"
- "where does X live"
- "onboard me to this repo"

## How to deepen

The full SKILL.md and reference checklists live upstream at
<https://github.com/quicksilversurfer/codebase-explorer>. Pull the upstream
content on demand when a task needs the deeper material — this shim
deliberately keeps the in-tree footprint small (no vendored upstream
content). See the vendor card for license, sync owner, and the recorded
upstream commit pin (the upstream license is recorded as MIT per README
attestation at the pinned commit; vendor card carries the evidence).
