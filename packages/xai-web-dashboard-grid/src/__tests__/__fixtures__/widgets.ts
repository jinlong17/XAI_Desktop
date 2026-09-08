/**
 * Test data fixtures for @repo/plugin-web-dashboard-grid tests.
 *
 * §4 (original) — THREE_WIDGETS + EMPTY for P1..P3 tests.
 * §9.4 (extension) — TEN_WIDGETS for picker tests (gap-closure row #5).
 */
import * as React from "react";
import type { WidgetRegistration } from "../../types.js";

export function makeFixture(
  id: string,
  span: WidgetRegistration["span"] = "w-stat",
): WidgetRegistration {
  return {
    id,
    span,
    render: () => React.createElement("div", { "data-testid": `body-${id}` }, id),
  };
}

export const THREE_WIDGETS: WidgetRegistration[] = [
  makeFixture("alpha", "w-clock"),
  makeFixture("bravo", "w-stat"),
  makeFixture("charlie", "w-weather"),
];

export const EMPTY: WidgetRegistration[] = [];

// §9.4 — mirrors the row #11 SHIPPED catalog shape (10 widgets)
export const TEN_WIDGETS: WidgetRegistration[] = [
  makeFixture("clock",        "w-clock"),
  makeFixture("stat-tasks",   "w-stat"),
  makeFixture("stat-streak",  "w-stat"),
  makeFixture("stat-pomos",   "w-stat"),
  makeFixture("weather",      "w-weather"),
  makeFixture("mini-cal",     "w-mini-cal"),
  makeFixture("timezones",    "w-timezones"),
  makeFixture("stickies",     "w-stickies"),
  makeFixture("mail",         "w-mail"),
  makeFixture("upcoming",     "w-upcoming"),
];
