/**
 * Final-regression static runner for CP-APPEARANCE-01 (control-plane batch 51; contract
 * docs/reviews/web-appearance-recovery-contract/contract.md r3 §10 items 8 and 9, §11, §14 E18 and E19, and the E6
 * file hashes used by the E27 receipt). Written for this batch after ../web-features-recovery-final/verify-static.mjs
 * (SHA-256 ddbf44bf…, read, not modified, not imported), whose patterns, §11 list and protected paths are hard-coded to
 * the Features caller. Same conventions: lockfile gate, two immutable archives, git-grep cross-check, refusal to
 * overwrite, exit codes.
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals both revisions'> \
 *     node docs/reviews/web-appearance-recovery-final/verify-static.mjs <fixed> <before> <suffix>
 *
 * - Resolves both revisions to full commits and trees, and gates on SHA-256 equality of XAI_DEPS_ROOT/pnpm-lock.yaml
 *   (default: this repository root), `git show <rev>:pnpm-lock.yaml` for both revisions, both extracted lockfiles and
 *   the contract's expected lockfile hash. No product code is executed, so there is no `@repo` resolution to pin.
 * - Expands `git archive <rev>` for both revisions into fresh temporary directories (realpath) and scans every
 *   extracted file outside docs/ and *.md (text files only: no NUL byte in the first 8000 bytes, as git grep -I) for
 *   each contract §2 writer/reader pattern, counting matching lines per file. Each per-file count is cross-checked
 *   against `git grep -I -c -F` on the committed tree; any mismatch is a harness failure.
 * - E18 (§10 item 9): every file whose count differs between the revisions must be a contract §11 file; the Appearance
 *   product source (non-test files under src/, the stylesheet included) has zero localStorage, setPref(, removePref(,
 *   usePref(, emitWebEvent(, new StorageEvent, dispatchEvent(, SettingsFooter, pane-footer and pane-save; Topbar.tsx
 *   has zero localStorage; App.tsx has no writeLocalPref, localStorage.setItem, onWebEvent("web:settings:preference-
 *   changed" or usePref(, its readLocalPref function is byte-identical to the before revision, and every other
 *   localStorage line of App.tsx is a comment (no getItem/setItem/removeItem outside readLocalPref).
 * - E19 (§10 item 8): `git diff` between the revisions is empty for every fully protected path (each must exist in
 *   both trees, so a typo cannot pass); in the partially protected trees (xai-web-shell, apps, the Appearance package)
 *   every changed path is a §11 file and every other committed path has an identical blob id at both revisions; the
 *   §11 "Protected" files of the Appearance package are unchanged. The full unrestricted `--name-status` diff outside
 *   docs/ and the product-scope diff (`-- apps packages package.json pnpm-lock.yaml`) must both be exactly the 26
 *   contract §11 files with the expected statuses, each matched to a §11 category (at most four new internal modules).
 * - §11 test dispositions (informs E21/E22): every case whose disposition is "Unchanged" (Appearance AC-RENDER-1, -2,
 *   -4, -5, -6, -7, AC-I18N-1–3, AC-DEF-1–9, AC-CONST-*, AC-REG-1–4; Topbar TP0–TP7 and TB-PREMIUM-1) must have a
 *   byte-identical it(...) block at both revisions, and the test files holding only such cases must be unchanged.
 * - Writes search-<suffix>-<fixed>.log and protected-diff-<suffix>-<fixed>.log beside this file, refusing to
 *   overwrite (checked before work, before writing, and with an exclusive create).
 * - Exit status: 0 when every assertion and harness check passes; 1 when an assertion fails; 2 when only a harness
 *   check fails. Temporary archives are deleted afterwards; nothing is written into the dependency checkout.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdtempSync, readdirSync, readFileSync, readlinkSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const runnerFile = fileURLToPath(import.meta.url);
const owned = "docs/reviews/web-appearance-recovery-final";
const dependencyRoot = realpathSync(resolve(process.env.XAI_DEPS_ROOT ?? root));
const [fixedArgument, beforeArgument, suffix, ...extra] = process.argv.slice(2);
if (!fixedArgument || !beforeArgument || !suffix || extra.length) throw Error("Usage: node verify-static.mjs <fixed> <before> <suffix>");
for (const value of [fixedArgument, beforeArgument, suffix]) if (!/^[A-Za-z0-9._-]+$/.test(value)) throw Error(`Unsafe argument: ${value}`);

const EXPECTED_LOCK_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const APPEARANCE_DIR = "packages/xai-web-settings-appearance";
const SHELL_DIR = "packages/xai-web-shell";
const APP_FILE = "apps/web/src/App.tsx";
const TOPBAR_FILE = `${SHELL_DIR}/src/Topbar.tsx`;
// Contract §11: the only files Terra may change, with the expected status of each in the product delta (26 files at
// the final fixed revision: 24 from r1 plus the two r2/r3 guard tests).
const SECTION11_FILES = [
  ["M", `${APPEARANCE_DIR}/docs/api.md`],
  ["M", `${APPEARANCE_DIR}/docs/test.md`],
  ["M", `${APPEARANCE_DIR}/src/AppearancePane.tsx`],
  ["A", `${APPEARANCE_DIR}/src/__tests__/AppearanceController.test.tsx`],
  ["M", `${APPEARANCE_DIR}/src/__tests__/AppearancePane.bilingual.test.tsx`],
  ["A", `${APPEARANCE_DIR}/src/__tests__/AppearancePane.focus-ring.test.tsx`],
  ["M", `${APPEARANCE_DIR}/src/__tests__/AppearancePane.live-binding.test.tsx`],
  ["M", `${APPEARANCE_DIR}/src/__tests__/AppearancePane.rendering.test.tsx`],
  ["M", `${APPEARANCE_DIR}/src/__tests__/AppearancePane.save-reset.test.tsx`],
  ["A", `${APPEARANCE_DIR}/src/__tests__/AppearancePane.selected-focus.test.tsx`],
  ["A", `${APPEARANCE_DIR}/src/__tests__/AppearanceRetryAll.test.tsx`],
  ["A", `${APPEARANCE_DIR}/src/__tests__/appearanceLockFixture.ts`],
  ["M", `${APPEARANCE_DIR}/src/index.ts`],
  ["A", `${APPEARANCE_DIR}/src/internal/AppearanceActions.tsx`],
  ["A", `${APPEARANCE_DIR}/src/internal/AppearanceStatus.tsx`],
  ["A", `${APPEARANCE_DIR}/src/internal/appearanceController.tsx`],
  ["A", `${APPEARANCE_DIR}/src/internal/appearanceRecoveryCopy.ts`],
  ["M", `${APPEARANCE_DIR}/src/styles.css`],
  ["M", `${APPEARANCE_DIR}/src/types.ts`],
  ["M", `${SHELL_DIR}/docs/api.md`],
  ["M", `${SHELL_DIR}/src/Shell.tsx`],
  ["M", `${SHELL_DIR}/src/Topbar.tsx`],
  ["M", `${SHELL_DIR}/src/__tests__/Topbar.test.tsx`],
  ["M", `${SHELL_DIR}/src/types.ts`],
  ["M", APP_FILE],
  ["A", "apps/web/src/__tests__/App.appearance.test.tsx"],
];
const SECTION11_PATHS = new Set(SECTION11_FILES.map(([, path]) => path));
// Contract §11 categories, checked independently of the expected list above.
const inDir = (path, dir) => path.startsWith(`${dir}/`) && !path.slice(dir.length + 1).includes("/");
const SECTION11_RULES = [
  ["Appearance pane src/AppearancePane.tsx", path => path === `${APPEARANCE_DIR}/src/AppearancePane.tsx`],
  ["Appearance src/types.ts (additive types only)", path => path === `${APPEARANCE_DIR}/src/types.ts`],
  ["Appearance src/index.ts (additive exports only)", path => path === `${APPEARANCE_DIR}/src/index.ts`],
  ["new Appearance-local module under src/internal/ (at most four)", (path, status) => status === "A" && inDir(path, `${APPEARANCE_DIR}/src/internal`)],
  ["Appearance src/styles.css (additive scoped selectors)", path => path === `${APPEARANCE_DIR}/src/styles.css`],
  ["Appearance test file under src/__tests__/ (disposition or new local test/fixture)", path => path.startsWith(`${APPEARANCE_DIR}/src/__tests__/`)],
  ["Appearance docs/api.md or docs/test.md", path => path === `${APPEARANCE_DIR}/docs/api.md` || path === `${APPEARANCE_DIR}/docs/test.md`],
  ["shell src/Topbar.tsx", path => path === TOPBAR_FILE],
  ["shell src/Shell.tsx", path => path === `${SHELL_DIR}/src/Shell.tsx`],
  ["shell src/types.ts (additive optional appearanceStatus)", path => path === `${SHELL_DIR}/src/types.ts`],
  ["shell src/__tests__/Topbar.test.tsx", path => path === `${SHELL_DIR}/src/__tests__/Topbar.test.tsx`],
  ["shell docs/api.md (Topbar section)", path => path === `${SHELL_DIR}/docs/api.md`],
  ["apps/web/src/App.tsx", path => path === APP_FILE],
  ["new apps/web/src/__tests__/App.appearance*.test.tsx", (path, status) => status === "A" && /^apps\/web\/src\/__tests__\/App\.appearance[^/]*\.test\.tsx$/.test(path)],
];
// Contract §10 item 8: fully protected paths.
const PROTECTED_PATHS = [
  "packages/plugin-web-storage",
  "packages/plugin-web-settings-shell",
  "packages/plugin-web-tokens",
  "packages/core",
  "packages/xai-web-event-bus",
  "packages/xai-web-pet",
  "packages/xai-web-cmdk",
  "packages/xai-web-settings-features-panel",
  "packages/plugin-web-settings-rest",
  "packages/xai-web-dashboard-grid",
  "packages/xai-web-dashboard-widgets",
  "package.json",
  "pnpm-lock.yaml",
];
// Contract §10 item 8: partially protected trees (every path except the §11 files of that tree).
const PARTIAL_TREES = [SHELL_DIR, "apps", APPEARANCE_DIR];
// Contract §11 "Protected" files inside the Appearance package.
const APPEARANCE_PROTECTED = [
  "src/internal/appearancePane.tsx", "src/constants.ts", "src/appearanceDefaults.ts", "package.json", "manifest.json", "tsconfig.json",
  "vitest.config.ts", "vitest.setup.ts", "eslint.config.js", "docs/design.md", "docs/dev_log.md",
].map(path => `${APPEARANCE_DIR}/${path}`);
// Contract §2 writer and reader search, repeated at both revisions (fixed strings, matching lines per file).
const PATTERNS = [
  ["K1 lang key", "xai_pref_lang"],
  ["K2 theme key", "xai_pref_theme"],
  ["K3 density key", "xai_pref_density"],
  ["K4 font scale key", "xai_pref_font_scale"],
  ["K5 accent key", "xai_accent_hue"],
  ["K6 rail key", "xai_rail_pos"],
  ["K7 background key", "xai_bg_tone"],
  ["E1 retired event channel", "web:settings:preference-changed"],
  ["A1 App raw reader", "readLocalPref"],
  ["A2 App raw writer", "writeLocalPref"],
  ["T1 Topbar raw writer", "persistAndSet"],
  ["S1 setPref call", "setPref("],
  ["S2 removePref call", "removePref("],
  ["S3 legacy usePref call", "usePref("],
  ["S4 open-ended async binding", "usePrefAutosaveAsync("],
  ["S5 event emit", "emitWebEvent("],
  ["S6 global reset", "resetAllPrefs"],
  ["B1 storage event construction", "new StorageEvent"],
  ["B2 event dispatch", "dispatchEvent("],
  ["F1 shared footer", "SettingsFooter"],
  ["F2 footer class", "pane-footer"],
  ["F3 save class", "pane-save"],
  ["D1 applyTheme", "applyTheme("],
  ["D2 applyDensity", "applyDensity("],
  ["D3 applyFontScale", "applyFontScale("],
  ["D4 applyAccentHue", "applyAccentHue("],
  ["D5 applyBgTone", "applyBgTone("],
  ["D6 applyRailPos", "applyRailPos("],
  ["R1 shell display provider", "WebShellProvider"],
  ["R2 shell display hook", "useWebShell("],
];
const APPEARANCE_FORBIDDEN = ["localStorage", "setPref(", "removePref(", "usePref(", "emitWebEvent(", "new StorageEvent", "dispatchEvent(", "SettingsFooter", "pane-footer", "pane-save"];
const APP_FORBIDDEN = ["writeLocalPref", "localStorage.setItem", 'onWebEvent("web:settings:preference-changed"', "usePref("];
// §11 test dispositions: cases whose disposition is "Unchanged", by file (name prefixes), and whole files of such cases.
const UNCHANGED_CASES = [
  [`${APPEARANCE_DIR}/src/__tests__/AppearancePane.rendering.test.tsx`, ["AC-RENDER-1:", "AC-RENDER-2:", "AC-RENDER-4:", "AC-RENDER-5:", "AC-RENDER-6:", "AC-RENDER-7:"]],
  [`${APPEARANCE_DIR}/src/__tests__/AppearancePane.bilingual.test.tsx`, ["AC-I18N-1:", "AC-I18N-2:", "AC-I18N-3:"]],
  [`${SHELL_DIR}/src/__tests__/Topbar.test.tsx`, ["TP0 —", "TP1 —", "TP1b —", "TP1c —", "TP2 —", "TP2b —", "TP2c —", "TP3 —", "TP3b —", "TP4 —", "TP5a —", "TP5b —", "TP6 —", "TP7 —", "TB-PREMIUM-1 —"]],
];
const UNCHANGED_FILES = [
  `${APPEARANCE_DIR}/src/__tests__/appearanceDefaults.test.ts`, // AC-DEF-1–9
  `${APPEARANCE_DIR}/src/__tests__/constants.test.ts`, // AC-CONST-*
  `${APPEARANCE_DIR}/src/__tests__/appearancePane.registry.test.ts`, // AC-REG-1–4
];

// Evidence logs go beside this file. XAI_FINAL_OUTPUT_DIR redirects them (development smoke runs only; such runs
// are not evidence and are disclosed in the receipt).
const outputDir = process.env.XAI_FINAL_OUTPUT_DIR ? realpathSync(resolve(process.env.XAI_FINAL_OUTPUT_DIR)) : evidence;
const searchLog = join(outputDir, `search-${suffix}-${fixedArgument}.log`);
const diffLog = join(outputDir, `protected-diff-${suffix}-${fixedArgument}.log`);
for (const file of [searchLog, diffLog]) if (existsSync(file)) throw Error(`Evidence exists; use a new suffix: ${file}`);

const sha256 = data => createHash("sha256").update(data).digest("hex");
const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }).replace(/\n$/, "");
const gitStatus = args => spawnSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
const resolveRevision = revision => {
  const commit = git(["rev-parse", "--verify", `${revision}^{commit}`]);
  return { revision, commit, tree: git(["rev-parse", `${commit}^{tree}`]) };
};
const fixed = resolveRevision(fixedArgument);
const before = resolveRevision(beforeArgument);
const runnerHead = git(["rev-parse", "HEAD"]);
const runnerHash = sha256(readFileSync(runnerFile));

// Lockfile gate.
assert(existsSync(join(dependencyRoot, "pnpm-lock.yaml")), "Dependency checkout lockfile missing; set XAI_DEPS_ROOT");
const dependencyLockHash = sha256(readFileSync(join(dependencyRoot, "pnpm-lock.yaml")));
const lockOf = info => sha256(execFileSync("git", ["show", `${info.commit}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 256 * 1024 * 1024 }));
const fixedLockHash = lockOf(fixed);
const beforeLockHash = lockOf(before);
assert.equal(dependencyLockHash, EXPECTED_LOCK_SHA256, "Dependency checkout lockfile differs from the contract lockfile");
assert.equal(fixedLockHash, EXPECTED_LOCK_SHA256, "Fixed revision lockfile differs from the contract lockfile");
assert.equal(beforeLockHash, EXPECTED_LOCK_SHA256, "Before revision lockfile differs from the contract lockfile");

const checks = [];
const check = (kind, label, ok, detail = "") => { checks.push({ kind, label, ok, detail }); return ok; };

const isMarkdown = path => path.toLowerCase().endsWith(".md");
const inScope = path => !(path === "docs" || path.startsWith("docs/")) && !isMarkdown(path);
const walk = (directory, base = directory, out = []) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full, base, out);
    else if (entry.isFile() || entry.isSymbolicLink()) out.push(relative(base, full));
  }
  return out;
};
const contentOf = file => (lstatSync(file).isSymbolicLink() ? Buffer.from(readlinkSync(file)) : readFileSync(file));
const isBinary = buffer => buffer.subarray(0, 8000).includes(0);
const countLines = (text, needle) => text.split("\n").filter(line => line.includes(needle)).length;
const zList = text => text.split("\0").filter(Boolean);
const isTest = path => /(^|\/)__tests__\//.test(path) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(path);

const extract = info => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), "xai-appearance-final-static-")));
  execFileSync("tar", ["-x", "-C", directory], { input: execFileSync("git", ["archive", info.commit], { cwd: root, maxBuffer: 1024 * 1024 * 1024 }) });
  info.directory = directory;
  info.extractedLockHash = sha256(readFileSync(join(directory, "pnpm-lock.yaml")));
  assert.equal(info.extractedLockHash, EXPECTED_LOCK_SHA256, `Extracted lockfile of ${info.revision} differs from the contract lockfile`);
  info.gitattributes = gitStatus(["cat-file", "-e", `${info.commit}:.gitattributes`]).status === 0 ? "present" : "absent";
  const files = walk(directory).sort();
  info.fileCount = files.length;
  info.scanned = [];
  info.binary = [];
  info.text = new Map();
  info.symlinks = files.filter(file => lstatSync(join(directory, file)).isSymbolicLink()).length;
  for (const file of files) {
    if (!inScope(file)) continue;
    const buffer = contentOf(join(directory, file));
    if (isBinary(buffer)) { info.binary.push(file); continue; }
    info.scanned.push(file);
    info.text.set(file, buffer.toString("utf8"));
  }
  info.treeFiles = zList(git(["ls-tree", "-r", "-z", "--name-only", info.commit])).sort();
  info.counts = new Map();
  for (const [id, needle] of PATTERNS) {
    const perFile = new Map();
    for (const [file, text] of info.text) {
      const count = countLines(text, needle);
      if (count) perFile.set(file, count);
    }
    info.counts.set(id, perFile);
  }
};

// `git grep -z -c` prints "<commit>:<path>\0<count>\n" per file (no path quoting).
const gitGrepCounts = (info, needle) => {
  const result = gitStatus(["grep", "-I", "-z", "-c", "-F", "-e", needle, info.commit, "--", ".", ":(exclude)docs", ":(exclude)*.md"]);
  if (result.status !== 0 && result.status !== 1) throw Error(`git grep failed for ${needle}: ${result.stderr}`);
  const perFile = new Map();
  for (const line of result.stdout.split("\n").filter(Boolean)) {
    const [name, count] = line.split("\0");
    assert(name.startsWith(`${info.commit}:`), `Unexpected git grep line: ${line}`);
    perFile.set(name.slice(info.commit.length + 1), Number(count));
  }
  return perFile;
};
const mapEqual = (left, right) => left.size === right.size && [...left].every(([key, value]) => right.get(key) === value);
const formatCounts = perFile => [...perFile].sort(([a], [b]) => a.localeCompare(b)).map(([file, count]) => `${file}:${count}`);
// A top-level `export function name` block: from its first line to the first following line that is exactly "}".
const functionBlock = (text, name) => {
  const lines = text.split("\n");
  const start = lines.findIndex(line => line.startsWith(`export function ${name}`));
  if (start < 0) return null;
  const end = lines.findIndex((line, index) => index > start && line === "}");
  return end < 0 ? null : { start: start + 1, end: end + 1, text: lines.slice(start, end + 1).join("\n") };
};
// An it(...)/test(...) block whose title starts with the prefix: from its line to the first following line with the
// same indentation that closes it ("});"), exactly as the repository's test files are formatted.
const caseBlock = (text, prefix) => {
  const lines = text.split("\n");
  const start = lines.findIndex(line => new RegExp(`^(\\s*)(it|test)\\((["'\`])${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(line));
  if (start < 0) return null;
  const indent = lines[start].match(/^\s*/)[0];
  const end = lines.findIndex((line, index) => index > start && line === `${indent}});`);
  return end < 0 ? null : { start: start + 1, end: end + 1, text: lines.slice(start, end + 1).join("\n") };
};

let exitCode = 1;
try {
  extract(fixed);
  extract(before);

  // ---------- E18 ----------
  const searchLines = [];
  for (const info of [fixed, before]) {
    const present = file => { try { lstatSync(join(info.directory, file)); return true; } catch { return false; } };
    const missing = info.treeFiles.filter(file => !present(file));
    check("harness", `${info.revision}: every committed path exists in the extracted archive (${info.treeFiles.length} paths, .gitattributes ${info.gitattributes})`, missing.length === 0, missing.slice(0, 5).join(","));
    check("harness", `${info.revision}: extracted file count equals the committed tree (${info.fileCount})`, info.fileCount === info.treeFiles.length);
  }
  for (const [id, needle] of PATTERNS) {
    for (const info of [fixed, before]) {
      const archiveCounts = info.counts.get(id);
      const grepCounts = gitGrepCounts(info, needle);
      check("harness", `${info.revision} ${id}: archive scan equals git grep -I -c -F (${archiveCounts.size} files)`, mapEqual(archiveCounts, grepCounts),
        mapEqual(archiveCounts, grepCounts) ? "" : `archive=[${formatCounts(archiveCounts).join(" ")}] git=[${formatCounts(grepCounts).join(" ")}]`);
    }
  }

  searchLines.push("## Per-pattern, per-file matching-line counts (scope: every committed file outside docs/ and *.md; text files only)");
  const deltaRows = [];
  for (const [id, needle] of PATTERNS) {
    const fixedCounts = fixed.counts.get(id);
    const beforeCounts = before.counts.get(id);
    const files = [...new Set([...fixedCounts.keys(), ...beforeCounts.keys()])].sort();
    const total = counts => [...counts.values()].reduce((sum, value) => sum + value, 0);
    searchLines.push(`pattern ${id} ${JSON.stringify(needle)}: ${before.revision} files=${beforeCounts.size} lines=${total(beforeCounts)}; ${fixed.revision} files=${fixedCounts.size} lines=${total(fixedCounts)}`);
    for (const file of files) {
      const was = beforeCounts.get(file) ?? 0;
      const now = fixedCounts.get(file) ?? 0;
      const changed = was !== now;
      const section11 = SECTION11_PATHS.has(file);
      searchLines.push(`  ${changed ? (now > was ? "UP  " : "DOWN") : "same"} ${file} ${before.revision}=${was} ${fixed.revision}=${now}${section11 ? " [§11]" : ""}`);
      if (changed) deltaRows.push({ id, file, was, now, section11 });
    }
  }
  const outsideSection11 = deltaRows.filter(row => !row.section11);
  check("assert", "E18: every file whose writer/reader count changed is a contract §11 file", outsideSection11.length === 0,
    outsideSection11.map(row => `${row.id} ${row.file} ${row.was}->${row.now}`).join("; "));
  const newHits = deltaRows.filter(row => row.now > row.was);
  check("assert", "E18: every new or increased hit is in a contract §11 file", newHits.every(row => row.section11),
    newHits.filter(row => !row.section11).map(row => `${row.id} ${row.file}`).join("; "));

  // Appearance product source: non-test files under src/ (the stylesheet included).
  const productSource = info => [...info.text.keys()].filter(file => file.startsWith(`${APPEARANCE_DIR}/src/`) && !isTest(file)).sort();
  const sourceLines = [];
  for (const info of [fixed, before]) {
    const files = productSource(info);
    sourceLines.push(`${info.revision}: Appearance product source files (non-test, under src/): ${files.length}`);
    for (const file of files) sourceLines.push(`  ${file} sha256=${sha256(readFileSync(join(info.directory, file)))}`);
    for (const needle of APPEARANCE_FORBIDDEN) {
      const hits = files.map(file => [file, countLines(info.text.get(file), needle)]).filter(([, count]) => count);
      sourceLines.push(`  ${info === fixed ? "gated" : "info "} ${JSON.stringify(needle)}: ${hits.reduce((sum, [, count]) => sum + count, 0)} lines${hits.length ? ` (${hits.map(([file, count]) => `${relative(APPEARANCE_DIR, file)}:${count}`).join(", ")})` : ""}`);
    }
  }
  for (const needle of APPEARANCE_FORBIDDEN) {
    const hits = productSource(fixed).map(file => [file, countLines(fixed.text.get(file), needle)]).filter(([, count]) => count);
    check("assert", `E18: Appearance product source at ${fixed.revision} has zero ${JSON.stringify(needle)}`, hits.length === 0, hits.map(([file, count]) => `${file}:${count}`).join(","));
  }

  // Topbar.tsx and App.tsx.
  const hostLines = [];
  for (const info of [fixed, before]) {
    for (const needle of ["localStorage", "persistAndSet"]) hostLines.push(`  ${info.revision} ${TOPBAR_FILE} ${JSON.stringify(needle)}=${countLines(info.text.get(TOPBAR_FILE), needle)}`);
    for (const needle of [...APP_FORBIDDEN, "readLocalPref", "localStorage", "getItem(", "setItem(", "removeItem("]) hostLines.push(`  ${info.revision} ${APP_FILE} ${JSON.stringify(needle)}=${countLines(info.text.get(APP_FILE), needle)}`);
  }
  check("assert", `E18: ${TOPBAR_FILE} at ${fixed.revision} has zero "localStorage"`, countLines(fixed.text.get(TOPBAR_FILE), "localStorage") === 0);
  for (const needle of APP_FORBIDDEN) {
    const count = countLines(fixed.text.get(APP_FILE), needle);
    check("assert", `E18: ${APP_FILE} at ${fixed.revision} has zero ${JSON.stringify(needle)}`, count === 0, `count=${count}`);
  }
  const fixedReader = functionBlock(fixed.text.get(APP_FILE), "readLocalPref");
  const beforeReader = functionBlock(before.text.get(APP_FILE), "readLocalPref");
  hostLines.push(`  readLocalPref ${before.revision} L${beforeReader?.start}-L${beforeReader?.end} sha256=${beforeReader ? sha256(beforeReader.text) : "missing"}; ${fixed.revision} L${fixedReader?.start}-L${fixedReader?.end} sha256=${fixedReader ? sha256(fixedReader.text) : "missing"}`);
  check("assert", `E18: readLocalPref in ${APP_FILE} is byte-identical between ${before.revision} and ${fixed.revision}`, Boolean(fixedReader && beforeReader) && fixedReader.text === beforeReader.text);
  const appLines = fixed.text.get(APP_FILE).split("\n");
  const outsideReader = appLines.map((line, index) => ({ line, number: index + 1 })).filter(({ number }) => !fixedReader || number < fixedReader.start || number > fixedReader.end);
  const isComment = line => /^\s*(\/\/|\*|\/\*)/.test(line);
  const storageOutside = outsideReader.filter(({ line }) => /localStorage|getItem\(|setItem\(|removeItem\(/.test(line));
  for (const { line, number } of storageOutside) hostLines.push(`  ${fixed.revision} ${APP_FILE} L${number} outside readLocalPref ${isComment(line) ? "(comment)" : "(CODE)"}: ${line.trim().slice(0, 160)}`);
  check("assert", `E18: in ${APP_FILE} at ${fixed.revision} every localStorage/getItem/setItem/removeItem line outside readLocalPref is a comment (the only storage access is readLocalPref)`,
    storageOutside.every(({ line }) => isComment(line)), storageOutside.filter(({ line }) => !isComment(line)).map(({ number }) => `L${number}`).join(","));

  // ---------- E19 ----------
  const diffLines = [];
  const pathInfo = (info, path) => {
    const result = gitStatus(["rev-parse", "--verify", "--quiet", `${info.commit}:${path}`]);
    return result.status === 0 ? result.stdout.trim() : null;
  };
  diffLines.push("## Contract §10 item 8 fully protected paths");
  for (const path of PROTECTED_PATHS) {
    const was = pathInfo(before, path);
    const now = pathInfo(fixed, path);
    const names = git(["diff", "--name-only", before.commit, fixed.commit, "--", path]);
    const quiet = gitStatus(["diff", "--quiet", before.commit, fixed.commit, "--", path]).status;
    diffLines.push(`protected ${path}: ${before.revision}=${was ?? "absent"} ${fixed.revision}=${now ?? "absent"} diff_name_only=${names ? JSON.stringify(names.split("\n")) : "empty"} diff_quiet_exit=${quiet}`);
    check("assert", `E19: ${path} exists in both trees`, Boolean(was && now));
    check("assert", `E19: git diff ${before.revision} ${fixed.revision} -- ${path} is empty (object ids equal, --quiet exit 0)`, names === "" && quiet === 0 && was === now);
  }
  diffLines.push("## Contract §10 item 8 partially protected trees (every path except that tree's §11 files)");
  const blobs = (info, tree) => new Map(zList(git(["ls-tree", "-r", "-z", info.commit, "--", tree])).map(entry => { const [meta, path] = entry.split("\t"); return [path, meta.split(" ")[2]]; }));
  for (const tree of PARTIAL_TREES) {
    const was = blobs(before, tree);
    const now = blobs(fixed, tree);
    const paths = [...new Set([...was.keys(), ...now.keys()])].sort();
    const changed = paths.filter(path => was.get(path) !== now.get(path));
    const unexpected = changed.filter(path => !SECTION11_PATHS.has(path));
    const untouched = paths.filter(path => !SECTION11_PATHS.has(path));
    diffLines.push(`partial ${tree}: ${before.revision} paths=${was.size} ${fixed.revision} paths=${now.size}; changed=${changed.length} (${changed.join(", ")}); non-§11 paths with identical blob ids=${untouched.filter(path => was.get(path) === now.get(path)).length}/${untouched.length}`);
    check("assert", `E19: in ${tree} every changed path is a contract §11 file (${changed.length} changed)`, unexpected.length === 0, unexpected.join(","));
    check("assert", `E19: in ${tree} every non-§11 path has an identical blob id at both revisions (${untouched.length} paths)`, untouched.every(path => was.get(path) === now.get(path)));
  }
  diffLines.push("## Contract §11 protected files inside the Appearance package");
  for (const path of APPEARANCE_PROTECTED) {
    const was = pathInfo(before, path);
    const now = pathInfo(fixed, path);
    diffLines.push(`appearance-protected ${path}: ${before.revision}=${was ?? "absent"} ${fixed.revision}=${now ?? "absent"}${was === now ? (was ? " unchanged" : " absent at both") : " CHANGED"}`);
    check("assert", `E19: Appearance-package protected file ${relative(APPEARANCE_DIR, path)} unchanged and present`, was === now && was !== null);
  }
  // `--name-status -z` prints "<status>\0<path>\0" per entry (no renames, so exactly one path each).
  const parseNameStatus = text => { const parts = zList(text); const out = []; for (let index = 0; index < parts.length; index += 2) out.push([parts[index], parts[index + 1]]); return out; };
  const fullDiff = parseNameStatus(git(["diff", "--name-status", "-z", "--no-renames", before.commit, fixed.commit]));
  const productDiff = parseNameStatus(git(["diff", "--name-status", "-z", "--no-renames", before.commit, fixed.commit, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]));
  const outsideDocs = fullDiff.filter(([, path]) => !path.startsWith("docs/"));
  const insideDocs = fullDiff.filter(([, path]) => path.startsWith("docs/"));
  const asText = entries => entries.map(([status, path]) => `${status} ${path}`).sort();
  const expectedText = asText(SECTION11_FILES);
  check("assert", `E19/E6: product-scope diff (-- apps packages package.json pnpm-lock.yaml) is exactly the ${SECTION11_FILES.length} contract §11 files with the expected statuses`,
    JSON.stringify(asText(productDiff)) === JSON.stringify(expectedText), asText(productDiff).join(", "));
  check("assert", `E19: full unrestricted diff outside docs/ is exactly the ${SECTION11_FILES.length} contract §11 files`, JSON.stringify(asText(outsideDocs)) === JSON.stringify(expectedText), asText(outsideDocs).join(", "));
  const ruleLines = [];
  let internalCount = 0;
  for (const [status, path] of productDiff) {
    const matched = SECTION11_RULES.filter(([, rule]) => rule(path, status)).map(([label]) => label);
    if (matched.some(label => label.startsWith("new Appearance-local module"))) internalCount += 1;
    ruleLines.push(`  ${status} ${path} -> ${matched.length ? matched.join(" | ") : "NO §11 RULE"}`);
    check("assert", `E19: ${path} matches a contract §11 category`, matched.length > 0);
  }
  check("assert", `E19: at most four new Appearance-local modules under src/internal/ (found ${internalCount})`, internalCount <= 4);
  const numstat = git(["diff", "--numstat", "--no-renames", before.commit, fixed.commit, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]).split("\n").filter(Boolean);
  const added = numstat.reduce((sum, line) => sum + Number(line.split("\t")[0]), 0);
  const removed = numstat.reduce((sum, line) => sum + Number(line.split("\t")[1]), 0);
  const fileHashLines = SECTION11_FILES.map(([status, path]) => {
    const now = existsSync(join(fixed.directory, path)) ? sha256(readFileSync(join(fixed.directory, path))) : "missing";
    const was = existsSync(join(before.directory, path)) ? sha256(readFileSync(join(before.directory, path))) : "absent";
    const stat = numstat.find(line => line.endsWith(`\t${path}`)) ?? "";
    return `  ${status} ${path} ${fixed.revision}_sha256=${now} ${before.revision}_sha256=${was} numstat=${stat.split("\t").slice(0, 2).join("/")}`;
  });

  // ---------- §11 test dispositions: "Unchanged" cases and files ----------
  const dispositionLines = [];
  for (const [file, prefixes] of UNCHANGED_CASES) {
    for (const prefix of prefixes) {
      const was = caseBlock(before.text.get(file) ?? "", prefix);
      const now = caseBlock(fixed.text.get(file) ?? "", prefix);
      const same = Boolean(was && now) && was.text === now.text;
      dispositionLines.push(`  ${same ? "same" : "DIFF"} ${relative("packages", file)} "${prefix}" ${before.revision} L${was?.start}-L${was?.end} ${fixed.revision} L${now?.start}-L${now?.end} sha256=${now ? sha256(now.text).slice(0, 16) : "missing"}`);
      check("assert", `§11 disposition "Unchanged": ${relative("packages", file)} case "${prefix}" has a byte-identical block at both revisions`, same);
    }
  }
  for (const file of UNCHANGED_FILES) {
    const was = pathInfo(before, file);
    const now = pathInfo(fixed, file);
    dispositionLines.push(`  ${was === now ? "same" : "DIFF"} ${relative("packages", file)} blob ${before.revision}=${was} ${fixed.revision}=${now}`);
    check("assert", `§11 disposition "Unchanged": test file ${relative("packages", file)} has an identical blob id at both revisions`, was === now && was !== null);
  }

  const failedAsserts = checks.filter(entry => entry.kind === "assert" && !entry.ok);
  const failedHarness = checks.filter(entry => entry.kind === "harness" && !entry.ok);
  exitCode = failedAsserts.length ? 1 : failedHarness.length ? 2 : 0;

  const header = [
    `requested_fixed=${fixed.revision}`,
    `resolved_fixed_commit=${fixed.commit}`,
    `resolved_fixed_tree=${fixed.tree}`,
    `requested_before=${before.revision}`,
    `resolved_before_commit=${before.commit}`,
    `resolved_before_tree=${before.tree}`,
    `suffix=${suffix}`,
    `command=XAI_DEPS_ROOT=${dependencyRoot} node ${owned}/verify-static.mjs ${fixedArgument} ${beforeArgument} ${suffix}`,
    `output_dir=${outputDir === evidence ? owned : `${outputDir} (redirected; not evidence)`}`,
    `runner_checkout_head=${runnerHead}`,
    `runner_sha256=${runnerHash}`,
    `node=${process.version} platform=${process.platform}-${process.arch} git=${git(["--version"])}`,
    `dependency_root=${dependencyRoot}`,
    `expected_lockfile_sha256=${EXPECTED_LOCK_SHA256}`,
    `dependency_lockfile_sha256=${dependencyLockHash}`,
    `fixed_lockfile_sha256=${fixedLockHash} extracted=${fixed.extractedLockHash}`,
    `before_lockfile_sha256=${beforeLockHash} extracted=${before.extractedLockHash}`,
    `repo_pin=not applicable (no product code is executed; text scan and git object comparison only)`,
    `archives fixed_files=${fixed.fileCount} (symlinks ${fixed.symlinks}) before_files=${before.fileCount} (symlinks ${before.symlinks}) scanned_text_files fixed=${fixed.scanned.length} before=${before.scanned.length} binary_skipped fixed=${fixed.binary.length} before=${before.binary.length}`,
  ];
  const checkLines = checks.map(entry => `${entry.ok ? "PASS" : "FAIL"} [${entry.kind}] ${entry.label}${entry.detail ? ` :: ${entry.detail}` : ""}`);
  const totals = kind => `${checks.filter(entry => entry.kind === kind && entry.ok).length}/${checks.filter(entry => entry.kind === kind).length}`;
  const footer = [`assertions=${totals("assert")} harness=${totals("harness")}`, `exit=${exitCode}`];

  const searchChecks = checkLines.filter(line => / E18: |\[harness\]/.test(line));
  const diffChecks = checkLines.filter(line => / E19| E19\/E6|§11 disposition/.test(line));
  const searchBody = [
    ...header,
    `log=E18 (contract §10 item 9) writer/reader search`,
    ...searchLines,
    `## Delta rows (files whose count differs between ${before.revision} and ${fixed.revision}): ${deltaRows.length}`,
    ...deltaRows.map(row => `  ${row.id} ${row.file} ${row.was}->${row.now} ${row.section11 ? "§11" : "OUTSIDE §11"}`),
    "## Appearance product source",
    ...sourceLines,
    "## Topbar.tsx and App.tsx",
    ...hostLines,
    "## Checks",
    ...searchChecks,
    ...footer,
  ];
  const diffBody = [
    ...header,
    `log=E19 (contract §10 item 8) protected-path diff, E6 product delta and §11 "Unchanged" test dispositions`,
    ...diffLines,
    `## Full unrestricted diff ${before.revision}..${fixed.revision} (--name-status --no-renames): ${fullDiff.length} entries, ${insideDocs.length} under docs/, ${outsideDocs.length} outside docs/`,
    ...asText(outsideDocs).map(line => `  outside-docs ${line}`),
    ...asText(insideDocs).map(line => `  docs ${line}`),
    `## Product-scope diff (-- apps packages package.json pnpm-lock.yaml): ${productDiff.length} entries, +${added}/-${removed} lines`,
    ...ruleLines,
    "## Contract §11 files: SHA-256 at both revisions",
    ...fileHashLines,
    `fixed_appearance_package_tree=${git(["rev-parse", `${fixed.commit}:${APPEARANCE_DIR}`])} before_appearance_package_tree=${git(["rev-parse", `${before.commit}:${APPEARANCE_DIR}`])}`,
    `fixed_shell_package_tree=${git(["rev-parse", `${fixed.commit}:${SHELL_DIR}`])} before_shell_package_tree=${git(["rev-parse", `${before.commit}:${SHELL_DIR}`])}`,
    `fixed_apps_web_tree=${git(["rev-parse", `${fixed.commit}:apps/web`])} before_apps_web_tree=${git(["rev-parse", `${before.commit}:apps/web`])}`,
    "## Contract §11 test dispositions: \"Unchanged\" cases (it-block text) and files (blob ids)",
    ...dispositionLines,
    "## Checks",
    ...diffChecks,
    ...footer,
  ];
  for (const [file, body] of [[searchLog, searchBody], [diffLog, diffBody]]) {
    if (existsSync(file)) throw Error(`Evidence appeared during the run; refusing to overwrite ${file}`);
    writeFileSync(file, body.join("\n").trimEnd() + "\n", { flag: "wx" });
  }
  console.log(`static ${fixed.revision} (${fixed.commit.slice(0, 12)}) vs ${before.revision} (${before.commit.slice(0, 12)}): assertions=${totals("assert")} harness=${totals("harness")} exit=${exitCode}`);
  for (const line of checkLines.filter(line => line.startsWith("FAIL"))) console.log(`  ${line}`);
  console.log(`  logs: ${relative(root, searchLog)} ${relative(root, diffLog)}`);
} finally {
  for (const info of [fixed, before]) if (info.directory) rmSync(info.directory, { recursive: true, force: true });
}
process.exitCode = exitCode;
