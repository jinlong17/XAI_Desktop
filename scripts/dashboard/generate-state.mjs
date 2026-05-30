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
const pluginMapPath = resolve(repoRoot, "docs/PLUGIN_MAP.md");
const roadmapDir = resolve(repoRoot, "docs/workflow/roadmap");
const skillDir = resolve(repoRoot, ".teams/skills");
const outputPath = resolve(repoRoot, "docs/prototypes/dev-dashboard/state.generated.js");
const roadmapAllowlist = [
  "sync-v1.md",
  "web-ticktick-parity.md",
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

function readText(path) {
  return readFileSync(path, "utf8");
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
        present: existsSync(skillPath),
        tracked: Boolean(git(["ls-files", "--", relative(repoRoot, skillPath)]))
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
  const pluginEntries = pluginMap.entries.filter(entry => /plugin-(organizer|clipboard|widgets|meditation|pet|account|console|productivity|ai-cube|calendar|labels|project|settings)\b/.test(entry.path));
  const pluginCounts = countByStatus(pluginEntries);
  const lineCounts = {
    web: mergeCounts(get([
      "web-ticktick-parity.md",
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
    ])),
    app: mergeCounts(get(["xai-g0-window-spike.md", "xai-g1-native-foundation.md"])),
    plugin: pluginCounts,
    sync: mergeCounts(get(["sync-v1.md"])),
    site: mergeCounts(get(["web-ticktick-parity.md"])),
    admin: {}
  };
  const regions = {
    web: "主产品链",
    app: "主产品链",
    plugin: "主产品链",
    sync: "主产品链",
    admin: "Control Plane",
    site: "项目系统区"
  };
  const chainOrder = { web: 1, app: 2, plugin: 3, sync: 4, admin: 5, site: 6 };
  return [...sourceProducts]
    .sort((a, b) => Number(a.order) - Number(b.order))
    .map(product => {
      const counts = lineCounts[product.key] || {};
      const emptyLabel = product.key === "admin" ? "0 manifest rows · prototype only" : "0 manifest rows";
      return {
        ...product,
        order: chainOrder[product.key] || product.order,
        region: regions[product.key] || "项目系统区",
        badge: badgeForCounts(counts),
        status: summarizeProductStatus(counts, emptyLabel),
        status_counts: counts,
        status_summary: formatCounts(counts)
      };
    });
}

function buildSignals(snapshot) {
  const divergence = snapshot.git.divergence;
  const manifests = snapshot.roadmap_manifests || [];
  const allCounts = mergeCounts(manifests);
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
      note: formatCounts(allCounts)
    },
    {
      label: "Project skills",
      badge: "tracked",
      value: String(snapshot.skills_found.length),
      note: ".teams/skills/*/SKILL.md"
    },
    {
      label: "Snapshot",
      badge: "manual refresh",
      value: "local",
      note: "读取+提醒；不自动改 roadmap/merge/发布判断"
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
      detail: web?.status || "读取 Web roadmap / PLUGIN_MAP 状态"
    },
    {
      question: "在哪条线",
      answer: branch,
      detail: "当前仓库线；web 与 dev 独立推进"
    },
    {
      question: "用哪个 workflow · skill",
      answer: "xai-feature-full-loop / xai-web-to-desktop-sync",
      detail: "功能推进用 full-loop；跨线同步先跑 D3 分类"
    },
    {
      question: "什么状态",
      answer: "读取+提醒",
      detail: "自动化不改 roadmap、不 merge、不判断发布"
    }
  ];
}

const source = readJson(sourcePath);
const branch = git(["branch", "--show-current"]);
const latestCommit = git(["log", "-1", "--format=%h %s"]);
const divergenceRaw = git(["rev-list", "--left-right", "--count", "origin/web...origin/dev"]);
const [webOnly = "0", devOnly = "0"] = divergenceRaw.split(/\s+/);
const skillsFound = listSkills();
const pluginMap = parsePluginMap();
const roadmapManifests = listRoadmapManifests();

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
  skills_found: skillsFound,
  plugin_map: pluginMap,
  roadmap_manifests: roadmapManifests,
  product_lines: buildProductLines(source.product_lines || [], roadmapManifests, pluginMap),
  release_log: {
    source: relative(repoRoot, releaseLogPath),
    latest_entry: latestReleaseEntry()
  }
};
snapshot.signals = buildSignals(snapshot);
snapshot.cockpit = buildCockpit(snapshot);

const body = `window.XAI_DASHBOARD_STATE = ${JSON.stringify(snapshot, null, 2)};\n`;
writeFileSync(outputPath, body);

console.log(`wrote ${relative(repoRoot, outputPath)}`);
