# Design Snapshot - desktop-ai-offline-provider-policy

## Decision Header

| Field | Value |
|---|---|
| Selected Option | **Option A** — shared provider-policy seam over the current web AI packages; current providers remain online-required; local-provider execution deferred |
| Review Doc Path | `docs/reviews/desktop-ai-offline-provider-policy/20260529-discovery-review.md` |
| Review Date | 2026-05-29 |
| Roadmap Row | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#15` |
| Source Brief | `docs/reviews/desktop-ai-offline-provider-policy/20260529-feature-brief.md` |
| Feature Title | `Desktop AI Offline Provider Policy` |

## Frozen Assumptions

1. The active desktop AI surface is `@repo/plugin-web-ai-chat`, not `plugin-ai-cube`.
2. This row operates on the current runtime profile contract (`desktop-phase1-offline`) rather than renaming desktop runtime modes.
3. `anthropic` and existing `openai-compatible` remain online-required providers in this row.
4. Offline or unconfigured AI must fail closed with explicit state/copy, not a fake assistant success path.
5. `aiKeyStorage` and the existing `xai_ai_provider`, `xai_ai_base_url`, `xai_ai_model_default`, and `xai_ai_streaming` prefs remain the canonical configuration seams.
6. Loopback/local-looking base URLs are treated as an explicit deferred/local-not-enabled case unless review changes that decision.
7. No bundled model runtime, daemon installer, auto-discovery, or silent localhost probe is approved here.
8. Tauri desktop runtime safety must come from app policy, not from deployed web CSP assumptions.

## Dependency Overview

| Surface | Role |
|---|---|
| `@repo/plugin-web-ai-chat` | policy owner for provider-state resolution, chat gating, and send/test fail-closed behavior |
| `@repo/plugin-web-settings-rest` | Settings → AI consumer of the shared provider policy and copy |
| `@repo/plugin-web-storage` | existing pref ownership only; no new secret or provider registry family beyond the shipped `xai_ai_*` keys |
| `@repo/core` | runtime-profile helpers only if needed; no new business logic there |
| `@repo/web` | integration/tests/build gate only |

## Explicit Deferrals

- Real Ollama/local-provider execution
- New native desktop AI bridge or Tauri command
- Local-provider privacy prompt, endpoint lifecycle, or daemon health UX beyond documentation
- AI Cube/native control-window redesign
