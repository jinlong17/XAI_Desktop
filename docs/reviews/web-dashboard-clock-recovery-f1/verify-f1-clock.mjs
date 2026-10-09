/**
 * CP-CLOCK-01 batch 70, E5: Clock F1-shape native BEFORE oracle.
 * Adapted from the accepted AppRail F1 runner's pipe/CDP, archive guard and
 * coordinator instrumentation. Clock cases c1-c5 are authored for contract r2.
 * Only the production App and a synthetic auth session are used.
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
const FROZEN_PRELUDE = "docs/reviews/web-sticky-recovery-f1/f1-prelude.js";
const FROZEN_PRELUDE_SHA256 = "67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670";
const LOCKFILE_GATE_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const CONTRACT_PATH = "docs/reviews/web-dashboard-clock-recovery-contract/contract.md";
const CONTRACT_SHA256 = "214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae";
/** The reused Appearance F1 files (read for the record only; never imported, executed or modified). */
const REFERENCES = {
  "docs/reviews/web-appearance-recovery-f1/verify-f1-appearance.mjs": "f570b5c9a29d13a59aa3abe3436552a4f90e1107849a7430259cf58513e1f328",
  "docs/reviews/web-appearance-recovery-f1/f1-appearance-host.tsx": "19b4601f971c8892e674651244541f7e9635027dc5fe2cb56187a9a71a3dadef",
  "docs/reviews/web-native-keyinput-k1/verify-f1-appearance-k1.mjs": "e9fbc5905fbace2c5716190baf7e93fd2295bb890b663cb7fd7c90ca2115896d",
};
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_F1_EVIDENCE_DIR ?? output;
if (process.env.XAI_F1_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
if (!requested) throw Error("Revision required");
if (!["selfcheck", "clock"].includes(mode)) throw Error(`Unsupported mode ${mode}; use selfcheck|clock`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const resolved = execFileSync("git", ["rev-parse", "--verify", `${requested}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const resolvedTree = execFileSync("git", ["rev-parse", `${resolved}^{tree}`], { cwd: root, encoding: "utf8" }).trim();
const short = resolved.slice(0, 7);
const evidencePath = join(evidenceDir, `f1-${short}-${mode}-${suffix}.log`);
if (existsSync(evidencePath)) throw Error("Evidence exists; use a distinct suffix");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const progress = (text) => process.stderr.write(`[f1-clock ${mode}] ${new Date().toISOString().slice(11, 19)} ${text}\n`);
const records = [];
const runtimeErrors = [];
const consoleWarnings = [];
const dialogs = [];
const dialogPlan = [];
const navigationRequests = [];
const frameNavigations = [];
const record = (name, value = {}) => {
  const { name: detailName, ...rest } = value;
  records.push({ name, ...rest, ...(detailName !== undefined ? { detailName } : {}) });
  if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 400));
};
let checks = 0;
let lastCheckId = null;
const pre = (id, condition, details = {}) => {
  checks += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { id, kind: "precondition", pass, ...details });
  if (!pass) throw Object.assign(new Error(`PRECONDITION: ${id}`), { checkId: id, checkKind: "precondition" });
};
const deferredFailures = [];
const observe = (id, condition, details = {}) => {
  checks += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { id, kind: "product", deferred: true, pass, ...details });
  if (!pass) deferredFailures.push(id);
  return pass;
};

// ---------------------------------------------------------------------------------------------------
// Frozen prelude (read-only), consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const preludeBuffer = readFileSync(join(root, FROZEN_PRELUDE));
const preludeSha256 = sha256(preludeBuffer);
const committedPreludeSha256 = sha256(execFileSync("git", ["show", `HEAD:${FROZEN_PRELUDE}`], { cwd: root, maxBuffer: 10 * 1024 * 1024 }));
const preludeLastCommit = execFileSync("git", ["log", "-1", "--format=%H", "--", FROZEN_PRELUDE], { cwd: root, encoding: "utf8" }).trim();
if (preludeSha256 !== FROZEN_PRELUDE_SHA256 || committedPreludeSha256 !== FROZEN_PRELUDE_SHA256) {
  throw Error(`PRECONDITION: frozen prelude hash mismatch (working ${preludeSha256}, committed ${committedPreludeSha256})`);
}
const preludeSource = preludeBuffer.toString("utf8");
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const FIXTURE = "f1-clock-host.tsx";
const fixtureSource = readFileSync(join(output, FIXTURE), "utf8");
const referenceSha256 = Object.fromEntries(Object.keys(REFERENCES).map((path) => [path, existsSync(join(root, path)) ? sha256(readFileSync(join(root, path))) : null]));
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
const fixedProductChanges = resolved === "f9eb4b1f207bc4b46f547b90afc250424b3c8695" ? [] : execFileSync("git", ["diff", "--name-status", "f9eb4b1f207bc4b46f547b90afc250424b3c8695", resolved, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean).map((line) => { const [status, path] = line.split("\t"); return { status, path }; });
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
const REQUIRED_MODULES = [
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/RouteGateElements.tsx",
  "apps/web/src/routes/RouteErrorBoundary.tsx",
  "apps/web/src/providers/AccountStorageGate.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/settingsDeparture.ts",
  "apps/web/src/routes/modules/settingsPaneComposition.ts",
  "apps/web/src/routes/modules/shellRegistrations.tsx",
  "packages/plugin-web-settings-rest/src/panes/morePane.tsx",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/Topbar.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/internal/dnd.ts",
  "packages/xai-web-shell/src/registry.tsx",
  "packages/xai-web-shell/src/AvatarMenu.tsx",
  "packages/xai-web-shell/src/SignOutConfirmDialog.tsx",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/storage.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/xai-web-dashboard-grid/src/DashboardModule.tsx",
  "packages/xai-web-dashboard-grid/src/DashHeader.tsx",
  "packages/xai-web-dashboard-widgets/src/widgets/ClockWidget.tsx",
  "apps/web/src/routes/modules/dashboardRegistration.tsx",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/guards.tsx",
];

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-f1-clock-")));
const snapshot = join(directory, "source");
const profile = join(directory, "profile");
let server = null;
let session = null;
let origin = "";

// ---------------------------------------------------------------------------------------------------
// Browser session over the DevTools PIPE transport, one flattened page session
// ---------------------------------------------------------------------------------------------------
async function launch() {
  const proc = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
    "--disable-component-update", "--disable-sync", "--disable-default-apps", "--disable-domain-reliability",
    "--disable-client-side-phishing-detection", "--metrics-recording-only", "--use-mock-keychain",
    "--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1",
    "--remote-debugging-pipe", `--user-data-dir=${profile}`, "--window-size=1280,900", "about:blank",
  ], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
  const exited = new Promise((resolve) => proc.once("exit", (code, signal) => resolve({ code, signal })));
  const writer = proc.stdio[3];
  const reader = proc.stdio[4];
  const pending = new Map();
  let commandId = 0;
  const state = { proc, exited, pending, open: true, runnerNavigating: false, sessionId: null, intercepted: [], pid: proc.pid };
  const handle = (message) => {
    if (!message.method || !message.sessionId || message.sessionId !== state.sessionId) return;
    if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails ?? {};
      runtimeErrors.push({ kind: "exception", afterCheck: lastCheckId, text: String(details.exception?.description ?? details.text ?? "").slice(0, 600) });
    } else if (message.method === "Runtime.consoleAPICalled") {
      const text = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ").slice(0, 600);
      if (message.params.type === "error" || message.params.type === "assert") runtimeErrors.push({ kind: `console.${message.params.type}`, afterCheck: lastCheckId, text });
      else if (message.params.type === "warning") consoleWarnings.push(text.slice(0, 200));
    } else if (message.method === "Inspector.targetCrashed") {
      runtimeErrors.push({ kind: "renderer-crash", afterCheck: lastCheckId, text: "Inspector.targetCrashed" });
    } else if (message.method === "Page.javascriptDialogOpening") {
      if (message.params.type === "beforeunload" && state.runnerNavigating) {
        dialogs.push({ type: "beforeunload", message: message.params.message, expected: true, accepted: true, reason: "runner-initiated navigation", afterCheck: lastCheckId });
        state.cdp("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
      } else {
        const plan = dialogPlan.shift() ?? null;
        dialogs.push({ type: message.params.type, message: message.params.message, expected: Boolean(plan), accepted: plan ? plan.accept : false, purpose: plan?.purpose ?? null, afterCheck: lastCheckId });
        state.cdp("Page.handleJavaScriptDialog", { accept: plan ? plan.accept : false }).catch(() => {});
      }
    } else if (message.method === "Fetch.requestPaused") {
      navigationRequests.push({ url: message.params.request.url, resourceType: message.params.resourceType, afterCheck: lastCheckId, at: Date.now() });
      state.cdp("Fetch.fulfillRequest", { requestId: message.params.requestId, responseCode: 204, responseHeaders: [{ name: "Cache-Control", value: "no-store" }], body: "" }).catch(() => {});
    } else if (message.method === "Page.frameRequestedNavigation") {
      frameNavigations.push({ url: message.params.url, reason: message.params.reason, disposition: message.params.disposition, afterCheck: lastCheckId });
    } else if (message.method === "Input.dragIntercepted") {
      state.intercepted.push(message.params.data);
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
      try { message = JSON.parse(text); } catch { continue; }
      try { handle(message); } catch (error) { record("devtools-event-handler-error", { afterCheck: lastCheckId, error: String(error).slice(0, 300) }); }
      if (message.id && pending.has(message.id)) {
        const job = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) job.reject(Error(JSON.stringify(message.error)));
        else job.resolve(message.result);
      }
    }
    if (start < chunk.length) chunks.push(chunk.subarray(start));
  });
  const closed = (why) => {
    if (!state.open) return;
    state.open = false;
    state.closeReason = { why, afterCheck: lastCheckId };
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
  let page = null;
  for (let attempt = 0; attempt < 200 && !page; attempt += 1) {
    const { targetInfos } = await Promise.race([state.send("Target.getTargets"), delay(5000).then(() => ({ targetInfos: [] }))]);
    page = targetInfos.find((target) => target.type === "page") ?? null;
    if (!page) await delay(50);
  }
  if (!page) throw Error("PRECONDITION: no page target over the DevTools pipe");
  const { sessionId } = await state.send("Target.attachToTarget", { targetId: page.targetId, flatten: true });
  state.sessionId = sessionId;
  state.cdp = (method, params = {}) => state.send(method, params, sessionId);
  return state;
}
const rawCdp = (method, params) => {
  if (!session) throw Error("No browser session");
  return session.cdp(method, params);
};
// K-1 key audit: read the leaving document's recorder before every navigation or reload.
const cdp = async (method, params) => {
  if (method === "Page.navigate" || method === "Page.reload") await k1Collect(method);
  return rawCdp(method, params);
};
const K1_AUDIT_SOURCE = `(() => {
  if (Object.prototype.hasOwnProperty.call(window, "__k1audit")) return;
  const audit = { keydown: 0, keyup: 0, keypress: 0, untrusted: 0, sequence: [], counts: {} };
  Object.defineProperty(window, "__k1audit", { value: audit, enumerable: false });
  const onKey = (event) => {
    audit[event.type] += 1;
    if (!event.isTrusted) audit.untrusted += 1;
    if (audit.sequence.length < 400) audit.sequence.push(event.type + ":" + event.key + ":" + event.code);
    const id = event.type + "|" + event.key + "|" + event.code + "|" + event.keyCode;
    audit.counts[id] = (audit.counts[id] || 0) + 1;
  };
  for (const type of ["keydown", "keypress", "keyup"]) window.addEventListener(type, onKey, true);
})();`;
const k1 = { pending: [], documents: [] };
async function k1Collect(reason) {
  let audit = null;
  try {
    const result = await rawCdp("Runtime.evaluate", { expression: "window.__k1audit ? JSON.parse(JSON.stringify(window.__k1audit)) : null", returnByValue: true });
    audit = result?.result?.value ?? null;
  } catch { audit = null; }
  const presses = k1.pending;
  k1.pending = [];
  if (audit === null && presses.length === 0) return;
  const expectedSequence = presses.flatMap((key) => [`keydown:${key}:${key}`, `keyup:${key}:${key}`]);
  const ok = audit !== null && audit.keydown === presses.length && audit.keyup === presses.length && audit.keypress === 0 && audit.untrusted === 0
    && isDeepStrictEqual(audit.sequence, expectedSequence);
  k1.documents.push({ reason, afterCheck: lastCheckId, presses: presses.length, keydown: audit?.keydown ?? null, keyup: audit?.keyup ?? null, keypress: audit?.keypress ?? null, untrusted: audit?.untrusted ?? null, ok,
    ...(ok ? {} : { counts: audit?.counts ?? null, sequenceHead: audit?.sequence.slice(0, 12) ?? null }) });
}
const evaluate = async (expression) => {
  const result = await Promise.race([rawCdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }), delay(20000).then(() => ({ timedOut: true }))]);
  if (result.timedOut) throw Object.assign(Error("PRECONDITION: page evaluation did not answer within 20000 ms"), { checkId: "harness:page-evaluation-timeout", checkKind: "precondition" });
  if (result.exceptionDetails) throw Error(`Page evaluation failed: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`);
  return result.result.value;
};
const waitUntil = async (expression, timeout = 6000) => {
  const deadline = Date.now() + timeout;
  for (;;) {
    try {
      if (await evaluate(expression)) return true;
    } catch (error) { if (error?.checkKind === "precondition") throw error; }
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
  current.send("Browser.close").catch(() => {});
  const graceful = await Promise.race([current.exited.then(() => true), delay(8000).then(() => false)]);
  if (!graceful) {
    current.proc.kill("SIGTERM");
    await Promise.race([current.exited, delay(3000)]);
    if (current.proc.exitCode === null && current.proc.signalCode === null) current.proc.kill("SIGKILL");
  }
}

async function pointOf(selector, label) {
  const found = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return false; element.scrollIntoView({ block: "center", inline: "nearest" }); return true; })()`);
  pre(`input:control-present:${label}`, found, { selector });
  await delay(120);
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { x, y, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + (typeof hit.className === "string" ? hit.className : "") : null };
  })()`);
  pre(`input:hit-test:${label}`, point.hit, { selector, hitTarget: point.hitTarget });
  return point;
}
async function trustedClick(selector, label) {
  const point = await pointOf(selector, label);
  await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(80);
}
async function pressEscape() {
  k1.pending.push("Escape");
  // K-1: no nativeVirtualKeyCode (as press() in ../web-appearance-recovery-native/verify-native-fixed.mjs).
  await cdp("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await delay(80);
}
/** Tags exactly one element whose accessible name (aria-label, else text) equals `name` inside `scope`. */
async function tagNamed(selector, name, scope, label) {
  const found = await evaluate(`(() => {
    document.querySelectorAll("[data-f1-target]").forEach((element) => element.removeAttribute("data-f1-target"));
    const root = document.querySelector(${JSON.stringify(scope)});
    const matches = root ? [...root.querySelectorAll(${JSON.stringify(selector)})].filter((element) => ((element.getAttribute("aria-label") ?? element.textContent) || "").replace(/\\s+/g, " ").trim() === ${JSON.stringify(name)}) : [];
    if (matches.length === 1) matches[0].setAttribute("data-f1-target", "1");
    return matches.length;
  })()`);
  pre(`input:exactly-one-control:${label}`, found === 1, { selector, controlName: name, scope, found });
  return '[data-f1-target="1"]';
}
async function clickNamed(selector, name, scope, label) {
  const target = await tagNamed(selector, name, scope, label);
  await trustedClick(target, label);
  await evaluate('document.querySelector("[data-f1-target]")?.removeAttribute("data-f1-target")');
}
const buttonPresent = (name, scope = ".settings-detail") => evaluate(`[...(document.querySelector(${JSON.stringify(scope)})?.querySelectorAll("button") ?? [])].some((button) => (button.getAttribute("aria-label") ?? button.textContent).replace(/\\s+/g, " ").trim() === ${JSON.stringify(name)})`);

/** Compact, sequence-ordered timeline of one window (all instruments share the prelude's sequence). */
function timeline(view, keys) {
  const items = [];
  const blockerText = (list) => `[${list.join(",")}]`;
  for (const entry of view.clicks) items.push([entry.seq, `click ${entry.target}${entry.trusted ? "" : " (untrusted)"}`]);
  for (const entry of view.drags) if (entry.type !== "dragover" && entry.type !== "dragenter" && entry.type !== "dragleave") items.push([entry.seq, `${entry.type} ${entry.target}${entry.trusted ? "" : " (untrusted)"}`]);
  for (const entry of view.locks) if (keys.some((key) => entry.name.includes(key))) items.push([entry.seq, `lock-request ${entry.name}`]);
  for (const entry of view.attempts) if (keys.includes(entry.key)) items.push([entry.seq, `${entry.op} ${entry.key} ${entry.value ?? ""} ${entry.outcome}`.replace(/\s+/g, " ").trim()]);
  for (const entry of view.blockerCalls) items.push([entry.seq, `${entry.op.toUpperCase()} blocker#${entry.blocker} live=#${entry.liveBlocker}:${entry.liveState}${entry.threw ? ` THREW ${entry.threw}` : ""}`]);
  for (const entry of view.navigateCalls) items.push([entry.seq, `router.navigate(${entry.to})${entry.replace ? " replace" : ""} from ${entry.path}`]);
  for (const entry of view.router) items.push([entry.seq, `router ${entry.action} ${entry.path}#${entry.key} blockers=${blockerText(entry.blockers)}`]);
  for (const entry of view.pops) items.push([entry.seq, `popstate ${entry.path}#${entry.key}`]);
  for (const entry of view.history) items.push([entry.seq, `${entry.method} ${entry.url}`]);
  for (const entry of view.storageDispatches) items.push([entry.seq, `dispatchEvent StorageEvent key=${entry.key}`]);
  for (const entry of view.scope) items.push([entry.seq, `scope ${entry.kind}:${entry.accountId}:${entry.generation}:epoch${entry.epoch}`]);
  for (const entry of view.auth) items.push([entry.seq, `auth ${entry.call}`]);
  for (const entry of view.react) {
    if (!entry.coord) continue;
    items.push([entry.seq, `react-commit p${entry.prio} coordinator blocker#${entry.coord.b}:${entry.coord.s} gv=${entry.coord.gv} iv=${entry.coord.iv} live=#${entry.live?.id}:${entry.live?.state}${isStale(entry) ? " STALE" : ""}`]);
  }
  for (const entry of view.consoleErrors) items.push([entry.seq, `console.error ${entry.text.slice(0, 140)}`]);
  for (const entry of view.errorUi) items.push([entry.seq, `ERROR-UI ${entry.path} ${entry.text.slice(0, 80)}`]);
  items.sort((left, right) => left[0] - right[0]);
  return items.slice(0, 220).map(([seq, text]) => `${seq} ${text}`);
}
const isStale = (entry) => Boolean(entry.coord && entry.coord.s === "blocked"
  && (!entry.live || entry.live.id !== entry.coord.b || entry.live.state !== "blocked"));
/** F1-signature counts of one window (the oracle of the F1 impact review and verify-f1-appearance.mjs). */
function f1Counts(view, cdpErrors) {
  const proceeds = view.blockerCalls.filter((entry) => entry.op === "proceed");
  const perBlocker = new Map();
  for (const entry of proceeds) perBlocker.set(entry.blocker, (perBlocker.get(entry.blocker) ?? 0) + 1);
  const duplicateProceeds = [...perBlocker.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0);
  const nonLive = view.blockerCalls.filter((entry) => entry.blocker !== entry.liveBlocker || entry.liveState !== "blocked");
  const invalidTransition = view.blockerCalls.filter((entry) => /Invalid blocker state transition/.test(entry.threw ?? ""));
  const runtime = view.consoleErrors.length + view.errorUi.length + cdpErrors.length;
  return {
    proceeds: proceeds.length, resets: view.blockerCalls.filter((entry) => entry.op === "reset").length, duplicateProceeds,
    nonLiveBlockerCalls: nonLive.length, invalidTransitionThrows: invalidTransition.length, runtimeErrors: runtime,
    consoleErrors: view.consoleErrors.length, errorUi: view.errorUi.length, cdpRuntimeErrors: cdpErrors.length,
    staleCommits: view.react.filter(isStale).length,
    f1Signature: duplicateProceeds > 0 || nonLive.length > 0 || invalidTransition.length > 0,
  };
}

// ---------------------------------------------------------------------------------------------------
// Clock contract r2 surfaces; the rail sign-out copy is the accepted AppRail text.
// ---------------------------------------------------------------------------------------------------
const MORE = { route: "/app/settings/more", pane: "more", key: "xai_pref_more_launch_at_login", toggle: '.settings-detail [role="switch"][aria-label="Launch at Login"]',
  failed: "Launch at Login was not saved.", retry: "Retry Launch at Login", discard: "Discard Launch at Login", label: "Unsaved More draft" };
const RAIL_KEY = "xai_rail_order";
const RAIL_SIGN_OUT_TEXT = "Your sidebar order change is not saved. Sign out and discard it?";
const RAIL_STATUS_NAME = "Sidebar order not saved. Review it.";
const DIALOG = ".settings-departure-dialog";
const P_ENTRY = { pathname: "/app/settings/about", state: { token: "f1-clock-P" } };
const READY = (pane) => `(() => !!window.verify && verify.ready()${pane ? ` && verify.paneId() === ${JSON.stringify(pane)}` : ""})()`;
const ZERO_SIGNATURE = { duplicateProceeds: 0, nonLiveBlockerCalls: 0, runtimeErrors: 0 };
const CLOCK_STYLE = "xai_clock_style";
const CLOCK_TZ = "xai_clock_tz";
const DASH_ORDER = "xai_dash_order";
const CLOCK_SCOPE = '.widget-shell[data-widget-id="clock"] .w-clock-body';
const BEFORE_SHA = "f9eb4b1f207bc4b46f547b90afc250424b3c8695";

async function extractArchive(target) {
  return new Promise((resolve, reject) => {
    const archive = spawn("git", ["archive", resolved], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    const tar = spawn("tar", ["-x", "-C", target], { stdio: ["pipe", "ignore", "pipe"] });
    const digest = createHash("sha256");
    let bytes = 0, archiveCode = null, tarCode = null, archiveError = "", tarError = "", settled = false;
    const fail = (error) => { if (!settled) { settled = true; reject(error); } };
    const finish = () => {
      if (archiveCode === null || tarCode === null || settled) return;
      settled = true;
      if (archiveCode !== 0 || tarCode !== 0) reject(Error(`git archive exit ${archiveCode} (${archiveError}); tar exit ${tarCode} (${tarError})`));
      else resolve({ method: "streamed git archive | tar", bytes, sha256: digest.digest("hex") });
    };
    archive.stdout.on("data", (chunk) => { bytes += chunk.length; digest.update(chunk); });
    archive.stdout.pipe(tar.stdin);
    archive.stderr.on("data", (chunk) => { archiveError += chunk; });
    tar.stderr.on("data", (chunk) => { tarError += chunk; });
    archive.on("error", fail); tar.on("error", fail);
    archive.on("close", (code) => { archiveCode = code; finish(); });
    tar.on("close", (code) => { tarCode = code; finish(); });
  });
}

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
const outcomes = [];
let harnessError = null;
let runVerdict = null;
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
  const pinAndGuard = { name: "clock-f1-archive-pin-guard", setup(buildApi) {
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
  const archiveInputs = inputs.filter((entry) => !entry.startsWith("../") && entry !== FIXTURE && !entry.startsWith("<define:"));
  const thirdParty = inputs.filter((entry) => entry.includes("node_modules/"));
  const foreign = inputs.filter((entry) => entry.startsWith("../") && !entry.includes("node_modules/"));
  const missingRequired = REQUIRED_MODULES.filter((file) => !inputs.includes(file) || !archiveModules.has(file));
  const productHashes = Object.fromEntries(REQUIRED_MODULES.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dashboard Clock F1 fixture</title><link rel="stylesheet" href="/__f1/bundle.css"><script src="/__f1/prelude.js"></script></head><body><div id="app"></div><script type="module" src="/__f1/bundle.js"></script></body></html>';
  server = createServer((request, response) => {
    response.setHeader("Cache-Control", "no-store");
    if (request.url === "/__f1/prelude.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(preludeSource); return; }
    if (request.url === "/__f1/bundle.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(js); return; }
    if (request.url === "/__f1/bundle.css") { response.setHeader("Content-Type", "text/css; charset=utf-8"); response.end(css); return; }
    if (request.url === "/favicon.ico") { response.statusCode = 204; response.end(); return; }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(page);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;

  session = await launch();
  await rawCdp("Runtime.enable");
  await rawCdp("Page.enable");
  await rawCdp("Inspector.enable");
  await rawCdp("Page.addScriptToEvaluateOnNewDocument", { source: K1_AUDIT_SOURCE });
  await rawCdp("Fetch.enable", { patterns: [{ urlPattern: `${origin}/`, resourceType: "Document", requestStage: "Request" }] });
  await rawCdp("Page.bringToFront");
  await rawCdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  await rawCdp("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

  async function freshLoad(path, pane, label, clearKeys = []) {
    // Uninstrumented reset of the keys this run touches, then a new document (in-memory drafts never survive it).
    if (clearKeys.length) await evaluate(`(() => { if (window.verify) for (const key of ${JSON.stringify(clearKeys)}) verify.seed(key, null); return true; })()`).catch(() => true);
    session.runnerNavigating = true;
    try { await cdp("Page.navigate", { url: `${origin}${path}` }); } finally { setTimeout(() => { if (session) session.runnerNavigating = false; }, 2500); }
    const mounted = await waitUntil(READY(pane), 20000);
    if (!mounted) pre(`${label}:production-app-mounted`, false, { diagnostics: await evaluate("({ path: location.pathname, text: (document.body.innerText || '').slice(0, 300), verify: !!window.verify, scope: window.verify ? verify.scope() : null })").catch((error) => String(error)) });
    await delay(900);
    const state = await evaluate(`({ scope: verify.scope(), auth: verify.authCalls(), location: verify.location(), paneId: verify.paneId(), rail: verify.railNames(), physical: Object.fromEntries(${JSON.stringify(clearKeys)}.map((key) => [key, verify.physical(key)])) })`);
    pre(`${label}:production-app-mounted`, true, { state });
    pre(`${label}:auth-session-served-by-real-provider-and-account-active`, state.auth.includes("getSession") && state.scope.kind === "account" && state.scope.accountId === "f1-clock-A" && state.scope.generation === "g1", { state });
    pre(`${label}:touched-keys-start-absent`, Object.values(state.physical).every((value) => value === null), { physical: state.physical });
    return state;
  }
  async function navigateTo(pathname, state, pane, label) {
    await evaluate(`void verify.router.navigate(${JSON.stringify(pathname)}${state ? `, { state: ${JSON.stringify(state)} }` : ""}), true`);
    pre(`setup:${label}-mounted`, await waitUntil(READY(pane), 6000));
    await delay(400);
    return evaluate("verify.location()");
  }
  const triple = (location) => ({ pathname: location.pathname, key: location.key, state: location.state ?? null });
  const sameTriple = (left, right) => isDeepStrictEqual(triple(left), triple(right));
  async function traverse(id, direction) {
    const history = await rawCdp("Page.getNavigationHistory");
    const index = history.currentIndex + (direction === "back" ? -1 : 1);
    const target = history.entries[index];
    pre(`${id}:traverse-${direction}-entry-exists`, Boolean(target), { currentIndex: history.currentIndex });
    await rawCdp("Page.navigateToHistoryEntry", { entryId: target.id });
    return { fromIndex: history.currentIndex, toIndex: index, entryId: target.id };
  }
  const opsOn = (attempts, key) => attempts.filter((entry) => entry.key === key && (entry.op === "set" || entry.op === "remove")).map((entry) => `${entry.op}:${entry.value ?? ""}${entry.outcome === "denied" ? "!denied" : ""}`);
  async function railPoint(name, label) {
    const point = await evaluate(`(() => {
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
  /** One trusted rail drag of the first visible rail button onto the third, with a drop inside .rail-items. */
  async function railDragDrop(id) {
    const names = await evaluate("verify.railNames()");
    pre(`${id}:rail-has-at-least-three-buttons`, names.length >= 3, { names });
    const source = await railPoint(names[0], `${id}:source`);
    const target = await railPoint(names[2], `${id}:target`);
    const mark = await evaluate("verify.mark()");
    session.intercepted = [];
    await rawCdp("Input.setInterceptDrags", { enabled: true });
    try {
      await rawCdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: source.x, y: source.y });
      await rawCdp("Input.dispatchMouseEvent", { type: "mousePressed", x: source.x, y: source.y, button: "left", buttons: 1, clickCount: 1 });
      await rawCdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: source.x + 2, y: source.y + 6, button: "left", buttons: 1 });
      await rawCdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: target.x, y: target.y, button: "left", buttons: 1 });
      pre(`${id}:browser-drag-started-and-intercepted`, await waitFor(() => session.intercepted.length > 0, 4000));
      const data = session.intercepted[0];
      await rawCdp("Input.dispatchDragEvent", { type: "dragEnter", x: target.x, y: target.y, data });
      await rawCdp("Input.dispatchDragEvent", { type: "dragOver", x: target.x, y: target.y, data });
      await delay(250);
      // A resting pointer keeps sending dragover; Chrome accepts a drop only over an element whose latest dragover was
      // accepted (see ../web-apprail-order-recovery-native/verify-native-before.mjs, development probe 1).
      await rawCdp("Input.dispatchDragEvent", { type: "dragOver", x: target.x, y: target.y, data });
      await delay(250);
      await rawCdp("Input.dispatchDragEvent", { type: "drop", x: target.x, y: target.y, data });
      await rawCdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: target.x, y: target.y, button: "left", buttons: 0, clickCount: 1 });
    } finally {
      await rawCdp("Input.setInterceptDrags", { enabled: false }).catch(() => {});
    }
    await delay(500);
    const view = await evaluate(`verify.window(${mark})`);
    pre(`${id}:every-recorded-drag-event-trusted`, view.drags.length > 0 && view.drags.every((entry) => entry.trusted), { drags: view.drags.map((entry) => `${entry.type}:${entry.target}:${entry.trusted}`) });
    pre(`${id}:trusted-dragstart-dragover-drop-dragend`, view.drags.some((entry) => entry.type === "dragstart" && entry.target === names[0] && entry.railButton)
      && view.drags.some((entry) => entry.type === "dragover" && entry.target === names[2]) && view.drags.filter((entry) => entry.type === "drop").length === 1
      && view.drags.find((entry) => entry.type === "drop").inRailItems && view.drags.some((entry) => entry.type === "dragend"), { drags: view.drags.map((entry) => `${entry.type}:${entry.target}`) });
    return { names, mark, view };
  }
  /** A failed rail draft: a trusted rail drag and drop with setItem("xai_rail_order") failing; armed, observed, bytes unchanged. */
  async function failRailDrag(id) {
    const before = await evaluate(`verify.physical(${JSON.stringify(RAIL_KEY)})`);
    await evaluate(`verify.denySet(${JSON.stringify(RAIL_KEY)})`);
    const { names, mark } = await railDragDrop(`${id}:rail-drag`);
    const fired = await waitUntil(`verify.window(${mark}).attempts.some((entry) => entry.key === ${JSON.stringify(RAIL_KEY)} && entry.op === "set" && entry.outcome === "denied")`, 6000);
    await delay(400);
    const view = await evaluate(`verify.window(${mark})`);
    const ops = opsOn(view.attempts, RAIL_KEY);
    pre(`${id}:rail-fault-armed-and-observed`, fired && ops.length >= 1 && ops.every((entry) => entry.endsWith("!denied")), { attempts: ops });
    pre(`${id}:rail-bytes-unchanged`, (await evaluate(`verify.physical(${JSON.stringify(RAIL_KEY)})`)) === before, { before });
    return { names, ops, railStatus: await evaluate("verify.railOrderStatus()") };
  }
  /** A More draft (Launch at Login) whose write is denied; the accepted More pane shows its failure and Retry. */
  async function failMore(id) {
    pre(`${id}:more-pane-mounted`, (await evaluate("verify.paneId()")) === MORE.pane);
    const before = await evaluate(`document.querySelector(${JSON.stringify(MORE.toggle)})?.getAttribute("aria-checked")`);
    await evaluate(`verify.denySet(${JSON.stringify(MORE.key)})`);
    const mark = await evaluate("verify.mark()");
    await trustedClick(MORE.toggle, `${id}:more-toggle`);
    const fired = await waitUntil(`verify.window(${mark}).attempts.some((entry) => entry.key === ${JSON.stringify(MORE.key)} && entry.op === "set" && entry.outcome === "denied")`, 6000);
    const shown = await waitUntil(`verify.detailText().includes(${JSON.stringify(MORE.failed)})`, 6000);
    await delay(300);
    const view = await evaluate(`verify.window(${mark})`);
    const latest = view.attempts.filter((entry) => entry.key === MORE.key && entry.op === "set").at(-1)?.value ?? null;
    pre(`${id}:more-fault-armed-and-observed`, fired && latest === String(before !== "true"), { attempts: opsOn(view.attempts, MORE.key), before });
    pre(`${id}:more-bytes-unchanged`, (await evaluate(`verify.physical(${JSON.stringify(MORE.key)})`)) === null);
    pre(`${id}:more-draft-shows-failure-and-retry`, shown && (await buttonPresent(MORE.retry)), { alerts: await evaluate("verify.alerts()") });
    return latest;
  }
  /** Sign-out through the real UI: rail avatar -> AvatarMenu "Sign Out" -> SignOutConfirmDialog confirm -> App.handleSignOut. */
  async function signOutThroughUi(id) {
    await trustedClick(".app-rail .rail-avatar", `${id}:rail-avatar`);
    pre(`${id}:avatar-menu-open`, await waitUntil("verify.avatarMenuOpen()", 3000));
    await clickNamed(".avatar-menu .avm-item", await evaluate("verify.labels.signOut.en"), ".avatar-menu", `${id}:avatar-sign-out`);
    pre(`${id}:sign-out-confirm-dialog-open`, await waitUntil("verify.signOutDialogOpen()", 3000));
    const mark = await evaluate("verify.mark()");
    const errorsAt = runtimeErrors.length;
    const dialogsAt = dialogs.length;
    const requestsAt = navigationRequests.length;
    const frameNavigationsAt = frameNavigations.length;
    await trustedClick("dialog.xai-sign-out-dialog .xai-sign-out-dialog__btn--confirm", `${id}:sign-out-confirm`);
    return { mark, errorsAt, dialogsAt, requestsAt, frameNavigationsAt };
  }
  const caseWindow = async (mark) => evaluate(`verify.window(${mark})`);
  /** After a sign-out confirmation the AvatarMenu stays open behind its transparent scrim; a user closes it by clicking the scrim. */
  async function closeAvatarMenu(id) {
    if (!(await evaluate("verify.avatarMenuOpen()"))) return false;
    const point = await evaluate(`(() => {
      const candidates = [[innerWidth - 12, Math.round(innerHeight / 2)], [Math.round(innerWidth / 2), 12], [innerWidth - 12, 12], [Math.round(innerWidth / 2), Math.round(innerHeight / 2)]];
      for (const [x, y] of candidates) { const element = document.elementFromPoint(x, y); if (element && element.classList.contains("avatar-menu-scrim")) return { x, y }; }
      return null;
    })()`);
    pre(`${id}:avatar-menu-scrim-hit-testable`, point !== null);
    await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
    await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
    await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
    pre(`${id}:avatar-menu-closed-by-its-scrim`, await waitUntil("!verify.avatarMenuOpen()", 3000));
    return true;
  }
  /** An AppRail click away from the More pane while a More draft is held: held, then released by a More Retry. */
  async function railClickReleasedByMoreRetry(id, caseMark, errorsAt, latest) {
    const S = await evaluate("verify.location()");
    const tasksLabel = (await evaluate("verify.labels.nav.en")).tasks;
    const holdMark = await evaluate("verify.mark()");
    await clickNamed(".rail-btn", tasksLabel, ".app-rail .rail-items", `${id}:rail-click-tasks`);
    const shown = await waitUntil("verify.dialog() !== null", 4000);
    await delay(400);
    const hold = await evaluate(`({ dialog: verify.dialog(), location: verify.location(), view: verify.window(${holdMark}) })`);
    const held = shown && hold.dialog?.label === MORE.label && sameTriple(hold.location, S) && hold.view.commits.length === 0 && hold.view.history.length === 0;
    let release = null;
    if (held) {
      const releaseMark = await evaluate("verify.mark()");
      await evaluate(`verify.allow(${JSON.stringify(MORE.key)})`);
      await clickNamed("button", MORE.retry, ".settings-detail", `${id}:more-retry`);
      const left = await waitUntil(`verify.location().pathname === "/app/tasks"`, 6000);
      await delay(800);
      const state = await evaluate(`({ location: verify.location(), dialog: verify.dialog(), physical: verify.physical(${JSON.stringify(MORE.key)}), view: verify.window(${releaseMark}) })`);
      const releases = state.view.navigateCalls.filter((entry) => entry.toPath === "/app/tasks").length + state.view.blockerCalls.filter((entry) => entry.op === "proceed" && entry.liveState === "blocked" && entry.liveBlocker === entry.blocker).length;
      const nonLive = state.view.blockerCalls.filter((entry) => entry.blocker !== entry.liveBlocker || entry.liveState !== "blocked");
      release = {
        left, releases, nonLive: nonLive.length, commits: state.view.commits, history: state.view.history, dialogClosed: state.dialog === null,
        moreWrites: opsOn(state.view.attempts, MORE.key), morePhysical: state.physical, latest, timeline: timeline(state.view, [MORE.key, RAIL_KEY]),
        exactlyOnce: left && state.view.commits.length === 1 && state.view.commits[0].pathname === "/app/tasks" && state.view.commits[0].action === "PUSH" && releases === 1 && nonLive.length === 0
          && !state.view.blockerCalls.some((entry) => entry.op === "reset" || entry.threw) && state.dialog === null && isDeepStrictEqual(opsOn(state.view.attempts, MORE.key), [`set:${latest}`]),
      };
    }
    const counts = f1Counts(await caseWindow(caseMark), runtimeErrors.slice(errorsAt));
    return { S, held, hold: { dialog: hold.dialog, location: triple(hold.location), commits: hold.view.commits, navigateCalls: hold.view.navigateCalls }, release, counts };
  }

  const version = await session.send("Browser.getVersion");
  await cdp("Page.navigate", { url: `${origin}/app/settings/hotkeys` });
  pre("session:mounted", await waitUntil(READY("hotkeys"), 20000));
  const viewport = await evaluate("({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio })");
  record("baseline", {
    requested, resolved, resolvedTree, docsHead, productDeltaVsDocsHead: productDelta, fixedProductChanges, mode, suffix, archive,
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, viewport, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock), extracted: sha256(extractedLock), contractGate: LOCKFILE_GATE_SHA256 },
    fileSha256: { "verify-f1-clock.mjs": runnerSha256, [FIXTURE]: sha256(fixtureSource) },
    frozenPrelude: { path: FROZEN_PRELUDE, sha256: preludeSha256, frozenSha256: FROZEN_PRELUDE_SHA256, committedAtHeadSha256: committedPreludeSha256, lastCommit: preludeLastCommit, readOnly: true },
    references: { expected: REFERENCES, actual: referenceSha256 },
    contract: { path: CONTRACT_PATH, sha256AtHead: contractSha256, expected: CONTRACT_SHA256 },
    bundleSha256: sha256(js), bundleCssSha256: sha256(css),
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
    productHashes, origin: "127.0.0.1 (ephemeral port); every other host resolves to NOTFOUND; document requests for \"/\" answered 204 by the runner",
    devtools: "pipe transport (--remote-debugging-pipe), one flattened page session; trusted CDP mouse, drag (setInterceptDrags) and key input (no nativeVirtualKeyCode)",
  });
  pre("baseline:docs-head-product-tree-equals-revision", productDelta === "", { productDelta });
  pre("baseline:before-or-scoped-fixed-product", resolved === BEFORE_SHA ? archive.bytes === 148408320 : fixedProductChanges.length > 0 && fixedProductChanges.every(allowedFixedChange) && widgetInternalNew.length <= 3 && gridInternalNew.length <= 1, { requested, resolved, fixedProductChanges, widgetInternalNew, gridInternalNew, archiveBytes: archive.bytes });
  pre("baseline:streamed-archive-measured", archive.bytes > 0 && /^[a-f0-9]{64}$/.test(archive.sha256), { archive });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === LOCKFILE_GATE_SHA256 && sha256(archiveLock) === LOCKFILE_GATE_SHA256 && sha256(extractedLock) === LOCKFILE_GATE_SHA256);
  pre("baseline:frozen-prelude-hash-equals-committed", preludeSha256 === FROZEN_PRELUDE_SHA256 && committedPreludeSha256 === FROZEN_PRELUDE_SHA256);
  pre("baseline:contract-r2-hash", contractSha256 === CONTRACT_SHA256, { contractSha256 });
  pre("baseline:reference-files-unchanged", isDeepStrictEqual(referenceSha256, REFERENCES), { referenceSha256 });
  pre("baseline:guard-no-module-from-a-checkout", guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre("baseline:required-modules-bundled-from-archive", missingRequired.length === 0, { missingRequired });
  pre("baseline:no-mount-runtime-errors", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 3) });
  pre("baseline:react-commit-observer-active", await evaluate("verify.reactCommitsObserved() > 0 && verify.coordinatorObserved() && verify.hookErrors() === 0"), {
    commits: await evaluate("verify.reactCommitsObserved()"), hookErrors: await evaluate("verify.hookErrors()"),
  });

  // The product setup is performed on the production App. Values are seeded only
  // while no Clock draft exists, then a new document mounts the real Dashboard.
  const touched = [CLOCK_STYLE, CLOCK_TZ, DASH_ORDER, RAIL_KEY];
  const topbar = async (id, rail = false) => {
    const census = await evaluate("verify.topbarCensus()");
    pre(`${id}:topbar-census`, !census.appearance && census.rail === rail, { census, expectedRail: rail });
  };
  async function freshClock(id, { history = false } = {}) {
    await freshLoad("/app/tasks", null, id, touched);
    await evaluate(`verify.seed(${JSON.stringify(DASH_ORDER)}, ${JSON.stringify(JSON.stringify(["clock", "mini-cal"]))}); verify.seed(${JSON.stringify(CLOCK_STYLE)}, "classic"); verify.seed(${JSON.stringify(CLOCK_TZ)}, "local"); true`);
    const noteKey = await evaluate("verify.headerNoteKey()");
    await evaluate(`verify.seed(${JSON.stringify(noteKey)}, "Original note"); true`);
    const path = history ? "/app/tasks" : "/app/dashboard";
    await cdp("Page.navigate", { url: `${origin}${path}` });
    pre(`${id}:seeded-document-ready`, await waitUntil(READY(null), 20000));
    if (history) {
      const dashboardName = (await evaluate("verify.labels.nav.en")).dashboard;
      await clickNamed(".rail-btn", dashboardName, ".app-rail .rail-items", `${id}:enter-dashboard`);
    }
    pre(`${id}:clock-mounted`, await waitUntil("verify.dashboardReady()", 12000));
    const seeded = await evaluate(`({ style: verify.physical(${JSON.stringify(CLOCK_STYLE)}), tz: verify.physical(${JSON.stringify(CLOCK_TZ)}), order: verify.physical(${JSON.stringify(DASH_ORDER)}), note: verify.physical(verify.headerNoteKey()), location: verify.location(), clock: verify.clock() })`);
    pre(`${id}:in-domain-seeds`, seeded.style === "classic" && seeded.tz === "local" && seeded.order === JSON.stringify(["clock", "mini-cal"]) && seeded.note === "Original note" && seeded.clock.mounted, { seeded });
    await topbar(`${id}:start`);
    return seeded;
  }
  async function failClock(id, { railStatus = false } = {}) {
    const mark = await evaluate("verify.mark()");
    await evaluate(`verify.denySet(${JSON.stringify(CLOCK_STYLE)})`);
    await trustedClick(`${CLOCK_SCOPE} .clk-style-toggle [data-clock-style="split"]`, `${id}:split`);
    const fired = await waitUntil(`verify.window(${mark}).attempts.some((entry) => entry.key === ${JSON.stringify(CLOCK_STYLE)} && entry.op === "set" && entry.outcome === "denied")`, 5000);
    const state = await evaluate(`({ clock: verify.clock(), bytes: verify.physical(${JSON.stringify(CLOCK_STYLE)}), view: verify.window(${mark}) })`);
    pre(`${id}:clock-quota-fault-armed-observed-and-bytes-preserved`, fired && state.bytes === "classic" && state.view.attempts.some((entry) => entry.key === CLOCK_STYLE && entry.op === "set" && entry.outcome === "denied"), { attempts: state.view.attempts.filter((entry) => entry.key === CLOCK_STYLE), bytes: state.bytes });
    await topbar(`${id}:after-clock-fault`, railStatus);
    return state;
  }
  async function failHeader(id) {
    const key = await evaluate("verify.headerNoteKey()");
    const mark = await evaluate("verify.mark()");
    await evaluate(`verify.denySet(${JSON.stringify(key)})`);
    await trustedClick(".dash-note__display", `${id}:edit-note`);
    const input = await pointOf(".dash-note__input", `${id}:note-input`);
    await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: input.x, y: input.y, button: "left", buttons: 1, clickCount: 1 });
    await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: input.x, y: input.y, button: "left", buttons: 0, clickCount: 1 });
    await evaluate('document.querySelector(".dash-note__input").select()');
    await cdp("Input.insertText", { text: "Clock F1 draft note" });
    await clickNamed("button", "Save dashboard note", ".dash-note", `${id}:save-note`);
    const fired = await waitUntil(`verify.window(${mark}).attempts.some((entry) => entry.key === ${JSON.stringify(key)} && entry.op === "set" && entry.outcome === "denied")`, 6000);
    const state = await evaluate(`({ recovery: !!document.querySelector(".dash-note-recovery"), bytes: verify.physical(${JSON.stringify(key)}), view: verify.window(${mark}) })`);
    pre(`${id}:header-quota-fault-observed-and-draft-shown`, fired && state.recovery && state.bytes === "Original note", { state });
    await topbar(`${id}:after-header-fault`);
    return { key, state };
  }
  const clockDraft = (state) => state.clock.recovery.length > 0 || state.clock.retry.length > 0;
  const fixed = resolved !== BEFORE_SHA;
  const liveProceeds = (view) => view.blockerCalls.filter((entry) => entry.op === "proceed" && entry.blocker === entry.liveBlocker && entry.liveState === "blocked");
  const noBadBlockerCall = (view) => view.blockerCalls.every((entry) => entry.blocker === entry.liveBlocker && entry.liveState === "blocked" && !entry.threw)
    && new Set(view.blockerCalls.filter((entry) => entry.op === "proceed").map((entry) => entry.blocker)).size === view.blockerCalls.filter((entry) => entry.op === "proceed").length;
  async function dialogAction(id, name) { await clickNamed("button", name, DIALOG, `${id}:dialog-${name}`); }
  async function fixedNavigationRelease(id, mark, destination, action) {
    const released = await waitUntil(`verify.location().pathname === ${JSON.stringify(destination)}`, 6000);
    await delay(350);
    const view = await caseWindow(mark);
    const routeReleases = action === "POP" ? liveProceeds(view).length : view.navigateCalls.filter((entry) => entry.toPath === destination).length;
    const ok = released && view.commits.length === 1 && view.commits[0].pathname === destination && view.commits[0].action === action
      && routeReleases === 1 && (action === "POP" || liveProceeds(view).length === 0) && noBadBlockerCall(view) && !view.blockerCalls.some((entry) => entry.op === "reset");
    observe(`${id}:one-release-one-router-commit`, ok, { commits: view.commits, blockerCalls: view.blockerCalls, navigateCalls: view.navigateCalls, routeReleases });
    return ok;
  }
  async function fixedSignOutRelease(id, mark) {
    await waitUntil("verify.scope().kind === 'locked'", 6000);
    const view = await caseWindow(mark);
    const invalidations = view.scope.filter((entry) => entry.kind === "locked").length;
    const signOuts = view.auth.filter((entry) => entry.call === "signOut").length;
    const ok = signOuts === 1 && invalidations === 1 && noBadBlockerCall(view);
    observe(`${id}:one-signout-one-identity-invalidation`, ok, { signOuts, invalidations, blockerCalls: view.blockerCalls, scope: view.scope });
    return ok;
  }
  async function outcome(id, state, mark, errorsAt) {
    const view = await caseWindow(mark);
    const counts = f1Counts(view, runtimeErrors.slice(errorsAt));
    const result = { case: id, state, ...counts };
    outcomes.push(result);
    record("observation", { id, state, clock: await evaluate("verify.clock()"), location: await evaluate("verify.location()"), dialog: await evaluate("verify.dialog()"), topbar: await evaluate("verify.topbarCensus()"), timeline: timeline(view, [CLOCK_STYLE, CLOCK_TZ, RAIL_KEY]), counts });
    pre(`${id}:zero-f1-signature-and-runtime-errors`, !counts.f1Signature && counts.runtimeErrors === 0 && counts.invalidTransitionThrows === 0, { counts });
    return result;
  }
  if (mode === "selfcheck") {
    const id = "selfcheck";
    await freshClock(id);
    const faults = await evaluate("verify.probeFaults()");
    pre(`${id}:storage-spy-selftest`, Object.entries(faults).filter(([key]) => key !== "attemptsLogged").every(([, value]) => value === true), { faults });
    pre(`${id}:dispatch-selftest`, isDeepStrictEqual(await evaluate("verify.probeDispatch()"), ["xai_f1_selftest"]));
    const mark = await evaluate("verify.mark()");
    await trustedClick(`${CLOCK_SCOPE} .clk-style-toggle [data-clock-style="split"]`, `${id}:style-split`);
    const wrote = await waitUntil(`verify.physical(${JSON.stringify(CLOCK_STYLE)}) === "split"`, 5000);
    const view = await caseWindow(mark);
    pre(`${id}:production-clock-writes-exact-byte`, wrote && isDeepStrictEqual(opsOn(view.attempts, CLOCK_STYLE), ["set:split"]), { attempts: view.attempts.filter((entry) => entry.key === CLOCK_STYLE) });
    pre(`${id}:clock-present-with-accepted-shell`, (await evaluate("verify.clock().mounted")) && (await evaluate("verify.railNames().length")) >= 3);
    pre(`${id}:frozen-coordinator-react-observer`, (await evaluate("verify.coordinatorObserved()")) === true && (await evaluate("verify.hookErrors()")) === 0);
    pre(`${id}:zero-runtime-errors`, runtimeErrors.length === 0, { errors: runtimeErrors });
    runVerdict = "harness-valid";
  }
  if (mode === "clock") {
    // c1: real browser Back/POP. At the before SHA the failed Clock choice is lost.
    {
      const id = "c1"; progress(id);
      await freshClock(id, { history: true });
      const mark = await evaluate("verify.mark()"), errorsAt = runtimeErrors.length;
      const failure = await failClock(id);
      const noDraft = !clockDraft(failure);
      const before = await evaluate("verify.location()");
      await traverse(id, "back");
      await delay(700);
      const after = await evaluate("({ location: verify.location(), dialog: verify.dialog() })");
      let state;
      if (fixed) {
        const held = after.dialog?.label === "Unsaved Clock draft" && sameTriple(after.location, before) && clockDraft(failure);
        observe(`${id}:Clock-draft-holds-POP`, held, { before, after, clock: failure.clock });
        const releaseMark = await evaluate("verify.mark()");
        await evaluate(`verify.allow(${JSON.stringify(CLOCK_STYLE)})`);
        await clickNamed("button", "Retry Clock style", CLOCK_SCOPE, `${id}:retry-style`);
        const released = await fixedNavigationRelease(id, releaseMark, "/app/tasks", "POP");
        state = held && released ? "fixed-pass" : "fail";
      } else {
        state = noDraft && after.location.pathname === "/app/tasks" && after.dialog === null ? "before-not-held" : "fail";
        observe(`${id}:Clock-draft-holds-POP`, false, { before, after, noDraft });
      }
      await outcome(id, state, mark, errorsAt);
    }
    // c2: an accessible-name AppRail click. The before product has no Clock draft.
    {
      const id = "c2"; progress(id);
      await freshClock(id);
      const mark = await evaluate("verify.mark()"), errorsAt = runtimeErrors.length;
      const failure = await failClock(id);
      const name = (await evaluate("verify.labels.nav.en")).tasks;
      await clickNamed(".rail-btn", name, ".app-rail .rail-items", `${id}:depart-tasks`);
      await delay(600);
      const after = await evaluate("({ location: verify.location(), dialog: verify.dialog() })");
      let state;
      if (fixed) {
        const held = clockDraft(failure) && after.dialog?.label === "Unsaved Clock draft" && after.location.pathname === "/app/dashboard";
        observe(`${id}:Clock-draft-holds-AppRail-click`, held, { after, clock: failure.clock });
        const releaseMark = await evaluate("verify.mark()");
        await dialogAction(id, "Discard local changes and leave");
        const released = await fixedNavigationRelease(id, releaseMark, "/app/tasks", "PUSH");
        const writes = opsOn((await caseWindow(releaseMark)).attempts, CLOCK_STYLE);
        observe(`${id}:discard-zero-clock-writes`, writes.length === 0, { writes });
        state = held && released && writes.length === 0 ? "fixed-pass" : "fail";
      } else {
        state = !clockDraft(failure) && after.location.pathname === "/app/tasks" && after.dialog === null ? "before-not-held" : "fail";
        observe(`${id}:Clock-draft-holds-AppRail-click`, false, { after });
      }
      await outcome(id, state, mark, errorsAt);
    }
    // c3: Header is a positive hold; Clock's failed choice adds no participant.
    {
      const id = "c3"; progress(id);
      await freshClock(id, { history: true });
      const mark = await evaluate("verify.mark()"), errorsAt = runtimeErrors.length;
      const header = await failHeader(id);
      const failure = await failClock(id);
      await traverse(id, "back");
      const held = await waitUntil("verify.dialog() !== null", 5000);
      const snapshot = await evaluate("({ dialog: verify.dialog(), location: verify.location(), clock: verify.clock() })");
      await topbar(`${id}:held`);
      let state;
      const combined = held && snapshot.dialog?.label === "Unsaved Dashboard draft" && clockDraft(failure) && snapshot.location.pathname === "/app/dashboard";
      observe(`${id}:combined-Header-Clock-dialog`, combined, { snapshot });
      if (fixed) {
        const clockRetryMark = await evaluate("verify.mark()");
        await evaluate(`verify.allow(${JSON.stringify(CLOCK_STYLE)})`);
        await clickNamed("button", "Retry Clock style", CLOCK_SCOPE, `${id}:retry-clock`);
        await delay(400);
        const still = await evaluate("({ dialog: verify.dialog(), location: verify.location() })");
        const stillHeld = still.dialog?.label === "Unsaved Dashboard header draft" && still.location.pathname === "/app/dashboard" && (await caseWindow(clockRetryMark)).commits.length === 0;
        observe(`${id}:Clock-retry-keeps-Header-hold`, stillHeld, { still });
        state = combined && stillHeld ? "fixed-pass" : "fail";
      } else state = held && snapshot.dialog?.label === "Unsaved Dashboard header draft" && !clockDraft(failure) && snapshot.location.pathname === "/app/dashboard" ? "before-header-only" : "fail";
      const releaseMark = await evaluate("verify.mark()");
      await evaluate(`verify.allow(${JSON.stringify(header.key)})`);
      await clickNamed("button", "Retry note save", ".dash-note-recovery", `${id}:retry-header`);
      const released = await waitUntil("verify.location().pathname === '/app/tasks'", 6000);
      pre(`${id}:Header-positive-control-releases-once`, released, { after: await evaluate("verify.location()") });
      if (fixed) { const exactly = await fixedNavigationRelease(id, releaseMark, "/app/tasks", "POP"); if (!exactly) state = "fail"; }
      await outcome(id, state, mark, errorsAt);
    }
    // c4: sign-out with Clock only; there must be no rail/Appearance confirm.
    {
      const id = "c4"; progress(id);
      await freshClock(id);
      const mark = await evaluate("verify.mark()"), errorsAt = runtimeErrors.length;
      const failure = await failClock(id);
      const sign = await signOutThroughUi(id);
      if (!fixed) await waitFor(() => navigationRequests.length > sign.requestsAt, 5000);
      await delay(600);
      const confirms = dialogs.slice(sign.dialogsAt);
      const after = await evaluate(`({ dialog: verify.dialog(), scope: verify.scope(), view: verify.window(${sign.mark}) })`);
      pre(`${id}:zero-rail-Appearance-other-confirms`, confirms.length === 0, { confirms });
      let state;
      if (fixed) {
        const held = clockDraft(failure) && after.dialog?.label === "Unsaved Clock draft" && after.scope.kind === "account" && after.view.auth.every((entry) => entry.call !== "signOut");
        observe(`${id}:Clock-holds-signout`, held, { after });
        await dialogAction(id, "Stay");
        const stayed = await evaluate("({ dialog: verify.dialog(), scope: verify.scope(), clock: verify.clock() })");
        const stayOK = stayed.dialog === null && stayed.scope.kind === "account" && clockDraft({ clock: stayed.clock });
        observe(`${id}:Stay-preserves-Clock-and-identity`, stayOK, { stayed });
        await closeAvatarMenu(id);
        const second = await signOutThroughUi(`${id}:second`);
        pre(`${id}:second-dialog-open`, await waitUntil("verify.dialog() !== null", 4000));
        const releaseMark = await evaluate("verify.mark()");
        await dialogAction(id, "Discard local changes and leave");
        const released = await fixedSignOutRelease(id, releaseMark);
        state = held && stayOK && released ? "fixed-pass" : "fail";
      } else {
        state = !clockDraft(failure) && after.dialog === null && after.view.auth.filter((entry) => entry.call === "signOut").length === 1 && after.scope.kind === "locked" ? "before-not-held" : "fail";
        observe(`${id}:Clock-holds-signout`, false, { after });
      }
      await outcome(id, state, mark, errorsAt);
    }
    // c5: trusted rail drop fails, then Clock fails. Cancel is a positive control.
    {
      const id = "c5"; progress(id);
      await freshClock(id);
      const mark = await evaluate("verify.mark()"), errorsAt = runtimeErrors.length;
      const rail = await failRailDrag(id);
      pre(`${id}:failed-rail-status-present-and-closed`, rail.railStatus !== null && rail.railStatus.inTopbarControls, { status: rail.railStatus });
      await topbar(`${id}:rail-draft`, true);
      const failure = await failClock(id, { railStatus: true });
      await topbar(`${id}:both-faults`, true);
      dialogPlan.push({ accept: false, purpose: `${id}:cancel-rail` });
      const first = await signOutThroughUi(id);
      await waitFor(() => dialogs.length > first.dialogsAt, 4000);
      await delay(450);
      const cancel = dialogs.slice(first.dialogsAt);
      const cancelled = await evaluate(`({ scope: verify.scope(), dialog: verify.dialog(), clock: verify.clock(), status: verify.railOrderStatus(), view: verify.window(${first.mark}) })`);
      pre(`${id}:Cancel-rail-confirm-positive-control`, cancel.length === 1 && cancel[0].message === RAIL_SIGN_OUT_TEXT && !cancel[0].accepted && cancelled.scope.kind === "account" && cancelled.dialog === null && cancelled.status !== null && cancelled.view.auth.every((entry) => entry.call !== "signOut"), { cancel, cancelled });
      await closeAvatarMenu(id);
      dialogPlan.push({ accept: true, purpose: `${id}:ok-rail` });
      const second = await signOutThroughUi(id);
      await waitFor(() => dialogs.length > second.dialogsAt, 4000);
      if (!fixed) await waitFor(() => navigationRequests.length > second.requestsAt, 5000);
      await delay(600);
      const ok = dialogs.slice(second.dialogsAt);
      const after = await evaluate(`({ dialog: verify.dialog(), scope: verify.scope(), view: verify.window(${second.mark}) })`);
      pre(`${id}:rail-only-confirm-classification`, ok.length === 1 && ok[0].message === RAIL_SIGN_OUT_TEXT && ok[0].accepted, { ok });
      let state;
      if (fixed) {
        const held = clockDraft(failure) && after.dialog?.label === "Unsaved Clock draft" && after.scope.kind === "account" && after.view.auth.every((entry) => entry.call !== "signOut");
        observe(`${id}:Clock-holds-after-rail-OK`, held, { after });
        const releaseMark = await evaluate("verify.mark()");
        await dialogAction(id, "Discard local changes and leave");
        const released = await fixedSignOutRelease(id, releaseMark);
        const releaseView = await caseWindow(releaseMark);
        const writes = opsOn(releaseView.attempts, CLOCK_STYLE);
        observe(`${id}:Clock-discard-zero-writes-after-rail-OK`, writes.length === 0, { writes });
        state = held && released && writes.length === 0 ? "fixed-pass" : "fail";
      } else {
        state = !clockDraft(failure) && after.dialog === null && after.scope.kind === "locked" && after.view.auth.filter((entry) => entry.call === "signOut").length === 1 ? "before-rail-only" : "fail";
        observe(`${id}:Clock-holds-after-rail-OK`, false, { after });
      }
      await outcome(id, state, mark, errorsAt);
    }
    const expected = fixed ? { c1: "fixed-pass", c2: "fixed-pass", c3: "fixed-pass", c4: "fixed-pass", c5: "fixed-pass" } : { c1: "before-not-held", c2: "before-not-held", c3: "before-header-only", c4: "before-not-held", c5: "before-rail-only" };
    const casesCorrect = outcomes.length === 5 && outcomes.every((entry) => entry.state === expected[entry.case]);
    runVerdict = casesCorrect && outcomes.every((entry) => !entry.f1Signature && entry.runtimeErrors === 0) && (fixed ? deferredFailures.length === 0 : true) ? fixed ? "fixed-pass" : "before-correct" : "fail";
    record("observation", { id: "clock:summary", expected, actual: Object.fromEntries(outcomes.map((entry) => [entry.case, entry.state])), casesCorrect });
  }
  pre("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs });
  pre("run:react-observer-never-threw", (await evaluate("verify.hookErrors()")) === 0);
  // K-1 key audit: the last document, then the run-level precondition.
  await k1Collect("end-of-run");
  {
    const summary = {
      documents: k1.documents.length,
      runnerPresses: k1.documents.reduce((sum, entry) => sum + entry.presses, 0),
      keydowns: k1.documents.reduce((sum, entry) => sum + (entry.keydown ?? 0), 0),
      keyups: k1.documents.reduce((sum, entry) => sum + (entry.keyup ?? 0), 0),
      keypresses: k1.documents.reduce((sum, entry) => sum + (entry.keypress ?? 0), 0),
      mismatches: k1.documents.filter((entry) => !entry.ok),
    };
    record("observation", { id: "k1:keyboard-audit", dispatch: "rawKeyDown + keyUp with key, code and windowsVirtualKeyCode only (no nativeVirtualKeyCode)", ...summary, perDocument: k1.documents });
    pre("run:k1-keyboard-trace-contains-only-the-runner-key-presses", summary.mismatches.length === 0 && summary.keydowns === summary.runnerPresses && summary.keyups === summary.runnerPresses && summary.keypresses === 0,
      { documents: summary.documents, runnerPresses: summary.runnerPresses, keydowns: summary.keydowns, keyups: summary.keyups, keypresses: summary.keypresses, mismatches: summary.mismatches.length });
  }
} catch (error) {
  harnessError = error;
  runVerdict = "harness-invalid";
} finally {
  const pass = harnessError === null && (mode === "selfcheck" ? runVerdict === "harness-valid" : runVerdict === "fixed-pass");
  record("result", {
    pass, harnessValid: harnessError === null, verdict: runVerdict, mode, checks, deferredFailures, outcomes: outcomes.map((entry) => ({ case: entry.case, state: entry.state ?? null, held: entry.held ?? null, f1Signature: entry.f1Signature, proceeds: entry.proceeds, duplicateProceeds: entry.duplicateProceeds, nonLiveBlockerCalls: entry.nonLiveBlockerCalls, invalidTransitionThrows: entry.invalidTransitionThrows, runtimeErrors: entry.runtimeErrors })),
    browser: session ? { pid: session.pid, closeReason: session.closeReason ?? null } : null,
    runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 4), consoleWarnings: consoleWarnings.length, consoleWarningSamples: [...new Set(consoleWarnings)].slice(0, 5), dialogs, navigationRequests, unusedDialogPlans: dialogPlan,
    ...(harnessError ? { error: String(harnessError?.stack ?? harnessError).slice(0, 1500), checkId: harnessError?.checkId ?? null, checkKind: harnessError?.checkKind ?? null } : {}),
  });
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`, { flag: "wx" });
  await closeSession().catch(() => {});
  server?.closeAllConnections?.();
  server?.close();
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  process.exitCode = harnessError ? 1 : pass ? 0 : 2;
  const summary = outcomes.map((entry) => `${entry.case}:${entry.state ?? (entry.held ? "held" : "-")}${entry.f1Signature ? "(F1)" : ""}`).join(" ");
  console.log(`${harnessError ? "HARNESS-FAIL" : pass ? "PASS" : "VALID-ORACLE-FAIL"} ${relative(root, evidencePath)} verdict=${runVerdict} checks=${checks} exit=${process.exitCode} ${summary}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
  setTimeout(() => process.exit(process.exitCode), 500).unref();
}
