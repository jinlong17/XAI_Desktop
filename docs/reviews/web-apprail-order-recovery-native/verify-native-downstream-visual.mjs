/**
 * CP-APPRAIL-01 batch 62 (contract r1 §15 E12 and E13): AppRail order (`xai_rail_order`) native DOWNSTREAM and VISUAL
 * evidence in real headless Chrome, in the production App composition, with trusted input only. Independent parent-role
 * native verifier. Verification only: it repairs nothing, implements nothing, accepts nothing and changes no product
 * file, contract, oracle, ledger, control plane or existing evidence. It is a new file. Its infrastructure (archive,
 * pin/guard, lockfile gate, pipe transport, trusted drag and click, key audit, segments) is the text of
 * ./verify-native-fixed.mjs (batch 61), copied and adapted here, not imported; that runner, its fixture and its prelude,
 * and the frozen before runner, fixture and prelude are read only and hash-checked on every run. The batch 61 prelude
 * ./native-fixed-prelude.js is SERVED UNCHANGED (hash-checked); this runner's own read-only probes are evaluated on
 * demand through Runtime.evaluate (never injected before product code).
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-apprail-order-recovery-native/verify-native-downstream-visual.mjs f9eb4b1 <mode> <suffix>
 *
 * Modes:
 *   downstream — E12 (contract §10 items 1–7, host row m): exact bytes and byte compatibility in new documents (the
 *                archive's legacy getPref and the device recovery export, including an actual Settings → Account download;
 *                419e56d bytes read by the fixed product and fixed bytes read by 419e56d); display truth after every
 *                operation and per animation frame (one controller); crash safety for every §5 item 2 value at load and
 *                written by a second document into an idle and into a drafted field; cross-document propagation and
 *                conflict between two App documents (row m); clean-state chrome invariance against 419e56d (DOM
 *                outerHTML, attributes, per-element geometry and decoded pixels of the rail and Topbar, with paired
 *                screenshots); cross-module isolation for every operation of this caller.
 *   visual-en, visual-zh — E13 (contract §9 "Responsive presentation", R-PET, "Sizing and CSS", "Screenshots") for one
 *                language: 375×812, 414×896, 768×1024, 1024×768 and 1440×900; every §9 state with the pet hidden through
 *                its own rail toggle (narrow widths reached by resizing afterwards) and again with the pet on at its default
 *                position (R-PET); hit tests (centre and four insets), 44×44, Topbar and panel containment, no horizontal
 *                scroll; the static selector audit and each new control's computed focus outline; the §9 screenshots,
 *                including the 419e56d route-error before captures.
 *
 * - Product: an immutable `git archive` of the fixed revision (and of 419e56d for references); the fixture is bundled
 *   with esbuild from stdin with resolveDir = that archive. Every `@repo/*` specifier is pinned to the archive's own
 *   package export; a guard plugin fails the build if any module is loaded from the packages/, apps/ or docs/ tree of
 *   the dependency checkout or of this runner's checkout. Third-party modules come from XAI_DEPS_ROOT only when its
 *   pnpm-lock.yaml SHA-256 equals both archives' and the contract gate (consistency gate; read-only use).
 * - The only synthetic input is the auth session.
 * - DevTools transport: the pipe (--remote-debugging-pipe) with flattened target sessions, never a WebSocket.
 * - Trusted input only: clicks through Input.dispatchMouseEvent after a centre hit-test; drags through
 *   Input.setInterceptDrags, Input.dispatchMouseEvent and Input.dispatchDragEvent with the source and every target
 *   centre-hit-tested first and a passive capture-phase recorder requiring every drag event to be trusted; keys (Escape,
 *   Tab, Shift+Tab) without nativeVirtualKeyCode (K-1), with a per-document key audit.
 * - Expected bytes come from this runner's own displayOrder, merge and reorder written from contract §2, A2 and §6; the
 *   expected wording from contract §5; the 419e56d side of every comparison from the 419e56d archive, never from the
 *   fixed product.
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log` plus PNG screenshots and downloaded JSON in this directory;
 *   existing evidence is never overwritten. Exit 0 = harness valid and every product check passes; 2 = harness valid and
 *   at least one product check fails; 1 = harness invalid (a precondition failed). Development probes may redirect
 *   evidence with XAI_NATIVE_EVIDENCE_DIR (refused inside the repository); committed evidence never does.
 */
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { inflateSync } from "node:zlib";
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
/**
 * The frozen conventions, reused read-only: the before files (SHA-256 from ./before-419e56d.md §2) and the batch 61
 * runner, fixture and prelude (SHA-256 from ./review-controls-protection-export-f9eb4b1.md §2).
 */
const FROZEN_BEFORE_FILES = {
  "verify-native-before.mjs": "ccabd5000d4b9e04cf775c4bb1bd79c0860d5def55f46799a651d69714f6a84e",
  "native-before-app.tsx": "fa70e2eb892bca9c2bd2f4c910c737e44963d52433f475253d6f966eb0608a7e",
  "native-before-prelude.js": "a4ba378110a4fcded7eccf0d88f8f41c281a42c10599b17f68832a3a3931f635",
  "verify-native-fixed.mjs": "f062e723b862b332f32f39bf02bf6951b4918a8af5bda8e42f4b69a03aa0f6d7",
  "native-fixed-app.tsx": "a86425af2715a3cb81100a87c413c76d75378f9e500ea575eb23b5d299e77d2d",
  "native-fixed-prelude.js": "4d731278ce6b88a9fa9304926177b248e307341bae180cbe59749bbac2eeb239",
};
const RUNNER = "verify-native-downstream-visual.mjs";
const FIXTURE = "native-downstream-visual-app.tsx";
/** The batch 61 prelude, served unchanged (hash-checked above). */
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
const MODES = ["downstream", "visual-en", "visual-zh"];
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
const progress = (text) => process.stderr.write(`[apprail-e12-e13 ${mode}] ${new Date().toISOString().slice(11, 19)} ${text}\n`);
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
/** The new fixture is the batch 61 fixture's body plus exactly the two readers (and their import): checked line by line. */
const fixtureBody = (text) => text.slice(text.indexOf("*/\n") + 3).split("\n");
const fixtureDelta = (() => {
  const base = fixtureBody(readFileSync(join(output, "native-fixed-app.tsx"), "utf8"));
  const mine = fixtureBody(fixtureSource);
  const removed = base.filter((line) => !mine.includes(line));
  const added = mine.filter((line) => !base.includes(line));
  return { baseLines: base.length, lines: mine.length, removed, added };
})();
const FIXTURE_DELTA_EXPECTED = {
  removed: ['import { accountScope, generationMarkerKey, prefMutationLockName, lifecycleForKey, PREF_REGISTRY } from "@repo/plugin-web-storage";'],
  added: [
    'import { accountScope, generationMarkerKey, prefMutationLockName, lifecycleForKey, PREF_REGISTRY, getPref, exportDeviceRecoveryData } from "@repo/plugin-web-storage";',
    "  /** E12 byte compatibility (contract §10 item 2): the archive's unchanged legacy reader and device recovery export. */",
    "  legacyGetPref: () => clone((getPref as unknown as (key: string) => unknown)(RAIL_KEY)),",
    "  deviceRecovery: () => clone(exportDeviceRecoveryData()),",
  ],
};
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
  // E12 readers (contract §2 rows 3 and the legacy getPref; §10 item 2).
  "packages/plugin-web-storage/src/internal/dataExport.ts", "packages/plugin-web-settings-rest/src/internal/DeviceRecoveryExport.tsx",
  "packages/plugin-web-settings-rest/src/panes/accountPane.tsx",
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
const VARIANTS_BY_MODE = { downstream: ["fixed", "before"], "visual-en": ["fixed", "before"], "visual-zh": ["fixed", "before"] };

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-apprail-native-e12-e13-")));
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
  const plugin = { name: "apprail-native-e12-e13-archive-pin-guard", setup(buildApi) {
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
  page.viewport = { width: viewport.width, height: viewport.height, mobile: false };
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
const KEYDEFS = { Escape: { key: "Escape", code: "Escape", vk: 27 }, Tab: { key: "Tab", code: "Tab", vk: 9 }, "Shift+Tab": { key: "Tab", code: "Tab", vk: 9, modifiers: 8 } };
/** One trusted key press without nativeVirtualKeyCode (lesson K-1); counted for the key audit (Shift is a modifier flag). */
async function press(page, name) {
  const def = KEYDEFS[name];
  page.presses += 1;
  page.keyAudit.push(def.key);
  await input(page, "Input.dispatchKeyEvent", { type: "rawKeyDown", key: def.key, code: def.code, windowsVirtualKeyCode: def.vk, modifiers: def.modifiers ?? 0 });
  await input(page, "Input.dispatchKeyEvent", { type: "keyUp", key: def.key, code: def.code, windowsVirtualKeyCode: def.vk, modifiers: def.modifiers ?? 0 });
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
  if (page.viewport) {
    const viewport = await evaluate(page, "({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio, scale: window.visualViewport ? visualViewport.scale : 1 })");
    pre(`${label}:viewport-${page.viewport.width}x${page.viewport.height}-unzoomed`, viewport.width === page.viewport.width && viewport.height === page.viewport.height && viewport.dpr === 1 && viewport.scale === 1, { viewport, expected: page.viewport });
  }
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
/** Parks the pointer over the main content, away from the rail, the Topbar and the default pet box. */
async function parkMouse(page) {
  const width = page.viewport?.width ?? VIEWPORT.width;
  const height = page.viewport?.height ?? VIEWPORT.height;
  await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: Math.round(width * 0.55), y: Math.round(height * 0.45) });
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
async function dragGesture(page, label, { source, targets, end = "drop", pauseAfterEnter = 0, onHold = null }) {
  const sourcePoint = await railPoint(page, source, `${label}:source`);
  const firstPoint = await railPoint(page, targets[0], `${label}:target-0`);
  const mark = await markOf(page);
  page.intercepted = [];
  const steps = [];
  let lastPoint = firstPoint;
  let outside = null;
  let holdResult = null;
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
    // E13: the drag in progress (the preview) is probed and captured while the gesture is still open.
    if (onHold) holdResult = await onHold();
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
    mark, steps, end, outside, dropSeq, startSeq, endSeq, d1, holdResult,
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
/** Viewport emulation; 414 px and narrower also emulate a mobile device (the batch 48/50 visual convention). */
async function setViewport(page, viewport) {
  const mobile = viewport.width <= 414;
  await page.cdp("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile });
  page.viewport = { width: viewport.width, height: viewport.height, mobile };
  await delay(350);
  const actual = await evaluate(page, "({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio, scale: window.visualViewport ? visualViewport.scale : 1, vvWidth: window.visualViewport ? visualViewport.width : innerWidth })").catch(() => null);
  if (actual && actual.width !== 0) pre(`viewport:${viewport.width}x${viewport.height}:applied-unzoomed`, actual.width === viewport.width && actual.height === viewport.height && actual.dpr === 1 && actual.scale === 1 && Math.abs(actual.vvWidth - viewport.width) < 0.01, { actual, viewport });
  return actual;
}

// ===================================================================================================
// Shared E12/E13 helpers
// ===================================================================================================
const APPEARANCE_KEYS = ["xai_pref_lang", "xai_pref_theme", "xai_pref_density", "xai_pref_font_scale", "xai_accent_hue", "xai_rail_pos", "xai_bg_tone"];
const PET_KEYS = ["xai_pet_id", "xai_pet_pos"];
const RAIL_POS_KEY = "xai_rail_pos";
const WIDTHS = [375, 414, 768, 1024, 1440];
const HEIGHTS = { 375: 812, 414: 896, 768: 1024, 1024: 768, 1440: 900 };
const vpOf = (width) => ({ width, height: HEIGHTS[width] });
const featuresWith = (hidden) => Object.fromEntries(FEATURE_IDS.map((feature) => [featureKey(feature), hidden.includes(feature) ? "false" : "true"]));
/** Reads the archive facts (registrations, labels, registry default) from one clean production mount first. */
async function primeFacts(page) {
  caseStart("prime-archive-facts");
  await seed(page, seedsFor("en"), "prime");
  await mountApp(page, "prime:mount", { path: "/app/tasks", hidePet: false });
}
/** Seeds `lang` (+ the rail bytes: S as JSON, or `raw` verbatim) and mounts the production App of `variant`. */
async function mountSeeded(page, label, lang, { S = null, raw = undefined, extra = {}, path = "/app/tasks", variant = "fixed", ready = READY_APP, hidePet = true, requireApp = true, faultPlan = null } = {}) {
  const value = raw !== undefined ? raw : S ? JSON.stringify(S) : undefined;
  await seed(page, seedsFor(lang, { ...(value !== undefined ? { [RAIL_KEY]: value } : {}), ...extra }), label);
  return mountApp(page, `${label}:mount`, { path, variant, ready, hidePet, requireApp, faultPlan });
}
/** A new document of `variant` on `path` without reseeding (the bytes are whatever the previous document left). */
async function newDocument(page, label, { path = "/app/calendar", variant = "fixed", ready = READY_APP, hidePet = false } = {}) {
  return mountApp(page, label, { path, variant, ready, hidePet });
}
/** Contract A2 P1–P4 for one merge result (P5 is judged on a re-enabled display, P6/P7 by the callers). */
function mergeProperties(S, R, P, Sp) {
  const inR = new Set(R);
  return {
    P1: isDeepStrictEqual(Sp.filter((id) => inR.has(id)), P),
    P2: S.every((id, index) => inR.has(id) || Sp[index] === id),
    P3: classOf(JSON.stringify(Sp)) === "valid" && isDeepStrictEqual([...new Set(Sp)].sort(), [...new Set([...S, ...R])].sort()),
    P4: Sp.length === S.length + R.filter((id) => !S.includes(id)).length,
  };
}
/** After a trusted drop: exactly one set at the drop with the merge bytes, zero attempts during the gesture. */
async function assertDropWrite(page, row, gesture, S, R, P, lang) {
  const expected = merge(S, R, P);
  const settled = await waitUntil(page, `__native.native.get(${JSON.stringify(RAIL_KEY)}) === ${JSON.stringify(JSON.stringify(expected))}`, 5000);
  await delay(400);
  const now = await snap(page, gesture.mark);
  const sets = railOps(now.attempts, ["set"]);
  const removes = railOps(now.attempts, ["remove", "clear"]);
  const devtools = await devtoolsBytes(page);
  check(`${row}:zero-storage-attempts-during-the-gesture`, gesture.attemptsDuringGesture.length === 0, { attempts: brief(gesture.attemptsDuringGesture) });
  check(`${row}:exactly-one-setItem-at-the-drop-with-the-A2-merge-bytes`, settled && sets.length === 1 && sets[0].outcome === "ok" && sets[0].value === JSON.stringify(expected) && gesture.dropSeq !== null && sets[0].seq > gesture.dropSeq && removes.length === 0,
    { sets: brief(sets), removes: brief(removes), expected, dropSeq: gesture.dropSeq });
  check(`${row}:bytes-page-and-devtools-equal-the-merge`, now.bytes === JSON.stringify(expected) && devtools === JSON.stringify(expected), { bytes: parse(now.bytes), devtools: parse(devtools), expected });
  check(`${row}:display-truth-rail-shows-D(bytes,R)-no-status`, isDeepStrictEqual(now.rail, idsToLabels(lang, displayOrder(expected, R))) && isDeepStrictEqual(now.rail, idsToLabels(lang, P)) && !now.status.present && now.unloadListeners === 0,
    { rail: labelsToIds(lang, now.rail), P, status: now.status.present });
  return { expected, now };
}
const visibleSetOf = (lang, rail) => labelsToIds(lang, rail);
async function readersNow(page) {
  return evaluate(page, `(() => { const recovery = verify.deviceRecovery(); return { legacy: verify.legacyGetPref(), recovery: recovery.device.records[${JSON.stringify(RAIL_KEY)}] ?? null, recoveryKind: recovery.kind, recoveryScope: recovery.manifest.scope, recoveryCategoryFeature: (recovery.manifest.categories.find((entry) => entry.keys.includes(${JSON.stringify(RAIL_KEY)})) || {}).feature ?? null }; })()`);
}
const visibleDownloadNames = () => readdirSync(downloads).filter((name) => !name.startsWith("."));
async function awaitNamedDownload(pattern, timeout = 10000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const names = visibleDownloadNames();
    const name = names.find((entry) => pattern.test(entry));
    if (name && !names.some((entry) => entry.endsWith(".crdownload"))) {
      const file = join(downloads, name);
      const first = statSync(file).size;
      await delay(150);
      const second = statSync(file).size;
      if (first > 0 && first === second) return { name, names, raw: readFileSync(file) };
    }
    await delay(50);
  }
  return null;
}
function saveDownload(name, raw, details = {}) {
  const file = `${prefix}-${name}`;
  pre(`download:${name}:not-overwritten`, !existsSync(join(evidenceDir, file)), { file });
  writeFileSync(join(evidenceDir, file), raw, { flag: "wx" });
  const entry = { file, sha256: sha256(raw), bytes: raw.length, case: currentCase, ...details };
  artifacts.push(entry);
  record("disk-download", entry);
  return entry;
}
/** The rAF frame sampler (display truth per frame): rail order, status name and the instrument sequence of each frame. */
const FRAMES_START = `(() => { window.__e12Frames = []; window.__e12FramesOn = true; const tick = () => { if (!window.__e12FramesOn) return; const s = __native.railStatus();
  window.__e12Frames.push({ seq: __native.mark(), rail: __native.railNames().join('|'), status: s.present ? s.name : null }); requestAnimationFrame(tick); }; requestAnimationFrame(tick); return true; })()`;
const FRAMES_STOP = "(() => { window.__e12FramesOn = false; const frames = window.__e12Frames || []; window.__e12Frames = []; return frames; })()";
const joinLabels = (lang, ids) => idsToLabels(lang, ids).join("|");

// ===================================================================================================
// E12 — downstream, crash safety, cross-document, chrome invariance and isolation (contract §10, host row m)
// ===================================================================================================
async function runDownstream() {
  const page = mainPage;
  await primeFacts(page);
  if (selected("bytes")) await e12Bytes(page);
  if (selected("beforeBytes")) await e12BeforeBytes(page);
  if (selected("displayTruth")) await e12DisplayTruth(page);
  if (selected("crashLoad")) await e12CrashLoad(page);
  if (selected("crashSecond")) await e12CrashSecondDocument(page);
  if (selected("rowM")) await e12RowM(page);
  if (selected("chrome")) await e12ChromeInvariance(page);
  if (selected("isolation")) await e12Isolation(page);
}

/** §10 items 1–2: exact bytes for the required drop shapes, then the archives' readers in new documents (both SHAs). */
async function e12Bytes(page) {
  const REV = REVERSED();
  const cases = [
    { id: "bytes-absent", lang: "en", S: null, hidden: [] },
    { id: "bytes-absent-one-hidden", lang: "en", S: null, hidden: ["board"] },
    { id: "bytes-empty-array", lang: "en", S: [], hidden: [] },
    { id: "bytes-one-hidden", lang: "en", S: BOARD_AT_2, hidden: ["board"], download: true },
    { id: "bytes-one-hidden-zh", lang: "zh", S: BOARD_AT_2, hidden: ["board"], download: true },
    { id: "bytes-three-hidden", lang: "en", S: REV, hidden: ["board", "matrix", "habits"] },
    { id: "bytes-unknown-id-and-settings", lang: "en", S: ["ghost-module", ...REV.slice(0, 5), "settings", ...REV.slice(5)], hidden: [] },
  ];
  for (const entry of cases) {
    const { id, lang, hidden } = entry;
    caseStart(id);
    const base = entry.S === null ? facts0.registryDefault : entry.S;
    pre(`${id}:seed-in-domain`, classOf(JSON.stringify(base)) === "valid", { base });
    const { facts } = await mountSeeded(page, id, lang, { S: entry.S, extra: featuresWith(hidden) });
    const R = visibleIds(hidden);
    const D0 = displayOrder(base, R);
    pre(`${id}:rail-displays-D(S,R)`, isDeepStrictEqual(facts.rail, idsToLabels(lang, D0)), { rail: facts.rail, D0 });
    const segment = await beginSegment(page, id);
    const gesture = await dragGesture(page, id, { source: labelOf(lang, D0[0]), targets: [labelOf(lang, D0[2])] });
    const P = reorder(D0, D0[0], D0[2]);
    const { expected } = await assertDropWrite(page, id, gesture, base, R, P, lang);
    const props = mergeProperties(base, R, P, expected);
    check(`${id}:A2-P1-P4-hold-for-the-written-bytes`, Object.values(props).every(Boolean), { props, base, R, P, expected });
    if (hidden.length === 0 && base.every((entry) => R.includes(entry))) check(`${id}:A2-P6-all-visible-bytes-equal-P`, isDeepStrictEqual(expected, P), { expected, P });
    if (entry.S === null) check(`${id}:A2-P7-absent-bytes-merge-over-the-12-defaults`, isDeepStrictEqual(expected, merge(facts0.registryDefault, R, P)) && expected.length === 12 + R.filter((x) => !facts0.registryDefault.includes(x)).length
      && hidden.every((module) => expected.indexOf(module) === facts0.registryDefault.indexOf(module)), { expected, hiddenDefaultIndices: hidden.map((module) => [module, facts0.registryDefault.indexOf(module), expected.indexOf(module)]) });
    if (id.startsWith("bytes-unknown")) check(`${id}:unknown-id-and-settings-keep-their-indices`, expected[0] === "ghost-module" && expected[6] === "settings", { expected });
    await endSegment(segment, ZERO);
    const bytes = await bytesNow(page);
    // A new document of the fixed product: unchanged legacy getPref, device recovery export, display.
    for (const variant of ["fixed", "before"]) {
      const label = `${id}:new-document-${variant === "before" ? "419e56d" : "fixed"}`;
      const { facts: f2 } = await newDocument(page, label, { variant });
      const seg2 = await beginSegment(page, `${label}${variant === "before" ? ":419e56d-reference" : ""}`);
      const readers = await readersNow(page);
      const railAttempts = f2.mountRailAttempts.filter((entry) => !entry.startsWith("get:"));
      record("observation", { id: `${label}:readers`, readers, rail: labelsToIds(lang, f2.rail), bytes });
      check(`${label}:legacy-getPref-decodes-the-bytes-identically`, isDeepStrictEqual(readers.legacy, JSON.parse(bytes)), { legacy: readers.legacy, bytes });
      check(`${label}:device-recovery-export-carries-the-bytes-verbatim`, readers.recovery === bytes && readers.recoveryKind === "device-recovery" && readers.recoveryScope === "device-recovery", { recovery: readers.recovery, bytes });
      check(`${label}:rail-displays-D(bytes,R)-zero-writes-bytes-unchanged`, isDeepStrictEqual(f2.rail, idsToLabels(lang, displayOrder(JSON.parse(bytes), R))) && railAttempts.length === 0 && (await bytesNow(page)) === bytes, { rail: labelsToIds(lang, f2.rail), railAttempts });
      if (variant === "fixed") check(`${label}:no-status-in-the-new-document`, !(await statusNow(page)).present);
      await endSegment(seg2, null, variant === "before" ? { reference: true } : {});
    }
    // P5: with every module visible again, each re-enabled module displays at its stored index where every earlier
    // element is visible (for one hidden module: exactly its previous place).
    if (hidden.length > 0) {
      await seed(page, seedsFor(lang, { [RAIL_KEY]: bytes, ...featuresWith([]) }), `${id}:re-enabled`);
      const { facts: f3 } = await mountApp(page, `${id}:re-enabled:mount`, { path: "/app/calendar", hidePet: false });
      const shown = labelsToIds(lang, f3.rail);
      const stored = JSON.parse(bytes);
      const all = visibleIds();
      const p5 = hidden.map((module) => { const index = stored.indexOf(module); const eligible = stored.slice(0, index).every((x) => all.includes(x)); return { module, index, eligible, shownAt: shown.indexOf(module) }; });
      check(`${id}:A2-P5-re-enabled-modules-display-at-their-stored-index`, p5.every((entry) => !entry.eligible || entry.shownAt === entry.index) && p5.some((entry) => entry.eligible) && isDeepStrictEqual(shown, displayOrder(stored, all)), { p5, shown });
      if (hidden.length === 1) check(`${id}:A2-P5-the-only-hidden-module-returns-to-exactly-its-previous-place`, shown.indexOf(hidden[0]) === base.indexOf(hidden[0]), { shown, base });
    }
    // The actual Settings → Account device recovery download (fixed product, trusted pointer).
    if (entry.download) {
      const label = `${id}:account-device-recovery-download`;
      await seed(page, seedsFor(lang, { [RAIL_KEY]: bytes, ...featuresWith(hidden) }), label);
      await mountApp(page, `${label}:mount`, { path: "/app/settings/account", ready: `(${READY_APP} && !!document.querySelector('details.device-recovery-export > summary'))` });
      const seg4 = await beginSegment(page, label);
      clearDownloads();
      await trustedClick(page, "details.device-recovery-export > summary", `${label}:summary`);
      pre(`${label}:details-open`, await waitUntil(page, "document.querySelector('details.device-recovery-export').open", 3000));
      await trustedClick(page, "details.device-recovery-export > button", `${label}:download-button`);
      const download = await awaitNamedDownload(/^xai-device-recovery-\d{4}-\d{2}-\d{2}\.json$/);
      pre(`${label}:chrome-download-completed`, Boolean(download), { names: visibleDownloadNames() });
      const parsed = parse(download.raw.toString("utf8"));
      saveDownload(`${id}-device-recovery.json`, download.raw, { downloadedAs: download.name, lang });
      check(`${label}:downloaded-device-recovery-file-carries-the-bytes-verbatim`, parsed?.kind === "device-recovery" && parsed.device.records[RAIL_KEY] === bytes && isDeepStrictEqual(Object.keys(parsed.device.records).sort(), Object.keys(parsed.device.records).filter((key) => !key.startsWith("xai:")).sort()),
        { record: parsed?.device?.records?.[RAIL_KEY] ?? null, bytes, keys: parsed ? Object.keys(parsed.device.records) : null });
      check(`${label}:no-rail-write-and-no-status`, railOps((await snap(page, seg4.mark)).attempts).length === 0 && !(await statusNow(page)).present);
      await endSegment(seg4, ZERO);
    }
  }
  // §10 item 1 last bullet: a drop over a failed draft back to the committed order is admitted and completes through
  // the engine's verified no-op (zero setItem), the draft and the status clear, the bytes stay the committed bytes.
  {
    const id = "bytes-back-to-committed-over-a-failed-draft";
    caseStart(id);
    const S = REVERSED();
    await mountSeeded(page, id, "en", { S });
    const segment = await beginSegment(page, id);
    const drop = await failedDrop(page, id, "en", { S });
    await evaluate(page, `__native.allowSet(${JSON.stringify(RAIL_KEY)})`);
    const P1 = drop.P;
    const gesture = await dragGesture(page, `${id}:back`, { source: labelOf("en", drop.D0[0]), targets: [labelOf("en", P1[0])] });
    const back = reorder(P1, drop.D0[0], P1[0]);
    pre(`${id}:the-second-drop-restores-the-committed-visible-order`, isDeepStrictEqual(back, drop.D0), { back, D0: drop.D0 });
    const cleared = await waitUntil(page, "!__native.railStatus().present", 5000);
    await delay(500);
    const now = await snap(page, gesture.mark);
    check(`${id}:admitted-one-lock-request-zero-setItem-verified-no-op`, gesture.lockRequests === 1 && railOps(now.attempts).length === 0 && gesture.attemptsDuringGesture.length === 0, { lockRequests: gesture.lockRequests, attempts: brief(railOps(now.attempts)) });
    check(`${id}:draft-and-status-cleared-bytes-are-the-committed-bytes`, cleared && now.bytes === JSON.stringify(S) && isDeepStrictEqual(now.rail, idsToLabels("en", drop.D0)) && now.unloadListeners === 0, { bytes: parse(now.bytes), rail: labelsToIds("en", now.rail) });
    await evaluate(page, "__native.restore()");
    await endSegment(segment, ZERO);
  }
}

/** §10 item 2 last sentence: values written by 419e56d (trusted drags there) are read identically by the fixed product. */
async function e12BeforeBytes(page) {
  const cases = [
    { id: "before-bytes-all-visible", S: REVERSED(), hidden: [] },
    { id: "before-bytes-boards-hidden", S: BOARD_AT_2, hidden: ["board"] },
  ];
  for (const { id, S, hidden } of cases) {
    caseStart(id);
    const { facts } = await mountSeeded(page, id, "en", { S, extra: featuresWith(hidden), variant: "before" });
    const R = visibleIds(hidden);
    const D0 = displayOrder(S, R);
    pre(`${id}:419e56d-rail-displays-D(S,R)`, isDeepStrictEqual(facts.rail, idsToLabels("en", D0)), { rail: facts.rail });
    const seg = await beginSegment(page, `${id}:419e56d-reference`);
    await dragGesture(page, `${id}:419e56d-drag`, { source: labelOf("en", D0[0]), targets: [labelOf("en", D0[2])] });
    await delay(400);
    const written = await bytesNow(page);
    await endSegment(seg, null, { reference: true });
    pre(`${id}:419e56d-wrote-in-domain-bytes`, typeof written === "string" && classOf(written) === "valid" && written !== JSON.stringify(S), { written });
    record("observation", { id: `${id}:419e56d-written-bytes`, written: parse(written), boardKept: parse(written).includes("board") });
    // Read by both products in new documents, with the same R and with every module visible.
    for (const hiddenNow of hidden.length ? [hidden, []] : [[]]) {
      const reads = {};
      for (const variant of ["before", "fixed"]) {
        const label = `${id}:read-by-${variant === "before" ? "419e56d" : "fixed"}${hiddenNow.length ? "-boards-hidden" : "-all-visible"}`;
        await seed(page, seedsFor("en", { [RAIL_KEY]: written, ...featuresWith(hiddenNow) }), label);
        const { facts: f2 } = await mountApp(page, `${label}:mount`, { path: "/app/calendar", variant, hidePet: false });
        const segment = await beginSegment(page, `${label}${variant === "before" ? ":419e56d-reference" : ""}`);
        reads[variant] = { rail: labelsToIds("en", f2.rail), readers: await readersNow(page), railWrites: f2.mountRailAttempts.filter((entry) => !entry.startsWith("get:")), bytes: await bytesNow(page), status: variant === "fixed" ? (await statusNow(page)).present : null };
        await endSegment(segment, variant === "fixed" ? ZERO : null, variant === "before" ? { reference: true } : {});
      }
      const label = `${id}:${hiddenNow.length ? "boards-hidden" : "all-visible"}`;
      check(`${label}:fixed-reads-419e56d-bytes-identically-display-getPref-recovery`, isDeepStrictEqual(reads.fixed.rail, reads.before.rail) && isDeepStrictEqual(reads.fixed.rail, displayOrder(parse(written), visibleIds(hiddenNow)))
        && isDeepStrictEqual(reads.fixed.readers, reads.before.readers) && isDeepStrictEqual(reads.fixed.readers.legacy, parse(written)) && reads.fixed.readers.recovery === written, { reads });
      check(`${label}:fixed-mount-makes-zero-rail-writes-no-status-bytes-unchanged`, reads.fixed.railWrites.length === 0 && reads.fixed.status === false && reads.fixed.bytes === written, { fixed: reads.fixed });
    }
  }
}

/** §10 item 3: the rail equals D(draft|committed|default, R) after every operation, and rail + status move in one frame. */
async function e12DisplayTruth(page) {
  const lang = "en";
  caseStart("display-truth");
  const S = REVERSED();
  const R = visibleIds();
  const { facts } = await mountSeeded(page, "display-truth", lang, { S });
  const D0 = displayOrder(S, R);
  pre("display-truth:rail-displays-the-committed-order", isDeepStrictEqual(facts.rail, idsToLabels(lang, D0)));
  const segment = await beginSegment(page, "display-truth");
  const framesAfter = (frames, seq) => frames.filter((frame) => frame.seq >= seq);
  // 1. A successful drop.
  await evaluate(page, FRAMES_START);
  const g1 = await dragGesture(page, "display-truth:success", { source: labelOf(lang, D0[0]), targets: [labelOf(lang, D0[2])] });
  const P1 = reorder(D0, D0[0], D0[2]);
  check("display-truth:success:preview-during-the-drag-is-P", isDeepStrictEqual(g1.steps.map((step) => labelsToIds(lang, step.rail)), [P1]), { steps: g1.steps.map((step) => labelsToIds(lang, step.rail)) });
  await assertDropWrite(page, "display-truth:success", g1, S, R, P1, lang);
  let frames = await evaluate(page, FRAMES_STOP);
  let after = framesAfter(frames, g1.dropSeq);
  check("display-truth:success:every-frame-after-the-drop-shows-P-and-no-status", after.length > 0 && after.every((frame) => frame.rail === joinLabels(lang, P1) && frame.status === null), { frames: after.length, distinct: [...new Set(after.map((frame) => `${frame.rail}#${frame.status}`))].slice(0, 4) });
  // 2. A failed drop (quota): the draft is displayed, the status follows settlement.
  await evaluate(page, `__native.denySet(${JSON.stringify(RAIL_KEY)}, "QuotaExceededError")`);
  await evaluate(page, FRAMES_START);
  const g2 = await dragGesture(page, "display-truth:failed", { source: labelOf(lang, P1[0]), targets: [labelOf(lang, P1[2])] });
  const P2 = reorder(P1, P1[0], P1[2]);
  pre("display-truth:failed:settled-as-a-failed-draft", await waitUntil(page, `__native.railStatus().name === ${JSON.stringify(COPY[lang].statusDraftName)}`, 6000));
  await delay(300);
  frames = await evaluate(page, FRAMES_STOP);
  after = framesAfter(frames, g2.dropSeq);
  const firstStatus = after.findIndex((frame) => frame.status !== null);
  check("display-truth:failed:every-frame-after-the-drop-shows-the-draft-and-the-status-never-precedes-it", after.length > 0 && after.every((frame) => frame.rail === joinLabels(lang, P2)) && firstStatus >= 0 && after.slice(firstStatus).every((frame) => frame.status === COPY[lang].statusDraftName),
    { frames: after.length, firstStatus, distinct: [...new Set(after.map((frame) => `${frame.rail === joinLabels(lang, P2) ? "P2" : frame.rail}#${frame.status}`))] });
  let now = await snap(page, segment.mark);
  check("display-truth:failed:rail-is-D(draft,R)-bytes-committed", isDeepStrictEqual(now.rail, idsToLabels(lang, displayOrder(merge(P1, R, P2), R))) && now.bytes === JSON.stringify(P1), { rail: labelsToIds(lang, now.rail), bytes: parse(now.bytes) });
  // 3. A failing Retry: still the draft.
  await openPanel(page, "display-truth:retry");
  await evaluate(page, FRAMES_START);
  const retryMark = await markOf(page);
  await clickTestId(page, "rail-order-retry", "display-truth:retry");
  await delay(800);
  frames = await evaluate(page, FRAMES_STOP);
  after = framesAfter(frames, retryMark);
  check("display-truth:failing-retry:every-frame-shows-the-draft-and-the-status", after.length > 0 && after.every((frame) => frame.rail === joinLabels(lang, P2) && frame.status === COPY[lang].statusDraftName), { frames: after.length });
  // 4. Discard: the committed order and the status removal land in the same frame.
  await evaluate(page, FRAMES_START);
  const discardMark = await markOf(page);
  await clickTestId(page, "rail-order-discard", "display-truth:discard");
  pre("display-truth:discard:status-gone", await waitUntil(page, "!__native.railStatus().present", 4000));
  await delay(300);
  frames = await evaluate(page, FRAMES_STOP);
  after = framesAfter(frames, discardMark);
  check("display-truth:discard:no-frame-mixes-the-committed-order-with-the-status-or-the-draft-without-it", after.length > 0 && after.every((frame) => (frame.rail === joinLabels(lang, P1) && frame.status === null) || (frame.rail === joinLabels(lang, P2) && frame.status !== null)) && after.at(-1).rail === joinLabels(lang, P1),
    { frames: after.length, distinct: [...new Set(after.map((frame) => `${frame.rail === joinLabels(lang, P1) ? "P1" : frame.rail === joinLabels(lang, P2) ? "P2" : frame.rail}#${frame.status}`))] });
  now = await snap(page, discardMark);
  check("display-truth:discard:rail-is-D(committed,R)-zero-writes", isDeepStrictEqual(now.rail, idsToLabels(lang, P1)) && railOps(now.attempts).length === 0 && now.bytes === JSON.stringify(P1));
  // 5. Supersession: a new drop over a failed draft, held behind the real lock: the new order and the status removal in one frame.
  const g3 = await dragGesture(page, "display-truth:failed-again", { source: labelOf(lang, P1[0]), targets: [labelOf(lang, P1[2])] });
  const P3 = reorder(P1, P1[0], P1[2]);
  pre("display-truth:failed-again:settled", await waitUntil(page, `__native.railStatus().name === ${JSON.stringify(COPY[lang].statusDraftName)}`, 6000) && g3.dropSeq !== null);
  await evaluate(page, `__native.allowSet(${JSON.stringify(RAIL_KEY)})`);
  const lockName = await evaluate(page, "verify.lockName()");
  await evaluate(page, `__native.hold(${JSON.stringify(lockName)})`);
  await evaluate(page, FRAMES_START);
  const g4 = await dragGesture(page, "display-truth:supersede", { source: labelOf(lang, P3[0]), targets: [labelOf(lang, P3[2])] });
  const P4 = reorder(P3, P3[0], P3[2]);
  await delay(500);
  frames = await evaluate(page, FRAMES_STOP);
  after = framesAfter(frames, g4.dropSeq);
  check("display-truth:supersede:from-the-first-frame-after-the-drop-the-new-order-and-no-status", after.length > 0 && after.every((frame) => frame.rail === joinLabels(lang, P4) && frame.status === null), { frames: after.length, distinct: [...new Set(after.map((frame) => `${frame.rail}#${frame.status}`))].slice(0, 4) });
  await evaluate(page, `__native.release(${JSON.stringify(lockName)})`);
  const expected4 = merge(merge(P1, R, P3), R, P4);
  pre("display-truth:supersede:written-after-release", await waitUntil(page, `__native.native.get(${JSON.stringify(RAIL_KEY)}) === ${JSON.stringify(JSON.stringify(expected4))}`, 5000));
  await delay(400);
  now = await snap(page, g4.mark);
  check("display-truth:supersede:bytes-are-the-merge-over-the-draft-and-the-rail-is-D(bytes,R)", now.bytes === JSON.stringify(expected4) && isDeepStrictEqual(now.rail, idsToLabels(lang, displayOrder(expected4, R))) && !now.status.present, { bytes: parse(now.bytes) });
  await evaluate(page, "__native.restore()");
  await endSegment(segment, ZERO);
  // 6. Reload repairing a source issue: the committed order and the status removal in one frame.
  {
    const id = "display-truth-reload";
    caseStart(id);
    await mountSeeded(page, id, lang, { raw: "{}" });
    const seg = await beginSegment(page, id);
    const defaultIds = displayOrder(facts0.registryDefault, R);
    pre(`${id}:default-display-and-source-status`, isDeepStrictEqual(await railNow(page), idsToLabels(lang, defaultIds)) && statusMatches(await statusNow(page), lang, "source"));
    const V = REVERSED();
    await externalDocument(`localStorage.setItem(${JSON.stringify(RAIL_KEY)}, ${JSON.stringify(JSON.stringify(V))}); true`, `${id}:external-repair`);
    pre(`${id}:storage-event-delivered`, await waitUntil(page, `__native.window(${seg.mark}).storageReceived.some((entry) => entry.key === ${JSON.stringify(RAIL_KEY)} && entry.trusted)`, 4000));
    await delay(400);
    const repaired = await snap(page, seg.mark);
    observe(`${id}:after-external-repair-before-reload`, { statusStillShown: repaired.status.present, rail: labelsToIds(lang, repaired.rail) });
    // Batch 61 row p recorded that the source status stays until Reload; the frame check needs that state.
    pre(`${id}:the-source-status-is-still-shown-so-reload-is-needed`, repaired.status.present && isDeepStrictEqual(repaired.rail, idsToLabels(lang, defaultIds)), { status: repaired.status });
    await openPanel(page, id);
    await evaluate(page, FRAMES_START);
    const reloadMark = await markOf(page);
    await clickTestId(page, "rail-order-reload", `${id}:reload`);
    pre(`${id}:status-gone`, await waitUntil(page, "!__native.railStatus().present", 4000));
    await delay(300);
    frames = await evaluate(page, FRAMES_STOP);
    after = framesAfter(frames, reloadMark);
    check(`${id}:no-frame-mixes-the-repaired-order-with-the-status`, after.length > 0 && after.every((frame) => (frame.rail === joinLabels(lang, V) && frame.status === null) || (frame.rail === joinLabels(lang, defaultIds) && frame.status !== null)) && after.at(-1).rail === joinLabels(lang, V),
      { frames: after.length, distinct: [...new Set(after.map((frame) => `${frame.rail === joinLabels(lang, V) ? "V" : frame.rail === joinLabels(lang, defaultIds) ? "default" : frame.rail}#${frame.status}`))] });
    const done = await snap(page, reloadMark);
    check(`${id}:rail-is-D(committed,R)-zero-writes`, isDeepStrictEqual(done.rail, idsToLabels(lang, V)) && railOps(done.attempts).length === 0 && done.bytes === JSON.stringify(V));
    await endSegment(seg, ZERO);
  }
}

/** §10 item 4 (load): every §5 item 2 value (and an unreadable source) on the three host-row-a routes. */
async function e12CrashLoad(page) {
  const ROUTES = ["/app/tasks", "/app/settings/appearance", "/app/dashboard"];
  const plan = [...MALFORMED.map((value) => ({ value, lang: "en", routes: ROUTES })), ...MALFORMED.map((value) => ({ value, lang: "zh", routes: ["/app/tasks"] }))];
  for (const { value, lang, routes } of plan) {
    const unreadable = value.cls === "unreadable";
    const raw = unreadable ? JSON.stringify(REVERSED()) : value.raw;
    for (const path of routes) {
      const id = `crash-load-${lang}-${value.label}-${path.split("/").filter(Boolean).slice(1).join("-")}`;
      caseStart(id);
      pre(`${id}:seed-class-${value.cls}`, unreadable ? classOf(raw) === "valid" : classOf(raw) === value.cls, { raw });
      const { state, facts } = await mountSeeded(page, id, lang, { raw, path, hidePet: false, requireApp: false, faultPlan: unreadable ? { get: [RAIL_KEY] } : null });
      const segment = await beginSegment(page, id);
      const view = await evaluate(page, `({ ready: ${READY_APP}, routeError: __native.routeError(), rail: __native.railNames(), status: __native.railStatus(), listeners: __native.unloadListeners(), bytes: __native.native.get(${JSON.stringify(RAIL_KEY)}) })`);
      const mountWrites = facts.mountRailAttempts.filter((entry) => !entry.startsWith("get:"));
      check(`${id}:app-renders-without-the-route-error-boundary`, state.ready && view.ready && view.routeError === null, { routeError: view.routeError });
      check(`${id}:default-order-source-status-zero-writes-bytes-unchanged`, isDeepStrictEqual(view.rail, idsToLabels(lang, displayOrder(facts0.registryDefault, visibleIds()))) && statusMatches(view.status, lang, "source", { open: false }) && mountWrites.length === 0 && view.bytes === raw && view.listeners === 0,
        { rail: view.rail, status: view.status.name, mountWrites, bytes: view.bytes });
      await endSegment(segment, ZERO);
    }
  }
}

/** §10 item 4 (running App): a malformed value written by a second document into an idle and into a drafted field. */
async function e12CrashSecondDocument(page) {
  const writable = MALFORMED.filter((value) => value.cls !== "unreadable");
  const ZH_SAMPLE = ["object-empty", "string-tasks", "array-1", "repeated-tasks", "null-literal"];
  const plan = [...writable.map((value) => ({ value, lang: "en" })), ...writable.filter((value) => ZH_SAMPLE.includes(value.label)).map((value) => ({ value, lang: "zh" }))];
  const defaultDisplay = (lang) => idsToLabels(lang, displayOrder(facts0.registryDefault, visibleIds()));
  const write = (raw, label) => externalDocument(`localStorage.setItem(${JSON.stringify(RAIL_KEY)}, ${JSON.stringify(raw)}); localStorage.getItem(${JSON.stringify(RAIL_KEY)}) === ${JSON.stringify(raw)}`, label);
  for (const { value, lang } of plan) {
    pre(`crash-second-${lang}-${value.label}:seed-class`, classOf(value.raw) === value.cls, { raw: value.raw });
    // Idle field.
    {
      const id = `crash-second-${lang}-${value.label}-idle`;
      caseStart(id);
      const S = REVERSED();
      await mountSeeded(page, id, lang, { S, hidePet: false });
      const segment = await beginSegment(page, id);
      const written = await write(value.raw, `${id}:external-write`);
      pre(`${id}:external-document-wrote-the-value`, written.value === true);
      pre(`${id}:trusted-storage-event-delivered`, await waitUntil(page, `__native.window(${segment.mark}).storageReceived.some((entry) => entry.key === ${JSON.stringify(RAIL_KEY)} && entry.trusted)`, 4000));
      await waitUntil(page, "__native.railStatus().present", 3000);
      await delay(400);
      const now = await snap(page, segment.mark);
      check(`${id}:no-throw-app-renders-idle-field-in-its-source-state`, now.routeError === null && (await evaluate(page, READY_APP)) && statusMatches(now.status, lang, "source", { open: false }) && isDeepStrictEqual(now.rail, defaultDisplay(lang)),
        { routeError: now.routeError, status: now.status.name, rail: labelsToIds(lang, now.rail) });
      check(`${id}:zero-writes-external-bytes-untouched-no-warning`, railOps(now.attempts).length === 0 && now.bytes === value.raw && now.unloadListeners === 0, { attempts: brief(railOps(now.attempts)), bytes: now.bytes });
      await endSegment(segment, ZERO);
    }
    // Drafted field: a preserved conflict; Retry refused again; Discard adopts the committed (malformed) bytes.
    {
      const id = `crash-second-${lang}-${value.label}-drafted`;
      caseStart(id);
      const S = REVERSED();
      await mountSeeded(page, id, lang, { S });
      const segment = await beginSegment(page, id);
      const drop = await failedDrop(page, id, lang, { S });
      await evaluate(page, `__native.allowSet(${JSON.stringify(RAIL_KEY)})`);
      const writeMark = await markOf(page);
      const written = await write(value.raw, `${id}:external-write`);
      pre(`${id}:external-document-wrote-the-value`, written.value === true);
      pre(`${id}:trusted-storage-event-delivered`, await waitUntil(page, `__native.window(${writeMark}).storageReceived.some((entry) => entry.key === ${JSON.stringify(RAIL_KEY)} && entry.trusted)`, 4000));
      await delay(500);
      const kept = await snap(page, writeMark);
      check(`${id}:no-throw-the-draft-stays-displayed-as-a-preserved-conflict`, kept.routeError === null && statusMatches(kept.status, lang, "failed") && isDeepStrictEqual(kept.rail, idsToLabels(lang, drop.P)) && kept.bytes === value.raw && railOps(kept.attempts).length === 0,
        { status: kept.status.name, rail: labelsToIds(lang, kept.rail), bytes: kept.bytes });
      await openPanel(page, id);
      const retryMark = await markOf(page);
      await clickTestId(page, "rail-order-retry", `${id}:retry`);
      await delay(800);
      const retried = await snap(page, retryMark);
      check(`${id}:retry-refused-again-never-overwrites`, statusMatches(retried.status, lang, "failed", { open: true }) && retried.bytes === value.raw && railOps(retried.attempts).every((entry) => entry.op !== "set" || entry.outcome !== "ok") && railOps(retried.attempts, ["remove", "clear"]).length === 0 && retried.focus?.testid === "rail-order-retry",
        { status: retried.status.name, attempts: brief(railOps(retried.attempts)), focus: retried.focus });
      const discardMark = await markOf(page);
      await clickTestId(page, "rail-order-discard", `${id}:discard`);
      await waitUntil(page, `__native.railStatus().name === ${JSON.stringify(COPY[lang].statusSourceName)}`, 4000);
      await delay(400);
      const discarded = await snap(page, discardMark);
      check(`${id}:discard-zero-writes-adopts-the-committed-bytes-default-display-and-source-status`, railOps(discarded.attempts).length === 0 && discarded.bytes === value.raw && isDeepStrictEqual(discarded.rail, defaultDisplay(lang)) && statusMatches(discarded.status, lang, "source") && discarded.unloadListeners === 0,
        { status: discarded.status.name, rail: labelsToIds(lang, discarded.rail), attempts: brief(railOps(discarded.attempts)) });
      await evaluate(page, "__native.restore()");
      await endSegment(segment, ZERO);
    }
  }
}

/** Host row m (§10 item 5): two production App documents; idle follows live; a drafted one becomes a preserved conflict. */
async function e12RowM(page) {
  for (const lang of ["en", "zh"]) {
    const id = `m-${lang}`;
    caseStart(id);
    const S = REVERSED();
    const R = visibleIds();
    await mountSeeded(page, `${id}:A`, lang, { S });
    const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
    const second = await attachPage(targetId, `B-${lang}`);
    await second.cdp("Fetch.enable", { patterns: [{ urlPattern: `${origin}/`, resourceType: "Document", requestStage: "Request" }] });
    try {
      await second.cdp("Page.bringToFront");
      await mountApp(second, `${id}:B:mount`, { path: "/app/dashboard" });
      pre(`${id}:B-is-a-second-production-app-document`, (await evaluate(second, "verify.instance")) !== (await evaluate(page, "verify.instance")));
      await page.cdp("Page.bringToFront");
      const segA = await beginSegment(page, `${id}:A`);
      const segB = await beginSegment(second, `${id}:B`);
      // Idle B follows a committed drop in A live.
      const D0 = displayOrder(S, R);
      const g1 = await dragGesture(page, `${id}:A-drop`, { source: labelOf(lang, D0[0]), targets: [labelOf(lang, D0[2])] });
      const P1 = reorder(D0, D0[0], D0[2]);
      const { expected: M1 } = await assertDropWrite(page, `${id}:A-drop`, g1, S, R, P1, lang);
      const live = await waitUntil(second, `JSON.stringify(__native.railNames()) === ${JSON.stringify(JSON.stringify(idsToLabels(lang, displayOrder(M1, R))))}`, 4000);
      const bIdle = await snap(second, segB.mark);
      check(`${id}:idle-B-shows-D(committed,R)-without-reload-zero-writes-no-status`, live && isDeepStrictEqual(bIdle.rail, idsToLabels(lang, displayOrder(M1, R))) && railOps(bIdle.attempts).length === 0 && !bIdle.status.present
        && bIdle.received.some((entry) => entry.key === RAIL_KEY && entry.trusted) && (await evaluate(second, "verify.instance")) !== null, { rail: labelsToIds(lang, bIdle.rail), received: bIdle.received.length });
      // A drafted B (failed drop) is preserved when A commits; Retry is refused again; Discard adopts A's order.
      await second.cdp("Page.bringToFront");
      const dropB = await failedDrop(second, `${id}:B-failed`, lang, { S: M1 });
      await evaluate(second, `__native.allowSet(${JSON.stringify(RAIL_KEY)})`);
      await page.cdp("Page.bringToFront");
      const D1 = displayOrder(M1, R);
      const g2 = await dragGesture(page, `${id}:A-second-drop`, { source: labelOf(lang, D1[1]), targets: [labelOf(lang, D1[3])] });
      const P2 = reorder(D1, D1[1], D1[3]);
      const { expected: M2 } = await assertDropWrite(page, `${id}:A-second-drop`, g2, M1, R, P2, lang);
      const markB = await markOf(second);
      pre(`${id}:B-received-the-storage-event`, await waitUntil(second, `__native.window(${segB.mark}).storageReceived.filter((entry) => entry.key === ${JSON.stringify(RAIL_KEY)} && entry.trusted).length >= 2`, 4000));
      await delay(500);
      await second.cdp("Page.bringToFront");
      const kept = await snap(second, markB);
      check(`${id}:drafted-B-becomes-a-preserved-conflict`, statusMatches(kept.status, lang, "failed") && isDeepStrictEqual(kept.rail, idsToLabels(lang, dropB.P)) && kept.bytes === JSON.stringify(M2) && railOps(kept.attempts).length === 0,
        { status: kept.status.name, rail: labelsToIds(lang, kept.rail), bytes: parse(kept.bytes) });
      await openPanel(second, `${id}:B`);
      const retryMark = await markOf(second);
      await clickTestId(second, "rail-order-retry", `${id}:B-retry`);
      await delay(800);
      const retried = await snap(second, retryMark);
      check(`${id}:B-retry-refused-again-never-overwrites-A`, statusMatches(retried.status, lang, "failed", { open: true }) && retried.bytes === JSON.stringify(M2) && railOps(retried.attempts).every((entry) => entry.op !== "set" || entry.outcome !== "ok") && retried.focus?.testid === "rail-order-retry",
        { attempts: brief(railOps(retried.attempts)), status: retried.status.name, focus: retried.focus });
      const discardMark = await markOf(second);
      await clickTestId(second, "rail-order-discard", `${id}:B-discard`);
      pre(`${id}:B-status-gone`, await waitUntil(second, "!__native.railStatus().present", 4000));
      await delay(300);
      const discarded = await snap(second, discardMark);
      check(`${id}:B-discard-adopts-the-committed-order-zero-writes`, isDeepStrictEqual(discarded.rail, idsToLabels(lang, displayOrder(M2, R))) && railOps(discarded.attempts).length === 0 && discarded.bytes === JSON.stringify(M2) && discarded.unloadListeners === 0 && discarded.focus?.isPrefTrigger === true,
        { rail: labelsToIds(lang, discarded.rail), focus: discarded.focus });
      await evaluate(second, "__native.restore()");
      await page.cdp("Page.bringToFront");
      const aEnd = await snap(page, segA.mark);
      check(`${id}:A-unaffected-by-B-no-status-committed-order`, !aEnd.status.present && isDeepStrictEqual(aEnd.rail, idsToLabels(lang, displayOrder(M2, R))), { rail: labelsToIds(lang, aEnd.rail) });
      await endSegment(segA, ZERO);
      await endSegment(segB, ZERO);
    } finally {
      await collectDocument(second, "close-second-app");
      browser.pages.delete(second.sessionId);
      await browser.send("Target.closeTarget", { targetId }).catch(() => {});
      await page.cdp("Page.bringToFront");
      await delay(200);
    }
  }
}

// ---------------------------------------------------------------------------------------------------
// §10 item 6: clean-state chrome invariance against 419e56d
// ---------------------------------------------------------------------------------------------------
/** A minimal PNG decoder (8-bit RGB/RGBA, non-interlaced; Chrome's screenshot encoding), as in the batch 48/50 runners. */
function decodePng(buffer) {
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw Error("not a PNG");
  let offset = 8;
  let header = null;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") header = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), bitDepth: data[8], colorType: data[9], interlace: data[12] };
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    offset += 12 + length;
  }
  if (!header || header.bitDepth !== 8 || ![2, 6].includes(header.colorType) || header.interlace !== 0) throw Error(`unsupported PNG ${JSON.stringify(header)}`);
  const { width, height } = header;
  const channels = header.colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = new Uint8Array(width * height * 4);
  let previous = new Uint8Array(stride);
  let current = new Uint8Array(stride);
  let position = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[position];
    position += 1;
    for (let x = 0; x < stride; x += 1) {
      const value = raw[position + x];
      const left = x >= channels ? current[x - channels] : 0;
      const up = previous[x];
      const upLeft = x >= channels ? previous[x - channels] : 0;
      let decoded;
      if (filter === 0) decoded = value;
      else if (filter === 1) decoded = value + left;
      else if (filter === 2) decoded = value + up;
      else if (filter === 3) decoded = value + ((left + up) >> 1);
      else if (filter === 4) {
        const estimate = left + up - upLeft;
        const pa = Math.abs(estimate - left);
        const pb = Math.abs(estimate - up);
        const pc = Math.abs(estimate - upLeft);
        decoded = value + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft);
      } else throw Error(`bad PNG filter ${filter}`);
      current[x] = decoded & 255;
    }
    position += stride;
    for (let x = 0; x < width; x += 1) {
      const target = (y * width + x) * 4;
      out[target] = current[x * channels];
      out[target + 1] = current[x * channels + 1];
      out[target + 2] = current[x * channels + 2];
      out[target + 3] = channels === 4 ? current[x * channels + 3] : 255;
    }
    [previous, current] = [current, previous];
  }
  return { width, height, pixels: out };
}
/** Pixel comparison of two decoded images inside an optional mask (excluded rectangles, viewport coordinates of the clip). */
function pixelDiff(left, right, masks = []) {
  if (left.width !== right.width || left.height !== right.height) return { sameSize: false, differing: null, masked: 0 };
  let differing = 0;
  let masked = 0;
  const where = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity, samples: [] };
  for (let y = 0; y < left.height; y += 1) {
    for (let x = 0; x < left.width; x += 1) {
      if (masks.some((box) => x >= box.left && x < box.right && y >= box.top && y < box.bottom)) { masked += 1; continue; }
      const index = (y * left.width + x) * 4;
      if (left.pixels[index] !== right.pixels[index] || left.pixels[index + 1] !== right.pixels[index + 1] || left.pixels[index + 2] !== right.pixels[index + 2] || left.pixels[index + 3] !== right.pixels[index + 3]) {
        differing += 1;
        where.left = Math.min(where.left, x); where.top = Math.min(where.top, y); where.right = Math.max(where.right, x + 1); where.bottom = Math.max(where.bottom, y + 1);
        if (where.samples.length < 8) where.samples.push({ x, y, fixed: [...left.pixels.subarray(index, index + 4)], before: [...right.pixels.subarray(index, index + 4)] });
      }
    }
  }
  return { sameSize: true, differing, masked, total: left.width * left.height, where: differing ? where : null };
}
/** Per-element geometry and attributes of a subtree (DOM structure + geometry, contract §10 item 6). */
const GEOMETRY = (selector) => `(() => {
  const root = document.querySelector(${JSON.stringify(selector)});
  if (!root) return null;
  const r = (v) => Math.round(v * 100) / 100;
  return [root, ...root.querySelectorAll('*')].map((element) => { const box = element.getBoundingClientRect(); const style = getComputedStyle(element);
    return { tag: element.tagName.toLowerCase(), cls: typeof element.className === 'string' ? element.className : (element.getAttribute('class') || ''), box: [r(box.left), r(box.top), r(box.width), r(box.height)], display: style.display, visibility: style.visibility, opacity: style.opacity }; });
})()`;
const ATTRIBUTES = (selector) => `(() => { const element = document.querySelector(${JSON.stringify(selector)}); return element ? Object.fromEntries([...element.attributes].map((attribute) => [attribute.name, attribute.value])) : null; })()`;
const PET_BOXES = `(() => { const M = 24; const r = (b) => ({ left: Math.floor(b.left) - M, top: Math.floor(b.top) - M, right: Math.ceil(b.right) + M, bottom: Math.ceil(b.bottom) + M });
  return [...document.querySelectorAll('.pet-wrap, .pet-wrap *, .pet-bubble, .pet-picker, [class*="pet-picker"]')].map((element) => element.getBoundingClientRect()).filter((b) => b.width > 0 && b.height > 0).map(r); })()`;
async function clipShot(page, selector) {
  const box = await evaluate(page, `(() => { const b = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: Math.floor(b.left), y: Math.floor(b.top), width: Math.ceil(b.right) - Math.floor(b.left), height: Math.ceil(b.bottom) - Math.floor(b.top), scrollX, scrollY }; })()`);
  pre(`chrome:clip-${selector}-window-not-scrolled`, box.scrollX === 0 && box.scrollY === 0, { box });
  const shot = await page.cdp("Page.captureScreenshot", { format: "png", clip: { x: box.x, y: box.y, width: box.width, height: box.height, scale: 1 }, captureBeyondViewport: false });
  return { box, buffer: Buffer.from(shot.data, "base64") };
}
async function e12ChromeInvariance(page) {
  const REV = REVERSED();
  const LAYOUTS = [{ name: "1440-left", width: 1440, height: 900, pos: null }, { name: "1440-top", width: 1440, height: 900, pos: "top" }, { name: "375", width: 375, height: 812, pos: null }];
  const SAVED = new Set(["en/1440-left/all/custom", "zh/1440-left/all/custom", "en/1440-top/all/custom", "en/375/all/custom", "zh/375/all/custom", "en/1440-left/boards-hidden/absent"]);
  const comparisons = [];
  for (const lang of ["en", "zh"]) {
    for (const layout of LAYOUTS) {
      for (const modules of ["all", "boards-hidden"]) {
        for (const seeded of ["absent", "custom"]) {
          const key = `${lang}/${layout.name}/${modules}/${seeded}`;
          const id = `chrome-${lang}-${layout.name}-${modules}-${seeded}`;
          caseStart(id);
          const captures = {};
          for (const variant of ["before", "fixed"]) {
            const label = `${id}:${variant === "before" ? "419e56d" : "fixed"}`;
            await setViewport(page, { width: layout.width, height: layout.height });
            const extra = { ...featuresWith(modules === "all" ? [] : ["board"]), ...(seeded === "custom" ? { [RAIL_KEY]: JSON.stringify(REV) } : {}), ...(layout.pos ? { [RAIL_POS_KEY]: layout.pos } : {}) };
            await seed(page, seedsFor(lang, extra), label);
            await mountApp(page, `${label}:mount`, { path: "/app/tasks", variant, hidePet: false });
            const segment = await beginSegment(page, `${label}${variant === "before" ? ":419e56d-reference" : ""}`);
            await parkMouse(page);
            await delay(500);
            const capture = {
              railOuterHTML: await evaluate(page, 'document.querySelector("aside.app-rail").outerHTML'),
              topbarClosedOuterHTML: await evaluate(page, 'document.querySelector("header.topbar").outerHTML'),
              appAttributes: await evaluate(page, ATTRIBUTES(".app")),
              htmlAttributes: await evaluate(page, ATTRIBUTES("html")),
              railGeometry: await evaluate(page, GEOMETRY("aside.app-rail")),
              topbarClosedGeometry: await evaluate(page, GEOMETRY("header.topbar")),
            };
            const pets = await evaluate(page, PET_BOXES);
            const railShot = await clipShot(page, "aside.app-rail");
            const topbarShot = await clipShot(page, "header.topbar");
            if (SAVED.has(key)) await screenshot(page, `${id}-${variant === "before" ? "419e56d" : "fixed"}`, { state: `clean chrome ${key} on ${variant === "before" ? "419e56d" : "f9eb4b1"}`, width: layout.width, height: layout.height });
            await trustedClick(page, ".topbar .topbar-pref-trigger", `${label}:popover-open`);
            pre(`${label}:popover-opened`, await waitUntil(page, "__native.topbar().popoverOpen", 3000));
            await parkMouse(page);
            await delay(300);
            capture.topbarOpenOuterHTML = await evaluate(page, 'document.querySelector("header.topbar").outerHTML');
            capture.topbarOpenGeometry = await evaluate(page, GEOMETRY("header.topbar"));
            const openShot = await clipShot(page, "header.topbar");
            if (key === "en/1440-left/all/custom") await screenshot(page, `${id}-popover-open-${variant === "before" ? "419e56d" : "fixed"}`, { state: `clean chrome ${key}, Topbar popover open, on ${variant === "before" ? "419e56d" : "f9eb4b1"}` });
            await press(page, "Escape");
            pre(`${label}:popover-closed`, await waitUntil(page, "!__native.topbar().popoverOpen", 3000));
            await parkMouse(page);
            capture.htmlAttributesAfterPopover = await evaluate(page, ATTRIBUTES("html"));
            capture.appAttributesAfterPopover = await evaluate(page, ATTRIBUTES(".app"));
            const now = await snap(page, segment.mark);
            pre(`${label}:clean-state-no-rail-status-no-rail-write`, !now.status.present && railOps(now.attempts).length === 0 && now.routeError === null, { status: now.status.present });
            captures[variant] = { capture, pets, rail: decodePng(railShot.buffer), railBox: railShot.box, topbar: decodePng(topbarShot.buffer), topbarBox: topbarShot.box, topbarOpen: decodePng(openShot.buffer), topbarOpenBox: openShot.box,
              railSha: sha256(railShot.buffer), topbarSha: sha256(topbarShot.buffer), topbarOpenSha: sha256(openShot.buffer) };
            await endSegment(segment, ZERO, variant === "before" ? { reference: true } : {});
          }
          for (const item of Object.keys(captures.fixed.capture)) {
            const equal = isDeepStrictEqual(captures.fixed.capture[item], captures.before.capture[item]);
            comparisons.push({ key, item, equal, sha256: sha256(JSON.stringify(captures.fixed.capture[item])) });
            check(`${id}:${item}:identical-to-419e56d`, equal, equal ? { sha256: sha256(JSON.stringify(captures.fixed.capture[item])) } : { fixed: captures.fixed.capture[item], before: captures.before.capture[item] });
          }
          // Decoded pixels of the rail and Topbar clips; the DesktopPet's own boxes (an animated pre-existing overlay of an
          // unchanged package), widened by 24 px for its animated shadow (development probes dev4/dev5: ±1 channel
          // differences under the pet only, in different cases on each run), are masked in both captures where they
          // intersect a clip. The DOM, attribute and per-element geometry comparisons above are unmasked.
          for (const [part, boxName] of [["rail", "railBox"], ["topbar", "topbarBox"], ["topbarOpen", "topbarOpenBox"]]) {
            const box = captures.fixed[boxName];
            const masks = [...captures.fixed.pets, ...captures.before.pets].map((pet) => ({ left: pet.left - box.x, top: pet.top - box.y, right: pet.right - box.x, bottom: pet.bottom - box.y }))
              .filter((mask) => mask.right > 0 && mask.bottom > 0 && mask.left < box.width && mask.top < box.height);
            const diff = pixelDiff(captures.fixed[part], captures.before[part], masks);
            const boxesEqual = isDeepStrictEqual(captures.fixed[boxName], captures.before[boxName]);
            comparisons.push({ key, item: `${part}-pixels`, equal: boxesEqual && diff.sameSize && diff.differing === 0, masked: diff.masked, total: diff.total, pngShaFixed: captures.fixed[`${part}Sha`], pngShaBefore: captures.before[`${part}Sha`] });
            check(`${id}:${part}-decoded-pixels-identical-to-419e56d`, boxesEqual && diff.sameSize && diff.differing === 0, { box, beforeBox: captures.before[boxName], diff, masks });
          }
        }
      }
    }
  }
  await setViewport(page, VIEWPORT);
  record("chrome-invariance", { method: "same seeded bytes in both archives; outerHTML (rail, Topbar closed/open), .app and <html> attributes (after load and after the popover round trip), per-element tag/class/box/display/visibility/opacity of the rail and Topbar subtrees, and decoded RGBA pixels of the rail and Topbar clips (the DesktopPet boxes, widened by 24 px for its animated shadow, masked in both captures where they intersect a clip)", comparisons, total: comparisons.length, differing: comparisons.filter((entry) => !entry.equal).length });
}

// ---------------------------------------------------------------------------------------------------
// §10 item 7: cross-module isolation
// ---------------------------------------------------------------------------------------------------
async function e12Isolation(page) {
  const lang = "en";
  const OTHER = [...FEATURE_IDS.map(featureKey), ...APPEARANCE_KEYS, ...PET_KEYS];
  const seeds = {
    ...featuresWith(["habits", "matrix"]),
    xai_pref_lang: JSON.stringify("en"), xai_pref_theme: JSON.stringify("light"), xai_pref_density: JSON.stringify("compact"), xai_pref_font_scale: JSON.stringify(1.1),
    xai_accent_hue: "230", xai_rail_pos: "left", xai_bg_tone: "mist", xai_pet_id: "pip", xai_pet_pos: JSON.stringify({ x: 900, y: 560 }),
  };
  const otherKeys = OTHER;
  const hidden = ["habits", "matrix"];
  const R = visibleIds(hidden);
  const S = REVERSED();
  const truth = async (label) => {
    const out = { rail: labelsToIds(lang, await railNow(page)), html: await evaluate(page, ATTRIBUTES("html")), app: await evaluate(page, ATTRIBUTES(".app")), pet: await evaluate(page, "(() => { const w = document.querySelector('.pet-wrap'); return w ? w.style.transform : null; })()") };
    return out;
  };
  const routeAndSearchTruth = async (label) => {
    await evaluate(page, "__native.router.navigate('/app/habits')");
    const routeHabits = await waitUntil(page, "location.pathname === '/app/habits' && !!document.querySelector('.disabled-feature-fallback')", 4000);
    await evaluate(page, "__native.router.navigate('/app/tasks')");
    pre(`${label}:back-on-tasks`, await waitUntil(page, "location.pathname === '/app/tasks'", 4000));
    await trustedClick(page, ".topbar .search-box", `${label}:open-cmdk`);
    pre(`${label}:cmdk-open`, await waitUntil(page, "!!document.querySelector('.cmdk-modal [role=\"option\"]')", 4000));
    const rows = await evaluate(page, "[...document.querySelectorAll('.cmdk-modal [role=\"option\"]')].map((o) => ((o.querySelector('.cmdk-row-label') || o).textContent || '').replace(/\\s+/g, ' ').trim())");
    // Search truth: the set of module rows (labels of the 14 rail modules) CmdK offers.
    const moduleLabels = new Set(railIds().map((module) => labelOf(lang, module)));
    const options = [...new Set(rows.filter((row) => moduleLabels.has(row)))].sort();
    record("observation", { id: `${label}:cmdk-rows`, rows });
    await press(page, "Escape");
    pre(`${label}:cmdk-closed`, await waitUntil(page, "!document.querySelector('.cmdk-modal')", 3000));
    await parkMouse(page);
    return { routeHabits, options };
  };
  const reference = await isolationSignOutReference(page, lang, { [RAIL_KEY]: JSON.stringify(S), ...seeds }, otherKeys);
  caseStart("isolation");
  await seed(page, seedsFor(lang, { [RAIL_KEY]: JSON.stringify(S), ...seeds }), "isolation");
  const { facts } = await mountApp(page, "isolation:mount", { path: "/app/tasks", hidePet: false });
  pre("isolation:pet-visible-at-its-stored-position-and-rail-follows-features", facts.pet && isDeepStrictEqual(labelsToIds(lang, facts.rail), displayOrder(S, R)));
  const initialOther = await evaluate(page, `__native.native.snapshot()`);
  const baseTruth = await truth("isolation:base");
  const baseRoute = await routeAndSearchTruth("isolation:base");
  record("observation", { id: "isolation:baseline", truth: baseTruth, route: baseRoute });
  pre("isolation:baseline-route-truth-habits-disabled-and-search-lists-the-enabled-modules", baseRoute.routeHabits && baseRoute.options.length > 0 && !baseRoute.options.includes(labelOf(lang, "habits")) && !baseRoute.options.includes(labelOf(lang, "matrix")), baseRoute);
  const segment = await beginSegment(page, "isolation");
  const operations = [];
  const operation = async (name, act, { exclude = [], appGone = false } = {}) => {
    const mark = await markOf(page);
    const before = await evaluate(page, "__native.native.snapshot()");
    await act();
    await delay(500);
    const now = await snap(page, mark);
    const after = await evaluate(page, "__native.native.snapshot()");
    const changedOther = otherKeys.filter((key) => !exclude.includes(key) && before[key] !== after[key]);
    const storageDispatches = now.dispatches.filter((entry) => entry.kind === "storage");
    const preferenceEvents = now.dispatches.filter((entry) => entry.kind !== "storage" && entry.type === "web:settings:preference-changed");
    const keyNull = now.received.filter((entry) => entry.key === null);
    const otherAttempts = now.attempts.filter((entry) => ["set", "remove", "clear"].includes(entry.op) && otherKeys.includes(entry.key) && !exclude.includes(entry.key));
    const current = await truth(name);
    const entry = { name, storageDispatches: storageDispatches.length, preferenceEvents: preferenceEvents.length, keyNull: keyNull.length, changedOther, otherAttempts: brief(otherAttempts), truthEqual: isDeepStrictEqual(current, { ...baseTruth, rail: current.rail }), railVisibleSet: [...current.rail].sort(), appGone };
    operations.push(entry);
    check(`isolation:${name}:zero-StorageEvent-dispatches-and-zero-preference-changed-events`, storageDispatches.length === 0 && preferenceEvents.length === 0 && keyNull.length === 0, { dispatches: now.dispatches });
    check(`isolation:${name}:every-other-key-byte-identical-and-not-written`, changedOther.length === 0 && otherAttempts.length === 0, { changedOther, otherAttempts: brief(otherAttempts) });
    // After sign-out OK the App leaves by design (identity invalidated); its display is then not compared.
    if (!appGone) check(`isolation:${name}:appearance-display-pet-position-and-features-rail-set-unchanged`, entry.truthEqual && isDeepStrictEqual([...current.rail].sort(), [...R].sort()), { current, baseTruth });
    else observe(`isolation:${name}:display-after-the-app-left`, { current });
    return now;
  };
  // Drag (success), cancelled drag, failed drag, failing Retry, Export, successful Retry, Discard, Reload, sign-out step Cancel and OK.
  let D = displayOrder(S, R);
  await operation("drag", async () => {
    const g = await dragGesture(page, "isolation:drag", { source: labelOf(lang, D[0]), targets: [labelOf(lang, D[2])] });
    await assertDropWrite(page, "isolation:drag", g, S, R, reorder(D, D[0], D[2]), lang);
  });
  const S1 = merge(S, R, reorder(D, D[0], D[2]));
  D = displayOrder(S1, R);
  await operation("cancelled-drag", async () => {
    await dragGesture(page, "isolation:cancel", { source: labelOf(lang, D[0]), targets: [labelOf(lang, D[2])], end: "cancel" });
  });
  let drop = null;
  await operation("failed-drag", async () => {
    drop = await failedDrop(page, "isolation:failed", lang, { S: S1, hidden });
  });
  await operation("failing-retry", async () => {
    await openPanel(page, "isolation:retry-failing");
    await clickTestId(page, "rail-order-retry", "isolation:retry-failing");
    await delay(600);
  });
  await operation("export", async () => {
    clearDownloads();
    await clickTestId(page, "rail-order-export", "isolation:export");
    const download = await awaitDownload();
    pre("isolation:export-downloaded-the-draft-envelope", Boolean(download) && isDeepStrictEqual(parse(download.raw.toString("utf8")), envelopeOf(drop.expected)), { download: download ? download.raw.toString("utf8") : null });
  });
  await operation("successful-retry", async () => {
    await evaluate(page, `__native.allowSet(${JSON.stringify(RAIL_KEY)})`);
    await clickTestId(page, "rail-order-retry", "isolation:retry-ok");
    pre("isolation:retry-cleared-the-status", await waitUntil(page, "!__native.railStatus().present", 5000));
  });
  const S2 = drop.expected;
  await operation("discard", async () => {
    await failedDrop(page, "isolation:failed-for-discard", lang, { S: S2, hidden });
    await openPanel(page, "isolation:discard");
    await clickTestId(page, "rail-order-discard", "isolation:discard");
    pre("isolation:discard-cleared-the-status", await waitUntil(page, "!__native.railStatus().present", 4000));
    await evaluate(page, "__native.restore()");
  });
  await operation("reload", async () => {
    await externalDocument(`localStorage.setItem(${JSON.stringify(RAIL_KEY)}, "{}"); true`, "isolation:external-malformed");
    pre("isolation:source-status-after-the-external-malformed-write", await waitUntil(page, `__native.railStatus().name === ${JSON.stringify(COPY[lang].statusSourceName)}`, 4000));
    await openPanel(page, "isolation:reload-still-invalid");
    await clickTestId(page, "rail-order-reload", "isolation:reload-still-invalid");
    await delay(400);
    await externalDocument(`localStorage.setItem(${JSON.stringify(RAIL_KEY)}, ${JSON.stringify(JSON.stringify(S2))}); true`, "isolation:external-repair");
    await delay(300);
    if ((await statusNow(page)).present) {
      await openPanel(page, "isolation:reload-repair");
      await clickTestId(page, "rail-order-reload", "isolation:reload-repair");
    }
    pre("isolation:reload-repaired", await waitUntil(page, "!__native.railStatus().present", 4000));
  });
  const endTruth = await routeAndSearchTruth("isolation:end");
  check("isolation:features-route-and-search-truth-unchanged", isDeepStrictEqual(endTruth, baseRoute), { endTruth, baseRoute });
  await operation("sign-out-step-cancel", async () => {
    await failedDrop(page, "isolation:failed-for-sign-out", lang, { S: S2, hidden });
    dialogPlan.push({ accept: false, purpose: "isolation:sign-out-cancel: Cancel at the rail sign-out step" });
    const start = await signOutThroughUi(page, "isolation:sign-out-cancel", lang);
    await waitFor(() => dialogs.length > start.dialogsAt, 5000);
    await delay(800);
    dropUnusedPlans("isolation:sign-out-cancel");
    check("isolation:sign-out-cancel:one-rail-confirm", isDeepStrictEqual(dialogs.slice(start.dialogsAt).map((entry) => entry.message), [COPY[lang].confirmSignOut]), { dialogs: dialogs.slice(start.dialogsAt) });
    await closeAvatarMenu(page, "isolation:after-cancel");
  });
  // OK: the sign-out sequence continues (auth flow); its non-rail mutations must equal the 419e56d reference's exactly.
  const okNow = await operation("sign-out-step-ok", async () => {
    dialogPlan.push({ accept: true, purpose: "isolation:sign-out-ok: OK at the rail sign-out step" });
    const start = await signOutThroughUi(page, "isolation:sign-out-ok", lang);
    await waitFor(() => navigationRequests.length > start.requestsAt, 6000);
    await delay(1200);
    dropUnusedPlans("isolation:sign-out-ok");
  }, { appGone: true, exclude: reference.otherKeysChanged });
  const fixedSignOutChanges = mutationSet(okNow.attempts.filter((entry) => ["set", "remove", "clear"].includes(entry.op) && entry.key !== RAIL_KEY));
  check("isolation:sign-out-step-ok:zero-rail-writes", railOps(okNow.attempts).length === 0, { attempts: brief(railOps(okNow.attempts)) });
  check("isolation:sign-out-ok-mutates-exactly-the-keys-the-419e56d-sign-out-mutates", isDeepStrictEqual(fixedSignOutChanges, reference.mutations), { fixed: fixedSignOutChanges, before: reference.mutations });
  record("observation", { id: "isolation:sign-out-mutations", fixed: fixedSignOutChanges, before419e56d: reference.mutations, otherKeysChangedAt419e56d: reference.otherKeysChanged, dispatchesAt419e56d: reference.dispatches });
  await evaluate(page, "__native.restore()").catch(() => {});
  await endSegment(segment, null);
  record("observation", { id: "isolation:operations", operations, initialOtherKeys: Object.fromEntries(otherKeys.map((key) => [key, initialOther[key] ?? null])) });
}
/** 419e56d reference for the isolation sign-out: the same seeds, the same sign-out through the UI (no rail draft there). */
async function isolationSignOutReference(page, lang, seeds, otherKeys) {
  caseStart("isolation-419e56d-sign-out-reference");
  await seed(page, seedsFor(lang, seeds), "isolation-419e56d");
  await mountApp(page, "isolation-419e56d:mount", { path: "/app/tasks", variant: "before", hidePet: false });
  const refSegment = await beginSegment(page, "isolation-419e56d:419e56d-reference");
  const before = await evaluate(page, "__native.native.snapshot()");
  const refStart = await signOutThroughUi(page, "isolation-419e56d:sign-out", lang);
  await waitFor(() => navigationRequests.length > refStart.requestsAt, 6000);
  await delay(1200);
  const refNow = await snap(page, refStart.mark);
  const after = await evaluate(page, "__native.native.snapshot()");
  await endSegment(refSegment, null, { reference: true });
  return {
    mutations: mutationSet(refNow.attempts.filter((entry) => ["set", "remove", "clear"].includes(entry.op) && entry.key !== RAIL_KEY)),
    otherKeysChanged: otherKeys.filter((key) => before[key] !== after[key]),
    dispatches: refNow.dispatches,
  };
}
function normalizeKey(key) { return /^lswt-/.test(String(key)) ? "lswt-*" : key; }
function mutationSet(list) { return [...new Set(list.map((entry) => `${entry.op}:${normalizeKey(entry.key)}`))].sort(); }

// ===================================================================================================
// E13 — EN/ZH five-width visual (contract §9 "Responsive presentation", R-PET, "Sizing and CSS", "Screenshots")
// ===================================================================================================
const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 200 * 1024 * 1024 });
const STATUS_CSS = "packages/xai-web-shell/src/railOrderStatus.css";
/** A small CSS rule parser (the batch 48/50 convention): selectors with their at-rule context and declarations. */
function cssRules(source) {
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [];
  const atRules = [];
  const stack = [];
  let buffer = "";
  let balanced = true;
  for (const character of clean) {
    if (character === "{") {
      const prelude = buffer.trim().replace(/\s+/g, " ");
      if (prelude.startsWith("@")) { atRules.push(prelude); stack.push({ at: prelude }); } else stack.push({ selector: prelude, within: stack.filter((entry) => entry.at).map((entry) => entry.at) });
      buffer = "";
    } else if (character === "}") {
      const top = stack.pop();
      if (!top) { balanced = false; continue; }
      if (top.selector !== undefined) {
        const declarations = buffer.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
          const colon = part.indexOf(":");
          return { property: part.slice(0, colon).trim(), value: part.slice(colon + 1).trim() };
        });
        rules.push({ selectors: top.selector.split(",").map((part) => part.trim()), within: top.within, declarations });
      }
      buffer = "";
    } else buffer += character;
  }
  return { rules, atRules, balanced: balanced && stack.length === 0 };
}
/** An element (type) selector anywhere in a compound list: a token beginning with a letter outside brackets/pseudos. */
function hasElementSelector(selector) {
  const stripped = selector.replace(/\[[^\]]*\]/g, "").replace(/:{1,2}[\w-]+(\([^)]*\))?/g, "");
  return stripped.split(/[\s>+~]+/).filter(Boolean).some((compound) => /^[a-zA-Z*]/.test(compound));
}
const FORBIDDEN_TARGETS = [".app-rail", ".rail-items", ".rail-btn", ".topbar", ".topbar-controls", ".topbar-pref"];
/** Static selector audit (contract §9 "Sizing and CSS"): every added selector, its context and declarations. */
function selectorAudit() {
  const id = "css";
  caseStart("selector-audit");
  const changedCss = git(["diff", "--name-only", BEFORE_REVISION, resolved, "--", "*.css"]).trim().split("\n").filter(Boolean);
  const protectedCss = git(["diff", "--name-only", BEFORE_REVISION, resolved, "--", "packages/plugin-web-tokens", "packages/plugin-web-settings-shell", "packages/xai-web-settings-appearance", "packages/xai-web-settings-features-panel", "apps/web/src/styles"]).trim().split("\n").filter(Boolean);
  const existedBefore = (() => { try { git(["cat-file", "-e", `${BEFORE_REVISION}:${STATUS_CSS}`]); return true; } catch { return false; } })();
  const source = git(["show", `${resolved}:${STATUS_CSS}`]);
  const parsed = cssRules(source);
  const selectors = parsed.rules.flatMap((rule) => rule.selectors.map((selector) => ({ selector, within: rule.within, declarations: rule.declarations.map((entry) => `${entry.property}: ${entry.value}`) })));
  const unscoped = selectors.filter((entry) => !/^\.rail-order-status[\w-]*(?![\w-])/.test(entry.selector));
  const forbidden = selectors.filter((entry) => FORBIDDEN_TARGETS.some((token) => new RegExp(`${token.replace(/[.]/g, "\\.")}(?![\\w-])`).test(entry.selector) || entry.selector.includes(`${token}-`) && token === ".topbar-pref"));
  const elements = selectors.filter((entry) => hasElementSelector(entry.selector));
  const usesPrefOption = selectors.filter((entry) => entry.selector.includes("topbar-pref-option"));
  const focusRules = parsed.rules.filter((rule) => rule.selectors.some((selector) => selector.includes(":focus-visible")));
  record("selector-audit", { changedCss, protectedCss, existedBefore, sha256: sha256(source), bytes: source.length, atRules: parsed.atRules, balanced: parsed.balanced, selectors, focusRules });
  check(`${id}:only-the-new-shell-stylesheet-changed-and-it-is-new`, isDeepStrictEqual(changedCss, [STATUS_CSS]) && !existedBefore, { changedCss, existedBefore });
  check(`${id}:tokens-settings-shell-appearance-features-and-global-styles-unchanged`, protectedCss.length === 0, { protectedCss });
  check(`${id}:balanced-and-only-the-767px-media-query`, parsed.balanced && parsed.atRules.every((at) => at === "@media (max-width: 767px)"), { atRules: parsed.atRules });
  check(`${id}:every-added-selector-begins-with-rail-order-status`, selectors.length > 0 && unscoped.length === 0, { unscoped });
  check(`${id}:no-rule-targets-the-rail-topbar-controls-or-topbar-pref`, forbidden.length === 0, { forbidden });
  check(`${id}:no-element-selector`, elements.length === 0, { elements });
  check(`${id}:no-topbar-pref-option-class-and-focus-visible-rule-present`, usesPrefOption.length === 0 && focusRules.length === 1 && focusRules[0].declarations.some((entry) => entry.property === "outline" && entry.value !== "none"), { usesPrefOption, focusRules });
}
/** The bundled stylesheet: every section other than the new file's is byte-identical to the 419e56d bundle's. */
function bundleCssAudit() {
  caseStart("bundle-css-audit");
  const sections = (text) => {
    const out = [];
    let current = { name: "(preamble)", lines: [] };
    for (const line of text.split("\n")) {
      const match = /^\/\* ([^*]+\.css) \*\/$/.exec(line);
      if (match) { out.push(current); current = { name: match[1], lines: [] }; } else current.lines.push(line);
    }
    out.push(current);
    return out.map((entry) => ({ name: entry.name, sha256: sha256(entry.lines.join("\n")), bytes: entry.lines.join("\n").length }));
  };
  const fixed = sections(bundles.fixed.css);
  const before = sections(bundles.before.css);
  const fixedWithout = fixed.filter((entry) => !entry.name.endsWith("railOrderStatus.css"));
  const added = fixed.filter((entry) => entry.name.endsWith("railOrderStatus.css"));
  record("bundle-css-sections", { fixed: fixed.map((entry) => `${entry.name}:${entry.sha256.slice(0, 12)}`), before: before.map((entry) => `${entry.name}:${entry.sha256.slice(0, 12)}`) });
  check("css:bundle-adds-exactly-the-new-stylesheet-every-other-section-byte-identical-and-in-the-same-order", added.length === 1 && isDeepStrictEqual(fixedWithout, before), { added, fixedSections: fixed.length, beforeSections: before.length, firstMismatch: fixedWithout.find((entry, index) => !isDeepStrictEqual(entry, before[index])) ?? null });
}

/** One read of the presentation: new controls (centre + four 25 % insets), Topbar controls, rail, pet, scroll widths. */
const PROBE = `(() => {
  const r = (v) => Math.round(v * 100) / 100;
  const box = (el) => { const b = el.getBoundingClientRect(); return { left: r(b.left), top: r(b.top), right: r(b.right), bottom: r(b.bottom), width: r(b.width), height: r(b.height) }; };
  const vw = innerWidth, vh = innerHeight;
  const topbar = document.querySelector('header.topbar');
  const tb = topbar ? box(topbar) : null;
  const pets = [...document.querySelectorAll('.pet-wrap, .pet-swap-btn')].map((el) => el.getBoundingClientRect()).filter((b) => b.width > 0 && b.height > 0);
  const petBox = pets.length ? { left: Math.min(...pets.map((b) => b.left)), top: Math.min(...pets.map((b) => b.top)), right: Math.max(...pets.map((b) => b.right)), bottom: Math.max(...pets.map((b) => b.bottom)) } : null;
  const overlap = (a, b) => (!a || !b) ? 0 : Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const tagOf = (hit) => hit ? hit.tagName.toLowerCase() + (typeof hit.className === 'string' && hit.className.trim() ? '.' + hit.className.trim().split(/\\s+/)[0] : '') : null;
  const points = (el) => { const b = el.getBoundingClientRect();
    return [[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]].map(([fx, fy]) => { const x = b.left + b.width * fx, y = b.top + b.height * fy; const hit = document.elementFromPoint(x, y);
      return { x: r(x), y: r(y), on: !!hit && el.contains(hit), pet: !!hit && !!hit.closest('.pet-wrap'), hit: tagOf(hit) }; }); };
  const control = (el, name) => { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); const b = box(el); const p = points(el); const s = getComputedStyle(el);
    return { name, box: b, centre: p[0].on, insets: p.slice(1).every((q) => q.on), centrePet: p[0].pet, anyPet: p.some((q) => q.pet), points: p,
      inViewport: b.left >= -0.01 && b.right <= vw + 0.01 && b.top >= -0.01 && b.bottom <= vh + 0.01, inTopbarX: tb ? (b.left >= tb.left - 0.01 && b.right <= tb.right + 0.01) : null,
      visible: s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0, size44: b.width >= 43.99 && b.height >= 43.99, petOverlap: r(overlap(b, petBox)), classes: el.className }; };
  const statusButton = document.querySelector('[data-testid="rail-order-status"]');
  const panel = document.querySelector('[data-testid="rail-order-panel"]');
  const textEl = statusButton ? statusButton.querySelector('.rail-order-status-text') : null;
  const panelBox = panel ? box(panel) : null;
  const actions = panel ? [...panel.querySelectorAll('button[data-testid^="rail-order-"]')].map((el) => { const c = control(el, el.getAttribute('data-testid')); c.insidePanel = c.box.left >= panelBox.left - 0.01 && c.box.right <= panelBox.right + 0.01 && c.box.top >= panelBox.top - 0.01 && c.box.bottom <= panelBox.bottom + 0.01; return c; }) : [];
  const popover = document.querySelector('#topbar-pref-panel');
  const topbarControls = topbar ? [...topbar.querySelectorAll('button, a[href], input, select, textarea, [role="button"]')].filter((el) => !(panel && panel.contains(el)) && !(popover && popover.contains(el)))
    .filter((el) => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0; })
    .map((el) => control(el, el.getAttribute('data-testid') || el.getAttribute('aria-label') || (typeof el.className === 'string' ? el.className.trim().split(/\\s+/)[0] : el.tagName.toLowerCase()))) : [];
  const railButtons = [...document.querySelectorAll('.app-rail .rail-btn')].filter((el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden').map((el) => { const b = el.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const hit = document.elementFromPoint(x, y);
    return { name: el.getAttribute('aria-label'), inViewport: x >= 0 && x <= vw && y >= 0 && y <= vh, centre: !!hit && el.contains(hit), centrePet: !!hit && !!hit.closest('.pet-wrap'), hit: tagOf(hit) }; });
  const main = document.querySelector('.app-main');
  const se = document.scrollingElement || document.documentElement;
  const panelStyle = panel ? getComputedStyle(panel) : null;
  return {
    viewport: { width: vw, height: vh, scale: window.visualViewport ? visualViewport.scale : 1, vvWidth: window.visualViewport ? r(visualViewport.width) : vw },
    topbar: tb, topbarScroll: topbar ? { scrollWidth: topbar.scrollWidth, clientWidth: topbar.clientWidth } : null,
    scroll: { document: { scrollWidth: se.scrollWidth, clientWidth: se.clientWidth, scrollX: window.scrollX }, appMain: main ? { scrollWidth: main.scrollWidth, clientWidth: main.clientWidth, scrollLeft: main.scrollLeft } : null },
    status: statusButton ? { ...control(statusButton, 'rail-order-status'), name: statusButton.getAttribute('aria-label'), expanded: statusButton.getAttribute('aria-expanded'), text: textEl ? textEl.textContent.replace(/\\s+/g, ' ').trim() : null,
      textVisible: !!textEl && getComputedStyle(textEl).display !== 'none' && textEl.getBoundingClientRect().width > 0 } : null,
    statusRoots: document.querySelectorAll('.rail-order-status').length,
    panel: panel ? { box: panelBox, position: panelStyle.position, inViewport: panelBox.left >= -0.01 && panelBox.right <= vw + 0.01 && panelBox.top >= -0.01 && panelBox.bottom <= vh + 0.01, petOverlap: r(overlap(panelBox, petBox)),
      message: (panel.querySelector('[data-testid="rail-order-message"]') || {}).textContent || null, scroll: { scrollWidth: panel.scrollWidth, clientWidth: panel.clientWidth } } : null,
    actions, topbarControls, railButtons, petBox: petBox ? { left: r(petBox.left), top: r(petBox.top), right: r(petBox.right), bottom: r(petBox.bottom) } : null,
    appearanceStatus: !!document.querySelector('[data-testid="appearance-status"]'),
    controlsOrder: __native.topbar().controlsOrder, rail: __native.railNames(),
  };
})()`;
const noHorizontalScroll = (probe) => probe.scroll.document.scrollWidth <= probe.scroll.document.clientWidth && probe.scroll.document.scrollX === 0 && (!probe.scroll.appMain || probe.scroll.appMain.scrollWidth <= probe.scroll.appMain.clientWidth);
/** Wording and presentation of the status for `kind` at `width` (text from 768 px; icon only at 767 px and below). */
function statusPresentationOk(probe, lang, kind, width) {
  const s = probe.status;
  if (!s) return false;
  const name = kind === "source" ? COPY[lang].statusSourceName : COPY[lang].statusDraftName;
  const text = kind === "source" ? COPY[lang].statusSourceText : COPY[lang].statusDraftText;
  return s.name === name && s.text === text && s.textVisible === (width >= 768) && probe.statusRoots === 1;
}
/** Gated (pet hidden) presentation checks for the new controls of one state. */
function gatedChecks(id, probe, lang, kind, width, { open, both = false }) {
  const s = probe.status;
  check(`${id}:viewport-unzoomed`, probe.viewport.width === width && probe.viewport.scale === 1 && Math.abs(probe.viewport.vvWidth - width) < 0.01, { viewport: probe.viewport });
  check(`${id}:status-wording-and-text-visibility-for-the-width`, statusPresentationOk(probe, lang, kind, width), { status: s ? { name: s.name, text: s.text, textVisible: s.textVisible } : null });
  check(`${id}:status-centre-and-four-insets-hit-not-covered-44x44-in-topbar-and-viewport`, Boolean(s) && s.centre && s.insets && s.size44 && s.inViewport && s.inTopbarX && s.visible, { status: s });
  check(`${id}:slot-immediately-before-topbar-pref${both ? "-after-the-appearance-status" : ""}`, probe.controlsOrder[probe.controlsOrder.indexOf("rail-order-status-root") + 1] === "topbar-pref" && (!both || probe.controlsOrder[probe.controlsOrder.indexOf("rail-order-status-root") - 1] === "appearance-status"), { controlsOrder: probe.controlsOrder });
  check(`${id}:no-horizontal-scroll-document-or-app-main`, noHorizontalScroll(probe), { scroll: probe.scroll });
  check(`${id}:topbar-does-not-overflow`, probe.topbarScroll && probe.topbarScroll.scrollWidth <= probe.topbarScroll.clientWidth, { topbarScroll: probe.topbarScroll });
  if (open) {
    const expected = actionsFor(lang, kind === "source" ? "source" : "draft").map((entry) => entry.testid);
    check(`${id}:panel-open-contained-in-the-viewport-no-inner-horizontal-scroll`, Boolean(probe.panel) && probe.panel.inViewport && probe.panel.scroll.scrollWidth <= probe.panel.scroll.clientWidth && s.expanded === "true", { panel: probe.panel });
    check(`${id}:panel-actions-exact-each-centre-and-four-insets-hit-44x44-inside-panel-and-viewport`, isDeepStrictEqual(probe.actions.map((entry) => entry.name), expected) && probe.actions.every((entry) => entry.centre && entry.insets && entry.size44 && entry.inViewport && entry.insidePanel && entry.visible),
      { actions: probe.actions });
  } else {
    check(`${id}:panel-closed`, probe.panel === null && s && s.expanded === "false", { expanded: s?.expanded });
  }
  // Every Topbar control inside the viewport and centre-hit (required with both statuses visible; checked in every status state).
  check(`${id}:every-topbar-control-inside-the-viewport-and-topbar-centre-hit-visible`, probe.topbarControls.length > 0 && probe.topbarControls.every((entry) => entry.inViewport && entry.inTopbarX && entry.centre && entry.visible),
    { controls: probe.topbarControls.map((entry) => ({ name: entry.name, box: entry.box, centre: entry.centre, inViewport: entry.inViewport, inTopbarX: entry.inTopbarX, hit: entry.points[0].hit })) });
  if (both) check(`${id}:both-statuses-visible`, probe.appearanceStatus && Boolean(s), {});
}
const occlusions = (probe) => ({
  rail: probe.railButtons.filter((entry) => entry.inViewport && !entry.centre).map((entry) => ({ name: entry.name, hit: entry.hit, pet: entry.centrePet })),
  topbar: probe.topbarControls.filter((entry) => !entry.centre || entry.anyPet).map((entry) => ({ name: entry.name, hit: entry.points[0].hit, pet: entry.centrePet })),
});
/** R-PET blocking checks for the new controls (pet on at its default position). */
function petOnChecks(id, probe, { open }) {
  const s = probe.status;
  check(`${id}:pet-on:status-centre-and-four-insets-land-on-the-control`, Boolean(s) && s.centre && s.insets && !s.anyPet, { status: s && { points: s.points, box: s.box }, petBox: probe.petBox });
  if (open) {
    check(`${id}:pet-on:every-panel-action-centre-and-four-insets-land-on-the-control`, probe.actions.length > 0 && probe.actions.every((entry) => entry.centre && entry.insets && !entry.anyPet), { actions: probe.actions.map((entry) => ({ name: entry.name, points: entry.points })) });
    check(`${id}:pet-on:open-panel-box-does-not-intersect-the-pet-box`, Boolean(probe.panel) && probe.panel.petOverlap === 0, { panel: probe.panel?.box, petBox: probe.petBox, overlap: probe.panel?.petOverlap });
  }
}
async function probe(page) {
  await parkMouse(page);
  await delay(250);
  return evaluate(page, PROBE);
}
/** Pet default position (contract §3 item 13: left edge innerWidth − 108) with no stored position. */
async function petAtDefault(page, label) {
  const state = await evaluate(page, `(() => { const w = document.querySelector('.pet-wrap'); const b = w ? w.getBoundingClientRect() : null; return { present: !!w, left: b ? Math.round(b.left * 100) / 100 : null, top: b ? Math.round(b.top * 100) / 100 : null, width: innerWidth, height: innerHeight, stored: __native.native.get('xai_pet_pos') }; })()`);
  pre(`${label}:pet-on-at-its-default-position`, state.present && Math.abs(state.left - (state.width - 108)) < 1 && Math.abs(state.top - (state.height - 108)) < 1 && state.stored === null, { state });
  return state;
}
/** Returns every scroller to its origin (a trusted click's scrollIntoView may scroll the document; recorded). */
async function resetScrollers(page, label) {
  const scrolled = await evaluate(page, "(() => { const out = []; for (const e of [document.scrollingElement, ...document.querySelectorAll('*')]) { if (e && (e.scrollTop || e.scrollLeft)) { out.push({ el: e === document.scrollingElement ? 'document' : (e.className || e.tagName).toString().slice(0, 40), top: e.scrollTop, left: e.scrollLeft }); e.scrollTop = 0; e.scrollLeft = 0; } } return out; })()");
  if (scrolled.length) observe(`${label}:scrollers-returned-to-origin-after-a-toggle-click`, { scrolled });
  await delay(100);
  return scrolled;
}
/** Shows the pet again through its own rail toggle (trusted, hit-tested). */
async function showThePet(page, label, lang) {
  await trustedClick(page, `.app-rail .rail-bottom .rail-btn[aria-label=${JSON.stringify(facts0.labels[lang].nav.pet)}]`, `${label}:pet-toggle-on`);
  pre(`${label}:pet-shown-through-the-rail-toggle`, await waitUntil(page, "!!document.querySelector('.pet-wrap')", 3000));
  await parkMouse(page);
}
/**
 * Gated mount (R-PET gated mode): the pet is hidden through its own rail toggle by a trusted click; the toggle is hidden at
 * 767 px and below, so those widths are mounted at 1440, toggled, then resized (no stored `top` rail position there).
 */
async function gatedMount(page, label, lang, width, { S = null, raw = undefined, extra = {}, path = "/app/tasks", variant = "fixed", ready = READY_APP } = {}) {
  const mountWidth = width >= 768 ? width : 1440;
  await setViewport(page, vpOf(mountWidth));
  const result = await mountSeeded(page, label, lang, { S, raw, extra, path, variant, ready, hidePet: true });
  // The trusted click scrolls the pet toggle into view (scrollIntoView, as every trusted click); where the rail is taller
  // or wider than the viewport that scrolls the document. Every scroller is returned to its origin before probing.
  await resetScrollers(page, label);
  if (mountWidth !== width) await setViewport(page, vpOf(width));
  pre(`${label}:pet-hidden`, !(await evaluate(page, "!!document.querySelector('.pet-wrap')")));
  return { ...result, resizedFrom: mountWidth !== width ? mountWidth : null };
}
async function petOnMount(page, label, lang, width, { S = null, raw = undefined, extra = {}, path = "/app/tasks", variant = "fixed" } = {}) {
  await setViewport(page, vpOf(width));
  const result = await mountSeeded(page, label, lang, { S, raw, extra, path, variant, hidePet: false });
  await petAtDefault(page, `${label}:mounted`);
  return result;
}
/** A failed draft by a trusted drop at the current width (gated when the pet is hidden; see the R-PET handling). */
async function makeFailedDraft(page, label, lang, S) {
  return failedDrop(page, label, lang, { S });
}
const shotName = (lang, state, width) => `${state}-${width}`;
/** An Appearance draft (theme Dark through the Topbar with its write denied): the Appearance Topbar status shows (batch 61 helper). */
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

async function runVisual(lang) {
  const page = mainPage;
  record("observation", { id: "visual:viewports", lang, viewports: WIDTHS.map((width) => ({ width, height: HEIGHTS[width], mobileEmulation: width <= 414, dpr: 1 })) });
  await setViewport(page, vpOf(1440));
  caseStart("prime-archive-facts");
  await seed(page, seedsFor(lang), "prime");
  await mountApp(page, "prime:mount", { path: "/app/tasks", hidePet: false });
  if (selected("css")) { selectorAudit(); bundleCssAudit(); }
  if (selected("before")) await visualBeforeCaptures(page, lang);
  if (selected("gated")) for (const width of WIDTHS) await visualGated(page, lang, width);
  if (selected("petOn")) for (const width of WIDTHS) await visualPetOn(page, lang, width);
  if (selected("focus")) for (const width of [1440, 375]) await visualFocusOutlines(page, lang, width);
  if (selected("preview")) await visualDragPreview(page, lang);
  if (selected("r1") && lang === "en") await visualR1Sequence(page);
  await setViewport(page, VIEWPORT);
}

/** §9 screenshots: the 419e56d route error for `{}` and `1` (before captures, recorded; never judged as the product). */
async function visualBeforeCaptures(page, lang) {
  for (const [label, raw] of [["object-empty", "{}"], ["number-1", "1"]]) {
    const id = `before-419e56d-${lang}-${label}`;
    caseStart(id);
    await setViewport(page, vpOf(1440));
    await seed(page, seedsFor(lang, { [RAIL_KEY]: raw }), id);
    await mountApp(page, `${id}:mount`, { path: "/app/tasks", variant: "before", requireApp: false, hidePet: false });
    const routeError = await evaluate(page, "__native.routeError()");
    pre(`${id}:419e56d-shows-the-route-error`, routeError && routeError.heading.startsWith("Route Error (app)") && /prefOrder is not iterable/.test(routeError.message ?? ""), { routeError });
    record("observation", { id: `${id}:route-error`, routeError, raw });
    await screenshot(page, `before-419e56d-route-error-${label}-1440`, { state: `419e56d with xai_rail_order = ${raw}: the app route error (before capture)`, width: 1440, height: 900, variant: "before" });
    // The fixed product with the same bytes on the same route (recorded side by side; judged in E9/E12).
    await seed(page, seedsFor(lang, { [RAIL_KEY]: raw }), `${id}:fixed`);
    const { state } = await mountApp(page, `${id}:fixed:mount`, { path: "/app/tasks", hidePet: false });
    check(`${id}:fixed-renders-with-the-source-status-instead`, state.ready && (await evaluate(page, "__native.routeError()")) === null && statusMatches(await statusNow(page), lang, "source"), {});
  }
}

/** Every §9 state at one width with the pet hidden (gated). */
async function visualGated(page, lang, width) {
  const REV = REVERSED();
  const states = [
    { state: "clean-default-left", seedS: null },
    { state: "clean-custom-left", seedS: REV },
    ...(width >= 768 ? [{ state: "clean-default-top", seedS: null, extra: { [RAIL_POS_KEY]: "top" } }, { state: "clean-custom-top", seedS: REV, extra: { [RAIL_POS_KEY]: "top" } }] : []),
  ];
  // Clean states have no new control; their layout (scroll widths, Topbar controls, rail) is judged against the same
  // state at 419e56d (a pre-existing overflow is recorded, not attributed to this caller).
  for (const entry of states) {
    const id = `gated-${lang}-${width}-${entry.state}`;
    caseStart(id);
    const seen = {};
    for (const variant of ["before", "fixed"]) {
      const label = `${id}:${variant === "before" ? "419e56d" : "fixed"}`;
      await gatedMount(page, label, lang, width, { S: entry.seedS, extra: entry.extra ?? {}, variant });
      const segment = await beginSegment(page, `${label}${variant === "before" ? ":419e56d-reference" : ""}`);
      const p = await probe(page);
      seen[variant] = { p, layout: { scroll: p.scroll, topbar: p.topbar, topbarScroll: p.topbarScroll, controls: p.topbarControls.map((c) => ({ name: c.name, box: c.box, centre: c.centre, inViewport: c.inViewport })), rail: p.rail } };
      await endSegment(segment, variant === "before" ? null : ZERO, variant === "before" ? { reference: true } : {});
    }
    const p = seen.fixed.p;
    const expectedRail = idsToLabels(lang, displayOrder(entry.seedS ?? facts0.registryDefault, visibleIds()));
    check(`${id}:clean-no-status-node-and-the-expected-rail-order-unzoomed`, p.status === null && p.statusRoots === 0 && isDeepStrictEqual(p.rail, expectedRail) && p.viewport.scale === 1, { status: p.status, rail: p.rail });
    check(`${id}:clean-layout-scroll-widths-topbar-controls-and-rail-identical-to-419e56d`, isDeepStrictEqual(seen.fixed.layout, seen.before.layout), { fixed: seen.fixed.layout, before: seen.before.layout });
    observe(`${id}:clean-layout`, { noHorizontalScroll: noHorizontalScroll(p), scroll: p.scroll, controls: seen.fixed.layout.controls, occlusions: occlusions(p), viewport: p.viewport, railPos: await evaluate(page, ATTRIBUTES("aside.app-rail")) });
    if (!noHorizontalScroll(p)) observe(`${id}:pre-existing-horizontal-overflow-also-at-419e56d`, { fixed: p.scroll, before: seen.before.p.scroll });
  }
  // A failed draft: the status with the panel closed and open.
  {
    const id = `gated-${lang}-${width}-failed`;
    caseStart(id);
    await gatedMount(page, id, lang, width, { S: REV });
    const segment = await beginSegment(page, id);
    const drop = await makeFailedDraft(page, id, lang, REV);
    let p = await probe(page);
    gatedChecks(`${id}:closed`, p, lang, "failed", width, { open: false });
    check(`${id}:the-dropped-order-is-displayed`, isDeepStrictEqual(p.rail, idsToLabels(lang, drop.P)), { rail: p.rail });
    if (width === 375 || width === 1440) await screenshot(page, `${shotName(lang, "failed-closed", width)}`, { state: `failed draft, status, panel closed, ${width}×${HEIGHTS[width]}, pet hidden`, width, height: HEIGHTS[width] });
    await openPanel(page, id);
    p = await probe(page);
    gatedChecks(`${id}:open`, p, lang, "failed", width, { open: true });
    check(`${id}:open:message-is-the-was-not-saved-message`, p.panel?.message === COPY[lang].notSaved, { message: p.panel?.message });
    if (width === 375 || width === 1440) await screenshot(page, `${shotName(lang, "failed-open", width)}`, { state: `failed draft, status and open panel, ${width}×${HEIGHTS[width]}, pet hidden`, width, height: HEIGHTS[width] });
    record("observation", { id: `${id}:geometry`, status: p.status?.box, panel: p.panel?.box, panelPosition: p.panel?.position, actions: p.actions.map((entry) => ({ name: entry.name, box: entry.box })), topbar: p.topbar });
    await evaluate(page, "__native.restore()");
    await endSegment(segment, ZERO);
  }
  // A source issue: the status and the open panel.
  {
    const id = `gated-${lang}-${width}-source`;
    caseStart(id);
    await gatedMount(page, id, lang, width, { raw: "{}" });
    const segment = await beginSegment(page, id);
    let p = await probe(page);
    gatedChecks(`${id}:closed`, p, lang, "source", width, { open: false });
    await openPanel(page, id);
    p = await probe(page);
    gatedChecks(`${id}:open`, p, lang, "source", width, { open: true });
    check(`${id}:open:message-is-the-unavailable-message`, p.panel?.message === COPY[lang].unavailable, { message: p.panel?.message });
    if (width === 375 || width === 1440) await screenshot(page, `${shotName(lang, "source-open", width)}`, { state: `source issue ({}), status and open panel, ${width}×${HEIGHTS[width]}, pet hidden`, width, height: HEIGHTS[width] });
    record("observation", { id: `${id}:geometry`, status: p.status?.box, panel: p.panel?.box, panelPosition: p.panel?.position, actions: p.actions.map((entry) => ({ name: entry.name, box: entry.box })) });
    await endSegment(segment, ZERO);
  }
  // The Appearance status and the rail status both visible.
  {
    const id = `gated-${lang}-${width}-both`;
    caseStart(id);
    await gatedMount(page, id, lang, width, { S: REV });
    const segment = await beginSegment(page, id);
    await makeFailedDraft(page, id, lang, REV);
    await failTopbarTheme(page, id, lang);
    let p = await probe(page);
    gatedChecks(`${id}:closed`, p, lang, "failed", width, { open: false, both: true });
    if (width === 375 || width === 768) await screenshot(page, `${shotName(lang, "both-statuses", width)}`, { state: `Appearance and rail statuses both visible, ${width}×${HEIGHTS[width]}, pet hidden`, width, height: HEIGHTS[width] });
    await openPanel(page, id);
    p = await probe(page);
    gatedChecks(`${id}:open`, p, lang, "failed", width, { open: true, both: true });
    record("observation", { id: `${id}:geometry`, controls: p.topbarControls.map((entry) => ({ name: entry.name, box: entry.box })), panel: p.panel?.box });
    await evaluate(page, "__native.restore()");
    await endSegment(segment, ZERO);
  }
}

/** The R-PET run at one width: the pet on at its default position (blocking for the new controls; occlusions recorded). */
async function visualPetOn(page, lang, width) {
  const REV = REVERSED();
  // Clean references, 419e56d and fixed: occlusion of unchanged controls (recorded, not blocking).
  const clean = {};
  for (const variant of ["before", "fixed"]) {
    const id = `peton-${lang}-${width}-clean-${variant === "before" ? "419e56d" : "fixed"}`;
    caseStart(id);
    await petOnMount(page, id, lang, width, { S: REV, variant });
    const segment = await beginSegment(page, `${id}${variant === "before" ? ":419e56d-reference" : ""}`);
    const p = await probe(page);
    clean[variant] = occlusions(p);
    record("observation", { id: `${id}:occlusions`, occlusions: clean[variant], petBox: p.petBox });
    await endSegment(segment, variant === "before" ? null : ZERO, variant === "before" ? { reference: true } : {});
  }
  record("observation", { id: `peton-${lang}-${width}:unchanged-control-occlusion-before-and-after`, before419e56d: clean.before, fixed: clean.fixed, equal: isDeepStrictEqual(clean.before, clean.fixed) });
  // Failed draft. At 768 px and above the drag runs gated (pet hidden through its toggle, then shown again at its default
  // position); below 768 px the toggle is hidden, so the drag runs with the pet on and uncovered source and target.
  for (const both of [false, true]) {
    const id = `peton-${lang}-${width}-${both ? "both" : "failed"}`;
    caseStart(id);
    await petOnMount(page, id, lang, width, { S: REV });
    const segment = await beginSegment(page, id);
    if (width >= 768) {
      await hideThePet(page, id);
      await resetScrollers(page, `${id}:hidden`);
      await makeFailedDraft(page, id, lang, REV);
      await showThePet(page, id, lang);
      await resetScrollers(page, `${id}:shown`);
    } else {
      await makeFailedDraft(page, id, lang, REV);
    }
    if (both) await failTopbarTheme(page, id, lang);
    await petAtDefault(page, `${id}:probe`);
    let p = await probe(page);
    petOnChecks(`${id}:closed`, p, { open: false });
    check(`${id}:closed:status-wording-for-the-width`, statusPresentationOk(p, lang, "failed", width), {});
    await openPanel(page, id);
    p = await probe(page);
    petOnChecks(`${id}:open`, p, { open: true });
    record("observation", { id: `${id}:occlusions`, occlusions: occlusions(p), petBox: p.petBox, panel: p.panel?.box });
    if (width === 768 && !both) await screenshot(page, `${shotName(lang, "peton-failed-open", width)}`, { state: `pet on at its default position, failed draft, open panel, ${width}×${HEIGHTS[width]}`, width, height: HEIGHTS[width] });
    await evaluate(page, "__native.restore()");
    await endSegment(segment, ZERO);
  }
  // Source issue.
  {
    const id = `peton-${lang}-${width}-source`;
    caseStart(id);
    await petOnMount(page, id, lang, width, { raw: "{}" });
    const segment = await beginSegment(page, id);
    let p = await probe(page);
    petOnChecks(`${id}:closed`, p, { open: false });
    await openPanel(page, id);
    p = await probe(page);
    petOnChecks(`${id}:open`, p, { open: true });
    record("observation", { id: `${id}:occlusions`, occlusions: occlusions(p), petBox: p.petBox, panel: p.panel?.box });
    await endSegment(segment, ZERO);
  }
}

/** Selector audit, runtime part: each new control's computed outline when focused by trusted Tab / Shift+Tab. */
async function visualFocusOutlines(page, lang, width) {
  const read = `(() => { const el = document.activeElement; const s = getComputedStyle(el); return { testid: el.getAttribute('data-testid'), focusVisible: el.matches(':focus-visible'), outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, outlineColor: s.outlineColor, outlineOffset: s.outlineOffset, classes: el.className }; })()`;
  const outlineOk = (entry) => entry.focusVisible && entry.outlineStyle === "solid" && entry.outlineWidth === "2px" && entry.outlineOffset === "2px" && !String(entry.classes).includes("topbar-pref-option");
  for (const kind of ["failed", "source"]) {
    const id = `focus-${lang}-${width}-${kind}`;
    caseStart(id);
    await gatedMount(page, id, lang, width, kind === "source" ? { raw: "{}" } : { S: REVERSED() });
    const segment = await beginSegment(page, id);
    if (kind === "failed") await makeFailedDraft(page, id, lang, REVERSED());
    await openPanel(page, id);
    pre(`${id}:focus-on-the-status-button-after-the-trusted-click`, (await evaluate(page, "document.activeElement && document.activeElement.getAttribute('data-testid')")) === "rail-order-status");
    const order = kind === "failed" ? ["rail-order-retry", "rail-order-discard", "rail-order-export"] : ["rail-order-reload"];
    const seen = [];
    for (const testid of order) {
      await press(page, "Tab");
      seen.push(await evaluate(page, read));
    }
    for (let index = 0; index < order.length; index += 1) await press(page, "Shift+Tab");
    seen.push(await evaluate(page, read));
    record("focus-outlines", { id, width, kind, seen });
    check(`${id}:trusted-tab-reaches-the-panel-actions-in-order-and-shift-tab-returns-to-the-status`, isDeepStrictEqual(seen.map((entry) => entry.testid), [...order, "rail-order-status"]), { seen: seen.map((entry) => entry.testid) });
    for (const entry of seen) check(`${id}:${entry.testid}:computed-focus-outline-visible-2px-solid-offset-2px`, outlineOk(entry), entry);
    await evaluate(page, "__native.restore()");
    await endSegment(segment, ZERO);
  }
}

/** §9: at 1440 only, a drag in progress (the preview), captured while the gesture is open. */
async function visualDragPreview(page, lang) {
  const id = `preview-${lang}-1440`;
  caseStart(id);
  const S = REVERSED();
  await gatedMount(page, id, lang, 1440, { S });
  const segment = await beginSegment(page, id);
  const R = visibleIds();
  const D0 = displayOrder(S, R);
  const P = reorder(D0, D0[0], D0[2]);
  const gesture = await dragGesture(page, id, { source: labelOf(lang, D0[0]), targets: [labelOf(lang, D0[2])], onHold: async () => {
    const view = await evaluate(page, `(() => { const p = ${PROBE}; return { probe: p, dragging: __native.rail().filter((entry) => entry.dragging).map((entry) => entry.name), bytes: __native.native.get(${JSON.stringify(RAIL_KEY)}) }; })()`);
    const shot = await screenshot(page, `drag-preview-1440`, { state: "a trusted drag in progress (the preview), 1440×900, pet hidden", width: 1440, height: 900 });
    return { ...view, shot: shot.file };
  } });
  const hold = gesture.holdResult;
  check(`${id}:preview-shows-P-dragging-class-bytes-unchanged-no-status`, isDeepStrictEqual(hold.probe.rail, idsToLabels(lang, P)) && isDeepStrictEqual(hold.dragging, [labelOf(lang, D0[0])]) && hold.bytes === JSON.stringify(S) && hold.probe.status === null,
    { rail: labelsToIds(lang, hold.probe.rail), dragging: hold.dragging });
  check(`${id}:no-horizontal-scroll-during-the-drag`, noHorizontalScroll(hold.probe), { scroll: hold.probe.scroll });
  await assertDropWrite(page, id, gesture, S, R, P, lang);
  await endSegment(segment, ZERO);
}

async function toggleFeature(page, id, expectValue, label) {
  const mark = await markOf(page);
  await trustedClick(page, `${FEATURES_PANE} [data-feature-id="${id}"] [role="switch"]`, `${label}:features-switch-${id}`);
  const settled = await waitUntil(page, `__native.native.get(${JSON.stringify(featureKey(id))}) === ${JSON.stringify(String(expectValue))} && document.querySelector('${FEATURES_PANE} [data-feature-id="${id}"] [role="switch"]').getAttribute('aria-checked') === ${JSON.stringify(String(expectValue))}`, 8000);
  await delay(500);
  const view = await evaluate(page, `__native.window(${mark})`);
  pre(`${label}:features-toggle-${id}-by-trusted-click-committed`, settled);
  return { railAttempts: view.attempts.filter((entry) => entry.key === RAIL_KEY) };
}
/** §9 screenshots: the R-1 sequence at 1440 EN (Boards hidden, after the drop, after re-enabling). */
async function visualR1Sequence(page) {
  const lang = "en";
  const id = "r1-en-1440";
  caseStart(id);
  const S = BOARD_AT_2;
  await gatedMount(page, id, lang, 1440, { S, extra: featuresWith([]), path: "/app/settings/features", ready: READY_FEATURES });
  const segment = await beginSegment(page, id);
  const off = await toggleFeature(page, "board", false, `${id}:off`);
  const R = visibleIds(["board"]);
  const D = displayOrder(S, R);
  check(`${id}:boards-hidden-from-the-rail`, isDeepStrictEqual(await railNow(page), idsToLabels(lang, D)));
  await screenshot(page, `${id}-boards-hidden`, { state: "R-1: Boards turned off through the real Features pane (seeded order had Boards at index 2)", width: 1440, height: 900 });
  const gesture = await dragGesture(page, `${id}:drag`, { source: labelOf(lang, D[0]), targets: [labelOf(lang, D[2])] });
  const P = reorder(D, D[0], D[2]);
  const { expected } = await assertDropWrite(page, id, gesture, S, R, P, lang);
  check(`${id}:board-keeps-index-2-in-the-bytes`, expected.indexOf("board") === 2 && parse(await bytesNow(page)).indexOf("board") === 2);
  await screenshot(page, `${id}-after-drop`, { state: "R-1: after a trusted drag and drop with Boards hidden", width: 1440, height: 900 });
  const on = await toggleFeature(page, "board", true, `${id}:on`);
  const shown = labelsToIds(lang, await railNow(page));
  check(`${id}:re-enabled-boards-displays-at-index-2-and-toggles-wrote-no-order`, shown.indexOf("board") === 2 && off.railAttempts.length === 0 && on.railAttempts.length === 0, { shown });
  await screenshot(page, `${id}-after-re-enabling`, { state: "R-1: after Boards was turned on again: back at index 2", width: 1440, height: 900 });
  await endSegment(segment, ZERO);
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
  record("observation", { id: "baseline:fixture-delta-against-batch-61-fixture", ...fixtureDelta });
  pre("baseline:fixture-is-the-batch-61-fixture-plus-exactly-the-two-readers", isDeepStrictEqual(fixtureDelta.removed, FIXTURE_DELTA_EXPECTED.removed) && isDeepStrictEqual(fixtureDelta.added, FIXTURE_DELTA_EXPECTED.added) && fixtureDelta.lines === fixtureDelta.baseLines + 3, fixtureDelta);

  if (mode === "downstream") await runDownstream();
  if (mode.startsWith("visual-")) await runVisual(mode.slice("visual-".length));
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
