#!/usr/bin/env node
import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:http";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync
} from "node:fs";
import { basename, dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const dashboardDir = resolve(repoRoot, "docs/prototypes/dev-dashboard");
const adminDashboardDir = resolve(repoRoot, "docs/prototypes/admin-dashboard");
const generatorPath = resolve(scriptDir, "generate-state.mjs");
const host = "127.0.0.1";
const requestedPort = Number(process.env.DASHBOARD_PORT || process.env.PORT || 4177);
const portLocked = Boolean(process.env.DASHBOARD_PORT || process.env.PORT);
const textExtensions = new Set([".md", ".mdc", ".toml", ".json", ".txt"]);
const dashboardAssetTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"]
]);
const opsTargets = new Map([
  ["web", {
    id: "web",
    label: "Web 主应用",
    port: 3000,
    url: "http://localhost:3000"
  }]
]);
const opsActions = new Map([
  ["web:start-mock", {
    target: "web",
    label: "启动 Web mock 登录",
    command: "pnpm",
    args: ["--filter", "@repo/web", "dev:mock-auth"]
  }],
  ["web:start-dev", {
    target: "web",
    label: "启动 Web 普通 dev",
    command: "pnpm",
    args: ["--filter", "@repo/web", "dev"]
  }]
]);
const opsProcesses = new Map();
const opsLogs = new Map();
const maxOpsLogLines = 220;

function runGenerate() {
  execFileSync(process.execPath, [generatorPath], {
    cwd: repoRoot,
    stdio: "inherit"
  });
}

function appendOpsLog(targetId, line) {
  const rows = opsLogs.get(targetId) || [];
  const text = String(line || "").trimEnd();
  if (!text) return;
  text.split(/\r?\n/).forEach(part => {
    rows.push({ at: new Date().toISOString(), line: part });
  });
  opsLogs.set(targetId, rows.slice(-maxOpsLogLines));
}

function readCommand(pid) {
  try {
    return execFileSync("ps", ["-p", String(pid), "-o", "command="], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "";
  }
}

function portListeners(port) {
  try {
    const output = execFileSync("lsof", [
      "-nP",
      `-iTCP:${port}`,
      "-sTCP:LISTEN",
      "-Fpcn"
    ], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const listeners = [];
    let current = null;
    output.split(/\r?\n/).filter(Boolean).forEach(row => {
      const type = row.slice(0, 1);
      const value = row.slice(1);
      if (type === "p") {
        current = { pid: Number(value), command: "", name: "" };
        listeners.push(current);
      } else if (current && type === "c") {
        current.command = value;
      } else if (current && type === "n") {
        current.name = value;
      }
    });
    return listeners.map(item => ({
      ...item,
      command: item.command || readCommand(item.pid)
    }));
  } catch {
    return [];
  }
}

function managedOpsProcess(targetId) {
  const record = opsProcesses.get(targetId);
  if (!record || record.child.exitCode !== null || record.child.killed) {
    if (record) opsProcesses.delete(targetId);
    return null;
  }
  return record;
}

function opsTargetStatus(targetId) {
  const target = opsTargets.get(targetId);
  if (!target) {
    throw Object.assign(new Error("Unknown ops target"), { status: 404 });
  }
  const managed = managedOpsProcess(targetId);
  const listeners = portListeners(target.port);
  const managedPid = managed?.child.pid;
  const listenerPids = new Set(listeners.map(item => item.pid));
  const state = listenerPids.size ? "running" : (managed ? "starting" : "stopped");
  return {
    id: target.id,
    label: target.label,
    port: target.port,
    url: target.url,
    state,
    managed: Boolean(managed),
    pid: managedPid || listeners[0]?.pid || null,
    listeners,
    canStop: Boolean(managed),
    startedAt: managed?.startedAt || null,
    action: managed?.actionId || null,
    command: managed ? `${managed.command} ${managed.args.join(" ")}` : (listeners[0]?.command || "")
  };
}

function opsSnapshot() {
  return {
    ok: true,
    repoRoot,
    targets: [...opsTargets.keys()].map(opsTargetStatus)
  };
}

function startOpsAction(actionId) {
  const action = opsActions.get(actionId);
  if (!action) {
    throw Object.assign(new Error("Unknown ops action"), { status: 404 });
  }
  const target = opsTargets.get(action.target);
  const before = opsTargetStatus(action.target);
  if (before.state === "running") {
    appendOpsLog(action.target, `[ops] ${target.label} already listens on ${target.port}; skip duplicate start.`);
    return { ok: true, skipped: true, reason: "already-running", target: before };
  }
  if (before.state === "starting") {
    return { ok: true, skipped: true, reason: "already-starting", target: before };
  }
  appendOpsLog(action.target, `[ops] ${action.label}`);
  appendOpsLog(action.target, `[cmd] ${action.command} ${action.args.join(" ")}`);
  const child = spawn(action.command, action.args, {
    cwd: repoRoot,
    env: { ...process.env, FORCE_COLOR: "1" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const record = {
    actionId,
    args: action.args,
    child,
    command: action.command,
    startedAt: new Date().toISOString()
  };
  opsProcesses.set(action.target, record);
  child.stdout.on("data", chunk => appendOpsLog(action.target, chunk.toString("utf8")));
  child.stderr.on("data", chunk => appendOpsLog(action.target, chunk.toString("utf8")));
  child.on("error", error => appendOpsLog(action.target, `[error] ${error.message}`));
  child.on("close", (code, signal) => {
    appendOpsLog(action.target, `[ops] process exited code=${code ?? "null"} signal=${signal ?? "null"}`);
    if (opsProcesses.get(action.target)?.child === child) {
      opsProcesses.delete(action.target);
    }
  });
  return { ok: true, skipped: false, target: opsTargetStatus(action.target) };
}

function stopOpsTarget(targetId) {
  const target = opsTargets.get(targetId);
  if (!target) {
    throw Object.assign(new Error("Unknown ops target"), { status: 404 });
  }
  const managed = managedOpsProcess(targetId);
  if (!managed) {
    return {
      ok: false,
      reason: "not-managed",
      target: opsTargetStatus(targetId)
    };
  }
  appendOpsLog(targetId, `[ops] stopping ${target.label} pid=${managed.child.pid}`);
  managed.child.kill("SIGTERM");
  return { ok: true, target: opsTargetStatus(targetId) };
}

function openOpsTarget(targetId) {
  const target = opsTargets.get(targetId);
  if (!target) {
    throw Object.assign(new Error("Unknown ops target"), { status: 404 });
  }
  const child = spawn("open", [target.url], {
    cwd: repoRoot,
    detached: true,
    stdio: "ignore"
  });
  child.unref();
  return { ok: true, url: target.url, target: opsTargetStatus(targetId) };
}

function opsLogsFor(targetId) {
  if (!opsTargets.has(targetId)) {
    throw Object.assign(new Error("Unknown ops target"), { status: 404 });
  }
  return { ok: true, target: targetId, rows: opsLogs.get(targetId) || [] };
}

function pathInside(child, parent) {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !rel.startsWith("/"));
}

function repoRelative(absPath) {
  return relative(repoRoot, absPath).split("\\").join("/");
}

function packageDocRoots() {
  const packagesDir = resolve(repoRoot, "packages");
  if (!existsSync(packagesDir)) return [];
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => resolve(packagesDir, entry.name, "docs"))
    .filter(path => existsSync(path));
}

function allowedRoots() {
  return [
    resolve(repoRoot, "docs"),
    resolve(repoRoot, ".agents/templates"),
    resolve(repoRoot, ".agents/skills"),
    resolve(repoRoot, ".teams/skills"),
    resolve(repoRoot, ".codex/agents"),
    resolve(repoRoot, ".codex/skills"),
    resolve(repoRoot, ".claude/agents"),
    resolve(repoRoot, ".claude/skills"),
    resolve(repoRoot, ".cursor/agents"),
    resolve(repoRoot, ".cursor/rules"),
    resolve(repoRoot, "web design"),
    ...packageDocRoots()
  ].filter(existsSync);
}

// Specific repo-root files allowed for reading even though their parent (the
// repo root) is not a browsable directory.
function allowedFiles() {
  return ["CLAUDE.md", "AGENTS.md", "README.md"]
    .map(name => resolve(repoRoot, name))
    .filter(existsSync);
}

function resolveRepoPath(rawPath) {
  const clean = String(rawPath || "").replace(/^\/+/, "");
  return resolve(repoRoot, clean);
}

function assertAllowed(rawPath) {
  const absPath = resolveRepoPath(rawPath);
  if (!pathInside(absPath, repoRoot)) {
    throw Object.assign(new Error("Path traversal rejected"), { status: 403 });
  }
  if (allowedFiles().includes(absPath)) {
    return absPath;
  }
  if (!allowedRoots().some(root => pathInside(absPath, root))) {
    throw Object.assign(new Error("Path is outside the dashboard document whitelist"), { status: 403 });
  }
  return absPath;
}

function rootTree() {
  const fixed = ["docs", "docs/adr", "docs/workflow", ".teams/skills", ".codex/skills", ".agents/templates", ".codex/agents", ".claude/agents", ".cursor/agents", "web design"]
    .map(path => resolve(repoRoot, path))
    .filter(path => existsSync(path))
    .map(path => treeEntry(path));
  const files = allowedFiles().map(path => treeEntry(path));
  const packages = packageDocRoots().length
    ? [{ name: "packages/*/docs", path: "packages", type: "dir", virtual: true }]
    : [];
  return [...fixed, ...files, ...packages].sort(sortEntries);
}

function sortEntries(a, b) {
  if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
  return a.path.localeCompare(b.path);
}

function treeEntry(absPath) {
  const stat = statSync(absPath);
  const relPath = repoRelative(absPath);
  return {
    name: basename(absPath),
    path: relPath,
    type: stat.isDirectory() ? "dir" : "file",
    ext: stat.isDirectory() ? "" : extname(absPath).replace(/^\./, ""),
    size: stat.isFile() ? stat.size : 0,
    modified: stat.mtime.toISOString()
  };
}

function listTree(rawDir) {
  if (!rawDir) return { path: "", children: rootTree() };
  if (rawDir === "packages") {
    return { path: "packages", children: packageDocRoots().map(path => treeEntry(path)).sort(sortEntries) };
  }
  const absDir = assertAllowed(rawDir);
  if (!existsSync(absDir) || !statSync(absDir).isDirectory()) {
    throw Object.assign(new Error("Directory not found"), { status: 404 });
  }
  const children = readdirSync(absDir, { withFileTypes: true })
    .filter(entry => !entry.name.startsWith(".DS_Store"))
    .filter(entry => entry.isDirectory() || textExtensions.has(extname(entry.name)))
    .map(entry => treeEntry(resolve(absDir, entry.name)))
    .sort(sortEntries);
  return { path: repoRelative(absDir), children };
}

function readAllowedFile(rawPath) {
  const absPath = assertAllowed(rawPath);
  if (!existsSync(absPath) || !statSync(absPath).isFile()) {
    throw Object.assign(new Error("File not found"), { status: 404 });
  }
  const ext = extname(absPath);
  if (!textExtensions.has(ext)) {
    throw Object.assign(new Error("Only text documentation files are readable"), { status: 415 });
  }
  const stat = statSync(absPath);
  if (stat.size > 1024 * 1024) {
    throw Object.assign(new Error("File is too large for dashboard preview"), { status: 413 });
  }
  return {
    path: repoRelative(absPath),
    name: basename(absPath),
    ext: extname(absPath).replace(/^\./, ""),
    size: stat.size,
    modified: stat.mtime.toISOString(),
    content: readFileSync(absPath, "utf8")
  };
}

function readAllowedRawFile(rawPath) {
  const file = readAllowedFile(rawPath);
  const type = file.ext === "md" || file.ext === "mdc"
    ? "text/markdown; charset=utf-8"
    : "text/plain; charset=utf-8";
  return { ...file, type };
}

function parseSearchOutput(output) {
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(0, 120)
    .map(line => {
      const match = line.match(/^(.+?):(\d+):(.*)$/);
      if (!match) return null;
      return { path: match[1], line: Number(match[2]), text: match[3].trim() };
    })
    .filter(Boolean);
}

function searchDocs(query) {
  const q = String(query || "").trim();
  if (!q) return [];
  const roots = allowedRoots().map(repoRelative);
  try {
    const output = execFileSync("rg", [
      "-n",
      "--no-heading",
      "--color",
      "never",
      "--glob",
      "*.{md,mdc,toml,json,txt}",
      "--",
      q,
      ...roots
    ], { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return parseSearchOutput(output);
  } catch (error) {
    if (error.code !== "ENOENT") {
      return parseSearchOutput(error.stdout?.toString() || "");
    }
    try {
      const output = execFileSync("grep", [
        "-RIn",
        "--include=*.md",
        "--include=*.mdc",
        "--include=*.toml",
        "--include=*.json",
        "--include=*.txt",
        "--",
        q,
        ...roots
      ], { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      return parseSearchOutput(output);
    } catch (grepError) {
      return parseSearchOutput(grepError.stdout?.toString() || "");
    }
  }
}

function revealPath(rawPath) {
  const absPath = assertAllowed(rawPath);
  if (!existsSync(absPath)) {
    throw Object.assign(new Error("Path not found"), { status: 404 });
  }
  const child = spawn("open", ["-R", absPath], {
    cwd: repoRoot,
    detached: true,
    stdio: "ignore"
  });
  child.unref();
  return { ok: true, path: repoRelative(absPath) };
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(body);
}

function sendJson(res, status, value) {
  send(res, status, JSON.stringify(value, null, 2), "application/json; charset=utf-8");
}

function sendDashboardAsset(pathname, res) {
  if (pathname !== "/styles.css" && !pathname.startsWith("/js/")) return false;
  const relPath = decodeURIComponent(pathname).replace(/^\/+/, "");
  const absPath = resolve(dashboardDir, relPath);
  if (!pathInside(absPath, dashboardDir)) {
    throw Object.assign(new Error("Dashboard asset path traversal rejected"), { status: 403 });
  }
  if (!existsSync(absPath) || !statSync(absPath).isFile()) {
    throw Object.assign(new Error("Dashboard asset not found"), { status: 404 });
  }
  const type = dashboardAssetTypes.get(extname(absPath));
  if (!type) {
    throw Object.assign(new Error("Dashboard asset type is not supported"), { status: 415 });
  }
  send(res, 200, readFileSync(absPath, "utf8"), type);
  return true;
}

function handleApi(url, res) {
  if (url.pathname === "/api/ops/status") {
    sendJson(res, 200, opsSnapshot());
    return true;
  }
  if (url.pathname === "/api/ops/start") {
    sendJson(res, 200, startOpsAction(url.searchParams.get("action") || ""));
    return true;
  }
  if (url.pathname === "/api/ops/stop") {
    sendJson(res, 200, stopOpsTarget(url.searchParams.get("target") || ""));
    return true;
  }
  if (url.pathname === "/api/ops/open") {
    sendJson(res, 200, openOpsTarget(url.searchParams.get("target") || ""));
    return true;
  }
  if (url.pathname === "/api/ops/logs") {
    sendJson(res, 200, opsLogsFor(url.searchParams.get("target") || ""));
    return true;
  }
  if (url.pathname === "/api/tree") {
    sendJson(res, 200, listTree(url.searchParams.get("dir") || ""));
    return true;
  }
  if (url.pathname === "/api/file") {
    sendJson(res, 200, readAllowedFile(url.searchParams.get("path") || ""));
    return true;
  }
  if (url.pathname === "/api/raw") {
    const file = readAllowedRawFile(url.searchParams.get("path") || "");
    send(res, 200, file.content, file.type);
    return true;
  }
  if (url.pathname === "/api/search") {
    sendJson(res, 200, { query: url.searchParams.get("q") || "", results: searchDocs(url.searchParams.get("q")) });
    return true;
  }
  if (url.pathname === "/api/refresh") {
    runGenerate();
    sendJson(res, 200, { ok: true, refreshed: "docs/prototypes/dev-dashboard/state.generated.js" });
    return true;
  }
  if (url.pathname === "/api/reveal") {
    sendJson(res, 200, revealPath(url.searchParams.get("path") || ""));
    return true;
  }
  return false;
}

runGenerate();

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${host}:${requestedPort}`);
    if (handleApi(url, res)) return;
    if (url.pathname === "/" || url.pathname === "/index.html") {
      send(res, 200, readFileSync(resolve(dashboardDir, "index.html"), "utf8"), "text/html; charset=utf-8");
      return;
    }
    if (url.pathname === "/favicon.ico") {
      send(res, 204, "");
      return;
    }
    if (sendDashboardAsset(url.pathname, res)) return;
    if (url.pathname === "/state.generated.js") {
      send(res, 200, readFileSync(resolve(dashboardDir, "state.generated.js"), "utf8"), "application/javascript; charset=utf-8");
      return;
    }
    if (url.pathname === "/admin-dashboard" || url.pathname === "/admin-dashboard/") {
      send(res, 200, readFileSync(resolve(adminDashboardDir, "index.html"), "utf8"), "text/html; charset=utf-8");
      return;
    }
    if (url.pathname === "/admin-dashboard/index.html") {
      send(res, 200, readFileSync(resolve(adminDashboardDir, "index.html"), "utf8"), "text/html; charset=utf-8");
      return;
    }
    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || "Internal error" });
  }
});

function listen(nextPort) {
  server.once("error", error => {
    if (error.code === "EADDRINUSE" && !portLocked && nextPort < requestedPort + 20) {
      listen(nextPort + 1);
      return;
    }
    throw error;
  });
  server.listen(nextPort, host, () => {
    console.log(`dev-dashboard serving at http://${host}:${nextPort}`);
  });
}

listen(requestedPort);
