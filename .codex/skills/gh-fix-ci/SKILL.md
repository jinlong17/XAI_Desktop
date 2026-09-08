---
name: gh-fix-ci
description: Use when a GitHub Actions workflow or PR check is failing — drives the upstream gh-fix-ci pattern (read job logs, isolate the failing step, propose minimal fix, re-trigger). Triggers — fix CI, failing GitHub Actions, PR checks failing, why is the workflow red, github actions log.
upstream: https://github.com/mxyhi/ok-skills
license: MIT
vendor_card: docs/vendor-cards/ok-skills.md
---

# gh-fix-ci

**Purpose.** When a GitHub Actions workflow or PR check is failing, follow a structured triage: read the job logs, isolate the failing step, propose the minimal fix, and re-trigger. The shim is description-triggered: agents load it when the conversation matches one of the trigger phrases below.

## Triggers

- "fix CI"
- "failing GitHub Actions"
- "PR checks failing"
- "why is the workflow red"
- "github actions log"

## How to deepen

The full SKILL.md and the canonical triage steps live upstream at
<https://github.com/mxyhi/ok-skills> (path: `gh-fix-ci`). Pull the upstream
content on demand when a task needs the deeper material — this shim
deliberately keeps the in-tree footprint small (no vendored upstream
content). See the vendor card for license, sync owner, and the recorded
upstream commit pin.
