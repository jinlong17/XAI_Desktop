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
    ["Control Plane", "Admin"],
    ["项目系统区", "Site / release / workflow"]
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

function fallbackCopy(text, done){
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand("copy"); } catch (err) { /* ignore */ }
  document.body.removeChild(ta);
  if(done) done();
}

function copyText(text, btn){
  const done = () => {
    if(!btn) return;
    const old = btn.textContent;
    btn.textContent = "已复制";
    setTimeout(() => { btn.textContent = old; }, 1400);
  };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
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

function setProduct(key){
  const item = products.find(product => product.key === key);
  if(!item) return;
  const productTarget = overviewTargetFor(item.key, item.key === "admin" ? "打开 Admin 原型" : "打开入口");
  const deploymentBlock = typeof renderProductDeploymentNavBlock === "function" ? renderProductDeploymentNavBlock(key) : "";
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
    <div class="detail-grid">
      <div class="detail-metric"><b>模块状态</b><span>${h(String(item.status).split(" · ")[0])}</span></div>
      <div class="detail-metric"><b>推荐 branch</b><span>${h(item.branch)}</span></div>
      <div class="detail-metric"><b>关键依赖</b><span>${h(item.dependency)}</span></div>
      <div class="detail-metric is-wide"><b>真实计数</b><div class="chip-row">${statusChips(item.status_counts)}</div></div>
    </div>
    ${deploymentBlock}
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
}
