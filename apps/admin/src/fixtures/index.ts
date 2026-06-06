/**
 * apps/admin/src/fixtures/index.ts — typed fixtures (Phase 3).
 *
 * Ported from the prototype's inline `const` arrays
 * (docs/prototypes/admin-dashboard/index.html). These are TYPED EXPORTS consumed
 * only by the mock adapters in `../adapters/*` — NOT inline page globals
 * (enforced by TT-NO-INLINE-MOCK). No production data, no network, no secret.
 *
 * SECURITY: the prototype carried provider masked-key display strings.
 * Those are intentionally DROPPED here — provider
 * fixtures expose `keyStatus` only, never key material (TT-PROVIDERS-NO-KEY,
 * api.md §6).
 */
import type {
  KpiCard,
  OpsQueueItem,
  UserRow,
  SavedView,
  OrgRow,
  FeatureFlag,
  SpenderRow,
  QuotaPolicy,
  ProviderCard,
  RoleCard,
  RbacRow,
  BillingMetrics,
  PlanShare,
  TxnRow,
  AuditRow,
  AdminSettings,
} from "../adapters/types";

/* ---- Users (prototype USERS / VIEWS / UCHIPS) ---- */
export const USERS: UserRow[] = [
  { name: "Diego Vega", email: "diego@acme.io", status: "活跃", plan: "Enterprise", usageM: 6.2, color: "#f0a868", lastActive: "8 分钟前", daysInactive: 0, cost: 412, mfa: false, risk: "high", role: "管理员", over: true },
  { name: "李明", email: "liming@gmail.com", status: "活跃", plan: "Pro", usageM: 1.24, color: "#6d5efc", lastActive: "5 分钟前", daysInactive: 0, cost: 18, mfa: true, risk: null, role: "成员" },
  { name: "Sarah Chen", email: "sarah.c@outlook.com", status: "活跃", plan: "Team", usageM: 4.8, color: "#fb7185", lastActive: "2 小时前", daysInactive: 0, cost: 182, mfa: true, risk: null, role: "管理员", over: true },
  { name: "王伟", email: "wangwei@163.com", status: "活跃", plan: "Free", usageM: 0.082, color: "#34d399", lastActive: "1 天前", daysInactive: 1, cost: 0, mfa: false, risk: null, role: "成员" },
  { name: "spam_bot_91", email: "temp@mail.ru", status: "已封禁", plan: "Free", usageM: 0, color: "#71717a", lastActive: "3 天前", daysInactive: 3, cost: 0, mfa: false, risk: "high", role: "成员" },
  { name: "James Park", email: "jpark@company.io", status: "待验证", plan: "Pro", usageM: 0.34, color: "#60a5fa", lastActive: "6 小时前", daysInactive: 0, cost: 5, mfa: false, risk: "watch", role: "成员" },
  { name: "张晓", email: "zhangx@qq.com", status: "活跃", plan: "Free", usageM: 0.156, color: "#fbbf24", lastActive: "22 分钟前", daysInactive: 0, cost: 2, mfa: true, risk: null, role: "成员" },
  { name: "Mehmet Y.", email: "mehmet@startup.co", status: "休眠", plan: "Pro", usageM: 0.012, color: "#a78bfa", lastActive: "48 天前", daysInactive: 48, cost: 1, mfa: true, risk: null, role: "管理员" },
  { name: "Olivia R.", email: "olivia@design.studio", status: "活跃", plan: "Team", usageM: 3.1, color: "#22d3ee", lastActive: "刚刚", daysInactive: 0, cost: 118, mfa: true, risk: null, role: "所有者", over: true },
  { name: "Theo Mraz", email: "theo@northwind.com", status: "休眠", plan: "Pro", usageM: 0.02, color: "#8fbf6a", lastActive: "91 天前", daysInactive: 91, cost: 1, mfa: true, risk: null, role: "安全" },
];

export const USER_VIEWS: SavedView[] = [
  { key: "all", label: "全部", pred: () => true },
  { key: "active", label: "活跃", pred: (u) => u.status === "活跃" },
  { key: "pending", label: "待验证", pred: (u) => u.status === "待验证" },
  { key: "banned", label: "已封禁", pred: (u) => u.status === "已封禁" },
  { key: "over", label: "超额", pred: (u) => u.over === true },
  { key: "highcost", label: "高成本", pred: (u) => u.cost >= 100 },
  { key: "dormant", label: "30天未登录", pred: (u) => u.daysInactive > 30 },
];

export const USER_CHIPS: { key: string; label: string }[] = [
  { key: "Pro", label: "Pro" },
  { key: "Enterprise", label: "Enterprise" },
  { key: "admin", label: "管理员" },
  { key: "risk", label: "高风险" },
  { key: "nomfa", label: "无 MFA" },
];

/* ---- Features (prototype FEATURES) ---- */
export const FEATURES: FeatureFlag[] = [
  { key: "ai-write", icon: "✍️", name: "AI 写作助手", category: "AI", status: "on", rollout: 100, uses: 128400, users: 8240, trend: 22, quota: { free: 20, pro: 500, team: -1 } },
  { key: "smart-org", icon: "🗂️", name: "智能整理", category: "效率", status: "on", rollout: 100, uses: 96200, users: 6910, trend: 14, quota: { free: 50, pro: -1, team: -1 } },
  { key: "board", icon: "📋", name: "看板 / Board", category: "效率", status: "on", rollout: 100, uses: 88100, users: 7320, trend: 9, quota: { free: 3, pro: 50, team: -1 } },
  { key: "ai-sum", icon: "📝", name: "AI 总结", category: "AI", status: "on", rollout: 100, uses: 74600, users: 5980, trend: 31, quota: { free: 10, pro: 300, team: -1 } },
  { key: "calendar", icon: "📅", name: "日历日程", category: "效率", status: "on", rollout: 100, uses: 61200, users: 5210, trend: 6, quota: { free: -1, pro: -1, team: -1 } },
  { key: "labels", icon: "🏷️", name: "智能标签", category: "效率", status: "on", rollout: 100, uses: 52800, users: 4830, trend: 11, quota: { free: 100, pro: -1, team: -1 } },
  { key: "focus", icon: "🍅", name: "专注番茄钟", category: "效率", status: "on", rollout: 100, uses: 41300, users: 3120, trend: 18, quota: { free: -1, pro: -1, team: -1 } },
  { key: "ai-cube", icon: "🧊", name: "AI Cube", category: "AI", status: "on", rollout: 100, uses: 33900, users: 2870, trend: 27, quota: { free: 5, pro: 100, team: -1 } },
  { key: "clipboard", icon: "📎", name: "剪贴板历史", category: "效率", status: "beta", rollout: 25, uses: 18700, users: 1240, trend: 48, quota: { free: 30, pro: 200, team: -1 } },
  { key: "meditation", icon: "🧘", name: "冥想空间", category: "生活", status: "off", rollout: 0, uses: 4200, users: 610, trend: -12, quota: { free: 0, pro: -1, team: -1 } },
  { key: "pet", icon: "🐾", name: "桌面宠物", category: "生活", status: "off", rollout: 0, uses: 2100, users: 380, trend: -8, quota: { free: 0, pro: -1, team: -1 } },
];

export const ACTIVE_BASE = 9200;

/* ---- AI consumers (prototype AICONSUMERS) ---- */
export const AI_CONSUMERS: SpenderRow[] = [
  { name: "Acme Corp", plan: "Team", usedM: 52.1, quotaM: 50, cost: "$198", color: "#fb7185" },
  { name: "Sarah Chen", plan: "Team", usedM: 48.0, quotaM: 50, cost: "$182", color: "#fb7185" },
  { name: "Olivia R.", plan: "Team", usedM: 31.0, quotaM: 50, cost: "$118", color: "#22d3ee" },
  { name: "DesignHub", plan: "Team", usedM: 22.4, quotaM: 50, cost: "$85", color: "#a78bfa" },
  { name: "李明", plan: "Pro", usedM: 1.24, quotaM: 5, cost: "$18", color: "#6d5efc" },
  { name: "James Park", plan: "Pro", usedM: 0.34, quotaM: 5, cost: "$5", color: "#60a5fa" },
];

/* ---- AI routing policy (prototype ROUTING) ---- */
export const ROUTING: QuotaPolicy[] = [
  { plan: "Free", model: "Gemini 3.1 Flash-Lite", fallback: "GPT-4o-mini", cap: "$0", requests: "200 / 天", overage: "block" },
  { plan: "Pro", model: "Gemini 3.1 Flash", fallback: "Flash-Lite", cap: "$40 / 席位", requests: "5k / 天", overage: "throttle" },
  { plan: "Team", model: "GPT-4o", fallback: "Gemini Flash", cap: "$60 / 席位", requests: "15k / 天", overage: "throttle" },
  { plan: "Enterprise", model: "Claude Opus 4.8", fallback: "Sonnet 4.6", cap: "自定义", requests: "无限", overage: "alert" },
];

/* ---- Providers (prototype PROVIDERS) — keyStatus only, NO key material ---- */
export const PROVIDERS: ProviderCard[] = [
  {
    key: "gemini", name: "Google Gemini", color: "#6d5efc", enabled: true, keyStatus: "configured", usage: "194M", cost: "$1,420", defaultModel: "gemini-3.1-flash-lite",
    models: [
      { id: "gemini-3.1-flash-lite", tag: "极快·省", tiers: { free: 1, pro: 1, team: 1 } },
      { id: "gemini-3.1-flash", tag: "均衡", tiers: { free: 0, pro: 1, team: 1 } },
      { id: "gemini-3.1-pro", tag: "高质量", tiers: { free: 0, pro: 0, team: 1 } },
    ],
  },
  {
    key: "openai", name: "OpenAI", color: "#60a5fa", enabled: true, keyStatus: "configured", usage: "128M", cost: "$2,180", defaultModel: "gpt-4o-mini",
    models: [
      { id: "gpt-4o-mini", tag: "快·省", tiers: { free: 1, pro: 1, team: 1 } },
      { id: "gpt-4o", tag: "旗舰", tiers: { free: 0, pro: 1, team: 1 } },
      { id: "o3-mini", tag: "推理", tiers: { free: 0, pro: 0, team: 1 } },
    ],
  },
  {
    key: "claude", name: "Anthropic Claude", color: "#34d399", enabled: true, keyStatus: "configured", usage: "74M", cost: "$1,060", defaultModel: "claude-haiku-4.5",
    models: [
      { id: "claude-haiku-4.5", tag: "快", tiers: { free: 1, pro: 1, team: 1 } },
      { id: "claude-sonnet-4.6", tag: "均衡", tiers: { free: 0, pro: 1, team: 1 } },
      { id: "claude-opus-4.8", tag: "最强", tiers: { free: 0, pro: 0, team: 1 } },
    ],
  },
  {
    key: "deepseek", name: "DeepSeek", color: "#71717a", enabled: false, keyStatus: "not-configured", usage: "—", cost: "—", defaultModel: "—",
    models: [{ id: "deepseek-v3", tag: "省", tiers: { free: 0, pro: 0, team: 0 } }],
  },
];

/* ---- Audit (prototype AUDIT) ---- */
export const AUDIT: AuditRow[] = [
  { time: "2026-05-30 09:12", who: "Jinlong", type: "config", action: "调整席位", object: "Acme Robotics 40→60", ip: "103.21.7.5", ok: true },
  { time: "2026-05-30 08:40", who: "客服-小李", type: "auth", action: "模拟登录", object: "usr_1008 (Diego Vega)", ip: "58.32.1.4", ok: true },
  { time: "2026-05-29 14:32", who: "风控系统", type: "danger", action: "封禁用户", object: "spam_bot_91", ip: "10.0.0.1", ok: true },
  { time: "2026-05-29 14:01", who: "Jinlong", type: "config", action: "灰度放量", object: "剪贴板历史 → 25%", ip: "103.21.7.5", ok: true },
  { time: "2026-05-29 13:40", who: "Jinlong", type: "config", action: "模型权限变更", object: "gemini-3.1-pro → 仅 Team", ip: "103.21.7.5", ok: true },
  { time: "2026-05-29 11:20", who: "客服-小王", type: "auth", action: "重置密码", object: "usr_8f3a21 (James Park)", ip: "58.32.1.9", ok: true },
  { time: "2026-05-29 10:05", who: "Jinlong", type: "config", action: "配额调整", object: "AI写作 Pro 300→500 次/月", ip: "103.21.7.5", ok: true },
  { time: "2026-05-29 09:48", who: "admin@xai", type: "auth", action: "登录中台", object: "管理中台", ip: "103.21.7.5", ok: true },
  { time: "2026-05-28 22:14", who: "未知", type: "auth", action: "登录失败", object: "admin · 密码错误×3", ip: "45.9.x.x", ok: false },
  { time: "2026-05-28 18:30", who: "财务-李", type: "billing", action: "导出账单", object: "2026-04 发票", ip: "58.32.1.2", ok: true },
  { time: "2026-05-28 16:02", who: "运营-张", type: "create", action: "功能上线", object: "专注番茄钟", ip: "58.32.1.7", ok: true },
  { time: "2026-05-28 15:20", who: "Jinlong", type: "danger", action: "功能下线", object: "冥想空间", ip: "103.21.7.5", ok: true },
];

/* ---- Roles & RBAC (prototype ROLES / PERMS) ---- */
export const ROLES: RoleCard[] = [
  { key: "super", name: "超级管理员", members: 2, color: "#6d5efc", icon: "★", description: "全部权限,含角色与系统配置" },
  { key: "ops", name: "运营", members: 5, color: "#60a5fa", icon: "运", description: "用户、功能、看板与灰度发布" },
  { key: "support", name: "客服", members: 8, color: "#34d399", icon: "服", description: "用户查看、重置密码、模拟登录" },
  { key: "finance", name: "财务", members: 2, color: "#fbbf24", icon: "财", description: "计费、账单与发票导出" },
  { key: "audit", name: "只读审计", members: 3, color: "#a1a1aa", icon: "审", description: "只读全站 + 审计日志" },
];

export const RBAC: RbacRow[] = [
  { permission: "查看看板", grants: { super: 1, ops: 1, support: 1, finance: 1, audit: 1 } },
  { permission: "用户管理", grants: { super: 1, ops: 1, support: 1, finance: 0, audit: 0 } },
  { permission: "封禁用户", grants: { super: 1, ops: 1, support: 0, finance: 0, audit: 0 } },
  { permission: "模拟登录", grants: { super: 1, ops: 0, support: 1, finance: 0, audit: 0 } },
  { permission: "功能上下线 / 灰度", grants: { super: 1, ops: 1, support: 0, finance: 0, audit: 0 } },
  { permission: "配额调整", grants: { super: 1, ops: 1, support: 0, finance: 0, audit: 0 } },
  { permission: "Provider / 模型配置", grants: { super: 1, ops: 0, support: 0, finance: 0, audit: 0 } },
  { permission: "查看审计日志", grants: { super: 1, ops: 0, support: 0, finance: 0, audit: 1 } },
  { permission: "计费管理", grants: { super: 1, ops: 0, support: 0, finance: 1, audit: 0 } },
  { permission: "角色与权限管理", grants: { super: 1, ops: 0, support: 0, finance: 0, audit: 0 } },
];

/* ---- Operational queues (prototype QUEUES) ---- */
export const QUEUES: OpsQueueItem[] = [
  { key: "risk", icon: "🛡️", tone: "danger", title: "异常登录 / 风险", sub: "待研判", count: 14, rows: [{ title: "Diego Vega", detail: "异地瞬移 · 中国→巴西 8 分钟", meta: "2m" }, { title: "Acme Robotics", detail: "12 次 MFA 失败", meta: "19m" }, { title: "Omar Hassan", detail: "新设备 · 管理员", meta: "1h" }] },
  { key: "tickets", icon: "🎫", tone: "info", title: "未处理工单", sub: "最久 3 天", count: 37, rows: [{ title: "#4821 Billing", detail: "团队版重复扣费", meta: "3d" }, { title: "#4830 AI", detail: "Opus 请求 500 报错", meta: "6h" }, { title: "#4835 Access", detail: "无法转移所有权", meta: "2h" }] },
  { key: "dunning", icon: "💳", tone: "warning", title: "付款失败 · 催款", sub: "Dunning", count: 9, rows: [{ title: "Quantum Health", detail: "扣款失败 · $1,440", meta: "1d" }, { title: "Cedar & Co", detail: "第 3 次重试 · 团队 x24", meta: "4h" }] },
  { key: "overage", icon: "📈", tone: "warning", title: "超额组织", sub: "Token / 席位", count: 6, rows: [{ title: "Acme Robotics", detail: "Token 用量 218%", meta: "live" }, { title: "Helio Energy", detail: "席位 52 / 40", meta: "live" }] },
  { key: "highcost", icon: "🔥", tone: "danger", title: "高成本用户", sub: "30 天 LLM 花费", count: 11, rows: [{ title: "Diego Vega", detail: "$412 · 重度 Opus", meta: "$412" }, { title: "Mei Lin", detail: "$268 · 批处理", meta: "$268" }] },
  { key: "dormant", icon: "🌙", tone: "muted", title: "沉睡管理员", sub: "60 天+ 未登录", count: 4, rows: [{ title: "Sara Kim", detail: "管理员 · 74 天前", meta: "74d" }, { title: "Theo Mraz", detail: "安全 · 91 天前", meta: "91d" }] },
];

/* ---- KPI cards (prototype injectSparks series + overview KPIs) ---- */
export const KPIS: KpiCard[] = [
  { key: "users", label: "活跃用户", value: "9,204", spark: [12, 18, 15, 22, 19, 26, 24, 30], positive: false },
  { key: "mrr", label: "月度经常性收入", value: "$48.2K", spark: [8, 9, 7, 12, 11, 14, 13, 18], positive: false },
  { key: "tokens", label: "本月 Token", value: "396M", spark: [14, 16, 15, 20, 22, 21, 26, 28], positive: false },
  { key: "health", label: "系统健康度", value: "99.8%", spark: [29, 24, 21, 18, 16, 13, 12, 10], positive: true },
];

/* ---- Orgs (prototype ORGS) ---- */
export const ORGS: OrgRow[] = [
  { name: "Acme Robotics", short: "AR", plan: "Team", seatsUsed: 52, seatsCap: 40, cost: "$8,420", status: "overage", owner: "Aki Chen", color: "#6aa6ff", created: "2025-03-14", requests: "482k", tokens: "41.2M" },
  { name: "Quantum Health", short: "QH", plan: "Enterprise", seatsUsed: 47, seatsCap: 50, cost: "$12,640", status: "dunning", owner: "Priya Patel", color: "#c08ce0", created: "2025-01-09", requests: "712k", tokens: "68.0M" },
  { name: "Helio Energy", short: "HE", plan: "Team", seatsUsed: 52, seatsCap: 40, cost: "$9,210", status: "overage", owner: "Omar Hassan", color: "#f0a868", created: "2025-05-22", requests: "531k", tokens: "49.8M" },
  { name: "Northwind Labs", short: "NL", plan: "Team", seatsUsed: 22, seatsCap: 25, cost: "$3,120", status: "active", owner: "Marco Rossi", color: "#5ec8a8", created: "2025-06-30", requests: "198k", tokens: "18.9M" },
  { name: "Cedar & Co", short: "CC", plan: "Team", seatsUsed: 31, seatsCap: 35, cost: "$4,870", status: "active", owner: "Nina Diaz", color: "#e08aa8", created: "2025-02-18", requests: "288k", tokens: "27.7M" },
  { name: "Pixel Forge", short: "PF", plan: "Pro", seatsUsed: 14, seatsCap: 20, cost: "$1,980", status: "active", owner: "Tom Murphy", color: "#7bb8d8", created: "2025-08-12", requests: "121k", tokens: "11.4M" },
  { name: "Meridian Studio", short: "MS", plan: "Pro", seatsUsed: 9, seatsCap: 15, cost: "$420", status: "active", owner: "Elsa Sokol", color: "#8fbf6a", created: "2025-09-03", requests: "34k", tokens: "3.1M" },
];

/* ---- Billing (prototype BILLING + derived metrics) ---- */
export const BILLING_METRICS: BillingMetrics = {
  mrr: "$48.2K",
  activeOrgs: 7,
  failedPayments: 1,
  arpu: "$6.9K",
};

export const PLAN_DISTRIBUTION: PlanShare[] = [
  { plan: "Free", share: 58 },
  { plan: "Pro", share: 24 },
  { plan: "Team", share: 14 },
  { plan: "Enterprise", share: 4 },
];

export const BILLING: TxnRow[] = [
  { org: "Acme Robotics", plan: "Enterprise", amount: "$8,420", status: "已付", date: "05-28" },
  { org: "Quantum Health", plan: "Enterprise", amount: "$12,640", status: "失败", date: "05-27" },
  { org: "Northwind Labs", plan: "Team", amount: "$1,176", status: "已付", date: "05-27" },
  { org: "Cedar & Co", plan: "Team", amount: "$1,176", status: "重试中", date: "05-26" },
  { org: "Pixel Forge", plan: "Pro", amount: "$266", status: "已付", date: "05-25" },
  { org: "Helio Energy", plan: "Team", amount: "$1,470", status: "已付", date: "05-25" },
];

/* ---- Settings (prototype settings toggles) ---- */
export const SETTINGS: AdminSettings = {
  orgName: "XAI",
  supportEmail: "support@xai.app",
  toggles: [
    { key: "mfa-required", label: "强制管理员 MFA", description: "所有管理员必须启用两步验证", enabled: true },
    { key: "audit-export", label: "审计日志导出", description: "允许财务/审计角色导出日志", enabled: true },
    { key: "ip-allowlist", label: "IP 白名单", description: "仅允许列表内 IP 访问中台", enabled: false },
    { key: "webhook-alerts", label: "Webhook 告警", description: "高危操作推送到运维 Webhook", enabled: true },
  ],
};
