---
name: security-skills-claude-code
description: Use when reviewing security posture or threat-modeling a change — drives Phoenix Security's upstream skill bundle (STRIDE, attack-surface enumeration, dependency CVE check). Triggers — security review, threat model, STRIDE, attack surface, dependency CVE.
---

# security-skills-claude-code

**Purpose.** Adopt the Phoenix Security upstream skill bundle when reviewing security posture or threat-modeling a change: STRIDE, attack-surface enumeration, dependency CVE check. The shim is description-triggered: agents load it when the conversation matches one of the trigger phrases below.

## Triggers

- "security review"
- "threat model"
- "STRIDE"
- "attack surface"
- "dependency CVE"

## How to deepen

The full SKILL.md and reference checklists live upstream at
<https://github.com/Security-Phoenix-demo/security-skills-claude-code>. Pull
the upstream content on demand when a task needs the deeper material — this
shim deliberately keeps the in-tree footprint small (no vendored upstream
content). See the vendor card for license, sync owner, and the recorded
upstream commit pin.
