#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const sourcePath = resolve(repoRoot, "docs/workflow/project/dashboard-state.json");
const releaseLogPath = resolve(repoRoot, "docs/workflow/project/release-log.md");
const skillDir = resolve(repoRoot, ".teams/skills");
const outputPath = resolve(repoRoot, "docs/prototypes/dev-dashboard/state.generated.js");

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

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function listSkills() {
  if (!existsSync(skillDir)) return [];
  return readdirSync(skillDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const skillPath = resolve(skillDir, entry.name, "SKILL.md");
      return {
        name: entry.name,
        path: relative(repoRoot, skillPath),
        present: existsSync(skillPath)
      };
    })
    .filter(skill => skill.present)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function latestReleaseEntry() {
  if (!existsSync(releaseLogPath)) return "";
  const text = readFileSync(releaseLogPath, "utf8");
  const match = text.match(/^###\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

const source = readJson(sourcePath);
const branch = git(["branch", "--show-current"]);
const latestCommit = git(["log", "-1", "--format=%h %s"]);
const divergenceRaw = git(["rev-list", "--left-right", "--count", "origin/web...origin/dev"]);
const [webOnly = "0", devOnly = "0"] = divergenceRaw.split(/\s+/);

const snapshot = {
  ...source,
  generated_at: new Date().toISOString(),
  git: {
    branch,
    latest_commit: latestCommit,
    divergence: {
      web_only: Number(webOnly) || 0,
      dev_only: Number(devOnly) || 0
    }
  },
  skills_found: listSkills(),
  release_log: {
    source: relative(repoRoot, releaseLogPath),
    latest_entry: latestReleaseEntry()
  }
};

const body = `window.XAI_DASHBOARD_STATE = ${JSON.stringify(snapshot, null, 2)};\n`;
writeFileSync(outputPath, body);

console.log(`wrote ${relative(repoRoot, outputPath)}`);
