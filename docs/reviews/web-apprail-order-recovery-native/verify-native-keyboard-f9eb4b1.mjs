/**
 * CP-APPRAIL-01 batch 63 (contract r1 §9 "Keyboard", §7 item 2, §15 E14): AppRail order (`xai_rail_order`) native
 * KEYBOARD evidence in real headless Chrome, in the production App composition, with trusted input only. Independent
 * parent-role native verifier. Verification only: it repairs nothing, implements nothing, accepts nothing and changes no
 * product file, contract, oracle, ledger, control plane or existing evidence. It is a new file.
 *
 * Reused read-only (SHA-256 checked on every run, never modified):
 *   - ./native-fixed-app.tsx and ./native-fixed-prelude.js (batch 61): the production App fixture and the instruments,
 *     BUNDLED and SERVED UNCHANGED. Its infrastructure (archive, pin/guard, lockfile gate, pipe transport, trusted
 *     click and drag, failed drop, sign-in seed, segments) is the text of ./verify-native-downstream-visual.mjs
 *     (batch 62, itself from ./verify-native-fixed.mjs), copied and adapted here, not imported.
 *   - ../web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs (batch 48, commit bacdbbc): the frozen
 *     per-stop pixel focus oracle. The block from "A minimal PNG decoder" through the end of `pixelFocusWalk` is spliced
 *     into this file BYTE FOR BYTE; every run extracts that block from this file and from the frozen file and requires
 *     equal SHA-256 (block and the function alone), and requires the frozen file to equal `git show bacdbbc:` of it.
 *   - ../web-appearance-recovery-native/native-visual-keyboard-probes.js (batch 46): the read-only page probes the
 *     oracle calls (window.__visual: tabbables, focusInfo, settle, probe, scrollWindowTo, scrolled, armScrollProbe),
 *     evaluated on demand after each mount (never injected before product code).
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-apprail-order-recovery-native/verify-native-keyboard-f9eb4b1.mjs f9eb4b1 <mode> <suffix>
 *
 * Modes (one language each; the §9 keyboard viewports):
 *   keyboard-en — EN at 1024×768;  keyboard-zh — ZH at 375×812 (mobile emulation; mounted at 1440, the pet hidden
 *   through its own rail toggle, then resized, per the R-PET gated rule).
 * Sections (all run in each mode):
 *   order   — trusted Tab through the whole document with the premium badge, the Appearance status and the rail status
 *             shown and the rail panel opened by Enter on the status: the Topbar order (badge, Appearance status, rail
 *             status, panel actions, appearance trigger), DOM order, computed visible focus, Shift+Tab back; the same for
 *             a source issue (Reload).
 *   activate — Enter and Space on the status (toggle once, focus kept, no storage attempt, no page scroll; a positive
 *             scroll control), Escape from an action and from the status (closes, focus to the status), and each action
 *             by Enter and by Space: Retry failing (once, focus stays on Retry), Export (once, focus stays on Export),
 *             Discard and a succeeding Retry and a repairing Reload (status unmounts, focus on .topbar-pref-trigger in
 *             every animation frame, never <body>), an unrepaired Reload.
 *   walks   — the frozen pixelFocusWalk, unchanged: clean, failed draft with the panel closed, failed draft with the panel
 *             open, source issue with the panel open; light and dark; plus the clean walk at 419e56d as the control.
 *
 * - Product: an immutable `git archive` of the fixed revision and of 419e56d; the fixture is bundled with esbuild from
 *   stdin with resolveDir = that archive; every `@repo/*` specifier is pinned to the archive's own package export and a
 *   guard fails the build on any module from the packages/, apps/ or docs/ tree of either checkout. Third-party modules
 *   come from XAI_DEPS_ROOT only when its pnpm-lock.yaml SHA-256 equals both archives' and the contract gate.
 * - The only synthetic input is the auth session (the batch 61 fixture). Seeds are in-domain bytes only (theme, the
 *   premium tier stub for the badge, the account marker), except `{}` and an unreadable read for the source issue.
 * - DevTools transport: the pipe (--remote-debugging-pipe) with flattened target sessions.
 * - Trusted input only: Input.dispatchKeyEvent WITHOUT nativeVirtualKeyCode (K-1; Enter and Space carry text, so they
 *   produce keydown, keypress and keyup); clicks through Input.dispatchMouseEvent after a centre hit-test; the failed
 *   draft by a trusted CDP drag. Every document's passive key trace must equal exactly the runner's own presses.
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log` plus PNG screenshots in this directory; existing evidence is
 *   never overwritten. Exit 0 = harness valid and every product check passes; 2 = harness valid and a product check
 *   fails; 1 = harness invalid. Development probes may redirect evidence with XAI_NATIVE_EVIDENCE_DIR (refused inside
 *   the repository) and filter sections with XAI_NATIVE_ONLY (refused for committed evidence).
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
/** Frozen conventions in this directory (SHA-256 from ./before-419e56d.md, ./review-controls-protection-export-f9eb4b1.md and ./review-downstream-visual-f9eb4b1.md §2). */
const FROZEN_LOCAL = {
  "verify-native-before.mjs": "ccabd5000d4b9e04cf775c4bb1bd79c0860d5def55f46799a651d69714f6a84e",
  "native-before-app.tsx": "fa70e2eb892bca9c2bd2f4c910c737e44963d52433f475253d6f966eb0608a7e",
  "native-before-prelude.js": "a4ba378110a4fcded7eccf0d88f8f41c281a42c10599b17f68832a3a3931f635",
  "verify-native-fixed.mjs": "f062e723b862b332f32f39bf02bf6951b4918a8af5bda8e42f4b69a03aa0f6d7",
  "native-fixed-app.tsx": "a86425af2715a3cb81100a87c413c76d75378f9e500ea575eb23b5d299e77d2d",
  "native-fixed-prelude.js": "4d731278ce6b88a9fa9304926177b248e307341bae180cbe59749bbac2eeb239",
  "verify-native-downstream-visual.mjs": "55b49d119f012c6395c0aaf9588695bdb7d60d27ec3c587167c9527a3d999b4e",
  "native-downstream-visual-app.tsx": "c6cb18a9ea3c221191a8560825c1610df691d56605a09ba00c9db588988684c7",
};
/** Frozen Appearance keyboard conventions (SHA-256 from ../web-appearance-recovery-native/review-visual-keyboard-{5bbf473,419e56d}.md §2). */
const APPEARANCE_DIR = "docs/reviews/web-appearance-recovery-native";
const FROZEN_APPEARANCE = {
  "verify-visual-keyboard-5bbf473.mjs": "5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4",
  "native-visual-keyboard-probes.js": "4df16575470d739d1655f32cd1bb0101c2b772552439f3ecfefded4f87bc02c4",
  "verify-visual-keyboard-419e56d.mjs": "d5fc3262ebd5c0b1c1c95b28d7866b7301190186653991ffb3b8cf0fdc976bcf",
};
const ORACLE_FILE = "verify-visual-keyboard-5bbf473.mjs";
const ORACLE_COMMIT = "bacdbbc";
const RUNNER = "verify-native-keyboard-f9eb4b1.mjs";
const FIXTURE = "native-fixed-app.tsx";
const PRELUDE = "native-fixed-prelude.js";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? output;
if (process.env.XAI_NATIVE_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const ONLY = process.env.XAI_NATIVE_ONLY ? process.env.XAI_NATIVE_ONLY.split(",") : null;
if (ONLY && !process.env.XAI_NATIVE_EVIDENCE_DIR) throw Error("XAI_NATIVE_ONLY is for development probes outside the repository only");
const selected = (name) => !ONLY || ONLY.includes(name);
const [requested, mode, suffix] = process.argv.slice(2);
const MODES = ["keyboard-en", "keyboard-zh"];
if (!requested) throw Error("Revision required");
if (!MODES.includes(mode)) throw Error(`Unsupported mode ${mode}; use ${MODES.join("|")}`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const LANG = mode.slice("keyboard-".length);
const resolved = execFileSync("git", ["rev-parse", "--verify", `${requested}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const resolvedTree = execFileSync("git", ["rev-parse", `${resolved}^{tree}`], { cwd: root, encoding: "utf8" }).trim();
const short = resolved.slice(0, 7);
const prefix = `native-${short}-${suffix}-${mode}`;
const evidencePath = join(evidenceDir, `${prefix}.log`);
if (existsSync(evidencePath) || readdirSync(evidenceDir).some((name) => name.startsWith(`${prefix}-`))) throw Error("Evidence exists; use a distinct suffix");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const round = (value) => Math.round(value * 100) / 100;
const progress = (text) => process.stderr.write(`[apprail-e14 ${mode}] ${new Date().toISOString().slice(11, 19)} ${text}\n`);
const records = [];
const runtimeErrors = [];
const consoleWarnings = [];
const dialogs = [];
const artifacts = [];
const screenshots = artifacts;
const navigationRequests = [];
const rowGates = [];
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
/** The frozen oracle's name for a product check that does not stop the run (same semantics as `check`). */
const checkDeferred = (id, condition, details = {}) => {
  checks += 1;
  productChecks += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { id, kind: "product", deferred: true, pass, ...details });
  if (!pass) { failures.push(id); progress(`FAIL ${id}`); }
  return pass;
};
const observe = (id, details = {}) => record("observation", { id, ...details });

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerText = readFileSync(fileURLToPath(import.meta.url), "utf8");
const runnerSha256 = sha256(runnerText);
const fixtureSource = readFileSync(join(output, FIXTURE), "utf8");
const preludeSource = readFileSync(join(output, PRELUDE), "utf8");
const frozenLocalActual = Object.fromEntries(Object.keys(FROZEN_LOCAL).map((file) => [file, sha256(readFileSync(join(output, file)))]));
const frozenAppearanceActual = Object.fromEntries(Object.keys(FROZEN_APPEARANCE).map((file) => [file, sha256(readFileSync(join(root, APPEARANCE_DIR, file)))]));
const PROBES_SOURCE = readFileSync(join(root, APPEARANCE_DIR, "native-visual-keyboard-probes.js"), "utf8");
const oracleText = readFileSync(join(root, APPEARANCE_DIR, ORACLE_FILE), "utf8");
const oracleAtCommit = execFileSync("git", ["show", `${ORACLE_COMMIT}:${APPEARANCE_DIR}/${ORACLE_FILE}`], { cwd: root, maxBuffer: 20 * 1024 * 1024 });
/** The pixel oracle block: from "A minimal PNG decoder" through the closing brace of pixelFocusWalk. */
function oracleBlock(text) {
  // Both anchors at the start of a line (so this function's own string literals never match).
  const start = text.indexOf("\n/** A minimal PNG decoder (8-bit") + 1;
  const fn = text.indexOf("\nasync function pixelFocusWalk(") + 1;
  const end = text.indexOf("\n}\n", fn) + 3;
  return start >= 0 && fn > start && end > fn ? { block: text.slice(start, end), fn: text.slice(fn, end) } : { block: "", fn: "" };
}
const frozenBlock = oracleBlock(oracleText);
const ownBlock = oracleBlock(runnerText);
const oracleIdentity = {
  frozenFile: `${APPEARANCE_DIR}/${ORACLE_FILE}`, frozenFileSha256: sha256(oracleText), frozenFileAtCommitSha256: sha256(oracleAtCommit), commit: ORACLE_COMMIT,
  frozenBlockSha256: sha256(frozenBlock.block), ownBlockSha256: sha256(ownBlock.block), blockBytes: Buffer.byteLength(frozenBlock.block), blockLines: frozenBlock.block.split("\n").length - 1,
  frozenFunctionSha256: sha256(frozenBlock.fn), ownFunctionSha256: sha256(ownBlock.fn), functionBytes: Buffer.byteLength(frozenBlock.fn),
  blockBytesEqual: frozenBlock.block.length > 0 && frozenBlock.block === ownBlock.block,
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
/** Modules that must be bundled from the archive (contract §9 "Composition"; the badge for the Topbar order). */
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
  "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts", "packages/plugin-web-tokens/src/i18n.ts", "packages/plugin-web-tokens/src/layout.css", "packages/plugin-web-tokens/src/tokens.css",
  "packages/web-auth-device-session/src/session.tsx", "packages/plugin-web-settings-rest/src/internal/PremiumTierBadge.tsx", "packages/plugin-web-settings-rest/src/internal/usePremiumTier.ts",
];
const REQUIRED_FIXED_ONLY = [
  "packages/xai-web-shell/src/internal/railOrderController.tsx", "packages/xai-web-shell/src/internal/RailOrderStatus.tsx",
  "packages/xai-web-shell/src/internal/railOrderModel.ts", "packages/xai-web-shell/src/internal/railOrderCopy.ts", "packages/xai-web-shell/src/railOrderStatus.css",
];
const VARIANTS = { fixed: { revision: resolved, stage: "fixed" }, before: { revision: BEFORE_REVISION, stage: "before" } };

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-apprail-native-e14-")));
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
// Archives and bundles (pinned, guarded), one per variant (batch 62 text, coordinator variants dropped)
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
async function buildVariant(name) {
  const variant = VARIANTS[name];
  const { snapshot, aliases } = extractArchive(variant.revision);
  const forbiddenRoots = [...new Set([dependencyRoot, root].map((base) => realpathSync(base)))].flatMap((base) => ["packages", "apps", "docs"].map((tree) => join(base, tree) + sep));
  const guardViolations = [];
  const pinnedRepo = [];
  const archiveModules = new Set();
  const archiveRoot = snapshot + sep;
  const plugin = { name: "apprail-native-e14-archive-pin-guard", setup(buildApi) {
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
  const moduleIndex = js.split("\n").map((text, line) => ({ line, text })).filter((entry) => /^\/\/ \S+\.(tsx?|m?js|cjs|jsx|json|css)$/.test(entry.text)).map((entry) => ({ line: entry.line, module: entry.text.slice(3) }));
  const inputs = Object.keys(built.metafile.inputs);
  const archiveInputs = inputs.filter((entry) => !entry.startsWith("../") && entry !== FIXTURE && !entry.startsWith("<define:"));
  const thirdParty = inputs.filter((entry) => entry.includes("node_modules/"));
  const foreign = inputs.filter((entry) => entry.startsWith("../") && !entry.includes("node_modules/"));
  const required = [...REQUIRED_COMMON, ...(variant.stage === "fixed" ? REQUIRED_FIXED_ONLY : [])];
  const missingRequired = required.filter((file) => !inputs.includes(file) || (!archiveModules.has(file) && !file.endsWith(".css")));
  const requiredHashes = Object.fromEntries(required.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const provenance = {
    variant: name, revision: variant.revision, stage: variant.stage,
    bundleSha256: sha256(js), bundleCssSha256: sha256(css), bundleModuleComments: moduleIndex.length,
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
    requiredModules: { count: required.length, missing: missingRequired, sha256: requiredHashes },
  };
  record("bundle-provenance", provenance);
  pre(`baseline:${name}:guard-no-module-from-a-checkout`, guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre(`baseline:${name}:every-required-module-bundled-from-archive`, missingRequired.length === 0, { missingRequired });
  bundles[name] = { js, css, moduleIndex, provenance };
}

// ---------------------------------------------------------------------------------------------------
// Browser over the DevTools PIPE transport with flattened target sessions (batch 62 text)
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
      // Only runner-initiated navigation away from a drafted document may raise a dialog (beforeunload): accepted.
      const expected = message.params.type === "beforeunload" && page.navigating;
      dialogs.push({ page: page.name, type: message.params.type, message: message.params.message, expected, accepted: true, reason: expected ? "runner-initiated navigation" : "unexpected", afterCheck: lastCheckId, case: currentCase });
      page.cdp("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
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
  const page = { name, targetId, sessionId, navigating: false, crashed: null, intercepted: [], presses: [], variant: null };
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
/** Page-first evaluation (batch 62 signature). */
async function ev(page, expression) {
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
      if (await ev(page, expression)) return true;
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

// ---------------------------------------------------------------------------------------------------
// Keys (K-1): no nativeVirtualKeyCode; Enter and Space carry text (keydown + keypress + keyup); per-document audit
// ---------------------------------------------------------------------------------------------------
const KEYDEFS = {
  Tab: { key: "Tab", code: "Tab", vk: 9 },
  ShiftTab: { key: "Tab", code: "Tab", vk: 9, modifiers: 8 },
  Escape: { key: "Escape", code: "Escape", vk: 27 },
  Enter: { key: "Enter", code: "Enter", vk: 13, text: "\r" },
  Space: { key: " ", code: "Space", vk: 32, text: " " },
};
const expectedKeyEvents = (presses) => presses.flatMap((name) => {
  const def = KEYDEFS[name];
  return [`keydown:${def.key}`, ...(def.text ? [`keypress:${def.key}`] : []), `keyup:${def.key}`];
});
async function pressKey(page, name) {
  const def = KEYDEFS[name];
  page.presses.push(name);
  const modifiers = def.modifiers ?? 0;
  await input(page, "Input.dispatchKeyEvent", { type: def.text ? "keyDown" : "rawKeyDown", key: def.key, code: def.code, windowsVirtualKeyCode: def.vk, modifiers, ...(def.text ? { text: def.text, unmodifiedText: def.text } : {}) });
  await input(page, "Input.dispatchKeyEvent", { type: "keyUp", key: def.key, code: def.code, windowsVirtualKeyCode: def.vk, modifiers });
  await delay(60);
}
const SELF_TEST_PROBE = "http://example.invalid/selftest";
const keyboardAudit = { checkpoints: 0, runnerPresses: 0, keyEvents: 0, expectedKeyEvents: 0, untrusted: 0, mismatches: [], byKey: {} };
async function collectDocument(page, reason) {
  try {
    const keys = await ev(page, "window.__native ? __native.keys.map((entry) => ({ type: entry.type, key: entry.key, trusted: entry.trusted })) : null");
    if (keys) {
      const expected = expectedKeyEvents(page.presses);
      const observed = keys.map((entry) => `${entry.type}:${entry.key}`);
      keyboardAudit.checkpoints += 1;
      keyboardAudit.runnerPresses += page.presses.length;
      keyboardAudit.keyEvents += keys.length;
      keyboardAudit.expectedKeyEvents += expected.length;
      keyboardAudit.untrusted += keys.filter((entry) => !entry.trusted).length;
      for (const name of page.presses) keyboardAudit.byKey[name] = (keyboardAudit.byKey[name] ?? 0) + 1;
      if (!isDeepStrictEqual(observed, expected) || keys.some((entry) => !entry.trusted)) keyboardAudit.mismatches.push({ page: page.name, reason, afterCheck: lastCheckId, expected: expected.slice(0, 40), observed: observed.slice(0, 40), untrusted: keys.filter((entry) => !entry.trusted).length });
    }
  } catch { /* no document yet */ }
  page.presses = [];
  try {
    const list = await ev(page, "window.__native ? __native.network : []");
    const pageAttempts = list.filter((entry) => entry.url !== SELF_TEST_PROBE);
    networkSeen.documents += 1;
    networkSeen.attempts += pageAttempts.length;
    const nonLocal = pageAttempts.filter((entry) => !entry.local);
    networkSeen.nonLocal += nonLocal.length;
    networkSeen.samples.push(...nonLocal.slice(0, 3));
  } catch { /* no document yet */ }
}
async function navigate(page, url) {
  await collectDocument(page, `navigate:${url}`);
  page.navigating = true;
  try {
    await page.cdp("Page.navigate", { url });
  } finally {
    setTimeout(() => { page.navigating = false; }, 2500);
  }
}

// ---------------------------------------------------------------------------------------------------
// Oracle facts (contract §2 display order, A2 merge, §5 wording), written from the contract text (batch 62 text)
// ---------------------------------------------------------------------------------------------------
const RAIL_KEY = "xai_rail_order";
const MARKER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:committed-generation`;
const MARKER = JSON.stringify({ generation: "g1", migrationId: "apprail-native", previous: null });
const LANG_KEY = "xai_pref_lang";
const THEME_KEY = "xai_pref_theme";
/** The premium tier stub (account-owned string/number prefs) at the synthetic account's generation g1: renders the badge. */
const PREMIUM_TIER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:g1:xai_pref_premium_tier`;
const PREMIUM_STARTED_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:g1:xai_pref_premium_started_at`;
function displayOrder(stored, visible) {
  const inR = new Set(visible);
  const out = [];
  const seen = new Set();
  for (const id of stored) if (inR.has(id) && !seen.has(id)) { out.push(id); seen.add(id); }
  for (const id of visible) if (!seen.has(id)) { out.push(id); seen.add(id); }
  return out;
}
function merge(stored, visible, preview) {
  const inR = new Set(visible);
  const rest = [...preview];
  const out = stored.map((id) => (inR.has(id) ? rest.shift() : id));
  return [...out, ...rest];
}
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
const COPY = {
  en: {
    statusDraftName: "Sidebar order not saved. Review it.", statusSourceName: "Saved sidebar order is unavailable. Review it.",
    statusDraftText: "Order not saved", statusSourceText: "Order unavailable", panelName: "Sidebar order",
    saving: "Sidebar order is saving.", notSaved: "Sidebar order was not saved.",
    unavailable: "Saved sidebar order is unavailable. Reload it; this is not a new unsaved change.",
    retry: { label: "Retry", name: "Retry sidebar order" }, discard: { label: "Discard", name: "Discard sidebar order change" },
    export: { label: "Export", name: "Export sidebar order draft" }, reload: { label: "Reload", name: "Reload sidebar order" },
  },
  zh: {
    statusDraftName: "侧栏顺序未保存，点击查看。", statusSourceName: "已保存的侧栏顺序不可用，点击查看。",
    statusDraftText: "顺序未保存", statusSourceText: "顺序不可用", panelName: "侧栏顺序",
    saving: "侧栏顺序正在保存。", notSaved: "侧栏顺序未保存。",
    unavailable: "已保存的侧栏顺序不可用。请重新读取；这不是新的未保存更改。",
    retry: { label: "重试", name: "重试 侧栏顺序" }, discard: { label: "放弃", name: "放弃 侧栏顺序更改" },
    export: { label: "导出", name: "导出侧栏顺序草稿" }, reload: { label: "重新读取", name: "重新读取 侧栏顺序" },
  },
};
const actionsFor = (lang, kind) => (kind === "source" ? [{ testid: "rail-order-reload", ...COPY[lang].reload }]
  : [{ testid: "rail-order-retry", ...COPY[lang].retry }, { testid: "rail-order-discard", ...COPY[lang].discard }, { testid: "rail-order-export", ...COPY[lang].export }]);
let facts0 = null;
const railIds = () => facts0.registrations.filter((entry) => entry.showInRail).sort((left, right) => (left.railOrder - right.railOrder) || (left.moduleId < right.moduleId ? -1 : left.moduleId > right.moduleId ? 1 : 0)).map((entry) => entry.moduleId);
const visibleIds = (hidden = []) => railIds().filter((id) => !hidden.includes(id));
const labelOf = (lang, id) => facts0.labels[lang].nav[id] ?? id;
const idsToLabels = (lang, ids) => ids.map((id) => labelOf(lang, id));
const labelsToIds = (lang, labels) => labels.map((label) => railIds().find((id) => labelOf(lang, id) === label) ?? `?${label}`);
const parse = (raw) => { try { return JSON.parse(raw); } catch { return undefined; } };
const REVERSED = () => [...railIds()].reverse();
/** The status and (when open) the panel equal the contract wording for `kind` in `lang` (batch 62 text). */
function statusMatches(view, lang, kind, { open = null } = {}) {
  if (!view.present) return false;
  const name = kind === "source" ? COPY[lang].statusSourceName : COPY[lang].statusDraftName;
  const buttonOk = view.name === name && view.tag === "button" && view.type === "button" && view.controls === "rail-order-panel" && view.rootInControls && view.rootIsOneElement
    && view.rect && view.rect.width >= 44 && view.rect.height >= 44;
  if (!buttonOk) return false;
  if (open === null) return true;
  if (!open) return view.expanded === "false" && view.panel === null;
  const panel = view.panel;
  if (!panel || view.expanded !== "true") return false;
  const message = kind === "source" ? { text: COPY[lang].unavailable, role: "alert" } : kind === "saving" ? { text: COPY[lang].saving, role: "status" } : { text: COPY[lang].notSaved, role: "alert" };
  const expectedActions = actionsFor(lang, kind === "source" ? "source" : "draft").map((entry) => ({ testid: entry.testid, name: entry.name, label: entry.label }));
  const actualActions = panel.actions.map((entry) => ({ testid: entry.testid, name: entry.name, label: entry.label }));
  return panel.id === "rail-order-panel" && panel.role === "dialog" && panel.label === COPY[lang].panelName && panel.modal === null && panel.followsButton && panel.inRoot
    && isDeepStrictEqual(panel.message, message) && isDeepStrictEqual(actualActions, expectedActions);
}

// ---------------------------------------------------------------------------------------------------
// Documents: seed page, App mount, trusted pointer input (batch 62 text, adapted)
// ---------------------------------------------------------------------------------------------------
let selfTested = false;
let mainPage = null;
async function seed(page, entries, label) {
  await navigate(page, `${origin}/seed`);
  pre(`${label}:seed-page-loaded-with-prelude-only`, await waitUntil(page, "document.readyState === 'complete' && location.pathname === '/seed' && !!window.__native && !window.verify", 10000));
  if (!selfTested) {
    const result = await ev(page, "__native.selfTest()");
    record("instrument-selftest", { page: "/seed (prelude only, no product code)", result });
    pre("instruments:storage-faults-f-b002-dispatch-locks-history-unload-export-confirm-network-console-errorui-input-drag-rail-observer", result.quotaThrew && result.quotaNeverStored && result.throwingSetThrew && result.throwingSetNeverStored
      && result.setDelegated && result.readbackAfterSetDenied && result.readbackOneShot && result.getDenied && result.removeDelegated && Object.values(result.totalDenial).every(Boolean) && result.noNestedStorageCalls
      && isDeepStrictEqual(result.dispatchCounted, ["storage:xai_native_apprail_fixed_selftest:true", "bus:web:settings:preference-changed"])
      && result.nonLocalFetchRefusedAndLogged && result.lockHeldAndPending && result.middleHeldAfterFirst && result.fifoOrder === "app1,app2" && isDeepStrictEqual(result.lockAttribution, ["fixture", "app", "fixture", "app"])
      && isDeepStrictEqual(result.historyTraced, ["pushState:selftest-push", "replaceState:selftest-replace"]) && result.popTraced === 1 && result.unloadTracked && result.urlTraced && result.confirmWrapped
      && result.consoleErrorTraced && result.errorUiTraced && result.untrustedClickTraced && result.untrustedDragTraced && result.railObserverTraced, { result });
    const keyMark = await ev(page, "__native.mark()");
    await pressKey(page, "Escape");
    const keys = (await ev(page, `__native.window(${keyMark})`)).keys;
    pre("instruments:k1-one-trusted-escape-is-exactly-one-keydown-and-keyup", isDeepStrictEqual(keys.map((entry) => `${entry.type}:${entry.key}:${entry.code}:${entry.trusted}`), ["keydown:Escape:Escape:true", "keyup:Escape:Escape:true"]), { keys });
    const enterMark = await ev(page, "__native.mark()");
    await pressKey(page, "Enter");
    await pressKey(page, "Space");
    const keys2 = (await ev(page, `__native.window(${enterMark})`)).keys;
    pre("instruments:k1-trusted-enter-and-space-are-exactly-keydown-keypress-keyup-each", isDeepStrictEqual(keys2.map((entry) => `${entry.type}:${entry.key}:${entry.code}:${entry.trusted}`),
      ["keydown:Enter:Enter:true", "keypress:Enter:Enter:true", "keyup:Enter:Enter:true", "keydown: :Space:true", "keypress: :Space:true", "keyup: :Space:true"]), { keys: keys2 });
    selfTested = true;
  }
  const stored = await ev(page, `(() => { __native.native.clear(); const seeds = ${JSON.stringify(entries)}; for (const [key, value] of Object.entries(seeds)) __native.native.set(key, value); return __native.native.snapshot(); })()`);
  pre(`${label}:seeded-exact-bytes`, isDeepStrictEqual(stored, entries), { stored });
}
const seedsFor = (lang, extra = {}) => ({ [MARKER_KEY]: MARKER, ...(lang === "zh" ? { [LANG_KEY]: JSON.stringify("zh") } : {}), ...extra });
const PANE = '.settings-detail[data-pane="appearance"] .appearance-pane';
const READY_APP = "(!!window.verify && !!window.__native && !!document.querySelector('.app header.topbar') && !!document.querySelector('.app-rail .rail-items') && !document.querySelector('.account-data-gate') && verify.scope().kind === 'account')";
const READY_APPEARANCE = `(${READY_APP} && !!document.querySelector(${JSON.stringify(PANE)}))`;
const CRASHED = "(!!window.__native && !!__native.routeError())";
async function mountApp(page, label, { path = "/app/settings/appearance", variant = "fixed", ready = READY_APPEARANCE, faultPlan = null, hidePet = true } = {}) {
  currentVariant = variant;
  let planId = null;
  if (faultPlan) planId = (await page.cdp("Page.addScriptToEvaluateOnNewDocument", { source: `window.__nativeFaultPlan = ${JSON.stringify(faultPlan)};` })).identifier;
  await navigate(page, `${origin}${path}`);
  page.variant = variant;
  const settled = await waitUntil(page, `${ready} || ${CRASHED}`, 20000);
  await delay(600);
  if (planId) await page.cdp("Page.removeScriptToEvaluateOnNewDocument", { identifier: planId });
  const state = await ev(page, `({ ready: ${ready}, crashed: ${CRASHED}, routeError: window.__native ? __native.routeError() : null, verifyPresent: !!window.verify, variant: window.verify ? verify.variant : null, path: location.pathname,
    planApplied: window.__native ? __native.planApplied : null })`);
  pre(`${label}:document-loaded-and-bundle-evaluated`, settled && state.verifyPresent && state.variant === variant, { state, variant });
  const viewport = await ev(page, "({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio, scale: window.visualViewport ? visualViewport.scale : 1 })");
  pre(`${label}:viewport-${page.viewport.width}x${page.viewport.height}-unzoomed`, viewport.width === page.viewport.width && viewport.height === page.viewport.height && viewport.dpr === 1 && viewport.scale === 1, { viewport, expected: page.viewport });
  if (faultPlan) pre(`${label}:read-fault-plan-applied-before-mount`, isDeepStrictEqual(state.planApplied?.get ?? null, faultPlan.get), { planApplied: state.planApplied });
  const facts = await ev(page, `({ composition: verify.composition, instance: verify.instance, scope: verify.scope(), auth: verify.authCalls(), markerKey: verify.markerKey,
    lockName: verify.lockName(), physicalKey: verify.physicalKey(), registryDefault: verify.registryDefault, registryCodec: verify.registryCodec,
    registrations: verify.registrations, labels: verify.labels, rail: __native.railNames(), topbar: __native.topbar(), pet: !!document.querySelector('.pet-wrap'),
    mountMutations: __native.window(0).attempts.filter((entry) => entry.op === 'set' || entry.op === 'remove' || entry.op === 'clear').map((entry) => ({ op: entry.op, key: entry.key, outcome: entry.outcome })) })`);
  record("observation", { id: `${label}:mounted`, variant, path, ready: state.ready, routeError: state.routeError, rail: facts.rail, topbarControls: facts.topbar.controlsOrder, mountMutations: facts.mountMutations, instance: facts.instance });
  pre(`${label}:auth-session-context-served-by-real-provider`, facts.composition === "production-app" && facts.auth.includes("getSession") && facts.markerKey === MARKER_KEY, { auth: facts.auth, markerKey: facts.markerKey });
  pre(`${label}:real-lock-name-and-unscoped-device-key`, facts.lockName === `xai:pref:v1:${RAIL_KEY}` && facts.physicalKey === RAIL_KEY, { lockName: facts.lockName, physicalKey: facts.physicalKey });
  pre(`${label}:production-app-mounted`, state.ready && !state.crashed, { state });
  pre(`${label}:account-data-gate-activated-account`, facts.scope.kind === "account" && facts.scope.accountId === OWNER && facts.scope.generation === "g1", { scope: facts.scope });
  pre(`${label}:production-surfaces-present`, facts.rail.length > 0 && facts.topbar.present && facts.pet, { rail: facts.rail.length, pet: facts.pet });
  if (!facts0) {
    facts0 = { registrations: facts.registrations, labels: facts.labels, registryDefault: facts.registryDefault, registryCodec: facts.registryCodec, lockName: facts.lockName };
    record("observation", { id: "archive-facts", ...facts0, railIds: railIds() });
    pre("archive-facts:fourteen-rail-modules-and-twelve-defaults-and-labels", railIds().length === 14 && Array.isArray(facts0.registryDefault) && facts0.registryDefault.length === 12 && facts0.registryCodec === "json"
      && ["en", "zh"].every((lang) => facts0.labels[lang].nav.pet && facts0.labels[lang].settings.theme && facts0.labels[lang].settings.dark), { railIds: railIds(), registryDefault: facts0.registryDefault });
  }
  if (hidePet) await hideThePet(page, label);
  return { state, facts };
}
/** R-PET gated mode (contract §9, A10): the pet is hidden through the product's own rail pet toggle by a trusted click. */
async function hideThePet(page, label) {
  const lang = await ev(page, "document.documentElement.getAttribute('lang') === 'zh' ? 'zh' : (document.querySelector('.topbar .topbar-pref-trigger')?.getAttribute('title') === '外观' ? 'zh' : 'en')");
  const name = facts0.labels[lang].nav.pet;
  await trustedClick(page, `.app-rail .rail-bottom .rail-btn[aria-label=${JSON.stringify(name)}]`, `${label}:pet-toggle`);
  pre(`${label}:pet-hidden-through-the-rail-toggle`, await waitUntil(page, "!document.querySelector('.pet-wrap')", 3000));
  await parkMouse(page);
}
async function railPoint(page, name, label) {
  const point = await ev(page, `(() => {
    const matches = [...document.querySelectorAll('.app-rail .rail-items .rail-btn')].filter((button) => button.getAttribute('aria-label') === ${JSON.stringify(name)});
    if (matches.length !== 1) return { count: matches.length };
    const rect = matches[0].getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { count: 1, x, y, inViewport: x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight, hit: !!hit && matches[0].contains(hit) };
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
  let point = await ev(page, measure);
  pre(`input:control-present:${label}`, point.found, { selector });
  if (!point.hit) { await delay(400); point = await ev(page, measure); }
  pre(`input:centre-hit-test:${label}`, point.hit, { selector, hitTarget: point.hitTarget });
  const mark = await ev(page, "__native.mark()");
  await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await input(page, "Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(80);
  const clicks = (await ev(page, `__native.window(${mark}).events`)).filter((entry) => entry.type === "click");
  pre(`input:one-trusted-click:${label}`, clicks.filter((entry) => entry.trusted).length === 1, { clicks });
  return point;
}
const railNow = (page) => ev(page, "__native.railNames()");
const statusNow = (page) => ev(page, "__native.railStatus()");
const markOf = (page) => ev(page, "__native.mark()");
const railOps = (attempts, ops = ["set", "remove", "clear"]) => attempts.filter((entry) => (entry.key === RAIL_KEY || entry.op === "clear") && ops.includes(entry.op));
const mutations = (attempts) => attempts.filter((entry) => ["set", "remove", "clear"].includes(entry.op));
const brief = (attempts) => attempts.map((entry) => `${entry.seq}:${entry.op}:${entry.key}:${entry.outcome}${entry.value !== undefined ? `=${String(entry.value).slice(0, 80)}` : ""}`);
/** One trusted rail drag that drops on its target (contract §6 item 8; batch 62 dragGesture, the "drop" end only). */
async function dragDrop(page, label, { source, target }) {
  const sourcePoint = await railPoint(page, source, `${label}:source`);
  const targetPoint = await railPoint(page, target, `${label}:target`);
  const mark = await markOf(page);
  page.intercepted = [];
  await page.cdp("Input.setInterceptDrags", { enabled: true });
  try {
    await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: sourcePoint.x, y: sourcePoint.y });
    await input(page, "Input.dispatchMouseEvent", { type: "mousePressed", x: sourcePoint.x, y: sourcePoint.y, button: "left", buttons: 1, clickCount: 1 });
    await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: sourcePoint.x + 2, y: sourcePoint.y + 6, button: "left", buttons: 1 });
    await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: targetPoint.x, y: targetPoint.y, button: "left", buttons: 1 });
    pre(`${label}:browser-drag-started-and-intercepted`, await waitFor(() => page.intercepted.length > 0, 4000), { intercepted: page.intercepted.length });
    const data = page.intercepted[0];
    await input(page, "Input.dispatchDragEvent", { type: "dragEnter", x: targetPoint.x, y: targetPoint.y, data });
    await input(page, "Input.dispatchDragEvent", { type: "dragOver", x: targetPoint.x, y: targetPoint.y, data });
    await delay(250);
    await input(page, "Input.dispatchDragEvent", { type: "dragOver", x: targetPoint.x, y: targetPoint.y, data });
    await delay(250);
    await input(page, "Input.dispatchDragEvent", { type: "drop", x: targetPoint.x, y: targetPoint.y, data });
    await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: targetPoint.x, y: targetPoint.y, button: "left", buttons: 0, clickCount: 1 });
  } finally {
    await page.cdp("Input.setInterceptDrags", { enabled: false }).catch(() => {});
  }
  await delay(500);
  await parkMouse(page);
  const view = await ev(page, `__native.window(${mark})`);
  const drags = view.drags;
  pre(`${label}:every-recorded-drag-event-trusted`, drags.length > 0 && drags.every((entry) => entry.trusted), { drags: drags.map((entry) => `${entry.type}:${entry.target.label}:${entry.trusted}`) });
  pre(`${label}:trusted-dragstart-on-the-source`, drags.some((entry) => entry.type === "dragstart" && entry.target.label === source && entry.target.railButton), { source });
  pre(`${label}:trusted-dragover-on-the-target`, drags.some((entry) => entry.type === "dragover" && entry.target.label === target), { target });
  const dropEvents = drags.filter((entry) => entry.type === "drop");
  pre(`${label}:trusted-drop-inside-rail-items`, dropEvents.length === 1 && dropEvents[0].target.inRailItems, { dropEvents: dropEvents.map((entry) => entry.target) });
  record("observation", { id: `${label}:drag`, source, target, trace: drags.map((entry) => `${entry.seq}:${entry.type}:${entry.target.label ?? entry.target.tag}:${entry.trusted ? "trusted" : "UNTRUSTED"}`) });
  return { mark };
}
/** A failed rail drop (batch 62 failedDrop): the quota fault is armed, the drop is admitted and settles as a failed draft. */
async function failedDrop(page, label, lang, { S }) {
  const R = visibleIds();
  const D0 = displayOrder(S, R);
  const rail = await railNow(page);
  pre(`${label}:rail-displays-D(S,R)-before-the-drag`, isDeepStrictEqual(rail, idsToLabels(lang, D0)), { rail, expected: D0 });
  await ev(page, `__native.denySet(${JSON.stringify(RAIL_KEY)}, "QuotaExceededError")`);
  const gesture = await dragDrop(page, label, { source: labelOf(lang, D0[0]), target: labelOf(lang, D0[2]) });
  const P = reorder(D0, D0[0], D0[2]);
  const settled = await waitUntil(page, `(() => { const s = __native.railStatus(); return s.present && s.name === ${JSON.stringify(COPY[lang].statusDraftName)}; })()`, 6000);
  await delay(300);
  const view = await ev(page, `__native.window(${gesture.mark})`);
  const sets = railOps(view.attempts, ["set"]);
  pre(`${label}:fault-armed-and-observed`, sets.length >= 1 && sets.every((entry) => entry.outcome.startsWith("denied")), { sets: brief(sets) });
  pre(`${label}:drop-settled-as-a-failed-draft`, settled, {});
  pre(`${label}:the-dropped-order-is-displayed`, isDeepStrictEqual(await railNow(page), idsToLabels(lang, P)));
  return { S, R, D0, P, expected: merge(S, R, P) };
}
/** An Appearance draft (theme Dark through the Topbar with its write denied): the Appearance status shows (batch 61/62 helper). */
async function failTopbarTheme(page, label, lang) {
  await ev(page, `__native.denySet(${JSON.stringify(THEME_KEY)}, "SecurityError")`);
  const mark = await markOf(page);
  await trustedClick(page, ".topbar .topbar-pref-trigger", `${label}:topbar-trigger`);
  pre(`${label}:topbar-popover-open`, await waitUntil(page, "__native.topbar().popoverOpen", 3000));
  const tagged = await ev(page, `(() => {
    document.querySelectorAll("[data-native-target]").forEach((element) => element.removeAttribute("data-native-target"));
    const matches = [...document.querySelectorAll('.topbar #topbar-pref-panel section')].filter((s) => s.getAttribute("aria-label") === ${JSON.stringify(facts0.labels[lang].settings.theme)}).flatMap((s) => [...s.querySelectorAll('[role="menuitemradio"]')]).filter((o) => o.getAttribute("aria-label") === ${JSON.stringify(facts0.labels[lang].settings.dark)});
    if (matches.length === 1) matches[0].setAttribute("data-native-target", "1");
    return matches.length;
  })()`);
  pre(`${label}:exactly-one-dark-option`, tagged === 1, { tagged });
  await trustedClick(page, '[data-native-target="1"]', `${label}:topbar-dark`);
  await ev(page, 'document.querySelector("[data-native-target]")?.removeAttribute("data-native-target")');
  const fired = await waitUntil(page, `__native.window(${mark}).attempts.some((entry) => entry.key === ${JSON.stringify(THEME_KEY)} && entry.op === "set" && entry.outcome !== "ok")`, 6000);
  if (await ev(page, "__native.topbar().popoverOpen")) await pressKey(page, "Escape");
  pre(`${label}:topbar-popover-closed`, await waitUntil(page, "!__native.topbar().popoverOpen", 3000));
  await parkMouse(page);
  const shown = await waitUntil(page, "!!__native.topbar().appearanceStatus", 5000);
  pre(`${label}:appearance-draft-failed-and-its-status-shown`, fired && shown, { topbar: await ev(page, "__native.topbar()") });
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
const counters = (snapshot) => ({ push: snapshot.history.filter((entry) => entry.method === "pushState").length, replace: snapshot.history.filter((entry) => entry.method === "replaceState").length, popstate: snapshot.pops.length, commits: snapshot.commits.length });
const ZERO = { push: 0, replace: 0, popstate: 0, commits: 0 };
async function snap(page, since) {
  return ev(page, `(() => {
    const w = __native.window(${since});
    const r = window.verify ? verify.window(${since}) : { navigateCalls: [], blockerCalls: [], commits: [] };
    return {
      rail: __native.railNames(), status: __native.railStatus(), topbar: __native.topbar(), focus: __native.focus(), routeError: __native.routeError(),
      bytes: __native.native.get(${JSON.stringify(RAIL_KEY)}), path: location.pathname, unloadListeners: __native.unloadListeners(),
      attempts: w.attempts, locks: w.locks, events: w.events, history: w.history, pops: w.pops, consoleErrors: w.consoleErrors, errorUi: w.errorUi,
      commits: r.commits, urlTrace: __native.urlTrace(), clickTrace: __native.clickTrace(), anchors: __native.anchorsInDom(),
    };
  })()`);
}
async function beginSegment(page, id) {
  return { id, page, mark: await markOf(page), errorsAt: runtimeErrors.length };
}
/** Row gate: history counters and a runtime-error gate per segment. */
async function endSegment(segment, expected = ZERO, { reference = false } = {}) {
  const now = await snap(segment.page, segment.mark);
  const errors = runtimeErrors.slice(segment.errorsAt);
  const counts = counters(now);
  const gate = { id: segment.id, variant: segment.page.variant, counters: counts, runtimeErrors: errors.length, pageConsoleErrors: now.consoleErrors.length, errorUi: now.errorUi.length, routeError: now.routeError, reference };
  rowGates.push(gate);
  record("row-gate", { ...gate, history: now.history.map((entry) => `${entry.seq}:${entry.method}:${entry.url}`), commits: now.commits.map((entry) => `${entry.seq}:${entry.action}:${entry.pathname}`) });
  if (reference) return { now, counts, errors };
  if (expected) check(`${segment.id}:history-counters`, isDeepStrictEqual(counts, expected), { counts, expected });
  check(`${segment.id}:runtime-error-gate`, errors.length === 0 && now.consoleErrors.length === 0 && now.errorUi.length === 0 && now.routeError === null, { errors: errors.slice(0, 3), consoleErrors: now.consoleErrors.slice(0, 3), errorUi: now.errorUi });
  return { now, counts, errors };
}
const caseStart = (id) => { currentCase = id; progress(id); };
const HEIGHTS = { 375: 812, 414: 896, 768: 1024, 1024: 768, 1440: 900 };
const KEYBOARD_WIDTH = LANG === "zh" ? 375 : 1024;
const MOUNT_WIDTH = LANG === "zh" ? 1440 : 1024;
let currentWidth = MOUNT_WIDTH;
/** Viewport emulation; 414 px and narrower also emulate a mobile device (the batch 48/50/62 convention). */
async function setViewport(page, width) {
  const viewport = { width, height: HEIGHTS[width] };
  const mobile = viewport.width <= 414;
  await page.cdp("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile });
  page.viewport = { width: viewport.width, height: viewport.height, mobile };
  currentWidth = width;
  await delay(350);
  const actual = await ev(page, "({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio, scale: window.visualViewport ? visualViewport.scale : 1, vvWidth: window.visualViewport ? visualViewport.width : innerWidth })").catch(() => null);
  if (actual && actual.width !== 0) pre(`viewport:${viewport.width}x${viewport.height}:applied-unzoomed`, actual.width === viewport.width && actual.height === viewport.height && actual.dpr === 1 && actual.scale === 1 && Math.abs(actual.vvWidth - viewport.width) < 0.01, { actual, viewport });
  return actual;
}
/** Returns every scroller to its origin (a trusted click's scrollIntoView may scroll the document; recorded). */
async function resetScrollers(page, label) {
  const scrolled = await ev(page, "(() => { const out = []; for (const e of [document.scrollingElement, ...document.querySelectorAll('*')]) { if (e && (e.scrollTop || e.scrollLeft)) { out.push({ el: e === document.scrollingElement ? 'document' : (e.className || e.tagName).toString().slice(0, 40), top: e.scrollTop, left: e.scrollLeft }); e.scrollTop = 0; e.scrollLeft = 0; } } return out; })()");
  if (scrolled.length) observe(`${label}:scrollers-returned-to-origin`, { scrolled });
  await delay(100);
  return scrolled;
}
async function screenshot(page, name, details = {}) {
  await parkMouse(page);
  await delay(150);
  const shot = await page.cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  return saveShot(name, shot.data, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: null, case: currentCase, ...details });
}

// ---------------------------------------------------------------------------------------------------
// The frozen oracle's environment (the names and signatures of verify-visual-keyboard-5bbf473.mjs)
// ---------------------------------------------------------------------------------------------------
let main = null;
const evaluate = (expression, page = main) => ev(page, expression);
const press = (name, page = main) => pressKey(page, name);
/** The batch 48/50 park position (top-left corner), used by the oracle and by every keyboard section. */
async function parkMouse(page = main) {
  await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 });
  await delay(40);
}
/** Clicks a non-focusable anchor (sets the sequential focus navigation starting point there). */
async function clickAnchor(selector, label, page = main) {
  const point = await trustedClick(page, selector, label);
  const focus = await ev(page, "__visual.focusInfo()");
  pre(`${label}:anchor-is-not-focusable`, focus.isBody || !focus.inPane || focus.desc.startsWith("pane-other"), { focus });
  return point;
}
async function pageOffset(page = main) {
  return ev(page, "({ x: visualViewport.pageLeft, y: visualViewport.pageTop, scrollX, scrollY, scale: visualViewport.scale })");
}
const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });
async function saveShot(name, data, details) {
  const file = `${prefix}-${name}.png`;
  pre(`screenshot:${name}:not-overwritten`, !existsSync(join(evidenceDir, file)), { file });
  const buffer = Buffer.from(data, "base64");
  writeFileSync(join(evidenceDir, file), buffer, { flag: "wx" });
  const entry = { file, sha256: sha256(buffer), bytes: buffer.length, png: pngSize(buffer), ...details };
  screenshots.push(entry);
  record("screenshot", entry);
  return entry;
}

// ===================================================================================================
// FROZEN ORACLE (verify-visual-keyboard-5bbf473.mjs, commit bacdbbc), spliced byte for byte; do not edit.
// ===================================================================================================
/** A minimal PNG decoder (8-bit RGB/RGBA, non-interlaced; Chrome's screenshot encoding), self-tested against the browser. */
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
  return { width, height, data: out };
}
const rgbaSha256 = (image) => sha256(Buffer.from(image.data.buffer, image.data.byteOffset, image.data.byteLength));
const PIXEL_MARGIN = 10;
/** Page helper for the pixel walk: a JS global only (no DOM change); placing = scrollIntoView of the measured element. */
const B48_PAGE_HELPER = `(() => {
  if (window.__b48) return "present";
  const visibleBox = (element) => {
    let box = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
    let fixed = getComputedStyle(element).position === "fixed";
    const rootStyle = getComputedStyle(document.documentElement);
    const bodyPropagates = rootStyle.overflowX === "visible" && rootStyle.overflowY === "visible";
    for (let node = element.parentElement; node && !fixed; node = node.parentElement) {
      const style = getComputedStyle(node);
      // The root's overflow (and the body's, when the root's is visible) applies to the viewport, not to a box.
      const propagatesToViewport = node === document.documentElement || (node === document.body && bodyPropagates);
      if (!propagatesToViewport && (style.overflowX !== "visible" || style.overflowY !== "visible")) {
        const rect = node.getBoundingClientRect();
        const left = rect.left + node.clientLeft;
        const top = rect.top + node.clientTop;
        box = { left: Math.max(box.left, left), top: Math.max(box.top, top), right: Math.min(box.right, left + node.clientWidth), bottom: Math.min(box.bottom, top + node.clientHeight) };
      }
      if (style.position === "fixed") fixed = true;
    }
    return box;
  };
  const scrolls = (element) => {
    const out = [{ name: "window", x: scrollX, y: scrollY }];
    for (let node = element.parentElement; node; node = node.parentElement) if (node.scrollTop || node.scrollLeft) out.push({ name: node.tagName.toLowerCase() + "." + String(node.className).trim().split(/\\s+/).join("."), x: node.scrollLeft, y: node.scrollTop });
    return out;
  };
  const outlineOf = (element) => { const style = getComputedStyle(element); return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) || 0, offset: Number.parseFloat(style.outlineOffset) || 0, color: style.outlineColor }; };
  const real = (element) => Boolean(element) && element !== document.body && element !== document.documentElement && element.isConnected;
  const place = async (element, margin) => {
    if (!real(element)) return { ok: false, reason: "no element" };
    // Captures follow a quiescent frame: finite transitions/animations (e.g. a neighbour's outline-color transition) have
    // finished before and after the placing scroll, so anti-aliasing noise of a running transition cannot pass as a ring.
    const settledBefore = await window.__visual.settle();
    element.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
    const settledAfter = await window.__visual.settle();
    const rect = element.getBoundingClientRect();
    const vis = visibleBox(element);
    const x0 = Math.ceil(Math.max(vis.left, Math.floor(rect.left) - margin));
    const y0 = Math.ceil(Math.max(vis.top, Math.floor(rect.top) - margin));
    const x1 = Math.floor(Math.min(vis.right, Math.ceil(rect.right) + margin));
    const y1 = Math.floor(Math.min(vis.bottom, Math.ceil(rect.bottom) + margin));
    const hoveredList = document.querySelectorAll(":hover");
    const hovered = hoveredList.length ? hoveredList[hoveredList.length - 1] : null;
    return { ok: x1 - x0 > 0 && y1 - y0 > 0 && settledBefore.running === 0 && settledAfter.running === 0, rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }, vis, clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, scroll: scrolls(element), outline: outlineOf(element),
      hovered: hovered ? hovered.tagName.toLowerCase() + "." + String(hovered.className).trim().split(/\\s+/).join(".") : null, settled: [settledBefore.frames, settledAfter.frames, settledAfter.running] };
  };
  window.__b48 = {
    stopElement: null,
    placeFocused(margin) { this.stopElement = document.activeElement; return place(this.stopElement, margin); },
    async placeAgain(margin) {
      const result = await place(this.stopElement, margin);
      const now = document.activeElement;
      result.stillFocused = now === this.stopElement;
      result.next = real(now) ? { rect: (({ left, top, right, bottom }) => ({ left, top, right, bottom }))(now.getBoundingClientRect()), outline: outlineOf(now) } : null;
      return result;
    },
    async decode(base64) {
      const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(bitmap, 0, 0);
      const data = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
      const digest = await crypto.subtle.digest("SHA-256", data);
      return { width: bitmap.width, height: bitmap.height, sha256: Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("") };
    },
  };
  return "installed";
})()`;
async function shotViewportClip(clip) {
  const offset = await pageOffset();
  const shot = await main.cdp("Page.captureScreenshot", { format: "png", clip: { x: clip.x + offset.x, y: clip.y + offset.y, width: clip.width, height: clip.height, scale: 1 }, captureBeyondViewport: false });
  return { base64: shot.data, buffer: Buffer.from(shot.data, "base64"), offset };
}
/** A stable frame: the clip is captured until two consecutive captures (120 ms apart) are byte-identical, at most 6
 *  captures, so a transient raster state (seen next to a neighbour's repaint in development) is never compared. */
async function stableViewportClip(clip) {
  let previous = await shotViewportClip(clip);
  for (let attempt = 2; attempt <= 6; attempt += 1) {
    await delay(120);
    const next = await shotViewportClip(clip);
    if (next.buffer.equals(previous.buffer)) return { ...next, attempts: attempt, stable: true };
    previous = next;
  }
  return { ...previous, attempts: 6, stable: false };
}
const crop = (image, x0, y0, width, height) => {
  const out = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) out.set(image.data.subarray(((y0 + y) * image.width + x0) * 4, ((y0 + y) * image.width + x0 + width) * 4), y * width * 4);
  return { width, height, data: out };
};
/** Once per run: (1) this decoder equals the browser's own PNG decoding; (2) CDP clips are page coordinates (exercised with the window scrolled when the page can scroll). */
async function pixelSelfTests(id) {
  await parkMouse();
  const viewport = await evaluate("({ width: innerWidth, height: innerHeight, pageMax: document.documentElement.scrollHeight - document.documentElement.clientHeight })");
  // A content-rich region: the hue slider's gradient track with a margin (scrolled into view by the probe).
  const regionAround = (rect) => ({ x: Math.max(0, Math.floor(rect.left) - 10), y: Math.max(0, Math.floor(rect.top) - 10), width: Math.min(160, Math.ceil(rect.width) + 20), height: Math.ceil(rect.height) + 20 });
  const hue = await evaluate(`__visual.probe("hue-slider")`);
  pre(`${id}:pixel-self-test-region-found`, hue.found && hue.inViewport, { hue });
  const region = regionAround(hue.rect);
  const sample = await shotViewportClip(region);
  const own = decodePng(sample.buffer);
  const browserDecode = await evaluate(`__b48.decode(${JSON.stringify(sample.base64)})`);
  const distinct = new Set();
  for (let index = 0; index < own.data.length; index += 4) distinct.add(`${own.data[index]},${own.data[index + 1]},${own.data[index + 2]},${own.data[index + 3]}`);
  record("pixel-self-test-decoder", { id, region, own: { width: own.width, height: own.height, sha256: rgbaSha256(own), distinctColours: distinct.size }, browser: browserDecode, png: sha256(sample.buffer) });
  pre(`${id}:png-decoder-equals-the-browser-decoding-of-the-same-screenshot`, own.width === browserDecode.width && own.height === browserDecode.height && rgbaSha256(own) === browserDecode.sha256 && distinct.size > 8, { own: rgbaSha256(own), browser: browserDecode, distinctColours: distinct.size });
  const scrolled = viewport.pageMax > 0 ? await evaluate("__visual.scrollWindowTo('end')") : { y: 0, max: 0 };
  await delay(150);
  const hueNow = await evaluate(`__visual.probe("hue-slider", false)`);
  const scrolledRegion = hueNow.found && hueNow.inViewport ? regionAround(hueNow.rect) : region;
  const full = decodePng(Buffer.from((await main.cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false })).data, "base64"));
  const clipped = decodePng((await shotViewportClip(scrolledRegion)).buffer);
  const naive = decodePng(Buffer.from((await main.cdp("Page.captureScreenshot", { format: "png", clip: { ...scrolledRegion, scale: 1 }, captureBeyondViewport: false })).data, "base64"));
  const reference = crop(full, scrolledRegion.x, scrolledRegion.y, scrolledRegion.width, scrolledRegion.height);
  const pageCoordinatesMatch = rgbaSha256(clipped) === rgbaSha256(reference);
  const viewportCoordinatesMatch = rgbaSha256(naive) === rgbaSha256(reference);
  record("pixel-self-test-clip-coordinates", { id, windowScroll: scrolled, pageMax: viewport.pageMax, region: scrolledRegion, pageCoordinatesMatch, viewportCoordinatesMatch, exercised: scrolled.y > 0 });
  pre(`${id}:cdp-clip-in-page-coordinates-equals-the-viewport-crop${scrolled.y > 0 ? "-with-the-window-scrolled" : "-window-not-scrollable"}`, pageCoordinatesMatch && (scrolled.y > 0 ? !viewportCoordinatesMatch : true), { pageCoordinatesMatch, viewportCoordinatesMatch, scrolled });
  await evaluate("__visual.scrollWindowTo(0)");
  await delay(100);
}
function compareFocusBand(focusedBuffer, movedBuffer, first, again) {
  const a = decodePng(focusedBuffer);
  const b = decodePng(movedBuffer);
  const rect = { left: first.rect.left - first.clip.x, top: first.rect.top - first.clip.y, right: first.rect.right - first.clip.x, bottom: first.rect.bottom - first.clip.y };
  const inner = first.outline.offset - 2;
  const outer = first.outline.offset + first.outline.width + 2;
  let next = null;
  if (again.next) {
    const pad = (again.next.outline.style === "none" ? 0 : Math.max(0, again.next.outline.offset) + again.next.outline.width) + 3;
    next = { left: again.next.rect.left - again.clip.x - pad, top: again.next.rect.top - again.clip.y - pad, right: again.next.rect.right - again.clip.x + pad, bottom: again.next.rect.bottom - again.clip.y + pad };
  }
  let bandPixels = 0;
  let bandDiff = 0;
  let interiorPixels = 0;
  let interiorDiff = 0;
  let surroundDiff = 0;
  let excluded = 0;
  let totalDiff = 0;
  for (let y = 0; y < a.height; y += 1) {
    for (let x = 0; x < a.width; x += 1) {
      const index = (y * a.width + x) * 4;
      const differs = a.data[index] !== b.data[index] || a.data[index + 1] !== b.data[index + 1] || a.data[index + 2] !== b.data[index + 2] || a.data[index + 3] !== b.data[index + 3];
      if (differs) totalDiff += 1;
      const X = x + 0.5;
      const Y = y + 0.5;
      if (next && X >= next.left && X <= next.right && Y >= next.top && Y <= next.bottom) { excluded += 1; continue; }
      const dx = Math.max(rect.left - X, 0, X - rect.right);
      const dy = Math.max(rect.top - Y, 0, Y - rect.bottom);
      const distance = dx > 0 || dy > 0 ? Math.max(dx, dy) : -Math.min(X - rect.left, rect.right - X, Y - rect.top, rect.bottom - Y);
      if (distance >= inner && distance <= outer) { bandPixels += 1; if (differs) bandDiff += 1; }
      else if (distance < inner) { interiorPixels += 1; if (differs) interiorDiff += 1; }
      else if (differs) surroundDiff += 1;
    }
  }
  // The stop's OWN region is its outline band plus its own box (the next stop's ring area excluded): with aligned, stable
  // frames, identical scroll and hover, a change there can only come from the stop's own focus state.
  return { size: `${a.width}x${a.height}`, sameSize: a.width === b.width && a.height === b.height, bandPixels, bandDiff, bandRatio: bandPixels ? Math.round((bandDiff / bandPixels) * 1000) / 1000 : 0,
    interiorPixels, interiorDiff, ownPixels: bandPixels + interiorPixels, ownDiff: bandDiff + interiorDiff, surroundDiff, excluded, totalDiff };
}
let pixelSelfTested = false;
const pixelWalkLog = [];
/** One full Tab cycle from the anchor; every stop focused vs moved on, by decoded pixels in its own outline band. */
async function pixelFocusWalk(id, { anchor = `${PANE} .pane-title`, max = 140, expectedStops = null } = {}) {
  pre(`${id}:pixel-walk-helper-installed`, ["installed", "present"].includes(await evaluate(B48_PAGE_HELPER)));
  if (!pixelSelfTested) {
    await pixelSelfTests(id);
    pixelSelfTested = true;
  }
  await clickAnchor(anchor, `${id}:pixel-walk-anchor`);
  await parkMouse();
  const tabbable = await evaluate("__visual.tabbables()");
  const visited = [];
  const rows = [];
  const misaligned = [];
  let first = null;
  let pending = null;
  let closed = false;
  const walkName = id.split(":").slice(2).join("-");
  for (let index = 0; index < max; index += 1) {
    await press("Tab");
    const now = await evaluate("__visual.focusInfo()");
    if (pending) {
      const again = await evaluate(`__b48.placeAgain(${PIXEL_MARGIN})`);
      const aligned = pending.first.ok && again.ok && !again.stillFocused && isDeepStrictEqual(again.clip, pending.first.clip) && again.hovered === pending.first.hovered
        && ["left", "top", "right", "bottom"].every((side) => Math.abs(again.rect[side] - pending.first.rect[side]) < 0.01);
      const moved = aligned ? await stableViewportClip(again.clip) : null;
      const stable = Boolean(moved) && moved.stable && pending.shot.stable === true;
      if (!aligned || !stable) misaligned.push({ desc: pending.desc, stable: { focused: pending.shot.stable ?? null, movedOn: moved?.stable ?? null }, first: { ok: pending.first.ok, rect: pending.first.rect, clip: pending.first.clip, scroll: pending.first.scroll, hovered: pending.first.hovered }, again: { ok: again.ok, rect: again.rect, clip: again.clip, scroll: again.scroll, hovered: again.hovered, stillFocused: again.stillFocused } });
      const comparison = aligned && stable ? compareFocusBand(pending.shot.buffer, moved.buffer, pending.first, again) : null;
      const row = {
        desc: pending.desc, next: now.isBody ? "body" : now.desc, focusVisible: pending.focus.focusVisible, outline: pending.first.outline, clip: pending.first.clip, pageOffset: pending.shot.offset, hovered: pending.first.hovered,
        captures: { focused: pending.shot.attempts ?? null, movedOn: moved?.attempts ?? null },
        focusedPng: sha256(pending.shot.buffer), movedOnPng: moved ? sha256(moved.buffer) : null, ...(comparison ?? {}),
        visible: Boolean(comparison) && pending.first.outline.style !== "none" && comparison.ownDiff > 0,
      };
      if (comparison && !row.visible) {
        // A failing stop: both clips are kept as evidence (reviewed manually).
        const safe = pending.desc.replace(/[^a-z0-9]+/gi, "-");
        row.screenshots = [
          (await saveShot(`pixel-${walkName}-${safe}-focused`, pending.shot.base64, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: pending.first.clip, pageOffset: pending.shot.offset, state: `${walkName} walk: ${pending.desc} focused by a trusted Tab (fixed ${short}, pet hidden)` })).file,
          (await saveShot(`pixel-${walkName}-${safe}-moved-on`, moved.base64, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: again.clip, pageOffset: moved.offset, state: `${walkName} walk: ${pending.desc} after focus moved on to ${row.next} (fixed ${short}, pet hidden)` })).file,
        ];
      }
      rows.push(row);
      pending = null;
    }
    if (!now.isBody && now.desc === first) { closed = true; break; }
    visited.push(now.isBody ? "body" : now.desc);
    if (!now.isBody) {
      if (first === null) first = now.desc;
      const placed = await evaluate(`__b48.placeFocused(${PIXEL_MARGIN})`);
      const shot = placed.ok ? await stableViewportClip(placed.clip) : { buffer: Buffer.alloc(0), offset: null, stable: false, attempts: 0 };
      pending = { desc: now.desc, focus: now, first: placed, shot };
    }
  }
  const inside = visited.filter((desc) => desc !== "body");
  const startIndex = tabbable.indexOf(first);
  const rotated = startIndex >= 0 ? [...tabbable.slice(startIndex), ...tabbable.slice(0, startIndex)] : [];
  pre(`${id}:pixel-walk-completed-a-full-cycle-with-every-stop-captured-twice-in-stable-aligned-frames`, closed && rows.length === inside.length && misaligned.length === 0 && rows.every((row) => (row.ownPixels ?? 0) > 0) && visited.filter((desc) => desc === "body").length <= 1, { closed, rows: rows.length, inside: inside.length, misaligned: misaligned.slice(0, 4) });
  const retaken = rows.filter((row) => (row.captures.focused ?? 0) > 2 || (row.captures.movedOn ?? 0) > 2).map((row) => `${row.desc}:${row.captures.focused}/${row.captures.movedOn}`);
  if (retaken.length) observe(`${id}:captures-that-needed-more-than-two-shots-to-be-stable`, { retaken });
  if (expectedStops) pre(`${id}:pixel-walk-visited-exactly-the-stops-of-the-tab-cycle`, isDeepStrictEqual(inside, expectedStops), { inside, expectedStops });
  else checkDeferred(`${id}:full-tab-cycle-equals-the-dom-order-of-tabbable-controls`, isDeepStrictEqual(inside, rotated), { inside, rotated });
  const failed = rows.filter((row) => !row.visible);
  const weak = rows.filter((row) => row.visible && row.bandRatio < 0.15);
  if (weak.length) observe(`${id}:visible-stops-with-a-weak-ring-signal-below-15-percent-of-the-band-for-manual-review`, { weak: weak.map((row) => ({ desc: row.desc, bandPixels: row.bandPixels, bandDiff: row.bandDiff, bandRatio: row.bandRatio, surroundDiff: row.surroundDiff })) });
  record("pixel-focus-walk", { id, width: KEYBOARD_WIDTH, stops: rows.length, failed: failed.map((row) => row.desc), weak: weak.map((row) => row.desc), rows });
  checkDeferred(`${id}:every-tab-stop-has-visible-focus-computed-outline-not-none-and-focused-vs-moved-on-pixels-differ-in-its-own-ring-or-box`, rows.length > 0 && failed.length === 0,
    { failed: failed.map((row) => ({ desc: row.desc, outline: row.outline, bandPixels: row.bandPixels, bandDiff: row.bandDiff, ownPixels: row.ownPixels, ownDiff: row.ownDiff, totalDiff: row.totalDiff })) });
  const fontRow = rows.find((row) => row.desc === "font-slider");
  pixelWalkLog.push({ id, stops: rows.length, failed: failed.map((row) => row.desc), minBandDiff: Math.min(...rows.map((row) => row.bandDiff ?? 0)), fontSlider: fontRow ? { outline: fontRow.outline, bandDiff: fontRow.bandDiff, bandPixels: fontRow.bandPixels, focusedPng: fontRow.focusedPng, movedOnPng: fontRow.movedOnPng } : null });
  return rows;
}
// ===================================================================================================
// End of the frozen oracle block.
// ===================================================================================================

// ---------------------------------------------------------------------------------------------------
// Keyboard states (contract §9 "Keyboard"): seeded, mounted on /app/settings/appearance, pet hidden by its own toggle
// ---------------------------------------------------------------------------------------------------
const NEW_STOP = /^topbar:button\.rail-order-status-(button|action)/;
const statusDesc = (lang, kind) => `topbar:button.rail-order-status-button:${kind === "source" ? COPY[lang].statusSourceName : COPY[lang].statusDraftName}`.slice(0, "topbar:button.rail-order-status-button:".length + 30);
/** The probe vocabulary's descriptor of each new control (probes file: `topbar:<tag.classes>:<aria-label, 30 chars>`). */
const NEW_DESCS = (lang) => ({
  statusFailed: statusDesc(lang, "failed"),
  statusSource: statusDesc(lang, "source"),
  retry: `topbar:button.rail-order-status-action.rail-order-status-action--primary:${COPY[lang].retry.name}`.slice(0, "topbar:button.rail-order-status-action.rail-order-status-action--primary:".length + 30),
  discard: `topbar:button.rail-order-status-action:${COPY[lang].discard.name}`.slice(0, "topbar:button.rail-order-status-action:".length + 30),
  export: `topbar:button.rail-order-status-action:${COPY[lang].export.name}`.slice(0, "topbar:button.rail-order-status-action:".length + 30),
  reload: `topbar:button.rail-order-status-action:${COPY[lang].reload.name}`.slice(0, "topbar:button.rail-order-status-action:".length + 30),
});
const ACTIVE = "(() => { const a = document.activeElement; return { body: !a || a === document.body || a === document.documentElement, testid: a && a.getAttribute ? a.getAttribute('data-testid') : null, trigger: !!(a && a.classList && a.classList.contains('topbar-pref-trigger')), focusVisible: !!(a && a.matches && a.matches(':focus-visible')), outline: a ? (({ outlineStyle, outlineWidth, outlineOffset, outlineColor }) => ({ outlineStyle, outlineWidth, outlineOffset, outlineColor }))(getComputedStyle(a)) : null }; })()";
/**
 * Seeds `lang` (+ theme, the source bytes, the premium stub) and mounts the production App of `variant` on the Appearance
 * route at the mount width (EN 1024; ZH 1440, so the pet toggle is visible), hides the pet through its own rail toggle,
 * makes the requested drafts by trusted input at the mount width, resizes to the keyboard width and installs the frozen
 * read-only probes.
 */
async function kbState(id, { variant = "fixed", theme = "light", kind = "clean", appearanceDraft = false, premium = false, unreadable = false } = {}) {
  const page = mainPage;
  await setViewport(page, MOUNT_WIDTH);
  const extra = {
    ...(theme === "dark" ? { [THEME_KEY]: JSON.stringify("dark") } : {}),
    ...(kind === "source" && !unreadable ? { [RAIL_KEY]: "{}" } : {}),
    ...(kind === "source" && unreadable ? { [RAIL_KEY]: JSON.stringify(REVERSED()) } : {}),
    ...(premium ? { [PREMIUM_TIER_KEY]: "premium_stub", [PREMIUM_STARTED_KEY]: String(Date.now()) } : {}),
  };
  await seed(page, seedsFor(LANG, extra), id);
  await mountApp(page, `${id}:mount`, { variant, faultPlan: unreadable ? { get: [RAIL_KEY] } : null });
  await resetScrollers(page, `${id}:pet-hidden`);
  let drop = null;
  if (kind === "failed") drop = await failedDrop(page, `${id}:failed-drop`, LANG, { S: facts0.registryDefault });
  if (appearanceDraft) await failTopbarTheme(page, `${id}:appearance-draft`, LANG);
  if (KEYBOARD_WIDTH !== MOUNT_WIDTH) await setViewport(page, KEYBOARD_WIDTH);
  await resetScrollers(page, `${id}:resized`);
  await ev(page, PROBES_SOURCE);
  pre(`${id}:frozen-probes-installed`, await ev(page, "!!window.__visual && typeof __visual.focusInfo === 'function' && typeof __visual.tabbables === 'function'"));
  await ev(page, "__visual.settle()");
  await parkMouse(page);
  const view = await statusNow(page);
  const html = await ev(page, "({ theme: document.documentElement.getAttribute('data-theme'), lang: document.documentElement.getAttribute('lang'), pet: !!document.querySelector('.pet-wrap'), width: innerWidth, height: innerHeight, scale: visualViewport.scale, badge: !!document.querySelector('[data-testid=\"premium-tier-badge\"]') })");
  pre(`${id}:state-theme-${theme}-pet-hidden-viewport-${KEYBOARD_WIDTH}`, html.theme === (appearanceDraft ? "dark" : theme) && !html.pet && html.width === KEYBOARD_WIDTH && html.height === HEIGHTS[KEYBOARD_WIDTH] && html.scale === 1, { html });
  if (premium) pre(`${id}:premium-badge-rendered`, html.badge, { html });
  if (variant === "fixed") pre(`${id}:status-${kind}`, kind === "clean" ? !view.present : statusMatches(view, LANG, kind === "source" ? "source" : "failed", { open: false }), { view });
  else pre(`${id}:419e56d-has-no-rail-status`, !view.present, { view });
  return { page, drop };
}
/** Opens the panel by a trusted click on the status button (setup only; keyboard toggling is judged separately). */
async function openPanelByClick(page, id) {
  await trustedClick(page, '[data-testid="rail-order-status"]', `${id}:status-click`);
  pre(`${id}:panel-open`, await waitUntil(page, "!!document.querySelector('[data-testid=\"rail-order-panel\"]')", 3000));
  await parkMouse(page);
  await ev(page, "__visual.settle()");
}
/** A trusted click on the Topbar's own background (a non-focusable point of header.topbar): the Tab starting point. */
async function topbarAnchor(page, label) {
  const point = await ev(page, `(() => {
    const header = document.querySelector('header.topbar');
    const r = header.getBoundingClientRect();
    for (const y of [r.top + r.height / 2, r.top + 3, r.bottom - 3]) for (let x = Math.ceil(r.left) + 1; x < r.right - 1; x += 1) if (document.elementFromPoint(x, y) === header) return { x, y };
    return null;
  })()`);
  pre(`${label}:topbar-background-point-found`, point !== null, { point });
  const mark = await markOf(page);
  await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await input(page, "Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(80);
  await parkMouse(page);
  const clicks = (await ev(page, `__native.window(${mark}).events`)).filter((entry) => entry.type === "click");
  const active = await ev(page, ACTIVE);
  pre(`${label}:one-trusted-click-on-the-topbar-background-focus-on-body`, clicks.filter((entry) => entry.trusted).length === 1 && active.body, { clicks, active });
}
/** Trusted Tab presses until `predicate` (page expression on the active element) holds; the path is returned. */
async function tabUntil(page, label, predicate, max = 12) {
  const path = [];
  for (let index = 0; index < max; index += 1) {
    await pressKey(page, "Tab");
    const now = await ev(page, "__visual.focusInfo()");
    path.push(now.isBody ? "body" : now.desc);
    if (await ev(page, `(() => { const a = document.activeElement; return ${predicate}; })()`)) return path;
  }
  pre(`${label}:reached-by-trusted-tab`, false, { path });
  return path;
}
const isTestid = (testid) => `!!a && a.getAttribute && a.getAttribute('data-testid') === ${JSON.stringify(testid)}`;
const scrollState = (page) => ev(page, "__visual.scrolled()");
/** rAF focus sampler: per animation frame, whether focus is on <body>, its testid, the trigger, and the status presence. */
const FRAMES_START = "(() => { window.__e14Frames = []; window.__e14On = true; const tick = () => { if (!window.__e14On) return; const a = document.activeElement; window.__e14Frames.push({ seq: __native.mark(), body: !a || a === document.body || a === document.documentElement, testid: a && a.getAttribute ? a.getAttribute('data-testid') : null, trigger: !!(a && a.classList && a.classList.contains('topbar-pref-trigger')), status: !!document.querySelector('[data-testid=\"rail-order-status\"]') }); requestAnimationFrame(tick); }; requestAnimationFrame(tick); return true; })()";
const FRAMES_STOP = "(() => { window.__e14On = false; const f = window.__e14Frames || []; window.__e14Frames = []; return f; })()";
const framesSummary = (frames) => ({ frames: frames.length, bodyFrames: frames.filter((frame) => frame.body).length, statusFrames: frames.filter((frame) => frame.status).length, triggerFrames: frames.filter((frame) => frame.trigger).length,
  sequence: frames.reduce((out, frame) => { const tag = frame.body ? "body" : frame.trigger ? "trigger" : frame.testid ?? "other"; const label = `${tag}${frame.status ? "+status" : ""}`; if (out.at(-1) !== label) out.push(label); return out; }, []) });

/**
 * One key press on the focused control and its effects since the press: the trusted click count per target, storage
 * attempts, focus, scroll state, the panel and the status; optionally a frame sampler around the press.
 */
async function keyOn(page, id, key, { frames = false, settle = null, settleTimeout = 6000 } = {}) {
  const before = await scrollState(page);
  const focusBefore = await ev(page, ACTIVE);
  const mark = await markOf(page);
  if (frames) await ev(page, FRAMES_START);
  await pressKey(page, key);
  // `__MARK__` in a settle expression is the instrument sequence just before the press.
  const settled = settle ? await waitUntil(page, settle.replaceAll("__MARK__", String(mark)), settleTimeout) : true;
  await delay(350);
  const frameList = frames ? await ev(page, FRAMES_STOP) : null;
  const after = await scrollState(page);
  const now = await snap(page, mark);
  const active = await ev(page, ACTIVE);
  const clicks = now.events.filter((entry) => entry.type === "click");
  const result = { id, key, focusBefore, active, settled, clicks: clicks.map((entry) => ({ trusted: entry.trusted, testid: entry.target.testid, tag: entry.target.tag })), trustedClicks: clicks.filter((entry) => entry.trusted),
    attempts: now.attempts, mutations: mutations(now.attempts), railAttempts: now.attempts.filter((entry) => entry.key === RAIL_KEY), scrollBefore: before, scrollAfter: after, scrollUnchanged: isDeepStrictEqual(before, after),
    status: now.status, bytes: now.bytes, rail: now.rail, urlTrace: now.urlTrace, clickTrace: now.clickTrace, anchors: now.anchors, frames: frameList ? framesSummary(frameList) : null, mark };
  record("key-activation", { ...result, attempts: brief(now.attempts), mutations: brief(result.mutations), railAttempts: brief(result.railAttempts), urlTrace: { createAttempts: now.urlTrace.createAttempts, created: now.urlTrace.created.length, revoked: now.urlTrace.revoked.length }, clickTrace: { attempts: now.clickTrace.attempts } });
  return result;
}
const visibleDownloads = () => readdirSync(downloads).filter((name) => !name.startsWith("."));
const clearDownloads = () => { for (const name of readdirSync(downloads)) unlinkSync(join(downloads, name)); };
async function awaitDownload(timeout = 10000) {
  const file = join(downloads, "rail-order-draft.json");
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const names = visibleDownloads();
    if (names.includes("rail-order-draft.json") && !names.some((name) => name.endsWith(".crdownload"))) {
      const first = statSync(file).size;
      await delay(150);
      const second = statSync(file).size;
      if (first > 0 && first === second) return { names: visibleDownloads(), raw: readFileSync(file) };
    }
    await delay(50);
  }
  return null;
}
const envelopeOf = (value) => ({ version: 1, kind: "rail-order-draft", changes: { device: { railOrder: { operation: "set", value } } } });

// ---------------------------------------------------------------------------------------------------
// Section "order": Tab order through the Topbar (badge, Appearance status, rail status, panel actions, trigger)
// ---------------------------------------------------------------------------------------------------
const TOPBAR_DESC = (desc) => desc.startsWith("topbar:");
async function sectionOrder() {
  for (const kind of ["failed", "source"]) {
    const id = `order-${LANG}-${kind}`;
    caseStart(id);
    const { page } = await kbState(id, { kind, appearanceDraft: kind === "failed", premium: true });
    const segment = await beginSegment(page, id);
    const controls = (await ev(page, "__native.topbar()")).controlsOrder;
    const expectedControls = kind === "failed" ? ["premium-tier-badge", "appearance-status", "rail-order-status-root", "topbar-pref"] : ["premium-tier-badge", "rail-order-status-root", "topbar-pref"];
    check(`${id}:topbar-controls-dom-order-badge-appearance-status-rail-status-then-the-appearance-popover`, isDeepStrictEqual(controls, expectedControls), { controls, expectedControls });
    const badge = await ev(page, "(() => { const b = document.querySelector('[data-testid=\"premium-tier-badge\"]'); return { tag: b.tagName.toLowerCase(), tabIndex: b.tabIndex, inTabbables: __visual.tabbables().some((d) => d.startsWith('topbar-part:span.premium-tier-badge') || d.includes('premium')) }; })()");
    observe(`${id}:premium-badge`, badge);
    check(`${id}:premium-badge-is-not-a-tab-stop`, badge.tabIndex < 0 && !badge.inTabbables, badge);
    // A full trusted Tab cycle from the pane title; Enter on the rail status opens its panel on the way.
    await clickAnchor(`${PANE} .pane-title`, `${id}:anchor`, page);
    await parkMouse(page);
    const visited = [];
    const infos = [];
    let first = null;
    let closed = false;
    let enterResult = null;
    for (let index = 0; index < 180; index += 1) {
      await pressKey(page, "Tab");
      const now = await ev(page, "__visual.focusInfo()");
      if (!now.isBody && now.desc === first) { closed = true; break; }
      visited.push(now.isBody ? "body" : now.desc);
      infos.push(now);
      if (!now.isBody && first === null) first = now.desc;
      if (!enterResult && (await ev(page, `(() => { const a = document.activeElement; return ${isTestid("rail-order-status")}; })()`))) {
        enterResult = await keyOn(page, `${id}:enter-on-the-status-during-the-cycle`, "Enter");
        check(`${id}:enter-on-the-status-opens-the-panel-focus-kept`, enterResult.status.expanded === "true" && statusMatches(enterResult.status, LANG, kind === "source" ? "source" : "failed", { open: true }) && enterResult.active.testid === "rail-order-status"
          && enterResult.trustedClicks.length === 1, { status: enterResult.status, active: enterResult.active, clicks: enterResult.clicks });
      }
    }
    const tabbables = await ev(page, "__visual.tabbables()");
    const startIndex = tabbables.indexOf(first);
    const rotated = startIndex >= 0 ? [...tabbables.slice(startIndex), ...tabbables.slice(0, startIndex)] : [];
    const inside = visited.filter((desc) => desc !== "body");
    record("tab-cycle", { id, visited, first, closed, tabbables, infos: infos.map((info) => ({ desc: info.desc, focusVisible: info.focusVisible, outline: info.outline, centerHit: info.centerHit, inViewport: info.inViewport })) });
    pre(`${id}:full-cycle-closed-with-at-most-one-body-stop-and-the-panel-opened-on-the-way`, closed && visited.filter((desc) => desc === "body").length <= 1 && enterResult !== null, { closed, visited: visited.length });
    check(`${id}:full-tab-cycle-equals-the-dom-order-of-tabbable-controls`, isDeepStrictEqual(inside, rotated), { inside, rotated });
    const d = NEW_DESCS(LANG);
    const topbar = inside.filter(TOPBAR_DESC);
    const expectedTopbar = kind === "failed"
      ? ["topbar:search", "topbar:status", d.statusFailed, d.retry, d.discard, d.export, "topbar:trigger"]
      : ["topbar:search", d.statusSource, d.reload, "topbar:trigger"];
    check(`${id}:topbar-tab-order-${kind === "failed" ? "search-appearance-status-rail-status-retry-discard-export-trigger" : "search-rail-status-reload-trigger"}`, isDeepStrictEqual(topbar, expectedTopbar), { topbar, expectedTopbar });
    const badStops = infos.filter((info) => !info.isBody && (!info.focusVisible || info.outline.style === "none" || Number.parseFloat(info.outline.width) <= 0));
    check(`${id}:every-stop-matches-focus-visible-with-a-painted-computed-outline`, badStops.length === 0, { badStops: badStops.map((info) => ({ desc: info.desc, focusVisible: info.focusVisible, outline: info.outline })) });
    const newInfos = infos.filter((info) => NEW_STOP.test(info.desc));
    // Hit-testing and containment of the new controls are E13's (judged there without the badge); recorded here.
    check(`${id}:new-controls-focus-ring-solid-2px-offset-2px`, newInfos.length === (kind === "failed" ? 4 : 2) && newInfos.every((info) => info.focusVisible && info.outline.style === "solid" && info.outline.width === "2px" && info.outline.offset === "2px"),
      { newInfos: newInfos.map((info) => ({ desc: info.desc, outline: info.outline, centerHit: info.centerHit, inViewport: info.inViewport })) });
    // Shift+Tab back from the trigger through the panel and the statuses.
    await tabUntil(page, `${id}:to-trigger`, "!!a && a.classList && a.classList.contains('topbar-pref-trigger')", 200);
    const back = [];
    for (let index = 0; index < expectedTopbar.length - 1; index += 1) {
      await pressKey(page, "ShiftTab");
      back.push((await ev(page, "__visual.focusInfo()")).desc);
    }
    check(`${id}:shift-tab-from-the-trigger-walks-the-topbar-in-reverse`, isDeepStrictEqual(back, [...expectedTopbar].reverse().slice(1)), { back });
    // A screenshot with the panel open and a focused action (manual review).
    await tabUntil(page, `${id}:to-last-action`, `(${isTestid(kind === "failed" ? "rail-order-export" : "rail-order-reload")})`, 12);
    await screenshot(page, `${id}-panel-open-${kind === "failed" ? "export" : "reload"}-focused`, { state: `${kind} rail state${kind === "failed" ? " + Appearance draft" : ""} + premium badge, panel opened by Enter, ${kind === "failed" ? "Export" : "Reload"} focused by trusted Tab (light, pet hidden)` });
    await endSegment(segment, ZERO);
  }
}

// ---------------------------------------------------------------------------------------------------
// Section "activate": Enter and Space once, no Space scroll, Escape, and the §9 focus targets
// ---------------------------------------------------------------------------------------------------
async function sectionActivate() {
  const L = LANG;
  // D1 — a failed draft: status toggles, Escape, failing Retry, Export, then Discard by Enter.
  {
    const id = `act-${L}-failed-enter`;
    caseStart(id);
    const { page, drop } = await kbState(id, { kind: "failed" });
    const segment = await beginSegment(page, id);
    // Positive control for "no page scroll on Space": Space with focus on the (scriptably focused, removable tabindex)
    // pane title scrolls the settings scroller or the window (batch 46 probe, disclosed there).
    pre(`${id}:space-scroll-positive-control-armed`, await ev(page, "__visual.armScrollProbe()"));
    const scrollBefore = await scrollState(page);
    await pressKey(page, "Space");
    await delay(400);
    const scrollAfter = await scrollState(page);
    await ev(page, "__visual.disarmScrollProbe()");
    observe(`${id}:space-scroll-positive-control`, { scrollBefore, scrollAfter });
    pre(`${id}:space-on-a-non-control-scrolls-the-page`, !isDeepStrictEqual(scrollBefore, scrollAfter), { scrollBefore, scrollAfter });
    await resetScrollers(page, `${id}:after-positive-control`);
    await topbarAnchor(page, `${id}:anchor`);
    const path = await tabUntil(page, `${id}:to-status`, isTestid("rail-order-status"));
    observe(`${id}:path-from-the-topbar-background`, { path });
    await screenshot(page, `${id}-status-focused`, { state: "failed draft, status focused by trusted Tab, panel closed (light, pet hidden)" });
    const toggles = [];
    for (const [key, expanded] of [["Enter", "true"], ["Enter", "false"], ["Space", "true"], ["Space", "false"]]) {
      const r = await keyOn(page, `${id}:status-${key}-${expanded === "true" ? "open" : "close"}`, key);
      toggles.push(r);
      check(`${id}:status:${key}-toggles-the-panel-exactly-once-to-${expanded === "true" ? "open" : "closed"}`, r.status.expanded === expanded && (expanded === "true" ? !!r.status.panel : r.status.panel === null)
        && r.trustedClicks.length === 1 && r.trustedClicks[0].target.testid === "rail-order-status" && r.clicks.length === 1, { expanded: r.status.expanded, clicks: r.clicks });
      check(`${id}:status:${key}-${expanded}:focus-stays-on-the-status-button`, r.active.testid === "rail-order-status" && r.active.focusVisible, { active: r.active });
      check(`${id}:status:${key}-${expanded}:no-storage-mutation-and-no-rail-attempt`, r.mutations.length === 0 && r.railAttempts.length === 0, { mutations: brief(r.mutations), rail: brief(r.railAttempts) });
      if (key === "Space") check(`${id}:status:space-${expanded}:no-page-scroll`, r.scrollUnchanged, { before: r.scrollBefore, after: r.scrollAfter });
      if (expanded === "true") check(`${id}:status:${key}:panel-content-is-the-failed-draft-panel`, statusMatches(r.status, L, "failed", { open: true }), { panel: r.status.panel });
    }
    // Escape from an action: the panel closes and focus returns to the status button.
    await keyOn(page, `${id}:open-again`, "Enter");
    await pressKey(page, "Tab");
    pre(`${id}:retry-focused`, (await ev(page, ACTIVE)).testid === "rail-order-retry");
    let r = await keyOn(page, `${id}:escape-from-retry`, "Escape");
    check(`${id}:escape-from-an-action-closes-the-panel-and-returns-focus-to-the-status-button`, r.status.panel === null && r.status.expanded === "false" && r.active.testid === "rail-order-status" && r.mutations.length === 0, { status: r.status.expanded, active: r.active });
    await keyOn(page, `${id}:open-again-2`, "Space");
    r = await keyOn(page, `${id}:escape-from-status`, "Escape");
    check(`${id}:escape-on-the-status-closes-the-panel-focus-stays-on-the-status-button`, r.status.panel === null && r.status.expanded === "false" && r.active.testid === "rail-order-status", { status: r.status.expanded, active: r.active });
    // Retry while the fault is still armed: exactly one attempt per key, refused, focus stays on Retry.
    await keyOn(page, `${id}:open-for-retry`, "Enter");
    await pressKey(page, "Tab");
    pre(`${id}:retry-focused-again`, (await ev(page, ACTIVE)).testid === "rail-order-retry");
    await screenshot(page, `${id}-panel-open-retry-focused`, { state: "failed draft, panel opened by Enter, Retry focused by trusted Tab (light, pet hidden)" });
    for (const key of ["Enter", "Space"]) {
      const settle = `(() => { if (!__native.window(__MARK__).attempts.some((entry) => entry.key === ${JSON.stringify(RAIL_KEY)} && entry.op === 'set')) return false; const s = __native.railStatus(); const retry = s.panel && s.panel.actions.find((entry) => entry.testid === 'rail-order-retry'); return !!retry && retry.ariaDisabled === null && s.panel.message && s.panel.message.text === ${JSON.stringify(COPY[L].notSaved)}; })()`;
      r = await keyOn(page, `${id}:retry-failing-${key}`, key, { frames: true, settle });
      const sets = railOps(r.attempts, ["set"]);
      check(`${id}:retry-${key}:exactly-one-click-and-one-refused-set-attempt`, r.trustedClicks.length === 1 && r.clicks.length === 1 && r.trustedClicks[0].target.testid === "rail-order-retry" && sets.length === 1 && sets[0].outcome.startsWith("denied") && railOps(r.attempts, ["remove", "clear"]).length === 0,
        { clicks: r.clicks, sets: brief(sets) });
      check(`${id}:retry-${key}:failed-retry-keeps-focus-on-retry-and-the-failed-status`, r.settled && r.active.testid === "rail-order-retry" && statusMatches(r.status, L, "failed", { open: true }) && r.frames.bodyFrames === 0, { active: r.active, frames: r.frames });
      if (key === "Space") check(`${id}:retry-space:no-page-scroll`, r.scrollUnchanged, { before: r.scrollBefore, after: r.scrollAfter });
    }
    // Export by Enter and by Space: one export each, focus stays on Export.
    await pressKey(page, "Tab");
    await pressKey(page, "Tab");
    pre(`${id}:export-focused`, (await ev(page, ACTIVE)).testid === "rail-order-export");
    await screenshot(page, `${id}-panel-open-export-focused`, { state: "failed draft, Export focused by trusted Tab (light, pet hidden)" });
    for (const key of ["Enter", "Space"]) {
      clearDownloads();
      const before = await ev(page, "({ url: __native.urlTrace(), click: __native.clickTrace() })");
      r = await keyOn(page, `${id}:export-${key}`, key);
      const download = await awaitDownload();
      const value = download ? parse(download.raw.toString("utf8")) : null;
      const created = r.urlTrace.created.length - before.url.created.length;
      check(`${id}:export-${key}:exactly-one-click-one-object-url-one-anchor-click-one-download`, r.trustedClicks.length === 1 && r.trustedClicks[0].target.testid === "rail-order-export" && r.clicks.filter((entry) => entry.trusted).length === 1
        && created === 1 && r.clickTrace.attempts - before.click.attempts === 1 && download !== null && download.names.length === 1, { clicks: r.clicks, created, anchorClicks: r.clickTrace.attempts - before.click.attempts, names: download?.names });
      check(`${id}:export-${key}:file-is-the-set-envelope-of-the-draft`, isDeepStrictEqual(value, envelopeOf(drop.expected)), { value, expected: envelopeOf(drop.expected) });
      check(`${id}:export-${key}:focus-stays-on-export-status-kept-no-storage-mutation`, r.active.testid === "rail-order-export" && statusMatches(r.status, L, "failed", { open: true }) && r.mutations.length === 0 && r.anchors === 0, { active: r.active, mutations: brief(r.mutations) });
      if (key === "Space") check(`${id}:export-space:no-page-scroll`, r.scrollUnchanged, { before: r.scrollBefore, after: r.scrollAfter });
    }
    clearDownloads();
    // Discard by Enter: the status unmounts and focus lands on .topbar-pref-trigger (every frame), never <body>.
    await pressKey(page, "ShiftTab");
    pre(`${id}:discard-focused`, (await ev(page, ACTIVE)).testid === "rail-order-discard");
    r = await keyOn(page, `${id}:discard-Enter`, "Enter", { frames: true, settle: "!__native.railStatus().present" });
    check(`${id}:discard-enter:exactly-one-click-zero-set-or-remove`, r.trustedClicks.length === 1 && r.clicks.length === 1 && r.trustedClicks[0].target.testid === "rail-order-discard" && railOps(r.attempts).length === 0 && r.mutations.length === 0, { clicks: r.clicks, mutations: brief(r.mutations) });
    check(`${id}:discard-enter:status-unmounts-and-focus-lands-on-the-appearance-trigger-never-body`, r.settled && !r.status.present && r.active.trigger && !r.active.body && r.frames.bodyFrames === 0 && r.frames.sequence.at(-1) === "trigger", { active: r.active, frames: r.frames });
    check(`${id}:discard-enter:rail-shows-the-committed-order`, isDeepStrictEqual(r.rail, idsToLabels(L, drop.D0)), { rail: labelsToIds(L, r.rail) });
    await screenshot(page, `${id}-after-discard-trigger-focused`, { state: "after a keyboard Discard: status gone, focus on the appearance trigger (light, pet hidden)" });
    await endSegment(segment, ZERO);
  }
  // D2 — Discard by Space.
  {
    const id = `act-${L}-failed-space-discard`;
    caseStart(id);
    const { page, drop } = await kbState(id, { kind: "failed" });
    const segment = await beginSegment(page, id);
    await topbarAnchor(page, `${id}:anchor`);
    await tabUntil(page, `${id}:to-status`, isTestid("rail-order-status"));
    await keyOn(page, `${id}:open`, "Space");
    await pressKey(page, "Tab");
    await pressKey(page, "Tab");
    pre(`${id}:discard-focused`, (await ev(page, ACTIVE)).testid === "rail-order-discard");
    const r = await keyOn(page, `${id}:discard-Space`, "Space", { frames: true, settle: "!__native.railStatus().present" });
    check(`${id}:discard-space:exactly-one-click-zero-set-or-remove-no-scroll`, r.trustedClicks.length === 1 && r.clicks.length === 1 && r.trustedClicks[0].target.testid === "rail-order-discard" && r.mutations.length === 0 && r.scrollUnchanged, { clicks: r.clicks, mutations: brief(r.mutations) });
    check(`${id}:discard-space:status-unmounts-and-focus-lands-on-the-appearance-trigger-never-body`, r.settled && !r.status.present && r.active.trigger && r.frames.bodyFrames === 0, { active: r.active, frames: r.frames });
    check(`${id}:discard-space:rail-shows-the-committed-order`, isDeepStrictEqual(r.rail, idsToLabels(L, drop.D0)), { rail: labelsToIds(L, r.rail) });
    await endSegment(segment, ZERO);
  }
  // D3/D4 — a Retry that succeeds, by Enter and by Space.
  for (const key of ["Enter", "Space"]) {
    const id = `act-${L}-retry-success-${key.toLowerCase()}`;
    caseStart(id);
    const { page, drop } = await kbState(id, { kind: "failed" });
    const segment = await beginSegment(page, id);
    await topbarAnchor(page, `${id}:anchor`);
    await tabUntil(page, `${id}:to-status`, isTestid("rail-order-status"));
    await keyOn(page, `${id}:open`, key);
    await pressKey(page, "Tab");
    pre(`${id}:retry-focused`, (await ev(page, ACTIVE)).testid === "rail-order-retry");
    await ev(page, "__native.restore()");
    const r = await keyOn(page, `${id}:retry-${key}`, key, { frames: true, settle: "!__native.railStatus().present" });
    const sets = railOps(r.attempts, ["set"]);
    check(`${id}:retry-${key}:exactly-one-click-and-one-successful-write-of-the-draft`, r.trustedClicks.length === 1 && r.clicks.length === 1 && r.trustedClicks[0].target.testid === "rail-order-retry" && sets.length === 1 && sets[0].outcome === "ok"
      && sets[0].value === JSON.stringify(drop.expected) && r.bytes === JSON.stringify(drop.expected), { clicks: r.clicks, sets: brief(sets) });
    check(`${id}:retry-${key}:status-unmounts-and-focus-lands-on-the-appearance-trigger-never-body`, r.settled && !r.status.present && r.active.trigger && r.frames.bodyFrames === 0 && r.frames.sequence.at(-1) === "trigger", { active: r.active, frames: r.frames });
    if (key === "Space") check(`${id}:retry-space:no-page-scroll`, r.scrollUnchanged, { before: r.scrollBefore, after: r.scrollAfter });
    if (key === "Enter") await screenshot(page, `${id}-after-retry-trigger-focused`, { state: "after a keyboard Retry that succeeded: status gone, focus on the appearance trigger (light, pet hidden)" });
    await endSegment(segment, ZERO);
  }
  // D5 — a source issue ({}): unrepaired Reload by Enter, then a repairing Reload by Enter after an external repair.
  {
    const id = `act-${L}-source-enter`;
    caseStart(id);
    const { page } = await kbState(id, { kind: "source" });
    const segment = await beginSegment(page, id);
    await topbarAnchor(page, `${id}:anchor`);
    await tabUntil(page, `${id}:to-status`, isTestid("rail-order-status"));
    let r = await keyOn(page, `${id}:open`, "Enter");
    check(`${id}:enter-opens-the-source-panel-focus-kept`, statusMatches(r.status, L, "source", { open: true }) && r.active.testid === "rail-order-status" && r.trustedClicks.length === 1 && r.mutations.length === 0, { status: r.status });
    await pressKey(page, "Tab");
    pre(`${id}:reload-focused`, (await ev(page, ACTIVE)).testid === "rail-order-reload");
    await screenshot(page, `${id}-panel-open-reload-focused`, { state: "source issue ({}), panel opened by Enter, Reload focused by trusted Tab (light, pet hidden)" });
    r = await keyOn(page, `${id}:reload-unrepaired-Enter`, "Enter", { frames: true });
    check(`${id}:unrepaired-reload-enter:one-click-zero-writes-status-kept-focus-not-body`, r.trustedClicks.length === 1 && r.clicks.length === 1 && r.mutations.length === 0 && statusMatches(r.status, L, "source", { open: true }) && !r.active.body && r.frames.bodyFrames === 0,
      { active: r.active, frames: r.frames, mutations: brief(r.mutations) });
    observe(`${id}:focus-after-an-unrepaired-reload`, { active: r.active });
    const S = REVERSED();
    await externalDocument(`localStorage.setItem(${JSON.stringify(RAIL_KEY)}, ${JSON.stringify(JSON.stringify(S))}); localStorage.getItem(${JSON.stringify(RAIL_KEY)}) !== null`, `${id}:external-repair`);
    pre(`${id}:storage-event-delivered-and-the-source-status-kept`, await waitUntil(page, `__native.window(${r.mark}).storageReceived.some((entry) => entry.key === ${JSON.stringify(RAIL_KEY)} && entry.trusted)`, 4000) && (await statusNow(page)).present);
    // Bringing the main tab back to front may move focus; if Reload lost it, it is reached again by keyboard (recorded).
    const kept = await ev(page, ACTIVE);
    observe(`${id}:focus-after-the-second-document-closed`, { active: kept });
    if (kept.testid !== "rail-order-reload") {
      await topbarAnchor(page, `${id}:re-anchor`);
      await tabUntil(page, `${id}:re-to-status`, isTestid("rail-order-status"));
      if ((await statusNow(page)).expanded !== "true") await keyOn(page, `${id}:re-open`, "Enter");
      await tabUntil(page, `${id}:re-to-reload`, isTestid("rail-order-reload"), 4);
    }
    pre(`${id}:reload-focused-after-the-repair`, (await ev(page, ACTIVE)).testid === "rail-order-reload" && (await statusNow(page)).present);
    r = await keyOn(page, `${id}:reload-repairing-Enter`, "Enter", { frames: true, settle: "!__native.railStatus().present" });
    check(`${id}:repairing-reload-enter:one-click-zero-writes-committed-order`, r.trustedClicks.length === 1 && r.clicks.length === 1 && r.mutations.length === 0 && isDeepStrictEqual(r.rail, idsToLabels(L, displayOrder(S, visibleIds()))) && r.bytes === JSON.stringify(S),
      { rail: labelsToIds(L, r.rail), mutations: brief(r.mutations) });
    check(`${id}:repairing-reload-enter:status-unmounts-and-focus-lands-on-the-appearance-trigger-never-body`, r.settled && !r.status.present && r.active.trigger && r.frames.bodyFrames === 0 && r.frames.sequence.at(-1) === "trigger", { active: r.active, frames: r.frames });
    await screenshot(page, `${id}-after-reload-trigger-focused`, { state: "after a keyboard Reload that repaired the source: status gone, focus on the appearance trigger (light, pet hidden)" });
    await endSegment(segment, ZERO);
  }
  // D6 — an unreadable source: Space on Reload while still denied, then Space after the read fault is lifted.
  {
    const id = `act-${L}-source-space`;
    caseStart(id);
    const { page } = await kbState(id, { kind: "source", unreadable: true });
    const segment = await beginSegment(page, id);
    await topbarAnchor(page, `${id}:anchor`);
    await tabUntil(page, `${id}:to-status`, isTestid("rail-order-status"));
    let r = await keyOn(page, `${id}:open`, "Space");
    check(`${id}:space-opens-the-source-panel-focus-kept-no-scroll`, statusMatches(r.status, L, "source", { open: true }) && r.active.testid === "rail-order-status" && r.trustedClicks.length === 1 && r.scrollUnchanged, { status: r.status });
    await pressKey(page, "Tab");
    pre(`${id}:reload-focused`, (await ev(page, ACTIVE)).testid === "rail-order-reload");
    r = await keyOn(page, `${id}:reload-denied-Space`, "Space", { frames: true });
    check(`${id}:reload-while-unreadable-space:one-click-a-denied-read-zero-writes-status-kept-focus-not-body-no-scroll`, r.trustedClicks.length === 1 && r.clicks.length === 1 && r.mutations.length === 0 && r.railAttempts.some((entry) => entry.op === "get" && entry.outcome === "denied")
      && statusMatches(r.status, L, "source", { open: true }) && !r.active.body && r.frames.bodyFrames === 0 && r.scrollUnchanged, { active: r.active, rail: brief(r.railAttempts) });
    await ev(page, `__native.allowGet(${JSON.stringify(RAIL_KEY)})`);
    pre(`${id}:reload-still-focused`, (await ev(page, ACTIVE)).testid === "rail-order-reload");
    r = await keyOn(page, `${id}:reload-repaired-Space`, "Space", { frames: true, settle: "!__native.railStatus().present" });
    check(`${id}:repairing-reload-space:one-click-zero-writes-committed-order-no-scroll`, r.trustedClicks.length === 1 && r.clicks.length === 1 && r.mutations.length === 0 && isDeepStrictEqual(r.rail, idsToLabels(L, displayOrder(REVERSED(), visibleIds()))) && r.scrollUnchanged,
      { rail: labelsToIds(L, r.rail), mutations: brief(r.mutations) });
    check(`${id}:repairing-reload-space:status-unmounts-and-focus-lands-on-the-appearance-trigger-never-body`, r.settled && !r.status.present && r.active.trigger && r.frames.bodyFrames === 0, { active: r.active, frames: r.frames });
    await endSegment(segment, ZERO);
  }
}

// ---------------------------------------------------------------------------------------------------
// Section "walks": the frozen per-stop pixel focus oracle over the four §9 states, light and dark, plus the 419e56d control
// ---------------------------------------------------------------------------------------------------
const walkResults = {};
async function sectionWalks() {
  const d = NEW_DESCS(LANG);
  for (const theme of ["light", "dark"]) {
    const plan = [
      { name: `control-419e56d-clean-${theme}`, variant: "before", kind: "clean", open: false, newStops: [] },
      { name: `clean-${theme}`, variant: "fixed", kind: "clean", open: false, newStops: [] },
      { name: `failed-closed-${theme}`, variant: "fixed", kind: "failed", open: false, newStops: [d.statusFailed] },
      { name: `failed-open-${theme}`, variant: "fixed", kind: "failed", open: true, newStops: [d.statusFailed, d.retry, d.discard, d.export] },
      { name: `source-open-${theme}`, variant: "fixed", kind: "source", open: true, newStops: [d.statusSource, d.reload] },
    ];
    for (const entry of plan) {
      const id = `walk:${LANG}:${entry.name}`;
      caseStart(id);
      const { page } = await kbState(id, { variant: entry.variant, theme, kind: entry.kind });
      main = page;
      if (entry.open) await openPanelByClick(page, id);
      const segment = await beginSegment(page, id);
      // Panel-open walks start inside the panel (its message), so the anchor's mousedown never closes it.
      const anchor = entry.open ? '[data-testid="rail-order-message"]' : `${PANE} .pane-title`;
      const rows = await pixelFocusWalk(id, { anchor });
      const descs = rows.map((row) => row.desc);
      walkResults[entry.name] = { rows, descs, entry };
      const found = descs.filter((desc) => NEW_STOP.test(desc));
      check(`${id}:exactly-this-states-new-stops-are-in-the-cycle`, isDeepStrictEqual([...found].sort(), [...entry.newStops].sort()), { found, expected: entry.newStops });
      for (const desc of entry.newStops) {
        const row = rows.find((candidate) => candidate.desc === desc);
        check(`${id}:new-stop-visible-by-pixels:${desc}`, Boolean(row) && row.visible && row.focusVisible && row.outline.style !== "none" && row.ownDiff > 0,
          row ? { outline: row.outline, ownDiff: row.ownDiff, ownPixels: row.ownPixels, bandDiff: row.bandDiff, bandPixels: row.bandPixels, bandRatio: row.bandRatio, focusedPng: row.focusedPng, movedOnPng: row.movedOnPng } : { missing: true });
      }
      if (entry.open || entry.kind !== "clean") {
        const topbar = descs.filter(TOPBAR_DESC);
        const expected = entry.kind === "source" ? ["topbar:search", d.statusSource, d.reload, "topbar:trigger"] : entry.open ? ["topbar:search", d.statusFailed, d.retry, d.discard, d.export, "topbar:trigger"] : ["topbar:search", d.statusFailed, "topbar:trigger"];
        // The cycle starts at the anchor, so compare as a rotation of the Topbar sub-sequence.
        const rotations = expected.map((_, index) => [...expected.slice(index), ...expected.slice(0, index)]);
        check(`${id}:topbar-stops-in-order-search-status-panel-actions-trigger`, rotations.some((rotation) => isDeepStrictEqual(rotation, topbar)), { topbar, expected });
      }
      if (entry.open) {
        const firstStop = descs[0];
        await screenshot(page, `${entry.name}-end-${entry.kind === "source" ? "reload" : "retry"}-focused`, { state: `${entry.name} walk complete: focus back on its first stop (${firstStop}) (pet hidden)`, firstStop });
        // Recorded, not judged: every pre-existing stop whose captured clip (viewport coordinates at capture time)
        // intersects the open panel's box at the end of the walk (exact for the fixed panel at 767 px and below).
        const panelBox = await ev(page, "(() => { const p = document.querySelector('[data-testid=\"rail-order-panel\"]'); if (!p) return null; const r = p.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, position: getComputedStyle(p).position }; })()");
        const overlapOf = (clip) => (panelBox && clip ? Math.max(0, Math.min(panelBox.right, clip.x + clip.width) - Math.max(panelBox.left, clip.x)) * Math.max(0, Math.min(panelBox.bottom, clip.y + clip.height) - Math.max(panelBox.top, clip.y)) : 0);
        observe(`${id}:pre-existing-stops-whose-clip-intersects-the-open-panel`, { panel: panelBox, stops: rows.filter((row) => !NEW_STOP.test(row.desc) && overlapOf(row.clip) > 0).map((row) => ({ desc: row.desc, clip: row.clip, overlap: Math.round(overlapOf(row.clip)), clipArea: row.clip.width * row.clip.height, ownDiff: row.ownDiff, ownPixels: row.ownPixels, bandRatio: row.bandRatio })) });
        // Recorded, not judged: a weak pre-existing stop outside the rail (oracle's own 15% band criterion) is focused
        // again by trusted Tab and placed as the oracle places it; its box and the open panel's box are recorded with
        // their intersection, and a viewport screenshot is kept for manual review.
        for (const row of rows.filter((candidate) => candidate.visible && candidate.bandRatio < 0.15 && !candidate.desc.startsWith("rail:") && !NEW_STOP.test(candidate.desc))) {
          const path = [];
          for (let index = 0; index < 160; index += 1) {
            await pressKey(page, "Tab");
            const now = await ev(page, "__visual.focusInfo()");
            path.push(now.desc);
            if (now.desc === row.desc) break;
          }
          pre(`${id}:weak-stop-refocused:${row.desc}`, path.at(-1) === row.desc, { path: path.slice(-6) });
          const placed = await ev(page, "__b48.placeFocused(10)");
          const geometry = await ev(page, `(() => { const p = document.querySelector('[data-testid="rail-order-panel"]'); const r = p ? p.getBoundingClientRect() : null; const a = document.activeElement.getBoundingClientRect();
            const box = (b) => b ? { left: Math.round(b.left * 100) / 100, top: Math.round(b.top * 100) / 100, right: Math.round(b.right * 100) / 100, bottom: Math.round(b.bottom * 100) / 100 } : null;
            const ix = r ? Math.max(0, Math.min(r.right, a.right) - Math.max(r.left, a.left)) * Math.max(0, Math.min(r.bottom, a.bottom) - Math.max(r.top, a.top)) : 0;
            const hit = document.elementFromPoint(a.left + a.width / 2, a.top + a.height / 2);
            return { stop: box(a), panel: box(r), panelPosition: p ? getComputedStyle(p).position : null, intersectionArea: Math.round(ix), stopArea: Math.round(a.width * a.height), centreHitsStop: !!hit && document.activeElement.contains(hit), centreHitsPanel: !!(hit && p && p.contains(hit)) }; })()`);
          const shot = await screenshot(page, `${entry.name}-weak-stop${rows.indexOf(row)}-${row.desc.replace(/[^a-z0-9]+/gi, "-").replace(/-+$/, "")}-focused`, { state: `${entry.name}: weak pre-existing stop ${row.desc} focused by trusted Tab and placed as the oracle places it (pet hidden)` });
          record("weak-stop-diagnostic", { id, desc: row.desc, values: { ownDiff: row.ownDiff, ownPixels: row.ownPixels, bandDiff: row.bandDiff, bandPixels: row.bandPixels, bandRatio: row.bandRatio, surroundDiff: row.surroundDiff, clip: row.clip }, placedClip: placed.clip, geometry, screenshot: shot.file });
        }
      }
      await endSegment(segment, ZERO, { reference: entry.variant === "before" });
    }
    // Pre-existing stops against the 419e56d control (same language, theme, viewport and seeds).
    const control = walkResults[`control-419e56d-clean-${theme}`];
    const controlByDesc = new Map(control.rows.map((row) => [row.desc, row]));
    const clean = walkResults[`clean-${theme}`];
    check(`walk:${LANG}:clean-${theme}:same-stops-in-the-same-order-as-419e56d`, isDeepStrictEqual(clean.descs, control.descs), { fixed: clean.descs, before: control.descs });
    const samePng = clean.rows.filter((row) => controlByDesc.get(row.desc)?.focusedPng === row.focusedPng && controlByDesc.get(row.desc)?.movedOnPng === row.movedOnPng).length;
    observe(`walk:${LANG}:clean-${theme}:clip-pairs-byte-identical-to-419e56d`, { identical: samePng, of: clean.rows.length, differing: clean.rows.filter((row) => controlByDesc.get(row.desc)?.focusedPng !== row.focusedPng || controlByDesc.get(row.desc)?.movedOnPng !== row.movedOnPng).map((row) => row.desc) });
    for (const name of [`clean-${theme}`, `failed-closed-${theme}`, `failed-open-${theme}`, `source-open-${theme}`]) {
      const walk = walkResults[name];
      const existing = walk.rows.filter((row) => !NEW_STOP.test(row.desc));
      check(`walk:${LANG}:${name}:pre-existing-stops-are-exactly-the-419e56d-stops`, isDeepStrictEqual(existing.map((row) => row.desc).sort(), [...control.descs].sort()), { fixed: existing.map((row) => row.desc), before: control.descs });
      const regressions = existing.filter((row) => (controlByDesc.get(row.desc)?.visible ?? false) && !row.visible);
      check(`walk:${LANG}:${name}:every-pre-existing-stop-visible-as-at-419e56d`, regressions.length === 0, { regressions: regressions.map((row) => ({ desc: row.desc, ownDiff: row.ownDiff, outline: row.outline })) });
      const pick = (row) => (row ? { ownDiff: row.ownDiff, ownPixels: row.ownPixels, bandDiff: row.bandDiff, bandPixels: row.bandPixels, bandRatio: row.bandRatio, visible: row.visible } : null);
      observe(`walk:${LANG}:${name}:weak-stops-with-the-419e56d-control-values`, { weak: existing.filter((row) => row.visible && row.bandRatio < 0.15).map((row) => ({ desc: row.desc, fixed: pick(row), control419e56d: pick(controlByDesc.get(row.desc)) })) });
    }
  }
  // Summary: per walk, stops, failed, weak (the oracle's own 15% band criterion) with their values.
  const summary = Object.fromEntries(Object.entries(walkResults).map(([name, walk]) => [name, {
    variant: walk.entry.variant, stops: walk.rows.length, failed: walk.rows.filter((row) => !row.visible).map((row) => row.desc),
    weak: walk.rows.filter((row) => row.visible && row.bandRatio < 0.15).map((row) => ({ desc: row.desc, bandDiff: row.bandDiff, bandPixels: row.bandPixels, bandRatio: row.bandRatio, ownDiff: row.ownDiff, ownPixels: row.ownPixels, surroundDiff: row.surroundDiff })),
    minOwnDiff: Math.min(...walk.rows.map((row) => row.ownDiff ?? 0)),
    newStops: walk.rows.filter((row) => NEW_STOP.test(row.desc)).map((row) => ({ desc: row.desc, visible: row.visible, focusVisible: row.focusVisible, outline: row.outline, ownDiff: row.ownDiff, ownPixels: row.ownPixels, bandDiff: row.bandDiff, bandPixels: row.bandPixels, bandRatio: row.bandRatio })),
    firstRailStop: walk.rows.find((row) => row.desc.startsWith("rail:") && row.desc !== "rail:avatar") ? (({ desc, ownDiff, ownPixels, bandDiff, bandPixels, bandRatio }) => ({ desc, ownDiff, ownPixels, bandDiff, bandPixels, bandRatio }))(walk.rows.find((row) => row.desc.startsWith("rail:") && row.desc !== "rail:avatar")) : null,
  }]));
  record("walk-summary", { lang: LANG, width: KEYBOARD_WIDTH, walks: summary, oracleWalkLog: pixelWalkLog.map((entry) => ({ id: entry.id, stops: entry.stops, failed: entry.failed, minBandDiff: entry.minBandDiff })) });
}

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
let harnessError = null;
try {
  const fixedArchive = extractArchive(resolved);
  const beforeArchive = extractArchive(BEFORE_REVISION);
  for (const name of ["fixed", "before"]) await buildVariant(name);

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
  main = mainPage;
  await mainPage.cdp("Page.bringToFront");
  await browser.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
  await mainPage.cdp("Fetch.enable", { patterns: [{ urlPattern: `${origin}/`, resourceType: "Document", requestStage: "Request" }] });
  const version = await browser.send("Browser.getVersion");
  record("baseline", {
    requested, resolved, resolvedTree, expectedFixed: FIXED_SHA, rowFilter: ONLY, before: BEFORE_REVISION, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix, lang: LANG, composition: "production-app", variants: ["fixed", "before"],
    keyboardViewport: { width: KEYBOARD_WIDTH, height: HEIGHTS[KEYBOARD_WIDTH], mobileEmulation: KEYBOARD_WIDTH <= 414, mountWidth: MOUNT_WIDTH },
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { fixed: sha256(archiveLock), before: sha256(beforeLock), dependencies: sha256(dependencyLock), extractedFixed: sha256(fixedArchive.extractedLock), extractedBefore: sha256(beforeArchive.extractedLock), contractGate: LOCKFILE_GATE_SHA256 },
    fileSha256: { [RUNNER]: runnerSha256, [FIXTURE]: sha256(fixtureSource), [PRELUDE]: sha256(preludeSource), "native-visual-keyboard-probes.js": sha256(PROBES_SOURCE) },
    frozenLocal: { expected: FROZEN_LOCAL, actual: frozenLocalActual },
    frozenAppearance: { expected: FROZEN_APPEARANCE, actual: frozenAppearanceActual },
    oracleIdentity,
    contract: { path: CONTRACT_PATH, sha256AtHead: contractSha256, expected: CONTRACT_SHA256 },
    fixedVsBefore: { before: BEFORE_REVISION, productFilesChanged: fixedDelta },
    origin: "127.0.0.1 (ephemeral port, this runner's own server); every other host resolves to NOTFOUND",
    devtools: "pipe transport (--remote-debugging-pipe), flattened target sessions; Input.dispatchKeyEvent without nativeVirtualKeyCode (Enter and Space with text); Input.dispatchMouseEvent and Input.dispatchDragEvent (setInterceptDrags)",
  });
  pre("baseline:requested-revision-resolves-to-the-fixed-sha", resolved === FIXED_SHA, { resolved });
  pre("baseline:docs-head-product-tree-equals-fixed", productDelta === "", { productDelta });
  pre("baseline:fixed-delta-is-exactly-the-19-e6-files", isDeepStrictEqual(fixedDelta, EXPECTED_FIXED_DELTA), { fixedDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === LOCKFILE_GATE_SHA256 && sha256(archiveLock) === LOCKFILE_GATE_SHA256 && sha256(fixedArchive.extractedLock) === LOCKFILE_GATE_SHA256 && sha256(beforeArchive.extractedLock) === LOCKFILE_GATE_SHA256);
  pre("baseline:contract-r1-hash", contractSha256 === CONTRACT_SHA256, { contractSha256 });
  pre("baseline:frozen-apprail-native-conventions-unchanged", isDeepStrictEqual(frozenLocalActual, FROZEN_LOCAL), { frozenLocalActual });
  pre("baseline:frozen-appearance-keyboard-conventions-unchanged", isDeepStrictEqual(frozenAppearanceActual, FROZEN_APPEARANCE), { frozenAppearanceActual });
  pre("baseline:oracle-file-equals-its-commit-bacdbbc", oracleIdentity.frozenFileSha256 === oracleIdentity.frozenFileAtCommitSha256 && oracleIdentity.frozenFileSha256 === FROZEN_APPEARANCE[ORACLE_FILE], oracleIdentity);
  pre("baseline:pixel-focus-walk-oracle-block-byte-identical-to-the-frozen-file", oracleIdentity.blockBytesEqual && oracleIdentity.frozenBlockSha256 === oracleIdentity.ownBlockSha256 && oracleIdentity.frozenFunctionSha256 === oracleIdentity.ownFunctionSha256, oracleIdentity);

  await setViewport(mainPage, MOUNT_WIDTH);
  caseStart("prime-archive-facts");
  await seed(mainPage, seedsFor(LANG), "prime");
  await mountApp(mainPage, "prime:mount", { hidePet: false });
  if (selected("walks")) await sectionWalks();
  if (selected("order")) await sectionOrder();
  if (selected("activate")) await sectionActivate();
  currentCase = null;

  await collectDocument(mainPage, "end-of-run");
  record("observation", { id: "run:network-and-requests", network: networkSeen, served });
  record("observation", { id: "k1:keyboard-audit", dispatch: "keyDown (Enter, Space: with text) or rawKeyDown, then keyUp; key, code, windowsVirtualKeyCode and modifiers only (no nativeVirtualKeyCode)", ...keyboardAudit });
  pre("run:no-non-local-network-attempt", networkSeen.nonLocal === 0, { networkSeen });
  pre("run:k1-keyboard-trace-contains-only-the-runner-key-presses", keyboardAudit.mismatches.length === 0 && keyboardAudit.untrusted === 0 && keyboardAudit.keyEvents === keyboardAudit.expectedKeyEvents && keyboardAudit.runnerPresses > 0, keyboardAudit);
  check("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs: dialogs.filter((entry) => !entry.expected) });
  pre("run:no-renderer-crash", !runtimeErrors.some((entry) => entry.kind === "renderer-crash"));
  const selfTestError = (entry) => entry.kind === "console.error" && entry.text === "native apprail prelude self-test error trace" && String(entry.source?.url ?? "").endsWith("/__native/prelude.js");
  const judged = runtimeErrors.filter((entry) => entry.variant !== "before" && !selfTestError(entry));
  record("observation", { id: "run:runtime-errors", total: runtimeErrors.length, selfTestPositiveControl: runtimeErrors.filter(selfTestError).length, fixedVariant: judged.length, beforeReferenceVariant: runtimeErrors.filter((entry) => entry.variant === "before").length, samples: runtimeErrors.slice(0, 6) });
  check("run:zero-runtime-errors-in-the-fixed-product", judged.length === 0, { samples: judged.slice(0, 6) });
} catch (error) {
  harnessError = error;
} finally {
  const warningGroups = {};
  for (const warning of consoleWarnings) {
    const key = `${warning.text.slice(0, 160)} @ ${warning.source?.module ?? warning.source?.url ?? "unknown"}`;
    warningGroups[key] = (warningGroups[key] ?? 0) + 1;
  }
  const bySection = {};
  for (const entry of records.filter((item) => item.name === "check" && item.kind === "product")) {
    const section = entry.id.split(/[-:]/)[0];
    bySection[section] = bySection[section] ?? { pass: 0, total: 0 };
    bySection[section].total += 1;
    if (entry.pass) bySection[section].pass += 1;
  }
  record("result", {
    harnessValid: harnessError === null, pass: harnessError === null && failures.length === 0, mode, checks, preconditions, productChecks, failures, bySection,
    browser: browser ? { pid: browser.pid, closeReason: browser.closeReason ?? null, processExit: browser.processExit ?? null } : null,
    runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 6).map((entry) => ({ ...entry, text: entry.text.slice(0, 240) })),
    consoleWarnings: consoleWarnings.length, consoleWarningsBySource: warningGroups, rowGates: rowGates.length,
    dialogs, navigationRequests: navigationRequests.length, artifacts: artifacts.map((entry) => ({ file: entry.file, sha256: entry.sha256 })), keyboardAudit, network: networkSeen,
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
