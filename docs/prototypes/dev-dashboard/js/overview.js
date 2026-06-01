let activeOverviewFlowView = readOverviewFlowView();

function snapshotFreshness(){
  const ts = Date.parse(dashboardState.generated_at || "");
  if(!Number.isFinite(ts)) return {label:"未生成", badge:"b-yellow"};
  const minutes = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if(minutes < 30) return {label:`${minutes}m fresh`, badge:"b-green"};
  if(minutes < 180) return {label:`${minutes}m old`, badge:"b-blue"};
  const hours = Math.round(minutes / 60);
  return {label:`${hours}h old`, badge:"b-yellow"};
}

function renderOverview(){
  const meta = [];
  if(dashboardState.generated_at) {
    meta.push(`快照 ${new Date(dashboardState.generated_at).toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" })}`);
  }
  if(dashboardState.git?.branch) meta.push(`branch ${dashboardState.git.branch}`);
  document.getElementById("snapshotMeta").textContent = meta.join(" · ") || "state snapshot";
  const freshness = snapshotFreshness();
  const freshnessNode = document.getElementById("freshnessBadge");
  freshnessNode.textContent = freshness.label;
  freshnessNode.className = `badge ${freshness.badge}`;

  const rows = overviewRows.length ? overviewRows : [
    {label:"当前主线", value:"Web mainline / independent App lane"},
    {label:"自动跟踪", value:"生成快照未加载；请运行 node scripts/dashboard/generate-state.mjs。"}
  ];
  document.getElementById("overviewFocus").innerHTML = rows.map((item, index) => `
    <div class="focus-row">
      <div class="num">${index + 1}</div>
      <div><b>${h(item.label)}</b><span>${h(item.value)}</span></div>
    </div>
  `).join("");
}

function renderKpis(){
  const fallback = [
    {label:"web↔dev 分叉", badge:"正常差异", value:`${dashboardState.git?.divergence?.web_only || 0}/${dashboardState.git?.divergence?.dev_only || 0}`, note:"两条独立专注线，差异正常"},
    {label:"Roadmap rows", badge:"真实计数", value:String((dashboardState.roadmap_manifests || []).reduce((sum,item) => sum + (item.total || 0), 0)), note:"来自 manifest Status 表"},
    {label:"Project skills", badge:"tracked", value:String(skills.length), note:".teams/skills/*/SKILL.md"},
    {label:"Snapshot", badge:"manual refresh", value:"local", note:"读取+提醒"}
  ];
  document.getElementById("overviewSignalGrid").innerHTML = (kpis.length ? kpis : fallback).map(item => `
    <div class="surface kpi">
      <div class="label"><span>${h(item.label)}</span><span class="pill">${h(item.badge)}</span></div>
      <div class="num">${h(item.value)}</div>
      <div class="note">${h(item.note)}</div>
    </div>
  `).join("");
}

function formatOverviewDate(value){
  const ts = Date.parse(value || "");
  if(!Number.isFinite(ts)) return "未生成";
  return new Date(ts).toLocaleString("zh-CN", { dateStyle:"medium", timeStyle:"short" });
}

function renderOverviewSyncStatus(){
  const node = document.getElementById("overviewSyncStatus");
  if(!node) return;
  const dirty = syncStatus.dirty || {};
  const buckets = dirty.buckets || {};
  const skill = syncStatus.sync_skill || {};
  const sources = (syncStatus.sources || []).slice(0, 5);
  const bucketText = Object.entries(buckets)
    .sort((a,b) => b[1] - a[1])
    .map(([key,value]) => `${key}:${value}`)
    .join(" · ") || "clean";
  const skillBadge = skill.present ? (skill.tracked ? "b-green" : "b-yellow") : "b-red";
  const dirtyBadge = dirty.total ? "b-yellow" : "b-green";
  node.innerHTML = `
    <div class="overview-sync-head">
      <div>
        <b>看板同步状态</b>
        <span>由 xai-dev-dashboard-sync 固化刷新和核验流程</span>
      </div>
      <span class="badge ${dirtyBadge}">${h(syncStatus.status_label || "未生成")}</span>
    </div>
    <div class="overview-sync-grid">
      <div><b>上次更新时间</b><strong>${h(formatOverviewDate(syncStatus.generated_at || dashboardState.generated_at))}</strong><span>${h(syncStatus.refresh_command || "pnpm dashboard")}</span></div>
      <div><b>当前快照</b><strong>${h(syncStatus.branch || dashboardState.git?.branch || "unknown")}</strong><span>${h(syncStatus.latest_commit || dashboardState.git?.latest_commit || "no commit")}</span></div>
      <div><b>未提交变更</b><strong>${h(String(dirty.total ?? devData.uncommitted_files ?? 0))}</strong><span>${h(bucketText)}</span></div>
      <div><b>同步 Skill</b><strong>${h(skill.name || "xai-dev-dashboard-sync")}</strong><span class="badge ${skillBadge}">${h(skill.status || "missing")}</span></div>
      <div><b>发布记录</b><strong>${h(syncStatus.release_log_latest || dashboardState.release_log?.latest_entry || "未读取")}</strong><span>${h(dashboardState.release_log?.source || "docs/workflow/project/release-log.md")}</span></div>
    </div>
    <div class="overview-sync-sources">
      ${sources.map(source => `
        <span title="${h(source.path)}">${h(source.label)} · ${source.exists ? h(formatOverviewDate(source.updated_at)) : "missing"}</span>
      `).join("")}
    </div>
  `;
}

function buildOverviewModulesFallback(lines){
  const fallbackMeta = {
    web:["Web 版本","blue","主线开发","正常运行","打开 /app/dashboard"],
    app:["桌面版本","green","Native foundation","开发线正常","查看桌面详情"],
    plugin:["桌面插件","purple","平台等待","等待 App 平台","打开 PLUGIN_MAP"],
    sync:["账号云同步","cyan","合同沉淀","暂停中","打开 sync-v1"],
    site:["官方网页","yellow","发布入口候选","本地站点待启动","打开官网本地页"],
    admin:["Admin Dashboard","red","控制面原型","原型可打开","打开 Admin 原型"]
  };
  return (lines.length ? lines : [
    {key:"web",title:"Web",subtitle:"项目最全功能面",status:"Web 主线",next:"D3 gate 后同步 Desktop"},
    {key:"app",title:"Desktop",subtitle:"macOS 桌面产品",status:"独立桌面开发线",next:"G1 native foundation"},
    {key:"plugin",title:"Plugin",subtitle:"桌面插件和 widget",status:"等待 App 平台",next:"插件 SDK / Widget host"},
    {key:"sync",title:"Sync",subtitle:"账号云同步",status:"基建合同",next:"push/pull 和冲突处理"},
    {key:"site",title:"Site",subtitle:"官网和发布入口",status:"拟定",next:"确认 package 和启动时机"},
    {key:"admin",title:"Admin",subtitle:"运营和管理后台",status:"控制面候选",next:"接入真实后台合同"}
  ]).map(item => {
    const meta = fallbackMeta[item.key] || [item.title,"blue",item.status,"待确认","查看详情"];
    return {
      key:item.key,
      title:meta[0],
      subtitle:item.subtitle,
      tone:meta[1],
      icon:meta[0].slice(0,1).toUpperCase(),
      phase:meta[2],
      status:item.status,
      progress:item.key === "web" ? 78 : item.key === "app" ? 42 : item.key === "plugin" ? 24 : item.key === "sync" ? 28 : item.key === "site" ? 18 : 22,
      running:meta[3],
      recent_update:item.status_summary || item.tracker || item.status,
      todo:item.next,
      target:overviewTargetFor(item.key, meta[4])
    };
  });
}

function overviewTargetFor(key, label){
  const targets = {
    web:{type:"url",href:"http://localhost:5173/app/dashboard",label},
    app:{type:"page",page:"product-flow",product_key:"app",label},
    plugin:{type:"doc",path:"docs/PLUGIN_MAP.md",label},
    sync:{type:"doc",path:"docs/workflow/roadmap/sync-v1.md",label},
    site:{type:"url",href:"http://localhost:3000",label},
    admin:{type:"file",href:"../admin-dashboard/index.html",label}
  };
  return targets[key] || {type:"page",page:"product-flow",product_key:key,label};
}

function moduleDisplayTitle(item){
  return item?.key === "admin" ? "Admin Dashboard" : (item?.title || "");
}

function productLineFor(key){
  return products.find(product => product.key === key) || {};
}

function overviewModuleForKey(key){
  return (overviewModules.length ? overviewModules : buildOverviewModulesFallback(products)).find(item => item.key === key);
}

function moduleStage(item){
  const progress = Number(item?.progress) || 0;
  const text = `${item?.todo || ""} ${item?.status || ""}`;
  if(/阻塞|风险|blocked/i.test(text)) return "risk";
  if(progress >= 88) return "done";
  if(progress < 25) return "not-started";
  return "active";
}

function moduleStageLabel(stage){
  return {
    "not-started":"未开发",
    active:"开发中",
    risk:"开发中 · 有阻塞",
    done:"已完成"
  }[stage] || "跟踪中";
}

function flowViewOption(key){
  return FLOW_VIEW_OPTIONS.find(item => item.key === key) || FLOW_VIEW_OPTIONS[0];
}

function readOverviewFlowView(){
  try{
    const saved = localStorage.getItem(OVERVIEW_FLOW_STORAGE_KEY);
    return FLOW_VIEW_CONFIG[saved] ? saved : "topology";
  }catch{
    return "topology";
  }
}

function saveOverviewFlowView(key){
  try{
    localStorage.setItem(OVERVIEW_FLOW_STORAGE_KEY, key);
  }catch{}
}

function setOverviewFlowView(key){
  if(!FLOW_VIEW_CONFIG[key]) return;
  activeOverviewFlowView = key;
  saveOverviewFlowView(key);
  renderOverviewFlow();
}

function renderOverviewFlowSwitch(activeKey){
  const switchNode = document.getElementById("overviewFlowSwitch");
  if(!switchNode) return;
  switchNode.innerHTML = FLOW_VIEW_OPTIONS.map(option => `
    <button class="${option.key === activeKey ? "is-active" : ""}" data-overview-flow-view="${h(option.key)}" type="button" role="tab" aria-selected="${option.key === activeKey ? "true" : "false"}">${h(option.label)}</button>
  `).join("");
  switchNode.querySelectorAll("[data-overview-flow-view]").forEach(button => {
    button.addEventListener("click", () => setOverviewFlowView(button.dataset.overviewFlowView));
  });
}

function flowPoint(value, positions){
  if(typeof value === "string") return positions[value];
  return value;
}

function flowNodeStyle(position){
  const x = Math.max(0, Math.min(OVERVIEW_FLOW_VIEWBOX.width, Number(position?.x) || 0));
  const y = Math.max(0, Math.min(OVERVIEW_FLOW_VIEWBOX.height, Number(position?.y) || 0));
  return `left:${(x / OVERVIEW_FLOW_VIEWBOX.width) * 100}%;top:${(y / OVERVIEW_FLOW_VIEWBOX.height) * 100}%`;
}

function flowEdgePath(edge, positions, mode){
  const points = [edge.from, ...(edge.via || []), edge.to].map(point => flowPoint(point, positions)).filter(Boolean);
  if(points.length < 2) return "";
  if(points.length > 2 || mode === "polyline"){
    return points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  }
  const [a, b] = points;
  if(mode === "straight" || Math.abs(a.y - b.y) < 8){
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }
  if(mode === "orthogonal"){
    const midY = (a.y + b.y) / 2;
    return `M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
  }
  const control = Math.max(70, Math.abs(a.x - b.x) * .42);
  return `M ${a.x} ${a.y} C ${a.x + control} ${a.y}, ${b.x - control} ${b.y}, ${b.x} ${b.y}`;
}

function renderOverviewFlowExtras(layout){
  return (layout.extras || []).map(extra => {
    if(extra.type === "band"){
      return `
        <div class="overview-flow-extra overview-flow-band" style="top:${h(extra.y)}px">
          <span class="overview-flow-band-label" title="${h(extra.text)}"><strong>${h(extra.title)}</strong></span>
        </div>
      `;
    }
    if(extra.type === "line"){
      const x = Number.isFinite(Number(extra.x)) ? Number(extra.x) : 22;
      return `<div class="overview-flow-extra overview-flow-line-label" data-tone="${h(extra.tone || "main")}" style="left:${h(x)}px;top:${h(extra.y)}px">${h(extra.text)}</div>`;
    }
    if(extra.type === "ring"){
      return `<div class="overview-flow-extra overview-flow-center-ring" style="left:calc(${(extra.x / OVERVIEW_FLOW_VIEWBOX.width) * 100}% - 110px);top:calc(${(extra.y / OVERVIEW_FLOW_VIEWBOX.height) * 100}% - 110px)"></div>`;
    }
    return `<div class="overview-flow-extra overview-flow-line-label" style="left:${h(extra.x)}px;top:${h(extra.y)}px">${h(extra.text)}</div>`;
  }).join("");
}

let overviewFlowObservedCanvas = null;
let overviewFlowResizeObserver = null;
let overviewFlowCollisionFrame = null;

function overviewFlowRectsIntersect(a, b, padding = 6){
  return !(
    a.right <= b.left + padding ||
    b.right <= a.left + padding ||
    a.bottom <= b.top + padding ||
    b.bottom <= a.top + padding
  );
}

function resolveOverviewFlowLabelCollisions(){
  const canvas = document.getElementById("overviewFlowCanvas");
  if(!canvas) return;
  const labels = [...canvas.querySelectorAll(".overview-flow-line-label,.overview-flow-band-label")];
  labels.forEach(label => {
    label.classList.remove("is-colliding");
    label.removeAttribute("aria-hidden");
  });
  const nodeRects = [...canvas.querySelectorAll(".overview-flow-node")]
    .map(node => node.getBoundingClientRect());
  labels.forEach(label => {
    const labelRect = label.getBoundingClientRect();
    const collides = nodeRects.some(nodeRect => overviewFlowRectsIntersect(labelRect, nodeRect));
    label.classList.toggle("is-colliding", collides);
    if(collides) label.setAttribute("aria-hidden", "true");
  });
}

function scheduleOverviewFlowCollisionCheck(){
  if(overviewFlowCollisionFrame) cancelAnimationFrame(overviewFlowCollisionFrame);
  overviewFlowCollisionFrame = requestAnimationFrame(() => {
    overviewFlowCollisionFrame = null;
    resolveOverviewFlowLabelCollisions();
  });
}

function observeOverviewFlowCanvas(){
  const canvas = document.getElementById("overviewFlowCanvas");
  if(!canvas || canvas === overviewFlowObservedCanvas) return;
  overviewFlowResizeObserver?.disconnect();
  overviewFlowObservedCanvas = canvas;
  if("ResizeObserver" in window){
    overviewFlowResizeObserver = new ResizeObserver(scheduleOverviewFlowCollisionCheck);
    overviewFlowResizeObserver.observe(canvas);
  }
}

function renderOverviewFlow(){
  const modules = overviewModules.length ? overviewModules : buildOverviewModulesFallback(products);
  const moduleByKey = new Map(modules.map(item => [item.key, item]));
  const view = flowViewOption(activeOverviewFlowView);
  const layout = FLOW_VIEW_CONFIG[view.key] || FLOW_VIEW_CONFIG.topology;
  const board = document.getElementById("overviewFlowBoard");
  const description = document.getElementById("overviewFlowDescription");
  const meta = document.getElementById("overviewFlowViewMeta");
  if(board) board.dataset.flowView = view.key;
  if(description) description.textContent = view.description;
  if(meta) meta.innerHTML = `<b>${h(view.title)}</b><span>${h(view.description)}</span>`;
  renderOverviewFlowSwitch(view.key);
  const edges = (layout.edges || []).map(edge => {
    const d = flowEdgePath(edge, layout.positions || {}, layout.mode);
    return d ? `<path class="overview-flow-edge" data-tone="${h(edge.tone || "main")}" d="${d}"></path>` : "";
  }).join("");
  const nodeOrder = layout.nodeOrder || ["web","app","plugin","sync","site","admin"];
  const nodes = nodeOrder
    .map(key => moduleByKey.get(key))
    .filter(Boolean)
    .map(item => {
      const stage = moduleStage(item);
      const displayTitle = moduleDisplayTitle(item);
      const position = (layout.positions || {})[item.key] || {x:500, y:180};
      return `
        <button class="overview-flow-node" data-overview-flow="${h(item.key)}" data-key="${h(item.key)}" data-tone="${h(item.tone || "blue")}" data-stage="${h(stage)}" style="${flowNodeStyle(position)}" type="button">
          <span class="overview-flow-dot">${h(stage === "done" ? "" : (item.icon || displayTitle.slice(0,1)))}</span>
          <span class="overview-flow-copy"><b>${h(displayTitle)}</b><span>${h(moduleStageLabel(stage))} · ${h(item.progress || 0)}%</span></span>
          <span class="overview-flow-progress"><span style="width:${Math.max(0, Math.min(100, Number(item.progress) || 0))}%"></span></span>
        </button>
      `;
    }).join("");
  document.getElementById("overviewFlowCanvas").innerHTML = `
    <svg class="overview-flow-svg" viewBox="0 0 ${OVERVIEW_FLOW_VIEWBOX.width} ${OVERVIEW_FLOW_VIEWBOX.height}" preserveAspectRatio="none" aria-hidden="true">${edges}</svg>
    ${renderOverviewFlowExtras(layout)}
    ${nodes}
  `;
  document.getElementById("overviewFlowCanvas").dataset.flowView = view.key;
  observeOverviewFlowCanvas();
  scheduleOverviewFlowCollisionCheck();
  const summary = modules.reduce((acc, item) => {
    acc[moduleStage(item)] += 1;
    return acc;
  }, {"not-started":0, active:0, risk:0, done:0});
  document.getElementById("overviewFlowSummary").innerHTML = `
    <div><b>${summary.active + summary.risk}</b><span>开发中</span></div>
    <div><b>${summary.done}</b><span>已完成</span></div>
    <div><b>${summary["not-started"]}</b><span>未开发</span></div>
    <div><b>${modules.length}</b><span>核心模块</span></div>
  `;
  document.querySelectorAll("[data-overview-flow]").forEach(button => {
    button.addEventListener("click", () => openModuleDrawer(moduleByKey.get(button.dataset.overviewFlow)));
  });
}

function moduleFeatureGroups(key){
  const groups = {
    web: {
      done:["任务、看板、Dashboard 网格、日历、矩阵、番茄、习惯、冥想、倒计时、统计等 Web 模块已经形成主产品面。","设置、AI 对话、命令面板、Dashboard widget host 已接入主导航和插件注册。"],
      active:["继续补齐 Dashboard 真实数据、Web Console gap closure、AI provider 和跨模块事件联动。","Web 改动进入 Desktop 前需要 D3 分类，避免直接把主线差异带入 App。"],
      next:["Cloudflare 发布、CSP/Sentry、service worker 和设备会话继续作为发布稳定性重点。"]
    },
    app: {
      done:["桌面版以 Web 为 UI 源，已明确 main/control/grid 多窗口和 Tauri native foundation 路线。","G0/G1 相关窗口、离线 profile 和原生能力已在路线图中拆分。"],
      active:["推进 Tauri command、窗口能力、离线本地存储和 App RC 稳定线。","从 Web 来的共享改动必须先经过 D3 gate。"],
      next:["补齐 macOS 手动 smoke、签名、公证、DMG、updater 和 release/desktop 冻结流程。"]
    },
    plugin: {
      done:["插件和 widget 被定义为 App 之上的扩展层，和 App RC 分开跟踪。","PLUGIN_MAP 已覆盖插件包状态，是当前插件面板的主要事实来源。"],
      active:["等待 App 平台稳定后恢复插件 SDK、widget host 和桌面整理插件开发。"],
      next:["插件需要跨设备时进入账号云同步；device-local 插件状态不进入同步协议。"]
    },
    sync: {
      done:["账号云同步被定义为 Web、App、Plugin 的共同同步层，而不是模块之间互相直连。","sync-v1 roadmap 已作为协议和实现恢复入口。"],
      active:["继续沉淀 entity、schema、push/pull、冲突策略、Web IndexedDB 和 App SQLite 测试。"],
      next:["需要补齐两设备 smoke 和 account-sync / device-local 作用域边界。"]
    },
    site: {
      done:["官网被定义为下载、更新说明、账号入口和 release notes 的对外承接面。","release-site archive 保留了官网和账号相关页面基础。"],
      active:["本地官网入口仍待启动，Cloudflare 发布节奏和 package 归属需要确认。"],
      next:["桌面版 release 产生 DMG/updater 后，官网需要同步下载页和更新说明。"]
    },
    admin: {
      done:["Admin Dashboard 已保持为独立控制面原型，不塞进个人开发看板本体。","原型覆盖用户、功能、用量、审计、AI 配置等管理中台方向。"],
      active:["正式接入仍依赖账号、权限、计量和审计合同稳定。"],
      next:["后续需要独立 apps/admin 或等价 surface，和用户端 Web Console 隔离权限与部署。"]
    }
  };
  return groups[key] || {done:[], active:[], next:[]};
}

let activeDrawerModule = null;

function renderDrawerFeatureList(items, label){
  if(!items?.length) return "";
  return items.map(text => `<div class="drawer-feature"><b>${h(label)}</b><span>${h(text)}</span></div>`).join("");
}

function openModuleDrawer(item){
  if(!item) return;
  const line = productLineFor(item.key);
  const stage = moduleStage(item);
  const features = moduleFeatureGroups(item.key);
  activeDrawerModule = {
    item,
    target: item.target || overviewTargetFor(item.key, "打开入口")
  };
  const badge = document.getElementById("moduleDrawerBadge");
  badge.textContent = moduleStageLabel(stage);
  badge.className = `badge ${stage === "risk" ? "b-red" : stage === "done" ? "b-green" : stage === "active" ? "b-cyan" : "b-blue"}`;
  document.getElementById("moduleDrawerTitle").textContent = moduleDisplayTitle(item);
  document.getElementById("moduleDrawerBody").innerHTML = `
    <section class="drawer-panel">
      <h3>模块介绍</h3>
      <p class="drawer-summary">${h(line.goal || item.subtitle || line.subtitle || "该模块已纳入产品结构图和总览监控。")}</p>
    </section>
    <section class="drawer-panel">
      <h3>当前状态</h3>
      <div class="drawer-metric-grid">
        <div class="drawer-metric"><b>阶段</b><span>${h(item.phase || line.status || "跟踪中")}</span></div>
        <div class="drawer-metric"><b>完成度</b><span>${h(item.progress || 0)}%</span></div>
        <div class="drawer-metric"><b>运行状态</b><span>${h(item.running || "待确认")}</span></div>
      </div>
      <div class="chip-row" style="margin-top:10px">${statusChips(item.status_counts || line.status_counts)}</div>
    </section>
    <section class="drawer-panel">
      <h3>功能进展</h3>
      <div class="drawer-feature-list">
        ${renderDrawerFeatureList(features.done, "已有")}
        ${renderDrawerFeatureList(features.active, "进行中")}
        ${renderDrawerFeatureList(features.next, "待完善")}
      </div>
    </section>
    <section class="drawer-panel">
      <h3>最近更新 / 待处理</h3>
      <div class="drawer-feature-list">
        <div class="drawer-feature"><b>最近</b><span>${h(item.recent_update || line.status_summary || "等待快照刷新")}</span></div>
        <div class="drawer-feature"><b>待处理</b><span>${h(item.todo || line.next || "暂无")}</span></div>
      </div>
    </section>
  `;
  document.getElementById("moduleDrawerPrimary").textContent = activeDrawerModule.target.label || "打开入口";
  document.getElementById("moduleDrawerOverlay").classList.add("is-open");
  document.getElementById("moduleDrawer").classList.add("is-open");
  document.getElementById("moduleDrawer").setAttribute("aria-hidden", "false");
}

function closeModuleDrawer(){
  document.getElementById("moduleDrawerOverlay").classList.remove("is-open");
  document.getElementById("moduleDrawer").classList.remove("is-open");
  document.getElementById("moduleDrawer").setAttribute("aria-hidden", "true");
}

function renderOverviewModules(){
  const modules = overviewModules.length ? overviewModules : buildOverviewModulesFallback([]);
  document.getElementById("overviewModuleGrid").innerHTML = modules.map((item, index) => `
    <button class="overview-module-card" data-overview-module="${index}" data-tone="${h(item.tone || "blue")}" type="button">
      <div class="overview-module-top">
        <div class="overview-module-mark">${h(item.icon || moduleDisplayTitle(item).slice(0,1))}</div>
        <span class="overview-module-state">${h(item.running || "待确认")}</span>
      </div>
      <div class="overview-module-title">
        <h3>${h(moduleDisplayTitle(item))}</h3>
        <p>${h(item.subtitle || item.status || "")}</p>
      </div>
      <div class="overview-progress">
        <div class="overview-progress-label"><span>${h(item.phase || item.status || "当前阶段")}</span><span>${h(item.progress || 0)}%</span></div>
        <div class="overview-progress-track"><span style="width:${Math.max(0, Math.min(100, Number(item.progress) || 0))}%"></span></div>
      </div>
      <div class="overview-module-meta">
        <div><b>最近更新</b><span>${h(item.recent_update || "等待快照刷新")}</span></div>
        <div><b>待处理</b><span>${h(item.todo || "暂无")}</span></div>
        <div><b>当前状态</b><span>${h(item.status || item.phase || "tracked")}</span></div>
        <div><b>入口</b><span>${h(item.target?.label || "查看详情")}</span></div>
      </div>
      <div class="overview-module-footer"><span>${h(item.target?.label || "进入模块")}</span><span>›</span></div>
    </button>
  `).join("");
  document.querySelectorAll("[data-overview-module]").forEach(button => {
    button.addEventListener("click", () => openModuleDrawer(modules[Number(button.dataset.overviewModule)]));
  });
}

function openOverviewModule(item){
  openModuleDrawer(item);
}

function openProductTarget(target){
  if(target.type === "url" && target.href){
    window.open(target.href, "_blank", "noreferrer");
    return;
  }
  if(target.type === "file" && target.href){
    window.open(target.href, "_blank", "noreferrer");
    return;
  }
  if(target.type === "doc" && target.path){
    openDocInLibrary(target.path);
    return;
  }
  const page = target.page || "product-flow";
  setPage(page);
  if(target.product_key) setProduct(target.product_key);
}
