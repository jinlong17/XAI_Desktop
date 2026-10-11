/**
 * CP-APPRAIL-01 batch 64 (contract r1 §13 Features row "Native downstream … and native host", §15 E24) COPY of
 * ../web-appearance-recovery-final/native-host-harness.mjs (SHA-256
 * afa313f8e3562fe931871ae0182d0faa2193ac0291478c0c75ca266abc5e71cf, the accepted Appearance E25 copy, not modified),
 * which is itself the copy described in the next paragraph. It serves byte-identical copies of
 * ../web-features-recovery-native/{verify-native-host.mjs, native-host-matrix.tsx, verify-native-downstream.mjs,
 * native-downstream.tsx, native-host-prelude.js} beside it. Exactly one change against that copy, marked "E24 copy"
 * below: the product-delta precondition "baseline:fixed-delta-is-features-then-appearance-section-11" is replaced by
 * "baseline:fixed-delta-is-features-then-appearance-then-apprail-section-11": the f359be6..fixed delta must be exactly
 * the Features delta f359be6..5cd63ff (non-empty, all in the Features package) plus the 26 Appearance contract r3 §11
 * files of 5cd63ff..419e56d plus the 19 AppRail contract r1 §11 files of 419e56d..fixed. The K-1 key audit of that
 * copy is kept unchanged; every other precondition, transport, flag, instrument, check and verdict is unchanged.
 * Evidence goes to this directory.
 *
 * CP-APPEARANCE-01 batch 51 (contract r3 §14 E25) COPY of ../web-features-recovery-native/native-host-harness.mjs
 * (SHA-256 499fca4c54c2f197ec54cec229859e970ca988da95f7d3b8b87f09456fecf4e4, frozen, not modified). It serves the
 * byte-identical copies of ./verify-native-downstream.mjs (82df2961…), ./native-downstream.tsx (9b77055e…) and
 * ./native-host-prelude.js (01acaa5d…) beside it. Exactly two changes, both marked "E25 copy" below:
 *   1. The caller-bound precondition "baseline:fixed-delta-only-in-features-package" (the f359be6..fixed product delta
 *      must lie in the Features package; true only at the Features fixed revision 5cd63ff) is replaced by
 *      "baseline:fixed-delta-is-features-then-appearance-section-11": the f359be6..fixed delta must be exactly the
 *      Features delta f359be6..5cd63ff (non-empty, all in the Features package) plus the 26 Appearance contract r3 §11
 *      files of 5cd63ff..fixed. Every other precondition, including "every bundled archive module outside that delta is
 *      byte-identical to f359be6", is unchanged.
 *   2. A passive K-1 key audit (control plane, K-1 ruling): a window capture-phase recorder of keydown, keypress and
 *      keyup reports through a CDP binding in every document; at the end the run-level precondition
 *      "run:k1-keyboard-trace-contains-only-the-runner-key-presses" requires exactly the runner's own presses (one
 *      trusted keydown and keyup each, in order, in the pressed document, no keypress). pressKey already sends no
 *      nativeVirtualKeyCode (unchanged). The recorder never calls preventDefault or stopPropagation.
 * Transport, flags, instruments, checks and verdicts are the frozen harness's code. Evidence goes to this directory.
 *
 * CP-FEATURES-01 batch 28 (contract §14 E12, E13): shared harness of ./verify-native-host.mjs (E12, Settings host
 * composition) and ./verify-native-downstream.mjs (E13, production App composition). Parent-role native verifier;
 * verification only. It repairs nothing, accepts nothing and changes no product file, contract, ledger or existing
 * evidence. It follows the harness of ./verify-native-fixed.mjs and ../web-sticky-recovery-native/verify-host.mjs
 * (both read, never modified).
 *
 * - Product: an immutable `git archive <revision>`; the mode's fixture is bundled with esbuild from stdin with
 *   resolveDir = that archive. Every `@repo/*` specifier is pinned to the archive's own package export; a guard
 *   plugin fails the build if any module is loaded from the packages/, apps/ or docs/ tree of the dependency
 *   checkout or of this runner's checkout. Third-party modules come from XAI_DEPS_ROOT only when its
 *   pnpm-lock.yaml SHA-256 equals the archive's (consistency gate).
 * - Page: ./native-host-prelude.js (classic script, instruments) then the bundle, served from 127.0.0.1 only;
 *   every other host resolves to NOTFOUND; isolated headless Chrome profile and download directory; CDP trusted
 *   mouse/key input after a centre hit-test; JavaScript dialogs answered through Page.handleJavaScriptDialog by
 *   plan (an unplanned dialog is recorded as unexpected).
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log` in this directory; existing evidence is never
 *   overwritten (existence check before anything is archived, `wx` on write). Exit 0 = harness valid and every
 *   check PASS; 2 = harness valid and a product check FAILED; 1 = harness invalid (a precondition).
 */
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export const BEFORE_REVISION = "f359be6d838393e0f9e93efd80b88b5b09f6144e";
export const FEATURES_PACKAGE = "packages/xai-web-settings-features-panel/";
// E25 copy, change 1: the accepted Features fixed revision and the Appearance contract r3 §11 product files.
export const FEATURES_FIXED_REVISION = "5cd63ff652f02a2c726187fe12cbc796218d31c0";
export const APPEARANCE_SECTION11 = [
  ...["docs/api.md", "docs/test.md", "src/AppearancePane.tsx", "src/__tests__/AppearanceController.test.tsx", "src/__tests__/AppearancePane.bilingual.test.tsx",
    "src/__tests__/AppearancePane.focus-ring.test.tsx", "src/__tests__/AppearancePane.live-binding.test.tsx", "src/__tests__/AppearancePane.rendering.test.tsx",
    "src/__tests__/AppearancePane.save-reset.test.tsx", "src/__tests__/AppearancePane.selected-focus.test.tsx", "src/__tests__/AppearanceRetryAll.test.tsx",
    "src/__tests__/appearanceLockFixture.ts", "src/index.ts", "src/internal/AppearanceActions.tsx", "src/internal/AppearanceStatus.tsx", "src/internal/appearanceController.tsx",
    "src/internal/appearanceRecoveryCopy.ts", "src/styles.css", "src/types.ts"].map((file) => `packages/xai-web-settings-appearance/${file}`),
  ...["docs/api.md", "src/Shell.tsx", "src/Topbar.tsx", "src/__tests__/Topbar.test.tsx", "src/types.ts"].map((file) => `packages/xai-web-shell/${file}`),
  "apps/web/src/App.tsx",
  "apps/web/src/__tests__/App.appearance.test.tsx",
];
// E24 copy: the accepted Appearance fixed revision and the AppRail contract r1 §11 product files.
export const APPEARANCE_FIXED_REVISION = "419e56de9f23e4467fea806fbd4a990e1f429941";
export const APPRAIL_SECTION11 = [
  ...["docs/api.md", "docs/test.md", "src/AppRail.tsx", "src/Shell.tsx", "src/Topbar.tsx", "src/__tests__/AppRail.railorder.test.tsx", "src/__tests__/RailOrderStatus.test.tsx",
    "src/__tests__/Topbar.test.tsx", "src/__tests__/railOrderFixture.tsx", "src/__tests__/railOrderModel.test.ts", "src/index.ts", "src/internal/RailOrderStatus.tsx",
    "src/internal/railOrderController.tsx", "src/internal/railOrderCopy.ts", "src/internal/railOrderModel.ts", "src/railOrderStatus.css", "src/types.ts"].map((file) => `packages/xai-web-shell/${file}`),
  "apps/web/src/App.tsx",
  "apps/web/src/__tests__/App.railorder.test.tsx",
];
// E25 copy, change 2: the passive key recorder installed in every new document of every attached page target.
const K1_BINDING = "__k1KeyAudit";
const K1_RECORDER = `(() => { for (const type of ["keydown", "keypress", "keyup"]) window.addEventListener(type, (event) => { try { ${K1_BINDING}(JSON.stringify({ type, key: event.key, code: event.code, trusted: event.isTrusted, path: location.pathname })); } catch {} }, true); })();`;
export const sha256 = (value) => createHash("sha256").update(value).digest("hex");
export const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const IDS = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "habits", "meditation"];
export const LABEL = { tasks: "Tasks", board: "Boards", dashboard: "Dashboard", calendar: "Calendar", matrix: "Matrix", pomodoro: "Pomodoro", habits: "Habits", meditation: "Meditation" };
export const keyOf = (id) => `xai_pref_features_${id}`;
export const FEATURE_KEYS = IDS.map(keyOf);
export const LOCK_OF = (id) => `xai:pref:v1:${encodeURIComponent(keyOf(id))}`;
export const PANE = '.settings-detail[data-pane="features"] .features-pane';
export const SWITCH = (id) => `${PANE} [data-feature-id="${id}"] [role="switch"]`;
export const RESET = `${PANE} [data-testid="features-reset-defaults"]`;
export const COPY = {
  saved: "Features settings saved.",
  restored: "Defaults restored.",
  confirm: "Turn all 8 modules back on? This only changes which modules are shown; your data is kept.",
  exportDraft: "Export Features draft",
  discardAll: "Discard all changes",
  reset: "Reset to defaults",
};
export const DIALOG = { label: "Unsaved Features draft", text: "Features has unsaved changes.", buttons: ["Stay", "Export current draft", "Discard local changes and leave"] };
const MESSAGE = {
  saving: (label) => `${label} is saving.`,
  resetting: (label) => `${label} is being reset to its default.`,
  "not-saved": (label) => `${label} was not saved.`,
  "not-reset": (label) => `${label} was not reset to its default.`,
  unavailable: (label) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
};
/** The exact recovery block the fixed pane renders for one field (contract §5 normative wording). */
export const entry = (id, state) => ({
  id,
  text: MESSAGE[state](LABEL[id]),
  role: state === "saving" || state === "resetting" ? "status" : "alert",
  buttons: state === "unavailable" ? [`Reload ${LABEL[id]}`] : [`Retry ${LABEL[id]}`, `Discard ${LABEL[id]}`],
});
export const ACTIONS = { buttons: [COPY.exportDraft, COPY.discardAll], alert: null };
export const summarize = (list) => ({
  total: list.length,
  reads: list.filter((item) => item.op === "get").length,
  writes: list.filter((item) => item.op === "set").length,
  removes: list.filter((item) => item.op === "remove").length,
  other: list.filter((item) => !["get", "set", "remove"].includes(item.op)).length,
});
export const mutationsOf = (list) => list.filter((item) => item.op === "set" || item.op === "remove" || item.op === "clear");
export const short = (list) => list.slice(0, 12).map((item) => `${item.seq}:${item.op}:${item.key}${item.value !== undefined ? `=${item.value}` : ""}:${item.outcome}`);

/**
 * Creates one run: argument parsing, consistency gate, records and checks, archive + bundle, local server,
 * Chrome sessions and the final log. `fixture` is the fixture file in this directory; `requiredModules` are
 * archive paths that must be bundled from the archive (provenance).
 */
export function createRun({ runnerUrl, mode: expectedMode, fixture, requiredModules }) {
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const output = fileURLToPath(new URL("./", import.meta.url));
  const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? output;
  if (process.env.XAI_NATIVE_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
  const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
  const [requested, mode, suffix] = process.argv.slice(2);
  if (!requested) throw Error("Fixed revision required");
  if (mode !== expectedMode) throw Error(`Unsupported mode ${mode}; use ${expectedMode}`);
  if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
  const resolved = execFileSync("git", ["rev-parse", "--verify", `${requested}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
  const resolvedTree = execFileSync("git", ["rev-parse", `${resolved}^{tree}`], { cwd: root, encoding: "utf8" }).trim();
  const shortSha = resolved.slice(0, 7);
  const evidencePath = join(evidenceDir, `native-${shortSha}-${suffix}-${mode}.log`);
  if (existsSync(evidencePath)) throw Error("Evidence exists; use a distinct suffix");

  const records = [];
  const runtimeErrors = [];
  const consoleWarnings = [];
  // E25 copy, change 2: the runner's own presses and every key event the recorder reported.
  const k1Pressed = [];
  const k1Trace = [];
  const dialogs = [];
  const dialogPlan = [];
  const deferredFailures = [];
  let checks = 0;
  let productChecks = 0;
  let lastCheckId = null;
  const record = (name, value = {}) => {
    records.push({ ...value, name });
    if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 300));
  };
  const verify = (id, condition, details, kind) => {
    checks += 1;
    if (kind === "product") productChecks += 1;
    lastCheckId = id;
    const pass = Boolean(condition);
    record("check", { ...details, id, kind, pass });
    if (!pass) throw Object.assign(new Error(`${kind === "precondition" ? "PRECONDITION: " : "PRODUCT CHECK FAILED: "}${id}`), { checkId: id, checkKind: kind });
  };
  const pre = (id, condition, details = {}) => verify(id, condition, details, "precondition");
  const check = (id, condition, details = {}) => verify(id, condition, details, "product");
  /** Recorded like a product check but does not stop the run; any deferred failure fails the run at the end. */
  const checkDeferred = (id, condition, details = {}) => {
    checks += 1;
    productChecks += 1;
    lastCheckId = id;
    const pass = Boolean(condition);
    record("check", { ...details, id, kind: "product", deferred: true, pass });
    if (!pass) deferredFailures.push(id);
  };

  // ---- Consistency gate and provenance inputs ------------------------------------------------------
  const runnerPath = fileURLToPath(runnerUrl);
  const hashedFiles = [relative(output, runnerPath), "native-host-harness.mjs", fixture, "native-host-prelude.js"];
  const fileSha256 = Object.fromEntries(hashedFiles.map((name) => [name, sha256(readFileSync(join(output, name)))]));
  const fixtureSource = readFileSync(join(output, fixture), "utf8");
  const preludeSource = readFileSync(join(output, "native-host-prelude.js"), "utf8");
  const dependencyNodeModules = join(dependencyRoot, "node_modules");
  if (!existsSync(dependencyNodeModules)) throw Error("PRECONDITION: dependency tree missing; set XAI_DEPS_ROOT");
  const archiveLock = execFileSync("git", ["show", `${resolved}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
  const dependencyLock = readFileSync(join(dependencyRoot, "pnpm-lock.yaml"));
  if (sha256(dependencyLock) !== sha256(archiveLock)) throw Error("PRECONDITION: dependency checkout lockfile differs from the revision under test");
  const docsHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const productDelta = execFileSync("git", ["diff", "--name-only", resolved, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim();
  const fixedDelta = execFileSync("git", ["diff", "--name-only", BEFORE_REVISION, resolved, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
  // E25 copy, change 1: the two accepted segments of that delta.
  const featuresDelta = execFileSync("git", ["diff", "--name-only", BEFORE_REVISION, FEATURES_FIXED_REVISION, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
  // E24 copy: the Appearance segment ends at its accepted fixed revision; the AppRail segment follows it.
  const appearanceDelta = execFileSync("git", ["diff", "--name-only", FEATURES_FIXED_REVISION, APPEARANCE_FIXED_REVISION, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
  const railDelta = execFileSync("git", ["diff", "--name-only", APPEARANCE_FIXED_REVISION, resolved, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
  const versionOf = (name) => {
    try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
  };

  const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), `xai-features-native-${mode}-`)));
  const snapshot = join(directory, "source");
  const profile = join(directory, "profile");
  const downloads = join(directory, "downloads");
  const served = {};
  let server = null;
  let browser = null;
  let origin = "";
  const sessions = [];

  // ---- CDP sessions (one per page target) ----------------------------------------------------------
  function wire(socket, label) {
    const pending = new Map();
    let commandId = 0;
    const session = { label, socket, pending, listeners: [] };
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.method === "Runtime.exceptionThrown") {
        const details = message.params.exceptionDetails ?? {};
        runtimeErrors.push({ doc: label, kind: "exception", afterCheck: lastCheckId, atCheck: checks, text: String(details.exception?.description ?? details.text ?? "").slice(0, 600) });
      } else if (message.method === "Runtime.consoleAPICalled") {
        const text = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ").slice(0, 600);
        if (message.params.type === "error" || message.params.type === "assert") runtimeErrors.push({ doc: label, kind: `console.${message.params.type}`, afterCheck: lastCheckId, atCheck: checks, text });
        else if (message.params.type === "warning") consoleWarnings.push(`${label}: ${text.slice(0, 200)}`);
      } else if (message.method === "Runtime.bindingCalled" && message.params.name === K1_BINDING) {
        // E25 copy, change 2.
        try { k1Trace.push({ doc: label, ...JSON.parse(message.params.payload) }); } catch { k1Trace.push({ doc: label, unparsed: String(message.params.payload).slice(0, 200) }); }
      } else if (message.method === "Page.javascriptDialogOpening") {
        const plan = dialogPlan.shift() ?? null;
        // An unplanned beforeunload prompt is accepted (never hangs a navigation) but recorded as unexpected.
        const accept = plan ? plan.accept : message.params.type === "beforeunload";
        dialogs.push({ doc: label, type: message.params.type, message: message.params.message, expected: Boolean(plan), accepted: accept, afterCheck: lastCheckId });
        session.cdp("Page.handleJavaScriptDialog", { accept }).catch(() => {});
      }
      for (const listener of session.listeners) listener(message);
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
    session.cdp = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++commandId;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
    session.evaluate = async (expression) => {
      const result = await session.cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw Error(`Page evaluation failed (${label}): ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`);
      return result.result.value;
    };
    /** Bounded polling. Evaluation errors (for example a document mid-navigation) count as "not yet". */
    session.waitUntil = async (expression, timeout = 6000) => {
      const deadline = Date.now() + timeout;
      for (;;) {
        try {
          if (await session.evaluate(expression)) return true;
        } catch { /* context not ready yet */ }
        if (Date.now() > deadline) return false;
        await delay(40);
      }
    };
    sessions.push(session);
    return session;
  }
  async function connect(webSocketDebuggerUrl, label) {
    const socket = new WebSocket(webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
    const session = wire(socket, label);
    await session.cdp("Runtime.enable");
    await session.cdp("Page.enable");
    await session.cdp("DOMStorage.enable");
    // E25 copy, change 2: the key recorder for every later document of this target.
    await session.cdp("Runtime.addBinding", { name: K1_BINDING });
    await session.cdp("Page.addScriptToEvaluateOnNewDocument", { source: K1_RECORDER });
    return session;
  }
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
    const main = await connect(page.webSocketDebuggerUrl, "doc1");
    main.targetId = page.id;
    browser = { proc, exited, port, main };
    await main.cdp("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
    await main.cdp("Page.bringToFront");
    await main.cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
    await main.cdp("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    return main;
  }
  /** Opens a second page target at `path` and attaches a CDP session to it (same profile, same origin). */
  async function openTarget(path, label) {
    const { targetId } = await browser.main.cdp("Target.createTarget", { url: `${origin}${path}` });
    let target = null;
    for (let attempt = 0; attempt < 100 && !target; attempt += 1) {
      const list = await (await fetch(`http://127.0.0.1:${browser.port}/json/list`)).json();
      target = list.find((candidate) => candidate.id === targetId && candidate.webSocketDebuggerUrl) ?? null;
      if (!target) await delay(40);
    }
    pre(`${label}:target-present`, target, { targetId });
    const session = await connect(target.webSocketDebuggerUrl, label);
    session.targetId = targetId;
    return session;
  }
  async function closeTarget(session) {
    try { session.socket.close(); } catch { /* already closed */ }
    await browser.main.cdp("Target.closeTarget", { targetId: session.targetId }).catch(() => {});
  }
  async function closeBrowser() {
    const current = browser;
    browser = null;
    if (!current) return { graceful: true };
    try { current.main.socket.send(JSON.stringify({ id: 999999, method: "Browser.close" })); } catch { /* socket gone */ }
    const graceful = await Promise.race([current.exited.then(() => true), delay(8000).then(() => false)]);
    if (!graceful) {
      current.proc.kill("SIGTERM");
      await Promise.race([current.exited, delay(3000)]);
      if (current.proc.exitCode === null && current.proc.signalCode === null) current.proc.kill("SIGKILL");
    }
    for (const session of sessions) { try { session.socket.close(); } catch { /* closed */ } }
    return { graceful };
  }

  // ---- Trusted input ---------------------------------------------------------------------------------
  async function trustedClick(session, selector, label) {
    const point = await session.evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return { found: false };
      element.scrollIntoView({ block: "center", inline: "nearest" });
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(x, y);
      return { found: true, x, y, width: rect.width, height: rect.height, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + hit.className : null };
    })()`);
    pre(`input:control-present:${label}`, point.found, { selector, doc: session.label });
    pre(`input:centre-hit-test:${label}`, point.hit, { selector, hitTarget: point.hitTarget, doc: session.label });
    await session.cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
    await session.cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
    await session.cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
    await delay(60);
    return { x: Math.round(point.x), y: Math.round(point.y), width: point.width, height: point.height };
  }
  async function clickButton(session, name, scope) {
    const found = await session.evaluate(`(() => {
      document.querySelectorAll("[data-native-target]").forEach((element) => element.removeAttribute("data-native-target"));
      const matches = [...document.querySelectorAll(${JSON.stringify(`${scope} button`)})]
        .filter((candidate) => (candidate.getAttribute("aria-label") ?? candidate.textContent).replace(/\\s+/g, " ").trim() === ${JSON.stringify(name)});
      if (matches.length === 1) matches[0].setAttribute("data-native-target", "1");
      return matches.length;
    })()`);
    pre(`input:exactly-one-button-by-name:${name}`, found === 1, { scope, found, doc: session.label });
    const point = await trustedClick(session, '[data-native-target="1"]', name);
    await session.evaluate('document.querySelector("[data-native-target]")?.removeAttribute("data-native-target")');
    return point;
  }
  async function sidebarClick(session, label) {
    const found = await session.evaluate(`(() => {
      document.querySelectorAll("[data-native-sidebar]").forEach((element) => element.removeAttribute("data-native-sidebar"));
      const rows = [...document.querySelectorAll(".settings-sidebar .list-row")].filter((candidate) => candidate.textContent.trim() === ${JSON.stringify(label)});
      if (rows.length === 1) rows[0].setAttribute("data-native-sidebar", "1");
      return rows.length;
    })()`);
    pre(`input:exactly-one-sidebar-row:${label}`, found === 1, { found, doc: session.label });
    const point = await trustedClick(session, '[data-native-sidebar="1"]', `sidebar ${label}`);
    await session.evaluate('document.querySelector("[data-native-sidebar]")?.removeAttribute("data-native-sidebar")');
    return point;
  }
  async function pressKey(session, key, code, keyCode) {
    k1Pressed.push({ doc: session.label, key, code }); // E25 copy, change 2.
    await session.cdp("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode: keyCode });
    await session.cdp("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: keyCode });
    await delay(80);
  }

  // ---- Archive, bundle, server -----------------------------------------------------------------------
  let built = null;
  async function prepare() {
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
    const pinAndGuard = { name: "features-native-host-archive-pin-guard", setup(buildApi) {
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
    const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find((name) => name.startsWith("esbuild@0.28.1"));
    if (!esbuildFolder) throw Error("PRECONDITION: pinned esbuild 0.28.1 missing");
    const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
    built = await esbuild.build({
      stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: fixture },
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
    const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== fixture);
    const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
    const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
    const missingRequired = requiredModules.filter((file) => !inputs.includes(file));
    const requiredHashes = Object.fromEntries(requiredModules.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
    // Every required reader/host/storage module that is not one of the fixed delta's files (including the
    // protected reader files inside the features package) is byte-identical to f359be6.
    const protectedDrift = requiredModules.filter((file) => !fixedDelta.includes(file)).filter((file) => {
      const before = execFileSync("git", ["show", `${BEFORE_REVISION}:${file}`], { cwd: root, maxBuffer: 50 * 1024 * 1024 });
      return sha256(before) !== requiredHashes[file];
    });
    // Every archive module of the bundle except the fixed delta's files equals f359be6 byte for byte.
    const bundledArchive = [...archiveModules].filter((file) => !fixedDelta.includes(file));
    const archiveDrift = bundledArchive.filter((file) => {
      try {
        const before = execFileSync("git", ["show", `${BEFORE_REVISION}:${file}`], { cwd: root, maxBuffer: 50 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
        return sha256(before) !== sha256(readFileSync(join(snapshot, file)));
      } catch { return true; }
    });

    const appPage = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>XAI Web (Features native ${mode})</title><link rel="stylesheet" href="/__native/bundle.css"><script src="/__native/prelude.js"></script></head><body><div id="root"></div><script type="module" src="/__native/bundle.js"></script></body></html>`;
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

    const main = await launch();
    const version = await main.cdp("Browser.getVersion");
    record("baseline", {
      requested, resolved, resolvedTree, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix, fixture,
      browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, node: process.version, esbuild: esbuild.version,
      packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
      lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock), extracted: sha256(extractedLock) },
      fileSha256, bundleSha256: sha256(js), bundleCssSha256: sha256(css),
      bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
      guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
      requiredModules: { count: requiredModules.length, missing: missingRequired, sha256: requiredHashes },
      fixedVsBefore: { before: BEFORE_REVISION, productFilesChanged: fixedDelta, fixedFilesInBundle: fixedDelta.filter((file) => archiveModules.has(file)), protectedModulesDriftedFromBefore: protectedDrift, bundledArchiveModulesOutsideFixedDelta: bundledArchive.length, bundledArchiveModulesDriftedFromBefore: archiveDrift },
      origin: "127.0.0.1 (ephemeral port); every other host resolves to NOTFOUND",
    });
    pre("baseline:docs-head-product-tree-equals-fixed", productDelta === "", { productDelta });
    pre("baseline:lockfile-gate", sha256(dependencyLock) === sha256(archiveLock) && sha256(extractedLock) === sha256(archiveLock));
    pre("baseline:guard-no-module-from-a-checkout", guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
    pre("baseline:every-required-module-bundled-from-archive", missingRequired.length === 0 && requiredModules.every((file) => archiveModules.has(file) || file.endsWith(".css")), { missingRequired });
    // E24 copy (replaces the E25 copy's "baseline:fixed-delta-is-features-then-appearance-section-11").
    const sorted = (list) => JSON.stringify([...new Set(list)].sort());
    pre("baseline:fixed-delta-is-features-then-appearance-then-apprail-section-11", featuresDelta.length > 0 && featuresDelta.every((file) => file.startsWith(FEATURES_PACKAGE))
      && sorted(appearanceDelta) === sorted(APPEARANCE_SECTION11) && sorted(railDelta) === sorted(APPRAIL_SECTION11)
      && sorted(fixedDelta) === sorted([...featuresDelta, ...appearanceDelta, ...railDelta]), { fixedDelta, featuresDelta, appearanceDelta, railDelta });
    pre("baseline:bundled-protected-modules-byte-identical-to-f359be6", protectedDrift.length === 0 && archiveDrift.length === 0, { protectedDrift, archiveDrift: archiveDrift.slice(0, 10) });
    return main;
  }

  let selfTested = false;
  /** Seed page (prelude only): self-test once, clear storage, write the seeds with the native setter. */
  async function seed(session, entries, label) {
    await session.cdp("Page.navigate", { url: `${origin}/seed` });
    pre(`${label}:seed-page-loaded-with-prelude-only`, await session.waitUntil("document.readyState === 'complete' && location.pathname === '/seed' && !!window.__native && !window.verify", 10000));
    if (!selfTested) {
      const result = await session.evaluate("__native.selfTest()");
      record("instrument-selftest", { page: "/seed (prelude only, no product code)", result });
      pre("instruments:storage-faults-value-fault-dispatch-network-locks-middle-history-unload-export-dom-error-frames", result.setDeniedThrew && result.setDeniedNeverStored && result.setDelegated
        && result.valueDeniedThrew && result.valueDeniedKeptBytes && result.otherValueDelegated
        && result.readbackAfterSetDenied && result.readbackOneShot && result.getDenied && result.removeDeniedThrew && result.removeDeniedKeptBytes && result.removeDelegated
        && Object.values(result.totalDenial).every(Boolean)
        && JSON.stringify(result.attemptOutcomes) === JSON.stringify(["set:1:denied", "set:1:ok", "set:true:denied-value", "set:false:ok", "set:2:ok", "remove::denied", "remove::ok", "set:x:denied", "remove::denied"])
        && JSON.stringify(result.dispatchCounted) === JSON.stringify(["null:true", "xai_native_host_selftest:true"])
        && JSON.stringify(result.deliveredCounted) === JSON.stringify(["null:false", "xai_native_host_selftest:false"])
        && result.nonLocalFetchRefusedAndLogged && result.lockHeldAndPending && result.appRanBeforeMiddle
        && JSON.stringify(result.lockAttribution) === JSON.stringify(["fixture", "app", "fixture"])
        && result.historyWrapperLogged && JSON.stringify(result.unloadTracker) === JSON.stringify({ before: 0, during: 1, after: 0 })
        && result.urlTraced && result.domGateAddedAndRemoved && result.htmlAttributeLogged && result.errorUiDetected && result.framesSampled > 0 && result.warnWithoutListener.warned === false, { result });
      selfTested = true;
    }
    const stored = await session.evaluate(`(() => { __native.native.clear(); const seeds = ${JSON.stringify(entries)}; for (const [key, value] of Object.entries(seeds)) __native.native.set(key, value); return __native.native.snapshot(); })()`);
    pre(`${label}:seeded-exact-bytes`, JSON.stringify(Object.entries(stored).sort()) === JSON.stringify(Object.entries(entries).sort()), { stored });
  }

  async function finish(harnessError) {
    // E25 copy, change 2: the K-1 key audit (run-level precondition), evaluated when the run itself completed.
    {
      const keydowns = k1Trace.filter((item) => item.type === "keydown");
      const keyups = k1Trace.filter((item) => item.type === "keyup");
      const keypresses = k1Trace.filter((item) => item.type === "keypress");
      const matches = (list) => list.length === k1Pressed.length && k1Pressed.every((press, index) => list[index].doc === press.doc && list[index].key === press.key && list[index].code === press.code && list[index].trusted === true);
      const ok = matches(keydowns) && matches(keyups) && keypresses.length === 0 && k1Trace.every((item) => !item.unparsed);
      record("k1-key-audit", { pressed: k1Pressed, keydowns: keydowns.length, keyups: keyups.length, keypresses: keypresses.length, trace: k1Trace.slice(0, 40), ok });
      if (harnessError === null) {
        try { pre("run:k1-keyboard-trace-contains-only-the-runner-key-presses", ok, { pressed: k1Pressed.length, keydowns: keydowns.length, keyups: keyups.length, keypresses: keypresses.length }); } catch (error) { harnessError = error; }
      }
    }
    const productFailure = harnessError?.checkKind === "product";
    const deferred = deferredFailures.length;
    const pass = harnessError === null && deferred === 0;
    record("result", {
      pass, harnessValid: harnessError === null || productFailure, mode, checks, productChecks, deferredFailures,
      runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 8),
      consoleWarnings: consoleWarnings.length, consoleWarningSamples: [...new Set(consoleWarnings)].slice(0, 6), dialogs, served,
      ...(harnessError ? { error: String(harnessError?.stack ?? harnessError).slice(0, 1500), checkId: harnessError?.checkId ?? null, checkKind: harnessError?.checkKind ?? null } : {}),
    });
    writeFileSync(evidencePath, `${records.map((item) => JSON.stringify(item)).join("\n")}\n`, { flag: "wx" });
    await closeBrowser().catch(() => {});
    server?.closeAllConnections?.();
    server?.close();
    await delay(300);
    rmSync(directory, { recursive: true, force: true });
    process.exitCode = pass ? 0 : harnessError && !productFailure ? 1 : 2;
    const label = pass ? "PASS" : process.exitCode === 2 ? "PRODUCT-FAIL" : "HARNESS-FAIL";
    console.log(`${label} ${relative(root, evidencePath)} checks=${checks} product=${productChecks} deferredFailures=${deferred} exit=${process.exitCode}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
  }

  return {
    root, output, evidenceDir, evidencePath, downloads, requested, resolved, shortSha, mode, suffix,
    records, runtimeErrors, consoleWarnings, dialogs, dialogPlan, deferredFailures, served,
    record, pre, check, checkDeferred,
    get origin() { return origin; },
    get browser() { return browser; },
    get checks() { return checks; },
    get lastCheckId() { return lastCheckId; },
    prepare, seed, openTarget, closeTarget, finish,
    trustedClick, clickButton, sidebarClick, pressKey,
  };
}
