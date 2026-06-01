const usageOpsState = {
  busy:false,
  lastLogText:"",
  pollTimer:null,
  target:null
};

function usageOpsEl(id){
  return document.getElementById(id);
}

function usageOpsStatusBadge(state, managed){
  if(state === "running") return managed ? "b-green" : "b-cyan";
  if(state === "starting") return "b-yellow";
  if(state === "stopped") return "b-gray";
  return "b-red";
}

function usageOpsStatusText(target){
  if(!target) return "unavailable";
  if(target.state === "running") return target.managed ? "running" : "external";
  if(target.state === "starting") return "starting";
  if(target.state === "stopped") return "stopped";
  return target.state || "unknown";
}

function usageOpsSummary(target){
  if(!target) return "本地 ops API 暂不可用。请确认通过 pnpm dashboard:serve 打开看板。";
  if(target.state === "running" && target.managed){
    return `${target.label} 正在由看板启动运行，PID ${target.pid || "unknown"}。`;
  }
  if(target.state === "running"){
    return `${target.label} 的 ${target.port} 端口已有进程监听；看板不会接管外部进程。`;
  }
  if(target.state === "starting"){
    return `${target.label} 正在启动，等待 ${target.port} 端口就绪。`;
  }
  return `${target.label} 未检测到 ${target.port} 端口监听。`;
}

async function usageOpsFetch(path, options = {}){
  const response = await fetch(path, {
    cache:"no-store",
    ...options
  });
  const data = await response.json();
  if(!response.ok || data.ok === false){
    throw new Error(data.error || data.reason || "ops request failed");
  }
  return data;
}

function renderUsageOpsLogs(rows){
  const node = usageOpsEl("usageWebOpsLog");
  if(!node) return;
  const text = (rows || [])
    .slice(-80)
    .map(row => `[${new Date(row.at).toLocaleTimeString("zh-CN", { hour12:false })}] ${row.line}`)
    .join("\n");
  usageOpsState.lastLogText = text;
  node.textContent = text || "暂无由看板启动的日志。";
}

function renderUsageOpsTarget(target){
  usageOpsState.target = target || null;
  const badge = usageOpsEl("usageWebOpsBadge");
  const summary = usageOpsEl("usageWebOpsSummary");
  const meta = usageOpsEl("usageWebOpsMeta");
  const stripState = usageOpsEl("usageStatusState");
  const stripDetail = usageOpsEl("usageStatusDetail");
  if(badge){
    badge.className = `badge ${usageOpsStatusBadge(target?.state, target?.managed)}`;
    badge.textContent = usageOpsStatusText(target);
  }
  if(summary) summary.textContent = usageOpsSummary(target);
  if(stripState) stripState.textContent = target ? usageOpsStatusText(target) : "unavailable";
  if(stripDetail) stripDetail.textContent = usageOpsSummary(target);
  if(meta){
    const listeners = target?.listeners || [];
    meta.innerHTML = target ? `
      <div><b>端口</b><span>${h(String(target.port))}</span></div>
      <div><b>PID</b><span>${h(String(target.pid || "none"))}</span></div>
      <div><b>来源</b><span>${h(target.managed ? "看板启动" : (listeners.length ? "外部进程" : "未运行"))}</span></div>
      <div><b>入口</b><span>${h(target.url)}</span></div>
    ` : `
      <div><b>状态</b><span>ops API 不可用</span></div>
    `;
  }
  document.querySelectorAll("[data-ops-stop='web']").forEach(button => {
    button.disabled = usageOpsState.busy || !target?.canStop;
    button.title = target?.canStop ? "停止看板启动的 Web 进程" : "只能停止由看板启动的进程";
  });
  document.querySelectorAll("[data-ops-start]").forEach(button => {
    button.disabled = usageOpsState.busy;
  });
}

async function refreshUsageOpsStatus(){
  try{
    const data = await usageOpsFetch("/api/ops/status");
    const target = (data.targets || []).find(item => item.id === "web");
    renderUsageOpsTarget(target);
    const logs = await usageOpsFetch("/api/ops/logs?target=web");
    renderUsageOpsLogs(logs.rows || []);
    return target;
  }catch(error){
    renderUsageOpsTarget(null);
    renderUsageOpsLogs([{ at:new Date().toISOString(), line:`[error] ${error.message}` }]);
    return null;
  }
}

function setUsageOpsBusy(value){
  usageOpsState.busy = Boolean(value);
  document.querySelectorAll("[data-ops-start],[data-ops-refresh],[data-ops-open],[data-open-current-dashboard]").forEach(button => {
    button.disabled = usageOpsState.busy;
  });
  renderUsageOpsTarget(usageOpsState.target);
}

async function openUsageOpsTarget(targetId){
  const target = usageOpsState.target;
  const url = target?.url || "http://localhost:3000";
  try{
    await usageOpsFetch(`/api/ops/open?target=${encodeURIComponent(targetId)}`, { method:"POST" });
  }catch{
    // Browser fallback still opens the URL when macOS open is unavailable.
  }
  window.open(url, "_blank", "noopener");
}

async function waitForUsageOpsRunning(){
  for(let i = 0; i < 20; i += 1){
    const target = await refreshUsageOpsStatus();
    if(target?.state === "running") return target;
    await new Promise(resolve => setTimeout(resolve, 750));
  }
  return usageOpsState.target;
}

async function startUsageOps(actionId, openAfter){
  setUsageOpsBusy(true);
  try{
    await usageOpsFetch(`/api/ops/start?action=${encodeURIComponent(actionId)}`, { method:"POST" });
    const target = openAfter ? await waitForUsageOpsRunning() : await refreshUsageOpsStatus();
    if(openAfter && target?.state === "running"){
      await openUsageOpsTarget(target.id);
    }
  }catch(error){
    renderUsageOpsLogs([{ at:new Date().toISOString(), line:`[error] ${error.message}` }]);
  }finally{
    setUsageOpsBusy(false);
    refreshUsageOpsStatus();
  }
}

async function stopUsageOps(targetId){
  setUsageOpsBusy(true);
  try{
    await usageOpsFetch(`/api/ops/stop?target=${encodeURIComponent(targetId)}`, { method:"POST" });
  }catch(error){
    renderUsageOpsLogs([{ at:new Date().toISOString(), line:`[error] ${error.message}` }]);
  }finally{
    setUsageOpsBusy(false);
    refreshUsageOpsStatus();
  }
}

function initUsageOpsControls(){
  document.querySelectorAll("[data-ops-start]").forEach(button => {
    button.addEventListener("click", () => startUsageOps(button.dataset.opsStart, button.dataset.opsOpenAfter === "true"));
  });
  document.querySelectorAll("[data-ops-open]").forEach(button => {
    button.addEventListener("click", () => openUsageOpsTarget(button.dataset.opsOpen));
  });
  document.querySelectorAll("[data-ops-refresh]").forEach(button => {
    button.addEventListener("click", () => refreshUsageOpsStatus());
  });
  document.querySelectorAll("[data-ops-stop]").forEach(button => {
    button.addEventListener("click", () => stopUsageOps(button.dataset.opsStop));
  });
  document.querySelectorAll("[data-ops-copy-log]").forEach(button => {
    button.addEventListener("click", () => copyText(usageOpsState.lastLogText || "暂无日志", button));
  });
  document.querySelectorAll("[data-open-current-dashboard]").forEach(button => {
    button.addEventListener("click", () => window.open(`${location.origin}/#usage-ops`, "_blank", "noopener"));
  });
  refreshUsageOpsStatus();
  usageOpsState.pollTimer = window.setInterval(refreshUsageOpsStatus, 5000);
}
