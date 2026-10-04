/**
 * CP-FEATURES-01 batch 29 (contract §9 "Responsive presentation" and "Keyboard", §13 gates 5 and 8, §14 E14 and
 * E15): the fixed Settings Features caller in real headless Chrome, EN or ZH per run. Parent-role visual and
 * keyboard verifier. Verification only: it repairs nothing, implements nothing, accepts nothing and changes no
 * product file, contract, ledger, control plane or existing evidence (earlier files in this directory are read,
 * never modified; the frozen E4 log is read for the geometry comparison only).
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-features-recovery-native/verify-visual-fixed.mjs <fixed revision> <visual|visual-zh> <suffix>
 *
 * - Products: an immutable `git archive <fixed revision>` and, for the geometry comparison only, an immutable
 *   `git archive f359be6` (the contract's before product). ./native-visual-fixed.tsx (production App composition)
 *   is bundled with esbuild from stdin with resolveDir = each archive; every `@repo/*` specifier is pinned to that
 *   archive's own package export and a guard plugin fails the build if any module is loaded from the packages/,
 *   apps/ or docs/ tree of the dependency checkout or of this runner's checkout. Third-party modules come from
 *   XAI_DEPS_ROOT only when its pnpm-lock.yaml SHA-256 equals both archives' (consistency gate).
 * - Each archive is served by its own 127.0.0.1 server (separate origins, separate storage); every other host
 *   resolves to NOTFOUND; one isolated headless Chrome profile. Storage states are seeded on a product-free /seed
 *   page. Pointer input is CDP Input.dispatchMouseEvent after a centre hit-test; keyboard input is CDP
 *   Input.dispatchKeyEvent (trusted events); the native window.confirm is answered through
 *   Page.handleJavaScriptDialog by plan. Widths 375x812 and 414x896 (mobile emulation), 768x1024, 1024x768 and
 *   1440x900 (desktop), deviceScaleFactor 1.
 * - DesktopPet: the production App mounts the pet ON. Its default-position coverage is recorded per width in the
 *   clean state of both products (observation, not gated); the gated presentation and keyboard checks run with
 *   the pet turned off through the product's own rail pet toggle (trusted click at 1440 px, where the rail shows
 *   it), as the accepted Sticky (batch 15) and Features E12 harnesses ran without the pet.
 * - Static check: the f359be6..fixed stylesheet diff may only ADD selectors under .features-pane.
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log`; screenshots `native-<sha7>-<suffix>-<mode>-<width>-<state>.png`
 *   in this directory. Development probes may redirect both with XAI_VISUAL_EVIDENCE_DIR (outside the repository
 *   only); committed evidence never does. Refuses to overwrite. Exit 0 = harness valid and every check PASS;
 *   2 = harness valid and a product check FAILED; 1 = harness invalid (a precondition).
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
const BEFORE = "f359be6d838393e0f9e93efd80b88b5b09f6144e";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_VISUAL_EVIDENCE_DIR ?? output;
if (process.env.XAI_VISUAL_EVIDENCE_DIR && `${realpathSync(evidenceDir)}${sep}`.startsWith(`${realpathSync(root)}${sep}`)) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
if (!requested) throw Error("Fixed revision required");
if (mode !== "visual" && mode !== "visual-zh") throw Error(`Unsupported mode ${mode}; use visual|visual-zh`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const LANG = mode === "visual-zh" ? "zh" : "en";
const git = (args, options = {}) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 100 * 1024 * 1024, ...options });
const resolved = git(["rev-parse", "--verify", `${requested}^{commit}`]).trim();
const resolvedTree = git(["rev-parse", `${resolved}^{tree}`]).trim();
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
const dialogs = [];
const dialogPlan = [];
let lastCheckId = null;
const record = (name, value = {}) => {
  records.push({ name, ...value });
  if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 300));
};
let checks = 0;
let productChecks = 0;
const check = (id, condition, details = {}, kind = "product") => {
  const pass = Boolean(condition);
  checks += 1;
  if (kind === "product") productChecks += 1;
  lastCheckId = id;
  record("check", { ...details, id, kind, pass });
  if (!pass) throw Object.assign(new Error(`${kind === "precondition" ? "PRECONDITION: " : "PRODUCT CHECK FAILED: "}${id}`), { checkId: id, checkKind: kind });
};
const pre = (id, condition, details = {}) => check(id, condition, details, "precondition");
/** Recorded like a product check but does not stop the run; any deferred failure fails the run at the end. */
const deferredFailures = [];
const checkDeferred = (id, condition, details = {}) => {
  const pass = Boolean(condition);
  checks += 1;
  productChecks += 1;
  lastCheckId = id;
  record("check", { ...(pass ? {} : details), id, kind: "product", deferred: true, pass });
  if (!pass) deferredFailures.push(id);
  return pass;
};

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const FIXTURE = "native-visual-fixed.tsx";
const fixtureSource = readFileSync(join(output, FIXTURE), "utf8");
const fixtureSha256 = sha256(fixtureSource);
const E4_LOG = "native-f359be6-before1-h10.log";
const e4Raw = readFileSync(join(output, E4_LOG));
const e4Sha256 = sha256(e4Raw);
const e4Records = e4Raw.toString("utf8").trim().split("\n").map((line) => JSON.parse(line));
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
const fixedDelta = git(["diff", "--name-only", beforeResolved, resolved, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]).trim().split("\n").filter(Boolean);
const versionOf = (name) => {
  try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
};
const FEATURES_PACKAGE = "packages/xai-web-settings-features-panel/";
const FEATURES_CSS = "packages/xai-web-settings-features-panel/src/styles.css";

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-features-visual-")));
const profile = join(directory, "profile");
const servers = [];
let session = null;

// ---------------------------------------------------------------------------------------------------
// Static stylesheet audit: f359be6..fixed may only ADD selectors under .features-pane
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
const SCOPED = /^\.features-pane(?![\w-])/;

// ---------------------------------------------------------------------------------------------------
// Archive preparation and bundling (one bundle per archive, same fixture, same language constant)
// ---------------------------------------------------------------------------------------------------
const REQUIRED = [
  "packages/xai-web-settings-features-panel/src/FeaturesPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresPane.tsx",
  "packages/xai-web-settings-features-panel/src/styles.css",
  "packages/plugin-web-settings-shell/src/Toggle.tsx",
  "packages/plugin-web-settings-shell/src/SectionBlock.tsx",
  "packages/plugin-web-settings-shell/src/styles.css",
  "packages/plugin-web-tokens/src/tokens.css",
  "packages/plugin-web-tokens/src/layout.css",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts",
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/settingsDeparture.ts",
  "apps/web/src/routes/modules/settingsPaneComposition.ts",
  "apps/web/src/styles/global.css",
];
const FIXED_ONLY = [
  "packages/xai-web-settings-features-panel/src/internal/featuresRecovery.ts",
  "packages/xai-web-settings-features-panel/src/internal/featuresRecoveryCopy.ts",
];
async function prepare(revision, label) {
  const folder = join(directory, label);
  mkdirSync(folder);
  execFileSync("tar", ["-x", "-C", folder], { input: execFileSync("git", ["archive", revision], { cwd: root, maxBuffer: 300 * 1024 * 1024 }) });
  const extractedLock = readFileSync(join(folder, "pnpm-lock.yaml"));
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
  const forbiddenRoots = [...new Set([dependencyRoot, root].map((base) => realpathSync(base)))]
    .flatMap((base) => ["packages", "apps", "docs"].map((tree) => join(base, tree) + sep));
  const guardViolations = [];
  const pinned = [];
  const archiveModules = new Set();
  const archiveRoot = folder + sep;
  const pinAndGuard = { name: "features-visual-archive-pin-guard", setup(buildApi) {
    buildApi.onResolve({ filter: /^@repo\// }, (args) => {
      const parts = args.path.split("/");
      const entry = aliases.get(parts.slice(0, 2).join("/"));
      if (!entry) throw Error(`Unknown workspace package ${args.path}`);
      const sub = parts.length > 2 ? `./${parts.slice(2).join("/")}` : ".";
      let target = entry.pkg.exports?.[sub];
      if (target && typeof target === "object") target = target.import ?? target.default;
      if (typeof target !== "string") throw Error(`Unresolved pinned export ${args.path}`);
      pinned.push(args.path);
      return { path: join(entry.folder, target) };
    });
    buildApi.onLoad({ filter: /.*/ }, (args) => {
      const file = args.path;
      if (file.startsWith(archiveRoot) && !file.includes(`${sep}node_modules${sep}`)) archiveModules.add(relative(folder, file));
      if (!file.includes(`${sep}node_modules${sep}`) && forbiddenRoots.some((base) => file.startsWith(base))) {
        guardViolations.push(file);
        throw Error(`Guard: module loaded from a checkout instead of the archive: ${file}`);
      }
      return undefined;
    });
  } };
  const built = await esbuild.build({
    stdin: { contents: fixtureSource, resolveDir: folder, loader: "tsx", sourcefile: FIXTURE },
    absWorkingDir: folder,
    plugins: [pinAndGuard],
    nodePaths: [join(dependencyRoot, "apps/web/node_modules")],
    loader: { ".png": "dataurl", ".svg": "dataurl", ".woff2": "dataurl", ".woff": "dataurl" },
    bundle: true, format: "esm", platform: "browser", write: false, metafile: true, logLevel: "silent",
    outfile: join(directory, `${label}-bundle.js`),
    define: { "import.meta.env": "{}", __FEATURES_VISUAL_LANG__: JSON.stringify(LANG) },
  });
  const js = built.outputFiles.find((file) => file.path.endsWith(".js")).text;
  const css = built.outputFiles.find((file) => file.path.endsWith(".css")).text;
  const inputs = Object.keys(built.metafile.inputs);
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  // esbuild pseudo-inputs such as `<define:import.meta.env>` and `<stdin>` are not files.
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && !input.startsWith("<") && !input.includes("node_modules/") && input !== FIXTURE);
  const required = label === "fixed" ? [...REQUIRED, ...FIXED_ONLY] : REQUIRED;
  const missing = required.filter((file) => !inputs.includes(file));
  return {
    label, revision, folder, js, css, extractedLockSha256: sha256(extractedLock), archiveInputs,
    requiredSha256: Object.fromEntries(required.map((file) => [file, existsSync(join(folder, file)) ? sha256(readFileSync(join(folder, file))) : null])),
    inputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign, missingRequired: missing },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinned.length, archiveModulesLoaded: archiveModules.size },
    bundleSha256: sha256(js), bundleCssSha256: sha256(css),
    cssMarkers: {
      featuresGrid: css.includes(".features-grid"), toggle: css.includes(".module-settings .toggle"), departureDialog: css.includes(".settings-departure-dialog"),
      featuresRecovery: css.includes(".features-recovery-field"), paneScopedGrid: css.includes(".features-pane .features-grid"),
    },
  };
}
function serve(bundle) {
  const appPage = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>XAI Web (Features visual, ${bundle.label})</title><link rel="stylesheet" href="/__native/bundle.css"></head><body><div id="root"></div><script type="module" src="/__native/bundle.js"></script></body></html>`;
  const seedPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>seed</title></head><body><p>seed page: no product code</p></body></html>';
  const served = {};
  const server = createServer((request, response) => {
    const path = new URL(request.url, "http://127.0.0.1").pathname;
    const category = path.startsWith("/__native/") || path === "/seed" || path === "/favicon.ico" ? path : "app-document";
    served[category] = (served[category] ?? 0) + 1;
    response.setHeader("Cache-Control", "no-store");
    if (path === "/__native/bundle.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(bundle.js); return; }
    if (path === "/__native/bundle.css") { response.setHeader("Content-Type", "text/css; charset=utf-8"); response.end(bundle.css); return; }
    if (path === "/favicon.ico") { response.statusCode = 204; response.end(); return; }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(path === "/seed" ? seedPage : appPage);
  });
  servers.push({ server, served, label: bundle.label });
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
    "--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1",
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
      const plan = dialogPlan.shift() ?? null;
      // An unplanned beforeunload prompt is accepted (never hangs a navigation); any unplanned dialog is recorded.
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
// Expected surface (contract §2 and §5 wording; independent of the fixture's vocabulary)
// ---------------------------------------------------------------------------------------------------
const IDS = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "habits", "meditation"];
const keyOf = (id) => `xai_pref_features_${id}`;
const FEATURE_KEYS = IDS.map(keyOf);
const T = LANG === "zh" ? {
  title: "功能",
  labels: { tasks: "任务", board: "项目板", dashboard: "工作台", calendar: "日历", matrix: "四象限", pomodoro: "番茄钟", habits: "习惯", meditation: "冥想" },
  retry: "重试", discard: "放弃", reload: "重新读取", exportDraft: "导出功能草稿", discardAll: "放弃全部更改", reset: "恢复默认",
  notSaved: (label) => `${label}未保存。`,
  notReset: (label) => `${label}未恢复默认。`,
  unavailable: (label) => `已保存的${label}不可用。请重新读取；这不是新的未保存更改。`,
  saved: "功能设置已保存。", restored: "已恢复默认设置。",
  confirm: "将全部 8 个模块恢复为开启？这只改变显示哪些模块，数据会保留。",
  dialog: { label: "未保存的功能草稿", text: "功能有未保存的更改。", buttons: ["留下", "导出当前草稿", "放弃本地更改并离开"] },
  pet: "桌宠",
} : {
  title: "Features",
  labels: { tasks: "Tasks", board: "Boards", dashboard: "Dashboard", calendar: "Calendar", matrix: "Matrix", pomodoro: "Pomodoro", habits: "Habits", meditation: "Meditation" },
  retry: "Retry", discard: "Discard", reload: "Reload", exportDraft: "Export Features draft", discardAll: "Discard all changes", reset: "Reset to defaults",
  notSaved: (label) => `${label} was not saved.`,
  notReset: (label) => `${label} was not reset to its default.`,
  unavailable: (label) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
  saved: "Features settings saved.", restored: "Defaults restored.",
  confirm: "Turn all 8 modules back on? This only changes which modules are shown; your data is kept.",
  dialog: { label: "Unsaved Features draft", text: "Features has unsaved changes.", buttons: ["Stay", "Export current draft", "Discard local changes and leave"] },
  pet: "Pet",
};
const failedEntry = (id, message = T.notSaved) => ({ id, text: message(T.labels[id]), role: "alert", buttons: [`${T.retry} ${T.labels[id]}`, `${T.discard} ${T.labels[id]}`], visibleButtons: [T.retry, T.discard] });
const sourceEntry = (id) => ({ id, text: T.unavailable(T.labels[id]), role: "alert", buttons: [`${T.reload} ${T.labels[id]}`], visibleButtons: [T.reload] });
const ACTIONS = { buttons: [T.exportDraft, T.discardAll], alert: null };
const SWITCHES = IDS.map((id) => `switch:${id}`);
const CLEAN = [...SWITCHES, "reset"];
const BEFORE_CLEAN = [...SWITCHES, "footer:reset", "footer:save"];
const withRecovery = (unresolved) => IDS.flatMap((id) => (unresolved.includes(id) ? [`switch:${id}`, `retry:${id}`, `discard:${id}`] : [`switch:${id}`]));
const ALL8 = [...withRecovery(IDS), "export", "discard-all", "reset"];
const PARTIAL_IDS = ["calendar", "habits"];
const PARTIAL = [...withRecovery(PARTIAL_IDS), "export", "discard-all", "reset"];
const SOURCE_ID = "matrix";
const RELOAD = [...IDS.flatMap((id) => (id === SOURCE_ID ? [`switch:${id}`, `reload:${id}`] : [`switch:${id}`])), "reset"];
const DIALOG_ACTIONS = ["dialog:stay", "dialog:export", "dialog:discard-leave"];
const isTarget44 = (desc) => /^(retry|discard|reload):/.test(desc) || desc === "export" || desc === "discard-all" || desc === "reset" || desc.startsWith("dialog:");
const WIDTHS = [375, 414, 768, 1024, 1440];
const HEIGHTS = { 375: 812, 414: 896, 768: 1024, 1024: 768, 1440: 900 };
const KEYBOARD_WIDTH = LANG === "zh" ? 375 : 1024;
const OWNER = "features-visual-A";
const MARKER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:committed-generation`;
const MARKER = JSON.stringify({ generation: "g1", migrationId: "features-visual", previous: null });
const BASE_SEED = { [MARKER_KEY]: MARKER, xai_pref_lang: JSON.stringify(LANG) };
const allOf = (value) => Object.fromEntries(IDS.map((id) => [id, value]));
const APP_READY = `(() => !!window.verify && document.querySelector('.settings-detail')?.getAttribute('data-pane') === 'features' && document.querySelectorAll('.features-pane [data-feature-id] [role="switch"]').length === 8 && !document.querySelector('.account-data-gate') && verify.scope().kind === 'account')()`;

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
const applyViewport = (width, height = HEIGHTS[width]) =>
  cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 414 });
let currentWidth = 1440;
async function setViewport(width, height = HEIGHTS[width]) {
  await applyViewport(width, height);
  currentWidth = width;
  const settled = await settle();
  const viewport = await evaluate("({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio })");
  pre(`viewport:${width}x${height}`, viewport.width === width && viewport.height === height && viewport.dpr === 1, { viewport, settled });
  return { viewport, settled };
}
/** Product-free seed page: exact localStorage contents for the origin (cleared first). */
async function seed(origin, entries, label) {
  await cdp("Page.navigate", { url: `${origin}/seed` });
  pre(`${label}:seed-page-without-product-code`, await waitUntil("document.readyState === 'complete' && location.pathname === '/seed' && !window.verify", 10000));
  const stored = await evaluate(`(() => { localStorage.clear(); const seeds = ${JSON.stringify(entries)}; for (const [key, value] of Object.entries(seeds)) localStorage.setItem(key, value); return Object.fromEntries(Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)])); })()`);
  pre(`${label}:seeded-exact-bytes`, isDeepStrictEqual(stored, entries), { stored });
}
async function mountApp(origin, label) {
  const errorsBefore = runtimeErrors.length;
  await cdp("Page.navigate", { url: `${origin}/app/settings/features` });
  const ready = await waitUntil(APP_READY, 20000);
  if (!ready) {
    const diagnostics = await evaluate("({ path: location.pathname, text: (document.body.innerText || '').slice(0, 300), verify: !!window.verify })").catch((error) => ({ error: String(error) }));
    pre(`${label}:production-app-mounted-features-pane`, false, { diagnostics, runtimeErrors: runtimeErrors.slice(errorsBefore, errorsBefore + 5) });
  }
  await delay(500);
  await settle();
  const facts = await evaluate("({ composition: verify.composition, instance: verify.instance, scope: verify.scope(), auth: verify.authCalls(), markerKey: verify.markerKey, title: verify.title(), lang: verify.lang, location: verify.location(), rail: document.querySelectorAll('.app-rail .rail-btn').length, sidebar: document.querySelectorAll('.settings-sidebar .list-row').length, pet: verify.pet() })");
  pre(`${label}:production-app-mounted-features-pane`, ready, { composition: facts.composition, instance: facts.instance });
  pre(`${label}:auth-session-served-by-real-provider-and-account-activated`, facts.composition === "production-app" && facts.auth.getSession >= 1 && facts.markerKey === MARKER_KEY
    && facts.scope.kind === "account" && facts.scope.accountId === OWNER && facts.scope.generation === "g1", { auth: facts.auth, scope: facts.scope });
  pre(`${label}:language-rendered-from-stored-preference`, facts.title === T.title && facts.lang === LANG, { title: facts.title });
  pre(`${label}:production-surfaces-present`, facts.rail > 0 && facts.sidebar > 0 && facts.location.pathname === "/app/settings/features", { rail: facts.rail, sidebar: facts.sidebar, location: facts.location });
  const exceptions = runtimeErrors.slice(errorsBefore).filter((entry) => entry.kind === "exception");
  pre(`${label}:no-uncaught-exception-at-mount`, exceptions.length === 0, { exceptions: exceptions.slice(0, 3) });
  return facts;
}
/** Turns the DesktopPet off through the product's own rail pet toggle (trusted click; the rail shows it at 1440 px). */
async function petOff(label) {
  const pet = await evaluate("verify.pet()");
  if (!pet.present) return { alreadyOff: true };
  const width = currentWidth;
  if (width !== 1440) await setViewport(1440);
  const point = await trustedClick(`rail:${T.pet}`);
  pre(`${label}:pet-turned-off-by-rail-toggle`, await waitUntil("!verify.pet().present", 4000), { point });
  if (width !== 1440) await setViewport(width);
  return { alreadyOff: false, point };
}
const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });
const screenshots = [];
async function saveShot(name, data, details) {
  const buffer = Buffer.from(data, "base64");
  writeFileSync(join(evidenceDir, name), buffer, { flag: "wx" });
  const entry = { file: name, sha256: sha256(buffer), bytes: buffer.length, png: pngSize(buffer), ...details };
  screenshots.push(entry);
  record("screenshot", entry);
  return entry;
}
/** Full-pane capture: pin the scroll container's scrollbar gutter (capture-only), grow the viewport height until no
 *  vertical scroll container around the pane overflows, require the pane layout to equal the realistic-viewport
 *  layout exactly (boxes, vertical offsets within the pane, grid tracks), clip to the .settings-detail band (full
 *  viewport width), then unpin, restore the realistic height and require the layout to be restored. */
async function captureTall(state, width) {
  const realistic = await evaluate("verify.captureGeometry()");
  const gutter = await evaluate("verify.pinScrollbarGutter()");
  let height = HEIGHTS[width];
  let loops = 0;
  for (; loops < 6; loops += 1) {
    const extra = await evaluate("verify.verticalOverflow()");
    if (extra <= 0) break;
    height = Math.min(7000, height + extra);
    await setViewport(width, height);
  }
  const captured = await evaluate("verify.captureGeometry()");
  pre(`capture:${width}-${state}:full-pane-capture-layout-equals-realistic-viewport`, isDeepStrictEqual(captured, realistic), { gutter, realistic, captured });
  const layout = await evaluate("verify.layout()");
  const top = Math.max(0, Math.floor(layout.detail.rect.top) - 8);
  const bottom = Math.min(height, Math.ceil(layout.detail.rect.bottom) + 8);
  const clip = { x: 0, y: top, width, height: bottom - top, scale: 1 };
  const shot = await cdp("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: false });
  const remainingOverflow = await evaluate("verify.verticalOverflow()");
  pre(`capture:${width}-${state}:gutter-unpinned`, await evaluate("verify.unpinScrollbarGutter()"));
  await setViewport(width);
  pre(`capture:${width}-${state}:realistic-layout-restored`, isDeepStrictEqual(await evaluate("verify.captureGeometry()"), realistic));
  return saveShot(`${prefix}-${width}-${state}.png`, shot.data, { state, width, viewportHeight: height, loops, clip, remainingOverflow, gutter, layoutEqualsRealisticViewport: true, comparedParts: realistic.parts.length });
}
async function captureViewport(state, width) {
  const shot = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  return saveShot(`${prefix}-${width}-${state}.png`, shot.data, { state, width, viewportHeight: HEIGHTS[width], clip: null });
}

// ---------------------------------------------------------------------------------------------------
// Per-width presentation checks
// ---------------------------------------------------------------------------------------------------
function compactProbe(probe) {
  const { desc, rect, centerHit, allHit, inViewport, inDetail, inDetailContent, inDialog, detailGap, overflow, centerTarget, hits, visible } = probe;
  return { desc, rect, centerHit, allHit, inViewport, inDetail, inDetailContent, inDialog, detailGap, overflow, ...(centerHit ? {} : { centerTarget }), ...(hits ? { hits } : {}), ...(visible ? {} : { visible }) };
}
function layoutChecks(id, layout, { dialog = false } = {}) {
  const document = layout.document;
  checkDeferred(`${id}:document-no-horizontal-scroll`, document.scrollWidth <= document.clientWidth && document.scrollX === 0, { document });
  checkDeferred(`${id}:detail-no-horizontal-scroll`, layout.detail && layout.detail.scrollWidth <= layout.detail.clientWidth && layout.detail.scrollLeft === 0, { detail: layout.detail });
  checkDeferred(`${id}:pane-no-horizontal-overflow`, layout.pane && layout.pane.scrollWidth <= layout.pane.clientWidth, { pane: layout.pane });
  checkDeferred(`${id}:section-block-and-grid-no-horizontal-overflow`, layout.block && layout.grid && layout.block.scrollWidth <= layout.block.clientWidth && layout.grid.scrollWidth <= layout.grid.clientWidth, { block: layout.block, grid: layout.grid });
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
    if (isTarget44(probe.desc) && probe.overflow.sw > probe.overflow.cw) failures.clipped.push({ desc: probe.desc, overflow: probe.overflow });
  }
  const failed = (list) => list.map((entry) => (typeof entry === "string" ? entry : entry.desc));
  checkDeferred(`${id}:every-control-found`, failures.found.length === 0, { missing: failures.found });
  checkDeferred(`${id}:center-and-inset-hit-test`, failures.hit.length === 0, { failed: failed(failures.hit), probes: probes.filter((probe) => failures.hit.includes(probe.desc)).map(compactProbe) });
  checkDeferred(`${id}:${dialog ? "inside-dialog-box" : "horizontally-inside-settings-detail"}`, failures.contained.length === 0, { failed: failures.contained, probes: probes.filter((probe) => failures.contained.includes(probe.desc)).map(compactProbe) });
  checkDeferred(`${id}:inside-viewport-after-scroll`, failures.viewport.length === 0, { failed: failures.viewport });
  checkDeferred(`${id}:visible`, failures.hidden.length === 0, { failed: failures.hidden });
  checkDeferred(`${id}:targets-at-least-44x44`, failures.small.length === 0, { failed: failures.small });
  checkDeferred(`${id}:no-clipped-text-in-targets`, failures.clipped.length === 0, { failed: failures.clipped });
  return failures;
}
function overlapChecks(id, report) {
  const offenders = report.filter((group) => group.overlaps.length > 0);
  checkDeferred(`${id}:no-overlap-between-sibling-parts`, offenders.length === 0, { offenders });
}
function textClipChecks(id, clips) {
  const clipped = clips.filter((entry) => entry.sw > entry.cw);
  checkDeferred(`${id}:card-recovery-status-and-dialog-text-not-clipped`, clipped.length === 0, { clipped });
}
const minTarget = (probes) => {
  const targets = probes.filter((probe) => probe.found && isTarget44(probe.desc));
  if (targets.length === 0) return null;
  return { width: Math.min(...targets.map((probe) => probe.rect.width)), height: Math.min(...targets.map((probe) => probe.rect.height)) };
};
const minDetailGap = (probes) => {
  const gaps = probes.filter((probe) => probe.found && probe.detailGap).flatMap((probe) => [probe.detailGap.left, probe.detailGap.right]);
  return gaps.length ? Math.min(...gaps) : null;
};
const switchShape = (entry) => ({ w: entry.w, h: entry.h, knob: entry.knob && { ...entry.knob, animations: undefined }, css: entry.css, className: entry.className, inCard: entry.inCard });
/** Compares the fixed pane with an f359be6 reference that DISPLAYS THE SAME SWITCH VALUES at the same width. */
function geometryChecks(id, current, before, { cardsEqual = false } = {}) {
  const states = (geometry) => geometry.switches.map((entry) => [entry.id, entry.checked]);
  pre(`${id}:f359be6-reference-displays-the-same-switch-values`, isDeepStrictEqual(states(current), states(before)), { current: states(current), before: states(before) });
  pre(`${id}:card-order-equals-featureIdOrder`, isDeepStrictEqual(current.order, IDS) && isDeepStrictEqual(before.order, IDS), { current: current.order, before: before.order });
  const narrowerTracks = current.tracks.length !== before.tracks.length || current.tracks.some((track, index) => !(track >= before.tracks[index] - 0.01));
  checkDeferred(`${id}:grid-tracks-not-narrower-than-f359be6`, !narrowerTracks, { current: current.tracks, before: before.tracks });
  const narrowerCards = current.cards.filter((card, index) => !(card.w >= before.cards[index].w - 0.01));
  checkDeferred(`${id}:cards-not-narrower-than-f359be6`, current.cards.length === 8 && narrowerCards.length === 0, { narrowerCards, before: before.cards.map((card) => card.w) });
  const smallerThumbs = current.cards.filter((card, index) => !(card.thumb.w >= before.cards[index].thumb.w - 0.01 && card.thumb.h >= before.cards[index].thumb.h - 0.01));
  checkDeferred(`${id}:thumbnails-not-smaller-than-f359be6`, smallerThumbs.length === 0, { smallerThumbs: smallerThumbs.map((card) => [card.id, card.thumb]) });
  checkDeferred(`${id}:card-box-css-unchanged`, isDeepStrictEqual(current.cards.map((card) => card.css), before.cards.map((card) => card.css)), { current: current.cards[0].css, before: before.cards[0].css });
  if (cardsEqual) {
    const differing = current.cards.filter((card, index) => !(Math.abs(card.w - before.cards[index].w) <= 0.01 && Math.abs(card.h - before.cards[index].h) <= 0.01));
    checkDeferred(`${id}:clean-card-boxes-equal-f359be6`, differing.length === 0, { differing: differing.map((card) => [card.id, card.w, card.h]), before: before.cards.map((card) => [card.id, card.w, card.h]) });
  }
  const switchDiffs = [];
  for (const entry of current.switches) {
    const reference = before.switches.find((candidate) => candidate.id === entry.id);
    if (!reference) { switchDiffs.push({ id: entry.id, reason: "no f359be6 switch" }); continue; }
    if (!isDeepStrictEqual(switchShape(entry), switchShape(reference))) switchDiffs.push({ id: entry.id, current: switchShape(entry), before: switchShape(reference) });
    if (entry.knob?.animations || reference.knob?.animations) switchDiffs.push({ id: entry.id, reason: "knob animation still running" });
  }
  checkDeferred(`${id}:switch-track-knob-and-card-alignment-equal-f359be6`, current.switches.length === 8 && switchDiffs.length === 0, { switchDiffs });
}
/** The frozen E4 H10 measurement shape (verify-native-before.mjs `measure`), from this run's layout and geometry. */
function e4Shape(layout, geometry, live) {
  return {
    detail: { left: layout.detail.rect.left, right: layout.detail.rect.right, width: layout.detail.rect.width, clientWidth: layout.detail.clientWidth, scrollWidth: layout.detail.scrollWidth, contentLeft: layout.detail.content.left, contentRight: layout.detail.content.right },
    pane: { left: layout.pane.rect.left, right: layout.pane.rect.right, width: layout.pane.rect.width, clientWidth: layout.pane.clientWidth, scrollWidth: layout.pane.scrollWidth },
    block: { clientWidth: layout.block.clientWidth, scrollWidth: layout.block.scrollWidth },
    grid: { left: layout.grid.rect.left, right: layout.grid.rect.right, width: layout.grid.rect.width, clientWidth: layout.grid.clientWidth, scrollWidth: layout.grid.scrollWidth, gridTemplateColumns: layout.grid.columns },
    cards: geometry.cards.map((card) => ({ id: card.id, left: card.left, right: card.right, width: card.w })),
    switches: live.map((entry) => ({ id: entry.id, left: entry.left, right: entry.right, width: entry.width })),
  };
}
function frozenE4Shape(id) {
  const layout = e4Records.find((entry) => entry.name === "observation" && entry.id === id)?.layout ?? null;
  if (!layout) return null;
  const block = layout.chain.find((entry) => entry.node.startsWith("div.setting-block"));
  return {
    detail: { left: layout.detail.left, right: layout.detail.right, width: layout.detail.width, clientWidth: layout.detail.clientWidth, scrollWidth: layout.detail.scrollWidth, contentLeft: layout.detail.contentLeft, contentRight: layout.detail.contentRight },
    pane: { left: layout.pane.left, right: layout.pane.right, width: layout.pane.width, clientWidth: layout.pane.clientWidth, scrollWidth: layout.pane.scrollWidth },
    block: { clientWidth: block.clientWidth, scrollWidth: block.scrollWidth },
    grid: { left: layout.grid.left, right: layout.grid.right, width: layout.grid.width, clientWidth: layout.grid.clientWidth, scrollWidth: layout.grid.scrollWidth, gridTemplateColumns: layout.grid.gridTemplateColumns },
    cards: layout.cards.map((card) => ({ id: card.id, left: card.left, right: card.right, width: card.width })),
    switches: layout.switches.map((entry) => ({ id: entry.id, left: entry.left, right: entry.right, width: entry.width })),
  };
}
const liveSwitchBoxes = () => evaluate(`[...document.querySelectorAll('.features-pane [data-feature-id] [role="switch"]')].map((element) => { const rect = element.getBoundingClientRect(); const r = (v) => Math.round(v * 100) / 100; return { id: element.closest('[data-feature-id]').getAttribute('data-feature-id'), left: r(rect.left), right: r(rect.right), width: r(rect.width) }; })`);
/** Default-position DesktopPet coverage (observation only; gated checks run with the pet off). */
async function petCoverage(label, width, list) {
  const pet = await evaluate("verify.pet()");
  const probes = await evaluate(`verify.probeAll(${JSON.stringify(list)})`);
  const covered = probes.filter((probe) => probe.found && !(probe.centerHit && probe.allHit)).map((probe) => ({ desc: probe.desc, centerTarget: probe.centerTarget, petHits: (probe.hits ?? []).filter((hit) => hit.hit.startsWith("pet:")).length, hits: probe.hits ?? null, rect: probe.rect }));
  const entry = { id: `${label}:${width}:pet-on-default-position`, width, pet, controls: probes.length, notFullyHit: covered, coveredByPet: covered.filter((item) => item.petHits > 0 || item.centerTarget.startsWith("pet:")).map((item) => item.desc) };
  record("observation", entry);
  // Frozen reproduction of the default-position coverage: the last probed control (the pane's last action) is in view.
  if (width === 768) entry.screenshot = (await captureViewport(label === "before" ? "pet-on-before-f359be6-clean" : "pet-on-clean", width)).file;
  return entry;
}

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
let harnessError = null;
const summary = [];
const petObservations = [];
const geometryTable = [];
try {
  const before = await prepare(beforeResolved, "before");
  const fixed = await prepare(resolved, "fixed");
  // Every bundled archive module outside the Features package is byte-identical in both archives.
  const outsideDrift = fixed.archiveInputs.filter((file) => !file.startsWith(FEATURES_PACKAGE)).filter((file) => {
    const other = join(before.folder, file);
    return !existsSync(other) || sha256(readFileSync(other)) !== sha256(readFileSync(join(fixed.folder, file)));
  });
  const beforeOrigin = await serve(before);
  const fixedOrigin = await serve(fixed);

  session = await launch();
  await cdp("Runtime.enable");
  await cdp("Page.enable");
  await applyViewport(1440, 900);
  await cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  await cdp("Page.bringToFront");
  const version = await cdp("Browser.getVersion");

  // Static stylesheet audit -------------------------------------------------------------------------
  const cssFiles = git(["diff", "--name-only", beforeResolved, resolved, "--", "*.css"]).trim().split("\n").filter(Boolean);
  const cssDiff = git(["diff", "--unified=0", "--no-color", beforeResolved, resolved, "--", "*.css"]);
  const diffLines = cssDiff.split("\n");
  const added = diffLines.filter((line) => line.startsWith("+") && !line.startsWith("+++")).map((line) => line.slice(1));
  const removed = diffLines.filter((line) => line.startsWith("-") && !line.startsWith("---"));
  const hunks = diffLines.filter((line) => line.startsWith("@@"));
  const parsed = cssPreludes(added.join("\n"));
  const unscoped = parsed.selectors.filter((entry) => !SCOPED.test(entry.selector));
  const beforeCss = git(["show", `${beforeResolved}:${FEATURES_CSS}`]);
  const fixedCss = git(["show", `${resolved}:${FEATURES_CSS}`]);
  const shellDelta = git(["diff", "--name-only", beforeResolved, resolved, "--", "packages/plugin-web-settings-shell", "packages/plugin-web-tokens", "apps/web/src/styles"]).trim();
  record("baseline", {
    requested, resolved, resolvedTree, before: { requested: BEFORE, resolved: beforeResolved }, docsHead, productDeltaVsDocsHead: productDelta, fixedDeltaVsBefore: fixedDelta,
    mode, lang: LANG, suffix, composition: "production-app",
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { fixedArchive: sha256(fixedLock), beforeArchive: sha256(beforeLock), dependencies: sha256(dependencyLock), fixedExtracted: fixed.extractedLockSha256, beforeExtracted: before.extractedLockSha256 },
    fileSha256: { "verify-visual-fixed.mjs": runnerSha256, [FIXTURE]: fixtureSha256, [`${E4_LOG} (read-only geometry reference)`]: e4Sha256 },
    bundles: Object.fromEntries([before, fixed].map((bundle) => [bundle.label, { revision: bundle.revision, bundleSha256: bundle.bundleSha256, bundleCssSha256: bundle.bundleCssSha256, inputs: bundle.inputs, guard: bundle.guard, cssMarkers: bundle.cssMarkers }])),
    requiredModulesSha256: { before: before.requiredSha256, fixed: fixed.requiredSha256 },
    outsideFeaturesPackageDrift: outsideDrift,
    sizes: HEIGHTS, keyboardWidth: KEYBOARD_WIDTH, evidenceInRepository: evidenceDir === output, origin: "127.0.0.1 (two ephemeral ports); every other host resolves to NOTFOUND",
  });
  pre("baseline:docs-head-product-tree-equals-fixed", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate-both-archives", sha256(dependencyLock) === sha256(fixedLock) && sha256(dependencyLock) === sha256(beforeLock) && fixed.extractedLockSha256 === sha256(fixedLock) && before.extractedLockSha256 === sha256(beforeLock));
  pre("baseline:guard-no-module-from-a-checkout", before.guard.violations.length === 0 && fixed.guard.violations.length === 0 && before.inputs.foreign.length === 0 && fixed.inputs.foreign.length === 0, { before: before.guard.violations, fixed: fixed.guard.violations });
  pre("baseline:every-required-module-bundled-from-archive", before.inputs.missingRequired.length === 0 && fixed.inputs.missingRequired.length === 0, { before: before.inputs.missingRequired, fixed: fixed.inputs.missingRequired });
  pre("baseline:fixed-delta-only-in-features-package", fixedDelta.length > 0 && fixedDelta.every((file) => file.startsWith(FEATURES_PACKAGE)), { fixedDelta });
  pre("baseline:bundled-modules-outside-features-byte-identical-to-f359be6", outsideDrift.length === 0, { outsideDrift });
  pre("baseline:product-css-in-bundles", before.cssMarkers.featuresGrid && before.cssMarkers.toggle && before.cssMarkers.departureDialog && !before.cssMarkers.featuresRecovery && fixed.cssMarkers.featuresGrid && fixed.cssMarkers.toggle && fixed.cssMarkers.departureDialog && fixed.cssMarkers.featuresRecovery && fixed.cssMarkers.paneScopedGrid, { before: before.cssMarkers, fixed: fixed.cssMarkers });
  record("css-diff", {
    cssFiles, hunks, addedLines: added.length, removedLines: removed.length, atRules: parsed.atRules,
    selectors: parsed.selectors.map((entry) => (entry.within.length ? `${entry.within.join(" ")} ${entry.selector}` : entry.selector)),
    distinctSelectors: [...new Set(parsed.selectors.map((entry) => entry.selector))], balanced: parsed.balanced, nested: parsed.nested,
    beforeStylesheetSha256: sha256(beforeCss), fixedStylesheetSha256: sha256(fixedCss),
  });
  pre("css:diff-parse-balanced", parsed.balanced && parsed.nested === 0 && parsed.selectors.length > 0, { balanced: parsed.balanced, nested: parsed.nested });
  check("css:only-the-features-stylesheet-changed", isDeepStrictEqual(cssFiles, [FEATURES_CSS]), { cssFiles });
  check("css:additions-only-no-line-removed", removed.length === 0, { removed: removed.slice(0, 10) });
  check("css:existing-rules-byte-unchanged-fixed-stylesheet-extends-f359be6", fixedCss.startsWith(beforeCss) && fixedCss.length > beforeCss.length, { beforeLength: beforeCss.length, fixedLength: fixedCss.length });
  check("css:every-new-selector-scoped-under-features-pane", unscoped.length === 0, { unscoped });
  check("css:at-rules-are-media-only", parsed.atRules.every((rule) => rule.startsWith("@media")), { atRules: parsed.atRules });
  check("css:shell-toggle-pane-footer-tokens-and-global-styles-unchanged", shellDelta === "", { shellDelta });

  // =============================================================================================
  // Phase B: f359be6 (clean, fresh mount per width; then all eight off as a state-matched reference)
  // =============================================================================================
  const beforeClean = {};
  for (const width of WIDTHS) {
    await applyViewport(width);
    currentWidth = width;
    await seed(beforeOrigin, BASE_SEED, `before:${width}`);
    await mountApp(beforeOrigin, `before:${width}`);
    if (width === WIDTHS[0]) {
      const probe = await evaluate("verify.probeStorage()");
      pre("before:storage-injector-fires", probe.logged === 1 && probe.last?.op === "get", { probe });
    }
    const layout = await evaluate("verify.layout()");
    const geometry = await evaluate("verify.geometry()");
    const live = await liveSwitchBoxes();
    const controls = await evaluate("verify.paneControls()");
    pre(`before:${width}:clean-pane-controls`, isDeepStrictEqual(controls.map((entry) => entry.desc), BEFORE_CLEAN), { controls });
    if (width === 375 || width === 1440) {
      const frozenId = width === 375 ? `h10:375-${LANG}:layout` : "h10:1440-en-control:layout";
      const frozen = LANG === "en" || width === 375 ? frozenE4Shape(frozenId) : null;
      const current = e4Shape(layout, geometry, live);
      record("observation", { id: `before:${width}:frozen-e4-comparison`, frozenId: frozen ? frozenId : null, current, frozen });
      if (frozen) pre(`before:${width}:reproduces-frozen-e4-h10-geometry`, isDeepStrictEqual(current, frozen), { current, frozen });
      if (width === 375) pre("before:375:h10-overflow-reproduced-positive-control", layout.pane.scrollWidth - layout.pane.clientWidth === 4 && layout.grid.columns === "280px", { pane: layout.pane, grid: layout.grid });
    }
    petObservations.push({ product: "f359be6", ...(await petCoverage("before", width, BEFORE_CLEAN)) });
    await petOff(`before:${width}`);
    beforeClean[width] = { layout: await evaluate("verify.layout()"), geometry: await evaluate("verify.geometry()") };
    const probes = await evaluate(`verify.probeAll(${JSON.stringify(BEFORE_CLEAN)})`);
    record("before-width", { state: "clean", width, height: HEIGHTS[width], geometry: beforeClean[width].geometry, layout: beforeClean[width].layout, probes: probes.map(compactProbe) });
    geometryTable.push({ product: "f359be6", state: "clean", width, tracks: beforeClean[width].geometry.tracks, cardWidth: beforeClean[width].geometry.cards[0].w, cardHeights: beforeClean[width].geometry.cards.map((card) => card.h), pane: [beforeClean[width].layout.pane.clientWidth, beforeClean[width].layout.pane.scrollWidth], block: [beforeClean[width].layout.block.clientWidth, beforeClean[width].layout.block.scrollWidth, beforeClean[width].layout.block.paddingLeft], grid: [beforeClean[width].layout.grid.clientWidth, beforeClean[width].layout.grid.scrollWidth], detail: [beforeClean[width].layout.detail.clientWidth, beforeClean[width].layout.detail.scrollWidth] });
    if (width === 375) await captureTall("before-f359be6-clean", width);
  }
  // State-matched reference: all eight off (the before product writes synchronously in its own origin).
  const beforeOff = {};
  {
    await setViewport(1440);
    for (const id of IDS) await trustedClick(`switch:${id}`);
    await settle();
    const displayed = await evaluate("verify.displayed()");
    pre("before-off:displays-all-eight-off", isDeepStrictEqual(displayed, allOf("false")), { displayed });
    for (const width of WIDTHS) {
      await setViewport(width);
      beforeOff[width] = await evaluate("verify.geometry()");
      record("before-width", { state: "all-off", width, height: HEIGHTS[width], geometry: beforeOff[width] });
    }
  }

  // =============================================================================================
  // Phase F1: fixed, clean (fresh mount per width): zero mount writes, geometry vs f359be6, every control
  // =============================================================================================
  for (const width of WIDTHS) {
    await applyViewport(width);
    currentWidth = width;
    await seed(fixedOrigin, BASE_SEED, `fixed:${width}`);
    await mountApp(fixedOrigin, `fixed:${width}`);
    if (width === WIDTHS[0]) {
      const probe = await evaluate("verify.probeStorage()");
      pre("fixed:storage-injector-fires", probe.logged === 1 && probe.last?.op === "get", { probe });
    }
    const mountMutations = (await evaluate("verify.attemptsAfter(0)")).filter((entry) => entry.op !== "get" && FEATURE_KEYS.includes(entry.key));
    checkDeferred(`clean:${width}:mount-zero-features-writes`, mountMutations.length === 0, { mountMutations });
    const controls = await evaluate("verify.paneControls()");
    checkDeferred(`clean:${width}:pane-controls-in-dom-order`, isDeepStrictEqual(controls.map((entry) => entry.desc), CLEAN), { controls: controls.map((entry) => entry.desc) });
    checkDeferred(`clean:${width}:no-save-footer-reset-label-kept-no-status-claim`, (await evaluate("verify.saveFooter()")) === false && isDeepStrictEqual(await evaluate("verify.resetButtons()"), [T.reset]) && (await evaluate("verify.status()")) === "", { status: await evaluate("verify.status()") });
    petObservations.push({ product: "fixed", ...(await petCoverage("fixed", width, CLEAN)) });
    await petOff(`fixed:${width}`);
    const geometry = await evaluate("verify.geometry()");
    const layout = await evaluate("verify.layout()");
    geometryChecks(`clean:${width}`, geometry, beforeClean[width].geometry, { cardsEqual: true });
    const probes = await evaluate(`verify.probeAll(${JSON.stringify(CLEAN)})`);
    const failures = probeChecks(`clean:${width}`, probes);
    layoutChecks(`clean:${width}`, layout);
    checkDeferred(`clean:${width}:cards-inside-detail-content-box`, geometry.cards.every((card) => card.left >= layout.detail.content.left - 0.01 && card.right <= layout.detail.content.right + 0.01), { cards: geometry.cards.map((card) => [card.id, card.left, card.right]), content: layout.detail.content });
    overlapChecks(`clean:${width}`, await evaluate("verify.overlapReport()"));
    textClipChecks(`clean:${width}`, await evaluate("verify.textClip()"));
    record("width", { state: "clean", width, height: HEIGHTS[width], geometry, layout, probes: probes.map(compactProbe) });
    summary.push({ state: "clean", width, controls: probes.length, failures, minTarget: minTarget(probes), minDetailGap: minDetailGap(probes), document: [layout.document.scrollWidth, layout.document.clientWidth], detail: [layout.detail.scrollWidth, layout.detail.clientWidth], pane: [layout.pane.scrollWidth, layout.pane.clientWidth] });
    geometryTable.push({ product: "fixed", state: "clean", width, tracks: geometry.tracks, cardWidth: geometry.cards[0].w, cardHeights: geometry.cards.map((card) => card.h), pane: [layout.pane.clientWidth, layout.pane.scrollWidth], block: [layout.block.clientWidth, layout.block.scrollWidth, layout.block.paddingLeft], grid: [layout.grid.clientWidth, layout.grid.scrollWidth], detail: [layout.detail.clientWidth, layout.detail.scrollWidth] });
    if (width === 375) await captureTall("clean", width);
  }

  // =============================================================================================
  // Phase F2: all eight fields unresolved (failed set drafts through trusted input), every control
  // =============================================================================================
  {
    await setViewport(1440);
    pre("all8:viewport-1440-pet-off", !(await evaluate("verify.pet()")).present);
    await evaluate("verify.denySet('all')");
    const start = await mark();
    for (const id of IDS) {
      await trustedClick(`switch:${id}`);
      pre(`all8:${id}-failed`, await waitUntil(`verify.recovery().some((entry) => entry.id === ${JSON.stringify(id)} && entry.text === ${JSON.stringify(T.notSaved(T.labels[id]))})`, 6000));
    }
    pre("all8:eight-blocks-and-pane-actions", await waitUntil("verify.recovery().length === 8 && !!verify.paneActions()", 6000));
    await settle();
    const recovery = await evaluate("verify.recovery()");
    const actions = await evaluate("verify.paneActions()");
    const writes = (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => entry.op === "set" || entry.op === "remove");
    const events = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type === "click");
    check("all8:eight-failed-recovery-blocks-exact-wording", isDeepStrictEqual(recovery, IDS.map((id) => failedEntry(id))), { recovery });
    check("all8:pane-actions-export-and-discard-all", isDeepStrictEqual(actions, ACTIONS), { actions });
    check("all8:displayed-drafts-aria-matches-visual", isDeepStrictEqual(await evaluate("verify.displayed()"), allOf("false")) && (await evaluate("verify.ariaVisualMismatches()")).length === 0, { displayed: await evaluate("verify.displayed()"), mismatches: await evaluate("verify.ariaVisualMismatches()") });
    check("all8:one-denied-write-per-field-bytes-unchanged", isDeepStrictEqual(writes.map((entry) => [entry.op, entry.key, entry.value, entry.outcome]), IDS.map((id) => ["set", keyOf(id), "false", "denied"])) && isDeepStrictEqual(await evaluate("verify.physical()"), allOf(null)), { writes });
    check("all8:no-saved-claim", (await evaluate("verify.status()")) === "", { status: await evaluate("verify.status()") });
    pre("all8:inputs-trusted", events.length === 8 && events.every((entry) => entry.trusted), { events });
    record("all8-state", { recovery, actions, writes, clicks: events.map((entry) => entry.target) });
  }
  for (const width of WIDTHS) {
    await setViewport(width);
    const controls = await evaluate("verify.paneControls()");
    checkDeferred(`all8:${width}:pane-controls-in-dom-order`, isDeepStrictEqual(controls.map((entry) => entry.desc), ALL8), { controls: controls.map((entry) => entry.desc) });
    const probes = await evaluate(`verify.probeAll(${JSON.stringify(ALL8)})`);
    const failures = probeChecks(`all8:${width}`, probes);
    const layout = await evaluate("verify.layout()");
    layoutChecks(`all8:${width}`, layout);
    const geometry = await evaluate("verify.geometry()");
    checkDeferred(`all8:${width}:cards-inside-detail-content-box`, geometry.cards.every((card) => card.left >= layout.detail.content.left - 0.01 && card.right <= layout.detail.content.right + 0.01), { cards: geometry.cards.map((card) => [card.id, card.left, card.right]), content: layout.detail.content });
    overlapChecks(`all8:${width}`, await evaluate("verify.overlapReport()"));
    textClipChecks(`all8:${width}`, await evaluate("verify.textClip()"));
    geometryChecks(`all8:${width}`, geometry, beforeOff[width]);
    record("width", { state: "all8", width, height: HEIGHTS[width], geometry, layout, probes: probes.map(compactProbe) });
    summary.push({ state: "all8", width, controls: probes.length, failures, minTarget: minTarget(probes), minDetailGap: minDetailGap(probes), document: [layout.document.scrollWidth, layout.document.clientWidth], detail: [layout.detail.scrollWidth, layout.detail.clientWidth], pane: [layout.pane.scrollWidth, layout.pane.clientWidth] });
    geometryTable.push({ product: "fixed", state: "all8", width, tracks: geometry.tracks, cardWidth: geometry.cards[0].w, referenceCardWidth: beforeOff[width].cards[0].w });
    await captureTall("all8", width);
  }

  // =============================================================================================
  // Phase F3: departure dialog over the all-eight state (trusted, hit-tested sidebar activation)
  // =============================================================================================
  {
    await setViewport(1440);
    const rows = await evaluate("verify.sidebarRows()");
    const index = rows.indexOf(`sidebar:${T.title}`);
    pre("dialog:features-row-present", index >= 0, { rows });
    const target = rows[index + 1] ?? rows[index - 1];
    const location = await evaluate("verify.location()");
    await trustedClick(target);
    pre("dialog:open", await waitUntil("verify.dialog() !== null", 4000));
    check("dialog:wording-and-features-guard-label", isDeepStrictEqual(await evaluate("verify.dialog()"), T.dialog), { dialog: await evaluate("verify.dialog()") });
    check("dialog:focus-enters-dialog", await waitUntil("verify.activeDesc() === 'dialog'", 3000), { active: await activeDesc() });
    check("dialog:route-held", isDeepStrictEqual(await evaluate("verify.location()"), location), { location: await evaluate("verify.location()") });
    await press("Tab");
    check("dialog:tab-to-first-action", (await activeDesc()) === "dialog:stay", { active: await activeDesc() });
    record("dialog-open", { via: target, location });
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
      summary.push({ state: "dialog", width, controls: probes.length, failures, minTarget: minTarget(probes), minDetailGap: null, document: [layout.document.scrollWidth, layout.document.clientWidth], detail: [layout.detail.scrollWidth, layout.detail.clientWidth], pane: [layout.pane.scrollWidth, layout.pane.clientWidth] });
      if (width === 375) await captureViewport("dialog", width);
    }
    await trustedClick("dialog:stay");
    pre("dialog:stay-closes", await waitUntil("verify.dialog() === null", 4000));
    check("dialog:stay-keeps-route-and-drafts", isDeepStrictEqual(await evaluate("verify.location()"), location) && (await evaluate("verify.recovery().length")) === 8, { location: await evaluate("verify.location()") });
  }

  // =============================================================================================
  // Phase F4: partial reset (Reset to defaults accepted over eight stored "false", removeItem denied on two keys)
  // =============================================================================================
  {
    let start = await mark();
    await trustedClick("discard-all");
    pre("partial:discard-all-clears", await waitUntil("verify.recovery().length === 0 && verify.paneActions() === null", 4000));
    check("partial:discard-all-zero-writes", (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => entry.op === "set" || entry.op === "remove").length === 0);
    await evaluate("verify.restore()");
    await setViewport(1440);
    await seed(fixedOrigin, { ...BASE_SEED, ...Object.fromEntries(FEATURE_KEYS.map((key) => [key, "false"])) }, "partial");
    await mountApp(fixedOrigin, "partial");
    await petOff("partial");
    pre("partial:displays-eight-stored-off", isDeepStrictEqual(await evaluate("verify.displayed()"), allOf("false")) && (await evaluate("verify.recovery().length")) === 0);
    await evaluate(`verify.denyRemove(${JSON.stringify(PARTIAL_IDS)})`);
    start = await mark();
    const dialogsBefore = dialogs.length;
    dialogPlan.push({ accept: true });
    await trustedClick("reset");
    pre("partial:confirmation-opened", await waitFor(() => dialogs.length > dialogsBefore, 6000));
    pre("partial:two-not-reset-blocks", await waitUntil(`verify.recovery().length === 2 && !!verify.paneActions() && verify.recovery().every((entry) => entry.role === "alert")`, 8000));
    await settle();
    const opened = dialogs.slice(dialogsBefore);
    const attempts = await evaluate(`verify.attemptsAfter(${start})`);
    const mutationsSeen = attempts.filter((entry) => entry.op === "set" || entry.op === "remove");
    const recovery = await evaluate("verify.recovery()");
    check("partial:one-confirmation-normative-text", opened.length === 1 && opened[0].type === "confirm" && opened[0].message === T.confirm, { opened });
    check("partial:one-remove-per-key-two-denied-no-write", isDeepStrictEqual(mutationsSeen.map((entry) => [entry.op, entry.key, entry.outcome]).sort(), FEATURE_KEYS.map((key) => ["remove", key, PARTIAL_IDS.map(keyOf).includes(key) ? "denied" : "ok"]).sort()), { mutations: mutationsSeen });
    check("partial:two-not-reset-blocks-exact-wording", isDeepStrictEqual(recovery, PARTIAL_IDS.map((id) => failedEntry(id, T.notReset))), { recovery });
    check("partial:bytes-and-display", isDeepStrictEqual(await evaluate("verify.physical()"), Object.fromEntries(IDS.map((id) => [id, PARTIAL_IDS.includes(id) ? "false" : null]))) && isDeepStrictEqual(await evaluate("verify.displayed()"), allOf("true")), { physical: await evaluate("verify.physical()"), displayed: await evaluate("verify.displayed()") });
    check("partial:no-defaults-restored-claim", (await evaluate("verify.status()")) === "" && isDeepStrictEqual(await evaluate("verify.paneActions()"), ACTIONS), { status: await evaluate("verify.status()") });
    record("partial-state", { recovery, mutations: mutationsSeen, opened });
  }
  for (const width of WIDTHS) {
    await setViewport(width);
    const controls = await evaluate("verify.paneControls()");
    checkDeferred(`partial:${width}:pane-controls-in-dom-order`, isDeepStrictEqual(controls.map((entry) => entry.desc), PARTIAL), { controls: controls.map((entry) => entry.desc) });
    const probes = await evaluate(`verify.probeAll(${JSON.stringify(PARTIAL)})`);
    const failures = probeChecks(`partial:${width}`, probes);
    const layout = await evaluate("verify.layout()");
    layoutChecks(`partial:${width}`, layout);
    const geometry = await evaluate("verify.geometry()");
    checkDeferred(`partial:${width}:cards-inside-detail-content-box`, geometry.cards.every((card) => card.left >= layout.detail.content.left - 0.01 && card.right <= layout.detail.content.right + 0.01), { content: layout.detail.content });
    overlapChecks(`partial:${width}`, await evaluate("verify.overlapReport()"));
    textClipChecks(`partial:${width}`, await evaluate("verify.textClip()"));
    geometryChecks(`partial:${width}`, geometry, beforeClean[width].geometry);
    record("width", { state: "partial", width, height: HEIGHTS[width], geometry, layout, probes: probes.map(compactProbe) });
    summary.push({ state: "partial", width, controls: probes.length, failures, minTarget: minTarget(probes), minDetailGap: minDetailGap(probes), document: [layout.document.scrollWidth, layout.document.clientWidth], detail: [layout.detail.scrollWidth, layout.detail.clientWidth], pane: [layout.pane.scrollWidth, layout.pane.clientWidth] });
    if (width === 375) await captureTall("partial", width);
  }

  // =============================================================================================
  // Phase F5: source-only Reload (malformed stored bytes for one field)
  // =============================================================================================
  {
    const start = await mark();
    await trustedClick("discard-all");
    pre("reload:discard-all-clears", await waitUntil("verify.recovery().length === 0 && verify.paneActions() === null", 4000));
    check("reload:discard-all-zero-writes", (await evaluate(`verify.attemptsAfter(${start})`)).filter((entry) => entry.op === "set" || entry.op === "remove").length === 0);
    await evaluate("verify.restore()");
    await setViewport(1440);
    await seed(fixedOrigin, { ...BASE_SEED, [keyOf(SOURCE_ID)]: "yes" }, "reload");
    await mountApp(fixedOrigin, "reload");
    await petOff("reload");
    check("reload:source-only-block-exact-wording", isDeepStrictEqual(await evaluate("verify.recovery()"), [sourceEntry(SOURCE_ID)]), { recovery: await evaluate("verify.recovery()") });
    check("reload:no-pane-actions-no-saved-claim-bytes-kept", (await evaluate("verify.paneActions()")) === null && (await evaluate("verify.status()")) === "" && (await evaluate("verify.physical()"))[SOURCE_ID] === "yes");
  }
  for (const width of WIDTHS) {
    await setViewport(width);
    const controls = await evaluate("verify.paneControls()");
    checkDeferred(`reload:${width}:pane-controls-in-dom-order`, isDeepStrictEqual(controls.map((entry) => entry.desc), RELOAD), { controls: controls.map((entry) => entry.desc) });
    const probes = await evaluate(`verify.probeAll(${JSON.stringify(RELOAD)})`);
    const failures = probeChecks(`reload:${width}`, probes);
    const layout = await evaluate("verify.layout()");
    layoutChecks(`reload:${width}`, layout);
    const geometry = await evaluate("verify.geometry()");
    overlapChecks(`reload:${width}`, await evaluate("verify.overlapReport()"));
    textClipChecks(`reload:${width}`, await evaluate("verify.textClip()"));
    geometryChecks(`reload:${width}`, geometry, beforeClean[width].geometry);
    record("width", { state: "reload", width, height: HEIGHTS[width], geometry, layout, probes: probes.map(compactProbe) });
    summary.push({ state: "reload", width, controls: probes.length, failures, minTarget: minTarget(probes), minDetailGap: minDetailGap(probes), document: [layout.document.scrollWidth, layout.document.clientWidth], detail: [layout.detail.scrollWidth, layout.detail.clientWidth], pane: [layout.pane.scrollWidth, layout.pane.clientWidth] });
    if (width === 375) await captureTall("reload", width);
  }

  // =============================================================================================
  // Phase K: keyboard at KEYBOARD_WIDTH (fresh document, clean bytes), trusted keys only
  // =============================================================================================
  await setViewport(KEYBOARD_WIDTH);
  await seed(fixedOrigin, BASE_SEED, "keyboard");
  await mountApp(fixedOrigin, "keyboard");
  await petOff("keyboard");
  await setViewport(KEYBOARD_WIDTH);
  const keyboard = { width: KEYBOARD_WIDTH };
  const focusOk = (focus) => focus.focusVisible === true && focus.outline?.style !== "none" && parseFloat(focus.outline?.width ?? "0") >= 1 && !/transparent|\/ 0\)|rgba\(0, 0, 0, 0\)/.test(focus.outline?.color ?? "") && focus.inViewport && focus.centerHit;
  /** Trusted Tab / Shift+Tab presses until `desc` is focused; the direction follows the pane's DOM order. */
  async function focusByTab(desc, limit = 140) {
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
  /** Trusted Tab walk after blurring the active element (Chrome keeps the blurred element as the sequential focus
   *  navigation starting point, which is recorded); returns the stops inside and outside the pane. */
  async function walkFromStart(limit = 200) {
    const startPoint = await activeDesc();
    await evaluate("verify.blurActive()");
    const walk = [];
    let entered = false;
    let presses = 0;
    for (; presses < limit; presses += 1) {
      await press("Tab");
      const focus = await evaluate("verify.focusInfo()");
      walk.push(focus);
      if (focus.inPane) entered = true;
      else if (entered) break;
    }
    return { startPoint, presses: presses + 1, outside: walk.filter((focus) => !focus.inPane).map((focus) => focus.desc), pane: walk.filter((focus) => focus.inPane), maxOverhang: Math.max(0, ...walk.map((focus) => focus.overhang ?? 0)) };
  }
  // K1: trusted Tab walk through the clean pane
  {
    const walk = await walkFromStart();
    const bad = walk.pane.filter((focus) => !focusOk(focus));
    check("keyboard:clean-tab-reaches-every-control-in-dom-order", isDeepStrictEqual(walk.pane.map((focus) => focus.desc), CLEAN), { sequence: walk.pane.map((focus) => focus.desc) });
    check("keyboard:clean-tab-focus-visible", bad.length === 0, { bad });
    record("keyboard-walk", { state: "clean", width: KEYBOARD_WIDTH, startPoint: walk.startPoint, presses: walk.presses, outside: walk.outside, pane: walk.pane, maxOverhang: walk.maxOverhang });
    keyboard.cleanWalk = { startPoint: walk.startPoint, presses: walk.presses, outsideStops: walk.outside.length, paneStops: walk.pane.length, maxOverhang: walk.maxOverhang };
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
  /** One trusted key activation of a switch; asserts exactly one operation and no scroll on Space. */
  async function activation(id, field, keyName, expected) {
    const desc = `switch:${field}`;
    await focusByTab(desc);
    await settle();
    const start = await mark();
    const scrollBefore = await evaluate("verify.scrollState()");
    const rectBefore = (await evaluate(`verify.probe(${JSON.stringify(desc)}, false)`)).rect;
    await press(keyName);
    const settledExpression = expected.denied
      ? `verify.recovery().some((entry) => entry.id === ${JSON.stringify(field)} && entry.text === ${JSON.stringify(T.notSaved(T.labels[field]))})`
      : `verify.physical()[${JSON.stringify(field)}] === ${JSON.stringify(expected.bytes)} && !verify.recovery().some((entry) => entry.id === ${JSON.stringify(field)})`;
    const settled = await waitUntil(settledExpression, 6000);
    await delay(300);
    const events = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type !== "focusin");
    const all = await evaluate(`verify.attemptsAfter(${start})`);
    const writes = all.filter((entry) => (entry.op === "set" || entry.op === "remove") && entry.key === keyOf(field));
    const otherWrites = all.filter((entry) => (entry.op === "set" || entry.op === "remove") && entry.key !== keyOf(field));
    const scrollAfter = await evaluate("verify.scrollState()");
    const rectAfter = (await evaluate(`verify.probe(${JSON.stringify(desc)}, false)`)).rect;
    const displayed = await evaluate("verify.displayed()");
    const ariaVisualMismatches = await evaluate("verify.ariaVisualMismatches()");
    const physical = await evaluate("verify.physical()");
    const keyValue = KEYS[keyName].key;
    const keydowns = events.filter((entry) => entry.type === "keydown" && entry.key === keyValue);
    const keyups = events.filter((entry) => entry.type === "keyup" && entry.key === keyValue);
    const clicks = events.filter((entry) => entry.type === "click");
    const result = { id, desc, key: keyName, settled, keydowns: keydowns.length, keyups: keyups.length, clicks: clicks.map((entry) => [entry.target, entry.trusted]), writes: writes.map((entry) => [entry.op, entry.value, entry.outcome]), otherWrites: otherWrites.map((entry) => [entry.op, entry.key]), displayed, ariaVisualMismatches, physical, scrollBefore, scrollAfter, rectBefore, rectAfter, active: await activeDesc() };
    record("keyboard-activation", result);
    check(`keyboard:${id}:settled`, settled, result);
    check(`keyboard:${id}:one-trusted-key-one-trusted-click`, keydowns.length === 1 && keyups.length === 1 && keydowns.every((entry) => entry.trusted && entry.target === desc) && clicks.length === 1 && clicks[0].trusted && clicks[0].target === desc, result);
    check(`keyboard:${id}:exactly-one-operation`, writes.length === 1 && writes[0].op === "set" && writes[0].value === expected.bytes && writes[0].outcome === (expected.denied ? "denied" : "ok") && otherWrites.length === 0, result);
    check(`keyboard:${id}:aria-checked-reflects-displayed-draft`, displayed[field] === expected.bytes && ariaVisualMismatches.length === 0, result);
    if (expected.denied) check(`keyboard:${id}:stored-bytes-unchanged-while-draft-displayed`, physical[field] === expected.stored, result);
    if (keyName === "Space") check(`keyboard:${id}:space-does-not-scroll`, isDeepStrictEqual(scrollBefore, scrollAfter) && rectBefore.top === rectAfter.top && rectBefore.bottom === rectAfter.bottom, result);
    check(`keyboard:${id}:focus-stays-on-switch`, result.active === desc, result);
    return result;
  }
  // K2: success path, Space and Enter on switches (one operation each; "on" stores true)
  keyboard.activations = [];
  keyboard.activations.push(await activation("tasks-space-off", "tasks", "Space", { bytes: "false" }));
  keyboard.activations.push(await activation("tasks-enter-on", "tasks", "Enter", { bytes: "true" }));
  keyboard.activations.push(await activation("board-enter-off", "board", "Enter", { bytes: "false" }));
  keyboard.activations.push(await activation("board-space-on", "board", "Space", { bytes: "true" }));
  keyboard.activations.push(await activation("calendar-enter-off", "calendar", "Enter", { bytes: "false" }));
  keyboard.activations.push(await activation("meditation-space-off", "meditation", "Space", { bytes: "false" }));
  check("keyboard:success-path-final-bytes", isDeepStrictEqual(await evaluate("verify.physical()"), { ...allOf(null), tasks: "true", board: "true", calendar: "false", meditation: "false" }), { physical: await evaluate("verify.physical()") });
  // K3: reset confirmation by keyboard: Enter opens it once (declined: zero attempts); Space opens it once (accepted)
  {
    await focusByTab("reset");
    const physicalBefore = await evaluate("verify.physical()");
    const displayedBefore = await evaluate("verify.displayed()");
    let start = await mark();
    let dialogsBefore = dialogs.length;
    dialogPlan.push({ accept: false });
    await press("Enter");
    pre("keyboard:reset-enter-confirmation-handled", await waitFor(() => dialogs.length > dialogsBefore, 6000));
    await delay(500);
    let opened = dialogs.slice(dialogsBefore);
    let confirmCalls = await evaluate(`verify.confirmsAfter(${start})`);
    let attempts = await evaluate(`verify.attemptsAfter(${start})`);
    let clicks = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type === "click").map((entry) => [entry.target, entry.trusted]);
    const declined = { opened, confirmCalls, clicks, featureAttempts: attempts.filter((entry) => FEATURE_KEYS.includes(entry.key)).length, mutations: attempts.filter((entry) => entry.op !== "get").length, recovery: await evaluate("verify.recovery()"), status: await evaluate("verify.status()"), physical: await evaluate("verify.physical()"), displayed: await evaluate("verify.displayed()"), active: await activeDesc() };
    record("keyboard-reset", { action: "Enter on Reset, declined", ...declined });
    check("keyboard:reset-enter-opens-confirmation-exactly-once", opened.length === 1 && opened[0].type === "confirm" && opened[0].message === T.confirm && confirmCalls.length === 1 && confirmCalls[0].result === false && clicks.length === 1 && clicks[0][0] === "reset" && clicks[0][1], declined);
    check("keyboard:reset-declined-zero-attempts-no-state-change", declined.featureAttempts === 0 && declined.mutations === 0 && declined.recovery.length === 0 && isDeepStrictEqual(declined.physical, physicalBefore) && isDeepStrictEqual(declined.displayed, displayedBefore), declined);
    check("keyboard:reset-declined-focus-stays-on-reset", declined.active === "reset", declined);
    start = await mark();
    dialogsBefore = dialogs.length;
    dialogPlan.push({ accept: true });
    await press("Space");
    pre("keyboard:reset-space-confirmation-handled", await waitFor(() => dialogs.length > dialogsBefore, 6000));
    const restored = await waitUntil(`verify.status() === ${JSON.stringify(T.restored)}`, 8000);
    await delay(300);
    opened = dialogs.slice(dialogsBefore);
    confirmCalls = await evaluate(`verify.confirmsAfter(${start})`);
    attempts = await evaluate(`verify.attemptsAfter(${start})`);
    clicks = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type === "click").map((entry) => [entry.target, entry.trusted]);
    const presentKeys = Object.entries(physicalBefore).filter(([, value]) => value !== null).map(([id]) => keyOf(id)).sort();
    const accepted = { opened, confirmCalls, clicks, restored, removes: attempts.filter((entry) => entry.op === "remove").map((entry) => [entry.key, entry.outcome]), sets: attempts.filter((entry) => entry.op === "set").length, presentKeys, physical: await evaluate("verify.physical()"), displayed: await evaluate("verify.displayed()"), recovery: await evaluate("verify.recovery()"), active: await activeDesc() };
    record("keyboard-reset", { action: "Space on Reset, accepted", ...accepted });
    check("keyboard:reset-space-opens-confirmation-exactly-once", opened.length === 1 && opened[0].type === "confirm" && opened[0].message === T.confirm && confirmCalls.length === 1 && confirmCalls[0].result === true && clicks.length === 1 && clicks[0][0] === "reset" && clicks[0][1], accepted);
    check("keyboard:reset-accepted-one-remove-per-stored-key-no-write", isDeepStrictEqual(accepted.removes.map(([key]) => key).sort(), presentKeys) && accepted.removes.every(([, outcome]) => outcome === "ok") && accepted.sets === 0, accepted);
    check("keyboard:reset-accepted-defaults-restored", restored && isDeepStrictEqual(accepted.physical, allOf(null)) && isDeepStrictEqual(accepted.displayed, allOf("true")) && accepted.recovery.length === 0, accepted);
    check("keyboard:reset-accepted-focus-stays-on-reset", accepted.active === "reset", accepted);
    keyboard.reset = { declined: declined.active, accepted: accepted.active };
  }
  // K4: failure path: every field gets a failed draft by keyboard; aria follows the draft, not the stored bytes
  await evaluate("verify.denySet('all')");
  for (const [index, field] of IDS.entries()) {
    keyboard.activations.push(await activation(`${field}-${index % 2 ? "enter" : "space"}-denied`, field, index % 2 ? "Enter" : "Space", { denied: true, bytes: "false", stored: null }));
  }
  check("keyboard:all-eight-unresolved-by-keyboard", isDeepStrictEqual(await evaluate("verify.recovery()"), IDS.map((id) => failedEntry(id))) && isDeepStrictEqual(await evaluate("verify.paneActions()"), ACTIONS), { recovery: await evaluate("verify.recovery()") });
  // K5: trusted Shift+Tab out of the top of the pane, then Tab through every all-eight control
  {
    const backward = [];
    for (let index = 0; index < 60; index += 1) {
      await press("Tab", true);
      const focus = await evaluate("verify.focusInfo()");
      backward.push(focus.desc);
      if (!focus.inPane) break;
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
    const expectedBackward = ALL8.slice(0, ALL8.indexOf("switch:meditation")).reverse();
    check("keyboard:all8-shift-tab-reverse-dom-order", isDeepStrictEqual(backward.slice(0, -1), expectedBackward) && exitTop.startsWith("sidebar:"), { backward });
    check("keyboard:all8-tab-reaches-every-control-in-dom-order", isDeepStrictEqual(forward.map((focus) => focus.desc), ALL8), { sequence: forward.map((focus) => focus.desc) });
    check("keyboard:all8-tab-focus-visible", bad.length === 0, { bad });
    record("keyboard-walk", { state: "all8", width: KEYBOARD_WIDTH, backward, exitTop, pane: forward, exitBottom: keyboard.exitBottom, maxOverhang: Math.max(0, ...forward.map((focus) => focus.overhang ?? 0)) });
  }
  /** One trusted key on a pane button; returns clicks, mutations and the focus afterwards. */
  async function pressOn(desc, keyName, settledExpression, wait = 6000) {
    await focusByTab(desc);
    await settle();
    const start = await mark();
    await press(keyName);
    const settled = settledExpression ? await waitUntil(settledExpression, wait) : true;
    await delay(400);
    const clicks = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type === "click").map((entry) => [entry.target, entry.trusted]);
    const attempts = await evaluate(`verify.attemptsAfter(${start})`);
    return {
      desc, key: keyName, settled, clicks,
      mutations: attempts.filter((entry) => entry.op === "set" || entry.op === "remove").map((entry) => [entry.op, entry.key, entry.value ?? null, entry.outcome]),
      featureReads: attempts.filter((entry) => entry.op === "get" && FEATURE_KEYS.includes(entry.key)).map((entry) => entry.key),
      recovery: await evaluate("verify.recovery()"), actions: await evaluate("verify.paneActions()"), status: await evaluate("verify.status()"),
      physical: await evaluate("verify.physical()"), displayed: await evaluate("verify.displayed()"), focus: await evaluate("verify.focusInfo()"),
    };
  }
  const oneClick = (result, desc) => result.clicks.length === 1 && result.clicks[0][0] === desc && result.clicks[0][1] === true;
  // K6: Retry by keyboard while the write is still denied: one attempt, focus is not lost (stays on Retry)
  {
    const result = await pressOn("retry:tasks", "Enter", `verify.recovery().some((entry) => entry.id === "tasks" && entry.text === ${JSON.stringify(T.notSaved(T.labels.tasks))})`);
    record("keyboard-recovery", { action: "Enter on Retry Tasks (still denied)", ...result });
    check("keyboard:retry-failing-enter-exactly-one-attempt", oneClick(result, "retry:tasks") && isDeepStrictEqual(result.mutations, [["set", keyOf("tasks"), "false", "denied"]]) && result.recovery.length === 8, result);
    check("keyboard:retry-failing-focus-stays-on-retry", result.focus.desc === "retry:tasks" && focusOk(result.focus), { focus: result.focus });
  }
  // K7: successful Retry by keyboard: the block disappears and focus lands on that field's switch
  {
    await evaluate(`verify.allowSet(["board"])`);
    const result = await pressOn("retry:board", "Enter", `!verify.recovery().some((entry) => entry.id === "board") && verify.physical().board === "false"`);
    record("keyboard-recovery", { action: "Enter on Retry Boards (succeeds)", ...result });
    check("keyboard:retry-success-enter-one-write-block-removed", oneClick(result, "retry:board") && isDeepStrictEqual(result.mutations, [["set", keyOf("board"), "false", "ok"]]) && result.recovery.length === 7 && result.displayed.board === "false", result);
    check("keyboard:retry-success-focus-on-field-switch", result.focus.desc === "switch:board" && focusOk(result.focus), { focus: result.focus });
    keyboard.afterRetrySuccess = result.focus.desc;
  }
  // K8: Discard by keyboard: zero writes, the block disappears and focus lands on that field's switch
  {
    const result = await pressOn("discard:tasks", "Space", `!verify.recovery().some((entry) => entry.id === "tasks")`);
    record("keyboard-recovery", { action: "Space on Discard Tasks", ...result });
    check("keyboard:discard-space-once-zero-writes", oneClick(result, "discard:tasks") && result.mutations.length === 0 && result.recovery.length === 6 && result.displayed.tasks === "true", result);
    check("keyboard:discard-focus-on-field-switch", result.focus.desc === "switch:tasks" && focusOk(result.focus), { focus: result.focus });
    keyboard.afterDiscard = result.focus.desc;
  }
  // K9: dialog by keyboard sidebar activation; focus enters, Tab/Shift+Tab wrap, Escape = Stay, focus returns
  {
    await focusByTab("switch:tasks");
    await press("Tab", true);
    const row = await activeDesc();
    pre("keyboard:dialog-trigger-is-sidebar-row", row.startsWith("sidebar:"), { row });
    const location = await evaluate("verify.location()");
    const start = await mark();
    await press("Enter");
    pre("keyboard:dialog-open", await waitUntil("verify.dialog() !== null", 4000));
    // The coordinator moves focus in an effect after the dialog renders; keys are pressed only after it did (bounded).
    const entered = await waitUntil("verify.activeDesc() === 'dialog'", 3000);
    const wording = await evaluate("verify.dialog()");
    const steps = [{ key: "open", active: await activeDesc(), entered }];
    for (const [key, shift] of [["Tab", false], ["Tab", false], ["Tab", false], ["Tab", false], ["Tab", true], ["Tab", true], ["Tab", true]]) {
      await press(key, shift);
      const focus = await evaluate("verify.focusInfo()");
      steps.push({ key: shift ? "Shift+Tab" : "Tab", active: focus.desc, ok: focusOk(focus) });
    }
    const expectedSteps = ["dialog", "dialog:stay", "dialog:export", "dialog:discard-leave", "dialog:stay", "dialog:discard-leave", "dialog:export", "dialog:stay"];
    await press("Escape");
    const closed = await waitUntil("verify.dialog() === null", 3000);
    await delay(250);
    const after = { closed, location: await evaluate("verify.location()"), active: await activeDesc(), recovery: (await evaluate("verify.recovery()")).length, clicks: (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type === "click").map((entry) => entry.target) };
    record("keyboard-dialog", { trigger: row, wording, steps, after });
    check("keyboard:dialog-wording-features-guard-label", isDeepStrictEqual(wording, T.dialog), { wording });
    check("keyboard:dialog-focus-enters", steps[0].active === "dialog", { steps });
    check("keyboard:dialog-tab-and-shift-tab-wrap", isDeepStrictEqual(steps.map((step) => step.active), expectedSteps) && steps.slice(1).every((step) => step.ok), { steps });
    check("keyboard:dialog-escape-is-stay", closed && isDeepStrictEqual(after.location, location) && after.recovery === 6, after);
    check("keyboard:dialog-focus-returns-to-prior-element", after.active === row, after);
    keyboard.dialog = { trigger: row, steps: steps.map((step) => step.active), after };
  }
  // K9b: dialog from a programmatic module navigation while a switch has focus; Shift+Tab from the container wraps
  {
    await focusByTab("switch:pomodoro");
    const location = await evaluate("verify.location()");
    await evaluate("verify.navigate('/app/tasks')");
    pre("keyboard:dialog-open-programmatic", await waitUntil("verify.dialog() !== null", 4000));
    await waitUntil("verify.activeDesc() === 'dialog'", 3000);
    const opened = await activeDesc();
    await press("Tab", true);
    const wrappedLast = await activeDesc();
    await press("Tab");
    const wrappedFirst = await activeDesc();
    await press("Escape");
    const closed = await waitUntil("verify.dialog() === null", 3000);
    await delay(250);
    const after = { opened, wrappedLast, wrappedFirst, closed, location: await evaluate("verify.location()"), active: await activeDesc() };
    record("keyboard-dialog", { trigger: "router.navigate('/app/tasks') with focus on switch:pomodoro", ...after });
    check("keyboard:programmatic-dialog-focus-and-wrap", opened === "dialog" && wrappedLast === "dialog:discard-leave" && wrappedFirst === "dialog:stay", after);
    check("keyboard:programmatic-dialog-escape-stay-focus-returns", closed && isDeepStrictEqual(after.location, location) && after.active === "switch:pomodoro", after);
  }
  // K9c: Enter on the focused Stay action activates it once; focus returns to the prior element
  {
    await focusByTab("switch:habits");
    const location = await evaluate("verify.location()");
    await evaluate("verify.navigate('/app/tasks')");
    pre("keyboard:dialog-open-for-enter", await waitUntil("verify.dialog() !== null", 4000));
    check("keyboard:dialog-focus-enters-before-enter-on-stay", await waitUntil("verify.activeDesc() === 'dialog'", 3000), { active: await activeDesc() });
    await press("Tab");
    const onStay = await activeDesc();
    const start = await mark();
    await press("Enter");
    const closed = await waitUntil("verify.dialog() === null", 3000);
    await delay(250);
    const clicks = (await evaluate(`verify.eventsAfter(${start})`)).filter((entry) => entry.type === "click").map((entry) => [entry.target, entry.trusted]);
    const after = { onStay, closed, clicks, location: await evaluate("verify.location()"), active: await activeDesc() };
    record("keyboard-dialog", { trigger: "router.navigate('/app/tasks') with focus on switch:habits; Enter on Stay", ...after });
    check("keyboard:dialog-enter-on-stay-once-focus-returns", onStay === "dialog:stay" && closed && clicks.length === 1 && clicks[0][0] === "dialog:stay" && clicks[0][1] && isDeepStrictEqual(after.location, location) && after.active === "switch:habits", after);
  }
  // K10: Discard all by keyboard: one click, zero writes, every block removed, focus on Reset to defaults
  {
    const result = await pressOn("discard-all", "Enter", "verify.recovery().length === 0 && verify.paneActions() === null");
    record("keyboard-recovery", { action: "Enter on Discard all changes", ...result });
    check("keyboard:discard-all-enter-once-zero-writes", oneClick(result, "discard-all") && result.mutations.length === 0 && result.recovery.length === 0 && result.actions === null && isDeepStrictEqual(result.displayed, { ...allOf("true"), board: "false" }) && isDeepStrictEqual(result.physical, { ...allOf(null), board: "false" }), result);
    check("keyboard:discard-all-focus-on-reset-inside-pane", result.focus.desc === "reset" && result.focus.inPane && focusOk(result.focus), { focus: result.focus });
    keyboard.afterDiscardAll = result.focus.desc;
  }
  // K11: source-only Reload by keyboard: Tab order includes Reload; Reload with the bytes still malformed keeps the
  // alert; Reload after an external repair clears it; both make zero writes and focus the field's switch
  {
    await evaluate("verify.restore()");
    await seed(fixedOrigin, { ...BASE_SEED, [keyOf("board")]: "false", [keyOf(SOURCE_ID)]: "yes" }, "keyboard-source-only");
    await mountApp(fixedOrigin, "keyboard-source-only");
    await petOff("keyboard-source-only");
    await setViewport(KEYBOARD_WIDTH);
    pre("keyboard:source-only-block", isDeepStrictEqual(await evaluate("verify.recovery()"), [sourceEntry(SOURCE_ID)]), { recovery: await evaluate("verify.recovery()") });
    const walk = await walkFromStart();
    const bad = walk.pane.filter((focus) => !focusOk(focus));
    check("keyboard:source-only-tab-reaches-every-control-in-dom-order", isDeepStrictEqual(walk.pane.map((focus) => focus.desc), RELOAD), { sequence: walk.pane.map((focus) => focus.desc) });
    check("keyboard:source-only-tab-focus-visible", bad.length === 0, { bad });
    record("keyboard-walk", { state: "source-only", width: KEYBOARD_WIDTH, startPoint: walk.startPoint, presses: walk.presses, outside: walk.outside, pane: walk.pane, maxOverhang: walk.maxOverhang });
    const kept = await pressOn(`reload:${SOURCE_ID}`, "Enter", null);
    record("keyboard-recovery", { action: "Enter on Reload Matrix (bytes still malformed)", ...kept });
    check("keyboard:reload-enter-once-zero-writes-alert-kept", oneClick(kept, `reload:${SOURCE_ID}`) && kept.mutations.length === 0 && isDeepStrictEqual(kept.recovery, [sourceEntry(SOURCE_ID)]) && kept.physical[SOURCE_ID] === "yes", kept);
    check("keyboard:reload-focus-on-field-switch", kept.focus.desc === `switch:${SOURCE_ID}` && focusOk(kept.focus), { focus: kept.focus });
    pre("keyboard:external-repair-seeded", (await evaluate(`verify.seedRaw(${JSON.stringify(SOURCE_ID)}, "false")`)) === "false");
    const repaired = await pressOn(`reload:${SOURCE_ID}`, "Space", `verify.recovery().length === 0`);
    record("keyboard-recovery", { action: "Space on Reload Matrix (after external repair)", ...repaired });
    check("keyboard:reload-space-once-zero-writes-alert-cleared-no-saved-claim", oneClick(repaired, `reload:${SOURCE_ID}`) && repaired.mutations.length === 0 && repaired.recovery.length === 0 && repaired.displayed[SOURCE_ID] === "false" && repaired.status === "", repaired);
    check("keyboard:reload-repair-focus-on-field-switch", repaired.focus.desc === `switch:${SOURCE_ID}` && focusOk(repaired.focus), { focus: repaired.focus });
    keyboard.afterReload = [kept.focus.desc, repaired.focus.desc];
  }
  // K12: partial reset by keyboard (one key's remove denied), then a successful keyboard Retry of the reset draft
  {
    await evaluate(`verify.denyRemove([${JSON.stringify(SOURCE_ID)}])`);
    await focusByTab("reset");
    const start = await mark();
    const dialogsBefore = dialogs.length;
    dialogPlan.push({ accept: true });
    await press("Enter");
    pre("keyboard:partial-reset-confirmation-handled", await waitFor(() => dialogs.length > dialogsBefore, 6000));
    const settled = await waitUntil(`verify.recovery().length === 1 && verify.recovery()[0].text === ${JSON.stringify(T.notReset(T.labels[SOURCE_ID]))}`, 8000);
    await delay(400);
    const attempts = await evaluate(`verify.attemptsAfter(${start})`);
    const partial = { settled, opened: dialogs.slice(dialogsBefore), removes: attempts.filter((entry) => entry.op === "remove").map((entry) => [entry.key, entry.outcome]).sort(), sets: attempts.filter((entry) => entry.op === "set").length, recovery: await evaluate("verify.recovery()"), status: await evaluate("verify.status()"), physical: await evaluate("verify.physical()"), active: await activeDesc() };
    record("keyboard-reset", { action: "Enter on Reset with Matrix removeItem denied, accepted", ...partial });
    check("keyboard:partial-reset-one-confirmation-one-remove-per-stored-key", settled && partial.opened.length === 1 && partial.opened[0].message === T.confirm && isDeepStrictEqual(partial.removes, [[keyOf("board"), "ok"], [keyOf(SOURCE_ID), "denied"]]) && partial.sets === 0, partial);
    check("keyboard:partial-reset-reset-draft-kept-no-restored-claim", isDeepStrictEqual(partial.recovery, [failedEntry(SOURCE_ID, T.notReset)]) && partial.status === "" && partial.physical[SOURCE_ID] === "false" && partial.physical.board === null, partial);
    check("keyboard:partial-reset-focus-stays-on-reset", partial.active === "reset", partial);
    await evaluate("verify.restore()");
    const retried = await pressOn(`retry:${SOURCE_ID}`, "Enter", `verify.recovery().length === 0 && verify.physical()[${JSON.stringify(SOURCE_ID)}] === null`);
    record("keyboard-recovery", { action: "Enter on Retry Matrix (reset draft, succeeds)", ...retried });
    check("keyboard:reset-draft-retry-one-remove-never-writes", oneClick(retried, `retry:${SOURCE_ID}`) && isDeepStrictEqual(retried.mutations, [["remove", keyOf(SOURCE_ID), null, "ok"]]) && retried.displayed[SOURCE_ID] === "true", retried);
    check("keyboard:reset-draft-retry-focus-on-field-switch", retried.focus.desc === `switch:${SOURCE_ID}` && focusOk(retried.focus), { focus: retried.focus });
    // Contract §6 states "Defaults restored." only as a necessary condition; recorded, not gated here (E10 owns it).
    const statusAfterRetry = (await waitUntil(`verify.status() === ${JSON.stringify(T.restored)}`, 3000)) ? T.restored : await evaluate("verify.status()");
    record("observation", { id: "keyboard:reset-draft-retry-status", status: statusAfterRetry });
    keyboard.afterResetDraftRetry = retried.focus.desc;
    keyboard.statusAfterResetDraftRetry = statusAfterRetry;
  }
  record("keyboard-summary", { width: KEYBOARD_WIDTH, lang: LANG, ...keyboard, activations: keyboard.activations.length });

  record("summary", {
    lang: LANG, widths: WIDTHS,
    table: summary.map((row) => ({ state: row.state, width: row.width, controls: row.controls, hitFailures: row.failures.hit.length, containmentFailures: row.failures.contained.length, viewportFailures: row.failures.viewport.length, under44: row.failures.small.length, clipped: row.failures.clipped.length, minTarget: row.minTarget, minDetailGap: row.minDetailGap, document: row.document, detail: row.detail, pane: row.pane })),
    geometry: geometryTable, petOn: petObservations.map((entry) => ({ product: entry.product, width: entry.width, pet: entry.pet, coveredByPet: entry.coveredByPet, notFullyHit: entry.notFullyHit.map((item) => `${item.desc}(center ${item.centerTarget}, ${item.petHits}/5 points on the pet)`), screenshot: entry.screenshot ?? null })),
    screenshots: screenshots.map((entry) => ({ file: entry.file, sha256: entry.sha256, png: entry.png })),
  });
  pre("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs });
  check("run:deferred-product-failures-zero", deferredFailures.length === 0, { deferredFailures });
  check("run:runtime-errors-zero", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 5) });
} catch (error) {
  harnessError = error;
} finally {
  const productFailure = harnessError?.checkKind === "product";
  record("result", {
    pass: harnessError === null, harnessValid: harnessError === null || productFailure, mode, lang: LANG, checks, productChecks, deferredFailures,
    runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 6),
    consoleWarnings: consoleWarnings.length, consoleWarningSamples: [...new Set(consoleWarnings)].slice(0, 6), dialogs, screenshots: screenshots.length,
    served: Object.fromEntries(servers.map((entry) => [entry.label, entry.served])),
    ...(harnessError ? { error: String(harnessError?.stack ?? harnessError).slice(0, 1500), checkId: harnessError?.checkId ?? null, checkKind: harnessError?.checkKind ?? null } : {}),
  });
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`, { flag: "wx" });
  await closeSession().catch(() => {});
  for (const entry of servers) { entry.server.closeAllConnections?.(); entry.server.close(); }
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  process.exitCode = harnessError === null ? 0 : productFailure ? 2 : 1;
  const label = harnessError === null ? "PASS" : productFailure ? "PRODUCT-FAIL" : "HARNESS-FAIL";
  console.log(`${label} ${relative(root, evidencePath)} checks=${checks} product=${productChecks} screenshots=${screenshots.length} exit=${process.exitCode}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
}
