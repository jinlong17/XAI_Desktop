/**
 * G1 immutable-archive runner: dashboard-widgets downstream tests for CP-STICKY-01
 * (Sticky contract §10 item 4, §13 row "Downstream readers and canonical format"; control-plane batch 18).
 *
 * Usage:
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals the revision's> \
 *     node docs/reviews/web-sticky-recovery-final/verify-widgets.mjs <revision> <suffix>
 *
 * Runs exactly five files of @repo/plugin-web-dashboard-widgets (packages/xai-web-dashboard-widgets):
 * StickyComposer, StickiesWidget, useStickies, stickiesStore and ids (see FILES).
 *
 * - Expands `git archive <revision>` into a fresh temporary directory and gates on SHA-256 equality of the
 *   archive's pnpm-lock.yaml and XAI_DEPS_ROOT/pnpm-lock.yaml (default: this repository root).
 * - Every archive package gets a private node_modules directory of read-only links to the dependency
 *   checkout's third-party entries. Workspace (@repo) entries and caches are never linked from the
 *   checkout: each declared @repo dependency is linked to the archive's own package folder instead, so
 *   Node and tsconfig `extends` resolution stay inside the archive. Vite caches and the bundled-config temp
 *   file are written inside the archive; nothing is written into the dependency checkout.
 * - Runs the package's own Vitest binary with a wrapper config that imports the archive package's own
 *   vitest.config.ts (environment, globals, setupFiles unchanged) and adds only: root, cacheDir, exact-match
 *   aliases from every archive packages/* export to the archive file, a guard plugin that fails the run if a
 *   module is loaded from the dependency checkout's packages/ or apps/ and records every archive module it
 *   transforms, and test.include = FILES.
 * - Writes widgets-<suffix>-<revision>.log beside this file, refusing to overwrite: requested and resolved
 *   revision, lockfile hashes, runner hash, archive file hashes, dependency-closure tree ids, Vitest stdout and
 *   stderr, a per-file summary from Vitest's JSON reporter and the module-pin record.
 * - Exits with Vitest's status; if Vitest exited 0 but a harness check failed, exits 2.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const runnerFile = fileURLToPath(import.meta.url);
const dependencyRoot = realpathSync(resolve(process.env.XAI_DEPS_ROOT ?? root));
const [revision, suffix, ...extra] = process.argv.slice(2);
if (!revision || !suffix || extra.length) throw Error("Usage: node verify-widgets.mjs <revision> <suffix>");
if (!/^[A-Za-z0-9._-]+$/.test(revision)) throw Error(`Unsafe revision: ${revision}`);
if (!/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error(`Unsafe suffix: ${suffix}`);

const PACKAGE_DIR = "packages/xai-web-dashboard-widgets";
const PACKAGE_NAME = "@repo/plugin-web-dashboard-widgets";
const FILES = [
  "src/__tests__/StickyComposer.test.tsx",
  "src/__tests__/StickiesWidget.test.tsx",
  "src/__tests__/useStickies.test.tsx",
  "src/internal/stickiesStore/__tests__/stickiesStore.test.ts",
  "src/internal/stickiesStore/__tests__/ids.test.ts",
];
// Owners of the 2023526..f359be6 product delta (the Sticky §11 files and the coordinator repair).
const CHANGED_OWNERS = ["@repo/plugin-web-settings-rest", "@repo/web"];
const CHANGED_PATHS = ["packages/plugin-web-settings-rest/", "apps/"];
const logPath = join(evidence, `widgets-${suffix}-${revision}.log`);
if (existsSync(logPath)) throw Error(`Evidence exists; use a new suffix: ${logPath}`);

const sha256 = data => createHash("sha256").update(data).digest("hex");
const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
const commit = git(["rev-parse", "--verify", `${revision}^{commit}`]);
const tree = git(["rev-parse", `${commit}^{tree}`]);
const archiveLock = execFileSync("git", ["show", `${commit}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 256 * 1024 * 1024 });
assert(existsSync(join(dependencyRoot, "node_modules")), "Dependency tree missing; set XAI_DEPS_ROOT to a checkout with installed node_modules");
const dependencyLockHash = sha256(readFileSync(join(dependencyRoot, "pnpm-lock.yaml")));
const archiveLockHash = sha256(archiveLock);
assert.equal(dependencyLockHash, archiveLockHash, "Dependency checkout lockfile differs from the archive lockfile");
const packageModules = join(dependencyRoot, PACKAGE_DIR, "node_modules");
const vitestBin = join(packageModules, ".bin/vitest");
assert(existsSync(vitestBin), `Vitest binary missing at ${vitestBin}`);
const vitestHome = realpathSync(join(packageModules, "vitest"));
const versionOf = file => { try { return JSON.parse(readFileSync(file, "utf8")).version; } catch { return "unknown"; } };
const vitestVersion = versionOf(join(vitestHome, "package.json"));
const viteVersion = versionOf(join(vitestHome, "../vite/package.json"));
const runnerHash = sha256(readFileSync(runnerFile));

const CONFIG_SOURCE = `import { appendFileSync } from "node:fs";
import { mergeConfig } from "vitest/config";
import base from "./vitest.config.ts";

const settings = __SETTINGS__;
const record = line => appendFileSync(settings.pinLog, line + "\\n");
const inside = (file, folder) => file === folder || file.startsWith(folder + "/");
const guard = {
  name: "g1-archive-pin-guard",
  enforce: "pre",
  configResolved(config) {
    const test = config.test ?? {};
    record("config " + JSON.stringify({ root: config.root, cacheDir: config.cacheDir, environment: test.environment, globals: test.globals, setupFiles: test.setupFiles, include: test.include }));
  },
  async resolveId(source, importer, options) {
    if (!source.startsWith("@repo/")) return null;
    const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
    const file = resolved ? resolved.id.split("?")[0] : "";
    record("unaliased " + source + " -> " + file);
    if (!inside(file, settings.archive)) throw new Error("G1 pin violation: " + source + " resolved outside the archive: " + file);
    return resolved;
  },
  transform(code, id) {
    const file = id.split("?")[0];
    for (const folder of settings.forbidden) if (inside(file, folder)) throw new Error("G1 pin violation: module loaded from the dependency checkout: " + file);
    if (inside(file, settings.archive)) record("module " + file.slice(settings.archive.length + 1));
    return null;
  },
};

export default mergeConfig(base, {
  root: settings.root,
  cacheDir: settings.cacheDir,
  resolve: { alias: settings.aliases.map(({ pattern, replacement }) => ({ find: new RegExp(pattern), replacement })) },
  plugins: [guard],
  test: { include: settings.include },
});
`;

const directory = realpathSync(mkdtempSync(join(tmpdir(), "xai-sticky-widgets-")));
const packageRoot = join(directory, PACKAGE_DIR);
const pinLog = join(directory, ".g1-pin.log");
const jsonReport = join(directory, ".g1-report.json");
let exitCode = 1;
try {
  execFileSync("tar", ["-x", "-C", directory], { input: execFileSync("git", ["archive", commit], { cwd: root, maxBuffer: 1024 * 1024 * 1024 }) });
  assert.equal(sha256(readFileSync(join(directory, "pnpm-lock.yaml"))), archiveLockHash, "Extracted lockfile differs from the committed lockfile");
  for (const file of FILES) assert(existsSync(join(packageRoot, file)), `Requested test file missing from the archive: ${file}`);

  // Workspace packages of the archive, by package name.
  const workspace = new Map();
  for (const base of ["packages", "apps"]) {
    for (const entry of readdirSync(join(directory, base))) {
      const folder = join(directory, base, entry);
      let pkg;
      try { pkg = JSON.parse(readFileSync(join(folder, "package.json"), "utf8")); } catch { continue; }
      if (typeof pkg.name !== "string") continue;
      assert(!workspace.has(pkg.name), `Duplicate workspace package name in the archive: ${pkg.name}`);
      workspace.set(pkg.name, { folder, rel: `${base}/${entry}`, pkg });
    }
  }
  assert(workspace.has(PACKAGE_NAME), `${PACKAGE_NAME} missing from the archive`);
  const repoDeps = (pkg, withDev) => [...new Set(Object.keys({
    ...pkg.dependencies, ...pkg.optionalDependencies, ...pkg.peerDependencies, ...(withDev ? pkg.devDependencies : {}),
  }).filter(name => name.startsWith("@repo/")))].sort();

  // Workspace dependency closure: the package's own dependencies (including dev), then runtime and peer
  // dependencies transitively. Its tree ids show whether anything the tests can import changed.
  const closure = new Map([[PACKAGE_NAME, workspace.get(PACKAGE_NAME)]]);
  const queue = [[PACKAGE_NAME, true]];
  while (queue.length) {
    const [name, withDev] = queue.shift();
    for (const dependency of repoDeps(workspace.get(name).pkg, withDev)) {
      if (closure.has(dependency)) continue;
      assert(workspace.has(dependency), `Workspace dependency ${dependency} of ${name} missing from the archive`);
      closure.set(dependency, workspace.get(dependency));
      queue.push([dependency, false]);
    }
  }
  const closureNames = [...closure.keys()].sort();
  const closureTrees = closureNames.map(name => `${name}=${closure.get(name).rel}@${git(["rev-parse", `${commit}:${closure.get(name).rel}`])}`);
  const closureChanged = CHANGED_OWNERS.filter(name => closure.has(name));

  // Private node_modules directories: third-party links from the dependency checkout, @repo links into the archive.
  const KEEP_DOT_ENTRIES = new Set([".bin", ".pnpm"]);
  const linkThirdParty = (source, target) => {
    if (!existsSync(source)) return;
    mkdirSync(target, { recursive: true });
    for (const entry of readdirSync(source)) {
      if (entry === "@repo" || (entry.startsWith(".") && !KEEP_DOT_ENTRIES.has(entry))) continue;
      symlinkSync(join(source, entry), join(target, entry));
    }
  };
  const linkWorkspace = (pkg, target) => {
    const links = [];
    for (const name of repoDeps(pkg, true)) {
      assert(workspace.has(name), `Declared workspace dependency ${name} missing from the archive`);
      mkdirSync(join(target, "@repo"), { recursive: true });
      symlinkSync(workspace.get(name).folder, join(target, "@repo", name.slice("@repo/".length)));
      links.push(`${name}->${workspace.get(name).rel}`);
    }
    return links;
  };
  linkThirdParty(join(dependencyRoot, "node_modules"), join(directory, "node_modules"));
  linkWorkspace(JSON.parse(readFileSync(join(directory, "package.json"), "utf8")), join(directory, "node_modules"));
  let packageLinks = [];
  for (const [name, entry] of workspace) {
    if (!entry.rel.startsWith("packages/")) continue;
    const target = join(entry.folder, "node_modules");
    linkThirdParty(join(dependencyRoot, entry.rel, "node_modules"), target);
    const links = linkWorkspace(entry.pkg, target);
    if (name === PACKAGE_NAME) packageLinks = links;
  }

  // tsconfig `extends` of every closure package must resolve inside the archive (Node resolution, as tsconfck does).
  const extendsRecord = [];
  for (const name of closureNames) {
    const tsconfigPath = join(closure.get(name).folder, "tsconfig.json");
    if (!existsSync(tsconfigPath)) continue;
    const match = /"extends"\s*:\s*"([^"]+)"/.exec(readFileSync(tsconfigPath, "utf8"));
    if (!match || match[1].startsWith(".")) continue;
    const target = realpathSync(createRequire(tsconfigPath).resolve(match[1]));
    assert(target.startsWith(`${directory}/`), `tsconfig extends of ${name} resolved outside the archive: ${target}`);
    extendsRecord.push(`${name}:${match[1]}->${relative(directory, target)}`);
  }

  // Exact-match aliases: every archive packages/* export specifier to the archive file.
  const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const aliases = [];
  for (const [name, entry] of workspace) {
    if (!entry.rel.startsWith("packages/")) continue;
    const exportsField = typeof entry.pkg.exports === "string" ? { ".": entry.pkg.exports } : entry.pkg.exports ?? {};
    for (const [key, value] of Object.entries(exportsField)) {
      if (!key.startsWith(".") || key.includes("*")) continue;
      const target = typeof value === "string" ? value : value?.import ?? value?.default;
      if (typeof target !== "string") continue;
      const specifier = name + (key === "." ? "" : key.slice(1));
      aliases.push({ specifier, pattern: `^${escapeRegExp(specifier)}$`, replacement: join(entry.folder, target) });
    }
  }
  aliases.sort((left, right) => left.specifier.localeCompare(right.specifier));

  const settings = {
    archive: directory,
    root: packageRoot,
    cacheDir: join(directory, ".g1-vite-cache"),
    forbidden: [join(dependencyRoot, "packages"), join(dependencyRoot, "apps")],
    pinLog,
    include: FILES,
    aliases: aliases.map(({ pattern, replacement }) => ({ pattern, replacement })),
  };
  const configFile = join(packageRoot, "g1-widgets.vitest.config.mjs");
  writeFileSync(configFile, CONFIG_SOURCE.replace("__SETTINGS__", JSON.stringify(settings)), { flag: "wx" });
  const archiveHashes = ["package.json", "tsconfig.json", "vitest.config.ts", "src/__tests__/setup.ts", ...FILES]
    .map(file => `${file}=${sha256(readFileSync(join(packageRoot, file)))}`);

  const vitestArgs = ["run", "--config", configFile, "--reporter=verbose", "--reporter=json", `--outputFile.json=${jsonReport}`];
  const result = spawnSync(vitestBin, vitestArgs, {
    cwd: packageRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  const vitestStatus = result.status ?? 1;

  // Per-file summary from the JSON reporter.
  let report = null;
  let reportError = "";
  try { report = JSON.parse(readFileSync(jsonReport, "utf8")); } catch (error) { reportError = String(error?.message ?? error); }
  const perFile = (report?.testResults ?? []).map(suite => {
    const tests = suite.assertionResults ?? [];
    const count = status => tests.filter(test => test.status === status).length;
    return { file: relative(packageRoot, suite.name), status: suite.status, total: tests.length, passed: count("passed"), failed: count("failed"), skipped: tests.length - count("passed") - count("failed") };
  }).sort((left, right) => FILES.indexOf(left.file) - FILES.indexOf(right.file));

  // Module-pin record written by the guard plugin.
  const pinLines = existsSync(pinLog) ? readFileSync(pinLog, "utf8").split("\n").filter(Boolean) : [];
  const configLines = [...new Set(pinLines.filter(line => line.startsWith("config ")))];
  const unaliased = [...new Set(pinLines.filter(line => line.startsWith("unaliased ")))];
  const modules = [...new Set(pinLines.filter(line => line.startsWith("module ")).map(line => line.slice("module ".length)))].sort();
  const modulesByPackage = new Map();
  for (const module of modules) {
    const key = module.split("/").slice(0, 2).join("/");
    modulesByPackage.set(key, (modulesByPackage.get(key) ?? 0) + 1);
  }
  const changedLoaded = modules.filter(module => CHANGED_PATHS.some(prefix => module.startsWith(prefix)));
  let resolvedConfig = null;
  try { resolvedConfig = configLines.length ? JSON.parse(configLines[0].slice("config ".length)) : null; } catch { resolvedConfig = null; }

  // Harness validity checks (not test outcomes).
  const checks = [];
  const check = (label, ok) => checks.push(`${ok ? "PASS" : "FAIL"} ${label}`);
  check("JSON report parsed", Boolean(report));
  check("reported files equal the five requested files", JSON.stringify(perFile.map(entry => entry.file).sort()) === JSON.stringify([...FILES].sort()));
  check("archive package config in effect (environment jsdom, globals false, setupFiles [src/__tests__/setup.ts])",
    resolvedConfig?.environment === "jsdom" && resolvedConfig?.globals === false && Array.isArray(resolvedConfig?.setupFiles)
      && resolvedConfig.setupFiles.length === 1 && String(resolvedConfig.setupFiles[0]).endsWith("src/__tests__/setup.ts"));
  check("Vite root is the archive package", resolvedConfig?.root === packageRoot);
  check("guard plugin active (archive modules recorded)", modules.length > 0);
  const harnessFailed = checks.some(line => line.startsWith("FAIL"));
  exitCode = vitestStatus !== 0 ? vitestStatus : harnessFailed ? 2 : 0;

  const totals = perFile.reduce((sum, entry) => ({ total: sum.total + entry.total, passed: sum.passed + entry.passed, failed: sum.failed + entry.failed, skipped: sum.skipped + entry.skipped }), { total: 0, passed: 0, failed: 0, skipped: 0 });
  const header = [
    `requested_revision=${revision}`,
    `resolved_commit=${commit}`,
    `resolved_tree=${tree}`,
    `suffix=${suffix}`,
    `package=${PACKAGE_NAME} (${PACKAGE_DIR})`,
    `include=${FILES.join(",")}`,
    `command=node docs/reviews/web-sticky-recovery-final/verify-widgets.mjs ${revision} ${suffix}`,
    `vitest_bin=${vitestBin}`,
    `vitest_args=${vitestArgs.join(" ")}`,
    `vitest_version=${vitestVersion} vite_version=${viteVersion} node=${process.version} platform=${process.platform}-${process.arch} tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `dependency_root=${dependencyRoot}`,
    `dependency_lockfile_sha256=${dependencyLockHash}`,
    `archive_lockfile_sha256=${archiveLockHash}`,
    `runner_sha256=${runnerHash}`,
    `archive_file_sha256 ${archiveHashes.join(" ")}`,
    `closure_trees ${closureTrees.join(" ")}`,
    `closure_contains_changed_packages=${closureChanged.length ? closureChanged.join(",") : "none"}`,
    `package_workspace_links ${packageLinks.join(" ")}`,
    `tsconfig_extends ${extendsRecord.join(" ")}`,
    `aliases=${aliases.length} exact-match (${aliases.filter(alias => closure.has(alias.specifier.split("/").slice(0, 2).join("/"))).map(alias => alias.specifier).join(",")} within the closure)`,
    `vitest_exit=${vitestStatus}${result.signal ? ` signal=${result.signal}` : ""}${result.error ? ` spawn_error=${result.error.message}` : ""}`,
    `harness_checks=${harnessFailed ? "FAIL" : "PASS"} (${checks.filter(line => line.startsWith("PASS")).length}/${checks.length})`,
    `exit=${exitCode}`,
  ].join("\n");
  const summary = [
    `json_report=${report ? `success=${report.success} numTotalTestSuites=${report.numTotalTestSuites} numTotalTests=${report.numTotalTests} numPassedTests=${report.numPassedTests} numFailedTests=${report.numFailedTests} numPendingTests=${report.numPendingTests} numTodoTests=${report.numTodoTests}` : `missing (${reportError})`}`,
    ...perFile.map(entry => `file ${entry.file} status=${entry.status} tests=${entry.total} passed=${entry.passed} failed=${entry.failed} skipped=${entry.skipped}`),
    `total files=${perFile.length} tests=${totals.total} passed=${totals.passed} failed=${totals.failed} skipped=${totals.skipped}`,
    ...checks.map(line => `harness ${line}`),
    `pin_config ${configLines.length ? configLines.map(line => line.slice("config ".length)).join(" | ") : "missing"}`,
    `pin_unaliased_repo_imports=${unaliased.length}${unaliased.length ? ` ${unaliased.join(" | ")}` : ""}`,
    `pin_modules_by_package ${[...modulesByPackage].map(([key, count]) => `${key}=${count}`).join(" ")}`,
    `pin_changed_package_modules_loaded=${changedLoaded.length ? changedLoaded.join(",") : "none"}`,
    `pin_modules (${modules.length}):`,
    ...modules.map(module => `  ${module}`),
  ].join("\n");
  if (existsSync(logPath)) throw Error(`Evidence appeared during the run; refusing to overwrite ${logPath}`);
  writeFileSync(logPath, `${header}\n---- stdout ----\n${result.stdout ?? ""}\n---- stderr ----\n${result.stderr ?? ""}\n---- runner summary ----\n${summary}`.trimEnd() + "\n", { flag: "wx" });
  console.log(`widgets ${revision} (${commit.slice(0, 12)}): vitest_exit=${vitestStatus} harness=${harnessFailed ? "FAIL" : "PASS"} exit=${exitCode}`);
  for (const entry of perFile) console.log(`  ${entry.file}: ${entry.status} ${entry.passed}/${entry.total}`);
  console.log(`  total: ${totals.passed}/${totals.total} passed, ${totals.failed} failed, ${totals.skipped} skipped; log ${relative(root, logPath)}`);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
process.exitCode = exitCode;
