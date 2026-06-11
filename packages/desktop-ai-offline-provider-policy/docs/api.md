# desktop-ai-offline-provider-policy - API

## Scope

This row freezes a provider-policy contract for the current desktop AI runtime. It does not add a new provider implementation. It defines how existing provider configuration is classified before chat send/test flows are allowed to run.

## Proposed Core Types

```ts
type AiConfiguredProvider = "anthropic" | "openai-compatible";

type AiProviderPolicyState =
  | "ready"
  | "network_required"
  | "key_required"
  | "base_url_required"
  | "local_provider_not_enabled";

interface ResolveAiProviderPolicyInput {
  provider: AiConfiguredProvider;
  baseUrl: string;
  hasSavedKey: boolean;
  runtimeProfile: WebRuntimeProfile;
  isOnline: boolean;
}

interface AiProviderPolicySnapshot {
  provider: AiConfiguredProvider;
  state: AiProviderPolicyState;
  sendEnabled: boolean;
  testEnabled: boolean;
  isLocalCandidate: boolean;
  reason:
    | "ready"
    | "offline_runtime"
    | "browser_offline"
    | "missing_key"
    | "missing_base_url"
    | "loopback_local_provider_deferred";
}
```

## Resolver Rules

- `anthropic`
  - no saved key -> `key_required`
  - runtime/profile offline or browser offline -> `network_required`
  - otherwise -> `ready`
- `openai-compatible`
  - empty base URL -> `base_url_required`
  - loopback/local-looking base URL (`localhost`, `127.0.0.1`, `::1`) -> `local_provider_not_enabled`
  - no saved key -> `key_required`
  - runtime/profile offline or browser offline -> `network_required`
  - otherwise -> `ready`

The build may refine the exact helper names, but the behavior above is the contract to review against.

## Runtime Behavior Contract

### `@repo/plugin-web-ai-chat`

- `AiChatModule` must render provider-state UI based on the shared policy helper.
- `streamCompleteChat(...)` must consult the policy and fail closed before `fetch(...)` when `state !== "ready"`.
- `completeChat(...)` must not use the old offline/unconfigured demo-success path for desktop Phase 3 policy states.
- Existing `LlmError` transport taxonomy may remain for real request failures; policy-state gating should not be hidden inside a fake `Network` success path.

### `@repo/plugin-web-settings-rest`

- Settings → AI consumes the same policy helper or a public equivalent from `@repo/plugin-web-ai-chat`.
- Test Connection and send-related settings affordances must be disabled or annotated when `state !== "ready"`.
- If a loopback/local base URL is entered, Settings must explain that local-provider execution is not enabled by this row.

## Storage and Privacy Contract

- API keys remain in `aiKeyStorage` (IndexedDB + WebCrypto).
- Existing `xai_ai_*` prefs remain the only configuration prefs for this row.
- No new preference may silently mean "auto-enable local LLM."
- No background scan, port probe, daemon ping, or local-provider auto-start is allowed.
- If a future row enables local-provider execution, it must explicitly document that prompts are being sent to a local HTTP service and define timeout/failure semantics first.

## Boundary Contract

| Package | Allowed role |
|---|---|
| `@repo/plugin-web-ai-chat` | policy resolver + chat gating |
| `@repo/plugin-web-settings-rest` | settings UI consumer |
| `@repo/plugin-web-storage` | existing pref reads/writes only |
| `@repo/core` | runtime-profile utilities only |
| `@repo/web` | route/provider integration tests only |
| `apps/desktop/src-tauri/` | no new AI command surface by default in this row |

## Error and Idempotency Notes

- Offline/unconfigured/local-provider-deferred states are policy outcomes, not successful provider replies.
- Re-evaluating the policy helper is idempotent and safe on every render.
- Browser and desktop callers should receive the same provider-state classification for the same inputs, except that desktop runtime still carries the `desktop-phase1-offline` profile signal.
