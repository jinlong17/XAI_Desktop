# Seed Brief — xai-web-ai-chat-real-llm-adapter

| 字段 | 值 |
|---|---|
| Roadmap | docs/workflow/roadmap/xai-web-console-gap-closure.md row #2 (W1) |
| 父 Brief | docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-gap-closure-source.md §Gap 1 |
| 父 ADR | ADR-0009 §D2-G3 |
| 候选包 | packages/xai-web-ai-chat + packages/plugin-web-ai-chat |

## Requirement (1-3 sentences)

Replace the Option A no-op `completeChat` adapter in `xai-web-ai-chat` (currently returns a bilingual demo line after 600-1200ms jitter) with a real LLM adapter that supports streaming tokens, error/retry/rate-limit UX, and user-provided API key storage. Add a Settings → AI pane (under `plugin-web-settings-rest`) that lets the user enter, validate, rotate, and delete their API key. CSP `connect-src` must be extended (new ADR row or amendment to ADR-0008).

## Hard Constraints

- API key storage MUST NOT be plaintext localStorage. Use IndexedDB with WebCrypto symmetric key derived from a session passphrase or a per-device key from `web-auth-device-session` (SHIPPED). Document the chosen path in `design.md`.
- Default adapter: Anthropic Claude Messages API (Sonnet/Opus/Haiku selectable per existing UI picker). Secondary: OpenAI-compatible endpoint (Groq, Together, etc.) via base URL override.
- Streaming via SSE; gracefully fall back to non-streaming if browser/CORS rejects.
- Rate-limit detection (HTTP 429) surfaces a typed `web:ai:rate-limited` event; UI shows retry-after countdown.
- Error UX: distinguish user-fixable (bad key, exhausted quota, network) from internal (5xx, malformed response) — different banner messaging.
- CSP impact: must extend `connect-src` allowlist; either amend ADR-0008 §D3 in-place OR write a new ADR (decide in feature-plan).
- Do NOT touch existing `claude.complete` no-op signature — replace internally; downstream consumers see same export shape.
- Per ADR-0009 D4: P0 work. cross-vendor verify mandatory.

## Acceptance Signal

- User can paste a valid Anthropic API key in Settings → AI, send a message in `/app/ai`, see streamed tokens render in real-time.
- Bad key shows clear error banner; rate-limit shows countdown; offline shows reconnect prompt.
- `xai_ai_*` storage keys do NOT contain raw API key (grep test).
- 100% existing 84 ai-chat plugin tests + 51 web tests still PASS.
- CSP report-uri receives 0 violations on happy-path message send.
- Verify Cross-vendor: Codex cold-read confirms key storage encryption is correct and CSP changes don't widen attack surface beyond the new LLM endpoints.
