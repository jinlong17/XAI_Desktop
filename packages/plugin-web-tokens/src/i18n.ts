/**
 * i18n bundles for XAI Console — EN + ZH.
 *
 * Port of web design/i18n.js lines 5–393 (I18N section only).
 * The window.MOCK block (lines 397–636) is NOT ported here.
 *
 * The bundle is declared `as const` so TypeScript can derive the full
 * structural type `I18NBundle = typeof I18N["en"]` and enforce that the
 * ZH bundle has the same shape at compile time.
 */

import type { Lang } from "./types.js";

export const I18N = {
  en: {
    app_name: "XAI Console",
    nav: { tasks: "Tasks", habits: "Habits", pomodoro: "Pomodoro", calendar: "Calendar", matrix: "Matrix", countdown: "Countdown", search: "Search", settings: "Settings", board: "Boards", dashboard: "Dashboard", meditation: "Meditation", statistics: "Statistics", timetrack: "Time Tracker", bookkeeping: "Bookkeeping", pet: "Pet", ai: "XAI Chat" },
    common: {
      today: "Today", tomorrow: "Tomorrow", yesterday: "Yesterday",
      next_7_days: "Next 7 Days", inbox: "Inbox", summary: "Summary",
      completed: "Completed", trash: "Trash", wont_do: "Won't Do",
      lists: "Lists", filters: "Filters", tags: "Tags", calendar_sub: "Calendar Subscription",
      add: "Add", more: "More", postpone: "Postpone", overdue: "Overdue",
      later: "Later", no_date: "No Date", no_tasks: "No tasks",
      view_more: "View more", search_placeholder: "Search tasks, habits, notes…",
      sign_out: "Sign Out", delete_account: "Delete Account", upgrade: "Upgrade",
      cancel: "Cancel", save: "Save", done: "Done",
      streak: "Streak", days: "Days", day: "Day",
      jan: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", may: "May", jun: "Jun",
      jul: "Jul", aug: "Aug", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec",
    },
    weekdays_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const,
    tasks: {
      all: "All",
      next_mon: "Next Mon", next_wed: "Next Wed",
    },
    habits: {
      title: "Habits",
      monthly_checkins: "Monthly check-ins",
      total_checkins: "Total check-ins",
      monthly_rate: "Monthly rate",
      streak: "Streak",
      habit_log: "Habit Log",
      empty_log: "No check-ins shared this month yet.",
    },
    pomo: {
      title: "Pomodoro",
      focus: "Focus",
      paused: "Paused",
      running: "Focusing",
      start: "Start",
      pause: "Pause",
      continue: "Continue",
      end: "End",
      overview: "Overview",
      todays_pomos: "Today's Pomos",
      todays_focus: "Today's Focus",
      total_pomos: "Total Pomos",
      total_focus: "Total Focus",
      focus_record: "Focus Record",
    },
    cal: {
      month: "Month", week: "Week", day: "Day",
      today: "Today",
      sample_banner: "Sample data — switch to your account to see real events.",
      coming_soon: "Week and Day views are coming soon.",
      holiday_mayday: "Labor Day",
      holiday_mothers_day: "Mother's Day",
    },
    matrix: {
      title: "Eisenhower Matrix",
      urgent_important: "Urgent & Important",
      not_urgent_important: "Not Urgent & Important",
      urgent_unimportant: "Urgent & Unimportant",
      not_urgent_unimportant: "Not Urgent & Unimportant",
    },
    countdown: {
      title: "Countdown",
      days_until: "Days until",
      days_since: "Days since",
    },
    settings: {
      title: "Settings",
      account: "Account",
      premium: "Premium",
      features: "Features",
      smart_lists: "Smart Lists",
      notifications: "Notifications",
      date_time: "Date & Time",
      appearance: "Appearance",
      more: "More",
      integrations: "Integrations & Import",
      collaborate: "Collaborate",
      sticky: "Sticky Note",
      hotkeys: "Hotkeys",
      about: "About",
      ai: "AI",
      language: "Language",
      theme: "Theme",
      density: "Density",
      font_scale: "Font scale",
      light: "Light", dark: "Dark", system: "System",
      comfortable: "Comfortable", compact: "Compact",
      using_free: "You are using XAI for free.",
      upgrade_now: "Upgrade Now",
      // ---- Features panel (xai-web-settings-features-panel row #23) ----
      features_intro: "Toggle modules on or off. Disabled modules are hidden from the rail and their routes show a friendly empty state. Your data is preserved.",
      features_off_title: "This module is turned off",
      features_off_body: "Re-enable it in Settings → Features.",
      features_desc_tasks: "Plan and track your daily tasks.",
      features_desc_board: "Trello-style boards with multiple views.",
      features_desc_dashboard: "Customizable widgets at a glance.",
      features_desc_calendar: "Manage your tasks with six calendar views.",
      features_desc_matrix: "Focus on what's important and urgent.",
      features_desc_pomodoro: "Use the Pomo timer to keep focus.",
      features_desc_habits: "Develop a habit and keep track of it.",
      features_desc_meditation: "Full-screen breathing with ambient scenes.",
      // ---- Appearance pane (§S8 — declared by xai-web-settings-appearance #22) ----
      accent_color: "Accent color",
      accent_color_desc: "Drives primary actions, links, active states",
      bg_palette: "Background palette",
      bg_palette_desc: "Changes global background and panel tones",
      sidebar_position: "Sidebar position",
      sidebar_position_desc: "Where the navigation rail appears",
      font_scale_desc: "Global type scale",
      language_desc: "Interface language",
      theme_desc: "Light / Dark / System",
      density_desc: "Row height & card density",
      reset_defaults: "Reset to defaults",
      save_apply: "Save & apply",
      saved_flash: "Saved",
      rail_left: "Left",
      rail_right: "Right",
      rail_top: "Top",
      rail_bottom: "Bottom (Dock)",
      bg_default: "Sage",
      bg_cream: "Cream",
      bg_mist: "Mist",
      bg_lavender: "Lavender",
      bg_peach: "Peach",
      bg_graphite: "Graphite",
      hue_sage: "Sage",
      hue_ocean: "Ocean",
      hue_sunset: "Sunset",
      hue_rose: "Rose",
      hue_violet: "Violet",
      hue_amber: "Amber",
      reset_confirm: "Reset Appearance settings to defaults? Language is not affected.",
    },
    tag: { study: "Study", work: "Work", personal: "Personal", todo: "TO-DO", other: "OtherTask" },
    avatar: { settings: "Settings", statistics: "Statistics", sign_out: "Sign Out", premium: "Premium", sign_out_confirm_title: "Sign out?", sign_out_confirm_body: "You'll be signed out of this browser. Any unsaved local data will remain." },
    board: {
      title: "Boards",
      my_board: "My Project Board",
      add_list: "Add another list",
      add_card: "Add a card",
      add_card_compact: "+ Add a card",
      lists: { backlog: "Backlog", today: "Today", week: "This Week", later: "Later", done: "Done" },
      create_card_title: "Enter a title or paste a link",
      view_board: "Board", view_planner: "Planner", view_inbox: "Inbox",
      labels: "Labels", checklist: "Checklist", due: "Due",
      filter: "Filter", share: "Share",
      total: "cards",
      views: { board: "Board", table: "Table", calendar: "Calendar", dashboard: "Dashboard", timeline: "Timeline", map: "Map" },
      views_header: "See your work in a new way",
      list_actions: "List actions",
      change_color: "Change list color",
      remove_color: "Remove color",
      copy_list: "Copy list",
      move_list: "Move list",
      watch: "Watch",
      archive: "Archive this list",
      automation: "Automation",
      table_card: "Card", table_list: "List", table_labels: "Labels", table_members: "Members", table_due: "Due date", table_checklist: "Progress",
      no_cards: "No cards",
      empty_calendar: "No cards with a due date this month.",
    },
    dashboard: {
      title: "Dashboard",
      hello: "Hello",
      good_morning: "Good morning",
      good_afternoon: "Good afternoon",
      good_evening: "Good evening",
      today_focus: "Today's Focus",
      tasks_done: "Tasks done",
      streak: "Habit streak",
      pomos: "Pomodoros",
      weather: "Weather",
      timezones: "World clocks",
      sticky_notes: "Sticky Notes",
      mail: "Inbox",
      upcoming: "Upcoming",
      schedule: "My schedule",
      add_widget: "Add widget",
      add_widget_aria: "Add a new dashboard widget",
      empty_title: "No widgets yet",
      empty_subtitle: "Install dashboard widgets to get started.",
      picker: {
        title: "Add a widget",
        cancel: "Cancel",
        all_added_title: "All widgets are on your dashboard",
        all_added_subtitle: "Remove a widget first to add a different one.",
        add_button: "Add",
        aria_close: "Close picker",
      },
      quote_daily: "Daily quote",
      quote_custom: "Custom message",
      quote_edit: "Edit message",
      quote_placeholder: "Write your own daily message…",
      quote_show: "Show daily quote",
      hide: "Hide",
      add_quote: "Daily quote",
      add_countdown: "Personal countdown",
      add_sticky: "Sticky note",
      visible: "Visible",
      hidden: "Hidden",
      countdowns: "Countdowns",
      countdown_title: "Title",
      countdown_date: "Date",
      countdown_add: "New countdown",
      days_left: "days",
      widgets: {
        clock: {
          classic: "Classic",
          split: "Split",
          minimal: "Minimal",
          analog: "Analog",
          local_time: "Local time",
          timezone: "Timezone",
        },
        mini_cal: {
          open: "Open Calendar",
        },
        world_clocks: {
          add_city: "Add city",
          all_added: "All cities added",
          list: "List",
          analog: "Analog",
          grid: "Grid",
          today: "Today",
          tomorrow: "Tomorrow",
          yesterday: "Yesterday",
          remove: "Remove",
        },
      },
    },
    quotes: [
      { author: "Lao Tzu",         text: "A journey of a thousand miles begins with a single step." },
      { author: "Annie Dillard",    text: "How we spend our days is, of course, how we spend our lives." },
      { author: "Marcus Aurelius",  text: "You have power over your mind — not outside events. Realize this, and you will find strength." },
      { author: "James Clear",      text: "Every action you take is a vote for the type of person you wish to become." },
      { author: "Maya Angelou",     text: "You can't use up creativity. The more you use, the more you have." },
      { author: "Naval Ravikant",   text: "Be patient. Compound interest works for everything in life." },
      { author: "Österberg",        text: "Small wins, kept daily, are the architecture of a great year." },
    ] as const,
    meditation: {
      title: "Meditation",
      enter: "Enter",
      exit: "Exit",
      pick_scene: "Choose a scene",
      pick_clock: "Clock style",
      pick_sound: "Ambient sound",
      scenes: { forest: "Forest", ocean: "Ocean", night: "Night Sky", rain: "Rain Window", void: "Void" },
      clocks:  { digital: "Digital", split: "Split", analog: "Analog", minimal: "Minimal" },
      sounds:  { none: "Silence", water: "Flowing Water", rain: "Soft Rain", waves: "Ocean Waves", thunder: "Distant Thunder", forest: "Forest Birds", whiteNoise: "White Noise" },
      duration: "Duration",
      mins: "min",
      breathe: "Breathe",
      start: "Start session",
      clock_settings: "Clock settings",
      clock_sizes: { compact: "Compact", normal: "Normal", large: "Large", larger: "Larger" },
      clock_colors: { digits: "Digits", hands: "Hands", ring: "Ring", background: "Background", highlight: "Highlight" },
      fixed_duration: "Fixed duration",
      custom_duration: "Custom minutes",
      infinite: "Infinite",
      infinite_mode: "Infinite mode",
      volume: "Volume",
      play_sound: "Play ambient sound",
      pause_sound: "Pause ambient sound",
      custom_scene: "Custom scene",
      new_scene: "New scene",
      edit_scene: "Edit scene",
      delete_scene: "Delete scene",
      save_scene: "Save scene",
      scene_name: "Scene name",
      default_duration: "Default minutes",
      animation: "Animation",
      scene_fields: { background: "Background", gradientFrom: "Gradient A", gradientTo: "Gradient B" },
      animations: { particles: "Floating", rain: "Rainfall", waves: "Waves", aurora: "Aurora", still: "Still" },
    },
    statistics: {
      title: "Statistics",
      this_week: "This Week",
      this_month: "This Month",
      all_time: "All time",
      tasks_completed: "Tasks completed",
      focus_time: "Focus time",
      habits_kept: "Habits kept",
      daily_avg: "Daily average",
    },
    pet: {
      hello: "Hi! Don't forget to drink water 💧",
      working: "Stay focused — you've got this.",
      idle: "Click me for a tip.",
      tip1: "Take a deep breath.",
      tip2: "Stretch for 30 seconds.",
      tip3: "5 min until your next pomodoro.",
      tip4: "3 tasks left for today.",
    },
  },
  zh: {
    app_name: "XAI 工作台",
    nav: { tasks: "任务", habits: "习惯", pomodoro: "番茄钟", calendar: "日历", matrix: "四象限", countdown: "倒计时", search: "搜索", settings: "设置", board: "项目板", dashboard: "工作台", meditation: "冥想", statistics: "统计", timetrack: "时间追踪", bookkeeping: "记账", pet: "桌宠", ai: "XAI 智谈" },
    common: {
      today: "今天", tomorrow: "明天", yesterday: "昨天",
      next_7_days: "最近 7 天", inbox: "收件箱", summary: "总览",
      completed: "已完成", trash: "回收站", wont_do: "不做了",
      lists: "清单", filters: "筛选器", tags: "标签", calendar_sub: "订阅日历",
      add: "添加", more: "更多", postpone: "延期", overdue: "过期",
      later: "以后", no_date: "无日期", no_tasks: "暂无任务",
      view_more: "查看更多", search_placeholder: "搜索任务、习惯、笔记…",
      sign_out: "退出登录", delete_account: "注销账号", upgrade: "升级",
      cancel: "取消", save: "保存", done: "完成",
      streak: "连续", days: "天", day: "天",
      jan: "1 月", feb: "2 月", mar: "3 月", apr: "4 月", may: "5 月", jun: "6 月",
      jul: "7 月", aug: "8 月", sep: "9 月", oct: "10 月", nov: "11 月", dec: "12 月",
    },
    weekdays_short: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"] as const,
    tasks: {
      all: "全部",
      next_mon: "下周一", next_wed: "下周三",
    },
    habits: {
      title: "习惯",
      monthly_checkins: "本月打卡",
      total_checkins: "累计打卡",
      monthly_rate: "本月打卡率",
      streak: "连续打卡",
      habit_log: "习惯日记",
      empty_log: "本月还没有打卡心得。",
    },
    pomo: {
      title: "番茄钟",
      focus: "专注",
      paused: "已暂停",
      running: "专注中",
      start: "开始",
      pause: "暂停",
      continue: "继续",
      end: "结束",
      overview: "总览",
      todays_pomos: "今日番茄数",
      todays_focus: "今日专注",
      total_pomos: "累计番茄",
      total_focus: "累计专注",
      focus_record: "专注记录",
    },
    cal: {
      month: "月", week: "周", day: "日",
      today: "今天",
      sample_banner: "示例数据 — 登录后查看真实事件。",
      coming_soon: "周视图与日视图即将推出。",
      holiday_mayday: "劳动节",
      holiday_mothers_day: "母亲节",
    },
    matrix: {
      title: "四象限",
      urgent_important: "紧急 · 重要",
      not_urgent_important: "不紧急 · 重要",
      urgent_unimportant: "紧急 · 不重要",
      not_urgent_unimportant: "不紧急 · 不重要",
    },
    countdown: {
      title: "倒计时",
      days_until: "距离",
      days_since: "已过",
    },
    settings: {
      title: "设置",
      account: "账户",
      premium: "会员",
      features: "功能",
      smart_lists: "智能清单",
      notifications: "通知",
      date_time: "日期与时间",
      appearance: "外观",
      more: "更多",
      integrations: "集成与导入",
      collaborate: "协作",
      sticky: "便签",
      hotkeys: "快捷键",
      about: "关于",
      ai: "AI 设置",
      language: "语言",
      theme: "主题",
      density: "密度",
      font_scale: "字体大小",
      light: "浅色", dark: "深色", system: "跟随系统",
      comfortable: "舒适", compact: "紧凑",
      using_free: "你正在使用 XAI 免费版。",
      upgrade_now: "立即升级",
      // ---- Features panel (xai-web-settings-features-panel row #23) ----
      features_intro: "开启或关闭模块。关闭后将从侧栏隐藏并显示空状态，数据会被保留。",
      features_off_title: "此模块已关闭",
      features_off_body: "在 设置 → 功能 中重新开启。",
      features_desc_tasks: "规划并追踪你的每日任务。",
      features_desc_board: "看板与多视图项目管理。",
      features_desc_dashboard: "一目了然的可定制小组件。",
      features_desc_calendar: "用六种视图管理任务。",
      features_desc_matrix: "专注重要紧急。",
      features_desc_pomodoro: "用番茄钟保持专注。",
      features_desc_habits: "养成习惯并追踪。",
      features_desc_meditation: "沉浸式呼吸与环境场景。",
      // ---- Appearance pane (§S8 — declared by xai-web-settings-appearance #22) ----
      accent_color: "主题色",
      accent_color_desc: "影响主操作色、链接、选中态",
      bg_palette: "背景调子",
      bg_palette_desc: "改变全局背景与面板色调",
      sidebar_position: "侧栏位置",
      sidebar_position_desc: "选择导航栏出现在哪个方向",
      font_scale_desc: "全局缩放",
      language_desc: "界面语言",
      theme_desc: "浅色 / 深色 / 跟随系统",
      density_desc: "列表行高与卡片密度",
      reset_defaults: "恢复默认",
      save_apply: "保存生效",
      saved_flash: "已保存",
      rail_left: "左侧",
      rail_right: "右侧",
      rail_top: "顶部",
      rail_bottom: "底部",
      bg_default: "鼠尾草",
      bg_cream: "奶油",
      bg_mist: "薄雾",
      bg_lavender: "薰衣草",
      bg_peach: "蜜桃",
      bg_graphite: "石墨",
      hue_sage: "鼠尾草",
      hue_ocean: "海洋",
      hue_sunset: "日落",
      hue_rose: "玫瑰",
      hue_violet: "紫罗兰",
      hue_amber: "琥珀",
      reset_confirm: "确定恢复外观设置为默认值？语言不会被影响。",
    },
    tag: { study: "学习", work: "工作", personal: "个人", todo: "待办", other: "其他" },
    avatar: { settings: "设置", statistics: "统计", sign_out: "退出登录", premium: "会员", sign_out_confirm_title: "退出登录？", sign_out_confirm_body: "你将从此浏览器退出登录。本地未保存的数据会保留。" },
    board: {
      title: "项目板",
      my_board: "我的项目板",
      add_list: "新建列",
      add_card: "添加卡片",
      add_card_compact: "+ 添加卡片",
      lists: { backlog: "待办池", today: "今天", week: "本周", later: "以后", done: "已完成" },
      create_card_title: "输入标题或粘贴链接",
      view_board: "看板", view_planner: "计划", view_inbox: "收件箱",
      labels: "标签", checklist: "清单", due: "截止",
      filter: "筛选", share: "分享",
      total: "张卡片",
      views: { board: "看板", table: "表格", calendar: "日历", dashboard: "仪表盘", timeline: "时间线", map: "地图" },
      views_header: "换个视角看你的工作",
      list_actions: "列动作",
      change_color: "修改颜色",
      remove_color: "移除颜色",
      copy_list: "复制列",
      move_list: "移动列",
      watch: "关注",
      archive: "归档此列",
      automation: "自动化",
      table_card: "卡片", table_list: "所在列", table_labels: "标签", table_members: "成员", table_due: "截止", table_checklist: "进度",
      no_cards: "暂无卡片",
      empty_calendar: "本月没有带截止日期的卡片。",
    },
    dashboard: {
      title: "工作台",
      hello: "你好",
      good_morning: "早上好",
      good_afternoon: "下午好",
      good_evening: "晚上好",
      today_focus: "今日专注",
      tasks_done: "完成任务",
      streak: "习惯连胜",
      pomos: "番茄数",
      weather: "天气",
      timezones: "世界时间",
      sticky_notes: "便签",
      mail: "收件箱",
      upcoming: "近期事件",
      schedule: "我的日程",
      add_widget: "添加组件",
      add_widget_aria: "添加新的工作台组件",
      empty_title: "暂无组件",
      empty_subtitle: "安装 dashboard-widgets 后即可开始。",
      picker: {
        title: "添加组件",
        cancel: "取消",
        all_added_title: "所有组件已添加",
        all_added_subtitle: "先移除一个组件后再添加其他组件。",
        add_button: "添加",
        aria_close: "关闭组件选择器",
      },
      quote_daily: "每日一句",
      quote_custom: "自定义消息",
      quote_edit: "编辑消息",
      quote_placeholder: "写下你今天想看到的话…",
      quote_show: "显示每日一句",
      hide: "隐藏",
      add_quote: "每日一句",
      add_countdown: "个人倒计时",
      add_sticky: "便签",
      visible: "已显示",
      hidden: "已隐藏",
      countdowns: "倒计时",
      countdown_title: "名称",
      countdown_date: "日期",
      countdown_add: "新倒计时",
      days_left: "天",
      widgets: {
        clock: {
          classic: "经典",
          split: "分段",
          minimal: "极简",
          analog: "模拟",
          local_time: "本地时间",
          timezone: "时区",
        },
        mini_cal: {
          open: "打开日历",
        },
        world_clocks: {
          add_city: "添加城市",
          all_added: "已添加全部城市",
          list: "列表",
          analog: "模拟",
          grid: "网格",
          today: "今天",
          tomorrow: "明天",
          yesterday: "昨天",
          remove: "移除",
        },
      },
    },
    quotes: [
      { author: "老子",    text: "千里之行，始于足下。" },
      { author: "顾城",    text: "今天怎么过生活，你就怎么过一生。" },
      { author: "联创人",  text: "你现在做的每一件事，都在为你想成为的人投票。" },
      { author: "鲁迅",    text: "愿中国青年都摆脱冷气，只是向上走。" },
      { author: "周作人",  text: "生活之艺术在微小之处。" },
      { author: "未知",    text: "每个均衡的一天，都是一年的基石。" },
      { author: "莒志摩",  text: "耐心是万事之本。" },
    ] as const,
    meditation: {
      title: "冥想",
      enter: "进入",
      exit: "退出",
      pick_scene: "选择场景",
      pick_clock: "时钟样式",
      pick_sound: "环境音",
      scenes: { forest: "森林", ocean: "海洋", night: "夜空", rain: "雨窗", void: "虚空" },
      clocks:  { digital: "数字", split: "分屏", analog: "指针", minimal: "极简" },
      sounds:  { none: "无声", water: "流水", rain: "细雨", waves: "海浪", thunder: "雷鸣", forest: "森林", whiteNoise: "白噪音" },
      duration: "时长",
      mins: "分钟",
      breathe: "呼吸",
      start: "开始冥想",
      clock_settings: "时钟设置",
      clock_sizes: { compact: "紧凑", normal: "正常", large: "大", larger: "更大" },
      clock_colors: { digits: "数字", hands: "指针", ring: "圆环", background: "背景", highlight: "高亮" },
      fixed_duration: "固定时长",
      custom_duration: "自定义分钟",
      infinite: "无限",
      infinite_mode: "无限模式",
      volume: "音量",
      play_sound: "播放环境音",
      pause_sound: "暂停环境音",
      custom_scene: "自定义场景",
      new_scene: "新建场景",
      edit_scene: "编辑场景",
      delete_scene: "删除场景",
      save_scene: "保存场景",
      scene_name: "场景名称",
      default_duration: "默认分钟",
      animation: "动画效果",
      scene_fields: { background: "背景色", gradientFrom: "渐变色 A", gradientTo: "渐变色 B" },
      animations: { particles: "漂浮", rain: "雨落", waves: "波浪", aurora: "极光", still: "静止" },
    },
    statistics: {
      title: "统计",
      this_week: "本周",
      this_month: "本月",
      all_time: "全部时间",
      tasks_completed: "完成任务",
      focus_time: "专注时长",
      habits_kept: "保持习惯",
      daily_avg: "日均",
    },
    pet: {
      hello: "嗨！别忘了喝水 💧",
      working: "专注就好 — 你可以的。",
      idle: "点点我看看小贴士。",
      tip1: "深呼吸一下。",
      tip2: "起来拉伸 30 秒。",
      tip3: "距离下一个番茄钟 5 分钟。",
      tip4: "今天还剩 3 个任务。",
    },
  },
} as const;

/** Full structural type of the EN bundle — ZH must match this shape. */
export type I18NBundle = typeof I18N["en"];

/**
 * Widen `as const` string literals to `string` so the ZH parity check below
 * tests STRUCTURAL equality (same keys, same nesting, same array arity) without
 * requiring ZH text to equal EN text. Preserves tuple/array arity and recurses
 * into nested objects.
 */
type DeepWidenLiterals<T> =
  T extends string
    ? string
    : T extends number
      ? number
      : T extends boolean
        ? boolean
        : T extends readonly [infer Head, ...infer Tail]
          ? readonly [DeepWidenLiterals<Head>, ...DeepWidenLiterals<Tail>]
          : T extends readonly (infer U)[]
            ? readonly DeepWidenLiterals<U>[]
            : T extends object
              ? { [K in keyof T]: DeepWidenLiterals<T[K]> }
              : T;

/**
 * Compile-time enforcement that the ZH bundle has the same SHAPE as EN.
 *
 * Real structural check — NO `as unknown` bypass. If ZH is missing a key,
 * adds an extra key, changes a nesting level, or drops/adds an array element,
 * `tsc --noEmit` will emit a TypeScript error here pointing at the drift.
 *
 * The widened-literal helper lets ZH's Chinese text (`"任务"`) satisfy the
 * EN-derived shape without having to equal EN's literals (`"Tasks"`).
 */
const _zhShapeCheck: DeepWidenLiterals<I18NBundle> = I18N.zh;
void _zhShapeCheck;

// ---------------------------------------------------------------------------
// Dotted-path walker helper
// ---------------------------------------------------------------------------

/** Walk a nested object by a dot-separated path. Supports numeric array indices. */
function walkPath(obj: unknown, parts: string[]): unknown {
  let cursor: unknown = obj;
  for (const part of parts) {
    if (cursor === null || cursor === undefined) return undefined;
    if (typeof cursor === "object") {
      cursor = (cursor as Record<string, unknown>)[part];
    } else if (Array.isArray(cursor)) {
      const idx = Number(part);
      cursor = (cursor as unknown[])[idx];
    } else {
      return undefined;
    }
  }
  return cursor;
}

// ---------------------------------------------------------------------------
// useI18n hook
// ---------------------------------------------------------------------------

/**
 * Returns the typed bundle for the active language and a dotted-path accessor.
 *
 * `t` — structurally typed bundle for the active language.
 *   Use this when the key path is known at compile time:
 *     const { t } = useI18n(lang);
 *     <h1>{t.habits.title}</h1>
 *
 * `s(path)` — dotted-string accessor. Use this for runtime-computed keys
 *   or when porting prototype code that already uses s("habits.title").
 *   Missing keys return the path string itself and warn in DEV.
 *
 * The hook is pure and stateless — no context subscription, no side effects.
 */
export function useI18n(lang: Lang): { t: I18NBundle; s: (path: string) => string } {
  const bundle = I18N[lang as keyof typeof I18N];
  if (!bundle) {
    throw new TypeError(
      `[useI18n] unsupported lang "${String(lang)}". Supported: "en" | "zh".`
    );
  }

  // Safe runtime cast: `_zhShapeCheck` above proves at compile time that
  // ZH structurally widens to `I18NBundle`. `I18N[lang]` resolves to the
  // union `I18N["en"] | I18N["zh"]`, which TS cannot narrow to `I18NBundle`
  // (= `typeof I18N["en"]`) on its own — but it is sound because both arms
  // share the same EN-derived shape. No `as unknown` bypass; the structural
  // guarantee comes from `_zhShapeCheck`, not from this cast.
  const t = bundle as I18NBundle;

  const s = (path: string): string => {
    if (path === "") {
      if (typeof import.meta !== "undefined" && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
        console.warn("[useI18n] missing key", path, "in", lang);
      }
      return "";
    }
    const parts = path.split(".");
    const result = walkPath(bundle, parts);
    if (result === undefined || result === null) {
      if (typeof import.meta !== "undefined" && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
        console.warn("[useI18n] missing key", path, "in", lang);
      }
      return path;
    }
    if (typeof result === "string") return result;
    if (typeof result === "number") return String(result);
    // Non-string leaf (e.g. object or array) — return path as fallback
    if (typeof import.meta !== "undefined" && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
      console.warn("[useI18n] missing key", path, "in", lang);
    }
    return path;
  };

  return { t, s };
}
