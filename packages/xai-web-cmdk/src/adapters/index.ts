/**
 * Adapter barrel — imports all 11 adapters for side-effect registration.
 *
 * Each adapter calls registerSearchAdapter() at import time.
 * Importing this barrel ensures all 11 adapters are registered before
 * CommandPalette mounts.
 *
 * This barrel is imported by apps/web/src/App.tsx (via CommandPalette/Provider)
 * and NOT by external consumers directly.
 *
 * CODEX C3-CHROME-2 (2026-05-26): Switched from `export {} from "./X.js"` to
 * bare `import "./X.js"` statement form. The re-export form was being
 * tree-shaken by Vite in production builds because the adapter files were
 * NOT in package.json `sideEffects` whitelist. Tree-shaker elided the
 * adapter modules entirely → registerSearchAdapter() never fired → registry
 * stayed empty → ALL search queries returned "No results" in real Chrome.
 * Statement-form imports + `sideEffects` whitelist together guarantee each
 * adapter module is evaluated even in fully-optimized prod builds.
 *
 * api.md §0 (internal)
 * design.md §Package structure
 */

// Deterministic registration order: alphabetical by module id
import "./board.js";
import "./calendar.js";
import "./countdown.js";
import "./dashboard.js";
import "./habits.js";
import "./matrix.js";
import "./meditation.js";
import "./pomodoro.js";
import "./settings.js";
import "./statistics.js";
import "./tasks.js";
