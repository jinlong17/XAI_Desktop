/**
 * CP-APPRAIL-01 batch 58 (contract r1 §12 "Native before", §15 E4): AppRail order (`xai_rail_order`) native BEFORE
 * evidence in real headless Chrome, in the production App composition, with trusted input only. Parent-role native
 * verifier. Verification only: it repairs nothing, implements nothing, accepts nothing and changes no product file,
 * contract, ledger, control plane or existing evidence.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-apprail-order-recovery-native/verify-native-before.mjs <revision> <mode> <suffix>
 *
 * Modes (contract §12 "Native before" and H1–H11; §15 E4):
 *   h1   — every crashing value of contract §5 item 2 class "Not iterable" ({}, {"tasks":1}, 1, 0, -1, true, false) at
 *          load, in EN and ZH sessions: the route error boundary on /app/tasks and /app/settings/appearance (screenshot
 *          and DOM text), the same on /app/dashboard and /app/calendar (DOM text), a reload of /app/tasks, zero mount
 *          writes and unchanged bytes; plus a clean positive control (absent bytes mount) per language.
 *   drag — H2 (a quota fault and a throwing setItem on xai_rail_order; EN and ZH), H3 (a two-step trusted drag), H4
 *          (dragCancel; a release outside the rail on the main content), H6 (the real per-key Web Lock held by the
 *          fixture) and the positive control P6 (the final bytes of a successful all-visible drag).
 *   r1   — H5 end to end at 1440x900: Boards hidden through the real Features pane by a trusted click, a trusted rail
 *          drag, Boards re-enabled by a trusted click (EN and ZH); and an unknown id (ghost-module) at index 0.
 *   h8   — ["tasks","tasks"] and ["board","tasks","board"] at load (EN and ZH): duplicate rail buttons.
 *   h9   — a failed trusted drag on /app/tasks (EN and ZH): no Topbar status or recovery UI, no beforeunload listener
 *          or warning (synthetic event and a real runner navigation), and sign-out through the real AvatarMenu and
 *          SignOutConfirmDialog proceeding without a rail prompt (fallback auth branch).
 *   h11  — positive control across two real documents (EN and ZH): (a) a second production App document commits an
 *          order through a trusted drag and the idle first document's rail follows live; (b) a product-free second
 *          document writes a valid order and the idle first document's rail follows live.
 *
 * - Product: an immutable `git archive <revision>`; ./native-before-app.tsx is bundled with esbuild from stdin with
 *   resolveDir = that archive. Every `@repo/*` specifier is pinned to the archive's own package export; a guard
 *   plugin fails the build if any module is loaded from the packages/, apps/ or docs/ tree of the dependency checkout
 *   or of this runner's checkout. Third-party modules come from XAI_DEPS_ROOT only when its pnpm-lock.yaml SHA-256
 *   equals the archive's and the contract gate (consistency gate; read-only use). The 13 contract r1 source files must
 *   equal the contract header table, and every listed reader/host module must come from the archive.
 * - Page: ./native-before-prelude.js (classic script, instruments) then the bundle, served from 127.0.0.1 only by
 *   this runner's own server; every other host resolves to NOTFOUND; isolated headless Chrome profile.
 * - DevTools transport: the pipe (--remote-debugging-pipe) with flattened target sessions, never a WebSocket. Every
 *   evaluation and input is bounded and a hang is diagnosed with a paused JavaScript stack.
 * - Trusted input only. Clicks: CDP Input.dispatchMouseEvent after a centre hit-test. Drags (contract §6 item 8):
 *   Input.setInterceptDrags, then Input.dispatchMouseEvent (press and move on the source), then
 *   Input.dispatchDragEvent (dragEnter, dragOver, and drop or dragCancel); the source and every target are
 *   centre-hit-tested first, and a passive capture-phase recorder requires every recorded drag event to be trusted.
 *   No page-context synthetic DragEvent is used. Key presses (only in the instrument self-test) carry no
 *   nativeVirtualKeyCode (lesson K-1), and the key trace of every document must contain exactly the runner's own
 *   presses (run-level precondition). The real window.confirm and beforeunload dialogs are answered through
 *   Page.handleJavaScriptDialog. App.handleSignOut's final window.location.assign("/") is observed as a document
 *   request through the CDP Fetch domain and answered with HTTP 204 (h9 only), so the document survives.
 * - Verdicts: each hypothesis part is recorded as "confirmed (correct FAIL)" when the contract requirement fails at
 *   the revision, or "refuted (PASS)" when it holds (the requirement still binds the fixed product); facts the
 *   hypothesis asserts are recorded as observed/not observed. Preconditions (control found, seeds present and of the
 *   declared class, fault armed and observed, drag events trusted, instruments working) stop the run as a harness
 *   failure; product outcomes never stop it. Expected bytes come from this runner's own merge and reorder
 *   implementations written from contract §2 and A2, never from the product.
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log` plus PNG screenshots in this directory; existing evidence is
 *   never overwritten. Exit 0 = harness valid and every requirement holds; 2 = harness valid and at least one
 *   requirement fails (correct before FAILs); 1 = harness invalid. Development probes may redirect evidence with
 *   XAI_NATIVE_EVIDENCE_DIR (refused inside the repository); committed evidence never does.
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
const LOCKFILE_GATE_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const CONTRACT_PATH = "docs/reviews/web-apprail-order-recovery-contract/contract.md";
const CONTRACT_SHA256 = "b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde";
/** Contract r1 header source table (at 419e56d). */
const CONTRACT_SOURCE_HASHES = {
  "packages/xai-web-shell/src/AppRail.tsx": "6312caa162a7d194774bf95282c203ddc633ccc54068edcd2854dfbfd4633f67",
  "packages/xai-web-shell/src/internal/dnd.ts": "a538b51f119f9cedbed3421f8cd21549f1730d0ede9059257402bee9a63deaf9",
  "packages/xai-web-shell/src/registry.tsx": "b621abbecfda785a5d7da628465925dacdb3249638b181cc3ca074687b734c1e",
  "packages/xai-web-shell/src/Topbar.tsx": "87b243344cb055d0a55b5e749bfeceb97b16c6a72a442ee1f990a76ced74c1f0",
  "packages/xai-web-shell/src/Shell.tsx": "1f5fc6c7281c74d1c08b5fac99d90feae79637f5c349fa38823dc2f042428c5f",
  "packages/xai-web-shell/src/types.ts": "ada0b296ed314bdb74b8847dac2b6a20bc3ffc297ded929b7f4f8ad09a88d93a",
  "packages/xai-web-shell/src/index.ts": "c404a9713dee4d821ba3ec6b5c7591f984da3c92b5fb1a62d88fbab5cec368ed",
  "packages/xai-web-shell/src/__tests__/AppRail.test.tsx": "cbe4179146b7f9565cb038027f004520b46917db3da6c0e9f653cf319b309e8f",
  "packages/xai-web-shell/src/__tests__/Topbar.test.tsx": "b3a068eab6bbb95e62cb2ec73f8a715921a48549f090bf7237e8d8c0dabfcb12",
  "apps/web/src/App.tsx": "24461a52a34c83d9e9e51dc92d99db6d76e4c56435bec3e5293e0937a8cc935a",
  "packages/plugin-web-storage/src/internal/registry.ts": "dd961a214c94ac97753e1878323ed387cde3362f4e85f1dfaa8154f1011d29d3",
  "packages/plugin-web-tokens/src/layout.css": "9397dc735d8d80a9720e81561dca73a0ed02a98fd16c1f15634e5c775e2bc6b7",
  "apps/web/src/routes/modules/departureCoordinator.tsx": "0844a697b146b07fceb1835da7c4410db8812bc07bdea362f3386e991a2bc075",
};
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? output;
if (process.env.XAI_NATIVE_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
const MODES = ["h1", "drag", "r1", "h8", "h9", "h11"];
if (!requested) throw Error("Revision required");
if (!MODES.includes(mode)) throw Error(`Unsupported mode ${mode}; use ${MODES.join("|")}`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const resolved = execFileSync("git", ["rev-parse", "--verify", `${requested}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const resolvedTree = execFileSync("git", ["rev-parse", `${resolved}^{tree}`], { cwd: root, encoding: "utf8" }).trim();
const short = resolved.slice(0, 7);
const evidencePath = join(evidenceDir, `native-${short}-${suffix}-${mode}.log`);
if (existsSync(evidencePath)) throw Error("Evidence exists; use a distinct suffix");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const progress = (text) => process.stderr.write(`[apprail-native ${mode}] ${new Date().toISOString().slice(11, 19)} ${text}\n`);
const records = [];
const runtimeErrors = [];
const consoleWarnings = [];
const dialogs = [];
const dialogPlan = [];
const artifacts = [];
const navigationRequests = [];
const networkSeen = { documents: 0, attempts: 0, nonLocal: 0, samples: [] };
let lastCheckId = null;
let currentCase = null;
const record = (name, value = {}) => {
  records.push({ name, ...value });
  if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 300));
};
let checks = 0;
const pre = (id, condition, details = {}) => {
  checks += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { id, kind: "precondition", pass, ...details });
  if (!pass) throw Object.assign(new Error(`PRECONDITION: ${id}`), { checkId: id, checkKind: "precondition" });
};
const verdicts = [];
/** A hypothesis part: holds=false is a correct before FAIL (hypothesis confirmed); true is PASS (refuted). */
const verdict = (id, { hypothesis, claim, requirement, holds, evidence = {} }) => {
  checks += 1;
  lastCheckId = id;
  verdicts.push({ id, hypothesis, requirementHolds: Boolean(holds) });
  record("verdict", { id, hypothesis, claim, requirement, requirementHolds: Boolean(holds), verdict: holds ? "refuted (PASS; the requirement still binds the fixed product)" : "confirmed (correct FAIL)", ...evidence });
  return Boolean(holds);
};
const facts = [];
const fact = (id, { hypothesis, claim, observed, evidence = {} }) => {
  checks += 1;
  lastCheckId = id;
  facts.push({ id, hypothesis, observed: Boolean(observed) });
  record("verdict", { id, hypothesis, claim, kind: "fact", observed: Boolean(observed), verdict: observed ? "observed (fact asserted by the hypothesis)" : "not observed", ...evidence });
};

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const FIXTURE = "native-before-app.tsx";
const PRELUDE = "native-before-prelude.js";
const fixtureSource = readFileSync(join(output, FIXTURE), "utf8");
const preludeSource = readFileSync(join(output, PRELUDE), "utf8");
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
/** Reader, writer and host modules that must be bundled from the archive (contract §2, §9 "Composition"). */
const REQUIRED_MODULES = [
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/RouteGateElements.tsx",
  "apps/web/src/routes/RouteErrorBoundary.tsx",
  "apps/web/src/providers/AppProviders.tsx",
  "apps/web/src/providers/AccountStorageGate.tsx",
  "apps/web/src/routes/modules/shellRegistrations.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/settingsDeparture.ts",
  "packages/xai-web-shell/src/index.ts",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/Topbar.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/AvatarMenu.tsx",
  "packages/xai-web-shell/src/SignOutConfirmDialog.tsx",
  "packages/xai-web-shell/src/registry.tsx",
  "packages/xai-web-shell/src/internal/dnd.ts",
  "packages/xai-web-settings-features-panel/src/FeaturesPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresPane.tsx",
  "packages/xai-web-settings-features-panel/src/useFeaturePrefs.ts",
  "packages/xai-web-settings-features-panel/src/filterModulesByFeaturePrefs.ts",
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearanceController.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/storage.ts",
  "packages/plugin-web-storage/src/internal/codec.ts",
  "packages/plugin-web-storage/src/internal/registry.ts",
  "packages/plugin-web-storage/src/internal/sameTabBus.ts",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/accountOwnership.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-tokens/src/i18n.ts",
  "packages/plugin-web-tokens/src/layout.css",
  "packages/web-auth-device-session/src/session.tsx",
];

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-apprail-native-before-")));
const snapshot = join(directory, "source");
const profile = join(directory, "profile");
let server = null;
let browser = null;
let origin = "";
let moduleIndex = [];

// ---------------------------------------------------------------------------------------------------
// Browser over the DevTools PIPE transport (--remote-debugging-pipe: NUL-delimited JSON on fds 3/4) with flattened
// target sessions; one page object per attached target (the App document and, in h11, a second document).
// ---------------------------------------------------------------------------------------------------
const moduleAt = (url, line) => {
  if (!url || !url.endsWith("/__native/bundle.js") || typeof line !== "number") return null;
  let found = null;
  for (const entry of moduleIndex) { if (entry.line <= line) found = entry.module; else break; }
  return found;
};
const frameSource = (frame) => (frame ? { url: frame.url, line: frame.lineNumber, column: frame.columnNumber, functionName: frame.functionName, module: moduleAt(frame.url, frame.lineNumber) } : null);
async function launch() {
  const proc = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
    "--disable-component-update", "--disable-sync", "--disable-default-apps", "--disable-domain-reliability",
    "--disable-client-side-phishing-detection", "--metrics-recording-only", "--use-mock-keychain",
    "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
    "--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1",
    "--remote-debugging-pipe", `--user-data-dir=${profile}`, "--window-size=1280,900", "about:blank",
  ], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
  const exited = new Promise((resolve) => proc.once("exit", (code, signal) => resolve({ code, signal })));
  const writer = proc.stdio[3];
  const reader = proc.stdio[4];
  const pending = new Map();
  let commandId = 0;
  const state = { proc, exited, pending, pages: new Map(), open: true, pid: proc.pid };
  const handle = (message) => {
    const page = message.sessionId ? state.pages.get(message.sessionId) : null;
    if (!message.method || !page) return;
    if (message.method === "Inspector.targetCrashed") {
      page.crashed = { afterCheck: lastCheckId };
      runtimeErrors.push({ page: page.name, kind: "renderer-crash", afterCheck: lastCheckId, case: currentCase?.id ?? null, allowed: false, text: "Inspector.targetCrashed" });
    } else if (message.method === "Debugger.paused") {
      if (page.onPaused) page.onPaused(message.params);
    } else if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails ?? {};
      runtimeErrors.push({ page: page.name, kind: "exception", afterCheck: lastCheckId, case: currentCase?.id ?? null, allowed: Boolean(currentCase?.allowErrors), text: String(details.exception?.description ?? details.text ?? "").slice(0, 600), source: frameSource(details.stackTrace?.callFrames?.[0] ?? { url: details.url, lineNumber: details.lineNumber, columnNumber: details.columnNumber }) });
    } else if (message.method === "Runtime.consoleAPICalled") {
      const text = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ").slice(0, 600);
      const source = frameSource(message.params.stackTrace?.callFrames?.[0]);
      if (message.params.type === "error" || message.params.type === "assert") runtimeErrors.push({ page: page.name, kind: `console.${message.params.type}`, afterCheck: lastCheckId, case: currentCase?.id ?? null, allowed: Boolean(currentCase?.allowErrors), text, source });
      else if (message.params.type === "warning") consoleWarnings.push({ page: page.name, text: text.slice(0, 300), source, afterCheck: lastCheckId });
    } else if (message.method === "Page.javascriptDialogOpening") {
      if (message.params.type === "beforeunload" && page.navigating) {
        dialogs.push({ page: page.name, type: "beforeunload", message: message.params.message, expected: true, accepted: true, reason: "runner-initiated navigation", afterCheck: lastCheckId, case: currentCase?.id ?? null });
        page.cdp("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
      } else {
        const plan = dialogPlan.shift() ?? null;
        const accept = plan ? plan.accept : message.params.type === "beforeunload";
        dialogs.push({ page: page.name, type: message.params.type, message: message.params.message, expected: Boolean(plan), accepted: accept, purpose: plan?.purpose ?? null, afterCheck: lastCheckId, case: currentCase?.id ?? null });
        page.cdp("Page.handleJavaScriptDialog", { accept }).catch(() => {});
      }
    } else if (message.method === "Fetch.requestPaused") {
      navigationRequests.push({ page: page.name, url: message.params.request.url, resourceType: message.params.resourceType, afterCheck: lastCheckId, case: currentCase?.id ?? null });
      page.cdp("Fetch.fulfillRequest", { requestId: message.params.requestId, responseCode: 204, responseHeaders: [{ name: "Cache-Control", value: "no-store" }], body: "" }).catch(() => {});
    } else if (message.method === "Input.dragIntercepted") {
      page.intercepted.push(message.params.data);
    }
  };
  const settle = (message) => {
    if (message.id && pending.has(message.id)) {
      const job = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) job.reject(Error(JSON.stringify(message.error)));
      else job.resolve(message.result);
    }
  };
  let chunks = [];
  reader.on("data", (chunk) => {
    let start = 0;
    for (let index = chunk.indexOf(0); index !== -1; index = chunk.indexOf(0, start)) {
      chunks.push(chunk.subarray(start, index));
      const text = Buffer.concat(chunks).toString("utf8");
      chunks = [];
      start = index + 1;
      let message;
      try { message = JSON.parse(text); } catch { record("devtools-message-unparsed", { afterCheck: lastCheckId, bytes: text.length }); continue; }
      try { handle(message); } catch (error) { record("devtools-event-handler-error", { afterCheck: lastCheckId, error: String(error).slice(0, 300) }); }
      settle(message);
    }
    if (start < chunk.length) chunks.push(chunk.subarray(start));
  });
  proc.once("exit", (code, signal) => { state.processExit = { code, signal, afterCheck: lastCheckId }; });
  const closed = (why) => {
    if (!state.open) return;
    state.open = false;
    state.closeReason = { why, afterCheck: lastCheckId, processExit: state.processExit ?? null, pending: pending.size };
    for (const job of pending.values()) job.reject(Error(`DevTools pipe closed (${why})`));
    pending.clear();
  };
  reader.on("close", () => closed("read end closed"));
  reader.on("error", (error) => closed(`read error: ${String(error)}`));
  writer.on("error", (error) => closed(`write error: ${String(error)}`));
  state.send = (method, params = {}, sessionId = undefined) => new Promise((resolve, reject) => {
    if (!state.open) { reject(Error("DevTools pipe not open")); return; }
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    writer.write(`${JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params })}\0`);
  });
  return state;
}
async function attachPage(targetId, name, viewport) {
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  const page = { name, targetId, sessionId, navigating: false, crashed: null, onPaused: null, intercepted: [], presses: 0, keyAudit: [] };
  page.cdp = (method, params = {}) => browser.send(method, params, sessionId);
  browser.pages.set(sessionId, page);
  await page.cdp("Inspector.enable");
  await page.cdp("Runtime.enable");
  await page.cdp("Page.enable");
  await page.cdp("DOMStorage.enable");
  await page.cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  await page.cdp("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false });
  return page;
}
const EVALUATE_TIMEOUT_MS = 20000;
async function pausedStack(page) {
  try {
    const paused = new Promise((resolve) => { page.onPaused = resolve; });
    await Promise.race([page.cdp("Debugger.enable"), delay(5000)]);
    await Promise.race([page.cdp("Debugger.pause"), delay(5000)]);
    const params = await Promise.race([paused, delay(8000).then(() => null)]);
    page.onPaused = null;
    if (!params) return { paused: false };
    const frames = (params.callFrames ?? []).slice(0, 25).map((frame) => ({ functionName: frame.functionName, line: frame.location.lineNumber, url: frame.url, module: moduleAt(frame.url || `${origin}/__native/bundle.js`, frame.location.lineNumber) }));
    await Promise.race([page.cdp("Debugger.resume"), delay(3000)]);
    return { paused: true, reason: params.reason, frames };
  } catch (error) {
    return { paused: false, error: String(error) };
  }
}
async function input(page, method, params) {
  if (page.crashed) throw Object.assign(Error("PRECONDITION: renderer crashed (Inspector.targetCrashed)"), { checkId: "harness:renderer-crash", checkKind: "precondition" });
  const result = await Promise.race([page.cdp(method, params), delay(EVALUATE_TIMEOUT_MS).then(() => ({ timedOut: true }))]);
  if (result?.timedOut) {
    record("hang-diagnosis", { afterCheck: lastCheckId, page: page.name, input: { method, type: params.type }, stack: await pausedStack(page) });
    throw Object.assign(Error(`PRECONDITION: input ${method} ${params.type} was not acknowledged within ${EVALUATE_TIMEOUT_MS} ms`), { checkId: "harness:input-timeout", checkKind: "precondition" });
  }
  return result;
}
async function evaluate(page, expression) {
  if (page.crashed) throw Object.assign(Error("PRECONDITION: renderer crashed (Inspector.targetCrashed)"), { checkId: "harness:renderer-crash", checkKind: "precondition" });
  const result = await Promise.race([page.cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }), delay(EVALUATE_TIMEOUT_MS).then(() => ({ timedOut: true }))]);
  if (result.timedOut) {
    record("hang-diagnosis", { afterCheck: lastCheckId, page: page.name, expression: expression.slice(0, 300), stack: await pausedStack(page) });
    throw Object.assign(Error(`PRECONDITION: page evaluation did not answer within ${EVALUATE_TIMEOUT_MS} ms`), { checkId: "harness:page-evaluation-timeout", checkKind: "precondition" });
  }
  if (result.exceptionDetails) throw Error(`Page evaluation failed (${page.name}): ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`);
  return result.result.value;
}
async function waitUntil(page, expression, timeout = 6000) {
  const deadline = Date.now() + timeout;
  for (;;) {
    try {
      if (await evaluate(page, expression)) return true;
    } catch (error) {
      if (error?.checkKind === "precondition") throw error;
    }
    if (Date.now() > deadline) return false;
    await delay(40);
  }
}
async function waitFor(predicate, timeout = 6000) {
  const deadline = Date.now() + timeout;
  while (!predicate()) {
    if (Date.now() > deadline) return false;
    await delay(25);
  }
  return true;
}
/** Network and key audit of the document a page is about to leave (or of the last document at the end of the run). */
const SELF_TEST_PROBE = "http://example.invalid/selftest";
const keyboardAudit = { documents: 0, runnerPresses: 0, keydowns: 0, keyups: 0, keypresses: 0, untrusted: 0, mismatches: [] };
async function collectDocument(page, reason) {
  try {
    const keys = await evaluate(page, "window.__native ? __native.keys : null");
    if (keys) {
      const keydowns = keys.filter((entry) => entry.type === "keydown").length;
      const keyups = keys.filter((entry) => entry.type === "keyup").length;
      const keypresses = keys.filter((entry) => entry.type === "keypress").length;
      const untrusted = keys.filter((entry) => !entry.trusted).length;
      keyboardAudit.documents += 1;
      keyboardAudit.runnerPresses += page.presses;
      keyboardAudit.keydowns += keydowns;
      keyboardAudit.keyups += keyups;
      keyboardAudit.keypresses += keypresses;
      keyboardAudit.untrusted += untrusted;
      const expected = page.keyAudit.flatMap((key) => [`keydown:${key}`, `keyup:${key}`]);
      const actual = keys.map((entry) => `${entry.type}:${entry.key}`);
      if (keydowns !== page.presses || keyups !== page.presses || keypresses !== 0 || untrusted !== 0 || !isDeepStrictEqual(actual, expected)) {
        keyboardAudit.mismatches.push({ page: page.name, reason, afterCheck: lastCheckId, presses: page.presses, keydowns, keyups, keypresses, untrusted, head: actual.slice(0, 12) });
      }
    }
  } catch { /* no document yet */ }
  page.presses = 0;
  page.keyAudit = [];
  try {
    const list = await evaluate(page, "window.__native ? __native.network : []");
    const pageAttempts = list.filter((entry) => entry.url !== SELF_TEST_PROBE);
    networkSeen.documents += 1;
    networkSeen.attempts += pageAttempts.length;
    const nonLocal = pageAttempts.filter((entry) => !entry.local);
    networkSeen.nonLocal += nonLocal.length;
    networkSeen.samples.push(...nonLocal.slice(0, 3));
  } catch { /* no document yet */ }
}
async function navigate(page, url, { expectUnload = true } = {}) {
  await collectDocument(page, `navigate:${url}`);
  page.navigating = expectUnload;
  try {
    await page.cdp("Page.navigate", { url });
  } finally {
    setTimeout(() => { page.navigating = false; }, 2500);
  }
}
async function reload(page) {
  await collectDocument(page, "reload");
  page.navigating = true;
  try { await page.cdp("Page.reload", { ignoreCache: true }); } finally { setTimeout(() => { page.navigating = false; }, 2500); }
}
function pngSize(buffer) { return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }; }
async function screenshot(page, name, details = {}) {
  const shot = await page.cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const buffer = Buffer.from(shot.data, "base64");
  const file = `native-${short}-${suffix}-${mode}-${name}.png`;
  writeFileSync(join(evidenceDir, file), buffer, { flag: "wx" });
  const entry = { file, page: page.name, sha256: sha256(buffer), bytes: buffer.length, png: pngSize(buffer), case: currentCase?.id ?? null, ...details };
  artifacts.push(entry);
  record("screenshot", entry);
  return entry;
}

// ---------------------------------------------------------------------------------------------------
// Oracle (contract §2 display order, A2 merge, dnd.ts reorder semantics), written from the contract text
// ---------------------------------------------------------------------------------------------------
const RAIL_KEY = "xai_rail_order";
const OWNER = "apprail-native-A";
const MARKER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:committed-generation`;
const MARKER = JSON.stringify({ generation: "g1", migrationId: "apprail-native", previous: null });
const LANG_KEY = "xai_pref_lang";
const FEATURE_IDS = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "habits", "meditation"];
const featureKey = (id) => `xai_pref_features_${id}`;
const CRASHING = [
  { label: "object-empty", raw: "{}" },
  { label: "object-tasks", raw: "{\"tasks\":1}" },
  { label: "number-1", raw: "1" },
  { label: "number-0", raw: "0" },
  { label: "number-minus-1", raw: "-1" },
  { label: "true", raw: "true" },
  { label: "false", raw: "false" },
];
/** D(S, R): every id of S in R, in S order; then every id of R not in S, in R order (contract §2). */
function displayOrder(stored, visible) {
  const inR = new Set(visible);
  const out = [];
  const seen = new Set();
  for (const id of stored) if (inR.has(id) && !seen.has(id)) { out.push(id); seen.add(id); }
  for (const id of visible) if (!seen.has(id)) { out.push(id); seen.add(id); }
  return out;
}
/** merge(S, R, P) (contract A2): S's R-slots are refilled from P in order; non-R ids stay; leftover P appended. */
function merge(stored, visible, preview) {
  const inR = new Set(visible);
  const rest = [...preview];
  const out = stored.map((id) => (inR.has(id) ? rest.shift() : id));
  return [...out, ...rest];
}
/** reorderArray semantics (dnd.ts, contract §6): move `from` to the index `to` occupies. */
function reorder(items, from, to) {
  if (from === to) return [...items];
  const fromIndex = items.indexOf(from);
  const toIndex = items.indexOf(to);
  if (fromIndex < 0 || toIndex < 0) return [...items];
  const next = [...items];
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, from);
  return next;
}
/** Contract §5 normative wording (EN and ZH) that the fixed product must render; none may exist at the revision. */
const NORMATIVE = {
  en: ["Sidebar order not saved. Review it.", "Saved sidebar order is unavailable. Review it.", "Order not saved", "Order unavailable", "Sidebar order",
    "Sidebar order is saving.", "Sidebar order was not saved.", "Saved sidebar order is unavailable. Reload it; this is not a new unsaved change.",
    "Retry sidebar order", "Discard sidebar order change", "Export sidebar order draft", "Reload sidebar order"],
  zh: ["侧栏顺序未保存，点击查看。", "已保存的侧栏顺序不可用，点击查看。", "顺序未保存", "顺序不可用", "侧栏顺序",
    "侧栏顺序正在保存。", "侧栏顺序未保存。", "已保存的侧栏顺序不可用。请重新读取；这不是新的未保存更改。",
    "重试 侧栏顺序", "放弃 侧栏顺序更改", "导出侧栏顺序草稿", "重新读取 侧栏顺序"],
};
const RAIL_SIGN_OUT_TEXT = { en: "Your sidebar order change is not saved. Sign out and discard it?", zh: "侧栏顺序更改尚未保存。仍要退出并放弃这项更改吗？" };
let facts0 = null; // archive facts: registrations, nav labels, registry default, lock name
const railIds = () => facts0.registrations.filter((entry) => entry.showInRail).sort((left, right) => (left.railOrder - right.railOrder) || (left.moduleId < right.moduleId ? -1 : left.moduleId > right.moduleId ? 1 : 0)).map((entry) => entry.moduleId);
const visibleIds = (hidden = []) => railIds().filter((id) => !hidden.includes(id));
const labelOf = (lang, id) => facts0.labels.nav[lang][id] ?? id;
const idsToLabels = (lang, ids) => ids.map((id) => labelOf(lang, id));
const labelsToIds = (lang, labels) => labels.map((label) => railIds().find((id) => labelOf(lang, id) === label) ?? `?${label}`);
const parse = (raw) => { try { return JSON.parse(raw); } catch { return undefined; } };

// ---------------------------------------------------------------------------------------------------
// Documents: seed page, App mount, input
// ---------------------------------------------------------------------------------------------------
let selfTested = false;
async function seed(page, entries, label) {
  await navigate(page, `${origin}/seed`);
  pre(`${label}:seed-page-loaded-with-prelude-only`, await waitUntil(page, "document.readyState === 'complete' && location.pathname === '/seed' && !!window.__native && !window.verify", 10000));
  if (!selfTested) {
    const result = await evaluate(page, "__native.selfTest()");
    record("instrument-selftest", { page: "/seed (prelude only, no product code)", result });
    pre("instruments:storage-faults-f-b002-dispatch-locks-confirm-network-unload-census-input-drag", result.quotaThrew && result.quotaNeverStored && result.throwingSetThrew && result.throwingSetNeverStored
      && result.setDelegated && result.getDenied && result.removeDelegated && Object.values(result.totalDenial).every(Boolean) && result.noNestedStorageCalls
      && isDeepStrictEqual(result.dispatchCounted, ["storage:xai_native_apprail_selftest:true", "bus:web:settings:preference-changed"])
      && result.nonLocalFetchRefusedAndLogged && result.lockHeldAndPending && result.lockReleasedAppRan && isDeepStrictEqual(result.lockAttribution, ["fixture", "app"])
      && result.confirmWrapped && result.unloadCensusAndWarn && result.untrustedClickTraced && result.untrustedDragTraced, { result });
    // K-1 positive control: one trusted Escape (no nativeVirtualKeyCode) reaches the page as exactly one keydown and keyup.
    const keyMark = await evaluate(page, "__native.mark()");
    await press(page, "Escape");
    const keys = (await evaluate(page, `__native.window(${keyMark})`)).keys;
    pre("instruments:k1-one-trusted-escape-is-exactly-one-keydown-and-keyup", isDeepStrictEqual(keys.map((entry) => `${entry.type}:${entry.key}:${entry.code}:${entry.trusted}`), ["keydown:Escape:Escape:true", "keyup:Escape:Escape:true"]), { keys });
    selfTested = true;
  }
  const stored = await evaluate(page, `(() => { __native.native.clear(); const seeds = ${JSON.stringify(entries)}; for (const [key, value] of Object.entries(seeds)) __native.native.set(key, value); return __native.native.snapshot(); })()`);
  pre(`${label}:seeded-exact-bytes`, isDeepStrictEqual(stored, entries), { stored });
}
const seedsFor = (lang, extra = {}) => ({ [MARKER_KEY]: MARKER, ...(lang === "zh" ? { [LANG_KEY]: JSON.stringify("zh") } : {}), ...extra });
const READY_APP = "(!!window.verify && !!window.__native && !!document.querySelector('.app header.topbar') && !!document.querySelector('.app-rail .rail-items') && !document.querySelector('.account-data-gate') && verify.scope().kind === 'account')";
const CRASHED = "(!!window.__native && !!__native.routeError())";
/**
 * Production App mount. expect: "app" (a mount failure is a harness precondition), "crash" (the route error boundary
 * is the expected before outcome; a mounted App is recorded, never a precondition failure), or "either".
 */
async function mountApp(page, label, { path = "/app/tasks", expect = "app", ready = READY_APP } = {}) {
  await navigate(page, `${origin}${path}`);
  const settled = await waitUntil(page, `${ready} || ${CRASHED}`, 20000);
  await delay(700);
  const state = await evaluate(page, `({ ready: ${ready}, crashed: ${CRASHED}, routeError: window.__native ? __native.routeError() : null, verifyPresent: !!window.verify, path: location.pathname,
    body: (document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 300) })`);
  pre(`${label}:document-loaded-and-bundle-evaluated`, settled && state.verifyPresent, { state });
  const facts = await evaluate(page, `({ composition: verify.composition, instance: verify.instance, scope: verify.scope(), auth: verify.authCalls(), markerKey: verify.markerKey,
    lockName: verify.lockName(), physicalKey: verify.physicalKey(), lifecycle: verify.lifecycle, registryDefault: verify.registryDefault, registryCodec: verify.registryCodec,
    registrations: verify.registrations, labels: verify.labels, rail: __native.railNames(), topbar: __native.topbar(), pet: !!document.querySelector('.pet-wrap'), location: verify.location(),
    alertsAtMount: __native.surfaces().alerts })`);
  record("observation", { id: `${label}:mounted`, path, ready: state.ready, routeError: state.routeError, rail: facts.rail, topbarControls: facts.topbar.controlsOrder, alertsAtMount: facts.alertsAtMount, instance: facts.instance });
  pre(`${label}:auth-session-context-served-by-real-provider`, facts.composition === "production-app" && facts.auth.includes("getSession") && facts.markerKey === MARKER_KEY, { auth: facts.auth, markerKey: facts.markerKey });
  pre(`${label}:real-lock-name-and-unscoped-device-key`, facts.lockName === `xai:pref:v1:${RAIL_KEY}` && facts.physicalKey === RAIL_KEY, { lockName: facts.lockName, physicalKey: facts.physicalKey });
  if (expect === "app") {
    pre(`${label}:production-app-mounted`, state.ready && !state.crashed, { state });
    pre(`${label}:account-data-gate-activated-account`, facts.scope.kind === "account" && facts.scope.accountId === OWNER && facts.scope.generation === "g1", { scope: facts.scope });
    pre(`${label}:production-surfaces-present`, facts.rail.length > 0 && facts.topbar.present && facts.pet, { rail: facts.rail.length, pet: facts.pet });
  }
  if (!facts0) {
    facts0 = { registrations: facts.registrations, labels: facts.labels, registryDefault: facts.registryDefault, registryCodec: facts.registryCodec, lifecycle: facts.lifecycle, lockName: facts.lockName };
    record("observation", { id: "archive-facts", ...facts0, railIds: railIds() });
    pre("archive-facts:fourteen-rail-modules-and-twelve-defaults", railIds().length === 14 && Array.isArray(facts0.registryDefault) && facts0.registryDefault.length === 12 && facts0.registryCodec === "json", { railIds: railIds(), registryDefault: facts0.registryDefault });
  }
  return { state, facts };
}
async function railPoint(page, name, label) {
  const point = await evaluate(page, `(() => {
    const matches = [...document.querySelectorAll('.app-rail .rail-items .rail-btn')].filter((button) => button.getAttribute('aria-label') === ${JSON.stringify(name)});
    if (matches.length !== 1) return { count: matches.length };
    const rect = matches[0].getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { count: 1, x, y, width: rect.width, height: rect.height, inViewport: x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight, hit: !!hit && matches[0].contains(hit), hitTarget: hit ? hit.tagName + '.' + (typeof hit.className === 'string' ? hit.className : '') : null };
  })()`);
  pre(`${label}:exactly-one-rail-button:${name}`, point.count === 1, { point });
  pre(`${label}:centre-hit-test-uncovered:${name}`, point.hit && point.inViewport, { point });
  return point;
}
async function trustedClick(page, selector, label) {
  const measure = `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { found: false };
    element.scrollIntoView({ block: "center", inline: "nearest" });
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { found: true, x, y, hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + (typeof hit.className === "string" ? hit.className : "") : null };
  })()`;
  let point = await evaluate(page, measure);
  pre(`input:control-present:${label}`, point.found, { selector });
  if (!point.hit) { await delay(400); point = await evaluate(page, measure); }
  pre(`input:centre-hit-test:${label}`, point.hit, { selector, hitTarget: point.hitTarget });
  await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await input(page, "Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(80);
  return point;
}
/** Tags exactly one element (expression: page JS evaluating to an array of candidates) and clicks it. */
async function clickOne(page, expression, label) {
  const found = await evaluate(page, `(() => {
    document.querySelectorAll("[data-native-target]").forEach((element) => element.removeAttribute("data-native-target"));
    const matches = (${expression});
    if (matches.length === 1) matches[0].setAttribute("data-native-target", "1");
    return matches.length;
  })()`);
  pre(`input:exactly-one-control:${label}`, found === 1, { found });
  const point = await trustedClick(page, '[data-native-target="1"]', label);
  await evaluate(page, 'document.querySelector("[data-native-target]")?.removeAttribute("data-native-target")').catch(() => {});
  return point;
}
const KEYDEFS = { Escape: { code: "Escape", vk: 27 } };
/** One trusted key press without nativeVirtualKeyCode (lesson K-1); counted for the key audit. */
async function press(page, key) {
  const def = KEYDEFS[key];
  page.presses += 1;
  page.keyAudit.push(key);
  await input(page, "Input.dispatchKeyEvent", { type: "rawKeyDown", key, code: def.code, windowsVirtualKeyCode: def.vk });
  await input(page, "Input.dispatchKeyEvent", { type: "keyUp", key, code: def.code, windowsVirtualKeyCode: def.vk });
  await delay(60);
}
/**
 * One trusted rail drag (contract §6 item 8): source and targets by accessible name, each centre-hit-tested in the
 * DOM of that moment; end = "drop" (on the last target), "cancel" (Input.dispatchDragEvent dragCancel) or
 * "drop-outside" (dragOver and drop on the centre of .app-main, outside the rail).
 */
async function dragGesture(page, label, { source, targets, end = "drop" }) {
  const sourcePoint = await railPoint(page, source, `${label}:source`);
  const firstPoint = await railPoint(page, targets[0], `${label}:target-0`);
  const mark = await evaluate(page, "__native.mark()");
  page.intercepted = [];
  const steps = [];
  let lastPoint = firstPoint;
  let outside = null;
  await page.cdp("Input.setInterceptDrags", { enabled: true });
  try {
    await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: sourcePoint.x, y: sourcePoint.y });
    await input(page, "Input.dispatchMouseEvent", { type: "mousePressed", x: sourcePoint.x, y: sourcePoint.y, button: "left", buttons: 1, clickCount: 1 });
    await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: sourcePoint.x + 2, y: sourcePoint.y + 6, button: "left", buttons: 1 });
    await input(page, "Input.dispatchMouseEvent", { type: "mouseMoved", x: firstPoint.x, y: firstPoint.y, button: "left", buttons: 1 });
    pre(`${label}:browser-drag-started-and-intercepted`, await waitFor(() => page.intercepted.length > 0, 4000), { intercepted: page.intercepted.length });
    const data = page.intercepted[0];
    for (let index = 0; index < targets.length; index += 1) {
      const point = index === 0 ? firstPoint : await railPoint(page, targets[index], `${label}:target-${index}`);
      await input(page, "Input.dispatchDragEvent", { type: "dragEnter", x: point.x, y: point.y, data });
      await input(page, "Input.dispatchDragEvent", { type: "dragOver", x: point.x, y: point.y, data });
      await delay(250);
      // A hovering pointer keeps sending dragover (a real browser repeats it while the pointer rests). A reorder moves
      // another button under the resting pointer, and Chrome accepts a drop only over an element whose latest
      // dragover was accepted; so one more dragOver at the same point (development probe 1: without it no drop event
      // reached the rail).
      await input(page, "Input.dispatchDragEvent", { type: "dragOver", x: point.x, y: point.y, data });
      await delay(250);
      steps.push({ target: targets[index], ...(await evaluate(page, `({ seq: __native.mark(), rail: __native.railNames(), dragging: __native.rail().filter((entry) => entry.dragging).map((entry) => entry.name), bytes: __native.native.get(${JSON.stringify(RAIL_KEY)}) })`)) });
      lastPoint = point;
    }
    if (end === "drop") {
      await input(page, "Input.dispatchDragEvent", { type: "drop", x: lastPoint.x, y: lastPoint.y, data });
      await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: lastPoint.x, y: lastPoint.y, button: "left", buttons: 0, clickCount: 1 });
    } else if (end === "cancel") {
      await input(page, "Input.dispatchDragEvent", { type: "dragCancel", x: lastPoint.x, y: lastPoint.y, data });
      await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: lastPoint.x, y: lastPoint.y, button: "left", buttons: 0, clickCount: 1 });
    } else if (end === "drop-outside") {
      outside = await evaluate(page, `(() => {
        const main = document.querySelector('.app-main');
        if (!main) return { found: false };
        const rect = main.getBoundingClientRect();
        const x = rect.left + rect.width / 2, y = rect.top + Math.min(rect.height / 2, 300);
        const hit = document.elementFromPoint(x, y);
        return { found: true, x, y, hitTarget: hit ? hit.tagName + '.' + (typeof hit.className === 'string' ? hit.className.slice(0, 60) : '') : null,
          inRail: !!(hit && hit.closest('.app-rail')), editable: !!(hit && (hit.isContentEditable || /^(INPUT|TEXTAREA)$/.test(hit.tagName))) };
      })()`);
      pre(`${label}:outside-point-on-main-content-not-rail-not-editable`, outside.found && !outside.inRail && !outside.editable, { outside });
      await input(page, "Input.dispatchDragEvent", { type: "dragEnter", x: outside.x, y: outside.y, data });
      await input(page, "Input.dispatchDragEvent", { type: "dragOver", x: outside.x, y: outside.y, data });
      await delay(150);
      await input(page, "Input.dispatchDragEvent", { type: "dragOver", x: outside.x, y: outside.y, data });
      await delay(150);
      await input(page, "Input.dispatchDragEvent", { type: "drop", x: outside.x, y: outside.y, data });
      await input(page, "Input.dispatchMouseEvent", { type: "mouseReleased", x: outside.x, y: outside.y, button: "left", buttons: 0, clickCount: 1 });
      lastPoint = outside;
    }
  } finally {
    await page.cdp("Input.setInterceptDrags", { enabled: false }).catch(() => {});
  }
  await delay(500);
  const view = await evaluate(page, `__native.window(${mark})`);
  const drags = view.drags;
  pre(`${label}:every-recorded-drag-event-trusted`, drags.length > 0 && drags.every((entry) => entry.trusted), { drags: drags.map((entry) => `${entry.type}:${entry.target.label}:${entry.trusted}`) });
  pre(`${label}:trusted-dragstart-on-the-source`, drags.some((entry) => entry.type === "dragstart" && entry.target.label === source && entry.target.railButton), { source });
  pre(`${label}:trusted-dragover-on-every-target`, targets.every((target) => drags.some((entry) => entry.type === "dragover" && entry.target.label === target)), { targets });
  pre(`${label}:gesture-ended-with-dragend`, drags.some((entry) => entry.type === "dragend"), {});
  const dropEvents = drags.filter((entry) => entry.type === "drop");
  if (end === "drop") pre(`${label}:trusted-drop-inside-rail-items`, dropEvents.length === 1 && dropEvents[0].target.inRailItems, { dropEvents });
  else pre(`${label}:no-drop-inside-rail-items`, dropEvents.every((entry) => !entry.target.inRailItems), { dropEvents });
  const dropSeq = dropEvents[0]?.seq ?? null;
  const endSeq = drags.filter((entry) => entry.type === "dragend").at(-1).seq;
  const sets = view.attempts.filter((entry) => entry.key === RAIL_KEY && entry.op === "set");
  const removes = view.attempts.filter((entry) => entry.key === RAIL_KEY && entry.op === "remove");
  const result = {
    mark, steps, end, outside, dropSeq, endSeq,
    trace: drags.map((entry) => `${entry.seq}:${entry.type}:${entry.target.label ?? entry.target.tag}:${entry.trusted ? "trusted" : "UNTRUSTED"}`),
    sets: sets.map((entry) => ({ seq: entry.seq, value: entry.value, outcome: entry.outcome, phase: dropSeq !== null && entry.seq > dropSeq ? "at-or-after-drop" : entry.seq > endSeq ? "after-dragend" : "during-dragover" })),
    removes: removes.length,
    lockRequests: view.locks.filter((entry) => entry.by === "app").map((entry) => entry.name),
    view,
  };
  record("observation", { id: `${label}:drag`, source, targets, end, steps, outside, dropSeq, endSeq, trace: result.trace, sets: result.sets, removes: result.removes, lockRequests: result.lockRequests });
  return result;
}
const railNow = (page) => evaluate(page, "__native.railNames()");
const bytesNow = (page) => evaluate(page, `__native.native.get(${JSON.stringify(RAIL_KEY)})`);
const caseStart = (id, options = {}) => { currentCase = { id, ...options }; progress(id); };
const FEATURES_PANE = '.settings-detail[data-pane="features"]';
const READY_FEATURES = `(${READY_APP} && !!document.querySelector('${FEATURES_PANE} [data-feature-id="board"] [role="switch"]'))`;

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
let harnessError = null;
let mainPage = null;
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
  const pinAndGuard = { name: "apprail-native-before-archive-pin-guard", setup(buildApi) {
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
  const built = await esbuild.build({
    stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: FIXTURE },
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
  moduleIndex = js.split("\n").map((text, line) => ({ line, text })).filter((entry) => /^\/\/ \S+\.(tsx?|m?js|cjs|jsx|json|css)$/.test(entry.text)).map((entry) => ({ line: entry.line, module: entry.text.slice(3) }));
  const inputs = Object.keys(built.metafile.inputs);
  const archiveInputs = inputs.filter((entry) => !entry.startsWith("../") && entry !== FIXTURE && !entry.startsWith("<define:"));
  const thirdParty = inputs.filter((entry) => entry.includes("node_modules/"));
  const foreign = inputs.filter((entry) => entry.startsWith("../") && !entry.includes("node_modules/"));
  const missingRequired = REQUIRED_MODULES.filter((file) => !inputs.includes(file) || (!archiveModules.has(file) && !file.endsWith(".css")));
  const requiredHashes = Object.fromEntries(REQUIRED_MODULES.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const contractSourceActual = Object.fromEntries(Object.keys(CONTRACT_SOURCE_HASHES).map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const contractMismatches = Object.entries(CONTRACT_SOURCE_HASHES).filter(([file, hash]) => contractSourceActual[file] !== hash).map(([file]) => file);
  const packageTrees = Object.fromEntries(["packages/xai-web-shell", "apps/web"].map((path) => [path, execFileSync("git", ["rev-parse", `${resolved}:${path}`], { cwd: root, encoding: "utf8" }).trim()]));

  const appPage = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>XAI Web (AppRail order native before, ${mode})</title><link rel="stylesheet" href="/__native/bundle.css"><script src="/__native/prelude.js"></script></head><body><div id="root"></div><script type="module" src="/__native/bundle.js"></script></body></html>`;
  const seedPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>seed</title><script src="/__native/prelude.js"></script></head><body><p>seed page: prelude only, no product code</p></body></html>';
  const externalPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Independent same-origin document</title></head><body><p>second document: no product code, no instruments</p></body></html>';
  const served = {};
  server = createServer((request, response) => {
    const path = new URL(request.url, "http://127.0.0.1").pathname;
    const category = path.startsWith("/__native/") || path === "/seed" || path === "/external" || path === "/favicon.ico" ? path : "app-document";
    served[category] = (served[category] ?? 0) + 1;
    response.setHeader("Cache-Control", "no-store");
    if (path === "/__native/prelude.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(preludeSource); return; }
    if (path === "/__native/bundle.js") { response.setHeader("Content-Type", "text/javascript; charset=utf-8"); response.end(js); return; }
    if (path === "/__native/bundle.css") { response.setHeader("Content-Type", "text/css; charset=utf-8"); response.end(css); return; }
    if (path === "/favicon.ico") { response.statusCode = 204; response.end(); return; }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(path === "/seed" ? seedPage : path === "/external" ? externalPage : appPage);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;

  browser = await launch();
  let firstTarget = null;
  for (let attempt = 0; attempt < 200 && !firstTarget; attempt += 1) {
    const { targetInfos } = await Promise.race([browser.send("Target.getTargets"), delay(5000).then(() => ({ targetInfos: [] }))]);
    firstTarget = targetInfos.find((target) => target.type === "page") ?? null;
    if (!firstTarget) await delay(50);
  }
  pre("session:page-target-over-the-devtools-pipe", Boolean(firstTarget));
  const viewport = mode === "r1" ? { width: 1440, height: 900 } : { width: 1280, height: 900 };
  mainPage = await attachPage(firstTarget.targetId, "A", viewport);
  await mainPage.cdp("Page.bringToFront");
  const version = await browser.send("Browser.getVersion");
  record("baseline", {
    requested, resolved, resolvedTree, packageTrees, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix, composition: "production-app", viewport,
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock), extracted: sha256(extractedLock), contractGate: LOCKFILE_GATE_SHA256 },
    fileSha256: { "verify-native-before.mjs": runnerSha256, [FIXTURE]: sha256(fixtureSource), [PRELUDE]: sha256(preludeSource) },
    contract: { path: CONTRACT_PATH, sha256AtHead: contractSha256, expected: CONTRACT_SHA256 },
    bundleSha256: sha256(js), bundleCssSha256: sha256(css), bundleModuleComments: moduleIndex.length,
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
    requiredModules: { count: REQUIRED_MODULES.length, missing: missingRequired, sha256: requiredHashes },
    contractSourceTable: { rows: Object.keys(CONTRACT_SOURCE_HASHES).length, mismatches: contractMismatches, sha256: contractSourceActual },
    origin: "127.0.0.1 (ephemeral port, this runner's own server); every other host resolves to NOTFOUND",
    devtools: "pipe transport (--remote-debugging-pipe), flattened target sessions; trusted input through Input.dispatchMouseEvent/dispatchDragEvent (setInterceptDrags) and Input.dispatchKeyEvent without nativeVirtualKeyCode",
  });
  pre("baseline:docs-head-product-tree-equals-revision", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === LOCKFILE_GATE_SHA256 && sha256(archiveLock) === LOCKFILE_GATE_SHA256 && sha256(extractedLock) === LOCKFILE_GATE_SHA256);
  pre("baseline:contract-r1-hash", contractSha256 === CONTRACT_SHA256, { contractSha256 });
  pre("baseline:contract-r1-source-table-equal", contractMismatches.length === 0, { contractMismatches });
  pre("baseline:guard-no-module-from-a-checkout", guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre("baseline:every-required-module-bundled-from-archive", missingRequired.length === 0, { missingRequired });

  if (mode === "h1") await runH1();
  if (mode === "drag") await runDrag();
  if (mode === "r1") await runR1();
  if (mode === "h8") await runH8();
  if (mode === "h9") await runH9();
  if (mode === "h11") await runH11();
  currentCase = null;

  await collectDocument(mainPage, "end-of-run");
  record("observation", { id: "run:network-and-requests", network: networkSeen, served });
  record("observation", { id: "k1:keyboard-audit", dispatch: "rawKeyDown + keyUp with key, code and windowsVirtualKeyCode only (no nativeVirtualKeyCode)", ...keyboardAudit });
  pre("run:no-non-local-network-attempt", networkSeen.nonLocal === 0, { networkSeen });
  pre("run:k1-keyboard-trace-contains-only-the-runner-key-presses", keyboardAudit.mismatches.length === 0 && keyboardAudit.keydowns === keyboardAudit.runnerPresses
    && keyboardAudit.keyups === keyboardAudit.runnerPresses && keyboardAudit.keypresses === 0 && keyboardAudit.untrusted === 0, keyboardAudit);
  pre("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs: dialogs.filter((entry) => !entry.expected) });
  const unexpectedErrors = runtimeErrors.filter((entry) => !entry.allowed);
  record("observation", { id: "run:runtime-errors", total: runtimeErrors.length, inCasesWhereErrorsAreTheSubject: runtimeErrors.length - unexpectedErrors.length, outside: unexpectedErrors.length, samplesOutside: unexpectedErrors.slice(0, 5) });
  pre("run:no-renderer-crash", !runtimeErrors.some((entry) => entry.kind === "renderer-crash"));
  verdict("run:zero-runtime-errors-outside-the-crash-and-duplicate-cases", {
    hypothesis: "run-level gate", claim: "No runtime error outside the cases whose subject is a crash (H1) or a duplicate React key (H8)",
    requirement: "§9 runtime-error gates", holds: unexpectedErrors.length === 0, evidence: { samples: unexpectedErrors.slice(0, 5) },
  });
} catch (error) {
  harnessError = error;
} finally {
  const productFailures = verdicts.filter((entry) => !entry.requirementHolds);
  const warningGroups = {};
  for (const warning of consoleWarnings) {
    const key = `${warning.text.slice(0, 160)} @ ${warning.source?.module ?? warning.source?.url ?? "unknown"}`;
    warningGroups[key] = (warningGroups[key] ?? 0) + 1;
  }
  record("result", {
    harnessValid: harnessError === null, mode, checks, verdicts, facts,
    requirementFailures: productFailures.map((entry) => entry.id),
    browser: browser ? { pid: browser.pid, closeReason: browser.closeReason ?? null, processExit: browser.processExit ?? null } : null,
    runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 6).map((entry) => ({ ...entry, text: entry.text.slice(0, 240) })),
    consoleWarnings: consoleWarnings.length, consoleWarningsBySource: warningGroups,
    dialogs, navigationRequests, unusedDialogPlans: dialogPlan, artifacts: artifacts.map((entry) => ({ file: entry.file, sha256: entry.sha256 })), keyboardAudit, network: networkSeen,
    ...(harnessError ? { error: String(harnessError?.stack ?? harnessError).slice(0, 1500), checkId: harnessError?.checkId ?? null, checkKind: harnessError?.checkKind ?? null } : {}),
  });
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`, { flag: "wx" });
  if (browser) {
    browser.send("Browser.close").catch(() => {});
    const graceful = await Promise.race([browser.exited.then(() => true), delay(8000).then(() => false)]);
    if (!graceful) {
      browser.proc.kill("SIGTERM");
      await Promise.race([browser.exited, delay(3000)]);
      if (browser.proc.exitCode === null && browser.proc.signalCode === null) browser.proc.kill("SIGKILL");
    }
  }
  server?.closeAllConnections?.();
  server?.close();
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  process.exitCode = harnessError ? 1 : productFailures.length ? 2 : 0;
  const summary = verdicts.map((entry) => `${entry.id}=${entry.requirementHolds ? "PASS" : "FAIL"}`).join(" ");
  console.log(`${harnessError ? "HARNESS-FAIL" : "VALID"} ${relative(root, evidencePath)} checks=${checks} exit=${process.exitCode} ${summary}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
  setTimeout(() => process.exit(process.exitCode), 500).unref();
}

// ---------------------------------------------------------------------------------------------------
// h1: crashing values at load (H1), EN and ZH
// ---------------------------------------------------------------------------------------------------
async function runH1() {
  const page = mainPage;
  for (const lang of ["en", "zh"]) {
    caseStart(`h1-${lang}-control-absent`);
    await seed(page, seedsFor(lang), `h1-${lang}-control`);
    const control = await mountApp(page, `h1-${lang}-control`, { path: "/app/tasks" });
    const expected = idsToLabels(lang, displayOrder(facts0.registryDefault, visibleIds()));
    pre(`h1-${lang}-control:absent-bytes-display-the-reconciled-default`, isDeepStrictEqual(control.facts.rail, expected) && (await bytesNow(page)) === null, { rail: control.facts.rail, expected });
    for (const value of CRASHING) {
      caseStart(`h1-${lang}-${value.label}`, { allowErrors: true });
      const parsed = parse(value.raw);
      pre(`h1-${lang}-${value.label}:seed-class-not-iterable`, parsed !== undefined && parsed !== null && typeof parsed !== "string" && !Array.isArray(parsed), { raw: value.raw });
      await seed(page, seedsFor(lang, { [RAIL_KEY]: value.raw }), `h1-${lang}-${value.label}`);
      const perRoute = {};
      for (const path of ["/app/tasks", "/app/settings/appearance", "/app/dashboard", "/app/calendar"]) {
        const label = `h1-${lang}-${value.label}-${path.split("/").filter(Boolean).slice(1).join("-")}`;
        const { state } = await mountApp(page, label, { path, expect: "crash" });
        const view = await evaluate(page, `({ routeError: __native.routeError(), topbar: !!document.querySelector('header.topbar'), rail: !!document.querySelector('.app-rail'), settings: !!document.querySelector('.settings-shell'),
          buttons: document.querySelectorAll('button').length, links: document.querySelectorAll('a[href]').length, inputs: document.querySelectorAll('input,select,textarea').length,
          body: (document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 300), lang: document.documentElement.getAttribute('lang'), path: location.pathname,
          attempts: __native.window(0).attempts.filter((entry) => entry.key === ${JSON.stringify(RAIL_KEY)} && entry.op !== 'get').length, bytes: __native.native.get(${JSON.stringify(RAIL_KEY)}) })`);
        perRoute[path] = { ...view, ready: state.ready };
        if (path === "/app/tasks" || path === "/app/settings/appearance") {
          await screenshot(page, `${lang}-${value.label}-${path === "/app/tasks" ? "tasks" : "settings-appearance"}`, { value: value.raw, path, lang, routeError: view.routeError });
        }
      }
      // Reload of /app/tasks: the bytes persist and the error repeats.
      await mountApp(page, `h1-${lang}-${value.label}-tasks-again`, { path: "/app/tasks", expect: "crash" });
      await reload(page);
      const reloaded = await waitUntil(page, `${READY_APP} || ${CRASHED}`, 20000);
      await delay(600);
      const afterReload = await evaluate(page, `({ routeError: __native.routeError(), ready: ${READY_APP}, bytes: __native.native.get(${JSON.stringify(RAIL_KEY)}), buttons: document.querySelectorAll('button').length })`);
      pre(`h1-${lang}-${value.label}:reload-document-settled`, reloaded, { afterReload });
      const routes = Object.entries(perRoute);
      const allCrash = routes.every(([, entry]) => entry.routeError && entry.routeError.heading === "Route Error (app)" && /is not iterable/.test(entry.routeError.message ?? "") && !entry.topbar && !entry.rail);
      record("observation", { id: `h1-${lang}-${value.label}`, raw: value.raw, perRoute, afterReload });
      verdict(`H1-${lang}-${value.label}:no-route-error`, {
        hypothesis: "H1", claim: `${value.raw} in xai_rail_order makes every /app route render "Route Error (app)" with a not-iterable TypeError`,
        requirement: "§5 item 2 / §10 item 4: the rail displays D(DEFAULT_RAIL_ORDER, R), nothing throws, App renders on every /app route (Settings included)",
        holds: routes.every(([, entry]) => entry.ready && !entry.routeError),
        evidence: { routes: Object.fromEntries(routes.map(([path, entry]) => [path, { routeError: entry.routeError, topbar: entry.topbar, rail: entry.rail }])) },
      });
      fact(`H1-${lang}-${value.label}:route-error-not-iterable-on-four-routes-and-after-reload`, {
        hypothesis: "H1", claim: "Route Error (app) with a not-iterable TypeError on /app/tasks, /app/settings/appearance, /app/dashboard and /app/calendar; reloading repeats it",
        observed: allCrash && afterReload.routeError?.heading === "Route Error (app)" && /is not iterable/.test(afterReload.routeError?.message ?? ""),
        evidence: { messages: [...new Set(routes.map(([, entry]) => entry.routeError?.message ?? null))], afterReload: afterReload.routeError },
      });
      fact(`H1-${lang}-${value.label}:no-ui-can-repair-and-bytes-persist`, {
        hypothesis: "H1", claim: "No UI can repair it: the error page has no button, link or field; the bytes are never rewritten (zero set/remove attempts) and persist across reloads",
        observed: routes.every(([, entry]) => entry.buttons === 0 && entry.links === 0 && entry.inputs === 0 && entry.attempts === 0 && entry.bytes === value.raw) && afterReload.bytes === value.raw && afterReload.buttons === 0,
        evidence: { perRoute: Object.fromEntries(routes.map(([path, entry]) => [path, { buttons: entry.buttons, links: entry.links, inputs: entry.inputs, railMutations: entry.attempts, bytes: entry.bytes }])), afterReloadBytes: afterReload.bytes },
      });
    }
  }
}

// ---------------------------------------------------------------------------------------------------
// drag: H2 (EN, ZH), H3, H4, H6 and the P6 positive control
// ---------------------------------------------------------------------------------------------------
async function freshReversed(page, label, lang) {
  // The custom order must use the production rail ids; read them from a first mount, then seed and remount.
  if (!facts0) {
    await seed(page, seedsFor(lang), `${label}:ids`);
    await mountApp(page, `${label}:ids-mount`, { path: "/app/tasks" });
  }
  const REVERSED = [...railIds()].reverse();
  await seed(page, seedsFor(lang, { [RAIL_KEY]: JSON.stringify(REVERSED) }), label);
  const { facts } = await mountApp(page, `${label}:mount`, { path: "/app/tasks" });
  pre(`${label}:seed-class-in-domain-distinct-production-ids`, new Set(REVERSED).size === REVERSED.length && REVERSED.every((id) => railIds().includes(id)), { REVERSED });
  const expected = idsToLabels(lang, displayOrder(REVERSED, visibleIds()));
  pre(`${label}:rail-displays-the-seeded-custom-order`, isDeepStrictEqual(facts.rail, expected), { rail: facts.rail, expected });
  return { S: REVERSED, D0: displayOrder(REVERSED, visibleIds()), labels: facts.rail };
}
async function runDrag() {
  const page = mainPage;
  // ---- P6 positive control (must PASS at the revision): final bytes of a successful all-visible drag ----------------
  {
    caseStart("pc-p6");
    const { S, D0, labels } = await freshReversed(page, "pc-p6", "en");
    const gesture = await dragGesture(page, "pc-p6", { source: labels[0], targets: [labels[2]], end: "drop" });
    const P = reorder(D0, D0[0], D0[2]);
    const bytes = await bytesNow(page);
    const rail = await railNow(page);
    verdict("PC-P6:final-bytes-of-an-all-visible-drag-equal-merge", {
      hypothesis: "positive control (§12 validity: the final bytes of a successful all-visible drag, P6)",
      claim: "With all 14 modules visible, the persisted order after a trusted drag and drop equals merge(S, R, P) = P",
      requirement: "A2 P6: when every element of S is in R, S' equals P", holds: bytes === JSON.stringify(merge(S, visibleIds(), P)) && isDeepStrictEqual(rail, idsToLabels("en", P)),
      evidence: { bytes: parse(bytes), expected: merge(S, visibleIds(), P), rail, sets: gesture.sets },
    });
    await screenshot(page, "pc-p6-after-drop", { state: "positive control: after a trusted drag of the first rail button onto the third, with a drop" });
  }
  // ---- H3: a two-step trusted drag -----------------------------------------------------------------------------------
  {
    caseStart("h3");
    const { S, D0, labels } = await freshReversed(page, "h3", "en");
    const gesture = await dragGesture(page, "h3", { source: labels[0], targets: [labels[2], labels[5]], end: "drop" });
    const first = reorder(D0, D0[0], D0[2]);
    const second = reorder(first, D0[0], D0[5]);
    const during = gesture.sets.filter((entry) => entry.phase === "during-dragover");
    const atDrop = gesture.sets.filter((entry) => entry.phase !== "during-dragover");
    const P = second;
    verdict("H3:exactly-one-write-at-drop-zero-during-dragover", {
      hypothesis: "H3", claim: "A trusted drag whose preview changes twice before the drop writes during dragover and not at the drop",
      requirement: "§6 items 2–3 / A7: zero storage attempts on dragenter/dragover; exactly one set intent at the drop with merge(S, R, P)",
      holds: during.length === 0 && atDrop.length === 1 && atDrop[0].value === JSON.stringify(merge(S, visibleIds(), P)),
      evidence: { sets: gesture.sets, previewSteps: gesture.steps.map((step) => ({ target: step.target, rail: labelsToIds("en", step.rail), bytes: parse(step.bytes) })) },
    });
    fact("H3:two-setItem-during-dragover-none-at-drop", {
      hypothesis: "H3", claim: "Two setItem(\"xai_rail_order\") attempts during dragover (the two preview changes) and none at the drop",
      observed: during.length === 2 && atDrop.length === 0 && during[0].value === JSON.stringify(first) && during[1].value === JSON.stringify(second),
      evidence: { during: during.map((entry) => parse(entry.value)), atDrop: atDrop.map((entry) => parse(entry.value)), expectedFirst: first, expectedSecond: second, finalBytes: parse(await bytesNow(page)) },
    });
    await screenshot(page, "h3-after-drop", { state: "after a two-step trusted drag (first button over the third, then over the sixth) and a drop" });
  }
  // ---- H4: cancelled drags ----------------------------------------------------------------------------------------------
  for (const end of ["cancel", "drop-outside"]) {
    const id = `h4-${end}`;
    caseStart(id);
    const { S, D0, labels } = await freshReversed(page, id, "en");
    const gesture = await dragGesture(page, id, { source: labels[0], targets: [labels[2]], end });
    const previewed = reorder(D0, D0[0], D0[2]);
    const bytes = await bytesNow(page);
    const rail = await railNow(page);
    verdict(`H4-${end}:cancelled-drag-zero-writes-and-preview-reverts`, {
      hypothesis: "H4", claim: `A cancelled drag (${end === "cancel" ? "Input.dispatchDragEvent dragCancel" : "a release outside the rail on the main content"}) still persists the previewed order`,
      requirement: "§6 item 4 / host row r: a dragend without a drop makes zero attempts; the rail displays the committed order again",
      holds: gesture.sets.length === 0 && bytes === JSON.stringify(S) && isDeepStrictEqual(rail, idsToLabels("en", D0)),
      evidence: { sets: gesture.sets, bytes: parse(bytes), committedBefore: S, previewed, rail: labelsToIds("en", rail), outside: gesture.outside, trace: gesture.trace },
    });
    fact(`H4-${end}:previewed-order-persisted`, {
      hypothesis: "H4", claim: "The previewed order is persisted although the gesture was cancelled",
      observed: bytes === JSON.stringify(previewed) && isDeepStrictEqual(rail, idsToLabels("en", previewed)), evidence: { bytes: parse(bytes), previewed },
    });
    await screenshot(page, `${id}-after`, { state: `after a trusted drag of the first rail button over the third, ended by ${end}` });
  }
  // ---- H6: the real per-key Web Lock held by the fixture ------------------------------------------------------------
  {
    caseStart("h6");
    const { S, D0, labels } = await freshReversed(page, "h6", "en");
    const lockName = await evaluate(page, "verify.lockName()");
    await evaluate(page, `__native.hold(${JSON.stringify(lockName)})`);
    const query = await evaluate(page, "__native.lockQuery()");
    pre("h6:real-per-key-lock-held-by-the-fixture", query.held.includes(lockName), { lockName, query });
    const gesture = await dragGesture(page, "h6", { source: labels[0], targets: [labels[2]], end: "drop" });
    const P = reorder(D0, D0[0], D0[2]);
    const whileHeld = { bytes: await bytesNow(page), rail: await railNow(page), query: await evaluate(page, "__native.lockQuery()") };
    pre("h6:lock-still-held-when-observed", whileHeld.query.held.includes(lockName), { query: whileHeld.query });
    const releaseMark = await evaluate(page, "__native.mark()");
    await evaluate(page, `__native.release(${JSON.stringify(lockName)})`);
    await delay(600);
    const afterRelease = { bytes: await bytesNow(page), window: await evaluate(page, `__native.window(${releaseMark})`) };
    const releaseSets = afterRelease.window.attempts.filter((entry) => entry.key === RAIL_KEY && entry.op === "set");
    verdict("H6:write-waits-for-the-held-per-key-lock", {
      hypothesis: "H6", claim: "The legacy write ignores a held prefMutationLockName(\"xai_rail_order\") lock: the bytes change immediately",
      requirement: "§9 host row e: while the write is held behind the real lock the bytes are unchanged; after release exactly one write",
      holds: whileHeld.bytes === JSON.stringify(S) && releaseSets.length === 1 && afterRelease.bytes === JSON.stringify(merge(S, visibleIds(), P)),
      evidence: { lockName, bytesWhileHeld: parse(whileHeld.bytes), committedBefore: S, setsDuringGesture: gesture.sets, setsAfterRelease: releaseSets.length, appLockRequestsDuringGesture: gesture.lockRequests, bytesAfterRelease: parse(afterRelease.bytes) },
    });
    fact("H6:bytes-changed-while-lock-held-and-no-app-lock-request", {
      hypothesis: "H6", claim: "While the fixture holds the real per-key lock, the drag's setItem lands immediately and the product never requests that lock",
      observed: whileHeld.bytes !== JSON.stringify(S) && gesture.sets.length >= 1 && gesture.sets.every((entry) => entry.outcome === "ok") && !gesture.lockRequests.includes(lockName),
      evidence: { bytesWhileHeld: parse(whileHeld.bytes), sets: gesture.sets, appLockRequests: gesture.lockRequests },
    });
  }
  // ---- H2: a failed drag (quota; throwing setItem), EN and ZH ------------------------------------------------------------
  for (const lang of ["en", "zh"]) {
    for (const kind of ["QuotaExceededError", "SecurityError"]) {
      const id = `h2-${lang}-${kind === "QuotaExceededError" ? "quota" : "throwing-setitem"}`;
      caseStart(id);
      const { S, D0, labels } = await freshReversed(page, id, lang);
      await evaluate(page, `__native.denySet(${JSON.stringify(RAIL_KEY)}, ${JSON.stringify(kind)})`);
      const gesture = await dragGesture(page, id, { source: labels[0], targets: [labels[2]], end: "drop" });
      const P = reorder(D0, D0[0], D0[2]);
      const denied = gesture.sets.filter((entry) => entry.outcome.startsWith("denied"));
      pre(`${id}:fault-armed-and-observed`, denied.length >= 1 && gesture.sets.every((entry) => entry.outcome === (kind === "QuotaExceededError" ? "denied-quota" : "denied-throw")), { sets: gesture.sets });
      await delay(800);
      const after = { rail: await railNow(page), bytes: await bytesNow(page), topbar: await evaluate(page, "__native.topbar()"), surfaces: await evaluate(page, "__native.surfaces()"), warn: await evaluate(page, "__native.warn()") };
      pre(`${id}:bytes-unchanged`, after.bytes === JSON.stringify(S), { bytes: after.bytes });
      const normative = [...NORMATIVE.en, ...NORMATIVE.zh];
      const recoveryUi = after.topbar.railOrderStatus || after.topbar.railOrderPanel || after.topbar.railOrderActions.length > 0
        || after.surfaces.buttons.some((name) => normative.includes(name)) || normative.some((text) => after.surfaces.text.includes(text));
      verdict(`H2-${lang}-${kind}:latest-order-kept-displayed-with-recovery`, {
        hypothesis: "H2", claim: "A drag whose write fails is a silent no-op",
        requirement: "§5 item 4 / host row d: the dropped order stays displayed and, after settlement, the Topbar status with Retry, Discard and Export appears",
        holds: isDeepStrictEqual(after.rail, idsToLabels(lang, P)) && after.topbar.railOrderStatus,
        evidence: { rail: labelsToIds(lang, after.rail), dropped: P, stored: S, topbar: after.topbar },
      });
      fact(`H2-${lang}-${kind}:silent-no-op`, {
        hypothesis: "H2", claim: "The rail returns to (stays at) the stored order, there is no message, Retry, Discard or Export, and the bytes keep the old order",
        observed: isDeepStrictEqual(after.rail, idsToLabels(lang, D0)) && !recoveryUi && after.bytes === JSON.stringify(S) && after.warn.warned === false,
        evidence: { rail: labelsToIds(lang, after.rail), previewSteps: gesture.steps.map((step) => labelsToIds(lang, step.rail)), alerts: after.surfaces.alerts, topbar: after.topbar, warn: after.warn, deniedAttempts: denied.length },
      });
      await screenshot(page, `h2-${lang}-${kind === "QuotaExceededError" ? "quota" : "throwing-setitem"}-after-drop`, { state: `after a trusted drag (first rail button onto the third) and a drop with setItem("xai_rail_order") failing (${kind})`, lang });
      await evaluate(page, "__native.restore()");
    }
  }
}

// ---------------------------------------------------------------------------------------------------
// r1: H5 end to end (Boards hidden through the real Features pane; trusted drag; re-enable), and ghost-module
// ---------------------------------------------------------------------------------------------------
async function toggleFeature(page, id, expectValue, label) {
  const before = await evaluate(page, `document.querySelector('${FEATURES_PANE} [data-feature-id="${id}"] [role="switch"]').getAttribute('aria-checked')`);
  const mark = await evaluate(page, "__native.mark()");
  await trustedClick(page, `${FEATURES_PANE} [data-feature-id="${id}"] [role="switch"]`, `${label}:features-switch-${id}`);
  const settled = await waitUntil(page, `__native.native.get(${JSON.stringify(featureKey(id))}) === ${JSON.stringify(String(expectValue))} && document.querySelector('${FEATURES_PANE} [data-feature-id="${id}"] [role="switch"]').getAttribute('aria-checked') === ${JSON.stringify(String(expectValue))}`, 8000);
  await delay(500);
  const view = await evaluate(page, `__native.window(${mark})`);
  const click = view.events.filter((entry) => entry.type === "click");
  pre(`${label}:features-toggle-${id}-by-trusted-click-committed`, settled && click.length >= 1 && click.every((entry) => entry.trusted), { before, clicks: click.length });
  return { railWrites: view.attempts.filter((entry) => entry.key === RAIL_KEY && entry.op !== "get") };
}
async function runR1() {
  const page = mainPage;
  for (const lang of ["en", "zh"]) {
    const id = `h5-${lang}`;
    caseStart(id);
    if (!facts0) {
      await seed(page, seedsFor(lang), `${id}:ids`);
      await mountApp(page, `${id}:ids-mount`, { path: "/app/tasks" });
    }
    // S: 14 distinct production ids, board at index 2 (seed rule: in-domain; Features keys exactly "true").
    const S = ["calendar", "tasks", "board", "dashboard", "matrix", "pomodoro", "timetrack", "bookkeeping", "metrics", "habits", "meditation", "countdown", "ai", "statistics"];
    pre(`${id}:seed-class-in-domain-board-at-index-2`, new Set(S).size === 14 && S.every((entry) => railIds().includes(entry)) && S.indexOf("board") === 2, { S });
    await seed(page, seedsFor(lang, { [RAIL_KEY]: JSON.stringify(S), ...Object.fromEntries(FEATURE_IDS.map((feature) => [featureKey(feature), "true"])) }), id);
    const { facts } = await mountApp(page, `${id}:mount`, { path: "/app/settings/features", ready: READY_FEATURES });
    pre(`${id}:rail-displays-seeded-order-with-boards-at-index-2`, isDeepStrictEqual(facts.rail, idsToLabels(lang, S)), { rail: facts.rail });
    const off = await toggleFeature(page, "board", false, `${id}:off`);
    const hiddenRail = await railNow(page);
    const R = visibleIds(["board"]);
    pre(`${id}:boards-hidden-from-the-rail`, isDeepStrictEqual(hiddenRail, idsToLabels(lang, displayOrder(S, R))), { hiddenRail });
    if (lang === "en") await screenshot(page, "h5-en-1440-boards-hidden", { state: "Boards turned off through the real Features pane (trusted click); seeded order had Boards at index 2" });
    const D = displayOrder(S, R);
    const gesture = await dragGesture(page, `${id}:drag`, { source: labelOf(lang, D[0]), targets: [labelOf(lang, D[2])], end: "drop" });
    const P = reorder(D, D[0], D[2]);
    await delay(400);
    const bytes = parse(await bytesNow(page));
    const expected = merge(S, R, P);
    if (lang === "en") await screenshot(page, "h5-en-1440-after-drop", { state: "after a trusted drag (first visible rail button onto the third) and a drop, Boards hidden" });
    const on = await toggleFeature(page, "board", true, `${id}:on`);
    const reenabled = labelsToIds(lang, await railNow(page));
    if (lang === "en") await screenshot(page, "h5-en-1440-after-re-enabling", { state: "after Boards was turned on again through the real Features pane" });
    record("observation", { id: `${id}:sequence`, S, R, D, P, bytes, expectedMerge: expected, reenabled, featureToggleRailWrites: { off: off.railWrites, on: on.railWrites } });
    verdict(`H5-${lang}:hidden-module-keeps-its-stored-index`, {
      hypothesis: "H5", claim: "With Boards hidden by Features, a drag writes an order without board",
      requirement: "R-1 / A2 P1–P3 / host row c: the bytes keep board at index 2 and their visible filter equals the dropped order",
      holds: isDeepStrictEqual(bytes, expected) && Array.isArray(bytes) && bytes.indexOf("board") === 2 && isDeepStrictEqual(bytes.filter((entry) => R.includes(entry)), P),
      evidence: { bytes, expected, sets: gesture.sets },
    });
    verdict(`H5-${lang}:re-enabled-module-returns-to-its-index`, {
      hypothesis: "H5", claim: "After Boards is re-enabled it displays last instead of at its previous index",
      requirement: "R-1 / A2 P5: Boards displays at index 2 again",
      holds: reenabled.indexOf("board") === 2, evidence: { reenabled, boardIndex: reenabled.indexOf("board") },
    });
    fact(`H5-${lang}:board-dropped-from-bytes-and-displayed-last`, {
      hypothesis: "H5", claim: "The written order lacks board, and after re-enabling Boards displays last",
      observed: Array.isArray(bytes) && !bytes.includes("board") && reenabled.at(-1) === "board", evidence: { bytes, reenabled },
    });
    fact(`H5-${lang}:features-toggles-wrote-nothing-to-the-order`, {
      hypothesis: "§5 item 9 (control)", claim: "The two Features toggles made zero attempts on xai_rail_order",
      observed: off.railWrites.length === 0 && on.railWrites.length === 0, evidence: { off: off.railWrites, on: on.railWrites },
    });
  }
  // ---- unknown id (ghost-module) at index 0, all modules visible (EN) ----------------------------------------------------
  {
    const id = "h5-ghost-en";
    caseStart(id);
    const S = ["ghost-module", ...[...railIds()].reverse()];
    pre(`${id}:seed-class-in-domain-unknown-id-at-index-0`, new Set(S).size === S.length && S[0] === "ghost-module" && !railIds().includes("ghost-module"), { S });
    await seed(page, seedsFor("en", { [RAIL_KEY]: JSON.stringify(S) }), id);
    const { facts } = await mountApp(page, `${id}:mount`, { path: "/app/tasks" });
    const R = visibleIds();
    const D = displayOrder(S, R);
    pre(`${id}:rail-displays-the-reconciled-order`, isDeepStrictEqual(facts.rail, idsToLabels("en", D)), { rail: facts.rail });
    const gesture = await dragGesture(page, `${id}:drag`, { source: labelOf("en", D[0]), targets: [labelOf("en", D[2])], end: "drop" });
    const P = reorder(D, D[0], D[2]);
    await delay(400);
    const bytes = parse(await bytesNow(page));
    verdict("H5-ghost:unknown-id-keeps-its-stored-index", {
      hypothesis: "H5", claim: "An unknown id (ghost-module) is dropped from the stored order by the first drag",
      requirement: "A2 (one rule for every non-visible id) / P2: ghost-module keeps index 0; the bytes equal merge(S, R, P)",
      holds: isDeepStrictEqual(bytes, merge(S, R, P)), evidence: { bytes, expected: merge(S, R, P), sets: gesture.sets },
    });
    fact("H5-ghost:unknown-id-pruned", { hypothesis: "H5", claim: "ghost-module is absent from the bytes written by the drag", observed: Array.isArray(bytes) && !bytes.includes("ghost-module"), evidence: { bytes } });
  }
}

// ---------------------------------------------------------------------------------------------------
// h8: repeated strings at load, EN and ZH
// ---------------------------------------------------------------------------------------------------
async function runH8() {
  const page = mainPage;
  const values = [
    { label: "tasks-twice", raw: "[\"tasks\",\"tasks\"]", repeated: "tasks" },
    { label: "board-tasks-board", raw: "[\"board\",\"tasks\",\"board\"]", repeated: "board" },
  ];
  for (const lang of ["en", "zh"]) {
    for (const value of values) {
      const id = `h8-${lang}-${value.label}`;
      caseStart(id, { allowErrors: true });
      const parsed = parse(value.raw);
      pre(`${id}:seed-class-repeated-string`, Array.isArray(parsed) && parsed.every((entry) => typeof entry === "string") && new Set(parsed).size < parsed.length, { raw: value.raw });
      const errorsAt = runtimeErrors.length;
      await seed(page, seedsFor(lang, { [RAIL_KEY]: value.raw }), id);
      const { facts } = await mountApp(page, `${id}:mount`, { path: "/app/tasks" });
      const view = await evaluate(page, `({ rail: __native.railNames(), topbar: __native.topbar(), surfaces: __native.surfaces(), attempts: __native.window(0).attempts.filter((entry) => entry.key === ${JSON.stringify(RAIL_KEY)} && entry.op !== 'get').length, bytes: __native.native.get(${JSON.stringify(RAIL_KEY)}) })`);
      const repeatedLabel = labelOf(lang, value.repeated);
      const count = view.rail.filter((name) => name === repeatedLabel).length;
      const defaultDisplay = idsToLabels(lang, displayOrder(facts0.registryDefault, visibleIds()));
      const errors = runtimeErrors.slice(errorsAt).map((entry) => entry.text.slice(0, 200));
      await screenshot(page, `${lang}-${value.label}`, { value: value.raw, lang, state: "rail at load with a repeated string in xai_rail_order" });
      record("observation", { id, raw: value.raw, rail: view.rail, count, topbar: view.topbar, runtimeErrorsAtLoad: errors });
      verdict(`H8-${lang}-${value.label}:default-display-and-source-status`, {
        hypothesis: "H8", claim: `${value.raw} renders the ${repeatedLabel} button twice`,
        requirement: "A5 / §5 item 2: a repeated string makes the source invalid; the rail displays D(DEFAULT_RAIL_ORDER, R) (each module once) and the Topbar source status shows Reload only",
        holds: isDeepStrictEqual(view.rail, defaultDisplay) && view.topbar.railOrderStatus,
        evidence: { rail: view.rail, defaultDisplay, topbar: view.topbar },
      });
      fact(`H8-${lang}-${value.label}:button-rendered-twice`, {
        hypothesis: "H8", claim: `The ${repeatedLabel} rail button renders twice (15 buttons), with zero mount writes and unchanged bytes`,
        observed: count === 2 && view.rail.length === 15 && view.attempts === 0 && view.bytes === value.raw,
        evidence: { count, buttons: view.rail.length, mountMutations: view.attempts, duplicateKeyConsoleErrors: errors.filter((text) => /same key/i.test(text)).length },
      });
    }
  }
}

// ---------------------------------------------------------------------------------------------------
// h9: no status, no unload warning and no sign-out step with a failed rail drag (EN and ZH)
// ---------------------------------------------------------------------------------------------------
async function failedDrag(page, id, lang) {
  const { S, D0, labels } = await freshReversed(page, id, lang);
  await evaluate(page, `__native.denySet(${JSON.stringify(RAIL_KEY)}, "QuotaExceededError")`);
  const gesture = await dragGesture(page, id, { source: labels[0], targets: [labels[2]], end: "drop" });
  pre(`${id}:fault-armed-and-observed`, gesture.sets.length >= 1 && gesture.sets.every((entry) => entry.outcome === "denied-quota"), { sets: gesture.sets });
  await delay(600);
  pre(`${id}:bytes-unchanged`, (await bytesNow(page)) === JSON.stringify(S));
  return { S, D0, P: reorder(D0, D0[0], D0[2]), gesture };
}
async function runH9() {
  const page = mainPage;
  for (const lang of ["en", "zh"]) {
    // (a) status, unload census, synthetic and real beforeunload
    {
      const id = `h9-${lang}-status-unload`;
      caseStart(id);
      await failedDrag(page, id, lang);
      const topbar = await evaluate(page, "__native.topbar()");
      const surfaces = await evaluate(page, "__native.surfaces()");
      const warn = await evaluate(page, "__native.warn()");
      const census = await evaluate(page, "__native.unloadListeners()");
      await screenshot(page, `${lang}-after-failed-drag`, { state: "on /app/tasks after a failed trusted rail drag (quota fault armed and observed)", lang });
      const normative = NORMATIVE[lang];
      const anyNormative = normative.some((text) => surfaces.text.includes(text)) || surfaces.buttons.some((name) => normative.includes(name));
      verdict(`H9-${lang}:topbar-status-after-a-failed-drag`, {
        hypothesis: "H9", claim: "With an unsaved rail order there is no Topbar status",
        requirement: "A8 / §7 item 2: after settlement the Topbar rail status (data-testid=\"rail-order-status\") renders with its accessible name",
        holds: topbar.railOrderStatus, evidence: { topbar, normativeTextPresent: anyNormative },
      });
      fact(`H9-${lang}:no-status-or-recovery-ui-anywhere`, {
        hypothesis: "H9", claim: "No rail status, panel, message or action exists anywhere (no normative EN/ZH text)",
        observed: !topbar.railOrderStatus && !topbar.railOrderPanel && topbar.railOrderActions.length === 0 && !anyNormative, evidence: { topbarControls: topbar.controlsOrder, alerts: surfaces.alerts },
      });
      verdict(`H9-${lang}:beforeunload-warns-with-a-rail-draft`, {
        hypothesis: "H9", claim: "beforeunload is not prevented",
        requirement: "§7 item 3 / host row l: a beforeunload listener exists while a rail draft exists and warns with zero storage attempts",
        holds: warn.warned === true && warn.attempts === 0, evidence: { warn, liveBeforeunloadListeners: census },
      });
      // A real runner navigation away (not flagged as expected): a beforeunload dialog would be recorded and accepted.
      const dialogsAt = dialogs.length;
      dialogPlan.push({ accept: true, purpose: `${id}: a real beforeunload prompt, if any` });
      await navigate(page, `${origin}/seed`, { expectUnload: false });
      const left = await waitUntil(page, "location.pathname === '/seed' && !!window.__native && !window.verify", 8000);
      const prompted = dialogs.slice(dialogsAt).filter((entry) => entry.type === "beforeunload");
      if (prompted.length === 0) dialogPlan.splice(dialogPlan.findIndex((plan) => plan.purpose?.startsWith(`${id}:`)), 1);
      pre(`${id}:real-navigation-left-the-document`, left);
      fact(`H9-${lang}:no-beforeunload-listener-and-no-real-prompt`, {
        hypothesis: "H9", claim: "No beforeunload listener is registered, the synthetic event is not prevented, and a real navigation away shows no prompt",
        observed: census === 0 && warn.warned === false && prompted.length === 0, evidence: { liveBeforeunloadListeners: census, warn, realPrompts: prompted },
      });
    }
    // (b) sign-out from /app/tasks through the real AvatarMenu and SignOutConfirmDialog
    {
      const id = `h9-${lang}-sign-out`;
      caseStart(id);
      await failedDrag(page, id, lang);
      await page.cdp("Fetch.enable", { patterns: [{ urlPattern: `${origin}/`, resourceType: "Document", requestStage: "Request" }] });
      await trustedClick(page, ".app-rail .rail-avatar", `${id}:rail-avatar`);
      pre(`${id}:avatar-menu-open`, await waitUntil(page, "!!document.querySelector('.avatar-menu')", 3000));
      const signOutLabel = facts0.labels.signOut[lang];
      await clickOne(page, `[...document.querySelectorAll('.avatar-menu .avm-item')].filter((element) => (element.getAttribute('aria-label') ?? element.textContent).replace(/\\s+/g, ' ').trim() === ${JSON.stringify(signOutLabel)})`, `${id}:avatar-sign-out`);
      pre(`${id}:sign-out-confirm-dialog-open`, await waitUntil(page, "!!document.querySelector('dialog.xai-sign-out-dialog')?.open", 3000));
      const mark = await evaluate(page, "__native.mark()");
      const dialogsAt = dialogs.length;
      const requestsAt = navigationRequests.length;
      dialogPlan.push({ accept: false, purpose: `${id}: Cancel at a rail sign-out step, if any` });
      await trustedClick(page, "dialog.xai-sign-out-dialog .xai-sign-out-dialog__btn--confirm", `${id}:sign-out-confirm`);
      const appeared = await waitFor(() => dialogs.length > dialogsAt, 1500);
      if (!appeared) dialogPlan.splice(dialogPlan.findIndex((plan) => plan.purpose?.startsWith(`${id}:`)), 1);
      await waitUntil(page, `verify.scopeAfter(${mark}).some((entry) => entry.kind === "locked" && entry.accountId === null)`, 4000);
      await waitFor(() => navigationRequests.length > requestsAt, 4000);
      await delay(800);
      const after = await evaluate(page, `({ scope: verify.scope(), scopeAfter: verify.scopeAfter(${mark}), auth: verify.authAfter(${mark}), confirm: __native.window(${mark}).confirm, path: location.pathname })`);
      await page.cdp("Fetch.disable");
      const confirms = dialogs.slice(dialogsAt);
      const requests = navigationRequests.slice(requestsAt);
      const invalidated = after.scopeAfter.some((entry) => entry.kind === "locked" && entry.accountId === null);
      record("observation", { id, confirms, confirmLog: after.confirm, scopeAfter: after.scopeAfter, auth: after.auth, navigationRequests: requests, documentStillAt: after.path });
      verdict(`H9-${lang}:sign-out-asks-the-rail-step`, {
        hypothesis: "H9", claim: "Sign-out from /app/tasks proceeds without a rail prompt",
        requirement: "A6 / §7 item 4: with a rail draft, one window.confirm with the §5 text; Cancel resolves false with identity intact",
        holds: confirms.length === 1 && confirms[0].type === "confirm" && confirms[0].message === RAIL_SIGN_OUT_TEXT[lang] && !invalidated,
        evidence: { confirms, expectedText: RAIL_SIGN_OUT_TEXT[lang], invalidated },
      });
      fact(`H9-${lang}:sign-out-proceeded-without-prompt`, {
        hypothesis: "H9", claim: "Zero window.confirm; identity invalidated, client.auth.signOut called once and a document request for \"/\" made",
        observed: confirms.length === 0 && after.confirm.length === 0 && invalidated && after.auth.filter((call) => call === "signOut").length === 1 && requests.length >= 1 && requests.every((entry) => entry.url === `${origin}/`),
        evidence: { confirms: confirms.length, invalidated, signOuts: after.auth.filter((call) => call === "signOut").length, requests: requests.map((entry) => entry.url) },
      });
      await screenshot(page, `${lang}-after-sign-out`, { state: "after the sign-out confirmation: the document request for \"/\" was answered 204 by the runner, so this document remains", lang });
    }
  }
}

// ---------------------------------------------------------------------------------------------------
// h11: positive control across two real documents (EN and ZH)
// ---------------------------------------------------------------------------------------------------
async function runH11() {
  const page = mainPage;
  for (const lang of ["en", "zh"]) {
    // (a) a second production App document commits through a trusted drag
    {
      const id = `h11-${lang}-app-document`;
      caseStart(id);
      const { S, D0 } = await freshReversed(page, id, lang);
      const instance = await evaluate(page, "verify.instance");
      const markA = await evaluate(page, "__native.mark()");
      await screenshot(page, `${lang}-a-before`, { state: "document A (idle, /app/tasks) before document B commits", lang });
      const { targetId } = await browser.send("Target.createTarget", { url: `${origin}/app/dashboard` });
      const second = await attachPage(targetId, "B", { width: 1280, height: 900 });
      try {
        await second.cdp("Page.bringToFront");
        pre(`${id}:document-b-production-app-mounted`, await waitUntil(second, READY_APP, 20000));
        await delay(700);
        const bRail = await evaluate(second, "__native.railNames()");
        pre(`${id}:document-b-displays-the-same-committed-order`, isDeepStrictEqual(bRail, idsToLabels(lang, D0)), { bRail });
        const gesture = await dragGesture(second, `${id}:b-drag`, { source: bRail[0], targets: [bRail[2]], end: "drop" });
        const P = reorder(D0, D0[0], D0[2]);
        pre(`${id}:document-b-committed-the-order`, (await evaluate(second, `__native.native.get(${JSON.stringify(RAIL_KEY)})`)) === JSON.stringify(P), { sets: gesture.sets });
        await collectDocument(second, "close-b");
      } finally {
        await browser.send("Target.closeTarget", { targetId }).catch(() => {});
        browser.pages.delete(second.sessionId);
      }
      await page.cdp("Page.bringToFront");
      const P = reorder(D0, D0[0], D0[2]);
      const followed = await waitUntil(page, `JSON.stringify(__native.railNames()) === ${JSON.stringify(JSON.stringify(idsToLabels(lang, P)))}`, 6000);
      const view = await evaluate(page, `({ rail: __native.railNames(), instance: verify.instance, window: __native.window(${markA}) })`);
      const received = view.window.storageReceived.filter((entry) => entry.key === RAIL_KEY);
      const aMutations = view.window.attempts.filter((entry) => entry.key === RAIL_KEY && entry.op !== "get");
      await screenshot(page, `${lang}-a-after-b-commits`, { state: "document A after document B committed a new order through a trusted drag (no reload of A)", lang });
      verdict(`H11-${lang}:idle-document-follows-a-commit-from-a-second-app-document`, {
        hypothesis: "H11 (positive control)", claim: "A committed order in a second document updates an idle first document's rail live",
        requirement: "§3 item 8 / §10 item 5: an idle second document follows a committed order live",
        holds: followed && isDeepStrictEqual(view.rail, idsToLabels(lang, P)) && view.instance === instance && received.length >= 1 && received.every((entry) => entry.trusted) && aMutations.length === 0,
        evidence: { rail: labelsToIds(lang, view.rail), expected: P, sameDocument: view.instance === instance, storageEventsReceived: received.length, documentAMutations: aMutations.length, before: S },
      });
    }
    // (b) a product-free second document writes a valid order
    {
      const id = `h11-${lang}-product-free-document`;
      caseStart(id);
      const { D0 } = await freshReversed(page, id, lang);
      const instance = await evaluate(page, "verify.instance");
      const markA = await evaluate(page, "__native.mark()");
      const written = [...D0].reverse();
      const { targetId } = await browser.send("Target.createTarget", { url: `${origin}/external` });
      const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
      try {
        let loaded = false;
        for (let attempt = 0; attempt < 150 && !loaded; attempt += 1) {
          const probe = await browser.send("Runtime.evaluate", { expression: "document.readyState === 'complete' && location.pathname === '/external' && !window.verify && !window.__native", returnByValue: true }, sessionId).catch(() => null);
          loaded = probe?.result?.value === true;
          if (!loaded) await delay(30);
        }
        pre(`${id}:independent-same-origin-document-without-product-or-instruments`, loaded);
        const result = await browser.send("Runtime.evaluate", { expression: `localStorage.setItem(${JSON.stringify(RAIL_KEY)}, ${JSON.stringify(JSON.stringify(written))}); localStorage.getItem(${JSON.stringify(RAIL_KEY)})`, returnByValue: true }, sessionId);
        pre(`${id}:second-document-wrote-a-valid-order`, result.result?.value === JSON.stringify(written));
      } finally {
        await browser.send("Target.closeTarget", { targetId }).catch(() => {});
      }
      await page.cdp("Page.bringToFront");
      const followed = await waitUntil(page, `JSON.stringify(__native.railNames()) === ${JSON.stringify(JSON.stringify(idsToLabels(lang, written)))}`, 6000);
      const view = await evaluate(page, `({ rail: __native.railNames(), instance: verify.instance, window: __native.window(${markA}) })`);
      const aMutations = view.window.attempts.filter((entry) => entry.key === RAIL_KEY && entry.op !== "get");
      verdict(`H11-${lang}:idle-document-follows-a-write-from-a-product-free-document`, {
        hypothesis: "H11 (positive control)", claim: "A valid order written by another document updates an idle first document's rail live",
        requirement: "§3 item 8: legacy usePref follows storage events",
        holds: followed && view.instance === instance && aMutations.length === 0, evidence: { rail: labelsToIds(lang, view.rail), expected: written, sameDocument: view.instance === instance, documentAMutations: aMutations.length },
      });
    }
  }
}
