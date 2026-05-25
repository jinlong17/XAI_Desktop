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
 * api.md §0 (internal)
 * design.md §Package structure
 */

// Deterministic registration order: alphabetical by module id
export {} from "./board.js";
export {} from "./calendar.js";
export {} from "./countdown.js";
export {} from "./dashboard.js";
export {} from "./habits.js";
export {} from "./matrix.js";
export {} from "./meditation.js";
export {} from "./pomodoro.js";
export {} from "./settings.js";
export {} from "./statistics.js";
export {} from "./tasks.js";
