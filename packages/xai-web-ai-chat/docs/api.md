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

---

## §13. 2026-05-29 Extension — AI Tool Layer (xai-web-ai-tool-layer)

> §0..§12 continue to apply byte-for-byte. This §13 adds the READ context
> provider + WRITE tool layer contracts. Protocol shapes pinned from
> `docs/reviews/xai-web-ai-tool-layer/20260529-discovery-review.md` §2.
> Carve-out: `docs/reviews/_p0-carve-outs/20260529-ai-tool-layer.md`.

### §13.0 Anthropic tool-use wire protocol (PINNED — the contract this layer integrates)

**Tool definition (request `tools[]` entry):**
```ts
interface AnthropicToolDef {
  /** ^[a-zA-Z0-9_-]{1,64}$ */
  name: string;
  /** ≥3-4 sentence plaintext: what / when / params / caveats. */
  description: string;
  /** JSON Schema object. */
  input_schema: { type: "object"; properties: Record<string, unknown>; required?: string[] };
  /** Optional schema-valid example inputs (improves date/time call quality). */
  input_examples?: Array<Record<string, unknown>>;
}
```
**Request:** `tools: AnthropicToolDef[]` + `tool_choice` omitted (→ `auto`). Sent ONLY on the Anthropic branch when a key is configured.

**Assistant tool-call turn:** `stop_reason: "tool_use"`, `content` may include a `text` block AND `{ type:"tool_use", id:"toolu_...", name, input:{...} }`.

**Follow-up user `tool_result` turn:**
```ts
interface ToolResultBlock {
  type: "tool_result";
  tool_use_id: string;   // === the assistant tool_use.id
  content: string;       // human-readable result (string form for v1)
  is_error?: boolean;    // true on failure / user-cancel
}
```
**Message sequence:** `user(prompt+context)` → `assistant(text? + tool_use)` → `user(tool_result)` → `assistant(final text)`.

**Streaming tool_use SSE (per content-block index):**
`content_block_start{content_block:{type:"tool_use",id,name,input:{}}}` → N× `content_block_delta{delta:{type:"input_json_delta",partial_json:"…"}}` → `content_block_stop` → `message_delta{delta:{stop_reason:"tool_use"}}`. **Accumulate `partial_json` per index; `JSON.parse` once at `content_block_stop`** (fragments are not individually valid JSON).

### §13.1 `buildBody` extension (internal — `llmProvider.ts`; additive)

```ts
buildBody(opts: {
  modelId: string;
  /** WIDENED: content may now be a string (default) OR a content-block array (tool round-trip turns). */
  messages: Array<{ role: "user" | "assistant"; content: string | ContentBlock[] }>;
  stream: boolean;
  maxTokens?: number;
  /** NEW: emitted on the Anthropic branch when present. */
  tools?: AnthropicToolDef[];
  /** NEW: defaults to omitted (auto). */
  toolChoice?: { type: "auto" | "any" | "none" } | { type: "tool"; name: string };
}): Record<string, unknown>;
```
- **Backward-compat:** `content: string` and absent `tools` reproduce the SHIPPED body byte-for-byte. `ContentBlock = { type:"text"; text:string } | { type:"tool_use"; id; name; input } | ToolResultBlock`.
- Both providers serialize `tools` when present: Anthropic passes the verbatim `AnthropicToolDef` array (input_schema); openai-compatible converts via `toOpenAiTools()` into the OpenAI function format. (Supersedes planner's-call #3 deferral — lifted in xai-web-ai-tool-openai-compatible §15.3.)

### §13.2 `contextProvider` (internal — `contextProvider.ts`; READ, pure)

```ts
/** Compact, deterministic snapshot of today's app state for model injection. */
export function buildTodayContext(now: Date): { text: string; isEmpty: boolean };
```
- Reads (via `getPref`) + locally narrows: `xai_task_cols` (today/overdue open tasks, ≤20), `xai_calendar_events` (today's events, recurrence expanded for today), `xai_pomodoro_sessions` (today focus min + count), `xai_habits_state` (today checked/total).
- Local boundary predicates copied from the `dataReads`/`narrowTaskCols` precedent — NO cross-plugin import; malformed entries dropped silently.
- Token budget ≤ ~600; English labels (model localizes reply to chat `lang`). `isEmpty:true` → honest "no data yet today" line.
- Prepended to the first user turn (or `system`) on every keyed send. PURE READ — no write, no new storage key.

### §13.3 `toolRegistry` (internal — `toolRegistry.ts`; WRITE)

```ts
export interface AiToolDef {
  def: AnthropicToolDef;                                  // name + description + input_schema (+ input_examples)
  /** Human-readable confirmation spec from validated input. */
  toConfirmation(input: Record<string, unknown>, lang: Lang): { titleLine: string };
  /** Maps validated input → the typed write event to emit on Confirm. */
  toWriteEvent(input: Record<string, unknown>, requestId: string):
    | { channel: "web:tasks:create-requested"; payload: WebTasksCreateRequested }
    | { channel: "web:calendar:create-requested"; payload: WebCalendarCreateRequested };
}
export const AI_TOOLS: readonly AiToolDef[]; // v1: create_task + create_calendar_event
```
- **`create_task`** `input_schema`: `{ title: string (req), bucket?: "overdue"|"next7"|"later"|"nodate" (default "next7"), tag?: "study"|"work"|"personal"|"todo"|"other" }`. Maps to `NewTaskDraft`+`BucketId`.
- **`create_calendar_event`** `input_schema`: `{ title: string (req), date: string "YYYY-MM-DD" (req), startTime?: "HH:MM" (default "09:00"), durationMin?: number (default 60, clamped ≥5) }`. Maps to `UserCalEvent` (compute local-clock same-day `startISO`/`endISO`; `colorPreset:"mint"`, `recurrence:null`). `input_examples` provided.
- NO `summarize_today` tool (read = context injection).

### §13.4 New EventMap entries (in `@repo/core/types/events.ts`) — CARVE-OUT AUTHORIZED

```ts
// AI tool layer — task create request
// Producer: plugin-web-ai-chat tool handler (emitted ONLY on user Confirm).
// Consumer: xai-web-tasks always-on AI-create subscriber.
'web:tasks:create-requested': {
  /** Correlation id = Anthropic tool_use.id (round-trip match for tool_result). */
  requestId: string;
  /** Trimmed, non-empty title. */
  title: string;
  /** Target bucket (producer applies default "next7"). */
  bucket: 'overdue' | 'next7' | 'later' | 'nodate';
  /** Optional tag preset. */
  tag?: 'study' | 'work' | 'personal' | 'todo' | 'other';
  /** ISO timestamp at confirm. */
  requestedAt: string;
};
// AI tool layer — calendar event create request
// Producer: plugin-web-ai-chat (Confirm-only). Consumer: xai-web-calendar subscriber.
'web:calendar:create-requested': {
  requestId: string;
  title: string;
  /** "YYYY-MM-DD" local date. */
  date: string;
  /** "HH:MM" local start (producer default "09:00"). */
  startTime: string;
  /** Minutes; producer clamps ≥5 (default 60). */
  durationMin: number;
  requestedAt: string;
};
```
- Existing `web:ai:rate-limited` / `web:ai:request-failed` (§12.4) are NOT modified — only added alongside.
- Type aliases `WebTasksCreateRequested` / `WebCalendarCreateRequested` = the payload types above (referenced by the registry).

### §13.5 Owning-module AI-create subscribers (additive, within each package)

`xai-web-tasks/src/internal/aiCreateSubscriber.ts`:
```ts
/** Always-on (route-independent) subscriber. On web:tasks:create-requested:
 *  setPref("xai_task_cols", addCard(getPref("xai_task_cols"), draft, bucket)). */
export function useAiCreateRequestSubscriber(): void; // or subscribeTaskCreateRequests(): () => void
```
`xai-web-calendar/src/internal/aiCreateSubscriber.ts`:
```ts
/** On web:calendar:create-requested:
 *  setPref("xai_calendar_events", createEvent(getPref(...), partial).next). */
export function useAiCreateRequestSubscriber(): void;
```
- Execute IMPERATIVELY via the pure reducer + `getPref`/`setPref` (NOT a route-scoped component) so a write requested while on `/app/ai` is not lost. Mounted `TasksModule`/`CalendarModule` update reactively via `usePref` storage-event fan-out.
- tasks uses its INTERNAL `addCard` (no new export); calendar reuses its ALREADY-PUBLIC `createEvent`.
- **No cross-plugin import** in either direction — coupling is only the typed event name + payload in `@repo/core`.
- Mount site (route-independent liveness) confirmed at feature-review (OQ2). Optional `web:*:create-result` ack channel deferred.

### §13.6 Confirmation contract (no silent writes — acceptance anchor)

- `ConfirmationCard` props: `{ titleLine: string; lang: Lang; onConfirm(): void; onCancel(): void }`.
- The write event (`web:*:create-requested`) is emitted **exclusively** inside the Confirm handler. Cancel emits a `tool_result(is_error:true, "user declined")` and returns to idle with ZERO store mutation. (Test-enforced — §test.md §8.)
- Bounded single round-trip: at most ONE `tool_result` turn per send (counter-enforced).

### §13.7 Persistence / back-compat

- Any tool-call/confirmation recording uses OPTIONAL message fields; `isAiConvoRecord` MUST accept both SHIPPED-shape and extended records (regression test). v1 MAY keep messages in-memory (SHIPPED FA-7) — full message-history persistence is OPTIONAL (OQ1).

### §13.8 Permissions / capabilities (extension)

- No new Tauri capabilities (web-only). **No new CSP origin** — Anthropic already allow-listed (§12.7). No new npm dep, no new provider, no model-id change.
- Tool use requires a configured key; both Anthropic and openai-compatible providers now send `tools` (lifted in §15). Read context is always injected (provider-agnostic). No-key → existing `BadKey(detail:"not-set")` path; demo fallback unchanged.

### §13.9 Idempotency / re-mount safety (extension)

- The SHIPPED FIFO queue + `processingRef` + abort-on-unmount invariants are preserved; `pendingConfirmation` pauses the queue until Confirm/Cancel.
- Subscribers are idempotent per `requestId`: a duplicate `web:*:create-requested` with the same `requestId` is a no-op (guard against StrictMode double-emit). Each create runs through the owning module's pure reducer (referential-equality semantics preserved).

## §14. 2026-05-29 Extension — AI Tool Layer Edit/Delete (xai-web-ai-tool-edit-delete)

> §0..§13 continue to apply byte-for-byte. This §14 adds the EDIT + DELETE
> tool contracts. Extends §13 additively — does NOT modify the SHIPPED create
> tools, channels, subscribers, or round-trip plumbing.
> Carve-out: `docs/reviews/_p0-carve-outs/20260529-ai-tool-edit-delete.md` (commit `e404a45`).
> Discovery: `docs/reviews/xai-web-ai-tool-edit-delete/20260529-discovery-review.md`.

### §14.1 `contextProvider` id exposure (internal — `contextProvider.ts`; READ, additive)

The rendered context lines from §13.2's `buildTodayContext` gain a visible id token so the model can target update/delete:

```text
## Open tasks (top 20):
- [next7] (id: t1) Buy groceries
- [overdue] (id: c3) Submit report

## Calendar events today:
- (id: 6f3a-…) 09:30–10:00: Team standup
```
- ADDITIVE string-shape change ONLY. Titles, times, bucket labels, ordering, TASK_CAP=20, today-only calendar filter — all unchanged from §13.2.
- Token budget ≤ ~600 preserved (ids add ~10 tokens/item; bounded counts keep total in budget).
- NO new storage key, NO new read source, NO write. Tool descriptions reference the `(id: …)` token: "to edit or delete an existing item, copy the exact id shown as `(id: …)` in the context."
- CP-ID tests assert the id appears in the rendered text for both tasks and calendar events.

### §14.2 `toolRegistry` extension (internal — `toolRegistry.ts`; WRITE; 2 → 6 tools)

`AI_TOOLS` grows from 2 (create_task, create_calendar_event) to 6. Two type surfaces widen — `ConfirmationSpec` gains an additive `tone?` field (the SINGLE seam for destructive styling — see §14.6), and `WriteEventSpec.channel` widens to include the 4 new channels:

```ts
// ConfirmationSpec — SHIPPED { label, description } gains an additive optional tone.
// tone is carried ON the spec returned by toConfirmation, NOT as a separate
// ConfirmationCard prop. The existing `spec={spec}` render-site pass-through
// (AiChatModule.tsx:695-707) carries it unchanged — NO render-site edit.
export interface ConfirmationSpec {
  /** Short tool label, e.g. "Create task" / "Delete task". */
  label: string;
  /** Human-readable description of the proposed action. */
  description: string;
  /** NEW (additive): visual + affordance tone. Omitted / "default" = byte-for-byte
   *  SHIPPED rendering (create + update). "destructive" = delete affordance. */
  tone?: "default" | "destructive";
}

export interface WriteEventSpec {
  channel:
    | "web:tasks:create-requested" | "web:calendar:create-requested"   // SHIPPED
    | "web:tasks:update-requested" | "web:tasks:delete-requested"      // NEW
    | "web:calendar:update-requested" | "web:calendar:delete-requested"; // NEW
  payload: Record<string, unknown>;
}
```

**New tools** (each implements `toConfirmation(input)` + `toWriteEvent(input, toolUseId)` from §13.3's `AiToolDef`):

- **`delete_task`** — `input_schema`: `{ id: string (req) }`. `toConfirmation` → `{ label: "Delete task", description: \`Delete task "<title-or-id>"?\` , tone: "destructive" }`. `toWriteEvent` → `{ channel: "web:tasks:delete-requested", payload: { requestId: toolUseId, id, requestedAt } }`.
- **`delete_calendar_event`** — `input_schema`: `{ id: string (req) }`. Destructive tone. → `web:calendar:delete-requested` `{ requestId, id, requestedAt }`.
- **`update_task`** — `input_schema`: `{ id: string (req), title?: string, bucket?: "overdue"|"next7"|"later"|"nodate", tag?: "study"|"work"|"personal"|"todo"|"other" }` (description: "provide id + at least one of title/bucket/tag"). `toWriteEvent` → `web:tasks:update-requested` `{ requestId, id, patch: { title?, bucket?, tag? }, requestedAt }` (only provided fields included in `patch`).
- **`update_calendar_event`** — `input_schema`: `{ id: string (req), title?: string, date?: "YYYY-MM-DD", startTime?: "HH:MM", durationMin?: number }` (description: "provide id + at least one changed field"). `toWriteEvent` → `web:calendar:update-requested` `{ requestId, id, patch: { title?, date?, startTime?, durationMin? }, requestedAt }`.

`toConfirmation` for the two delete tools returns `{ label, description, tone: "destructive" }`; create + update return `tone: "default"` (explicit, for clarity — omitting it is equivalent and also renders SHIPPED markup). This is the ONLY place `tone` is set; `ConfirmationCard` reads `spec.tone` (§14.6). `findTool(name)` unchanged (array lookup).

### §14.3 New EventMap entries (in `@repo/core/types/events.ts`) — CARVE-OUT AUTHORIZED

```ts
// AI tool layer edit/delete — task update request
// Producer: plugin-web-ai-chat Confirm handler (emitted ONLY on user Confirm).
// Consumer: xai-web-tasks always-on AI-mutate subscriber.
'web:tasks:update-requested': {
  /** Correlation id = Anthropic tool_use.id (round-trip match for tool_result). */
  requestId: string;
  /** Stable task card id, copied by the model from the injected context. */
  id: string;
  /** Only provided fields present. Empty patch is a no-op at the reducer. */
  patch: {
    /** Fills BOTH title.en + title.zh. */
    title?: string;
    /** Bucket change → subscriber composes moveCard (ED-6). */
    bucket?: 'overdue' | 'next7' | 'later' | 'nodate';
    tag?: 'study' | 'work' | 'personal' | 'todo' | 'other';
  };
  requestedAt: string;
};
// AI tool layer edit/delete — task delete request
'web:tasks:delete-requested': {
  requestId: string;
  id: string;
  requestedAt: string;
};
// AI tool layer edit/delete — calendar event update request
'web:calendar:update-requested': {
  requestId: string;
  id: string;
  patch: {
    title?: string;
    /** "YYYY-MM-DD" local date. */
    date?: string;
    /** "HH:MM" local start. */
    startTime?: string;
    /** Minutes; subscriber clamps ≥5. */
    durationMin?: number;
  };
  requestedAt: string;
};
// AI tool layer edit/delete — calendar event delete request
'web:calendar:delete-requested': {
  requestId: string;
  id: string;
  requestedAt: string;
};
```
- ADDITIVE: the SHIPPED `web:*:create-requested` + `web:ai:*` channels are NOT modified.
- Per-op channels (planner's-call #2), NOT a consolidated `mutate {op}`.
- `dev`-branch merge surface flagged in dev_log Risks (`web:*` ≠ `desktop:*`, low conflict).

### §14.4 Tasks reducer additions (`xai-web-tasks/src/internal/tasksReducer.ts`; pure)

```ts
export interface TaskCardPatch {
  title?: string;      // fills BOTH title.en + title.zh (mirrors addCard's single-input bilingual)
  tag?: TaskTagId;
  // bucket change handled via moveCard composition in the subscriber (§14.5), NOT in this patch.
}
/** Pure: remove the card with `id` from whichever column holds it; decrement that
 *  column's count. Untouched columns returned by reference. `prev` unchanged if id
 *  is in no column. */
export function deleteCard(prev: TaskCol[], id: string): TaskCol[];
/** Pure: merge `patch` over the matching card, preserving ALL untouched fields
 *  including `done` (T-10), tag, date, dateZh, inbox. Never overwrites `id`.
 *  Untouched columns returned by reference. `prev` unchanged if id is in no column
 *  OR patch is empty/no-op. */
export function updateCard(prev: TaskCol[], id: string, patch: TaskCardPatch): TaskCol[];
```
- `TaskCardPatch` exported additively from `xai-web-tasks/src/types.ts`.
- Calendar adds NO reducer code — reuses the ALREADY-EXISTING `updateEvent(store, id, patch)` (preserves createdAt + id, bumps updatedAt) + `deleteEvent(store, id)` (no-op if missing) from `eventStore/eventStore.ts`.

### §14.5 Owning-module AI-mutate subscribers (additive, within each package)

`xai-web-tasks/src/internal/aiMutateSubscriber.ts`:
```ts
/** Always-on (route-independent) subscriber for BOTH update + delete task channels.
 *  On web:tasks:delete-requested: setPref("xai_task_cols", deleteCard(getPref(...), id)).
 *  On web:tasks:update-requested: if patch.bucket differs from the card's current
 *    column → moveCard(cols, id, fromCol, patch.bucket) THEN updateCard for remaining
 *    title/tag (ED-6 composition); else updateCard only. Then setPref. */
export function useTaskMutateRequestSubscriber(): void;
```
`xai-web-calendar/src/internal/aiMutateSubscriber.ts`:
```ts
/** Always-on subscriber for BOTH update + delete calendar channels.
 *  On web:calendar:delete-requested: setPref("xai_calendar_events", deleteEvent(getPref(...), id)).
 *  On web:calendar:update-requested: setPref(..., updateEvent(getPref(...), id, patch).next)
 *    (compute startISO/endISO from date/startTime/durationMin when those fields present). */
export function useCalendarMutateRequestSubscriber(): void;
```
- Execute IMPERATIVELY via the pure reducer + `getPref`/`setPref` (route-independent — a mutate requested while on `/app/ai` is not lost). Mounted `TasksModule`/`CalendarModule` update reactively via `usePref` storage-event fan-out.
- tasks uses its INTERNAL `deleteCard`/`updateCard`/`moveCard`; calendar reuses its existing `updateEvent`/`deleteEvent`.
- **No cross-plugin import** in either direction — coupling is only the typed event name + payload in `@repo/core`.
- Mounted as new Shell-sibling lines in `apps/web/src/App.tsx` beside the SHIPPED create subscribers (§13.5). One hook per package, two `useWebEventListener` calls inside (OQ2 — review to confirm).

### §14.6 Confirmation contract (destructive tone; no silent writes preserved)

- **Destructive tone rides on `ConfirmationSpec.tone`, NOT a separate `ConfirmationCard` prop.** `ConfirmationCardProps` is UNCHANGED (`{ spec, lang, onConfirm, onCancel }`); `ConfirmationCard` reads `spec.tone` (defaulting to `"default"`) and applies the destructive affordance (distinct confirm styling/label) when `spec.tone === "destructive"`. Because `tone` is part of the spec, the existing render site (`AiChatModule.tsx:695-707`, which computes `spec = tool.toConfirmation(...)` then passes `spec={spec}`) carries it through with **NO render-site edit** — `AiChatModule.tsx`'s only build change stays "`handleConfirm` +4 channel branches". Default/omitted tone reproduces SHIPPED markup byte-for-byte (CC-TONE-1 asserts this). Delete tools set `tone: "destructive"` in `toConfirmation` + copy naming the exact item (CC-TONE-2 asserts the destructive affordance).
- The 4 new write events are emitted **exclusively** inside `AiChatModule.handleConfirm` — the SAME single emit site as create. The handler's channel `if/else` chain gains 4 branches (delete in P2, update in P3). Cancel emits `tool_result(is_error:true)` + ZERO store mutation, channel-agnostic, unchanged (IT-DEL/IT-UPD enforce confirm-only emit).
- Bounded single round-trip preserved: at most ONE `tool_result` turn per send; the `priorMessages` round-trip block in `handleConfirm`/`handleCancel` is UNCHANGED (channel-agnostic).

### §14.7 `streamCompleteChat` — UNCHANGED

`StreamRequest` already carries `tools?` + `priorMessages?` (SHIPPED §13.1 lineage). Edit/delete require NO adapter signature change — only the tool registry (2→6), the Confirm-handler channel branches, the event channels, and the subscribers grow.

### §14.8 Persistence / back-compat / permissions

- `isAiConvoRecord` unchanged; no new persisted message shape in v1; BC regression test confirms no regression.
- No new storage key (reuses `xai_task_cols` / `xai_calendar_events`). No new CSP origin (Anthropic allow-listed). No new npm dep, no new provider, no model-id change, no Tauri capability.

### §14.9 Idempotency / re-mount safety

- New subscribers idempotent per `requestId` (bounded `seenRef`, MAX_SEEN=100) — a duplicate `web:*:{update,delete}-requested` with the same `requestId` is a no-op (StrictMode double-emit guard).
- `deleteCard`/`updateCard`/`updateEvent`/`deleteEvent` all no-op (return same reference) on missing id — a stale/wrong id from the model mutates nothing (silent safe no-op, not an error).
- SHIPPED FIFO queue + `processingRef` + `pendingConfirmation` pause + abort-on-unmount all preserved.

---

## §15. 2026-05-29 Extension — AI Tool Layer OpenAI-Compatible (xai-web-ai-tool-openai-compatible)

> APPEND-ONLY. §0..§14 continue to apply byte-for-byte. This block adds the OpenAI Chat Completions
> function-calling wire format to the adapter so the SHIPPED 6 tools (§14) work on openai-compatible
> providers via the SAME provider-agnostic confirmation→event→reducer path. Self-contained to
> `plugin-web-ai-chat/src/internal/` (`llmProvider.ts` + `claudeStreamAdapter.ts` + `toolUseTypes.ts`).
> Design: §design.md 2026-05-29 Extension (OpenAI-Compatible). Discovery: §2 protocol research.

### §15.0 OpenAI Chat Completions tool-calling wire protocol (PINNED — the contract this layer integrates)

Endpoint: `${baseUrl}/chat/completions` (already built by `resolveProvider` openai branch). Pinned
2026-05-29 (discovery §2; sources discovery §9).

**Request `tools[]` element:**
```jsonc
{ "type": "function", "function": { "name": string, "description": string,
  "parameters": { "type": "object", "properties": {...}, "required": [...] } } }
```
**Request `tool_choice`:** `"auto"` | `"none"` | `"required"` | `{ "type":"function", "function":{"name":string} }`.

**Streaming response — `choices[0].delta.tool_calls[]` element:**
```jsonc
{ "index": number,            // keys the tool call across deltas
  "id": string?,              // FIRST delta only
  "type": "function"?,        // FIRST delta only
  "function": { "name": string?,        // FIRST delta only
                "arguments": string? } } // fragment, concatenated per index
```
Final chunk: `choices[0].finish_reason === "tool_calls"`. Stream terminator: `data: [DONE]`.

**Non-streaming response (documented; not v1's path):**
`choices[0].message.tool_calls[] = [{id, type:"function", function:{name, arguments:<JSON string>}}]`,
`choices[0].finish_reason === "tool_calls"`.

**Round-trip turns:**
```jsonc
// assistant turn that initiated the call:
{ "role":"assistant", "content":null, "tool_calls":[ {"id":string,"type":"function",
  "function":{"name":string,"arguments":"<JSON string of input>"}} ] }
// result turn (correlated by tool_call_id; no is_error field):
{ "role":"tool", "tool_call_id":string, "content":string }
```

### §15.1 `toOpenAiTools` (internal — `toolUseTypes.ts`; pure; NEW)

```ts
export interface OpenAiToolDef {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: { type: "object"; properties: Record<string, unknown>; required?: string[] };
  };
}

/** Map Anthropic-shaped tool defs → OpenAI function format. Drops input_examples (no OpenAI field). */
export function toOpenAiTools(defs: AnthropicToolDef[]): OpenAiToolDef[];
```

- `name` → `function.name`; `description` → `function.description`; `input_schema` → `function.parameters`
  (identical JSON-Schema object). `input_examples` is **dropped**. `@internal` — NOT exported from
  `index.ts`. The `AI_TOOLS` registry (§14.2) is the single source of truth; this is the OpenAI
  serializer (the Anthropic serializer is the existing identity pass-through).

### §15.2 `toOpenAiToolChoice` (internal — `toolUseTypes.ts`; pure; NEW)

```ts
export function toOpenAiToolChoice(
  choice: { type: "auto" | "any" | "none" } | { type: "tool"; name: string },
): "auto" | "none" | "required" | { type: "function"; function: { name: string } };
```

Mapping (discovery §2.2): `auto→"auto"`, `any→"required"`, `none→"none"`, `tool→{type:"function",
function:{name}}`. v1 callers never set `toolChoice` (→ openai default `auto`); the function is
implemented + unit-tested for correctness (anti-drift — real code, not a comment).

### §15.3 `llmProvider.buildBody` openai branch (MODIFIED — lift the deferral)

The openai-compatible `buildBody` (today `llmProvider.ts:95-104`, which serializes only
`{model, messages, stream, max_tokens}` and ignores `tools`):

- When `tools?.length`: `body["tools"] = toOpenAiTools(tools)`.
- When `toolChoice !== undefined`: `body["tool_choice"] = toOpenAiToolChoice(toolChoice)` (else omitted →
  `auto`).
- **Message translation** (discovery §3.3): for each message whose `content` is a `ContentBlock[]`:
  - assistant turn with `[{type:"tool_use", id, name, input}]` →
    `{role:"assistant", content:null, tool_calls:[{id, type:"function", function:{name, arguments: JSON.stringify(input)}}]}`.
  - user turn with `[{type:"tool_result", tool_use_id, content, is_error?}]` →
    `{role:"tool", tool_call_id: tool_use_id, content}` (the `is_error` flag is folded into `content`
    text upstream; OpenAI has no `is_error` field).
  - string-content turns pass through unchanged.
- **DELETE** the `// OpenAI-compatible: tools are NOT sent (deferred per planner's-call #3).` comment
  (line 96). Anthropic branch UNCHANGED.

### §15.4 `claudeStreamAdapter` openai streaming parse (MODIFIED — lift the gate)

- **Line-128 gate** `const tools = config.provider === "anthropic" ? req.tools : undefined;` →
  `const tools = req.tools;` (both providers receive tools; each `buildBody` branch serializes
  appropriately). **DELETE** the `// Only send tools on Anthropic provider (planner's-call #3).` comment
  (lines 127-128).
- **openai streaming else-branch** (today `claudeStreamAdapter.ts:292-297`, only `delta.content` text):
  add a loop-local accumulator `openAiToolAccum: Record<number, {id, name, argsJson}>`:
  - for each `choices[0].delta.tool_calls[k]`: if `id`/`function.name` present (first delta), record at
    its `index`; always append `function.arguments` to `argsJson[index]`.
  - read `choices[0].finish_reason`; on `"tool_calls"` (defensively: any accumulated entries by
    stream-end) — `JSON.parse` the lowest-index `argsJson` **ONCE** → `toolUseResult = {id, name, input}`
    (single-tool v1, OQ3); break.
  - `"stop"`/`"length"`/`null` → unchanged text path.
- The final-chunk emit generalizes: a tool turn is signalled by Anthropic `stop_reason:"tool_use"` OR
  openai accumulated `toolUseResult` → `yield {accumulated, done:true, toolUse: toolUseResult}`. Anthropic
  event handling + `StreamChunk` shape UNCHANGED.

### §15.5 `StreamChunk` / `StreamRequest` / `ToolUseResult` — UNCHANGED

No new public type. `ToolUseResult {id, name, input}` (§13 lineage) is the normalized shape BOTH providers
converge on (planner's-call #1). `index.ts` public surface byte-stable. `AiChatModule` consumes
`chunk.toolUse` provider-agnostically (no change).

### §15.6 Error semantics

Unchanged from §12.8 / §9. openai 4xx/5xx → `LlmError` + `web:ai:request-failed`; 429 →
`web:ai:rate-limited`. Malformed `tool_calls` arguments JSON → graceful no tool-use (text only), same as
the Anthropic malformed-input degradation (`claudeStreamAdapter.ts:267`).

### §15.7 Persistence / permissions / boundaries

- No new storage key, no new EventMap channel, no new CSP origin (openai-compatible endpoint already
  allowed), no new npm dep, no new provider, no model-id change, no Tauri capability.
- NO `events.ts` / cross-plugin / `apps/web` / `index.ts` / `plugin-web-tokens` / storage-registry / ADR
  / `dev` edits. The 4 SHIPPED lifelines (§13/§14) are untouched — this layer operates entirely below
  them.

### §15.8 Idempotency / re-mount safety

Unchanged — the openai path produces the SAME `StreamChunk.toolUse` that drives the SHIPPED
provider-agnostic state machine (FIFO queue + `pendingConfirmation` + bounded cap=1 round-trip +
per-`requestId` subscriber idempotency). No new idempotency surface.

