function compactText(value, limit = 148){
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if(text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}…`;
}

function sourceTypeForSkillGroup(label = ""){
  if(/portable/i.test(label)) return "Portable Skill";
  if(/codex/i.test(label)) return "Codex Skill";
  if(/workflow|xai/i.test(label)) return "Project Skill";
  return "Skill";
}

function categoryByKey(key){
  return SKILL_AGENT_CATEGORIES.find(item => item.key === key) || SKILL_AGENT_CATEGORIES[SKILL_AGENT_CATEGORIES.length - 1];
}

function skillAgentCategoryFor(entry){
  const name = String(entry.name || "").toLowerCase();
  if(/xai-web-to-desktop-sync|xai-release-log|^ship$/.test(name)) return "governance";
  if(/xai-roadmap-loop|workflow-router|planning-with-files|superpowers/.test(name)) return "automation";
  if(/gh-fix-ci|security|threat|stride/.test(name)) return "quality";
  if(/skill-creator|plugin-creator|agent-behavioral|frontend-dev|composition-patterns/.test(name)) return "authoring";
  if(/bugfix|bug-|bug_/.test(name)) return "bugfix";
  if(/feature-|feature_|xai-feature/.test(name)) return "feature";
  const value = `${name} ${entry.workflow || ""} ${entry.description || ""} ${entry.source || ""} ${entry.docs?.map(doc => doc.path).join(" ") || ""}`.toLowerCase();
  if(/bugfix|bug-|bug_|bug diagnose|bug fix|bug verify|bug-diagnose|bug-fix|bug-verify/.test(value)) return "bugfix";
  if(/feature-|feature_|xai-feature|feature workflow|frontend-dev|composition-patterns|feature-plan|feature-review|feature-build|feature-verify/.test(value)) return "feature";
  if(/roadmap|workflow-router|planning|superpowers|auto-|automation|loop|orchestration|manifest/.test(value)) return "automation";
  if(/web-to-desktop|release-log|\bship\b|handoff|governance|branch|sync gate|d3|cursor rule|codex config/.test(value)) return "governance";
  if(/gh-fix-ci|security|threat|stride|ci|review|verify|codebase-explorer|audit/.test(value)) return "quality";
  if(/skill-creator|plugin-creator|skill author|skill-|agent-behavioral|frontend|composition|create a new skill/.test(value)) return "authoring";
  return "reference";
}

function skillAgentWorkflowFor(entry, categoryKey){
  const name = String(entry.name || "").toLowerCase();
  if(entry.kind === "agent" && entry.workflow) return entry.workflow;
  if(name.includes("xai-web-to-desktop-sync")) return "D3 Web -> Desktop gate";
  if(name.includes("xai-release-log")) return "ship -> release-log";
  if(name.includes("xai-roadmap-loop")) return "roadmap-loop";
  if(name.includes("workflow-router")) return "brief / prompt routing";
  if(name.includes("feature")) return "Feature Workflow V2";
  if(name.includes("bug")) return "Bugfix Workflow V2";
  if(name.includes("ship")) return "Ship Workflow";
  return categoryByKey(categoryKey).workflow;
}

function skillAgentScenarioFor(entry, categoryKey){
  const trigger = (entry.triggers || []).find(Boolean);
  if(trigger) return compactText(trigger, 132);
  if(entry.kind === "agent" && entry.workflow) return categoryByKey(categoryKey).scenario;
  return categoryByKey(categoryKey).scenario;
}

function collectSkillAgentEntries(){
  const skillEntries = skillGroups.flatMap(group => (group.items || []).map(item => {
    const entry = {
      kind:"skill",
      name:item.name,
      type:sourceTypeForSkillGroup(group.label),
      source:group.label,
      description:item.description || group.summary || "项目 skill 定义。",
      triggers:item.triggers || [],
      docs:[{label:"SKILL.md", path:item.path}],
      tracked:item.tracked
    };
    const category = skillAgentCategoryFor(entry);
    return {
      ...entry,
      category,
      workflow:skillAgentWorkflowFor(entry, category),
      scenario:skillAgentScenarioFor(entry, category)
    };
  }));
  const familyEntries = agentFamilies.map(family => {
    const variants = family.variants || [];
    const preferred = variants.find(item => item.platform === "Codex") || variants[0] || {};
    const entry = {
      kind:"agent",
      name:family.title || family.slug,
      type:"Workflow Agent",
      source:variants.map(item => item.platform).join(" / ") || "Agent",
      workflow:family.group || "Workflow",
      description:preferred.description || family.summary || "Workflow Agent 定义。",
      triggers:[],
      docs:variants.map(variant => ({label:variant.platform, path:variant.path})),
      tracked:variants.every(variant => variant.tracked)
    };
    const category = skillAgentCategoryFor(entry);
    return {
      ...entry,
      category,
      workflow:skillAgentWorkflowFor(entry, category),
      scenario:skillAgentScenarioFor(entry, category)
    };
  });
  if(!familyEntries.length && agents.length){
    const codexAgents = agents.map(agent => {
      const entry = {
        kind:"agent",
        name:agent.name,
        type:"Codex Agent",
        source:"Codex",
        workflow:"Workflow",
        description:agent.desc,
        triggers:agent.triggers || [],
        docs:[{label:"TOML", path:agent.path}],
        tracked:agent.status === "tracked"
      };
      const category = skillAgentCategoryFor(entry);
      return {
        ...entry,
        category,
        workflow:skillAgentWorkflowFor(entry, category),
        scenario:skillAgentScenarioFor(entry, category)
      };
    });
    return [...skillEntries, ...codexAgents];
  }
  return [...skillEntries, ...familyEntries];
}

function renderSkillAgentCatalog(){
  const entries = collectSkillAgentEntries();
  const skillCount = entries.filter(item => item.kind === "skill").length;
  const agentCount = entries.filter(item => item.kind === "agent").length;
  const variantCount = agentFamilies.reduce((sum, family) => sum + (family.variants || []).length, 0);
  document.getElementById("skillAgentCounts").innerHTML = [
    ["Skill", skillCount, "project / codex / portable"],
    ["Agent", agentCount, "workflow families"],
    ["Agent 定义文件", variantCount || agentCount, "canonical / codex / cloud / cursor"]
  ].map(([label, value, note]) => `
    <div class="skill-agent-count">
      <span>${h(label)}</span>
      <b>${h(String(value))}</b>
      <em>${h(note)}</em>
    </div>
  `).join("");

  const grouped = SKILL_AGENT_CATEGORIES.map(category => ({
    ...category,
    entries:entries.filter(entry => entry.category === category.key)
      .sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name))
  })).filter(group => group.entries.length);

  document.getElementById("skillAgentIndex").innerHTML = grouped.map(group => `
    <button data-category="${h(group.key)}" data-skill-agent-jump="${h(group.key)}" type="button">
      <span>${h(String(group.entries.length))} items</span>
      <b>${h(group.title)}</b>
      <small>${h(group.summary)}</small>
    </button>
  `).join("");

  document.getElementById("skillAgentBoard").innerHTML = grouped.map(group => `
    <section class="skill-agent-category" data-category="${h(group.key)}" data-skill-agent-category="${h(group.key)}">
      <div class="skill-agent-category-head">
        <div>
          <h3>${h(group.title)}</h3>
          <p>${h(group.summary)}</p>
        </div>
        <div class="skill-agent-category-meta">
          <span class="pill">${h(group.workflow)}</span>
          <span class="badge b-blue">${h(String(group.entries.length))} items</span>
        </div>
      </div>
      <div class="skill-agent-entry-grid">
        ${group.entries.map(entry => `
          <article class="skill-agent-entry">
            <div class="skill-agent-entry-top">
              <div>
                <h4>${h(entry.name)}</h4>
                <p>${h(compactText(entry.description || "暂无说明。", 176))}</p>
              </div>
              <span class="badge ${entry.kind === "skill" ? "b-purple" : "b-cyan"}">${h(entry.kind === "skill" ? "Skill" : "Agent")}</span>
            </div>
            <div class="skill-agent-meta-grid">
              <b>类型</b><span>${h(entry.type)}</span>
              <b>所属 workflow</b><span>${h(entry.workflow)}</span>
              <b>适用场景</b><span>${h(entry.scenario)}</span>
              <b>来源</b><span>${h(entry.source || "project")}${entry.tracked === false ? " · local-only" : ""}</span>
            </div>
            <div class="skill-agent-docs">
              ${(entry.docs || []).map(doc => `
                <button class="reader-btn" data-skill-agent-doc="${h(doc.path)}" type="button">${h(doc.label || basename(doc.path))}</button>
              `).join("") || `<span class="pill">无文档入口</span>`}
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
}

function openSkillAgentDoc(path){
  setPage("docs");
  openLibraryEntry(path);
}
