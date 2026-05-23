# Roadmap Seed — xai-web-tokens-and-i18n

> xai-web-console roadmap · feature #2 · wave W1 · Foundation
> Source PRD: web design/DESIGN.md §5 (设计系统/Tokens), §8 (双语支持)
> Source Code: web design/tokens.css, web design/layout.css, web design/i18n.js
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port `web design/tokens.css` (CSS variables: surface, text, accent, semantic, label, list-column, font, spacing, radius, shadow, density, motion) and `web design/i18n.js` (EN + 中文 strings + MOCK data) into the new build form (per build-form-adr). Expose tokens as global CSS imported once in apps/web/src/styles/ and i18n strings via a typed `useI18n(lang)` hook colocated with the shell or in a shared package.

## Hard constraints

- Token names and oklch() values MUST match DESIGN.md §5 verbatim — no drift.
- i18n key paths MUST preserve the dotted `I18N.en.module.key` / `I18N.zh.module.key` shape so module ports stay mechanical.
- Manrope + Noto Sans SC + JetBrains Mono fonts must remain Google Fonts–loaded with the same weights as DESIGN.md §5.2.
- Light/Dark/System theme switch, density (Comfortable/Compact), font-scale 85–115%, and accent-hue 0–360 must all be driven by `data-*` attributes on `<html>` exactly as web design/app.jsx does.

## Acceptance signal

A new apps/web/src/styles/tokens.css (or shared package equivalent) imports cleanly, the i18n hook returns `t` and `s(path)` matching the Babel-form behavior, and a smoke route renders both EN and 中文 strings with the right font stack.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-build-form-adr.
