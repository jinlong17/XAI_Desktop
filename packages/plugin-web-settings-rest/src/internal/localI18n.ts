/**
 * @internal — localI18n.ts
 *
 * Typed bilingual STR table for keys not yet in @repo/plugin-web-tokens.
 * All string keys must have both "en" and "zh" entries — enforced at compile
 * time by the `Record<"en" | "zh", string>` value shape.
 *
 * Usage:
 *   import { localI18n } from "./localI18n.js";
 *   const t = localI18n("en");
 *   t("deleteModal.title") // → "Delete account?"
 *
 * API contract: packages/xai-web-settings-rest/docs/api.md §0
 * ADR: docs/adr/0007-xai-web-console-build-form.md §S5 R10
 */

import type { Lang } from "@repo/plugin-web-tokens";

type BilingualMap = Readonly<Record<string, Readonly<Record<"en" | "zh", string>>>>;

const STR = {
  // Account pane
  "account.name_en": { en: "Aki Chen", zh: "百事可爱" },
  "account.email": { en: "aki.chen@xai.app", zh: "aki.chen@xai.app" },
  "account.using_free": { en: "You are using XAI for free.", zh: "您正在免费使用 XAI。" },
  "account.upgrade_now": { en: "Upgrade Now", zh: "立即升级" },
  "account.sign_out": { en: "Sign Out", zh: "退出登录" },
  "account.delete": { en: "Delete Account", zh: "注销账号" },
  "account.edit_avatar": { en: "Edit avatar", zh: "编辑头像" },

  // Delete confirm modal
  "deleteModal.title": { en: "Delete account?", zh: "注销账号？" },
  "deleteModal.body": {
    en: "This action is permanent. All cloud data will be removed and the account cannot be restored.",
    zh: "此操作不可撤销。所有云端数据将被删除，账号无法恢复。",
  },
  "deleteModal.cancel": { en: "Cancel", zh: "取消" },
  "deleteModal.confirm": { en: "Delete account", zh: "确认注销" },

  // Premium pane
  "premium.headline_en": { en: "Unlock Premium Features", zh: "解锁高级功能" },
  "premium.body_en": {
    en: "Full calendar views, matrix, habit stats, focus sounds & unlimited countdowns.",
    zh: "完整日历视图、四象限矩阵、习惯统计、专注音效和无限倒计时。",
  },

  // Smart Lists
  "smartLists.defaultLists": { en: "Default lists", zh: "默认清单" },
  "smartLists.organize": { en: "Organize", zh: "组织" },
  "smartLists.others": { en: "Others", zh: "其他" },
  "smartLists.all": { en: "All", zh: "全部" },
  "smartLists.today": { en: "Today", zh: "今天" },
  "smartLists.tomorrow": { en: "Tomorrow", zh: "明天" },
  "smartLists.next7": { en: "Next 7 Days", zh: "最近 7 天" },
  "smartLists.assigned": { en: "Assigned to Me", zh: "分配给我" },
  "smartLists.inbox": { en: "Inbox", zh: "收件箱" },
  "smartLists.summary": { en: "Summary", zh: "总览" },
  "smartLists.tags": { en: "Tags", zh: "标签" },
  "smartLists.filters": { en: "Filters", zh: "筛选器" },
  "smartLists.completed": { en: "Completed", zh: "已完成" },
  "smartLists.wont_do": { en: "Won't Do", zh: "不做了" },
  "smartLists.trash": { en: "Trash", zh: "回收站" },
  "smartLists.show": { en: "Show", zh: "显示" },
  "smartLists.if-not-empty": { en: "Show if not empty", zh: "不空显示" },
  "smartLists.hide": { en: "Hide", zh: "隐藏" },

  // Notifications pane
  "notif.enable": { en: "Enable notifications", zh: "启用通知" },
  "notif.types": { en: "Notification types", zh: "提醒类型" },
  "notif.taskDue": { en: "Task due", zh: "任务到期" },
  "notif.pomoDone": { en: "Pomodoro complete", zh: "番茄钟结束" },
  "notif.habitRemind": { en: "Habit reminder", zh: "习惯提醒" },
  "notif.soundSection": { en: "Completion sound", zh: "完成音效" },
  "notif.sound": { en: "Sound", zh: "音效" },
  "notif.soundDesc": { en: "Plays when a task is completed", zh: "任务完成时播放" },
  "notif.soundNone": { en: "None", zh: "无" },
  "notif.soundSubtle": { en: "Subtle", zh: "轻柔" },
  "notif.soundChime": { en: "Chime", zh: "清脆" },
  "notif.soundBell": { en: "Bell", zh: "铃铛" },
  "notif.soundPop": { en: "Pop", zh: "弹响" },
  "notif.dndSection": { en: "Do not disturb", zh: "勿扰" },
  "notif.quietEnable": { en: "Enable quiet hours", zh: "启用勿扰" },
  "notif.quietHours": { en: "Quiet hours", zh: "时段" },

  // DateTime pane
  "dt.startWeek": { en: "Start week on", zh: "周开始" },
  "dt.monday": { en: "Monday", zh: "周一" },
  "dt.sunday": { en: "Sunday", zh: "周日" },
  "dt.saturday": { en: "Saturday", zh: "周六" },
  "dt.lunar": { en: "Show Lunar Calendar", zh: "显示农历" },
  "dt.weekNumbers": { en: "Show Week Numbers (W)", zh: "显示周数 (W)" },
  "dt.holidays": { en: "Show Holidays", zh: "显示节假日" },
  "dt.timezone": { en: "Time Zone", zh: "时区" },
  "dt.timezoneDesc": {
    en: "If enabled, you can select the time zone when setting time for tasks.",
    zh: "启用后可在设置任务时间时选择时区。",
  },

  // More pane
  "more.language": { en: "Language", zh: "语言" },
  "more.followSystem": { en: "Follow System", zh: "跟随系统" },
  "more.windowType": { en: "Choose window type when launching", zh: "启动时窗口类型" },
  "more.winWindow": { en: "Window", zh: "窗口" },
  "more.winTray": { en: "Tray", zh: "托盘" },
  "more.winFull": { en: "Fullscreen", zh: "全屏" },
  "more.launchAtLogin": { en: "Launch at Login", zh: "登录时启动" },
  "more.minimizeOnLaunch": { en: "Minimize app when auto launching", zh: "自动启动时最小化" },
  "more.smartRecog": { en: "Smart Recognition", zh: "智能识别" },
  "more.dateRecog": { en: "Date Recognition", zh: "日期识别" },
  "more.dateRecogDesc": {
    en: "When adding tasks, recognize date and time information and automatically set reminders.",
    zh: "添加任务时识别日期并自动设置提醒。",
  },
  "more.removeText": { en: "Remove text in tasks", zh: "移除任务中的文本" },
  "more.tagRecog": { en: "Tag Recognition", zh: "标签识别" },
  "more.tagRecogDesc": {
    en: "You can select to keep or remove tags from task name.",
    zh: "可选择保留或移除任务名中的标签。",
  },
  "more.removeTags": { en: "Remove tags from task name", zh: "从任务名移除标签" },
  "more.urlParse": { en: "URL Parsing", zh: "URL 解析" },
  "more.urlParseDesc": {
    en: "When the task name is a URL, it will be parsed as the URL title.",
    zh: "当任务名是链接时，解析为 URL 标题。",
  },
  "more.taskDefault": { en: "Task Default", zh: "任务默认值" },
  "more.defaultDate": { en: "Default Date", zh: "默认日期" },
  "more.dateNone": { en: "None", zh: "无" },
  "more.dateToday": { en: "Today", zh: "今天" },
  "more.dateTomorrow": { en: "Tomorrow", zh: "明天" },
  "more.defaultRemDue": { en: "Default Reminders (Due time task)", zh: "默认提醒（带时间任务）" },
  "more.remNone": { en: "None", zh: "无" },
  "more.remOnTime": { en: "On time", zh: "准时" },
  "more.rem5min": { en: "5 min before", zh: "提前 5 分" },
  "more.rem15min": { en: "15 min before", zh: "提前 15 分" },
  "more.defaultRemAll": { en: "Default Reminders (All day task)", zh: "默认提醒（全天任务）" },
  "more.rem9am": { en: "At 9:00 AM", zh: "上午 9:00" },
  "more.remDayBefore": { en: "Day before", zh: "前一日" },
  "more.defaultPri": { en: "Default Priority", zh: "默认优先级" },
  "more.priNone": { en: "No Priority", zh: "无优先级" },
  "more.priLow": { en: "Low", zh: "低" },
  "more.priMed": { en: "Medium", zh: "中" },
  "more.priHigh": { en: "High", zh: "高" },
  "more.defaultTag": { en: "Default Tag", zh: "默认标签" },
  "more.tagNone": { en: "None", zh: "无" },
  "more.tagStudy": { en: "Study", zh: "学习" },
  "more.tagWork": { en: "Work", zh: "工作" },
  "more.tagPersonal": { en: "Personal", zh: "个人" },
  "more.defaultList": { en: "Default List", zh: "默认清单" },
  "more.listInbox": { en: "Inbox", zh: "收件箱" },
  "more.listToday": { en: "Today", zh: "今天" },
  "more.defaultAddTo": { en: "Default Add to", zh: "默认添加到" },
  "more.addTop": { en: "Top of List", zh: "列表顶部" },
  "more.addBottom": { en: "Bottom of List", zh: "列表底部" },
  "more.overdueAt": { en: "Overdue Section shows at", zh: "过期区显示位置" },
  "more.overdueTop": { en: "Top of List", zh: "列表顶部" },
  "more.overdueBottom": { en: "Bottom of List", zh: "列表底部" },
  "more.resetDefault": { en: "Reset Default", zh: "恢复默认" },
  "more.taskTemplate": { en: "Task Template", zh: "任务模板" },

  // Integrations pane
  "int.featured": { en: "Featured", zh: "精选" },
  "int.calendar": { en: "Calendar", zh: "日历" },
  "int.integrate": { en: "Integrate", zh: "集成" },
  "int.localCal": { en: "Local Calendars", zh: "本地日历" },

  // Integrations OAuth stub (extension 2026-05-25 — gap-closure row #7)
  "int.banner.stub": {
    en: "Integrations are in v1 stub mode — authorization flows are wired but no data sync occurs yet.",
    zh: "集成处于 v1 演示模式 — 已接入授权流程，但暂不进行真实数据同步。",
  },
  "int.badge.connected_stub": { en: "Connected (stub)", zh: "已连接（演示）" },
  "int.btn.connect": { en: "Connect", zh: "连接" },
  "int.btn.disconnect": { en: "Disconnect", zh: "断开连接" },
  "int.section.connected": { en: "Connected providers", zh: "已连接提供商" },
  "int.disconnect.tooltip": {
    en: "Disconnect clears local state only. To revoke access, visit the provider's account settings.",
    zh: "断开仅清除本地状态。如需撤销授权，请前往提供商账号设置。",
  },
  "oauth.cb.success": { en: "Authorization received (stub)", zh: "已接收授权（演示）" },
  "oauth.cb.invalid": { en: "Invalid authorization state — please try again", zh: "授权状态无效 — 请重新尝试" },
  "oauth.cb.cancelled": { en: "Authorization cancelled", zh: "授权已取消" },
  "oauth.cb.redirect_notice": { en: "Returning to settings…", zh: "正在返回设置…" },
  "provider.notion": { en: "Notion", zh: "Notion" },
  "provider.gcal": { en: "Google Calendar", zh: "Google 日历" },
  "provider.linear": { en: "Linear", zh: "Linear" },

  // Collaborate pane
  "collab.showAvatars": { en: "Show collaborator avatars", zh: "显示协作者头像" },
  "collab.defaultShare": { en: "Default share permission", zh: "分享时默认权限" },
  "collab.canComment": { en: "Can comment", zh: "可评论" },
  "collab.canEdit": { en: "Can edit", zh: "可编辑" },
  "collab.viewOnly": { en: "View only", zh: "只读" },
  "collab.mentionNotify": { en: "Notify on @ mentions", zh: "接收 @ 提及通知" },

  // Sticky pane
  "sticky.defaultColor": { en: "Default Color", zh: "默认颜色" },
  "sticky.fontSize": { en: "Font Size", zh: "字体大小" },
  "sticky.fontSmall": { en: "Small", zh: "小" },
  "sticky.fontNormal": { en: "Normal", zh: "普通" },
  "sticky.fontLarge": { en: "Large", zh: "大" },
  "sticky.fontXl": { en: "Extra-Large", zh: "特大" },
  "sticky.pinDefault": { en: "Pin by Default", zh: "默认置顶" },
  "sticky.restoreSize": { en: "Restore Default Size", zh: "恢复默认尺寸" },
  "sticky.restoreSizeDesc": {
    en: "If enabled, sticky notes will restore to their default size when arranging.",
    zh: "启用后排列便签时会恢复至默认尺寸。",
  },
  "sticky.gridSpacing": { en: "Default Grid Spacing", zh: "默认网格间距" },
  "sticky.spaceNone": { en: "None", zh: "无" },
  "sticky.spaceNormal": { en: "Normal", zh: "普通" },
  "sticky.spaceLarge": { en: "Large", zh: "大" },
  "sticky.spaceXl": { en: "Extra-Large", zh: "特大" },
  "sticky.learnMore": { en: "Learn more", zh: "了解更多" },
  "sticky.desc_en": {
    en: 'Pin tasks as Sticky Notes on your desktop for quick idea capture. (Right-click tasks and choose "Open as Sticky Note")',
    zh: "将任务以便签形式钉在桌面快速捕获想法。（右键任务，选择「打开为便签」）",
  },

  // Hotkeys pane
  "hk.quickAdd": { en: "Quick add", zh: "快速添加" },
  "hk.globalSearch": { en: "Global search", zh: "全局搜索" },
  "hk.switchBoards": { en: "Switch boards", zh: "切换看板" },
  "hk.today": { en: "Today", zh: "今日任务" },
  "hk.calendar": { en: "Calendar", zh: "日历" },
  "hk.pomodoro": { en: "Pomodoro", zh: "番茄钟" },
  "hk.toggleDark": { en: "Toggle dark mode", zh: "切换深色" },
  "hk.togglePet": { en: "Toggle pet", zh: "切换桌宠" },
  "hk.newSticky": { en: "New sticky note", zh: "创建便签" },
  "hk.clearCompleted": { en: "Clear completed", zh: "清除完成任务" },

  // About pane
  "about.title_en": { en: "XAI Console", zh: "XAI 工作台" },
  "about.desc_en": {
    en: "A focused, bilingual productivity workspace.",
    zh: "一款轻盈、专注、面向中英双语用户的生产力工作台。",
  },
  "about.changelog": { en: "Changelog", zh: "更新日志" },
  "about.privacy": { en: "Privacy", zh: "隐私政策" },
  "about.terms": { en: "Terms", zh: "服务条款" },
  "about.feedback": { en: "Feedback", zh: "反馈" },
} as const satisfies BilingualMap;

export type StrKey = keyof typeof STR;

/**
 * Returns a typed bilingual lookup function for the given lang.
 * Accepts either a strict StrKey or any string (runtime fallback returns "").
 *
 * @example
 * const t = localI18n("en");
 * t("deleteModal.title") // → "Delete account?"
 */
export function localI18n(lang: Lang): (key: StrKey | string) => string {
  return (key: StrKey | string): string => {
    const entry = (STR as Record<string, Record<"en" | "zh", string>>)[key];
    return entry ? entry[lang] : "";
  };
}
