/**
 * CP-APPEARANCE-01 batch 39 (contract r3 §14 E4): Appearance native BEFORE evidence in real headless Chrome, in
 * the production App composition. Parent-role native verifier. Verification only: it repairs nothing, implements
 * nothing, accepts nothing and changes no product file, contract, ledger, control plane or existing evidence.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-appearance-recovery-native/verify-native-before.mjs <revision> <mode> <suffix>
 *
 * Modes (contract §12 "Native before" and H3/H5/H6/H10/H14/H15/H17; §14 E4). Every mode runs EN and ZH:
 *   h3  — a denied Topbar language, theme or density write: applied while the bytes keep the old value, silent,
 *         reverted after a reload (Topbar on /app/calendar, a non-Settings route without unrelated alerts).
 *   h5  — with the pane mounted, a committed Topbar theme and density change is not reflected in the pane, and a
 *         trusted "Save & apply" then writes the pane's stale values, reverting the Topbar choice.
 *   h6  — every §5 item 2 malformed value at load (33 values) on /app/settings/appearance; for each crashing value
 *         (the nine H6 values plus "EN") the route error boundary on four /app routes with a screenshot and DOM
 *         text; the non-language crashing values again in a ZH session; and an Infinity accent hue written by a
 *         second real document into a running App (after a valid cross-document control write).
 *   h10 — two real documents of the production App: document B commits language, theme, density and font scale
 *         (and an accent control) through trusted input; the idle document A is observed before and after reload.
 *   h14 — (a) 375 px: horizontal containment of every Appearance control in .settings-detail; (b) 768x1024 with
 *         the DesktopPet on at its default position: hit-tests and boxes of "Save & apply" at the top and at the
 *         end of the .module-settings scroll range.
 *   h15 — a denied pane accent write and a denied Topbar theme write, then a trusted "Save & apply": attempt-level
 *         counters (with a never-failed font-scale write denied and the density per-key Web Lock held during the
 *         activation), bytes, display and the "Saved"/"已保存" flash (screenshot and per-frame duration).
 *   h17 — the clean state: "Save & apply" reached by trusted Tab presses and activated by a trusted click: four
 *         root setItem attempts, zero on the registered keys, and the flash. An additional EN observation repeats the
 *         clean-state activation over stored non-default root values (dark, compact, 1.1) in a fresh document.
 *
 * - Product: an immutable `git archive <revision>`; ./native-app.tsx is bundled with esbuild from stdin with
 *   resolveDir = that archive. Every `@repo/*` specifier is pinned to the archive's own package export; a guard
 *   plugin fails the build if any module is loaded from the packages/, apps/ or docs/ tree of the dependency
 *   checkout or of this runner's checkout. Third-party modules come from XAI_DEPS_ROOT only when its
 *   pnpm-lock.yaml SHA-256 equals the archive's and the contract gate (consistency gate). The bundle's inputs
 *   are checked for provenance: every listed reader and host module must come from the archive, and the 19
 *   contract source files must equal the contract r3 table.
 * - Page: ./native-prelude.js (classic script, instruments) then the module bundle, served from 127.0.0.1 only;
 *   DNS for every other host maps to NOTFOUND; isolated headless Chrome profile; CDP trusted mouse and keyboard
 *   input after a centre hit-test; a second document (h6, h10) is a second real tab of the same profile.
 * - Verdicts: each hypothesis part is recorded as "confirmed (correct FAIL)" when the contract requirement fails
 *   at the revision, or "refuted (PASS)" when it holds (the requirement still binds the fixed product); facts the
 *   hypothesis asserts are recorded as observed/not observed. Preconditions (control found, seeds present, fault
 *   armed and observed, instruments working) stop the run as a harness failure; product outcomes never stop it.
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log` plus PNG screenshots in this directory; existing evidence
 *   is never overwritten. Exit 0 = harness valid and every requirement holds; 2 = harness valid and at least one
 *   requirement fails (correct before FAILs); 1 = harness invalid. Development probes may redirect evidence with
 *   XAI_NATIVE_EVIDENCE_DIR (refused inside the repository); committed evidence never does.
 */
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LOCKFILE_GATE_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const CONTRACT_PATH = "docs/reviews/web-appearance-recovery-contract/contract.md";
const CONTRACT_SHA256 = "ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? output;
if (process.env.XAI_NATIVE_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
const MODES = ["h3", "h5", "h6", "h10", "h14", "h15", "h17"];
if (!requested) throw Error("Revision required");
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
let lastCheckId = null;
const record = (name, value = {}) => {
  records.push({ name, ...value });
  if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 400));
};
let checks = 0;
const pre = (id, condition, details = {}) => {
  checks += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { id, kind: "precondition", pass, ...details });
  if (!pass) throw Object.assign(new Error(`PRECONDITION: ${id}`), { checkId: id, checkKind: "precondition" });
};
const verdicts = [];
/** A hypothesis part: holds=false is a correct before FAIL (hypothesis confirmed); true is PASS (refuted). */
const verdict = (id, { hypothesis, claim, requirement, holds, evidence = {} }) => {
  checks += 1;
  lastCheckId = id;
  const entry = { id, hypothesis, claim, requirement, requirementHolds: Boolean(holds), verdict: holds ? "refuted (PASS; the requirement still binds the fixed product)" : "confirmed (correct FAIL)", ...evidence };
  verdicts.push({ id, hypothesis, requirementHolds: Boolean(holds) });
  record("verdict", entry);
  return Boolean(holds);
};
/** A recorded fact that a hypothesis asserts but that is not itself a requirement. */
const facts = [];
const fact = (id, { hypothesis, claim, observed, evidence = {} }) => {
  checks += 1;
  lastCheckId = id;
  facts.push({ id, observed: Boolean(observed) });
  record("verdict", { id, hypothesis, claim, kind: "fact", observed: Boolean(observed), verdict: observed ? "observed (fact asserted by the hypothesis)" : "not observed", ...evidence });
};

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const fixtureSource = readFileSync(join(output, "native-app.tsx"), "utf8");
const preludeSource = readFileSync(join(output, "native-prelude.js"), "utf8");
const dependencyNodeModules = join(dependencyRoot, "node_modules");
if (!existsSync(dependencyNodeModules)) throw Error("PRECONDITION: dependency tree missing; set XAI_DEPS_ROOT");
const archiveLock = execFileSync("git", ["show", `${resolved}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
const dependencyLock = readFileSync(join(dependencyRoot, "pnpm-lock.yaml"));
if (sha256(dependencyLock) !== sha256(archiveLock) || sha256(archiveLock) !== LOCKFILE_GATE_SHA256) throw Error("PRECONDITION: lockfile gate (dependency checkout, revision and contract gate must be equal)");
const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find((name) => name.startsWith("esbuild@0.28.1"));
if (!esbuildFolder) throw Error("PRECONDITION: pinned esbuild 0.28.1 missing");
const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
const docsHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const productDelta = execFileSync("git", ["diff", "--name-only", resolved, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim();
const contractSha256 = sha256(execFileSync("git", ["show", `HEAD:${CONTRACT_PATH}`], { cwd: root, maxBuffer: 20 * 1024 * 1024 }));
const versionOf = (name) => {
  try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
};

/** Reader, writer and host modules that must be bundled from the archive (contract §2 writers/readers, §3, §9). */
const REQUIRED_MODULES = [
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/RouteGateElements.tsx",
  "apps/web/src/routes/RouteErrorBoundary.tsx",
  "apps/web/src/pages/NotFoundPage.tsx",
  "apps/web/src/providers/AppProviders.tsx",
  "apps/web/src/providers/AccountStorageGate.tsx",
  "apps/web/src/observability/runtime.ts",
  "apps/web/src/observability/reporting.ts",
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
  "packages/plugin-web-settings-shell/src/SettingsFooter.tsx",
  "packages/plugin-web-settings-shell/src/SettingRow.tsx",
  "packages/plugin-web-settings-shell/src/internal/confirmAction.ts",
  "packages/plugin-web-settings-shell/src/styles.css",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/Topbar.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/AvatarMenu.tsx",
  "packages/xai-web-shell/src/SignOutConfirmDialog.tsx",
  "packages/xai-web-shell/src/registry.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-pet/src/pet.css",
  "packages/xai-web-pet/src/internal/drag.ts",
  "packages/xai-web-pet/src/internal/timing.ts",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/xai-web-event-bus/src/emitter.ts",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/storage.ts",
  "packages/plugin-web-storage/src/internal/codec.ts",
  "packages/plugin-web-storage/src/internal/registry.ts",
  "packages/plugin-web-storage/src/internal/sameTabBus.ts",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/accountOwnership.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-tokens/src/apply.ts",
  "packages/plugin-web-tokens/src/i18n.ts",
  "packages/plugin-web-tokens/src/tokens.css",
  "packages/plugin-web-tokens/src/layout.css",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/guards.tsx",
];
/** The unit's source table of contract r3 (header): every file must be byte-identical in the archive. */
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

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-appearance-native-")));
const snapshot = join(directory, "source");
const profile = join(directory, "profile");
let server = null;
let browser = null;
let main = null;
const pages = [];
let origin = "";
const served = {};

// ---------------------------------------------------------------------------------------------------
// Browser and page sessions (pattern of ../web-features-recovery-native/verify-native-before.mjs, not modified)
// ---------------------------------------------------------------------------------------------------
async function launch() {
  const proc = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
    "--disable-component-update", "--disable-sync", "--disable-default-apps", "--disable-domain-reliability",
    "--disable-client-side-phishing-detection", "--metrics-recording-only", "--use-mock-keychain",
    "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
    "--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--window-size=1280,900", "about:blank",
  ], { stdio: "ignore" });
  const exited = new Promise((resolve) => proc.once("exit", (code, signal) => resolve({ code, signal })));
  let port = 0;
  for (let attempt = 0; attempt < 300 && !port; attempt += 1) {
    try {
      const candidate = Number(readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]);
      if (candidate > 0) port = candidate;
    } catch { /* not yet written */ }
    if (!port) await delay(50);
  }
  if (!port) throw Error("PRECONDITION: Chrome DevToolsActivePort never became positive");
  return { proc, exited, port };
}
async function attach(target, name) {
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  const pending = new Map();
  const listeners = [];
  let commandId = 0;
  const page = { name, id: target.id, socket, pending, listeners, runnerNavigating: false };
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails ?? {};
      runtimeErrors.push({ page: name, kind: "exception", afterCheck: lastCheckId, text: String(details.exception?.description ?? details.text ?? "").slice(0, 600) });
    } else if (message.method === "Runtime.consoleAPICalled") {
      const text = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ").slice(0, 600);
      if (message.params.type === "error" || message.params.type === "assert") runtimeErrors.push({ page: name, kind: `console.${message.params.type}`, afterCheck: lastCheckId, text });
      else if (message.params.type === "warning") consoleWarnings.push(`${name}: ${text.slice(0, 200)}`);
    } else if (message.method === "Page.javascriptDialogOpening") {
      if (message.params.type === "beforeunload" && page.runnerNavigating) {
        dialogs.push({ page: name, type: "beforeunload", message: message.params.message, expected: true, accepted: true, reason: "runner-initiated navigation", afterCheck: lastCheckId });
        page.cdp("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
      } else {
        const plan = dialogPlan.shift() ?? null;
        dialogs.push({ page: name, type: message.params.type, message: message.params.message, expected: Boolean(plan), accepted: plan ? plan.accept : false, afterCheck: lastCheckId });
        page.cdp("Page.handleJavaScriptDialog", { accept: plan ? plan.accept : false }).catch(() => {});
      }
    }
    for (const listener of listeners) listener(message);
    if (message.id && pending.has(message.id)) {
      const job = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) job.reject(Error(JSON.stringify(message.error)));
      else job.resolve(message.result);
    }
  });
  socket.addEventListener("close", () => {
    for (const job of pending.values()) job.reject(Error("CDP socket closed"));
    pending.clear();
  });
  page.cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  await page.cdp("Runtime.enable");
  await page.cdp("Page.enable");
  await page.cdp("DOMStorage.enable");
  await page.cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  pages.push(page);
  return page;
}
async function openPage(name) {
  const response = await fetch(`http://127.0.0.1:${browser.port}/json/new?about:blank`, { method: "PUT" });
  const target = await response.json();
  return attach(target, name);
}
async function closePage(page) {
  try { await fetch(`http://127.0.0.1:${browser.port}/json/close/${page.id}`); } catch { /* already gone */ }
  try { page.socket.close(); } catch { /* already closed */ }
  pages.splice(pages.indexOf(page), 1);
  await delay(300);
}
async function closeBrowser() {
  const current = browser;
  browser = null;
  if (!current) return;
  try { main?.socket.send(JSON.stringify({ id: 999999, method: "Browser.close" })); } catch { /* socket gone */ }
  const graceful = await Promise.race([current.exited.then(() => true), delay(8000).then(() => false)]);
  if (!graceful) {
    current.proc.kill("SIGTERM");
    await Promise.race([current.exited, delay(3000)]);
    if (current.proc.exitCode === null && current.proc.signalCode === null) current.proc.kill("SIGKILL");
  }
  for (const page of pages) { try { page.socket.close(); } catch { /* already closed */ } }
}
const ev = async (page, expression) => {
  const result = await page.cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw Error(`Page evaluation failed (${page.name}): ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`);
  return result.result.value;
};
const until = async (page, expression, timeout = 6000) => {
  const deadline = Date.now() + timeout;
  for (;;) {
    try {
      if (await ev(page, expression)) return true;
    } catch { /* context not ready yet */ }
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
// Surface constants (contract §2, §3 item 4, §5)
// ---------------------------------------------------------------------------------------------------
const OWNER = "appearance-native-A";
const MARKER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:committed-generation`;
const MARKER = JSON.stringify({ generation: "g1", migrationId: "appearance-native", previous: null });
const SEVEN = ["xai_pref_lang", "xai_pref_theme", "xai_pref_density", "xai_pref_font_scale", "xai_accent_hue", "xai_rail_pos", "xai_bg_tone"];
const ROOT_KEYS = ["xai_pref_lang", "xai_pref_theme", "xai_pref_density", "xai_pref_font_scale"];
const REGISTERED_KEYS = ["xai_accent_hue", "xai_rail_pos", "xai_bg_tone"];
const FIELD_KEY = { lang: "xai_pref_lang", theme: "xai_pref_theme", density: "xai_pref_density", fontScale: "xai_pref_font_scale", accentHue: "xai_accent_hue", railPos: "xai_rail_pos", bgTone: "xai_bg_tone" };
/** Hard-coded product strings the contract cites (Topbar.tsx:41–44, AppearancePane.tsx:225–240, 327, 412; SettingsFooter.tsx:98–102). */
const TOPBAR_LANG = { en: "English", zh: "中文" };
const TOPBAR_SHORT = { en: "EN", zh: "中文" };
const SAVE = { en: "Save & apply", zh: "保存生效" };
const SAVED = { en: "Saved", zh: "已保存" };
const RESET = { en: "Reset to defaults", zh: "恢复默认" };
const FONT_SLIDER = { en: "Font scale", zh: "字体大小" };
/** Contract §5 normative wording (fixed now; the before product has none of it). */
const STATUS_NAME = { en: "Appearance changes not saved. Review them in Settings.", zh: "外观更改未保存，前往设置查看。" };
const RETRY_ALL = { en: "Retry all", zh: "全部重试" };
const PANE = '.settings-detail[data-pane="appearance"]';
/** H3 runs the Topbar on a non-Settings route; /app/tasks shows the Tasks module's own save-failure banner in this composition. */
const H3_ROUTE = "/app/calendar";
const READY_APP = "(!!window.verify && !!window.__native && !!document.querySelector('.app header.topbar') && !document.querySelector('.account-data-gate') && verify.scope().kind === 'account')";
const READY_PANE = `(${READY_APP} && !!document.querySelector('${PANE} .appearance-pane'))`;
const CRASHED = "(!!window.__native && !!__native.routeError())";
const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });
let labels = null;
const paneLabels = (lang) => ({ language: labels[lang].language, theme: labels[lang].theme, density: labels[lang].density, accent: labels[lang].accent, bg: labels[lang].bg, rail: labels[lang].rail, font: labels[lang].font });
const summaryFor = (lang, theme, density) => `${TOPBAR_SHORT[lang]} · ${labels[lang][theme]} · ${labels[lang][density]}`;
const presetName = (id, lang) => labels.presets.find((preset) => preset.id === id)[lang];

// ---------------------------------------------------------------------------------------------------
// Page helpers
// ---------------------------------------------------------------------------------------------------
async function setViewport(page, width, height, mobile) {
  await page.cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await delay(150);
}
async function navigate(page, url) {
  page.runnerNavigating = true;
  try {
    await page.cdp("Page.navigate", { url });
  } finally {
    setTimeout(() => { page.runnerNavigating = false; }, 2500);
  }
}
async function screenshot(page, name, details = {}) {
  const shot = await page.cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const buffer = Buffer.from(shot.data, "base64");
  const file = `native-${short}-${suffix}-${mode}-${name}.png`;
  writeFileSync(join(evidenceDir, file), buffer, { flag: "wx" });
  const entry = { file, page: page.name, sha256: sha256(buffer), bytes: buffer.length, png: pngSize(buffer), ...details };
  artifacts.push(entry);
  record("screenshot", entry);
  return entry;
}
let selfTested = false;
async function seed(page, entries, label) {
  await navigate(page, `${origin}/seed`);
  pre(`${label}:seed-page-loaded-with-prelude-only`, await until(page, "document.readyState === 'complete' && location.pathname === '/seed' && !!window.__native && !window.verify", 10000));
  if (!selfTested) {
    const result = await ev(page, "__native.selfTest()");
    record("instrument-selftest", { page: "/seed (prelude only, no product code)", result });
    pre("instruments:storage-faults-attempt-logging-f-b002-dispatch-counter-network-dom-frames", result.setDeniedThrew && result.setDeniedNeverStored && result.setDelegated
      && result.removeDeniedThrew && result.removeDeniedKeptBytes && result.removeDelegated && result.getLogged && result.noNestedStorageCalls
      && isDeepStrictEqual(result.attemptsLogged, ["set:denied", "set:ok", "remove:denied", "remove:ok"])
      && isDeepStrictEqual(result.dispatchCounted, ["null:true", "xai_native_selftest:true"])
      && isDeepStrictEqual(result.deliveredCounted, ["null:false", "xai_native_selftest:false"])
      && result.nonLocalFetchRefusedAndLogged && result.domGateAddedAndRemoved && result.htmlAttributeLogged && result.framesSampled > 0, { result });
    selfTested = true;
  }
  const stored = await ev(page, `(() => { __native.native.clear(); const seeds = ${JSON.stringify(entries)}; for (const [key, value] of Object.entries(seeds)) __native.native.set(key, value); return __native.native.snapshot(); })()`);
  pre(`${label}:seeded-exact-bytes`, isDeepStrictEqual(stored, entries), { stored });
}
async function settle(page, ready, label, allowCrash) {
  const settled = await until(page, `${ready} || ${CRASHED}`, 20000);
  await delay(900);
  const state = await ev(page, `({ crashed: ${CRASHED}, ready: ${ready}, verifyPresent: !!window.verify, location: window.verify ? verify.location() : null,
    scope: window.verify ? verify.scope() : null, auth: window.verify ? verify.authCalls() : null, markerKey: window.verify ? verify.markerKey : null,
    rail: document.querySelectorAll('.app-rail .rail-items .rail-btn').length, pet: !!document.querySelector('.pet-wrap'), topbar: !!document.querySelector('header.topbar'),
    network: __native.network.filter((entry) => !entry.local).length, routeError: __native.routeError(), path: location.pathname,
    body: (document.body.innerText || '').slice(0, 300) })`);
  pre(`${label}:document-loaded-and-bundle-evaluated`, settled && state.verifyPresent, { state });
  pre(`${label}:auth-session-context-served-by-real-provider`, state.auth.getSession >= 1 && state.markerKey === MARKER_KEY, { auth: state.auth, markerKey: state.markerKey });
  pre(`${label}:account-data-gate-activated-account`, state.scope.kind === "account" && state.scope.accountId === OWNER && state.scope.generation === "g1", { scope: state.scope });
  if (!allowCrash) {
    pre(`${label}:production-app-mounted`, state.ready && !state.crashed, { state });
    pre(`${label}:production-surfaces-present`, state.rail > 0 && state.topbar, { state });
  }
  pre(`${label}:no-non-local-network-attempt`, state.network === 0);
  const view = await ev(page, "__native.window(0)");
  return { ...state, mountWrites: view.attempts.filter((entry) => SEVEN.includes(entry.key)), otherMountWrites: view.attempts.filter((entry) => !SEVEN.includes(entry.key)).map((entry) => `${entry.op}:${entry.key}`) };
}
async function mount(page, path, label, { allowCrash = false } = {}) {
  const errorsBefore = runtimeErrors.length;
  await navigate(page, `${origin}${path}`);
  const ready = path.includes("/settings/appearance") ? READY_PANE : READY_APP;
  const state = await settle(page, ready, label, allowCrash);
  const exceptions = runtimeErrors.slice(errorsBefore).filter((entry) => entry.kind === "exception");
  if (!allowCrash) pre(`${label}:no-uncaught-exception-at-mount`, exceptions.length === 0, { exceptions: exceptions.slice(0, 3) });
  if (!labels && state.verifyPresent) labels = await ev(page, "verify.labels");
  return { ...state, errors: runtimeErrors.slice(errorsBefore) };
}
async function reload(page, path, label) {
  const errorsBefore = runtimeErrors.length;
  page.runnerNavigating = true;
  try { await page.cdp("Page.reload", { ignoreCache: true }); } finally { setTimeout(() => { page.runnerNavigating = false; }, 2500); }
  await delay(200);
  const state = await settle(page, path.includes("/settings/appearance") ? READY_PANE : READY_APP, label, false);
  const exceptions = runtimeErrors.slice(errorsBefore).filter((entry) => entry.kind === "exception");
  pre(`${label}:no-uncaught-exception-after-reload`, exceptions.length === 0, { exceptions: exceptions.slice(0, 3) });
  return state;
}
async function bytesOf(page, keys) {
  return ev(page, `Object.fromEntries(${JSON.stringify(keys)}.map((key) => [key, __native.native.get(key)]))`);
}
async function devtoolsBytes(page, keys) {
  const { entries } = await page.cdp("DOMStorage.getDOMStorageItems", { storageId: { storageKey: `${origin}/`, isLocalStorage: true } });
  const map = Object.fromEntries(entries);
  return Object.fromEntries(keys.map((key) => [key, Object.hasOwn(map, key) ? map[key] : null]));
}
const probe = (page, lang) => ev(page, `__native.probe(${lang ? JSON.stringify(paneLabels(lang)) : "null"})`);
/** Tags exactly one element (filterSource: a function source taking the scope root and returning an array). */
async function tag(page, scopeSelector, filterSource, label) {
  const found = await ev(page, `(() => {
    document.querySelectorAll("[data-native-target]").forEach((element) => element.removeAttribute("data-native-target"));
    const root = document.querySelector(${JSON.stringify(scopeSelector)});
    if (!root) return -1;
    const matches = (${filterSource})(root);
    if (matches.length === 1) matches[0].setAttribute("data-native-target", "1");
    return matches.length;
  })()`);
  pre(`${label}:exactly-one-control`, found === 1, { found, scopeSelector });
  return '[data-native-target="1"]';
}
const byName = (selector, name) => `(root) => [...root.querySelectorAll(${JSON.stringify(selector)})].filter((element) => ((element.getAttribute("aria-label") ?? element.textContent) || "").replace(/\\s+/g, " ").trim() === ${JSON.stringify(name)})`;
async function hit(page, selector, label, block = "center") {
  const found = await ev(page, `(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return false; element.scrollIntoView({ block: ${JSON.stringify(block)}, inline: "nearest" }); return true; })()`);
  pre(`${label}:control-present`, found, { selector });
  await delay(150);
  const point = await ev(page, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { x, y, width: rect.width, height: rect.height, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName.toLowerCase() + "." + (typeof hit.className === "string" ? hit.className : "") : null };
  })()`);
  pre(`${label}:centre-hit-test`, point.hit, { selector, hitTarget: point.hitTarget, point });
  return point;
}
async function click(page, selector, label) {
  const point = await hit(page, selector, label);
  await page.cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await page.cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await page.cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(80);
  return point;
}
const KEYS = {
  Tab: { code: "Tab", vk: 9 },
  Escape: { code: "Escape", vk: 27 },
  ArrowRight: { code: "ArrowRight", vk: 39 },
};
async function press(page, key) {
  const def = KEYS[key];
  await page.cdp("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code: def.code, windowsVirtualKeyCode: def.vk, nativeVirtualKeyCode: def.vk });
  await page.cdp("Input.dispatchKeyEvent", { type: "keyUp", key, code: def.code, windowsVirtualKeyCode: def.vk, nativeVirtualKeyCode: def.vk });
  await delay(60);
}
async function parkMouse(page) {
  await page.cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 });
  await delay(60);
}
async function openTopbar(page, label) {
  const open = await ev(page, "!!document.querySelector('.topbar #topbar-pref-panel[role=\"dialog\"]')");
  if (!open) await click(page, ".topbar .topbar-pref-trigger", `${label}:topbar-trigger`);
  pre(`${label}:topbar-popover-open`, await until(page, "!!document.querySelector('.topbar #topbar-pref-panel[role=\"dialog\"]')", 3000));
}
async function chooseTopbar(page, name, label) {
  await openTopbar(page, label);
  const selector = await tag(page, ".topbar #topbar-pref-panel", byName('[role="menuitemradio"]', name), `${label}:topbar-option:${name}`);
  await click(page, selector, `${label}:topbar-option:${name}`);
}
async function closeTopbar(page, label) {
  if (await ev(page, "!!document.querySelector('.topbar #topbar-pref-panel[role=\"dialog\"]')")) await press(page, "Escape");
  pre(`${label}:topbar-popover-closed`, await until(page, "!document.querySelector('.topbar #topbar-pref-panel[role=\"dialog\"]')", 3000));
}
async function hidePet(page, lang, label) {
  pre(`${label}:pet-on-before-toggle`, await ev(page, "!!document.querySelector('.pet-wrap')"));
  const mark = await ev(page, "__native.mark()");
  const selector = await tag(page, ".app-rail .rail-bottom", byName("button", labels[lang].pet), `${label}:rail-pet-toggle`);
  await click(page, selector, `${label}:rail-pet-toggle`);
  pre(`${label}:pet-hidden-through-the-product-rail-toggle`, await until(page, "!document.querySelector('.pet-wrap')", 3000));
  const writes = (await ev(page, `__native.window(${mark})`)).attempts;
  pre(`${label}:pet-toggle-made-no-storage-writes`, writes.length === 0, { writes });
  await parkMouse(page);
}
const opsOn = (attempts, key) => attempts.filter((entry) => entry.key === key && (entry.op === "set" || entry.op === "remove"))
  .map((entry) => `${entry.op}:${entry.value ?? ""}${entry.outcome === "denied" ? "!denied" : ""}`);
const writesByKey = (attempts) => Object.fromEntries(SEVEN.map((key) => [key, opsOn(attempts, key)]));
const flashSummary = (frames, lang) => {
  const flashing = frames.filter((frame) => frame.saved || frame.save === SAVED[lang]);
  const first = flashing[0] ?? null;
  const last = flashing.at(-1) ?? null;
  return { renderedFrames: frames.length, framesShowingSaved: flashing.length, firstSavedFrameT: first?.t ?? null, lastSavedFrameT: last?.t ?? null,
    savedSpanMs: first && last ? Math.round(last.t - first.t) : null, lastFrameText: frames.at(-1)?.save ?? null };
};

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
let harnessError = null;
try {
  mkdirSync(snapshot);
  execFileSync("tar", ["-x", "-C", snapshot], { input: execFileSync("git", ["archive", resolved], { cwd: root, maxBuffer: 300 * 1024 * 1024 }) });
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
  const forbiddenRoots = [...new Set([dependencyRoot, root].map((base) => realpathSync(base)))]
    .flatMap((base) => ["packages", "apps", "docs"].map((tree) => join(base, tree) + sep));
  const guardViolations = [];
  const pinnedRepo = [];
  const archiveModules = new Set();
  const archiveRoot = snapshot + sep;
  const pinAndGuard = { name: "appearance-native-archive-pin-guard", setup(buildApi) {
    buildApi.onResolve({ filter: /^@repo\// }, (args) => {
      const parts = args.path.split("/");
      const entry = aliases.get(parts.slice(0, 2).join("/"));
      if (!entry) throw Error(`Unknown workspace package ${args.path}`);
      const sub = parts.length > 2 ? `./${parts.slice(2).join("/")}` : ".";
      let target = entry.pkg.exports?.[sub];
      if (target && typeof target === "object") target = target.import ?? target.default;
      if (typeof target !== "string") throw Error(`Unresolved pinned export ${args.path}`);
      pinnedRepo.push(args.path);
      return { path: join(entry.folder, target) };
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
    stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: "native-app.tsx" },
    absWorkingDir: snapshot,
    plugins: [pinAndGuard],
    nodePaths: [join(dependencyRoot, "apps/web/node_modules")],
    loader: { ".png": "dataurl", ".svg": "dataurl", ".woff2": "dataurl", ".woff": "dataurl" },
    bundle: true, format: "esm", platform: "browser", write: false, metafile: true, logLevel: "silent",
    outfile: join(directory, "bundle.js"),
    define: { "import.meta.env": "{}" },
  });
  const js = built.outputFiles.find((file) => file.path.endsWith(".js")).text;
  const css = built.outputFiles.find((file) => file.path.endsWith(".css")).text;
  const inputs = Object.keys(built.metafile.inputs);
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== "native-app.tsx" && !input.startsWith("<define:"));
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const missingRequired = REQUIRED_MODULES.filter((file) => !inputs.includes(file) || (!archiveModules.has(file) && !file.endsWith(".css")));
  const requiredHashes = Object.fromEntries(REQUIRED_MODULES.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const contractSourceActual = Object.fromEntries(Object.keys(CONTRACT_SOURCE_HASHES).map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const contractSourceMismatches = Object.entries(CONTRACT_SOURCE_HASHES).filter(([file, hash]) => contractSourceActual[file] !== hash).map(([file]) => file);

  const appPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>XAI Web (Appearance native before)</title><link rel="stylesheet" href="/__native/bundle.css"><script src="/__native/prelude.js"></script></head><body><div id="root"></div><script type="module" src="/__native/bundle.js"></script></body></html>';
  const seedPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>seed</title><script src="/__native/prelude.js"></script></head><body><p>seed page: prelude only, no product code</p></body></html>';
  server = createServer((request, response) => {
    const path = new URL(request.url, "http://127.0.0.1").pathname;
    const category = path.startsWith("/__native/") || path === "/seed" || path === "/favicon.ico" ? path : "app-document";
    served[category] = (served[category] ?? 0) + 1;
    response.setHeader("Cache-Control", "no-store");
    if (path === "/__native/prelude.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(preludeSource); return; }
    if (path === "/__native/bundle.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(js); return; }
    if (path === "/__native/bundle.css") { response.setHeader("Content-Type", "text/css; charset=utf-8"); response.end(css); return; }
    if (path === "/favicon.ico") { response.statusCode = 204; response.end(); return; }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(path === "/seed" ? seedPage : appPage);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;

  browser = await launch();
  const targets = await (await fetch(`http://127.0.0.1:${browser.port}/json/list`)).json();
  main = await attach(targets.find((target) => target.type === "page"), "A");
  await main.cdp("Page.bringToFront");
  const version = await main.cdp("Browser.getVersion");
  record("baseline", {
    requested, resolved, resolvedTree, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix,
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock), extracted: sha256(extractedLock), contractGate: LOCKFILE_GATE_SHA256 },
    fileSha256: { "verify-native-before.mjs": runnerSha256, "native-app.tsx": sha256(fixtureSource), "native-prelude.js": sha256(preludeSource) },
    contract: { path: CONTRACT_PATH, sha256AtHead: contractSha256, expected: CONTRACT_SHA256 },
    bundleSha256: sha256(js), bundleCssSha256: sha256(css),
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
    requiredModules: { count: REQUIRED_MODULES.length, missing: missingRequired, sha256: requiredHashes },
    contractSourceTable: { files: Object.keys(CONTRACT_SOURCE_HASHES).length, mismatches: contractSourceMismatches, sha256: contractSourceActual },
    origin: "127.0.0.1 (ephemeral port); every other host resolves to NOTFOUND",
  });
  pre("baseline:docs-head-product-tree-equals-revision", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === LOCKFILE_GATE_SHA256 && sha256(archiveLock) === LOCKFILE_GATE_SHA256 && sha256(extractedLock) === LOCKFILE_GATE_SHA256);
  pre("baseline:contract-r3-hash", contractSha256 === CONTRACT_SHA256, { contractSha256 });
  pre("baseline:guard-no-module-from-a-checkout", guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre("baseline:every-required-reader-and-host-module-bundled-from-archive", missingRequired.length === 0, { missingRequired });
  pre("baseline:archive-equals-contract-r3-source-table", contractSourceMismatches.length === 0, { contractSourceMismatches });

  // =============================================================================================
  // H3: a denied Topbar language, theme or density write (Topbar on /app/calendar), EN and ZH
  // =============================================================================================
  if (mode === "h3") {
    await setViewport(main, 1280, 900, false);
    for (const lang of ["en", "zh"]) {
      for (const field of ["lang", "theme", "density"]) {
        const id = `h3:${lang}:${field}`;
        const key = FIELD_KEY[field];
        const seeds = { [MARKER_KEY]: MARKER, xai_pref_lang: JSON.stringify(lang), xai_pref_theme: JSON.stringify("light"), xai_pref_density: JSON.stringify("comfortable") };
        await seed(main, seeds, id);
        const mounted = await mount(main, H3_ROUTE, id);
        pre(`${id}:zero-mount-writes-on-the-seven-keys`, mounted.mountWrites.length === 0, { mountWrites: mounted.mountWrites, otherMountWrites: mounted.otherMountWrites });
        const before = await probe(main, null);
        pre(`${id}:displays-seeded-values`, before.uiLang === lang && before.html.theme === "light" && before.html.density === "comfortable" && before.topbar.summary === summaryFor(lang, "light", "comfortable"), { before: { uiLang: before.uiLang, html: before.html, summary: before.topbar.summary } });
        pre(`${id}:no-failure-feedback-surface-before-the-choice`, !before.feedback.topbarStatus && before.feedback.alerts.length === 0 && before.feedback.retryButtons.length === 0 && !before.feedback.notSavedText, { feedbackAtMount: before.feedback });
        const choice = field === "lang" ? (lang === "en" ? "zh" : "en") : field === "theme" ? "dark" : "compact";
        const optionName = field === "lang" ? TOPBAR_LANG[choice] : labels[lang][choice];
        await ev(main, `__native.denySet(${JSON.stringify(key)})`);
        const mark = await ev(main, "__native.mark()");
        await chooseTopbar(main, optionName, id);
        await delay(600);
        const view = await ev(main, `__native.window(${mark})`);
        const attemptsOnKey = view.attempts.filter((entry) => entry.key === key);
        pre(`${id}:fault-armed-and-observed`, attemptsOnKey.length === 1 && attemptsOnKey[0].op === "set" && attemptsOnKey[0].outcome === "denied" && attemptsOnKey[0].value === JSON.stringify(choice), { attempts: view.attempts });
        const bytes = await bytesOf(main, SEVEN);
        const dtBytes = await devtoolsBytes(main, SEVEN);
        pre(`${id}:faulted-bytes-unchanged`, bytes[key] === seeds[key] && dtBytes[key] === seeds[key], { bytes, dtBytes });
        const shownLang = field === "lang" ? choice : lang;
        const after = await probe(main, null);
        const checked = (after.topbar.options ?? []).filter((option) => option.checked === "true").map((option) => option.name);
        const expectedTheme = field === "theme" ? "dark" : "light";
        const expectedDensity = field === "density" ? "compact" : "comfortable";
        const applied = after.uiLang === shownLang && after.html.theme === expectedTheme && after.html.density === expectedDensity
          && after.topbar.summary === summaryFor(shownLang, expectedTheme, expectedDensity)
          && checked.includes(field === "lang" ? TOPBAR_LANG[choice] : labels[shownLang][choice]);
        const otherWrites = view.attempts.filter((entry) => entry.key !== key && SEVEN.includes(entry.key));
        record("observation", { id: `${id}:after-denied-choice`, choice, optionName, attempts: view.attempts.map((entry) => `${entry.op}:${entry.key}=${entry.value ?? ""}:${entry.outcome}`), bytes, devtoolsBytes: dtBytes,
          display: { uiLang: after.uiLang, html: after.html, summary: after.topbar.summary, checked, controls: after.topbar.controls }, feedback: after.feedback, otherSevenKeyWrites: otherWrites });
        fact(`H3-${lang}-${field}-a:applied-while-bytes-keep-old-value`, {
          hypothesis: "H3", claim: `A failed Topbar ${field} choice (${optionName}) is applied while the bytes keep the old value`,
          observed: applied && bytes[key] === seeds[key],
          evidence: { applied, uiLang: after.uiLang, html: { theme: after.html.theme, density: after.html.density }, summary: after.topbar.summary, checked, storedBytes: bytes[key], seededBytes: seeds[key] },
        });
        verdict(`H3-${lang}-${field}-b:silent`, {
          hypothesis: "H3", claim: `The failed Topbar ${field} write is silent: no Topbar status, message, Retry, Discard or export`,
          requirement: "§5 item 5 and §7 item 2 (host row b): the failed choice stays displayed and applied, and the Topbar status [data-testid=\"appearance-status\"] (accessible name \"" + STATUS_NAME[shownLang] + "\") appears, leading to the field's not-saved message with Retry and Discard",
          holds: after.feedback.topbarStatus,
          evidence: { feedback: after.feedback },
        });
        await screenshot(main, `${lang}-${field}-applied`, { state: `${lang.toUpperCase()} session on ${H3_ROUTE}: Topbar ${field} choice "${optionName}" with setItem(${key}) denied; popover still open; bytes ${bytes[key]}` });
        await closeTopbar(main, id);
        await ev(main, "__native.restore()");
        const dialogsBefore = dialogs.length;
        const reloaded = await reload(main, H3_ROUTE, `${id}:reload`);
        const after2 = await probe(main, null);
        const bytes2 = await bytesOf(main, SEVEN);
        const reverted = after2.uiLang === lang && after2.html.theme === "light" && after2.html.density === "comfortable" && after2.topbar.summary === summaryFor(lang, "light", "comfortable");
        record("observation", { id: `${id}:after-reload`, display: { uiLang: after2.uiLang, html: after2.html, summary: after2.topbar.summary }, bytes: bytes2, mountWritesOnSevenKeys: reloaded.mountWrites, unloadDialogsDuringReload: dialogs.slice(dialogsBefore) });
        fact(`H3-${lang}-${field}-c:reverts-after-reload`, {
          hypothesis: "H3", claim: `After a reload the ${field} choice is lost: the old value is displayed and applied`,
          observed: reverted && bytes2[key] === seeds[key],
          evidence: { uiLang: after2.uiLang, html: { theme: after2.html.theme, density: after2.html.density }, summary: after2.topbar.summary, bytes: bytes2[key], zeroMountWrites: reloaded.mountWrites.length === 0, beforeunloadPrompts: dialogs.slice(dialogsBefore).length },
        });
      }
    }
  }

  // =============================================================================================
  // H5: Topbar theme/density change with the pane mounted, then "Save & apply", EN and ZH
  // =============================================================================================
  if (mode === "h5") {
    await setViewport(main, 1280, 900, false);
    for (const lang of ["en", "zh"]) {
      const id = `h5:${lang}`;
      const seeds = { [MARKER_KEY]: MARKER, xai_pref_lang: JSON.stringify(lang) };
      await seed(main, seeds, id);
      const mounted = await mount(main, "/app/settings/appearance", id);
      pre(`${id}:zero-mount-writes-on-the-seven-keys`, mounted.mountWrites.length === 0, { mountWrites: mounted.mountWrites });
      await hidePet(main, lang, id);
      const before = await probe(main, lang);
      pre(`${id}:pane-and-topbar-show-light-comfortable`, before.uiLang === lang && before.pane.theme === labels[lang].light && before.pane.density === labels[lang].comfortable
        && before.html.theme === "light" && before.html.density === "comfortable" && before.topbar.summary === summaryFor(lang, "light", "comfortable"), { before: { pane: before.pane, html: before.html, summary: before.topbar.summary } });
      const mark1 = await ev(main, "__native.mark()");
      await chooseTopbar(main, labels[lang].dark, `${id}:topbar-dark`);
      await delay(300);
      await chooseTopbar(main, labels[lang].compact, `${id}:topbar-compact`);
      await delay(300);
      await closeTopbar(main, id);
      await parkMouse(main);
      await delay(400);
      const view1 = await ev(main, `__native.window(${mark1})`);
      const bytes1 = await bytesOf(main, SEVEN);
      pre(`${id}:topbar-committed-dark-and-compact-bytes`, bytes1.xai_pref_theme === JSON.stringify("dark") && bytes1.xai_pref_density === JSON.stringify("compact"), { bytes1, attempts: view1.attempts });
      const afterTopbar = await probe(main, lang);
      pre(`${id}:topbar-choice-applied-to-document-and-summary`, afterTopbar.html.theme === "dark" && afterTopbar.html.density === "compact" && afterTopbar.topbar.summary === summaryFor(lang, "dark", "compact"), { html: afterTopbar.html, summary: afterTopbar.topbar.summary });
      record("observation", { id: `${id}:after-topbar`, attempts: view1.attempts.map((entry) => `${entry.op}:${entry.key}=${entry.value ?? ""}:${entry.outcome}`), bytes: bytes1, pane: afterTopbar.pane, html: afterTopbar.html, summary: afterTopbar.topbar.summary });
      verdict(`H5-${lang}-a:topbar-change-not-reflected-in-pane`, {
        hypothesis: "H5", claim: "With the pane mounted, a Topbar theme and density change is not reflected in the pane",
        requirement: "§10 item 3 (exactly one controller in production): a Topbar edit is visible in the pane in the same frame (the Dark theme card active, Compact selected)",
        holds: afterTopbar.pane.theme === labels[lang].dark && afterTopbar.pane.density === labels[lang].compact,
        evidence: { paneTheme: afterTopbar.pane.theme, paneDensity: afterTopbar.pane.density, documentTheme: afterTopbar.html.theme, documentDensity: afterTopbar.html.density, summary: afterTopbar.topbar.summary },
      });
      await screenshot(main, `${lang}-after-topbar-change`, { state: `${lang.toUpperCase()}: after Topbar Dark and Compact (committed); the pane still shows Light/Comfortable selected; pet hidden through the rail toggle` });
      const saveSelector = `${PANE} [data-testid="settings-footer-save"]`;
      pre(`${id}:save-and-apply-present-with-its-label`, await ev(main, `(document.querySelector(${JSON.stringify(saveSelector)})?.textContent ?? "").trim() === ${JSON.stringify(SAVE[lang])}`));
      const mark2 = await ev(main, "__native.mark()");
      await click(main, saveSelector, `${id}:save-and-apply`);
      await delay(250);
      const flashNow = await probe(main, lang);
      await screenshot(main, `${lang}-after-save-and-apply`, { state: `${lang.toUpperCase()}: immediately after the trusted "${SAVE[lang]}" click` });
      const view2 = await ev(main, `__native.window(${mark2})`);
      const bytes2 = await bytesOf(main, SEVEN);
      const dtBytes2 = await devtoolsBytes(main, SEVEN);
      const checkedAfter = await (async () => { await openTopbar(main, `${id}:inspect`); const state = await probe(main, lang); await closeTopbar(main, `${id}:inspect`); return (state.topbar.options ?? []).filter((option) => option.checked === "true").map((option) => option.name); })();
      record("observation", { id: `${id}:after-save-and-apply`, writes: writesByKey(view2.attempts), bytes: bytes2, devtoolsBytes: dtBytes2, html: flashNow.html, summary: flashNow.topbar.summary, topbarChecked: checkedAfter, pane: flashNow.pane, saveButton: flashNow.pane.footer.save });
      verdict(`H5-${lang}-b:save-and-apply-reverts-topbar-choice`, {
        hypothesis: "H5", claim: "\"Save & apply\" then writes the pane's stale theme and density values, reverting the Topbar choice",
        requirement: "§5 item 4 and A2 (one sequence per field across surfaces; the old button gone): the latest Topbar choice (Dark, Compact) stays committed and displayed",
        holds: bytes2.xai_pref_theme === JSON.stringify("dark") && bytes2.xai_pref_density === JSON.stringify("compact") && flashNow.html.theme === "dark" && flashNow.html.density === "compact",
        evidence: { writes: writesByKey(view2.attempts), bytesAfter: { theme: bytes2.xai_pref_theme, density: bytes2.xai_pref_density }, devtoolsBytesAfter: { theme: dtBytes2.xai_pref_theme, density: dtBytes2.xai_pref_density }, documentAfter: { theme: flashNow.html.theme, density: flashNow.html.density }, summaryAfter: flashNow.topbar.summary, topbarChecked: checkedAfter },
      });
      await delay(2000);
    }
  }

  // =============================================================================================
  // H6: malformed values at load (33), crash captures on four routes, ZH, and a cross-document write
  // =============================================================================================
  if (mode === "h6") {
    await setViewport(main, 1280, 900, false);
    const SOURCE_TABLE = [
      ["xai_pref_lang", '"fr"', "lang-json-fr"], ["xai_pref_lang", "en", "lang-bare-en"], ["xai_pref_lang", "", "lang-empty"], ["xai_pref_lang", "null", "lang-null"], ["xai_pref_lang", "1", "lang-1"], ["xai_pref_lang", '"EN"', "lang-json-upper-en"],
      ["xai_pref_theme", '"neon"', "theme-json-neon"], ["xai_pref_theme", "dark", "theme-bare-dark"], ["xai_pref_theme", '"Dark"', "theme-json-upper-dark"], ["xai_pref_theme", "123", "theme-123"],
      ["xai_pref_density", '"cozy"', "density-json-cozy"], ["xai_pref_density", "{}", "density-object"], ["xai_pref_density", "compact", "density-bare-compact"],
      ["xai_pref_font_scale", "0", "font-scale-0"], ["xai_pref_font_scale", "-1", "font-scale-minus-1"], ["xai_pref_font_scale", "null", "font-scale-null"], ["xai_pref_font_scale", '"big"', "font-scale-json-big"], ["xai_pref_font_scale", "2", "font-scale-2"], ["xai_pref_font_scale", "0.5", "font-scale-0p5"], ["xai_pref_font_scale", '"1"', "font-scale-json-1"],
      ["xai_accent_hue", "abc", "accent-hue-abc"], ["xai_accent_hue", "Infinity", "accent-hue-infinity"], ["xai_accent_hue", "-5", "accent-hue-minus-5"], ["xai_accent_hue", "361", "accent-hue-361"], ["xai_accent_hue", "12.5", "accent-hue-12p5"],
      ["xai_rail_pos", "diagonal", "rail-pos-diagonal"], ["xai_rail_pos", "Left", "rail-pos-upper-left"], ["xai_rail_pos", "", "rail-pos-empty"], ["xai_rail_pos", " left", "rail-pos-space-left"],
      ["xai_bg_tone", "sage", "bg-tone-sage"], ["xai_bg_tone", "neon", "bg-tone-neon"], ["xai_bg_tone", "Mist", "bg-tone-upper-mist"], ["xai_bg_tone", "", "bg-tone-empty"],
    ];
    const H6_LISTED = new Set(["lang-json-fr", "lang-null", "lang-1", "font-scale-0", "font-scale-minus-1", "font-scale-null", "font-scale-json-big", "font-scale-json-1", "accent-hue-infinity"]);
    const SOL_EXTRA = new Set(["lang-json-upper-en"]);
    const ROUTES = ["/app/settings/appearance", "/app/tasks", "/app/calendar", "/app"];
    const loadState = async (label) => ev(main, `({ crashed: ${CRASHED}, routeError: __native.routeError(), app: !!document.querySelector('.app'), topbar: !!document.querySelector('header.topbar'),
      pane: !!document.querySelector('${PANE} .appearance-pane'), html: __native.htmlState(), path: location.pathname, body: (document.body.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 400) })`);
    const sweep = [];
    for (const [key, raw, slug] of SOURCE_TABLE) {
      const id = `h6:sweep:${slug}`;
      await seed(main, { [MARKER_KEY]: MARKER, [key]: raw }, id);
      const errorsBefore = runtimeErrors.length;
      const mounted = await mount(main, "/app/settings/appearance", id, { allowCrash: true });
      const state = await loadState(id);
      const bytes = await bytesOf(main, [key]);
      pre(`${id}:seeded-bytes-still-present`, bytes[key] === raw, { bytes });
      const entry = { key, raw, slug, listedInH6: H6_LISTED.has(slug), solExtra: SOL_EXTRA.has(slug), crashed: state.crashed, routeError: state.routeError, appRendered: state.app, paneRendered: state.pane, html: state.html,
        mountWritesOnSevenKeys: mounted.mountWrites.map((item) => `${item.op}:${item.key}=${item.value ?? ""}`), runtimeErrorsDuringLoad: runtimeErrors.slice(errorsBefore).map((item) => `${item.kind}: ${item.text.slice(0, 160)}`) };
      sweep.push(entry);
      record("observation", { id, ...entry, body: state.body });
      if (state.crashed) {
        await screenshot(main, `en-${slug}`, { state: `EN session (xai_pref_lang absent unless under test): ${key} = ${JSON.stringify(raw)} at load on /app/settings/appearance`, routeError: state.routeError });
        const routes = [{ path: "/app/settings/appearance", crashed: true, routeError: state.routeError, app: state.app }];
        for (const path of ROUTES.slice(1)) {
          await mount(main, path, `${id}:route:${path}`, { allowCrash: true });
          const routeState = await loadState(`${id}:route:${path}`);
          routes.push({ path, landedOn: routeState.path, crashed: routeState.crashed, routeError: routeState.routeError, app: routeState.app });
        }
        record("observation", { id: `${id}:routes`, routes });
        entry.routes = routes;
      }
      if (H6_LISTED.has(slug) || SOL_EXTRA.has(slug) || state.crashed) {
        const routes = entry.routes ?? [{ path: "/app/settings/appearance", crashed: state.crashed }];
        verdict(`H6-en-${slug}`, {
          hypothesis: H6_LISTED.has(slug) ? "H6" : SOL_EXTRA.has(slug) ? "H6 (Sol E2 addition: not in the H6 list)" : "H6 (additional crashing value found by this sweep)",
          claim: `${key} = ${JSON.stringify(raw)} makes every /app route render the route error boundary instead of the product`,
          requirement: "§5 item 2 and §10 item 4 (SHELL-04): an unavailable field displays and applies its default and never throws anywhere: App renders and every /app route works",
          holds: routes.every((route) => !route.crashed),
          evidence: { routes, routeError: state.routeError, mountWritesOnSevenKeys: entry.mountWritesOnSevenKeys },
        });
      }
    }
    record("observation", { id: "h6:sweep-summary", total: sweep.length, crashed: sweep.filter((entry) => entry.crashed).map((entry) => entry.slug), rendered: sweep.filter((entry) => !entry.crashed).map((entry) => entry.slug),
      crashedButNotListed: sweep.filter((entry) => entry.crashed && !entry.listedInH6 && !entry.solExtra).map((entry) => entry.slug), listedButRendered: sweep.filter((entry) => !entry.crashed && (entry.listedInH6 || entry.solExtra)).map((entry) => entry.slug) });
    // ZH sessions for the non-language crashing values.
    for (const [key, raw, slug] of SOURCE_TABLE.filter(([entryKey, , entrySlug]) => entryKey !== "xai_pref_lang" && sweep.find((entry) => entry.slug === entrySlug)?.crashed)) {
      const id = `h6:zh:${slug}`;
      await seed(main, { [MARKER_KEY]: MARKER, xai_pref_lang: JSON.stringify("zh"), [key]: raw }, id);
      await mount(main, "/app/settings/appearance", id, { allowCrash: true });
      const state = await loadState(id);
      await screenshot(main, `zh-${slug}`, { state: `ZH session: ${key} = ${JSON.stringify(raw)} at load on /app/settings/appearance`, routeError: state.routeError });
      await mount(main, "/app/tasks", `${id}:route:/app/tasks`, { allowCrash: true });
      const tasks = await loadState(`${id}:route:/app/tasks`);
      const routes = [{ path: "/app/settings/appearance", crashed: state.crashed, routeError: state.routeError }, { path: "/app/tasks", crashed: tasks.crashed, routeError: tasks.routeError }];
      record("observation", { id, routes, body: state.body });
      verdict(`H6-zh-${slug}`, {
        hypothesis: H6_LISTED.has(slug) ? "H6" : "H6 (additional crashing value found by this sweep)",
        claim: `In a ZH session, ${key} = ${JSON.stringify(raw)} makes /app routes render the route error boundary`,
        requirement: "§5 item 2 and §10 item 4: App renders and every /app route works",
        holds: routes.every((route) => !route.crashed),
        evidence: { routes },
      });
    }
    // Cross-document: an Infinity accent hue written by a second real document into the running App.
    for (const lang of ["en", "zh"]) {
      const id = `h6:cross-document:${lang}`;
      await seed(main, { [MARKER_KEY]: MARKER, xai_pref_lang: JSON.stringify(lang) }, id);
      await mount(main, "/app/settings/appearance", `${id}:A`);
      const B = await openPage("B");
      await setViewport(B, 1280, 900, false);
      await navigate(B, `${origin}/seed`);
      pre(`${id}:B-is-a-second-document-prelude-only`, await until(B, "document.readyState === 'complete' && location.pathname === '/seed' && !!window.__native && !window.verify", 10000));
      const markA = await ev(main, "__native.mark()");
      await ev(B, '__native.native.set("xai_accent_hue", "230")');
      const controlSeen = await until(main, "document.documentElement.style.getPropertyValue('--accent-hue') === '230'", 5000);
      const controlView = await ev(main, `__native.window(${markA})`);
      pre(`${id}:control-valid-cross-document-write-reaches-A-live`, controlSeen && controlView.storageReceived.some((entry) => entry.key === "xai_accent_hue" && entry.newValue === "230" && entry.trusted) && !(await ev(main, CRASHED)), { storageReceived: controlView.storageReceived });
      const errorsBefore = runtimeErrors.length;
      const markB = await ev(main, "__native.mark()");
      await ev(B, '__native.native.set("xai_accent_hue", "Infinity")');
      const crashed = await until(main, CRASHED, 5000);
      await delay(600);
      const view = await ev(main, `__native.window(${markB})`);
      const state = await loadState(id);
      pre(`${id}:A-received-the-trusted-storage-event`, view.storageReceived.some((entry) => entry.key === "xai_accent_hue" && entry.newValue === "Infinity" && entry.trusted), { storageReceived: view.storageReceived });
      record("observation", { id, storageReceived: view.storageReceived, crashed, routeError: state.routeError, app: state.app, body: state.body, runtimeErrors: runtimeErrors.slice(errorsBefore).map((item) => `${item.page}:${item.kind}: ${item.text.slice(0, 200)}`), bytes: await bytesOf(main, ["xai_accent_hue"]) });
      await main.cdp("Page.bringToFront");
      await screenshot(main, `${lang}-cross-document-infinity`, { state: `${lang.toUpperCase()}: document A (running App on /app/settings/appearance) after document B wrote xai_accent_hue = "Infinity"`, routeError: state.routeError });
      verdict(`H6-${lang}-cross-document-infinity`, {
        hypothesis: "H6 (Sol E2 addition: an Infinity accent written by another document)",
        claim: "An Infinity accent hue written by a second document crashes the running App into the route error boundary",
        requirement: "§10 item 4: a malformed value written by a second document while the app is running leaves the idle field in its source state without a throw",
        holds: !state.crashed,
        evidence: { routeError: state.routeError, appStillRendered: state.app },
      });
      await closePage(B);
    }
  }

  // =============================================================================================
  // H10: two real documents; B commits root changes; the idle document A, EN and ZH
  // =============================================================================================
  if (mode === "h10") {
    await setViewport(main, 1280, 900, false);
    for (const lang of ["en", "zh"]) {
      const id = `h10:${lang}`;
      const other = lang === "en" ? "zh" : "en";
      await seed(main, { [MARKER_KEY]: MARKER, xai_pref_lang: JSON.stringify(lang) }, id);
      await mount(main, "/app/settings/appearance", `${id}:A`);
      const aBefore = await probe(main, lang);
      pre(`${id}:A-displays-defaults`, aBefore.uiLang === lang && aBefore.html.theme === "light" && aBefore.html.density === "comfortable" && aBefore.html.fontSize === "16px" && aBefore.html.accentHueInline === "165"
        && aBefore.pane.theme === labels[lang].light && aBefore.pane.fontSlider === "1", { html: aBefore.html, pane: aBefore.pane });
      const B = await openPage("B");
      await setViewport(B, 1280, 900, false);
      await mount(B, "/app/settings/appearance", `${id}:B`);
      await B.cdp("Page.bringToFront");
      const markA = await ev(main, "__native.mark()");
      const markB = await ev(B, "__native.mark()");
      // B1: registered accent (positive control of the cross-document channel).
      const violet = await tag(B, `${PANE} .appearance-pane`, byName(".accent-sw", presetName("violet", lang)), `${id}:B:accent-violet`);
      await click(B, violet, `${id}:B:accent-violet`);
      // B2: font scale 1 -> 1.05 -> 1.1 by trusted arrow keys on the focused range input.
      const fontLabel = await tag(B, `${PANE} .appearance-pane`, `(root) => [...root.querySelectorAll(".setting-row .sr-label")].filter((element) => element.textContent.trim() === ${JSON.stringify(labels[lang].font)})`, `${id}:B:font-row-label`);
      await click(B, fontLabel, `${id}:B:font-row-label`);
      await press(B, "Tab");
      pre(`${id}:B:font-slider-focused-by-tab`, await ev(B, `document.activeElement?.getAttribute("aria-label") === ${JSON.stringify(FONT_SLIDER[lang])} && document.activeElement.type === "range"`), { focus: await ev(B, "__native.focus()") });
      await press(B, "ArrowRight");
      await delay(200);
      await press(B, "ArrowRight");
      await delay(300);
      // B3: Topbar theme, density, then language.
      await chooseTopbar(B, labels[lang].dark, `${id}:B:topbar-dark`);
      await delay(200);
      await chooseTopbar(B, labels[lang].compact, `${id}:B:topbar-compact`);
      await delay(200);
      await chooseTopbar(B, TOPBAR_LANG[other], `${id}:B:topbar-language`);
      await delay(300);
      await closeTopbar(B, `${id}:B`);
      const committed = await bytesOf(B, SEVEN);
      const bWrites = (await ev(B, `__native.window(${markB})`)).attempts.map((entry) => `${entry.op}:${entry.key}=${entry.value ?? ""}:${entry.outcome}`);
      pre(`${id}:B-committed-language-theme-density-font-scale-and-accent`, committed.xai_pref_theme === JSON.stringify("dark") && committed.xai_pref_density === JSON.stringify("compact")
        && committed.xai_pref_lang === JSON.stringify(other) && committed.xai_pref_font_scale === "1.1" && committed.xai_accent_hue === "295", { committed, bWrites });
      await main.cdp("Page.bringToFront");
      await delay(1200);
      const aAfter = await probe(main, lang);
      const viewA = await ev(main, `__native.window(${markA})`);
      const delivered = viewA.storageReceived.map((entry) => `${entry.key}=${entry.newValue}:${entry.trusted ? "trusted" : "synthetic"}`);
      pre(`${id}:A-received-trusted-storage-events-for-every-committed-key`, ["xai_pref_theme", "xai_pref_density", "xai_pref_lang", "xai_pref_font_scale", "xai_accent_hue"].every((key) => viewA.storageReceived.some((entry) => entry.key === key && entry.trusted)), { delivered });
      pre(`${id}:A-registered-accent-propagated-live (positive control)`, aAfter.html.accentHueInline === "295" && aAfter.pane.accentSlider === "295", { html: aAfter.html, accentSlider: aAfter.pane.accentSlider });
      record("observation", { id: `${id}:A-after-B-commits`, bWrites, committed, delivered, A: { uiLang: aAfter.uiLang, html: aAfter.html, summary: aAfter.topbar.summary, pane: aAfter.pane }, aWritesWhileIdle: viewA.attempts.filter((entry) => SEVEN.includes(entry.key)) });
      const reflect = {
        lang: { observed: aAfter.uiLang, expected: other, holds: aAfter.uiLang === other },
        theme: { observed: { document: aAfter.html.theme, pane: aAfter.pane.theme, summary: aAfter.topbar.summary }, expected: "dark", holds: aAfter.html.theme === "dark" },
        density: { observed: { document: aAfter.html.density, pane: aAfter.pane.density }, expected: "compact", holds: aAfter.html.density === "compact" },
        fontScale: { observed: { document: aAfter.html.fontSize, pane: aAfter.pane.fontSlider }, expected: "17.6px / 1.1", holds: aAfter.html.fontSize === "17.6px" },
      };
      for (const [field, entry] of Object.entries(reflect)) {
        verdict(`H10-${lang}-${field}:not-reflected-until-reload`, {
          hypothesis: "H10", claim: `A ${field} change committed in another document is not reflected in the idle document until reload`,
          requirement: "§10 item 5 (host row j): language, theme, density and font scale propagate live to an idle second document (<html>, Topbar and pane)",
          holds: entry.holds, evidence: { observedInA: entry.observed, committedInB: entry.expected },
        });
      }
      await screenshot(main, `${lang}-A-after-B-commits`, { state: `${lang.toUpperCase()}: idle document A after document B committed Dark, Compact, ${TOPBAR_LANG[other]}, font scale 1.1 and accent Violet (295); only the accent propagated` });
      await reload(main, "/app/settings/appearance", `${id}:A-reload`);
      const aReload = await probe(main, other);
      record("observation", { id: `${id}:A-after-reload`, A: { uiLang: aReload.uiLang, html: aReload.html, summary: aReload.topbar.summary, pane: aReload.pane }, scopeTransitionsSinceLoad: await ev(main, "verify.scopeAfter(0)") });
      record("observation", {
        id: `${id}:A-after-reload:pane-mirrors`, kind: "additional native observation (not a contract hypothesis; related to §3 item 2 and H5)",
        claim: "In the new document the pane's DOM-seeded theme, density and font-scale mirrors show the defaults while <html> applies the stored values",
        observed: aReload.pane.theme === labels[other].light && aReload.pane.density === labels[other].comfortable && aReload.pane.fontSlider === "1" && aReload.html.theme === "dark" && aReload.html.density === "compact" && aReload.html.fontSize === "17.6px",
        pane: { theme: aReload.pane.theme, density: aReload.pane.density, fontSlider: aReload.pane.fontSlider, fontReadout: aReload.pane.fontReadout }, document: { theme: aReload.html.theme, density: aReload.html.density, fontSize: aReload.html.fontSize }, summary: aReload.topbar.summary,
      });
      fact(`H10-${lang}-reload:reflected-after-reload`, {
        hypothesis: "H10", claim: "After a reload the idle document shows the other document's committed values",
        observed: aReload.uiLang === other && aReload.html.theme === "dark" && aReload.html.density === "compact" && aReload.html.fontSize === "17.6px",
        evidence: { uiLang: aReload.uiLang, html: aReload.html, summary: aReload.topbar.summary },
      });
      await screenshot(main, `${lang}-A-after-reload`, { state: `document A after its own reload: shows ${TOPBAR_LANG[other]}, Dark, Compact, 110 %` });
      await closePage(B);
    }
  }

  // =============================================================================================
  // H14: (a) 375 px containment; (b) 768x1024 pet over "Save & apply" at both ends of the scroll range
  // =============================================================================================
  if (mode === "h14") {
    const measure = () => ev(main, `(() => {
      const round = (value) => Math.round(value * 100) / 100;
      const box = (element) => { if (!element) return null; const rect = element.getBoundingClientRect(); return { left: round(rect.left), right: round(rect.right), top: round(rect.top), bottom: round(rect.bottom), width: round(rect.width), height: round(rect.height) }; };
      const name = (element) => ((element.getAttribute("aria-label") || element.textContent || element.type || "").replace(/\\s+/g, " ").trim()).slice(0, 40);
      const detail = document.querySelector('${PANE}');
      const pane = detail.querySelector('.appearance-pane');
      const detailStyle = getComputedStyle(detail);
      const detailBox = box(detail);
      const contentLeft = detailBox.left + parseFloat(detailStyle.borderLeftWidth) + parseFloat(detailStyle.paddingLeft);
      const contentRight = detailBox.right - parseFloat(detailStyle.borderRightWidth) - parseFloat(detailStyle.paddingRight);
      const rows = [...pane.querySelectorAll('.setting-row')].map((row) => {
        const control = row.querySelector('.sr-ctrl');
        return {
          label: (row.querySelector('.sr-label')?.textContent ?? '').trim(),
          row: { ...box(row), scrollWidth: row.scrollWidth, clientWidth: row.clientWidth },
          control: control ? { ...box(control), scrollWidth: control.scrollWidth, clientWidth: control.clientWidth } : null,
          controls: [...row.querySelectorAll('button, input')].map((element) => ({ name: name(element), ...box(element) })),
        };
      });
      const footer = pane.querySelector('.pane-footer');
      const chain = [];
      for (let node = pane; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        chain.push({ node: node.tagName.toLowerCase() + (typeof node.className === 'string' && node.className ? '.' + node.className.trim().split(/\\s+/).join('.') : ''), overflowX: style.overflowX, clientWidth: node.clientWidth, scrollWidth: node.scrollWidth, scrollLeft: node.scrollLeft });
      }
      return {
        viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
        title: pane.querySelector('.pane-title')?.textContent ?? null,
        document: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, bodyScrollWidth: document.body.scrollWidth, scrollX },
        detail: { ...detailBox, clientWidth: detail.clientWidth, scrollWidth: detail.scrollWidth, scrollLeft: detail.scrollLeft, overflowX: detailStyle.overflowX, paddingLeft: detailStyle.paddingLeft, paddingRight: detailStyle.paddingRight, contentLeft: round(contentLeft), contentRight: round(contentRight), contentWidth: round(contentRight - contentLeft) },
        pane: { ...box(pane), clientWidth: pane.clientWidth, scrollWidth: pane.scrollWidth },
        rows,
        footer: footer ? { ...box(footer), position: getComputedStyle(footer).position, controls: [...footer.querySelectorAll('button')].map((element) => ({ name: name(element), ...box(element) })) } : null,
        chain,
      };
    })()`);
    const assess = (layout) => {
      const all = [...layout.rows.flatMap((row) => row.controls.map((control) => ({ row: row.label, ...control }))), ...(layout.footer?.controls ?? []).map((control) => ({ row: "footer", ...control }))];
      const pastBox = all.filter((control) => control.right > layout.detail.right + 0.5 || control.left < layout.detail.left - 0.5);
      const pastContent = all.filter((control) => control.right > layout.detail.contentRight + 0.5 || control.left < layout.detail.contentLeft - 0.5);
      const pastViewport = all.filter((control) => control.right > layout.viewport.width + 0.5 || control.left < -0.5);
      const overflowingRows = layout.rows.filter((row) => (row.control && row.control.scrollWidth > row.control.clientWidth) || row.row.scrollWidth > row.row.clientWidth || row.controls.some((control) => control.right > layout.detail.contentRight + 0.5)).map((row) => row.label);
      const ancestorScrollers = layout.chain.filter((entry) => /auto|scroll/.test(entry.overflowX) && entry.scrollWidth > entry.clientWidth).map((entry) => `${entry.node}:${entry.scrollWidth}>${entry.clientWidth}`);
      const visible = (control) => Math.max(0, Math.round((Math.min(control.right, layout.viewport.width) - Math.max(control.left, 0)) * 100) / 100);
      return {
        controls: all.length,
        controlsPastDetailBox: pastBox.map((control) => `${control.row}/${control.name}:${control.left}..${control.right}`),
        controlsPastDetailContentBox: pastContent.map((control) => `${control.row}/${control.name}:${control.left}..${control.right}`),
        controlsPastViewport: pastViewport.map((control) => `${control.row}/${control.name}:${control.left}..${control.right} (visible ${visible(control)} of ${control.width} px; centre ${control.left + control.width / 2 > layout.viewport.width ? "off-screen" : "on-screen"})`),
        maxControlRight: Math.max(...all.map((control) => control.right)),
        detailContentOverflowPx: layout.detail.scrollWidth - layout.detail.clientWidth,
        detailScrolls: layout.detail.scrollWidth > layout.detail.clientWidth || layout.detail.scrollLeft !== 0,
        ancestorScrollers,
        documentScrolls: layout.document.scrollWidth > layout.document.clientWidth || layout.document.scrollX !== 0,
        paneOverflowPx: layout.pane.scrollWidth - layout.pane.clientWidth,
        overflowingRows,
      };
    };
    for (const lang of ["en", "zh"]) {
      const id = `h14a:${lang}`;
      await seed(main, { [MARKER_KEY]: MARKER, xai_pref_lang: JSON.stringify(lang) }, id);
      await setViewport(main, 375, 812, true);
      await mount(main, "/app/settings/appearance", id);
      await parkMouse(main);
      const layout = await measure();
      pre(`${id}:viewport`, layout.viewport.width === 375 && layout.viewport.dpr === 1, { viewport: layout.viewport });
      pre(`${id}:language-rendered`, layout.title === labels[lang].appearance, { title: layout.title });
      pre(`${id}:seven-rows-and-footer-measured`, layout.rows.length === 7 && layout.footer !== null && layout.footer.controls.length === 2, { rows: layout.rows.length });
      const assessment = assess(layout);
      record("observation", { id: `${id}:layout`, layout, assessment });
      verdict(`H14-${lang}-a1:375-controls-escape-settings-detail-or-scroll`, {
        hypothesis: "H14 (a)", claim: `At 375 px (${lang.toUpperCase()}) some Appearance controls overflow .settings-detail horizontally (past its box, or the detail or the document scrolls horizontally)`,
        requirement: "§9 (literal): pane controls are contained horizontally within .settings-detail; neither the document nor the detail scrolls horizontally (the detail's content overflow and its .module-settings scroll container are recorded)",
        holds: assessment.controlsPastDetailBox.length === 0 && !assessment.detailScrolls && assessment.ancestorScrollers.length === 0 && !assessment.documentScrolls,
        evidence: { assessment, detail: layout.detail, document: layout.document },
      });
      verdict(`H14-${lang}-a2:375-controls-past-content-box-or-pane-overflow`, {
        hypothesis: "H14 (a)", claim: `At 375 px (${lang.toUpperCase()}) Appearance controls overflow the .settings-detail content box (into its padding) or the pane overflows horizontally`,
        requirement: "§9 containment as operationalised by the accepted Sticky/Features visual layout checks: the pane does not overflow horizontally and controls stay inside the .settings-detail content box",
        holds: assessment.controlsPastDetailContentBox.length === 0 && assessment.paneOverflowPx <= 0,
        evidence: { assessment, pane: layout.pane, chain: layout.chain.slice(0, 6) },
      });
      // The Background palette row (index 4, the widest card grid) is captured in both languages; any other overflowing row too.
      const shotRows = [...new Set([layout.rows[4].label, ...assessment.overflowingRows])];
      for (const rowLabel of shotRows) {
        const rowIndex = layout.rows.findIndex((row) => row.label === rowLabel);
        await ev(main, `document.querySelectorAll('${PANE} .appearance-pane .setting-row')[${rowIndex}].scrollIntoView({ block: "center", inline: "nearest" })`);
        await delay(250);
        await screenshot(main, `375-${lang}-row${rowIndex + 1}`, { state: `375x812 ${lang.toUpperCase()}: Appearance row "${rowLabel}" scrolled into view`, row: rowLabel, overflowing: assessment.overflowingRows.includes(rowLabel) });
      }
    }
    for (const lang of ["en", "zh"]) {
      const id = `h14b:${lang}`;
      await seed(main, { [MARKER_KEY]: MARKER, xai_pref_lang: JSON.stringify(lang) }, id);
      await setViewport(main, 768, 1024, false);
      await mount(main, "/app/settings/appearance", id);
      await parkMouse(main);
      const pet = await ev(main, "__native.petState()");
      pre(`${id}:viewport-768x1024`, (await ev(main, "innerWidth === 768 && innerHeight === 1024")));
      pre(`${id}:pet-on-at-default-position-not-hovered-or-focused`, pet.present && Math.abs(pet.wrap.left - (768 - 108)) < 1 && Math.abs(pet.wrap.top - (1024 - 108)) < 1 && !pet.hovered && !pet.focusWithin, { pet });
      pre(`${id}:no-stored-pet-position`, (await bytesOf(main, ["xai_pet_pos"])).xai_pet_pos === null);
      pre(`${id}:save-and-apply-labelled`, await ev(main, `(document.querySelector('${PANE} [data-testid="settings-footer-save"]')?.textContent ?? "").trim() === ${JSON.stringify(SAVE[lang])}`));
      for (const where of ["top", "end"]) {
        const scroll = await ev(main, `(() => { const scroller = document.querySelector('.module-settings'); scroller.scrollTop = ${where === "top" ? "0" : "scroller.scrollHeight"}; return { scrollTop: scroller.scrollTop, scrollHeight: scroller.scrollHeight, clientHeight: scroller.clientHeight, maxScrollTop: scroller.scrollHeight - scroller.clientHeight, overflowY: getComputedStyle(scroller).overflowY }; })()`);
        await delay(350);
        const geometry = await ev(main, `(() => {
          const save = document.querySelector('${PANE} [data-testid="settings-footer-save"]');
          const footer = save.closest('.pane-footer');
          const r = __native.rect(save);
          const pet = __native.petState();
          const petBox = pet.swap ? { left: Math.min(pet.wrap.left, pet.swap.left), top: Math.min(pet.wrap.top, pet.swap.top), right: Math.max(pet.wrap.right, pet.swap.right), bottom: Math.max(pet.wrap.bottom, pet.swap.bottom) } : pet.wrap;
          const classify = (x, y) => { const element = document.elementFromPoint(x, y); if (!element) return "none"; if (save.contains(element)) return "save"; if (element.closest('.pet-wrap, .pet-swap-btn, .pet-bubble')) return "pet:" + (element.closest('.pet-swap-btn') ? 'swap' : element.closest('.pet-bubble') ? 'bubble' : 'wrap'); return element.tagName.toLowerCase() + "." + (typeof element.className === 'string' ? element.className.split(' ')[0] : ''); };
          const points = { centre: [r.left + r.width / 2, r.top + r.height / 2], topLeft: [r.left + 0.2 * r.width, r.top + 0.2 * r.height], topRight: [r.right - 0.2 * r.width, r.top + 0.2 * r.height], bottomLeft: [r.left + 0.2 * r.width, r.bottom - 0.2 * r.height], bottomRight: [r.right - 0.2 * r.width, r.bottom - 0.2 * r.height] };
          const hits = Object.fromEntries(Object.entries(points).map(([key, [x, y]]) => [key, { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, hit: classify(x, y) }]));
          const ix = Math.max(0, Math.min(r.right, petBox.right) - Math.max(r.left, petBox.left));
          const iy = Math.max(0, Math.min(r.bottom, petBox.bottom) - Math.max(r.top, petBox.top));
          const footerStyle = getComputedStyle(footer);
          const reset = footer.querySelector('[data-testid="settings-footer-reset"]');
          return { save: r, saveText: save.textContent.trim(), footerPosition: footerStyle.position, footerBottom: footerStyle.bottom, footerJustify: footerStyle.justifyContent, saveIsInlineEnd: footer.lastElementChild === save && (!reset || __native.rect(reset).right <= r.left), footer: __native.rect(footer), pet, petUnion: petBox, intersection: { width: Math.round(ix * 100) / 100, height: Math.round(iy * 100) / 100, area: Math.round(ix * iy * 100) / 100 }, separationPx: Math.round((petBox.left - r.right) * 100) / 100, hits };
        })()`);
        record("observation", { id: `${id}:${where}`, scroll, geometry });
        await screenshot(main, `768-${lang}-${where}`, { state: `768x1024 ${lang.toUpperCase()}: default-position DesktopPet on; .module-settings scrolled to the ${where === "top" ? "top" : "end"} of its range (scrollTop ${scroll.scrollTop} of ${scroll.maxScrollTop})`, hits: geometry.hits });
        const onPet = Object.values(geometry.hits).filter((entry) => entry.hit.startsWith("pet")).length;
        verdict(`H14-${lang}-b:${where}:pet-covers-save-and-apply-centre`, {
          hypothesis: "H14 (b)", claim: `At 768x1024 the default-position pet covers the centre of "${SAVE[lang]}", the inline-end control of the sticky footer, at the ${where} of the scroll range`,
          requirement: "§9 R-PET rule and A2.8 for the bottom primary action: its centre is not covered by the default-position DesktopPet (contract A2.8 additionally requires all five points on the button and zero intersection for Retry all)",
          holds: geometry.hits.centre.hit === "save",
          evidence: { centre: geometry.hits.centre, pointsOnPet: onPet, hits: geometry.hits, save: geometry.save, petUnion: geometry.petUnion, intersection: geometry.intersection, separationPx: geometry.separationPx, footerPosition: geometry.footerPosition, footerJustify: geometry.footerJustify, saveIsInlineEnd: geometry.saveIsInlineEnd, scroll },
        });
      }
    }
  }

  // =============================================================================================
  // H15: denied accent (pane) and theme (Topbar) writes, then a trusted "Save & apply", EN and ZH
  // =============================================================================================
  if (mode === "h15") {
    await setViewport(main, 1280, 900, false);
    for (const lang of ["en", "zh"]) {
      const id = `h15:${lang}`;
      const seeds = { [MARKER_KEY]: MARKER, xai_pref_lang: JSON.stringify(lang) };
      await seed(main, seeds, id);
      const mounted = await mount(main, "/app/settings/appearance", id);
      pre(`${id}:zero-mount-writes-on-the-seven-keys`, mounted.mountWrites.length === 0, { mountWrites: mounted.mountWrites });
      await hidePet(main, lang, id);
      // 1. Pane accent write denied (Ocean, 230).
      await ev(main, '__native.denySet("xai_accent_hue")');
      const markAccent = await ev(main, "__native.mark()");
      const ocean = await tag(main, `${PANE} .appearance-pane`, byName(".accent-sw", presetName("ocean", lang)), `${id}:accent-ocean`);
      await click(main, ocean, `${id}:accent-ocean`);
      await delay(400);
      const accentView = await ev(main, `__native.window(${markAccent})`);
      pre(`${id}:accent-fault-armed-and-observed`, isDeepStrictEqual(opsOn(accentView.attempts, "xai_accent_hue"), ["set:230!denied"]), { attempts: accentView.attempts });
      pre(`${id}:accent-bytes-unchanged`, (await bytesOf(main, ["xai_accent_hue"])).xai_accent_hue === null);
      const afterAccent = await probe(main, lang);
      record("observation", { id: `${id}:after-denied-accent`, accentSwatchActive: afterAccent.pane.accentSwatch, accentSlider: afterAccent.pane.accentSlider, documentHue: afterAccent.html.accentHueInline, feedback: afterAccent.feedback });
      // 2. Topbar theme write denied (Dark).
      await ev(main, '__native.denySet("xai_pref_theme")');
      const markTheme = await ev(main, "__native.mark()");
      await chooseTopbar(main, labels[lang].dark, `${id}:topbar-dark`);
      await delay(300);
      await closeTopbar(main, id);
      await parkMouse(main);
      const themeView = await ev(main, `__native.window(${markTheme})`);
      pre(`${id}:theme-fault-armed-and-observed`, isDeepStrictEqual(opsOn(themeView.attempts, "xai_pref_theme"), [`set:${JSON.stringify("dark")}!denied`]), { attempts: themeView.attempts });
      pre(`${id}:theme-bytes-unchanged`, (await bytesOf(main, ["xai_pref_theme"])).xai_pref_theme === null);
      const afterTheme = await probe(main, lang);
      pre(`${id}:topbar-dark-applied`, afterTheme.html.theme === "dark" && afterTheme.topbar.summary === summaryFor(lang, "dark", "comfortable"), { html: afterTheme.html, summary: afterTheme.topbar.summary });
      record("observation", { id: `${id}:after-denied-topbar-theme`, documentTheme: afterTheme.html.theme, paneTheme: afterTheme.pane.theme, summary: afterTheme.topbar.summary, feedback: afterTheme.feedback });
      await screenshot(main, `${lang}-before-activation`, { state: `${lang.toUpperCase()}: after a denied pane accent write (Ocean) and a denied Topbar theme write (Dark); before "${SAVE[lang]}"` });
      // 3. Lift both faults; deny a never-failed font-scale write; hold the density per-key Web Lock.
      await ev(main, "__native.restore()");
      await ev(main, '__native.denySet("xai_pref_font_scale")');
      const densityLock = (await ev(main, "verify.lockNames")).xai_pref_density;
      pre(`${id}:density-per-key-lock-held`, await ev(main, `verify.holdLock(${JSON.stringify(densityLock)})`) && (await ev(main, "verify.queryLocks()")).held.includes(densityLock), { densityLock });
      const bytesBefore = await bytesOf(main, SEVEN);
      const saveSelector = `${PANE} [data-testid="settings-footer-save"]`;
      pre(`${id}:save-and-apply-present-with-its-label`, await ev(main, `(document.querySelector(${JSON.stringify(saveSelector)})?.textContent ?? "").trim() === ${JSON.stringify(SAVE[lang])}`));
      const point = await hit(main, saveSelector, `${id}:save-and-apply`);
      const markSave = await ev(main, "__native.mark()");
      await ev(main, "__native.startFrames()");
      await main.cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
      await main.cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
      await main.cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
      await delay(200);
      const flashNow = await probe(main, lang);
      const flashShot = await screenshot(main, `${lang}-saved-flash`, { state: `${lang.toUpperCase()}: about 200 ms after the trusted "${SAVE[lang]}" click` });
      const locksDuring = await ev(main, "verify.queryLocks()");
      const view = await ev(main, `__native.window(${markSave})`);
      const bytesAfter = await bytesOf(main, SEVEN);
      const dtAfter = await devtoolsBytes(main, SEVEN);
      await delay(1900);
      const frames = await ev(main, "__native.stopFrames()");
      const flashLater = await probe(main, lang);
      await ev(main, `verify.releaseLock(${JSON.stringify(densityLock)})`);
      await ev(main, "__native.restore()");
      const writes = writesByKey(view.attempts);
      const trustedClick = view.clicks.some((entry) => entry.trusted && entry.target === SAVE[lang]);
      pre(`${id}:trusted-click-observed-on-save-and-apply`, trustedClick, { clicks: view.clicks });
      const fontDenied = isDeepStrictEqual(writes.xai_pref_font_scale, ["set:1!denied"]);
      pre(`${id}:font-scale-fault-observed`, fontDenied, { writes });
      const flash = flashSummary(frames, lang);
      const checkedAfter = await (async () => { await openTopbar(main, `${id}:inspect`); const state = await probe(main, lang); await closeTopbar(main, `${id}:inspect`); return (state.topbar.options ?? []).filter((option) => option.checked === "true").map((option) => option.name); })();
      const densityWriteWhileHeld = view.attempts.some((entry) => entry.key === "xai_pref_density" && entry.op === "set") && locksDuring.held.includes(densityLock);
      record("observation", { id: `${id}:activation`, writes, attempts: view.attempts.map((entry) => `${entry.seq}:${entry.op}:${entry.key}=${entry.value ?? ""}:${entry.outcome}`), bytesBefore, bytesAfter, devtoolsBytesAfter: dtAfter,
        locksDuringActivation: locksDuring, densityWriteWhileHeld, saveButtonImmediately: flashNow.pane.footer.save, saveButtonAfter2100ms: flashLater.pane.footer.save, flash,
        themeDisplayed: { pane: flashNow.pane.theme, document: flashNow.html.theme, summary: flashNow.topbar.summary, topbarChecked: checkedAfter }, feedbackAfter: flashNow.feedback, screenshot: flashShot.file });
      verdict(`H15-${lang}-a:zero-attempts-on-failed-accent`, {
        hypothesis: "H15", claim: `"${SAVE[lang]}" makes zero attempts on the failed accent key`,
        requirement: "A2.3 and §5 item 9: one bottom activation re-attempts each settled failed field exactly once (here exactly one setItem on xai_accent_hue)",
        holds: writes.xai_accent_hue.length === 1,
        evidence: { accentAttempts: writes.xai_accent_hue, accentBytesAfter: bytesAfter.xai_accent_hue, bgToneAttempts: writes.xai_bg_tone, railPosAttempts: writes.xai_rail_pos },
      });
      verdict(`H15-${lang}-b:rewrites-four-root-keys-from-pane-values`, {
        hypothesis: "H15", claim: "It rewrites all four root keys raw, without the per-key lock, from the pane's values (theme, density and font scale from its mirrors, language from its prop), including keys that never failed, overwriting the Topbar choice",
        requirement: "A2.3: no write for a field without a failed request; the failed Topbar theme choice is re-attempted once with its own value (\"dark\"); every write takes its per-key lock",
        holds: writes.xai_pref_lang.length === 0 && writes.xai_pref_density.length === 0 && writes.xai_pref_font_scale.length === 0 && isDeepStrictEqual(writes.xai_pref_theme, [`set:${JSON.stringify("dark")}`]),
        evidence: { writes, themeBytesAfter: bytesAfter.xai_pref_theme, themeDisplayedAfter: { pane: flashNow.pane.theme, document: flashNow.html.theme, summary: flashNow.topbar.summary, topbarChecked: checkedAfter }, densityWrittenWhileItsPerKeyLockWasHeld: densityWriteWhileHeld, densityLock, languageNeverFailed: true },
      });
      verdict(`H15-${lang}-c:swallows-failure`, {
        hypothesis: "H15", claim: "A failure during the activation (the denied font-scale write) is swallowed: no field feedback appears",
        requirement: "A2.4 and §5 item 5: a write that fails is reported per field (not-saved message, recovery block) and never followed by a success claim",
        holds: flashNow.feedback.notSavedText || flashNow.feedback.recoveryBlocks > 0,
        evidence: { fontScaleAttempts: writes.xai_pref_font_scale, fontBytesAfter: bytesAfter.xai_pref_font_scale, feedback: flashNow.feedback },
      });
      verdict(`H15-${lang}-d:saved-flash-in-every-case`, {
        hypothesis: "H15", claim: `It shows "${SAVED[lang]}" for 1.8 s in every case`,
        requirement: "A2 and A2.1: the unconditional flash is gone; \"Saved\"/\"已保存\" never appear in the pane",
        holds: !flashNow.pane.footer.save || (flashNow.pane.footer.save.text !== SAVED[lang] && !/is-saved/.test(flashNow.pane.footer.save.className) && flash.framesShowingSaved === 0),
        evidence: { immediately: flashNow.pane.footer.save, after2100ms: flashLater.pane.footer.save, flash, screenshot: flashShot.file },
      });
      verdict(`H15-${lang}-e:no-per-field-result`, {
        hypothesis: "H15", claim: "It gives no per-field result",
        requirement: "A2.4: per-field recovery blocks [data-appearance-recovery] and the pane status line [data-testid=\"appearance-status-line\"] report each member's outcome",
        holds: flashNow.feedback.recoveryBlocks > 0 && flashNow.feedback.statusLine !== null,
        evidence: { feedback: flashNow.feedback },
      });
      await delay(300);
    }
  }

  // =============================================================================================
  // H17: clean state; "Save & apply" reached by Tab, activated by a trusted click, EN and ZH
  // =============================================================================================
  if (mode === "h17") {
    await setViewport(main, 1280, 900, false);
    for (const lang of ["en", "zh"]) {
      const id = `h17:${lang}`;
      const seeds = lang === "zh" ? { [MARKER_KEY]: MARKER, xai_pref_lang: JSON.stringify("zh") } : { [MARKER_KEY]: MARKER };
      await seed(main, seeds, id);
      const mounted = await mount(main, "/app/settings/appearance", id);
      pre(`${id}:zero-mount-writes-on-the-seven-keys`, mounted.mountWrites.length === 0, { mountWrites: mounted.mountWrites });
      await hidePet(main, lang, id);
      const clean = await probe(main, lang);
      const bytesBefore = await bytesOf(main, SEVEN);
      pre(`${id}:clean-state`, clean.uiLang === lang && !clean.feedback.notSavedText && clean.feedback.retryButtons.length === 0 && (await ev(main, "__native.faultState().set.length + __native.faultState().remove.length")) === 0
        && isDeepStrictEqual(bytesBefore, Object.fromEntries(SEVEN.map((key) => [key, seeds[key] ?? null]))), { bytesBefore, feedback: clean.feedback });
      // Reach "Save & apply" with trusted Tab presses from a starting point inside the pane (its title).
      const title = await tag(main, `${PANE} .appearance-pane`, `(root) => [...root.querySelectorAll(".pane-title")]`, `${id}:pane-title`);
      await click(main, title, `${id}:pane-title (sequential focus starting point)`);
      const path = [];
      let reached = false;
      for (let presses = 1; presses <= 45 && !reached; presses += 1) {
        await press(main, "Tab");
        const focus = await ev(main, "__native.focus()");
        path.push(`${presses}:${focus?.tag}${focus?.testid ? `[${focus.testid}]` : ""}:${focus?.name ?? ""}`);
        reached = focus?.testid === "settings-footer-save";
      }
      const focusOnSave = await ev(main, "__native.focus()");
      const keyTrace = (await ev(main, "__native.window(0)")).keys.filter((entry) => entry.key === "Tab");
      record("observation", { id: `${id}:tab-walk`, presses: path.length, path, focus: focusOnSave, tabKeysTrusted: keyTrace.every((entry) => entry.trusted), tabKeys: keyTrace.length });
      pre(`${id}:save-and-apply-reached-by-trusted-tab`, reached && keyTrace.length === path.length && keyTrace.every((entry) => entry.trusted), { path });
      pre(`${id}:save-and-apply-labelled`, focusOnSave.name === SAVE[lang], { focusOnSave });
      const attributes = await ev(main, `(() => { const element = document.activeElement; return { text: element.textContent.trim(), disabled: element.hasAttribute("disabled"), ariaDisabled: element.getAttribute("aria-disabled"), describedBy: element.getAttribute("aria-describedby"), focusVisible: element.matches(":focus-visible"), outlineStyle: getComputedStyle(element).outlineStyle, outlineWidth: getComputedStyle(element).outlineWidth, className: element.className, type: element.getAttribute("type") }; })()`);
      record("observation", { id: `${id}:focused-save-and-apply`, attributes });
      await screenshot(main, `${lang}-tab-focused`, { state: `${lang.toUpperCase()} clean state: "${SAVE[lang]}" focused by Tab (presses: ${path.length})`, attributes });
      verdict(`H17-${lang}-a:no-disabled-nothing-to-retry-state`, {
        hypothesis: "H17", claim: `In the clean state the bottom primary action "${SAVE[lang]}" carries neither disabled nor aria-disabled`,
        requirement: `A2.2: in the clean state the bottom action is "${RETRY_ALL[lang]}", rendered with aria-disabled="true" and no disabled attribute`,
        holds: attributes.text === RETRY_ALL[lang] && attributes.ariaDisabled === "true" && !attributes.disabled,
        evidence: { attributes },
      });
      const saveSelector = `${PANE} [data-testid="settings-footer-save"]`;
      const point = await hit(main, saveSelector, `${id}:save-and-apply`);
      const markSave = await ev(main, "__native.mark()");
      await ev(main, "__native.startFrames()");
      await main.cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
      await main.cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
      await main.cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
      await delay(200);
      const flashNow = await probe(main, lang);
      const flashShot = await screenshot(main, `${lang}-saved-flash`, { state: `${lang.toUpperCase()} clean state: about 200 ms after the trusted click on "${SAVE[lang]}"` });
      const view = await ev(main, `__native.window(${markSave})`);
      const bytesAfter = await bytesOf(main, SEVEN);
      const dtAfter = await devtoolsBytes(main, SEVEN);
      await delay(1900);
      const frames = await ev(main, "__native.stopFrames()");
      const flashLater = await probe(main, lang);
      pre(`${id}:trusted-click-observed`, view.clicks.some((entry) => entry.trusted && entry.target === SAVE[lang]), { clicks: view.clicks });
      const writes = writesByKey(view.attempts);
      const flash = flashSummary(frames, lang);
      const expectedRoot = { xai_pref_lang: [`set:${JSON.stringify(lang)}`], xai_pref_theme: [`set:${JSON.stringify("light")}`], xai_pref_density: [`set:${JSON.stringify("comfortable")}`], xai_pref_font_scale: ["set:1"] };
      const rootSets = ROOT_KEYS.flatMap((key) => writes[key]);
      const registeredOps = REGISTERED_KEYS.flatMap((key) => writes[key]);
      record("observation", { id: `${id}:activation`, writes, attempts: view.attempts.map((entry) => `${entry.seq}:${entry.op}:${entry.key}=${entry.value ?? ""}:${entry.outcome}`), bytesBefore, bytesAfter, devtoolsBytesAfter: dtAfter,
        saveButtonImmediately: flashNow.pane.footer.save, saveButtonAfter2100ms: flashLater.pane.footer.save, flash, screenshot: flashShot.file });
      fact(`H17-${lang}-b1:exactly-four-root-setitem-attempts-with-pane-values`, {
        hypothesis: "H17", claim: "One clean-state activation makes exactly four setItem attempts, one on each root key, with the pane's values, so an absent root key gains its default's bytes",
        observed: rootSets.length === 4 && ROOT_KEYS.every((key) => isDeepStrictEqual(writes[key], expectedRoot[key])),
        evidence: { rootWrites: Object.fromEntries(ROOT_KEYS.map((key) => [key, writes[key]])), bytesBefore: Object.fromEntries(ROOT_KEYS.map((key) => [key, bytesBefore[key]])), bytesAfter: Object.fromEntries(ROOT_KEYS.map((key) => [key, bytesAfter[key]])) },
      });
      fact(`H17-${lang}-b2:zero-attempts-on-registered-keys`, {
        hypothesis: "H17", claim: "It makes zero attempts on the three registered keys",
        observed: registeredOps.length === 0,
        evidence: { registeredWrites: Object.fromEntries(REGISTERED_KEYS.map((key) => [key, writes[key]])) },
      });
      verdict(`H17-${lang}-b:clean-state-activation-is-not-inert`, {
        hypothesis: "H17", claim: "With no failed or pending work, one activation of the bottom primary action makes storage attempts",
        requirement: "A2.2 and §5 item 9: while nothing can be retried the button is disabled and an activation makes zero storage attempts and no state change",
        holds: view.attempts.length === 0,
        evidence: { writes, attemptCount: view.attempts.length },
      });
      verdict(`H17-${lang}-c:saved-flash-although-nothing-was-unsaved`, {
        hypothesis: "H17", claim: `It shows "${SAVED[lang]}" for 1.8 s although nothing was unsaved`,
        requirement: "A2.1 and A2.2: never a success state; \"Saved\"/\"已保存\" never appear",
        holds: flashNow.pane.footer.save.text !== SAVED[lang] && !/is-saved/.test(flashNow.pane.footer.save.className) && flash.framesShowingSaved === 0,
        evidence: { immediately: flashNow.pane.footer.save, after2100ms: flashLater.pane.footer.save, flash, screenshot: flashShot.file },
      });
      await delay(300);
    }
    // Additional native observation (not a contract hypothesis verdict): the same clean-state activation in a fresh
    // document whose root keys hold valid non-default values. The pane's mirrors are seeded from the DOM (§3 item 2).
    {
      const id = "h17:en-stored";
      const seeds = { [MARKER_KEY]: MARKER, xai_pref_theme: JSON.stringify("dark"), xai_pref_density: JSON.stringify("compact"), xai_pref_font_scale: "1.1" };
      await seed(main, seeds, id);
      const mounted = await mount(main, "/app/settings/appearance", id);
      pre(`${id}:zero-mount-writes-on-the-seven-keys`, mounted.mountWrites.length === 0, { mountWrites: mounted.mountWrites });
      await hidePet(main, "en", id);
      const clean = await probe(main, "en");
      pre(`${id}:clean-state-stored-values-applied-to-the-document`, clean.html.theme === "dark" && clean.html.density === "compact" && clean.html.fontSize === "17.6px" && !clean.feedback.notSavedText && clean.feedback.retryButtons.length === 0, { html: clean.html, feedback: clean.feedback });
      await screenshot(main, "en-stored-before-activation", { state: "EN clean state over stored dark/compact/1.1 in a fresh document, before the activation" });
      const saveSelector = `${PANE} [data-testid="settings-footer-save"]`;
      const markSave = await ev(main, "__native.mark()");
      await click(main, saveSelector, `${id}:save-and-apply`);
      await delay(300);
      const after = await probe(main, "en");
      const view = await ev(main, `__native.window(${markSave})`);
      const bytesAfter = await bytesOf(main, SEVEN);
      record("observation", {
        id: `${id}:activation`, kind: "additional native observation (not a contract hypothesis verdict; extends H17 and H5)",
        claim: "In a fresh document the pane's DOM-seeded mirrors show the defaults while <html> applies the stored values, so one clean-state \"Save & apply\" writes the defaults over valid stored choices",
        observed: clean.pane.theme === labels.en.light && clean.pane.density === labels.en.comfortable && clean.pane.fontSlider === "1"
          && isDeepStrictEqual(writesByKey(view.attempts).xai_pref_theme, [`set:${JSON.stringify("light")}`]) && bytesAfter.xai_pref_theme === JSON.stringify("light") && bytesAfter.xai_pref_density === JSON.stringify("comfortable") && bytesAfter.xai_pref_font_scale === "1",
        paneBefore: { theme: clean.pane.theme, density: clean.pane.density, fontSlider: clean.pane.fontSlider, fontReadout: clean.pane.fontReadout }, documentBefore: { theme: clean.html.theme, density: clean.html.density, fontSize: clean.html.fontSize },
        writes: writesByKey(view.attempts), bytesBefore: Object.fromEntries(SEVEN.map((key) => [key, seeds[key] ?? null])), bytesAfter, documentAfter: { theme: after.html.theme, density: after.html.density, fontSize: after.html.fontSize }, saveButton: after.pane.footer.save,
      });
      await delay(2000);
    }
  }

  const network = [];
  for (const page of pages) network.push(...(await ev(page, "__native ? __native.network : []").catch(() => [])));
  record("observation", { id: "run:network-and-requests", pageNetworkAttempts: network, nonLocal: network.filter((entry) => !entry.local).length, served });
  pre("run:no-non-local-network-attempt", network.every((entry) => entry.local));
  pre("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs });
} catch (error) {
  harnessError = error;
} finally {
  const failed = verdicts.filter((entry) => !entry.requirementHolds).map((entry) => entry.id);
  const exceptions = runtimeErrors.filter((entry) => entry.kind === "exception");
  record("result", {
    harnessValid: harnessError === null, mode, checks, verdicts: verdicts.map((entry) => `${entry.id}=${entry.requirementHolds ? "PASS" : "FAIL"}`),
    facts: facts.map((entry) => `${entry.id}=${entry.observed ? "observed" : "not-observed"}`),
    requirementFailures: failed, runtimeErrors: runtimeErrors.length, exceptions: exceptions.length, runtimeErrorSamples: runtimeErrors.slice(0, 8),
    consoleWarnings: consoleWarnings.length, consoleWarningSamples: [...new Set(consoleWarnings)].slice(0, 6), dialogs, artifacts: artifacts.map((entry) => entry.file),
    ...(harnessError ? { error: String(harnessError?.stack ?? harnessError).slice(0, 1500), checkId: harnessError?.checkId ?? null, checkKind: harnessError?.checkKind ?? null } : {}),
  });
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`, { flag: "wx" });
  await closeBrowser().catch(() => {});
  server?.closeAllConnections?.();
  server?.close();
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  process.exitCode = harnessError ? 1 : failed.length ? 2 : 0;
  const summary = verdicts.map((entry) => `${entry.id}=${entry.requirementHolds ? "PASS" : "FAIL"}`).join(" ");
  console.log(`${harnessError ? "HARNESS-FAIL" : "VALID"} ${relative(root, evidencePath)} checks=${checks} exit=${process.exitCode} ${summary}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
}
