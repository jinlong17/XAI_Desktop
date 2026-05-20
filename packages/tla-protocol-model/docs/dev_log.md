# tla-protocol-model — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Feature | tla-protocol-model |
| Status | BLOCKED |
| Executor | Codex serial autorun |
| Updated | 2026-05-19 04:26 PDT |

## Work Log

| Timestamp | Action | Verification | Next |
|---|---|---|---|
| 2026-05-19 04:26 PDT | Added `docs/spec/sync.tla`, `docs/spec/sync.cfg`, and model-check notes covering the six mandatory scenarios plus explicit account_commit_seq equivocation limitation. | Static scenario marker check passed; TLC jar downloaded; TLC execution blocked by missing Java Runtime. | Install Java and run `java -jar /tmp/tla2tools.jar -deadlock -workers 2 docs/spec/sync.tla`. |
