/**
 * BATCH 50 COPY (CP-APPEARANCE-01, fixed 419e56d, the F-APP-1 and F-APP-2 repairs). A new file: a copy of the frozen
 * batch 48 runner ./verify-visual-keyboard-5bbf473.mjs (SHA-256 5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4,
 * unchanged and hash-checked by this copy), committed with a unified diff against it. Independent visual and keyboard
 * verifier (not the batch 46 or 48 executor); verification only. Changes against the batch 48 runner:
 *   SHA-specific (control plane batch 50): the expected fixed delta is the 26 product files relative to 5cd63ff (the 25
 *     of batch 48 plus packages/xai-web-settings-appearance/src/__tests__/AppearancePane.selected-focus.test.tsx); the
 *     labels name the fixed revision (419e56d) instead of 5bbf473; the runner's own file name.
 *   Additive (required by the batch 50 task, the F-APP-2 ruling "修复后的 E15" and the F-APP-3 ruling; no batch 48 check
 *   is removed or weakened, and no existing line changes except the SHA-specific ones above):
 *     - the batch 48 runner (the diff base) is hash-checked;
 *     - progress lines on stderr at section boundaries (the log is unchanged), so no run is silent for minutes;
 *     - E14: an audit of the two focus rules (F-APP-1, F-APP-2) and of the 24073b5 -> fixed stylesheet increment; the
 *       pre-existing Topbar controls in the clean state compared with 5cd63ff at every width (44x44 ruling: no regression);
 *     - E15 selection walks: per-stop pixel focus walks (the batch 48 oracle, unchanged) with every option group on a
 *       non-default selection, both sliders at non-default values, in the clean, failed-write and source-issue states,
 *       with the Topbar status, in the light (system) and dark themes;
 *     - E15 selected swatch: focused+selected against selected+unfocused by pixels, and the selection ring measured as
 *       still visible while focused (radial colour bands), with a focused non-selected swatch as the control; light and
 *       dark;
 *     - F-APP-3 observation (not gated): the Topbar popover's checked and unchecked menuitemradio options focused against
 *       moved on, by pixels, with their computed outline and background, in the light and dark themes.
 *
 * BATCH 48 COPY (CP-APPEARANCE-01, fixed 5bbf473, the F-APP-1 repair). A new file: a copy of the frozen batch 46 runner
 * ./verify-visual-keyboard.mjs (SHA-256 ac268a0af6263772c9e3976d30b7bc2f3502d52c3973de4daa976734aead0781, unchanged and
 * hash-checked by this copy), committed with a unified diff against it. Independent visual and keyboard verifier (not the
 * batch 46 executor); verification only. Changes against the frozen runner:
 *   SHA-specific (control plane batch 48): the expected fixed delta is the 25 product files relative to 5cd63ff (Terra's
 *     24 plus packages/xai-web-settings-appearance/src/__tests__/AppearancePane.focus-ring.test.tsx); the labels name the
 *     fixed revision (5bbf473) instead of 24073b5; the runner's own file name.
 *   Additive (required by the batch 48 task and the F-APP-1 ruling; no frozen check is removed or weakened):
 *     - the frozen probes ./native-visual-keyboard-probes.js are reused read-only and hash-checked (batch 46 hash), and
 *       the frozen runner's hash is checked (the diff base);
 *     - E15 per-stop visible focus by pixels: after each frozen full Tab cycle (clean, drafts) and in the source-only
 *       state, a second full cycle captures every stop focused and again after focus moved on (stop scrolled to the same
 *       place by script, a quiescent frame before each capture, each capture a stable frame (two consecutive identical
 *       captures), the same hover state required); the decoded pixels inside
 *       the stop's own region (its outline band plus its own box; the newly focused stop's ring area excluded) must
 *       differ, and the computed outline must not be `none` (the F-APP-1 ruling's oracle). A failing stop's two clips are
 *       saved. Self-tests: the PNG
 *       decoder equals the browser's own decoding; CDP clips are page coordinates (checked with the window scrolled);
 *     - E15 reproduction section `swatch-focus` (the per-stop oracle's finding: the SELECTED accent swatch has no visible
 *       focus): Tab to the swatch, then Shift+Tab until focus leaves the swatch row, decoded-pixel comparison of stable
 *       frames, in the fixed product (default accent and xai_accent_hue 230) and in 5cd63ff, with non-selected swatches
 *       as positive controls;
 *     - E14 cascade-order audit: in every gated state, on /app/tasks and in every presentation load, (a) the computed
 *       style of every element under the fixed order must equal the computed style under the 5cd63ff order (re-created
 *       by adopting copies; measurement only, restored), and (b) no rule of the 18 stylesheets emitted after the
 *       Appearance one may target an element or pseudo-element that an Appearance rule declares the same longhand for;
 *       synthetic and real (layout.css moved after Appearance) positive controls.
 *   Fix (disclosed): the frozen captureClip passed viewport-relative rects as CDP clips, which are page coordinates; it
 *   now adds the visual viewport's page offset (identical result while the window is not scrolled).
 *
 * CP-APPEARANCE-01 batch 46 (contract r3 §9 "Responsive presentation", "DesktopPet and other App-level overlays
 * (R-PET rule)", "Sizing and CSS", "Disabled Retry all presentation (measured)", "Screenshots" and "Keyboard"; A2.1–A2.9;
 * §13 gates 8 and 9; §14 E14 and E15): the FIXED Settings Appearance caller in real headless Chrome, in the production
 * App composition, EN and ZH. Independent parent-role visual and keyboard verifier. Verification only: it repairs
 * nothing, implements nothing, accepts nothing and changes no product file, contract, ledger, control plane or existing
 * evidence. Earlier files in this directory are read, never modified: the batch 45 fixture and instruments
 * (./native-host-retryall-app.tsx, ./native-host-retryall-prelude.js) are REUSED READ-ONLY and hash-checked, and the
 * frozen E4 log ./native-5cd63ff-before1-h14.log is read for the H14 reproduction only.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-appearance-recovery-native/verify-visual-keyboard-419e56d.mjs <fixed revision> <mode> <suffix>
 *
 * Modes (one language each; the UI language is the user's stored xai_pref_lang, seeded on a product-free page):
 *   visual-en, visual-zh     E14: five widths (375x812 and 414x896 with mobile emulation, 768x1024, 1024x768,
 *                            1440x900) in the states of §9 (clean, source-only Reload, all seven unresolved, partial
 *                            reset, partial Retry all result, Topbar status on the pane and on /app/tasks, and at 768 an
 *                            open pass held behind the real lock): a pet-on run (R-PET: coverage of every control,
 *                            uncovered centres for the caller's controls, the A2.8 Retry all gate after scrolling into
 *                            view and at the end of the .module-settings range) and a gated pet-hidden run (centre and
 *                            four inset hit-tests, containment, no horizontal scroll, 44x44 targets, overlap, clipping,
 *                            the bottom action area); the Topbar status breakpoint (760/761/767/768/1025); the static
 *                            selector audit; the measured disabled presentation (contrast in both themes with each of
 *                            the six tones, accent independence, the enabled/disabled distinction and box, the focus
 *                            ring, attributes and accessible name); the §9 screenshots; and the 5cd63ff references
 *                            (H14 (a) at 375, H14 (b) pet captures at 768x1024, the unchanged-control geometry).
 *   keyboard-en, keyboard-zh E15 (EN at 1024x768, ZH at 375x812 with mobile emulation): visible focus by pixels (a
 *                            control focused by a trusted Tab against the same control after focus moved on, in the
 *                            fixed product and in 5cd63ff), Tab order and visible focus in the clean, drafts and
 *                            source-only states (the Topbar status before the trigger), Enter and Space once on
 *                            segments, cards, swatches and buttons (no double firing, no Space scroll, with a positive
 *                            control), slider steps, the reset confirmation, focus after Discard, Reload, Retry,
 *                            Discard all and Reset, the Topbar status, and Retry all by keyboard (a Tab stop in every
 *                            state, one pass per Enter or Space, inert while disabled or pending, focus kept).
 *
 * - Products: immutable `git archive`s of the fixed revision and of 5cd63ff; the frozen fixture is bundled with esbuild
 *   from stdin with resolveDir = that archive; every `@repo/*` specifier is pinned to the archive's own package export
 *   and a guard plugin fails the build if any module is loaded from the packages/, apps/ or docs/ tree of the dependency
 *   checkout or of this runner's checkout. Third-party modules come from XAI_DEPS_ROOT only when its pnpm-lock.yaml
 *   SHA-256 equals both archives' and the contract gate (consistency gate; read-only use).
 * - The only synthetic input is the auth session (the frozen fixture's client for one synthetic account).
 * - Page: the frozen prelude, then ./native-visual-keyboard-probes.js (read-only probes), then the bundle, served from
 *   127.0.0.1 only by this runner's own server; every other host resolves to NOTFOUND; isolated headless Chrome profile.
 * - DevTools transport: the pipe (--remote-debugging-pipe) with flattened sessions. Pointer input is CDP
 *   Input.dispatchMouseEvent after a centre hit-test on a stable box; keys are CDP Input.dispatchKeyEvent WITHOUT
 *   nativeVirtualKeyCode (K-1, ../web-native-keyinput-k1/review-k1.md); every document's key trace (keydown, keypress,
 *   keyup) must equal exactly the runner's own presses, in order and trusted (run-level precondition).
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log` and screenshots `native-<sha7>-<suffix>-<mode>-<name>.png` in
 *   this directory; existing evidence is never overwritten. Exit 0 = harness valid and every check PASS; 2 = harness
 *   valid and a product check FAILED (presentation and visible-focus checks are deferred and reported together; other
 *   keyboard checks stop at the first); 1 = harness invalid (a precondition). Development probes may redirect evidence
 *   with XAI_NATIVE_EVIDENCE_DIR and select sections with XAI_VK_SECTIONS or widths with XAI_VK_WIDTHS (all refused for
 *   evidence inside the repository).
 */
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { inflateSync } from "node:zlib";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BEFORE_REVISION = "5cd63ff652f02a2c726187fe12cbc796218d31c0";
const LOCKFILE_GATE_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const CONTRACT_PATH = "docs/reviews/web-appearance-recovery-contract/contract.md";
const CONTRACT_SHA256 = "ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d";
/** Frozen inputs reused read-only (batch 45 fixture and instruments; the E4 H14 log). */
const FROZEN = {
  fixture: { file: "native-host-retryall-app.tsx", sha256: "118f565783fc99e2642341e39ff9afa2df4a6cb937dc016ca41ab13ab1721c19" },
  prelude: { file: "native-host-retryall-prelude.js", sha256: "ad4d711a5639b6685f05ea9cf5742f77d17e5924a127453dcd42f1a117757e7b" },
  e4h14: { file: "native-5cd63ff-before1-h14.log", sha256: "3d1f5763d11207e6e4e24fc2678177aae0960a91fb933985c061b08bde54e02f" },
};
const PROBES = "native-visual-keyboard-probes.js";
const RUNNER = "verify-visual-keyboard-419e56d.mjs";
/** Batch 48: the frozen batch 46 probes are reused read-only, and the frozen batch 46 runner is the diff base of this copy. */
const FROZEN_BATCH46 = {
  probes: { file: PROBES, sha256: "4df16575470d739d1655f32cd1bb0101c2b772552439f3ecfefded4f87bc02c4" },
  runner: { file: "verify-visual-keyboard.mjs", sha256: "ac268a0af6263772c9e3976d30b7bc2f3502d52c3973de4daa976734aead0781" },
};
/** Batch 50: the batch 48 runner is the diff base of this copy (read only, hash-checked). */
const FROZEN_BATCH48 = { runner: { file: "verify-visual-keyboard-5bbf473.mjs", sha256: "5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4" } };
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? output;
if (process.env.XAI_NATIVE_EVIDENCE_DIR && `${realpathSync(evidenceDir)}${sep}`.startsWith(`${realpathSync(root)}${sep}`)) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const SECTIONS = process.env.XAI_VK_SECTIONS ? process.env.XAI_VK_SECTIONS.split(",").map((entry) => entry.trim()).filter(Boolean) : null;
if (SECTIONS && !process.env.XAI_NATIVE_EVIDENCE_DIR) throw Error("XAI_VK_SECTIONS is a development-probe option; committed evidence runs every section");
const selected = (name) => SECTIONS === null || SECTIONS.includes(name);
const DEV_WIDTHS = process.env.XAI_VK_WIDTHS ? process.env.XAI_VK_WIDTHS.split(",").map(Number) : null;
if (DEV_WIDTHS && !process.env.XAI_NATIVE_EVIDENCE_DIR) throw Error("XAI_VK_WIDTHS is a development-probe option; committed evidence runs every width");
const [requested, mode, suffix] = process.argv.slice(2);
const MODES = ["visual-en", "visual-zh", "keyboard-en", "keyboard-zh"];
if (!requested) throw Error("Fixed revision required");
if (!MODES.includes(mode)) throw Error(`Unsupported mode ${mode}; use ${MODES.join("|")}`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const LANG = mode.endsWith("-zh") ? "zh" : "en";
const KIND = mode.startsWith("visual") ? "visual" : "keyboard";
const git = (args, options = {}) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 200 * 1024 * 1024, ...options });
const resolved = git(["rev-parse", "--verify", `${requested}^{commit}`]).trim();
const resolvedTree = git(["rev-parse", `${resolved}^{tree}`]).trim();
const short = resolved.slice(0, 7);
const prefix = `native-${short}-${suffix}-${mode}`;
const evidencePath = join(evidenceDir, `${prefix}.log`);
if (existsSync(evidencePath)) throw Error("Evidence exists; use a distinct suffix");
if (readdirSync(evidenceDir).some((name) => name.startsWith(`${prefix}-`) && name.endsWith(".png"))) throw Error("Screenshots exist; use a distinct suffix");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const round = (value) => Math.round(value * 100) / 100;
const records = [];
const runtimeErrors = [];
const consoleWarnings = [];
const dialogs = [];
const dialogPlan = [];
const screenshots = [];
const navigationRequests = [];
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
/** A product check that does not stop the run; any deferred failure fails the run at the end (exit 2). */
const deferredFailures = [];
const checkDeferred = (id, condition, details = {}) => {
  checks += 1;
  productChecks += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { id, kind: "product", deferred: true, pass, ...details });
  if (!pass) deferredFailures.push(id);
  return pass;
};
const observe = (id, details = {}) => record("observation", { id, ...details });
/** Batch 50 addition: progress lines on stderr (the evidence log is unchanged), so no run is silent for minutes. */
const runStarted = Date.now();
const progress = (message) => process.stderr.write(`[${new Date().toISOString()}] +${Math.round((Date.now() - runStarted) / 1000)}s ${mode} checks=${checks} ${message}\n`);

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const fixtureSource = readFileSync(join(output, FROZEN.fixture.file), "utf8");
const preludeSource = readFileSync(join(output, FROZEN.prelude.file), "utf8");
const probesSource = readFileSync(join(output, PROBES), "utf8");
const e4Raw = readFileSync(join(output, FROZEN.e4h14.file));
const e4Records = e4Raw.toString("utf8").trim().split("\n").map((line) => JSON.parse(line));
const dependencyNodeModules = join(dependencyRoot, "node_modules");
if (!existsSync(dependencyNodeModules)) throw Error("PRECONDITION: dependency tree missing; set XAI_DEPS_ROOT");
const fixedLock = execFileSync("git", ["show", `${resolved}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
const beforeLock = execFileSync("git", ["show", `${BEFORE_REVISION}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
const dependencyLock = readFileSync(join(dependencyRoot, "pnpm-lock.yaml"));
if (sha256(dependencyLock) !== sha256(fixedLock) || sha256(fixedLock) !== LOCKFILE_GATE_SHA256 || sha256(beforeLock) !== LOCKFILE_GATE_SHA256) throw Error("PRECONDITION: lockfile gate (dependency checkout, both revisions and contract gate must be equal)");
const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find((name) => name.startsWith("esbuild@0.28.1"));
if (!esbuildFolder) throw Error("PRECONDITION: pinned esbuild 0.28.1 missing");
const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
const docsHead = git(["rev-parse", "HEAD"]).trim();
const productDelta = git(["diff", "--name-only", resolved, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]).trim();
const fixedDelta = git(["diff", "--name-only", BEFORE_REVISION, resolved, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]).trim().split("\n").filter(Boolean);
const contractSha256 = sha256(execFileSync("git", ["show", `HEAD:${CONTRACT_PATH}`], { cwd: root, maxBuffer: 20 * 1024 * 1024 }));
const versionOf = (name) => {
  try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
};
/** The 26 product files of the fixed revision 419e56d relative to 5cd63ff: the 24 Terra files (contract r3 §11; control
 *  plane E6 row), the batch 47 F-APP-1 guard test and the batch 49 F-APP-2 guard test (control plane batch 50). */
const EXPECTED_FIXED_DELTA = [
  "apps/web/src/App.tsx",
  "apps/web/src/__tests__/App.appearance.test.tsx",
  "packages/xai-web-settings-appearance/docs/api.md",
  "packages/xai-web-settings-appearance/docs/test.md",
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearanceController.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.bilingual.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.focus-ring.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.live-binding.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.rendering.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.save-reset.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.selected-focus.test.tsx",
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
const APPEARANCE_CSS = "packages/xai-web-settings-appearance/src/styles.css";
/** Modules that must come from the archive (composition, readers, the pane, the shell, the pet and every stylesheet involved). */
const REQUIRED_COMMON = [
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/RouteGateElements.tsx",
  "apps/web/src/routes/RouteErrorBoundary.tsx",
  "apps/web/src/providers/AppProviders.tsx",
  "apps/web/src/providers/AccountStorageGate.tsx",
  "apps/web/src/routes/modules/shellRegistrations.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/settingsDeparture.ts",
  "apps/web/src/routes/modules/settingsPaneComposition.ts",
  "apps/web/src/styles/global.css",
  "packages/xai-web-settings-appearance/src/index.ts",
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearancePane.tsx",
  "packages/xai-web-settings-appearance/src/constants.ts",
  "packages/xai-web-settings-appearance/src/styles.css",
  "packages/plugin-web-settings-shell/src/SettingRow.tsx",
  "packages/plugin-web-settings-shell/src/styles.css",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/Topbar.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-pet/src/pet.css",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts",
  "packages/plugin-web-tokens/src/apply.ts",
  "packages/plugin-web-tokens/src/i18n.ts",
  "packages/plugin-web-tokens/src/tokens.css",
  "packages/plugin-web-tokens/src/layout.css",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/web.ts",
];
const REQUIRED_FIXED_ONLY = [
  "packages/xai-web-settings-appearance/src/internal/appearanceController.tsx",
  "packages/xai-web-settings-appearance/src/internal/AppearanceActions.tsx",
  "packages/xai-web-settings-appearance/src/internal/AppearanceStatus.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearanceRecoveryCopy.ts",
];
const REQUIRED_BEFORE_ONLY = ["packages/plugin-web-settings-shell/src/SettingsFooter.tsx"];
const VARIANTS = { fixed: { revision: resolved, stage: "fixed" }, before: { revision: BEFORE_REVISION, stage: "before" } };
const VARIANTS_BY_MODE = { visual: ["fixed", "before"], keyboard: ["fixed", "before"] };

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-appearance-visual-keyboard-")));
const profile = join(directory, "profile");
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
async function buildVariant(name) {
  const variant = VARIANTS[name];
  const archive = extractArchive(variant.revision);
  const { snapshot, aliases } = archive;
  const forbiddenRoots = [...new Set([dependencyRoot, root].map((base) => realpathSync(base)))].flatMap((base) => ["packages", "apps", "docs"].map((tree) => join(base, tree) + sep));
  const guardViolations = [];
  const pinnedRepo = [];
  const archiveModules = new Set();
  const archiveRoot = snapshot + sep;
  const plugin = { name: "appearance-visual-keyboard-archive-pin-guard", setup(buildApi) {
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
    stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: FROZEN.fixture.file },
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
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== FROZEN.fixture.file && !input.startsWith("<define:"));
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const required = [...REQUIRED_COMMON, ...(variant.stage === "fixed" ? REQUIRED_FIXED_ONLY : REQUIRED_BEFORE_ONLY)];
  const missingRequired = required.filter((file) => !inputs.includes(file) || (!archiveModules.has(file) && !file.endsWith(".css")));
  const requiredHashes = Object.fromEntries(required.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const protectedDrift = variant.stage === "fixed" ? required.filter((file) => !EXPECTED_FIXED_DELTA.includes(file)).filter((file) => sha256(execFileSync("git", ["show", `${BEFORE_REVISION}:${file}`], { cwd: root, maxBuffer: 50 * 1024 * 1024 })) !== requiredHashes[file]) : [];
  const provenance = {
    variant: name, revision: variant.revision, stage: variant.stage,
    bundleSha256: sha256(js), bundleCssSha256: sha256(css), bundleModuleComments: moduleIndex.length,
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
    requiredModules: { count: required.length, missing: missingRequired, sha256: requiredHashes, protectedModulesDriftedFromBefore: protectedDrift },
  };
  record("bundle-provenance", provenance);
  pre(`baseline:${name}:guard-no-module-from-a-checkout`, guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre(`baseline:${name}:every-required-module-bundled-from-archive`, missingRequired.length === 0, { missingRequired });
  pre(`baseline:${name}:bundled-protected-modules-byte-identical-to-5cd63ff`, protectedDrift.length === 0, { protectedDrift });
  bundles[name] = { js, css, moduleIndex, provenance };
  return bundles[name];
}

// ---------------------------------------------------------------------------------------------------
// Browser over the DevTools PIPE transport, flattened target sessions
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
    "--remote-debugging-pipe", `--user-data-dir=${profile}`, "--window-size=1440,900", "about:blank",
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
async function attachPage(targetId, label) {
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  const page = { label, targetId, sessionId, presses: [], navigating: false, crashed: null, onPaused: null };
  page.cdp = (method, params = {}) => browser.send(method, params, sessionId);
  browser.pages.set(sessionId, page);
  await page.cdp("Inspector.enable");
  await page.cdp("Runtime.enable");
  await page.cdp("Page.enable");
  await page.cdp("DOM.enable");
  await page.cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
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
const EVALUATE_TIMEOUT_MS = 30000;
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
  ShiftTab: { key: "Tab", code: "Tab", vk: 9, modifiers: 8 },
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
  // Runner-initiated navigation window: only the latest navigation's timer may close it (no stale reset).
  const token = (page.navigationToken = (page.navigationToken ?? 0) + 1);
  page.navigating = true;
  try {
    await page.cdp("Page.navigate", { url });
  } finally {
    setTimeout(() => { if (page.navigationToken === token) page.navigating = false; }, 4000);
  }
}

// ---------------------------------------------------------------------------------------------------
// Surface constants (contract §2, §5 normative wording, §9)
// ---------------------------------------------------------------------------------------------------
const OWNER = "appearance-native-A";
const MARKER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:committed-generation`;
const MARKER = JSON.stringify({ generation: "g1", migrationId: "appearance-native", previous: null });
const FIELDS = ["lang", "theme", "density", "accentHue", "bgTone", "railPos", "fontScale"];
const KEY = { lang: "xai_pref_lang", theme: "xai_pref_theme", density: "xai_pref_density", fontScale: "xai_pref_font_scale", accentHue: "xai_accent_hue", railPos: "xai_rail_pos", bgTone: "xai_bg_tone" };
const SEVEN = FIELDS.map((field) => KEY[field]);
const isSeven = (key) => SEVEN.includes(key);
const LOCK_OF = (field) => `xai:pref:v1:${encodeURIComponent(KEY[field])}`;
const ENC = { lang: (value) => JSON.stringify(value), theme: (value) => JSON.stringify(value), density: (value) => JSON.stringify(value), fontScale: (value) => JSON.stringify(value), accentHue: (value) => String(value), railPos: (value) => String(value), bgTone: (value) => String(value) };
const TONES = ["default", "cream", "mist", "lavender", "peach", "graphite"];
const OPPOSITE = { en: "zh", zh: "en" };
/** Stored values that differ from every default; the drafts below choose the defaults, so the drafted UI looks like the default UI. */
const NONDEFAULT = { theme: "dark", density: "compact", fontScale: 1.05, accentHue: 230, railPos: "right", bgTone: "mist" };
const COPY = {
  en: {
    label: { lang: "Language", theme: "Theme", density: "Density", accentHue: "Accent color", bgTone: "Background palette", railPos: "Sidebar position", fontScale: "Font scale" },
    saving: (label) => `${label} is saving.`, resetting: (label) => `${label} is being reset to its default.`,
    "not-saved": (label) => `${label} was not saved.`, "not-reset": (label) => `${label} was not reset to its default.`,
    unavailable: (label) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
    retryName: (label) => `Retry ${label}`, discardName: (label) => `Discard ${label}`, reloadName: (label) => `Reload ${label}`,
    reset: "Reset to defaults", exportDraft: "Export Appearance draft", discardAll: "Discard all changes", retryAll: "Retry all",
    saved: "Appearance settings saved.", restored: "Defaults restored.", exportFailed: "Export failed. Please retry.", retrying: "Retrying unsaved appearance changes…",
    count: (n) => (n === 1 ? "1 appearance change is not saved." : `${n} appearance changes are not saved.`),
    confirmReset: "Reset theme, density, font scale, accent color, background palette and sidebar position to their defaults? Language is kept.",
    statusName: "Appearance changes not saved. Review them in Settings.", statusText: "Not saved",
    title: "Appearance", saveOld: "Save & apply",
  },
  zh: {
    label: { lang: "语言", theme: "主题", density: "密度", accentHue: "主题色", bgTone: "背景调子", railPos: "侧栏位置", fontScale: "字体大小" },
    saving: (label) => `${label}正在保存。`, resetting: (label) => `${label}正在恢复默认。`,
    "not-saved": (label) => `${label}未保存。`, "not-reset": (label) => `${label}未恢复默认。`,
    unavailable: (label) => `已保存的${label}不可用。请重新读取；这不是新的未保存更改。`,
    retryName: (label) => `重试 ${label}`, discardName: (label) => `放弃 ${label}`, reloadName: (label) => `重新读取 ${label}`,
    reset: "恢复默认", exportDraft: "导出外观草稿", discardAll: "放弃全部更改", retryAll: "全部重试",
    saved: "外观设置已保存。", restored: "已恢复默认设置。", exportFailed: "导出失败，请重试。", retrying: "正在重试未保存的外观更改…",
    count: (n) => `${n} 项外观更改未保存。`,
    confirmReset: "将主题、密度、字体大小、主题色、背景调子和侧栏位置恢复为默认值？语言保持不变。",
    statusName: "外观更改未保存，前往设置查看。", statusText: "未保存",
    title: "外观", saveOld: "保存生效",
  },
};
const T = COPY[LANG];
const SUCCESS_LINES = [COPY.en.saved, COPY.en.restored, COPY.zh.saved, COPY.zh.restored];
const FAILURE_LINES = [COPY.en.exportFailed, COPY.zh.exportFailed, COPY.en.retrying, COPY.zh.retrying];
const block = (field, state) => {
  const label = T.label[field];
  return { id: field, text: T[state](label), role: state === "saving" || state === "resetting" ? "status" : "alert", buttons: state === "unavailable" ? [T.reloadName(label)] : [T.retryName(label), T.discardName(label)] };
};
const blocks = (states) => FIELDS.filter((field) => states[field]).map((field) => block(field, states[field]));
const PANE = '.settings-detail[data-pane="appearance"] .appearance-pane';
const READY_APP = "(!!window.verify && !!window.__native && !!window.__visual && !!document.querySelector('.app header.topbar') && !document.querySelector('.account-data-gate') && verify.scope().kind === 'account')";
const READY_PANE = `(${READY_APP} && !!document.querySelector('${PANE} [data-testid="appearance-retry-all"]'))`;
const READY_PANE_BEFORE = `(${READY_APP} && !!document.querySelector('${PANE} [data-testid="settings-footer-save"]'))`;
const CRASHED = "(!!window.__native && !!__native.routeError())";
let labels = null;

// Pane control vocabulary (descriptors of ./native-visual-keyboard-probes.js), in DOM order.
const ROW_GROUPS = {
  lang: ["lang:en", "lang:zh"],
  theme: ["theme:light", "theme:dark", "theme:system"],
  density: ["density:comfortable", "density:compact"],
  accentHue: ["swatch:0", "swatch:1", "swatch:2", "swatch:3", "swatch:4", "swatch:5", "hue-slider"],
  bgTone: TONES.map((tone) => `tone:${tone}`),
  railPos: ["railpos:left", "railpos:right", "railpos:top", "railpos:bottom"],
  fontScale: ["font-slider"],
};
const ROW_CONTROLS = FIELDS.flatMap((field) => ROW_GROUPS[field]);
/** Expected pane controls: each field's row, then its recovery buttons, then the bottom action area. */
function paneList(states, { drafts }) {
  const out = [];
  for (const field of FIELDS) {
    out.push(...ROW_GROUPS[field]);
    if (states[field] === "unavailable") out.push(`reload:${field}`);
    else if (states[field]) out.push(`retry:${field}`, `discard:${field}`);
  }
  out.push("retry-all");
  if (drafts) out.push("export", "discard-all");
  out.push("reset");
  return out;
}
const BEFORE_PANE_LIST = [...ROW_CONTROLS, "footer:reset", "footer:save"];
const CALLER_TARGET = (desc) => /^(retry|discard|reload):/.test(desc) || ["retry-all", "export", "discard-all", "reset", "topbar:status"].includes(desc);
const WIDTHS = [375, 414, 768, 1024, 1440];
const HEIGHTS = { 375: 812, 414: 896, 760: 1024, 761: 1024, 767: 1024, 768: 1024, 1024: 768, 1025: 768, 1440: 900 };
const KEYBOARD_WIDTH = LANG === "zh" ? 375 : 1024;
/** Default-position DesktopPet box per width (contract §3 item 12): left edge innerWidth - 108; size 56 (<=760), 72 (761-1024), 84 (>1024). */
const petSizeAt = (width) => (width <= 760 ? 56 : width <= 1024 ? 72 : 84);

const rawOf = (stored) => Object.fromEntries(FIELDS.map((field) => [KEY[field], stored[field] === undefined ? null : ENC[field](stored[field])]));
const seedsOf = (stored, extra = {}) => ({ [MARKER_KEY]: MARKER, ...Object.fromEntries(FIELDS.filter((field) => stored[field] !== undefined).map((field) => [KEY[field], ENC[field](stored[field])])), ...extra });
const mutations = (list) => list.filter((entry) => entry.op === "set" || entry.op === "remove" || entry.op === "clear");
const sevenMutations = (list) => mutations(list).filter((entry) => isSeven(entry.key));
const opsOn = (list, op, key) => list.filter((entry) => entry.op === op && entry.key === key);
const brief = (list) => list.slice(0, 30).map((entry) => `${entry.seq}:${entry.op}:${entry.key}${entry.value !== undefined ? `=${entry.value}` : ""}:${entry.outcome}`);
const appLocks = (list) => list.filter((entry) => entry.by === "app").map((entry) => entry.name);
const counters = (snapshot) => ({ push: snapshot.history.filter((entry) => entry.method === "pushState").length, replace: snapshot.history.filter((entry) => entry.method === "replaceState").length, popstate: snapshot.pops.length, commits: snapshot.commits.length });

async function bytesOf(keys = SEVEN, page = main) { return evaluate(`__native.native.bytes(${JSON.stringify(keys)})`, page); }
const mark = (page = main) => evaluate("__native.mark()", page);
/** One consistent read of the surfaces and of the instrument windows since `since`. */
async function snap(since, page = main) {
  return evaluate(`(() => {
    const w = __native.window(${since});
    const r = window.verify ? verify.window(${since}) : { commits: [] };
    return {
      pane: __native.pane(), topbar: __native.topbar(), html: __native.html(), uiLang: __native.uiLang(), routeError: __native.routeError(),
      physical: __native.native.bytes(${JSON.stringify(SEVEN)}), location: window.verify ? verify.location() : null, focus: __native.focus(), visualFocus: __visual.focusInfo(),
      attempts: w.attempts, locks: w.locks, events: w.events, confirm: w.confirm, history: w.history, pops: w.pops, consoleErrors: w.consoleErrors, errorUi: w.errorUi, unload: w.unload,
      commits: r.commits, navigateCalls: r.navigateCalls || [],
    };
  })()`, page);
}

// ---------------------------------------------------------------------------------------------------
// Trusted input helpers (no nativeVirtualKeyCode; every press is audited per document)
// ---------------------------------------------------------------------------------------------------
async function trustedClick(selector, label, page = main) {
  const measure = `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { found: false };
    element.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { found: true, x, y, width: rect.width, height: rect.height, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + (typeof hit.className === "string" ? hit.className : "") : null };
  })()`;
  let point = await evaluate(measure, page);
  pre(`input:control-present:${label}`, point.found, { selector });
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
  return { x: round(point.x), y: round(point.y), width: point.width, height: point.height };
}
/** Clicks the element named by a probe descriptor (exactly one element must carry it). */
async function clickDesc(desc, label = desc, page = main) {
  const tagged = await evaluate(`__visual.tag(${JSON.stringify(desc)})`, page);
  pre(`input:exactly-one-control:${label}`, tagged === "tagged", { desc, tagged });
  const point = await trustedClick('[data-visual-target="1"]', label, page);
  await evaluate("__visual.untag()", page).catch(() => {});
  return point;
}
/** Clicks a non-focusable anchor (sets the sequential focus navigation starting point there). */
async function clickAnchor(selector, label, page = main) {
  const point = await trustedClick(selector, label, page);
  const focus = await evaluate("__visual.focusInfo()", page);
  pre(`${label}:anchor-is-not-focusable`, focus.isBody || !focus.inPane || focus.desc.startsWith("pane-other"), { focus });
  return point;
}
async function press(name, page = main) {
  const def = KEYDEFS[name];
  page.presses.push(name);
  const modifiers = def.modifiers ?? 0;
  await input("Input.dispatchKeyEvent", { type: def.text ? "keyDown" : "rawKeyDown", key: def.key, code: def.code, windowsVirtualKeyCode: def.vk, modifiers, ...(def.text ? { text: def.text, unmodifiedText: def.text } : {}) }, page);
  await input("Input.dispatchKeyEvent", { type: "keyUp", key: def.key, code: def.code, windowsVirtualKeyCode: def.vk, modifiers }, page);
  await delay(60);
}
async function parkMouse(page = main) {
  await input("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 }, page);
  await delay(40);
}
const fontRowLabel = `${PANE} .setting-row:has([data-appearance-control="fontScale"]) .sr-label`;
async function focusSlider(field, label, page = main) {
  if (field === "fontScale") await clickAnchor(fontRowLabel, `${label}:focus-start`, page);
  else await clickAnchor(`${PANE} [data-appearance-control="accentHue"] .accent-hue-preview`, `${label}:focus-start`, page);
  await press("Tab", page);
  const focus = await evaluate("__visual.focusInfo()", page);
  pre(`${label}:slider-focused-by-trusted-tab`, focus.desc === (field === "fontScale" ? "font-slider" : "hue-slider"), { focus });
}
/** Trusted Tab presses (after an optional anchor click) until the descriptor has focus. */
async function tabUntil(desc, label, { anchor = `${PANE} .pane-title`, max = 70, page = main } = {}) {
  if (anchor) await clickAnchor(anchor, `${label}:tab-anchor`, page);
  const path = [];
  for (let index = 0; index < max; index += 1) {
    await press("Tab", page);
    const now = await evaluate("__visual.activeDesc()", page);
    path.push(now);
    if (now === desc) {
      pre(`${label}:reached-${desc}-by-trusted-tab`, true, { presses: path.length, path: path.slice(-6) });
      return path;
    }
  }
  pre(`${label}:reached-${desc}-by-trusted-tab`, false, { path });
  return path;
}
async function openTopbar(label, page = main) {
  if (!(await evaluate("__native.topbar().open", page))) await trustedClick(".topbar .topbar-pref-trigger", `${label}:topbar-trigger`, page);
  pre(`${label}:topbar-popover-open`, await waitUntil("__native.topbar().open", 3000, page));
}
async function closeTopbar(label, page = main) {
  if (await evaluate("__native.topbar().open", page)) await press("Escape", page);
  pre(`${label}:topbar-popover-closed`, await waitUntil("!__native.topbar().open", 3000, page));
}
const TOPBAR_LANG = { en: "English", zh: "中文" };
async function chooseTopbar(field, value, label, page = main) {
  await openTopbar(label, page);
  const uiLang = await evaluate("__native.uiLang()", page);
  const section = labels[uiLang][field === "lang" ? "language" : field];
  const name = field === "lang" ? TOPBAR_LANG[value] : labels[uiLang][value];
  const tagged = await evaluate(`(() => {
    document.querySelectorAll("[data-visual-target]").forEach((element) => element.removeAttribute("data-visual-target"));
    const matches = [...document.querySelectorAll('.topbar #topbar-pref-panel section')].filter((s) => s.getAttribute("aria-label") === ${JSON.stringify(section)}).flatMap((s) => [...s.querySelectorAll('[role="menuitemradio"]')]).filter((o) => o.getAttribute("aria-label") === ${JSON.stringify(name)});
    if (matches.length === 1) matches[0].setAttribute("data-visual-target", "1");
    return matches.length;
  })()`, page);
  pre(`input:exactly-one-control:${label}:topbar:${section}:${name}`, tagged === 1, { tagged });
  await trustedClick('[data-visual-target="1"]', `${label}:topbar:${section}:${name}`, page);
  await evaluate("__visual.untag()", page).catch(() => {});
}
const blockIs = (field, state) => `(() => { const pane = __native.pane(); const item = pane && pane.recovery.find((entry) => entry.id === ${JSON.stringify(field)}); return !!item && item.text === ${JSON.stringify(block(field, state).text)}; })()`;
const recoveryIs = (expected) => `JSON.stringify(__native.pane()?.recovery) === ${JSON.stringify(JSON.stringify(expected))}`;
const statusLineIs = (text) => `__native.pane()?.statusLine.text === ${JSON.stringify(text)}`;
const topbarStatusIs = (present) => `${present ? "!!" : "!"}document.querySelector('[data-testid="appearance-status"]')`;
/** A failed pane edit (write denied for the key(s)); returns once the field(s) show "was not saved.". */
async function failPane(desc, fields, label, page = main) {
  await evaluate(`__native.denySet(${JSON.stringify(fields.map((field) => KEY[field]))})`, page);
  await clickDesc(desc, label, page);
  const ok = await waitUntil(fields.map((field) => blockIs(field, "not-saved")).join(" && "), 6000, page);
  pre(`${label}:edit-settled-as-a-failed-draft`, ok, { pane: await evaluate("__native.pane()", page) });
}
async function failTopbar(field, value, label, page = main) {
  await evaluate(`__native.denySet(${JSON.stringify(KEY[field])})`, page);
  const since = await mark(page);
  await chooseTopbar(field, value, label, page);
  const fired = await waitUntil(`__native.window(${since}).attempts.some((entry) => entry.key === ${JSON.stringify(KEY[field])} && entry.op === "set" && entry.outcome === "denied")`, 6000, page);
  await closeTopbar(label, page);
  await parkMouse(page);
  const shown = await waitUntil(topbarStatusIs(true), 4000, page);
  pre(`${label}:topbar-write-fault-armed-and-observed`, fired && shown);
}
async function clickReset(id, accept, page = main) {
  const before = dialogs.length;
  dialogPlan.push({ accept, purpose: `${id}: ${accept ? "accept" : "decline"} Reset to defaults` });
  await clickDesc("reset", `${id}:reset`, page);
  const opened = await waitFor(() => dialogs.length > before, 6000);
  pre(`${id}:reset-confirmation-asked-with-normative-text`, opened && dialogs.length === before + 1 && dialogs.at(-1).type === "confirm" && dialogs.at(-1).message === T.confirmReset && dialogs.at(-1).accepted === accept, { dialogs: dialogs.slice(before) });
}

// ---------------------------------------------------------------------------------------------------
// Documents: seed page, viewport, App mounts, pet toggle, screenshots
// ---------------------------------------------------------------------------------------------------
let selfTested = false;
async function seed(entries, label, page = main) {
  await endDocument(page, "before-seed");
  page.variant = "seed";
  await navigatePage(page, `${origin}/seed`);
  pre(`${label}:seed-page-loaded-with-prelude-and-probes-only`, await waitUntil("document.readyState === 'complete' && location.pathname === '/seed' && !!window.__native && !!window.__visual && !window.verify", 10000, page));
  if (!selfTested && page === main) {
    const result = await evaluate("__native.selfTest()", page);
    record("instrument-selftest", { page: "/seed (prelude and probes only, no product code)", result });
    pre("instruments:frozen-prelude-self-test",
      result.setDeniedThrew && result.setDeniedNeverStored && result.setDelegated && result.readbackAfterSetDenied && result.readbackOneShot && result.getDenied
      && result.removeDeniedThrew && result.removeDeniedKeptBytes && result.removeDelegated && Object.values(result.totalDenial).every(Boolean) && result.noNestedStorageCalls
      && isDeepStrictEqual(result.dispatchCounted, ["storage:xai_native_host_selftest:true:true", "bus:web:settings:preference-changed"])
      && isDeepStrictEqual(result.deliveredCounted, ["xai_native_host_selftest:false"])
      && result.nonLocalFetchRefusedAndLogged && result.lockHeldAndPending && result.middleHeldAfterFirst && result.fifoOrder === "app1,app2" && isDeepStrictEqual(result.lockAttribution, ["fixture", "app", "fixture", "app"])
      && isDeepStrictEqual(result.historyTraced, ["pushState:selftest-push", "replaceState:selftest-replace"]) && result.popTraced === 1 && result.unloadTracked
      && result.urlTraced && result.confirmWrapped && result.consoleErrorTraced && result.errorUiTraced && result.domGateAddedAndRemoved && result.framesSampled > 0 && result.inputTraced && result.oldUiClean, { result });
    for (let index = runtimeErrors.length - 1; index >= 0; index -= 1) if (runtimeErrors[index].text.includes("native host prelude self-test error trace")) runtimeErrors.splice(index, 1);
    const colour = await evaluate("__visual.colourSelfTest()", page);
    record("colour-converter-selftest", colour);
    pre("instruments:colour-converter-own-math-equals-browser-canvas-and-known-values", colour.allAgree && colour.whiteOnBlack === 21, colour);
    selfTested = true;
  }
  const stored = await evaluate(`(() => { __native.native.clear(); const seeds = ${JSON.stringify(entries)}; for (const [key, value] of Object.entries(seeds)) __native.native.set(key, value); return __native.native.snapshot(); })()`, page);
  pre(`${label}:seeded-exact-bytes`, isDeepStrictEqual(stored, entries), { stored });
}
let currentWidth = 1440;
async function setViewport(width, height = HEIGHTS[width], page = main) {
  await page.cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 414 });
  currentWidth = width;
  await delay(250);
  const viewport = await evaluate("({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio, settled: window.__visual ? null : 'no-probes' })", page);
  if (await evaluate("!!window.__visual", page)) viewport.settled = await evaluate("__visual.settle()", page);
  pre(`viewport:${width}x${height}`, viewport.width === width && viewport.height === height && viewport.dpr === 1, { viewport });
  return viewport;
}
async function mountApp(label, { path = "/app/settings/appearance", variant = "fixed", width = currentWidth, page = main } = {}) {
  currentVariant = variant;
  const errorsBefore = runtimeErrors.length;
  await endDocument(page, "before-mount");
  page.variant = variant;
  await page.cdp("Emulation.setDeviceMetricsOverride", { width, height: HEIGHTS[width], deviceScaleFactor: 1, mobile: width <= 414 });
  currentWidth = width;
  await navigatePage(page, `${origin}${path}`);
  const ready = path.includes("/settings/appearance") ? (VARIANTS[variant].stage === "fixed" ? READY_PANE : READY_PANE_BEFORE) : READY_APP;
  const settled = await waitUntil(`${ready} || ${CRASHED}`, 20000, page);
  await delay(600);
  const state = await evaluate(`({ ready: ${ready}, crashed: ${CRASHED}, verifyPresent: !!window.verify, variant: window.verify ? verify.variant : null, path: location.pathname, viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio } })`, page);
  pre(`${label}:document-loaded-and-bundle-evaluated`, settled && state.verifyPresent && state.variant === variant, { state, variant });
  pre(`${label}:production-app-mounted`, state.ready && !state.crashed, { state });
  pre(`${label}:viewport-${width}x${HEIGHTS[width]}`, state.viewport.width === width && state.viewport.height === HEIGHTS[width] && state.viewport.dpr === 1, { viewport: state.viewport });
  const exceptions = runtimeErrors.slice(errorsBefore).filter((entry) => entry.kind === "exception" || entry.kind.startsWith("console."));
  pre(`${label}:no-runtime-error-at-mount`, exceptions.length === 0, { exceptions: exceptions.slice(0, 3) });
  const facts = await evaluate(`({ composition: verify.composition, variant: verify.variant, scope: verify.scope(), auth: verify.authCalls(), markerKey: verify.markerKey, rail: verify.rail(), pet: !!document.querySelector('.pet-wrap'), topbar: !!document.querySelector('header.topbar'), lockNames: verify.lockNames(), physicalKeys: verify.physicalKeys(), network: __native.network.filter((entry) => !entry.local).length, uiLang: __native.uiLang() })`, page);
  pre(`${label}:auth-session-context-served-by-real-provider`, facts.composition === "production-app" && facts.auth.getSession >= 1 && facts.markerKey === MARKER_KEY, { auth: facts.auth });
  pre(`${label}:account-data-gate-activated-account`, facts.scope.kind === "account" && facts.scope.accountId === OWNER && facts.scope.generation === "g1", { scope: facts.scope });
  pre(`${label}:production-surfaces-present`, facts.rail.length > 0 && facts.topbar && facts.pet, { rail: facts.rail.length, pet: facts.pet });
  pre(`${label}:real-lock-names-and-unscoped-device-keys`, FIELDS.every((field) => facts.lockNames[KEY[field]] === LOCK_OF(field) && facts.physicalKeys[KEY[field]] === KEY[field]), { lockNames: facts.lockNames });
  pre(`${label}:no-non-local-network-attempt`, facts.network === 0);
  if (!labels) labels = await evaluate("verify.labels", page);
  await evaluate("__visual.settle()", page);
  return facts;
}
/** The DesktopPet's own rail toggle, by a trusted hit-tested click (shown at 1440 px in every state). */
async function petOff(label, width = currentWidth) {
  const name = labels[(await evaluate("__native.uiLang()")) ?? LANG].pet;
  const visible = await evaluate(`(() => { const b = [...document.querySelectorAll('.app-rail .rail-bottom .rail-btn')].find((x) => x.getAttribute('aria-label') === ${JSON.stringify(name)}); return !!b && b.getClientRects().length > 0 && getComputedStyle(b).visibility !== 'hidden'; })()`);
  if (!visible) await setViewport(1440);
  const point = await clickDesc(`rail:${name}`, `${label}:pet-toggle`);
  pre(`${label}:pet-turned-off-by-the-rail-toggle`, await waitUntil("!document.querySelector('.pet-wrap')", 4000), { point, switchedTo1440: !visible });
  if (!visible) await setViewport(width);
  await parkMouse();
  await evaluate("__visual.settle()");
  return { switchedTo1440: !visible, point };
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
async function captureViewport(name, details = {}) {
  await parkMouse();
  await delay(150);
  const shot = await main.cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  return saveShot(name, shot.data, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: null, ...details });
}
async function captureClip(name, clip, details = {}) {
  await parkMouse();
  await delay(150);
  // Batch 48 fix: `clip` is viewport-relative (getBoundingClientRect), but CDP clips are in page (document) coordinates,
  // so the visual viewport's page offset is added (a no-op while the window is not scrolled; self-tested in E15 runs).
  const offset = await pageOffset();
  const shot = await main.cdp("Page.captureScreenshot", { format: "png", clip: { ...clip, x: clip.x + offset.x, y: clip.y + offset.y, scale: 1 }, captureBeyondViewport: false });
  return saveShot(name, shot.data, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip, pageOffset: offset, ...details });
}
/** Batch 48: the visual viewport's offset in the page (CDP screenshot clips are page coordinates). */
async function pageOffset(page = main) {
  return evaluate("({ x: visualViewport.pageLeft, y: visualViewport.pageTop, scrollX, scrollY, scale: visualViewport.scale })", page);
}
/** Full-pane capture (Features v2 pattern): pin the scroller's gutter, grow the height until nothing overflows vertically,
 *  require the pane layout to equal the realistic layout exactly, clip to the .settings-detail band, then restore. */
async function captureTall(name, width, details = {}) {
  await parkMouse();
  const realistic = await evaluate("__visual.captureGeometry()");
  const gutter = await evaluate("__visual.pinScrollbarGutter()");
  let height = HEIGHTS[width];
  let loops = 0;
  for (; loops < 8; loops += 1) {
    const extra = await evaluate("__visual.verticalOverflow()");
    if (extra <= 0) break;
    height = Math.min(8000, height + extra);
    await main.cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 414 });
    await delay(200);
    await evaluate("__visual.settle()");
  }
  const captured = await evaluate("__visual.captureGeometry()");
  pre(`capture:${name}:full-pane-capture-layout-equals-realistic-viewport`, isDeepStrictEqual(captured, realistic), { gutter, realistic: realistic?.parts?.length, diff: (captured?.parts ?? []).filter((part, index) => !isDeepStrictEqual(part, realistic.parts[index])).slice(0, 6) });
  const lay = await evaluate("__visual.layout()");
  const top = Math.max(0, Math.floor(lay.detail.rect.top) - 8);
  const bottom = Math.min(height, Math.ceil(lay.detail.rect.bottom) + 8);
  const clip = { x: 0, y: top, width, height: bottom - top, scale: 1 };
  await delay(120);
  const shot = await main.cdp("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: false });
  const remainingOverflow = await evaluate("__visual.verticalOverflow()");
  pre(`capture:${name}:gutter-unpinned`, await evaluate("__visual.unpinScrollbarGutter()"));
  await setViewport(width);
  pre(`capture:${name}:realistic-layout-restored`, isDeepStrictEqual(await evaluate("__visual.captureGeometry()"), realistic));
  return saveShot(name, shot.data, { width, viewportHeight: height, realisticHeight: HEIGHTS[width], loops, clip, remainingOverflow, gutter, layoutEqualsRealisticViewport: true, comparedParts: realistic.parts.length, ...details });
}
/** The computed accessible name/description of one element (CDP Accessibility domain). */
async function axOf(selector, page = main) {
  const { root: documentNode } = await page.cdp("DOM.getDocument", { depth: 0 });
  const { nodeId } = await page.cdp("DOM.querySelector", { nodeId: documentNode.nodeId, selector });
  if (!nodeId) return null;
  const { nodes } = await page.cdp("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
  const node = nodes[0];
  return { role: node?.role?.value ?? null, name: node?.name?.value ?? null, description: node?.description?.value ?? null, ignored: node?.ignored ?? null,
    properties: Object.fromEntries((node?.properties ?? []).map((entry) => [entry.name, entry.value?.value ?? null])) };
}

// ---------------------------------------------------------------------------------------------------
// Static selector audit (5cd63ff..fixed): additive, scoped, the disabled Retry all rule set
// ---------------------------------------------------------------------------------------------------
/** A small CSS rule parser: selectors with their at-rule context and declarations (comments stripped). */
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
const SCOPES = [/^\.appearance-pane(?![\w-])/, /^\.appearance-recovery-[\w-]+/, /^\.appearance-status[\w-]*(?![\w-])/];
function cssAudit() {
  const id = "css";
  const changedCss = git(["diff", "--name-only", BEFORE_REVISION, resolved, "--", "*.css"]).trim().split("\n").filter(Boolean);
  const protectedCss = git(["diff", "--name-only", BEFORE_REVISION, resolved, "--", "packages/plugin-web-tokens", "packages/plugin-web-settings-shell", "apps/web/src/styles"]).trim().split("\n").filter(Boolean);
  const before = git(["show", `${BEFORE_REVISION}:${APPEARANCE_CSS}`]);
  const fixed = git(["show", `${resolved}:${APPEARANCE_CSS}`]);
  const added = fixed.slice(before.length);
  const parsed = cssRules(added);
  const selectors = parsed.rules.flatMap((rule) => rule.selectors.map((selector) => ({ selector, within: rule.within, declarations: rule.declarations })));
  const unscoped = selectors.filter((entry) => !SCOPES.some((scope) => scope.test(entry.selector)));
  const disabledRules = parsed.rules.filter((rule) => rule.selectors.some((selector) => selector.includes("aria-disabled")));
  const disabledRule = disabledRules[0] ?? null;
  const ALLOWED_PROPERTIES = ["color", "background-color", "border-color", "opacity", "cursor"];
  const tokenUse = (value) => [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((match) => match[1]);
  const disabledTokens = disabledRule ? disabledRule.declarations.flatMap((entry) => tokenUse(entry.value)) : [];
  const auditRecord = {
    changedCss, protectedCssChanged: protectedCss, beforeSha256: sha256(before), fixedSha256: sha256(fixed),
    beforeBytes: Buffer.byteLength(before), fixedBytes: Buffer.byteLength(fixed), addedBytes: Buffer.byteLength(added), addedLines: added.split("\n").length - 1,
    balanced: parsed.balanced, atRules: parsed.atRules,
    selectors: selectors.map((entry) => ({ selector: entry.selector, within: entry.within, declarations: entry.declarations.map((declaration) => `${declaration.property}: ${declaration.value}`) })),
    disabledRule: disabledRule ? { selectors: disabledRule.selectors, within: disabledRule.within, declarations: disabledRule.declarations } : null,
    disabledTokens,
  };
  record("css-audit", auditRecord);
  checkDeferred(`${id}:only-the-appearance-stylesheet-changed`, isDeepStrictEqual(changedCss, [APPEARANCE_CSS]), { changedCss });
  checkDeferred(`${id}:tokens-settings-shell-and-global-styles-unchanged`, protectedCss.length === 0, { protectedCss });
  checkDeferred(`${id}:existing-rules-byte-unchanged-fixed-stylesheet-begins-with-the-5cd63ff-file`, fixed.startsWith(before) && added.length > 0, { beforeBytes: auditRecord.beforeBytes, fixedBytes: auditRecord.fixedBytes });
  checkDeferred(`${id}:added-rules-parse-balanced`, parsed.balanced && parsed.rules.length > 0, { rules: parsed.rules.length });
  checkDeferred(`${id}:every-added-selector-under-appearance-pane-recovery-or-status`, unscoped.length === 0, { unscoped: unscoped.map((entry) => entry.selector) });
  checkDeferred(`${id}:at-rules-are-media-only`, parsed.atRules.every((rule) => rule.startsWith("@media")), { atRules: parsed.atRules });
  checkDeferred(`${id}:the-375-containment-override-is-appearance-pane-scoped`, selectors.filter((entry) => entry.within.some((at) => at.includes("max-width: 640px"))).every((entry) => /^\.appearance-pane(?![\w-])/.test(entry.selector)),
    { mobileSelectors: selectors.filter((entry) => entry.within.length > 0).map((entry) => `${entry.within.join(" ")} ${entry.selector}`) });
  checkDeferred(`${id}:no-pane-footer-or-pane-save-class-added`, !/pane-footer|pane-save/.test(added), {});
  checkDeferred(`${id}:exactly-one-disabled-retry-all-rule-set-under-appearance-pane-keyed-on-aria-disabled-true`, disabledRules.length === 1 && disabledRule.selectors.length === 1
    && /^\.appearance-pane(?![\w-])/.test(disabledRule.selectors[0]) && disabledRule.selectors[0].includes('[aria-disabled="true"]') && disabledRule.selectors[0].includes(".appearance-retry-all") && disabledRule.within.length === 0, { disabledRules });
  checkDeferred(`${id}:disabled-rule-declares-only-colours-opacity-and-the-cursor`, Boolean(disabledRule) && disabledRule.declarations.every((entry) => ALLOWED_PROPERTIES.includes(entry.property)), { declarations: disabledRule?.declarations });
  checkDeferred(`${id}:disabled-rule-colours-from-neutral-text-bg-border-tokens-only`, Boolean(disabledRule) && disabledRule.declarations.filter((entry) => entry.property !== "cursor" && entry.property !== "opacity").every((entry) => /^var\(--(text|bg|border)-[\w-]+\)$/.test(entry.value))
    && disabledTokens.every((token) => /^--(text|bg|border)-/.test(token)), { disabledTokens });
  checkDeferred(`${id}:disabled-rule-no-accent-red-danger-token-and-no-pointer-events-none`, Boolean(disabledRule) && !disabledTokens.some((token) => /^--(accent|red|danger)/.test(token)) && !disabledRule.declarations.some((entry) => entry.property === "pointer-events"), { disabledTokens });
  const boxRule = parsed.rules.find((rule) => rule.selectors.includes(".appearance-pane .appearance-retry-all"));
  record("css-audit-retry-all-box-rule", { boxRule });
  return auditRecord;
}
/** esbuild prefixes every bundled stylesheet with a comment naming its source path; split the bundle CSS into those sections. */
function cssSections(css) {
  const marks = [...css.matchAll(/^\/\* (\S+\.css) \*\/$/gm)].map((match) => ({ path: match[1], index: match.index }));
  return marks.map((mark, index) => ({ path: mark.path, text: css.slice(mark.index, index + 1 < marks.length ? marks[index + 1].index : css.length) }));
}
const normaliseSelector = (selector) => selector.replace(/="([^"]*)"\]/g, "=$1]").replace(/\s+/g, " ").trim();
/**
 * Bundle-level audit. Every bundled stylesheet other than the Appearance one is byte-identical between 5cd63ff and the
 * fixed product; the Appearance section is the 5cd63ff section followed by exactly the scoped source additions. The
 * section ORDER is recorded: App.tsx now imports the Appearance package, so its stylesheet is emitted earlier in the
 * cascade. Rules of the stylesheets that moved after it are scanned for selectors that share an Appearance class (a
 * possible equal-specificity order conflict); the computed-style comparison of the clean pane (gated run) decides.
 */
function bundleCssAudit(sourceAudit) {
  const before = bundles.before?.css;
  const fixed = bundles.fixed?.css;
  if (!before || !fixed) return null;
  const beforeSections = cssSections(before);
  const fixedSections = cssSections(fixed);
  const beforeOrder = beforeSections.map((section) => section.path);
  const fixedOrder = fixedSections.map((section) => section.path);
  const beforeMap = new Map(beforeSections.map((section) => [section.path, section.text]));
  const fixedMap = new Map(fixedSections.map((section) => [section.path, section.text]));
  const otherChanged = fixedOrder.filter((path) => path !== APPEARANCE_CSS && beforeMap.get(path) !== fixedMap.get(path));
  const beforeAppearance = beforeMap.get(APPEARANCE_CSS) ?? "";
  const fixedAppearance = fixedMap.get(APPEARANCE_CSS) ?? "";
  const prefixKept = fixedAppearance.startsWith(beforeAppearance.trimEnd());
  const addition = fixedAppearance.slice(beforeAppearance.trimEnd().length);
  const additionRules = cssRules(addition);
  const additionSelectors = additionRules.rules.flatMap((rule) => rule.selectors.map(normaliseSelector));
  const sourceSelectors = sourceAudit ? sourceAudit.selectors.map((entry) => normaliseSelector(entry.selector)) : [];
  const beforeIndex = beforeOrder.indexOf(APPEARANCE_CSS);
  const fixedIndex = fixedOrder.indexOf(APPEARANCE_CSS);
  const movedAfter = beforeOrder.slice(0, beforeIndex).filter((path) => fixedOrder.indexOf(path) > fixedIndex);
  const movedBefore = beforeOrder.slice(beforeIndex + 1).filter((path) => fixedOrder.indexOf(path) < fixedIndex);
  const appearanceClasses = new Set([...(beforeAppearance.match(/\.[a-zA-Z][\w-]*/g) ?? [])].filter((name) => ![".active", ".short", ".css"].includes(name)));
  const sharedRules = movedAfter.flatMap((path) => cssRules(beforeMap.get(path) ?? "").rules.flatMap((rule) => rule.selectors.filter((selector) => (selector.match(/\.[a-zA-Z][\w-]*/g) ?? []).some((name) => appearanceClasses.has(name))).map((selector) => ({ path, selector, within: rule.within }))));
  const result = {
    sections: { before: beforeOrder.length, fixed: fixedOrder.length }, sameSet: isDeepStrictEqual([...beforeOrder].sort(), [...fixedOrder].sort()), otherSectionsChanged: otherChanged,
    appearance: { beforeIndex, fixedIndex, beforeBytes: beforeAppearance.length, fixedBytes: fixedAppearance.length, prefixKept, additionRules: additionRules.rules.length, additionSelectors, equalToSourceAddition: isDeepStrictEqual(additionSelectors, sourceSelectors) },
    order: { before: beforeOrder, fixed: fixedOrder, movedFromBeforeToAfterAppearance: movedAfter, movedFromAfterToBeforeAppearance: movedBefore },
    orderConflictScan: { appearanceClasses: [...appearanceClasses].sort(), rulesInMovedStylesheetsSharingAnAppearanceClass: sharedRules },
    beforeCssSha256: sha256(before), fixedCssSha256: sha256(fixed),
  };
  record("bundle-css-audit", result);
  checkDeferred("css:bundle-same-stylesheets-and-every-non-appearance-stylesheet-byte-identical-to-5cd63ff", result.sameSet && otherChanged.length === 0, { otherChanged, sameSet: result.sameSet });
  checkDeferred("css:bundled-appearance-stylesheet-is-the-5cd63ff-one-followed-by-exactly-the-scoped-source-additions", prefixKept && additionRules.balanced && result.appearance.equalToSourceAddition && additionSelectors.every((selector) => SCOPES.some((scope) => scope.test(selector))), result.appearance);
  if (movedAfter.length || movedBefore.length) observe("css:bundle-cascade-order-changed-appearance-stylesheet-emitted-earlier", { movedFromBeforeToAfterAppearance: movedAfter, movedFromAfterToBeforeAppearance: movedBefore, rulesInMovedStylesheetsSharingAnAppearanceClass: sharedRules });
  if (process.env.XAI_VK_DUMP_CSS && process.env.XAI_NATIVE_EVIDENCE_DIR) {
    writeFileSync(join(evidenceDir, `${prefix}-bundle-before.css`), before);
    writeFileSync(join(evidenceDir, `${prefix}-bundle-fixed.css`), fixed);
  }
  return result;
}
/**
 * Batch 50 addition (E14 selector audit, "including both focus rules"): the fixed stylesheet is the 24073b5 one followed
 * by the F-APP-1 increment (= the 5bbf473 file) and the F-APP-2 increment, each append-only and outside any at-rule; each
 * focus rule is pane-scoped and draws the global ring of tokens.css (`button:focus-visible`, ...): the same outline
 * shorthand; F-APP-1 at the global offset; F-APP-2 2 px further out, keeping the selection as a box-shadow ring in
 * var(--text-1); only outline and box-shadow properties (no layout property).
 */
const REV_24073B5 = "24073b522262d8b4bec0abfa29347db28adbdd9e";
const REV_5BBF473 = "5bbf473872073472188957f430057412e8798131";
function cssFocusRulesAudit() {
  const id = "css:focus-rules";
  const fixed = git(["show", `${resolved}:${APPEARANCE_CSS}`]);
  const at24073b5 = git(["show", `${REV_24073B5}:${APPEARANCE_CSS}`]);
  const at5bbf473 = git(["show", `${REV_5BBF473}:${APPEARANCE_CSS}`]);
  const fApp1Increment = at5bbf473.slice(at24073b5.length);
  const fApp2Increment = fixed.slice(at5bbf473.length);
  const parsed1 = cssRules(fApp1Increment);
  const parsed2 = cssRules(fApp2Increment);
  const tokensCss = git(["show", `${resolved}:packages/plugin-web-tokens/src/tokens.css`]);
  const globalRule = cssRules(tokensCss).rules.find((rule) => rule.selectors.includes("button:focus-visible")) ?? null;
  const decl = (rule, property) => rule?.declarations.find((entry) => entry.property === property)?.value ?? null;
  const globalOutline = decl(globalRule, "outline");
  const describeRules = (parsed) => parsed.rules.map((rule) => ({ selectors: rule.selectors, within: rule.within, declarations: rule.declarations.map((entry) => `${entry.property}: ${entry.value}`) }));
  const auditRecord = {
    bytes: { "24073b5": Buffer.byteLength(at24073b5), "5bbf473": Buffer.byteLength(at5bbf473), fixed: Buffer.byteLength(fixed) },
    sha256: { "24073b5": sha256(at24073b5), "5bbf473": sha256(at5bbf473), fixed: sha256(fixed) },
    prefixChain: { "24073b5-prefix-of-5bbf473": at5bbf473.startsWith(at24073b5), "5bbf473-prefix-of-fixed": fixed.startsWith(at5bbf473) },
    fApp1: { addedBytes: Buffer.byteLength(fApp1Increment), addedLines: fApp1Increment.split("\n").length - 1, balanced: parsed1.balanced, atRules: parsed1.atRules, rules: describeRules(parsed1) },
    fApp2: { addedBytes: Buffer.byteLength(fApp2Increment), addedLines: fApp2Increment.split("\n").length - 1, balanced: parsed2.balanced, atRules: parsed2.atRules, rules: describeRules(parsed2) },
    globalRing: globalRule ? { selectors: globalRule.selectors, outline: globalOutline, outlineOffset: decl(globalRule, "outline-offset") } : null,
  };
  record("css-focus-rules-audit", auditRecord);
  checkDeferred(`${id}:fixed-stylesheet-is-24073b5-then-the-f-app-1-increment-then-the-f-app-2-increment-each-append-only`, auditRecord.prefixChain["24073b5-prefix-of-5bbf473"] && auditRecord.prefixChain["5bbf473-prefix-of-fixed"]
    && parsed1.balanced && parsed2.balanced && parsed1.rules.length === 1 && parsed2.rules.length === 1 && parsed1.atRules.length === 0 && parsed2.atRules.length === 0, { bytes: auditRecord.bytes, prefixChain: auditRecord.prefixChain });
  const r1 = parsed1.rules[0] ?? null;
  const r2 = parsed2.rules[0] ?? null;
  checkDeferred(`${id}:global-ring-found-in-tokens-css`, Boolean(globalRule) && /^2px solid /.test(globalOutline ?? "") && decl(globalRule, "outline-offset") === "2px", { globalRing: auditRecord.globalRing });
  checkDeferred(`${id}:f-app-1-rule-pane-scoped-outside-at-rules-the-global-ring-at-the-global-offset`, Boolean(r1) && isDeepStrictEqual(r1.selectors, ['.appearance-pane .slider-row input[type="range"]:focus-visible']) && r1.within.length === 0
    && decl(r1, "outline") === globalOutline && decl(r1, "outline-offset") === decl(globalRule, "outline-offset") && r1.declarations.length === 2, { rule: r1 });
  checkDeferred(`${id}:f-app-2-rule-pane-scoped-outside-at-rules-global-ring-colour-and-width-selection-kept-as-a-text-1-box-shadow-no-layout-property`, Boolean(r2) && isDeepStrictEqual(r2.selectors, [".appearance-pane .accent-sw.active:focus-visible"]) && r2.within.length === 0
    && decl(r2, "outline") === globalOutline && decl(r2, "box-shadow") === "0 0 0 2px var(--text-1)" && /^\d+px$/.test(decl(r2, "outline-offset") ?? "")
    && r2.declarations.every((entry) => ["outline", "outline-offset", "box-shadow"].includes(entry.property)), { rule: r2 });
  return auditRecord;
}

// ---------------------------------------------------------------------------------------------------
// Batch 48 addition: cascade-order audit (control plane F-APP-1 ruling, "对执行者其他问题的裁定" 1; batch 48
// "层叠顺序审计"). The fixed bundle emits the Appearance stylesheet BEFORE 18 stylesheets that followed it at 5cd63ff.
// In every visited state the live document is audited twice (measurement only; nothing persists):
//   (a) reorder equivalence: the computed style of every element (and its ::before/::after, and the range inputs'
//       thumb and track) under the fixed order is compared with the computed style under the 5cd63ff order, which is
//       re-created by adopting copies of the Appearance, cmdk and global stylesheets after the document's own sheets
//       (so, effectively, [..., the 18, Appearance, cmdk, global] as at 5cd63ff). Transitions and animations are frozen
//       by an adopted !important sheet during both measurements so a changed value would show at once. Positive
//       controls: a synthetic equal-specificity rule after the Appearance one is detected, and moving the real
//       layout.css after the Appearance stylesheet is detected;
//   (b) overlap scan: every rule of the 18 stylesheets, parsed by the browser itself (a constructed, never adopted
//       CSSStyleSheet), is matched against the live DOM (dynamic pseudo-classes stripped, pseudo-elements keyed); no
//       element or pseudo-element that an Appearance rule targets may also be targeted by such a rule declaring one of
//       the same longhands. A synthetic positive control must be detected.
// ---------------------------------------------------------------------------------------------------
/** Runs IN THE PAGE (serialised with Function.prototype.toString; never called in Node). */
function cascadePageAudit(input) {
  "use strict";
  const DYNAMIC = new Set(["hover", "active", "focus", "focus-visible", "focus-within", "target", "visited", "link"]);
  const LEGACY_PSEUDO_ELEMENTS = new Set(["before", "after", "first-line", "first-letter"]);
  const isIdentChar = (ch) => /[\w-]/.test(ch) || ch.charCodeAt(0) > 127;
  const skipString = (s, i) => { const quote = s[i]; let j = i + 1; while (j < s.length && s[j] !== quote) { if (s[j] === "\\") j += 1; j += 1; } return j + 1; };
  function skipGroup(s, i) {
    let depth = 0;
    for (let j = i; j < s.length; j += 1) {
      const ch = s[j];
      if (ch === "\\") { j += 1; continue; }
      if (ch === '"' || ch === "'") { j = skipString(s, j) - 1; continue; }
      if (ch === "(" || ch === "[") depth += 1;
      else if (ch === ")" || ch === "]") { depth -= 1; if (depth === 0) return j + 1; }
    }
    return s.length;
  }
  function splitTop(s) {
    const parts = [];
    let start = 0;
    for (let i = 0; i < s.length; i += 1) {
      const ch = s[i];
      if (ch === "\\") { i += 1; continue; }
      if (ch === "(" || ch === "[") { i = skipGroup(s, i) - 1; continue; }
      if (ch === '"' || ch === "'") { i = skipString(s, i) - 1; continue; }
      if (ch === ",") { parts.push(s.slice(start, i).trim()); start = i + 1; }
    }
    parts.push(s.slice(start).trim());
    return parts.filter(Boolean);
  }
  function readIdent(s, i) {
    let j = i;
    while (j < s.length && (isIdentChar(s[j]) || s[j] === "\\")) j += s[j] === "\\" ? 2 : 1;
    return s.slice(i, j);
  }
  /** Removes top-level dynamic pseudo-classes (could match in some interaction state) and keys the pseudo-element. */
  function strip(complex) {
    let base = "";
    let pseudo = "";
    for (let i = 0; i < complex.length;) {
      const ch = complex[i];
      if (ch === "\\") { base += complex.slice(i, i + 2); i += 2; continue; }
      if (ch === "(" || ch === "[") { const end = skipGroup(complex, i); base += complex.slice(i, end); i = end; continue; }
      if (ch === '"' || ch === "'") { const end = skipString(complex, i); base += complex.slice(i, end); i = end; continue; }
      if (ch === ":") {
        if (complex[i + 1] === ":") { pseudo = `::${readIdent(complex, i + 2).toLowerCase()}`; break; }
        const name = readIdent(complex, i + 1);
        const lower = name.toLowerCase();
        if (LEGACY_PSEUDO_ELEMENTS.has(lower)) { pseudo = `::${lower}`; break; }
        if (DYNAMIC.has(lower) && complex[i + 1 + name.length] !== "(") { i += 1 + name.length; continue; }
        base += complex.slice(i, i + 1 + name.length);
        i += 1 + name.length;
        continue;
      }
      base += ch;
      i += 1;
    }
    base = base.trim();
    if (base === "" || /[\s>+~]$/.test(base)) base += "*";
    return { base, pseudo };
  }
  const parseSheet = (text) => { const sheet = new CSSStyleSheet(); sheet.replaceSync(text); return sheet; };
  function flatten(sheet) {
    const rules = [];
    const skipped = {};
    const walk = (list, conds) => {
      for (const rule of list) {
        if (rule instanceof CSSStyleRule) {
          rules.push({ selectorText: rule.selectorText, style: rule.style, conds });
          if (rule.cssRules && rule.cssRules.length) skipped.nestedStyleRules = (skipped.nestedStyleRules || 0) + rule.cssRules.length;
        } else if (rule instanceof CSSMediaRule) walk(rule.cssRules, [...conds, { media: rule.conditionText ?? rule.media.mediaText }]);
        else if (typeof CSSSupportsRule !== "undefined" && rule instanceof CSSSupportsRule) walk(rule.cssRules, [...conds, { supports: rule.conditionText }]);
        else { const kind = rule.constructor.name; skipped[kind] = (skipped[kind] || 0) + 1; }
      }
    };
    walk(sheet.cssRules, []);
    return { rules, skipped };
  }
  const appliesNow = (conds) => conds.every((cond) => (cond.media !== undefined ? matchMedia(cond.media).matches : CSS.supports(cond.supports)));
  const longhands = (style) => { const out = []; for (let i = 0; i < style.length; i += 1) out.push(style[i]); return out; };
  const describeElement = (element) => {
    const testid = element.getAttribute && element.getAttribute("data-testid");
    const classes = typeof element.className === "string" && element.className.trim() ? `.${element.className.trim().split(/\s+/).join(".")}` : "";
    return `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${classes}${testid ? `[data-testid=${testid}]` : ""}`;
  };
  const invalidSelectors = [];
  function targetsOf(sheetName, rules) {
    const targets = new Map();
    const ruleHits = [];
    for (const [index, rule] of rules.entries()) {
      const props = longhands(rule.style);
      let hits = 0;
      for (const complex of splitTop(rule.selectorText)) {
        const { base, pseudo } = strip(complex);
        let elements;
        try { elements = document.querySelectorAll(base); } catch { invalidSelectors.push({ sheet: sheetName, selector: complex, base }); continue; }
        for (const element of elements) {
          hits += 1;
          let byPseudo = targets.get(element);
          if (!byPseudo) targets.set(element, (byPseudo = new Map()));
          let list = byPseudo.get(pseudo);
          if (!list) byPseudo.set(pseudo, (list = []));
          list.push({ index, complex, props, applies: appliesNow(rule.conds) });
        }
      }
      ruleHits.push({ selector: rule.selectorText, conds: rule.conds.map((cond) => cond.media ?? cond.supports), hits });
    }
    return { targets, ruleHits };
  }
  /** (b) Overlap scan of a list of sections against the Appearance targets. */
  function overlapScan(appearanceTargets, sections) {
    const overlaps = [];
    const matches = [];
    const perSheet = [];
    let rulesTotal = 0;
    let matchedTargets = 0;
    for (const section of sections) {
      const parsed = flatten(parseSheet(section.text));
      let sheetMatched = 0;
      let selectors = 0;
      for (const rule of parsed.rules) {
        rulesTotal += 1;
        const propSet = new Set(longhands(rule.style));
        for (const complex of splitTop(rule.selectorText)) {
          selectors += 1;
          const { base, pseudo } = strip(complex);
          let elements;
          try { elements = document.querySelectorAll(base); } catch { invalidSelectors.push({ sheet: section.path, selector: complex, base }); continue; }
          for (const element of elements) {
            const list = appearanceTargets.get(element)?.get(pseudo);
            if (!list) continue;
            sheetMatched += 1;
            matches.push({ element: describeElement(element), pseudo, movedSelector: complex, sheet: section.path, movedProperties: [...propSet].slice(0, 12), appearanceSelectors: [...new Set(list.map((entry) => entry.complex))].slice(0, 6), appearanceProperties: [...new Set(list.flatMap((entry) => entry.props))].slice(0, 16) });
            for (const entry of list) {
              const shared = entry.props.filter((prop) => propSet.has(prop));
              if (shared.length) overlaps.push({ element: describeElement(element), pseudo, appearanceSelector: entry.complex, movedSelector: complex, sheet: section.path, shared: shared.slice(0, 24), sharedCount: shared.length, appearanceApplies: entry.applies, movedApplies: appliesNow(rule.conds) });
            }
          }
        }
      }
      perSheet.push({ path: section.path, rules: parsed.rules.length, selectors, skipped: parsed.skipped, matchesOnAppearanceTargets: sheetMatched });
      matchedTargets += sheetMatched;
    }
    return { overlaps, matches, perSheet, rulesTotal, matchedTargets };
  }
  // (a) Reorder equivalence.
  const freeze = parseSheet("*, *::before, *::after { transition: none !important; animation: none !important; }");
  const SKIP_PROP = /^(transition|animation)/;
  function hashString(text) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  const RANGE_PSEUDOS = ["::-webkit-slider-thumb", "::-webkit-slider-runnable-track"];
  function entriesOf(scope) {
    const out = [];
    for (const element of scope) {
      out.push([element, null], [element, "::before"], [element, "::after"]);
      if (element instanceof HTMLInputElement && element.type === "range") for (const pseudo of RANGE_PSEUDOS) out.push([element, pseudo]);
    }
    return out;
  }
  function styleMap(element, pseudo) {
    const style = getComputedStyle(element, pseudo);
    const map = {};
    for (let i = 0; i < style.length; i += 1) { const prop = style[i]; if (!SKIP_PROP.test(prop)) map[prop] = style.getPropertyValue(prop); }
    return map;
  }
  function signature(element, pseudo) {
    const style = getComputedStyle(element, pseudo);
    let text = "";
    for (let i = 0; i < style.length; i += 1) { const prop = style[i]; if (!SKIP_PROP.test(prop)) text += `${prop}:${style.getPropertyValue(prop)};`; }
    return { hash: hashString(text), count: style.length };
  }
  const original = [...document.adoptedStyleSheets];
  function compareUnder(scope, sheetsA, sheetsB) {
    const entries = entriesOf(scope);
    document.adoptedStyleSheets = [...original, ...sheetsA];
    const first = entries.map(([element, pseudo]) => signature(element, pseudo));
    document.adoptedStyleSheets = [...original, ...sheetsB];
    const second = entries.map(([element, pseudo]) => signature(element, pseudo));
    const changed = [];
    entries.forEach((entry, index) => { if (first[index].hash !== second[index].hash) changed.push(index); });
    const details = [];
    if (changed.length) {
      const pick = changed.slice(0, 12);
      document.adoptedStyleSheets = [...original, ...sheetsA];
      const before = pick.map((index) => styleMap(entries[index][0], entries[index][1]));
      document.adoptedStyleSheets = [...original, ...sheetsB];
      const after = pick.map((index) => styleMap(entries[index][0], entries[index][1]));
      pick.forEach((index, n) => {
        const props = Object.keys(before[n]).filter((prop) => before[n][prop] !== after[n][prop]);
        details.push({ element: describeElement(entries[index][0]), pseudo: entries[index][1], properties: props.slice(0, 12).map((prop) => `${prop}: ${before[n][prop]} -> ${after[n][prop]}`), propertyCount: props.length });
      });
    }
    const pseudoEntriesWithProperties = first.filter((entry, index) => entries[index][1] !== null && entry.count > 0).length;
    return { elements: scope.length, entries: entries.length, pseudoEntriesWithProperties, changed: changed.length, details };
  }
  const result = { invalidSelectors };
  try {
    const appearance = flatten(parseSheet(input.appearance.text));
    const { targets, ruleHits } = targetsOf("appearance", appearance.rules);
    let targetEntries = 0;
    for (const byPseudo of targets.values()) targetEntries += byPseudo.size;
    result.appearance = { rules: appearance.rules.length, skipped: appearance.skipped, targetElements: targets.size, targetEntries, ruleHits };
    const real = overlapScan(targets, input.moved);
    result.overlap = { rules: real.rulesTotal, matchesOnAppearanceTargets: real.matchedTargets, matches: real.matches.slice(0, 40), overlaps: real.overlaps.slice(0, 40), overlapCount: real.overlaps.length, perSheet: real.perSheet };
    const synthetic = overlapScan(targets, [{ path: "synthetic-positive-control", text: input.synthetic.text }]);
    result.overlapPositiveControl = { selector: input.synthetic.selector, overlapCount: synthetic.overlaps.length, overlaps: synthetic.overlaps.slice(0, 4) };
    // (a) the whole document body plus the root, measured under the freeze.
    const scope = [document.documentElement, document.body, ...document.body.querySelectorAll("*")];
    const restoreCopies = input.restore.map((section) => parseSheet(section.text));
    result.reorder = compareUnder(scope, [freeze], [freeze, ...restoreCopies]);
    result.reorder.restoreSheets = input.restore.map((section) => section.path);
    const syntheticSheet = parseSheet(input.synthetic.text);
    const syntheticScope = [...document.querySelectorAll(input.synthetic.selector)];
    result.reorderPositiveControlSynthetic = { selector: input.synthetic.selector, ...compareUnder(syntheticScope, [freeze, syntheticSheet], [freeze, syntheticSheet, ...restoreCopies]) };
    const pane = document.querySelector(input.paneSelector);
    if (pane && input.layout) {
      result.reorderPositiveControlLayout = { sheet: input.layout.path, ...compareUnder([pane, ...pane.querySelectorAll("*")], [freeze], [freeze, parseSheet(input.layout.text)]) };
    } else result.reorderPositiveControlLayout = null;
  } finally {
    document.adoptedStyleSheets = original;
    result.restored = document.adoptedStyleSheets.length === original.length && original.every((sheet, index) => document.adoptedStyleSheets[index] === sheet);
  }
  return result;
}
let cascadeInput = null;
const cascadeLog = [];
function cascadeSectionsInput() {
  if (cascadeInput) return cascadeInput;
  const fixedSections = cssSections(bundles.fixed.css);
  const beforeSections = cssSections(bundles.before.css);
  const fixedOrder = fixedSections.map((section) => section.path);
  const beforeOrder = beforeSections.map((section) => section.path);
  const appearanceIndex = fixedOrder.indexOf(APPEARANCE_CSS);
  const moved = beforeOrder.slice(0, beforeOrder.indexOf(APPEARANCE_CSS)).filter((path) => fixedOrder.indexOf(path) > appearanceIndex);
  const laterInBoth = beforeOrder.slice(beforeOrder.indexOf(APPEARANCE_CSS) + 1);
  pre("cascade:eighteen-stylesheets-follow-the-appearance-one-in-the-fixed-bundle-and-preceded-it-at-5cd63ff", moved.length === 18 && isDeepStrictEqual(fixedOrder.slice(appearanceIndex + 1, appearanceIndex + 19), moved), { moved });
  pre("cascade:the-5cd63ff-order-is-the-fixed-order-with-the-appearance-stylesheet-after-the-18", isDeepStrictEqual(beforeOrder, [...fixedOrder.slice(0, appearanceIndex), ...moved, APPEARANCE_CSS, ...laterInBoth])
    && isDeepStrictEqual(fixedOrder, [...fixedOrder.slice(0, appearanceIndex), APPEARANCE_CSS, ...moved, ...laterInBoth]), { beforeOrder, fixedOrder });
  const text = (path) => fixedSections.find((section) => section.path === path).text;
  cascadeInput = {
    appearance: { path: APPEARANCE_CSS, text: text(APPEARANCE_CSS) },
    moved: moved.map((path) => ({ path, text: text(path) })),
    restore: [APPEARANCE_CSS, ...laterInBoth].map((path) => ({ path, text: text(path) })),
    layout: { path: "packages/plugin-web-tokens/src/layout.css", text: text("packages/plugin-web-tokens/src/layout.css") },
    paneSelector: PANE,
  };
  record("cascade-audit-input", { appearance: APPEARANCE_CSS, moved, restoreOrderAppended: [APPEARANCE_CSS, ...laterInBoth], movedBytes: cascadeInput.moved.reduce((sum, section) => sum + section.text.length, 0) });
  return cascadeInput;
}
async function cascadeAudit(id, { state, width }) {
  const input = cascadeSectionsInput();
  const onPane = await evaluate(`!!document.querySelector(${JSON.stringify(`${PANE} .pane-title`)})`);
  const synthetic = onPane ? { selector: `${PANE} .pane-title`, text: ".appearance-pane .pane-title { color: rgb(255, 0, 0); }" } : { selector: '[data-testid="appearance-status"]', text: ".appearance-status { color: rgb(255, 0, 0); }" };
  const started = Date.now();
  const audit = await evaluate(`(${cascadePageAudit.toString()})(${JSON.stringify({ ...input, synthetic })})`);
  await evaluate("__visual.settle()");
  const entry = { id, lang: LANG, width, state, ms: Date.now() - started, ...audit };
  record("cascade-audit", entry);
  cascadeLog.push({ id, width, state, appearance: { targetElements: audit.appearance?.targetElements, ruleHits: (audit.appearance?.ruleHits ?? []).map((rule) => rule.hits) }, overlapCount: audit.overlap?.overlapCount, matchesOnAppearanceTargets: audit.overlap?.matchesOnAppearanceTargets, reorderChanged: audit.reorder?.changed, reorderEntries: audit.reorder?.entries, synthetic: [audit.overlapPositiveControl?.overlapCount, audit.reorderPositiveControlSynthetic?.changed], layoutControl: audit.reorderPositiveControlLayout?.changed ?? null });
  pre(`${id}:cascade:audit-ran-and-restored-the-document-stylesheets`, audit.restored === true && Boolean(audit.appearance) && Boolean(audit.reorder), { restored: audit.restored, error: audit.error });
  pre(`${id}:cascade:every-selector-of-the-appearance-and-the-18-stylesheets-parsed-by-the-browser-is-queryable`, audit.invalidSelectors.length === 0, { invalidSelectors: audit.invalidSelectors.slice(0, 10) });
  pre(`${id}:cascade:all-18-stylesheets-scanned`, audit.overlap.perSheet.length === 18 && audit.overlap.perSheet.every((sheet) => sheet.rules > 0), { perSheet: audit.overlap.perSheet.map((sheet) => `${sheet.path}:${sheet.rules}`) });
  pre(`${id}:cascade:overlap-scan-positive-control-detects-a-synthetic-equal-specificity-rule`, audit.overlapPositiveControl.overlapCount >= 1 && audit.overlapPositiveControl.overlaps.some((overlap) => overlap.shared.includes("color")), audit.overlapPositiveControl);
  pre(`${id}:cascade:reorder-positive-control-detects-a-synthetic-rule-placed-after-the-appearance-one`, audit.reorderPositiveControlSynthetic.elements >= 1 && audit.reorderPositiveControlSynthetic.changed >= 1, { synthetic: audit.reorderPositiveControlSynthetic });
  if (onPane) pre(`${id}:cascade:reorder-positive-control-detects-layout-css-moved-after-the-appearance-stylesheet`, Boolean(audit.reorderPositiveControlLayout) && audit.reorderPositiveControlLayout.changed >= 1, { layout: audit.reorderPositiveControlLayout && { changed: audit.reorderPositiveControlLayout.changed, details: audit.reorderPositiveControlLayout.details.slice(0, 3) } });
  checkDeferred(`${id}:cascade:no-rule-of-the-18-later-stylesheets-declares-a-property-on-an-element-or-pseudo-element-an-appearance-rule-declares-it-for`, audit.overlap.overlapCount === 0, { overlaps: audit.overlap.overlaps.slice(0, 8) });
  checkDeferred(`${id}:cascade:restoring-the-5cd63ff-stylesheet-order-changes-no-computed-value`, audit.reorder.changed === 0 && audit.reorder.entries > 0, { reorder: { elements: audit.reorder.elements, entries: audit.reorder.entries, changed: audit.reorder.changed, details: audit.reorder.details } });
  return audit;
}

// ---------------------------------------------------------------------------------------------------
// Presentation checks (deferred)
// ---------------------------------------------------------------------------------------------------
const compactProbe = (probe) => {
  if (!probe.found) return { desc: probe.desc, found: false };
  const out = { desc: probe.desc, rect: probe.rect, centerHit: probe.centerHit, allHit: probe.allHit, inViewport: probe.inViewport };
  if (probe.inDetail !== null) out.inDetail = probe.inDetail;
  if (probe.inTopbar !== null) out.inTopbar = probe.inTopbar;
  if (!probe.centerHit) out.centerTarget = probe.centerTarget;
  if (probe.hits) out.hits = probe.hits.map((hit) => `${hit.point}:${hit.ok ? "ok" : hit.hit}`);
  if (!probe.visible) out.visible = false;
  return out;
};
const petPoints = (probe) => (probe.hits ?? []).filter((hit) => hit.hit.startsWith("pet:")).length;
function layoutChecks(id, lay) {
  const documentBox = lay.document;
  checkDeferred(`${id}:document-no-horizontal-scroll`, documentBox.scrollWidth <= documentBox.clientWidth && documentBox.scrollX === 0, { document: documentBox });
  checkDeferred(`${id}:settings-detail-no-horizontal-scroll`, Boolean(lay.detail) && lay.detail.scrollWidth <= lay.detail.clientWidth && lay.detail.scrollLeft === 0, { detail: lay.detail });
  checkDeferred(`${id}:pane-no-horizontal-overflow`, Boolean(lay.pane) && lay.pane.scrollWidth <= lay.pane.clientWidth, { pane: lay.pane });
  const scrollers = lay.chain.filter((entry) => /(auto|scroll)/.test(entry.overflowX));
  checkDeferred(`${id}:ancestor-scrollers-no-horizontal-scroll`, scrollers.every((entry) => entry.scrollWidth <= entry.clientWidth) && lay.chain.every((entry) => entry.scrollLeft === 0), { scrollers: scrollers.map((entry) => `${entry.name}:${entry.scrollWidth}/${entry.clientWidth}:${entry.scrollLeft}`) });
}
function probeChecks(id, probes) {
  const failures = { found: [], hit: [], contained: [], viewport: [], small: [], clipped: [], hidden: [] };
  for (const probe of probes) {
    if (!probe.found) { failures.found.push(probe.desc); continue; }
    if (!(probe.centerHit && probe.allHit)) failures.hit.push(compactProbe(probe));
    if (probe.desc.startsWith("topbar:") ? probe.inTopbar !== true : probe.inDetail !== true) failures.contained.push(compactProbe(probe));
    if (!probe.inViewport) failures.viewport.push(compactProbe(probe));
    if (!probe.visible) failures.hidden.push(probe.desc);
    if (CALLER_TARGET(probe.desc) && !(probe.rect.width >= 44 - 0.01 && probe.rect.height >= 44 - 0.01)) failures.small.push({ desc: probe.desc, width: probe.rect.width, height: probe.rect.height });
    if (CALLER_TARGET(probe.desc) && probe.overflow.sw > probe.overflow.cw) failures.clipped.push({ desc: probe.desc, overflow: probe.overflow });
  }
  checkDeferred(`${id}:every-control-found`, failures.found.length === 0, { missing: failures.found });
  checkDeferred(`${id}:centre-and-four-inset-hit-tests-uncovered`, failures.hit.length === 0, { failed: failures.hit });
  checkDeferred(`${id}:pane-controls-inside-settings-detail-topbar-controls-inside-topbar`, failures.contained.length === 0, { failed: failures.contained });
  const pastContent = probes.filter((probe) => probe.found && !probe.desc.startsWith("topbar:") && probe.inDetailContent !== true).map(compactProbe);
  checkDeferred(`${id}:pane-controls-inside-the-settings-detail-content-box`, pastContent.length === 0, { failed: pastContent });
  checkDeferred(`${id}:inside-viewport-after-scroll`, failures.viewport.length === 0, { failed: failures.viewport });
  checkDeferred(`${id}:visible`, failures.hidden.length === 0, { failed: failures.hidden });
  checkDeferred(`${id}:caller-targets-at-least-44x44`, failures.small.length === 0, { failed: failures.small });
  checkDeferred(`${id}:caller-targets-no-clipped-label`, failures.clipped.length === 0, { failed: failures.clipped });
  return failures;
}
const minCallerTarget = (probes) => {
  const targets = probes.filter((probe) => probe.found && CALLER_TARGET(probe.desc));
  if (targets.length === 0) return null;
  const smallest = targets.reduce((best, probe) => (probe.rect.width * probe.rect.height < best.rect.width * best.rect.height ? probe : best));
  return { desc: smallest.desc, width: smallest.rect.width, height: smallest.rect.height, minWidth: Math.min(...targets.map((probe) => probe.rect.width)), minHeight: Math.min(...targets.map((probe) => probe.rect.height)) };
};
function overlapAndClipChecks(id, overlap, clip) {
  const offenders = overlap.filter((group) => group.overlaps.length > 0);
  checkDeferred(`${id}:no-overlap-between-sibling-parts`, offenders.length === 0, { offenders });
  const clipped = clip.filter((entry) => entry.sw > entry.cw);
  checkDeferred(`${id}:recovery-status-line-and-action-labels-not-clipped`, clipped.length === 0, { clipped });
}
/** A2.8 area structure: normal flow, start-aligned, wrapping, no shared footer classes; status line, then Retry all first, then Export and Discard all, then Reset alone. */
function actionsChecks(id, lay, retryBox, { drafts }) {
  const actions = lay.actions;
  const row0 = actions?.rows?.[0];
  const row1 = actions?.rows?.[1];
  const expectedRow0 = drafts ? ["retry-all", "export", "discard-all"] : ["retry-all"];
  checkDeferred(`${id}:bottom-area-in-normal-flow-start-aligned-wrapping-without-footer-classes`, Boolean(actions) && actions.position === "static" && actions.justifyContent === "flex-start" && actions.flexWrap === "wrap"
    && actions.isLastPaneChild && actions.footerClassesAnywhereInPane === 0 && !/pane-footer|pane-save/.test(actions.className)
    && actions.rows.every((row) => row.position === "static" && row.justifyContent === "flex-start" && row.flexWrap === "wrap"), { actions: actions && { position: actions.position, justifyContent: actions.justifyContent, flexWrap: actions.flexWrap, className: actions.className, rows: actions.rows.map((row) => ({ position: row.position, justifyContent: row.justifyContent, flexWrap: row.flexWrap })) } });
  checkDeferred(`${id}:bottom-area-order-status-line-retry-all-first-then-export-discard-all-then-reset-alone`, Boolean(actions) && actions.children[0]?.testid === "appearance-status-line" && actions.rows.length === 2
    && isDeepStrictEqual(row0.buttons, expectedRow0) && isDeepStrictEqual(row1.buttons, ["reset"]), { children: actions?.children, rows: actions?.rows?.map((row) => row.buttons) });
  checkDeferred(`${id}:retry-all-at-the-inline-start-and-reset-at-the-inline-start-of-its-own-line`, Boolean(retryBox) && retryBox.firstInRow && retryBox.startAligned && Boolean(row1)
    && Math.abs(row1.rect.left - row1.content.left) <= 0.5 && row1.rect.top >= row0.rect.bottom - 0.5, { retryBox: retryBox && { rect: retryBox.rect, rowContent: retryBox.rowContent }, row0: row0?.rect, row1: row1?.rect });
  checkDeferred(`${id}:retry-all-at-least-44x44-and-sized-to-its-content`, Boolean(retryBox) && retryBox.rect.width >= 44 - 0.01 && retryBox.rect.height >= 44 - 0.01
    && Math.abs(retryBox.rect.width - Math.max(44, retryBox.intrinsicWidth)) <= 1 && retryBox.rect.width < retryBox.rowContent.right - retryBox.rowContent.left - 0.5, { retryBox });
  checkDeferred(`${id}:retry-all-no-icon-badge-count-animation-or-saved-class`, Boolean(retryBox) && retryBox.childElements === 0 && retryBox.animations === 0 && !retryBox.classList.includes("is-saved"), { childElements: retryBox?.childElements, classList: retryBox?.classList });
}
async function disabledAttributeChecks(id, { passOpen = false } = {}) {
  const ax = await axOf('[data-testid="appearance-retry-all"]');
  const pane = await evaluate("__native.pane()");
  const retry = pane.retryAll;
  record("retry-all-accessibility", { id, ax, retry, passOpen });
  checkDeferred(`${id}:disabled-retry-all-attributes-aria-disabled-no-disabled-or-title-pointer-events-on-${passOpen ? "described-by-the-in-flight-line" : "no-describedby"}`, retry.ariaDisabled === "true" && retry.disabled === false && retry.title === null && retry.pointerEvents !== "none"
    && retry.tabIndex === 0 && !retry.hidden && retry.type === "button" && (passOpen ? retry.describedByStatusLine && pane.statusLine.text === T.retrying : retry.describedBy === null), { retry });
  checkDeferred(`${id}:disabled-retry-all-accessible-name-equals-visible-label-${passOpen ? "description-is-the-in-flight-line" : "no-description"}`, Boolean(ax) && ax.name === T.retryAll && retry.text === T.retryAll && ax.role === "button"
    && (passOpen ? ax.description === T.retrying : !ax.description), { ax, text: retry.text });
}
async function enabledAttributeChecks(id) {
  const ax = await axOf('[data-testid="appearance-retry-all"]');
  const pane = await evaluate("__native.pane()");
  const retry = pane.retryAll;
  record("retry-all-accessibility", { id, ax, retry });
  checkDeferred(`${id}:enabled-retry-all-no-aria-disabled-described-by-the-status-line-name-equals-label`, (retry.ariaDisabled === null || retry.ariaDisabled === "false") && retry.disabled === false && retry.describedByStatusLine
    && Boolean(ax) && ax.name === T.retryAll && retry.text === T.retryAll && ax.description === pane.statusLine.text, { retry, ax, statusLine: pane.statusLine });
}

// ---------------------------------------------------------------------------------------------------
// R-PET: the pet-on run (coverage of every control; uncovered centres for the caller's controls; the A2.8 gate)
// ---------------------------------------------------------------------------------------------------
async function petPrecondition(id, width) {
  await parkMouse();
  const pet = await evaluate("__visual.petState()");
  const size = petSizeAt(width);
  const expected = { left: width - 108, top: HEIGHTS[width] - 108 };
  pre(`${id}:pet-on-at-default-position-not-hovered-or-focused`, pet.present && Math.abs(pet.wrap.left - expected.left) < 0.5 && Math.abs(pet.wrap.top - expected.top) < 0.5
    && Math.abs(pet.wrap.width - size) < 0.5 && !pet.hovered && !pet.focusWithin && (!pet.bubble || pet.bubble.pointerEvents === "none"), { pet, expected, size });
  pre(`${id}:no-stored-pet-position`, (await bytesOf(["xai_pet_pos"])).xai_pet_pos === null);
  return pet;
}
const gateRecord = (gate) => ({ rect: gate.rect, separationPx: gate.separationPx, intersection: gate.intersection, hits: gate.hits.map((hit) => `${hit.point}:${hit.on}`), allOnButton: gate.allOnButton, inViewport: gate.inViewport, inDetail: gate.inDetail, ariaDisabled: gate.ariaDisabled, petUnion: gate.pet.union, scroller: gate.scroller });
const gateLog = [];
async function a28Gate(id, state, width, { expectDisabled, shotName = null, shotDetails = {} }) {
  await evaluate(`(__visual.probe("retry-all"), true)`);
  await delay(120);
  const intoView = await evaluate(`__visual.gate("retry-all")`);
  const pageMax = await evaluate("document.documentElement.scrollHeight - document.documentElement.clientHeight");
  const ends = [];
  for (const pageTop of pageMax > 0 ? [0, pageMax] : [0]) {
    await evaluate(`__visual.scrollWindowTo(${pageTop})`);
    const scroller = await evaluate(`__visual.scrollSettingsTo("end")`);
    await delay(160);
    ends.push({ pageTop, scroller, gate: await evaluate(`__visual.gate("retry-all")`) });
  }
  const entry = { id, lang: LANG, width, height: HEIGHTS[width], state, expectDisabled, pageScrollMax: pageMax, intoView: gateRecord(intoView), atEnd: ends.map((item) => ({ pageTop: item.pageTop, ...gateRecord(item.gate) })) };
  gateLog.push({ width, state, intoView: entry.intoView, atEnd: entry.atEnd });
  record("a28-gate", entry);
  const where = [["into-view", intoView], ...ends.map((item) => [`end-of-range${pageMax > 0 ? `-page-at-${item.pageTop === 0 ? "top" : "end"}` : ""}`, item.gate])];
  for (const [label, gate] of where) {
    checkDeferred(`${id}:a28:${label}:retry-all-${expectDisabled ? "disabled" : "enabled"}-state-as-expected`, gate.found && (expectDisabled ? gate.ariaDisabled === "true" : gate.ariaDisabled === null || gate.ariaDisabled === "false"), { ariaDisabled: gate.ariaDisabled });
    checkDeferred(`${id}:a28:${label}:separation-at-least-8px-left-of-the-pet`, gate.found && gate.separationPx !== null && gate.separationPx >= 8, { separationPx: gate.separationPx, rect: gate.rect, petUnion: gate.pet.union });
    checkDeferred(`${id}:a28:${label}:zero-intersection-with-the-pet-box`, gate.found && gate.intersection.area === 0, { intersection: gate.intersection });
    checkDeferred(`${id}:a28:${label}:at-least-44x44-inside-settings-detail`, gate.found && gate.rect.width >= 44 - 0.01 && gate.rect.height >= 44 - 0.01 && gate.inDetail, { rect: gate.rect, inDetail: gate.inDetail });
    if (label === "into-view" || gate.inViewport) checkDeferred(`${id}:a28:${label}:in-viewport-centre-and-four-inset-points-on-the-button`, gate.found && gate.inViewport && gate.allOnButton, { hits: gate.hits, rect: gate.rect, inViewport: gate.inViewport });
  }
  checkDeferred(`${id}:a28:end-of-range:the-button-is-in-the-viewport-in-at-least-one-page-position`, ends.some((item) => item.gate.inViewport), { ends: ends.map((item) => ({ pageTop: item.pageTop, rect: item.gate.rect, inViewport: item.gate.inViewport })) });
  pre(`${id}:a28:scrolled-to-the-end-of-the-settings-range`, ends.every((item) => Boolean(item.scroller) && Math.abs(item.scroller.scrollTop - item.scroller.maxScrollTop) <= 1), { ends: ends.map((item) => item.scroller) });
  if (shotName) entry.screenshot = (await captureViewport(shotName, { state: `${state} at ${width}x${HEIGHTS[width]}, default-position DesktopPet on, .module-settings at the end of its range`, gate: entry.atEnd.at(-1), ...shotDetails })).file;
  await evaluate("__visual.scrollWindowTo(0)");
  return entry;
}
/** Pet-on coverage of every control after scrolling it into view; blocking only for the caller's added or moved controls. */
async function petOnRun(id, state, width, controls) {
  await petPrecondition(id, width);
  const probes = await evaluate(`__visual.probeAll(${JSON.stringify(controls)})`);
  const coverage = probes.filter((probe) => probe.found).map((probe) => ({ desc: probe.desc, centerHit: probe.centerHit, allHit: probe.allHit, petPoints: petPoints(probe), caller: CALLER_TARGET(probe.desc), ...(probe.allHit ? {} : { hits: probe.hits.map((hit) => `${hit.point}:${hit.ok ? "ok" : hit.hit}`) }) }));
  const caller = coverage.filter((entry) => entry.caller);
  const unchangedCovered = coverage.filter((entry) => !entry.caller && entry.petPoints > 0);
  record("pet-on-coverage", { id, width, state, controls: coverage.length, notFullyHit: coverage.filter((entry) => !entry.allHit), coveredByPet: coverage.filter((entry) => entry.petPoints > 0).map((entry) => `${entry.desc}:${entry.petPoints}`) });
  checkDeferred(`${id}:pet-on:every-control-found`, probes.every((probe) => probe.found), { missing: probes.filter((probe) => !probe.found).map((probe) => probe.desc) });
  checkDeferred(`${id}:pet-on:caller-added-or-moved-controls-centre-uncovered`, caller.every((entry) => entry.centerHit), { failed: caller.filter((entry) => !entry.centerHit) });
  if (unchangedCovered.length) observe(`${id}:pet-on:unchanged-control-coverage-UX-03-SHELL-05`, { unchangedCovered });
  return { coverage, unchangedCovered };
}

// ---------------------------------------------------------------------------------------------------
// Fixed-product states (contract §9 "States to check")
// ---------------------------------------------------------------------------------------------------
const reference = { geometry: {}, topbar: {}, petCoverage: {}, disabledBox: {}, enabledBox: {}, styles: {} };
/** Expected computed-style differences of the clean rows against 5cd63ff: only the <=640 px scoped background-palette grid (cards get wider, two rows of three). */
const expectedStyleDiff = (width, path, property) => width <= 640 && path.startsWith("row4") && ["width", "height", "grid-template-columns"].includes(property);
function styleComparison(id, width, fixed) {
  const before = reference.styles[width];
  if (!before || !fixed) return null;
  const paths = [...new Set([...Object.keys(before), ...Object.keys(fixed)])];
  const missing = paths.filter((path) => !before[path] || !fixed[path]);
  const diffs = [];
  for (const path of paths.filter((entry) => before[entry] && fixed[entry])) {
    for (const property of Object.keys(before[path])) {
      if (before[path][property] !== fixed[path][property]) diffs.push({ path, property, before: before[path][property], fixed: fixed[path][property], expected: expectedStyleDiff(width, path, property) });
    }
  }
  const unexpected = diffs.filter((entry) => !entry.expected);
  record("row-computed-style-comparison", { id, width, elements: paths.length, properties: Object.keys(Object.values(fixed)[0] ?? {}).length, missing, diffs: diffs.length, expectedDiffs: diffs.filter((entry) => entry.expected).slice(0, 40), unexpected: unexpected.slice(0, 40) });
  checkDeferred(`${id}:existing-row-elements-computed-styles-equal-5cd63ff-except-the-scoped-640px-palette-grid`, missing.length === 0 && unexpected.length === 0, { missing: missing.slice(0, 10), unexpected: unexpected.slice(0, 20) });
  return { diffs, unexpected };
}
const widthTable = [];
const STATE_DEFS = {
  clean: { seeds: () => seedsOf({ lang: LANG }), states: {}, drafts: false, disabled: true, status: false },
  "source-only": { seeds: () => seedsOf({ lang: LANG }, { [KEY.railPos]: "diagonal" }), states: { railPos: "unavailable" }, drafts: false, disabled: true, status: false },
  "all-seven": { seeds: () => seedsOf({ lang: OPPOSITE[LANG], ...NONDEFAULT }), states: Object.fromEntries(FIELDS.map((field) => [field, "not-saved"])), drafts: true, disabled: false, status: true },
  "partial-reset": { seeds: () => seedsOf({ lang: LANG, ...NONDEFAULT }), states: { theme: "not-reset", bgTone: "not-reset" }, drafts: true, disabled: false, status: true },
  "partial-pass": { seeds: () => seedsOf({ lang: LANG, theme: "dark", accentHue: 230 }), states: { accentHue: "not-saved" }, drafts: true, disabled: false, status: true },
  "topbar-status": { seeds: () => seedsOf({ lang: LANG }), states: { theme: "not-saved" }, drafts: true, disabled: false, status: true },
  "open-pass": { seeds: () => seedsOf({ lang: LANG }), states: { theme: "saving" }, drafts: true, disabled: true, status: false },
};
const STATUS_LINE = {
  clean: "", "source-only": "", "all-seven": T.count(7), "partial-reset": T.count(2), "partial-pass": T.count(1), "topbar-status": T.count(1), "open-pass": T.retrying,
};
async function setupState(id, state) {
  if (state === "all-seven") {
    await evaluate(`__native.denySet(${JSON.stringify(SEVEN)})`);
    await failPane(`lang:${LANG}`, ["lang"], `${id}:lang`);
    pre(`${id}:ui-language-now-${LANG}`, (await evaluate("__native.uiLang()")) === LANG);
    await failPane("theme:light", ["theme"], `${id}:theme`);
    await failPane("density:comfortable", ["density"], `${id}:density`);
    await failPane("swatch:0", ["accentHue"], `${id}:accent`);
    await failPane("tone:default", ["bgTone", "accentHue"], `${id}:background`);
    await failPane("railpos:left", ["railPos"], `${id}:rail`);
    await focusSlider("fontScale", `${id}:font`);
    await press("ArrowLeft");
    pre(`${id}:font:edit-settled-as-a-failed-draft`, await waitUntil(blockIs("fontScale", "not-saved"), 6000));
  } else if (state === "partial-reset") {
    await evaluate(`__native.denyRemove(${JSON.stringify([KEY.theme, KEY.bgTone])})`);
    await clickReset(id, true);
    pre(`${id}:partial-reset-settled`, await waitUntil(recoveryIs(blocks({ theme: "not-reset", bgTone: "not-reset" })), 8000), { pane: await evaluate("__native.pane()") });
  } else if (state === "partial-pass") {
    await failPane("theme:light", ["theme"], `${id}:theme`);
    await failPane("swatch:0", ["accentHue"], `${id}:accent`);
    await evaluate(`__native.allowSet(${JSON.stringify(KEY.theme)})`);
    await clickDesc("retry-all", `${id}:retry-all`);
    pre(`${id}:partial-pass-settled`, await waitUntil(`${statusLineIs(T.count(1))} && ${recoveryIs(blocks({ accentHue: "not-saved" }))}`, 8000), { pane: await evaluate("__native.pane()") });
  } else if (state === "topbar-status") {
    await failTopbar("theme", "dark", `${id}:topbar-theme`);
  } else if (state === "open-pass") {
    await failPane("theme:dark", ["theme"], `${id}:theme`);
    await evaluate("__native.restore()");
    await evaluate(`__native.hold(${JSON.stringify(LOCK_OF("theme"))})`);
    await clickDesc("retry-all", `${id}:retry-all`);
    pre(`${id}:pass-open-with-the-member-held-behind-the-real-lock`, await waitUntil(`${statusLineIs(T.retrying)} && ${recoveryIs(blocks({ theme: "saving" }))}`, 8000), { pane: await evaluate("__native.pane()"), locks: await evaluate("__native.lockQuery()") });
  }
  await parkMouse();
  await evaluate("__visual.settle()");
}
/** The semantic state the presentation is judged in (contract §9 "States to check"). */
async function stateChecks(id, state) {
  const def = STATE_DEFS[state];
  const pane = await evaluate("__native.pane()");
  const topbar = await evaluate("__native.topbar()");
  const oldUi = await evaluate("__native.oldUi()");
  const expectedRecovery = blocks(def.states);
  const enabled = pane.retryAll && (pane.retryAll.ariaDisabled === null || pane.retryAll.ariaDisabled === "false");
  checkDeferred(`${id}:state:recovery-blocks`, isDeepStrictEqual(pane.recovery, expectedRecovery), { recovery: pane.recovery, expectedRecovery });
  checkDeferred(`${id}:state:status-line`, pane.statusLine?.text === STATUS_LINE[state] && pane.statusLine.role === "status", { statusLine: pane.statusLine, expected: STATUS_LINE[state] });
  checkDeferred(`${id}:state:retry-all-rendered-${def.disabled ? "aria-disabled" : "enabled"}-never-native-disabled`, Boolean(pane.retryAll) && pane.retryAll.text === T.retryAll && pane.retryAll.disabled === false && (def.disabled ? pane.retryAll.ariaDisabled === "true" : enabled), { retryAll: pane.retryAll });
  checkDeferred(`${id}:state:export-and-discard-all-${def.drafts ? "present" : "absent"}`, def.drafts ? pane.exportButton === T.exportDraft && pane.discardAll === T.discardAll : pane.exportButton === null && pane.discardAll === null, { exportButton: pane.exportButton, discardAll: pane.discardAll });
  checkDeferred(`${id}:state:reset-label-and-no-old-button-or-saved-claim`, pane.reset === T.reset && !pane.oldFooter && oldUi.length === 0 && !(state === "clean" && SUCCESS_LINES.includes(pane.statusLine?.text)), { reset: pane.reset, oldUi });
  checkDeferred(`${id}:state:topbar-status-${def.status ? "shown" : "absent"}`, def.status ? topbar.status !== null && topbar.status.name === T.statusName : topbar.status === null, { status: topbar.status });
  if (def.disabled && state !== "open-pass") checkDeferred(`${id}:state:no-failure-or-in-flight-line-beside-the-disabled-button`, !FAILURE_LINES.includes(pane.statusLine?.text) && !/\d/.test(pane.statusLine?.text ?? ""), { statusLine: pane.statusLine });
  return { pane, topbar };
}
/** Topbar containment with the status visible (contract §9; Topbar status breakpoint per the controller ruling: text from 768 px). */
function topbarChecks(id, tb, width, { statusExpected, referenceTopbar = null }) {
  const probes = tb.controls;
  checkDeferred(`${id}:topbar:status-${statusExpected ? "present" : "absent"}`, Boolean(tb.status) === statusExpected, { status: tb.status });
  checkDeferred(`${id}:topbar:no-horizontal-overflow`, tb.scrollWidth <= tb.clientWidth && (!tb.controlsBox || tb.controlsBox.scrollWidth <= tb.controlsBox.clientWidth), { scrollWidth: tb.scrollWidth, clientWidth: tb.clientWidth, controlsBox: tb.controlsBox });
  const bad = probes.filter((probe) => !(probe.found && probe.inViewport && probe.inTopbar && probe.centerHit && probe.allHit && probe.visible));
  checkDeferred(`${id}:topbar:every-control-inside-viewport-and-topbar-centre-and-inset-hit`, probes.length >= 2 && bad.length === 0, { bad: bad.map(compactProbe), controls: probes.map((probe) => probe.desc) });
  const sizes = Object.fromEntries(probes.map((probe) => [probe.desc, { width: probe.rect.width, height: probe.rect.height }]));
  if (statusExpected && tb.status) {
    const textExpected = width >= 768;
    checkDeferred(`${id}:topbar:status-normative-name-and-text-icon-and-before-the-trigger`, tb.status.name === T.statusName && tb.status.text === T.statusText && tb.status.icon && tb.status.beforeTrigger, { status: tb.status });
    checkDeferred(`${id}:topbar:status-at-least-44x44`, tb.status.rect.width >= 44 - 0.01 && tb.status.rect.height >= 44 - 0.01, { rect: tb.status.rect });
    checkDeferred(`${id}:topbar:status-text-${textExpected ? "visible-from-768" : "hidden-icon-only-below-768"}-and-summary-${textExpected ? "visible" : "hidden"}`, tb.status.textVisible === textExpected && tb.summaryVisible === textExpected && (textExpected || Math.abs(tb.status.rect.width - 44) <= 0.5), { textVisible: tb.status.textVisible, summaryVisible: tb.summaryVisible, rect: tb.status.rect });
    if (referenceTopbar) {
      // "Stays ... at least 44x44": a pre-existing Topbar control keeps at least the height it has without the status at this width
      // (and 44 wherever it had 44), and keeps a width of at least 44.
      const shrunk = Object.entries(referenceTopbar).filter(([desc]) => desc !== "topbar:status").filter(([desc, ref]) => {
        const now = sizes[desc];
        return !now || now.height < Math.min(44, ref.height) - 0.01 || now.height < ref.height - 0.01 || now.width < 44 - 0.01;
      });
      checkDeferred(`${id}:topbar:pre-existing-controls-keep-their-height-and-at-least-44-wide-with-the-status-visible`, shrunk.length === 0, { shrunk, sizes, referenceTopbar });
    }
  }
  return sizes;
}
async function gatedRun(id, state, width, { screenshot = null } = {}) {
  const def = STATE_DEFS[state];
  await parkMouse();
  await evaluate("__visual.settle()");
  const lay = await evaluate("__visual.layout()");
  layoutChecks(id, lay);
  const expected = paneList(def.states, { drafts: def.drafts });
  const actual = await evaluate("__visual.paneControls()");
  checkDeferred(`${id}:pane-controls-in-dom-order`, isDeepStrictEqual(actual, expected), { actual, expected });
  const probes = await evaluate(`__visual.probeAll(${JSON.stringify(expected)})`);
  const failures = probeChecks(id, probes);
  const afterProbes = await evaluate("__visual.layout()");
  checkDeferred(`${id}:no-horizontal-scroll-after-scrolling-every-control-into-view`, afterProbes.document.scrollX === 0 && afterProbes.chain.every((entry) => entry.scrollLeft === 0) && afterProbes.detail.scrollLeft === 0, { chain: afterProbes.chain.filter((entry) => entry.scrollLeft !== 0) });
  const overlap = await evaluate("__visual.overlapReport()");
  const clip = await evaluate("__visual.textClip()");
  overlapAndClipChecks(id, overlap, clip);
  const retryBox = await evaluate("__visual.retryAllBox()");
  actionsChecks(id, lay, retryBox, { drafts: def.drafts });
  await evaluate("__visual.scrollWindowTo(0)");
  const tb = await evaluate("__visual.topbar()");
  const sizes = topbarChecks(`${id}`, tb, width, { statusExpected: def.status, referenceTopbar: def.status ? reference.topbar[width] : null });
  if (state === "clean") reference.topbar[width] = sizes;
  if (def.disabled) {
    await disabledAttributeChecks(id, { passOpen: state === "open-pass" });
    reference.disabledBox[`${width}`] ??= retryBox;
  } else {
    await enabledAttributeChecks(id);
    if (state === "all-seven") reference.enabledBox[`${width}`] = retryBox;
  }
  const rowGeometry = await evaluate("__visual.rowControlGeometry()");
  if (state === "clean") styleComparison(id, width, await evaluate("__visual.styleFingerprint()"));
  if (reference.geometry[width]) {
    const shrunk = Object.entries(reference.geometry[width]).filter(([desc, before]) => !rowGeometry[desc] || rowGeometry[desc].width < before.width - 0.01 || rowGeometry[desc].height < before.height - 0.01);
    checkDeferred(`${id}:existing-row-controls-not-smaller-than-5cd63ff`, shrunk.length === 0, { shrunk: shrunk.map(([desc, before]) => ({ desc, before, now: rowGeometry[desc] ?? null })) });
  }
  await cascadeAudit(id, { state, width }); // batch 48 addition
  const summary = {
    lang: LANG, width, height: HEIGHTS[width], state, controls: probes.length, failures: Object.fromEntries(Object.entries(failures).map(([key, list]) => [key, list.length])),
    minCallerTarget: minCallerTarget(probes), document: `${lay.document.scrollWidth}/${lay.document.clientWidth}`, detail: `${lay.detail.scrollWidth}/${lay.detail.clientWidth}`, pane: `${lay.pane.scrollWidth}/${lay.pane.clientWidth}`,
    detailRect: lay.detail.rect, paneRect: lay.pane.rect, retryAll: retryBox?.rect, topbar: tb.status ? { status: tb.status.rect, textVisible: tb.status.textVisible, summaryVisible: tb.summaryVisible } : null,
    probes: probes.map(compactProbe),
  };
  record("width", summary);
  widthTable.push({ width, state, controls: probes.length, failures: summary.failures, minCallerTarget: summary.minCallerTarget, document: summary.document, detail: summary.detail, pane: summary.pane });
  if (screenshot === "tall") await captureTall(`${width}-${state}`, width, { state: `${state} (pet hidden; full pane, gutter pinned)` });
  return { lay, probes, retryBox, tb };
}
async function fixedState(state, width) {
  progress(`E14 state ${width} ${state}`); // batch 50 addition
  const id = `${LANG}:${width}:${state}`;
  const def = STATE_DEFS[state];
  await seed(def.seeds(), id);
  await mountApp(id, { width });
  await setupState(id, state);
  await stateChecks(id, state);
  // ---- pet on (R-PET) ----
  const controls = paneList(def.states, { drafts: def.drafts });
  const topbarControls = await evaluate("__visual.topbarControls()");
  await petOnRun(`${id}:pet-on`, state, width, [...controls, ...topbarControls]);
  const shot768 = width === 768 && (state === "all-seven" || state === "clean") ? `768-pet-on-${state}-end` : null;
  await a28Gate(`${id}`, state, width, { expectDisabled: def.disabled, shotName: shot768 });
  if (state === "topbar-status") {
    // The same Topbar status on /app/tasks (pet still on, same document).
    await clickDesc(`rail:${labels[LANG].tasks}`, `${id}:rail-tasks`);
    pre(`${id}:on-app-tasks`, await waitUntil(`verify.location().pathname === "/app/tasks" && ${topbarStatusIs(true)}`, 6000));
    await parkMouse();
    await evaluate("__visual.settle()");
    await petOnRun(`${id}:tasks:pet-on`, state, width, await evaluate("__visual.topbarControls()"));
  }
  // ---- pet hidden (gated) ----
  await petOff(id, width);
  if (state === "topbar-status") {
    await evaluate("__visual.scrollWindowTo(0)");
    const tbTasks = await evaluate("__visual.topbar()");
    topbarChecks(`${id}:tasks`, tbTasks, width, { statusExpected: true, referenceTopbar: reference.topbar[width] });
    record("topbar", { id: `${id}:tasks`, width, topbar: tbTasks });
    await cascadeAudit(`${id}:tasks`, { state: "topbar-status-on-app-tasks", width }); // batch 48 addition
    if (width === 375 || width === 1440) await captureViewport(`${width}-topbar-status-tasks`, { state: "Topbar status on /app/tasks after a failed Topbar theme choice (pet hidden)" });
    await clickDesc("topbar:status", `${id}:review`);
    pre(`${id}:review-navigated-to-the-pane`, await waitUntil(`verify.location().pathname === "/app/settings/appearance" && ${READY_PANE}`, 6000));
    await parkMouse();
    await evaluate("__visual.settle()");
  }
  const screenshot = state === "all-seven" || ((state === "partial-reset" || state === "partial-pass") && width === 375) ? "tall" : null;
  const result = await gatedRun(id, state, width, { screenshot });
  if (state === "topbar-status") {
    record("topbar", { id, width, topbar: result.tb });
    if (width === 375 || width === 1440) await captureViewport(`${width}-topbar-status-pane`, { state: "Topbar status on the Appearance pane after a failed Topbar theme choice (pet hidden)" });
  }
  if (state === "clean" && (width === 375 || width === 1440)) await focusRing(id, width);
  if (state === "open-pass") {
    await evaluate(`__native.release(${JSON.stringify(LOCK_OF("theme"))})`);
    pre(`${id}:released-member-saved`, await waitUntil(`${statusLineIs(T.saved)} && __native.pane().recovery.length === 0`, 8000));
  }
}
/** Focus ring on the disabled Retry all after a trusted Tab (contract §9 measured presentation), with the screenshot. */
async function focusRing(id, width) {
  await focusSlider("fontScale", `${id}:focus-ring`);
  await press("Tab");
  const focus = await evaluate("__visual.focusInfo()");
  const colours = await evaluate(`__visual.colours("retry-all")`);
  record("focus-ring", { id, width, focus, colours: { computed: colours.computed, contrast: colours.contrast } });
  checkDeferred(`${id}:focus-ring:disabled-retry-all-focus-visible-solid-outline-at-least-2px`, focus.desc === "retry-all" && focus.focusVisible === true && focus.outline.style === "solid" && Number.parseFloat(focus.outline.width) >= 2 && focus.ariaDisabled === "true" && !focus.disabledAttr && focus.centerHit && focus.inViewport, { focus });
  await captureViewport(`${width}-clean-retry-all-disabled-focused`, { state: "clean state, Retry all aria-disabled and focused by a trusted Tab (pet hidden)", focus });
}

// ---------------------------------------------------------------------------------------------------
// 5cd63ff references (H14 (a) at 375, H14 (b) at 768x1024, unchanged-control geometry and pet coverage, Topbar sizes)
// ---------------------------------------------------------------------------------------------------
const frozenE4 = (id) => e4Records.find((entry) => entry.id === id) ?? null;
async function beforeReference(width) {
  progress(`E14 5cd63ff reference ${width}`); // batch 50 addition
  const id = `${LANG}:${width}:before-5cd63ff`;
  await seed(seedsOf({ lang: LANG }), id);
  await mountApp(id, { width, variant: "before" });
  const pet = await petPrecondition(id, width);
  reference.geometry[width] = await evaluate("__visual.rowControlGeometry()");
  reference.styles[width] = await evaluate("__visual.styleFingerprint()");
  const controls = await evaluate("__visual.paneControls()");
  pre(`${id}:5cd63ff-pane-controls`, isDeepStrictEqual(controls, BEFORE_PANE_LIST), { controls });
  if (width === 375) {
    // Measured right after the mount, before any probe scrolls (as the frozen E4 H14 (a) measurement).
    const lay = await evaluate("__visual.layout()");
    const graphiteRect = await evaluate(`(() => { const r = document.querySelector('${PANE} .bg-tone-card.bgt-graphite').getBoundingClientRect(); return { left: Math.round(r.left * 100) / 100, right: Math.round(r.right * 100) / 100 }; })()`);
    const frozen = frozenE4(`H14-${LANG}-a2:375-controls-past-content-box-or-pane-overflow`);
    const observed = { paneScrollWidth: lay.pane.scrollWidth, paneClientWidth: lay.pane.clientWidth, detailScrollWidth: lay.detail.scrollWidth, graphite: graphiteRect };
    record("observation", { id: `${id}:h14a-reproduction`, observed, frozen: frozen && { pane: frozen.pane, assessment: frozen.assessment }, layout: { detail: lay.detail, pane: lay.pane, chain: lay.chain.slice(0, 6) } });
    if (LANG === "en") pre(`${id}:h14a-overflow-reproduced-equal-to-frozen-e4-positive-control`, Boolean(frozen) && observed.paneScrollWidth === frozen.pane.scrollWidth && observed.paneClientWidth === frozen.pane.clientWidth && observed.paneScrollWidth - observed.paneClientWidth === 91
      && graphiteRect.left === 348.91 && graphiteRect.right === 418.06, { observed, frozenPane: frozen?.pane });
    else pre(`${id}:h14a-zh-no-overflow-equal-to-frozen-e4`, Boolean(frozen) && observed.paneScrollWidth === observed.paneClientWidth && frozen.pane.scrollWidth === frozen.pane.clientWidth, { observed, frozenPane: frozen?.pane });
  }
  const probes = await evaluate(`__visual.probeAll(${JSON.stringify(controls)})`);
  await evaluate("(() => { const s = document.querySelector('.module-settings'); if (s) s.scrollLeft = 0; return true; })()");
  const coverage = probes.map((probe) => ({ desc: probe.desc, centerHit: probe.centerHit, allHit: probe.allHit, petPoints: petPoints(probe) }));
  reference.petCoverage[width] = coverage;
  const scrolledAfterProbes = await evaluate("__visual.scrolled()");
  await evaluate("__visual.scrollWindowTo(0)");
  const tb = await evaluate("__visual.topbar()");
  record("before-reference", { id, width, pet, geometry: reference.geometry[width], coverage: coverage.filter((entry) => !entry.allHit), topbar: tb.controls.map(compactProbe), scrolledAfterProbes });
  (reference.topbarBefore ??= {})[width] = Object.fromEntries(tb.controls.map((probe) => [probe.desc, { width: probe.rect.width, height: probe.rect.height }])); // batch 50 addition
  if (width === 768) {
    for (const where of ["top", "end"]) {
      const end = await evaluate(`__visual.scrollSettingsTo(${JSON.stringify(where)})`);
      await delay(250);
      const gate = await evaluate(`__visual.gate("footer:save")`);
      const frozen = frozenE4(`H14-${LANG}-b:${where}:pet-covers-save-and-apply-centre`);
      const centre = gate.hits[0];
      record("observation", { id: `${id}:h14b-${where}`, gate: gateRecord(gate), scroll: end, frozen: frozen && { save: frozen.save, centre: frozen.centre, petUnion: frozen.petUnion } });
      pre(`${id}:h14b-${where}:pet-covers-save-and-apply-centre-equal-to-frozen-e4-positive-control`, Boolean(frozen) && centre.on === "pet:wrap" && isDeepStrictEqual(gate.rect, frozen.save) && centre.x === frozen.centre.x && centre.y === frozen.centre.y
        && isDeepStrictEqual(gate.pet.union, frozen.petUnion), { rect: gate.rect, centre, petUnion: gate.pet.union, frozen: frozen && { save: frozen.save, centre: frozen.centre, petUnion: frozen.petUnion } });
      await captureViewport(`768-pet-on-before-5cd63ff-${where}`, { state: `5cd63ff clean, default-position DesktopPet on, .module-settings at the ${where} of its range (H14 b)`, gate: gateRecord(gate) });
    }
  }
}

// ---------------------------------------------------------------------------------------------------
// Topbar status breakpoint (controller ruling: text where the summary is visible, from 768 px; 761–767 icon only)
// ---------------------------------------------------------------------------------------------------
async function breakpoints() {
  progress("E14 Topbar breakpoints"); // batch 50 addition
  const id = `${LANG}:breakpoints`;
  await seed(seedsOf({ lang: LANG }), id);
  await mountApp(id, { width: 768 });
  await petOff(id, 768);
  await failTopbar("theme", "dark", `${id}:topbar-theme`);
  const results = [];
  for (const width of [760, 761, 767, 768, 1025]) {
    await setViewport(width);
    await parkMouse();
    await evaluate("__visual.scrollWindowTo(0)");
    const tb = await evaluate("__visual.topbar()");
    topbarChecks(`${id}:${width}`, tb, width, { statusExpected: true });
    results.push({ width, height: HEIGHTS[width], status: tb.status?.rect, textVisible: tb.status?.textVisible, summaryVisible: tb.summaryVisible, controls: tb.controls.map((probe) => `${probe.desc}:${probe.rect.width}x${probe.rect.height}`) });
    if (width === 767 || width === 768) {
      const clip = { x: 0, y: 0, width, height: Math.ceil(tb.rect.bottom) + 8 };
      await captureClip(`${width}-topbar-status-breakpoint`, clip, { state: `Topbar with the status at ${width} px: ${width >= 768 ? "text and summary visible" : "icon only, summary hidden"}`, textVisible: tb.status?.textVisible, summaryVisible: tb.summaryVisible });
    }
  }
  record("topbar-breakpoints", { id, results });
}

// ---------------------------------------------------------------------------------------------------
// Disabled Retry all presentation, measured (contract §9; A2.2)
// ---------------------------------------------------------------------------------------------------
async function presentationLoad(id, stored) {
  progress(`E14 presentation ${id}`); // batch 50 addition
  await seed(seedsOf({ lang: LANG, ...stored }), id);
  await mountApp(id, { width: 1440 });
  await petOff(id, 1440);
  const html = await evaluate("__native.html()");
  pre(`${id}:theme-and-tone-applied-from-seeded-bytes`, html.theme === (stored.theme ?? "light") && html.bgTone === (stored.bgTone && stored.bgTone !== "default" ? stored.bgTone : null), { html });
  const pane = await evaluate("__native.pane()");
  pre(`${id}:clean-and-retry-all-disabled`, pane.recovery.length === 0 && pane.retryAll.ariaDisabled === "true", { retryAll: pane.retryAll });
  const colours = await evaluate(`__visual.colours("retry-all")`);
  pre(`${id}:colour-conversions-agree-with-the-browser`, colours.found && Object.values(colours.conversions).every((entry) => entry.agree) && colours.imagesInUsedLayers.length === 0, { conversions: colours.conversions, imagesInUsedLayers: colours.imagesInUsedLayers });
  await cascadeAudit(id, { state: `clean ${stored.theme ?? "light"} ${stored.bgTone ?? "default"}${stored.accentHue !== undefined ? ` accent ${stored.accentHue}` : ""}`, width: 1440 }); // batch 48 addition
  return { colours, html };
}
async function disabledPresentation() {
  const contrast = [];
  for (const theme of ["light", "dark"]) {
    for (const tone of TONES) {
      const id = `${LANG}:presentation:contrast:${theme}:${tone}`;
      const { colours } = await presentationLoad(id, { theme, bgTone: tone });
      contrast.push({ theme, tone, contrast: colours.contrast, label: colours.label255, background: colours.background255, color: colours.computed.color, backgroundColor: colours.computed.backgroundColor, effectiveOpacity: colours.effectiveOpacity });
      checkDeferred(`${id}:label-contrast-at-least-3-to-1`, colours.contrast >= 3, { contrast: colours.contrast, label: colours.label255, background: colours.background255, computed: colours.computed });
      checkDeferred(`${id}:neutral-no-filter-decoration-or-image-cue`, colours.computed.filter === "none" && colours.computed.textDecorationLine === "none" && colours.computed.backgroundImage === "none", { computed: colours.computed });
    }
  }
  record("contrast-table", { lang: LANG, width: 1440, rows: contrast });
  // Accent independence (light theme, default tone): accent absent (165) vs seeded "25".
  const absent = await presentationLoad(`${LANG}:presentation:accent-absent`, { theme: "light", bgTone: "default" });
  const accentProbe = () => evaluate("({ accentHue: getComputedStyle(document.documentElement).getPropertyValue('--accent-hue').trim(), accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() })");
  const absentAccent = await accentProbe();
  const seeded = await presentationLoad(`${LANG}:presentation:accent-25`, { theme: "light", bgTone: "default", accentHue: 25 });
  const seededAccent = await accentProbe();
  const pick = (colours) => ({ color: colours.computed.color, backgroundColor: colours.computed.backgroundColor, borderColor: colours.computed.borderColor });
  record("accent-independence", { absent: { ...pick(absent.colours), accent: absentAccent }, seeded: { ...pick(seeded.colours), accent: seededAccent } });
  pre(`${LANG}:presentation:accent-positive-control-the-accent-changed`, absentAccent.accentHue === "165" && seededAccent.accentHue === "25" && absentAccent.accent !== seededAccent.accent, { absentAccent, seededAccent });
  checkDeferred(`${LANG}:presentation:disabled-colours-equal-with-accent-absent-and-25`, isDeepStrictEqual(pick(absent.colours), pick(seeded.colours)), { absent: pick(absent.colours), seeded: pick(seeded.colours) });
  // Distinction and the same box: clean (disabled) vs one failed sidebar-position write (enabled), same document.
  const id = `${LANG}:presentation:distinction`;
  const clean = await presentationLoad(id, { theme: "light", bgTone: "default" });
  const disabledBox = await evaluate("__visual.retryAllBox()");
  await failPane("railpos:right", ["railPos"], `${id}:rail`);
  await parkMouse();
  await evaluate("__visual.settle()");
  const pane = await evaluate("__native.pane()");
  pre(`${id}:one-failed-sidebar-write-retry-all-enabled`, (pane.retryAll.ariaDisabled === null || pane.retryAll.ariaDisabled === "false") && pane.recovery.length === 1, { retryAll: pane.retryAll });
  const enabled = await evaluate(`__visual.colours("retry-all")`);
  const enabledBox = await evaluate("__visual.retryAllBox()");
  const keys = ["color", "backgroundColor", "borderColor", "opacity"];
  const differing = keys.filter((key) => !isDeepStrictEqual(clean.colours.computed[key], enabled.computed[key]));
  record("distinction", { disabled: clean.colours.computed, enabled: enabled.computed, differing, disabledBox, enabledBox, enabledContrast: enabled.contrast });
  checkDeferred(`${id}:enabled-and-disabled-differ-in-colour-background-border-or-opacity`, differing.length >= 1, { differing });
  const boxKeys = ["width", "height", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "minWidth", "minHeight", "fontSize", "fontWeight"];
  const boxDiff = boxKeys.filter((key) => disabledBox.css[key] !== enabledBox.css[key]);
  checkDeferred(`${id}:same-box-in-both-states-position-size-padding-border-width-and-label`, boxDiff.length === 0 && Math.abs(disabledBox.rect.width - enabledBox.rect.width) <= 0.01 && Math.abs(disabledBox.rect.height - enabledBox.rect.height) <= 0.01, { boxDiff, disabled: disabledBox.css, enabled: enabledBox.css });
}

// ---------------------------------------------------------------------------------------------------
// E14 run
// ---------------------------------------------------------------------------------------------------
async function runVisual() {
  if (selected("css")) bundleCssAudit(cssAudit());
  if (selected("css")) cssFocusRulesAudit(); // batch 50 addition
  if (selected("before")) for (const width of DEV_WIDTHS ?? WIDTHS) await beforeReference(width);
  if (selected("states")) {
    for (const width of DEV_WIDTHS ?? WIDTHS) {
      const list = ["clean", "source-only", "all-seven", "partial-reset", "partial-pass", "topbar-status", ...(width === 768 ? ["open-pass"] : [])];
      for (const state of list) if (selected(`state:${state}`) || !SECTIONS?.some((entry) => entry.startsWith("state:"))) await fixedState(state, width);
    }
  }
  // "Same box" across states at every width: the disabled (clean) and enabled (all seven) Retry all.
  for (const width of WIDTHS) {
    const disabled = reference.disabledBox[`${width}`];
    const enabled = reference.enabledBox[`${width}`];
    if (!disabled || !enabled) continue;
    checkDeferred(`${LANG}:${width}:retry-all-same-box-disabled-clean-and-enabled-all-seven`, Math.abs(disabled.rect.width - enabled.rect.width) <= 0.01 && Math.abs(disabled.rect.height - enabled.rect.height) <= 0.01
      && ["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"].every((key) => disabled.css[key] === enabled.css[key]), { disabled: { rect: disabled.rect, css: disabled.css }, enabled: { rect: enabled.rect, css: enabled.css } });
  }
  // Batch 50 addition (control plane F-APP-1 ruling 2 on 44x44: pre-existing Topbar controls are judged by no regression
  // against 5cd63ff): in the clean state at every width, the fixed Topbar controls are the 5cd63ff set and none is smaller.
  for (const width of DEV_WIDTHS ?? WIDTHS) {
    const before = reference.topbarBefore?.[width];
    const fixed = reference.topbar[width];
    if (!before || !fixed) continue;
    const rows = [...new Set([...Object.keys(before), ...Object.keys(fixed)])].map((desc) => ({ desc, before: before[desc] ?? null, fixed: fixed[desc] ?? null }));
    const regressed = rows.filter((row) => !row.before || !row.fixed || row.fixed.width < row.before.width - 0.01 || row.fixed.height < row.before.height - 0.01);
    const equal = rows.every((row) => row.before && row.fixed && Math.abs(row.fixed.width - row.before.width) <= 0.01 && Math.abs(row.fixed.height - row.before.height) <= 0.01);
    record("topbar-no-regression", { lang: LANG, width, height: HEIGHTS[width], equal, rows });
    checkDeferred(`${LANG}:${width}:topbar:clean-state-pre-existing-controls-are-the-5cd63ff-set-and-none-is-smaller`, rows.length >= 2 && regressed.length === 0, { regressed, rows, equal });
  }
  if (selected("breakpoints")) await breakpoints();
  if (selected("presentation")) await disabledPresentation();
  record("width-table", { lang: LANG, rows: widthTable });
  record("a28-gate-table", { lang: LANG, rows: gateLog });
  // Batch 48 addition: the cascade-order audits of this run, and which Appearance rules matched an element in at least one audited state.
  if (cascadeLog.length) {
    const ruleCount = Math.max(...cascadeLog.map((entry) => entry.appearance.ruleHits?.length ?? 0));
    const matchedSomewhere = Array.from({ length: ruleCount }, (_, index) => cascadeLog.some((entry) => (entry.appearance.ruleHits?.[index] ?? 0) > 0));
    const lastAudit = records.filter((entry) => entry.name === "cascade-audit").at(-1);
    const neverMatched = matchedSomewhere.map((matched, index) => (matched ? null : lastAudit?.appearance?.ruleHits?.[index]?.selector ?? index)).filter((entry) => entry !== null);
    record("cascade-audit-table", { lang: LANG, audits: cascadeLog.length, rows: cascadeLog, appearanceRules: ruleCount, appearanceRulesMatchedInSomeAuditedState: matchedSomewhere.filter(Boolean).length, appearanceRulesNeverMatched: neverMatched,
      totals: { overlaps: cascadeLog.reduce((sum, entry) => sum + (entry.overlapCount ?? 0), 0), reorderChanged: cascadeLog.reduce((sum, entry) => sum + (entry.reorderChanged ?? 0), 0), reorderEntries: cascadeLog.reduce((sum, entry) => sum + (entry.reorderEntries ?? 0), 0) } });
  }
}

// ---------------------------------------------------------------------------------------------------
// E15 keyboard
// ---------------------------------------------------------------------------------------------------
async function kbMount(id, stored, extra = {}) {
  await seed(seedsOf(stored, extra), id);
  await mountApp(id, { width: KEYBOARD_WIDTH });
  await petOff(id, KEYBOARD_WIDTH);
}
const trustedClicks = (events) => events.filter((entry) => entry.type === "click" && entry.trusted);
const keydowns = (events) => events.filter((entry) => entry.type === "keydown");
/** A full Tab cycle from an anchor: every stop, its visible focus, and DOM order (as a rotation of the tabbable list). */
async function tabCycle(id, { anchor = `${PANE} .pane-title`, max = 140 } = {}) {
  await clickAnchor(anchor, `${id}:anchor`);
  const expected = await evaluate("__visual.tabbables()");
  const stops = [];
  let first = null;
  for (let index = 0; index < max; index += 1) {
    await press("Tab");
    const focus = await evaluate("__visual.focusInfo()");
    stops.push(focus);
    if (first === null && !focus.isBody) first = focus.desc;
    else if (focus.desc === first && stops.length > 1) break;
  }
  const descs = stops.slice(0, -1).map((stop) => stop.desc);
  const startIndex = expected.indexOf(first);
  const rotated = startIndex >= 0 ? [...expected.slice(startIndex), ...expected.slice(0, startIndex)] : [];
  const outside = descs.filter((desc) => desc === "body" || desc === "html" || desc === "none");
  const inside = descs.filter((desc) => !(desc === "body" || desc === "html" || desc === "none"));
  record("tab-cycle", { id, width: KEYBOARD_WIDTH, presses: stops.length, stops: stops.map((stop) => (stop.isBody ? "body" : `${stop.desc}|fv:${stop.focusVisible}|${stop.outline.style}:${stop.outline.width}|hit:${stop.centerHit}|over:${stop.overhang}`)), expected: rotated });
  check(`${id}:tab-cycle-completed-and-equals-the-dom-order-of-tabbable-controls`, startIndex >= 0 && stops.at(-1).desc === first && isDeepStrictEqual(inside, rotated) && outside.length <= 1, { first, inside, rotated, outside });
  return { stops: stops.slice(0, -1), inside };
}
function visibleFocusCheck(id, stops) {
  const real = stops.filter((stop) => !stop.isBody);
  const noRing = real.filter((stop) => !(stop.focusVisible === true && stop.outline.style !== "none" && Number.parseFloat(stop.outline.width) >= 2));
  checkDeferred(`${id}:every-stop-focus-visible-with-an-outline-of-at-least-2px`, noRing.length === 0, { noRing: noRing.map((stop) => ({ desc: stop.desc, focusVisible: stop.focusVisible, outline: stop.outline })) });
  const strict = real.filter((stop) => ROW_CONTROLS.includes(stop.desc) || CALLER_TARGET(stop.desc));
  const hidden = strict.filter((stop) => !(stop.outline.style === "solid" && stop.centerHit && stop.inViewport));
  checkDeferred(`${id}:pane-and-status-stops-solid-ring-uncovered-and-in-viewport`, strict.length > 0 && hidden.length === 0, { hidden: hidden.map((stop) => ({ desc: stop.desc, outline: stop.outline, centerHit: stop.centerHit, inViewport: stop.inViewport })) });
  const other = real.filter((stop) => !strict.includes(stop) && !(stop.centerHit && stop.inViewport));
  if (other.length) observe(`${id}:shell-stops-not-centre-hit-or-outside-viewport`, { other: other.map((stop) => ({ desc: stop.desc, centerHit: stop.centerHit, centerTarget: stop.centerTarget, overhang: stop.overhang })) });
}
async function scrollPositiveControl(id) {
  pre(`${id}:scroll-probe-armed`, await evaluate("__visual.armScrollProbe()"));
  await delay(150);
  const before = await evaluate("__visual.scrollState()");
  await press("Space");
  await delay(400);
  const after = await evaluate("__visual.scrollState()");
  pre(`${id}:scroll-probe-disarmed`, await evaluate("__visual.disarmScrollProbe()"));
  const delta = (after.settings?.scrollTop ?? 0) - (before.settings?.scrollTop ?? 0) + (after.window.y - before.window.y);
  const half = Math.min(before.settings?.clientHeight ?? 0, after.settings?.clientHeight ?? 0) / 2;
  record("space-scroll-positive-control", { id, delta, halfScrollport: half, before: before.settings, after: after.settings, window: [before.window, after.window] });
  pre(`${id}:space-on-a-focused-non-interactive-element-scrolls-by-at-least-half-the-scrollport-so-a-page-scroll-would-be-detected`, delta >= half && half > 0, { delta, half, before: before.settings, after: after.settings });
  await evaluate(`__visual.scrollSettingsTo(${before.settings?.scrollTop ?? 0})`);
}
/** One key on the focused control: exactly one click, the expected writes, focus kept; Space never scrolls. */
async function activateOnce(id, key, desc, expectedWrites, { confirm = null } = {}) {
  const focusBefore = await evaluate("__visual.activeDesc()");
  pre(`${id}:${desc}-focused-before-${key}`, focusBefore === desc, { focusBefore });
  // Space-scroll detectability: where the focused control sits at the end of every scroll range, the settings scroller is
  // moved up (script, at most 120 px, the control staying inside the scroller's visible box) so a page scroll could show.
  const spacePrep = key === "Space" ? await evaluate(`(() => {
    const element = document.activeElement;
    const scroller = document.querySelector(".module-settings");
    if (!scroller) return { shift: 0, reason: "no-scroller" };
    const max = scroller.scrollHeight - scroller.clientHeight;
    const pageMax = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scroller.scrollTop < max - 1 || scrollY < pageMax - 1) return { shift: 0, reason: "already-detectable" };
    const rect = element.getBoundingClientRect();
    const box = scroller.getBoundingClientRect();
    const shift = Math.max(0, Math.min(120, Math.floor(Math.min(box.bottom, innerHeight) - rect.bottom - 4)));
    scroller.scrollTo({ top: scroller.scrollTop - shift, behavior: "instant" });
    return { shift, reason: shift > 0 ? "moved-up" : "control-at-the-bottom-edge" };
  })()`) : null;
  const since = await mark();
  const scrollBefore = await evaluate("__visual.scrollState()");
  const focusRectBefore = (await evaluate("__visual.focusInfo()")).rect;
  const dialogsBefore = dialogs.length;
  if (confirm) dialogPlan.push({ accept: confirm.accept, purpose: `${id}: ${confirm.accept ? "accept" : "decline"} Reset by ${key}` });
  await press(key);
  const settleExpr = expectedWrites.length ? `(() => { const w = __native.window(${since}).attempts.filter((e) => e.op === "set" || e.op === "remove"); return w.length >= ${expectedWrites.length} && (__native.pane()?.recovery ?? []).every((b) => !/saving|being reset|正在保存|正在恢复默认/.test(b.text)); })()` : "true";
  await waitUntil(settleExpr, 6000);
  await delay(350);
  const now = await snap(since);
  const scrollAfter = await evaluate("__visual.scrollState()");
  const writes = mutations(now.attempts).map((entry) => `${entry.op}:${entry.key}${entry.value !== undefined ? `=${entry.value}` : ""}:${entry.outcome}`);
  const clicks = trustedClicks(now.events);
  const result = { key, desc, writes, clicks: clicks.length, keydowns: keydowns(now.events).length, focus: now.visualFocus.desc, confirms: dialogs.slice(dialogsBefore).map((entry) => entry.message) };
  record("activation", { id, ...result, scrollBefore: scrollBefore.settings?.scrollTop, scrollAfter: scrollAfter.settings?.scrollTop });
  check(`${id}:${key}-on-${desc}-exactly-one-trusted-click-and-one-keydown`, clicks.length === 1 && keydowns(now.events).length === 1, { clicks: clicks.map((entry) => entry.target), keydowns: keydowns(now.events).length });
  check(`${id}:${key}-on-${desc}-exactly-the-expected-operations`, isDeepStrictEqual([...writes].sort(), [...expectedWrites].sort()), { writes, expectedWrites });
  if (key === "Space") {
    // A Space page scroll moves the scrollport by most of its height (the positive control measures it). Layout changes
    // caused by the activation itself (a density change, a recovery block appearing or leaving) may only clamp the offset
    // to the new range or let scroll anchoring adjust it by a few pixels; the focused control stays where it was.
    const settingsBefore = scrollBefore.settings;
    const settingsAfter = scrollAfter.settings;
    const pageMax = await evaluate("document.documentElement.scrollHeight - document.documentElement.clientHeight");
    const focusRectAfter = (await evaluate("__visual.focusInfo()")).rect;
    const detectable = Boolean(settingsBefore) && (settingsBefore.scrollTop < settingsBefore.maxScrollTop - 1 || scrollBefore.window.y < pageMax - 1);
    const clampOnly = Boolean(settingsBefore) && settingsAfter.scrollTop === Math.min(settingsBefore.scrollTop, settingsAfter.maxScrollTop);
    const half = settingsBefore ? Math.min(settingsBefore.clientHeight, settingsAfter.clientHeight) / 2 : 0;
    const delta = settingsBefore ? settingsAfter.scrollTop - settingsBefore.scrollTop : 0;
    const focusMoved = focusRectBefore && focusRectAfter ? round(focusRectAfter.top - focusRectBefore.top) : null;
    const noPageScroll = isDeepStrictEqual(scrollBefore.window, scrollAfter.window) && (clampOnly || Math.abs(delta) < half) && (focusMoved === null || Math.abs(focusMoved) < half);
    record("space-scroll", { id, desc, prep: spacePrep, detectable, clampOnly, delta, focusMoved, halfScrollport: half, before: settingsBefore, after: settingsAfter, window: [scrollBefore.window, scrollAfter.window] });
    check(`${id}:Space-on-${desc}-does-not-scroll`, noPageScroll, { scrollBefore: settingsBefore, scrollAfter: settingsAfter, delta, focusMoved, detectable, prep: spacePrep });
  }
  if (confirm) check(`${id}:${key}-opens-the-reset-confirmation-exactly-once`, dialogs.length === dialogsBefore + 1 && dialogs.at(-1).message === T.confirmReset, { dialogs: dialogs.slice(dialogsBefore) });
  return { ...result, now };
}
async function kbTabOrder() {
  // Clean: the whole cycle; the pane part is the row controls, Retry all (aria-disabled, a Tab stop), Reset.
  {
    const id = `kb:${LANG}:tab:clean`;
    await kbMount(id, { lang: LANG });
    const { stops, inside } = await tabCycle(id);
    const paneStops = inside.filter((desc) => ROW_CONTROLS.includes(desc) || CALLER_TARGET(desc) || desc.startsWith("footer:"));
    check(`${id}:pane-stops-in-dom-order-retry-all-disabled-is-a-tab-stop-then-reset`, isDeepStrictEqual(paneStops, paneList({}, { drafts: false })), { paneStops });
    check(`${id}:no-topbar-status-stop-in-the-clean-state`, !inside.includes("topbar:status"), {});
    visibleFocusCheck(id, stops);
    await pixelFocusWalk(id, { expectedStops: inside }); // batch 48 addition
  }
  // Drafts: all seven unresolved; the Topbar status is reached before the appearance trigger.
  {
    const id = `kb:${LANG}:tab:drafts`;
    await kbMount(id, { lang: OPPOSITE[LANG], ...NONDEFAULT });
    await setupState(id, "all-seven");
    const { stops, inside } = await tabCycle(id);
    const paneStops = inside.filter((desc) => ROW_CONTROLS.includes(desc) || CALLER_TARGET(desc) && desc !== "topbar:status");
    check(`${id}:pane-stops-in-dom-order-with-recovery-retry-all-export-discard-all-reset`, isDeepStrictEqual(paneStops, paneList(STATE_DEFS["all-seven"].states, { drafts: true })), { paneStops });
    const statusIndex = inside.indexOf("topbar:status");
    const triggerIndex = inside.indexOf("topbar:trigger");
    check(`${id}:topbar-status-is-a-tab-stop-immediately-before-the-appearance-trigger`, statusIndex >= 0 && triggerIndex === statusIndex + 1, { statusIndex, triggerIndex, around: inside.slice(Math.max(0, statusIndex - 2), statusIndex + 3) });
    visibleFocusCheck(id, stops);
    await pixelFocusWalk(id, { expectedStops: inside }); // batch 48 addition
  }
  // Source only: Reload directly after the sidebar-position cards; Retry all (disabled) still a Tab stop.
  {
    const id = `kb:${LANG}:tab:source`;
    await kbMount(id, { lang: LANG }, { [KEY.railPos]: "diagonal" });
    const path = await tabUntil("reset", id);
    const paneStops = path.filter((desc) => ROW_CONTROLS.includes(desc) || CALLER_TARGET(desc));
    check(`${id}:pane-stops-in-dom-order-reload-after-the-sidebar-cards-retry-all-then-reset`, isDeepStrictEqual(paneStops, paneList({ railPos: "unavailable" }, { drafts: false })), { paneStops });
    await pixelFocusWalk(id); // batch 48 addition (a full cycle in the source-only state, incl. Reload)
  }
}
async function kbActivation() {
  const id = `kb:${LANG}:activation`;
  await kbMount(id, { lang: LANG });
  await scrollPositiveControl(id);
  const steps = [
    ["theme:dark", "Space", [`set:${KEY.theme}="dark":ok`]],
    ["theme:system", "Enter", [`set:${KEY.theme}="system":ok`]],
    ["theme:light", "Enter", [`set:${KEY.theme}="light":ok`]],
    ["density:compact", "Enter", [`set:${KEY.density}="compact":ok`]],
    ["density:comfortable", "Space", [`set:${KEY.density}="comfortable":ok`]],
    ["swatch:1", "Space", [`set:${KEY.accentHue}=230:ok`]],
    ["swatch:2", "Enter", [`set:${KEY.accentHue}=35:ok`]],
    ["tone:lavender", "Enter", [`set:${KEY.bgTone}=lavender:ok`, `set:${KEY.accentHue}=295:ok`]],
    ["tone:default", "Space", [`set:${KEY.bgTone}=default:ok`, `set:${KEY.accentHue}=165:ok`]],
    ["railpos:right", "Space", [`set:${KEY.railPos}=right:ok`]],
    ["railpos:left", "Enter", [`set:${KEY.railPos}=left:ok`]],
    [`lang:${OPPOSITE[LANG]}`, "Enter", [`set:${KEY.lang}="${OPPOSITE[LANG]}":ok`]],
    [`lang:${LANG}`, "Space", [`set:${KEY.lang}="${LANG}":ok`]],
  ];
  const results = [];
  for (const [desc, key, writes] of steps) {
    await tabUntil(desc, `${id}:${desc}`);
    const result = await activateOnce(`${id}`, key, desc, writes);
    check(`${id}:${key}-on-${desc}-keeps-focus-on-the-control-and-shows-the-choice`, result.focus === desc && (await evaluate(`(() => { const f = document.activeElement; return f.getAttribute("aria-selected") === "true" || f.classList.contains("active"); })()`)), { focus: result.focus });
    results.push({ desc, key, writes: result.writes, clicks: result.clicks, focus: result.focus });
  }
  record("activation-table", { id, rows: results });
}
async function kbSliders() {
  const id = `kb:${LANG}:sliders`;
  await kbMount(id, { lang: LANG });
  const plan = [
    ["hue-slider", "accentHue", [["ArrowRight", "166"], ["ArrowLeft", "165"], ["Home", "0"], ["End", "360"]], (value) => `${value}°`],
    ["font-slider", "fontScale", [["ArrowRight", "1.05"], ["ArrowLeft", "1"], ["Home", "0.85"], ["End", "1.15"]], (value) => `${Math.round(Number(value) * 100)}%`],
  ];
  const rows = [];
  for (const [desc, field, keys, readout] of plan) {
    await tabUntil(desc, `${id}:${desc}`);
    for (const [key, bytes] of keys) {
      const since = await mark();
      await press(key);
      const done = await waitUntil(`__native.native.get(${JSON.stringify(KEY[field])}) === ${JSON.stringify(bytes)} && __native.pane().recovery.length === 0`, 6000);
      await delay(250);
      const now = await snap(since);
      const writes = mutations(now.attempts).map((entry) => `${entry.op}:${entry.key}=${entry.value}:${entry.outcome}`);
      const inputs = now.events.filter((entry) => entry.type === "input");
      const value = field === "accentHue" ? now.pane.values.accentHue : now.pane.values.fontScale;
      const shown = field === "accentHue" ? now.pane.values.accentReadout : now.pane.values.fontReadout;
      rows.push({ desc, key, writes, inputs: inputs.length, value, shown });
      check(`${id}:${desc}:${key}-is-one-edit-with-exact-bytes`, done && isDeepStrictEqual(writes, [`set:${KEY[field]}=${bytes}:ok`]) && inputs.length === 1 && String(value) === bytes && shown === readout(bytes) && now.visualFocus.desc === desc, { writes, inputs: inputs.length, value, shown, focus: now.visualFocus.desc });
    }
    const final = await bytesOf([KEY[field]]);
    check(`${id}:${desc}:home-and-end-reach-the-bounds-and-the-final-bytes-equal-the-last-value`, final[KEY[field]] === keys.at(-1)[1], { final });
  }
  record("slider-table", { id, rows });
}
async function kbReset() {
  {
    const id = `kb:${LANG}:reset`;
    await kbMount(id, { lang: LANG, theme: "dark", density: "compact" });
    await tabUntil("reset", id, { anchor: fontRowLabel });
    const declined = await activateOnce(`${id}:decline`, "Enter", "reset", [], { confirm: { accept: false } });
    const attemptsAll = declined.now.attempts.filter((entry) => ["get", "set", "remove"].includes(entry.op));
    check(`${id}:declined-zero-get-set-remove-attempts-no-state-change-focus-on-reset`, attemptsAll.length === 0 && declined.now.pane.recovery.length === 0 && declined.focus === "reset" && isDeepStrictEqual(await bytesOf(), rawOf({ lang: LANG, theme: "dark", density: "compact" })), { attempts: brief(attemptsAll), focus: declined.focus });
    const accepted = await activateOnce(`${id}:accept`, "Space", "reset", [`remove:${KEY.theme}:ok`, `remove:${KEY.density}:ok`], { confirm: { accept: true } });
    const restored = await waitUntil(statusLineIs(T.restored), 6000);
    const after = await snap(0);
    check(`${id}:accepted-six-resets-only-the-stored-keys-removed-defaults-restored-focus-on-reset`, restored && after.visualFocus.desc === "reset" && isDeepStrictEqual(after.physical, rawOf({ lang: LANG })) && after.pane.recovery.length === 0, { focus: after.visualFocus.desc, physical: after.physical, statusLine: after.pane.statusLine });
    record("reset-keyboard", { id, declined: declined.writes, accepted: accepted.writes });
  }
  {
    const id = `kb:${LANG}:reset-partial`;
    await kbMount(id, { lang: LANG, theme: "dark", railPos: "right" });
    await evaluate(`__native.denyRemove(${JSON.stringify(KEY.railPos)})`);
    await tabUntil("reset", id, { anchor: fontRowLabel });
    await activateOnce(id, "Enter", "reset", [`remove:${KEY.theme}:ok`, `remove:${KEY.railPos}:denied`], { confirm: { accept: true } });
    const settled = await waitUntil(recoveryIs(blocks({ railPos: "not-reset" })), 6000);
    const after = await snap(0);
    check(`${id}:partial-reset-by-keyboard-focus-stays-on-reset-no-restored-claim`, settled && after.visualFocus.desc === "reset" && !SUCCESS_LINES.includes(after.pane.statusLine.text), { focus: after.visualFocus.desc, statusLine: after.pane.statusLine });
  }
}
async function kbFocusTargets() {
  // Discard (Enter and Space) -> the field's selected control or its slider.
  {
    const id = `kb:${LANG}:discard`;
    await kbMount(id, { lang: LANG });
    await failPane("density:compact", ["density"], `${id}:density`);
    await failPane("swatch:1", ["accentHue"], `${id}:accent`);
    await tabUntil("discard:density", id);
    const first = await activateOnce(`${id}:density`, "Enter", "discard:density", []);
    check(`${id}:discard-by-enter-focus-on-the-selected-density-segment`, first.focus === "density:comfortable" && !first.now.pane.recovery.some((entry) => entry.id === "density"), { focus: first.focus });
    await tabUntil("discard:accentHue", id);
    const second = await activateOnce(`${id}:accent`, "Space", "discard:accentHue", []);
    check(`${id}:discard-by-space-focus-on-the-hue-slider`, second.focus === "hue-slider" && second.now.pane.recovery.length === 0, { focus: second.focus });
  }
  // Retry: a failing Retry keeps focus on the button; a successful one returns focus to the selected card.
  {
    const id = `kb:${LANG}:retry`;
    await kbMount(id, { lang: LANG });
    await failPane("theme:dark", ["theme"], `${id}:theme`);
    await tabUntil("retry:theme", id);
    const failing = await activateOnce(`${id}:still-failing`, "Space", "retry:theme", [`set:${KEY.theme}="dark":denied`]);
    check(`${id}:a-retry-that-fails-again-keeps-focus-on-the-retry-button`, failing.focus === "retry:theme" && failing.now.pane.recovery.length === 1, { focus: failing.focus });
    await evaluate(`__native.allowSet(${JSON.stringify(KEY.theme)})`);
    const success = await activateOnce(`${id}:success`, "Enter", "retry:theme", [`set:${KEY.theme}="dark":ok`]);
    await waitUntil("__native.pane().recovery.length === 0", 4000);
    const after = await snap(0);
    check(`${id}:successful-retry-unmounts-the-block-and-returns-focus-to-the-selected-theme-card`, after.visualFocus.desc === "theme:dark" && after.pane.recovery.length === 0, { focus: after.visualFocus.desc, success: success.writes });
  }
  // Reload: unrepaired keeps the alert; repaired clears it; focus on the selected sidebar card both times.
  {
    const id = `kb:${LANG}:reload`;
    await kbMount(id, { lang: LANG }, { [KEY.railPos]: "diagonal" });
    await tabUntil("reload:railPos", id);
    const first = await activateOnce(`${id}:unrepaired`, "Enter", "reload:railPos", []);
    check(`${id}:reload-unrepaired-keeps-the-alert-focus-on-the-selected-sidebar-card`, first.focus === "railpos:left" && isDeepStrictEqual(first.now.pane.recovery, blocks({ railPos: "unavailable" })) && first.now.physical[KEY.railPos] === "diagonal", { focus: first.focus });
    await evaluate(`__native.native.set(${JSON.stringify(KEY.railPos)}, "top")`);
    await tabUntil("reload:railPos", id, { anchor: null });
    const second = await activateOnce(`${id}:repaired`, "Space", "reload:railPos", []);
    await waitUntil("__native.pane().recovery.length === 0", 4000);
    const after = await snap(0);
    check(`${id}:reload-repaired-clears-the-alert-no-saved-claim-focus-on-the-selected-sidebar-card`, after.visualFocus.desc === "railpos:top" && after.pane.recovery.length === 0 && !SUCCESS_LINES.includes(after.pane.statusLine.text), { focus: after.visualFocus.desc, statusLine: after.pane.statusLine, second: second.writes });
  }
  // Discard all -> Reset to defaults, inside the pane, never <body>.
  {
    const id = `kb:${LANG}:discard-all`;
    await kbMount(id, { lang: LANG });
    await failPane("theme:dark", ["theme"], `${id}:theme`);
    await failPane("density:compact", ["density"], `${id}:density`);
    await tabUntil("discard-all", id, { anchor: fontRowLabel });
    const result = await activateOnce(id, "Enter", "discard-all", []);
    const after = await snap(0);
    check(`${id}:discard-all-focus-on-reset-inside-the-pane-never-body`, after.visualFocus.desc === "reset" && after.visualFocus.inPane && !after.visualFocus.isBody && after.pane.recovery.length === 0, { focus: after.visualFocus, writes: result.writes });
  }
}
/** Shift+Tab away from Retry all and Tab back: it is a Tab stop in the current state (no state change, zero writes). */
async function tabAwayAndBack(id, state, disabled) {
  const since = await mark();
  await press("ShiftTab");
  const away = await evaluate("__visual.activeDesc()");
  await press("Tab");
  const back = await evaluate("__visual.focusInfo()");
  const now = await snap(since);
  check(`${id}:retry-all-is-a-tab-stop-in-the-${state}-state`, away === "font-slider" && back.desc === "retry-all" && back.ariaDisabled === (disabled ? "true" : null) && !back.disabledAttr && back.focusVisible && mutations(now.attempts).length === 0,
    { away, back, writes: brief(mutations(now.attempts)) });
}
async function kbRetryAll() {
  // Disabled states: clean, pending only (held behind the real lock), source only: Tab stop; Enter and Space inert, focus kept, no scroll.
  for (const state of ["clean", "pending", "source"]) {
    const id = `kb:${LANG}:retry-all:disabled-${state}`;
    await kbMount(id, { lang: LANG }, state === "source" ? { [KEY.railPos]: "diagonal" } : {});
    if (state === "pending") {
      await evaluate(`__native.hold(${JSON.stringify(LOCK_OF("theme"))})`);
      await clickDesc("theme:dark", `${id}:pane-dark`);
      pre(`${id}:pending-only`, await waitUntil(recoveryIs(blocks({ theme: "saving" })), 4000));
    }
    await tabUntil("retry-all", id, { anchor: fontRowLabel });
    for (const key of ["Enter", "Space"]) {
      const result = await activateOnce(`${id}`, key, "retry-all", []);
      check(`${id}:${key}-on-the-disabled-button-inert-focus-kept-no-state-change`, result.focus === "retry-all" && result.now.pane.retryAll.ariaDisabled === "true" && appLocks(result.now.locks).length === 0 && !SUCCESS_LINES.includes(result.now.pane.statusLine.text), { focus: result.focus, retryAll: result.now.pane.retryAll, locks: result.now.locks });
    }
    if (state === "pending") {
      await evaluate(`__native.release(${JSON.stringify(LOCK_OF("theme"))})`);
      pre(`${id}:released-and-saved`, await waitUntil(`${statusLineIs(T.saved)} && __native.pane().recovery.length === 0`, 6000));
    }
  }
  // Enter starts one pass; full success; focus stays on the now-disabled button (never <body>, never Reset).
  {
    const id = `kb:${LANG}:retry-all:enter-full-success`;
    await kbMount(id, { lang: LANG });
    await failPane("theme:dark", ["theme"], `${id}:theme`);
    await failPane("density:compact", ["density"], `${id}:density`);
    await evaluate("__native.restore()");
    await tabUntil("retry-all", id, { anchor: fontRowLabel });
    await evaluate("__native.startFrames()");
    const result = await activateOnce(id, "Enter", "retry-all", [`set:${KEY.theme}="dark":ok`, `set:${KEY.density}="compact":ok`]);
    await waitUntil(statusLineIs(T.saved), 6000);
    const frames = await evaluate("__native.stopFrames()");
    const after = await snap(0);
    check(`${id}:one-pass-one-attempt-per-member-saved-focus-on-the-disabled-retry-all`, after.visualFocus.desc === "retry-all" && after.pane.retryAll.ariaDisabled === "true" && after.pane.retryAll.describedBy === null && after.pane.statusLine.text === T.saved && after.topbar.status === null,
      { focus: after.visualFocus, retryAll: after.pane.retryAll, statusLine: after.pane.statusLine, writes: result.writes });
    check(`${id}:focus-never-on-body-in-any-frame`, frames.length > 0 && frames.every((frame) => frame.focus && !frame.focus.isBody && frame.focus.testid === "appearance-retry-all"), { frames: frames.length, bad: frames.filter((frame) => !frame.focus || frame.focus.isBody || frame.focus.testid !== "appearance-retry-all").slice(0, 3) });
  }
  // Space starts one pass; partial result; focus stays on the enabled button.
  {
    const id = `kb:${LANG}:retry-all:space-partial`;
    await kbMount(id, { lang: LANG });
    await failPane("swatch:1", ["accentHue"], `${id}:accent`);
    await failPane("railpos:right", ["railPos"], `${id}:rail`);
    await evaluate(`__native.allowSet(${JSON.stringify(KEY.railPos)})`);
    await tabUntil("retry-all", id, { anchor: fontRowLabel });
    const result = await activateOnce(id, "Space", "retry-all", [`set:${KEY.accentHue}=230:denied`, `set:${KEY.railPos}=right:ok`]);
    await waitUntil(statusLineIs(T.count(1)), 6000);
    const after = await snap(0);
    check(`${id}:partial-result-count-line-focus-on-the-enabled-retry-all-topbar-status`, after.visualFocus.desc === "retry-all" && (after.pane.retryAll.ariaDisabled === null || after.pane.retryAll.ariaDisabled === "false") && after.pane.statusLine.text === T.count(1) && after.topbar.status !== null,
      { focus: after.visualFocus, retryAll: after.pane.retryAll, statusLine: after.pane.statusLine, writes: result.writes });
  }
  // A second Enter and Space while a member is pending add zero attempts; the open pass (E empty) is disabled.
  {
    const id = `kb:${LANG}:retry-all:second-activation-while-pending`;
    await kbMount(id, { lang: LANG });
    await failPane("theme:dark", ["theme"], `${id}:theme`);
    await failPane("tone:lavender", ["bgTone", "accentHue"], `${id}:background`);
    await evaluate("__native.restore()");
    await evaluate(`__native.hold(${JSON.stringify(LOCK_OF("theme"))})`);
    await tabUntil("retry-all", id, { anchor: fontRowLabel });
    const first = await activateOnce(id, "Enter", "retry-all", [`set:${KEY.bgTone}=lavender:ok`, `set:${KEY.accentHue}=295:ok`]);
    const open = await waitUntil(`${statusLineIs(T.retrying)} && ${recoveryIs(blocks({ theme: "saving" }))}`, 6000);
    check(`${id}:pass-open-member-held-retry-all-disabled-described-by-the-in-flight-line`, open && (await evaluate("__native.pane().retryAll.ariaDisabled === 'true' && __native.pane().retryAll.describedByStatusLine")), { first: first.writes });
    for (const key of ["Enter", "Space"]) {
      const again = await activateOnce(`${id}:again`, key, "retry-all", []);
      check(`${id}:${key}-while-pending-adds-zero-attempts-focus-kept`, again.focus === "retry-all" && appLocks(again.now.locks).length === 0, { focus: again.focus, locks: again.now.locks });
    }
    await tabAwayAndBack(id, "open-pass-disabled", true);
    await evaluate(`__native.release(${JSON.stringify(LOCK_OF("theme"))})`);
    await waitUntil(statusLineIs(T.saved), 6000);
    const after = await snap(0);
    check(`${id}:held-member-written-once-after-release-focus-on-retry-all`, after.visualFocus.desc === "retry-all" && after.physical[KEY.theme] === '"dark"' && after.pane.statusLine.text === T.saved, { focus: after.visualFocus.desc, physical: after.physical });
  }
  // Open pass whose only member is held with the fault armed: disabled while open; enabled after the failure; focus stays.
  {
    const id = `kb:${LANG}:retry-all:open-pass-then-newly-failed`;
    await kbMount(id, { lang: LANG });
    await failPane("theme:dark", ["theme"], `${id}:theme`);
    await evaluate(`__native.hold(${JSON.stringify(LOCK_OF("theme"))})`);
    await tabUntil("retry-all", id, { anchor: fontRowLabel });
    await activateOnce(id, "Enter", "retry-all", []);
    const open = await waitUntil(`${statusLineIs(T.retrying)} && __native.pane().retryAll.ariaDisabled === "true"`, 6000);
    const during = await snap(0);
    check(`${id}:open-pass-disabled-focus-kept`, open && during.visualFocus.desc === "retry-all", { focus: during.visualFocus.desc });
    await tabAwayAndBack(id, "open-pass-disabled", true);
    await evaluate(`__native.release(${JSON.stringify(LOCK_OF("theme"))})`);
    const failed = await waitUntil(`${statusLineIs(T.count(1))} && __native.pane().retryAll.ariaDisabled === null`, 6000);
    const after = await snap(0);
    check(`${id}:member-fails-again-retry-all-enabled-focus-stays-count-line-describes-it`, failed && after.visualFocus.desc === "retry-all" && after.pane.retryAll.describedByStatusLine && opsOn(after.attempts, "set", KEY.theme).filter((entry) => entry.outcome === "denied").length === 2,
      { focus: after.visualFocus.desc, retryAll: after.pane.retryAll });
    await tabAwayAndBack(id, "newly-failed-enabled", false);
  }
}
/** A trusted click on the Topbar's own background (not a control): the sequential focus starting point before the search box. */
async function clickTopbarBackground(label) {
  const point = await evaluate(`(() => {
    const header = document.querySelector("header.topbar");
    const rect = header.getBoundingClientRect();
    const search = header.querySelector(".search-box").getBoundingClientRect();
    const controls = header.querySelector(".topbar-controls").getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    const candidates = [[(search.right + controls.left) / 2, y], [rect.left + 3, y], [search.left + 4, rect.top + 2], [rect.right - 3, y]];
    for (const [x, yy] of candidates) { const hit = document.elementFromPoint(x, yy); if (hit === header) return { x, y: yy }; }
    return null;
  })()`);
  pre(`${label}:topbar-background-point`, point !== null, {});
  await input("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await input("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await input("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(80);
  const focus = await evaluate("__visual.focusInfo()");
  pre(`${label}:topbar-background-click-focuses-nothing`, focus.isBody, { focus });
  return point;
}
async function kbTopbarStatus() {
  const id = `kb:${LANG}:topbar-status`;
  await kbMount(id, { lang: LANG });
  await failTopbar("theme", "dark", `${id}:topbar-theme`);
  await clickDesc(`rail:${labels[LANG].tasks}`, `${id}:rail-tasks`);
  pre(`${id}:on-app-tasks`, await waitUntil(`verify.location().pathname === "/app/tasks" && ${topbarStatusIs(true)}`, 6000));
  for (const key of ["Enter", "Space"]) {
    if (key === "Space") {
      await clickDesc(`rail:${labels[LANG].tasks}`, `${id}:rail-tasks-again`);
      pre(`${id}:back-on-app-tasks`, await waitUntil(`verify.location().pathname === "/app/tasks" && ${topbarStatusIs(true)}`, 6000));
    }
    await clickTopbarBackground(`${id}:${key}`);
    const path = await tabUntil("topbar:status", `${id}:${key}`, { anchor: null, max: 6 });
    check(`${id}:${key}:status-reached-by-tab-after-the-search-box-and-before-the-trigger`, isDeepStrictEqual(path, ["topbar:search", "topbar:status"]), { path });
    const focus = await evaluate("__visual.focusInfo()");
    check(`${id}:${key}:status-focus-visible`, focus.focusVisible && focus.outline.style === "solid" && Number.parseFloat(focus.outline.width) >= 2 && focus.centerHit && focus.inViewport, { focus });
    const since = await mark();
    await press(key);
    const arrived = await waitUntil(`verify.location().pathname === "/app/settings/appearance" && ${READY_PANE}`, 6000);
    await delay(400);
    const now = await snap(since);
    check(`${id}:${key}:navigates-exactly-once-to-the-appearance-pane-zero-storage-writes`, arrived && counters(now).push === 1 && counters(now).commits === 1 && trustedClicks(now.events).length === 1 && sevenMutations(now.attempts).length === 0,
      { counters: counters(now), clicks: trustedClicks(now.events).length, writes: brief(sevenMutations(now.attempts)) });
  }
  // The popover keeps its keyboard behaviour: Enter on the trigger opens it, Escape closes it.
  await clickTopbarBackground(`${id}:popover`);
  const triggerPath = await tabUntil("topbar:trigger", `${id}:popover`, { anchor: null, max: 6 });
  check(`${id}:tab-order-search-status-trigger`, isDeepStrictEqual(triggerPath, ["topbar:search", "topbar:status", "topbar:trigger"]), { triggerPath });
  await press("Enter");
  const opened = await waitUntil("__native.topbar().open", 3000);
  await press("Escape");
  const closed = await waitUntil("!__native.topbar().open", 3000);
  check(`${id}:popover-opens-by-enter-and-escape-closes-it`, opened && closed, {});
}
/**
 * Visible focus by pixels (fixed and 5cd63ff): the control focused by a trusted Tab, then unfocused by one more Tab,
 * each captured in a clip around the control (10 px margin, control-relative). Identical PNGs mean that focus has no
 * visible indicator. The hue slider and Retry all (global 2 px outline) are the positive controls.
 */
async function kbFocusVisibility() {
  const rows = [];
  for (const variant of ["fixed", "before"]) {
    const id = `kb:${LANG}:focus-visibility:${variant === "fixed" ? "419e56d" : "5cd63ff"}`;
    await seed(seedsOf({ lang: LANG }), id);
    await mountApp(id, { width: KEYBOARD_WIDTH, variant });
    await petOff(id, KEYBOARD_WIDTH);
    const targets = ["hue-slider", "font-slider"];
    for (const desc of targets) {
      await tabUntil(desc, `${id}:${desc}`);
      const focused = await evaluate("__visual.focusInfo()");
      const clipOf = (rect) => ({ x: Math.floor(rect.left) - 10, y: Math.floor(rect.top) - 10, width: Math.ceil(rect.width) + 20, height: Math.ceil(rect.height) + 20 });
      const focusedClip = clipOf(focused.rect);
      const focusedShot = await captureClip(`${variant === "fixed" ? "419e56d" : "before-5cd63ff"}-${desc}-focused`, focusedClip, { state: `${desc} focused by a trusted Tab (${variant === "fixed" ? "fixed 419e56d" : "5cd63ff"}, pet hidden)`, focus: focused });
      // Context for the manual review: the whole SettingRow around the focused control (still focused).
      const row = await evaluate(`(() => { const r = document.activeElement.closest(".setting-row").getBoundingClientRect(); return { x: Math.max(0, Math.floor(r.left) - 8), y: Math.max(0, Math.floor(r.top) - 8), width: Math.ceil(r.width) + 16, height: Math.ceil(r.height) + 16 }; })()`);
      await captureClip(`${variant === "fixed" ? "419e56d" : "before-5cd63ff"}-${desc}-focused-row`, row, { state: `the ${desc === "font-slider" ? "Font scale" : "Accent color"} row with ${desc} focused by a trusted Tab (${variant === "fixed" ? "fixed 419e56d" : "5cd63ff"}, pet hidden)`, focus: await evaluate("__visual.focusInfo()") });
      await press("Tab");
      let moved = await evaluate(`__visual.probe(${JSON.stringify(desc)}, false)`);
      if (!moved.inViewport) moved = await evaluate(`__visual.probe(${JSON.stringify(desc)})`);
      const after = await evaluate("__visual.focusInfo()");
      const fraction = (value) => Math.round((value - Math.floor(value)) * 100) / 100;
      pre(`${id}:${desc}:unfocused-capture-is-control-relative-and-the-focus-moved-on`, after.desc !== desc && fraction(moved.rect.left) === fraction(focused.rect.left) && fraction(moved.rect.top) === fraction(focused.rect.top), { focused: focused.rect, moved: moved.rect, after: after.desc });
      const unfocusedShot = await captureClip(`${variant === "fixed" ? "419e56d" : "before-5cd63ff"}-${desc}-unfocused`, clipOf(moved.rect), { state: `${desc} after focus moved on to ${after.desc} (${variant === "fixed" ? "fixed 419e56d" : "5cd63ff"}, pet hidden)` });
      const identical = focusedShot.sha256 === unfocusedShot.sha256;
      rows.push({ variant, desc, focusVisible: focused.focusVisible, outline: focused.outline, focusedPng: focusedShot.sha256, unfocusedPng: unfocusedShot.sha256, pixelIdentical: identical });
      if (variant === "fixed") {
        if (desc === "font-slider") checkDeferred(`${id}:font-slider-focus-is-visible-pixels-differ-when-focused`, !identical && focused.outline.style !== "none", { focusVisible: focused.focusVisible, outline: focused.outline, pixelIdentical: identical });
        else pre(`${id}:${desc}:positive-control-focus-ring-changes-the-pixels`, !identical && focused.outline.style === "solid", { outline: focused.outline, pixelIdentical: identical });
      } else {
        observe(`${id}:${desc}:5cd63ff-reference`, { focusVisible: focused.focusVisible, outline: focused.outline, pixelIdentical: identical });
      }
    }
  }
  record("focus-visibility-table", { lang: LANG, width: KEYBOARD_WIDTH, rows });
}
// ---------------------------------------------------------------------------------------------------
// Batch 48 addition: visible focus by pixels at EVERY Tab stop (E15; the F-APP-1 ruling's oracle: "每个停靠点都有可见焦点：
// 计算出的 outline 不为 none，且聚焦与未聚焦的截图像素不同"). A second full Tab cycle per state captures each stop focused
// and again after focus moved on (both with the stop scrolled to the same place by script; focus is only moved by
// trusted Tab; each capture a stable frame). The decoded pixels are compared inside the stop's OWN region, its outline
// band (offset .. offset + width, 2 px tolerance each side) plus its own box, excluding the area of the next stop's ring,
// so a neighbour's ring cannot pass for this one. The band alone is also recorded; a stop whose own region has no
// comparable pixel is a harness failure (precondition), never a pass.
// ---------------------------------------------------------------------------------------------------
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
  progress(`E15 pixel walk ${id}`); // batch 50 addition
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
/**
 * Batch 48 reproduction of the per-stop oracle's finding: the SELECTED accent swatch shows no visible focus. Source (read,
 * not changed): `.accent-sw.active { outline: 2px solid var(--text-1); outline-offset: 2px }`, specificity (0,2,0), in
 * plugin-web-tokens layout.css:1437–1440 and in the Appearance stylesheet styles.css:116–119 (both unchanged since 5cd63ff),
 * outranks the global `button:focus-visible` ring (0,1,1) of tokens.css:246–253, so the focused selected swatch keeps its
 * selection ring. Each case: a trusted Tab to the swatch and a control-relative clip (pet hidden, stable frame); trusted
 * Shift+Tab until focus leaves the swatch row (density:compact), so no other swatch's ring or repaint is in the clip; the
 * same clip again (stable frame); decoded pixels compared over the whole clip and inside the swatch's own ring band.
 * Non-selected swatches are positive controls.
 */
async function kbSelectedSwatchFocus() {
  const cases = [
    { variant: "fixed", stored: {}, selected: "swatch:0", other: "swatch:1", label: short },
    { variant: "fixed", stored: { accentHue: 230 }, selected: "swatch:1", other: "swatch:2", label: `${short}-accent-230` },
    { variant: "before", stored: {}, selected: "swatch:0", other: "swatch:1", label: "before-5cd63ff" },
  ];
  const rows = [];
  for (const entry of cases) {
    const id = `kb:${LANG}:selected-swatch-focus:${entry.label}`;
    await seed(seedsOf({ lang: LANG, ...entry.stored }), id);
    await mountApp(id, { width: KEYBOARD_WIDTH, variant: entry.variant });
    await petOff(id, KEYBOARD_WIDTH);
    pre(`${id}:pixel-helper-installed`, ["installed", "present"].includes(await evaluate(B48_PAGE_HELPER)));
    for (const desc of [entry.selected, entry.other]) {
      const isSelected = desc === entry.selected;
      await tabUntil(desc, `${id}:${desc}`);
      await parkMouse();
      const focus = await evaluate("__visual.focusInfo()");
      const activeClass = await evaluate(`document.activeElement.classList.contains("active")`);
      pre(`${id}:${desc}:is-${isSelected ? "the-selected" : "a-non-selected"}-swatch`, activeClass === isSelected, { activeClass, focus: focus.desc });
      const first = await evaluate(`__b48.placeFocused(${PIXEL_MARGIN})`);
      const focusedShot = await stableViewportClip(first.clip);
      const rowClip = await evaluate(`(() => { const r = document.activeElement.closest(".setting-row").getBoundingClientRect(); return { x: Math.max(0, Math.floor(r.left) - 8), y: Math.max(0, Math.floor(r.top) - 8), width: Math.ceil(r.width) + 16, height: Math.ceil(r.height) + 16 }; })()`);
      const rowShot = await stableViewportClip(rowClip);
      // Trusted Shift+Tab until focus leaves the swatch row (to density:compact, the control before it): no other
      // swatch's ring or repaint is then inside the compared clip.
      const backPath = [];
      for (let presses = 0; presses < 7; presses += 1) {
        await press("ShiftTab");
        const now = await evaluate("__visual.activeDesc()");
        backPath.push(now);
        if (!now.startsWith("swatch:")) break;
      }
      const after = await evaluate("__visual.focusInfo()");
      const again = await evaluate(`__b48.placeAgain(${PIXEL_MARGIN})`);
      const unfocusedOutline = await evaluate("(() => { const element = window.__b48.stopElement; const s = getComputedStyle(element); return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor, offset: s.outlineOffset, focused: document.activeElement === element, focusVisible: element.matches(':focus-visible') }; })()");
      const aligned = again.ok && !again.stillFocused && isDeepStrictEqual(again.clip, first.clip) && again.hovered === first.hovered
        && ["left", "top", "right", "bottom"].every((side) => Math.abs(again.rect[side] - first.rect[side]) < 0.01);
      pre(`${id}:${desc}:focus-moved-out-of-the-swatch-row-by-trusted-shift-tab-and-the-second-capture-is-aligned`, aligned && after.desc === "density:compact" && !unfocusedOutline.focused, { first: { rect: first.rect, clip: first.clip, hovered: first.hovered }, again: { rect: again.rect, clip: again.clip, hovered: again.hovered, stillFocused: again.stillFocused }, backPath });
      const movedShot = await stableViewportClip(again.clip);
      pre(`${id}:${desc}:both-captures-are-stable-frames`, focusedShot.stable && movedShot.stable, { attempts: [focusedShot.attempts, movedShot.attempts] });
      const comparison = compareFocusBand(focusedShot.buffer, movedShot.buffer, first, again);
      const decodedIdentical = rgbaSha256(decodePng(focusedShot.buffer)) === rgbaSha256(decodePng(movedShot.buffer));
      const tag = `${entry.label}-${desc.replace(":", "-")}`;
      const what = `${desc} (${isSelected ? "the selected swatch" : "a non-selected swatch"}; ${entry.variant === "fixed" ? `fixed ${short}` : "5cd63ff"}${entry.stored.accentHue !== undefined ? `, xai_accent_hue ${entry.stored.accentHue}` : ""}; pet hidden)`;
      const saved = {
        focused: (await saveShot(`swatch-${tag}-focused`, focusedShot.base64, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: first.clip, pageOffset: focusedShot.offset, state: `${what} focused by a trusted Tab`, focus })).file,
        row: (await saveShot(`swatch-${tag}-focused-row`, rowShot.base64, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: rowClip, pageOffset: rowShot.offset, state: `the Accent color row with ${what} focused by a trusted Tab` })).file,
        movedBack: (await saveShot(`swatch-${tag}-focus-moved-back`, movedShot.base64, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: again.clip, pageOffset: movedShot.offset, state: `${what} after trusted Shift+Tab (${backPath.length}x, via ${backPath.join(" > ")}) moved focus out of the swatch row to ${after.desc}` })).file,
      };
      const visible = !decodedIdentical && comparison.ownDiff > 0 && focus.outline.style !== "none";
      const row = { variant: entry.variant, stored: entry.stored, desc, selected: isSelected, focusVisible: focus.focusVisible, focusedOutline: focus.outline, unfocusedOutline, movedTo: after.desc, backPath, captures: { focused: focusedShot.attempts, movedBack: movedShot.attempts }, decodedIdentical, ...comparison, focusedPng: sha256(focusedShot.buffer), movedBackPng: sha256(movedShot.buffer), saved, visible };
      rows.push(row);
      const details = { focusedOutline: focus.outline, unfocusedOutline, decodedIdentical, bandPixels: comparison.bandPixels, bandDiff: comparison.bandDiff, ownPixels: comparison.ownPixels, ownDiff: comparison.ownDiff, totalDiff: comparison.totalDiff, excluded: comparison.excluded, movedTo: after.desc };
      if (entry.variant === "fixed") {
        if (isSelected) checkDeferred(`${id}:${desc}:selected-swatch-focus-is-visible-pixels-differ-in-its-own-ring-or-box`, visible, details);
        else pre(`${id}:${desc}:positive-control-non-selected-swatch-focus-ring-changes-the-pixels`, visible, details);
      } else observe(`${id}:${desc}:5cd63ff-reference`, details);
    }
  }
  record("selected-swatch-focus-table", { lang: LANG, width: KEYBOARD_WIDTH, rows });
}

// ---------------------------------------------------------------------------------------------------
// Batch 50 additions to E15 (control plane batch 50 "E15"; F-APP-2 ruling 2 "修复要求" and 4 "修复后的 E15"; F-APP-3
// ruling 1). Every user-facing step is trusted input (Tab, Shift+Tab, Enter, clicks); stores, faults and placement are
// script, as in batch 48. The per-stop oracle is batch 48's pixelFocusWalk, unchanged.
// ---------------------------------------------------------------------------------------------------
/** Page helper (a JS global only; no DOM change): pane selection state, computed style facts, colour conversion. */
const B50_PAGE_HELPER = `(() => {
  if (window.__b50) return "present";
  const PANE = ${JSON.stringify(PANE)};
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const rgba = (css) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "rgba(0, 0, 0, 0)";
    context.fillStyle = css;
    context.fillRect(0, 0, 1, 1);
    const data = context.getImageData(0, 0, 1, 1).data;
    return [data[0], data[1], data[2], data[3]];
  };
  const factsOf = (element) => {
    if (!element || !element.isConnected) return null;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      focused: document.activeElement === element, focusVisible: element.matches(":focus-visible"),
      outline: { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor, offset: style.outlineOffset },
      boxShadow: style.boxShadow, backgroundColor: style.backgroundColor, color: style.color, fontWeight: style.fontWeight, borderRadius: style.borderTopLeftRadius, borderWidth: style.borderTopWidth,
      ariaChecked: element.getAttribute("aria-checked"), ariaSelected: element.getAttribute("aria-selected"), active: element.classList.contains("active"),
      rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
    };
  };
  window.__b50 = {
    /** Selected pane controls (DOM order equals __visual.paneControls()), the slider values and the applied theme. */
    selection() {
      const pane = document.querySelector(PANE);
      if (!pane) return null;
      const descs = window.__visual.paneControls();
      const elements = Array.from(pane.querySelectorAll("button, input"));
      const selected = [];
      elements.forEach((element, index) => {
        if (element.classList.contains("active") || element.getAttribute("aria-selected") === "true" || element.getAttribute("aria-checked") === "true" || element.getAttribute("aria-pressed") === "true") selected.push(descs[index]);
      });
      const slider = (field) => { const input = pane.querySelector('[data-appearance-control="' + field + '"] input[type="range"]'); return input ? input.value : null; };
      return { selected, sliders: { hue: slider("accentHue"), font: slider("fontScale") }, aligned: descs.length === elements.length, theme: document.documentElement.getAttribute("data-theme") };
    },
    facts(which) { return factsOf(which === "stop" ? window.__b48 && window.__b48.stopElement : document.activeElement); },
    rgba(css) { return rgba(css); },
    /** The open Topbar popover's box with a margin, clamped to the viewport (viewport coordinates). */
    panelClip(margin) {
      const panel = document.querySelector(".topbar #topbar-pref-panel");
      if (!panel) return null;
      const rect = panel.getBoundingClientRect();
      const x0 = Math.max(0, Math.floor(rect.left) - margin);
      const y0 = Math.max(0, Math.floor(rect.top) - margin);
      const x1 = Math.min(innerWidth, Math.ceil(rect.right) + margin);
      const y1 = Math.min(innerHeight, Math.ceil(rect.bottom) + margin);
      return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
    },
  };
  return "installed";
})()`;
async function installB50(id) {
  pre(`${id}:pixel-helper-installed`, ["installed", "present"].includes(await evaluate(B48_PAGE_HELPER)));
  pre(`${id}:batch-50-helper-installed`, ["installed", "present"].includes(await evaluate(B50_PAGE_HELPER)));
}
/** The visual viewport is unzoomed (scale 1, full width), so every capture shows the page as laid out. */
async function unzoomedPrecondition(id) {
  const viewport = await evaluate("({ scale: visualViewport.scale, width: visualViewport.width, innerWidth, pageLeft: visualViewport.pageLeft })");
  pre(`${id}:visual-viewport-unzoomed`, viewport.scale === 1 && viewport.width === viewport.innerWidth && viewport.pageLeft === 0, { viewport });
}
/** The colour part of a computed box-shadow ("<colour> 0px 0px 0px 2px"). */
const shadowColour = (boxShadow) => (/^(.*?\))\s+-?[\d.]+px/.exec(boxShadow ?? "") ?? [])[1] ?? null;
/** Pixels of a decoded image in a radial band [from, to] px outside a circle's edge; the fraction within `tolerance` of `rgb`. */
function radialBand(image, centre, radius, from, to, rgb, tolerance = 28) {
  let pixels = 0;
  let near = 0;
  const sums = [0, 0, 0];
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const distance = Math.hypot(x + 0.5 - centre.x, y + 0.5 - centre.y) - radius;
      if (distance < from || distance > to) continue;
      const index = (y * image.width + x) * 4;
      pixels += 1;
      for (let channel = 0; channel < 3; channel += 1) sums[channel] += image.data[index + channel];
      if ([0, 1, 2].every((channel) => Math.abs(image.data[index + channel] - rgb[channel]) <= tolerance)) near += 1;
    }
  }
  return { from, to, pixels, near, fraction: pixels ? Math.round((near / pixels) * 1000) / 1000 : 0, mean: sums.map((sum) => (pixels ? Math.round(sum / pixels) : null)) };
}
const toLinear255 = (value) => { const channel = value / 255; return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; };
const luminance255 = (rgb) => 0.2126 * toLinear255(rgb[0]) + 0.7152 * toLinear255(rgb[1]) + 0.0722 * toLinear255(rgb[2]);
const contrast255 = (a, b) => { const la = luminance255(a); const lb = luminance255(b); return Math.round(((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)) * 1000) / 1000; };
/** The most frequent colour inside a rectangle of a decoded image (an option's interior), with its share. */
function modalColour(image, box) {
  const counts = new Map();
  let total = 0;
  for (let y = Math.max(0, Math.ceil(box.top)); y < Math.min(image.height, Math.floor(box.bottom)); y += 1) {
    for (let x = Math.max(0, Math.ceil(box.left)); x < Math.min(image.width, Math.floor(box.right)); x += 1) {
      const index = (y * image.width + x) * 4;
      const key = `${image.data[index]},${image.data[index + 1]},${image.data[index + 2]}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      total += 1;
    }
  }
  let best = null;
  for (const [key, count] of counts) if (!best || count > best.count) best = { key, count };
  return best ? { rgb: best.key.split(",").map(Number), share: Math.round((best.count / total) * 1000) / 1000, pixels: total } : null;
}
/**
 * E15 selection walks: batch 48's per-stop pixel walk (unchanged oracle) with every option group on a NON-DEFAULT
 * selection (theme, density, accent swatch, background tone, sidebar position; language: the ZH run's selected segment
 * is the non-default 中文), both sliders at non-default values, in the clean, failed-write (all seven, with the Topbar
 * status) and source-issue states, in the light (theme "system", rendering light) and dark themes. Before each walk the
 * exact selection is a precondition; after it, every selected control, both sliders and (failed-write) the Topbar
 * status must show visible focus by their own pixels (deferred product checks, the per-stop oracle restated per stop).
 */
const SELECTION_WALKS = [
  { name: "sel-light-a", theme: "light", state: "clean", stored: { theme: "system", density: "compact", accentHue: 35, bgTone: "cream", fontScale: 0.9 }, railByClick: "top",
    selected: ["theme:system", "density:compact", "swatch:2", "tone:cream", "railpos:top"], sliders: { hue: "35", font: "0.9" } },
  { name: "sel-light-b", theme: "light", state: "clean", stored: { theme: "system", density: "compact", accentHue: 295, bgTone: "lavender", railPos: "bottom", fontScale: 1.1 },
    selected: ["theme:system", "density:compact", "swatch:4", "tone:lavender", "railpos:bottom"], sliders: { hue: "295", font: "1.1" } },
  { name: "sel-dark-clean", theme: "dark", state: "clean", stored: { theme: "dark", density: "compact", accentHue: 230, bgTone: "mist", railPos: "right", fontScale: 1.05 },
    selected: ["theme:dark", "density:compact", "swatch:1", "tone:mist", "railpos:right"], sliders: { hue: "230", font: "1.05" } },
  { name: "sel-dark-failed", theme: "dark", state: "failed-write", stored: { lang: OPPOSITE[LANG] }, failed: true,
    selected: ["theme:dark", "density:compact", "swatch:3", "tone:peach", "railpos:top"], sliders: { hue: "355", font: "1.05" } },
  { name: "sel-dark-source", theme: "dark", state: "source-issue", stored: { theme: "dark", density: "compact", accentHue: 75, bgTone: "graphite", fontScale: 1.15 }, extra: { [KEY.railPos]: "diagonal" },
    selected: ["theme:dark", "density:compact", "swatch:5", "tone:graphite", "railpos:left"], sliders: { hue: "75", font: "1.15" } },
];
const selectionWalkLog = [];
async function kbSelectionWalks() {
  for (const walk of SELECTION_WALKS) {
    const id = `kb:${LANG}:${walk.name}`;
    progress(`E15 selection walk ${walk.name}`);
    await kbMount(id, { lang: LANG, ...walk.stored }, walk.extra ?? {});
    await installB50(id);
    if (walk.railByClick) {
      // The sidebar position is chosen by a trusted click once the pet is hidden: a successful autosave, so the state is
      // still clean. (A STORED top sidebar at 375 px leaves Chrome's mobile visual viewport zoomed after the pet toggle's
      // 1440 px round trip, a harness artifact seen in development; see unzoomedPrecondition.)
      const since = await mark();
      await clickDesc(`railpos:${walk.railByClick}`, `${id}:rail-by-click`);
      pre(`${id}:rail-chosen-by-click-written-once-and-settled-clean`, await waitUntil(`__native.native.get(${JSON.stringify(KEY.railPos)}) === ${JSON.stringify(walk.railByClick)} && __native.pane().recovery.length === 0`, 6000)
        && isDeepStrictEqual(sevenMutations((await snap(since)).attempts).map((entry) => `${entry.op}:${entry.key}=${entry.value}:${entry.outcome}`), [`set:${KEY.railPos}=${walk.railByClick}:ok`]), {});
      await parkMouse();
      await evaluate("__visual.settle()");
    }
    if (walk.failed) {
      // All seven fail with NON-DEFAULT drafts (the language draft is this run's language over the other stored one);
      // the background choice comes before the swatch, so the accent draft is the swatch's hue.
      await evaluate(`__native.denySet(${JSON.stringify(SEVEN)})`);
      await failPane(`lang:${LANG}`, ["lang"], `${id}:lang`);
      pre(`${id}:ui-language-now-${LANG}`, (await evaluate("__native.uiLang()")) === LANG);
      await failPane("theme:dark", ["theme"], `${id}:theme`);
      await failPane("density:compact", ["density"], `${id}:density`);
      await failPane("tone:peach", ["bgTone", "accentHue"], `${id}:background`);
      await failPane("swatch:3", ["accentHue"], `${id}:accent`);
      await failPane("railpos:top", ["railPos"], `${id}:rail`);
      await focusSlider("fontScale", `${id}:font`);
      await press("ArrowRight");
      pre(`${id}:font:edit-settled-as-a-failed-draft`, await waitUntil(blockIs("fontScale", "not-saved"), 6000));
      pre(`${id}:all-seven-failed-and-the-topbar-status-shown`, await waitUntil(`${recoveryIs(blocks(Object.fromEntries(FIELDS.map((field) => [field, "not-saved"]))))} && ${topbarStatusIs(true)}`, 6000), { pane: await evaluate("__native.pane()") });
      await parkMouse();
      await evaluate("__visual.settle()");
    }
    const selection = await evaluate("__b50.selection()");
    const pane = await evaluate("__native.pane()");
    const expectedSelected = [`lang:${LANG}`, ...walk.selected];
    const expectedRecovery = walk.failed ? blocks(Object.fromEntries(FIELDS.map((field) => [field, "not-saved"]))) : walk.extra ? blocks({ railPos: "unavailable" }) : [];
    pre(`${id}:non-default-selections-sliders-theme-and-state-in-place`, selection.aligned && isDeepStrictEqual([...selection.selected].sort(), [...expectedSelected].sort())
      && isDeepStrictEqual(selection.sliders, walk.sliders) && selection.theme === walk.theme && isDeepStrictEqual(pane.recovery, expectedRecovery), { selection, expectedSelected, recovery: pane.recovery, expectedRecovery });
    await unzoomedPrecondition(id);
    const { stops, inside } = await tabCycle(id);
    if (walk.failed) check(`${id}:topbar-status-is-a-tab-stop-immediately-before-the-appearance-trigger`, inside.indexOf("topbar:trigger") === inside.indexOf("topbar:status") + 1 && inside.includes("topbar:status"), { around: inside.slice(Math.max(0, inside.indexOf("topbar:status") - 2), inside.indexOf("topbar:status") + 3) });
    visibleFocusCheck(id, stops);
    const rows = await pixelFocusWalk(id, { expectedStops: inside });
    const focal = [...expectedSelected, "hue-slider", "font-slider", ...(walk.failed ? ["topbar:status", "retry-all"] : walk.extra ? ["reload:railPos"] : [])];
    const focalRows = focal.map((desc) => ({ desc, row: rows.find((row) => row.desc === desc) ?? null }));
    for (const { desc, row } of focalRows) {
      checkDeferred(`${id}:${desc}${expectedSelected.includes(desc) ? "-selected" : ""}-focus-visible-by-its-own-pixels`, Boolean(row) && row.visible === true,
        row ? { outline: row.outline, bandPixels: row.bandPixels, bandDiff: row.bandDiff, ownPixels: row.ownPixels, ownDiff: row.ownDiff, totalDiff: row.totalDiff } : { missing: desc });
    }
    selectionWalkLog.push({ id, theme: walk.theme, state: walk.state, selected: expectedSelected, sliders: walk.sliders, stops: rows.length, failed: rows.filter((row) => !row.visible).map((row) => row.desc),
      focal: focalRows.map(({ desc, row }) => (row ? `${desc}:${row.ownDiff}/${row.ownPixels}` : `${desc}:missing`)) });
  }
  record("selection-walk-table", { lang: LANG, width: KEYBOARD_WIDTH, walks: selectionWalkLog });
}
/**
 * E15 selected accent swatch (F-APP-2 ruling 2): focused+selected against selected+unfocused by the swatch's own pixels;
 * the selection ring stays visible while focused (radial band 0.75–1.25 px outside the swatch edge, the core of the 2 px
 * box-shadow ring, in its computed --text-1 colour); the focus indicator uses the global ring colour and width; no layout
 * change. The measurement is validated in every case: the unfocused selected swatch's own selection outline (band
 * 2.75–3.25 px) is in the same colour, and a focused NON-selected swatch has no such colour in the 0.75–1.25 px band.
 * Light and dark.
 */
async function kbSelectedSwatchRing() {
  const cases = [
    { theme: "light", stored: {}, selected: "swatch:0", control: "swatch:1" },
    { theme: "light", stored: { accentHue: 295 }, selected: "swatch:4", control: "swatch:5" },
    { theme: "dark", stored: { theme: "dark", accentHue: 230 }, selected: "swatch:1", control: "swatch:2" },
    { theme: "dark", stored: { theme: "dark" }, selected: "swatch:0", control: "swatch:1" },
  ];
  const rows = [];
  for (const entry of cases) {
    const tag = `${entry.theme}-${entry.selected.replace(":", "-")}`;
    const id = `kb:${LANG}:selected-swatch-ring:${tag}`;
    progress(`E15 selected swatch ring ${tag}`);
    await kbMount(id, { lang: LANG, ...entry.stored });
    await installB50(id);
    await unzoomedPrecondition(id);
    const selection = await evaluate("__b50.selection()");
    pre(`${id}:theme-and-selected-swatch-in-place`, selection.theme === entry.theme && selection.selected.includes(entry.selected) && !selection.selected.includes(entry.control), { selection });
    // 1. The selected swatch focused by trusted Tab; 2. focus moved out of the swatch row by trusted Shift+Tab.
    await tabUntil(entry.selected, `${id}:${entry.selected}`);
    await parkMouse();
    const first = await evaluate(`__b48.placeFocused(${PIXEL_MARGIN})`);
    const focusedFacts = await evaluate(`__b50.facts("active")`);
    const focusedShot = await stableViewportClip(first.clip);
    const rowClip = await evaluate(`(() => { const r = document.activeElement.closest(".setting-row").getBoundingClientRect(); return { x: Math.max(0, Math.floor(r.left) - 8), y: Math.max(0, Math.floor(r.top) - 8), width: Math.ceil(r.width) + 16, height: Math.ceil(r.height) + 16 }; })()`);
    const rowShot = await stableViewportClip(rowClip);
    const backPath = [];
    for (let presses = 0; presses < 7; presses += 1) {
      await press("ShiftTab");
      const now = await evaluate("__visual.activeDesc()");
      backPath.push(now);
      if (!now.startsWith("swatch:")) break;
    }
    const again = await evaluate(`__b48.placeAgain(${PIXEL_MARGIN})`);
    const unfocusedFacts = await evaluate(`__b50.facts("stop")`);
    const aligned = first.ok && again.ok && !again.stillFocused && isDeepStrictEqual(again.clip, first.clip) && again.hovered === first.hovered
      && ["left", "top", "right", "bottom"].every((side) => Math.abs(again.rect[side] - first.rect[side]) < 0.01);
    pre(`${id}:focus-left-the-swatch-row-by-trusted-shift-tab-and-the-second-capture-is-aligned`, aligned && /^density:/.test(backPath.at(-1) ?? "") && focusedFacts.focused && focusedFacts.focusVisible && !unfocusedFacts.focused, { backPath, first: { rect: first.rect, clip: first.clip }, again: { rect: again.rect, clip: again.clip, stillFocused: again.stillFocused } });
    const movedShot = await stableViewportClip(again.clip);
    pre(`${id}:both-captures-are-stable-frames`, focusedShot.stable && movedShot.stable && rowShot.stable, { attempts: [focusedShot.attempts, movedShot.attempts, rowShot.attempts] });
    // 3. The control: a focused NON-selected swatch (trusted Tab forward from the density segment).
    await tabUntil(entry.control, `${id}:${entry.control}`, { anchor: null, max: 8 });
    await parkMouse();
    const controlFirst = await evaluate(`__b48.placeFocused(${PIXEL_MARGIN})`);
    const controlFacts = await evaluate(`__b50.facts("active")`);
    const controlShot = await stableViewportClip(controlFirst.clip);
    pre(`${id}:control-capture-stable-and-the-control-is-focus-visible-and-not-selected`, controlShot.stable && controlFacts.focusVisible && !controlFacts.active, { controlFacts });
    // Analysis.
    const comparison = compareFocusBand(focusedShot.buffer, movedShot.buffer, first, again);
    const ringCss = shadowColour(focusedFacts.boxShadow);
    const ringRgb = (await evaluate(`__b50.rgba(${JSON.stringify(ringCss ?? "transparent")})`)).slice(0, 3);
    const selectionOutlineRgb = (await evaluate(`__b50.rgba(${JSON.stringify(unfocusedFacts.outline.color)})`)).slice(0, 3);
    const geometry = (placed) => ({ centre: { x: (placed.rect.left + placed.rect.right) / 2 - placed.clip.x, y: (placed.rect.top + placed.rect.bottom) / 2 - placed.clip.y }, radius: (placed.rect.right - placed.rect.left) / 2 });
    const focusedImage = decodePng(focusedShot.buffer);
    const movedImage = decodePng(movedShot.buffer);
    const controlImage = decodePng(controlShot.buffer);
    const g = geometry(first);
    const gc = geometry(controlFirst);
    // Band cores: a pixel spans at most ±0.71 px radially, so a pixel centred 0.75–1.25 px outside the edge lies wholly in
    // the 0–2 px box-shadow ring (and 2.75–3.25 px wholly in the 2–4 px outline ring; 4.75–5.25 px in the 4–6 px ring),
    // whatever the swatch's subpixel position.
    const bands = {
      focusedSelected: { inner: radialBand(focusedImage, g.centre, g.radius, 0.75, 1.25, ringRgb), middle: radialBand(focusedImage, g.centre, g.radius, 2.75, 3.25, ringRgb), outer: radialBand(focusedImage, g.centre, g.radius, 4.75, 5.25, ringRgb) },
      unfocusedSelected: { inner: radialBand(movedImage, g.centre, g.radius, 0.75, 1.25, ringRgb), middle: radialBand(movedImage, g.centre, g.radius, 2.75, 3.25, ringRgb) },
      focusedControl: { inner: radialBand(controlImage, gc.centre, gc.radius, 0.75, 1.25, ringRgb), middle: radialBand(controlImage, gc.centre, gc.radius, 2.75, 3.25, ringRgb) },
    };
    const saved = {
      focused: (await saveShot(`selring-${tag}-focused`, focusedShot.base64, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: first.clip, pageOffset: focusedShot.offset, state: `${entry.selected} (the selected swatch, ${entry.theme} theme) focused by a trusted Tab (fixed ${short}, pet hidden)`, facts: focusedFacts })).file,
      row: (await saveShot(`selring-${tag}-focused-row`, rowShot.base64, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: rowClip, pageOffset: rowShot.offset, state: `the Accent color row with the selected ${entry.selected} focused (${entry.theme} theme, fixed ${short})` })).file,
      unfocused: (await saveShot(`selring-${tag}-unfocused`, movedShot.base64, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: again.clip, pageOffset: movedShot.offset, state: `${entry.selected} selected, after trusted Shift+Tab (${backPath.join(" > ")}) moved focus out of the swatch row (${entry.theme} theme, fixed ${short})`, facts: unfocusedFacts })).file,
      control: (await saveShot(`selring-${tag}-control-${entry.control.replace(":", "-")}-focused`, controlShot.base64, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: controlFirst.clip, pageOffset: controlShot.offset, state: `${entry.control} (not selected) focused by a trusted Tab, the measurement control (${entry.theme} theme, fixed ${short})`, facts: controlFacts })).file,
    };
    const row = { theme: entry.theme, stored: entry.stored, selected: entry.selected, control: entry.control, backPath, focusedFacts, unfocusedFacts, controlFacts, ringCss, ringRgb, selectionOutlineRgb, bands, comparison, saved,
      png: { focused: sha256(focusedShot.buffer), unfocused: sha256(movedShot.buffer), control: sha256(controlShot.buffer) }, captures: [focusedShot.attempts, movedShot.attempts, controlShot.attempts] };
    rows.push(row);
    record("selected-swatch-ring", { id, ...row });
    pre(`${id}:measurement-valid-the-unfocused-selection-outline-is-the-ring-colour-and-a-focused-non-selected-swatch-has-none-inside`, isDeepStrictEqual(selectionOutlineRgb, ringRgb)
      && bands.unfocusedSelected.middle.fraction >= 0.8 && bands.unfocusedSelected.inner.fraction <= 0.1 && bands.focusedControl.inner.fraction <= 0.1 && bands.focusedSelected.inner.pixels >= 40, { bands, ringRgb, selectionOutlineRgb });
    checkDeferred(`${id}:focused-selected-differs-from-selected-unfocused-in-its-own-ring-or-box`, comparison.ownDiff > 0 && comparison.sameSize, { ownDiff: comparison.ownDiff, ownPixels: comparison.ownPixels, bandDiff: comparison.bandDiff, totalDiff: comparison.totalDiff });
    checkDeferred(`${id}:selection-ring-still-visible-while-focused`, bands.focusedSelected.inner.fraction >= 0.8, { inner: bands.focusedSelected.inner, ringCss, ringRgb });
    checkDeferred(`${id}:focus-indicator-uses-the-global-ring-colour-and-width-and-the-selection-colour-is-kept`, focusedFacts.outline.style === "solid" && focusedFacts.outline.width === "2px"
      && focusedFacts.outline.color === controlFacts.outline.color && controlFacts.outline.style === "solid" && controlFacts.outline.width === "2px" && ringCss === unfocusedFacts.outline.color, { focused: focusedFacts.outline, control: controlFacts.outline, ringCss, selectionOutline: unfocusedFacts.outline });
    checkDeferred(`${id}:no-layout-change-same-box-focused-and-unfocused`, ["left", "top", "right", "bottom"].every((side) => Math.abs(focusedFacts.rect[side] - unfocusedFacts.rect[side]) < 0.01), { focused: focusedFacts.rect, unfocused: unfocusedFacts.rect });
  }
  record("selected-swatch-ring-table", { lang: LANG, width: KEYBOARD_WIDTH, rows: rows.map((row) => ({ theme: row.theme, selected: row.selected, control: row.control, ownDiff: row.comparison.ownDiff, ownPixels: row.comparison.ownPixels,
    focusedInner: row.bands.focusedSelected.inner.fraction, unfocusedMiddle: row.bands.unfocusedSelected.middle.fraction, controlInner: row.bands.focusedControl.inner.fraction, focusedOutline: row.focusedFacts.outline, boxShadow: row.focusedFacts.boxShadow, png: row.png })) });
}
/**
 * F-APP-3 observation (NOT gated; control plane F-APP-3 ruling 1, UX-05 follow-up): the Topbar quick-switch popover's
 * menuitemradio options. The popover is opened by a trusted Enter on the trigger; trusted Tab walks its options. Each
 * option is captured focused and again after focus moved on (batch 48 placement, stable frames); recorded: its own-region
 * pixel change, the computed outline and background focused and unfocused, and the option interior's modal colour in
 * both captures with their contrast ratio. Checked and unchecked options, light and dark.
 */
async function kbPopoverFocusObservation() {
  const rows = [];
  const THEME_NEXT = { light: "dark", dark: "system" };
  for (const theme of ["light", "dark"]) {
    const id = `kb:${LANG}:popover-focus:${theme}`;
    progress(`F-APP-3 observation ${theme}`);
    await kbMount(id, { lang: LANG, theme });
    await installB50(id);
    await unzoomedPrecondition(id);
    pre(`${id}:theme-applied`, (await evaluate("__native.html().theme")) === theme);
    // The pet toggle's click scrolled its rail button into view (the 1024x768 page scrolls); the Topbar is put back in view.
    await evaluate("__visual.scrollWindowTo(0)");
    await clickTopbarBackground(id);
    const path = await tabUntil("topbar:trigger", id, { anchor: null, max: 6 });
    pre(`${id}:trigger-reached-by-tab-after-the-search-box`, isDeepStrictEqual(path, ["topbar:search", "topbar:trigger"]), { path });
    await press("Enter");
    pre(`${id}:popover-opened-by-enter`, await waitUntil("__native.topbar().open", 3000));
    await parkMouse();
    const sectionTheme = labels[LANG].theme;
    const checkedName = labels[LANG][theme];
    const uncheckedName = labels[LANG][THEME_NEXT[theme]];
    const targets = { checked: `topbar:option:${sectionTheme}:${checkedName}`, unchecked: `topbar:option:${sectionTheme}:${uncheckedName}` };
    const visited = [];
    let pending = null;
    for (let index = 0; index < 12; index += 1) {
      await press("Tab");
      const now = await evaluate("__visual.focusInfo()");
      if (pending) {
        const again = await evaluate(`__b48.placeAgain(${PIXEL_MARGIN})`);
        const unfocusedFacts = await evaluate(`__b50.facts("stop")`);
        const aligned = pending.first.ok && again.ok && !again.stillFocused && isDeepStrictEqual(again.clip, pending.first.clip) && again.hovered === pending.first.hovered
          && ["left", "top", "right", "bottom"].every((side) => Math.abs(again.rect[side] - pending.first.rect[side]) < 0.01);
        const moved = aligned ? await stableViewportClip(again.clip) : null;
        pre(`${id}:${pending.desc}:captures-aligned-and-stable`, aligned && Boolean(moved) && moved.stable && pending.shot.stable, { first: { rect: pending.first.rect, clip: pending.first.clip, hovered: pending.first.hovered }, again: { rect: again.rect, clip: again.clip, hovered: again.hovered, stillFocused: again.stillFocused } });
        const comparison = compareFocusBand(pending.shot.buffer, moved.buffer, pending.first, again);
        const interior = { left: pending.first.rect.left - pending.first.clip.x + 3, top: pending.first.rect.top - pending.first.clip.y + 3, right: pending.first.rect.right - pending.first.clip.x - 3, bottom: pending.first.rect.bottom - pending.first.clip.y - 3 };
        const focusedModal = modalColour(decodePng(pending.shot.buffer), interior);
        const unfocusedModal = modalColour(decodePng(moved.buffer), interior);
        const kind = pending.desc === targets.checked ? "checked" : pending.desc === targets.unchecked ? "unchecked" : null;
        const row = {
          theme, desc: pending.desc, checked: pending.facts.ariaChecked, next: now.isBody ? "body" : now.desc, focusVisible: pending.facts.focusVisible,
          focused: { outline: pending.facts.outline, backgroundColor: pending.facts.backgroundColor, color: pending.facts.color, fontWeight: pending.facts.fontWeight },
          unfocused: { outline: unfocusedFacts.outline, backgroundColor: unfocusedFacts.backgroundColor, color: unfocusedFacts.color, fontWeight: unfocusedFacts.fontWeight },
          pixels: { ownPixels: comparison.ownPixels, ownDiff: comparison.ownDiff, bandPixels: comparison.bandPixels, bandDiff: comparison.bandDiff, interiorDiff: comparison.interiorDiff, totalDiff: comparison.totalDiff, excluded: comparison.excluded },
          interiorModal: { focused: focusedModal, unfocused: unfocusedModal, contrast: focusedModal && unfocusedModal ? contrast255(focusedModal.rgb, unfocusedModal.rgb) : null },
          png: { focused: sha256(pending.shot.buffer), movedOn: sha256(moved.buffer) }, captures: [pending.shot.attempts, moved.attempts],
        };
        if (kind) {
          const safe = `${theme}-${kind}`;
          row.screenshots = [
            pending.panelFile,
            (await saveShot(`popover-${safe}-option-focused`, pending.shot.base64, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: pending.first.clip, pageOffset: pending.shot.offset, state: `F-APP-3 observation: the ${kind} option ${pending.desc} focused by a trusted Tab (${theme} theme, fixed ${short})`, facts: pending.facts })).file,
            (await saveShot(`popover-${safe}-option-moved-on`, moved.base64, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: again.clip, pageOffset: moved.offset, state: `F-APP-3 observation: the ${kind} option ${pending.desc} after focus moved on to ${row.next} (${theme} theme, fixed ${short})`, facts: unfocusedFacts })).file,
          ];
        }
        rows.push(row);
        observe(`${id}:${pending.desc}`, { checked: row.checked, focused: row.focused, unfocused: row.unfocused, pixels: row.pixels, interiorModal: row.interiorModal });
        pending = null;
      }
      if (now.isBody || !now.desc.startsWith("topbar:option:")) break;
      visited.push(now.desc);
      const first = await evaluate(`__b48.placeFocused(${PIXEL_MARGIN})`);
      const facts = await evaluate(`__b50.facts("active")`);
      const shot = await stableViewportClip(first.clip);
      let panelFile = null;
      if (now.desc === targets.checked || now.desc === targets.unchecked) {
        const kind = now.desc === targets.checked ? "checked" : "unchecked";
        const panelClip = await evaluate("__b50.panelClip(8)");
        const panelShot = await stableViewportClip(panelClip);
        panelFile = (await saveShot(`popover-${theme}-${kind}-focused-panel`, panelShot.base64, { width: currentWidth, viewportHeight: HEIGHTS[currentWidth], clip: panelClip, pageOffset: panelShot.offset, state: `F-APP-3 observation: the Topbar popover with the ${kind} option ${now.desc} focused by a trusted Tab (${theme} theme, fixed ${short})`, stable: panelShot.stable })).file;
      }
      pending = { desc: now.desc, focus: now, first, facts, shot, panelFile };
    }
    const options = await evaluate("__native.topbar().options");
    pre(`${id}:every-popover-option-visited-once-in-order-and-the-popover-stayed-open`, (await evaluate("__native.topbar().open")) && visited.length === options.length && options.length === 7
      && isDeepStrictEqual(visited, options.map((option) => `topbar:option:${option.section}:${option.name}`)) && visited.includes(targets.checked) && visited.includes(targets.unchecked), { visited, options });
    await press("Escape");
    pre(`${id}:escape-closed-the-popover`, await waitUntil("!__native.topbar().open", 3000));
  }
  const summary = rows.map((row) => ({ theme: row.theme, desc: row.desc, checked: row.checked, ownDiff: row.pixels.ownDiff, ownPixels: row.pixels.ownPixels, focusedOutline: `${row.focused.outline.style} ${row.focused.outline.width}`,
    focusedBackground: row.focused.backgroundColor, unfocusedBackground: row.unfocused.backgroundColor, interiorContrast: row.interiorModal.contrast }));
  record("popover-focus-observation-table", { lang: LANG, width: KEYBOARD_WIDTH, gated: false, rows: summary });
  observe(`kb:${LANG}:popover-focus:f-app-3-summary`, { checkedOptionsWithZeroOwnPixelChange: rows.filter((row) => row.checked === "true" && row.pixels.ownDiff === 0).map((row) => `${row.theme}:${row.desc}`),
    checkedOptions: rows.filter((row) => row.checked === "true").length, uncheckedOptions: rows.filter((row) => row.checked !== "true").length,
    focusedOutlineStyles: [...new Set(rows.map((row) => row.focused.outline.style))], uncheckedInteriorContrast: rows.filter((row) => row.checked !== "true").map((row) => row.interiorModal.contrast) });
}
async function runKeyboard() {
  progress("E15 section focus-visibility"); // batch 50 addition
  if (selected("focus-visibility")) await kbFocusVisibility();
  progress("E15 section swatch-focus"); // batch 50 addition
  if (selected("swatch-focus")) await kbSelectedSwatchFocus(); // batch 48 addition (reproduction)
  progress("E15 section tab"); // batch 50 addition
  if (selected("tab")) await kbTabOrder();
  progress("E15 section activation"); // batch 50 addition
  if (selected("activation")) await kbActivation();
  progress("E15 section sliders"); // batch 50 addition
  if (selected("sliders")) await kbSliders();
  progress("E15 section reset"); // batch 50 addition
  if (selected("reset")) await kbReset();
  progress("E15 section focus targets"); // batch 50 addition
  if (selected("focus")) await kbFocusTargets();
  progress("E15 section retry-all"); // batch 50 addition
  if (selected("retry-all")) await kbRetryAll();
  progress("E15 section topbar"); // batch 50 addition
  if (selected("topbar")) await kbTopbarStatus();
  if (selected("selection-walks")) await kbSelectionWalks(); // batch 50 addition
  if (selected("swatch-ring")) await kbSelectedSwatchRing(); // batch 50 addition
  if (selected("popover-focus")) await kbPopoverFocusObservation(); // batch 50 addition (F-APP-3 observation, not gated)
  if (pixelWalkLog.length) record("pixel-focus-walk-table", { lang: LANG, width: KEYBOARD_WIDTH, walks: pixelWalkLog }); // batch 48 addition
}

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
let harnessError = null;
try {
  const fixedArchive = extractArchive(resolved);
  const beforeArchive = VARIANTS_BY_MODE[KIND].includes("before") ? extractArchive(BEFORE_REVISION) : null;
  for (const name of VARIANTS_BY_MODE[KIND]) await buildVariant(name);
  progress("bundles built"); // batch 50 addition
  const appPage = (variant) => `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>XAI Web (Appearance visual/keyboard ${mode}, ${variant})</title><link rel="stylesheet" href="/__native/${variant}/bundle.css"><script src="/__native/prelude.js"></script><script src="/__native/probes.js"></script></head><body><div id="root"></div><script type="module" src="/__native/${variant}/bundle.js"></script></body></html>`;
  const seedPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>seed</title><script src="/__native/prelude.js"></script><script src="/__native/probes.js"></script></head><body><p>seed page: instruments and probes only, no product code</p></body></html>';
  server = createServer((request, response) => {
    const path = new URL(request.url, "http://127.0.0.1").pathname;
    const asset = /^\/__native\/([a-z-]+)\/bundle\.(js|css)$/.exec(path);
    const category = path.startsWith("/__native/") || path === "/seed" || path === "/favicon.ico" ? path : `app-document:${currentVariant}`;
    served[category] = (served[category] ?? 0) + 1;
    response.setHeader("Cache-Control", "no-store");
    if (path === "/__native/prelude.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(preludeSource); return; }
    if (path === "/__native/probes.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(probesSource); return; }
    if (asset && bundles[asset[1]]) {
      response.setHeader("Content-Type", asset[2] === "js" ? "text/javascript; charset=utf-8" : "text/css; charset=utf-8");
      response.end(asset[2] === "js" ? bundles[asset[1]].js : bundles[asset[1]].css);
      return;
    }
    if (path === "/favicon.ico") { response.statusCode = 204; response.end(); return; }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(path === "/seed" ? seedPage : appPage(currentVariant));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  await openBrowser();
  const version = await browser.send("Browser.getVersion");
  record("baseline", {
    requested, resolved, resolvedTree, before: BEFORE_REVISION, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix, lang: LANG, kind: KIND, composition: "production-app", variants: VARIANTS_BY_MODE[KIND], sections: SECTIONS, devWidths: DEV_WIDTHS,
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { fixed: sha256(fixedLock), before: sha256(beforeLock), dependencies: sha256(dependencyLock), extractedFixed: sha256(fixedArchive.extractedLock), extractedBefore: beforeArchive ? sha256(beforeArchive.extractedLock) : null, contractGate: LOCKFILE_GATE_SHA256 },
    fileSha256: { [RUNNER]: runnerSha256, [PROBES]: sha256(probesSource), [FROZEN.fixture.file]: sha256(fixtureSource), [FROZEN.prelude.file]: sha256(preludeSource), [FROZEN.e4h14.file]: sha256(e4Raw), [`${FROZEN_BATCH46.runner.file} (frozen batch 46 runner, diff base)`]: sha256(readFileSync(join(output, FROZEN_BATCH46.runner.file))) },
    contract: { path: CONTRACT_PATH, sha256AtHead: contractSha256, expected: CONTRACT_SHA256 },
    fixedVsBefore: { before: BEFORE_REVISION, productFilesChanged: fixedDelta },
    viewports: Object.fromEntries((KIND === "visual" ? [...WIDTHS, 760, 761, 767, 1025] : [KEYBOARD_WIDTH]).map((width) => [width, { height: HEIGHTS[width], mobileEmulation: width <= 414 }])),
    origin: "127.0.0.1 (ephemeral port, this runner's own server); every other host resolves to NOTFOUND",
    devtools: "pipe transport (--remote-debugging-pipe), flattened target sessions; trusted input through Input.dispatchMouseEvent/dispatchKeyEvent (no nativeVirtualKeyCode)",
  });
  pre("baseline:docs-head-product-tree-equals-fixed", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === LOCKFILE_GATE_SHA256 && sha256(fixedLock) === LOCKFILE_GATE_SHA256 && sha256(fixedArchive.extractedLock) === LOCKFILE_GATE_SHA256
    && (!beforeArchive || sha256(beforeArchive.extractedLock) === LOCKFILE_GATE_SHA256));
  pre("baseline:contract-r3-hash", contractSha256 === CONTRACT_SHA256, { contractSha256 });
  pre("baseline:fixed-delta-is-exactly-the-26-files-terra-24-plus-the-f-app-1-and-f-app-2-guard-tests", isDeepStrictEqual([...fixedDelta].sort(), [...EXPECTED_FIXED_DELTA].sort()), { fixedDelta });
  pre("baseline:frozen-batch-46-probes-reused-read-only-and-frozen-runner-unchanged-hash-checked",
    sha256(probesSource) === FROZEN_BATCH46.probes.sha256 && sha256(readFileSync(join(output, FROZEN_BATCH46.runner.file))) === FROZEN_BATCH46.runner.sha256, {});
  pre("baseline:frozen-batch-45-fixture-and-prelude-and-e4-h14-log-reused-read-only-hash-checked",
    sha256(fixtureSource) === FROZEN.fixture.sha256 && sha256(preludeSource) === FROZEN.prelude.sha256 && sha256(e4Raw) === FROZEN.e4h14.sha256, {});
  // Batch 50 addition: the batch 48 runner (this copy's diff base) is unchanged, and the fixed product's increment over
  // 24073b5 (batch 46) and 5bbf473 (batch 48) is exactly the F-APP-1/F-APP-2 stylesheet blocks and their guard tests.
  const batch48RunnerSha256 = sha256(readFileSync(join(output, FROZEN_BATCH48.runner.file)));
  const productFiles = (from) => git(["diff", "--name-only", from, resolved, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]).trim().split("\n").filter(Boolean);
  const increments = { "24073b5": productFiles("24073b522262d8b4bec0abfa29347db28adbdd9e"), "5bbf473": productFiles("5bbf473872073472188957f430057412e8798131") };
  record("baseline-batch50", { runner: RUNNER, diffBase: { file: FROZEN_BATCH48.runner.file, sha256: batch48RunnerSha256, expected: FROZEN_BATCH48.runner.sha256 }, productIncrements: increments });
  pre("baseline:batch-48-runner-diff-base-unchanged-hash-checked", batch48RunnerSha256 === FROZEN_BATCH48.runner.sha256, { batch48RunnerSha256 });
  pre("baseline:fixed-vs-24073b5-is-the-appearance-stylesheet-and-the-two-guard-tests-and-vs-5bbf473-the-stylesheet-and-the-f-app-2-guard-test",
    isDeepStrictEqual(increments["24073b5"], [
      "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.focus-ring.test.tsx",
      "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.selected-focus.test.tsx",
      APPEARANCE_CSS,
    ]) && isDeepStrictEqual(increments["5bbf473"], ["packages/xai-web-settings-appearance/src/__tests__/AppearancePane.selected-focus.test.tsx", APPEARANCE_CSS]), increments);

  if (KIND === "visual") await runVisual();
  else await runKeyboard();

  for (const page of browser.pages.values()) await endDocument(page, "run-end");
  observe("run:network-and-requests", { network: networkSeen, served });
  pre("run:no-non-local-network-attempt", networkSeen.nonLocal === 0, { networkSeen });
  pre("run:keyboard-trace-contains-only-the-runner-key-presses", keyboardAudit.mismatches.length === 0 && keyboardAudit.keyEvents === keyboardAudit.expectedKeyEvents, keyboardAudit);
  pre("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs: dialogs.filter((entry) => !entry.expected) });
  pre("run:every-planned-dialog-consumed", dialogPlan.length === 0, { dialogPlan });
  const fixedErrors = runtimeErrors.filter((entry) => entry.variant !== "before");
  observe("run:5cd63ff-reference-runtime-errors", { count: runtimeErrors.length - fixedErrors.length, samples: runtimeErrors.filter((entry) => entry.variant === "before").slice(0, 6) });
  check("run:runtime-errors-zero", fixedErrors.length === 0, { runtimeErrors: fixedErrors.slice(0, 5) });
  if (deferredFailures.length) throw Object.assign(new Error(`PRODUCT CHECK FAILED: ${deferredFailures.length} deferred presentation check(s): ${deferredFailures.slice(0, 5).join(", ")}`), { checkId: deferredFailures[0], checkKind: "product" });
} catch (error) {
  harnessError = error;
} finally {
  const productFailure = harnessError?.checkKind === "product";
  const warningGroups = {};
  for (const warning of consoleWarnings) {
    const key = `${warning.text.slice(0, 160)} @ ${warning.source?.module ?? warning.source?.url ?? "unknown"} [${warning.variant}]`;
    warningGroups[key] = (warningGroups[key] ?? 0) + 1;
  }
  record("result", {
    pass: harnessError === null, harnessValid: harnessError === null || productFailure, mode, checks, productChecks, deferredFailures,
    browser: browser ? { pid: browser.pid, pipeClose: browser.pipeClose ?? null, processExit: browser.processExit ?? null } : null,
    runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 6),
    consoleWarnings: consoleWarnings.length, consoleWarningsBySource: warningGroups, consoleWarningSamples: consoleWarnings.slice(0, 6),
    dialogs, screenshots: screenshots.map((entry) => ({ file: entry.file, sha256: entry.sha256, png: entry.png })), keyboardAudit, network: networkSeen,
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
  console.log(`${label} ${relative(root, evidencePath)} checks=${checks} product=${productChecks} screenshots=${screenshots.length} exit=${process.exitCode}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
}
