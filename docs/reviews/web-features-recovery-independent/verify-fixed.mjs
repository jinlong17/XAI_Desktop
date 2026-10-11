/**
 * Parent-role immutable-archive runner: Settings Features actual-host oracles (CP-FEATURES-01, control-plane
 * batch 23; contract docs/reviews/web-features-recovery-contract/contract.md sections 12 and 14 items E3 and E8).
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals the revision's> \
 *     node docs/reviews/web-features-recovery-independent/verify-fixed.mjs <revision> host <suffix>
 *
 * One mode, `host`: ./host.test.tsx against the production AccountDataGate + WebShellProvider + Shell +
 * ComposedSettings behind the production createBrowserRouter factory.
 *
 * - Expands `git archive <revision>` into a fresh temporary directory (realpath) and gates on SHA-256 equality of
 *   XAI_DEPS_ROOT/pnpm-lock.yaml (default: this repository root), `git show <revision>:pnpm-lock.yaml` and the
 *   extracted lockfile.
 * - Copies only host.test.tsx into docs/reviews/web-features-recovery-independent/ inside the archive and verifies
 *   its SHA-256 against the evidence file, so every product file comes from the archive.
 * - Every archive workspace (packages/* and apps/*) gets a private node_modules directory: read-only links to the
 *   dependency checkout's third-party entries, and @repo links to the archive's own package folders for every
 *   declared workspace dependency (Node and tsconfig `extends` resolution stay inside the archive). The oracle
 *   directory gets links to the single react, react-dom, @testing-library/react and react-router instances.
 * - Exact-match aliases map every archive packages/* export specifier to the archive file. A guard plugin fails
 *   the run if any module is transformed from the packages/, apps/ or docs/ trees of the dependency checkout or of
 *   this runner's checkout, fails any unaliased @repo import that resolves outside the archive, and records every
 *   archive module it transforms; a harness check requires the host's product modules to have been loaded from
 *   the archive.
 * - Writes host-<suffix>-<revision>.log beside this file, refusing to overwrite (checked before archiving, again
 *   before writing, and with an exclusive create): requested and resolved revision and tree, lockfile hashes,
 *   oracle and runner hashes, archive file hashes, versions, Vitest stdout and stderr, and a runner summary with a
 *   per-case outcome list from Vitest's JSON reporter, PRECONDITION counts, harness checks, the OBSERVED fact
 *   lines and the module-pin record.
 * - Exit status: Vitest's nonzero status; 2 if Vitest exited 0 but a harness check failed.
 * Nothing is written into the dependency checkout; Vite caches and the bundled-config temp files stay inside the
 * temporary archive, which is deleted afterwards.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(fileURLToPath(new URL("../../../", import.meta.url)));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const owned = "docs/reviews/web-features-recovery-independent";
const dependencyRoot = realpathSync(resolve(process.env.XAI_DEPS_ROOT ?? root));
const [revision, mode, suffix, ...extra] = process.argv.slice(2);
if (!revision || !mode || !suffix || extra.length) throw Error("Usage: node verify-fixed.mjs <revision> host <suffix>");
if (!/^[A-Za-z0-9._-]+$/.test(revision)) throw Error(`Unsafe revision: ${revision}`);
if (!/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error(`Unsafe suffix: ${suffix}`);

const FEATURES_DIR = "packages/xai-web-settings-features-panel";
const ORACLE_FILES = ["host.test.tsx"];
// Product modules the host composition must load from the archive (all reachable from package entry points, so
// they are loaded at f359be6 and on a fixed product alike).
const HOST_PROVENANCE = [
  `${FEATURES_DIR}/src/FeaturesPane.tsx`,
  `${FEATURES_DIR}/src/internal/featuresPane.tsx`,
  `${FEATURES_DIR}/src/featureIds.ts`,
  `${FEATURES_DIR}/src/withDisabledFallback.tsx`,
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/storage.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-settings-shell/src/SettingsFooter.tsx",
  "packages/plugin-web-settings-shell/src/Toggle.tsx",
  "packages/plugin-web-settings-shell/src/internal/confirmAction.ts",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/registry.tsx",
  "apps/web/src/routes/modules/shellRegistrations.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/settingsPaneComposition.ts",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/settingsDeparture.ts",
];
const MODES = { host: { include: [`${owned}/host.test.tsx`], timeout: 60000, globals: true, setupFiles: [], provenance: HOST_PROVENANCE } };
if (!Object.hasOwn(MODES, mode)) throw Error(`Unsupported mode ${mode}; the only mode is host`);
const spec = MODES[mode];
const logPath = join(evidence, `${mode}-${suffix}-${revision}.log`);
if (existsSync(logPath)) throw Error(`Evidence exists; use a new suffix: ${logPath}`);

const sha256 = data => createHash("sha256").update(data).digest("hex");
const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
const commit = git(["rev-parse", "--verify", `${revision}^{commit}`]);
const tree = git(["rev-parse", `${commit}^{tree}`]);
const runnerHead = git(["rev-parse", "HEAD"]);
const archiveLock = execFileSync("git", ["show", `${commit}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 256 * 1024 * 1024 });
assert(existsSync(join(dependencyRoot, "node_modules")), "Dependency tree missing; set XAI_DEPS_ROOT to a checkout with installed node_modules");
const dependencyLockHash = sha256(readFileSync(join(dependencyRoot, "pnpm-lock.yaml")));
const archiveLockHash = sha256(archiveLock);
assert.equal(dependencyLockHash, archiveLockHash, "Dependency checkout lockfile differs from the requested revision's lockfile");
const featuresModules = join(dependencyRoot, FEATURES_DIR, "node_modules");
const vitestBin = join(featuresModules, ".bin/vitest");
assert(existsSync(vitestBin), `Vitest binary missing at ${vitestBin}`);
const vitestHome = realpathSync(join(featuresModules, "vitest"));
const versionOf = file => { try { return JSON.parse(readFileSync(file, "utf8")).version; } catch { return "unknown"; } };
const vitestVersion = versionOf(join(vitestHome, "package.json"));
const viteVersion = versionOf(join(vitestHome, "../vite/package.json"));
const jsdomVersion = versionOf(join(vitestHome, "../jsdom/package.json"));
const oracleHashes = Object.fromEntries([...ORACLE_FILES, "verify-fixed.mjs"].map(name => [name, sha256(readFileSync(join(evidence, name)))]));
// Code that must never be loaded: the dependency checkout's and this runner checkout's own source trees.
const forbidden = [...new Set([dependencyRoot, root].flatMap(base => ["packages", "apps", "docs"].map(folder => join(base, folder))))];

const CONFIG_SOURCE = `import { appendFileSync } from "node:fs";

const settings = __SETTINGS__;
const record = line => appendFileSync(settings.pinLog, line + "\\n");
const inside = (file, folder) => file === folder || file.startsWith(folder + "/");
const guard = {
  name: "features-host-archive-pin-guard",
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
    if (!inside(file, settings.archive)) throw new Error("Pin violation: " + source + " resolved outside the archive: " + file);
    return resolved;
  },
  transform(code, id) {
    const file = id.split("?")[0];
    for (const folder of settings.forbidden) if (inside(file, folder)) throw new Error("Pin violation: module loaded from a checkout instead of the archive: " + file);
    if (inside(file, settings.archive)) record("module " + file.slice(settings.archive.length + 1));
    return null;
  },
};

export default {
  root: settings.root,
  cacheDir: settings.cacheDir,
  resolve: { alias: settings.aliases.map(({ pattern, replacement }) => ({ find: new RegExp(pattern), replacement })) },
  plugins: [guard],
  esbuild: { jsx: "automatic" },
  test: {
    globals: settings.globals,
    environment: "jsdom",
    setupFiles: settings.setupFiles,
    include: settings.include,
    testTimeout: settings.timeout,
    hookTimeout: settings.timeout,
    // React's act() environment warning is harness noise; every other console line is kept.
    onConsoleLog: log => !String(log).includes("not wrapped in act("),
  },
};
`;

const directory = realpathSync(mkdtempSync(join(tmpdir(), "xai-features-host-")));
let exitCode = 1;
try {
  execFileSync("tar", ["-x", "-C", directory], { input: execFileSync("git", ["archive", commit], { cwd: root, maxBuffer: 1024 * 1024 * 1024 }) });
  const extractedLockHash = sha256(readFileSync(join(directory, "pnpm-lock.yaml")));
  assert.equal(extractedLockHash, archiveLockHash, "Extracted lockfile differs from the committed lockfile");
  for (const file of HOST_PROVENANCE) assert(existsSync(join(directory, file)), `Required product file missing from the archive: ${file}`);

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
  const repoDeps = (pkg, withDev) => [...new Set(Object.keys({
    ...pkg.dependencies, ...pkg.optionalDependencies, ...pkg.peerDependencies, ...(withDev ? pkg.devDependencies : {}),
  }).filter(name => name.startsWith("@repo/")))].sort();

  // Private node_modules directories: third-party links from the dependency checkout, @repo links into the archive.
  const KEEP_DOT_ENTRIES = new Set([".bin", ".pnpm"]);
  let thirdPartyLinks = 0;
  let workspaceLinks = 0;
  const linkThirdParty = (source, target) => {
    if (!existsSync(source)) return;
    mkdirSync(target, { recursive: true });
    for (const entry of readdirSync(source)) {
      if (entry === "@repo" || (entry.startsWith(".") && !KEEP_DOT_ENTRIES.has(entry))) continue;
      symlinkSync(join(source, entry), join(target, entry));
      thirdPartyLinks += 1;
    }
  };
  const linkWorkspace = (pkg, target) => {
    for (const name of repoDeps(pkg, true)) {
      if (!workspace.has(name)) continue;
      mkdirSync(join(target, "@repo"), { recursive: true });
      symlinkSync(workspace.get(name).folder, join(target, "@repo", name.slice("@repo/".length)));
      workspaceLinks += 1;
    }
  };
  linkThirdParty(join(dependencyRoot, "node_modules"), join(directory, "node_modules"));
  linkWorkspace(JSON.parse(readFileSync(join(directory, "package.json"), "utf8")), join(directory, "node_modules"));
  for (const [, entry] of workspace) {
    const target = join(entry.folder, "node_modules");
    linkThirdParty(join(dependencyRoot, entry.rel, "node_modules"), target);
    linkWorkspace(entry.pkg, target);
  }

  // Oracle directory: the oracle file plus links to the single react, react-dom, Testing Library and router instances.
  const oracleTarget = join(directory, owned);
  mkdirSync(oracleTarget, { recursive: true });
  for (const name of ORACLE_FILES) {
    copyFileSync(join(evidence, name), join(oracleTarget, name));
    assert.equal(sha256(readFileSync(join(oracleTarget, name))), oracleHashes[name], `Copied oracle ${name} differs from the evidence file`);
  }
  const oracleModules = join(oracleTarget, "node_modules");
  const oracleLinks = [
    ["react", join(featuresModules, "react")],
    ["react-dom", join(featuresModules, "react-dom")],
    ["@testing-library/react", join(featuresModules, "@testing-library/react")],
    ["react-router", join(dependencyRoot, "apps/web/node_modules/react-router")],
  ].map(([name, source]) => {
    const real = realpathSync(source);
    mkdirSync(join(oracleModules, name, ".."), { recursive: true });
    symlinkSync(real, join(oracleModules, name));
    return `${name}->${relative(dependencyRoot, real)}@${versionOf(join(real, "package.json"))}`;
  });

  // tsconfig `extends` of every workspace package must resolve inside the archive (Node resolution, as tsconfck does).
  const extendsRecord = [];
  for (const [name, entry] of workspace) {
    const tsconfigPath = join(entry.folder, "tsconfig.json");
    if (!existsSync(tsconfigPath)) continue;
    const match = /"extends"\s*:\s*"([^"]+)"/.exec(readFileSync(tsconfigPath, "utf8"));
    if (!match || match[1].startsWith(".")) continue;
    let target = "";
    try { target = realpathSync(createRequire(tsconfigPath).resolve(match[1])); } catch { target = "unresolved"; }
    if (target !== "unresolved") assert(target.startsWith(`${directory}/`), `tsconfig extends of ${name} resolved outside the archive: ${target}`);
    extendsRecord.push(`${name}:${match[1]}->${target === "unresolved" ? target : relative(directory, target)}`);
  }
  const unresolvedExtends = extendsRecord.filter(line => line.endsWith("->unresolved"));

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

  const productFiles = [
    `${FEATURES_DIR}/src/FeaturesPane.tsx`, `${FEATURES_DIR}/src/internal/featuresPane.tsx`, `${FEATURES_DIR}/src/types.ts`, `${FEATURES_DIR}/src/index.ts`,
    "packages/plugin-web-storage/src/AccountDataGate.tsx", "packages/plugin-web-storage/src/internal/usePref.ts", "packages/plugin-web-storage/src/internal/storage.ts",
    "packages/plugin-web-storage/src/internal/usePrefAsync.ts", "packages/plugin-web-storage/src/internal/prefMutation.ts",
    "packages/plugin-web-settings-shell/src/SettingsFooter.tsx", "packages/xai-web-shell/src/Shell.tsx", "packages/xai-web-shell/src/AppRail.tsx",
    "apps/web/src/routes/modules/composedSettingsRegistration.tsx", "apps/web/src/routes/modules/departureCoordinator.tsx",
    "apps/web/src/routes/modules/settingsDeparture.ts", "apps/web/src/routes/modules/shellRegistrations.tsx",
  ];
  const productHashes = productFiles.map(file => `${file}=${existsSync(join(directory, file)) ? sha256(readFileSync(join(directory, file))) : "missing"}`);
  const featuresTree = git(["rev-parse", `${commit}:${FEATURES_DIR}`]);

  const pinLog = join(directory, `.pin-${mode}.log`);
  const jsonReport = join(directory, `.report-${mode}.json`);
  const settings = {
    archive: directory,
    root: directory,
    cacheDir: join(directory, ".features-host-vite-cache"),
    forbidden,
    pinLog,
    include: spec.include,
    globals: spec.globals,
    setupFiles: spec.setupFiles.map(file => join(directory, file)),
    timeout: spec.timeout,
    aliases: aliases.map(({ pattern, replacement }) => ({ pattern, replacement })),
  };
  const configFile = join(directory, `features-host-${mode}.vitest.config.mjs`);
  writeFileSync(configFile, CONFIG_SOURCE.replace("__SETTINGS__", JSON.stringify(settings)), { flag: "wx" });
  const vitestArgs = ["run", "--config", configFile, "--reporter=verbose", "--reporter=json", `--outputFile.json=${jsonReport}`];
  const result = spawnSync(vitestBin, vitestArgs, {
    cwd: directory,
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  const vitestStatus = result.status ?? 1;

  // Per-case outcomes from the JSON reporter.
  let report = null;
  let reportError = "";
  try { report = JSON.parse(readFileSync(jsonReport, "utf8")); } catch (error) { reportError = String(error?.message ?? error); }
  const strip = text => String(text ?? "").replace(/\u001b\[[0-9;]*m/g, "");
  const cases = [];
  for (const suite of report?.testResults ?? []) {
    for (const test of suite.assertionResults ?? []) {
      const message = strip((test.failureMessages ?? [])[0] ?? "");
      const first = message.split("\n").find(line => line.trim().length > 0) ?? "";
      cases.push({ file: relative(directory, suite.name), name: test.fullName ?? test.title, status: test.status, first: first.trim().slice(0, 400), precondition: message.includes("PRECONDITION:") });
    }
  }
  const count = status => cases.filter(entry => entry.status === status).length;
  const preconditionFailures = cases.filter(entry => entry.status === "failed" && entry.precondition).length;
  const suiteErrors = (report?.testResults ?? []).filter(suite => suite.status === "failed" && (suite.assertionResults ?? []).length === 0).map(suite => strip(suite.message).split("\n")[0]);
  const stdoutLines = strip(result.stdout).split("\n");
  const stderrLines = strip(result.stderr).split("\n");
  const unhandled = [...stdoutLines, ...stderrLines].filter(line => /Unhandled (Error|Rejection)/.test(line)).length;
  const observedLines = stdoutLines.filter(line => line.startsWith("OBSERVED "));
  const runtimeErrorLines = [...stdoutLines, ...stderrLines].filter(line => line.startsWith("RUNTIME-ERRORS "));

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
  const missingProvenance = spec.provenance.filter(file => !modules.includes(file));
  let resolvedConfig = null;
  try { resolvedConfig = configLines.length ? JSON.parse(configLines[0].slice("config ".length)) : null; } catch { resolvedConfig = null; }

  // Harness validity checks (not test outcomes).
  const checks = [];
  const check = (label, ok) => checks.push(`${ok ? "PASS" : "FAIL"} ${label}`);
  check("JSON report parsed", Boolean(report));
  check("reported files equal the requested include", JSON.stringify([...new Set(cases.map(entry => entry.file))].sort()) === JSON.stringify([...spec.include].sort()));
  check(`config in effect (environment jsdom, globals ${spec.globals}, setupFiles [], root = archive)`,
    resolvedConfig?.environment === "jsdom" && resolvedConfig?.globals === spec.globals && Array.isArray(resolvedConfig?.setupFiles)
      && resolvedConfig.setupFiles.length === 0 && resolvedConfig?.root === directory);
  check("guard plugin active (archive modules recorded)", modules.length > 0);
  check(`required product modules loaded from the archive (${spec.provenance.length})`, missingProvenance.length === 0);
  check("no test-file suite error", suiteErrors.length === 0);
  const harnessFailed = checks.some(line => line.startsWith("FAIL"));
  exitCode = vitestStatus !== 0 ? vitestStatus : harnessFailed ? 2 : 0;

  const header = [
    `requested_revision=${revision}`,
    `resolved_commit=${commit}`,
    `resolved_tree=${tree}`,
    `features_package_tree=${featuresTree}`,
    `mode=${mode}`,
    `suffix=${suffix}`,
    `include=${spec.include.join(",")}`,
    `command=XAI_DEPS_ROOT=${dependencyRoot} node ${owned}/verify-fixed.mjs ${revision} ${mode} ${suffix}`,
    `runner_checkout_head=${runnerHead}`,
    `vitest_bin=${vitestBin}`,
    `vitest_args=${vitestArgs.join(" ")}`,
    `vitest_version=${vitestVersion} vite_version=${viteVersion} jsdom_version=${jsdomVersion} node=${process.version} platform=${process.platform}-${process.arch} tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `dependency_root=${dependencyRoot}`,
    `dependency_lockfile_sha256=${dependencyLockHash}`,
    `archive_lockfile_sha256=${archiveLockHash}`,
    `extracted_lockfile_sha256=${extractedLockHash}`,
    `oracle_sha256 ${Object.entries(oracleHashes).map(([name, hash]) => `${name}=${hash}`).join(" ")}`,
    `archive_file_sha256 ${productHashes.join(" ")}`,
    `oracle_dependency_links ${oracleLinks.join(" ")}`,
    `node_modules_links third_party=${thirdPartyLinks} workspace=${workspaceLinks}`,
    `tsconfig_extends_unresolved=${unresolvedExtends.length ? unresolvedExtends.join(" ") : "none"} (checked ${extendsRecord.length})`,
    `aliases=${aliases.length} exact-match archive export specifiers`,
    `forbidden_source_roots ${forbidden.join(" ")}`,
    `vitest_exit=${vitestStatus}${result.signal ? ` signal=${result.signal}` : ""}${result.error ? ` spawn_error=${result.error.message}` : ""}`,
    `harness_checks=${harnessFailed ? "FAIL" : "PASS"} (${checks.filter(line => line.startsWith("PASS")).length}/${checks.length})`,
    `exit=${exitCode}`,
  ].join("\n");
  const summary = [
    `json_report=${report ? `success=${report.success} numTotalTests=${report.numTotalTests} numPassedTests=${report.numPassedTests} numFailedTests=${report.numFailedTests} numPendingTests=${report.numPendingTests} numTodoTests=${report.numTodoTests}` : `missing (${reportError})`}`,
    `totals cases=${cases.length} passed=${count("passed")} failed=${count("failed")} skipped=${cases.length - count("passed") - count("failed")} precondition_failures=${preconditionFailures} suite_errors=${suiteErrors.length} unhandled_error_lines=${unhandled} runtime_error_lines=${runtimeErrorLines.length}`,
    ...suiteErrors.map(line => `suite_error ${line}`),
    ...checks.map(line => `harness ${line}`),
    ...cases.map((entry, index) => `case ${String(index + 1).padStart(3, "0")} ${entry.status.toUpperCase()}${entry.precondition ? " PRECONDITION" : ""} | ${entry.name}${entry.status === "failed" ? `\n    first: ${entry.first}` : ""}`),
    `observed_lines=${observedLines.length}`,
    ...observedLines.map(line => `observed ${line.slice("OBSERVED ".length)}`),
    ...runtimeErrorLines.map(line => `runtime_errors ${line.slice("RUNTIME-ERRORS ".length)}`),
    `pin_config ${configLines.length ? configLines.map(line => line.slice("config ".length)).join(" | ") : "missing"}`,
    `pin_unaliased_repo_imports=${unaliased.length}${unaliased.length ? ` ${unaliased.join(" | ")}` : ""}`,
    `pin_required_provenance_missing=${missingProvenance.length ? missingProvenance.join(",") : "none"}`,
    `pin_required_provenance ${spec.provenance.join(" ")}`,
    `pin_modules=${modules.length} by package: ${[...modulesByPackage].map(([key, value]) => `${key}=${value}`).join(" ")}`,
  ].join("\n");
  if (existsSync(logPath)) throw Error(`Evidence appeared during the run; refusing to overwrite ${logPath}`);
  writeFileSync(logPath, `${header}\n---- stdout ----\n${result.stdout ?? ""}\n---- stderr ----\n${result.stderr ?? ""}\n---- runner summary ----\n${summary}`.trimEnd() + "\n", { flag: "wx" });
  console.log(`${mode} ${revision} (${commit.slice(0, 12)}): vitest_exit=${vitestStatus} harness=${harnessFailed ? "FAIL" : "PASS"} exit=${exitCode} cases=${cases.length} passed=${count("passed")} failed=${count("failed")} precondition=${preconditionFailures} log=${relative(root, logPath)}`);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
process.exitCode = exitCode;
