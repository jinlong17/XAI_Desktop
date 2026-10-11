/**
 * CP-STICKY-01 batch 9: Sticky contract §9 host matrix (rows a-l) and beforeunload in real headless Chrome.
 * Verification only (parent-role host verifier). It repairs nothing and accepts nothing.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-sticky-recovery-native/verify-host.mjs <fixed revision> host <suffix>
 *
 * - The product is an immutable `git archive <fixed revision>`; ./native-host.tsx is bundled with esbuild
 *   from stdin with resolveDir = that archive, and every `@repo/*` import is pinned to the archive's
 *   packages. Only third-party modules come from XAI_DEPS_ROOT, and only when its pnpm-lock.yaml SHA-256
 *   equals the archive's (consistency gate). Bundle inputs are checked for provenance.
 * - Same harness rules as batch 8 (./verify-native.mjs, reused as a pattern, not modified): 127.0.0.1 only,
 *   isolated profile and download directory, CDP Input.dispatchMouseEvent / dispatchKeyEvent after a
 *   center hit-test, refusal to overwrite logs, zero runtime exceptions / console errors, nonzero exit on
 *   any failure. Browser Back / Forward use CDP Page.navigateToHistoryEntry (the browser's own history
 *   traversal, not page script); programmatic intents use the production router; sign-out uses the real
 *   departure preflight (requestSettingsDeparture).
 * - Log: JSON lines `native-<sha7>-<suffix>-host.log` in this directory. Development probes may redirect
 *   the log with XAI_HOST_EVIDENCE_DIR (outside the repository); committed evidence never does.
 */
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_HOST_EVIDENCE_DIR ?? output;
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
if (!requested) throw Error("Fixed revision required");
if (mode !== "host") throw Error(`Unsupported mode ${mode}`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const resolved = execFileSync("git", ["rev-parse", "--verify", `${requested}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const short = resolved.slice(0, 7);
const evidencePath = join(evidenceDir, `native-${short}-${suffix}-${mode}.log`);
if (existsSync(evidencePath)) throw Error("Evidence exists; use a distinct suffix");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const records = [];
const runtimeErrors = [];
const consoleWarnings = [];
const unexpectedDialogs = [];
const record = (name, value = {}) => {
  records.push({ name, ...value });
  if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 400));
};
let checks = 0;
let lastCheckId = null;
const check = (id, condition, details = {}, kind = "product") => {
  const pass = Boolean(condition);
  checks += 1;
  lastCheckId = id;
  record("check", { id, kind, pass, ...details });
  if (!pass) throw Object.assign(new Error(`${kind === "precondition" ? "PRECONDITION: " : ""}${id}`), { checkId: id, checkKind: kind });
};
const pre = (id, condition, details = {}) => check(id, condition, details, "precondition");
/** Recorded like a product check but does not stop the run; any deferred failure fails the run at the end. */
const deferredFailures = [];
const checkDeferred = (id, condition, details = {}) => {
  const pass = Boolean(condition);
  checks += 1;
  lastCheckId = id;
  record("check", { id, kind: "product", deferred: true, pass, ...details });
  if (!pass) deferredFailures.push(id);
};

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const fixtureSource = readFileSync(join(output, "native-host.tsx"), "utf8");
const fixtureSha256 = sha256(fixtureSource);
const dependencyNodeModules = join(dependencyRoot, "node_modules");
if (!existsSync(dependencyNodeModules)) throw Error("PRECONDITION: dependency tree missing; set XAI_DEPS_ROOT");
const archiveLock = execFileSync("git", ["show", `${resolved}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
const dependencyLock = readFileSync(join(dependencyRoot, "pnpm-lock.yaml"));
if (sha256(dependencyLock) !== sha256(archiveLock)) throw Error("PRECONDITION: dependency checkout lockfile differs from the fixed product");
const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find((name) => name.startsWith("esbuild@0.28.1"));
if (!esbuildFolder) throw Error("PRECONDITION: pinned esbuild 0.28.1 missing");
const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
const docsHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const productDelta = execFileSync("git", ["diff", "--name-only", resolved, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim();
const reusedHarnessSha256 = Object.fromEntries(["native.tsx", "verify-native.mjs"].map((name) => [name, sha256(readFileSync(join(output, name)))]));

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-sticky-host-")));
const snapshot = join(directory, "source");
const profile = join(directory, "profile");
const downloads = join(directory, "downloads");
let server = null;
let session = null;
let origin = "";

// ---------------------------------------------------------------------------------------------------
// Browser session management (one isolated profile for the whole run)
// ---------------------------------------------------------------------------------------------------
async function launch() {
  try { rmSync(join(profile, "DevToolsActivePort")); } catch { /* first launch */ }
  const proc = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
    "--disable-component-update", "--disable-sync", "--disable-default-apps", "--disable-domain-reliability",
    "--disable-client-side-phishing-detection", "--metrics-recording-only", "--use-mock-keychain",
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
  const state = { proc, exited, port, socket, pending, targetId: page.id };
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails ?? {};
      runtimeErrors.push({ kind: "exception", afterCheck: lastCheckId, atCheck: checks, text: String(details.exception?.description ?? details.text ?? "").slice(0, 600) });
    } else if (message.method === "Runtime.consoleAPICalled") {
      const text = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ").slice(0, 600);
      if (message.params.type === "error" || message.params.type === "assert") runtimeErrors.push({ kind: `console.${message.params.type}`, afterCheck: lastCheckId, atCheck: checks, text });
      else if (message.params.type === "warning") consoleWarnings.push(text.slice(0, 200));
    } else if (message.method === "Page.javascriptDialogOpening") {
      unexpectedDialogs.push({ type: message.params.type, message: message.params.message });
      state.cdp("Page.handleJavaScriptDialog", { accept: false }).catch(() => {});
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
/** Bounded polling. Evaluation errors (for example a document mid-navigation) count as "not yet". */
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
async function openSession(path, ready) {
  session = await launch();
  await cdp("Runtime.enable");
  await cdp("Page.enable");
  await cdp("DOMStorage.enable");
  await cdp("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
  await cdp("Page.navigate", { url: origin + path });
  pre(`session:mounted:${path}`, await waitUntil(ready, 15000));
  await cdp("Page.bringToFront");
  await cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
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
const FIELDS = ["color", "font", "pin_default", "restore_size", "grid_spacing"];
const keyOf = (field) => `xai_pref_sticky_${field}`;
const STICKY_KEYS = FIELDS.map(keyOf);
const isSticky = (key) => STICKY_KEYS.includes(key);
const LABELS = { color: "Default Color", font: "Font Size", pin_default: "Pin by Default", restore_size: "Restore Default Size", grid_spacing: "Default Grid Spacing" };
const SAVED = "Sticky Note settings saved.";
const DIALOG = { label: "Unsaved Sticky Note draft", text: "Sticky Note has unsaved changes.", buttons: ["Stay", "Export current draft", "Discard local changes and leave"] };
const STAY = "Stay";
const EXPORT = "Export current draft";
const DISCARD_LEAVE = "Discard local changes and leave";
const recoveryEntry = (field, status) => ({
  text: `${LABELS[field]} ${status === "pending" ? "is saving." : "was not saved."}`,
  buttons: [`Retry ${LABELS[field]}`, `Discard ${LABELS[field]}`],
});
const sourceEntry = (field) => ({ text: `Saved ${LABELS[field]} is unavailable. Reload it; this is not a new unsaved change.`, buttons: [`Reload ${LABELS[field]}`] });
const inputErrorEntry = (field) => ({ text: `${LABELS[field]} has an invalid value.`, buttons: [] });
const SWITCH = (field) => `.sticky-pane [role="switch"][aria-label="${LABELS[field]}"]`;
const SWATCH = (id) => `.sticky-pane [data-color-id="${id}"]`;
const SPACING = (id) => `.sticky-pane [data-spacing-id="${id}"]`;
const RAIL = (label) => `.app-rail [aria-label="${label}"]`;
const triple = (location) => ({ pathname: location.pathname, key: location.key, state: location.state ?? null });
const sameTriple = (left, right) => isDeepStrictEqual(triple(left), triple(right));
const summarize = (list) => ({
  total: list.length,
  reads: list.filter((entry) => entry.op === "get").length,
  writes: list.filter((entry) => entry.op === "set").length,
  removes: list.filter((entry) => entry.op === "remove").length,
  other: list.filter((entry) => !["get", "set", "remove"].includes(entry.op)).length,
});
const mutationsOf = (list) => list.filter((entry) => ["set", "remove", "clear"].includes(entry.op));
const counters = (window) => ({
  pushState: window.history.filter((entry) => entry.method === "pushState").length,
  replaceState: window.history.filter((entry) => entry.method === "replaceState").length,
  popstate: window.pops.length,
  commits: window.commits.length,
});
const pathFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.origin === origin ? parsed.pathname : url;
  } catch { return url; }
};

async function trustedClick(selector, label) {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { found: false };
    element.scrollIntoView({ block: "center", inline: "center" });
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { found: true, x, y, width: rect.width, height: rect.height, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + hit.className : null };
  })()`);
  pre(`input:control-present:${label}`, point.found, { selector });
  pre(`input:hit-test:${label}`, point.hit, { selector, hitTarget: point.hitTarget });
  await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await delay(60);
  return { x: Math.round(point.x), y: Math.round(point.y), width: point.width, height: point.height };
}
async function clickButton(name, scope) {
  const selector = await evaluate(`(() => {
    document.querySelectorAll("[data-native-target]").forEach((element) => element.removeAttribute("data-native-target"));
    const element = [...document.querySelectorAll(${JSON.stringify(`${scope} button`)})]
      .find((candidate) => (candidate.getAttribute("aria-label") ?? candidate.textContent).trim() === ${JSON.stringify(name)});
    if (!element) return null;
    element.setAttribute("data-native-target", "1");
    return '[data-native-target="1"]';
  })()`);
  pre(`input:button-present:${name}`, selector, { scope });
  const point = await trustedClick(selector, name);
  await evaluate('document.querySelector("[data-native-target]")?.removeAttribute("data-native-target")');
  return point;
}
const dialogAction = (name) => clickButton(name, ".settings-departure-dialog");
const paneAction = (name) => clickButton(name, ".sticky-pane");
async function sidebarClick(label) {
  const selector = await evaluate(`(() => {
    document.querySelectorAll("[data-native-sidebar]").forEach((element) => element.removeAttribute("data-native-sidebar"));
    const row = [...document.querySelectorAll(".settings-sidebar .list-row")].find((candidate) => candidate.textContent.trim() === ${JSON.stringify(label)});
    if (!row) return null;
    row.setAttribute("data-native-sidebar", "1");
    return '[data-native-sidebar="1"]';
  })()`);
  pre(`input:sidebar-row-present:${label}`, selector);
  const point = await trustedClick(selector, `sidebar ${label}`);
  await evaluate('document.querySelector("[data-native-sidebar]")?.removeAttribute("data-native-sidebar")');
  return point;
}
let lastTypeahead = { instance: null, at: 0 };
async function typeahead(label, character, code, virtualKey) {
  const instance = await evaluate("verify.instance");
  if (lastTypeahead.instance === instance) {
    const wait = 1200 - (Date.now() - lastTypeahead.at);
    if (wait > 0) await delay(wait);
  }
  const focused = await evaluate(`(() => {
    const element = document.querySelector('select[aria-label=${JSON.stringify(label)}]');
    if (!element) return false;
    element.scrollIntoView({ block: "center" });
    element.focus();
    return document.activeElement === element;
  })()`);
  pre(`input:select-focused:${label}`, focused);
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: character, code, windowsVirtualKeyCode: virtualKey, text: character, unmodifiedText: character });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: character, code, windowsVirtualKeyCode: virtualKey });
  lastTypeahead = { instance, at: Date.now() };
  await delay(60);
}
const FONT_KEYS = { small: ["s", "KeyS", 83], normal: ["n", "KeyN", 78], large: ["l", "KeyL", 76], xl: ["e", "KeyE", 69], huge: ["h", "KeyH", 72] };
const swatch = (id) => () => trustedClick(SWATCH(id), `color=${id}`);
const spacing = (id) => () => trustedClick(SPACING(id), `grid_spacing=${id}`);
const toggleSwitch = (field) => () => trustedClick(SWITCH(field), field);
const font = (id) => () => typeahead(LABELS.font, ...FONT_KEYS[id]);
async function pressEscape() {
  await cdp("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await delay(80);
}
const visibleDownloads = () => readdirSync(downloads).filter((name) => !name.startsWith("."));
async function awaitDownload(timeout = 10000) {
  const file = join(downloads, "sticky-draft.json");
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const names = visibleDownloads();
    if (names.includes("sticky-draft.json") && !names.some((name) => name.endsWith(".crdownload"))) {
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
try {
  mkdirSync(snapshot);
  mkdirSync(downloads);
  execFileSync("tar", ["-x", "-C", snapshot], { input: execFileSync("git", ["archive", resolved], { cwd: root, maxBuffer: 200 * 1024 * 1024 }) });
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
  const pinnedPackages = { name: "pinned-workspace-packages", setup(buildApi) {
    buildApi.onResolve({ filter: /^@repo\// }, (args) => {
      const parts = args.path.split("/");
      const entry = aliases.get(parts.slice(0, 2).join("/"));
      if (!entry) throw Error(`Unknown workspace package ${args.path}`);
      const sub = parts.length > 2 ? `./${parts.slice(2).join("/")}` : ".";
      let target = entry.pkg.exports?.[sub];
      if (target && typeof target === "object") target = target.import ?? target.default;
      if (typeof target !== "string") throw Error(`Unresolved pinned export ${args.path}`);
      return { path: join(entry.folder, target) };
    });
  } };
  const built = await esbuild.build({
    stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: "native-host.tsx" },
    absWorkingDir: snapshot,
    plugins: [pinnedPackages],
    nodePaths: [join(dependencyRoot, "apps/web/node_modules")],
    loader: { ".png": "dataurl", ".svg": "dataurl", ".woff2": "dataurl", ".woff": "dataurl" },
    bundle: true, format: "esm", platform: "browser", write: false, metafile: true, logLevel: "silent",
    outfile: join(directory, "bundle.js"),
    define: { "import.meta.env": "{}" },
  });
  const js = built.outputFiles.find((file) => file.path.endsWith(".js")).text;
  const css = built.outputFiles.find((file) => file.path.endsWith(".css")).text;
  const inputs = Object.keys(built.metafile.inputs);
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== "native-host.tsx");
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const productFiles = [
    "packages/plugin-web-settings-rest/src/panes/stickyPane.tsx",
    "packages/plugin-web-settings-rest/src/internal/StickyColorPalette.tsx",
    "packages/plugin-web-settings-rest/src/internal/localI18n.ts",
    "packages/plugin-web-settings-rest/src/styles.css",
    "packages/plugin-web-storage/src/internal/prefMutation.ts",
    "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
    "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts",
    "packages/plugin-web-storage/src/internal/accountScope.ts",
    "apps/web/src/routes/modules/departureCoordinator.tsx",
    "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
    "apps/web/src/routes/modules/settingsDeparture.ts",
    "packages/xai-web-shell/src/Shell.tsx",
    "packages/xai-web-shell/src/AppRail.tsx",
  ];
  const productHashes = Object.fromEntries(productFiles.map((file) => [file, sha256(readFileSync(join(snapshot, file)))]));
  const productInBundle = productFiles.filter((file) => !file.endsWith(".css")).every((file) => inputs.includes(file));

  const page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sticky host fixture</title><link rel="stylesheet" href="/__native/bundle.css"></head><body><div id="app"></div><script type="module" src="/__native/bundle.js"></script></body></html>';
  server = createServer((request, response) => {
    response.setHeader("Cache-Control", "no-store");
    if (request.url === "/__native/bundle.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(js); return; }
    if (request.url === "/__native/bundle.css") { response.setHeader("Content-Type", "text/css; charset=utf-8"); response.end(css); return; }
    if (request.url === "/favicon.ico") { response.statusCode = 204; response.end(); return; }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(page);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;

  await openSession("/app/settings/hotkeys", "!!window.verify && document.querySelector('.settings-detail')?.getAttribute('data-pane') === 'hotkeys'");
  const version = await cdp("Browser.getVersion");
  const viewport = await evaluate("({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio })");
  record("baseline", {
    requested, resolved, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix,
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, viewport,
    node: process.version, esbuild: esbuild.version,
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock) },
    fixtureSha256, runnerSha256, reusedHarnessSha256, bundleSha256: sha256(js), bundleCssSha256: sha256(css),
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    productHashes, origin: "127.0.0.1 (ephemeral port)",
  });
  pre("baseline:docs-head-product-tree-equals-fixed", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === sha256(archiveLock));
  pre("baseline:bundle-inputs-pinned-to-archive", foreign.length === 0 && productInBundle, { foreign, productInBundle });
  pre("baseline:no-mount-runtime-errors", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 3) });
  const lockNames = await evaluate("Object.fromEntries(verify.fields.map((field) => [field, verify.lockName(field)]))");
  pre("baseline:real-lock-names", FIELDS.every((field) => lockNames[field] === `xai:pref:v1:${keyOf(field)}`), { lockNames });
  {
    const probe = await evaluate("verify.probe()");
    const unloadSelf = await evaluate("verify.unloadSelfTest()");
    const instruments = await evaluate("({ historyWrapped: verify.historyWrapped(), navigateWrapped: verify.navigateWrapped(), navigationApi: verify.navigationApiPresent(), initialReplace: verify.historyAll().filter((entry) => entry.method === 'replaceState' && entry.idx === 0).length, physical: verify.physical() })");
    pre("baseline:storage-injector-fires", probe.logged === 1 && probe.threw === false && probe.last?.op === "get", { probe });
    pre("baseline:unload-listener-tracker-fires", isDeepStrictEqual(unloadSelf, { before: 0, during: 1, after: 0 }), { unloadSelf });
    pre("baseline:history-wrappers-intercept-router", instruments.historyWrapped && instruments.initialReplace === 1, instruments);
    pre("baseline:coordinator-wraps-router-navigate-while-mounted", instruments.navigateWrapped === true, instruments);
    pre("baseline:navigation-api-present", instruments.navigationApi === true, instruments);
    pre("baseline:sticky-bytes-absent", Object.values(instruments.physical).every((value) => value === null), { physical: instruments.physical });
  }

  // Shared helpers that need the live session ----------------------------------------------------
  const mark = () => evaluate("verify.mark()");
  const location = () => evaluate("verify.location()");
  async function hostWindow(since) {
    return evaluate(`({ history: verify.historyAfter(${since}), pops: verify.popsAfter(${since}), commits: verify.commitsAfter(${since}) })`);
  }
  async function snap(since) {
    return evaluate(`({ location: verify.location(), windowPath: verify.windowPath(), historyState: verify.historyState(), pane: verify.paneId(),
      sticky: verify.stickyMounted(), dialog: verify.dialog(), recovery: verify.recovery(), displayed: verify.displayed(), physical: verify.physical(),
      saved: verify.saved(), paneActions: verify.paneActions(), unloadActive: verify.unloadActive(), scope: verify.scope(), signouts: { ...verify.signouts },
      attempts: verify.attemptsAfter(${since}), locks: verify.locksAfter(${since}), events: verify.eventsAfter(${since}),
      history: verify.historyAfter(${since}), pops: verify.popsAfter(${since}), commits: verify.commitsAfter(${since}) })`);
  }
  async function stack() {
    const browser = await cdp("Page.getNavigationHistory");
    const pageView = await evaluate("({ length: verify.historyLength(), entries: verify.navEntries(), current: verify.navCurrent() })");
    return {
      currentIndex: browser.currentIndex,
      browserEntries: browser.entries.map((entry) => ({ id: entry.id, path: pathFromUrl(entry.url) })),
      length: pageView.length,
      navEntries: pageView.entries,
      navCurrent: pageView.current,
    };
  }
  const sameEntries = (left, right) => isDeepStrictEqual(left.browserEntries, right.browserEntries)
    && isDeepStrictEqual(left.navEntries, right.navEntries) && left.length === right.length;
  const stackView = (value) => ({ currentIndex: value.currentIndex, length: value.length, navIndex: value.navCurrent?.index ?? null, entries: value.browserEntries.map((entry) => `${entry.id}:${entry.path}`) });
  async function browserTraverse(id, direction) {
    const history = await cdp("Page.getNavigationHistory");
    const index = history.currentIndex + (direction === "back" ? -1 : 1);
    const target = history.entries[index];
    pre(`${id}:traverse-${direction}-entry-exists`, Boolean(target), { currentIndex: history.currentIndex, length: history.entries.length });
    await cdp("Page.navigateToHistoryEntry", { entryId: target.id });
    return { fromIndex: history.currentIndex, toIndex: index, entryId: target.id, path: pathFromUrl(target.url) };
  }
  /** Unguarded traversal back onto a recorded entry; Sticky must remount clean on the same key. */
  async function traverseTo(id, direction, expected, sticky = true) {
    const step = await browserTraverse(id, direction);
    const ok = await waitUntil(`verify.location().key === ${JSON.stringify(expected.key)}${sticky ? " && verify.stickyMounted()" : ""}`, 6000);
    await delay(450);
    const state = await snap(await mark());
    check(`${id}:unguarded-traversal-restores-entry`, ok && sameTriple(state.location, expected) && state.dialog === null, { location: triple(state.location), expected: triple(expected), step });
    if (sticky) check(`${id}:sticky-remounts-clean`, state.recovery.length === 0 && state.unloadActive === 0, { recovery: state.recovery, unloadActive: state.unloadActive });
    return step;
  }
  async function failedEdit(id, field, input) {
    await evaluate(`verify.denySet([${JSON.stringify(field)}])`);
    const since = await mark();
    await input();
    const failed = await waitUntil(`verify.recovery().some((entry) => entry.text === ${JSON.stringify(recoveryEntry(field, "failed").text)})`, 5000);
    const state = await snap(since);
    const denied = state.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf(field) && entry.outcome === "denied");
    pre(`${id}:write-fault-fired-${field}`, failed && denied.length === 1, { denied, recovery: state.recovery, physical: state.physical });
    return state;
  }
  async function heldEdit(id, field, input) {
    const name = await evaluate(`verify.hold(${JSON.stringify(field)})`);
    const since = await mark();
    await input();
    const pending = await waitUntil(`verify.recovery().some((entry) => entry.text === ${JSON.stringify(recoveryEntry(field, "pending").text)})`, 5000);
    const waiting = await waitUntil(`verify.lockQuery().then((query) => query.held.includes(${JSON.stringify(name)}) && query.pending.includes(${JSON.stringify(name)}))`, 4000);
    const appRequests = (await evaluate(`verify.locksAfter(${since})`)).filter((entry) => entry.by === "app" && entry.name === name);
    pre(`${id}:engine-waits-behind-real-lock-${field}`, name === lockNames[field] && pending && waiting && appRequests.length === 1, { name, pending, waiting, appRequests });
    return name;
  }
  async function awaitHeld(id, expected, pop) {
    const opened = await waitUntil("verify.dialog() !== null", 4000);
    if (pop) {
      const restored = await waitUntil(`verify.windowPath() === ${JSON.stringify(expected.pathname)} && verify.historyState()?.key === ${JSON.stringify(expected.key)}`, 4000);
      pre(`${id}:url-restored-after-blocked-pop`, restored, { windowPath: await evaluate("verify.windowPath()"), historyState: await evaluate("verify.historyState()") });
    }
    await delay(250);
    const state = await snap(await mark());
    check(`${id}:held-dialog-open`, opened && isDeepStrictEqual(state.dialog, DIALOG), { dialog: state.dialog });
    check(`${id}:held-location-unchanged`, sameTriple(state.location, expected) && state.windowPath === expected.pathname && state.pane === "sticky" && state.sticky, { location: triple(state.location), windowPath: state.windowPath, pane: state.pane });
    return state;
  }
  /**
   * Per-block runtime gate: the page's sequence-stamped console.error trace and the React Router default
   * error element detector, from the previous gate to now (every block is covered, no gaps).
   */
  let runtimeMark = 0;
  async function runtimeClean(id) {
    await delay(150);
    const view = await evaluate(`({ errors: verify.consoleErrorsAfter(${runtimeMark}), ui: verify.errorUiAfter(${runtimeMark}), now: verify.mark() })`);
    const from = runtimeMark;
    runtimeMark = view.now;
    const clean = view.errors.length === 0 && view.ui.length === 0;
    checkDeferred(`${id}:zero-runtime-errors-no-error-boundary-ui`, clean, { window: [from, view.now], consoleErrors: view.errors, errorUi: view.ui });
    if (!clean) record("product-failure", { block: id, window: [from, view.now], consoleErrors: view.errors, errorUi: view.ui, location: triple(await location()), cdpRuntimeErrors: runtimeErrors.filter((entry) => !entry.reported).map((entry) => ({ ...entry, text: entry.text.slice(0, 600) })) });
    for (const entry of runtimeErrors) entry.reported = true;
    return view;
  }
  const expectWarn = async (id, expected) => {
    const warning = await evaluate("verify.warn()");
    const active = await evaluate("verify.unloadActive()");
    check(`${id}:beforeunload-${expected ? "warns" : "silent"}-zero-handler-attempts`, warning.warned === expected && warning.attempts === 0 && active === (expected ? 1 : 0), { warning, unloadListeners: active });
    return { ...warning, listeners: active };
  };

  // =============================================================================================
  // Phase 0: history setup, beforeunload clean / source-only / input-error-only
  // =============================================================================================
  const startEntry = await location();
  let since = await mark();
  await evaluate('void verify.router.navigate("/app/settings/date_time", { state: { token: "host-P" } }), true');
  pre("setup:p-mounted", await waitUntil("verify.paneId() === 'date_time'", 6000));
  const P = await location();
  {
    const w = await hostWindow(since);
    pre("setup:router-commit-and-push-trace-fire", counters(w).commits === 1 && counters(w).pushState === 1 && w.history[0].key === P.key
      && isDeepStrictEqual(w.history[0].usr, { token: "host-P" }) && isDeepStrictEqual(P.state, { token: "host-P" }) && P.key !== startEntry.key, { w, P });
  }
  // Source-only fixtures: out-of-domain color bytes and a throwing getItem for font.
  await evaluate('verify.seedRaw("color", "purple"), verify.denyGet(["font"])');
  since = await mark();
  await sidebarClick("Sticky Note");
  pre("setup:s-mounted-by-trusted-sidebar", await waitUntil("verify.stickyMounted() && verify.location().pathname === '/app/settings/sticky'", 6000));
  await delay(450);
  const S = await location();
  {
    const state = await snap(since);
    const stickyMutations = mutationsOf(state.attempts.filter((entry) => isSticky(entry.key)));
    const deniedFontReads = state.attempts.filter((entry) => entry.op === "get" && entry.key === keyOf("font") && entry.outcome === "denied");
    pre("bu:source-only:faults-observed", state.physical.color === "purple" && deniedFontReads.length >= 1, { physical: state.physical, deniedFontReads: deniedFontReads.length });
    check("bu:source-only:reload-only-alerts", isDeepStrictEqual(state.recovery, [sourceEntry("color"), sourceEntry("font")]) && state.paneActions === null && state.saved === null, { recovery: state.recovery, paneActions: state.paneActions, saved: state.saved });
    check("bu:source-only:zero-mount-writes", stickyMutations.length === 0 && state.physical.color === "purple", { stickyMutations });
    check("setup:s-has-own-key", S.key !== P.key && S.key !== "default" && S.state === null, { S });
    const warning = await expectWarn("bu:source-only", false);
    await evaluate('verify.signout("source-only")');
    const resolved = await waitUntil('verify.signouts["source-only"] === "true"', 3000);
    const dialog = await evaluate("verify.dialog()");
    check("bu:source-only:no-guard-sign-out-preflight-true", resolved && dialog === null, { signout: await evaluate('verify.signouts["source-only"]'), dialog });
    record("row", { row: "beforeunload", case: "source-only", recovery: state.recovery, physical: state.physical, warning, signout: "true" });
    await runtimeClean("bu:source-only");
  }
  // Reload repair -> clean state.
  {
    await evaluate('verify.restore(), verify.seedRaw("color", null)');
    const before = await mark();
    await paneAction("Reload Default Color");
    await paneAction("Reload Font Size");
    const cleared = await waitUntil("verify.recovery().length === 0", 4000);
    const state = await snap(before);
    check("bu:clean:reload-repair-zero-writes-no-saved-claim", cleared && mutationsOf(state.attempts).length === 0 && state.saved === null, { recovery: state.recovery, mutations: mutationsOf(state.attempts), saved: state.saved });
    const warning = await expectWarn("bu:clean", false);
    record("row", { row: "beforeunload", case: "clean", recovery: state.recovery, warning });
    await runtimeClean("bu:clean");
  }
  // Input-error-only: an injected unknown option chosen by a trusted keyboard choice.
  {
    const options = await evaluate('verify.injectFontOption("huge", "Huge")');
    pre("bu:input-error:option-injected", Array.isArray(options) && options.includes("huge"), { options });
    const before = await mark();
    await font("huge")();
    const shown = await waitUntil(`JSON.stringify(verify.recovery()) === ${JSON.stringify(JSON.stringify([inputErrorEntry("font")]))}`, 4000);
    const state = await snap(before);
    const trusted = state.events.some((event) => event.type === "change" && event.trusted && event.target === "select:Font Size" && event.value === "huge");
    pre("bu:input-error:trusted-change-to-injected-value", trusted, { events: state.events });
    check("bu:input-error:field-error-zero-writes", shown && mutationsOf(state.attempts).length === 0 && state.displayed.font === "large" && state.saved === null && state.paneActions === null, { recovery: state.recovery, mutations: mutationsOf(state.attempts), displayed: state.displayed.font });
    const warning = await expectWarn("bu:input-error", false);
    await evaluate('verify.signout("input-error")');
    const resolved = await waitUntil('verify.signouts["input-error"] === "true"', 3000);
    check("bu:input-error:no-guard-sign-out-preflight-true", resolved && (await evaluate("verify.dialog()")) === null, { signout: await evaluate('verify.signouts["input-error"]') });
    record("row", { row: "beforeunload", case: "input-error-only", recovery: state.recovery, warning, signout: "true" });
    await evaluate("verify.removeInjected()");
    const valid = await mark();
    await font("normal")();
    const saved = await waitUntil(`verify.physical().font === "normal" && verify.recovery().length === 0 && verify.saved() === ${JSON.stringify(SAVED)}`, 5000);
    const after = await snap(valid);
    check("bu:clean-after-valid-choice:saved-no-warning", saved && mutationsOf(after.attempts).length === 1, { mutations: mutationsOf(after.attempts), saved: after.saved });
    await expectWarn("bu:clean-after-valid-choice", false);
    await runtimeClean("bu:input-error");
  }

  // =============================================================================================
  // Row c: Back and guarded Forward with key identity (stack [.., P, S, X])
  // =============================================================================================
  since = await mark();
  await evaluate('void verify.router.navigate("/app/settings/hotkeys", { state: { token: "host-X" } }), true');
  pre("c:setup:x-mounted", await waitUntil("verify.paneId() === 'hotkeys'", 6000));
  const X = await location();
  pre("c:setup:x-pushed", counters(await hostWindow(since)).pushState === 1 && isDeepStrictEqual(X.state, { token: "host-X" }), { X });
  await traverseTo("c:setup:back-to-s", "back", S);
  const E0 = await stack();
  {
    const at = E0.currentIndex;
    pre("c:setup:stack-p-s-x", E0.browserEntries[at - 1]?.path === "/app/settings/date_time" && E0.browserEntries[at]?.path === "/app/settings/sticky"
      && E0.browserEntries[at + 1]?.path === "/app/settings/hotkeys" && E0.browserEntries.length === at + 2
      && E0.navCurrent?.key && E0.navEntries.length >= 3, { stack: stackView(E0) });
    record("history-entries", { P: triple(P), S: triple(S), X: triple(X), stack: stackView(E0), navEntries: E0.navEntries });
  }
  const atIndex = (value, index) => value.currentIndex === index && value.navCurrent?.index === E0.navCurrent.index + (index - E0.currentIndex);

  async function guardedTraversal(id, direction, settle) {
    const before = await mark();
    const step = await browserTraverse(id, direction);
    await awaitHeld(id, S, true);
    const heldStack = await stack();
    const heldWindow = counters(await hostWindow(before));
    check(`${id}:held-history-stack-intact`, sameEntries(heldStack, E0) && atIndex(heldStack, E0.currentIndex), { stack: stackView(heldStack) });
    check(`${id}:held-zero-push-replace-commit`, heldWindow.pushState === 0 && heldWindow.replaceState === 0 && heldWindow.commits === 0, { heldWindow });
    return { step, before, heldWindow };
  }

  // c1 Back + Stay
  await failedEdit("c1", "color", swatch("mint"));
  {
    const { step, before, heldWindow } = await guardedTraversal("c1:back-stay", "back");
    await dialogAction(STAY);
    const closed = await waitUntil("verify.dialog() === null", 3000);
    await delay(200);
    const state = await snap(before);
    const after = await stack();
    check("c1:back-stay:location-deep-equal-s", closed && sameTriple(state.location, S) && state.windowPath === S.pathname, { location: triple(state.location) });
    check("c1:back-stay:history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex), { stack: stackView(after) });
    check("c1:back-stay:pane-and-draft-kept", state.pane === "sticky" && isDeepStrictEqual(state.recovery, [recoveryEntry("color", "failed")]), { recovery: state.recovery });
    check("c1:back-stay:no-history-mutation", counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).commits === 0, counters(state));
    const warning = await expectWarn("c1:back-stay", true);
    record("row", { row: "c", case: "back-stay", target: step, expected: triple(S), observed: triple(state.location), heldWindow, counters: counters(state), stack: stackView(after), warning });
    await runtimeClean("c1");
  }
  // c2 Back + discard-and-leave
  {
    const { step, before } = await guardedTraversal("c2:back-discard", "back");
    await dialogAction(DISCARD_LEAVE);
    const left = await waitUntil(`verify.location().key === ${JSON.stringify(P.key)}`, 5000);
    await delay(300);
    const state = await snap(before);
    const after = await stack();
    check("c2:back-discard:location-deep-equal-p", left && sameTriple(state.location, P) && state.windowPath === P.pathname, { location: triple(state.location), expected: triple(P) });
    check("c2:back-discard:history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex - 1), { stack: stackView(after) });
    check("c2:back-discard:pop-release-once-no-push-replace", counters(state).commits === 1 && state.commits[0].key === P.key && counters(state).pushState === 0 && counters(state).replaceState === 0, counters(state));
    check("c2:back-discard:zero-writes", mutationsOf(state.attempts).length === 0 && state.physical.color === null && state.dialog === null && state.unloadActive === 0, { mutations: mutationsOf(state.attempts), physical: state.physical.color });
    record("row", { row: "c", case: "back-discard-and-leave", target: step, expected: triple(P), observed: triple(state.location), counters: counters(state), commits: state.commits, stack: stackView(after), writes: mutationsOf(state.attempts).length });
    await runtimeClean("c2");
  }
  await traverseTo("c2:forward-to-s", "forward", S);
  // c3 Back + latest-completion release
  await evaluate("verify.restore()");
  await heldEdit("c3", "font", font("small"));
  {
    const { step } = await guardedTraversal("c3:back-latest", "back");
    const released = await mark();
    await evaluate('verify.release("font")');
    const left = await waitUntil(`verify.location().key === ${JSON.stringify(P.key)}`, 6000);
    await delay(400);
    const state = await snap(released);
    const after = await stack();
    const fontSets = state.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf("font"));
    check("c3:back-latest:location-deep-equal-p", left && sameTriple(state.location, P), { location: triple(state.location), expected: triple(P) });
    check("c3:back-latest:history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex - 1), { stack: stackView(after) });
    check("c3:back-latest:pop-release-once-no-push-replace", counters(state).commits === 1 && state.commits[0].key === P.key && counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).popstate === 1, counters(state));
    check("c3:back-latest:latest-persisted-dialog-closed", fontSets.length === 1 && fontSets[0].value === "small" && fontSets[0].outcome === "ok" && state.physical.font === "small" && state.dialog === null, { fontSets, physical: state.physical.font });
    record("row", { row: "c", case: "back-latest-completion-release", target: step, expected: triple(P), observed: triple(state.location), counters: counters(state), commits: state.commits, stack: stackView(after), write: fontSets[0] });
    await runtimeClean("c3");
  }
  await traverseTo("c3:forward-to-s", "forward", S);
  // c4 guarded Forward + Stay
  await failedEdit("c4", "pin_default", toggleSwitch("pin_default"));
  {
    const { step, before, heldWindow } = await guardedTraversal("c4:forward-stay", "forward");
    await dialogAction(STAY);
    const closed = await waitUntil("verify.dialog() === null", 3000);
    await delay(200);
    const state = await snap(before);
    const after = await stack();
    check("c4:forward-stay:location-deep-equal-s", closed && sameTriple(state.location, S) && state.windowPath === S.pathname, { location: triple(state.location) });
    check("c4:forward-stay:history-stack-intact-forward-entry-kept", sameEntries(after, E0) && atIndex(after, E0.currentIndex), { stack: stackView(after) });
    check("c4:forward-stay:pane-and-draft-kept", state.pane === "sticky" && isDeepStrictEqual(state.recovery, [recoveryEntry("pin_default", "failed")]) && state.displayed.pin_default === "false", { recovery: state.recovery });
    check("c4:forward-stay:no-history-mutation", counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).commits === 0, counters(state));
    const warning = await expectWarn("c4:forward-stay", true);
    record("row", { row: "c", case: "guarded-forward-stay", target: step, expected: triple(S), observed: triple(state.location), heldWindow, counters: counters(state), stack: stackView(after), warning });
    await runtimeClean("c4");
  }
  // c5 guarded Forward + discard-and-leave
  {
    const { step, before } = await guardedTraversal("c5:forward-discard", "forward");
    await dialogAction(DISCARD_LEAVE);
    const left = await waitUntil(`verify.location().key === ${JSON.stringify(X.key)}`, 5000);
    await delay(300);
    const state = await snap(before);
    const after = await stack();
    check("c5:forward-discard:location-deep-equal-x", left && sameTriple(state.location, X) && state.windowPath === X.pathname, { location: triple(state.location), expected: triple(X) });
    check("c5:forward-discard:history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex + 1), { stack: stackView(after) });
    check("c5:forward-discard:pop-release-once-no-push-replace", counters(state).commits === 1 && state.commits[0].key === X.key && counters(state).pushState === 0 && counters(state).replaceState === 0, counters(state));
    check("c5:forward-discard:zero-writes", mutationsOf(state.attempts).length === 0 && state.physical.pin_default === null && state.dialog === null, { mutations: mutationsOf(state.attempts) });
    record("row", { row: "c", case: "guarded-forward-discard-and-leave", target: step, expected: triple(X), observed: triple(state.location), counters: counters(state), commits: state.commits, stack: stackView(after), writes: mutationsOf(state.attempts).length });
    await runtimeClean("c5");
  }
  await traverseTo("c5:back-to-s", "back", S);
  // c6 guarded Forward + latest-completion release
  await evaluate("verify.restore()");
  await heldEdit("c6", "grid_spacing", spacing("large"));
  {
    const { step } = await guardedTraversal("c6:forward-latest", "forward");
    const released = await mark();
    await evaluate('verify.release("grid_spacing")');
    const left = await waitUntil(`verify.location().key === ${JSON.stringify(X.key)}`, 6000);
    await delay(400);
    const state = await snap(released);
    const after = await stack();
    const sets = state.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf("grid_spacing"));
    check("c6:forward-latest:location-deep-equal-x", left && sameTriple(state.location, X), { location: triple(state.location), expected: triple(X) });
    check("c6:forward-latest:history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex + 1), { stack: stackView(after) });
    check("c6:forward-latest:pop-release-once-no-push-replace", counters(state).commits === 1 && state.commits[0].key === X.key && counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).popstate === 1, counters(state));
    check("c6:forward-latest:latest-persisted-dialog-closed", sets.length === 1 && sets[0].value === "large" && sets[0].outcome === "ok" && state.physical.grid_spacing === "large" && state.dialog === null, { sets });
    record("row", { row: "c", case: "guarded-forward-latest-completion-release", target: step, expected: triple(X), observed: triple(state.location), counters: counters(state), commits: state.commits, stack: stackView(after), write: sets[0] });
    await runtimeClean("c6");
  }
  await traverseTo("c6:back-to-s", "back", S);
  // c7 programmatic router.navigate(-1) + discard-and-leave; c8 router.navigate(1) + Stay
  await failedEdit("c7", "restore_size", toggleSwitch("restore_size"));
  {
    const before = await mark();
    await evaluate("void verify.router.navigate(-1), true");
    await awaitHeld("c7:delta-back-discard", S, false);
    await dialogAction(DISCARD_LEAVE);
    const left = await waitUntil(`verify.location().key === ${JSON.stringify(P.key)}`, 5000);
    await delay(300);
    const state = await snap(before);
    const after = await stack();
    check("c7:delta-back-discard:location-deep-equal-p", left && sameTriple(state.location, P), { location: triple(state.location) });
    check("c7:delta-back-discard:history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex - 1), { stack: stackView(after) });
    check("c7:delta-back-discard:pop-release-once-no-push-replace-zero-writes", counters(state).commits === 1 && counters(state).pushState === 0 && counters(state).replaceState === 0 && mutationsOf(state.attempts).length === 0, { counters: counters(state), mutations: mutationsOf(state.attempts) });
    record("row", { row: "c", case: "programmatic-navigate(-1)-discard", expected: triple(P), observed: triple(state.location), counters: counters(state), stack: stackView(after) });
    await runtimeClean("c7");
  }
  await traverseTo("c7:forward-to-s", "forward", S);
  await failedEdit("c8", "restore_size", toggleSwitch("restore_size"));
  {
    const before = await mark();
    await evaluate("void verify.router.navigate(1), true");
    await awaitHeld("c8:delta-forward-stay", S, false);
    await dialogAction(STAY);
    const closed = await waitUntil("verify.dialog() === null", 3000);
    await delay(200);
    const state = await snap(before);
    const after = await stack();
    check("c8:delta-forward-stay:location-deep-equal-s-stack-intact", closed && sameTriple(state.location, S) && sameEntries(after, E0) && atIndex(after, E0.currentIndex), { location: triple(state.location), stack: stackView(after) });
    check("c8:delta-forward-stay:no-history-mutation-draft-kept", counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).commits === 0 && counters(state).popstate === 0 && isDeepStrictEqual(state.recovery, [recoveryEntry("restore_size", "failed")]), { counters: counters(state), recovery: state.recovery });
    record("row", { row: "c", case: "programmatic-navigate(1)-stay", expected: triple(S), observed: triple(state.location), counters: counters(state), stack: stackView(after) });
    await runtimeClean("c8");
    const discardMark = await mark();
    await paneAction("Discard Restore Default Size");
    const clean = await waitUntil("verify.recovery().length === 0", 3000);
    const discarded = await snap(discardMark);
    pre("c8:cleanup:targeted-discard-zero-writes", clean && mutationsOf(discarded.attempts).length === 0, { mutations: mutationsOf(discarded.attempts) });
    await evaluate("verify.restore()");
  }

  // c9-c11: latest-completion release driven by the user's Retry of an ordinary failed edit while a POP
  // (browser Back / guarded Forward / page-script history.back()) is held.
  async function retryRelease(id, field, input, direction, target, how) {
    await failedEdit(id, field, input);
    const before = await mark();
    const step = how === "browser" ? await browserTraverse(id, direction) : (await evaluate(direction === "back" ? "history.back(), true" : "history.forward(), true"), { script: `history.${direction}()` });
    await awaitHeld(id, S, true);
    const heldStack = await stack();
    check(`${id}:held-history-stack-intact`, sameEntries(heldStack, E0) && atIndex(heldStack, E0.currentIndex), { stack: stackView(heldStack) });
    const latest = await evaluate(`verify.attemptsAfter(0).filter((entry) => entry.op === "set" && entry.key === ${JSON.stringify(keyOf(field))}).at(-1) ?? null`);
    pre(`${id}:latest-choice-was-refused-by-fault`, latest?.outcome === "denied", { latest });
    await evaluate("verify.restore()");
    const released = await mark();
    await paneAction(`Retry ${LABELS[field]}`);
    const left = await waitUntil(`verify.location().key === ${JSON.stringify(target.key)}`, 6000);
    await delay(600);
    const state = await snap(released);
    const after = await stack();
    const sets = state.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf(field));
    const targetIndex = E0.currentIndex + (direction === "back" ? -1 : 1);
    check(`${id}:location-deep-equal-target`, left && sameTriple(state.location, target) && state.windowPath === target.pathname, { location: triple(state.location), expected: triple(target) });
    check(`${id}:history-stack-intact`, sameEntries(after, E0) && atIndex(after, targetIndex), { stack: stackView(after) });
    check(`${id}:pop-release-once-no-push-replace`, counters(state).commits === 1 && state.commits[0].key === target.key && counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).popstate === 1, counters(state));
    check(`${id}:latest-persisted-once-dialog-closed`, sets.length === 1 && sets[0].value === latest?.value && sets[0].outcome === "ok" && state.physical[field] === latest?.value && state.dialog === null, { sets, latest });
    record("row", { row: "c", case: `${id}:retry-release`, target: step, expected: triple(target), observed: triple(state.location), counters: counters(state), commits: state.commits, stack: stackView(after), write: sets[0] });
    await runtimeClean(id);
  }
  await retryRelease("c9:back-retry", "color", swatch("lilac"), "back", P, "browser");
  await traverseTo("c9:forward-to-s", "forward", S);
  await retryRelease("c10:forward-retry", "grid_spacing", spacing("normal"), "forward", X, "browser");
  await traverseTo("c10:back-to-s", "back", S);
  await retryRelease("c11:script-back-retry", "font", font("large"), "back", P, "script");
  await traverseTo("c11:forward-to-s", "forward", S);

  // =============================================================================================
  // Row i (POP): same-field ordering on pin_default, latest held behind the real lock; Back to P
  // =============================================================================================
  async function sameFieldSetup(id, field, first, second, expectedDisplay) {
    const name = await heldEdit(`${id}:predecessor`, field, first);
    const queued = await evaluate(`verify.queueMiddle(${JSON.stringify(field)})`);
    const middleQueued = await waitUntil(`verify.lockQuery().then((query) => query.pending.filter((entry) => entry === ${JSON.stringify(name)}).length === 2)`, 3000);
    pre(`${id}:middle-request-queued-behind-engine`, queued === name && middleQueued && (await evaluate(`verify.middleAcquired(${JSON.stringify(field)})`)) === false, { queued });
    const before = await mark();
    await second();
    await delay(300);
    const state = await snap(before);
    const appRequests = state.locks.filter((entry) => entry.by === "app" && entry.name === name);
    pre(`${id}:latest-queued-in-hook-not-yet-at-engine`, appRequests.length === 0 && isDeepStrictEqual(state.recovery, [recoveryEntry(field, "pending")]), { appRequests, recovery: state.recovery });
    check(`${id}:latest-displayed-while-held`, isDeepStrictEqual(field === "color" ? state.displayed.color : state.displayed[field], expectedDisplay), { displayed: state.displayed });
    return name;
  }
  async function sameFieldOrdering(id, field, name, predecessorRaw, latestRaw, heldLocation, heldStack) {
    const m1 = await mark();
    await evaluate(`verify.denySetValue(${JSON.stringify(field)}, ${JSON.stringify(latestRaw)})`);
    await evaluate(`verify.release(${JSON.stringify(field)})`);
    const predecessorDone = await waitUntil(`verify.physical()[${JSON.stringify(field)}] === ${JSON.stringify(predecessorRaw)} && verify.middleAcquired(${JSON.stringify(field)}) === true
      && verify.locksAfter(${m1}).some((entry) => entry.by === "app" && entry.name === ${JSON.stringify(name)})`, 6000);
    const latestWaiting = await waitUntil(`verify.lockQuery().then((query) => query.held.includes(${JSON.stringify(name)}) && query.pending.includes(${JSON.stringify(name)}))`, 3000);
    pre(`${id}:predecessor-completed-latest-genuinely-held-behind-real-lock`, predecessorDone && latestWaiting, { physical: await evaluate("verify.physical()"), locks: await evaluate("verify.lockQuery()") });
    await delay(300);
    const s1 = await snap(m1);
    const s1Stack = await stack();
    const predecessorSets = s1.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf(field));
    check(`${id}:step1-predecessor-write-only`, predecessorSets.length === 1 && predecessorSets[0].value === predecessorRaw && predecessorSets[0].outcome === "ok", { predecessorSets });
    check(`${id}:step2-location-held`, sameTriple(s1.location, heldLocation) && s1.windowPath === heldLocation.pathname && s1.pane === "sticky", { location: triple(s1.location) });
    check(`${id}:step2-dialog-open`, isDeepStrictEqual(s1.dialog, DIALOG), { dialog: s1.dialog });
    check(`${id}:step2-zero-history-mutations`, isDeepStrictEqual(counters(s1), { pushState: 0, replaceState: 0, popstate: 0, commits: 0 }) && sameEntries(s1Stack, heldStack) && s1Stack.currentIndex === heldStack.currentIndex, { counters: counters(s1), stack: stackView(s1Stack) });
    check(`${id}:step2-latest-pending-shown`, isDeepStrictEqual(s1.recovery, [recoveryEntry(field, "pending")]) && s1.saved === null, { recovery: s1.recovery });
    record("row", { row: "i", case: `${id}:predecessor-complete-latest-held`, physical: s1.physical[field], displayed: s1.displayed, location: triple(s1.location), dialog: s1.dialog !== null, counters: counters(s1), predecessorWrite: predecessorSets[0] });

    const m1b = await mark();
    await evaluate(`verify.releaseMiddle(${JSON.stringify(field)})`);
    const failed = await waitUntil(`JSON.stringify(verify.recovery()) === ${JSON.stringify(JSON.stringify([recoveryEntry(field, "failed")]))}`, 6000);
    await delay(250);
    const s2 = await snap(m1b);
    const s2All = await snap(m1);
    const latestSets = s2.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf(field));
    const latestReads = s2.attempts.filter((entry) => entry.op === "get" && entry.key === keyOf(field));
    pre(`${id}:step3-injected-setitem-fault-fired-on-latest-value`, failed && latestSets.length === 1 && latestSets[0].value === latestRaw && latestSets[0].outcome === "denied-value", { latestSets });
    check(`${id}:step3-latest-fails-through-setitem-fault-not-conflict`, latestReads.length >= 1 && latestReads[0].seq < latestSets[0].seq && s2.physical[field] === predecessorRaw && s2.saved === null, { latestReads: latestReads.length, physical: s2.physical[field] });
    check(`${id}:step3-still-held-zero-history-mutations`, sameTriple(s2.location, heldLocation) && isDeepStrictEqual(s2.dialog, DIALOG) && isDeepStrictEqual(counters(s2All), { pushState: 0, replaceState: 0, popstate: 0, commits: 0 }), { location: triple(s2.location), counters: counters(s2All) });
    record("row", { row: "i", case: `${id}:latest-failed-setitem-fault`, physical: s2.physical[field], latestWrite: latestSets[0], location: triple(s2.location), dialog: s2.dialog !== null, counters: counters(s2All) });
    await evaluate("verify.restore()");
    const m2 = await mark();
    await paneAction(`Retry ${LABELS[field]}`);
    return { m1, m2 };
  }

  pre("i-pop:setup:at-s-clean-pin-absent", sameTriple(await location(), S) && (await evaluate("verify.recovery()")).length === 0 && (await evaluate("verify.physical().pin_default")) === null);
  {
    const name = await sameFieldSetup("i-pop", "pin_default", toggleSwitch("pin_default"), toggleSwitch("pin_default"), "true");
    const before = await mark();
    await browserTraverse("i-pop:back", "back");
    await awaitHeld("i-pop:back", S, true);
    const heldStack = await stack();
    pre("i-pop:held-stack", sameEntries(heldStack, E0) && heldStack.currentIndex === E0.currentIndex, { stack: stackView(heldStack) });
    const blockedPops = counters(await hostWindow(before));
    const { m2 } = await sameFieldOrdering("i-pop", "pin_default", name, "false", "true", S, heldStack);
    const left = await waitUntil(`verify.location().key === ${JSON.stringify(P.key)}`, 6000);
    await delay(600);
    const s3 = await snap(m2);
    const after = await stack();
    const retrySets = s3.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf("pin_default"));
    check("i-pop:step4-retry-releases-exactly-once-to-intended-entry", left && counters(s3).commits === 1 && s3.commits[0].key === P.key && sameTriple(s3.location, P), { commits: s3.commits, location: triple(s3.location) });
    check("i-pop:step4-pop-release-zero-push-replace", counters(s3).pushState === 0 && counters(s3).replaceState === 0 && counters(s3).popstate === 1, counters(s3));
    check("i-pop:step4-dialog-closed-latest-persisted-once", s3.dialog === null && retrySets.length === 1 && retrySets[0].value === "true" && retrySets[0].outcome === "ok" && s3.physical.pin_default === "true", { retrySets, physical: s3.physical.pin_default });
    check("i-pop:step4-history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex - 1), { stack: stackView(after) });
    record("row", { row: "i", case: "i-pop:retry-release", blockedTraversal: blockedPops, counters: counters(s3), commits: s3.commits, expected: triple(P), observed: triple(s3.location), stack: stackView(after), retryWrite: retrySets[0] });
    await runtimeClean("i-pop");
  }
  await traverseTo("i-pop:forward-to-s", "forward", S);

  // =============================================================================================
  // Row i (PUSH): same-field ordering on color, held trusted sidebar intent
  // =============================================================================================
  pre("i-push:setup:color-neither-predecessor-nor-latest", !["mint", "coral"].includes(await evaluate("verify.physical().color")) && (await evaluate("verify.recovery()")).length === 0);
  {
    const name = await sameFieldSetup("i-push", "color", swatch("mint"), swatch("coral"), ["coral"]);
    const before = await mark();
    await sidebarClick("Hotkeys");
    await awaitHeld("i-push:sidebar", S, false);
    const heldStack = await stack();
    pre("i-push:held-no-mutation", counters(await hostWindow(before)).commits === 0 && counters(await hostWindow(before)).pushState === 0, {});
    const { m2 } = await sameFieldOrdering("i-push", "color", name, "mint", "coral", S, heldStack);
    const left = await waitUntil("verify.location().pathname === '/app/settings/hotkeys'", 6000);
    await delay(600);
    const s3 = await snap(m2);
    const after = await stack();
    const retrySets = s3.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf("color"));
    const pushes = s3.history.filter((entry) => entry.method === "pushState");
    check("i-push:step4-retry-releases-exactly-once-to-intended-entry", left && counters(s3).commits === 1 && s3.commits[0].pathname === "/app/settings/hotkeys" && s3.commits[0].key !== S.key && s3.commits[0].state === null && s3.commits[0].action === "PUSH", { commits: s3.commits });
    check("i-push:step4-one-push-for-the-commit-no-replace", counters(s3).pushState === 1 && pushes[0].key === s3.commits[0].key && pushes[0].url === "/app/settings/hotkeys" && counters(s3).replaceState === 0 && counters(s3).popstate === 0, { counters: counters(s3), pushes });
    check("i-push:step4-dialog-closed-latest-persisted-once", s3.dialog === null && retrySets.length === 1 && retrySets[0].value === "coral" && retrySets[0].outcome === "ok" && s3.physical.color === "coral", { retrySets });
    record("row", { row: "i", case: "i-push:retry-release", counters: counters(s3), commits: s3.commits, pushes, observed: triple(s3.location), stack: stackView(after), retryWrite: retrySets[0] });
    await runtimeClean("i-push");
  }

  // =============================================================================================
  // Row a: trusted, hit-tested production sidebar; ignored second activation while pending
  // =============================================================================================
  async function newStickyEntry(id) {
    const before = await mark();
    await sidebarClick("Sticky Note");
    const ok = await waitUntil("verify.stickyMounted() && verify.location().pathname === '/app/settings/sticky'", 6000);
    await delay(450);
    const state = await snap(before);
    pre(`${id}:sticky-entry-mounted-clean`, ok && counters(state).pushState === 1 && state.recovery.length === 0 && mutationsOf(state.attempts.filter((entry) => isSticky(entry.key))).length === 0, { counters: counters(state), recovery: state.recovery });
    return state.location;
  }
  let current = await newStickyEntry("a:setup");
  await failedEdit("a", "color", swatch("mint"));
  {
    const stackBefore = await stack();
    const before = await mark();
    const point = await sidebarClick("Hotkeys");
    await awaitHeld("a:sidebar", current, false);
    const state = await snap(before);
    const trusted = state.events.some((event) => event.type === "click" && event.trusted && event.target === "sidebar:Hotkeys");
    check("a:sidebar:trusted-hit-tested-activation", trusted, { events: state.events.map((event) => `${event.type}:${event.target}:${event.trusted}`) });
    check("a:sidebar:no-history-mutation", counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).commits === 0 && sameEntries(await stack(), stackBefore), counters(state));
    const rows = await evaluate("verify.sidebarRows()");
    const second = rows.find((row) => row.label === "Date & Time" && row.uncovered) ?? rows.find((row) => row.uncovered && !["Sticky Note", "Hotkeys"].includes(row.label));
    pre("a:second-row-uncovered", Boolean(second), { rows });
    const secondMark = await mark();
    await sidebarClick(second.label);
    await delay(400);
    const ignored = await snap(secondMark);
    check("a:second-activation-ignored-while-pending", ignored.events.some((event) => event.type === "click" && event.trusted && event.target === `sidebar:${second.label}`)
      && isDeepStrictEqual(ignored.dialog, DIALOG) && sameTriple(ignored.location, current) && counters(ignored).commits === 0 && counters(ignored).pushState === 0, { location: triple(ignored.location), counters: counters(ignored) });
    const discardMark = await mark();
    await dialogAction(DISCARD_LEAVE);
    const left = await waitUntil("verify.location().pathname !== '/app/settings/sticky'", 5000);
    await delay(300);
    const after = await snap(discardMark);
    check("a:first-intent-released-once-to-hotkeys", left && counters(after).commits === 1 && after.commits[0].pathname === "/app/settings/hotkeys" && counters(after).pushState === 1 && after.history[0].key === after.commits[0].key, { commits: after.commits, counters: counters(after) });
    check("a:discard-zero-writes", mutationsOf(after.attempts).length === 0 && after.physical.color === "coral", { mutations: mutationsOf(after.attempts), physical: after.physical.color });
    record("row", { row: "a", point, heldLocation: triple(state.location), dialog: state.dialog, ignoredSecondRow: second.label, release: after.commits, counters: counters(after), writes: mutationsOf(after.attempts).length });
    await runtimeClean("a");
  }

  // =============================================================================================
  // Rows g and b: Stay, Escape, dialog export; fresh intents; AppRail and programmatic navigation
  // =============================================================================================
  current = await newStickyEntry("g:setup");
  await failedEdit("g", "color", swatch("mint"));
  {
    const stackBefore = await stack();
    const keep = async (id, since, dialogExpected) => {
      const state = await snap(since);
      const nowStack = await stack();
      check(`${id}:url-history-pane-kept`, sameTriple(state.location, current) && state.windowPath === current.pathname && sameEntries(nowStack, stackBefore) && nowStack.currentIndex === stackBefore.currentIndex
        && state.pane === "sticky" && isDeepStrictEqual(state.recovery, [recoveryEntry("color", "failed")]), { location: triple(state.location), recovery: state.recovery, stack: stackView(nowStack) });
      check(`${id}:no-history-mutation`, counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).commits === 0, counters(state));
      check(`${id}:dialog-${dialogExpected ? "kept" : "closed"}`, dialogExpected ? isDeepStrictEqual(state.dialog, DIALOG) : state.dialog === null, { dialog: state.dialog });
      return state;
    };
    // g1 Stay, then a fresh intent prompts again.
    let since = await mark();
    await sidebarClick("Hotkeys");
    await awaitHeld("g1:intent", current, false);
    await dialogAction(STAY);
    await waitUntil("verify.dialog() === null", 3000);
    await delay(200);
    const g1 = await keep("g1:stay", since, false);
    check("g1:stay-trusted", g1.events.some((event) => event.type === "click" && event.trusted && event.target === "dialog:Stay"), {});
    await expectWarn("g1:stay", true);
    since = await mark();
    await sidebarClick("Hotkeys");
    await awaitHeld("g1:fresh-intent-after-stay-prompts-again", current, false);
    record("row", { row: "g", case: "stay-then-fresh-intent", location: triple(g1.location), counters: counters(g1), reprompted: true });
    await runtimeClean("g1");
    // g2 Escape (focus is inside the dialog), then a fresh AppRail intent (row b1).
    pre("g2:focus-inside-dialog", await evaluate("verify.focusInDialog()"));
    since = await mark();
    await pressEscape();
    await waitUntil("verify.dialog() === null", 3000);
    await delay(200);
    const g2 = await keep("g2:escape", since, false);
    check("g2:escape-trusted", g2.events.some((event) => event.type === "keydown" && event.trusted && event.key === "Escape"), { events: g2.events.map((event) => `${event.type}:${event.target}:${event.key ?? ""}:${event.trusted}`) });
    await expectWarn("g2:escape", true);
    record("row", { row: "g", case: "escape", location: triple(g2.location), counters: counters(g2) });
    await runtimeClean("g2");
    since = await mark();
    const railPoint = await trustedClick(RAIL("Tasks"), "rail Tasks");
    await awaitHeld("b1:apprail", current, false);
    const b1 = await keep("b1:apprail-held", since, true);
    check("b1:apprail-trusted", b1.events.some((event) => event.type === "click" && event.trusted && event.target === "rail:Tasks"), { events: b1.events.map((event) => `${event.type}:${event.target}:${event.trusted}`) });
    record("row", { row: "b", case: "apprail-tasks", point: railPoint, location: triple(b1.location), counters: counters(b1), dialog: b1.dialog });
    await runtimeClean("b1");
    await dialogAction(STAY);
    await waitUntil("verify.dialog() === null", 3000);
    // b2 programmatic module navigation.
    since = await mark();
    await evaluate('void verify.router.navigate("/app/tasks"), true');
    await awaitHeld("b2:programmatic-module", current, false);
    const b2 = await keep("b2:programmatic-held", since, true);
    record("row", { row: "b", case: "programmatic-/app/tasks", location: triple(b2.location), counters: counters(b2), dialog: b2.dialog });
    await runtimeClean("b2");
    // g3 export from the dialog keeps URL, history, pane and dialog.
    since = await mark();
    const traceBefore = await evaluate("({ url: verify.urlTrace(), anchors: verify.anchorTrace() })");
    pre("g3:download-directory-empty", visibleDownloads().length === 0, { names: readdirSync(downloads) });
    await dialogAction(EXPORT);
    const download = await awaitDownload();
    await delay(150);
    const g3 = await keep("g3:export", since, true);
    const traceAfter = await evaluate("({ url: verify.urlTrace(), anchors: verify.anchorTrace(), inDom: verify.anchorsInDom() })");
    const created = traceAfter.url.created.slice(traceBefore.url.created.length);
    const revoked = traceAfter.url.revoked.slice(traceBefore.url.revoked.length);
    check("g3:export:actual-download-envelope", download !== null && isDeepStrictEqual(JSON.parse(download.raw.toString("utf8")), { version: 1, kind: "sticky-draft", values: { device: { color: "mint" } } }), { names: readdirSync(downloads) });
    check("g3:export:memory-only-one-url-revoked-anchor-removed", g3.attempts.length === 0 && created.length === 1 && revoked.length === 1 && revoked[0] === created[0] && traceAfter.inDom === 0, { attempts: summarize(g3.attempts), created, revoked });
    check("g3:export-trusted", g3.events.some((event) => event.type === "click" && event.trusted && event.target === `dialog:${EXPORT}`), {});
    record("row", { row: "g", case: "dialog-export", location: triple(g3.location), counters: counters(g3), dialog: g3.dialog, download: { sha256: sha256(download.raw), bytes: download.raw.length, payload: JSON.parse(download.raw.toString("utf8")) }, attempts: summarize(g3.attempts) });
    await runtimeClean("g3");
    rmSync(download.file);
    await dialogAction(STAY);
    await waitUntil("verify.dialog() === null", 3000);
  }

  // =============================================================================================
  // Row d: relative navigation, state and options replayed exactly
  // =============================================================================================
  {
    // d1: path-relative push with state, released by the latest completion (Retry).
    let since = await mark();
    await evaluate('void verify.router.navigate("../hotkeys", { relative: "path", state: { token: "host-d1" } }), true');
    await awaitHeld("d1:relative-push", current, false);
    const held = counters(await hostWindow(since));
    check("d1:held-no-history-mutation", held.pushState === 0 && held.commits === 0, held);
    await evaluate("verify.restore()");
    const m = await mark();
    await paneAction("Retry Default Color");
    const left = await waitUntil("verify.location().pathname === '/app/settings/hotkeys'", 6000);
    await delay(400);
    const state = await snap(m);
    const pushes = state.history.filter((entry) => entry.method === "pushState");
    check("d1:relative-path-and-state-replayed", left && counters(state).commits === 1 && state.commits[0].pathname === "/app/settings/hotkeys" && isDeepStrictEqual(state.commits[0].state, { token: "host-d1" }) && state.commits[0].action === "PUSH", { commits: state.commits });
    check("d1:one-push-with-state-no-replace", counters(state).pushState === 1 && isDeepStrictEqual(pushes[0].usr, { token: "host-d1" }) && pushes[0].key === state.commits[0].key && counters(state).replaceState === 0, { pushes, counters: counters(state) });
    check("d1:latest-persisted-dialog-closed", state.dialog === null && state.physical.color === "mint", { physical: state.physical.color });
    record("row", { row: "d", case: "relative-path-state-push", call: { to: "../hotkeys", options: { relative: "path", state: { token: "host-d1" } } }, commits: state.commits, pushes, counters: counters(state) });
    await runtimeClean("d1");
    await traverseTo("d1:back-to-sticky", "back", current);
    // d2: path-relative replace with state, released by discard-and-leave.
    await failedEdit("d2", "font", font("xl"));
    const lengthBefore = await evaluate("verify.historyLength()");
    const physicalBeforeD2 = await evaluate("verify.physical()");
    const stackBefore = await stack();
    since = await mark();
    await evaluate('void verify.router.navigate("../date_time", { relative: "path", state: { token: "host-d2" }, replace: true }), true');
    await awaitHeld("d2:relative-replace", current, false);
    const m2 = await mark();
    await dialogAction(DISCARD_LEAVE);
    const left2 = await waitUntil("verify.location().pathname === '/app/settings/date_time'", 6000);
    await delay(400);
    const state2 = await snap(m2);
    const replaces = state2.history.filter((entry) => entry.method === "replaceState");
    const stackAfter = await stack();
    check("d2:relative-path-state-replace-replayed", left2 && counters(state2).commits === 1 && state2.commits[0].pathname === "/app/settings/date_time" && isDeepStrictEqual(state2.commits[0].state, { token: "host-d2" }) && state2.commits[0].action === "REPLACE", { commits: state2.commits });
    check("d2:one-replace-with-state-no-push", counters(state2).replaceState === 1 && isDeepStrictEqual(replaces[0].usr, { token: "host-d2" }) && replaces[0].key === state2.commits[0].key && counters(state2).pushState === 0, { replaces, counters: counters(state2) });
    check("d2:history-length-and-index-unchanged", stackAfter.length === lengthBefore && stackAfter.currentIndex === stackBefore.currentIndex && stackAfter.browserEntries.length === stackBefore.browserEntries.length, { lengthBefore, stack: stackView(stackAfter) });
    check("d2:discard-zero-writes", mutationsOf(state2.attempts).length === 0 && isDeepStrictEqual(state2.physical, physicalBeforeD2), { mutations: mutationsOf(state2.attempts), physical: state2.physical });
    record("row", { row: "d", case: "relative-path-state-replace", call: { to: "../date_time", options: { relative: "path", state: { token: "host-d2" }, replace: true } }, commits: state2.commits, replaces, counters: counters(state2), historyLength: { before: lengthBefore, after: stackAfter.length } });
    await runtimeClean("d2");
  }

  // =============================================================================================
  // Row e: voluntary sign-out through the real departure preflight
  // =============================================================================================
  current = await newStickyEntry("e:setup");
  {
    await evaluate('verify.signout("e1-clean")');
    const clean = await waitUntil('verify.signouts["e1-clean"] === "true"', 3000);
    check("e1:clean-sign-out-preflight-true-no-dialog", clean && (await evaluate("verify.dialog()")) === null, { signout: await evaluate('verify.signouts["e1-clean"]') });
    await failedEdit("e2", "restore_size", toggleSwitch("restore_size"));
    let since = await mark();
    await evaluate('verify.signout("e2-stay")');
    await awaitHeld("e2:sign-out", current, false);
    pre("e2:sign-out-pending-while-held", (await evaluate('verify.signouts["e2-stay"]')) === "pending");
    await dialogAction(STAY);
    const resolved = await waitUntil('verify.signouts["e2-stay"] === "false"', 3000);
    await delay(200);
    const state = await snap(since);
    check("e2:stay-resolves-false", resolved && state.dialog === null, { signout: state.signouts["e2-stay"] });
    check("e2:stay-keeps-location-and-draft", sameTriple(state.location, current) && isDeepStrictEqual(state.recovery, [recoveryEntry("restore_size", "failed")]) && counters(state).commits === 0 && counters(state).pushState === 0, { location: triple(state.location), recovery: state.recovery });
    record("row", { row: "e", case: "sign-out-stay", result: state.signouts["e2-stay"], cleanControl: "true", location: triple(state.location), counters: counters(state) });
    await runtimeClean("e2");
    since = await mark();
    await evaluate('verify.signout("e3-discard")');
    await awaitHeld("e3:sign-out", current, false);
    await dialogAction(DISCARD_LEAVE);
    const allowed = await waitUntil('verify.signouts["e3-discard"] === "true"', 3000);
    await delay(200);
    const discarded = await snap(since);
    check("e3:discard-resolves-true-zero-writes", allowed && mutationsOf(discarded.attempts).length === 0 && discarded.recovery.length === 0 && sameTriple(discarded.location, current) && counters(discarded).commits === 0, { signout: discarded.signouts["e3-discard"], mutations: mutationsOf(discarded.attempts) });
    await expectWarn("e3:after-discard", false);
    record("row", { row: "e", case: "sign-out-discard", result: discarded.signouts["e3-discard"], writes: mutationsOf(discarded.attempts).length });
    await runtimeClean("e3");
  }

  // =============================================================================================
  // Row f: first same-turn intent wins (route vs route, route vs sign-out, sign-out vs route)
  // =============================================================================================
  await failedEdit("f1", "color", swatch("peach"));
  {
    const since = await mark();
    await evaluate('void verify.router.navigate("/app/settings/hotkeys"), void verify.router.navigate("/app/settings/date_time"), true');
    await awaitHeld("f1:route-vs-route", current, false);
    await dialogAction(DISCARD_LEAVE);
    const left = await waitUntil("verify.location().pathname !== '/app/settings/sticky'", 5000);
    await delay(400);
    const state = await snap(since);
    check("f1:first-route-wins-released-once", left && counters(state).commits === 1 && state.commits[0].pathname === "/app/settings/hotkeys" && counters(state).pushState === 1 && !state.history.some((entry) => entry.url.includes("date_time")), { commits: state.commits, history: state.history });
    check("f1:zero-writes", mutationsOf(state.attempts).length === 0, { mutations: mutationsOf(state.attempts) });
    record("row", { row: "f", case: "route-vs-route", calls: ["/app/settings/hotkeys", "/app/settings/date_time"], commits: state.commits, counters: counters(state) });
    await runtimeClean("f1");
  }
  current = await newStickyEntry("f2:setup");
  await failedEdit("f2", "color", swatch("peach"));
  {
    const since = await mark();
    await evaluate('void verify.router.navigate("/app/settings/hotkeys"), verify.signout("f2-later"), true');
    await awaitHeld("f2:route-vs-sign-out", current, false);
    const lost = await waitUntil('verify.signouts["f2-later"] === "false"', 3000);
    check("f2:later-sign-out-resolves-false-while-route-held", lost, { signout: await evaluate('verify.signouts["f2-later"]') });
    await dialogAction(DISCARD_LEAVE);
    const left = await waitUntil("verify.location().pathname === '/app/settings/hotkeys'", 5000);
    await delay(300);
    const state = await snap(since);
    check("f2:first-route-is-the-held-intent", left && counters(state).commits === 1 && state.commits[0].pathname === "/app/settings/hotkeys" && state.signouts["f2-later"] === "false" && mutationsOf(state.attempts).length === 0, { commits: state.commits, signout: state.signouts["f2-later"] });
    record("row", { row: "f", case: "route-vs-sign-out", signout: state.signouts["f2-later"], commits: state.commits, counters: counters(state) });
    await runtimeClean("f2");
  }
  current = await newStickyEntry("f3:setup");
  await failedEdit("f3", "color", swatch("peach"));
  {
    const since = await mark();
    await evaluate('verify.signout("f3-first"), void verify.router.navigate("/app/settings/hotkeys"), true');
    await awaitHeld("f3:sign-out-vs-route", current, false);
    pre("f3:sign-out-pending", (await evaluate('verify.signouts["f3-first"]')) === "pending");
    await dialogAction(DISCARD_LEAVE);
    const allowed = await waitUntil('verify.signouts["f3-first"] === "true"', 3000);
    await delay(700);
    const state = await snap(since);
    check("f3:first-sign-out-wins-later-route-dropped", allowed && sameTriple(state.location, current) && counters(state).commits === 0 && counters(state).pushState === 0 && mutationsOf(state.attempts).length === 0, { location: triple(state.location), counters: counters(state) });
    record("row", { row: "f", case: "sign-out-vs-route", signout: state.signouts["f3-first"], location: triple(state.location), counters: counters(state) });
    await runtimeClean("f3");
  }

  // =============================================================================================
  // Row h: partial work; repairing one keeps holding; newer edit and offscreen/hidden recovery hold
  // =============================================================================================
  await failedEdit("h", "color", swatch("sky"));
  await failedEdit("h", "font", font("normal"));
  {
    pre("h:two-failing-fields", isDeepStrictEqual(await evaluate("verify.recovery()"), [recoveryEntry("color", "failed"), recoveryEntry("font", "failed")]));
    // Offscreen recovery: a shorter viewport and the pane scrolled to its end.
    await cdp("Emulation.setDeviceMetricsOverride", { width: 1280, height: 420, deviceScaleFactor: 1, mobile: false });
    await delay(300);
    const scrolled = await evaluate("verify.scrollPaneToEnd()");
    await delay(200);
    const geometry = await evaluate('({ color: verify.recoveryGeometry("color"), font: verify.recoveryGeometry("font") })');
    pre("h:offscreen:both-recovery-blocks-out-of-view", geometry.color?.offscreen === true && geometry.font?.offscreen === true, { scrolled, geometry });
    let since = await mark();
    await trustedClick(RAIL("Tasks"), "rail Tasks (offscreen)");
    await awaitHeld("h:offscreen", current, false);
    const offscreenState = await snap(since);
    const geometryWhileHeld = await evaluate('({ color: verify.recoveryGeometry("color"), font: verify.recoveryGeometry("font") })');
    check("h:offscreen:recovery-out-of-view-still-holds", counters(offscreenState).commits === 0 && counters(offscreenState).pushState === 0
      && geometryWhileHeld.color?.offscreen === true && geometryWhileHeld.font?.offscreen === true, { counters: counters(offscreenState), geometryWhileHeld });
    record("row", { row: "h", case: "offscreen-recovery-holds", geometry, geometryWhileHeld, scrolled, location: triple(offscreenState.location), counters: counters(offscreenState) });
    await runtimeClean("h-offscreen");
    await dialogAction(STAY);
    await waitUntil("verify.dialog() === null", 3000);
    await cdp("Emulation.clearDeviceMetricsOverride");
    await delay(300);
    // Hidden document: another foreground tab hides this page while a programmatic intent arrives.
    // CDP focus emulation keeps a page "visible", so it is switched off for this step only.
    await cdp("Emulation.setFocusEmulationEnabled", { enabled: false });
    const { targetId } = await cdp("Target.createTarget", { url: "about:blank", background: false });
    await delay(500);
    const hidden = await evaluate("verify.visibility()");
    pre("h:hidden:page-hidden-by-foreground-tab", hidden === "hidden", { hidden });
    since = await mark();
    await evaluate('void verify.router.navigate("/app/tasks"), true');
    await delay(400);
    const hiddenState = await snap(since);
    check("h:hidden:intent-held-while-hidden", isDeepStrictEqual(hiddenState.dialog, DIALOG) && sameTriple(hiddenState.location, current) && counters(hiddenState).commits === 0, { dialog: hiddenState.dialog, location: triple(hiddenState.location) });
    await cdp("Target.closeTarget", { targetId });
    await cdp("Page.bringToFront");
    await delay(400);
    await cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
    const visible = await evaluate("verify.visibility()");
    const shown = await snap(since);
    check("h:hidden:still-held-when-visible-again", visible === "visible" && isDeepStrictEqual(shown.dialog, DIALOG) && sameTriple(shown.location, current) && counters(shown).commits === 0, { visible, location: triple(shown.location) });
    record("row", { row: "h", case: "hidden-document-holds", visibilityWhileHidden: hidden, visibilityAfter: visible, location: triple(shown.location), counters: counters(shown) });
    await runtimeClean("h-hidden");
    // Repair one of the two failing fields: still holding.
    await evaluate('verify.restore(), verify.denySet(["font"])');
    await paneAction("Retry Default Color");
    const repaired = await waitUntil(`JSON.stringify(verify.recovery()) === ${JSON.stringify(JSON.stringify([recoveryEntry("font", "failed")]))}`, 5000);
    await delay(300);
    const one = await snap(since);
    check("h:repair-one-keeps-holding", repaired && one.physical.color === "sky" && isDeepStrictEqual(one.dialog, DIALOG) && sameTriple(one.location, current) && counters(one).commits === 0 && counters(one).pushState === 0, { physical: one.physical.color, location: triple(one.location), counters: counters(one) });
    record("row", { row: "h", case: "repair-one-of-two", recovery: one.recovery, physical: one.physical, counters: counters(one) });
    await runtimeClean("h-repair-one");
    // A newer edit (held behind the real lock) keeps holding after the last failure is repaired.
    await heldEdit("h:newer", "pin_default", toggleSwitch("pin_default"));
    await evaluate("verify.restore()");
    await paneAction("Retry Font Size");
    const fontRepaired = await waitUntil(`JSON.stringify(verify.recovery()) === ${JSON.stringify(JSON.stringify([recoveryEntry("pin_default", "pending")]))}`, 5000);
    await delay(300);
    const newer = await snap(since);
    check("h:newer-edit-keeps-holding", fontRepaired && newer.physical.font === "normal" && isDeepStrictEqual(newer.dialog, DIALOG) && sameTriple(newer.location, current) && counters(newer).commits === 0 && counters(newer).pushState === 0, { physical: newer.physical, counters: counters(newer) });
    record("row", { row: "h", case: "newer-edit-holds", recovery: newer.recovery, physical: newer.physical, counters: counters(newer) });
    await runtimeClean("h-newer-edit");
    const m = await mark();
    await evaluate('verify.release("pin_default")');
    const left = await waitUntil("verify.location().pathname === '/app/tasks'", 6000);
    await delay(400);
    const released = await snap(m);
    check("h:last-work-releases-held-intent-once", left && counters(released).commits === 1 && released.commits[0].pathname === "/app/tasks" && counters(released).pushState === 1 && counters(released).replaceState === 0 && released.physical.pin_default === "false", { commits: released.commits, counters: counters(released) });
    record("row", { row: "h", case: "release-after-all-work-settles", commits: released.commits, counters: counters(released), physical: released.physical });
    await runtimeClean("h-release");
  }

  // =============================================================================================
  // Row j: Discard all and leave (dialog), and pane "Discard all changes" during a held intent
  // =============================================================================================
  {
    const since = await mark();
    await evaluate('void verify.router.navigate("/app/settings/sticky"), true');
    pre("j:setup:sticky", await waitUntil("verify.stickyMounted() && verify.location().pathname === '/app/settings/sticky'", 6000));
    await delay(450);
    current = await location();
    pre("j:setup:clean", (await evaluate("verify.recovery()")).length === 0 && counters(await hostWindow(since)).pushState === 1);
  }
  {
    await evaluate('verify.denySet("sticky")');
    await failedEdit("j1", "color", swatch("lilac"));
    await failedEdit("j1", "font", font("large"));
    await failedEdit("j1", "pin_default", toggleSwitch("pin_default"));
    await failedEdit("j1", "restore_size", toggleSwitch("restore_size"));
    await failedEdit("j1", "grid_spacing", spacing("none"));
    pre("j1:all-five-failing", isDeepStrictEqual(await evaluate("verify.recovery()"), FIELDS.map((field) => recoveryEntry(field, "failed"))));
    const physicalBefore = await evaluate("verify.physical()");
    await sidebarClick("Hotkeys");
    await awaitHeld("j1:intent", current, false);
    const m = await mark();
    await dialogAction(DISCARD_LEAVE);
    const left = await waitUntil("verify.location().pathname === '/app/settings/hotkeys'", 5000);
    await delay(400);
    const state = await snap(m);
    check("j1:releases-once", left && counters(state).commits === 1 && state.commits[0].pathname === "/app/settings/hotkeys" && counters(state).pushState === 1 && counters(state).replaceState === 0, { commits: state.commits, counters: counters(state) });
    check("j1:zero-storage-writes-any-key", mutationsOf(state.attempts).length === 0 && isDeepStrictEqual(state.physical, physicalBefore), { mutations: mutationsOf(state.attempts), physical: state.physical });
    check("j1:dialog-closed-unload-listener-gone", state.dialog === null && state.unloadActive === 0, { unloadActive: state.unloadActive });
    record("row", { row: "j", case: "dialog-discard-all-and-leave", drafts: 5, commits: state.commits, counters: counters(state), attempts: summarize(state.attempts), physical: state.physical });
    await runtimeClean("j1");
  }
  current = await newStickyEntry("j2:setup");
  {
    await evaluate('verify.denySet("sticky")');
    await failedEdit("j2", "color", swatch("mint"));
    await failedEdit("j2", "grid_spacing", spacing("xl"));
    await evaluate('void verify.router.navigate("/app/settings/date_time"), true');
    await awaitHeld("j2:intent", current, false);
    const m = await mark();
    await clickButton("Discard all changes", ".sticky-pane .sticky-recovery-actions");
    const left = await waitUntil("verify.location().pathname === '/app/settings/date_time'", 5000);
    await delay(400);
    const state = await snap(m);
    check("j2:pane-discard-all-releases-held-intent-once-zero-writes", left && counters(state).commits === 1 && counters(state).pushState === 1 && mutationsOf(state.attempts).length === 0 && state.dialog === null, { commits: state.commits, counters: counters(state), mutations: mutationsOf(state.attempts) });
    record("row", { row: "j", case: "pane-discard-all-during-held-intent", commits: state.commits, counters: counters(state), attempts: summarize(state.attempts) });
    await runtimeClean("j2");
    await evaluate("verify.restore()");
  }

  // =============================================================================================
  // Row k: epoch change cancels the old intent; fresh device protection still guards
  // =============================================================================================
  current = await newStickyEntry("k:setup");
  await failedEdit("k", "color", swatch("indigo"));
  {
    const start = await mark();
    const scopeA = await evaluate("verify.scope()");
    pre("k:starts-in-account-a", scopeA.kind === "account" && scopeA.accountId === "sticky-host-A", scopeA);
    await sidebarClick("Hotkeys");
    await awaitHeld("k1:intent", current, false);
    const toB = await evaluate("verify.activateB()");
    const cancelled = await waitUntil("verify.dialog() === null", 3000);
    await delay(300);
    const state = await snap(start);
    pre("k1:scope-b", toB.kind === "account" && toB.accountId === "sticky-host-B" && toB.epoch > scopeA.epoch, toB);
    check("k1:old-route-intent-cancelled", cancelled && sameTriple(state.location, current) && counters(state).commits === 0 && counters(state).pushState === 0, { location: triple(state.location), counters: counters(state) });
    check("k1:device-draft-survives", isDeepStrictEqual(state.recovery, [recoveryEntry("color", "failed")]) && isDeepStrictEqual(state.displayed.color, ["indigo"]), { recovery: state.recovery });
    await expectWarn("k1:after-epoch", true);
    await sidebarClick("Hotkeys");
    await awaitHeld("k1:fresh-device-protection-guards", current, false);
    await dialogAction(STAY);
    await waitUntil("verify.dialog() === null", 3000);
    await delay(600);
    const later = await snap(start);
    check("k1:old-intent-never-replayed", sameTriple(later.location, current) && counters(later).commits === 0 && counters(later).pushState === 0, { counters: counters(later) });
    record("row", { row: "k", case: "route-epoch-a-to-b", from: scopeA, to: toB, location: triple(later.location), counters: counters(later), freshGuard: true });
    await runtimeClean("k1");

    await evaluate('verify.signout("k2-old")');
    await awaitHeld("k2:sign-out", current, false);
    const locked = await evaluate("verify.lockScope()");
    const resolved = await waitUntil('verify.signouts["k2-old"] === "false" && verify.dialog() === null', 3000);
    pre("k2:scope-locked", locked.kind === "locked" && locked.epoch > toB.epoch, locked);
    check("k2:old-sign-out-resolves-false", resolved, { signout: await evaluate('verify.signouts["k2-old"]') });
    check("k2:device-draft-survives", isDeepStrictEqual(await evaluate("verify.recovery()"), [recoveryEntry("color", "failed")]), {});
    await evaluate('verify.signout("k2-fresh")');
    await awaitHeld("k2:fresh-sign-out-guarded", current, false);
    await dialogAction(STAY);
    const freshFalse = await waitUntil('verify.signouts["k2-fresh"] === "false"', 3000);
    check("k2:fresh-sign-out-stay-false", freshFalse, {});
    record("row", { row: "k", case: "sign-out-epoch-b-to-locked", to: locked, oldResult: "false", freshResult: "false" });
    await runtimeClean("k2");

    const stackBefore = await stack();
    const popMark = await mark();
    await browserTraverse("k3:back", "back");
    await awaitHeld("k3:pop-intent", current, true);
    const toA = await evaluate("verify.activateA()");
    const popCancelled = await waitUntil("verify.dialog() === null", 3000);
    await delay(400);
    const popState = await snap(popMark);
    const popStack = await stack();
    check("k3:old-pop-intent-reset", popCancelled && sameTriple(popState.location, current) && counters(popState).commits === 0 && counters(popState).pushState === 0 && sameEntries(popStack, stackBefore) && popStack.currentIndex === stackBefore.currentIndex, { location: triple(popState.location), counters: counters(popState), stack: stackView(popStack) });
    await browserTraverse("k3:back-fresh", "back");
    await awaitHeld("k3:fresh-pop-guarded", current, true);
    await dialogAction(STAY);
    await waitUntil("verify.dialog() === null", 3000);
    await delay(300);
    const final = await snap(popMark);
    check("k3:fresh-stay-keeps-entry", sameTriple(final.location, current) && counters(final).commits === 0 && isDeepStrictEqual(final.recovery, [recoveryEntry("color", "failed")]), { location: triple(final.location) });
    record("row", { row: "k", case: "pop-epoch-locked-to-a", to: toA, location: triple(final.location), counters: counters(final), stack: stackView(popStack) });
    await runtimeClean("k3");
  }

  // =============================================================================================
  // Row l: unmount removes the guard and the unload listener
  // =============================================================================================
  {
    await evaluate('verify.signout("l-pending")');
    await awaitHeld("l:sign-out-pending", current, false);
    await expectWarn("l:before-unmount", true);
    const physicalBefore = await evaluate("verify.physical()");
    const m = await mark();
    const children = await evaluate("verify.unmount()");
    const resolved = await waitUntil('verify.signouts["l-pending"] === "false"', 3000);
    await delay(200);
    const state = await evaluate(`({ unload: verify.unloadAfter(${m}), active: verify.unloadActive(), wrapped: verify.navigateWrapped(), attempts: verify.attemptsAfter(${m}), physical: verify.physical(), children: document.getElementById("app").childElementCount })`);
    const warning = await evaluate("verify.warn()");
    check("l:unmount-settles-pending-sign-out-false", children === 0 && state.children === 0 && resolved, { children, signout: await evaluate('verify.signouts["l-pending"]') });
    check("l:unload-listener-removed", state.active === 0 && state.unload.some((entry) => entry.op === "remove") && warning.warned === false && warning.attempts === 0, { unload: state.unload, warning });
    check("l:coordinator-router-wrapper-removed", state.wrapped === false, { wrapped: state.wrapped });
    check("l:unmount-zero-writes-committed-bytes-kept", mutationsOf(state.attempts).length === 0 && isDeepStrictEqual(state.physical, physicalBefore), { mutations: mutationsOf(state.attempts) });
    await evaluate('verify.signout("l-after")');
    const after = await waitUntil('verify.signouts["l-after"] === "true"', 3000);
    check("l:guard-removed-sign-out-preflight-true", after, { signout: await evaluate('verify.signouts["l-after"]') });
    const navMark = await mark();
    await evaluate('void verify.router.navigate("/app/tasks"), true');
    const moved = await waitUntil("verify.location().pathname === '/app/tasks'", 3000);
    const w = counters(await hostWindow(navMark));
    check("l:no-blocker-remains-navigation-commits", moved && w.commits === 1 && w.pushState === 1, w);
    record("row", { row: "l", case: "unmount", signoutPending: "false", unloadListeners: state.active, warning, navigateWrapped: state.wrapped, signoutAfter: "true", navigationAfter: w });
    await runtimeClean("l");
  }

  pre("run:no-unexpected-javascript-dialogs", unexpectedDialogs.length === 0, { unexpectedDialogs });
  check("run:deferred-product-failures-zero", deferredFailures.length === 0, { deferredFailures });
  check("run:runtime-errors-zero", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 5) });
  record("native", { pass: true, mode, checks, deferredFailures, runtimeErrors: 0, consoleWarnings: consoleWarnings.length, consoleWarningSamples: [...new Set(consoleWarnings)].slice(0, 5) });
} catch (error) {
  record("native", { pass: false, mode, checks, deferredFailures, error: String(error?.stack ?? error).slice(0, 1500), checkId: error?.checkId ?? null, checkKind: error?.checkKind ?? null, runtimeErrors: runtimeErrors.slice(0, 8).map((entry) => ({ ...entry, text: entry.text.slice(0, 400) })), runtimeErrorCount: runtimeErrors.length, consoleWarnings: consoleWarnings.length, consoleWarningSamples: [...new Set(consoleWarnings)].slice(0, 5) });
  process.exitCode = 1;
} finally {
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`);
  await closeSession().catch(() => {});
  server?.closeAllConnections?.();
  server?.close();
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  const last = records.at(-1);
  console.log(`${last?.pass ? "PASS" : "FAIL"} ${relative(root, evidencePath)} checks=${checks}${last?.pass ? "" : ` error=${String(last?.error).split("\n")[0]}`}`);
}
