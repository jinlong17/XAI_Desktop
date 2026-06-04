function renderStructureMap(){
  if(!products.length) return;
  const nodes = products.map(item => `
    <button class="map-node ${item.key === products[0].key ? "is-active" : ""}" data-product="${h(item.key)}" type="button">
      <span class="map-index">${h(item.order)}</span>
      <b>${h(item.title)}</b>
      <span>${h(item.subtitle)}</span>
    </button>
  `).join("");
  const paths = productLinks.map(([from, to, tone]) => {
    const d = mapPath(from, to);
    return d ? `<path class="map-edge ${tone === "soft" ? "is-soft" : tone === "control" ? "is-control" : ""}" data-from="${h(from)}" d="${d}"></path>` : "";
  }).join("");
  document.getElementById("structureMap").innerHTML = `
    <svg class="map-svg" viewBox="0 0 1000 430" preserveAspectRatio="none" aria-hidden="true">
      ${paths}
    </svg>
    ${nodes}
  `;
  document.querySelectorAll(".map-node").forEach(node => node.addEventListener("click", () => setProduct(node.dataset.product)));
}

function mapPath(from, to){
  const anchors = {
    web:{x:190,y:84},
    app:{x:500,y:84},
    plugin:{x:810,y:84},
    sync:{x:500,y:218},
    site:{x:268,y:356},
    admin:{x:750,y:356}
  };
  const a = anchors[from];
  const b = anchors[to];
  if(!a || !b) return "";
  const midY = Math.max(a.y, b.y) - 10;
  if(a.y === b.y) return `M ${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y - 34}, ${(a.x + b.x) / 2} ${b.y - 34}, ${b.x} ${b.y}`;
  return `M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
}

function renderBranchFlow(){
  document.getElementById("branchFlow").innerHTML = branchWorkflow.map(([key,title,branch,desc], index) => `
    <button class="branch-step ${index === 0 ? "is-active" : ""}" data-branch-step="${h(key)}" type="button">
      <b>${h(index + 1)}. ${h(title)}</b>
      <code>${h(branch)}</code>
      <span>${h(desc)}</span>
    </button>
  `).join("");
  document.querySelectorAll(".branch-step").forEach(node => {
    node.addEventListener("click", () => {
      document.querySelectorAll(".branch-step").forEach(step => step.classList.toggle("is-active", step === node));
      const item = branchWorkflow.find(([key]) => key === node.dataset.branchStep);
      if(item) document.getElementById("branchFlowMeta").textContent = item[3];
    });
  });
}

function renderModules(){
  if(!products.length){
    document.getElementById("moduleTrack").innerHTML = `<div class="flow-note"><b>产品状态未加载</b><p style="margin-top:8px">请运行 <code>node scripts/dashboard/generate-state.mjs</code> 刷新快照。</p></div>`;
    return;
  }
  const regionMeta = [
    ["主产品链", "Web → Desktop → Plugin → Sync"],
    ["项目系统区", "Site / release / workflow"],
    ["Control Plane", "Admin"]
  ];
  document.getElementById("moduleTrack").innerHTML = regionMeta.map(([region, note]) => {
    const items = products.filter(item => (item.region || "项目系统区") === region);
    if(!items.length) return "";
    return `
      <section class="module-region" data-region="${h(region)}">
        <div class="region-label"><b>${h(region)}</b><span>${h(note)}</span></div>
        <div class="region-track">
          ${items.map(item => `
    <button class="module-card ${item.key === products[0].key ? "is-active" : ""}" data-product="${item.key}" type="button">
      <div class="module-top">
        <span class="module-index">${item.order}</span>
        <span class="badge ${badgeClass(item.badge)}">${h(item.badge)}</span>
      </div>
      <div>
        <h3>${h(item.title)}</h3>
        <p>${h(item.subtitle)}</p>
      </div>
      <div class="module-meta">
        <span><b>状态</b> ${h(String(item.status).split(" · ")[0])}</span>
        <span><b>Branch</b> ${h(item.branch)}</span>
        <span><b>依赖</b> ${h(item.dependency)}</span>
      </div>
      <span class="pill">${h(item.next)}</span>
    </button>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");
  document.querySelectorAll(".module-card").forEach(node => node.addEventListener("click", () => setProduct(node.dataset.product)));
}

function productTitleFor(key){
  const found = products.find(product => product.key === key);
  if(found) return found.title;
  const labels = {
    web:"Web 版本", app:"Mac 桌面版 App", plugin:"桌面整理插件 / Widget",
    sync:"账号云同步层", site:"官方网页", admin:"Admin Dashboard / 控制面",
    release:"发布冻结线 release/desktop/*", main:"main 汇合点", dev:"dev (App RC)"
  };
  return labels[key] || key;
}

function navBlock(label, pill, inner){
  if(!inner) return "";
  return `<details class="nav-fold"><summary class="nav-label"><span>${h(label)}</span>${pill ? `<span class="pill">${h(pill)}</span>` : ""}</summary><div class="nav-fold-body">${inner}</div></details>`;
}

function renderSignals(list){
  if(!(list && list.length)) return "";
  return `<div class="signal-chips">${list.map(s => `<span class="signal-chip">${h(s)}</span>`).join("")}</div>`;
}

function renderSkills(list){
  if(!(list && list.length)) return "";
  return list.map(s => `<div class="skill-row"><code>${h(s.name)}</code><span>${h(s.when)}</span></div>`).join("");
}

function renderPrompts(list){
  if(!(list && list.length)) return "";
  return list.map((p, index) => `
    <div class="prompt-card">
      <div class="prompt-head"><b>${h(p.label)}</b><button class="prompt-copy" data-prompt-index="${index}" type="button">复制</button></div>
      <pre>${h(p.text)}</pre>
    </div>`).join("");
}

function renderWorkflowSteps(list){
  if(!(list && list.length)) return "";
  return `<div class="wf-steps">${list.map(step => `<div class="wf-step">${h(step)}</div>`).join("")}</div>`;
}

function renderTransitions(list){
  if(!(list && list.length)) return "";
  return list.map(t => `
    <div class="transition-card" data-to="${h(t.to)}">
      <div class="t-to">→ ${h(productTitleFor(t.to))}</div>
      <div class="t-trigger"><b>触发条件：</b>${h(t.trigger)}</div>
      <div class="t-meta">
        <span class="badge b-blue">branch ${h(t.branch)}</span>
        <span class="badge b-cyan">skill ${h(t.skill)}</span>
      </div>
      ${t.note ? `<div class="t-note">${h(t.note)}</div>` : ""}
    </div>`).join("");
}

function renderImpacts(list){
  if(!(list && list.length)) return "";
  return list.map(im => `<div class="impact-row" data-module="${h(im.module)}"><b>${h(productTitleFor(im.module))} · ${h(im.when)}</b><span>${h(im.action)}</span></div>`).join("");
}

// FEATURE_STATUS / featureMeta are the shared status vocabulary defined in
// js/status-meta.js (loaded before this file). Do not re-define them here.
function renderFeatures(list){
  if(!(list && list.length)) return "";
  return list.map(f => {
    const m = featureMeta(f.status);
    return `<div class="feature-row"><span class="badge ${m.cls}">${h(m.label)}</span><div class="feature-row-text"><b>${h(f.name)}</b>${f.note ? `<span>${h(f.note)}</span>` : ""}</div></div>`;
  }).join("");
}
function featureCountSummary(list){
  if(!(list && list.length)) return "";
  const counts = {};
  list.forEach(f => { counts[f.status] = (counts[f.status] || 0) + 1; });
  const parts = FEATURE_STATUS_ORDER.filter(s => counts[s]).map(s => `${counts[s]} ${featureMeta(s).label}`);
  return `${list.length} 项 · ${parts.join(" · ")}`;
}

// Owner of the per-module dossier (BOUNDARIES.md §4.5-D). The Overview drawer
// (overview.js openModuleDrawer) is a separate COMPACT Mirror, not a second
// copy of this body — see the P1b note there. NOTE for any future merge: the
// post-render wiring below queries hardcoded #productDetail / #detailDocLinks
// and calls attachTestingActions(detailPanel); to host this body in another
// mount these MUST be re-scoped to the passed root element first.
function setProduct(key){
  const item = products.find(product => product.key === key);
  if(!item) return;
  const productTarget = moduleTargetFor(item, item.key === "admin" ? "打开 Admin 原型" : "打开入口");
  const deploymentBlock = typeof renderProductDeploymentNavBlock === "function" ? renderProductDeploymentNavBlock(key) : "";
  const testingBlock = typeof renderProductTestNavBlock === "function" ? renderProductTestNavBlock(key) : "";
  document.querySelectorAll(".module-card").forEach(node => node.classList.toggle("is-active", node.dataset.product === key));
  document.querySelectorAll(".map-node").forEach(node => node.classList.toggle("is-active", node.dataset.product === key));
  const detailPanel = document.getElementById("productDetail");
  detailPanel.setAttribute("data-product", key);
  detailPanel.innerHTML = `
    <div class="detail-title">
      <div>
        <span class="badge ${badgeClass(item.badge)}">${h(item.badge)}</span>
        <h3 style="margin-top:10px">${item.order}. ${h(item.title)}</h3>
      </div>
      <button class="reader-btn" id="productTargetButton" type="button">${h(productTarget.label)}</button>
    </div>
    ${item.goal ? `<div class="nav-block"><div class="nav-label"><span>开发目标</span></div><div class="goal-line">${h(item.goal)}</div></div>` : ""}
    ${item.features && item.features.length ? `<div class="detail-features">
      <div class="detail-features-head"><b>功能 Feature 列表</b><span class="pill">${h(featureCountSummary(item.features))}</span></div>
      <div class="feature-rows">${renderFeatures(item.features)}</div>
    </div>` : ""}
    <div class="detail-grid">
      <div class="detail-metric"><b>模块状态</b><span>${h(String(item.status).split(" · ")[0])}</span></div>
      <div class="detail-metric"><b>推荐 branch</b><span>${h(item.branch)}</span></div>
      <div class="detail-metric"><b>关键依赖</b><span>${h(item.dependency)}</span></div>
      <div class="detail-metric is-wide"><b>真实计数</b><div class="chip-row">${statusChips(item.status_counts)}</div></div>
    </div>
    ${deploymentBlock}
    ${testingBlock}
    ${navBlock("任务归属信号", "Codex 判断依据", renderSignals(item.routing))}
    <div class="detail-list">
      ${item.points.map(([title,desc]) => `<div><b>${h(title)}</b><span>${h(desc)}</span></div>`).join("")}
    </div>
    ${navBlock("推荐 skill / agent", "", renderSkills(item.skills))}
    ${navBlock("常用 prompt", "点击复制", renderPrompts(item.prompts))}
    ${navBlock("开发 workflow", "", renderWorkflowSteps(item.workflow))}
    ${navBlock("进入下一模块", "触发条件 · branch · skill", renderTransitions(item.transitions))}
    ${navBlock("影响 / 需同步更新", "", renderImpacts(item.impacts))}
    <div class="detail-docs">
      <b class="detail-docs-label">相关文档（PRD / 治理）</b>
      <div class="doc-actions" id="detailDocLinks">
        ${(item.related_docs || []).map(d => `<button class="reader-btn" data-detail-doc="${h(d.path)}" type="button">${h(d.label)}</button>`).join("") || '<span class="chip-empty">无关联文档</span>'}
      </div>
    </div>
  `;
  document.getElementById("productTargetButton").addEventListener("click", () => {
    openProductTarget(productTarget);
  });
  document.querySelectorAll("#detailDocLinks [data-detail-doc]").forEach(btn => {
    btn.addEventListener("click", () => openDocInLibrary(btn.dataset.detailDoc));
  });
  document.querySelectorAll("#productDetail .prompt-copy").forEach(btn => {
    btn.addEventListener("click", () => copyText((item.prompts || [])[Number(btn.dataset.promptIndex)]?.text || "", btn));
  });
  if(typeof attachTestingActions === "function") attachTestingActions(detailPanel);
}

function renderSyncOrchestration(){
  const host = document.getElementById("syncOrchestration");
  if(!host) return;
  const data = (typeof window !== "undefined" && window.XAI_DASHBOARD_STATE && window.XAI_DASHBOARD_STATE.sync_orchestration) || null;
  if(!data){ host.innerHTML = ""; return; }
  const actions = Array.isArray(data.actions) ? data.actions : [];
  const waves = Array.isArray(data.waves) ? data.waves : [];
  const actionRows = actions.map(a => `
    <div class="orch-action">
      <div class="orch-action-head">
        <b>${h(a.title || a.id || "")}</b>
        <span class="orch-tags">
          <span class="orch-tag ${a.is_new ? "is-new" : ""}">${a.is_new ? "新建" : "复用"}</span>
          <span class="orch-tag ${a.parallel_safe ? "is-par" : "is-ser"}">${a.parallel_safe ? "可并行" : "串行"}</span>
        </span>
      </div>
      <div class="orch-action-meta">
        <span><b>skill</b> <code>${h(a.skill || "—")}</code></span>
        ${(a.depends_on && a.depends_on.length) ? `<span><b>依赖</b> ${a.depends_on.map(d => `<code>${h(d)}</code>`).join(" ")}</span>` : ""}
      </div>
    </div>
  `).join("");
  const waveBoxes = waves.map((wave, i) => `
    <div class="orch-wave">
      <span class="orch-wave-label">Wave ${i + 1}${(waves.length > 1 && i === waves.length - 1) ? " · 收尾" : ""}</span>
      <div class="orch-wave-items">${(Array.isArray(wave) ? wave : []).map(id => `<code>${h(id)}</code>`).join("")}</div>
    </div>
  `).join("");
  const docButtons = (Array.isArray(data.docs) ? data.docs : []).map(d =>
    `<button class="reader-btn" data-detail-doc="${h(d.path)}" type="button">${h(d.label)}</button>`
  ).join("");
  host.innerHTML = `
    <div class="orch-head">
      <div>
        <b>${h(data.title || "跨模块同步编排")}</b>
        ${data.purpose ? `<p class="orch-purpose">${h(data.purpose)}</p>` : ""}
      </div>
      <span class="pill">workflow · ADR-0014</span>
    </div>
    ${data.trigger ? `<div class="orch-trigger"><span class="orch-trigger-label">一句话触发</span><code>${h(data.trigger)}</code></div>` : ""}
    <div class="orch-actions">${actionRows}</div>
    ${waveBoxes ? `<div class="orch-waves"><span class="orch-waves-label">执行波次</span>${waveBoxes}</div>` : ""}
    ${docButtons ? `<div class="orch-docs">${docButtons}</div>` : ""}
  `;
  host.querySelectorAll("[data-detail-doc]").forEach(btn => {
    btn.addEventListener("click", () => {
      if(typeof openDocInLibrary === "function") openDocInLibrary(btn.dataset.detailDoc);
    });
  });
}
