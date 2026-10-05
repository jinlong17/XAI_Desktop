/**
 * DIAGNOSTIC COPY (CP-APPEARANCE-01 batch 51, finding F-FD1; not gate evidence) of
 * ../web-features-recovery-sol/verify-fixed.mjs (SHA-256 b5ac75fa…, frozen, not modified). Only changes:
 *   1. the frozen oracle files are read from ../web-features-recovery-sol/ (their own directory, read only);
 *   2. after staging them in the archive, docs/reviews/web-features-recovery-sol/downstream.test.tsx is replaced by
 *      ./diagnostics/features-downstream.corrected.test.tsx (two token edits: the out-of-domain background seed
 *      "sage" becomes the in-domain "mist"; ./diagnostics/features-downstream.corrected.diff), hash-checked;
 *   3. only mode `downstream` is accepted, and logs go to ./diagnostics/features-sol-downstream-corrected-<suffix>-<rev>.log
 *      with this copy's own hash in the header.
 * Everything else (archive, lockfile gate, private node_modules, @repo pin and guard, Vitest semantics) is unchanged.
 *
 * Sol immutable-archive runner: Settings Features recovery oracles (CP-FEATURES-01, control-plane batch 22;
 * contract docs/reviews/web-features-recovery-contract/contract.md sections 12 and 14 items E1, E2, E7).
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals the revision's> \
 *     node docs/reviews/web-features-recovery-sol/verify-fixed.mjs <revision> <mode|all> <suffix>
 *
 * Modes: bytes, fields, reset, queues, continuity-export, downstream (Sol oracles in this directory) and
 * original (the archive's own packages/xai-web-settings-features-panel/src/__tests__/FeaturesPane.test.tsx,
 * AC-PANE-1–6) are the seven contract section 12 modes. readers-features and readers-web run the unchanged
 * section 10 item 10 reader tests from the archive as the section 12 positive control (features package semantics
 * and apps/web semantics respectively). `all` runs every mode in that order.
 *
 * - Expands `git archive <revision>` into a fresh temporary directory (realpath) and gates on SHA-256 equality of
 *   XAI_DEPS_ROOT/pnpm-lock.yaml (default: this repository root), `git show <revision>:pnpm-lock.yaml` and the
 *   extracted lockfile.
 * - Copies this directory's oracle files into docs/reviews/web-features-recovery-sol/ inside the archive and
 *   verifies their SHA-256 against the evidence files.
 * - Every archive workspace (packages/* and apps/*) gets a private node_modules directory: read-only links to the
 *   dependency checkout's third-party entries, and @repo links to the archive's own package folders for every
 *   declared workspace dependency (so Node and tsconfig `extends` resolution stay inside the archive). The oracle
 *   directory gets links to the single react, react-dom, @testing-library/react and react-router instances.
 * - Exact-match aliases map every archive packages/* export specifier to the archive file. A guard plugin fails
 *   the run if any module is loaded from the dependency checkout's packages/, apps/ or docs/ trees, fails any
 *   unaliased @repo import that resolves outside the archive, and records every archive module it transforms.
 * - Writes <mode>-<suffix>-<revision>.log beside this file, refusing to overwrite (checked before archiving,
 *   again before writing, and with an exclusive create): requested and resolved revision and tree, lockfile
 *   hashes, oracle and runner hashes, archive file hashes, Vitest stdout and stderr, a per-case outcome list from
 *   Vitest's JSON reporter with PRECONDITION counts, harness checks and the module-pin record.
 * - Exit status: the first nonzero Vitest status; 2 if Vitest exited 0 but a harness check failed.
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

const root = fileURLToPath(new URL("../../../", import.meta.url));
const evidence = fileURLToPath(new URL("../web-features-recovery-sol/", import.meta.url)); // diagnostic change 1
const runnerFile = fileURLToPath(import.meta.url);
const diagnostics = fileURLToPath(new URL("./diagnostics/", import.meta.url)); // diagnostic changes 2 and 3
const CORRECTED = join(diagnostics, "features-downstream.corrected.test.tsx");
const CORRECTED_SHA256 = "7bb5ad3cda8fec7957e999c2aa62956212b52934be20b942df72e286e90959e1";
const owned = "docs/reviews/web-features-recovery-sol";
const dependencyRoot = realpathSync(resolve(process.env.XAI_DEPS_ROOT ?? root));
const [revision, modeArgument, suffix, ...extra] = process.argv.slice(2);
if (!revision || !modeArgument || !suffix || extra.length) throw Error("Usage: node verify-fixed.mjs <revision> <mode|all> <suffix>");
if (!/^[A-Za-z0-9._-]+$/.test(revision)) throw Error(`Unsafe revision: ${revision}`);
if (!/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error(`Unsafe suffix: ${suffix}`);

const FEATURES_DIR = "packages/xai-web-settings-features-panel";
const ORACLE_FILES = ["fixture.tsx", "bytes.test.tsx", "fields.test.tsx", "reset.test.tsx", "queues.test.tsx", "continuity-export.test.tsx", "downstream.test.tsx"];
const PANE_PROVENANCE = [
  `${FEATURES_DIR}/src/FeaturesPane.tsx`,
  `${FEATURES_DIR}/src/internal/featuresPane.tsx`,
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
];
const APP_PROVENANCE = [
  ...PANE_PROVENANCE,
  `${FEATURES_DIR}/src/useFeaturePrefs.ts`,
  `${FEATURES_DIR}/src/withDisabledFallback.tsx`,
  `${FEATURES_DIR}/src/filterModulesByFeaturePrefs.ts`,
  `${FEATURES_DIR}/src/DisabledFeatureFallback.tsx`,
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/xai-web-event-bus/src/emitter.ts",
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/RouteGateElements.tsx",
  "apps/web/src/routes/modules/shellRegistrations.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/providers/AccountStorageGate.tsx",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/guards.tsx",
];
// Every mode runs under the Features package's own test semantics (jsdom, globals, its vitest.setup.ts) except
// readers-web, which runs apps/web's unchanged tests under apps/web's own semantics (jsdom, no globals, no setup).
const FEATURES_SEMANTICS = { globals: true, setupFiles: [`${FEATURES_DIR}/vitest.setup.ts`] };
const MODES = {
  bytes: { include: [`${owned}/bytes.test.tsx`], timeout: 30000, ...FEATURES_SEMANTICS, provenance: PANE_PROVENANCE },
  fields: { include: [`${owned}/fields.test.tsx`], timeout: 30000, ...FEATURES_SEMANTICS, provenance: PANE_PROVENANCE },
  reset: { include: [`${owned}/reset.test.tsx`], timeout: 30000, ...FEATURES_SEMANTICS, provenance: [...PANE_PROVENANCE, `${FEATURES_DIR}/src/useFeaturePrefs.ts`] },
  queues: { include: [`${owned}/queues.test.tsx`], timeout: 30000, ...FEATURES_SEMANTICS, provenance: PANE_PROVENANCE },
  "continuity-export": { include: [`${owned}/continuity-export.test.tsx`], timeout: 30000, ...FEATURES_SEMANTICS, provenance: PANE_PROVENANCE },
  downstream: { include: [`${owned}/downstream.test.tsx`], timeout: 60000, ...FEATURES_SEMANTICS, provenance: APP_PROVENANCE },
  original: { include: [`${FEATURES_DIR}/src/__tests__/FeaturesPane.test.tsx`], timeout: 30000, ...FEATURES_SEMANTICS, provenance: [`${FEATURES_DIR}/src/FeaturesPane.tsx`, "packages/plugin-web-storage/src/internal/usePref.ts"] },
  // Contract section 10 item 10 / section 12 positive control: the unchanged reader tests, run from the archive.
  "readers-features": {
    include: ["useFeaturePrefs.test.tsx", "withDisabledFallback.test.tsx", "filterModulesByFeaturePrefs.test.ts", "DisabledFeatureFallback.test.tsx", "featuresPaneEntry.test.tsx"].map(name => `${FEATURES_DIR}/src/__tests__/${name}`),
    timeout: 30000,
    ...FEATURES_SEMANTICS,
    provenance: [`${FEATURES_DIR}/src/useFeaturePrefs.ts`, `${FEATURES_DIR}/src/withDisabledFallback.tsx`, `${FEATURES_DIR}/src/filterModulesByFeaturePrefs.ts`, `${FEATURES_DIR}/src/DisabledFeatureFallback.tsx`, `${FEATURES_DIR}/src/internal/featuresPane.tsx`],
  },
  "readers-web": {
    include: [
      "apps/web/src/routes/modules/__tests__/railFeatureFilter.test.tsx",
      "apps/web/src/routes/modules/__tests__/settingsPaneComposition.test.tsx",
      "apps/web/src/__tests__/settingsPaneComposition.appearance.test.ts",
      "apps/web/src/__tests__/settingsPaneComposition.rest.test.ts",
      "apps/web/src/__tests__/cmdkIntegration.test.tsx",
    ],
    timeout: 60000,
    globals: false,
    setupFiles: [],
    provenance: ["apps/web/src/routes/modules/shellRegistrations.tsx", "apps/web/src/routes/modules/settingsPaneComposition.ts", "apps/web/src/App.tsx", `${FEATURES_DIR}/src/useFeaturePrefs.ts`, `${FEATURES_DIR}/src/filterModulesByFeaturePrefs.ts`],
  },
};
const selected = modeArgument === "all" ? Object.keys(MODES) : [modeArgument];
for (const mode of selected) if (!Object.hasOwn(MODES, mode)) throw Error(`Unsupported mode ${mode}; use one of ${Object.keys(MODES).join(", ")} or all`);
if (JSON.stringify(selected) !== JSON.stringify(["downstream"])) throw Error("Diagnostic copy: only mode downstream is supported"); // diagnostic change 3
const logPath = mode => join(diagnostics, `features-sol-${mode}-corrected-${suffix}-${revision}.log`);
for (const mode of selected) if (existsSync(logPath(mode))) throw Error(`Evidence exists; use a new suffix: ${logPath(mode)}`);

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

const CONFIG_SOURCE = `import { appendFileSync } from "node:fs";

const settings = __SETTINGS__;
const record = line => appendFileSync(settings.pinLog, line + "\\n");
const inside = (file, folder) => file === folder || file.startsWith(folder + "/");
const guard = {
  name: "features-sol-archive-pin-guard",
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
    for (const folder of settings.forbidden) if (inside(file, folder)) throw new Error("Pin violation: module loaded from the dependency checkout: " + file);
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

const directory = realpathSync(mkdtempSync(join(tmpdir(), "xai-features-sol-")));
let firstFailure = 0;
try {
  execFileSync("tar", ["-x", "-C", directory], { input: execFileSync("git", ["archive", commit], { cwd: root, maxBuffer: 1024 * 1024 * 1024 }) });
  const extractedLockHash = sha256(readFileSync(join(directory, "pnpm-lock.yaml")));
  assert.equal(extractedLockHash, archiveLockHash, "Extracted lockfile differs from the committed lockfile");
  for (const mode of selected) for (const file of MODES[mode].include) if (!file.startsWith(owned)) assert(existsSync(join(directory, file)), `Requested test file missing from the archive: ${file}`);

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

  // Oracle directory: the oracle files plus links to the single react, react-dom, Testing Library and router instances.
  const oracleTarget = join(directory, owned);
  mkdirSync(oracleTarget, { recursive: true });
  for (const name of ORACLE_FILES) {
    copyFileSync(join(evidence, name), join(oracleTarget, name));
    assert.equal(sha256(readFileSync(join(oracleTarget, name))), oracleHashes[name], `Copied oracle ${name} differs from the evidence file`);
  }
  // Diagnostic change 2: the corrected downstream oracle replaces the frozen one at the same staged path.
  assert.equal(sha256(readFileSync(CORRECTED)), CORRECTED_SHA256, "Corrected oracle differs from its recorded hash");
  copyFileSync(CORRECTED, join(oracleTarget, "downstream.test.tsx"));
  assert.equal(sha256(readFileSync(join(oracleTarget, "downstream.test.tsx"))), CORRECTED_SHA256, "Staged corrected oracle differs from its recorded hash");
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
    `${FEATURES_DIR}/src/FeaturesPane.tsx`, `${FEATURES_DIR}/src/internal/featuresPane.tsx`, `${FEATURES_DIR}/src/types.ts`, `${FEATURES_DIR}/src/styles.css`,
    `${FEATURES_DIR}/src/index.ts`, `${FEATURES_DIR}/src/__tests__/FeaturesPane.test.tsx`, `${FEATURES_DIR}/vitest.setup.ts`, `${FEATURES_DIR}/vitest.config.ts`,
    "apps/web/src/App.tsx", "packages/plugin-web-storage/src/AccountDataGate.tsx", "packages/plugin-web-storage/src/internal/prefMutation.ts",
    "packages/plugin-web-storage/src/internal/usePrefAsync.ts", "packages/plugin-web-storage/src/internal/usePref.ts",
  ];
  const productHashes = productFiles.map(file => `${file}=${existsSync(join(directory, file)) ? sha256(readFileSync(join(directory, file))) : "missing"}`);
  const featuresTree = git(["rev-parse", `${commit}:${FEATURES_DIR}`]);

  for (const mode of selected) {
    const spec = MODES[mode];
    const pinLog = join(directory, `.pin-${mode}.log`);
    const jsonReport = join(directory, `.report-${mode}.json`);
    const settings = {
      archive: directory,
      root: directory,
      cacheDir: join(directory, ".features-sol-vite-cache"),
      forbidden: [join(dependencyRoot, "packages"), join(dependencyRoot, "apps"), join(dependencyRoot, "docs")],
      pinLog,
      include: spec.include,
      globals: spec.globals,
      setupFiles: spec.setupFiles.map(file => join(directory, file)),
      timeout: spec.timeout,
      aliases: aliases.map(({ pattern, replacement }) => ({ pattern, replacement })),
    };
    const configFile = join(directory, `features-sol-${mode}.vitest.config.mjs`);
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
    const unhandled = strip(result.stdout).split("\n").filter(line => /Unhandled (Error|Rejection)/.test(line)).length;

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
    check(`config in effect (environment jsdom, globals ${spec.globals}, setupFiles [${spec.setupFiles.join(",")}], root = archive)`,
      resolvedConfig?.environment === "jsdom" && resolvedConfig?.globals === spec.globals && Array.isArray(resolvedConfig?.setupFiles)
        && resolvedConfig.setupFiles.length === spec.setupFiles.length
        && spec.setupFiles.every((file, index) => String(resolvedConfig.setupFiles[index]).endsWith(file)) && resolvedConfig?.root === directory);
    check("guard plugin active (archive modules recorded)", modules.length > 0);
    check(`required product modules loaded from the archive (${spec.provenance.length})`, missingProvenance.length === 0);
    check("no test-file suite error", suiteErrors.length === 0);
    const harnessFailed = checks.some(line => line.startsWith("FAIL"));
    const exitCode = vitestStatus !== 0 ? vitestStatus : harnessFailed ? 2 : 0;

    const header = [
      `requested_revision=${revision}`,
      `resolved_commit=${commit}`,
      `resolved_tree=${tree}`,
      `features_package_tree=${featuresTree}`,
      `mode=${mode}`,
      `suffix=${suffix}`,
      `include=${spec.include.join(",")}`,
      `command=XAI_DEPS_ROOT=${dependencyRoot} node docs/reviews/web-appearance-recovery-final/diag-features-sol-corrected.mjs ${revision} ${modeArgument} ${suffix}`,
      `diagnostic_runner_sha256=${sha256(readFileSync(runnerFile))} corrected_oracle_staged_as=${owned}/downstream.test.tsx corrected_oracle_sha256=${CORRECTED_SHA256} (oracle_sha256 below lists the frozen files read; downstream.test.tsx there is the frozen hash, replaced in the run)`,
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
      `vitest_exit=${vitestStatus}${result.signal ? ` signal=${result.signal}` : ""}${result.error ? ` spawn_error=${result.error.message}` : ""}`,
      `harness_checks=${harnessFailed ? "FAIL" : "PASS"} (${checks.filter(line => line.startsWith("PASS")).length}/${checks.length})`,
      `exit=${exitCode}`,
    ].join("\n");
    const summary = [
      `json_report=${report ? `success=${report.success} numTotalTests=${report.numTotalTests} numPassedTests=${report.numPassedTests} numFailedTests=${report.numFailedTests} numPendingTests=${report.numPendingTests} numTodoTests=${report.numTodoTests}` : `missing (${reportError})`}`,
      `totals cases=${cases.length} passed=${count("passed")} failed=${count("failed")} skipped=${cases.length - count("passed") - count("failed")} precondition_failures=${preconditionFailures} suite_errors=${suiteErrors.length} unhandled_error_lines=${unhandled}`,
      ...suiteErrors.map(line => `suite_error ${line}`),
      ...checks.map(line => `harness ${line}`),
      ...cases.map((entry, index) => `case ${String(index + 1).padStart(3, "0")} ${entry.status.toUpperCase()}${entry.precondition ? " PRECONDITION" : ""} | ${entry.name}${entry.status === "failed" ? `\n    first: ${entry.first}` : ""}`),
      `pin_config ${configLines.length ? configLines.map(line => line.slice("config ".length)).join(" | ") : "missing"}`,
      `pin_unaliased_repo_imports=${unaliased.length}${unaliased.length ? ` ${unaliased.join(" | ")}` : ""}`,
      `pin_required_provenance_missing=${missingProvenance.length ? missingProvenance.join(",") : "none"}`,
      `pin_required_provenance ${spec.provenance.join(" ")}`,
      `pin_modules=${modules.length} by package: ${[...modulesByPackage].map(([key, value]) => `${key}=${value}`).join(" ")}`,
    ].join("\n");
    if (existsSync(logPath(mode))) throw Error(`Evidence appeared during the run; refusing to overwrite ${logPath(mode)}`);
    writeFileSync(logPath(mode), `${header}\n---- stdout ----\n${result.stdout ?? ""}\n---- stderr ----\n${result.stderr ?? ""}\n---- runner summary ----\n${summary}`.trimEnd() + "\n", { flag: "wx" });
    console.log(`${mode} ${revision} (${commit.slice(0, 12)}): vitest_exit=${vitestStatus} harness=${harnessFailed ? "FAIL" : "PASS"} exit=${exitCode} cases=${cases.length} passed=${count("passed")} failed=${count("failed")} precondition=${preconditionFailures} log=${relative(root, logPath(mode))}`);
    if (exitCode !== 0 && firstFailure === 0) firstFailure = exitCode;
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
if (firstFailure !== 0) process.exitCode = firstFailure;
