# Feature Brief - desktop-ai-offline-provider-policy

## Summary

Freeze the Phase 3 desktop AI availability policy around the already-shipped web AI surfaces. `@repo/plugin-web-ai-chat` and Settings → AI should treat current providers as explicitly online-required, fail closed when offline or unconfigured, and stop presenting offline/demo responses as if a real provider completed successfully. Optional Ollama or other local-provider support is not enabled by default in this row.

## Source

- Seed: `docs/reviews/desktop-ai-offline-provider-policy/20260528-roadmap-seed.md`
- Manifest: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Storage authority: `docs/adr/0012-phase3-local-first-storage.md`
- Product authority: `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`

## Feature Identity

- Feature Title: `Desktop AI Offline Provider Policy`
- Canonical feature name: `desktop-ai-offline-provider-policy`
- Naming rationale: the row is a desktop runtime policy gate for AI provider availability, not a new AI module, chat redesign, or local-model implementation package.

## Problem

The current desktop wrapper still runs the web AI stack under `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`, but the AI adapter mixes three different concerns:

- desktop offline mode short-circuits to a demo reply instead of explicit "needs network" behavior
- missing provider configuration is partly represented as a fake success/demo path
- `openai-compatible` configuration exists, but the desktop runtime has no frozen policy for loopback/local endpoints such as Ollama

That makes Phase 3 offline behavior unpredictable and risks silently widening provider behavior in the Tauri desktop runtime.

## In Scope

- Add an explicit AI provider policy classifier for the current desktop/web runtime.
- Treat current `anthropic` and `openai-compatible` providers as online-required in this row.
- Replace offline/demo-success behavior with explicit gated states and UI copy.
- Keep AI key storage and existing `xai_ai_*` prefs as the canonical configuration seams.
- Define how loopback/local-provider-looking configuration is handled before any real local provider is approved.
- Document privacy, failure, and opt-in requirements that any future local-provider row must satisfy before enablement.

## Out of Scope

- Bundling Ollama, LM Studio, llama.cpp, or any model/runtime installer.
- Adding a new native Tauri AI command surface.
- Auto-discovery, auto-start, or silent probing of local model daemons.
- New cloud account provisioning or hosted provider setup work.
- AI Cube legacy native-surface redesign.
- Calendar degraded mode, backup/import/export, reconnect sync, or repository changes.
- Broad `apps/web` or `apps/desktop` IA redesign outside AI gating.

## Acceptance Criteria

1. AI chat and Settings → AI expose deterministic provider states such as ready, key required, base URL required, network required, and local provider not enabled.
2. When desktop is offline, cloud-provider send/test flows do not attempt network calls and instead show explicit online-required messaging.
3. Missing key/base-URL/provider-policy prerequisites do not fall back to fake assistant success.
4. Loopback/local-provider-looking configuration is either explicitly blocked or explicitly enabled by documented opt-in policy; this row chooses the blocked/deferred path unless review changes it.
5. Existing key storage remains in IndexedDB/WebCrypto, and no hidden local-provider dependency is introduced.
6. Build/verify can test the policy entirely with repo-local commands and mocks; real local LLM runtime evidence is not required for this row because no local provider is being enabled.

## Open Questions For Review

- Should loopback `openai-compatible` URLs (`localhost`, `127.0.0.1`, `::1`) be classified as a dedicated `local_provider_not_enabled` state in this row, or should that classification wait for a follow-up local-provider feature?
- Is it preferable to keep the current runtime-profile string `desktop-phase1-offline` as a historical transport flag while introducing AI-specific Phase 3 policy semantics above it, rather than renaming the profile in this row?
