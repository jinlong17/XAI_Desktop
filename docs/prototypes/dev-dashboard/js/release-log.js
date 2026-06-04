// Release-log page (BOUNDARIES.md §4.11). Split out of the former ops-panels.js
// (P2.2). Plain <script> global — no import/export. Depends on globals:
// overallReleases/releaseModules/releaseEntries/releaseRows (state.js),
// serveMode (docs-library.js), renderReleaseModuleTesting/renderReleaseEntryTesting
// (testing.js, guarded by typeof), h/badgeClass (utils.js). main.js calls
// initReleaseLinks(), renderOverallReleases(), renderReleaseModules(), renderReleaseRows().
const SUPPORT_RELEASE_LABELS = {
  "project-system":"Project System"
};

function listItems(items, fallback){
  const values = (items || []).filter(Boolean);
  if(!values.length) return `<ul><li>${h(fallback)}</li></ul>`;
  return `<ul>${values.map(item => `<li>${h(item)}</li>`).join("")}</ul>`;
}

function moduleBadges(keys){
  const values = (keys || []).filter(Boolean);
  if(!values.length) return `<span class="badge b-gray">全项目</span>`;
  return values.map(key => `<span class="badge ${badgeClass(key)}">${h(releaseModuleLabel(key))}</span>`).join("");
}

function compactReleaseText(value, max = 130){
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if(text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function releaseModuleLabel(key){
  const product = typeof productLineFor === "function" ? productLineFor(key) : null;
  return product?.release_title || product?.labels?.release || product?.title || SUPPORT_RELEASE_LABELS[key] || key || "release";
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
      ${typeof renderReleaseModuleTesting === "function" ? renderReleaseModuleTesting(item.key) : ""}
      <div class="release-mini-list">
        ${(item.entries || []).slice(0, 3).map(entry => `<span>${h(entry.date)} · ${h(entry.title)}</span>`).join("") || "<span>暂无相关记录</span>"}
      </div>
      <span class="pill">${h(releaseModuleLabel(item.key))}</span>
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
    module:"project-system",
    related_modules:["project-system"],
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
          ${typeof renderReleaseEntryTesting === "function" ? renderReleaseEntryTesting(entry) : ""}
          ${entry.impact ? `<span class="pill">影响：${h(compactReleaseText(entry.impact, 90))}</span>` : ""}
        </div>
        ${(entry.verification || entry.risk_followup) ? `
          <div class="release-entry-extra">
            ${entry.verification ? `<div class="release-extra-row"><b>验证</b><span>${h(compactReleaseText(entry.verification, 180))}</span></div>` : ""}
            ${entry.risk_followup ? `<div class="release-extra-row"><b>后续</b><span>${h(compactReleaseText(entry.risk_followup, 180))}</span></div>` : ""}
          </div>
        ` : ""}
      </div>
      <span class="badge ${badgeClass(entry.module || entry.type)}">${h(releaseModuleLabel(entry.module) || entry.type || "release")}</span>
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
