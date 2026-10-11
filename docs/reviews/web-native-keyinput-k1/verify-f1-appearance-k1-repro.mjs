/**
 * K-1 REPRODUCTION COPY (batch 44; in-context reproduction, NOT a corrected rerun). A copy of
 * ../web-appearance-recovery-f1/verify-f1-appearance.mjs (SHA-256
 * f570b5c9a29d13a59aa3abe3436552a4f90e1107849a7430259cf58513e1f328, frozen, unchanged). The key dispatch is the frozen
 * runner's own (pressEscape() still sends nativeVirtualKeyCode: 27); the only change is the passive key audit of
 * verify-f1-appearance-k1.mjs (a window capture-phase recorder of keydown, keypress and keyup in every new document,
 * read before every Page.navigate and Page.reload and at the end of the run), recorded as the observation
 * "k1:keyboard-audit" WITHOUT a precondition, so that the frozen checks and verdicts run unchanged while the stray
 * keyboard events of the original dispatch are counted per document. Everything else is the frozen runner's code.
 * The fixture next to this copy is a byte-identical copy (f1-appearance-host.tsx 19b4601f…). Evidence goes to this
 * directory.
 *
 * CP-APPEARANCE-01 batch 39 (contract r3 §12 "Appearance F1-shape before", §14 E5; reruns unchanged for E17):
 * bounded Chrome F1-shape runner for the Settings Appearance caller, in the production App composition.
 * Verification only: it repairs nothing, accepts nothing and changes no product file, contract, ledger, control plane
 * or existing evidence. It mirrors ../web-features-recovery-f1/verify-f1-features.mjs and the frozen F1 runners
 * ../web-sticky-recovery-f1/verify-f1.mjs and verify-f1-callers.mjs (none imported or changed) and reuses the frozen
 * ../web-sticky-recovery-f1/f1-prelude.js READ-ONLY: its SHA-256 must equal the frozen value below and the blob
 * committed at this checkout's HEAD, or the run stops before anything is built.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-appearance-recovery-f1/verify-f1-appearance.mjs <revision> <selfcheck|appearance> <suffix>
 *
 * - Product: an immutable `git archive <revision>`; ./f1-appearance-host.tsx is bundled with esbuild from stdin with
 *   resolveDir = that archive. Every `@repo/*` specifier is pinned to the archive's own export; a guard plugin fails
 *   the build if any module is loaded from the packages/, apps/ or docs/ tree of the dependency checkout or of this
 *   runner's checkout. Third-party modules come from XAI_DEPS_ROOT only when its pnpm-lock.yaml SHA-256 equals the
 *   archive's and the contract gate (consistency gate).
 * - Page: the frozen f1-prelude.js (classic script, React commit observer) then the module bundle, served from
 *   127.0.0.1 only (DNS for every other host maps to NOTFOUND); isolated headless Chrome profile; CDP trusted mouse and
 *   keyboard input after a centre hit-test; browser Back/Forward through CDP Page.navigateToHistoryEntry; real
 *   window.confirm dialogs answered through Page.handleJavaScriptDialog by plan. App.handleSignOut's final
 *   window.location.assign("/") is observed as a document request for "/" through the CDP Fetch domain and answered
 *   with HTTP 204, so the browser keeps the current document and its instruments can be read afterwards.
 * - selfcheck (harness validity; every assertion is a precondition): composition, provenance, commit observer, fixture
 *   instrument self-tests, the Appearance, More, sidebar and sign-out surfaces (no product edit), then four positive
 *   controls in this composition on the accepted More guard registrant:
 *     pc1 sidebar-release   — a programmatic Settings sidebar departure held by a More draft and released by a More
 *                             Retry exactly once to /app/settings/appearance (the release path a1 needs);
 *     pc2 back-release      — a held browser Back released by a More Retry: exactly one live proceed() from "blocked";
 *     pc3 signout-held-stay — sign-out through the real avatar menu and SignOutConfirmDialog while a More draft is held:
 *                             the coordinator dialog appears and Stay resolves false (identity intact, no navigation);
 *     pc4 signout-proceeds  — sign-out from /app/tasks without drafts resolves true: identity invalidated, one
 *                             client.auth.signOut, a navigation to "/" requested.
 * - appearance: the contract §12 cases a1–a4, defined here once so E17 reruns this file unchanged:
 *     a1 host row m: a failed Topbar choice plus a More draft held by the Settings coordinator; activate the Topbar
 *        status; a successful More Retry releases exactly once to /app/settings/appearance.        before: before-absent
 *     a2 Back from the Appearance pane after a failed Appearance (accent) choice: not held, Topbar status shown on the
 *        destination, draft intact after Forward.                                                 before: before-no-indicator
 *     a3 sign-out from the More pane with an Appearance draft (failed Topbar choice) and a More draft: the Appearance
 *        step (one window.confirm, OK), then the coordinator holds and Stay resolves false.        before: before-no-appearance-step
 *     a4 sign-out from /app/tasks with a failed Topbar choice; Cancel at the Appearance step resolves false with
 *        identity intact and the status kept.                                                     before: before-unprotected
 *   Each case first proves its failure was injected (fault armed and observed, bytes unchanged). Product assertions
 *   are deferred (recorded without stopping); preconditions stop the run. Each case records its F1-signature counts:
 *   duplicate proceed() calls on one blocker, non-live blocker calls, invalid-transition throws and runtime errors.
 * - Verdict per run: selfcheck "harness-valid" | "harness-invalid"; appearance "before-correct" (every case in its
 *   correct before state and no F1 signature), "fixed-pass" (every case passes its fixed-stage oracle), "f1-signature"
 *   or "fail".
 * - Log: JSON lines `f1-<sha7>-<mode>-<suffix>.log` in this directory, never overwritten. Exit 0 = pass (selfcheck
 *   harness-valid / appearance fixed-pass); 2 = harness valid but the appearance oracle failed (including the expected
 *   before-correct state); 1 = harness invalid. Development probes may redirect with XAI_F1_EVIDENCE_DIR (outside the
 *   repository); committed evidence never does.
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
const CONTRACT_PATH = "docs/reviews/web-appearance-recovery-contract/contract.md";
const CONTRACT_SHA256 = "ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_F1_EVIDENCE_DIR ?? output;
if (process.env.XAI_F1_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
if (!requested) throw Error("Revision required");
if (!["selfcheck", "appearance"].includes(mode)) throw Error(`Unsupported mode ${mode}; use selfcheck|appearance`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const resolved = execFileSync("git", ["rev-parse", "--verify", `${requested}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const resolvedTree = execFileSync("git", ["rev-parse", `${resolved}^{tree}`], { cwd: root, encoding: "utf8" }).trim();
const short = resolved.slice(0, 7);
const evidencePath = join(evidenceDir, `f1-${short}-${mode}-${suffix}.log`);
if (existsSync(evidencePath)) throw Error("Evidence exists; use a distinct suffix");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
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
/** selfcheck: every assertion is a precondition; appearance: product assertions are deferred. */
const assertProduct = (strict, id, condition, details = {}) => (strict ? (pre(id, condition, details), true) : observe(id, condition, details));

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
const fixtureSource = readFileSync(join(output, "f1-appearance-host.tsx"), "utf8");
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
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearancePane.tsx",
  "packages/plugin-web-settings-shell/src/SettingsFooter.tsx",
  "packages/plugin-web-settings-rest/src/panes/morePane.tsx",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/Topbar.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/AvatarMenu.tsx",
  "packages/xai-web-shell/src/SignOutConfirmDialog.tsx",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/guards.tsx",
];

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-f1-appearance-")));
const snapshot = join(directory, "source");
const profile = join(directory, "profile");
let server = null;
let session = null;
let origin = "";

// ---------------------------------------------------------------------------------------------------
// Browser session (pattern of the frozen F1 runners)
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
  let commandId = 0;
  const state = { proc, exited, socket, pending, runnerNavigating: false };
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
const rawCdp = (method, params) => {
  if (!session) throw Error("No browser session");
  return session.cdp(method, params);
};
// K-1 key audit: read the leaving document's recorder before every navigation or reload.
const cdp = async (method, params) => {
  if (method === "Page.navigate" || method === "Page.reload") await k1Collect(method);
  return rawCdp(method, params);
};
// ---------------------------------------------------------------------------------------------------
// K-1 key audit (passive recorder in every new document; read before navigation, reload and at the end)
// ---------------------------------------------------------------------------------------------------
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
  const expectedSequence = presses.flatMap(() => ["keydown:Escape:Escape", "keyup:Escape:Escape"]);
  const ok = audit !== null && audit.keydown === presses.length && audit.keyup === presses.length && audit.keypress === 0 && audit.untrusted === 0
    && isDeepStrictEqual(audit.sequence, expectedSequence);
  k1.documents.push({ reason, afterCheck: lastCheckId, presses: presses.length, keydown: audit?.keydown ?? null, keyup: audit?.keyup ?? null, keypress: audit?.keypress ?? null, untrusted: audit?.untrusted ?? null, ok,
    ...(ok ? {} : { counts: audit?.counts ?? null, sequenceHead: audit?.sequence.slice(0, 12) ?? null }) });
}
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
  // K-1 reproduction: the frozen dispatch, unchanged (nativeVirtualKeyCode: 27).
  await cdp("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
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
  return items.slice(0, 200).map(([seq, text]) => `${seq} ${text}`);
}
const isStale = (entry) => Boolean(entry.coord && entry.coord.s === "blocked"
  && (!entry.live || entry.live.id !== entry.coord.b || entry.live.state !== "blocked"));
/** F1-signature counts of one window (the oracle of the F1 impact review and verify-f1-features.mjs). */
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
    f1Signature: duplicateProceeds > 0 || nonLive.length > 0 || invalidTransition.length > 0 || (proceeds.length >= 2 && invalidTransition.length > 0),
  };
}

// ---------------------------------------------------------------------------------------------------
// Surfaces and normative wording (contract §2, §5 and §7; More strings from the accepted More pane)
// ---------------------------------------------------------------------------------------------------
const MORE = { route: "/app/settings/more", pane: "more", key: "xai_pref_more_launch_at_login", toggle: '.settings-detail [role="switch"][aria-label="Launch at Login"]',
  failed: "Launch at Login was not saved.", retry: "Retry Launch at Login", discard: "Discard Launch at Login", label: "Unsaved More draft" };
const APPEARANCE = { route: "/app/settings/appearance", pane: "appearance" };
const SIGN_OUT_STEP_TEXT = "Some appearance changes are not saved. Sign out and discard them?";
const STATUS_NAME = "Appearance changes not saved. Review them in Settings.";
const ACCENT_FAILED = "Accent color was not saved.";
const RETRY_ACCENT = "Retry Accent color";
const DIALOG = ".settings-departure-dialog";
const P_ENTRY = { pathname: "/app/settings/about", state: { token: "f1-appearance-P" } };
const READY = (pane) => `(() => !!window.verify && verify.ready()${pane ? ` && verify.paneId() === ${JSON.stringify(pane)}` : ""})()`;
const ZERO_SIGNATURE = { duplicateProceeds: 0, nonLiveBlockerCalls: 0, runtimeErrors: 0 };

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
const outcomes = [];
let harnessError = null;
let runVerdict = null;
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
  const pinAndGuard = { name: "appearance-f1-archive-pin-guard", setup(buildApi) {
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
    stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: "f1-appearance-host.tsx" },
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
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== "f1-appearance-host.tsx" && !input.startsWith("<define:"));
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const missingRequired = REQUIRED_MODULES.filter((file) => !inputs.includes(file) || !archiveModules.has(file));
  const productHashes = Object.fromEntries(REQUIRED_MODULES.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Appearance F1 fixture</title><link rel="stylesheet" href="/__f1/bundle.css"><script src="/__f1/prelude.js"></script></head><body><div id="app"></div><script type="module" src="/__f1/bundle.js"></script></body></html>';
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
  await cdp("Runtime.enable");
  await cdp("Page.enable");
  await cdp("Page.addScriptToEvaluateOnNewDocument", { source: K1_AUDIT_SOURCE });
  await cdp("Fetch.enable", { patterns: [{ urlPattern: `${origin}/`, resourceType: "Document", requestStage: "Request" }] });
  await cdp("Page.bringToFront");
  await cdp("Emulation.setFocusEmulationEnabled", { enabled: true });

  async function freshLoad(path, pane, label, clearKeys = []) {
    // Uninstrumented reset of the keys this run touches, then a new document (in-memory drafts never survive it).
    if (clearKeys.length) await evaluate(`(() => { if (window.verify) for (const key of ${JSON.stringify(clearKeys)}) verify.seed(key, null); return true; })()`).catch(() => true);
    session.runnerNavigating = true;
    try { await cdp("Page.navigate", { url: `${origin}${path}` }); } finally { setTimeout(() => { if (session) session.runnerNavigating = false; }, 2500); }
    const mounted = await waitUntil(READY(pane), 20000);
    if (!mounted) pre(`${label}:production-app-mounted`, false, { diagnostics: await evaluate("({ path: location.pathname, text: (document.body.innerText || '').slice(0, 300), verify: !!window.verify, scope: window.verify ? verify.scope() : null })").catch((error) => String(error)) });
    await delay(900);
    const state = await evaluate(`({ scope: verify.scope(), auth: verify.authCalls(), location: verify.location(), paneId: verify.paneId(), physical: Object.fromEntries(${JSON.stringify(clearKeys)}.map((key) => [key, verify.physical(key)])) })`);
    pre(`${label}:production-app-mounted`, true, { state });
    pre(`${label}:auth-session-served-by-real-provider-and-account-active`, state.auth.includes("getSession") && state.scope.kind === "account" && state.scope.accountId === "f1-appearance-A" && state.scope.generation === "g1", { state });
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
    const history = await cdp("Page.getNavigationHistory");
    const index = history.currentIndex + (direction === "back" ? -1 : 1);
    const target = history.entries[index];
    pre(`${id}:traverse-${direction}-entry-exists`, Boolean(target), { currentIndex: history.currentIndex });
    await cdp("Page.navigateToHistoryEntry", { entryId: target.id });
    return { fromIndex: history.currentIndex, toIndex: index, entryId: target.id };
  }
  const opsOn = (attempts, key) => attempts.filter((entry) => entry.key === key && (entry.op === "set" || entry.op === "remove")).map((entry) => `${entry.op}:${entry.value ?? ""}${entry.outcome === "denied" ? "!denied" : ""}`);
  /** A failed Topbar theme choice (Dark) with setItem(xai_pref_theme) denied: armed, observed, bytes unchanged. */
  async function failTopbarTheme(id) {
    await evaluate('verify.denySet("xai_pref_theme")');
    const mark = await evaluate("verify.mark()");
    if (!(await evaluate("verify.topbarPopoverOpen()"))) await trustedClick(".topbar .topbar-pref-trigger", `${id}:topbar-trigger`);
    pre(`${id}:topbar-popover-open`, await waitUntil("verify.topbarPopoverOpen()", 3000));
    await clickNamed('[role="menuitemradio"]', await evaluate("verify.labels.dark.en"), ".topbar #topbar-pref-panel", `${id}:topbar-dark`);
    const fired = await waitUntil(`verify.window(${mark}).attempts.some((entry) => entry.key === "xai_pref_theme" && entry.op === "set" && entry.outcome === "denied")`, 6000);
    await delay(300);
    await pressEscape();
    pre(`${id}:topbar-popover-closed`, await waitUntil("!verify.topbarPopoverOpen()", 3000));
    const view = await evaluate(`verify.window(${mark})`);
    pre(`${id}:theme-fault-armed-and-observed`, fired && opsOn(view.attempts, "xai_pref_theme").every((entry) => entry === `set:${JSON.stringify("dark")}!denied`), { attempts: opsOn(view.attempts, "xai_pref_theme") });
    pre(`${id}:theme-bytes-unchanged`, (await evaluate('verify.physical("xai_pref_theme")')) === null);
    return opsOn(view.attempts, "xai_pref_theme");
  }
  /** A failed pane accent choice (Ocean, 230) with setItem(xai_accent_hue) denied. */
  async function failPaneAccent(id) {
    await evaluate('verify.denySet("xai_accent_hue")');
    const mark = await evaluate("verify.mark()");
    await clickNamed(".accent-sw", (await evaluate("verify.labels.ocean")).en, '.settings-detail[data-pane="appearance"] .appearance-pane', `${id}:accent-ocean`);
    const fired = await waitUntil(`verify.window(${mark}).attempts.some((entry) => entry.key === "xai_accent_hue" && entry.op === "set" && entry.outcome === "denied")`, 6000);
    await delay(300);
    const view = await evaluate(`verify.window(${mark})`);
    pre(`${id}:accent-fault-armed-and-observed`, fired && opsOn(view.attempts, "xai_accent_hue").every((entry) => entry === "set:230!denied"), { attempts: opsOn(view.attempts, "xai_accent_hue") });
    pre(`${id}:accent-bytes-unchanged`, (await evaluate('verify.physical("xai_accent_hue")')) === null);
    return opsOn(view.attempts, "xai_accent_hue");
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
  /**
   * After a sign-out confirmation the AvatarMenu stays open behind its transparent full-viewport scrim (z-index 99),
   * which intercepts pointer input outside the coordinator dialog. A user closes it by clicking the scrim; so does this.
   */
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

  const version = await cdp("Browser.getVersion");
  await cdp("Page.navigate", { url: `${origin}/app/settings/hotkeys` });
  pre("session:mounted", await waitUntil(READY("hotkeys"), 20000));
  const viewport = await evaluate("({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio })");
  record("baseline", {
    requested, resolved, resolvedTree, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix,
    browser: version.product, protocol: version.protocolVersion, viewport, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock), extracted: sha256(extractedLock), contractGate: LOCKFILE_GATE_SHA256 },
    fileSha256: { "verify-f1-appearance.mjs": runnerSha256, "f1-appearance-host.tsx": sha256(fixtureSource) },
    frozenPrelude: { path: FROZEN_PRELUDE, sha256: preludeSha256, frozenSha256: FROZEN_PRELUDE_SHA256, committedAtHeadSha256: committedPreludeSha256, lastCommit: preludeLastCommit, readOnly: true },
    contract: { path: CONTRACT_PATH, sha256AtHead: contractSha256, expected: CONTRACT_SHA256 },
    bundleSha256: sha256(js), bundleCssSha256: sha256(css),
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
    productHashes, origin: "127.0.0.1 (ephemeral port); every other host resolves to NOTFOUND; document requests for \"/\" answered 204 by the runner",
  });
  pre("baseline:docs-head-product-tree-equals-revision", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === LOCKFILE_GATE_SHA256 && sha256(archiveLock) === LOCKFILE_GATE_SHA256 && sha256(extractedLock) === LOCKFILE_GATE_SHA256);
  pre("baseline:frozen-prelude-hash-equals-committed", preludeSha256 === FROZEN_PRELUDE_SHA256 && committedPreludeSha256 === FROZEN_PRELUDE_SHA256);
  pre("baseline:contract-r3-hash", contractSha256 === CONTRACT_SHA256, { contractSha256 });
  pre("baseline:guard-no-module-from-a-checkout", guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre("baseline:required-modules-bundled-from-archive", missingRequired.length === 0, { missingRequired });
  pre("baseline:no-mount-runtime-errors", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 3) });
  pre("baseline:react-commit-observer-active", await evaluate("verify.reactCommitsObserved() > 0 && verify.coordinatorObserved() && verify.hookErrors() === 0"), {
    commits: await evaluate("verify.reactCommitsObserved()"), hookErrors: await evaluate("verify.hookErrors()"),
  });

  if (mode === "selfcheck") {
    // Fixture instruments (probe key only).
    const faults = await evaluate("verify.probeFaults()");
    pre("selfcheck:storage-faults-and-attempt-logging", faults.setDeniedThrew && faults.setDeniedNeverStored && faults.setDelegated && faults.removeDeniedThrew
      && faults.removeDeniedKeptBytes && faults.removeDelegated && isDeepStrictEqual(faults.attemptsLogged, ["set:denied", "set:ok", "remove:denied", "remove:ok"]), { faults });
    pre("selfcheck:storage-event-dispatch-counter", isDeepStrictEqual(await evaluate("verify.probeDispatch()"), ["xai_f1_selftest"]));
    const dialogsBefore = dialogs.length;
    dialogPlan.push({ accept: true, purpose: "selfcheck-probe" });
    const confirmed = await evaluate("verify.probeConfirm()");
    pre("selfcheck:real-window-confirm-answered-through-cdp", confirmed === true && dialogs.length === dialogsBefore + 1 && dialogs.at(-1).type === "confirm" && dialogs.at(-1).accepted, { dialogs: dialogs.slice(dialogsBefore) });
    const navMark = await evaluate("verify.mark()");
    await navigateTo("/app/settings/about", null, "about", "router-level-navigate-probe");
    const navView = await caseWindow(navMark);
    pre("selfcheck:router-level-navigate-trace-and-commit-trace", navView.navigateCalls.length === 1 && navView.navigateCalls[0].toPath === "/app/settings/about" && navView.commits.length === 1 && navView.commits[0].action === "PUSH", { navigateCalls: navView.navigateCalls, commits: navView.commits });

    // Surfaces without editing: Appearance pane and Topbar, More switch, sidebar row, avatar menu and the sign-out dialog.
    const surfaceMark = await evaluate("verify.mark()");
    await navigateTo(APPEARANCE.route, null, APPEARANCE.pane, "appearance-surface");
    const keys = await evaluate("verify.keys");
    const lockNames = await evaluate("verify.lockNames");
    pre("selfcheck:appearance-keys-and-lock-names", keys.length === 7 && keys.every((key) => lockNames[key] === `xai:pref:v1:${key}`) && lockNames[MORE.key] === `xai:pref:v1:${MORE.key}`, { keys, lockNames });
    await trustedClick(".topbar .topbar-pref-trigger", "surface:topbar-trigger");
    pre("selfcheck:topbar-popover-opens", await waitUntil("verify.topbarPopoverOpen()", 3000));
    await tagNamed('[role="menuitemradio"]', await evaluate("verify.labels.dark.en"), ".topbar #topbar-pref-panel", "surface:topbar-dark");
    await pointOf('[data-f1-target="1"]', "surface:topbar-dark");
    await pressEscape();
    pre("selfcheck:topbar-popover-closes-on-escape", await waitUntil("!verify.topbarPopoverOpen()", 3000));
    await tagNamed(".accent-sw", (await evaluate("verify.labels.ocean")).en, '.settings-detail[data-pane="appearance"] .appearance-pane', "surface:accent-ocean");
    await pointOf('[data-f1-target="1"]', "surface:accent-ocean");
    await evaluate('document.querySelector("[data-f1-target]")?.removeAttribute("data-f1-target")');
    await tagNamed(".settings-sidebar .list-row", await evaluate("verify.labels.appearance.en"), ".settings-sidebar", "surface:sidebar-appearance");
    await pointOf('[data-f1-target="1"]', "surface:sidebar-appearance");
    await evaluate('document.querySelector("[data-f1-target]")?.removeAttribute("data-f1-target")');
    pre("selfcheck:clean-state-has-no-appearance-status", (await evaluate("verify.appearanceStatus()")) === null);
    await trustedClick(".app-rail .rail-avatar", "surface:rail-avatar");
    pre("selfcheck:avatar-menu-opens", await waitUntil("verify.avatarMenuOpen()", 3000));
    await clickNamed(".avatar-menu .avm-item", await evaluate("verify.labels.signOut.en"), ".avatar-menu", "surface:avatar-sign-out");
    pre("selfcheck:sign-out-confirm-dialog-opens", await waitUntil("verify.signOutDialogOpen()", 3000));
    await trustedClick("dialog.xai-sign-out-dialog .xai-sign-out-dialog__btn--cancel", "surface:sign-out-cancel");
    pre("selfcheck:sign-out-dialog-cancel-closes-without-signing-out", await waitUntil("!verify.signOutDialogOpen()", 3000) && (await evaluate("verify.scope().kind")) === "account" && !(await evaluate("verify.authCalls().includes('signOut')")));
    if (await evaluate("verify.avatarMenuOpen()")) await pressEscape();
    await navigateTo(MORE.route, null, MORE.pane, "more-surface");
    await pointOf(MORE.toggle, "surface:more-toggle");
    const surfaceView = await caseWindow(surfaceMark);
    pre("selfcheck:surfaces-made-zero-writes-on-appearance-and-more-keys", surfaceView.attempts.filter((entry) => [...keys, MORE.key].includes(entry.key)).length === 0, { attempts: surfaceView.attempts.filter((entry) => [...keys, MORE.key].includes(entry.key)) });

    // pc1: a programmatic sidebar departure held by a More draft, released by a More Retry to the Appearance pane.
    {
      const id = "pc1-sidebar-release";
      await freshLoad(MORE.route, MORE.pane, id, [MORE.key]);
      const errorsAt = runtimeErrors.length;
      const caseMark = await evaluate("verify.mark()");
      const latest = await failMore(id);
      const S = await evaluate("verify.location()");
      const holdMark = await evaluate("verify.mark()");
      await clickNamed(".settings-sidebar .list-row", await evaluate("verify.labels.appearance.en"), ".settings-sidebar", `${id}:sidebar-appearance`);
      const shown = await waitUntil("verify.dialog() !== null", 4000);
      await delay(400);
      const hold = await evaluate(`({ dialog: verify.dialog(), location: verify.location(), view: verify.window(${holdMark}) })`);
      pre(`${id}:held-dialog-open-location-unchanged-no-navigation`, shown && hold.dialog?.label === MORE.label && sameTriple(hold.location, S) && hold.view.commits.length === 0
        && hold.view.navigateCalls.length === 0 && hold.view.blockerCalls.length === 0 && hold.view.history.length === 0, { dialog: hold.dialog, location: triple(hold.location), view: { commits: hold.view.commits, navigateCalls: hold.view.navigateCalls, blockerCalls: hold.view.blockerCalls, history: hold.view.history } });
      const releaseMark = await evaluate("verify.mark()");
      await evaluate(`verify.allow(${JSON.stringify(MORE.key)})`);
      await clickNamed("button", MORE.retry, ".settings-detail", `${id}:more-retry`);
      const left = await waitUntil(`verify.location().pathname === ${JSON.stringify(APPEARANCE.route)}`, 6000);
      await delay(800);
      const state = await evaluate(`({ location: verify.location(), dialog: verify.dialog(), paneId: verify.paneId(), physical: verify.physical(${JSON.stringify(MORE.key)}), view: verify.window(${releaseMark}) })`);
      const writes = opsOn(state.view.attempts, MORE.key);
      const counts = f1Counts(await caseWindow(caseMark), runtimeErrors.slice(errorsAt));
      const releases = state.view.navigateCalls.filter((entry) => entry.toPath === APPEARANCE.route).length + state.view.blockerCalls.filter((entry) => entry.op === "proceed").length;
      record("observation", { case: id, releaseMechanism: "programmatic intent held by the coordinator's navigate wrapper; released by one replay of the router's navigate", latest, writes, navigateCalls: state.view.navigateCalls, blockerCalls: state.view.blockerCalls, commits: state.view.commits, history: state.view.history, counts, timeline: timeline(state.view, [MORE.key]) });
      pre(`${id}:released-exactly-once-to-appearance`, left && state.paneId === APPEARANCE.pane && state.view.commits.length === 1 && state.view.commits[0].pathname === APPEARANCE.route && state.view.commits[0].action === "PUSH"
        && state.view.history.filter((entry) => entry.method === "pushState").length === 1 && state.view.history.filter((entry) => entry.method === "replaceState").length === 0, { commits: state.view.commits, history: state.view.history });
      pre(`${id}:one-release-zero-non-live-blocker-calls`, releases === 1 && counts.nonLiveBlockerCalls === 0 && counts.resets === 0 && counts.duplicateProceeds === 0, { releases, counts });
      pre(`${id}:dialog-closed-latest-written-once`, state.dialog === null && isDeepStrictEqual(writes, [`set:${latest}`]) && state.physical === latest, { writes, physical: state.physical });
      pre(`${id}:zero-runtime-errors`, counts.runtimeErrors === 0, { counts, errors: runtimeErrors.slice(errorsAt, errorsAt + 3) });
      outcomes.push({ case: id, held: true, released: true, ...counts });
    }
    // pc2: a held browser Back released by a More Retry (one live proceed() from "blocked").
    {
      const id = "pc2-back-release";
      await freshLoad("/app/settings/hotkeys", "hotkeys", id, [MORE.key]);
      const errorsAt = runtimeErrors.length;
      const caseMark = await evaluate("verify.mark()");
      const P = await navigateTo(P_ENTRY.pathname, P_ENTRY.state, "about", `${id}:p`);
      const S = await navigateTo(MORE.route, null, MORE.pane, `${id}:s`);
      const initialStack = await cdp("Page.getNavigationHistory");
      pre(`${id}:history-p-then-s`, initialStack.entries.length >= 3 && P.key !== S.key, { P, S });
      const latest = await failMore(id);
      const holdMark = await evaluate("verify.mark()");
      const step = await traverse(id, "back");
      const settled = await waitUntil(`verify.dialog() !== null || verify.location().key === ${JSON.stringify(P.key)}`, 4000);
      await delay(400);
      const hold = await evaluate(`({ location: verify.location(), windowPath: verify.windowPath(), dialog: verify.dialog(), view: verify.window(${holdMark}) })`);
      const heldBlocked = hold.view.react.filter((entry) => entry.coord && entry.coord.s === "blocked" && entry.live && entry.live.id === entry.coord.b && entry.live.state === "blocked");
      pre(`${id}:back-held-dialog-open-url-restored`, settled && hold.dialog?.label === MORE.label && sameTriple(hold.location, S) && hold.windowPath === S.pathname && hold.view.commits.length === 0, { step, dialog: hold.dialog, location: triple(hold.location), windowPath: hold.windowPath, commits: hold.view.commits });
      pre(`${id}:commit-observer-saw-live-blocked-blocker`, heldBlocked.length > 0, { coordinatorCommits: hold.view.react.filter((entry) => entry.coord).length });
      const releaseMark = await evaluate("verify.mark()");
      await evaluate(`verify.allow(${JSON.stringify(MORE.key)})`);
      await clickNamed("button", MORE.retry, ".settings-detail", `${id}:more-retry`);
      const left = await waitUntil(`verify.location().key === ${JSON.stringify(P.key)}`, 6000);
      await delay(800);
      const state = await evaluate(`({ location: verify.location(), windowPath: verify.windowPath(), dialog: verify.dialog(), physical: verify.physical(${JSON.stringify(MORE.key)}), view: verify.window(${releaseMark}) })`);
      const stackAfter = await cdp("Page.getNavigationHistory");
      const proceeds = state.view.blockerCalls.filter((entry) => entry.op === "proceed");
      const counts = f1Counts(await caseWindow(caseMark), runtimeErrors.slice(errorsAt));
      record("observation", { case: id, latest, blockerCalls: state.view.blockerCalls, navigateCalls: state.view.navigateCalls, commits: state.view.commits, counts, timeline: timeline(state.view, [MORE.key]) });
      pre(`${id}:location-deep-equal-p`, left && sameTriple(state.location, P) && state.windowPath === P.pathname, { location: triple(state.location), expected: triple(P) });
      pre(`${id}:exactly-one-pop-commit-zero-push-replace`, state.view.commits.length === 1 && state.view.commits[0].key === P.key && state.view.commits[0].action === "POP"
        && state.view.history.length === 0 && state.view.pops.length === 1 && stackAfter.entries.length === initialStack.entries.length, { commits: state.view.commits, history: state.view.history, pops: state.view.pops.length });
      pre(`${id}:exactly-one-live-proceed-from-blocked-zero-non-live-calls`, proceeds.length === 1 && proceeds[0].liveState === "blocked" && proceeds[0].liveBlocker === proceeds[0].blocker
        && counts.nonLiveBlockerCalls === 0 && counts.resets === 0 && !state.view.blockerCalls.some((entry) => entry.threw), { blockerCalls: state.view.blockerCalls });
      pre(`${id}:dialog-closed-latest-written-once`, state.dialog === null && isDeepStrictEqual(opsOn(state.view.attempts, MORE.key), [`set:${latest}`]) && state.physical === latest);
      pre(`${id}:zero-runtime-errors`, counts.runtimeErrors === 0, { counts, errors: runtimeErrors.slice(errorsAt, errorsAt + 3) });
      outcomes.push({ case: id, held: true, released: true, ...counts });
    }
    // pc3: sign-out through the real UI while a More draft is held: coordinator dialog, Stay resolves false.
    {
      const id = "pc3-signout-held-stay";
      await freshLoad(MORE.route, MORE.pane, id, [MORE.key]);
      const errorsAt = runtimeErrors.length;
      const caseMark = await evaluate("verify.mark()");
      await failMore(id);
      const S = await evaluate("verify.location()");
      const sign = await signOutThroughUi(id);
      const shown = await waitUntil("verify.dialog() !== null", 4000);
      await delay(600);
      const held = await evaluate(`({ dialog: verify.dialog(), scope: verify.scope(), location: verify.location(), view: verify.window(${sign.mark}) })`);
      pre(`${id}:no-javascript-dialog-and-coordinator-holds`, shown && dialogs.length === sign.dialogsAt && held.dialog?.label === MORE.label && held.scope.kind === "account"
        && !held.view.auth.some((entry) => entry.call === "signOut") && navigationRequests.length === sign.requestsAt, { dialog: held.dialog, scope: held.scope, dialogs: dialogs.slice(sign.dialogsAt) });
      const stayMark = await evaluate("verify.mark()");
      await clickNamed("button", "Stay", DIALOG, `${id}:stay`);
      await delay(900);
      const after = await evaluate(`({ dialog: verify.dialog(), scope: verify.scope(), location: verify.location(), view: verify.window(${sign.mark}), stayView: verify.window(${stayMark}) })`);
      const counts = f1Counts(await caseWindow(caseMark), runtimeErrors.slice(errorsAt));
      record("observation", { case: id, dialogs: dialogs.slice(sign.dialogsAt), scopeAfter: after.scope, authAfterSignOut: after.view.auth, navigationRequests: navigationRequests.slice(sign.requestsAt), counts, timeline: timeline(after.view, [MORE.key]) });
      pre(`${id}:stay-resolves-false-identity-intact-zero-history-mutations`, after.dialog === null && after.scope.kind === "account" && after.scope.accountId === "f1-appearance-A" && after.view.scope.length === 0
        && !after.view.auth.some((entry) => entry.call === "signOut") && navigationRequests.length === sign.requestsAt && after.view.history.length === 0 && after.view.commits.length === 0 && sameTriple(after.location, S),
      { scope: after.scope, scopeTransitions: after.view.scope, auth: after.view.auth, history: after.view.history, commits: after.view.commits });
      pre(`${id}:more-draft-kept`, await buttonPresent(MORE.retry));
      pre(`${id}:zero-runtime-errors`, counts.runtimeErrors === 0, { counts, errors: runtimeErrors.slice(errorsAt, errorsAt + 3) });
      await closeAvatarMenu(id);
      await clickNamed("button", MORE.discard, ".settings-detail", `${id}:more-discard`);
      await evaluate("verify.restore()");
      outcomes.push({ case: id, held: true, released: false, ...counts });
    }
    // pc4: sign-out from /app/tasks without drafts resolves true (identity invalidated, signOut, navigation to "/").
    {
      const id = "pc4-signout-proceeds";
      await freshLoad("/app/tasks", null, id, [MORE.key, "xai_pref_theme", "xai_accent_hue"]);
      const errorsAt = runtimeErrors.length;
      const caseMark = await evaluate("verify.mark()");
      const sign = await signOutThroughUi(id);
      const invalidated = await waitUntil(`verify.window(${sign.mark}).scope.some((entry) => entry.kind === "locked" && entry.accountId === null)`, 5000);
      const requested = await waitFor(() => navigationRequests.length > sign.requestsAt, 5000);
      await delay(800);
      const after = await evaluate(`({ scope: verify.scope(), path: location.pathname, view: verify.window(${sign.mark}) })`);
      const counts = f1Counts(await caseWindow(caseMark), runtimeErrors.slice(errorsAt));
      record("observation", { case: id, dialogs: dialogs.slice(sign.dialogsAt), scopeTransitions: after.view.scope, auth: after.view.auth, navigationRequests: navigationRequests.slice(sign.requestsAt), frameNavigations: frameNavigations.slice(sign.frameNavigationsAt), documentStillAt: after.path, history: after.view.history, commits: after.view.commits, counts, runtimeErrors: runtimeErrors.slice(errorsAt).map((entry) => entry.text.slice(0, 200)) });
      pre(`${id}:no-javascript-dialog`, dialogs.length === sign.dialogsAt, { dialogs: dialogs.slice(sign.dialogsAt) });
      pre(`${id}:resolves-true-identity-invalidated-signout-navigation`, invalidated && requested && after.view.auth.filter((entry) => entry.call === "signOut").length === 1
        && navigationRequests.slice(sign.requestsAt).every((entry) => entry.url === `${origin}/`), { scope: after.view.scope, auth: after.view.auth, navigationRequests: navigationRequests.slice(sign.requestsAt) });
      outcomes.push({ case: id, held: false, released: false, ...counts });
    }
    pre("selfcheck:positive-controls-zero-f1-signature", outcomes.length === 4 && outcomes.every((entry) => !entry.f1Signature && entry.duplicateProceeds === 0 && entry.nonLiveBlockerCalls === 0), { outcomes });
    runVerdict = "harness-valid";
  }

  if (mode === "appearance") {
    // a1 (host row m): failed Topbar choice + More draft held by the Settings coordinator; activate the Topbar status.
    {
      const id = "a1";
      await freshLoad(MORE.route, MORE.pane, id, [MORE.key, "xai_pref_theme", "xai_accent_hue"]);
      const errorsAt = runtimeErrors.length;
      const caseMark = await evaluate("verify.mark()");
      const themeOps = await failTopbarTheme(id);
      const latest = await failMore(id);
      const S = await evaluate("verify.location()");
      const status = await evaluate("verify.appearanceStatus()");
      const present = observe(`${id}:appearance-status-control-exists`, status !== null && status.inTopbarControls, { status, expectedAccessibleName: STATUS_NAME });
      const outcome = { case: id, scenario: "host row m: status navigation held by the More coordinator, released by a More Retry", themeOps, statusPresent: status !== null };
      if (status === null) {
        outcome.state = "before-absent";
        outcome.note = "no Topbar status control exists, so there is nothing to activate (correct before state; not an F1 signature)";
      } else if (!present) {
        outcome.state = "fail";
        outcome.note = "a status control exists but not inside the Topbar controls (contract §7 item 2 placement)";
      } else {
        const holdMark = await evaluate("verify.mark()");
        await trustedClick('[data-testid="appearance-status"]', `${id}:appearance-status`);
        const shown = await waitUntil("verify.dialog() !== null", 4000);
        await delay(400);
        const hold = await evaluate(`({ dialog: verify.dialog(), location: verify.location(), view: verify.window(${holdMark}) })`);
        const held = observe(`${id}:status-navigation-held-by-coordinator-dialog`, shown && hold.dialog?.label === MORE.label && sameTriple(hold.location, S) && hold.view.commits.length === 0 && hold.view.history.length === 0,
          { dialog: hold.dialog, location: triple(hold.location), commits: hold.view.commits, history: hold.view.history, navigateCalls: hold.view.navigateCalls, blockerCalls: hold.view.blockerCalls });
        if (held) {
          const releaseMark = await evaluate("verify.mark()");
          await evaluate(`verify.allow(${JSON.stringify(MORE.key)})`);
          await clickNamed("button", MORE.retry, ".settings-detail", `${id}:more-retry`);
          const left = await waitUntil(`verify.location().pathname === ${JSON.stringify(APPEARANCE.route)}`, 6000);
          await delay(800);
          const state = await evaluate(`({ location: verify.location(), dialog: verify.dialog(), paneId: verify.paneId(), physical: verify.physical(${JSON.stringify(MORE.key)}), view: verify.window(${releaseMark}) })`);
          const releases = state.view.navigateCalls.filter((entry) => entry.toPath === APPEARANCE.route).length + state.view.blockerCalls.filter((entry) => entry.op === "proceed" && entry.liveState === "blocked" && entry.liveBlocker === entry.blocker).length;
          const nonLive = state.view.blockerCalls.filter((entry) => entry.blocker !== entry.liveBlocker || entry.liveState !== "blocked");
          observe(`${id}:released-exactly-once-to-appearance-one-commit`, left && state.paneId === APPEARANCE.pane && state.view.commits.length === 1 && state.view.commits[0].pathname === APPEARANCE.route, { commits: state.view.commits, history: state.view.history });
          observe(`${id}:one-live-release-zero-non-live-blocker-calls`, releases === 1 && nonLive.length === 0 && !state.view.blockerCalls.some((entry) => entry.op === "reset" || entry.threw), { releases, navigateCalls: state.view.navigateCalls, blockerCalls: state.view.blockerCalls });
          observe(`${id}:dialog-closed-more-latest-written-once`, state.dialog === null && isDeepStrictEqual(opsOn(state.view.attempts, MORE.key), [`set:${latest}`]) && state.physical === latest, { writes: opsOn(state.view.attempts, MORE.key), physical: state.physical });
          outcome.release = { releases, commits: state.view.commits, timeline: timeline(state.view, [MORE.key, "xai_pref_theme"]) };
        }
      }
      const view = await caseWindow(caseMark);
      const counts = f1Counts(view, runtimeErrors.slice(errorsAt));
      observe(`${id}:zero-runtime-errors-no-error-boundary`, counts.runtimeErrors === 0, { counts, errors: runtimeErrors.slice(errorsAt, errorsAt + 3) });
      if (!outcome.state) outcome.state = deferredFailures.some((entry) => entry.startsWith(`${id}:`)) ? "fail" : "fixed-pass";
      outcomes.push({ ...outcome, ...counts });
      record("observation", { ...outcome, ...counts, timeline: timeline(view, [MORE.key, "xai_pref_theme"]) });
      await evaluate("verify.restore()");
    }
    // a2: Back from the Appearance pane after a failed Appearance (accent) choice.
    {
      const id = "a2";
      await freshLoad("/app/settings/hotkeys", "hotkeys", id, [MORE.key, "xai_pref_theme", "xai_accent_hue"]);
      const errorsAt = runtimeErrors.length;
      const caseMark = await evaluate("verify.mark()");
      const P = await navigateTo(P_ENTRY.pathname, P_ENTRY.state, "about", `${id}:p`);
      const S = await navigateTo(APPEARANCE.route, null, APPEARANCE.pane, `${id}:s`);
      const initialStack = await cdp("Page.getNavigationHistory");
      pre(`${id}:history-p-then-s`, initialStack.entries.length >= 3 && P.key !== S.key, { P, S });
      const accentOps = await failPaneAccent(id);
      const holdMark = await evaluate("verify.mark()");
      const step = await traverse(id, "back");
      const settled = await waitUntil(`verify.dialog() !== null || verify.location().key === ${JSON.stringify(P.key)}`, 4000);
      await delay(600);
      const state = await evaluate(`({ location: verify.location(), windowPath: verify.windowPath(), dialog: verify.dialog(), paneId: verify.paneId(), status: verify.appearanceStatus(), view: verify.window(${holdMark}) })`);
      const notHeld = observe(`${id}:back-not-held-location-deep-equal-p`, settled && state.dialog === null && sameTriple(state.location, P) && state.windowPath === P.pathname, { step, dialog: state.dialog, location: triple(state.location), expected: triple(P) });
      observe(`${id}:zero-blocker-calls-one-pop-commit-zero-push-replace`, state.view.blockerCalls.length === 0 && state.view.commits.length === 1 && state.view.commits[0].action === "POP" && state.view.commits[0].key === P.key && state.view.history.length === 0,
        { blockerCalls: state.view.blockerCalls, commits: state.view.commits, history: state.view.history });
      const indicator = observe(`${id}:topbar-status-shown-on-destination`, state.status !== null && state.status.inTopbarControls, { status: state.status, expectedAccessibleName: STATUS_NAME });
      const outcome = { case: id, scenario: "Back from the Appearance pane with a failed Appearance choice", accentOps, held: !notHeld, statusShown: state.status !== null };
      if (notHeld && state.status === null) {
        outcome.state = "before-no-indicator";
        outcome.note = "the POP departure is not held (A5 keeps that) and no Topbar status exists (correct before state; not an F1 signature)";
      } else if (notHeld && indicator) {
        await traverse(`${id}:return`, "forward");
        const back = await waitUntil(`verify.location().key === ${JSON.stringify(S.key)} && verify.paneId() === "appearance"`, 6000);
        await delay(600);
        const intact = observe(`${id}:draft-intact-after-forward`, back && (await evaluate(`verify.detailText().includes(${JSON.stringify(ACCENT_FAILED)})`)) && (await buttonPresent(RETRY_ACCENT)), { detail: (await evaluate("verify.detailText()")).slice(0, 400) });
        outcome.draftIntact = intact;
      }
      const view = await caseWindow(caseMark);
      const counts = f1Counts(view, runtimeErrors.slice(errorsAt));
      observe(`${id}:zero-runtime-errors-no-error-boundary`, counts.runtimeErrors === 0, { counts, errors: runtimeErrors.slice(errorsAt, errorsAt + 3) });
      if (!outcome.state) outcome.state = deferredFailures.some((entry) => entry.startsWith(`${id}:`)) ? "fail" : "fixed-pass";
      outcomes.push({ ...outcome, ...counts });
      record("observation", { ...outcome, ...counts, timeline: timeline(view, ["xai_accent_hue"]) });
      await evaluate("verify.restore()");
    }
    // a3: sign-out from the More pane with an Appearance draft and a More draft.
    {
      const id = "a3";
      await freshLoad(MORE.route, MORE.pane, id, [MORE.key, "xai_pref_theme", "xai_accent_hue"]);
      const errorsAt = runtimeErrors.length;
      const caseMark = await evaluate("verify.mark()");
      const themeOps = await failTopbarTheme(id);
      await failMore(id);
      const S = await evaluate("verify.location()");
      dialogPlan.push({ accept: true, purpose: "a3: OK at the Appearance sign-out step" });
      const sign = await signOutThroughUi(id);
      const appeared = await waitFor(() => dialogs.length > sign.dialogsAt, 1500);
      if (!appeared) dialogPlan.splice(dialogPlan.findIndex((plan) => plan.purpose?.startsWith("a3:")), 1);
      const shown = await waitUntil("verify.dialog() !== null", 4000);
      await delay(600);
      const confirms = dialogs.slice(sign.dialogsAt);
      const held = await evaluate(`({ dialog: verify.dialog(), scope: verify.scope(), location: verify.location(), view: verify.window(${sign.mark}) })`);
      const step = observe(`${id}:appearance-sign-out-step-asked-once-with-normative-text-ok`, confirms.length === 1 && confirms[0].type === "confirm" && confirms[0].message === SIGN_OUT_STEP_TEXT && confirms[0].accepted, { confirms, expected: SIGN_OUT_STEP_TEXT });
      const coordinatorHeld = observe(`${id}:coordinator-holds-after-the-appearance-step`, shown && held.dialog?.label === MORE.label && held.scope.kind === "account" && !held.view.auth.some((entry) => entry.call === "signOut"), { dialog: held.dialog, scope: held.scope });
      let stayFalse = false;
      if (shown) {
        await clickNamed("button", "Stay", DIALOG, `${id}:stay`);
        await delay(900);
        const after = await evaluate(`({ dialog: verify.dialog(), scope: verify.scope(), location: verify.location(), view: verify.window(${sign.mark}) })`);
        stayFalse = observe(`${id}:stay-resolves-false-identity-intact-zero-history-mutations`, after.dialog === null && after.scope.kind === "account" && after.view.scope.length === 0 && !after.view.auth.some((entry) => entry.call === "signOut")
          && navigationRequests.length === sign.requestsAt && after.view.history.length === 0 && after.view.commits.length === 0 && sameTriple(after.location, S),
        { scope: after.scope, scopeTransitions: after.view.scope, auth: after.view.auth, history: after.view.history, commits: after.view.commits, navigationRequests: navigationRequests.slice(sign.requestsAt) });
      }
      const outcome = { case: id, scenario: "sign-out with Appearance and More drafts", themeOps, appearanceConfirms: confirms.length, coordinatorHeld: shown && held.dialog?.label === MORE.label, stayResolvedFalse: stayFalse };
      if (confirms.length === 0 && outcome.coordinatorHeld && stayFalse) {
        outcome.state = "before-no-appearance-step";
        outcome.note = "no Appearance sign-out step (zero window.confirm); only the coordinator holds, and Stay resolves false (correct before state; not an F1 signature)";
      }
      await closeAvatarMenu(id);
      if (await buttonPresent(MORE.discard)) await clickNamed("button", MORE.discard, ".settings-detail", `${id}:more-discard`);
      const view = await caseWindow(caseMark);
      const counts = f1Counts(view, runtimeErrors.slice(errorsAt));
      observe(`${id}:zero-runtime-errors-no-error-boundary`, counts.runtimeErrors === 0, { counts, errors: runtimeErrors.slice(errorsAt, errorsAt + 3) });
      if (!outcome.state) outcome.state = (step && coordinatorHeld && stayFalse && counts.runtimeErrors === 0) ? "fixed-pass" : "fail";
      outcomes.push({ ...outcome, ...counts });
      record("observation", { ...outcome, ...counts, confirms, timeline: timeline(view, [MORE.key, "xai_pref_theme"]) });
      await evaluate("verify.restore()");
    }
    // a4: sign-out from /app/tasks with a failed Topbar choice; Cancel at the Appearance step.
    {
      const id = "a4";
      await freshLoad("/app/tasks", null, id, [MORE.key, "xai_pref_theme", "xai_accent_hue"]);
      const errorsAt = runtimeErrors.length;
      const caseMark = await evaluate("verify.mark()");
      const themeOps = await failTopbarTheme(id);
      dialogPlan.push({ accept: false, purpose: "a4: Cancel at the Appearance sign-out step" });
      const sign = await signOutThroughUi(id);
      const appeared = await waitFor(() => dialogs.length > sign.dialogsAt, 1500);
      if (!appeared) dialogPlan.splice(dialogPlan.findIndex((plan) => plan.purpose?.startsWith("a4:")), 1);
      await waitUntil(`verify.window(${sign.mark}).scope.some((entry) => entry.kind === "locked")`, 3000);
      await waitFor(() => navigationRequests.length > sign.requestsAt, appeared ? 800 : 4000);
      await delay(800);
      const confirms = dialogs.slice(sign.dialogsAt);
      const after = await evaluate(`({ scope: verify.scope(), location: verify.location(), status: verify.appearanceStatus(), view: verify.window(${sign.mark}) })`);
      const requests = navigationRequests.slice(sign.requestsAt);
      const invalidated = after.view.scope.some((entry) => entry.kind === "locked" && entry.accountId === null);
      const signOuts = after.view.auth.filter((entry) => entry.call === "signOut").length;
      observe(`${id}:appearance-sign-out-step-asked-once-with-normative-text-cancel`, confirms.length === 1 && confirms[0].type === "confirm" && confirms[0].message === SIGN_OUT_STEP_TEXT && !confirms[0].accepted, { confirms, expected: SIGN_OUT_STEP_TEXT });
      observe(`${id}:cancel-resolves-false-identity-intact-zero-history-mutations`, !invalidated && after.scope.kind === "account" && signOuts === 0 && requests.length === 0 && after.view.history.length === 0 && after.view.commits.length === 0,
        { scope: after.scope, scopeTransitions: after.view.scope, signOuts, navigationRequests: requests, history: after.view.history, commits: after.view.commits });
      observe(`${id}:topbar-status-kept`, after.status !== null && after.status.inTopbarControls, { status: after.status, expectedAccessibleName: STATUS_NAME });
      const outcome = { case: id, scenario: "sign-out from /app/tasks with a failed Topbar choice; Cancel at the new step", themeOps, appearanceConfirms: confirms.length, identityInvalidated: invalidated, signOutCalls: signOuts, navigationRequests: requests.map((entry) => entry.url) };
      if (confirms.length === 0 && invalidated && signOuts === 1 && requests.length >= 1) {
        outcome.state = "before-unprotected";
        outcome.note = "no Appearance step: handleSignOut resolved true, invalidated identity, called client.auth.signOut and requested \"/\" (correct before state; not an F1 signature)";
      }
      const view = await caseWindow(caseMark);
      const counts = f1Counts(view, runtimeErrors.slice(errorsAt));
      observe(`${id}:zero-runtime-errors-no-error-boundary`, counts.runtimeErrors === 0, { counts, errors: runtimeErrors.slice(errorsAt, errorsAt + 3) });
      if (!outcome.state) outcome.state = deferredFailures.some((entry) => entry.startsWith(`${id}:`)) ? "fail" : "fixed-pass";
      outcomes.push({ ...outcome, ...counts });
      record("observation", { ...outcome, ...counts, confirms, scopeTransitions: after.view.scope, auth: after.view.auth, frameNavigations: frameNavigations.slice(sign.frameNavigationsAt), documentStillAt: after.location, timeline: timeline(view, ["xai_pref_theme"]) });
      await evaluate("verify.restore()").catch(() => {});
    }
    const BEFORE = { a1: "before-absent", a2: "before-no-indicator", a3: "before-no-appearance-step", a4: "before-unprotected" };
    const signatureFree = outcomes.every((entry) => entry.duplicateProceeds === 0 && entry.nonLiveBlockerCalls === 0 && entry.runtimeErrors === 0 && !entry.f1Signature);
    const allBefore = outcomes.length === 4 && outcomes.every((entry) => entry.state === BEFORE[entry.case]);
    const allFixed = outcomes.length === 4 && outcomes.every((entry) => entry.state === "fixed-pass");
    runVerdict = outcomes.some((entry) => entry.f1Signature) ? "f1-signature" : allFixed && signatureFree && deferredFailures.length === 0 ? "fixed-pass" : allBefore && signatureFree ? "before-correct" : "fail";
    record("observation", { id: "appearance:summary", states: Object.fromEntries(outcomes.map((entry) => [entry.case, entry.state])), expectedBefore: BEFORE,
      f1SignatureCounts: Object.fromEntries(outcomes.map((entry) => [entry.case, { duplicateProceeds: entry.duplicateProceeds, nonLiveBlockerCalls: entry.nonLiveBlockerCalls, runtimeErrors: entry.runtimeErrors, invalidTransitionThrows: entry.invalidTransitionThrows }])), zeroSignature: ZERO_SIGNATURE, signatureFree });
  }

  pre("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs });
  pre("run:react-observer-never-threw", (await evaluate("verify.hookErrors()")) === 0);
  // K-1 key audit: the last document; recorded only (reproduction, no precondition).
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
    record("observation", { id: "k1:keyboard-audit", dispatch: "frozen: rawKeyDown + keyUp with nativeVirtualKeyCode 27 (reproduction; no precondition)", ...summary, perDocument: k1.documents });
  }
} catch (error) {
  harnessError = error;
  runVerdict = "harness-invalid";
} finally {
  const pass = harnessError === null && (mode === "selfcheck" ? runVerdict === "harness-valid" : runVerdict === "fixed-pass");
  record("result", {
    pass, harnessValid: harnessError === null, verdict: runVerdict, mode, checks, deferredFailures, outcomes: outcomes.map((entry) => ({ case: entry.case, state: entry.state ?? null, held: entry.held ?? null, f1Signature: entry.f1Signature, proceeds: entry.proceeds, duplicateProceeds: entry.duplicateProceeds, nonLiveBlockerCalls: entry.nonLiveBlockerCalls, invalidTransitionThrows: entry.invalidTransitionThrows, runtimeErrors: entry.runtimeErrors })),
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
}
