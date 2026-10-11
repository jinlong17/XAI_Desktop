/**
 * CP-FEATURES-01 batch 24 (contract §14 E5; reruns unchanged for E17): bounded Chrome F1 runner for the
 * Settings Features caller. Verification only: it repairs nothing, accepts nothing and changes no product
 * file, contract, ledger or existing evidence. It mirrors the frozen F1 runners
 * ../web-sticky-recovery-f1/verify-f1.mjs and verify-f1-callers.mjs (neither imported nor changed) and
 * reuses the frozen ../web-sticky-recovery-f1/f1-prelude.js READ-ONLY: its SHA-256 must equal the frozen
 * value below and the blob committed at this checkout's HEAD, or the run stops before anything is built.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-features-recovery-f1/verify-f1-features.mjs <revision> <selfcheck|features> <suffix>
 *
 * - Product: an immutable `git archive <revision>`; ./f1-features-host.tsx is bundled with esbuild from
 *   stdin with resolveDir = that archive. Every `@repo/*` specifier is pinned to the archive's own export;
 *   a guard plugin fails the build if any module is loaded from the packages/, apps/ or docs/ tree of the
 *   dependency checkout or of this runner's checkout. Third-party modules come from XAI_DEPS_ROOT only when
 *   its pnpm-lock.yaml SHA-256 equals the archive's (consistency gate).
 * - Page: the frozen f1-prelude.js (classic script, React commit observer) then the module bundle, served
 *   from 127.0.0.1 only (DNS for every other host maps to NOTFOUND); isolated headless Chrome profile; CDP
 *   trusted mouse input after a centre hit-test; browser Back through CDP Page.navigateToHistoryEntry (the
 *   browser's own traversal); the real window.confirm answered through Page.handleJavaScriptDialog.
 * - History per run: start (/app/settings/hotkeys) -> P (/app/settings/about, state {token:"f1-P"}) -> S
 *   (the pane under test). Every case starts clean at S; Back targets P; P mounts no guard.
 * - selfcheck (harness validity; must pass): composition, provenance, commit observer active, fixture
 *   fault/dispatch/confirm self-tests, the Features surface (8 switches and Reset to defaults present and
 *   hit-testable, keys and lock names), then three positive controls on the accepted Sticky guard
 *   registrant at the same revision: sr Retry-released Back, sd discard-released Back, s2 two-step Retry
 *   release (the first Retry keeps holding, the second releases). Each control must show a held POP with a
 *   coordinator commit carrying the router's live "blocked" blocker, and exactly one live proceed() from
 *   "blocked" with zero non-live blocker calls, one POP commit, zero push/replace and zero runtime errors.
 *   Every selfcheck assertion is a precondition.
 * - features: the contract §14 E17 cases, defined here once so later stages rerun this file unchanged:
 *     r1 Retry-released Back (Boards set fails), d1 discard-released Back (control), r2 r1 repeated,
 *     rb reset-batch-released Back (Reset to defaults with removeItem faults on Calendar and Habits; Retry
 *        Calendar keeps holding; Retry Habits releases exactly once).
 *   Each case first proves its failure was injected (fault armed and observed: a denied attempt on the key,
 *   bytes unchanged), then performs a browser Back. Before the fix (no guard) a case records "not held":
 *   the POP departure leaves Features with zero blocker calls. That is H8's correct before state, not an
 *   F1 signature. Once held, each case asserts the F1 oracle (deferred): location deep-equal P, exactly
 *   one POP commit and zero push/replace, the dialog closed, writes/removes as specified, exactly one live
 *   proceed() from "blocked", zero non-live blocker calls, zero runtime errors and no error boundary.
 * - Verdict per run: selfcheck "harness-valid" | "harness-invalid"; features "before-not-held" (every
 *   case valid and not held, no F1 signature), "fixed-pass" (every case held and released exactly once),
 *   "f1-signature" (a release with >= 2 proceed() and an invalid blocker transition), or "fail".
 * - Log: JSON lines `f1-<sha7>-<mode>-<suffix>.log` in this directory, never overwritten. Exit 0 = pass
 *   (selfcheck valid / features fixed-pass); 2 = harness valid but the features oracle failed (including
 *   the expected before-not-held state); 1 = harness invalid. Development probes may redirect with
 *   XAI_F1_EVIDENCE_DIR (outside the repository); committed evidence never does.
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
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_F1_EVIDENCE_DIR ?? output;
if (process.env.XAI_F1_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
if (!requested) throw Error("Revision required");
if (!["selfcheck", "features"].includes(mode)) throw Error(`Unsupported mode ${mode}; use selfcheck|features`);
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
/** selfcheck: every assertion is a precondition; features: product assertions are deferred. */
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
const fixtureSource = readFileSync(join(output, "f1-features-host.tsx"), "utf8");
const dependencyNodeModules = join(dependencyRoot, "node_modules");
if (!existsSync(dependencyNodeModules)) throw Error("PRECONDITION: dependency tree missing; set XAI_DEPS_ROOT");
const archiveLock = execFileSync("git", ["show", `${resolved}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 100 * 1024 * 1024 });
const dependencyLock = readFileSync(join(dependencyRoot, "pnpm-lock.yaml"));
if (sha256(dependencyLock) !== sha256(archiveLock)) throw Error("PRECONDITION: dependency checkout lockfile differs from the revision under test");
const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find((name) => name.startsWith("esbuild@0.28.1"));
if (!esbuildFolder) throw Error("PRECONDITION: pinned esbuild 0.28.1 missing");
const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
const docsHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const productDelta = execFileSync("git", ["diff", "--name-only", resolved, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim();
const versionOf = (name) => {
  try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
};
const REQUIRED_MODULES = [
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/settingsDeparture.ts",
  "apps/web/src/routes/modules/settingsPaneComposition.ts",
  "packages/xai-web-settings-features-panel/src/FeaturesPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresPane.tsx",
  "packages/plugin-web-settings-shell/src/SettingsFooter.tsx",
  "packages/plugin-web-settings-rest/src/panes/stickyPane.tsx",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/xai-web-shell/src/Shell.tsx",
];

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-f1-features-")));
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
      dialogs.push({ type: message.params.type, message: message.params.message, expected: Boolean(plan), accepted: plan ? plan.accept : false, afterCheck: lastCheckId });
      state.cdp("Page.handleJavaScriptDialog", { accept: plan ? plan.accept : false }).catch(() => {});
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

async function pointOf(selector, label) {
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
  return point;
}
async function trustedClick(selector, label) {
  const point = await pointOf(selector, label);
  await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await delay(60);
}
/** Tags exactly one button whose accessible name (aria-label, else text) equals `name` inside `scope`. */
async function tagButton(name, scope, label) {
  const found = await evaluate(`(() => {
    document.querySelectorAll("[data-f1-target]").forEach((element) => element.removeAttribute("data-f1-target"));
    const root = document.querySelector(${JSON.stringify(scope)});
    const matches = root ? [...root.querySelectorAll("button")].filter((button) => (button.getAttribute("aria-label") ?? button.textContent).replace(/\\s+/g, " ").trim() === ${JSON.stringify(name)}) : [];
    if (matches.length === 1) matches[0].setAttribute("data-f1-target", "1");
    return matches.length;
  })()`);
  pre(`input:exactly-one-button:${label}`, found === 1, { buttonName: name, scope, found });
  return '[data-f1-target="1"]';
}
async function clickButton(name, scope, label) {
  const selector = await tagButton(name, scope, label);
  await trustedClick(selector, label);
  await evaluate('document.querySelector("[data-f1-target]")?.removeAttribute("data-f1-target")');
}
const buttonPresent = (name, scope = ".settings-detail") => evaluate(`[...(document.querySelector(${JSON.stringify(scope)})?.querySelectorAll("button") ?? [])].some((button) => (button.getAttribute("aria-label") ?? button.textContent).replace(/\\s+/g, " ").trim() === ${JSON.stringify(name)})`);

/** Compact, sequence-ordered timeline of one window (all instruments share the prelude's sequence). */
function timeline(view, keys) {
  const items = [];
  const blockerText = (list) => `[${list.join(",")}]`;
  for (const entry of view.clicks) items.push([entry.seq, `click ${entry.target}${entry.trusted ? "" : " (untrusted)"}`]);
  for (const entry of view.locks) if (keys.some((key) => entry.name.includes(key))) items.push([entry.seq, `lock-request ${entry.name}`]);
  for (const entry of view.attempts) if (keys.includes(entry.key)) items.push([entry.seq, `${entry.op} ${entry.key.replace("xai_pref_", "")} ${entry.value ?? ""} ${entry.outcome}`.replace(/\s+/g, " ").trim()]);
  for (const entry of view.blockerCalls) items.push([entry.seq, `${entry.op.toUpperCase()} blocker#${entry.blocker} live=#${entry.liveBlocker}:${entry.liveState}${entry.threw ? ` THREW ${entry.threw}` : ""}`]);
  for (const entry of view.router) items.push([entry.seq, `router ${entry.action} ${entry.path}#${entry.key} blockers=${blockerText(entry.blockers)}`]);
  for (const entry of view.pops) items.push([entry.seq, `popstate ${entry.path}#${entry.key}`]);
  for (const entry of view.history) items.push([entry.seq, `${entry.method} ${entry.url}`]);
  for (const entry of view.storageDispatches) items.push([entry.seq, `dispatchEvent StorageEvent key=${entry.key}`]);
  for (const entry of view.react) {
    if (!entry.coord) continue;
    items.push([entry.seq, `react-commit p${entry.prio} coordinator blocker#${entry.coord.b}:${entry.coord.s} gv=${entry.coord.gv} iv=${entry.coord.iv} live=#${entry.live?.id}:${entry.live?.state}${isStale(entry) ? " STALE" : ""}`]);
  }
  for (const entry of view.consoleErrors) items.push([entry.seq, `console.error ${entry.text.slice(0, 140)}`]);
  for (const entry of view.errorUi) items.push([entry.seq, `ERROR-UI ${entry.path}`]);
  items.sort((left, right) => left[0] - right[0]);
  return items.slice(0, 180).map(([seq, text]) => `${seq} ${text}`);
}
const isStale = (entry) => Boolean(entry.coord && entry.coord.s === "blocked"
  && (!entry.live || entry.live.id !== entry.coord.b || entry.live.state !== "blocked"));

// ---------------------------------------------------------------------------------------------------
// Callers
// ---------------------------------------------------------------------------------------------------
const featureKey = (id) => `xai_pref_features_${id}`;
const FEATURES = {
  pane: "features", route: "/app/settings/features", label: "Unsaved Features draft",
  toggle: { key: featureKey("board"), selector: '.settings-detail [data-feature-id="board"] [role="switch"]', failed: "Boards was not saved.", retry: "Retry Boards", name: "Boards" },
  resetFields: [
    { key: featureKey("calendar"), failed: "Calendar was not reset to its default.", retry: "Retry Calendar", name: "Calendar" },
    { key: featureKey("habits"), failed: "Habits was not reset to its default.", retry: "Retry Habits", name: "Habits" },
  ],
  seeds: { [featureKey("board")]: "true", [featureKey("calendar")]: "false", [featureKey("habits")]: "false" },
};
const STICKY = {
  pane: "sticky", route: "/app/settings/sticky", label: "Unsaved Sticky Note draft",
  toggle: { key: "xai_pref_sticky_pin_default", selector: '.settings-detail [role="switch"][aria-label="Pin by Default"]', failed: "Pin by Default was not saved.", retry: "Retry Pin by Default", name: "Pin by Default" },
  second: { key: "xai_pref_sticky_restore_size", selector: '.settings-detail [role="switch"][aria-label="Restore Default Size"]', failed: "Restore Default Size was not saved.", retry: "Retry Restore Default Size", name: "Restore Default Size" },
};
const DIALOG = ".settings-departure-dialog";
const DISCARD = "Discard local changes and leave";
const P_ENTRY = { pathname: "/app/settings/about", state: { token: "f1-P" } };

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
  const archiveModules = new Set();
  const archiveRoot = snapshot + sep;
  const pinAndGuard = { name: "features-f1-archive-pin-guard", setup(buildApi) {
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
    stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: "f1-features-host.tsx" },
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
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== "f1-features-host.tsx");
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const missingRequired = REQUIRED_MODULES.filter((file) => !inputs.includes(file) || !archiveModules.has(file));
  const productHashes = Object.fromEntries(REQUIRED_MODULES.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Features F1 fixture</title><link rel="stylesheet" href="/__f1/bundle.css"><script src="/__f1/prelude.js"></script></head><body><div id="app"></div><script type="module" src="/__f1/bundle.js"></script></body></html>';
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
    requested, resolved, resolvedTree, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix,
    browser: version.product, protocol: version.protocolVersion, viewport, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock), extracted: sha256(extractedLock) },
    fileSha256: { "verify-f1-features.mjs": runnerSha256, "f1-features-host.tsx": sha256(fixtureSource) },
    frozenPrelude: { path: FROZEN_PRELUDE, sha256: preludeSha256, frozenSha256: FROZEN_PRELUDE_SHA256, committedAtHeadSha256: committedPreludeSha256, lastCommit: preludeLastCommit, readOnly: true },
    bundleSha256: sha256(js), bundleCssSha256: sha256(css),
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    guard: { forbiddenRoots, violations: guardViolations, archiveModulesLoaded: archiveModules.size },
    productHashes, origin: "127.0.0.1 (ephemeral port); every other host resolves to NOTFOUND",
  });
  pre("baseline:docs-head-product-tree-equals-revision", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === sha256(archiveLock) && sha256(extractedLock) === sha256(archiveLock));
  pre("baseline:frozen-prelude-hash-equals-committed", preludeSha256 === FROZEN_PRELUDE_SHA256 && committedPreludeSha256 === FROZEN_PRELUDE_SHA256);
  pre("baseline:guard-no-module-from-a-checkout", guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre("baseline:required-modules-bundled-from-archive", missingRequired.length === 0, { missingRequired });
  pre("baseline:no-mount-runtime-errors", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 3) });
  pre("baseline:react-commit-observer-active", await evaluate("verify.reactCommitsObserved() > 0 && verify.coordinatorObserved() && verify.hookErrors() === 0"), {
    commits: await evaluate("verify.reactCommitsObserved()"), hookErrors: await evaluate("verify.hookErrors()"),
  });

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
  async function navigateTo(pathname, state, pane, label) {
    await evaluate(`void verify.router.navigate(${JSON.stringify(pathname)}${state ? `, { state: ${JSON.stringify(state)} }` : ""}), true`);
    pre(`setup:${label}-mounted`, await waitUntil(`verify.paneId() === ${JSON.stringify(pane)}`, 6000));
    await delay(300);
    return evaluate("verify.location()");
  }

  /**
   * One F1 case. caller: FEATURES or STICKY; spec.failure: "toggle" | "reset" | "two-toggles";
   * spec.release: "retry" | "discard" | "two-step". strict=true turns every product assertion into a
   * precondition (selfcheck positive controls).
   */
  async function runCase(id, caller, spec, P, S, initialStack, strict) {
    const errorsAtStart = runtimeErrors.length;
    pre(`${id}:starts-clean-at-s`, await evaluate(`verify.location().key === ${JSON.stringify(S.key)} && verify.dialog() === null && verify.paneId() === ${JSON.stringify(caller.pane)}`));
    const keys =spec.failure === "reset" ? caller.resetFields.map((field) => field.key)
      : spec.failure === "two-toggles" ? [caller.toggle.key, caller.second.key] : [caller.toggle.key];
    const fields = spec.failure === "reset" ? caller.resetFields : spec.failure === "two-toggles" ? [caller.toggle, caller.second] : [caller.toggle];
    const bytesBefore = Object.fromEntries(await Promise.all(keys.map(async (key) => [key, await evaluate(`verify.physical(${JSON.stringify(key)})`)])));

    // 1. Inject the failure and prove it fired (fault armed and observed; bytes unchanged).
    const failMark = await evaluate("verify.mark()");
    let confirm = null;
    if (spec.failure === "reset") {
      for (const key of keys) await evaluate(`verify.denyRemove(${JSON.stringify(key)})`);
      for (const key of keys) pre(`${id}:seeded-bytes-present:${key}`, bytesBefore[key] !== null, { bytesBefore });
      const dialogsBefore = dialogs.length;
      dialogPlan.push({ accept: true });
      await clickButton("Reset to defaults", ".settings-detail", `${id}:Reset to defaults`);
      pre(`${id}:reset-confirmation-asked-and-accepted`, await waitFor(() => dialogs.length > dialogsBefore, 5000) && dialogs.at(-1).accepted, { dialogs: dialogs.slice(dialogsBefore) });
      confirm = dialogs.at(-1).message;
      const removed = await waitUntil(`(() => { const view = verify.window(${failMark}); return ${JSON.stringify(keys)}.every((key) => view.attempts.some((entry) => entry.op === "remove" && entry.key === key && entry.outcome === "denied")); })()`, 6000);
      await delay(500);
      const view = await evaluate(`verify.window(${failMark})`);
      const denied = view.attempts.filter((entry) => entry.op === "remove" && keys.includes(entry.key) && entry.outcome === "denied");
      const bytesNow = Object.fromEntries(await Promise.all(keys.map(async (key) => [key, await evaluate(`verify.physical(${JSON.stringify(key)})`)])));
      pre(`${id}:fault-armed-and-observed:remove-denied-on-both-keys`, removed && keys.every((key) => denied.some((entry) => entry.key === key)), { denied });
      pre(`${id}:faulted-bytes-unchanged`, isDeepStrictEqual(bytesNow, bytesBefore), { bytesNow, bytesBefore });
    } else {
      for (const field of fields) {
        await evaluate(`verify.denySet(${JSON.stringify(field.key)})`);
        await trustedClick(field.selector, `${id}:toggle ${field.name}`);
      }
      const deniedAll = await waitUntil(`(() => { const view = verify.window(${failMark}); return ${JSON.stringify(keys)}.every((key) => view.attempts.some((entry) => entry.op === "set" && entry.key === key && entry.outcome === "denied")); })()`, 6000);
      await delay(400);
      const bytesNow = Object.fromEntries(await Promise.all(keys.map(async (key) => [key, await evaluate(`verify.physical(${JSON.stringify(key)})`)])));
      pre(`${id}:fault-armed-and-observed:set-denied`, deniedAll, { faults: await evaluate("verify.faults()") });
      pre(`${id}:faulted-bytes-unchanged`, isDeepStrictEqual(bytesNow, bytesBefore), { bytesNow, bytesBefore });
    }
    const failView = await evaluate(`verify.window(${failMark})`);
    const latest = Object.fromEntries(keys.map((key) => [key, failView.attempts.filter((entry) => entry.op === "set" && entry.key === key && entry.outcome === "denied").at(-1)?.value ?? null]));
    const detail = await evaluate(`({ alerts: verify.alerts(), buttons: verify.buttons(), switches: verify.featureSwitches(),
      messagesShown: ${JSON.stringify(fields.map((field) => field.failed))}.map((message) => verify.detailText().includes(message)) })`);
    const feedbackShown = detail.messagesShown.every(Boolean) && (await Promise.all(fields.map((field) => buttonPresent(field.retry)))).every(Boolean);
    assertProduct(strict, `${id}:failure-feedback-and-retry-offered`, feedbackShown, { expected: fields.map((field) => [field.failed, field.retry]), alerts: detail.alerts, buttons: detail.buttons });
    record("observation", { id: `${id}:after-failure`, latest, confirm, storageKeyNullDispatches: failView.storageDispatches.filter((entry) => entry.key === null).length, switches: detail.switches, buttons: detail.buttons, alerts: detail.alerts });

    // 2. Browser Back (POP). Held = dialog open, URL and router location restored to S, zero commits.
    const holdMark = await evaluate("verify.mark()");
    const step = await traverse(id, "back");
    const settledHold = await waitUntil(`verify.dialog() !== null || verify.location().key === ${JSON.stringify(P.key)}`, 4000);
    await delay(400);
    const holdState = await evaluate(`({ location: verify.location(), windowPath: verify.windowPath(), stateKey: verify.historyStateKey(), dialog: verify.dialog(), paneId: verify.paneId(), view: verify.window(${holdMark}) })`);
    const held = holdState.dialog !== null && sameTriple(holdState.location, S) && holdState.windowPath === S.pathname && holdState.view.commits.length === 0;
    const heldBlocked = holdState.view.react.filter((entry) => entry.coord && entry.coord.s === "blocked" && entry.live && entry.live.id === entry.coord.b && entry.live.state === "blocked");
    assertProduct(strict, `${id}:back-held-dialog-open-url-restored`, held, {
      settled: settledHold, dialog: holdState.dialog, location: triple(holdState.location), windowPath: holdState.windowPath, step,
      commits: holdState.view.commits, blockerCalls: holdState.view.blockerCalls, paneId: holdState.paneId,
    });
    if (!held) {
      const leftForP = sameTriple(holdState.location, P) && holdState.windowPath === P.pathname;
      const outcome = {
        case: id, release: spec.release, held: false, leftTo: holdState.location.pathname, leftForPExactly: leftForP,
        dialogShown: holdState.dialog !== null, blockerCalls: holdState.view.blockerCalls.length, proceeds: 0,
        popCommits: holdState.view.commits.map((entry) => `${entry.action} ${entry.pathname}`), pushReplace: holdState.view.history.length,
        f1Signature: false, runtimeErrors: runtimeErrors.slice(errorsAtStart).length, consoleErrors: holdState.view.consoleErrors.length,
        note: "before state: the POP departure is not held (H8's correct before state, not an F1 signature)",
      };
      outcomes.push(outcome);
      record("observation", { ...outcome, timeline: timeline(holdState.view, keys) });
      await evaluate("verify.restore()");
      if (leftForP) {
        await traverse(`${id}:return`, "forward");
      } else {
        pre(`${id}:not-held-departure-reached-p`, false, { location: holdState.location });
      }
      const back = await waitUntil(`verify.location().key === ${JSON.stringify(S.key)} && verify.paneId() === ${JSON.stringify(caller.pane)} && verify.dialog() === null`, 6000);
      await delay(400);
      pre(`${id}:returned-to-s-clean`, back, { location: await evaluate("verify.location()") });
      return;
    }
    assertProduct(strict, `${id}:held-guard-label-is-caller-not-fallback`, holdState.dialog.label === caller.label, { dialog: holdState.dialog });
    assertProduct(strict, `${id}:commit-observer-saw-live-blocked-blocker`, heldBlocked.length > 0, { reactCommits: holdState.view.react.length, coordinatorCommits: holdState.view.react.filter((entry) => entry.coord).length });

    // 3. Release.
    const releaseMark = await evaluate("verify.mark()");
    let intermediate = null;
    if (spec.release === "retry") {
      await evaluate("verify.restore()");
      await clickButton(fields[0].retry, ".settings-detail", `${id}:${fields[0].retry}`);
    } else if (spec.release === "discard") {
      await evaluate("verify.restore()");
      await clickButton(DISCARD, DIALOG, `${id}:${DISCARD}`);
    } else {
      // two-step: Retry the first field successfully -> still held; then Retry the second -> released once.
      await evaluate(`verify.allow(${JSON.stringify(fields[0].key)})`);
      await clickButton(fields[0].retry, ".settings-detail", `${id}:${fields[0].retry}`);
      const firstDone = spec.failure === "reset"
        ? await waitUntil(`verify.physical(${JSON.stringify(fields[0].key)}) === null`, 6000)
        : await waitUntil(`verify.physical(${JSON.stringify(fields[0].key)}) === ${JSON.stringify(latest[fields[0].key])}`, 6000);
      await delay(600);
      intermediate = await evaluate(`({ location: verify.location(), windowPath: verify.windowPath(), dialog: verify.dialog(), view: verify.window(${releaseMark}) })`);
      assertProduct(strict, `${id}:first-retry-completed-and-departure-still-held`, firstDone && intermediate.dialog !== null && sameTriple(intermediate.location, S)
        && intermediate.windowPath === S.pathname && intermediate.view.commits.length === 0 && intermediate.view.blockerCalls.length === 0 && intermediate.view.history.length === 0,
      { firstDone, dialog: intermediate.dialog, location: triple(intermediate.location), commits: intermediate.view.commits, blockerCalls: intermediate.view.blockerCalls, history: intermediate.view.history });
      await evaluate(`verify.allow(${JSON.stringify(fields[1].key)})`);
      await clickButton(fields[1].retry, ".settings-detail", `${id}:${fields[1].retry}`);
    }
    const left = await waitUntil(`verify.location().key === ${JSON.stringify(P.key)}`, 6000);
    await delay(800);
    const state = await evaluate(`({ location: verify.location(), windowPath: verify.windowPath(), dialog: verify.dialog(), physical: Object.fromEntries(${JSON.stringify(keys)}.map((key) => [key, verify.physical(key)])), view: verify.window(${releaseMark}) })`);
    const view = state.view;
    const stackAfter = await cdp("Page.getNavigationHistory");
    const mutations = view.attempts.filter((entry) => keys.includes(entry.key) && (entry.op === "set" || entry.op === "remove"));
    const proceeds = view.blockerCalls.filter((entry) => entry.op === "proceed");
    const resets = view.blockerCalls.filter((entry) => entry.op === "reset");
    const nonLive = view.blockerCalls.filter((entry) => entry.blocker !== entry.liveBlocker || entry.liveState !== "blocked");
    const stale = view.react.filter(isStale);
    const caseErrors = runtimeErrors.slice(errorsAtStart);
    const okMutation = (key, op, value) => mutations.filter((entry) => entry.key === key && entry.op === op && entry.outcome === "ok" && (value === undefined || entry.value === value));
    let writesOk;
    if (spec.release === "discard") writesOk = mutations.length === 0;
    else if (spec.release === "retry") writesOk = mutations.length === 1 && okMutation(keys[0], "set", latest[keys[0]]).length === 1 && state.physical[keys[0]] === latest[keys[0]];
    else if (spec.failure === "reset") writesOk = keys.every((key) => okMutation(key, "remove").length === 1 && state.physical[key] === null) && mutations.every((entry) => entry.op === "remove");
    else writesOk = keys.every((key) => okMutation(key, "set", latest[key]).length === 1 && state.physical[key] === latest[key]);
    const results = {
      location: assertProduct(strict, `${id}:location-deep-equal-p`, left && sameTriple(state.location, P) && state.windowPath === P.pathname, { location: triple(state.location), expected: triple(P) }),
      commit: assertProduct(strict, `${id}:exactly-one-pop-commit-zero-push-replace`, view.commits.length === 1 && view.commits[0].key === P.key && view.commits[0].action === "POP"
        && view.history.length === 0 && view.pops.length === 1 && stackAfter.entries.length === initialStack.entries.length,
      { commits: view.commits, history: view.history, pops: view.pops.length, stackLength: stackAfter.entries.length }),
      outcome: assertProduct(strict, `${id}:dialog-closed-${spec.release === "discard" ? "zero-writes" : "intended-writes-once"}`, state.dialog === null && writesOk,
        { dialog: state.dialog, mutations, latest, physical: state.physical }),
      proceedOnce: assertProduct(strict, `${id}:exactly-one-live-proceed-from-blocked-zero-non-live-calls`, proceeds.length === 1 && proceeds[0].liveState === "blocked"
        && proceeds[0].liveBlocker === proceeds[0].blocker && nonLive.length === 0 && resets.length === 0 && !view.blockerCalls.some((entry) => entry.threw),
      { blockerCalls: view.blockerCalls }),
      runtime: assertProduct(strict, `${id}:zero-runtime-errors-no-error-boundary`, view.consoleErrors.length === 0 && view.errorUi.length === 0 && caseErrors.length === 0,
        { consoleErrors: view.consoleErrors.map((entry) => ({ seq: entry.seq, path: entry.path, text: entry.text.slice(0, 200) })), errorUi: view.errorUi, cdpRuntimeErrors: caseErrors.slice(0, 3) }),
    };
    const f1Signature = proceeds.length >= 2 && view.blockerCalls.some((entry) => /Invalid blocker state transition/.test(entry.threw ?? ""));
    const outcome = { case: id, release: spec.release, held: true, pass: Object.values(results).every(Boolean), f1Signature, proceeds: proceeds.length, nonLiveBlockerCalls: nonLive.length,
      staleCommits: stale.length, guardVersions: [...new Set(view.react.filter((entry) => entry.coord).map((entry) => entry.coord.gv))] };
    outcomes.push(outcome);
    record("observation", { ...outcome, intermediate: intermediate ? { location: triple(intermediate.location), dialog: intermediate.dialog, commits: intermediate.view.commits.length } : null,
      stale: stale.map((entry) => ({ seq: entry.seq, coordinator: entry.coord, live: entry.live })), timeline: timeline(view, keys) });
    // 4. Return to S (unguarded) for the next case; the pane must remount clean.
    await evaluate("verify.restore()");
    await traverse(`${id}:return`, "forward");
    const back = await waitUntil(`verify.location().key === ${JSON.stringify(S.key)} && verify.paneId() === ${JSON.stringify(caller.pane)} && verify.dialog() === null`, 6000);
    await delay(400);
    const lingering = await Promise.all(fields.map((field) => buttonPresent(field.retry)));
    pre(`${id}:returned-to-s-clean`, back && !lingering.some(Boolean), { location: await evaluate("verify.location()"), lingering });
  }

  if (mode === "selfcheck") {
    // Fixture instruments (probe key only), on the start pane where no caller binding is mounted.
    const faults = await evaluate("verify.probeFaults()");
    pre("selfcheck:storage-faults-and-attempt-logging", faults.setDeniedThrew && faults.setDeniedNeverStored && faults.setDelegated && faults.removeDeniedThrew
      && faults.removeDeniedKeptBytes && faults.removeDelegated && isDeepStrictEqual(faults.attemptsLogged, ["set:denied", "set:ok", "remove:denied", "remove:ok"]), { faults });
    pre("selfcheck:storage-event-dispatch-counter", isDeepStrictEqual(await evaluate("verify.probeDispatch()"), ["xai_f1_selftest"]));
    const dialogsBefore = dialogs.length;
    dialogPlan.push({ accept: true });
    const confirmed = await evaluate("verify.probeConfirm()");
    pre("selfcheck:real-window-confirm-answered-through-cdp", confirmed === true && dialogs.length === dialogsBefore + 1 && dialogs.at(-1).type === "confirm" && dialogs.at(-1).accepted, { dialogs: dialogs.slice(dialogsBefore) });

    // Features surface (no edit): 8 switches and Reset to defaults present and hit-testable; keys and lock names.
    const surfaceMark = await evaluate("verify.mark()");
    await navigateTo(FEATURES.route, null, FEATURES.pane, "features-surface");
    const ids = await evaluate("verify.featureIds");
    const featureKeys = await evaluate("verify.featureKeys");
    const lockNames = await evaluate("verify.lockNames");
    pre("selfcheck:features-keys-and-lock-names", ids.length === 8 && featureKeys.every((key, index) => key === featureKey(ids[index])) && lockNames.every((name, index) => name === `xai:pref:v1:${featureKeys[index]}`), { featureKeys, lockNames });
    for (const id of ids) await pointOf(`.settings-detail [data-feature-id="${id}"] [role="switch"]`, `features-switch:${id}`);
    const resetSelector = await tagButton("Reset to defaults", ".settings-detail", "features:Reset to defaults");
    await pointOf(resetSelector, "features:Reset to defaults");
    await evaluate('document.querySelector("[data-f1-target]")?.removeAttribute("data-f1-target")');
    const surfaceView = await evaluate(`verify.window(${surfaceMark})`);
    pre("selfcheck:features-mount-zero-writes", surfaceView.attempts.filter((entry) => featureKeys.includes(entry.key)).length === 0, { attempts: surfaceView.attempts.filter((entry) => featureKeys.includes(entry.key)) });

    // Positive controls on the accepted Sticky guard registrant: history ... -> P -> S(sticky).
    const P = await navigateTo(P_ENTRY.pathname, P_ENTRY.state, "about", "p");
    const S = await navigateTo(STICKY.route, null, STICKY.pane, "s-sticky");
    const initialStack = await cdp("Page.getNavigationHistory");
    pre("setup:history-p-then-s", initialStack.entries.length >= 3 && P.key !== S.key && S.pathname === STICKY.route, { P, S, currentIndex: initialStack.currentIndex });
    record("history-entries", { P, S, stack: initialStack.entries.map((entry) => `${entry.id}:${new URL(entry.url).pathname}`), currentIndex: initialStack.currentIndex });
    await runCase("sr", STICKY, { failure: "toggle", release: "retry" }, P, S, initialStack, true);
    await runCase("sd", STICKY, { failure: "toggle", release: "discard" }, P, S, initialStack, true);
    await runCase("s2", STICKY, { failure: "two-toggles", release: "two-step" }, P, S, initialStack, true);
    pre("selfcheck:positive-controls-held-and-released-once", outcomes.length === 3 && outcomes.every((entry) => entry.held && entry.pass && !entry.f1Signature && entry.proceeds === 1), { outcomes });
    runVerdict = "harness-valid";
  }

  if (mode === "features") {
    // Seeds before the Features pane first mounts (uninstrumented): Boards stored on, Calendar and Habits stored off.
    for (const [key, value] of Object.entries(FEATURES.seeds)) await evaluate(`verify.seed(${JSON.stringify(key)}, ${JSON.stringify(value)})`);
    const P = await navigateTo(P_ENTRY.pathname, P_ENTRY.state, "about", "p");
    const S = await navigateTo(FEATURES.route, null, FEATURES.pane, "s-features");
    const initialStack = await cdp("Page.getNavigationHistory");
    pre("setup:history-p-then-s", initialStack.entries.length >= 3 && P.key !== S.key && S.pathname === FEATURES.route, { P, S, currentIndex: initialStack.currentIndex });
    const switches = await evaluate("verify.featureSwitches()");
    pre("setup:features-displays-seeds", switches.board === "true" && switches.calendar === "false" && switches.habits === "false", { switches });
    record("history-entries", { P, S, stack: initialStack.entries.map((entry) => `${entry.id}:${new URL(entry.url).pathname}`), currentIndex: initialStack.currentIndex, seeds: FEATURES.seeds });
    await runCase("r1", FEATURES, { failure: "toggle", release: "retry" }, P, S, initialStack, false);
    await runCase("d1", FEATURES, { failure: "toggle", release: "discard" }, P, S, initialStack, false);
    await runCase("r2", FEATURES, { failure: "toggle", release: "retry" }, P, S, initialStack, false);
    await runCase("rb", FEATURES, { failure: "reset", release: "two-step" }, P, S, initialStack, false);
    const allNotHeld = outcomes.length === 4 && outcomes.every((entry) => entry.held === false && entry.blockerCalls === 0 && entry.leftForPExactly);
    const allPass = outcomes.length === 4 && outcomes.every((entry) => entry.held && entry.pass && entry.proceeds === 1);
    runVerdict = outcomes.some((entry) => entry.f1Signature) ? "f1-signature" : allPass && deferredFailures.length === 0 ? "fixed-pass" : allNotHeld ? "before-not-held" : "fail";
  }

  pre("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs });
  pre("run:react-observer-never-threw", (await evaluate("verify.hookErrors()")) === 0);
} catch (error) {
  harnessError = error;
  runVerdict = "harness-invalid";
} finally {
  const pass = harnessError === null && (mode === "selfcheck" ? runVerdict === "harness-valid" : runVerdict === "fixed-pass");
  record("result", {
    pass, harnessValid: harnessError === null, verdict: runVerdict, mode, checks, deferredFailures, outcomes,
    runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 4), consoleWarnings: consoleWarnings.length, consoleWarningSamples: [...new Set(consoleWarnings)].slice(0, 5), dialogs,
    ...(harnessError ? { error: String(harnessError?.stack ?? harnessError).slice(0, 1500), checkId: harnessError?.checkId ?? null, checkKind: harnessError?.checkKind ?? null } : {}),
  });
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`, { flag: "wx" });
  await closeSession().catch(() => {});
  server?.closeAllConnections?.();
  server?.close();
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  process.exitCode = harnessError ? 1 : pass ? 0 : 2;
  const summary = outcomes.map((entry) => `${entry.case}:${entry.held ? (entry.pass ? "held-released-once" : "held-FAIL") : "not-held"}${entry.f1Signature ? "(F1)" : ""}`).join(" ");
  console.log(`${harnessError ? "HARNESS-FAIL" : pass ? "PASS" : "VALID-ORACLE-FAIL"} ${relative(root, evidencePath)} verdict=${runVerdict} checks=${checks} exit=${process.exitCode} ${summary}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
}
