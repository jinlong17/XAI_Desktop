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
  renderOverviewSkillQuick();
}

// Frequently-used entry-point skills surfaced on the Overview (display curation).
// The full skill registry lives on the Skill/Agent page (auto-scanned); this is a quick-jump strip.
const OVERVIEW_QUICK_SKILLS = [
  ["xai-consistency-audit", "边界 / 一致性审计"],
  ["xai-module-classify", "功能归类 / 边界扫描"],
  ["xai-dev-dashboard-sync", "看板同步"],
  ["xai-feature-brief", "需求规范化"],
  ["xai-feature-full-loop", "功能一条龙"],
  ["xai-web-to-desktop-sync", "D3 闸门"],
  ["xai-sync-fanout-dispatch", "完成后扇出同步"],
  ["xai-release-log", "发布登记"]
];
function ensureSkillQuickStyles(){
  if(typeof document === "undefined" || document.getElementById("xai-skill-quick-styles")) return;
  const el = document.createElement("style");
  el.id = "xai-skill-quick-styles";
  el.textContent = `
  .overview-skill-quick{margin-top:10px;padding:13px;border:1px solid var(--line);border-radius:10px;background:color-mix(in srgb,var(--surface) 80%,transparent)}
  .osk-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
  .osk-head b{font-size:13px}
  .osk-head span{color:var(--faint);font-size:11px}
  .osk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(214px,1fr));gap:8px}
  .osk-card{display:flex;flex-direction:column;gap:5px;padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:var(--surface-2);cursor:pointer;transition:border-color .15s ease,transform .15s ease}
  .osk-card:hover{border-color:var(--blue);transform:translateY(-1px)}
  .osk-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
  .osk-card-top code{font-size:12px;font-weight:700;overflow-wrap:anywhere;line-height:1.3}
  .osk-label{color:var(--muted);font-size:11px}
  .osk-copy{flex:none;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--faint);font-size:10px;padding:3px 8px;cursor:pointer;white-space:nowrap;transition:border-color .15s ease,color .15s ease}
  .osk-copy:hover{border-color:var(--blue);color:var(--blue)}
  `;
  document.head.appendChild(el);
}
function renderOverviewSkillQuick(){
  ensureSkillQuickStyles();
  const host = document.getElementById("overviewSkillQuick");
  if(!host) return;
  const byName = new Map((typeof skills !== "undefined" ? skills : []).map(s => [s.name, s]));
  const items = OVERVIEW_QUICK_SKILLS.filter(([name]) => byName.has(name));
  if(!items.length){ host.innerHTML = ""; return; }
  host.innerHTML = `
    <div class="osk-head"><b>常用 Skill</b><span>${items.length} 个高频入口 · 点卡片进 Skill 页 · 点「复制」拷名字</span></div>
    <div class="osk-grid">${items.map(([name, label]) => {
      const desc = (byName.get(name)?.desc || "").slice(0, 110);
      return `<div class="osk-card" data-osk="${h(name)}" title="${h(desc)}">
        <div class="osk-card-top"><code>${h(name)}</code><button class="osk-copy" type="button" data-osk-copy="${h(name)}" title="复制 skill 名字">复制</button></div>
        <span class="osk-label">${h(label)}</span>
      </div>`;
    }).join("")}</div>`;
  host.querySelectorAll("[data-osk]").forEach(card => card.addEventListener("click", () => setPage("skill-agent")));
  host.querySelectorAll("[data-osk-copy]").forEach(btn => btn.addEventListener("click", event => {
    event.stopPropagation();
    copyText(btn.dataset.oskCopy, btn);
  }));
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
  const latestCommit = syncStatus.latest_commit || dashboardState.git?.latest_commit || "no commit";
  const latestCommitShort = latestCommit.length > 36 ? `${latestCommit.slice(0, 35)}…` : latestCommit;
  const releaseLatest = syncStatus.release_log_latest || dashboardState.release_log?.latest_entry || "未读取";
  const releaseLatestShort = releaseLatest.length > 36 ? `${releaseLatest.slice(0, 35)}…` : releaseLatest;
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
      <div><b>当前快照</b><strong>${h(syncStatus.branch || dashboardState.git?.branch || "unknown")}</strong><span title="${h(latestCommit)}">${h(latestCommitShort)}</span></div>
      <div><b>未提交变更</b><strong>${h(String(dirty.total ?? devData.uncommitted_files ?? 0))}</strong><span>${h(bucketText)}</span></div>
      <div><b>同步 Skill</b><strong>${h(skill.name || "xai-dev-dashboard-sync")}</strong><span class="badge ${skillBadge}">${h(skill.status || "missing")}</span></div>
      <div><b>发布记录</b><strong title="${h(releaseLatest)}">${h(releaseLatestShort)}</strong><span>${h(dashboardState.release_log?.source || "docs/workflow/project/release-log.md")}</span></div>
    </div>
    <div class="overview-sync-sources">
      ${sources.map(source => `
        <span title="${h(source.path)}">${h(source.label)} · ${source.exists ? h(formatOverviewDate(source.updated_at)) : "missing"}</span>
      `).join("")}
    </div>
  `;
}

function buildOverviewModulesFallback(lines){
  return (lines || []).map(item => ({
    ...item,
    tone:item.tone || item.visual?.tone || "blue",
    icon:item.icon || item.visual?.icon || String(item.title || "?").slice(0,1),
    overview_title:item.overview_title || item.labels?.overview || item.title,
    phase:item.phase || item.overview?.phase || item.status,
    progress:item.progress || item.overview?.progress_fallback || 0,
    running:item.running || item.overview?.running || "待确认",
    recent_update:item.recent_update || item.status_summary || item.tracker || item.status,
    todo:item.todo || item.next,
    target:moduleTargetFor(item, "查看详情")
  }));
}

function overviewTargetFor(key, label){
  return moduleTargetFor(productLineFor(key), label);
}

function moduleTargetFor(item, label){
  if(item?.target) return {...item.target, label:item.target.label || label || "查看详情"};
  return {type:"page",page:"product-flow",product_key:item?.key,label:label || "查看详情"};
}

function moduleDisplayTitle(item){
  return item?.overview_title || item?.labels?.overview || item?.title || "";
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
  const line = (typeof productLineFor === "function") ? productLineFor(key) : null;
  const feats = line && Array.isArray(line.features) ? line.features : null;
  if(feats && feats.length){
    const label = f => f.note ? `${f.name} — ${f.note}` : f.name;
    return {
      done: feats.filter(f => f.status === "shipped").map(label),
      active: feats.filter(f => f.status === "in-dev").map(label),
      next: feats.filter(f => ["planned", "proposed", "paused", "contested"].includes(f.status)).map(label)
    };
  }
  return {done:[], active:[], next:[]};
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
    target: moduleTargetFor(item, "打开入口")
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

function overviewFeatureSummary(key){
  const line = (typeof productLineFor === "function") ? productLineFor(key) : null;
  const feats = line && Array.isArray(line.features) ? line.features : [];
  if(!feats.length) return "";
  const n = s => feats.filter(f => f.status === s).length;
  const planning = feats.length - n("shipped") - n("in-dev");
  return `<div class="overview-module-features"><span><b>${feats.length}</b>Feature</span><span><b>${n("shipped")}</b>已交付</span><span><b>${n("in-dev")}</b>开发中</span><span><b>${planning}</b>规划/待定</span></div>`;
}

function renderOverviewModules(){
  const modules = overviewModules.length ? overviewModules : buildOverviewModulesFallback([]);
  if(!modules.length){
    document.getElementById("overviewModuleGrid").innerHTML = `<div class="flow-note"><b>产品模块未加载</b><p style="margin-top:8px">请运行 <code>pnpm dashboard</code> 刷新统一 Product Module Registry。</p></div>`;
    return;
  }
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
      ${overviewFeatureSummary(item.key)}
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
  if(!target) return;
  if(target.type === "ops" && target.target){
    if(typeof openUsageOpsTarget === "function"){
      openUsageOpsTarget(target.target, target.route || "");
      return;
    }
    try{
      const fallback = new URL("http://localhost:3000");
      if(target.route && String(target.route).startsWith("/") && !String(target.route).startsWith("//")){
        fallback.pathname = target.route;
      }
      window.open(fallback.toString(), "_blank", "noopener");
    }catch{
      window.open("http://localhost:3000", "_blank", "noopener");
    }
    return;
  }
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
