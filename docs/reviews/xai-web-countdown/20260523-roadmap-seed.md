# Roadmap Seed — xai-web-countdown

> xai-web-console roadmap · feature #17 · wave W2 · Module
> Source PRD: web design/DESIGN.md §4.10 (Countdown)
> Source Code: web design/module-countdown.jsx
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port the Countdown module: grid of countdown cards (two visual variants: image-background + light-background) with a "create new" placeholder card. Each card shows title + target-date + remaining-days countdown.

## Hard constraints

- Cards persisted (propose key `xai_countdowns`); each carries {id, title:{en,zh}, target_date, variant, cover_url|null}.
- Remaining-days computed live from current local date.
- Image-variant cards may use placeholder images; user-upload is deferred to DESIGN.md §13 (Future).
- All strings bilingual.

## Acceptance signal

User can add/edit/delete a countdown card, both variants render correctly, remaining-days updates daily, and persistence round-trips.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-shell.
