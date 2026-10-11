/**
 * CP-STICKY-01 batch 8: Sticky native controls and on-disk draft export in real headless Chrome.
 * Verification only (parent-role native verifier). It repairs nothing and accepts nothing.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-sticky-recovery-native/verify-native.mjs <fixed revision> <controls|export> <suffix>
 *
 * - The product is an immutable `git archive <fixed revision>`; ./native.tsx is bundled with esbuild from
 *   stdin with resolveDir = that archive, and every `@repo/*` import is pinned to the archive's packages.
 *   Only third-party modules come from XAI_DEPS_ROOT, and only when its pnpm-lock.yaml SHA-256 equals the
 *   archive's (consistency gate). Bundle inputs are checked for provenance.
 * - The page is served from 127.0.0.1 only; Chrome runs headless with an isolated profile and download
 *   directory; input is CDP Input.dispatchMouseEvent / dispatchKeyEvent after a center hit-test.
 * - Logs are JSON lines `native-<sha7>-<suffix>-<mode>.log`; existing logs and artifacts are never
 *   overwritten; runtime exceptions and console errors must be zero; any failure exits nonzero.
 */
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
if (!requested) throw Error("Fixed revision required");
if (!["controls", "export"].includes(mode)) throw Error(`Unsupported mode ${mode}`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const resolved = execFileSync("git", ["rev-parse", "--verify", `${requested}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const short = resolved.slice(0, 7);
const evidencePath = join(output, `native-${short}-${suffix}-${mode}.log`);
if (existsSync(evidencePath)) throw Error("Evidence exists; use a distinct suffix");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const records = [];
const runtimeErrors = [];
const consoleWarnings = [];
const unexpectedDialogs = [];
const artifacts = [];
const record = (name, value = {}) => {
  records.push({ name, ...value });
  if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 400));
};
let checks = 0;
const check = (id, condition, details = {}, kind = "product") => {
  const pass = Boolean(condition);
  checks += 1;
  record("check", { id, kind, pass, ...details });
  if (!pass) throw Object.assign(new Error(`${kind === "precondition" ? "PRECONDITION: " : ""}${id}`), { checkId: id, checkKind: kind });
};
const pre = (id, condition, details = {}) => check(id, condition, details, "precondition");

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const fixtureSource = readFileSync(join(output, "native.tsx"), "utf8");
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

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-sticky-native-")));
const snapshot = join(directory, "source");
const profile = join(directory, "profile");
const downloads = join(directory, "downloads");
let server = null;
let session = null;
let origin = "";

// ---------------------------------------------------------------------------------------------------
// Browser session management (one isolated profile for the whole run; restarts reuse it)
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
  const state = { proc, exited, port, socket, pending };
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails ?? {};
      runtimeErrors.push({ kind: "exception", text: String(details.exception?.description ?? details.text ?? "").slice(0, 600) });
    } else if (message.method === "Runtime.consoleAPICalled") {
      const text = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ").slice(0, 600);
      if (message.params.type === "error" || message.params.type === "assert") runtimeErrors.push({ kind: `console.${message.params.type}`, text });
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
  if (mode === "export") await cdp("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
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
  return { graceful, exit: await Promise.race([current.exited, delay(100).then(() => null)]) };
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
const EXPORT_FAILED = "Export failed. Please retry.";
const DIALOG_LABEL = "Unsaved Sticky Note draft";
const ABSENT = Object.freeze({ color: null, font: null, pin_default: null, restore_size: null, grid_spacing: null });
const displayFor = (raw) => ({
  color: [raw.color ?? "sun"],
  font: raw.font ?? "large",
  pin_default: raw.pin_default ?? "true",
  restore_size: raw.restore_size ?? "false",
  grid_spacing: [raw.grid_spacing ?? "normal"],
});
const summarize = (list) => ({
  total: list.length,
  reads: list.filter((entry) => entry.op === "get").length,
  writes: list.filter((entry) => entry.op === "set").length,
  removes: list.filter((entry) => entry.op === "remove").length,
  other: list.filter((entry) => !["get", "set", "remove"].includes(entry.op)).length,
});
const recoveryEntry = (field, status) => ({
  text: `${LABELS[field]} ${status === "pending" ? "is saving." : "was not saved."}`,
  buttons: [`Retry ${LABELS[field]}`, `Discard ${LABELS[field]}`],
});
const sameLocation = (left, right) => left.pathname === right.pathname && left.key === right.key;
const SWITCH = (field) => `.sticky-pane [role="switch"][aria-label="${LABELS[field]}"]`;

async function domStorage() {
  const { entries } = await cdp("DOMStorage.getDOMStorageItems", { storageId: { storageKey: `${origin}/`, isLocalStorage: true } });
  const map = Object.fromEntries(entries);
  return Object.fromEntries(FIELDS.map((field) => [field, Object.hasOwn(map, keyOf(field)) ? map[keyOf(field)] : null]));
}
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
const FONT_KEYS = { small: ["s", "KeyS", 83], normal: ["n", "KeyN", 78], large: ["l", "KeyL", 76], xl: ["e", "KeyE", 69] };

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
      const probe = await call("Runtime.evaluate", { expression: "document.readyState === 'complete' && location.pathname === '/external' && !window.verify", returnByValue: true });
      loaded = probe.result?.value === true;
      if (!loaded) await delay(30);
    }
    pre("second-document:independent-same-origin-document-loaded", loaded, { targetId });
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
    stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: "native.tsx" },
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
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== "native.tsx");
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
  ];
  const productHashes = Object.fromEntries(productFiles.map((file) => [file, sha256(readFileSync(join(snapshot, file)))]));
  const productInBundle = productFiles.filter((file) => !file.endsWith(".css")).every((file) => inputs.includes(file));

  const page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sticky native fixture</title><link rel="stylesheet" href="/__native/bundle.css"></head><body><div id="app"></div><script type="module" src="/__native/bundle.js"></script></body></html>';
  server = createServer((request, response) => {
    response.setHeader("Cache-Control", "no-store");
    if (request.url === "/__native/bundle.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(js); return; }
    if (request.url === "/__native/bundle.css") { response.setHeader("Content-Type", "text/css; charset=utf-8"); response.end(css); return; }
    if (request.url === "/favicon.ico") { response.statusCode = 204; response.end(); return; }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    if (request.url === "/external") { response.end("<!doctype html><title>Independent same-origin document</title><p>second document</p>"); return; }
    response.end(page);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;

  const firstPath = mode === "export" ? "/app/settings/hotkeys" : "/app/settings/sticky";
  const firstReady = mode === "export"
    ? "!!window.verify && document.querySelector('.settings-detail')?.getAttribute('data-pane') === 'hotkeys'"
    : "!!window.verify && !!document.querySelector('.sticky-pane')";
  await openSession(firstPath, firstReady);
  const version = await cdp("Browser.getVersion");
  const viewport = await evaluate("({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio })");
  record("baseline", {
    requested, resolved, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix,
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, viewport,
    node: process.version, esbuild: esbuild.version,
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock) },
    fixtureSha256, runnerSha256, bundleSha256: sha256(js), bundleCssSha256: sha256(css),
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    productHashes, origin: "127.0.0.1 (ephemeral port)",
  });
  pre("baseline:docs-head-product-tree-equals-fixed", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === sha256(archiveLock));
  pre("baseline:bundle-inputs-pinned-to-archive", foreign.length === 0 && productInBundle, { foreign, productInBundle });
  pre("baseline:no-mount-runtime-errors", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 3) });
  const lockNames = await evaluate("Object.fromEntries(verify.fields.map((field) => [field, verify.lockName(field)]))");
  pre("baseline:real-lock-names", FIELDS.every((field) => lockNames[field] === `xai:pref:v1:${keyOf(field)}`), { lockNames });

  async function stateSnapshot(mark) {
    return evaluate(`({ physical: verify.physical(), displayed: verify.displayed(), recovery: verify.recovery(), saved: verify.saved(),
      paneActions: verify.paneActions(), dialog: verify.dialog(), location: verify.location(), scope: verify.scope(),
      attempts: verify.attemptsAfter(${mark}), locks: verify.locksAfter(${mark}), events: verify.eventsAfter(${mark}) })`);
  }
  async function mountCheck(id, expectedRaw) {
    await delay(450);
    const state = await stateSnapshot(0);
    const dom = await domStorage();
    const stickyAttempts = state.attempts.filter((entry) => isSticky(entry.key));
    const stickyMutations = stickyAttempts.filter((entry) => entry.op === "set" || entry.op === "remove" || entry.op === "clear");
    const globalMutations = state.attempts.filter((entry) => entry.op === "set" || entry.op === "remove" || entry.op === "clear");
    check(`${id}:physical-bytes`, isDeepStrictEqual(state.physical, expectedRaw), { observed: state.physical, expected: expectedRaw });
    check(`${id}:devtools-bytes`, isDeepStrictEqual(dom, expectedRaw), { observed: dom });
    check(`${id}:displays-stored-values`, isDeepStrictEqual(state.displayed, displayFor(expectedRaw)), { observed: state.displayed, expected: displayFor(expectedRaw) });
    check(`${id}:zero-mount-write-remove-attempts`, stickyMutations.length === 0, {
      sticky: summarize(stickyAttempts), global: summarize(state.attempts), globalMutatedKeys: [...new Set(globalMutations.map((entry) => entry.key))],
    });
    check(`${id}:clean-mount`, state.recovery.length === 0 && state.saved === null && state.paneActions === null, { recovery: state.recovery, saved: state.saved });
  }

  if (mode === "controls") {
    // ---------------------------------------------------------------------------------------------
    // Trusted input for all 25 domain values; exact bytes after each, then a graceful browser
    // restart on the same profile proves the bytes left the renderer (disk) and a fresh document
    // mount displays them with zero write/remove attempts.
    // ---------------------------------------------------------------------------------------------
    await mountCheck("controls:initial-absent-mount", { ...ABSENT });
    const colors = ["sun", "peach", "coral", "sky", "indigo", "lilac", "mint", "white", "silver", "graphite", "navy", "midnight", "random"];
    const steps = [
      ...colors.map((id) => ({ field: "color", raw: id, input: "mouse", selector: `.sticky-pane [data-color-id="${id}"]`, target: `color:${id}` })),
      ...["small", "normal", "large", "xl"].map((id) => ({ field: "font", raw: id, input: "keyboard", keys: FONT_KEYS[id] })),
      { field: "pin_default", raw: "false", input: "mouse", selector: SWITCH("pin_default"), target: "switch:Pin by Default" },
      { field: "pin_default", raw: "true", input: "mouse", selector: SWITCH("pin_default"), target: "switch:Pin by Default" },
      { field: "restore_size", raw: "true", input: "mouse", selector: SWITCH("restore_size"), target: "switch:Restore Default Size" },
      { field: "restore_size", raw: "false", input: "mouse", selector: SWITCH("restore_size"), target: "switch:Restore Default Size" },
      ...["none", "normal", "large", "xl"].map((id) => ({ field: "grid_spacing", raw: id, input: "mouse", selector: `.sticky-pane [data-spacing-id="${id}"]`, target: `spacing:${id}` })),
    ];
    pre("controls:twenty-five-domain-values", steps.length === 25 && new Set(steps.map((step) => `${step.field}=${step.raw}`)).size === 25);
    let expected = { ...ABSENT };
    for (const [index, step] of steps.entries()) {
      const id = `controls:value-${String(index + 1).padStart(2, "0")}:${step.field}=${step.raw}`;
      const mark = await evaluate("verify.mark()");
      const point = step.input === "mouse" ? await trustedClick(step.selector, `${step.field}=${step.raw}`) : (await typeahead(LABELS.font, ...step.keys), null);
      const persisted = await waitUntil(`verify.physical()[${JSON.stringify(step.field)}] === ${JSON.stringify(step.raw)}`, 6000);
      await delay(150);
      const after = await stateSnapshot(mark);
      const dom = await domStorage();
      const next = { ...expected, [step.field]: step.raw };
      const stickySets = after.attempts.filter((entry) => entry.op === "set" && isSticky(entry.key));
      const stickyRemoves = after.attempts.filter((entry) => (entry.op === "remove" || entry.op === "clear") && isSticky(entry.key));
      const accountMutations = after.attempts.filter((entry) => ["set", "remove"].includes(entry.op) && /^xai:(account|demo):/.test(entry.key ?? ""));
      const appLocks = after.locks.filter((entry) => entry.by === "app").map((entry) => entry.name);
      const trusted = step.input === "mouse"
        ? after.events.some((event) => event.type === "click" && event.trusted && event.target === step.target)
        : after.events.some((event) => event.type === "keydown" && event.trusted && event.target === "select:Font Size" && event.key === step.keys[0])
          && after.events.some((event) => event.type === "change" && event.trusted && event.target === "select:Font Size" && event.value === step.raw);
      check(`${id}:trusted-input`, trusted, { events: after.events.map((event) => `${event.type}:${event.target}:${event.trusted}${event.value ? `:${event.value}` : ""}`) });
      check(`${id}:persisted`, persisted, { physical: after.physical });
      check(`${id}:exact-physical-bytes-unscoped-key`, isDeepStrictEqual(after.physical, next), { observed: after.physical, expected: next });
      check(`${id}:devtools-bytes`, isDeepStrictEqual(dom, next), { observed: dom });
      check(`${id}:one-exact-write-attempt`, stickySets.length === 1 && stickySets[0].key === keyOf(step.field) && stickySets[0].value === step.raw && stickySets[0].outcome === "ok" && stickyRemoves.length === 0, { stickySets, stickyRemoves });
      check(`${id}:real-device-lock-no-account-machinery`, appLocks.includes(lockNames[step.field]) && !appLocks.some((name) => name.includes(":lifecycle")) && accountMutations.length === 0, { appLocks, accountMutations });
      check(`${id}:displayed`, isDeepStrictEqual(after.displayed, displayFor(next)), { observed: after.displayed });
      check(`${id}:saved-truth`, after.recovery.length === 0 && after.saved === SAVED, { recovery: after.recovery, saved: after.saved });
      expected = next;
      const restart = await closeSession();
      pre(`${id}:graceful-browser-close`, restart.graceful, restart);
      await openSession("/app/settings/sticky", "!!window.verify && !!document.querySelector('.sticky-pane')");
      await mountCheck(`${id}:after-browser-restart`, expected);
      record("value", { index: index + 1, field: step.field, raw: step.raw, input: step.input, point, write: stickySets[0], devtools: dom, restartedPhysical: expected });
    }
    record("controls-25-summary", { values: 25, final: expected });

    // New-document reload in the same browser.
    {
      const previous = await evaluate("verify.instance");
      await cdp("Page.reload", { ignoreCache: true });
      pre("controls:new-document-reload:new-instance", await waitUntil(`!!window.verify && verify.instance !== ${JSON.stringify(previous)} && !!document.querySelector('.sticky-pane')`, 15000));
      await mountCheck("controls:new-document-reload", expected);
      check("controls:new-document-reload:random-sentinel-literal", (await evaluate("verify.displayed().color"))[0] === "random" && expected.color === "random");
    }

    // Native held lock: the real per-key engine lock is held by another lock holder.
    {
      const id = "controls:native-held-lock";
      const name = await evaluate("verify.hold('font')");
      const heldBefore = await evaluate("verify.lockQuery()");
      pre(`${id}:fixture-holds-real-font-lock`, name === lockNames.font && heldBefore.held.includes(name), { name, heldBefore });
      const mark = await evaluate("verify.mark()");
      await typeahead(LABELS.font, ...FONT_KEYS.small);
      const pendingShown = await waitUntil(`verify.recovery().some((entry) => entry.text === "Font Size is saving.")`, 4000);
      await delay(900);
      const during = await stateSnapshot(mark);
      const locksDuring = await evaluate("verify.lockQuery()");
      const domDuring = await domStorage();
      const fontSetsDuring = during.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf("font"));
      check(`${id}:pending-shown`, pendingShown && isDeepStrictEqual(during.recovery, [recoveryEntry("font", "pending")]), { recovery: during.recovery });
      check(`${id}:edit-displayed-while-held`, during.displayed.font === "small", { displayed: during.displayed });
      check(`${id}:physical-bytes-unchanged-while-held`, during.physical.font === "xl" && domDuring.font === "xl" && fontSetsDuring.length === 0, { physical: during.physical.font, devtools: domDuring.font, fontSetsDuring });
      check(`${id}:engine-waits-on-real-lock`, locksDuring.held.includes(name) && locksDuring.pending.includes(name), { locksDuring });
      await evaluate("verify.release('font')");
      const persisted = await waitUntil(`verify.physical().font === "small" && verify.recovery().length === 0`, 6000);
      await delay(150);
      const after = await stateSnapshot(mark);
      const fontSets = after.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf("font"));
      check(`${id}:persists-after-release`, persisted && fontSets.length === 1 && fontSets[0].value === "small" && fontSets[0].outcome === "ok" && (await domStorage()).font === "small", { physical: after.physical, fontSets });
      check(`${id}:saved-after-release`, after.saved === SAVED && after.recovery.length === 0, { saved: after.saved });
    }

    // Native readback uncertainty: the write lands, its readback is denied once; Retry reconciles.
    {
      const id = "controls:native-readback-uncertainty";
      pre(`${id}:baseline`, (await evaluate("verify.physical().pin_default")) === "true");
      await evaluate("verify.uncertain('pin_default')");
      pre(`${id}:fault-armed`, (await evaluate("verify.faults()")).readbackOnNextSet.includes(keyOf("pin_default")));
      const mark = await evaluate("verify.mark()");
      await trustedClick(SWITCH("pin_default"), "Pin by Default");
      const failed = await waitUntil(`verify.recovery().some((entry) => entry.text === "Pin by Default was not saved.")`, 5000);
      const first = await stateSnapshot(mark);
      const pinSets = first.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf("pin_default"));
      const readbackDenied = first.attempts.filter((entry) => entry.op === "get" && entry.key === keyOf("pin_default") && entry.outcome === "readback-denied");
      pre(`${id}:readback-fault-fired`, pinSets.length === 1 && pinSets[0].outcome === "ok" && readbackDenied.length === 1 && readbackDenied[0].seq > pinSets[0].seq, { pinSets, readbackDenied });
      check(`${id}:uncertain-recovery-shown`, failed && isDeepStrictEqual(first.recovery, [recoveryEntry("pin_default", "failed")]) && first.displayed.pin_default === "false" && first.physical.pin_default === "false", { recovery: first.recovery, displayed: first.displayed.pin_default, physical: first.physical.pin_default });
      check(`${id}:no-false-saved`, first.saved === null, { saved: first.saved });
      await clickButton("Retry Pin by Default", ".sticky-pane");
      const reconciled = await waitUntil(`verify.recovery().length === 0 && verify.saved() === ${JSON.stringify(SAVED)}`, 5000);
      await delay(150);
      const after = await stateSnapshot(mark);
      const setsTotal = after.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf("pin_default"));
      const removesTotal = after.attempts.filter((entry) => entry.op === "remove" && entry.key === keyOf("pin_default"));
      check(`${id}:retry-reconciles-with-exactly-one-total-write`, reconciled && setsTotal.length === 1 && removesTotal.length === 0 && after.physical.pin_default === "false" && (await domStorage()).pin_default === "false", { setsTotal, removesTotal, physical: after.physical.pin_default, saved: after.saved });
    }

    // Second-document conflict: an independent same-origin document replaces the uncertain bytes.
    {
      const id = "controls:second-document-conflict";
      pre(`${id}:baseline`, (await evaluate("verify.physical().color")) === "random");
      await evaluate("verify.uncertain('color')");
      const mark = await evaluate("verify.mark()");
      await trustedClick('.sticky-pane [data-color-id="mint"]', "color=mint");
      const failed = await waitUntil(`verify.recovery().some((entry) => entry.text === "Default Color was not saved.")`, 5000);
      const first = await stateSnapshot(mark);
      const firstSets = first.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf("color"));
      pre(`${id}:uncertain-setup`, failed && firstSets.length === 1 && firstSets[0].value === "mint" && first.physical.color === "mint" && first.attempts.some((entry) => entry.key === keyOf("color") && entry.outcome === "readback-denied"), { firstSets, physical: first.physical.color });
      const external = await secondDocument(`localStorage.setItem("xai_pref_sticky_color", "coral"); localStorage.getItem("xai_pref_sticky_color")`);
      pre(`${id}:second-document-replaced-bytes`, external.value === "coral", external);
      record("second-document-write", { key: keyOf("color"), value: "coral", targetId: external.targetId });
      await delay(300);
      await clickButton("Retry Default Color", ".sticky-pane");
      await delay(800);
      const afterRetry = await stateSnapshot(mark);
      const setsAfterRetry = afterRetry.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf("color"));
      const removesAfterRetry = afterRetry.attempts.filter((entry) => entry.op === "remove" && entry.key === keyOf("color"));
      const domAfterRetry = await domStorage();
      const warning = await evaluate("verify.warn()");
      check(`${id}:external-replacement-preserved`, afterRetry.physical.color === "coral" && domAfterRetry.color === "coral" && setsAfterRetry.length === 1 && removesAfterRetry.length === 0, { physical: afterRetry.physical.color, devtools: domAfterRetry.color, setsAfterRetry });
      check(`${id}:recovery-remains-visible`, isDeepStrictEqual(afterRetry.recovery, [recoveryEntry("color", "failed")]) && isDeepStrictEqual(afterRetry.displayed.color, ["mint"]) && afterRetry.saved === null && warning.warned === true, { recovery: afterRetry.recovery, displayed: afterRetry.displayed.color, saved: afterRetry.saved, warning });
      await clickButton("Retry Default Color", ".sticky-pane");
      await delay(800);
      const afterSecondRetry = await stateSnapshot(mark);
      const setsAfterSecondRetry = afterSecondRetry.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf("color"));
      check(`${id}:repeated-retry-never-overwrites`, afterSecondRetry.physical.color === "coral" && setsAfterSecondRetry.length === 1 && isDeepStrictEqual(afterSecondRetry.recovery, [recoveryEntry("color", "failed")]), { physical: afterSecondRetry.physical.color, sets: setsAfterSecondRetry.length });
      const discardMark = await evaluate("verify.mark()");
      await clickButton("Discard Default Color", ".sticky-pane");
      const discarded = await waitUntil("verify.recovery().length === 0", 4000);
      await delay(150);
      const afterDiscard = await stateSnapshot(discardMark);
      const discardMutations = afterDiscard.attempts.filter((entry) => ["set", "remove", "clear"].includes(entry.op));
      check(`${id}:discard-zero-writes-shows-external-value`, discarded && discardMutations.length === 0 && isDeepStrictEqual(afterDiscard.displayed.color, ["coral"]) && afterDiscard.physical.color === "coral" && (await evaluate("verify.warn()")).warned === false, { discardMutations, displayed: afterDiscard.displayed.color, physical: afterDiscard.physical.color });
    }
  } else {
    // ---------------------------------------------------------------------------------------------
    // Export: actual Chrome downloads parsed from disk; every export under total storage denial.
    // ---------------------------------------------------------------------------------------------
    const envelope = (device) => ({ version: 1, kind: "sticky-draft", values: { device } });
    const sidebarStart = await evaluate("verify.mark()");
    await sidebarClick("Sticky Note");
    pre("export:start:sticky-mounted-by-sidebar", await waitUntil("!!document.querySelector('.sticky-pane') && verify.location().pathname === '/app/settings/sticky'", 6000));
    await delay(450);
    {
      const state = await stateSnapshot(sidebarStart);
      const stickyMutations = state.attempts.filter((entry) => isSticky(entry.key) && ["set", "remove", "clear"].includes(entry.op));
      const warning = await evaluate("verify.warn()");
      check("export:start:absent-zero-write-mount", isDeepStrictEqual(state.physical, { ...ABSENT }) && stickyMutations.length === 0 && isDeepStrictEqual(state.displayed, displayFor(ABSENT)), { physical: state.physical, stickyMutations, displayed: state.displayed });
      check("export:start:clean-positive-control-no-warning", warning.warned === false && state.recovery.length === 0 && state.paneActions === null, { warning, recovery: state.recovery });
      check("export:start:sticky-entry-has-own-history-key", state.location.key !== "default", { location: state.location });
      record("export-start", { location: state.location, scope: state.scope });
    }
    const stickyLocation = await evaluate("verify.location()");

    async function guardStillBlocks(id, dialogAlreadyOpen) {
      const mark = await evaluate("verify.mark()");
      if (dialogAlreadyOpen) {
        await clickButton("Stay", ".settings-departure-dialog");
        const closed = await waitUntil("verify.dialog() === null", 3000);
        check(`${id}:stay-keeps-location`, closed && sameLocation(await evaluate("verify.location()"), stickyLocation), { location: await evaluate("verify.location()") });
      }
      await sidebarClick("Hotkeys");
      const opened = await waitUntil("verify.dialog() !== null", 3000);
      const during = await evaluate("({ dialog: verify.dialog(), location: verify.location() })");
      check(`${id}:guard-still-blocks`, opened && during.dialog?.label === DIALOG_LABEL && sameLocation(during.location, stickyLocation), during);
      await clickButton("Stay", ".settings-departure-dialog");
      const closed = await waitUntil("verify.dialog() === null", 3000);
      const final = await evaluate(`({ location: verify.location(), attempts: verify.attemptsAfter(${mark}) })`);
      check(`${id}:stay-returns-to-sticky`, closed && sameLocation(final.location, stickyLocation), { location: final.location, guardWindowAttempts: summarize(final.attempts) });
    }

    async function exportUnderDenial(shape, expectedDevice, options) {
      const { via = "pane", baseFaults, expectedRecovery, failure = null, extra = null } = options;
      const id = `export:${shape}`;
      await evaluate("verify.restore(); verify.denyAll()");
      const probe = await evaluate("verify.probe()");
      pre(`${id}:total-denial-armed-injector-fires`, probe.threw === true && probe.logged === 1 && probe.last?.outcome === "denied" && (await evaluate("verify.faults()")).all === true, { probe });
      pre(`${id}:download-directory-empty`, visibleDownloads().length === 0, { names: readdirSync(downloads) });
      if (failure === "click") await evaluate("verify.failNextClick()");
      if (failure === "create") await evaluate("verify.failNextCreate()");
      const before = await evaluate("({ mark: verify.mark(), url: verify.urlTrace(), click: verify.clickTrace(), anchors: verify.anchorTrace(), location: verify.location(), dialog: verify.dialog() })");
      const point = via === "pane"
        ? await clickButton("Export Sticky Note draft", ".sticky-pane .sticky-recovery-actions")
        : await clickButton("Export current draft", ".settings-departure-dialog");
      let download = null;
      if (failure) {
        const shown = await waitUntil(`verify.paneActions()?.alert === ${JSON.stringify(EXPORT_FAILED)}`, 4000);
        check(`${id}:localized-export-error-visible`, shown, { paneActions: await evaluate("verify.paneActions()") });
        await delay(1500);
        check(`${id}:no-download-written`, visibleDownloads().length === 0, { names: readdirSync(downloads) });
      } else {
        download = await awaitDownload();
        check(`${id}:actual-chrome-download-on-disk`, download !== null, { names: readdirSync(downloads) });
      }
      await delay(120);
      const after = await evaluate(`({ attempts: verify.attemptsAfter(${before.mark}), url: verify.urlTrace(), click: verify.clickTrace(), anchors: verify.anchorTrace(),
        anchorsInDom: verify.anchorsInDom(), location: verify.location(), dialog: verify.dialog(), recovery: verify.recovery(),
        paneActions: verify.paneActions(), physical: verify.physical(), pendingFailures: verify.pendingFailures() })`);
      check(`${id}:attempt-level-zero-reads-writes-removes`, after.attempts.length === 0, { counts: summarize(after.attempts), first: after.attempts.slice(0, 8) });
      const createAttempts = after.url.createAttempts - before.url.createAttempts;
      const created = after.url.created.slice(before.url.created.length);
      const revoked = after.url.revoked.slice(before.url.revoked.length);
      const clicks = after.click.hrefs.slice(before.click.hrefs.length);
      const added = after.anchors.added.slice(before.anchors.added.length);
      const removed = after.anchors.removed.slice(before.anchors.removed.length);
      pre(`${id}:failure-hook-consumed`, !after.pendingFailures.click && !after.pendingFailures.create, after.pendingFailures);
      if (failure === "create") {
        check(`${id}:create-failure-no-url-no-anchor-no-click`, createAttempts === 1 && created.length === 0 && revoked.length === 0 && clicks.length === 0 && added.length === 0 && after.anchorsInDom === 0, { createAttempts, created, revoked, clicks, added });
      } else {
        check(`${id}:exactly-one-object-url-created-and-same-revoked`, createAttempts === 1 && created.length === 1 && revoked.length === 1 && revoked[0] === created[0], { createAttempts, created, revoked });
        check(`${id}:anchor-appended-clicked-once-removed`, clicks.length === 1 && clicks[0] === created[0] && added.length === 1 && added[0] === created[0] && removed.length === 1 && removed[0] === created[0] && after.anchorsInDom === 0, { clicks, added, removed, anchorsInDom: after.anchorsInDom });
        if (failure === "click") check(`${id}:click-failure-fired`, after.click.throws - before.click.throws === 1, { throws: after.click.throws });
      }
      if (download) {
        const payload = JSON.parse(download.raw.toString("utf8"));
        check(`${id}:disk-json-deep-equals-full-envelope`, isDeepStrictEqual(payload, envelope(expectedDevice)), { payload, expected: envelope(expectedDevice) });
        check(`${id}:single-download-file`, download.names.length === 1 && download.names[0] === "sticky-draft.json", { names: download.names });
        const artifact = `native-${short}-${suffix}-export-${shape}-sticky-draft.json`;
        pre(`${id}:artifact-not-overwritten`, !existsSync(join(output, artifact)), { artifact });
        copyFileSync(download.file, join(output, artifact));
        rmSync(download.file);
        const entry = { shape, artifact, sha256: sha256(download.raw), bytes: download.raw.length };
        artifacts.push(entry);
        record("disk-export", { ...entry, payload });
        check(`${id}:export-error-cleared`, after.paneActions?.alert === null, { paneActions: after.paneActions });
      }
      check(`${id}:location-unchanged`, sameLocation(after.location, before.location) && sameLocation(after.location, stickyLocation), { before: before.location, after: after.location });
      if (via === "dialog") check(`${id}:dialog-stays-open`, after.dialog !== null && isDeepStrictEqual(after.dialog, before.dialog), { dialog: after.dialog });
      else check(`${id}:no-dialog-side-effect`, after.dialog === null, { dialog: after.dialog });
      check(`${id}:drafts-kept`, isDeepStrictEqual(after.recovery, expectedRecovery), { recovery: after.recovery });
      if (extra) await extra(id);
      const warning = await evaluate("verify.warn()");
      check(`${id}:beforeunload-still-warns`, warning.warned === true && warning.attempts === 0, warning);
      await guardStillBlocks(id, via === "dialog");
      await evaluate(`verify.restore(); ${baseFaults}`);
      record("export-step", { shape, via, point, failure, location: after.location });
    }
    const waitRecovery = async (id, expectedRecovery) => {
      const ok = await waitUntil(`JSON.stringify(verify.recovery()) === ${JSON.stringify(JSON.stringify(expectedRecovery))}`, 5000);
      check(`${id}`, ok, { recovery: await evaluate("verify.recovery()") });
    };

    // X1 sparse, one field.
    const denyStickyWrites = "verify.denySet('sticky')";
    await evaluate(denyStickyWrites);
    {
      const mark = await evaluate("verify.mark()");
      await trustedClick('.sticky-pane [data-color-id="mint"]', "color=mint");
      await waitRecovery("export:x1:color-draft-failed", [recoveryEntry("color", "failed")]);
      const state = await stateSnapshot(mark);
      pre("export:x1:write-fault-fired", state.attempts.some((entry) => entry.op === "set" && entry.key === keyOf("color") && entry.value === "mint" && entry.outcome === "denied") && state.physical.color === null, { physical: state.physical });
    }
    await exportUnderDenial("x1-sparse-one-field", { color: "mint" }, { baseFaults: denyStickyWrites, expectedRecovery: [recoveryEntry("color", "failed")] });

    // X2 all five: three strings and two booleans.
    {
      const mark = await evaluate("verify.mark()");
      await typeahead(LABELS.font, ...FONT_KEYS.xl);
      await waitRecovery("export:x2:font-draft-failed", [recoveryEntry("color", "failed"), recoveryEntry("font", "failed")]);
      await trustedClick(SWITCH("pin_default"), "Pin by Default");
      await trustedClick(SWITCH("restore_size"), "Restore Default Size");
      await trustedClick('.sticky-pane [data-spacing-id="xl"]', "grid_spacing=xl");
      await waitRecovery("export:x2:all-five-drafts-failed", FIELDS.map((field) => recoveryEntry(field, "failed")));
      const state = await stateSnapshot(mark);
      const deniedSets = state.attempts.filter((entry) => entry.op === "set" && isSticky(entry.key) && entry.outcome === "denied").map((entry) => `${entry.key}=${entry.value}`);
      pre("export:x2:write-faults-fired", isDeepStrictEqual(state.physical, { ...ABSENT }) && deniedSets.length === 4, { deniedSets });
      check("export:x2:displayed-latest-choices", isDeepStrictEqual(state.displayed, { color: ["mint"], font: "xl", pin_default: "false", restore_size: "true", grid_spacing: ["xl"] }), { displayed: state.displayed });
    }
    await exportUnderDenial("x2-all-five", { color: "mint", font: "xl", pin_default: false, restore_size: true, grid_spacing: "xl" }, { baseFaults: denyStickyWrites, expectedRecovery: FIELDS.map((field) => recoveryEntry(field, "failed")) });

    // X3 export from the departure dialog (after targeted zero-write discards).
    {
      const mark = await evaluate("verify.mark()");
      await clickButton("Discard Font Size", ".sticky-pane");
      await clickButton("Discard Pin by Default", ".sticky-pane");
      await clickButton("Discard Default Grid Spacing", ".sticky-pane");
      await waitRecovery("export:x3:targeted-discards", [recoveryEntry("color", "failed"), recoveryEntry("restore_size", "failed")]);
      const state = await stateSnapshot(mark);
      const mutations = state.attempts.filter((entry) => ["set", "remove", "clear"].includes(entry.op));
      check("export:x3:discards-zero-write-remove-attempts", mutations.length === 0, { mutations });
      await sidebarClick("Hotkeys");
      const opened = await waitUntil("verify.dialog() !== null", 3000);
      const dialogState = await evaluate("({ dialog: verify.dialog(), location: verify.location() })");
      check("export:x3:trusted-sidebar-departure-held", opened && dialogState.dialog?.label === DIALOG_LABEL && sameLocation(dialogState.location, stickyLocation), dialogState);
    }
    await exportUnderDenial("x3-departure-dialog", { color: "mint", restore_size: true }, { via: "dialog", baseFaults: denyStickyWrites, expectedRecovery: [recoveryEntry("color", "failed"), recoveryEntry("restore_size", "failed")] });

    // X4 fresh locked export after A -> locked.
    {
      const before = await evaluate("verify.scope()");
      pre("export:x4:starts-in-account-A", before.kind === "account" && before.accountId === "sticky-native-A", before);
      const locked = await evaluate("verify.lockScope()");
      await delay(300);
      const state = await stateSnapshot(0);
      pre("export:x4:scope-locked", locked.kind === "locked" && locked.epoch > before.epoch && state.scope.epoch === locked.epoch, { before, locked });
      check("export:x4:device-drafts-survive-a-to-locked", isDeepStrictEqual(state.recovery, [recoveryEntry("color", "failed"), recoveryEntry("restore_size", "failed")]) && isDeepStrictEqual(state.displayed.color, ["mint"]) && state.displayed.restore_size === "true", { recovery: state.recovery, displayed: state.displayed });
      await trustedClick('.sticky-pane [data-spacing-id="large"]', "grid_spacing=large");
      await waitRecovery("export:x4:new-device-draft-in-locked-scope", [recoveryEntry("color", "failed"), recoveryEntry("restore_size", "failed"), recoveryEntry("grid_spacing", "failed")]);
      record("export-transition", { from: before, to: locked });
    }
    await exportUnderDenial("x4-fresh-locked-after-a-to-locked", { color: "mint", restore_size: true, grid_spacing: "large" }, { baseFaults: denyStickyWrites, expectedRecovery: [recoveryEntry("color", "failed"), recoveryEntry("restore_size", "failed"), recoveryEntry("grid_spacing", "failed")] });

    // X5 fresh B export after A -> B (locked -> A return first, then A -> B).
    {
      const lockedScope = await evaluate("verify.scope()");
      const backToA = await evaluate("verify.activateA()");
      await delay(250);
      const atA = await stateSnapshot(0);
      check("export:x5:device-drafts-survive-locked-to-a", backToA.kind === "account" && backToA.accountId === "sticky-native-A" && atA.recovery.length === 3, { backToA, recovery: atA.recovery });
      const toB = await evaluate("verify.activateB()");
      await delay(300);
      const atB = await stateSnapshot(0);
      pre("export:x5:scope-b", toB.kind === "account" && toB.accountId === "sticky-native-B" && toB.epoch > backToA.epoch && atB.scope.epoch === toB.epoch, { toB });
      check("export:x5:device-drafts-survive-a-to-b", isDeepStrictEqual(atB.recovery, [recoveryEntry("color", "failed"), recoveryEntry("restore_size", "failed"), recoveryEntry("grid_spacing", "failed")]), { recovery: atB.recovery });
      await typeahead(LABELS.font, ...FONT_KEYS.small);
      await waitRecovery("export:x5:new-device-draft-in-b", [recoveryEntry("color", "failed"), recoveryEntry("font", "failed"), recoveryEntry("restore_size", "failed"), recoveryEntry("grid_spacing", "failed")]);
      record("export-transition", { from: lockedScope, via: backToA, to: toB });
    }
    const fourDrafts = [recoveryEntry("color", "failed"), recoveryEntry("font", "failed"), recoveryEntry("restore_size", "failed"), recoveryEntry("grid_spacing", "failed")];
    await exportUnderDenial("x5-fresh-b-after-a-to-b", { color: "mint", font: "small", restore_size: true, grid_spacing: "large" }, { baseFaults: denyStickyWrites, expectedRecovery: fourDrafts });

    // X6 export while one operation is held behind the real per-key lock.
    const denyOthers = "verify.denySet(['color', 'font', 'restore_size', 'grid_spacing'])";
    {
      await evaluate(`verify.restore(); ${denyOthers}`);
      const name = await evaluate("verify.hold('pin_default')");
      const heldBefore = await evaluate("verify.lockQuery()");
      pre("export:x6:fixture-holds-real-pin-lock", name === lockNames.pin_default && heldBefore.held.includes(name), { heldBefore });
      await trustedClick(SWITCH("pin_default"), "Pin by Default");
      await waitRecovery("export:x6:held-operation-pending", [recoveryEntry("color", "failed"), recoveryEntry("font", "failed"), recoveryEntry("pin_default", "pending"), recoveryEntry("restore_size", "failed"), recoveryEntry("grid_spacing", "failed")]);
      const locks = await evaluate("verify.lockQuery()");
      pre("export:x6:engine-waits-on-real-lock", locks.held.includes(name) && locks.pending.includes(name), { locks });
    }
    await exportUnderDenial("x6-held-real-lock", { color: "mint", font: "small", pin_default: false, restore_size: true, grid_spacing: "large" }, {
      baseFaults: denyOthers,
      expectedRecovery: [recoveryEntry("color", "failed"), recoveryEntry("font", "failed"), recoveryEntry("pin_default", "pending"), recoveryEntry("restore_size", "failed"), recoveryEntry("grid_spacing", "failed")],
      extra: async (id) => {
        const locks = await evaluate("verify.lockQuery()");
        const pin = await evaluate("verify.physical().pin_default");
        check(`${id}:export-never-releases-the-held-operation`, locks.held.includes(lockNames.pin_default) && locks.pending.includes(lockNames.pin_default) && pin === null, { locks, pin });
      },
    });
    {
      const mark = await evaluate("verify.mark()");
      await evaluate("verify.release('pin_default')");
      const persisted = await waitUntil(`verify.physical().pin_default === "false" && JSON.stringify(verify.recovery()) === ${JSON.stringify(JSON.stringify(fourDrafts))}`, 6000);
      const state = await stateSnapshot(mark);
      const pinSets = state.attempts.filter((entry) => entry.op === "set" && entry.key === keyOf("pin_default"));
      check("export:x6:held-operation-persists-after-release", persisted && pinSets.length === 1 && pinSets[0].value === "false" && pinSets[0].outcome === "ok", { pinSets, recovery: state.recovery });
    }

    // X7 native setup failure: the export anchor's click throws once; then a recovered export.
    await exportUnderDenial("x7-anchor-click-failure", null, { failure: "click", baseFaults: denyOthers, expectedRecovery: fourDrafts });
    await exportUnderDenial("x7-recovered-after-click-failure", { color: "mint", font: "small", restore_size: true, grid_spacing: "large" }, { baseFaults: denyOthers, expectedRecovery: fourDrafts });

    // X8 native setup failure: createObjectURL throws once.
    await exportUnderDenial("x8-create-object-url-failure", null, { failure: "create", baseFaults: denyOthers, expectedRecovery: fourDrafts });
    record("export-summary", { artifacts });
  }

  pre("run:no-unexpected-javascript-dialogs", unexpectedDialogs.length === 0, { unexpectedDialogs });
  check("run:runtime-errors-zero", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 5) });
  record("native", { pass: true, mode, checks, runtimeErrors: 0, consoleWarnings: consoleWarnings.length, consoleWarningSamples: [...new Set(consoleWarnings)].slice(0, 5), artifacts });
} catch (error) {
  record("native", { pass: false, mode, checks, error: String(error?.stack ?? error).slice(0, 1500), checkId: error?.checkId ?? null, checkKind: error?.checkKind ?? null, runtimeErrors: runtimeErrors.slice(0, 5), consoleWarnings: consoleWarnings.length, artifacts });
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
