# Handoff State Machine

This file tracks the serial workflow state between roles:
- **Analyzer**: Diagnose and plan (no code edits)
- **Implementer**: Apply code changes
- **Tester**: Run tests and validate
- **Summarizer**: Write PR summary (no code edits)
- **Shipper**: Commit and push

## Handoff Template

```markdown
## Handoff
- **Task**: [description of the current task]
- **Status**: [Analyzing | Implementing | Testing | Summarizing | Shipping | DONE]
- **Changes**: [list of changed files, or "none" if no code changes]
- **Commands / Checks**: [exact commands for next role to run]
- **Next**: [Analyzer | Implementer | Tester | Summarizer | Shipper | DONE]
- **Instruction**: [one-line instruction for the next role]
```

---

## Handoff
- **Task**: Initialize workflow system
- **Status**: DONE
- **Changes**: none
- **Commands / Checks**: none
- **Next**: Analyzer
- **Instruction**: Ready for first task. Describe the issue or feature to analyze.
