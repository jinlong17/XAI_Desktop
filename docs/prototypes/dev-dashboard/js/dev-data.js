// Development-data page (BOUNDARIES.md §4.3): pure git read-outs + trend charts.
// Split out of the former ops-panels.js (P2.2). Plain <script> global — no
// import/export. Depends on globals: devData (state.js), h (utils.js). main.js
// calls renderDevData() (which internally calls renderDevDataTimeView()).
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
