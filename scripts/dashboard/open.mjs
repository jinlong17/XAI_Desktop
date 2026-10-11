#!/usr/bin/env node
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const servePath = resolve(scriptDir, "serve.mjs");
const args = process.argv.slice(2);
const noBrowser = args.includes("--no-browser") || process.env.DASHBOARD_NO_BROWSER === "1";
const exitAfterOpen = args.includes("--exit-after-open") || process.env.DASHBOARD_EXIT_AFTER_OPEN === "1";
const autoStartWeb = !args.includes("--no-start-web") && process.env.DASHBOARD_START_WEB !== "0";
const openWebAfterStart = args.includes("--open-web") || process.env.DASHBOARD_OPEN_WEB === "1";
const webStartAction = process.env.DASHBOARD_WEB_START_ACTION || "web:start-mock";
const requestedHash = args.find(arg => arg.startsWith("#")) || process.env.DASHBOARD_OPEN_HASH || "#overview";
let opened = false;
let stopping = false;
let pendingUrl = "";
let pendingOpenTimer = null;

function targetUrl(baseUrl) {
  const url = new URL(baseUrl);
  url.pathname = "/";
  url.hash = requestedHash.replace(/^#?/, "#");
  return url.toString();
}

function openUrl(url) {
  if (noBrowser) return;
  const child = spawn("open", [url], {
    cwd: repoRoot,
    detached: true,
    stdio: "ignore"
  });
  child.unref();
}

async function requestJson(baseUrl, path, options = {}) {
  const url = new URL(path, baseUrl);
  const response = await fetch(url, {
    cache: "no-store",
    ...options
  });
  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || data.reason || `request failed: ${url.pathname}`);
  }
  return data;
}

async function startWebService(baseUrl) {
  if (!autoStartWeb) return;
  try {
    console.log(`[dashboard:open] ensuring Web service is running via ${webStartAction}...`);
    const data = await requestJson(
      baseUrl,
      `/api/ops/start?action=${encodeURIComponent(webStartAction)}`,
      { method: "POST" }
    );
    if (data.skipped) {
      console.log(`[dashboard:open] Web service start skipped: ${data.reason || "already-running"}`);
    } else {
      console.log("[dashboard:open] Web service start requested.");
    }
    if (openWebAfterStart) {
      await requestJson(baseUrl, "/api/ops/open?target=web&route=/app/dashboard", { method: "POST" });
    }
  } catch (error) {
    console.error(`[dashboard:open] Web service auto-start failed: ${error.message}`);
  }
}

function shutdown(child, code = 0) {
  if (stopping) return;
  stopping = true;
  if (!child || child.exitCode !== null) {
    process.exit(code);
  }
  if (!child.killed) child.kill("SIGTERM");
  setTimeout(() => {
    if (child.exitCode === null && !child.killed) child.kill("SIGKILL");
  }, 3000).unref();
}

function scheduleOpen(child, url) {
  pendingUrl = url;
  if (pendingOpenTimer) clearTimeout(pendingOpenTimer);
  pendingOpenTimer = setTimeout(async () => {
    if (opened) return;
    opened = true;
    await startWebService(pendingUrl);
    console.log(`[dashboard:open] opening ${pendingUrl}`);
    openUrl(pendingUrl);
    if (exitAfterOpen) shutdown(child, 0);
  }, 350);
}

console.log("[dashboard:open] refreshing state, starting local server, and opening browser...");

const server = spawn(process.execPath, [servePath], {
  cwd: repoRoot,
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"]
});

server.stdout.on("data", chunk => {
  const text = chunk.toString("utf8");
  process.stdout.write(text);
  const match = text.match(/dev-dashboard serving at (http:\/\/127\.0\.0\.1:\d+)/);
  if (!match || opened) return;
  scheduleOpen(server, targetUrl(match[1]));
});

server.stderr.on("data", chunk => process.stderr.write(chunk));

server.on("error", error => {
  console.error(`[dashboard:open] failed to start dashboard server: ${error.message}`);
  process.exit(1);
});

server.on("close", code => {
  if (stopping) process.exit(0);
  if (!opened && code !== 0) {
    console.error(`[dashboard:open] dashboard server exited before opening a URL (code=${code ?? "null"}).`);
  }
  process.exit(code ?? 0);
});

process.on("SIGINT", () => shutdown(server, 0));
process.on("SIGTERM", () => shutdown(server, 0));
process.on("SIGHUP", () => shutdown(server, 0));
