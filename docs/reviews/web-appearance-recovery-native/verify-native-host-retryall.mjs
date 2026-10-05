/**
 * CP-APPEARANCE-01 batch 45 (contract r3 §14 E12, E13, E26): the FIXED Settings Appearance caller in real headless
 * Chrome, in the production App composition: the §9 host matrix rows a–s (E12), native downstream (E13) and native
 * Retry all (E26). Parent-role native verifier. Verification only: it repairs nothing, implements nothing, accepts
 * nothing and changes no product file, contract, ledger, control plane or existing evidence. It is a new runner; the
 * batch 43 runner ./verify-native-fixed.mjs, its fixture and prelude, and every earlier file in this directory are read,
 * never modified.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-appearance-recovery-native/verify-native-host-retryall.mjs <fixed revision> <host|downstream|retryall> <suffix>
 *
 * Modes (production App composition, ./native-host-retryall-app.tsx, instruments ./native-host-retryall-prelude.js):
 *   host       (E12): contract §9 host matrix rows a–s, each with history counters (pushState, replaceState, popstate,
 *              router location commits) and a runtime-error gate per document segment; row m follows controller
 *              ruling 4 (exactly one release: one live proceed() on POP or one router.navigate replay, zero non-live
 *              blocker calls); row h compares the no-draft sign-out outcome with 5cd63ff in both auth branches.
 *   downstream (E13): contract §10 items 2–7: byte compatibility in new documents (readLocalPref, NotFoundPage,
 *              AccountStorageGate; 5cd63ff-written bytes read by the fixed product), display truth, crash safety for
 *              every §5 item 2 value (the ten E4 crashing values on several routes) and malformed bytes written by a
 *              second document into a running App, cross-document propagation of all seven fields and a preserved
 *              conflict, clean-state chrome invariance against 5cd63ff, and cross-module isolation.
 *   retryall   (E26): native Retry all in EN and ZH by trusted pointer and keyboard input: the failure sources, attempt
 *              counters, per-frame status line, full success, partial result, held and late members, supersession,
 *              Discard and Discard all during an open pass, and the absence of the old button.
 *
 * - Products: immutable `git archive`s of the fixed revision and of 5cd63ff; the fixture is bundled with esbuild from
 *   stdin with resolveDir = that archive. Every `@repo/*` specifier is pinned to the archive's own package export; a
 *   guard plugin fails the build if any module is loaded from the packages/, apps/ or docs/ tree of the dependency
 *   checkout or of this runner's checkout. Third-party modules come from XAI_DEPS_ROOT only when its pnpm-lock.yaml
 *   SHA-256 equals the archive's and the contract gate (consistency gate; read-only use).
 * - Variants: "fixed" and "before" use the production WebAuthSessionProvider with a synthetic client (the legacy
 *   provider branch). "fixed-coord" and "before-coord" (host row h only) differ in one point: the auth-session
 *   CONTEXT read through `@repo/web-auth-device-session/web` by App, AccountStorageGate and AppProviders is the real
 *   context value plus a synthetic generation `coordinator` (one virtual module, recorded in provenance), so that
 *   App.handleSignOut takes its coordinator branch; the provider, the route gates and every other module are unchanged.
 * - Page: the prelude (classic script) then the bundle, served from 127.0.0.1 only by this runner's own server; every
 *   other host resolves to NOTFOUND; isolated headless Chrome profile and download directory; CDP trusted mouse and
 *   keyboard input after a centre hit-test; real window.confirm dialogs answered through Page.handleJavaScriptDialog by
 *   plan; App.handleSignOut's final window.location.assign("/") is observed through the CDP Fetch domain and answered
 *   with HTTP 204, so the document and its instruments survive; a second document is an independent same-origin tab.
 * - DevTools transport: the pipe (--remote-debugging-pipe) with flattened target sessions. Key presses carry no
 *   nativeVirtualKeyCode (K-1, ../web-native-keyinput-k1/review-k1.md); every document's key trace (keydown, keypress,
 *   keyup) must equal exactly the runner's own presses, in order and trusted (run-level precondition).
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log` (plus export JSON and screenshots) in this directory; existing
 *   evidence is never overwritten. Exit 0 = harness valid and every check PASS; 2 = harness valid and a product check
 *   FAILED (the run stops at the first one); 1 = harness invalid (a precondition). Development probes may redirect
 *   evidence with XAI_NATIVE_EVIDENCE_DIR (refused inside the repository).
 */
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BEFORE_REVISION = "5cd63ff652f02a2c726187fe12cbc796218d31c0";
const LOCKFILE_GATE_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const CONTRACT_PATH = "docs/reviews/web-appearance-recovery-contract/contract.md";
const CONTRACT_SHA256 = "ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? output;
if (process.env.XAI_NATIVE_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
/** Development probes only: run a subset of rows/scenarios (refused for evidence written into the repository). */
const ROW_FILTER = process.env.XAI_NATIVE_ROWS ? process.env.XAI_NATIVE_ROWS.split(",").map((entry) => entry.trim()).filter(Boolean) : null;
if (ROW_FILTER && !process.env.XAI_NATIVE_EVIDENCE_DIR) throw Error("XAI_NATIVE_ROWS is a development-probe option; committed evidence runs every row");
const selected = (name) => ROW_FILTER === null || ROW_FILTER.includes(name);
const [requested, mode, suffix] = process.argv.slice(2);
const MODES = ["host", "downstream", "retryall"];
if (!requested) throw Error("Fixed revision required");
if (!MODES.includes(mode)) throw Error(`Unsupported mode ${mode}; use ${MODES.join("|")}`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const resolved = execFileSync("git", ["rev-parse", "--verify", `${requested}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const resolvedTree = execFileSync("git", ["rev-parse", `${resolved}^{tree}`], { cwd: root, encoding: "utf8" }).trim();
const short = resolved.slice(0, 7);
const evidencePath = join(evidenceDir, `native-${short}-${suffix}-${mode}.log`);
if (existsSync(evidencePath)) throw Error("Evidence exists; use a distinct suffix");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const records = [];
const runtimeErrors = [];
const consoleWarnings = [];
const dialogs = [];
const dialogPlan = [];
const artifacts = [];
const screenshots = [];
const navigationRequests = [];
const rowGates = [];
const networkSeen = { checkpoints: 0, attempts: 0, nonLocal: 0, samples: [], selfTestProbes: 0 };
const keyboardAudit = { checkpoints: 0, runnerPresses: 0, keyEvents: 0, expectedKeyEvents: 0, mismatches: [] };
let lastCheckId = null;
const record = (name, value = {}) => {
  records.push({ name, ...value });
  if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 300));
};
let checks = 0;
let productChecks = 0;
const verify = (id, condition, details, kind) => {
  checks += 1;
  if (kind === "product") productChecks += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { id, kind, pass, ...details });
  if (!pass) throw Object.assign(new Error(`${kind === "precondition" ? "PRECONDITION: " : "PRODUCT CHECK FAILED: "}${id}`), { checkId: id, checkKind: kind });
};
const pre = (id, condition, details = {}) => verify(id, condition, details, "precondition");
const check = (id, condition, details = {}) => verify(id, condition, details, "product");
const observe = (id, details = {}) => record("observation", { id, ...details });

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const RUNNER = "verify-native-host-retryall.mjs";
const FIXTURE = "native-host-retryall-app.tsx";
const PRELUDE = "native-host-retryall-prelude.js";
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const fixtureSource = readFileSync(join(output, FIXTURE), "utf8");
const preludeSource = readFileSync(join(output, PRELUDE), "utf8");
const dependencyNodeModules = join(dependencyRoot, "node_modules");
if (!existsSync(dependencyNodeModules)) throw Error("PRECONDITION: dependency tree missing; set XAI_DEPS_ROOT");
const archiveLock = execFileSync("git", ["show", `${resolved}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
const beforeLock = execFileSync("git", ["show", `${BEFORE_REVISION}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
const dependencyLock = readFileSync(join(dependencyRoot, "pnpm-lock.yaml"));
if (sha256(dependencyLock) !== sha256(archiveLock) || sha256(archiveLock) !== LOCKFILE_GATE_SHA256 || sha256(beforeLock) !== LOCKFILE_GATE_SHA256) throw Error("PRECONDITION: lockfile gate (dependency checkout, both revisions and contract gate must be equal)");
const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find((name) => name.startsWith("esbuild@0.28.1"));
if (!esbuildFolder) throw Error("PRECONDITION: pinned esbuild 0.28.1 missing");
const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
const docsHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const productDelta = execFileSync("git", ["diff", "--name-only", resolved, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim();
const fixedDelta = execFileSync("git", ["diff", "--name-only", BEFORE_REVISION, resolved, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
const contractSha256 = sha256(execFileSync("git", ["show", `HEAD:${CONTRACT_PATH}`], { cwd: root, maxBuffer: 20 * 1024 * 1024 }));
const versionOf = (name) => {
  try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
};
/** The 24 product files of the Terra implementation (contract r3 §11; control plane E6 row). */
const EXPECTED_FIXED_DELTA = [
  "apps/web/src/App.tsx",
  "apps/web/src/__tests__/App.appearance.test.tsx",
  "packages/xai-web-settings-appearance/docs/api.md",
  "packages/xai-web-settings-appearance/docs/test.md",
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearanceController.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.bilingual.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.live-binding.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.rendering.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.save-reset.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearanceRetryAll.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/appearanceLockFixture.ts",
  "packages/xai-web-settings-appearance/src/index.ts",
  "packages/xai-web-settings-appearance/src/internal/AppearanceActions.tsx",
  "packages/xai-web-settings-appearance/src/internal/AppearanceStatus.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearanceController.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearanceRecoveryCopy.ts",
  "packages/xai-web-settings-appearance/src/styles.css",
  "packages/xai-web-settings-appearance/src/types.ts",
  "packages/xai-web-shell/docs/api.md",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/Topbar.tsx",
  "packages/xai-web-shell/src/__tests__/Topbar.test.tsx",
  "packages/xai-web-shell/src/types.ts",
];
/** Contract r3 header source table (at 5cd63ff). Unit files Terra changed must differ at the fixed SHA; every other row must be equal. */
const CONTRACT_SOURCE_HASHES = {
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx": "552eb224c5103d1c0d0ee878420f8a586ee91575dd8461f908de1147cf2b08c3",
  "packages/xai-web-settings-appearance/src/internal/appearancePane.tsx": "34b938200d1a43a9e73b1e5e6397ed7014ca763abb5082040d72cd309f43309c",
  "packages/xai-web-settings-appearance/src/types.ts": "18d5894e6603427f933100f9030d6e403c03abc57d9bd561f372b0b4f559f6d6",
  "packages/xai-web-settings-appearance/src/index.ts": "10bfbed11749e9c65fc3c2d40d0a50e177154254ef83a2e0690c693aeb4dc776",
  "packages/xai-web-settings-appearance/src/styles.css": "1b17d1f442905e255eae53e4e16a01c02b4a912ed6a1482231e8db5e50d5927c",
  "apps/web/src/App.tsx": "5d10dba6a879cf0d42f224e58ef70637bd82b71dc1318ee99c4567977638fb59",
  "packages/xai-web-shell/src/Topbar.tsx": "70ba299e4d8a088ba0d085272fbc4cfe95933265bd6066fb59ae5cdae3de5297",
  "packages/xai-web-shell/src/Shell.tsx": "7d46423f40adc5412f54b701c2c93ab4f7529e329dc22766f387d78f614f8df0",
  "packages/xai-web-shell/src/types.ts": "92b68b2ba5da830bd8dcdfe33652b2b440eaef72b8665ccd868d5f49d82b73de",
  "apps/web/src/routes/modules/departureCoordinator.tsx": "0844a697b146b07fceb1835da7c4410db8812bc07bdea362f3386e991a2bc075",
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
const UNIT_CHANGED = ["packages/xai-web-settings-appearance/src/AppearancePane.tsx", "packages/xai-web-settings-appearance/src/types.ts", "packages/xai-web-settings-appearance/src/index.ts",
  "packages/xai-web-settings-appearance/src/styles.css", "apps/web/src/App.tsx", "packages/xai-web-shell/src/Topbar.tsx", "packages/xai-web-shell/src/Shell.tsx", "packages/xai-web-shell/src/types.ts"];
/** Reader, writer and host modules that must be bundled from the archive in every variant (contract §2, §9). */
const REQUIRED_COMMON = [
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/RouteGateElements.tsx",
  "apps/web/src/routes/RouteErrorBoundary.tsx",
  "apps/web/src/pages/NotFoundPage.tsx",
  "apps/web/src/providers/AppProviders.tsx",
  "apps/web/src/providers/AccountStorageGate.tsx",
  "apps/web/src/observability/runtime.ts",
  "apps/web/src/service-worker/register.ts",
  "apps/web/src/routes/modules/shellRegistrations.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/settingsDeparture.ts",
  "apps/web/src/routes/modules/settingsPaneComposition.ts",
  "packages/xai-web-settings-appearance/src/index.ts",
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearancePane.tsx",
  "packages/xai-web-settings-appearance/src/constants.ts",
  "packages/xai-web-settings-appearance/src/appearanceDefaults.ts",
  "packages/xai-web-settings-appearance/src/styles.css",
  "packages/plugin-web-settings-shell/src/SettingRow.tsx",
  "packages/plugin-web-settings-rest/src/panes/morePane.tsx",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/Topbar.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/AvatarMenu.tsx",
  "packages/xai-web-shell/src/SignOutConfirmDialog.tsx",
  "packages/xai-web-shell/src/registry.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/xai-web-event-bus/src/emitter.ts",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/codec.ts",
  "packages/plugin-web-storage/src/internal/registry.ts",
  "packages/plugin-web-storage/src/internal/sameTabBus.ts",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/accountOwnership.ts",
  "packages/plugin-web-storage/src/internal/accountCoordination.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-tokens/src/apply.ts",
  "packages/plugin-web-tokens/src/i18n.ts",
  "packages/plugin-web-tokens/src/tokens.css",
  "packages/plugin-web-tokens/src/layout.css",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/web.ts",
  "packages/web-auth-device-session/src/guards.tsx",
];
const REQUIRED_FIXED_ONLY = [
  "packages/xai-web-settings-appearance/src/internal/appearanceController.tsx",
  "packages/xai-web-settings-appearance/src/internal/AppearanceActions.tsx",
  "packages/xai-web-settings-appearance/src/internal/AppearanceStatus.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearanceRecoveryCopy.ts",
];
const REQUIRED_BEFORE_ONLY = ["packages/plugin-web-settings-shell/src/SettingsFooter.tsx"];
const VARIANTS = {
  fixed: { revision: resolved, stage: "fixed", coordinator: false },
  "fixed-coord": { revision: resolved, stage: "fixed", coordinator: true },
  before: { revision: BEFORE_REVISION, stage: "before", coordinator: false },
  "before-coord": { revision: BEFORE_REVISION, stage: "before", coordinator: true },
};
const VARIANTS_BY_MODE = { host: ["fixed", "fixed-coord", "before", "before-coord"], downstream: ["fixed", "before"], retryall: ["fixed"] };

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-appearance-host-retryall-")));
const profile = join(directory, "profile");
const downloads = join(directory, "downloads");
let server = null;
let origin = "";
const served = {};
const bundles = {};
let currentVariant = "fixed";

// ---------------------------------------------------------------------------------------------------
// Archives and bundles (pinned, guarded), one per variant
// ---------------------------------------------------------------------------------------------------
const archives = {};
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
/** The synthetic auth-session context of the coordinator variants (the only virtual module; see the header). */
const coordinatorWrapper = (webEntry) => `
import { useWebAuthSession as realUseWebAuthSession } from ${JSON.stringify(webEntry)};
export * from ${JSON.stringify(webEntry)};
const OWNER = "appearance-native-A";
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
  const archive = extractArchive(variant.revision);
  const { snapshot, aliases } = archive;
  const forbiddenRoots = [...new Set([dependencyRoot, root].map((base) => realpathSync(base)))].flatMap((base) => ["packages", "apps", "docs"].map((tree) => join(base, tree) + sep));
  const guardViolations = [];
  const pinnedRepo = [];
  const archiveModules = new Set();
  const archiveRoot = snapshot + sep;
  const authAlias = aliases.get("@repo/web-auth-device-session");
  const webEntry = join(authAlias.folder, typeof authAlias.pkg.exports["./web"] === "object" ? authAlias.pkg.exports["./web"].import : authAlias.pkg.exports["./web"]);
  const redirectedImporters = [];
  const plugin = { name: "appearance-host-retryall-archive-pin-guard", setup(buildApi) {
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
  const virtualInputs = inputs.filter((input) => input.startsWith("native-auth:"));
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== FIXTURE && !input.startsWith("<define:") && !input.startsWith("native-auth:"));
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const required = [...REQUIRED_COMMON, ...(variant.stage === "fixed" ? REQUIRED_FIXED_ONLY : REQUIRED_BEFORE_ONLY)];
  const missingRequired = required.filter((file) => !inputs.includes(file) || (!archiveModules.has(file) && !file.endsWith(".css")));
  const requiredHashes = Object.fromEntries(required.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const protectedDrift = variant.stage === "fixed" ? required.filter((file) => !EXPECTED_FIXED_DELTA.includes(file)).filter((file) => {
    const before = execFileSync("git", ["show", `${BEFORE_REVISION}:${file}`], { cwd: root, maxBuffer: 50 * 1024 * 1024 });
    return sha256(before) !== requiredHashes[file];
  }) : [];
  const provenance = {
    variant: name, revision: variant.revision, stage: variant.stage, coordinator: variant.coordinator,
    bundleSha256: sha256(js), bundleCssSha256: sha256(css), bundleModuleComments: moduleIndex.length,
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign, virtual: virtualInputs },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
    requiredModules: { count: required.length, missing: missingRequired, sha256: requiredHashes, protectedModulesDriftedFromBefore: protectedDrift },
    coordinatorWrapper: variant.coordinator ? { sha256: sha256(coordinatorWrapper(relative(snapshot, webEntry))), redirectedImporters: [...new Set(redirectedImporters)].sort(), realAuthModulesFromArchive: ["packages/web-auth-device-session/src/session.tsx", "packages/web-auth-device-session/src/web.ts"].every((file) => archiveModules.has(file)) } : null,
  };
  record("bundle-provenance", provenance);
  pre(`baseline:${name}:guard-no-module-from-a-checkout`, guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre(`baseline:${name}:every-required-module-bundled-from-archive`, missingRequired.length === 0, { missingRequired });
  pre(`baseline:${name}:bundled-protected-modules-byte-identical-to-5cd63ff`, protectedDrift.length === 0, { protectedDrift });
  if (variant.coordinator) {
    // Every importer of the package's ./web entry (App, AccountStorageGate, the route gates, AppProviders, the auth page,
    // settings-rest's account-deletion hook and the fixture) reads the same synthetic context, as one production context would be.
    pre(`baseline:${name}:exactly-one-virtual-module-the-synthetic-auth-session-context`, virtualInputs.length === 1 && provenance.coordinatorWrapper.realAuthModulesFromArchive
      && provenance.coordinatorWrapper.redirectedImporters.includes("apps/web/src/App.tsx")
      && provenance.coordinatorWrapper.redirectedImporters.every((importer) => importer === "<stdin>" || importer === FIXTURE || (!importer.startsWith("..") && existsSync(join(snapshot, importer)))), provenance.coordinatorWrapper);
  } else {
    pre(`baseline:${name}:no-virtual-module`, virtualInputs.length === 0, { virtualInputs });
  }
  bundles[name] = { js, css, moduleIndex, provenance };
  return bundles[name];
}

// ---------------------------------------------------------------------------------------------------
// Browser over the DevTools PIPE transport, flattened target sessions, several pages
// ---------------------------------------------------------------------------------------------------
let browser = null;
let main = null;
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
    if (!message.method || !message.sessionId) return;
    const page = state.pages.get(message.sessionId);
    if (!page) return;
    if (message.method === "Inspector.targetCrashed") {
      page.crashed = { afterCheck: lastCheckId };
      runtimeErrors.push({ kind: "renderer-crash", page: page.label, variant: page.variant ?? null, afterCheck: lastCheckId, text: "Inspector.targetCrashed" });
    } else if (message.method === "Debugger.paused") {
      if (page.onPaused) page.onPaused(message.params);
    } else if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails ?? {};
      runtimeErrors.push({ kind: "exception", page: page.label, variant: page.variant ?? null, afterCheck: lastCheckId, text: String(details.exception?.description ?? details.text ?? "").slice(0, 600), source: frameSource(details.stackTrace?.callFrames?.[0] ?? { url: details.url, lineNumber: details.lineNumber, columnNumber: details.columnNumber }) });
    } else if (message.method === "Runtime.consoleAPICalled") {
      const text = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ").slice(0, 600);
      const source = frameSource(message.params.stackTrace?.callFrames?.[0]);
      if (message.params.type === "error" || message.params.type === "assert") runtimeErrors.push({ kind: `console.${message.params.type}`, page: page.label, variant: page.variant ?? null, afterCheck: lastCheckId, text, source });
      else if (message.params.type === "warning") consoleWarnings.push({ page: page.label, variant: page.variant ?? null, text: text.slice(0, 300), source, afterCheck: lastCheckId });
    } else if (message.method === "Page.javascriptDialogOpening") {
      if (message.params.type === "beforeunload" && page.navigating) {
        dialogs.push({ type: "beforeunload", page: page.label, message: message.params.message, expected: true, accepted: true, reason: "runner-initiated navigation away from a document with drafts", afterCheck: lastCheckId });
        page.cdp("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
      } else {
        const plan = dialogPlan.shift() ?? null;
        const accept = plan ? plan.accept : message.params.type === "beforeunload";
        dialogs.push({ type: message.params.type, page: page.label, message: message.params.message, expected: Boolean(plan), accepted: accept, purpose: plan?.purpose ?? null, afterCheck: lastCheckId, at: Date.now() });
        page.cdp("Page.handleJavaScriptDialog", { accept }).catch(() => {});
      }
    } else if (message.method === "Fetch.requestPaused") {
      navigationRequests.push({ page: page.label, url: message.params.request.url, resourceType: message.params.resourceType, afterCheck: lastCheckId, at: Date.now() });
      page.cdp("Fetch.fulfillRequest", { requestId: message.params.requestId, responseCode: 204, responseHeaders: [{ name: "Cache-Control", value: "no-store" }], body: "" }).catch(() => {});
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
      try { message = JSON.parse(text); } catch { record("devtools-message-unparsed", { afterCheck: lastCheckId, bytes: text.length, head: text.slice(0, 200) }); continue; }
      try { handle(message); } catch (error) { record("devtools-event-handler-error", { afterCheck: lastCheckId, error: String(error).slice(0, 300) }); }
      settle(message);
    }
    if (start < chunk.length) chunks.push(chunk.subarray(start));
  });
  proc.once("exit", (code, signal) => { state.processExit = { code, signal, afterCheck: lastCheckId, at: new Date().toISOString() }; });
  const closed = (why) => {
    if (!state.open) return;
    state.open = false;
    state.pipeClose = { why, afterCheck: lastCheckId, at: new Date().toISOString(), processExit: state.processExit ?? null, pending: pending.size };
    record("devtools-connection-closed", state.pipeClose);
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
/** Attaches a flattened session to `targetId` and enables the page domains (events before any page script). */
async function attachPage(targetId, label) {
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  const page = { label, targetId, sessionId, presses: [], navigating: false, crashed: null, onPaused: null };
  page.cdp = (method, params = {}) => browser.send(method, params, sessionId);
  browser.pages.set(sessionId, page);
  await page.cdp("Inspector.enable");
  await page.cdp("Runtime.enable");
  await page.cdp("Page.enable");
  await page.cdp("DOM.enable");
  await page.cdp("DOMStorage.enable");
  await page.cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  return page;
}
async function openBrowser() {
  browser = await launch();
  let target = null;
  for (let attempt = 0; attempt < 200 && !target; attempt += 1) {
    const { targetInfos } = await Promise.race([browser.send("Target.getTargets"), delay(5000).then(() => ({ targetInfos: [] }))]);
    target = targetInfos.find((info) => info.type === "page") ?? null;
    if (!target) await delay(50);
  }
  if (!target) throw Error("PRECONDITION: no page target over the DevTools pipe");
  main = await attachPage(target.targetId, "main");
  await browser.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
  await main.cdp("Page.bringToFront");
}
async function closeBrowser() {
  const current = browser;
  if (!current) return { graceful: true };
  browser = null;
  current.send("Browser.close").catch(() => {});
  const graceful = await Promise.race([current.exited.then(() => true), delay(8000).then(() => false)]);
  if (!graceful) {
    current.proc.kill("SIGTERM");
    await Promise.race([current.exited, delay(3000)]);
    if (current.proc.exitCode === null && current.proc.signalCode === null) current.proc.kill("SIGKILL");
  }
  current.open = false;
  return { graceful };
}
const EVALUATE_TIMEOUT_MS = 20000;
async function pausedStack(page) {
  try {
    const paused = new Promise((resolve) => { page.onPaused = resolve; });
    await Promise.race([page.cdp("Debugger.enable"), delay(5000)]);
    await Promise.race([page.cdp("Debugger.pause"), delay(5000)]);
    const params = await Promise.race([paused, delay(8000).then(() => null)]);
    page.onPaused = null;
    if (!params) return { paused: false };
    const frames = (params.callFrames ?? []).slice(0, 25).map((frame) => ({ functionName: frame.functionName, line: frame.location.lineNumber, column: frame.location.columnNumber, url: frame.url, module: moduleAt(frame.url, frame.location.lineNumber) }));
    await Promise.race([page.cdp("Debugger.resume"), delay(3000)]);
    return { paused: true, reason: params.reason, frames };
  } catch (error) {
    return { paused: false, error: String(error) };
  }
}
async function input(method, params, page = main) {
  if (page.crashed) throw Object.assign(Error("PRECONDITION: renderer crashed (Inspector.targetCrashed)"), { checkId: "harness:renderer-crash", checkKind: "precondition" });
  const result = await Promise.race([page.cdp(method, params), delay(EVALUATE_TIMEOUT_MS).then(() => ({ timedOut: true }))]);
  if (result?.timedOut) {
    const stack = await pausedStack(page);
    record("hang-diagnosis", { afterCheck: lastCheckId, page: page.label, input: { method, params }, stack });
    throw Object.assign(Error(`PRECONDITION: input ${method} ${params.type} was not acknowledged within ${EVALUATE_TIMEOUT_MS} ms (see hang-diagnosis)`), { checkId: "harness:input-timeout", checkKind: "precondition" });
  }
  return result;
}
const evaluate = async (expression, page = main) => {
  if (page.crashed) throw Object.assign(Error("PRECONDITION: renderer crashed (Inspector.targetCrashed)"), { checkId: "harness:renderer-crash", checkKind: "precondition" });
  const result = await Promise.race([
    page.cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }),
    delay(EVALUATE_TIMEOUT_MS).then(() => ({ timedOut: true })),
  ]);
  if (result.timedOut) {
    const stack = await pausedStack(page);
    record("hang-diagnosis", { afterCheck: lastCheckId, page: page.label, expression: expression.slice(0, 300), stack });
    throw Object.assign(Error(`PRECONDITION: page evaluation did not answer within ${EVALUATE_TIMEOUT_MS} ms (see hang-diagnosis)`), { checkId: "harness:page-evaluation-timeout", checkKind: "precondition" });
  }
  if (result.exceptionDetails) throw Error(`Page evaluation failed: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`);
  return result.result.value;
};
const waitUntil = async (expression, timeout = 6000, page = main) => {
  const deadline = Date.now() + timeout;
  for (;;) {
    try {
      if (await evaluate(expression, page)) return true;
    } catch (error) {
      if (error?.checkKind === "precondition") throw error;
    }
    if (Date.now() > deadline) return false;
    await delay(40);
  }
};
const waitFor = async (predicate, timeout = 6000) => {
  const deadline = Date.now() + timeout;
  while (!predicate()) {
    if (Date.now() > deadline) return false;
    await delay(25);
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------
// Per-document audits: the keyboard trace (K-1) and network attempts
// ---------------------------------------------------------------------------------------------------
const SELF_TEST_PROBE = "http://example.invalid/selftest";
const KEYDEFS = {
  Tab: { key: "Tab", code: "Tab", vk: 9 },
  Escape: { key: "Escape", code: "Escape", vk: 27 },
  ArrowRight: { key: "ArrowRight", code: "ArrowRight", vk: 39 },
  ArrowLeft: { key: "ArrowLeft", code: "ArrowLeft", vk: 37 },
  Home: { key: "Home", code: "Home", vk: 36 },
  End: { key: "End", code: "End", vk: 35 },
  Enter: { key: "Enter", code: "Enter", vk: 13, text: "\r" },
  Space: { key: " ", code: "Space", vk: 32, text: " " },
};
const expectedKeyEvents = (presses) => presses.flatMap((name) => {
  const def = KEYDEFS[name];
  return [`keydown:${def.key}`, ...(def.text ? [`keypress:${def.key}`] : []), `keyup:${def.key}`];
});
/**
 * Closes (or checkpoints) a document's audits: every key event it received must be one of the runner's presses, in
 * order and trusted, and network attempts are accumulated. Offsets per document id make repeated calls idempotent.
 */
async function endDocument(page, reason) {
  try {
    const state = await evaluate("window.__native ? { docId: __native.docId, keys: __native.keys.map((entry) => ({ type: entry.type, key: entry.key, trusted: entry.trusted })), network: __native.network } : null", page);
    if (state !== null) {
      if (page.docId !== state.docId) { page.docId = state.docId; page.keyOffset = 0; page.networkOffset = 0; }
      const keys = state.keys.slice(page.keyOffset ?? 0);
      const expected = expectedKeyEvents(page.presses);
      const observed = keys.map((entry) => `${entry.type}:${entry.key}`);
      keyboardAudit.checkpoints += 1;
      keyboardAudit.runnerPresses += page.presses.length;
      keyboardAudit.keyEvents += keys.length;
      keyboardAudit.expectedKeyEvents += expected.length;
      if (!isDeepStrictEqual(observed, expected) || keys.some((entry) => !entry.trusted)) keyboardAudit.mismatches.push({ page: page.label, reason, afterCheck: lastCheckId, expected: expected.slice(0, 40), observed: observed.slice(0, 40), untrusted: keys.filter((entry) => !entry.trusted).length });
      page.keyOffset = state.keys.length;
      const list = state.network.slice(page.networkOffset ?? 0);
      page.networkOffset = state.network.length;
      const own = list.filter((entry) => entry.url !== SELF_TEST_PROBE);
      networkSeen.checkpoints += 1;
      networkSeen.attempts += own.length;
      networkSeen.selfTestProbes += list.length - own.length;
      const nonLocal = own.filter((entry) => !entry.local);
      networkSeen.nonLocal += nonLocal.length;
      networkSeen.samples.push(...nonLocal.slice(0, 3));
    } else if (page.presses.length > 0) {
      keyboardAudit.mismatches.push({ page: page.label, reason, afterCheck: lastCheckId, expected: expectedKeyEvents(page.presses), observed: null, note: "presses sent to a document without instruments" });
    }
  } catch { /* no document yet */ }
  page.presses = [];
}
async function navigatePage(page, url) {
  await endDocument(page, `navigate:${url.replace(origin, "")}`);
  page.navigating = true;
  try {
    await page.cdp("Page.navigate", { url });
  } finally {
    setTimeout(() => { page.navigating = false; }, 2500);
  }
}
async function reloadPage(page) {
  await endDocument(page, "reload");
  page.navigating = true;
  try {
    await page.cdp("Page.reload", { ignoreCache: true });
  } finally {
    setTimeout(() => { page.navigating = false; }, 2500);
  }
}
async function setViewport(width, height = 900, page = main) {
  await page.cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await delay(300);
}

// ---------------------------------------------------------------------------------------------------
// Surface constants (contract §2, §5 normative wording, §6, §7, §8)
// ---------------------------------------------------------------------------------------------------
const OWNER = "appearance-native-A";
const MARKER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:committed-generation`;
const MARKER = JSON.stringify({ generation: "g1", migrationId: "appearance-native", previous: null });
const IDENTITY_KEY = "xai:auth:identity-change";
const FIELDS = ["lang", "theme", "density", "accentHue", "bgTone", "railPos", "fontScale"];
const KEY = { lang: "xai_pref_lang", theme: "xai_pref_theme", density: "xai_pref_density", fontScale: "xai_pref_font_scale", accentHue: "xai_accent_hue", railPos: "xai_rail_pos", bgTone: "xai_bg_tone" };
const SEVEN = FIELDS.map((field) => KEY[field]);
const isSeven = (key) => SEVEN.includes(key);
const RESET_FIELDS = ["theme", "density", "accentHue", "bgTone", "railPos", "fontScale"];
const SIX = RESET_FIELDS.map((field) => KEY[field]);
const LOCK_OF = (field) => `xai:pref:v1:${encodeURIComponent(KEY[field])}`;
const ENC = { lang: (value) => JSON.stringify(value), theme: (value) => JSON.stringify(value), density: (value) => JSON.stringify(value), fontScale: (value) => JSON.stringify(value), accentHue: (value) => String(value), railPos: (value) => String(value), bgTone: (value) => String(value) };
const DEFAULTS = { lang: "en", theme: "light", density: "comfortable", accentHue: 165, bgTone: "default", railPos: "left", fontScale: 1 };
const TONE_HUE = { default: 165, cream: 55, mist: 230, lavender: 295, peach: 35, graphite: 220 };
const MORE = { route: "/app/settings/more", pane: "more", key: "xai_pref_more_launch_at_login", toggle: '.settings-detail [role="switch"][aria-label="Launch at Login"]',
  failed: "Launch at Login was not saved.", retry: "Retry Launch at Login", discard: "Discard Launch at Login", label: "Unsaved More draft" };
/** Contract §5 normative wording (the oracle; never taken from the product). */
const COPY = {
  en: {
    label: { lang: "Language", theme: "Theme", density: "Density", accentHue: "Accent color", bgTone: "Background palette", railPos: "Sidebar position", fontScale: "Font scale" },
    saving: (label) => `${label} is saving.`,
    resetting: (label) => `${label} is being reset to its default.`,
    "not-saved": (label) => `${label} was not saved.`,
    "not-reset": (label) => `${label} was not reset to its default.`,
    unavailable: (label) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
    retryName: (label) => `Retry ${label}`, discardName: (label) => `Discard ${label}`, reloadName: (label) => `Reload ${label}`,
    reset: "Reset to defaults", exportDraft: "Export Appearance draft", discardAll: "Discard all changes", retryAll: "Retry all",
    saved: "Appearance settings saved.", restored: "Defaults restored.", exportFailed: "Export failed. Please retry.", retrying: "Retrying unsaved appearance changes…",
    count: (n) => (n === 1 ? "1 appearance change is not saved." : `${n} appearance changes are not saved.`),
    confirmReset: "Reset theme, density, font scale, accent color, background palette and sidebar position to their defaults? Language is kept.",
    statusName: "Appearance changes not saved. Review them in Settings.", statusText: "Not saved",
    confirmSignOut: "Some appearance changes are not saved. Sign out and discard them?",
  },
  zh: {
    label: { lang: "语言", theme: "主题", density: "密度", accentHue: "主题色", bgTone: "背景调子", railPos: "侧栏位置", fontScale: "字体大小" },
    saving: (label) => `${label}正在保存。`,
    resetting: (label) => `${label}正在恢复默认。`,
    "not-saved": (label) => `${label}未保存。`,
    "not-reset": (label) => `${label}未恢复默认。`,
    unavailable: (label) => `已保存的${label}不可用。请重新读取；这不是新的未保存更改。`,
    retryName: (label) => `重试 ${label}`, discardName: (label) => `放弃 ${label}`, reloadName: (label) => `重新读取 ${label}`,
    reset: "恢复默认", exportDraft: "导出外观草稿", discardAll: "放弃全部更改", retryAll: "全部重试",
    saved: "外观设置已保存。", restored: "已恢复默认设置。", exportFailed: "导出失败，请重试。", retrying: "正在重试未保存的外观更改…",
    count: (n) => `${n} 项外观更改未保存。`,
    confirmReset: "将主题、密度、字体大小、主题色、背景调子和侧栏位置恢复为默认值？语言保持不变。",
    statusName: "外观更改未保存，前往设置查看。", statusText: "未保存",
    confirmSignOut: "部分外观更改尚未保存。仍要退出并放弃这些更改吗？",
  },
};
const SUCCESS_LINES = [COPY.en.saved, COPY.en.restored, COPY.zh.saved, COPY.zh.restored];
const RETRYING_LINES = [COPY.en.retrying, COPY.zh.retrying];
const block = (lang, field, state) => {
  const copy = COPY[lang];
  const label = copy.label[field];
  return { id: field, text: copy[state](label), role: state === "saving" || state === "resetting" ? "status" : "alert", buttons: state === "unavailable" ? [copy.reloadName(label)] : [copy.retryName(label), copy.discardName(label)] };
};
const blocks = (lang, states) => FIELDS.filter((field) => states[field]).map((field) => block(lang, field, states[field]));
const PANE = '.settings-detail[data-pane="appearance"] .appearance-pane';
const READY_APP = "(!!window.verify && !!window.__native && !!document.querySelector('.app header.topbar') && !document.querySelector('.account-data-gate') && verify.scope().kind === 'account')";
const READY_PANE = `(${READY_APP} && !!document.querySelector('${PANE} [data-testid="appearance-retry-all"]'))`;
const READY_PANE_BEFORE = `(${READY_APP} && !!document.querySelector('${PANE}'))`;
const READY_MORE = `(${READY_APP} && verify.paneId() === "more" && !!document.querySelector(${JSON.stringify(MORE.toggle)}))`;
const CRASHED = "(!!window.__native && !!__native.routeError())";
const readyFor = (path, variant) => (path.includes("/settings/appearance") ? (VARIANTS[variant].stage === "fixed" ? READY_PANE : READY_PANE_BEFORE) : path.includes("/settings/more") ? READY_MORE : READY_APP);
let labels = null;
const TOPBAR_SHORT = { en: "EN", zh: "中文" };
const TOPBAR_LANG = { en: "English", zh: "中文" };
const resolveTheme = (theme, prefersDark) => (theme === "system" ? (prefersDark ? "dark" : "light") : theme);
const summaryFor = (values) => `${TOPBAR_SHORT[values.lang]} · ${labels[values.lang][values.theme]} · ${labels[values.lang][values.density]}`;
const checkedFor = (values) => [TOPBAR_LANG[values.lang], labels[values.lang][values.theme], labels[values.lang][values.density]];
function htmlFor(values, prefersDark) {
  return { theme: resolveTheme(values.theme, prefersDark), density: values.density, fontSize: `${values.fontScale * 16}px`, accentHue: String(values.accentHue), bgTone: values.bgTone === "default" ? null : values.bgTone, railPos: values.railPos, appRailPos: values.railPos };
}
const htmlMatches = (html, values) => Object.entries(htmlFor(values, html.prefersDark)).every(([name, value]) => html[name] === value);
const paneMatches = (pane, values) => Boolean(pane) && pane.lang === values.lang && pane.theme === values.theme && pane.density === values.density
  && pane.accentHue === values.accentHue && pane.bgTone === values.bgTone && pane.railPos === values.railPos && pane.fontScale === values.fontScale
  && pane.accentReadout === `${Math.round(values.accentHue)}°` && pane.fontReadout === `${Math.round(values.fontScale * 100)}%`;
const rawOf = (stored) => Object.fromEntries(FIELDS.map((field) => [KEY[field], stored[field] === undefined ? null : ENC[field](stored[field])]));
const shownOf = (stored) => Object.fromEntries(FIELDS.map((field) => [field, stored[field] === undefined ? DEFAULTS[field] : stored[field]]));
const seedsOf = (stored, extra = {}) => ({ [MARKER_KEY]: MARKER, ...Object.fromEntries(FIELDS.filter((field) => stored[field] !== undefined).map((field) => [KEY[field], ENC[field](stored[field])])), ...extra });
const summarize = (list) => ({
  total: list.length,
  reads: list.filter((entry) => entry.op === "get").length,
  writes: list.filter((entry) => entry.op === "set").length,
  removes: list.filter((entry) => entry.op === "remove").length,
  other: list.filter((entry) => !["get", "set", "remove"].includes(entry.op)).length,
});
const mutations = (list) => list.filter((entry) => entry.op === "set" || entry.op === "remove" || entry.op === "clear");
const sevenMutations = (list) => mutations(list).filter((entry) => isSeven(entry.key));
const otherMutations = (list) => mutations(list).filter((entry) => !isSeven(entry.key));
const opsOn = (list, op, key) => list.filter((entry) => entry.op === op && entry.key === key);
const brief = (list) => list.slice(0, 24).map((entry) => `${entry.seq}:${entry.op}:${entry.key}${entry.value !== undefined ? `=${entry.value}` : ""}:${entry.outcome}`);
const appLocks = (list) => list.filter((entry) => entry.by === "app").map((entry) => entry.name);
const accountLocks = (names) => names.filter((name) => name.startsWith("xai:account:") || name.startsWith("xai:demo:"));
const accountMutations = (list) => mutations(list).filter((entry) => /^xai:(account|demo):/.test(entry.key ?? ""));
const storageDispatches = (list) => list.filter((entry) => entry.kind === "storage");
const prefChangedEvents = (list) => list.filter((entry) => entry.kind === "bus" && entry.type === "web:settings:preference-changed");
const counters = (snapshot) => ({ push: snapshot.history.filter((entry) => entry.method === "pushState").length, replace: snapshot.history.filter((entry) => entry.method === "replaceState").length, popstate: snapshot.pops.length, commits: snapshot.commits.length });
const ZERO = { push: 0, replace: 0, popstate: 0, commits: 0 };
const triple = (location) => ({ pathname: location.pathname, key: location.key, state: location.state ?? null });

async function bytesOf(keys = SEVEN, page = main) { return evaluate(`__native.native.bytes(${JSON.stringify(keys)})`, page); }
async function devtoolsBytes(keys = SEVEN, page = main) {
  const { entries } = await page.cdp("DOMStorage.getDOMStorageItems", { storageId: { storageKey: `${origin}/`, isLocalStorage: true } });
  const map = Object.fromEntries(entries);
  return Object.fromEntries(keys.map((key) => [key, Object.hasOwn(map, key) ? map[key] : null]));
}
const mark = (page = main) => evaluate("__native.mark()", page);
/** One consistent read of every surface and of the instrument windows since `since`. */
async function snap(since, page = main) {
  return evaluate(`(() => {
    const w = __native.window(${since});
    const r = window.verify ? verify.window(${since}) : { navigateCalls: [], blockerCalls: [], commits: [], router: [], scope: [], auth: [] };
    return {
      pane: __native.pane(), topbar: __native.topbar(), html: __native.html(), uiLang: __native.uiLang(), routeError: __native.routeError(),
      physical: __native.native.bytes(${JSON.stringify(SEVEN)}), location: window.verify ? verify.location() : null, scope: window.verify ? verify.scope() : null, focus: __native.focus(),
      unloadListeners: __native.unloadListeners(), dialog: window.verify ? verify.dialog() : null, gate: window.verify ? verify.gate() : null,
      attempts: w.attempts, locks: w.locks, events: w.events, confirm: w.confirm, dispatches: w.dispatches, received: w.storageReceived, nested: w.nested,
      history: w.history, pops: w.pops, consoleErrors: w.consoleErrors, errorUi: w.errorUi, unload: w.unload,
      commits: r.commits, navigateCalls: r.navigateCalls, blockerCalls: r.blockerCalls, scopeLog: r.scope, auth: r.auth,
    };
  })()`, page);
}
const nonSevenSnapshot = (page = main) => evaluate(`(() => { const all = __native.native.snapshot(); for (const key of ${JSON.stringify(SEVEN)}) delete all[key]; return all; })()`, page);
const warn = (page = main) => evaluate("__native.warn()", page);
/** The clean bottom action area (A2.2, §5 item 9): Retry all rendered and aria-disabled, Reset only, no old footer. */
function cleanPane(pane, lang, statusLine) {
  if (!pane) return false;
  return pane.recovery.length === 0 && pane.statusLine?.text === statusLine && pane.statusLine?.role === "status" && pane.statusLine?.inActions
    && pane.retryAll?.text === COPY[lang].retryAll && pane.retryAll.ariaDisabled === "true" && pane.retryAll.disabled === false && pane.retryAll.describedBy === null && !pane.retryAll.hidden && pane.retryAll.tabIndex === 0
    && pane.exportButton === null && pane.discardAll === null && pane.reset === COPY[lang].reset && !pane.oldFooter
    && isDeepStrictEqual(pane.actionButtons, ["appearance-retry-all", "appearance-reset-defaults"]);
}
/** The bottom action area with drafts: expected status line, Retry all enabled iff E is non-empty, Export and Discard all. */
function draftPane(pane, lang, statusLine, retryEnabled, { passOpen = false } = {}) {
  if (!pane) return false;
  const described = retryEnabled || passOpen;
  return pane.statusLine?.text === statusLine && pane.statusLine?.role === "status"
    && pane.retryAll?.text === COPY[lang].retryAll && pane.retryAll.disabled === false && pane.retryAll.tabIndex === 0 && !pane.retryAll.hidden
    && (retryEnabled ? pane.retryAll.ariaDisabled === null || pane.retryAll.ariaDisabled === "false" : pane.retryAll.ariaDisabled === "true")
    && (described ? pane.retryAll.describedByStatusLine : pane.retryAll.describedBy === null)
    && pane.exportButton === COPY[lang].exportDraft && pane.discardAll === COPY[lang].discardAll && pane.reset === COPY[lang].reset && !pane.oldFooter
    && isDeepStrictEqual(pane.actionButtons, ["appearance-retry-all", "appearance-export-draft", "appearance-discard-all", "appearance-reset-defaults"]);
}
const topbarStatusShown = (topbar, lang) => topbar.status !== null && topbar.status.name === COPY[lang].statusName && topbar.status.text === COPY[lang].statusText && topbar.status.tag === "button" && topbar.status.type === "button" && topbar.status.inControls;

// ---------------------------------------------------------------------------------------------------
// Trusted input helpers (no nativeVirtualKeyCode; every press is audited per document)
// ---------------------------------------------------------------------------------------------------
async function trustedClick(selector, label, page = main) {
  const measure = `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { found: false };
    element.scrollIntoView({ block: "center", inline: "nearest" });
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { found: true, x, y, width: rect.width, height: rect.height, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + (typeof hit.className === "string" ? hit.className : "") : null };
  })()`;
  let point = await evaluate(measure, page);
  pre(`input:control-present:${label}`, point.found, { selector });
  // Layout may still be animating (for example the rail moving after a sidebar-position change): click only once
  // the control's box is stable across two measurements.
  for (let attempt = 0; attempt < 25; attempt += 1) {
    await delay(80);
    const again = await evaluate(measure, page);
    const stable = again.found && Math.abs(again.x - point.x) < 0.5 && Math.abs(again.y - point.y) < 0.5;
    point = again;
    if (stable) break;
    if (attempt === 24) observe(`input:box-never-stable:${label}`, { point });
  }
  if (!point.hit) {
    const first = point;
    await delay(400);
    point = await evaluate(measure, page);
    observe(`input:centre-hit-test-remeasured:${label}`, { first, second: point });
  }
  pre(`input:centre-hit-test:${label}`, point.hit, { selector, hitTarget: point.hitTarget, point });
  await input("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y }, page);
  await input("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 }, page);
  await input("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 }, page);
  await delay(60);
  return { x: Math.round(point.x * 100) / 100, y: Math.round(point.y * 100) / 100, width: point.width, height: point.height };
}
/** Tags exactly one element (expression: page JS evaluating to an array of candidates) and clicks it. */
async function clickOne(expression, label, page = main) {
  const found = await evaluate(`(() => {
    document.querySelectorAll("[data-native-target]").forEach((element) => element.removeAttribute("data-native-target"));
    const matches = (${expression});
    if (matches.length === 1) matches[0].setAttribute("data-native-target", "1");
    return matches.length;
  })()`, page);
  pre(`input:exactly-one-control:${label}`, found === 1, { found });
  const point = await trustedClick('[data-native-target="1"]', label, page);
  await evaluate('document.querySelector("[data-native-target]")?.removeAttribute("data-native-target")', page).catch(() => {});
  return point;
}
const byName = (scope, name, tags = "button") => `[...document.querySelectorAll(${JSON.stringify(`${scope} ${tags}`)})].filter((b) => (b.getAttribute("aria-label") ?? b.textContent).replace(/\\s+/g, " ").trim() === ${JSON.stringify(name)})`;
const byTestId = (testid) => `[...document.querySelectorAll(${JSON.stringify(`[data-testid="${testid}"]`)})]`;
const clickButton = (name, scope = PANE, page = main) => clickOne(byName(scope, name), name, page);
const clickTestId = (testid, label = testid, page = main) => clickOne(byTestId(testid), label, page);
/** One trusted key press (no nativeVirtualKeyCode; Enter and Space carry text so that they generate keypress). */
async function press(name, page = main) {
  const def = KEYDEFS[name];
  page.presses.push(name);
  await input("Input.dispatchKeyEvent", { type: def.text ? "keyDown" : "rawKeyDown", key: def.key, code: def.code, windowsVirtualKeyCode: def.vk, ...(def.text ? { text: def.text, unmodifiedText: def.text } : {}) }, page);
  await input("Input.dispatchKeyEvent", { type: "keyUp", key: def.key, code: def.code, windowsVirtualKeyCode: def.vk }, page);
  await delay(60);
}
async function parkMouse(page = main) {
  await input("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 }, page);
  await delay(40);
}
const fontRowLabel = `[...document.querySelectorAll(${JSON.stringify(`${PANE} .setting-row`)})].filter((row) => row.querySelector('[data-appearance-control="fontScale"]')).map((row) => row.querySelector(".sr-label"))`;
/** Focus the font-scale range input with a trusted click on its row label, then one trusted Tab. */
async function focusSlider(field, label, page = main) {
  const anchor = field === "fontScale" ? fontRowLabel : `[...document.querySelectorAll(${JSON.stringify(`${PANE} [data-appearance-control="accentHue"] .accent-hue-preview`)})]`;
  await clickOne(anchor, `${label}:focus-start`, page);
  await press("Tab", page);
  const focus = await evaluate("__native.focus()", page);
  pre(`${label}:slider-focused-by-trusted-tab`, focus.tag === "input" && focus.control === field, { focus });
}
/** Trusted Tab presses from the font row label until `testid` has focus (the bottom action area follows the rows). */
async function tabTo(testid, label, page = main) {
  await clickOne(fontRowLabel, `${label}:tab-start`, page);
  const path = [];
  for (let index = 0; index < 12; index += 1) {
    await press("Tab", page);
    const focus = await evaluate("__native.focus()", page);
    path.push(focus.testid ?? focus.name ?? focus.tag);
    if (focus.testid === testid) {
      pre(`${label}:reached-${testid}-by-trusted-tab`, true, { path });
      return { presses: path.length, path };
    }
  }
  pre(`${label}:reached-${testid}-by-trusted-tab`, false, { path });
  return null;
}
async function openTopbar(label, page = main) {
  if (!(await evaluate("__native.topbar().open", page))) await trustedClick(".topbar .topbar-pref-trigger", `${label}:topbar-trigger`, page);
  pre(`${label}:topbar-popover-open`, await waitUntil("__native.topbar().open", 3000, page));
}
async function closeTopbar(label, page = main) {
  if (await evaluate("__native.topbar().open", page)) await press("Escape", page);
  pre(`${label}:topbar-popover-closed`, await waitUntil("!__native.topbar().open", 3000, page));
}
async function chooseTopbar(field, value, label, page = main) {
  await openTopbar(label, page);
  const uiLang = await evaluate("__native.uiLang()", page);
  const section = labels[uiLang][field === "lang" ? "language" : field];
  const name = field === "lang" ? TOPBAR_LANG[value] : labels[uiLang][value];
  const point = await clickOne(`[...document.querySelectorAll('.topbar #topbar-pref-panel section')].filter((s) => s.getAttribute("aria-label") === ${JSON.stringify(section)}).flatMap((s) => [...s.querySelectorAll('[role="menuitemradio"]')]).filter((o) => o.getAttribute("aria-label") === ${JSON.stringify(name)})`, `${label}:topbar:${section}:${name}`, page);
  return { ...point, section, name };
}
/** Clicks the pane control for a value (segments, cards, swatches). */
async function clickPaneValue(field, value, label, page = main) {
  const uiLang = await evaluate("__native.uiLang()", page);
  const control = (id) => `[...document.querySelectorAll(${JSON.stringify(`${PANE} [data-appearance-control="${id}"] button`)})]`;
  if (field === "lang") return clickOne(`${control("lang")}.filter((b, i) => i === ${value === "en" ? 0 : 1})`, label, page);
  if (field === "theme") return clickOne(`${control("theme")}.filter((b) => b.classList.contains("theme-card") && !!b.querySelector(".tp-${value}"))`, label, page);
  if (field === "density") return clickOne(`${control("density")}.filter((b, i) => i === ${value === "comfortable" ? 0 : 1})`, label, page);
  if (field === "accentHue") {
    const preset = labels.presets.find((entry) => entry.hue === value);
    return clickOne(`${control("accentHue")}.filter((b) => b.classList.contains("accent-sw") && b.getAttribute("aria-label") === ${JSON.stringify(preset[uiLang])})`, label, page);
  }
  if (field === "bgTone") return clickOne(`${control("bgTone")}.filter((b) => b.classList.contains("bgt-${value}"))`, label, page);
  if (field === "railPos") return clickOne(`${control("railPos")}.filter((b) => b.classList.contains("rp-${value}"))`, label, page);
  throw Error(`No click control for ${field}`);
}
async function railClick(name, label, page = main) {
  return clickOne(`[...document.querySelectorAll(".app-rail .rail-items .rail-btn")].filter((b) => b.getAttribute("aria-label") === ${JSON.stringify(name)})`, label, page);
}
async function sidebarClick(name, label, page = main) {
  return clickOne(`[...document.querySelectorAll(".settings-sidebar .list-row")].filter((r) => r.textContent.trim() === ${JSON.stringify(name)})`, label, page);
}
/** Waits until the field's recovery block shows `state` (pane must be mounted). */
const blockIs = (lang, field, state) => `(() => { const pane = __native.pane(); const item = pane && pane.recovery.find((entry) => entry.id === ${JSON.stringify(field)}); return !!item && item.text === ${JSON.stringify(block(lang, field, state).text)}; })()`;
const recoveryIs = (expected) => `JSON.stringify(__native.pane()?.recovery) === ${JSON.stringify(JSON.stringify(expected))}`;
const statusLineIs = (text) => `__native.pane()?.statusLine.text === ${JSON.stringify(text)}`;
const topbarStatusIs = (present) => `${present ? "!!" : "!"}document.querySelector('[data-testid="appearance-status"]')`;
/** A failed pane edit (write denied for the key(s)); returns once the field shows "was not saved.". */
async function failPane(field, value, label, lang = "en", page = main) {
  const keys = field === "bgTone" ? [KEY.bgTone, KEY.accentHue] : [KEY[field]];
  await evaluate(`__native.denySet(${JSON.stringify(keys)})`, page);
  await clickPaneValue(field, value, label, page);
  const fields = field === "bgTone" ? ["bgTone", "accentHue"] : [field];
  const ok = await waitUntil(fields.map((id) => blockIs(lang, id, "not-saved")).join(" && "), 6000, page);
  pre(`${label}:edit-settled-as-a-failed-draft`, ok, { pane: await evaluate("__native.pane()", page) });
}
/** A failed Topbar choice (write denied); the popover is closed afterwards. */
async function failTopbar(field, value, label, page = main) {
  await evaluate(`__native.denySet(${JSON.stringify(KEY[field])})`, page);
  const since = await mark(page);
  await chooseTopbar(field, value, label, page);
  const fired = await waitUntil(`__native.window(${since}).attempts.some((entry) => entry.key === ${JSON.stringify(KEY[field])} && entry.op === "set" && entry.outcome === "denied")`, 6000, page);
  await closeTopbar(label, page);
  await parkMouse(page);
  const shown = await waitUntil(topbarStatusIs(true), 4000, page);
  pre(`${label}:topbar-write-fault-armed-and-observed`, fired && shown, { attempts: brief((await snap(since, page)).attempts.filter((entry) => entry.op === "set")) });
}

// ---------------------------------------------------------------------------------------------------
// Documents: seed page, App mounts, second documents, downloads, screenshots, frames
// ---------------------------------------------------------------------------------------------------
let selfTested = false;
async function seed(entries, label, page = main) {
  await endDocument(page, "before-seed");
  page.variant = "seed";
  await navigatePage(page, `${origin}/seed`);
  pre(`${label}:seed-page-loaded-with-prelude-only`, await waitUntil("document.readyState === 'complete' && location.pathname === '/seed' && !!window.__native && !window.verify", 10000, page));
  if (!selfTested && page === main) {
    const result = await evaluate("__native.selfTest()", page);
    record("instrument-selftest", { page: "/seed (prelude only, no product code)", result });
    pre("instruments:storage-faults-f-b002-dispatch-bus-locks-history-unload-console-errorui-export-confirm-network-input-dom-frames",
      result.setDeniedThrew && result.setDeniedNeverStored && result.setDelegated && result.readbackAfterSetDenied && result.readbackOneShot && result.getDenied
      && result.removeDeniedThrew && result.removeDeniedKeptBytes && result.removeDelegated && Object.values(result.totalDenial).every(Boolean) && result.noNestedStorageCalls
      && isDeepStrictEqual(result.dispatchCounted, ["storage:xai_native_host_selftest:true:true", "bus:web:settings:preference-changed"])
      && isDeepStrictEqual(result.deliveredCounted, ["xai_native_host_selftest:false"])
      && result.nonLocalFetchRefusedAndLogged && result.lockHeldAndPending && result.middleHeldAfterFirst && result.fifoOrder === "app1,app2" && isDeepStrictEqual(result.lockAttribution, ["fixture", "app", "fixture", "app"])
      && isDeepStrictEqual(result.historyTraced, ["pushState:selftest-push", "replaceState:selftest-replace"]) && result.popTraced === 1 && result.unloadTracked
      && result.urlTraced && result.confirmWrapped && result.consoleErrorTraced && result.errorUiTraced && result.domGateAddedAndRemoved && result.framesSampled > 0 && result.inputTraced && result.oldUiClean, { result });
    // The self-test's own console.error probe is not an application error.
    for (let index = runtimeErrors.length - 1; index >= 0; index -= 1) if (runtimeErrors[index].text.includes("native host prelude self-test error trace")) runtimeErrors.splice(index, 1);
    selfTested = true;
  }
  const stored = await evaluate(`(() => { __native.native.clear(); const seeds = ${JSON.stringify(entries)}; for (const [key, value] of Object.entries(seeds)) __native.native.set(key, value); return __native.native.snapshot(); })()`, page);
  pre(`${label}:seeded-exact-bytes`, isDeepStrictEqual(stored, entries), { stored });
}
/**
 * Production App mount. With productCrash, a route error or an uncaught exception is a product failure (contract §5
 * item 2, §10 item 4); otherwise a failed mount is a harness precondition.
 */
async function mountApp(label, { path = "/app/settings/appearance", variant = "fixed", productCrash = false, page = main, ready = null } = {}) {
  currentVariant = variant;
  const errorsBefore = runtimeErrors.length;
  await endDocument(page, "before-mount");
  page.variant = variant;
  await navigatePage(page, `${origin}${path}`);
  const readyExpression = ready ?? readyFor(path, variant);
  const settled = await waitUntil(`${readyExpression} || ${CRASHED}`, 20000, page);
  await delay(700);
  const state = await evaluate(`({ ready: ${readyExpression}, crashed: ${CRASHED}, routeError: window.__native ? __native.routeError() : null, verifyPresent: !!window.verify, variant: window.verify ? verify.variant : null, path: location.pathname,
    body: (document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 300) })`, page);
  pre(`${label}:document-loaded-and-bundle-evaluated`, settled && state.verifyPresent && state.variant === variant, { state, variant });
  const exceptions = runtimeErrors.slice(errorsBefore).filter((entry) => entry.kind === "exception" || entry.kind.startsWith("console."));
  if (productCrash) {
    check(`${label}:app-renders-without-route-error`, state.ready && !state.crashed, { routeError: state.routeError, path: state.path, body: state.body });
    check(`${label}:no-runtime-error-at-mount`, exceptions.length === 0, { exceptions: exceptions.slice(0, 3) });
  } else {
    pre(`${label}:production-app-mounted`, state.ready && !state.crashed, { state });
    pre(`${label}:no-runtime-error-at-mount`, exceptions.length === 0, { exceptions: exceptions.slice(0, 3) });
  }
  const facts = await evaluate(`({ composition: verify.composition, variant: verify.variant, instance: verify.instance, scope: verify.scope(), auth: verify.authCalls(), markerKey: verify.markerKey,
    lockNames: verify.lockNames(), physicalKeys: verify.physicalKeys(), rail: verify.rail(), pet: !!document.querySelector('.pet-wrap'), topbar: !!document.querySelector('header.topbar'),
    network: __native.network.filter((entry) => !entry.local).length, location: verify.location() })`, page);
  pre(`${label}:auth-session-context-served-by-real-provider`, facts.composition === "production-app" && facts.auth.getSession >= 1 && facts.markerKey === MARKER_KEY, { auth: facts.auth, markerKey: facts.markerKey });
  pre(`${label}:account-data-gate-activated-account`, facts.scope.kind === "account" && facts.scope.accountId === OWNER && facts.scope.generation === "g1", { scope: facts.scope });
  pre(`${label}:production-surfaces-present`, facts.rail.length > 0 && facts.topbar && facts.pet, { rail: facts.rail.length, pet: facts.pet });
  pre(`${label}:real-lock-names-and-unscoped-device-keys`, FIELDS.every((field) => facts.lockNames[KEY[field]] === LOCK_OF(field) && facts.physicalKeys[KEY[field]] === KEY[field]), { lockNames: facts.lockNames, physicalKeys: facts.physicalKeys });
  pre(`${label}:no-non-local-network-attempt`, facts.network === 0);
  if (!labels) labels = await evaluate("verify.labels", page);
  return facts;
}
/** An additional page target (a second document of the same profile), attached before it loads anything. */
async function openPage(label) {
  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  pre(`${label}:page-target-created`, typeof targetId === "string" && targetId.length > 0, { targetId });
  return attachPage(targetId, label);
}
async function closePage(page) {
  await endDocument(page, "close");
  await browser.send("Target.closeTarget", { targetId: page.targetId }).catch(() => {});
  browser.pages.delete(page.sessionId);
  await main.cdp("Page.bringToFront");
  await delay(200);
}
/** An independent same-origin document without product code or instruments evaluates `expression` once. */
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
    await main.cdp("Page.bringToFront");
    await delay(200);
  }
}
const visibleDownloads = () => readdirSync(downloads).filter((name) => !name.startsWith("."));
async function awaitDownload(timeout = 10000) {
  const file = join(downloads, "appearance-draft.json");
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const names = visibleDownloads();
    if (names.includes("appearance-draft.json") && !names.some((name) => name.endsWith(".crdownload"))) {
      const first = statSync(file).size;
      await delay(150);
      const second = statSync(file).size;
      if (first > 0 && first === second) return { names: visibleDownloads(), raw: readFileSync(file), file };
    }
    await delay(50);
  }
  return null;
}
async function screenshot(name, page = main) {
  const file = `native-${short}-${suffix}-${mode}-${name}.png`;
  pre(`screenshot:${name}:not-overwritten`, !existsSync(join(evidenceDir, file)), { file });
  await delay(150);
  const { data } = await page.cdp("Page.captureScreenshot", { format: "png" });
  const buffer = Buffer.from(data, "base64");
  writeFileSync(join(evidenceDir, file), buffer, { flag: "wx" });
  screenshots.push({ name, file, sha256: sha256(buffer), bytes: buffer.length });
  return file;
}
const startFrames = (page = main) => evaluate("__native.startFrames()", page);
const stopFrames = (page = main) => evaluate("__native.stopFrames()", page);
function decodeSummary(summary) {
  if (typeof summary !== "string") return null;
  const parts = summary.split(" · ");
  if (parts.length !== 3) return null;
  const lang = parts[0] === "EN" ? "en" : parts[0] === "中文" ? "zh" : null;
  if (!lang) return null;
  const theme = ["light", "dark", "system"].find((id) => labels[lang][id] === parts[1]) ?? null;
  const density = ["comfortable", "compact"].find((id) => labels[lang][id] === parts[2]) ?? null;
  return theme && density ? { lang, theme, density } : null;
}
/** Every sampled frame shows one state on the pane, the Topbar and <html> (contract §5 item 4, §10 item 3). */
function frameAgreement(frames, prefersDark) {
  const bad = [];
  for (const frame of frames) {
    const topbar = decodeSummary(frame.summary);
    const agree = Boolean(topbar && frame.pane) && frame.pane.lang === topbar.lang && frame.uiLang === topbar.lang && frame.pane.theme === topbar.theme && frame.pane.density === topbar.density
      && frame.htmlTheme === resolveTheme(topbar.theme, prefersDark) && frame.htmlDensity === topbar.density
      && (frame.checked === null || isDeepStrictEqual(frame.checked, checkedFor(topbar)));
    if (!agree) bad.push(frame);
  }
  return bad;
}
/**
 * Per-frame Retry all invariants (A2.2, A2.4, A2.6, §7 item 2): never a success line while any recovery block (pending
 * or failed) or the Topbar status is shown or Retry all is enabled; Retry all is enabled exactly when the Topbar
 * status renders (both are E non-empty); it is described exactly while enabled or a pass is open, by the status line;
 * never the native disabled attribute; never the old footer; never a route error.
 */
function retryAllFrameViolations(frames, { focusFrom = null } = {}) {
  const bad = [];
  for (const frame of frames) {
    if (!frame.retryAll) continue;
    const success = SUCCESS_LINES.includes(frame.statusLine);
    const retrying = RETRYING_LINES.includes(frame.statusLine);
    const enabled = frame.retryAll.ariaDisabled !== "true";
    const problems = [];
    if (success && (frame.recoveryBlocks !== 0 || frame.topbarStatus || enabled)) problems.push("success-line-with-work");
    if (enabled !== frame.topbarStatus) problems.push("retry-all-enabled-differs-from-topbar-status");
    if ((enabled || retrying) !== Boolean(frame.retryAll.describedBy)) problems.push("description-rule");
    if (frame.retryAll.describedBy && !frame.retryAll.describedByLine) problems.push("described-by-other-than-status-line");
    if (frame.retryAll.disabledAttr) problems.push("native-disabled-attribute");
    if (frame.oldUi) problems.push("old-footer-ui");
    if (frame.routeError) problems.push("route-error");
    if (focusFrom !== null && frame.seq > focusFrom && (!frame.focus || frame.focus.isBody)) problems.push("focus-on-body");
    if (problems.length) bad.push({ seq: frame.seq, t: frame.t, problems, statusLine: frame.statusLine, recovery: frame.recovery, retryAll: frame.retryAll, topbarStatus: frame.topbarStatus, focus: frame.focus });
  }
  return bad;
}

// ---------------------------------------------------------------------------------------------------
// Row gates: history counters and a runtime-error gate per document segment
// ---------------------------------------------------------------------------------------------------
async function beginSegment(id, page = main) {
  return { id, page, mark: await mark(page), errorsAt: runtimeErrors.length };
}
async function endSegment(segment, expected = null, extra = {}) {
  const now = await snap(segment.mark, segment.page);
  const errors = runtimeErrors.slice(segment.errorsAt);
  const counts = counters(now);
  const gate = { id: segment.id, page: segment.page.label, counters: counts, runtimeErrors: errors.length, pageConsoleErrors: now.consoleErrors.length, errorUi: now.errorUi.length, routeError: now.routeError, ...extra };
  rowGates.push(gate);
  record("row-gate", { ...gate, history: now.history.map((entry) => `${entry.seq}:${entry.method}:${entry.url}`), pops: now.pops.map((entry) => `${entry.seq}:${entry.path}`), commits: now.commits.map((entry) => `${entry.seq}:${entry.action}:${entry.pathname}`) });
  // A 5cd63ff reference segment is recorded, never judged (the product under test is the fixed revision).
  if (extra.reference) return { now, counts };
  if (expected) check(`${segment.id}:history-counters`, isDeepStrictEqual(counts, expected), { counts, expected, history: now.history, pops: now.pops, commits: now.commits });
  check(`${segment.id}:runtime-error-gate`, errors.length === 0 && now.consoleErrors.length === 0 && now.errorUi.length === 0 && now.routeError === null, { errors: errors.slice(0, 3), consoleErrors: now.consoleErrors.slice(0, 3), errorUi: now.errorUi });
  return { now, counts };
}

// ---------------------------------------------------------------------------------------------------
// Sign-out through the real UI and its observation
// ---------------------------------------------------------------------------------------------------
/** Rail avatar -> AvatarMenu "Sign Out" -> SignOutConfirmDialog confirm -> App.handleSignOut. */
async function signOutThroughUi(id, lang = "en", page = main) {
  await trustedClick(".app-rail .rail-avatar", `${id}:rail-avatar`, page);
  pre(`${id}:avatar-menu-open`, await waitUntil("verify.avatarMenuOpen()", 3000, page));
  await clickOne(byName(".avatar-menu", labels[lang].signOut, ".avm-item"), `${id}:avatar-sign-out`, page);
  pre(`${id}:sign-out-confirm-dialog-open`, await waitUntil("verify.signOutDialogOpen()", 3000, page));
  const start = { mark: await mark(page), errorsAt: runtimeErrors.length, dialogsAt: dialogs.length, requestsAt: navigationRequests.length };
  await trustedClick("dialog.xai-sign-out-dialog .xai-sign-out-dialog__btn--confirm", `${id}:sign-out-confirm`, page);
  return start;
}
/** After a sign-out confirmation the AvatarMenu stays open behind its full-viewport scrim; a user closes it by clicking the scrim. */
async function closeAvatarMenu(id, page = main) {
  if (!(await evaluate("verify.avatarMenuOpen()", page))) return false;
  const point = await evaluate(`(() => {
    const candidates = [[innerWidth - 12, Math.round(innerHeight / 2)], [Math.round(innerWidth / 2), 12], [innerWidth - 12, 12], [Math.round(innerWidth / 2), Math.round(innerHeight / 2)]];
    for (const [x, y] of candidates) { const element = document.elementFromPoint(x, y); if (element && element.classList.contains("avatar-menu-scrim")) return { x, y }; }
    return null;
  })()`, page);
  pre(`${id}:avatar-menu-scrim-hit-testable`, point !== null);
  await input("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y }, page);
  await input("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 }, page);
  await input("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 }, page);
  pre(`${id}:avatar-menu-closed-by-its-scrim`, await waitUntil("!verify.avatarMenuOpen()", 3000, page));
  await parkMouse(page);
  return true;
}
const coordinatorLog = (page = main) => evaluate("window.__nativeAuth ? JSON.parse(JSON.stringify(window.__nativeAuth)) : null", page);

// ---------------------------------------------------------------------------------------------------
// Shared scenario helpers
// ---------------------------------------------------------------------------------------------------
const checkedOf = (topbar) => (topbar.options ?? []).filter((option) => option.checked === "true").map((option) => option.name);
const navigateProgrammatic = (path, options = null) => evaluate(`(void __native.router.navigate(${JSON.stringify(path)}${options ? `, ${JSON.stringify(options)}` : ""}), true)`);
/** A More draft (Launch at Login) whose write is denied; the accepted More pane shows its failure and Retry. */
async function failMore(id, page = main) {
  const before = await evaluate(`document.querySelector(${JSON.stringify(MORE.toggle)})?.getAttribute("aria-checked")`, page);
  await evaluate(`__native.denySet(${JSON.stringify(MORE.key)})`, page);
  const since = await mark(page);
  await trustedClick(MORE.toggle, `${id}:more-toggle`, page);
  const fired = await waitUntil(`__native.window(${since}).attempts.some((entry) => entry.key === ${JSON.stringify(MORE.key)} && entry.op === "set" && entry.outcome === "denied")`, 6000, page);
  const shown = await waitUntil(`verify.detailText().includes(${JSON.stringify(MORE.failed)})`, 6000, page);
  await delay(300);
  const now = await snap(since, page);
  const latest = opsOn(now.attempts, "set", MORE.key).at(-1)?.value ?? null;
  pre(`${id}:more-fault-armed-and-observed`, fired && shown && latest === String(before !== "true") && now.attempts.filter((entry) => entry.key === MORE.key && entry.op === "set").every((entry) => entry.outcome === "denied"), { before, latest, attempts: brief(now.attempts.filter((entry) => entry.key === MORE.key)) });
  pre(`${id}:more-bytes-unchanged`, (await evaluate(`__native.native.get(${JSON.stringify(MORE.key)})`, page)) === null);
  return latest;
}
/** Reset to defaults through the real confirmation (accepted or declined by plan). */
async function clickReset(id, accept, lang = "en", page = main) {
  const before = dialogs.length;
  dialogPlan.push({ accept, purpose: `${id}: ${accept ? "accept" : "decline"} Reset to defaults` });
  await clickTestId("appearance-reset-defaults", `${id}:reset`, page);
  const opened = await waitFor(() => dialogs.length > before, 6000);
  pre(`${id}:reset-confirmation-asked-with-normative-text`, opened && dialogs.length === before + 1 && dialogs.at(-1).type === "confirm" && dialogs.at(-1).message === COPY[lang].confirmReset && dialogs.at(-1).accepted === accept, { dialogs: dialogs.slice(before) });
}
/** Sign-out Cancel at the Appearance step: resolves false; identity, drafts, status and warning kept; zero history mutations. */
async function signOutCancel(id, lang, { expectStatus = true, more = false } = {}) {
  const physicalBefore = await bytesOf();
  dialogPlan.push({ accept: false, purpose: `${id}: Cancel at the Appearance sign-out step` });
  const start = await signOutThroughUi(`${id}:cancel`, lang);
  const asked = await waitFor(() => dialogs.length > start.dialogsAt, 4000);
  await delay(900);
  const after = await snap(start.mark);
  const confirms = dialogs.slice(start.dialogsAt);
  check(`${id}:cancel:one-confirm-with-normative-text`, asked && confirms.length === 1 && confirms[0].type === "confirm" && confirms[0].message === COPY[lang].confirmSignOut && confirms[0].accepted === false, { confirms });
  check(`${id}:cancel:resolves-false-identity-intact-zero-history-mutations`, after.scope.kind === "account" && after.scope.accountId === OWNER && after.scopeLog.length === 0 && after.auth.filter((entry) => entry.call === "signOut").length === 0
    && navigationRequests.length === start.requestsAt && isDeepStrictEqual(counters(after), ZERO) && after.dialog === null && runtimeErrors.length === start.errorsAt,
  { scope: after.scope, scopeLog: after.scopeLog, auth: after.auth, requests: navigationRequests.slice(start.requestsAt), counters: counters(after), dialog: after.dialog });
  const warning = await warn();
  check(`${id}:cancel:drafts-status-and-warning-kept-zero-writes`, (!expectStatus || topbarStatusShown(after.topbar, lang)) && warning.warned === true && warning.attempts === 0 && mutations(after.attempts).length === 0 && isDeepStrictEqual(after.physical, physicalBefore),
    { status: after.topbar.status, warning, mutations: brief(mutations(after.attempts)) });
  record("sign-out-step", { id, answer: "cancel", more, confirms, counters: counters(after), scopeLog: after.scopeLog });
  return after;
}
/**
 * Sign-out OK at the Appearance step: one confirm, the step itself makes zero set/remove attempts (window from the
 * confirm's return to the first account-scope transition) and then the existing sequence continues: identity
 * invalidated, client.auth.signOut once and the redirect to "/" requested (answered 204), unless a coordinator holds.
 */
async function signOutOk(id, lang, { coordinatorHold = false } = {}) {
  const physicalBefore = await bytesOf();
  const listenersBefore = await evaluate("__native.unloadListeners()");
  dialogPlan.push({ accept: true, purpose: `${id}: OK at the Appearance sign-out step` });
  const start = await signOutThroughUi(`${id}:ok`, lang);
  const asked = await waitFor(() => dialogs.length > start.dialogsAt, 4000);
  const settled = coordinatorHold ? await waitUntil("verify.dialog() !== null", 5000) : await waitFor(() => navigationRequests.length > start.requestsAt, 6000);
  await delay(900);
  const after = await snap(start.mark);
  const confirms = dialogs.slice(start.dialogsAt);
  const returned = after.confirm.find((entry) => entry.phase === "return");
  const firstScope = after.scopeLog[0]?.seq ?? Number.POSITIVE_INFINITY;
  const stepMutations = mutations(after.attempts).filter((entry) => returned && entry.seq > returned.seq && entry.seq < firstScope);
  check(`${id}:ok:one-confirm-with-normative-text`, asked && confirms.length === 1 && confirms[0].type === "confirm" && confirms[0].message === COPY[lang].confirmSignOut && confirms[0].accepted === true && returned?.result === true, { confirms, returned });
  check(`${id}:ok:step-discards-with-zero-set-or-remove-attempts`, settled && stepMutations.length === 0 && sevenMutations(after.attempts).length === 0 && isDeepStrictEqual(after.physical, physicalBefore),
    { stepMutations: brief(stepMutations), sevenMutations: brief(sevenMutations(after.attempts)), physical: after.physical, physicalBefore });
  const requests = navigationRequests.slice(start.requestsAt);
  if (!coordinatorHold) {
    check(`${id}:ok:sequence-continues-identity-invalidated-one-sign-out-redirect-requested`, after.scopeLog.some((entry) => entry.kind === "locked" && entry.accountId === null) && after.auth.filter((entry) => entry.call === "signOut").length === 1
      && requests.length === 1 && requests[0].url === `${origin}/`, { scopeLog: after.scopeLog, auth: after.auth, requests });
  }
  record("sign-out-step", { id, answer: "ok", coordinatorHold, confirms, counters: counters(after), scopeLog: after.scopeLog, requests, otherMutations: brief(otherMutations(after.attempts)), listenersBefore, listenersAfter: after.unloadListeners });
  return { after, start, listenersBefore };
}

// ---------------------------------------------------------------------------------------------------
// E12: the contract §9 host matrix, rows a–s (production App composition)
// ---------------------------------------------------------------------------------------------------
async function runHost() {
  const ROWS = { a: rowA, b: rowB, c: rowC, d: rowD, e: rowE, f: rowF, g: rowG, h: rowH, i: rowI, j: rowJ, k: rowK, l: rowL, m: rowM, n: rowN, o: rowO, p: rowP, q: rowQ, r: rowR, s: rowS };
  for (const [name, row] of Object.entries(ROWS)) if (selected(name)) await row();
  record("host-row-summary", { rows: [...new Set(rowGates.map((gate) => gate.id.split(":")[1]))], segments: rowGates.map((gate) => ({ id: gate.id, counters: gate.counters, runtimeErrors: gate.runtimeErrors, pageConsoleErrors: gate.pageConsoleErrors, errorUi: gate.errorUi })) });
}

/** Row a — Topbar success: every Topbar value, exact bytes, no status; aria-checked, summary, <html> and the pane agree. */
async function rowA() {
  const STEPS = [["lang", "zh"], ["lang", "en"], ["theme", "dark"], ["theme", "system"], ["theme", "light"], ["density", "compact"], ["density", "comfortable"]];
  for (const [routeName, path] of [["calendar", "/app/calendar"], ["pane", "/app/settings/appearance"]]) {
    const id = `host:a:${routeName}`;
    const paneMounted = routeName === "pane";
    await seed({ [MARKER_KEY]: MARKER }, id);
    await mountApp(id, { path });
    const segment = await beginSegment(id);
    let stored = {};
    await openTopbar(id);
    for (const [index, [field, value]] of STEPS.entries()) {
      const step = `${id}:${index + 1}:${field}=${value}`;
      const next = { ...stored, [field]: value };
      const shown = shownOf(next);
      const raw = rawOf(next);
      const since = await mark();
      if (paneMounted) await startFrames();
      const point = await chooseTopbar(field, value, step);
      const settled = await waitUntil(`__native.native.get(${JSON.stringify(KEY[field])}) === ${JSON.stringify(raw[KEY[field]])}${paneMounted ? ` && ${statusLineIs(COPY[shown.lang].saved)}` : ""}`, 6000);
      await delay(250);
      const frames = paneMounted ? await stopFrames() : [];
      const after = await snap(since);
      const dt = await devtoolsBytes();
      const sets = opsOn(after.attempts, "set", KEY[field]);
      check(`${step}:exact-bytes-one-write`, settled && isDeepStrictEqual(after.physical, raw) && isDeepStrictEqual(dt, raw) && sets.length === 1 && sets[0].value === raw[KEY[field]] && sets[0].outcome === "ok"
        && sevenMutations(after.attempts).length === 1 && otherMutations(after.attempts).length === 0, { physical: after.physical, devtools: dt, expected: raw, mutations: brief(mutations(after.attempts)) });
      check(`${step}:no-status-aria-checked-summary-and-html-show-the-value`, after.topbar.status === null && after.topbar.open && isDeepStrictEqual(checkedOf(after.topbar), checkedFor(shown)) && after.topbar.summary === summaryFor(shown)
        && htmlMatches(after.html, shown) && after.uiLang === shown.lang, { status: after.topbar.status, checked: checkedOf(after.topbar), expected: checkedFor(shown), summary: after.topbar.summary, html: after.html });
      if (paneMounted) {
        check(`${step}:pane-shows-the-same-value-with-truthful-saved`, paneMatches(after.pane.values, shown) && cleanPane(after.pane, shown.lang, COPY[shown.lang].saved), { pane: after.pane });
        const bad = frameAgreement(frames, after.html.prefersDark);
        check(`${step}:pane-topbar-and-html-agree-in-every-frame`, frames.length > 0 && bad.length === 0, { frames: frames.length, inconsistent: bad.slice(0, 3) });
      }
      const warning = await warn();
      check(`${step}:no-unload-warning-after-success`, warning.warned === false && warning.attempts === 0, warning);
      record("value", { row: "a", route: routeName, field, value, raw: raw[KEY[field]], point, framesSampled: frames.length });
      stored = next;
    }
    await closeTopbar(id);
    await endSegment(segment, ZERO);
  }
}

/** Row b — Topbar failure: kept and applied, status at every width, Review once to the pane, Retry removes the status. */
async function rowB() {
  const CASES = [
    { id: "host:b:theme", seedLang: "en", path: "/app/calendar", field: "theme", value: "dark", widths: true },
    { id: "host:b:lang", seedLang: "en", path: "/app/calendar", field: "lang", value: "zh", widths: true },
    { id: "host:b:density-zh", seedLang: "zh", path: "/app/tasks", field: "density", value: "compact", widths: false },
  ];
  for (const item of CASES) {
    const { id } = item;
    await seed(seedsOf({ lang: item.seedLang }), id);
    await mountApp(id, { path: item.path });
    const segment = await beginSegment(id);
    const shown = shownOf({ lang: item.seedLang, [item.field]: item.value });
    const lang = shown.lang;
    const since = await mark();
    await failTopbar(item.field, item.value, id);
    const after = await snap(since);
    check(`${id}:choice-stays-displayed-and-applied-bytes-unchanged`, htmlMatches(after.html, shown) && after.topbar.summary === summaryFor(shown) && after.uiLang === lang && isDeepStrictEqual(after.physical, rawOf({ lang: item.seedLang })),
      { html: after.html, summary: after.topbar.summary, uiLang: after.uiLang, physical: after.physical });
    const warning = await warn();
    check(`${id}:topbar-status-shown-unload-warns`, topbarStatusShown(after.topbar, lang) && warning.warned === true && warning.attempts === 0, { status: after.topbar.status, warning });
    await openTopbar(`${id}:inspect`);
    const open = await evaluate("__native.topbar()");
    await closeTopbar(`${id}:inspect`);
    await parkMouse();
    check(`${id}:aria-checked-shows-the-choice`, isDeepStrictEqual(checkedOf(open), checkedFor(shown)), { checked: checkedOf(open), expected: checkedFor(shown) });
    if (item.widths) {
      const perWidth = [];
      for (const width of [375, 414, 768, 1024, 1440]) {
        await setViewport(width, 900);
        perWidth.push({ width, ...(await evaluate(`(() => {
          const status = document.querySelector('[data-testid="appearance-status"]');
          if (!status) return { present: false };
          const rect = status.getBoundingClientRect();
          const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
          const hit = document.elementFromPoint(x, y);
          const topbar = __native.topbar();
          return { present: true, rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height },
            inViewport: rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight, centreHit: !!hit && status.contains(hit),
            name: topbar.status.name, textVisible: topbar.status.textVisible, summaryVisible: topbar.summaryVisible, innerWidth };
        })()`)) });
      }
      await setViewport(1280, 900);
      check(`${id}:status-appears-at-every-width`, perWidth.every((state) => state.present && state.inViewport && state.centreHit && state.name === COPY[lang].statusName && state.rect.width >= 44 && state.rect.height >= 44), { perWidth });
      check(`${id}:status-text-visible-exactly-where-the-topbar-summary-is-visible`, perWidth.every((state) => state.textVisible === state.summaryVisible), { perWidth });
      record("topbar-status-widths", { id, perWidth });
    }
    const reviewMark = await mark();
    await clickTestId("appearance-status", `${id}:review`);
    const arrived = await waitUntil(`${READY_PANE} && verify.location().pathname === "/app/settings/appearance"`, 5000);
    await delay(500);
    const review = await snap(reviewMark);
    const moduleChange = review.dispatches.filter((entry) => entry.kind === "bus" && entry.type === "web:shell:module-change");
    check(`${id}:review-navigates-exactly-once-to-the-appearance-pane`, arrived && review.commits.length === 1 && review.commits[0].pathname === "/app/settings/appearance" && review.commits[0].action === "PUSH"
      && isDeepStrictEqual(counters(review), { push: 1, replace: 0, popstate: 0, commits: 1 }) && moduleChange.length === 1 && review.navigateCalls.filter((entry) => entry.toPath === "/app/settings/appearance").length === 1,
    { commits: review.commits, counters: counters(review), moduleChange, navigateCalls: review.navigateCalls });
    check(`${id}:pane-shows-the-field-message-with-retry-and-discard`, isDeepStrictEqual(review.pane.recovery, blocks(lang, { [item.field]: "not-saved" })) && draftPane(review.pane, lang, COPY[lang].count(1), true) && review.pane.values[item.field] === item.value,
      { recovery: review.pane.recovery, pane: review.pane });
    await evaluate("__native.restore()");
    const retryMark = await mark();
    await clickButton(COPY[lang].retryName(COPY[lang].label[item.field]));
    const saved = await waitUntil(`${statusLineIs(COPY[lang].saved)} && ${topbarStatusIs(false)}`, 6000);
    await delay(300);
    const retried = await snap(retryMark);
    const finalWarning = await warn();
    check(`${id}:successful-retry-writes-once-and-removes-the-status`, saved && opsOn(retried.attempts, "set", KEY[item.field]).length === 1 && retried.physical[KEY[item.field]] === ENC[item.field](item.value) && retried.topbar.status === null
      && cleanPane(retried.pane, lang, COPY[lang].saved) && finalWarning.warned === false, { attempts: brief(sevenMutations(retried.attempts)), physical: retried.physical, pane: retried.pane, warning: finalWarning });
    await endSegment(segment, { push: 1, replace: 0, popstate: 0, commits: 1 });
  }
}

/** Row c — held Topbar write: no status and controls enabled while held; exactly one write and no status after release. */
async function rowC() {
  const id = "host:c";
  await seed(seedsOf({ lang: "en" }), id);
  await mountApp(id, { path: "/app/calendar" });
  const segment = await beginSegment(id);
  const name = LOCK_OF("theme");
  await evaluate(`__native.hold(${JSON.stringify(name)})`);
  pre(`${id}:fixture-holds-the-real-theme-lock`, (await evaluate("__native.lockQuery()")).held.includes(name));
  const since = await mark();
  await chooseTopbar("theme", "dark", id);
  await delay(900);
  const during = await snap(since);
  const locks = await evaluate("__native.lockQuery()");
  const warning = await warn();
  const shown = shownOf({ lang: "en", theme: "dark" });
  check(`${id}:while-held-no-status-and-controls-enabled`, during.topbar.status === null && during.topbar.open && during.topbar.options.length === 7 && during.topbar.options.every((option) => !option.disabled), { status: during.topbar.status, options: during.topbar.options });
  check(`${id}:choice-displayed-and-applied-while-held`, htmlMatches(during.html, shown) && during.topbar.summary === summaryFor(shown) && isDeepStrictEqual(checkedOf(during.topbar), checkedFor(shown)), { html: during.html, summary: during.topbar.summary });
  check(`${id}:zero-writes-while-the-engine-waits-on-the-real-lock`, sevenMutations(during.attempts).length === 0 && during.physical[KEY.theme] === null && locks.held.includes(name) && locks.pending.includes(name)
    && appLocks(during.locks).filter((lock) => lock === name).length === 1, { mutations: brief(sevenMutations(during.attempts)), locks, appLocks: appLocks(during.locks) });
  check(`${id}:unload-warns-while-pending`, warning.warned === true && warning.attempts === 0, warning);
  await evaluate(`__native.release(${JSON.stringify(name)})`);
  const persisted = await waitUntil(`__native.native.get("xai_pref_theme") === ${JSON.stringify('"dark"')}`, 6000);
  await delay(500);
  const after = await snap(since);
  const afterWarning = await warn();
  check(`${id}:after-release-exactly-one-write-and-no-status`, persisted && opsOn(after.attempts, "set", KEY.theme).length === 1 && opsOn(after.attempts, "set", KEY.theme)[0].outcome === "ok" && sevenMutations(after.attempts).length === 1
    && after.topbar.status === null && afterWarning.warned === false, { attempts: brief(sevenMutations(after.attempts)), status: after.topbar.status, warning: afterWarning });
  await closeTopbar(id);
  await endSegment(segment, ZERO);
}

/** Row d — pane failure, then the Settings sidebar to another pane: not held, no dialog, status shown; drafts intact on return. */
async function rowD() {
  const id = "host:d";
  await seed(seedsOf({ lang: "en" }), id);
  await mountApp(id);
  const segment = await beginSegment(id);
  await failPane("accentHue", 230, `${id}:accent`);
  const leaveMark = await mark();
  await sidebarClick(labels.en.about, `${id}:sidebar-about`);
  const left = await waitUntil(`verify.location().pathname === "/app/settings/about" && !document.querySelector(".settings-departure-dialog")`, 4000);
  await delay(500);
  const away = await snap(leaveMark);
  check(`${id}:sidebar-departure-not-held-no-dialog-status-shown`, left && away.dialog === null && topbarStatusShown(away.topbar, "en") && away.html.accentHue === "230" && sevenMutations(away.attempts).length === 0
    && isDeepStrictEqual(counters(away), { push: 1, replace: 0, popstate: 0, commits: 1 }), { location: away.location, dialog: away.dialog, status: away.topbar.status, counters: counters(away) });
  await sidebarClick(labels.en.appearance, `${id}:sidebar-appearance`);
  pre(`${id}:appearance-pane-mounted-again`, await waitUntil(`${READY_PANE} && verify.location().pathname === "/app/settings/appearance"`, 4000));
  await delay(500);
  const back = await snap(leaveMark);
  check(`${id}:drafts-intact-on-return`, isDeepStrictEqual(back.pane.recovery, blocks("en", { accentHue: "not-saved" })) && back.pane.values.accentHue === 230 && draftPane(back.pane, "en", COPY.en.count(1), true) && sevenMutations(back.attempts).length === 0,
    { recovery: back.pane.recovery, values: back.pane.values });
  await endSegment(segment, { push: 2, replace: 0, popstate: 0, commits: 2 });
}

/** Row e — pane failure, then AppRail or programmatic navigation: not held, status shown, drafts intact. */
async function rowE() {
  const id = "host:e";
  await seed(seedsOf({ lang: "en" }), id);
  await mountApp(id);
  const segment = await beginSegment(id);
  await failPane("railPos", "right", `${id}:rail`);
  const railMark = await mark();
  await railClick(labels.en.calendar, `${id}:apprail-calendar`);
  const away = await waitUntil(`verify.location().pathname === "/app/calendar" && !document.querySelector(".appearance-pane")`, 5000);
  await delay(500);
  const apprail = await snap(railMark);
  check(`${id}:apprail-not-held-status-shown-draft-applied`, away && apprail.dialog === null && topbarStatusShown(apprail.topbar, "en") && apprail.html.railPos === "right" && apprail.html.appRailPos === "right"
    && sevenMutations(apprail.attempts).length === 0 && isDeepStrictEqual(counters(apprail), { push: 1, replace: 0, popstate: 0, commits: 1 }), { location: apprail.location, counters: counters(apprail), html: apprail.html });
  await clickTestId("appearance-status", `${id}:review`);
  pre(`${id}:back-on-the-pane-by-review`, await waitUntil(`${READY_PANE} && verify.location().pathname === "/app/settings/appearance"`, 5000));
  await delay(400);
  const returned = await snap(railMark);
  check(`${id}:drafts-intact-after-apprail`, isDeepStrictEqual(returned.pane.recovery, blocks("en", { railPos: "not-saved" })) && returned.pane.values.railPos === "right" && sevenMutations(returned.attempts).length === 0, { recovery: returned.pane.recovery });
  const programmaticMark = await mark();
  await navigateProgrammatic("/app/tasks");
  const gone = await waitUntil(`verify.location().pathname === "/app/tasks" && !document.querySelector(".appearance-pane")`, 5000);
  await delay(500);
  const programmatic = await snap(programmaticMark);
  check(`${id}:programmatic-navigation-not-held-status-shown`, gone && programmatic.dialog === null && topbarStatusShown(programmatic.topbar, "en") && programmatic.html.railPos === "right" && sevenMutations(programmatic.attempts).length === 0
    && isDeepStrictEqual(counters(programmatic), { push: 1, replace: 0, popstate: 0, commits: 1 }), { location: programmatic.location, counters: counters(programmatic) });
  await navigateProgrammatic("/app/settings/appearance");
  pre(`${id}:back-on-the-pane-programmatically`, await waitUntil(`${READY_PANE} && verify.location().pathname === "/app/settings/appearance"`, 5000));
  await delay(400);
  const final = await snap(programmaticMark);
  check(`${id}:drafts-intact-after-programmatic-navigation`, isDeepStrictEqual(final.pane.recovery, blocks("en", { railPos: "not-saved" })) && final.pane.values.railPos === "right" && draftPane(final.pane, "en", COPY.en.count(1), true), { recovery: final.pane.recovery });
  await endSegment(segment, { push: 4, replace: 0, popstate: 0, commits: 4 });
}

/** Row f — Back and Forward with drafts: not held; {pathname,key,state} deep-equal to an ordinary navigation; drafts intact. */
async function rowF() {
  const id = "host:f";
  await seed(seedsOf({ lang: "en" }), id);
  await mountApp(id, { path: "/app/settings/hotkeys" });
  const segment = await beginSegment(id);
  await navigateProgrammatic("/app/settings/about", { state: { token: "host-P" } });
  pre(`${id}:p-entry`, await waitUntil(`verify.location().pathname === "/app/settings/about"`, 4000));
  await delay(300);
  const P = await evaluate("verify.location()");
  await navigateProgrammatic("/app/settings/appearance");
  pre(`${id}:s-entry`, await waitUntil(`${READY_PANE} && verify.location().pathname === "/app/settings/appearance"`, 4000));
  await delay(300);
  const S = await evaluate("verify.location()");
  pre(`${id}:p-has-state-and-distinct-keys`, isDeepStrictEqual(P.state, { token: "host-P" }) && P.key !== S.key, { P, S });
  async function traverse(step, direction, expected) {
    const history = await main.cdp("Page.getNavigationHistory");
    const index = history.currentIndex + (direction === "back" ? -1 : 1);
    const target = history.entries[index];
    pre(`${step}:${direction}-entry-exists`, Boolean(target), { currentIndex: history.currentIndex });
    const since = await mark();
    await main.cdp("Page.navigateToHistoryEntry", { entryId: target.id });
    const arrived = await waitUntil(`verify.location().key === ${JSON.stringify(expected.key)}`, 5000);
    await delay(500);
    const after = await snap(since);
    const historyAfter = await main.cdp("Page.getNavigationHistory");
    return { arrived, after, counts: counters(after), location: triple(after.location), stackIntact: isDeepStrictEqual(historyAfter.entries.map((entry) => entry.id), history.entries.map((entry) => entry.id)), index: historyAfter.currentIndex, expectedIndex: index };
  }
  const POP = { push: 0, replace: 0, popstate: 1, commits: 1 };
  const controlBack = await traverse(`${id}:control`, "back", P);
  const controlForward = await traverse(`${id}:control`, "forward", S);
  pre(`${id}:ordinary-navigation-control`, controlBack.arrived && controlForward.arrived && isDeepStrictEqual(controlBack.location, triple(P)) && isDeepStrictEqual(controlForward.location, triple(S))
    && isDeepStrictEqual(controlBack.counts, POP) && isDeepStrictEqual(controlForward.counts, POP), { controlBack: { location: controlBack.location, counts: controlBack.counts }, controlForward: { location: controlForward.location, counts: controlForward.counts } });
  await failPane("density", "compact", `${id}:density`);
  const back = await traverse(`${id}:draft`, "back", P);
  check(`${id}:back-with-drafts-not-held-deep-equal-to-the-ordinary-navigation`, back.arrived && isDeepStrictEqual(back.location, triple(P)) && isDeepStrictEqual(back.location, controlBack.location) && back.after.dialog === null
    && isDeepStrictEqual(back.counts, POP) && back.stackIntact && back.index === back.expectedIndex && topbarStatusShown(back.after.topbar, "en") && sevenMutations(back.after.attempts).length === 0,
  { location: back.location, expected: triple(P), control: controlBack.location, counts: back.counts, stackIntact: back.stackIntact, status: back.after.topbar.status });
  const forward = await traverse(`${id}:draft`, "forward", S);
  check(`${id}:forward-with-drafts-not-held-deep-equal-to-the-ordinary-navigation`, forward.arrived && isDeepStrictEqual(forward.location, triple(S)) && isDeepStrictEqual(forward.location, controlForward.location) && forward.after.dialog === null
    && isDeepStrictEqual(forward.counts, POP) && forward.stackIntact && forward.index === forward.expectedIndex, { location: forward.location, expected: triple(S), counts: forward.counts, stackIntact: forward.stackIntact });
  check(`${id}:drafts-intact-after-back-and-forward`, isDeepStrictEqual(forward.after.pane.recovery, blocks("en", { density: "not-saved" })) && forward.after.pane.values.density === "compact" && draftPane(forward.after.pane, "en", COPY.en.count(1), true),
    { recovery: forward.after.pane.recovery });
  await endSegment(segment, { push: 2, replace: 0, popstate: 4, commits: 6 });
}

/** Row g — sign-out with drafts from /app/tasks, the Appearance pane (ZH) and the More pane with a More draft. */
async function rowG() {
  {
    const id = "host:g:tasks";
    await seed(seedsOf({ lang: "en" }), id);
    await mountApp(id, { path: "/app/tasks" });
    const segment = await beginSegment(id);
    await failTopbar("theme", "dark", `${id}:theme`);
    await signOutCancel(id, "en");
    await closeAvatarMenu(id);
    const ok = await signOutOk(id, "en");
    await endSegment(segment, null, { okCounters: counters(ok.after) });
  }
  {
    const id = "host:g:pane-zh";
    await seed(seedsOf({ lang: "zh" }), id);
    await mountApp(id);
    const segment = await beginSegment(id);
    await failPane("accentHue", 230, `${id}:accent`, "zh");
    await signOutCancel(id, "zh");
    await closeAvatarMenu(id);
    const ok = await signOutOk(id, "zh");
    await endSegment(segment, null, { okCounters: counters(ok.after) });
  }
  // The coordinator dialog as it appears at 5cd63ff with a More draft (reference for "exactly as before").
  let reference = null;
  {
    const id = "host:g:more-reference-5cd63ff";
    await seed(seedsOf({ lang: "en" }), id);
    await mountApp(id, { path: MORE.route, variant: "before" });
    const segment = await beginSegment(id);
    await failMore(id);
    const S = await evaluate("verify.location()");
    const start = await signOutThroughUi(id, "en");
    const shown = await waitUntil("verify.dialog() !== null", 5000);
    await delay(500);
    const held = await snap(start.mark);
    pre(`${id}:coordinator-dialog-held-at-5cd63ff`, shown && held.dialog !== null && dialogs.length === start.dialogsAt, { dialog: held.dialog, dialogs: dialogs.slice(start.dialogsAt) });
    await clickButton("Stay", ".settings-departure-dialog");
    await delay(900);
    const stayed = await snap(start.mark);
    reference = { dialog: held.dialog, stay: { identityIntact: stayed.scope.kind === "account" && stayed.scopeLog.length === 0, signOuts: stayed.auth.filter((entry) => entry.call === "signOut").length, requests: navigationRequests.length - start.requestsAt, counters: counters(stayed), location: triple(stayed.location), dialogClosed: stayed.dialog === null } };
    pre(`${id}:stay-resolves-false-at-5cd63ff`, reference.stay.identityIntact && reference.stay.signOuts === 0 && reference.stay.requests === 0 && reference.stay.dialogClosed && isDeepStrictEqual(reference.stay.location, triple(S)), reference.stay);
    record("more-coordinator-reference", { revision: BEFORE_REVISION, ...reference });
    await closeAvatarMenu(id);
    await endSegment(segment, null, { reference: true });
  }
  {
    const id = "host:g:more";
    await seed(seedsOf({ lang: "en" }), id);
    await mountApp(id, { path: MORE.route });
    const segment = await beginSegment(id);
    await failTopbar("theme", "dark", `${id}:theme`);
    await failMore(id);
    const S = await evaluate("verify.location()");
    const cancelled = await signOutCancel(id, "en", { more: true });
    check(`${id}:cancel:no-coordinator-dialog`, cancelled.dialog === null, { dialog: cancelled.dialog });
    await closeAvatarMenu(id);
    const ok = await signOutOk(id, "en", { coordinatorHold: true });
    const held = ok.after;
    check(`${id}:ok:appearance-drafts-discarded-then-the-coordinator-dialog-appears-exactly-as-at-5cd63ff`, held.dialog !== null && held.dialog.label === MORE.label && held.dialog.label === reference.dialog.label
      && held.dialog.text === reference.dialog.text && isDeepStrictEqual(held.dialog.buttons, reference.dialog.buttons) && held.topbar.status === null && held.html.theme === "light"
      && held.unloadListeners === ok.listenersBefore - 1 && held.scope.kind === "account" && held.scopeLog.length === 0,
    { dialog: held.dialog, reference: reference.dialog, status: held.topbar.status, html: held.html, listeners: { before: ok.listenersBefore, after: held.unloadListeners } });
    await clickButton("Stay", ".settings-departure-dialog");
    await delay(900);
    const stayed = await snap(ok.start.mark);
    check(`${id}:stay-resolves-false-identity-intact-zero-history-mutations`, stayed.dialog === null && stayed.scope.kind === "account" && stayed.scopeLog.length === 0 && stayed.auth.filter((entry) => entry.call === "signOut").length === 0
      && navigationRequests.length === ok.start.requestsAt && isDeepStrictEqual(counters(stayed), ZERO) && isDeepStrictEqual(triple(stayed.location), triple(S)),
    { dialog: stayed.dialog, scopeLog: stayed.scopeLog, counters: counters(stayed), location: stayed.location });
    record("observation", { id: `${id}:dialog-html`, fixed: held.dialog.html, reference: reference.dialog.html });
    await closeAvatarMenu(id);
    await evaluate(`__native.allowSet(${JSON.stringify(MORE.key)})`);
    await clickButton(MORE.discard, ".settings-detail");
    await endSegment(segment, ZERO);
  }
}

/** Row h — sign-out without drafts: zero confirm calls; outcome identical to 5cd63ff in both auth branches. */
async function rowH() {
  const outcomes = {};
  for (const branch of ["legacy", "coordinator"]) {
    for (const [routeName, path] of [["tasks", "/app/tasks"], ["appearance", "/app/settings/appearance"]]) {
      for (const stage of ["fixed", "before"]) {
        const variant = branch === "legacy" ? stage : `${stage}-coord`;
        const id = `host:h:${branch}:${routeName}:${stage}`;
        await seed(seedsOf({ lang: "en" }), id);
        await mountApp(id, { path, variant });
        const segment = await beginSegment(id);
        const start = await signOutThroughUi(id, "en");
        const done = await waitFor(() => navigationRequests.length > start.requestsAt, 6000);
        await delay(1500);
        const after = await snap(start.mark);
        const coordinator = await coordinatorLog();
        const outcome = {
          completed: done,
          confirms: dialogs.slice(start.dialogsAt).map((entry) => entry.type),
          scope: after.scopeLog.map((entry) => `${entry.kind}:${entry.accountId}`),
          clientSignOuts: after.auth.filter((entry) => entry.call === "signOut").length,
          coordinatorSignOuts: coordinator ? coordinator.signOuts.map((entry) => entry.captured) : null,
          navigationRequests: navigationRequests.slice(start.requestsAt).map((entry) => entry.url.replace(origin, "")),
          history: counters(after),
          routerPath: after.location?.pathname ?? null,
          sevenMutations: sevenMutations(after.attempts).length,
          otherMutations: [...new Set(otherMutations(after.attempts).map((entry) => `${entry.op}:${entry.key}`))].sort(),
          gate: after.gate ? (after.gate.status ?? after.gate.heading) : null,
          runtimeErrors: runtimeErrors.length - start.errorsAt,
          unloadListeners: after.unloadListeners,
        };
        outcomes[`${branch}:${routeName}:${stage}`] = outcome;
        record("sign-out-outcome", { id, branch, route: routeName, stage, variant, outcome });
        if (stage === "fixed") {
          check(`${id}:zero-confirm-calls-sign-out-completes`, outcome.confirms.length === 0 && done && outcome.sevenMutations === 0, outcome);
          await endSegment(segment, null);
        } else {
          observe(`${id}:before-gate`, { runtimeErrors: outcome.runtimeErrors });
          rowGates.push({ id: segment.id, page: "main", counters: outcome.history, runtimeErrors: outcome.runtimeErrors, pageConsoleErrors: after.consoleErrors.length, errorUi: after.errorUi.length, reference: true });
        }
      }
      check(`host:h:${branch}:${routeName}:outcome-identical-to-5cd63ff`, isDeepStrictEqual(outcomes[`${branch}:${routeName}:fixed`], outcomes[`${branch}:${routeName}:before`]),
        { fixed: outcomes[`${branch}:${routeName}:fixed`], before: outcomes[`${branch}:${routeName}:before`] });
    }
  }
}

/** Row i — beforeunload warns only with drafts, with zero storage attempts in the handler; none clean or source-only. */
async function rowI() {
  {
    const id = "host:i:clean";
    await seed(seedsOf({ lang: "en" }), id);
    await mountApp(id);
    const segment = await beginSegment(id);
    const warning = await warn();
    check(`${id}:no-warning-no-listener`, warning.warned === false && warning.attempts === 0 && warning.listeners === 0, warning);
    await endSegment(segment, ZERO);
  }
  {
    const id = "host:i:source-only";
    await seed({ ...seedsOf({ lang: "en" }), [KEY.railPos]: "diagonal" }, id);
    await mountApp(id, { productCrash: true });
    const segment = await beginSegment(id);
    const now = await snap(segment.mark);
    pre(`${id}:source-only-state`, isDeepStrictEqual(now.pane.recovery, blocks("en", { railPos: "unavailable" })), { recovery: now.pane.recovery });
    const warning = await warn();
    check(`${id}:no-warning-no-listener`, warning.warned === false && warning.attempts === 0 && warning.listeners === 0, warning);
    await endSegment(segment, ZERO);
  }
  {
    const id = "host:i:pending-then-failed";
    await seed(seedsOf({ lang: "en" }), id);
    await mountApp(id);
    const segment = await beginSegment(id);
    const name = LOCK_OF("accentHue");
    await evaluate(`__native.hold(${JSON.stringify(name)})`);
    await clickPaneValue("accentHue", 230, `${id}:accent`);
    pre(`${id}:pending`, await waitUntil(blockIs("en", "accentHue", "saving"), 4000));
    const pending = await warn();
    check(`${id}:pending-draft-warns-zero-handler-attempts`, pending.warned === true && pending.attempts === 0 && pending.listeners === 1, pending);
    await evaluate(`__native.release(${JSON.stringify(name)})`);
    pre(`${id}:saved`, await waitUntil(`${statusLineIs(COPY.en.saved)} && __native.pane().recovery.length === 0`, 6000));
    const saved = await warn();
    check(`${id}:saved-removes-the-warning`, saved.warned === false && saved.attempts === 0 && saved.listeners === 0, saved);
    await failPane("bgTone", "lavender", `${id}:bg`);
    const failed = await warn();
    check(`${id}:failed-draft-warns-zero-handler-attempts`, failed.warned === true && failed.attempts === 0 && failed.listeners === 1, failed);
    await evaluate("__native.restore()");
    await clickButton(COPY.en.discardAll, PANE);
    pre(`${id}:discarded`, await waitUntil("__native.pane().recovery.length === 0", 4000));
    const discarded = await warn();
    check(`${id}:discard-removes-the-warning`, discarded.warned === false && discarded.attempts === 0 && discarded.listeners === 0, discarded);
    await failPane("density", "compact", `${id}:density`);
    await endSegment(segment, ZERO);
    // A real browser prompt on a runner-initiated navigation away from the document with a draft (observation).
    const before = dialogs.length;
    await seed(seedsOf({ lang: "en" }), `${id}:navigate-away`);
    observe(`${id}:real-beforeunload-prompt-on-navigation-away`, { dialogs: dialogs.slice(before) });
  }
}

/** Row j — cross-document: an idle second App document updates live; a drafted field in it becomes a preserved conflict. */
async function rowJ() {
  const id = "host:j";
  await seed(seedsOf({ lang: "en" }), id);
  await mountApp(`${id}:doc1`, { path: "/app/calendar" });
  const doc2 = await openPage("doc2");
  await mountApp(`${id}:doc2`, { path: "/app/settings/appearance", page: doc2 });
  await main.cdp("Page.bringToFront");
  await delay(300);
  const segment1 = await beginSegment(`${id}:doc1`);
  const segment2 = await beginSegment(`${id}:doc2`, doc2);
  let stored = { lang: "en" };
  for (const [field, value] of [["theme", "dark"], ["lang", "zh"], ["density", "compact"]]) {
    const step = `${id}:${field}=${value}`;
    stored = { ...stored, [field]: value };
    const shown = shownOf(stored);
    const since2 = await mark(doc2);
    await chooseTopbar(field, value, step);
    pre(`${step}:doc1-committed`, await waitUntil(`__native.native.get(${JSON.stringify(KEY[field])}) === ${JSON.stringify(ENC[field](value))}`, 6000));
    const updated = await waitUntil(`(() => { const html = __native.html(); const pane = __native.paneValues(); return html.theme === ${JSON.stringify(resolveTheme(shown.theme, false))} && html.density === ${JSON.stringify(shown.density)}
      && __native.uiLang() === ${JSON.stringify(shown.lang)} && !!pane && pane.theme === ${JSON.stringify(shown.theme)} && pane.lang === ${JSON.stringify(shown.lang)} && pane.density === ${JSON.stringify(shown.density)}; })()`, 6000, doc2);
    await delay(300);
    const second = await snap(since2, doc2);
    check(`${step}:idle-second-document-updates-live`, updated && htmlMatches(second.html, shown) && second.topbar.summary === summaryFor(shown) && paneMatches(second.pane.values, shown) && second.uiLang === shown.lang
      && second.pane.recovery.length === 0 && sevenMutations(second.attempts).length === 0 && second.received.some((entry) => entry.key === KEY[field] && entry.trusted && entry.newValue === ENC[field](value)),
    { html: second.html, summary: second.topbar.summary, pane: second.pane.values, uiLang: second.uiLang, received: second.received, mutations: brief(sevenMutations(second.attempts)) });
  }
  await closeTopbar(id);
  // A drafted field in the second document becomes a preserved conflict.
  await doc2.cdp("Page.bringToFront");
  await delay(200);
  await failPane("railPos", "top", `${id}:doc2-rail-top`, "zh", doc2);
  await main.cdp("Page.bringToFront");
  await navigateProgrammatic("/app/settings/appearance");
  pre(`${id}:doc1-on-the-pane`, await waitUntil(`${READY_PANE} && verify.location().pathname === "/app/settings/appearance"`, 5000));
  const since2 = await mark(doc2);
  await clickPaneValue("railPos", "right", `${id}:doc1-rail-right`);
  pre(`${id}:doc1-committed-right`, await waitUntil(`__native.native.get("xai_rail_pos") === "right" && ${statusLineIs(COPY.zh.saved)}`, 6000));
  pre(`${id}:doc2-received-the-external-commit`, await waitUntil(`__native.window(${since2}).storageReceived.some((entry) => entry.key === "xai_rail_pos" && entry.newValue === "right" && entry.trusted)`, 5000, doc2));
  await delay(400);
  const conflicted = await snap(since2, doc2);
  check(`${id}:drafted-field-preserved-in-the-second-document`, isDeepStrictEqual(conflicted.pane.recovery, blocks("zh", { railPos: "not-saved" })) && conflicted.pane.values.railPos === "top" && conflicted.html.railPos === "top"
    && sevenMutations(conflicted.attempts).length === 0, { recovery: conflicted.pane.recovery, values: conflicted.pane.values, html: conflicted.html });
  await doc2.cdp("Page.bringToFront");
  await delay(200);
  await evaluate("__native.restore()", doc2);
  const retryMark = await mark(doc2);
  await clickButton(COPY.zh.retryName(COPY.zh.label.railPos), PANE, doc2);
  await delay(900);
  const retried = await snap(retryMark, doc2);
  check(`${id}:retry-in-the-second-document-is-a-preserved-conflict`, sevenMutations(retried.attempts).length === 0 && retried.physical[KEY.railPos] === "right" && isDeepStrictEqual(retried.pane.recovery, blocks("zh", { railPos: "not-saved" }))
    && retried.pane.values.railPos === "top", { mutations: brief(sevenMutations(retried.attempts)), physical: retried.physical, recovery: retried.pane.recovery });
  await clickButton(COPY.zh.discardName(COPY.zh.label.railPos), PANE, doc2);
  pre(`${id}:doc2-discarded`, await waitUntil("__native.pane().recovery.length === 0", 4000, doc2));
  await delay(300);
  const discarded = await snap(retryMark, doc2);
  check(`${id}:discard-shows-the-external-value-zero-writes`, mutations(discarded.attempts).length === 0 && discarded.pane.values.railPos === "right" && discarded.html.railPos === "right" && discarded.physical[KEY.railPos] === "right",
    { values: discarded.pane.values, html: discarded.html });
  await main.cdp("Page.bringToFront");
  await endSegment(segment2, ZERO);
  await endSegment(segment1, { push: 1, replace: 0, popstate: 0, commits: 1 });
  await closePage(doc2);
}

/** Row k — forced scope change through the identity channel from a second document: remount, committed values, no Saved claim. */
async function rowK() {
  const id = "host:k";
  const stored = { lang: "en", accentHue: 230 };
  await seed(seedsOf(stored), id);
  await mountApp(id);
  const segment = await beginSegment(id);
  await failPane("theme", "dark", `${id}:theme`);
  const changeMark = await mark();
  const marked = await evaluate("__native.markElements()");
  pre(`${id}:host-elements-marked`, ["app", "topbar", "pane"].every((part) => marked.includes(part)), { marked });
  const before = await evaluate("({ instance: verify.instance, scope: verify.scope() })");
  await evaluate("__native.startDom()");
  await externalDocument(`localStorage.setItem(${JSON.stringify(IDENTITY_KEY)}, JSON.stringify({ accountId: null, nonce: "host-k-signed-out-elsewhere" })); localStorage.getItem(${JSON.stringify(IDENTITY_KEY)}) !== null`, `${id}:identity-null`);
  const gated = await waitUntil("!!document.querySelector('.account-data-gate')", 6000);
  const gate = await evaluate("verify.gate()");
  await externalDocument(`localStorage.setItem(${JSON.stringify(IDENTITY_KEY)}, JSON.stringify({ accountId: ${JSON.stringify(OWNER)}, nonce: "host-k-signed-in-again" })); true`, `${id}:identity-owner`);
  const remounted = await waitUntil(READY_PANE, 8000);
  await delay(700);
  const dom = await evaluate("__native.stopDom()");
  const fates = await evaluate("__native.elementFates()");
  const after = await snap(changeMark);
  const shown = shownOf(stored);
  check(`${id}:forced-scope-change-remounts-the-app`, gated && remounted && fates.app.marked && !fates.app.sameNode && after.scope.kind === "account" && after.scope.accountId === OWNER && after.scope.epoch > before.scope.epoch
    && dom.some((entry) => entry.kind === "added" && entry.what.includes("gate")), { gated, gate, remounted, fates, scope: after.scope, before: before.scope, scopeLog: after.scopeLog });
  check(`${id}:committed-values-displayed-no-saved-claim-no-draft`, paneMatches(after.pane.values, shown) && htmlMatches(after.html, shown) && after.topbar.summary === summaryFor(shown) && cleanPane(after.pane, "en", "")
    && after.topbar.status === null && after.unloadListeners === 0, { pane: after.pane, html: after.html, status: after.topbar.status, listeners: after.unloadListeners });
  check(`${id}:zero-writes-on-the-seven-keys`, sevenMutations(after.attempts).length === 0 && isDeepStrictEqual(after.physical, rawOf(stored)), { mutations: brief(sevenMutations(after.attempts)), physical: after.physical });
  await endSegment(segment, ZERO, { scopeTransitions: after.scopeLog.map((entry) => `${entry.kind}:${entry.accountId}:${entry.epoch}`) });
}

/** The contract §5 item 2 malformed values (and a throwing getItem per key). */
const MALFORMED = {
  lang: ['"fr"', "en", "", "null", "1", '"EN"'],
  theme: ['"neon"', "dark", '"Dark"', "123"],
  density: ['"cozy"', "{}", "compact"],
  fontScale: ["0", "-1", "null", '"big"', "2", "0.5", '"1"'],
  accentHue: ["abc", "Infinity", "-5", "361", "12.5"],
  railPos: ["diagonal", "Left", "", " left"],
  bgTone: ["sage", "neon", "Mist", ""],
};
/** The ten values that crashed every /app route at 5cd63ff (E4 H6 plus "EN"). */
const CRASHING = [["lang", '"fr"'], ["lang", "null"], ["lang", "1"], ["lang", '"EN"'], ["fontScale", "0"], ["fontScale", "-1"], ["fontScale", "null"], ["fontScale", '"big"'], ["fontScale", '"1"'], ["accentHue", "Infinity"]];
const VALID_OTHERS = { lang: "en", theme: "dark", density: "compact", accentHue: 230, bgTone: "mist", railPos: "right", fontScale: 1.1 };

/** Row l — malformed bytes at load: no route error, the default displayed and applied, a Reload-only alert, zero writes. */
async function rowL() {
  let index = 0;
  const cases = [...Object.entries(MALFORMED).flatMap(([field, values]) => values.map((raw) => ({ field, raw, kind: "invalid" }))), ...FIELDS.map((field) => ({ field, raw: null, kind: "unreadable" }))];
  pre("host:l:33-malformed-values-and-7-throwing-reads", cases.filter((entry) => entry.kind === "invalid").length === 33 && cases.length === 40);
  for (const item of cases) {
    index += 1;
    const id = `host:l:${String(index).padStart(2, "0")}:${item.field}:${item.kind}:${JSON.stringify(item.raw)}`;
    const others = { ...VALID_OTHERS };
    delete others[item.field];
    const lang = item.field === "lang" ? "en" : VALID_OTHERS.lang;
    let raw;
    if (item.kind === "invalid") {
      await seed({ ...seedsOf(others), [KEY[item.field]]: item.raw }, id);
      raw = { ...rawOf(others), [KEY[item.field]]: item.raw };
      await mountApp(id, { productCrash: true });
    } else {
      const values = { ...VALID_OTHERS, [item.field]: item.field === "lang" ? "zh" : VALID_OTHERS[item.field] };
      await seed(seedsOf(values), id);
      raw = rawOf(values);
      const { identifier } = await main.cdp("Page.addScriptToEvaluateOnNewDocument", { source: `window.__nativeFaultPlan = { get: [${JSON.stringify(KEY[item.field])}] };` });
      await mountApp(id, { productCrash: true });
      await main.cdp("Page.removeScriptToEvaluateOnNewDocument", { identifier });
      const plan = await evaluate(`({ plan: __native.planApplied, denied: __native.window(0).attempts.filter((entry) => entry.op === "get" && entry.outcome === "denied").map((entry) => entry.key) })`);
      pre(`${id}:read-fault-plan-applied-before-mount-and-fired`, isDeepStrictEqual(plan.plan, { get: [KEY[item.field]] }) && plan.denied.includes(KEY[item.field]), { plan });
    }
    const segment = await beginSegment(id);
    const now = await snap(0);
    const dt = await devtoolsBytes();
    const shown = { ...(item.kind === "invalid" ? VALID_OTHERS : { ...VALID_OTHERS, [item.field]: item.field === "lang" ? "zh" : VALID_OTHERS[item.field] }), [item.field]: DEFAULTS[item.field] };
    const warning = await warn();
    check(`${id}:no-route-error-default-displayed-and-applied`, now.routeError === null && paneMatches(now.pane.values, shown) && htmlMatches(now.html, shown) && now.topbar.summary === summaryFor(shown) && now.uiLang === shown.lang,
      { routeError: now.routeError, pane: now.pane.values, html: now.html, summary: now.topbar.summary, expected: shown });
    check(`${id}:pane-source-alert-with-reload-only`, isDeepStrictEqual(now.pane.recovery, blocks(lang, { [item.field]: "unavailable" })) && cleanPane({ ...now.pane, recovery: [] }, lang, ""), { recovery: now.pane.recovery, pane: now.pane });
    // Mount-time writes outside the seven keys (the auth provider's identity announce, a storage-availability probe) are
    // not Appearance writes; they are recorded, as in batch 43 E9 ("otherMountMutations").
    check(`${id}:zero-writes-on-the-seven-keys-bytes-never-rewritten`, sevenMutations(now.attempts).length === 0 && isDeepStrictEqual(now.physical, raw) && isDeepStrictEqual(dt, raw),
      { sevenMutations: brief(sevenMutations(now.attempts)), otherMountMutations: brief(otherMutations(now.attempts)), physical: now.physical, devtools: dt, expected: raw });
    check(`${id}:no-draft-status-or-warning`, now.topbar.status === null && warning.warned === false && warning.listeners === 0, { status: now.topbar.status, warning });
    await endSegment(segment, ZERO);
  }
}

/** Row m — status navigation held by the More coordinator; a successful More Retry releases exactly once (controller ruling 4). */
async function rowM() {
  const id = "host:m";
  await seed(seedsOf({ lang: "en" }), id);
  await mountApp(id, { path: MORE.route });
  const segment = await beginSegment(id);
  await failTopbar("theme", "dark", `${id}:theme`);
  const latest = await failMore(id);
  const S = await evaluate("verify.location()");
  const holdMark = await mark();
  await clickTestId("appearance-status", `${id}:appearance-status`);
  const shown = await waitUntil("verify.dialog() !== null", 4000);
  await delay(500);
  const hold = await snap(holdMark);
  check(`${id}:status-navigation-shows-the-coordinator-dialog`, shown && hold.dialog?.label === MORE.label && isDeepStrictEqual(triple(hold.location), triple(S)) && isDeepStrictEqual(counters(hold), ZERO)
    && hold.navigateCalls.length === 0 && hold.blockerCalls.length === 0 && hold.dispatches.filter((entry) => entry.kind === "bus" && entry.type === "web:shell:module-change").length === 1,
  { dialog: hold.dialog, location: hold.location, counters: counters(hold), navigateCalls: hold.navigateCalls, blockerCalls: hold.blockerCalls });
  await evaluate(`__native.allowSet(${JSON.stringify(MORE.key)})`);
  const releaseMark = await mark();
  await clickButton(MORE.retry, ".settings-detail");
  const left = await waitUntil(`verify.location().pathname === "/app/settings/appearance" && ${READY_PANE}`, 6000);
  await delay(800);
  const released = await snap(releaseMark);
  const replays = released.navigateCalls.filter((entry) => entry.toPath === "/app/settings/appearance");
  const liveProceeds = released.blockerCalls.filter((entry) => entry.op === "proceed" && entry.liveState === "blocked" && entry.liveBlocker === entry.blocker);
  const nonLive = released.blockerCalls.filter((entry) => entry.blocker !== entry.liveBlocker || entry.liveState !== "blocked");
  check(`${id}:released-exactly-once-one-live-release-zero-non-live-blocker-calls`, left && replays.length + liveProceeds.length === 1 && nonLive.length === 0 && !released.blockerCalls.some((entry) => entry.op === "reset" || entry.threw),
    { replays, liveProceeds, nonLive, blockerCalls: released.blockerCalls, navigateCalls: released.navigateCalls });
  check(`${id}:one-router-location-commit-to-the-appearance-pane`, released.commits.length === 1 && released.commits[0].pathname === "/app/settings/appearance" && isDeepStrictEqual(counters(released), { push: 1, replace: 0, popstate: 0, commits: 1 }),
    { commits: released.commits, counters: counters(released) });
  check(`${id}:dialog-closed-more-latest-written-once-appearance-draft-shown`, released.dialog === null && isDeepStrictEqual(opsOn(released.attempts, "set", MORE.key).map((entry) => `${entry.value}:${entry.outcome}`), [`${latest}:ok`])
    && isDeepStrictEqual(released.pane.recovery, blocks("en", { theme: "not-saved" })), { dialog: released.dialog, more: brief(opsOn(released.attempts, "set", MORE.key)), recovery: released.pane.recovery });
  observe(`${id}:release-mechanism`, { kind: replays.length === 1 ? "router.navigate replay (programmatic navigation)" : liveProceeds.length === 1 ? "live proceed() (POP)" : "none", replays: replays.length, liveProceeds: liveProceeds.length });
  await endSegment(segment, { push: 1, replace: 0, popstate: 0, commits: 1 });
}

/** Row n — cross-surface latest intent with the first edit held behind the real lock; the latest wins; one lock request per edit. */
async function rowN() {
  for (const order of ["pane-then-topbar", "topbar-then-pane"]) {
    const id = `host:n:${order}`;
    await seed(seedsOf({ lang: "en" }), id);
    await mountApp(id);
    const segment = await beginSegment(id);
    const name = LOCK_OF("theme");
    await evaluate(`__native.hold(${JSON.stringify(name)})`);
    const since = await mark();
    await startFrames();
    if (order === "pane-then-topbar") {
      await clickPaneValue("theme", "dark", `${id}:pane-dark`);
      pre(`${id}:first-edit-held`, await waitUntil(blockIs("en", "theme", "saving"), 4000));
      await chooseTopbar("theme", "system", `${id}:topbar-system`);
    } else {
      await chooseTopbar("theme", "dark", `${id}:topbar-dark`);
      pre(`${id}:first-edit-held`, await waitUntil(blockIs("en", "theme", "saving"), 4000));
      // The open popover covers the pane's theme cards; it is closed (Escape) before the pane edit.
      await closeTopbar(`${id}:topbar-dark`);
      await parkMouse();
      await clickPaneValue("theme", "system", `${id}:pane-system`);
    }
    await delay(600);
    const held = await snap(since);
    const shownLatest = shownOf({ lang: "en", theme: "system" });
    check(`${id}:latest-displayed-on-both-surfaces-while-held`, paneMatches(held.pane.values, shownLatest) && held.topbar.summary === summaryFor(shownLatest) && htmlMatches(held.html, shownLatest) && held.physical[KEY.theme] === null
      && isDeepStrictEqual(held.pane.recovery, blocks("en", { theme: "saving" })), { pane: held.pane.values, summary: held.topbar.summary, html: held.html, physical: held.physical });
    await evaluate(`__native.release(${JSON.stringify(name)})`);
    const settled = await waitUntil(`__native.native.get("xai_pref_theme") === ${JSON.stringify('"system"')} && ${statusLineIs(COPY.en.saved)} && __native.pane().recovery.length === 0`, 6000);
    await delay(400);
    const frames = await stopFrames();
    const after = await snap(since);
    if (after.topbar.open) await closeTopbar(id);
    const sets = opsOn(after.attempts, "set", KEY.theme).map((entry) => `${entry.value}:${entry.outcome}`);
    const themeLocks = appLocks(after.locks).filter((lock) => lock === name).length;
    check(`${id}:the-latest-wins`, settled && after.physical[KEY.theme] === '"system"' && paneMatches(after.pane.values, shownLatest) && after.topbar.summary === summaryFor(shownLatest) && cleanPane(after.pane, "en", COPY.en.saved),
      { physical: after.physical, pane: after.pane, sets });
    check(`${id}:each-edit-makes-exactly-one-per-key-lock-request`, themeLocks === 2, { themeLocks, appLocks: appLocks(after.locks), sets });
    const bad = frameAgreement(frames, after.html.prefersDark);
    check(`${id}:both-surfaces-show-the-same-state-in-every-sampled-frame`, frames.length > 0 && bad.length === 0, { frames: frames.length, inconsistent: bad.slice(0, 3) });
    observe(`${id}:theme-writes`, { sets, frames: frames.length });
    await endSegment(segment, ZERO);
  }
}

/**
 * Rows o and p share their failures: a failed Reset item (sidebar removal refused), a failed Topbar theme choice and a
 * failed pane accent edit, in this order (a Reset after the set drafts would supersede them).
 */
async function retryAllAcrossSurfaces(id, lang = "en") {
  await seed(seedsOf({ lang, railPos: "right" }), id);
  await mountApp(id);
  await evaluate(`__native.denyRemove(${JSON.stringify(KEY.railPos)})`);
  await clickReset(id, true, lang);
  pre(`${id}:reset-item-failed-others-verified`, await waitUntil(recoveryIs(blocks(lang, { railPos: "not-reset" })), 6000), { pane: await evaluate("__native.pane()") });
  await failTopbar("theme", "dark", `${id}:topbar-theme`);
  await failPane("accentHue", 230, `${id}:pane-accent`, lang);
  const now = await snap(0);
  pre(`${id}:three-settled-failures-on-three-surfaces`, isDeepStrictEqual(now.pane.recovery, blocks(lang, { theme: "not-saved", accentHue: "not-saved", railPos: "not-reset" })) && draftPane(now.pane, lang, COPY[lang].count(3), true)
    && topbarStatusShown(now.topbar, lang) && now.physical[KEY.theme] === null && now.physical[KEY.accentHue] === null && now.physical[KEY.railPos] === "right", { pane: now.pane, physical: now.physical });
}

/** Row o — Retry all across surfaces: one write or remove per failed key, full success, focus kept, warning removed. */
async function rowO() {
  const id = "host:o";
  await retryAllAcrossSurfaces(id);
  const segment = await beginSegment(`${id}:pass`);
  await evaluate("__native.restore()");
  const rail = LOCK_OF("railPos");
  await evaluate(`__native.hold(${JSON.stringify(rail)})`);
  const since = await mark();
  await startFrames();
  await clickTestId("appearance-retry-all", `${id}:retry-all`);
  const open = await waitUntil(`${statusLineIs(COPY.en.retrying)} && ${recoveryIs(blocks("en", { railPos: "resetting" }))}`, 6000);
  await delay(500);
  const during = await snap(since);
  const duringWarning = await warn();
  check(`${id}:pass-open-topbar-status-hidden-in-flight-line-retry-all-disabled-and-described`, open && during.topbar.status === null && draftPane(during.pane, "en", COPY.en.retrying, false, { passOpen: true })
    && duringWarning.warned === true && during.focus?.testid === "appearance-retry-all", { pane: during.pane, status: during.topbar.status, warning: duringWarning, focus: during.focus });
  await evaluate(`__native.release(${JSON.stringify(rail)})`);
  const done = await waitUntil(`${statusLineIs(COPY.en.saved)} && __native.pane().recovery.length === 0`, 6000);
  await delay(500);
  const frames = await stopFrames();
  const after = await snap(since);
  const muts = mutations(after.attempts).map((entry) => `${entry.op}:${entry.key}=${entry.value ?? ""}:${entry.outcome}`).sort();
  check(`${id}:exactly-one-write-or-remove-per-failed-key-zero-elsewhere`, done && isDeepStrictEqual(muts, ["remove:xai_rail_pos=:ok", 'set:xai_pref_theme="dark":ok', "set:xai_accent_hue=230:ok"].sort()), { muts });
  check(`${id}:exact-bytes-afterwards`, isDeepStrictEqual(after.physical, rawOf({ lang: "en", theme: "dark", accentHue: 230 })), { physical: after.physical });
  const finalWarning = await warn();
  check(`${id}:full-success-retry-all-rendered-disabled-no-description-focus-kept-not-body`, cleanPane(after.pane, "en", COPY.en.saved) && after.focus?.testid === "appearance-retry-all" && !after.focus.isBody && after.topbar.status === null,
    { pane: after.pane, focus: after.focus, status: after.topbar.status });
  check(`${id}:beforeunload-removed`, finalWarning.warned === false && finalWarning.listeners === 0 && finalWarning.attempts === 0, finalWarning);
  const firstSaved = frames.find((frame) => SUCCESS_LINES.includes(frame.statusLine));
  const violations = retryAllFrameViolations(frames, { focusFrom: 0 });
  check(`${id}:saved-only-after-the-last-members-verified-completion`, Boolean(firstSaved) && isDeepStrictEqual(firstSaved.bytes, after.physical) && frames.some((frame) => frame.statusLine === COPY.en.retrying) && violations.length === 0,
    { firstSaved: firstSaved ? { seq: firstSaved.seq, bytes: firstSaved.bytes, statusLine: firstSaved.statusLine } : null, violations: violations.slice(0, 3), frames: frames.length });
  await endSegment(segment, ZERO);
}

/** Row p — partial Retry all: one key still denied; count line, Topbar status back, warning kept, export of the unresolved entry. */
async function rowP() {
  const id = "host:p";
  await retryAllAcrossSurfaces(id);
  const segment = await beginSegment(`${id}:pass`);
  await evaluate(`__native.restore(); __native.denySet(${JSON.stringify(KEY.accentHue)})`);
  const since = await mark();
  await startFrames();
  await clickTestId("appearance-retry-all", `${id}:retry-all`);
  const settled = await waitUntil(`${statusLineIs(COPY.en.count(1))} && ${recoveryIs(blocks("en", { accentHue: "not-saved" }))}`, 6000);
  await delay(500);
  const frames = await stopFrames();
  const after = await snap(since);
  const muts = mutations(after.attempts).map((entry) => `${entry.op}:${entry.key}=${entry.value ?? ""}:${entry.outcome}`).sort();
  check(`${id}:one-attempt-per-member-the-denied-one-failed-again`, settled && isDeepStrictEqual(muts, ["remove:xai_rail_pos=:ok", 'set:xai_pref_theme="dark":ok', "set:xai_accent_hue=230:denied"].sort()), { muts });
  const warning = await warn();
  check(`${id}:count-line-topbar-status-back-warning-kept-focus-on-enabled-retry-all`, draftPane(after.pane, "en", COPY.en.count(1), true) && topbarStatusShown(after.topbar, "en") && warning.warned === true && warning.attempts === 0
    && after.focus?.testid === "appearance-retry-all" && !after.focus.isBody, { pane: after.pane, status: after.topbar.status, warning, focus: after.focus });
  const violations = retryAllFrameViolations(frames, { focusFrom: 0 });
  check(`${id}:per-frame-no-success-line-while-a-member-is-pending-or-failed`, violations.length === 0 && !frames.some((frame) => SUCCESS_LINES.includes(frame.statusLine)), { violations: violations.slice(0, 3), frames: frames.length });
  // Export contains only the unresolved entry (memory only: zero Storage attempts).
  pre(`${id}:download-directory-empty`, visibleDownloads().length === 0, { names: readdirSync(downloads) });
  const exportMark = await mark();
  await clickTestId("appearance-export-draft", `${id}:export`);
  const download = await awaitDownload();
  check(`${id}:export-downloaded`, download !== null, { names: readdirSync(downloads) });
  const payload = JSON.parse(download.raw.toString("utf8"));
  const exported = await snap(exportMark);
  check(`${id}:export-contains-only-the-unresolved-entry-memory-only`, isDeepStrictEqual(payload, { version: 1, kind: "appearance-draft", changes: { device: { accentHue: { operation: "set", value: 230 } } } }) && exported.attempts.length === 0,
    { payload, attempts: brief(exported.attempts) });
  const artifact = `native-${short}-${suffix}-host-p-partial-retry-all-appearance-draft.json`;
  pre(`${id}:artifact-not-overwritten`, !existsSync(join(evidenceDir, artifact)), { artifact });
  copyFileSync(download.file, join(evidenceDir, artifact));
  rmSync(download.file);
  artifacts.push({ shape: "host-p-partial-retry-all", artifact, sha256: sha256(download.raw), bytes: download.raw.length, raw: download.raw.toString("utf8") });
  await endSegment(segment, ZERO);
}

/** Row q — open pass, held and superseded: inert second activations, pass kept across the sidebar, Topbar supersession. */
async function rowQ() {
  const id = "host:q";
  await seed(seedsOf({ lang: "en" }), id);
  await mountApp(id);
  await failTopbar("theme", "dark", `${id}:topbar-theme`);
  await failPane("accentHue", 230, `${id}:pane-accent`);
  const segment = await beginSegment(`${id}:pass`);
  await evaluate("__native.restore()");
  const name = LOCK_OF("theme");
  await evaluate(`__native.hold(${JSON.stringify(name)})`);
  const since = await mark();
  await startFrames();
  await clickTestId("appearance-retry-all", `${id}:retry-all`);
  const open = await waitUntil(`${statusLineIs(COPY.en.retrying)} && ${recoveryIs(blocks("en", { theme: "saving" }))}`, 6000);
  await delay(400);
  const opened = await snap(since);
  check(`${id}:held-member-pass-open-retry-all-disabled-in-flight-line`, open && draftPane(opened.pane, "en", COPY.en.retrying, false, { passOpen: true }) && opened.topbar.status === null && opened.focus?.testid === "appearance-retry-all"
    && opened.physical[KEY.accentHue] === "230", { pane: opened.pane, focus: opened.focus, physical: opened.physical });
  const secondMark = await mark();
  const scrollBefore = await evaluate("__native.scroll()");
  await clickTestId("appearance-retry-all", `${id}:second-click`);
  await press("Enter");
  await press("Space");
  await delay(500);
  const second = await snap(secondMark);
  const scrollAfter = await evaluate("__native.scroll()");
  check(`${id}:second-activation-by-click-enter-and-space-adds-zero-attempts`, mutations(second.attempts).length === 0 && appLocks(second.locks).length === 0 && second.focus?.testid === "appearance-retry-all"
    && isDeepStrictEqual(scrollBefore, scrollAfter) && draftPane(second.pane, "en", COPY.en.retrying, false, { passOpen: true }), { mutations: brief(mutations(second.attempts)), locks: second.locks, focus: second.focus, scrollBefore, scrollAfter });
  await sidebarClick(labels.en.about, `${id}:sidebar-about`);
  pre(`${id}:left-the-pane`, await waitUntil(`verify.location().pathname === "/app/settings/about" && !document.querySelector(".settings-departure-dialog")`, 4000));
  await sidebarClick(labels.en.appearance, `${id}:sidebar-appearance`);
  pre(`${id}:returned-to-the-pane`, await waitUntil(`${READY_PANE} && verify.location().pathname === "/app/settings/appearance"`, 4000));
  await delay(400);
  const back = await snap(since);
  check(`${id}:pass-kept-after-leaving-and-returning`, draftPane(back.pane, "en", COPY.en.retrying, false, { passOpen: true }) && isDeepStrictEqual(back.pane.recovery, blocks("en", { theme: "saving" })) && back.topbar.status === null,
    { pane: back.pane });
  const middle = await evaluate(`__native.lockRequest(${JSON.stringify(name)})`);
  const choiceMark = await mark();
  await chooseTopbar("theme", "system", `${id}:topbar-system`);
  await closeTopbar(`${id}:topbar-system`);
  await parkMouse();
  await delay(300);
  const chosen = await snap(choiceMark);
  // The accent member already succeeded in this pass (230 committed); the theme now displays the Topbar choice.
  const shownSystem = shownOf({ lang: "en", theme: "system", accentHue: 230 });
  check(`${id}:topbar-choice-supersedes-the-held-member`, isDeepStrictEqual(chosen.pane.recovery, blocks("en", { theme: "saving" })) && paneMatches(chosen.pane.values, shownSystem) && htmlMatches(chosen.html, shownSystem)
    && !RETRYING_LINES.includes(chosen.pane.statusLine.text) && !SUCCESS_LINES.includes(chosen.pane.statusLine.text) && chosen.pane.retryAll.ariaDisabled === "true", { pane: chosen.pane, html: chosen.html });
  await evaluate(`__native.release(${JSON.stringify(name)})`);
  const middleHeld = await waitUntil(`__native.lockStates()[${JSON.stringify(middle)}].state === "held"`, 6000);
  await delay(500);
  const between = await snap(since);
  check(`${id}:the-old-completion-does-not-mark-the-new-choice-saved`, middleHeld && isDeepStrictEqual(between.pane.recovery, blocks("en", { theme: "saving" })) && !SUCCESS_LINES.includes(between.pane.statusLine.text)
    && paneMatches(between.pane.values, shownSystem) && htmlMatches(between.html, shownSystem) && between.physical[KEY.theme] !== '"system"',
  { middle: await evaluate("__native.lockStates()"), recovery: between.pane.recovery, statusLine: between.pane.statusLine, physical: between.physical, themeWrites: brief(opsOn(between.attempts, "set", KEY.theme)) });
  await evaluate(`__native.lockRelease(${JSON.stringify(middle)})`);
  const final = await waitUntil(`__native.native.get("xai_pref_theme") === ${JSON.stringify('"system"')} && ${statusLineIs(COPY.en.saved)} && __native.pane().recovery.length === 0`, 6000);
  await delay(400);
  const frames = await stopFrames();
  const after = await snap(since);
  check(`${id}:final-bytes-equal-the-topbar-choice`, final && after.physical[KEY.theme] === '"system"' && cleanPane(after.pane, "en", COPY.en.saved) && after.topbar.status === null, { physical: after.physical, pane: after.pane });
  const oldFrames = frames.filter((frame) => frame.bytes[KEY.theme] === '"dark"');
  check(`${id}:no-frame-claims-saved-while-only-the-old-bytes-are-committed`, oldFrames.every((frame) => !SUCCESS_LINES.includes(frame.statusLine) && frame.recovery.includes(`theme=${COPY.en.saving(COPY.en.label.theme)}`))
    && retryAllFrameViolations(frames).length === 0, { oldFrames: oldFrames.length, violations: retryAllFrameViolations(frames).slice(0, 3) });
  observe(`${id}:theme-writes`, { writes: brief(opsOn(after.attempts, "set", KEY.theme)), oldBytesFrames: oldFrames.length });
  await endSegment(segment, { push: 2, replace: 0, popstate: 0, commits: 2 });
}

/** Row r — sign-out during an open pass: Cancel lets the pass settle; OK detaches members with zero step writes. */
async function rowR() {
  async function openPass(id) {
    await seed(seedsOf({ lang: "en" }), id);
    await mountApp(id);
    await failTopbar("theme", "dark", `${id}:topbar-theme`);
    await failPane("accentHue", 230, `${id}:pane-accent`);
    await evaluate("__native.restore()");
    await evaluate(`__native.hold(${JSON.stringify(LOCK_OF("theme"))})`);
    await clickTestId("appearance-retry-all", `${id}:retry-all`);
    pre(`${id}:pass-open-with-a-held-member`, await waitUntil(`${statusLineIs(COPY.en.retrying)} && ${recoveryIs(blocks("en", { theme: "saving" }))}`, 6000));
  }
  {
    const id = "host:r:cancel";
    await openPass(id);
    const segment = await beginSegment(id);
    dialogPlan.push({ accept: false, purpose: `${id}: Cancel at the Appearance sign-out step` });
    const start = await signOutThroughUi(id, "en");
    const asked = await waitFor(() => dialogs.length > start.dialogsAt, 4000);
    await delay(900);
    const after = await snap(start.mark);
    const confirms = dialogs.slice(start.dialogsAt);
    check(`${id}:one-confirm-cancel-resolves-false`, asked && confirms.length === 1 && confirms[0].message === COPY.en.confirmSignOut && confirms[0].accepted === false && after.scopeLog.length === 0
      && after.auth.filter((entry) => entry.call === "signOut").length === 0 && navigationRequests.length === start.requestsAt && isDeepStrictEqual(counters(after), ZERO), { confirms, scopeLog: after.scopeLog, counters: counters(after) });
    check(`${id}:the-pass-continues`, draftPane(after.pane, "en", COPY.en.retrying, false, { passOpen: true }) && isDeepStrictEqual(after.pane.recovery, blocks("en", { theme: "saving" })) && mutations(after.attempts).length === 0, { pane: after.pane });
    await closeAvatarMenu(id);
    await evaluate(`__native.release(${JSON.stringify(LOCK_OF("theme"))})`);
    const settled = await waitUntil(`${statusLineIs(COPY.en.saved)} && __native.pane().recovery.length === 0`, 6000);
    await delay(400);
    const final = await snap(start.mark);
    check(`${id}:the-pass-settles-after-cancel`, settled && final.physical[KEY.theme] === '"dark"' && cleanPane(final.pane, "en", COPY.en.saved) && opsOn(final.attempts, "set", KEY.theme).length === 1, { pane: final.pane, physical: final.physical });
    await endSegment(segment, ZERO);
  }
  {
    const id = "host:r:ok";
    await openPass(id);
    const segment = await beginSegment(id);
    const ok = await signOutOk(id, "en");
    const lateMark = await mark();
    await evaluate(`__native.release(${JSON.stringify(LOCK_OF("theme"))})`);
    await delay(1200);
    const late = await snap(lateMark);
    check(`${id}:held-members-late-completion-changes-no-draft-status-line-or-topbar-status`, late.pane === null && late.topbar.status === null && late.scope.kind !== "account" && runtimeErrors.length === ok.start.errorsAt,
      { pane: late.pane, status: late.topbar.status, scope: late.scope, gate: late.gate });
    observe(`${id}:late-engine-completion`, { themeAttempts: brief(late.attempts.filter((entry) => entry.key === KEY.theme)), physical: late.physical, gate: late.gate });
    await endSegment(segment, null, { okCounters: counters(ok.after) });
  }
}

/** Row s — disabled Retry all in the clean, pending-only and source-only states; enabling transitions keep focus. */
async function rowS() {
  for (const state of ["clean", "pending", "source"]) {
    const id = `host:s:${state}`;
    await seed(state === "source" ? { ...seedsOf({ lang: "en" }), [KEY.railPos]: "diagonal" } : seedsOf({ lang: "en" }), id);
    await mountApp(id, { productCrash: state === "source" });
    const segment = await beginSegment(id);
    if (state === "pending") {
      await evaluate(`__native.hold(${JSON.stringify(LOCK_OF("theme"))})`);
      await clickPaneValue("theme", "dark", `${id}:pane-dark`);
      pre(`${id}:pending-only`, await waitUntil(recoveryIs(blocks("en", { theme: "saving" })), 4000));
    }
    const expectedRecovery = state === "pending" ? blocks("en", { theme: "saving" }) : state === "source" ? blocks("en", { railPos: "unavailable" }) : [];
    const now = await snap(segment.mark);
    const disabledOk = (pane) => pane.retryAll.ariaDisabled === "true" && pane.retryAll.disabled === false && pane.retryAll.describedBy === null && pane.retryAll.tabIndex === 0 && !pane.retryAll.hidden
      && pane.retryAll.title === null && pane.retryAll.pointerEvents !== "none" && pane.retryAll.text === COPY.en.retryAll && pane.statusLine.text === "";
    check(`${id}:rendered-aria-disabled-no-disabled-attribute-no-description-no-failure-line`, disabledOk(now.pane) && isDeepStrictEqual(now.pane.recovery, expectedRecovery), { pane: now.pane });
    const tab = await tabTo("appearance-retry-all", id);
    const results = [];
    for (const key of ["Enter", "Space"]) {
      const keyMark = await mark();
      const scrollBefore = await evaluate("__native.scroll()");
      await press(key);
      await delay(400);
      const after = await snap(keyMark);
      const scrollAfter = await evaluate("__native.scroll()");
      results.push({ key, mutations: mutations(after.attempts).length, focus: after.focus, scrollBefore, scrollAfter, pane: after.pane });
      check(`${id}:${key}-on-the-disabled-button-zero-attempts-focus-kept${key === "Space" ? "-no-scroll" : ""}`, mutations(after.attempts).length === 0 && appLocks(after.locks).length === 0 && after.focus?.testid === "appearance-retry-all"
        && (key !== "Space" || isDeepStrictEqual(scrollBefore, scrollAfter)) && disabledOk(after.pane), { mutations: brief(mutations(after.attempts)), focus: after.focus, scrollBefore, scrollAfter, pane: after.pane });
    }
    const clickMark = await mark();
    await clickTestId("appearance-retry-all", `${id}:click`);
    await delay(400);
    const clicked = await snap(clickMark);
    check(`${id}:trusted-click-on-the-disabled-button-zero-attempts-focus-kept`, mutations(clicked.attempts).length === 0 && appLocks(clicked.locks).length === 0 && clicked.focus?.testid === "appearance-retry-all" && disabledOk(clicked.pane),
      { mutations: brief(mutations(clicked.attempts)), focus: clicked.focus });
    record("disabled-retry-all", { id, tab, results: results.map((entry) => ({ key: entry.key, mutations: entry.mutations, focus: entry.focus?.testid })) });
    if (state === "pending") {
      await evaluate(`__native.release(${JSON.stringify(LOCK_OF("theme"))})`);
      pre(`${id}:released-and-saved`, await waitUntil(`${statusLineIs(COPY.en.saved)} && __native.pane().recovery.length === 0`, 6000));
    }
    await endSegment(segment, ZERO);
  }
  {
    const id = "host:s:enable";
    await seed(seedsOf({ lang: "en" }), id);
    await mountApp(id);
    const segment = await beginSegment(id);
    pre(`${id}:clean-and-disabled`, cleanPane((await snap(0)).pane, "en", ""));
    await failTopbar("theme", "dark", `${id}:topbar-theme`);
    const now = await snap(segment.mark);
    check(`${id}:a-failed-topbar-choice-enables-it-described-by-the-count-line`, draftPane(now.pane, "en", COPY.en.count(1), true) && now.pane.retryAll.describedByStatusLine, { pane: now.pane });
    await endSegment(segment, ZERO);
  }
  {
    const id = "host:s:held-fault";
    await seed(seedsOf({ lang: "en" }), id);
    await mountApp(id);
    const segment = await beginSegment(id);
    await failTopbar("theme", "dark", `${id}:topbar-theme`);
    const name = LOCK_OF("theme");
    await evaluate(`__native.hold(${JSON.stringify(name)})`);
    await tabTo("appearance-retry-all", id);
    const since = await mark();
    await startFrames();
    await press("Enter");
    const open = await waitUntil(`${statusLineIs(COPY.en.retrying)} && __native.pane().retryAll.ariaDisabled === "true"`, 6000);
    await delay(400);
    const during = await snap(since);
    check(`${id}:open-pass-only-member-held-disabled-described-by-the-in-flight-line-focus-kept`, open && draftPane(during.pane, "en", COPY.en.retrying, false, { passOpen: true }) && during.focus?.testid === "appearance-retry-all" && mutations(during.attempts).length === 0,
      { pane: during.pane, focus: during.focus });
    await evaluate(`__native.release(${JSON.stringify(name)})`);
    const failed = await waitUntil(`${statusLineIs(COPY.en.count(1))} && __native.pane().retryAll.ariaDisabled === null`, 6000);
    await delay(400);
    const frames = await stopFrames();
    const after = await snap(since);
    const themeSets = opsOn(after.attempts, "set", KEY.theme);
    check(`${id}:failure-on-release-enables-it-focus-stays-count-line-describes-it`, failed && draftPane(after.pane, "en", COPY.en.count(1), true) && after.focus?.testid === "appearance-retry-all" && !after.focus.isBody
      && themeSets.length === 1 && themeSets[0].outcome === "denied" && mutations(after.attempts).length === 1, { pane: after.pane, focus: after.focus, themeSets: brief(themeSets) });
    const violations = retryAllFrameViolations(frames, { focusFrom: 0 });
    check(`${id}:focus-never-on-body-and-frame-invariants-hold`, frames.length > 0 && violations.length === 0, { frames: frames.length, violations: violations.slice(0, 3) });
    await endSegment(segment, ZERO);
  }
}

// ---------------------------------------------------------------------------------------------------
// E26: native Retry all, EN and ZH, trusted pointer and keyboard input (production App composition)
// ---------------------------------------------------------------------------------------------------
const attemptsByKey = (attempts) => Object.fromEntries(SEVEN.map((key) => [key, mutations(attempts).filter((entry) => entry.key === key).map((entry) => `${entry.op}:${entry.value ?? ""}:${entry.outcome}`)]));
/**
 * Six settled failures, in this order: a failed Reset item (sidebar removal refused; a later Reset would supersede set
 * drafts), a Topbar set draft (theme), a pane set draft (density), a background choice with both writes denied
 * (background palette and its accent hue), and a failed predecessor with a queued latest (font scale: 1.05 held behind
 * the real lock, 1.1 queued behind it, 1.05 refused on release so that the queue is held by the failed predecessor).
 */
async function sixFailures(id, lang) {
  await seed(seedsOf({ lang, railPos: "right" }), id);
  await mountApp(id);
  await evaluate(`__native.denyRemove(${JSON.stringify(KEY.railPos)})`);
  await clickReset(id, true, lang);
  pre(`${id}:failed-reset-item`, await waitUntil(recoveryIs(blocks(lang, { railPos: "not-reset" })), 6000), { pane: await evaluate("__native.pane()") });
  await failTopbar("theme", "dark", `${id}:topbar-theme`);
  await failPane("density", "compact", `${id}:pane-density`, lang);
  await failPane("bgTone", "lavender", `${id}:pane-background`, lang);
  const fontLock = LOCK_OF("fontScale");
  await evaluate(`__native.hold(${JSON.stringify(fontLock)})`);
  await focusSlider("fontScale", `${id}:font`);
  const fontMark = await mark();
  await press("ArrowRight");
  pre(`${id}:font-predecessor-held`, await waitUntil(blockIs(lang, "fontScale", "saving"), 4000));
  await press("ArrowRight");
  await delay(250);
  await evaluate(`__native.denySet(${JSON.stringify(KEY.fontScale)})`);
  await evaluate(`__native.release(${JSON.stringify(fontLock)})`);
  pre(`${id}:font-predecessor-failed-latest-queued`, await waitUntil(blockIs(lang, "fontScale", "not-saved"), 6000));
  await delay(300);
  const fontView = await snap(fontMark);
  const fontSets = opsOn(fontView.attempts, "set", KEY.fontScale);
  pre(`${id}:font-only-the-predecessor-attempted-and-refused`, fontSets.length === 1 && fontSets[0].value === "1.05" && fontSets[0].outcome === "denied" && fontView.pane.values.fontScale === 1.1 && fontView.physical[KEY.fontScale] === null,
    { fontSets: brief(fontSets), values: fontView.pane.values });
  const now = await snap(0);
  const expected = blocks(lang, { theme: "not-saved", density: "not-saved", accentHue: "not-saved", bgTone: "not-saved", railPos: "not-reset", fontScale: "not-saved" });
  check(`${id}:six-settled-failures-count-line-retry-all-enabled-topbar-status`, isDeepStrictEqual(now.pane.recovery, expected) && draftPane(now.pane, lang, COPY[lang].count(6), true) && topbarStatusShown(now.topbar, lang)
    && isDeepStrictEqual(now.physical, rawOf({ lang, railPos: "right" })), { recovery: now.pane.recovery, pane: now.pane, status: now.topbar.status, physical: now.physical });
  const oldUi = await evaluate("__native.oldUi()");
  check(`${id}:no-old-button-and-no-saved-text-before-the-pass`, oldUi.length === 0, { oldUi });
  return expected;
}
const SIX_SUCCESS = {
  [KEY.lang]: [],
  [KEY.theme]: ['set:"dark":ok'],
  [KEY.density]: ['set:"compact":ok'],
  [KEY.accentHue]: ["set:295:ok"],
  [KEY.bgTone]: ["set:lavender:ok"],
  [KEY.railPos]: ["remove::ok"],
  [KEY.fontScale]: ["set:1.05:ok", "set:1.1:ok"],
};

async function runRetryAll() {
  for (const lang of ["en", "zh"]) {
    if (selected("full")) await e26Full(lang, lang === "en" ? "Enter" : "Space");
    if (selected("partial")) await e26Partial(lang);
    if (selected("superseded")) await e26HeldSuperseded(lang);
    if (selected("discard")) await e26DiscardDuringPass(lang);
    if (selected("discard-all")) await e26DiscardAllDuringPass(lang);
    if (selected("reset-items")) await e26ResetItemsOnly(lang, lang === "en" ? "Space" : "Enter");
  }
  record("retryall-summary", { segments: rowGates.map((gate) => ({ id: gate.id, counters: gate.counters, runtimeErrors: gate.runtimeErrors })) });
}

/** Full success by keyboard; one member held behind the real lock keeps the pass open; second activations are inert. */
async function e26Full(lang, activation) {
  const id = `retryall:${lang}:full-success-${activation.toLowerCase()}`;
  await sixFailures(id, lang);
  const segment = await beginSegment(id);
  await evaluate("__native.restore()");
  const themeLock = LOCK_OF("theme");
  await evaluate(`__native.hold(${JSON.stringify(themeLock)})`);
  const tab = await tabTo("appearance-retry-all", id);
  const since = await mark();
  await startFrames();
  await press(activation);
  const open = await waitUntil(`${statusLineIs(COPY[lang].retrying)} && ${recoveryIs(blocks(lang, { theme: "saving" }))}`, 8000);
  await delay(400);
  const during = await snap(since);
  const duringWarning = await warn();
  check(`${id}:open-pass-held-member-retry-all-disabled-described-by-the-in-flight-line-topbar-status-hidden`, open && draftPane(during.pane, lang, COPY[lang].retrying, false, { passOpen: true }) && during.topbar.status === null
    && duringWarning.warned === true && duringWarning.attempts === 0 && during.focus?.testid === "appearance-retry-all", { pane: during.pane, status: during.topbar.status, warning: duringWarning, focus: during.focus });
  const secondMark = await mark();
  await press(activation === "Enter" ? "Space" : "Enter");
  await clickTestId("appearance-retry-all", `${id}:second-click`);
  await delay(400);
  const second = await snap(secondMark);
  check(`${id}:second-activation-by-keyboard-and-pointer-while-held-is-inert`, mutations(second.attempts).length === 0 && appLocks(second.locks).length === 0 && second.focus?.testid === "appearance-retry-all"
    && draftPane(second.pane, lang, COPY[lang].retrying, false, { passOpen: true }), { mutations: brief(mutations(second.attempts)), locks: second.locks, focus: second.focus });
  await evaluate(`__native.release(${JSON.stringify(themeLock)})`);
  const done = await waitUntil(`${statusLineIs(COPY[lang].saved)} && __native.pane().recovery.length === 0`, 8000);
  await delay(500);
  const frames = await stopFrames();
  const after = await snap(since);
  const observed = attemptsByKey(after.attempts);
  check(`${id}:exactly-one-attempt-per-member-then-the-queued-latest-zero-on-non-members`, done && isDeepStrictEqual(observed, SIX_SUCCESS) && otherMutations(after.attempts).length === 0, { observed, expected: SIX_SUCCESS, other: brief(otherMutations(after.attempts)) });
  const expectedBytes = rawOf({ lang, theme: "dark", density: "compact", accentHue: 295, bgTone: "lavender", fontScale: 1.1 });
  const dt = await devtoolsBytes();
  check(`${id}:exact-bytes-afterwards`, isDeepStrictEqual(after.physical, expectedBytes) && isDeepStrictEqual(dt, expectedBytes), { physical: after.physical, devtools: dt, expected: expectedBytes });
  const finalWarning = await warn();
  check(`${id}:full-success-retry-all-rendered-disabled-no-description-focus-kept-no-topbar-status-unload-removed`, cleanPane(after.pane, lang, COPY[lang].saved) && after.focus?.testid === "appearance-retry-all" && !after.focus.isBody
    && after.topbar.status === null && finalWarning.warned === false && finalWarning.listeners === 0, { pane: after.pane, focus: after.focus, status: after.topbar.status, warning: finalWarning });
  const violations = retryAllFrameViolations(frames, { focusFrom: 0 });
  const firstSuccess = frames.find((frame) => SUCCESS_LINES.includes(frame.statusLine));
  check(`${id}:status-line-per-frame-never-a-success-line-while-a-member-is-pending-or-failed`, frames.length > 0 && violations.length === 0 && frames.some((frame) => frame.statusLine === COPY[lang].retrying)
    && Boolean(firstSuccess) && isDeepStrictEqual(firstSuccess.bytes, after.physical), { frames: frames.length, violations: violations.slice(0, 3), firstSuccess: firstSuccess ? { seq: firstSuccess.seq, bytes: firstSuccess.bytes } : null });
  const oldUi = await evaluate("__native.oldUi()");
  check(`${id}:no-old-button-and-no-saved-text`, oldUi.length === 0 && !frames.some((frame) => frame.oldUi), { oldUi });
  const order = mutations(after.attempts).map((entry) => entry.key);
  record("retry-all-pass", { id, activation, tab, attemptOrder: order, frames: frames.length, observed });
  await screenshot(`${lang}-full-success-focus-on-disabled-retry-all`);
  await endSegment(segment, ZERO);
}

/** Partial result by pointer: one member still denied; count line, focus kept, Topbar status shown, warning kept. */
async function e26Partial(lang) {
  const id = `retryall:${lang}:partial-pointer`;
  await sixFailures(id, lang);
  const segment = await beginSegment(id);
  await evaluate(`__native.restore(); __native.denySet(${JSON.stringify(KEY.density)})`);
  const since = await mark();
  await startFrames();
  await clickTestId("appearance-retry-all", `${id}:retry-all`);
  const settled = await waitUntil(`${statusLineIs(COPY[lang].count(1))} && ${recoveryIs(blocks(lang, { density: "not-saved" }))}`, 8000);
  await delay(500);
  const frames = await stopFrames();
  const after = await snap(since);
  const expectedAttempts = { ...SIX_SUCCESS, [KEY.density]: ['set:"compact":denied'] };
  const observed = attemptsByKey(after.attempts);
  check(`${id}:exactly-one-attempt-per-member-the-denied-one-refused-again`, settled && isDeepStrictEqual(observed, expectedAttempts) && otherMutations(after.attempts).length === 0, { observed, expected: expectedAttempts });
  const expectedBytes = rawOf({ lang, theme: "dark", accentHue: 295, bgTone: "lavender", fontScale: 1.1 });
  check(`${id}:exact-bytes-afterwards`, isDeepStrictEqual(after.physical, expectedBytes), { physical: after.physical, expected: expectedBytes });
  const warning = await warn();
  check(`${id}:partial-count-line-focus-kept-on-enabled-retry-all-topbar-status-shown-warning-kept`, draftPane(after.pane, lang, COPY[lang].count(1), true) && after.focus?.testid === "appearance-retry-all" && !after.focus.isBody
    && topbarStatusShown(after.topbar, lang) && warning.warned === true && warning.attempts === 0, { pane: after.pane, focus: after.focus, status: after.topbar.status, warning });
  const violations = retryAllFrameViolations(frames, { focusFrom: 0 });
  check(`${id}:status-line-per-frame-no-success-line-at-all`, frames.length > 0 && violations.length === 0 && !frames.some((frame) => SUCCESS_LINES.includes(frame.statusLine)), { frames: frames.length, violations: violations.slice(0, 3) });
  const oldUi = await evaluate("__native.oldUi()");
  check(`${id}:no-old-button-and-no-saved-text`, oldUi.length === 0 && !frames.some((frame) => frame.oldUi), { oldUi });
  await screenshot(`${lang}-partial-result`);
  await endSegment(segment, ZERO);
}

/** A member held behind the real lock (second activation inert), superseded by a Topbar choice; the late completion never acknowledges it. */
async function e26HeldSuperseded(lang) {
  const id = `retryall:${lang}:held-superseded-by-topbar`;
  await seed(seedsOf({ lang }), id);
  await mountApp(id);
  await failTopbar("theme", "dark", `${id}:topbar-theme`);
  await failPane("accentHue", 230, `${id}:pane-accent`, lang);
  const segment = await beginSegment(id);
  await evaluate("__native.restore()");
  const name = LOCK_OF("theme");
  await evaluate(`__native.hold(${JSON.stringify(name)})`);
  const since = await mark();
  await startFrames();
  await clickTestId("appearance-retry-all", `${id}:retry-all`);
  const open = await waitUntil(`${statusLineIs(COPY[lang].retrying)} && ${recoveryIs(blocks(lang, { theme: "saving" }))}`, 6000);
  await delay(300);
  const secondMark = await mark();
  await press("Enter");
  await press("Space");
  await delay(400);
  const second = await snap(secondMark);
  check(`${id}:held-member-second-activation-by-enter-and-space-is-inert`, open && mutations(second.attempts).length === 0 && appLocks(second.locks).length === 0 && second.focus?.testid === "appearance-retry-all"
    && draftPane(second.pane, lang, COPY[lang].retrying, false, { passOpen: true }), { mutations: brief(mutations(second.attempts)), focus: second.focus, pane: second.pane });
  const middle = await evaluate(`__native.lockRequest(${JSON.stringify(name)})`);
  await chooseTopbar("theme", "system", `${id}:topbar-system`);
  await closeTopbar(`${id}:topbar-system`);
  await parkMouse();
  await delay(300);
  const chosen = await snap(since);
  const shownSystem = shownOf({ lang, theme: "system", accentHue: 230 });
  check(`${id}:topbar-choice-supersedes-the-held-member`, isDeepStrictEqual(chosen.pane.recovery, blocks(lang, { theme: "saving" })) && paneMatches(chosen.pane.values, shownSystem) && htmlMatches(chosen.html, shownSystem)
    && !SUCCESS_LINES.includes(chosen.pane.statusLine.text) && !RETRYING_LINES.includes(chosen.pane.statusLine.text) && chosen.pane.retryAll.ariaDisabled === "true", { pane: chosen.pane, html: chosen.html });
  await evaluate(`__native.release(${JSON.stringify(name)})`);
  const middleHeld = await waitUntil(`__native.lockStates()[${JSON.stringify(middle)}].state === "held"`, 6000);
  await delay(500);
  const between = await snap(since);
  check(`${id}:the-late-completion-does-not-acknowledge-the-newer-choice`, middleHeld && isDeepStrictEqual(between.pane.recovery, blocks(lang, { theme: "saving" })) && !SUCCESS_LINES.includes(between.pane.statusLine.text)
    && between.physical[KEY.theme] !== '"system"' && paneMatches(between.pane.values, shownSystem), { recovery: between.pane.recovery, statusLine: between.pane.statusLine, physical: between.physical, writes: brief(opsOn(between.attempts, "set", KEY.theme)) });
  await evaluate(`__native.lockRelease(${JSON.stringify(middle)})`);
  const final = await waitUntil(`__native.native.get("xai_pref_theme") === ${JSON.stringify('"system"')} && ${statusLineIs(COPY[lang].saved)} && __native.pane().recovery.length === 0`, 6000);
  await delay(400);
  const frames = await stopFrames();
  const after = await snap(since);
  check(`${id}:final-bytes-equal-the-topbar-choice`, final && after.physical[KEY.theme] === '"system"' && after.physical[KEY.accentHue] === "230" && cleanPane(after.pane, lang, COPY[lang].saved) && after.topbar.status === null,
    { physical: after.physical, pane: after.pane });
  const oldFrames = frames.filter((frame) => frame.bytes[KEY.theme] === '"dark"');
  const violations = retryAllFrameViolations(frames);
  check(`${id}:no-frame-claims-success-while-only-the-superseded-bytes-are-committed`, oldFrames.every((frame) => !SUCCESS_LINES.includes(frame.statusLine)) && violations.length === 0, { oldFrames: oldFrames.length, violations: violations.slice(0, 3) });
  record("retry-all-supersession", { id, themeWrites: brief(opsOn(after.attempts, "set", KEY.theme)), oldBytesFrames: oldFrames.length, frames: frames.length });
  await endSegment(segment, ZERO);
}

/** Per-field Discard during an open pass: the member is detached, the pass continues, its late completion is ignored. */
async function e26DiscardDuringPass(lang) {
  const id = `retryall:${lang}:discard-during-open-pass`;
  await seed(seedsOf({ lang }), id);
  await mountApp(id);
  await failTopbar("theme", "dark", `${id}:topbar-theme`);
  await failPane("density", "compact", `${id}:pane-density`, lang);
  await failPane("accentHue", 230, `${id}:pane-accent`, lang);
  const segment = await beginSegment(id);
  await evaluate("__native.restore()");
  const themeLock = LOCK_OF("theme");
  const densityLock = LOCK_OF("density");
  await evaluate(`__native.hold(${JSON.stringify(themeLock)}).then(() => __native.hold(${JSON.stringify(densityLock)}))`);
  await tabTo("appearance-retry-all", id);
  const since = await mark();
  await startFrames();
  await press("Enter");
  pre(`${id}:pass-open-two-members-held`, await waitUntil(`${statusLineIs(COPY[lang].retrying)} && ${recoveryIs(blocks(lang, { theme: "saving", density: "saving" }))}`, 6000));
  await delay(300);
  const discardMark = await mark();
  await clickButton(COPY[lang].discardName(COPY[lang].label.theme));
  pre(`${id}:theme-detached`, await waitUntil(recoveryIs(blocks(lang, { density: "saving" })), 4000));
  await delay(300);
  const detached = await snap(discardMark);
  check(`${id}:discard-detaches-the-member-zero-writes-the-pass-continues`, mutations(detached.attempts).length === 0 && detached.pane.values.theme === "light" && detached.html.theme === "light"
    && draftPane(detached.pane, lang, COPY[lang].retrying, false, { passOpen: true }) && detached.topbar.status === null, { mutations: brief(mutations(detached.attempts)), values: detached.pane.values, pane: detached.pane });
  const lateMark = await mark();
  await evaluate(`__native.release(${JSON.stringify(themeLock)})`);
  await delay(900);
  const late = await snap(lateMark);
  const committedTheme = late.physical[KEY.theme] === null ? "light" : JSON.parse(late.physical[KEY.theme]);
  check(`${id}:late-completion-after-discard-changes-no-draft-status-line-or-topbar-status`, isDeepStrictEqual(late.pane.recovery, blocks(lang, { density: "saving" })) && late.pane.statusLine.text === COPY[lang].retrying
    && late.topbar.status === null && late.pane.values.theme === committedTheme && late.html.theme === resolveTheme(committedTheme, late.html.prefersDark), { recovery: late.pane.recovery, statusLine: late.pane.statusLine, theme: late.pane.values.theme, physical: late.physical });
  await evaluate(`__native.release(${JSON.stringify(densityLock)})`);
  const done = await waitUntil(`${statusLineIs(COPY[lang].saved)} && __native.pane().recovery.length === 0`, 6000);
  await delay(400);
  const frames = await stopFrames();
  const after = await snap(since);
  check(`${id}:remaining-member-completes-and-the-pass-settles`, done && after.physical[KEY.density] === '"compact"' && after.physical[KEY.accentHue] === "230" && cleanPane(after.pane, lang, COPY[lang].saved), { physical: after.physical, pane: after.pane });
  const violations = retryAllFrameViolations(frames);
  check(`${id}:frame-invariants-hold`, frames.length > 0 && violations.length === 0, { violations: violations.slice(0, 3) });
  record("retry-all-late-completion", { id, after: "per-field Discard", themeAttempts: brief(late.attempts.filter((entry) => entry.key === KEY.theme)), committedTheme });
  await endSegment(segment, ZERO);
}

/** Discard all during an open pass: every member detached, focus to Reset, late completions ignored. */
async function e26DiscardAllDuringPass(lang) {
  const id = `retryall:${lang}:discard-all-during-open-pass`;
  await seed(seedsOf({ lang }), id);
  await mountApp(id);
  await failTopbar("theme", "dark", `${id}:topbar-theme`);
  await failPane("density", "compact", `${id}:pane-density`, lang);
  await failPane("accentHue", 230, `${id}:pane-accent`, lang);
  const segment = await beginSegment(id);
  await evaluate("__native.restore()");
  const themeLock = LOCK_OF("theme");
  const densityLock = LOCK_OF("density");
  await evaluate(`__native.hold(${JSON.stringify(themeLock)}).then(() => __native.hold(${JSON.stringify(densityLock)}))`);
  const since = await mark();
  await startFrames();
  await clickTestId("appearance-retry-all", `${id}:retry-all`);
  pre(`${id}:pass-open-two-members-held`, await waitUntil(`${statusLineIs(COPY[lang].retrying)} && ${recoveryIs(blocks(lang, { theme: "saving", density: "saving" }))}`, 6000));
  await delay(300);
  const discardMark = await mark();
  await clickTestId("appearance-discard-all", `${id}:discard-all`);
  pre(`${id}:all-detached`, await waitUntil("__native.pane().recovery.length === 0", 4000));
  await delay(300);
  const detached = await snap(discardMark);
  const warning = await warn();
  check(`${id}:discard-all-detaches-every-member-zero-writes-focus-to-reset`, mutations(detached.attempts).length === 0 && detached.focus?.testid === "appearance-reset-defaults" && !detached.focus.isBody
    && !RETRYING_LINES.includes(detached.pane.statusLine.text) && !detached.pane.statusLine.text.includes(COPY[lang].count(1).slice(2, 6)) && cleanPane(detached.pane, lang, detached.pane.statusLine.text)
    && detached.topbar.status === null && warning.warned === false && warning.listeners === 0, { mutations: brief(mutations(detached.attempts)), focus: detached.focus, pane: detached.pane, warning });
  const lineAfterDiscardAll = detached.pane.statusLine.text;
  const lateMark = await mark();
  await evaluate(`__native.release(${JSON.stringify(themeLock)}).then(() => __native.release(${JSON.stringify(densityLock)}))`);
  await delay(1000);
  const late = await snap(lateMark);
  const committed = shownOf({ lang, accentHue: 230, ...(late.physical[KEY.theme] ? { theme: JSON.parse(late.physical[KEY.theme]) } : {}), ...(late.physical[KEY.density] ? { density: JSON.parse(late.physical[KEY.density]) } : {}) });
  const lateWarning = await warn();
  check(`${id}:late-completions-ignored-no-draft-revived-no-success-claim`, late.pane.recovery.length === 0 && late.pane.statusLine.text === lineAfterDiscardAll && !SUCCESS_LINES.includes(late.pane.statusLine.text)
    && late.topbar.status === null && lateWarning.warned === false && paneMatches(late.pane.values, committed) && htmlMatches(late.html, committed), { statusLine: late.pane.statusLine, values: late.pane.values, physical: late.physical, committed });
  const frames = await stopFrames();
  const violations = retryAllFrameViolations(frames);
  check(`${id}:frame-invariants-hold`, frames.length > 0 && violations.length === 0, { violations: violations.slice(0, 3) });
  record("retry-all-late-completion", { id, after: "Discard all", lineAfterDiscardAll, lateAttempts: brief(sevenMutations(late.attempts)), physical: late.physical });
  await endSegment(segment, ZERO);
}

/** Failed Reset items only: Retry all re-attempts each removal once and never writes; "Defaults restored." after the batch completes. */
async function e26ResetItemsOnly(lang, activation) {
  const id = `retryall:${lang}:failed-reset-items-${activation.toLowerCase()}`;
  const stored = { lang, theme: "dark", density: "compact", accentHue: 230, bgTone: "mist", railPos: "right", fontScale: 1.1 };
  await seed(seedsOf(stored), id);
  await mountApp(id);
  await evaluate(`__native.denyRemove(${JSON.stringify([KEY.theme, KEY.bgTone])})`);
  await clickReset(id, true, lang);
  pre(`${id}:two-failed-reset-items`, await waitUntil(recoveryIs(blocks(lang, { theme: "not-reset", bgTone: "not-reset" })), 6000), { pane: await evaluate("__native.pane()") });
  const segment = await beginSegment(id);
  const before = await snap(0);
  check(`${id}:failed-reset-items-are-eligible`, draftPane(before.pane, lang, COPY[lang].count(2), true) && topbarStatusShown(before.topbar, lang) && before.physical[KEY.theme] === '"dark"' && before.physical[KEY.bgTone] === "mist", { pane: before.pane });
  await evaluate("__native.restore()");
  await tabTo("appearance-retry-all", id);
  const since = await mark();
  await startFrames();
  await press(activation);
  const done = await waitUntil(`${statusLineIs(COPY[lang].restored)} && __native.pane().recovery.length === 0`, 6000);
  await delay(400);
  const frames = await stopFrames();
  const after = await snap(since);
  const observed = attemptsByKey(after.attempts);
  const expected = { ...Object.fromEntries(SEVEN.map((key) => [key, []])), [KEY.theme]: ["remove::ok"], [KEY.bgTone]: ["remove::ok"] };
  check(`${id}:one-removal-per-failed-item-never-a-write`, done && isDeepStrictEqual(observed, expected) && otherMutations(after.attempts).length === 0, { observed, expected });
  check(`${id}:six-keys-absent-language-kept`, SIX.every((key) => after.physical[key] === null) && after.physical[KEY.lang] === ENC.lang(lang), { physical: after.physical });
  const warning = await warn();
  check(`${id}:defaults-restored-retry-all-disabled-focus-kept-no-topbar-status`, cleanPane(after.pane, lang, COPY[lang].restored) && after.focus?.testid === "appearance-retry-all" && after.topbar.status === null && warning.warned === false && warning.listeners === 0,
    { pane: after.pane, focus: after.focus, warning });
  const violations = retryAllFrameViolations(frames, { focusFrom: 0 });
  const firstSuccess = frames.find((frame) => SUCCESS_LINES.includes(frame.statusLine));
  check(`${id}:per-frame-defaults-restored-only-after-both-verified-removals`, violations.length === 0 && Boolean(firstSuccess) && firstSuccess.statusLine === COPY[lang].restored && SIX.every((key) => firstSuccess.bytes[key] === null),
    { violations: violations.slice(0, 3), firstSuccess: firstSuccess ? { statusLine: firstSuccess.statusLine, bytes: firstSuccess.bytes } : null });
  await endSegment(segment, ZERO);
}

// ---------------------------------------------------------------------------------------------------
// E13: downstream (contract §10 items 2–7), production App composition, fixed and 5cd63ff
// ---------------------------------------------------------------------------------------------------
async function runDownstream() {
  if (selected("bytes-fixed")) await downstreamBytesFixedWrites();
  if (selected("bytes-before")) await downstreamBytesBeforeWrites();
  if (selected("display")) await downstreamDisplayTruth();
  if (selected("crash")) await downstreamCrashSafety();
  if (selected("cross-document")) await downstreamCrossDocument();
  if (selected("chrome")) await downstreamChromeInvariance();
  if (selected("isolation")) await downstreamIsolation();
}
/** A document that is not the App (NotFoundPage, the account gate): the same bundle and prelude, its own readiness. */
async function mountPlain(label, path, readyExpression, variant = "fixed", page = main) {
  currentVariant = variant;
  await endDocument(page, "before-plain");
  page.variant = variant;
  await navigatePage(page, `${origin}${path}`);
  pre(`${label}:document-ready`, await waitUntil(readyExpression, 15000, page), { path, body: await evaluate("(document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 200)", page).catch(() => null) });
  await delay(400);
}
const NOT_FOUND_READY = "(!!window.verify && !!document.querySelector('main.host-page h1') && document.querySelector('main.host-page h1').textContent.trim() === 'Not Found')";
const GATE_READY = "(!!window.verify && !!document.querySelector('.account-data-gate h1'))";
/** Version-agnostic pane controls (the 5cd63ff pane has the same control classes, without data-appearance-control). */
async function clickPaneControlAnyVersion(field, value, label) {
  const uiLang = await evaluate("__native.uiLang()");
  if (field === "accentHue") {
    const preset = labels.presets.find((entry) => entry.hue === value);
    return clickOne(`[...document.querySelectorAll(${JSON.stringify(`${PANE} .accent-sw`)})].filter((b) => b.getAttribute("aria-label") === ${JSON.stringify(preset[uiLang])})`, label);
  }
  if (field === "railPos") return clickOne(`[...document.querySelectorAll(${JSON.stringify(`${PANE} .rail-pos-card.rp-${value}`)})]`, label);
  if (field === "bgTone") return clickOne(`[...document.querySelectorAll(${JSON.stringify(`${PANE} .bg-tone-card.bgt-${value}`)})]`, label);
  throw Error(`No version-agnostic control for ${field}`);
}
async function focusFontSliderAnyVersion(label) {
  const uiLang = await evaluate("__native.uiLang()");
  const name = uiLang === "zh" ? "字体大小" : "Font scale";
  await clickOne(`[...document.querySelectorAll(${JSON.stringify(`${PANE} .setting-row`)})].filter((row) => !!row.querySelector('input[type="range"][aria-label=${JSON.stringify(name)}]')).map((row) => row.querySelector(".sr-label"))`, `${label}:font-row-label`);
  await press("Tab");
  const focused = await evaluate(`document.activeElement?.getAttribute("aria-label") === ${JSON.stringify(name)}`);
  pre(`${label}:font-slider-focused-by-trusted-tab`, focused);
}
async function languageFacts(page = main) {
  return evaluate(`(() => ({
    uiLang: __native.uiLang(),
    rail: verify.rail(),
    triggerTitle: document.querySelector(".topbar .topbar-pref-trigger")?.getAttribute("title") ?? null,
    search: document.querySelector(".topbar button.search-box")?.getAttribute("aria-label") ?? null,
    paneTitle: document.querySelector(".appearance-pane .pane-title")?.textContent.trim() ?? null,
    rowLabels: [...document.querySelectorAll(".appearance-pane .setting-row .sr-label")].map((element) => element.textContent.trim()),
    sidebar: [...document.querySelectorAll(".settings-sidebar .list-row")].map((row) => row.textContent.trim()),
  }))()`, page);
}
function languageIs(facts, lang) {
  const nav = Object.values(labels[lang].nav);
  const rows = [labels[lang].language, labels[lang].theme, labels[lang].density, labels[lang].accent, labels[lang].bg, labels[lang].rail, labels[lang].font];
  return facts.uiLang === lang && facts.rail.length > 0 && facts.rail.every((label) => nav.includes(label)) && facts.triggerTitle === labels[lang].appearance && facts.search === labels[lang].search
    && (facts.paneTitle === null || facts.paneTitle === labels[lang].appearance) && (facts.rowLabels.length === 0 || isDeepStrictEqual(facts.rowLabels, rows));
}

/** §10 item 2: every root value written by the fixed product is read back identically in a new document. */
async function downstreamBytesFixedWrites() {
  const VALUES = [
    { field: "lang", value: "zh", via: "pane" }, { field: "lang", value: "en", via: "topbar" },
    { field: "theme", value: "dark", via: "pane" }, { field: "theme", value: "system", via: "topbar" }, { field: "theme", value: "light", via: "pane" },
    { field: "density", value: "compact", via: "topbar" }, { field: "density", value: "comfortable", via: "pane" },
    { field: "fontScale", value: 0.85, via: "key", key: "Home" },
    ...[0.9, 0.95, 1, 1.05, 1.1, 1.15].map((value) => ({ field: "fontScale", value, via: "key", key: "ArrowRight" })),
  ];
  pre("downstream:bytes-fixed:fourteen-root-values", VALUES.length === 14);
  let stored = { lang: "en" };
  await seed(seedsOf(stored), "downstream:bytes-fixed");
  for (const [index, step] of VALUES.entries()) {
    const id = `downstream:bytes-fixed:${String(index + 1).padStart(2, "0")}:${step.field}=${step.value}`;
    await mountApp(`${id}:write`);
    const segment = await beginSegment(`${id}:write`);
    if (step.via === "pane") await clickPaneValue(step.field, step.value, id);
    else if (step.via === "topbar") await chooseTopbar(step.field, step.value, id);
    else { await focusSlider("fontScale", id); await press(step.key); }
    const raw = ENC[step.field](step.value);
    pre(`${id}:written-by-the-fixed-product`, await waitUntil(`__native.native.get(${JSON.stringify(KEY[step.field])}) === ${JSON.stringify(raw)}`, 6000));
    await delay(300);
    if (step.via === "topbar") await closeTopbar(id);
    const written = await snap(segment.mark);
    check(`${id}:exact-bytes-one-write`, opsOn(written.attempts, "set", KEY[step.field]).length === 1 && sevenMutations(written.attempts).length === 1 && written.physical[KEY[step.field]] === raw, { attempts: brief(sevenMutations(written.attempts)) });
    await endSegment(segment, ZERO);
    stored = { ...stored, [step.field]: step.value };
    await mountPlain(`${id}:not-found`, "/no-such-route", NOT_FOUND_READY);
    const read = await evaluate(`verify.readLocalPref(${JSON.stringify(KEY[step.field])}, ${JSON.stringify(DEFAULTS[step.field])})`);
    const html = await evaluate("__native.html()");
    check(`${id}:read-back-identically-by-the-unchanged-readLocalPref-in-a-new-document`, isDeepStrictEqual(read, step.value), { read, value: step.value, raw });
    if (step.field === "theme") check(`${id}:not-found-page-applies-the-written-theme-in-a-new-document`, html.theme === resolveTheme(step.value, html.prefersDark), { html, value: step.value });
    if (step.field === "lang") {
      await evaluate(`__native.native.remove(${JSON.stringify(MARKER_KEY)})`);
      await mountPlain(`${id}:gate`, "/app/calendar", GATE_READY);
      const gate = await evaluate("verify.gate()");
      check(`${id}:account-storage-gate-shows-the-written-language-in-a-new-document`, gate.heading === (step.value === "zh" ? "选择如何开始" : "Choose how to start"), { gate });
      await evaluate(`__native.native.set(${JSON.stringify(MARKER_KEY)}, ${JSON.stringify(MARKER)})`);
    }
    record("byte-compatibility", { direction: "fixed-writes", field: step.field, value: step.value, raw, readLocalPref: read, notFoundTheme: step.field === "theme" ? html.theme : null });
  }
}

/** §10 item 2: values written by 5cd63ff (trusted input) are read identically by the fixed product in a new document. */
async function downstreamBytesBeforeWrites() {
  const SETS = [
    { name: "set-1-en", start: { lang: "en" }, steps: [
      { field: "theme", value: "dark", via: "topbar" }, { field: "density", value: "compact", via: "topbar" }, { field: "fontScale", value: 1.05, via: "key", key: "ArrowRight" },
      { field: "accentHue", value: 35, via: "pane" }, { field: "railPos", value: "right", via: "pane" }, { field: "bgTone", value: "mist", via: "pane" }],
    final: { lang: "en", theme: "dark", density: "compact", fontScale: 1.05, accentHue: 230, railPos: "right", bgTone: "mist" } },
    { name: "set-2-zh", start: { lang: "en" }, steps: [
      { field: "lang", value: "zh", via: "topbar" }, { field: "theme", value: "system", via: "topbar" }, { field: "density", value: "comfortable", via: "topbar" }, { field: "fontScale", value: 0.85, via: "key", key: "Home" },
      { field: "bgTone", value: "graphite", via: "pane" }, { field: "accentHue", value: 355, via: "pane" }, { field: "railPos", value: "bottom", via: "pane" }],
    final: { lang: "zh", theme: "system", density: "comfortable", fontScale: 0.85, accentHue: 355, railPos: "bottom", bgTone: "graphite" } },
  ];
  for (const set of SETS) {
    const id = `downstream:bytes-5cd63ff:${set.name}`;
    await seed(seedsOf(set.start), id);
    await mountApp(`${id}:5cd63ff`, { variant: "before" });
    const segment = await beginSegment(`${id}:5cd63ff-writes`);
    for (const step of set.steps) {
      const label = `${id}:5cd63ff:${step.field}=${step.value}`;
      if (step.via === "topbar") { await chooseTopbar(step.field, step.value, label); await closeTopbar(label); await parkMouse(); }
      else if (step.via === "key") { await focusFontSliderAnyVersion(label); await press(step.key); }
      else await clickPaneControlAnyVersion(step.field, step.value, label);
      const key = KEY[step.field];
      pre(`${label}:written-by-5cd63ff`, await waitUntil(`__native.native.get(${JSON.stringify(key)}) === ${JSON.stringify(ENC[step.field](step.value))}`, 6000));
      await delay(200);
    }
    const written = await bytesOf();
    pre(`${id}:5cd63ff-wrote-the-expected-bytes`, isDeepStrictEqual(written, rawOf(set.final)), { written, expected: rawOf(set.final) });
    await endSegment(segment, null, { reference: true });
    await mountApp(`${id}:fixed`);
    const fixedSegment = await beginSegment(`${id}:fixed-reads`);
    const now = await snap(0);
    const reads = await evaluate(`({ lang: verify.readLocalPref("xai_pref_lang", "en"), theme: verify.readLocalPref("xai_pref_theme", "light"), density: verify.readLocalPref("xai_pref_density", "comfortable"), fontScale: verify.readLocalPref("xai_pref_font_scale", 1) })`);
    check(`${id}:fixed-product-displays-and-applies-the-5cd63ff-bytes`, paneMatches(now.pane.values, set.final) && htmlMatches(now.html, set.final) && now.topbar.summary === summaryFor(set.final) && now.uiLang === set.final.lang
      && cleanPane(now.pane, set.final.lang, "") && now.topbar.status === null, { pane: now.pane.values, html: now.html, summary: now.topbar.summary, expected: set.final });
    check(`${id}:zero-writes-bytes-identical`, sevenMutations(now.attempts).length === 0 && isDeepStrictEqual(now.physical, written), { mutations: brief(sevenMutations(now.attempts)), physical: now.physical, written });
    check(`${id}:readLocalPref-reads-the-same-values`, isDeepStrictEqual(reads, { lang: set.final.lang, theme: set.final.theme, density: set.final.density, fontScale: set.final.fontScale }), { reads });
    record("byte-compatibility", { direction: "5cd63ff-writes-fixed-reads", set: set.name, written, reads });
    await endSegment(fixedSegment, ZERO);
  }
}

/** §10 item 3: display truth (system resolution and listener, drafts everywhere, committed bytes after Discard/Reload, one controller). */
async function downstreamDisplayTruth() {
  const emulate = (scheme) => main.cdp("Emulation.setEmulatedMedia", { features: scheme ? [{ name: "prefers-color-scheme", value: scheme }] : [] });
  {
    const id = "downstream:display:system-committed";
    await seed(seedsOf({ lang: "en", theme: "system" }), id);
    await mountApp(id);
    const segment = await beginSegment(id);
    const results = [];
    for (const scheme of ["dark", "light", "dark"]) {
      await emulate(scheme);
      const followed = await waitUntil(`document.documentElement.getAttribute("data-theme") === ${JSON.stringify(scheme)}`, 3000);
      results.push({ scheme, followed, html: await evaluate("__native.html()"), summary: (await evaluate("__native.topbar()")).summary });
    }
    check(`${id}:system-resolution-follows-the-media-query-listener`, results.every((entry) => entry.followed && entry.html.prefersDark === (entry.scheme === "dark") && entry.summary === summaryFor(shownOf({ lang: "en", theme: "system" }))), { results });
    await endSegment(segment, ZERO);
  }
  {
    const id = "downstream:display:system-draft-then-discard";
    await seed(seedsOf({ lang: "en", theme: "light" }), id);
    await mountApp(id);
    const segment = await beginSegment(id);
    await emulate("dark");
    await failTopbar("theme", "system", `${id}:topbar-system`);
    const drafted = [];
    for (const scheme of ["dark", "light", "dark"]) {
      await emulate(scheme);
      drafted.push({ scheme, followed: await waitUntil(`document.documentElement.getAttribute("data-theme") === ${JSON.stringify(scheme)}`, 3000) });
    }
    check(`${id}:a-system-draft-is-resolved-and-follows-the-listener`, drafted.every((entry) => entry.followed), { drafted });
    await evaluate("__native.restore()");
    await clickButton(COPY.en.discardName(COPY.en.label.theme));
    pre(`${id}:discarded`, await waitUntil("__native.pane().recovery.length === 0", 4000));
    const committed = [];
    for (const scheme of ["dark", "light", "dark"]) {
      await emulate(scheme);
      await delay(400);
      committed.push({ scheme, html: await evaluate("__native.html()"), pane: (await evaluate("__native.paneValues()")).theme, summary: (await evaluate("__native.topbar()")).summary });
    }
    check(`${id}:after-discard-the-committed-light-is-displayed-and-no-longer-follows-the-listener`, committed.every((entry) => entry.html.theme === "light" && entry.pane === "light" && entry.summary === summaryFor(shownOf({ lang: "en" }))), { committed });
    await emulate(null);
    await endSegment(segment, ZERO);
  }
  {
    const id = "downstream:display:seven-drafts-then-discard-all";
    const committed = { lang: "en", theme: "light", density: "comfortable", fontScale: 1, accentHue: 165, railPos: "left", bgTone: "default" };
    await seed(seedsOf(committed), id);
    await mountApp(id);
    const segment = await beginSegment(id);
    const before = await languageFacts();
    pre(`${id}:english-strings-at-load`, languageIs(before, "en"), { before });
    await evaluate(`__native.denySet(${JSON.stringify(SEVEN)})`);
    await clickPaneValue("lang", "zh", `${id}:lang-zh`);
    pre(`${id}:lang-draft`, await waitUntil(blockIs("zh", "lang", "not-saved"), 6000));
    await chooseTopbar("theme", "dark", `${id}:topbar-dark`);
    await closeTopbar(id);
    await parkMouse();
    await clickPaneValue("density", "compact", `${id}:density`);
    await clickPaneValue("bgTone", "peach", `${id}:bg-peach`);
    await clickPaneValue("accentHue", 295, `${id}:accent`);
    await clickPaneValue("railPos", "top", `${id}:rail-top`);
    await focusSlider("fontScale", `${id}:font`);
    await press("ArrowRight");
    await press("ArrowRight");
    const drafts = { lang: "zh", theme: "dark", density: "compact", fontScale: 1.1, accentHue: 295, railPos: "top", bgTone: "peach" };
    const allSeven = blocks("zh", Object.fromEntries(FIELDS.map((field) => [field, "not-saved"])));
    pre(`${id}:seven-failed-drafts`, await waitUntil(recoveryIs(allSeven), 6000), { pane: await evaluate("__native.pane()") });
    await openTopbar(`${id}:inspect`);
    const now = await snap(segment.mark);
    await closeTopbar(`${id}:inspect`);
    await parkMouse();
    const zh = await languageFacts();
    check(`${id}:drafts-displayed-and-applied-everywhere`, paneMatches(now.pane.values, drafts) && htmlMatches(now.html, drafts) && now.topbar.summary === summaryFor(drafts) && isDeepStrictEqual(checkedOf(now.topbar), checkedFor(drafts)),
      { pane: now.pane.values, html: now.html, summary: now.topbar.summary, checked: checkedOf(now.topbar) });
    check(`${id}:the-language-of-every-string-follows-the-language-draft`, languageIs(zh, "zh"), { zh });
    await evaluate("__native.restore()");
    const discardMark = await mark();
    await clickTestId("appearance-discard-all", `${id}:discard-all`);
    pre(`${id}:discarded`, await waitUntil("__native.pane().recovery.length === 0", 4000));
    await delay(400);
    await openTopbar(`${id}:inspect-after`);
    const after = await snap(discardMark);
    await closeTopbar(`${id}:inspect-after`);
    await parkMouse();
    const en = await languageFacts();
    check(`${id}:after-discard-all-the-committed-bytes-everywhere-zero-writes`, paneMatches(after.pane.values, committed) && htmlMatches(after.html, committed) && after.topbar.summary === summaryFor(committed) && isDeepStrictEqual(checkedOf(after.topbar), checkedFor(committed))
      && mutations(after.attempts).length === 0 && isDeepStrictEqual(after.physical, rawOf(committed)), { pane: after.pane.values, html: after.html, summary: after.topbar.summary, mutations: brief(mutations(after.attempts)) });
    check(`${id}:the-language-of-every-string-returns-to-the-committed-language`, languageIs(en, "en"), { en });
    record("display-language", { zh, en });
    await endSegment(segment, ZERO);
  }
  {
    const id = "downstream:display:reload-shows-the-committed-bytes";
    await seed({ ...seedsOf({ lang: "en" }), [KEY.railPos]: "diagonal" }, id);
    await mountApp(id, { productCrash: true });
    const segment = await beginSegment(id);
    pre(`${id}:source-only`, isDeepStrictEqual((await evaluate("__native.pane()")).recovery, blocks("en", { railPos: "unavailable" })));
    await externalDocument(`localStorage.setItem("xai_rail_pos", "top"); localStorage.getItem("xai_rail_pos")`, `${id}:external-valid-bytes`);
    await delay(500);
    const reloadMark = await mark();
    observe(`${id}:state-after-the-valid-external-write-before-reload`, { pane: await evaluate("__native.pane()"), html: await evaluate("__native.html()") });
    const stillAlert = (await evaluate("__native.pane()")).recovery.length > 0;
    if (stillAlert) await clickButton(COPY.en.reloadName(COPY.en.label.railPos));
    pre(`${id}:repaired`, await waitUntil("__native.pane().recovery.length === 0", 4000));
    await delay(300);
    const after = await snap(reloadMark);
    const shown = shownOf({ lang: "en", railPos: "top" });
    check(`${id}:committed-bytes-displayed-and-applied-zero-writes`, paneMatches(after.pane.values, shown) && htmlMatches(after.html, shown) && after.pane.statusLine.text === "" && mutations(after.attempts).length === 0,
      { pane: after.pane.values, html: after.html, statusLine: after.pane.statusLine, reloadClicked: stillAlert });
    observe(`${id}:repair-path`, { reloadClicked: stillAlert });
    await endSegment(segment, ZERO);
  }
  {
    const id = "downstream:display:one-controller-same-frame";
    await seed(seedsOf({ lang: "en" }), id);
    await mountApp(id);
    const segment = await beginSegment(id);
    await startFrames();
    await clickPaneValue("theme", "dark", `${id}:pane-dark`);
    pre(`${id}:pane-edit-saved`, await waitUntil(`${statusLineIs(COPY.en.saved)} && __native.native.get("xai_pref_theme") === ${JSON.stringify('"dark"')}`, 6000));
    await delay(200);
    const paneFrames = await stopFrames();
    const firstPane = paneFrames.find((frame) => frame.pane?.theme === "dark");
    const firstTopbar = paneFrames.find((frame) => decodeSummary(frame.summary)?.theme === "dark");
    check(`${id}:a-pane-edit-is-visible-in-the-topbar-in-the-same-frame`, Boolean(firstPane) && Boolean(firstTopbar) && firstPane.seq === firstTopbar.seq && firstPane.htmlTheme === "dark",
      { firstPane: firstPane?.seq, firstTopbar: firstTopbar?.seq, frames: paneFrames.length });
    await openTopbar(id);
    await startFrames();
    await chooseTopbar("density", "compact", `${id}:topbar-compact`);
    pre(`${id}:topbar-edit-saved`, await waitUntil(`${statusLineIs(COPY.en.saved)} && __native.native.get("xai_pref_density") === ${JSON.stringify('"compact"')}`, 6000));
    await delay(200);
    const topbarFrames = await stopFrames();
    await closeTopbar(id);
    const firstSummary = topbarFrames.find((frame) => decodeSummary(frame.summary)?.density === "compact");
    const firstPaneDensity = topbarFrames.find((frame) => frame.pane?.density === "compact");
    const prefersDark = (await evaluate("__native.html()")).prefersDark;
    check(`${id}:a-topbar-edit-is-visible-in-the-pane-in-the-same-frame`, Boolean(firstSummary) && Boolean(firstPaneDensity) && firstSummary.seq === firstPaneDensity.seq && firstSummary.htmlDensity === "compact"
      && frameAgreement(paneFrames, prefersDark).length === 0 && frameAgreement(topbarFrames, prefersDark).length === 0, { firstSummary: firstSummary?.seq, firstPane: firstPaneDensity?.seq, frames: topbarFrames.length });
    await endSegment(segment, ZERO);
  }
}

/** §10 item 4: crash safety for every §5 item 2 value at load, the ten E4 crashing values on several routes, and cross-document writes. */
async function downstreamCrashSafety() {
  const crashing = new Set(CRASHING.map(([field, raw]) => `${field}:${raw}`));
  const slug = (raw) => (raw === "" ? "empty" : raw.replace(/[^A-Za-z0-9.-]+/g, "_").replace(/^_+|_+$/g, "") || "x");
  const outcomes = [];
  let index = 0;
  for (const [field, values] of Object.entries(MALFORMED)) {
    for (const raw of values) {
      index += 1;
      const id = `downstream:crash:${String(index).padStart(2, "0")}:${field}:${JSON.stringify(raw)}`;
      const others = { ...VALID_OTHERS };
      delete others[field];
      await seed({ ...seedsOf(others), [KEY[field]]: raw }, id);
      await mountApp(id, { path: "/app/calendar", productCrash: true });
      const segment = await beginSegment(id);
      const shown = { ...VALID_OTHERS, [field]: DEFAULTS[field] };
      const expectedRaw = { ...rawOf(others), [KEY[field]]: raw };
      const now = await snap(0);
      check(`${id}:app-renders-defaults-applied-zero-writes`, now.routeError === null && htmlMatches(now.html, shown) && now.topbar.summary === summaryFor(shown) && now.uiLang === shown.lang && now.topbar.status === null
        && sevenMutations(now.attempts).length === 0 && isDeepStrictEqual(now.physical, expectedRaw), { routeError: now.routeError, html: now.html, summary: now.topbar.summary, mutations: brief(sevenMutations(now.attempts)), physical: now.physical });
      const outcome = { field, raw, crashingAt5cd63ff: crashing.has(`${field}:${raw}`), calendar: "rendered" };
      if (outcome.crashingAt5cd63ff) {
        outcome.screenshot = await screenshot(`crash-${field}-${slug(raw)}-en`);
        await railClick(labels[shown.lang].tasks, `${id}:apprail-tasks`);
        const tasks = await waitUntil(`verify.location().pathname === "/app/tasks" && !__native.routeError() && !!document.querySelector(".app header.topbar")`, 5000);
        await navigateProgrammatic("/app/settings/appearance");
        const pane = await waitUntil(`${READY_PANE} && verify.location().pathname === "/app/settings/appearance" && !__native.routeError()`, 5000);
        await delay(300);
        const settled = await snap(0);
        check(`${id}:every-app-route-keeps-working-tasks-and-the-appearance-pane`, tasks && pane && settled.routeError === null && isDeepStrictEqual(settled.pane.recovery, blocks(shown.lang, { [field]: "unavailable" })) && paneMatches(settled.pane.values, shown),
          { tasks, pane, recovery: settled.pane.recovery, values: settled.pane.values });
        outcome.routes = ["/app/calendar", "/app/tasks", "/app/settings/appearance"];
      }
      outcomes.push(outcome);
      await endSegment(segment, null);
    }
  }
  for (const [field, raw] of CRASHING.filter(([crashField]) => crashField !== "lang")) {
    const id = `downstream:crash-zh:${field}:${JSON.stringify(raw)}`;
    const others = { ...VALID_OTHERS, lang: "zh" };
    delete others[field];
    await seed({ ...seedsOf(others), [KEY[field]]: raw }, id);
    await mountApp(id, { path: "/app/calendar", productCrash: true });
    const segment = await beginSegment(id);
    const shown = { ...VALID_OTHERS, lang: "zh", [field]: DEFAULTS[field] };
    const now = await snap(0);
    check(`${id}:app-renders-in-zh-defaults-applied-zero-writes`, now.routeError === null && htmlMatches(now.html, shown) && now.topbar.summary === summaryFor(shown) && now.uiLang === "zh" && sevenMutations(now.attempts).length === 0,
      { routeError: now.routeError, html: now.html, summary: now.topbar.summary });
    outcomes.push({ field, raw, lang: "zh", screenshot: await screenshot(`crash-${field}-${slug(raw)}-zh`) });
    await endSegment(segment, null);
  }
  const RUNTIME = [["lang", '"fr"'], ["theme", '"neon"'], ["density", "{}"], ["fontScale", '"big"'], ["accentHue", "Infinity"], ["railPos", "diagonal"], ["bgTone", "sage"], ["lang", '"EN"'], ["fontScale", "0"]];
  for (const [field, raw] of RUNTIME) {
    const id = `downstream:crash-cross-document:${field}:${JSON.stringify(raw)}`;
    await seed(seedsOf(VALID_OTHERS), id);
    await mountApp(id);
    const segment = await beginSegment(id);
    const since = await mark();
    await externalDocument(`localStorage.setItem(${JSON.stringify(KEY[field])}, ${JSON.stringify(raw)}); localStorage.getItem(${JSON.stringify(KEY[field])})`, id);
    const lang = field === "lang" ? "en" : VALID_OTHERS.lang;
    const settled = await waitUntil(recoveryIs(blocks(lang, { [field]: "unavailable" })), 6000);
    await delay(500);
    const after = await snap(since);
    const shown = { ...VALID_OTHERS, [field]: DEFAULTS[field] };
    check(`${id}:running-app-keeps-rendering-idle-field-in-its-source-state-without-a-throw`, settled && after.routeError === null && paneMatches(after.pane.values, shown) && htmlMatches(after.html, shown) && after.topbar.summary === summaryFor(shown)
      && sevenMutations(after.attempts).length === 0 && after.physical[KEY[field]] === raw && runtimeErrors.length === segment.errorsAt && after.received.some((entry) => entry.key === KEY[field] && entry.trusted && entry.newValue === raw)
      && after.topbar.status === null, { settled, routeError: after.routeError, recovery: after.pane.recovery, values: after.pane.values, html: after.html, physical: after.physical, errors: runtimeErrors.slice(segment.errorsAt, segment.errorsAt + 3) });
    outcomes.push({ field, raw, crossDocument: true, ...(field === "accentHue" ? { screenshot: await screenshot("crash-cross-document-accent-infinity-en") } : {}) });
    await endSegment(segment, ZERO);
  }
  record("crash-safety", { outcomes, crashingValues: CRASHING.map(([field, raw]) => `${field}=${raw}`) });
}

/** §10 item 5: all seven fields propagate live to an idle second App document; a drafted field becomes a preserved conflict. */
async function downstreamCrossDocument() {
  const id = "downstream:cross-document";
  await seed(seedsOf({ lang: "en" }), id);
  await mountApp(`${id}:doc1`);
  const doc2 = await openPage("doc2");
  await mountApp(`${id}:doc2`, { page: doc2 });
  await main.cdp("Page.bringToFront");
  await delay(300);
  const segment1 = await beginSegment(`${id}:doc1`);
  const segment2 = await beginSegment(`${id}:doc2`, doc2);
  const STEPS = [
    { field: "lang", value: "zh", via: "pane" }, { field: "theme", value: "dark", via: "pane" }, { field: "density", value: "compact", via: "topbar" },
    // The accent step uses 75 so that the background choice (peach, paired accent 35) changes both keys.
    { field: "fontScale", value: 1.05, via: "key", key: "ArrowRight" }, { field: "accentHue", value: 75, via: "pane" }, { field: "railPos", value: "top", via: "pane" }, { field: "bgTone", value: "peach", via: "pane" },
  ];
  let stored = { lang: "en" };
  const propagation = [];
  for (const step of STEPS) {
    const label = `${id}:${step.field}=${step.value}`;
    const next = { ...stored, [step.field]: step.value, ...(step.field === "bgTone" ? { accentHue: TONE_HUE[step.value] } : {}) };
    const shown = shownOf(next);
    const since2 = await mark(doc2);
    if (step.via === "pane") await clickPaneValue(step.field, step.value, label);
    else if (step.via === "topbar") { await chooseTopbar(step.field, step.value, label); await closeTopbar(label); await parkMouse(); }
    else { await focusSlider("fontScale", label); await press(step.key); }
    pre(`${label}:doc1-committed`, await waitUntil(`__native.native.get(${JSON.stringify(KEY[step.field])}) === ${JSON.stringify(ENC[step.field](step.value))}`, 6000));
    const html = htmlFor(shown, false);
    const followed = await waitUntil(`(() => { const html = __native.html(); const pane = __native.paneValues(); return !!pane && pane.lang === ${JSON.stringify(shown.lang)} && pane.theme === ${JSON.stringify(shown.theme)} && pane.density === ${JSON.stringify(shown.density)}
      && pane.fontScale === ${shown.fontScale} && pane.accentHue === ${shown.accentHue} && pane.railPos === ${JSON.stringify(shown.railPos)} && pane.bgTone === ${JSON.stringify(shown.bgTone)}
      && html.density === ${JSON.stringify(html.density)} && html.fontSize === ${JSON.stringify(html.fontSize)} && html.accentHue === ${JSON.stringify(html.accentHue)} && html.railPos === ${JSON.stringify(html.railPos)}; })()`, 6000, doc2);
    await delay(300);
    const second = await snap(since2, doc2);
    const keys = step.field === "bgTone" ? [KEY.bgTone, KEY.accentHue] : [KEY[step.field]];
    check(`${label}:idle-second-document-follows-live`, followed && paneMatches(second.pane.values, shown) && htmlMatches(second.html, shown) && second.topbar.summary === summaryFor(shown) && second.uiLang === shown.lang
      && second.pane.recovery.length === 0 && sevenMutations(second.attempts).length === 0 && keys.every((key) => second.received.some((entry) => entry.key === key && entry.trusted)),
    { pane: second.pane.values, html: second.html, summary: second.topbar.summary, uiLang: second.uiLang, received: second.received, mutations: brief(sevenMutations(second.attempts)) });
    propagation.push({ field: step.field, value: step.value, keys, received: second.received.map((entry) => `${entry.key}=${entry.newValue}`) });
    stored = next;
  }
  record("cross-document-propagation", { propagation });
  // A drafted root field (font scale) in the second document becomes a preserved conflict.
  await doc2.cdp("Page.bringToFront");
  await delay(200);
  await evaluate(`__native.denySet(${JSON.stringify(KEY.fontScale)})`, doc2);
  await focusSlider("fontScale", `${id}:doc2-font`, doc2);
  await press("ArrowLeft", doc2);
  pre(`${id}:doc2-font-draft-failed`, await waitUntil(blockIs("zh", "fontScale", "not-saved"), 6000, doc2));
  await main.cdp("Page.bringToFront");
  await delay(200);
  const since2 = await mark(doc2);
  await focusSlider("fontScale", `${id}:doc1-font`);
  await press("End");
  pre(`${id}:doc1-committed-1.15`, await waitUntil(`__native.native.get("xai_pref_font_scale") === "1.15"`, 6000));
  pre(`${id}:doc2-received-the-commit`, await waitUntil(`__native.window(${since2}).storageReceived.some((entry) => entry.key === "xai_pref_font_scale" && entry.newValue === "1.15" && entry.trusted)`, 5000, doc2));
  await delay(400);
  const conflicted = await snap(since2, doc2);
  check(`${id}:drafted-field-preserved-in-the-second-document`, isDeepStrictEqual(conflicted.pane.recovery, blocks("zh", { fontScale: "not-saved" })) && conflicted.pane.values.fontScale === 1 && conflicted.html.fontSize === "16px"
    && sevenMutations(conflicted.attempts).length === 0, { recovery: conflicted.pane.recovery, values: conflicted.pane.values, html: conflicted.html });
  await doc2.cdp("Page.bringToFront");
  await delay(200);
  await evaluate("__native.restore()", doc2);
  const retryMark = await mark(doc2);
  await clickButton(COPY.zh.retryName(COPY.zh.label.fontScale), PANE, doc2);
  await delay(900);
  const retried = await snap(retryMark, doc2);
  check(`${id}:retry-is-a-preserved-conflict-never-overwrites`, sevenMutations(retried.attempts).length === 0 && retried.physical[KEY.fontScale] === "1.15" && isDeepStrictEqual(retried.pane.recovery, blocks("zh", { fontScale: "not-saved" })),
    { mutations: brief(sevenMutations(retried.attempts)), physical: retried.physical, recovery: retried.pane.recovery });
  await clickButton(COPY.zh.discardName(COPY.zh.label.fontScale), PANE, doc2);
  pre(`${id}:doc2-discarded`, await waitUntil("__native.pane().recovery.length === 0", 4000, doc2));
  await delay(300);
  const discarded = await snap(retryMark, doc2);
  check(`${id}:discard-shows-the-external-value-zero-writes`, mutations(discarded.attempts).length === 0 && discarded.pane.values.fontScale === 1.15 && discarded.html.fontSize === "18.4px", { values: discarded.pane.values, html: discarded.html });
  await main.cdp("Page.bringToFront");
  await endSegment(segment2, ZERO);
  await endSegment(segment1, ZERO);
  await closePage(doc2);
}

/** §10 item 6: clean-state chrome invariance against 5cd63ff (Topbar outerHTML, <html> attributes, .app attributes). */
async function downstreamChromeInvariance() {
  const SEEDSETS = [
    ["absent-en", { [MARKER_KEY]: MARKER }],
    ["stored-en", seedsOf({ lang: "en", theme: "dark", density: "compact", fontScale: 1.1, accentHue: 230, railPos: "right", bgTone: "mist" })],
    ["stored-zh", seedsOf({ lang: "zh", theme: "system", density: "compact", fontScale: 0.9, accentHue: 295, railPos: "bottom", bgTone: "lavender" })],
  ];
  const comparisons = [];
  for (const [setName, seeds] of SEEDSETS) {
    for (const path of ["/app/calendar", "/app/settings/about"]) {
      const captures = {};
      for (const variant of ["before", "fixed"]) {
        const id = `downstream:chrome:${setName}:${path}:${variant}`;
        await seed(seeds, id);
        await mountApp(id, { path, variant });
        const segment = await beginSegment(id);
        const capture = { html: await evaluate('__native.attributes(":root")'), app: await evaluate('__native.attributes(".app")') };
        for (const [width, height] of [[1440, 900], [375, 812]]) {
          await setViewport(width, height);
          await parkMouse();
          capture[`topbar-${width}-closed`] = await evaluate('document.querySelector("header.topbar").outerHTML');
          await openTopbar(`${id}:${width}`);
          await parkMouse();
          capture[`topbar-${width}-open`] = await evaluate('document.querySelector("header.topbar").outerHTML');
          await closeTopbar(`${id}:${width}`);
        }
        await setViewport(1280, 900);
        capture.htmlAfterPopoverRoundTrips = await evaluate('__native.attributes(":root")');
        const now = await snap(segment.mark);
        pre(`${id}:clean-state-no-writes`, sevenMutations(now.attempts).length === 0 && now.topbar.status === null, { mutations: brief(sevenMutations(now.attempts)) });
        captures[variant] = capture;
        await endSegment(segment, ZERO, variant === "before" ? { reference: true } : {});
      }
      for (const item of Object.keys(captures.fixed)) {
        const equal = isDeepStrictEqual(captures.fixed[item], captures.before[item]);
        comparisons.push({ set: setName, path, item, equal, sha256: sha256(JSON.stringify(captures.fixed[item])) });
        check(`downstream:chrome:${setName}:${path}:${item}:identical-to-5cd63ff`, equal, { fixed: captures.fixed[item], before: captures.before[item] });
      }
    }
  }
  record("chrome-invariance", { comparisons });
}

/** §10 item 7: cross-module isolation during and after every Appearance operation. */
async function downstreamIsolation() {
  const id = "downstream:isolation";
  const UNRELATED = {
    xai_pref_features_tasks: "true", xai_pref_features_board: "true", xai_pref_features_dashboard: "true", xai_pref_features_calendar: "true",
    xai_pref_features_matrix: "false", xai_pref_features_pomodoro: "true", xai_pref_features_habits: "false", xai_pref_features_meditation: "true",
    xai_pet_id: "pip",
    xai_pet_pos: JSON.stringify({ x: 300, y: 200 }),
    xai_rail_order: JSON.stringify(["calendar", "tasks", "board", "dashboard", "matrix", "pomodoro", "timetrack", "habits", "meditation", "countdown", "ai", "statistics"]),
    xai_pref_sticky_color: "mint",
    xai_native_unrelated_probe: "keep",
  };
  await seed(seedsOf({ lang: "en", railPos: "right", bgTone: "mist", accentHue: 230 }, UNRELATED), id);
  await mountApp(id);
  const segment = await beginSegment(id);
  async function paletteLabels(label) {
    await trustedClick(".topbar button.search-box", `${label}:search-box`);
    pre(`${label}:palette-opened`, await waitUntil("!!document.querySelector('.cmdk-modal') && document.querySelectorAll('.cmdk-modal .cmdk-list .cmdk-row .cmdk-row-label').length > 0", 4000));
    const listed = await evaluate(`[...document.querySelectorAll(".cmdk-modal .cmdk-list .cmdk-row .cmdk-row-label")].map((element) => element.textContent.replace(/\\s+/g, " ").trim())`);
    await press("Escape");
    pre(`${label}:palette-closed`, await waitUntil("!document.querySelector('.cmdk-modal')", 3000));
    return listed;
  }
  async function routeTruth(label) {
    await navigateProgrammatic("/app/habits");
    const fallback = await waitUntil(`verify.location().pathname === "/app/habits" && document.querySelector(".disabled-feature-fallback")?.getAttribute("data-feature-id") === "habits"`, 5000);
    await navigateProgrammatic("/app/settings/appearance");
    pre(`${label}:back-on-the-pane`, await waitUntil(`${READY_PANE} && verify.location().pathname === "/app/settings/appearance"`, 5000));
    await delay(300);
    return fallback;
  }
  const baseline = { unrelated: await nonSevenSnapshot(), rail: await evaluate("verify.rail()"), pet: await evaluate("__native.petState()"), palette: await paletteLabels(`${id}:baseline`), habitsFallback: await routeTruth(`${id}:baseline`) };
  pre(`${id}:baseline-features-truth`, baseline.habitsFallback && !baseline.palette.includes("Habits") && !baseline.palette.includes("Matrix") && baseline.palette.includes("Tasks") && baseline.palette.includes("Calendar")
    && !baseline.rail.includes(labels.en.nav.habits) && !baseline.rail.includes(labels.en.nav.matrix) && Object.entries(UNRELATED).every(([key, value]) => baseline.unrelated[key] === value), baseline);
  const totals = { operations: 0, storageDispatches: 0, prefChanged: 0, keyNullReceived: 0 };
  async function operation(name, action, { identityAllowed = false, surfacesAfter = true } = {}) {
    const since = await mark();
    const before = await nonSevenSnapshot();
    await action();
    await delay(400);
    const after = await snap(since);
    const unrelated = await nonSevenSnapshot();
    const strip = (snapshot) => { const copy = { ...snapshot }; if (identityAllowed) delete copy[IDENTITY_KEY]; return copy; };
    totals.operations += 1;
    totals.storageDispatches += storageDispatches(after.dispatches).length;
    totals.prefChanged += prefChangedEvents(after.dispatches).length;
    totals.keyNullReceived += after.received.filter((entry) => entry.key === null).length;
    check(`${id}:${name}:zero-storage-event-and-preference-changed-dispatches`, storageDispatches(after.dispatches).length === 0 && prefChangedEvents(after.dispatches).length === 0 && after.received.every((entry) => entry.key !== null),
      { dispatches: after.dispatches.slice(0, 6), received: after.received.slice(0, 6) });
    check(`${id}:${name}:every-other-key-byte-identical`, isDeepStrictEqual(strip(unrelated), strip(before)) && Object.entries(UNRELATED).every(([key, value]) => unrelated[key] === value), { before: strip(before), after: strip(unrelated) });
    if (surfacesAfter) {
      const rail = await evaluate("verify.rail()");
      const pet = await evaluate("__native.petState()");
      check(`${id}:${name}:features-rail-and-desktop-pet-unchanged`, isDeepStrictEqual(rail, baseline.rail) && pet.present && pet.transform === baseline.pet.transform && pet.left === baseline.pet.left && pet.top === baseline.pet.top,
        { rail, pet, baseline: { rail: baseline.rail, pet: baseline.pet } });
    }
    record("isolation-operation", { name, sevenAttempts: summarize(after.attempts.filter((entry) => isSeven(entry.key))), otherMutations: brief(otherMutations(after.attempts)), identityKeyChanged: before[IDENTITY_KEY] !== unrelated[IDENTITY_KEY] });
  }
  await operation("edit", async () => {
    await clickPaneValue("theme", "dark", `${id}:edit`);
    pre(`${id}:edit-saved`, await waitUntil(`${statusLineIs(COPY.en.saved)} && __native.native.get("xai_pref_theme") === ${JSON.stringify('"dark"')}`, 6000));
  });
  await operation("retry", async () => {
    await failPane("density", "compact", `${id}:retry-density`);
    await evaluate("__native.restore()");
    await clickButton(COPY.en.retryName(COPY.en.label.density));
    pre(`${id}:retry-saved`, await waitUntil(`${statusLineIs(COPY.en.saved)} && __native.pane().recovery.length === 0`, 6000));
  });
  await operation("retry-all-full", async () => {
    await failPane("accentHue", 35, `${id}:retry-all-accent`);
    await failPane("railPos", "top", `${id}:retry-all-rail`);
    await evaluate("__native.restore()");
    await clickTestId("appearance-retry-all", `${id}:retry-all-full`);
    pre(`${id}:retry-all-full-saved`, await waitUntil(`${statusLineIs(COPY.en.saved)} && __native.pane().recovery.length === 0`, 6000));
  });
  await operation("retry-all-partial", async () => {
    await failPane("bgTone", "cream", `${id}:partial-bg`);
    await evaluate(`__native.denySet(${JSON.stringify(KEY.fontScale)})`);
    await focusSlider("fontScale", `${id}:partial-font`);
    await press("ArrowRight");
    pre(`${id}:partial-font-failed`, await waitUntil(blockIs("en", "fontScale", "not-saved"), 6000));
    await evaluate(`__native.restore(); __native.denySet(${JSON.stringify(KEY.fontScale)})`);
    await clickTestId("appearance-retry-all", `${id}:retry-all-partial`);
    pre(`${id}:retry-all-partial-result`, await waitUntil(`${statusLineIs(COPY.en.count(1))} && ${recoveryIs(blocks("en", { fontScale: "not-saved" }))}`, 6000));
  });
  await operation("discard", async () => {
    await clickButton(COPY.en.discardName(COPY.en.label.fontScale));
    pre(`${id}:discarded`, await waitUntil("__native.pane().recovery.length === 0", 4000));
    await evaluate("__native.restore()");
  });
  await operation("discard-all", async () => {
    await failPane("theme", "system", `${id}:discard-all-theme`);
    await failPane("density", "comfortable", `${id}:discard-all-density`);
    await clickTestId("appearance-discard-all", `${id}:discard-all`);
    pre(`${id}:all-discarded`, await waitUntil("__native.pane().recovery.length === 0", 4000));
    await evaluate("__native.restore()");
  });
  await operation("reload", async () => {
    await externalDocument(`localStorage.setItem("xai_rail_pos", "diagonal"); localStorage.getItem("xai_rail_pos")`, `${id}:external-malformed-rail`);
    pre(`${id}:rail-source-only`, await waitUntil(recoveryIs(blocks("en", { railPos: "unavailable" })), 5000));
    await clickButton(COPY.en.reloadName(COPY.en.label.railPos));
    await delay(400);
    await externalDocument(`localStorage.setItem("xai_rail_pos", "right"); localStorage.getItem("xai_rail_pos")`, `${id}:external-valid-rail`);
    await delay(400);
    // The source alert is repaired by Reload (as in the display-truth case); a valid external write alone does not clear it.
    if ((await evaluate("__native.pane()")).recovery.length > 0) await clickButton(COPY.en.reloadName(COPY.en.label.railPos));
    pre(`${id}:rail-repaired`, await waitUntil(`__native.pane().recovery.length === 0 && __native.paneValues().railPos === "right"`, 5000));
  });
  await operation("reset-full", async () => {
    await clickReset(`${id}:reset-full`, true);
    pre(`${id}:defaults-restored`, await waitUntil(`${statusLineIs(COPY.en.restored)} && __native.pane().recovery.length === 0`, 6000));
  });
  await operation("reset-partial-and-retry", async () => {
    await clickPaneValue("railPos", "bottom", `${id}:partial-reset-rail`);
    pre(`${id}:rail-saved`, await waitUntil(`__native.native.get("xai_rail_pos") === "bottom" && ${statusLineIs(COPY.en.saved)}`, 6000));
    await evaluate(`__native.denyRemove(${JSON.stringify(KEY.railPos)})`);
    await clickReset(`${id}:reset-partial`, true);
    pre(`${id}:partial-reset`, await waitUntil(recoveryIs(blocks("en", { railPos: "not-reset" })), 6000));
    await evaluate("__native.restore()");
    await clickButton(COPY.en.retryName(COPY.en.label.railPos));
    pre(`${id}:reset-retry-restored`, await waitUntil(`${statusLineIs(COPY.en.restored)} && __native.pane().recovery.length === 0`, 6000));
  });
  await operation("export", async () => {
    await failPane("theme", "dark", `${id}:export-theme`);
    pre(`${id}:download-directory-empty`, visibleDownloads().length === 0);
    await clickTestId("appearance-export-draft", `${id}:export`);
    const download = await awaitDownload();
    pre(`${id}:export-downloaded`, download !== null);
    rmSync(download.file);
    await evaluate("__native.restore()");
  });
  const final = { rail: await evaluate("verify.rail()"), palette: await paletteLabels(`${id}:final`), habitsFallback: await routeTruth(`${id}:final`) };
  check(`${id}:features-rail-route-and-search-truth-unchanged`, isDeepStrictEqual(final.rail, baseline.rail) && isDeepStrictEqual(final.palette, baseline.palette) && final.habitsFallback, { final, baseline: { rail: baseline.rail, palette: baseline.palette } });
  await operation("sign-out-step-cancel", async () => {
    await signOutCancel(`${id}:sign-out`, "en");
    await closeAvatarMenu(`${id}:sign-out`);
  });
  const segmentEnd = await endSegment(segment, null);
  const okSegment = await beginSegment(`${id}:sign-out-ok`);
  await operation("sign-out-step-ok", async () => { await signOutOk(`${id}:sign-out`, "en"); }, { identityAllowed: true, surfacesAfter: false });
  const okEnd = await endSegment(okSegment, null);
  record("isolation-throughout", { ...totals, segmentCounters: segmentEnd.counts, signOutOkCounters: okEnd.counts });
  check(`${id}:throughout-zero-storage-events-zero-preference-broadcasts`, totals.operations === 12 && totals.storageDispatches === 0 && totals.prefChanged === 0 && totals.keyNullReceived === 0, totals);
}


// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
let harnessError = null;
try {
  mkdirSync(downloads);
  const fixedArchive = extractArchive(resolved);
  const beforeArchive = VARIANTS_BY_MODE[mode].some((name) => VARIANTS[name].stage === "before") ? extractArchive(BEFORE_REVISION) : null;
  const sourceHashes = (archive) => Object.fromEntries(Object.keys(CONTRACT_SOURCE_HASHES).map((file) => [file, existsSync(join(archive.snapshot, file)) ? sha256(readFileSync(join(archive.snapshot, file))) : null]));
  const fixedSource = sourceHashes(fixedArchive);
  const contractUnchangedMismatches = Object.entries(CONTRACT_SOURCE_HASHES).filter(([file]) => !UNIT_CHANGED.includes(file)).filter(([file, hash]) => fixedSource[file] !== hash).map(([file]) => file);
  const unitNotChanged = UNIT_CHANGED.filter((file) => fixedSource[file] === CONTRACT_SOURCE_HASHES[file]);
  const beforeSource = beforeArchive ? sourceHashes(beforeArchive) : null;
  const beforeMismatches = beforeSource ? Object.entries(CONTRACT_SOURCE_HASHES).filter(([file, hash]) => beforeSource[file] !== hash).map(([file]) => file) : null;
  for (const name of VARIANTS_BY_MODE[mode]) await buildVariant(name);

  const appPage = (variant) => `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>XAI Web (Appearance native ${mode}, ${variant})</title><link rel="stylesheet" href="/__native/${variant}/bundle.css"><script src="/__native/prelude.js"></script></head><body><div id="root"></div><script type="module" src="/__native/${variant}/bundle.js"></script></body></html>`;
  const seedPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>seed</title><script src="/__native/prelude.js"></script></head><body><p>seed page: prelude only, no product code</p></body></html>';
  const externalPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Independent same-origin document</title></head><body><p>external document: no product code, no instruments</p></body></html>';
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

  await openBrowser();
  await main.cdp("Fetch.enable", { patterns: [{ urlPattern: `${origin}/`, resourceType: "Document", requestStage: "Request" }] });
  const version = await browser.send("Browser.getVersion");
  record("baseline", {
    requested, resolved, resolvedTree, before: BEFORE_REVISION, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix, composition: "production-app", variants: VARIANTS_BY_MODE[mode], rowFilter: ROW_FILTER,
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { archive: sha256(archiveLock), before: sha256(beforeLock), dependencies: sha256(dependencyLock), extractedFixed: sha256(fixedArchive.extractedLock), extractedBefore: beforeArchive ? sha256(beforeArchive.extractedLock) : null, contractGate: LOCKFILE_GATE_SHA256 },
    fileSha256: { [RUNNER]: runnerSha256, [FIXTURE]: sha256(fixtureSource), [PRELUDE]: sha256(preludeSource) },
    contract: { path: CONTRACT_PATH, sha256AtHead: contractSha256, expected: CONTRACT_SHA256 },
    fixedVsBefore: { before: BEFORE_REVISION, productFilesChanged: fixedDelta },
    contractSourceTable: { rows: Object.keys(CONTRACT_SOURCE_HASHES).length, fixedUnchangedRowMismatches: contractUnchangedMismatches, fixedUnitRowsNotChanged: unitNotChanged, beforeMismatches, fixed: fixedSource, before: beforeSource },
    origin: "127.0.0.1 (ephemeral port, this runner's own server); every other host resolves to NOTFOUND",
    devtools: "pipe transport (--remote-debugging-pipe), flattened target sessions; trusted input through Input.dispatchMouseEvent/dispatchKeyEvent (no nativeVirtualKeyCode)",
  });
  pre("baseline:docs-head-product-tree-equals-fixed", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === LOCKFILE_GATE_SHA256 && sha256(archiveLock) === LOCKFILE_GATE_SHA256 && sha256(fixedArchive.extractedLock) === LOCKFILE_GATE_SHA256
    && (!beforeArchive || sha256(beforeArchive.extractedLock) === LOCKFILE_GATE_SHA256));
  pre("baseline:contract-r3-hash", contractSha256 === CONTRACT_SHA256, { contractSha256 });
  pre("baseline:fixed-delta-is-exactly-the-24-terra-files", isDeepStrictEqual([...fixedDelta].sort(), [...EXPECTED_FIXED_DELTA].sort()), { fixedDelta });
  pre("baseline:contract-source-table-protected-rows-unchanged", contractUnchangedMismatches.length === 0 && unitNotChanged.length === 0, { contractUnchangedMismatches, unitNotChanged });
  if (beforeMismatches) pre("baseline:before-archive-equals-the-contract-source-table", beforeMismatches.length === 0, { beforeMismatches });

  if (mode === "host") await runHost();
  if (mode === "downstream") await runDownstream();
  if (mode === "retryall") await runRetryAll();

  for (const page of browser.pages.values()) await endDocument(page, "run-end");
  observe("run:network-and-requests", { network: networkSeen, served, navigationRequests });
  observe("run:row-gates", { segments: rowGates.length, failedSegments: rowGates.filter((gate) => gate.runtimeErrors || gate.pageConsoleErrors || gate.errorUi).length });
  pre("run:no-non-local-network-attempt", networkSeen.nonLocal === 0, { networkSeen });
  pre("run:keyboard-trace-contains-only-the-runner-key-presses", keyboardAudit.mismatches.length === 0 && keyboardAudit.keyEvents === keyboardAudit.expectedKeyEvents, keyboardAudit);
  pre("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs: dialogs.filter((entry) => !entry.expected) });
  pre("run:every-planned-dialog-consumed", dialogPlan.length === 0, { dialogPlan });
  const fixedErrors = runtimeErrors.filter((entry) => !String(entry.variant ?? "").startsWith("before"));
  observe("run:5cd63ff-reference-runtime-errors", { count: runtimeErrors.length - fixedErrors.length, samples: runtimeErrors.filter((entry) => String(entry.variant ?? "").startsWith("before")).slice(0, 6) });
  check("run:runtime-errors-zero", fixedErrors.length === 0, { runtimeErrors: fixedErrors.slice(0, 5) });
} catch (error) {
  harnessError = error;
} finally {
  const productFailure = harnessError?.checkKind === "product";
  const warningGroups = {};
  for (const warning of consoleWarnings) {
    const key = `${warning.text.slice(0, 160)} @ ${warning.source?.module ?? warning.source?.url ?? "unknown"}`;
    warningGroups[key] = (warningGroups[key] ?? 0) + 1;
  }
  record("result", {
    pass: harnessError === null, harnessValid: harnessError === null || productFailure, mode, checks, productChecks,
    browser: browser ? { pid: browser.pid, pipeClose: browser.pipeClose ?? null, processExit: browser.processExit ?? null } : null,
    runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 6),
    consoleWarnings: consoleWarnings.length, consoleWarningsBySource: warningGroups, consoleWarningSamples: consoleWarnings.slice(0, 6),
    dialogs, artifacts, screenshots, keyboardAudit, network: networkSeen, rowGates: rowGates.length,
    ...(harnessError ? { error: String(harnessError?.stack ?? harnessError).slice(0, 1500), checkId: harnessError?.checkId ?? null, checkKind: harnessError?.checkKind ?? null } : {}),
  });
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`, { flag: "wx" });
  await closeBrowser().catch(() => {});
  server?.closeAllConnections?.();
  server?.close();
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  process.exitCode = harnessError === null ? 0 : productFailure ? 2 : 1;
  const label = harnessError === null ? "PASS" : productFailure ? "PRODUCT-FAIL" : "HARNESS-FAIL";
  console.log(`${label} ${relative(root, evidencePath)} checks=${checks} product=${productChecks} exit=${process.exitCode}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
}
