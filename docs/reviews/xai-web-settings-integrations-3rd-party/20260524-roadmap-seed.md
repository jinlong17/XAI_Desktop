# Seed Brief — xai-web-settings-integrations-3rd-party

| 字段 | 值 |
|---|---|
| Roadmap | docs/workflow/roadmap/xai-web-console-gap-closure.md row #7 (W2) |
| 父 Brief | docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-gap-closure-source.md §Gap 6 (split-6a) |
| 父 ADR | ADR-0009 §D2-G3 |
| 候选包 | packages/plugin-web-settings-rest (#24 SHIPPED) — extend Integrations pane |

## Requirement (1-3 sentences)

Wire up the Integrations pane (currently placeholder cards) with 3 real OAuth stub flows: Notion, Google Calendar, Linear. v1 is **stub-only**: user clicks "Connect" → OAuth authorization URL opens in new tab → callback URL receives code → callback is logged + UI shows "Connected" — but no real token exchange / no real data sync. Goal is to establish the integration UX + CSP allowlist + OAuth callback URL pattern so the real backend can plug in later (P1 sync work).

## Hard Constraints

- 3 providers only in v1: Notion / Google Calendar / Linear. Other providers (Asana, GitHub, Slack, etc.) deferred.
- OAuth flow: standard authorization-code flow with PKCE. Redirect URI = `https://<host>/app/settings/integrations/callback`. Dev = `http://localhost:3000/...`, Prod = `https://<*.pages.dev>/...`.
- No real token persistence in v1. Callback page shows "Authorization received (v1 stub)" and discards the code. Provide a clear visual indicator that the integration is in stub mode.
- CSP impact: extend `connect-src` for each provider's token endpoint + `frame-src` for OAuth consent (most providers redirect, not iframe — confirm in feature-plan). May need new ADR or amend ADR-0008.
- "Disconnect" button is functional even in stub mode (clears local connection-state flag).
- Connection state persisted in `xai_pref_integrations_connected_*` (3 new boolean keys, default false) — register in `plugin-web-storage`.
- Per ADR-0009 D4: P0 work. Depends on Gap 1 (LLM adapter) having pattern-established the CSP-extension approach.

## Acceptance Signal

- Click "Connect Notion" → opens Notion OAuth in new tab.
- Authorize → redirect back → UI shows "Connected (stub)".
- Click "Disconnect" → state cleared.
- 3 providers all behave identically (clean abstraction).
- CSP report-uri receives 0 violations on happy-path connect.
- All 81/15 existing settings-rest tests still PASS; new tests cover OAuth state machine + stub-mode disclosure.
- Verify Cross-vendor: Codex cold-read confirms (a) PKCE state/code-verifier handled correctly, (b) no token leakage in URL hash, (c) CSP allowlist is minimal.
