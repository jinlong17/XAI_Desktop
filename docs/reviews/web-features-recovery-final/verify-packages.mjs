/**
 * Final-regression package-gate runner for CP-FEATURES-01 (control-plane batch 30; contract
 * docs/reviews/web-features-recovery-contract/contract.md §10 items 10 and 11, §13 row 8, §14 E20–E24).
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals the revision's> \
 *     node docs/reviews/web-features-recovery-final/verify-packages.mjs <revision> <mode|all> <suffix>
 *
 * Each mode runs one package script from the package's own folder inside an immutable archive, exactly as
 * `pnpm --filter <package> <script>` would invoke it (the script text is read from the archive's package.json and
 * must equal the expected command), with output-only additions noted per kind:
 *   vitest  `vitest run` with the package's own vitest.config.ts (imported unchanged by a wrapper that adds only
 *           root, cacheDir, exact-match @repo aliases, the guard plugin and, for the `*-readers` mode, an include
 *           restricted to the named reader tests) plus the verbose and JSON reporters;
 *   tsc     `tsc --noEmit` plus `--listFiles` (the listing is the module-provenance guard for the type program);
 *   eslint  `eslint --max-warnings 0 .` plus `--format json --output-file` (per-file results), with a Node
 *           module-resolution guard loaded through NODE_OPTIONS=--import.
 * The binary is taken as pnpm would: the package's node_modules/.bin, else the workspace root's node_modules/.bin.
 *
 * - Every mode expands its own fresh `git archive <revision>` (realpath temporary directory) and gates on SHA-256
 *   equality of XAI_DEPS_ROOT/pnpm-lock.yaml (default: this repository root), `git show <revision>:pnpm-lock.yaml`,
 *   the extracted lockfile and the contract lockfile hash.
 * - Every archive workspace (packages/* and apps/*) and the archive root get a private node_modules directory:
 *   read-only links to the dependency checkout's third-party entries (never its @repo links or caches) and @repo
 *   links to the archive's own package folders for every declared workspace dependency, so Node, TypeScript and
 *   tsconfig `extends` resolution stay inside the archive. Every workspace tsconfig `extends` must resolve inside.
 * - Guards: Vitest fails on any module transformed from the dependency checkout's or this checkout's packages/,
 *   apps/ or docs/, and on any unaliased @repo import resolving outside the archive; tsc fails the harness if any
 *   listed program file lies outside the archive and the dependency checkout's node_modules/.pnpm store; ESLint
 *   fails on any module resolved from those checkout folders and on any @repo resolution outside the archive.
 *   Each guard records the archive modules it saw; required product modules must be among them.
 * - Writes <mode>-<suffix>-<revision>.log beside this file (XAI_FINAL_OUTPUT_DIR redirects it, for development smoke
 *   runs only), refusing to overwrite: requested and resolved revision and tree, lockfile hashes, runner hash,
 *   archive file hashes, binary and versions, the raw stdout and stderr, a per-file and per-case summary, the
 *   harness checks and the module-pin record.
 * - Exit status: the first nonzero tool status; 2 if the tool exited 0 but a harness check failed.
 * Nothing is written into the dependency checkout; caches and bundled-config temp files stay inside the temporary
 * archive, which is deleted afterwards.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const runnerFile = fileURLToPath(import.meta.url);
const owned = "docs/reviews/web-features-recovery-final";
const checkoutRoot = realpathSync(root);
const dependencyRoot = realpathSync(resolve(process.env.XAI_DEPS_ROOT ?? root));
const outputDir = process.env.XAI_FINAL_OUTPUT_DIR ? realpathSync(resolve(process.env.XAI_FINAL_OUTPUT_DIR)) : evidence;
const [revision, modeArgument, suffix, ...extra] = process.argv.slice(2);
if (!revision || !modeArgument || !suffix || extra.length) throw Error("Usage: node verify-packages.mjs <revision> <mode|all> <suffix>");
if (!/^[A-Za-z0-9._-]+$/.test(revision)) throw Error(`Unsafe revision: ${revision}`);
if (!/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error(`Unsafe suffix: ${suffix}`);

const EXPECTED_LOCK_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const FEATURES = "packages/xai-web-settings-features-panel";
const WEB = "apps/web";
const STORAGE = "packages/plugin-web-storage";
const SHELL = "packages/plugin-web-settings-shell";
const REST = "packages/plugin-web-settings-rest";
const READER_TESTS = ["useFeaturePrefs.test.tsx", "withDisabledFallback.test.tsx", "filterModulesByFeaturePrefs.test.ts", "DisabledFeatureFallback.test.tsx", "featuresPaneEntry.test.tsx"].map(name => `src/__tests__/${name}`);
const PACKAGE_TEST_FILES = /^src\/__tests__\/.+\.(test|spec)\.(ts|tsx)$/;
const WEB_TEST_FILES = /^(src|deploy)\/.+\.test\.(ts|tsx)$/;
// Required modules: each must be recorded by the guard when it exists in the archive (absent files are reported).
const MODES = {
  "features-test": {
    dir: FEATURES, kind: "vitest", script: ["test", "vitest run"], environment: "jsdom", globals: true, setupFiles: ["vitest.setup.ts"],
    configInclude: ["src/__tests__/**/*.{test,spec}.{ts,tsx}"], expectedFiles: PACKAGE_TEST_FILES,
    requiredTests: [...READER_TESTS, "src/__tests__/FeaturesPane.test.tsx", "src/__tests__/FeaturesPaneRecovery.test.tsx"],
    provenance: [`${FEATURES}/src/FeaturesPane.tsx`, `${FEATURES}/src/internal/featuresPane.tsx`, `${FEATURES}/src/internal/featuresRecovery.ts`, `${FEATURES}/src/internal/featuresRecoveryCopy.ts`, `${FEATURES}/src/useFeaturePrefs.ts`, `${FEATURES}/src/withDisabledFallback.tsx`, `${FEATURES}/src/filterModulesByFeaturePrefs.ts`, `${FEATURES}/src/DisabledFeatureFallback.tsx`, `${STORAGE}/src/internal/usePrefAsync.ts`, `${STORAGE}/src/internal/prefMutation.ts`],
  },
  "features-readers": {
    dir: FEATURES, kind: "vitest", script: ["test", "vitest run"], environment: "jsdom", globals: true, setupFiles: ["vitest.setup.ts"],
    include: READER_TESTS, expectedFiles: READER_TESTS,
    provenance: [`${FEATURES}/src/useFeaturePrefs.ts`, `${FEATURES}/src/withDisabledFallback.tsx`, `${FEATURES}/src/filterModulesByFeaturePrefs.ts`, `${FEATURES}/src/DisabledFeatureFallback.tsx`, `${FEATURES}/src/internal/featuresPane.tsx`],
  },
  "features-typecheck": {
    dir: FEATURES, kind: "tsc", script: ["typecheck", "tsc --noEmit"],
    provenance: [`${FEATURES}/src/FeaturesPane.tsx`, `${FEATURES}/src/internal/featuresRecovery.ts`, `${FEATURES}/src/internal/featuresRecoveryCopy.ts`, `${FEATURES}/src/__tests__/FeaturesPaneRecovery.test.tsx`, `${FEATURES}/src/types.ts`, `${STORAGE}/src/index.ts`, `${SHELL}/src/index.ts`],
  },
  "features-lint": {
    dir: FEATURES, kind: "eslint", script: ["lint", "eslint --max-warnings 0 ."],
    provenance: [`${FEATURES}/eslint.config.js`, "packages/eslint-config/react-internal.js", "packages/eslint-config/base.js"],
  },
  "web-test": {
    dir: WEB, kind: "vitest", script: ["test", "vitest run"], environment: "jsdom", globals: false, setupFiles: [],
    configInclude: ["src/**/*.test.{ts,tsx}", "deploy/**/*.test.{ts,tsx}"], expectedFiles: WEB_TEST_FILES,
    requiredTests: ["src/routes/modules/__tests__/railFeatureFilter.test.tsx", "src/routes/modules/__tests__/settingsPaneComposition.test.tsx", "src/__tests__/settingsPaneComposition.appearance.test.ts", "src/__tests__/settingsPaneComposition.rest.test.ts", "src/__tests__/cmdkIntegration.test.tsx", "src/routes/modules/__tests__/departureCoordinator.blocker.test.tsx"],
    provenance: [`${WEB}/src/App.tsx`, `${WEB}/src/routes/modules/departureCoordinator.tsx`, `${WEB}/src/routes/modules/shellRegistrations.tsx`, `${WEB}/src/routes/modules/settingsPaneComposition.ts`, `${FEATURES}/src/useFeaturePrefs.ts`, `${FEATURES}/src/filterModulesByFeaturePrefs.ts`, `${FEATURES}/src/FeaturesPane.tsx`, `${FEATURES}/src/internal/featuresRecovery.ts`, "packages/xai-web-cmdk/src/CommandPalette.tsx"],
  },
  "web-check-types": {
    dir: WEB, kind: "tsc", script: ["check-types", "tsc --noEmit"],
    provenance: [`${WEB}/src/App.tsx`, `${WEB}/src/routes/modules/departureCoordinator.tsx`, `${FEATURES}/src/index.ts`, `${FEATURES}/src/FeaturesPane.tsx`, `${FEATURES}/src/internal/featuresRecovery.ts`, `${FEATURES}/src/internal/featuresRecoveryCopy.ts`],
  },
  "web-lint": {
    dir: WEB, kind: "eslint", script: ["lint", "eslint --max-warnings 0 ."],
    provenance: [`${WEB}/eslint.config.js`, "packages/eslint-config/react-internal.js", "packages/eslint-config/base.js"],
  },
  "storage-check-types": {
    dir: STORAGE, kind: "tsc", script: ["check-types", "tsc --noEmit"],
    provenance: [`${STORAGE}/src/index.ts`, `${STORAGE}/src/internal/prefMutation.ts`, `${STORAGE}/src/internal/usePrefAsync.ts`, `${STORAGE}/src/internal/lifecycleDeclaration.ts`, `${STORAGE}/src/internal/accountOwnership.ts`],
  },
  "settings-shell-test": {
    dir: SHELL, kind: "vitest", script: ["test", "vitest run"], environment: "jsdom", globals: true, setupFiles: ["vitest.setup.ts"],
    configInclude: ["src/__tests__/**/*.{test,spec}.{ts,tsx}"], expectedFiles: PACKAGE_TEST_FILES,
    requiredTests: ["src/__tests__/SettingsFooter.test.tsx"],
    provenance: [`${SHELL}/src/SettingsFooter.tsx`, `${SHELL}/src/internal/resetAllPrefs.ts`, `${SHELL}/src/Toggle.tsx`],
  },
  "settings-rest-test": {
    dir: REST, kind: "vitest", script: ["test", "vitest run"], environment: "jsdom", globals: true, setupFiles: ["vitest.setup.ts"],
    configInclude: ["src/__tests__/**/*.{test,spec}.{ts,tsx}"], expectedFiles: PACKAGE_TEST_FILES,
    requiredTests: ["src/__tests__/morePane.test.tsx", "src/__tests__/stickyPane.test.tsx", "src/__tests__/stickyPaneRecovery.test.tsx", "src/__tests__/notificationsPane.test.tsx", "src/__tests__/dateTimePane.test.tsx"],
    provenance: [`${REST}/src/panes/morePane.tsx`, `${REST}/src/panes/stickyPane.tsx`, `${REST}/src/panes/notificationsPane.tsx`, `${REST}/src/panes/dateTimePane.tsx`],
  },
};
const selected = modeArgument === "all" ? Object.keys(MODES) : [modeArgument];
for (const mode of selected) if (!Object.hasOwn(MODES, mode)) throw Error(`Unsupported mode ${mode}; use one of ${Object.keys(MODES).join(", ")} or all`);
const logPath = mode => join(outputDir, `${mode}-${suffix}-${revision}.log`);
for (const mode of selected) if (existsSync(logPath(mode))) throw Error(`Evidence exists; use a new suffix: ${logPath(mode)}`);

const sha256 = data => createHash("sha256").update(data).digest("hex");
const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
const commit = git(["rev-parse", "--verify", `${revision}^{commit}`]);
const tree = git(["rev-parse", `${commit}^{tree}`]);
const runnerHead = git(["rev-parse", "HEAD"]);
const runnerHash = sha256(readFileSync(runnerFile));
const archiveLockHash = sha256(execFileSync("git", ["show", `${commit}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 256 * 1024 * 1024 }));
assert(existsSync(join(dependencyRoot, "node_modules")), "Dependency tree missing; set XAI_DEPS_ROOT to a checkout with installed node_modules");
const dependencyLockHash = sha256(readFileSync(join(dependencyRoot, "pnpm-lock.yaml")));
assert.equal(dependencyLockHash, EXPECTED_LOCK_SHA256, "Dependency checkout lockfile differs from the contract lockfile");
assert.equal(archiveLockHash, EXPECTED_LOCK_SHA256, "Requested revision's lockfile differs from the contract lockfile");
const versionOf = file => { try { return JSON.parse(readFileSync(file, "utf8")).version; } catch { return "unknown"; } };
const FORBIDDEN = [...new Set([dependencyRoot, checkoutRoot])].flatMap(base => ["packages", "apps", "docs"].map(folder => join(base, folder)));
const STORE = join(dependencyRoot, "node_modules/.pnpm");
const strip = text => String(text ?? "").replace(/\u001b\[[0-9;]*m/g, "");
const inside = (file, folder) => file === folder || file.startsWith(`${folder}/`);
const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findBin = (dir, name) => {
  for (const candidate of [join(dependencyRoot, dir, "node_modules/.bin", name), join(dependencyRoot, "node_modules/.bin", name)]) if (existsSync(candidate)) return candidate;
  throw Error(`Binary ${name} not found for ${dir}`);
};
const packageOf = (dir, name) => { try { return realpathSync(join(dependencyRoot, dir, "node_modules", name)); } catch { try { return realpathSync(join(dependencyRoot, "node_modules", name)); } catch { return null; } } };

const VITEST_WRAPPER = `import { appendFileSync } from "node:fs";
import { mergeConfig } from "vitest/config";
import base from "./vitest.config.ts";

const settings = __SETTINGS__;
const record = line => appendFileSync(settings.pinLog, line + "\\n");
const inside = (file, folder) => file === folder || file.startsWith(folder + "/");
const guard = {
  name: "features-final-archive-pin-guard",
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
    for (const folder of settings.forbidden) if (inside(file, folder)) throw new Error("Pin violation: module loaded from a checkout: " + file);
    if (inside(file, settings.archive)) record("module " + file.slice(settings.archive.length + 1));
    return null;
  },
};

const merged = mergeConfig(base, {
  root: settings.root,
  cacheDir: settings.cacheDir,
  resolve: { alias: settings.aliases.map(({ pattern, replacement }) => ({ find: new RegExp(pattern), replacement })) },
  plugins: [guard],
});
// mergeConfig concatenates arrays, so a restricted include replaces (never extends) the package include.
if (settings.include) merged.test = { ...merged.test, include: settings.include };
export default merged;
`;

const ESLINT_GUARD = `import { appendFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

const settings = JSON.parse(process.env.XAI_FINAL_GUARD_SETTINGS);
const record = line => appendFileSync(settings.pinLog, line + "\\n");
const inside = (file, folder) => file === folder || file.startsWith(folder + "/");
record("hook-registered pid=" + process.pid + " argv=" + JSON.stringify(process.argv.slice(1)));
registerHooks({
  resolve(specifier, context, nextResolve) {
    const result = nextResolve(specifier, context);
    if (result && typeof result.url === "string" && result.url.startsWith("file:")) {
      const file = fileURLToPath(result.url.split("?")[0].split("#")[0]);
      for (const folder of settings.forbidden) {
        if (inside(file, folder)) {
          record("violation " + specifier + " -> " + file);
          throw new Error("Pin violation: module resolved from a checkout: " + file);
        }
      }
      if (specifier.startsWith("@repo/")) {
        record("repo " + specifier + " -> " + file);
        if (!inside(file, settings.archive)) {
          record("violation " + specifier + " -> " + file);
          throw new Error("Pin violation: " + specifier + " resolved outside the archive: " + file);
        }
      }
      if (inside(file, settings.archive)) record("module " + file.slice(settings.archive.length + 1));
    }
    return result;
  },
});
`;

const walkFiles = (directory, base = directory, out = []) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walkFiles(full, base, out);
    else if (entry.isFile()) out.push(relative(base, full));
  }
  return out;
};

let firstFailure = 0;
for (const mode of selected) {
  const spec = MODES[mode];
  const directory = realpathSync(mkdtempSync(join(tmpdir(), "xai-features-final-pkg-")));
  const packageRoot = join(directory, spec.dir);
  const guardDir = join(directory, ".final-guard");
  const pinLog = join(guardDir, `pin-${mode}.log`);
  const checks = [];
  const check = (label, ok) => { checks.push(`${ok ? "PASS" : "FAIL"} ${label}`); return ok; };
  let toolStatus = 1;
  let result = null;
  const summary = [];
  const headerExtra = [];
  try {
    execFileSync("tar", ["-x", "-C", directory], { input: execFileSync("git", ["archive", commit], { cwd: root, maxBuffer: 1024 * 1024 * 1024 }) });
    const extractedLockHash = sha256(readFileSync(join(directory, "pnpm-lock.yaml")));
    assert.equal(extractedLockHash, EXPECTED_LOCK_SHA256, "Extracted lockfile differs from the contract lockfile");
    assert(existsSync(join(packageRoot, "package.json")), `Package folder missing from the archive: ${spec.dir}`);
    mkdirSync(guardDir, { recursive: true });

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
    const repoDeps = pkg => [...new Set(Object.keys({ ...pkg.dependencies, ...pkg.optionalDependencies, ...pkg.peerDependencies, ...pkg.devDependencies }).filter(name => name.startsWith("@repo/")))].sort();
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
      for (const name of repoDeps(pkg)) {
        if (!workspace.has(name)) continue;
        mkdirSync(join(target, "@repo"), { recursive: true });
        symlinkSync(workspace.get(name).folder, join(target, "@repo", name.slice("@repo/".length)));
        workspaceLinks += 1;
      }
    };
    const rootPackage = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
    linkThirdParty(join(dependencyRoot, "node_modules"), join(directory, "node_modules"));
    linkWorkspace(rootPackage, join(directory, "node_modules"));
    for (const [, entry] of workspace) {
      const target = join(entry.folder, "node_modules");
      linkThirdParty(join(dependencyRoot, entry.rel, "node_modules"), target);
      linkWorkspace(entry.pkg, target);
    }
    const packageInfo = [...workspace.values()].find(entry => entry.rel === spec.dir);
    assert(packageInfo, `No workspace package at ${spec.dir}`);
    const packageLinks = repoDeps(packageInfo.pkg).filter(name => workspace.has(name)).map(name => `${name}->${workspace.get(name).rel}`);

    // tsconfig `extends` of every workspace package must resolve inside the archive (Node resolution, as tsconfck does).
    const extendsRecord = [];
    for (const [name, entry] of workspace) {
      const tsconfigPath = join(entry.folder, "tsconfig.json");
      if (!existsSync(tsconfigPath)) continue;
      const match = /"extends"\s*:\s*"([^"]+)"/.exec(readFileSync(tsconfigPath, "utf8"));
      if (!match || match[1].startsWith(".")) continue;
      let target = "unresolved";
      try { target = realpathSync(createRequire(tsconfigPath).resolve(match[1])); } catch { target = "unresolved"; }
      if (target !== "unresolved") assert(target.startsWith(`${directory}/`), `tsconfig extends of ${name} resolved outside the archive: ${target}`);
      extendsRecord.push(`${name}:${match[1]}->${target === "unresolved" ? target : relative(directory, target)}`);
    }
    const unresolvedExtends = extendsRecord.filter(line => line.endsWith("->unresolved"));
    const ownExtends = extendsRecord.filter(line => line.startsWith(`${packageInfo.pkg.name}:`));

    // Exact-match aliases: every archive packages/* export specifier to the archive file.
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

    // The script must be the expected command (the gate is "the package's <script>").
    const [scriptName, scriptText] = spec.script;
    const archiveScript = packageInfo.pkg.scripts?.[scriptName];
    check(`archive package.json script "${scriptName}" is "${scriptText}" (found ${JSON.stringify(archiveScript)})`, archiveScript === scriptText);
    const keyFiles = ["package.json", "tsconfig.json", "vitest.config.ts", "vitest.setup.ts", "eslint.config.js"].filter(file => existsSync(join(packageRoot, file)));
    const presentProvenance = spec.provenance.filter(file => existsSync(join(directory, file)));
    const absentProvenance = spec.provenance.filter(file => !existsSync(join(directory, file)));
    headerExtra.push(
      `package=${packageInfo.pkg.name} (${spec.dir}) kind=${spec.kind} script=${scriptName}: ${JSON.stringify(archiveScript)}`,
      `archive_file_sha256 ${keyFiles.map(file => `${spec.dir}/${file}=${sha256(readFileSync(join(packageRoot, file)))}`).join(" ")}`,
      `package_tree=${git(["rev-parse", `${commit}:${spec.dir}`])} features_package_tree=${git(["rev-parse", `${commit}:${FEATURES}`])}`,
      `node_modules_links third_party=${thirdPartyLinks} workspace=${workspaceLinks}; package_workspace_links ${packageLinks.join(" ")}`,
      `tsconfig_extends_checked=${extendsRecord.length} unresolved=${unresolvedExtends.length ? unresolvedExtends.join(" ") : "none"} own=${ownExtends.join(" ") || "none"}`,
      `aliases=${aliases.length} exact-match archive export specifiers`,
      `forbidden=${FORBIDDEN.join(",")}`,
      `required_provenance_absent_from_archive=${absentProvenance.length ? absentProvenance.join(",") : "none"}`,
    );

    if (spec.kind === "vitest") {
      const vitestBin = findBin(spec.dir, "vitest");
      const vitestHome = packageOf(spec.dir, "vitest");
      const jsdomHome = packageOf(spec.dir, "jsdom");
      const jsonReport = join(guardDir, `report-${mode}.json`);
      const settings = {
        archive: directory, root: packageRoot, cacheDir: join(directory, ".final-vite-cache"), forbidden: FORBIDDEN, pinLog,
        include: spec.include ?? null, aliases: aliases.map(({ pattern, replacement }) => ({ pattern, replacement })),
      };
      const configFile = join(packageRoot, `final-${mode}.vitest.config.mjs`);
      writeFileSync(configFile, VITEST_WRAPPER.replace("__SETTINGS__", JSON.stringify(settings)), { flag: "wx" });
      const args = ["run", "--config", configFile, "--reporter=verbose", "--reporter=json", `--outputFile.json=${jsonReport}`];
      headerExtra.push(
        `bin=${vitestBin}`,
        `args=${args.join(" ")}`,
        `vitest=${vitestHome ? `${relative(dependencyRoot, vitestHome)}@${versionOf(join(vitestHome, "package.json"))}` : "unknown"} vite=${vitestHome ? versionOf(join(vitestHome, "../vite/package.json")) : "unknown"} jsdom=${jsdomHome ? versionOf(join(jsdomHome, "package.json")) : "unknown"}`,
      );
      result = spawnSync(vitestBin, args, { cwd: packageRoot, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" } });
      toolStatus = result.status ?? 1;

      let report = null;
      let reportError = "";
      try { report = JSON.parse(readFileSync(jsonReport, "utf8")); } catch (error) { reportError = String(error?.message ?? error); }
      const cases = [];
      const perFile = [];
      for (const suite of report?.testResults ?? []) {
        const file = relative(packageRoot, suite.name);
        const tests = suite.assertionResults ?? [];
        const count = status => tests.filter(test => test.status === status).length;
        perFile.push({ file, status: suite.status, total: tests.length, passed: count("passed"), failed: count("failed"), message: strip(suite.message).split("\n")[0] });
        for (const test of tests) {
          const message = strip((test.failureMessages ?? [])[0] ?? "");
          cases.push({ file, name: test.fullName ?? test.title, status: test.status, first: (message.split("\n").find(line => line.trim()) ?? "").trim().slice(0, 400) });
        }
      }
      perFile.sort((left, right) => left.file.localeCompare(right.file));
      const total = { files: perFile.length, tests: cases.length, passed: cases.filter(entry => entry.status === "passed").length, failed: cases.filter(entry => entry.status === "failed").length };
      total.other = total.tests - total.passed - total.failed;
      const suiteErrors = perFile.filter(entry => entry.status === "failed" && entry.total === 0);
      const unhandled = strip(result.stdout).split("\n").filter(line => /Unhandled (Error|Rejection)/.test(line)).length;
      const expected = Array.isArray(spec.expectedFiles) ? [...spec.expectedFiles].sort() : walkFiles(packageRoot).filter(file => spec.expectedFiles.test(file)).sort();
      const reported = perFile.map(entry => entry.file).sort();

      const pinLines = existsSync(pinLog) ? readFileSync(pinLog, "utf8").split("\n").filter(Boolean) : [];
      const configLines = [...new Set(pinLines.filter(line => line.startsWith("config ")))];
      const unaliased = [...new Set(pinLines.filter(line => line.startsWith("unaliased ")))];
      const modules = [...new Set(pinLines.filter(line => line.startsWith("module ")).map(line => line.slice("module ".length)))].sort();
      const byPackage = new Map();
      for (const module of modules) { const key = module.split("/").slice(0, 2).join("/"); byPackage.set(key, (byPackage.get(key) ?? 0) + 1); }
      let config = null;
      try { config = configLines.length ? JSON.parse(configLines[0].slice("config ".length)) : null; } catch { config = null; }
      const missingProvenance = presentProvenance.filter(file => !modules.includes(file));
      const expectedInclude = spec.include ?? spec.configInclude;

      check("JSON report parsed", Boolean(report));
      check(`reported test files equal the expected set (${expected.length} files${Array.isArray(spec.expectedFiles) ? ", explicit include" : ", from the archive by the package include"})`, JSON.stringify(reported) === JSON.stringify(expected));
      // A required test file that does not exist at this revision is reported, not required (before controls).
      const absentRequiredTests = (spec.requiredTests ?? []).filter(file => !existsSync(join(packageRoot, file)));
      for (const file of (spec.requiredTests ?? []).filter(file => !absentRequiredTests.includes(file))) check(`required test file ran: ${file}`, reported.includes(file));
      summary.push(`required_tests_absent_from_archive=${absentRequiredTests.length ? absentRequiredTests.join(",") : "none"}`);
      check(`package config in effect (environment ${spec.environment}, globals ${spec.globals}, setupFiles [${spec.setupFiles.join(",")}], include ${JSON.stringify(expectedInclude)}, root = archive package)`,
        config?.environment === spec.environment && config?.globals === spec.globals
          && (config?.setupFiles ?? []).length === spec.setupFiles.length && spec.setupFiles.every((file, index) => String(config.setupFiles[index]).endsWith(file))
          && JSON.stringify(config?.include) === JSON.stringify(expectedInclude) && config?.root === packageRoot);
      check("guard plugin active (archive modules recorded)", modules.length > 0);
      check(`required product modules loaded from the archive (${presentProvenance.length} present of ${spec.provenance.length} listed)`, missingProvenance.length === 0);
      check("no test-file suite error", suiteErrors.length === 0);

      summary.push(
        `json_report=${report ? `success=${report.success} numTotalTestSuites=${report.numTotalTestSuites} numTotalTests=${report.numTotalTests} numPassedTests=${report.numPassedTests} numFailedTests=${report.numFailedTests} numPendingTests=${report.numPendingTests} numTodoTests=${report.numTodoTests}` : `missing (${reportError})`}`,
        `totals files=${total.files} tests=${total.tests} passed=${total.passed} failed=${total.failed} other=${total.other} suite_errors=${suiteErrors.length} unhandled_error_lines=${unhandled}`,
        ...perFile.map(entry => `file ${entry.file} status=${entry.status} tests=${entry.total} passed=${entry.passed} failed=${entry.failed}${entry.message ? ` message=${entry.message}` : ""}`),
        ...cases.map((entry, index) => `case ${String(index + 1).padStart(3, "0")} ${entry.status.toUpperCase()} | ${entry.file} > ${entry.name}${entry.status === "failed" ? `\n    first: ${entry.first}` : ""}`),
        `pin_config ${configLines.length ? configLines.map(line => line.slice("config ".length)).join(" | ") : "missing"}`,
        `pin_unaliased_repo_imports=${unaliased.length}${unaliased.length ? ` ${unaliased.join(" | ")}` : ""}`,
        `pin_required_provenance ${presentProvenance.join(" ")}`,
        `pin_required_provenance_missing=${missingProvenance.length ? missingProvenance.join(",") : "none"}`,
        `pin_modules=${modules.length} by package: ${[...byPackage].map(([key, value]) => `${key}=${value}`).join(" ")}`,
      );
      console.log(`${mode} ${revision}: vitest_exit=${toolStatus} files=${total.files} tests=${total.tests} passed=${total.passed} failed=${total.failed}`);
    } else if (spec.kind === "tsc") {
      const tscBin = findBin(spec.dir, "tsc");
      const typescriptHome = packageOf(spec.dir, "typescript");
      const args = ["--noEmit", "--listFiles"];
      headerExtra.push(`bin=${tscBin}`, `args=${args.join(" ")}`, `typescript=${typescriptHome ? `${relative(dependencyRoot, typescriptHome)}@${versionOf(join(typescriptHome, "package.json"))}` : "unknown"}`);
      result = spawnSync(tscBin, args, { cwd: packageRoot, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" } });
      toolStatus = result.status ?? 1;
      const lines = strip(result.stdout).split("\n").map(line => line.trimEnd()).filter(Boolean);
      const listed = lines.filter(line => line.startsWith("/") && !/\(\d+,\d+\): /.test(line));
      const diagnostics = lines.filter(line => !listed.includes(line));
      const inArchive = listed.filter(file => inside(file, directory));
      const inStore = listed.filter(file => inside(file, STORE));
      const forbiddenHits = listed.filter(file => FORBIDDEN.some(folder => inside(file, folder)));
      const elsewhere = listed.filter(file => !inside(file, directory) && !inside(file, STORE));
      const archiveRelative = inArchive.map(file => relative(directory, file)).sort();
      const byPackage = new Map();
      for (const file of archiveRelative) { const key = file.split("/").slice(0, 2).join("/"); byPackage.set(key, (byPackage.get(key) ?? 0) + 1); }
      const missingProvenance = presentProvenance.filter(file => !archiveRelative.includes(file));
      check("program file list parsed (--listFiles)", listed.length > 0);
      check("no program file from a checkout's packages/, apps/ or docs/", forbiddenHits.length === 0);
      check("every program file is inside the archive or the dependency store node_modules/.pnpm", elsewhere.length === 0);
      check(`required product files in the type program (${presentProvenance.length} present of ${spec.provenance.length} listed)`, missingProvenance.length === 0);
      check(`own tsconfig extends resolves inside the archive (${ownExtends.join(" ") || "no package extends"})`, ownExtends.every(line => !line.endsWith("->unresolved")));
      summary.push(
        `tsc_exit=${toolStatus} diagnostics_lines=${diagnostics.length}`,
        ...diagnostics.map(line => `diagnostic ${line}`),
        `program_files=${listed.length} archive=${inArchive.length} store=${inStore.length} elsewhere=${elsewhere.length} forbidden=${forbiddenHits.length}`,
        ...elsewhere.map(file => `elsewhere ${file}`),
        ...forbiddenHits.map(file => `forbidden ${file}`),
        `archive_files_by_package ${[...byPackage].map(([key, value]) => `${key}=${value}`).join(" ")}`,
        `archive_file_list_sha256=${sha256(archiveRelative.join("\n"))}`,
        `pin_required_provenance ${presentProvenance.join(" ")}`,
        `pin_required_provenance_missing=${missingProvenance.length ? missingProvenance.join(",") : "none"}`,
        ...archiveRelative.filter(file => file.startsWith(`${spec.dir}/`) || file.startsWith(`${FEATURES}/`)).map(file => `program ${file}`),
      );
      // Keep the raw stdout short in the log: the listing is summarised above.
      result = { ...result, stdout: diagnostics.join("\n") + (diagnostics.length ? "\n" : "") + `[--listFiles output: ${listed.length} paths, summarised in the runner summary]\n` };
      console.log(`${mode} ${revision}: tsc_exit=${toolStatus} diagnostics=${diagnostics.length} program_files=${listed.length} archive=${inArchive.length}`);
    } else {
      const eslintBin = findBin(spec.dir, "eslint");
      const eslintHome = packageOf(spec.dir, "eslint");
      const guardFile = join(guardDir, "eslint-guard.mjs");
      writeFileSync(guardFile, ESLINT_GUARD, { flag: "wx" });
      const jsonOutput = join(guardDir, `eslint-${mode}.json`);
      const args = ["--max-warnings", "0", ".", "--format", "json", "--output-file", jsonOutput];
      const guardSettings = { archive: directory, forbidden: FORBIDDEN, pinLog };
      headerExtra.push(`bin=${eslintBin}`, `args=${args.join(" ")}`, `eslint=${eslintHome ? `${relative(dependencyRoot, eslintHome)}@${versionOf(join(eslintHome, "package.json"))}` : "unknown"}`, `node_options=--import=${pathToFileURL(guardFile).href}`);
      const env = { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0", NODE_OPTIONS: `${process.env.NODE_OPTIONS ? `${process.env.NODE_OPTIONS} ` : ""}--import=${pathToFileURL(guardFile).href}`, XAI_FINAL_GUARD_SETTINGS: JSON.stringify(guardSettings) };
      result = spawnSync(eslintBin, args, { cwd: packageRoot, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env });
      toolStatus = result.status ?? 1;
      let report = null;
      let reportError = "";
      try { report = JSON.parse(readFileSync(jsonOutput, "utf8")); } catch (error) { reportError = String(error?.message ?? error); }
      const files = (report ?? []).map(entry => ({ file: relative(packageRoot, entry.filePath), errors: entry.errorCount, warnings: entry.warningCount, fatal: entry.fatalErrorCount ?? 0, messages: entry.messages ?? [] })).sort((left, right) => left.file.localeCompare(right.file));
      const totals = files.reduce((sum, entry) => ({ errors: sum.errors + entry.errors, warnings: sum.warnings + entry.warnings, fatal: sum.fatal + entry.fatal }), { errors: 0, warnings: 0, fatal: 0 });
      const pinLines = existsSync(pinLog) ? readFileSync(pinLog, "utf8").split("\n").filter(Boolean) : [];
      const hooks = pinLines.filter(line => line.startsWith("hook-registered "));
      const violations = [...new Set(pinLines.filter(line => line.startsWith("violation ")))];
      const repoLines = [...new Set(pinLines.filter(line => line.startsWith("repo ")))];
      const modules = [...new Set(pinLines.filter(line => line.startsWith("module ")).map(line => line.slice("module ".length)))].sort();
      const missingProvenance = presentProvenance.filter(file => !modules.includes(file));
      const trackedLintable = walkFiles(packageRoot).filter(file => /\.(js|mjs|cjs|jsx|ts|tsx|mts|cts)$/.test(file)).sort();
      check("JSON results parsed", Boolean(report));
      check(`module-resolution guard active in the ESLint process (${hooks.length} registration)`, hooks.length >= 1);
      check("no module resolved from a checkout's packages/, apps/ or docs/ and no @repo resolution outside the archive", violations.length === 0);
      check(`required configuration modules loaded from the archive (${presentProvenance.length})`, missingProvenance.length === 0);
      check(`every linted file is a lintable file of the archive package (${files.length} linted of ${trackedLintable.length} on disk; the rest are listed as configured ignores)`, files.length > 0 && files.every(entry => trackedLintable.includes(entry.file)));
      summary.push(
        `eslint_exit=${toolStatus} files=${files.length} errors=${totals.errors} warnings=${totals.warnings} fatal=${totals.fatal}${report ? "" : ` report_missing=${reportError}`}`,
        ...files.map(entry => `file ${entry.file} errors=${entry.errors} warnings=${entry.warnings}${entry.messages.length ? ` messages=${JSON.stringify(entry.messages.map(message => `${message.line}:${message.column} ${message.ruleId} ${message.message}`))}` : ""}`),
        ...trackedLintable.filter(file => !files.some(entry => entry.file === file)).map(file => `not-linted ${file} (configured ignore)`),
        `pin_hooks ${hooks.join(" | ")}`,
        `pin_repo_resolutions=${repoLines.length} ${repoLines.join(" | ")}`,
        `pin_violations=${violations.length}${violations.length ? ` ${violations.join(" | ")}` : ""}`,
        `pin_required_provenance ${presentProvenance.join(" ")}`,
        `pin_required_provenance_missing=${missingProvenance.length ? missingProvenance.join(",") : "none"}`,
        `pin_modules=${modules.length}`,
        ...modules.map(module => `  module ${module}`),
      );
      console.log(`${mode} ${revision}: eslint_exit=${toolStatus} files=${files.length} errors=${totals.errors} warnings=${totals.warnings} violations=${violations.length}`);
    }
  } catch (error) {
    check(`runner completed without an exception (${String(error?.stack ?? error).split("\n")[0]})`, false);
    summary.push(`runner_exception ${String(error?.stack ?? error)}`);
  } finally {
    const harnessFailed = checks.some(line => line.startsWith("FAIL"));
    const exitCode = toolStatus !== 0 ? toolStatus : harnessFailed ? 2 : 0;
    const header = [
      `requested_revision=${revision}`,
      `resolved_commit=${commit}`,
      `resolved_tree=${tree}`,
      `mode=${mode}`,
      `suffix=${suffix}`,
      `command=XAI_DEPS_ROOT=${dependencyRoot} node ${owned}/verify-packages.mjs ${revision} ${modeArgument} ${suffix}`,
      `output_dir=${outputDir === evidence ? owned : `${outputDir} (redirected; not evidence)`}`,
      `runner_checkout_head=${runnerHead}`,
      `runner_sha256=${runnerHash}`,
      `node=${process.version} platform=${process.platform}-${process.arch} tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      `dependency_root=${dependencyRoot}`,
      `expected_lockfile_sha256=${EXPECTED_LOCK_SHA256}`,
      `dependency_lockfile_sha256=${dependencyLockHash}`,
      `archive_lockfile_sha256=${archiveLockHash}`,
      ...headerExtra,
      `tool_exit=${toolStatus}${result?.signal ? ` signal=${result.signal}` : ""}${result?.error ? ` spawn_error=${result.error.message}` : ""}`,
      `harness_checks=${harnessFailed ? "FAIL" : "PASS"} (${checks.filter(line => line.startsWith("PASS")).length}/${checks.length})`,
      `exit=${exitCode}`,
    ].join("\n");
    const body = `${header}\n---- stdout ----\n${result?.stdout ?? ""}\n---- stderr ----\n${result?.stderr ?? ""}\n---- runner summary ----\n${[...checks.map(line => `harness ${line}`), ...summary].join("\n")}`;
    try {
      if (existsSync(logPath(mode))) throw Error(`Evidence appeared during the run; refusing to overwrite ${logPath(mode)}`);
      writeFileSync(logPath(mode), body.trimEnd() + "\n", { flag: "wx" });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
    console.log(`  ${mode}: exit=${exitCode} harness=${harnessFailed ? "FAIL" : "PASS"} log=${relative(root, logPath(mode))}`);
    for (const line of checks.filter(line => line.startsWith("FAIL"))) console.log(`    ${line}`);
    if (exitCode !== 0 && firstFailure === 0) firstFailure = exitCode;
  }
}
if (firstFailure !== 0) process.exitCode = firstFailure;
