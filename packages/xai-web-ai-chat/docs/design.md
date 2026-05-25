# Design Snapshot — xai-web-ai-chat

## Decision header

| Field | Value |
|---|---|
| Selected Option | **Option A** — typed no-op `claudeAdapter` returning bilingual demo line after 600–1200 ms jitter |
| Review Doc | `docs/reviews/xai-web-ai-chat/20260523-discovery-review.md` |
| Review Date | 2026-05-23 |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console.md` row #18 (W2c · Module) |
| Source PRD | `web design/DESIGN.md` §4.1 (AI Chat) |
| Source Code | `web design/module-ai.jsx` (299 LOC) + `web design/layout.css` lines 3826–4457 |
| Target Package | `packages/plugin-web-ai-chat/` → `@repo/plugin-web-ai-chat` |
| ADR Anchor | `docs/adr/0007-xai-web-console-build-form.md` §S4 (port-map row "module-ai.jsx") + §S5 (JSX→TSX rules) + §S6 (Vite SPA build form) + §S8 (storage-key reservations — `xai_ai_convos` / `xai_ai_insights` / `xai_ai_voice` already shipped in `@repo/plugin-web-storage`) |
| Last Updated | 2026-05-23 |

## Frozen Assumptions

1. **`window.claude.complete` adapter strategy = Option A.** A typed `claudeAdapter.completeChat(text, lang)` returns the bilingual demo line as a `Promise<string>` after a 600–1200 ms jittered delay (`Math.floor(600 + Math.random() * 600)`). The function never touches `window.*`. Option B (real backend) is reserved for a future row.
2. **No `@repo/core` source edits.** No new EventMap entries, no new types. The `Lang` type already flows through `@repo/plugin-web-tokens`.
3. **No cross-module event emit.** AI Chat is a pure UI sink. The thinking-orb state machine is local. No `web:ai:*` channel exists or will be added.
4. **`xai_ai_insights` default = `true`** (registry-derived). Insights pill is ON by default → starter prompts visible on first load.
5. **`xai_ai_voice` default = `false`** (registry-derived). Voice mic toggle is OFF by default.
6. **Bilingual UI strings stay inline.** No `tokens-and-i18n` bundle edits in this row. The component uses `lang==="zh" ? "…" : "…"` ternaries for short literals, matching sibling W2 precedent.
7. **`messages` are NOT persisted.** Only the convo list (titles + display-time labels) persists.
8. **`xai_ai_convos` default = `[]`** (registry-derived). The artifact's `c1..c4` example seeds are dropped — empty-state UX handles first load.
9. **Adapter delay = 600..1200 ms uniform jitter.** Long enough for the orb's thinking class to be observable; tested via fake timers.
10. **`prefers-reduced-motion: reduce` pauses aurora animations.** A media-query rule inside `styles.css` sets `animation-play-state: paused` on `.aurora-blob`, `.aurora-stream`, `.star`. No JS branch.

## Component graph

```
@repo/plugin-web-ai-chat (this row)
├── src/index.ts                  — public surface (AiChatModule, aiChatWebModuleRegistration, types)
├── src/AiChatModule.tsx          — top-level composition + state machine
├── src/AiSidebar.tsx             — left history panel (sidebar collapsible)
├── src/AiComposer.tsx            — composer pill (attach + input + model + voice + send)
├── src/AiThread.tsx              — message thread renderer (welcome + bubbles + typing dots)
├── src/AiAurora.tsx              — 5-layer aurora + stars + grain
├── src/BreathingOrb.tsx          — 3-layer breathing orb
├── src/registration.tsx          — WebModuleSlotRegistration entry (consumed in P3)
├── src/styles.css                — verbatim port of layout.css 3826..4457 + reduced-motion guard
├── src/types.ts                  — public AiMessage, AiConvoRecord, AiModelId types
├── src/internal/
│   ├── claudeAdapter.ts          — Option A no-op shim (the only adapter seam)
│   ├── icons.tsx                 — 10 inline SVG icons (list, plus, search, sparkle,
│   │                               paperclip, close, chevD, check2, sound, soundOff, arrowR)
│   ├── starters.ts               — STARTERS_EN + STARTERS_ZH constants
│   ├── models.ts                 — MODELS constant (Haiku 4.5 / Sonnet 4.5 / Opus 4.1)
│   ├── isAiConvoRecord.ts        — predicate widening AiConvo (registry: unknown) to AiConvoRecord
│   ├── isAiMessage.ts            — predicate (not strictly needed but kept symmetrical)
│   ├── starInstances.ts          — pure function generating the 60 deterministic star <span> entries
│   └── makeConvoFromUserText.ts  — pure function: user text + lang → seed AiConvoRecord
└── src/__tests__/                — vitest tree (see test.md)
    ├── isAiConvoRecord.test.ts
    ├── claudeAdapter.test.ts
    ├── makeConvoFromUserText.test.ts
    ├── starInstances.test.ts
    ├── AiSidebar.test.tsx
    ├── AiComposer.test.tsx
    ├── AiThread.test.tsx
    ├── AiAurora.test.tsx
    ├── BreathingOrb.test.tsx
    ├── AiChatModule.test.tsx
    ├── registration.test.tsx
    └── index-barrel.test.ts
```

## Dependencies

| Dep | Kind | Why |
|---|---|---|
| `@repo/plugin-web-tokens` | dep | `useI18n(lang)` for tooltip / nav labels; `Lang` type |
| `@repo/plugin-web-storage` | dep | `usePref("xai_ai_convos" / "xai_ai_insights" / "xai_ai_voice")` — three keys SHIPPED |
| `@repo/xai-web-shell` | dep | `WebModuleSlotRegistration` type + `useWebShell()` to read `lang` in `AiChatModuleRoute` |
| `@repo/core` | indirect via tokens | type-only flow |
| `react`, `react-dom` | peerDep | components |
| `@testing-library/react`, `vitest`, `jsdom`, `@testing-library/jest-dom`, `@types/react`, `@types/react-dom`, `typescript`, `@repo/eslint-config`, `@repo/typescript-config` | devDep | sibling-W2 standard scaffolding |

## State machine (top-level)

```
       ┌─────────── send() ───────────┐
       │                              ▼
   [ idle ] ─ user types Enter ─► [ thinking ] ─ adapter resolves ─► [ idle ] (with reply bubble appended)
       ▲                              │
       │                              ▼
       └────────── claudeAdapter rejects ──── [ idle ] (with demo bubble appended)
```

- `thinking` is a single boolean.
- During `thinking`, the composer's "send" stays usable but a re-send is queued behind the current promise.
- The queue is **strict FIFO**: `pendingSendQueueRef.current: Array<{ text, lang }>`. Each `send()` pushes one entry; the queue processor (`processQueue`) drains entries one at a time via a single `await completeChat(...)` per iteration. A `processingRef` boolean prevents re-entry — a second `send()` mid-flight calls `processQueue()`, which short-circuits because `processingRef` is `true`. The first call's `while (queue.length > 0)` loop continues to the next entry after the in-flight promise resolves.
- `thinking` stays `true` until the queue is fully drained (the orb animation continues smoothly across queued resends). It clears once and only once at the end of the loop.
- Each queue item snapshots its `lang` at enqueue time — a language switch mid-flight does NOT retroactively change a queued item's demo language.
- `attachments` and `input` are cleared on send (artifact behaviour). `messages` accumulate; not persisted.
- `activeConvo` is set on the first user message of a fresh thread.
- "New chat" resets `activeConvo`, `messages`, `input`, `attachments` (does **not** touch the persisted `convos` list).

## Risks recap

R1 (animation cost), R2 (60 stars), R3 (adapter typing), R4 (SSR safety), R5 (sidebar overflow), R6/R7 (registry-vs-artifact default flip), R8 (inline bilingual literals). All recorded in the discovery review and mitigated via the test plan.

## Out-of-scope (deferred)

- Real LLM round-trip (Option B follow-up row).
- Voice mic actually capturing audio / speech-to-text (DESIGN.md §4.1 only specifies a toggle UI).
- Conversation `messages` persistence.
- Sidebar conversation search filter behaviour (the input is rendered but its onChange is intentionally a no-op — matches the artifact).
- Multi-convo message thread switching (clicking a convo row clears `messages` and sets the active id, matching the artifact's `setMessages([])`; replaying historical messages is deferred).

---

## 2026-05-25 Extension: Real LLM Adapter (gap-closure row #2)

### Decision header

| Field | Value |
|---|---|
| Selected Option | **Option A** — Direct CORS to api.anthropic.com (BYO user key) + OpenAI-compatible secondary via base-URL override; streaming via SSE with non-stream fallback |
| Review Doc | `docs/reviews/xai-web-ai-chat-real-llm-adapter/20260525-discovery-review.md` |
| Review Date | 2026-05-25 |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #2 (W1) |
| Source brief | `docs/reviews/xai-web-ai-chat-real-llm-adapter/20260524-roadmap-seed.md` |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure) |
| ADR Amendment | **ADR-0008 §S3 D3** amended in-place this row to add `connect-src https://api.anthropic.com` (binding precedent for wave 1+2+3 CSP rows; see review §6) |
| Target packages | `packages/plugin-web-ai-chat/src/internal/` (adapter+stream+crypto) + `packages/plugin-web-settings-rest/src/panes/aiPane.tsx` (Settings → AI) + `packages/plugin-web-storage/src/internal/registry.ts` (+4 new prefs, no edits to 3 existing) + `packages/core/src/types/events.ts` (+2 new `web:ai:*` channels) + `apps/web/public/_headers` (+1 CSP entry) + `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (amendment) |
| Last Updated | 2026-05-25 |

### Frozen assumptions (this extension; lock at plan acceptance)

1. **Adapter signature.** `completeChat(text, lang): Promise<string>` is **unchanged externally**. Its body is rewritten to call the real provider; if streaming is enabled, internally it accumulates chunks and returns the full string at the end. The new streaming-aware export is `streamCompleteChat(req): AsyncIterable<StreamChunk>` (sibling export), added to `src/index.ts`. Downstream consumers (`AiChatModule.tsx`) call `streamCompleteChat` by default; the FIFO queue processor changes to consume the async iterator and mutate the in-progress assistant bubble in place; if `xai_ai_streaming = false`, it falls back to awaiting `completeChat` (today's semantics).
2. **API key storage.** IndexedDB store name `xai-web-ai-secrets`, single row keyed `"anthropic-key"` (and one per provider). Row shape: `{ ciphertext: Uint8Array, iv: Uint8Array, salt: Uint8Array, kdfIterations: 600000, algo: "AES-GCM", version: 1 }`. NEVER reaches localStorage. Encryption key derived via `PBKDF2-HMAC-SHA256(600000 iters) → AES-GCM-256` from passphrase = `createDeviceIdentityStore().ensure()` (UUID stored in `xai-web-auth/device` IDB store, already SHIPPED).
3. **Provider list.** Two providers: `"anthropic"` (default, base URL hardcoded to `https://api.anthropic.com/v1/messages`) and `"openai-compatible"` (user-supplied base URL, e.g. `https://api.groq.com/openai/v1`). Each provider has its own key slot in the IndexedDB secret store. Model id mapping is per-provider (Anthropic Haiku 4.5 / Sonnet 4.5 / Opus 4.1 → real model strings resolved at request time).
4. **Streaming = ON by default.** New pref `xai_ai_streaming: boolean = true`. The composer offers no toggle in this row (advanced toggle is in Settings → AI).
5. **Error taxonomy.** `LlmError` is a discriminated union: `{kind:"BadKey",status:401|403}` | `{kind:"RateLimited",status:429,retryAfterSec:number}` | `{kind:"Network",cause:Error}` | `{kind:"Server",status:5xx,body?:string}` | `{kind:"Malformed",where:"sse-parse"|"json-parse"|"shape",detail:string}`. `LlmError` is a NEW public type exported from `@repo/plugin-web-ai-chat`.
6. **CSP delta.** ADR-0008 §S3 D3 amended in-place. `_headers` adds `https://api.anthropic.com` to `connect-src`. OpenAI-compatible base URLs are NOT amended into the CSP (per pane copy explanation); the request will fail with a clear CSP error banner if the user picks one and the CSP blocks. **This is binding precedent** for future rows that need to widen CSP — they MUST amend ADR-0008 in the same commit.
7. **Pane location.** New `aiPane` exported from `@repo/plugin-web-settings-rest`. Inserted into `composeSettingsPaneRegistry()` between `appearance` (row #22) and `more` (row #24). Icon `sparkle`. No edits to existing 11 panes' shapes.
8. **Event channels.** Two new declaration-only channels in `@repo/core/types/events.ts`:
   - `web:ai:rate-limited` — `{ provider: "anthropic" | "openai-compatible"; retryAfterSec: number; occurredAt: string }`
   - `web:ai:request-failed` — `{ provider: "anthropic" | "openai-compatible"; kind: "bad-key"|"network"|"server"|"malformed"; status?: number; occurredAt: string }`
   Consumer THIS row: AI Chat banner UI in `AiChatModule.tsx` subscribes via `useWebEventListener`. Settings → AI pane MAY consume to live-update the "key invalid" hint (optional in P5).
9. **State-machine extension.** The FIFO queue + `processingRef` invariant per the SHIPPED bugfix-cycle-1 stays. The streaming path adds: each queue item produces ONE placeholder assistant bubble at start (text: "") that is mutated in place via React `setMessages` as chunks arrive. `thinking` clears once per queue drain (unchanged).
10. **No telemetry.** Zero outbound network beyond the provider endpoint. No error report to Sentry / CSP `report-uri` (ADR-0008 §S3 D3 drops `report-uri`; we do not re-add it).

### New file plan (delta over SHIPPED)

```
packages/plugin-web-ai-chat/
├── src/
│   ├── index.ts                            — MODIFY: + export streamCompleteChat + export LlmError type
│   ├── AiChatModule.tsx                    — MODIFY: consume streamCompleteChat + render in-progress bubble + banner UI for LlmError + useWebEventListener for web:ai:rate-limited
│   ├── ErrorBanner.tsx                     — NEW: typed banner that switches copy on LlmError.kind + countdown for RateLimited
│   ├── internal/
│   │   ├── claudeAdapter.ts                — MODIFY: completeChat body now calls llmProvider.fetch + accumulates stream OR delegates to non-stream
│   │   ├── claudeStreamAdapter.ts          — NEW: streamCompleteChat(req) → AsyncIterable<StreamChunk>
│   │   ├── llmProvider.ts                  — NEW: resolveProvider(prefs) → {url, headers, body builder}; one place for Anthropic vs OpenAI-compatible
│   │   ├── secretStore.ts                  — NEW: loadKey(provider) / saveKey(provider, plaintext) / clearKey(provider); WebCrypto + idb-keyval via @repo/web-auth-device-session re-exports
│   │   ├── sseParser.ts                    — NEW: parseSseStream(response: Response) → AsyncIterable<SseEvent>
│   │   └── llmErrors.ts                    — NEW: LlmError union + classifyError(httpResponse | Error) → LlmError
│   └── __tests__/
│       ├── secretStore.test.ts             — NEW: 8 cases incl. round-trip, missing key, IDB-unavailable, WebCrypto-unavailable, key rotation, clear, malformed ciphertext, version mismatch
│       ├── llmErrors.test.ts               — NEW: 12 cases for classifyError matrix
│       ├── sseParser.test.ts               — NEW: 8 SSE protocol edge cases
│       ├── llmProvider.test.ts             — NEW: 6 cases (Anthropic shape vs OpenAI-compatible shape; headers; URL composition; model mapping)
│       ├── claudeStreamAdapter.test.ts     — NEW: 10 cases incl. happy path, mid-stream abort, malformed chunk, non-stream fallback, BadKey, RateLimited, Network, Server, Malformed, AbortSignal
│       ├── claudeAdapter.test.ts           — MODIFY: existing 6 cases (A1..A6) for no-op shape REMAIN as fallback-path tests against fetch mock
│       ├── ErrorBanner.test.tsx            — NEW: 5 cases (BadKey copy, RateLimited countdown, Network copy, Server copy, dismiss button)
│       ├── AiChatModule.test.tsx           — MODIFY: 18 existing cases (I1..I18) STAY GREEN unchanged; +5 new cases (streaming bubble mutation, key-missing banner, rate-limited banner, link to Settings → AI, AbortSignal on unmount)
│       └── no-plaintext-key.test.ts        — NEW: 1 case asserting localStorage snapshot after a saveKey contains no `sk-` substring

packages/plugin-web-settings-rest/
├── src/
│   ├── index.ts                            — MODIFY: + export aiPane (line 19 adjacent insertion sorted alphabetically)
│   ├── internal/restPanesById.ts           — MODIFY: + ai: aiPane (and SettingsPaneId widening)
│   ├── panes/aiPane.tsx                    — NEW: paste key UI + provider picker + model default + streaming toggle + Test Connection button + Delete Key button (native dialog confirm reuse)
│   └── __tests__/aiPane.test.tsx           — NEW: 12 cases (render, paste+save, validate+save, test-connection-success, test-connection-bad-key, test-connection-rate-limited, delete confirm modal, provider switch, base URL field appears for OpenAI-compatible, model default picker, streaming toggle, lang toggle)

packages/plugin-web-storage/
└── src/internal/registry.ts                — MODIFY: + 4 new entries (xai_ai_provider / xai_ai_base_url / xai_ai_model_default / xai_ai_streaming); existing xai_ai_convos / xai_ai_insights / xai_ai_voice unchanged

packages/core/
└── src/types/events.ts                     — MODIFY: + 2 new EventMap entries (web:ai:rate-limited, web:ai:request-failed)

apps/web/
├── public/_headers                         — MODIFY: connect-src 'self' → connect-src 'self' https://api.anthropic.com
└── src/__tests__/csp.test.ts               — NEW: 1 case asserting _headers contains the Anthropic origin (R2 mitigation)

docs/adr/
└── 0008-cloudflare-deploy-target-and-csp.md — AMEND §S3 D3 + add Amendments frontmatter row

docs/PLUGIN_MAP.md                          — UPDATE: row for plugin-web-ai-chat status note appends "(Extension 2026-05-25 — real LLM adapter + Settings → AI)"
```

### Component graph delta

```
AiChatModule (extended)
├── ErrorBanner (NEW)         ← LlmError-driven copy + RateLimited countdown
├── AiAurora (unchanged)
├── BreathingOrb (unchanged)
├── AiSidebar (unchanged)
├── AiThread (unchanged shape; in-progress bubble is text-mutated, not appended)
└── AiComposer (unchanged)

claudeStreamAdapter (NEW)
└── consumes
    ├── llmProvider.resolveProvider(prefs)
    ├── secretStore.loadKey(provider)
    ├── sseParser.parseSseStream(response)
    └── llmErrors.classifyError(response | Error)

aiPane (NEW under plugin-web-settings-rest)
└── consumes secretStore (re-exported via @repo/plugin-web-ai-chat? NO — see §Dep boundary)
```

### Dep boundary

The `secretStore` lives inside `packages/plugin-web-ai-chat/src/internal/`.
Settings → AI pane lives inside `packages/plugin-web-settings-rest/`. Plugin
→ plugin direct internal-import is forbidden per CLAUDE.md "Code Boundaries".

Resolution: `secretStore`'s save/load/clear/test functions are exported via
`@repo/plugin-web-ai-chat/src/index.ts` as a typed helper namespace
`aiKeyStorage: { load, save, clear, testConnection }`. The Settings → AI pane
imports `aiKeyStorage` from the public surface. This is the same pattern
ADR-0007 §S4 uses for cross-plugin helper sharing.

### State machine update

```
       ┌─────────── send() ──────────────────────┐
       │                                         ▼
   [ idle ] ─ user types Enter ─► [ thinking + stream ] ──→ chunk → mutate assistant bubble
       ▲                                  │
       │ ┌──────────────────────────┐    │
       └─┤ classifyError(LlmError)  │ ◄──┤   on error
         │  • BadKey → banner       │    │
         │  • RateLimited → emit    │    │
         │      web:ai:rate-limited │    │
         │  • Network → banner      │    │
         │  • Server → banner       │    │
         │  • Malformed → banner    │    │
         │  REMOVE placeholder bubble│   │
         └──────────────────────────┘    │
                                          ▼
                                    drain queue → [ idle ]
```

- `thinking` boolean stays true until queue is fully drained (unchanged from
  bugfix-cycle-1).
- On error: the placeholder assistant bubble is removed (NOT replaced with the
  demo line — that was the no-op behaviour); `ErrorBanner` is shown until user
  dismisses or triggers a retry.
- On `429`: emit `web:ai:rate-limited`; the banner shows `Math.max(0, retryAfterSec)`
  countdown; "Retry" button is disabled until 0.
- On unmount mid-stream: `AbortController.abort()` is called on the in-flight
  fetch; the in-progress bubble is left as-is (truncated text); queue is
  intentionally not drained (precedent: bugfix-cycle-1).

### Risks recap (this extension)

R1..R10 from `docs/reviews/xai-web-ai-chat-real-llm-adapter/20260525-discovery-review.md` §8.

### Out-of-scope (deferred, this extension)

- RAG / tool-use / image input (Anthropic Vision API).
- Cross-device key sync (would require server-side blob; ADR-0008 D2 path).
- Per-user rate-limit enforcement (would require Worker).
- Conversation `messages` persistence (still local-only).
- CSP report-uri restoration (still deferred to ADR-0008 follow-up Worker row).
- Telemetry / Sentry capture for LLM errors.

---

