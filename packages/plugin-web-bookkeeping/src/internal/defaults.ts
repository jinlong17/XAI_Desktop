import type {
  AccountTypeMeta,
  BookkeepingAccount,
  BookkeepingCategory,
  BookkeepingInvestment,
  BookkeepingLedger,
  BookkeepingPrefs,
  BookkeepingRecurringRule,
  BookkeepingState,
  BookkeepingTransaction,
  CurrencyMeta,
} from "../types.js";

export const BOOKKEEPING_STATE_KEY = "xai_bk_state_v2";
export const BOOKKEEPING_DASH_ORDER_KEY = "xai_bk_dash_order";
export const BOOKKEEPING_DASH_SPLIT_KEY = "xai_bk_dash_split";
export const BOOKKEEPING_VIEW_KEY = "xai_bk_view";
export const BOOKKEEPING_CALENDAR_MODE_KEY = "xai_bk_calendar_mode";
export const BOOKKEEPING_STORAGE_EVENT = "xai:bookkeeping-storage";

export const DEFAULT_PREFS: BookkeepingPrefs = {
  dashboardOrder: "bills-first",
  dashboardSplit: 44,
  billsView: "detail",
  calendarMode: "month",
};

export const CURRENCIES: readonly CurrencyMeta[] = [
  { code: "CNY", symbol: "¥", name: "人民币", en: "Chinese Yuan", rate: 1 },
  { code: "USD", symbol: "$", name: "美元", en: "US Dollar", rate: 7.15 },
  { code: "EUR", symbol: "€", name: "欧元", en: "Euro", rate: 7.75 },
  { code: "GBP", symbol: "£", name: "英镑", en: "Pound", rate: 9.05 },
  { code: "JPY", symbol: "¥", name: "日元", en: "Yen", rate: 0.048 },
  { code: "HKD", symbol: "HK$", name: "港币", en: "HK Dollar", rate: 0.915 },
  { code: "KRW", symbol: "₩", name: "韩元", en: "Won", rate: 0.0053 },
  { code: "SGD", symbol: "S$", name: "新加坡元", en: "SG Dollar", rate: 5.3 },
  { code: "AUD", symbol: "A$", name: "澳元", en: "AU Dollar", rate: 4.7 },
  { code: "CAD", symbol: "C$", name: "加元", en: "CA Dollar", rate: 5.2 },
];

export const ACCOUNT_TYPES: readonly AccountTypeMeta[] = [
  { id: "cash", zh: "现金", en: "Cash", icon: "coin", hue: 70 },
  { id: "bank", zh: "银行卡", en: "Bank Card", icon: "bank", hue: 25 },
  { id: "credit", zh: "信用卡", en: "Credit", icon: "card", hue: 290 },
  { id: "alipay", zh: "支付宝", en: "Alipay", icon: "money", hue: 220 },
  { id: "wechat", zh: "微信", en: "WeChat", icon: "chat", hue: 150 },
  { id: "paypal", zh: "PayPal", en: "PayPal", icon: "creditcard", hue: 235 },
  { id: "invest", zh: "投资账户", en: "Investment", icon: "trendUp", hue: 195 },
  { id: "other", zh: "其他", en: "Other", icon: "wallet", hue: 330 },
];

const ledgers: readonly BookkeepingLedger[] = [
  {
    id: "daily",
    name: "日常账本",
    en: "Daily",
    icon: "wallet",
    hue: 150,
    currency: "CNY",
    defaultAccount: "wx",
    private: false,
    reimburse: false,
    desc: "日常收支记录",
  },
  {
    id: "us",
    name: "美国消费",
    en: "US Spending",
    icon: "globe",
    hue: 235,
    currency: "USD",
    defaultAccount: "paypal",
    private: false,
    reimburse: false,
    desc: "出差与海淘",
  },
  {
    id: "trip",
    name: "旅行账本",
    en: "Travel",
    icon: "plane",
    hue: 25,
    currency: "CNY",
    defaultAccount: "ali",
    private: false,
    reimburse: false,
    desc: "",
  },
  {
    id: "work",
    name: "工作报销",
    en: "Reimburse",
    icon: "briefcase",
    hue: 290,
    currency: "CNY",
    defaultAccount: "cmb",
    private: false,
    reimburse: true,
    desc: "可报销账单",
  },
];

const expense: readonly BookkeepingCategory[] = [
  { id: "food", kind: "expense", name: "餐饮", en: "Food", icon: "utensils", hue: 25, budget: 1700, order: 0, subs: ["早餐", "午餐", "晚餐", "夜宵"], notes: ["买菜", "咖啡", "外卖", "聚餐", "下午茶"] },
  { id: "daily2", kind: "expense", name: "日常消费", en: "Daily", icon: "cart", hue: 70, budget: 600, order: 1, subs: ["便利店", "日杂"], notes: ["纸巾", "电池"] },
  { id: "trans", kind: "expense", name: "交通", en: "Transport", icon: "bus", hue: 245, budget: 300, order: 2, subs: ["地铁", "公交", "打车"], notes: ["加油", "停车", "高铁", "机票"] },
  { id: "stay", kind: "expense", name: "住宿", en: "Lodging", icon: "bed", hue: 200, budget: 0, order: 3, subs: ["酒店", "民宿"], notes: ["房费"] },
  { id: "ticket", kind: "expense", name: "门票", en: "Tickets", icon: "ticket", hue: 320, budget: 0, order: 4, subs: [], notes: ["景点", "展览"] },
  { id: "comm", kind: "expense", name: "通信", en: "Comms", icon: "phonecall", hue: 210, budget: 100, order: 5, subs: ["话费", "流量"], notes: ["宽带", "会员"] },
  { id: "shop", kind: "expense", name: "购物", en: "Shopping", icon: "bag", hue: 330, budget: 900, order: 6, subs: ["日用", "数码", "家居"], notes: ["超市", "网购"] },
  { id: "util", kind: "expense", name: "水电", en: "Utilities", icon: "droplet", hue: 195, budget: 300, order: 7, subs: ["水费", "电费", "燃气"], notes: ["物业"] },
  { id: "fun", kind: "expense", name: "娱乐", en: "Fun", icon: "gamepad", hue: 290, budget: 500, order: 8, subs: ["电影", "游戏", "演出"], notes: ["KTV", "酒吧"] },
  { id: "med", kind: "expense", name: "医疗", en: "Medical", icon: "pill", hue: 0, budget: 400, order: 9, subs: ["门诊", "药品", "体检"], notes: ["挂号"] },
  { id: "treat", kind: "expense", name: "招待", en: "Hosting", icon: "wine", hue: 350, budget: 0, order: 10, subs: [], notes: ["请客", "商务宴请"] },
  { id: "gift", kind: "expense", name: "礼品", en: "Gifts", icon: "gift", hue: 340, budget: 0, order: 11, subs: [], notes: ["生日礼", "伴手礼"] },
  { id: "edu", kind: "expense", name: "教育", en: "Education", icon: "graduation", hue: 230, budget: 400, order: 12, subs: ["课程", "书籍"], notes: ["培训", "考试"] },
  { id: "invest", kind: "expense", name: "投资", en: "Investing", icon: "trendUp", hue: 160, budget: 0, order: 13, subs: ["定投", "保险"], notes: ["基金", "股票"] },
  { id: "home", kind: "expense", name: "居家", en: "Home", icon: "home", hue: 150, budget: 3000, order: 14, subs: ["房租", "房贷"], notes: ["维修", "家具"] },
  { id: "love", kind: "expense", name: "爱情", en: "Romance", icon: "heart", hue: 355, budget: 0, order: 15, subs: [], notes: ["约会", "纪念日"] },
  { id: "cloth", kind: "expense", name: "衣物", en: "Apparel", icon: "tag", hue: 310, budget: 300, order: 16, subs: ["上衣", "鞋包"], notes: ["美妆"] },
  { id: "social", kind: "expense", name: "人情", en: "Social", icon: "smile", hue: 40, budget: 0, order: 17, subs: [], notes: ["随礼", "红包"] },
  { id: "travel", kind: "expense", name: "旅游", en: "Travel", icon: "suitcase", hue: 185, budget: 0, order: 18, subs: [], notes: ["跟团", "自由行"] },
];

const income: readonly BookkeepingCategory[] = [
  { id: "salary", kind: "income", name: "工资", en: "Salary", icon: "wallet", hue: 150, budget: 0, order: 0, subs: ["月薪", "绩效"], notes: ["底薪", "提成"] },
  { id: "invinc", kind: "income", name: "投资", en: "Investing", icon: "trendUp", hue: 195, budget: 0, order: 1, subs: ["分红", "卖出"], notes: ["利息", "理财"] },
  { id: "bonus", kind: "income", name: "奖金", en: "Bonus", icon: "coin", hue: 70, budget: 0, order: 2, subs: ["年终", "项目"], notes: ["全勤"] },
  { id: "welfare", kind: "income", name: "福利", en: "Welfare", icon: "gift", hue: 290, budget: 0, order: 3, subs: [], notes: ["补贴", "报销"] },
  { id: "redpkt", kind: "income", name: "红包", en: "Red Packet", icon: "smile", hue: 0, budget: 0, order: 4, subs: [], notes: ["人情", "返现"] },
  { id: "other", kind: "income", name: "其他收入", en: "Other", icon: "money", hue: 245, budget: 0, order: 5, subs: [], notes: ["二手", "退款"] },
];

const transfer: readonly BookkeepingCategory[] = [
  { id: "tf_move", kind: "transfer", name: "账户互转", en: "Move", icon: "swap", hue: 220, budget: 0, order: 0, subs: [], notes: [] },
  { id: "tf_repay", kind: "transfer", name: "信用卡还款", en: "Repay", icon: "card", hue: 290, budget: 0, order: 1, subs: [], notes: ["全额", "最低"] },
  { id: "tf_save", kind: "transfer", name: "存钱", en: "Savings", icon: "bank", hue: 150, budget: 0, order: 2, subs: [], notes: [] },
  { id: "tf_draw", kind: "transfer", name: "取现", en: "Withdraw", icon: "coin", hue: 70, budget: 0, order: 3, subs: [], notes: [] },
];

const prepay: readonly BookkeepingCategory[] = [
  { id: "pp_sub", kind: "prepay", name: "自动续费", en: "Subscription", icon: "repeat", hue: 262, budget: 0, order: 0, subs: [], notes: ["视频会员", "音乐", "云存储", "软件"] },
  { id: "pp_bill", kind: "prepay", name: "周期账单", en: "Recurring Bill", icon: "calendar", hue: 200, budget: 0, order: 1, subs: [], notes: ["房租", "宽带", "保险"] },
  { id: "pp_pre", kind: "prepay", name: "预付款", en: "Prepaid", icon: "wallet", hue: 25, budget: 0, order: 2, subs: [], notes: ["健身卡", "美容卡", "话费充值"] },
  { id: "pp_loan", kind: "prepay", name: "定期扣费", en: "Auto Debit", icon: "clock", hue: 330, budget: 0, order: 3, subs: [], notes: ["分期", "贷款"] },
];

const accounts: readonly BookkeepingAccount[] = [
  { id: "wx", name: "微信钱包", en: "WeChat", type: "wechat", currency: "CNY", initial: 3000, balance: 3280, isDefault: true, icon: "chat", hue: 150 },
  { id: "ali", name: "支付宝", en: "Alipay", type: "alipay", currency: "CNY", initial: 5000, balance: 5120, isDefault: false, icon: "money", hue: 220 },
  { id: "cmb", name: "招商银行", en: "CMB", type: "bank", currency: "CNY", initial: 50000, balance: 48600, isDefault: false, icon: "bank", hue: 25 },
  { id: "cash", name: "现金", en: "Cash", type: "cash", currency: "CNY", initial: 1000, balance: 850, isDefault: false, icon: "coin", hue: 70 },
  { id: "cc", name: "信用卡", en: "Credit", type: "credit", currency: "CNY", initial: 0, balance: -2340, isDefault: false, icon: "card", hue: 290, limit: 30000, billDay: 5, repayDay: 23 },
  { id: "paypal", name: "PayPal", en: "PayPal", type: "paypal", currency: "USD", initial: 600, balance: 642, isDefault: false, icon: "creditcard", hue: 235 },
];

const tx: readonly BookkeepingTransaction[] = [
  { id: "t1", ledger: "daily", type: "expense", cat: "food", sub: "午餐", amount: 23, currency: "CNY", account: "wx", date: "2026-06-01", time: "12:20", note: "麦当劳", tags: [], reimburse: false, private: false, merchant: "麦当劳", location: "" },
  { id: "t2", ledger: "daily", type: "expense", cat: "trans", sub: "地铁", amount: 6, currency: "CNY", account: "cash", date: "2026-06-01", time: "08:35", note: "通勤", tags: [], reimburse: false, private: false, merchant: "", location: "" },
  { id: "t3", ledger: "daily", type: "expense", cat: "shop", sub: "日用", amount: 99, currency: "CNY", account: "ali", date: "2026-06-01", time: "19:10", note: "日用补货", tags: ["必需"], reimburse: false, private: false, merchant: "永辉超市", location: "" },
  { id: "t4", ledger: "daily", type: "income", cat: "salary", sub: "月薪", amount: 12000, currency: "CNY", account: "cmb", date: "2026-05-31", time: "10:00", note: "5 月工资", tags: [], reimburse: false, private: false, merchant: "", location: "" },
  { id: "t5", ledger: "daily", type: "expense", cat: "food", sub: "晚餐", amount: 188, currency: "CNY", account: "ali", date: "2026-05-31", time: "19:40", note: "和朋友火锅", tags: ["聚会"], reimburse: false, private: false, merchant: "海底捞", location: "" },
  { id: "t6", ledger: "daily", type: "expense", cat: "fun", sub: "电影", amount: 86, currency: "CNY", account: "wx", date: "2026-05-31", time: "21:00", note: "电影票 x2", tags: [], reimburse: false, private: false, merchant: "万达影城", location: "" },
  { id: "t7", ledger: "daily", type: "expense", cat: "shop", sub: "数码", amount: 520, currency: "CNY", account: "cc", date: "2026-05-30", time: "15:30", note: "机械键盘", tags: [], reimburse: false, private: false, merchant: "京东", location: "" },
  { id: "t8", ledger: "daily", type: "expense", cat: "food", sub: "午餐", amount: 28, currency: "CNY", account: "wx", date: "2026-05-30", time: "12:10", note: "楼下面馆", tags: [], reimburse: false, private: false, merchant: "", location: "" },
  { id: "t9", ledger: "daily", type: "expense", cat: "cloth", sub: "上衣", amount: 132, currency: "CNY", account: "ali", date: "2026-05-29", time: "16:00", note: "优衣库 T 恤", tags: [], reimburse: false, private: false, merchant: "优衣库", location: "" },
  { id: "t10", ledger: "daily", type: "expense", cat: "med", sub: "药品", amount: 89, currency: "CNY", account: "wx", date: "2026-05-29", time: "10:20", note: "维生素", tags: [], reimburse: false, private: false, merchant: "", location: "" },
  { id: "t11", ledger: "daily", type: "expense", cat: "home", sub: "房租", amount: 2600, currency: "CNY", account: "cmb", date: "2026-05-28", time: "09:00", note: "6 月房租", tags: ["固定"], reimburse: false, private: false, merchant: "", location: "" },
  { id: "t12", ledger: "daily", type: "transfer", cat: "tf_repay", sub: "", amount: 2000, currency: "CNY", account: "cmb", toAccount: "cc", date: "2026-05-28", time: "09:30", note: "信用卡还款", tags: [], reimburse: false, private: false, merchant: "", location: "" },
  { id: "t13", ledger: "daily", type: "income", cat: "other", sub: "退款", amount: 631, currency: "CNY", account: "ali", date: "2026-05-27", time: "14:00", note: "订单退款", tags: [], reimburse: false, private: false, merchant: "", location: "" },
  { id: "t14", ledger: "daily", type: "expense", cat: "food", sub: "早餐", amount: 32, currency: "CNY", account: "wx", date: "2026-05-27", time: "08:50", note: "星巴克", tags: [], reimburse: false, private: false, merchant: "星巴克", location: "" },
  { id: "t15", ledger: "daily", type: "prepay", cat: "pp_sub", sub: "", amount: 25, currency: "CNY", account: "ali", date: "2026-05-26", time: "00:00", note: "视频会员", tags: [], reimburse: false, private: false, recurring: true, merchant: "", location: "" },
  { id: "t16", ledger: "us", type: "expense", cat: "food", sub: "午餐", amount: 18.5, currency: "USD", account: "paypal", date: "2026-05-30", time: "13:00", note: "Chipotle", tags: [], reimburse: false, private: false, merchant: "Chipotle", location: "NYC" },
  { id: "t17", ledger: "us", type: "expense", cat: "trans", sub: "打车", amount: 24, currency: "USD", account: "paypal", date: "2026-05-30", time: "20:00", note: "Uber", tags: [], reimburse: false, private: false, merchant: "Uber", location: "" },
  { id: "t18", ledger: "work", type: "expense", cat: "trans", sub: "打车", amount: 56, currency: "CNY", account: "cmb", date: "2026-05-29", time: "21:30", note: "加班打车", tags: [], reimburse: true, private: false, merchant: "滴滴", location: "" },
];

const recurring: readonly BookkeepingRecurringRule[] = [
  { id: "r1", ledger: "daily", type: "expense", cat: "home", amount: 2600, currency: "CNY", account: "cmb", note: "房租", freq: "monthly", day: 1, nextDate: "2026-07-01", active: true },
  { id: "r2", ledger: "daily", type: "prepay", cat: "pp_sub", amount: 25, currency: "CNY", account: "ali", note: "视频会员", freq: "monthly", day: 8, nextDate: "2026-06-08", active: true },
  { id: "r3", ledger: "daily", type: "income", cat: "salary", amount: 12000, currency: "CNY", account: "cmb", note: "工资", freq: "monthly", day: 31, nextDate: "2026-06-30", active: true },
  { id: "r4", ledger: "daily", type: "expense", cat: "invest", amount: 300, currency: "CNY", account: "cmb", note: "基金定投", freq: "monthly", day: 15, nextDate: "2026-06-15", active: false },
];

const invest: readonly BookkeepingInvestment[] = [
  { id: "i1", name: "贵州茅台", code: "600519", type: "stock", shares: 10, cost: 1620, price: 1685.5, account: "cmb" },
  { id: "i2", name: "宁德时代", code: "300750", type: "stock", shares: 100, cost: 198, price: 213.8, account: "cmb" },
  { id: "i3", name: "纳斯达克ETF", code: "513100", type: "fund", shares: 5000, cost: 1.42, price: 1.586, account: "ali" },
  { id: "i4", name: "沪深300指数", code: "000300", type: "fund", shares: 8000, cost: 1.18, price: 1.124, account: "ali" },
];

export function createSeedBookkeepingState(now = new Date()): BookkeepingState {
  return {
    version: 2,
    activeLedger: "daily",
    ledgers,
    expense,
    income,
    transfer,
    prepay,
    accounts,
    tx,
    recurring,
    invest,
    budgetTotal: 5000,
    prefs: DEFAULT_PREFS,
    updatedAt: now.toISOString(),
  };
}
