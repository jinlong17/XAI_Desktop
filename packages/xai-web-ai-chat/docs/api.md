# API Contract — xai-web-ai-chat

> Package: `@repo/plugin-web-ai-chat` · Path: `packages/plugin-web-ai-chat/`
> Design: `packages/xai-web-ai-chat/docs/design.md`
> ADR Anchor: `docs/adr/0007-xai-web-console-build-form.md` §S4

## §0. Public surface (`src/index.ts`)

```ts
// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// Components
export { AiChatModule }       from "./AiChatModule.js";

// Slot registration (consumed by apps/web shellRegistrations.tsx)
export { aiChatWebModuleRegistration } from "./registration.js";

// Public types
export type {
  AiMessage,
  AiMessageRole,
  AiAttachment,
  AiConvoRecord,
  AiModelId,
} from "./types.js";
```

No other paths are part of the public surface. Importing from `src/internal/**` is forbidden by the core boundary rule (CLAUDE.md `Code Boundaries`).

## §1. `AiChatModule` component (default route)

```ts
export interface AiChatModuleProps {
  /** Active language. Drives useI18n bundle + inline bilingual literals. */
  lang: Lang;
}

export function AiChatModule(props: AiChatModuleProps): JSX.Element;
```

**Behaviour contract**

- On first paint: sidebar `open` = `true`, convos loaded from `usePref("xai_ai_convos")` (default `[]`, predicate-filtered via `isAiConvoRecord`), insights toggle from `usePref("xai_ai_insights")` (default `true`), voice toggle from `usePref("xai_ai_voice")` (default `false`), `messages = []`, `thinking = false`, `activeConvo = null`, `model = "haiku"`, `attachments = []`.
- On `Enter` (composer input, no `Shift`): calls internal `send(input)`. Empty/whitespace text is a no-op.
- `send(text)`:
  1. Appends a `{ role: "user", text, attachments }` `AiMessage` to local state.
  2. Clears `input` and `attachments`.
  3. Sets `thinking = true`.
  4. If `activeConvo` is `null`, generates a new convo via `makeConvoFromUserText(text, lang)` and prepends it to `convos`; sets `activeConvo` to the new id.
  5. **Pushes `{ text, lang }` onto a FIFO `pendingSendQueueRef`** and calls `processQueue()`. The processor drains one entry at a time via `await claudeAdapter.completeChat(...)`; a `processingRef` flag prevents re-entry, so a second `send()` while the first promise is in flight is **queued behind the current promise** rather than racing it. Each queue item snapshots its `lang` at enqueue time (a language switch mid-flight does NOT retroactively retarget a queued item).
  6. As each adapter promise resolves the processor appends an `{ role: "assistant", text }` `AiMessage`. When the queue is fully drained `thinking` is cleared exactly once.
- On adapter resolve / reject: the result (resolved string OR demo line) is appended as an assistant bubble.  Option A's `completeChat` never throws; the `try/catch` path is preserved only as a defence-in-depth seam for future Option B.
- "New chat" button resets `messages`, `input`, `attachments`, `activeConvo`. Does **not** mutate `convos`.
- Clicking a convo row sets `activeConvo` and clears `messages` (matches artifact). Historical messages are not replayed.
- Voice toggle, insights toggle, model picker: imperative; toggles persist immediately via `usePref` setters.

## §2. `aiChatWebModuleRegistration` (shell slot)

```ts
export const aiChatWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "ai",
  label: "XAI Chat",
  defaultChildPath: "",
  children: [
    { path: "",  render: AiChatModuleRoute },
    { path: "*", render: AiChatModuleRoute },
  ],
  icon: "sparkle",
  railOrder: 1,
  i18nKey: "nav.ai",
  showInRail: true,
};
```

`AiChatModuleRoute` is a thin wrapper that reads `lang` from `useWebShell()` and renders `<AiChatModule lang={lang} />`. Same pattern as `PomodoroModuleRoute`. The registration replaces the existing `placeholder("ai", "XAI Chat", "sparkle", 1)` entry on line 51 of `apps/web/src/routes/modules/shellRegistrations.tsx` (single-line edit).

## §3. Public types (`src/types.ts`)

```ts
export type AiMessageRole = "user" | "assistant";

export interface AiAttachment {
  name: string;
  size: number;
}

export interface AiMessage {
  role: AiMessageRole;
  text: string;
  /** Attachment names attached to a user message. null if none. */
  attachments: string[] | null;
}

export interface AiConvoRecord {
  /** Unique id. "c-" + base36 timestamp for runtime entries. */
  id: string;
  /** First user-message slice (length ≤ 32). */
  title: string;
  /** Free-form display label — "刚刚"/"Just now"/"5/19" etc. Not a parseable timestamp. */
  time: string;
}

export type AiModelId = "haiku" | "sonnet" | "opus";
```

## §4. `claudeAdapter.completeChat` (internal — `src/internal/claudeAdapter.ts`)

> **Internal module.** Not re-exported. Component-internal seam only.

```ts
/** Delay window in ms — uniform jitter 600..1200. */
export const ADAPTER_DELAY_MIN_MS = 600;
export const ADAPTER_DELAY_MAX_MS = 1200;

/**
 * Option A no-op adapter.
 *
 * Returns the bilingual demo line after a jittered delay. Never touches
 * window.* and never throws. Future Option B replaces THIS function's body
 * without changing its signature or call sites.
 *
 * @param text — the user prompt (currently unused but reserved for B)
 * @param lang — current UI language; controls demo bubble language
 */
export async function completeChat(text: string, lang: Lang): Promise<string>;
```

**Behaviour**

- The function returns a `Promise<string>`. The promise resolves after a uniform-random delay in `[ADAPTER_DELAY_MIN_MS, ADAPTER_DELAY_MAX_MS]` ms.
- Returned string:
  - `lang === "zh"` → `"（演示）我会综合你的任务、专注数据与习惯进度，给你一份贴近实际的建议。当前网络暂不可用，请稍后再试。"`
  - else        → `"(Demo) I'd weave your tasks, focus data, and habit streaks into a tailored plan. Network unavailable right now — try again in a moment."`
- The implementation uses `Math.random()` for jitter. Tests inject a seeded `Math.random` (vi.spyOn) to assert determinism.

## §5. Internal helpers

### §5.1 `isAiConvoRecord(x: unknown): x is AiConvoRecord`

Returns true iff `x` is a plain object with:
- string `id` (length 1..64)
- string `title` (length 0..64; empty allowed)
- string `time` (length 0..64; empty allowed)

Used at the localStorage read boundary to drop invalid entries silently (dev-only `console.warn`).

### §5.2 `makeConvoFromUserText(text: string, lang: Lang): AiConvoRecord`

- `id = "c-" + Date.now().toString(36)`
- `title = text.slice(0, 32)` (matches the artifact verbatim)
- `time = lang === "zh" ? "刚刚" : "Just now"`

### §5.3 `getStarInstances(): readonly StarInstance[]`

Returns the canonical 60-entry array of `<span class="star">` style props the AI Aurora renders. Computed once at module load (frozen). Each entry:

```ts
interface StarInstance {
  readonly left:             string; // "X%"  X = (i*53)%100
  readonly top:              string; // "Y%"  Y = (i*97)%100
  readonly animationDelay:   string; // "Ds"  D = (i%7) * 0.7
  readonly animationDuration:string; // "DDs" DD = 3 + (i%5)
  readonly opacity:          number; // 0.3 + (i%5) * 0.15
}
```

Pure; deterministic; no entropy. Asserted via `starInstances.test.ts` against a 60-element golden.

## §6. Storage contract

| Key | Codec | Default | Owner | Mutability |
|---|---|---|---|---|
| `xai_ai_convos` | json (`AiConvo[]`, predicate-filtered to `AiConvoRecord[]`) | `[]` | xai-web-ai-chat (row #18) | read at mount, replace on add, no removals from UI |
| `xai_ai_insights` | boolean | `true` | xai-web-ai-chat (row #18) | toggle from insights pill |
| `xai_ai_voice` | boolean | `false` | xai-web-ai-chat (row #18) | toggle from mic icon |

All three are SHIPPED non-`proposed` entries in `packages/plugin-web-storage/src/internal/registry.ts`. **This row does not edit the registry.**

## §7. Event-bus contract

**None.** No `web:ai:*` channel exists or is added. The breathing orb's thinking state is local; the model picker and voice toggle do not emit. The Settings module (W4) will read the same `usePref` keys directly when it lands.

## §8. CSS contract

- `styles.css` ports `web design/layout.css` lines 3826..4457 verbatim — selector names, animation names, keyframe percentages, blur radii, blend modes, transitions, all preserved.
- One additive block at the end of `styles.css`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .module-ai .aurora-blob,
    .module-ai .aurora-stream,
    .module-ai .star,
    .module-ai .orb-layer { animation-play-state: paused; }
  }
  ```
- Side-effect import in `index.ts` — Vite picks up the CSS once per app load.

## §9. Error semantics

- `completeChat` never throws. The component's `try { … } catch (err) { … }` block stays in place as a defence-in-depth seam for future Option B (when the adapter may genuinely fail).
- localStorage read failures (e.g. quota or corruption): `usePref` swallows and returns the registered default. Already SHIPPED behaviour from `@repo/plugin-web-storage`.
- Predicate-failed convo entries: dropped silently; one `console.warn` per startup in dev (`process.env.NODE_ENV !== "production"`).
- File attachments: `<input type="file" multiple>` already returns a `FileList`; if zero files selected the `attachments` state is unchanged. Max 4 attachments at once (artifact behaviour `[...files].slice(0, 4)`).

## §10. Permissions / capabilities

- No new Tauri capabilities (this is `apps/web/` only).
- No new CSP rules (Option A has zero network surface).
- No new Sentry envelope rules.

## §11. Idempotency / re-mount safety

- StrictMode double-mount: `usePref` is already StrictMode-safe (precedent: pomodoro). The FIFO `pendingSendQueueRef` + `processingRef` pair guards against double-spawn of the queue processor during a single Enter press.
- Adapter abort on unmount: a `useEffect` cleanup sets a `mountedRef.current = false` so the resolve handler short-circuits if the component unmounted (the demo bubble append is skipped silently). The queue is intentionally not drained on unmount — any pending items are dropped because there is no DOM target left to render assistant bubbles into.
- Resend-while-thinking serialization: the queue's `processingRef` prevents two adapter calls from running concurrently. Even with rapid successive `send()` calls, exactly one `completeChat` promise is in flight at any time; the next call begins only after the previous one resolves (or rejects). This is observable in tests by stubbing `completeChat` with externally-resolvable promises and asserting `calls.length === 1` between the two `send()`s — see `test.md` I17.

---
