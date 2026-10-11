/**
 * CP-STICKY-01 batch 13 (post-F1 reruns): Chrome race check for the repaired DepartureCoordinator on the
 * Sticky pane. Verification only: it repairs nothing, accepts nothing and changes no product file,
 * contract, ledger or existing evidence.
 *
 * Usage, from the root of a worktree whose HEAD product tree equals the candidate:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-sticky-recovery-f1/verify-f1-race.mjs <revision> race <suffix>
 *
 * - Product: an immutable `git archive <revision>`; ./f1-race-host.tsx is bundled with esbuild from stdin
 *   with resolveDir = that archive and every `@repo/*` import pinned to the archive's packages. Only
 *   third-party modules come from XAI_DEPS_ROOT, and only when its pnpm-lock.yaml SHA-256 equals the
 *   archive's (consistency gate). Bundle inputs are checked for provenance.
 * - Page: the frozen ./f1-prelude.js (classic script, React commit observer; read, never changed) then the
 *   module bundle, served from 127.0.0.1 only; isolated headless Chrome profile; CDP trusted mouse input
 *   after a centre hit-test; browser Back/Forward through CDP Page.navigateToHistoryEntry.
 * - Unsaved failed work: Sticky "Pin by Default" (xai_pref_sticky_pin_default) with a per-key setItem
 *   fault that stays armed for the whole run (no case retries).
 * - Cases (one run = one diagnostic iteration):
 *     r1 Back, second Back, Stay clicked before React renders the second blocker (script click from a
 *        router subscriber; the record proves the committed coordinator blocker differs from the live one);
 *     r2 Back, second Back, trusted Stay after the second blocker rendered (rebind to the live blocker);
 *     r3 as r1 with "Discard local changes and leave";
 *     r4 as r2 with "Discard local changes and leave";
 *     k  row k: held Back, epoch change A->B cancels it exactly once, fresh device protection, then A;
 *     g  row g: Stay plus a same-task pane edit (guard re-registration while the rendered blocker snapshot
 *        is still "blocked") does not reopen the dialog; a fresh Back and a fresh sidebar intent prompt;
 *     l  row l: held Back, root unmount: the router-deleted blocker is never reset, no phantom blocker,
 *        unload listener and navigate wrapper removed; a later browser Back commits without a blocker.
 *   Product assertions are deferred (recorded without stopping); preconditions stop the run; "harness"
 *   notes record whether a targeted interleaving was actually exercised and never stop the run.
 * - Log: JSON lines `f1-<sha7>-race-<suffix>.log` in this directory, never overwritten. Development probes
 *   may redirect with XAI_F1_EVIDENCE_DIR (outside the repository); committed evidence never does.
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

const KEY = "xai_pref_sticky_pin_default";
const TOGGLE = "Pin by Default";
const RETRY = "Retry Pin by Default";
const FAILED = ["Pin by Default was not saved."];
const EDIT_SWITCH = "Restore Default Size";
const EDIT_KEY = "xai_pref_sticky_restore_size";
const STAY = "Stay";
const DISCARD = "Discard local changes and leave";
const DIALOG = { label: "Unsaved Sticky Note draft", text: "Sticky Note has unsaved changes.", buttons: ["Stay", "Export current draft", "Discard local changes and leave"] };

if (!requested) throw Error("Revision required");
if (mode !== "race") throw Error("Unsupported mode; use race");
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const resolved = execFileSync("git", ["rev-parse", "--verify", `${requested}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const short = resolved.slice(0, 7);
const evidencePath = join(evidenceDir, `f1-${short}-race-${suffix}.log`);
if (existsSync(evidencePath)) throw Error("Evidence exists; use a distinct suffix");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const records = [];
const runtimeErrors = [];
const consoleWarnings = [];
const unexpectedDialogs = [];
const record = (name, value = {}) => {
  records.push({ ...value, name });
  if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 400));
};
let checks = 0;
let lastCheckId = null;
const pre = (id, condition, details = {}) => {
  checks += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { ...details, id, kind: "precondition", pass });
  if (!pass) throw Object.assign(new Error(`PRECONDITION: ${id}`), { checkId: id, checkKind: "precondition" });
};
const deferredFailures = [];
const observe = (id, condition, details = {}) => {
  checks += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { ...details, id, kind: "product", deferred: true, pass });
  if (!pass) deferredFailures.push(id);
  return pass;
};
const harnessGaps = [];
const harness = (id, condition, details = {}) => {
  checks += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { ...details, id, kind: "harness", deferred: true, pass });
  if (!pass) harnessGaps.push(id);
  return pass;
};

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const fixtureSource = readFileSync(join(output, "f1-race-host.tsx"), "utf8");
const preludeSource = readFileSync(join(output, "f1-prelude.js"), "utf8");
const dependencyNodeModules = join(dependencyRoot, "node_modules");
if (!existsSync(dependencyNodeModules)) throw Error("PRECONDITION: dependency tree missing; set XAI_DEPS_ROOT");
const archiveLock = execFileSync("git", ["show", `${resolved}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
const dependencyLock = readFileSync(join(dependencyRoot, "pnpm-lock.yaml"));
if (sha256(dependencyLock) !== sha256(archiveLock)) throw Error("PRECONDITION: dependency checkout lockfile differs from the candidate");
const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find((name) => name.startsWith("esbuild@0.28.1"));
if (!esbuildFolder) throw Error("PRECONDITION: pinned esbuild 0.28.1 missing");
const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
const docsHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const productDelta = execFileSync("git", ["diff", "--name-only", resolved, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim();
const versionOf = (name) => {
  try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
};

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-f1r-")));
const snapshot = join(directory, "source");
const profile = join(directory, "profile");
let server = null;
let session = null;
let origin = "";

// ---------------------------------------------------------------------------------------------------
// Browser session (pattern of ./verify-f1.mjs, which is not modified)
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
async function clickButton(name, scope, label = name) {
  const selector = await evaluate(`(() => {
    document.querySelectorAll("[data-f1-target]").forEach((element) => element.removeAttribute("data-f1-target"));
    const element = [...document.querySelectorAll(${JSON.stringify(`${scope} button`)})]
      .find((candidate) => (candidate.getAttribute("aria-label") ?? candidate.textContent).trim() === ${JSON.stringify(name)});
    if (!element) return null;
    element.setAttribute("data-f1-target", "1");
    return '[data-f1-target="1"]';
  })()`);
  pre(`input:button-present:${label}`, selector, { scope, name });
  await trustedClick(selector, label);
  await evaluate('document.querySelector("[data-f1-target]")?.removeAttribute("data-f1-target")');
}
async function sidebarClick(name, label) {
  const selector = await evaluate(`(() => {
    document.querySelectorAll("[data-f1-target]").forEach((element) => element.removeAttribute("data-f1-target"));
    const row = [...document.querySelectorAll(".settings-sidebar .list-row")].find((candidate) => candidate.textContent.trim() === ${JSON.stringify(name)});
    if (!row) return null;
    row.setAttribute("data-f1-target", "1");
    return '[data-f1-target="1"]';
  })()`);
  pre(`input:sidebar-row-present:${label}`, selector, { name });
  await trustedClick(selector, label);
  await evaluate('document.querySelector("[data-f1-target]")?.removeAttribute("data-f1-target")');
}

/** Compact, sequence-ordered timeline of one case window (all instruments share one sequence). */
function timeline(view) {
  const items = [];
  const blockerText = (list) => `[${list.join(",")}]`;
  for (const entry of view.clicks) items.push([entry.seq, `click ${entry.target}${entry.trusted ? "" : " (script)"}`]);
  for (const entry of view.attempts) if (entry.key === KEY || entry.key === EDIT_KEY) items.push([entry.seq, `${entry.op} ${entry.key.replace("xai_pref_sticky_", "")} ${entry.value ?? ""} ${entry.outcome}`.replace(/\s+/g, " ").trim()]);
  for (const entry of view.blockerCalls) items.push([entry.seq, `${entry.op.toUpperCase()} blocker#${entry.blocker} live=#${entry.liveBlocker}:${entry.liveState}${entry.threw ? ` THREW ${entry.threw}` : ""}`]);
  for (const entry of view.router) items.push([entry.seq, `router ${entry.action} ${entry.path}#${entry.key} blockers=${blockerText(entry.blockers)}`]);
  for (const entry of view.pops) items.push([entry.seq, `popstate ${entry.path}#${entry.key}`]);
  for (const entry of view.history) items.push([entry.seq, `${entry.method} ${entry.url}`]);
  for (const entry of view.react) {
    if (!entry.coord) continue;
    items.push([entry.seq, `react-commit p${entry.prio} coordinator blocker#${entry.coord.b}:${entry.coord.s} gv=${entry.coord.gv} iv=${entry.coord.iv} live=#${entry.live?.id}:${entry.live?.state}${isStale(entry) ? " STALE" : ""}`]);
  }
  for (const entry of view.dialogs) items.push([entry.seq, `dialog ${entry.open ? "OPEN" : "closed"} live=#${entry.live?.id}:${entry.live?.state}`]);
  for (const entry of view.arm) items.push([entry.seq, `ARM-CLICK ${entry.name} found=${entry.found} live=#${entry.live?.id}:${entry.live?.state} committed=#${entry.committedCoordinator?.b}:${entry.committedCoordinator?.s} beforeRender=${entry.beforeRender}`]);
  for (const entry of view.sync) items.push([entry.seq, `SYNC-CLICKS ${entry.targets.join(" + ")} live=#${entry.live?.id}:${entry.live?.state} committed=#${entry.committedCoordinator?.b}:${entry.committedCoordinator?.s} gv=${entry.committedCoordinator?.gv}`]);
  for (const entry of view.unload) items.push([entry.seq, `beforeunload-listener ${entry.op} active=${entry.active}`]);
  for (const entry of view.consoleErrors) items.push([entry.seq, `console.error ${entry.text.slice(0, 140)}`]);
  for (const entry of view.errorUi) items.push([entry.seq, `ERROR-UI ${entry.path}`]);
  items.sort((left, right) => left[0] - right[0]);
  return items.slice(0, 200).map(([seq, text]) => `${seq} ${text}`);
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
    stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: "f1-race-host.tsx" },
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
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== "f1-race-host.tsx");
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const productFiles = [
    "apps/web/src/routes/modules/departureCoordinator.tsx",
    "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
    "apps/web/src/routes/modules/settingsDeparture.ts",
    "packages/plugin-web-settings-rest/src/panes/stickyPane.tsx",
    "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
    "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts",
    "packages/plugin-web-storage/src/internal/prefMutation.ts",
    "packages/plugin-web-storage/src/internal/accountScope.ts",
    "packages/xai-web-shell/src/Shell.tsx",
  ];
  const productHashes = Object.fromEntries(productFiles.map((file) => [file, sha256(readFileSync(join(snapshot, file)))]));
  const productInBundle = productFiles.every((file) => inputs.includes(file));
  const page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>F1 race fixture</title><link rel="stylesheet" href="/__f1/bundle.css"><script src="/__f1/prelude.js"></script></head><body><div id="app"></div><script type="module" src="/__f1/bundle.js"></script></body></html>';
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
    requested, resolved, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix,
    browser: version.product, protocol: version.protocolVersion, viewport, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock) },
    fixtureSha256: sha256(fixtureSource), preludeSha256: sha256(preludeSource), runnerSha256,
    bundleSha256: sha256(js), bundleCssSha256: sha256(css),
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    productHashes, origin: "127.0.0.1 (ephemeral port)",
  });
  pre("baseline:docs-head-product-tree-equals-candidate", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === sha256(archiveLock));
  pre("baseline:bundle-inputs-pinned-to-archive", foreign.length === 0 && productInBundle, { foreign, productInBundle });
  pre("baseline:no-mount-runtime-errors", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 3) });
  pre("baseline:react-commit-observer-active", await evaluate("verify.reactCommitsObserved() > 0 && verify.coordinatorObserved() && verify.hookErrors() === 0"), {
    commits: await evaluate("verify.reactCommitsObserved()"), hookErrors: await evaluate("verify.hookErrors()"),
  });
  pre("baseline:navigation-api-available", await evaluate("verify.navEntries() !== null"));

  // History: start entry (hotkeys) -> P (date_time, with state) -> S (Sticky)
  await evaluate('void verify.router.navigate("/app/settings/date_time", { state: { token: "race-P" } }), true');
  pre("setup:p-mounted", await waitUntil("verify.paneId() === 'date_time'", 6000));
  const P = await evaluate("verify.location()");
  await evaluate('void verify.router.navigate("/app/settings/sticky"), true');
  pre("setup:s-mounted", await waitUntil("verify.paneId() === 'sticky'", 6000));
  await delay(300);
  const S = await evaluate("verify.location()");
  const triple = (location) => ({ pathname: location.pathname, key: location.key, state: location.state ?? null });
  const sameTriple = (left, right) => isDeepStrictEqual(triple(left), triple(right));
  async function stackNow() {
    const browser = await cdp("Page.getNavigationHistory");
    const nav = await evaluate("verify.navEntries()");
    return { ids: browser.entries.map((entry) => `${entry.id}:${new URL(entry.url).pathname}`), currentIndex: browser.currentIndex, navKeys: nav.entries.map((entry) => entry.key), navIndex: nav.index };
  }
  /** Same browser entries and Navigation API entries, with both current indexes moved by `shift`. */
  const stackIntact = (now, base, shift) => isDeepStrictEqual(now.ids, base.ids) && now.currentIndex === base.currentIndex + shift
    && isDeepStrictEqual(now.navKeys, base.navKeys) && now.navIndex === base.navIndex + shift;
  const initialStack = await stackNow();
  pre("setup:history-p-then-s", initialStack.ids.length >= 3 && P.key !== S.key && S.pathname === "/app/settings/sticky", { P, S, stack: initialStack });
  record("history-entries", { P, S, stack: initialStack });
  await evaluate(`verify.denySet(${JSON.stringify(KEY)})`);

  async function traverse(id, direction) {
    const history = await cdp("Page.getNavigationHistory");
    const index = history.currentIndex + (direction === "back" ? -1 : 1);
    const target = history.entries[index];
    pre(`${id}:traverse-${direction}-entry-exists`, Boolean(target), { currentIndex: history.currentIndex });
    await cdp("Page.navigateToHistoryEntry", { entryId: target.id });
    return { fromIndex: history.currentIndex, toIndex: index, entryId: target.id };
  }
  const restoredExpr = `verify.windowPath() === ${JSON.stringify(S.pathname)} && verify.historyStateKey() === ${JSON.stringify(S.key)}`;
  const failedShownExpr = `(() => { const alerts = verify.alerts(); return ${JSON.stringify(FAILED)}.every((part) => alerts.some((text) => text.includes(part))) && verify.buttons().includes(${JSON.stringify(RETRY)}); })()`;
  const draftKept = () => evaluate(failedShownExpr);
  async function ensureFailedDraft(id) {
    pre(`${id}:at-s-no-dialog`, await evaluate(`verify.location().key === ${JSON.stringify(S.key)} && verify.paneId() === "sticky" && verify.dialog() === null`), { location: await evaluate("verify.location()") });
    if (await draftKept()) {
      pre(`${id}:failed-draft-present`, true);
      return;
    }
    const editMark = await evaluate("verify.mark()");
    await trustedClick(`.settings-detail [role="switch"][aria-label="${TOGGLE}"]`, `${id}:toggle ${TOGGLE}`);
    const shown = await waitUntil(failedShownExpr, 5000);
    const view = await evaluate(`verify.window(${editMark})`);
    const denied = view.attempts.filter((entry) => entry.op === "set" && entry.key === KEY && entry.outcome === "denied");
    pre(`${id}:save-failed-with-retry-offered`, shown && denied.length >= 1, { denied, alerts: await evaluate("verify.alerts()") });
  }
  /** Browser Back held by the guard; returns the live blocked blocker id once the coordinator committed it. */
  async function holdBack(id, product = false) {
    const step = await traverse(id, "back");
    const opened = await waitUntil("verify.dialog() !== null", 4000);
    const restored = await waitUntil(restoredExpr, 4000);
    const rendered = await waitUntil("verify.liveBlockerRendered()", 4000);
    await delay(250);
    const state = await evaluate("({ location: verify.location(), dialog: verify.dialog(), live: verify.live(), committed: verify.committedCoordinator() })");
    const held = opened && restored && rendered && state.live?.state === "blocked" && sameTriple(state.location, S) && isDeepStrictEqual(state.dialog, DIALOG);
    const details = { step, dialog: state.dialog, live: state.live, committed: state.committed, location: triple(state.location) };
    if (product) observe(`${id}:held-dialog-open-location-s`, held, details);
    else pre(`${id}:held-dialog-open-location-s`, held, details);
    return held ? state.live.id : null;
  }
  const caseView = (mark) => evaluate(`verify.window(${mark})`);
  const endState = () => evaluate(`({ location: verify.location(), windowPath: verify.windowPath(), dialog: verify.dialog(), live: verify.live(), blockers: verify.blockers(), unload: verify.unloadActive(), physical: verify.physical(${JSON.stringify(KEY)}) })`);
  const writesOf = (view, key = KEY) => view.attempts.filter((entry) => entry.key === key && (entry.op === "set" || entry.op === "remove"));
  const blockedNow = (state) => state.blockers.some((entry) => entry.state === "blocked");
  /** Settlement accounting shared by every case. */
  function settlement(view) {
    const proceeds = view.blockerCalls.filter((entry) => entry.op === "proceed");
    const resets = view.blockerCalls.filter((entry) => entry.op === "reset");
    const perBlocker = {};
    for (const entry of view.blockerCalls) perBlocker[entry.blocker] = (perBlocker[entry.blocker] ?? 0) + 1;
    const nonLive = view.blockerCalls.filter((entry) => entry.liveBlocker !== entry.blocker || entry.liveState !== "blocked");
    const throws = view.blockerCalls.filter((entry) => entry.threw);
    return { proceeds, resets, perBlocker, nonLive, throws, maxPerBlocker: Math.max(0, ...Object.values(perBlocker)) };
  }
  function commonChecks(id, view, sum, errorsAtStart) {
    const caseErrors = runtimeErrors.slice(errorsAtStart);
    observe(`${id}:no-double-settlement-each-blocker-at-most-once`, sum.maxPerBlocker <= 1, { perBlocker: sum.perBlocker });
    observe(`${id}:every-blocker-call-on-live-blocked-blocker`, sum.nonLive.length === 0, { nonLive: sum.nonLive });
    observe(`${id}:no-blocker-throw-no-invalid-transition`, sum.throws.length === 0
      && !view.consoleErrors.some((entry) => /Invalid blocker state transition/.test(entry.text))
      && !caseErrors.some((entry) => /Invalid blocker state transition/.test(entry.text)), { throws: sum.throws });
    observe(`${id}:zero-runtime-errors-no-error-boundary`, view.consoleErrors.length === 0 && view.errorUi.length === 0 && caseErrors.length === 0, {
      consoleErrors: view.consoleErrors.map((entry) => ({ seq: entry.seq, path: entry.path, text: entry.text.slice(0, 200) })), errorUi: view.errorUi, cdpRuntimeErrors: caseErrors.slice(0, 3),
    });
  }
  function finish(id, extra, view) {
    const sum = settlement(view);
    const outcome = { case: id, ...extra, proceeds: sum.proceeds.length, resets: sum.resets.length, perBlocker: sum.perBlocker, nonLive: sum.nonLive.length, throws: sum.throws.length,
      staleCommits: view.react.filter(isStale).length, dialogTransitions: view.dialogs.map((entry) => (entry.open ? "open" : "closed")) };
    outcomes.push(outcome);
    record("observation", { ...outcome, timeline: timeline(view) });
    return sum;
  }

  // ===============================================================================================
  // r1 / r3: second Back, then Stay / Discard clicked BEFORE React renders the second blocker
  // ===============================================================================================
  async function beforeRenderCase(id, choice) {
    const errorsAtStart = runtimeErrors.length;
    await ensureFailedDraft(id);
    const base = await stackNow();
    const mark = await evaluate("verify.mark()");
    const first = await holdBack(`${id}:first-back`);
    await evaluate(`verify.armClickOnNextBlocked(${JSON.stringify(choice)})`);
    const step2 = await traverse(`${id}:second-back`, "back");
    const fired = await waitUntil(`verify.window(${mark}).arm.length > 0`, 4000);
    const arm = (await caseView(mark)).arm[0] ?? null;
    pre(`${id}:script-click-fired-on-new-blocked-blocker`, fired && arm?.found && arm.live?.state === "blocked" && arm.live.id !== first && !arm.error, { arm, first, step2 });
    pre(`${id}:click-landed-before-react-rendered-second-blocker`, arm.beforeRender === true && arm.committedCoordinator?.b === first && arm.committedCoordinator?.s === "blocked", { arm });
    const second = arm.live.id;
    await waitUntil(restoredExpr, 4000);
    if (choice === DISCARD) await waitUntil(`verify.location().key === ${JSON.stringify(P.key)}`, 5000);
    await delay(1200);
    let state = await endState();
    const held = state.dialog !== null && state.live?.state === "blocked";
    const released = choice === DISCARD && state.dialog === null && sameTriple(state.location, P);
    const stayed = choice === STAY && state.dialog === null && !blockedNow(state) && sameTriple(state.location, S);
    const lost = !held && !released && !stayed;
    observe(`${id}:decision-never-lost-held-or-${choice === STAY ? "stayed" : "released"}`, !lost, { dialog: state.dialog, live: state.live, blockers: state.blockers, location: triple(state.location) });
    const outcomeKind = held ? "held-with-dialog-for-live-blocker" : released ? "released-on-re-evaluation" : stayed ? "stayed" : "LOST";
    if (held) {
      observe(`${id}:re-prompt-holds-the-live-second-blocker`, state.live.id === second && isDeepStrictEqual(state.dialog, DIALOG) && sameTriple(state.location, S), { live: state.live, second, dialog: state.dialog });
      await clickButton(choice, ".settings-departure-dialog", `${id}:${choice} (trusted, re-prompt)`);
      if (choice === DISCARD) await waitUntil(`verify.location().key === ${JSON.stringify(P.key)}`, 5000);
      else await waitUntil("verify.dialog() === null", 3000);
      await delay(800);
      state = await endState();
    }
    const view = await caseView(mark);
    const stack = await stackNow();
    const sum = finish(id, { choice, timing: "before-render", outcome: outcomeKind, first, second, arm }, view);
    if (choice === STAY) {
      observe(`${id}:stay-zero-proceeds-one-reset-on-second-blocker`, sum.proceeds.length === 0 && sum.resets.length === 1 && sum.resets[0].blocker === second, { blockerCalls: view.blockerCalls });
      observe(`${id}:final-dialog-closed-no-blocked-blocker`, state.dialog === null && !blockedNow(state), { dialog: state.dialog, blockers: state.blockers });
      observe(`${id}:location-s-zero-commits-zero-push-replace`, sameTriple(state.location, S) && state.windowPath === S.pathname && view.commits.length === 0 && view.history.length === 0, { location: triple(state.location), commits: view.commits, history: view.history });
      observe(`${id}:history-stack-intact-at-s`, stackIntact(stack, base, 0), { stack, base });
      observe(`${id}:draft-kept-zero-writes`, (await draftKept()) && writesOf(view).length === 0, { writes: writesOf(view) });
    } else {
      observe(`${id}:released-exactly-once-one-proceed-on-second-blocker-zero-resets`, sum.proceeds.length === 1 && sum.proceeds[0].blocker === second && sum.resets.length === 0, { blockerCalls: view.blockerCalls });
      observe(`${id}:location-deep-equal-p-one-pop-commit-zero-push-replace`, sameTriple(state.location, P) && state.windowPath === P.pathname && view.commits.length === 1 && view.commits[0].key === P.key && view.commits[0].action === "POP" && view.history.length === 0, { location: triple(state.location), commits: view.commits, history: view.history });
      observe(`${id}:history-stack-intact-at-p`, stackIntact(stack, base, -1), { stack, base });
      observe(`${id}:dialog-closed-draft-discarded-zero-writes-no-unload-listener`, state.dialog === null && writesOf(view).length === 0 && state.unload === 0 && !blockedNow(state), { dialog: state.dialog, writes: writesOf(view), unload: state.unload, blockers: state.blockers });
    }
    commonChecks(id, view, sum, errorsAtStart);
    if (choice === DISCARD) await returnToS(id);
  }
  async function returnToS(id) {
    await traverse(`${id}:return`, "forward");
    const back = await waitUntil(`verify.location().key === ${JSON.stringify(S.key)} && verify.paneId() === "sticky" && verify.dialog() === null`, 6000);
    await delay(400);
    pre(`${id}:returned-to-s-clean`, back && !(await draftKept()), { location: await evaluate("verify.location()") });
  }

  // ===============================================================================================
  // r2 / r4: second Back, then trusted Stay / Discard AFTER the second blocker rendered (rebind)
  // ===============================================================================================
  async function afterRenderCase(id, choice) {
    const errorsAtStart = runtimeErrors.length;
    await ensureFailedDraft(id);
    const base = await stackNow();
    const mark = await evaluate("verify.mark()");
    const first = await holdBack(`${id}:first-back`);
    const firstCommitted = await evaluate("verify.committedCoordinator()");
    const step2 = await traverse(`${id}:second-back`, "back");
    const rendered = await waitUntil(`(() => { const live = verify.live(); return !!live && live.id !== ${first} && verify.liveBlockerRendered(); })()`, 4000);
    const restored = await waitUntil(restoredExpr, 4000);
    await delay(300);
    const before = await evaluate("({ live: verify.live(), committed: verify.committedCoordinator(), dialog: verify.dialog(), location: verify.location() })");
    pre(`${id}:second-blocker-rendered-dialog-open-before-click`, rendered && restored && before.dialog !== null && before.live?.state === "blocked" && before.live.id !== first && before.committed?.b === before.live.id, { before, first, step2 });
    const second = before.live.id;
    const rebindCommit = (await caseView(mark)).react.some((entry) => entry.coord && entry.coord.b === second && entry.coord.iv > firstCommitted.iv);
    harness(`${id}:intent-rebound-to-second-blocker-observed`, rebindCommit, { firstCommitted, committed: before.committed });
    await clickButton(choice, ".settings-departure-dialog", `${id}:${choice} (trusted)`);
    if (choice === DISCARD) await waitUntil(`verify.location().key === ${JSON.stringify(P.key)}`, 5000);
    else await waitUntil("verify.dialog() === null", 3000);
    await delay(900);
    const state = await endState();
    const view = await caseView(mark);
    const stack = await stackNow();
    const clickSeq = view.clicks.filter((entry) => entry.trusted && entry.target === choice).at(-1)?.seq ?? Infinity;
    const reopened = view.dialogs.some((entry) => entry.open && entry.seq > clickSeq);
    const sum = finish(id, { choice, timing: "after-render", first, second, reopenedAfterClick: reopened }, view);
    observe(`${id}:first-blocker-never-settled`, !view.blockerCalls.some((entry) => entry.blocker === first), { blockerCalls: view.blockerCalls });
    if (choice === STAY) {
      observe(`${id}:stay-one-reset-on-live-second-blocker-zero-proceeds`, sum.proceeds.length === 0 && sum.resets.length === 1 && sum.resets[0].blocker === second, { blockerCalls: view.blockerCalls });
      observe(`${id}:dialog-closed-not-reopened-no-blocked-blocker`, state.dialog === null && !reopened && !blockedNow(state), { dialog: state.dialog, blockers: state.blockers });
      observe(`${id}:location-s-zero-commits-zero-push-replace`, sameTriple(state.location, S) && state.windowPath === S.pathname && view.commits.length === 0 && view.history.length === 0, { location: triple(state.location), commits: view.commits, history: view.history });
      observe(`${id}:history-stack-intact-at-s`, stackIntact(stack, base, 0), { stack, base });
      observe(`${id}:draft-kept-zero-writes`, (await draftKept()) && writesOf(view).length === 0, { writes: writesOf(view) });
    } else {
      observe(`${id}:discard-one-proceed-on-live-second-blocker-zero-resets`, sum.proceeds.length === 1 && sum.proceeds[0].blocker === second && sum.resets.length === 0, { blockerCalls: view.blockerCalls });
      observe(`${id}:location-deep-equal-p-one-pop-commit-zero-push-replace`, sameTriple(state.location, P) && state.windowPath === P.pathname && view.commits.length === 1 && view.commits[0].key === P.key && view.commits[0].action === "POP" && view.history.length === 0, { location: triple(state.location), commits: view.commits, history: view.history });
      observe(`${id}:history-stack-intact-at-p`, stackIntact(stack, base, -1), { stack, base });
      observe(`${id}:dialog-closed-zero-writes-no-unload-listener`, state.dialog === null && writesOf(view).length === 0 && state.unload === 0 && !blockedNow(state), { dialog: state.dialog, writes: writesOf(view), unload: state.unload });
    }
    commonChecks(id, view, sum, errorsAtStart);
    if (choice === DISCARD) await returnToS(id);
  }

  await beforeRenderCase("r1", STAY);
  await afterRenderCase("r2", STAY);
  await beforeRenderCase("r3", DISCARD);
  await afterRenderCase("r4", DISCARD);

  // ===============================================================================================
  // k: contract §9 row k. Held Back, epoch change A->B cancels it once; fresh device protection.
  // ===============================================================================================
  {
    const id = "k";
    const errorsAtStart = runtimeErrors.length;
    await ensureFailedDraft(id);
    const base = await stackNow();
    const scopeA = await evaluate("verify.scope()");
    pre("k:starts-in-account-a", scopeA.scopeKind === "account" && scopeA.accountId === "f1-race-A", scopeA);
    const mark = await evaluate("verify.mark()");
    const held = await holdBack("k:back");
    const committedBefore = await evaluate("verify.committedCoordinator()");
    const epochMark = await evaluate("verify.mark()");
    const toB = await evaluate("verify.activateB()");
    pre("k:scope-b-new-epoch", toB.scopeKind === "account" && toB.accountId === "f1-race-B" && toB.epoch > scopeA.epoch, toB);
    const cancelled = await waitUntil("verify.dialog() === null", 3000);
    await delay(1200);
    const state = await endState();
    const view = await caseView(mark);
    const stack = await stackNow();
    const afterEpoch = view.react.filter((entry) => entry.coord && entry.seq > epochMark);
    harness("k:guard-re-registered-after-epoch-change", afterEpoch.some((entry) => entry.coord.gv > committedBefore.gv), { committedBefore, after: afterEpoch.slice(0, 6).map((entry) => entry.coord) });
    const reopened = view.dialogs.some((entry) => entry.open && entry.seq > epochMark);
    const sum = finish("k", { scopeA, toB, held, reopenedAfterEpoch: reopened }, view);
    observe("k:old-pop-intent-cancelled-exactly-once", cancelled && sum.resets.length === 1 && sum.resets[0].blocker === held && sum.proceeds.length === 0, { blockerCalls: view.blockerCalls });
    observe("k:dialog-not-reopened-from-stale-snapshot-no-blocked-blocker", state.dialog === null && !reopened && !blockedNow(state), { dialog: state.dialog, blockers: state.blockers, dialogs: view.dialogs });
    observe("k:location-s-zero-commits-zero-push-replace-stack-intact", sameTriple(state.location, S) && view.commits.length === 0 && view.history.length === 0 && stackIntact(stack, base, 0), { location: triple(state.location), commits: view.commits, stack });
    observe("k:device-draft-survives-epoch", await draftKept(), { alerts: await evaluate("verify.alerts()") });
    commonChecks("k", view, sum, errorsAtStart);
    // Fresh device protection under B.
    const freshMark = await evaluate("verify.mark()");
    const fresh = await holdBack("k:fresh-back", true);
    if (fresh !== null) {
      await clickButton(STAY, ".settings-departure-dialog", "k:fresh Stay (trusted)");
      await waitUntil("verify.dialog() === null", 3000);
      await delay(700);
    }
    const freshState = await endState();
    const freshView = await caseView(freshMark);
    const freshSum = finish("k-fresh", { fresh }, freshView);
    observe("k:fresh-protection-guards-then-stay-one-reset", fresh !== null && freshSum.resets.length === 1 && freshSum.resets[0].blocker === fresh && freshSum.proceeds.length === 0
      && freshState.dialog === null && sameTriple(freshState.location, S) && freshView.commits.length === 0, { blockerCalls: freshView.blockerCalls });
    commonChecks("k-fresh", freshView, freshSum, errorsAtStart);
    // Back to A with no held intent: nothing to settle.
    const restoreMark = await evaluate("verify.mark()");
    const toA = await evaluate("verify.activateA()");
    await delay(700);
    const restoreView = await caseView(restoreMark);
    const restoreState = await endState();
    observe("k:epoch-change-without-intent-no-blocker-call-no-dialog", toA.accountId === "f1-race-A" && restoreView.blockerCalls.length === 0 && restoreState.dialog === null
      && restoreView.dialogs.length === 0 && sameTriple(restoreState.location, S) && restoreView.commits.length === 0, { toA, blockerCalls: restoreView.blockerCalls, dialogs: restoreView.dialogs });
    record("row", { row: "k", toB, toA, held, fresh });
  }

  // ===============================================================================================
  // g: contract §9 row g. Stay + same-task pane edit does not reopen; fresh intents still prompt.
  // ===============================================================================================
  {
    const errorsAtStart = runtimeErrors.length;
    await ensureFailedDraft("g1");
    const base = await stackNow();
    const mark = await evaluate("verify.mark()");
    const held = await holdBack("g1:back");
    const editBefore = await evaluate(`verify.switchState(${JSON.stringify(EDIT_SWITCH)})`);
    const found = await evaluate(`verify.syncClicks(["dialog:${STAY}", "switch:${EDIT_SWITCH}"])`);
    const sync = (await caseView(mark)).sync[0] ?? null;
    pre("g1:stay-and-pane-edit-dispatched-in-one-task", Array.isArray(found) && found.every(Boolean) && sync !== null, { found, sync });
    pre("g1:rendered-snapshot-blocked-at-dispatch", sync.live?.id === held && sync.live?.state === "blocked" && sync.committedCoordinator?.b === held && sync.committedCoordinator?.s === "blocked", { sync });
    await delay(1600);
    const state = await endState();
    const view = await caseView(mark);
    const stack = await stackNow();
    const after = view.react.filter((entry) => entry.coord && entry.seq > sync.seq);
    const staleReRegistration = after.some((entry) => entry.coord.b === held && entry.coord.s === "blocked" && entry.coord.gv > sync.committedCoordinator.gv);
    harness("g1:guard-re-registered-while-rendered-snapshot-still-blocked", staleReRegistration, { atDispatch: sync.committedCoordinator, commits: after.slice(0, 8).map((entry) => ({ seq: entry.seq, coord: entry.coord, live: entry.live })) });
    const reopened = view.dialogs.some((entry) => entry.open && entry.seq > sync.seq);
    const sum = finish("g1", { held, staleReRegistration, reopenedAfterStay: reopened, editBefore, editAfter: await evaluate(`verify.switchState(${JSON.stringify(EDIT_SWITCH)})`) }, view);
    const editWrites = writesOf(view, EDIT_KEY);
    observe("g1:stay-one-reset-zero-proceeds", sum.resets.length === 1 && sum.resets[0].blocker === held && sum.proceeds.length === 0, { blockerCalls: view.blockerCalls });
    observe("g1:guard-re-registration-after-stay-does-not-reopen-dialog", state.dialog === null && !reopened && !blockedNow(state), { dialog: state.dialog, dialogs: view.dialogs, blockers: state.blockers });
    observe("g1:location-s-zero-commits-zero-push-replace-stack-intact", sameTriple(state.location, S) && view.commits.length === 0 && view.history.length === 0 && stackIntact(stack, base, 0), { location: triple(state.location), commits: view.commits, stack });
    observe("g1:pane-edit-saved-once-pin-default-draft-kept", editWrites.length === 1 && editWrites[0].op === "set" && editWrites[0].outcome === "ok" && (await draftKept()) && writesOf(view).length === 0, { editWrites, writes: writesOf(view) });
    commonChecks("g1", view, sum, errorsAtStart);

    // g2: a fresh Back after Stay prompts again.
    const m2 = await evaluate("verify.mark()");
    const fresh = await holdBack("g2:fresh-back", true);
    if (fresh !== null) {
      await clickButton(STAY, ".settings-departure-dialog", "g2:Stay (trusted)");
      await waitUntil("verify.dialog() === null", 3000);
      await delay(700);
    }
    const s2 = await endState();
    const v2 = await caseView(m2);
    const sum2 = finish("g2", { fresh }, v2);
    observe("g2:fresh-back-after-stay-prompts-then-stay-one-reset", fresh !== null && sum2.resets.length === 1 && sum2.resets[0].blocker === fresh && sum2.proceeds.length === 0
      && s2.dialog === null && sameTriple(s2.location, S) && v2.commits.length === 0 && v2.history.length === 0, { blockerCalls: v2.blockerCalls });
    commonChecks("g2", v2, sum2, errorsAtStart);

    // g3: a fresh sidebar (PUSH) intent after Stay prompts again.
    const m3 = await evaluate("verify.mark()");
    await sidebarClick("Hotkeys", "g3:sidebar Hotkeys");
    const opened = await waitUntil("verify.dialog() !== null", 3000);
    await delay(300);
    const heldState = await endState();
    const heldView = await caseView(m3);
    observe("g3:fresh-sidebar-intent-after-stay-prompts", opened && isDeepStrictEqual(heldState.dialog, DIALOG) && sameTriple(heldState.location, S) && heldView.commits.length === 0 && heldView.history.length === 0, { dialog: heldState.dialog, location: triple(heldState.location) });
    if (opened) {
      await clickButton(STAY, ".settings-departure-dialog", "g3:Stay (trusted)");
      await waitUntil("verify.dialog() === null", 3000);
      await delay(700);
    }
    const s3 = await endState();
    const v3 = await caseView(m3);
    const sum3 = finish("g3", { opened }, v3);
    observe("g3:stay-keeps-location-zero-commits-no-blocker-calls", s3.dialog === null && sameTriple(s3.location, S) && v3.commits.length === 0 && v3.history.length === 0 && v3.blockerCalls.length === 0 && (await draftKept()), { blockerCalls: v3.blockerCalls, commits: v3.commits });
    commonChecks("g3", v3, sum3, errorsAtStart);
    record("row", { row: "g", held, fresh, sidebarPrompted: opened, staleReRegistration });
  }

  // ===============================================================================================
  // l: contract §9 row l. Held Back, root unmount; the router-deleted blocker is never reset.
  // ===============================================================================================
  {
    const errorsAtStart = runtimeErrors.length;
    await ensureFailedDraft("l");
    const held = await holdBack("l:back");
    const before = await evaluate("({ unload: verify.unloadActive(), wrapped: verify.navigateWrapped(), blockers: verify.blockers(), physical: verify.physical(" + JSON.stringify(KEY) + ") })");
    pre("l:held-blocker-unload-listener-and-wrapper-active-before-unmount", before.unload === 1 && before.wrapped === true && before.blockers.length === 1 && before.blockers[0].id === held && before.blockers[0].state === "blocked", before);
    const mark = await evaluate("verify.mark()");
    const children = await evaluate("verify.unmount()");
    await delay(500);
    const state = await evaluate(`({ blockers: verify.blockers(), unload: verify.unloadActive(), wrapped: verify.navigateWrapped(), location: verify.location(), windowPath: verify.windowPath(), physical: verify.physical(${JSON.stringify(KEY)}), children: document.getElementById("app").childElementCount })`);
    const view = await caseView(mark);
    const sum = finish("l", { held, children }, view);
    observe("l:root-emptied", children === 0 && state.children === 0, { children, after: state.children });
    observe("l:router-deleted-blocker-never-reset-zero-blocker-calls", view.blockerCalls.length === 0, { blockerCalls: view.blockerCalls });
    observe("l:no-phantom-blocker-left-in-router-state", state.blockers.length === 0, { blockers: state.blockers });
    observe("l:unload-listener-removed", state.unload === 0 && view.unload.some((entry) => entry.op === "remove"), { unload: view.unload, active: state.unload });
    observe("l:coordinator-navigate-wrapper-removed", state.wrapped === false, { wrapped: state.wrapped });
    observe("l:no-history-mutation-location-unchanged-zero-writes", view.history.length === 0 && view.commits.length === 0 && sameTriple(state.location, S) && state.windowPath === S.pathname
      && writesOf(view).length === 0 && state.physical === before.physical, { history: view.history, commits: view.commits, writes: writesOf(view) });
    commonChecks("l", view, sum, errorsAtStart);
    const navMark = await evaluate("verify.mark()");
    await traverse("l:after-unmount-back", "back");
    const moved = await waitUntil(`verify.location().key === ${JSON.stringify(P.key)}`, 4000);
    await delay(400);
    const navView = await caseView(navMark);
    const navState = await evaluate("({ blockers: verify.blockers(), location: verify.location() })");
    observe("l:browser-back-after-unmount-commits-without-blocker", moved && navView.commits.length === 1 && navView.commits[0].key === P.key && navView.commits[0].action === "POP"
      && navView.blockerCalls.length === 0 && navState.blockers.length === 0 && navView.history.length === 0, { commits: navView.commits, blockers: navState.blockers, blockerCalls: navView.blockerCalls });
    commonChecks("l-after", navView, settlement(navView), errorsAtStart);
    record("row", { row: "l", held, children, blockersAfter: state.blockers, unloadAfter: state.unload, wrappedAfter: state.wrapped });
  }

  pre("run:no-unexpected-javascript-dialogs", unexpectedDialogs.length === 0, { unexpectedDialogs });
  pre("run:react-observer-never-threw", (await evaluate("verify.hookErrors()")) === 0);
  observe("run:runtime-errors-zero", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 5) });
  const pass = deferredFailures.length === 0 && harnessGaps.length === 0;
  const verdict = deferredFailures.length ? "product-failure" : harnessGaps.length ? "harness-incomplete" : "pass";
  record("result", { pass, verdict, mode, checks, deferredFailures, harnessGaps, outcomes, runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 4), consoleWarnings: consoleWarnings.length });
  if (!pass) process.exitCode = 1;
} catch (error) {
  record("result", { pass: false, harnessError: true, mode, checks, deferredFailures, harnessGaps, outcomes, error: String(error?.stack ?? error).slice(0, 1500), checkId: error?.checkId ?? null, checkKind: error?.checkKind ?? null, runtimeErrorSamples: runtimeErrors.slice(0, 4) });
  process.exitCode = 1;
} finally {
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`);
  await closeSession().catch(() => {});
  server?.closeAllConnections?.();
  server?.close();
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  const last = records.at(-1);
  const summary = outcomes.map((entry) => `${entry.case}:${entry.proceeds}p/${entry.resets}r${entry.outcome ? `(${entry.outcome})` : ""}`).join(" ");
  console.log(`${last?.pass ? "PASS" : last?.harnessError ? "HARNESS-FAIL" : "FAIL"} ${relative(root, evidencePath)} verdict=${last?.verdict ?? "-"} checks=${checks} ${summary}${last?.harnessError ? ` error=${String(last?.error).split("\n")[0]}` : ""}${last?.deferredFailures?.length ? ` failures=${last.deferredFailures.join(",")}` : ""}${last?.harnessGaps?.length ? ` gaps=${last.harnessGaps.join(",")}` : ""}`);
}
