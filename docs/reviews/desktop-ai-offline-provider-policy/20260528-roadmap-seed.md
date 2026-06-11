# Roadmap Seed - desktop-ai-offline-provider-policy

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase3
> Branch: dev

## Requirement

Implement clear AI agent offline behavior for Phase 3: default to "available when online", with optional Ollama/local LLM configuration only if the ADR or feature plan approves it.

## Hard constraints

- Do not make local LLM/Ollama a hidden default dependency.
- Preserve explicit online-required messaging for cloud AI providers.
- Any local-provider support must have configuration, failure, and privacy semantics documented before enablement.

## Acceptance signal

AI surfaces show predictable online/offline/provider states, cloud provider calls are gated when offline, and any approved local provider path is optional, configurable, and testable.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-local-first-storage-adr` SHIPPED.
