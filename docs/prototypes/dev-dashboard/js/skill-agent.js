function compactText(value, limit = 148){
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if(text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}…`;
}

function categoryByKey(key){
  const categories = skillAgentRegistry.categories?.length ? skillAgentRegistry.categories : SKILL_AGENT_CATEGORIES;
  return categories.find(item => item.key === key) || categories[categories.length - 1] || {};
}

function sourceTypeForSkillGroup(label = ""){
  if(/portable/i.test(label)) return "Portable Skill";
  if(/codex/i.test(label)) return "Codex Skill";
  if(/workflow|xai/i.test(label)) return "Project Skill";
  return "Skill";
}

function fallbackSkillAgentCategoryFor(entry){
  const name = String(entry.name || "").toLowerCase();
  if(/xai-web-to-desktop-sync|xai-release-log|^ship$/.test(name)) return "governance";
  if(/xai-roadmap-loop|workflow-router|planning-with-files|superpowers/.test(name)) return "automation";
  if(/gh-fix-ci|security|threat|stride/.test(name)) return "quality";
  if(/skill-creator|plugin-creator|agent-behavioral|frontend-dev|composition-patterns/.test(name)) return "authoring";
  if(/bugfix|bug-|bug_/.test(name)) return "bugfix";
  if(/feature-|feature_|xai-feature/.test(name)) return "feature";
  return "reference";
}

function fallbackWorkflowFor(entry, categoryKey){
  const name = String(entry.name || "").toLowerCase();
  if(name.includes("xai-web-to-desktop-sync")) return "D3 Web -> Desktop gate";
  if(name.includes("xai-release-log")) return "ship -> release-log";
  if(name.includes("xai-roadmap-loop")) return "roadmap-loop";
  if(name.includes("workflow-router")) return "brief / prompt routing";
  if(name.includes("feature")) return "Feature Workflow V2";
  if(name.includes("bug")) return "Bugfix Workflow V2";
  if(name.includes("ship")) return "Ship Workflow";
  return categoryByKey(categoryKey).workflow || "project reference";
}

function fallbackScenarioFor(entry, categoryKey){
  const trigger = (entry.triggers || []).find(Boolean);
  return trigger || categoryByKey(categoryKey).scenario || "查看定义并按场景使用。";
}

function normalizeFallbackEntry(entry){
  const category = fallbackSkillAgentCategoryFor(entry);
  const kind = entry.kind || (entry.type === "Agent" ? "agent" : "skill");
  const docs = entry.docs || (entry.path ? [{label:kind === "agent" ? "Agent" : "SKILL.md", path:entry.path}] : []);
  return {
    id:`${kind}:${entry.name}`,
    name:entry.name,
    kind,
    type:kind === "agent" ? "Agent" : "Skill",
    subtype:entry.type || (kind === "agent" ? "Workflow Agent" : "Skill"),
    category,
    category_label:categoryByKey(category).title || category,
    usage_scenario:fallbackScenarioFor(entry, category),
    function_description:entry.description || entry.desc || "暂无说明。",
    inputs:"未显式登记。",
    outputs:"未显式登记。",
    usage_frequency:"按需使用",
    related_workflow:fallbackWorkflowFor(entry, category),
    related_docs:docs,
    maintenance_status:entry.status || (entry.tracked ? "tracked" : "local-only"),
    maintenance_code:entry.status || (entry.tracked ? "tracked" : "local-only"),
    last_updated:"",
    note:"旧版数据 fallback；运行 `pnpm dashboard` 生成完整知识库字段。",
    note_source:"generated",
    path:entry.path,
    tracked:entry.tracked,
    gaps:[],
    gap_labels:[],
    source_notes:["generated_input","generated_output","generated_note"],
    source_note_labels:["输入说明已自动补齐","输出说明已自动补齐","注释已自动补齐"],
    is_complete:true,
    triggers:entry.triggers || []
  };
}

function collectSkillAgentEntries(){
  if(Array.isArray(skillAgentRegistry.entries) && skillAgentRegistry.entries.length){
    return skillAgentRegistry.entries;
  }
  const skillEntries = skillGroups.flatMap(group => (group.items || []).map(item => normalizeFallbackEntry({
    kind:"skill",
    name:item.name,
    type:sourceTypeForSkillGroup(group.label),
    description:item.description || group.summary || "项目 skill 定义。",
    triggers:item.triggers || [],
    docs:[{label:"SKILL.md", path:item.path}],
    path:item.path,
    tracked:item.tracked,
    status:item.tracked ? "tracked" : "local-only"
  })));
  const familyEntries = agentFamilies.map(family => {
    const variants = family.variants || [];
    const preferred = variants.find(item => item.platform === "Codex") || variants[0] || {};
    return normalizeFallbackEntry({
      kind:"agent",
      name:family.title || family.slug,
      type:"Workflow Agent",
      description:preferred.description || family.summary || "Workflow Agent 定义。",
      docs:variants.map(variant => ({label:variant.platform, path:variant.path})),
      path:preferred.path,
      tracked:variants.every(variant => variant.tracked),
      status:variants.every(variant => variant.tracked) ? "tracked" : "local-only"
    });
  });
  if(!familyEntries.length && agents.length){
    return [...skillEntries, ...agents.map(agent => normalizeFallbackEntry({
      kind:"agent",
      name:agent.name,
      type:"Codex Agent",
      description:agent.desc,
      triggers:agent.triggers || [],
      docs:[{label:"TOML", path:agent.path}],
      path:agent.path,
      tracked:agent.status === "tracked",
      status:agent.status
    }))];
  }
  return [...skillEntries, ...familyEntries];
}

function fieldRowsForEntry(entry){
  return [
    ["类型", `${entry.type}${entry.subtype ? ` / ${entry.subtype}` : ""}`],
    ["所属分类", entry.category_label || categoryByKey(entry.category).title || entry.category],
    ["使用场景", entry.usage_scenario],
    ["输入内容", entry.inputs],
    ["输出内容", entry.outputs],
    ["使用频率", entry.usage_frequency],
    ["关联 workflow", entry.related_workflow],
    ["维护状态", entry.maintenance_status],
    ["最近更新时间", entry.last_updated || "未读取"],
    ["简短注释", entry.note]
  ];
}

function gapTone(gap){
  if(/missing_intro|missing_input|missing_output|missing_explicit_note|mirror_missing/.test(gap)) return "b-red";
  if(/unclear_category|missing_related_workflow|missing_related_docs/.test(gap)) return "b-yellow";
  if(/generated_/.test(gap)) return "b-cyan";
  return "b-gray";
}

function sourceNoteTone(note){
  if(/untracked|mirror/.test(note)) return "b-yellow";
  return "b-cyan";
}

function docButtons(entry){
  const docs = entry.related_docs || entry.docs || [];
  if(!docs.length) return `<span class="pill">无文档入口</span>`;
  return docs.map(doc => `
    <button class="reader-btn" data-skill-agent-doc="${h(doc.path)}" type="button" title="${h(doc.path)}">
      ${h(doc.label || basename(doc.path))}
    </button>
  `).join("");
}

function renderRegistrySummary(entries){
  const summary = skillAgentRegistry.summary || {};
  const skillCount = summary.skills ?? entries.filter(item => item.kind === "skill").length;
  const agentCount = summary.agents ?? entries.filter(item => item.kind === "agent").length;
  const complete = summary.complete ?? entries.filter(item => item.is_complete).length;
  const unresolved = summary.unresolved ?? entries.filter(item => (item.gaps || []).length).length;
  const sourceBackfill = summary.source_backfill ?? entries.filter(item => (item.source_notes || []).length).length;
  const changed = summary.changed ?? entries.filter(item => item.changed).length;
  document.getElementById("skillAgentCounts").innerHTML = [
    ["Skill", skillCount, "project / codex / portable"],
    ["Agent", agentCount, "workflow families"],
    ["完整条目", `${complete}/${entries.length}`, "必填字段 + 关联信息"],
    ["待处理缺口", unresolved, "无法自动判断才显示"],
    ["已自动补齐", sourceBackfill, "可按需回写源文件"],
    ["新增/修改", changed, "working tree delta"]
  ].map(([label, value, note]) => `
    <div class="skill-agent-count">
      <span>${h(label)}</span>
      <b>${h(String(value))}</b>
      <em>${h(note)}</em>
    </div>
  `).join("");
}

function renderSkillAgentCatalog(){
  const entries = collectSkillAgentEntries();
  renderRegistrySummary(entries);
  const categories = (skillAgentRegistry.categories?.length ? skillAgentRegistry.categories : SKILL_AGENT_CATEGORIES)
    .map(category => ({
      ...category,
      entries:entries.filter(entry => entry.category === category.key)
        .sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name))
    }))
    .filter(group => group.entries.length);

  document.getElementById("skillAgentIndex").innerHTML = categories.map(group => {
    const complete = group.entries.filter(entry => entry.is_complete).length;
    const gaps = group.entries.reduce((sum, entry) => sum + (entry.gaps || []).length, 0);
    const sourceNotes = group.entries.reduce((sum, entry) => sum + (entry.source_notes || []).length, 0);
    return `
      <button data-category="${h(group.key)}" data-skill-agent-jump="${h(group.key)}" type="button">
        <span>${h(String(group.entries.length))} items · ${h(String(complete))} complete</span>
        <b>${h(group.title)}</b>
        <small>${h(group.summary)}${gaps ? ` · ${gaps} 待处理` : ""}${!gaps && sourceNotes ? ` · ${sourceNotes} 自动补齐` : ""}</small>
      </button>
    `;
  }).join("");

  document.getElementById("skillAgentBoard").innerHTML = categories.map(group => `
    <section class="skill-agent-category" data-category="${h(group.key)}" data-skill-agent-category="${h(group.key)}">
      <div class="skill-agent-category-head">
        <div>
          <h3>${h(group.title)}</h3>
          <p>${h(group.summary)}</p>
        </div>
        <div class="skill-agent-category-meta">
          <span class="pill">${h(group.workflow)}</span>
          <span class="badge b-blue">${h(String(group.entries.length))} items</span>
          <span class="badge ${group.entries.every(entry => entry.is_complete) ? "b-green" : "b-yellow"}">${group.entries.every(entry => entry.is_complete) ? "resolved" : "needs action"}</span>
        </div>
      </div>
      <div class="skill-agent-entry-grid">
        ${group.entries.map(entry => `
          <article class="skill-agent-entry ${entry.is_complete ? "is-complete" : "needs-metadata"}">
            <div class="skill-agent-entry-top">
              <div>
                <h4>${h(entry.name)}</h4>
                <p>${h(compactText(entry.function_description || "暂无说明。", 210))}</p>
              </div>
              <div class="sa-entry-actions">
                <span class="badge ${entry.kind === "skill" ? "b-purple" : "b-cyan"}">${h(entry.type || (entry.kind === "skill" ? "Skill" : "Agent"))}</span>
                <span class="badge ${entry.is_complete ? "b-green" : "b-yellow"}">${entry.is_complete ? "完整" : "待补充"}</span>
                <button class="sa-copy" type="button" data-sa-copy="${h(entry.name)}" title="复制名字">复制名</button>
              </div>
            </div>
            <div class="skill-agent-gaps">
              ${(entry.gaps || []).length ? (entry.gap_labels || entry.gaps).map((label, index) => `
                <span class="badge ${gapTone((entry.gaps || [])[index] || label)}">${h(label)}</span>
              `).join("") : `<span class="badge b-green">字段已补齐</span>`}
              ${(entry.source_notes || []).map((note, index) => `
                <span class="badge ${sourceNoteTone(note)}">${h((entry.source_note_labels || [])[index] || note)}</span>
              `).join("")}
            </div>
            <div class="skill-agent-field-grid">
              ${fieldRowsForEntry(entry).map(([label, value]) => `
                <b>${h(label)}</b><span>${h(value || "未登记")}</span>
              `).join("")}
            </div>
            ${entry.category_suggestion ? `<div class="skill-agent-note"><b>分类建议</b><span>${h(entry.category_suggestion)}</span></div>` : ""}
            <div class="skill-agent-docs">
              ${docButtons(entry)}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("") || `<div class="surface pad"><div class="flow-note"><b>未发现 Skill / Agent 定义</b><p style="margin-top:8px">运行 <code>node scripts/dashboard/generate-state.mjs</code> 刷新快照。</p></div></div>`;

  document.querySelectorAll("[data-skill-agent-jump]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelector(`[data-skill-agent-category="${button.dataset.skillAgentJump}"]`)?.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });
  document.querySelectorAll("[data-skill-agent-doc]").forEach(button => {
    button.addEventListener("click", () => openSkillAgentDoc(button.dataset.skillAgentDoc));
  });
  document.querySelectorAll("[data-sa-copy]").forEach(button => {
    button.addEventListener("click", () => copyText(button.dataset.saCopy, button));
  });
}

function openSkillAgentDoc(path){
  setPage("docs");
  openLibraryEntry(path);
}
