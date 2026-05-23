# Roadmap Seed — xai-web-ai-chat

> xai-web-console roadmap · feature #18 · wave W2 · Module
> Source PRD: web design/DESIGN.md §4.1 (AI Chat)
> Source Code: web design/module-ai.jsx
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port the AI Chat module: conversation history sidebar (collapsible, 248px, 360ms slide), 5-layer aurora background (90px blur + screen blend) + 3 conic gradients (40/55/70s rotate) + 60 twinkling stars + SVG grain noise + .ai-aurora 4-layer accent-color floor, breathing orb (9/11/13s idle → 3.5/4.2/5s thinking), composer (pill input + attachments + model picker Haiku/Sonnet/Opus + mic toggle + Enter to send), and starter-prompts panel (hidden by default, top-right pill toggle). LLM call goes through `window.claude.complete(text)` when available (per DESIGN.md §4.1) with a demo-text fallback on error.

## Hard constraints

- Background layers must NOT cause layout thrash; use will-change + transforms only.
- Conversation list persisted to `xai_ai_convos`; insights toggle to `xai_ai_insights`; voice toggle to `xai_ai_voice`.
- The build-form-adr decides whether `window.claude.complete` is reachable in the new build (Vite SPA likely needs an adapter); the seed brief plan must call out the adapter strategy.
- All strings bilingual.

## Acceptance signal

AI Chat opens, full aurora background renders without jank, breathing orb animates idle→thinking on Enter, message round-trips through the adapter (or demo fallback), and conversation history persists.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-shell.
