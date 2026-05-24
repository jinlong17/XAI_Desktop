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
