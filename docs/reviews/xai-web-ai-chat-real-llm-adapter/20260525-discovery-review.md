# Discovery Review — xai-web-ai-chat-real-llm-adapter

| 字段 | 值 |
|---|---|
| Feature | xai-web-ai-chat-real-llm-adapter |
| Seed brief | `docs/reviews/xai-web-ai-chat-real-llm-adapter/20260524-roadmap-seed.md` |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure) |
| Parent roadmap | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #2 (W1) |
| Companion ADRs | ADR-0008 (CSP), ADR-0007 (xai-web-console build form), ADR-0006 (web-face hybrid) |
| Baseline (SHIPPED) | `packages/xai-web-ai-chat/` row #18 (Option A no-op `completeChat`, 84/84 plugin tests + 100/100 web tests) |
| Planner | Claude Opus 4.7 (1M) — feature-plan via xai-roadmap-loop serial dispatch (2026-05-25, after bg failure 287a81aa) |
| Date | 2026-05-25 |

---

## §1. Problem framing

The Web Console's AI Chat module (row #18, SHIPPED 2026-05-23) ships with an
intentional Option-A no-op adapter: `claudeAdapter.completeChat(text, lang)`
returns a bilingual demo line after a 600..1200 ms jitter and never touches the
network. Users cannot send a real prompt; the bilingual "Network unavailable
right now — try again in a moment" string is the only assistant reply.

ADR-0009 §D2-G3 requires this gap (the "AI real-LLM adapter" — Gap 1 in the
gap-closure source doc) to ship as part of unblocking P1 Desktop launch
(threshold: ≥5/7 known gaps SHIPPED).

The work has four interlocking sub-problems:

1. **Adapter swap.** Replace the no-op body of `completeChat` with a real
   round-trip to a user-configurable LLM endpoint, preserving the existing
   `(text: string, lang: Lang) => Promise<string>` signature so the FIFO queue
   processor in `AiChatModule.tsx` lines 124-152 keeps working unchanged.
2. **Streaming.** Render assistant tokens as they arrive rather than only at
   end-of-turn — the existing single-`Promise<string>` shape forecloses
   streaming. We must extend the public surface of `claudeAdapter` (NOT replace
   the existing export) with a streaming variant the caller can opt into.
3. **API key storage.** The key MUST NOT touch localStorage in plaintext (the
   3 existing `xai_ai_*` storage keys are all localStorage-backed via
   `@repo/plugin-web-storage`). Use IndexedDB + WebCrypto AES-GCM with a key
   derived from a stable per-device identifier already SHIPPED by
   `@repo/web-auth-device-session` (`createDeviceIdentityStore`).
4. **Settings → AI pane.** Users need a UI to paste, validate, rotate, and
   delete their key. Add a new pane `aiPane` to `packages/plugin-web-settings-rest/`
   following the precedent set by `accountPane` and `integrationsPane`.

Out of scope for this row (deferred to follow-ups): RAG, tool-use, file upload
streaming, multi-turn conversation memory (the existing module clears
`messages` on convo switch — see api.md §1 of row #18; that behaviour is
preserved here), voice STT.

---

## §2. Candidate options analyzed

### Option A — Real adapter via direct CORS to api.anthropic.com (CHOSEN)

Anthropic added official browser CORS support to the Messages API in August
2024 ([Simon Willison 2024-08-23][sw-cors]) via the `anthropic-dangerous-direct-browser-access: true`
header. Requests succeed from a browser with `x-api-key: <user-key>` directly.
Streaming uses `text/event-stream` (SSE) with `stream: true` in the body
([Anthropic docs][anthropic-streaming]).

**Pros:**
- Zero backend. Aligns with ADR-0008 D1 (static Cloudflare Pages hosting; no
  Worker). No `/api/chat` route to author/maintain.
- Predictable cost model — user brings their own key.
- "BYO key" is exactly the pattern the seed brief calls for ("Default adapter:
  Anthropic Claude Messages API").
- Matches the existing UI: the model picker already lists Haiku 4.5 / Sonnet
  4.5 / Opus 4.1 (see `packages/plugin-web-ai-chat/src/internal/models.ts`),
  which maps 1:1 to Anthropic model ids.
- OpenAI-compatible endpoints (Groq, Together, OpenRouter, Ollama, etc.) use
  the same `/v1/chat/completions` SSE shape — secondary adapter is a thin
  base-URL override.

**Cons:**
- The CORS header name itself (`anthropic-dangerous-direct-browser-access`) is
  Anthropic's explicit warning about the BYO-key risk: ANY user of a site that
  embeds a SHARED key can exfiltrate it. We mitigate by NEVER embedding a key
  — each user provides their own, and we encrypt at rest.
- Widens CSP `connect-src` (currently `'self'` only — see `apps/web/public/_headers`).
- Token / usage caps not enforceable client-side; user sees Anthropic's 429
  directly.

### Option B — Proxy via Cloudflare Worker

Author a `/api/chat` Worker that holds the server-side key (or relays the
user's key) and streams SSE downstream. This was the original ADR-0008 §S3
follow-up trigger ("when the AI Chat backend row introduces a Worker layer,
revisit and restore per-request nonces").

**Pros:**
- Server holds the key (operator-supplied path) OR relays user key without
  exposing CORS surface.
- Restores per-request CSP nonces (ADR-0008 §S3 follow-up).
- Can enforce per-IP rate limits.

**Cons:**
- Adds a Worker surface ADR-0008 deliberately deferred. Couples the row to a
  Worker runtime, Wrangler config, secrets-in-CI complications, and a new
  `cloudflare/workers-types` dep.
- Significant scope creep — turns a 1-2 day adapter row into a 3-5 day
  backend+frontend row.
- Operator-key path concentrates risk on a single shared key; user-key relay
  path adds CORS to the Worker (same exposure surface, more layers).
- ADR-0009 §D4 says cross-cut changes touching P0+P1 are permitted but the P0
  motivation must dominate; introducing a Worker is more P0.5 than P0.

### Option C — Wait for `xai-web-real-auth-production` and use a Supabase Edge Function

Defer until the auth productionization row lands, then route AI calls through
an authenticated Edge Function with a server-side key.

**Pros:**
- Strongest security — keys never touch the browser.
- Per-user rate limits enforceable via JWT.

**Cons:**
- Indefinite dependency chain — `xai-web-real-auth-production` is not on any
  roadmap. ADR-0008 D2 explicitly defers this to a separate row.
- Blocks Gap 1 from shipping until ≥2 unrelated rows ship. Fails ADR-0009
  D2-G3 threshold timing.
- Operator pays for all inference — wrong cost model for a personal-use
  productivity app.

### Decision

**Option A (direct CORS to api.anthropic.com + OpenAI-compatible base-URL
override).** Justification:

- Single seed-brief alignment: brief explicitly names Anthropic primary +
  OpenAI-compatible secondary.
- Lowest scope: no Worker, no new CI surface, no new auth dependency.
- Reuses SHIPPED `@repo/web-auth-device-session` `createDeviceIdentityStore`
  for the at-rest encryption key — no new device-identity scheme.
- The CSP widening is bounded and explicit; we accept Anthropic's BYO-key
  warning by encrypting at rest and never embedding a shared key.

If Anthropic's policy changes or rate-limit / abuse becomes operational, the
follow-up row migrating to Option B is straightforward — the `claudeAdapter`
public surface is the only seam to swap.

---

## §3. Web research — evidence trail

External research was REQUIRED for this row (technology selection + CORS
policy + WebCrypto patterns). Sources cited inline above; key URLs:

- [Simon Willison — Claude's API now supports CORS, 2024-08-23][sw-cors] —
  confirms `anthropic-dangerous-direct-browser-access: true` header works in
  production; warns about shared-key embedding risk (which we avoid via
  per-user BYO key).
- [Anthropic streaming docs][anthropic-streaming] — confirms SSE shape:
  `event: message_start | content_block_delta | message_stop` etc., with
  `data: {...}` JSON per event line; `stream: true` in body opts in.
- [MDN SubtleCrypto.deriveKey][mdn-derive] — confirms PBKDF2 → AES-GCM is the
  W3C-recommended path for passphrase-derived symmetric keys.
- [W3C Web Crypto Level 2][w3c-crypto] — confirms AES-GCM is the appropriate
  authenticated symmetric cipher and PBKDF2 is the documented derivation
  function. Recommendation: minimum 600 000 iterations of SHA-256 PBKDF2 in
  2024+; we use 600 000 to match OWASP 2023 recommendation.
- [MDN IndexedDB][mdn-idb] — confirms IndexedDB is the right home for CryptoKey
  objects (already in use by `@repo/web-auth-device-session/src/storage.ts`
  via `idb-keyval`; we reuse that pattern).

The two libraries surveyed but NOT adopted:

- `@anthropic-ai/sdk` (official Node SDK): designed for Node; browser bundle
  is large (~120KB minified) and pulls in `node:stream` polyfills. We instead
  write a ~150 LOC native `fetch` + SSE parser — zero new runtime deps. (The
  SDK source serves as a reference for header/error shapes.)
- `idb-keyval` (already a transitive dep via `@repo/web-auth-device-session`):
  REUSED — we import via `@repo/web-auth-device-session` re-exports
  (`createIndexedDbStore`) rather than a new direct dep. Keeps the dependency
  fan-in to one workspace package.

[sw-cors]: https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/
[anthropic-streaming]: https://docs.anthropic.com/en/docs/build-with-claude/streaming
[mdn-derive]: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey
[w3c-crypto]: https://www.w3.org/TR/webcrypto-2/
[mdn-idb]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

---

## §4. Reusable assets (existing, SHIPPED)

| Asset | Path | Reuse strategy |
|---|---|---|
| `claudeAdapter.completeChat` (Option A no-op) | `packages/plugin-web-ai-chat/src/internal/claudeAdapter.ts` | Body replaced; signature unchanged. New helpers added beside it. |
| FIFO send queue + `processQueue` | `packages/plugin-web-ai-chat/src/AiChatModule.tsx` lines 124-152 | Unchanged. Streaming variant integrates by appending an in-progress assistant bubble that mutates in place; the queue still serializes one prompt at a time. |
| 3 SHIPPED storage keys (`xai_ai_convos` / `xai_ai_insights` / `xai_ai_voice`) | `packages/plugin-web-storage/src/internal/registry.ts` lines 278-303 | Unchanged. NO edits to existing entries. |
| `createIndexedDbStore` / `KeyValueStore` interface | `packages/web-auth-device-session/src/storage.ts` | Reused via re-export from `@repo/web-auth-device-session` (the package is SHIPPED, exported in its `src/index.ts` line 4-9). We open a new store name `"xai-web-ai-secrets"` rather than reusing `"xai-web-auth"` so the keys are namespace-separated. |
| `createDeviceIdentityStore` | `packages/web-auth-device-session/src/device-store.ts` | Reused. The device id (already a stable UUID per browser) becomes the entropy source for the per-device key salt. NOT used as the encryption key directly — see design.md §3. |
| `emitWebEvent` / `WebEventMap` | `packages/xai-web-event-bus/src/{emitter.ts,events.ts}` | Reused for the new `web:ai:rate-limited` channel + `web:ai:request-failed` channel (declaration-only in `@repo/core/types/events.ts`). |
| `Pane` / `PaneRenderProps` types + `composeSettingsPaneRegistry` seam | `@repo/plugin-web-settings-shell` + `apps/web/src/routes/modules/settingsPaneComposition.ts` | The new `aiPane` slots into the existing 13-pane chassis via the same line-disjoint composition seam used by rows #22/#23/#24. |
| `accountPane` precedent | `packages/plugin-web-settings-rest/src/panes/accountPane.tsx` | Reference for native `<dialog>` confirm-modal pattern (DeleteAccountConfirmModal). |

### New surfaces this row adds

| Surface | Path | Why new |
|---|---|---|
| Streaming adapter | `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts` | New export, sibling to `completeChat`. Returns an async iterator of token chunks. |
| LLM provider config | `packages/plugin-web-ai-chat/src/internal/llmProvider.ts` | Resolves `{provider, baseUrl, model, apiKey, headers}` from settings; one place to swap Anthropic↔OpenAI-compatible. |
| WebCrypto helpers | `packages/plugin-web-ai-chat/src/internal/secretStore.ts` | `loadApiKey()` / `saveApiKey(plaintext)` / `clearApiKey()` — AES-GCM seal/unseal against an IndexedDB-stored ciphertext blob. |
| SSE parser | `packages/plugin-web-ai-chat/src/internal/sseParser.ts` | Pure function (`fetchResponse → AsyncIterable<SseEvent>`). |
| Error categorization | `packages/plugin-web-ai-chat/src/internal/llmErrors.ts` | Typed `LlmError` union: `BadKey` / `RateLimited` / `Network` / `Server` / `Malformed`. |
| Settings → AI pane | `packages/plugin-web-settings-rest/src/panes/aiPane.tsx` | New pane: paste key, validate, rotate, delete; pick provider + base URL + model default. |
| Public surface widening | `packages/plugin-web-ai-chat/src/index.ts` | Add `streamCompleteChat` (or equivalent named export) + `LlmError` type. `completeChat` Promise-of-string shape stays exactly as today. |
| EventMap entries | `packages/core/src/types/events.ts` | Add `web:ai:rate-limited` + `web:ai:request-failed` declaration-only channels (no consumer this row beyond the AI Chat banner UI). |
| `xai-web-ai-secrets` IndexedDB store | (runtime) | One row containing the ciphertext blob `{ciphertext, iv, salt, kdfIterations, algo, version}`. NOT a `usePref` entry; IndexedDB-only. |
| 4 new `usePref` entries in `@repo/plugin-web-storage` registry | `packages/plugin-web-storage/src/internal/registry.ts` | `xai_ai_provider` (`"anthropic" \| "openai-compatible"`, default `"anthropic"`), `xai_ai_base_url` (string, default `""`), `xai_ai_model_default` (`AiModelId`, default `"haiku"`), `xai_ai_streaming` (boolean, default `true`). **None of these store secrets.** |

---

## §5. Recommendation

**Adopt Option A.** Build in 5 phases (P1..P5) as detailed in `dev_log.md` Phase Plan.
Amend ADR-0008 §S3 D3 in-place via a single follow-up commit (CSP decision —
see §6).

---

## §6. CSP decision — amend ADR-0008 in-place

Two options were on the table per seed brief constraint #6:

- **(a) Amend ADR-0008 §S3 D3 in-place** — append the new `connect-src` entry
  to the existing CSP table; record the strictness delta in the same §.
- **(b) Write a new ADR-0010** dedicated to LLM CSP widening.

**Recommendation: amend ADR-0008 in-place.** Justification:

1. ADR-0008 already records a "CSP strictness delta" (the nonce drop). Adding
   the `connect-src` widening to the same delta table keeps the CSP source of
   truth in ONE document.
2. The roadmap manifest header explicitly says (line 143 §Blockers):
   "Pre-decide: amend ADR-0008 §D3 in-place (single follow-up commit per
   amendment) OR write 4 small ADRs (0010 / 0011 / 0012 / 0013). Recommend
   amendment-in-place for first 2-3, then re-evaluate." This is the first such
   amendment.
3. Future rows #6 (Map tiles) and #7 (OAuth) will follow the same amendment
   pattern. If we proliferate one-ADR-per-CSP-edit, the ADR series becomes
   noisy and the operator has to read 4 files to understand the production CSP.
4. We DO write a new entry in the ADR's frontmatter ("Amendments" sub-section)
   so the audit trail is preserved; we do not silently edit history.

**Pattern-setter note (binding precedent for wave 1+2+3 CSP rows):**
This decision establishes the in-place-amend pattern for ADR-0008 §S3. Future
rows touching `connect-src` / `frame-src` / `img-src` should:
1. Append to the ADR-0008 §S3 D3 CSP table in the same commit that ships
   `apps/web/public/_headers`.
2. Add an "Amendments" entry to ADR-0008 frontmatter listing date, row, and
   summary of new domains.
3. Only escalate to a new ADR if the change introduces a fundamentally
   different security posture (e.g. `'unsafe-inline'`, a Worker, a third-party
   script source).

The new `connect-src` entry this row adds:

```
connect-src 'self' https://api.anthropic.com
```

(OpenAI-compatible base URL is user-provided in Settings → AI; the CSP cannot
be widened dynamically for arbitrary user input, so when the user picks an
OpenAI-compatible endpoint we attempt the request and if the browser CSPs it
out we surface a clear error banner advising them to whitelist via a
self-hosted deployment. This is an acknowledged limitation, recorded in
design.md frozen assumption.)

---

## §7. Frozen assumptions for this row (recorded; lock at plan acceptance)

1. **Adapter provider default = Anthropic Claude Messages API.** Model picker
   continues to expose Haiku 4.5 / Sonnet 4.5 / Opus 4.1; ids map directly to
   Anthropic model strings (`claude-haiku-4-5-20260120` etc. — exact strings
   resolved in P2 from Anthropic docs at build time).
2. **Adapter provider secondary = OpenAI-compatible** via user-supplied base
   URL. Default base URL is empty; user must paste one in Settings → AI.
3. **API key storage = IndexedDB + WebCrypto AES-GCM-256 + PBKDF2-HMAC-SHA256
   600 000 iterations.** Salt = 32 bytes random per-install (stored alongside
   ciphertext). KDF passphrase = the SHIPPED `createDeviceIdentityStore`
   device id (UUID). NOT the device id directly as the key — derivation
   protects against accidental key reuse if the device id is reset.
4. **No raw API key in `xai_ai_*` localStorage keys.** A grep test
   (`grep -r 'sk-ant-' apps/web/dist/` after build returns empty) is part of
   the verify gate.
5. **Streaming default = ON.** `xai_ai_streaming` pref defaults to `true`.
   The non-streaming fallback path exists; the adapter automatically falls
   back if the SSE parser throws OR `Response.body` is null OR CORS rejects
   the SSE response.
6. **Rate-limit detection.** HTTP 429 → emit `web:ai:rate-limited` event
   carrying `{provider, retryAfterSec, occurredAt}`. UI banner subscribes via
   `useWebEventListener` and displays a countdown.
7. **Error categorization.** 5 categories — `BadKey` (401/403), `RateLimited`
   (429), `Network` (fetch reject / `TypeError: Failed to fetch`), `Server`
   (5xx), `Malformed` (SSE parse failure / unexpected JSON shape). The banner
   shows different copy + actions per category.
8. **CSP amendment.** ADR-0008 §S3 D3 amended in-place to add
   `connect-src 'self' https://api.anthropic.com`. `apps/web/public/_headers`
   updated in the same commit as the ADR amendment.
9. **`completeChat` signature unchanged.** The Promise-of-string export stays.
   New streaming export is named `streamCompleteChat` and lives beside it.
   Existing consumers (`AiChatModule.tsx`) call `streamCompleteChat` by
   default; the non-stream `completeChat` becomes the streaming variant's
   fallback (it composes by accumulating chunks).
10. **Settings → AI pane location.** New pane id `"ai"` registered in
    `packages/plugin-web-settings-rest/src/panes/aiPane.tsx`, exported via
    `src/index.ts`, wired into `apps/web/src/routes/modules/settingsPaneComposition.ts`
    composition order between `appearance` and `more`. Icon: `sparkle` (reuses
    the existing icon used by the AI module rail entry).
11. **No telemetry.** No usage / token / error logs are sent anywhere. All
    error categorization stays local. CSP `report-uri` remains absent per
    ADR-0008 §S3 D3.
12. **Per-device, not per-user.** A user signing in on multiple devices must
    paste the key on each device. Cross-device sync of the key is out of scope
    (would require a server-side blob — explicit non-goal per ADR-0008 D2
    "mock-authenticated" auth posture).

---

## §8. Risks + open questions

| # | Risk / question | Likelihood | Mitigation |
|---|---|---|---|
| R1 | **Anthropic CORS regression.** If Anthropic withdraws the `anthropic-dangerous-direct-browser-access` opt-in, all browser direct calls 4xx. | Low (stable 18 months) | Banner copy includes "your provider may have changed its policy"; user can switch to OpenAI-compatible base URL. Documented in api.md error semantics. |
| R2 | **CSP drift.** Future contributor edits `apps/web/public/_headers` without re-reading ADR-0008 amendment. | Medium | Add a CSP source-text test in `apps/web/src/__tests__/csp.test.ts` (new) asserting `connect-src` contains `https://api.anthropic.com`; ADR-0008 amendment lists the test path as the enforcement mechanism. |
| R3 | **WebCrypto unavailability in older browsers.** Chrome < 60 / Safari < 11 do not support `SubtleCrypto.deriveKey` properly. | Very low (web target is evergreen Chrome 120 / Safari 17 / Firefox 121 per row #18 cross-vendor matrix) | `secretStore.ts` does a feature-check at module load; if absent, surfaces a one-time banner: "Your browser does not support secure key storage — please upgrade." The pane disables the key input. |
| R4 | **IndexedDB quota / private-mode.** Safari private mode and some Firefox profiles aggressively evict IndexedDB. User loses their key on the next visit. | Medium | Banner copy when load returns `null` after first paste: "Your API key was cleared — this can happen in private browsing mode. Re-paste below." `secretStore.ts` always treats a missing key as "user must re-enter" rather than "user has no key configured". |
| R5 | **User pastes a malformed key.** No client-side validation can prove a key is valid without a network round-trip. | High | Save-time "Test connection" button issues a 1-token `messages` request and reports the result. Without explicit Test, save just persists. |
| R6 | **SSE parser correctness.** Hand-rolled parser may miss edge cases (multi-line `data:` blocks, `[DONE]` sentinel, comment lines starting `:`). | Medium | Test fixture set with 8 SSE protocol edge cases (single-event, multi-event, comment, [DONE], malformed JSON, incomplete chunk, big chunk crossing buffer boundary, server abort). Reference: Anthropic + OpenAI SSE shapes are documented byte-for-byte. |
| R7 | **Existing 84 plugin-web-ai-chat tests + 100 web tests regression.** The new streaming path changes the assistant-bubble append semantics (streaming appends a placeholder then mutates in place vs append-once after promise resolves). | Medium-High | The non-streaming fallback path matches today's semantics 1:1. We add a `streamingEnabled` boolean to the module that defaults true in prod but the tests can flip false via a Vitest module-level mock to assert the legacy semantics still hold. New test category for streaming semantics is additive (new test files), not edits to existing files. |
| R8 | **CSP banner UX in dev vs prod.** In `pnpm dev`, Vite serves over `localhost:5173` without the `_headers` file. CSP-violation behaviour differs in dev vs prod. | Low | The CSP is in `apps/web/public/_headers` which Vite does NOT serve in dev. We document this in design.md and the verify gate explicitly tests against `pnpm preview` (which simulates production headers via the `cloudflare/pages` preview adapter). |
| R9 | **OpenAI-compatible CSP can't be widened generically.** Per assumption 8, only `https://api.anthropic.com` is whitelisted. Users picking OpenAI-compatible endpoints will hit CSP errors. | High (for that user flow) | Pane copy explicitly says "Anthropic-compatible providers work out-of-the-box. For OpenAI-compatible endpoints, you may need to self-host or use a CORS proxy." Per Q1 below. |
| R10 | **Test isolation.** WebCrypto tests need a real `crypto.subtle`. jsdom 22+ ships it; Vitest's default jsdom env should work. Older Vitest versions need a polyfill. | Low | `vitest.setup.ts` already calls `globalThis.crypto = crypto` if missing; verified against current jsdom version in the package. |

### Open questions for `feature-review`

- **Q1.** Should we ship a one-click "Anthropic preset" + an "Add custom
  provider" UI in this row, OR leave the OpenAI-compatible config to a
  follow-up row to keep scope tight? **Proposed:** ship both presets in this
  row — Anthropic primary, OpenAI-compatible as a secondary "Advanced" section
  in the pane. The streaming adapter handles both shapes already, so the cost
  is mostly UI copy.
- **Q2.** Do we need a `web:ai:request-started` and `web:ai:request-completed`
  pair (for future telemetry / loading spinners outside the AI module), or is
  the local `thinking` boolean enough? **Proposed:** add `web:ai:rate-limited`
  + `web:ai:request-failed` only this row (consumer = banner UI inside AI
  module). The other two channels are speculative — defer.
- **Q3.** Should the streaming adapter expose the full Anthropic event stream
  (token_usage, stop_reason, etc.) or just the concatenated text deltas?
  **Proposed:** just text deltas. The existing module has no UI for token
  usage. Future rows can extend.
- **Q4.** CSP amendment vs new ADR-0010 — decision is amend-in-place per §6.
  Reviewer to confirm or reject.
- **Q5.** Should the "Test connection" button live in Settings → AI or also
  in the AI module's composer (as a "key not configured" empty state)?
  **Proposed:** Settings only. The AI module shows a banner with "Open
  Settings → AI" link when the key is missing.

---

## §9. Acceptance signal mapping

Mapping the seed brief acceptance signals to gate evidence:

| # | Seed-brief signal | Verify mechanism | Phase |
|---|---|---|---|
| AS1 | User pastes valid Anthropic key in Settings → AI, sends a message in `/app/ai`, sees streamed tokens render in real-time. | Manual on `pnpm dev` + Chrome DevTools Network panel showing `text/event-stream` response, tokens appended to bubble incrementally. | P5 (verify) |
| AS2 | Bad key shows clear error banner; rate-limit shows countdown; offline shows reconnect prompt. | 3 unit tests in `__tests__/errorBanner.test.tsx` mocking the categorized errors; manual stress test via fake key. | P5 |
| AS3 | `xai_ai_*` storage keys do NOT contain raw API key. | `grep` test in `__tests__/no-plaintext-key.test.ts` reads `localStorage` snapshot after a save and asserts no `sk-` prefix anywhere. | P1 (key infra) |
| AS4 | 100% existing 84 ai-chat plugin tests + 51 (now 100) web tests still PASS. | `pnpm --filter @repo/plugin-web-ai-chat test` + `pnpm --filter @repo/web test`. | P1..P5 (every phase) |
| AS5 | CSP report-uri receives 0 violations on happy-path message send. | ADR-0008 §S3 D3 drops `report-uri`, so we observe DevTools Console for `Refused to connect` warnings on happy path instead. | P4 (CSP) |
| AS6 | Verify Cross-vendor: Codex cold-read confirms key storage encryption is correct and CSP changes don't widen attack surface beyond the new LLM endpoints. | Per ADR-0009 §D4: Codex `gpt-5.5-thinking medium` primary verifier reads `secretStore.ts` + `_headers` diff + ADR-0008 amendment. | P5 |

---

## §10. Conclusion

Proceed with Option A. Five-phase build plan in `dev_log.md`. CSP decision is
amend-ADR-0008-in-place (binding precedent for wave 1+2+3 CSP rows). All
existing plugin + web tests stay green; new tests are additive. ADR-0008
amendment is part of Phase P4 commit.

Sources:
- [Simon Willison — Claude API CORS support](https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/)
- [Anthropic — Streaming messages](https://docs.anthropic.com/en/docs/build-with-claude/streaming)
- [MDN — SubtleCrypto.deriveKey()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey)
- [W3C — Web Cryptography Level 2](https://www.w3.org/TR/webcrypto-2/)
- [MDN — IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
