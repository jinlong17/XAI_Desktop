---
name: composition-patterns
description: Use when a React component starts growing boolean props or when sharing logic across siblings — drives Vercel's upstream composition-patterns discipline (compound components, render props, slot patterns instead of boolean-prop proliferation). Triggers — react composition, compound components, boolean prop proliferation, render prop pattern, slot pattern.
---

# composition-patterns

**Purpose.** When a React component starts accreting boolean props (`hasFooter`, `showHeader`, `withDivider`, …) or when logic needs to be shared across siblings, reach for compound components / render props / slot patterns instead. The shim is description-triggered: agents load it when the conversation matches one of the trigger phrases below.

## Triggers

- "react composition"
- "compound components"
- "boolean prop proliferation"
- "render prop pattern"
- "slot pattern"

## How to deepen

The full SKILL.md and reference component sketches live upstream at
<https://github.com/vercel-labs/agent-skills> (path:
`skills/composition-patterns`). Pull the upstream content on demand when a
task needs the deeper material — this shim deliberately keeps the in-tree
footprint small (no vendored upstream content). See the vendor card for
license, sync owner, and the recorded upstream commit pin.
