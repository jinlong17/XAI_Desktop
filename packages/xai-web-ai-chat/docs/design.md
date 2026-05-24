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
