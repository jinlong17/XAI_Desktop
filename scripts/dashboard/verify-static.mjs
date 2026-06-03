#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const dashboardDir = resolve(repoRoot, "docs/prototypes/dev-dashboard");
const htmlPath = resolve(dashboardDir, "index.html");
const generatedPath = resolve(dashboardDir, "state.generated.js");
const requiredModuleKeys = ["web", "app", "plugin", "sync", "site", "admin"];
const requiredMountIds = [
  "primaryNavList",
  "overview",
  "snapshotMeta",
  "freshnessBadge",
  "overviewSignalGrid",
  "overviewSyncStatus",
  "overviewFlowCanvas",
  "overviewModuleGrid",
  "deployment",
  "deploymentSummaryGrid",
  "deploymentRecordList",
  "testing",
  "testingSummaryGrid",
  "testingModuleGrid",
  "testingRecordList",
  "docs",
  "docSearch",
  "docTree",
  "skill-agent",
  "skillAgentCounts",
  "skillAgentIndex",
  "skillAgentBoard",
  "release-log",
  "releaseRows"
];
const requiredScripts = [
  "./state.generated.js",
  "./js/state.js",
  "./js/utils.js",
  "./js/theme.js",
  "./js/testing.js",
  "./js/overview.js",
  "./js/product-flow.js",
  "./js/deployment.js",
  "./js/docs-library.js",
  "./js/skill-agent.js",
  "./js/ops-panels.js",
  "./js/nav.js",
  "./js/usage-ops.js",
  "./js/main.js"
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function git(args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  }).trim();
}

function gitLines(args) {
  const output = git(args);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function readGeneratedState(path) {
  const text = readFileSync(path, "utf8");
  const match = text.match(/^window\.XAI_DASHBOARD_STATE\s*=\s*([\s\S]*?);\s*$/);
  assert(match, "state.generated.js must assign window.XAI_DASHBOARD_STATE");
  return JSON.parse(match[1]);
}

function assertIdPresent(html, id) {
  const pattern = new RegExp(`\\bid\\s*=\\s*["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`);
  assert(pattern.test(html), `index.html missing required mount id: ${id}`);
}

function scriptSources(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/g)].map(match => match[1]);
}

function assertKeySet(label, keys) {
  const sorted = [...keys].sort();
  const expected = [...requiredModuleKeys].sort();
  assert(JSON.stringify(sorted) === JSON.stringify(expected), `${label} keys must be ${expected.join(", ")}; got ${keys.join(", ")}`);
  assert(new Set(keys).size === keys.length, `${label} keys must be unique`);
}

function currentDirtyCount() {
  return gitLines(["status", "--short"]).length;
}

assert(existsSync(htmlPath), `missing dashboard HTML: ${relative(repoRoot, htmlPath)}`);
assert(existsSync(generatedPath), `missing generated state: ${relative(repoRoot, generatedPath)}; run pnpm dashboard`);

const html = readFileSync(htmlPath, "utf8");
const state = readGeneratedState(generatedPath);
const scripts = scriptSources(html);

requiredMountIds.forEach(id => assertIdPresent(html, id));
assert(scripts.includes("./js/theme-bootstrap.js"), "index.html must include ./js/theme-bootstrap.js before render scripts");
const stateScriptIndex = scripts.indexOf("./state.generated.js");
assert(stateScriptIndex >= 0, "index.html must load ./state.generated.js");
requiredScripts.forEach((src, index) => {
  const actual = scripts[stateScriptIndex + index];
  assert(actual === src, `render script order mismatch at ${index + 1}: expected ${src}, got ${actual || "<missing>"}`);
  assert(src === "./state.generated.js" || existsSync(resolve(dashboardDir, src)), `missing dashboard script file: ${src}`);
});

assert(state.schema_version === 2, `expected schema_version=2, got ${state.schema_version}`);
assert(state.state_owner === "project-system", `expected state_owner=project-system, got ${state.state_owner}`);
assert(typeof state.generated_at === "string" && !Number.isNaN(Date.parse(state.generated_at)), "generated_at must be a valid ISO timestamp");
assert(state.repo_root === repoRoot, `repo_root must be ${repoRoot}; got ${state.repo_root}`);

const currentBranch = git(["branch", "--show-current"]);
const currentCommit = git(["log", "-1", "--format=%h %s"]);
assert(state.git?.branch === currentBranch, `generated branch is stale: expected ${currentBranch}, got ${state.git?.branch || "<missing>"}`);
assert(state.git?.latest_commit === currentCommit, `generated commit is stale: expected ${currentCommit}, got ${state.git?.latest_commit || "<missing>"}`);
assert(state.sync_status?.dirty?.total === currentDirtyCount(), "generated dirty-file count is stale; run pnpm dashboard");

assert(Array.isArray(state.status_rows) && state.status_rows.length > 0, "status_rows must be populated");
assert(Array.isArray(state.kpis) && state.kpis.length > 0, "kpis must be populated");
assert(state.sync_status?.refresh_command === "pnpm dashboard", "sync_status.refresh_command must stay pnpm dashboard");
assert(state.sync_status?.serve_command === "pnpm dashboard:serve", "sync_status.serve_command must stay pnpm dashboard:serve");
assert(state.sync_status?.sync_skill?.status === "tracked", "xai-dev-dashboard-sync must be present and tracked");

assert(state.product_module_registry?.field === "product_lines", "product_module_registry.field must be product_lines");
assertKeySet("product_module_registry", state.product_module_registry?.keys || []);
assert(Array.isArray(state.product_lines), "product_lines must be an array");
assert(Array.isArray(state.overview_modules), "overview_modules must be an array");
assertKeySet("product_lines", state.product_lines.map(item => item.key));
assertKeySet("overview_modules", state.overview_modules.map(item => item.key));

assert(state.testing?.summary, "testing.summary must be present");
assert(Array.isArray(state.testing?.modules), "testing.modules must be an array");
assert(Array.isArray(state.testing?.records), "testing.records must be an array");
assertKeySet("testing.modules", state.testing.modules.map(item => item.key));

assert(state.skill_agent_registry?.summary, "skill_agent_registry.summary must be present");
assert(Array.isArray(state.skill_agent_registry?.entries), "skill_agent_registry.entries must be an array");
assert(state.skill_agent_registry.entries.length > 0, "skill_agent_registry.entries must not be empty");

console.log([
  "verified static dev-dashboard:",
  `branch=${state.git.branch}`,
  `commit=${state.git.latest_commit}`,
  `dirty=${state.sync_status.dirty.total}`,
  `modules=${state.product_lines.length}`,
  `testing_records=${state.testing.records.length}`,
  `skill_agent_entries=${state.skill_agent_registry.entries.length}`
].join(" "));
