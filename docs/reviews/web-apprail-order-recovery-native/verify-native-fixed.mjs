/**
 * CP-APPRAIL-01 batch 61 (contract r1 §15 E9, E10, E11): AppRail order (`xai_rail_order`) native FIXED evidence in real
 * headless Chrome, in the production App composition, with trusted input only. Independent parent-role native verifier.
 * Verification only: it repairs nothing, implements nothing, accepts nothing and changes no product file, contract,
 * oracle, ledger, control plane or existing evidence. It is a new file; the frozen before runner
 * ./verify-native-before.mjs and its fixture and prelude are read only (their SHA-256 are checked against
 * ./before-419e56d.md) and their conventions are re-implemented here, not imported.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-apprail-order-recovery-native/verify-native-fixed.mjs f9eb4b1 <mode> <suffix>
 *
 * Modes:
 *   controls   — E9, host rows b, c, e, f, o, p, r: exact bytes after trusted drags (A2 merge, one write per drop, zero
 *                attempts during dragenter/dragover), the D1 probe, R-1 end to end through the real Features pane, a
 *                drop held behind the real per-key Web Lock, a second drop while the first is held (latest wins), readback
 *                uncertainty reconciled with one total write, every contract §5 item 2 value on three routes in EN and
 *                ZH with a drag over it, external repair then Reload, and cancelled drags.
 *   protection — E10, host rows a, d, g, h, i, j, k, l, n, q with history counters and runtime-error gates: the status and
 *                panel with Retry, Discard and Export by trusted pointer, navigation not held, sign-out in both auth
 *                branches (with references bundled from 419e56d for rows h and k), beforeunload, the forced remount and
 *                Features toggles that never write the order.
 *   export     — E11: the five contract §8 disk shapes under total storage denial, plus setup failures.
 *
 * - Product: an immutable `git archive` of the fixed revision (and, in `protection`, of 419e56d for references);
 *   ./native-fixed-app.tsx is bundled with esbuild from stdin with resolveDir = that archive. Every `@repo/*` specifier
 *   is pinned to the archive's own package export; a guard plugin fails the build if any module is loaded from the
 *   packages/, apps/ or docs/ tree of the dependency checkout or of this runner's checkout. Third-party modules come from
 *   XAI_DEPS_ROOT only when its pnpm-lock.yaml SHA-256 equals both archives' and the contract gate (consistency gate;
 *   read-only use). The fixed delta against 419e56d must be exactly the 19 E6 files.
 * - The only synthetic input is the auth session (and, in the "-coord" variants, a synthetic generation coordinator in
 *   that same auth-session context, one virtual module recorded in provenance).
 * - DevTools transport: the pipe (--remote-debugging-pipe) with flattened target sessions, never a WebSocket.
 * - Trusted input only: clicks through Input.dispatchMouseEvent after a centre hit-test; drags through
 *   Input.setInterceptDrags, Input.dispatchMouseEvent and Input.dispatchDragEvent with the source and every target
 *   centre-hit-tested first and a passive capture-phase recorder requiring every drag event to be trusted; the only key
 *   is Escape, without nativeVirtualKeyCode (K-1), with a per-document key audit.
 * - Expected bytes come from this runner's own displayOrder, merge and reorder written from contract §2, A2 and §6; the
 *   expected wording comes from contract §5 (and the accepted Appearance contract for its sign-out text), never from the
 *   product.
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log` plus PNG screenshots and downloaded JSON in this directory;
 *   existing evidence is never overwritten. Exit 0 = harness valid and every product check passes; 2 = harness valid and
 *   at least one product check fails; 1 = harness invalid (a precondition failed). Development probes may redirect
 *   evidence with XAI_NATIVE_EVIDENCE_DIR (refused inside the repository); committed evidence never does.
 */
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LOCKFILE_GATE_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const CONTRACT_PATH = "docs/reviews/web-apprail-order-recovery-contract/contract.md";
const CONTRACT_SHA256 = "b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde";
const FIXED_SHA = "f9eb4b1f207bc4b46f547b90afc250424b3c8695";
const BEFORE_REVISION = "419e56de9f23e4467fea806fbd4a990e1f429941";
/** Contract r1 header source table (at 419e56d). */
const CONTRACT_SOURCE_HASHES = {
  "packages/xai-web-shell/src/AppRail.tsx": "6312caa162a7d194774bf95282c203ddc633ccc54068edcd2854dfbfd4633f67",
  "packages/xai-web-shell/src/internal/dnd.ts": "a538b51f119f9cedbed3421f8cd21549f1730d0ede9059257402bee9a63deaf9",
  "packages/xai-web-shell/src/registry.tsx": "b621abbecfda785a5d7da628465925dacdb3249638b181cc3ca074687b734c1e",
  "packages/xai-web-shell/src/Topbar.tsx": "87b243344cb055d0a55b5e749bfeceb97b16c6a72a442ee1f990a76ced74c1f0",
  "packages/xai-web-shell/src/Shell.tsx": "1f5fc6c7281c74d1c08b5fac99d90feae79637f5c349fa38823dc2f042428c5f",
  "packages/xai-web-shell/src/types.ts": "ada0b296ed314bdb74b8847dac2b6a20bc3ffc297ded929b7f4f8ad09a88d93a",
  "packages/xai-web-shell/src/index.ts": "c404a9713dee4d821ba3ec6b5c7591f984da3c92b5fb1a62d88fbab5cec368ed",
  "packages/xai-web-shell/src/__tests__/AppRail.test.tsx": "cbe4179146b7f9565cb038027f004520b46917db3da6c0e9f653cf319b309e8f",
  "packages/xai-web-shell/src/__tests__/Topbar.test.tsx": "b3a068eab6bbb95e62cb2ec73f8a715921a48549f090bf7237e8d8c0dabfcb12",
  "apps/web/src/App.tsx": "24461a52a34c83d9e9e51dc92d99db6d76e4c56435bec3e5293e0937a8cc935a",
  "packages/plugin-web-storage/src/internal/registry.ts": "dd961a214c94ac97753e1878323ed387cde3362f4e85f1dfaa8154f1011d29d3",
  "packages/plugin-web-tokens/src/layout.css": "9397dc735d8d80a9720e81561dca73a0ed02a98fd16c1f15634e5c775e2bc6b7",
  "apps/web/src/routes/modules/departureCoordinator.tsx": "0844a697b146b07fceb1835da7c4410db8812bc07bdea362f3386e991a2bc075",
};
/** Rows of the contract source table that are §11 unit files Terra was allowed to change. */
const UNIT_CHANGED = [
  "packages/xai-web-shell/src/AppRail.tsx", "packages/xai-web-shell/src/Topbar.tsx", "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/types.ts", "packages/xai-web-shell/src/index.ts", "packages/xai-web-shell/src/__tests__/Topbar.test.tsx", "apps/web/src/App.tsx",
];
/** The 19 product files of the E6 row (control plane CP-APPRAIL-01, "E6 Terra 实施"). */
const EXPECTED_FIXED_DELTA = [
  "apps/web/src/App.tsx", "apps/web/src/__tests__/App.railorder.test.tsx", "packages/xai-web-shell/docs/api.md", "packages/xai-web-shell/docs/test.md",
  "packages/xai-web-shell/src/AppRail.tsx", "packages/xai-web-shell/src/Shell.tsx", "packages/xai-web-shell/src/Topbar.tsx",
  "packages/xai-web-shell/src/__tests__/AppRail.railorder.test.tsx", "packages/xai-web-shell/src/__tests__/RailOrderStatus.test.tsx",
  "packages/xai-web-shell/src/__tests__/Topbar.test.tsx", "packages/xai-web-shell/src/__tests__/railOrderFixture.tsx", "packages/xai-web-shell/src/__tests__/railOrderModel.test.ts",
  "packages/xai-web-shell/src/index.ts", "packages/xai-web-shell/src/internal/RailOrderStatus.tsx", "packages/xai-web-shell/src/internal/railOrderController.tsx",
  "packages/xai-web-shell/src/internal/railOrderCopy.ts", "packages/xai-web-shell/src/internal/railOrderModel.ts", "packages/xai-web-shell/src/railOrderStatus.css",
  "packages/xai-web-shell/src/types.ts",
].sort();
/** The frozen before conventions, reused read-only (SHA-256 from ./before-419e56d.md §2). */
const FROZEN_BEFORE_FILES = {
  "verify-native-before.mjs": "ccabd5000d4b9e04cf775c4bb1bd79c0860d5def55f46799a651d69714f6a84e",
  "native-before-app.tsx": "fa70e2eb892bca9c2bd2f4c910c737e44963d52433f475253d6f966eb0608a7e",
  "native-before-prelude.js": "a4ba378110a4fcded7eccf0d88f8f41c281a42c10599b17f68832a3a3931f635",
};
const RUNNER = "verify-native-fixed.mjs";
const FIXTURE = "native-fixed-app.tsx";
const PRELUDE = "native-fixed-prelude.js";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? output;
if (process.env.XAI_NATIVE_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
/** Development-probe row filter (comma list); refused for committed evidence, which always runs every row of the mode. */
const ONLY = process.env.XAI_NATIVE_ONLY ? process.env.XAI_NATIVE_ONLY.split(",") : null;
if (ONLY && !process.env.XAI_NATIVE_EVIDENCE_DIR) throw Error("XAI_NATIVE_ONLY is for development probes outside the repository only");
const selected = (name) => !ONLY || ONLY.includes(name);
const [requested, mode, suffix] = process.argv.slice(2);
const MODES = ["controls", "protection", "export"];
if (!requested) throw Error("Revision required");
if (!MODES.includes(mode)) throw Error(`Unsupported mode ${mode}; use ${MODES.join("|")}`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const resolved = execFileSync("git", ["rev-parse", "--verify", `${requested}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const resolvedTree = execFileSync("git", ["rev-parse", `${resolved}^{tree}`], { cwd: root, encoding: "utf8" }).trim();
const short = resolved.slice(0, 7);
const prefix = `native-${short}-${suffix}-${mode}`;
const evidencePath = join(evidenceDir, `${prefix}.log`);
if (existsSync(evidencePath) || readdirSync(evidenceDir).some((name) => name.startsWith(`${prefix}-`))) throw Error("Evidence exists; use a distinct suffix");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const progress = (text) => process.stderr.write(`[apprail-fixed ${mode}] ${new Date().toISOString().slice(11, 19)} ${text}\n`);
const records = [];
const runtimeErrors = [];
const consoleWarnings = [];
const dialogs = [];
const dialogPlan = [];
const artifacts = [];
const navigationRequests = [];
const rowGates = [];
const d1Log = [];
const unusedPlans = [];
/** Removes the plans of `id` the product never asked for (recorded; judged at the end of the run). */
const dropUnusedPlans = (id) => {
  for (let index = dialogPlan.length - 1; index >= 0; index -= 1) {
    if (String(dialogPlan[index].purpose ?? "").startsWith(`${id}:`)) unusedPlans.push(...dialogPlan.splice(index, 1));
  }
};
const networkSeen = { documents: 0, attempts: 0, nonLocal: 0, samples: [] };
let lastCheckId = null;
let currentCase = null;
const record = (name, value = {}) => {
  records.push({ name, ...value });
  if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 300));
};
let checks = 0;
let preconditions = 0;
let productChecks = 0;
const failures = [];
const pre = (id, condition, details = {}) => {
  checks += 1;
  preconditions += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { id, kind: "precondition", pass, ...details });
  if (!pass) throw Object.assign(new Error(`PRECONDITION: ${id}`), { checkId: id, checkKind: "precondition" });
};
const check = (id, condition, details = {}) => {
  checks += 1;
  productChecks += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { id, kind: "product", pass, ...details });
  if (!pass) { failures.push(id); progress(`FAIL ${id}`); }
  return pass;
};
const observe = (id, details = {}) => record("observation", { id, ...details });

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const fixtureSource = readFileSync(join(output, FIXTURE), "utf8");
const preludeSource = readFileSync(join(output, PRELUDE), "utf8");
const frozenBeforeActual = Object.fromEntries(Object.keys(FROZEN_BEFORE_FILES).map((file) => [file, sha256(readFileSync(join(output, file)))]));
const dependencyNodeModules = join(dependencyRoot, "node_modules");
if (!existsSync(dependencyNodeModules)) throw Error("PRECONDITION: dependency tree missing; set XAI_DEPS_ROOT");
const archiveLock = execFileSync("git", ["show", `${resolved}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
const beforeLock = execFileSync("git", ["show", `${BEFORE_REVISION}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
const dependencyLock = readFileSync(join(dependencyRoot, "pnpm-lock.yaml"));
if (sha256(dependencyLock) !== LOCKFILE_GATE_SHA256 || sha256(archiveLock) !== LOCKFILE_GATE_SHA256 || sha256(beforeLock) !== LOCKFILE_GATE_SHA256) throw Error("PRECONDITION: lockfile gate (dependency checkout, both revisions and contract gate must be equal)");
const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find((name) => name.startsWith("esbuild@0.28.1"));
if (!esbuildFolder) throw Error("PRECONDITION: pinned esbuild 0.28.1 missing");
const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
const docsHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const productDelta = execFileSync("git", ["diff", "--name-only", resolved, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim();
const fixedDelta = execFileSync("git", ["diff", "--name-only", BEFORE_REVISION, resolved, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean).sort();
const contractSha256 = sha256(execFileSync("git", ["show", `HEAD:${CONTRACT_PATH}`], { cwd: root, maxBuffer: 20 * 1024 * 1024 }));
const versionOf = (name) => {
  try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
};
/** Reader, writer and host modules that must be bundled from the archive (contract §2, §9 "Composition"). */
const REQUIRED_COMMON = [
  "apps/web/src/App.tsx", "apps/web/src/routes/router.tsx", "apps/web/src/routes/RouteGateElements.tsx", "apps/web/src/routes/RouteErrorBoundary.tsx",
  "apps/web/src/providers/AppProviders.tsx", "apps/web/src/providers/AccountStorageGate.tsx", "apps/web/src/routes/modules/shellRegistrations.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx", "apps/web/src/routes/modules/departureCoordinator.tsx", "apps/web/src/routes/modules/settingsDeparture.ts",
  "packages/xai-web-shell/src/index.ts", "packages/xai-web-shell/src/Shell.tsx", "packages/xai-web-shell/src/Topbar.tsx", "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/AvatarMenu.tsx", "packages/xai-web-shell/src/SignOutConfirmDialog.tsx", "packages/xai-web-shell/src/registry.tsx", "packages/xai-web-shell/src/internal/dnd.ts",
  "packages/xai-web-settings-features-panel/src/FeaturesPane.tsx", "packages/xai-web-settings-features-panel/src/useFeaturePrefs.ts", "packages/xai-web-settings-features-panel/src/filterModulesByFeaturePrefs.ts",
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx", "packages/xai-web-settings-appearance/src/internal/appearanceController.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx", "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/plugin-web-storage/src/AccountDataGate.tsx", "packages/plugin-web-storage/src/internal/usePref.ts", "packages/plugin-web-storage/src/internal/storage.ts",
  "packages/plugin-web-storage/src/internal/codec.ts", "packages/plugin-web-storage/src/internal/registry.ts", "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/accountOwnership.ts", "packages/plugin-web-storage/src/internal/prefMutation.ts", "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts", "packages/plugin-web-tokens/src/i18n.ts", "packages/plugin-web-tokens/src/layout.css",
  "packages/web-auth-device-session/src/session.tsx",
];
const REQUIRED_FIXED_ONLY = [
  "packages/xai-web-shell/src/internal/railOrderController.tsx", "packages/xai-web-shell/src/internal/RailOrderStatus.tsx",
  "packages/xai-web-shell/src/internal/railOrderModel.ts", "packages/xai-web-shell/src/internal/railOrderCopy.ts", "packages/xai-web-shell/src/railOrderStatus.css",
];
const VARIANTS = {
  fixed: { revision: resolved, stage: "fixed", coordinator: false },
  "fixed-coord": { revision: resolved, stage: "fixed", coordinator: true },
  before: { revision: BEFORE_REVISION, stage: "before", coordinator: false },
  "before-coord": { revision: BEFORE_REVISION, stage: "before", coordinator: true },
};
const VARIANTS_BY_MODE = { controls: ["fixed"], export: ["fixed"], protection: ["fixed", "fixed-coord", "before", "before-coord"] };

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-apprail-native-fixed-")));
const profile = join(directory, "profile");
const downloads = join(directory, "downloads");
mkdirSync(downloads);
let server = null;
let browser = null;
let origin = "";
let currentVariant = "fixed";
const archives = {};
const bundles = {};

// ---------------------------------------------------------------------------------------------------
// Archives and bundles (pinned, guarded), one per variant
// ---------------------------------------------------------------------------------------------------
function extractArchive(revision) {
  if (archives[revision]) return archives[revision];
  const snapshot = join(directory, `source-${revision.slice(0, 7)}`);
  mkdirSync(snapshot);
  execFileSync("tar", ["-x", "-C", snapshot], { input: execFileSync("git", ["archive", revision], { cwd: root, maxBuffer: 300 * 1024 * 1024 }) });
  const extractedLock = readFileSync(join(snapshot, "pnpm-lock.yaml"));
  symlinkSync(dependencyNodeModules, join(snapshot, "node_modules"));
  symlinkSync(join(dependencyRoot, "apps/web/node_modules"), join(snapshot, "apps/web/node_modules"));
  const aliases = new Map();
  for (const name of readdirSync(join(snapshot, "packages"))) {
    const folder = join(snapshot, "packages", name);
    if (!existsSync(join(folder, "package.json"))) continue;
    const pkg = JSON.parse(readFileSync(join(folder, "package.json"), "utf8"));
    aliases.set(pkg.name, { folder, pkg });
    const packageDependencies = join(dependencyRoot, "packages", name, "node_modules");
    if (existsSync(packageDependencies)) symlinkSync(packageDependencies, join(folder, "node_modules"));
  }
  archives[revision] = { revision, snapshot, aliases, extractedLock };
  return archives[revision];
}
const OWNER = "apprail-native-A";
/** The synthetic auth-session context of the coordinator variants (the only virtual module; see the header). */
const coordinatorWrapper = (webEntry) => `
import { useWebAuthSession as realUseWebAuthSession } from ${JSON.stringify(webEntry)};
export * from ${JSON.stringify(webEntry)};
const OWNER = ${JSON.stringify(OWNER)};
const log = (window.__nativeAuth = window.__nativeAuth || { captures: 0, signOuts: [], bootstraps: 0 });
let active = { generation: "native-auth-generation-1", owner: OWNER };
const coordinator = {
  capture() { log.captures += 1; return active ? Object.freeze({ generation: active.generation, owner: active.owner }) : null; },
  async signOut(captured, settings) {
    log.signOuts.push({ seq: window.__native ? window.__native.next() : 0, captured: { generation: captured.generation, owner: captured.owner }, settings: settings === undefined ? null : settings });
    active = null;
    return { status: "applied", remote: "succeeded", local: { status: "applied" }, transient: { envelope: "cleared", verifier: "cleared", index: "cleared" } };
  },
  async bootstrap() { log.bootstraps += 1; return { status: "applied" }; },
  async reconcile() { return { status: "applied" }; },
  getSnapshot() { return { status: active ? "authenticated" : "unauthenticated", session: null, generation: active ? active.generation : null, owner: active ? active.owner : null, client: null, error: null, revision: 0 }; },
  subscribe() { return () => {}; },
};
export function useWebAuthSession() {
  const value = realUseWebAuthSession();
  return { ...value, coordinator };
}
`;
async function buildVariant(name) {
  const variant = VARIANTS[name];
  const { snapshot, aliases } = extractArchive(variant.revision);
  const forbiddenRoots = [...new Set([dependencyRoot, root].map((base) => realpathSync(base)))].flatMap((base) => ["packages", "apps", "docs"].map((tree) => join(base, tree) + sep));
  const guardViolations = [];
  const pinnedRepo = [];
  const archiveModules = new Set();
  const archiveRoot = snapshot + sep;
  const authAlias = aliases.get("@repo/web-auth-device-session");
  const webExport = authAlias.pkg.exports["./web"];
  const webEntry = join(authAlias.folder, typeof webExport === "object" ? webExport.import ?? webExport.default : webExport);
  const redirectedImporters = [];
  const plugin = { name: "apprail-native-fixed-archive-pin-guard", setup(buildApi) {
    if (variant.coordinator) {
      buildApi.onResolve({ filter: /^@repo\/web-auth-device-session\/web$/ }, (args) => {
        redirectedImporters.push(!args.importer || args.importer === "<stdin>" ? "<stdin>" : relative(snapshot, args.importer));
        return { path: "auth-session-context-with-synthetic-coordinator", namespace: "native-auth" };
      });
      buildApi.onLoad({ filter: /.*/, namespace: "native-auth" }, () => ({ contents: coordinatorWrapper(webEntry), loader: "js", resolveDir: snapshot }));
    }
    buildApi.onResolve({ filter: /^@repo\// }, (args) => {
      const parts = args.path.split("/");
      const alias = aliases.get(parts.slice(0, 2).join("/"));
      if (!alias) throw Error(`Unknown workspace package ${args.path}`);
      const sub = parts.length > 2 ? `./${parts.slice(2).join("/")}` : ".";
      let target = alias.pkg.exports?.[sub];
      if (target && typeof target === "object") target = target.import ?? target.default;
      if (typeof target !== "string") throw Error(`Unresolved pinned export ${args.path}`);
      pinnedRepo.push(args.path);
      return { path: join(alias.folder, target) };
    });
    buildApi.onLoad({ filter: /.*/ }, (args) => {
      if (args.namespace === "native-auth") return undefined;
      const file = args.path;
      if (file.startsWith(archiveRoot) && !file.includes(`${sep}node_modules${sep}`)) archiveModules.add(relative(snapshot, file));
      if (!file.includes(`${sep}node_modules${sep}`) && forbiddenRoots.some((base) => file.startsWith(base))) {
        guardViolations.push(file);
        throw Error(`Guard: module loaded from a checkout instead of the archive: ${file}`);
      }
      return undefined;
    });
  } };
  const built = await esbuild.build({
    stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: FIXTURE },
    absWorkingDir: snapshot,
    plugins: [plugin],
    nodePaths: [join(dependencyRoot, "apps/web/node_modules")],
    loader: { ".png": "dataurl", ".svg": "dataurl", ".woff2": "dataurl", ".woff": "dataurl" },
    bundle: true, format: "esm", platform: "browser", write: false, metafile: true, logLevel: "silent",
    outfile: join(directory, `bundle-${name}.js`),
    define: { "import.meta.env": "{}", __NATIVE_VARIANT__: JSON.stringify(name) },
  });
  const js = built.outputFiles.find((file) => file.path.endsWith(".js")).text;
  const css = built.outputFiles.find((file) => file.path.endsWith(".css")).text;
  const moduleIndex = js.split("\n").map((text, line) => ({ line, text })).filter((entry) => /^\/\/ \S+\.(tsx?|m?js|cjs|jsx|json|css)$/.test(entry.text) || /^\/\/ native-auth:/.test(entry.text)).map((entry) => ({ line: entry.line, module: entry.text.slice(3) }));
  const inputs = Object.keys(built.metafile.inputs);
  const virtualInputs = inputs.filter((entry) => entry.startsWith("native-auth:"));
  const archiveInputs = inputs.filter((entry) => !entry.startsWith("../") && entry !== FIXTURE && !entry.startsWith("<define:") && !entry.startsWith("native-auth:"));
  const thirdParty = inputs.filter((entry) => entry.includes("node_modules/"));
  const foreign = inputs.filter((entry) => entry.startsWith("../") && !entry.includes("node_modules/"));
  const required = [...REQUIRED_COMMON, ...(variant.stage === "fixed" ? REQUIRED_FIXED_ONLY : [])];
  const missingRequired = required.filter((file) => !inputs.includes(file) || (!archiveModules.has(file) && !file.endsWith(".css")));
  const requiredHashes = Object.fromEntries(required.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const provenance = {
    variant: name, revision: variant.revision, stage: variant.stage, coordinator: variant.coordinator,
    bundleSha256: sha256(js), bundleCssSha256: sha256(css), bundleModuleComments: moduleIndex.length,
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign, virtual: virtualInputs },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
    requiredModules: { count: required.length, missing: missingRequired, sha256: requiredHashes },
    coordinatorWrapper: variant.coordinator ? { sha256: sha256(coordinatorWrapper(relative(snapshot, webEntry))), redirectedImporters: [...new Set(redirectedImporters)].sort(), realAuthModulesFromArchive: ["packages/web-auth-device-session/src/session.tsx"].every((file) => archiveModules.has(file)) } : null,
  };
  record("bundle-provenance", provenance);
  pre(`baseline:${name}:guard-no-module-from-a-checkout`, guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre(`baseline:${name}:every-required-module-bundled-from-archive`, missingRequired.length === 0, { missingRequired });
  if (variant.coordinator) {
    pre(`baseline:${name}:exactly-one-virtual-module-the-synthetic-auth-session-context`, virtualInputs.length === 1 && provenance.coordinatorWrapper.realAuthModulesFromArchive
      && provenance.coordinatorWrapper.redirectedImporters.includes("apps/web/src/App.tsx"), provenance.coordinatorWrapper);
  } else {
    pre(`baseline:${name}:no-virtual-module`, virtualInputs.length === 0, { virtualInputs });
  }
  bundles[name] = { js, css, moduleIndex, provenance };
}

// ---------------------------------------------------------------------------------------------------
// Browser over the DevTools PIPE transport with flattened target sessions
// ---------------------------------------------------------------------------------------------------
const moduleAt = (url, line) => {
  const match = /\/__native\/([a-z-]+)\/bundle\.js$/.exec(url ?? "");
  if (!match || typeof line !== "number" || !bundles[match[1]]) return null;
  let found = null;
  for (const entry of bundles[match[1]].moduleIndex) { if (entry.line <= line) found = entry.module; else break; }
  return found;
};
const frameSource = (frame) => (frame ? { url: frame.url, line: frame.lineNumber, column: frame.columnNumber, functionName: frame.functionName, module: moduleAt(frame.url, frame.lineNumber) } : null);
async function launch() {
  const proc = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
    "--disable-component-update", "--disable-sync", "--disable-default-apps", "--disable-domain-reliability",
    "--disable-client-side-phishing-detection", "--metrics-recording-only", "--use-mock-keychain",
    "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
    "--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1",
    "--remote-debugging-pipe", `--user-data-dir=${profile}`, "--window-size=1280,900", "about:blank",
  ], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
  const exited = new Promise((resolve) => proc.once("exit", (code, signal) => resolve({ code, signal })));
  const writer = proc.stdio[3];
  const reader = proc.stdio[4];
  const pending = new Map();
  let commandId = 0;
  const state = { proc, exited, pending, pages: new Map(), open: true, pid: proc.pid };
  const handle = (message) => {
    const page = message.sessionId ? state.pages.get(message.sessionId) : null;
    if (!message.method || !page) return;
    if (message.method === "Inspector.targetCrashed") {
      page.crashed = { afterCheck: lastCheckId };
      runtimeErrors.push({ page: page.name, variant: page.variant, kind: "renderer-crash", afterCheck: lastCheckId, case: currentCase, text: "Inspector.targetCrashed" });
    } else if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails ?? {};
      runtimeErrors.push({ page: page.name, variant: page.variant, kind: "exception", afterCheck: lastCheckId, case: currentCase, text: String(details.exception?.description ?? details.text ?? "").slice(0, 600), source: frameSource(details.stackTrace?.callFrames?.[0] ?? { url: details.url, lineNumber: details.lineNumber, columnNumber: details.columnNumber }) });
    } else if (message.method === "Runtime.consoleAPICalled") {
      const text = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ").slice(0, 600);
      const source = frameSource(message.params.stackTrace?.callFrames?.[0]);
      if (message.params.type === "error" || message.params.type === "assert") runtimeErrors.push({ page: page.name, variant: page.variant, kind: `console.${message.params.type}`, afterCheck: lastCheckId, case: currentCase, text, source });
      else if (message.params.type === "warning") consoleWarnings.push({ page: page.name, variant: page.variant, text: text.slice(0, 300), source, afterCheck: lastCheckId });
    } else if (message.method === "Page.javascriptDialogOpening") {
      if (message.params.type === "beforeunload" && page.navigating) {
        dialogs.push({ page: page.name, type: "beforeunload", message: message.params.message, expected: true, accepted: true, reason: "runner-initiated navigation", afterCheck: lastCheckId, case: currentCase });
        page.cdp("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
      } else {
        const plan = dialogPlan.shift() ?? null;
        const accept = plan ? plan.accept : message.params.type === "beforeunload";
        dialogs.push({ page: page.name, type: message.params.type, message: message.params.message, expected: Boolean(plan), accepted: accept, purpose: plan?.purpose ?? null, afterCheck: lastCheckId, case: currentCase });
        page.cdp("Page.handleJavaScriptDialog", { accept }).catch(() => {});
      }
    } else if (message.method === "Fetch.requestPaused") {
      navigationRequests.push({ page: page.name, url: message.params.request.url, resourceType: message.params.resourceType, afterCheck: lastCheckId, case: currentCase });
      page.cdp("Fetch.fulfillRequest", { requestId: message.params.requestId, responseCode: 204, responseHeaders: [{ name: "Cache-Control", value: "no-store" }], body: "" }).catch(() => {});
    } else if (message.method === "Input.dragIntercepted") {
      page.intercepted.push(message.params.data);
    }
  };
  const settle = (message) => {
    if (message.id && pending.has(message.id)) {
      const job = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) job.reject(Error(JSON.stringify(message.error)));
      else job.resolve(message.result);
    }
  };
  let chunks = [];
  reader.on("data", (chunk) => {
    let start = 0;
    for (let index = chunk.indexOf(0); index !== -1; index = chunk.indexOf(0, start)) {
      chunks.push(chunk.subarray(start, index));
      const text = Buffer.concat(chunks).toString("utf8");
      chunks = [];
      start = index + 1;
      let message;
      try { message = JSON.parse(text); } catch { record("devtools-message-unparsed", { afterCheck: lastCheckId, bytes: text.length }); continue; }
      try { handle(message); } catch (error) { record("devtools-event-handler-error", { afterCheck: lastCheckId, error: String(error).slice(0, 300) }); }
      settle(message);
    }
    if (start < chunk.length) chunks.push(chunk.subarray(start));
  });
  proc.once("exit", (code, signal) => { state.processExit = { code, signal, afterCheck: lastCheckId }; });
  const closed = (why) => {
    if (!state.open) return;
    state.open = false;
    state.closeReason = { why, afterCheck: lastCheckId, processExit: state.processExit ?? null, pending: pending.size };
    for (const job of pending.values()) job.reject(Error(`DevTools pipe closed (${why})`));
    pending.clear();
  };
  reader.on("close", () => closed("read end closed"));
  reader.on("error", (error) => closed(`read error: ${String(error)}`));
  writer.on("error", (error) => closed(`write error: ${String(error)}`));
  state.send = (method, params = {}, sessionId = undefined) => new Promise((resolve, reject) => {
    if (!state.open) { reject(Error("DevTools pipe not open")); return; }
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    writer.write(`${JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params })}\0`);
  });
  return state;
}
const VIEWPORT = { width: 1280, height: 900 };
async function attachPage(targetId, name, viewport = VIEWPORT) {
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  const page = { name, targetId, sessionId, navigating: false, crashed: null, intercepted: [], presses: 0, keyAudit: [], variant: null };
  page.cdp = (method, params = {}) => browser.send(method, params, sessionId);
  browser.pages.set(sessionId, page);
  await page.cdp("Inspector.enable");
  await page.cdp("Runtime.enable");
  await page.cdp("Page.enable");
  await page.cdp("DOMStorage.enable");
  await page.cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  await page.cdp("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false });
  return page;
}
const EVALUATE_TIMEOUT_MS = 20000;
async function input(page, method, params) {
  if (page.crashed) throw Object.assign(Error("PRECONDITION: renderer crashed (Inspector.targetCrashed)"), { checkId: "harness:renderer-crash", checkKind: "precondition" });
  const result = await Promise.race([page.cdp(method, params), delay(EVALUATE_TIMEOUT_MS).then(() => ({ timedOut: true }))]);
  if (result?.timedOut) throw Object.assign(Error(`PRECONDITION: input ${method} ${params.type} was not acknowledged within ${EVALUATE_TIMEOUT_MS} ms`), { checkId: "harness:input-timeout", checkKind: "precondition" });
  return result;
}
async function evaluate(page, expression) {
  if (page.crashed) throw Object.assign(Error("PRECONDITION: renderer crashed (Inspector.targetCrashed)"), { checkId: "harness:renderer-crash", checkKind: "precondition" });
  const result = await Promise.race([page.cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }), delay(EVALUATE_TIMEOUT_MS).then(() => ({ timedOut: true }))]);
  if (result.timedOut) throw Object.assign(Error(`PRECONDITION: page evaluation did not answer within ${EVALUATE_TIMEOUT_MS} ms: ${expression.slice(0, 120)}`), { checkId: "harness:page-evaluation-timeout", checkKind: "precondition" });
  if (result.exceptionDetails) throw Error(`Page evaluation failed (${page.name}): ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`);
  return result.result.value;
}
async function waitUntil(page, expression, timeout = 6000) {
  const deadline = Date.now() + timeout;
  for (;;) {
    try {
      if (await evaluate(page, expression)) return true;
    } catch (error) {
      if (error?.checkKind === "precondition") throw error;
    }
    if (Date.now() > deadline) return false;
    await delay(40);
  }
}
async function waitFor(predicate, timeout = 6000) {
  const deadline = Date.now() + timeout;
  while (!predicate()) {
    if (Date.now() > deadline) return false;
    await delay(25);
  }
  return true;
}
const SELF_TEST_PROBE = "http://example.invalid/selftest";
const keyboardAudit = { documents: 0, runnerPresses: 0, keydowns: 0, keyups: 0, keypresses: 0, untrusted: 0, mismatches: [] };
async function collectDocument(page, reason) {
  try {
    const keys = await evaluate(page, "window.__native ? __native.keys : null");
    if (keys) {
      const keydowns = keys.filter((entry) => entry.type === "keydown").length;
      const keyups = keys.filter((entry) => entry.type === "keyup").length;
      const keypresses = keys.filter((entry) => entry.type === "keypress").length;
      const untrusted = keys.filter((entry) => !entry.trusted).length;
      keyboardAudit.documents += 1;
      keyboardAudit.runnerPresses += page.presses;
      keyboardAudit.keydowns += keydowns;
      keyboardAudit.keyups += keyups;
      keyboardAudit.keypresses += keypresses;
      keyboardAudit.untrusted += untrusted;
      const expected = page.keyAudit.flatMap((key) => [`keydown:${key}`, `keyup:${key}`]);
      const actual = keys.map((entry) => `${entry.type}:${entry.key}`);
      if (keydowns !== page.presses || keyups !== page.presses || keypresses !== 0 || untrusted !== 0 || !isDeepStrictEqual(actual, expected)) {
        keyboardAudit.mismatches.push({ page: page.name, reason, afterCheck: lastCheckId, presses: page.presses, keydowns, keyups, keypresses, untrusted, head: actual.slice(0, 12) });
      }
    }
  } catch { /* no document yet */ }
  page.presses = 0;
  page.keyAudit = [];
  try {
    const list = await evaluate(page, "window.__native ? __native.network : []");
    const pageAttempts = list.filter((entry) => entry.url !== SELF_TEST_PROBE);
    networkSeen.documents += 1;
    networkSeen.attempts += pageAttempts.length;
    const nonLocal = pageAttempts.filter((entry) => !entry.local);
    networkSeen.nonLocal += nonLocal.length;
    networkSeen.samples.push(...nonLocal.slice(0, 3));
  } catch { /* no document yet */ }
}
async function navigate(page, url, { expectUnload = true } = {}) {
  await collectDocument(page, `navigate:${url}`);
  page.navigating = expectUnload;
  try {
    await page.cdp("Page.navigate", { url });
  } finally {
    setTimeout(() => { page.navigating = false; }, 2500);
  }
}
function pngSize(buffer) { return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }; }
async function screenshot(page, name, details = {}) {
  const file = `${prefix}-${name}.png`;
  pre(`screenshot:${name}:not-overwritten`, !existsSync(join(evidenceDir, file)), { file });
  await delay(120);
  const shot = await page.cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const buffer = Buffer.from(shot.data, "base64");
  writeFileSync(join(evidenceDir, file), buffer, { flag: "wx" });
  const entry = { file, page: page.name, sha256: sha256(buffer), bytes: buffer.length, png: pngSize(buffer), case: currentCase, ...details };
  artifacts.push(entry);
  record("screenshot", entry);
  return entry;
}

// ---------------------------------------------------------------------------------------------------
// Oracle (contract §2 display order, A2 merge, dnd.ts reorder semantics, §5 wording), written from the contract text
// ---------------------------------------------------------------------------------------------------
const RAIL_KEY = "xai_rail_order";
const MARKER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:committed-generation`;
const MARKER = JSON.stringify({ generation: "g1", migrationId: "apprail-native", previous: null });
const LANG_KEY = "xai_pref_lang";
const THEME_KEY = "xai_pref_theme";
const IDENTITY_KEY = "xai:auth:identity-change";
const FEATURE_IDS = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "habits", "meditation"];
const featureKey = (id) => `xai_pref_features_${id}`;
const MORE = { route: "/app/settings/more", key: "xai_pref_more_launch_at_login", toggle: '.settings-detail [role="switch"][aria-label="Launch at Login"]', failed: "Launch at Login was not saved.", discard: "Discard Launch at Login" };
/** D(S, R): every id of S in R, in S order; then every id of R not in S, in R order (contract §2). */
function displayOrder(stored, visible) {
  const inR = new Set(visible);
  const out = [];
  const seen = new Set();
  for (const id of stored) if (inR.has(id) && !seen.has(id)) { out.push(id); seen.add(id); }
  for (const id of visible) if (!seen.has(id)) { out.push(id); seen.add(id); }
  return out;
}
/** merge(S, R, P) (contract A2): S's R-slots are refilled from P in order; non-R ids stay; leftover P appended. */
function merge(stored, visible, preview) {
  const inR = new Set(visible);
  const rest = [...preview];
  const out = stored.map((id) => (inR.has(id) ? rest.shift() : id));
  return [...out, ...rest];
}
/** reorderArray semantics (dnd.ts, contract §6): move `from` to the index `to` occupies. */
function reorder(items, from, to) {
  if (from === to) return [...items];
  const fromIndex = items.indexOf(from);
  const toIndex = items.indexOf(to);
  if (fromIndex < 0 || toIndex < 0) return [...items];
  const next = [...items];
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, from);
  return next;
}
/** Contract §5 normative wording (the oracle; never taken from the product). */
const COPY = {
  en: {
    statusDraftName: "Sidebar order not saved. Review it.", statusSourceName: "Saved sidebar order is unavailable. Review it.",
    statusDraftText: "Order not saved", statusSourceText: "Order unavailable", panelName: "Sidebar order",
    saving: "Sidebar order is saving.", notSaved: "Sidebar order was not saved.",
    unavailable: "Saved sidebar order is unavailable. Reload it; this is not a new unsaved change.", exportFailed: "Export failed. Please retry.",
    retry: { label: "Retry", name: "Retry sidebar order" }, discard: { label: "Discard", name: "Discard sidebar order change" },
    export: { label: "Export", name: "Export sidebar order draft" }, reload: { label: "Reload", name: "Reload sidebar order" },
    confirmSignOut: "Your sidebar order change is not saved. Sign out and discard it?",
    /** Accepted Appearance contract r3 §5 (its sign-out confirmation). */
    appearanceSignOut: "Some appearance changes are not saved. Sign out and discard them?",
    featuresConfirmReset: "Turn all 8 modules back on? This only changes which modules are shown; your data is kept.",
  },
  zh: {
    statusDraftName: "侧栏顺序未保存，点击查看。", statusSourceName: "已保存的侧栏顺序不可用，点击查看。",
    statusDraftText: "顺序未保存", statusSourceText: "顺序不可用", panelName: "侧栏顺序",
    saving: "侧栏顺序正在保存。", notSaved: "侧栏顺序未保存。",
    unavailable: "已保存的侧栏顺序不可用。请重新读取；这不是新的未保存更改。", exportFailed: "导出失败，请重试。",
    retry: { label: "重试", name: "重试 侧栏顺序" }, discard: { label: "放弃", name: "放弃 侧栏顺序更改" },
    export: { label: "导出", name: "导出侧栏顺序草稿" }, reload: { label: "重新读取", name: "重新读取 侧栏顺序" },
    confirmSignOut: "侧栏顺序更改尚未保存。仍要退出并放弃这项更改吗？",
    appearanceSignOut: "部分外观更改尚未保存。仍要退出并放弃这些更改吗？",
    featuresConfirmReset: "将全部 8 个模块恢复为开启？这只改变显示哪些模块，数据会保留。",
  },
};
const actionsFor = (lang, kind) => (kind === "source" ? [{ testid: "rail-order-reload", ...COPY[lang].reload }]
  : [{ testid: "rail-order-retry", ...COPY[lang].retry }, { testid: "rail-order-discard", ...COPY[lang].discard }, { testid: "rail-order-export", ...COPY[lang].export }]);
/** Contract §5 item 2 (every malformed value) plus an unreadable source. */
const MALFORMED = [
  { label: "object-empty", raw: "{}", cls: "not-iterable" },
  { label: "object-tasks", raw: "{\"tasks\":1}", cls: "not-iterable" },
  { label: "number-1", raw: "1", cls: "not-iterable" },
  { label: "number-0", raw: "0", cls: "not-iterable" },
  { label: "number-minus-1", raw: "-1", cls: "not-iterable" },
  { label: "true", raw: "true", cls: "not-iterable" },
  { label: "false", raw: "false", cls: "not-iterable" },
  { label: "string-tasks", raw: "\"tasks\"", cls: "string" },
  { label: "array-1", raw: "[1]", cls: "non-string-element" },
  { label: "array-tasks-2", raw: "[\"tasks\",2]", cls: "non-string-element" },
  { label: "array-null", raw: "[null]", cls: "non-string-element" },
  { label: "array-nested", raw: "[[\"tasks\"]]", cls: "non-string-element" },
  { label: "repeated-tasks", raw: "[\"tasks\",\"tasks\"]", cls: "repeated-string" },
  { label: "repeated-board", raw: "[\"board\",\"tasks\",\"board\"]", cls: "repeated-string" },
  { label: "null-literal", raw: "null", cls: "null-or-unparsable" },
  { label: "unparsable", raw: "[tasks", cls: "null-or-unparsable" },
  { label: "empty-string", raw: "", cls: "null-or-unparsable" },
  { label: "unreadable", raw: null, cls: "unreadable" },
];
/** The class of a raw value, computed from contract A5 (never from the product). */
function classOf(raw) {
  let value;
  try { value = JSON.parse(raw); } catch { return "null-or-unparsable"; }
  if (value === null) return "null-or-unparsable";
  if (typeof value === "string") return "string";
  if (!Array.isArray(value)) return "not-iterable";
  if (!value.every((entry) => typeof entry === "string")) return "non-string-element";
  if (new Set(value).size !== value.length) return "repeated-string";
  return "valid";
}
let facts0 = null;
const railIds = () => facts0.registrations.filter((entry) => entry.showInRail).sort((left, right) => (left.railOrder - right.railOrder) || (left.moduleId < right.moduleId ? -1 : left.moduleId > right.moduleId ? 1 : 0)).map((entry) => entry.moduleId);
const visibleIds = (hidden = []) => railIds().filter((id) => !hidden.includes(id));
const labelOf = (lang, id) => facts0.labels[lang].nav[id] ?? id;
const idsToLabels = (lang, ids) => ids.map((id) => labelOf(lang, id));
const labelsToIds = (lang, labels) => labels.map((label) => railIds().find((id) => labelOf(lang, id) === label) ?? `?${label}`);
const parse = (raw) => { try { return JSON.parse(raw); } catch { return undefined; } };
const REVERSED = () => [...railIds()].reverse();
const BOARD_AT_2 = ["calendar", "tasks", "board", "dashboard", "matrix", "pomodoro", "timetrack", "bookkeeping", "metrics", "habits", "meditation", "countdown", "ai", "statistics"];

// ---------------------------------------------------------------------------------------------------
// Documents: seed page, App mount, input
// ---------------------------------------------------------------------------------------------------
let selfTested = false;
let mainPage = null;
const KEYDEFS = { Escape: { code: "Escape", vk: 27 } };
/** One trusted key press without nativeVirtualKeyCode (lesson K-1); counted for the key audit. */
async function press(page, key) {
  const def = KEYDEFS[key];
  page.presses += 1;
  page.keyAudit.push(key);
  await input(page, "Input.dispatchKeyEvent", { type: "rawKeyDown", key, code: def.code, windowsVirtualKeyCode: def.vk });
  await input(page, "Input.dispatchKeyEvent", { type: "keyUp", key, code: def.code, windowsVirtualKeyCode: def.vk });
  await delay(60);
}
async function seed(page, entries, label) {
  await navigate(page, `${origin}/seed`);
  pre(`${label}:seed-page-loaded-with-prelude-only`, await waitUntil(page, "document.readyState === 'complete' && location.pathname === '/seed' && !!window.__native && !window.verify", 10000));
  if (!selfTested) {
    const result = await evaluate(page, "__native.selfTest()");
    record("instrument-selftest", { page: "/seed (prelude only, no product code)", result });
    pre("instruments:storage-faults-f-b002-dispatch-locks-history-unload-export-confirm-network-console-errorui-input-drag-rail-observer", result.quotaThrew && result.quotaNeverStored && result.throwingSetThrew && result.throwingSetNeverStored
      && result.setDelegated && result.readbackAfterSetDenied && result.readbackOneShot && result.getDenied && result.removeDelegated && Object.values(result.totalDenial).every(Boolean) && result.noNestedStorageCalls
      && isDeepStrictEqual(result.dispatchCounted, ["storage:xai_native_apprail_fixed_selftest:true", "bus:web:settings:preference-changed"])
      && result.nonLocalFetchRefusedAndLogged && result.lockHeldAndPending && result.middleHeldAfterFirst && result.fifoOrder === "app1,app2" && isDeepStrictEqual(result.lockAttribution, ["fixture", "app", "fixture", "app"])
      && isDeepStrictEqual(result.historyTraced, ["pushState:selftest-push", "replaceState:selftest-replace"]) && result.popTraced === 1 && result.unloadTracked && result.urlTraced && result.confirmWrapped
      && result.consoleErrorTraced && result.errorUiTraced && result.untrustedClickTraced && result.untrustedDragTraced && result.railObserverTraced, { result });
    const keyMark = await evaluate(page, "__native.mark()");
    await press(page, "Escape");
    const keys = (await evaluate(page, `__native.window(${keyMark})`)).keys;
    pre("instruments:k1-one-trusted-escape-is-exactly-one-keydown-and-keyup", isDeepStrictEqual(keys.map((entry) => `${entry.type}:${entry.key}:${entry.code}:${entry.trusted}`), ["keydown:Escape:Escape:true", "keyup:Escape:Escape:true"]), { keys });
    selfTested = true;
  }
  const stored = await evaluate(page, `(() => { __native.native.clear(); const seeds = ${JSON.stringify(entries)}; for (const [key, value] of Object.entries(seeds)) __native.native.set(key, value); return __native.native.snapshot(); })()`);
  pre(`${label}:seeded-exact-bytes`, isDeepStrictEqual(stored, entries), { stored });
}
const seedsFor = (lang, extra = {}) => ({ [MARKER_KEY]: MARKER, ...(lang === "zh" ? { [LANG_KEY]: JSON.stringify("zh") } : {}), ...extra });
const featuresAll = (value = "true") => Object.fromEntries(FEATURE_IDS.map((feature) => [featureKey(feature), value]));
const READY_APP = "(!!window.verify && !!window.__native && !!document.querySelector('.app header.topbar') && !!document.querySelector('.app-rail .rail-items') && !document.querySelector('.account-data-gate') && verify.scope().kind === 'account')";
const CRASHED = "(!!window.__native && !!__native.routeError())";
const FEATURES_PANE = '.settings-detail[data-pane="features"]';
const READY_FEATURES = `(${READY_APP} && !!document.querySelector('${FEATURES_PANE} [data-feature-id="board"] [role="switch"]'))`;
const READY_MORE = `(${READY_APP} && !!document.querySelector(${JSON.stringify(MORE.toggle)}))`;
/**
 * Production App mount of `variant`. A failed mount of the production App is a harness precondition unless
 * `requireApp` is false (row o, where a crash would be the product failure under test and is checked by the caller).
 */
async function mountApp(page, label, { path = "/app/tasks", variant = "fixed", ready = READY_APP, requireApp = true, faultPlan = null, hidePet = true } = {}) {
  currentVariant = variant;
  let planId = null;
  if (faultPlan) planId = (await page.cdp("Page.addScriptToEvaluateOnNewDocument", { source: `window.__nativeFaultPlan = ${JSON.stringify(faultPlan)};` })).identifier;
  await navigate(page, `${origin}${path}`);
  page.variant = variant;
  const settled = await waitUntil(page, `${ready} || ${CRASHED}`, 20000);
  await delay(600);
  if (planId) await page.cdp("Page.removeScriptToEvaluateOnNewDocument", { identifier: planId });
  const state = await evaluate(page, `({ ready: ${ready}, crashed: ${CRASHED}, routeError: window.__native ? __native.routeError() : null, verifyPresent: !!window.verify, variant: window.verify ? verify.variant : null, path: location.pathname,
    planApplied: window.__native ? __native.planApplied : null, body: (document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 300) })`);
  pre(`${label}:document-loaded-and-bundle-evaluated`, settled && state.verifyPresent && state.variant === variant, { state, variant });
  if (faultPlan) pre(`${label}:read-fault-plan-applied-before-mount`, isDeepStrictEqual(state.planApplied?.get ?? null, faultPlan.get), { planApplied: state.planApplied });
  const facts = await evaluate(page, `({ composition: verify.composition, instance: verify.instance, scope: verify.scope(), auth: verify.authCalls(), markerKey: verify.markerKey,
    lockName: verify.lockName(), physicalKey: verify.physicalKey(), lifecycle: verify.lifecycle, registryDefault: verify.registryDefault, registryCodec: verify.registryCodec,
    registrations: verify.registrations, labels: verify.labels, rail: __native.railNames(), topbar: __native.topbar(), pet: !!document.querySelector('.pet-wrap'), location: verify.location(),
    mountMutations: __native.window(0).attempts.filter((entry) => entry.op === 'set' || entry.op === 'remove' || entry.op === 'clear').map((entry) => ({ op: entry.op, key: entry.key, outcome: entry.outcome })),
    mountRailAttempts: __native.window(0).attempts.filter((entry) => entry.key === ${JSON.stringify(RAIL_KEY)}).map((entry) => entry.op + ':' + entry.outcome) })`);
  record("observation", { id: `${label}:mounted`, variant, path, ready: state.ready, routeError: state.routeError, rail: facts.rail, topbarControls: facts.topbar.controlsOrder, mountMutations: facts.mountMutations, mountRailAttempts: facts.mountRailAttempts, instance: facts.instance });
  pre(`${label}:auth-session-context-served-by-real-provider`, facts.composition === "production-app" && facts.auth.includes("getSession") && facts.markerKey === MARKER_KEY, { auth: facts.auth, markerKey: facts.markerKey });
  pre(`${label}:real-lock-name-and-unscoped-device-key`, facts.lockName === `xai:pref:v1:${RAIL_KEY}` && facts.physicalKey === RAIL_KEY, { lockName: facts.lockName, physicalKey: facts.physicalKey });
  if (requireApp) {
    pre(`${label}:production-app-mounted`, state.ready && !state.crashed, { state });
    pre(`${label}:account-data-gate-activated-account`, facts.scope.kind === "account" && facts.scope.accountId === OWNER && facts.scope.generation === "g1", { scope: facts.scope });
    pre(`${label}:production-surfaces-present`, facts.rail.length > 0 && facts.topbar.present && facts.pet, { rail: facts.rail.length, pet: facts.pet });
  }
  if (!facts0) {
    facts0 = { registrations: facts.registrations, labels: facts.labels, registryDefault: facts.registryDefault, registryCodec: facts.registryCodec, lifecycle: facts.lifecycle, lockName: facts.lockName };
    record("observation", { id: "archive-facts", ...facts0, railIds: railIds() });
    pre("archive-facts:fourteen-rail-modules-and-twelve-defaults-and-labels", railIds().length === 14 && Array.isArray(facts0.registryDefault) && facts0.registryDefault.length === 12 && facts0.registryCodec === "json"
      && ["en", "zh"].every((lang) => facts0.labels[lang].nav.pet && facts0.labels[lang].avatar.signOut && facts0.labels[lang].avatar.settings && facts0.labels[lang].settings.about && facts0.labels[lang].settings.theme && facts0.labels[lang].settings.dark), { railIds: railIds(), registryDefault: facts0.registryDefault, labels: facts0.labels });
  }
  if (hidePet && state.ready && facts.pet) await hideThePet(page, label);
  return { state, facts };
}
/** R-PET gated mode (contract §9, A10): the pet is hidden through the product's own rail pet toggle by a trusted click. */
async function hideThePet(page, label) {
  const lang = await evaluate(page, "document.documentElement.getAttribute('lang') === 'zh' ? 'zh' : (document.querySelector('.topbar .topbar-pref-trigger')?.getAttribute('title') === '外观' ? 'zh' : 'en')");
  const name = facts0.labels[lang].nav.pet;
  await trustedClick(page, `.app-rail .rail-bottom .rail-btn[aria-label=${JSON.stringify(name)}]`, `${label}:pet-toggle`);
  pre(`${label}:pet-hidden-through-the-rail-toggle`, await waitUntil(page, "!document.querySelector('.pet-wrap')", 3000));
  await parkMouse(page);
}
async function parkMouse(page) {
  await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: 640, y: 4 });
  await delay(40);
}
async function railPoint(page, name, label) {
  const point = await evaluate(page, `(() => {
    const matches = [...document.querySelectorAll('.app-rail .rail-items .rail-btn')].filter((button) => button.getAttribute('aria-label') === ${JSON.stringify(name)});
    if (matches.length !== 1) return { count: matches.length };
    const rect = matches[0].getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { count: 1, x, y, width: rect.width, height: rect.height, inViewport: x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight, hit: !!hit && matches[0].contains(hit), hitTarget: hit ? hit.tagName + '.' + (typeof hit.className === 'string' ? hit.className : '') : null };
  })()`);
  pre(`${label}:exactly-one-rail-button:${name}`, point.count === 1, { point });
  pre(`${label}:centre-hit-test-uncovered:${name}`, point.hit && point.inViewport, { point });
  return point;
}
async function trustedClick(page, selector, label) {
  const measure = `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { found: false };
    element.scrollIntoView({ block: "center", inline: "nearest" });
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { found: true, x, y, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + (typeof hit.className === "string" ? hit.className.slice(0, 60) : "") : null };
  })()`;
  let point = await evaluate(page, measure);
  pre(`input:control-present:${label}`, point.found, { selector });
  if (!point.hit) { await delay(400); point = await evaluate(page, measure); }
  pre(`input:centre-hit-test:${label}`, point.hit, { selector, hitTarget: point.hitTarget });
  const mark = await evaluate(page, "__native.mark()");
  await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await input(page, "Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(80);
  // Exactly one trusted click from the runner; a product's own programmatic click (the export anchor) is untrusted and recorded.
  const clicks = (await evaluate(page, `__native.window(${mark}).events`)).filter((entry) => entry.type === "click");
  pre(`input:one-trusted-click:${label}`, clicks.filter((entry) => entry.trusted).length === 1, { clicks });
  return point;
}
/** Tags exactly one element (expression: page JS evaluating to an array of candidates) and clicks it. */
async function clickOne(page, expression, label) {
  const found = await evaluate(page, `(() => {
    document.querySelectorAll("[data-native-target]").forEach((element) => element.removeAttribute("data-native-target"));
    const matches = (${expression});
    if (matches.length === 1) matches[0].setAttribute("data-native-target", "1");
    return matches.length;
  })()`);
  pre(`input:exactly-one-control:${label}`, found === 1, { found });
  const point = await trustedClick(page, '[data-native-target="1"]', label);
  await evaluate(page, 'document.querySelector("[data-native-target]")?.removeAttribute("data-native-target")').catch(() => {});
  return point;
}
const railNow = (page) => evaluate(page, "__native.railNames()");
const bytesNow = (page) => evaluate(page, `__native.native.get(${JSON.stringify(RAIL_KEY)})`);
async function devtoolsBytes(page, key = RAIL_KEY) {
  const { entries } = await page.cdp("DOMStorage.getDOMStorageItems", { storageId: { storageKey: `${origin}/`, isLocalStorage: true } });
  const found = entries.find(([name]) => name === key);
  return found ? found[1] : null;
}
const statusNow = (page) => evaluate(page, "__native.railStatus()");
const markOf = (page) => evaluate(page, "__native.mark()");
const railOps = (attempts, ops = ["set", "remove", "clear"]) => attempts.filter((entry) => (entry.key === RAIL_KEY || entry.op === "clear") && ops.includes(entry.op));
const brief = (attempts) => attempts.map((entry) => `${entry.seq}:${entry.op}:${entry.key}:${entry.outcome}${entry.value !== undefined ? `=${String(entry.value).slice(0, 80)}` : ""}`);

/**
 * One trusted rail drag (contract §6 item 8): source and targets by accessible name, each centre-hit-tested in the DOM
 * of that moment. end = "drop" (on the last target), "cancel" (dragCancel), "drop-outside" (on the main content, not
 * editable) or "drop-input" (on a text field in the main content). pauseAfterEnter > 0 (the D1 probe) waits between
 * dragEnter and dragOver and snapshots the rail in between.
 */
async function dragGesture(page, label, { source, targets, end = "drop", pauseAfterEnter = 0 }) {
  const sourcePoint = await railPoint(page, source, `${label}:source`);
  const firstPoint = await railPoint(page, targets[0], `${label}:target-0`);
  const mark = await markOf(page);
  page.intercepted = [];
  const steps = [];
  let lastPoint = firstPoint;
  let outside = null;
  await page.cdp("Input.setInterceptDrags", { enabled: true });
  try {
    await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: sourcePoint.x, y: sourcePoint.y });
    await input(page, "Input.dispatchMouseEvent", { type: "mousePressed", x: sourcePoint.x, y: sourcePoint.y, button: "left", buttons: 1, clickCount: 1 });
    await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: sourcePoint.x + 2, y: sourcePoint.y + 6, button: "left", buttons: 1 });
    await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: firstPoint.x, y: firstPoint.y, button: "left", buttons: 1 });
    pre(`${label}:browser-drag-started-and-intercepted`, await waitFor(() => page.intercepted.length > 0, 4000), { intercepted: page.intercepted.length });
    const data = page.intercepted[0];
    for (let index = 0; index < targets.length; index += 1) {
      const point = index === 0 ? firstPoint : await railPoint(page, targets[index], `${label}:target-${index}`);
      await input(page, "Input.dispatchDragEvent", { type: "dragEnter", x: point.x, y: point.y, data });
      let afterEnter = null;
      if (pauseAfterEnter > 0) {
        await delay(pauseAfterEnter);
        afterEnter = await evaluate(page, "({ seq: __native.mark(), rail: __native.railNames() })");
      }
      await input(page, "Input.dispatchDragEvent", { type: "dragOver", x: point.x, y: point.y, data });
      await delay(250);
      const afterOver = pauseAfterEnter > 0 ? await evaluate(page, "({ seq: __native.mark(), rail: __native.railNames() })") : null;
      // A resting pointer keeps sending dragover (frozen before convention, development probe 1 there): the reorder moves
      // the dragged button under the pointer, and Chrome accepts a drop only over an element whose latest dragover was
      // accepted.
      await input(page, "Input.dispatchDragEvent", { type: "dragOver", x: point.x, y: point.y, data });
      await delay(250);
      steps.push({ target: targets[index], afterEnter, afterOver, ...(await evaluate(page, `({ seq: __native.mark(), rail: __native.railNames(), dragging: __native.rail().filter((entry) => entry.dragging).map((entry) => entry.name), bytes: __native.native.get(${JSON.stringify(RAIL_KEY)}) })`)) });
      lastPoint = point;
    }
    if (end === "drop") {
      await input(page, "Input.dispatchDragEvent", { type: "drop", x: lastPoint.x, y: lastPoint.y, data });
      await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: lastPoint.x, y: lastPoint.y, button: "left", buttons: 0, clickCount: 1 });
    } else if (end === "cancel") {
      await input(page, "Input.dispatchDragEvent", { type: "dragCancel", x: lastPoint.x, y: lastPoint.y, data });
      await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: lastPoint.x, y: lastPoint.y, button: "left", buttons: 0, clickCount: 1 });
    } else if (end === "drop-outside" || end === "drop-input") {
      outside = await evaluate(page, end === "drop-outside" ? `(() => {
        const main = document.querySelector('.app-main');
        if (!main) return { found: false };
        const rect = main.getBoundingClientRect();
        const x = rect.left + rect.width / 2, y = rect.top + Math.min(rect.height / 2, 300);
        const hit = document.elementFromPoint(x, y);
        return { found: true, x, y, hitTarget: hit ? hit.tagName + '.' + (typeof hit.className === 'string' ? hit.className.slice(0, 60) : '') : null,
          inRail: !!(hit && hit.closest('.app-rail')), editable: !!(hit && (hit.isContentEditable || /^(INPUT|TEXTAREA)$/.test(hit.tagName))), inMain: !!(hit && hit.closest('.app-main')) };
      })()` : `(() => {
        // The first plain text field that is centre-hit after being scrolled into view (scanning stops there).
        const field = [...document.querySelectorAll('.app-main input, .app-main textarea')].find((candidate) => {
          if (candidate.disabled || candidate.readOnly) return false;
          if (candidate.tagName === 'INPUT' && !['', 'text', 'search'].includes((candidate.getAttribute('type') || '').toLowerCase())) return false;
          candidate.scrollIntoView({ block: 'center', inline: 'nearest' });
          const box = candidate.getBoundingClientRect();
          if (box.width < 20 || box.height < 12) return false;
          return document.elementFromPoint(box.left + Math.min(box.width / 2, 60), box.top + box.height / 2) === candidate;
        });
        if (!field) return { found: false };
        const rect = field.getBoundingClientRect();
        const x = rect.left + Math.min(rect.width / 2, 60), y = rect.top + rect.height / 2;
        const hit = document.elementFromPoint(x, y);
        field.setAttribute('data-native-drop-field', '1');
        return { found: true, x, y, hitTarget: hit ? hit.tagName + '.' + (typeof hit.className === 'string' ? hit.className.slice(0, 60) : '') : null, valueBefore: field.value,
          placeholder: field.getAttribute('placeholder'), inRail: !!(hit && hit.closest('.app-rail')), editable: hit === field, inMain: !!(hit && hit.closest('.app-main')) };
      })()`);
      pre(`${label}:${end}-point-${end === "drop-outside" ? "on-main-content-not-rail-not-editable" : "on-a-text-field-in-the-main-content"}`, outside.found && !outside.inRail && outside.inMain && (end === "drop-outside" ? !outside.editable : outside.editable), { outside });
      await input(page, "Input.dispatchDragEvent", { type: "dragEnter", x: outside.x, y: outside.y, data });
      await input(page, "Input.dispatchDragEvent", { type: "dragOver", x: outside.x, y: outside.y, data });
      await delay(150);
      await input(page, "Input.dispatchDragEvent", { type: "dragOver", x: outside.x, y: outside.y, data });
      await delay(150);
      await input(page, "Input.dispatchDragEvent", { type: "drop", x: outside.x, y: outside.y, data });
      await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: outside.x, y: outside.y, button: "left", buttons: 0, clickCount: 1 });
      lastPoint = outside;
    }
  } finally {
    await page.cdp("Input.setInterceptDrags", { enabled: false }).catch(() => {});
  }
  await delay(500);
  await parkMouse(page);
  const view = await evaluate(page, `__native.window(${mark})`);
  const drags = view.drags;
  pre(`${label}:every-recorded-drag-event-trusted`, drags.length > 0 && drags.every((entry) => entry.trusted), { drags: drags.map((entry) => `${entry.type}:${entry.target.label}:${entry.trusted}`) });
  pre(`${label}:trusted-dragstart-on-the-source`, drags.some((entry) => entry.type === "dragstart" && entry.target.label === source && entry.target.railButton), { source });
  pre(`${label}:trusted-dragover-on-every-target`, targets.every((target) => drags.some((entry) => entry.type === "dragover" && entry.target.label === target)), { targets });
  pre(`${label}:gesture-ended-with-dragend`, drags.some((entry) => entry.type === "dragend"), {});
  const dropEvents = drags.filter((entry) => entry.type === "drop");
  if (end === "drop") pre(`${label}:trusted-drop-inside-rail-items`, dropEvents.length === 1 && dropEvents[0].target.inRailItems, { dropEvents: dropEvents.map((entry) => entry.target) });
  else pre(`${label}:no-drop-inside-rail-items`, dropEvents.every((entry) => !entry.target.inRailItems), { dropEvents: dropEvents.map((entry) => entry.target) });
  if (end === "drop-input") {
    // The release is over the text field: its latest trusted dragover is on the field. Whether Chrome then delivers a
    // `drop` to the field is browser behaviour (development probes dev5-dev7: with the intercepted mask 16 = "move",
    // from the product's effectAllowed "move", headless Chrome ended the gesture with dragleave + dragend over the
    // field and no drop); it is recorded, not required. The drag data is never altered.
    const overField = drags.filter((entry) => entry.type === "dragover").at(-1);
    pre(`${label}:release-over-the-text-field-after-a-trusted-dragover-on-it`, overField && overField.target.editable && overField.trusted && dropEvents.every((entry) => entry.target.editable),
      { trace: drags.map((entry) => `${entry.seq}:${entry.type}:${entry.target.label ?? entry.target.tag}:${entry.effectAllowed}:${entry.dropEffect}`), outside, intercepted: page.intercepted[0] ?? null });
  }
  const dropSeq = dropEvents.find((entry) => entry.target.inRailItems)?.seq ?? null;
  const startSeq = drags.find((entry) => entry.type === "dragstart").seq;
  const endSeq = drags.filter((entry) => entry.type === "dragend").at(-1).seq;
  const railAttempts = view.attempts.filter((entry) => entry.key === RAIL_KEY);
  const sets = railAttempts.filter((entry) => entry.op === "set");
  const d1 = d1Of(drags, view.railChanges, source);
  const result = {
    mark, steps, end, outside, dropSeq, startSeq, endSeq, d1,
    trace: drags.map((entry) => `${entry.seq}:${entry.type}:${entry.target.label ?? entry.target.tag}:${entry.trusted ? "trusted" : "UNTRUSTED"}`),
    attemptsDuringGesture: railAttempts.filter((entry) => entry.seq > startSeq && (dropSeq === null ? entry.seq < endSeq : entry.seq < dropSeq)),
    sets: sets.map((entry) => ({ seq: entry.seq, value: entry.value, outcome: entry.outcome, phase: dropSeq !== null && entry.seq > dropSeq ? "after-drop" : entry.seq < startSeq ? "before-gesture" : "during-gesture" })),
    removes: railAttempts.filter((entry) => entry.op === "remove").length,
    lockRequests: view.locks.filter((entry) => entry.by === "app" && entry.name === `xai:pref:v1:${RAIL_KEY}`).length,
    dropFieldValue: end === "drop-input" ? await evaluate(page, "document.querySelector('[data-native-drop-field]')?.value ?? null") : null,
    dropDeliveredToField: end === "drop-input" ? dropEvents.some((entry) => entry.target.editable) : null,
    intercepted: page.intercepted[0] ?? null,
  };
  d1Log.push({ case: currentCase, label, end, pauseAfterEnter, ...d1 });
  record("observation", { id: `${label}:drag`, source, targets, end, pauseAfterEnter, steps, outside, dropSeq, endSeq, trace: result.trace, sets: result.sets, attemptsDuringGesture: brief(result.attemptsDuringGesture), lockRequests: result.lockRequests, d1, dropFieldValue: result.dropFieldValue });
  return result;
}
/**
 * D1 evidence: the dragenter and dragover targets, and after which drag event each displayed-order change was observed
 * (MutationObserver stamp vs the capture-phase event stamps).
 */
function d1Of(drags, changes, source) {
  const events = drags.map((entry) => ({ seq: entry.seq, type: entry.type, target: entry.target.label ?? entry.target.tag, rail: entry.railAtDispatch }));
  const previewChanges = changes.map((change) => {
    const prior = events.filter((entry) => entry.seq < change.seq).at(-1) ?? null;
    return { seq: change.seq, afterEvent: prior ? `${prior.type}:${prior.target}` : null, afterType: prior?.type ?? null, rail: change.rail };
  });
  return {
    dragenterTargets: events.filter((entry) => entry.type === "dragenter").map((entry) => entry.target),
    dragoverTargets: events.filter((entry) => entry.type === "dragover").map((entry) => entry.target),
    previewChanges: previewChanges.map((entry) => ({ seq: entry.seq, afterEvent: entry.afterEvent, firstThree: entry.rail.slice(0, 3) })),
    changesAfterDragenter: previewChanges.filter((entry) => entry.afterType === "dragenter").length,
    changesAfterDragoverOnAnotherButton: previewChanges.filter((entry) => entry.afterType === "dragover" && !entry.afterEvent.endsWith(`:${source}`)).length,
    changesAfterDragend: previewChanges.filter((entry) => entry.afterType === "dragend").length,
  };
}

// ---------------------------------------------------------------------------------------------------
// Status, panel, actions, segments, sign-out, second documents, downloads
// ---------------------------------------------------------------------------------------------------
/** The status button and (when open) the panel equal the contract wording for `kind` in `lang`. */
function statusMatches(view, lang, kind, { open = null } = {}) {
  if (!view.present) return false;
  const name = kind === "source" ? COPY[lang].statusSourceName : COPY[lang].statusDraftName;
  const text = kind === "source" ? COPY[lang].statusSourceText : COPY[lang].statusDraftText;
  const buttonOk = view.name === name && view.text === text && view.textVisible && view.tag === "button" && view.type === "button" && view.controls === "rail-order-panel" && view.rootInControls && view.rootIsOneElement
    && view.rect && view.rect.width >= 44 && view.rect.height >= 44;
  if (!buttonOk) return false;
  if (open === null) return true;
  if (!open) return view.expanded === "false" && view.panel === null;
  const panel = view.panel;
  if (!panel || view.expanded !== "true") return false;
  const message = kind === "source" ? { text: COPY[lang].unavailable, role: "alert" } : kind === "saving" ? { text: COPY[lang].saving, role: "status" } : { text: COPY[lang].notSaved, role: "alert" };
  const expectedActions = actionsFor(lang, kind === "source" ? "source" : "draft").map((entry) => ({ testid: entry.testid, name: entry.name, label: entry.label }));
  const actualActions = panel.actions.map((entry) => ({ testid: entry.testid, name: entry.name, label: entry.label }));
  const retry = panel.actions.find((entry) => entry.testid === "rail-order-retry");
  const retryState = kind === "saving" ? retry?.ariaDisabled === "true" : kind === "failed" ? retry?.ariaDisabled === null : true;
  return panel.id === "rail-order-panel" && panel.role === "dialog" && panel.label === COPY[lang].panelName && panel.modal === null && panel.followsButton && panel.inRoot
    && isDeepStrictEqual(panel.message, message) && isDeepStrictEqual(actualActions, expectedActions) && retryState && panel.actions.every((entry) => entry.tag === "button" && entry.type === "button" && !entry.disabled);
}
async function openPanel(page, label) {
  const view = await statusNow(page);
  pre(`${label}:status-present-to-open`, view.present, { view });
  if (view.expanded !== "true") await trustedClick(page, '[data-testid="rail-order-status"]', `${label}:status-button`);
  pre(`${label}:panel-open`, await waitUntil(page, "!!document.querySelector('[data-testid=\"rail-order-panel\"]')", 3000));
  return statusNow(page);
}
const clickTestId = (page, testid, label) => trustedClick(page, `[data-testid="${testid}"]`, label);
const counters = (snapshot) => ({ push: snapshot.history.filter((entry) => entry.method === "pushState").length, replace: snapshot.history.filter((entry) => entry.method === "replaceState").length, popstate: snapshot.pops.length, commits: snapshot.commits.length });
const ZERO = { push: 0, replace: 0, popstate: 0, commits: 0 };
/** One consistent read of every surface and of the instrument windows since `since`. */
async function snap(page, since) {
  return evaluate(page, `(() => {
    const w = __native.window(${since});
    const r = window.verify ? verify.window(${since}) : { navigateCalls: [], blockerCalls: [], commits: [], scope: [], auth: [] };
    return {
      rail: __native.railNames(), status: __native.railStatus(), topbar: __native.topbar(), focus: __native.focus(), routeError: __native.routeError(),
      bytes: __native.native.get(${JSON.stringify(RAIL_KEY)}), location: window.verify ? verify.location() : null, scope: window.verify ? verify.scope() : null,
      unloadListeners: __native.unloadListeners(), departure: __native.departureDialog(), gate: __native.gate(), path: location.pathname,
      attempts: w.attempts, locks: w.locks, events: w.events, confirm: w.confirm, dispatches: w.dispatches, received: w.storageReceived, nested: w.nested,
      history: w.history, pops: w.pops, consoleErrors: w.consoleErrors, errorUi: w.errorUi, unload: w.unload, railChanges: w.railChanges,
      commits: r.commits, navigateCalls: r.navigateCalls, blockerCalls: r.blockerCalls, scopeLog: r.scope, auth: r.auth,
      coordinator: window.__nativeAuth ? JSON.parse(JSON.stringify(window.__nativeAuth)) : null,
    };
  })()`);
}
async function beginSegment(page, id) {
  return { id, page, mark: await markOf(page), errorsAt: runtimeErrors.length };
}
/** Row gate: history counters and a runtime-error gate per segment (contract §9 "History counters ... on every row"). */
async function endSegment(segment, expected = null, extra = {}) {
  const now = await snap(segment.page, segment.mark);
  const errors = runtimeErrors.slice(segment.errorsAt);
  const counts = counters(now);
  const gate = { id: segment.id, variant: segment.page.variant, counters: counts, runtimeErrors: errors.length, pageConsoleErrors: now.consoleErrors.length, errorUi: now.errorUi.length, routeError: now.routeError, ...extra };
  rowGates.push(gate);
  record("row-gate", { ...gate, history: now.history.map((entry) => `${entry.seq}:${entry.method}:${entry.url}`), pops: now.pops.map((entry) => `${entry.seq}:${entry.path}`), commits: now.commits.map((entry) => `${entry.seq}:${entry.action}:${entry.pathname}`) });
  if (extra.reference) return { now, counts, errors };
  if (expected) check(`${segment.id}:history-counters`, isDeepStrictEqual(counts, expected), { counts, expected });
  check(`${segment.id}:runtime-error-gate`, errors.length === 0 && now.consoleErrors.length === 0 && now.errorUi.length === 0 && now.routeError === null, { errors: errors.slice(0, 3), consoleErrors: now.consoleErrors.slice(0, 3), errorUi: now.errorUi });
  return { now, counts, errors };
}
const caseStart = (id) => { currentCase = id; progress(id); };
/** A failed rail drop: the set fault is armed (`kind`), the drop is admitted and the status settles as a failed draft. */
async function failedDrop(page, label, lang, { S, hidden = [], sourceIndex = 0, targetIndex = 2, kind = "QuotaExceededError", invalidSource = false } = {}) {
  const R = visibleIds(hidden);
  const D0 = displayOrder(S, R);
  const rail = await railNow(page);
  pre(`${label}:rail-displays-D(S,R)-before-the-drag`, isDeepStrictEqual(rail, idsToLabels(lang, D0)), { rail, expected: D0 });
  if (!invalidSource) await evaluate(page, `__native.denySet(${JSON.stringify(RAIL_KEY)}, ${JSON.stringify(kind)})`);
  const gesture = await dragGesture(page, label, { source: labelOf(lang, D0[sourceIndex]), targets: [labelOf(lang, D0[targetIndex])], end: "drop" });
  const P = reorder(D0, D0[sourceIndex], D0[targetIndex]);
  const settled = await waitUntil(page, `(() => { const s = __native.railStatus(); return s.present && s.name === ${JSON.stringify(COPY[lang].statusDraftName)}; })()`, 6000);
  await delay(300);
  const now = await snap(page, gesture.mark);
  const sets = railOps(now.attempts, ["set"]);
  if (!invalidSource) pre(`${label}:fault-armed-and-observed`, sets.length >= 1 && sets.every((entry) => entry.outcome.startsWith("denied")), { sets: brief(sets) });
  pre(`${label}:drop-settled-as-a-failed-draft`, settled, { status: now.status });
  return { S, R, D0, P, expected: merge(S, R, P), gesture, sets };
}
/** Rail avatar -> AvatarMenu "Sign Out" -> SignOutConfirmDialog confirm -> App.handleSignOut. */
async function signOutThroughUi(page, id, lang) {
  await trustedClick(page, ".app-rail .rail-avatar", `${id}:rail-avatar`);
  pre(`${id}:avatar-menu-open`, await waitUntil(page, "__native.avatarMenuOpen()", 3000));
  await clickOne(page, `[...document.querySelectorAll('.avatar-menu .avm-item')].filter((element) => (element.textContent || '').replace(/\\s+/g, ' ').trim() === ${JSON.stringify(facts0.labels[lang].avatar.signOut)})`, `${id}:avatar-sign-out`);
  pre(`${id}:sign-out-confirm-dialog-open`, await waitUntil(page, "__native.signOutDialogOpen()", 3000));
  const start = { mark: await markOf(page), errorsAt: runtimeErrors.length, dialogsAt: dialogs.length, requestsAt: navigationRequests.length };
  await trustedClick(page, "dialog.xai-sign-out-dialog .xai-sign-out-dialog__btn--confirm", `${id}:sign-out-confirm`);
  return start;
}
/** After a sign-out confirmation the AvatarMenu stays open behind its scrim; a user closes it by clicking the scrim. */
async function closeAvatarMenu(page, id) {
  if (!(await evaluate(page, "__native.avatarMenuOpen()"))) return false;
  const point = await evaluate(page, `(() => {
    const candidates = [[innerWidth - 12, Math.round(innerHeight / 2)], [Math.round(innerWidth / 2), innerHeight - 12], [innerWidth - 12, innerHeight - 12], [Math.round(innerWidth / 2), Math.round(innerHeight / 2)]];
    for (const [x, y] of candidates) { const element = document.elementFromPoint(x, y); if (element && element.classList.contains("avatar-menu-scrim")) return { x, y }; }
    return null;
  })()`);
  pre(`${id}:avatar-menu-scrim-hit-testable`, point !== null);
  await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await input(page, "Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  pre(`${id}:avatar-menu-closed-by-its-scrim`, await waitUntil(page, "!__native.avatarMenuOpen()", 3000));
  await parkMouse(page);
  return true;
}
async function externalDocument(expression, label) {
  const { targetId } = await browser.send("Target.createTarget", { url: `${origin}/external` });
  pre(`${label}:external-document-target-present`, typeof targetId === "string" && targetId.length > 0, { targetId });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  const call = (method, params = {}) => browser.send(method, params, sessionId);
  try {
    let loaded = false;
    for (let attempt = 0; attempt < 150 && !loaded; attempt += 1) {
      const probe = await call("Runtime.evaluate", { expression: "document.readyState === 'complete' && location.pathname === '/external' && !window.verify && !window.__native", returnByValue: true }).catch(() => null);
      loaded = probe?.result?.value === true;
      if (!loaded) await delay(30);
    }
    pre(`${label}:independent-same-origin-document-without-product-or-instruments`, loaded, { targetId });
    const result = await call("Runtime.evaluate", { expression, returnByValue: true });
    pre(`${label}:external-document-evaluated`, !result.exceptionDetails, { exception: result.exceptionDetails?.text ?? null });
    return { targetId, value: result.result.value };
  } finally {
    await browser.send("Target.closeTarget", { targetId }).catch(() => {});
    await mainPage.cdp("Page.bringToFront");
    await delay(200);
  }
}
const visibleDownloads = () => readdirSync(downloads).filter((name) => !name.startsWith("."));
async function awaitDownload(timeout = 10000) {
  const file = join(downloads, "rail-order-draft.json");
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const names = visibleDownloads();
    if (names.includes("rail-order-draft.json") && !names.some((name) => name.endsWith(".crdownload"))) {
      const first = statSync(file).size;
      await delay(150);
      const second = statSync(file).size;
      if (first > 0 && first === second) return { names: visibleDownloads(), raw: readFileSync(file), file };
    }
    await delay(50);
  }
  return null;
}
const clearDownloads = () => { for (const name of readdirSync(downloads)) unlinkSync(join(downloads, name)); };
const envelopeOf = (value) => ({ version: 1, kind: "rail-order-draft", changes: { device: { railOrder: { operation: "set", value } } } });
async function setViewport(page, viewport) {
  await page.cdp("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false });
  await delay(300);
}

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
let harnessError = null;
try {
  const fixedArchive = extractArchive(resolved);
  const beforeArchive = VARIANTS_BY_MODE[mode].some((name) => VARIANTS[name].stage === "before") ? extractArchive(BEFORE_REVISION) : null;
  const sourceHashes = (archive) => Object.fromEntries(Object.keys(CONTRACT_SOURCE_HASHES).map((file) => [file, existsSync(join(archive.snapshot, file)) ? sha256(readFileSync(join(archive.snapshot, file))) : null]));
  const fixedSource = sourceHashes(fixedArchive);
  const unchangedMismatches = Object.entries(CONTRACT_SOURCE_HASHES).filter(([file]) => !UNIT_CHANGED.includes(file)).filter(([file, hash]) => fixedSource[file] !== hash).map(([file]) => file);
  const unitNotChanged = UNIT_CHANGED.filter((file) => fixedSource[file] === CONTRACT_SOURCE_HASHES[file]);
  const beforeSource = beforeArchive ? sourceHashes(beforeArchive) : null;
  const beforeMismatches = beforeSource ? Object.entries(CONTRACT_SOURCE_HASHES).filter(([file, hash]) => beforeSource[file] !== hash).map(([file]) => file) : null;
  for (const name of VARIANTS_BY_MODE[mode]) await buildVariant(name);

  const appPage = (variant) => `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>XAI Web (AppRail order native ${mode}, ${variant})</title><link rel="stylesheet" href="/__native/${variant}/bundle.css"><script src="/__native/prelude.js"></script></head><body><div id="root"></div><script type="module" src="/__native/${variant}/bundle.js"></script></body></html>`;
  const seedPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>seed</title><script src="/__native/prelude.js"></script></head><body><p>seed page: prelude only, no product code</p></body></html>';
  const externalPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Independent same-origin document</title></head><body><p>second document: no product code, no instruments</p></body></html>';
  const served = {};
  server = createServer((request, response) => {
    const path = new URL(request.url, "http://127.0.0.1").pathname;
    const asset = /^\/__native\/([a-z-]+)\/bundle\.(js|css)$/.exec(path);
    const category = path.startsWith("/__native/") || path === "/seed" || path === "/external" || path === "/favicon.ico" ? path : `app-document:${currentVariant}`;
    served[category] = (served[category] ?? 0) + 1;
    response.setHeader("Cache-Control", "no-store");
    if (path === "/__native/prelude.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(preludeSource); return; }
    if (asset && bundles[asset[1]]) {
      response.setHeader("Content-Type", asset[2] === "js" ? "text/javascript; charset=utf-8" : "text/css; charset=utf-8");
      response.end(asset[2] === "js" ? bundles[asset[1]].js : bundles[asset[1]].css);
      return;
    }
    if (path === "/favicon.ico") { response.statusCode = 204; response.end(); return; }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(path === "/seed" ? seedPage : path === "/external" ? externalPage : appPage(currentVariant));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;

  browser = await launch();
  let firstTarget = null;
  for (let attempt = 0; attempt < 200 && !firstTarget; attempt += 1) {
    const { targetInfos } = await Promise.race([browser.send("Target.getTargets"), delay(5000).then(() => ({ targetInfos: [] }))]);
    firstTarget = targetInfos.find((target) => target.type === "page") ?? null;
    if (!firstTarget) await delay(50);
  }
  pre("session:page-target-over-the-devtools-pipe", Boolean(firstTarget));
  mainPage = await attachPage(firstTarget.targetId, "A");
  await mainPage.cdp("Page.bringToFront");
  await browser.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
  await mainPage.cdp("Fetch.enable", { patterns: [{ urlPattern: `${origin}/`, resourceType: "Document", requestStage: "Request" }] });
  const version = await browser.send("Browser.getVersion");
  record("baseline", {
    requested, resolved, resolvedTree, expectedFixed: FIXED_SHA, rowFilter: ONLY, before: BEFORE_REVISION, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix, composition: "production-app", variants: VARIANTS_BY_MODE[mode], viewport: VIEWPORT,
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { fixed: sha256(archiveLock), before: sha256(beforeLock), dependencies: sha256(dependencyLock), extractedFixed: sha256(fixedArchive.extractedLock), extractedBefore: beforeArchive ? sha256(beforeArchive.extractedLock) : null, contractGate: LOCKFILE_GATE_SHA256 },
    fileSha256: { [RUNNER]: runnerSha256, [FIXTURE]: sha256(fixtureSource), [PRELUDE]: sha256(preludeSource) },
    frozenBeforeConventions: { expected: FROZEN_BEFORE_FILES, actual: frozenBeforeActual },
    contract: { path: CONTRACT_PATH, sha256AtHead: contractSha256, expected: CONTRACT_SHA256 },
    fixedVsBefore: { before: BEFORE_REVISION, productFilesChanged: fixedDelta },
    contractSourceTable: { rows: Object.keys(CONTRACT_SOURCE_HASHES).length, fixedUnchangedRowMismatches: unchangedMismatches, fixedUnitRowsNotChanged: unitNotChanged, beforeMismatches, fixed: fixedSource, before: beforeSource },
    origin: "127.0.0.1 (ephemeral port, this runner's own server); every other host resolves to NOTFOUND",
    devtools: "pipe transport (--remote-debugging-pipe), flattened target sessions; trusted input through Input.dispatchMouseEvent/dispatchDragEvent (setInterceptDrags) and Input.dispatchKeyEvent without nativeVirtualKeyCode",
  });
  pre("baseline:requested-revision-resolves-to-the-fixed-sha", resolved === FIXED_SHA, { resolved });
  pre("baseline:docs-head-product-tree-equals-fixed", productDelta === "", { productDelta });
  pre("baseline:fixed-delta-is-exactly-the-19-e6-files", isDeepStrictEqual(fixedDelta, EXPECTED_FIXED_DELTA), { fixedDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === LOCKFILE_GATE_SHA256 && sha256(archiveLock) === LOCKFILE_GATE_SHA256 && sha256(fixedArchive.extractedLock) === LOCKFILE_GATE_SHA256 && (!beforeArchive || sha256(beforeArchive.extractedLock) === LOCKFILE_GATE_SHA256));
  pre("baseline:contract-r1-hash", contractSha256 === CONTRACT_SHA256, { contractSha256 });
  pre("baseline:frozen-before-conventions-unchanged", isDeepStrictEqual(frozenBeforeActual, FROZEN_BEFORE_FILES), { frozenBeforeActual });
  pre("baseline:contract-source-table-protected-rows-equal-and-unit-rows-changed", unchangedMismatches.length === 0 && unitNotChanged.length === 0 && (beforeMismatches === null || beforeMismatches.length === 0), { unchangedMismatches, unitNotChanged, beforeMismatches });

  if (mode === "controls") await runControls();
  if (mode === "protection") await runProtection();
  if (mode === "export") await runExport();
  currentCase = null;

  await collectDocument(mainPage, "end-of-run");
  record("observation", { id: "run:network-and-requests", network: networkSeen, served });
  record("observation", { id: "k1:keyboard-audit", dispatch: "rawKeyDown + keyUp with key, code and windowsVirtualKeyCode only (no nativeVirtualKeyCode)", ...keyboardAudit });
  record("observation", { id: "d1:summary", drags: d1Log.length, changesAfterDragenter: d1Log.reduce((sum, entry) => sum + entry.changesAfterDragenter, 0),
    changesAfterDragoverOnAnotherButton: d1Log.reduce((sum, entry) => sum + entry.changesAfterDragoverOnAnotherButton, 0), changesAfterDragend: d1Log.reduce((sum, entry) => sum + entry.changesAfterDragend, 0) });
  pre("run:no-non-local-network-attempt", networkSeen.nonLocal === 0, { networkSeen });
  pre("run:k1-keyboard-trace-contains-only-the-runner-key-presses", keyboardAudit.mismatches.length === 0 && keyboardAudit.keydowns === keyboardAudit.runnerPresses
    && keyboardAudit.keyups === keyboardAudit.runnerPresses && keyboardAudit.keypresses === 0 && keyboardAudit.untrusted === 0, keyboardAudit);
  // A dialog the runner did not plan, or a planned one the product never asked, is a product outcome (never a harness failure).
  check("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs: dialogs.filter((entry) => !entry.expected) });
  check("run:every-planned-dialog-was-asked", dialogPlan.length === 0 && unusedPlans.length === 0, { unused: [...dialogPlan, ...unusedPlans] });
  pre("run:no-renderer-crash", !runtimeErrors.some((entry) => entry.kind === "renderer-crash"));
  // The instrument self-test's own console.error positive control on the product-free seed page is not a product error.
  const selfTestError = (entry) => entry.kind === "console.error" && entry.text === "native apprail prelude self-test error trace" && String(entry.source?.url ?? "").endsWith("/__native/prelude.js");
  const judged = runtimeErrors.filter((entry) => !String(entry.variant ?? "").startsWith("before") && !selfTestError(entry));
  record("observation", { id: "run:runtime-errors", total: runtimeErrors.length, selfTestPositiveControl: runtimeErrors.filter(selfTestError).length, fixedVariants: judged.length, beforeReferenceVariants: runtimeErrors.filter((entry) => String(entry.variant ?? "").startsWith("before")).length, samples: runtimeErrors.slice(0, 6) });
  check("run:zero-runtime-errors-in-the-fixed-product", judged.length === 0, { samples: judged.slice(0, 6) });
} catch (error) {
  harnessError = error;
} finally {
  const warningGroups = {};
  for (const warning of consoleWarnings) {
    const key = `${warning.text.slice(0, 160)} @ ${warning.source?.module ?? warning.source?.url ?? "unknown"}`;
    warningGroups[key] = (warningGroups[key] ?? 0) + 1;
  }
  const byRow = {};
  for (const entry of records.filter((item) => item.name === "check" && item.kind === "product")) {
    const row = entry.id.split(":")[0];
    byRow[row] = byRow[row] ?? { pass: 0, total: 0 };
    byRow[row].total += 1;
    if (entry.pass) byRow[row].pass += 1;
  }
  record("result", {
    harnessValid: harnessError === null, pass: harnessError === null && failures.length === 0, mode, checks, preconditions, productChecks, failures, byRow,
    browser: browser ? { pid: browser.pid, closeReason: browser.closeReason ?? null, processExit: browser.processExit ?? null } : null,
    runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 6).map((entry) => ({ ...entry, text: entry.text.slice(0, 240) })),
    consoleWarnings: consoleWarnings.length, consoleWarningsBySource: warningGroups, rowGates: rowGates.length,
    dialogs, navigationRequests, unusedDialogPlans: dialogPlan, artifacts: artifacts.map((entry) => ({ file: entry.file, sha256: entry.sha256 })), keyboardAudit, network: networkSeen,
    ...(harnessError ? { error: String(harnessError?.stack ?? harnessError).slice(0, 1500), checkId: harnessError?.checkId ?? null, checkKind: harnessError?.checkKind ?? null, lastCheckId, currentCase } : {}),
  });
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`, { flag: "wx" });
  if (browser) {
    browser.send("Browser.close").catch(() => {});
    const graceful = await Promise.race([browser.exited.then(() => true), delay(8000).then(() => false)]);
    if (!graceful) {
      browser.proc.kill("SIGTERM");
      await Promise.race([browser.exited, delay(3000)]);
      if (browser.proc.exitCode === null && browser.proc.signalCode === null) browser.proc.kill("SIGKILL");
    }
  }
  server?.closeAllConnections?.();
  server?.close();
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  process.exitCode = harnessError ? 1 : failures.length ? 2 : 0;
  console.log(`${harnessError ? "HARNESS-FAIL" : failures.length ? "FAIL" : "PASS"} ${relative(root, evidencePath)} checks=${checks} product=${productChecks} preconditions=${preconditions} failures=${failures.length} exit=${process.exitCode}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
  setTimeout(() => process.exit(process.exitCode), 500).unref();
}

// ===================================================================================================
// E9 — controls and drags (host rows b, c, e, f, o, p, r)
// ===================================================================================================
/** Reads the archive facts (registrations, labels, registry default) from one clean production mount first. */
async function primeFacts(page) {
  caseStart("prime-archive-facts");
  await seed(page, seedsFor("en"), "prime");
  await mountApp(page, "prime:mount", { path: "/app/tasks", hidePet: false });
}
async function runControls() {
  const page = mainPage;
  await primeFacts(page);
  if (selected("rowB")) await rowB(page);
  if (selected("rowD1")) await rowD1(page);
  if (selected("rowC")) await rowC(page);
  if (selected("rowE")) await rowE(page);
  if (selected("rowF")) await rowF(page);
  if (selected("rowUncertainty")) await rowUncertainty(page);
  if (selected("rowO")) await rowO(page);
  if (selected("rowP")) await rowP(page);
  if (selected("rowR")) await rowR(page);
}
/** A clean mount with REVERSED (all modules visible) on `path`; returns S and D0. */
async function mountReversed(page, label, lang = "en", { path = "/app/tasks", extra = {}, variant = "fixed", ready = READY_APP } = {}) {
  if (!facts0) {
    await seed(page, seedsFor(lang), `${label}:ids`);
    await mountApp(page, `${label}:ids-mount`, { path: "/app/tasks", variant, hidePet: false });
  }
  const S = REVERSED();
  await seed(page, seedsFor(lang, { [RAIL_KEY]: JSON.stringify(S), ...extra }), label);
  const { facts } = await mountApp(page, `${label}:mount`, { path, variant, ready });
  pre(`${label}:seed-class-in-domain-distinct-production-ids`, classOf(JSON.stringify(S)) === "valid" && S.every((id) => railIds().includes(id)), { S });
  const D0 = displayOrder(S, visibleIds());
  pre(`${label}:rail-displays-the-seeded-custom-order`, isDeepStrictEqual(facts.rail, idsToLabels(lang, D0)), { rail: facts.rail, expected: D0 });
  return { S, D0 };
}
/** Common successful-drop assertions: exactly one set at the drop with the merge bytes, zero attempts during the gesture. */
async function assertOneWriteAtDrop(page, row, gesture, S, R, P, lang) {
  const expected = merge(S, R, P);
  const settled = await waitUntil(page, `__native.native.get(${JSON.stringify(RAIL_KEY)}) === ${JSON.stringify(JSON.stringify(expected))}`, 5000);
  await delay(400);
  const now = await snap(page, gesture.mark);
  const sets = railOps(now.attempts, ["set"]);
  const removes = railOps(now.attempts, ["remove", "clear"]);
  const devtools = await devtoolsBytes(page);
  check(`${row}:zero-storage-attempts-during-dragstart-dragenter-dragover`, gesture.attemptsDuringGesture.length === 0, { attempts: brief(gesture.attemptsDuringGesture) });
  check(`${row}:exactly-one-setItem-at-the-drop-with-the-A2-merge-bytes`, settled && sets.length === 1 && sets[0].outcome === "ok" && sets[0].value === JSON.stringify(expected) && gesture.dropSeq !== null && sets[0].seq > gesture.dropSeq && removes.length === 0,
    { sets: brief(sets), removes: brief(removes), expected, dropSeq: gesture.dropSeq });
  check(`${row}:bytes-page-and-devtools-equal-merge`, now.bytes === JSON.stringify(expected) && devtools === JSON.stringify(expected), { bytes: parse(now.bytes), devtools: parse(devtools), expected });
  check(`${row}:rail-shows-the-dropped-order-no-status-no-warning`, isDeepStrictEqual(now.rail, idsToLabels(lang, P)) && !now.status.present && now.unloadListeners === 0, { rail: labelsToIds(lang, now.rail), P, status: now.status.present, listeners: now.unloadListeners });
  check(`${row}:one-per-key-lock-request-no-account-lock-no-storage-event`, gesture.lockRequests === 1 && !now.locks.some((entry) => entry.by === "app" && entry.name.includes("xai:account")) && !now.dispatches.some((entry) => entry.kind === "storage"),
    { lockRequests: gesture.lockRequests, locks: now.locks.map((entry) => `${entry.by}:${entry.name}`), dispatches: now.dispatches });
  return { expected, now };
}
async function rowB(page) {
  // b1: one-step drag, all modules visible (P6: S' = P).
  {
    caseStart("b1");
    const { S, D0 } = await mountReversed(page, "b1");
    const segment = await beginSegment(page, "b1");
    const gesture = await dragGesture(page, "b1", { source: labelOf("en", D0[0]), targets: [labelOf("en", D0[2])] });
    const P = reorder(D0, D0[0], D0[2]);
    await assertOneWriteAtDrop(page, "b1", gesture, S, visibleIds(), P, "en");
    check("b1:D1-no-preview-change-after-a-dragenter", gesture.d1.changesAfterDragenter === 0 && gesture.d1.changesAfterDragoverOnAnotherButton >= 1, gesture.d1);
    await screenshot(page, "b1-after-drop", { state: "after a trusted drag of the first rail button onto the third and a drop (all modules visible)" });
    await endSegment(segment, ZERO);
  }
  // b2: two-step drag; one write at the drop, zero during dragover.
  {
    caseStart("b2");
    const { S, D0 } = await mountReversed(page, "b2");
    const segment = await beginSegment(page, "b2");
    const gesture = await dragGesture(page, "b2", { source: labelOf("en", D0[0]), targets: [labelOf("en", D0[2]), labelOf("en", D0[5])] });
    const P = reorder(reorder(D0, D0[0], D0[2]), D0[0], D0[5]);
    check("b2:preview-moved-on-each-dragover-step", isDeepStrictEqual(gesture.steps.map((step) => labelsToIds("en", step.rail)), [reorder(D0, D0[0], D0[2]), P]) && gesture.steps.every((step) => step.bytes === JSON.stringify(S)),
      { steps: gesture.steps.map((step) => ({ rail: labelsToIds("en", step.rail), bytes: parse(step.bytes) })) });
    await assertOneWriteAtDrop(page, "b2", gesture, S, visibleIds(), P, "en");
    check("b2:D1-no-preview-change-after-a-dragenter", gesture.d1.changesAfterDragenter === 0 && gesture.d1.changesAfterDragoverOnAnotherButton >= 2, gesture.d1);
    await endSegment(segment, ZERO);
  }
  // b3: an unknown id keeps its stored index (A2 one rule for every non-visible id, P2).
  {
    caseStart("b3");
    const S = ["ghost-module", ...REVERSED()];
    pre("b3:seed-class-in-domain-unknown-id-at-index-0", classOf(JSON.stringify(S)) === "valid" && S[0] === "ghost-module" && !railIds().includes("ghost-module"), { S });
    await seed(page, seedsFor("en", { [RAIL_KEY]: JSON.stringify(S) }), "b3");
    const { facts } = await mountApp(page, "b3:mount", { path: "/app/tasks" });
    const R = visibleIds();
    const D0 = displayOrder(S, R);
    pre("b3:rail-displays-the-reconciled-order", isDeepStrictEqual(facts.rail, idsToLabels("en", D0)), { rail: facts.rail });
    const segment = await beginSegment(page, "b3");
    const gesture = await dragGesture(page, "b3", { source: labelOf("en", D0[0]), targets: [labelOf("en", D0[2])] });
    const P = reorder(D0, D0[0], D0[2]);
    const { expected } = await assertOneWriteAtDrop(page, "b3", gesture, S, R, P, "en");
    check("b3:ghost-module-keeps-index-0", expected[0] === "ghost-module" && parse(await bytesNow(page))[0] === "ghost-module", { bytes: parse(await bytesNow(page)) });
    await endSegment(segment, ZERO);
  }
}
/** D1 probe: dragenter only accepts; the following dragover moves the preview (controller ruling D1). */
async function rowD1(page) {
  caseStart("d1");
  const { S, D0 } = await mountReversed(page, "d1");
  const segment = await beginSegment(page, "d1");
  const gesture = await dragGesture(page, "d1", { source: labelOf("en", D0[0]), targets: [labelOf("en", D0[2])], pauseAfterEnter: 450 });
  const P = reorder(D0, D0[0], D0[2]);
  const step = gesture.steps[0];
  check("d1:D1-after-dragenter-alone-the-preview-is-unchanged", isDeepStrictEqual(step.afterEnter.rail, idsToLabels("en", D0)), { afterEnter: labelsToIds("en", step.afterEnter.rail), D0 });
  check("d1:D1-after-the-following-dragover-the-preview-is-P", isDeepStrictEqual(step.afterOver.rail, idsToLabels("en", P)), { afterOver: labelsToIds("en", step.afterOver.rail), P });
  check("d1:D1-every-preview-change-follows-a-dragover-on-another-button", gesture.d1.changesAfterDragenter === 0 && gesture.d1.changesAfterDragoverOnAnotherButton === 1, gesture.d1);
  await assertOneWriteAtDrop(page, "d1", gesture, S, visibleIds(), P, "en");
  await endSegment(segment, ZERO);
}
async function toggleFeature(page, id, expectValue, label, { expectFailure = false } = {}) {
  const mark = await markOf(page);
  await trustedClick(page, `${FEATURES_PANE} [data-feature-id="${id}"] [role="switch"]`, `${label}:features-switch-${id}`);
  const settled = expectFailure
    ? await waitUntil(page, `(__native.features()?.switches.find((entry) => entry.id === ${JSON.stringify(id)})?.recovery ?? '').length > 0 && __native.window(${mark}).attempts.some((entry) => entry.key === ${JSON.stringify(featureKey(id))} && entry.op === 'set' && entry.outcome !== 'ok')`, 8000)
    : await waitUntil(page, `__native.native.get(${JSON.stringify(featureKey(id))}) === ${JSON.stringify(String(expectValue))} && document.querySelector('${FEATURES_PANE} [data-feature-id="${id}"] [role="switch"]').getAttribute('aria-checked') === ${JSON.stringify(String(expectValue))}`, 8000);
  await delay(500);
  const view = await evaluate(page, `__native.window(${mark})`);
  pre(`${label}:features-toggle-${id}-by-trusted-click-${expectFailure ? "failed-as-armed" : "committed"}`, settled, { features: await evaluate(page, "__native.features()") });
  return { railAttempts: view.attempts.filter((entry) => entry.key === RAIL_KEY) };
}
/** Row c — R-1 end to end through the real Features pane (EN screenshots at 1440; ZH without screenshots). */
async function rowC(page) {
  for (const lang of ["en", "zh"]) {
    caseStart(`c-${lang}`);
    await setViewport(page, { width: 1440, height: 900 });
    const S = BOARD_AT_2;
    pre(`c-${lang}:seed-class-in-domain-board-at-index-2`, classOf(JSON.stringify(S)) === "valid" && S.every((entry) => railIds().includes(entry)) && S.indexOf("board") === 2 && S.length === 14, { S });
    await seed(page, seedsFor(lang, { [RAIL_KEY]: JSON.stringify(S), ...featuresAll() }), `c-${lang}`);
    const { facts } = await mountApp(page, `c-${lang}:mount`, { path: "/app/settings/features", ready: READY_FEATURES });
    pre(`c-${lang}:rail-displays-seeded-order-with-boards-at-index-2`, isDeepStrictEqual(facts.rail, idsToLabels(lang, S)), { rail: facts.rail });
    const segment = await beginSegment(page, `c-${lang}`);
    const off = await toggleFeature(page, "board", false, `c-${lang}:off`);
    const R = visibleIds(["board"]);
    const D = displayOrder(S, R);
    check(`c-${lang}:boards-hidden-from-the-rail-by-the-real-features-pane`, isDeepStrictEqual(await railNow(page), idsToLabels(lang, D)), { rail: await railNow(page) });
    if (lang === "en") await screenshot(page, "c-en-1440-boards-hidden", { state: "Boards turned off through the real Features pane (trusted click); seeded order had Boards at index 2" });
    const gesture = await dragGesture(page, `c-${lang}:drag`, { source: labelOf(lang, D[0]), targets: [labelOf(lang, D[2])] });
    const P = reorder(D, D[0], D[2]);
    const { expected } = await assertOneWriteAtDrop(page, `c-${lang}`, gesture, S, R, P, lang);
    const bytes = parse(await bytesNow(page));
    check(`c-${lang}:R-1-board-keeps-index-2-and-the-visible-filter-equals-the-dropped-order`, Array.isArray(bytes) && bytes.indexOf("board") === 2 && isDeepStrictEqual(bytes.filter((entry) => R.includes(entry)), P) && isDeepStrictEqual(bytes, expected), { bytes, expected, P });
    if (lang === "en") await screenshot(page, "c-en-1440-after-drop", { state: "after a trusted drag (first visible rail button onto the third) and a drop, Boards hidden" });
    const on = await toggleFeature(page, "board", true, `c-${lang}:on`);
    const reenabled = labelsToIds(lang, await railNow(page));
    check(`c-${lang}:R-1-re-enabled-boards-displays-at-index-2`, reenabled.indexOf("board") === 2 && isDeepStrictEqual(reenabled, displayOrder(bytes, visibleIds())), { reenabled });
    check(`c-${lang}:features-toggles-made-zero-attempts-on-the-order`, off.railAttempts.length === 0 && on.railAttempts.length === 0, { off: brief(off.railAttempts), on: brief(on.railAttempts) });
    if (lang === "en") await screenshot(page, "c-en-1440-after-re-enabling", { state: "after Boards was turned on again through the real Features pane: Boards back at index 2" });
    await endSegment(segment, ZERO);
    await setViewport(page, VIEWPORT);
  }
}
/** Row e — a drop held behind the real per-key Web Lock. */
async function rowE(page) {
  caseStart("e");
  const { S, D0 } = await mountReversed(page, "e");
  const segment = await beginSegment(page, "e");
  const lockName = await evaluate(page, "verify.lockName()");
  await evaluate(page, `__native.hold(${JSON.stringify(lockName)})`);
  pre("e:real-per-key-lock-held-by-the-fixture", (await evaluate(page, "__native.lockQuery()")).held.includes(lockName), { lockName });
  const gesture = await dragGesture(page, "e", { source: labelOf("en", D0[0]), targets: [labelOf("en", D0[2])] });
  const P = reorder(D0, D0[0], D0[2]);
  const expected = merge(S, visibleIds(), P);
  await delay(600);
  const held = await snap(page, gesture.mark);
  const query = await evaluate(page, "__native.lockQuery()");
  pre("e:lock-still-held-and-the-app-request-pending", query.held.includes(lockName) && query.pending.includes(lockName), { query });
  const warnHeld = await evaluate(page, "__native.warn()");
  check("e:while-held-dropped-order-displayed-no-status-bytes-unchanged-zero-writes", isDeepStrictEqual(held.rail, idsToLabels("en", P)) && !held.status.present && held.bytes === JSON.stringify(S) && railOps(held.attempts).length === 0
    && gesture.attemptsDuringGesture.length === 0 && gesture.lockRequests === 1, { rail: labelsToIds("en", held.rail), status: held.status.present, bytes: parse(held.bytes), attempts: brief(railOps(held.attempts)), lockRequests: gesture.lockRequests });
  check("e:while-held-a-pending-draft-warns-on-unload-with-zero-attempts", warnHeld.warned === true && warnHeld.attempts === 0, { warnHeld });
  await screenshot(page, "e-held", { state: "drop admitted while the real per-key lock is held by the fixture: dropped order displayed, no status" });
  // The rail stays operable: a trusted rail click navigates while the write is held.
  const before = await evaluate(page, "location.pathname");
  await trustedClick(page, `.app-rail .rail-items .rail-btn[aria-label=${JSON.stringify(labelOf("en", "dashboard"))}]`, "e:rail-click-dashboard");
  const navigated = await waitUntil(page, "location.pathname === '/app/dashboard'", 4000);
  await delay(300);
  const moved = await snap(page, gesture.mark);
  check("e:rail-stays-operable-while-held", navigated && before !== "/app/dashboard" && isDeepStrictEqual(moved.rail, idsToLabels("en", P)) && moved.bytes === JSON.stringify(S) && !moved.status.present, { navigated, path: moved.path, rail: labelsToIds("en", moved.rail) });
  const releaseMark = await markOf(page);
  await evaluate(page, `__native.release(${JSON.stringify(lockName)})`);
  const written = await waitUntil(page, `__native.native.get(${JSON.stringify(RAIL_KEY)}) === ${JSON.stringify(JSON.stringify(expected))}`, 5000);
  await delay(500);
  const after = await snap(page, releaseMark);
  const all = await snap(page, gesture.mark);
  check("e:after-release-exactly-one-write-with-the-merge-bytes", written && railOps(after.attempts, ["set"]).length === 1 && railOps(all.attempts, ["set"]).length === 1 && railOps(all.attempts, ["set"])[0].outcome === "ok" && (await devtoolsBytes(page)) === JSON.stringify(expected),
    { sets: brief(railOps(all.attempts, ["set"])), expected });
  check("e:after-release-no-status-no-warning-one-app-lock-request", !after.status.present && after.unloadListeners === 0 && all.locks.filter((entry) => entry.by === "app" && entry.name === lockName).length === 1, { status: after.status, listeners: after.unloadListeners, locks: all.locks.map((entry) => `${entry.by}:${entry.name}`) });
  await endSegment(segment, { push: 1, replace: 0, popstate: 0, commits: 1 });
}
/** Row f — a second drop while the first is held: latest wins; one lock request per drop; no premature acknowledgement. */
async function rowF(page) {
  caseStart("f");
  const { S, D0 } = await mountReversed(page, "f");
  const R = visibleIds();
  const segment = await beginSegment(page, "f");
  const lockName = await evaluate(page, "verify.lockName()");
  const L1 = await evaluate(page, `__native.lockRequest(${JSON.stringify(lockName)})`);
  pre("f:fixture-request-L1-held", await waitUntil(page, `__native.lockStates()[${JSON.stringify(L1)}].state === 'held'`, 3000));
  const first = await dragGesture(page, "f:first", { source: labelOf("en", D0[0]), targets: [labelOf("en", D0[2])] });
  const P1 = reorder(D0, D0[0], D0[2]);
  const draft1 = merge(S, R, P1);
  await delay(400);
  const L2 = await evaluate(page, `__native.lockRequest(${JSON.stringify(lockName)})`);
  await delay(200);
  pre("f:L2-queued-behind-the-first-app-request", (await evaluate(page, "__native.lockStates()"))[L2].state === "pending");
  pre("f:first-draft-displayed-before-the-second-drag", isDeepStrictEqual(await railNow(page), idsToLabels("en", P1)));
  const second = await dragGesture(page, "f:second", { source: labelOf("en", P1[1]), targets: [labelOf("en", P1[4])] });
  const P2 = reorder(P1, P1[1], P1[4]);
  const draft2 = merge(draft1, R, P2);
  await delay(400);
  const both = await snap(page, first.mark);
  check("f:both-drops-admitted-while-held-latest-displayed-no-write", isDeepStrictEqual(both.rail, idsToLabels("en", P2)) && both.bytes === JSON.stringify(S) && railOps(both.attempts).length === 0 && !both.status.present,
    { rail: labelsToIds("en", both.rail), bytes: parse(both.bytes), attempts: brief(railOps(both.attempts)) });
  await evaluate(page, `__native.lockRelease(${JSON.stringify(L1)})`);
  const firstWritten = await waitUntil(page, `__native.native.get(${JSON.stringify(RAIL_KEY)}) === ${JSON.stringify(JSON.stringify(draft1))} && __native.lockStates()[${JSON.stringify(L2)}].state === 'held'`, 5000);
  await delay(400);
  const middle = await snap(page, first.mark);
  const warnMiddle = await evaluate(page, "__native.warn()");
  pre("f:first-completion-observed-with-L2-holding-the-second", firstWritten, { bytes: parse(middle.bytes), states: await evaluate(page, "__native.lockStates()") });
  check("f:first-completion-never-acknowledges-the-second", isDeepStrictEqual(middle.rail, idsToLabels("en", P2)) && middle.bytes === JSON.stringify(draft1) && warnMiddle.warned === true && warnMiddle.attempts === 0 && !middle.status.present
    && railOps(middle.attempts, ["set"]).length === 1, { rail: labelsToIds("en", middle.rail), bytes: parse(middle.bytes), warnMiddle, sets: brief(railOps(middle.attempts, ["set"])) });
  await evaluate(page, `__native.lockRelease(${JSON.stringify(L2)})`);
  const finalWritten = await waitUntil(page, `__native.native.get(${JSON.stringify(RAIL_KEY)}) === ${JSON.stringify(JSON.stringify(draft2))}`, 5000);
  await delay(500);
  const end = await snap(page, first.mark);
  const sets = railOps(end.attempts, ["set"]);
  check("f:final-bytes-are-the-second-merge", finalWritten && end.bytes === JSON.stringify(draft2) && (await devtoolsBytes(page)) === JSON.stringify(draft2) && sets.length === 2 && sets[0].value === JSON.stringify(draft1) && sets[1].value === JSON.stringify(draft2) && sets.every((entry) => entry.outcome === "ok"),
    { sets: brief(sets), draft1, draft2 });
  check("f:each-drop-made-exactly-one-per-key-lock-request", end.locks.filter((entry) => entry.by === "app" && entry.name === lockName).length === 2 && first.lockRequests + second.lockRequests <= 2,
    { appLocks: end.locks.filter((entry) => entry.name === lockName).map((entry) => `${entry.seq}:${entry.by}`), duringFirst: first.lockRequests, duringSecond: second.lockRequests });
  check("f:after-both-no-status-no-warning-rail-shows-the-second", !end.status.present && end.unloadListeners === 0 && isDeepStrictEqual(end.rail, idsToLabels("en", P2)), { status: end.status.present, listeners: end.unloadListeners });
  check("f:zero-attempts-during-both-gestures", first.attemptsDuringGesture.length === 0 && second.attemptsDuringGesture.length === 0);
  await endSegment(segment, ZERO);
}
/** Readback uncertainty: the write lands, its readback is denied once; Retry reconciles with exactly one total write. */
async function rowUncertainty(page) {
  for (const lang of ["en", "zh"]) {
    caseStart(`u-${lang}`);
    const { S, D0 } = await mountReversed(page, `u-${lang}`, lang);
    const segment = await beginSegment(page, `u-${lang}`);
    await evaluate(page, `__native.uncertainSet(${JSON.stringify(RAIL_KEY)})`);
    const gesture = await dragGesture(page, `u-${lang}`, { source: labelOf(lang, D0[0]), targets: [labelOf(lang, D0[2])] });
    const P = reorder(D0, D0[0], D0[2]);
    const expected = merge(S, visibleIds(), P);
    const failedShown = await waitUntil(page, `__native.railStatus().present`, 6000);
    await delay(300);
    const first = await snap(page, gesture.mark);
    const readbackDenied = first.attempts.some((entry) => entry.key === RAIL_KEY && entry.op === "get" && entry.outcome === "readback-denied");
    pre(`u-${lang}:readback-fault-fired-after-the-write`, readbackDenied && railOps(first.attempts, ["set"]).length === 1 && railOps(first.attempts, ["set"])[0].outcome === "ok", { attempts: brief(first.attempts.filter((entry) => entry.key === RAIL_KEY)) });
    check(`u-${lang}:uncertain-write-is-a-failed-draft-not-a-success`, failedShown && statusMatches(first.status, lang, "failed") && isDeepStrictEqual(first.rail, idsToLabels(lang, P)) && first.bytes === JSON.stringify(expected) && first.unloadListeners === 1,
      { status: first.status, rail: labelsToIds(lang, first.rail) });
    const opened = await openPanel(page, `u-${lang}`);
    check(`u-${lang}:panel-failed-draft-wording`, statusMatches(opened, lang, "failed", { open: true }), { status: opened });
    const retryMark = await markOf(page);
    await clickTestId(page, "rail-order-retry", `u-${lang}:retry`);
    const cleared = await waitUntil(page, "!__native.railStatus().present", 5000);
    await delay(400);
    const after = await snap(page, retryMark);
    const total = await snap(page, gesture.mark);
    check(`u-${lang}:retry-reconciles-with-exactly-one-total-write`, cleared && railOps(after.attempts).length === 0 && railOps(total.attempts, ["set"]).length === 1 && after.bytes === JSON.stringify(expected) && (await devtoolsBytes(page)) === JSON.stringify(expected),
      { retrySets: brief(railOps(after.attempts)), totalSets: brief(railOps(total.attempts, ["set"])) });
    check(`u-${lang}:after-reconcile-no-status-no-warning-focus-on-the-appearance-trigger`, !after.status.present && after.unloadListeners === 0 && after.focus?.isPrefTrigger === true, { focus: after.focus, listeners: after.unloadListeners });
    await endSegment(segment, ZERO);
  }
}
/** Row o — every contract §5 item 2 value at load on three routes (EN and ZH), then a drag over it. */
async function rowO(page) {
  const ROUTES = ["/app/tasks", "/app/settings/appearance", "/app/dashboard"];
  for (const lang of ["en", "zh"]) {
    for (const value of MALFORMED) {
      const id = `o-${lang}-${value.label}`;
      caseStart(id);
      const unreadable = value.cls === "unreadable";
      const raw = unreadable ? JSON.stringify(REVERSED()) : value.raw;
      pre(`${id}:seed-class-${value.cls}`, unreadable ? classOf(raw) === "valid" : classOf(raw) === value.cls, { raw, cls: value.cls });
      const defaultDisplay = idsToLabels(lang, displayOrder(facts0.registryDefault, visibleIds()));
      for (const path of ROUTES) {
        const routeId = `${id}-${path.split("/").filter(Boolean).slice(1).join("-")}`;
        await seed(page, seedsFor(lang, { [RAIL_KEY]: raw }), routeId);
        const { state } = await mountApp(page, `${routeId}:mount`, { path, requireApp: false, faultPlan: unreadable ? { get: [RAIL_KEY] } : null });
        const segment = await beginSegment(page, routeId);
        const view = await evaluate(page, `({ ready: ${READY_APP}, routeError: __native.routeError(), rail: __native.railNames(), status: __native.railStatus(), topbar: __native.topbar(), warn: __native.warn(), listeners: __native.unloadListeners(),
          bytes: __native.native.get(${JSON.stringify(RAIL_KEY)}), mount: __native.window(0).attempts.filter((entry) => entry.key === ${JSON.stringify(RAIL_KEY)}).map((entry) => entry.op + ':' + entry.outcome) })`);
        const mountWrites = view.mount.filter((entry) => !entry.startsWith("get:"));
        check(`${routeId}:no-route-error-app-renders`, state.ready && view.ready && view.routeError === null, { state, routeError: view.routeError });
        check(`${routeId}:default-order-displayed`, isDeepStrictEqual(view.rail, defaultDisplay), { rail: view.rail, defaultDisplay });
        check(`${routeId}:source-status-with-its-wording-zero-writes-bytes-unchanged-no-warning`, statusMatches(view.status, lang, "source", { open: false }) && mountWrites.length === 0 && view.bytes === raw && view.warn.warned === false && view.listeners === 0
          && view.topbar.controlsOrder[view.topbar.controlsOrder.indexOf("rail-order-status-root") + 1] === "topbar-pref", { status: view.status, mount: view.mount, bytes: view.bytes, warn: view.warn, controls: view.topbar.controlsOrder });
        if (unreadable) check(`${routeId}:the-read-was-attempted-and-denied`, view.mount.some((entry) => entry === "get:denied"), { mount: view.mount });
        if (view.status.present) {
          const opened = await openPanel(page, routeId);
          check(`${routeId}:panel-shows-the-unavailable-message-and-reload-only`, statusMatches(opened, lang, "source", { open: true }), { status: opened });
          if (path === "/app/tasks" && (lang === "en" || ["object-empty", "string-tasks", "array-1", "repeated-tasks", "unparsable", "unreadable"].includes(value.label))) await screenshot(page, `${id}-tasks-panel`, { value: value.raw, lang, state: "source issue: status and open panel" });
        }
        const panelWrites = railOps((await snap(page, segment.mark)).attempts);
        check(`${routeId}:opening-the-panel-made-zero-writes`, panelWrites.length === 0, { panelWrites: brief(panelWrites) });
        if (path !== ROUTES.at(-1)) { await endSegment(segment, ZERO); continue; }
        // A valid drag over the malformed source: a refused failed draft; Retry refused again; Discard back to the default.
        const D = displayOrder(facts0.registryDefault, visibleIds());
        const P = reorder(D, D[0], D[2]);
        const gesture = await dragGesture(page, `${id}:drag`, { source: labelOf(lang, D[0]), targets: [labelOf(lang, D[2])] });
        const failed = await waitUntil(page, `(() => { const s = __native.railStatus(); return s.present && s.name === ${JSON.stringify(COPY[lang].statusDraftName)}; })()`, 6000);
        await delay(400);
        const afterDrop = await snap(page, gesture.mark);
        const warnFailed = await evaluate(page, "__native.warn()");
        check(`${id}:drag-over-it-is-a-refused-failed-draft-never-an-overwrite`, failed && statusMatches(afterDrop.status, lang, "failed") && isDeepStrictEqual(afterDrop.rail, idsToLabels(lang, P)) && afterDrop.bytes === raw
          && railOps(afterDrop.attempts).every((entry) => entry.outcome !== "ok") && warnFailed.warned === true && warnFailed.attempts === 0 && gesture.attemptsDuringGesture.length === 0,
        { status: afterDrop.status, rail: labelsToIds(lang, afterDrop.rail), bytes: afterDrop.bytes, attempts: brief(railOps(afterDrop.attempts)), warnFailed });
        const opened = await openPanel(page, `${id}:failed`);
        check(`${id}:failed-draft-panel-retry-discard-export`, statusMatches(opened, lang, "failed", { open: true }), { status: opened });
        const retryMark = await markOf(page);
        await clickTestId(page, "rail-order-retry", `${id}:retry`);
        await delay(700);
        const afterRetry = await snap(page, retryMark);
        check(`${id}:retry-refused-again-focus-stays-on-retry`, statusMatches(afterRetry.status, lang, "failed", { open: true }) && afterRetry.bytes === raw && railOps(afterRetry.attempts).every((entry) => entry.outcome !== "ok") && afterRetry.focus?.testid === "rail-order-retry",
          { status: afterRetry.status, focus: afterRetry.focus, attempts: brief(railOps(afterRetry.attempts)) });
        const discardMark = await markOf(page);
        await clickTestId(page, "rail-order-discard", `${id}:discard`);
        const back = await waitUntil(page, `(() => { const s = __native.railStatus(); return s.present && s.name === ${JSON.stringify(COPY[lang].statusSourceName)}; })()`, 4000);
        await delay(400);
        const afterDiscard = await snap(page, discardMark);
        const warnAfter = await evaluate(page, "__native.warn()");
        check(`${id}:discard-zero-writes-default-display-source-status-again-bytes-unchanged`, back && railOps(afterDiscard.attempts).length === 0 && isDeepStrictEqual(afterDiscard.rail, defaultDisplay) && afterDiscard.bytes === raw
          && statusMatches(afterDiscard.status, lang, "source") && warnAfter.warned === false && afterDiscard.unloadListeners === 0,
        { rail: afterDiscard.rail, status: afterDiscard.status, attempts: brief(railOps(afterDiscard.attempts)), warnAfter });
        observe(`${id}:focus-after-discard`, { focus: afterDiscard.focus });
        await evaluate(page, "__native.restore()");
        await endSegment(segment, ZERO);
      }
    }
  }
}
/** Row p — external repair, then Reload: the status disappears and the committed order displays, with no write. */
async function rowP(page) {
  for (const lang of ["en", "zh"]) {
    // (1) invalid bytes repaired by another document.
    {
      const id = `p-${lang}-invalid`;
      caseStart(id);
      await seed(page, seedsFor(lang, { [RAIL_KEY]: "{}" }), id);
      await mountApp(page, `${id}:mount`, { path: "/app/tasks" });
      const segment = await beginSegment(page, id);
      pre(`${id}:source-status-before-the-repair`, statusMatches(await statusNow(page), lang, "source"));
      const S = REVERSED();
      await externalDocument(`localStorage.setItem(${JSON.stringify(RAIL_KEY)}, ${JSON.stringify(JSON.stringify(S))}); localStorage.getItem(${JSON.stringify(RAIL_KEY)}) !== null`, `${id}:external-repair`);
      pre(`${id}:storage-event-delivered`, await waitUntil(page, `__native.window(${segment.mark}).storageReceived.some((entry) => entry.key === ${JSON.stringify(RAIL_KEY)} && entry.trusted)`, 4000));
      await delay(400);
      const repaired = await snap(page, segment.mark);
      // Recorded: whether the source status is still there after the external repair (a preserved source issue that
      // needs Reload) or already gone; either way the end state below is judged.
      observe(`${id}:after-external-repair-before-reload`, { statusStillShown: repaired.status.present, status: repaired.status, rail: labelsToIds(lang, repaired.rail) });
      if (repaired.status.present) {
        await openPanel(page, id);
        await clickTestId(page, "rail-order-reload", `${id}:reload`);
      }
      const cleared = await waitUntil(page, "!__native.railStatus().present", 4000);
      await delay(300);
      const after = await snap(page, segment.mark);
      check(`${id}:after-repair-and-reload-status-gone-committed-order-no-write`, cleared && isDeepStrictEqual(after.rail, idsToLabels(lang, displayOrder(S, visibleIds()))) && railOps(after.attempts).length === 0 && after.bytes === JSON.stringify(S) && after.unloadListeners === 0,
        { statusBeforeReload: repaired.status.present, rail: labelsToIds(lang, after.rail), attempts: brief(railOps(after.attempts)) });
      if (repaired.status.present) check(`${id}:focus-after-the-repairing-reload-is-the-appearance-trigger`, after.focus?.isPrefTrigger === true, { focus: after.focus });
      await endSegment(segment, ZERO);
    }
    // (2) an unreadable source repaired (the read fault lifted), then Reload.
    {
      const id = `p-${lang}-unreadable`;
      caseStart(id);
      const S = REVERSED();
      await seed(page, seedsFor(lang, { [RAIL_KEY]: JSON.stringify(S) }), id);
      await mountApp(page, `${id}:mount`, { path: "/app/tasks", faultPlan: { get: [RAIL_KEY] } });
      const segment = await beginSegment(page, id);
      pre(`${id}:source-status-while-unreadable`, statusMatches(await statusNow(page), lang, "source"));
      await openPanel(page, id);
      const deniedMark = await markOf(page);
      await clickTestId(page, "rail-order-reload", `${id}:reload-while-denied`);
      await delay(500);
      const still = await snap(page, deniedMark);
      check(`${id}:reload-while-still-unreadable-keeps-the-source-status`, statusMatches(still.status, lang, "source") && railOps(still.attempts).length === 0 && still.attempts.some((entry) => entry.key === RAIL_KEY && entry.op === "get" && entry.outcome === "denied"), { status: still.status });
      await evaluate(page, `__native.allowGet(${JSON.stringify(RAIL_KEY)})`);
      await openPanel(page, `${id}:again`);
      await clickTestId(page, "rail-order-reload", `${id}:reload`);
      const cleared = await waitUntil(page, "!__native.railStatus().present", 4000);
      await delay(300);
      const after = await snap(page, segment.mark);
      check(`${id}:reload-after-repair-status-gone-committed-order-no-write`, cleared && isDeepStrictEqual(after.rail, idsToLabels(lang, displayOrder(S, visibleIds()))) && railOps(after.attempts).length === 0 && after.bytes === JSON.stringify(S),
        { rail: labelsToIds(lang, after.rail), attempts: brief(railOps(after.attempts)) });
      await endSegment(segment, ZERO);
    }
  }
}
/** Row r — cancelled drags: dragCancel, a drop on the main content, a drop on a text field; zero writes, preview reverts. */
async function rowR(page) {
  for (const end of ["cancel", "drop-outside", "drop-input"]) {
    const id = `r-${end}`;
    caseStart(id);
    // The drop on a text field uses the Metrics module, whose profile Height field is a plain text input in the main content.
    const { S, D0 } = await mountReversed(page, id, "en", { path: end === "drop-input" ? "/app/metrics" : "/app/tasks" });
    const segment = await beginSegment(page, id);
    const gesture = await dragGesture(page, id, { source: labelOf("en", D0[0]), targets: [labelOf("en", D0[2])], end });
    await delay(400);
    const after = await snap(page, gesture.mark);
    check(`${id}:preview-moved-during-the-gesture`, isDeepStrictEqual(labelsToIds("en", gesture.steps[0].rail), reorder(D0, D0[0], D0[2])), { step: labelsToIds("en", gesture.steps[0].rail) });
    check(`${id}:zero-writes-and-the-preview-reverts`, railOps(after.attempts).length === 0 && after.bytes === JSON.stringify(S) && isDeepStrictEqual(after.rail, idsToLabels("en", D0)) && !after.status.present && after.unloadListeners === 0,
      { attempts: brief(railOps(after.attempts)), rail: labelsToIds("en", after.rail), bytes: parse(after.bytes), status: after.status.present });
    check(`${id}:D1-the-revert-follows-the-dragend`, gesture.d1.changesAfterDragend >= 1 && gesture.d1.changesAfterDragenter === 0, gesture.d1);
    if (end === "drop-input") observe(`${id}:release-over-the-text-field`, { dropDeliveredToField: gesture.dropDeliveredToField, fieldValueBefore: gesture.outside.valueBefore, fieldValueAfter: gesture.dropFieldValue, intercepted: gesture.intercepted, trace: gesture.trace });
    await screenshot(page, `${id}-after`, { state: `after a trusted drag of the first rail button over the third, ended by ${end}` });
    await endSegment(segment, ZERO);
  }
}

// ===================================================================================================
// E10 — protection (host rows a, d, g, h, i, j, k, l, n, q)
// ===================================================================================================
async function runProtection() {
  const page = mainPage;
  await primeFacts(page);
  if (selected("rowA")) await rowA(page);
  if (selected("rowDProtection")) await rowDProtection(page);
  if (selected("rowG")) await rowG(page);
  if (selected("rowH")) await rowH(page);
  if (selected("rowI")) await rowI(page);
  if (selected("rowJ")) await rowJ(page);
  if (selected("rowK")) await rowK(page);
  if (selected("rowL")) await rowL(page);
  if (selected("rowN")) await rowN(page);
  if (selected("rowQ")) await rowQ(page);
}
function normalizeKey(key) { return /^lswt-/.test(String(key)) ? "lswt-*" : key; }
function mutationSet(list) { return [...new Set(list.map((entry) => `${entry.op}:${normalizeKey(entry.key)}`))].sort(); }
/** Row a — clean load on three routes: zero rail writes, the committed or default order, no status, no unload warning. */
async function rowA(page) {
  const ROUTES = ["/app/tasks", "/app/settings/appearance", "/app/dashboard"];
  for (const seeded of ["absent", "custom"]) {
    for (const path of ROUTES) {
      const id = `a-${seeded}-${path.split("/").filter(Boolean).slice(1).join("-")}`;
      caseStart(id);
      const outcomes = {};
      for (const variant of ["before", "fixed"]) {
        if (!facts0) { await seed(page, seedsFor("en"), `${id}:ids`); await mountApp(page, `${id}:ids-mount`, { hidePet: false }); }
        const S = seeded === "custom" ? REVERSED() : null;
        await seed(page, seedsFor("en", S ? { [RAIL_KEY]: JSON.stringify(S) } : {}), `${id}:${variant}`);
        const { facts } = await mountApp(page, `${id}:${variant}:mount`, { path, variant, hidePet: false });
        const segment = await beginSegment(page, `${id}${variant === "before" ? ":419e56d-reference" : ""}`);
        const view = await evaluate(page, `({ status: __native.railStatus(), warn: __native.warn(), listeners: __native.unloadListeners(), rail: __native.railNames(), bytes: __native.native.get(${JSON.stringify(RAIL_KEY)}) })`);
        // §5 item 1: opening and closing the Topbar popover makes zero writes.
        const popMark = await markOf(page);
        await trustedClick(page, ".topbar .topbar-pref-trigger", `${id}:${variant}:popover-open`);
        pre(`${id}:${variant}:popover-opened`, await waitUntil(page, "__native.topbar().popoverOpen", 3000));
        await press(page, "Escape");
        pre(`${id}:${variant}:popover-closed`, await waitUntil(page, "!__native.topbar().popoverOpen", 3000));
        const popover = await snap(page, popMark);
        outcomes[variant] = { mutations: mutationSet(facts.mountMutations), railMount: facts.mountRailAttempts.filter((entry) => !entry.startsWith("get:")), view, popoverMutations: popover.attempts.filter((entry) => ["set", "remove", "clear"].includes(entry.op)) };
        if (variant === "fixed") {
          const expected = idsToLabels("en", S ? displayOrder(S, visibleIds()) : displayOrder(facts0.registryDefault, visibleIds()));
          check(`${id}:zero-rail-writes-at-mount-and-popover`, outcomes.fixed.railMount.length === 0 && outcomes.fixed.popoverMutations.length === 0 && view.bytes === (S ? JSON.stringify(S) : null), { railMount: outcomes.fixed.railMount, popover: brief(outcomes.fixed.popoverMutations) });
          check(`${id}:committed-or-default-order-no-status-no-unload-warning`, isDeepStrictEqual(view.rail, expected) && !view.status.present && view.warn.warned === false && view.listeners === 0, { rail: view.rail, expected, status: view.status.present, warn: view.warn });
          check(`${id}:mount-mutations-equal-419e56d`, isDeepStrictEqual(outcomes.fixed.mutations, outcomes.before.mutations), { fixed: outcomes.fixed.mutations, before: outcomes.before.mutations });
          await endSegment(segment, ZERO);
        } else {
          await endSegment(segment, null, { reference: true });
        }
      }
    }
  }
}
/** Row d — a failed drag (quota): status on every route; Retry fails again once, focus on Retry; Export; Retry succeeds. */
async function rowDProtection(page) {
  for (const lang of ["en", "zh"]) {
    const id = `d-${lang}`;
    caseStart(id);
    const { S } = await mountReversed(page, id, lang);
    const segment = await beginSegment(page, id);
    const drop = await failedDrop(page, id, lang, { S });
    const settled = await snap(page, drop.gesture.mark);
    check(`${id}:dropped-order-stays-displayed-status-after-settlement`, isDeepStrictEqual(settled.rail, idsToLabels(lang, drop.P)) && statusMatches(settled.status, lang, "failed", { open: false }) && settled.bytes === JSON.stringify(S),
      { rail: labelsToIds(lang, settled.rail), status: settled.status });
    check(`${id}:topbar-slot-order-rail-status-immediately-before-topbar-pref`, settled.topbar.controlsOrder[settled.topbar.controlsOrder.indexOf("rail-order-status-root") + 1] === "topbar-pref", { controls: settled.topbar.controlsOrder });
    await screenshot(page, `${id}-failed-status`, { state: "after a failed trusted drop (quota): the Topbar rail status", lang });
    // The status on every route (rail clicks, then Settings through the avatar menu, then back by a rail click).
    const visits = [];
    for (const target of ["dashboard", "calendar"]) {
      await trustedClick(page, `.app-rail .rail-items .rail-btn[aria-label=${JSON.stringify(labelOf(lang, target))}]`, `${id}:rail-click-${target}`);
      const arrived = await waitUntil(page, `location.pathname === '/app/${target}'`, 4000);
      await delay(300);
      visits.push({ path: await evaluate(page, "location.pathname"), arrived, status: await statusNow(page), rail: await railNow(page) });
    }
    await trustedClick(page, ".app-rail .rail-avatar", `${id}:avatar`);
    pre(`${id}:avatar-menu-open`, await waitUntil(page, "__native.avatarMenuOpen()", 3000));
    await clickOne(page, `[...document.querySelectorAll('.avatar-menu .avm-item')].filter((element) => (element.textContent || '').replace(/\\s+/g, ' ').trim() === ${JSON.stringify(facts0.labels[lang].avatar.settings)})`, `${id}:avatar-settings`);
    const inSettings = await waitUntil(page, "location.pathname.startsWith('/app/settings')", 4000);
    await delay(400);
    await closeAvatarMenu(page, `${id}:after-settings`);
    visits.push({ path: await evaluate(page, "location.pathname"), arrived: inSettings, status: await statusNow(page), rail: await railNow(page) });
    await trustedClick(page, `.app-rail .rail-items .rail-btn[aria-label=${JSON.stringify(labelOf(lang, "tasks"))}]`, `${id}:rail-click-tasks`);
    visits.push({ path: await evaluate(page, "location.pathname"), arrived: await waitUntil(page, "location.pathname === '/app/tasks'", 4000), status: await statusNow(page), rail: await railNow(page) });
    check(`${id}:status-shows-on-every-route-and-the-draft-stays`, visits.every((visit) => visit.arrived && statusMatches(visit.status, lang, "failed") && isDeepStrictEqual(visit.rail, idsToLabels(lang, drop.P))), { visits: visits.map((visit) => ({ path: visit.path, status: visit.status.name, rail: labelsToIds(lang, visit.rail) })) });
    // The panel: Retry with the fault still armed fails again with exactly one attempt; focus stays on Retry.
    const opened = await openPanel(page, id);
    check(`${id}:panel-wording-message-and-actions`, statusMatches(opened, lang, "failed", { open: true }), { status: opened });
    await screenshot(page, `${id}-panel-open`, { state: "failed draft: the open rail-order panel", lang });
    const retryMark = await markOf(page);
    await clickTestId(page, "rail-order-retry", `${id}:retry-failing`);
    await delay(900);
    const failedAgain = await snap(page, retryMark);
    check(`${id}:failing-retry-exactly-one-attempt-focus-stays-on-retry`, railOps(failedAgain.attempts, ["set"]).length === 1 && railOps(failedAgain.attempts, ["set"])[0].outcome === "denied-quota" && statusMatches(failedAgain.status, lang, "failed", { open: true })
      && failedAgain.focus?.testid === "rail-order-retry" && failedAgain.bytes === JSON.stringify(S), { sets: brief(railOps(failedAgain.attempts, ["set"])), focus: failedAgain.focus });
    // Export by trusted pointer (focus stays on Export; the disk file is the draft envelope).
    clearDownloads();
    const exportMark = await markOf(page);
    await clickTestId(page, "rail-order-export", `${id}:export`);
    const download = await awaitDownload();
    const exported = await snap(page, exportMark);
    const file = `${prefix}-${id}-rail-order-draft.json`;
    if (download) { writeFileSync(join(evidenceDir, file), download.raw, { flag: "wx" }); artifacts.push({ file, sha256: sha256(download.raw), bytes: download.raw.length, case: currentCase }); record("disk-export", { id, file, sha256: sha256(download.raw), raw: download.raw.toString("utf8") }); }
    check(`${id}:export-by-trusted-pointer-writes-the-draft-envelope-focus-stays-on-export`, Boolean(download) && isDeepStrictEqual(parse(download.raw.toString("utf8")), envelopeOf(drop.expected)) && exported.focus?.testid === "rail-order-export" && railOps(exported.attempts).length === 0
      && statusMatches(exported.status, lang, "failed", { open: true }), { download: download ? parse(download.raw.toString("utf8")) : null, focus: exported.focus });
    // After the fault is cleared, Retry makes exactly one write and removes the status; focus moves to the trigger.
    await evaluate(page, `__native.allowSet(${JSON.stringify(RAIL_KEY)})`);
    const okMark = await markOf(page);
    await clickTestId(page, "rail-order-retry", `${id}:retry-succeeding`);
    const gone = await waitUntil(page, "!__native.railStatus().present", 5000);
    await delay(400);
    const recovered = await snap(page, okMark);
    check(`${id}:successful-retry-exactly-one-write-status-removed-focus-on-the-appearance-trigger`, gone && railOps(recovered.attempts, ["set"]).length === 1 && railOps(recovered.attempts, ["set"])[0].outcome === "ok" && recovered.bytes === JSON.stringify(drop.expected)
      && recovered.focus?.isPrefTrigger === true && recovered.unloadListeners === 0, { sets: brief(railOps(recovered.attempts, ["set"])), focus: recovered.focus });
    await endSegment(segment, null);
    // Discard by trusted pointer: zero writes, the committed order returns, focus moves to the trigger.
    {
      const did = `d-${lang}-discard`;
      caseStart(did);
      const { S: S2 } = await mountReversed(page, did, lang);
      const seg = await beginSegment(page, did);
      const second = await failedDrop(page, did, lang, { S: S2 });
      await openPanel(page, did);
      const discardMark = await markOf(page);
      await clickTestId(page, "rail-order-discard", `${did}:discard`);
      const gone2 = await waitUntil(page, "!__native.railStatus().present", 4000);
      await delay(400);
      const discarded = await snap(page, discardMark);
      check(`${did}:discard-zero-writes-committed-order-status-gone-focus-on-the-appearance-trigger`, gone2 && railOps(discarded.attempts).length === 0 && isDeepStrictEqual(discarded.rail, idsToLabels(lang, second.D0)) && discarded.bytes === JSON.stringify(S2)
        && discarded.focus?.isPrefTrigger === true && discarded.unloadListeners === 0, { rail: labelsToIds(lang, discarded.rail), focus: discarded.focus, attempts: brief(railOps(discarded.attempts)) });
      await evaluate(page, "__native.restore()");
      await endSegment(seg, ZERO);
    }
  }
}
/** Row g — navigation with a failed draft (rail click, Settings sidebar, Back, Forward) is not held; equal to a clean run. */
async function rowG(page) {
  const steps = async (label, lang) => {
    const out = [];
    const step = async (name, act, expectPath) => {
      const before = await evaluate(page, "verify.location()");
      const mark = await markOf(page);
      await act();
      const arrived = await waitUntil(page, `location.pathname === ${JSON.stringify(expectPath)}`, 4000);
      await delay(400);
      const now = await snap(page, mark);
      out.push({ name, arrived, location: now.location, keyChanged: now.location.key !== before.key, counters: counters(now), commits: now.commits.map((entry) => ({ pathname: entry.pathname, state: entry.state, action: entry.action })), departure: now.departure, status: now.status, rail: now.rail, blockerCalls: now.blockerCalls.length });
    };
    await step("settings-sidebar", () => clickOne(page, `[...document.querySelectorAll('.settings-sidebar .list-row')].filter((row) => (row.textContent || '').replace(/\\s+/g, ' ').trim() === ${JSON.stringify(facts0.labels[lang].settings.about)})`, `${label}:sidebar-about`), "/app/settings/about");
    await step("rail-click", () => trustedClick(page, `.app-rail .rail-items .rail-btn[aria-label=${JSON.stringify(labelOf(lang, "tasks"))}]`, `${label}:rail-tasks`), "/app/tasks");
    const history = await page.cdp("Page.getNavigationHistory");
    await step("back", () => page.cdp("Page.navigateToHistoryEntry", { entryId: history.entries[history.currentIndex - 1].id }), "/app/settings/about");
    const history2 = await page.cdp("Page.getNavigationHistory");
    await step("forward", () => page.cdp("Page.navigateToHistoryEntry", { entryId: history2.entries[history2.currentIndex + 1].id }), "/app/tasks");
    return out;
  };
  const shape = (entry) => ({ name: entry.name, arrived: entry.arrived, pathname: entry.location.pathname, state: entry.location.state, keyChanged: entry.keyChanged, counters: entry.counters, commits: entry.commits, departure: entry.departure, blockerCalls: entry.blockerCalls });
  caseStart("g-clean-reference");
  await mountReversed(page, "g-clean", "en", { path: "/app/settings/appearance" });
  const cleanSegment = await beginSegment(page, "g-clean-reference");
  const clean = await steps("g-clean", "en");
  await endSegment(cleanSegment, null, { reference: true });
  caseStart("g");
  const { S } = await mountReversed(page, "g", "en", { path: "/app/settings/appearance" });
  const segment = await beginSegment(page, "g");
  const drop = await failedDrop(page, "g", "en", { S });
  const drafted = await steps("g", "en");
  record("observation", { id: "g:navigation-shapes", clean: clean.map(shape), drafted: drafted.map(shape) });
  check("g:rail-click-sidebar-back-forward-not-held-equal-to-an-ordinary-navigation", isDeepStrictEqual(drafted.map(shape), clean.map(shape)) && drafted.every((entry) => entry.arrived && entry.departure === null && entry.keyChanged && entry.blockerCalls === 0),
    { drafted: drafted.map(shape), clean: clean.map(shape) });
  check("g:draft-intact-and-status-on-every-route", drafted.every((entry) => statusMatches(entry.status, "en", "failed") && isDeepStrictEqual(entry.rail, idsToLabels("en", drop.P))), { visits: drafted.map((entry) => ({ path: entry.location.pathname, status: entry.status.name, rail: labelsToIds("en", entry.rail) })) });
  await evaluate(page, "__native.restore()");
  const cleanTotals = clean.reduce((sum, entry) => ({ push: sum.push + entry.counters.push, replace: sum.replace + entry.counters.replace, popstate: sum.popstate + entry.counters.popstate, commits: sum.commits + entry.counters.commits }), { ...ZERO });
  await endSegment(segment, cleanTotals);
}
/** Outcome vector of a sign-out (compared between the fixed product and 419e56d). */
async function signOutOutcome(page, start, { holdExpected = false } = {}) {
  if (!holdExpected) await waitFor(() => navigationRequests.length > start.requestsAt, 6000);
  await delay(1200);
  const now = await snap(page, start.mark);
  return {
    confirms: dialogs.slice(start.dialogsAt).map((entry) => `${entry.type}:${entry.message}:${entry.accepted}`),
    scope: now.scopeLog.map((entry) => `${entry.kind}:${entry.accountId}`),
    clientSignOuts: now.auth.filter((call) => call === "signOut").length,
    coordinatorSignOuts: now.coordinator ? now.coordinator.signOuts.map((entry) => entry.captured) : null,
    requests: navigationRequests.slice(start.requestsAt).map((entry) => entry.url.replace(origin, "")),
    counters: counters(now), finalPath: now.path, railMutations: railOps(now.attempts).length, departure: now.departure ? now.departure.label : null,
  };
}
/** Row h — sign-out without a rail draft equals 419e56d in both auth branches; with an Appearance draft only, exactly its text. */
async function rowH(page) {
  for (const branch of ["legacy", "coordinator"]) {
    for (const appearance of [false, true]) {
      const id = `h-${branch}${appearance ? "-appearance-only" : ""}`;
      caseStart(id);
      const outcomes = {};
      for (const stage of ["before", "fixed"]) {
        const variant = branch === "legacy" ? stage : `${stage}-coord`;
        if (!facts0) { await seed(page, seedsFor("en"), `${id}:ids`); await mountApp(page, `${id}:ids-mount`, { hidePet: false }); }
        await seed(page, seedsFor("en", { [RAIL_KEY]: JSON.stringify(REVERSED()) }), `${id}:${stage}`);
        await mountApp(page, `${id}:${stage}:mount`, { path: "/app/tasks", variant });
        const segment = await beginSegment(page, `${id}${stage === "before" ? ":419e56d-reference" : ""}`);
        if (appearance) await failTopbarTheme(page, `${id}:${stage}`, "en");
        if (appearance) dialogPlan.push({ accept: true, purpose: `${id}:${stage}: OK at the Appearance sign-out step` });
        const start = await signOutThroughUi(page, `${id}:${stage}`, "en");
        outcomes[stage] = await signOutOutcome(page, start);
        dropUnusedPlans(`${id}:${stage}`);
        record("sign-out-outcome", { id, branch, stage, variant, outcome: outcomes[stage] });
        if (stage === "fixed") {
          const expectedConfirms = appearance ? [`confirm:${COPY.en.appearanceSignOut}:true`] : [];
          check(`${id}:confirm-list-exact-zero-rail-confirms`, isDeepStrictEqual(outcomes.fixed.confirms, expectedConfirms), { confirms: outcomes.fixed.confirms });
          check(`${id}:outcome-equals-419e56d`, isDeepStrictEqual(outcomes.fixed, outcomes.before), { fixed: outcomes.fixed, before: outcomes.before });
          check(`${id}:sequence-completed`, branch === "legacy" ? outcomes.fixed.clientSignOuts === 1 && outcomes.fixed.scope.includes("locked:null") : outcomes.fixed.coordinatorSignOuts?.length === 1, outcomes.fixed);
          await endSegment(segment, null);
        } else {
          await endSegment(segment, null, { reference: true });
        }
        await evaluate(page, "__native.restore()").catch(() => {});
      }
    }
  }
}
/** An Appearance draft (theme Dark through the Topbar with its write denied); the Appearance Topbar status shows. */
async function failTopbarTheme(page, label, lang) {
  await evaluate(page, `__native.denySet(${JSON.stringify(THEME_KEY)}, "SecurityError")`);
  const mark = await markOf(page);
  await trustedClick(page, ".topbar .topbar-pref-trigger", `${label}:topbar-trigger`);
  pre(`${label}:topbar-popover-open`, await waitUntil(page, "__native.topbar().popoverOpen", 3000));
  await clickOne(page, `[...document.querySelectorAll('.topbar #topbar-pref-panel section')].filter((s) => s.getAttribute("aria-label") === ${JSON.stringify(facts0.labels[lang].settings.theme)}).flatMap((s) => [...s.querySelectorAll('[role="menuitemradio"]')]).filter((o) => o.getAttribute("aria-label") === ${JSON.stringify(facts0.labels[lang].settings.dark)})`, `${label}:topbar-dark`);
  const fired = await waitUntil(page, `__native.window(${mark}).attempts.some((entry) => entry.key === ${JSON.stringify(THEME_KEY)} && entry.op === "set" && entry.outcome !== "ok")`, 6000);
  if (await evaluate(page, "__native.topbar().popoverOpen")) await press(page, "Escape");
  pre(`${label}:topbar-popover-closed`, await waitUntil(page, "!__native.topbar().popoverOpen", 3000));
  await parkMouse(page);
  const shown = await waitUntil(page, "!!__native.topbar().appearanceStatus", 5000);
  pre(`${label}:appearance-draft-failed-and-its-status-shown`, fired && shown, { topbar: await evaluate(page, "__native.topbar()") });
}
/** Sign-out with drafts: plan the answers, run the flow, and return the observed sequence. */
async function signOutWith(page, id, lang, answers, { holdExpected = false } = {}) {
  for (const [index, accept] of answers.entries()) dialogPlan.push({ accept, purpose: `${id}: answer ${index + 1}` });
  const start = await signOutThroughUi(page, id, lang);
  await waitFor(() => dialogs.length >= start.dialogsAt + answers.length, 5000);
  const allAccepted = answers.every(Boolean);
  if (allAccepted && !holdExpected) await waitFor(() => navigationRequests.length > start.requestsAt, 6000);
  if (holdExpected) await waitUntil(page, "!!__native.departureDialog()", 5000);
  await delay(1200);
  dropUnusedPlans(id);
  const now = await snap(page, start.mark);
  const confirms = dialogs.slice(start.dialogsAt).map((entry) => ({ type: entry.type, message: entry.message, accepted: entry.accepted }));
  return { start, now, confirms };
}
function intact(now) { return now.scope.kind === "account" && now.scope.accountId === OWNER && now.scopeLog.length === 0 && now.auth.filter((call) => call === "signOut").length === 0 && (!now.coordinator || now.coordinator.signOuts.length === 0); }
/** Row i — sign-out with a failed rail draft, both branches, EN and ZH: Cancel resolves false; OK continues with zero writes. */
async function rowI(page) {
  for (const branch of ["legacy", "coordinator"]) {
    for (const lang of ["en", "zh"]) {
      const id = `i-${branch}-${lang}`;
      caseStart(id);
      const variant = branch === "legacy" ? "fixed" : "fixed-coord";
      const { S } = await mountReversed(page, id, lang, { variant });
      const segment = await beginSegment(page, id);
      const drop = await failedDrop(page, id, lang, { S });
      const cancel = await signOutWith(page, `${id}:cancel`, lang, [false]);
      const warn = await evaluate(page, "__native.warn()");
      check(`${id}:cancel-one-confirm-with-the-rail-text`, isDeepStrictEqual(cancel.confirms, [{ type: "confirm", message: COPY[lang].confirmSignOut, accepted: false }]), { confirms: cancel.confirms });
      check(`${id}:cancel-resolves-false-identity-intact-zero-history-no-coordinator-asked`, intact(cancel.now) && isDeepStrictEqual(counters(cancel.now), ZERO) && navigationRequests.length === cancel.start.requestsAt && cancel.now.departure === null
        && (branch === "legacy" || cancel.now.coordinator.captures >= 1), { scope: cancel.now.scope, scopeLog: cancel.now.scopeLog, counters: counters(cancel.now), coordinator: cancel.now.coordinator });
      check(`${id}:cancel-keeps-the-draft-status-and-warning-zero-writes`, statusMatches(cancel.now.status, lang, "failed") && isDeepStrictEqual(cancel.now.rail, idsToLabels(lang, drop.P)) && warn.warned === true && railOps(cancel.now.attempts).length === 0, { status: cancel.now.status, warn });
      await closeAvatarMenu(page, `${id}:after-cancel`);
      const ok = await signOutWith(page, `${id}:ok`, lang, [true]);
      check(`${id}:ok-one-confirm-with-the-rail-text`, isDeepStrictEqual(ok.confirms, [{ type: "confirm", message: COPY[lang].confirmSignOut, accepted: true }]), { confirms: ok.confirms });
      check(`${id}:ok-zero-writes-and-the-sequence-continues`, railOps(ok.now.attempts).length === 0 && ok.now.bytes === JSON.stringify(S) && navigationRequests.slice(ok.start.requestsAt).some((entry) => entry.url === `${origin}/`)
        && (branch === "legacy" ? ok.now.auth.filter((call) => call === "signOut").length === 1 && ok.now.scopeLog.some((entry) => entry.kind === "locked" && entry.accountId === null) : ok.now.coordinator.signOuts.length === 1),
      { attempts: brief(railOps(ok.now.attempts)), auth: ok.now.auth, scopeLog: ok.now.scopeLog, coordinator: ok.now.coordinator, requests: navigationRequests.slice(ok.start.requestsAt).map((entry) => entry.url) });
      await evaluate(page, "__native.restore()").catch(() => {});
      await endSegment(segment, null);
    }
  }
}
/** Row j — rail and Appearance drafts: exact list [rail, Appearance]; OK+OK proceeds; OK+Cancel discards only the rail draft. */
async function rowJ(page) {
  const cases = [["legacy", "en"], ["legacy", "zh"], ["coordinator", "en"]];
  for (const [branch, lang] of cases) {
    const id = `j-${branch}-${lang}`;
    caseStart(id);
    const variant = branch === "legacy" ? "fixed" : "fixed-coord";
    const { S } = await mountReversed(page, id, lang, { variant });
    const segment = await beginSegment(page, id);
    const drop = await failedDrop(page, id, lang, { S });
    await failTopbarTheme(page, id, lang);
    await screenshot(page, `${id}-both-statuses`, { state: "a failed rail draft and a failed Appearance draft: both Topbar statuses", lang });
    // Cancel at the rail step: the Appearance step is not asked.
    const railCancel = await signOutWith(page, `${id}:rail-cancel`, lang, [false]);
    check(`${id}:rail-cancel-list-is-exactly-the-rail-text-appearance-not-asked`, isDeepStrictEqual(railCancel.confirms, [{ type: "confirm", message: COPY[lang].confirmSignOut, accepted: false }]) && intact(railCancel.now) && isDeepStrictEqual(counters(railCancel.now), ZERO)
      && statusMatches(railCancel.now.status, lang, "failed") && Boolean(railCancel.now.topbar.appearanceStatus), { confirms: railCancel.confirms });
    await closeAvatarMenu(page, `${id}:after-rail-cancel`);
    // OK then Cancel: the rail draft is discarded with zero writes; the Appearance draft is kept; resolves false.
    const okCancel = await signOutWith(page, `${id}:ok-cancel`, lang, [true, false]);
    check(`${id}:ok-cancel-list-is-exactly-rail-then-appearance`, isDeepStrictEqual(okCancel.confirms, [{ type: "confirm", message: COPY[lang].confirmSignOut, accepted: true }, { type: "confirm", message: COPY[lang].appearanceSignOut, accepted: false }]), { confirms: okCancel.confirms });
    check(`${id}:ok-cancel-resolves-false-rail-draft-discarded-zero-writes-appearance-draft-kept`, intact(okCancel.now) && isDeepStrictEqual(counters(okCancel.now), ZERO) && !okCancel.now.status.present && isDeepStrictEqual(okCancel.now.rail, idsToLabels(lang, drop.D0))
      && railOps(okCancel.now.attempts).length === 0 && okCancel.now.bytes === JSON.stringify(S) && Boolean(okCancel.now.topbar.appearanceStatus), { status: okCancel.now.status.present, rail: labelsToIds(lang, okCancel.now.rail), appearance: okCancel.now.topbar.appearanceStatus });
    await closeAvatarMenu(page, `${id}:after-ok-cancel`);
    // A new failed rail draft, then OK and OK: the list is exactly [rail, Appearance] and the sign-out proceeds.
    await failedDrop(page, `${id}:again`, lang, { S, sourceIndex: 1, targetIndex: 3 });
    const okOk = await signOutWith(page, `${id}:ok-ok`, lang, [true, true]);
    check(`${id}:ok-ok-list-is-exactly-rail-then-appearance-and-it-proceeds`, isDeepStrictEqual(okOk.confirms, [{ type: "confirm", message: COPY[lang].confirmSignOut, accepted: true }, { type: "confirm", message: COPY[lang].appearanceSignOut, accepted: true }])
      && railOps(okOk.now.attempts).length === 0 && navigationRequests.slice(okOk.start.requestsAt).some((entry) => entry.url === `${origin}/`)
      && (branch === "legacy" ? okOk.now.auth.filter((call) => call === "signOut").length === 1 : okOk.now.coordinator.signOuts.length === 1), { confirms: okOk.confirms, auth: okOk.now.auth, coordinator: okOk.now.coordinator });
    await evaluate(page, "__native.restore()").catch(() => {});
    await endSegment(segment, null);
  }
}
/** A More draft (Launch at Login) whose write is denied; the accepted More pane shows its failure. */
async function failMore(page, id) {
  const before = await evaluate(page, `document.querySelector(${JSON.stringify(MORE.toggle)})?.getAttribute("aria-checked")`);
  await evaluate(page, `__native.denySet(${JSON.stringify(MORE.key)}, "SecurityError")`);
  const since = await markOf(page);
  await trustedClick(page, MORE.toggle, `${id}:more-toggle`);
  const fired = await waitUntil(page, `__native.window(${since}).attempts.some((entry) => entry.key === ${JSON.stringify(MORE.key)} && entry.op === "set" && entry.outcome !== "ok")`, 6000);
  const shown = await waitUntil(page, `(document.querySelector('.settings-detail')?.textContent || '').includes(${JSON.stringify(MORE.failed)})`, 6000);
  await delay(300);
  pre(`${id}:more-fault-armed-and-observed`, fired && shown, { before });
}
/** Row k — rail draft plus a More draft held by the Settings coordinator: rail OK, then the coordinator dialog as at 419e56d; Stay. */
async function rowK(page) {
  for (const branch of ["legacy", "coordinator"]) {
    const id = `k-${branch}`;
    caseStart(id);
    // 419e56d reference: the More draft alone, the coordinator dialog and Stay.
    const beforeVariant = branch === "legacy" ? "before" : "before-coord";
    await seed(page, seedsFor("en", { [RAIL_KEY]: JSON.stringify(REVERSED()) }), `${id}:419e56d`);
    await mountApp(page, `${id}:419e56d:mount`, { path: MORE.route, variant: beforeVariant, ready: READY_MORE });
    const refSegment = await beginSegment(page, `${id}:419e56d-reference`);
    await failMore(page, `${id}:419e56d`);
    const refStart = await signOutThroughUi(page, `${id}:419e56d`, "en");
    const refShown = await waitUntil(page, "!!__native.departureDialog()", 5000);
    await delay(500);
    const reference = await snap(page, refStart.mark);
    pre(`${id}:419e56d-coordinator-dialog-held`, refShown && reference.departure !== null && dialogs.length === refStart.dialogsAt, { departure: reference.departure });
    await clickOne(page, "[...document.querySelectorAll('.settings-departure-dialog button')].filter((button) => (button.textContent || '').trim() === 'Stay')", `${id}:419e56d:stay`);
    await delay(900);
    const refStay = await snap(page, refStart.mark);
    const refOutcome = { identityIntact: intact(refStay), counters: counters(refStay), requests: navigationRequests.length - refStart.requestsAt, dialogClosed: refStay.departure === null };
    record("more-coordinator-reference", { id, revision: BEFORE_REVISION, dialog: reference.departure, stay: refOutcome });
    await evaluate(page, "__native.restore()").catch(() => {});
    await endSegment(refSegment, null, { reference: true });
    // Fixed: a More draft and a rail draft.
    const variant = branch === "legacy" ? "fixed" : "fixed-coord";
    const S = REVERSED();
    await seed(page, seedsFor("en", { [RAIL_KEY]: JSON.stringify(S) }), id);
    await mountApp(page, `${id}:mount`, { path: MORE.route, variant, ready: READY_MORE });
    const segment = await beginSegment(page, id);
    await failMore(page, id);
    const drop = await failedDrop(page, id, "en", { S });
    const cancel = await signOutWith(page, `${id}:rail-cancel`, "en", [false]);
    check(`${id}:rail-cancel-no-coordinator-asked`, isDeepStrictEqual(cancel.confirms, [{ type: "confirm", message: COPY.en.confirmSignOut, accepted: false }]) && cancel.now.departure === null && intact(cancel.now) && isDeepStrictEqual(counters(cancel.now), ZERO)
      && statusMatches(cancel.now.status, "en", "failed"), { confirms: cancel.confirms, departure: cancel.now.departure });
    await closeAvatarMenu(page, `${id}:after-cancel`);
    const ok = await signOutWith(page, `${id}:rail-ok`, "en", [true], { holdExpected: true });
    check(`${id}:rail-ok-then-the-coordinator-dialog-appears-exactly-as-at-419e56d`, isDeepStrictEqual(ok.confirms, [{ type: "confirm", message: COPY.en.confirmSignOut, accepted: true }]) && ok.now.departure !== null
      && ok.now.departure.label === reference.departure.label && ok.now.departure.text === reference.departure.text && isDeepStrictEqual(ok.now.departure.buttons, reference.departure.buttons) && ok.now.departure.html === reference.departure.html
      && !ok.now.status.present && isDeepStrictEqual(ok.now.rail, idsToLabels("en", drop.D0)) && railOps(ok.now.attempts).length === 0, { departure: ok.now.departure, reference: reference.departure, status: ok.now.status.present });
    await clickOne(page, "[...document.querySelectorAll('.settings-departure-dialog button')].filter((button) => (button.textContent || '').trim() === 'Stay')", `${id}:stay`);
    await delay(900);
    const stayed = await snap(page, ok.start.mark);
    const outcome = { identityIntact: intact(stayed), counters: counters(stayed), requests: navigationRequests.length - ok.start.requestsAt, dialogClosed: stayed.departure === null };
    check(`${id}:stay-resolves-false-as-at-419e56d`, isDeepStrictEqual(outcome, refOutcome) && outcome.identityIntact && outcome.dialogClosed && outcome.requests === 0 && isDeepStrictEqual(outcome.counters, ZERO), { outcome, reference: refOutcome });
    await closeAvatarMenu(page, `${id}:after-stay`);
    await evaluate(page, "__native.restore()").catch(() => {});
    await endSegment(segment, null);
  }
}
/** Row l — beforeunload warns only while a rail draft exists (pending or failed); zero attempts; none when clean or source-only. */
async function rowL(page) {
  caseStart("l");
  const results = {};
  // clean
  {
    await mountReversed(page, "l-clean");
    results.clean = { warn: await evaluate(page, "__native.warn()"), listeners: await evaluate(page, "__native.unloadListeners()") };
  }
  // source-only
  {
    await seed(page, seedsFor("en", { [RAIL_KEY]: "{}" }), "l-source");
    await mountApp(page, "l-source:mount", { path: "/app/tasks" });
    results.source = { warn: await evaluate(page, "__native.warn()"), listeners: await evaluate(page, "__native.unloadListeners()"), status: (await statusNow(page)).present };
  }
  // pending (held lock) and failed
  {
    const { S, D0 } = await mountReversed(page, "l-pending");
    const segment = await beginSegment(page, "l");
    const lockName = await evaluate(page, "verify.lockName()");
    await evaluate(page, `__native.hold(${JSON.stringify(lockName)})`);
    await dragGesture(page, "l-pending", { source: labelOf("en", D0[0]), targets: [labelOf("en", D0[2])] });
    await delay(400);
    results.pending = { warn: await evaluate(page, "__native.warn()"), listeners: await evaluate(page, "__native.unloadListeners()"), status: (await statusNow(page)).present };
    await evaluate(page, `__native.release(${JSON.stringify(lockName)})`);
    await waitUntil(page, "__native.unloadListeners() === 0", 5000);
    results.afterSuccess = { warn: await evaluate(page, "__native.warn()"), listeners: await evaluate(page, "__native.unloadListeners()") };
    const failed = await failedDrop(page, "l-failed", "en", { S: merge(S, visibleIds(), reorder(D0, D0[0], D0[2])) });
    results.failed = { warn: await evaluate(page, "__native.warn()"), listeners: await evaluate(page, "__native.unloadListeners()") };
    await openPanel(page, "l-failed");
    await clickTestId(page, "rail-order-discard", "l-failed:discard");
    await waitUntil(page, "!__native.railStatus().present", 4000);
    results.afterDiscard = { warn: await evaluate(page, "__native.warn()"), listeners: await evaluate(page, "__native.unloadListeners()") };
    // A real runner navigation away with a failed draft (the native prompt, if Chrome shows one, is accepted and recorded).
    await failedDrop(page, "l-real", "en", { S: failed.S, sourceIndex: 1, targetIndex: 3 });
    await endSegment(segment, null);
    const dialogsAt = dialogs.length;
    dialogPlan.push({ accept: true, purpose: "l: a real beforeunload prompt, if any" });
    await navigate(page, `${origin}/seed`, { expectUnload: false });
    const left = await waitUntil(page, "location.pathname === '/seed' && !!window.__native && !window.verify", 8000);
    const prompted = dialogs.slice(dialogsAt).filter((entry) => entry.type === "beforeunload");
    if (prompted.length === 0) dialogPlan.splice(dialogPlan.findIndex((plan) => plan.purpose?.startsWith("l:")), 1);
    pre("l:real-navigation-left-the-document", left);
    observe("l:real-navigation-with-a-failed-draft", { realPrompts: prompted });
  }
  record("observation", { id: "l:states", ...results });
  check("l:no-warning-when-clean-or-source-only", results.clean.warn.warned === false && results.source.warn.warned === false && results.source.status === true && results.clean.listeners === 0 && results.source.listeners === 0, results);
  check("l:warns-while-pending-and-while-failed-with-zero-handler-attempts", results.pending.warn.warned === true && results.pending.warn.attempts === 0 && results.pending.status === false && results.failed.warn.warned === true && results.failed.warn.attempts === 0
    && results.pending.listeners === 1 && results.failed.listeners === 1, results);
  check("l:no-warning-after-success-or-discard", results.afterSuccess.warn.warned === false && results.afterSuccess.listeners === 0 && results.afterDiscard.warn.warned === false && results.afterDiscard.listeners === 0, results);
}
/** Row n — a forced scope change through the identity channel from a second document: remount, committed order, draft lost. */
async function rowN(page) {
  caseStart("n");
  const { S, D0 } = await mountReversed(page, "n");
  const segment = await beginSegment(page, "n");
  await failedDrop(page, "n", "en", { S });
  const before = await evaluate(page, "(() => { const app = document.querySelector('.app'); app.__nativeMarked = true; return { instance: verify.instance, scope: verify.scope() }; })()");
  const changeMark = await markOf(page);
  await externalDocument(`localStorage.setItem(${JSON.stringify(IDENTITY_KEY)}, JSON.stringify({ accountId: null, nonce: "apprail-n-signed-out-elsewhere" })); true`, "n:identity-null");
  const gated = await waitUntil(page, "!!document.querySelector('.account-data-gate')", 6000);
  await externalDocument(`localStorage.setItem(${JSON.stringify(IDENTITY_KEY)}, JSON.stringify({ accountId: ${JSON.stringify(OWNER)}, nonce: "apprail-n-signed-in-again" })); true`, "n:identity-owner");
  const remounted = await waitUntil(page, READY_APP, 8000);
  await delay(800);
  const after = await snap(page, changeMark);
  const replaced = await evaluate(page, "!document.querySelector('.app')?.__nativeMarked");
  check("n:forced-scope-change-remounts-the-app", gated && remounted && replaced && after.scope.kind === "account" && after.scope.accountId === OWNER && after.scope.epoch > before.scope.epoch, { gated, remounted, replaced, scope: after.scope, before: before.scope, scopeLog: after.scopeLog });
  check("n:committed-order-displayed-draft-lost-no-status-no-warning-zero-writes", isDeepStrictEqual(after.rail, idsToLabels("en", D0)) && !after.status.present && after.unloadListeners === 0 && railOps(after.attempts).length === 0 && after.bytes === JSON.stringify(S),
    { rail: labelsToIds("en", after.rail), status: after.status.present, listeners: after.unloadListeners });
  await evaluate(page, "__native.restore()");
  await endSegment(segment, ZERO, { scopeTransitions: after.scopeLog.map((entry) => `${entry.kind}:${entry.accountId}:${entry.epoch}`) });
}
/** Row q — Features toggle success, failure, Retry and Reset to defaults make zero attempts on xai_rail_order. */
async function rowQ(page) {
  caseStart("q");
  const S = REVERSED();
  await seed(page, seedsFor("en", { [RAIL_KEY]: JSON.stringify(S), ...featuresAll() }), "q");
  await mountApp(page, "q:mount", { path: "/app/settings/features", ready: READY_FEATURES });
  const segment = await beginSegment(page, "q");
  const displayed = async () => labelsToIds("en", await railNow(page));
  const follows = (rail, hidden) => isDeepStrictEqual(rail, displayOrder(S, visibleIds(hidden)));
  const steps = {};
  await toggleFeature(page, "board", false, "q:board-off");
  steps.success = await displayed();
  await evaluate(page, `__native.denySet(${JSON.stringify(featureKey("matrix"))}, "SecurityError")`);
  await toggleFeature(page, "matrix", false, "q:matrix-fail", { expectFailure: true });
  steps.failure = await displayed();
  await evaluate(page, `__native.allowSet(${JSON.stringify(featureKey("matrix"))})`);
  await clickOne(page, `[...document.querySelectorAll('${FEATURES_PANE} [data-feature-id="matrix"] button')].filter((button) => button.getAttribute('aria-label') === 'Retry ' + ${JSON.stringify(labelOf("en", "matrix"))})`, "q:matrix-retry");
  pre("q:matrix-retry-committed", await waitUntil(page, `__native.native.get(${JSON.stringify(featureKey("matrix"))}) === "false"`, 6000));
  await delay(400);
  steps.retry = await displayed();
  const confirmsAt = dialogs.length;
  dialogPlan.push({ accept: true, purpose: "q: accept Reset to defaults" });
  await clickTestId(page, "features-reset-defaults", "q:reset");
  await waitFor(() => dialogs.length > confirmsAt, 4000);
  pre("q:reset-confirmed-with-the-features-text", dialogs[confirmsAt]?.message === COPY.en.featuresConfirmReset, { dialog: dialogs[confirmsAt] });
  pre("q:reset-committed", await waitUntil(page, `${JSON.stringify(FEATURE_IDS)}.every((id) => __native.native.get('xai_pref_features_' + id) === null || __native.native.get('xai_pref_features_' + id) === 'true')`, 6000));
  await delay(500);
  steps.reset = await displayed();
  const all = await snap(page, segment.mark);
  record("observation", { id: "q:rail-displays", steps, featuresAfter: await evaluate(page, "__native.features()") });
  check("q:zero-attempts-on-xai_rail_order-through-success-failure-retry-reset", all.attempts.filter((entry) => entry.key === RAIL_KEY).length === 0 && all.bytes === JSON.stringify(S), { attempts: brief(all.attempts.filter((entry) => entry.key === RAIL_KEY)) });
  check("q:the-rail-display-follows-R", follows(steps.success, ["board"]) && (follows(steps.failure, ["board", "matrix"]) || follows(steps.failure, ["board"])) && follows(steps.retry, ["board", "matrix"]) && follows(steps.reset, []), steps);
  await evaluate(page, "__native.restore()");
  await endSegment(segment, ZERO);
}

// ===================================================================================================
// E11 — export (the five contract §8 disk shapes under total denial, plus setup failures)
// ===================================================================================================
async function runExport() {
  const page = mainPage;
  await primeFacts(page);
  const BASE = "/app/calendar";
  // Shape 1: a failed drop with all modules visible.
  {
    caseStart("x1");
    const { S } = await mountReversed(page, "x1", "en", { path: BASE });
    const segment = await beginSegment(page, "x1");
    const drop = await failedDrop(page, "x1", "en", { S, kind: "SecurityError" });
    await exportUnderDenial(page, "x1", "en", drop.expected, { kind: "failed", S });
    await evaluate(page, "__native.restore()");
    await endSegment(segment, ZERO);
  }
  // Shape 2: a failed drop with Boards hidden by Features; the value keeps board at its stored index.
  {
    caseStart("x2");
    const S = BOARD_AT_2;
    await seed(page, seedsFor("en", { [RAIL_KEY]: JSON.stringify(S), ...featuresAll() }), "x2");
    await mountApp(page, "x2:mount", { path: "/app/settings/features", ready: READY_FEATURES });
    const segment = await beginSegment(page, "x2");
    await toggleFeature(page, "board", false, "x2:off");
    const drop = await failedDrop(page, "x2", "en", { S, hidden: ["board"], kind: "SecurityError" });
    pre("x2:expected-value-keeps-board-at-index-2", drop.expected.indexOf("board") === 2, { expected: drop.expected });
    await exportUnderDenial(page, "x2", "en", drop.expected, { kind: "failed", S });
    await evaluate(page, "__native.restore()");
    await endSegment(segment, ZERO);
  }
  // Shape 3: a failed drop over malformed bytes ({}); the value is the merge over DEFAULT_RAIL_ORDER.
  {
    caseStart("x3");
    await seed(page, seedsFor("en", { [RAIL_KEY]: "{}" }), "x3");
    await mountApp(page, "x3:mount", { path: BASE });
    const segment = await beginSegment(page, "x3");
    const drop = await failedDrop(page, "x3", "en", { S: facts0.registryDefault, invalidSource: true });
    await exportUnderDenial(page, "x3", "en", drop.expected, { kind: "failed", S: null, raw: "{}" });
    await endSegment(segment, ZERO);
  }
  // Shape 4: an export while a Retry is held behind the real per-key lock.
  {
    caseStart("x4");
    const { S } = await mountReversed(page, "x4", "en", { path: BASE });
    const segment = await beginSegment(page, "x4");
    const drop = await failedDrop(page, "x4", "en", { S, kind: "SecurityError" });
    await evaluate(page, `__native.allowSet(${JSON.stringify(RAIL_KEY)})`);
    const lockName = await evaluate(page, "verify.lockName()");
    await evaluate(page, `__native.hold(${JSON.stringify(lockName)})`);
    await openPanel(page, "x4");
    const retryMark = await markOf(page);
    await clickTestId(page, "rail-order-retry", "x4:retry");
    pre("x4:retry-held-behind-the-real-lock", await waitUntil(page, `(() => { const s = __native.railStatus(); return !!s.panel && s.panel.message && s.panel.message.text === ${JSON.stringify(COPY.en.saving)}; })()`, 4000)
      && (await evaluate(page, "__native.lockQuery()")).pending.includes(lockName), { status: await statusNow(page) });
    await exportUnderDenial(page, "x4", "en", drop.expected, { kind: "saving", S });
    const held = await snap(page, retryMark);
    check("x4:export-never-released-the-held-retry", railOps(held.attempts).length === 0 && held.bytes === JSON.stringify(S), { attempts: brief(railOps(held.attempts)) });
    await evaluate(page, `__native.release(${JSON.stringify(lockName)})`);
    const gone = await waitUntil(page, "!__native.railStatus().present", 5000);
    await delay(400);
    const after = await snap(page, retryMark);
    check("x4:after-release-exactly-one-write-status-gone", gone && railOps(after.attempts, ["set"]).length === 1 && after.bytes === JSON.stringify(drop.expected), { sets: brief(railOps(after.attempts, ["set"])) });
    await endSegment(segment, ZERO);
  }
  // Shape 5: an export after navigating to another route and back (App lifetime).
  {
    caseStart("x5");
    const { S } = await mountReversed(page, "x5", "en", { path: BASE });
    const segment = await beginSegment(page, "x5");
    const drop = await failedDrop(page, "x5", "en", { S, kind: "SecurityError" });
    await trustedClick(page, `.app-rail .rail-items .rail-btn[aria-label=${JSON.stringify(labelOf("en", "dashboard"))}]`, "x5:to-dashboard");
    const away = await waitUntil(page, "location.pathname === '/app/dashboard'", 4000);
    await delay(300);
    const awayStatus = await statusNow(page);
    await trustedClick(page, `.app-rail .rail-items .rail-btn[aria-label=${JSON.stringify(labelOf("en", "calendar"))}]`, "x5:back-to-calendar");
    const back = await waitUntil(page, `location.pathname === ${JSON.stringify(BASE)}`, 4000);
    await delay(300);
    check("x5:navigation-not-held-draft-and-status-survive", away && back && statusMatches(awayStatus, "en", "failed") && isDeepStrictEqual(await railNow(page), idsToLabels("en", drop.P)), { away, back, awayStatus });
    await exportUnderDenial(page, "x5", "en", drop.expected, { kind: "failed", S });
    await evaluate(page, "__native.restore()");
    await endSegment(segment, { push: 2, replace: 0, popstate: 0, commits: 2 });
  }
  // Setup failures: the anchor click throws (EN, then a recovered export), createObjectURL throws (ZH).
  for (const [lang, failure] of [["en", "click"], ["zh", "create"]]) {
    const id = `xf-${lang}-${failure}`;
    caseStart(id);
    const { S } = await mountReversed(page, id, lang, { path: BASE });
    const segment = await beginSegment(page, id);
    const drop = await failedDrop(page, id, lang, { S, kind: "SecurityError" });
    await exportUnderDenial(page, id, lang, drop.expected, { kind: "failed", S, failure });
    if (failure === "click") await exportUnderDenial(page, `${id}-recovered`, lang, drop.expected, { kind: "failed", S, clearsError: true });
    await evaluate(page, "__native.restore()");
    await endSegment(segment, ZERO);
  }
}
/**
 * One Export by trusted pointer under total storage denial (contract §8): attempt counters, one URL created and the same
 * revoked, the anchor appended, clicked once while connected and removed, the actual download parsed from disk and
 * deep-equal to the whole envelope, the warning and the status kept. `failure` arms a one-shot setup failure.
 */
async function exportUnderDenial(page, id, lang, value, { kind, S, raw = null, failure = null, clearsError = false }) {
  await openPanel(page, id);
  clearDownloads();
  const urlBefore = await evaluate(page, "__native.urlTrace()");
  const clickBefore = await evaluate(page, "__native.clickTrace()");
  const anchorBefore = await evaluate(page, "__native.anchorTrace()");
  const bytesBefore = await bytesNow(page);
  const location = await evaluate(page, "verify.location()");
  if (failure === "click") await evaluate(page, "__native.failNextClick()");
  if (failure === "create") await evaluate(page, "__native.failNextCreate()");
  await evaluate(page, "__native.denyAll()");
  const probe = await evaluate(page, "(() => { try { localStorage.getItem('xai_native_export_probe'); return 'read'; } catch (error) { return error.name; } })()");
  const mark = await markOf(page);
  await clickTestId(page, "rail-order-export", `${id}:export`);
  const download = failure ? null : await awaitDownload();
  if (failure) await delay(1500);
  await delay(200);
  const window = await snap(page, mark);
  await evaluate(page, "__native.restore()");
  if (kind === "failed" && !raw) await evaluate(page, `__native.denySet(${JSON.stringify(RAIL_KEY)}, "SecurityError")`);
  const urlAfter = await evaluate(page, "__native.urlTrace()");
  const clickAfter = await evaluate(page, "__native.clickTrace()");
  const anchorAfter = await evaluate(page, "__native.anchorTrace()");
  const anchorsInDom = await evaluate(page, "__native.anchorsInDom()");
  const warn = await evaluate(page, "__native.warn()");
  const status = await statusNow(page);
  const created = urlAfter.created.slice(urlBefore.created.length);
  const revoked = urlAfter.revoked.slice(urlBefore.revoked.length);
  const clicks = clickAfter.attempts - clickBefore.attempts;
  const added = anchorAfter.added.slice(anchorBefore.added.length);
  const removed = anchorAfter.removed.slice(anchorBefore.removed.length);
  pre(`${id}:total-denial-injector-fired-before-the-export`, probe === "SecurityError", { probe });
  record("export-trace", { id, created, revoked, createAttempts: urlAfter.createAttempts - urlBefore.createAttempts, clicks, clickHrefs: clickAfter.hrefs.slice(clickBefore.hrefs.length), connected: clickAfter.connected.slice(clickBefore.connected.length), added, removed, anchorsInDom, attempts: brief(window.attempts) });
  check(`${id}:zero-read-write-remove-attempts-during-the-export`, window.attempts.length === 0, { attempts: brief(window.attempts) });
  if (failure === "create") {
    check(`${id}:createObjectURL-failure-no-url-no-anchor-no-click`, urlAfter.createAttempts - urlBefore.createAttempts === 1 && created.length === 0 && revoked.length === 0 && clicks === 0 && added.length === 0 && anchorsInDom === 0, { created, revoked, clicks, added });
  } else {
    check(`${id}:exactly-one-object-url-created-and-that-url-revoked`, created.length === 1 && revoked.length === 1 && revoked[0] === created[0], { created, revoked });
    check(`${id}:anchor-appended-clicked-once-while-connected-and-removed`, clicks === 1 && clickAfter.connected.at(-1) === true && clickAfter.hrefs.at(-1) === created[0] && clickAfter.downloads.at(-1) === "rail-order-draft.json" && added.length === 1 && removed.length === 1 && anchorsInDom === 0,
      { clicks, added, removed, anchorsInDom });
  }
  if (failure || kind === "saving") await screenshot(page, `${id}-panel`, { state: failure ? `export setup failure (${failure}) under total denial: the localized error line` : "export while a Retry is held behind the real lock (saving)", lang });
  if (failure) {
    check(`${id}:setup-failure-shows-the-localized-error-and-writes-no-file`, status.panel?.extraLines?.some((line) => line.role === "alert" && line.text === COPY[lang].exportFailed) && visibleDownloads().length === 0, { extraLines: status.panel?.extraLines, downloads: visibleDownloads() });
  } else {
    const file = `${prefix}-${id}-rail-order-draft.json`;
    if (download) {
      writeFileSync(join(evidenceDir, file), download.raw, { flag: "wx" });
      artifacts.push({ file, sha256: sha256(download.raw), bytes: download.raw.length, case: currentCase });
      record("disk-export", { id, file, sha256: sha256(download.raw), raw: download.raw.toString("utf8") });
    }
    check(`${id}:disk-file-deep-equals-the-whole-envelope`, Boolean(download) && download.names.length === 1 && download.names[0] === "rail-order-draft.json" && isDeepStrictEqual(parse(download.raw.toString("utf8")), envelopeOf(value)),
      { names: download?.names ?? null, parsed: download ? parse(download.raw.toString("utf8")) : null, expected: envelopeOf(value) });
    if (clearsError) check(`${id}:a-later-successful-export-clears-the-error-line`, !(status.panel?.extraLines ?? []).some((line) => line.text === COPY[lang].exportFailed), { extraLines: status.panel?.extraLines });
  }
  check(`${id}:afterwards-the-warning-and-the-status-remain-focus-on-export`, warn.warned === true && warn.attempts === 0 && statusMatches(status, lang, kind, { open: true }) && window.focus?.testid === "rail-order-export", { warn, status, focus: window.focus });
  check(`${id}:bytes-and-location-unchanged`, (await bytesNow(page)) === bytesBefore && (raw === null || bytesBefore === raw) && isDeepStrictEqual(await evaluate(page, "verify.location()"), location) && (S === null || bytesBefore === JSON.stringify(S)), { bytesBefore });
}
