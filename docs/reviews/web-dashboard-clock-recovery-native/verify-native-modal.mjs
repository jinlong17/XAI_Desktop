/**
 * CP-CLOCK-01 batch 70 E4: native BEFORE evidence on the production App.
 * Pipe/CDP, archive guard, storage/lock/key instruments and auth fixture are
 * adapted from the accepted AppRail native runner. Clock cases are authored
 * for contract r2 and the frozen pixelFocusWalk is copied byte for byte from
 * bacdbbc, with block and function hashes checked at every execution.
 */
import { createHash } from "node:crypto";
import { inflateSync } from "node:zlib";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LOCKFILE_GATE_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const CONTRACT_PATH = "docs/reviews/web-dashboard-clock-recovery-contract/contract.md";
const CONTRACT_SHA256 = "214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae";
const BEFORE_SHA = "f9eb4b1f207bc4b46f547b90afc250424b3c8695";
const SOURCE_TABLE = [...readFileSync(new URL("../web-dashboard-clock-recovery-contract/contract.md", import.meta.url), "utf8").matchAll(/^\| `([^`]+)`[^|]* \| `([a-f0-9]{64})`/gm)];
const CONTRACT_SOURCE_HASHES = Object.fromEntries(SOURCE_TABLE.map((match) => [match[1], match[2]]));
const ORACLE_COMMIT = "bacdbbc";
const ORACLE_PATH = "docs/reviews/web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs";
const ORACLE_FILE_SHA256 = "5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4";
const ORACLE_BLOCK_SHA256 = "e024c90e7c038fc4bd704b159bd7a144abc2fb34cfe7583eda8c8d0c6c2e5a43";
const ORACLE_FUNCTION_SHA256 = "1cdb0c13e10219267a2a03118d58c09744ee88f875c0dd29b4071a69c17a0620";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? output;
if (process.env.XAI_NATIVE_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
const MODES = ["modal"];
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
const progress = (text) => process.stderr.write(`[clock-native ${mode}] ${new Date().toISOString().slice(11, 19)} ${text}\n`);
const records = [];
const runtimeErrors = [];
const consoleWarnings = [];
const dialogs = [];
const dialogPlan = [];
const artifacts = [];
const navigationRequests = [];
const networkSeen = { documents: 0, attempts: 0, nonLocal: 0, samples: [] };
let lastCheckId = null;
let currentCase = null;
const record = (name, value = {}) => {
  records.push({ name, ...value });
  if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 300));
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
  verdicts.push({ id, hypothesis, requirementHolds: Boolean(holds) });
  record("verdict", { id, hypothesis, claim, requirement, requirementHolds: Boolean(holds), verdict: holds ? "refuted (PASS; the requirement still binds the fixed product)" : "confirmed (correct FAIL)", ...evidence });
  return Boolean(holds);
};
const facts = [];
const fact = (id, { hypothesis, claim, observed, evidence = {} }) => {
  checks += 1;
  lastCheckId = id;
  facts.push({ id, hypothesis, observed: Boolean(observed) });
  record("verdict", { id, hypothesis, claim, kind: "fact", observed: Boolean(observed), verdict: observed ? "observed (fact asserted by the hypothesis)" : "not observed", ...evidence });
};

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerText = readFileSync(fileURLToPath(import.meta.url), "utf8");
const runnerSha256 = sha256(runnerText);
const FIXTURE = "native-before-app.tsx";
const PRELUDE = "native-before-prelude.js";
const fixtureSource = readFileSync(join(output, FIXTURE), "utf8");
const preludeSource = readFileSync(join(output, PRELUDE), "utf8");
const focusProbeSource = readFileSync(join(output, "native-clock-focus-probes.js"), "utf8");
const frozenOracleSource = readFileSync(join(root, ORACLE_PATH), "utf8");
const oracleAtCommit = execFileSync("git", ["show", `${ORACLE_COMMIT}:${ORACLE_PATH}`], { cwd: root, maxBuffer: 20 * 1024 * 1024 });
function oracleBlock(source) {
  const start = source.indexOf("\n/** A minimal PNG decoder (8-bit") + 1;
  const fn = source.indexOf("\nasync function pixelFocusWalk(") + 1;
  const end = source.indexOf("\n}\n", fn) + 3;
  return start > 0 && fn > start && end > fn ? { block: source.slice(start, end), fn: source.slice(fn, end) } : { block: "", fn: "" };
}
const ownOracle = oracleBlock(runnerText);
const frozenOracle = oracleBlock(frozenOracleSource);
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
const fixedProductChanges = resolved === BEFORE_SHA ? [] : execFileSync("git", ["diff", "--name-status", BEFORE_SHA, resolved, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean).map((line) => { const [status, path] = line.split("\t"); return { status, path }; });
const allowedModified = new Set([
  "packages/xai-web-dashboard-widgets/src/widgets/ClockWidget.tsx", "packages/xai-web-dashboard-widgets/src/registrations.tsx", "packages/xai-web-dashboard-widgets/src/styles.css", "packages/xai-web-dashboard-widgets/src/__tests__/ClockWidget.test.tsx", "packages/xai-web-dashboard-widgets/docs/api.md", "packages/xai-web-dashboard-widgets/docs/test.md",
  "packages/xai-web-dashboard-grid/src/DashboardModule.tsx", "packages/xai-web-dashboard-grid/src/DashboardGrid.tsx", "packages/xai-web-dashboard-grid/src/types.ts", "packages/xai-web-dashboard-grid/docs/api.md", "packages/xai-web-dashboard-grid/docs/test.md",
]);
const widgetInternalNew = fixedProductChanges.filter((entry) => entry.status === "A" && /^packages\/xai-web-dashboard-widgets\/src\/internal\/[^/]+$/.test(entry.path));
const gridInternalNew = fixedProductChanges.filter((entry) => entry.status === "A" && /^packages\/xai-web-dashboard-grid\/src\/internal\/[^/]+$/.test(entry.path));
const allowedFixedChange = ({ status, path }) => status === "M" && allowedModified.has(path) || status === "A" && (/^packages\/xai-web-dashboard-widgets\/src\/(?:internal|__tests__)\/[^/]+$/.test(path) || /^packages\/xai-web-dashboard-grid\/src\/(?:internal|__tests__)\/[^/]+$/.test(path));
const contractSha256 = sha256(execFileSync("git", ["show", `HEAD:${CONTRACT_PATH}`], { cwd: root, maxBuffer: 20 * 1024 * 1024 }));
const versionOf = (name) => {
  try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
};
/** Reader, writer and host modules that must be bundled from the archive (contract §2, §9 "Composition"). */
const REQUIRED_MODULES = [
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
  "packages/xai-web-shell/src/index.ts",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/Topbar.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/AvatarMenu.tsx",
  "packages/xai-web-shell/src/SignOutConfirmDialog.tsx",
  "packages/xai-web-shell/src/registry.tsx",
  "packages/xai-web-shell/src/internal/dnd.ts",
  "packages/xai-web-settings-features-panel/src/FeaturesPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresPane.tsx",
  "packages/xai-web-settings-features-panel/src/useFeaturePrefs.ts",
  "packages/xai-web-settings-features-panel/src/filterModulesByFeaturePrefs.ts",
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearanceController.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/storage.ts",
  "packages/plugin-web-storage/src/internal/codec.ts",
  "packages/plugin-web-storage/src/internal/registry.ts",
  "packages/plugin-web-storage/src/internal/sameTabBus.ts",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/accountOwnership.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-tokens/src/i18n.ts",
  "packages/plugin-web-tokens/src/layout.css",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/xai-web-dashboard-grid/src/DashboardModule.tsx",
  "packages/xai-web-dashboard-grid/src/DashHeader.tsx",
  "packages/xai-web-dashboard-grid/src/WidgetGhost.tsx",
  "packages/xai-web-dashboard-widgets/src/widgets/ClockWidget.tsx",
  "apps/web/src/routes/modules/dashboardRegistration.tsx",
];

async function extractArchive(target) {
  return new Promise((resolve, reject) => {
    const archive = spawn("git", ["archive", resolved], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    const tar = spawn("tar", ["-x", "-C", target], { stdio: ["pipe", "ignore", "pipe"] });
    const digest = createHash("sha256");
    let bytes = 0, gitCode = null, tarCode = null, gitError = "", tarError = "", finished = false;
    const fail = (error) => { if (!finished) { finished = true; reject(error); } };
    const finish = () => {
      if (gitCode === null || tarCode === null || finished) return;
      finished = true;
      if (gitCode !== 0 || tarCode !== 0) reject(Error(`archive exit ${gitCode} (${gitError}); tar exit ${tarCode} (${tarError})`));
      else resolve({ method: "streamed git archive | tar", bytes, sha256: digest.digest("hex") });
    };
    archive.stdout.on("data", (chunk) => { bytes += chunk.length; digest.update(chunk); });
    archive.stdout.pipe(tar.stdin);
    archive.stderr.on("data", (chunk) => { gitError += chunk; });
    tar.stderr.on("data", (chunk) => { tarError += chunk; });
    archive.on("error", fail); tar.on("error", fail);
    archive.on("close", (code) => { gitCode = code; finish(); });
    tar.on("close", (code) => { tarCode = code; finish(); });
  });
}

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-clock-native-before-")));
const downloads = join(directory, "downloads");
const snapshot = join(directory, "source");
const profile = join(directory, "profile");
let server = null;
let browser = null;
let origin = "";
let moduleIndex = [];

// ---------------------------------------------------------------------------------------------------
// Browser over the DevTools PIPE transport (--remote-debugging-pipe: NUL-delimited JSON on fds 3/4) with flattened
// target sessions; one page object per attached target (the App document and, in h11, a second document).
// ---------------------------------------------------------------------------------------------------
const moduleAt = (url, line) => {
  if (!url || !url.endsWith("/__native/bundle.js") || typeof line !== "number") return null;
  let found = null;
  for (const entry of moduleIndex) { if (entry.line <= line) found = entry.module; else break; }
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
      runtimeErrors.push({ page: page.name, kind: "renderer-crash", afterCheck: lastCheckId, case: currentCase?.id ?? null, allowed: false, text: "Inspector.targetCrashed" });
    } else if (message.method === "Debugger.paused") {
      if (page.onPaused) page.onPaused(message.params);
    } else if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails ?? {};
      runtimeErrors.push({ page: page.name, kind: "exception", afterCheck: lastCheckId, case: currentCase?.id ?? null, allowed: Boolean(currentCase?.allowErrors), text: String(details.exception?.description ?? details.text ?? "").slice(0, 600), source: frameSource(details.stackTrace?.callFrames?.[0] ?? { url: details.url, lineNumber: details.lineNumber, columnNumber: details.columnNumber }) });
    } else if (message.method === "Runtime.consoleAPICalled") {
      const text = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ").slice(0, 600);
      const source = frameSource(message.params.stackTrace?.callFrames?.[0]);
      if (message.params.type === "error" || message.params.type === "assert") runtimeErrors.push({ page: page.name, kind: `console.${message.params.type}`, afterCheck: lastCheckId, case: currentCase?.id ?? null, allowed: Boolean(currentCase?.allowErrors), text, source });
      else if (message.params.type === "warning") consoleWarnings.push({ page: page.name, text: text.slice(0, 300), source, afterCheck: lastCheckId });
    } else if (message.method === "Page.javascriptDialogOpening") {
      if (message.params.type === "beforeunload" && page.navigating) {
        dialogs.push({ page: page.name, type: "beforeunload", message: message.params.message, expected: true, accepted: true, reason: "runner-initiated navigation", afterCheck: lastCheckId, case: currentCase?.id ?? null });
        page.cdp("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
      } else {
        const plan = dialogPlan.shift() ?? null;
        const accept = plan ? plan.accept : message.params.type === "beforeunload";
        dialogs.push({ page: page.name, type: message.params.type, message: message.params.message, expected: Boolean(plan), accepted: accept, purpose: plan?.purpose ?? null, afterCheck: lastCheckId, case: currentCase?.id ?? null });
        page.cdp("Page.handleJavaScriptDialog", { accept }).catch(() => {});
      }
    } else if (message.method === "Fetch.requestPaused") {
      navigationRequests.push({ page: page.name, url: message.params.request.url, resourceType: message.params.resourceType, afterCheck: lastCheckId, case: currentCase?.id ?? null });
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
async function attachPage(targetId, name, viewport) {
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  const page = { name, targetId, sessionId, navigating: false, crashed: null, onPaused: null, intercepted: [], presses: 0, keyAudit: [] };
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
async function pausedStack(page) {
  try {
    const paused = new Promise((resolve) => { page.onPaused = resolve; });
    await Promise.race([page.cdp("Debugger.enable"), delay(5000)]);
    await Promise.race([page.cdp("Debugger.pause"), delay(5000)]);
    const params = await Promise.race([paused, delay(8000).then(() => null)]);
    page.onPaused = null;
    if (!params) return { paused: false };
    const frames = (params.callFrames ?? []).slice(0, 25).map((frame) => ({ functionName: frame.functionName, line: frame.location.lineNumber, url: frame.url, module: moduleAt(frame.url || `${origin}/__native/bundle.js`, frame.location.lineNumber) }));
    await Promise.race([page.cdp("Debugger.resume"), delay(3000)]);
    return { paused: true, reason: params.reason, frames };
  } catch (error) {
    return { paused: false, error: String(error) };
  }
}
async function input(page, method, params) {
  if (page.crashed) throw Object.assign(Error("PRECONDITION: renderer crashed (Inspector.targetCrashed)"), { checkId: "harness:renderer-crash", checkKind: "precondition" });
  const result = await Promise.race([page.cdp(method, params), delay(EVALUATE_TIMEOUT_MS).then(() => ({ timedOut: true }))]);
  if (result?.timedOut) {
    record("hang-diagnosis", { afterCheck: lastCheckId, page: page.name, input: { method, type: params.type }, stack: await pausedStack(page) });
    throw Object.assign(Error(`PRECONDITION: input ${method} ${params.type} was not acknowledged within ${EVALUATE_TIMEOUT_MS} ms`), { checkId: "harness:input-timeout", checkKind: "precondition" });
  }
  return result;
}
async function evaluate(page, expression) {
  if (page.crashed) throw Object.assign(Error("PRECONDITION: renderer crashed (Inspector.targetCrashed)"), { checkId: "harness:renderer-crash", checkKind: "precondition" });
  const result = await Promise.race([page.cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }), delay(EVALUATE_TIMEOUT_MS).then(() => ({ timedOut: true }))]);
  if (result.timedOut) {
    record("hang-diagnosis", { afterCheck: lastCheckId, page: page.name, expression: expression.slice(0, 300), stack: await pausedStack(page) });
    throw Object.assign(Error(`PRECONDITION: page evaluation did not answer within ${EVALUATE_TIMEOUT_MS} ms`), { checkId: "harness:page-evaluation-timeout", checkKind: "precondition" });
  }
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
/** Network and key audit of the document a page is about to leave (or of the last document at the end of the run). */
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
      const expected = page.keyAudit.flatMap((key) => [`keydown:${key}`, ...(KEYDEFS[key]?.text ? [`keypress:${key}`] : []), `keyup:${key}`]);
      const actual = keys.map((entry) => `${entry.type}:${entry.key}`);
      if (keydowns !== page.presses || keyups !== page.presses || keypresses !== page.keyAudit.filter((key) => KEYDEFS[key]?.text).length || untrusted !== 0 || !isDeepStrictEqual(actual, expected)) {
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
async function reload(page) {
  await collectDocument(page, "reload");
  page.navigating = true;
  try { await page.cdp("Page.reload", { ignoreCache: true }); } finally { setTimeout(() => { page.navigating = false; }, 2500); }
}
function pngSize(buffer) { return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }; }
async function screenshot(page, name, details = {}) {
  const shot = await page.cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const buffer = Buffer.from(shot.data, "base64");
  const file = `native-${short}-${suffix}-${mode}-${name}.png`;
  writeFileSync(join(evidenceDir, file), buffer, { flag: "wx" });
  const entry = { file, page: page.name, sha256: sha256(buffer), bytes: buffer.length, png: pngSize(buffer), case: currentCase?.id ?? null, ...details };
  artifacts.push(entry);
  record("screenshot", entry);
  return entry;
}

// ---------------------------------------------------------------------------------------------------
// Oracle (contract §2 display order, A2 merge, dnd.ts reorder semantics), written from the contract text
// ---------------------------------------------------------------------------------------------------
const RAIL_KEY = "xai_rail_order";
const OWNER = "clock-native-A";
const MARKER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:committed-generation`;
const MARKER = JSON.stringify({ generation: "g1", migrationId: "clock-native", previous: null });
const LANG_KEY = "xai_pref_lang";
const FEATURE_IDS = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "habits", "meditation"];
const featureKey = (id) => `xai_pref_features_${id}`;
const CRASHING = [
  { label: "object-empty", raw: "{}" },
  { label: "object-tasks", raw: "{\"tasks\":1}" },
  { label: "number-1", raw: "1" },
  { label: "number-0", raw: "0" },
  { label: "number-minus-1", raw: "-1" },
  { label: "true", raw: "true" },
  { label: "false", raw: "false" },
];
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
/** Contract §5 normative wording (EN and ZH) that the fixed product must render; none may exist at the revision. */
const NORMATIVE = {
  en: ["Sidebar order not saved. Review it.", "Saved sidebar order is unavailable. Review it.", "Order not saved", "Order unavailable", "Sidebar order",
    "Sidebar order is saving.", "Sidebar order was not saved.", "Saved sidebar order is unavailable. Reload it; this is not a new unsaved change.",
    "Retry sidebar order", "Discard sidebar order change", "Export sidebar order draft", "Reload sidebar order"],
  zh: ["侧栏顺序未保存，点击查看。", "已保存的侧栏顺序不可用，点击查看。", "顺序未保存", "顺序不可用", "侧栏顺序",
    "侧栏顺序正在保存。", "侧栏顺序未保存。", "已保存的侧栏顺序不可用。请重新读取；这不是新的未保存更改。",
    "重试 侧栏顺序", "放弃 侧栏顺序更改", "导出侧栏顺序草稿", "重新读取 侧栏顺序"],
};
const RAIL_SIGN_OUT_TEXT = { en: "Your sidebar order change is not saved. Sign out and discard it?", zh: "侧栏顺序更改尚未保存。仍要退出并放弃这项更改吗？" };
let facts0 = null; // archive facts: registrations, nav labels, registry default, lock name
const railIds = () => facts0.registrations.filter((entry) => entry.showInRail).sort((left, right) => (left.railOrder - right.railOrder) || (left.moduleId < right.moduleId ? -1 : left.moduleId > right.moduleId ? 1 : 0)).map((entry) => entry.moduleId);
const visibleIds = (hidden = []) => railIds().filter((id) => !hidden.includes(id));
const labelOf = (lang, id) => facts0.labels[lang].nav[id] ?? id;
const idsToLabels = (lang, ids) => ids.map((id) => labelOf(lang, id));
const labelsToIds = (lang, labels) => labels.map((label) => railIds().find((id) => labelOf(lang, id) === label) ?? `?${label}`);
const parse = (raw) => { try { return JSON.parse(raw); } catch { return undefined; } };

// ---------------------------------------------------------------------------------------------------
// Documents: seed page, App mount, input
// ---------------------------------------------------------------------------------------------------
let selfTested = false;
async function seed(page, entries, label) {
  await navigate(page, `${origin}/seed`);
  pre(`${label}:seed-page-loaded-with-prelude-only`, await waitUntil(page, "document.readyState === 'complete' && location.pathname === '/seed' && !!window.__native && !window.verify", 10000));
  if (!selfTested) {
    const result = await evaluate(page, "__native.selfTest()");
    record("instrument-selftest", { page: "/seed (prelude only, no product code)", result });
    pre("instruments:storage-faults-f-b002-dispatch-locks-history-unload-confirm-network-input-drag", result.quotaThrew && result.quotaNeverStored && result.throwingSetThrew && result.throwingSetNeverStored
      && result.setDelegated && result.readbackAfterSetDenied && result.readbackOneShot && result.getDenied && result.removeDelegated && Object.values(result.totalDenial).every(Boolean) && result.noNestedStorageCalls
      && isDeepStrictEqual(result.dispatchCounted, ["storage:xai_native_apprail_fixed_selftest:true", "bus:web:settings:preference-changed"])
      && result.nonLocalFetchRefusedAndLogged && result.lockHeldAndPending && result.middleHeldAfterFirst && result.fifoOrder === "app1,app2" && isDeepStrictEqual(result.lockAttribution, ["fixture", "app", "fixture", "app"])
      && isDeepStrictEqual(result.historyTraced, ["pushState:selftest-push", "replaceState:selftest-replace"]) && result.popTraced === 1 && result.unloadTracked && result.urlTraced && result.confirmWrapped
      && result.consoleErrorTraced && result.errorUiTraced && result.untrustedClickTraced && result.untrustedDragTraced && result.railObserverTraced, { result });
    // K-1 positive control: one trusted Escape (no nativeVirtualKeyCode) reaches the page as exactly one keydown and keyup.
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
const READY_APP = "(!!window.verify && !!window.__native && !!document.querySelector('.app header.topbar') && !!document.querySelector('.app-rail .rail-items') && !document.querySelector('.account-data-gate') && verify.scope().kind === 'account')";
const CRASHED = "(!!window.__native && !!__native.routeError())";
/**
 * Production App mount. expect: "app" (a mount failure is a harness precondition), "crash" (the route error boundary
 * is the expected before outcome; a mounted App is recorded, never a precondition failure), or "either".
 */
async function mountApp(page, label, { path = "/app/tasks", expect = "app", ready = READY_APP } = {}) {
  await navigate(page, `${origin}${path}`);
  const settled = await waitUntil(page, `${ready} || ${CRASHED}`, 20000);
  await delay(700);
  const state = await evaluate(page, `({ ready: ${ready}, crashed: ${CRASHED}, routeError: window.__native ? __native.routeError() : null, verifyPresent: !!window.verify, path: location.pathname,
    body: (document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 300) })`);
  pre(`${label}:document-loaded-and-bundle-evaluated`, settled && state.verifyPresent, { state });
  const facts = await evaluate(page, `({ composition: verify.composition, instance: verify.instance, scope: verify.scope(), auth: verify.authCalls(), markerKey: verify.markerKey,
    lockName: verify.lockName(), physicalKey: verify.physicalKey(), lifecycle: verify.lifecycle, registryDefault: verify.registryDefault, registryCodec: verify.registryCodec,
    registrations: verify.registrations, labels: verify.labels, rail: __native.railNames(), topbar: __native.topbar(), pet: !!document.querySelector('.pet-wrap'), location: verify.location(),
    alertsAtMount: __native.surfaces().alerts })`);
  record("observation", { id: `${label}:mounted`, path, ready: state.ready, routeError: state.routeError, rail: facts.rail, topbarControls: facts.topbar.controlsOrder, alertsAtMount: facts.alertsAtMount, instance: facts.instance });
  pre(`${label}:auth-session-context-served-by-real-provider`, facts.composition === "production-app" && facts.auth.includes("getSession") && facts.markerKey === MARKER_KEY, { auth: facts.auth, markerKey: facts.markerKey });
  pre(`${label}:real-lock-name-and-unscoped-device-key`, facts.lockName === `xai:pref:v1:${RAIL_KEY}` && facts.physicalKey === RAIL_KEY, { lockName: facts.lockName, physicalKey: facts.physicalKey });
  if (expect === "app") {
    pre(`${label}:production-app-mounted`, state.ready && !state.crashed, { state });
    pre(`${label}:account-data-gate-activated-account`, facts.scope.kind === "account" && facts.scope.accountId === OWNER && facts.scope.generation === "g1", { scope: facts.scope });
    pre(`${label}:production-surfaces-present`, facts.rail.length > 0 && facts.topbar.present && facts.pet, { rail: facts.rail.length, pet: facts.pet });
  }
  if (!facts0) {
    facts0 = { registrations: facts.registrations, labels: facts.labels, registryDefault: facts.registryDefault, registryCodec: facts.registryCodec, lifecycle: facts.lifecycle, lockName: facts.lockName };
    record("observation", { id: "archive-facts", ...facts0, railIds: railIds() });
    pre("archive-facts:fourteen-rail-modules-and-twelve-defaults", railIds().length === 14 && Array.isArray(facts0.registryDefault) && facts0.registryDefault.length === 12 && facts0.registryCodec === "json", { railIds: railIds(), registryDefault: facts0.registryDefault });
  }
  return { state, facts };
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
    element.scrollIntoView({ block: element.closest('.clk-tz-popover') ? "nearest" : "center", inline: "nearest" });
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { found: true, x, y, rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + (typeof hit.className === "string" ? hit.className : "") : null,
      popover: element.closest('.clk-tz-popover') ? { rect: (() => { const r = element.closest('.clk-tz-popover').getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; })(), z: getComputedStyle(element.closest('.clk-tz-popover')).zIndex } : null };
  })()`;
  let point = await evaluate(page, measure);
  pre(`input:control-present:${label}`, point.found, { selector });
  if (!point.hit) { await delay(400); point = await evaluate(page, measure); }
  pre(`input:centre-hit-test:${label}`, point.hit, { selector, point });
  await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await input(page, "Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(80);
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
const KEYDEFS = { Escape: { code: "Escape", vk: 27 }, Tab: { code: "Tab", vk: 9 }, Enter: { code: "Enter", vk: 13, text: "\r" } };
/** One trusted key press without nativeVirtualKeyCode (lesson K-1); counted for the key audit. */
async function press(page, key) {
  const def = KEYDEFS[key];
  page.presses += 1;
  page.keyAudit.push(key);
  await input(page, "Input.dispatchKeyEvent", { type: def.text ? "keyDown" : "rawKeyDown", key, code: def.code, windowsVirtualKeyCode: def.vk, ...(def.text ? { text: def.text, unmodifiedText: def.text } : {}) });
  await input(page, "Input.dispatchKeyEvent", { type: "keyUp", key, code: def.code, windowsVirtualKeyCode: def.vk });
  await delay(60);
}
/**
 * One trusted rail drag (contract §6 item 8): source and targets by accessible name, each centre-hit-tested in the
 * DOM of that moment; end = "drop" (on the last target), "cancel" (Input.dispatchDragEvent dragCancel) or
 * "drop-outside" (dragOver and drop on the centre of .app-main, outside the rail).
 */
async function dragGesture(page, label, { source, targets, end = "drop" }) {
  const sourcePoint = await railPoint(page, source, `${label}:source`);
  const firstPoint = await railPoint(page, targets[0], `${label}:target-0`);
  const mark = await evaluate(page, "__native.mark()");
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
      await input(page, "Input.dispatchDragEvent", { type: "dragOver", x: point.x, y: point.y, data });
      await delay(250);
      // A hovering pointer keeps sending dragover (a real browser repeats it while the pointer rests). A reorder moves
      // another button under the resting pointer, and Chrome accepts a drop only over an element whose latest
      // dragover was accepted; so one more dragOver at the same point (development probe 1: without it no drop event
      // reached the rail).
      await input(page, "Input.dispatchDragEvent", { type: "dragOver", x: point.x, y: point.y, data });
      await delay(250);
      steps.push({ target: targets[index], ...(await evaluate(page, `({ seq: __native.mark(), rail: __native.railNames(), dragging: __native.rail().filter((entry) => entry.dragging).map((entry) => entry.name), bytes: __native.native.get(${JSON.stringify(RAIL_KEY)}) })`)) });
      lastPoint = point;
    }
    if (end === "drop") {
      await input(page, "Input.dispatchDragEvent", { type: "drop", x: lastPoint.x, y: lastPoint.y, data });
      await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: lastPoint.x, y: lastPoint.y, button: "left", buttons: 0, clickCount: 1 });
    } else if (end === "cancel") {
      await input(page, "Input.dispatchDragEvent", { type: "dragCancel", x: lastPoint.x, y: lastPoint.y, data });
      await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: lastPoint.x, y: lastPoint.y, button: "left", buttons: 0, clickCount: 1 });
    } else if (end === "drop-outside") {
      outside = await evaluate(page, `(() => {
        const main = document.querySelector('.app-main');
        if (!main) return { found: false };
        const rect = main.getBoundingClientRect();
        const x = rect.left + rect.width / 2, y = rect.top + Math.min(rect.height / 2, 300);
        const hit = document.elementFromPoint(x, y);
        return { found: true, x, y, hitTarget: hit ? hit.tagName + '.' + (typeof hit.className === 'string' ? hit.className.slice(0, 60) : '') : null,
          inRail: !!(hit && hit.closest('.app-rail')), editable: !!(hit && (hit.isContentEditable || /^(INPUT|TEXTAREA)$/.test(hit.tagName))) };
      })()`);
      pre(`${label}:outside-point-on-main-content-not-rail-not-editable`, outside.found && !outside.inRail && !outside.editable, { outside });
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
  const view = await evaluate(page, `__native.window(${mark})`);
  const drags = view.drags;
  pre(`${label}:every-recorded-drag-event-trusted`, drags.length > 0 && drags.every((entry) => entry.trusted), { drags: drags.map((entry) => `${entry.type}:${entry.target.label}:${entry.trusted}`) });
  pre(`${label}:trusted-dragstart-on-the-source`, drags.some((entry) => entry.type === "dragstart" && entry.target.label === source && entry.target.railButton), { source });
  pre(`${label}:trusted-dragover-on-every-target`, targets.every((target) => drags.some((entry) => entry.type === "dragover" && entry.target.label === target)), { targets });
  pre(`${label}:gesture-ended-with-dragend`, drags.some((entry) => entry.type === "dragend"), {});
  const dropEvents = drags.filter((entry) => entry.type === "drop");
  if (end === "drop") pre(`${label}:trusted-drop-inside-rail-items`, dropEvents.length === 1 && dropEvents[0].target.inRailItems, { dropEvents });
  else pre(`${label}:no-drop-inside-rail-items`, dropEvents.every((entry) => !entry.target.inRailItems), { dropEvents });
  const dropSeq = dropEvents[0]?.seq ?? null;
  const endSeq = drags.filter((entry) => entry.type === "dragend").at(-1).seq;
  const sets = view.attempts.filter((entry) => entry.key === RAIL_KEY && entry.op === "set");
  const removes = view.attempts.filter((entry) => entry.key === RAIL_KEY && entry.op === "remove");
  const result = {
    mark, steps, end, outside, dropSeq, endSeq,
    trace: drags.map((entry) => `${entry.seq}:${entry.type}:${entry.target.label ?? entry.target.tag}:${entry.trusted ? "trusted" : "UNTRUSTED"}`),
    sets: sets.map((entry) => ({ seq: entry.seq, value: entry.value, outcome: entry.outcome, phase: dropSeq !== null && entry.seq > dropSeq ? "at-or-after-drop" : entry.seq > endSeq ? "after-dragend" : "during-dragover" })),
    removes: removes.length,
    lockRequests: view.locks.filter((entry) => entry.by === "app").map((entry) => entry.name),
    view,
  };
  record("observation", { id: `${label}:drag`, source, targets, end, steps, outside, dropSeq, endSeq, trace: result.trace, sets: result.sets, removes: result.removes, lockRequests: result.lockRequests });
  return result;
}
const railNow = (page) => evaluate(page, "__native.railNames()");
const bytesNow = (page) => evaluate(page, `__native.native.get(${JSON.stringify(RAIL_KEY)})`);
const caseStart = (id, options = {}) => { currentCase = { id, ...options }; progress(id); };
const FEATURES_PANE = '.settings-detail[data-pane="features"]';
const READY_FEATURES = `(${READY_APP} && !!document.querySelector('${FEATURES_PANE} [data-feature-id="board"] [role="switch"]'))`;

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
let harnessError = null;
let mainPage = null;
const CLOCK_STYLE = "xai_clock_style";
const CLOCK_TZ = "xai_clock_tz";
const DASH_ORDER = "xai_dash_order";
const CLOCK_SCOPE = '.widget-shell[data-widget-id="clock"] .w-clock-body';
const READY_CLOCK = `(${READY_APP} && !!window.verify?.dashboardReady())`;
const STYLES = ["split", "minimal", "analog", "classic"];
const CITIES = ["shanghai", "london", "new_york", "tokyo", "sf", "paris", "sydney", "berlin", "dubai", "singapore", "hk", "la", "local"];
const HEIGHTS = { 375: 812, 414: 896, 768: 1024, 1024: 768, 1440: 900 };
const DEFAULT_DASH_ORDER = ["clock", "stat-tasks", "stat-streak", "stat-pomos", "timetrack", "weather", "mini-cal", "timezones", "stickies", "mail", "upcoming"];
const rawWrites = (view, key) => view.attempts.filter((entry) => entry.area === "local" && entry.key === key && (entry.op === "set" || entry.op === "remove"));
async function census(page, id, rail = false) {
  const state = await evaluate(page, `({ appearance: !!document.querySelector('[data-testid="appearance-status"]'), rail: __native.railStatus(), dialog: __native.departureDialog(), clock: verify.clock() })`);
  pre(`${id}:topbar-status-census`, !state.appearance && state.rail.present === rail, { appearance: state.appearance, rail: state.rail.present, expectedRail: rail });
  return state;
}
const clockState = (page) => evaluate(page, `({ clock: verify.clock(), styleBytes: __native.native.get(${JSON.stringify(CLOCK_STYLE)}), tzBytes: __native.native.get(${JSON.stringify(CLOCK_TZ)}), source: !!document.querySelector('[data-testid="clock-recovery"]'), export: !!document.querySelector('[data-testid="clock-export-draft"]'), unload: __native.warn(), location: verify.location() })`);
async function freshClock(page, id, lang, extra = {}, { order = ["clock", "mini-cal"], path = "/app/dashboard" } = {}) {
  caseStart(id);
  const seeded = seedsFor(lang, { ...(order === null ? {} : { [DASH_ORDER]: JSON.stringify(order) }), [CLOCK_STYLE]: "classic", [CLOCK_TZ]: "local", ...extra });
  await seed(page, seeded, id);
  await mountApp(page, id, { path, ready: path === "/app/dashboard" ? READY_CLOCK : READY_APP });
  pre(`${id}:clock-mounted`, path !== "/app/dashboard" || (await evaluate(page, "verify.clock().mounted")));
  await census(page, `${id}:start`);
  return { seeded, state: await clockState(page) };
}
async function chooseStyle(page, id, style) {
  await trustedClick(page, `${CLOCK_SCOPE} [data-clock-style="${style}"]`, `${id}:style-${style}`);
  return clockState(page);
}
async function chooseTimezone(page, id, zone) {
  await trustedClick(page, `${CLOCK_SCOPE} .clk-tz-btn`, `${id}:open-tz`);
  pre(`${id}:popover-open`, await waitUntil(page, "verify.clock().popoverOpen", 3000));
  let focused = false;
  for (let index = 0; index < 40; index += 1) {
    await press(page, "Tab");
    focused = await evaluate(page, `document.activeElement?.getAttribute('data-tz-id') === ${JSON.stringify(zone)}`);
    if (focused) break;
  }
  pre(`${id}:trusted-Tab-reached-timezone-option`, focused, { zone });
  await press(page, "Enter");
  pre(`${id}:trusted-Enter-closed-timezone-popover`, await waitUntil(page, "!verify.clock().popoverOpen", 3000), { zone, active: await evaluate(page, "({ tag: document.activeElement?.tagName, tz: document.activeElement?.getAttribute('data-tz-id'), open: verify.clock().popoverOpen })") });
  return clockState(page);
}
async function failChoice(page, id, lang, key, value, fault = "QuotaExceededError") {
  const original = key === CLOCK_TZ && value === "local" ? "tokyo" : "local";
  await freshClock(page, id, lang, key === CLOCK_TZ ? { [CLOCK_TZ]: original } : {});
  const mark = await evaluate(page, "__native.mark()");
  await evaluate(page, `__native.denySet(${JSON.stringify(key)}, ${JSON.stringify(fault)}), true`);
  const state = key === CLOCK_STYLE ? await chooseStyle(page, id, value) : await chooseTimezone(page, id, value);
  await delay(250);
  const view = await evaluate(page, `__native.window(${mark})`);
  const denied = rawWrites(view, key);
  pre(`${id}:fault-armed-and-observed`, denied.length >= 1 && denied.some((entry) => entry.outcome.startsWith("denied")) && (key === CLOCK_STYLE ? state.styleBytes === "classic" : state.tzBytes === original), { denied, state, original });
  await census(page, `${id}:before-business`);
  return { state: await clockState(page), view, denied };
}
async function runFields() {
  const page = mainPage;
  for (const lang of ["en", "zh"]) {
    // Mount, tick and popover are positive controls. The ghost is checked in departure mode.
    {
      const id = `pc-${lang}-mount-defaults`;
      caseStart(id);
      await seed(page, seedsFor(lang, { [DASH_ORDER]: JSON.stringify(["clock", "mini-cal"]) }), id);
      await mountApp(page, id, { path: "/app/dashboard", ready: READY_CLOCK });
      const mounted = await clockState(page);
      const mountView = await evaluate(page, "__native.window(0)");
      await census(page, `${id}:before-control`);
      verdict(`${id}:absent-defaults-and-zero-write-mount`, { hypothesis: "H8 positive control", claim: "Absent Clock keys display Classic and Local time; mount makes no writes", requirement: "§5 item 1 and §12 positive controls", holds: mounted.clock.style === "classic" && mounted.clock.trigger.length > 0 && !mounted.source && [CLOCK_STYLE, CLOCK_TZ].every((key) => rawWrites(mountView, key).length === 0), evidence: { mounted, clockWrites: mountView.attempts.filter((entry) => [CLOCK_STYLE, CLOCK_TZ].includes(entry.key)) } });
      const mark = await evaluate(page, "__native.mark()");
      await delay(3200);
      await trustedClick(page, `${CLOCK_SCOPE} .clk-tz-btn`, `${id}:open`);
      await trustedClick(page, `${CLOCK_SCOPE} .popover-scrim`, `${id}:close`);
      const after = await evaluate(page, `__native.window(${mark})`);
      verdict(`${id}:three-ticks-and-popover-zero-write`, { hypothesis: "H8 positive control", claim: "Tick and popover interaction make zero Clock writes", requirement: "§5 item 1", holds: [CLOCK_STYLE, CLOCK_TZ].every((key) => rawWrites(after, key).length === 0), evidence: { attempts: after.attempts.filter((entry) => [CLOCK_STYLE, CLOCK_TZ].includes(entry.key)) } });
    }
    // All 17 in-domain UI choices and the unchanged CmdK reader.
    {
      const id = `pc-${lang}-exact-17-values`;
      await freshClock(page, id, lang);
      const observations = [];
      for (const value of STYLES) {
        const before = await evaluate(page, "__native.mark()");
        await chooseStyle(page, id, value);
        const view = await evaluate(page, `__native.window(${before})`);
        const read = await evaluate(page, "verify.cmdkDashboard()");
        observations.push({ key: CLOCK_STYLE, value, stored: await evaluate(page, `__native.native.get(${JSON.stringify(CLOCK_STYLE)})`), cmdk: read.clockStyle, writes: rawWrites(view, CLOCK_STYLE) });
      }
      for (const value of CITIES) {
        const before = await evaluate(page, "__native.mark()");
        await chooseTimezone(page, id, value);
        const view = await evaluate(page, `__native.window(${before})`);
        const read = await evaluate(page, "verify.cmdkDashboard()");
        observations.push({ key: CLOCK_TZ, value, stored: await evaluate(page, `__native.native.get(${JSON.stringify(CLOCK_TZ)})`), cmdk: read.clockTz, writes: rawWrites(view, CLOCK_TZ) });
      }
      await census(page, `${id}:before-control`);
      verdict(`${id}:exact-bytes-through-ui-and-CmdK`, { hypothesis: "H8 positive control", claim: "All 17 choices persist exact bytes and CmdK reads them", requirement: "§10 item 1 and §12 positive controls", holds: observations.length === 17 && observations.every((row) => row.stored === row.value && row.cmdk === row.value && row.writes.some((entry) => entry.op === "set" && entry.value === row.value)), evidence: { observations } });
    }
    // Positive device lifecycle and independent per-key locks, including the unrelated rail and Appearance keys.
    {
      const id = `pc-${lang}-device-lifecycle-and-lock-independence`;
      await freshClock(page, id, lang);
      const lifecycle = await evaluate(page, "verify.clockLifecycle");
      pre(`${id}:device-lifecycle-declared`, lifecycle.length === 2 && lifecycle.every((row) => row.dataClass === "device-preference" && row.exportScope === "device-recovery" && row.accountDeletion === "retain" && row.legacyMigration === "retain-on-device"), { lifecycle });
      const railLock = await evaluate(page, `verify.clockLockName(${JSON.stringify(RAIL_KEY)})`);
      const appearanceLock = await evaluate(page, `verify.clockLockName("xai_pref_theme")`);
      await evaluate(page, `Promise.all([__native.hold(${JSON.stringify(railLock)}), __native.hold(${JSON.stringify(appearanceLock)})])`);
      pre(`${id}:unrelated-locks-held`, Object.values(await evaluate(page, "__native.lockStates()")).filter((row) => row.state === "held").length >= 2, { railLock, appearanceLock });
      const mark = await evaluate(page, "__native.mark()");
      await chooseStyle(page, id, "split");
      const view = await evaluate(page, `__native.window(${mark})`);
      const stored = await evaluate(page, `__native.native.get(${JSON.stringify(CLOCK_STYLE)})`);
      await census(page, `${id}:before-control`);
      verdict(`${id}:Clock-write-not-delayed-by-rail-or-Appearance-lock`, { hypothesis: "positive lock isolation", claim: "Unrelated rail and Appearance per-key locks do not delay Clock", requirement: "§7 item 1 and §12 positive controls", holds: stored === "split" && rawWrites(view, CLOCK_STYLE).some((entry) => entry.value === "split" && entry.outcome === "ok"), evidence: { railLock, appearanceLock, stored, locks: view.locks, writes: rawWrites(view, CLOCK_STYLE) } });
      await evaluate(page, `__native.release(${JSON.stringify(railLock)}); __native.release(${JSON.stringify(appearanceLock)}); true`);
    }
    // Genuine second same-origin document commits; the idle product widget must update from StorageEvent.
    {
      const id = `pc-${lang}-idle-second-document`;
      await freshClock(page, id, lang);
      const { targetId } = await browser.send("Target.createTarget", { url: `${origin}/external` });
      const external = await attachPage(targetId, `B-${lang}`, { width: 800, height: 600 });
      pre(`${id}:second-document-ready`, await waitUntil(external, "location.pathname === '/external'", 6000));
      const mark = await evaluate(page, "__native.mark()");
      await evaluate(external, `localStorage.setItem(${JSON.stringify(CLOCK_STYLE)}, "analog"); localStorage.setItem(${JSON.stringify(CLOCK_TZ)}, "tokyo"); true`);
      const updated = await waitUntil(page, "verify.clock().style === 'analog' && verify.clock().trigger.includes('Tokyo') || verify.clock().style === 'analog' && verify.clock().trigger.includes('东京')", 6000);
      const view = await evaluate(page, `__native.window(${mark})`);
      const state = await clockState(page);
      await census(page, `${id}:before-control`);
      verdict(`${id}:idle-widget-live-updates-both-keys`, { hypothesis: "positive cross-document", claim: "A second real document updates both idle Clock fields without a write by document A", requirement: "§9 row i and §12 positive controls", holds: updated && state.clock.style === "analog" && state.tzBytes === "tokyo" && [CLOCK_STYLE, CLOCK_TZ].every((key) => rawWrites(view, key).length === 0) && view.storageReceived.filter((entry) => [CLOCK_STYLE, CLOCK_TZ].includes(entry.key)).length >= 2, evidence: { state, storageReceived: view.storageReceived, writes: view.attempts.filter((entry) => [CLOCK_STYLE, CLOCK_TZ].includes(entry.key) && entry.op !== "get") } });
      await browser.send("Target.closeTarget", { targetId });
    }
    // A trusted pointer drag mounts the production ghost. It may read Clock keys, but never writes or removes them.
    {
      const id = `pc-${lang}-widget-ghost-zero-clock-writes`;
      await freshClock(page, id, lang);
      const start = await evaluate(page, `(() => { const e=document.querySelector(${JSON.stringify(CLOCK_SCOPE + ' .clock-sub')}); const r=e.getBoundingClientRect(); const x=r.left+r.width/2,y=r.top+r.height/2; const hit=document.elementFromPoint(x,y); return { x,y,hit:e.contains(hit),excluded:!!hit?.closest('button,input,textarea,[data-no-drag]') }; })()`);
      pre(`${id}:ghost-drag-target-uncovered-and-eligible`, start.hit && !start.excluded, { start });
      const mark = await evaluate(page, "__native.mark()");
      await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: start.x, y: start.y });
      await input(page, "Input.dispatchMouseEvent", { type: "mousePressed", x: start.x, y: start.y, button: "left", buttons: 1, clickCount: 1 });
      await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: start.x + 24, y: start.y + 20, button: "left", buttons: 1 });
      const ghost = await waitUntil(page, "!!document.querySelector('[data-testid=widget-ghost] .w-clock-body')", 3000);
      await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: start.x + 24, y: start.y + 20, button: "left", buttons: 0, clickCount: 1 });
      const view = await evaluate(page, `__native.window(${mark})`);
      await census(page, `${id}:before-control`);
      verdict(`${id}:ghost-mount-zero-SET-REMOVE`, { hypothesis: "positive ghost", claim: "A trusted Clock drag mounts a ghost with zero Clock SET/REMOVE attempts", requirement: "§3 item 3 and §12 positive controls", holds: ghost && [CLOCK_STYLE, CLOCK_TZ].every((key) => rawWrites(view, key).length === 0), evidence: { ghost, reads: view.attempts.filter((entry) => [CLOCK_STYLE, CLOCK_TZ].includes(entry.key) && entry.op === "get"), writes: view.attempts.filter((entry) => [CLOCK_STYLE, CLOCK_TZ].includes(entry.key) && entry.op !== "get") } });
    }
    // H1/H2: failures must keep a displayed draft with actions, but the before widget loses it.
    for (const [key, value, hypothesis] of [[CLOCK_STYLE, "split", "H1"], [CLOCK_TZ, "tokyo", "H2"], [CLOCK_TZ, "local", "H2"]]) {
      for (const [fault, name] of [["QuotaExceededError", "quota"], ["SecurityError", "throwing-setitem"]]) {
        const id = `${hypothesis}-${lang}-${key}-${value}-${name}`;
        const { state, denied } = await failChoice(page, id, lang, key, value, fault);
        const displayed = key === CLOCK_STYLE ? state.clock.style === value : state.clock.trigger.includes(value === "local" ? (lang === "zh" ? "本地" : "Local") : (lang === "zh" ? "东京" : "Tokyo"));
        verdict(`${id}:failed-choice-kept-with-recovery`, { hypothesis, claim: "A failed choice remains displayed with field recovery and export", requirement: "§5 items 5,7,8", holds: displayed && state.source && state.export, evidence: { state, denied } });
      }
    }
    // H3: a real held pref lock must keep the choice pending and bytes unchanged.
    for (const [key, value] of [[CLOCK_STYLE, "split"], [CLOCK_TZ, "tokyo"]]) {
      const id = `H3-${lang}-${key}`;
      await freshClock(page, id, lang);
      const lockName = await evaluate(page, `verify.clockLockName(${JSON.stringify(key)})`);
      await evaluate(page, `__native.hold(${JSON.stringify(lockName)})`);
      const lock = await evaluate(page, `__native.lockStates()`);
      pre(`${id}:real-exclusive-lock-held`, Object.values(lock).some((entry) => entry.name === lockName && entry.state === "held"), { lock });
      const mark = await evaluate(page, "__native.mark()");
      const state = key === CLOCK_STYLE ? await chooseStyle(page, id, value) : await chooseTimezone(page, id, value);
      const view = await evaluate(page, `__native.window(${mark})`);
      await census(page, `${id}:before-business`);
      verdict(`${id}:held-lock-prevents-early-write`, { hypothesis: "H3", claim: "Per-key lock defers the write", requirement: "§5 item 4", holds: (key === CLOCK_STYLE ? state.styleBytes : state.tzBytes) !== value && rawWrites(view, key).length === 0, evidence: { lockName, state, writes: rawWrites(view, key) } });
      await evaluate(page, `__native.release(${JSON.stringify(lockName)})`);
    }
  }
}
async function runSource() {
  const page = mainPage;
  const malformed = {
    [CLOCK_STYLE]: ["bogus", "Analog", "", " classic", '"analog"'],
    [CLOCK_TZ]: ["mars", "Shanghai", "UTC+8", "Asia/Shanghai", "new-york", "", '"local"'],
  };
  for (const lang of ["en", "zh"]) for (const [key, values] of Object.entries(malformed)) for (const raw of values) {
    const id = `H4-${lang}-${key}-${raw.length ? raw.replace(/[^a-zA-Z0-9]+/g, "-") : "empty"}`;
    const { state } = await freshClock(page, id, lang, { [key]: raw });
    pre(`${id}:malformed-source-seeded`, await evaluate(page, `__native.native.get(${JSON.stringify(key)})`) === raw, { raw });
    await census(page, `${id}:before-business`);
    const defaultShown = key === CLOCK_STYLE ? state.clock.style === "classic" : state.clock.trigger.includes(lang === "zh" ? "本地" : "Local");
    if (key === CLOCK_STYLE && raw === "bogus") {
      await viewport(page, 375);
      await screenshot(page, `${lang}-375-source-only-style`, { lang, width: 375, state: "malformed committed Clock style; source-only expected" });
      await viewport(page, 1280, 900);
    }
    verdict(`${id}:source-truth-with-Reload`, { hypothesis: "H4", claim: "Malformed committed source has a visible Reload-only source block", requirement: "§5 item 2", holds: defaultShown && state.source && !state.export && state.unload.warned === false, evidence: { raw, state } });
  }
  // Throwing getItem is scoped to one Clock key before the product mounts.
  for (const lang of ["en", "zh"]) for (const key of [CLOCK_STYLE, CLOCK_TZ]) {
    const id = `H4-${lang}-${key}-throwing-getitem`;
    caseStart(id);
    await seed(page, seedsFor(lang, { [DASH_ORDER]: JSON.stringify(["clock", "mini-cal"]), [CLOCK_STYLE]: "classic", [CLOCK_TZ]: "local" }), id);
    const { identifier } = await page.cdp("Page.addScriptToEvaluateOnNewDocument", { source: `window.__nativeFaultPlan = { get: [${JSON.stringify(key)}] };` });
    try { await mountApp(page, id, { path: "/app/dashboard", ready: READY_CLOCK }); }
    finally { await page.cdp("Page.removeScriptToEvaluateOnNewDocument", { identifier }); }
    const view = await evaluate(page, "__native.window(0)");
    pre(`${id}:key-scoped-read-fault-observed`, view.attempts.some((entry) => entry.key === key && entry.op === "get" && entry.outcome === "denied") && !view.attempts.some((entry) => entry.key === RAIL_KEY && entry.outcome === "denied"), { faults: view.attempts.filter((entry) => entry.outcome !== "ok").slice(0, 10) });
    const state = await clockState(page);
    await census(page, `${id}:before-business`);
    verdict(`${id}:unreadable-source-with-Reload`, { hypothesis: "H4", claim: "A throwing getItem for one Clock key displays source recovery", requirement: "§5 item 2", holds: state.source && !state.export && !state.unload.warned, evidence: { state } });
  }
}



async function railClick(page, lang, moduleId, id) {
  const name = labelOf(lang, moduleId);
  await clickOne(page, `[...document.querySelectorAll('.app-rail .rail-items .rail-btn')].filter((button) => button.getAttribute('aria-label') === ${JSON.stringify(name)})`, `${id}:rail-${moduleId}`);
}
async function signOutThroughUi(page, id, lang) {
  await trustedClick(page, ".app-rail .rail-avatar", `${id}:rail-avatar`);
  pre(`${id}:avatar-menu-open`, await waitUntil(page, "__native.avatarMenuOpen()", 3000));
  await clickOne(page, `[...document.querySelectorAll('.avatar-menu .avm-item')].filter((element) => (element.textContent || '').replace(/\\s+/g, ' ').trim() === ${JSON.stringify(facts0.labels[lang].avatar.signOut)})`, `${id}:avatar-sign-out`);
  pre(`${id}:sign-out-confirm-dialog-open`, await waitUntil(page, "__native.signOutDialogOpen()", 3000));
  const mark = await evaluate(page, "__native.mark()");
  const dialogsAt = dialogs.length;
  await trustedClick(page, "dialog.xai-sign-out-dialog .xai-sign-out-dialog__btn--confirm", `${id}:sign-out-confirm`);
  return { mark, dialogsAt };
}
async function failHeaderNote(page, id, lang) {
  const key = await evaluate(page, "verify.headerNoteKey()");
  const mark = await evaluate(page, "__native.mark()");
  await evaluate(page, `__native.denySet(${JSON.stringify(key)}, "QuotaExceededError")`);
  await trustedClick(page, ".dash-note__display", `${id}:edit-header-note`);
  pre(`${id}:header-note-input-open`, await waitUntil(page, "!!document.querySelector('.dash-note__input')", 3000));
  await trustedClick(page, ".dash-note__input", `${id}:focus-header-note`);
  await evaluate(page, `document.querySelector('.dash-note__input').select()`);
  await input(page, "Input.insertText", { text: "Clock batch 70 Header positive control" });
  await trustedClick(page, `[aria-label="${lang === "zh" ? "保存工作台备注" : "Save dashboard note"}"]`, `${id}:save-header-note`);
  pre(`${id}:Header-write-denied-and-recovery-shown`, await waitUntil(page, `__native.window(${mark}).attempts.some((entry) => entry.key === ${JSON.stringify(key)} && entry.op === 'set' && entry.outcome.startsWith('denied')) && !!document.querySelector('.dash-note-recovery')`, 6000), { key });
  return { key, mark };
}
async function runDeparture() {
  const page = mainPage;
  for (const lang of ["en", "zh"]) {
    // H5: AppRail departure is one accessible-name click, never a drag.
    {
      const id = `H5-${lang}-rail-click`;
      const { state: failed } = await failChoice(page, id, lang, CLOCK_STYLE, "split");
      const before = await evaluate(page, "verify.location()");
      const mark = await evaluate(page, "__native.mark()");
      await railClick(page, lang, "tasks", id);
      await delay(300);
      const after = await evaluate(page, `({ location: verify.location(), dialog: __native.departureDialog(), clock: verify.clock(), window: __native.window(${mark}) })`);
      await census(page, `${id}:before-business`);
      verdict(`${id}:Clock-holds-single-AppRail-click`, { hypothesis: "H5", claim: "A failed Clock draft holds the one trusted AppRail click", requirement: "§7 item 3 and §9 row d", holds: failed.clock.recovery.length > 0 && after.location.pathname === before.pathname && after.dialog?.label === (lang === "zh" ? "未保存的时钟草稿" : "Unsaved Clock draft") && after.window.history.length === 0, evidence: { before, after } });
      verdict(`${id}:Clock-only-unload-warning-and-export-entry`, { hypothesis: "H5", claim: "The failed Clock draft warns on unload and exposes a draft export", requirement: "§7 item 4 and §8", holds: failed.unload.warned && failed.export, evidence: { beforeDeparture: failed } });
    }
    // The Mini Calendar uses the production goTo callback; its button is clicked, never invoked privately.
    {
      const id = `H5-${lang}-mini-calendar-goTo`;
      const { state: failed } = await failChoice(page, id, lang, CLOCK_STYLE, "split");
      const before = await evaluate(page, "verify.location()");
      await trustedClick(page, '.widget-shell[data-widget-id="mini-cal"] .mc-jump', `${id}:mini-calendar-open`);
      await delay(350);
      const after = await evaluate(page, "({ location: verify.location(), dialog: __native.departureDialog() })");
      await census(page, `${id}:before-business`);
      verdict(`${id}:Clock-holds-widget-goTo`, { hypothesis: "H5", claim: "A failed Clock draft holds Mini Calendar's production goTo", requirement: "§9 row f", holds: failed.clock.recovery.length > 0 && after.location.pathname === before.pathname && !!after.dialog, evidence: { before, after } });
    }
    // Real browser POP after entering the Dashboard through the rail.
    {
      const id = `H5-${lang}-browser-back`;
      await freshClock(page, id, lang, {}, { path: "/app/tasks" });
      await railClick(page, lang, "dashboard", `${id}:enter-dashboard`);
      pre(`${id}:dashboard-entered`, await waitUntil(page, "verify.dashboardReady()", 5000));
      const mark = await evaluate(page, "__native.mark()");
      await evaluate(page, `__native.denySet(${JSON.stringify(CLOCK_STYLE)}, "QuotaExceededError")`);
      await chooseStyle(page, id, "split");
      pre(`${id}:Clock-fault-observed`, (await evaluate(page, `__native.window(${mark})`)).attempts.some((entry) => entry.key === CLOCK_STYLE && entry.op === "set" && entry.outcome.startsWith("denied")));
      const before = await evaluate(page, "verify.location()");
      const history = await page.cdp("Page.getNavigationHistory");
      pre(`${id}:back-entry-exists`, history.currentIndex > 0, { history: { currentIndex: history.currentIndex, entries: history.entries.map((entry) => entry.url) } });
      await page.cdp("Page.navigateToHistoryEntry", { entryId: history.entries[history.currentIndex - 1].id });
      await delay(500);
      const after = await evaluate(page, "({ location: verify.location(), dialog: __native.departureDialog() })");
      await census(page, `${id}:before-business`);
      verdict(`${id}:Clock-holds-real-POP`, { hypothesis: "H5", claim: "A failed Clock draft holds the browser Back entry", requirement: "§9 row e", holds: after.location.pathname === before.pathname && after.dialog?.label === (lang === "zh" ? "未保存的时钟草稿" : "Unsaved Clock draft"), evidence: { before, after } });
    }
    // Sign-out without a rail or Appearance draft has zero confirms at both products.
    {
      const id = `H5-${lang}-sign-out`;
      await failChoice(page, id, lang, CLOCK_STYLE, "split");
      const start = await signOutThroughUi(page, id, lang);
      await delay(650);
      const after = await evaluate(page, `({ dialog: __native.departureDialog(), scope: verify.scope(), auth: verify.authCalls(), view: __native.window(${start.mark}) })`);
      const confirms = dialogs.slice(start.dialogsAt);
      pre(`${id}:zero-rail-and-Appearance-confirms`, confirms.length === 0, { confirms });
      await census(page, `${id}:before-business`);
      verdict(`${id}:Clock-holds-signout`, { hypothesis: "H5", claim: "Clock is the only sign-out participant and keeps account identity", requirement: "§7 item 5 and §9 row g", holds: after.dialog?.label === (lang === "zh" ? "未保存的时钟草稿" : "Unsaved Clock draft") && after.scope.kind === "account" && after.auth.filter((call) => call === "signOut").length === 0, evidence: { after, confirms } });
    }
    // Header-only equivalence with Clock mounted and registered. D1 and row l are positive controls.
    for (const action of ["discard", "retry"]) {
      const id = `pc-${lang}-Header-D1-row-l-${action}`;
      await freshClock(page, `${id}:discover-key`, lang);
      const noteKey = await evaluate(page, "verify.headerNoteKey()");
      await freshClock(page, id, lang, { [noteKey]: "Original note" });
      const header = await failHeaderNote(page, id, lang);
      const mark = await evaluate(page, "__native.mark()");
      await railClick(page, lang, "tasks", id);
      pre(`${id}:Header-only-dialog-open`, await waitUntil(page, "!!__native.departureDialog()", 5000));
      const held = await evaluate(page, `({ dialog: __native.departureDialog(), location: verify.location(), clock: verify.clock(), view: verify.window(${mark}) })`);
      await census(page, `${id}:before-positive-control`);
      const expected = lang === "zh" ? "未保存的工作台备注草稿" : "Unsaved Dashboard header draft";
      pre(`${id}:Header-only-label-and-one-hold`, held.dialog?.label === expected && held.location.pathname === "/app/dashboard" && held.clock.recovery.length === 0 && held.view.commits.length === 0, { held });
      if (action === "discard") {
        const beforeFiles = readdirSync(downloads);
        const exportMark = await evaluate(page, "__native.mark()");
        await clickOne(page, `[...document.querySelectorAll('.settings-departure-dialog button')].filter((button) => button.textContent.trim() === ${JSON.stringify(lang === "zh" ? "导出当前草稿" : "Export current draft")})`, `${id}:dialog-export`);
        const downloaded = await waitFor(() => readdirSync(downloads).filter((file) => !beforeFiles.includes(file) && !file.endsWith(".crdownload")).length === 1, 5000);
        const newFiles = readdirSync(downloads).filter((file) => !beforeFiles.includes(file) && !file.endsWith(".crdownload"));
        const file = newFiles.length === 1 ? readFileSync(join(downloads, newFiles[0])) : null;
        const data = file ? JSON.parse(file.toString("utf8")) : null;
        const trace = await evaluate(page, `({ urls: __native.urlTrace(), clicks: __native.clickTrace(), window: __native.window(${exportMark}) })`);
        pre(`${id}:single-Header-export-file`, downloaded && newFiles.length === 1 && newFiles[0] === "dashboard-note-draft.json" && data?.kind === "dashboard-note-draft" && data.note === "Clock batch 70 Header positive control", { newFiles, data, trace });
        const savedFile = `native-${short}-${suffix}-${mode}-${id}-header-export.json`;
        writeFileSync(join(evidenceDir, savedFile), file, { flag: "wx" });
        artifacts.push({ file: savedFile, sha256: sha256(file), bytes: file.length, case: id, kind: "Header export" });
        record("export", { id, file: savedFile, sha256: sha256(file), bytes: file.length, data, trace });
        rmSync(join(downloads, newFiles[0]));
        pre(`${id}:Header-export-keeps-hold`, (await evaluate(page, "__native.departureDialog()"))?.label === expected);
        await clickOne(page, `[...document.querySelectorAll('.settings-departure-dialog button')].filter((button) => button.textContent.trim() === ${JSON.stringify(lang === "zh" ? "放弃本地更改并离开" : "Discard local changes and leave")})`, `${id}:dialog-discard`);
      } else {
        await evaluate(page, `__native.allowSet(${JSON.stringify(header.key)})`);
        await clickOne(page, `[...document.querySelectorAll('.dash-note-recovery button')].filter((button) => (button.getAttribute('aria-label') || button.textContent).trim() === ${JSON.stringify(lang === "zh" ? "重试备注保存" : "Retry note save")})`, `${id}:Header-retry`);
      }
      const released = await waitUntil(page, "verify.location().pathname === '/app/tasks'", 6000);
      const view = await evaluate(page, `verify.window(${mark})`);
      pre(`${id}:Header-only-released-once`, released && view.commits.length === 1 && view.commits[0].pathname === "/app/tasks", { commits: view.commits });
      verdict(`${id}:Header-equivalence-with-Clock-registered`, { hypothesis: "positive D1/l", claim: "The accepted Header alone holds and releases once while Clock is mounted", requirement: "§9 row l and §12 positive controls", holds: true, evidence: { held: { dialog: held.dialog, location: held.location }, released: view.commits } });
    }
  }
}

async function viewport(page, width, height = HEIGHTS[width]) {
  await page.cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await delay(150);
  const actual = await evaluate(page, "({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio })");
  pre(`viewport:${width}x${height}:exact`, actual.width === width && actual.height === height && actual.dpr === 1, { actual });
}
async function geometry(page, id, width) {
  const value = await evaluate(page, `(() => {
    const box = (selector) => { const e = document.querySelector(selector); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
    const targets = [...document.querySelectorAll(${JSON.stringify(CLOCK_SCOPE + ' button')})].map((e) => { const r=e.getBoundingClientRect(); return { name: e.getAttribute('aria-label') || e.title || e.textContent?.trim(), width:r.width, height:r.height, x:r.x, y:r.y, hit:e.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)) }; });
    return { viewport: { width: innerWidth, height: innerHeight }, widget: box(${JSON.stringify('.widget-shell[data-widget-id="clock"]')}), pet: box('.pet-wrap'), rail: box('.app-rail'), topbar: box('.topbar'), document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }, targets, clock: verify.clock(), topbarStatus: { appearance: !!document.querySelector('[data-testid="appearance-status"]'), rail: !!document.querySelector('[data-testid="rail-order-status"]') } };
  })()`);
  pre(`${id}:widget-and-pet-geometry-recorded`, value.widget !== null && value.viewport.width === width, { value });
  record("geometry", { id, width, ...value });
  return value;
}
async function runVisual() {
  const page = mainPage;
  for (const lang of ["en", "zh"]) for (const width of [375, 414, 768, 1024, 1440]) {
    const id = `H1-H2-H10-${lang}-${width}`;
    await viewport(page, width);
    await freshClock(page, id, lang, {}, { order: null });
    const defaultOrder = await evaluate(page, `({ persisted: __native.native.get(${JSON.stringify(DASH_ORDER)}), rendered: [...document.querySelectorAll('.module-dashboard .widget-shell[data-widget-id]')].map((element) => element.getAttribute('data-widget-id')) })`);
    pre(`${id}:default-dashboard-order`, JSON.stringify(defaultOrder.rendered) === JSON.stringify(DEFAULT_DASH_ORDER) && (defaultOrder.persisted === null || defaultOrder.persisted === JSON.stringify(DEFAULT_DASH_ORDER)), { defaultOrder, expected: DEFAULT_DASH_ORDER });
    const mark = await evaluate(page, "__native.mark()");
    await evaluate(page, `__native.denySet(${JSON.stringify(CLOCK_STYLE)}, "QuotaExceededError"); __native.denySet(${JSON.stringify(CLOCK_TZ)}, "QuotaExceededError"); true`);
    await chooseStyle(page, id, "split");
    await chooseTimezone(page, id, "tokyo");
    const view = await evaluate(page, `__native.window(${mark})`);
    pre(`${id}:both-faults-observed`, [CLOCK_STYLE, CLOCK_TZ].every((key) => rawWrites(view, key).some((entry) => entry.outcome.startsWith("denied"))), { writes: view.attempts.filter((entry) => [CLOCK_STYLE, CLOCK_TZ].includes(entry.key)) });
    await census(page, `${id}:before-business`);
    const measure = await geometry(page, id, width);
    const shot = await screenshot(page, `${lang}-${width}-both-failed-pet-on`, { state: "both Clock keys failed, default pet state", width, lang });
    verdict(`${id}:both-failed-recovery-visible`, { hypothesis: "H1/H2", claim: "Both failed fields render their own recovery blocks and export", requirement: "§5 item 7 and §9 visual", holds: measure.clock.recovery.length > 0 && measure.targets.some((target) => /Export|导出/.test(target.name ?? "")), evidence: { clock: measure.clock, screenshot: shot.file } });
    // The existing pet control is exercised at a supported width; resize the same document without reloading.
    if (width === 768) {
      const petName = facts0.labels[lang].nav.pet;
      await clickOne(page, `[...document.querySelectorAll('.app-rail .rail-bottom .rail-btn')].filter((button) => button.getAttribute('aria-label') === ${JSON.stringify(petName)})`, `${id}:hide-pet-by-product-rail-button`);
      const hidden = await geometry(page, `${id}:pet-hidden`, width);
      pre(`${id}:trusted-product-pet-toggle-hid-pet`, hidden.pet === null, { petName, hidden: hidden.pet });
      await viewport(page, 375);
      await geometry(page, `${id}:pet-hidden-resized`, 375);
      await screenshot(page, `${lang}-375-both-failed-pet-hidden-after-768-toggle`, { state: "same document after trusted pet toggle at 768 then resize to 375", lang });
    }
  }
}

/** Contract §9 combined Header+Clock modal at 375/1440, as a before-state shape probe. */
async function runModal() {
  const page=mainPage;
  const probe=process.env.XAI_NATIVE_MODAL_PROBE === '1';
  if (probe && !process.env.XAI_NATIVE_EVIDENCE_DIR) throw Error('PRECONDITION: modal development subset requires an external evidence directory');
  const languages=probe?['en']:['en','zh'];
  const widths=probe?[375]:[375,1440];
  record('modal-coverage-plan',{ languages,widths,subsetDevelopmentProbe:probe,combinedHeaderAndFailedClock:true });
  for (const lang of languages) for (const width of widths) {
    const id=`modal:${lang}:${width}:Header-and-Clock`;
    await viewport(page,768);
    await freshClock(page,`${id}:discover-note-key`,lang,{}, { order:null });
    const noteKey=await evaluate(page,'verify.headerNoteKey()');
    await freshClock(page,id,lang,{ [noteKey]:'Original note' },{ order:null });
    const defaultOrder=await evaluate(page,`({ persisted:__native.native.get(${JSON.stringify(DASH_ORDER)}),rendered:[...document.querySelectorAll('.module-dashboard .widget-shell[data-widget-id]')].map((element)=>element.getAttribute('data-widget-id')) })`);
    pre(`${id}:default-eleven-widget-order`,defaultOrder.persisted===null && JSON.stringify(defaultOrder.rendered)===JSON.stringify(DEFAULT_DASH_ORDER),{ defaultOrder });
    const header=await failHeaderNote(page,id,lang);
    await evaluate(page,focusProbeSource);
    const clockMark=await evaluate(page,'__native.mark()');
    await evaluate(page,`__native.denySet(${JSON.stringify(CLOCK_STYLE)},'QuotaExceededError');true`);
    await tabToPrefix(page,`${id}:Clock-failed-style`,'clock:style:split:');
    await press(page,'Enter');
    const clockFaults=await evaluate(page,`__native.window(${clockMark})`);
    pre(`${id}:Clock-key-scoped-fault-observed`,rawWrites(clockFaults,CLOCK_STYLE).some((entry)=>entry.outcome.startsWith('denied')),{ writes:rawWrites(clockFaults,CLOCK_STYLE) });
    await census(page,`${id}:before-departure`);
    await viewport(page,width);
    const before=await evaluate(page,'verify.location()');
    const mark=await evaluate(page,'__native.mark()');
    await railClick(page,lang,'tasks',id);
    pre(`${id}:production-coordinator-dialog-open`,await waitUntil(page,'!!__native.departureDialog()',5000));
    const state=await evaluate(page,`(() => { const d=document.querySelector('.settings-departure-dialog');const r=d?.getBoundingClientRect();const box=(e)=>{ const q=e.getBoundingClientRect();return { x:q.x,y:q.y,width:q.width,height:q.height,right:q.right,bottom:q.bottom }; };return { dialog:__native.departureDialog(),location:verify.location(),clock:verify.clock(),commits:verify.window(${mark}).commits,viewport:{ width:innerWidth,height:innerHeight },box:r?box(d):null,buttons:d?[...d.querySelectorAll('button')].map((button)=>{ const b=box(button),hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return { text:button.textContent.trim(),box:b,centreHit:!!hit && button.contains(hit) }; }):[],topbar:{ appearance:!!document.querySelector('[data-testid="appearance-status"]'),rail:!!document.querySelector('.rail-order-status, [data-testid="rail-order-status"]') } }; })()`);
    pre(`${id}:Header-and-Clock-attempts-still-on-Dashboard`,state.location.pathname===before.pathname && state.commits.length===0 && !state.topbar.appearance && !state.topbar.rail,{ state });
    const shot=await screenshot(page,`${lang}-${width}-Header-plus-failed-Clock-modal`,{ lang,width,state:'Header and Clock failure attempts; production coordinator modal' });
    verdict(`${id}:combined-participant-label`,{ hypothesis:'H5 combined modal',claim:'Header and failed Clock are both coordinator participants',requirement:'§9 host row k and responsive combined-dialog state',holds:state.dialog?.label===(lang==='zh'?'未保存的工作台草稿':'Unsaved Dashboard draft'),evidence:{ label:state.dialog?.label,clock:state.clock,headerKey:header.key,screenshot:shot.file } });
    verdict(`${id}:modal-contained-and-buttons-centre-hit`,{ hypothesis:'modal positive',claim:'Production coordinator dialog and all buttons fit the viewport and are centre hit-testable',requirement:'§9 other overlays and responsive presentation',holds:!!state.box && state.box.x>=0 && state.box.y>=0 && state.box.right<=width && state.box.bottom<=HEIGHTS[width] && state.buttons.length===3 && state.buttons.every((button)=>button.centreHit),evidence:{ box:state.box,buttons:state.buttons,viewport:state.viewport,screenshot:shot.file } });
    const walk=[];
    for (let index=0;index<8;index+=1) {
      await press(page,'Tab');
      walk.push(await evaluate(page,`(() => { const a=document.activeElement;const d=document.querySelector('.settings-departure-dialog');return { tag:a?.tagName,text:a?.textContent?.trim(),inside:!!d && !!a && d.contains(a),body:a===document.body }; })()`));
    }
    record('modal-focus-trap',{ id,walk });
    verdict(`${id}:modal-traps-trusted-Tab`,{ hypothesis:'modal positive',claim:'Trusted Tab remains inside the production coordinator dialog',requirement:'§9 other overlays',holds:walk.length===8 && walk.every((step)=>step.inside && !step.body),evidence:{ walk,screenshot:shot.file } });
    await census(page,`${id}:after-business`);
  }
}

async function tabToDescriptor(page, id, wanted, max = 120) {
  const path = [];
  for (let index = 0; index < max; index += 1) {
    const desc = await evaluate(page, "__visual.activeDesc()");
    path.push(desc);
    if (desc === wanted) { record("focus-target-by-trusted-Tab", { id, wanted, path }); return; }
    await press(page, "Tab");
  }
  pre(`${id}:trusted-Tab-reached-${wanted}`, false, { path });
}
async function tabToPrefix(page, id, prefix) {
  const matches = await evaluate(page, `__visual.tabbables().filter((name) => name.startsWith(${JSON.stringify(prefix)}))`);
  pre(`${id}:one-keyboard-target-for-${prefix}`, matches.length === 1, { matches });
  await tabToDescriptor(page, id, matches[0]);
}

async function runFocus(lang) {
  const page = mainPage;
  const probeCount = Number(process.env.XAI_NATIVE_FOCUS_PROBE ?? 0);
  const probe = Number.isInteger(probeCount) && probeCount > 0;
  if (probe && !process.env.XAI_NATIVE_EVIDENCE_DIR) throw Error("PRECONDITION: focus development subset may only write outside the repository");
  const themes = probe ? ["light"] : ["light", "dark"];
  const widths = probe ? [375] : [375, 768, 1440];
  record("focus-coverage-plan", { lang, themes, widths, styles: probe ? STYLES.slice(0, probeCount) : STYLES, zones: probe ? CITIES.slice(0, 1) : CITIES, subsetDevelopmentProbe: probe });
  for (const theme of themes) for (const width of widths) {
    const id = `H9:${lang}:${theme}:${width}`;
    await viewport(page, 768);
    await freshClock(page, id, lang, { xai_pref_theme: JSON.stringify(theme) }, { order: ["clock"] });
    const petName = facts0.labels[lang].nav.pet;
    await clickOne(page, `[...document.querySelectorAll('.app-rail .rail-bottom .rail-btn')].filter((button) => button.getAttribute('aria-label') === ${JSON.stringify(petName)})`, `${id}:hide-pet-at-768`);
    pre(`${id}:pet-hidden-by-product-button`, await evaluate(page, "!document.querySelector('.pet-wrap')"), { petName });
    await viewport(page, width);
    await evaluate(page, focusProbeSource);
    pre(`${id}:focus-probe-installed`, await evaluate(page, "!!window.__visual && typeof __visual.tabbables === 'function' && typeof __visual.focusInfo === 'function'"));
    const state = await evaluate(page, "({ width: innerWidth, height: innerHeight, htmlLang: document.documentElement.lang, clockLabel: verify.clock().trigger, theme: document.documentElement.getAttribute('data-theme'), pet: !!document.querySelector('.pet-wrap') })");
    pre(`${id}:language-theme-viewport-pet`, state.width === width && state.height === HEIGHTS[width] && state.clockLabel.includes(lang === "zh" ? "本地" : "Local") && state.theme === theme && !state.pet, { state });
    const oracle = createPixelOracle(page, width);
    for (const style of (probe ? STYLES.slice(0, probeCount) : STYLES)) {
      const pointer = await evaluate(page, `(() => { const target = document.querySelector(${JSON.stringify(CLOCK_SCOPE + ' [data-clock-style="' + style + '"]')}); const r = target?.getBoundingClientRect(); const hit = r ? document.elementFromPoint(r.left+r.width/2,r.top+r.height/2) : null; const chain = []; for (let e=hit; e && chain.length<8; e=e.parentElement) chain.push({ tag:e.tagName, className:typeof e.className==='string'?e.className:null, widget:e.getAttribute('data-widget-id'), style:e.getAttribute('data-clock-style') }); return { target: r ? { x:r.x,y:r.y,width:r.width,height:r.height } : null, centreHit:!!hit && target.contains(hit), hitChain:chain, scroll:{ x:scrollX,y:scrollY,visualX:visualViewport.pageLeft,visualY:visualViewport.pageTop }, focused:__visual.activeDesc() }; })()`);
      record("focus-style-pointer-geometry", { id: `${id}:style:${style}`, pointer });
      await tabToPrefix(page, `${id}:style-${style}`, `clock:style:${style}:`);
      await press(page, "Enter");
      pre(`${id}:trusted-keyboard-selected-${style}`, (await evaluate(page, "verify.clock().style")) === style);
      const walkId = `${id}:style:${style}`;
      const rows = await oracle.pixelFocusWalk(walkId, { anchor: `${CLOCK_SCOPE} .clock-sub` });
      const styleRows = rows.filter((row) => row.desc.startsWith("clock:style:"));
      const clockRows = rows.filter((row) => row.desc.startsWith("clock:"));
      verdict(`${walkId}:all-Clock-stops-visible`, { hypothesis: "H9", claim: "Every Clock-owned stop in the closed popover walk has visible pixel focus", requirement: "§9 per-stop focus", holds: clockRows.length === 5 && clockRows.every((row) => row.visible), evidence: { rows: clockRows.map((row) => ({ desc: row.desc, visible: row.visible, bandDiff: row.bandDiff, ownDiff: row.ownDiff })) } });
      const selected = styleRows.filter((row) => row.desc.endsWith(":selected"));
      verdict(`${walkId}:selected-and-unselected-style-pixel-focus`, { hypothesis: "H9", claim: "Each selected and unselected style control has visible pixel focus", requirement: "§9 per-stop focus", holds: styleRows.length === 4 && selected.length === 1 && selected[0].desc === `clock:style:${style}:selected` && styleRows.every((row) => row.visible), evidence: { rows: styleRows.map((row) => ({ desc: row.desc, visible: row.visible, bandDiff: row.bandDiff, ownDiff: row.ownDiff })) } });
      if (width === 1440 && style === "split") {
        await tabToDescriptor(page, `${walkId}:screenshot`, `clock:style:${style}:selected`);
        await screenshot(page, `${lang}-${theme}-focused-selected-style-1440`, { lang, theme, width, state: "trusted-Tab focused selected style after frozen pixel walk" });
      }
    }
    for (const zone of (probe ? CITIES.slice(0, 1) : CITIES)) {
      await chooseTimezone(page, id, zone);
      await trustedClick(page, `${CLOCK_SCOPE} .clk-tz-btn`, `${id}:open-popover-${zone}`);
      pre(`${id}:${zone}:popover-open`, await evaluate(page, "verify.clock().popoverOpen"));
      const walkId = `${id}:timezone:${zone}`;
      const rows = await oracle.pixelFocusWalk(walkId, { anchor: `${CLOCK_SCOPE} .clk-tz-popover` });
      const zoneRows = rows.filter((row) => row.desc.startsWith("clock:tz:"));
      const clockRows = rows.filter((row) => row.desc.startsWith("clock:"));
      verdict(`${walkId}:all-Clock-stops-visible`, { hypothesis: "H9", claim: "Every Clock-owned stop in the open popover walk has visible pixel focus", requirement: "§9 per-stop focus", holds: clockRows.length === 18 && clockRows.every((row) => row.visible), evidence: { rows: clockRows.map((row) => ({ desc: row.desc, visible: row.visible, bandDiff: row.bandDiff, ownDiff: row.ownDiff })) } });
      const active = zoneRows.filter((row) => row.desc.endsWith(":active"));
      verdict(`${walkId}:active-and-inactive-timezone-pixel-focus`, { hypothesis: "H9", claim: "Each active and inactive timezone item has visible pixel focus", requirement: "§9 per-stop focus", holds: zoneRows.length === 13 && active.length === 1 && active[0].desc === `clock:tz:${zone}:active` && zoneRows.every((row) => row.visible), evidence: { rows: zoneRows.map((row) => ({ desc: row.desc, visible: row.visible, bandDiff: row.bandDiff, ownDiff: row.ownDiff })) } });
      record("observation", { id: `${walkId}:UX-05-Tab-out`, popoverOpen: await evaluate(page, "verify.clock().popoverOpen"), transitions: rows.filter((row) => row.desc.startsWith("clock:tz:") && !row.next.startsWith("clock:tz:")).map((row) => ({ from: row.desc, to: row.next })) });
      if (zone === "shanghai" && width === 1440) {
        await tabToDescriptor(page, `${walkId}:screenshot`, `clock:tz:${zone}:active`);
        await screenshot(page, `${lang}-${theme}-focused-active-timezone-1440`, { lang, theme, width, state: "trusted-Tab focused active timezone after frozen pixel walk" });
      }
      if (zone === "shanghai" && width === 375) {
        await tabToDescriptor(page, `${walkId}:UX-05`, "clock:tz:la:inactive");
        await press(page, "Tab");
        const tabOut = await evaluate(page, `(() => { const focused = document.activeElement; const popup = document.querySelector(${JSON.stringify(CLOCK_SCOPE + " .clk-tz-popover")}); const a = focused?.getBoundingClientRect(); const b = popup?.getBoundingClientRect(); const intersection = a && b ? { width: Math.max(0, Math.min(a.right,b.right)-Math.max(a.left,b.left)), height: Math.max(0, Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)) } : null; const centreHit = a ? document.elementFromPoint(a.left+a.width/2,a.top+a.height/2) : null; return { desc: __visual.activeDesc(), isBody: focused === document.body, popupOpen: verify.clock().popoverOpen, intersection, centreCovered: !!centreHit && !focused?.contains(centreHit), centreHitClass: centreHit?.className ?? null }; })()`);
        pre(`${walkId}:UX-05-Tab-out-not-body`, !tabOut.isBody && tabOut.popupOpen, { tabOut });
        record("observation", { id: `${walkId}:UX-05-375-before-recovery-control-absence`, tabOut });
        await screenshot(page, `${lang}-${theme}-375-open-popover-Tab-out`, { lang, theme, width, state: "trusted-Tab after last timezone item, recovery controls absent before repair", tabOut });
      }
      await trustedClick(page, `${CLOCK_SCOPE} .popover-scrim`, `${id}:close-popover-${zone}`);
    }
    record("focus-width-summary", { id, walks: oracle.pixelWalkLog });
  }
}


// The accepted batch-48 pixel oracle runs in a Clock-specific adapter. Its block below is byte-identical to bacdbbc.
const nativeEvaluate = evaluate;
const nativePress = press;
function createPixelOracle(page, width) {
  const main = page;
  const currentWidth = width;
  const KEYBOARD_WIDTH = width;
  const PANE = CLOCK_SCOPE;
  const evaluate = (expression) => nativeEvaluate(page, expression);
  const press = (key) => nativePress(page, key);
  const checkDeferred = (id, condition, details = {}) => {
    if (id.endsWith(":every-tab-stop-has-visible-focus-computed-outline-not-none-and-focused-vs-moved-on-pixels-differ-in-its-own-ring-or-box")) {
      const clockFailures = (details.failed ?? []).filter((row) => row.desc?.startsWith("clock:"));
      const outsideClockFailures = (details.failed ?? []).filter((row) => !row.desc?.startsWith("clock:"));
      if (outsideClockFailures.length) record("observation", { id: `${id}:outside-Clock-ungated`, rows: outsideClockFailures });
      return verdict(id, { hypothesis: "H9", claim: "Clock-owned stops have a visible pixel focus change; the full walk records all outside stops", requirement: "§9 Clock focus scope", holds: clockFailures.length === 0, evidence: { ...details, clockFailures, outsideClockFailures } });
    }
    return verdict(id, { hypothesis: "H9", claim: id, requirement: "§9 frozen per-stop pixel focus walk", holds: condition, evidence: details });
  };
  const observe = (id, details = {}) => record("observation", { id, ...details });
  async function parkMouse() { await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 }); await delay(40); }
  async function clickAnchor(selector, label) {
    if (selector.endsWith(".clk-tz-popover")) {
      const view = await evaluate(`(() => { const popup = document.querySelector(${JSON.stringify(selector)}); const trigger = document.querySelector(${JSON.stringify(CLOCK_SCOPE + " .clk-tz-btn")}); const r = popup?.getBoundingClientRect(); const hit = r ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null; return { open: verify.clock().popoverOpen, triggerFocused: document.activeElement === trigger, popup: r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null, centreHit: hit?.className ?? null, scrimCoversCentre: !!hit?.closest('.popover-scrim') }; })()`);
      record("observation", { id: `${label}:unchanged-popover-pointer-obstruction`, view });
      pre(`${label}:trusted-trigger-click-established-keyboard-anchor`, view.open && view.triggerFocused && view.popup !== null, { view });
      return;
    }
    await trustedClick(page, selector, label);
    const focus = await evaluate("__visual.focusInfo()");
    pre(`${label}:anchor-is-not-focusable`, focus.isBody || !focus.inPane || focus.desc.startsWith("clock:part"), { focus });
  }
  const pageOffset = () => evaluate("({ x: visualViewport.pageLeft, y: visualViewport.pageTop, scrollX, scrollY, scale: visualViewport.scale })");
  async function saveShot(name, data, details) {
    const file = `native-${short}-${suffix}-${mode}-${name}.png`;
    pre(`screenshot:${name}:not-overwritten`, !existsSync(join(evidenceDir, file)), { file });
    const buffer = Buffer.from(data, "base64");
    writeFileSync(join(evidenceDir, file), buffer, { flag: "wx" });
    const item = { file, sha256: sha256(buffer), bytes: buffer.length, ...details };
    artifacts.push(item); record("screenshot", item);
    return item;
  }
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

  return { pixelFocusWalk, pixelWalkLog };
}


try {
  mkdirSync(snapshot);
  const archive = await extractArchive(snapshot);
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
  const pinAndGuard = { name: "clock-native-before-archive-pin-guard", setup(buildApi) {
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
    define: { "import.meta.env": "{}", __NATIVE_VARIANT__: JSON.stringify("app") },
  });
  const js = built.outputFiles.find((file) => file.path.endsWith(".js")).text;
  const css = built.outputFiles.find((file) => file.path.endsWith(".css")).text;
  moduleIndex = js.split("\n").map((text, line) => ({ line, text })).filter((entry) => /^\/\/ \S+\.(tsx?|m?js|cjs|jsx|json|css)$/.test(entry.text)).map((entry) => ({ line: entry.line, module: entry.text.slice(3) }));
  const inputs = Object.keys(built.metafile.inputs);
  const archiveInputs = inputs.filter((entry) => !entry.startsWith("../") && entry !== FIXTURE && !entry.startsWith("<define:"));
  const thirdParty = inputs.filter((entry) => entry.includes("node_modules/"));
  const foreign = inputs.filter((entry) => entry.startsWith("../") && !entry.includes("node_modules/"));
  const missingRequired = REQUIRED_MODULES.filter((file) => !inputs.includes(file) || (!archiveModules.has(file) && !file.endsWith(".css")));
  const requiredHashes = Object.fromEntries(REQUIRED_MODULES.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const contractSourceActual = Object.fromEntries(Object.keys(CONTRACT_SOURCE_HASHES).map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const contractMismatches = Object.entries(CONTRACT_SOURCE_HASHES).filter(([file, hash]) => contractSourceActual[file] !== hash && !fixedProductChanges.some((entry) => entry.path === file && allowedFixedChange(entry))).map(([file]) => file);
  const packageTrees = Object.fromEntries(["packages/xai-web-shell", "apps/web"].map((path) => [path, execFileSync("git", ["rev-parse", `${resolved}:${path}`], { cwd: root, encoding: "utf8" }).trim()]));

  const appPage = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>XAI Web (Dashboard Clock native before, ${mode})</title><link rel="stylesheet" href="/__native/bundle.css"><script src="/__native/prelude.js"></script></head><body><div id="root"></div><script type="module" src="/__native/bundle.js"></script></body></html>`;
  const seedPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>seed</title><script src="/__native/prelude.js"></script></head><body><p>seed page: prelude only, no product code</p></body></html>';
  const externalPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Independent same-origin document</title></head><body><p>second document: no product code, no instruments</p></body></html>';
  const served = {};
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

  browser = await launch();
  mkdirSync(downloads);
  await browser.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
  let firstTarget = null;
  for (let attempt = 0; attempt < 200 && !firstTarget; attempt += 1) {
    const { targetInfos } = await Promise.race([browser.send("Target.getTargets"), delay(5000).then(() => ({ targetInfos: [] }))]);
    firstTarget = targetInfos.find((target) => target.type === "page") ?? null;
    if (!firstTarget) await delay(50);
  }
  pre("session:page-target-over-the-devtools-pipe", Boolean(firstTarget));
  const viewport = { width: 1440, height: 900 };
  mainPage = await attachPage(firstTarget.targetId, "A", viewport);
  await mainPage.cdp("Page.bringToFront");
  const version = await browser.send("Browser.getVersion");
  record("baseline", {
    requested, resolved, resolvedTree, packageTrees, docsHead, productDeltaVsDocsHead: productDelta, fixedProductChanges, mode, suffix, composition: "production-app", viewport, archive,
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock), extracted: sha256(extractedLock), contractGate: LOCKFILE_GATE_SHA256 },
    fileSha256: { "verify-native-modal.mjs": runnerSha256, [FIXTURE]: sha256(fixtureSource), [PRELUDE]: sha256(preludeSource), "native-clock-focus-probes.js": sha256(focusProbeSource) },
    frozenPixelOracle: { commit: ORACLE_COMMIT, path: ORACLE_PATH, fileSha256: sha256(frozenOracleSource), gitCommitFileSha256: sha256(oracleAtCommit), ownBlockSha256: sha256(ownOracle.block), frozenBlockSha256: sha256(frozenOracle.block), ownFunctionSha256: sha256(ownOracle.fn), frozenFunctionSha256: sha256(frozenOracle.fn), bytes: Buffer.byteLength(ownOracle.block) },
    contract: { path: CONTRACT_PATH, sha256AtHead: contractSha256, expected: CONTRACT_SHA256 },
    bundleSha256: sha256(js), bundleCssSha256: sha256(css), bundleModuleComments: moduleIndex.length,
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
    requiredModules: { count: REQUIRED_MODULES.length, missing: missingRequired, sha256: requiredHashes },
    contractSourceTable: { rows: Object.keys(CONTRACT_SOURCE_HASHES).length, mismatches: contractMismatches, sha256: contractSourceActual },
    origin: "127.0.0.1 (ephemeral port, this runner's own server); every other host resolves to NOTFOUND",
    devtools: "pipe transport (--remote-debugging-pipe), flattened target sessions; trusted input through Input.dispatchMouseEvent/dispatchDragEvent (setInterceptDrags) and Input.dispatchKeyEvent without nativeVirtualKeyCode",
  });
  pre("baseline:docs-head-product-tree-equals-revision", productDelta === "", { productDelta });
  pre("baseline:before-or-scoped-fixed-product", resolved === BEFORE_SHA ? archive.bytes === 148408320 : fixedProductChanges.length > 0 && fixedProductChanges.every(allowedFixedChange) && widgetInternalNew.length <= 3 && gridInternalNew.length <= 1, { requested, resolved, fixedProductChanges, widgetInternalNew, gridInternalNew, archiveBytes: archive.bytes });
  pre("baseline:streamed-archive-measured", archive.bytes > 0 && /^[a-f0-9]{64}$/.test(archive.sha256), { archive });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === LOCKFILE_GATE_SHA256 && sha256(archiveLock) === LOCKFILE_GATE_SHA256 && sha256(extractedLock) === LOCKFILE_GATE_SHA256);
  pre("baseline:contract-r2-hash", contractSha256 === CONTRACT_SHA256 && sha256(readFileSync(join(root, CONTRACT_PATH))) === CONTRACT_SHA256, { contractSha256 });
  pre("baseline:bacdbbc-frozen-pixel-oracle-byte-identity", sha256(frozenOracleSource) === ORACLE_FILE_SHA256 && sha256(oracleAtCommit) === ORACLE_FILE_SHA256 && sha256(ownOracle.block) === ORACLE_BLOCK_SHA256 && sha256(frozenOracle.block) === ORACLE_BLOCK_SHA256 && sha256(ownOracle.fn) === ORACLE_FUNCTION_SHA256 && sha256(frozenOracle.fn) === ORACLE_FUNCTION_SHA256 && ownOracle.block === frozenOracle.block && ownOracle.fn === frozenOracle.fn);
  pre("baseline:contract-r2-protected-source-table-50-equal", Object.keys(CONTRACT_SOURCE_HASHES).length === 50 && contractMismatches.length === 0, { contractMismatches, fixedProductChanges });
  pre("baseline:guard-no-module-from-a-checkout", guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre("baseline:every-required-module-bundled-from-archive", missingRequired.length === 0, { missingRequired });

  await runModal();
  currentCase = null;

  await collectDocument(mainPage, "end-of-run");
  record("observation", { id: "run:network-and-requests", network: networkSeen, served });
  record("observation", { id: "k1:keyboard-audit", dispatch: "rawKeyDown + keyUp with key, code and windowsVirtualKeyCode only (no nativeVirtualKeyCode)", ...keyboardAudit });
  pre("run:no-non-local-network-attempt", networkSeen.nonLocal === 0, { networkSeen });
  pre("run:k1-keyboard-trace-contains-only-the-runner-key-presses", keyboardAudit.mismatches.length === 0 && keyboardAudit.keydowns === keyboardAudit.runnerPresses
    && keyboardAudit.keyups === keyboardAudit.runnerPresses && keyboardAudit.untrusted === 0, keyboardAudit);
  pre("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs: dialogs.filter((entry) => !entry.expected) });
  const selfTestError = (entry) => entry.kind === "console.error" && entry.text === "native apprail prelude self-test error trace" && String(entry.source?.url ?? "").endsWith("/__native/prelude.js");
  const unexpectedErrors = runtimeErrors.filter((entry) => !entry.allowed && !selfTestError(entry));
  record("observation", { id: "run:runtime-errors", total: runtimeErrors.length, inCasesWhereErrorsAreTheSubject: runtimeErrors.length - unexpectedErrors.length, outside: unexpectedErrors.length, samplesOutside: unexpectedErrors.slice(0, 5) });
  pre("run:no-renderer-crash", !runtimeErrors.some((entry) => entry.kind === "renderer-crash"));
  verdict("run:zero-product-runtime-errors", {
    hypothesis: "run-level gate", claim: "No product runtime errors in Clock before cases",
    requirement: "§9 runtime-error gates", holds: unexpectedErrors.length === 0, evidence: { samples: unexpectedErrors.slice(0, 5) },
  });
} catch (error) {
  harnessError = error;
} finally {
  const productFailures = verdicts.filter((entry) => !entry.requirementHolds);
  const warningGroups = {};
  for (const warning of consoleWarnings) {
    const key = `${warning.text.slice(0, 160)} @ ${warning.source?.module ?? warning.source?.url ?? "unknown"}`;
    warningGroups[key] = (warningGroups[key] ?? 0) + 1;
  }
  record("result", {
    harnessValid: harnessError === null, mode, checks, verdicts, facts,
    requirementFailures: productFailures.map((entry) => entry.id),
    browser: browser ? { pid: browser.pid, closeReason: browser.closeReason ?? null, processExit: browser.processExit ?? null } : null,
    runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 6).map((entry) => ({ ...entry, text: entry.text.slice(0, 240) })),
    consoleWarnings: consoleWarnings.length, consoleWarningsBySource: warningGroups,
    dialogs, navigationRequests, unusedDialogPlans: dialogPlan, artifacts: artifacts.map((entry) => ({ file: entry.file, sha256: entry.sha256 })), keyboardAudit, network: networkSeen,
    ...(harnessError ? { error: String(harnessError?.stack ?? harnessError).slice(0, 1500), checkId: harnessError?.checkId ?? null, checkKind: harnessError?.checkKind ?? null } : {}),
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
  process.exitCode = harnessError ? 1 : productFailures.length ? 2 : 0;
  const summary = verdicts.map((entry) => `${entry.id}=${entry.requirementHolds ? "PASS" : "FAIL"}`).join(" ");
  console.log(`${harnessError ? "HARNESS-FAIL" : "VALID"} ${relative(root, evidencePath)} checks=${checks} exit=${process.exitCode} ${summary}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
  setTimeout(() => process.exit(process.exitCode), 500).unref();
}

// ---------------------------------------------------------------------------------------------------
// Clock-specific native observations. Every selector below is a public DOM selector from contract r2.
