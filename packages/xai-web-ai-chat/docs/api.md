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

## §12. 2026-05-25 Extension — Real LLM Adapter (gap-closure row #2)

> The §0..§11 contract above continues to apply byte-for-byte.
> This §12 ONLY adds new exports + extends existing behaviour.

### §12.0 New public surface (additive)

`packages/plugin-web-ai-chat/src/index.ts` adds these named exports:

```ts
// Streaming entrypoint (new). Returns an async iterator of token chunks.
export { streamCompleteChat } from "./internal/claudeStreamAdapter.js";

// Typed key-storage helper namespace (consumed by Settings → AI pane).
export { aiKeyStorage } from "./internal/secretStore.js";

// Public error union (consumed by Settings → AI pane + ErrorBanner).
export type { LlmError, LlmErrorKind } from "./internal/llmErrors.js";

// Public request/response types for stream protocol.
export type { StreamChunk, StreamRequest } from "./internal/claudeStreamAdapter.js";
```

`completeChat` continues to be exported (unchanged signature) and is used
internally by `streamCompleteChat` as the non-streaming fallback.

### §12.1 `streamCompleteChat(req): AsyncIterable<StreamChunk>` (internal — `src/internal/claudeStreamAdapter.ts`)

```ts
export interface StreamRequest {
  /** The user prompt text (trimmed, non-empty). */
  text: string;
  /** Active language; controls fallback demo string + future i18n in errors. */
  lang: Lang;
  /** Model id the user picked in the composer (or default). */
  model: AiModelId;
  /** Optional abort signal — when aborted, the underlying fetch is aborted. */
  signal?: AbortSignal;
}

export interface StreamChunk {
  /** The accumulated text so far (NOT the delta — caller renders this directly). */
  accumulated: string;
  /** True on the final chunk before the iterator returns. */
  done: boolean;
}

export function streamCompleteChat(
  req: StreamRequest,
): AsyncIterable<StreamChunk>;
```

**Behaviour contract**

- Resolves provider config via `llmProvider.resolveProvider()` (reads
  `usePref` values from inside the function via a one-shot snapshot loader;
  see `llmProvider.ts`).
- Loads the API key via `secretStore.loadKey(provider)`. If `null`, throws
  `LlmError({kind:"BadKey",status:401})` (caller distinguishes "no key
  configured" via the `status === 401` AND `LlmError.detail?.includes("not-set")`).
- Issues a single `fetch(url, {method:"POST", headers, body, signal})` with
  `stream: true` in the JSON body.
- On 4xx/5xx: calls `classifyError(response)` → throws `LlmError`.
- On 200 with streaming response body: yields `{accumulated, done:false}`
  after each text chunk parsed from SSE; emits one final `{accumulated, done:true}`
  before completing.
- On streaming-unavailable (Response.body is null OR SSE parse throws): falls
  back to awaiting `completeChat(text, lang)` and yields a single `{accumulated: full, done:true}`.
- On AbortController abort: the underlying fetch is aborted; iterator returns
  early without throwing (consumer expected to handle the partial bubble).

### §12.2 `aiKeyStorage` (internal namespace, exported via barrel — `src/internal/secretStore.ts`)

```ts
export type AiProvider = "anthropic" | "openai-compatible";

export interface AiKeyStorage {
  /** Returns the plaintext API key for the given provider, or null if not set. */
  loadKey(provider: AiProvider): Promise<string | null>;
  /** Persists the plaintext API key encrypted via AES-GCM. Overwrites any existing entry. */
  saveKey(provider: AiProvider, plaintext: string): Promise<void>;
  /** Removes the stored entry for the given provider. Idempotent. */
  clearKey(provider: AiProvider): Promise<void>;
  /** Issues a 1-token messages request to validate the stored key. Returns LlmError on failure. */
  testConnection(provider: AiProvider): Promise<{ ok: true } | { ok: false; error: LlmError }>;
}

export const aiKeyStorage: AiKeyStorage;
```

**Storage shape (IndexedDB row)**

```ts
interface StoredSecretBlob {
  /** Format version; bump on cipher / KDF changes. */
  version: 1;
  /** AES-GCM ciphertext. */
  ciphertext: Uint8Array;
  /** AES-GCM IV (12 bytes). */
  iv: Uint8Array;
  /** PBKDF2 salt (32 bytes random per-install). */
  salt: Uint8Array;
  /** PBKDF2 iterations — 600_000. */
  kdfIterations: 600000;
  /** Cipher algorithm identifier — "AES-GCM". */
  algo: "AES-GCM";
}
```

**KDF chain**

1. `createDeviceIdentityStore().ensure()` → UUID (already SHIPPED; persisted
   in IDB `xai-web-auth/device` store under key `device.id`).
2. `crypto.subtle.importKey("raw", encode(uuid), "PBKDF2", false, ["deriveKey"])`.
3. `crypto.subtle.deriveKey({name:"PBKDF2", salt, iterations:600000, hash:"SHA-256"}, baseKey, {name:"AES-GCM", length:256}, false, ["encrypt", "decrypt"])`.
4. AES-GCM encrypt/decrypt with 12-byte random IV per save.

**Error semantics**

- `loadKey`: returns `null` (NOT throws) for missing entry or decrypt failure
  (decrypt failure also clears the row — assume corruption / device id reset).
- `saveKey`: throws if `crypto.subtle` is unavailable OR IDB write fails.
- `clearKey`: idempotent — no-op if no entry exists.
- `testConnection`: never throws; wraps errors into `{ok:false, error: LlmError}`.

### §12.3 `LlmError` (public union — `src/internal/llmErrors.ts` re-exported)

```ts
export type LlmErrorKind =
  | "BadKey"
  | "RateLimited"
  | "Network"
  | "Server"
  | "Malformed";

export type LlmError =
  | { kind: "BadKey"; status: 401 | 403; detail?: string }
  | { kind: "RateLimited"; status: 429; retryAfterSec: number; detail?: string }
  | { kind: "Network"; cause: Error; detail?: string }
  | { kind: "Server"; status: number; body?: string; detail?: string }
  | { kind: "Malformed"; where: "sse-parse" | "json-parse" | "shape"; detail: string };

export function classifyError(
  input: Response | Error,
): Promise<LlmError>;
```

- `classifyError(Response)` reads `status` + `Retry-After` header + (best-effort)
  response body for the `detail` field. Returns a `Promise<LlmError>` so it can
  await `response.text()`.
- `classifyError(Error)` maps `TypeError: Failed to fetch` → `{kind:"Network", cause}`,
  `SyntaxError` (JSON.parse failure on stream chunk) → `{kind:"Malformed", where:"json-parse", detail}`,
  everything else → `{kind:"Server", status:0, detail:String(err.message)}`.

### §12.4 New EventMap entries (in `@repo/core/types/events.ts`)

```ts
// AI Chat rate-limit (owner: plugin-web-ai-chat row #18 extension)
// Declaration: emitted from plugin-web-ai-chat streaming adapter when a 429 is observed.
// Consumer: AiChatModule banner UI (subscribes via useWebEventListener).
'web:ai:rate-limited': {
  /** Provider whose endpoint returned 429. */
  provider: 'anthropic' | 'openai-compatible';
  /** Seconds until the user may retry. Sourced from Retry-After header; clamped 0..3600. */
  retryAfterSec: number;
  /** ISO timestamp of the 429 receipt. */
  occurredAt: string;
};

// AI Chat request failure (owner: plugin-web-ai-chat row #18 extension)
// Declaration: emitted from plugin-web-ai-chat streaming adapter when classifyError returns non-RateLimited LlmError.
// Consumer: AiChatModule banner UI (and optionally Settings → AI pane for live "key invalid" hint).
'web:ai:request-failed': {
  provider: 'anthropic' | 'openai-compatible';
  kind: 'bad-key' | 'network' | 'server' | 'malformed';
  /** HTTP status if available. 0 for network errors. */
  status?: number;
  occurredAt: string;
};
```

### §12.5 New `usePref` registry entries (in `@repo/plugin-web-storage`)

| Key | Codec | Default | Owner |
|---|---|---|---|
| `xai_ai_provider` | json (string enum) | `"anthropic"` | xai-web-ai-chat row #18 ext |
| `xai_ai_base_url` | json (string) | `""` | xai-web-ai-chat row #18 ext |
| `xai_ai_model_default` | json (`AiModelId`) | `"haiku"` | xai-web-ai-chat row #18 ext |
| `xai_ai_streaming` | boolean | `true` | xai-web-ai-chat row #18 ext |

**None of these store API keys.** Keys live exclusively in the IndexedDB
`xai-web-ai-secrets` store.

### §12.6 Settings → AI pane props

```ts
// In packages/plugin-web-settings-rest/src/panes/aiPane.tsx:
export const aiPane: Pane = {
  id: "ai",
  icon: "sparkle",
  i18nKey: "settings.ai",
  render: (props: PaneRenderProps) => <AiPaneContent {...props} />,
};
```

`AiPaneContent` reads/writes the 4 new `usePref` keys + uses `aiKeyStorage` for
the key field. Native `<dialog>` confirm-modal for "Delete API key" reuses the
`DeleteAccountConfirmModal` typography (own copy though — not a direct reuse).

### §12.7 CSP delta

`apps/web/public/_headers` line 2 (the only line) `connect-src 'self'` becomes
`connect-src 'self' https://api.anthropic.com`. This is the only line changed
in `_headers`. ADR-0008 §S3 D3 is amended in the same commit to record the
delta + add an "Amendments" frontmatter row.

OpenAI-compatible base URLs are NOT widened into CSP. Settings → AI pane copy
acknowledges this — see §12.8 below.

### §12.8 Error semantics summary (consumer-facing)

| LlmError.kind | Banner copy (EN) | Banner copy (ZH) | Actions |
|---|---|---|---|
| `BadKey` (status 401/403) | "Your API key was rejected. Please check Settings → AI." | "API 密钥被拒绝。请到 设置 → AI 检查。" | "Open Settings → AI" button |
| `RateLimited` (status 429) | "Rate-limited. Retry in {N}s." | "已达速率限制，{N}s 后重试。" | "Retry" disabled until countdown 0 |
| `Network` (fetch reject) | "Network error. Check your connection." | "网络错误，请检查连接。" | "Retry" enabled immediately |
| `Server` (5xx) | "Provider service unavailable ({status})." | "服务暂不可用（{status}）。" | "Retry" enabled |
| `Malformed` | "Unexpected response from provider — please try again." | "服务返回了无法解析的内容，请稍后重试。" | "Retry" enabled |

"Key not configured" surfaces as a special `BadKey` with `detail:"not-set"`:
banner copy switches to "Please configure your API key in Settings → AI to
start chatting." (EN) / "请到 设置 → AI 配置 API 密钥后再开始对话。" (ZH).

### §12.9 Idempotency / re-mount safety (extension)

- `streamCompleteChat` accepts an `AbortSignal` — passed in from `AiChatModule.tsx`
  derived from `mountedRef` via a per-request `AbortController` created at
  `send()` time and aborted in the unmount cleanup.
- `secretStore.saveKey` is safe to call concurrently; the new ciphertext blob
  fully replaces the previous one (no merge / no migration in v1).
- `aiKeyStorage.testConnection` is safe to spam — each call is an independent
  fetch. UI debounces via button-disable-during-pending.

### §12.10 Permissions / capabilities (extension)

- No new Tauri capabilities (still web-only).
- **CSP `connect-src` widened** to include `https://api.anthropic.com`.
  ADR-0008 §S3 D3 amended (single follow-up commit).
- No new Sentry envelope rules. No `report-uri` re-added.
- Browser feature requirements (asserted at module load):
  - `crypto.subtle` (WebCrypto)
  - IndexedDB
  - `ReadableStream` (for SSE body streaming)
  - `AbortController`
- All four are present in Chrome 60+ / Safari 11+ / Firefox 57+ — comfortably
  within row #18's cross-vendor matrix (Chrome 120 / Safari 17 / Firefox 121).

