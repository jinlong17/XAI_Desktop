# dev_log.md Template

> Copy this template when initializing a new feature or bugfix.

```markdown
# Dev Log — <Feature/Bug Title>

## Current Status
- **Workflow**: FEATURE_DEV | BUGFIX
- **Phase**: FEATURE_PLAN | FEATURE_REVIEW | FEATURE_BUILD | FEATURE_VERIFY | BUG_DIAGNOSE | BUG_FIX | BUG_VERIFY | SHIP
- **Status**: NOT_STARTED | IN_PROGRESS | NEEDS_REVIEW | APPROVED | BLOCKED | READY_FOR_VERIFY | FIX_READY | FIX_READY_FOR_VERIFY | READY_TO_SHIP | SHIPPED
- **Target**: <canonical feature/module name>
- **Title**: <feature title / bug title>
- **Current Step**: <current action>
- **Executor**: <tool / model identifier>
- **Updated**: <YYYY-MM-DD HH:MM>
- **Suggested Next**: <next_subagent>

## Phase Plan

| Phase | Description | Status | Commits |
|-------|-------------|--------|---------|
| 1 | ... | PENDING | — |
| 2 | ... | PENDING | — |

## Review Notes
<!-- Written by feature-review when REVISE -->

## Verification Summary
<!-- Written by feature-verify / bug-verify -->

## Work Log

### [YYYY-MM-DD HH:MM] <Action>
- Executor: <tool / model>
- Action: <what was done>
- Commits: <hash list, or —>
- Next: <suggested next subagent>
```

## State Flows

### Feature Dev
```
NOT_STARTED → IN_PROGRESS → NEEDS_REVIEW → APPROVED
→ IN_PROGRESS (build) → READY_FOR_VERIFY → READY_TO_SHIP → SHIPPED
```

### Bugfix
```
NOT_STARTED → IN_PROGRESS → FIX_READY
→ IN_PROGRESS (fix) → FIX_READY_FOR_VERIFY → READY_TO_SHIP → SHIPPED
```
