/**
 * Parent-role immutable-archive runner: Dashboard Clock (`xai_clock_style`, `xai_clock_tz`) production-App jsdom host
 * oracles (CP-CLOCK-01, control-plane batch 69; contract docs/reviews/web-dashboard-clock-recovery-contract/contract.md
 * r2, sections 9 host rows a-q, 12 "Parent host baseline" and 14 items E3 and E8). Derived from the accepted AppRail
 * parent runner (../web-apprail-order-recovery-independent/verify-fixed.mjs, 646bf047...): same lockfile gate, pin,
 * guard, refusal and exit-code design. Changes: the owned directory, the provenance list, the contract source table
 * (the 50-row r2 header table), labels and temp/config names, and contract r2 section 12 rule 7: the archive is
 * STREAMED from a spawned `git archive` into `tar -x` (no fixed buffer; the pattern of
 * ../web-dashboard-clock-recovery-sol/verify-fixed.mjs), with its byte count and SHA-256 recorded in the log. The
 * runner also asserts the contract r2 file hash at the runner checkout and records the product-tree delta between the
 * revision and the runner HEAD.
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals the revision's> \
 *     node docs/reviews/web-dashboard-clock-recovery-independent/verify-fixed.mjs <revision> host <suffix>
 *
 * One mode, `host`: ./host.test.tsx (with ./host-fixture.tsx) against the production `App` composition: the production
 * route table in the main.tsx module order, rendered through a fresh memory data router per mount, with only the
 * auth-session hook substituted.
 *
 * - Streams `git archive <resolved commit>` into `tar -x` in a fresh temporary directory (realpath), counting and
 *   hashing the streamed bytes, and gates on SHA-256 equality of XAI_DEPS_ROOT/pnpm-lock.yaml (default: this
 *   repository root), `git show <revision>:pnpm-lock.yaml` and the extracted lockfile; all three must also equal the
 *   contract's lockfile gate.
 * - Copies only the two oracle files into docs/reviews/web-dashboard-clock-recovery-independent/ inside the archive and
 *   verifies their SHA-256 against the evidence files, so every product file comes from the archive.
 * - Every archive workspace (packages/* and apps/*) gets a private node_modules directory: read-only links to the
 *   dependency checkout's third-party entries, and @repo links to the archive's own package folders for every
 *   declared workspace dependency. The oracle directory gets links to the single react, react-dom,
 *   @testing-library/react, @testing-library/user-event, react-router and vitest instances.
 * - Exact-match aliases map every archive packages/* export specifier to the archive file. A guard plugin fails the
 *   run if any module is transformed from the packages/, apps/ or docs/ trees of the dependency checkout or of this
 *   runner's checkout, fails any unaliased @repo import that resolves outside the archive, and records every archive
 *   module it transforms; a harness check requires the production App's modules to have been loaded from the archive.
 * - Writes host-<suffix>-<revision>.log beside this file, refusing to overwrite (checked before archiving, again
 *   before writing, and with an exclusive create): requested and resolved revision and tree, package trees, archive
 *   method, byte count and SHA-256, the contract hash, the four lockfile values, oracle and runner hashes, archive file
 *   hashes compared with the contract's source table, versions, Vitest stdout and stderr, and a runner summary with a
 *   per-case outcome list from Vitest's JSON reporter, PRECONDITION counts, harness checks, the OBSERVED fact lines,
 *   RUNTIME-ERRORS lines and the module-pin record.
 * - Exit status: Vitest's nonzero status; 2 if Vitest exited 0 but a harness check failed.
 * Nothing is written into the dependency checkout; Vite caches and the bundled-config temp files stay inside the
 * temporary archive, which is deleted afterwards.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LOCKFILE_GATE = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const CONTRACT = "docs/reviews/web-dashboard-clock-recovery-contract/contract.md";
const CONTRACT_R2_SHA256 = "214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae";
const root = realpathSync(fileURLToPath(new URL("../../../", import.meta.url)));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const owned = "docs/reviews/web-dashboard-clock-recovery-independent";
const dependencyRoot = realpathSync(resolve(process.env.XAI_DEPS_ROOT ?? root));
const [revision, mode, suffix, ...extra] = process.argv.slice(2);
if (!revision || !mode || !suffix || extra.length) throw Error("Usage: node verify-fixed.mjs <revision> host <suffix>");
if (!/^[A-Za-z0-9._-]+$/.test(revision)) throw Error(`Unsafe revision: ${revision}`);
if (!/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error(`Unsafe suffix: ${suffix}`);

const WIDGETS_DIR = "packages/xai-web-dashboard-widgets";
const GRID_DIR = "packages/xai-web-dashboard-grid";
const STORAGE_DIR = "packages/plugin-web-storage";
const SHELL_DIR = "packages/xai-web-shell";
const APPEARANCE_DIR = "packages/xai-web-settings-appearance";
const WEB_DIR = "apps/web";
const ORACLE_FILES = ["host-fixture.tsx", "host.test.tsx"];
// Production modules the host composition must load from the archive (reachable from the production route table and
// the main.tsx module order on /app/dashboard, so they are loaded at f9eb4b1 and on a fixed product alike).
const HOST_PROVENANCE = [
  `${WEB_DIR}/src/App.tsx`,
  `${WEB_DIR}/src/routes/router.tsx`,
  `${WEB_DIR}/src/routes/RouteGateElements.tsx`,
  `${WEB_DIR}/src/routes/RouteErrorBoundary.tsx`,
  `${WEB_DIR}/src/routes/modules/shellRegistrations.tsx`,
  `${WEB_DIR}/src/routes/modules/dashboardRegistration.tsx`,
  `${WEB_DIR}/src/routes/modules/departureCoordinator.tsx`,
  `${WEB_DIR}/src/routes/modules/settingsDeparture.ts`,
  `${WEB_DIR}/src/providers/AccountStorageGate.tsx`,
  `${WEB_DIR}/src/providers/AppProviders.tsx`,
  `${WEB_DIR}/src/observability/runtime.ts`,
  `${WEB_DIR}/src/service-worker/register.ts`,
  `${STORAGE_DIR}/src/AccountDataGate.tsx`,
  `${STORAGE_DIR}/src/internal/accountScope.ts`,
  `${STORAGE_DIR}/src/internal/accountCoordination.ts`,
  `${STORAGE_DIR}/src/internal/registry.ts`,
  `${STORAGE_DIR}/src/internal/usePref.ts`,
  `${STORAGE_DIR}/src/internal/storage.ts`,
  `${STORAGE_DIR}/src/internal/usePrefAsync.ts`,
  `${STORAGE_DIR}/src/internal/usePrefAutosaveAsync.ts`,
  `${STORAGE_DIR}/src/internal/prefMutation.ts`,
  `${STORAGE_DIR}/src/internal/sameTabBus.ts`,
  `${SHELL_DIR}/src/index.ts`,
  `${SHELL_DIR}/src/registry.tsx`,
  `${SHELL_DIR}/src/Shell.tsx`,
  `${SHELL_DIR}/src/Topbar.tsx`,
  `${SHELL_DIR}/src/AppRail.tsx`,
  `${SHELL_DIR}/src/AvatarMenu.tsx`,
  `${SHELL_DIR}/src/SignOutConfirmDialog.tsx`,
  `${SHELL_DIR}/src/internal/railOrderController.tsx`,
  `${SHELL_DIR}/src/internal/RailOrderStatus.tsx`,
  `${SHELL_DIR}/src/internal/railOrderCopy.ts`,
  `${SHELL_DIR}/src/internal/railOrderModel.ts`,
  `${APPEARANCE_DIR}/src/internal/appearanceController.tsx`,
  `${APPEARANCE_DIR}/src/internal/appearanceRecoveryCopy.ts`,
  `${GRID_DIR}/src/DashboardModule.tsx`,
  `${GRID_DIR}/src/DashboardGrid.tsx`,
  `${GRID_DIR}/src/DashHeader.tsx`,
  `${GRID_DIR}/src/WidgetShell.tsx`,
  `${GRID_DIR}/src/WidgetGhost.tsx`,
  `${WIDGETS_DIR}/src/registrations.tsx`,
  `${WIDGETS_DIR}/src/widgets/ClockWidget.tsx`,
  `${WIDGETS_DIR}/src/widgets/MiniCalWidget.tsx`,
  `${WIDGETS_DIR}/src/internal/cityLibrary.ts`,
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/xai-web-cmdk/src/internal/readModuleStates.ts",
  "packages/xai-web-cmdk/src/adapters/dashboard.ts",
  "packages/xai-web-event-bus/src/emitter.ts",
  "packages/plugin-web-tokens/src/index.ts",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/guards.tsx",
];
// Contract r2 header table: the unit's source and the protected files it cites, at f9eb4b1 (path -> SHA-256), 50 rows.
// Recorded per log line as match/differs.
const CONTRACT_SOURCES = {
  "packages/xai-web-dashboard-widgets/src/widgets/ClockWidget.tsx": "10bf13e8550bdf1207cfd89b372e5b87f099b1110326248dbf5b7ea2325614e9",
  "packages/xai-web-dashboard-widgets/src/registrations.tsx": "346cfddfbb3c299aff251b2e4daff31b909d0690196857c36b8ee71f6e015154",
  "packages/xai-web-dashboard-widgets/src/styles.css": "a7a4cf039b343b8c6b06113bf6b6997084524aa4c0413e2ab0396a1ca933a853",
  "packages/xai-web-dashboard-widgets/src/internal/cityLibrary.ts": "50de913a73caaef2ea98c7021fec24dd46a30d56177527ddda54db89bcb36f48",
  "packages/xai-web-dashboard-widgets/src/internal/Icon.tsx": "afd71c525472e5ba9087cfcfe78b6b801767bff34f61c7a73b59a6cdd5b26985",
  "packages/xai-web-dashboard-widgets/src/index.ts": "1e22d6b74d4f22655e273415798edd1c255b5af9a108f2a99822299ac8031b0b",
  "packages/xai-web-dashboard-grid/src/DashboardModule.tsx": "36a8532beb638a5741d3b51338a2ce32da9daa220e1a461cd00729da61e542a2",
  "packages/xai-web-dashboard-grid/src/DashboardGrid.tsx": "395a134c9c1c3044ed86afdb48839373a7ba80ff57a387177dd277d76098fc2f",
  "packages/xai-web-dashboard-grid/src/types.ts": "afeb1112713155f8998ca13cc9dbfc174025c98497148ab21cd4f015201e40f2",
  "packages/xai-web-dashboard-grid/src/index.ts": "fc5da5907da4de81a327736297ef2ae377a7cf3e589fb3c121475229f9acf71c",
  "packages/xai-web-dashboard-grid/src/DashHeader.tsx": "0aaa4ce3b456b1fedf3c4bb3f7163830e6ee7390ba65382564d9c13852e40456",
  "packages/xai-web-dashboard-grid/src/WidgetGhost.tsx": "0b476928649a3b24bd35d97869c0b1e9e4588ebdec4908b6ef8c5583d0272c9b",
  "packages/xai-web-dashboard-grid/src/WidgetShell.tsx": "7d1b74b80076983eb5cc34921d06d58b5365cbcf91efb63128a6c7938b1bd708",
  "packages/xai-web-dashboard-grid/src/styles.css": "d9e330e70a375b0579fcf3b98e3d9ea2c633fc4b498b4b3a66fda3df8db9fdc6",
  "apps/web/src/routes/modules/departureCoordinator.tsx": "0844a697b146b07fceb1835da7c4410db8812bc07bdea362f3386e991a2bc075",
  "apps/web/src/routes/modules/dashboardRegistration.tsx": "66c524e4e02117275ed369c02049f33a0eb2c42ad068388eb4041fa469c903e8",
  "apps/web/src/routes/modules/settingsDeparture.ts": "80c3a5787df8eb02102c4a508f2fe67c1fbd6a6b8ba7f16b3a65c3f542c8548b",
  "apps/web/src/routes/modules/shellRegistrations.tsx": "c003c499ca3330ff6e3b7e738df4e3366d0daca141d65327dacc3d3665e1b8fe",
  "apps/web/src/main.tsx": "6a7cdfbc6b17cdc13a3dbcb44611b09c33ddf7c7787da4a6ed31265e4abbf243",
  "apps/web/src/providers/AccountStorageGate.tsx": "1c6bf8c695e9bc8b80b83c6da0c3c55c44e9a88498dded1b8dd46f302d8cb666",
  "apps/web/src/providers/AppProviders.tsx": "950cde0f7f6ba7cae9776a8e8442a303f938d5bb04d389dd1ac9760e10ebe655",
  "apps/web/src/App.tsx": "f644e78ec482c0b9b66f9702407eb34e1dcd110e837293e4a736964bfe7ac408",
  "packages/xai-web-shell/src/AppRail.tsx": "fe789078fecc60936d3e6c5fc2b203001a15490aecf30f3a0ca301da1399fb44",
  "packages/xai-web-shell/src/Topbar.tsx": "aa5ac56e7b6a7652df70e82ed4d83dc81b44558181bfb48a30eb40b157d43c0e",
  "packages/xai-web-shell/src/Shell.tsx": "38e25c6b20f6413c9362f53e9be7e2aa121001170898a6097e29fccabf22e432",
  "packages/xai-web-shell/src/types.ts": "d18f637e9bec8c05f305fb29467acfd3fdcf2649e83ad2b28b877389752139c0",
  "packages/xai-web-shell/src/index.ts": "396a894d09b5b2b95f2ed063b615b41f371044f356d4d2ef9f224189e09b66ab",
  "packages/xai-web-shell/src/internal/railOrderController.tsx": "d7f2f0b699e087c34d453309d9fe4c0eb6ba38ef52e6dfc70fe49d2f75c4e2a6",
  "packages/xai-web-shell/src/internal/RailOrderStatus.tsx": "48b611ff1e2efbc96a888fd87f048925472702db898530cbf21f5df560ecff95",
  "packages/xai-web-shell/src/internal/railOrderCopy.ts": "268fb934f921843efd1c3e41cd9a81614ce26b3a94026e5884e10d633a05d7ba",
  "packages/xai-web-shell/src/railOrderStatus.css": "338f0eae7338458da54b996880cfa93034940e0f19220a1669c1570a8fd4b6e5",
  "packages/xai-web-shell/src/AvatarMenu.tsx": "3401b838a2dc5a16d1c6f1113a2aaf1ef6d8673897029bb2a1614db8c379c4c2",
  "packages/xai-web-settings-appearance/src/internal/appearanceController.tsx": "64d6c8b74f689bc989bc8d1bcfa85bb333b068826829269f1e31d97cd2878e5a",
  "packages/xai-web-settings-appearance/src/internal/appearanceRecoveryCopy.ts": "991232e97e44919c1b00b5502a62df05d814de3ccc34ed4452104ad59b54dab0",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts": "541fae97413104b8db90c20d7b565a5492f17fc74d79b3e975f954d7189a4491",
  "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts": "e27f9f86196c08166b3c03f8450a546d486c2035adec42f91a90ae2723350332",
  "packages/plugin-web-storage/src/internal/prefMutation.ts": "3f8840ac8e7e824ddc9aacb6839d19a0602244235dbfd542f686ca749125ec00",
  "packages/plugin-web-storage/src/internal/usePref.ts": "e1f2c9131cb9a00a2dff3951f4c95b2a7ad68692d0bf409b0ef511df137fa188",
  "packages/plugin-web-storage/src/internal/storage.ts": "b51bcaa0de96cb9731df1253d256896397286cdbdad2ff9285984be15ebd6421",
  "packages/plugin-web-storage/src/internal/registry.ts": "dd961a214c94ac97753e1878323ed387cde3362f4e85f1dfaa8154f1011d29d3",
  "packages/plugin-web-storage/src/internal/accountOwnership.ts": "8d5b7fef04a014044b81cb95d56eaf084bfc306d7c8b9a27540b6caa3a2bef20",
  "packages/plugin-web-storage/src/internal/accountCoordination.ts": "d669fe47d22f6d9f4b5c56b24ca60eb68dee9fc6877de4901d328ffdd7e50e1c",
  "packages/plugin-web-storage/src/internal/codec.ts": "99a735801cab8ce9d7208c244efb8eda66dd641cf5c7d795302384207c6b9b8f",
  "packages/plugin-web-storage/src/internal/lifecycleDeclaration.ts": "f292de4ec2e44d0fe75dde836fb360cfc2c292ceeaa47b2c107036765cd5b922",
  "packages/xai-web-cmdk/src/internal/readModuleStates.ts": "1ee898681af67b21bd84308bef99abf196ab8551069d53c8e570a9ec9e0ba008",
  "packages/xai-web-cmdk/src/adapters/dashboard.ts": "0c8e6ac9cfbcffd6a52e3f21cd5a09b077d03bd0539798ebcbc626776b64b1eb",
  "packages/plugin-web-tokens/src/layout.css": "9397dc735d8d80a9720e81561dca73a0ed02a98fd16c1f15634e5c775e2bc6b7",
  "packages/plugin-web-tokens/src/tokens.css": "7c6eddebd1d826f939862ef75ba8159e966f0c76b0b9d34a0911f6b47265615d",
  "packages/plugin-web-tokens/src/i18n.ts": "d5f2189b081d16a9f26b7146978c5f81660a6a44d6f534b9ac48e6e3c7ccb885",
  "packages/xai-web-pet/src/DesktopPet.tsx": "35edb0e686bf6682192ba1bbe7842d159e161a6593b7ccd13a432d59fe58ad6f",
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
const contractHash = sha256(readFileSync(join(root, CONTRACT)));
assert.equal(contractHash, CONTRACT_R2_SHA256, "The runner checkout's Clock contract is not r2 (8bf6139)");
const productTreeDelta = git(["diff", "--name-only", commit, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]).split("\n").filter(Boolean).length;
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

/** Contract section 12 rule 7: stream `git archive` into `tar -x`; count and hash the streamed bytes. */
function extractArchive(target) {
  return new Promise((resolvePromise, rejectPromise) => {
    const archive = spawn("git", ["archive", commit], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    const tar = spawn("tar", ["-x", "-C", target], { stdio: ["pipe", "ignore", "pipe"] });
    const digest = createHash("sha256");
    let count = 0;
    let archiveError = "";
    let tarError = "";
    let archiveCode = null;
    let tarCode = null;
    let settled = false;
    const fail = error => { if (!settled) { settled = true; rejectPromise(error); } };
    const finish = () => {
      if (archiveCode === null || tarCode === null || settled) return;
      settled = true;
      if (archiveCode !== 0 || tarCode !== 0) rejectPromise(Error(`git archive exit ${archiveCode} (${archiveError.trim()}); tar exit ${tarCode} (${tarError.trim()})`));
      else resolvePromise({ bytes: count, sha256: digest.digest("hex") });
    };
    archive.stdout.on("data", chunk => { count += chunk.length; digest.update(chunk); });
    archive.stdout.pipe(tar.stdin);
    archive.stderr.on("data", chunk => { archiveError += chunk; });
    tar.stderr.on("data", chunk => { tarError += chunk; });
    archive.on("error", fail);
    tar.on("error", fail);
    archive.on("close", code => { archiveCode = code; finish(); });
    tar.on("close", code => { tarCode = code; finish(); });
  });
}

const CONFIG_SOURCE = `import { appendFileSync } from "node:fs";

const settings = __SETTINGS__;
const record = line => appendFileSync(settings.pinLog, line + "\\n");
const inside = (file, folder) => file === folder || file.startsWith(folder + "/");
const guard = {
  name: "clock-host-archive-pin-guard",
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

const directory = realpathSync(mkdtempSync(join(tmpdir(), "xai-clock-host-")));
let exitCode = 1;
try {
  const streamed = await extractArchive(directory);
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
    cacheDir: join(directory, ".clock-host-vite-cache"),
    forbidden,
    pinLog,
    include: spec.include,
    globals: spec.globals,
    setupFiles: spec.setupFiles.map(file => join(directory, file)),
    timeout: spec.timeout,
    aliases: aliases.map(({ pattern, replacement }) => ({ pattern, replacement })),
  };
  const configFile = join(directory, `clock-host-${mode}.vitest.config.mjs`);
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
    `widgets_package_tree=${treeOf(WIDGETS_DIR)} grid_package_tree=${treeOf(GRID_DIR)} storage_package_tree=${treeOf(STORAGE_DIR)} shell_package_tree=${treeOf(SHELL_DIR)} web_app_tree=${treeOf(WEB_DIR)}`,
    `mode=${mode}`,
    `suffix=${suffix}`,
    `include=${spec.include.join(",")}`,
    `command=XAI_DEPS_ROOT=${dependencyRoot} node ${owned}/verify-fixed.mjs ${revision} ${mode} ${suffix}`,
    `runner_checkout_head=${runnerHead}`,
    `product_tree_delta_files_vs_runner_head=${productTreeDelta}`,
    `contract_r2_sha256=${contractHash} (asserted equal to ${CONTRACT_R2_SHA256})`,
    `archive_method=stream (spawned git archive piped to tar -x; no fixed buffer) archive_bytes=${streamed.bytes} archive_sha256=${streamed.sha256}`,
    `vitest_bin=${vitestBin}`,
    `vitest_args=${vitestArgs.join(" ")}`,
    `vitest_version=${vitestVersion} vite_version=${viteVersion} jsdom_version=${jsdomVersion} node=${process.version} platform=${process.platform}-${process.arch} tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `dependency_root=${dependencyRoot}`,
    `lockfile_gate_sha256=${LOCKFILE_GATE}`,
    `dependency_lockfile_sha256=${dependencyLockHash}`,
    `archive_lockfile_sha256=${archiveLockHash}`,
    `extracted_lockfile_sha256=${extractedLockHash}`,
    `oracle_sha256 ${Object.entries(oracleHashes).map(([name, hash]) => `${name}=${hash}`).join(" ")}`,
    `archive_file_sha256 (${contractMatches}/${productHashes.length} equal the contract r2 source table) ${productHashes.join(" ")}`,
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
  console.log(`${mode} ${revision} (${commit.slice(0, 12)}): vitest_exit=${vitestStatus} harness=${harnessFailed ? "FAIL" : "PASS"} exit=${exitCode} cases=${cases.length} passed=${count("passed")} failed=${count("failed")} precondition=${preconditionFailures} archive_bytes=${streamed.bytes} log=${relative(root, logPath)}`);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
process.exitCode = exitCode;
