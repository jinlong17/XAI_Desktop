# Roadmap Seed — xai-web-dashboard-widgets

> xai-web-console roadmap · feature #11 · wave W2 · Module (split from dashboard)
> Source PRD: web design/DESIGN.md §4.4 — Clock / MiniCalendar / WorldClocks / Weather / Stickies / Mail / Upcoming / 3 mini stats
> Source Code: web design/module-dashboard.jsx (widget components: ClockWidget, MiniCalWidget, WorldClocks, WeatherWidget, StickiesWidget, MailWidget, UpcomingWidget, StatTasks/StatHabits/StatPomodoro)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port every Dashboard widget defined in DESIGN.md §4.4: Clock (4 styles Classic/Split/Minimal/Analog + 12 timezones + analog full 60-min minor tick + 12-hour major tick + 12 numbers), Mini Calendar (mac-style month, colored dots for daily todos, click → goTo Calendar), World Clocks (List/Analog/Grid view + 12 addable/removable cities), Weather (current + 5-day), Stickies (rotated note stack), Mail (unread red dot + badge), Upcoming (event list), and 3 mini stats (donut completed-tasks / streak fire / pomodoro dot grid).

## Hard constraints

- ClockWidget style persisted to `xai_clock_style`; timezone to `xai_clock_tz`; world-clock list to `xai_zones`.
- Mini-Cal "click day" navigation uses the event bus (`goTo('calendar', { date })`), not a direct import.
- Analog clock minor ticks MUST render all 60; major ticks MUST render all 12; numbers MUST be aligned.
- All widget strings bilingual.

## Acceptance signal

All widgets render inside the grid container, ClockWidget cycles all 4 styles + 12 timezones, MiniCal navigates to Calendar via event bus, World Clocks lets user add/remove cities, persistence round-trips, and EN/中文 parity holds.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-dashboard-grid.
