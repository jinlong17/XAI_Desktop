/**
 * @internal — presets.ts
 *
 * Bundled CSS gradient presets for the "image" card variant.
 * The `cover_url` storage form is `"preset:<id>"`.
 *
 * Design: packages/xai-web-countdown/docs/design.md §9
 * API contract: packages/xai-web-countdown/docs/api.md §1.3
 *
 * NEVER rename the `id` values — they are persisted in localStorage.
 */

import type { ImagePreset } from "../types.js";

export const IMAGE_PRESETS: readonly ImagePreset[] = Object.freeze([
  {
    id: "dusk",
    gradient: "linear-gradient(160deg, #6c5b4b, #2c241e)",
    label_en: "Dusk",
    label_zh: "暮色",
  },
  {
    id: "midnight",
    gradient: "linear-gradient(160deg, #2a3d6b, #0e1a3a)",
    label_en: "Midnight",
    label_zh: "夜空",
  },
  {
    id: "sand",
    gradient: "linear-gradient(160deg, #cfb6a8, #8e7568)",
    label_en: "Sand",
    label_zh: "沙色",
  },
  {
    id: "forest",
    gradient: "linear-gradient(160deg, #3d5a3d, #1a2e1a)",
    label_en: "Forest",
    label_zh: "森林",
  },
  {
    id: "peach",
    gradient: "linear-gradient(160deg, #ffb38a, #c97058)",
    label_en: "Peach",
    label_zh: "暖橙",
  },
  {
    id: "lavender",
    gradient: "linear-gradient(160deg, #9a8ec7, #564b8a)",
    label_en: "Lavender",
    label_zh: "薰衣草",
  },
] as ImagePreset[]);
