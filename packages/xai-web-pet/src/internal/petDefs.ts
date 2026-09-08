/**
 * PET_DEFS — catalog of 8 desktop pet characters.
 *
 * Byte-faithful port from web design/pet.jsx lines 180–189.
 *
 * 8 ids map to 7 keyframe animations:
 *   - mochi + drip share "bob" (same keyframe; visual distinction from SVG shape)
 *   - pebble uses "still" (explicit no-op keyframe)
 *
 * This const is re-exported via src/index.ts (public surface).
 * Consumers MUST NOT import from this file directly.
 */

import type { PetDef } from "../types.js";

export const PET_DEFS: readonly PetDef[] = [
  {
    id: "mochi",
    anim: "bob",
    name: { en: "Mochi", zh: "麻薯" },
    desc: { en: "A squishy mint companion.", zh: "绵软的薄荷小球。" },
  },
  {
    id: "pip",
    anim: "hop",
    name: { en: "Pip", zh: "啾啾" },
    desc: { en: "A tiny bird with big ideas.", zh: "满脑子点子的小鸟。" },
  },
  {
    id: "sprout",
    anim: "sway",
    name: { en: "Sprout", zh: "豆芽" },
    desc: { en: "A baby plant cheering you on.", zh: "为你加油的小苗。" },
  },
  {
    id: "lumi",
    anim: "glow",
    name: { en: "Lumi", zh: "小灯" },
    desc: { en: "A bulb that lights up your ideas.", zh: "照亮灵感的小灯泡。" },
  },
  {
    id: "drip",
    anim: "bob",
    name: { en: "Drip", zh: "水滴" },
    desc: { en: "A tiny water spirit. Stay hydrated.", zh: "提醒你喝水的小水滴。" },
  },
  {
    id: "pebble",
    anim: "still",
    name: { en: "Pebble", zh: "小石" },
    desc: { en: "A steady rock for deep-focus days.", zh: "专注日里的稳重伙伴。" },
  },
  {
    id: "star",
    anim: "twinkle",
    name: { en: "Twink", zh: "小星" },
    desc: { en: "A star that twinkles on every win.", zh: "为每个成就闪烁的星星。" },
  },
  {
    id: "ember",
    anim: "flicker",
    name: { en: "Ember", zh: "小火" },
    desc: { en: "A warm flame for late-night focus.", zh: "陪你深夜冲刺的小火苗。" },
  },
] as const;
