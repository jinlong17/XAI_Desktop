/**
 * CP-STICKY-01 batch 10 (F1 impact review): bounded Chrome reproduction of "a held browser Back (POP)
 * departure released by a successful trusted Retry" for one guard registrant. Verification only: it
 * repairs nothing, accepts nothing and changes no product file, contract, ledger or existing evidence.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-sticky-recovery-f1/verify-f1.mjs <fixed revision> <more|collaborate|sticky> <suffix>
 *
 * - Product: an immutable `git archive <fixed revision>`; ./f1-host.tsx is bundled with esbuild from stdin
 *   with resolveDir = that archive and every `@repo/*` import pinned to the archive's packages. Only
 *   third-party modules come from XAI_DEPS_ROOT, and only when its pnpm-lock.yaml SHA-256 equals the
 *   archive's (consistency gate). Bundle inputs are checked for provenance.
 * - Page: ./f1-prelude.js (classic script, React commit observer) then the module bundle, served from
 *   127.0.0.1 only; isolated headless Chrome profile; CDP trusted mouse input after a centre hit-test;
 *   browser Back/Forward through CDP Page.navigateToHistoryEntry (the browser's own traversal).
 * - Cases (one run = one diagnostic iteration): r1 Retry-released Back, d1 discard-released Back
 *   (control), r2 Retry-released Back (repeat). Each case asserts the F1 oracle; product assertions are
 *   deferred (recorded without stopping), preconditions stop the run. Exit code 1 means a precondition
 *   failed (harness invalid) or the oracle failed (behaviour observed); the final record says which.
 * - Log: JSON lines `f1-<sha7>-<mode>-<suffix>.log` in this directory, never overwritten. Development
 *   probes may redirect with XAI_F1_EVIDENCE_DIR (outside the repository); committed evidence never does.
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
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_F1_EVIDENCE_DIR ?? output;
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);

const MODES = {
  more: {
    pane: "more",
    key: "xai_pref_more_launch_at_login",
    toggle: "Launch at Login",
    retry: "Retry Launch at Login",
    failed: ["Launch at Login was not saved."],
    reRegistrationOnRetry: "morePane.tsx retry() changed() + settle() changed()",
  },
  collaborate: {
    pane: "collaborate",
    key: "xai_pref_collab_show_avatars",
    toggle: "Show collaborator avatars",
    retry: "Retry Show collaborator avatars",
    failed: ["Show collaborator avatars", "Not saved"],
    reRegistrationOnRetry: "collaboratePane.tsx clearIfMatching() changed() only",
  },
  sticky: {
    pane: "sticky",
    key: "xai_pref_sticky_pin_default",
    toggle: "Pin by Default",
    retry: "Retry Pin by Default",
    failed: ["Pin by Default was not saved."],
    reRegistrationOnRetry: "stickyPane.tsx retry() changed() + settle() changed()",
  },
};
if (!requested) throw Error("Fixed revision required");
const config = MODES[mode];
if (!config) throw Error(`Unsupported mode ${mode}; use ${Object.keys(MODES).join("|")}`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const resolved = execFileSync("git", ["rev-parse", "--verify", `${requested}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const short = resolved.slice(0, 7);
const evidencePath = join(evidenceDir, `f1-${short}-${mode}-${suffix}.log`);
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
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const fixtureSource = readFileSync(join(output, "f1-host.tsx"), "utf8");
const preludeSource = readFileSync(join(output, "f1-prelude.js"), "utf8");
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
const versionOf = (name) => {
  try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
};

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-f1-")));
const snapshot = join(directory, "source");
const profile = join(directory, "profile");
let server = null;
let session = null;
let origin = "";

// ---------------------------------------------------------------------------------------------------
// Browser session (pattern of ../web-sticky-recovery-native/verify-host.mjs, which is not modified)
// ---------------------------------------------------------------------------------------------------
async function launch() {
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

async function trustedClick(selector, label) {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { found: false };
    element.scrollIntoView({ block: "center", inline: "center" });
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { found: true, x, y, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + hit.className : null };
  })()`);
  pre(`input:control-present:${label}`, point.found, { selector });
  pre(`input:hit-test:${label}`, point.hit, { selector, hitTarget: point.hitTarget });
  await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await delay(60);
}
async function clickButton(name, scope) {
  const selector = await evaluate(`(() => {
    document.querySelectorAll("[data-f1-target]").forEach((element) => element.removeAttribute("data-f1-target"));
    const element = [...document.querySelectorAll(${JSON.stringify(`${scope} button`)})]
      .find((candidate) => (candidate.getAttribute("aria-label") ?? candidate.textContent).trim() === ${JSON.stringify(name)});
    if (!element) return null;
    element.setAttribute("data-f1-target", "1");
    return '[data-f1-target="1"]';
  })()`);
  pre(`input:button-present:${name}`, selector, { scope });
  await trustedClick(selector, name);
  await evaluate('document.querySelector("[data-f1-target]")?.removeAttribute("data-f1-target")');
}

/** Compact, sequence-ordered timeline of one release window (all instruments share one sequence). */
function timeline(view, key) {
  const items = [];
  const blockerText = (list) => `[${list.join(",")}]`;
  for (const entry of view.clicks) items.push([entry.seq, `click ${entry.target}${entry.trusted ? "" : " (untrusted)"}`]);
  for (const entry of view.locks) if (entry.name.includes(key)) items.push([entry.seq, `lock-request ${entry.name}`]);
  for (const entry of view.attempts) if (entry.key === key) items.push([entry.seq, `${entry.op} ${entry.value ?? ""} ${entry.outcome}`.trim()]);
  for (const entry of view.blockerCalls) items.push([entry.seq, `${entry.op.toUpperCase()} blocker#${entry.blocker} live=#${entry.liveBlocker}:${entry.liveState}${entry.threw ? ` THREW ${entry.threw}` : ""}`]);
  for (const entry of view.router) items.push([entry.seq, `router ${entry.action} ${entry.path}#${entry.key} blockers=${blockerText(entry.blockers)}`]);
  for (const entry of view.pops) items.push([entry.seq, `popstate ${entry.path}#${entry.key}`]);
  for (const entry of view.history) items.push([entry.seq, `${entry.method} ${entry.url}`]);
  for (const entry of view.react) {
    if (!entry.coord) continue;
    const stale = isStale(entry);
    items.push([entry.seq, `react-commit p${entry.prio} coordinator blocker#${entry.coord.b}:${entry.coord.s} gv=${entry.coord.gv} iv=${entry.coord.iv} live=#${entry.live?.id}:${entry.live?.state}${stale ? " STALE" : ""}`]);
  }
  for (const entry of view.post) items.push([entry.seq, `passive-effects-flushed live=#${entry.live?.id}:${entry.live?.state}`]);
  for (const entry of view.consoleErrors) items.push([entry.seq, `console.error ${entry.text.slice(0, 140)}`]);
  for (const entry of view.errorUi) items.push([entry.seq, `ERROR-UI ${entry.path}`]);
  items.sort((left, right) => left[0] - right[0]);
  return items.slice(0, 160).map(([seq, text]) => `${seq} ${text}`);
}
const isStale = (entry) => Boolean(entry.coord && entry.coord.s === "blocked"
  && (!entry.live || entry.live.id !== entry.coord.b || entry.live.state !== "blocked"));

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
const outcomes = [];
try {
  mkdirSync(snapshot);
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
    stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: "f1-host.tsx" },
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
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== "f1-host.tsx");
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const productFiles = [
    "apps/web/src/routes/modules/departureCoordinator.tsx",
    "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
    "apps/web/src/routes/modules/settingsDeparture.ts",
    "packages/plugin-web-settings-rest/src/panes/morePane.tsx",
    "packages/plugin-web-settings-rest/src/panes/collaboratePane.tsx",
    "packages/plugin-web-settings-rest/src/panes/stickyPane.tsx",
    "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
    "packages/plugin-web-storage/src/internal/prefMutation.ts",
    "packages/xai-web-shell/src/Shell.tsx",
  ];
  const productHashes = Object.fromEntries(productFiles.map((file) => [file, sha256(readFileSync(join(snapshot, file)))]));
  const productInBundle = productFiles.every((file) => inputs.includes(file));
  const page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>F1 reproduction fixture</title><link rel="stylesheet" href="/__f1/bundle.css"><script src="/__f1/prelude.js"></script></head><body><div id="app"></div><script type="module" src="/__f1/bundle.js"></script></body></html>';
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
  await cdp("Page.navigate", { url: `${origin}/app/settings/hotkeys` });
  pre("session:mounted", await waitUntil("!!window.verify && document.querySelector('.settings-detail')?.getAttribute('data-pane') === 'hotkeys'", 15000));
  await cdp("Page.bringToFront");
  await cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  const version = await cdp("Browser.getVersion");
  const viewport = await evaluate("({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio })");
  record("baseline", {
    requested, resolved, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix, config,
    browser: version.product, protocol: version.protocolVersion, viewport, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock) },
    fixtureSha256: sha256(fixtureSource), preludeSha256: sha256(preludeSource), runnerSha256,
    bundleSha256: sha256(js), bundleCssSha256: sha256(css),
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    productHashes, origin: "127.0.0.1 (ephemeral port)",
  });
  pre("baseline:docs-head-product-tree-equals-fixed", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === sha256(archiveLock));
  pre("baseline:bundle-inputs-pinned-to-archive", foreign.length === 0 && productInBundle, { foreign, productInBundle });
  pre("baseline:no-mount-runtime-errors", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 3) });
  pre("baseline:react-commit-observer-active", await evaluate("verify.reactCommitsObserved() > 0 && verify.coordinatorObserved() && verify.hookErrors() === 0"), {
    commits: await evaluate("verify.reactCommitsObserved()"), hookErrors: await evaluate("verify.hookErrors()"),
  });

  // History: start entry (hotkeys) -> P (date_time, with state) -> S (pane under test)
  await evaluate('void verify.router.navigate("/app/settings/date_time", { state: { token: "f1-P" } }), true');
  pre("setup:p-mounted", await waitUntil("verify.paneId() === 'date_time'", 6000));
  const P = await evaluate("verify.location()");
  await evaluate(`void verify.router.navigate(${JSON.stringify(`/app/settings/${config.pane}`)}), true`);
  pre(`setup:s-mounted:${config.pane}`, await waitUntil(`verify.paneId() === ${JSON.stringify(config.pane)}`, 6000));
  await delay(300);
  const S = await evaluate("verify.location()");
  const initialStack = await cdp("Page.getNavigationHistory");
  pre("setup:history-p-then-s", initialStack.entries.length >= 3 && P.key !== S.key && S.pathname === `/app/settings/${config.pane}`, { P, S, currentIndex: initialStack.currentIndex });
  record("history-entries", { P, S, stack: initialStack.entries.map((entry) => `${entry.id}:${new URL(entry.url).pathname}`), currentIndex: initialStack.currentIndex });
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

  async function runCase(id, release) {
    const errorsAtStart = runtimeErrors.length;
    pre(`${id}:starts-clean-at-s`, await evaluate(`verify.location().key === ${JSON.stringify(S.key)} && verify.dialog() === null && verify.paneId() === ${JSON.stringify(config.pane)}`));
    // 1. A save of one field fails: the fixture refuses every setItem for that key.
    await evaluate(`verify.denySet(${JSON.stringify(config.key)})`);
    const editMark = await evaluate("verify.mark()");
    await trustedClick(`.settings-detail [role="switch"][aria-label="${config.toggle}"]`, `${id}:toggle ${config.toggle}`);
    const failedShown = await waitUntil(`(() => { const alerts = verify.alerts(); return ${JSON.stringify(config.failed)}.every((part) => alerts.some((text) => text.includes(part))) && verify.buttons().includes(${JSON.stringify(config.retry)}); })()`, 5000);
    const editView = await evaluate(`verify.window(${editMark})`);
    const denied = editView.attempts.filter((entry) => entry.op === "set" && entry.key === config.key && entry.outcome === "denied");
    pre(`${id}:save-failed-with-retry-offered`, failedShown && denied.length >= 1, { denied, alerts: await evaluate("verify.alerts()") });
    const latest = denied.at(-1).value;
    // 2. Browser Back is held by the departure guard.
    const holdMark = await evaluate("verify.mark()");
    const step = await traverse(id, "back");
    const opened = await waitUntil("verify.dialog() !== null", 4000);
    const restored = await waitUntil(`verify.windowPath() === ${JSON.stringify(S.pathname)} && verify.historyStateKey() === ${JSON.stringify(S.key)}`, 4000);
    await delay(250);
    const held = await evaluate(`({ location: verify.location(), dialog: verify.dialog(), view: verify.window(${holdMark}) })`);
    pre(`${id}:back-held-dialog-open-url-restored`, opened && restored && held.dialog !== null && sameTriple(held.location, S) && held.view.commits.length === 0, { dialog: held.dialog, location: triple(held.location), step });
    observe(`${id}:held-guard-label-is-caller-not-fallback`, !String(held.dialog.label).includes("Smart Lists") || config.pane === "smart_lists", { dialog: held.dialog });
    // 3. Release.
    await evaluate("verify.restore()");
    const releaseMark = await evaluate("verify.mark()");
    if (release === "retry") await clickButton(config.retry, ".settings-detail");
    else await clickButton("Discard local changes and leave", ".settings-departure-dialog");
    const left = await waitUntil(`verify.location().key === ${JSON.stringify(P.key)}`, 6000);
    await delay(800);
    const state = await evaluate(`({ location: verify.location(), windowPath: verify.windowPath(), dialog: verify.dialog(), physical: verify.physical(${JSON.stringify(config.key)}), view: verify.window(${releaseMark}) })`);
    const view = state.view;
    const stackAfter = await cdp("Page.getNavigationHistory");
    const writes = view.attempts.filter((entry) => entry.key === config.key && (entry.op === "set" || entry.op === "remove"));
    const proceeds = view.blockerCalls.filter((entry) => entry.op === "proceed");
    const resets = view.blockerCalls.filter((entry) => entry.op === "reset");
    const stale = view.react.filter(isStale);
    const caseErrors = runtimeErrors.slice(errorsAtStart);
    const results = {
      location: observe(`${id}:location-deep-equal-p`, left && sameTriple(state.location, P) && state.windowPath === P.pathname, { location: triple(state.location), expected: triple(P) }),
      commit: observe(`${id}:exactly-one-pop-commit-zero-push-replace`, view.commits.length === 1 && view.commits[0].key === P.key && view.commits[0].action === "POP"
        && view.history.length === 0 && view.pops.length === 1 && stackAfter.entries.length === initialStack.entries.length,
        { commits: view.commits, history: view.history, pops: view.pops.length, stackLength: stackAfter.entries.length }),
      outcome: observe(`${id}:dialog-closed-${release === "retry" ? "latest-written-once" : "zero-writes"}`, state.dialog === null
        && (release === "retry"
          ? writes.length === 1 && writes[0].op === "set" && writes[0].value === latest && writes[0].outcome === "ok" && state.physical === latest
          : writes.length === 0),
        { dialog: state.dialog, writes, latest, physical: state.physical }),
      proceedOnce: observe(`${id}:blocker-proceed-exactly-once-from-blocked`, proceeds.length === 1 && proceeds[0].liveState === "blocked" && !view.blockerCalls.some((entry) => entry.threw) && resets.length === 0,
        { blockerCalls: view.blockerCalls }),
      runtime: observe(`${id}:zero-runtime-errors-no-error-boundary`, view.consoleErrors.length === 0 && view.errorUi.length === 0 && caseErrors.length === 0,
        { consoleErrors: view.consoleErrors.map((entry) => ({ seq: entry.seq, path: entry.path, text: entry.text.slice(0, 200) })), errorUi: view.errorUi, cdpRuntimeErrors: caseErrors.length }),
    };
    const f1Signature = proceeds.length >= 2 && view.blockerCalls.some((entry) => /Invalid blocker state transition/.test(entry.threw ?? ""));
    const outcome = { case: id, release, pass: Object.values(results).every(Boolean), f1Signature, proceeds: proceeds.length, staleCommits: stale.length,
      guardVersions: [...new Set(view.react.filter((entry) => entry.coord).map((entry) => entry.coord.gv))] };
    outcomes.push(outcome);
    record("observation", { ...outcome, stale: stale.map((entry) => ({ seq: entry.seq, coordinator: entry.coord, live: entry.live })), timeline: timeline(view, config.key) });
    // 4. Return to S (unguarded) for the next case; the pane must remount clean.
    await traverse(`${id}:return`, "forward");
    const back = await waitUntil(`verify.location().key === ${JSON.stringify(S.key)} && verify.paneId() === ${JSON.stringify(config.pane)} && verify.dialog() === null`, 6000);
    await delay(400);
    pre(`${id}:returned-to-s-clean`, back && !(await evaluate(`verify.buttons().includes(${JSON.stringify(config.retry)})`)), { location: await evaluate("verify.location()") });
  }

  await runCase("r1", "retry");
  await runCase("d1", "discard");
  await runCase("r2", "retry");

  pre("run:no-unexpected-javascript-dialogs", unexpectedDialogs.length === 0, { unexpectedDialogs });
  pre("run:react-observer-never-threw", (await evaluate("verify.hookErrors()")) === 0);
  const pass = deferredFailures.length === 0;
  record("result", { pass, mode, checks, deferredFailures, outcomes, runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 4), consoleWarnings: consoleWarnings.length });
  if (!pass) process.exitCode = 1;
} catch (error) {
  record("result", { pass: false, harnessError: true, mode, checks, deferredFailures, outcomes, error: String(error?.stack ?? error).slice(0, 1500), checkId: error?.checkId ?? null, checkKind: error?.checkKind ?? null, runtimeErrorSamples: runtimeErrors.slice(0, 4) });
  process.exitCode = 1;
} finally {
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`);
  await closeSession().catch(() => {});
  server?.closeAllConnections?.();
  server?.close();
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  const last = records.at(-1);
  const summary = outcomes.map((entry) => `${entry.case}:${entry.pass ? "pass" : "FAIL"}${entry.f1Signature ? "(F1)" : ""}`).join(" ");
  console.log(`${last?.pass ? "PASS" : last?.harnessError ? "HARNESS-FAIL" : "FAIL"} ${relative(root, evidencePath)} checks=${checks} ${summary}${last?.harnessError ? ` error=${String(last?.error).split("\n")[0]}` : ""}`);
}
