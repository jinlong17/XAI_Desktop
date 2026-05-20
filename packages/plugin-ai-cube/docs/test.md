# plugin-ai-cube Test Notes

Run:

```bash
pnpm --filter @repo/plugin-ai-cube check-types
```

Manual checks:
- Send opens privacy gate.
- Secrets such as `password=abc` are redacted.
- Offline mode returns fallback text.
- Mock action buttons dispatch `ai-cube:mock-action`.
