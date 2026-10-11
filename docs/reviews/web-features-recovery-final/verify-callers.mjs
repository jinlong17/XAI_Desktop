/**
 * Final-regression accepted-caller runner for CP-FEATURES-01 (control-plane batch 30; contract
 * docs/reviews/web-features-recovery-contract/contract.md §13 row 8, §14 E24).
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals the revision's> \
 *     node docs/reviews/web-features-recovery-final/verify-callers.mjs <revision> <mode|all> <suffix>
 *
 * Why this runner exists: the accepted More, Notifications and Date & Time suites were last run by older runners
 * (web-more-recovery-sol, web-more-recovery-independent, web-notifications-recovery-{sol,astra,independent}
 * verify-fixed.mjs). Those runners link node_modules from their own checkout root, have no lockfile gate, never
 * read XAI_DEPS_ROOT and have no module guard, so they cannot meet the batch-30 execution rules in a checkout
 * without its own install. This runner executes the same oracle files with the same Vitest semantics as those
 * runners (root = archive, globals true, environment jsdom, the same setupFiles and include per suite, esbuild
 * jsx automatic, default timeouts, no console filtering, the same Vitest binary package) and adds the archive
 * conventions. It does not modify or replace the older runners.
 *
 * - Expands `git archive <revision>` into a fresh temporary directory per mode (realpath) and gates on SHA-256
 *   equality of XAI_DEPS_ROOT/pnpm-lock.yaml (default: this repository root), `git show <revision>:pnpm-lock.yaml`,
 *   the extracted lockfile and the contract lockfile hash.
 * - Copies each suite's oracle files from this checkout into the archive at the same docs/reviews path, exactly as
 *   the older runner did, and verifies the copies; helper files the oracles import from other docs/reviews folders
 *   are used from the archive, as before. Every oracle and helper hash is recorded for the checkout copy, the
 *   archive's committed copy and the file actually run.
 * - Private node_modules directories as in the Features Sol runner: third-party links from the dependency checkout
 *   (never its @repo links or caches), @repo links to the archive's own package folders, and docs/node_modules
 *   links to the single react, react-dom, @testing-library/react and react-router instances the older runner
 *   aliased. Exact-match aliases map every archive packages/* export to the archive file; a guard plugin fails the
 *   run if a module is transformed from the dependency checkout's or this checkout's packages/, apps/ or docs/, or
 *   if an unaliased @repo import resolves outside the archive, and records every archive module.
 * - Writes <mode>-<suffix>-<revision>.log beside this file (XAI_FINAL_OUTPUT_DIR redirects it, for development
 *   smoke runs only), refusing to overwrite. Exit status: the first nonzero Vitest status; 2 if Vitest exited 0
 *   but a harness check failed. Nothing is written into the dependency checkout.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const runnerFile = fileURLToPath(import.meta.url);
const owned = "docs/reviews/web-features-recovery-final";
const checkoutRoot = realpathSync(root);
const dependencyRoot = realpathSync(resolve(process.env.XAI_DEPS_ROOT ?? root));
const outputDir = process.env.XAI_FINAL_OUTPUT_DIR ? realpathSync(resolve(process.env.XAI_FINAL_OUTPUT_DIR)) : evidence;
const [revision, modeArgument, suffix, ...extra] = process.argv.slice(2);
if (!revision || !modeArgument || !suffix || extra.length) throw Error("Usage: node verify-callers.mjs <revision> <mode|all> <suffix>");
if (!/^[A-Za-z0-9._-]+$/.test(revision)) throw Error(`Unsafe revision: ${revision}`);
if (!/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error(`Unsafe suffix: ${suffix}`);

const EXPECTED_LOCK_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const REST = "packages/plugin-web-settings-rest";
const REST_SETUP = `${REST}/vitest.setup.ts`;
const WORKSPACES_PKG = "packages/plugin-web-board-workspaces";
const MORE_SOL = "docs/reviews/web-more-recovery-sol";
const MORE_HOST = "docs/reviews/web-more-recovery-independent";
const NOTIF_SOL = "docs/reviews/web-notifications-recovery-sol";
const NOTIF_ASTRA = "docs/reviews/web-notifications-recovery-astra";
const NOTIF_PARENT = "docs/reviews/web-notifications-recovery-independent";
const LOCK_FIXTURE = "docs/reviews/web-board-workspace-astra-review/named-lock-fixture.ts";
const DT_SOL_FIXTURE = "docs/reviews/web-date-time-recovery-sol/fixture.tsx";
const DT_ORACLE = "docs/reviews/web-date-time-recovery-astra/caller-boundaries.test.tsx";
const HOST_MODULES = ["apps/web/src/routes/modules/composedSettingsRegistration.tsx", "apps/web/src/routes/modules/departureCoordinator.tsx", "apps/web/src/routes/modules/settingsDeparture.ts", "apps/web/src/routes/modules/shellRegistrations.tsx"];
const ENGINE = "packages/plugin-web-storage/src/internal/prefMutation.ts";

// Suites and the older runner each one reproduces (source runner, copied files, include, setupFiles, Vitest package,
// react/@testing-library/react package and whether react-router was aliased to apps/web), with the accepted count.
const MORE_SOL_COPIES = ["fixture.tsx", "fields.test.tsx", "reset.test.tsx", "queues.test.tsx", "boundaries.test.tsx", "owner-export.test.tsx"].map(file => `${MORE_SOL}/${file}`);
const NOTIF_SOL_COPIES = ["fixture.tsx", "core.test.tsx", "recovery.test.tsx", "operations.test.tsx", "boundaries.test.tsx", "extended.test.tsx"].map(file => `${NOTIF_SOL}/${file}`);
const NOTIF_ASTRA_COPIES = ["fixture.tsx", "boundaries.test.tsx", "host.test.tsx"].map(file => `${NOTIF_ASTRA}/${file}`);
const moreSol = (name, file, accepted) => ({
  source: `${MORE_SOL}/verify-fixed.mjs mode ${name}`, copies: MORE_SOL_COPIES, include: [file], setupFiles: [REST_SETUP], vitestPackage: REST, reactPackage: REST, routerAlias: false, accepted,
  provenance: [`${REST}/src/panes/morePane.tsx`, ENGINE, LOCK_FIXTURE],
});
const notifSol = (name, file, accepted, provenance) => ({
  source: `${NOTIF_SOL}/verify-fixed.mjs mode ${name}`, copies: NOTIF_SOL_COPIES, include: [file], setupFiles: [REST_SETUP], vitestPackage: REST, reactPackage: REST, routerAlias: false, accepted, provenance,
});
const MODES = {
  "more-fields": moreSol("fields", `${MORE_SOL}/fields.test.tsx`, 22),
  "more-reset": moreSol("reset", `${MORE_SOL}/reset.test.tsx`, 20),
  "more-queues": moreSol("queues", `${MORE_SOL}/queues.test.tsx`, 14),
  "more-boundaries": moreSol("boundaries", `${MORE_SOL}/boundaries.test.tsx`, 10),
  "more-owner-export": moreSol("owner-export", `${MORE_SOL}/owner-export.test.tsx`, 13),
  "more-original": { ...moreSol("original", `${REST}/src/__tests__/morePane.test.tsx`, 15), provenance: [`${REST}/src/panes/morePane.tsx`] },
  "more-host": {
    source: `${MORE_HOST}/verify-fixed.mjs mode host`, copies: [`${MORE_HOST}/host.test.tsx`], include: [`${MORE_HOST}/host.test.tsx`], setupFiles: [],
    vitestPackage: WORKSPACES_PKG, reactPackage: WORKSPACES_PKG, routerAlias: true, accepted: 11, provenance: [`${REST}/src/panes/morePane.tsx`, ...HOST_MODULES, LOCK_FIXTURE],
  },
  "notifications-core": notifSol("core", `${NOTIF_SOL}/core.test.tsx`, 11, [`${REST}/src/panes/notificationsPane.tsx`, ENGINE, LOCK_FIXTURE]),
  "notifications-recovery": notifSol("recovery", `${NOTIF_SOL}/recovery.test.tsx`, 3, [`${REST}/src/panes/notificationsPane.tsx`, ENGINE, LOCK_FIXTURE]),
  "notifications-operations": notifSol("operations", `${NOTIF_SOL}/operations.test.tsx`, 2, [`${REST}/src/panes/notificationsPane.tsx`, ENGINE, LOCK_FIXTURE]),
  "notifications-boundaries": notifSol("boundaries", `${NOTIF_SOL}/boundaries.test.tsx`, 4, [`${REST}/src/panes/notificationsPane.tsx`, ENGINE, LOCK_FIXTURE]),
  "notifications-extended": notifSol("extended", `${NOTIF_SOL}/extended.test.tsx`, 10, [`${REST}/src/panes/notificationsPane.tsx`, ENGINE, LOCK_FIXTURE]),
  "notifications-original": notifSol("original", `${REST}/src/__tests__/notificationsPane.test.tsx`, 11, [`${REST}/src/panes/notificationsPane.tsx`]),
  "notifications-astra-boundaries": {
    source: `${NOTIF_ASTRA}/verify-fixed.mjs mode boundaries`, copies: NOTIF_ASTRA_COPIES, include: [`${NOTIF_ASTRA}/boundaries.test.tsx`], setupFiles: [REST_SETUP],
    vitestPackage: REST, reactPackage: REST, routerAlias: true, accepted: 24, provenance: [`${REST}/src/panes/notificationsPane.tsx`, ENGINE, LOCK_FIXTURE],
  },
  "notifications-astra-host": {
    source: `${NOTIF_ASTRA}/verify-fixed.mjs mode host`, copies: NOTIF_ASTRA_COPIES, include: [`${NOTIF_ASTRA}/host.test.tsx`], setupFiles: [],
    vitestPackage: REST, reactPackage: REST, routerAlias: true, accepted: 15, provenance: [`${REST}/src/panes/notificationsPane.tsx`, ...HOST_MODULES, LOCK_FIXTURE],
  },
  "notifications-parent-host": {
    source: `${NOTIF_PARENT}/verify-fixed.mjs mode host`, copies: [`${NOTIF_PARENT}/host.test.tsx`], include: [`${NOTIF_PARENT}/host.test.tsx`], setupFiles: [],
    vitestPackage: WORKSPACES_PKG, reactPackage: WORKSPACES_PKG, routerAlias: true, accepted: 12, provenance: [`${REST}/src/panes/notificationsPane.tsx`, ...HOST_MODULES, LOCK_FIXTURE],
  },
  datetime: {
    source: `${NOTIF_ASTRA}/verify-fixed.mjs mode datetime (oracle read from the archive)`, copies: NOTIF_ASTRA_COPIES, include: [DT_ORACLE], setupFiles: [REST_SETUP],
    vitestPackage: REST, reactPackage: REST, routerAlias: true, accepted: 7, provenance: [`${REST}/src/panes/dateTimePane.tsx`, ENGINE, LOCK_FIXTURE, DT_SOL_FIXTURE],
    archiveFiles: [DT_ORACLE, DT_SOL_FIXTURE],
  },
};
const HELPERS = [LOCK_FIXTURE, DT_SOL_FIXTURE, DT_ORACLE];
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
const strip = text => String(text ?? "").replace(/\u001b\[[0-9;]*m/g, "");
const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const checkoutHash = file => (existsSync(join(root, file)) ? sha256(readFileSync(join(root, file))) : "absent");

const CONFIG_SOURCE = `import { appendFileSync } from "node:fs";

const settings = __SETTINGS__;
const record = line => appendFileSync(settings.pinLog, line + "\\n");
const inside = (file, folder) => file === folder || file.startsWith(folder + "/");
const guard = {
  name: "features-final-caller-pin-guard",
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

// The older runner's config (root = archive, jsdom, globals, setupFiles, include, esbuild jsx automatic, default
// timeouts, no console filter) plus cacheDir, exact-match aliases and the guard.
export default {
  root: settings.root,
  cacheDir: settings.cacheDir,
  resolve: { alias: settings.aliases.map(({ pattern, replacement }) => ({ find: new RegExp(pattern), replacement })) },
  plugins: [guard],
  esbuild: { jsx: "automatic" },
  test: { globals: true, environment: "jsdom", setupFiles: settings.setupFiles, include: settings.include },
};
`;

let firstFailure = 0;
for (const mode of selected) {
  const spec = MODES[mode];
  const directory = realpathSync(mkdtempSync(join(tmpdir(), "xai-features-final-caller-")));
  const guardDir = join(directory, ".final-guard");
  const pinLog = join(guardDir, `pin-${mode}.log`);
  const jsonReport = join(guardDir, `report-${mode}.json`);
  const checks = [];
  const check = (label, ok) => { checks.push(`${ok ? "PASS" : "FAIL"} ${label}`); return ok; };
  let vitestStatus = 1;
  let result = null;
  const headerExtra = [];
  const summary = [];
  try {
    execFileSync("tar", ["-x", "-C", directory], { input: execFileSync("git", ["archive", commit], { cwd: root, maxBuffer: 1024 * 1024 * 1024 }) });
    assert.equal(sha256(readFileSync(join(directory, "pnpm-lock.yaml"))), EXPECTED_LOCK_SHA256, "Extracted lockfile differs from the contract lockfile");
    mkdirSync(guardDir, { recursive: true });

    // Oracle copies (as the older runner did) and helper files used from the archive.
    const fileRecords = [];
    for (const file of spec.copies) {
      const archived = existsSync(join(directory, file)) ? sha256(readFileSync(join(directory, file))) : "absent";
      const source = join(root, file);
      assert(existsSync(source), `Oracle missing from this checkout: ${file}`);
      mkdirSync(dirname(join(directory, file)), { recursive: true });
      copyFileSync(source, join(directory, file));
      const run = sha256(readFileSync(join(directory, file)));
      check(`copied oracle equals this checkout's file: ${file}`, run === checkoutHash(file));
      fileRecords.push(`copied ${file} run=${run} archive_committed=${archived}${archived === run ? " (same)" : " (DIFFERS)"}`);
    }
    for (const file of [...new Set([...(spec.archiveFiles ?? []), ...HELPERS.filter(helper => spec.provenance.includes(helper))])]) {
      assert(existsSync(join(directory, file)), `Archive file missing: ${file}`);
      const run = sha256(readFileSync(join(directory, file)));
      fileRecords.push(`archive ${file} run=${run} checkout=${checkoutHash(file)}${run === checkoutHash(file) ? " (same)" : " (DIFFERS)"}`);
    }
    for (const file of spec.include) assert(existsSync(join(directory, file)), `Requested test file missing from the archive: ${file}`);

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
    linkThirdParty(join(dependencyRoot, "node_modules"), join(directory, "node_modules"));
    linkWorkspace(JSON.parse(readFileSync(join(directory, "package.json"), "utf8")), join(directory, "node_modules"));
    for (const [, entry] of workspace) {
      const target = join(entry.folder, "node_modules");
      linkThirdParty(join(dependencyRoot, entry.rel, "node_modules"), target);
      linkWorkspace(entry.pkg, target);
    }
    // docs/node_modules: the single instances the older runner aliased for the oracle files.
    const docsModules = join(directory, "docs/node_modules");
    const oracleSources = [
      ["react", join(dependencyRoot, spec.reactPackage, "node_modules/react")],
      ["react-dom", join(dependencyRoot, spec.reactPackage, "node_modules/react-dom")],
      ["@testing-library/react", join(dependencyRoot, spec.reactPackage, "node_modules/@testing-library/react")],
      ["react-router", join(dependencyRoot, "apps/web/node_modules/react-router")],
    ];
    const oracleLinks = oracleSources.map(([name, source]) => {
      const real = realpathSync(source);
      mkdirSync(dirname(join(docsModules, name)), { recursive: true });
      symlinkSync(real, join(docsModules, name));
      return `${name}->${relative(dependencyRoot, real)}@${versionOf(join(real, "package.json"))}`;
    });
    // One instance each across the archive packages that import them (the older runner forced it by alias).
    const instanceCheck = ["react", "react-router", "@testing-library/react"].map(name => {
      const reals = new Set();
      for (const [, entry] of workspace) { try { reals.add(realpathSync(join(entry.folder, "node_modules", name))); } catch { /* not a dependency */ } }
      reals.add(realpathSync(join(docsModules, name)));
      return [name, reals.size];
    });
    check(`single react, react-router and @testing-library/react instance across the archive and the oracle links (${instanceCheck.map(([name, size]) => `${name}=${size}`).join(" ")})`, instanceCheck.every(([, size]) => size === 1));

    // tsconfig `extends` of every workspace package must resolve inside the archive.
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

    const vitestBin = join(dependencyRoot, spec.vitestPackage, "node_modules/.bin/vitest");
    assert(existsSync(vitestBin), `Vitest binary missing at ${vitestBin}`);
    const vitestHome = realpathSync(join(dependencyRoot, spec.vitestPackage, "node_modules/vitest"));
    let jsdomVersion = "unknown";
    try { jsdomVersion = versionOf(join(realpathSync(join(dependencyRoot, spec.vitestPackage, "node_modules/jsdom")), "package.json")); } catch { jsdomVersion = versionOf(join(vitestHome, "../jsdom/package.json")); }
    const settings = {
      archive: directory, root: directory, cacheDir: join(directory, ".final-vite-cache"), forbidden: FORBIDDEN, pinLog,
      setupFiles: spec.setupFiles.map(file => join(directory, file)), include: spec.include,
      aliases: aliases.map(({ pattern, replacement }) => ({ pattern, replacement })),
    };
    const configFile = join(directory, `final-${mode}.vitest.config.mjs`);
    writeFileSync(configFile, CONFIG_SOURCE.replace("__SETTINGS__", JSON.stringify(settings)), { flag: "wx" });
    const args = ["run", "--config", configFile, "--reporter=verbose", "--reporter=json", `--outputFile.json=${jsonReport}`];
    const presentProvenance = spec.provenance.filter(file => existsSync(join(directory, file)));
    const productHashes = [...new Set(spec.provenance)].filter(file => !file.startsWith("docs/")).map(file => `${file}=${existsSync(join(directory, file)) ? sha256(readFileSync(join(directory, file))) : "absent"}`);
    headerExtra.push(
      `reproduces=${spec.source}`,
      `include=${spec.include.join(",")}`,
      `setup_files=${spec.setupFiles.join(",") || "none"}`,
      ...fileRecords,
      `product_file_sha256 ${productHashes.join(" ")}`,
      `bin=${vitestBin}`,
      `args=${args.join(" ")}`,
      `vitest=${relative(dependencyRoot, vitestHome)}@${versionOf(join(vitestHome, "package.json"))} vite=${versionOf(join(vitestHome, "../vite/package.json"))} jsdom=${jsdomVersion}`,
      `oracle_dependency_links ${oracleLinks.join(" ")} (react/@testing-library/react from ${spec.reactPackage}${spec.routerAlias ? "; react-router as aliased by the older runner" : "; react-router linked for completeness, not aliased by the older runner"})`,
      `node_modules_links third_party=${thirdPartyLinks} workspace=${workspaceLinks}`,
      `tsconfig_extends_checked=${extendsRecord.length} unresolved=${unresolvedExtends.length ? unresolvedExtends.join(" ") : "none"}`,
      `aliases=${aliases.length} exact-match archive export specifiers`,
      `forbidden=${FORBIDDEN.join(",")}`,
      `accepted_count=${spec.accepted}`,
    );

    result = spawnSync(vitestBin, args, { cwd: directory, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" } });
    vitestStatus = result.status ?? 1;

    let report = null;
    let reportError = "";
    try { report = JSON.parse(readFileSync(jsonReport, "utf8")); } catch (error) { reportError = String(error?.message ?? error); }
    const cases = [];
    const perFile = [];
    for (const suite of report?.testResults ?? []) {
      const file = relative(directory, suite.name);
      const tests = suite.assertionResults ?? [];
      const count = status => tests.filter(test => test.status === status).length;
      perFile.push({ file, status: suite.status, total: tests.length, passed: count("passed"), failed: count("failed"), message: strip(suite.message).split("\n")[0] });
      for (const test of tests) {
        const message = strip((test.failureMessages ?? [])[0] ?? "");
        cases.push({ file, name: test.fullName ?? test.title, status: test.status, first: (message.split("\n").find(line => line.trim()) ?? "").trim().slice(0, 400) });
      }
    }
    const passed = cases.filter(entry => entry.status === "passed").length;
    const failed = cases.filter(entry => entry.status === "failed").length;
    const suiteErrors = perFile.filter(entry => entry.status === "failed" && entry.total === 0);
    const output = `${strip(result.stdout)}\n${strip(result.stderr)}`;
    const unhandled = output.split("\n").filter(line => /Unhandled (Error|Rejection)/.test(line)).length;
    const consoleBlocks = output.split("\n").filter(line => /^(stdout|stderr) \| /.test(line));
    const actWarnings = output.split("\n").filter(line => line.includes("not wrapped in act(")).length;
    const pinLines = existsSync(pinLog) ? readFileSync(pinLog, "utf8").split("\n").filter(Boolean) : [];
    const configLines = [...new Set(pinLines.filter(line => line.startsWith("config ")))];
    const unaliased = [...new Set(pinLines.filter(line => line.startsWith("unaliased ")))];
    const modules = [...new Set(pinLines.filter(line => line.startsWith("module ")).map(line => line.slice("module ".length)))].sort();
    const byPackage = new Map();
    for (const module of modules) { const key = module.split("/").slice(0, module.startsWith("docs/") ? 3 : 2).join("/"); byPackage.set(key, (byPackage.get(key) ?? 0) + 1); }
    let config = null;
    try { config = configLines.length ? JSON.parse(configLines[0].slice("config ".length)) : null; } catch { config = null; }
    const missingProvenance = presentProvenance.filter(file => !modules.includes(file));
    const reported = perFile.map(entry => entry.file).sort();

    check("JSON report parsed", Boolean(report));
    check("reported test files equal the requested include", JSON.stringify(reported) === JSON.stringify([...spec.include].sort()));
    check(`older runner's config in effect (environment jsdom, globals true, setupFiles [${spec.setupFiles.join(",")}], include, root = archive)`,
      config?.environment === "jsdom" && config?.globals === true && JSON.stringify(config?.setupFiles) === JSON.stringify(settings.setupFiles)
        && JSON.stringify(config?.include) === JSON.stringify(spec.include) && config?.root === directory);
    check("guard plugin active (archive modules recorded)", modules.length > 0);
    check(`required product and helper modules loaded from the archive (${presentProvenance.length} of ${spec.provenance.length})`, missingProvenance.length === 0 && presentProvenance.length === spec.provenance.length);
    check("no test-file suite error", suiteErrors.length === 0);

    summary.push(
      `json_report=${report ? `success=${report.success} numTotalTestSuites=${report.numTotalTestSuites} numTotalTests=${report.numTotalTests} numPassedTests=${report.numPassedTests} numFailedTests=${report.numFailedTests} numPendingTests=${report.numPendingTests} numTodoTests=${report.numTodoTests}` : `missing (${reportError})`}`,
      `totals cases=${cases.length} passed=${passed} failed=${failed} other=${cases.length - passed - failed} suite_errors=${suiteErrors.length} unhandled_error_lines=${unhandled} console_blocks=${consoleBlocks.length} act_warning_lines=${actWarnings}`,
      `accepted_count=${spec.accepted} count_matches_accepted=${cases.length === spec.accepted && passed === spec.accepted}`,
      ...perFile.map(entry => `file ${entry.file} status=${entry.status} tests=${entry.total} passed=${entry.passed} failed=${entry.failed}${entry.message ? ` message=${entry.message}` : ""}`),
      ...cases.map((entry, index) => `case ${String(index + 1).padStart(3, "0")} ${entry.status.toUpperCase()} | ${entry.name}${entry.status === "failed" ? `\n    first: ${entry.first}` : ""}`),
      ...consoleBlocks.map(line => `console_block ${line.slice(0, 300)}`),
      `pin_config ${configLines.length ? configLines.map(line => line.slice("config ".length)).join(" | ") : "missing"}`,
      `pin_unaliased_repo_imports=${unaliased.length}${unaliased.length ? ` ${unaliased.join(" | ")}` : ""}`,
      `pin_required_provenance ${spec.provenance.join(" ")}`,
      `pin_required_provenance_missing=${missingProvenance.length ? missingProvenance.join(",") : "none"}`,
      `pin_modules=${modules.length} by package: ${[...byPackage].map(([key, value]) => `${key}=${value}`).join(" ")}`,
    );
    console.log(`${mode} ${revision}: vitest_exit=${vitestStatus} cases=${cases.length} passed=${passed} failed=${failed} accepted=${spec.accepted}`);
  } catch (error) {
    check(`runner completed without an exception (${String(error?.stack ?? error).split("\n")[0]})`, false);
    summary.push(`runner_exception ${String(error?.stack ?? error)}`);
  } finally {
    const harnessFailed = checks.some(line => line.startsWith("FAIL"));
    const exitCode = vitestStatus !== 0 ? vitestStatus : harnessFailed ? 2 : 0;
    const header = [
      `requested_revision=${revision}`,
      `resolved_commit=${commit}`,
      `resolved_tree=${tree}`,
      `mode=${mode}`,
      `suffix=${suffix}`,
      `command=XAI_DEPS_ROOT=${dependencyRoot} node ${owned}/verify-callers.mjs ${revision} ${modeArgument} ${suffix}`,
      `output_dir=${outputDir === evidence ? owned : `${outputDir} (redirected; not evidence)`}`,
      `runner_checkout_head=${runnerHead}`,
      `runner_sha256=${runnerHash}`,
      `node=${process.version} platform=${process.platform}-${process.arch} tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      `dependency_root=${dependencyRoot}`,
      `expected_lockfile_sha256=${EXPECTED_LOCK_SHA256}`,
      `dependency_lockfile_sha256=${dependencyLockHash}`,
      `archive_lockfile_sha256=${archiveLockHash}`,
      ...headerExtra,
      `vitest_exit=${vitestStatus}${result?.signal ? ` signal=${result.signal}` : ""}${result?.error ? ` spawn_error=${result.error.message}` : ""}`,
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
