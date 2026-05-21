---
name: skill-creator
description: Use when authoring, editing, or testing a SKILL.md — drives Anthropic's upstream skill-creator discipline (frontmatter schema, trigger-keyword phrasing, body structure, dry-run validation). Triggers — create a new skill, edit a skill, test a skill, skill.md frontmatter, skill author workflow.
upstream: https://github.com/anthropics/skills
license: Apache-2.0
vendor_card: docs/vendor-cards/anthropic-skills.md
---

# skill-creator

**Purpose.** Adopt Anthropic's reference workflow for authoring and editing SKILL.md files: frontmatter schema (name, description, trigger keywords), body structure, and the dry-run validation loop. The shim is description-triggered: agents load it when the conversation matches one of the trigger phrases below.

## Triggers

- "create a new skill"
- "edit a skill"
- "test a skill"
- "skill.md frontmatter"
- "skill author workflow"

## How to deepen

The full SKILL.md, reference assets, and validation scripts live upstream at
<https://github.com/anthropics/skills> (path: `skills/skill-creator`). Pull
the upstream content on demand when a task needs the deeper material — this
shim deliberately keeps the in-tree footprint small (no vendored upstream
content). See the vendor card for license, sync owner, and the recorded
upstream commit pin.
