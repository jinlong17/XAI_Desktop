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

function runGenerate() {
  execFileSync(process.execPath, [generatorPath], {
    cwd: repoRoot,
    stdio: "inherit"
  });
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
