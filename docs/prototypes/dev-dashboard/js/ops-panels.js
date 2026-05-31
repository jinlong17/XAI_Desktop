function renderBranches(){
  const policy = dashboardState.branch_policy;
  if(policy?.long_lived_branches?.length){
    const gate = policy.current_gate_status || {};
    const current = policy.current || {};
    const tl = current.gate_timeline || {};
    document.getElementById("branchGrid").innerHTML = `
      <div class="flow-note">
        <b>D3 / merge / release 门控</b>
        <p style="margin-top:8px">D3: ${h(gate.d3 || "manual")} · merge: ${h(gate.merge || "operator-gated")} · release: ${h(gate.release || "operator-gated")}</p>
        <div class="gate-grid">
          <div class="gate-cell"><b>web 最近提交</b><span>${h(tl.web_last_commit || "未知")}</span></div>
          <div class="gate-cell"><b>dev 最近提交</b><span>${h(tl.dev_last_commit || "未知")}</span></div>
          <div class="gate-cell"><b>共同基线</b><span>${h(tl.shared_base || "未知")}</span></div>
          <div class="gate-cell"><b>最近 release tag</b><span>${h(tl.last_release_tag || "（暂无）")}</span></div>
          <div class="gate-cell"><b>web 领先</b><span>${h(String(tl.web_ahead ?? current.web_only ?? 0))} commits</span></div>
          <div class="gate-cell"><b>dev 领先</b><span>${h(String(tl.dev_ahead ?? current.dev_only ?? 0))} commits</span></div>
        </div>
        <p style="margin-top:10px"><span class="badge b-green">${h(current.drift_status || "符合预期")}</span> ${h(tl.reminder || current.drift_note || policy.drift_model)}</p>
      </div>
      ${policy.long_lived_branches.map(item => `
        <div class="branch-row">
          <div class="branch-name">${h(item.name)}</div>
          <div>
            <b>${h(item.target)}</b>
            <span>Allowed: ${h((item.allowed_changes || []).join(" / "))}</span>
            <span>Forbidden: ${h((item.forbidden_changes || []).join(" / "))}</span>
            <span>Upstream: ${h((item.upstream || []).join(", "))} · Downstream: ${h((item.downstream || []).join(", "))}</span>
            <span>Drift: ${h(item.drift_criterion || item.expected_drift)}</span>
          </div>
          <span class="badge b-blue">policy</span>
        </div>
      `).join("")}
    `;
    return;
  }
  document.getElementById("branchGrid").innerHTML = branches.map(([name,desc,status]) => `
    <div class="branch-row">
      <div class="branch-name">${name}</div>
      <div><b>${desc.split("。")[0]}。</b><span>${desc.split("。").slice(1).join("。")}</span></div>
      <span class="badge ${badgeClass(status)}">${status}</span>
    </div>
  `).join("");
}

const releaseModuleLabels = {
  web:"Web 分支",
  app:"App / Mac",
  plugin:"桌面插件",
  sync:"账号云同步",
  site:"官网",
  admin:"Dashboard"
};

function listItems(items, fallback){
  const values = (items || []).filter(Boolean);
  if(!values.length) return `<ul><li>${h(fallback)}</li></ul>`;
  return `<ul>${values.map(item => `<li>${h(item)}</li>`).join("")}</ul>`;
}

function moduleBadges(keys){
  const values = (keys || []).filter(Boolean);
  if(!values.length) return `<span class="badge b-gray">全项目</span>`;
  return values.map(key => `<span class="badge ${badgeClass(key)}">${h(releaseModuleLabels[key] || key)}</span>`).join("");
}

function compactReleaseText(value, max = 130){
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if(text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function renderOverallReleases(){
  const target = document.getElementById("overallReleaseCards");
  const items = overallReleases.length ? overallReleases : [];
  target.innerHTML = items.length ? items.map(item => `
    <article class="release-overall-card">
      <div class="release-card-head">
        <div>
          <b>${h(item.title || "项目阶段更新")}</b>
          <span>${h(item.date || "")} · ${h(item.version_label || "version pending")}</span>
        </div>
        <span class="badge b-blue">release</span>
      </div>
      <p class="release-summary">${h(item.summary || "等待 release-log.md 写入发布摘要。")}</p>
      <div class="release-note-grid">
        <div class="release-note"><b>新增功能</b>${listItems(item.added, "本次未标记新增项")}</div>
        <div class="release-note"><b>优化内容</b>${listItems(item.improved, "本次未标记优化项")}</div>
        <div class="release-note"><b>修复问题</b>${listItems(item.fixed, "本次未标记修复项")}</div>
        <div class="release-note"><b>影响范围</b>${listItems(item.impact, "影响范围待补充")}</div>
      </div>
      <div class="release-entry-meta">${moduleBadges(item.modules)}${item.audience_note ? `<span class="pill">${h(item.audience_note)}</span>` : ""}</div>
    </article>
  `).join("") : `<div class="flow-note"><b>暂无整体发布记录</b><p style="margin-top:8px">运行 <code>node scripts/dashboard/generate-state.mjs</code> 从 release-log.md 生成。</p></div>`;
}

function renderReleaseModules(){
  const target = document.getElementById("releaseModuleCards");
  target.innerHTML = releaseModules.length ? releaseModules.map(item => `
    <article class="release-module-card" data-tone="${h(item.tone || "blue")}">
      <div class="release-module-head">
        <div>
          <b>${h(item.title)}</b>
          <span>${h(item.latest_date || "暂无日期")}</span>
        </div>
        <span class="release-module-count">${h(item.count || 0)} 条</span>
      </div>
      <div>
        <b>${h(item.latest_title || "暂无模块发布")}</b>
        <p>${h(item.latest_summary || "等待 release-log.md 写入该模块的发布说明。")}</p>
      </div>
      <div class="release-mini-list">
        ${(item.entries || []).slice(0, 3).map(entry => `<span>${h(entry.date)} · ${h(entry.title)}</span>`).join("") || "<span>暂无相关记录</span>"}
      </div>
      <span class="pill">${h(releaseModuleLabels[item.key] || item.key)}</span>
    </article>
  `).join("") : `<div class="flow-note"><b>暂无模块发布卡片</b><p style="margin-top:8px">运行 <code>node scripts/dashboard/generate-state.mjs</code> 生成结构化发布数据。</p></div>`;
}

function renderReleaseRows(){
  const target = document.getElementById("releaseRows");
  const entries = releaseEntries.length ? releaseEntries : releaseRows.map(([date,title,summary,type]) => ({
    date,
    title,
    summary,
    type,
    module:"admin",
    related_modules:["admin"],
    version_label:`snapshot ${date}`
  }));
  target.innerHTML = entries.length ? entries.map(entry => `
    <article class="release-entry-row">
      <div class="log-date">${h(entry.date)}</div>
      <div>
        <b>${h(entry.title)}</b>
        <span>${h(entry.summary || entry.user_visible || "")}</span>
        <div class="release-entry-meta">
          <span class="pill">${h(entry.version_label || "version pending")}</span>
          ${entry.impact ? `<span class="pill">影响：${h(compactReleaseText(entry.impact, 90))}</span>` : ""}
        </div>
        ${(entry.verification || entry.risk_followup) ? `
          <div class="release-entry-extra">
            ${entry.verification ? `<div class="release-extra-row"><b>验证</b><span>${h(compactReleaseText(entry.verification, 180))}</span></div>` : ""}
            ${entry.risk_followup ? `<div class="release-extra-row"><b>后续</b><span>${h(compactReleaseText(entry.risk_followup, 180))}</span></div>` : ""}
          </div>
        ` : ""}
      </div>
      <span class="badge ${badgeClass(entry.module || entry.type)}">${h(releaseModuleLabels[entry.module] || entry.type || "release")}</span>
    </article>
  `).join("") : `<div class="flow-note"><b>暂无发布记录</b><p style="margin-top:8px">运行 <code>node scripts/dashboard/generate-state.mjs</code> 从 release-log.md 生成。</p></div>`;
}

function initReleaseLinks(){
  const link = document.getElementById("releaseLogOpenLink");
  if(!link) return;
  const path = link.dataset.releaseLogPath || "docs/workflow/project/release-log.md";
  if(serveMode){
    link.href = `/api/raw?path=${encodeURIComponent(path)}`;
  }
}

function renderDevData(){
  const numstat = devData.today_numstat || {};
  const docCode = devData.doc_vs_code || {};
  const cards = [
    ["今日 commit", devData.today_commits ?? 0, "git log --all --since=midnight"],
    ["7 日 commit", devData.seven_day_commits ?? 0, "git log --all --since='7 days ago'"],
    ["今日增删行", `+${numstat.added || 0} / -${numstat.deleted || 0}`, `${numstat.files || 0} files`],
    ["未提交文件", devData.uncommitted_files ?? 0, "git status --short"],
    ["文档/代码比", docCode.ratio ?? "n/a", `${docCode.docs_lines || 0} docs lines / ${docCode.code_lines || 0} code lines`],
    ["skill 变更", devData.skill_change_commits ?? 0, "近 7 日 skill/agent commit"]
  ];
  document.getElementById("devDataCards").innerHTML = cards.map(([label, value, note]) => `
    <div class="data-card"><b>${h(label)}</b><strong>${h(value)}</strong><span>${h(note)}</span></div>
  `).join("");

  const trend = devData.seven_day_trend || [];
  const max = Math.max(1, ...trend.map(item => Number(item.commits) || 0));
  document.getElementById("trendList").innerHTML = trend.map(item => `
    <div class="trend-row">
      <span>${h(item.date)}</span>
      <div class="trend-bar"><span style="width:${Math.max(3, Math.round(((Number(item.commits) || 0) / max) * 100))}%"></span></div>
      <b>${h(item.commits || 0)}</b>
    </div>
  `).join("");

  const dirs = devData.directory_changes || {};
  const dirOrder = ["docs", "apps/web", "apps/desktop", ".teams/skills", "other"];
  document.getElementById("dirList").innerHTML = dirOrder.map(key => {
    const item = dirs[key] || {added:0, deleted:0, files:0};
    return `
      <div class="dir-row">
        <b>${h(key)}</b>
        <span>+${h(item.added)} / -${h(item.deleted)}</span>
        <span>${h(item.files)} files</span>
      </div>
    `;
  }).join("");

  const branches = devData.branch_recent_commits || [];
  document.getElementById("branchCommitList").innerHTML = branches.map(item => `
    <div class="branch-commit">
      <b>${h(item.name)}</b>
      <span>${h(item.subject)}</span>
      <span>${h(item.commit)} · ${h(item.date)}</span>
    </div>
  `).join("");
}

function renderTaskProgress(){
  const tp = dashboardState.task_progress || {items:[], counts:{}, source_count:0, shipped:0};
  document.getElementById("taskCountPill").textContent = `${tp.source_count} dev_log`;
  document.getElementById("taskCounts").innerHTML = statusChips(tp.counts);
  const items = tp.items || [];
  const active = items.filter(item => item.status !== "SHIPPED");
  const shipped = items.length - active.length;
  const rows = active.map(item => `
    <button class="task-row" data-task-doc="${h(item.path)}" type="button">
      <span class="badge ${STATUS_TONE[item.status] || "b-gray"}">${h(STATUS_LABELS[item.status] || item.status)}</span>
      <div class="task-main"><b>${h(item.feature)}</b><span>${h(item.package)}${item.updated ? " · " + h(item.updated) : ""}</span></div>
      <span class="task-open">打开 dev_log →</span>
    </button>
  `).join("");
  document.getElementById("taskList").innerHTML =
    (rows || `<div class="flow-note"><b>没有待处理任务</b><p style="margin-top:6px">所有 dev_log 都在已发布/归档状态。</p></div>`) +
    `<div class="flow-note" style="margin-top:10px"><b>${h(String(shipped))} 个已发布 / 归档</b><p style="margin-top:6px">已隐藏，避免淹没需要关注的任务。</p></div>`;
  document.querySelectorAll("#taskList [data-task-doc]").forEach(btn =>
    btn.addEventListener("click", () => openDocInLibrary(btn.dataset.taskDoc)));
}
