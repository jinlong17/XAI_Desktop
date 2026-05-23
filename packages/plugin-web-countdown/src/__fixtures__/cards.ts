/**
 * Test fixtures for @repo/plugin-web-countdown tests.
 *
 * Test strategy: packages/xai-web-countdown/docs/test.md §4
 */

import type { CountdownCard } from "../types.js";

export const FIXTURE_FUTURE: CountdownCard = {
  id: "cd_test01",
  title: { en: "Weekend", zh: "周末" },
  target_date: "2026-05-30",
  variant: "image",
  cover_url: "preset:dusk",
};

export const FIXTURE_PAST: CountdownCard = {
  id: "cd_test02",
  title: { en: "Using XAI", zh: "使用 XAI" },
  target_date: "2020-02-20",
  variant: "image",
  cover_url: "preset:sand",
};

export const FIXTURE_LIGHT: CountdownCard = {
  id: "cd_test03",
  title: { en: "Spring Festival", zh: "春节" },
  target_date: "2027-02-06",
  variant: "light",
  cover_url: null,
};

export const FIXTURE_INVALID: unknown = {
  id: "cd_bad",
  title: { en: "Missing ZH" }, // missing title.zh — should fail predicate
  target_date: "2026-12-31",
  variant: "light",
  cover_url: null,
};
