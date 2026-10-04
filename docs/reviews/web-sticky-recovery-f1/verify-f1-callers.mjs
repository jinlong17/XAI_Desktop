/**
 * CP-STICKY-01 batch 11: bounded Chrome before-reproductions of F1 for the remaining exposed guard
 * registrants (Astra review 0ba68d7 §3/§4.2): "a held browser POP departure (Back or Forward) released by
 * the caller's successful Retry (or, for Smart Lists, by lock completion)", each with a discard-released
 * POP control. Verification only: it repairs nothing, accepts or revokes nothing and changes no product
 * file, contract, ledger or existing evidence. It mirrors the frozen batch-10 runner ./verify-f1.mjs
 * (neither imported nor changed) and reuses the frozen ./f1-prelude.js unchanged.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs <fixed revision> <mode> <suffix>
 *   mode = notifications | date-time | smart-lists | header | pomodoro | selfcheck
 *
 * - Product: an immutable `git archive <fixed revision>`; ./f1-callers-host.tsx is bundled with esbuild
 *   from stdin with resolveDir = that archive and every `@repo/*` import pinned to the archive's packages.
 *   Only third-party modules come from XAI_DEPS_ROOT, and only when its pnpm-lock.yaml SHA-256 equals the
 *   archive's (consistency gate). Bundle inputs are checked for provenance.
 * - Page: ./f1-prelude.js (classic script, frozen React commit observer) then the module bundle, served
 *   from 127.0.0.1 only; isolated headless Chrome profile; CDP trusted mouse/keyboard/text input (mouse
 *   after a centre hit-test; a select is focused by script and then receives a trusted typeahead key, the
 *   pattern of ../web-sticky-recovery-native/verify-host.mjs); browser Back/Forward through CDP
 *   Page.navigateToHistoryEntry (the browser's own traversal).
 * - History per run: start (/app/settings/hotkeys) -> P (/app/settings/about, state) -> S (registrant) ->
 *   N (/app/settings/hotkeys, state), then an unguarded Back to S. Every case starts clean at S; Back
 *   targets P, Forward targets N. P and N mount no departure guard.
 * - Cases (one run = one diagnostic iteration): r1 Retry-released Back; d1 discard-released Back
 *   (control); f1 Retry-released Forward; smart-lists adds l1 lock-completion-released Back. Each case
 *   asserts the F1 oracle of the review (§4.1); product assertions are deferred (recorded without
 *   stopping), preconditions stop the run. Exit code 1 means a precondition failed (harness invalid) or
 *   the oracle failed (behaviour observed); the final record says which, with a per-run verdict:
 *   confirmed (F1 signature in a Retry/lock release), refuted (all cases valid, no signature) or unknown
 *   (harness invalid).
 * - selfcheck: harness validation only (composition, routes, controls present and hit-testable, keys and
 *   lock names, zero runtime errors); it performs no edit, fault, hold or release.
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

const START = { pathname: "/app/settings/hotkeys", view: "settings:hotkeys" };
const P_ENTRY = { pathname: "/app/settings/about", state: { token: "f1-P" }, view: "settings:about" };
const N_ENTRY = { pathname: "/app/settings/hotkeys", state: { token: "f1-N" }, view: "settings:hotkeys" };
const DIALOG = ".settings-departure-dialog";
const DISCARD = "Discard local changes and leave";
const H_KEY = ["h", "KeyH", 72];
const retryBack = { id: "r1", release: "retry", direction: "back" };
const discardBack = { id: "d1", release: "discard", direction: "back" };
const retryForward = { id: "f1", release: "retry", direction: "forward" };
const MODES = {
  notifications: {
    route: "/app/settings/notifications", view: "settings:notifications", label: "Unsaved Notifications draft",
    keys: ["xai_pref_notif_push_task"], codec: "boolean",
    edit: { kind: "switch", scope: ".settings-detail", labels: ["Task due"] },
    failed: { scope: ".settings-detail", parts: ["Task due was not saved."] },
    retry: { name: "Retry Task due", scope: ".settings-detail" },
    cases: [retryBack, discardBack, retryForward],
    reRegistrationOnRetry: "notificationsPane.tsx retry() changed() :50 + settleDraft() changed() :47; guard effect :56 keyed on draftVersion",
  },
  "date-time": {
    route: "/app/settings/date_time", view: "settings:date_time", label: "Unsaved Date & Time draft",
    keys: ["xai_pref_dt_lunar"], codec: "boolean",
    edit: { kind: "switch", scope: ".settings-detail", labels: ["Show Lunar Calendar"] },
    failed: { scope: ".settings-detail", parts: ["Show Lunar Calendar was not saved."] },
    retry: { name: "Retry Show Lunar Calendar", scope: ".settings-detail" },
    cases: [retryBack, discardBack, retryForward],
    reRegistrationOnRetry: "dateTimePane.tsx retry() changed() :88 + settleDraft() changed() :62; guard effect :143-154 keyed on draftVersion",
  },
  "smart-lists": {
    route: "/app/settings/smart_lists", view: "settings:smart_lists", label: "Unsaved Smart Lists draft",
    keys: ["xai_pref_smart_lists"], codec: "json",
    edit: { kind: "select", scope: ".settings-detail", typeahead: H_KEY, value: "hide" },
    failed: { scope: ".settings-detail", parts: ["Smart Lists choices were not saved"] },
    pending: { scope: ".settings-detail", parts: ["Saving Smart Lists choices"] },
    retry: { name: "Retry", scope: ".smart-lists-recovery" },
    cases: [
      { ...retryBack, row: { label: "All", id: "all" } },
      { ...discardBack, row: { label: "Today", id: "today" } },
      { id: "l1", release: "lock", direction: "back", row: { label: "Tomorrow", id: "tomorrow" } },
      { ...retryForward, row: { label: "Next 7 Days", id: "next7" } },
    ],
    reRegistrationOnRetry: "smartListsPane.tsx guard effect :167 keyed on meta.status and hasDraft; draft cleared in a passive effect on status saved :101-107; Retry :192",
  },
  header: {
    route: "/app/dashboard", view: "dashboard", label: "Unsaved Dashboard header draft",
    keys: ["xai_pref_dashboard_header_note"], codec: "string",
    edit: { kind: "header-note", scope: ".dash-head", open: "Edit dashboard note", input: "Add a focus note, reminder, or short message" },
    failed: { scope: ".dash-note-recovery", parts: ["Note or position was not saved."] },
    retry: { name: "Retry note save", scope: ".dash-note-recovery" },
    cases: [
      { ...retryBack, text: "F1 header r1 note" },
      { ...discardBack, text: "F1 header d1 note" },
      { ...retryForward, text: "F1 header f1 note" },
      // The same "Retry note save" control also retries a failed note-position (offset) save. That
      // field is device-scoped, so its write takes only the key lock (no account-lifecycle lock hop).
      { id: "o1", release: "retry", direction: "back", drag: 60, keys: ["xai_pref_dashboard_header_note_x"], codec: "json" },
    ],
    reRegistrationOnRetry: "DashHeader.tsx retrySave() :589 -> note: submit(..., true) setDraftVersion :425 + settleOperation() setDraftVersion :402 (account key); offset: submitOffset(..., true) setDraftVersion :584 + settleOffset() setDraftVersion :553 (device key); guard effect :784-798 keyed on draftVersion",
  },
  pomodoro: {
    route: "/app/pomodoro", view: "pomodoro", label: "Unsaved Pomodoro preferences draft",
    keys: ["xai_pref_pomodoro_display_style", "xai_pref_pomodoro_theme"], codec: "json",
    edit: { kind: "testids" },
    failed: { scope: ".pomo-recovery", parts: ["Some preferences were not saved."] },
    retry: { name: "Retry preferences", scope: ".pomo-recovery" },
    cases: [
      { ...retryBack, testids: ["style-ring", "theme-teal"] },
      { ...discardBack, testids: ["style-minimal", "theme-blue"] },
      { ...retryForward, testids: ["style-digital", "theme-sage"] },
    ],
    reRegistrationOnRetry: "usePreferenceDepartureRecovery.ts retryDrafts() :89-103 (no notification at start; changed() :96 per successful draft); guard effect :156-171 keyed on draftVersion",
  },
  selfcheck: { route: null },
};
const SELF_CHECK = [
  { mode: "notifications", controls: ['.settings-detail [role="switch"][aria-label="Task due"]'] },
  { mode: "date-time", controls: ['.settings-detail [role="switch"][aria-label="Show Lunar Calendar"]'] },
  { mode: "smart-lists", controls: ["All", "Today", "Tomorrow", "Next 7 Days"].map((label) => `.settings-detail select[aria-label="${label}"]`) },
  { mode: "header", controls: ['.dash-head button[aria-label="Edit dashboard note"]'] },
  { mode: "pomodoro", controls: ["style-ring", "theme-teal", "style-minimal", "theme-blue", "style-digital", "theme-sage"].map((id) => `[data-testid="${id}"]`) },
];
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
const fixtureSource = readFileSync(join(output, "f1-callers-host.tsx"), "utf8");
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

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-f1c-")));
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
      runtimeErrors.push({ kind: "exception", afterCheck: lastCheckId, text: String(details.exception?.description ?? details.text ?? "").slice(0, 1200) });
    } else if (message.method === "Runtime.consoleAPICalled") {
      const text = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ").slice(0, 1200);
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

async function locate(selector) {
  return evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { found: false };
    element.scrollIntoView({ block: "center", inline: "center" });
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { found: true, x, y, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + hit.className : null };
  })()`);
}
async function trustedClick(selector, label) {
  const point = await locate(selector);
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
async function trustedKey(key, code, virtualKey, text) {
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: virtualKey, ...(text ? { text, unmodifiedText: text } : {}) });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: virtualKey });
  await delay(60);
}
async function typeahead(selector, label, [character, code, virtualKey]) {
  const focused = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return false;
    element.scrollIntoView({ block: "center" });
    element.focus();
    return document.activeElement === element;
  })()`);
  pre(`input:select-focused:${label}`, focused, { selector });
  await trustedKey(character, code, virtualKey, character);
}

/** Compact, sequence-ordered timeline of one release window (all instruments share one sequence). */
function timeline(view, physicalKeys, logicalKeys) {
  const items = [];
  const blockerText = (list) => `[${list.join(",")}]`;
  for (const entry of view.clicks) items.push([entry.seq, `click ${entry.target}${entry.trusted ? "" : " (untrusted)"}`]);
  for (const entry of view.keys) items.push([entry.seq, `key ${entry.key} ${entry.target}${entry.trusted ? "" : " (untrusted)"}`]);
  for (const entry of view.changes) items.push([entry.seq, `change ${entry.target}=${entry.value}${entry.trusted ? "" : " (untrusted)"}`]);
  for (const entry of view.locks) if (logicalKeys.some((key) => entry.name.includes(key))) items.push([entry.seq, `lock-request ${entry.name}`]);
  for (const entry of view.fixtureLocks) items.push([entry.seq, `fixture-lock ${entry.event} ${entry.name}`]);
  for (const entry of view.attempts) if (physicalKeys.includes(entry.key)) items.push([entry.seq, `${entry.op} ${logicalKeys[physicalKeys.indexOf(entry.key)]} ${String(entry.value ?? "").slice(0, 80)} ${entry.outcome}`.trim()]);
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
  return items.slice(0, 200).map(([seq, text]) => `${seq} ${text}`);
}
const isStale = (entry) => Boolean(entry.coord && entry.coord.s === "blocked"
  && (!entry.live || entry.live.id !== entry.coord.b || entry.live.state !== "blocked"));
const parseJson = (raw) => { try { return JSON.parse(raw); } catch { return undefined; } };

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
const outcomes = [];
let verdict = "unknown";
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
    stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: "f1-callers-host.tsx" },
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
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== "f1-callers-host.tsx");
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const productFiles = [
    "apps/web/src/routes/modules/departureCoordinator.tsx",
    "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
    "apps/web/src/routes/modules/settingsDeparture.ts",
    "apps/web/src/routes/modules/dashboardRegistration.tsx",
    "apps/web/src/routes/modules/pomodoroRegistration.tsx",
    "apps/web/src/routes/modules/shellRegistrations.tsx",
    "packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx",
    "packages/plugin-web-settings-rest/src/panes/dateTimePane.tsx",
    "packages/plugin-web-settings-rest/src/panes/smartListsPane.tsx",
    "packages/xai-web-dashboard-grid/src/DashHeader.tsx",
    "packages/xai-web-dashboard-grid/src/DashboardModule.tsx",
    "packages/plugin-web-pomodoro/src/PomodoroModule.tsx",
    "packages/plugin-web-pomodoro/src/internal/usePreferenceDepartureRecovery.ts",
    "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
    "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts",
    "packages/plugin-web-storage/src/internal/prefMutation.ts",
    "packages/xai-web-shell/src/Shell.tsx",
  ];
  const productHashes = Object.fromEntries(productFiles.map((file) => [file, sha256(readFileSync(join(snapshot, file)))]));
  const productInBundle = productFiles.every((file) => inputs.includes(file));
  const page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>F1 caller reproduction fixture</title><link rel="stylesheet" href="/__f1/bundle.css"><script src="/__f1/prelude.js"></script></head><body><div id="app"></div><script type="module" src="/__f1/bundle.js"></script></body></html>';
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
  await cdp("Page.navigate", { url: `${origin}${START.pathname}` });
  pre("session:mounted", await waitUntil(`!!window.verify && verify.view() === ${JSON.stringify(START.view)}`, 15000));
  await cdp("Page.bringToFront");
  await cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  const version = await cdp("Browser.getVersion");
  const viewport = await evaluate("({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio })");
  const keys = [...new Set([...(config.keys ?? []), ...(config.cases ?? []).flatMap((entry) => entry.keys ?? [])])];
  const physicalKeys = await evaluate(`${JSON.stringify(keys)}.map((key) => verify.physicalKey(key))`);
  const lockNames = await evaluate(`${JSON.stringify(keys)}.map((key) => verify.lockName(key))`);
  const physicalOf = Object.fromEntries(keys.map((key, index) => [key, physicalKeys[index]]));
  const lockOf = Object.fromEntries(keys.map((key, index) => [key, lockNames[index]]));
  record("baseline", {
    requested, resolved, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix, config,
    history: { start: START, P: P_ENTRY, N: N_ENTRY }, keys, physicalKeys, lockNames,
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
  pre("baseline:bundle-inputs-pinned-to-archive", foreign.length === 0 && productInBundle, { foreign, productInBundle, missing: productFiles.filter((file) => !inputs.includes(file)) });
  pre("baseline:no-mount-runtime-errors", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 3) });
  pre("baseline:react-commit-observer-active", await evaluate("verify.reactCommitsObserved() > 0 && verify.coordinatorObserved() && verify.hookErrors() === 0"), {
    commits: await evaluate("verify.reactCommitsObserved()"), hookErrors: await evaluate("verify.hookErrors()"),
  });
  const navigateTo = async (entry, view, id) => {
    await evaluate(`void verify.router.navigate(${JSON.stringify(entry.pathname)}${entry.state ? `, { state: ${JSON.stringify(entry.state)} }` : ""}), true`);
    pre(`setup:${id}-mounted`, await waitUntil(`verify.view() === ${JSON.stringify(view)} && verify.location().pathname === ${JSON.stringify(entry.pathname)}`, 8000), { view: await evaluate("verify.view()") });
    await delay(300);
    return evaluate("verify.location()");
  };

  if (mode === "selfcheck") {
    // Harness validation only: every registrant route mounts under the actual composition, its
    // trusted-input controls are present and hit-testable, keys and lock names resolve, and no
    // runtime error is raised. No edit, fault, hold or release is performed.
    const probes = [];
    for (const item of SELF_CHECK) {
      const target = MODES[item.mode];
      const errorsBefore = runtimeErrors.length;
      await navigateTo({ pathname: target.route }, target.view, item.mode);
      for (const selector of item.controls) {
        const point = await locate(selector);
        pre(`selfcheck:${item.mode}:control-present-and-hit:${selector}`, point.found && point.hit, { hitTarget: point.hitTarget });
      }
      const keysOf = await evaluate(`${JSON.stringify(target.keys)}.map((key) => ({ key, physical: verify.physicalKey(key), lock: verify.lockName(key) }))`);
      const state = await evaluate("({ dialog: verify.dialog(), location: verify.location() })");
      pre(`selfcheck:${item.mode}:no-dialog-no-runtime-errors`, state.dialog === null && runtimeErrors.length === errorsBefore, { runtimeErrors: runtimeErrors.slice(errorsBefore, errorsBefore + 3) });
      probes.push({ mode: item.mode, route: target.route, location: state.location, keys: keysOf });
    }
    record("selfcheck", { probes });
    pre("run:no-unexpected-javascript-dialogs", unexpectedDialogs.length === 0, { unexpectedDialogs });
    pre("run:react-observer-never-threw", (await evaluate("verify.hookErrors()")) === 0);
    verdict = "harness-valid";
    record("result", { pass: true, mode, verdict, checks, deferredFailures, runtimeErrors: runtimeErrors.length, consoleWarnings: consoleWarnings.length });
  } else {
    // History: start -> P (about, state) -> S (registrant) -> N (hotkeys, state); unguarded Back to S.
    const P = await navigateTo(P_ENTRY, P_ENTRY.view, "p");
    const S = await navigateTo({ pathname: config.route }, config.view, "s");
    const N = await navigateTo(N_ENTRY, N_ENTRY.view, "n");
    const traverse = async (id, direction) => {
      const history = await cdp("Page.getNavigationHistory");
      const index = history.currentIndex + (direction === "back" ? -1 : 1);
      const target = history.entries[index];
      pre(`${id}:traverse-${direction}-entry-exists`, Boolean(target), { currentIndex: history.currentIndex });
      await cdp("Page.navigateToHistoryEntry", { entryId: target.id });
      return { fromIndex: history.currentIndex, toIndex: index, entryId: target.id };
    };
    await traverse("setup:return-to-s", "back");
    pre("setup:back-to-s-unguarded", await waitUntil(`verify.location().key === ${JSON.stringify(S.key)} && verify.view() === ${JSON.stringify(config.view)} && verify.dialog() === null`, 8000));
    await delay(400);
    const stackOf = async () => {
      const cdpStack = await cdp("Page.getNavigationHistory");
      const navigation = await evaluate("({ ids: navigation.entries().map((entry) => entry.id), index: navigation.currentEntry.index })");
      return { ids: cdpStack.entries.map((entry) => entry.id), paths: cdpStack.entries.map((entry) => new URL(entry.url).pathname), currentIndex: cdpStack.currentIndex, navigation };
    };
    const setupStack = await stackOf();
    // CDP lists the initial about:blank entry; the Navigation API lists only this origin's entries.
    const sIndex = setupStack.currentIndex;
    const sNavigationIndex = setupStack.navigation.index;
    pre("setup:history-start-p-s-n", setupStack.ids.length >= 4 && setupStack.paths[sIndex] === config.route && setupStack.paths[sIndex - 1] === P.pathname
      && setupStack.paths[sIndex + 1] === N.pathname && new Set([P.key, S.key, N.key]).size === 3
      && sNavigationIndex >= 2 && setupStack.navigation.ids.length === sNavigationIndex + 2,
    { P, S, N, stack: setupStack });
    pre("setup:no-runtime-errors", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 3) });
    record("history-entries", { P, S, N, stack: setupStack });
    const triple = (location) => ({ pathname: location.pathname, key: location.key, state: location.state ?? null });
    const sameTriple = (left, right) => isDeepStrictEqual(triple(left), triple(right));

    async function performEdit(caseDef) {
      const edit = config.edit;
      if (edit.kind === "switch") {
        for (const label of edit.labels) await trustedClick(`${edit.scope} [role="switch"][aria-label="${label}"]`, `${caseDef.id}:toggle ${label}`);
      } else if (edit.kind === "select") {
        await typeahead(`${edit.scope} select[aria-label="${caseDef.row.label}"]`, `${caseDef.id}:select ${caseDef.row.label}`, edit.typeahead);
        pre(`${caseDef.id}:select-changed-by-trusted-key`, await waitUntil(`verify.selectValue(${JSON.stringify(caseDef.row.label)}) === ${JSON.stringify(edit.value)}`, 3000), { value: await evaluate(`verify.selectValue(${JSON.stringify(caseDef.row.label)})`) });
      } else if (edit.kind === "header-note" && caseDef.drag) {
        // Trusted pointer drag of the note chip (DashHeader startNoteMove/moveNote/endNoteMove).
        const point = await locate(`${edit.scope} .dash-note__display`);
        pre(`input:control-present:${caseDef.id}:note-chip`, point.found);
        pre(`input:hit-test:${caseDef.id}:note-chip`, point.hit, { hitTarget: point.hitTarget });
        await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
        await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
        for (let step = 1; step <= 6; step += 1) {
          await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x + (caseDef.drag * step) / 6, y: point.y, button: "left", buttons: 1 });
          await delay(16);
        }
        await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x + caseDef.drag, y: point.y, button: "left", buttons: 0, clickCount: 1 });
        await delay(60);
        pre(`${caseDef.id}:note-not-editing-after-drag`, (await evaluate(`verify.activeLabel()`)) !== `INPUT:${edit.input}`, { active: await evaluate("verify.activeLabel()") });
      } else if (edit.kind === "header-note") {
        await clickButton(edit.open, edit.scope);
        pre(`${caseDef.id}:note-input-focused`, await waitUntil(`verify.activeLabel() === ${JSON.stringify(`INPUT:${edit.input}`)}`, 3000), { active: await evaluate("verify.activeLabel()") });
        await cdp("Input.insertText", { text: caseDef.text });
        await delay(60);
        await trustedKey("Enter", "Enter", 13, "\r");
      } else if (edit.kind === "testids") {
        for (const testid of caseDef.testids) await trustedClick(`[data-testid="${testid}"]`, `${caseDef.id}:${testid}`);
      }
    }

    async function runCase(caseDef) {
      const { id, release, direction } = caseDef;
      const target = direction === "back" ? P : N;
      const errorsAtStart = runtimeErrors.length;
      // A case may name its own field (e.g. the Dashboard Header note position); default: the mode's.
      const caseKeys = caseDef.keys ?? config.keys;
      const physicalKeys = caseKeys.map((key) => physicalOf[key]);
      const lockNames = caseKeys.map((key) => lockOf[key]);
      const codec = caseDef.codec ?? config.codec;
      const sameValue = (left, right) => (codec === "json" ? isDeepStrictEqual(parseJson(left), parseJson(right)) : left === right);
      pre(`${id}:starts-clean-at-s`, await evaluate(`verify.location().key === ${JSON.stringify(S.key)} && verify.dialog() === null && verify.view() === ${JSON.stringify(config.view)}`));
      const startStack = await stackOf();
      pre(`${id}:stack-unchanged-at-start`, isDeepStrictEqual(startStack.ids, setupStack.ids) && startStack.currentIndex === sIndex
        && isDeepStrictEqual(startStack.navigation, setupStack.navigation), { startStack });
      const before = await evaluate(`${JSON.stringify(physicalKeys)}.map((key) => verify.physical(key))`);
      // 1. Unsaved work: a real save of the registrant's field fails (per-key setItem fault) or, for a
      //    lock-completion release, waits behind a fixture-held exclusive Web Lock.
      if (release === "lock") {
        await evaluate(`verify.holdLock(${JSON.stringify(lockNames[0])})`);
        pre(`${id}:fixture-lock-acquired`, await waitUntil("verify.fixtureLock()?.acquired === true", 3000), { lock: await evaluate("verify.fixtureLock()") });
      } else {
        for (const key of physicalKeys) await evaluate(`verify.denySet(${JSON.stringify(key)})`);
      }
      const editMark = await evaluate("verify.mark()");
      await performEdit(caseDef);
      let expected;
      if (release === "lock") {
        const pendingShown = await waitUntil(`(() => { const texts = verify.statusText(${JSON.stringify(config.pending.scope)}); return ${JSON.stringify(config.pending.parts)}.every((part) => texts.some((text) => text.includes(part))); })()`, 5000);
        await delay(200);
        const editView = await evaluate(`verify.window(${editMark})`);
        const sets = editView.attempts.filter((entry) => entry.key === physicalKeys[0] && entry.op === "set");
        const previous = parseJson(before[0]) ?? {};
        expected = [JSON.stringify({ ...previous, [caseDef.row.id]: config.edit.value })];
        pre(`${id}:save-pending-behind-held-lock`, pendingShown && sets.length === 0 && editView.locks.some((entry) => entry.name === lockNames[0]) && (await evaluate("verify.fixtureLock()?.released === false")),
          { sets, locks: editView.locks.map((entry) => entry.name), status: await evaluate(`verify.statusText(${JSON.stringify(config.pending.scope)})`) });
      } else {
        const failedShown = await waitUntil(`(() => { const alerts = verify.alerts(${JSON.stringify(config.failed.scope)}); return ${JSON.stringify(config.failed.parts)}.every((part) => alerts.some((text) => text.includes(part))) && verify.buttons(${JSON.stringify(config.retry.scope)}).includes(${JSON.stringify(config.retry.name)}); })()`, 5000);
        const settled = await waitUntil(`(() => { const view = verify.window(${editMark}); return ${JSON.stringify(physicalKeys)}.every((key) => view.attempts.some((entry) => entry.op === "set" && entry.key === key && entry.outcome === "denied")); })()`, 5000);
        await delay(200);
        const editView = await evaluate(`verify.window(${editMark})`);
        const denied = physicalKeys.map((key) => editView.attempts.filter((entry) => entry.op === "set" && entry.key === key && entry.outcome === "denied"));
        pre(`${id}:save-failed-with-retry-offered`, failedShown && settled && denied.every((list) => list.length >= 1), { denied, alerts: await evaluate(`verify.alerts(${JSON.stringify(config.failed.scope)})`) });
        expected = denied.map((list) => list.at(-1).value);
      }
      // 2. A browser POP (Back or Forward) is held by the departure guard.
      const holdMark = await evaluate("verify.mark()");
      const step = await traverse(id, direction);
      const opened = await waitUntil("verify.dialog() !== null", 4000);
      const restored = await waitUntil(`verify.windowPath() === ${JSON.stringify(S.pathname)} && verify.historyStateKey() === ${JSON.stringify(S.key)}`, 4000);
      await delay(250);
      const held = await evaluate(`({ location: verify.location(), dialog: verify.dialog(), view: verify.window(${holdMark}) })`);
      pre(`${id}:${direction}-held-dialog-open-url-restored`, opened && restored && held.dialog !== null && sameTriple(held.location, S) && held.view.commits.length === 0, { dialog: held.dialog, location: triple(held.location), step });
      observe(`${id}:held-guard-label-is-caller`, held.dialog.label === config.label, { dialog: held.dialog, expected: config.label });
      // 3. Release.
      if (release !== "lock") await evaluate("verify.restore()");
      const releaseMark = await evaluate("verify.mark()");
      if (release === "retry") await clickButton(config.retry.name, config.retry.scope);
      else if (release === "discard") await clickButton(DISCARD, DIALOG);
      else await evaluate("verify.releaseLock()");
      const left = await waitUntil(`verify.location().key === ${JSON.stringify(target.key)}`, 6000);
      await delay(800);
      const state = await evaluate(`({ location: verify.location(), windowPath: verify.windowPath(), dialog: verify.dialog(), physical: ${JSON.stringify(physicalKeys)}.map((key) => verify.physical(key)), view: verify.window(${releaseMark}), fixtureLock: verify.fixtureLock() })`);
      const view = state.view;
      const stackAfter = await stackOf();
      const targetIndex = direction === "back" ? sIndex - 1 : sIndex + 1;
      const targetNavigationIndex = direction === "back" ? sNavigationIndex - 1 : sNavigationIndex + 1;
      const writes = physicalKeys.map((key) => view.attempts.filter((entry) => entry.key === key && (entry.op === "set" || entry.op === "remove")));
      const proceeds = view.blockerCalls.filter((entry) => entry.op === "proceed");
      const resets = view.blockerCalls.filter((entry) => entry.op === "reset");
      const stale = view.react.filter(isStale);
      const caseErrors = runtimeErrors.slice(errorsAtStart);
      const recreated = view.consoleErrors.some((entry) => entry.text.includes("error occurred in the <DepartureCoordinator> component"));
      // The stack frame that called the wrapped router blocker method, i.e. the product statement that
      // invoked proceed()/reset() when it threw (bundle line; map with a rebuild of the same bundle SHA).
      const callerFrames = [...new Set(caseErrors.map((entry) => {
        const lines = entry.text.split("\n");
        const index = lines.findIndex((line) => line.includes("wrappedBlockerMethod"));
        return index >= 0 && lines[index + 1] ? lines[index + 1].trim().replace(/https?:\/\/127\.0\.0\.1:\d+\//, "") : null;
      }).filter(Boolean))];
      const results = {
        location: observe(`${id}:location-deep-equal-${direction === "back" ? "p" : "n"}`, left && sameTriple(state.location, target) && state.windowPath === target.pathname, { location: triple(state.location), expected: triple(target) }),
        commit: observe(`${id}:exactly-one-pop-commit-zero-push-replace-stack-unchanged`, view.commits.length === 1 && view.commits[0].key === target.key && view.commits[0].action === "POP"
          && view.history.length === 0 && view.pops.length === 1 && isDeepStrictEqual(stackAfter.ids, setupStack.ids) && stackAfter.currentIndex === targetIndex
          && isDeepStrictEqual(stackAfter.navigation.ids, setupStack.navigation.ids) && stackAfter.navigation.index === targetNavigationIndex,
        { commits: view.commits, history: view.history, pops: view.pops.length, stackAfter, targetIndex, targetNavigationIndex }),
        outcome: observe(`${id}:dialog-closed-${release === "discard" ? "zero-writes" : "latest-written-once"}`, state.dialog === null
          && (release === "discard"
            ? writes.every((list) => list.length === 0)
            : writes.every((list, index) => list.length === 1 && list[0].op === "set" && sameValue(list[0].value, expected[index]) && list[0].outcome === "ok" && sameValue(state.physical[index], expected[index]))),
        { dialog: state.dialog, writes, expected, physical: state.physical, fixtureLock: state.fixtureLock }),
        proceedOnce: observe(`${id}:blocker-proceed-exactly-once-from-blocked`, proceeds.length === 1 && proceeds[0].liveState === "blocked" && !view.blockerCalls.some((entry) => entry.threw) && resets.length === 0,
          { blockerCalls: view.blockerCalls }),
        liveOnly: observe(`${id}:no-blocker-call-from-non-live-snapshot`, view.blockerCalls.every((entry) => entry.liveBlocker === entry.blocker && entry.liveState === "blocked"),
          { blockerCalls: view.blockerCalls }),
        runtime: observe(`${id}:zero-runtime-errors-no-error-boundary`, view.consoleErrors.length === 0 && view.errorUi.length === 0 && caseErrors.length === 0,
          { consoleErrors: view.consoleErrors.map((entry) => ({ seq: entry.seq, path: entry.path, text: entry.text.slice(0, 200) })), errorUi: view.errorUi, cdpRuntimeErrors: caseErrors.length,
            cdpRuntimeErrorSamples: caseErrors.slice(0, 3).map((entry) => ({ kind: entry.kind, text: entry.text.slice(0, 900) })) }),
      };
      if (release === "lock") pre(`${id}:fixture-lock-released`, state.fixtureLock?.released === true);
      const f1Signature = proceeds.length >= 2 && view.blockerCalls.some((entry) => /Invalid blocker state transition/.test(entry.threw ?? ""));
      const outcome = { case: id, release, direction, pass: Object.values(results).every(Boolean), f1Signature, coordinatorRecreated: recreated, proceeds: proceeds.length,
        blockerThrows: view.blockerCalls.filter((entry) => entry.threw).map((entry) => entry.threw), callerFrames, staleCommits: stale.length, consoleErrors: view.consoleErrors.length, errorUi: view.errorUi.length,
        guardVersions: [...new Set(view.react.filter((entry) => entry.coord).map((entry) => entry.coord.gv))] };
      outcomes.push(outcome);
      record("observation", { ...outcome, stale: stale.map((entry) => ({ seq: entry.seq, coordinator: entry.coord, live: entry.live })), timeline: timeline(view, physicalKeys, caseKeys) });
      // 4. Return to S (unguarded) for the next case; the registrant must remount clean.
      await traverse(`${id}:return`, direction === "back" ? "forward" : "back");
      const back = await waitUntil(`verify.location().key === ${JSON.stringify(S.key)} && verify.view() === ${JSON.stringify(config.view)} && verify.dialog() === null`, 8000);
      await delay(400);
      pre(`${id}:returned-to-s-clean`, back && !(await evaluate(`verify.buttons(${JSON.stringify(config.retry.scope)}).includes(${JSON.stringify(config.retry.name)})`)), { location: await evaluate("verify.location()") });
    }

    for (const caseDef of config.cases) await runCase(caseDef);

    pre("run:no-unexpected-javascript-dialogs", unexpectedDialogs.length === 0, { unexpectedDialogs });
    pre("run:react-observer-never-threw", (await evaluate("verify.hookErrors()")) === 0);
    const pass = deferredFailures.length === 0;
    const f1Cases = outcomes.filter((entry) => entry.release !== "discard" && entry.f1Signature).map((entry) => entry.case);
    verdict = f1Cases.length > 0 ? "confirmed" : "refuted";
    const discardControl = outcomes.filter((entry) => entry.release === "discard").map((entry) => ({ case: entry.case, pass: entry.pass, f1Signature: entry.f1Signature }));
    record("result", { pass, mode, verdict, f1Cases, discardControl, checks, deferredFailures, outcomes, runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 4), consoleWarnings: consoleWarnings.length });
    if (!pass) process.exitCode = 1;
  }
} catch (error) {
  verdict = "unknown";
  record("result", { pass: false, harnessError: true, mode, verdict, checks, deferredFailures, outcomes, error: String(error?.stack ?? error).slice(0, 1500), checkId: error?.checkId ?? null, checkKind: error?.checkKind ?? null, runtimeErrorSamples: runtimeErrors.slice(0, 4) });
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
  console.log(`${last?.pass ? "PASS" : last?.harnessError ? "HARNESS-FAIL" : "FAIL"} ${relative(root, evidencePath)} verdict=${verdict} checks=${checks} ${summary}${last?.harnessError ? ` error=${String(last?.error).split("\n")[0]}` : ""}`);
}
