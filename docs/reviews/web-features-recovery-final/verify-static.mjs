/**
 * Final-regression static runner for CP-FEATURES-01 (control-plane batch 30; contract
 * docs/reviews/web-features-recovery-contract/contract.md §10 items 8 and 9, §14 E18 and E19, and the E6 file
 * hashes used by the E25 receipt).
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals both revisions'> \
 *     node docs/reviews/web-features-recovery-final/verify-static.mjs <fixed> <before> <suffix>
 *
 * - Resolves both revisions to full commits and trees, and gates on SHA-256 equality of XAI_DEPS_ROOT/pnpm-lock.yaml
 *   (default: this repository root), `git show <rev>:pnpm-lock.yaml` for both revisions, both extracted lockfiles and
 *   the contract's expected lockfile hash. Dependencies are not used by this runner (it executes no product code, so
 *   there is no `@repo` resolution to pin); the gate is kept so every final-regression execution passes it.
 * - Expands `git archive <rev>` for both revisions into fresh temporary directories (realpath) and scans every
 *   extracted file outside docs/ and *.md (text files only: no NUL byte in the first 8000 bytes, as git grep -I) for
 *   each contract §2 reader/writer pattern, counting matching lines per file. Each per-file count is cross-checked
 *   against `git grep -I -c -F` on the committed tree; any mismatch is a harness failure.
 * - E18: compares the per-file counts of both revisions; every file whose count differs must be a contract §11 file.
 *   Also asserts zero `new StorageEvent` / `dispatchEvent(` in the Features package product source (non-test files
 *   under src/) and zero `usePref(` / `setPref(` / `removePref(` / `localStorage` in FeaturesPane.tsx and the two
 *   new internal helpers, at the fixed revision.
 * - E19: asserts `git diff` between the revisions is empty for every contract §10 item 8 protected path (each path
 *   must exist in both trees, so a typo cannot pass), and for the contract §11 protected Features-package files;
 *   records the full unrestricted `--name-status` diff and asserts that its entries outside docs/ and the
 *   product-scope diff (`-- apps packages package.json pnpm-lock.yaml`) are exactly the 11 contract §11 files.
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
const owned = "docs/reviews/web-features-recovery-final";
const dependencyRoot = realpathSync(resolve(process.env.XAI_DEPS_ROOT ?? root));
const [fixedArgument, beforeArgument, suffix, ...extra] = process.argv.slice(2);
if (!fixedArgument || !beforeArgument || !suffix || extra.length) throw Error("Usage: node verify-static.mjs <fixed> <before> <suffix>");
for (const value of [fixedArgument, beforeArgument, suffix]) if (!/^[A-Za-z0-9._-]+$/.test(value)) throw Error(`Unsafe argument: ${value}`);

const EXPECTED_LOCK_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const FEATURES_DIR = "packages/xai-web-settings-features-panel";
// Contract §11: the only files Terra may change, with the expected status of each in the product delta.
const SECTION11_FILES = [
  ["M", `${FEATURES_DIR}/docs/api.md`],
  ["M", `${FEATURES_DIR}/docs/test.md`],
  ["M", `${FEATURES_DIR}/src/FeaturesPane.tsx`],
  ["M", `${FEATURES_DIR}/src/__tests__/FeaturesPane.test.tsx`],
  ["A", `${FEATURES_DIR}/src/__tests__/FeaturesPaneRecovery.test.tsx`],
  ["A", `${FEATURES_DIR}/src/__tests__/featuresLockFixture.ts`],
  ["M", `${FEATURES_DIR}/src/internal/featuresPane.tsx`],
  ["A", `${FEATURES_DIR}/src/internal/featuresRecovery.ts`],
  ["A", `${FEATURES_DIR}/src/internal/featuresRecoveryCopy.ts`],
  ["M", `${FEATURES_DIR}/src/styles.css`],
  ["M", `${FEATURES_DIR}/src/types.ts`],
];
const SECTION11_PATHS = new Set(SECTION11_FILES.map(([, path]) => path));
// Contract §11 categories, checked independently of the expected list above.
const SECTION11_RULES = [
  ["pane", path => path === `${FEATURES_DIR}/src/FeaturesPane.tsx`],
  ["render-prop forwarding", path => path === `${FEATURES_DIR}/src/internal/featuresPane.tsx`],
  ["FeaturesPaneProps guard field", path => path === `${FEATURES_DIR}/src/types.ts`],
  ["new Features-local helper under src/internal/ (at most two)", (path, status) => status === "A" && path.startsWith(`${FEATURES_DIR}/src/internal/`) && !path.slice(`${FEATURES_DIR}/src/internal/`.length).includes("/")],
  ["scoped stylesheet", path => path === `${FEATURES_DIR}/src/styles.css`],
  ["FeaturesPane.test.tsx", path => path === `${FEATURES_DIR}/src/__tests__/FeaturesPane.test.tsx`],
  ["new Features-local test file under src/__tests__/", (path, status) => status === "A" && path.startsWith(`${FEATURES_DIR}/src/__tests__/`)],
  ["package docs/api.md or docs/test.md", path => path === `${FEATURES_DIR}/docs/api.md` || path === `${FEATURES_DIR}/docs/test.md`],
];
// Contract §10 item 8.
const PROTECTED_PATHS = [
  "packages/plugin-web-storage",
  "packages/plugin-web-settings-shell",
  "packages/xai-web-shell",
  "packages/xai-web-pet",
  "packages/xai-web-cmdk",
  "packages/plugin-web-tokens",
  "packages/xai-web-settings-appearance",
  "packages/plugin-web-settings-rest",
  "packages/xai-web-dashboard-grid",
  "packages/xai-web-dashboard-widgets",
  "apps",
  "package.json",
  "pnpm-lock.yaml",
];
// Contract §11 "Protected" files inside the Features package (absent-at-both is recorded, not failed).
const FEATURES_PROTECTED = [
  "src/index.ts", "src/featureIds.ts", "src/useFeaturePrefs.ts", "src/filterModulesByFeaturePrefs.ts", "src/withDisabledFallback.tsx",
  "src/DisabledFeatureFallback.tsx", "src/internal/FeatureThumb.tsx", "package.json", "tsconfig.json", "vitest.config.ts", "vitest.setup.ts",
  "eslint.config.js", "manifest.json", "docs/design.md", "docs/dev_log.md", "docs/verify-report.md",
].map(path => `${FEATURES_DIR}/${path}`);
// Contract §2 reader and writer search, repeated at both revisions (fixed strings, matching lines per file).
const PATTERNS = [
  ["W1 key literal", "xai_pref_features_"],
  ["W2 key builder call", "featurePrefKey("],
  ["W3 key builder any mention", "featurePrefKey"],
  ["W4 old pane reset", "resetAllFeaturePrefs"],
  ["W5 global reset", "resetAllPrefs"],
  ["R1 rail reader hook", "useFeaturePrefs"],
  ["R2 route reader", "withDisabledFallback"],
  ["R3 rail filter", "filterModulesByFeaturePrefs"],
  ["R4 fallback component", "DisabledFeatureFallback"],
  ["R5 CmdK reader", "readEnabledSearchModules"],
];
const PRODUCT_SOURCE_FORBIDDEN = ["new StorageEvent", "dispatchEvent("];
const PANE_HELPER_FILES = ["src/FeaturesPane.tsx", "src/internal/featuresRecovery.ts", "src/internal/featuresRecoveryCopy.ts"].map(path => `${FEATURES_DIR}/${path}`);
const PANE_HELPER_FORBIDDEN = ["usePref(", "setPref(", "removePref(", "localStorage"];
// Informational only (not gated): other writer/broadcast spellings in the Features product source.
const PRODUCT_SOURCE_INFO = ["StorageEvent", "localStorage", "SettingsFooter", "usePref(", "setPref(", "removePref(", "getPref("];

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
// Regular files and symbolic links (a tracked symlink's blob is its target path, so its content is the link text).
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

const extract = info => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), "xai-features-final-static-")));
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
  // Committed tree listing (NUL-separated, so no path quoting), for the archive-completeness check.
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
  check("assert", "E18: every file whose reader/writer count changed is a contract §11 file", outsideSection11.length === 0,
    outsideSection11.map(row => `${row.id} ${row.file} ${row.was}->${row.now}`).join("; "));
  const newHits = deltaRows.filter(row => row.now > row.was);
  check("assert", "E18: every new or increased hit is in a contract §11 file", newHits.every(row => row.section11),
    newHits.filter(row => !row.section11).map(row => `${row.id} ${row.file}`).join("; "));

  // Features product source: non-test files under src/.
  const isTest = path => /(^|\/)__tests__\//.test(path) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(path);
  const productSource = info => [...info.text.keys()].filter(file => file.startsWith(`${FEATURES_DIR}/src/`) && !isTest(file)).sort();
  const sourceLines = [];
  for (const info of [fixed, before]) {
    const files = productSource(info);
    sourceLines.push(`${info.revision}: Features product source files (non-test, under src/): ${files.length}`);
    for (const file of files) sourceLines.push(`  ${file} sha256=${sha256(readFileSync(join(info.directory, file)))}`);
    for (const needle of [...PRODUCT_SOURCE_FORBIDDEN, ...PRODUCT_SOURCE_INFO]) {
      const hits = files.map(file => [file, countLines(info.text.get(file), needle)]).filter(([, count]) => count);
      sourceLines.push(`  ${PRODUCT_SOURCE_FORBIDDEN.includes(needle) ? "gated" : "info "} ${JSON.stringify(needle)}: ${hits.reduce((sum, [, count]) => sum + count, 0)} lines${hits.length ? ` (${hits.map(([file, count]) => `${relative(FEATURES_DIR, file)}:${count}`).join(", ")})` : ""}`);
    }
  }
  for (const needle of PRODUCT_SOURCE_FORBIDDEN) {
    const hits = productSource(fixed).map(file => [file, countLines(fixed.text.get(file), needle)]).filter(([, count]) => count);
    check("assert", `E18: Features product source at ${fixed.revision} has zero ${JSON.stringify(needle)}`, hits.length === 0, hits.map(([file, count]) => `${file}:${count}`).join(","));
  }
  const helperLines = [];
  for (const file of PANE_HELPER_FILES) {
    const present = fixed.text.has(file);
    check("assert", `E18: ${file} exists at ${fixed.revision}`, present);
    for (const needle of PANE_HELPER_FORBIDDEN) {
      const count = present ? countLines(fixed.text.get(file), needle) : -1;
      helperLines.push(`  ${fixed.revision} ${file} ${JSON.stringify(needle)}=${count}`);
      check("assert", `E18: ${relative(FEATURES_DIR, file)} at ${fixed.revision} has zero ${JSON.stringify(needle)}`, count === 0, `count=${count}`);
    }
  }
  for (const needle of PANE_HELPER_FORBIDDEN) {
    const file = `${FEATURES_DIR}/src/FeaturesPane.tsx`;
    helperLines.push(`  ${before.revision} ${file} ${JSON.stringify(needle)}=${countLines(before.text.get(file), needle)} (before control, not gated)`);
  }

  // ---------- E19 ----------
  const diffLines = [];
  const pathInfo = (info, path) => {
    const result = gitStatus(["rev-parse", "--verify", "--quiet", `${info.commit}:${path}`]);
    return result.status === 0 ? result.stdout.trim() : null;
  };
  diffLines.push("## Contract §10 item 8 protected paths");
  for (const path of PROTECTED_PATHS) {
    const was = pathInfo(before, path);
    const now = pathInfo(fixed, path);
    const names = git(["diff", "--name-only", before.commit, fixed.commit, "--", path]);
    const quiet = gitStatus(["diff", "--quiet", before.commit, fixed.commit, "--", path]).status;
    diffLines.push(`protected ${path}: ${before.revision}=${was ?? "absent"} ${fixed.revision}=${now ?? "absent"} diff_name_only=${names ? JSON.stringify(names.split("\n")) : "empty"} diff_quiet_exit=${quiet}`);
    check("assert", `E19: ${path} exists in both trees`, Boolean(was && now));
    check("assert", `E19: git diff ${before.revision} ${fixed.revision} -- ${path} is empty (object ids equal, --quiet exit 0)`, names === "" && quiet === 0 && was === now);
  }
  diffLines.push("## Contract §11 protected files inside the Features package");
  for (const path of FEATURES_PROTECTED) {
    const was = pathInfo(before, path);
    const now = pathInfo(fixed, path);
    diffLines.push(`features-protected ${path}: ${before.revision}=${was ?? "absent"} ${fixed.revision}=${now ?? "absent"}${was === now ? (was ? " unchanged" : " absent at both") : " CHANGED"}`);
    check("assert", `E19: Features-package protected file ${relative(FEATURES_DIR, path)} unchanged`, was === now);
  }
  // `--name-status -z` prints "<status>\0<path>\0" per entry (no renames, so exactly one path each).
  const parseNameStatus = text => { const parts = zList(text); const out = []; for (let index = 0; index < parts.length; index += 2) out.push([parts[index], parts[index + 1]]); return out; };
  const fullDiff = parseNameStatus(git(["diff", "--name-status", "-z", "--no-renames", before.commit, fixed.commit]));
  const productDiff = parseNameStatus(git(["diff", "--name-status", "-z", "--no-renames", before.commit, fixed.commit, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]));
  const outsideDocs = fullDiff.filter(([, path]) => !path.startsWith("docs/"));
  const insideDocs = fullDiff.filter(([, path]) => path.startsWith("docs/"));
  const asText = entries => entries.map(([status, path]) => `${status} ${path}`).sort();
  const expectedText = asText(SECTION11_FILES);
  check("assert", `E19/E6: product-scope diff (-- apps packages package.json pnpm-lock.yaml) is exactly the 11 contract §11 files with the expected statuses`,
    JSON.stringify(asText(productDiff)) === JSON.stringify(expectedText), asText(productDiff).join(", "));
  check("assert", `E19: full unrestricted diff outside docs/ is exactly the 11 contract §11 files`, JSON.stringify(asText(outsideDocs)) === JSON.stringify(expectedText), asText(outsideDocs).join(", "));
  const ruleLines = [];
  let helperCount = 0;
  for (const [status, path] of productDiff) {
    const matched = SECTION11_RULES.filter(([, rule]) => rule(path, status)).map(([label]) => label);
    if (matched.some(label => label.startsWith("new Features-local helper"))) helperCount += 1;
    ruleLines.push(`  ${status} ${path} -> ${matched.length ? matched.join(" | ") : "NO §11 RULE"}`);
    check("assert", `E19: ${path} matches a contract §11 category`, matched.length > 0);
  }
  check("assert", `E19: at most two new Features-local helpers under src/internal/ (found ${helperCount})`, helperCount <= 2);
  const numstat = git(["diff", "--numstat", "--no-renames", before.commit, fixed.commit, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]).split("\n").filter(Boolean);
  const added = numstat.reduce((sum, line) => sum + Number(line.split("\t")[0]), 0);
  const removed = numstat.reduce((sum, line) => sum + Number(line.split("\t")[1]), 0);
  const fileHashLines = SECTION11_FILES.map(([status, path]) => {
    const now = fixed.text.has(path) || existsSync(join(fixed.directory, path)) ? sha256(readFileSync(join(fixed.directory, path))) : "missing";
    const was = existsSync(join(before.directory, path)) ? sha256(readFileSync(join(before.directory, path))) : "absent";
    const stat = numstat.find(line => line.endsWith(`\t${path}`)) ?? "";
    return `  ${status} ${path} ${fixed.revision}_sha256=${now} ${before.revision}_sha256=${was} numstat=${stat.split("\t").slice(0, 2).join("/")}`;
  });

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
  const diffChecks = checkLines.filter(line => / E19| E19\/E6/.test(line));
  const searchBody = [
    ...header,
    `log=E18 (contract §10 item 9) reader/writer search`,
    ...searchLines,
    `## Delta rows (files whose count differs between ${before.revision} and ${fixed.revision}): ${deltaRows.length}`,
    ...deltaRows.map(row => `  ${row.id} ${row.file} ${row.was}->${row.now} ${row.section11 ? "§11" : "OUTSIDE §11"}`),
    "## Features product source",
    ...sourceLines,
    "## FeaturesPane.tsx and the two new helpers",
    ...helperLines,
    "## Checks",
    ...searchChecks,
    ...footer,
  ];
  const diffBody = [
    ...header,
    `log=E19 (contract §10 item 8) protected-path diff and E6 product delta`,
    ...diffLines,
    `## Full unrestricted diff ${before.revision}..${fixed.revision} (--name-status --no-renames): ${fullDiff.length} entries, ${insideDocs.length} under docs/, ${outsideDocs.length} outside docs/`,
    ...asText(outsideDocs).map(line => `  outside-docs ${line}`),
    ...asText(insideDocs).map(line => `  docs ${line}`),
    `## Product-scope diff (-- apps packages package.json pnpm-lock.yaml): ${productDiff.length} entries, +${added}/-${removed} lines`,
    ...ruleLines,
    "## Contract §11 files: SHA-256 at both revisions",
    ...fileHashLines,
    `fixed_features_package_tree=${git(["rev-parse", `${fixed.commit}:${FEATURES_DIR}`])} before_features_package_tree=${git(["rev-parse", `${before.commit}:${FEATURES_DIR}`])}`,
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
