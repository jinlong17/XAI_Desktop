/**
 * Parent-role immutable-archive runner: Settings Appearance production-App jsdom host oracles (CP-APPEARANCE-01,
 * control-plane batch 38; contract docs/reviews/web-appearance-recovery-contract/contract.md r3, sections 12 and 14
 * items E3 and E8).
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals the revision's> \
 *     node docs/reviews/web-appearance-recovery-independent/verify-fixed.mjs <revision> host <suffix>
 *
 * One mode, `host`: ./host.test.tsx (with ./host-fixture.tsx) against the production `App` composition — the
 * production route table in the main.tsx module order, rendered through a fresh data router per case, with only the
 * auth-session hook substituted.
 *
 * - Expands `git archive <revision>` into a fresh temporary directory (realpath) and gates on SHA-256 equality of
 *   XAI_DEPS_ROOT/pnpm-lock.yaml (default: this repository root), `git show <revision>:pnpm-lock.yaml` and the
 *   extracted lockfile; all three must also equal the contract's lockfile gate.
 * - Copies only the two oracle files into docs/reviews/web-appearance-recovery-independent/ inside the archive and
 *   verifies their SHA-256 against the evidence files, so every product file comes from the archive.
 * - Every archive workspace (packages/* and apps/*) gets a private node_modules directory: read-only links to the
 *   dependency checkout's third-party entries, and @repo links to the archive's own package folders for every
 *   declared workspace dependency (Node and tsconfig `extends` resolution stay inside the archive). The oracle
 *   directory gets links to the single react, react-dom, @testing-library/react, @testing-library/user-event,
 *   react-router and vitest instances.
 * - Exact-match aliases map every archive packages/* export specifier to the archive file. A guard plugin fails the
 *   run if any module is transformed from the packages/, apps/ or docs/ trees of the dependency checkout or of this
 *   runner's checkout, fails any unaliased @repo import that resolves outside the archive, and records every archive
 *   module it transforms; a harness check requires the production App's modules to have been loaded from the archive.
 * - Writes host-<suffix>-<revision>.log beside this file, refusing to overwrite (checked before archiving, again
 *   before writing, and with an exclusive create): requested and resolved revision and tree, package trees, the four
 *   lockfile values, oracle and runner hashes, archive file hashes compared with the contract's source table,
 *   versions, Vitest stdout and stderr, and a runner summary with a per-case outcome list from Vitest's JSON
 *   reporter, PRECONDITION counts, harness checks, the OBSERVED fact lines, RUNTIME-ERRORS lines and the module-pin
 *   record.
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

const LOCKFILE_GATE = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const root = realpathSync(fileURLToPath(new URL("../../../", import.meta.url)));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const owned = "docs/reviews/web-appearance-recovery-independent";
const dependencyRoot = realpathSync(resolve(process.env.XAI_DEPS_ROOT ?? root));
const [revision, mode, suffix, ...extra] = process.argv.slice(2);
if (!revision || !mode || !suffix || extra.length) throw Error("Usage: node verify-fixed.mjs <revision> host <suffix>");
if (!/^[A-Za-z0-9._-]+$/.test(revision)) throw Error(`Unsafe revision: ${revision}`);
if (!/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error(`Unsafe suffix: ${suffix}`);

const APPEARANCE_DIR = "packages/xai-web-settings-appearance";
const SHELL_DIR = "packages/xai-web-shell";
const WEB_DIR = "apps/web";
const ORACLE_FILES = ["host-fixture.tsx", "host.test.tsx"];
// Production modules the host composition must load from the archive (reachable from the production route table and
// the main.tsx module order, so they are loaded at 5cd63ff and on a fixed product alike).
const HOST_PROVENANCE = [
  `${APPEARANCE_DIR}/src/index.ts`,
  `${APPEARANCE_DIR}/src/AppearancePane.tsx`,
  `${APPEARANCE_DIR}/src/internal/appearancePane.tsx`,
  `${WEB_DIR}/src/App.tsx`,
  `${WEB_DIR}/src/routes/router.tsx`,
  `${WEB_DIR}/src/routes/RouteGateElements.tsx`,
  `${WEB_DIR}/src/routes/RouteErrorBoundary.tsx`,
  `${WEB_DIR}/src/routes/modules/shellRegistrations.tsx`,
  `${WEB_DIR}/src/routes/modules/composedSettingsRegistration.tsx`,
  `${WEB_DIR}/src/routes/modules/settingsPaneComposition.ts`,
  `${WEB_DIR}/src/routes/modules/departureCoordinator.tsx`,
  `${WEB_DIR}/src/routes/modules/settingsDeparture.ts`,
  `${WEB_DIR}/src/providers/AccountStorageGate.tsx`,
  `${WEB_DIR}/src/providers/AppProviders.tsx`,
  `${WEB_DIR}/src/observability/runtime.ts`,
  `${WEB_DIR}/src/service-worker/register.ts`,
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/accountCoordination.ts",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/storage.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/sameTabBus.ts",
  `${SHELL_DIR}/src/Shell.tsx`,
  `${SHELL_DIR}/src/Topbar.tsx`,
  `${SHELL_DIR}/src/AppRail.tsx`,
  `${SHELL_DIR}/src/AvatarMenu.tsx`,
  `${SHELL_DIR}/src/SignOutConfirmDialog.tsx`,
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/plugin-web-tokens/src/index.ts",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/guards.tsx",
];
// Contract r3 header: the unit's source at 5cd63ff (path -> SHA-256). Recorded per log line as match/differs.
const CONTRACT_SOURCES = {
  [`${APPEARANCE_DIR}/src/AppearancePane.tsx`]: "552eb224c5103d1c0d0ee878420f8a586ee91575dd8461f908de1147cf2b08c3",
  [`${APPEARANCE_DIR}/src/internal/appearancePane.tsx`]: "34b938200d1a43a9e73b1e5e6397ed7014ca763abb5082040d72cd309f43309c",
  [`${APPEARANCE_DIR}/src/types.ts`]: "18d5894e6603427f933100f9030d6e403c03abc57d9bd561f372b0b4f559f6d6",
  [`${APPEARANCE_DIR}/src/index.ts`]: "10bfbed11749e9c65fc3c2d40d0a50e177154254ef83a2e0690c693aeb4dc776",
  [`${APPEARANCE_DIR}/src/styles.css`]: "1b17d1f442905e255eae53e4e16a01c02b4a912ed6a1482231e8db5e50d5927c",
  [`${WEB_DIR}/src/App.tsx`]: "5d10dba6a879cf0d42f224e58ef70637bd82b71dc1318ee99c4567977638fb59",
  [`${SHELL_DIR}/src/Topbar.tsx`]: "70ba299e4d8a088ba0d085272fbc4cfe95933265bd6066fb59ae5cdae3de5297",
  [`${SHELL_DIR}/src/Shell.tsx`]: "7d46423f40adc5412f54b701c2c93ab4f7529e329dc22766f387d78f614f8df0",
  [`${SHELL_DIR}/src/types.ts`]: "92b68b2ba5da830bd8dcdfe33652b2b440eaef72b8665ccd868d5f49d82b73de",
  [`${WEB_DIR}/src/routes/modules/departureCoordinator.tsx`]: "0844a697b146b07fceb1835da7c4410db8812bc07bdea362f3386e991a2bc075",
  "packages/plugin-web-settings-shell/src/SettingsFooter.tsx": "afecc734e7a96a8f7d289de2c3f6def5a1391c72e59f2fa61700f67a691c76ce",
  "packages/plugin-web-settings-shell/src/types.ts": "513f90fd05ef66f6f8fb1aaa230e9a6844407ae44cf3d7a1d8508c4eabfb4522",
  "packages/plugin-web-settings-shell/src/styles.css": "e5369cc7ed3a20650465e001537c7714a3715834d678ea17ff3960fbd3992166",
  "packages/xai-web-pet/src/DesktopPet.tsx": "35edb0e686bf6682192ba1bbe7842d159e161a6593b7ccd13a432d59fe58ad6f",
  "packages/xai-web-pet/src/pet.css": "6326d822b654a22bcad361e57d02413d4569eadf8058f89d90fc3dd43249dcfe",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts": "541fae97413104b8db90c20d7b565a5492f17fc74d79b3e975f954d7189a4491",
  "packages/plugin-web-tokens/src/tokens.css": "7c6eddebd1d826f939862ef75ba8159e966f0c76b0b9d34a0911f6b47265615d",
  "packages/plugin-web-countdown/src/internal/CountdownEditDialog.tsx": "6bcf6295989381101f99a53c1624db8f491c845c1d6debc6e550d7e04a1afdae",
  "packages/plugin-web-ai-chat/src/ErrorBanner.tsx": "7cf751dd321f3cdd490984d62ce49c563a3d1aaecf0b229d8fa203e39bb1fbc2",
};
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
assert.equal(archiveLockHash, LOCKFILE_GATE, "The requested revision's lockfile differs from the contract's lockfile gate");
const webModules = join(dependencyRoot, WEB_DIR, "node_modules");
const vitestBin = join(webModules, ".bin/vitest");
assert(existsSync(vitestBin), `Vitest binary missing at ${vitestBin}`);
const vitestHome = realpathSync(join(webModules, "vitest"));
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
  name: "appearance-host-archive-pin-guard",
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

const directory = realpathSync(mkdtempSync(join(tmpdir(), "xai-appearance-host-")));
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

  // Oracle directory: the two oracle files plus links to the single react, react-dom, Testing Library, user-event,
  // router and vitest instances.
  const oracleTarget = join(directory, owned);
  mkdirSync(oracleTarget, { recursive: true });
  for (const name of ORACLE_FILES) {
    copyFileSync(join(evidence, name), join(oracleTarget, name));
    assert.equal(sha256(readFileSync(join(oracleTarget, name))), oracleHashes[name], `Copied oracle ${name} differs from the evidence file`);
  }
  const oracleModules = join(oracleTarget, "node_modules");
  const oracleLinks = [
    ["react", join(webModules, "react")],
    ["react-dom", join(webModules, "react-dom")],
    ["@testing-library/react", join(webModules, "@testing-library/react")],
    ["@testing-library/user-event", join(dependencyRoot, "packages/xai-web-cmdk/node_modules/@testing-library/user-event")],
    ["react-router", join(webModules, "react-router")],
    ["vitest", join(webModules, "vitest")],
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

  const productHashes = Object.entries(CONTRACT_SOURCES).map(([file, expected]) => {
    const actual = existsSync(join(directory, file)) ? sha256(readFileSync(join(directory, file))) : "missing";
    return `${file}=${actual}(contract:${actual === expected ? "match" : "differs"})`;
  });
  const contractMatches = productHashes.filter(line => line.endsWith("(contract:match)")).length;
  const treeOf = folder => { try { return git(["rev-parse", `${commit}:${folder}`]); } catch { return "missing"; } };

  const pinLog = join(directory, `.pin-${mode}.log`);
  const jsonReport = join(directory, `.report-${mode}.json`);
  const settings = {
    archive: directory,
    root: directory,
    cacheDir: join(directory, ".appearance-host-vite-cache"),
    forbidden,
    pinLog,
    include: spec.include,
    globals: spec.globals,
    setupFiles: spec.setupFiles.map(file => join(directory, file)),
    timeout: spec.timeout,
    aliases: aliases.map(({ pattern, replacement }) => ({ pattern, replacement })),
  };
  const configFile = join(directory, `appearance-host-${mode}.vitest.config.mjs`);
  writeFileSync(configFile, CONFIG_SOURCE.replace("__SETTINGS__", JSON.stringify(settings)), { flag: "wx" });
  const vitestArgs = ["run", "--config", configFile, "--reporter=verbose", "--reporter=json", `--outputFile.json=${jsonReport}`];
  const result = spawnSync(vitestBin, vitestArgs, {
    cwd: directory,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
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
      cases.push({ file: relative(directory, suite.name), name: test.fullName ?? test.title, status: test.status, first: first.trim().slice(0, 600), precondition: message.includes("PRECONDITION:") });
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
  check(`required production modules loaded from the archive (${spec.provenance.length})`, missingProvenance.length === 0);
  check("no test-file suite error", suiteErrors.length === 0);
  const harnessFailed = checks.some(line => line.startsWith("FAIL"));
  exitCode = vitestStatus !== 0 ? vitestStatus : harnessFailed ? 2 : 0;

  const header = [
    `requested_revision=${revision}`,
    `resolved_commit=${commit}`,
    `resolved_tree=${tree}`,
    `appearance_package_tree=${treeOf(APPEARANCE_DIR)} shell_package_tree=${treeOf(SHELL_DIR)} web_app_tree=${treeOf(WEB_DIR)}`,
    `mode=${mode}`,
    `suffix=${suffix}`,
    `include=${spec.include.join(",")}`,
    `command=XAI_DEPS_ROOT=${dependencyRoot} node ${owned}/verify-fixed.mjs ${revision} ${mode} ${suffix}`,
    `runner_checkout_head=${runnerHead}`,
    `vitest_bin=${vitestBin}`,
    `vitest_args=${vitestArgs.join(" ")}`,
    `vitest_version=${vitestVersion} vite_version=${viteVersion} jsdom_version=${jsdomVersion} node=${process.version} platform=${process.platform}-${process.arch} tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `dependency_root=${dependencyRoot}`,
    `lockfile_gate_sha256=${LOCKFILE_GATE}`,
    `dependency_lockfile_sha256=${dependencyLockHash}`,
    `archive_lockfile_sha256=${archiveLockHash}`,
    `extracted_lockfile_sha256=${extractedLockHash}`,
    `oracle_sha256 ${Object.entries(oracleHashes).map(([name, hash]) => `${name}=${hash}`).join(" ")}`,
    `archive_file_sha256 (${contractMatches}/${productHashes.length} equal the contract r3 source table) ${productHashes.join(" ")}`,
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
