// Skill management-group axis + curated "常用" list (single source of truth).
// No-bundler app: this file is loaded as a plain <script> AFTER status-meta.js and
// BEFORE both overview.js (常用 strip) and skill-agent.js (常用 group + management
// grouping). It exposes script-scope globals — do NOT add import/export.
// See BOUNDARIES.md §4.10 (Skill 分组规范) and §7 ("常用" single-source).
//
// FREQUENT_SKILLS is the curated high-frequency entry list. It is read by BOTH the
// Overview quick-skill strip (overview.js) and the catalog 常用 management group
// (skill-agent.js) so the two never drift. [name, 中文 label] pairs.
const FREQUENT_SKILLS = [
  ["xai-consistency-audit", "边界 / 一致性审计"],
  ["xai-module-classify", "功能归类 / 边界扫描"],
  ["xai-dev-dashboard-sync", "看板同步"],
  ["xai-feature-brief", "需求规范化"],
  ["xai-feature-full-loop", "功能一条龙"],
  ["xai-web-to-desktop-sync", "D3 闸门"],
  ["xai-web-deploy-preflight", "Web 部署预检"],
  ["xai-desktop-release-gate", "桌面发布闸门"],
  ["xai-sync-fanout-dispatch", "完成后扇出同步"],
  ["xai-release-log", "发布登记"]
];

// Back-compat alias: overview.js historically referenced OVERVIEW_QUICK_SKILLS.
// Keep the name pointing at the single source so any stray reference still resolves.
const OVERVIEW_QUICK_SKILLS = FREQUENT_SKILLS;

// Lowercased set of curated names for O(1), case-insensitive membership tests in
// the management grouping (the matchers below receive a lowercased name).
const FREQUENT_SKILL_NAMES = new Set(FREQUENT_SKILLS.map(([name]) => String(name).toLowerCase()));

// Management groups (PRIMARY axis on the Skill/Agent catalog; functional category
// is secondary). Order = display order. `match` decides membership by skill/agent
// name; `常用` is keyed off the shared FREQUENT_SKILL_NAMES set above. Anything that
// matches no rule lands in the `其他` fallback so NO entry is ever dropped.
const SKILL_MANAGEMENT_GROUPS = [
  {
    key:"frequent",
    title:"常用",
    summary:"高频入口，与总览常用条同源（FREQUENT_SKILLS 单一来源）。",
    match:(name) => FREQUENT_SKILL_NAMES.has(name)
  },
  {
    key:"system",
    title:"系统",
    summary:"治理 / 基建：ship、release-log、看板同步、一致性审计。",
    match:(name) => /(^ship$)|release-log|dashboard-sync|consistency-audit/.test(name)
  },
  {
    key:"sync",
    title:"同步",
    summary:"跨面同步闸门：D3 web-to-desktop、D4 account-sync-scope、扇出 sync-fanout。",
    match:(name) => /web-to-desktop-sync|account-sync-scope|sync-fanout/.test(name)
  },
  {
    key:"dev",
    title:"开发",
    summary:"功能 / 缺陷主路径：feature、bug、plan、roadmap、build。",
    match:(name) => /feature|^bug|bug-|bug_|bugfix|\bplan\b|planning|roadmap|build/.test(name)
  },
  {
    key:"other",
    title:"其他",
    summary:"未归入常用 / 系统 / 同步 / 开发的可查阅能力。",
    match:() => true
  }
];

// Resolve an entry's PRIMARY management group. 常用 wins first (curated intent),
// then system / sync / dev, then the 其他 fallback. Returns the group object.
function managementGroupForSkill(name){
  const lower = String(name || "").toLowerCase();
  for(const group of SKILL_MANAGEMENT_GROUPS){
    if(group.match(lower)) return group;
  }
  return SKILL_MANAGEMENT_GROUPS[SKILL_MANAGEMENT_GROUPS.length - 1];
}
