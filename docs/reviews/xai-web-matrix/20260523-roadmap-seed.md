# Roadmap Seed — xai-web-matrix

> xai-web-console roadmap · feature #13 · wave W2 · Module
> Source PRD: web design/DESIGN.md §4.6 (Eisenhower Matrix)
> Source Code: web design/module-matrix.jsx
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port the Eisenhower Matrix: 2×2 grid with a colored top-bar per quadrant — Urgent · Important (Q1 red) / Not Urgent · Important (Q2 amber) / Urgent · Not Important (Q3 blue) / Not Urgent · Not Important (Q4 gray). Cards drag between quadrants and tag the underlying task with the appropriate priority signal.

## Hard constraints

- Quadrant colors MUST use the tokens.css semantic palette (no hard-coded hex).
- Drag-between-quadrant MUST persist to the underlying task model (shares store with xai-web-tasks where applicable; otherwise local matrix state).
- Empty-quadrant state: subtle hint text bilingual.

## Acceptance signal

Matrix view renders 4 quadrants, drag-between persists, all strings bilingual, accessible labels present.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-shell.
