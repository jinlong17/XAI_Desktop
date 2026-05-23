# Discovery Review — xai-web-ai-chat

> xai-web-console roadmap · feature #18 · wave W2c · Module
> Date: 2026-05-23
> Source PRD: `web design/DESIGN.md` §4.1 (AI Chat)
> Source Code: `web design/module-ai.jsx` (299 LOC) + `web design/layout.css` lines 3826–4457 (~630 LOC of AI-specific CSS)
> Seed brief: `docs/reviews/xai-web-ai-chat/20260523-roadmap-seed.md`
> Authority: ADR-0007 §S4 file-port map row "module-ai.jsx" + §S8 storage-key reservations (rows `xai_ai_convos` / `xai_ai_insights` / `xai_ai_voice`)
> Author: Claude Opus 4.7 1M (feature-plan, xai-roadmap-loop W2c parallel-Agent dispatch — concurrent with #12 calendar + #16 meditation)

---

## 1. Problem framing

The Claude-Artifact prototype renders the AI Chat module as `<AIModule lang>` defined in `web design/module-ai.jsx`. It owns:

1. A collapsible **conversation history sidebar** (248 px wide, 360 ms slide-in) backed by `xai_ai_convos` localStorage.
2. A 5-layer **aurora background** (`.ai-aurora` + 5× `.aurora-blob` + 3× `.aurora-stream` conic gradients + 60× twinkling `.star` + SVG `.ai-grain`) — explicitly designed for `screen` blend mode + `mix-blend-mode` + `will-change: transform` only (no layout-thrash).
3. A **breathing orb** (3-layer radial gradient ball, idle breathing at 9 / 11 / 13 s, thinking acceleration at 3.5 / 4.2 / 5 s).
4. A **composer pill** containing: attach (`+`) button → hidden `<input type="file" multiple>`; pill text input (Enter to send / Shift+Enter newline); model picker popover (Haiku 4.5 / Sonnet 4.5 / Opus 4.1); voice mic toggle (persisted to `xai_ai_voice`); send arrow button.
5. A **starter-prompts strip** (4 prompts, EN+ZH variants) gated behind an Insights pill toggle (top-right, persisted to `xai_ai_insights`).
6. An **LLM call** through `window.claude.complete(text)` with an error-path fallback that renders a hard-coded bilingual demo line.

This row must port that artifact verbatim — both behaviour and motion fidelity — into the production stack: a typed Vite+React 19 package `@repo/plugin-web-ai-chat` registered into `@repo/xai-web-shell` via the W1b `WebModuleSlotRegistration` contract, with all three localStorage keys flowing through the SHIPPED `@repo/plugin-web-storage` registry (already reserved as non-`proposed` registered entries — see §5).

The dominant open question — and the only one not pre-decided by ADR-0007 — is the **`window.claude.complete` adapter strategy** in a Vite SPA where the Claude-Artifacts host runtime is not present (the seed brief and ADR-0007 §S8 explicitly defer this to this row's feature-plan).

## 2. Candidate options for `window.claude.complete` adapter

ADR-0007 §S8 records this as "deferred to row #18 feature-plan" and lists no third-party Claude API key in `apps/web` runtime config. The seed brief proposes three options:

### Option A — No-op stub that always returns the demo-text fallback

A typed shim (`src/internal/claudeAdapter.ts`) exporting `completeChat(text: string, lang: Lang): Promise<string>` that returns a `Promise.resolve(...)` of the same bilingual demo line currently in the artifact's `catch` block, after a small artificial delay (`~600–1200 ms`, to keep the "thinking" orb animation visible). The function never touches `window.claude` — there is no global to consume.

**Pros**
- Zero new network surface; CSP, Sentry, and `apps/web-security-csp-sentry` rules unaffected.
- Zero new secrets / no API-key plumbing in `apps/web/package.json`, `.env*`, or `vite.config.ts`.
- No auth-device-session edits (siblings #12 / #16 are not touching that surface either — write-scope-disjoint guarantee preserved).
- Deterministic for vitest snapshots and the future cross-vendor smoke; the orb's "thinking → idle" transition stays observable.
- Matches the seed brief's recommendation verbatim ("Recommend Option A for this row's scope; defer B to a separate future row").
- Honest UX: the welcome line + starter prompts + breathing aurora visual remain the centerpiece, and the bubble reply is *clearly* labeled "(Demo) … Network unavailable" in EN and "（演示）…" in ZH — same wording the artifact already ships.

**Cons**
- No real LLM round-trip in W2c. A future row will need to deliver true assistance.

### Option B — Wire to a real backend endpoint via `apps/web` auth-device-session

Implement a fetch through the SHIPPED `@repo/web-auth-device-session` to a not-yet-built `/api/llm/complete` endpoint, with streaming or non-streaming JSON response, secret stored server-side, rate-limit + per-device quota enforced.

**Pros**
- Real assistance, real product value.

**Cons (all blocking for this row's scope)**
- No such endpoint exists today. Building it pulls in: server-side API key custody (Anthropic key + budgets), CSP `connect-src` additions, Sentry envelope rules, request schema versioning, error taxonomy (`429 / 503 / network-timeout / abort`), abort-on-unmount semantics, conversation context truncation strategy, streaming-vs-blocking decision, and idempotency for retry.
- Touches `@repo/core` event-bus and the SHIPPED auth-device-session — both forbidden by this row's hard "Do NOT touch packages/core/ unless ADR-0007 specifies new channels" rule, and ADR-0007 specifies no new channels for AI Chat.
- Concurrency-violates the sibling rows #12 / #16 write-scope disjointness (auth-device-session is shared, and a fix-pass on its types under contention would cause git-lock churn).
- Trivially balloons past the seed brief's "3 phases" budget.

### Option C — Feature-flag stub pointing to either A or B by env var

A shim that reads `VITE_XAI_AI_LIVE === "true"` and switches between the demo response and a `fetch` call.

**Pros**
- Future-proofs the seam.

**Cons**
- Inherits all of B's debt (the live branch still has to be built and tested), or skips it and ships a flag whose live branch is `throw new Error("not implemented")` — same as A but with a footgun.
- Two code paths to test; the live branch can't be smoked at all without B's infra.
- The seed brief explicitly de-prioritises this: "Recommend Option A … defer B to a separate future row."

### Web research

Web-research was attempted (per feature-plan §148 "if the feature involves technology selection, external libraries, or open-source alternatives"). The adapter decision is project-policy-bound (auth-device-session ownership + ADR-0007 scope) rather than library-bound; no general-purpose Anthropic SDK choice is being made here. Therefore: **No external research required.** The Anthropic API SDK (`@anthropic-ai/sdk`) is the obvious B-branch candidate when B is built later, but B is out of scope for this row.

### Recommendation: Option A

Aligned with the seed brief recommendation and the parallel-Agent write-scope rules. Implement `completeChat()` as a typed Promise-returning function that returns the bilingual demo line after a small jittered delay (so the thinking orb has time to play). Document Option B as a planned successor row in the design snapshot's "Frozen Assumptions" so a future feature-plan can pick it up without re-deriving the trade-off matrix.

**Decision boundary:** the `claudeAdapter` module exports a single async function. Future rows that wire B do so by swapping the *implementation* of this module — the call site in `AiChatModule.tsx` stays identical. This is the only "real-world" hook left in the design, and isolating it now is cheap (~30 LOC).

## 3. Tradeoffs vs sibling W2 rows

| Aspect | This row | Sibling pattern (pomodoro #14 / habits #15 / countdown #17) |
|---|---|---|
| Persistence keys | `xai_ai_convos` (json array, default `[]`) + `xai_ai_insights` (bool, default `true`) + `xai_ai_voice` (bool, default `false`) — all already in the SHIPPED registry as canonical (non-`proposed`) entries | Same SHIPPED registry, distinct keys |
| Event-bus emit | **None**. AI Chat is a pure UI sink. The breathing orb's thinking state is internal. No cross-module observer needs to react to a chat-send. | Pomodoro emits `web:pomodoro:session-finished` |
| Adapter / runtime side-effect | One typed `claudeAdapter` module (Option A) | Countdown emits notifications via stub; pomodoro uses `Date.now()` + rAF |
| New EventMap entries in `@repo/core` | **Zero** (hard constraint: "Do NOT touch packages/core/ unless ADR-0007 specifies new channels"; ADR-0007 §S7 declares no AI channels) | Zero (pomodoro reused W1-declared channel) |
| Cross-vendor concerns | Aurora `mix-blend-mode: screen` + `color-mix(in oklch, …)` + `conic-gradient` (Chrome 113+ / Safari 16.4+ / Firefox 117+ — all in the project's target matrix) | Cross-vendor smoke required |
| Out-of-scope (deferred) | Real LLM round-trip (Option B); voice mic actually doing speech I/O (DESIGN.md §4.1 only specifies a toggle UI); conversation messages persistence (artifact does NOT persist `messages`, only `convos` titles) | Streak edges, etc. |

## 4. Risks and open questions

- **R1: Background-animation cost on low-end hardware.** Five blurred 60–80 vmin blobs + three conic gradients + 60 stars + grain SVG is dense. Mitigation: every animated element already uses `will-change: transform` + `mix-blend-mode: screen` + `position: absolute; inset: 0` per the verbatim port; no `box-shadow` animation, no layout reflow. The test plan adds a vitest assertion that all animation declarations target only `transform` / `opacity`. Manual cross-vendor verify on `prefers-reduced-motion: reduce` (acceptance signal §V8) adds a class hook to drop blob/stream animations to `paused`.
- **R2: 60 stars × dynamic style inline.** The artifact's `Array.from({length:60}).map((_,i)=>…)` builds a static layout via deterministic `i*53%100` / `i*97%100`. Port verbatim. No re-renders during animation; only the CSS `twinkle` keyframes drive opacity changes. The test asserts the `<span class="star">` count equals 60 and that no `style.left/top` changes between renders.
- **R3: Adapter typing.** `window.claude.complete` is *not* a thing in our build. Lint / typecheck must not see a `(window as any).claude.complete` cast. The `claudeAdapter` shim isolates the call; the component imports the shim only.
- **R4: localStorage SSR safety.** `@repo/plugin-web-storage` `usePref` is already SSR-safe (the `getPref` Node fallback test exists). The convos default is `[]`; the boolean defaults match the registry. No SSR hazard.
- **R5: Sidebar `min-width: 248px` on `.ai-side-section`.** The CSS rule `.ai-side-section { padding: 0 8px; min-width: 248px; }` plus the parent `.ai-side` collapsed to `0` width can cause overflow. The artifact already handles it with `overflow: hidden` on the parent and a 360ms slide via `width` transition. Port verbatim; the test plan asserts the parent's `overflow: hidden` style.
- **R6: AI starter prompts panel default.** The seed brief says "starter-prompts (top-right pill toggle)" but the artifact reads `localStorage.getItem("xai_ai_insights")` with default `false`. The SHIPPED storage registry's `xai_ai_insights` row says `default: true`. **Mismatch.** Decision: defer to the registry. The component will pass `default: true` to `usePref`, which is what the registry says, which means starters are visible by default. The artifact's `default: false` was a prototype quirk; the registry was set by a later row that decided "true" was the discoverable choice. Documented in `design.md` Frozen Assumption 4.
- **R7: Voice toggle default.** Same shape as R6: the artifact reads `xai_ai_voice` default `true`, but the SHIPPED registry says `default: false`. Defer to registry. Documented in Frozen Assumption 5.
- **R8: `lang==="zh" ? "刚刚" : "Just now"` etc.** Many bilingual literals live inside the component. Port via `useI18n(lang)` lookups under a new `nav.ai.*` + `module.ai.*` keyspace in `@repo/plugin-web-tokens` — but the hard constraint says "Do NOT touch packages/core/" and (implicitly) other shipped packages. **Decision:** keep the literals inline in the component (an interim acceptable per other W2 rows' precedent — see pomodoro/countdown which inline a few literals). Plan reference: §Frozen Assumption 6.

## 5. Storage registry alignment

The keys are already registered in `@repo/plugin-web-storage`:

```ts
// packages/plugin-web-storage/src/internal/registry.ts
xai_ai_convos:   { codec: "json",    default: [] as AiConvo[],    owner: "xai-web-ai-chat" }  // line 274
xai_ai_insights: { codec: "boolean", default: true as boolean,    owner: "xai-web-ai-chat" }  // line 283
xai_ai_voice:    { codec: "boolean", default: false as boolean,   owner: "xai-web-ai-chat" }  // line 292
```

`AiConvo` is typed as `unknown` at line 89, intentionally — the registry punted the shape to this row. Plan: tighten the conversation record at the *component* boundary (a local `AiConvoRecord` predicate that validates the unknown payload), exactly like pomodoro does with `isPomodoroSession`. **Do NOT edit `packages/plugin-web-storage/src/internal/registry.ts` from this row** (write-scope rule); the `unknown` cast at the registry is preserved, and the local predicate widens to the canonical record shape:

```ts
interface AiConvoRecord {
  id: string;            // "c-<base36 timestamp>" or seed "c1".."c4"
  title: string;         // 1..32 chars, first user message slice
  time: string;          // free-form display string ("刚刚"/"Just now"/"5/19"); not a real timestamp
}
```

`AiConvo = unknown` at the registry stays as-is. The local predicate `isAiConvoRecord` drops invalid entries on read with a one-shot dev-only console.warn.

## 6. Frozen assumptions

1. **Selected Option for `window.claude.complete`:** A — no-op typed shim returning the bilingual demo line after a 600–1200 ms jittered delay. Option B reserved for a future row.
2. **No `@repo/core` edits.** Hard constraint per feature-plan; ADR-0007 §S7 declares no AI event channels.
3. **No event-bus emit.** AI Chat is a pure UI sink.
4. **`xai_ai_insights` default = `true`** (registry-derived; supersedes the artifact's `false` prototype quirk).
5. **`xai_ai_voice` default = `false`** (registry-derived; supersedes the artifact's `true` prototype quirk).
6. **Bilingual UI strings stay inline** with `lang==="zh" ? "…" : "…"` ternaries per sibling W2 precedent — no new tokens-i18n bundle edits.
7. **Conversation `messages` are NOT persisted.** Only `convos` (titles + time labels) persist, matching the artifact's actual behaviour. A fresh `messages` array per session is by design.
8. **`xai_ai_convos` default seed:** the artifact seeds with `c1..c4` example titles. The registry default is `[]` (empty). We **adopt the registry default `[]`** and remove the prototype seed — production users do not want fake "Weekly review ideas" entries staring at them. (Same call siblings made.) `new chat` flow handles the empty-state UX.
9. **Adapter delay range:** the `claudeAdapter` returns after `Math.floor(600 + Math.random() * 600)` ms (600–1200 ms). Tested via fake timers, asserts the orb's `.orb-thinking` class appears and clears.
10. **Aurora animation respects `prefers-reduced-motion: reduce`.** A guard added inside `styles.css` pauses `.aurora-blob` / `.aurora-stream` / `.star` animations; no JS change.

## 7. Dependency overview

| Package | Direction | Usage |
|---|---|---|
| `@repo/plugin-web-tokens` | runtime dep | `useI18n(lang)` for `t.nav.*` lookups (only existing keys; no new keys added); `Lang` type |
| `@repo/plugin-web-storage` | runtime dep | `usePref("xai_ai_convos")`, `usePref("xai_ai_insights")`, `usePref("xai_ai_voice")` — all three keys are SHIPPED |
| `@repo/xai-web-shell` | runtime dep | `useWebShell()` (read `lang` from context inside `AiChatModuleRoute`) + `WebModuleSlotRegistration` type |
| `@repo/xai-web-event-bus` | dev dep only | typecheck-only; no emit in this row |
| `@repo/core` | indirect | type only — `Lang` flows through tokens; **no source edits** |
| `apps/web` | host wire-up | imports `aiChatWebModuleRegistration`; swaps line 51 `placeholder("ai",...)` for the registration; adds workspace dep to `apps/web/package.json` |

No dependency on any IN_PROGRESS / Planned package. All deps are READY_TO_SHIP or SHIPPED.

## 8. Cross-vendor matrix

Browsers in target (per `web-browser-e2e-crypto-runtime` config): Chrome 120+, Safari 17+, Firefox 121+.

| Feature | Chrome | Safari 17 | Firefox 121 |
|---|---|---|---|
| `mix-blend-mode: screen` on `<div>` | yes | yes | yes |
| `color-mix(in oklch, …)` | yes 111+ | yes 16.4+ | yes 113+ |
| `conic-gradient(from …)` | yes | yes | yes |
| `backdrop-filter: blur()` (popover) | yes | yes | yes 103+ |
| `prefers-reduced-motion` media query | yes | yes | yes |
| `Math.random()` jitter | yes | yes | yes |

No outliers. Cross-vendor smoke acceptance covered in `test.md` §V5.

## 9. Phase budget

Three phases — matches seed brief default. Estimated commit budget: 3.

- **P1**: types + adapter + pure helpers + sub-components + CSS (no shell registration; module renders standalone when imported, but no host wires yet).
- **P2**: `AiChatModule` composition + `usePref` persistence + send-flow state machine (`thinking`, `messages`, `attachments`) + adapter wire-up + tests for all of the above.
- **P3**: shell slot registration (`registration.tsx`) + apps/web wire-up (single-line edit to `shellRegistrations.tsx` line 51, one-line dep add to `apps/web/package.json`) + cross-vendor smoke artifact + final `index.ts` surface.

Each phase = one commit per `feature-build` semantics. Lint must pass `--max-warnings 0` per commit.

---

End of discovery review.
