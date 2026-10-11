/**
 * CP-FEATURES-01 batch 24 (contract §14 E4): Features native cross-module BEFORE evidence in real headless
 * Chrome, production App composition. Parent-role native verifier. Verification only: it repairs nothing,
 * implements nothing, accepts nothing and changes no product file, contract, ledger or existing evidence.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-features-recovery-native/verify-native-before.mjs <revision> <h5|h6|h10> <suffix>
 *
 * Modes (contract §12 "Native before", §14 E4):
 *   h5  — Reset to defaults with one key's removeItem faulted (Calendar): pane and rail display (settled
 *         and per rendered frame), stored bytes, feedback/Retry presence, the AccountDataGate reaction
 *         (relock, gate screen, remount), then a reload.
 *   h6  — an accepted Reset to defaults: App accent hue, background tone and rail position (computed
 *         styles), AppRail DOM order, DesktopPet id and position and their bytes, before vs after and per
 *         rendered frame; then a trusted AppRail drag and whether it overwrites the stored custom order.
 *   h10 — 375 px, EN and ZH: does the Features pane overflow .settings-detail horizontally (scroll widths,
 *         the 280 px grid minimum); plus a 1440 px EN measurement control.
 *
 * - Product: an immutable `git archive <revision>`; ./native-app.tsx is bundled with esbuild from stdin
 *   with resolveDir = that archive. Every `@repo/*` specifier is pinned to the archive's own package
 *   export; a guard plugin fails the build if any module is loaded from the packages/, apps/ or docs/
 *   tree of the dependency checkout or of this runner's checkout. Third-party modules come from
 *   XAI_DEPS_ROOT only when its pnpm-lock.yaml SHA-256 equals the archive's (consistency gate). The
 *   bundle's inputs are checked for provenance: every listed reader module must come from the archive.
 * - Page: ./native-prelude.js (classic script, instruments) then the module bundle, served from
 *   127.0.0.1 only; DNS for every other host is mapped to NOTFOUND; isolated headless Chrome profile;
 *   CDP trusted mouse input after a centre hit-test; the real window.confirm is answered through
 *   Page.handleJavaScriptDialog; the AppRail drag uses Input.setInterceptDrags + Input.dispatchDragEvent.
 * - Verdicts: each hypothesis part is recorded as "confirmed (correct FAIL)" when the contract
 *   requirement fails at the revision, or "refuted (PASS)" when it holds (the requirement still binds the
 *   fixed product). Preconditions (control found, seeds present, fault armed and observed, instruments
 *   working) stop the run as a harness failure; product outcomes never stop it.
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log` plus PNG screenshots in this directory; existing
 *   evidence is never overwritten. Exit 0 = harness valid and every requirement holds; 2 = harness valid
 *   and at least one requirement fails (correct before FAILs); 1 = harness invalid.
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
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? output;
if (process.env.XAI_NATIVE_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
const MODES = ["h5", "h6", "h10"];
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
/** A hypothesis part: requirementHolds=false is a correct before FAIL (hypothesis confirmed); true is PASS (refuted). */
const verdict = (id, { hypothesis, claim, requirement, holds, evidence = {} }) => {
  checks += 1;
  lastCheckId = id;
  const entry = { id, hypothesis, claim, requirement, requirementHolds: Boolean(holds), verdict: holds ? "refuted (PASS; the requirement still binds the fixed product)" : "confirmed (correct FAIL)", ...evidence };
  verdicts.push({ id, hypothesis, requirementHolds: Boolean(holds) });
  record("verdict", entry);
  return Boolean(holds);
};
/** A recorded fact that a hypothesis asserts but that is not itself a requirement. */
const fact = (id, { hypothesis, claim, observed, evidence = {} }) => {
  checks += 1;
  lastCheckId = id;
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
if (sha256(dependencyLock) !== sha256(archiveLock)) throw Error("PRECONDITION: dependency checkout lockfile differs from the revision under test");
const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find((name) => name.startsWith("esbuild@0.28.1"));
if (!esbuildFolder) throw Error("PRECONDITION: pinned esbuild 0.28.1 missing");
const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
const docsHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const productDelta = execFileSync("git", ["diff", "--name-only", resolved, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim();
const versionOf = (name) => {
  try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
};

/** Reader and host modules that must be bundled from the archive (contract §2 readers, §3 item 6, CP AccountDataGate fact). */
const REQUIRED_MODULES = [
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/RouteGateElements.tsx",
  "apps/web/src/providers/AppProviders.tsx",
  "apps/web/src/providers/AccountStorageGate.tsx",
  "apps/web/src/routes/modules/shellRegistrations.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/settingsDeparture.ts",
  "apps/web/src/routes/modules/settingsPaneComposition.ts",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/storage.ts",
  "packages/plugin-web-storage/src/internal/sameTabBus.ts",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/registry.ts",
  "packages/xai-web-settings-features-panel/src/FeaturesPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresPane.tsx",
  "packages/xai-web-settings-features-panel/src/useFeaturePrefs.ts",
  "packages/xai-web-settings-features-panel/src/filterModulesByFeaturePrefs.ts",
  "packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx",
  "packages/xai-web-settings-features-panel/src/DisabledFeatureFallback.tsx",
  "packages/xai-web-settings-features-panel/src/styles.css",
  "packages/plugin-web-settings-shell/src/SettingsFooter.tsx",
  "packages/plugin-web-settings-shell/src/internal/confirmAction.ts",
  "packages/plugin-web-settings-shell/src/Toggle.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/xai-web-event-bus/src/emitter.ts",
  "packages/plugin-web-tokens/src/apply.ts",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/guards.tsx",
];
/** Hashes the contract preamble and the control plane state for this archive. */
const CONTRACT_HASHES = {
  "packages/xai-web-settings-features-panel/src/FeaturesPane.tsx": "987c38250554f05eee185073f92fdfafc504b5e3f9c183658fc5aeb583ce50ea",
};
const CONTRACT_PREFIXES = {
  "packages/xai-web-settings-features-panel/src/internal/featuresPane.tsx": "14053daa",
  "apps/web/src/routes/modules/departureCoordinator.tsx": "0844a697",
};

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-features-native-")));
const snapshot = join(directory, "source");
const profile = join(directory, "profile");
let server = null;
let session = null;
let origin = "";
const served = {};

// ---------------------------------------------------------------------------------------------------
// Browser session (pattern of ../web-sticky-recovery-native/verify-native.mjs, which is not modified)
// ---------------------------------------------------------------------------------------------------
async function launch() {
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
  const listeners = [];
  let commandId = 0;
  const state = { proc, exited, port, socket, pending, listeners };
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
      dialogs.push({ type: message.params.type, message: message.params.message, expected: Boolean(plan), accepted: plan ? plan.accept : false, afterCheck: lastCheckId });
      state.cdp("Page.handleJavaScriptDialog", { accept: plan ? plan.accept : false }).catch(() => {});
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
async function closeSession() {
  const current = session;
  session = null;
  if (!current) return;
  try { current.socket.send(JSON.stringify({ id: 999999, method: "Browser.close" })); } catch { /* socket gone */ }
  const graceful = await Promise.race([current.exited.then(() => true), delay(8000).then(() => false)]);
  if (!graceful) {
    current.proc.kill("SIGTERM");
    await Promise.race([current.exited, delay(3000)]);
    if (current.proc.exitCode === null && current.proc.signalCode === null) current.proc.kill("SIGKILL");
  }
  try { current.socket.close(); } catch { /* already closed */ }
}

// ---------------------------------------------------------------------------------------------------
// Surface helpers
// ---------------------------------------------------------------------------------------------------
const OWNER = "features-native-A";
const MARKER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:committed-generation`;
const MARKER = JSON.stringify({ generation: "g1", migrationId: "features-native", previous: null });
const IDS = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "habits", "meditation"];
const keyOf = (id) => `xai_pref_features_${id}`;
const FEATURE_KEYS = IDS.map(keyOf);
const APPEARANCE_KEYS = ["xai_accent_hue", "xai_bg_tone", "xai_rail_pos", "xai_rail_order", "xai_pet_id", "xai_pet_pos"];
const PANE = '.settings-detail[data-pane="features"]';
const READY = `(() => !!window.verify && !!window.__native && !!document.querySelector('${PANE} .features-pane') && !document.querySelector('.account-data-gate') && verify.scope().kind === 'account')()`;
const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });

async function setViewport(width, height, mobile) {
  await cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await delay(150);
}
async function screenshot(name, details = {}) {
  const shot = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const buffer = Buffer.from(shot.data, "base64");
  const file = `native-${short}-${suffix}-${mode}-${name}.png`;
  writeFileSync(join(evidenceDir, file), buffer, { flag: "wx" });
  const entry = { file, sha256: sha256(buffer), bytes: buffer.length, png: pngSize(buffer), ...details };
  artifacts.push(entry);
  record("screenshot", entry);
  return entry;
}
let selfTested = false;
async function seed(entries, label) {
  await cdp("Page.navigate", { url: `${origin}/seed` });
  pre(`${label}:seed-page-loaded-with-prelude-only`, await waitUntil("document.readyState === 'complete' && location.pathname === '/seed' && !!window.__native && !window.verify", 10000));
  if (!selfTested) {
    const result = await evaluate("__native.selfTest()");
    record("instrument-selftest", { page: "/seed (prelude only, no product code)", result });
    pre("instruments:storage-faults-attempt-logging-dispatch-counter-network-dom-frames", result.setDeniedThrew && result.setDeniedNeverStored && result.setDelegated
      && result.removeDeniedThrew && result.removeDeniedKeptBytes && result.removeDelegated
      && isDeepStrictEqual(result.attemptsLogged, ["set:denied", "set:ok", "remove:denied", "remove:ok"])
      && isDeepStrictEqual(result.dispatchCounted, ["null:true", "xai_native_selftest:true"])
      && isDeepStrictEqual(result.deliveredCounted, ["null:false", "xai_native_selftest:false"])
      && result.nonLocalFetchRefusedAndLogged && result.domGateAddedAndRemoved && result.htmlAttributeLogged && result.framesSampled > 0, { result });
    selfTested = true;
  }
  const stored = await evaluate(`(() => { __native.native.clear(); const seeds = ${JSON.stringify(entries)}; for (const [key, value] of Object.entries(seeds)) __native.native.set(key, value); return __native.native.snapshot(); })()`);
  pre(`${label}:seeded-exact-bytes`, isDeepStrictEqual(stored, entries), { stored });
}
async function mount(label, path = "/app/settings/features") {
  const errorsBefore = runtimeErrors.length;
  await cdp("Page.navigate", { url: `${origin}${path}` });
  const ready = await waitUntil(READY, 20000);
  if (!ready) {
    const diagnostics = await evaluate("({ path: location.pathname, text: (document.body.innerText || '').slice(0, 400), verify: !!window.verify, scope: window.verify ? verify.scope() : null, auth: window.verify ? verify.authCalls() : null })").catch((error) => ({ error: String(error) }));
    pre(`${label}:production-app-mounted-features-pane`, false, { diagnostics, runtimeErrors: runtimeErrors.slice(errorsBefore, errorsBefore + 5) });
  }
  await delay(900);
  const state = await evaluate(`({ location: verify.location(), scope: verify.scope(), auth: verify.authCalls(), markerKey: verify.markerKey,
    railButtons: document.querySelectorAll('.app-rail .rail-items .rail-btn').length, pet: !!document.querySelector('.pet-wrap'),
    switches: document.querySelectorAll('${PANE} .features-pane [data-feature-id] [role="switch"]').length,
    sidebar: !!document.querySelector('.settings-sidebar'), topbar: !!document.querySelector('.topbar'),
    network: __native.network.filter((entry) => !entry.local).length })`);
  const exceptions = runtimeErrors.slice(errorsBefore).filter((entry) => entry.kind === "exception");
  pre(`${label}:production-app-mounted-features-pane`, true, { state });
  pre(`${label}:auth-session-context-served-by-real-provider`, state.auth.getSession >= 1 && state.markerKey === MARKER_KEY, { auth: state.auth, markerKey: state.markerKey });
  pre(`${label}:account-data-gate-activated-account`, state.scope.kind === "account" && state.scope.accountId === OWNER && state.scope.generation === "g1", { scope: state.scope });
  pre(`${label}:production-surfaces-present`, state.railButtons > 0 && state.pet && state.switches === 8 && state.sidebar, { state });
  pre(`${label}:no-non-local-network-attempt`, state.network === 0);
  pre(`${label}:no-uncaught-exception-at-mount`, exceptions.length === 0, { exceptions: exceptions.slice(0, 3) });
  return state;
}
async function bytesOf(keys) {
  return evaluate(`Object.fromEntries(${JSON.stringify(keys)}.map((key) => [key, __native.native.get(key)]))`);
}
async function devtoolsBytes(keys) {
  const { entries } = await cdp("DOMStorage.getDOMStorageItems", { storageId: { storageKey: `${origin}/`, isLocalStorage: true } });
  const map = Object.fromEntries(entries);
  return Object.fromEntries(keys.map((key) => [key, Object.hasOwn(map, key) ? map[key] : null]));
}
const paneView = () => evaluate(`(() => {
  const detail = document.querySelector('${PANE}');
  const text = detail ? detail.textContent.replace(/\\s+/g, " ") : "";
  return {
    switches: Object.fromEntries([...document.querySelectorAll('${PANE} [data-feature-id] [role="switch"]')].map((element) => [element.closest("[data-feature-id]").getAttribute("data-feature-id"), element.getAttribute("aria-checked")])),
    buttons: detail ? [...detail.querySelectorAll("button")].map((button) => (button.getAttribute("aria-label") || button.textContent || "").replace(/\\s+/g, " ").trim()) : [],
    alerts: detail ? [...detail.querySelectorAll('[role="alert"],[role="status"]')].map((element) => element.textContent.replace(/\\s+/g, " ").trim()) : [],
    notResetText: /was not reset|未恢复默认/.test(text),
    rail: [...document.querySelectorAll('.app-rail .rail-items .rail-btn')].map((button) => button.getAttribute("aria-label")),
  };
})()`);
async function tagButton(name, scope, label) {
  const found = await evaluate(`(() => {
    document.querySelectorAll("[data-native-target]").forEach((element) => element.removeAttribute("data-native-target"));
    const scope = document.querySelector(${JSON.stringify(scope)});
    const matches = scope ? [...scope.querySelectorAll("button")].filter((button) => (button.getAttribute("aria-label") ?? button.textContent).trim() === ${JSON.stringify(name)}) : [];
    if (matches.length === 1) matches[0].setAttribute("data-native-target", "1");
    return matches.length;
  })()`);
  pre(`${label}:exactly-one-button-by-role-and-name:${name}`, found === 1, { found, scope });
  return '[data-native-target="1"]';
}
async function hitPoint(selector, label) {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { found: false };
    element.scrollIntoView({ block: "center", inline: "nearest" });
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { found: true, x, y, width: rect.width, height: rect.height, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + hit.className : null };
  })()`);
  pre(`${label}:control-present`, point.found, { selector });
  pre(`${label}:centre-hit-test`, point.hit, { selector, hitTarget: point.hitTarget });
  return point;
}

/**
 * Trusted activation of the shared footer's "Reset to defaults" with the real window.confirm accepted, with
 * the frame sampler, DOM observers and element/focus/scroll probes armed around it.
 */
async function acceptedReset(label, settleExpression) {
  const selector = await tagButton("Reset to defaults", PANE, label);
  const point = await hitPoint(selector, `${label}:reset`);
  await delay(150);
  await screenshot("at-reset-control", { state: "Reset to defaults scrolled into view (centre hit-test passed), immediately before the trusted click" });
  const marked = await evaluate("__native.markElements()");
  const scrollBefore = await evaluate(`__native.scrollAncestors(${JSON.stringify(selector)})`);
  const viewBefore = await paneView();
  const mark = await evaluate("__native.mark()");
  const scopeMark = mark;
  await evaluate("__native.startDom() && __native.startFrames()");
  await delay(120);
  const dialogsBefore = dialogs.length;
  const errorsBefore = runtimeErrors.length;
  dialogPlan.push({ accept: true });
  await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  const focusBefore = await evaluate("__native.focus()");
  await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
  const dialogSeen = await waitFor(() => dialogs.length > dialogsBefore, 6000);
  const settled = await waitUntil(settleExpression, 8000);
  await delay(450);
  const frames = await evaluate("__native.stopFrames()");
  const dom = await evaluate("__native.stopDom()");
  const after = await evaluate(`({ fates: __native.elementFates(), focus: __native.focus(), scroll: __native.scrollOf(${JSON.stringify(scrollBefore.map((entry) => entry.selector))}),
    window: __native.window(${mark}), scope: verify.scopeAfter(${scopeMark}), location: verify.location() })`);
  const clickSeq = after.window.clicks.find((entry) => entry.target === "Reset to defaults")?.seq ?? null;
  return { point, marked, scrollBefore, viewBefore, focusBefore, dialogSeen, settled, dialogs: dialogs.slice(dialogsBefore), frames, dom, after, clickSeq, errors: runtimeErrors.slice(errorsBefore) };
}
function framesAfterClick(frames, clickSeq) {
  return clickSeq === null ? frames : frames.filter((frame) => frame.seq > clickSeq);
}
function gateFacts(run) {
  const scope = run.after.scope;
  const gateAdded = run.dom.dom.filter((entry) => entry.kind === "added" && entry.what.includes("gate"));
  const gateRemoved = run.dom.dom.filter((entry) => entry.kind === "removed" && entry.what.includes("gate"));
  const frames = framesAfterClick(run.frames, run.clickSeq);
  return {
    keyNullStorageEventsDispatched: run.after.window.storageDispatches.filter((entry) => entry.key === null).length,
    keyedStorageEventsDispatched: run.after.window.storageDispatches.filter((entry) => entry.key !== null).length,
    storageEventsDelivered: run.after.window.storageReceived.map((entry) => `${entry.key}:${entry.trusted ? "trusted" : "synthetic"}`),
    accountScopeTransitions: scope.map((entry) => `${entry.kind}:${entry.accountId}:${entry.generation}:epoch${entry.epoch}`),
    relocked: scope.some((entry) => entry.kind === "locked"),
    reactivated: scope.length > 0 && scope.at(-1).kind === "account",
    gateScreenInserted: gateAdded.length > 0,
    gateScreenRemoved: gateRemoved.length > 0,
    gateText: gateAdded[0]?.gateText ?? null,
    renderedFramesAfterClick: frames.length,
    renderedFramesShowingGate: frames.filter((frame) => frame.gate).length,
    renderedFramesWithoutPane: frames.filter((frame) => !frame.pane).length,
    replaced: Object.fromEntries(Object.entries(run.after.fates).map(([name, fate]) => [name, fate.marked ? !fate.connected : null])),
    domInsertRemove: run.dom.dom.map((entry) => `${entry.seq}:${entry.kind}:${entry.what.join("+")}`),
    htmlAttributeChanges: run.dom.html.map((entry) => `${entry.attribute}:${entry.old}->${entry.now}`),
    focusBefore: run.focusBefore,
    focusAfter: run.after.focus,
    scrollBefore: run.scrollBefore.map((entry) => `${entry.selector}=${entry.scrollTop}`),
    scrollAfter: run.after.scroll.map((entry) => `${entry.selector}=${entry.found ? entry.scrollTop : "absent"}`),
  };
}

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
  const pinAndGuard = { name: "features-native-archive-pin-guard", setup(buildApi) {
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
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== "native-app.tsx");
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const missingRequired = REQUIRED_MODULES.filter((file) => !inputs.includes(file));
  const requiredHashes = Object.fromEntries(REQUIRED_MODULES.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const contractHashOk = Object.entries(CONTRACT_HASHES).every(([file, hash]) => requiredHashes[file] === hash)
    && Object.entries(CONTRACT_PREFIXES).every(([file, prefix]) => (requiredHashes[file] ?? sha256(readFileSync(join(snapshot, file)))).startsWith(prefix));

  const appPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>XAI Web (Features native before)</title><link rel="stylesheet" href="/__native/bundle.css"><script src="/__native/prelude.js"></script></head><body><div id="root"></div><script type="module" src="/__native/bundle.js"></script></body></html>';
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

  session = await launch();
  await cdp("Runtime.enable");
  await cdp("Page.enable");
  await cdp("DOMStorage.enable");
  await cdp("Page.bringToFront");
  await cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  const version = await cdp("Browser.getVersion");
  record("baseline", {
    requested, resolved, resolvedTree, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix,
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock), extracted: sha256(extractedLock) },
    fileSha256: { "verify-native-before.mjs": runnerSha256, "native-app.tsx": sha256(fixtureSource), "native-prelude.js": sha256(preludeSource) },
    bundleSha256: sha256(js), bundleCssSha256: sha256(css),
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
    requiredModules: { count: REQUIRED_MODULES.length, missing: missingRequired, sha256: requiredHashes },
    contractHashChecks: { ...CONTRACT_HASHES, prefixes: CONTRACT_PREFIXES, ok: contractHashOk },
    origin: "127.0.0.1 (ephemeral port); every other host resolves to NOTFOUND",
  });
  pre("baseline:docs-head-product-tree-equals-revision", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === sha256(archiveLock) && sha256(extractedLock) === sha256(archiveLock));
  pre("baseline:guard-no-module-from-a-checkout", guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre("baseline:every-required-reader-module-bundled-from-archive", missingRequired.length === 0 && REQUIRED_MODULES.every((file) => archiveModules.has(file) || file.endsWith(".css")), { missingRequired });
  pre("baseline:archive-hashes-equal-contract", contractHashOk);

  if (mode === "h5" || mode === "h6") await setViewport(1280, 900, false);

  if (mode === "h5") {
    // -----------------------------------------------------------------------------------------------
    // H5: Reset to defaults with Calendar's removeItem faulted (Boards also stored off, unfaulted).
    // -----------------------------------------------------------------------------------------------
    const seeds = { [MARKER_KEY]: MARKER, [keyOf("board")]: "false", [keyOf("calendar")]: "false" };
    await seed(seeds, "h5");
    const mounted = await mount("h5:mount");
    const before = await paneView();
    const bytesBefore = await bytesOf(FEATURE_KEYS);
    const mountWindow = await evaluate("__native.window(0)");
    const mountMutations = mountWindow.attempts.filter((entry) => FEATURE_KEYS.includes(entry.key));
    const nav = await evaluate("verify.nav.en");
    pre("h5:seeded-display-boards-and-calendar-off", before.switches.board === "false" && before.switches.calendar === "false" && IDS.filter((id) => !["board", "calendar"].includes(id)).every((id) => before.switches[id] === "true"), { switches: before.switches });
    pre("h5:rail-hides-boards-and-calendar", !before.rail.includes(nav.board) && !before.rail.includes(nav.calendar) && before.rail.includes(nav.tasks), { rail: before.rail });
    pre("h5:seeded-bytes", bytesBefore[keyOf("board")] === "false" && bytesBefore[keyOf("calendar")] === "false");
    record("observation", { id: "h5:mount", railButtons: mounted.railButtons, mountFeatureWritesOrRemoves: mountMutations, before, bytesBefore });
    await screenshot("before-reset", { state: "seeded: Boards and Calendar off; Calendar removeItem not yet faulted" });

    await evaluate(`__native.denyRemove(${JSON.stringify(keyOf("calendar"))})`);
    const run = await acceptedReset("h5", `__native.native.get(${JSON.stringify(keyOf("board"))}) === null && !!document.querySelector('${PANE} .features-pane') && !document.querySelector('.account-data-gate')`);
    const removes = run.after.window.attempts.filter((entry) => entry.op === "remove" && FEATURE_KEYS.includes(entry.key));
    const featureSets = run.after.window.attempts.filter((entry) => entry.op === "set" && FEATURE_KEYS.includes(entry.key));
    const bytesAfter = await bytesOf(FEATURE_KEYS);
    const dtBytesAfter = await devtoolsBytes(FEATURE_KEYS);
    const after = await paneView();
    pre("h5:confirm-asked-once-and-accepted", run.dialogSeen && run.dialogs.length === 1 && run.dialogs[0].type === "confirm" && run.dialogs[0].accepted, { dialogs: run.dialogs });
    pre("h5:fault-armed-and-observed:calendar-remove-denied", removes.some((entry) => entry.key === keyOf("calendar") && entry.outcome === "denied"), { removes });
    pre("h5:calendar-bytes-kept-by-the-fault", bytesAfter[keyOf("calendar")] === "false" && dtBytesAfter[keyOf("calendar")] === "false", { bytesAfter, dtBytesAfter });
    pre("h5:reset-ran:boards-removed", bytesAfter[keyOf("board")] === null && removes.some((entry) => entry.key === keyOf("board") && entry.outcome === "ok"), { removes });
    pre("h5:settled-production-app-present", run.settled, { location: run.after.location });
    await evaluate("__native.restore()");
    const facts = gateFacts(run);
    const frames = framesAfterClick(run.frames, run.clickSeq);
    const calendarOnFrames = frames.filter((frame) => frame.switches.includes("calendar=true") && !frame.notResetFeedback);
    const calendarInRailFrames = frames.filter((frame) => frame.rail.split("|").includes(nav.calendar));
    record("observation", {
      id: "h5:after-reset", confirm: run.dialogs, removes: removes.map((entry) => `${entry.key}:${entry.outcome}`), featureSets,
      bytesAfter, devtoolsBytesAfter: dtBytesAfter, display: after, accountDataGate: facts,
      frameSamples: frames.slice(0, 6).map((frame) => ({ seq: frame.seq, gate: frame.gate, pane: frame.pane, switches: frame.switches, rail: frame.rail })),
      runtimeErrorsDuringReset: run.errors,
    });
    await screenshot("after-reset", { state: "after the accepted reset (Calendar removeItem denied); settled" });

    verdict("H5-a:event-dispatched-despite-fault", {
      hypothesis: "H5", claim: "With a removeItem fault on one key, Reset to defaults still dispatches its event",
      requirement: "D2 / §10 item 5: the product dispatches zero StorageEvents with key === null",
      holds: facts.keyNullStorageEventsDispatched === 0,
      evidence: { keyNullStorageEventsDispatched: facts.keyNullStorageEventsDispatched, delivered: facts.storageEventsDelivered },
    });
    verdict("H5-b:pane-shows-on-while-bytes-false", {
      hypothesis: "H5", claim: "The pane shows Calendar on while its bytes stay false",
      requirement: "§6/§10: no false committed 'on' for a refused removal (the fixed pane shows the reset draft only together with its failure feedback)",
      holds: !(after.switches.calendar === "true" && !after.notResetText) && calendarOnFrames.length === 0,
      evidence: { settledCalendarSwitch: after.switches.calendar, calendarBytes: bytesAfter[keyOf("calendar")], framesAfterClick: frames.length, framesShowingCalendarOnWithoutFeedback: calendarOnFrames.length, masking: "AccountDataGate relock + remount re-read the stored bytes" },
    });
    verdict("H5-c:rail-shows-on-while-bytes-false", {
      hypothesis: "H5", claim: "The rail shows Calendar while its bytes stay false",
      requirement: "§10 item 2: the rail reflects committed bytes only; a partial reset restores only the keys whose reset succeeded",
      holds: !after.rail.includes(nav.calendar) && after.rail.includes(nav.board) && calendarInRailFrames.length === 0,
      evidence: { railAfter: after.rail, framesShowingCalendarInRail: calendarInRailFrames.length },
    });
    verdict("H5-d:no-failure-feedback-or-retry", {
      hypothesis: "H5", claim: "No failure feedback or Retry is shown for the refused removal",
      requirement: "§5/§6: a reset draft with 'Calendar was not reset to its default.' and 'Retry Calendar'",
      holds: after.notResetText && after.buttons.includes("Retry Calendar"),
      evidence: { buttons: after.buttons, alerts: after.alerts, notResetText: after.notResetText },
    });
    record("observation", { id: "h5:account-data-gate", summary: "key:null StorageEvent -> AccountDataGate relock -> gate screen -> re-activation -> keyed remount", ...facts });

    // Reload: a new document over the same bytes.
    const reloadErrors = runtimeErrors.length;
    await cdp("Page.reload", { ignoreCache: true });
    await delay(200);
    pre("h5:reload-mounted", await waitUntil(READY, 20000));
    await delay(900);
    const reloaded = await paneView();
    const reloadBytes = await bytesOf(FEATURE_KEYS);
    const reloadMutations = (await evaluate("__native.window(0)")).attempts.filter((entry) => FEATURE_KEYS.includes(entry.key));
    record("observation", { id: "h5:after-reload", display: reloaded, bytes: reloadBytes, mountFeatureWritesOrRemoves: reloadMutations, exceptions: runtimeErrors.slice(reloadErrors).filter((entry) => entry.kind === "exception") });
    await screenshot("after-reload", { state: "new document after the reload" });
    fact("H5-e:off-again-after-reload", {
      hypothesis: "H5", claim: "After a reload the module is off again",
      observed: reloaded.switches.calendar === "false" && !reloaded.rail.includes(nav.calendar) && reloadBytes[keyOf("calendar")] === "false",
      evidence: { calendarSwitch: reloaded.switches.calendar, railHasCalendar: reloaded.rail.includes(nav.calendar), calendarBytes: reloadBytes[keyOf("calendar")], boardsSwitch: reloaded.switches.board, zeroMountFeatureMutations: reloadMutations.length === 0 },
    });
  }

  if (mode === "h6") {
    // -----------------------------------------------------------------------------------------------
    // H6: accepted reset with custom appearance, rail and pet; then a trusted AppRail drag.
    // -----------------------------------------------------------------------------------------------
    const seedsBase = { [MARKER_KEY]: MARKER, xai_accent_hue: "210", xai_bg_tone: "lavender", xai_rail_pos: "right", xai_pet_id: "pip", xai_pet_pos: JSON.stringify({ x: 300, y: 200 }) };
    // The custom order needs the production rail ids; read them from a first mount, then seed and remount.
    await seed({ [MARKER_KEY]: MARKER }, "h6:ids");
    await mount("h6:ids-mount");
    const railIds = await evaluate("verify.railIds");
    const railDefault = await evaluate("verify.railDefault");
    const nav = await evaluate("verify.nav.en");
    const CUSTOM = [...railIds].reverse();
    const seeds = { ...seedsBase, xai_rail_order: JSON.stringify(CUSTOM), ...Object.fromEntries(FEATURE_KEYS.map((key) => [key, "true"])) };
    await seed(seeds, "h6");
    await mount("h6:mount");
    const before = await evaluate("__native.snapshot()");
    const bytesBefore = await bytesOf(APPEARANCE_KEYS);
    const unrelatedBefore = await evaluate("__native.native.snapshot()");
    const expectedRail = CUSTOM.map((id) => nav[id] ?? id);
    pre("h6:displays-seeded-appearance-rail-and-pet", before.computed.accentHue === "210" && before.probe.tone === "lavender" && before.computed.htmlRailPos === "right"
      && before.computed.appRailPos === "right" && before.computed.railDataPos === "right" && isDeepStrictEqual(before.railOrder, expectedRail)
      && before.computed.petAnim === "pet-anim-hop" && before.computed.petTransform === "translate(300px, 200px)" && before.switches.every((entry) => entry.endsWith("=true")),
    { before, expectedRail });
    pre("h6:seeded-bytes", isDeepStrictEqual(bytesBefore, Object.fromEntries(APPEARANCE_KEYS.map((key) => [key, seeds[key]]))), { bytesBefore });
    record("observation", { id: "h6:before", snapshot: before, bytes: bytesBefore, railIds, railDefault });
    await screenshot("before-reset", { state: "seeded: accent hue 210, lavender tone, rail right, custom reversed rail order, pet pip at (300,200), all 8 features stored true" });

    const settleAll = `${JSON.stringify(FEATURE_KEYS)}.every((key) => __native.native.get(key) === null) && !!document.querySelector('${PANE} .features-pane') && !document.querySelector('.account-data-gate')`;
    const run = await acceptedReset("h6", settleAll);
    const removes = run.after.window.attempts.filter((entry) => entry.op === "remove" && FEATURE_KEYS.includes(entry.key));
    pre("h6:confirm-asked-once-and-accepted", run.dialogSeen && run.dialogs.length === 1 && run.dialogs[0].type === "confirm" && run.dialogs[0].accepted, { dialogs: run.dialogs });
    pre("h6:reset-ran:eight-removals", run.settled && removes.length === 8 && removes.every((entry) => entry.outcome === "ok"), { removes });
    const afterSnap = await evaluate("__native.snapshot()");
    const bytesAfter = await bytesOf(APPEARANCE_KEYS);
    const dtBytesAfter = await devtoolsBytes(APPEARANCE_KEYS);
    const unrelatedAfter = await evaluate("__native.native.snapshot()");
    const facts = gateFacts(run);
    const frames = framesAfterClick(run.frames, run.clickSeq);
    const reference = before.probe;
    const visibleFields = ["hue", "tone", "railPos", "railDataPos", "rail", "petAnim", "petTransform"];
    const changedFrames = frames.filter((frame) => frame.gate || visibleFields.some((field) => frame[field] !== reference[field]));
    const changedKeys = [...new Set([...Object.keys(unrelatedBefore), ...Object.keys(unrelatedAfter)])].filter((key) => unrelatedBefore[key] !== unrelatedAfter[key]);
    record("observation", { id: "h6:after-reset", snapshot: afterSnap, bytes: bytesAfter, devtoolsBytes: dtBytesAfter, removes: removes.map((entry) => `${entry.key}:${entry.outcome}`), keysWhoseBytesChanged: changedKeys,
      accountDataGate: facts, frameSamples: frames.slice(0, 6), runtimeErrorsDuringReset: run.errors });
    await screenshot("after-reset", { state: "after the accepted reset; settled" });

    const visibleAfterEqual = isDeepStrictEqual(afterSnap.computed, before.computed) && isDeepStrictEqual(afterSnap.railOrder, before.railOrder);
    verdict("H6-a:visible-values-after-reset", {
      hypothesis: "H6", claim: "After Reset to defaults, App accent hue, background tone, rail position, AppRail order and DesktopPet id and position show their defaults",
      requirement: "§10 item 5 (after): these displayed values (computed styles, DOM order, pet id and position) are unchanged",
      holds: visibleAfterEqual,
      evidence: { before: before.computed, after: afterSnap.computed, railOrderBefore: before.railOrder, railOrderAfter: afterSnap.railOrder },
    });
    verdict("H6-b:bytes-unchanged", {
      hypothesis: "H6", claim: "(H6 states the bytes stay unchanged) — the six appearance/rail/pet keys keep their bytes",
      requirement: "§10 item 5: the bytes of these preferences are unchanged",
      holds: isDeepStrictEqual(bytesAfter, bytesBefore) && isDeepStrictEqual(dtBytesAfter, bytesBefore),
      evidence: { bytesBefore, bytesAfter, devtoolsBytesAfter: dtBytesAfter },
    });
    verdict("H6-c:no-rendered-frame-changes", {
      hypothesis: "H6", claim: "During the reset a rendered frame shows changed (default) values or the account-gate screen instead of the App",
      requirement: "§10 item 5 (during): every rendered frame keeps the displayed values",
      holds: changedFrames.length === 0,
      evidence: { renderedFramesAfterClick: frames.length, changedFrames: changedFrames.slice(0, 5).map((frame) => ({ seq: frame.seq, gate: frame.gate, hue: frame.hue, tone: frame.tone, railPos: frame.railPos, petAnim: frame.petAnim })) },
    });
    verdict("§10.5-during:no-relock-gate-or-remount", {
      hypothesis: "related (control-plane AccountDataGate fact; Sol downstream §10.5 'during')",
      claim: "The reset's key:null StorageEvent makes AccountDataGate relock the account, insert the gate screen and remount the App",
      requirement: "§10 item 5 / §7: a Features operation never interrupts the App (no account relock, gate screen or remount of rail, pet or pane)",
      holds: !facts.relocked && !facts.gateScreenInserted && !facts.replaced.rail && !facts.replaced.pet && !facts.replaced.pane,
      evidence: facts,
    });
    record("observation", { id: "h6:account-data-gate", summary: "key:null StorageEvent -> AccountDataGate relock -> gate screen -> re-activation -> keyed remount", ...facts,
      onlyFeatureKeysChangedBytes: changedKeys.every((key) => FEATURE_KEYS.includes(key)) });

    // Trusted AppRail drag after the reset: button 0 onto button 2.
    const storedBeforeDrag = (await bytesOf(["xai_rail_order"])).xai_rail_order;
    const displayed = (await paneView()).rail;
    const labelToId = Object.fromEntries(railIds.map((id) => [nav[id] ?? id, id]));
    const displayedIds = displayed.map((label) => labelToId[label]);
    pre("h6:drag:stored-custom-order-intact-before-drag", storedBeforeDrag === JSON.stringify(CUSTOM), { storedBeforeDrag });
    pre("h6:drag:rail-buttons-present", displayedIds.length === railIds.length && displayedIds.every(Boolean), { displayed });
    const reorder = (items, fromId, toId) => {
      const next = [...items];
      const fromIndex = next.indexOf(fromId);
      const toIndex = next.indexOf(toId);
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, fromId);
      return next;
    };
    const validFrom = (stored) => [...stored.filter((id) => railIds.includes(id)), ...railIds.filter((id) => !stored.includes(id))];
    const storedValid = validFrom(CUSTOM);
    const defaultValid = validFrom(railDefault);
    const fromStored = reorder(storedValid, storedValid[0], storedValid[2]);
    const fromDefault = reorder(defaultValid, defaultValid[0], defaultValid[2]);
    const points = await evaluate(`(() => {
      const buttons = [...document.querySelectorAll('.app-rail .rail-items .rail-btn')];
      const centre = (element) => { const rect = element.getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, label: element.getAttribute("aria-label"), hit: element.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)) }; };
      return { source: centre(buttons[0]), target: centre(buttons[2]) };
    })()`);
    pre("h6:drag:source-and-target-hit-tested", points.source.hit && points.target.hit, { points });
    const dragMark = await evaluate("__native.mark()");
    const intercepted = [];
    const listener = (message) => { if (message.method === "Input.dragIntercepted") intercepted.push(message.params.data); };
    session.listeners.push(listener);
    await cdp("Input.setInterceptDrags", { enabled: true });
    await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: points.source.x, y: points.source.y });
    await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: points.source.x, y: points.source.y, button: "left", buttons: 1, clickCount: 1 });
    await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: points.target.x, y: points.target.y, button: "left", buttons: 1 });
    const gotDrag = await waitFor(() => intercepted.length > 0, 4000);
    pre("h6:drag:browser-drag-started-and-intercepted", gotDrag, { intercepted: intercepted.length });
    const data = intercepted[0];
    await cdp("Input.dispatchDragEvent", { type: "dragEnter", x: points.target.x, y: points.target.y, data });
    await cdp("Input.dispatchDragEvent", { type: "dragOver", x: points.target.x, y: points.target.y, data });
    await delay(150);
    await cdp("Input.dispatchDragEvent", { type: "drop", x: points.target.x, y: points.target.y, data });
    await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: points.target.x, y: points.target.y, button: "left", buttons: 0, clickCount: 1 });
    await cdp("Input.setInterceptDrags", { enabled: false });
    session.listeners.splice(session.listeners.indexOf(listener), 1);
    const persistedChanged = await waitUntil(`__native.native.get("xai_rail_order") !== ${JSON.stringify(JSON.stringify(CUSTOM))}`, 4000);
    await delay(300);
    const dragWindow = await evaluate(`__native.window(${dragMark})`);
    const persisted = (await bytesOf(["xai_rail_order"])).xai_rail_order;
    const railWrites = dragWindow.attempts.filter((entry) => entry.key === "xai_rail_order" && entry.op === "set");
    pre("h6:drag:trusted-dragstart-and-dragover-observed", dragWindow.drags.some((entry) => entry.type === "dragstart" && entry.trusted && entry.target === points.source.label)
      && dragWindow.drags.some((entry) => entry.type === "dragover" && entry.trusted && entry.target === points.target.label), { drags: dragWindow.drags });
    pre("h6:drag:the-drag-persisted-a-changed-rail-order", persistedChanged && persisted !== null && railWrites.length >= 1, { persisted, railWrites: railWrites.length });
    const persistedIds = JSON.parse(persisted);
    record("observation", { id: "h6:drag", displayedBeforeDrag: displayed, source: points.source.label, target: points.target.label, drags: dragWindow.drags.map((entry) => `${entry.type}:${entry.target}:${entry.trusted}`), railWrites: railWrites.map((entry) => entry.value), persisted: persistedIds, fromStored, fromDefault, railAfterDrag: (await paneView()).rail });
    await screenshot("after-drag", { state: "after the trusted AppRail drag (button 1 onto button 3)" });
    verdict("H6-d:drag-after-reset-preserves-stored-order", {
      hypothesis: "H6", claim: "A subsequent AppRail drag persists a default-derived order, overwriting the stored custom order",
      requirement: "§10 item 5: an AppRail drag-reorder after a Features reset persists an order derived from the stored custom order",
      holds: isDeepStrictEqual(persistedIds, fromStored),
      evidence: { persisted: persistedIds, derivedFromStoredCustomOrder: fromStored, derivedFromDefaultOrder: fromDefault, matchesDefaultDerived: isDeepStrictEqual(persistedIds, fromDefault) },
    });
  }

  if (mode === "h10") {
    // -----------------------------------------------------------------------------------------------
    // H10: 375 px, EN and ZH; 1440 px EN as a measurement control.
    // -----------------------------------------------------------------------------------------------
    const measure = () => evaluate(`(() => {
      const round = (value) => Math.round(value * 100) / 100;
      const box = (element) => { if (!element) return null; const rect = element.getBoundingClientRect(); return { left: round(rect.left), right: round(rect.right), width: round(rect.width), top: round(rect.top) }; };
      const detail = document.querySelector('${PANE}');
      const pane = detail.querySelector('.features-pane');
      const grid = pane.querySelector('.features-grid');
      const detailStyle = getComputedStyle(detail);
      const gridStyle = getComputedStyle(grid);
      const detailBox = box(detail);
      const contentLeft = detailBox.left + parseFloat(detailStyle.borderLeftWidth) + parseFloat(detailStyle.paddingLeft);
      const contentRight = detailBox.right - parseFloat(detailStyle.borderRightWidth) - parseFloat(detailStyle.paddingRight);
      const cards = [...grid.querySelectorAll('.feat-card')].map((card) => ({ id: card.getAttribute('data-feature-id'), ...box(card) }));
      const switches = [...grid.querySelectorAll('[data-feature-id] [role="switch"]')].map((element) => ({ id: element.closest('[data-feature-id]').getAttribute('data-feature-id'), ...box(element) }));
      const chain = [];
      for (let node = grid; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        chain.push({ node: node.tagName.toLowerCase() + (typeof node.className === 'string' && node.className ? '.' + node.className.trim().split(/\\s+/).join('.') : ''), overflowX: style.overflowX, clientWidth: node.clientWidth, scrollWidth: node.scrollWidth, scrollLeft: node.scrollLeft });
      }
      return {
        viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
        lang: document.querySelector('.features-pane .pane-title')?.textContent ?? null,
        document: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, bodyScrollWidth: document.body.scrollWidth, scrollX },
        detail: { ...detailBox, clientWidth: detail.clientWidth, scrollWidth: detail.scrollWidth, scrollLeft: detail.scrollLeft, overflowX: detailStyle.overflowX, paddingLeft: detailStyle.paddingLeft, paddingRight: detailStyle.paddingRight, contentLeft: round(contentLeft), contentRight: round(contentRight), contentWidth: round(contentRight - contentLeft) },
        pane: { ...box(pane), clientWidth: pane.clientWidth, scrollWidth: pane.scrollWidth },
        grid: { ...box(grid), clientWidth: grid.clientWidth, scrollWidth: grid.scrollWidth, gridTemplateColumns: gridStyle.gridTemplateColumns, columnGap: gridStyle.columnGap },
        cards, switches, chain,
        railRect: box(document.querySelector('.app-rail')), railPos: document.documentElement.getAttribute('data-rail-pos'),
      };
    })()`);
    const round = (value) => Math.round(value * 100) / 100;
    const assess = (layout) => {
      const maxCardRight = Math.max(...layout.cards.map((card) => card.right));
      const outsideBox = layout.cards.filter((card) => card.right > layout.detail.right + 0.5 || card.left < layout.detail.left - 0.5);
      const switchesOutsideBox = layout.switches.filter((entry) => entry.right > layout.detail.right + 0.5 || entry.left < layout.detail.left - 0.5);
      const outsideContent = layout.cards.filter((card) => card.right > layout.detail.contentRight + 0.5);
      const tracks = layout.grid.gridTemplateColumns.split(/\s+/).map((value) => parseFloat(value));
      const block = layout.chain.find((entry) => entry.node.startsWith("div.setting-block")) ?? null;
      const detailScrolls = layout.detail.scrollWidth > layout.detail.clientWidth || layout.detail.scrollLeft !== 0;
      const documentScrolls = layout.document.scrollWidth > layout.document.clientWidth || layout.document.scrollX !== 0;
      return {
        escapesDetailBox: outsideBox.length > 0 || switchesOutsideBox.length > 0,
        cardsOutsideDetailBox: outsideBox.map((card) => `${card.id}:${card.left}..${card.right}`),
        detailScrolls, documentScrolls,
        tracks, gridAvailableWidth: layout.grid.clientWidth, trackIsGridMinimum280: tracks.length === 1 && tracks[0] >= 279.5 && tracks[0] <= 280.5,
        gridOverflowPx: layout.grid.scrollWidth - layout.grid.clientWidth,
        sectionBlockOverflowPx: block ? block.scrollWidth - block.clientWidth : null,
        paneOverflowPx: layout.pane.scrollWidth - layout.pane.clientWidth,
        cardsPastDetailContentBox: outsideContent.length, pastDetailContentBoxPx: round(maxCardRight - layout.detail.contentRight),
        roomLeftToDetailBoxEdgePx: round(layout.detail.right - maxCardRight),
        cardInsetLeftPx: round(Math.min(...layout.cards.map((card) => card.left)) - layout.detail.left), cardInsetRightPx: round(layout.detail.right - maxCardRight),
        switchesOffViewport: layout.switches.filter((entry) => entry.right > layout.viewport.width + 0.5).map((entry) => entry.id),
      };
    };
    const runWidth = async (lang, width, height, mobile, id) => {
      await seed({ [MARKER_KEY]: MARKER, xai_pref_lang: JSON.stringify(lang) }, `${id}:seed`);
      await setViewport(width, height, mobile);
      await mount(`${id}:mount`);
      await delay(400);
      const layout = await measure();
      pre(`${id}:viewport`, layout.viewport.width === width && layout.viewport.dpr === 1, { viewport: layout.viewport });
      pre(`${id}:language-rendered`, layout.lang === (lang === "zh" ? "功能" : "Features"), { title: layout.lang });
      pre(`${id}:eight-cards-and-switches-measured`, layout.cards.length === 8 && layout.switches.length === 8);
      const assessment = assess(layout);
      record("observation", { id: `${id}:layout`, layout, assessment });
      await evaluate(`document.querySelector('${PANE} .features-grid').scrollIntoView({ block: "start", inline: "nearest" })`);
      await delay(250);
      await screenshot(`${width}-${lang}`, { state: `Features pane at ${width}px, ${lang.toUpperCase()}, grid scrolled into view`, scrollX: await evaluate("scrollX"), detailScrollLeft: await evaluate(`document.querySelector('${PANE}').scrollLeft`) });
      return { layout, assessment };
    };
    const h10Verdicts = (lang, result) => {
      const tag = lang.toUpperCase();
      verdict(`H10-${lang}-a:375-escapes-settings-detail-or-scrolls`, {
        hypothesis: "H10", claim: `At 375 px (${tag}) the 280 px grid minimum overflows .settings-detail horizontally: content past the .settings-detail box, or the detail or the document scrolls horizontally`,
        requirement: "§9 (literal): pane controls are contained horizontally within .settings-detail; neither the document nor the detail scrolls horizontally",
        holds: !result.assessment.escapesDetailBox && !result.assessment.detailScrolls && !result.assessment.documentScrolls,
        evidence: { assessment: result.assessment, detail: result.layout.detail, document: result.layout.document },
      });
      verdict(`H10-${lang}-b:375-grid-minimum-overflows-pane`, {
        hypothesis: "H10", claim: `At 375 px (${tag}) the 280 px grid minimum overflows the Features pane and the .settings-detail content box horizontally (into the detail's padding)`,
        requirement: "§9 containment as operationalised by the accepted Sticky visual layout checks (../web-sticky-recovery-native/verify-visual.mjs 'pane-no-horizontal-overflow'): the pane does not overflow horizontally and the cards stay inside the .settings-detail content box",
        holds: result.assessment.paneOverflowPx <= 0 && result.assessment.cardsPastDetailContentBox === 0,
        evidence: { assessment: result.assessment, pane: result.layout.pane, grid: result.layout.grid, chain: result.layout.chain.slice(0, 5) },
      });
    };
    const en = await runWidth("en", 375, 812, true, "h10:375-en");
    h10Verdicts("en", en);
    const zh = await runWidth("zh", 375, 812, true, "h10:375-zh");
    h10Verdicts("zh", zh);
    const control = await runWidth("en", 1440, 900, false, "h10:1440-en-control");
    record("observation", { id: "h10:control-1440", note: "measurement control at a wide viewport (not a hypothesis verdict)", assessment: control.assessment });
  }

  const network = await evaluate("__native.network");
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
    requirementFailures: failed, runtimeErrors: runtimeErrors.length, exceptions: exceptions.length, runtimeErrorSamples: runtimeErrors.slice(0, 6),
    consoleWarnings: consoleWarnings.length, consoleWarningSamples: [...new Set(consoleWarnings)].slice(0, 5), dialogs, artifacts: artifacts.map((entry) => entry.file),
    ...(harnessError ? { error: String(harnessError?.stack ?? harnessError).slice(0, 1500), checkId: harnessError?.checkId ?? null, checkKind: harnessError?.checkKind ?? null } : {}),
  });
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`, { flag: "wx" });
  await closeSession().catch(() => {});
  server?.closeAllConnections?.();
  server?.close();
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  process.exitCode = harnessError ? 1 : failed.length ? 2 : 0;
  const summary = verdicts.map((entry) => `${entry.id}=${entry.requirementHolds ? "PASS" : "FAIL"}`).join(" ");
  console.log(`${harnessError ? "HARNESS-FAIL" : "VALID"} ${relative(root, evidencePath)} checks=${checks} exit=${process.exitCode} ${summary}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
}
