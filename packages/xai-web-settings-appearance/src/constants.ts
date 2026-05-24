/**
 * Frozen constant arrays for @repo/plugin-web-settings-appearance.
 *
 * Sourced verbatim from web design/module-settings.jsx lines 497-512, 599-604.
 * All arrays are Object.freeze'd + as const to prevent runtime mutation.
 *
 * API contract: packages/xai-web-settings-appearance/docs/api.md §2
 */

import type { BgToneOption, HuePreset, RailPosOption } from "./types.js";

function deepFreeze<T extends object>(obj: T): T {
  Object.getOwnPropertyNames(obj).forEach((name) => {
    const val = (obj as Record<string, unknown>)[name];
    if (val !== null && typeof val === "object") {
      deepFreeze(val as object);
    }
  });
  return Object.freeze(obj);
}

export const BG_TONES: readonly BgToneOption[] = deepFreeze([
  { id: "default",  name: { en: "Sage",     zh: "鼠尾草" }, hue: 165 },
  { id: "cream",    name: { en: "Cream",    zh: "奶油"  }, hue: 55  },
  { id: "mist",     name: { en: "Mist",     zh: "薄雾"  }, hue: 230 },
  { id: "lavender", name: { en: "Lavender", zh: "薰衣草" }, hue: 295 },
  { id: "peach",    name: { en: "Peach",    zh: "蜜桃"  }, hue: 35  },
  { id: "graphite", name: { en: "Graphite", zh: "石墨"  }, hue: 220 },
] satisfies BgToneOption[]);

export const HUE_PRESETS: readonly HuePreset[] = deepFreeze([
  { id: "sage",    hue: 165, name: { en: "Sage",    zh: "鼠尾草" } },
  { id: "ocean",   hue: 230, name: { en: "Ocean",   zh: "海洋"  } },
  { id: "sunset",  hue: 35,  name: { en: "Sunset",  zh: "日落"  } },
  { id: "rose",    hue: 355, name: { en: "Rose",    zh: "玫瑰"  } },
  { id: "violet",  hue: 295, name: { en: "Violet",  zh: "紫罗兰" } },
  { id: "amber",   hue: 75,  name: { en: "Amber",   zh: "琥珀"  } },
] satisfies HuePreset[]);

export const RAIL_POSITIONS: readonly RailPosOption[] = deepFreeze([
  { id: "left",   label: { en: "Left",           zh: "左侧" } },
  { id: "right",  label: { en: "Right",          zh: "右侧" } },
  { id: "top",    label: { en: "Top",            zh: "顶部" } },
  { id: "bottom", label: { en: "Bottom (Dock)", zh: "底部" } },
] satisfies RailPosOption[]);
