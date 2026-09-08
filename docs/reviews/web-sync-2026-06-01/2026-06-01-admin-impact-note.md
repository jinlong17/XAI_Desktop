# Admin Control Plane — Web Delta Impact Note (DRAFT)

| Field | Value |
|---|---|
| Date | 2026-06-01 |
| Branch | `web` |
| Delta | uncommitted working tree |
| Product line | `admin` (line 6) — **PROPOSED** (lowest of six, prototype-only) |
| Authority | ADR-0013 §D1 (admin PROPOSED; admin work is natively W0 web-only), `docs/contracts/account-sync-admin-read-models.md` |
| Status of this note | **DRAFT, forward-compatibility only.** Not an implementation authorization. No backend, no `apps/admin/`, no `codex/admin/*` branch. Web changes consume only the stable browser interface; admin remains a downstream read-model consumer. |
| Scope | READ-ONLY assessment + this single artifact. No source modified. |

> **`admin` is PROPOSED** (ADR-0013 §D1 lines 5–6 rule, Open Questions §S7,
> owner-deferred per §S3 #3). It carries no active-focus claim and no new-work
> authorization. There is no admin package, no admin roadmap, no admin backend
> in the Web Console. This note exists only to confirm the working-tree delta
> does not pre-empt or break the frozen admin Control Plane data contract.

---

## 1. Changed Web surfaces vs. the admin Control Plane read-model / data contract

The delta touches four surfaces that conceptually neighbor admin
read-model domains (`account-sync-admin-read-models.md` §4 catalog:
**Provider status**, **Usage**, **Accounts/Devices**). Intersection assessment:

| Changed Web file | What changed | Nearest admin read-model domain | Intersects admin contract? |
|---|---|---|---|
| `packages/plugin-web-ai-chat/src/internal/secretStore.ts` | `validateKey` now routes through `resolveProvider()` (provider-agnostic 1-token probe) instead of a hardcoded Anthropic URL; still IndexedDB + AES-GCM-256, device-UUID-derived KEK. | Provider status (`admin.provider.read`) — "safe secret-handle status" | **No.** This is a per-user, device-local browser secret. The admin contract's provider-secret domain is **server-side encrypted secret handles** (INTEGRATION_PLAN §2 "Move provider config to server-side encrypted secret handles"; deferred). The browser user-key path is a different, lower layer the admin contract explicitly does **not** own and must never read (§6). No server/admin endpoint is introduced. |
| `packages/plugin-web-ai-chat/src/internal/llmProvider.ts` | New `OPENAI_COMPATIBLE_ALLOWED_ORIGINS` allowlist (OpenAI / Groq / Gemini) gating the base-URL origin before the browser→provider `fetch`. | Provider status / routing (`admin.provider.read`) | **No** (forward-compatible). This is a Web-CSP egress guard, not a routing policy authority. The admin contract's "tiered routing policy / model-by-plan matrix" is a server-side governance store (read-models §4 Provider status, partially deferred). A future admin routing authority can sit **above** this client allowlist without conflict; the allowlist only narrows what the browser may call, which is strictly consistent with admin least-privilege. |
| `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts` | Replaced the `demoReply` fallback with a real non-streaming completion parser (`parseNonStreamingCompletion`); minor yield parenthesization. | Usage (`admin.usage.read`) | **No.** Pure client-side response decoding. Emits no usage telemetry, no token ledger, no cost record. The admin Usage domain (token counts / provider-model cost / overage) is a **deferred** server-side telemetry projection (read-models §4 Usage; INTEGRATION_PLAN §2 "no production usage ledger for admin"). This change neither creates nor blocks that future ledger. |
| `packages/plugin-web-settings-rest/src/panes/aiPane.tsx` | Base-URL field help text updated to name the CSP-allowlisted OpenAI-compatible endpoints. | Provider status | **No.** UI copy only; describes the same client allowlist. |
| `packages/plugin-web-settings-rest/src/CallbackPage.tsx` | OAuth callback now also requires a `code` param (rejects state-without-code) before extracting `providerId`. | Accounts / auth (`admin.account.read`) | **No.** Hardening of the user-facing integration OAuth callback. Touches no admin claim, no role, no service-role credential. Strictly tightens the user auth path. |
| `packages/web-auth-device-session/src/session.tsx` | `clearSessionStorage` now best-effort removes the local auth storage key + PKCE `-code-verifier` on sign-out; `resolvedStorage` memo derives storage from config when not injected. | Accounts / Devices (`admin.account.read`, `admin.device.read`) | **No.** Local browser-storage scrub on sign-out. **No admin-claim or role code exists in this package** (grep for `admin`/`role`/`claim`/`service_role` across `web-auth-device-session/src/` returns zero hits). The admin contract's account/device domains are server-side control-plane read models (read-models §4–5); they are unaffected by a client-side localStorage cleanup. |
| `apps/web/src/dev/seedAiConfigFromEnv.ts` | DEV-seed effect now also no-ops when `import.meta.env.MODE === "test"`. | Provider status / secret boundary | **No.** Narrows when the dev-only seed runs (now skips test mode too). Production dead-code-elimination story is unchanged (effect still gated on `import.meta.env.DEV`). |

**Conclusion (§1):** No changed surface writes to, defines, or depends on an
admin control-plane read model, RBAC claim, audit stream, usage ledger, or
server-side provider-secret handle. All changes live strictly below the admin
contract's boundary (per-user browser layer), which the admin contract is
explicitly forbidden from reading (§6).

## 2. Browser-secret safety + admin-claim/role contract integrity

**Provider secrets stay browser-safe — no raw key leakage:**

- The user API key is persisted **only** as an AES-GCM-256 ciphertext blob in
  IndexedDB, encrypted under a PBKDF2-HMAC-SHA256 (600k) key derived from the
  device UUID (`secretStore.ts` header + `deriveKey`). `syncScope` for this
  device-local secret is unchanged by the delta.
- The raw plaintext key appears **only transiently** inside
  `ProviderConfig.headers` (`x-api-key` / `Authorization: Bearer …`) for the
  direct browser→provider `fetch`. It is never serialized to a server, never
  sent to any admin/control-plane endpoint, and never persisted in plaintext.
  This is consistent with the admin browser-secret boundary (read-models §6:
  "Admin browser code must never receive … provider raw secrets or raw API
  keys") — and the delta does **not** move the key anywhere new.
- `llmProvider.ts`'s new origin allowlist **reduces** exfiltration surface
  (an attacker-controlled base URL can no longer receive the `Bearer` key),
  which moves the Web posture toward, not away from, the admin least-privilege
  rule.
- `seedAiConfigFromEnv.ts` remains DEV-only and now additionally skips test
  mode; the documented production-build grep guarantee (zero `VITE_GEMINI_API_KEY`
  / `seedAiConfigFromEnv` hits in `dist/`) is preserved. Re-run that grep if the
  file changes again.

**Admin-claim / role contract — unaffected, forward-compatible:**

- The delta introduces **no** admin claim, role, RBAC scope, service-role
  credential, or admin audit code anywhere. `web-auth-device-session` has no
  admin-claim model today (consistent with INTEGRATION_PLAN §2 "admin claims
  not modeled" → gap deferred to a future isolated admin surface).
- `session.tsx`'s change is a sign-out cleanup of the **user** session's local
  storage; it does not alter the session token shape, does not expose new
  fields to browser code, and does not pre-define any admin claim. A future
  admin claim/role contract (read-models §4 RBAC scopes `admin.*.read`;
  INTEGRATION_PLAN §4.1 admin route guard) can be added later without
  conflicting with this cleanup.
- `CallbackPage.tsx`'s stricter OAuth callback validation is on the user
  integration flow and is compatible with — and arguably a prerequisite of — a
  future hardened admin auth gate.

## 3. Verdict

```
admin-contract-impact: forward-compat-note
```

**Reason:** No changed surface writes to or depends on any admin control-plane
read model, RBAC claim, audit stream, usage ledger, or server-side
provider-secret handle; provider keys remain device-local AES-GCM ciphertext
(raw key only transient in the direct provider fetch header, never sent to any
admin/server endpoint), and the new origin allowlist + OAuth-callback hardening
move the Web posture toward admin least-privilege. The only reason this is
`forward-compat-note` rather than `none` is that the touched surfaces
(per-user provider secret handling, AI config shape, browser auth session) are
the **same conceptual domains** the future admin Control Plane will project as
server-side read models — so the next admin slice must (a) treat admin provider
config as a **separate server-side encrypted secret handle**, never the
browser key store touched here, and (b) layer any admin routing/RBAC authority
**above** the client allowlist and user session, not inside them.

### Forward-compatibility guardrails for the (future) admin line

When the `admin` line is operator-confirmed and implemented:

1. Do **not** reuse the browser `aiKeyStorage` / IndexedDB user key as an admin
   provider secret. Admin provider config must be a server-side encrypted secret
   handle (read-models §6; INTEGRATION_PLAN §2, §4.5) exposed to admin browser
   code only as opaque handle / boolean health status.
2. Keep `OPENAI_COMPATIBLE_ALLOWED_ORIGINS` as a client CSP guard; a future
   admin routing/cost-ceiling policy is a **separate** server authority that may
   constrain but must not be replaced by this client list.
3. Admin claim/role/RBAC must be a new, server-enforced contract layered on top
   of `web-auth-device-session`; the sign-out storage scrub added here is
   orthogonal and may be reused unchanged.
4. Admin usage/cost read models require a server-side usage ledger that does not
   yet exist; the client stream adapter change here produces none and must not
   be mistaken for one.

### Hard reminders (do not violate)

- **Admin is PROPOSED.** No backend implemented in the Web Console; no
  `apps/admin/`; no `codex/admin/*` branch opened by this work.
- **Consume stable interface only.** Admin remains a downstream read-model
  consumer (read-models §2.5, §3); it must not read product payload stores or
  the browser user-key store directly.
- **W0 / web-only.** Admin work is natively W0 web-only (ADR-0013 §D1); this
  delta itself is plain Web work classified elsewhere (D3 receipt), and admin
  intersection here is **none beyond this forward-compat note**.
- This note is **draft-only** and authorizes nothing.
