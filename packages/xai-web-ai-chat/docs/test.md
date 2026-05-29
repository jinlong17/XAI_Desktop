# Test Strategy — xai-web-ai-chat

> Package: `@repo/plugin-web-ai-chat`
> ADR Anchor: `docs/adr/0007-xai-web-console-build-form.md` §S5 (JSX→TSX rules)

## §0. Coverage outline

- Unit (pure helpers): `claudeAdapter`, `isAiConvoRecord`, `makeConvoFromUserText`, `getStarInstances`, registration shape.
- Component (jsdom + RTL): `AiSidebar`, `AiComposer`, `AiThread`, `AiAurora`, `BreathingOrb`, `AiChatModule` (integration).
- Contract: `index-barrel.test.ts` (public surface).
- Cross-vendor manual: smoke artifact recorded in `docs/reviews/xai-web-ai-chat/20260523-verify-report.md` after P3.

Total target: **≥ 30 tests** across **12 files**. Standard `pnpm --filter @repo/plugin-web-ai-chat test` invocation. All vitest; no Playwright.

## §1. Mock strategy

- **`window.claude`**: never referenced. `claudeAdapter` is fully internal. No `globalThis.claude` shim needed in tests.
- **`Math.random`**: stubbed via `vi.spyOn(Math, "random").mockReturnValue(0.5)` in `claudeAdapter.test.ts` for deterministic delay assertions.
- **Timers**: `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync(ms)` in `claudeAdapter.test.ts` and `AiChatModule.test.tsx` integration tests. Each test in the suite explicitly calls `vi.useRealTimers()` in `afterEach` to avoid leakage.
- **`localStorage`**: cleared in `vitest.setup.ts` `afterEach`. `@repo/plugin-web-storage` reads localStorage directly — no monkey-patching needed.
- **`crypto.randomUUID`**: not used (ids are `"c-" + Date.now().toString(36)`).
- **`requestAnimationFrame`**: not used in this package (orb breathing is CSS keyframes only).
- **No network mock**: Option A has no fetch call.

## §2. File layout

```
packages/plugin-web-ai-chat/
├── vitest.config.ts
├── vitest.setup.ts            — requestAnimationFrame polyfill (defensive) + localStorage.clear afterEach + @testing-library/jest-dom
└── src/__tests__/
    ├── index-barrel.test.ts
    ├── claudeAdapter.test.ts
    ├── isAiConvoRecord.test.ts
    ├── makeConvoFromUserText.test.ts
    ├── starInstances.test.ts
    ├── AiAurora.test.tsx
    ├── BreathingOrb.test.tsx
    ├── AiSidebar.test.tsx
    ├── AiComposer.test.tsx
    ├── AiThread.test.tsx
    ├── AiChatModule.test.tsx
    └── registration.test.tsx
```

## §3. Test cases

### B — Barrel surface (`index-barrel.test.ts`)
- B1: `AiChatModule` is exported as a function.
- B2: `aiChatWebModuleRegistration` is exported and has `moduleId === "ai"`.
- B3: type-only exports compile (test-d via `// @ts-expect-error` markers on shape mismatches in a `.test-d.ts` file).
- B4: no internal-path leak — attempting `import "@repo/plugin-web-ai-chat/internal"` is not in the `exports` map (asserted by reading `package.json` exports).

### A — `claudeAdapter` (`claudeAdapter.test.ts`)
- A1: `completeChat("hi", "en")` resolves with the EN demo line.
- A2: `completeChat("你好", "zh")` resolves with the ZH demo line.
- A3: With `Math.random` stubbed to `0`, delay = 600 ms exactly.
- A4: With `Math.random` stubbed to `0.999...`, delay ≤ 1200 ms (uses `< 1200` check with fake timers advanced to 1199 ms then asserts resolved on 1200).
- A5: Adapter never rejects — `await completeChat("", "en")` resolves (does not throw for empty input).
- A6: Calling the adapter does not read or write `window.*` (asserted by reading global property descriptors before and after).

### V — `isAiConvoRecord` (`isAiConvoRecord.test.ts`)
- V1: returns true for `{ id, title, time }` with strings.
- V2: returns false for null / undefined / array / number / string.
- V3: returns false if `id` is missing or non-string.
- V4: returns false if `title` is missing or non-string.
- V5: returns false if `time` is missing or non-string.
- V6: extra properties allowed (passthrough). `{ id, title, time, foo: 1 }` returns true.
- V7: empty `title` and `time` strings allowed; empty `id` rejected.

### M — `makeConvoFromUserText` (`makeConvoFromUserText.test.ts`)
- M1: id starts with `"c-"`.
- M2: title equals `text.slice(0, 32)`.
- M3: title at 0 chars → empty string (matches artifact; the component caller short-circuits empty-text sends).
- M4: title at 32 chars → exact 32.
- M5: title at 64 chars → truncated to 32.
- M6: time = "Just now" when `lang === "en"`.
- M7: time = "刚刚" when `lang === "zh"`.

### S — `starInstances` (`starInstances.test.ts`)
- S1: returns array of length 60.
- S2: deterministic — calling twice returns deep-equal arrays.
- S3: first entry: `{ left: "0%", top: "0%", animationDelay: "0s", animationDuration: "3s", opacity: 0.3 }`.
- S4: entry 1: `left = "53%"`, `top = "97%"`.
- S5: entry 8 (i=8): `left = "(8*53)%100 = 24%"`, `top = "(8*97)%100 = 76%"`.
- S6: opacity range 0.3..0.9 inclusive.
- S7: all entries are frozen (`Object.isFrozen` true) — defensive against mutation.

### AA — `AiAurora` (`AiAurora.test.tsx`)
- AA1: renders the wrapper with class `ai-aurora` (no `thinking` modifier when prop `thinking={false}`).
- AA2: adds `thinking` modifier class when `thinking={true}`.
- AA3: contains 3 `<div class="aurora-stream">` elements (as-1/2/3) and 5 `<div class="aurora-blob">` elements (ab-1..ab-5).
- AA4: contains exactly 60 `<span class="star">` children inside `.ai-stars`.
- AA5: contains a `<div class="ai-grain">`.
- AA6: star inline styles match `getStarInstances()[i]` for the first 5 entries.

### BO — `BreathingOrb` (`BreathingOrb.test.tsx`)
- BO1: renders `<div class="orb">` containing 3 `.orb-layer` (`orb-1`, `orb-2`, `orb-3`) and `.orb-noise`.
- BO2: adds `orb-thinking` modifier when `thinking={true}`.
- BO3: does not render `<div class="ai-aurora">` (that lives in `AiAurora`, separation of concerns).

### SB — `AiSidebar` (`AiSidebar.test.tsx`)
- SB1: renders 4 default-seeded convos? **No** — the registry default is `[]`. SB1 asserts the sidebar renders an empty `<ul class="ai-convos">` when `convos = []`.
- SB2: renders one `<li class="ai-convo-row">` per convo passed in.
- SB3: clicking a convo row invokes `onSelectConvo(c.id)`.
- SB4: clicking "new chat" button invokes `onNewChat()`.
- SB5: clicking the collapse button invokes `onCollapse()`.
- SB6: marks the active convo row with the `active` className.
- SB7: ZH lang: search placeholder is "搜索对话".

### CO — `AiComposer` (`AiComposer.test.tsx`)
- CO1: typing then `Enter` calls `onSend(text)` once.
- CO2: typing then `Shift+Enter` does NOT call `onSend`; the text remains in `value`.
- CO3: `Enter` with whitespace-only text does not call `onSend`.
- CO4: "send" button click calls `onSend`.
- CO5: opening the model popover and choosing "sonnet" invokes `onModelChange("sonnet")`.
- CO6: clicking outside the popover via `.popover-scrim` closes it (asserted by absence of `.ai-model-popover` after click).
- CO7: voice mic toggle invokes `onVoiceToggle()` and the rendered icon switches between `sound` and `soundOff` based on `voiceOn` prop.
- CO8: attach button click opens the hidden file input (asserted by checking `<input type="file">` exists in DOM with `multiple` attribute; the actual file-picker is browser-side and not testable in jsdom).
- CO9: when `attachments` prop is non-empty, each chip renders with a remove button; clicking it invokes `onRemoveAttachment(index)`.

### TH — `AiThread` (`AiThread.test.tsx`)
- TH1: when `messages.length === 0` renders the `<div class="ai-welcome">` with the bilingual heading.
- TH2: when `showInsights={true}` AND `messages.length === 0`, renders 4 `.ai-starter` buttons.
- TH3: when `showInsights={false}`, starters are NOT rendered.
- TH4: clicking a starter invokes `onStarter(prompt)`.
- TH5: when `messages.length > 0`, renders one `.ai-msg` per message with the role className.
- TH6: when `thinking={true}`, appends a `.ai-typing` bubble at the bottom.
- TH7: assistant messages render the `<span class="ai-avatar">` icon.
- TH8: a user message with `attachments` renders `.ai-msg-attach` pills.

### M — `AiChatModule` integration (`AiChatModule.test.tsx`)
- I1: mounts with `lang="en"` and shows the EN welcome heading.
- I2: mounts with `lang="zh"` and shows the ZH welcome heading.
- I3: types "hello" + Enter → user bubble appears immediately, `.orb-thinking` class appears on the orb wrapper.
- I4: after `vi.advanceTimersByTimeAsync(1200)`, assistant bubble appears with the EN demo line, `.orb-thinking` clears.
- I5: localStorage `xai_ai_convos` contains a new convo with `title = "hello"` after I3 settles.
- I6: clicking "new chat" clears `messages` but leaves `xai_ai_convos` intact.
- I7: toggling the Insights pill flips `xai_ai_insights` localStorage from `true` to `false` and removes starters from DOM.
- I8: toggling the voice mic flips `xai_ai_voice` localStorage; mic icon swaps.
- I9: model picker default is "haiku"; selecting "opus" updates the displayed model name.
- I10: corrupted convo entry in localStorage (e.g. `[{}, {id:"ok",title:"t",time:"1"}]`) is filtered — only the valid one renders. Dev `console.warn` is emitted once.
- I11: Enter with empty input is a no-op (no new bubble, no thinking state, no convo created).
- I12: unmounting the component during `thinking` does NOT throw and does NOT append a stale assistant bubble (re-mount + assert convos unchanged).
- I13: sidebar collapse button hides the `.open` class on `.ai-side`; re-opening restores it. (Internal-state assertion since collapse is local UI state, not persisted.)
- I14: clicking an existing convo row switches `activeConvo` and clears `messages` (matches artifact).
- I15: pressing Enter twice in rapid succession (without waiting for adapter) appends two user bubbles synchronously and produces exactly two assistant bubbles after both adapter promises drain (no duplicates, no drops). DOM order is `user("one") → user("two") → assistant → assistant`, asserting that the FIFO queue serializes resolution.
- I16: `prefers-reduced-motion: reduce` matchMedia query: the CSS rule presence is asserted by reading the stylesheet rule list. (jsdom does not honour `prefers-reduced-motion`, so this is a CSS-source-text test rather than runtime behaviour.)
- I17 (resend-while-thinking regression guard): the design.md state machine specifies that a second `send()` during `thinking` is **queued behind the current promise**, never raced. This test stubs `claudeAdapter.completeChat` with externally-resolvable promises and asserts that after two synchronous `send()` calls, the adapter has been invoked **exactly once** (not twice — that would be the racing impl). Resolving the first promise advances the queue; the adapter is then invoked a second time. Resolving the second promise drains the queue and clears `thinking`. The DOM order is `user("first") → user("second") → assistant("REPLY-1") → assistant("REPLY-2")`.
- I18 (lang preservation across queued resends): a `send()` under `lang="en"` followed by a `rerender({lang:"zh"})` and a second `send()` must produce one EN assistant bubble (the in-flight call retains its capture-time `lang`) followed by one ZH assistant bubble (the queued call uses its enqueue-time `lang`). Verifies the queue item shape `{text, lang}` correctly snapshots the language per item.

### R — `registration` (`registration.test.tsx`)
- R1: `aiChatWebModuleRegistration.moduleId === "ai"`.
- R2: `railOrder === 1`.
- R3: `icon === "sparkle"`.
- R4: `i18nKey === "nav.ai"`.
- R5: `showInRail === true`.
- R6: `children[0].render` renders an `<AiChatModule>` when wrapped in a `WebShellProvider` with `lang="en"`.

## §4. Acceptance criteria (from seed brief)

The seed brief acceptance signal:

> AI Chat opens, full aurora background renders without jank, breathing orb animates idle→thinking on Enter, message round-trips through the adapter (or demo fallback), and conversation history persists.

Mapped to verify gates:

| V# | Gate | Mechanism |
|---|---|---|
| V1 | AI Chat opens | apps/web vite dev server boots; `/modules/ai` route renders `AiChatModule` |
| V2 | Aurora renders without jank | DevTools Performance: no `layout` or `paint` events scheduled outside the `transform`/`opacity` channel during a 5 s capture; no `composite-layers` recomputation per frame; ≥ 55 FPS sustained on `ai-aurora.thinking` |
| V3 | Breathing orb animates idle→thinking on Enter | Manual: type, press Enter, observe orb size shrink (`.orb` `transform: scale(.4) translateY(40%)`) + speed-up classes |
| V4 | Adapter round-trip | After Enter, assistant bubble appears within ≤ 1300 ms with the EN/ZH demo line |
| V5 | History persists | After Enter + reload, the new convo title still appears in the sidebar; `xai_ai_convos` JSON deserialises to the new array |
| V6 | Lint clean | `pnpm --filter @repo/plugin-web-ai-chat lint` exits 0 with `--max-warnings 0` |
| V7 | Typecheck clean | `pnpm --filter @repo/plugin-web-ai-chat typecheck` exits 0 |
| V8 | Test suite green | `pnpm --filter @repo/plugin-web-ai-chat test` exits 0; all cases pass |
| V9 | Vite build green | `pnpm --filter @repo/web build` exits 0; no missing-export warnings |
| V10 | Cross-vendor smoke | Chrome 120 / Safari 17 / Firefox 121 render aurora + breathing orb visually identical (within accent-color tolerance) |
| V11 | Shell registration verified | `aiChatWebModuleRegistration` consumed in `shellRegistrations.tsx`, the AI rail icon clickable, route lands on the module |
| V12 | Reduced-motion respected | DevTools `Emulate CSS prefers-reduced-motion: reduce`; aurora & stars freeze; orb pauses |

V10 + V12 are manual; the rest are automated.

## §5. Lint discipline

- `eslint.config.js` extends `@repo/eslint-config/react-internal` (sibling pattern).
- `@typescript-eslint/no-explicit-any: error` enforced. No `any`, no `@ts-ignore`, no `// @ts-expect-error` outside the dedicated `.test-d.ts` file.
- Adapter type signature: `completeChat(text: string, lang: Lang): Promise<string>`. No `unknown` in the return type.
- All inline-bilingual ternaries (`lang === "zh" ? "…" : "…"`) wrapped in helper if used in three or more sites: introduce a local `tt(en, zh, lang)` helper inside `AiChatModule.tsx` to keep DRY. Single-use sites stay inline.
- React-hook deps: every `useEffect` / `useMemo` / `useCallback` dependency array is exact-match (lint rule `react-hooks/exhaustive-deps: error` from the shared config).

## §6. Cleanup behaviour

- All vitest cases use `afterEach(() => { vi.useRealTimers(); localStorage.clear(); vi.restoreAllMocks(); })`.
- The integration test for unmount during `thinking` (I12) explicitly captures the warning that `mountedRef.current = false` prevents the stale append.

---

## §7. 2026-05-25 Extension — Real LLM Adapter test strategy (gap-closure row #2)

> §0..§6 above continues to apply byte-for-byte. The 84 cases described above
> + the 2 bugfix-cycle-1 cases (I17, I18) MUST stay green. This §7 is purely
> additive: new test files + a small number of modifications to existing test
> files that are explicitly enumerated below.

### §7.0 Test scope summary (extension)

| Category | Files | Cases | Acceptance |
|---|---|---|---|
| Existing 86 cases (status quo) | 12 files in `packages/plugin-web-ai-chat/src/__tests__/` | 86 | All green, NO regressions allowed |
| New unit (key storage) | `secretStore.test.ts` | 8 | green |
| New unit (error classifier) | `llmErrors.test.ts` | 12 | green |
| New unit (SSE parser) | `sseParser.test.ts` | 8 | green |
| New unit (provider resolver) | `llmProvider.test.ts` | 6 | green |
| New integration (stream adapter) | `claudeStreamAdapter.test.ts` | 10 | green |
| New component (ErrorBanner) | `ErrorBanner.test.tsx` | 5 | green |
| New no-plaintext-key invariant | `no-plaintext-key.test.ts` | 1 | green (AS3 acceptance signal) |
| Modified barrel | `index-barrel.test.ts` | +3 (B5, B6, B7) | green |
| Modified claudeAdapter | `claudeAdapter.test.ts` | A1..A6 STAY (now run against fetch mock) + 2 new fallback cases (A7, A8) | green |
| Modified module integration | `AiChatModule.test.tsx` | I1..I18 STAY + 5 new (I19..I23) | green |
| New Settings → AI pane | `packages/plugin-web-settings-rest/src/__tests__/aiPane.test.tsx` | 12 | green |
| New CSP guard | `apps/web/src/__tests__/csp.test.ts` | 1 | green (R2 mitigation) |
| Existing `plugin-web-settings-rest` 81 cases | as-is | 81 | All green, NO regressions |
| Existing `apps/web` 100 cases | as-is | 100 | All green, NO regressions |

Cumulative new cases: ~74 (50 in plugin-web-ai-chat ext + 12 pane + 1 CSP + 11 modifier-additions).

### §7.1 Mock strategy (extension)

- **`fetch`**: stubbed via `vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(...))` per test. Each test constructs its own `Response` with body / headers / status to drive the test.
- **`Response.body` (ReadableStream)**: tests construct streams via `new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(...)); controller.close(); } })`. Multi-chunk tests enqueue multiple times before closing.
- **`crypto.subtle`**: jsdom 22+ ships a working WebCrypto. `vitest.setup.ts` adds a guard: if `globalThis.crypto?.subtle` is missing, throw a clear "WebCrypto not available — upgrade jsdom" error so the test author knows to update.
- **`indexedDB`**: `fake-indexeddb` (added as devDep this row; widely used; ~30KB; no runtime impact). `vitest.setup.ts` imports `fake-indexeddb/auto` BEFORE any test runs.
- **`createDeviceIdentityStore`**: NOT mocked. The real implementation (uses `idb-keyval`) runs against `fake-indexeddb`. Per-test cleanup wipes the IDB instance.
- **`AbortController`**: native, used as-is.
- **`@repo/plugin-web-storage` `usePref`**: NOT mocked. Real implementation runs against the cleared-per-test localStorage. New keys (`xai_ai_provider` etc.) are tested via real round-trip.
- **`emitWebEvent` / `useWebEventListener`**: NOT mocked. Real bus singleton in jsdom; tests use `onWebEvent(...)` to assert emissions.

### §7.2 New test file scope

#### `secretStore.test.ts` (8 cases)

- SC1: Save then load returns the same plaintext. (Round-trip.)
- SC2: Load before any save returns `null`.
- SC3: Save twice with different plaintexts: load returns the LATEST.
- SC4: Clear after save: subsequent load returns `null`.
- SC5: Load after device id is rotated (simulate `createDeviceIdentityStore().clear()` then `.ensure()`): returns `null` (decryption fails, row is auto-cleared).
- SC6: Save with `crypto.subtle === undefined` throws a typed error.
- SC7: Save with IndexedDB write failure (mock `idb-keyval.set` to throw) throws with the original cause attached.
- SC8: Save then read raw IDB row: ciphertext is NOT the plaintext (assertion: `Uint8Array → string` decode does not contain the plaintext substring).

#### `llmErrors.test.ts` (12 cases)

- LE1..LE4: BadKey 401 / 403 + with/without detail body.
- LE5..LE6: RateLimited 429 with `Retry-After: 30` → `retryAfterSec: 30`; with `Retry-After: Mon, 01 Jan 2030 00:00:00 GMT` → numeric delta from `Date.now`.
- LE7..LE8: Server 500 / 503 with body slice + without body.
- LE9: Malformed json-parse (response body is `"{not valid json"`) → kind `"Malformed"`, where `"json-parse"`.
- LE10: Malformed sse-parse (chunk is `"event: foo\\nbad data:\\n"`) → kind `"Malformed"`, where `"sse-parse"`.
- LE11: Network (Error TypeError "Failed to fetch") → kind `"Network"`, cause preserved.
- LE12: Unknown 418 (I'm a teapot) → kind `"Server"`, status 418.

#### `sseParser.test.ts` (8 cases)

- SP1: Single complete event: `event: content_block_delta\ndata: {"delta":{"text":"hi"}}\n\n` → yields one event with parsed JSON.
- SP2: Multiple events in one chunk: yields N events in order.
- SP3: Event split across two chunks (test buffer accumulation): yields one event after second chunk.
- SP4: Empty lines in middle: ignored.
- SP5: Comment line `: keepalive` at start: ignored.
- SP6: `[DONE]` sentinel (OpenAI-compatible): yields one synthetic done event.
- SP7: Server abort (controller.error()): iterator throws.
- SP8: Empty stream (zero bytes): iterator completes without yielding.

#### `llmProvider.test.ts` (6 cases)

- LP1: Anthropic provider + model "haiku" → URL `https://api.anthropic.com/v1/messages`, headers contain `anthropic-version` + `anthropic-dangerous-direct-browser-access: true` + `x-api-key`, body `{model: "claude-haiku-4-5-...", messages, stream:true, max_tokens:1024}`.
- LP2: OpenAI-compatible provider + base URL `https://api.groq.com/openai/v1` → URL appended `/chat/completions`, headers contain `Authorization: Bearer ...`, body `{model, messages, stream:true}`.
- LP3: OpenAI-compatible with empty base URL → throws typed config error.
- LP4: Provider switch via `xai_ai_provider` pref → headers + URL flip accordingly.
- LP5: Model picker override (composer chooses sonnet) → body.model is sonnet's real id.
- LP6: Stream pref OFF → body.stream is `false`.

#### `claudeStreamAdapter.test.ts` (10 cases)

- CS1: Happy path Anthropic stream — yields 3 chunks then done; accumulated equals concatenation.
- CS2: Happy path OpenAI-compatible (provider switch via pref) — yields 2 chunks then done.
- CS3: Mid-stream abort via `AbortController.abort()` — iterator returns early; no throw.
- CS4: Bad key 401 — throws `LlmError({kind:"BadKey"})`.
- CS5: Rate-limited 429 with `Retry-After: 60` — throws `LlmError({kind:"RateLimited", retryAfterSec:60})` AND emits `web:ai:rate-limited` event with `retryAfterSec:60`.
- CS6: Network reject (fetch throws TypeError) — throws `LlmError({kind:"Network"})` AND emits `web:ai:request-failed`.
- CS7: Server 503 — throws `LlmError({kind:"Server", status:503})` AND emits `web:ai:request-failed`.
- CS8: Malformed SSE — throws `LlmError({kind:"Malformed"})`.
- CS9: Streaming-unavailable (Response.body is null) — falls back to non-stream `completeChat`; yields one final chunk with full text.
- CS10: No key configured — throws `LlmError({kind:"BadKey", detail:"not-set"})`.

#### `ErrorBanner.test.tsx` (5 cases)

- EB1: kind="BadKey" with detail="not-set" → renders "Please configure your API key" copy + "Open Settings → AI" link.
- EB2: kind="BadKey" without detail → renders "Your API key was rejected" copy + "Open Settings → AI" link.
- EB3: kind="RateLimited" with retryAfterSec=30 → renders countdown "Retry in 30s"; advances 1s with fake timers → "Retry in 29s"; advances 30s → "Retry" button enabled.
- EB4: kind="Network" → renders network copy + "Retry" enabled immediately; clicking Retry invokes onRetry prop.
- EB5: Dismiss button hides the banner.

#### `no-plaintext-key.test.ts` (1 case — AS3 acceptance signal)

- NP1: After `aiKeyStorage.saveKey("anthropic", "sk-ant-test-12345")`, snapshot all keys in `localStorage` AND all values in the `xai-web-ai-secrets` IDB store. The plaintext substring `"sk-ant-test"` must NOT appear in any localStorage value OR the IDB ciphertext blob. (The IDB row contains `{ciphertext: Uint8Array, ...}` where the Uint8Array decode does not contain the substring.)

### §7.3 Modified test file deltas

#### `index-barrel.test.ts` — +3 cases

- B5: `streamCompleteChat` is exported as a function.
- B6: `aiKeyStorage` is exported as an object with `loadKey`, `saveKey`, `clearKey`, `testConnection` function members.
- B7: `LlmError` type-only export compiles (`.test-d.ts` adjacency check).

#### `claudeAdapter.test.ts` — A1..A6 STAY + A7..A8 added

The original A1..A6 (no-op delay + bilingual string + Math.random determinism)
continue to pass, BUT they now stub `fetch` to return a 200 response with the
demo string in the body. The adapter's body is rewritten to: if no key
configured → return demo string (preserves the existing UX for users who have
not configured a key yet); if key configured → call real fetch.

- A7 (new): With API key configured + Anthropic provider mock — `completeChat`
  returns the accumulated assistant text from the streaming adapter.
- A8 (new): With API key configured + classify throws `BadKey` — `completeChat`
  re-throws (no longer swallows; the FIFO queue in module catches it).

#### `AiChatModule.test.tsx` — I1..I18 STAY + I19..I23 added

I1..I18 stay green because:
- The integration test stubs `fetch` (or `streamCompleteChat`) such that the
  resulting assistant bubble text matches the existing expected demo line.
  The test helper exports `mockNoOpStream()` that makes the adapter behave as
  the SHIPPED no-op for backward-compat assertions.

New cases:

- I19 (streaming bubble mutation): mock `streamCompleteChat` to yield 3 chunks
  `["He", "llo", " world"]`. Assert the assistant bubble's DOM text grows from
  empty → "He" → "Hello" → "Hello world" across `await vi.advanceTimersByTimeAsync(0)` flushes.
- I20 (key-missing banner): without any key configured, type + Enter →
  `ErrorBanner` appears with "Please configure your API key" copy + the
  "Open Settings → AI" link is clickable and emits a
  `web:shell:module-change` with `moduleId:"settings"`.
- I21 (rate-limited banner): mock fetch to return 429 with `Retry-After: 5` →
  banner appears with countdown; orb clears `.thinking`; assistant bubble is
  NOT appended.
- I22 (Settings link emits shell event): clicking "Open Settings → AI" in the
  banner emits `web:shell:module-change` with `moduleId:"settings"` AND
  `detailId:"ai"` (so the Settings module can scroll to the AI pane).
- I23 (unmount mid-stream): mount + send + while iterator is yielding chunk 2
  of 3, unmount → no throw; `AbortController.signal.aborted` is true on the
  in-flight fetch (assert via the mock).

#### `packages/plugin-web-settings-rest/src/__tests__/aiPane.test.tsx` — 12 NEW cases

- AP1: Pane renders provider picker, key input, model picker, streaming
  toggle.
- AP2: Pasting a key + Save → `aiKeyStorage.saveKey` called with the
  paste text.
- AP3: Save shows "Saved" flash 1800 ms (matches appearance pane pattern).
- AP4: "Test Connection" success — mock returns `{ok:true}` → green check
  icon + "Connection OK" copy.
- AP5: "Test Connection" failure — mock returns
  `{ok:false, error:{kind:"BadKey", status:401}}` → red x + "Invalid key" copy.
- AP6: "Test Connection" rate-limited — `{ok:false, error:{kind:"RateLimited", retryAfterSec:30}}` →
  amber clock + "Rate-limited, try again in 30s" copy.
- AP7: "Delete API key" opens native dialog; cancel closes.
- AP8: "Delete API key" confirm calls `aiKeyStorage.clearKey` and the field
  shows the empty-state copy.
- AP9: Provider switch from `"anthropic"` to `"openai-compatible"` shows the
  Base URL field (hidden when Anthropic).
- AP10: Model default picker writes to `xai_ai_model_default` pref.
- AP11: Streaming toggle writes to `xai_ai_streaming` pref.
- AP12: ZH lang — all copy switches to ZH bundle.

#### `apps/web/src/__tests__/csp.test.ts` — 1 NEW case (R2 mitigation)

- CSP1: Read `apps/web/public/_headers`, parse CSP header; assert
  `connect-src` directive contains both `'self'` AND `https://api.anthropic.com`;
  assert `script-src` still equals `'self'` (no widening); assert no
  `'unsafe-inline'` / `'unsafe-eval'` / `*` introduced.

### §7.4 Acceptance gate mapping (extension)

| Gate | Mechanism |
|---|---|
| AS1 — User sends real message → streamed tokens | Manual via `pnpm dev` (apps/web) + DevTools Network shows `text/event-stream`; tokens append to bubble |
| AS2 — 3 error categories show appropriate banner | EB1..EB5 + I20..I22 |
| AS3 — `xai_ai_*` does NOT contain raw key | NP1 |
| AS4 — Existing 84 (now 86) plugin tests + 100 web tests still PASS | Vitest full run after each phase |
| AS5 — 0 CSP violations on happy path | Manual; complemented by CSP1 source-text guard |
| AS6 — Cross-vendor (Codex cold-read of key storage + CSP) | P5 verify gate |

### §7.5 Cleanup behaviour (extension)

- `afterEach`: clear `fake-indexeddb` instance (`indexedDB.deleteDatabase("xai-web-ai-secrets"); indexedDB.deleteDatabase("xai-web-auth");`); reset `fetch` spy; same `vi.useRealTimers(); vi.restoreAllMocks(); localStorage.clear();` from §6.
- WebCrypto-derived keys are non-extractable (per design); tests rely on
  round-trip plaintext equality rather than inspecting key material directly.

---

## §8. 2026-05-29 Extension — AI Tool Layer test strategy (xai-web-ai-tool-layer)

> §0..§7 continue to apply. All SHIPPED ai-chat cases (incl. the §7 real-LLM
> adapter cases, I1..I23, EB/SC/LE/SP/LP/CS, and the bugfix-cycle-1 I17/I18)
> MUST stay green as a regression guard in every phase. This §8 is purely
> additive. Design: §design.md 2026-05-29 Extension. Contract: §api.md §13.
> Carve-out: `docs/reviews/_p0-carve-outs/20260529-ai-tool-layer.md`.

### §8.0 Scope summary (extension)

| Phase | New test files / deltas | Focus |
|---|---|---|
| P1 | `contextProvider.test.ts` | read-selector narrowing + today-filter + empty + token-budget + injection |
| P2 | `toolUse-stream.test.ts`, `llmProvider.test.ts` (+cases), `claudeStreamAdapter.test.ts` (+cases), `claudeAdapter`/SHIPPED-adapter regression | tool-use wire protocol on the adapter |
| P3 | `toolRegistry.test.ts`, `ConfirmationCard.test.tsx`, `AiChatModule.test.tsx` (+tool-flow cases incl. NO-SILENT-WRITE) | registry + confirmation state machine |
| P4 | `xai-web-tasks/.../aiCreateSubscriber.test.ts`, `xai-web-calendar/.../aiCreateSubscriber.test.ts`, `AiChatModule` round-trip cases, `@repo/core` typecheck | write event round-trip + bounded single round-trip |
| P5 | `isAiConvoRecord` back-compat case + full-suite green | persistence back-compat + polish |

### §8.1 Mock strategy (extension)

- **LLM tool-use responses MOCKED.** `fetch` stubbed to return either (a) a canned SSE `ReadableStream` containing the §2.5 tool_use golden (`content_block_start` tool_use → `input_json_delta` fragments → `content_block_stop` → `message_delta{stop_reason:"tool_use"}`), or (b) a non-stream JSON body with a `tool_use` content block + `stop_reason:"tool_use"`. NO real network.
- **Event bus:** real `emitWebEvent`/`useWebEventListener` (in-process); assert emissions + subscriber effects.
- **Store:** real `getPref`/`setPref`/`usePref` over `localStorage` (cleared `afterEach`); subscribers tested against real store mutation.
- **`now`:** injected `Date` into `buildTodayContext` + subscribers (deterministic today-filter).
- Reuse §1/§7.1 mocks (timers, Math.random, fake-indexeddb).

### §8.2 New test cases

#### `contextProvider.test.ts` (P1)
- CP-1: `xai_task_cols` narrowed; today + overdue OPEN tasks included with title+bucket; `done:true` excluded from "to do" framing.
- CP-2: malformed `xai_task_cols` entry dropped silently (no throw) — mirrors `narrowTaskCols`.
- CP-3: `xai_calendar_events` today-only filter (event tomorrow excluded; recurring daily event included for today); local-clock `startISO` basis (no TZ shift).
- CP-4: `xai_pomodoro_sessions` today focus-minute sum + count correct; non-today sessions excluded.
- CP-5: `xai_habits_state` today checked/total correct.
- CP-6: all-empty → `isEmpty:true` + honest "no data" line; never throws on absent keys.
- CP-7: token budget — output length ≤ budget (cap list lengths) with a large fixture.
- CP-8: pure + deterministic — same `now`+store → identical text (no entropy).

#### `toolUse-stream.test.ts` + adapter deltas (P2)
- TU-1: SSE stream with the §2.5 tool_use golden → adapter surfaces a `tool_use` result `{ id, name:"create_task", input:{title,...} }` with `stop_reason:"tool_use"`.
- TU-2: `input_json_delta` fragments accumulated per content-block INDEX; `JSON.parse` once at `content_block_stop` (a per-delta parse would throw — assert it does NOT).
- TU-3: interleaved text block (index 0) + tool_use block (index 1) → BOTH surfaced (preamble text + tool use).
- TU-4: non-stream JSON response with tool_use block + `stop_reason:"tool_use"` → same result shape.
- TU-5: `buildBody` emits `tools` + omits `tool_choice` (→auto) on Anthropic branch when key present; openai-compatible branch OMITS `tools`.
- TU-6: `buildBody` with `content: ContentBlock[]` (assistant tool_use turn + user tool_result turn) produces a valid Anthropic body; `content: string` path byte-for-byte unchanged (regression).
- TU-7: tool_result round-trip body — `messages` carries assistant tool_use turn THEN user `tool_result{tool_use_id,content,is_error?}`.
- TU-REG: ALL SHIPPED `claudeStreamAdapter`/`sseParser`/`llmProvider`/`claudeAdapter` cases (§7.2) STAY GREEN (text-only path untouched).

#### `toolRegistry.test.ts` (P3)
- TR-1: `AI_TOOLS` has exactly 2 entries (`create_task`, `create_calendar_event`); names match `^[a-zA-Z0-9_-]{1,64}$`.
- TR-2: `create_task` input_schema requires `title`; bucket enum closed; tag enum closed.
- TR-3: `create_calendar_event` input_schema requires `title`+`date`; defaults documented; `input_examples` schema-valid.
- TR-4: `toConfirmation` renders human line bilingually.
- TR-5: `toWriteEvent` maps validated input → correct channel + payload (bucket default "next7"; durationMin clamp ≥5; date/time passthrough; requestId propagated).

#### `ConfirmationCard.test.tsx` (P3)
- CC-1: renders proposed-action line + Confirm + Cancel.
- CC-2: Confirm fires `onConfirm` once; Cancel fires `onCancel` once.
- CC-3: bilingual copy (en/zh).

#### `AiChatModule.test.tsx` tool-flow cases (P3/P4)
- IT-1: tool_use stream → ConfirmationCard rendered; queue paused.
- IT-2 (**NO-SILENT-WRITE — acceptance anchor**): reach pendingConfirmation, do NOT click Confirm → ZERO write events emitted + ZERO store-key mutations (`xai_task_cols`/`xai_calendar_events` unchanged).
- IT-3: Cancel → `tool_result(is_error:true)` round-trip + idle + still zero writes.
- IT-4: Confirm → `web:tasks:create-requested` emitted EXACTLY once with mapped payload + requestId === tool_use.id; then ONE final stream turn.
- IT-5 (**bounded single round-trip**): after Confirm+tool_result, the model's final turn is plain text (no second tool turn executed even if the mock returns another tool_use — counter cap = 1).
- IT-6: context injected on send (assert `buildBody` messages include the context text when a key is set).
- IT-REG: I1..I23 (SHIPPED) STAY GREEN via the existing `mockNoOpStream()` helper (no tool_use → no confirmation path).

#### Owning-module subscriber tests (P4)
- `xai-web-tasks/aiCreateSubscriber.test.ts`:
  - TS-1: on `web:tasks:create-requested`, `xai_task_cols` gains the new card via `addCard` (title+bucket+tag mapped); count incremented.
  - TS-2: idempotent per `requestId` (duplicate emit → single card).
  - TS-3: route-independent — subscriber executes without `TasksModule` mounted (imperative `getPref`/`setPref`).
  - TS-4: no cross-plugin import (source-text/dep guard — ai-chat not imported).
- `xai-web-calendar/aiCreateSubscriber.test.ts`:
  - CS-1: on `web:calendar:create-requested`, `xai_calendar_events` gains a `UserCalEvent` via `createEvent` (local-clock same-day startISO/endISO, ≥+5min, colorPreset mint, recurrence null).
  - CS-2: idempotent per `requestId`.
  - CS-3: route-independent.
  - CS-4: no cross-plugin import guard.

#### `@repo/core` typecheck (P4)
- CORE-1: `pnpm --filter @repo/core typecheck` green with the 2 new EventMap entries; existing `web:ai:*` entries unchanged.

#### Back-compat + persistence (P5)
- BC-1: `isAiConvoRecord` accepts a SHIPPED-shape record AND an extended record (optional tool-call fields) — no rejection of either.
- BC-2: full suites green: `pnpm --filter @repo/plugin-web-ai-chat test`, `--filter @repo/plugin-web-tasks test`, `--filter @repo/plugin-web-calendar test`, `--filter @repo/core typecheck`, `--filter @repo/web test`+`build`.

### §8.3 Acceptance gate mapping (extension)

| Acceptance anchor (carve-out §5) | Mechanism |
|---|---|
| AI answers "what's on today?" grounded in real state | CP-1..CP-8 (context correctness) + IT-6 (injection present); runtime grounded answer = operator real-key smoke (deferred) |
| AI proposes create → confirmation card → Confirm → real item created via owning reducer (verified in owner store) | IT-1/IT-4 + TS-1/CS-1 (store mutation) |
| NO silent writes / nothing without explicit confirm | **IT-2** (pending-not-confirmed → 0 writes) + IT-3 (cancel → 0 writes) + confirm-handler-only emit |
| Bounded round-trip (no agentic loop) | IT-5 (counter cap = 1) |
| `isAiConvoRecord` backward-compatible | BC-1 |
| No regression in SHIPPED behaviour | TU-REG + IT-REG + full SHIPPED suite green every phase |
| Cross-vendor + real-LLM tool round-trip | DEFERRED operator smoke (ADR-0008 §S3 / ADR-0009 §D2-G2) — verify-report records deferral |

### §8.4 Cleanup behaviour (extension)

- `afterEach`: `localStorage.clear()` (resets `xai_task_cols`/`xai_calendar_events`/context source keys); reset `fetch` SSE mock; unsubscribe any event listeners registered in the test; `vi.useRealTimers(); vi.restoreAllMocks();` per §6/§7.5.
- Injected `now` Dates only (no real-clock dependence in context/subscriber tests).

## §9. 2026-05-29 Extension — AI Tool Layer Edit/Delete test strategy (xai-web-ai-tool-edit-delete)

> §0..§8 continue to apply. ALL SHIPPED ai-chat cases (incl. §7 + §8 tool-layer
> cases: CP-1..CP-8, TU-*, TR-1..TR-5, CC-1..CC-3, IT-1..IT-6, TS-1..TS-4,
> CS-1..CS-4, CORE-1, BC-1, plus I1..I23/I17/I18) MUST stay green as a
> regression guard in every phase — **the create path must not regress**.
> This §9 is purely additive. Design: §design.md 2026-05-29 Edit/Delete
> Extension (ED-1..ED-13). Contract: §api.md §14. Carve-out:
> `docs/reviews/_p0-carve-outs/20260529-ai-tool-edit-delete.md`.

### §9.0 Scope summary (extension)

> Delete phased before update (manifest P2 < P3). The drift-prevention pivot:
> reducer unit tests assert the EXACT documented signatures, and IT tests assert
> the EXACT confirm-only emit — so verify can mechanically diff doc-vs-code
> (ED-R1, the prior-BLOCK cause).

| Phase | New test files / deltas | Focus |
|---|---|---|
| P1 | `xai-web-tasks/tasksReducer.test.ts` (+TR-DEL/+TR-UPD), `contextProvider.test.ts` (+CP-ID), `@repo/core` typecheck | reducer purity + preserve-done + referential-equality + id exposure + 4 channels typecheck |
| P2 | `toolRegistry.test.ts` (+TR-DEL-TOOL), `ConfirmationCard.test.tsx` (+CC-TONE), `AiChatModule.test.tsx` (+IT-DEL no-silent-write/bounded), tasks/calendar mutate-subscriber tests (+TS-DEL/+CS-DEL) | delete tools + destructive confirmation + delete round-trip + delete subscribers |
| P3 | `toolRegistry.test.ts` (+TR-UPD-TOOL), `AiChatModule.test.tsx` (+IT-UPD), tasks/calendar mutate-subscriber tests (+TS-UPD/+CS-UPD incl. bucket-move composition + preserve-done) | update tools + update round-trip + update subscribers |
| P4 | back-compat (BC-1 re-assert) + full-suite green + id-targeting end-to-end | persistence back-compat + polish + create-path no-regression |

### §9.1 Mock strategy (extension)

- Reuse §8.1 entirely. LLM tool-use responses MOCKED via canned SSE/JSON with a `tool_use` block whose `input` carries an `id` copied from a seeded context fixture (proves id-targeting round-trips end to end).
- Real `emitWebEvent`/`useWebEventListener` (in-process) for the 4 new channels; real `getPref`/`setPref`/`usePref` over `localStorage` (cleared `afterEach`); injected `now`.
- Reducer tests are PURE (no mocks) — direct `deleteCard`/`updateCard` calls with frozen `TaskCol[]` fixtures.

### §9.2 New test cases

#### `xai-web-tasks/tasksReducer.test.ts` (P1) — reducer purity (the anti-drift core)
- **TR-DEL-1:** `deleteCard(prev, id)` removes the matching card; that column's `count` decremented by 1.
- **TR-DEL-2:** untouched columns returned by REFERENCE — assert `result[i] === prev[i]` for every column not holding the card.
- **TR-DEL-3:** `deleteCard` with an id in NO column returns `prev` UNCHANGED (same reference).
- **TR-DEL-4:** `deleteCard` does not mutate `prev` (deep-freeze fixture → no throw; `prev` identical after call).
- **TR-UPD-1:** `updateCard(prev, id, {title})` rewrites BOTH `title.en` + `title.zh`; all other fields untouched.
- **TR-UPD-2 (preserve-done — T-10 lifeline):** `updateCard` on a card with `done:true` and a `{title}` patch → result card STILL has `done:true`. Assert explicitly.
- **TR-UPD-3:** `updateCard` preserves `tag`/`date`/`dateZh`/`inbox` when not in the patch; sets `tag` when in the patch.
- **TR-UPD-4:** `updateCard` NEVER overwrites `id` (patch with a stray `id`-like field cannot change the card id; merge re-pins `id: card.id`).
- **TR-UPD-5:** untouched columns returned by REFERENCE (`result[i] === prev[i]`).
- **TR-UPD-6:** `updateCard` with id in no column OR an empty patch returns `prev` UNCHANGED (same reference).
- **TR-UPD-7:** `updateCard` does not mutate `prev` (deep-freeze fixture).

#### `contextProvider.test.ts` (P1) — id exposure
- **CP-ID-1:** rendered task line includes `(id: <card.id>)` for each open task (assert the exact id token present in `text`).
- **CP-ID-2:** rendered calendar line includes `(id: <event.id>)` for each today event.
- **CP-ID-3:** title/time/bucket-label content unchanged vs SHIPPED §8 CP-1/CP-3 (regression — id is additive, not a replacement).
- **CP-ID-4:** token budget still ≤ ~600 with a large fixture + ids (TASK_CAP=20 + today-only calendar bound the count).
- **CP-REG:** CP-1..CP-8 (SHIPPED §8) stay green.

#### `toolRegistry.test.ts` deltas
- **TR-DEL-TOOL-1 (P2):** `AI_TOOLS` grows to include `delete_task` + `delete_calendar_event`; names match `^[a-zA-Z0-9_-]{1,64}$`; each `input_schema` requires `id`.
- **TR-DEL-TOOL-2 (P2):** `delete_task.toWriteEvent(input, toolUseId)` → `{ channel:"web:tasks:delete-requested", payload:{ requestId:toolUseId, id, requestedAt } }`; calendar analog → `web:calendar:delete-requested`.
- **TR-DEL-TOOL-3 (P2):** `delete_task.toConfirmation` returns `tone:"destructive"` + description naming the item.
- **TR-UPD-TOOL-1 (P3):** `AI_TOOLS` grows to 6 total (`update_task` + `update_calendar_event` added); `update_task.input_schema` requires `id`, has optional title/bucket(enum)/tag(enum); `update_calendar_event` requires `id`, optional title/date/startTime/durationMin.
- **TR-UPD-TOOL-2 (P3):** `update_task.toWriteEvent` → `web:tasks:update-requested` with `patch` containing ONLY provided fields (a title-only input → `patch:{title}`, no bucket/tag keys).
- **TR-UPD-TOOL-3 (P3):** `update_calendar_event.toWriteEvent` → `web:calendar:update-requested` with `patch` containing only provided fields.
- **TR-REG:** TR-1..TR-5 (SHIPPED create-tool cases) stay green; `WriteEventSpec.channel` union widening does not break create mappings.

#### `ConfirmationCard.test.tsx` deltas
- **CC-TONE-1 (P2):** render with a `spec` whose `tone` is omitted or `"default"` (tone is read off `spec.tone`, NOT a separate prop — `ConfirmationCardProps` is unchanged) → byte-for-byte the SHIPPED markup (assert no destructive class/attribute) — protects create/update visuals.
- **CC-TONE-2 (P2):** render with a `spec` of `{ label, description, tone:"destructive" }` → the destructive affordance (distinct confirm styling/label) + the item-naming description. (Asserts `ConfirmationCard` reads `spec.tone`; no separate `tone` prop is passed.)
- **CC-REG:** CC-1..CC-3 stay green.

#### `AiChatModule.test.tsx` tool-flow deltas
- **IT-DEL-1 (P2, NO-SILENT-WRITE):** mock a `delete_task` tool_use (input.id from a seeded context) → ConfirmationCard rendered (destructive); do NOT click Confirm → ZERO `web:tasks:delete-requested` emitted + `xai_task_cols` UNCHANGED.
- **IT-DEL-2 (P2):** Confirm → `web:tasks:delete-requested` emitted EXACTLY once with `id` from the tool input + `requestId === tool_use.id`; then ONE final stream turn (bounded).
- **IT-DEL-3 (P2):** Cancel → `tool_result(is_error:true)` round-trip + idle + ZERO writes.
- **IT-DEL-4 (P2, bounded):** after Confirm+tool_result, a second tool_use in the final turn is NOT executed (counter cap=1).
- **IT-UPD-1 (P3, NO-SILENT-WRITE):** mock an `update_task` tool_use → confirmation rendered; not-confirmed → ZERO `web:tasks:update-requested` + store unchanged.
- **IT-UPD-2 (P3):** Confirm → `web:tasks:update-requested` emitted once with the mapped `patch` + `requestId` correlation; bounded final turn.
- **IT-UPD-3 (P3):** calendar update + delete analogs (`web:calendar:{update,delete}-requested`) emit confirm-only.
- **IT-REG:** IT-1..IT-6 (SHIPPED create flow) stay green — create path unaffected by the new channel branches.

#### Owning-module mutate-subscriber tests
- `xai-web-tasks/aiMutateSubscriber.test.ts`:
  - **TS-DEL-1 (P2):** on `web:tasks:delete-requested`, the targeted card is removed from `xai_task_cols` (via `deleteCard`); count decremented.
  - **TS-DEL-2 (P2):** idempotent per `requestId` (duplicate emit → single delete).
  - **TS-DEL-3 (P2):** route-independent — executes without `TasksModule` mounted.
  - **TS-DEL-4 (P2):** stale/unknown id → store UNCHANGED (deleteCard no-op), no throw.
  - **TS-UPD-1 (P3):** on `web:tasks:update-requested` with a same-column `{title}` patch → card title rewritten, `done` PRESERVED (assert), other fields intact.
  - **TS-UPD-2 (P3, bucket-move composition — ED-6):** patch with a DIFFERENT `bucket` → card relocated to the target column (via `moveCard`), date fields rewritten for the new bucket, both columns' counts adjusted, title/tag from patch applied, `done` preserved.
  - **TS-UPD-3 (P3):** idempotent per `requestId`.
  - **TS-UPD-4 (P3):** stale/unknown id → store UNCHANGED, no throw.
  - **TS-NOIMPORT:** no cross-plugin import guard (ai-chat not imported in either subscriber).
- `xai-web-calendar/aiMutateSubscriber.test.ts`:
  - **CS-DEL-1 (P2):** on `web:calendar:delete-requested`, the event is removed from `xai_calendar_events` (via `deleteEvent`).
  - **CS-DEL-2 (P2):** idempotent per `requestId`; **CS-DEL-3:** route-independent; **CS-DEL-4:** stale id → no-op (deleteEvent same-reference), no throw.
  - **CS-UPD-1 (P3):** on `web:calendar:update-requested`, the event is patched via `updateEvent` — `createdAt` + `id` PRESERVED, `updatedAt` bumped (assert), provided fields applied; startISO/endISO recomputed when date/startTime/durationMin present (same-day, ≥+5min).
  - **CS-UPD-2 (P3):** idempotent per `requestId`; **CS-UPD-3:** route-independent; **CS-UPD-4:** stale id → `updateEvent` returns `updated:null` + store unchanged, no throw.
  - **CS-NOIMPORT:** no cross-plugin import guard.

#### `@repo/core` typecheck
- **CORE-ED-1 (P1):** `pnpm --filter @repo/core typecheck` green with the 4 new EventMap entries; SHIPPED create + `web:ai:*` entries unchanged.

#### Back-compat + full suite
- **BC-1 (re-assert, P4):** `isAiConvoRecord` still accepts SHIPPED-shape + extended records.
- **BC-FULL (P4):** full suites green: `pnpm --filter @repo/plugin-web-ai-chat test`, `--filter @repo/plugin-web-tasks test`, `--filter @repo/plugin-web-calendar test`, `--filter @repo/core typecheck`, `--filter @repo/web test`+`build`.

### §9.3 Acceptance gate mapping (extension)

| Acceptance anchor (carve-out §5) | Mechanism |
|---|---|
| AI deletes an existing item (referenced by id) → confirmation → Confirm → real removal via owning reducer (verified in store) | IT-DEL-2 + TS-DEL-1 / CS-DEL-1 (store mutation) |
| AI edits an existing item → confirmation → Confirm → real update via owning reducer; `done`/other fields preserved | IT-UPD-2 + TS-UPD-1 (preserve-done) / CS-UPD-1 (preserve createdAt+id, bump updatedAt) |
| Targeting works (model references item by id from context) | CP-ID-1/CP-ID-2 (id in context) + IT-DEL-2/IT-UPD-2 (input.id round-trips to the correct store mutation) |
| NO silent writes / nothing without explicit confirm (delete + update) | **IT-DEL-1 + IT-UPD-1** (pending-not-confirmed → 0 writes) + IT-DEL-3 (cancel → 0 writes) + confirm-handler-only emit |
| Delete never executes without explicit confirmation | IT-DEL-1 + destructive-tone CC-TONE-2 + confirm-only emit |
| Bounded round-trip (no agentic loop) | IT-DEL-4 / IT-UPD bounded (counter cap=1) |
| Untouched task fields + referential equality preserved | TR-UPD-2/TR-UPD-3/TR-UPD-5 + TR-DEL-2 |
| No regression in SHIPPED create behaviour | TR-REG + CC-REG + IT-REG + CP-REG + full SHIPPED suite green every phase |
| Docs/code parity (anti-drift, ED-R1) | reducer unit tests (TR-DEL/TR-UPD) assert documented signatures; IT tests assert documented confirm-only emit — verify diffs doc-vs-code |
| Cross-vendor + real-LLM edit/delete round-trip | DEFERRED operator smoke (ADR-0008 §S3 / ADR-0009 §D2-G2) — verify-report records deferral |

### §9.4 Cleanup behaviour (extension)

- Same as §8.4. `afterEach` clears `localStorage` (resets `xai_task_cols`/`xai_calendar_events`), resets fetch SSE mock, unsubscribes the 4 new channels' listeners, restores timers/mocks.
- Reducer tests use deep-frozen fixtures to catch accidental mutation.

