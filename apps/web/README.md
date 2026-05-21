# @repo/web

Canonical browser product host for XAI Web.

This package is a thin Vite host shell only. It should contain:

- app bootstrap (`src/main.tsx`)
- route assembly (`src/routes/**`)
- provider composition (`src/providers/**`)
- host pages (`src/pages/**`)
- service worker wiring (`src/service-worker/**`)
- shared host styles (`src/styles/**`)

Do not place domain business logic directly in page components.
