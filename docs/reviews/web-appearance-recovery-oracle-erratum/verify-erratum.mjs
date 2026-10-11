/**
 * Oracle-erratum runner: Settings Appearance `continuity-export` disputes OE-1 (case 006) and OE-2 (case 007)
 * (CP-APPEARANCE-01, control-plane batch 41; contract docs/reviews/web-appearance-recovery-contract/contract.md r3,
 * section 12 "Runner requirements" and "Freezing and reruns").
 *
 * Derived from the frozen Sol runner `../web-appearance-recovery-sol/verify-fixed.mjs` (SHA-256 a451df6a…), whose
 * conventions it keeps unchanged: immutable `git archive`, lockfile gate, private node_modules with @repo links into
 * the archive, exact-match aliases plus the pin guard plugin, required product provenance, refusal to overwrite and
 * preserved nonzero exit codes. It differs only in what it stages, where it writes its logs, one run per invocation,
 * and two added harness checks (the staged fixture is the frozen fixture; the corrected file is the frozen file plus
 * the committed diff).
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals the revision's> \
 *     node docs/reviews/web-appearance-recovery-oracle-erratum/verify-erratum.mjs <revision> <corrected|frozen|replay> <suffix>
 *
 * Modes:
 *   corrected   continuity-export.corrected.test.tsx (this directory) plus a byte-identical staged copy of the frozen
 *               ../web-appearance-recovery-sol/fixture.tsx, both placed in
 *               docs/reviews/web-appearance-recovery-oracle-erratum/ inside the archive. A harness check also proves
 *               that the corrected file equals the frozen file with continuity-export.corrected.diff applied (patch(1),
 *               run on copies inside the temporary archive).
 *   frozen      the frozen ../web-appearance-recovery-sol/continuity-export.test.tsx and fixture.tsx, unchanged, placed at
 *               their original path docs/reviews/web-appearance-recovery-sol/ inside the archive.
 *   replay      the diagnostic oe-replay.test.tsx (this directory; not an oracle, gates nothing) plus the same staged
 *               fixture copy as `corrected`.
 * All run under the Appearance package's own test semantics (jsdom, globals, its vitest.setup.ts), exactly like the
 * frozen runner's `continuity-export` mode.
 *
 * - The frozen inputs are read only and must match their frozen SHA-256 (pinned below) before anything is archived;
 *   every staged copy is re-hashed inside the archive.
 * - Writes <mode>-<suffix>-<revision>.log beside this file, refusing to overwrite (checked before archiving, again
 *   before writing, and with an exclusive create). Nothing is written into the frozen directory or the dependency
 *   checkout; Vite caches and the bundled-config temp files stay inside the temporary archive, which is deleted.
 * - Exit status: the first nonzero Vitest status; 2 if Vitest exited 0 but a harness check failed.
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
const owned = "docs/reviews/web-appearance-recovery-oracle-erratum";
const FROZEN_DIR = "docs/reviews/web-appearance-recovery-sol";
/** Frozen inputs (commit bd09456), read only. */
const FROZEN_SHA256 = {
  "fixture.tsx": "acd26ad860c90e1a688232db2f8da4b2d016b7a537d53afb3fea528f584666e3",
  "continuity-export.test.tsx": "776da524f7479e03d067c2426345df1fb30e518581c7bbfd33a0f1d0838e79ce",
  "verify-fixed.mjs": "a451df6aa05fcae5b6fb77266d6ef8d990b4e97b91755c0723f442239fbf5c1e",
};
const CORRECTED = "continuity-export.corrected.test.tsx";
const DIFF = "continuity-export.corrected.diff";
const REPLAY = "oe-replay.test.tsx";
const dependencyRoot = realpathSync(resolve(process.env.XAI_DEPS_ROOT ?? root));
const [revision, modeArgument, suffix, ...extra] = process.argv.slice(2);
if (!revision || !modeArgument || !suffix || extra.length) throw Error("Usage: node verify-erratum.mjs <revision> <corrected|frozen|replay> <suffix>");
if (!/^[A-Za-z0-9._-]+$/.test(revision)) throw Error(`Unsafe revision: ${revision}`);
if (!/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error(`Unsafe suffix: ${suffix}`);

const APPEARANCE_DIR = "packages/xai-web-settings-appearance";
const SHELL_DIR = "packages/xai-web-shell";
const STORAGE_PROVENANCE = [
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/storage.ts",
];
const APP_PROVENANCE = [
  `${APPEARANCE_DIR}/src/AppearancePane.tsx`,
  `${APPEARANCE_DIR}/src/internal/appearancePane.tsx`,
  ...STORAGE_PROVENANCE,
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/RouteGateElements.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/providers/AccountStorageGate.tsx",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  `${SHELL_DIR}/src/Shell.tsx`,
  `${SHELL_DIR}/src/Topbar.tsx`,
  `${SHELL_DIR}/src/AppRail.tsx`,
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/xai-web-event-bus/src/emitter.ts",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/guards.tsx",
];
// The same semantics as the frozen runner's Sol modes.
const APPEARANCE_SEMANTICS = { globals: true, setupFiles: [`${APPEARANCE_DIR}/vitest.setup.ts`] };
/** Each mode: the archive directory that receives the staged files, and [source, archive name, required hash]. */
const MODES = {
  corrected: {
    target: owned,
    stage: [
      { source: `${FROZEN_DIR}/fixture.tsx`, name: "fixture.tsx", sha256: FROZEN_SHA256["fixture.tsx"] },
      { source: `${owned}/${CORRECTED}`, name: CORRECTED, sha256: null },
    ],
    include: [`${owned}/${CORRECTED}`],
  },
  frozen: {
    target: FROZEN_DIR,
    stage: [
      { source: `${FROZEN_DIR}/fixture.tsx`, name: "fixture.tsx", sha256: FROZEN_SHA256["fixture.tsx"] },
      { source: `${FROZEN_DIR}/continuity-export.test.tsx`, name: "continuity-export.test.tsx", sha256: FROZEN_SHA256["continuity-export.test.tsx"] },
    ],
    include: [`${FROZEN_DIR}/continuity-export.test.tsx`],
  },
  replay: {
    target: owned,
    stage: [
      { source: `${FROZEN_DIR}/fixture.tsx`, name: "fixture.tsx", sha256: FROZEN_SHA256["fixture.tsx"] },
      { source: `${owned}/${REPLAY}`, name: REPLAY, sha256: null },
    ],
    include: [`${owned}/${REPLAY}`],
  },
};
if (!Object.hasOwn(MODES, modeArgument)) throw Error(`Unsupported mode ${modeArgument}; use corrected, frozen or replay`);
const mode = modeArgument;
const spec = MODES[mode];
const run = { label: spec.include[0].split("/").pop(), include: spec.include, timeout: 60000, ...APPEARANCE_SEMANTICS, provenance: APP_PROVENANCE };
const logPath = join(evidence, `${mode}-${suffix}-${revision}.log`);
if (existsSync(logPath)) throw Error(`Evidence exists; use a new suffix: ${logPath}`);

const sha256 = data => createHash("sha256").update(data).digest("hex");
const fileHash = rel => sha256(readFileSync(join(root, rel)));
// Frozen inputs are read only and must still be the frozen bytes.
for (const [name, expected] of Object.entries(FROZEN_SHA256)) assert.equal(fileHash(`${FROZEN_DIR}/${name}`), expected, `Frozen ${FROZEN_DIR}/${name} differs from its frozen SHA-256`);
const stageHashes = spec.stage.map(entry => ({ ...entry, actual: fileHash(entry.source) }));
for (const entry of stageHashes) if (entry.sha256) assert.equal(entry.actual, entry.sha256, `Staged source ${entry.source} differs from its pinned SHA-256`);
const runnerHash = fileHash(`${owned}/verify-erratum.mjs`);
const hashIfPresent = name => (existsSync(join(root, owned, name)) ? fileHash(`${owned}/${name}`) : "missing");
const correctedHash = hashIfPresent(CORRECTED);
const diffHash = hashIfPresent(DIFF);
const replayHash = hashIfPresent(REPLAY);

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
const appearanceModules = join(dependencyRoot, APPEARANCE_DIR, "node_modules");
const vitestBin = join(appearanceModules, ".bin/vitest");
assert(existsSync(vitestBin), `Vitest binary missing at ${vitestBin}`);
const vitestHome = realpathSync(join(appearanceModules, "vitest"));
const versionOf = file => { try { return JSON.parse(readFileSync(file, "utf8")).version; } catch { return "unknown"; } };
const vitestVersion = versionOf(join(vitestHome, "package.json"));
const viteVersion = versionOf(join(vitestHome, "../vite/package.json"));
const jsdomVersion = versionOf(join(vitestHome, "../jsdom/package.json"));

// Verbatim from the frozen runner (only the guard's name differs).
const CONFIG_SOURCE = `import { appendFileSync } from "node:fs";

const settings = __SETTINGS__;
const record = line => appendFileSync(settings.pinLog, line + "\\n");
const inside = (file, folder) => file === folder || file.startsWith(folder + "/");
const guard = {
  name: "appearance-oracle-erratum-archive-pin-guard",
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

const directory = realpathSync(mkdtempSync(join(tmpdir(), "xai-appearance-erratum-")));
let exitCode = 0;
try {
  execFileSync("tar", ["-x", "-C", directory], { input: execFileSync("git", ["archive", commit], { cwd: root, maxBuffer: 1024 * 1024 * 1024 }) });
  const extractedLockHash = sha256(readFileSync(join(directory, "pnpm-lock.yaml")));
  assert.equal(extractedLockHash, archiveLockHash, "Extracted lockfile differs from the committed lockfile");

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

  // Oracle directory: the staged files plus links to the single react, react-dom, Testing Library, router and vitest
  // instances (the frozen runner's set).
  const oracleTarget = join(directory, spec.target);
  mkdirSync(oracleTarget, { recursive: true });
  const stagedRecord = [];
  for (const entry of stageHashes) {
    const destination = join(oracleTarget, entry.name);
    copyFileSync(join(root, entry.source), destination);
    const staged = sha256(readFileSync(destination));
    assert.equal(staged, entry.actual, `Staged copy of ${entry.source} differs from its source`);
    stagedRecord.push(`${entry.source}->${spec.target}/${entry.name}=${staged}`);
  }
  // Corrected mode: the corrected file must be exactly the frozen file with the committed diff applied (patch(1) on
  // copies inside the temporary archive; nothing outside it is touched).
  let diffCheck = "not-applicable";
  if (mode === "corrected") {
    const scratch = join(directory, ".erratum-diff-check");
    mkdirSync(scratch);
    const frozenCopy = join(scratch, "frozen.tsx");
    const patched = join(scratch, "patched.tsx");
    copyFileSync(join(root, FROZEN_DIR, "continuity-export.test.tsx"), frozenCopy);
    const applied = spawnSync("/usr/bin/patch", ["-s", "-o", patched, frozenCopy, join(root, owned, DIFF)], { encoding: "utf8" });
    const patchedHash = existsSync(patched) ? sha256(readFileSync(patched)) : "missing";
    diffCheck = `patch=/usr/bin/patch patch_exit=${applied.status ?? "signal"} patched_sha256=${patchedHash} corrected_sha256=${correctedHash} ${applied.status === 0 && patchedHash === correctedHash ? "EQUAL" : "DIFFERENT"}`;
  }
  const oracleModules = join(oracleTarget, "node_modules");
  const oracleLinks = [
    ["react", join(appearanceModules, "react")],
    ["react-dom", join(appearanceModules, "react-dom")],
    ["@testing-library/react", join(appearanceModules, "@testing-library/react")],
    ["@testing-library/user-event", join(dependencyRoot, "packages/xai-web-cmdk/node_modules/@testing-library/user-event")],
    ["react-router", join(dependencyRoot, "apps/web/node_modules/react-router")],
    ["vitest", join(appearanceModules, "vitest")],
    ["@types/react", join(appearanceModules, "@types/react")],
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

  // The frozen runner's archive product hash list, plus the Appearance controller added by the fixed product.
  const productFiles = [
    `${APPEARANCE_DIR}/src/AppearancePane.tsx`, `${APPEARANCE_DIR}/src/internal/appearancePane.tsx`, `${APPEARANCE_DIR}/src/types.ts`,
    `${APPEARANCE_DIR}/src/index.ts`, `${APPEARANCE_DIR}/src/styles.css`, `${APPEARANCE_DIR}/vitest.setup.ts`, `${APPEARANCE_DIR}/vitest.config.ts`,
    "apps/web/src/App.tsx", `${SHELL_DIR}/src/Topbar.tsx`, `${SHELL_DIR}/src/Shell.tsx`, `${SHELL_DIR}/src/types.ts`,
    "apps/web/src/routes/modules/departureCoordinator.tsx", "packages/plugin-web-settings-shell/src/SettingsFooter.tsx",
    "packages/plugin-web-storage/src/internal/usePrefAsync.ts", "packages/plugin-web-storage/src/internal/prefMutation.ts",
    "packages/plugin-web-storage/src/internal/usePref.ts", "packages/plugin-web-storage/src/internal/storage.ts",
    "packages/plugin-web-storage/src/AccountDataGate.tsx", `${APPEARANCE_DIR}/src/internal/appearanceController.tsx`,
  ];
  const productHashes = productFiles.map(file => `${file}=${existsSync(join(directory, file)) ? sha256(readFileSync(join(directory, file))) : "missing"}`);
  const appearanceTree = git(["rev-parse", `${commit}:${APPEARANCE_DIR}`]);
  const shellTree = git(["rev-parse", `${commit}:${SHELL_DIR}`]);
  const webTree = git(["rev-parse", `${commit}:apps/web`]);
  const strip = text => String(text ?? "").replace(/\u001b\[[0-9;]*m/g, "");

  const pinLog = join(directory, `.pin-${mode}.log`);
  const jsonReport = join(directory, `.report-${mode}.json`);
  const settings = {
    archive: directory,
    root: directory,
    cacheDir: join(directory, ".appearance-erratum-vite-cache"),
    forbidden: [join(dependencyRoot, "packages"), join(dependencyRoot, "apps"), join(dependencyRoot, "docs")],
    pinLog,
    include: run.include,
    globals: run.globals,
    setupFiles: run.setupFiles.map(file => join(directory, file)),
    timeout: run.timeout,
    aliases: aliases.map(({ pattern, replacement }) => ({ pattern, replacement })),
  };
  const configFile = join(directory, `appearance-erratum-${mode}.vitest.config.mjs`);
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
  const missingProvenance = run.provenance.filter(file => !modules.includes(file));
  let resolvedConfig = null;
  try { resolvedConfig = configLines.length ? JSON.parse(configLines[0].slice("config ".length)) : null; } catch { resolvedConfig = null; }
  const reportedFiles = [...new Set(cases.map(entry => entry.file))].sort();

  // Harness validity checks (not test outcomes): the frozen runner's six, plus the staged-fixture identity.
  const checks = [];
  const check = (label, ok) => checks.push(`${ok ? "PASS" : "FAIL"} [${run.label}] ${label}`);
  check("JSON report parsed", Boolean(report));
  check("reported files equal the requested include", JSON.stringify(reportedFiles) === JSON.stringify([...run.include].sort()));
  check(`config in effect (environment jsdom, globals ${run.globals}, setupFiles [${run.setupFiles.join(",")}], root = archive)`,
    resolvedConfig?.environment === "jsdom" && resolvedConfig?.globals === run.globals && Array.isArray(resolvedConfig?.setupFiles)
      && resolvedConfig.setupFiles.length === run.setupFiles.length
      && run.setupFiles.every((file, index) => String(resolvedConfig.setupFiles[index]).endsWith(file)) && resolvedConfig?.root === directory);
  check("guard plugin active (archive modules recorded)", modules.length > 0);
  check(`required product modules loaded from the archive (${run.provenance.length})`, missingProvenance.length === 0);
  check("no test-file suite error", suiteErrors.length === 0);
  check(`staged fixture is the frozen fixture (${FROZEN_SHA256["fixture.tsx"].slice(0, 12)}…) and was loaded from the archive`,
    sha256(readFileSync(join(oracleTarget, "fixture.tsx"))) === FROZEN_SHA256["fixture.tsx"] && modules.includes(`${spec.target}/fixture.tsx`));
  if (mode === "corrected") check("the corrected file equals the frozen file with the committed diff applied", diffCheck.endsWith(" EQUAL"));
  const harnessFailed = checks.some(line => line.startsWith("FAIL"));
  exitCode = vitestStatus !== 0 ? vitestStatus : harnessFailed ? 2 : 0;

  const header = [
    `requested_revision=${revision}`,
    `resolved_commit=${commit}`,
    `resolved_tree=${tree}`,
    `appearance_package_tree=${appearanceTree} shell_package_tree=${shellTree} web_app_tree=${webTree}`,
    `mode=${mode}`,
    `suffix=${suffix}`,
    `command=XAI_DEPS_ROOT=${dependencyRoot} node ${owned}/verify-erratum.mjs ${revision} ${mode} ${suffix}`,
    `runner_checkout_head=${runnerHead}`,
    `vitest_bin=${vitestBin}`,
    `vitest_version=${vitestVersion} vite_version=${viteVersion} jsdom_version=${jsdomVersion} node=${process.version} platform=${process.platform}-${process.arch} tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `dependency_root=${dependencyRoot}`,
    `lockfile_gate_sha256=${LOCKFILE_GATE}`,
    `dependency_lockfile_sha256=${dependencyLockHash}`,
    `archive_lockfile_sha256=${archiveLockHash}`,
    `extracted_lockfile_sha256=${extractedLockHash}`,
    `frozen_inputs_sha256 ${Object.entries(FROZEN_SHA256).map(([name, hash]) => `${FROZEN_DIR}/${name}=${hash}`).join(" ")}`,
    `erratum_sha256 verify-erratum.mjs=${runnerHash} ${CORRECTED}=${correctedHash} ${DIFF}=${diffHash} ${REPLAY}=${replayHash}`,
    `staged ${stagedRecord.join(" ")}`,
    `corrected_diff_check ${diffCheck}`,
    `archive_file_sha256 ${productHashes.join(" ")}`,
    `oracle_dependency_links ${oracleLinks.join(" ")}`,
    `node_modules_links third_party=${thirdPartyLinks} workspace=${workspaceLinks}`,
    `tsconfig_extends_unresolved=${unresolvedExtends.length ? unresolvedExtends.join(" ") : "none"} (checked ${extendsRecord.length})`,
    `aliases=${aliases.length} exact-match archive export specifiers`,
    `run[0] ${run.label}: include=${run.include.join(",")} vitest_args=${vitestArgs.join(" ")} vitest_exit=${vitestStatus}${result.signal ? ` signal=${result.signal}` : ""}${result.error ? ` spawn_error=${result.error.message}` : ""} cases=${cases.length} passed=${count("passed")} failed=${count("failed")} precondition_failures=${preconditionFailures} suite_errors=${suiteErrors.length} unhandled_error_lines=${unhandled} json_report=${report ? `success=${report.success} numTotalTests=${report.numTotalTests} numPassedTests=${report.numPassedTests} numFailedTests=${report.numFailedTests}` : `missing (${reportError})`}`,
    `exit=${exitCode}`,
    `harness_checks=${harnessFailed ? "FAIL" : "PASS"} (${checks.filter(line => line.startsWith("PASS")).length}/${checks.length})`,
  ].join("\n");
  const section = [
    `==== run[0] ${run.label} ====`,
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
  ].join("\n");
  const summary = [
    `totals cases=${cases.length} passed=${count("passed")} failed=${count("failed")} skipped=${cases.length - count("passed") - count("failed")} precondition_failures=${preconditionFailures}`,
    ...checks.map(line => `harness ${line}`),
    ...cases.map((entry, index) => `case ${String(index + 1).padStart(3, "0")} ${entry.status.toUpperCase()}${entry.precondition ? " PRECONDITION" : ""} | ${entry.name}${entry.status === "failed" ? `\n    first: ${entry.first}` : ""}`),
  ].join("\n");
  if (existsSync(logPath)) throw Error(`Evidence appeared during the run; refusing to overwrite ${logPath}`);
  writeFileSync(logPath, `${header}\n${section}\n---- runner summary ----\n${summary}`.trimEnd() + "\n", { flag: "wx" });
  console.log(`${mode} ${revision} (${commit.slice(0, 12)}): harness=${harnessFailed ? "FAIL" : "PASS"} exit=${exitCode} cases=${cases.length} passed=${count("passed")} failed=${count("failed")} precondition=${preconditionFailures} log=${relative(root, logPath)}`);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
if (exitCode !== 0) process.exitCode = exitCode;
