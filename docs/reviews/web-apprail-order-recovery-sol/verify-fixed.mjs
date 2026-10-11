/**
 * Sol immutable-archive runner: AppRail order recovery oracles (CP-APPRAIL-01, control-plane batch 56; contract
 * docs/reviews/web-apprail-order-recovery-contract/contract.md r1, sections 12 and 15 items E1, E2, E7).
 * Derived from ../web-appearance-recovery-sol/verify-fixed.mjs (same archive, lockfile gate, pin and guard design).
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals the revision's> \
 *     node docs/reviews/web-apprail-order-recovery-sol/verify-fixed.mjs <revision> <mode|all> <suffix>
 *
 * Modes (the eight contract section 12 Sol modes):
 *   bytes, domain, merge, drag, field, continuity-export, host   Sol oracles in this directory, run under the
 *                                                                 owning package's (xai-web-shell) test semantics
 *                                                                 (jsdom, no globals, its src/__tests__/setup.ts).
 *   original                                                      The archive's own tests, each group under its own
 *                                                                 package semantics, in one log: the shell's
 *                                                                 AppRail, internal/dnd, Topbar, Shell.smoke and
 *                                                                 index-barrel tests; apps/web App.appearance,
 *                                                                 App.signout, App.lazy-init, shell.smoke and
 *                                                                 railFeatureFilter.
 * Static mode (not a section 12 mode; executes no product or oracle code):
 *   typecheck   tsc --noEmit over the oracle files inside the archive, diagnostics reported for the oracle files.
 * `all` runs the eight section 12 modes in the order above (typecheck is never part of `all`).
 *
 * - Expands `git archive <revision>` into a fresh temporary directory (realpath) and gates on SHA-256 equality of
 *   XAI_DEPS_ROOT/pnpm-lock.yaml (default: this repository root), `git show <revision>:pnpm-lock.yaml` and the
 *   extracted lockfile; all three must also equal the contract's lockfile gate.
 * - Copies this directory's oracle files into docs/reviews/web-apprail-order-recovery-sol/ inside the archive and
 *   verifies their SHA-256 against the evidence files.
 * - Every archive workspace (packages/* and apps/*) gets a private node_modules directory: read-only links to the
 *   dependency checkout's third-party entries, and @repo links to the archive's own package folders for every
 *   declared workspace dependency (so Node and tsconfig `extends` resolution stay inside the archive). The oracle
 *   directory gets links to the single react, react-dom, @testing-library/react, @testing-library/user-event,
 *   react-router and vitest instances.
 * - Exact-match aliases map every archive packages/* export specifier to the archive file. A guard plugin fails
 *   the run if any module is loaded from the dependency checkout's packages/, apps/ or docs/ trees, fails any
 *   unaliased @repo import that resolves outside the archive, and records every archive module it transforms; a
 *   harness check requires each run's product modules to have been loaded from the archive.
 * - Writes <mode>-<suffix>-<revision>.log beside this file, refusing to overwrite (checked before archiving,
 *   again before writing, and with an exclusive create): requested and resolved revision and tree, lockfile
 *   hashes, oracle and runner hashes, archive file hashes, Vitest stdout and stderr, a per-case outcome list from
 *   Vitest's JSON reporter with PRECONDITION counts, harness checks and the module-pin record.
 * - Exit status: the first nonzero Vitest (or tsc) status; 2 if Vitest exited 0 but a harness check failed.
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
const root = fileURLToPath(new URL("../../../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const owned = "docs/reviews/web-apprail-order-recovery-sol";
const dependencyRoot = realpathSync(resolve(process.env.XAI_DEPS_ROOT ?? root));
const [revision, modeArgument, suffix, ...extra] = process.argv.slice(2);
if (!revision || !modeArgument || !suffix || extra.length) throw Error("Usage: node verify-fixed.mjs <revision> <mode|all> <suffix>");
if (!/^[A-Za-z0-9._-]+$/.test(revision)) throw Error(`Unsafe revision: ${revision}`);
if (!/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error(`Unsafe suffix: ${suffix}`);

const SHELL_DIR = "packages/xai-web-shell";
const ORACLE_FILES = [
  "fixture.tsx",
  "bytes.test.tsx",
  "domain.test.tsx",
  "merge.test.tsx",
  "drag.test.tsx",
  "field.test.tsx",
  "continuity-export.test.tsx",
  "host.test.tsx",
];
const STORAGE_PROVENANCE = [
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/storage.ts",
];
const RAIL_PROVENANCE = [
  `${SHELL_DIR}/src/AppRail.tsx`,
  `${SHELL_DIR}/src/registry.tsx`,
  `${SHELL_DIR}/src/internal/dnd.ts`,
  ...STORAGE_PROVENANCE,
];
const APP_PROVENANCE = [
  ...RAIL_PROVENANCE,
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/RouteGateElements.tsx",
  "apps/web/src/routes/RouteErrorBoundary.tsx",
  "apps/web/src/routes/modules/shellRegistrations.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/providers/AccountStorageGate.tsx",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  `${SHELL_DIR}/src/Shell.tsx`,
  `${SHELL_DIR}/src/Topbar.tsx`,
  "packages/xai-web-settings-features-panel/src/useFeaturePrefs.ts",
  "packages/xai-web-settings-features-panel/src/filterModulesByFeaturePrefs.ts",
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/xai-web-event-bus/src/emitter.ts",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/guards.tsx",
];
// Sol oracle modes run under the owning package's (xai-web-shell) test semantics (jsdom, no globals, its setup).
const SHELL_SEMANTICS = { globals: false, setupFiles: [`${SHELL_DIR}/src/__tests__/setup.ts`] };
const oracleRun = (file, provenance, timeout = 60000) => [{ label: file, include: [`${owned}/${file}`], timeout, ...SHELL_SEMANTICS, provenance }];
const MODES = {
  bytes: { runs: oracleRun("bytes.test.tsx", [...APP_PROVENANCE, "packages/plugin-web-storage/src/internal/dataExport.ts", "packages/plugin-web-storage/src/internal/lifecycleDeclaration.ts"]) },
  domain: { runs: oracleRun("domain.test.tsx", APP_PROVENANCE) },
  merge: { runs: oracleRun("merge.test.tsx", APP_PROVENANCE) },
  drag: { runs: oracleRun("drag.test.tsx", APP_PROVENANCE) },
  field: { runs: oracleRun("field.test.tsx", APP_PROVENANCE) },
  "continuity-export": { runs: oracleRun("continuity-export.test.tsx", APP_PROVENANCE) },
  host: { runs: oracleRun("host.test.tsx", APP_PROVENANCE) },
  original: {
    runs: [
      {
        label: "shell-tests",
        include: ["AppRail.test.tsx", "internal/dnd.test.ts", "Topbar.test.tsx", "Shell.smoke.test.tsx", "index-barrel.test.ts"].map(name => `${SHELL_DIR}/src/__tests__/${name}`),
        timeout: 30000,
        ...SHELL_SEMANTICS,
        provenance: [`${SHELL_DIR}/src/AppRail.tsx`, `${SHELL_DIR}/src/Topbar.tsx`, `${SHELL_DIR}/src/Shell.tsx`, `${SHELL_DIR}/src/internal/dnd.ts`, `${SHELL_DIR}/src/index.ts`],
      },
      {
        label: "web-host",
        include: [
          "apps/web/src/__tests__/App.appearance.test.tsx",
          "apps/web/src/__tests__/App.signout.test.tsx",
          "apps/web/src/__tests__/App.lazy-init.test.tsx",
          "apps/web/src/__tests__/shell.smoke.test.tsx",
          "apps/web/src/routes/modules/__tests__/railFeatureFilter.test.tsx",
        ],
        timeout: 60000,
        globals: false,
        setupFiles: [],
        provenance: ["apps/web/src/App.tsx", `${SHELL_DIR}/src/AppRail.tsx`, `${SHELL_DIR}/src/Topbar.tsx`, `${SHELL_DIR}/src/Shell.tsx`],
      },
    ],
  },
  typecheck: { static: true },
};
const SECTION_12_MODES = ["bytes", "domain", "merge", "drag", "field", "continuity-export", "host", "original"];
const selected = modeArgument === "all" ? SECTION_12_MODES : [modeArgument];
for (const mode of selected) if (!Object.hasOwn(MODES, mode)) throw Error(`Unsupported mode ${mode}; use one of ${Object.keys(MODES).join(", ")} or all`);
const logPath = mode => join(evidence, `${mode}-${suffix}-${revision}.log`);
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
assert.equal(archiveLockHash, LOCKFILE_GATE, "The requested revision's lockfile differs from the contract's lockfile gate");
const shellModules = join(dependencyRoot, SHELL_DIR, "node_modules");
const vitestBin = join(shellModules, ".bin/vitest");
const tscBin = join(shellModules, ".bin/tsc");
assert(existsSync(vitestBin), `Vitest binary missing at ${vitestBin}`);
assert(existsSync(tscBin), `tsc binary missing at ${tscBin}`);
const vitestHome = realpathSync(join(shellModules, "vitest"));
const versionOf = file => { try { return JSON.parse(readFileSync(file, "utf8")).version; } catch { return "unknown"; } };
const vitestVersion = versionOf(join(vitestHome, "package.json"));
const viteVersion = versionOf(join(vitestHome, "../vite/package.json"));
const jsdomVersion = versionOf(join(vitestHome, "../jsdom/package.json"));
const typescriptVersion = versionOf(join(realpathSync(join(shellModules, "typescript")), "package.json"));
const oracleHashes = Object.fromEntries([...ORACLE_FILES, "verify-fixed.mjs"].map(name => [name, sha256(readFileSync(join(evidence, name)))]));

const CONFIG_SOURCE = `import { appendFileSync } from "node:fs";

const settings = __SETTINGS__;
const record = line => appendFileSync(settings.pinLog, line + "\\n");
const inside = (file, folder) => file === folder || file.startsWith(folder + "/");
const guard = {
  name: "apprail-sol-archive-pin-guard",
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

const directory = realpathSync(mkdtempSync(join(tmpdir(), "xai-apprail-sol-")));
let firstFailure = 0;
try {
  execFileSync("tar", ["-x", "-C", directory], { input: execFileSync("git", ["archive", commit], { cwd: root, maxBuffer: 1024 * 1024 * 1024 }) });
  const extractedLockHash = sha256(readFileSync(join(directory, "pnpm-lock.yaml")));
  assert.equal(extractedLockHash, archiveLockHash, "Extracted lockfile differs from the committed lockfile");
  for (const mode of selected) for (const run of MODES[mode].runs ?? []) for (const file of run.include) {
    if (!file.startsWith(owned) && !file.includes("*")) assert(existsSync(join(directory, file)), `Requested test file missing from the archive: ${file}`);
  }

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

  // Oracle directory: the oracle files plus links to the single react, react-dom, Testing Library, router and
  // vitest instances.
  const oracleTarget = join(directory, owned);
  mkdirSync(oracleTarget, { recursive: true });
  for (const name of ORACLE_FILES) {
    copyFileSync(join(evidence, name), join(oracleTarget, name));
    assert.equal(sha256(readFileSync(join(oracleTarget, name))), oracleHashes[name], `Copied oracle ${name} differs from the evidence file`);
  }
  const oracleModules = join(oracleTarget, "node_modules");
  const oracleLinks = [
    ["react", join(shellModules, "react")],
    ["react-dom", join(shellModules, "react-dom")],
    ["@testing-library/react", join(shellModules, "@testing-library/react")],
    ["@testing-library/user-event", join(dependencyRoot, "packages/xai-web-cmdk/node_modules/@testing-library/user-event")],
    ["react-router", join(dependencyRoot, "apps/web/node_modules/react-router")],
    ["vitest", join(shellModules, "vitest")],
    ["@types/react", join(shellModules, "@types/react")],
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

  // Contract r1 header table (the unit's source and the protected files it cites), plus the engine it reuses.
  const productFiles = [
    `${SHELL_DIR}/src/AppRail.tsx`, `${SHELL_DIR}/src/internal/dnd.ts`, `${SHELL_DIR}/src/registry.tsx`, `${SHELL_DIR}/src/Topbar.tsx`,
    `${SHELL_DIR}/src/Shell.tsx`, `${SHELL_DIR}/src/types.ts`, `${SHELL_DIR}/src/index.ts`, `${SHELL_DIR}/src/__tests__/AppRail.test.tsx`,
    `${SHELL_DIR}/src/__tests__/Topbar.test.tsx`, "apps/web/src/App.tsx", "packages/plugin-web-storage/src/internal/registry.ts",
    "packages/plugin-web-tokens/src/layout.css", "apps/web/src/routes/modules/departureCoordinator.tsx",
    "packages/plugin-web-storage/src/internal/usePrefAsync.ts", "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts",
    "packages/plugin-web-storage/src/internal/prefMutation.ts", "packages/plugin-web-storage/src/internal/usePref.ts",
    "packages/plugin-web-storage/src/internal/storage.ts",
  ];
  const productHashes = productFiles.map(file => `${file}=${existsSync(join(directory, file)) ? sha256(readFileSync(join(directory, file))) : "missing"}`);
  const shellTree = git(["rev-parse", `${commit}:${SHELL_DIR}`]);
  const webTree = git(["rev-parse", `${commit}:apps/web`]);
  const strip = text => String(text ?? "").replace(/\u001b\[[0-9;]*m/g, "");

  const headerFor = (mode, extraLines, status, harness) => [
    `requested_revision=${revision}`,
    `resolved_commit=${commit}`,
    `resolved_tree=${tree}`,
    `shell_package_tree=${shellTree} web_app_tree=${webTree}`,
    `mode=${mode}`,
    `suffix=${suffix}`,
    `command=XAI_DEPS_ROOT=${dependencyRoot} node ${owned}/verify-fixed.mjs ${revision} ${modeArgument} ${suffix}`,
    `runner_checkout_head=${runnerHead}`,
    ...extraLines,
    `vitest_version=${vitestVersion} vite_version=${viteVersion} jsdom_version=${jsdomVersion} typescript_version=${typescriptVersion} node=${process.version} platform=${process.platform}-${process.arch} tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `dependency_root=${dependencyRoot}`,
    `lockfile_gate_sha256=${LOCKFILE_GATE}`,
    `dependency_lockfile_sha256=${dependencyLockHash}`,
    `archive_lockfile_sha256=${archiveLockHash}`,
    `extracted_lockfile_sha256=${extractedLockHash}`,
    `oracle_sha256 ${Object.entries(oracleHashes).map(([name, hash]) => `${name}=${hash}`).join(" ")}`,
    `archive_file_sha256 ${productHashes.join(" ")}`,
    `oracle_dependency_links ${oracleLinks.join(" ")}`,
    `node_modules_links third_party=${thirdPartyLinks} workspace=${workspaceLinks}`,
    `tsconfig_extends_unresolved=${unresolvedExtends.length ? unresolvedExtends.join(" ") : "none"} (checked ${extendsRecord.length})`,
    `aliases=${aliases.length} exact-match archive export specifiers`,
    ...status,
    `harness_checks=${harness}`,
  ].join("\n");

  for (const mode of selected) {
    const spec = MODES[mode];
    if (spec.static) {
      // Static typecheck of the oracle files inside the archive. Executes no product or oracle code.
      const tsconfigFile = join(directory, `${owned}/tsconfig.apprail-sol-typecheck.json`);
      const paths = Object.fromEntries(aliases.map(({ specifier, replacement }) => [specifier, [relative(oracleTarget, replacement)]]));
      writeFileSync(tsconfigFile, JSON.stringify({
        compilerOptions: {
          target: "ES2022", module: "ESNext", moduleResolution: "Bundler", jsx: "react-jsx", strict: true, noEmit: true, skipLibCheck: true,
          esModuleInterop: true, isolatedModules: true, lib: ["ES2023", "DOM", "DOM.Iterable"], types: [], baseUrl: ".", paths,
        },
        files: ORACLE_FILES,
      }, null, 2), { flag: "wx" });
      const result = spawnSync(tscBin, ["--noEmit", "-p", tsconfigFile, "--pretty", "false"], { cwd: oracleTarget, encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
      const output = strip(`${result.stdout ?? ""}${result.stderr ?? ""}`);
      const diagnostics = output.split("\n").filter(line => /error TS\d+/.test(line));
      const oracleDiagnostics = diagnostics.filter(line => ORACLE_FILES.some(name => line.startsWith(name) || line.startsWith(`./${name}`)));
      const productDiagnostics = diagnostics.length - oracleDiagnostics.length;
      const exitCode = oracleDiagnostics.length > 0 ? 1 : 0;
      const header = headerFor(mode, [`tsc_bin=${tscBin}`, `tsconfig=${relative(directory, tsconfigFile)}`], [`tsc_exit=${result.status ?? "signal"}`, `oracle_diagnostics=${oracleDiagnostics.length} product_or_dependency_diagnostics_ignored=${productDiagnostics}`, `exit=${exitCode}`], oracleDiagnostics.length ? "FAIL" : "PASS");
      if (existsSync(logPath(mode))) throw Error(`Evidence appeared during the run; refusing to overwrite ${logPath(mode)}`);
      writeFileSync(logPath(mode), `${header}\n---- oracle diagnostics ----\n${oracleDiagnostics.join("\n")}\n---- all tsc output ----\n${output}`.trimEnd() + "\n", { flag: "wx" });
      console.log(`${mode} ${revision} (${commit.slice(0, 12)}): tsc_exit=${result.status} oracle_diagnostics=${oracleDiagnostics.length} exit=${exitCode} log=${relative(root, logPath(mode))}`);
      if (exitCode !== 0 && firstFailure === 0) firstFailure = exitCode;
      continue;
    }

    const sections = [];
    const allCases = [];
    const allChecks = [];
    const statusLines = [];
    let modeExit = 0;
    for (const [runIndex, run] of spec.runs.entries()) {
      const pinLog = join(directory, `.pin-${mode}-${runIndex}.log`);
      const jsonReport = join(directory, `.report-${mode}-${runIndex}.json`);
      const settings = {
        archive: directory,
        root: directory,
        cacheDir: join(directory, `.apprail-sol-vite-cache-${runIndex}`),
        forbidden: [join(dependencyRoot, "packages"), join(dependencyRoot, "apps"), join(dependencyRoot, "docs")],
        pinLog,
        include: run.include,
        globals: run.globals,
        setupFiles: run.setupFiles.map(file => join(directory, file)),
        timeout: run.timeout,
        aliases: aliases.map(({ pattern, replacement }) => ({ pattern, replacement })),
      };
      const configFile = join(directory, `apprail-sol-${mode}-${runIndex}.vitest.config.mjs`);
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
      const cases = [];
      for (const suite of report?.testResults ?? []) {
        for (const test of suite.assertionResults ?? []) {
          const message = strip((test.failureMessages ?? [])[0] ?? "");
          const first = message.split("\n").find(line => line.trim().length > 0) ?? "";
          cases.push({ run: run.label, file: relative(directory, suite.name), name: test.fullName ?? test.title, status: test.status, first: first.trim().slice(0, 400), precondition: message.includes("PRECONDITION:") });
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
      const missingProvenance = run.provenance.filter(file => !modules.includes(file));
      let resolvedConfig = null;
      try { resolvedConfig = configLines.length ? JSON.parse(configLines[0].slice("config ".length)) : null; } catch { resolvedConfig = null; }
      const reportedFiles = [...new Set(cases.map(entry => entry.file))].sort();

      // Harness validity checks (not test outcomes).
      const checks = [];
      const check = (label, ok) => checks.push(`${ok ? "PASS" : "FAIL"} [${run.label}] ${label}`);
      check("JSON report parsed", Boolean(report));
      check(run.include.some(file => file.includes("*")) ? `reported files match the requested pattern (${reportedFiles.length} files)` : "reported files equal the requested include",
        run.include.some(file => file.includes("*")) ? reportedFiles.length > 0 && reportedFiles.every(file => file.startsWith(run.include[0].split("*")[0])) : JSON.stringify(reportedFiles) === JSON.stringify([...run.include].sort()));
      check(`config in effect (environment jsdom, globals ${run.globals}, setupFiles [${run.setupFiles.join(",")}], root = archive)`,
        resolvedConfig?.environment === "jsdom" && resolvedConfig?.globals === run.globals && Array.isArray(resolvedConfig?.setupFiles)
          && resolvedConfig.setupFiles.length === run.setupFiles.length
          && run.setupFiles.every((file, index) => String(resolvedConfig.setupFiles[index]).endsWith(file)) && resolvedConfig?.root === directory);
      check("guard plugin active (archive modules recorded)", modules.length > 0);
      check(`required product modules loaded from the archive (${run.provenance.length})`, missingProvenance.length === 0);
      check("no test-file suite error", suiteErrors.length === 0);
      const runHarnessFailed = checks.some(line => line.startsWith("FAIL"));
      const runExit = vitestStatus !== 0 ? vitestStatus : runHarnessFailed ? 2 : 0;
      if (runExit !== 0 && modeExit === 0) modeExit = runExit;
      allCases.push(...cases);
      allChecks.push(...checks);
      statusLines.push(`run[${runIndex}] ${run.label}: include=${run.include.join(",")} vitest_args=${vitestArgs.join(" ")} vitest_exit=${vitestStatus}${result.signal ? ` signal=${result.signal}` : ""}${result.error ? ` spawn_error=${result.error.message}` : ""} cases=${cases.length} passed=${count("passed")} failed=${count("failed")} precondition_failures=${preconditionFailures} suite_errors=${suiteErrors.length} unhandled_error_lines=${unhandled} json_report=${report ? `success=${report.success} numTotalTests=${report.numTotalTests} numPassedTests=${report.numPassedTests} numFailedTests=${report.numFailedTests}` : `missing (${reportError})`}`);
      sections.push([
        `==== run[${runIndex}] ${run.label} ====`,
        "---- stdout ----",
        result.stdout ?? "",
        "---- stderr ----",
        result.stderr ?? "",
        "---- run pin record ----",
        `pin_config ${configLines.length ? configLines.map(line => line.slice("config ".length)).join(" | ") : "missing"}`,
        `pin_unaliased_repo_imports=${unaliased.length}${unaliased.length ? ` ${unaliased.join(" | ")}` : ""}`,
        `pin_required_provenance_missing=${missingProvenance.length ? missingProvenance.join(",") : "none"}`,
        `pin_required_provenance ${run.provenance.join(" ")}`,
        `pin_modules=${modules.length} by package: ${[...modulesByPackage].map(([key, value]) => `${key}=${value}`).join(" ")}`,
        ...suiteErrors.map(line => `suite_error ${line}`),
      ].join("\n"));
    }

    const harnessFailed = allChecks.some(line => line.startsWith("FAIL"));
    const passed = allCases.filter(entry => entry.status === "passed").length;
    const failed = allCases.filter(entry => entry.status === "failed").length;
    const preconditions = allCases.filter(entry => entry.status === "failed" && entry.precondition).length;
    const header = headerFor(mode, [`vitest_bin=${vitestBin}`], [...statusLines, `exit=${modeExit}`], `${harnessFailed ? "FAIL" : "PASS"} (${allChecks.filter(line => line.startsWith("PASS")).length}/${allChecks.length})`);
    const summary = [
      `totals cases=${allCases.length} passed=${passed} failed=${failed} skipped=${allCases.length - passed - failed} precondition_failures=${preconditions}`,
      ...allChecks.map(line => `harness ${line}`),
      ...allCases.map((entry, index) => `case ${String(index + 1).padStart(3, "0")} ${entry.status.toUpperCase()}${entry.precondition ? " PRECONDITION" : ""} | ${spec.runs.length > 1 ? `[${entry.run}] ` : ""}${entry.name}${entry.status === "failed" ? `\n    first: ${entry.first}` : ""}`),
    ].join("\n");
    if (existsSync(logPath(mode))) throw Error(`Evidence appeared during the run; refusing to overwrite ${logPath(mode)}`);
    writeFileSync(logPath(mode), `${header}\n${sections.join("\n")}\n---- runner summary ----\n${summary}`.trimEnd() + "\n", { flag: "wx" });
    console.log(`${mode} ${revision} (${commit.slice(0, 12)}): harness=${harnessFailed ? "FAIL" : "PASS"} exit=${modeExit} cases=${allCases.length} passed=${passed} failed=${failed} precondition=${preconditions} log=${relative(root, logPath(mode))}`);
    if (modeExit !== 0 && firstFailure === 0) firstFailure = modeExit;
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
if (firstFailure !== 0) process.exitCode = firstFailure;
