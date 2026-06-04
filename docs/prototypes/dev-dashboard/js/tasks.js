// Task-progress page (BOUNDARIES.md §4.2). Split out of the former ops-panels.js
// (P2.2). Plain <script> global — no import/export. Depends on globals:
// dashboardState (state.generated.js), statusChips/STATUS_TONE/STATUS_LABELS/h
// (utils.js), openDocInLibrary (docs-library.js). main.js calls renderTaskProgress().
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
