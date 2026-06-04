#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { releaseFailureCount, releaseTestVerdict } from "./release-testing.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const dashboardDir = resolve(repoRoot, "docs/prototypes/dev-dashboard");
const htmlPath = resolve(dashboardDir, "index.html");
const generatedPath = resolve(dashboardDir, "state.generated.js");
const syncRegistryPath = resolve(repoRoot, "docs/workflow/project/sync-registry.json");
const requiredMountIds = [
  "primaryNavList",
  "overview",
  "snapshotMeta",
  "freshnessBadge",
  "overviewSignalGrid",
  "overviewSyncStatus",
  "overviewFlowCanvas",
  "overviewModuleGrid",
  "syncOrchestration",
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
// Render-script load order (after ./state.generated.js, before nothing of note).
// status-meta.js + skill-groups.js are shared-vocabulary globals loaded before
// their consumers (overview/product-flow/skill-agent). ops-panels.js was split
// into branches/dev-data/tasks/release-log.js (one file per page). Keep this list
// in sync with index.html and with docs/prototypes/dev-dashboard/BOUNDARIES.md.
const requiredScripts = [
  "./state.generated.js",
  "./js/state.js",
  "./js/utils.js",
  "./js/status-meta.js",
  "./js/skill-groups.js",
  "./js/theme.js",
  "./js/testing.js",
  "./js/overview.js",
  "./js/product-flow.js",
  "./js/deployment.js",
  "./js/docs-library.js",
  "./js/skill-agent.js",
  "./js/branches.js",
  "./js/dev-data.js",
  "./js/tasks.js",
  "./js/release-log.js",
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

function gitOptional(args) {
  try {
    return git(args);
  } catch {
    return "";
  }
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

function assertKeySet(label, keys, expectedKeys) {
  const sorted = [...keys].sort();
  const expected = [...expectedKeys].sort();
  assert(JSON.stringify(sorted) === JSON.stringify(expected), `${label} keys must be ${expected.join(", ")}; got ${keys.join(", ")}`);
  assert(new Set(keys).size === keys.length, `${label} keys must be unique`);
}

function currentDirtyCount() {
  return gitLines(["status", "--short"]).length;
}

function changedFileCount(ref) {
  return gitLines(["diff-tree", "--no-commit-id", "--name-only", "-r", ref]).length;
}

assert(existsSync(htmlPath), `missing dashboard HTML: ${relative(repoRoot, htmlPath)}`);
assert(existsSync(generatedPath), `missing generated state: ${relative(repoRoot, generatedPath)}; run pnpm dashboard`);

const html = readFileSync(htmlPath, "utf8");
const state = readGeneratedState(generatedPath);
const scripts = scriptSources(html);

requiredMountIds.forEach(id => assertIdPresent(html, id));
assert(scripts.includes("./js/theme-bootstrap.js"), "index.html must include ./js/theme-bootstrap.js before render scripts");
const stateScriptIndex = scripts.indexOf("./state.generated.js");
const themeBootstrapIndex = scripts.indexOf("./js/theme-bootstrap.js");
assert(stateScriptIndex >= 0, "index.html must load ./state.generated.js");
assert(themeBootstrapIndex >= 0, "index.html must load ./js/theme-bootstrap.js");
assert(themeBootstrapIndex < stateScriptIndex, "index.html must load ./js/theme-bootstrap.js before ./state.generated.js and render scripts");
requiredScripts.forEach((src, index) => {
  const actual = scripts[stateScriptIndex + index];
  assert(actual === src, `render script order mismatch at ${index + 1}: expected ${src}, got ${actual || "<missing>"}`);
  assert(src === "./state.generated.js" || existsSync(resolve(dashboardDir, src)), `missing dashboard script file: ${src}`);
});

[
  {
    text: "Chrome/Playwright smoke passed with 0 HTTP failures and 0 console errors.",
    status: "pass",
    failureCount: 0
  },
  {
    text: "0 failures / 0 errors",
    status: "pass",
    failureCount: 0
  },
  {
    text: "Generated state confirmed zero-failure testing record as pass with failure_count=0.",
    status: "pass",
    failureCount: 0
  },
  {
    text: "Playwright failed with 2 failures.",
    status: "fail",
    failureCount: 2
  }
].forEach(fixture => {
  assert(releaseTestVerdict(fixture.text) === fixture.status, `release verdict fixture failed: ${fixture.text}`);
  assert(releaseFailureCount(fixture.text) === fixture.failureCount, `release failure-count fixture failed: ${fixture.text}`);
});

assert(state.schema_version === 2, `expected schema_version=2, got ${state.schema_version}`);
assert(state.state_owner === "project-system", `expected state_owner=project-system, got ${state.state_owner}`);
assert(typeof state.generated_at === "string" && !Number.isNaN(Date.parse(state.generated_at)), "generated_at must be a valid ISO timestamp");
assert(state.repo_root === repoRoot, `repo_root must be ${repoRoot}; got ${state.repo_root}`);

const currentBranch = git(["branch", "--show-current"]);
const currentCommit = git(["log", "-1", "--format=%h %s"]);
const parentCommit = gitOptional(["log", "-1", "--format=%h %s", "HEAD^"]);
const dirtyCount = currentDirtyCount();
const generatedCommit = state.git?.latest_commit || "";
const generatedDirtyCount = state.sync_status?.dirty?.total;
const cleanCommittedSnapshot =
  dirtyCount === 0 &&
  parentCommit &&
  generatedCommit === parentCommit &&
  generatedDirtyCount === changedFileCount("HEAD");
assert(state.git?.branch === currentBranch, `generated branch is stale: expected ${currentBranch}, got ${state.git?.branch || "<missing>"}`);
assert(
  generatedCommit === currentCommit || cleanCommittedSnapshot,
  `generated commit is stale: expected ${currentCommit}, got ${generatedCommit || "<missing>"}`
);
assert(
  generatedDirtyCount === dirtyCount || cleanCommittedSnapshot,
  "generated dirty-file count is stale; run pnpm dashboard"
);

assert(Array.isArray(state.status_rows) && state.status_rows.length > 0, "status_rows must be populated");
assert(Array.isArray(state.kpis) && state.kpis.length > 0, "kpis must be populated");
assert(state.sync_status?.refresh_command === "pnpm dashboard", "sync_status.refresh_command must stay pnpm dashboard");
assert(state.sync_status?.serve_command === "pnpm dashboard:serve", "sync_status.serve_command must stay pnpm dashboard:serve");
assert(state.sync_status?.sync_skill?.status === "tracked", "xai-dev-dashboard-sync must be present and tracked");

if (existsSync(syncRegistryPath)) {
  const syncOrchestration = state.sync_orchestration;
  assert(syncOrchestration, "sync_orchestration must be generated from sync-registry.json");
  assert(syncOrchestration.source === relative(repoRoot, syncRegistryPath), "sync_orchestration.source must point to sync-registry.json");
  assert(Array.isArray(syncOrchestration.actions) && syncOrchestration.actions.length > 0, "sync_orchestration.actions must be populated");
  assert(Array.isArray(syncOrchestration.waves) && syncOrchestration.waves.length > 0, "sync_orchestration.waves must be populated");
  (syncOrchestration.docs || []).forEach(doc => {
    assert(doc.path && !doc.path.startsWith("/"), `sync_orchestration doc path must be repo-relative: ${doc.path || "<missing>"}`);
  });
}

assert(state.product_module_registry?.field === "product_lines", "product_module_registry.field must be product_lines");
assert(Array.isArray(state.product_lines), "product_lines must be an array");
assert(Array.isArray(state.overview_modules), "overview_modules must be an array");
const requiredModuleKeys = state.product_lines.map(item => item.key);
assert(requiredModuleKeys.length > 0, "product_lines must not be empty");
assertKeySet("product_module_registry", state.product_module_registry?.keys || [], requiredModuleKeys);
assertKeySet("product_lines", state.product_lines.map(item => item.key), requiredModuleKeys);
assertKeySet("overview_modules", state.overview_modules.map(item => item.key), requiredModuleKeys);

assert(state.testing?.summary, "testing.summary must be present");
assert(Array.isArray(state.testing?.modules), "testing.modules must be an array");
assert(Array.isArray(state.testing?.records), "testing.records must be an array");
assertKeySet("testing.modules", state.testing.modules.map(item => item.key), requiredModuleKeys);
state.testing.records.forEach(record => {
  const count = releaseFailureCount(record.conclusion || record.title || "");
  if (count === 0) {
    assert(record.status !== "fail", `zero-failure testing record must not be fail: ${record.id || record.title}`);
    assert(Number(record.failure_count) === 0, `zero-failure testing record must have failure_count=0: ${record.id || record.title}`);
  }
});

assert(state.skill_agent_registry?.summary, "skill_agent_registry.summary must be present");
assert(Array.isArray(state.skill_agent_registry?.entries), "skill_agent_registry.entries must be an array");
assert(state.skill_agent_registry.entries.length > 0, "skill_agent_registry.entries must not be empty");
assert(state.skill_agent_registry.source_completeness, "skill_agent_registry.source_completeness must be present");
assert(state.skill_agent_registry.summary.source_completeness, "skill_agent_registry.summary.source_completeness must be present");

console.log([
  "verified static dev-dashboard:",
  `branch=${state.git.branch}`,
  `commit=${state.git.latest_commit}`,
  `dirty=${state.sync_status.dirty.total}`,
  `modules=${state.product_lines.length}`,
  `testing_records=${state.testing.records.length}`,
  `skill_agent_entries=${state.skill_agent_registry.entries.length}`
].join(" "));
