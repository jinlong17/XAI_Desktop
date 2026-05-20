# plugin-ai-cube Dev Log

## 2026-05-20

Plan:
- Build mock conversation scaffold.
- Add privacy gate and redaction stub.
- Add local cost and latency/offline fallback controls.

Updates:
- Added conversation hook, message/input/suggestion components, privacy dialog, cost guard, and offline fallback.
- 2026-05-20 Track D: added Repository v0 adapters/providers for conversation history and daily cost usage, retained local fallback behavior, and passed `pnpm --filter @repo/plugin-ai-cube check-types`.
