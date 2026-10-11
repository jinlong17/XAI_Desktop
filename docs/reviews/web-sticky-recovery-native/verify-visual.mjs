/**
 * CP-STICKY-01 batch 15: Sticky contract §9 "Responsive presentation" and "Keyboard" (the visual part of the §13
 * "Production host/native" row) in real headless Chrome, for one language per run. Verification only
 * (parent-role visual and keyboard verifier). It repairs nothing and accepts nothing.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-sticky-recovery-native/verify-visual.mjs <fixed revision> <visual|visual-zh> <suffix>
 *
 * - Products: an immutable `git archive <fixed revision>` and, for the as-is geometry comparison only, an
 *   immutable `git archive 2023526…` (the contract's before product). ./native-visual.tsx is bundled with esbuild
 *   from stdin with resolveDir = each archive; every `@repo/*` import is pinned to that archive's packages. Only
 *   third-party modules come from XAI_DEPS_ROOT, and only when its pnpm-lock.yaml SHA-256 equals both archives'
 *   (consistency gate). Bundle inputs are checked for provenance.
 * - Each archive is served by its own 127.0.0.1 server (separate origins, separate storage); one isolated Chrome
 *   profile. Pointer input is CDP Input.dispatchMouseEvent after a center hit-test; keyboard input is CDP
 *   Input.dispatchKeyEvent (trusted events). Widths 375x812 and 414x896 (mobile emulation), 768x1024, 1024x768 and
 *   1440x900 (desktop), deviceScaleFactor 1.
 * - Static check: the 2023526..fixed stylesheet diff may only add selectors under .sticky-pane / .sticky-recovery-*.
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log`; screenshots `native-<sha7>-<suffix>-<mode>-<width>-<state>.png`
 *   in this directory. Development probes may redirect both with XAI_VISUAL_EVIDENCE_DIR (outside the repository);
 *   committed evidence never does. Refuses to overwrite; zero runtime exceptions / console errors; nonzero exit on any
 *   failure.
 */
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BEFORE = "20235269749dad514833d76c27b958f694d0e4e9";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_VISUAL_EVIDENCE_DIR ?? output;
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
if (!requested) throw Error("Fixed revision required");
if (mode !== "visual" && mode !== "visual-zh") throw Error(`Unsupported mode ${mode}`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const LANG = mode === "visual-zh" ? "zh" : "en";
const git = (args, options = {}) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 100 * 1024 * 1024, ...options });
const resolved = git(["rev-parse", "--verify", `${requested}^{commit}`]).trim();
const beforeResolved = git(["rev-parse", "--verify", `${BEFORE}^{commit}`]).trim();
const short = resolved.slice(0, 7);
const prefix = `native-${short}-${suffix}-${mode}`;
const evidencePath = join(evidenceDir, `${prefix}.log`);
if (existsSync(evidencePath)) throw Error("Evidence exists; use a distinct suffix");
if (readdirSync(evidenceDir).some((name) => name.startsWith(`${prefix}-`) && name.endsWith(".png"))) throw Error("Screenshots exist; use a distinct suffix");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const records = [];
const runtimeErrors = [];
const consoleWarnings = [];
const unexpectedDialogs = [];
const record = (name, value = {}) => {
  records.push({ name, ...value });
  if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 300));
};
let checks = 0;
let lastCheckId = null;
const check = (id, condition, details = {}, kind = "product") => {
  const pass = Boolean(condition);
  checks += 1;
  lastCheckId = id;
  record("check", { ...details, id, kind, pass });
  if (!pass) throw Object.assign(new Error(`${kind === "precondition" ? "PRECONDITION: " : ""}${id}`), { checkId: id, checkKind: kind });
};
const pre = (id, condition, details = {}) => check(id, condition, details, "precondition");
/** Recorded like a product check but does not stop the run; any deferred failure fails the run at the end. */
const deferredFailures = [];
const checkDeferred = (id, condition, details = {}) => {
  const pass = Boolean(condition);
  checks += 1;
  lastCheckId = id;
  record("check", { ...(pass ? {} : details), id, kind: "product", deferred: true, pass });
  if (!pass) deferredFailures.push(id);
  return pass;
};

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const fixtureSource = readFileSync(join(output, "native-visual.tsx"), "utf8");
const fixtureSha256 = sha256(fixtureSource);
const dependencyNodeModules = join(dependencyRoot, "node_modules");
if (!existsSync(dependencyNodeModules)) throw Error("PRECONDITION: dependency tree missing; set XAI_DEPS_ROOT");
const lockOf = (revision) => execFileSync("git", ["show", `${revision}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
const fixedLock = lockOf(resolved);
const beforeLock = lockOf(beforeResolved);
const dependencyLock = readFileSync(join(dependencyRoot, "pnpm-lock.yaml"));
if (sha256(dependencyLock) !== sha256(fixedLock) || sha256(dependencyLock) !== sha256(beforeLock)) throw Error("PRECONDITION: dependency checkout lockfile differs from an archive");
const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find((name) => name.startsWith("esbuild@0.28.1"));
if (!esbuildFolder) throw Error("PRECONDITION: pinned esbuild 0.28.1 missing");
const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
const docsHead = git(["rev-parse", "HEAD"]).trim();
const productDelta = git(["diff", "--name-only", resolved, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]).trim();
const reusedHarnessSha256 = Object.fromEntries(["native-host.tsx", "verify-host.mjs", "native.tsx", "verify-native.mjs"].map((name) => [name, sha256(readFileSync(join(output, name)))]));

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-sticky-visual-")));
const profile = join(directory, "profile");
const servers = [];
let session = null;

// ---------------------------------------------------------------------------------------------------
// Static stylesheet check: 2023526..fixed may only ADD selectors under .sticky-pane / .sticky-recovery-*
// ---------------------------------------------------------------------------------------------------
function cssPreludes(source) {
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const selectors = [];
  const atRules = [];
  const stack = [];
  let prelude = "";
  let nested = 0;
  for (const character of clean) {
    if (character === "{") {
      const text = prelude.trim().replace(/\s+/g, " ");
      if (text.startsWith("@")) atRules.push(text);
      else {
        if (stack.length && !stack.at(-1).startsWith("@")) nested += 1;
        for (const part of text.split(",")) selectors.push({ selector: part.trim(), within: stack.filter((entry) => entry.startsWith("@")) });
      }
      stack.push(text);
      prelude = "";
    } else if (character === "}") {
      stack.pop();
      prelude = "";
    } else if (character === ";") {
      prelude = "";
    } else prelude += character;
  }
  return { selectors, atRules, balanced: stack.length === 0, nested };
}
const SCOPED = /^\.sticky-(pane(?![\w-])|recovery-[\w-]+)/;

// ---------------------------------------------------------------------------------------------------
// Archive preparation and bundling (one bundle per archive, same fixture, same language constant)
// ---------------------------------------------------------------------------------------------------
const PRODUCT_FILES = [
  "packages/plugin-web-settings-rest/src/panes/stickyPane.tsx",
  "packages/plugin-web-settings-rest/src/internal/StickyColorPalette.tsx",
  "packages/plugin-web-settings-rest/src/internal/localI18n.ts",
  "packages/plugin-web-settings-rest/src/styles.css",
  "packages/plugin-web-settings-shell/src/styles.css",
  "packages/plugin-web-settings-shell/src/Toggle.tsx",
  "packages/plugin-web-settings-shell/src/SettingRow.tsx",
  "packages/plugin-web-tokens/src/tokens.css",
  "packages/plugin-web-tokens/src/layout.css",
  "apps/web/src/styles/global.css",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "packages/xai-web-shell/src/Shell.tsx",
];
async function prepare(revision, label) {
  const folder = join(directory, label);
  mkdirSync(folder);
  execFileSync("tar", ["-x", "-C", folder], { input: execFileSync("git", ["archive", revision], { cwd: root, maxBuffer: 300 * 1024 * 1024 }) });
  symlinkSync(dependencyNodeModules, join(folder, "node_modules"));
  symlinkSync(join(dependencyRoot, "apps/web/node_modules"), join(folder, "apps/web/node_modules"));
  const aliases = new Map();
  for (const name of readdirSync(join(folder, "packages"))) {
    const packageFolder = join(folder, "packages", name);
    if (!existsSync(join(packageFolder, "package.json"))) continue;
    const pkg = JSON.parse(readFileSync(join(packageFolder, "package.json"), "utf8"));
    aliases.set(pkg.name, { folder: packageFolder, pkg });
    const packageDependencies = join(dependencyRoot, "packages", name, "node_modules");
    if (existsSync(packageDependencies)) symlinkSync(packageDependencies, join(packageFolder, "node_modules"));
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
    stdin: { contents: fixtureSource, resolveDir: folder, loader: "tsx", sourcefile: "native-visual.tsx" },
    absWorkingDir: folder,
    plugins: [pinnedPackages],
    nodePaths: [join(dependencyRoot, "apps/web/node_modules")],
    loader: { ".png": "dataurl", ".svg": "dataurl", ".woff2": "dataurl", ".woff": "dataurl" },
    bundle: true, format: "esm", platform: "browser", write: false, metafile: true, logLevel: "silent",
    outfile: join(directory, `${label}-bundle.js`),
    define: { "import.meta.env": "{}", __STICKY_VISUAL_LANG__: JSON.stringify(LANG) },
  });
  const js = built.outputFiles.find((file) => file.path.endsWith(".js")).text;
  const css = built.outputFiles.find((file) => file.path.endsWith(".css")).text;
  const inputs = Object.keys(built.metafile.inputs);
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const productHashes = Object.fromEntries(PRODUCT_FILES.map((file) => [file, sha256(readFileSync(join(folder, file)))]));
  const productInBundle = PRODUCT_FILES.filter((file) => !file.endsWith(".css")).every((file) => inputs.includes(file));
  return {
    label, revision, js, css, productHashes, productInBundle,
    inputs: { total: inputs.length, archive: inputs.filter((input) => !input.startsWith("../") && input !== "native-visual.tsx").length, thirdParty: thirdParty.length, foreign },
    bundleSha256: sha256(js), bundleCssSha256: sha256(css),
    cssMarkers: { snSw: css.includes(".sn-sw"), toggle: css.includes(".module-settings .toggle"), departureDialog: css.includes(".settings-departure-dialog"), stickyRecovery: css.includes(".sticky-recovery-field") },
  };
}
function serve(bundle) {
  const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sticky visual fixture (${bundle.label})</title><link rel="stylesheet" href="/__native/bundle.css"></head><body><div id="app"></div><script type="module" src="/__native/bundle.js"></script></body></html>`;
  const server = createServer((request, response) => {
    response.setHeader("Cache-Control", "no-store");
    if (request.url === "/__native/bundle.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(bundle.js); return; }
    if (request.url === "/__native/bundle.css") { response.setHeader("Content-Type", "text/css; charset=utf-8"); response.end(bundle.css); return; }
    if (request.url === "/favicon.ico") { response.statusCode = 204; response.end(); return; }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(page);
  });
  servers.push(server);
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${server.address().port}`)));
}

// ---------------------------------------------------------------------------------------------------
// Browser session (one isolated profile)
// ---------------------------------------------------------------------------------------------------
async function launch() {
  const proc = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
    "--disable-component-update", "--disable-sync", "--disable-default-apps", "--disable-domain-reliability",
    "--disable-client-side-phishing-detection", "--metrics-recording-only", "--use-mock-keychain",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--window-size=1440,900", "about:blank",
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
  const state = { proc, exited, socket, pending };
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
// Expected surface (contract §2, §5 wording; independent of the fixture's vocabulary)
// ---------------------------------------------------------------------------------------------------
const FIELDS = ["color", "font", "pin_default", "restore_size", "grid_spacing"];
const keyOf = (field) => `xai_pref_sticky_${field}`;
const COLOR_IDS = ["sun", "peach", "coral", "sky", "indigo", "lilac", "mint", "white", "silver", "graphite", "navy", "midnight", "random"];
const SPACING_IDS = ["none", "normal", "large", "xl"];
const T = LANG === "zh" ? {
  title: "便签",
  labels: { color: "默认颜色", font: "字体大小", pin_default: "默认置顶", restore_size: "恢复默认尺寸", grid_spacing: "默认网格间距" },
  retry: "重试", discard: "放弃", reload: "重新读取", exportDraft: "导出便签草稿", discardAll: "放弃全部更改",
  notSaved: (label) => `${label}未保存。`,
  unavailable: (label) => `已保存的${label}不可用。请重新读取；这不是新的未保存更改。`,
  dialog: { label: "未保存的便签草稿", text: "便签有未保存的更改。", buttons: ["留下", "导出当前草稿", "放弃本地更改并离开"] },
} : {
  title: "Sticky Note",
  labels: { color: "Default Color", font: "Font Size", pin_default: "Pin by Default", restore_size: "Restore Default Size", grid_spacing: "Default Grid Spacing" },
  retry: "Retry", discard: "Discard", reload: "Reload", exportDraft: "Export Sticky Note draft", discardAll: "Discard all changes",
  notSaved: (label) => `${label} was not saved.`,
  unavailable: (label) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
  dialog: { label: "Unsaved Sticky Note draft", text: "Sticky Note has unsaved changes.", buttons: ["Stay", "Export current draft", "Discard local changes and leave"] },
};
const failedEntry = (field) => ({ text: T.notSaved(T.labels[field]), buttons: [`${T.retry} ${T.labels[field]}`, `${T.discard} ${T.labels[field]}`], visibleButtons: [T.retry, T.discard] });
const sourceEntry = (field) => ({ text: T.unavailable(T.labels[field]), buttons: [`${T.reload} ${T.labels[field]}`], visibleButtons: [T.reload] });
const BASE = [...COLOR_IDS.map((id) => `color:${id}`), "font", "switch:pin_default", "switch:restore_size", ...SPACING_IDS.map((id) => `spacing:${id}`)];
const recoveryPair = (field) => [`retry:${field}`, `discard:${field}`];
const ALL5 = [
  ...COLOR_IDS.map((id) => `color:${id}`), ...recoveryPair("color"),
  "font", ...recoveryPair("font"),
  "switch:pin_default", ...recoveryPair("pin_default"),
  "switch:restore_size", ...recoveryPair("restore_size"),
  ...SPACING_IDS.map((id) => `spacing:${id}`), ...recoveryPair("grid_spacing"),
  "export", "discard-all",
];
const RELOAD = [...COLOR_IDS.map((id) => `color:${id}`), "font", "reload:font", "switch:pin_default", "switch:restore_size", ...SPACING_IDS.map((id) => `spacing:${id}`)];
const DIALOG_ACTIONS = ["dialog:stay", "dialog:export", "dialog:discard-leave"];
const isTarget44 = (desc) => /^(retry|discard|reload):/.test(desc) || desc === "export" || desc === "discard-all" || desc.startsWith("dialog:");
const WIDTHS = [375, 414, 768, 1024, 1440];
const HEIGHTS = { 375: 812, 414: 896, 768: 1024, 1024: 768, 1440: 900 };
const KEYBOARD_WIDTH = LANG === "zh" ? 375 : 1024;
const MOUNTED = "!!window.verify && document.querySelector('.settings-detail')?.getAttribute('data-pane') === 'sticky' && document.querySelectorAll('.sticky-pane [data-color-id]').length === 13";

// ---------------------------------------------------------------------------------------------------
// Input helpers (trusted CDP events)
// ---------------------------------------------------------------------------------------------------
const KEYS = {
  Tab: { key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 },
  Space: { key: " ", code: "Space", windowsVirtualKeyCode: 32, text: " " },
  Enter: { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" },
  Escape: { key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 },
};
async function press(name, shift = false) {
  const spec = KEYS[name];
  const modifiers = shift ? 8 : 0;
  const down = { type: spec.text ? "keyDown" : "rawKeyDown", key: spec.key, code: spec.code, windowsVirtualKeyCode: spec.windowsVirtualKeyCode, modifiers };
  if (spec.text) Object.assign(down, { text: spec.text, unmodifiedText: spec.text });
  await cdp("Input.dispatchKeyEvent", down);
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: spec.key, code: spec.code, windowsVirtualKeyCode: spec.windowsVirtualKeyCode, modifiers });
  await delay(45);
}
const TYPEAHEAD = {
  en: { small: ["s", "KeyS", 83], normal: ["n", "KeyN", 78], large: ["l", "KeyL", 76], xl: ["e", "KeyE", 69] },
  zh: { small: ["小"], normal: ["普"], large: ["大"], xl: ["特"] },
};
let lastTypeahead = { instance: null, at: 0 };
async function typeahead(id) {
  const instance = await evaluate("verify.instance");
  if (lastTypeahead.instance === instance) {
    const wait = 1250 - (Date.now() - lastTypeahead.at);
    if (wait > 0) await delay(wait);
  }
  const [character, code, virtualKey] = TYPEAHEAD[LANG][id];
  const codes = code ? { code, windowsVirtualKeyCode: virtualKey } : {};
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: character, ...codes, text: character, unmodifiedText: character });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: character, ...codes });
  lastTypeahead = { instance, at: Date.now() };
  await delay(60);
}
async function trustedClick(desc) {
  const probe = await evaluate(`verify.probe(${JSON.stringify(desc)})`);
  pre(`input:found:${desc}`, probe.found, { desc });
  pre(`input:hit-test:${desc}`, probe.centerHit, { centerTarget: probe.centerTarget, rect: probe.rect });
  const x = probe.rect.left + probe.rect.width / 2;
  const y = probe.rect.top + probe.rect.height / 2;
  await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  await delay(80);
  return { x: Math.round(x), y: Math.round(y) };
}
const mark = () => evaluate("verify.mark()");
const activeDesc = () => evaluate("verify.activeDesc()");
async function settle() {
  await delay(120);
  const result = await evaluate("verify.settle()");
  await delay(40);
  return result;
}
async function setViewport(width, height = HEIGHTS[width]) {
  await cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 414 });
  const settled = await settle();
  const viewport = await evaluate("({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio })");
  pre(`viewport:${width}x${height}`, viewport.width === width && viewport.height === height && viewport.dpr === 1, { viewport, settled });
  return { viewport, settled };
}
async function go(origin, label) {
  await cdp("Page.navigate", { url: `${origin}/app/settings/sticky` });
  pre(`mount:${label}`, await waitUntil(MOUNTED, 15000));
  await settle();
}
async function reloadPage(label) {
  await cdp("Page.reload", { ignoreCache: true });
  await delay(200);
  pre(`mount:${label}`, await waitUntil(MOUNTED, 15000));
  await settle();
}
const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });
const screenshots = [];
async function saveShot(name, data, details) {
  const buffer = Buffer.from(data, "base64");
  writeFileSync(join(evidenceDir, name), buffer);
  const entry = { file: name, sha256: sha256(buffer), bytes: buffer.length, png: pngSize(buffer), ...details };
  screenshots.push(entry);
  record("screenshot", entry);
  return entry;
}
/** Full-pane capture: grow the viewport height until no vertical scroll container around the pane overflows, clip to
 *  the .settings-detail band (full viewport width), then restore the realistic height. */
async function captureTall(state, width) {
  let height = HEIGHTS[width];
  let loops = 0;
  for (; loops < 5; loops += 1) {
    const extra = await evaluate("verify.verticalOverflow()");
    if (extra <= 0) break;
    height = Math.min(6000, height + extra);
    await setViewport(width, height);
  }
  const layout = await evaluate("verify.layout()");
  const top = Math.max(0, Math.floor(layout.detail.rect.top) - 8);
  const bottom = Math.min(height, Math.ceil(layout.detail.rect.bottom) + 8);
  const clip = { x: 0, y: top, width, height: bottom - top, scale: 1 };
  const shot = await cdp("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: false });
  const entry = await saveShot(`${prefix}-${width}-${state}.png`, shot.data, { state, width, viewportHeight: height, loops, clip, remainingOverflow: await evaluate("verify.verticalOverflow()") });
  await setViewport(width);
  return entry;
}
async function captureViewport(state, width) {
  const shot = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  return saveShot(`${prefix}-${width}-${state}.png`, shot.data, { state, width, viewportHeight: HEIGHTS[width], clip: null });
}

// ---------------------------------------------------------------------------------------------------
// Per-width presentation checks
// ---------------------------------------------------------------------------------------------------
function compactProbe(probe) {
  const { desc, rect, centerHit, allHit, inViewport, inDetail, inDialog, detailGap, overflow, centerTarget, hits, visible } = probe;
  return { desc, rect, centerHit, allHit, inViewport, inDetail, inDialog, detailGap, overflow, ...(centerHit ? {} : { centerTarget }), ...(hits ? { hits } : {}), ...(visible ? {} : { visible }) };
}
function layoutChecks(id, layout, { dialog = false } = {}) {
  const document = layout.document;
  checkDeferred(`${id}:document-no-horizontal-scroll`, document.scrollWidth <= document.clientWidth && document.scrollX === 0, { document });
  checkDeferred(`${id}:detail-no-horizontal-scroll`, layout.detail && layout.detail.scrollWidth <= layout.detail.clientWidth && layout.detail.scrollLeft === 0, { detail: layout.detail });
  checkDeferred(`${id}:pane-no-horizontal-overflow`, layout.pane && layout.pane.scrollWidth <= layout.pane.clientWidth, { pane: layout.pane });
  const scrollers = layout.chain.filter((entry) => /(auto|scroll)/.test(entry.overflowX));
  checkDeferred(`${id}:ancestor-scrollers-no-horizontal-scroll`, scrollers.every((entry) => entry.scrollWidth <= entry.clientWidth) && layout.chain.every((entry) => entry.scrollLeft === 0), { scrollers });
  if (dialog) {
    const box = layout.dialog;
    checkDeferred(`${id}:dialog-inside-viewport`, box && box.rect.left >= 0 && box.rect.top >= 0 && box.rect.right <= layout.viewport.width && box.rect.bottom <= layout.viewport.height, { dialog: box });
    checkDeferred(`${id}:dialog-no-horizontal-overflow`, box && box.scrollWidth <= box.clientWidth, { dialog: box });
  }
}
function probeChecks(id, probes, { dialog = false } = {}) {
  const failures = { found: [], hit: [], contained: [], viewport: [], small: [], clipped: [], hidden: [] };
  for (const probe of probes) {
    if (!probe.found) { failures.found.push(probe.desc); continue; }
    if (!(probe.centerHit && probe.allHit)) failures.hit.push(probe.desc);
    if (dialog ? probe.inDialog !== true : probe.inDetail !== true) failures.contained.push(probe.desc);
    if (!probe.inViewport) failures.viewport.push(probe.desc);
    if (!probe.visible) failures.hidden.push(probe.desc);
    if (isTarget44(probe.desc) && !(probe.rect.width >= 44 && probe.rect.height >= 44)) failures.small.push({ desc: probe.desc, width: probe.rect.width, height: probe.rect.height });
    const textual = isTarget44(probe.desc) || probe.desc.startsWith("spacing:");
    if (textual && probe.overflow.sw > probe.overflow.cw) failures.clipped.push({ desc: probe.desc, overflow: probe.overflow });
  }
  const failed = (list) => list.map((entry) => (typeof entry === "string" ? entry : entry.desc));
  checkDeferred(`${id}:every-control-found`, failures.found.length === 0, { missing: failures.found });
  checkDeferred(`${id}:center-and-inset-hit-test`, failures.hit.length === 0, { failed: failed(failures.hit), probes: probes.filter((probe) => failures.hit.includes(probe.desc)).map(compactProbe) });
  checkDeferred(`${id}:${dialog ? "inside-dialog" : "horizontally-inside-settings-detail"}`, failures.contained.length === 0, { failed: failures.contained, probes: probes.filter((probe) => failures.contained.includes(probe.desc)).map(compactProbe) });
  checkDeferred(`${id}:inside-viewport-after-scroll`, failures.viewport.length === 0, { failed: failures.viewport });
  checkDeferred(`${id}:visible`, failures.hidden.length === 0, { failed: failures.hidden });
  checkDeferred(`${id}:targets-at-least-44x44`, failures.small.length === 0, { failed: failures.small });
  checkDeferred(`${id}:no-clipped-text-in-buttons-or-cards`, failures.clipped.length === 0, { failed: failures.clipped });
  return failures;
}
function overlapChecks(id, report) {
  const offenders = report.filter((group) => group.overlaps.length > 0);
  checkDeferred(`${id}:no-overlap-between-sibling-parts`, offenders.length === 0, { offenders });
}
function textClipChecks(id, clips) {
  const clipped = clips.filter((entry) => entry.sw > entry.cw);
  checkDeferred(`${id}:recovery-and-dialog-text-not-clipped`, clipped.length === 0, { clipped });
}
const pick = (object, keys) => Object.fromEntries(keys.map((key) => [key, object[key]]));
/** Compares the fixed pane with a 2023526 reference that DISPLAYS THE SAME VALUES (pressed/checked states match),
 *  because pressed cards render a bold label (layout.css `.sn-sp.active .sn-sp-label`). */
function geometryChecks(id, current, before) {
  const states = (geometry) => ({
    swatches: geometry.swatches.map((swatch) => [swatch.id, swatch.pressed]),
    cards: geometry.cards.map((card) => [card.id, card.pressed]),
    toggles: geometry.toggles.map((toggle) => [toggle.field, toggle.checked]),
    select: geometry.select?.value ?? null,
  });
  pre(`${id}:2023526-reference-displays-the-same-values`, isDeepStrictEqual(states(current), states(before)), { current: states(current), before: states(before) });
  const smallSwatches = current.swatches.filter((swatch, index) => !(swatch.w >= before.swatches[index].w - 0.01 && swatch.h >= before.swatches[index].h - 0.01));
  const smallCards = current.cards.filter((card, index) => !(card.w >= before.cards[index].w - 0.01 && card.h >= before.cards[index].h - 0.01));
  checkDeferred(`${id}:swatches-not-smaller-than-2023526`, current.swatches.length === 13 && smallSwatches.length === 0, { smallSwatches, before: before.swatches.map((swatch) => [swatch.w, swatch.h]) });
  checkDeferred(`${id}:cards-not-smaller-than-2023526`, current.cards.length === 4 && smallCards.length === 0, { smallCards, before: before.cards.map((card) => [card.w, card.h]) });
  checkDeferred(`${id}:swatch-order-ids-and-css-variable-backgrounds-preserved`, isDeepStrictEqual(current.colorOrder, COLOR_IDS) && isDeepStrictEqual(current.swatches.map((swatch) => swatch.inlineStyle), before.swatches.map((swatch) => swatch.inlineStyle)) && isDeepStrictEqual(current.swatches.map((swatch) => swatch.css), before.swatches.map((swatch) => swatch.css)), { current: current.swatches.map((swatch) => pick(swatch, ["id", "inlineStyle", "css"])) });
  checkDeferred(`${id}:spacing-ids-and-card-box-preserved`, isDeepStrictEqual(current.spacingOrder, SPACING_IDS) && isDeepStrictEqual(current.cards.map((card) => card.css), before.cards.map((card) => card.css)), { current: current.cards.map((card) => card.css) });
  checkDeferred(`${id}:color-variables-unchanged`, isDeepStrictEqual(current.colorVars, before.colorVars), { current: current.colorVars, before: before.colorVars });
  const toggleDiffs = [];
  const shape = (entry) => ({ w: entry.w, h: entry.h, knob: entry.knob && { ...entry.knob, animations: undefined }, css: entry.css, className: entry.className, inRow: entry.inRow });
  for (const toggle of current.toggles) {
    const reference = before.toggles.find((candidate) => candidate.field === toggle.field);
    if (!reference) { toggleDiffs.push({ field: toggle.field, reason: "no 2023526 toggle" }); continue; }
    if (!isDeepStrictEqual(shape(toggle), shape(reference))) toggleDiffs.push({ field: toggle.field, current: shape(toggle), before: shape(reference) });
    if (toggle.knob?.animations || reference.knob?.animations) toggleDiffs.push({ field: toggle.field, reason: "knob animation still running" });
  }
  checkDeferred(`${id}:switch-track-knob-and-row-alignment-equal-2023526`, current.toggles.length === 2 && toggleDiffs.length === 0, { toggleDiffs });
  return { selectSize: { current: current.select, before: before.select } };
}

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
try {
  const before = await prepare(beforeResolved, "before");
  const fixed = await prepare(resolved, "fixed");
  const beforeOrigin = await serve(before);
  const fixedOrigin = await serve(fixed);

  session = await launch();
  await cdp("Runtime.enable");
  await cdp("Page.enable");
  await cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  await cdp("Page.bringToFront");
  const version = await cdp("Browser.getVersion");

  // Static stylesheet check ----------------------------------------------------------------------
  const cssFiles = git(["diff", "--name-only", beforeResolved, resolved, "--", "*.css"]).trim().split("\n").filter(Boolean);
  const cssDiff = git(["diff", "--unified=0", "--no-color", beforeResolved, resolved, "--", "*.css"]);
  const diffLines = cssDiff.split("\n");
  const added = diffLines.filter((line) => line.startsWith("+") && !line.startsWith("+++")).map((line) => line.slice(1));
  const removed = diffLines.filter((line) => line.startsWith("-") && !line.startsWith("---"));
  const parsed = cssPreludes(added.join("\n"));
  const unscoped = parsed.selectors.filter((entry) => !SCOPED.test(entry.selector));
  record("baseline", {
    requested, resolved, before: { requested: BEFORE, resolved: beforeResolved }, docsHead, productDeltaVsDocsHead: productDelta, mode, lang: LANG, suffix,
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent,
    node: process.version, esbuild: esbuild.version,
    lockfileSha256: { fixedArchive: sha256(fixedLock), beforeArchive: sha256(beforeLock), dependencies: sha256(dependencyLock) },
    fixtureSha256, runnerSha256, reusedHarnessSha256,
    bundles: Object.fromEntries([before, fixed].map((bundle) => [bundle.label, { revision: bundle.revision, bundleSha256: bundle.bundleSha256, bundleCssSha256: bundle.bundleCssSha256, inputs: bundle.inputs, productInBundle: bundle.productInBundle, cssMarkers: bundle.cssMarkers }])),
    productHashes: { before: before.productHashes, fixed: fixed.productHashes },
    sizes: HEIGHTS, keyboardWidth: KEYBOARD_WIDTH, evidenceInRepository: evidenceDir === output, origin: "127.0.0.1 (two ephemeral ports)",
  });
  pre("baseline:docs-head-product-tree-equals-fixed", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate-both-archives", sha256(dependencyLock) === sha256(fixedLock) && sha256(dependencyLock) === sha256(beforeLock));
  pre("baseline:bundle-inputs-pinned-to-archives", before.inputs.foreign.length === 0 && fixed.inputs.foreign.length === 0 && before.productInBundle && fixed.productInBundle, { before: before.inputs.foreign, fixed: fixed.inputs.foreign });
  pre("baseline:product-css-in-bundles", before.cssMarkers.snSw && before.cssMarkers.toggle && fixed.cssMarkers.snSw && fixed.cssMarkers.toggle && fixed.cssMarkers.departureDialog && fixed.cssMarkers.stickyRecovery && !before.cssMarkers.stickyRecovery, { before: before.cssMarkers, fixed: fixed.cssMarkers });
  record("css-diff", { cssFiles, addedLines: added.length, removedLines: removed.length, atRules: parsed.atRules, selectors: parsed.selectors.map((entry) => (entry.within.length ? `${entry.within.join(" ")} ${entry.selector}` : entry.selector)), balanced: parsed.balanced, nested: parsed.nested });
  pre("css:diff-parse-balanced", parsed.balanced && parsed.nested === 0 && parsed.selectors.length > 0, { balanced: parsed.balanced, nested: parsed.nested });
  check("css:only-settings-rest-stylesheet-changed", isDeepStrictEqual(cssFiles, ["packages/plugin-web-settings-rest/src/styles.css"]), { cssFiles });
  check("css:additions-only-existing-rules-unchanged", removed.length === 0, { removed: removed.slice(0, 10) });
  check("css:new-selectors-scoped-to-sticky-pane-or-sticky-recovery", unscoped.length === 0, { unscoped });
  check("css:at-rules-are-media-only", parsed.atRules.every((rule) => rule.startsWith("@media")), { atRules: parsed.atRules });

  // =============================================================================================
  // Phase B: as-is geometry at 2023526 (clean pane, same language, same widths)
  // =============================================================================================
  await go(beforeOrigin, "before");
  {
    const probe = await evaluate("verify.probeStorage()");
    pre("before:storage-injector-fires", probe.logged === 1 && probe.last?.op === "get", { probe });
    const controls = await evaluate("verify.paneControls()");
    pre("before:pane-controls-in-dom-order", isDeepStrictEqual(controls.map((entry) => entry.desc), BASE), { controls });
    pre("before:no-recovery-surface", (await evaluate("verify.recovery().length")) === 0 && (await evaluate("verify.paneActions()")) === null);
  }
  const beforeGeometry = {};
  for (const width of WIDTHS) {
    await setViewport(width);
    beforeGeometry[width] = await evaluate("verify.geometry()");
    const probes = await evaluate(`verify.probeAll(${JSON.stringify(BASE)})`);
    const layout = await evaluate("verify.layout()");
    const hitFailures = probes.filter((probe) => !(probe.centerHit && probe.allHit && probe.inDetail)).map((probe) => probe.desc);
    record("before-width", { state: "clean", width, height: HEIGHTS[width], geometry: beforeGeometry[width], hitFailures, layout: { document: layout.document, detail: layout.detail } });
    if (width === 375) await captureTall("before-2023526-clean", width);
  }
  // Phase B2: 2023526 displaying the same values as the fixed all-five drafts (state-matched reference). The before
  // product writes synchronously in its own origin; that storage is never read by the fixed product.
  {
    await setViewport(1440);
    await trustedClick("color:mint");
    pre("before-matched:font-focus", await evaluate("verify.focusTarget('font')"));
    await typeahead("xl");
    await trustedClick("switch:pin_default");
    await trustedClick("switch:restore_size");
    await trustedClick("spacing:xl");
    await settle();
    const displayed = await evaluate("verify.displayed()");
    pre("before-matched:displays-all5-values", isDeepStrictEqual(displayed, { color: ["mint"], font: "xl", pin_default: "false", restore_size: "true", grid_spacing: ["xl"] }), { displayed });
  }
  const beforeMatched = {};
  for (const width of WIDTHS) {
    await setViewport(width);
    beforeMatched[width] = await evaluate("verify.geometry()");
    record("before-width", { state: "matched-all5-values", width, height: HEIGHTS[width], geometry: beforeMatched[width] });
  }

  // =============================================================================================
  // Phase F1: fixed product, clean pane; geometry equality with 2023526 and every base control
  // =============================================================================================
  await go(fixedOrigin, "fixed-clean");
  {
    const probe = await evaluate("verify.probeStorage()");
    pre("fixed:storage-injector-fires", probe.logged === 1 && probe.last?.op === "get", { probe });
    const mutations = (await evaluate("verify.attemptsAfter(0)")).filter((entry) => entry.op !== "get" && FIELDS.map(keyOf).includes(entry.key));
    check("fixed:mount-zero-sticky-writes", mutations.length === 0, { mutations });
    const controls = await evaluate("verify.paneControls()");
    pre("fixed:clean-pane-controls-in-dom-order", isDeepStrictEqual(controls.map((entry) => entry.desc), BASE), { controls });
    pre("fixed:clean-no-recovery", (await evaluate("verify.recovery().length")) === 0);
  }
  const summary = [];
  for (const width of WIDTHS) {
    await setViewport(width);
    const geometry = await evaluate("verify.geometry()");
    const compared = geometryChecks(`clean:${width}`, geometry, beforeGeometry[width]);
    const probes = await evaluate(`verify.probeAll(${JSON.stringify(BASE)})`);
    const failures = probeChecks(`clean:${width}`, probes);
    const layout = await evaluate("verify.layout()");
    layoutChecks(`clean:${width}`, layout);
    overlapChecks(`clean:${width}`, await evaluate("verify.overlapReport()"));
    record("width", { state: "clean", width, height: HEIGHTS[width], geometry, compared, probes: probes.map(compactProbe), layout });
    summary.push({ state: "clean", width, controls: probes.length, failures });
    if (width === 375) await captureTall("clean", width);
  }

  // =============================================================================================
  // Phase F2: all five fields unresolved (failed drafts through trusted input), every control, dialog
  // =============================================================================================
  {
    await evaluate("verify.denySet('sticky')");
    const start = await mark();
    await trustedClick("color:mint");
    pre("all5:color-failed", await waitUntil(`verify.recovery().some((entry) => entry.text === ${JSON.stringify(T.notSaved(T.labels.color))})`, 5000));
    pre("all5:font-focus", await evaluate("verify.focusTarget('font')"));
    await typeahead("xl");
    pre("all5:font-failed", await waitUntil(`verify.recovery().some((entry) => entry.text === ${JSON.stringify(T.notSaved(T.labels.font))})`, 5000));
    await trustedClick("switch:pin_default");
    pre("all5:pin-failed", await waitUntil(`verify.recovery().some((entry) => entry.text === ${JSON.stringify(T.notSaved(T.labels.pin_default))})`, 5000));
    await trustedClick("switch:restore_size");
    pre("all5:restore-failed", await waitUntil(`verify.recovery().some((entry) => entry.text === ${JSON.stringify(T.notSaved(T.labels.restore_size))})`, 5000));
    await trustedClick("spacing:xl");
    pre("all5:spacing-failed", await waitUntil(`verify.recovery().length === 5 && !!verify.paneActions()`, 5000));
    await settle();
    const recovery = await evaluate("verify.recovery()");
    const actions = await evaluate("verify.paneActions()");
    const writes = (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => entry.op === "set" || entry.op === "remove");
    const events = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => ["click", "keydown", "change"].includes(entry.type));
    check("all5:five-failed-recovery-blocks-exact-wording", isDeepStrictEqual(recovery, FIELDS.map(failedEntry)), { recovery });
    check("all5:pane-actions-export-and-discard-all", isDeepStrictEqual(actions, { buttons: [T.exportDraft, T.discardAll], alert: null }), { actions });
    check("all5:displayed-drafts-aria-matches-visual", isDeepStrictEqual(await evaluate("verify.displayed()"), { color: ["mint"], font: "xl", pin_default: "false", restore_size: "true", grid_spacing: ["xl"] }) && (await evaluate("verify.ariaVisualMismatches()")).length === 0, { displayed: await evaluate("verify.displayed()"), mismatches: await evaluate("verify.ariaVisualMismatches()") });
    check("all5:one-denied-write-per-field-bytes-unchanged", isDeepStrictEqual(writes.map((entry) => [entry.op, entry.key, entry.value, entry.outcome]), [["set", keyOf("color"), "mint", "denied"], ["set", keyOf("font"), "xl", "denied"], ["set", keyOf("pin_default"), "false", "denied"], ["set", keyOf("restore_size"), "true", "denied"], ["set", keyOf("grid_spacing"), "xl", "denied"]]) && Object.values(await evaluate("verify.physical()")).every((value) => value === null), { writes });
    pre("all5:inputs-trusted", events.length > 0 && events.every((entry) => entry.trusted), { events });
    record("all5-state", { recovery, actions, writes, events });
  }
  for (const width of WIDTHS) {
    await setViewport(width);
    const controls = await evaluate("verify.paneControls()");
    checkDeferred(`all5:${width}:pane-controls-in-dom-order`, isDeepStrictEqual(controls.map((entry) => entry.desc), ALL5), { controls: controls.map((entry) => entry.desc) });
    const probes = await evaluate(`verify.probeAll(${JSON.stringify(ALL5)})`);
    const failures = probeChecks(`all5:${width}`, probes);
    const layout = await evaluate("verify.layout()");
    layoutChecks(`all5:${width}`, layout);
    overlapChecks(`all5:${width}`, await evaluate("verify.overlapReport()"));
    textClipChecks(`all5:${width}`, await evaluate("verify.textClip()"));
    const geometry = await evaluate("verify.geometry()");
    const compared = geometryChecks(`all5:${width}`, geometry, beforeMatched[width]);
    record("width", { state: "all5", width, height: HEIGHTS[width], geometry, compared, probes: probes.map(compactProbe), layout });
    summary.push({ state: "all5", width, controls: probes.length, failures });
    await captureTall("all5", width);
  }
  // Departure dialog over the all-five state: trusted, hit-tested sidebar activation
  {
    const rows = await evaluate("verify.sidebarRows()");
    const index = rows.indexOf(`sidebar:${T.title}`);
    pre("dialog:sticky-row-present", index >= 0, { rows });
    const target = rows[index + 1] ?? rows[index - 1];
    const before = await evaluate("verify.location()");
    await trustedClick(target);
    pre("dialog:open", await waitUntil("verify.dialog() !== null", 4000));
    check("dialog:wording", isDeepStrictEqual(await evaluate("verify.dialog()"), T.dialog), { dialog: await evaluate("verify.dialog()") });
    check("dialog:focus-enters-dialog", (await activeDesc()) === "dialog", { active: await activeDesc() });
    check("dialog:route-held", isDeepStrictEqual(await evaluate("verify.location()"), before), { location: await evaluate("verify.location()") });
    await press("Tab");
    check("dialog:tab-to-first-action", (await activeDesc()) === "dialog:stay", { active: await activeDesc() });
    record("dialog-open", { via: target, location: before });
    for (const width of WIDTHS) {
      await setViewport(width);
      const probes = await evaluate(`verify.probeAll(${JSON.stringify(DIALOG_ACTIONS)})`);
      const failures = probeChecks(`dialog:${width}`, probes, { dialog: true });
      const layout = await evaluate("verify.layout()");
      layoutChecks(`dialog:${width}`, layout, { dialog: true });
      overlapChecks(`dialog:${width}`, await evaluate("verify.overlapReport()"));
      textClipChecks(`dialog:${width}`, await evaluate("verify.textClip()"));
      const focus = await evaluate("verify.focusInfo()");
      checkDeferred(`dialog:${width}:focused-action-visible-outline`, focus.desc === "dialog:stay" && focus.focusVisible && focus.outline.style !== "none" && parseFloat(focus.outline.width) >= 1, { focus });
      record("width", { state: "dialog", width, height: HEIGHTS[width], probes: probes.map(compactProbe), layout, focus, inDetail: probes.map((probe) => [probe.desc, probe.inDetail]) });
      summary.push({ state: "dialog", width, controls: probes.length, failures });
      if (width === 375) await captureViewport("dialog", width);
    }
    await trustedClick("dialog:stay");
    pre("dialog:stay-closes", await waitUntil("verify.dialog() === null", 4000));
    check("dialog:stay-keeps-route-and-drafts", isDeepStrictEqual(await evaluate("verify.location()"), before) && (await evaluate("verify.recovery().length")) === 5, { location: await evaluate("verify.location()") });
  }

  // =============================================================================================
  // Phase F3: source-only Reload (out-of-domain stored bytes for one field)
  // =============================================================================================
  {
    const start = await mark();
    await trustedClick("discard-all");
    pre("reload:discard-all-clears", await waitUntil("verify.recovery().length === 0 && verify.paneActions() === null", 4000));
    const mutations = (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => entry.op === "set" || entry.op === "remove");
    check("reload:discard-all-zero-writes", mutations.length === 0, { mutations });
    await evaluate("verify.restore()");
    pre("reload:seed-out-of-domain-font", (await evaluate("verify.seedRaw('font', 'huge')")) === "huge");
    await reloadPage("reload-state");
    const recovery = await evaluate("verify.recovery()");
    check("reload:source-only-block-exact-wording", isDeepStrictEqual(recovery, [sourceEntry("font")]), { recovery });
    check("reload:no-pane-actions", (await evaluate("verify.paneActions()")) === null);
  }
  for (const width of WIDTHS) {
    await setViewport(width);
    const controls = await evaluate("verify.paneControls()");
    checkDeferred(`reload:${width}:pane-controls-in-dom-order`, isDeepStrictEqual(controls.map((entry) => entry.desc), RELOAD), { controls: controls.map((entry) => entry.desc) });
    const probes = await evaluate(`verify.probeAll(${JSON.stringify(RELOAD)})`);
    const failures = probeChecks(`reload:${width}`, probes);
    const layout = await evaluate("verify.layout()");
    layoutChecks(`reload:${width}`, layout);
    overlapChecks(`reload:${width}`, await evaluate("verify.overlapReport()"));
    textClipChecks(`reload:${width}`, await evaluate("verify.textClip()"));
    record("width", { state: "reload", width, height: HEIGHTS[width], probes: probes.map(compactProbe), layout });
    summary.push({ state: "reload", width, controls: probes.length, failures });
    if (width === 375) await captureTall("reload", width);
  }
  pre("reload:unseed", (await evaluate("verify.seedRaw('font', null)")) === null);

  // =============================================================================================
  // Phase K: keyboard at KEYBOARD_WIDTH (fresh document, clean bytes)
  // =============================================================================================
  await setViewport(KEYBOARD_WIDTH);
  await evaluate("verify.clearSticky()");
  await reloadPage("keyboard");
  await setViewport(KEYBOARD_WIDTH);
  const keyboard = { width: KEYBOARD_WIDTH };
  const focusOk = (focus) => focus.focusVisible === true && focus.outline?.style !== "none" && parseFloat(focus.outline?.width ?? "0") >= 1 && !/transparent|\/ 0\)|rgba\(0, 0, 0, 0\)/.test(focus.outline?.color ?? "") && focus.inViewport && focus.centerHit;
  /** Trusted Tab / Shift+Tab presses until `desc` is focused; the direction follows the pane's DOM order. */
  async function focusByTab(desc, limit = 120) {
    let presses = 0;
    while (presses < limit) {
      const current = await activeDesc();
      if (current === desc) return presses;
      const order = (await evaluate("verify.paneControls()")).map((entry) => entry.desc);
      const from = order.indexOf(current);
      const to = order.indexOf(desc);
      const backward = from >= 0 && to >= 0 && to < from;
      await press("Tab", backward);
      presses += 1;
    }
    pre(`keyboard:focus-reached:${desc}`, false, { active: await activeDesc() });
    return presses;
  }
  // K1: trusted Tab walk from the document start through the clean pane
  {
    await evaluate("verify.blurActive()");
    const walk = [];
    let entered = false;
    for (let index = 0; index < 160; index += 1) {
      await press("Tab");
      const focus = await evaluate("verify.focusInfo()");
      walk.push(focus);
      if (focus.inPane) entered = true;
      else if (entered) break;
    }
    const paneWalk = walk.filter((focus) => focus.inPane);
    const bad = paneWalk.filter((focus) => !focusOk(focus));
    check("keyboard:clean-tab-reaches-every-control-in-dom-order", isDeepStrictEqual(paneWalk.map((focus) => focus.desc), BASE), { sequence: paneWalk.map((focus) => focus.desc) });
    check("keyboard:clean-tab-focus-visible", bad.length === 0, { bad });
    keyboard.cleanWalk = { presses: walk.length, before: walk.filter((focus) => !focus.inPane).map((focus) => focus.desc), pane: paneWalk };
    record("keyboard-walk", { state: "clean", width: KEYBOARD_WIDTH, presses: walk.length, outside: walk.filter((focus) => !focus.inPane).map((focus) => focus.desc), pane: paneWalk });
  }
  // Space-scroll positive control: a focused non-button inside the scroller does scroll on Space
  {
    const before = await evaluate("verify.scrollState()");
    pre("keyboard:scroll-probe-armed", await evaluate("verify.armScrollProbe()"));
    const armed = await evaluate("verify.scrollState()");
    await press("Space");
    await delay(400);
    const after = await evaluate("verify.scrollState()");
    const moved = after.chain.some((entry, index) => entry.top !== armed.chain[index].top) || after.y !== armed.y;
    record("keyboard-space-positive-control", { before, armed, after, moved });
    pre("keyboard:space-scroll-positive-control-scrolls", moved, { armed, after });
    pre("keyboard:scroll-probe-disarmed", await evaluate("verify.disarmScrollProbe()"));
    await evaluate(`verify.restoreScroll(${JSON.stringify(before)})`);
    await settle();
  }
  /** One trusted key activation; asserts exactly one operation and no scroll on Space. */
  async function activation(id, desc, keyName, field, expected) {
    await focusByTab(desc);
    await settle();
    const start = await mark();
    const scrollBefore = await evaluate("verify.scrollState()");
    const rectBefore = (await evaluate(`verify.probe(${JSON.stringify(desc)}, false)`)).rect;
    await press(keyName);
    const settledExpression = expected.denied
      ? `verify.recovery().some((entry) => entry.text === ${JSON.stringify(T.notSaved(T.labels[field]))})`
      : `verify.physical()[${JSON.stringify(field)}] === ${JSON.stringify(expected.bytes)} && verify.recovery().length === 0`;
    const settled = await waitUntil(settledExpression, 5000);
    await delay(300);
    const events = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type !== "focusin");
    const writes = (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => (entry.op === "set" || entry.op === "remove") && entry.key === keyOf(field));
    const otherWrites = (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => (entry.op === "set" || entry.op === "remove") && entry.key !== keyOf(field));
    const scrollAfter = await evaluate("verify.scrollState()");
    const rectAfter = (await evaluate(`verify.probe(${JSON.stringify(desc)}, false)`)).rect;
    const displayed = await evaluate("verify.displayed()");
    const ariaVisualMismatches = await evaluate("verify.ariaVisualMismatches()");
    const physical = await evaluate("verify.physical()");
    const keyName2 = KEYS[keyName].key;
    const keydowns = events.filter((entry) => entry.type === "keydown" && entry.key === keyName2);
    const keyups = events.filter((entry) => entry.type === "keyup" && entry.key === keyName2);
    const clicks = events.filter((entry) => entry.type === "click");
    const result = { id, desc, key: keyName, settled, keydowns: keydowns.length, keyups: keyups.length, clicks: clicks.map((entry) => [entry.target, entry.trusted]), writes: writes.map((entry) => [entry.op, entry.value, entry.outcome]), otherWrites: otherWrites.length, displayed, ariaVisualMismatches, physical, scrollBefore, scrollAfter, rectBefore, rectAfter, active: await activeDesc() };
    record("keyboard-activation", result);
    check(`keyboard:${id}:settled`, settled, result);
    check(`keyboard:${id}:one-trusted-key-one-trusted-click`, keydowns.length === 1 && keyups.length === 1 && keydowns.every((entry) => entry.trusted && entry.target === desc) && clicks.length === 1 && clicks[0].trusted && clicks[0].target === desc, result);
    check(`keyboard:${id}:exactly-one-operation`, writes.length === 1 && writes[0].op === "set" && writes[0].value === expected.bytes && writes[0].outcome === (expected.denied ? "denied" : "ok") && otherWrites.length === 0, result);
    check(`keyboard:${id}:aria-reflects-displayed-draft`, expected.displayed(displayed) && ariaVisualMismatches.length === 0, result);
    if (expected.denied) check(`keyboard:${id}:stored-bytes-unchanged-while-draft-displayed`, physical[field] === expected.stored, result);
    // A pressed card's label turns bold (layout.css), so only the vertical position is compared with the scroll offsets.
    if (keyName === "Space") check(`keyboard:${id}:space-does-not-scroll`, isDeepStrictEqual(scrollBefore, scrollAfter) && rectBefore.top === rectAfter.top && rectBefore.bottom === rectAfter.bottom, result);
    check(`keyboard:${id}:focus-stays-on-control`, result.active === desc, result);
    return result;
  }
  const pressed = (list, id) => isDeepStrictEqual(list, [id]);
  // K2: success path, Space and Enter on a swatch, a card and both switches; the select changes once per choice
  keyboard.activations = [];
  keyboard.activations.push(await activation("swatch-space", "color:mint", "Space", "color", { bytes: "mint", displayed: (shown) => pressed(shown.color, "mint") }));
  keyboard.activations.push(await activation("swatch-enter", "color:navy", "Enter", "color", { bytes: "navy", displayed: (shown) => pressed(shown.color, "navy") }));
  for (const [choice, bytes] of [["small", "small"], ["xl", "xl"]]) {
    await focusByTab("font");
    const start = await mark();
    await typeahead(choice);
    const settled = await waitUntil(`verify.physical().font === ${JSON.stringify(bytes)} && verify.recovery().length === 0`, 5000);
    await delay(300);
    const events = await evaluate(`verify.eventsAfter(${start})`);
    const writes = (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => entry.op === "set" || entry.op === "remove");
    const changes = events.filter((entry) => entry.type === "change" && entry.target === "font");
    const keydowns = events.filter((entry) => entry.type === "keydown" && entry.target === "font");
    const result = { id: `select-${choice}`, settled, changes: changes.map((entry) => [entry.value, entry.trusted]), keydowns: keydowns.map((entry) => [entry.key, entry.trusted]), writes: writes.map((entry) => [entry.key, entry.value, entry.outcome]), displayed: await evaluate("verify.displayed()"), active: await activeDesc() };
    record("keyboard-select", result);
    check(`keyboard:select-${choice}:changes-once-per-keyboard-choice`, settled && result.changes.length === 1 && result.changes[0][0] === bytes && result.changes[0][1] === true && result.keydowns.length === 1 && result.keydowns[0][1] === true, result);
    check(`keyboard:select-${choice}:exactly-one-operation`, result.writes.length === 1 && result.writes[0][0] === keyOf("font") && result.writes[0][1] === bytes && result.writes[0][2] === "ok" && result.displayed.font === bytes && result.active === "font", result);
    keyboard.activations.push(result);
  }
  keyboard.activations.push(await activation("pin-space", "switch:pin_default", "Space", "pin_default", { bytes: "false", displayed: (shown) => shown.pin_default === "false" }));
  keyboard.activations.push(await activation("pin-enter", "switch:pin_default", "Enter", "pin_default", { bytes: "true", displayed: (shown) => shown.pin_default === "true" }));
  keyboard.activations.push(await activation("restore-space", "switch:restore_size", "Space", "restore_size", { bytes: "true", displayed: (shown) => shown.restore_size === "true" }));
  keyboard.activations.push(await activation("restore-enter", "switch:restore_size", "Enter", "restore_size", { bytes: "false", displayed: (shown) => shown.restore_size === "false" }));
  keyboard.activations.push(await activation("card-space", "spacing:xl", "Space", "grid_spacing", { bytes: "xl", displayed: (shown) => pressed(shown.grid_spacing, "xl") }));
  keyboard.activations.push(await activation("card-enter", "spacing:none", "Enter", "grid_spacing", { bytes: "none", displayed: (shown) => pressed(shown.grid_spacing, "none") }));
  check("keyboard:success-path-final-bytes", isDeepStrictEqual(await evaluate("verify.physical()"), { color: "navy", font: "xl", pin_default: "true", restore_size: "false", grid_spacing: "none" }), { physical: await evaluate("verify.physical()") });
  // K3: failure path; every field gets a failed draft by keyboard; aria follows the draft, not the stored bytes
  await evaluate("verify.denySet('sticky')");
  keyboard.activations.push(await activation("swatch-space-denied", "color:coral", "Space", "color", { denied: true, bytes: "coral", stored: "navy", displayed: (shown) => pressed(shown.color, "coral") }));
  {
    await focusByTab("font");
    const start = await mark();
    await typeahead("normal");
    const settled = await waitUntil(`verify.recovery().some((entry) => entry.text === ${JSON.stringify(T.notSaved(T.labels.font))})`, 5000);
    await delay(300);
    const events = await evaluate(`verify.eventsAfter(${start})`);
    const writes = (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => entry.op === "set" || entry.op === "remove");
    const changes = events.filter((entry) => entry.type === "change" && entry.target === "font");
    const result = { id: "select-normal-denied", settled, changes: changes.map((entry) => [entry.value, entry.trusted]), writes: writes.map((entry) => [entry.key, entry.value, entry.outcome]), displayed: await evaluate("verify.displayed()"), physical: await evaluate("verify.physical()") };
    record("keyboard-select", result);
    check("keyboard:select-normal-denied:changes-once-draft-displayed-bytes-kept", settled && result.changes.length === 1 && result.changes[0][0] === "normal" && result.changes[0][1] === true && result.writes.length === 1 && result.writes[0][0] === keyOf("font") && result.writes[0][1] === "normal" && result.writes[0][2] === "denied" && result.displayed.font === "normal" && result.physical.font === "xl", result);
    keyboard.activations.push(result);
  }
  keyboard.activations.push(await activation("pin-space-denied", "switch:pin_default", "Space", "pin_default", { denied: true, bytes: "false", stored: "true", displayed: (shown) => shown.pin_default === "false" }));
  keyboard.activations.push(await activation("restore-enter-denied", "switch:restore_size", "Enter", "restore_size", { denied: true, bytes: "true", stored: "false", displayed: (shown) => shown.restore_size === "true" }));
  keyboard.activations.push(await activation("card-enter-denied", "spacing:large", "Enter", "grid_spacing", { denied: true, bytes: "large", stored: "none", displayed: (shown) => pressed(shown.grid_spacing, "large") }));
  check("keyboard:all-five-unresolved-by-keyboard", isDeepStrictEqual(await evaluate("verify.recovery()"), FIELDS.map(failedEntry)) && isDeepStrictEqual((await evaluate("verify.paneActions()"))?.buttons, [T.exportDraft, T.discardAll]), { recovery: await evaluate("verify.recovery()") });
  // K4: trusted Shift+Tab out of the top of the pane, then Tab through every all-five control
  {
    const backward = [];
    for (let index = 0; index < 60; index += 1) {
      await press("Tab", true);
      const focus = await evaluate("verify.focusInfo()");
      if (!focus.inPane) { backward.push(focus.desc); break; }
      backward.push(focus.desc);
    }
    const exitTop = backward.at(-1);
    const forward = [];
    for (let index = 0; index < 60; index += 1) {
      await press("Tab");
      const focus = await evaluate("verify.focusInfo()");
      if (!focus.inPane) { keyboard.exitBottom = focus.desc; break; }
      forward.push(focus);
    }
    const bad = forward.filter((focus) => !focusOk(focus));
    const expectedBackward = ALL5.slice(0, ALL5.indexOf("spacing:large")).reverse();
    check("keyboard:all5-shift-tab-reverse-dom-order", isDeepStrictEqual(backward.slice(0, -1), expectedBackward) && exitTop.startsWith("sidebar:"), { backward });
    check("keyboard:all5-tab-reaches-every-control-in-dom-order", isDeepStrictEqual(forward.map((focus) => focus.desc), ALL5), { sequence: forward.map((focus) => focus.desc) });
    check("keyboard:all5-tab-focus-visible", bad.length === 0, { bad });
    record("keyboard-walk", { state: "all5", width: KEYBOARD_WIDTH, backward, exitTop, pane: forward, exitBottom: keyboard.exitBottom });
  }
  // K5: recovery buttons by keyboard: Enter on Retry is one attempt; Space on Discard is zero writes
  {
    await focusByTab("retry:color");
    let start = await mark();
    await press("Enter");
    await delay(500);
    let events = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type === "click");
    let writes = (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => entry.op === "set" || entry.op === "remove");
    const retry = { clicks: events.map((entry) => [entry.target, entry.trusted]), writes: writes.map((entry) => [entry.key, entry.value, entry.outcome]), recovery: await evaluate("verify.recovery()"), active: await activeDesc() };
    record("keyboard-recovery", { action: "retry:color", ...retry });
    check("keyboard:retry-enter-exactly-one-attempt", retry.clicks.length === 1 && retry.clicks[0][0] === "retry:color" && retry.clicks[0][1] && writes.length === 1 && writes[0].key === keyOf("color") && writes[0].value === "coral" && writes[0].outcome === "denied" && retry.recovery.length === 5 && retry.active === "retry:color", retry);
    await focusByTab("discard:font");
    start = await mark();
    await press("Space");
    await waitUntil(`verify.recovery().length === 4`, 3000);
    await delay(300);
    events = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type === "click");
    writes = (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => entry.op === "set" || entry.op === "remove");
    const discard = { clicks: events.map((entry) => [entry.target, entry.trusted]), writes: writes.length, recovery: (await evaluate("verify.recovery()")).map((entry) => entry.text), displayedFont: (await evaluate("verify.displayed()")).font, activeAfter: await activeDesc() };
    record("keyboard-recovery", { action: "discard:font", ...discard, note: "post-discard focus target is recorded only; contract §9 does not specify it" });
    check("keyboard:discard-space-once-zero-writes", discard.clicks.length === 1 && discard.clicks[0][0] === "discard:font" && discard.clicks[0][1] && discard.writes === 0 && discard.recovery.length === 4 && discard.displayedFont === "xl", discard);
    keyboard.postDiscardFocus = discard.activeAfter;
  }
  // K6: dialog by keyboard sidebar activation; focus enters, Tab/Shift+Tab wrap, Escape = Stay, focus returns
  {
    await focusByTab("color:sun");
    await press("Tab", true);
    const row = await activeDesc();
    pre("keyboard:dialog-trigger-is-sidebar-row", row.startsWith("sidebar:"), { row });
    const location = await evaluate("verify.location()");
    const start = await mark();
    await press("Enter");
    pre("keyboard:dialog-open", await waitUntil("verify.dialog() !== null", 4000));
    const steps = [{ key: "open", active: await activeDesc() }];
    for (const [key, shift] of [["Tab", false], ["Tab", false], ["Tab", false], ["Tab", false], ["Tab", true], ["Tab", true], ["Tab", true]]) {
      await press(key, shift);
      const focus = await evaluate("verify.focusInfo()");
      steps.push({ key: shift ? "Shift+Tab" : "Tab", active: focus.desc, ok: focusOk(focus) });
    }
    const expectedSteps = ["dialog", "dialog:stay", "dialog:export", "dialog:discard-leave", "dialog:stay", "dialog:discard-leave", "dialog:export", "dialog:stay"];
    await press("Escape");
    const closed = await waitUntil("verify.dialog() === null", 3000);
    await delay(250);
    const after = { closed, location: await evaluate("verify.location()"), active: await activeDesc(), recovery: (await evaluate("verify.recovery()")).length, routeEvents: (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type === "click").map((entry) => entry.target) };
    record("keyboard-dialog", { trigger: row, steps, after });
    check("keyboard:dialog-focus-enters", steps[0].active === "dialog", { steps });
    check("keyboard:dialog-tab-and-shift-tab-wrap", isDeepStrictEqual(steps.map((step) => step.active), expectedSteps) && steps.slice(1).every((step) => step.ok), { steps });
    check("keyboard:dialog-escape-is-stay", closed && isDeepStrictEqual(after.location, location) && after.recovery === 4, after);
    check("keyboard:dialog-focus-returns-to-prior-element", after.active === row, after);
    keyboard.dialogKeyboard = { trigger: row, steps, after };
  }
  // K7: dialog from a programmatic module navigation while a pane control has focus; Shift+Tab from the container wraps
  {
    await focusByTab("color:sun");
    const location = await evaluate("verify.location()");
    await evaluate("verify.navigate('/app/tasks')");
    pre("keyboard:dialog-open-programmatic", await waitUntil("verify.dialog() !== null", 4000));
    const opened = await activeDesc();
    await press("Tab", true);
    const wrappedLast = await activeDesc();
    await press("Tab");
    const wrappedFirst = await activeDesc();
    await press("Escape");
    const closed = await waitUntil("verify.dialog() === null", 3000);
    await delay(250);
    const after = { opened, wrappedLast, wrappedFirst, closed, location: await evaluate("verify.location()"), active: await activeDesc() };
    record("keyboard-dialog", { trigger: "router.navigate('/app/tasks') with focus on color:sun", ...after });
    check("keyboard:programmatic-dialog-focus-and-wrap", opened === "dialog" && wrappedLast === "dialog:discard-leave" && wrappedFirst === "dialog:stay", after);
    check("keyboard:programmatic-dialog-escape-stay-focus-returns", closed && isDeepStrictEqual(after.location, location) && after.active === "color:sun", after);
  }
  // K8: Enter on the focused Stay action activates it once; focus returns to the prior element
  {
    await focusByTab("switch:pin_default");
    const location = await evaluate("verify.location()");
    await evaluate("verify.navigate('/app/tasks')");
    pre("keyboard:dialog-open-for-enter", await waitUntil("verify.dialog() !== null", 4000));
    await press("Tab");
    const onStay = await activeDesc();
    const start = await mark();
    await press("Enter");
    const closed = await waitUntil("verify.dialog() === null", 3000);
    await delay(250);
    const clicks = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type === "click").map((entry) => [entry.target, entry.trusted]);
    const after = { onStay, closed, clicks, location: await evaluate("verify.location()"), active: await activeDesc() };
    record("keyboard-dialog", { trigger: "router.navigate('/app/tasks') with focus on switch:pin_default; Enter on Stay", ...after });
    check("keyboard:dialog-enter-on-stay-once-focus-returns", onStay === "dialog:stay" && closed && clicks.length === 1 && clicks[0][0] === "dialog:stay" && clicks[0][1] && isDeepStrictEqual(after.location, location) && after.active === "switch:pin_default", after);
  }
  // K9: Discard all by keyboard (one click, zero writes); then a source-only state: Tab reaches Reload in DOM order and
  // Enter on Reload is one click with zero writes (the out-of-domain bytes are kept, the alert stays)
  {
    await focusByTab("discard-all");
    const start = await mark();
    await press("Enter");
    const cleared = await waitUntil("verify.recovery().length === 0 && verify.paneActions() === null", 3000);
    await delay(250);
    const clicks = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type === "click").map((entry) => [entry.target, entry.trusted]);
    const writes = (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => entry.op === "set" || entry.op === "remove");
    const discardAll = { cleared, clicks, writes: writes.length, displayed: await evaluate("verify.displayed()"), physical: await evaluate("verify.physical()"), activeAfter: await activeDesc() };
    record("keyboard-recovery", { action: "discard-all", ...discardAll, note: "post-discard focus target is recorded only; contract §9 does not specify it" });
    check("keyboard:discard-all-enter-once-zero-writes", cleared && clicks.length === 1 && clicks[0][0] === "discard-all" && clicks[0][1] && writes.length === 0 && isDeepStrictEqual(discardAll.displayed, { color: ["navy"], font: "xl", pin_default: "true", restore_size: "false", grid_spacing: ["none"] }), discardAll);
    keyboard.postDiscardAllFocus = discardAll.activeAfter;
  }
  {
    await evaluate("verify.restore()");
    pre("keyboard:seed-out-of-domain-font", (await evaluate("verify.seedRaw('font', 'huge')")) === "huge");
    await reloadPage("keyboard-source-only");
    pre("keyboard:source-only-block", isDeepStrictEqual(await evaluate("verify.recovery()"), [sourceEntry("font")]), { recovery: await evaluate("verify.recovery()") });
    await evaluate("verify.blurActive()");
    const walk = [];
    let presses = 0;
    let entered = false;
    for (; presses < 160; presses += 1) {
      await press("Tab");
      const focus = await evaluate("verify.focusInfo()");
      if (focus.inPane) { entered = true; walk.push(focus); } else if (entered) break;
    }
    const bad = walk.filter((focus) => !focusOk(focus));
    check("keyboard:source-only-tab-reaches-every-control-in-dom-order", isDeepStrictEqual(walk.map((focus) => focus.desc), RELOAD), { sequence: walk.map((focus) => focus.desc) });
    check("keyboard:source-only-tab-focus-visible", bad.length === 0, { bad });
    record("keyboard-walk", { state: "source-only", width: KEYBOARD_WIDTH, presses: presses + 1, pane: walk });
    await focusByTab("reload:font");
    const start = await mark();
    await press("Enter");
    await delay(500);
    const clicks = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type === "click").map((entry) => [entry.target, entry.trusted]);
    const writes = (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => entry.op === "set" || entry.op === "remove");
    const reads = (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => entry.op === "get" && entry.key?.startsWith("xai_pref_sticky_")).map((entry) => entry.key);
    const after = { clicks, writes: writes.length, stickyReads: reads, recovery: await evaluate("verify.recovery()"), physicalFont: (await evaluate("verify.physical()")).font, active: await activeDesc() };
    record("keyboard-recovery", { action: "reload:font", ...after });
    check("keyboard:reload-enter-once-zero-writes-bytes-kept", clicks.length === 1 && clicks[0][0] === "reload:font" && clicks[0][1] && writes.length === 0 && isDeepStrictEqual(after.recovery, [sourceEntry("font")]) && after.physicalFont === "huge", after);
    pre("keyboard:unseed", (await evaluate("verify.seedRaw('font', null)")) === null);
  }
  record("keyboard-summary", { width: KEYBOARD_WIDTH, lang: LANG, postDiscardFocus: keyboard.postDiscardFocus, postDiscardAllFocus: keyboard.postDiscardAllFocus, exitBottom: keyboard.exitBottom });

  record("summary", { lang: LANG, widths: WIDTHS, table: summary.map((row) => ({ state: row.state, width: row.width, controls: row.controls, hitFailures: row.failures.hit.length, containmentFailures: row.failures.contained.length, viewportFailures: row.failures.viewport.length, under44: row.failures.small.length, clipped: row.failures.clipped.length })), screenshots: screenshots.map((entry) => ({ file: entry.file, sha256: entry.sha256, png: entry.png })) });
  pre("run:no-unexpected-javascript-dialogs", unexpectedDialogs.length === 0, { unexpectedDialogs });
  check("run:deferred-product-failures-zero", deferredFailures.length === 0, { deferredFailures });
  check("run:runtime-errors-zero", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 5) });
  record("native", { pass: true, mode, lang: LANG, checks, deferredFailures, runtimeErrors: 0, consoleWarnings: consoleWarnings.length, consoleWarningSamples: [...new Set(consoleWarnings)].slice(0, 5), screenshots: screenshots.length });
} catch (error) {
  record("native", { pass: false, mode, lang: LANG, checks, deferredFailures, error: String(error?.stack ?? error).slice(0, 1500), checkId: error?.checkId ?? null, checkKind: error?.checkKind ?? null, runtimeErrors: runtimeErrors.slice(0, 8).map((entry) => ({ ...entry, text: entry.text.slice(0, 400) })), runtimeErrorCount: runtimeErrors.length, consoleWarnings: consoleWarnings.length, consoleWarningSamples: [...new Set(consoleWarnings)].slice(0, 5), screenshots: screenshots.length });
  process.exitCode = 1;
} finally {
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`);
  await closeSession().catch(() => {});
  for (const server of servers) { server.closeAllConnections?.(); server.close(); }
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  const last = records.at(-1);
  console.log(`${last?.pass ? "PASS" : "FAIL"} ${relative(root, evidencePath)} checks=${checks} screenshots=${screenshots.length}${last?.pass ? "" : ` error=${String(last?.error).split("\n")[0]}`}`);
}
