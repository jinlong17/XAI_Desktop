function badgeClass(value){
  const v = String(value).toLowerCase();
  if(v === "web" || v.includes("web 分支")) return "b-blue";
  if(v === "app" || v.includes("mac") || v.includes("desktop")) return "b-green";
  if(v === "plugin" || v.includes("插件")) return "b-purple";
  if(v === "sync" || v.includes("同步")) return "b-cyan";
  if(v === "site" || v.includes("官网")) return "b-yellow";
  if(v === "project-system" || v.includes("project-system") || v.includes("dev-dashboard") || v.includes("个人开发看板")) return "b-blue";
  if(v === "admin" || v.includes("dashboard")) return "b-red";
  if(v.includes("blocked")) return "b-red";
  if(v.includes("attention") || v.includes("pending") || v.includes("review") || v.includes("local-only")) return "b-yellow";
  if(v.includes("shipped") || v.includes("active") || v.includes("exists") || v.includes("landed") || v.includes("approved")) return "b-green";
  if(v.includes("verify") || v.includes("new") || v.includes("skill")) return "b-cyan";
  if(v.includes("maintenance") || v.includes("defined") || v.includes("docs") || v.includes("tracked") || v.includes("正常")) return "b-blue";
  if(v.includes("paused") || v.includes("ephemeral") || v.includes("governance")) return "b-yellow";
  return "b-gray";
}
const STATUS_LABELS = {
  SHIPPED:"已发布", READY_TO_SHIP:"待发布", READY_FOR_VERIFY:"待验证",
  NEEDS_REVIEW:"待评审", PENDING:"待办", BLOCKED_EXTERNAL:"外部阻塞",
  BLOCKED:"阻塞", PAUSED:"暂停", APPROVED:"已批准",
  FIX_READY:"待修复", IN_PROGRESS:"进行中", OTHER:"其它"
};
const STATUS_TONE = {
  SHIPPED:"b-green", READY_TO_SHIP:"b-green", APPROVED:"b-green",
  READY_FOR_VERIFY:"b-cyan", NEEDS_REVIEW:"b-yellow", PENDING:"b-gray",
  BLOCKED_EXTERNAL:"b-red", BLOCKED:"b-red", PAUSED:"b-yellow",
  FIX_READY:"b-yellow", IN_PROGRESS:"b-cyan", OTHER:"b-gray"
};
const STATUS_ORDER = ["BLOCKED","BLOCKED_EXTERNAL","FIX_READY","NEEDS_REVIEW","READY_FOR_VERIFY","READY_TO_SHIP","APPROVED","IN_PROGRESS","PENDING","PAUSED","SHIPPED","OTHER"];
function statusChips(counts){
  const c = counts || {};
  const keys = [...STATUS_ORDER.filter(k => c[k]), ...Object.keys(c).filter(k => !STATUS_ORDER.includes(k)).sort()];
  if(!keys.length) return `<span class="chip-empty">no rows</span>`;
  return keys.map(k => {
    const label = STATUS_LABELS[k] || k.replace(/_/g, " ");
    const tone = STATUS_TONE[k] || "b-gray";
    return `<span class="badge ${tone}">${h(label)} ${h(String(c[k]))}</span>`;
  }).join("");
}

function h(value){
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
