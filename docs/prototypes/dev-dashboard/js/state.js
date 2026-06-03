const dashboardState = window.XAI_DASHBOARD_STATE || {};
const products = [...(dashboardState.product_lines || [])].sort((a,b) => Number(a.order) - Number(b.order));
const productModules = products;
const overviewRows = dashboardState.status_rows || [];
const cockpit = dashboardState.cockpit || [];
const kpis = dashboardState.signals || dashboardState.kpis || [];
const overviewModules = products.length ? products : (dashboardState.overview_modules || []);
const syncStatus = dashboardState.sync_status || {};
const deploymentState = dashboardState.deployment || {summary:{}, modules:[], records:[]};
const testingState = dashboardState.testing || {summary:{}, modules:[], records:[], pipelines:[], report_sources:[]};
const devData = dashboardState.development_data || {};
const productLinks = dashboardState.product_links || [
  ["web", "app", "main"],
  ["app", "plugin", "main"],
  ["web", "sync", "soft"],
  ["app", "sync", "soft"],
  ["plugin", "sync", "soft"],
  ["sync", "site", "main"],
  ["sync", "admin", "control"]
];
const OVERVIEW_FLOW_VIEWBOX = {width:1000, height:360};
const OVERVIEW_FLOW_STORAGE_KEY = "xai-dev-dashboard.overviewFlowView.v1";
const FLOW_VIEW_OPTIONS = [
  {key:"topology", label:"架构拓扑", title:"Option A · 产品架构拓扑图", description:"突出模块依赖关系，官网和 Web、桌面和插件分别汇入账号云同步，再进入 Admin Dashboard。"},
  {key:"layers", label:"能力分层", title:"Option B · 三层产品能力图", description:"按用户入口层、核心能力层、运营管理层展示，适合看产品能力边界和层级。"},
  {key:"metro", label:"地铁线路", title:"Option C · 地铁线路图风格", description:"按 Web Line、Desktop Line、Admin Line 展示不同产品线，强调多条工作流汇入同步层。"},
  {key:"radial", label:"中心辐射", title:"Option D · 中心辐射监控图", description:"以账号云同步为中心展示所有核心模块，适合做控制台式健康监控入口。"}
];
const FLOW_VIEW_CONFIG = {
  topology:{
    mode:"smooth",
    nodeOrder:["site","web","app","plugin","sync","admin"],
    positions:{
      site:{x:150,y:88}, web:{x:430,y:88}, app:{x:150,y:258},
      plugin:{x:430,y:258}, sync:{x:705,y:174}, admin:{x:870,y:292}
    },
    edges:[
      {from:"site", to:"web", tone:"yellow"},
      {from:"web", to:"sync", tone:"blue"},
      {from:"app", to:"plugin", tone:"green"},
      {from:"plugin", to:"sync", tone:"purple"},
      {from:"sync", to:"admin", tone:"cyan"}
    ],
    extras:[
      {type:"label", text:"用户入口", x:0, y:0},
      {type:"label", text:"桌面能力", x:0, y:328},
      {type:"label", text:"同步 / 控制面", x:470, y:328}
    ]
  },
  layers:{
    mode:"orthogonal",
    nodeOrder:["site","web","app","sync","plugin","admin"],
    positions:{
      site:{x:160,y:78}, web:{x:500,y:78}, app:{x:840,y:78},
      sync:{x:330,y:185}, plugin:{x:670,y:185}, admin:{x:500,y:304}
    },
    edges:[
      {from:"site", to:"web", tone:"yellow"},
      {from:"web", to:"sync", tone:"blue"},
      {from:"app", to:"sync", tone:"green"},
      {from:"app", to:"plugin", tone:"green"},
      {from:"plugin", to:"sync", tone:"purple"},
      {from:"sync", to:"admin", tone:"red"}
    ],
    extras:[
      {type:"band", title:"用户入口层", text:"官网 / Web / Desktop", y:42},
      {type:"band", title:"核心能力层", text:"云同步 / 插件能力", y:138},
      {type:"band", title:"运营管理层", text:"Admin Dashboard", y:258}
    ]
  },
  metro:{
    mode:"polyline",
    nodeOrder:["site","web","app","plugin","sync","admin"],
    positions:{
      site:{x:150,y:90}, web:{x:430,y:90}, app:{x:150,y:255},
      plugin:{x:430,y:255}, sync:{x:620,y:172}, admin:{x:875,y:172}
    },
    edges:[
      {from:"site", to:"web", tone:"webline"},
      {from:"web", to:"sync", tone:"webline", via:[{x:535,y:90}]},
      {from:"app", to:"plugin", tone:"desktopline"},
      {from:"plugin", to:"sync", tone:"desktopline", via:[{x:535,y:255}]},
      {from:"admin", to:"sync", tone:"adminline"}
    ],
    extras:[
      {type:"line", text:"Web Line", x:-8, y:0, tone:"webline"},
      {type:"line", text:"Desktop Line", x:-8, y:318, tone:"desktopline"},
      {type:"line", text:"Admin Line", x:-8, y:152, tone:"adminline"}
    ]
  },
  radial:{
    mode:"straight",
    nodeOrder:["sync","web","site","app","plugin","admin"],
    positions:{
      sync:{x:500,y:180}, web:{x:500,y:54}, site:{x:160,y:112},
      app:{x:500,y:304}, plugin:{x:160,y:248}, admin:{x:840,y:180}
    },
    edges:[
      {from:"sync", to:"web", tone:"blue"},
      {from:"sync", to:"site", tone:"yellow"},
      {from:"sync", to:"app", tone:"green"},
      {from:"sync", to:"plugin", tone:"purple"},
      {from:"sync", to:"admin", tone:"red"}
    ],
    extras:[
      {type:"ring", x:500, y:180},
      {type:"label", text:"账号云同步作为中心能力", x:592, y:322}
    ]
  }
};
const branchWorkflow = dashboardState.branch_workflow || [
  ["idea", "需求进入", "brief / roadmap", "先归类产品线和风险。"],
  ["feature", "短功能分支", "codex/<area>/<feature>", "一个功能一个短分支。"],
  ["web", "Web 主线", "web", "Web 先作为完整产品和 UI 源头。"],
  ["gate", "D3 分类", "W0-W4", "判断是否影响桌面、同步或发布。"],
  ["desktop", "桌面集成", "desktop-next -> dev", "通过后再进入 App RC 稳定线。"],
  ["release", "冻结发布", "release/desktop/*", "只放版本、签名、公证、dmg 和 blocker。"]
];

const skills = (dashboardState.skills_found || []).map(skill => ({
  name: skill.name,
  desc: skill.description || (skill.tracked ? "tracked project skill" : "local skill file"),
  triggers: skill.triggers || [],
  path: skill.path,
  status: skill.tracked ? "tracked" : "local-only"
}));
const agents = (dashboardState.agents_found || []).map(agent => ({
  name: agent.name,
  desc: agent.description || "codex agent",
  triggers: agent.triggers || [],
  path: agent.path,
  status: agent.tracked ? "tracked" : "local-only"
}));
const skillGroups = dashboardState.skill_groups || [];
const agentFamilies = dashboardState.agent_families || [];
const skillAgentRegistry = dashboardState.skill_agent_registry || {summary:{}, categories:[], entries:[], report:{}};
const docCollections = dashboardState.doc_collections || [];
const docHub = dashboardState.doc_hub || {roots:[], groups:[], by_path:{}};
let currentDocCollection = docCollections[0]?.key || "";

const SKILL_AGENT_CATEGORIES = [
  {
    key:"feature",
    title:"Feature Workflow",
    workflow:"feature-plan -> feature-review -> feature-build -> feature-verify",
    summary:"新功能从 brief、计划、实现到只读验证的主路径。",
    scenario:"新增 Web/App/Plugin 能力、拆分阶段计划、补齐实现与验证证据。"
  },
  {
    key:"bugfix",
    title:"Bugfix Workflow",
    workflow:"bug-diagnose -> bug-fix -> bug-verify",
    summary:"缺陷定位、修复、复核和循环修复入口。",
    scenario:"有明确异常、回归、验证失败或需要自动循环修复时使用。"
  },
  {
    key:"automation",
    title:"Roadmap / Automation",
    workflow:"roadmap-loop / workflow-router / planning",
    summary:"把粗需求、roadmap manifest 和长期任务转成可执行批次。",
    scenario:"批量推进路线图、生成目标 prompt、保持长任务计划和自动化节奏。"
  },
  {
    key:"governance",
    title:"Governance / Release",
    workflow:"D3 gate / ship / release-log / handoff",
    summary:"跨模块同步、发布记录、ship 收口和 handoff 展示规则。",
    scenario:"Web 改动进入 Desktop、发布前收口、更新 release log 或同步平台规则。"
  },
  {
    key:"quality",
    title:"Quality / Security",
    workflow:"review / verify / CI / threat-model",
    summary:"CI、架构冷读、安全审查和质量风险识别。",
    scenario:"检查失败、PR 复核、安全评审、代码结构定位和风险复盘。"
  },
  {
    key:"authoring",
    title:"Skill / Agent Authoring",
    workflow:"skill authoring / reusable engineering helpers",
    summary:"创建、维护、镜像和使用可复用 skill / agent 能力。",
    scenario:"新增 SKILL.md、调整 agent 定义、做前端/组合/小修类工程辅助。"
  },
  {
    key:"reference",
    title:"Reference / Support",
    workflow:"project reference",
    summary:"不直接绑定单一 workflow，但属于项目可查阅能力。",
    scenario:"查找辅助能力、理解本地与 portable 定义来源或补充上下文。"
  }
];

// LAST-RESORT FALLBACK ONLY (BOUNDARIES.md §4.4-B). The branch grid is data-driven:
// renderBranches() reads dashboardState.branch_policy.long_lived_branches as the
// PRIMARY source and only falls back to this hardcoded list when branch_policy is
// absent (e.g. a stale/partial state.generated.js). Do not extend this — add branch
// rows to the branch_policy source, not here.
const branches = [
  ["web", "Web 主线和 Web release source。适合 Web 产品、共享 UI 源头和系统治理文档。", "exists"],
  ["desktop-next", "Web 到 App 的集成线。D3 gate 通过后，桌面差异在这里补齐。", "defined"],
  ["desktop-plugin-next", "插件平台和 SDK 隔离线，避免插件平台震荡影响 App RC。", "defined"],
  ["dev", "桌面 App 稳定线 / RC。它故意落后于 web，不应被直接追平。", "exists"],
  ["release/desktop/<version>", "冻结分支，只做版本、签名、公证、dmg、updater 和 release-blocker 修复。", "ephemeral"]
];

const releaseRows = dashboardState.release_rows || [];
const releaseEntries = dashboardState.release_entries || [];
const releaseModules = dashboardState.release_modules || [];
const overallReleases = dashboardState.overall_releases || [];
