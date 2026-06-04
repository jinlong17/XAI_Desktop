function deploymentProductMeta(key){
  const product = typeof productLineFor === "function" ? productLineFor(key) : null;
  return {
    title: product?.deployment_title || product?.labels?.deployment || product?.title || key || "模块",
    tone: product?.tone || product?.visual?.tone || "blue",
    mark: product?.icon || product?.visual?.icon || String(key || "?").slice(0, 1).toUpperCase()
  };
}

function deploymentModules(){
  const modules = Array.isArray(deploymentState.modules) ? deploymentState.modules : [];
  const order = new Map((products || []).map((item, index) => [item.key, index]));
  return [...modules].sort((a, b) => {
    const ai = order.has(a.key) ? order.get(a.key) : 99;
    const bi = order.has(b.key) ? order.get(b.key) : 99;
    return ai - bi;
  });
}

function deploymentRecords(){
  const records = Array.isArray(deploymentState.records) ? deploymentState.records : [];
  return [...records].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

function deploymentModuleForKey(key){
  return deploymentModules().find(item => item.key === key);
}

function deploymentProgress(value){
  const progress = Number(value);
  if(!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

function deploymentIssueCount(modules){
  return modules.reduce((count, item) => count + (Array.isArray(item.issues) ? item.issues.length : 0), 0);
}

function deploymentAnomalyModules(modules){
  return modules.filter(item => item.status === "failed" || item.status === "rollback" || (item.issues || []).some(issue => issue.severity === "error"));
}

function deploymentStatusCounts(modules){
  return modules.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});
}

function deploymentLatestDate(modules, records){
  const summaryDate = deploymentState.summary?.latest_deployed_at;
  if(summaryDate) return summaryDate;
  const dates = [
    ...modules.map(item => item.last_deployed_at),
    ...records.map(item => item.date)
  ].filter(Boolean).sort().reverse();
  return dates[0] || "未登记";
}

function deploymentSummary(){
  const modules = deploymentModules();
  const records = deploymentRecords();
  const counts = deploymentStatusCounts(modules);
  const deployed = counts.deployed || 0;
  const pending = modules.length - deployed;
  const anomalies = deploymentAnomalyModules(modules);
  const issueCount = deploymentIssueCount(modules);
  const avgProgress = modules.length
    ? Math.round(modules.reduce((sum, item) => sum + deploymentProgress(item.progress), 0) / modules.length)
    : 0;
  return {
    modules,
    records,
    counts,
    deployed,
    pending,
    issueCount,
    anomalies,
    avgProgress,
    latestDate: deploymentLatestDate(modules, records),
    onlineVersion: deploymentState.summary?.current_online_version || "未登记线上版本",
    overallStatus: deploymentState.summary?.overall_status || "部署状态待登记"
  };
}

function deploymentFlow(){
  return deploymentState.flow || {
    title:"部署流程待登记",
    summary:"在 dashboard-state.json 的 deployment.flow 中登记部署目标、步骤、涉及文件和上线 gate。",
    targets:[],
    steps:[],
    assets:[],
    gates:[]
  };
}

function renderDeploymentStatusChips(counts){
  const entries = ["deployed", "ready", "deploying", "not_deployed", "failed", "rollback"]
    .filter(status => counts[status])
    .map(status => {
      const meta = deploymentStatusMeta(status);
      return `<span class="badge ${meta.badge}">${h(meta.label)} ${h(String(counts[status]))}</span>`;
    });
  return entries.join("") || `<span class="badge b-gray">暂无模块</span>`;
}

function renderDeploymentModuleCard(item){
  const productMeta = deploymentProductMeta(item.key);
  const statusMeta = deploymentStatusMeta(item.status);
  const progress = deploymentProgress(item.progress);
  const issues = Array.isArray(item.issues) ? item.issues : [];
  return `
    <article class="deployment-module-card" data-tone="${h(productMeta.tone)}" data-status="${h(item.status || "pending")}">
      <div class="deployment-module-head">
        <span class="deployment-module-mark">${h(productMeta.mark)}</span>
        <div>
          <b>${h(item.title || productMeta.title)}</b>
          <span>${h(item.target || "部署目标待登记")}</span>
        </div>
        <span class="badge ${statusMeta.badge}">${h(statusMeta.label)}</span>
      </div>
      <div class="deployment-progress">
        <div><span>部署进度</span><b>${h(String(progress))}%</b></div>
        <span class="deployment-progress-track"><i style="width:${progress}%"></i></span>
      </div>
      <div class="deployment-fact-grid">
        <div><b>环境</b><span>${h(item.environment || "未登记")}</span></div>
        <div><b>最近部署</b><span>${h(item.last_deployed_at || "未登记")}</span></div>
        <div><b>版本</b><span>${h(item.version || "未登记")}</span></div>
        <div><b>平台</b><span>${h(item.platform || "未登记")}</span></div>
      </div>
      ${typeof renderDeploymentTestingBadge === "function" ? renderDeploymentTestingBadge(item.key) : ""}
      <div class="deployment-next">
        <b>下一步</b>
        <span>${h(item.next || "等待部署计划")}</span>
      </div>
      <div class="deployment-card-foot">
        <span>${h(item.branch || "branch 待登记")}</span>
        <button class="reader-btn" data-deployment-product="${h(item.key)}" type="button">产品详情</button>
      </div>
      ${issues.length ? `<div class="deployment-mini-issues">${issues.slice(0, 2).map(issue => `<span>${h(issue.text)}</span>`).join("")}</div>` : ""}
    </article>
  `;
}

function renderDeploymentFlowBoard(){
  const target = document.getElementById("deploymentFlowBoard");
  if(!target) return;
  const flow = deploymentFlow();
  target.innerHTML = `
    <div class="deployment-flow-hero">
      <div>
        <b>${h(flow.title || "部署流程")}</b>
        <span>${h(flow.summary || "部署流程待补充。")}</span>
      </div>
      <div class="deployment-target-grid">
        ${(flow.targets || []).map(item => `
          <div class="deployment-target-card">
            <b>${h(item.label || "Target")}</b>
            <strong>${h(item.destination || "destination pending")}</strong>
            <span>${h(item.trigger || "trigger pending")} · ${h(item.branch || "branch pending")}</span>
            <em>${h(item.output || "output pending")}</em>
          </div>
        `).join("") || `<div class="deployment-target-card"><b>Target</b><strong>待登记</strong><span>trigger pending</span></div>`}
      </div>
    </div>
    <div class="deployment-flow-steps">
      ${(flow.steps || []).map((step, index) => `
        <div class="deployment-flow-step">
          <span>${h(String(index + 1).padStart(2, "0"))}</span>
          <div>
            <b>${h(step.label || "步骤")}</b>
            <p>${h(step.detail || "步骤说明待补充。")}</p>
            <em>${h(step.owner || "owner pending")}</em>
          </div>
        </div>
      `).join("") || `<div class="flow-note"><b>暂无流程步骤</b><p style="margin-top:8px">在 deployment.flow.steps 中登记。</p></div>`}
    </div>
    <div class="deployment-flow-bottom">
      <div>
        <h3>涉及文件 / 配置</h3>
        <div class="deployment-asset-list">
          ${(flow.assets || []).map(asset => `
            <div class="deployment-asset-row">
              <b>${h(asset.label || "资产")}</b>
              <code>${h(asset.path || "path pending")}</code>
              <span>${h(asset.note || "说明待补充。")}</span>
            </div>
          `).join("") || `<div class="flow-note"><b>暂无涉及文件</b><p style="margin-top:8px">在 deployment.flow.assets 中登记。</p></div>`}
        </div>
      </div>
      <div>
        <h3>上线前 Gate</h3>
        <div class="deployment-gate-list">
          ${(flow.gates || []).map((gate, index) => `
            <div class="deployment-gate-row">
              <span>${h(String(index + 1))}</span>
              <b>${h(gate)}</b>
            </div>
          `).join("") || `<div class="flow-note"><b>暂无上线 gate</b><p style="margin-top:8px">在 deployment.flow.gates 中登记。</p></div>`}
        </div>
      </div>
    </div>
  `;
}

function renderDeploymentRecord(record){
  const meta = deploymentStatusMeta(record.status);
  const productMeta = deploymentProductMeta(record.module);
  return `
    <article class="deployment-record-row" data-tone="${h(productMeta.tone)}">
      <div class="deployment-record-date">${h(record.date || "未登记")}</div>
      <div>
        <b>${h(record.module_title || productMeta.title)}</b>
        <span>${h(record.summary || "部署说明待补充")}</span>
        <div class="deployment-record-meta">
          <span class="pill">${h(record.environment || "env pending")}</span>
          <span class="pill">${h(record.platform || "platform pending")}</span>
          <span class="pill">${h(record.version || "version pending")}</span>
          ${typeof renderReleaseEntryTesting === "function" ? renderReleaseEntryTesting({ module:record.module, testing_status:record.testing_status }) : ""}
          ${record.target ? `<span class="pill">${h(record.target)}</span>` : ""}
          ${record.commit ? `<span class="pill">${h(record.commit)}</span>` : ""}
        </div>
      </div>
      <span class="badge ${meta.badge}">${h(meta.label)}</span>
    </article>
  `;
}

function attachDeploymentActions(root = document){
  root.querySelectorAll("[data-deployment-product]").forEach(button => {
    button.addEventListener("click", () => {
      setPage("product-flow");
      setProduct(button.dataset.deploymentProduct);
    });
  });
  root.querySelectorAll("[data-deployment-page]").forEach(button => {
    button.addEventListener("click", () => setPage("deployment"));
  });
}

function renderOverviewDeployment(){
  const target = document.getElementById("overviewDeployment");
  if(!target) return;
  const summary = deploymentSummary();
  const anomalyText = summary.anomalies.length
    ? `${summary.anomalies.length} 个异常`
    : `无失败/回滚 · ${summary.issueCount} 待处理`;
  target.innerHTML = `
    <div class="section-head deployment-overview-head">
      <div>
        <h2>部署状态</h2>
        <p class="sub">${h(summary.overallStatus)}</p>
      </div>
      <button class="reader-btn" data-deployment-page="deployment" type="button">打开部署</button>
    </div>
    <div class="deployment-overview-grid">
      <div><b>最近一次部署</b><strong>${h(summary.latestDate)}</strong><span>来自部署记录或模块最近部署时间</span></div>
      <div><b>当前线上版本</b><strong>${h(summary.onlineVersion)}</strong><span>云端版本统一登记</span></div>
      <div><b>已部署模块</b><strong>${h(`${summary.deployed}/${summary.modules.length}`)}</strong><span>${h(summary.modules.filter(item => item.status === "deployed").map(item => item.title).join("、") || "暂无已登记云端部署")}</span></div>
      <div><b>待部署模块</b><strong>${h(String(summary.pending))}</strong><span>${h(summary.modules.filter(item => item.status !== "deployed").map(item => item.title).join("、") || "无")}</span></div>
      <div><b>部署异常</b><strong>${h(anomalyText)}</strong><span>${h(summary.anomalies.map(item => item.title).join("、") || "当前没有失败或回滚状态")}</span></div>
    </div>
    <div class="deployment-overview-status">${renderDeploymentStatusChips(summary.counts)}</div>
  `;
  attachDeploymentActions(target);
}

function renderDeploymentDashboard(){
  const summary = deploymentSummary();
  const summaryGrid = document.getElementById("deploymentSummaryGrid");
  const moduleGrid = document.getElementById("deploymentModuleGrid");
  const recordList = document.getElementById("deploymentRecordList");
  const envList = document.getElementById("deploymentEnvironmentList");
  const issueList = document.getElementById("deploymentIssueList");
  if(!summaryGrid || !moduleGrid || !recordList || !envList || !issueList) return;

  const overallPill = document.getElementById("deploymentOverallPill");
  if(overallPill) overallPill.textContent = summary.anomalies.length ? "needs attention" : "tracked";

  summaryGrid.innerHTML = `
    <div class="deployment-summary-card deployment-summary-primary">
      <b>整体进度</b>
      <strong>${h(String(summary.avgProgress))}%</strong>
      <span>${h(summary.overallStatus)}</span>
      <div class="deployment-overview-status">${renderDeploymentStatusChips(summary.counts)}</div>
    </div>
    <div class="deployment-summary-card"><b>最近部署时间</b><strong>${h(summary.latestDate)}</strong><span>${h(deploymentState.summary?.source || "manual registry")}</span></div>
    <div class="deployment-summary-card"><b>当前线上版本</b><strong>${h(summary.onlineVersion)}</strong><span>${h(deploymentState.summary?.default_environment || "production / preview")}</span></div>
    <div class="deployment-summary-card"><b>模块状态</b><strong>${h(`${summary.deployed}/${summary.modules.length}`)}</strong><span>已部署 / 总模块数</span></div>
    <div class="deployment-summary-card"><b>异常与待处理</b><strong>${h(`${summary.anomalies.length}/${summary.issueCount}`)}</strong><span>失败或回滚 / 全部待处理项</span></div>
  `;

  renderDeploymentFlowBoard();

  moduleGrid.innerHTML = summary.modules.length
    ? summary.modules.map(renderDeploymentModuleCard).join("")
    : `<div class="flow-note"><b>暂无部署模块</b><p style="margin-top:8px">在 <code>docs/workflow/project/dashboard-state.json</code> 的 <code>deployment.modules</code> 中登记。</p></div>`;

  const recordCount = document.getElementById("deploymentRecordCount");
  if(recordCount) recordCount.textContent = `${summary.records.length} records`;
  recordList.innerHTML = summary.records.length
    ? summary.records.map(renderDeploymentRecord).join("")
    : `<div class="flow-note"><b>暂无部署记录</b><p style="margin-top:8px">首次云端部署后在 deployment.records 中登记模块、环境、平台、版本和结果。</p></div>`;

  // BOUNDARIES.md §4.6-E: the module fact-grid (card C) is the env Owner. The
  // side aside must NOT restate every module's env — only surface modules whose
  // status is non-nominal (anything but "deployed") or that carry an issue, so
  // it reads as a pre-launch anomaly/diff checklist, not a second env table.
  const anomalyKeys = new Set(summary.anomalies.map(item => item.key));
  const envAttention = summary.modules.filter(item =>
    item.status !== "deployed" || anomalyKeys.has(item.key) || (item.issues || []).length
  );
  envList.innerHTML = envAttention.length
    ? envAttention.map(item => {
        const meta = deploymentProductMeta(item.key);
        const status = deploymentStatusMeta(item.status);
        return `
      <div class="deployment-env-row" data-tone="${h(meta.tone)}" data-status="${h(item.status || "pending")}">
        <b>${h(item.title || meta.title)}</b>
        <span>${h(item.environment || "env pending")}</span>
        <span>${h(item.platform || "platform pending")}</span>
        <span class="badge ${status.badge}">${h(status.label)}</span>
      </div>
    `;
      }).join("")
    : `<div class="flow-note"><b>全部模块部署正常</b><p style="margin-top:8px">所有模块均为已部署状态且无待处理项；完整环境/平台/版本见上方模块部署卡。</p></div>`;

  const issues = summary.modules.flatMap(item => (item.issues || []).map(issue => ({...issue, module:item.title, key:item.key})));
  issueList.innerHTML = issues.length
    ? issues.map(issue => `
      <div class="deployment-issue-row" data-severity="${h(issue.severity || "pending")}">
        <b>${h(issue.module)}</b>
        <span>${h(issue.text)}</span>
      </div>
    `).join("")
    : `<div class="flow-note"><b>没有待处理部署问题</b><p style="margin-top:8px">当前没有失败、回滚或待登记项。</p></div>`;

  attachDeploymentActions(document.getElementById("deployment"));
}

function renderProductDeploymentNavBlock(key){
  const item = deploymentModuleForKey(key);
  if(!item) return "";
  const status = deploymentStatusMeta(item.status);
  return `
    <div class="nav-block deployment-product-inline">
      <div class="nav-label"><span>部署状态</span><span class="badge ${status.badge}">${h(status.label)}</span></div>
      <div class="deployment-inline-grid">
        <div><b>环境</b><span>${h(item.environment || "未登记")}</span></div>
        <div><b>版本</b><span>${h(item.version || "未登记")}</span></div>
        <div><b>平台</b><span>${h(item.platform || "未登记")}</span></div>
        <div><b>最近部署</b><span>${h(item.last_deployed_at || "未登记")}</span></div>
      </div>
      <div class="deployment-inline-next">${h(item.next || "等待部署计划")}</div>
    </div>
  `;
}
