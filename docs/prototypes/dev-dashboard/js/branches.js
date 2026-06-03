// Branch-management page (BOUNDARIES.md §4.4). Split out of the former
// ops-panels.js (P2.2) so each page owns one file. Plain <script> global —
// no import/export. Depends on globals: dashboardState (state.generated.js),
// branches (state.js), h/badgeClass (utils.js). main.js calls renderBranches().
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
