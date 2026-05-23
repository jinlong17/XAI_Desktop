/* ============================================================
   Board data — workspaces, boards, templates, labels
   Loaded before module-board.jsx
   ============================================================ */

// Labels used by the Project Management template (extend boardLabels)
window.PM_LABELS = [
  { id:"pm-forms",    name:{en:"Forms",    zh:"表单"},   color:"oklch(60% 0.16 295)" },
  { id:"pm-accounts", name:{en:"Accounts", zh:"账户"},   color:"oklch(60% 0.12 155)" },
  { id:"pm-feedback", name:{en:"Feedback", zh:"反馈"},   color:"oklch(70% 0.16 85)" },
  { id:"pm-billing",  name:{en:"Billing",  zh:"账单"},   color:"oklch(60% 0.16 25)" },
  { id:"pm-research", name:{en:"Research", zh:"调研"},   color:"oklch(60% 0.12 245)" },
];

// Default workspaces
window.DEFAULT_WORKSPACES = [
  { id:"ws-personal", name:{en:"Personal", zh:"个人"}, color:"oklch(60% 0.10 165)" },
  { id:"ws-team",     name:{en:"Team Workspace", zh:"团队空间"}, color:"oklch(60% 0.14 295)" },
];

// Build default boards
window.makeDefaultBoards = function(){
  return [
    {
      id: "b-default",
      workspaceId: "ws-personal",
      name: { en:"My Project Board", zh:"我的项目板" },
      cover: "linear-gradient(135deg, oklch(72% 0.12 295), oklch(78% 0.10 25))",
      template: "kanban",
      lists: window.MOCK.boardLists,
    },
    {
      id: "b-pm",
      workspaceId: "ws-team",
      name: { en:"Project Management", zh:"项目管理" },
      cover: "linear-gradient(135deg, oklch(58% 0.14 245), oklch(38% 0.10 250))",
      template: "pm",
      lists: window.PM_LISTS_INITIAL,
    },
    {
      id: "b-marketing",
      workspaceId: "ws-team",
      name: { en:"Q3 Marketing Launch", zh:"Q3 市场启动" },
      cover: "linear-gradient(135deg, oklch(70% 0.15 60), oklch(62% 0.16 35))",
      template: "kanban",
      lists: [
        { id:"ml-ideas",   key:null, customName:{en:"Ideas",zh:"创意"},     color:"yellow", cards:[
          { id:"mk1", title:{en:"Influencer outreach plan", zh:"达人合作方案"}, labels:["pm-research"] },
        ]},
        { id:"ml-prog",    key:null, customName:{en:"In Progress",zh:"进行中"}, color:"blue", cards:[
          { id:"mk2", title:{en:"Landing page hero refresh", zh:"落地页 hero 翻新"}, labels:["pm-forms"], checklist:{done:1,total:3} },
        ]},
        { id:"ml-launch",  key:null, customName:{en:"Launch",zh:"上线"},      color:"green", cards:[] },
      ],
    },
  ];
};

// PM template lists (with cards illustrating the template style)
window.PM_LISTS_INITIAL = [
  {
    id: "pm-todo", key: null, customName:{en:"To Do", zh:"待办"}, color:"gray",
    cards: [
      { id:"pmc1", title:{en:"Quick booking for accommodations — website", zh:"住宿快速预订 — 网站"}, labels:["pm-forms"],    members:["u1"], checklist:{done:0,total:3} },
      { id:"pmc2", title:{en:"Adapt web app to new payments provider",     zh:"适配新支付服务商"},     labels:["pm-forms"],    members:["u2"], checklist:{done:0,total:2} },
      { id:"pmc3", title:{en:"Fluid booking on tablets",                    zh:"平板端流畅预订"},       labels:["pm-feedback"], members:["u3"] },
      { id:"pmc4", title:{en:"Multi-dest search UI web",                    zh:"多目的地搜索 UI"},      labels:["pm-accounts"], members:["u1"] },
    ],
  },
  {
    id: "pm-prog", key: null, customName:{en:"In Progress", zh:"进行中"}, color:"blue",
    cards: [
      { id:"pmc5", title:{en:"BugFix BG Web-store app crashing",       zh:"修复 BG 网店应用崩溃"},  labels:["pm-forms"],    members:["u2"], checklist:{done:2,total:5}, due:"5/26" },
      { id:"pmc6", title:{en:"High outage: Software bug fix — BG store", zh:"高严重故障：修复 BG 商店"}, labels:["pm-billing"],  members:["u3"], checklist:{done:1,total:4}, due:"Today", dueEn:"Today" },
      { id:"pmc7", title:{en:"Web-store purchasing performance issue",  zh:"网店购买性能问题"},      labels:["pm-forms"],    members:["u1","u2"] },
    ],
  },
  {
    id: "pm-review", key: null, customName:{en:"In Review", zh:"审核中"}, color:"yellow",
    cards: [
      { id:"pmc8", title:{en:"Customers reporting shopping cart issues",   zh:"客户反馈购物车问题"},   labels:["pm-accounts"], members:["u2"], checklist:{done:4,total:6} },
      { id:"pmc9", title:{en:"Planet Taxi Device exploration & research",  zh:"出租车设备探索与调研"}, labels:["pm-feedback"], members:["u3"] },
    ],
  },
  {
    id: "pm-blocked", key: null, customName:{en:"Blocked", zh:"阻塞"}, color:"red",
    cards: [
      { id:"pmc10", title:{en:"Vendor approval pending",              zh:"供应商审批待定"},    labels:["pm-billing"], members:["u1"], dueLate:true, due:"5/19", dueEn:"Overdue" },
    ],
  },
  {
    id: "pm-done", key: null, customName:{en:"Done", zh:"已完成"}, color:"green",
    cards: [
      { id:"pmc11", title:{en:"Quick payment",   zh:"快速支付"},   labels:["pm-feedback"], members:["u3"], checklist:{done:3,total:3} },
      { id:"pmc12", title:{en:"Fast trip search",zh:"快速行程搜索"}, labels:["pm-accounts"], members:["u1"], checklist:{done:5,total:5} },
    ],
  },
];

// Built-in templates exposed to the "Create board" picker
window.BOARD_TEMPLATES = [
  {
    id: "kanban",
    name: { en:"Basic Kanban",         zh:"基础看板" },
    desc: { en:"Backlog · Today · Week · Later · Done.", zh:"待办池 / 今天 / 本周 / 以后 / 已完成。" },
    cover: "linear-gradient(135deg, oklch(72% 0.10 165), oklch(60% 0.10 165))",
    lists: () => [
      { id:"k-b", key:"backlog", cards:[] },
      { id:"k-t", key:"today",   cards:[] },
      { id:"k-w", key:"week",    cards:[] },
      { id:"k-l", key:"later",   cards:[] },
      { id:"k-d", key:"done",    cards:[] },
    ],
  },
  {
    id: "pm",
    name: { en:"Project Management for Teams", zh:"团队项目管理" },
    desc: { en:"5-stage workflow with status overview & color-coded labels.", zh:"5 阶段流程，含状态总览与彩色标签。" },
    cover: "linear-gradient(135deg, oklch(58% 0.14 245), oklch(38% 0.10 250))",
    lists: () => JSON.parse(JSON.stringify(window.PM_LISTS_INITIAL.map(l => ({ ...l, id: l.id + "-" + Date.now() + Math.random().toString(36).slice(2,6), cards: [] })))),
  },
  {
    id: "blank",
    name: { en:"Blank Board", zh:"空白看板" },
    desc: { en:"Start with no columns. Add what you need.", zh:"从零开始，按需添加列。" },
    cover: "linear-gradient(135deg, oklch(85% 0.02 220), oklch(70% 0.02 220))",
    lists: () => [],
  },
];
