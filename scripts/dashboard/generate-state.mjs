#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const sourcePath = resolve(repoRoot, "docs/workflow/project/dashboard-state.json");
const releaseLogPath = resolve(repoRoot, "docs/workflow/project/release-log.md");
const branchPolicyPath = resolve(repoRoot, "docs/workflow/project/branch-policy.json");
const pluginMapPath = resolve(repoRoot, "docs/PLUGIN_MAP.md");
const workflowDir = resolve(repoRoot, ".github/workflows");
const roadmapDir = resolve(repoRoot, "docs/workflow/roadmap");
const skillDir = resolve(repoRoot, ".teams/skills");
const codexSkillDir = resolve(repoRoot, ".codex/skills");
const agentDir = resolve(repoRoot, ".codex/agents");
const agentTemplateDir = resolve(repoRoot, ".agents/templates");
const claudeAgentDir = resolve(repoRoot, ".claude/agents");
const cursorAgentDir = resolve(repoRoot, ".cursor/agents");
const outputPath = resolve(repoRoot, "docs/prototypes/dev-dashboard/state.generated.js");
const dashboardMachineDocPath = "docs/workflow/project/dev-dashboard.md";
const dashboardTemplatePath = "docs/prototypes/dev-dashboard/TEMPLATE.md";
const dashboardDesignPath = "docs/prototypes/dev-dashboard/DESIGN.md";
const dashboardSyncSkillPath = ".teams/skills/xai-dev-dashboard-sync/SKILL.md";
const roadmapAllowlist = [
  "sync-v1.md",
  "web-ticktick-parity.md",
  "xai-admin-dashboard-system-integration.md",
  "xai-g0-window-spike.md",
  "xai-g1-native-foundation.md",
  "xai-web-calendar-event-create.md",
  "xai-web-console-gap-closure.md",
  "xai-web-console.md",
  "xai-web-dashboard-real-data.md",
  "xai-web-dashboard-stickies-create.md",
  "xai-web-dashboard-weather-mail.md",
  "xai-web-matrix-card-create.md",
  "xai-web-statistics-real-aggregation.md",
  "xai-web-tasks-card-create.md",
  "xai-web-tasks-smartlist-filter.md"
];

const skillAgentCategories = [
  {
    key: "feature",
    title: "Feature Workflow",
    workflow: "feature-plan -> feature-review -> feature-build -> feature-verify",
    summary: "新功能从 brief、计划、实现到只读验证的主路径。",
    scenario: "新增 Web/App/Plugin 能力、拆分阶段计划、补齐实现与验证证据。",
    tone: "blue"
  },
  {
    key: "bugfix",
    title: "Bugfix Workflow",
    workflow: "bug-diagnose -> bug-fix -> bug-verify",
    summary: "缺陷定位、修复、复核和循环修复入口。",
    scenario: "有明确异常、回归、验证失败或需要自动循环修复时使用。",
    tone: "red"
  },
  {
    key: "automation",
    title: "Roadmap / Automation",
    workflow: "roadmap-loop / workflow-router / planning",
    summary: "把粗需求、roadmap manifest 和长期任务转成可执行批次。",
    scenario: "批量推进路线图、生成目标 prompt、保持长任务计划和自动化节奏。",
    tone: "purple"
  },
  {
    key: "governance",
    title: "Governance / Release",
    workflow: "D3 gate / ship / release-log / handoff",
    summary: "跨模块同步、发布记录、ship 收口和 handoff 展示规则。",
    scenario: "Web 改动进入 Desktop、发布前收口、更新 release log 或同步平台规则。",
    tone: "cyan"
  },
  {
    key: "quality",
    title: "Quality / Security",
    workflow: "review / verify / CI / threat-model",
    summary: "CI、架构冷读、安全审查和质量风险识别。",
    scenario: "检查失败、PR 复核、安全评审、安全建模和结构风险复盘。",
    tone: "yellow"
  },
  {
    key: "authoring",
    title: "Skill / Agent Authoring",
    workflow: "skill authoring / reusable engineering helpers",
    summary: "创建、维护、镜像和使用可复用 skill / agent 能力。",
    scenario: "新增 SKILL.md、调整 agent 定义、维护前端/组合/小修类工程辅助。",
    tone: "green"
  },
  {
    key: "reference",
    title: "Reference / Support",
    workflow: "project reference",
    summary: "不直接绑定单一 workflow，但属于项目可查阅能力。",
    scenario: "查找辅助能力、理解本地与 portable 定义来源或补充上下文。",
    tone: "gray"
  }
];

const skillAgentGapLabels = {
  missing_intro: "缺少明确介绍",
  generated_intro: "介绍为自动生成",
  missing_input: "缺少输入说明",
  generated_input: "输入说明为推断",
  missing_output: "缺少输出说明",
  generated_output: "输出说明为推断",
  missing_explicit_note: "缺少显式注释",
  generated_note: "注释为自动生成",
  missing_related_workflow: "缺少 workflow 关联",
  missing_related_docs: "缺少关联文档",
  unclear_category: "分类不清晰",
  untracked_or_local: "未完整纳入 Git",
  mirror_missing: "运行时镜像不完整"
};

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "";
  }
}

function gitLines(args) {
  const output = git(args);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return match[1].split(/\r?\n/).reduce((meta, line) => {
    const parts = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (parts) meta[parts[1]] = parts[2].trim();
    return meta;
  }, {});
}

function extractTriggers(text, description) {
  const explicit = text.match(/## Triggers\s+([\s\S]*?)(?:\n## |\n# |$)/);
  if (explicit) {
    return explicit[1]
      .split(/\r?\n/)
      .map(line => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 6);
  }
  const descTriggers = String(description || "").match(/Triggers?\s+[—-]\s+(.+)$/i);
  if (!descTriggers) {
    const useWhen = String(description || "").match(/Use when\s+(.+?)(?:\.|$)/i);
    return useWhen ? [useWhen[1].trim()] : [];
  }
  return descTriggers[1]
    .split(/[·,，、]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function listSkills() {
  if (!existsSync(skillDir)) return [];
  return readdirSync(skillDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const skillPath = resolve(skillDir, entry.name, "SKILL.md");
      const text = existsSync(skillPath) ? readText(skillPath) : "";
      const meta = parseFrontmatter(text);
      return {
        name: meta.name || entry.name,
        description: meta.description || "",
        triggers: extractTriggers(text, meta.description),
        path: relative(repoRoot, skillPath),
        present: existsSync(skillPath),
        tracked: Boolean(git(["ls-files", "--", relative(repoRoot, skillPath)]))
      };
    })
    .filter(skill => skill.present)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function listSkillSet(dir, label, summary) {
  if (!existsSync(dir)) return { label, summary, count: 0, items: [] };
  const items = readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const skillPath = resolve(dir, entry.name, "SKILL.md");
      const relPath = relative(repoRoot, skillPath);
      const text = existsSync(skillPath) ? readText(skillPath) : "";
      const meta = parseFrontmatter(text);
      return {
        name: meta.name || entry.name,
        description: meta.description || "",
        triggers: extractTriggers(text, meta.description),
        path: relPath,
        tracked: Boolean(git(["ls-files", "--", relPath]))
      };
    })
    .filter(item => item.path && existsSync(resolve(repoRoot, item.path)))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { label, summary, count: items.length, items };
}

function buildSkillGroups() {
  return [
    listSkillSet(skillDir, "XAI Workflow Skills", "项目级 feature / roadmap / release / web-to-desktop 能力。"),
    listSkillSet(codexSkillDir, "Codex Public Skills", "Codex 本地可复用开发技能，覆盖前端、CI、规划和安全。"),
    listSkillSet(resolve(repoRoot, "docs/workflow/_portable/skills"), "Portable Skills", "可迁移到其它工具链的 skill 文档副本。")
  ].filter(group => group.count);
}

function parseTomlString(text, key) {
  const match = text.match(new RegExp(`^${key}\\s*=\\s*\"([^\"]*)\"`, "m"));
  return match ? match[1] : "";
}

function listAgents() {
  if (!existsSync(agentDir)) return [];
  return readdirSync(agentDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(".toml"))
    .map(entry => {
      const agentPath = resolve(agentDir, entry.name);
      const relPath = relative(repoRoot, agentPath);
      const text = readText(agentPath);
      return {
        name: parseTomlString(text, "name") || entry.name.replace(/\.toml$/, ""),
        description: parseTomlString(text, "description"),
        triggers: [],
        path: relPath,
        tracked: Boolean(git(["ls-files", "--", relPath]))
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function parseAgentFile(path, fallbackName) {
  const text = existsSync(path) ? readText(path) : "";
  const ext = path.endsWith(".toml") ? "toml" : "md";
  if (ext === "toml") {
    return {
      name: parseTomlString(text, "name") || fallbackName,
      description: parseTomlString(text, "description")
    };
  }
  const meta = parseFrontmatter(text);
  const title = text.match(/^#\s+(.+)$/m);
  return {
    name: meta.name || fallbackName,
    description: meta.description || (title ? title[1].trim() : "")
  };
}

function agentGroupLabel(name) {
  if (name === "ship") return "Ship";
  if (name.startsWith("feature-")) return "Feature Workflow";
  if (name.startsWith("bug") || name.startsWith("bugfix-")) return "Bugfix Workflow";
  if (name.startsWith("skill-")) return "Skill Helper";
  return "Workflow";
}

function agentSummary(name) {
  if (name === "feature-plan") return "需求进入后产出 discovery review、设计/API/test 策略和阶段计划。";
  if (name === "feature-review") return "冷读计划与合同，给出 APPROVE / REVISE / REJECT。";
  if (name === "feature-build") return "按已批准计划实现功能，维护 dev_log 和验证证据。";
  if (name === "feature-verify") return "只读验证功能、测试、文档和 Handoff 是否满足发布门槛。";
  if (name === "feature-dev-loop") return "串联 plan/review/build/verify 的循环入口。";
  if (name === "feature-full-loop") return "端到端 feature 自动化入口。";
  if (name === "ship") return "收口验证、提交、推送和发布记录。";
  if (name.startsWith("bug")) return "诊断、修复或验证 bugfix 工作流。";
  if (name.startsWith("skill-")) return "把 skill 文档转成对应平台可调用 Agent。";
  return "Workflow V2 Agent 模板的一个版本。";
}

function listAgentVariants(dir, platform, ext) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(ext))
    .filter(entry => entry.name !== "README.md")
    .map(entry => {
      const path = resolve(dir, entry.name);
      const relPath = relative(repoRoot, path);
      const slug = entry.name.replace(new RegExp(`${ext.replace(".", "\\.")}$`), "");
      const meta = parseAgentFile(path, slug);
      return {
        slug,
        platform,
        name: meta.name || slug,
        description: meta.description || agentSummary(slug),
        path: relPath,
        tracked: Boolean(git(["ls-files", "--", relPath]))
      };
    });
}

function buildAgentFamilies() {
  const variants = [
    ...listAgentVariants(agentTemplateDir, "Canonical", ".md"),
    ...listAgentVariants(agentDir, "Codex", ".toml"),
    ...listAgentVariants(claudeAgentDir, "Cloud", ".md"),
    ...listAgentVariants(cursorAgentDir, "Cursor", ".md")
  ];
  const grouped = new Map();
  variants.forEach(variant => {
    if (!grouped.has(variant.slug)) {
      grouped.set(variant.slug, {
        slug: variant.slug,
        title: variant.name,
        group: agentGroupLabel(variant.slug),
        summary: agentSummary(variant.slug),
        variants: []
      });
    }
    grouped.get(variant.slug).variants.push(variant);
  });
  const platformOrder = ["Canonical", "Codex", "Cloud", "Cursor"];
  return [...grouped.values()]
    .map(family => ({
      ...family,
      variants: family.variants.sort((a, b) => platformOrder.indexOf(a.platform) - platformOrder.indexOf(b.platform))
    }))
    .sort((a, b) => {
      const order = ["Feature Workflow", "Bugfix Workflow", "Ship", "Skill Helper", "Workflow"];
      return (order.indexOf(a.group) - order.indexOf(b.group)) || a.slug.localeCompare(b.slug);
    });
}

function compactText(value, limit = 180) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
  if (!text) return "";
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

function categoryByKey(key) {
  return skillAgentCategories.find(category => category.key === key) || skillAgentCategories[skillAgentCategories.length - 1];
}

function markdownSection(text, headings) {
  const names = headings.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const match = String(text || "").match(new RegExp(`^##\\s+(?:${names})\\s*\\n([\\s\\S]*?)(?=^##\\s+|^#\\s+|(?![\\s\\S]))`, "im"));
  return match ? match[1].trim() : "";
}

function sectionSnippet(section, limit = 190) {
  const lines = String(section || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("```"))
    .map(line => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").replace(/^#+\s+/, ""))
    .filter(line => line && !/^\|?\s*:?-{3,}/.test(line));
  return compactText(lines.slice(0, 4).join(" "), limit);
}

function firstParagraph(text) {
  const body = String(text || "").replace(/^---\n[\s\S]*?\n---/, "").trim();
  const paragraphs = body
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(block => block && !block.startsWith("#") && !block.startsWith("```"));
  return sectionSnippet(paragraphs[0] || "", 210);
}

function pathLabel(path) {
  return String(path || "").split("/").filter(Boolean).pop() || path;
}

function ownDoc(path, label = "") {
  return {
    label: label || pathLabel(path),
    path,
    role: "definition"
  };
}

function extractRelatedDocs(text, ownDocs = []) {
  const docs = [...ownDocs];
  const seen = new Set(docs.map(doc => doc.path));
  const add = (path, role = "related") => {
    const normalized = String(path || "").replace(/^[./]+/, "");
    if (!normalized || seen.has(normalized)) return;
    if (!existsSync(resolve(repoRoot, normalized))) return;
    seen.add(normalized);
    docs.push({ label: pathLabel(normalized), path: normalized, role });
  };
  const patterns = [
    /`([^`]*(?:AGENTS\.md|CLAUDE\.md|docs\/[^`]+\.(?:md|mdc|json)|\.teams\/skills\/[^`]+\/SKILL\.md|\.codex\/agents\/[^`]+\.toml|\.agents\/templates\/[^`]+\.md))`/g,
    /\b((?:docs|\.teams|\.codex|\.agents|\.claude|\.cursor)\/[A-Za-z0-9_./-]+\.(?:md|mdc|json|toml))\b/g,
    /\b(AGENTS\.md|CLAUDE\.md)\b/g
  ];
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      add(match[1]);
    }
  });
  return docs.slice(0, 8);
}

function skillAgentCategoryFor(entry) {
  const name = String(entry.name || "").toLowerCase();
  if (/xai-web-to-desktop-sync|xai-account-sync-scope-check|xai-sync-fanout-dispatch|xai-release-log|^ship$/.test(name)) return "governance";
  if (/xai-roadmap-loop|workflow-router|planning-with-files|superpowers/.test(name)) return "automation";
  if (/gh-fix-ci|security|threat|stride|feature-review|feature-verify|bug-verify|consistency-audit/.test(name)) return "quality";
  if (/skill-creator|plugin-creator|agent-behavioral|frontend-dev|composition-patterns/.test(name)) return "authoring";
  if (/bugfix|bug-|bug_/.test(name)) return "bugfix";
  if (/feature-|feature_|xai-feature/.test(name)) return "feature";
  const value = `${name} ${entry.workflow || ""} ${entry.description || ""} ${entry.type || ""} ${entry.related_docs?.map(doc => doc.path).join(" ") || ""}`.toLowerCase();
  if (/bugfix|bug-|bug_|bug diagnose|bug fix|bug verify|bug-diagnose|bug-fix|bug-verify/.test(value)) return "bugfix";
  if (/feature-|feature_|xai-feature|feature workflow|frontend-dev|composition-patterns|feature-plan|feature-build/.test(value)) return "feature";
  if (/roadmap|workflow-router|planning|auto-|automation|loop|orchestration|manifest/.test(value)) return "automation";
  if (/web-to-desktop|account-sync|release-log|\bship\b|handoff|governance|branch|sync gate|d3|d4|cursor rule|codex config/.test(value)) return "governance";
  if (/gh-fix-ci|security|threat|stride|ci|review|verify|codebase-explorer|audit/.test(value)) return "quality";
  if (/skill-creator|plugin-creator|skill author|skill-|agent-behavioral|frontend|composition|create a new skill/.test(value)) return "authoring";
  return "reference";
}

function relatedWorkflowFor(entry, categoryKey) {
  const text = `${entry.name || ""} ${entry.description || ""} ${entry.source_text || ""}`.toLowerCase();
  if (/^skill-/.test(String(entry.name || "").toLowerCase()) || categoryKey === "authoring") {
    return { value: categoryByKey(categoryKey).workflow, explicit: true };
  }
  if (/xai-dev-dashboard-sync|dev-dashboard/.test(text)) return { value: "dashboard sync / project-system", explicit: true };
  if (/xai-web-to-desktop-sync|d3/.test(text)) return { value: "D3 Web -> Desktop gate", explicit: true };
  if (/account-sync|d4/.test(text)) return { value: "D4 account-sync scope gate", explicit: true };
  if (/xai-release-log|release-log/.test(text)) return { value: "ship -> release-log", explicit: true };
  if (/xai-roadmap-loop|roadmap-loop/.test(text)) return { value: "roadmap-loop", explicit: true };
  if (/workflow-router/.test(text)) return { value: "brief / prompt routing", explicit: true };
  if (/feature[-_\s]/.test(text)) return { value: "Feature Workflow V2", explicit: true };
  if (/bugfix|bug[-_\s]/.test(text)) return { value: "Bugfix Workflow V2", explicit: true };
  if (/\bship\b/.test(text)) return { value: "Ship Workflow", explicit: true };
  return { value: categoryByKey(categoryKey).workflow, explicit: false };
}

function usageFrequencyFor(entry, categoryKey) {
  const name = String(entry.name || "").toLowerCase();
  if (/xai-feature-full-loop|xai-dev-dashboard-sync|workflow-router|feature-(plan|review|build|verify)|ship/.test(name)) {
    return "高：日常 Workflow / 看板入口";
  }
  if (entry.kind === "agent" && /Feature Workflow|Bugfix Workflow|Ship/.test(entry.category_label || "")) {
    return "中高：按工作流阶段使用";
  }
  if (entry.kind === "skill" && String(entry.path || "").startsWith(".teams/skills/")) {
    return "中：按项目治理或功能推进使用";
  }
  if (categoryKey === "quality" || categoryKey === "authoring") return "按需：评审、创作或专项治理时使用";
  return "低/按需：参考或辅助场景使用";
}

function explicitNoteFor(text) {
  return sectionSnippet(markdownSection(text, ["Short Note", "Note", "Notes", "备注", "注释", "Comment", "Comments"]), 180);
}

function inferredNoteFor(entry, categoryKey) {
  if (entry.kind === "agent") return `该 Agent 是 ${entry.related_workflow || categoryByKey(categoryKey).workflow} 的执行单元，维护时需同步各平台定义。`;
  if (String(entry.path || "").startsWith(".teams/skills/")) return "项目级 skill；维护时需同步 `.teams/skills` 源和 Claude/Codex 镜像。";
  if (String(entry.path || "").startsWith(".codex/skills/")) return "Codex 本地 skill；用于当前开发环境的可复用能力。";
  return `${categoryByKey(categoryKey).title} 分类下的辅助能力；必要时补充显式注释。`;
}

function gitStatusForPaths(paths) {
  const output = git(["status", "--short", "--", ...paths]);
  if (!output) return { state: "clean", raw: "" };
  if (output.split(/\r?\n/).some(line => line.startsWith("??"))) return { state: "new", raw: output };
  return { state: "modified", raw: output };
}

function latestUpdatedAt(paths) {
  const dates = paths
    .map(path => git(["log", "-1", "--format=%cI", "--", path]) || statSyncSafe(resolve(repoRoot, path))?.mtime?.toISOString() || "")
    .filter(Boolean)
    .sort();
  return dates[dates.length - 1] || "";
}

function mirrorStatusForSkill(path, name) {
  if (!String(path || "").startsWith(".teams/skills/")) return { status: "not-required", missing: [] };
  const missing = [
    `.codex/skills/${name}/SKILL.md`,
    `.claude/skills/${name}/SKILL.md`
  ].filter(relPath => !existsSync(resolve(repoRoot, relPath)));
  return {
    status: missing.length ? "missing" : "aligned",
    missing
  };
}

function maintenanceFor(paths, tracked, mirrorStatus) {
  const status = gitStatusForPaths(paths);
  if (status.state === "new") return { status: "new", label: "新增/未跟踪", changed: true };
  if (status.state === "modified") return { status: "modified", label: "已修改未提交", changed: true };
  if (!tracked) return { status: "local-only", label: "local-only", changed: false };
  if (mirrorStatus?.status === "missing") return { status: "mirror-missing", label: "镜像缺失", changed: false };
  return { status: "tracked", label: "tracked", changed: false };
}

function sourceTypeForSkillGroup(label = "") {
  if (/portable/i.test(label)) return "Portable Skill";
  if (/codex/i.test(label)) return "Codex Skill";
  if (/workflow|xai/i.test(label)) return "Project Skill";
  return "Skill";
}

function buildSkillEntry(item, group) {
  const path = item.path;
  const text = existsSync(resolve(repoRoot, path)) ? readText(resolve(repoRoot, path)) : "";
  const meta = parseFrontmatter(text);
  const description = meta.description || firstParagraph(text);
  const inputSnippet = sectionSnippet(markdownSection(text, ["Inputs", "Input", "输入", "Invocation", "Preferred invocation"]), 210);
  const outputSnippet = sectionSnippet(markdownSection(text, ["Output", "Outputs", "输出", "Sync Receipt", "Goal Prompt Output", "Task Prompt Output"]), 210);
  const explicitNote = explicitNoteFor(text);
  const relatedDocs = extractRelatedDocs(text, [ownDoc(path, "SKILL.md")]);
  const draft = {
    kind: "skill",
    name: meta.name || item.name,
    display_type: "Skill",
    type: sourceTypeForSkillGroup(group.label),
    source: group.label,
    path,
    description,
    triggers: item.triggers || [],
    related_docs: relatedDocs,
    tracked: item.tracked,
    source_text: text
  };
  const category = skillAgentCategoryFor(draft);
  const workflow = relatedWorkflowFor(draft, category);
  const mirror = mirrorStatusForSkill(path, draft.name);
  const maintenance = maintenanceFor([path], item.tracked, mirror);
  const note = explicitNote || inferredNoteFor(draft, category);
  const gaps = [];
  if (!description) gaps.push("missing_intro");
  if (!meta.description && description) gaps.push("generated_intro");
  if (!inputSnippet) gaps.push("missing_input", "generated_input");
  if (!outputSnippet) gaps.push("missing_output", "generated_output");
  if (!explicitNote) gaps.push("missing_explicit_note", "generated_note");
  if (!workflow.explicit) gaps.push("missing_related_workflow");
  if (relatedDocs.length <= 1) gaps.push("missing_related_docs");
  if (category === "reference") gaps.push("unclear_category");
  if (!item.tracked || maintenance.status === "new" || maintenance.status === "local-only") gaps.push("untracked_or_local");
  if (mirror.status === "missing") gaps.push("mirror_missing");
  return {
    id: `skill:${draft.name}`,
    name: draft.name,
    kind: "skill",
    type: "Skill",
    subtype: draft.type,
    category,
    category_label: categoryByKey(category).title,
    category_suggestion: category === "reference" ? `建议确认是否应归入 ${categoryByKey(category).title} 或更具体 workflow 分类。` : "",
    usage_scenario: (item.triggers || [])[0] || categoryByKey(category).scenario,
    function_description: description || `${draft.name} 的用途由文件名和分类推断。`,
    inputs: inputSnippet || "未显式登记；请在 SKILL.md 添加 `## Inputs` 或等价说明。",
    outputs: outputSnippet || "未显式登记；请在 SKILL.md 添加 `## Output` 或等价说明。",
    usage_frequency: usageFrequencyFor(draft, category),
    related_workflow: workflow.value,
    related_docs: relatedDocs,
    maintenance_status: maintenance.label,
    maintenance_code: maintenance.status,
    last_updated: latestUpdatedAt([path]),
    note,
    note_source: explicitNote ? "explicit" : "generated",
    path,
    tracked: item.tracked,
    changed: maintenance.changed,
    change_status: maintenance.status,
    mirror_status: mirror,
    gaps: [...new Set(gaps)],
    gap_labels: [...new Set(gaps)].map(gap => skillAgentGapLabels[gap] || gap),
    is_complete: gaps.filter(gap => !gap.startsWith("generated_")).length === 0,
    triggers: item.triggers || []
  };
}

function buildAgentEntry(family) {
  const variants = family.variants || [];
  const preferred = variants.find(variant => variant.platform === "Canonical")
    || variants.find(variant => variant.platform === "Codex")
    || variants[0]
    || {};
  const paths = variants.map(variant => variant.path).filter(Boolean);
  const text = paths.map(path => existsSync(resolve(repoRoot, path)) ? readText(resolve(repoRoot, path)) : "").join("\n\n");
  const description = preferred.description || family.summary || firstParagraph(text);
  const inputSnippet = sectionSnippet(markdownSection(text, ["Inputs", "Input", "输入", "Invocation"]), 210);
  const outputSnippet = sectionSnippet(markdownSection(text, ["Output", "Outputs", "输出", "Handoff", "Next Step"]), 210);
  const explicitNote = explicitNoteFor(text);
  const ownDocs = variants.map(variant => ownDoc(variant.path, variant.platform));
  const relatedDocs = extractRelatedDocs(text, ownDocs);
  const tracked = variants.length ? variants.every(variant => variant.tracked) : false;
  const draft = {
    kind: "agent",
    name: family.title || family.slug,
    display_type: "Agent",
    type: "Workflow Agent",
    source: variants.map(variant => variant.platform).join(" / ") || "Agent",
    path: preferred.path || paths[0] || "",
    description,
    related_docs: relatedDocs,
    tracked,
    workflow: family.group,
    source_text: text
  };
  const category = skillAgentCategoryFor(draft);
  const workflow = relatedWorkflowFor(draft, category);
  const maintenance = maintenanceFor(paths, tracked, null);
  const note = explicitNote || inferredNoteFor({ ...draft, related_workflow: workflow.value }, category);
  const gaps = [];
  if (!description) gaps.push("missing_intro");
  if (!preferred.description && description) gaps.push("generated_intro");
  if (!inputSnippet) gaps.push("missing_input", "generated_input");
  if (!outputSnippet) gaps.push("missing_output", "generated_output");
  if (!explicitNote) gaps.push("missing_explicit_note", "generated_note");
  if (!workflow.explicit && !family.group) gaps.push("missing_related_workflow");
  if (relatedDocs.length <= ownDocs.length) gaps.push("missing_related_docs");
  if (category === "reference") gaps.push("unclear_category");
  if (!tracked || maintenance.status === "new" || maintenance.status === "local-only") gaps.push("untracked_or_local");
  return {
    id: `agent:${family.slug}`,
    name: family.title || family.slug,
    kind: "agent",
    type: "Agent",
    subtype: "Workflow Agent",
    category,
    category_label: categoryByKey(category).title,
    category_suggestion: category === "reference" ? `建议确认 ${family.slug} 是否应归入某个 Workflow V2 阶段。` : "",
    usage_scenario: categoryByKey(category).scenario,
    function_description: description || `${family.slug} Workflow Agent 定义。`,
    inputs: inputSnippet || "未显式登记；请在 canonical agent template 或 TOML 描述中补输入说明。",
    outputs: outputSnippet || "未显式登记；请在 canonical agent template 或 TOML 描述中补输出说明。",
    usage_frequency: usageFrequencyFor({ ...draft, category_label: family.group }, category),
    related_workflow: workflow.value,
    related_docs: relatedDocs,
    maintenance_status: maintenance.label,
    maintenance_code: maintenance.status,
    last_updated: latestUpdatedAt(paths),
    note,
    note_source: explicitNote ? "explicit" : "generated",
    path: draft.path,
    variants,
    tracked,
    changed: maintenance.changed,
    change_status: maintenance.status,
    mirror_status: { status: "platform-variants", missing: [] },
    gaps: [...new Set(gaps)],
    gap_labels: [...new Set(gaps)].map(gap => skillAgentGapLabels[gap] || gap),
    is_complete: gaps.filter(gap => !gap.startsWith("generated_")).length === 0,
    triggers: []
  };
}

function buildSkillAgentRegistry(skillGroups, agentFamilies) {
  const skillEntries = skillGroups.flatMap(group => (group.items || []).map(item => buildSkillEntry(item, group)));
  const agentEntries = agentFamilies.map(buildAgentEntry);
  const entries = [...skillEntries, ...agentEntries].sort((a, b) =>
    a.category.localeCompare(b.category) || a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name)
  );
  const countBy = predicate => entries.filter(predicate).length;
  const gap_counts = Object.fromEntries(Object.keys(skillAgentGapLabels).map(key => [key, countBy(entry => entry.gaps.includes(key))]));
  const categories = skillAgentCategories.map(category => {
    const categoryEntries = entries.filter(entry => entry.category === category.key);
    return {
      ...category,
      count: categoryEntries.length,
      complete: categoryEntries.filter(entry => entry.is_complete).length,
      gaps: categoryEntries.reduce((sum, entry) => sum + entry.gaps.length, 0)
    };
  }).filter(category => category.count);
  return {
    source: "scripts/dashboard/generate-state.mjs",
    required_fields: [
      "name",
      "type",
      "category",
      "usage_scenario",
      "function_description",
      "inputs",
      "outputs",
      "usage_frequency",
      "related_workflow",
      "related_docs",
      "maintenance_status",
      "last_updated",
      "note"
    ],
    summary: {
      total: entries.length,
      skills: countBy(entry => entry.kind === "skill"),
      agents: countBy(entry => entry.kind === "agent"),
      complete: countBy(entry => entry.is_complete),
      incomplete: countBy(entry => !entry.is_complete),
      all_complete: entries.every(entry => entry.is_complete),
      missing_intro: gap_counts.missing_intro,
      missing_note: gap_counts.missing_explicit_note,
      unclear_category: gap_counts.unclear_category,
      missing_workflow: gap_counts.missing_related_workflow,
      missing_docs: gap_counts.missing_related_docs,
      changed: countBy(entry => entry.changed),
      new_items: countBy(entry => entry.change_status === "new"),
      modified_items: countBy(entry => entry.change_status === "modified")
    },
    gap_labels: skillAgentGapLabels,
    gap_counts,
    categories,
    entries,
    report: {
      missing_comments_or_definitions: entries
        .filter(entry => entry.gaps.some(gap => ["missing_intro", "missing_input", "missing_output", "missing_explicit_note"].includes(gap)))
        .map(entry => ({ name: entry.name, type: entry.type, path: entry.path, gaps: entry.gap_labels })),
      classification_suggestions: entries
        .filter(entry => entry.category_suggestion)
        .map(entry => ({ name: entry.name, type: entry.type, path: entry.path, suggestion: entry.category_suggestion })),
      changed_items: entries
        .filter(entry => entry.changed || entry.change_status === "new")
        .map(entry => ({ name: entry.name, type: entry.type, path: entry.path, status: entry.maintenance_status }))
    }
  };
}

function classifyDocImportance(path, tags = [], label = "") {
  const value = `${path} ${label} ${tags.join(" ")}`.toLowerCase();
  if (/claude\.md|agents\.md|usage-guide|handbook|plugin_map|adr-0013|subagent_workflow|sop_new_feature|sop_bugfix/.test(value)) {
    return "必读";
  }
  if (/dev_log|design\.md|api\.md|test\.md|roadmap|workflow|skill|agent/.test(value)) {
    return "必要";
  }
  if (/adr|contracts|portable|release-log|branch-policy/.test(value)) {
    return "系统级";
  }
  return "参考";
}

function docKind(path) {
  if (path.endsWith(".toml")) return "Agent TOML";
  if (path.endsWith(".mdc")) return "Cursor Rule";
  if (path.endsWith(".json")) return "JSON";
  if (path.endsWith(".md")) return "Markdown";
  if (path.endsWith(".txt")) return "Text";
  return path.includes(".") ? "File" : "Folder";
}

function docEntry(label, path, summary, tags = [], importance = "") {
  const abs = resolve(repoRoot, path);
  if (!existsSync(abs)) return null;
  const stat = statSyncSafe(abs);
  return {
    label,
    path,
    summary,
    tags,
    type: stat?.isDirectory() ? "dir" : "file",
    kind: stat?.isDirectory() ? "Folder" : docKind(path),
    importance: importance || classifyDocImportance(path, tags, label),
    updated_at: stat ? stat.mtime.toISOString() : "",
    size_bytes: stat?.isFile() ? stat.size : 0,
    tracked: Boolean(git(["ls-files", "--", path]))
  };
}

function statSyncSafe(path) {
  try {
    return existsSync(path) ? statSync(path) : null;
  } catch {
    return null;
  }
}

function buildDocCollections(skillGroups, agentFamilies) {
  const collections = [
    {
      key: "workflow",
      title: "工作流文档",
      summary: "Workflow V2、SOP、handoff、portable 迁移和自动化入口。",
      tags: ["Workflow V2", "SOP", "Handoff", "Portable"],
      entries: [
        docEntry("使用手册", "docs/workflow/project/usage-guide.md", "个人开发看板和 Workflow V2 的日常入口。", ["guide"]),
        docEntry("个人开发看板机器说明", dashboardMachineDocPath, "AI / Codex / Claude Code 使用和同步个人开发看板的机器契约。", ["dashboard", "machine"]),
        docEntry("项目手册", "docs/workflow/project/handbook.md", "当前主线、操作原则和人工确认边界。", ["handbook"]),
        docEntry("Subagent Workflow V2", "docs/workflow/SUBAGENT_WORKFLOW_V2.md", "feature / bugfix / ship agent 链路。", ["agent"]),
        docEntry("新功能 SOP", "docs/workflow/SOP_NEW_FEATURE.md", "Feature 从 brief 到 ship 的标准路径。", ["feature"]),
        docEntry("Bugfix SOP", "docs/workflow/SOP_BUGFIX.md", "Bug 诊断、修复、验证的标准路径。", ["bugfix"]),
        docEntry("Portable Manifest", "docs/workflow/_portable/00-PORTABLE-MANIFEST.md", "跨平台同步 surface 与生成规则。", ["portable"])
      ].filter(Boolean)
    },
    {
      key: "development",
      title: "开发文档",
      summary: "项目边界、ADR、插件地图、包级 design/api/test/dev_log 和运行治理。",
      tags: ["Architecture", "ADR", "Package docs", "Governance"],
      entries: [
        docEntry("CLAUDE.md", "CLAUDE.md", "跨平台共享项目规则和工程边界。", ["rules"]),
        docEntry("AGENTS.md", "AGENTS.md", "Codex 会话规则和 handoff 展示约束。", ["rules"]),
        docEntry("PLUGIN_MAP", "docs/PLUGIN_MAP.md", "全局插件/包状态地图。", ["map"]),
        docEntry("ADR-0013 分支同步治理", "docs/adr/0013-branch-sync-governance.md", "Web / Desktop / Sync 的 D3 gate 和分支拓扑。", ["adr"]),
        docEntry("ADR-0007 Web Console", "docs/adr/0007-xai-web-console-build-form.md", "Web Console 拆包、持久化键和路线图来源。", ["adr"]),
        docEntry("Contracts", "docs/contracts/README.md", "跨包合同和验证入口。", ["contracts"]),
        docEntry("Package docs", "packages", "packages/*/docs 下的 design/api/test/dev_log。", ["package"]),
        docEntry("看板设计说明", dashboardDesignPath, "个人开发看板当前实现原则和升级计划。", ["dashboard"]),
        docEntry("看板模板文档", dashboardTemplatePath, "可迁移到其它系统级项目的个人开发看板模板。", ["template", "dashboard"])
      ].filter(Boolean)
    },
    {
      key: "roadmap",
      title: "路线图 / 评审",
      summary: "产品路线图、roadmap-loop 输入、评审证据和 release log。",
      tags: ["Roadmap", "Review", "Release"],
      entries: [
        docEntry("Web Console Roadmap", "docs/workflow/roadmap/xai-web-console.md", "Web 产品主线 manifest。", ["web"]),
        docEntry("G1 Native Foundation", "docs/workflow/roadmap/xai-g1-native-foundation.md", "Desktop native foundation 路线图。", ["desktop"]),
        docEntry("Sync V1", "docs/workflow/roadmap/sync-v1.md", "账号云同步路线图。", ["sync"]),
        docEntry("Release Log", "docs/workflow/project/release-log.md", "系统层和产品层可见变化记录。", ["release"]),
        docEntry("Roadmap reviews", "docs/workflow/roadmap/codex-reviews", "Codex review 输出与复核记录。", ["review"])
      ].filter(Boolean)
    },
    {
      key: "skills",
      title: "Skill 文档",
      summary: `${skillGroups.reduce((sum, group) => sum + group.count, 0)} 个 skill，按项目级、Codex、本地 portable 分层。`,
      tags: ["Skill", "Project", "Codex", "Portable"],
      entries: skillGroups.flatMap(group => group.items.slice(0, 4).map(item =>
        docEntry(item.name, item.path, item.description || group.summary, [group.label])
      )).filter(Boolean)
    },
    {
      key: "agents",
      title: "Agent 文档",
      summary: `${agentFamilies.length} 组 Workflow Agent；Codex / Cloud / Cursor 作为同一能力的版本切换。`,
      tags: ["Agent", "Codex", "Cloud", "Cursor"],
      entries: agentFamilies.slice(0, 10).flatMap(family => {
        const preferred = family.variants.find(variant => variant.platform === "Codex") || family.variants[0];
        return preferred ? [docEntry(family.title, preferred.path, family.summary, [family.group])] : [];
      }).filter(Boolean)
    }
  ];
  return collections.map(collection => ({
    ...collection,
    count: collection.entries.length
  }));
}

function buildDocHub(skillGroups, agentFamilies) {
  const groups = [
    {
      key: "must-read",
      title: "必读文档",
      summary: "进入项目和执行 Workflow 前必须先理解的规则、手册和边界。",
      importance: "必读",
      entries: [
        docEntry("看板机器说明", dashboardMachineDocPath, "机器读取的看板契约、同步规则和 AI 使用边界。", ["dashboard", "machine"], "必读"),
        docEntry("看板可复用模板", dashboardTemplatePath, "新项目复用个人开发看板时的结构、视觉和管理逻辑模板。", ["dashboard", "template"], "必读"),
        docEntry("AGENTS.md", "AGENTS.md", "Codex 会话规则、handoff 展示和 agent/skill tracking 边界。", ["rules", "codex"], "必读"),
        docEntry("CLAUDE.md", "CLAUDE.md", "跨平台共享工程规则、架构边界和测试要求。", ["rules", "architecture"], "必读"),
        docEntry("项目使用手册", "docs/workflow/project/usage-guide.md", "个人开发看板与 Workflow V2 的日常入口。", ["guide", "workflow"], "必读"),
        docEntry("项目手册", "docs/workflow/project/handbook.md", "当前主线、人工确认边界和操作节奏。", ["handbook"], "必读"),
        docEntry("PLUGIN_MAP", "docs/PLUGIN_MAP.md", "插件/包状态地图和依赖准入状态。", ["map", "status"], "必读")
      ].filter(Boolean)
    },
    {
      key: "core-flow",
      title: "核心开发流程",
      summary: "新功能、bugfix、验证、ship 和 release log 的主路径。",
      importance: "必要",
      entries: [
        docEntry("Subagent Workflow V2", "docs/workflow/SUBAGENT_WORKFLOW_V2.md", "feature / bugfix / ship agent 链路。", ["workflow", "agent"], "必要"),
        docEntry("新功能 SOP", "docs/workflow/SOP_NEW_FEATURE.md", "Feature 从 brief 到 ship 的标准路径。", ["feature"], "必要"),
        docEntry("Bugfix SOP", "docs/workflow/SOP_BUGFIX.md", "Bug 诊断、修复、验证的标准路径。", ["bugfix"], "必要"),
        docEntry("Release Log", "docs/workflow/project/release-log.md", "系统层和产品层可见变化记录。", ["release"], "必要"),
        docEntry("xai-release-log skill", ".teams/skills/xai-release-log/SKILL.md", "发布记录写入和变更摘要约束。", ["skill", "release"], "必要")
      ].filter(Boolean)
    },
    {
      key: "system-docs",
      title: "系统性文档",
      summary: "ADR、合同、分支治理、portable 同步和系统设计。",
      importance: "系统级",
      entries: [
        docEntry("ADR-0013 分支同步治理", "docs/adr/0013-branch-sync-governance.md", "Web / Desktop / Sync 的 D3 gate 和分支拓扑。", ["adr", "branch"], "系统级"),
        docEntry("ADR-0007 Web Console", "docs/adr/0007-xai-web-console-build-form.md", "Web Console 拆包、持久化键和路线图来源。", ["adr", "web"], "系统级"),
        docEntry("Contracts", "docs/contracts/README.md", "跨包合同和验证入口。", ["contracts"], "系统级"),
        docEntry("Portable Manifest", "docs/workflow/_portable/00-PORTABLE-MANIFEST.md", "跨平台同步 surface 与生成规则。", ["portable"], "系统级"),
        docEntry("Branch Policy", "docs/workflow/project/branch-policy.json", "长期分支和 D3 gate 的机器可读策略。", ["branch", "json"], "系统级"),
        docEntry("看板模板文档", dashboardTemplatePath, "新项目复用个人开发看板时的结构、视觉和管理逻辑模板。", ["dashboard", "template"], "系统级")
      ].filter(Boolean)
    },
    {
      key: "skill-agent",
      title: "Skill / Agent 文档",
      summary: "项目 skill、Codex skill、Workflow Agent 多平台版本。",
      importance: "必要",
      entries: [
        ...skillGroups.flatMap(group => group.items.slice(0, 3).map(item =>
          docEntry(item.name, item.path, item.description || group.summary, ["skill", group.label], "必要")
        )),
        ...agentFamilies.slice(0, 8).map(family => {
          const preferred = family.variants.find(variant => variant.platform === "Codex") || family.variants[0];
          return preferred ? docEntry(family.title, preferred.path, family.summary, ["agent", family.group], "必要") : null;
        })
      ].filter(Boolean)
    },
    {
      key: "workflow-docs",
      title: "工作流文档",
      summary: "portable 工作流、roadmap loop、feature full loop 和 web-to-desktop gate。",
      importance: "必要",
      entries: [
        docEntry("xai-feature-full-loop", ".teams/skills/xai-feature-full-loop/SKILL.md", "端到端 feature pipeline 编排。", ["skill", "feature"], "必要"),
        docEntry("xai-dev-dashboard-sync", dashboardSyncSkillPath, "刷新和核验个人开发看板 Overview 快照。", ["skill", "dashboard"], "必要"),
        docEntry("xai-roadmap-loop", ".teams/skills/xai-roadmap-loop/SKILL.md", "Roadmap manifest 分波推进。", ["skill", "roadmap"], "必要"),
        docEntry("xai-web-to-desktop-sync", ".teams/skills/xai-web-to-desktop-sync/SKILL.md", "Web 变更进入 Desktop 前的 D3 分类。", ["skill", "sync"], "必要"),
        docEntry("Portable usage guide", "docs/workflow/_portable/usage-guide.md", "可迁移 workflow 使用说明。", ["portable", "workflow"], "必要")
      ].filter(Boolean)
    },
    {
      key: "project-rules",
      title: "项目规则文档",
      summary: "工具链规则、handoff 规则、Cursor rule 和平台同步约束。",
      importance: "必读",
      entries: [
        docEntry("AGENTS.md", "AGENTS.md", "Codex 会话规则。", ["codex"], "必读"),
        docEntry("CLAUDE.md", "CLAUDE.md", "共享项目规则。", ["claude"], "必读"),
        docEntry("Cursor handoff rule", ".cursor/rules/handoff.mdc", "Cursor 侧 handoff 展示规则。", ["cursor"], "必读"),
        docEntry("Codex config", ".codex/config.toml", "Codex agent depth 和配置。", ["codex", "config"], "系统级")
      ].filter(Boolean)
    }
  ];
  const roots = [
    docEntry("docs", "docs", "项目文档根目录：ADR、workflow、reviews、planning、prototype。", ["root"], "必读"),
    docEntry("docs/workflow", "docs/workflow", "Workflow、roadmap、project handbook、portable 文档。", ["workflow"], "必要"),
    docEntry("docs/prototypes/dev-dashboard", "docs/prototypes/dev-dashboard", "个人开发看板源文件、模板和静态 UI。", ["dashboard"], "必要"),
    docEntry("docs/adr", "docs/adr", "架构决策记录。", ["adr"], "系统级"),
    docEntry("packages/*/docs", "packages", "各 package 的 design/api/test/dev_log 文档入口。", ["package"], "必要"),
    docEntry(".teams/skills", ".teams/skills", "XAI 项目级 workflow skills。", ["skill"], "必要"),
    docEntry(".codex/skills", ".codex/skills", "Codex 本地 skill 文档。", ["skill", "codex"], "参考"),
    docEntry(".codex/agents", ".codex/agents", "Codex Workflow Agent TOML。", ["agent", "codex"], "必要"),
    docEntry(".agents/templates", ".agents/templates", "跨平台 Agent 模板源。", ["agent", "template"], "系统级"),
    docEntry(".claude/agents", ".claude/agents", "Claude/Cloud Agent 版本。", ["agent", "cloud"], "参考"),
    docEntry(".cursor/agents", ".cursor/agents", "Cursor Agent 版本。", ["agent", "cursor"], "参考")
  ].filter(Boolean);
  const byPath = new Map();
  [...roots, ...groups.flatMap(group => group.entries)].forEach(entry => {
    if (!byPath.has(entry.path)) byPath.set(entry.path, entry);
  });
  return {
    roots,
    groups: groups.map(group => ({ ...group, count: group.entries.length })),
    by_path: Object.fromEntries(byPath)
  };
}

function latestReleaseEntry() {
  if (!existsSync(releaseLogPath)) return "";
  const text = readFileSync(releaseLogPath, "utf8");
  const match = text.match(/^###\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

function classifyReleaseType(title) {
  const t = String(title).toLowerCase();
  if (/skill|发布日志/.test(t)) return "skill";
  if (/规则|治理|governance|adr|分支|branch/.test(t)) return "governance";
  return "docs";
}

let releaseModuleMeta = {
  web: {
    title: "Web 分支",
    tone: "blue",
    aliases: ["web", "xai-web", "web-console", "calendar", "tasks", "matrix", "statistics", "board"]
  },
  app: {
    title: "App / Mac 桌面版本",
    tone: "green",
    aliases: ["app", "mac", "desktop", "tauri", "native", "dmg", "mas"]
  },
  plugin: {
    title: "桌面插件",
    tone: "purple",
    aliases: ["plugin", "widget", "clipboard", "organizer", "ai-cube"]
  },
  sync: {
    title: "账号云同步",
    tone: "cyan",
    aliases: ["sync", "cloud", "account", "auth", "device-session"]
  },
  site: {
    title: "官网",
    tone: "yellow",
    aliases: ["site", "official", "release-site", "cloudflare", "website", "官网"]
  },
  admin: {
    title: "管理者 / 开发者 Dashboard",
    tone: "red",
    aliases: ["admin", "dashboard", "control plane", "dev-dashboard", "project-system"]
  }
};

function buildReleaseModuleMeta(sourceProducts) {
  if (!Array.isArray(sourceProducts) || !sourceProducts.length) return releaseModuleMeta;
  const fromRegistry = Object.fromEntries(sourceProducts.map(product => {
    const labels = product.labels || {};
    const visual = product.visual || {};
    const tracking = product.tracking || {};
    const fallback = releaseModuleMeta[product.key] || {};
    return [product.key, {
      title: labels.release || fallback.title || product.title || product.key,
      tone: visual.tone || fallback.tone || "blue",
      aliases: tracking.release_aliases || fallback.aliases || [product.key]
    }];
  }));
  return { ...releaseModuleMeta, ...fromRegistry };
}

function cleanReleaseValue(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function releaseTestVerdict(text) {
  const value = String(text || "").toLowerCase();
  if (!value) return "unknown";
  if (/failed|failure|fail\b|失败|阻断|\bred\b/.test(value)) return "fail";
  if (/未跑|not run|skipped|deferred|partial|blocked|阻塞|跳过|待补|仍被|仍需/.test(value)) return "partial";
  if (/passed|pass\b|green|exit 0|confirmed|成功|通过/.test(value)) return "pass";
  return "unknown";
}

function releaseTestCategories(text) {
  const value = String(text || "").toLowerCase();
  const categories = [];
  const add = key => { if (!categories.includes(key)) categories.push(key); };
  if (/self[- ]?test|自测|manual smoke|browser smoke|smoke/.test(value)) add("self_test");
  if (/unit|vitest|cargo test|test\)/.test(value)) add("unit");
  if (/e2e|playwright|browser smoke|chrome|safari|firefox|端到端/.test(value)) add("e2e");
  if (/backend|api|cargo|rust|tauri|sqlite|supabase|rls|后端/.test(value)) add("backend");
  if (/frontend|page|browser|chrome|390px|responsive|页面/.test(value)) add("frontend_page");
  if (/build|typecheck|check-types|lint|eslint|node --check|构建/.test(value)) add("build");
  if (/deploy|pre.?deploy|csp|cloudflare|上线|部署/.test(value)) add("pre_deploy");
  if (/regression|回归/.test(value)) add("regression");
  return categories.length ? categories : ["self_test"];
}

function testRecordFromReleaseEntry(entry) {
  if (!entry?.verification) return null;
  const status = releaseTestVerdict(entry.verification);
  return {
    id: `release-${entry.id}`,
    source: "release-log",
    module: entry.module,
    related_modules: entry.related_modules || [entry.module].filter(Boolean),
    date: entry.date,
    title: entry.title,
    status,
    conclusion: entry.verification,
    failure_count: status === "fail" ? 1 : 0,
    duration: "",
    categories: releaseTestCategories(entry.verification),
    report_path: "docs/workflow/project/release-log.md"
  };
}

function releaseSummary(entry) {
  return cleanReleaseValue(
    entry.user_visible ||
    entry.added ||
    entry.improved ||
    entry.fixed ||
    entry.developer_delta ||
    entry.title
  );
}

function versionLabel(entry) {
  return cleanReleaseValue(entry.version || entry.version_change || `snapshot ${entry.date}`);
}

function releaseEntryModule(entry) {
  const declared = splitReleaseModules(entry.product_line);
  if (declared.length) return declared[0];
  const fields = [
    entry.product_line,
    entry.branch_commit,
    entry.title,
    entry.user_visible,
    entry.developer_delta,
    entry.impact
  ].join(" ").toLowerCase();
  if (/\b(admin-dashboard|admin|dev-dashboard|control plane)\b/.test(fields) || /看板/.test(fields)) return "admin";
  if (/\b(sync|cloud|account|auth|device-session)\b/.test(fields)) return "sync";
  if (/\b(plugin|widget|clipboard|organizer|ai-cube)\b/.test(fields)) return "plugin";
  if (/\b(site|official|release-site|cloudflare|website|官网)\b/.test(fields)) return "site";
  if (/\b(app|mac|desktop|tauri|native|dmg|mas)\b/.test(fields)) return "app";
  if (/\b(web|xai-web|calendar|tasks|matrix|statistics|board)\b/.test(fields)) return "web";
  return "admin";
}

function splitReleaseModules(value) {
  const raw = cleanReleaseValue(value).toLowerCase();
  if (!raw) return [];
  return Object.entries(releaseModuleMeta)
    .filter(([, meta]) => meta.aliases.some(alias => raw.includes(alias)))
    .map(([key]) => key);
}

function normalizeReleaseField(label) {
  const key = String(label || "").trim().toLowerCase();
  if (key === "product line" || key === "product-line") return "product_line";
  if (key === "branch / commit" || key === "branch/commit") return "branch_commit";
  if (key === "user-visible change" || key === "user visible change") return "user_visible";
  if (key === "developer/system delta" || key === "developer system delta") return "developer_delta";
  if (key === "risk / follow-up" || key === "risk/follow-up") return "risk_followup";
  if (key === "version" || key === "version change" || key === "version_change") return "version";
  if (key === "added" || key === "新增功能") return "added";
  if (key === "improved" || key === "optimized" || key === "优化内容") return "improved";
  if (key === "fixed" || key === "fixes" || key === "修复问题") return "fixed";
  if (key === "impact" || key === "影响范围") return "impact";
  if (key === "audience note" || key === "notes" || key === "说明") return "audience_note";
  if (key === "verification") return "verification";
  return key.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

// Derive structured release entries from the real release-log.md (## <date>
// -> ### <title> -> typed bullets). Older rows without explicit release-note
// fields degrade to a summary instead of disappearing.
function parseReleaseEntries(limit = 16) {
  if (!existsSync(releaseLogPath)) return [];
  const lines = readFileSync(releaseLogPath, "utf8").split(/\r?\n/);
  const entries = [];
  let currentDate = "";
  let current = null;
  const flush = () => {
    if (current?.title) {
      const summary = releaseSummary(current);
      const moduleKey = current.module || releaseEntryModule(current);
      const relatedModules = [...new Set([
        moduleKey,
        ...splitReleaseModules(current.product_line),
        ...splitReleaseModules(current.impact)
      ])].filter(Boolean);
      entries.push({
        ...current,
        id: `${current.date}-${current.title}`.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-"),
        module: moduleKey,
        related_modules: relatedModules,
        type: classifyReleaseType(current.title),
        testing_status: releaseTestVerdict(current.verification),
        testing_categories: releaseTestCategories(current.verification),
        version_label: versionLabel(current),
        summary: summary.length > 148 ? `${summary.slice(0, 148)}…` : summary
      });
    }
    current = null;
  };
  for (const line of lines) {
    const dateMatch = line.match(/^##\s+(\d{4}-\d{2}-\d{2})\s*$/);
    if (dateMatch) {
      flush();
      currentDate = dateMatch[1];
      continue;
    }
    const titleMatch = line.match(/^###\s+(.+?)\s*$/);
    if (titleMatch) {
      flush();
      current = { date: currentDate, title: titleMatch[1] };
      continue;
    }
    const fieldMatch = line.match(/^[-*]\s*([^:：]+)[:：]\s*(.+)$/);
    if (fieldMatch && current) {
      current[normalizeReleaseField(fieldMatch[1])] = cleanReleaseValue(fieldMatch[2]);
    }
  }
  flush();
  return entries.slice(0, limit);
}

function parseReleaseRows(limit = 8) {
  return parseReleaseEntries(limit).map(entry => [
    entry.date,
    entry.title,
    entry.summary,
    entry.type
  ]);
}

function buildReleaseModules(entries) {
  return Object.entries(releaseModuleMeta).map(([key, meta]) => {
    const items = entries.filter(entry => entry.related_modules.includes(key));
    const latest = items[0] || null;
    return {
      key,
      title: meta.title,
      tone: meta.tone,
      count: items.length,
      latest_date: latest?.date || "",
      latest_title: latest?.title || "暂无模块发布",
      latest_summary: latest?.summary || "等待 release-log.md 写入该模块的发布说明。",
      entries: items.slice(0, 4)
    };
  });
}

function buildOverallReleases(entries, limit = 5) {
  const byDate = new Map();
  entries.forEach(entry => {
    if (!byDate.has(entry.date)) byDate.set(entry.date, []);
    byDate.get(entry.date).push(entry);
  });
  return [...byDate.entries()].slice(0, limit).map(([date, items]) => {
    const modules = [...new Set(items.flatMap(item => item.related_modules))];
    const added = items.map(item => item.added || item.user_visible).filter(Boolean).slice(0, 3);
    const improved = items.map(item => item.improved || item.developer_delta).filter(Boolean).slice(0, 3);
    const fixed = items.map(item => item.fixed).filter(Boolean).slice(0, 3);
    const impacts = items.map(item => item.impact || item.product_line).filter(Boolean).slice(0, 4);
    return {
      date,
      version_label: items.find(item => item.version)?.version_label || `project snapshot ${date}`,
      title: items[0]?.title || "项目阶段更新",
      summary: items.map(item => item.summary).filter(Boolean).slice(0, 2).join(" / "),
      modules,
      added,
      improved,
      fixed,
      impact: impacts,
      audience_note: items.find(item => item.audience_note)?.audience_note || "",
      entries: items.slice(0, 6).map(item => ({
        title: item.title,
        module: item.module,
        summary: item.summary
      }))
    };
  });
}

function firstDateValue(items, key) {
  return (items || []).map(item => item[key]).filter(Boolean).sort().reverse()[0] || "";
}

function findKnownReportSources(sourceTesting) {
  const manualSources = Array.isArray(sourceTesting.report_sources) ? sourceTesting.report_sources : [];
  const known = [
    { label: "Playwright report", path: "playwright-report/index.html", type: "e2e" },
    { label: "Test results", path: "test-results", type: "e2e" },
    { label: "Coverage", path: "coverage/index.html", type: "coverage" },
    { label: "Release log verification", path: "docs/workflow/project/release-log.md", type: "release-log" }
  ];
  const byPath = new Map([...manualSources, ...known].map(item => [item.path, item]));
  return [...byPath.values()].map(item => {
    const abs = resolve(repoRoot, item.path);
    return {
      ...item,
      exists: existsSync(abs),
      note: item.note || (existsSync(abs) ? "found in working tree" : "not present in working tree")
    };
  });
}

function scanTestingPipelines(sourceTesting) {
  const manual = Array.isArray(sourceTesting.pipelines) ? sourceTesting.pipelines : [];
  const workflows = existsSync(workflowDir)
    ? readdirSync(workflowDir, { withFileTypes: true })
      .filter(entry => entry.isFile() && /\.(ya?ml)$/i.test(entry.name))
      .map(entry => {
        const path = `.github/workflows/${entry.name}`;
        const text = readText(resolve(repoRoot, path));
        const nameMatch = text.match(/^name:\s*(.+)$/m);
        return {
          id: entry.name.replace(/\.(ya?ml)$/i, ""),
          name: nameMatch ? nameMatch[1].trim() : entry.name,
          path,
          status: "configured",
          last_result: "not queried",
          categories: releaseTestCategories(text)
        };
      })
    : [];
  const byId = new Map([...workflows, ...manual].map(item => [item.id || item.path || item.name, item]));
  return [...byId.values()];
}

function mergeTestStatus(values) {
  const statuses = values.filter(Boolean);
  if (!statuses.length) return "unknown";
  if (statuses.includes("fail")) return "fail";
  if (statuses.includes("partial")) return "partial";
  if (statuses.includes("stale")) return "stale";
  if (statuses.includes("pass")) return "pass";
  return statuses[0] || "unknown";
}

function buildTestingState(sourceTesting, productLines, releaseEntries) {
  const manualModules = Array.isArray(sourceTesting.modules) ? sourceTesting.modules : [];
  const manualRecords = Array.isArray(sourceTesting.records) ? sourceTesting.records : [];
  const releaseRecords = releaseEntries.map(testRecordFromReleaseEntry).filter(Boolean);
  const records = [...manualRecords, ...releaseRecords]
    .map(record => ({
      related_modules: record.related_modules || [record.module].filter(Boolean),
      failure_count: Number(record.failure_count) || 0,
      categories: Array.isArray(record.categories) ? record.categories : [],
      ...record
    }))
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const modules = productLines.map(product => {
    const manual = manualModules.find(item => item.key === product.key) || {};
    const moduleRecords = records.filter(record => {
      const related = record.related_modules || [record.module].filter(Boolean);
      return related.includes(product.key);
    });
    const latest = moduleRecords[0] || null;
    const categoryMap = Object.fromEntries((manual.categories || []).map(item => [item.key, item]));
    moduleRecords.flatMap(record => record.categories || []).forEach(category => {
      if (!categoryMap[category]) {
        categoryMap[category] = {
          key: category,
          status: latest?.status || "unknown",
          detail: latest?.title || "来自 release-log verification"
        };
      }
    });
    const categoryValues = Object.values(categoryMap);
    const status = mergeTestStatus([
      latest?.status,
      manual.status,
      ...categoryValues.map(item => item.status)
    ]);
    const failureCount = Number(manual.failure_count) || moduleRecords.reduce((sum, record) => sum + (Number(record.failure_count) || 0), 0);
    return {
      key: product.key,
      title: manual.title || product.labels?.overview || product.title,
      status,
      passed: status === "pass",
      latest_tested_at: manual.latest_tested_at || latest?.date || "",
      conclusion: manual.conclusion || latest?.conclusion || latest?.title || "暂无测试结论登记",
      failure_count: failureCount,
      duration: manual.duration || latest?.duration || "",
      pipeline_status: manual.pipeline_status || "not queried",
      report_path: manual.report_path || latest?.report_path || "",
      categories: categoryValues,
      latest_record: latest,
      record_count: moduleRecords.length,
      commands: manual.commands || [],
      next: manual.next || ""
    };
  });
  const counts = modules.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  const failing = modules.reduce((sum, item) => sum + (Number(item.failure_count) || 0), 0);
  return {
    summary: {
      latest_tested_at: sourceTesting.summary?.latest_tested_at || firstDateValue(records, "date") || "未登记",
      overall_status: sourceTesting.summary?.overall_status || (counts.fail ? "存在失败测试" : counts.partial ? "测试状态部分登记" : "测试结果看板已接入"),
      source: sourceTesting.summary?.source || "dashboard-state.json + release-log Verification + local report scan",
      module_count: modules.length,
      passing_modules: counts.pass || 0,
      failing_modules: counts.fail || 0,
      partial_modules: counts.partial || 0,
      unknown_modules: counts.unknown || 0,
      failure_count: failing
    },
    categories: sourceTesting.categories || [],
    modules,
    records: records.slice(0, 24),
    pipelines: scanTestingPipelines(sourceTesting),
    report_sources: findKnownReportSources(sourceTesting)
  };
}

function splitMarkdownRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(cell => cell.trim());
}

function isSeparatorRow(line) {
  return /^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function parseMarkdownTables(text) {
  const lines = text.split(/\r?\n/);
  const tables = [];
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (!lines[i].trim().startsWith("|") || !isSeparatorRow(lines[i + 1])) {
      continue;
    }
    const headers = splitMarkdownRow(lines[i]);
    const rows = [];
    i += 2;
    while (i < lines.length && lines[i].trim().startsWith("|")) {
      const cells = splitMarkdownRow(lines[i]);
      if (cells.length >= headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = cells[index] || "";
        });
        rows.push(row);
      }
      i += 1;
    }
    tables.push({ headers, rows });
  }
  return tables;
}

function normalizeStatus(value) {
  return String(value || "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim()
    // Drop human annotations like "NEEDS_REVIEW (B1 revised -> re-review)" so
    // they fold into the base enum instead of leaking a pseudo-status into the UI.
    .replace(/\s*[（(\[].*$/s, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function countByStatus(rows) {
  return rows.reduce((counts, row) => {
    const status = normalizeStatus(row.status);
    if (!status) return counts;
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
}

function totalFromCounts(counts) {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

function parsePluginMap() {
  try {
    if (!existsSync(pluginMapPath)) return { source: relative(repoRoot, pluginMapPath), entries: [], status_counts: {} };
    const entries = parseMarkdownTables(readText(pluginMapPath))
      .filter(table => table.headers.some(header => header.toLowerCase() === "状态" || header.toLowerCase() === "status"))
      .flatMap(table => table.rows.map(row => {
        const name = row.Plugin || row.Package || row.Slug || row.Tier || row.Surface || "";
        const path = row["目录"] || row["Packages"] || row["Packages (representative)"] || "";
        const status = row["状态"] || row.Status || row["Current dev-status (per ADR-0010)"] || "";
        return {
          name,
          path,
          status: normalizeStatus(status),
          raw_status: status
        };
      }))
      .filter(entry => entry.name && entry.status);
    return {
      source: relative(repoRoot, pluginMapPath),
      entries,
      status_counts: countByStatus(entries)
    };
  } catch {
    return { source: relative(repoRoot, pluginMapPath), entries: [], status_counts: {} };
  }
}

function parseRoadmapManifest(filename) {
  try {
    const path = resolve(roadmapDir, filename);
    if (!existsSync(path)) return null;
    const table = parseMarkdownTables(readText(path)).find(candidate => {
      const headers = candidate.headers.map(header => header.toLowerCase());
      return headers.includes("#") && headers.includes("slug") && headers.includes("status");
    });
    if (!table) return null;
    const rows = table.rows
      .map(row => ({
        number: row["#"],
        slug: row.Slug,
        status: normalizeStatus(row.Status),
        last_run: row["Last Run"] || ""
      }))
      .filter(row => row.slug && row.status);
    return {
      filename,
      source: relative(repoRoot, path),
      rows,
      status_counts: countByStatus(rows),
      total: rows.length
    };
  } catch {
    return null;
  }
}

function listRoadmapManifests() {
  try {
    if (!existsSync(roadmapDir)) return [];
    return roadmapAllowlist
      .map(parseRoadmapManifest)
      .filter(Boolean)
      .sort((a, b) => a.filename.localeCompare(b.filename));
  } catch {
    return [];
  }
}

function mergeCounts(manifests) {
  return manifests.reduce((merged, manifest) => {
    Object.entries(manifest.status_counts).forEach(([status, count]) => {
      merged[status] = (merged[status] || 0) + count;
    });
    return merged;
  }, {});
}

function formatCounts(counts) {
  const ordered = ["SHIPPED", "READY_TO_SHIP", "READY_FOR_VERIFY", "NEEDS_REVIEW", "PENDING", "BLOCKED_EXTERNAL", "BLOCKED", "PAUSED"];
  const parts = ordered
    .filter(status => counts[status])
    .map(status => `${status}:${counts[status]}`);
  Object.keys(counts)
    .filter(status => !ordered.includes(status))
    .sort()
    .forEach(status => parts.push(`${status}:${counts[status]}`));
  return parts.join(" · ") || "no rows";
}

function summarizeProductStatus(counts, emptyLabel = "无 manifest 行") {
  const total = totalFromCounts(counts);
  if (!total) return emptyLabel;
  return `${total} rows · ${formatCounts(counts)}`;
}

function progressFromCounts(counts, fallback) {
  const total = totalFromCounts(counts);
  if (!total) return fallback;
  const weighted =
    (counts.SHIPPED || 0) +
    (counts.READY_TO_SHIP || 0) * 0.9 +
    (counts.APPROVED || 0) * 0.75 +
    (counts.READY_FOR_VERIFY || 0) * 0.65 +
    (counts.NEEDS_REVIEW || 0) * 0.5 +
    (counts.IN_PROGRESS || 0) * 0.45 +
    (counts.PENDING || 0) * 0.15;
  return Math.max(5, Math.min(100, Math.round((weighted / total) * 100)));
}

function pendingSummary(counts, fallback) {
  if (counts.BLOCKED || counts.BLOCKED_EXTERNAL) return `${(counts.BLOCKED || 0) + (counts.BLOCKED_EXTERNAL || 0)} 个阻塞需处理`;
  if (counts.NEEDS_REVIEW) return `${counts.NEEDS_REVIEW} 个待评审`;
  if (counts.READY_FOR_VERIFY) return `${counts.READY_FOR_VERIFY} 个待验证`;
  if (counts.PENDING) return `${counts.PENDING} 个待排期`;
  return fallback;
}

function buildOverviewModules(productLines) {
  return productLines;
}

function badgeForCounts(counts) {
  if (counts.BLOCKED || counts.BLOCKED_EXTERNAL) return "needs attention";
  if (counts.NEEDS_REVIEW || counts.READY_FOR_VERIFY || counts.READY_TO_SHIP) return "review gate";
  if (counts.PENDING || counts.PAUSED) return "work queued";
  if (counts.SHIPPED) return "verified archive";
  return "tracked";
}

function buildProductLines(sourceProducts, roadmapManifests, pluginMap) {
  const byName = new Map(roadmapManifests.map(manifest => [manifest.filename, manifest]));
  const get = names => names.map(name => byName.get(name)).filter(Boolean);
  const countsFor = product => {
    const tracking = product.tracking || {};
    if (tracking.plugin_path_regex) {
      try {
        const regex = new RegExp(tracking.plugin_path_regex);
        return countByStatus(pluginMap.entries.filter(entry => regex.test(entry.path)));
      } catch {
        return {};
      }
    }
    return mergeCounts(get(tracking.roadmap_manifests || []));
  };
  const relatedDocsFor = product => {
    const seen = new Set();
    const tracking = product.tracking || {};
    const fromAnchors = (tracking.anchor_docs || [])
      .filter(([, path]) => existsSync(resolve(repoRoot, path)))
      .map(([label, path]) => ({ label, path }));
    const fromManifests = get(tracking.roadmap_manifests || [])
      .slice(0, 5)
      .map(manifest => ({ label: manifest.filename.replace(/\.md$/, ""), path: manifest.source }));
    return [...fromAnchors, ...fromManifests].filter(doc => {
      if (seen.has(doc.path)) return false;
      seen.add(doc.path);
      return true;
    });
  };
  return [...sourceProducts]
    .sort((a, b) => Number(a.order) - Number(b.order))
    .map(product => {
      const labels = product.labels || {};
      const visual = product.visual || {};
      const overview = product.overview || {};
      const tracking = product.tracking || {};
      const counts = countsFor(product);
      const emptyLabel = product.key === "admin" ? "0 manifest rows · prototype only" : "0 manifest rows";
      return {
        ...product,
        labels,
        visual,
        region: tracking.region || product.region || "项目系统区",
        tone: visual.tone || "blue",
        icon: visual.icon || String(product.title || "?").slice(0, 1),
        overview_title: labels.overview || product.title,
        deployment_title: labels.deployment || labels.overview || product.title,
        release_title: labels.release || product.title,
        phase: overview.phase || product.status,
        progress: progressFromCounts(counts, overview.progress_fallback || product.progress_fallback || 10),
        running: overview.running || "待确认",
        recent_update: overview.recent_update || product.status_summary || product.tracker,
        todo: pendingSummary(counts, overview.todo_fallback || product.next),
        target: overview.target || { type: "page", page: "product-flow", product_key: product.key, label: "查看详情" },
        tracking_badge: badgeForCounts(counts),
        status_counts: counts,
        status_summary: summarizeProductStatus(counts, emptyLabel),
        related_docs: relatedDocsFor(product)
      };
    });
}

function buildSignals(snapshot) {
  const divergence = snapshot.git.divergence;
  const manifests = snapshot.roadmap_manifests || [];
  const allCounts = mergeCounts(manifests);
  const sync = snapshot.sync_status || {};
  const dirtyTotal = sync.dirty?.total || 0;
  const skillStatus = sync.sync_skill?.present
    ? (sync.sync_skill.tracked ? "skill tracked" : "skill local")
    : "skill missing";
  return [
    {
      label: "web↔dev 分叉",
      badge: "正常差异",
      value: `${divergence.web_only}/${divergence.dev_only}`,
      note: "两条独立专注线，差异正常"
    },
    {
      label: "Roadmap rows",
      badge: "真实计数",
      value: String(totalFromCounts(allCounts)),
      note: `${allCounts.SHIPPED || 0} 已发布 · ${allCounts.NEEDS_REVIEW || 0} 待评审 · ${allCounts.PENDING || 0} 待办`
    },
    {
      label: "Project skills",
      badge: "tracked",
      value: String(snapshot.skills_found.length),
      note: ".teams/skills/*/SKILL.md"
    },
    {
      label: "Dashboard sync",
      badge: skillStatus,
      value: dirtyTotal ? `${dirtyTotal} dirty` : "current",
      note: `${sync.refresh_command || "pnpm dashboard"} · 最新发布 ${sync.release_log_latest || "未读取"}`
    }
  ];
}

function buildCockpit(snapshot) {
  const branch = snapshot.git.branch || "unknown";
  const web = snapshot.product_lines.find(line => line.key === "web");
  return [
    {
      question: "现在做什么",
      answer: "继续 Web 主线；Desktop 走独立 App lane",
      detail: web
        ? `${totalFromCounts(web.status_counts)} 行 · ${web.status_counts.NEEDS_REVIEW || 0} 待评审 · ${web.status_counts.READY_FOR_VERIFY || 0} 待验证`
        : "读取 Web roadmap / PLUGIN_MAP 状态"
    },
    {
      question: "在哪条线",
      answer: branch,
      detail: "当前仓库线；web 与 dev 独立推进"
    },
    {
      question: "用哪个 workflow · skill",
      answer: "xai-feature-full-loop / xai-dev-dashboard-sync",
      detail: "功能推进用 full-loop；看板新鲜度先跑 dashboard sync"
    },
    {
      question: "什么状态",
      answer: snapshot.sync_status?.status_label || "读取+提醒",
      detail: `自动化不改 roadmap、不 merge、不判断发布；dirty ${snapshot.sync_status?.dirty?.total || 0}`
    }
  ];
}

function statusPath(line) {
  const raw = String(line || "").slice(3).trim();
  if (!raw) return "";
  const renameParts = raw.split(" -> ");
  return renameParts[renameParts.length - 1] || raw;
}

function dashboardDirtyBucket(file) {
  if (file.startsWith("docs/prototypes/dev-dashboard/")) return "dashboard-ui";
  if (file.startsWith("scripts/dashboard/")) return "dashboard-generator";
  if (file === "docs/workflow/project/dashboard-state.json") return "dashboard-state";
  if (file === "docs/workflow/project/release-log.md") return "release-log";
  if (file === dashboardMachineDocPath || file === dashboardTemplatePath) return "dashboard-docs";
  if (file.startsWith(".teams/skills/") || file.startsWith(".codex/skills/") || file.startsWith(".codex/agents/")) return "skills-agents";
  if (file.startsWith("docs/")) return "docs";
  if (file.startsWith("apps/") || file.startsWith("packages/")) return "product-code";
  return "other";
}

function dirtySummary(statusLines) {
  const files = statusLines.map(statusPath).filter(Boolean);
  const buckets = files.reduce((acc, file) => {
    const bucket = dashboardDirtyBucket(file);
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});
  return {
    total: files.length,
    buckets,
    notable: files
      .filter(file => ["dashboard-ui", "dashboard-generator", "dashboard-state", "release-log", "dashboard-docs", "skills-agents"].includes(dashboardDirtyBucket(file)))
      .slice(0, 12)
  };
}

function dashboardSource(label, path) {
  const abs = resolve(repoRoot, path);
  const stat = statSyncSafe(abs);
  return {
    label,
    path,
    exists: Boolean(stat),
    updated_at: stat ? stat.mtime.toISOString() : "",
    tracked: Boolean(git(["ls-files", "--", path]))
  };
}

function buildDashboardSyncStatus(branch, latestCommit, generatedAt) {
  const statusLines = gitLines(["status", "--short"]);
  const dirty = dirtySummary(statusLines);
  const skillStat = statSyncSafe(resolve(repoRoot, dashboardSyncSkillPath));
  const skillTracked = Boolean(git(["ls-files", "--", dashboardSyncSkillPath]));
  const syncStatus = dirty.total ? "working-tree-dirty" : "clean";
  return {
    status: syncStatus,
    status_label: dirty.total ? "有未提交变更" : "已刷新",
    generated_at: generatedAt,
    refresh_command: "pnpm dashboard",
    serve_command: "pnpm dashboard:serve",
    branch,
    latest_commit: latestCommit,
    dirty,
    sync_skill: {
      name: "xai-dev-dashboard-sync",
      path: dashboardSyncSkillPath,
      present: Boolean(skillStat),
      tracked: skillTracked,
      status: skillStat ? (skillTracked ? "tracked" : "local-only") : "missing"
    },
    release_log_latest: latestReleaseEntry(),
    sources: [
      dashboardSource("manual state", "docs/workflow/project/dashboard-state.json"),
      dashboardSource("machine contract", dashboardMachineDocPath),
      dashboardSource("template", dashboardTemplatePath),
      dashboardSource("release log", "docs/workflow/project/release-log.md"),
      dashboardSource("branch policy", "docs/workflow/project/branch-policy.json"),
      dashboardSource("dashboard design", dashboardDesignPath),
      dashboardSource("sync skill", dashboardSyncSkillPath)
    ]
  };
}

function localDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return toIsoDate(date);
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function startOfWeek(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = start.getDay();
  start.setDate(start.getDate() + (weekday === 0 ? -6 : 1 - weekday));
  return start;
}

function endOfWeek(start) {
  return addDays(start, 6);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(start) {
  return new Date(start.getFullYear(), start.getMonth() + 1, 0);
}

function minDate(a, b) {
  return a.getTime() <= b.getTime() ? a : b;
}

function dayCountInclusive(start, end) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
}

function countCommits(args) {
  const commits = new Set(gitLines(["log", "--format=%H", ...args]));
  return commits.size;
}

function countActiveDays(startDate, endDate) {
  const dates = gitLines([
    "log",
    "--all",
    `--since=${startDate} 00:00`,
    `--until=${endDate} 23:59:59`,
    "--format=%cI"
  ])
    .map(line => line.slice(0, 10))
    .filter(Boolean);
  return new Set(dates).size;
}

function parseNumstat(args) {
  const rows = gitLines(["log", "--numstat", "--format=", ...args])
    .map(line => line.split(/\t/))
    .filter(parts => parts.length >= 3);
  return rows.reduce((summary, [added, deleted, file]) => {
    const add = Number(added);
    const del = Number(deleted);
    const safeAdd = Number.isFinite(add) ? add : 0;
    const safeDel = Number.isFinite(del) ? del : 0;
    summary.added += safeAdd;
    summary.deleted += safeDel;
    summary.files.add(file);
    const bucket = directoryBucket(file);
    if (!summary.by_directory[bucket]) {
      summary.by_directory[bucket] = { added: 0, deleted: 0, files: 0 };
    }
    summary.by_directory[bucket].added += safeAdd;
    summary.by_directory[bucket].deleted += safeDel;
    summary.by_directory[bucket].files += 1;
    if (isDocPath(file)) summary.docs_lines += safeAdd + safeDel;
    if (isCodePath(file)) summary.code_lines += safeAdd + safeDel;
    return summary;
  }, { added: 0, deleted: 0, files: new Set(), by_directory: {}, docs_lines: 0, code_lines: 0 });
}

function directoryBucket(file) {
  if (file.startsWith("docs/")) return "docs";
  if (file.startsWith("apps/web/")) return "apps/web";
  if (file.startsWith("apps/desktop/")) return "apps/desktop";
  if (file.startsWith(".teams/skills/")) return ".teams/skills";
  return "other";
}

function isDocPath(file) {
  return file.startsWith("docs/") || /\.(md|mdc|txt)$/i.test(file);
}

function isCodePath(file) {
  return /\.(js|jsx|ts|tsx|mjs|cjs|rs|css|html|json|toml|sql|py|sh)$/i.test(file);
}

function buildSevenDayTrend() {
  return Array.from({ length: 7 }, (_, index) => {
    const offset = index - 6;
    const date = localDate(offset);
    return {
      date,
      commits: countCommits(["--all", `--since=${date} 00:00`, `--until=${date} 23:59:59`])
    };
  });
}

function buildPeriodStats(type, count) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentStart = type === "month" ? startOfMonth(today) : startOfWeek(today);
  return Array.from({ length: count }, (_, index) => {
    const offset = index - count + 1;
    const start = type === "month" ? addMonths(currentStart, offset) : addDays(currentStart, offset * 7);
    const rawEnd = type === "month" ? endOfMonth(start) : endOfWeek(start);
    const end = minDate(rawEnd, today);
    const startDate = toIsoDate(start);
    const endDate = toIsoDate(end);
    const commits = countCommits(["--all", `--since=${startDate} 00:00`, `--until=${endDate} 23:59:59`]);
    const activeDays = countActiveDays(startDate, endDate);
    const totalDays = dayCountInclusive(start, end);
    const monthLabel = startDate.slice(0, 7);
    const rangeLabel = `${startDate.slice(5)}-${endDate.slice(5)}`;
    return {
      key: `${type}:${startDate}`,
      type,
      label: type === "month" ? monthLabel : rangeLabel,
      start_date: startDate,
      end_date: endDate,
      commits,
      active_days: activeDays,
      total_days: totalDays,
      active_rate: totalDays ? Number((activeDays / totalDays).toFixed(2)) : 0,
      is_current: rawEnd.getTime() >= today.getTime()
    };
  });
}

function listRecentBranchCommits() {
  return gitLines([
    "for-each-ref",
    "--sort=-committerdate",
    "--format=%(refname:short)|%(committerdate:iso8601)|%(objectname:short)|%(subject)",
    "refs/heads",
    "refs/remotes/origin"
  ])
    .filter(line => !line.startsWith("origin/HEAD|"))
    .slice(0, 14)
    .map(line => {
      const [name, date, commit, ...subjectParts] = line.split("|");
      return { name, date, commit, subject: subjectParts.join("|") };
    });
}

function buildDevelopmentData(branch) {
  const todayArgs = ["--all", "--since=midnight"];
  const sevenDayArgs = ["--all", "--since=7 days ago"];
  const todayNumstat = parseNumstat(todayArgs);
  const sevenDayNumstat = parseNumstat(sevenDayArgs);
  const statusLines = gitLines(["status", "--short"]);
  const originBranch = branch ? `origin/${branch}` : "";
  const recentPushTime = originBranch ? git(["log", "-1", "--format=%cI", originBranch]) : "";
  const skillChangeCommits = new Set(gitLines([
    "log",
    "--all",
    "--since=7 days ago",
    "--format=%H",
    "--",
    ".teams/skills",
    ".codex/skills",
    ".codex/agents"
  ])).size;
  return {
    source: "git",
    scope: "all refs unless noted",
    today_commits: countCommits(todayArgs),
    seven_day_commits: countCommits(sevenDayArgs),
    seven_day_trend: buildSevenDayTrend(),
    weekly_stats: buildPeriodStats("week", 8),
    monthly_stats: buildPeriodStats("month", 6),
    today_numstat: {
      added: todayNumstat.added,
      deleted: todayNumstat.deleted,
      files: todayNumstat.files.size
    },
    directory_changes: todayNumstat.by_directory,
    branch_recent_commits: listRecentBranchCommits(),
    uncommitted_files: statusLines.length,
    doc_vs_code: {
      docs_lines: sevenDayNumstat.docs_lines,
      code_lines: sevenDayNumstat.code_lines,
      ratio: sevenDayNumstat.code_lines ? Number((sevenDayNumstat.docs_lines / sevenDayNumstat.code_lines).toFixed(2)) : null
    },
    recent_push_time: recentPushTime,
    skill_change_commits: skillChangeCommits
  };
}

function readBranchPolicy(divergence) {
  try {
    if (!existsSync(branchPolicyPath)) return null;
    const policy = readJson(branchPolicyPath);
    const webLast = git(["log", "-1", "--format=%cs", "origin/web"]) || git(["log", "-1", "--format=%cs", "web"]);
    const devLast = git(["log", "-1", "--format=%cs", "origin/dev"]) || git(["log", "-1", "--format=%cs", "dev"]);
    const mergeBase = git(["merge-base", "origin/web", "origin/dev"]);
    const sharedBase = mergeBase ? git(["log", "-1", "--format=%cs", mergeBase]) : "";
    const lastTag = git(["for-each-ref", "--sort=-creatordate", "--count=1", "--format=%(refname:short) · %(creatordate:short)", "refs/tags"]);
    const current = {
      web_only: divergence.web_only,
      dev_only: divergence.dev_only,
      drift_status: "符合预期",
      drift_note: "commit 数不是异常判据；只检查该共享的变化是否已有 D3 分类或 defer 记录。",
      gate_timeline: {
        web_last_commit: webLast || "未知",
        dev_last_commit: devLast || "未知",
        shared_base: sharedBase || "未知",
        last_release_tag: lastTag || "（暂无 tag）",
        web_ahead: divergence.web_only,
        dev_ahead: divergence.dev_only,
        reminder: `web 较共同基线领先 ${divergence.web_only} 个提交、dev 领先 ${divergence.dev_only} 个；属预期分叉，只需为“该共享的改动”补一次 D3 分类或 defer。`
      }
    };
    return {
      ...policy,
      source: relative(repoRoot, branchPolicyPath),
      current
    };
  } catch {
    return null;
  }
}

function parseStatusPanel(text) {
  const tables = parseMarkdownTables(text);
  const panel = tables.find(table =>
    table.headers.map(header => header.toLowerCase()).includes("field") &&
    table.headers.map(header => header.toLowerCase()).includes("value")
  ) || tables[0];
  if (!panel) return {};
  const map = {};
  panel.rows.forEach(row => {
    const cells = Object.values(row);
    const key = (row.Field || row.field || cells[0] || "").trim();
    const value = (row.Value || row.value || cells[1] || "").trim();
    if (key) map[key.toLowerCase()] = value;
  });
  return map;
}

function classifyDevStatus(raw) {
  const s = String(raw || "").toLowerCase();
  if (/block/.test(s)) return "BLOCKED";
  if (/fix.?ready/.test(s)) return "FIX_READY";
  if (/ready.?to.?ship/.test(s)) return "READY_TO_SHIP";
  if (/verify/.test(s)) return "READY_FOR_VERIFY";
  if (/review/.test(s)) return "NEEDS_REVIEW";
  if (/approv/.test(s)) return "APPROVED";
  if (/ship|shipped|done|complete|archiv/.test(s)) return "SHIPPED";
  if (/progress|building|in.?dev|wip|active/.test(s)) return "IN_PROGRESS";
  if (/plan|brief|backlog|pending|todo|queued/.test(s)) return "PENDING";
  return "OTHER";
}

// Aggregate the per-package dev_log.md Status Panels into one task/progress view.
function scanDevLogs() {
  const dir = resolve(repoRoot, "packages");
  if (!existsSync(dir)) return { items: [], counts: {}, source_count: 0, shipped: 0 };
  const items = readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => resolve(dir, entry.name, "docs/dev_log.md"))
    .filter(existsSync)
    .map(path => {
      const panel = parseStatusPanel(readText(path));
      const rawStatus = panel.status || "";
      const pkg = relative(repoRoot, path).split("/")[1];
      return {
        package: pkg,
        feature: (panel.feature || pkg).replace(/`/g, "").trim(),
        status: classifyDevStatus(rawStatus),
        raw_status: rawStatus,
        updated: panel.updated || "",
        next: panel["suggested next"] || panel.workflow || "",
        path: relative(repoRoot, path)
      };
    })
    .filter(item => item.raw_status);
  const counts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  const order = ["BLOCKED", "FIX_READY", "NEEDS_REVIEW", "READY_FOR_VERIFY", "READY_TO_SHIP", "APPROVED", "IN_PROGRESS", "PENDING", "OTHER", "SHIPPED"];
  items.sort((a, b) => (order.indexOf(a.status) - order.indexOf(b.status)) || a.package.localeCompare(b.package));
  return { items, counts, source_count: items.length, shipped: counts.SHIPPED || 0 };
}

const source = readJson(sourcePath);
releaseModuleMeta = buildReleaseModuleMeta(source.product_lines || []);
const branch = git(["branch", "--show-current"]);
const latestCommit = git(["log", "-1", "--format=%h %s"]);
const generatedAt = new Date().toISOString();
const divergenceRaw = git(["rev-list", "--left-right", "--count", "origin/web...origin/dev"]);
const [webOnly = "0", devOnly = "0"] = divergenceRaw.split(/\s+/);
const divergence = {
  web_only: Number(webOnly) || 0,
  dev_only: Number(devOnly) || 0
};
const skillsFound = listSkills();
const agentsFound = listAgents();
const skillGroups = buildSkillGroups();
const agentFamilies = buildAgentFamilies();
const skillAgentRegistry = buildSkillAgentRegistry(skillGroups, agentFamilies);
const pluginMap = parsePluginMap();
const roadmapManifests = listRoadmapManifests();
const releaseEntries = parseReleaseEntries();
const baseProductLines = buildProductLines(source.product_lines || [], roadmapManifests, pluginMap);
const testingState = buildTestingState(source.testing || {}, baseProductLines, releaseEntries);
const productLines = baseProductLines.map(product => ({
  ...product,
  testing: testingState.modules.find(item => item.key === product.key) || null
}));

const snapshot = {
  ...source,
  repo_root: repoRoot,
  generated_at: generatedAt,
  git: {
    branch,
    latest_commit: latestCommit,
    divergence
  },
  sync_status: buildDashboardSyncStatus(branch, latestCommit, generatedAt),
  skills_found: skillsFound,
  agents_found: agentsFound,
  skill_groups: skillGroups,
  agent_families: agentFamilies,
  skill_agent_registry: skillAgentRegistry,
  doc_collections: buildDocCollections(skillGroups, agentFamilies),
  doc_hub: buildDocHub(skillGroups, agentFamilies),
  registry: {
    skills: skillsFound,
    agents: agentsFound,
    skill_agent: skillAgentRegistry
  },
  plugin_map: pluginMap,
  roadmap_manifests: roadmapManifests,
  product_module_registry: {
    source: relative(repoRoot, sourcePath),
    field: "product_lines",
    module_count: productLines.length,
    keys: productLines.map(product => product.key)
  },
  product_lines: productLines,
  release_rows: releaseEntries.slice(0, 8).map(entry => [
    entry.date,
    entry.title,
    entry.summary,
    entry.type
  ]),
  release_entries: releaseEntries,
  release_modules: buildReleaseModules(releaseEntries),
  overall_releases: buildOverallReleases(releaseEntries),
  release_log: {
    source: relative(repoRoot, releaseLogPath),
    latest_entry: latestReleaseEntry()
  },
  testing: testingState,
  branch_policy: readBranchPolicy(divergence),
  development_data: buildDevelopmentData(branch),
  task_progress: scanDevLogs()
};
snapshot.sync_status.skill_agent_registry = skillAgentRegistry.summary;
snapshot.signals = buildSignals(snapshot);
snapshot.cockpit = buildCockpit(snapshot);
snapshot.overview_modules = buildOverviewModules(snapshot.product_lines);

const body = `window.XAI_DASHBOARD_STATE = ${JSON.stringify(snapshot, null, 2)};\n`;
writeFileSync(outputPath, body);

console.log(`wrote ${relative(repoRoot, outputPath)}`);
