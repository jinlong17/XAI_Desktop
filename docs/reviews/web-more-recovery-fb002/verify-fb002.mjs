/**
 * F-B002 runner (control-plane batch 31): the More Sol `boundaries` oracle, as the frozen original or as the corrected
 * copy, at one revision, either the full file or case 002 alone. One invocation = one Vitest run = one log.
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals the revision's> \
 *     node docs/reviews/web-more-recovery-fb002/verify-fb002.mjs <revision> <corrected|original> <full|case002> <suffix>
 *
 * Conventions are those of docs/reviews/web-features-recovery-final/verify-callers.mjs, mode more-boundaries (runner
 * SHA-256 7e1aa8b2…, not modified and not imported): root = archive, globals, jsdom, setupFiles
 * [packages/plugin-web-settings-rest/vitest.setup.ts], esbuild jsx automatic, default timeouts, no console filter, the
 * settings-rest Vitest binary of the dependency checkout. Differences: the oracle choice and the case-002 filter below,
 * and the log location (this directory's logs/).
 *
 * - Expands `git archive <revision>` into a fresh temporary directory (realpath) and gates on SHA-256 equality of
 *   XAI_DEPS_ROOT/pnpm-lock.yaml, `git show <revision>:pnpm-lock.yaml`, the extracted lockfile and the batch lockfile
 *   constant. A mismatch writes a BLOCKED log, runs nothing and exits 3.
 * - Stages the six frozen More Sol files (fixture + five oracles) from this checkout into the archive at their own
 *   docs/reviews path, exactly as the older runners did. Oracle `original` runs the frozen
 *   docs/reviews/web-more-recovery-sol/boundaries.test.tsx there. Oracle `corrected` additionally stages
 *   docs/reviews/web-more-recovery-fb002/boundaries.corrected.test.tsx at its own path and a byte copy of the frozen
 *   fixture beside it (docs/reviews/web-more-recovery-fb002/fixture.tsx, temporary run directory only), so the
 *   corrected oracle's unchanged `./fixture` import resolves to the frozen fixture bytes. Every staged file's hash is
 *   checked against this checkout and against the frozen constants; the fixture hash is recorded in every log.
 * - Scope `case002` adds `--testNamePattern <case 002 full name>$`; the other nine cases are skipped by Vitest.
 * - Private node_modules: third-party links from the dependency checkout (never its @repo links or caches), @repo
 *   links to the archive's own package folders, and docs/node_modules links to the single react, react-dom,
 *   @testing-library/react and react-router instances. Exact-match aliases map every archive packages/* export to the
 *   archive file; a guard plugin fails the run if a module is transformed from the dependency checkout's or this
 *   checkout's packages/, apps/ or docs/, or if an unaliased @repo import resolves outside the archive, and records
 *   every archive module.
 * - Writes logs/<oracle>-<scope>-<suffix>-<revision>.log beside this file (XAI_FB002_OUTPUT_DIR redirects it, for
 *   development smoke runs only), refusing to overwrite. Exit status: the Vitest status if nonzero; 2 if Vitest exited
 *   0 but a harness check failed; 3 if the lockfile gate blocked the run. Nothing is written into the dependency
 *   checkout.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { loadavg, tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const evidence = fileURLToPath(new URL("./logs/", import.meta.url));
const runnerFile = fileURLToPath(import.meta.url);
const owned = "docs/reviews/web-more-recovery-fb002";
const checkoutRoot = realpathSync(root);
const dependencyRoot = realpathSync(resolve(process.env.XAI_DEPS_ROOT ?? root));
const redirected = Boolean(process.env.XAI_FB002_OUTPUT_DIR);
const [revision, oracle, scope, suffix, ...extra] = process.argv.slice(2);
if (!revision || !oracle || !scope || !suffix || extra.length) throw Error("Usage: node verify-fb002.mjs <revision> <corrected|original> <full|case002> <suffix>");
if (!/^[A-Za-z0-9._-]+$/.test(revision)) throw Error(`Unsafe revision: ${revision}`);
if (!/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error(`Unsafe suffix: ${suffix}`);
if (!["corrected", "original"].includes(oracle)) throw Error(`Unsupported oracle ${oracle}; use corrected or original`);
if (!["full", "case002"].includes(scope)) throw Error(`Unsupported scope ${scope}; use full or case002`);
if (!redirected) mkdirSync(evidence, { recursive: true });
const outputDir = redirected ? realpathSync(resolve(process.env.XAI_FB002_OUTPUT_DIR)) : realpathSync(evidence);

const EXPECTED_LOCK_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const MORE_SOL = "docs/reviews/web-more-recovery-sol";
const FROZEN_ORACLE = `${MORE_SOL}/boundaries.test.tsx`;
const FROZEN_FIXTURE = `${MORE_SOL}/fixture.tsx`;
const CORRECTED_ORACLE = `${owned}/boundaries.corrected.test.tsx`;
const CORRECTED_FIXTURE_STAGE = `${owned}/fixture.tsx`;
const FROZEN_ORACLE_SHA256 = "dcbaf57e55f7e907660abacaf233de83dcf769da97b878a9036e358a3dd8ef3e";
const FROZEN_FIXTURE_SHA256 = "b117d2044850cbea822367a0f2bbe9a326e27e4c9b5e5537427b5e0b37b87928";
const CORRECTED_ORACLE_SHA256 = "2e88c1db3e4045ef44c856b86b23f61322ca5002a45062f80a494cb3ac5e50f8";
const MORE_SOL_COPIES = ["fixture.tsx", "fields.test.tsx", "reset.test.tsx", "queues.test.tsx", "boundaries.test.tsx", "owner-export.test.tsx"].map(file => `${MORE_SOL}/${file}`);
const REST = "packages/plugin-web-settings-rest";
const REST_SETUP = `${REST}/vitest.setup.ts`;
const LOCK_FIXTURE = "docs/reviews/web-board-workspace-astra-review/named-lock-fixture.ts";
const PRODUCT = [`${REST}/src/panes/morePane.tsx`, "packages/plugin-web-storage/src/internal/accountScope.ts", "packages/plugin-web-storage/src/internal/prefMutation.ts"];
const CASE_COUNT = 10;
const CASE002 = "invalid and unavailable sources retain requested reset intents without purging raw bytes";

const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// End-anchored: Vitest matches the pattern against the task's full name; no other case name ends with this text, and
// the harness check below requires that exactly this one case executed.
const CASE002_PATTERN = `${escapeRegExp(CASE002)}$`;
const include = oracle === "corrected" ? CORRECTED_ORACLE : FROZEN_ORACLE;
const fixtureBeside = oracle === "corrected" ? CORRECTED_FIXTURE_STAGE : FROZEN_FIXTURE;
const expectedOracleHash = oracle === "corrected" ? CORRECTED_ORACLE_SHA256 : FROZEN_ORACLE_SHA256;
const provenance = [...PRODUCT, LOCK_FIXTURE, fixtureBeside, include];
const logPath = join(outputDir, `${oracle}-${scope}-${suffix}-${revision}.log`);
if (existsSync(logPath)) throw Error(`Evidence exists; use a new suffix: ${logPath}`);

const sha256 = data => createHash("sha256").update(data).digest("hex");
const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
const commit = git(["rev-parse", "--verify", `${revision}^{commit}`]);
const tree = git(["rev-parse", `${commit}^{tree}`]);
const runnerHead = git(["rev-parse", "HEAD"]);
const runnerHash = sha256(readFileSync(runnerFile));
const checkoutHash = file => (existsSync(join(root, file)) ? sha256(readFileSync(join(root, file))) : "absent");
const versionOf = file => { try { return JSON.parse(readFileSync(file, "utf8")).version; } catch { return "unknown"; } };
const strip = text => String(text ?? "").replace(/\u001b\[[0-9;]*m/g, "");
const FORBIDDEN = [...new Set([dependencyRoot, checkoutRoot])].flatMap(base => ["packages", "apps", "docs"].map(folder => join(base, folder)));

// Frozen inputs in this checkout must be exactly the batch-31 constants before anything runs.
assert.equal(checkoutHash(FROZEN_ORACLE), FROZEN_ORACLE_SHA256, "Frozen oracle in this checkout differs from its frozen hash");
assert.equal(checkoutHash(FROZEN_FIXTURE), FROZEN_FIXTURE_SHA256, "Frozen fixture in this checkout differs from its frozen hash");
assert.equal(checkoutHash(CORRECTED_ORACLE), CORRECTED_ORACLE_SHA256, "Corrected oracle in this checkout differs from its recorded hash");
assert(existsSync(join(dependencyRoot, "node_modules")), "Dependency tree missing; set XAI_DEPS_ROOT to a checkout with installed node_modules");
const dependencyLockHash = sha256(readFileSync(join(dependencyRoot, "pnpm-lock.yaml")));
const archiveLockHash = sha256(execFileSync("git", ["show", `${commit}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 256 * 1024 * 1024 }));
const startedAt = new Date();
const loadAtStart = loadavg().map(value => value.toFixed(2)).join(" ");

const CONFIG_SOURCE = `import { appendFileSync } from "node:fs";

const settings = __SETTINGS__;
const record = line => appendFileSync(settings.pinLog, line + "\\n");
const inside = (file, folder) => file === folder || file.startsWith(folder + "/");
const guard = {
  name: "fb002-pin-guard",
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

// Failure blocks of the default/verbose reporter (stdout + stderr): " FAIL  <file> > <name>", the first error line,
// the first frame in the oracle file.
function failureBlocks(output) {
  const blocks = new Map();
  for (const block of output.split(/\n(?= FAIL {2})/).slice(1)) {
    const lines = block.split("\n");
    const header = /^ FAIL {2}(\S+) > (.*)$/.exec(lines[0]);
    if (!header) continue;
    const error = lines.find(line => /^[A-Za-z]*(Error|Exception)\b|^[A-Za-z]+Error:/.test(line)) ?? "(no error line)";
    const frame = lines.map(line => line.trim()).find(line => line.startsWith("❯ ") && line.includes(`${header[1]}:`));
    const location = frame ? (/(\S+:\d+:\d+)$/.exec(frame)?.[1] ?? frame) : "(no oracle frame)";
    if (!blocks.has(header[2])) blocks.set(header[2], { error: error.trim(), location, frame: frame ?? "" });
  }
  return blocks;
}

const checks = [];
const check = (label, ok) => { checks.push(`${ok ? "PASS" : "FAIL"} ${label}`); return ok; };
let vitestStatus = 1;
let result = null;
let blocked = "";
const headerExtra = [];
const summary = [];
const directory = realpathSync(mkdtempSync(join(tmpdir(), "xai-fb002-")));
try {
  if (dependencyLockHash !== EXPECTED_LOCK_SHA256 || archiveLockHash !== EXPECTED_LOCK_SHA256) {
    blocked = `lockfile gate: dependency=${dependencyLockHash} archive=${archiveLockHash} expected=${EXPECTED_LOCK_SHA256}`;
    throw Error(`BLOCKED ${blocked}`);
  }
  execFileSync("tar", ["-x", "-C", directory], { input: execFileSync("git", ["archive", commit], { cwd: root, maxBuffer: 1024 * 1024 * 1024 }) });
  const extractedLockHash = sha256(readFileSync(join(directory, "pnpm-lock.yaml")));
  headerExtra.push(`extracted_lockfile_sha256=${extractedLockHash}`);
  if (extractedLockHash !== EXPECTED_LOCK_SHA256) { blocked = `extracted lockfile ${extractedLockHash}`; throw Error(`BLOCKED ${blocked}`); }
  const guardDir = join(directory, ".fb002-guard");
  mkdirSync(guardDir, { recursive: true });
  const pinLog = join(guardDir, "pin.log");
  const jsonReport = join(guardDir, "report.json");

  // Staging: the six frozen More Sol files at their own path; for `corrected`, the corrected oracle at its own path and
  // a byte copy of the frozen fixture beside it.
  const fileRecords = [];
  const stage = (from, to) => {
    const target = join(directory, to);
    const archived = existsSync(target) ? sha256(readFileSync(target)) : "absent";
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(join(root, from), target);
    const run = sha256(readFileSync(target));
    check(`staged ${to} equals this checkout's ${from}`, run === checkoutHash(from));
    fileRecords.push(`staged ${to} from=${from} run_sha256=${run} archive_committed=${archived}${archived === "absent" ? " (not in this revision's tree)" : archived === run ? " (same)" : " (DIFFERS)"}`);
  };
  for (const file of MORE_SOL_COPIES) stage(file, file);
  if (oracle === "corrected") { stage(CORRECTED_ORACLE, CORRECTED_ORACLE); stage(FROZEN_FIXTURE, CORRECTED_FIXTURE_STAGE); }
  const oracleRun = sha256(readFileSync(join(directory, include)));
  const fixtureRun = sha256(readFileSync(join(directory, fixtureBeside)));
  check(`oracle run copy ${include} is the ${oracle} oracle (${expectedOracleHash})`, oracleRun === expectedOracleHash);
  check(`fixture beside the oracle (${fixtureBeside}) is byte-identical to the frozen ${FROZEN_FIXTURE} (${FROZEN_FIXTURE_SHA256})`, fixtureRun === FROZEN_FIXTURE_SHA256);
  assert(existsSync(join(directory, LOCK_FIXTURE)), `Archive file missing: ${LOCK_FIXTURE}`);
  const lockRun = sha256(readFileSync(join(directory, LOCK_FIXTURE)));
  fileRecords.push(`archive ${LOCK_FIXTURE} run_sha256=${lockRun} checkout=${checkoutHash(LOCK_FIXTURE)}${lockRun === checkoutHash(LOCK_FIXTURE) ? " (same)" : " (DIFFERS)"}`);
  assert(existsSync(join(directory, include)), `Requested test file missing from the archive: ${include}`);

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
    ["react", join(dependencyRoot, REST, "node_modules/react")],
    ["react-dom", join(dependencyRoot, REST, "node_modules/react-dom")],
    ["@testing-library/react", join(dependencyRoot, REST, "node_modules/@testing-library/react")],
    ["react-router", join(dependencyRoot, "apps/web/node_modules/react-router")],
  ];
  const oracleLinks = oracleSources.map(([name, source]) => {
    const real = realpathSync(source);
    mkdirSync(dirname(join(docsModules, name)), { recursive: true });
    symlinkSync(real, join(docsModules, name));
    return `${name}->${relative(dependencyRoot, real)}@${versionOf(join(real, "package.json"))}`;
  });
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

  const vitestBin = join(dependencyRoot, REST, "node_modules/.bin/vitest");
  assert(existsSync(vitestBin), `Vitest binary missing at ${vitestBin}`);
  const vitestHome = realpathSync(join(dependencyRoot, REST, "node_modules/vitest"));
  let jsdomVersion = "unknown";
  try { jsdomVersion = versionOf(join(realpathSync(join(dependencyRoot, REST, "node_modules/jsdom")), "package.json")); } catch { jsdomVersion = versionOf(join(vitestHome, "../jsdom/package.json")); }
  const settings = {
    archive: directory, root: directory, cacheDir: join(directory, ".fb002-vite-cache"), forbidden: FORBIDDEN, pinLog,
    setupFiles: [join(directory, REST_SETUP)], include: [include],
    aliases: aliases.map(({ pattern, replacement }) => ({ pattern, replacement })),
  };
  const configFile = join(directory, "fb002.vitest.config.mjs");
  writeFileSync(configFile, CONFIG_SOURCE.replace("__SETTINGS__", JSON.stringify(settings)), { flag: "wx" });
  const args = ["run", "--config", configFile, "--reporter=verbose", "--reporter=json", `--outputFile.json=${jsonReport}`, ...(scope === "case002" ? ["--testNamePattern", CASE002_PATTERN] : [])];
  const productHashes = PRODUCT.map(file => `${file}=${existsSync(join(directory, file)) ? sha256(readFileSync(join(directory, file))) : "absent"}`);
  headerExtra.push(
    `include=${include}`,
    `test_name_pattern=${scope === "case002" ? CASE002_PATTERN : "none (full file)"}`,
    `setup_files=${REST_SETUP}`,
    `oracle_expected_sha256=${expectedOracleHash} oracle_run_sha256=${oracleRun}`,
    `frozen_fixture=${FROZEN_FIXTURE} frozen_fixture_sha256=${FROZEN_FIXTURE_SHA256} fixture_run_path=${fixtureBeside} fixture_run_sha256=${fixtureRun}`,
    ...fileRecords,
    `product_file_sha256 ${productHashes.join(" ")}`,
    `bin=${vitestBin}`,
    `args=${args.join(" ")}`,
    `vitest=${relative(dependencyRoot, vitestHome)}@${versionOf(join(vitestHome, "package.json"))} vite=${versionOf(join(vitestHome, "../vite/package.json"))} jsdom=${jsdomVersion}`,
    `oracle_dependency_links ${oracleLinks.join(" ")}`,
    `node_modules_links third_party=${thirdPartyLinks} workspace=${workspaceLinks}`,
    `tsconfig_extends_checked=${extendsRecord.length} unresolved=${unresolvedExtends.length ? unresolvedExtends.join(" ") : "none"}`,
    `aliases=${aliases.length} exact-match archive export specifiers`,
    `forbidden=${FORBIDDEN.join(",")}`,
  );

  result = spawnSync(vitestBin, args, { cwd: directory, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" } });
  vitestStatus = result.status ?? 1;

  let report = null;
  let reportError = "";
  try { report = JSON.parse(readFileSync(jsonReport, "utf8")); } catch (error) { reportError = String(error?.message ?? error); }
  const output = `${strip(result.stdout)}\n${strip(result.stderr)}`;
  const blocks = failureBlocks(output); // Vitest prints the "Failed Tests" section on stderr.
  const cases = [];
  const perFile = [];
  for (const suite of report?.testResults ?? []) {
    const file = relative(directory, suite.name);
    const tests = suite.assertionResults ?? [];
    const count = status => tests.filter(test => test.status === status).length;
    perFile.push({ file, status: suite.status, total: tests.length, passed: count("passed"), failed: count("failed"), message: strip(suite.message).split("\n")[0] });
    for (const test of tests) {
      const message = strip((test.failureMessages ?? []).join("\n"));
      const name = test.fullName ?? test.title;
      const block = blocks.get(name);
      cases.push({
        file, name, status: test.status,
        first: (message.split("\n").find(line => line.trim()) ?? "").trim().slice(0, 600),
        location: block?.location ?? "",
        rangeError: /RangeError|Maximum call stack size exceeded/.test(message),
      });
    }
  }
  const passed = cases.filter(entry => entry.status === "passed").length;
  const failed = cases.filter(entry => entry.status === "failed").length;
  const skipped = cases.filter(entry => entry.status === "skipped" || entry.status === "pending" || entry.status === "todo").length;
  const executed = cases.filter(entry => entry.status === "passed" || entry.status === "failed");
  const suiteErrors = perFile.filter(entry => entry.status === "failed" && entry.total === 0);
  const unhandled = output.split("\n").filter(line => /Unhandled (Error|Rejection)/.test(line)).length;
  const consoleBlocks = output.split("\n").filter(line => /^(stdout|stderr) \| /.test(line));
  const actWarnings = output.split("\n").filter(line => line.includes("not wrapped in act(")).length;
  const rangeLines = output.split("\n").filter(line => /RangeError|Maximum call stack size exceeded/.test(line)).length;
  const rangeCases = cases.filter(entry => entry.rangeError).length;
  const pinLines = existsSync(pinLog) ? readFileSync(pinLog, "utf8").split("\n").filter(Boolean) : [];
  const configLines = [...new Set(pinLines.filter(line => line.startsWith("config ")))];
  const unaliased = [...new Set(pinLines.filter(line => line.startsWith("unaliased ")))];
  const modules = [...new Set(pinLines.filter(line => line.startsWith("module ")).map(line => line.slice("module ".length)))].sort();
  const byPackage = new Map();
  for (const module of modules) { const key = module.split("/").slice(0, module.startsWith("docs/") ? 3 : 2).join("/"); byPackage.set(key, (byPackage.get(key) ?? 0) + 1); }
  let config = null;
  try { config = configLines.length ? JSON.parse(configLines[0].slice("config ".length)) : null; } catch { config = null; }
  const missingProvenance = provenance.filter(file => !modules.includes(file));
  const reported = perFile.map(entry => entry.file).sort();

  check("JSON report parsed", Boolean(report));
  check("reported test files equal the requested include", JSON.stringify(reported) === JSON.stringify([include]));
  check(`older runner's config in effect (environment jsdom, globals true, setupFiles [${REST_SETUP}], include, root = archive)`,
    config?.environment === "jsdom" && config?.globals === true && JSON.stringify(config?.setupFiles) === JSON.stringify(settings.setupFiles)
      && JSON.stringify(config?.include) === JSON.stringify([include]) && config?.root === directory);
  check("guard plugin active (archive modules recorded)", modules.length > 0);
  check(`required product, helper, fixture and oracle modules loaded from the archive (${provenance.length - missingProvenance.length} of ${provenance.length})`, missingProvenance.length === 0);
  check("no test-file suite error", suiteErrors.length === 0);
  check(`all ${CASE_COUNT} oracle cases reported`, cases.length === CASE_COUNT);
  if (scope === "case002") check(`case 002 alone executed (executed=${executed.length}, skipped=${skipped})`, executed.length === 1 && executed[0]?.name === CASE002 && skipped === CASE_COUNT - 1);
  else check(`full file executed (executed=${executed.length}, skipped=${skipped})`, executed.length === CASE_COUNT && skipped === 0);

  summary.push(
    `json_report=${report ? `success=${report.success} numTotalTestSuites=${report.numTotalTestSuites} numTotalTests=${report.numTotalTests} numPassedTests=${report.numPassedTests} numFailedTests=${report.numFailedTests} numPendingTests=${report.numPendingTests} numTodoTests=${report.numTodoTests}` : `missing (${reportError})`}`,
    `totals cases=${cases.length} passed=${passed} failed=${failed} skipped=${skipped} other=${cases.length - passed - failed - skipped} suite_errors=${suiteErrors.length} unhandled_error_lines=${unhandled} console_blocks=${consoleBlocks.length} act_warning_lines=${actWarnings}`,
    `rangeerror cases=${rangeCases} output_lines=${rangeLines}`,
    `executed_all_passed=${executed.length > 0 && executed.every(entry => entry.status === "passed")}`,
    ...perFile.map(entry => `file ${entry.file} status=${entry.status} tests=${entry.total} passed=${entry.passed} failed=${entry.failed}${entry.message ? ` message=${entry.message}` : ""}`),
    ...cases.map((entry, index) => `case ${String(index + 1).padStart(3, "0")} ${entry.status.toUpperCase()} | ${entry.name}${entry.status === "failed" ? `\n    first: ${entry.first}\n    at: ${entry.location || "(no oracle frame)"}${entry.rangeError ? "\n    rangeerror: yes" : ""}` : ""}`),
    ...consoleBlocks.map(line => `console_block ${line.slice(0, 300)}`),
    `pin_config ${configLines.length ? configLines.map(line => line.slice("config ".length)).join(" | ") : "missing"}`,
    `pin_unaliased_repo_imports=${unaliased.length}${unaliased.length ? ` ${unaliased.join(" | ")}` : ""}`,
    `pin_required_provenance ${provenance.join(" ")}`,
    `pin_required_provenance_missing=${missingProvenance.length ? missingProvenance.join(",") : "none"}`,
    `pin_modules=${modules.length} by package: ${[...byPackage].map(([key, value]) => `${key}=${value}`).join(" ")}`,
  );
  console.log(`${oracle} ${scope} ${revision} ${suffix}: vitest_exit=${vitestStatus} cases=${cases.length} passed=${passed} failed=${failed} skipped=${skipped} rangeerror_cases=${rangeCases} rangeerror_lines=${rangeLines}`);
} catch (error) {
  if (!blocked) check(`runner completed without an exception (${String(error?.stack ?? error).split("\n")[0]})`, false);
  summary.push(`runner_exception ${String(error?.stack ?? error)}`);
} finally {
  const harnessFailed = checks.some(line => line.startsWith("FAIL"));
  const exitCode = blocked ? 3 : vitestStatus !== 0 ? vitestStatus : harnessFailed ? 2 : 0;
  const finishedAt = new Date();
  const header = [
    `requested_revision=${revision}`,
    `resolved_commit=${commit}`,
    `resolved_tree=${tree}`,
    `oracle=${oracle}`,
    `scope=${scope}`,
    `suffix=${suffix}`,
    `command=XAI_DEPS_ROOT=${dependencyRoot} node ${owned}/verify-fb002.mjs ${revision} ${oracle} ${scope} ${suffix}`,
    `output_dir=${redirected ? `${outputDir} (redirected; not evidence)` : `${owned}/logs`}`,
    `runner_checkout_head=${runnerHead}`,
    `runner_sha256=${runnerHash}`,
    `started_at=${startedAt.toISOString()} finished_at=${finishedAt.toISOString()} duration_ms=${finishedAt - startedAt} loadavg_at_start=${loadAtStart}`,
    `node=${process.version} platform=${process.platform}-${process.arch} tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `dependency_root=${dependencyRoot}`,
    `expected_lockfile_sha256=${EXPECTED_LOCK_SHA256}`,
    `dependency_lockfile_sha256=${dependencyLockHash}`,
    `archive_lockfile_sha256=${archiveLockHash}`,
    ...headerExtra,
    ...(blocked ? [`BLOCKED ${blocked} (nothing was run)`] : []),
    `vitest_exit=${blocked ? "not-run" : vitestStatus}${result?.signal ? ` signal=${result.signal}` : ""}${result?.error ? ` spawn_error=${result.error.message}` : ""}`,
    `harness_checks=${harnessFailed ? "FAIL" : "PASS"} (${checks.filter(line => line.startsWith("PASS")).length}/${checks.length})`,
    `exit=${exitCode}`,
  ].join("\n");
  const body = `${header}\n---- stdout ----\n${result?.stdout ?? ""}\n---- stderr ----\n${result?.stderr ?? ""}\n---- runner summary ----\n${[...checks.map(line => `harness ${line}`), ...summary].join("\n")}`;
  try {
    if (existsSync(logPath)) throw Error(`Evidence appeared during the run; refusing to overwrite ${logPath}`);
    writeFileSync(logPath, body.trimEnd() + "\n", { flag: "wx" });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  console.log(`  exit=${exitCode} harness=${harnessFailed ? "FAIL" : "PASS"} log=${relative(root, logPath)}`);
  for (const line of checks.filter(line => line.startsWith("FAIL"))) console.log(`    ${line}`);
  process.exitCode = exitCode;
}
