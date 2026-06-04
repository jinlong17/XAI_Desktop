const TEST_CATEGORY_LABELS = {
  self_test:"自测",
  unit:"单元",
  e2e:"端到端",
  backend:"后端",
  frontend_page:"页面",
  build:"构建",
  pre_deploy:"部署前",
  regression:"回归"
};

function testCategoryLabel(key){
  return TEST_CATEGORY_LABELS[key] || key;
}

function testingModules(){
  const modules = Array.isArray(testingState.modules) ? testingState.modules : [];
  const order = new Map((products || []).map((item, index) => [item.key, index]));
  return [...modules].sort((a, b) => {
    const ai = order.has(a.key) ? order.get(a.key) : 99;
    const bi = order.has(b.key) ? order.get(b.key) : 99;
    return ai - bi;
  });
}

function testingRecords(){
  const records = Array.isArray(testingState.records) ? testingState.records : [];
  return [...records].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

function testingModuleForKey(key){
  return testingModules().find(item => item.key === key);
}

function testingSummary(){
  const modules = testingModules();
  const counts = modules.reduce((acc, item) => {
    acc[item.status || "unknown"] = (acc[item.status || "unknown"] || 0) + 1;
    return acc;
  }, {});
  return {
    modules,
    counts,
    records: testingRecords(),
    latestDate: testingState.summary?.latest_tested_at || testingRecords()[0]?.date || "未登记",
    overallStatus: testingState.summary?.overall_status || "测试结果待登记",
    failureCount: Number(testingState.summary?.failure_count) || modules.reduce((sum, item) => sum + (Number(item.failure_count) || 0), 0),
    pipelines: Array.isArray(testingState.pipelines) ? testingState.pipelines : [],
    reports: Array.isArray(testingState.report_sources) ? testingState.report_sources : []
  };
}

function renderTestingStatusChips(counts){
  const entries = ["pass", "partial", "fail", "stale", "unknown", "not_run"]
    .filter(status => counts[status])
    .map(status => {
      const meta = testStatusMeta(status);
      return `<span class="badge ${meta.badge}">${h(meta.label)} ${h(String(counts[status]))}</span>`;
    });
  return entries.join("") || `<span class="badge b-gray">暂无模块</span>`;
}

function renderTestCategoryPills(categories){
  const values = Array.isArray(categories) ? categories : [];
  if(!values.length) return `<span class="chip-empty">未登记测试分类</span>`;
  return values.map(item => {
    const status = testStatusMeta(item.status || "unknown");
    return `<span class="test-category-pill ${status.badge}" title="${h(item.detail || "")}">${h(testCategoryLabel(item.key))}</span>`;
  }).join("");
}

function renderTestingMiniFacts(item){
  return `
    <div class="testing-mini-grid">
      <div><b>最近测试</b><span>${h(item.latest_tested_at || "未登记")}</span></div>
      <div><b>失败项</b><span>${h(String(item.failure_count ?? 0))}</span></div>
      <div><b>Pipeline</b><span>${h(item.pipeline_status || "not queried")}</span></div>
      <div><b>耗时</b><span>${h(item.duration || "未登记")}</span></div>
    </div>
  `;
}

function renderTestingModuleCard(item){
  const meta = testStatusMeta(item.status);
  const productMeta = typeof deploymentProductMeta === "function"
    ? deploymentProductMeta(item.key)
    : { title:item.title || item.key, tone:"blue", mark:String(item.key || "?").slice(0, 1).toUpperCase() };
  const record = item.latest_record;
  return `
    <article class="testing-module-card" data-tone="${h(productMeta.tone)}" data-status="${h(item.status || "unknown")}">
      <div class="testing-module-head">
        <span class="testing-module-mark">${h(productMeta.mark)}</span>
        <div>
          <b>${h(item.title || productMeta.title)}</b>
          <span>${h(item.conclusion || "测试结论待登记")}</span>
        </div>
        <span class="badge ${meta.badge}">${h(meta.label)}</span>
      </div>
      ${renderTestingMiniFacts(item)}
      <div class="testing-category-row">${renderTestCategoryPills(item.categories)}</div>
      ${record ? `<div class="testing-latest-record"><b>${h(record.date || "")} · ${h(record.title || "最近记录")}</b><span>${h(record.conclusion || "")}</span></div>` : ""}
      <div class="testing-card-foot">
        <span>${h(item.report_path || "报告入口待登记")}</span>
        <button class="reader-btn" data-testing-product="${h(item.key)}" type="button">模块详情</button>
      </div>
    </article>
  `;
}

function attachTestingActions(root = document){
  root.querySelectorAll("[data-testing-product]").forEach(button => {
    button.addEventListener("click", () => {
      setPage("product-flow");
      setProduct(button.dataset.testingProduct);
    });
  });
  root.querySelectorAll("[data-testing-page]").forEach(button => {
    button.addEventListener("click", () => setPage("testing"));
  });
}

function renderOverviewTesting(){
  const target = document.getElementById("overviewTesting");
  if(!target) return;
  const summary = testingSummary();
  const attention = summary.counts.fail
    ? `${summary.counts.fail} 个模块失败`
    : summary.counts.partial
      ? `${summary.counts.partial} 个模块部分登记`
      : `${summary.counts.pass || 0} 个模块通过`;
  target.innerHTML = `
    <div class="section-head deployment-overview-head">
      <div>
        <h2>测试状态</h2>
        <p class="sub">${h(summary.overallStatus)}</p>
      </div>
      <button class="reader-btn" data-testing-page="testing" type="button">打开测试</button>
    </div>
    <div class="deployment-overview-grid">
      <div><b>最近一次测试</b><strong>${h(summary.latestDate)}</strong><span>${h(testingState.summary?.source || "testing registry")}</span></div>
      <div><b>模块结论</b><strong>${h(attention)}</strong><span>${h(summary.modules.map(item => `${item.title}:${testStatusMeta(item.status).label}`).join(" / "))}</span></div>
      <div><b>失败项数量</b><strong>${h(String(summary.failureCount))}</strong><span>来自模块登记和 release-log verification 派生</span></div>
      <div><b>Pipeline</b><strong>${h(String(summary.pipelines.length))}</strong><span>configured / not queried，不伪造 CI 通过</span></div>
      <div><b>报告入口</b><strong>${h(String(summary.reports.filter(item => item.exists).length))}</strong><span>本地存在 / 已登记报告源</span></div>
    </div>
    <div class="deployment-overview-status">${renderTestingStatusChips(summary.counts)}</div>
  `;
  attachTestingActions(target);
}

function renderOverviewModuleTestingSummary(key){
  const item = testingModuleForKey(key);
  if(!item) return "";
  const meta = testStatusMeta(item.status);
  return `
    <div class="overview-module-testing">
      <span class="badge ${meta.badge}">测试${h(meta.label)}</span>
      <span>${h(item.latest_tested_at || "未登记")} · 失败 ${h(String(item.failure_count ?? 0))}</span>
    </div>
  `;
}

function renderProductTestNavBlock(key){
  const item = testingModuleForKey(key);
  if(!item) return "";
  const meta = testStatusMeta(item.status);
  const record = item.latest_record;
  return `
    <div class="nav-block testing-product-inline">
      <div class="nav-label"><span>测试状态</span><span class="badge ${meta.badge}">${h(meta.label)}</span></div>
      ${renderTestingMiniFacts(item)}
      <div class="testing-category-row">${renderTestCategoryPills(item.categories)}</div>
      <div class="deployment-inline-next">${h(item.conclusion || "测试结论待登记")}</div>
      ${record ? `<div class="testing-latest-record"><b>${h(record.date || "")} · ${h(record.title || "最近测试记录")}</b><span>${h(record.conclusion || "")}</span></div>` : ""}
      <div class="testing-card-foot">
        <span>${h(item.report_path || "报告入口待登记")}</span>
        <button class="reader-btn" data-testing-page="testing" type="button">打开测试</button>
      </div>
    </div>
  `;
}

function renderDeploymentTestingBadge(key){
  const item = testingModuleForKey(key);
  if(!item) return "";
  const meta = testStatusMeta(item.status);
  return `<div class="testing-inline-badge"><b>测试</b><span class="badge ${meta.badge}">${h(meta.label)}</span><em>${h(item.latest_tested_at || "未登记")} · 失败 ${h(String(item.failure_count ?? 0))}</em></div>`;
}

function renderReleaseModuleTesting(key){
  const item = testingModuleForKey(key);
  if(!item) return "";
  const meta = testStatusMeta(item.status);
  return `<div class="release-test-strip"><span class="badge ${meta.badge}">测试${h(meta.label)}</span><span>${h(item.latest_tested_at || "未登记")} · 失败 ${h(String(item.failure_count ?? 0))}</span></div>`;
}

function renderReleaseEntryTesting(entry){
  const status = entry.testing_status || testingModuleForKey(entry.module)?.status || "unknown";
  const meta = testStatusMeta(status);
  return `<span class="pill">测试：${h(meta.label)}</span>`;
}

function renderTestingDashboard(){
  const summary = testingSummary();
  const summaryGrid = document.getElementById("testingSummaryGrid");
  const moduleGrid = document.getElementById("testingModuleGrid");
  const recordList = document.getElementById("testingRecordList");
  const pipelineList = document.getElementById("testingPipelineList");
  const reportList = document.getElementById("testingReportList");
  if(!summaryGrid || !moduleGrid || !recordList || !pipelineList || !reportList) return;

  const overallPill = document.getElementById("testingOverallPill");
  if(overallPill) overallPill.textContent = summary.counts.fail ? "needs attention" : "tracked";

  summaryGrid.innerHTML = `
    <div class="deployment-summary-card deployment-summary-primary">
      <b>测试健康度</b>
      <strong>${h(`${summary.modules.length ? Math.round(((summary.counts.pass || 0) / summary.modules.length) * 100) : 0}%`)}</strong>
      <span>${h(summary.overallStatus)}</span>
      <div class="deployment-overview-status">${renderTestingStatusChips(summary.counts)}</div>
    </div>
    <div class="deployment-summary-card"><b>最近测试时间</b><strong>${h(summary.latestDate)}</strong><span>${h(testingState.summary?.source || "testing registry")}</span></div>
    <div class="deployment-summary-card"><b>通过模块</b><strong>${h(`${summary.counts.pass || 0}/${summary.modules.length}`)}</strong><span>pass / total</span></div>
    <div class="deployment-summary-card"><b>失败项数量</b><strong>${h(String(summary.failureCount))}</strong><span>模块登记 + 记录派生</span></div>
    <div class="deployment-summary-card"><b>Pipeline 状态</b><strong>${h(String(summary.pipelines.length))}</strong><span>configured workflows / local gates</span></div>
  `;

  moduleGrid.innerHTML = summary.modules.length
    ? summary.modules.map(renderTestingModuleCard).join("")
    : `<div class="flow-note"><b>暂无测试模块</b><p style="margin-top:8px">在 <code>dashboard-state.json.testing.modules</code> 中登记。</p></div>`;

  const recordCount = document.getElementById("testingRecordCount");
  if(recordCount) recordCount.textContent = `${summary.records.length} records`;
  recordList.innerHTML = summary.records.length
    ? summary.records.map(record => {
      const meta = testStatusMeta(record.status);
      return `
        <article class="testing-record-row">
          <div class="log-date">${h(record.date || "未登记")}</div>
          <div>
            <b>${h(record.title || "测试记录")}</b>
            <span>${h(record.conclusion || "")}</span>
            <div class="release-entry-meta">
              <span class="pill">${h(record.source || "manual")}</span>
              <span class="pill">${h((record.related_modules || [record.module]).filter(Boolean).join(" / ") || "module pending")}</span>
              <span class="pill">失败 ${h(String(record.failure_count ?? 0))}</span>
              ${record.report_path ? `<span class="pill">${h(record.report_path)}</span>` : ""}
            </div>
          </div>
          <span class="badge ${meta.badge}">${h(meta.label)}</span>
        </article>
      `;
    }).join("")
    : `<div class="flow-note"><b>暂无测试记录</b><p style="margin-top:8px">测试运行后在 release-log Verification 或 testing.records 中登记。</p></div>`;

  pipelineList.innerHTML = summary.pipelines.length
    ? summary.pipelines.map(item => `
      <div class="testing-side-row">
        <b>${h(item.name || item.id || "Pipeline")}</b>
        <span>${h(item.path || "path pending")}</span>
        <span>${h(item.status || "configured")} · ${h(item.last_result || "not queried")}</span>
      </div>
    `).join("")
    : `<div class="flow-note"><b>暂无 Pipeline</b><p style="margin-top:8px">CI 或本地 gate 尚未登记。</p></div>`;

  reportList.innerHTML = summary.reports.length
    ? summary.reports.map(item => `
      <div class="testing-side-row" data-exists="${h(item.exists ? "yes" : "no")}">
        <b>${h(item.label || item.path)}</b>
        <span>${h(item.path || "path pending")}</span>
        <span>${h(item.exists ? "exists" : "not found")} · ${h(item.note || "")}</span>
      </div>
    `).join("")
    : `<div class="flow-note"><b>暂无报告入口</b><p style="margin-top:8px">在 testing.report_sources 中登记。</p></div>`;

  attachTestingActions(document.getElementById("testing"));
}
