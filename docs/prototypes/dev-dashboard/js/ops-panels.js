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

const DEV_DATA_VIEW_STORAGE_KEY = "xai-dev-dashboard.devDataView.v1";
const DEV_DATA_VIEWS = [
  {key:"today", label:"今日"},
  {key:"seven_day", label:"最近 7 天"},
  {key:"weekly", label:"按周"},
  {key:"monthly", label:"按月"}
];
const DEV_DIR_ORDER = ["docs", "apps/web", "apps/desktop", ".teams/skills", "other"];

function asNumber(value){
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function latestItem(items){
  return (items || []).length ? items[items.length - 1] : null;
}

function previousItem(items){
  return (items || []).length > 1 ? items[items.length - 2] : null;
}

function signedDelta(value){
  const number = asNumber(value);
  if(number > 0) return `+${number}`;
  return String(number);
}

function activeRate(item){
  if(!item || !asNumber(item.total_days)) return "0%";
  return `${Math.round((asNumber(item.active_days) / asNumber(item.total_days)) * 100)}%`;
}

function periodRange(item){
  if(!item) return "暂无周期";
  const suffix = item.is_current ? " · 当前周期" : "";
  return `${item.start_date} 至 ${item.end_date}${suffix}`;
}

function readDevDataView(){
  try {
    const stored = localStorage.getItem(DEV_DATA_VIEW_STORAGE_KEY);
    if(DEV_DATA_VIEWS.some(item => item.key === stored)) return stored;
  } catch (error) {
    // localStorage may be unavailable in some static previews.
  }
  return "weekly";
}

function writeDevDataView(key){
  try {
    localStorage.setItem(DEV_DATA_VIEW_STORAGE_KEY, key);
  } catch (error) {
    // Ignore storage failures; the tab still changes for the current render.
  }
}

function renderDevSummaryCards(cards){
  return cards.map(([label, value, note]) => `
    <div class="data-card"><b>${h(label)}</b><strong>${h(value)}</strong><span>${h(note)}</span></div>
  `).join("");
}

function renderDevDataTabs(activeKey){
  const target = document.getElementById("devTimeTabs");
  if(!target) return;
  target.innerHTML = DEV_DATA_VIEWS.map(item => `
    <button class="dev-time-tab" type="button" role="tab" aria-selected="${item.key === activeKey ? "true" : "false"}" data-dev-time-view="${h(item.key)}">${h(item.label)}</button>
  `).join("");
  target.querySelectorAll("[data-dev-time-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.devTimeView;
      writeDevDataView(key);
      renderDevDataTimeView(key);
    });
  });
}

function barHeight(value, max){
  const number = asNumber(value);
  if(number <= 0) return 0;
  return Math.max(8, Math.round((number / Math.max(1, max)) * 100));
}

function chartLabel(item){
  return item.label || (item.date ? item.date.slice(5) : item.start_date || "");
}

function renderDevBarChart({title, subtitle, items, valueKey, unit = "", tone = "commit", note}){
  const rows = items || [];
  if(!rows.length){
    return `<article class="dev-chart-card"><div class="flow-note"><b>${h(title)}</b><p style="margin-top:6px">等待生成数据。</p></div></article>`;
  }
  const max = Math.max(1, ...rows.map(item => asNumber(item[valueKey])));
  return `
    <article class="dev-chart-card">
      <div class="dev-chart-head">
        <div><b>${h(title)}</b><span>${h(subtitle)}</span></div>
        <strong>${h(String(max))}${h(unit)}</strong>
      </div>
      <div class="dev-bar-chart tone-${h(tone)}">
        ${rows.map(item => {
          const value = asNumber(item[valueKey]);
          const height = barHeight(value, max);
          const itemNote = typeof note === "function" ? note(item) : "";
          return `
            <div class="dev-bar-column">
              <div class="dev-bar-track"><span style="height:${height}%"></span></div>
              <b>${h(String(value))}${h(unit)}</b>
              <span>${h(chartLabel(item))}</span>
              <em>${h(itemNote)}</em>
            </div>
          `;
        }).join("")}
      </div>
    </article>
  `;
}

function directoryChartItems(){
  const dirs = devData.directory_changes || {};
  return DEV_DIR_ORDER.map(key => {
    const item = dirs[key] || {added:0, deleted:0, files:0};
    return {
      label:key,
      lines: asNumber(item.added) + asNumber(item.deleted),
      added: asNumber(item.added),
      deleted: asNumber(item.deleted),
      files: asNumber(item.files)
    };
  });
}

function sevenDayActivityItems(){
  return (devData.seven_day_trend || []).map(item => ({
    ...item,
    label: item.date ? item.date.slice(5) : item.label,
    active: asNumber(item.commits) > 0 ? 1 : 0
  }));
}

function periodSummaryCards(items, noun){
  const current = latestItem(items);
  const previous = previousItem(items);
  const peak = Math.max(0, ...(items || []).map(item => asNumber(item.commits)));
  const delta = current && previous ? asNumber(current.commits) - asNumber(previous.commits) : 0;
  return [
    [`本${noun} commit`, current?.commits ?? 0, periodRange(current)],
    [`较上${noun}`, signedDelta(delta), previous ? `上${noun} ${previous.commits || 0} commit` : "暂无上一周期"],
    [`本${noun}活跃度`, `${current?.active_days ?? 0}/${current?.total_days ?? 0} 天`, activeRate(current)],
    [`近${items?.length || 0}${noun}峰值`, peak, "commit count peak"]
  ];
}

function renderDevDataTimeView(activeKey = readDevDataView()){
  const key = DEV_DATA_VIEWS.some(item => item.key === activeKey) ? activeKey : "weekly";
  renderDevDataTabs(key);
  const summaryTarget = document.getElementById("devTimeSummary");
  const chartTarget = document.getElementById("devChartGrid");
  if(!summaryTarget || !chartTarget) return;

  const trend = devData.seven_day_trend || [];
  const weekly = devData.weekly_stats || [];
  const monthly = devData.monthly_stats || [];
  const activeDays = trend.filter(item => asNumber(item.commits) > 0).length;
  const peakDay = Math.max(0, ...trend.map(item => asNumber(item.commits)));
  const numstat = devData.today_numstat || {};

  if(key === "today"){
    const dirItems = directoryChartItems();
    summaryTarget.innerHTML = renderDevSummaryCards([
      ["今日 commit", devData.today_commits ?? 0, "git log --all --since=midnight"],
      ["今日增删行", `+${numstat.added || 0} / -${numstat.deleted || 0}`, `${numstat.files || 0} files`],
      ["今日目录桶", dirItems.filter(item => item.lines > 0).length, "docs / apps / skills / other"],
      ["未提交文件", devData.uncommitted_files ?? 0, "git status --short"]
    ]);
    chartTarget.innerHTML = [
      renderDevBarChart({
        title:"今日目录改动",
        subtitle:"按目录桶展示增删行总量",
        items:dirItems,
        valueKey:"lines",
        unit:" 行",
        tone:"change",
        note:item => `+${item.added} / -${item.deleted} · ${item.files} files`
      }),
      renderDevBarChart({
        title:"最近 7 天 commit 参照",
        subtitle:"今日读数放在 7 日节奏中对比",
        items:trend.map(item => ({...item, label:item.date ? item.date.slice(5) : item.label})),
        valueKey:"commits",
        tone:"commit",
        note:item => item.date || ""
      })
    ].join("");
    return;
  }

  if(key === "seven_day"){
    summaryTarget.innerHTML = renderDevSummaryCards([
      ["7 日 commit", devData.seven_day_commits ?? 0, "all refs · rolling window"],
      ["活跃天数", `${activeDays}/7 天`, `${Math.round((activeDays / 7) * 100)}% active`],
      ["单日峰值", peakDay, "max commits/day"],
      ["最近 push", devData.recent_push_time || "未知", "origin current branch"]
    ]);
    chartTarget.innerHTML = [
      renderDevBarChart({
        title:"7 日 commit 趋势",
        subtitle:"按自然日统计 commit 数",
        items:trend.map(item => ({...item, label:item.date ? item.date.slice(5) : item.label})),
        valueKey:"commits",
        tone:"commit",
        note:item => item.date || ""
      }),
      renderDevBarChart({
        title:"7 日活跃度趋势",
        subtitle:"每天是否产生 commit",
        items:sevenDayActivityItems(),
        valueKey:"active",
        tone:"active",
        note:item => asNumber(item.commits) > 0 ? `${item.commits} commit` : "quiet"
      })
    ].join("");
    return;
  }

  if(key === "monthly"){
    summaryTarget.innerHTML = renderDevSummaryCards(periodSummaryCards(monthly, "月"));
    chartTarget.innerHTML = [
      renderDevBarChart({
        title:"月 commit 数对比",
        subtitle:"最近 6 个月 · all refs",
        items:monthly,
        valueKey:"commits",
        tone:"commit",
        note:item => periodRange(item)
      }),
      renderDevBarChart({
        title:"月开发活跃度趋势",
        subtitle:"每月有 commit 的自然日数",
        items:monthly,
        valueKey:"active_days",
        unit:" 天",
        tone:"active",
        note:item => `${item.active_days || 0}/${item.total_days || 0} 天 · ${activeRate(item)}`
      })
    ].join("");
    return;
  }

  summaryTarget.innerHTML = renderDevSummaryCards(periodSummaryCards(weekly, "周"));
  chartTarget.innerHTML = [
    renderDevBarChart({
      title:"周 commit 数对比",
      subtitle:"最近 8 周 · all refs",
      items:weekly,
      valueKey:"commits",
      tone:"commit",
      note:item => periodRange(item)
    }),
    renderDevBarChart({
      title:"周开发活跃度趋势",
      subtitle:"每周有 commit 的自然日数",
      items:weekly,
      valueKey:"active_days",
      unit:" 天",
      tone:"active",
      note:item => `${item.active_days || 0}/${item.total_days || 0} 天 · ${activeRate(item)}`
    })
  ].join("");
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

  renderDevDataTimeView();

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
