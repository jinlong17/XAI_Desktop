/**
 * @internal — Sample event fixture for May 2026.
 *
 * Transcribed byte-for-byte from `web design/i18n.js:509-541`.
 * v1 ships read-only events; no storage / create / edit / delete.
 * The banner declares "Sample data — switch to your account…" so users
 * understand these are not real.
 */

/**
 * Color band class for event chips/blocks.
 *
 * The 4 baseline colors (mint/amber/blue/violet) appear in the fixture
 * `SAMPLE_EVENTS` and originate from `web design/layout.css:849-852`.
 *
 * `rose` was added by the 2026-05-27 event-create extension (HC8 lift) as
 * a 5th color preset — only user-created events use it (fixture never does).
 * The CSS rule family lives in `styles.css` alongside the other 4.
 */
export type CalEventColor = "mint" | "amber" | "blue" | "violet" | "rose";

export interface CalEvent {
  /** Color band class. */
  c: CalEventColor;
  /** Bilingual title (en + zh). */
  t: { en: string; zh: string };
  /** Optional HH:MM clock string. */
  time?: string;
  /**
   * Optional end time "HH:MM" for multi-hour event blocks in Week/Day views.
   * Absent → block height = 1 hour from `time`. Month view ignores this field.
   * NOTE: controlled drift from i18n.js byte-parity — the 5 annotated events
   * below gain endTime as a Week/Day view demo. AC-FIXTURE-EXT-1..3 assert shape.
   */
  endTime?: string;
}

/** Day-of-month (1..31) → events. Day 14 and day 31 are empty arrays per source. */
export type CalEventsByDay = Record<number, CalEvent[]>;

export const SAMPLE_EVENTS: CalEventsByDay = {
  1: [
    { c: "amber", t: { en: "Call Sandy", zh: "打电话给 Sandy" } },
    { c: "blue", t: { en: "Demand research", zh: "需求调研" } },
    { c: "mint", t: { en: "Showcase", zh: "展示" } },
    { c: "mint", t: { en: "health screen", zh: "体检" } },
  ],
  2: [
    { c: "amber", t: { en: "Check emails", zh: "查看邮件" } },
    { c: "mint", t: { en: "Grocery", zh: "购物" } },
    { c: "mint", t: { en: "Tesco", zh: "Tesco" } },
  ],
  3: [
    { c: "mint", t: { en: "Family dinner", zh: "家庭聚餐" }, time: "19:00" },
  ],
  4: [
    { c: "mint", t: { en: "Badminton", zh: "羽毛球" } },
    { c: "blue", t: { en: "Beverage supplier", zh: "饮料供应商" } },
  ],
  5: [
    { c: "mint", t: { en: "Online class", zh: "线上课" } },
    { c: "mint", t: { en: "water flowers", zh: "浇花" } },
  ],
  6: [
    { c: "mint", t: { en: "Blog writing", zh: "博客撰写" } },
    { c: "mint", t: { en: "Marketing plan", zh: "市场计划" } },
    { c: "amber", t: { en: "Topic research", zh: "选题调研" } },
  ],
  7: [
    { c: "mint", t: { en: "Yoga class", zh: "瑜伽课" }, time: "19:00", endTime: "20:00" },
    { c: "mint", t: { en: "design pictures", zh: "设计图" } },
  ],
  8: [
    { c: "mint", t: { en: "Content marketing", zh: "内容营销" }, time: "14:15", endTime: "15:30" },
    { c: "mint", t: { en: "Gift for Jess", zh: "给 Jess 的礼物" } },
  ],
  9: [
    { c: "mint", t: { en: "Booking", zh: "预订" } },
    { c: "mint", t: { en: "Packing", zh: "打包" } },
    { c: "mint", t: { en: "Search Hotel", zh: "找酒店" } },
    { c: "mint", t: { en: "Trip plan", zh: "行程" } },
  ],
  10: [
    { c: "mint", t: { en: "Wiping windows", zh: "擦窗" }, time: "14:15", endTime: "16:15" },
    { c: "mint", t: { en: "Buy milk", zh: "买牛奶" }, time: "18:00" },
    { c: "mint", t: { en: "Family Trip", zh: "家庭出游" } },
  ],
  11: [{ c: "mint", t: { en: "Picnic", zh: "野餐" } }],
  12: [
    { c: "violet", t: { en: "Baseball", zh: "棒球" }, time: "18:00" },
    { c: "mint", t: { en: "Marketing plan", zh: "市场计划" } },
  ],
  13: [
    { c: "mint", t: { en: "Departmental training", zh: "部门培训" } },
    { c: "mint", t: { en: "Blog design", zh: "博客设计" } },
    { c: "amber", t: { en: "Curatorial team", zh: "策展团队" } },
  ],
  14: [],
  15: [
    { c: "mint", t: { en: "Draft Newsletter", zh: "撰写通讯" } },
    { c: "mint", t: { en: "Weekly review", zh: "周复盘" } },
  ],
  16: [
    { c: "blue", t: { en: "Sponsors", zh: "赞助" } },
    { c: "mint", t: { en: "Yoga class", zh: "瑜伽课" } },
  ],
  17: [
    { c: "mint", t: { en: "Visit Jess", zh: "探望 Jess" }, time: "14:00" },
    { c: "mint", t: { en: "Daily report", zh: "日报" } },
    { c: "mint", t: { en: "pay rent", zh: "交租" } },
  ],
  18: [{ c: "mint", t: { en: "Little park cafe", zh: "小公园咖啡" } }],
  19: [
    { c: "mint", t: { en: "Blog", zh: "博客" } },
    { c: "mint", t: { en: "Distribution plan", zh: "分发计划" } },
    { c: "amber", t: { en: "Media", zh: "媒体" } },
  ],
  20: [
    { c: "mint", t: { en: "Release note", zh: "发版说明" }, time: "16:00" },
    { c: "mint", t: { en: "release", zh: "发布" } },
  ],
  21: [
    { c: "mint", t: { en: "Bedtime reading", zh: "睡前阅读" } },
    { c: "mint", t: { en: "Guest post review", zh: "客座文审" } },
    { c: "blue", t: { en: "Sponsors", zh: "赞助" } },
  ],
  22: [
    { c: "mint", t: { en: "Data Analysis", zh: "数据分析" }, time: "11:00", endTime: "13:00" },
    { c: "mint", t: { en: "Brainstorming", zh: "头脑风暴" }, time: "11:30" },
    { c: "mint", t: { en: "Meditation", zh: "冥想" } },
  ],
  23: [
    { c: "mint", t: { en: "0–1 Product construction", zh: "0-1 产品搭建" }, time: "14:00", endTime: "16:30" },
    { c: "mint", t: { en: "Video review", zh: "视频复盘" }, time: "14:30" },
    { c: "mint", t: { en: "New Feature Showcase", zh: "新功能展示" } },
  ],
  24: [
    { c: "mint", t: { en: "Kitchen Cleaning", zh: "厨房清洁" }, time: "09:15" },
    { c: "mint", t: { en: "shopping", zh: "购物" } },
    { c: "mint", t: { en: "Yoga class", zh: "瑜伽课" } },
  ],
  25: [
    { c: "mint", t: { en: "Go carting!", zh: "去卡丁车！" } },
    { c: "mint", t: { en: "PRD Review", zh: "PRD 评审" } },
  ],
  26: [
    { c: "amber", t: { en: "Lily's birthday", zh: "Lily 生日" } },
    { c: "mint", t: { en: "Team meeting", zh: "团队会" } },
  ],
  27: [{ c: "mint", t: { en: "Jogging", zh: "晨跑" } }],
  28: [
    { c: "amber", t: { en: "Meeting notes", zh: "会议纪要" }, time: "07:00" },
    { c: "blue", t: { en: "Monthly Product Plan", zh: "月度产品规划" } },
  ],
  29: [
    { c: "amber", t: { en: "data collection", zh: "数据采集" } },
    { c: "amber", t: { en: "Monthly OKRs", zh: "月度 OKR" } },
    { c: "mint", t: { en: "Product roadmap", zh: "产品路线" } },
  ],
  30: [{ c: "amber", t: { en: "Team-building plans", zh: "团建计划" } }],
  31: [],
};
