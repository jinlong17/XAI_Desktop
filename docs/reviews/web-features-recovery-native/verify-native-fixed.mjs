/**
 * CP-FEATURES-01 batch 27 (contract §14 E9, E10, E11): the fixed Settings Features caller in real headless
 * Chrome: native controls, Reset to defaults and on-disk export. Parent-role native verifier. Verification
 * only: it repairs nothing, implements nothing, accepts nothing and changes no product file, contract, ledger
 * or existing evidence (the before-stage files in this directory are read, never modified).
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-features-recovery-native/verify-native-fixed.mjs <fixed revision> <controls|reset|export> <suffix>
 *
 * Modes:
 *   controls (E9, production App composition, ./native-fixed.tsx): all 16 values (8 toggles x off/on) by
 *            trusted CDP input with exact bytes at the unscoped keys and a graceful browser restart after each
 *            value (bytes left the renderer; fresh mount with zero write/remove attempts); a new-document reload;
 *            a native held per-key Web Lock (pending, bytes unchanged, one write after release); readback
 *            uncertainty (Retry reconciles with exactly one total write); a second-document conflict (external
 *            restoration of the baseline bytes preserved, never overwritten); source-only states (malformed bytes
 *            and a throwing read: Reload only, no Saved claim, no draft) and an edit over a malformed source.
 *   reset    (E10, production App composition): declined confirmation (zero attempts); accepted (8 verified
 *            absences, no-op for an absent key, never a write); one-key and two-key removeItem faults with
 *            per-field recovery and targeted Retry; uncertainty (exactly one remove); an external conflict
 *            (preserved); truthful "Defaults restored."; unrelated-key snapshot; and throughout zero key:null
 *            StorageEvent dispatches, no account relock and no host remount.
 *   export   (E11, Settings host composition, ./native-fixed-host.tsx): the nine contract §8 native disk shapes
 *            of features-draft.json, each under total Storage denial (attempt counters, one object URL created
 *            and the same revoked, anchor removed, beforeunload still warning, guard still blocking), plus native
 *            setup failures (anchor click and createObjectURL throwing) with the localized error.
 *
 * - Product: an immutable `git archive <revision>`; the mode's fixture is bundled with esbuild from stdin with
 *   resolveDir = that archive. Every `@repo/*` specifier is pinned to the archive's own package export; a guard
 *   plugin fails the build if any module is loaded from the packages/, apps/ or docs/ tree of the dependency
 *   checkout or of this runner's checkout. Third-party modules come from XAI_DEPS_ROOT only when its
 *   pnpm-lock.yaml SHA-256 equals the archive's (consistency gate).
 * - Page: ./native-fixed-prelude.js (classic script, instruments) then the bundle, served from 127.0.0.1 only;
 *   every other host resolves to NOTFOUND; isolated headless Chrome profile and download directory; CDP trusted
 *   mouse input after a centre hit-test; the real window.confirm answered through Page.handleJavaScriptDialog.
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log` (and, for export, the disk JSON artifacts) in this
 *   directory; existing evidence is never overwritten. Exit 0 = harness valid and every check PASS; 2 = harness
 *   valid and a product check FAILED (the run stops at the first one); 1 = harness invalid (a precondition).
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
const BEFORE_REVISION = "f359be6d838393e0f9e93efd80b88b5b09f6144e";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? output;
if (process.env.XAI_NATIVE_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
const MODES = ["controls", "reset", "export"];
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

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const FIXTURE = mode === "export" ? "native-fixed-host.tsx" : "native-fixed.tsx";
const fixtureSource = readFileSync(join(output, FIXTURE), "utf8");
const preludeSource = readFileSync(join(output, "native-fixed-prelude.js"), "utf8");
const otherFixtureSha = sha256(readFileSync(join(output, mode === "export" ? "native-fixed.tsx" : "native-fixed-host.tsx")));
const dependencyNodeModules = join(dependencyRoot, "node_modules");
if (!existsSync(dependencyNodeModules)) throw Error("PRECONDITION: dependency tree missing; set XAI_DEPS_ROOT");
const archiveLock = execFileSync("git", ["show", `${resolved}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
const dependencyLock = readFileSync(join(dependencyRoot, "pnpm-lock.yaml"));
if (sha256(dependencyLock) !== sha256(archiveLock)) throw Error("PRECONDITION: dependency checkout lockfile differs from the revision under test");
const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find((name) => name.startsWith("esbuild@0.28.1"));
if (!esbuildFolder) throw Error("PRECONDITION: pinned esbuild 0.28.1 missing");
const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
const docsHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const productDelta = execFileSync("git", ["diff", "--name-only", resolved, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim();
const fixedDelta = execFileSync("git", ["diff", "--name-only", BEFORE_REVISION, resolved, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
const versionOf = (name) => {
  try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
};
const FEATURES_PACKAGE = "packages/xai-web-settings-features-panel/";
const FIXED_FILES = [
  "packages/xai-web-settings-features-panel/src/FeaturesPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresRecovery.ts",
  "packages/xai-web-settings-features-panel/src/internal/featuresRecoveryCopy.ts",
  "packages/xai-web-settings-features-panel/src/styles.css",
  "packages/xai-web-settings-features-panel/src/types.ts",
];
const COMMON_REQUIRED = [
  "apps/web/src/routes/modules/shellRegistrations.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/settingsDeparture.ts",
  "apps/web/src/routes/modules/settingsPaneComposition.ts",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/registry.ts",
  "packages/plugin-web-storage/src/internal/codec.ts",
  "packages/plugin-web-storage/src/internal/sameTabBus.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts",
  "packages/plugin-web-storage/src/internal/accountCoordination.ts",
  "packages/plugin-web-settings-shell/src/Toggle.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-settings-features-panel/src/FeaturesPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresRecovery.ts",
  "packages/xai-web-settings-features-panel/src/internal/featuresRecoveryCopy.ts",
  "packages/xai-web-settings-features-panel/src/styles.css",
];
const APP_REQUIRED = [
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/RouteGateElements.tsx",
  "apps/web/src/providers/AppProviders.tsx",
  "apps/web/src/providers/AccountStorageGate.tsx",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/storage.ts",
  "packages/xai-web-settings-features-panel/src/useFeaturePrefs.ts",
  "packages/xai-web-settings-features-panel/src/filterModulesByFeaturePrefs.ts",
  "packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx",
  "packages/xai-web-settings-features-panel/src/DisabledFeatureFallback.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/guards.tsx",
];
const REQUIRED_MODULES = mode === "export" ? COMMON_REQUIRED : [...COMMON_REQUIRED, ...APP_REQUIRED];

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-features-native-fixed-")));
const snapshot = join(directory, "source");
const profile = join(directory, "profile");
const downloads = join(directory, "downloads");
let server = null;
let session = null;
let origin = "";
const served = {};

// ---------------------------------------------------------------------------------------------------
// Browser session (pattern of ./verify-native-before.mjs and ../web-sticky-recovery-native/verify-native.mjs)
// ---------------------------------------------------------------------------------------------------
async function launch() {
  try { rmSync(join(profile, "DevToolsActivePort")); } catch { /* first launch */ }
  const proc = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
    "--disable-component-update", "--disable-sync", "--disable-default-apps", "--disable-domain-reliability",
    "--disable-client-side-phishing-detection", "--metrics-recording-only", "--use-mock-keychain",
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
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((target) => target.type === "page");
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  const pending = new Map();
  let commandId = 0;
  const state = { proc, exited, port, socket, pending };
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails ?? {};
      runtimeErrors.push({ kind: "exception", afterCheck: lastCheckId, text: String(details.exception?.description ?? details.text ?? "").slice(0, 600) });
    } else if (message.method === "Runtime.consoleAPICalled") {
      const text = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ").slice(0, 600);
      if (message.params.type === "error" || message.params.type === "assert") runtimeErrors.push({ kind: `console.${message.params.type}`, afterCheck: lastCheckId, text });
      else if (message.params.type === "warning") consoleWarnings.push(text.slice(0, 200));
    } else if (message.method === "Page.javascriptDialogOpening") {
      const plan = dialogPlan.shift() ?? null;
      // An unplanned beforeunload prompt is accepted (never hangs a navigation) but recorded as unexpected.
      const accept = plan ? plan.accept : message.params.type === "beforeunload";
      dialogs.push({ type: message.params.type, message: message.params.message, expected: Boolean(plan), accepted: accept, afterCheck: lastCheckId });
      state.cdp("Page.handleJavaScriptDialog", { accept }).catch(() => {});
    }
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
  state.cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  return state;
}
const cdp = (method, params) => {
  if (!session) throw Error("No browser session");
  return session.cdp(method, params);
};
const evaluate = async (expression) => {
  const result = await cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw Error(`Page evaluation failed: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`);
  return result.result.value;
};
const waitUntil = async (expression, timeout = 6000) => {
  const deadline = Date.now() + timeout;
  for (;;) {
    try {
      if (await evaluate(expression)) return true;
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
async function openSession() {
  session = await launch();
  await cdp("Runtime.enable");
  await cdp("Page.enable");
  await cdp("DOMStorage.enable");
  if (mode === "export") await cdp("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
  await cdp("Page.bringToFront");
  await cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  await cdp("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
}
async function closeSession() {
  const current = session;
  session = null;
  if (!current) return { graceful: true };
  try { current.socket.send(JSON.stringify({ id: 999999, method: "Browser.close" })); } catch { /* socket gone */ }
  const graceful = await Promise.race([current.exited.then(() => true), delay(8000).then(() => false)]);
  if (!graceful) {
    current.proc.kill("SIGTERM");
    await Promise.race([current.exited, delay(3000)]);
    if (current.proc.exitCode === null && current.proc.signalCode === null) current.proc.kill("SIGKILL");
  }
  try { current.socket.close(); } catch { /* already closed */ }
  return { graceful };
}

// ---------------------------------------------------------------------------------------------------
// Surface helpers
// ---------------------------------------------------------------------------------------------------
const OWNER = "features-native-A";
const MARKER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:committed-generation`;
const MARKER = JSON.stringify({ generation: "g1", migrationId: "features-native", previous: null });
const IDS = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "habits", "meditation"];
const LABEL = { tasks: "Tasks", board: "Boards", dashboard: "Dashboard", calendar: "Calendar", matrix: "Matrix", pomodoro: "Pomodoro", habits: "Habits", meditation: "Meditation" };
const keyOf = (id) => `xai_pref_features_${id}`;
const FEATURE_KEYS = IDS.map(keyOf);
const isFeatureKey = (key) => FEATURE_KEYS.includes(key);
const LOCK_OF = (id) => `xai:pref:v1:${encodeURIComponent(keyOf(id))}`;
const COPY = {
  saved: "Features settings saved.",
  restored: "Defaults restored.",
  exportFailed: "Export failed. Please retry.",
  confirm: "Turn all 8 modules back on? This only changes which modules are shown; your data is kept.",
  exportDraft: "Export Features draft",
  discardAll: "Discard all changes",
  reset: "Reset to defaults",
  dialogLabel: "Unsaved Features draft",
  dialogText: "Features has unsaved changes.",
};
const MESSAGE = {
  saving: (label) => `${label} is saving.`,
  resetting: (label) => `${label} is being reset to its default.`,
  "not-saved": (label) => `${label} was not saved.`,
  "not-reset": (label) => `${label} was not reset to its default.`,
  unavailable: (label) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
};
const entry = (id, state) => ({
  id,
  text: MESSAGE[state](LABEL[id]),
  role: state === "saving" || state === "resetting" ? "status" : "alert",
  buttons: state === "unavailable" ? [`Reload ${LABEL[id]}`] : [`Retry ${LABEL[id]}`, `Discard ${LABEL[id]}`],
});
const ACTIONS = { buttons: [COPY.exportDraft, COPY.discardAll], alert: null };
const PANE = '.settings-detail[data-pane="features"] .features-pane';
const SWITCH = (id) => `${PANE} [data-feature-id="${id}"] [role="switch"]`;
const RESET = `${PANE} [data-testid="features-reset-defaults"]`;
const allOf = (value) => Object.fromEntries(IDS.map((id) => [id, value]));
const display = (raw) => Object.fromEntries(IDS.map((id) => [id, raw[id] === "false" ? "false" : "true"]));
const summarize = (list) => ({
  total: list.length,
  reads: list.filter((entry) => entry.op === "get").length,
  writes: list.filter((entry) => entry.op === "set").length,
  removes: list.filter((entry) => entry.op === "remove").length,
  other: list.filter((entry) => !["get", "set", "remove"].includes(entry.op)).length,
});
const mutations = (list) => list.filter((entry) => entry.op === "set" || entry.op === "remove" || entry.op === "clear");
const short4 = (list) => list.slice(0, 12).map((entry) => `${entry.seq}:${entry.op}:${entry.key}${entry.value !== undefined ? `=${entry.value}` : ""}:${entry.outcome}`);

async function bytes() {
  return evaluate(`Object.fromEntries(${JSON.stringify(IDS)}.map((id) => [id, __native.native.get("xai_pref_features_" + id)]))`);
}
async function devtools() {
  const { entries } = await cdp("DOMStorage.getDOMStorageItems", { storageId: { storageKey: `${origin}/`, isLocalStorage: true } });
  const map = Object.fromEntries(entries);
  return Object.fromEntries(IDS.map((id) => [id, Object.hasOwn(map, keyOf(id)) ? map[keyOf(id)] : null]));
}
const nonFeatureSnapshot = () => evaluate(`(() => { const all = __native.native.snapshot(); for (const key of ${JSON.stringify(FEATURE_KEYS)}) delete all[key]; return all; })()`);
const mark = () => evaluate("__native.mark()");
async function state(since) {
  const value = await evaluate(`(() => {
    const w = __native.window(${since});
    return {
      view: __native.features(),
      physical: Object.fromEntries(${JSON.stringify(IDS)}.map((id) => [id, __native.native.get("xai_pref_features_" + id)])),
      dialog: __native.dialog(),
      location: verify.location(),
      scope: verify.scope(),
      attempts: w.attempts, locks: w.locks, events: w.events, confirm: w.confirm,
      keyNullDispatched: w.storageDispatches.filter((entry) => entry.key === null).length,
      dispatched: w.storageDispatches.map((entry) => String(entry.key)),
      received: w.storageReceived.map((entry) => String(entry.key) + ":" + (entry.trusted ? "trusted" : "synthetic")),
      keyNullReceived: w.storageReceived.filter((entry) => entry.key === null).length,
    };
  })()`);
  value.feature = value.attempts.filter((entry) => isFeatureKey(entry.key));
  return value;
}
const opsOn = (list, op, id) => list.filter((entry) => entry.op === op && entry.key === keyOf(id));
const appLocks = (list) => list.filter((entry) => entry.by === "app").map((entry) => entry.name);
const accountLocks = (names) => names.filter((name) => name.startsWith("xai:account:") || name.startsWith("xai:demo:"));
const accountMutations = (list) => mutations(list).filter((entry) => /^xai:(account|demo):/.test(entry.key ?? ""));

async function trustedClick(selector, label) {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { found: false };
    element.scrollIntoView({ block: "center", inline: "nearest" });
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { found: true, x, y, width: rect.width, height: rect.height, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + hit.className : null };
  })()`);
  pre(`input:control-present:${label}`, point.found, { selector });
  pre(`input:centre-hit-test:${label}`, point.hit, { selector, hitTarget: point.hitTarget });
  await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await delay(60);
  return { x: Math.round(point.x), y: Math.round(point.y), width: point.width, height: point.height };
}
const clickSwitch = (id) => trustedClick(SWITCH(id), `switch:${id}`);
async function clickButton(name, scope) {
  const found = await evaluate(`(() => {
    document.querySelectorAll("[data-native-target]").forEach((element) => element.removeAttribute("data-native-target"));
    const matches = [...document.querySelectorAll(${JSON.stringify(`${scope} button`)})]
      .filter((candidate) => (candidate.getAttribute("aria-label") ?? candidate.textContent).replace(/\\s+/g, " ").trim() === ${JSON.stringify(name)});
    if (matches.length === 1) matches[0].setAttribute("data-native-target", "1");
    return matches.length;
  })()`);
  pre(`input:exactly-one-button-by-name:${name}`, found === 1, { scope, found });
  const point = await trustedClick('[data-native-target="1"]', name);
  await evaluate('document.querySelector("[data-native-target]")?.removeAttribute("data-native-target")');
  return point;
}
async function sidebarClick(label) {
  const found = await evaluate(`(() => {
    document.querySelectorAll("[data-native-sidebar]").forEach((element) => element.removeAttribute("data-native-sidebar"));
    const rows = [...document.querySelectorAll(".settings-sidebar .list-row")].filter((candidate) => candidate.textContent.trim() === ${JSON.stringify(label)});
    if (rows.length === 1) rows[0].setAttribute("data-native-sidebar", "1");
    return rows.length;
  })()`);
  pre(`input:exactly-one-sidebar-row:${label}`, found === 1, { found });
  const point = await trustedClick('[data-native-sidebar="1"]', `sidebar ${label}`);
  await evaluate('document.querySelector("[data-native-sidebar]")?.removeAttribute("data-native-sidebar")');
  return point;
}
/** Trusted activation of the Features-local "Reset to defaults"; the real window.confirm is answered by plan. */
async function clickReset(accept, label) {
  const names = await evaluate(`[...document.querySelectorAll(${JSON.stringify(RESET)})].map((button) => button.textContent.trim())`);
  pre(`${label}:reset-control-by-testid-and-name`, isDeepStrictEqual(names, [COPY.reset]), { names });
  const before = dialogs.length;
  dialogPlan.push({ accept });
  const point = await trustedClick(RESET, `${label}:reset`);
  // Whether the confirmation opened is a product fact; the caller's check asserts it.
  const opened = await waitFor(() => dialogs.length > before, 6000);
  if (!opened) dialogPlan.length = 0;
  return { point, opened, dialogs: dialogs.slice(before) };
}
const recoveryIs = (expected) => `JSON.stringify(__native.features()?.recovery) === ${JSON.stringify(JSON.stringify(expected))}`;
const statusIs = (text) => `__native.features()?.status === ${JSON.stringify(text)}`;
const physicalIs = (raw) => `JSON.stringify(Object.fromEntries(${JSON.stringify(IDS)}.map((id) => [id, __native.native.get("xai_pref_features_" + id)]))) === ${JSON.stringify(JSON.stringify(raw))}`;

let selfTested = false;
async function seed(entries, label) {
  await cdp("Page.navigate", { url: `${origin}/seed` });
  pre(`${label}:seed-page-loaded-with-prelude-only`, await waitUntil("document.readyState === 'complete' && location.pathname === '/seed' && !!window.__native && !window.verify", 10000));
  if (!selfTested) {
    const result = await evaluate("__native.selfTest()");
    record("instrument-selftest", { page: "/seed (prelude only, no product code)", result });
    pre("instruments:storage-faults-locks-export-trace-dispatch-network-dom-frames", result.setDeniedThrew && result.setDeniedNeverStored && result.setDelegated
      && result.readbackAfterSetDenied && result.readbackOneShot && result.getDenied && result.removeDeniedThrew && result.removeDeniedKeptBytes
      && result.removeDelegated && result.readbackAfterRemoveDenied && Object.values(result.totalDenial).every(Boolean)
      && result.probeUnderDenial.threw && result.probeUnderDenial.logged === 1 && result.probeUnderDenial.last?.outcome === "denied"
      && isDeepStrictEqual(result.dispatchCounted, ["null:true", "xai_native_fixed_selftest:true"])
      && isDeepStrictEqual(result.deliveredCounted, ["null:false", "xai_native_fixed_selftest:false"])
      && result.nonLocalFetchRefusedAndLogged && result.lockHeldAndPending && result.lockReleasedAppRan && isDeepStrictEqual(result.lockAttribution, ["fixture", "app"])
      && result.urlTraced && result.createFailureHook && result.clickFailureHook && result.anchorAddedAndRemovedTraced && result.pendingFailuresConsumed
      && result.domGateAddedAndRemoved && result.framesSampled > 0 && result.warnWithoutListener.warned === false, { result });
    selfTested = true;
  }
  const stored = await evaluate(`(() => { __native.native.clear(); const seeds = ${JSON.stringify(entries)}; for (const [key, value] of Object.entries(seeds)) __native.native.set(key, value); return __native.native.snapshot(); })()`);
  pre(`${label}:seeded-exact-bytes`, isDeepStrictEqual(stored, entries), { stored });
}
const APP_READY = `(() => !!window.verify && !!window.__native && !!document.querySelector('${PANE}') && document.querySelectorAll('${PANE} [data-feature-id] [role="switch"]').length === 8 && !document.querySelector('.account-data-gate') && verify.scope().kind === 'account')()`;
/** Production App mount (controls/reset): navigation, readiness, provenance of the auth context, clean mount. */
async function mountApp(label, path = "/app/settings/features") {
  const errorsBefore = runtimeErrors.length;
  await cdp("Page.navigate", { url: `${origin}${path}` });
  const ready = await waitUntil(APP_READY, 20000);
  if (!ready) {
    const diagnostics = await evaluate("({ path: location.pathname, text: (document.body.innerText || '').slice(0, 300), verify: !!window.verify, scope: window.verify ? verify.scope() : null })").catch((error) => ({ error: String(error) }));
    pre(`${label}:production-app-mounted-features-pane`, false, { diagnostics, runtimeErrors: runtimeErrors.slice(errorsBefore, errorsBefore + 5) });
  }
  await delay(700);
  const facts = await evaluate(`({ composition: verify.composition, instance: verify.instance, scope: verify.scope(), auth: verify.authCalls(), markerKey: verify.markerKey,
    lockNames: Object.fromEntries(${JSON.stringify(IDS)}.map((id) => [id, verify.lockName(id)])), physicalKeys: verify.physicalKeys,
    rail: verify.rail(), pet: !!document.querySelector('.pet-wrap'), sidebar: !!document.querySelector('.settings-sidebar'), network: __native.network.filter((entry) => !entry.local).length })`);
  pre(`${label}:production-app-mounted-features-pane`, true, { composition: facts.composition, instance: facts.instance });
  pre(`${label}:auth-session-context-served-by-real-provider`, facts.composition === "production-app" && facts.auth.getSession >= 1 && facts.markerKey === MARKER_KEY, { auth: facts.auth });
  pre(`${label}:account-data-gate-activated-account`, facts.scope.kind === "account" && facts.scope.accountId === OWNER && facts.scope.generation === "g1", { scope: facts.scope });
  pre(`${label}:production-surfaces-present`, facts.rail.length > 0 && facts.pet && facts.sidebar, { rail: facts.rail.length, pet: facts.pet });
  pre(`${label}:real-lock-names-and-unscoped-physical-keys`, IDS.every((id) => facts.lockNames[id] === LOCK_OF(id)) && isDeepStrictEqual(facts.physicalKeys, FEATURE_KEYS), { lockNames: facts.lockNames });
  pre(`${label}:no-non-local-network-attempt`, facts.network === 0);
  const exceptions = runtimeErrors.slice(errorsBefore).filter((entry) => entry.kind === "exception");
  pre(`${label}:no-uncaught-exception-at-mount`, exceptions.length === 0, { exceptions: exceptions.slice(0, 3) });
  return facts;
}
/** A clean, valid or absent mount: exact bytes, defaults displayed, zero write/remove attempts on the 8 keys. */
async function mountCheck(id, expectedRaw) {
  const now = await state(0);
  const dt = await devtools();
  const featureMutations = mutations(now.feature);
  check(`${id}:physical-bytes`, isDeepStrictEqual(now.physical, expectedRaw), { observed: now.physical, expected: expectedRaw });
  check(`${id}:devtools-bytes`, isDeepStrictEqual(dt, expectedRaw), { observed: dt });
  check(`${id}:displays-stored-values`, isDeepStrictEqual(now.view.switches, display(expectedRaw)), { observed: now.view.switches });
  check(`${id}:zero-mount-write-remove-attempts-on-the-8-keys`, featureMutations.length === 0, {
    features: summarize(now.feature), global: summarize(now.attempts), globalMutatedKeys: [...new Set(mutations(now.attempts).map((entry) => entry.key))],
  });
  check(`${id}:clean-no-saved-claim-no-save-footer`, now.view.recovery.length === 0 && now.view.status === "" && now.view.actions === null && now.view.saveFooter === false
    && isDeepStrictEqual(now.view.resetButtons, [COPY.reset]), { view: now.view });
  check(`${id}:zero-key-null-dispatch`, now.keyNullDispatched === 0 && now.keyNullReceived === 0, { dispatched: now.dispatched });
  return now;
}
async function secondDocument(expression) {
  const { targetId } = await cdp("Target.createTarget", { url: `${origin}/external` });
  let target = null;
  for (let attempt = 0; attempt < 60 && !target; attempt += 1) {
    const list = await (await fetch(`http://127.0.0.1:${session.port}/json/list`)).json();
    target = list.find((candidate) => candidate.id === targetId && candidate.webSocketDebuggerUrl) ?? null;
    if (!target) await delay(40);
  }
  pre("second-document:target-present", target, { targetId });
  const other = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { other.addEventListener("open", resolve, { once: true }); other.addEventListener("error", reject, { once: true }); });
  let sequence = 0;
  const jobs = new Map();
  other.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && jobs.has(message.id)) {
      const job = jobs.get(message.id);
      jobs.delete(message.id);
      if (message.error) job.reject(Error(JSON.stringify(message.error)));
      else job.resolve(message.result);
    }
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    jobs.set(id, { resolve, reject });
    other.send(JSON.stringify({ id, method, params }));
  });
  try {
    let loaded = false;
    for (let attempt = 0; attempt < 150 && !loaded; attempt += 1) {
      const probe = await call("Runtime.evaluate", { expression: "document.readyState === 'complete' && location.pathname === '/external' && !window.verify && !window.__native", returnByValue: true });
      loaded = probe.result?.value === true;
      if (!loaded) await delay(30);
    }
    pre("second-document:independent-same-origin-document-without-product-or-instruments", loaded, { targetId });
    const result = await call("Runtime.evaluate", { expression, returnByValue: true });
    pre("second-document:evaluated", !result.exceptionDetails, { exception: result.exceptionDetails?.text ?? null });
    return { targetId, value: result.result.value };
  } finally {
    other.close();
    await cdp("Target.closeTarget", { targetId });
    await cdp("Page.bringToFront");
    await delay(150);
  }
}
const visibleDownloads = () => readdirSync(downloads).filter((name) => !name.startsWith("."));
async function awaitDownload(timeout = 10000) {
  const file = join(downloads, "features-draft.json");
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const names = visibleDownloads();
    if (names.includes("features-draft.json") && !names.some((name) => name.endsWith(".crdownload"))) {
      const first = statSync(file).size;
      await delay(150);
      const second = statSync(file).size;
      if (first > 0 && first === second) return { names: visibleDownloads(), raw: readFileSync(file), file };
    }
    await delay(50);
  }
  return null;
}

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
let harnessError = null;
try {
  mkdirSync(snapshot);
  mkdirSync(downloads);
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
  const pinAndGuard = { name: "features-native-fixed-archive-pin-guard", setup(buildApi) {
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
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== FIXTURE);
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const missingRequired = REQUIRED_MODULES.filter((file) => !inputs.includes(file));
  const requiredHashes = Object.fromEntries(REQUIRED_MODULES.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  // Every bundled reader/host/storage module outside the features package is byte-identical to f359be6.
  const protectedDrift = REQUIRED_MODULES.filter((file) => !file.startsWith(FEATURES_PACKAGE)).filter((file) => {
    const before = execFileSync("git", ["show", `${BEFORE_REVISION}:${file}`], { cwd: root, maxBuffer: 50 * 1024 * 1024 });
    return sha256(before) !== requiredHashes[file];
  });
  const fixedHashes = Object.fromEntries(FIXED_FILES.map((file) => [file, sha256(readFileSync(join(snapshot, file)))]));

  const appPage = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>XAI Web (Features native fixed, ${mode})</title><link rel="stylesheet" href="/__native/bundle.css"><script src="/__native/prelude.js"></script></head><body><div id="root"></div><script type="module" src="/__native/bundle.js"></script></body></html>`;
  const seedPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>seed</title><script src="/__native/prelude.js"></script></head><body><p>seed page: prelude only, no product code</p></body></html>';
  const externalPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Independent same-origin document</title></head><body><p>second document: no product code, no instruments</p></body></html>';
  server = createServer((request, response) => {
    const path = new URL(request.url, "http://127.0.0.1").pathname;
    const category = path.startsWith("/__native/") || path === "/seed" || path === "/external" || path === "/favicon.ico" ? path : "app-document";
    served[category] = (served[category] ?? 0) + 1;
    response.setHeader("Cache-Control", "no-store");
    if (path === "/__native/prelude.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(preludeSource); return; }
    if (path === "/__native/bundle.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(js); return; }
    if (path === "/__native/bundle.css") { response.setHeader("Content-Type", "text/css; charset=utf-8"); response.end(css); return; }
    if (path === "/favicon.ico") { response.statusCode = 204; response.end(); return; }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(path === "/seed" ? seedPage : path === "/external" ? externalPage : appPage);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;

  await openSession();
  const version = await cdp("Browser.getVersion");
  record("baseline", {
    requested, resolved, resolvedTree, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix, composition: mode === "export" ? "settings-host" : "production-app",
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock), extracted: sha256(extractedLock) },
    fileSha256: { "verify-native-fixed.mjs": runnerSha256, [FIXTURE]: sha256(fixtureSource), "native-fixed-prelude.js": sha256(preludeSource), [mode === "export" ? "native-fixed.tsx" : "native-fixed-host.tsx"]: otherFixtureSha },
    bundleSha256: sha256(js), bundleCssSha256: sha256(css),
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
    requiredModules: { count: REQUIRED_MODULES.length, missing: missingRequired, sha256: requiredHashes },
    fixedVsBefore: { before: BEFORE_REVISION, productFilesChanged: fixedDelta, fixedFeatureFilesSha256: fixedHashes, protectedModulesDriftedFromBefore: protectedDrift },
    origin: "127.0.0.1 (ephemeral port); every other host resolves to NOTFOUND",
  });
  pre("baseline:docs-head-product-tree-equals-fixed", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === sha256(archiveLock) && sha256(extractedLock) === sha256(archiveLock));
  pre("baseline:guard-no-module-from-a-checkout", guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre("baseline:every-required-module-bundled-from-archive", missingRequired.length === 0 && REQUIRED_MODULES.every((file) => archiveModules.has(file) || file.endsWith(".css")), { missingRequired });
  pre("baseline:fixed-delta-only-in-features-package", fixedDelta.length > 0 && fixedDelta.every((file) => file.startsWith(FEATURES_PACKAGE)), { fixedDelta });
  pre("baseline:bundled-protected-modules-byte-identical-to-f359be6", protectedDrift.length === 0, { protectedDrift });

  if (mode === "controls") await runControls();
  if (mode === "reset") await runReset();
  if (mode === "export") await runExport();

  const network = await evaluate("__native.network");
  record("observation", { id: "run:network-and-requests", pageNetworkAttemptsInLastDocument: network.length, nonLocal: network.filter((entry) => !entry.local).length, served });
  pre("run:no-non-local-network-attempt", network.every((entry) => entry.local));
  pre("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs });
  check("run:runtime-errors-zero", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 5) });
} catch (error) {
  harnessError = error;
} finally {
  const productFailure = harnessError?.checkKind === "product";
  record("result", {
    pass: harnessError === null, harnessValid: harnessError === null || productFailure, mode, checks, productChecks,
    runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 6),
    consoleWarnings: consoleWarnings.length, consoleWarningSamples: [...new Set(consoleWarnings)].slice(0, 5), dialogs, artifacts,
    ...(harnessError ? { error: String(harnessError?.stack ?? harnessError).slice(0, 1500), checkId: harnessError?.checkId ?? null, checkKind: harnessError?.checkKind ?? null } : {}),
  });
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`, { flag: "wx" });
  await closeSession().catch(() => {});
  server?.closeAllConnections?.();
  server?.close();
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  process.exitCode = harnessError === null ? 0 : harnessError?.checkKind === "product" ? 2 : 1;
  const label = harnessError === null ? "PASS" : harnessError?.checkKind === "product" ? "PRODUCT-FAIL" : "HARNESS-FAIL";
  console.log(`${label} ${relative(root, evidencePath)} checks=${checks} product=${productChecks} exit=${process.exitCode}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
}

// ---------------------------------------------------------------------------------------------------
// E9: controls (production App composition)
// ---------------------------------------------------------------------------------------------------
async function runControls() {
  const APP_PATH = "/app/settings/features";
  await seed({ [MARKER_KEY]: MARKER }, "controls:c0");
  await mountApp("controls:c0");
  await mountCheck("controls:c0-initial-absent-mount", allOf(null));
  {
    const warning = await evaluate("__native.warn()");
    check("controls:c0-clean-positive-control-no-unload-warning", warning.warned === false && warning.attempts === 0, warning);
  }

  // ---- 16 values by trusted input, a graceful browser restart after each ----------------------------
  const steps = IDS.flatMap((id) => [{ id, value: false }, { id, value: true }]);
  pre("controls:sixteen-values", steps.length === 16 && new Set(steps.map((step) => `${step.id}=${step.value}`)).size === 16);
  let expected = allOf(null);
  for (const [index, step] of steps.entries()) {
    const raw = String(step.value);
    const id = `controls:value-${String(index + 1).padStart(2, "0")}:${step.id}=${raw}`;
    const since = await mark();
    const point = await clickSwitch(step.id);
    const next = { ...expected, [step.id]: raw };
    const persisted = await waitUntil(`${physicalIs(next)} && ${statusIs(COPY.saved)} && __native.features().recovery.length === 0`, 6000);
    await delay(150);
    const after = await state(since);
    const dt = await devtools();
    const sets = after.feature.filter((entry) => entry.op === "set");
    const removes = after.feature.filter((entry) => entry.op === "remove" || entry.op === "clear");
    const locks = appLocks(after.locks);
    check(`${id}:trusted-input`, after.events.some((event) => event.type === "click" && event.trusted && event.target === `switch:${step.id}`), { events: after.events.map((event) => `${event.type}:${event.target}:${event.trusted}`) });
    check(`${id}:persisted-with-saved-status`, persisted, { physical: after.physical, view: after.view });
    check(`${id}:exact-physical-bytes-unscoped-key`, isDeepStrictEqual(after.physical, next), { observed: after.physical, expected: next });
    check(`${id}:devtools-bytes`, isDeepStrictEqual(dt, next), { observed: dt });
    check(`${id}:one-exact-write-attempt`, sets.length === 1 && sets[0].key === keyOf(step.id) && sets[0].value === raw && sets[0].outcome === "ok" && removes.length === 0, { sets: short4(sets), removes: short4(removes) });
    check(`${id}:real-device-lock-no-account-machinery`, locks.includes(LOCK_OF(step.id)) && accountLocks(locks).length === 0 && accountMutations(after.attempts).length === 0, { appLocks: locks, accountMutations: short4(accountMutations(after.attempts)) });
    check(`${id}:displayed`, isDeepStrictEqual(after.view.switches, display(next)), { observed: after.view.switches });
    check(`${id}:saved-truth`, after.view.status === COPY.saved && after.view.recovery.length === 0 && after.view.actions === null, { status: after.view.status, recovery: after.view.recovery });
    check(`${id}:zero-key-null-dispatch`, after.keyNullDispatched === 0 && after.keyNullReceived === 0, { dispatched: after.dispatched });
    expected = next;
    const restart = await closeSession();
    pre(`${id}:graceful-browser-close`, restart.graceful, restart);
    await openSession();
    await mountApp(`${id}:after-browser-restart`, APP_PATH);
    await mountCheck(`${id}:after-browser-restart`, expected);
    record("value", { index: index + 1, field: step.id, raw, point, write: sets[0], devtools: dt, rail: (await evaluate("verify.rail()")).length });
  }
  record("controls-16-summary", { values: 16, final: expected });

  // ---- New-document reload in the same browser ------------------------------------------------------
  {
    const previous = await evaluate("verify.instance");
    await cdp("Page.reload", { ignoreCache: true });
    pre("controls:new-document-reload:new-instance", await waitUntil(`${APP_READY} && verify.instance !== ${JSON.stringify(previous)}`, 20000));
    await delay(700);
    await mountCheck("controls:new-document-reload", expected);
  }

  // ---- Native held per-key lock (Matrix on -> off) --------------------------------------------------
  {
    const id = "controls:native-held-lock";
    const name = LOCK_OF("matrix");
    const holder = await evaluate(`__native.hold(${JSON.stringify(name)})`);
    const heldBefore = await evaluate("__native.lockQuery()");
    pre(`${id}:fixture-holds-real-matrix-lock`, holder === name && heldBefore.held.includes(name), { heldBefore });
    const since = await mark();
    await clickSwitch("matrix");
    const pendingShown = await waitUntil(recoveryIs([entry("matrix", "saving")]), 4000);
    await delay(900);
    const during = await state(since);
    const locksDuring = await evaluate("__native.lockQuery()");
    const dtDuring = await devtools();
    const warning = await evaluate("__native.warn()");
    check(`${id}:pending-shown-no-saved-claim`, pendingShown && isDeepStrictEqual(during.view.recovery, [entry("matrix", "saving")]) && during.view.status === "" && isDeepStrictEqual(during.view.actions, ACTIONS), { view: during.view });
    check(`${id}:latest-choice-displayed-while-held`, during.view.switches.matrix === "false", { switches: during.view.switches });
    check(`${id}:bytes-unchanged-while-held`, during.physical.matrix === "true" && dtDuring.matrix === "true" && opsOn(during.attempts, "set", "matrix").length === 0, { physical: during.physical.matrix, devtools: dtDuring.matrix });
    check(`${id}:engine-waits-on-the-real-lock`, locksDuring.held.includes(name) && locksDuring.pending.includes(name) && appLocks(during.locks).filter((lock) => lock === name).length === 1, { locksDuring, appLocks: appLocks(during.locks) });
    check(`${id}:beforeunload-warns-while-pending`, warning.warned === true && warning.attempts === 0, warning);
    const retryMark = await mark();
    await clickButton("Retry Matrix", PANE);
    await delay(400);
    const afterRetry = await state(retryMark);
    check(`${id}:retry-while-pending-is-inert`, afterRetry.feature.length === 0 && appLocks(afterRetry.locks).length === 0 && isDeepStrictEqual(afterRetry.view.recovery, [entry("matrix", "saving")]), { attempts: summarize(afterRetry.feature), locks: afterRetry.locks });
    await evaluate(`__native.release(${JSON.stringify(name)})`);
    const persisted = await waitUntil(`__native.native.get("xai_pref_features_matrix") === "false" && ${statusIs(COPY.saved)} && __native.features().recovery.length === 0`, 6000);
    await delay(150);
    const after = await state(since);
    const sets = opsOn(after.attempts, "set", "matrix");
    check(`${id}:exactly-one-write-after-release`, persisted && sets.length === 1 && sets[0].value === "false" && sets[0].outcome === "ok" && (await devtools()).matrix === "false", { sets: short4(sets), physical: after.physical.matrix });
    check(`${id}:saved-after-release`, after.view.status === COPY.saved && after.view.recovery.length === 0 && after.view.switches.matrix === "false", { view: after.view });
    expected = { ...expected, matrix: "false" };
  }

  // ---- Native readback uncertainty (Pomodoro on -> off) ---------------------------------------------
  {
    const id = "controls:native-readback-uncertainty";
    pre(`${id}:baseline`, (await bytes()).pomodoro === "true");
    await evaluate(`__native.uncertainSet(${JSON.stringify(keyOf("pomodoro"))})`);
    pre(`${id}:fault-armed`, (await evaluate("__native.faultState()")).readbackOnNextSet.includes(keyOf("pomodoro")));
    const since = await mark();
    await clickSwitch("pomodoro");
    const failed = await waitUntil(recoveryIs([entry("pomodoro", "not-saved")]), 5000);
    const first = await state(since);
    const sets = opsOn(first.attempts, "set", "pomodoro");
    const denied = first.attempts.filter((item) => item.op === "get" && item.key === keyOf("pomodoro") && item.outcome === "readback-denied");
    pre(`${id}:readback-fault-fired`, sets.length === 1 && sets[0].outcome === "ok" && sets[0].value === "false" && denied.length === 1 && denied[0].seq > sets[0].seq, { sets: short4(sets), denied: short4(denied) });
    const warning = await evaluate("__native.warn()");
    check(`${id}:uncertain-failure-shown-latest-choice-kept`, failed && isDeepStrictEqual(first.view.recovery, [entry("pomodoro", "not-saved")]) && first.view.switches.pomodoro === "false" && first.physical.pomodoro === "false" && isDeepStrictEqual(first.view.actions, ACTIONS), { view: first.view, physical: first.physical.pomodoro });
    check(`${id}:no-false-saved-and-warns`, first.view.status === "" && warning.warned === true && warning.attempts === 0, { status: first.view.status, warning });
    await clickButton("Retry Pomodoro", PANE);
    const reconciled = await waitUntil(`__native.features().recovery.length === 0 && ${statusIs(COPY.saved)}`, 5000);
    await delay(150);
    const after = await state(since);
    const total = opsOn(after.attempts, "set", "pomodoro");
    check(`${id}:retry-reconciles-with-exactly-one-total-write`, reconciled && total.length === 1 && opsOn(after.attempts, "remove", "pomodoro").length === 0 && after.physical.pomodoro === "false" && (await devtools()).pomodoro === "false", { sets: short4(total), physical: after.physical.pomodoro, status: after.view.status });
    expected = { ...expected, pomodoro: "false" };
  }

  // ---- Second-document conflict (Habits on -> off; the other document restores the baseline "true") ---
  {
    const id = "controls:second-document-conflict";
    pre(`${id}:baseline`, (await bytes()).habits === "true");
    await evaluate(`__native.uncertainSet(${JSON.stringify(keyOf("habits"))})`);
    const since = await mark();
    await clickSwitch("habits");
    const failed = await waitUntil(recoveryIs([entry("habits", "not-saved")]), 5000);
    const first = await state(since);
    const firstSets = opsOn(first.attempts, "set", "habits");
    pre(`${id}:readback-fault-fired`, firstSets.length === 1 && firstSets[0].value === "false" && firstSets[0].outcome === "ok"
      && first.attempts.some((item) => item.key === keyOf("habits") && item.outcome === "readback-denied"), { firstSets: short4(firstSets) });
    check(`${id}:uncertain-failure-shown`, failed && first.physical.habits === "false" && first.view.switches.habits === "false" && first.view.status === "", { recovery: first.view.recovery, physical: first.physical.habits });
    const external = await secondDocument(`localStorage.setItem("xai_pref_features_habits", "true"); localStorage.getItem("xai_pref_features_habits")`);
    pre(`${id}:second-document-restored-the-baseline-bytes`, external.value === "true", external);
    record("second-document-write", { key: keyOf("habits"), value: "true", note: "restores the original baseline bytes (ABA)", targetId: external.targetId });
    await delay(400);
    const delivered = await state(since);
    check(`${id}:native-keyed-storage-event-delivered-not-key-null`, delivered.received.includes(`${keyOf("habits")}:trusted`) && delivered.keyNullReceived === 0 && delivered.keyNullDispatched === 0, { received: delivered.received, dispatched: delivered.dispatched });
    await clickButton("Retry Habits", PANE);
    await delay(800);
    const afterRetry = await state(since);
    const dtRetry = await devtools();
    const warning = await evaluate("__native.warn()");
    check(`${id}:external-bytes-preserved-no-overwrite`, afterRetry.physical.habits === "true" && dtRetry.habits === "true" && opsOn(afterRetry.attempts, "set", "habits").length === 1 && opsOn(afterRetry.attempts, "remove", "habits").length === 0, { physical: afterRetry.physical.habits, devtools: dtRetry.habits, sets: short4(opsOn(afterRetry.attempts, "set", "habits")) });
    check(`${id}:conflict-recovery-remains-latest-choice-kept`, isDeepStrictEqual(afterRetry.view.recovery, [entry("habits", "not-saved")]) && afterRetry.view.switches.habits === "false" && afterRetry.view.status === "" && warning.warned === true, { view: afterRetry.view, warning });
    await clickButton("Retry Habits", PANE);
    await delay(800);
    const afterSecond = await state(since);
    check(`${id}:repeated-retry-never-overwrites`, afterSecond.physical.habits === "true" && opsOn(afterSecond.attempts, "set", "habits").length === 1 && isDeepStrictEqual(afterSecond.view.recovery, [entry("habits", "not-saved")]), { physical: afterSecond.physical.habits, sets: opsOn(afterSecond.attempts, "set", "habits").length });
    const discardMark = await mark();
    await clickButton("Discard Habits", PANE);
    const discarded = await waitUntil("__native.features().recovery.length === 0", 4000);
    await delay(200);
    const afterDiscard = await state(discardMark);
    const discardWarning = await evaluate("__native.warn()");
    const featureReads = afterDiscard.feature.filter((item) => item.op === "get");
    check(`${id}:discard-zero-writes-shows-external-value`, discarded && mutations(afterDiscard.attempts).length === 0 && afterDiscard.view.switches.habits === "true" && afterDiscard.physical.habits === "true"
      && discardWarning.warned === false && afterDiscard.view.actions === null, { mutations: short4(mutations(afterDiscard.attempts)), switches: afterDiscard.view.switches, warning: discardWarning });
    check(`${id}:discard-rereads-only-that-field`, featureReads.length >= 1 && featureReads.every((item) => item.key === keyOf("habits")), { featureReads: short4(featureReads), globalReads: summarize(afterDiscard.attempts).reads });
    record("observation", { id: `${id}:status-after-discard`, status: afterDiscard.view.status });
    expected = { ...expected, habits: "true" };
  }

  // ---- Source-only states: malformed bytes and a throwing read (Reload only, no Saved claim) ----------
  {
    const id = "controls:source-only";
    const SOURCE = { tasks: "1", board: "TRUE", dashboard: "yes", calendar: "", matrix: "\"true\"", pomodoro: " true", habits: "false", meditation: "false" };
    await seed({ [MARKER_KEY]: MARKER, ...Object.fromEntries(IDS.map((field) => [keyOf(field), SOURCE[field]])) }, `${id}:seed`);
    const { identifier } = await cdp("Page.addScriptToEvaluateOnNewDocument", { source: `window.__nativeFaultPlan = { get: [${JSON.stringify(keyOf("habits"))}] };` });
    await mountApp(`${id}:mount`);
    await cdp("Page.removeScriptToEvaluateOnNewDocument", { identifier });
    const now = await state(0);
    const plan = await evaluate("({ plan: __native.planApplied, faults: __native.faultState() })");
    const deniedHabitsRead = now.attempts.some((item) => item.op === "get" && item.key === keyOf("habits") && item.outcome === "denied");
    pre(`${id}:read-fault-plan-applied-before-mount-and-fired`, isDeepStrictEqual(plan.plan, { get: [keyOf("habits")] }) && plan.faults.get.includes(keyOf("habits")) && deniedHabitsRead, { plan });
    const sourceIds = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "habits"];
    const expectedRecovery = sourceIds.map((field) => entry(field, "unavailable"));
    const dt = await devtools();
    const warning = await evaluate("__native.warn()");
    check(`${id}:each-invalid-or-unavailable-field-has-reload-only`, isDeepStrictEqual(now.view.recovery, expectedRecovery), { recovery: now.view.recovery });
    check(`${id}:defaults-displayed-valid-field-unaffected`, isDeepStrictEqual(now.view.switches, { ...allOf("true"), meditation: "false" }), { switches: now.view.switches });
    check(`${id}:no-saved-claim-no-draft-no-export`, now.view.status === "" && now.view.actions === null, { status: now.view.status, actions: now.view.actions });
    check(`${id}:mount-never-rewrites-purges-or-normalizes`, mutations(now.feature).length === 0 && isDeepStrictEqual(now.physical, SOURCE) && isDeepStrictEqual(dt, SOURCE), { mutations: short4(mutations(now.feature)), physical: now.physical, devtools: dt });
    check(`${id}:no-unload-warning`, warning.warned === false && warning.attempts === 0, warning);
    // Positive control: a source-only state never holds a departure.
    const leaveMark = await mark();
    await sidebarClick("About");
    const left = await waitUntil("verify.location().pathname === '/app/settings/about' && !document.querySelector('.settings-departure-dialog')", 4000);
    check(`${id}:departure-not-held`, left, { location: await evaluate("verify.location()"), dialog: await evaluate("__native.dialog()") });
    await sidebarClick("Features");
    pre(`${id}:features-pane-mounted-again`, await waitUntil(`!!document.querySelector('${PANE}') && verify.location().pathname === '/app/settings/features'`, 4000));
    await delay(500);
    const back = await state(leaveMark);
    check(`${id}:source-alerts-again-after-return-zero-writes`, isDeepStrictEqual(back.view.recovery, expectedRecovery) && mutations(back.feature).length === 0, { recovery: back.view.recovery, mutations: short4(mutations(back.feature)) });
    // Reload of a malformed field: rereads, keeps the alert and the bytes, never writes.
    const reloadMark = await mark();
    await clickButton("Reload Tasks", PANE);
    await delay(400);
    const reloaded = await state(reloadMark);
    check(`${id}:reload-malformed-rereads-keeps-alert-and-bytes`, isDeepStrictEqual(reloaded.view.recovery, expectedRecovery) && reloaded.physical.tasks === "1" && mutations(reloaded.attempts).length === 0
      && opsOn(reloaded.attempts, "get", "tasks").length >= 1, { recovery: reloaded.view.recovery, reads: short4(opsOn(reloaded.attempts, "get", "tasks")) });
    record("observation", { id: `${id}:focus-after-reload`, focus: await evaluate("__native.focus()") });
    // The read fault is lifted: Reload repairs the source without a Saved claim.
    await evaluate("__native.restore()");
    const repairMark = await mark();
    await clickButton("Reload Habits", PANE);
    const repaired = await waitUntil(recoveryIs(expectedRecovery.filter((item) => item.id !== "habits")), 4000);
    await delay(200);
    const afterRepair = await state(repairMark);
    check(`${id}:reload-repairs-source-without-saved-claim`, repaired && afterRepair.view.switches.habits === "false" && afterRepair.view.status === "" && mutations(afterRepair.attempts).length === 0, { switches: afterRepair.view.switches, status: afterRepair.view.status });
    // A valid edit over a malformed source is actual work: a failed draft, never a silent overwrite.
    const editMark = await mark();
    await clickSwitch("board");
    const editRecovery = expectedRecovery.filter((item) => item.id !== "habits").map((item) => (item.id === "board" ? entry("board", "not-saved") : item));
    const refused = await waitUntil(recoveryIs(editRecovery), 5000);
    await delay(200);
    const edited = await state(editMark);
    const editWarning = await evaluate("__native.warn()");
    check(`${id}:edit-over-malformed-source-is-a-failed-draft`, refused && edited.view.switches.board === "false" && isDeepStrictEqual(edited.view.actions, ACTIONS) && edited.view.status === "" && editWarning.warned === true, { recovery: edited.view.recovery, switches: edited.view.switches, actions: edited.view.actions });
    check(`${id}:malformed-bytes-never-overwritten`, edited.physical.board === "TRUE" && opsOn(edited.attempts, "set", "board").length === 0 && opsOn(edited.attempts, "remove", "board").length === 0, { physical: edited.physical.board, attempts: short4(edited.feature) });
    const discardMark = await mark();
    await clickButton("Discard Boards", PANE);
    const backToSource = await waitUntil(recoveryIs(expectedRecovery.filter((item) => item.id !== "habits")), 4000);
    await delay(200);
    const discarded = await state(discardMark);
    const discardWarning = await evaluate("__native.warn()");
    check(`${id}:discard-returns-to-reload-only-zero-writes`, backToSource && mutations(discarded.attempts).length === 0 && discarded.physical.board === "TRUE" && discarded.view.actions === null && discardWarning.warned === false, { recovery: discarded.view.recovery, actions: discarded.view.actions, warning: discardWarning });
    const tail = await state(0);
    check(`${id}:zero-key-null-dispatch`, tail.keyNullDispatched === 0 && tail.keyNullReceived === 0, { dispatched: tail.dispatched });
  }
}

// ---------------------------------------------------------------------------------------------------
// E10: Reset to defaults (production App composition)
// ---------------------------------------------------------------------------------------------------
async function runReset() {
  const UNRELATED = { xai_accent_hue: "210", xai_bg_tone: "lavender", xai_pet_id: "pip", xai_pet_pos: JSON.stringify({ x: 300, y: 200 }), xai_pref_sticky_color: "mint", xai_native_unrelated_probe: "keep" };
  const ALL_FALSE = Object.fromEntries(FEATURE_KEYS.map((key) => [key, "false"]));
  const totals = { scenarios: 0, keyNullDispatched: 0, keyNullReceived: 0, relocks: 0, scopeTransitions: 0, gateInsertions: 0, watchedRemovals: 0, replacedNodes: 0 };

  async function scenario(name, seeds, act) {
    await seed({ [MARKER_KEY]: MARKER, ...UNRELATED, ...seeds }, `reset:${name}:seed`);
    await mountApp(`reset:${name}:mount`);
    const raw = Object.fromEntries(IDS.map((field) => [field, seeds[keyOf(field)] ?? null]));
    await mountCheck(`reset:${name}:mount`, raw);
    const unrelatedBefore = await nonFeatureSnapshot();
    const marked = await evaluate("__native.markElements()");
    pre(`reset:${name}:host-elements-marked`, ["shell", "rail", "pet", "settingsShell", "sidebar", "detail", "pane"].every((part) => marked.includes(part)), { marked });
    await evaluate("__native.startDom() && __native.startFrames()");
    const since = await mark();
    await act(since);
    await delay(300);
    const frames = await evaluate("__native.stopFrames()");
    const dom = await evaluate("__native.stopDom()");
    const fates = await evaluate("__native.elementFates()");
    const tail = await state(since);
    const scopeAfter = await evaluate(`verify.scopeAfter(${since})`);
    const unrelatedAfter = await nonFeatureSnapshot();
    const gateInsertions = dom.filter((item) => item.kind === "added" && item.what.includes("gate")).length;
    const watchedRemovals = dom.filter((item) => item.kind === "removed").length;
    const replaced = Object.entries(fates).filter(([, fate]) => fate.marked && !fate.sameNode).map(([part]) => part);
    const restoredFrames = frames.filter((frame) => frame.status === COPY.restored);
    totals.scenarios += 1;
    totals.keyNullDispatched += tail.keyNullDispatched;
    totals.keyNullReceived += tail.keyNullReceived;
    totals.relocks += scopeAfter.filter((item) => item.kind === "locked").length;
    totals.scopeTransitions += scopeAfter.length;
    totals.gateInsertions += gateInsertions;
    totals.watchedRemovals += watchedRemovals;
    totals.replacedNodes += replaced.length;
    check(`reset:${name}:zero-key-null-storage-events`, tail.keyNullDispatched === 0 && tail.keyNullReceived === 0, { dispatched: tail.dispatched, received: tail.received });
    check(`reset:${name}:no-account-relock-or-scope-transition`, scopeAfter.length === 0 && tail.scope.kind === "account" && tail.scope.accountId === OWNER, { scopeAfter, scope: tail.scope });
    check(`reset:${name}:no-host-remount-no-gate-screen`, gateInsertions === 0 && watchedRemovals === 0 && replaced.length === 0, { dom: dom.slice(0, 8), replaced });
    check(`reset:${name}:unrelated-key-snapshot-unchanged`, isDeepStrictEqual(unrelatedAfter, unrelatedBefore), { before: unrelatedBefore, after: unrelatedAfter });
    check(`reset:${name}:defaults-restored-never-shown-with-unresolved-work`, restoredFrames.every((frame) => frame.recoveryBlocks === 0), { frames: frames.length, restoredFrames: restoredFrames.length, offending: restoredFrames.filter((frame) => frame.recoveryBlocks !== 0).slice(0, 3) });
    record("observation", { id: `reset:${name}:integrity`, renderedFrames: frames.length, restoredFrames: restoredFrames.length, focus: await evaluate("__native.focus()"), rail: await evaluate("verify.rail()") });
  }
  const confirmed = (id, run, accepted) => {
    check(`${id}:normative-confirmation-asked-once`, run.dialogs.length === 1 && run.dialogs[0].type === "confirm" && run.dialogs[0].message === COPY.confirm && run.dialogs[0].accepted === accepted, { dialogs: run.dialogs });
  };

  // ---- R0 declined confirmation: zero attempts, no state change ------------------------------------
  await scenario("r0-declined", ALL_FALSE, async (since) => {
    const id = "reset:r0-declined";
    const run = await clickReset(false, id);
    await delay(600);
    const after = await state(since);
    confirmed(id, run, false);
    const click = after.events.find((event) => event.type === "click" && event.trusted && event.target === `button:${COPY.reset}`);
    const returned = after.confirm.find((item) => item.phase === "return");
    pre(`${id}:activation-and-confirm-return-traced`, click && returned && returned.seq > click.seq && returned.result === false, { click, confirm: after.confirm });
    const activation = after.attempts.filter((item) => item.seq > click.seq && item.seq <= returned.seq);
    const warning = await evaluate("__native.warn()");
    check(`${id}:zero-get-set-remove-from-activation-to-return`, activation.length === 0, { activation: short4(activation) });
    check(`${id}:zero-feature-key-attempts-in-the-whole-window`, after.feature.length === 0, { feature: short4(after.feature), global: summarize(after.attempts) });
    check(`${id}:no-state-change`, after.view.recovery.length === 0 && after.view.status === "" && after.view.actions === null && isDeepStrictEqual(after.view.switches, allOf("false"))
      && isDeepStrictEqual(after.physical, allOf("false")) && warning.warned === false, { view: after.view, physical: after.physical, warning });
  });

  // ---- R1 accepted: 8 verified absences (one already absent = verified no-op), never a write -------
  {
    const seeds = { ...ALL_FALSE };
    delete seeds[keyOf("meditation")];
    seeds[keyOf("habits")] = "true";
    await scenario("r1-accepted", seeds, async (since) => {
      const id = "reset:r1-accepted";
      const run = await clickReset(true, id);
      const done = await waitUntil(`${physicalIs(allOf(null))} && ${statusIs(COPY.restored)} && __native.features().recovery.length === 0`, 8000);
      await delay(300);
      const after = await state(since);
      const dt = await devtools();
      const warning = await evaluate("__native.warn()");
      confirmed(id, run, true);
      const removes = after.attempts.filter((item) => item.op === "remove");
      const present = IDS.filter((field) => field !== "meditation");
      check(`${id}:seven-verified-removes-one-verified-no-op`, done && removes.length === 7 && isDeepStrictEqual([...new Set(removes.map((item) => item.key))].sort(), present.map(keyOf).sort()) && removes.every((item) => item.outcome === "ok")
        && opsOn(after.attempts, "remove", "meditation").length === 0, { removes: short4(removes) });
      check(`${id}:never-writes-true-or-anything`, after.attempts.filter((item) => item.op === "set" || item.op === "clear").length === 0, { writes: short4(after.attempts.filter((item) => item.op === "set")) });
      check(`${id}:all-eight-keys-absent`, isDeepStrictEqual(after.physical, allOf(null)) && isDeepStrictEqual(dt, allOf(null)), { physical: after.physical, devtools: dt });
      check(`${id}:defaults-displayed-and-truthful-defaults-restored`, isDeepStrictEqual(after.view.switches, allOf("true")) && after.view.recovery.length === 0 && after.view.status === COPY.restored && after.view.statusRole === "status" && after.view.actions === null && warning.warned === false, { view: after.view, warning });
      const locks = appLocks(after.locks);
      check(`${id}:device-key-locks-only`, IDS.every((field) => locks.includes(LOCK_OF(field))) && accountLocks(locks).length === 0 && accountMutations(after.attempts).length === 0, { appLocks: locks });
    });
  }

  // ---- R2 one-key removeItem fault (Calendar): reset draft, targeted Retry --------------------------
  await scenario("r2-one-key-fault", ALL_FALSE, async (since) => {
    const id = "reset:r2-one-key-fault";
    await evaluate(`__native.denyRemove(${JSON.stringify(keyOf("calendar"))})`);
    const run = await clickReset(true, id);
    const partial = await waitUntil(`${recoveryIs([entry("calendar", "not-reset")])} && ${physicalIs({ ...allOf(null), calendar: "false" })}`, 8000);
    await delay(300);
    const after = await state(since);
    const warning = await evaluate("__native.warn()");
    confirmed(id, run, true);
    const removes = after.attempts.filter((item) => item.op === "remove");
    pre(`${id}:fault-armed-and-fired`, opsOn(after.attempts, "remove", "calendar").some((item) => item.outcome === "denied"), { removes: short4(removes) });
    check(`${id}:per-field-refusal-keeps-a-reset-draft`, partial && isDeepStrictEqual(after.view.recovery, [entry("calendar", "not-reset")]) && after.view.switches.calendar === "true" && after.physical.calendar === "false", { recovery: after.view.recovery, switches: after.view.switches, physical: after.physical });
    check(`${id}:other-seven-removed-no-writes`, removes.length === 8 && removes.filter((item) => item.outcome === "ok").length === 7 && after.attempts.filter((item) => item.op === "set").length === 0, { removes: short4(removes) });
    check(`${id}:no-defaults-restored-while-unresolved`, after.view.status === "" && isDeepStrictEqual(after.view.actions, ACTIONS) && warning.warned === true, { status: after.view.status, actions: after.view.actions, warning });
    const repeatMark = await mark();
    await clickButton("Retry Calendar", PANE);
    await delay(500);
    const repeat = await state(repeatMark);
    const repeatRemoves = repeat.attempts.filter((item) => item.op === "remove");
    check(`${id}:repeated-refusal-retry-targets-only-calendar`, repeatRemoves.length === 1 && repeatRemoves[0].key === keyOf("calendar") && repeatRemoves[0].outcome === "denied" && repeat.attempts.filter((item) => item.op === "set").length === 0
      && isDeepStrictEqual(repeat.view.recovery, [entry("calendar", "not-reset")]) && repeat.view.status === "", { removes: short4(repeatRemoves), recovery: repeat.view.recovery });
    await evaluate("__native.restore()");
    const retryMark = await mark();
    await clickButton("Retry Calendar", PANE);
    const restored = await waitUntil(`${statusIs(COPY.restored)} && __native.features().recovery.length === 0`, 6000);
    await delay(200);
    const final = await state(retryMark);
    const finalRemoves = final.attempts.filter((item) => item.op === "remove");
    const finalWarning = await evaluate("__native.warn()");
    check(`${id}:targeted-retry-one-remove-successful-fields-not-removed-again`, restored && finalRemoves.length === 1 && finalRemoves[0].key === keyOf("calendar") && finalRemoves[0].outcome === "ok" && final.attempts.filter((item) => item.op === "set").length === 0, { removes: short4(finalRemoves) });
    check(`${id}:defaults-restored-only-after-every-field`, final.view.status === COPY.restored && isDeepStrictEqual(final.physical, allOf(null)) && isDeepStrictEqual(final.view.switches, allOf("true")) && final.view.actions === null && finalWarning.warned === false, { view: final.view, physical: final.physical });
  });

  // ---- R3 two-key removeItem faults (Boards, Habits): independent targeted Retry --------------------
  await scenario("r3-two-key-fault", ALL_FALSE, async (since) => {
    const id = "reset:r3-two-key-fault";
    await evaluate(`__native.denyRemove(${JSON.stringify([keyOf("board"), keyOf("habits")])})`);
    const run = await clickReset(true, id);
    const partial = await waitUntil(`${recoveryIs([entry("board", "not-reset"), entry("habits", "not-reset")])} && ${physicalIs({ ...allOf(null), board: "false", habits: "false" })}`, 8000);
    await delay(300);
    const after = await state(since);
    confirmed(id, run, true);
    const removes = after.attempts.filter((item) => item.op === "remove");
    pre(`${id}:faults-armed-and-fired`, opsOn(after.attempts, "remove", "board").some((item) => item.outcome === "denied") && opsOn(after.attempts, "remove", "habits").some((item) => item.outcome === "denied"), { removes: short4(removes) });
    check(`${id}:two-reset-drafts-six-removed`, partial && removes.length === 8 && removes.filter((item) => item.outcome === "ok").length === 6 && after.attempts.filter((item) => item.op === "set").length === 0
      && after.view.status === "" && isDeepStrictEqual(after.view.actions, ACTIONS), { recovery: after.view.recovery, removes: short4(removes), status: after.view.status });
    await evaluate(`__native.restore(); __native.denyRemove(${JSON.stringify(keyOf("habits"))})`);
    const boardsMark = await mark();
    await clickButton("Retry Boards", PANE);
    const oneLeft = await waitUntil(`${recoveryIs([entry("habits", "not-reset")])} && __native.native.get("xai_pref_features_board") === null`, 6000);
    await delay(300);
    const afterBoards = await state(boardsMark);
    const boardsRemoves = afterBoards.attempts.filter((item) => item.op === "remove");
    const warning = await evaluate("__native.warn()");
    check(`${id}:retry-boards-one-remove-habits-still-unresolved`, oneLeft && boardsRemoves.length === 1 && boardsRemoves[0].key === keyOf("board") && boardsRemoves[0].outcome === "ok" && afterBoards.physical.habits === "false"
      && afterBoards.view.status === "" && warning.warned === true, { removes: short4(boardsRemoves), recovery: afterBoards.view.recovery, status: afterBoards.view.status });
    await evaluate("__native.restore()");
    const habitsMark = await mark();
    await clickButton("Retry Habits", PANE);
    const restored = await waitUntil(`${statusIs(COPY.restored)} && __native.features().recovery.length === 0`, 6000);
    await delay(200);
    const final = await state(habitsMark);
    const finalRemoves = final.attempts.filter((item) => item.op === "remove");
    check(`${id}:retry-habits-one-remove-then-defaults-restored`, restored && finalRemoves.length === 1 && finalRemoves[0].key === keyOf("habits") && finalRemoves[0].outcome === "ok" && isDeepStrictEqual(final.physical, allOf(null)) && final.view.status === COPY.restored, { removes: short4(finalRemoves), status: final.view.status });
  });

  // ---- R4 readback uncertainty after a successful remove (Pomodoro): exactly one remove ------------
  await scenario("r4-uncertainty", ALL_FALSE, async (since) => {
    const id = "reset:r4-uncertainty";
    await evaluate(`__native.uncertainRemove(${JSON.stringify(keyOf("pomodoro"))})`);
    const run = await clickReset(true, id);
    const partial = await waitUntil(`${recoveryIs([entry("pomodoro", "not-reset")])} && ${physicalIs(allOf(null))}`, 8000);
    await delay(300);
    const after = await state(since);
    const warning = await evaluate("__native.warn()");
    confirmed(id, run, true);
    const removes = opsOn(after.attempts, "remove", "pomodoro");
    const denied = after.attempts.filter((item) => item.op === "get" && item.key === keyOf("pomodoro") && item.outcome === "readback-denied");
    pre(`${id}:readback-fault-fired-after-the-remove`, removes.length === 1 && removes[0].outcome === "ok" && denied.length === 1 && denied[0].seq > removes[0].seq, { removes: short4(removes), denied: short4(denied) });
    check(`${id}:uncertain-reset-keeps-its-draft`, partial && isDeepStrictEqual(after.view.recovery, [entry("pomodoro", "not-reset")]) && after.view.status === "" && warning.warned === true, { recovery: after.view.recovery, status: after.view.status });
    await clickButton("Retry Pomodoro", PANE);
    const restored = await waitUntil(`${statusIs(COPY.restored)} && __native.features().recovery.length === 0`, 6000);
    await delay(200);
    const final = await state(since);
    check(`${id}:retry-verifies-absence-with-exactly-one-total-remove`, restored && opsOn(final.attempts, "remove", "pomodoro").length === 1 && final.attempts.filter((item) => item.op === "set").length === 0
      && isDeepStrictEqual(final.physical, allOf(null)) && final.view.status === COPY.restored, { removes: short4(opsOn(final.attempts, "remove", "pomodoro")), status: final.view.status });
  });

  // ---- R5 external conflict (Matrix): another document replaces the bytes; preserved ----------------
  await scenario("r5-external-conflict", ALL_FALSE, async (since) => {
    const id = "reset:r5-external-conflict";
    await evaluate(`__native.denyRemove(${JSON.stringify(keyOf("matrix"))})`);
    const run = await clickReset(true, id);
    const partial = await waitUntil(`${recoveryIs([entry("matrix", "not-reset")])} && ${physicalIs({ ...allOf(null), matrix: "false" })}`, 8000);
    confirmed(id, run, true);
    const setup = await state(since);
    pre(`${id}:fault-armed-and-fired`, opsOn(setup.attempts, "remove", "matrix").some((item) => item.outcome === "denied"), { removes: short4(setup.attempts.filter((item) => item.op === "remove")) });
    check(`${id}:refused-reset-keeps-a-reset-draft`, partial, { recovery: setup.view.recovery, physical: setup.physical });
    const external = await secondDocument(`localStorage.setItem("xai_pref_features_matrix", "true"); localStorage.getItem("xai_pref_features_matrix")`);
    pre(`${id}:second-document-replaced-bytes`, external.value === "true", external);
    record("second-document-write", { key: keyOf("matrix"), value: "true", targetId: external.targetId });
    await delay(400);
    await evaluate("__native.restore()");
    const retryMark = await mark();
    await clickButton("Retry Matrix", PANE);
    await delay(800);
    const afterRetry = await state(retryMark);
    const dt = await devtools();
    const warning = await evaluate("__native.warn()");
    check(`${id}:external-bytes-preserved-no-remove`, afterRetry.physical.matrix === "true" && dt.matrix === "true" && afterRetry.attempts.filter((item) => item.op === "remove" || item.op === "set").length === 0, { physical: afterRetry.physical.matrix, devtools: dt.matrix, mutations: short4(mutations(afterRetry.attempts)) });
    check(`${id}:reset-draft-kept-no-defaults-restored`, isDeepStrictEqual(afterRetry.view.recovery, [entry("matrix", "not-reset")]) && afterRetry.view.status !== COPY.restored && warning.warned === true, { recovery: afterRetry.view.recovery, status: afterRetry.view.status });
    const repeatMark = await mark();
    await clickButton("Retry Matrix", PANE);
    await delay(800);
    const repeat = await state(repeatMark);
    check(`${id}:repeated-retry-never-removes`, repeat.physical.matrix === "true" && mutations(repeat.attempts).length === 0 && isDeepStrictEqual(repeat.view.recovery, [entry("matrix", "not-reset")]), { mutations: short4(mutations(repeat.attempts)) });
    const discardMark = await mark();
    await clickButton("Discard Matrix", PANE);
    const discarded = await waitUntil("__native.features().recovery.length === 0", 4000);
    await delay(200);
    const final = await state(discardMark);
    const finalWarning = await evaluate("__native.warn()");
    check(`${id}:discard-zero-writes-shows-external-value`, discarded && mutations(final.attempts).length === 0 && final.view.switches.matrix === "true" && final.physical.matrix === "true" && final.view.actions === null && finalWarning.warned === false, { switches: final.view.switches, physical: final.physical.matrix });
    check(`${id}:defaults-restored-not-claimed-after-discarded-reset`, final.view.status !== COPY.restored, { status: final.view.status });
    record("observation", { id: `${id}:status-after-discard`, status: final.view.status });
  });

  record("reset-throughout", totals);
  check("reset:throughout:zero-key-null-zero-relock-zero-remount", totals.scenarios === 6 && totals.keyNullDispatched === 0 && totals.keyNullReceived === 0 && totals.relocks === 0 && totals.scopeTransitions === 0
    && totals.gateInsertions === 0 && totals.watchedRemovals === 0 && totals.replacedNodes === 0, totals);
}

// ---------------------------------------------------------------------------------------------------
// E11: on-disk export (Settings host composition)
// ---------------------------------------------------------------------------------------------------
async function runExport() {
  const envelope = (device) => ({ version: 1, kind: "features-draft", changes: { device } });
  const SET = (value) => ({ operation: "set", value });
  const RESET_OP = { operation: "reset" };
  const DENY_ALL_SETS = `__native.denySet(${JSON.stringify(FEATURE_KEYS)})`;
  await seed({ [keyOf("board")]: "false", [keyOf("calendar")]: "false", [keyOf("habits")]: "false" }, "export:seed");
  await cdp("Page.navigate", { url: `${origin}/app/settings/about` });
  pre("export:host-mounted-at-about", await waitUntil("!!window.verify && verify.composition === 'settings-host' && document.querySelector('.settings-detail')?.getAttribute('data-pane') === 'about'", 20000));
  await delay(400);
  const startScope = await evaluate("verify.scope()");
  pre("export:account-a-active", startScope.kind === "account" && startScope.accountId === "features-native-A", startScope);
  const startMark = await mark();
  await sidebarClick("Features");
  pre("export:features-mounted-by-trusted-sidebar-click", await waitUntil(`!!document.querySelector('${PANE}') && verify.location().pathname === '/app/settings/features'`, 6000));
  await delay(450);
  const lockNames = await evaluate(`Object.fromEntries(${JSON.stringify(IDS)}.map((id) => [id, verify.lockName(id)]))`);
  pre("export:real-lock-names", IDS.every((field) => lockNames[field] === LOCK_OF(field)), { lockNames });
  {
    const now = await state(startMark);
    const warning = await evaluate("__native.warn()");
    const raw = { ...allOf(null), board: "false", calendar: "false", habits: "false" };
    check("export:start:zero-write-mount", mutations(now.feature).length === 0 && isDeepStrictEqual(now.physical, raw) && isDeepStrictEqual(now.view.switches, display(raw)), { physical: now.physical, switches: now.view.switches, mutations: short4(mutations(now.feature)) });
    check("export:start:clean-positive-control-no-warning", warning.warned === false && now.view.recovery.length === 0 && now.view.actions === null && now.view.status === "", { warning, view: now.view });
    check("export:start:features-entry-has-own-history-key", now.location.key !== "default", { location: now.location });
  }
  let featuresLocation = await evaluate("verify.location()");
  const sameLocation = (left, right) => left.pathname === right.pathname && left.key === right.key;

  async function guardStillBlocks(id, dialogAlreadyOpen) {
    const since = await mark();
    if (dialogAlreadyOpen) {
      await clickButton("Stay", ".settings-departure-dialog");
      const closed = await waitUntil("__native.dialog() === null", 3000);
      check(`${id}:stay-keeps-location`, closed && sameLocation(await evaluate("verify.location()"), featuresLocation), { location: await evaluate("verify.location()") });
    }
    await sidebarClick("About");
    const opened = await waitUntil("__native.dialog() !== null", 3000);
    const during = await evaluate("({ dialog: __native.dialog(), location: verify.location() })");
    check(`${id}:guard-still-blocks`, opened && during.dialog?.label === COPY.dialogLabel && during.dialog?.text === COPY.dialogText && sameLocation(during.location, featuresLocation), during);
    await clickButton("Stay", ".settings-departure-dialog");
    const closed = await waitUntil("__native.dialog() === null", 3000);
    const final = await state(since);
    check(`${id}:stay-returns-to-features`, closed && sameLocation(final.location, featuresLocation), { location: final.location, guardWindowAttempts: summarize(final.attempts) });
  }

  async function exportUnderDenial(shape, expectedDevice, options) {
    const { via = "pane", baseFaults, expectedRecovery, failure = null, extra = null } = options;
    const id = `export:${shape}`;
    await evaluate("__native.restore(); __native.denyAll()");
    const probe = await evaluate("__native.probe()");
    pre(`${id}:total-denial-armed-injector-fires`, probe.threw === true && probe.logged === 1 && probe.last?.outcome === "denied" && (await evaluate("__native.faultState()")).all === true, { probe });
    pre(`${id}:download-directory-empty`, visibleDownloads().length === 0, { names: readdirSync(downloads) });
    if (failure === "click") await evaluate("__native.failNextClick()");
    if (failure === "create") await evaluate("__native.failNextCreate()");
    const before = await evaluate("({ mark: __native.mark(), url: __native.urlTrace(), click: __native.clickTrace(), anchors: __native.anchorTrace(), location: verify.location(), dialog: __native.dialog() })");
    const point = via === "pane"
      ? await clickButton(COPY.exportDraft, `${PANE} .features-recovery-actions`)
      : await clickButton("Export current draft", ".settings-departure-dialog");
    let download = null;
    if (failure) {
      const shown = await waitUntil(`__native.features()?.actions?.alert === ${JSON.stringify(COPY.exportFailed)}`, 4000);
      check(`${id}:localized-export-error-visible`, shown, { actions: (await evaluate("__native.features()")).actions });
      await delay(1500);
      check(`${id}:no-download-written`, visibleDownloads().length === 0, { names: readdirSync(downloads) });
    } else {
      download = await awaitDownload();
      check(`${id}:actual-chrome-download-on-disk`, download !== null, { names: readdirSync(downloads) });
    }
    await delay(120);
    const after = await evaluate(`({ attempts: __native.window(${before.mark}).attempts, url: __native.urlTrace(), click: __native.clickTrace(), anchors: __native.anchorTrace(),
      anchorsInDom: __native.anchorsInDom(), location: verify.location(), dialog: __native.dialog(), view: __native.features(),
      physical: Object.fromEntries(${JSON.stringify(IDS)}.map((field) => [field, __native.native.get("xai_pref_features_" + field)])),
      pendingFailures: __native.pendingFailures(), keyNull: __native.window(${before.mark}).storageDispatches.filter((item) => item.key === null).length })`);
    const counts = summarize(after.attempts);
    check(`${id}:attempt-level-zero-reads-writes-removes`, after.attempts.length === 0, { counts, first: short4(after.attempts) });
    const createAttempts = after.url.createAttempts - before.url.createAttempts;
    const created = after.url.created.slice(before.url.created.length);
    const revoked = after.url.revoked.slice(before.url.revoked.length);
    const clicks = after.click.hrefs.slice(before.click.hrefs.length);
    const added = after.anchors.added.slice(before.anchors.added.length);
    const removed = after.anchors.removed.slice(before.anchors.removed.length);
    pre(`${id}:failure-hook-consumed`, !after.pendingFailures.click && !after.pendingFailures.create, after.pendingFailures);
    if (failure === "create") {
      check(`${id}:create-failure-no-url-no-anchor-no-click`, createAttempts === 1 && after.url.createThrows - before.url.createThrows === 1 && created.length === 0 && revoked.length === 0 && clicks.length === 0 && added.length === 0 && after.anchorsInDom === 0, { createAttempts, created, revoked, clicks, added });
    } else {
      check(`${id}:exactly-one-object-url-created-and-same-revoked`, createAttempts === 1 && created.length === 1 && revoked.length === 1 && revoked[0] === created[0], { createAttempts, created, revoked });
      check(`${id}:anchor-appended-clicked-once-removed`, clicks.length === 1 && clicks[0] === created[0] && added.length === 1 && added[0] === created[0] && removed.length === 1 && removed[0] === created[0] && after.anchorsInDom === 0, { clicks, added, removed, anchorsInDom: after.anchorsInDom });
      if (failure === "click") check(`${id}:click-failure-fired`, after.click.throws - before.click.throws === 1, { throws: after.click.throws });
    }
    if (download) {
      const text = download.raw.toString("utf8");
      const payload = JSON.parse(text);
      check(`${id}:disk-json-deep-equals-full-envelope`, isDeepStrictEqual(payload, envelope(expectedDevice)), { payload, expected: envelope(expectedDevice) });
      check(`${id}:single-download-file`, download.names.length === 1 && download.names[0] === "features-draft.json", { names: download.names });
      check(`${id}:no-account-bucket-physical-key-or-timestamp`, !/xai_pref_|xai:account|xai:demo|features-native|"account|timestamp|savedAt|"at"/.test(text) && Object.keys(payload.changes).join() === "device", { text });
      const artifact = `native-${short}-${suffix}-export-${shape}-features-draft.json`;
      pre(`${id}:artifact-not-overwritten`, !existsSync(join(evidenceDir, artifact)), { artifact });
      copyFileSync(download.file, join(evidenceDir, artifact));
      rmSync(download.file);
      const item = { shape, artifact, sha256: sha256(download.raw), bytes: download.raw.length, raw: text };
      artifacts.push(item);
      record("disk-export", { ...item, payload });
      check(`${id}:export-error-cleared`, after.view.actions?.alert === null, { actions: after.view.actions });
    }
    check(`${id}:zero-key-null-dispatch`, after.keyNull === 0, { keyNull: after.keyNull });
    check(`${id}:location-unchanged`, sameLocation(after.location, before.location) && sameLocation(after.location, featuresLocation), { before: before.location, after: after.location });
    if (via === "dialog") check(`${id}:dialog-stays-open`, after.dialog !== null && isDeepStrictEqual(after.dialog, before.dialog), { dialog: after.dialog });
    else check(`${id}:no-dialog-side-effect`, after.dialog === null, { dialog: after.dialog });
    check(`${id}:drafts-and-guard-reasons-kept`, isDeepStrictEqual(after.view.recovery, expectedRecovery) && isDeepStrictEqual(after.view.actions?.buttons, ACTIONS.buttons), { recovery: after.view.recovery });
    if (extra) await extra(id);
    const warning = await evaluate("__native.warn()");
    check(`${id}:beforeunload-still-warns`, warning.warned === true && warning.attempts === 0, warning);
    await guardStillBlocks(id, via === "dialog");
    await evaluate(`__native.restore(); ${baseFaults}`);
    record("export-step", { shape, via, point, failure, location: after.location, counts });
  }
  const waitRecovery = async (id, expected) => {
    const ok = await waitUntil(recoveryIs(expected), 6000);
    check(id, ok, { recovery: (await evaluate("__native.features()")).recovery, expected });
  };
  /** Clicks one switch and waits until that field shows the expected state and displayed value. */
  async function toggleTo(field, displayed, stateName) {
    await clickSwitch(field);
    const ok = await waitUntil(`(() => { const view = __native.features(); const item = view.recovery.find((candidate) => candidate.id === ${JSON.stringify(field)});
      return view.switches[${JSON.stringify(field)}] === ${JSON.stringify(displayed)} && !!item && item.text === ${JSON.stringify(entry(field, stateName).text)}; })()`, 6000);
    check(`export:toggle:${field}->${displayed}:${stateName}`, ok, { view: await evaluate("__native.features()") });
  }

  // X1 sparse set, one field (Tasks off; its write refused).
  await evaluate(DENY_ALL_SETS);
  {
    const since = await mark();
    await toggleTo("tasks", "false", "not-saved");
    await waitRecovery("export:x1:tasks-set-draft-failed", [entry("tasks", "not-saved")]);
    const now = await state(since);
    pre("export:x1:write-fault-fired", opsOn(now.attempts, "set", "tasks").some((item) => item.value === "false" && item.outcome === "denied") && now.physical.tasks === null, { physical: now.physical });
  }
  await exportUnderDenial("x1-sparse-set-one-field", { tasks: SET(false) }, { baseFaults: DENY_ALL_SETS, expectedRecovery: [entry("tasks", "not-saved")] });

  // X2 sparse reset, one field left over from a partial reset (Habits removal refused).
  const X2_FAULTS = `${DENY_ALL_SETS}; __native.denyRemove(${JSON.stringify(keyOf("habits"))})`;
  await evaluate(`__native.restore(); ${X2_FAULTS}`);
  {
    const since = await mark();
    const run = await clickReset(true, "export:x2");
    check("export:x2:normative-confirmation-accepted", run.dialogs.length === 1 && run.dialogs[0].type === "confirm" && run.dialogs[0].message === COPY.confirm && run.dialogs[0].accepted === true, { dialogs: run.dialogs });
    await waitRecovery("export:x2:partial-reset-leaves-habits", [entry("habits", "not-reset")]);
    await delay(200);
    const now = await state(since);
    const removes = now.attempts.filter((item) => item.op === "remove");
    pre("export:x2:remove-fault-fired", opsOn(now.attempts, "remove", "habits").some((item) => item.outcome === "denied"), { removes: short4(removes) });
    check("export:x2:partial-reset-removed-the-others-without-writes", isDeepStrictEqual(now.physical, { ...allOf(null), habits: "false" }) && now.attempts.filter((item) => item.op === "set").length === 0 && now.view.status === "", { physical: now.physical, removes: short4(removes), status: now.view.status });
  }
  await exportUnderDenial("x2-sparse-reset-one-field-after-partial-reset", { habits: RESET_OP }, { baseFaults: X2_FAULTS, expectedRecovery: [entry("habits", "not-reset")] });

  // X3 mixed set and reset (Boards off refused + the Habits reset draft).
  await toggleTo("board", "false", "not-saved");
  await waitRecovery("export:x3:mixed-drafts", [entry("board", "not-saved"), entry("habits", "not-reset")]);
  await exportUnderDenial("x3-mixed-set-and-reset", { board: SET(false), habits: RESET_OP }, { baseFaults: X2_FAULTS, expectedRecovery: [entry("board", "not-saved"), entry("habits", "not-reset")] });

  // X4 all 8 sets (mixed values: Boards, Matrix and Habits end on, the others off). Habits still stores
  // "false" (its removal was refused in X2), so turning it off first is a verified no-op save (compare before
  // write, no write attempt); its second activation (on) is the refused set kept as a draft.
  await evaluate(`__native.restore(); ${DENY_ALL_SETS}`);
  for (const field of ["tasks", "dashboard", "calendar", "matrix", "pomodoro", "meditation"]) await toggleTo(field, "false", "not-saved");
  {
    const since = await mark();
    await clickSwitch("habits");
    const settled = await waitUntil(`(() => { const view = __native.features(); return view.switches.habits === "false" && !view.recovery.some((item) => item.id === "habits"); })()`, 6000);
    const now = await state(since);
    check("export:x4:habits-off-equal-to-stored-bytes-is-a-verified-no-op-save", settled && opsOn(now.attempts, "set", "habits").length === 0 && now.physical.habits === "false", { habitsAttempts: short4(now.feature.filter((item) => item.key === keyOf("habits"))), physical: now.physical.habits });
  }
  await toggleTo("habits", "true", "not-saved");
  await toggleTo("board", "true", "not-saved");
  await toggleTo("matrix", "true", "not-saved");
  const ALL8_SETS = { tasks: SET(false), board: SET(true), dashboard: SET(false), calendar: SET(false), matrix: SET(true), pomodoro: SET(false), habits: SET(true), meditation: SET(false) };
  await waitRecovery("export:x4:all-eight-set-drafts", IDS.map((field) => entry(field, "not-saved")));
  {
    const view = await evaluate("__native.features()");
    check("export:x4:displayed-latest-choices", isDeepStrictEqual(view.switches, { ...allOf("false"), board: "true", matrix: "true", habits: "true" }), { switches: view.switches });
  }
  await exportUnderDenial("x4-all-eight-sets", ALL8_SETS, { baseFaults: DENY_ALL_SETS, expectedRecovery: IDS.map((field) => entry(field, "not-saved")) });

  // X5 all 8 pending resets: every real per-key lock is held, then Reset to defaults is accepted.
  {
    const names = IDS.map(LOCK_OF);
    for (const name of names) await evaluate(`__native.hold(${JSON.stringify(name)})`);
    const heldBefore = await evaluate("__native.lockQuery()");
    pre("export:x5:fixture-holds-all-eight-real-locks", names.every((name) => heldBefore.held.includes(name)), { heldBefore });
    const run = await clickReset(true, "export:x5");
    check("export:x5:normative-confirmation-accepted", run.dialogs.length === 1 && run.dialogs[0].message === COPY.confirm && run.dialogs[0].accepted === true, { dialogs: run.dialogs });
    await waitRecovery("export:x5:all-eight-resets-pending", IDS.map((field) => entry(field, "resetting")));
    const locks = await evaluate("__native.lockQuery()");
    check("export:x5:engine-waits-on-all-eight-real-locks", names.every((name) => locks.held.includes(name) && locks.pending.includes(name)), { locks });
  }
  await exportUnderDenial("x5-all-eight-pending-resets", Object.fromEntries(IDS.map((field) => [field, RESET_OP])), {
    baseFaults: DENY_ALL_SETS,
    expectedRecovery: IDS.map((field) => entry(field, "resetting")),
    extra: async (id) => {
      const locks = await evaluate("__native.lockQuery()");
      const physical = await bytes();
      check(`${id}:export-never-releases-held-resets`, IDS.every((field) => locks.held.includes(LOCK_OF(field)) && locks.pending.includes(LOCK_OF(field))) && isDeepStrictEqual(physical, { ...allOf(null), habits: "false" }), { locks, physical });
    },
  });
  {
    const since = await mark();
    for (const field of IDS) await evaluate(`__native.release(${JSON.stringify(LOCK_OF(field))})`);
    const restored = await waitUntil(`${statusIs(COPY.restored)} && __native.features().recovery.length === 0 && ${physicalIs(allOf(null))}`, 8000);
    await delay(200);
    const now = await state(since);
    const removes = now.attempts.filter((item) => item.op === "remove");
    check("export:x5:released-resets-complete-defaults-restored", restored && removes.length === 1 && removes[0].key === keyOf("habits") && removes[0].outcome === "ok" && now.attempts.filter((item) => item.op === "set").length === 0
      && isDeepStrictEqual(now.view.switches, allOf("true")) && (await evaluate("__native.warn()")).warned === false, { removes: short4(removes), status: now.view.status });
  }

  // X6 export from the departure dialog (Dashboard and Pomodoro refused, trusted sidebar departure held).
  await toggleTo("dashboard", "false", "not-saved");
  await toggleTo("pomodoro", "false", "not-saved");
  const TWO = [entry("dashboard", "not-saved"), entry("pomodoro", "not-saved")];
  await waitRecovery("export:x6:two-set-drafts", TWO);
  {
    await sidebarClick("About");
    const opened = await waitUntil("__native.dialog() !== null", 3000);
    const now = await evaluate("({ dialog: __native.dialog(), location: verify.location() })");
    check("export:x6:trusted-sidebar-departure-held", opened && now.dialog?.label === COPY.dialogLabel && sameLocation(now.location, featuresLocation), now);
  }
  await exportUnderDenial("x6-departure-dialog", { dashboard: SET(false), pomodoro: SET(false) }, { via: "dialog", baseFaults: DENY_ALL_SETS, expectedRecovery: TWO });

  // X7 fresh locked export after A -> locked (drafts survive; a new device draft in the locked scope).
  {
    const before = await evaluate("verify.scope()");
    pre("export:x7:starts-in-account-a", before.kind === "account" && before.accountId === "features-native-A", before);
    const locked = await evaluate("verify.lockScope()");
    await delay(300);
    const now = await state(0);
    pre("export:x7:scope-locked", locked.kind === "locked" && locked.epoch > before.epoch && now.scope.epoch === locked.epoch, { before, locked });
    check("export:x7:device-drafts-survive-a-to-locked", isDeepStrictEqual(now.view.recovery, TWO) && now.view.switches.dashboard === "false" && now.view.switches.pomodoro === "false", { recovery: now.view.recovery });
    await toggleTo("meditation", "false", "not-saved");
    record("export-transition", { from: before, to: locked });
  }
  const THREE = [entry("dashboard", "not-saved"), entry("pomodoro", "not-saved"), entry("meditation", "not-saved")];
  featuresLocation = await evaluate("verify.location()");
  await exportUnderDenial("x7-fresh-locked-after-a-to-locked", { dashboard: SET(false), pomodoro: SET(false), meditation: SET(false) }, { baseFaults: DENY_ALL_SETS, expectedRecovery: THREE });

  // X8 fresh B export after A -> B (locked -> A first, then A -> B; a new device draft in B).
  {
    const lockedScope = await evaluate("verify.scope()");
    const backToA = await evaluate("verify.activateA()");
    await delay(250);
    const atA = await state(0);
    check("export:x8:device-drafts-survive-locked-to-a", backToA.kind === "account" && backToA.accountId === "features-native-A" && isDeepStrictEqual(atA.view.recovery, THREE), { backToA, recovery: atA.view.recovery });
    const toB = await evaluate("verify.activateB()");
    await delay(300);
    const atB = await state(0);
    pre("export:x8:scope-b", toB.kind === "account" && toB.accountId === "features-native-B" && toB.epoch > backToA.epoch && atB.scope.epoch === toB.epoch, { toB });
    check("export:x8:device-drafts-survive-a-to-b", isDeepStrictEqual(atB.view.recovery, THREE), { recovery: atB.view.recovery });
    await toggleTo("tasks", "false", "not-saved");
    record("export-transition", { from: lockedScope, via: backToA, to: toB });
  }
  const FOUR = [entry("tasks", "not-saved"), entry("dashboard", "not-saved"), entry("pomodoro", "not-saved"), entry("meditation", "not-saved")];
  const FOUR_DEVICE = { tasks: SET(false), dashboard: SET(false), pomodoro: SET(false), meditation: SET(false) };
  featuresLocation = await evaluate("verify.location()");
  await exportUnderDenial("x8-fresh-b-after-a-to-b", FOUR_DEVICE, { baseFaults: DENY_ALL_SETS, expectedRecovery: FOUR });

  // X9 export while one operation is held behind the real per-key lock (Calendar off, pending).
  const DENY_OTHERS = `__native.denySet(${JSON.stringify(FEATURE_KEYS.filter((key) => key !== keyOf("calendar")))})`;
  {
    await evaluate(`__native.restore(); ${DENY_OTHERS}`);
    const name = LOCK_OF("calendar");
    await evaluate(`__native.hold(${JSON.stringify(name)})`);
    const heldBefore = await evaluate("__native.lockQuery()");
    pre("export:x9:fixture-holds-real-calendar-lock", heldBefore.held.includes(name), { heldBefore });
    await toggleTo("calendar", "false", "saving");
    const locks = await evaluate("__native.lockQuery()");
    check("export:x9:engine-waits-on-real-lock", locks.held.includes(name) && locks.pending.includes(name), { locks });
  }
  const FIVE = [entry("tasks", "not-saved"), entry("dashboard", "not-saved"), entry("calendar", "saving"), entry("pomodoro", "not-saved"), entry("meditation", "not-saved")];
  await exportUnderDenial("x9-held-real-lock", { ...FOUR_DEVICE, calendar: SET(false) }, {
    baseFaults: DENY_OTHERS,
    expectedRecovery: FIVE,
    extra: async (id) => {
      const locks = await evaluate("__native.lockQuery()");
      const physical = await bytes();
      check(`${id}:export-never-releases-the-held-operation`, locks.held.includes(LOCK_OF("calendar")) && locks.pending.includes(LOCK_OF("calendar")) && physical.calendar === null, { locks, calendar: physical.calendar });
    },
  });
  {
    const since = await mark();
    await evaluate(`__native.release(${JSON.stringify(LOCK_OF("calendar"))})`);
    const persisted = await waitUntil(`__native.native.get("xai_pref_features_calendar") === "false" && ${recoveryIs(FOUR)}`, 6000);
    const now = await state(since);
    const sets = opsOn(now.attempts, "set", "calendar");
    check("export:x9:held-operation-persists-once-after-release", persisted && sets.length === 1 && sets[0].value === "false" && sets[0].outcome === "ok", { sets: short4(sets), recovery: now.view.recovery });
  }

  // X10 native setup failures under total denial: the anchor click throws, then a recovered export,
  // then createObjectURL throws.
  await exportUnderDenial("x10a-anchor-click-failure", null, { failure: "click", baseFaults: DENY_OTHERS, expectedRecovery: FOUR });
  await exportUnderDenial("x10b-recovered-after-click-failure", FOUR_DEVICE, { baseFaults: DENY_OTHERS, expectedRecovery: FOUR });
  await exportUnderDenial("x10c-create-object-url-failure", null, { failure: "create", baseFaults: DENY_OTHERS, expectedRecovery: FOUR });

  const tail = await state(0);
  check("export:run:zero-key-null-dispatch", tail.keyNullDispatched === 0 && tail.keyNullReceived === 0, { dispatched: tail.dispatched });
  record("export-summary", { artifacts: artifacts.map((item) => ({ shape: item.shape, artifact: item.artifact, sha256: item.sha256, bytes: item.bytes })) });
  await evaluate("__native.restore()");
}
