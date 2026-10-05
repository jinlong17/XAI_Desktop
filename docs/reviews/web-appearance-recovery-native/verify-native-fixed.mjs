/**
 * CP-APPEARANCE-01 batch 43 (contract r3 §14 E9, E10, E11): the FIXED Settings Appearance caller in real headless
 * Chrome, in the production App composition: native controls, Reset to defaults and on-disk export. Parent-role
 * native verifier. Verification only: it repairs nothing, implements nothing, accepts nothing and changes no
 * product file, contract, ledger, control plane or existing evidence (the before-stage files in this directory are
 * read, never modified).
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-appearance-recovery-native/verify-native-fixed.mjs <fixed revision> <controls|reset|export> <suffix>
 *
 * Modes (all in the production App composition, ./native-fixed-app.tsx):
 *   controls (E9): all 40 values of contract §10 item 1 (33 pane values, 7 Topbar values) by trusted CDP input with
 *            exact bytes (page and DevTools), one write each and the real per-key device lock; per-frame pane/Topbar
 *            sameness for language, theme and density; a new-document reload and a graceful browser restart with
 *            zero mount writes where the pane, the Topbar and <html> agree on the stored values (controller ruling
 *            3), plus seeded fresh documents in EN and ZH; a source-only state for each key (invalid and unreadable
 *            bytes: default shown and applied, no throw, Reload only, bytes never rewritten) and a valid edit over a
 *            malformed source; a natively held per-key Web Lock (pending, one write after release) for a root and a
 *            registered key; readback uncertainty (Retry reconciles with exactly one total write) for a root and a
 *            registered key; second-document conflicts (restoration of the baseline bytes, removal, replacement)
 *            whose external bytes are preserved.
 *   reset    (E10): declined confirmation (zero attempts from activation to return); accepted (six verified
 *            absences, language bytes unchanged, never a write; in ZH with one key already absent = verified no-op);
 *            one-key and two-key removeItem faults with per-field results and targeted Retry; readback uncertainty
 *            (exactly one remove); a second-document conflict (external bytes preserved); truthful "Defaults
 *            restored." (per rendered frame); an unrelated-key snapshot; zero StorageEvent/bus broadcasts, no relock,
 *            no host remount.
 *   export   (E11): the eight contract §8 disk shapes of appearance-draft.json, each under total Storage denial
 *            (attempt-level counters zero, one object URL created and the same revoked, the anchor's download
 *            attribute, one click, the anchor removed, the actual Chrome download parsed from disk and deep-equal to
 *            the whole envelope; afterwards the unload warning, the pane status line and, for settled failures, the
 *            Topbar status), plus native setup failures (anchor click and createObjectURL throwing) with the
 *            localized error, and a recovered export.
 *
 * - Product: an immutable `git archive <revision>`; ./native-fixed-app.tsx is bundled with esbuild from stdin with
 *   resolveDir = that archive. Every `@repo/*` specifier is pinned to the archive's own package export; a guard
 *   plugin fails the build if any module is loaded from the packages/, apps/ or docs/ tree of the dependency
 *   checkout or of this runner's checkout. Third-party modules come from XAI_DEPS_ROOT only when its
 *   pnpm-lock.yaml SHA-256 equals the archive's and the contract gate (consistency gate; read-only use).
 * - Page: ./native-fixed-prelude.js (classic script, instruments) then the bundle, served from 127.0.0.1 only by
 *   this runner's own server; every other host resolves to NOTFOUND; isolated headless Chrome profile and download
 *   directory; CDP trusted mouse and keyboard input after a centre hit-test; the real window.confirm answered
 *   through Page.handleJavaScriptDialog; a second document is an independent same-origin tab without product code.
 * - DevTools transport: the pipe (--remote-debugging-pipe) with flattened target sessions, never a WebSocket (see
 *   launch()). Every evaluation and input is bounded and a hang is diagnosed with a paused JavaScript stack; key
 *   presses carry no nativeVirtualKeyCode (see press()), and the keyboard trace of every document must contain only
 *   the runner's own key presses (run-level precondition).
 * - Log: JSON lines `native-<sha7>-<suffix>-<mode>.log` (and, for export, the disk JSON artifacts) in this
 *   directory; existing evidence is never overwritten. Exit 0 = harness valid and every check PASS; 2 = harness
 *   valid and a product check FAILED (the run stops at the first one); 1 = harness invalid (a precondition).
 *   Development probes may redirect evidence with XAI_NATIVE_EVIDENCE_DIR (refused inside the repository).
 */
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BEFORE_REVISION = "5cd63ff652f02a2c726187fe12cbc796218d31c0";
const LOCKFILE_GATE_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const CONTRACT_PATH = "docs/reviews/web-appearance-recovery-contract/contract.md";
const CONTRACT_SHA256 = "ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const evidenceDir = process.env.XAI_NATIVE_EVIDENCE_DIR ?? output;
if (process.env.XAI_NATIVE_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(root))) throw Error("Development probes must write outside the repository");
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const [requested, mode, suffix] = process.argv.slice(2);
const MODES = ["controls", "reset", "export"];
if (!requested) throw Error("Fixed revision required");
if (!MODES.includes(mode)) throw Error(`Unsupported mode ${mode}; use ${MODES.join("|")}`);
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A diagnostic suffix ([a-z0-9-]) is required");
const resolved = execFileSync("git", ["rev-parse", "--verify", `${requested}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const resolvedTree = execFileSync("git", ["rev-parse", `${resolved}^{tree}`], { cwd: root, encoding: "utf8" }).trim();
const short = resolved.slice(0, 7);
const evidencePath = join(evidenceDir, `native-${short}-${suffix}-${mode}.log`);
if (existsSync(evidencePath)) throw Error("Evidence exists; use a distinct suffix");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const records = [];
const runtimeErrors = [];
const consoleWarnings = [];
const dialogs = [];
const dialogPlan = [];
const artifacts = [];
const networkSeen = { documents: 0, attempts: 0, nonLocal: 0, samples: [] };
const sessionsLaunched = [];
let lastCheckId = null;
const record = (name, value = {}) => {
  records.push({ name, ...value });
  if (process.env.VERBOSE) console.log(name, JSON.stringify(value).slice(0, 300));
};
let checks = 0;
let productChecks = 0;
const verify = (id, condition, details, kind) => {
  checks += 1;
  if (kind === "product") productChecks += 1;
  lastCheckId = id;
  const pass = Boolean(condition);
  record("check", { id, kind, pass, ...details });
  if (!pass) throw Object.assign(new Error(`${kind === "precondition" ? "PRECONDITION: " : "PRODUCT CHECK FAILED: "}${id}`), { checkId: id, checkKind: kind });
};
const pre = (id, condition, details = {}) => verify(id, condition, details, "precondition");
const check = (id, condition, details = {}) => verify(id, condition, details, "product");

// ---------------------------------------------------------------------------------------------------
// Consistency gate and provenance inputs
// ---------------------------------------------------------------------------------------------------
const runnerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
const FIXTURE = "native-fixed-app.tsx";
const fixtureSource = readFileSync(join(output, FIXTURE), "utf8");
const preludeSource = readFileSync(join(output, "native-fixed-prelude.js"), "utf8");
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
const fixedDelta = execFileSync("git", ["diff", "--name-only", BEFORE_REVISION, resolved, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
const contractSha256 = sha256(execFileSync("git", ["show", `HEAD:${CONTRACT_PATH}`], { cwd: root, maxBuffer: 20 * 1024 * 1024 }));
const versionOf = (name) => {
  try { return JSON.parse(readFileSync(join(dependencyRoot, "apps/web/node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
};
/** The 24 product files of the Terra implementation (contract r3 §11; control plane E6 row). */
const EXPECTED_FIXED_DELTA = [
  "apps/web/src/App.tsx",
  "apps/web/src/__tests__/App.appearance.test.tsx",
  "packages/xai-web-settings-appearance/docs/api.md",
  "packages/xai-web-settings-appearance/docs/test.md",
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearanceController.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.bilingual.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.live-binding.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.rendering.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearancePane.save-reset.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/AppearanceRetryAll.test.tsx",
  "packages/xai-web-settings-appearance/src/__tests__/appearanceLockFixture.ts",
  "packages/xai-web-settings-appearance/src/index.ts",
  "packages/xai-web-settings-appearance/src/internal/AppearanceActions.tsx",
  "packages/xai-web-settings-appearance/src/internal/AppearanceStatus.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearanceController.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearanceRecoveryCopy.ts",
  "packages/xai-web-settings-appearance/src/styles.css",
  "packages/xai-web-settings-appearance/src/types.ts",
  "packages/xai-web-shell/docs/api.md",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/Topbar.tsx",
  "packages/xai-web-shell/src/__tests__/Topbar.test.tsx",
  "packages/xai-web-shell/src/types.ts",
];
/** Contract r3 header source table (at 5cd63ff). Unit files Terra changed must differ; every other row must be equal. */
const CONTRACT_SOURCE_HASHES = {
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx": "552eb224c5103d1c0d0ee878420f8a586ee91575dd8461f908de1147cf2b08c3",
  "packages/xai-web-settings-appearance/src/internal/appearancePane.tsx": "34b938200d1a43a9e73b1e5e6397ed7014ca763abb5082040d72cd309f43309c",
  "packages/xai-web-settings-appearance/src/types.ts": "18d5894e6603427f933100f9030d6e403c03abc57d9bd561f372b0b4f559f6d6",
  "packages/xai-web-settings-appearance/src/index.ts": "10bfbed11749e9c65fc3c2d40d0a50e177154254ef83a2e0690c693aeb4dc776",
  "packages/xai-web-settings-appearance/src/styles.css": "1b17d1f442905e255eae53e4e16a01c02b4a912ed6a1482231e8db5e50d5927c",
  "apps/web/src/App.tsx": "5d10dba6a879cf0d42f224e58ef70637bd82b71dc1318ee99c4567977638fb59",
  "packages/xai-web-shell/src/Topbar.tsx": "70ba299e4d8a088ba0d085272fbc4cfe95933265bd6066fb59ae5cdae3de5297",
  "packages/xai-web-shell/src/Shell.tsx": "7d46423f40adc5412f54b701c2c93ab4f7529e329dc22766f387d78f614f8df0",
  "packages/xai-web-shell/src/types.ts": "92b68b2ba5da830bd8dcdfe33652b2b440eaef72b8665ccd868d5f49d82b73de",
  "apps/web/src/routes/modules/departureCoordinator.tsx": "0844a697b146b07fceb1835da7c4410db8812bc07bdea362f3386e991a2bc075",
  "packages/plugin-web-settings-shell/src/SettingsFooter.tsx": "afecc734e7a96a8f7d289de2c3f6def5a1391c72e59f2fa61700f67a691c76ce",
  "packages/plugin-web-settings-shell/src/types.ts": "513f90fd05ef66f6f8fb1aaa230e9a6844407ae44cf3d7a1d8508c4eabfb4522",
  "packages/plugin-web-settings-shell/src/styles.css": "e5369cc7ed3a20650465e001537c7714a3715834d678ea17ff3960fbd3992166",
  "packages/xai-web-pet/src/DesktopPet.tsx": "35edb0e686bf6682192ba1bbe7842d159e161a6593b7ccd13a432d59fe58ad6f",
  "packages/xai-web-pet/src/pet.css": "6326d822b654a22bcad361e57d02413d4569eadf8058f89d90fc3dd43249dcfe",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts": "541fae97413104b8db90c20d7b565a5492f17fc74d79b3e975f954d7189a4491",
  "packages/plugin-web-tokens/src/tokens.css": "7c6eddebd1d826f939862ef75ba8159e966f0c76b0b9d34a0911f6b47265615d",
  "packages/plugin-web-countdown/src/internal/CountdownEditDialog.tsx": "6bcf6295989381101f99a53c1624db8f491c845c1d6debc6e550d7e04a1afdae",
  "packages/plugin-web-ai-chat/src/ErrorBanner.tsx": "7cf751dd321f3cdd490984d62ce49c563a3d1aaecf0b229d8fa203e39bb1fbc2",
};
const UNIT_CHANGED = ["packages/xai-web-settings-appearance/src/AppearancePane.tsx", "packages/xai-web-settings-appearance/src/types.ts", "packages/xai-web-settings-appearance/src/index.ts",
  "packages/xai-web-settings-appearance/src/styles.css", "apps/web/src/App.tsx", "packages/xai-web-shell/src/Topbar.tsx", "packages/xai-web-shell/src/Shell.tsx", "packages/xai-web-shell/src/types.ts"];
/** Reader, writer and host modules that must be bundled from the archive (contract §2, §9 "Composition"). */
const REQUIRED_MODULES = [
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/RouteGateElements.tsx",
  "apps/web/src/routes/RouteErrorBoundary.tsx",
  "apps/web/src/pages/NotFoundPage.tsx",
  "apps/web/src/providers/AppProviders.tsx",
  "apps/web/src/providers/AccountStorageGate.tsx",
  "apps/web/src/observability/runtime.ts",
  "apps/web/src/service-worker/register.ts",
  "apps/web/src/routes/modules/shellRegistrations.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/settingsDeparture.ts",
  "apps/web/src/routes/modules/settingsPaneComposition.ts",
  "packages/xai-web-settings-appearance/src/index.ts",
  "packages/xai-web-settings-appearance/src/AppearancePane.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearancePane.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearanceController.tsx",
  "packages/xai-web-settings-appearance/src/internal/AppearanceActions.tsx",
  "packages/xai-web-settings-appearance/src/internal/AppearanceStatus.tsx",
  "packages/xai-web-settings-appearance/src/internal/appearanceRecoveryCopy.ts",
  "packages/xai-web-settings-appearance/src/constants.ts",
  "packages/xai-web-settings-appearance/src/appearanceDefaults.ts",
  "packages/xai-web-settings-appearance/src/styles.css",
  "packages/plugin-web-settings-shell/src/SettingRow.tsx",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/Topbar.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/registry.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/xai-web-event-bus/src/emitter.ts",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/codec.ts",
  "packages/plugin-web-storage/src/internal/registry.ts",
  "packages/plugin-web-storage/src/internal/sameTabBus.ts",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/accountOwnership.ts",
  "packages/plugin-web-storage/src/internal/accountCoordination.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts",
  "packages/plugin-web-tokens/src/apply.ts",
  "packages/plugin-web-tokens/src/i18n.ts",
  "packages/plugin-web-tokens/src/tokens.css",
  "packages/plugin-web-tokens/src/layout.css",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/guards.tsx",
];

const directory = realpathSync(mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-appearance-native-fixed-")));
const snapshot = join(directory, "source");
const profile = join(directory, "profile");
const downloads = join(directory, "downloads");
let server = null;
let session = null;
let origin = "";
const served = {};
let moduleIndex = [];

// ---------------------------------------------------------------------------------------------------
// Browser session over the DevTools PIPE transport (--remote-debugging-pipe: NUL-delimited JSON on fds 3/4,
// flattened target sessions). Development probes showed Node's built-in WebSocket client to the DevTools
// port dropping the connection with code 1006 while the browser stayed alive (permessage-deflate is negotiated
// there); the pipe transport has no WebSocket at all. Otherwise the pattern of
// ../web-features-recovery-native/verify-native-fixed.mjs is kept.
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
  const state = { proc, exited, pending, navigating: false, crashed: null, onPaused: null, pid: proc.pid, transport: "pipe", open: true, sessionId: null };
  sessionsLaunched.push(state);
  const handle = (message) => {
    // Events of other targets (the second document) are ignored here; commands are matched by id.
    if (message.method && message.sessionId && message.sessionId !== state.sessionId) return;
    if (message.method === "Inspector.targetCrashed") {
      state.crashed = { afterCheck: lastCheckId };
      runtimeErrors.push({ kind: "renderer-crash", afterCheck: lastCheckId, text: "Inspector.targetCrashed" });
    } else if (message.method === "Debugger.paused") {
      if (state.onPaused) state.onPaused(message.params);
    } else if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails ?? {};
      runtimeErrors.push({ kind: "exception", afterCheck: lastCheckId, text: String(details.exception?.description ?? details.text ?? "").slice(0, 600), source: frameSource(details.stackTrace?.callFrames?.[0] ?? { url: details.url, lineNumber: details.lineNumber, columnNumber: details.columnNumber }) });
    } else if (message.method === "Runtime.consoleAPICalled") {
      const text = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ").slice(0, 600);
      const source = frameSource(message.params.stackTrace?.callFrames?.[0]);
      if (message.params.type === "error" || message.params.type === "assert") runtimeErrors.push({ kind: `console.${message.params.type}`, afterCheck: lastCheckId, text, source });
      else if (message.params.type === "warning") consoleWarnings.push({ text: text.slice(0, 300), source, afterCheck: lastCheckId });
    } else if (message.method === "Page.javascriptDialogOpening") {
      if (message.params.type === "beforeunload" && state.navigating) {
        // A real beforeunload prompt on a runner-initiated navigation away from a page with drafts: expected; accepted.
        dialogs.push({ type: "beforeunload", message: message.params.message, expected: true, accepted: true, reason: "runner-initiated navigation away from a document with Appearance drafts", afterCheck: lastCheckId });
        state.cdp("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
      } else {
        const plan = dialogPlan.shift() ?? null;
        const accept = plan ? plan.accept : message.params.type === "beforeunload";
        dialogs.push({ type: message.params.type, message: message.params.message, expected: Boolean(plan), accepted: accept, afterCheck: lastCheckId });
        state.cdp("Page.handleJavaScriptDialog", { accept }).catch(() => {});
      }
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
  // NUL-delimited JSON messages from fd 4; bytes are decoded as UTF-8 only once a whole message has arrived.
  let chunks = [];
  reader.on("data", (chunk) => {
    let start = 0;
    for (let index = chunk.indexOf(0); index !== -1; index = chunk.indexOf(0, start)) {
      chunks.push(chunk.subarray(start, index));
      const text = Buffer.concat(chunks).toString("utf8");
      chunks = [];
      start = index + 1;
      let message;
      try { message = JSON.parse(text); } catch (error) { record("devtools-message-unparsed", { afterCheck: lastCheckId, bytes: text.length, head: text.slice(0, 200) }); continue; }
      try { handle(message); } catch (error) { record("devtools-event-handler-error", { afterCheck: lastCheckId, error: String(error).slice(0, 300) }); }
      settle(message);
    }
    if (start < chunk.length) chunks.push(chunk.subarray(start));
  });
  proc.once("exit", (code, signal) => { state.processExit = { code, signal, afterCheck: lastCheckId, at: new Date().toISOString() }; });
  const closed = (why) => {
    if (!state.open) return;
    state.open = false;
    // Diagnose a dropped DevTools connection: why it closed and whether the browser process exited.
    state.socketClose = { why, afterCheck: lastCheckId, at: new Date().toISOString(), processExit: state.processExit ?? null, pending: pending.size };
    if (session === state) record("devtools-connection-closed", state.socketClose);
    for (const job of pending.values()) job.reject(Error(`DevTools pipe closed (${why})`));
    pending.clear();
  };
  reader.on("close", () => closed("read end closed"));
  reader.on("error", (error) => closed(`read error: ${String(error)}`));
  writer.on("error", (error) => closed(`write error: ${String(error)}`));
  /** A browser-level command (no session) or a command for a flattened target session. */
  state.send = (method, params = {}, sessionId = undefined) => new Promise((resolve, reject) => {
    if (!state.open) { reject(Error("DevTools pipe not open")); return; }
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    writer.write(`${JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params })}\0`);
  });
  // Attach to the initial page target with a flattened session.
  let page = null;
  for (let attempt = 0; attempt < 200 && !page; attempt += 1) {
    const { targetInfos } = await Promise.race([state.send("Target.getTargets"), delay(5000).then(() => ({ targetInfos: [] }))]);
    page = targetInfos.find((target) => target.type === "page") ?? null;
    if (!page) await delay(50);
  }
  if (!page) throw Error("PRECONDITION: no page target over the DevTools pipe");
  const { sessionId } = await state.send("Target.attachToTarget", { targetId: page.targetId, flatten: true });
  state.sessionId = sessionId;
  state.targetId = page.targetId;
  state.cdp = (method, params = {}) => state.send(method, params, sessionId);
  return state;
}
const cdp = (method, params) => {
  if (!session) throw Error("No browser session");
  return session.cdp(method, params);
};
/**
 * Every page evaluation is bounded. A page whose main thread does not answer within EVALUATE_TIMEOUT_MS is a stop:
 * the runner pauses the renderer through the DevTools debugger, records the JavaScript stack it was running (mapped
 * to bundle modules) and fails the run, so that a hang is diagnosable instead of silent.
 */
const EVALUATE_TIMEOUT_MS = 20000;
async function pausedStack() {
  if (!session) return null;
  const current = session;
  try {
    const paused = new Promise((resolve) => { current.onPaused = resolve; });
    await Promise.race([current.cdp("Debugger.enable"), delay(5000)]);
    await Promise.race([current.cdp("Debugger.pause"), delay(5000)]);
    const params = await Promise.race([paused, delay(8000).then(() => null)]);
    current.onPaused = null;
    if (!params) return { paused: false };
    const frames = (params.callFrames ?? []).slice(0, 25).map((frame) => ({ functionName: frame.functionName, line: frame.location.lineNumber, column: frame.location.columnNumber, url: frame.url,
      module: moduleAt(frame.url || `${origin}/__native/bundle.js`, frame.location.lineNumber) }));
    await Promise.race([current.cdp("Debugger.resume"), delay(3000)]);
    return { paused: true, reason: params.reason, frames };
  } catch (error) {
    return { paused: false, error: String(error) };
  }
}
/** Trusted CDP input, bounded like evaluations (an unanswered input event is diagnosed the same way). */
async function input(method, params) {
  if (session?.crashed) throw Object.assign(Error("PRECONDITION: renderer crashed (Inspector.targetCrashed)"), { checkId: "harness:renderer-crash", checkKind: "precondition" });
  const result = await Promise.race([cdp(method, params), delay(EVALUATE_TIMEOUT_MS).then(() => ({ timedOut: true }))]);
  if (result?.timedOut) {
    const stack = await pausedStack();
    record("hang-diagnosis", { afterCheck: lastCheckId, input: { method, params }, stack, crashed: session?.crashed ?? null });
    throw Object.assign(Error(`PRECONDITION: input ${method} ${params.type} was not acknowledged within ${EVALUATE_TIMEOUT_MS} ms (see hang-diagnosis)`), { checkId: "harness:input-timeout", checkKind: "precondition" });
  }
  return result;
}
const evaluate = async (expression) => {
  if (session?.crashed) throw Object.assign(Error("PRECONDITION: renderer crashed (Inspector.targetCrashed)"), { checkId: "harness:renderer-crash", checkKind: "precondition" });
  const result = await Promise.race([
    cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }),
    delay(EVALUATE_TIMEOUT_MS).then(() => ({ timedOut: true })),
  ]);
  if (result.timedOut) {
    const stack = await pausedStack();
    record("hang-diagnosis", { afterCheck: lastCheckId, expression: expression.slice(0, 300), stack, crashed: session?.crashed ?? null });
    throw Object.assign(Error(`PRECONDITION: page evaluation did not answer within ${EVALUATE_TIMEOUT_MS} ms (see hang-diagnosis)`), { checkId: "harness:page-evaluation-timeout", checkKind: "precondition" });
  }
  if (result.exceptionDetails) throw Error(`Page evaluation failed: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`);
  return result.result.value;
};
const waitUntil = async (expression, timeout = 6000) => {
  const deadline = Date.now() + timeout;
  for (;;) {
    try {
      if (await evaluate(expression)) return true;
    } catch (error) {
      // A bounded evaluation that timed out, or a crashed renderer, is never retried silently.
      if (error?.checkKind === "precondition") throw error;
      /* otherwise: the context is not ready yet */
    }
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
async function openSession() {
  session = await launch();
  await cdp("Inspector.enable");
  await cdp("Runtime.enable");
  await cdp("Page.enable");
  await cdp("DOMStorage.enable");
  await cdp("DOM.enable");
  if (mode === "export") await session.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
  await cdp("Page.bringToFront");
  await cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  await cdp("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
}
async function closeSession() {
  const current = session;
  if (!current) return { graceful: true };
  await collectNetwork();
  session = null;
  current.send("Browser.close").catch(() => { /* the pipe closes with the browser */ });
  const graceful = await Promise.race([current.exited.then(() => true), delay(8000).then(() => false)]);
  if (!graceful) {
    current.proc.kill("SIGTERM");
    await Promise.race([current.exited, delay(3000)]);
    if (current.proc.exitCode === null && current.proc.signalCode === null) current.proc.kill("SIGKILL");
  }
  current.open = false;
  return { graceful };
}
/**
 * Network attempts of the current document (accumulated before every navigation away). The instrument self-test's
 * own deliberately refused probe (seed page, no product code) is counted separately and is not a page attempt.
 */
const SELF_TEST_PROBE = "http://example.invalid/selftest";
/** Keyboard trace audit: every keydown a document received must be one of the runner's own key presses. */
const keyboardAudit = { documents: 0, runnerPresses: 0, keydowns: 0, mismatches: [] };
let pressesThisDocument = 0;
async function collectNetwork() {
  try {
    const keydowns = await evaluate("window.__native ? __native.events.filter((entry) => entry.type === 'keydown').length : 0");
    keyboardAudit.documents += 1;
    keyboardAudit.runnerPresses += pressesThisDocument;
    keyboardAudit.keydowns += keydowns;
    if (keydowns !== pressesThisDocument) keyboardAudit.mismatches.push({ afterCheck: lastCheckId, keydowns, runnerPresses: pressesThisDocument });
  } catch { /* no document yet */ }
  pressesThisDocument = 0;
  try {
    const list = await evaluate("window.__native ? __native.network : []");
    const page = list.filter((entry) => entry.url !== SELF_TEST_PROBE);
    networkSeen.documents += 1;
    networkSeen.attempts += page.length;
    networkSeen.selfTestProbes = (networkSeen.selfTestProbes ?? 0) + (list.length - page.length);
    const nonLocal = page.filter((entry) => !entry.local);
    networkSeen.nonLocal += nonLocal.length;
    networkSeen.samples.push(...nonLocal.slice(0, 3));
  } catch { /* no document yet */ }
}
async function navigateTo(url) {
  await collectNetwork();
  session.navigating = true;
  try {
    await cdp("Page.navigate", { url });
  } finally {
    const current = session;
    setTimeout(() => { if (current) current.navigating = false; }, 2500);
  }
}

// ---------------------------------------------------------------------------------------------------
// Surface constants (contract §2, §5 normative wording, §6, §8)
// ---------------------------------------------------------------------------------------------------
const OWNER = "appearance-native-A";
const MARKER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:committed-generation`;
const MARKER = JSON.stringify({ generation: "g1", migrationId: "appearance-native", previous: null });
const FIELDS = ["lang", "theme", "density", "accentHue", "bgTone", "railPos", "fontScale"];
const KEY = { lang: "xai_pref_lang", theme: "xai_pref_theme", density: "xai_pref_density", fontScale: "xai_pref_font_scale", accentHue: "xai_accent_hue", railPos: "xai_rail_pos", bgTone: "xai_bg_tone" };
const SEVEN = FIELDS.map((field) => KEY[field]);
const isSeven = (key) => SEVEN.includes(key);
const RESET_FIELDS = ["theme", "density", "accentHue", "bgTone", "railPos", "fontScale"];
const SIX = RESET_FIELDS.map((field) => KEY[field]);
const LOCK_OF = (field) => `xai:pref:v1:${encodeURIComponent(KEY[field])}`;
const ENC = { lang: (value) => JSON.stringify(value), theme: (value) => JSON.stringify(value), density: (value) => JSON.stringify(value), fontScale: (value) => JSON.stringify(value), accentHue: (value) => String(value), railPos: (value) => String(value), bgTone: (value) => String(value) };
const DEFAULTS = { lang: "en", theme: "light", density: "comfortable", accentHue: 165, bgTone: "default", railPos: "left", fontScale: 1 };
const TONE_HUE = { default: 165, cream: 55, mist: 230, lavender: 295, peach: 35, graphite: 220 };
/** Contract §5 normative wording (the oracle; never taken from the product). */
const COPY = {
  en: {
    label: { lang: "Language", theme: "Theme", density: "Density", accentHue: "Accent color", bgTone: "Background palette", railPos: "Sidebar position", fontScale: "Font scale" },
    saving: (label) => `${label} is saving.`,
    resetting: (label) => `${label} is being reset to its default.`,
    "not-saved": (label) => `${label} was not saved.`,
    "not-reset": (label) => `${label} was not reset to its default.`,
    unavailable: (label) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
    retryName: (label) => `Retry ${label}`, discardName: (label) => `Discard ${label}`, reloadName: (label) => `Reload ${label}`,
    reset: "Reset to defaults", exportDraft: "Export Appearance draft", discardAll: "Discard all changes", retryAll: "Retry all",
    saved: "Appearance settings saved.", restored: "Defaults restored.", exportFailed: "Export failed. Please retry.", retrying: "Retrying unsaved appearance changes…",
    count: (n) => (n === 1 ? "1 appearance change is not saved." : `${n} appearance changes are not saved.`),
    confirmReset: "Reset theme, density, font scale, accent color, background palette and sidebar position to their defaults? Language is kept.",
    statusName: "Appearance changes not saved. Review them in Settings.", statusText: "Not saved",
  },
  zh: {
    label: { lang: "语言", theme: "主题", density: "密度", accentHue: "主题色", bgTone: "背景调子", railPos: "侧栏位置", fontScale: "字体大小" },
    saving: (label) => `${label}正在保存。`,
    resetting: (label) => `${label}正在恢复默认。`,
    "not-saved": (label) => `${label}未保存。`,
    "not-reset": (label) => `${label}未恢复默认。`,
    unavailable: (label) => `已保存的${label}不可用。请重新读取；这不是新的未保存更改。`,
    retryName: (label) => `重试 ${label}`, discardName: (label) => `放弃 ${label}`, reloadName: (label) => `重新读取 ${label}`,
    reset: "恢复默认", exportDraft: "导出外观草稿", discardAll: "放弃全部更改", retryAll: "全部重试",
    saved: "外观设置已保存。", restored: "已恢复默认设置。", exportFailed: "导出失败，请重试。", retrying: "正在重试未保存的外观更改…",
    count: (n) => `${n} 项外观更改未保存。`,
    confirmReset: "将主题、密度、字体大小、主题色、背景调子和侧栏位置恢复为默认值？语言保持不变。",
    statusName: "外观更改未保存，前往设置查看。", statusText: "未保存",
  },
};
const OLD_NAMES = ["Save & apply", "保存生效", "Saved", "已保存"];
/** One expected recovery block (contract §5: message, role, per-field action names). */
const block = (lang, field, state) => {
  const copy = COPY[lang];
  const label = copy.label[field];
  return {
    id: field,
    text: copy[state](label),
    role: state === "saving" || state === "resetting" ? "status" : "alert",
    buttons: state === "unavailable" ? [copy.reloadName(label)] : [copy.retryName(label), copy.discardName(label)],
  };
};
/** Expected blocks in the pane's display order from a { field: state } map. */
const blocks = (lang, states) => FIELDS.filter((field) => states[field]).map((field) => block(lang, field, states[field]));
const PANE = '.settings-detail[data-pane="appearance"] .appearance-pane';
const READY_APP = "(!!window.verify && !!window.__native && !!document.querySelector('.app header.topbar') && !document.querySelector('.account-data-gate') && verify.scope().kind === 'account')";
const READY_PANE = `(${READY_APP} && !!document.querySelector('${PANE} [data-testid="appearance-retry-all"]'))`;
const CRASHED = "(!!window.__native && !!__native.routeError())";
let labels = null;
const TOPBAR_SHORT = { en: "EN", zh: "中文" };
const TOPBAR_LANG = { en: "English", zh: "中文" };
const resolveTheme = (theme, prefersDark) => (theme === "system" ? (prefersDark ? "dark" : "light") : theme);
const summaryFor = (values) => `${TOPBAR_SHORT[values.lang]} · ${labels[values.lang][values.theme]} · ${labels[values.lang][values.density]}`;
const checkedFor = (values) => [TOPBAR_LANG[values.lang], labels[values.lang][values.theme], labels[values.lang][values.density]];
function htmlFor(values, prefersDark) {
  return { theme: resolveTheme(values.theme, prefersDark), density: values.density, fontSize: `${values.fontScale * 16}px`, accentHue: String(values.accentHue), bgTone: values.bgTone === "default" ? null : values.bgTone, railPos: values.railPos, appRailPos: values.railPos };
}
const htmlMatches = (html, values) => Object.entries(htmlFor(values, html.prefersDark)).every(([name, value]) => html[name] === value);
const paneMatches = (pane, values) => Boolean(pane) && pane.lang === values.lang && pane.theme === values.theme && pane.density === values.density
  && pane.accentHue === values.accentHue && pane.bgTone === values.bgTone && pane.railPos === values.railPos && pane.fontScale === values.fontScale
  && pane.accentReadout === `${Math.round(values.accentHue)}°` && pane.fontReadout === `${Math.round(values.fontScale * 100)}%`;
/** Expected raw bytes of the seven keys from a stored-values map (undefined = absent). */
const rawOf = (stored) => Object.fromEntries(FIELDS.map((field) => [KEY[field], stored[field] === undefined ? null : ENC[field](stored[field])]));
/** Display values (defaults for absent fields). */
const shownOf = (stored) => Object.fromEntries(FIELDS.map((field) => [field, stored[field] === undefined ? DEFAULTS[field] : stored[field]]));
const seedsOf = (stored, extra = {}) => ({ [MARKER_KEY]: MARKER, ...Object.fromEntries(FIELDS.filter((field) => stored[field] !== undefined).map((field) => [KEY[field], ENC[field](stored[field])])), ...extra });
const summarize = (list) => ({
  total: list.length,
  reads: list.filter((entry) => entry.op === "get").length,
  writes: list.filter((entry) => entry.op === "set").length,
  removes: list.filter((entry) => entry.op === "remove").length,
  other: list.filter((entry) => !["get", "set", "remove"].includes(entry.op)).length,
});
const mutations = (list) => list.filter((entry) => entry.op === "set" || entry.op === "remove" || entry.op === "clear");
const sevenMutations = (list) => mutations(list).filter((entry) => isSeven(entry.key));
const otherMutations = (list) => mutations(list).filter((entry) => !isSeven(entry.key));
const opsOn = (list, op, key) => list.filter((entry) => entry.op === op && entry.key === key);
const brief = (list) => list.slice(0, 16).map((entry) => `${entry.seq}:${entry.op}:${entry.key}${entry.value !== undefined ? `=${entry.value}` : ""}:${entry.outcome}`);
const appLocks = (list) => list.filter((entry) => entry.by === "app").map((entry) => entry.name);
const accountLocks = (names) => names.filter((name) => name.startsWith("xai:account:") || name.startsWith("xai:demo:") || /account/.test(name.replace(/^xai:pref:v1:/, "")));
const accountMutations = (list) => mutations(list).filter((entry) => /^xai:(account|demo):/.test(entry.key ?? ""));
const storageDispatches = (list) => list.filter((entry) => entry.kind === "storage");
const prefChangedEvents = (list) => list.filter((entry) => entry.kind === "bus" && entry.type === "web:settings:preference-changed");

async function bytesOf(keys = SEVEN) { return evaluate(`__native.native.bytes(${JSON.stringify(keys)})`); }
async function devtoolsBytes(keys = SEVEN) {
  const { entries } = await cdp("DOMStorage.getDOMStorageItems", { storageId: { storageKey: `${origin}/`, isLocalStorage: true } });
  const map = Object.fromEntries(entries);
  return Object.fromEntries(keys.map((key) => [key, Object.hasOwn(map, key) ? map[key] : null]));
}
const mark = () => evaluate("__native.mark()");
/** One consistent read of every surface and the instrument window since `since`. */
async function snap(since) {
  return evaluate(`(() => {
    const w = __native.window(${since});
    return {
      pane: __native.pane(), topbar: __native.topbar(), html: __native.html(), uiLang: __native.uiLang(), routeError: __native.routeError(),
      physical: __native.native.bytes(${JSON.stringify(SEVEN)}), location: verify.location(), scope: verify.scope(), focus: __native.focus(),
      attempts: w.attempts, locks: w.locks, events: w.events, confirm: w.confirm, dispatches: w.dispatches, received: w.storageReceived, nested: w.nested,
    };
  })()`);
}
const nonSevenSnapshot = () => evaluate(`(() => { const all = __native.native.snapshot(); for (const key of ${JSON.stringify(SEVEN)}) delete all[key]; return all; })()`);
const warn = () => evaluate("__native.warn()");

// ---------------------------------------------------------------------------------------------------
// Trusted input helpers
// ---------------------------------------------------------------------------------------------------
async function trustedClick(selector, label) {
  const measure = `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { found: false };
    element.scrollIntoView({ block: "center", inline: "nearest" });
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { found: true, x, y, width: rect.width, height: rect.height, top: rect.top, left: rect.left, viewport: { width: innerWidth, height: innerHeight, scrollX, scrollY },
      hit: !!hit && element.contains(hit), hitTarget: hit ? hit.tagName + "." + (typeof hit.className === "string" ? hit.className : "") : null };
  })()`;
  let point = await evaluate(measure);
  pre(`input:control-present:${label}`, point.found, { selector });
  if (!point.hit) {
    // One re-measure after the layout settles (for example after a native dialog closed); recorded either way.
    const first = point;
    await delay(400);
    point = await evaluate(measure);
    record("observation", { id: `input:centre-hit-test-remeasured:${label}`, first, second: point });
  }
  pre(`input:centre-hit-test:${label}`, point.hit, { selector, hitTarget: point.hitTarget, point });
  await input("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await input("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await input("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(60);
  return { x: Math.round(point.x * 100) / 100, y: Math.round(point.y * 100) / 100, width: point.width, height: point.height };
}
/** Tags exactly one element (expression: page JS evaluating to an array of candidates) and clicks it. */
async function clickOne(expression, label) {
  const found = await evaluate(`(() => {
    document.querySelectorAll("[data-native-target]").forEach((element) => element.removeAttribute("data-native-target"));
    const matches = (${expression});
    if (matches.length === 1) matches[0].setAttribute("data-native-target", "1");
    return matches.length;
  })()`);
  pre(`input:exactly-one-control:${label}`, found === 1, { found });
  const point = await trustedClick('[data-native-target="1"]', label);
  await evaluate('document.querySelector("[data-native-target]")?.removeAttribute("data-native-target")').catch(() => {});
  return point;
}
const byName = (scope, name) => `[...document.querySelectorAll(${JSON.stringify(`${scope} button`)})].filter((b) => (b.getAttribute("aria-label") ?? b.textContent).replace(/\\s+/g, " ").trim() === ${JSON.stringify(name)})`;
const byTestId = (testid) => `[...document.querySelectorAll(${JSON.stringify(`[data-testid="${testid}"]`)})]`;
const clickButton = (name, scope = PANE) => clickOne(byName(scope, name), name);
const clickTestId = (testid, label = testid) => clickOne(byTestId(testid), label);
const KEYDEFS = { Tab: { code: "Tab", vk: 9 }, Escape: { code: "Escape", vk: 27 }, ArrowRight: { code: "ArrowRight", vk: 39 }, ArrowLeft: { code: "ArrowLeft", vk: 37 }, Home: { code: "Home", vk: 36 }, End: { code: "End", vk: 35 } };
/**
 * One trusted key press. No nativeVirtualKeyCode is sent: on macOS that field is the platform key code, and a Windows
 * virtual-key value there names a different physical key (Escape's 27 is kVK_ANSI_Minus). A development probe showed
 * that such an inconsistent Escape makes headless Chrome emit an endless stream of trusted keydown events
 * (key "Unidentified", code "Minus") in this App; without the field exactly one keydown and one keyup arrive.
 */
async function press(key) {
  const def = KEYDEFS[key];
  pressesThisDocument += 1;
  await input("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code: def.code, windowsVirtualKeyCode: def.vk });
  await input("Input.dispatchKeyEvent", { type: "keyUp", key, code: def.code, windowsVirtualKeyCode: def.vk });
  await delay(60);
}
async function parkMouse() {
  await input("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 });
  await delay(40);
}
/** Focus a range input with a trusted click on a non-focusable element before it, then one trusted Tab. */
async function focusSlider(field, label) {
  const anchor = field === "fontScale"
    ? `[...document.querySelectorAll(${JSON.stringify(`${PANE} .setting-row`)})].filter((row) => row.querySelector('[data-appearance-control="fontScale"]')).map((row) => row.querySelector(".sr-label"))`
    : `[...document.querySelectorAll(${JSON.stringify(`${PANE} [data-appearance-control="accentHue"] .accent-hue-preview`)})]`;
  await clickOne(anchor, `${label}:focus-start`);
  await press("Tab");
  const focus = await evaluate("__native.focus()");
  pre(`${label}:slider-focused-by-trusted-tab`, focus.tag === "input" && focus.control === field, { focus });
}
async function openTopbar(label) {
  if (!(await evaluate("__native.topbar().open"))) await trustedClick(".topbar .topbar-pref-trigger", `${label}:topbar-trigger`);
  pre(`${label}:topbar-popover-open`, await waitUntil("__native.topbar().open", 3000));
}
async function closeTopbar(label) {
  if (await evaluate("__native.topbar().open")) await press("Escape");
  pre(`${label}:topbar-popover-closed`, await waitUntil("!__native.topbar().open", 3000));
}
async function chooseTopbar(field, value, label) {
  await openTopbar(label);
  const uiLang = await evaluate("__native.uiLang()");
  const section = labels[uiLang][field === "lang" ? "language" : field];
  const name = field === "lang" ? TOPBAR_LANG[value] : labels[uiLang][value];
  const point = await clickOne(`[...document.querySelectorAll('.topbar #topbar-pref-panel section')].filter((s) => s.getAttribute("aria-label") === ${JSON.stringify(section)}).flatMap((s) => [...s.querySelectorAll('[role="menuitemradio"]')]).filter((o) => o.getAttribute("aria-label") === ${JSON.stringify(name)})`, `${label}:topbar:${section}:${name}`);
  return { ...point, section, name };
}
/** Clicks the pane control for a value (segments, cards, swatches); keyboard and track steps are separate. */
async function clickPaneValue(field, value, label) {
  const uiLang = await evaluate("__native.uiLang()");
  const control = (id) => `[...document.querySelectorAll(${JSON.stringify(`${PANE} [data-appearance-control="${id}"] button`)})]`;
  if (field === "lang") return clickOne(`${control("lang")}.filter((b, i) => i === ${value === "en" ? 0 : 1})`, label);
  if (field === "theme") return clickOne(`${control("theme")}.filter((b) => b.classList.contains("theme-card") && !!b.querySelector(".tp-${value}"))`, label);
  if (field === "density") return clickOne(`${control("density")}.filter((b, i) => i === ${value === "comfortable" ? 0 : 1})`, label);
  if (field === "accentHue") {
    const preset = labels.presets.find((entry) => entry.hue === value);
    return clickOne(`${control("accentHue")}.filter((b) => b.classList.contains("accent-sw") && b.getAttribute("aria-label") === ${JSON.stringify(preset[uiLang])})`, label);
  }
  if (field === "bgTone") return clickOne(`${control("bgTone")}.filter((b) => b.classList.contains("bgt-${value}"))`, label);
  if (field === "railPos") return clickOne(`${control("railPos")}.filter((b) => b.classList.contains("rp-${value}"))`, label);
  throw Error(`No click control for ${field}`);
}
async function railClick(name, label) {
  return clickOne(`[...document.querySelectorAll(".app-rail .rail-items .rail-btn")].filter((b) => b.getAttribute("aria-label") === ${JSON.stringify(name)})`, label);
}
async function sidebarClick(name, label) {
  return clickOne(`[...document.querySelectorAll(".settings-sidebar .list-row")].filter((r) => r.textContent.trim() === ${JSON.stringify(name)})`, label);
}
/**
 * The x coordinate of a trusted click on a range track that selects `target` (contract §10 item 1 slider values).
 * The geometry comes from the input's user-agent shadow tree through CDP (read-only), using Blink's mapping
 * (SliderThumbElement::SetPositionFromPoint: position = x_in_track - thumbWidth/2 - thumbMarginLeft over
 * trackContentWidth - thumbWidth, rounded to the step). The model is validated first against the thumb's current
 * position for the current value; the click point must not fall on the current thumb.
 */
async function rangeTrackPoint(selector, target, min, max, label) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({ block: "center", inline: "nearest" })`);
  await delay(200);
  const { root: documentNode } = await cdp("DOM.getDocument", { depth: -1, pierce: true });
  const { nodeId } = await cdp("DOM.querySelector", { nodeId: documentNode.nodeId, selector });
  pre(`${label}:range-node-found`, nodeId > 0, { selector });
  const { node } = await cdp("DOM.describeNode", { nodeId, depth: -1, pierce: true });
  const shadow = (node.shadowRoots ?? []).find((entry) => entry.shadowRootType === "user-agent");
  const all = [];
  const walk = (entry) => { if (!entry) return; all.push(entry); for (const child of entry.children ?? []) walk(child); for (const inner of entry.shadowRoots ?? []) walk(inner); };
  walk(shadow);
  const attr = (entry, name) => { const list = entry.attributes ?? []; for (let index = 0; index < list.length; index += 2) if (list[index] === name) return list[index + 1]; return null; };
  const track = all.find((entry) => attr(entry, "pseudo") === "-webkit-slider-runnable-track" || attr(entry, "id") === "track");
  const thumb = all.find((entry) => attr(entry, "pseudo") === "-webkit-slider-thumb" || attr(entry, "id") === "thumb");
  pre(`${label}:user-agent-track-and-thumb-found`, Boolean(track && thumb), { shadowRootType: shadow?.shadowRootType ?? null, nodes: all.map((entry) => `${entry.nodeName}:${attr(entry, "id") ?? ""}:${attr(entry, "pseudo") ?? ""}`).slice(0, 12) });
  const box = async (backendNodeId) => (await cdp("DOM.getBoxModel", { backendNodeId })).model;
  const inputBox = await box(node.backendNodeId);
  const trackBox = await box(track.backendNodeId);
  const thumbBox = await box(thumb.backendNodeId);
  const page = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); const rect = element.getBoundingClientRect(); return { left: rect.left, top: rect.top, width: rect.width, height: rect.height, value: element.value }; })()`);
  // DOM.getBoxModel quads and getBoundingClientRect share one coordinate frame at scroll position 0 of the page.
  const offsetX = page.left - inputBox.border[0];
  const offsetY = page.top - inputBox.border[1];
  const trackLeft = trackBox.border[0] + offsetX;
  const trackContentWidth = trackBox.content[2] - trackBox.content[0];
  const thumbWidth = thumbBox.border[2] - thumbBox.border[0];
  const thumbMarginLeft = thumbBox.border[0] - thumbBox.margin[0];
  const span = trackContentWidth - thumbWidth;
  const current = Number(page.value);
  const predictedThumbLeft = trackLeft + thumbMarginLeft + ((current - min) / (max - min)) * span;
  const measuredThumbLeft = thumbBox.border[0] + offsetX;
  const geometry = { offsetX, offsetY, trackLeft, trackContentWidth, thumbWidth, thumbMarginLeft, span, current, predictedThumbLeft, measuredThumbLeft, unitPx: span / (max - min) };
  pre(`${label}:track-model-validated-against-current-thumb`, Math.abs(predictedThumbLeft - measuredThumbLeft) < 0.5 && span > 0, geometry);
  const x = trackLeft + thumbMarginLeft + thumbWidth / 2 + ((target - min) / (max - min)) * span;
  const y = page.top + page.height / 2;
  pre(`${label}:target-point-not-on-the-current-thumb`, x < measuredThumbLeft - 1 || x > measuredThumbLeft + thumbWidth + 1, { x, measuredThumbLeft, thumbWidth });
  const hit = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); const target = document.elementFromPoint(${x}, ${y}); return !!target && element.contains(target); })()`);
  pre(`${label}:track-point-hit-test`, hit, { x, y });
  return { x, y, geometry };
}
async function trackClick(selector, target, min, max, label) {
  const point = await rangeTrackPoint(selector, target, min, max, label);
  await input("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await input("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await input("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(60);
  return point;
}

// ---------------------------------------------------------------------------------------------------
// Documents: seed page, App mount, second document, downloads, frames
// ---------------------------------------------------------------------------------------------------
let selfTested = false;
async function seed(entries, label) {
  await navigateTo(`${origin}/seed`);
  pre(`${label}:seed-page-loaded-with-prelude-only`, await waitUntil("document.readyState === 'complete' && location.pathname === '/seed' && !!window.__native && !window.verify", 10000));
  if (!selfTested) {
    const result = await evaluate("__native.selfTest()");
    record("instrument-selftest", { page: "/seed (prelude only, no product code)", result });
    pre("instruments:storage-faults-f-b002-dispatch-bus-locks-export-confirm-network-input-dom-frames", result.setDeniedThrew && result.setDeniedNeverStored && result.setDelegated
      && result.readbackAfterSetDenied && result.readbackOneShot && result.getDenied && result.removeDeniedThrew && result.removeDeniedKeptBytes
      && result.removeDelegated && result.readbackAfterRemoveDenied && Object.values(result.totalDenial).every(Boolean)
      && result.probeUnderDenial.threw && result.probeUnderDenial.logged === 1 && result.probeUnderDenial.last?.outcome === "denied" && result.noNestedStorageCalls
      && isDeepStrictEqual(result.dispatchCounted, ["storage:null:true:true", "storage:xai_native_fixed_selftest:true:true", "bus:web:settings:preference-changed"])
      && isDeepStrictEqual(result.deliveredCounted, ["null:false", "xai_native_fixed_selftest:false"])
      && result.nonLocalFetchRefusedAndLogged && result.lockHeldAndPending && result.lockReleasedAppRan && isDeepStrictEqual(result.lockAttribution, ["fixture", "app"])
      && result.urlTraced && result.createFailureHook && result.clickFailureHook && result.anchorAddedAndRemovedTraced && result.pendingFailuresConsumed && result.confirmWrapped
      && result.domGateAddedAndRemoved && result.framesSampled > 0 && result.warnWithoutListener.warned === false && result.inputTraced, { result });
    selfTested = true;
  }
  const stored = await evaluate(`(() => { __native.native.clear(); const seeds = ${JSON.stringify(entries)}; for (const [key, value] of Object.entries(seeds)) __native.native.set(key, value); return __native.native.snapshot(); })()`);
  pre(`${label}:seeded-exact-bytes`, isDeepStrictEqual(stored, entries), { stored });
}
/**
 * Production App mount. With productCrash, a route error or an uncaught exception is a product failure (contract §5
 * item 2, §10 item 4); otherwise a failed mount is a harness precondition.
 */
async function mountApp(label, { path = "/app/settings/appearance", productCrash = false } = {}) {
  const errorsBefore = runtimeErrors.length;
  await navigateTo(`${origin}${path}`);
  const ready = path.includes("/settings/appearance") ? READY_PANE : READY_APP;
  const settled = await waitUntil(`${ready} || ${CRASHED}`, 20000);
  await delay(700);
  const state = await evaluate(`({ ready: ${ready}, crashed: ${CRASHED}, routeError: window.__native ? __native.routeError() : null, verifyPresent: !!window.verify, path: location.pathname,
    body: (document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 300) })`);
  pre(`${label}:document-loaded-and-bundle-evaluated`, settled && state.verifyPresent, { state });
  const exceptions = runtimeErrors.slice(errorsBefore).filter((entry) => entry.kind === "exception");
  if (productCrash) {
    check(`${label}:app-renders-without-route-error`, state.ready && !state.crashed, { routeError: state.routeError, path: state.path, body: state.body });
    check(`${label}:no-uncaught-exception-at-mount`, exceptions.length === 0, { exceptions: exceptions.slice(0, 3) });
  } else {
    pre(`${label}:production-app-mounted`, state.ready && !state.crashed, { state });
    pre(`${label}:no-uncaught-exception-at-mount`, exceptions.length === 0, { exceptions: exceptions.slice(0, 3) });
  }
  const facts = await evaluate(`({ composition: verify.composition, instance: verify.instance, scope: verify.scope(), auth: verify.authCalls(), markerKey: verify.markerKey,
    lockNames: verify.lockNames(), physicalKeys: verify.physicalKeys(), rail: verify.rail(), pet: !!document.querySelector('.pet-wrap'), topbar: !!document.querySelector('header.topbar'),
    network: __native.network.filter((entry) => !entry.local).length, location: verify.location() })`);
  pre(`${label}:auth-session-context-served-by-real-provider`, facts.composition === "production-app" && facts.auth.getSession >= 1 && facts.markerKey === MARKER_KEY, { auth: facts.auth, markerKey: facts.markerKey });
  pre(`${label}:account-data-gate-activated-account`, facts.scope.kind === "account" && facts.scope.accountId === OWNER && facts.scope.generation === "g1", { scope: facts.scope });
  pre(`${label}:production-surfaces-present`, facts.rail.length > 0 && facts.topbar && facts.pet, { rail: facts.rail.length, pet: facts.pet });
  pre(`${label}:real-lock-names-and-unscoped-device-keys`, FIELDS.every((field) => facts.lockNames[KEY[field]] === LOCK_OF(field) && facts.physicalKeys[KEY[field]] === KEY[field]), { lockNames: facts.lockNames, physicalKeys: facts.physicalKeys });
  pre(`${label}:no-non-local-network-attempt`, facts.network === 0);
  if (!labels) labels = await evaluate("verify.labels");
  return facts;
}
/**
 * A fresh-load agreement check (controller ruling 3, contract §5 item 1): zero mount set/remove attempts on the
 * seven keys, exact stored bytes, and the pane, the Topbar (summary and, with the popover open, aria-checked) and
 * <html> agree on the stored values; the clean state of the bottom action area.
 */
async function freshLoadCheck(id, stored, { popover = true } = {}) {
  const now = await snap(0);
  const dt = await devtoolsBytes();
  const shown = shownOf(stored);
  const raw = rawOf(stored);
  check(`${id}:zero-mount-set-remove-attempts-on-the-seven-keys`, sevenMutations(now.attempts).length === 0, { seven: summarize(now.attempts.filter((entry) => isSeven(entry.key))), otherMountMutations: brief(otherMutations(now.attempts)) });
  check(`${id}:stored-bytes-unchanged`, isDeepStrictEqual(now.physical, raw) && isDeepStrictEqual(dt, raw), { physical: now.physical, devtools: dt, expected: raw });
  check(`${id}:pane-displays-stored-values`, paneMatches(now.pane?.values, shown), { pane: now.pane?.values, expected: shown });
  check(`${id}:html-applies-stored-values`, htmlMatches(now.html, shown), { html: now.html, expected: htmlFor(shown, now.html.prefersDark) });
  check(`${id}:topbar-summary-and-ui-language-show-stored-values`, now.topbar.summary === summaryFor(shown) && now.uiLang === shown.lang, { summary: now.topbar.summary, expected: summaryFor(shown), uiLang: now.uiLang });
  check(`${id}:clean-bottom-action-area`, cleanPane(now.pane, shown.lang, ""), { pane: now.pane });
  check(`${id}:no-topbar-status`, now.topbar.status === null, { status: now.topbar.status });
  const warning = await warn();
  check(`${id}:no-unload-warning`, warning.warned === false && warning.attempts === 0, warning);
  if (popover) {
    const since = await mark();
    await openTopbar(`${id}:inspect`);
    const open = await evaluate("__native.topbar()");
    await closeTopbar(`${id}:inspect`);
    await parkMouse();
    const after = await snap(since);
    const checked = (open.options ?? []).filter((option) => option.checked === "true").map((option) => option.name);
    check(`${id}:topbar-aria-checked-shows-stored-values`, isDeepStrictEqual(checked, checkedFor(shown)), { checked, expected: checkedFor(shown) });
    check(`${id}:popover-round-trip-zero-writes`, sevenMutations(after.attempts).length === 0 && mutations(after.attempts).length === 0, { mutations: brief(mutations(after.attempts)) });
  }
  return now;
}
/** The clean bottom action area (A2.2, §5 item 9): Retry all rendered and aria-disabled, Reset only, no old footer. */
function cleanPane(pane, lang, statusLine) {
  if (!pane) return false;
  return pane.recovery.length === 0 && pane.statusLine?.text === statusLine && pane.statusLine?.role === "status" && pane.statusLine?.inActions
    && pane.retryAll?.text === COPY[lang].retryAll && pane.retryAll.ariaDisabled === "true" && pane.retryAll.disabled === false && pane.retryAll.describedBy === null && !pane.retryAll.hidden && pane.retryAll.tabIndex === 0
    && pane.exportButton === null && pane.discardAll === null && pane.reset === COPY[lang].reset && !pane.oldFooter
    && isDeepStrictEqual(pane.actionButtons, ["appearance-retry-all", "appearance-reset-defaults"]);
}
/** The bottom action area with drafts: expected status line, Retry all enabled iff E is non-empty, Export and Discard all. */
function draftPane(pane, lang, statusLine, retryEnabled) {
  if (!pane) return false;
  return pane.statusLine?.text === statusLine && pane.statusLine?.role === "status"
    && pane.retryAll?.text === COPY[lang].retryAll && pane.retryAll.disabled === false
    && (retryEnabled ? (pane.retryAll.ariaDisabled === null || pane.retryAll.ariaDisabled === "false") && pane.retryAll.describedByStatusLine : pane.retryAll.ariaDisabled === "true" && pane.retryAll.describedBy === null)
    && pane.exportButton === COPY[lang].exportDraft && pane.discardAll === COPY[lang].discardAll && pane.reset === COPY[lang].reset && !pane.oldFooter
    && isDeepStrictEqual(pane.actionButtons, ["appearance-retry-all", "appearance-export-draft", "appearance-discard-all", "appearance-reset-defaults"]);
}
const topbarStatusShown = (topbar, lang) => topbar.status !== null && topbar.status.name === COPY[lang].statusName && topbar.status.text === COPY[lang].statusText && topbar.status.tag === "button" && topbar.status.inControls;
/**
 * An independent same-origin document (a second real tab of the same profile; no product code, no instruments)
 * evaluates `expression` through its own flattened DevTools session on the same pipe.
 */
async function secondDocument(expression, label) {
  const { targetId } = await session.send("Target.createTarget", { url: `${origin}/external` });
  pre(`${label}:second-document-target-present`, typeof targetId === "string" && targetId.length > 0, { targetId });
  const { sessionId } = await session.send("Target.attachToTarget", { targetId, flatten: true });
  const call = (method, params = {}) => session.send(method, params, sessionId);
  try {
    let loaded = false;
    for (let attempt = 0; attempt < 150 && !loaded; attempt += 1) {
      const probe = await call("Runtime.evaluate", { expression: "document.readyState === 'complete' && location.pathname === '/external' && !window.verify && !window.__native", returnByValue: true }).catch(() => null);
      loaded = probe?.result?.value === true;
      if (!loaded) await delay(30);
    }
    pre(`${label}:independent-same-origin-document-without-product-or-instruments`, loaded, { targetId });
    const result = await call("Runtime.evaluate", { expression, returnByValue: true });
    pre(`${label}:second-document-evaluated`, !result.exceptionDetails, { exception: result.exceptionDetails?.text ?? null });
    return { targetId, value: result.result.value };
  } finally {
    await session.send("Target.closeTarget", { targetId }).catch(() => {});
    await cdp("Page.bringToFront");
    await delay(200);
  }
}
const visibleDownloads = () => readdirSync(downloads).filter((name) => !name.startsWith("."));
async function awaitDownload(timeout = 10000) {
  const file = join(downloads, "appearance-draft.json");
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const names = visibleDownloads();
    if (names.includes("appearance-draft.json") && !names.some((name) => name.endsWith(".crdownload"))) {
      const first = statSync(file).size;
      await delay(150);
      const second = statSync(file).size;
      if (first > 0 && first === second) return { names: visibleDownloads(), raw: readFileSync(file), file };
    }
    await delay(50);
  }
  return null;
}
const startFrames = () => evaluate("__native.startFrames()");
const stopFrames = () => evaluate("__native.stopFrames()");
/** Decodes a Topbar summary "EN · Dark · Compact" into field ids with the archive's own labels. */
function decodeSummary(summary) {
  if (typeof summary !== "string") return null;
  const parts = summary.split(" · ");
  if (parts.length !== 3) return null;
  const lang = parts[0] === "EN" ? "en" : parts[0] === "中文" ? "zh" : null;
  if (!lang) return null;
  const theme = ["light", "dark", "system"].find((id) => labels[lang][id] === parts[1]) ?? null;
  const density = ["comfortable", "compact"].find((id) => labels[lang][id] === parts[2]) ?? null;
  return theme && density ? { lang, theme, density } : null;
}
/** Every sampled frame shows one state on the pane, the Topbar and <html> (contract §5 item 4, §10 item 3). */
function frameAgreement(frames, prefersDark) {
  const bad = [];
  for (const frame of frames) {
    const topbar = decodeSummary(frame.summary);
    const agree = Boolean(topbar && frame.pane) && frame.pane.lang === topbar.lang && frame.uiLang === topbar.lang && frame.pane.theme === topbar.theme && frame.pane.density === topbar.density
      && frame.htmlTheme === resolveTheme(topbar.theme, prefersDark) && frame.htmlDensity === topbar.density
      && (frame.checked === null || isDeepStrictEqual(frame.checked, checkedFor(topbar)));
    if (!agree) bad.push(frame);
  }
  return bad;
}

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
let harnessError = null;
try {
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
  const pinAndGuard = { name: "appearance-native-fixed-archive-pin-guard", setup(buildApi) {
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
  const archiveInputs = inputs.filter((input) => !input.startsWith("../") && input !== FIXTURE && !input.startsWith("<define:"));
  const thirdParty = inputs.filter((input) => input.includes("node_modules/"));
  const foreign = inputs.filter((input) => input.startsWith("../") && !input.includes("node_modules/"));
  const missingRequired = REQUIRED_MODULES.filter((file) => !inputs.includes(file) || (!archiveModules.has(file) && !file.endsWith(".css")));
  const requiredHashes = Object.fromEntries(REQUIRED_MODULES.map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  // Every bundled reader/host/storage module outside the 24-file Terra delta is byte-identical to 5cd63ff.
  const protectedDrift = REQUIRED_MODULES.filter((file) => !EXPECTED_FIXED_DELTA.includes(file)).filter((file) => {
    const before = execFileSync("git", ["show", `${BEFORE_REVISION}:${file}`], { cwd: root, maxBuffer: 50 * 1024 * 1024 });
    return sha256(before) !== requiredHashes[file];
  });
  const contractSourceActual = Object.fromEntries(Object.keys(CONTRACT_SOURCE_HASHES).map((file) => [file, existsSync(join(snapshot, file)) ? sha256(readFileSync(join(snapshot, file))) : null]));
  const contractUnchangedMismatches = Object.entries(CONTRACT_SOURCE_HASHES).filter(([file]) => !UNIT_CHANGED.includes(file)).filter(([file, hash]) => contractSourceActual[file] !== hash).map(([file]) => file);
  const unitNotChanged = UNIT_CHANGED.filter((file) => contractSourceActual[file] === CONTRACT_SOURCE_HASHES[file]);
  const fixedUnitHashes = Object.fromEntries(EXPECTED_FIXED_DELTA.filter((file) => existsSync(join(snapshot, file))).map((file) => [file, sha256(readFileSync(join(snapshot, file)))]));

  const appPage = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>XAI Web (Appearance native fixed, ${mode})</title><link rel="stylesheet" href="/__native/bundle.css"><script src="/__native/prelude.js"></script></head><body><div id="root"></div><script type="module" src="/__native/bundle.js"></script></body></html>`;
  const seedPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>seed</title><script src="/__native/prelude.js"></script></head><body><p>seed page: prelude only, no product code</p></body></html>';
  const externalPage = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Independent same-origin document</title></head><body><p>second document: no product code, no instruments</p></body></html>';
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

  await openSession();
  const version = await session.send("Browser.getVersion");
  record("baseline", {
    requested, resolved, resolvedTree, docsHead, productDeltaVsDocsHead: productDelta, mode, suffix, composition: "production-app",
    browser: version.product, protocol: version.protocolVersion, userAgent: version.userAgent, node: process.version, esbuild: esbuild.version,
    packages: { react: versionOf("react"), "react-dom": versionOf("react-dom"), "react-router": versionOf("react-router") },
    lockfileSha256: { archive: sha256(archiveLock), dependencies: sha256(dependencyLock), extracted: sha256(extractedLock), contractGate: LOCKFILE_GATE_SHA256 },
    fileSha256: { "verify-native-fixed.mjs": runnerSha256, [FIXTURE]: sha256(fixtureSource), "native-fixed-prelude.js": sha256(preludeSource) },
    contract: { path: CONTRACT_PATH, sha256AtHead: contractSha256, expected: CONTRACT_SHA256 },
    bundleSha256: sha256(js), bundleCssSha256: sha256(css), bundleModuleComments: moduleIndex.length,
    bundleInputs: { total: inputs.length, archive: archiveInputs.length, thirdParty: thirdParty.length, foreign },
    guard: { forbiddenRoots, violations: guardViolations, pinnedRepoSpecifiers: pinnedRepo.length, archiveModulesLoaded: archiveModules.size },
    requiredModules: { count: REQUIRED_MODULES.length, missing: missingRequired, sha256: requiredHashes, protectedModulesDriftedFromBefore: protectedDrift },
    fixedVsBefore: { before: BEFORE_REVISION, productFilesChanged: fixedDelta, fixedFilesSha256: fixedUnitHashes },
    contractSourceTable: { rows: Object.keys(CONTRACT_SOURCE_HASHES).length, unchangedRowMismatches: contractUnchangedMismatches, unitRowsNotChanged: unitNotChanged, sha256: contractSourceActual },
    origin: "127.0.0.1 (ephemeral port, this runner's own server); every other host resolves to NOTFOUND",
    devtools: "pipe transport (--remote-debugging-pipe), flattened target sessions; trusted input through Input.dispatchMouseEvent/dispatchKeyEvent (no nativeVirtualKeyCode)",
  });
  pre("baseline:docs-head-product-tree-equals-fixed", productDelta === "", { productDelta });
  pre("baseline:lockfile-gate", sha256(dependencyLock) === LOCKFILE_GATE_SHA256 && sha256(archiveLock) === LOCKFILE_GATE_SHA256 && sha256(extractedLock) === LOCKFILE_GATE_SHA256);
  pre("baseline:contract-r3-hash", contractSha256 === CONTRACT_SHA256, { contractSha256 });
  pre("baseline:fixed-delta-is-exactly-the-24-terra-files", isDeepStrictEqual([...fixedDelta].sort(), [...EXPECTED_FIXED_DELTA].sort()), { fixedDelta });
  pre("baseline:contract-source-table-protected-rows-unchanged", contractUnchangedMismatches.length === 0 && unitNotChanged.length === 0, { contractUnchangedMismatches, unitNotChanged });
  pre("baseline:guard-no-module-from-a-checkout", guardViolations.length === 0 && foreign.length === 0, { guardViolations, foreign });
  pre("baseline:every-required-module-bundled-from-archive", missingRequired.length === 0, { missingRequired });
  pre("baseline:bundled-protected-modules-byte-identical-to-5cd63ff", protectedDrift.length === 0, { protectedDrift });

  if (mode === "controls") await runControls();
  if (mode === "reset") await runReset();
  if (mode === "export") await runExport();

  await collectNetwork();
  record("observation", { id: "run:network-and-requests", network: networkSeen, served });
  pre("run:no-non-local-network-attempt", networkSeen.nonLocal === 0, { networkSeen });
  pre("run:keyboard-trace-contains-only-the-runner-key-presses", keyboardAudit.mismatches.length === 0 && keyboardAudit.keydowns === keyboardAudit.runnerPresses, keyboardAudit);
  pre("run:no-unexpected-javascript-dialogs", dialogs.every((entry) => entry.expected), { dialogs: dialogs.filter((entry) => !entry.expected) });
  check("run:runtime-errors-zero", runtimeErrors.length === 0, { runtimeErrors: runtimeErrors.slice(0, 5) });
} catch (error) {
  harnessError = error;
} finally {
  const productFailure = harnessError?.checkKind === "product";
  const warningGroups = {};
  for (const warning of consoleWarnings) {
    const key = `${warning.text.slice(0, 160)} @ ${warning.source?.module ?? warning.source?.url ?? "unknown"}`;
    warningGroups[key] = (warningGroups[key] ?? 0) + 1;
  }
  if (sessionsLaunched.some((state) => state.socketClose && !state.processExit)) await delay(1500);
  record("result", {
    pass: harnessError === null, harnessValid: harnessError === null || productFailure, mode, checks, productChecks,
    browserSessions: sessionsLaunched.map((state) => ({ pid: state.pid, socketClose: state.socketClose ?? null, processExit: state.processExit ?? null, rendererCrash: state.crashed })),
    runtimeErrors: runtimeErrors.length, runtimeErrorSamples: runtimeErrors.slice(0, 6),
    consoleWarnings: consoleWarnings.length, consoleWarningsBySource: warningGroups, consoleWarningSamples: consoleWarnings.slice(0, 6),
    dialogs, artifacts, keyboardAudit, network: networkSeen,
    ...(harnessError ? { error: String(harnessError?.stack ?? harnessError).slice(0, 1500), checkId: harnessError?.checkId ?? null, checkKind: harnessError?.checkKind ?? null } : {}),
  });
  writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`, { flag: "wx" });
  await closeSession().catch(() => {});
  server?.closeAllConnections?.();
  server?.close();
  await delay(300);
  rmSync(directory, { recursive: true, force: true });
  process.exitCode = harnessError === null ? 0 : productFailure ? 2 : 1;
  const label = harnessError === null ? "PASS" : productFailure ? "PRODUCT-FAIL" : "HARNESS-FAIL";
  console.log(`${label} ${relative(root, evidencePath)} checks=${checks} product=${productChecks} exit=${process.exitCode}${harnessError ? ` error=${String(harnessError?.message ?? harnessError).split("\n")[0]}` : ""}`);
}

// ---------------------------------------------------------------------------------------------------
// E9: controls (production App composition)
// ---------------------------------------------------------------------------------------------------
async function runControls() {
  // ---- c0: absent mount -----------------------------------------------------------------------------
  await seed({ [MARKER_KEY]: MARKER }, "controls:c0");
  await mountApp("controls:c0");
  await freshLoadCheck("controls:c0-initial-absent-mount", {});

  // ---- The 40 values of §10 item 1 by trusted input --------------------------------------------------
  const STEPS = [
    ...["zh", "en"].map((value) => ({ surface: "pane", field: "lang", value, via: "click" })),
    ...["light", "dark", "system"].map((value) => ({ surface: "pane", field: "theme", value, via: "click" })),
    ...["comfortable", "compact"].map((value) => ({ surface: "pane", field: "density", value, via: "click" })),
    { surface: "pane", field: "fontScale", value: 0.85, via: "key", key: "Home" },
    ...[0.9, 0.95, 1, 1.05, 1.1, 1.15].map((value) => ({ surface: "pane", field: "fontScale", value, via: "key", key: "ArrowRight" })),
    ...[165, 230, 35, 355, 295, 75].map((value) => ({ surface: "pane", field: "accentHue", value, via: "click" })),
    { surface: "pane", field: "accentHue", value: 0, via: "key", key: "Home" },
    { surface: "pane", field: "accentHue", value: 220, via: "track" },
    { surface: "pane", field: "accentHue", value: 360, via: "key", key: "End" },
    ...["left", "right", "top", "bottom"].map((value) => ({ surface: "pane", field: "railPos", value, via: "click" })),
    ...["default", "cream", "mist", "lavender", "peach", "graphite"].map((value) => ({ surface: "pane", field: "bgTone", value, via: "click" })),
    ...["zh", "en"].map((value) => ({ surface: "topbar", field: "lang", value, via: "click" })),
    ...["light", "dark", "system"].map((value) => ({ surface: "topbar", field: "theme", value, via: "click" })),
    ...["comfortable", "compact"].map((value) => ({ surface: "topbar", field: "density", value, via: "click" })),
  ];
  pre("controls:forty-values-33-pane-7-topbar", STEPS.length === 40 && STEPS.filter((step) => step.surface === "pane").length === 33 && STEPS.filter((step) => step.surface === "topbar").length === 7);
  let stored = {};
  const sameness = { steps: 0, frames: 0, inconsistent: 0 };
  let focusedSlider = null;
  for (const [index, step] of STEPS.entries()) {
    const n = String(index + 1).padStart(2, "0");
    const id = `controls:value-${n}:${step.surface}:${step.field}=${step.value}`;
    const next = { ...stored, [step.field]: step.value, ...(step.field === "bgTone" ? { accentHue: TONE_HUE[step.value] } : {}) };
    const shown = shownOf(next);
    const raw = rawOf(next);
    const changedKeys = step.field === "bgTone" ? [KEY.bgTone, KEY.accentHue] : [KEY[step.field]];
    const sampled = ["lang", "theme", "density"].includes(step.field);
    if ((step.via === "key" || step.via === "track") && focusedSlider !== step.field) {
      await focusSlider(step.field, `${id}`);
      focusedSlider = step.field;
    }
    if (step.via === "click") focusedSlider = null;
    if (step.surface === "topbar") await openTopbar(id);
    const since = await mark();
    if (sampled) await startFrames();
    let input = null;
    if (step.surface === "topbar") input = await chooseTopbar(step.field, step.value, id);
    else if (step.via === "click") input = await clickPaneValue(step.field, step.value, id);
    else if (step.via === "key") { await press(step.key); input = { key: step.key }; }
    else if (step.via === "track") { input = await trackClick(`${PANE} [data-appearance-control="accentHue"] input[type="range"]`, step.value, 0, 360, id); focusedSlider = step.field; }
    const settled = await waitUntil(`(() => { const raw = __native.native.bytes(${JSON.stringify(changedKeys)}); const pane = __native.pane();
      return ${changedKeys.map((key) => `raw[${JSON.stringify(key)}] === ${JSON.stringify(raw[key])}`).join(" && ")} && !!pane && pane.recovery.length === 0 && pane.statusLine.text === ${JSON.stringify(COPY[shown.lang].saved)}; })()`, 6000);
    await delay(250);
    const frames = sampled ? await stopFrames() : [];
    const after = await snap(since);
    const dt = await devtoolsBytes();
    const sets = after.attempts.filter((entry) => entry.op === "set" && isSeven(entry.key));
    const removes = after.attempts.filter((entry) => (entry.op === "remove" || entry.op === "clear") && (entry.key === null || isSeven(entry.key)));
    const locks = appLocks(after.locks);
    const keyEvent = (event) => event.type === "keydown" && event.trusted && event.key === step.key && event.target.control === step.field && event.target.type === "range";
    const inputEvent = (event) => event.type === "input" && event.trusted && event.target.control === step.field && (step.via === "track" ? event.target.value === String(step.value) : Number(event.target.value) === step.value);
    const clickEvent = step.surface === "topbar"
      ? (event) => event.type === "click" && event.trusted && event.target.role === "menuitemradio" && event.target.section === input.section && event.target.label === input.name
      : (event) => event.type === "click" && event.trusted && event.target.control === step.field;
    const matched = after.events.filter((event) => (step.via === "key" ? keyEvent(event) || inputEvent(event) : step.via === "track" ? inputEvent(event) : clickEvent(event)));
    const trusted = step.via === "key" ? matched.some(keyEvent) && matched.some(inputEvent) : step.via === "track" ? matched.some(inputEvent) : matched.some(clickEvent);
    const strayKeydowns = after.events.filter((event) => event.type === "keydown" && !(step.via === "key" && keyEvent(event)));
    pre(`${id}:no-keyboard-event-other-than-the-runner-input`, strayKeydowns.length === 0, { stray: strayKeydowns.slice(0, 3) });
    if (step.via === "track") pre(`${id}:track-click-produced-the-target-value`, after.events.some((event) => event.type === "input" && event.trusted && event.target.value === String(step.value)), { inputs: after.events.filter((event) => event.type === "input").map((event) => `${event.trusted}:${event.target.value}`), geometry: input.geometry });
    check(`${id}:trusted-input`, trusted, { input, matched: matched.map((event) => ({ type: event.type, trusted: event.trusted, key: event.key ?? null, target: event.target })),
      otherKeydowns: { count: strayKeydowns.length, sample: strayKeydowns.slice(0, 2).map((event) => ({ key: event.key, code: event.code, keyCode: event.keyCode, modifiers: event.modifiers, trusted: event.trusted, t: event.t, target: event.target.className || event.target.tag })) } });
    check(`${id}:persisted-with-saved-status`, settled, { physical: after.physical, recovery: after.pane?.recovery, statusLine: after.pane?.statusLine });
    check(`${id}:exact-bytes`, changedKeys.every((key) => after.physical[key] === raw[key]) && isDeepStrictEqual(after.physical, raw), { observed: after.physical, expected: raw });
    check(`${id}:devtools-bytes`, isDeepStrictEqual(dt, raw), { observed: dt });
    check(`${id}:one-exact-write-per-changed-key-no-other-attempt`, sets.length === changedKeys.length && changedKeys.every((key) => opsOn(sets, "set", key).length === 1 && opsOn(sets, "set", key)[0].value === raw[key] && opsOn(sets, "set", key)[0].outcome === "ok") && removes.length === 0,
      { sets: brief(sets), removes: brief(removes) });
    check(`${id}:real-device-lock-no-account-machinery`, changedKeys.every((key) => locks.includes(`xai:pref:v1:${encodeURIComponent(key)}`)) && accountLocks(locks).length === 0 && accountMutations(after.attempts).length === 0, { appLocks: locks });
    check(`${id}:displayed-and-applied`, paneMatches(after.pane?.values, shown) && htmlMatches(after.html, shown) && after.topbar.summary === summaryFor(shown) && after.uiLang === shown.lang,
      { pane: after.pane?.values, html: after.html, summary: after.topbar.summary, expected: { shown, summary: summaryFor(shown) } });
    if (step.surface === "topbar") {
      const checked = (after.topbar.options ?? []).filter((option) => option.checked === "true").map((option) => option.name);
      check(`${id}:topbar-aria-checked`, isDeepStrictEqual(checked, checkedFor(shown)), { checked, expected: checkedFor(shown) });
    }
    check(`${id}:saved-truth-clean-area`, cleanPane(after.pane, shown.lang, COPY[shown.lang].saved) && after.topbar.status === null, { pane: after.pane, status: after.topbar.status });
    check(`${id}:no-storage-event-or-preference-broadcast`, storageDispatches(after.dispatches).length === 0 && prefChangedEvents(after.dispatches).length === 0 && after.received.every((entry) => entry.key !== null),
      { dispatches: after.dispatches.slice(0, 6) });
    check(`${id}:no-unrelated-key-mutation`, otherMutations(after.attempts).length === 0, { other: brief(otherMutations(after.attempts)) });
    if (sampled) {
      const bad = frameAgreement(frames, after.html.prefersDark);
      const showsNew = frames.some((frame) => frame.pane && frame.pane[step.field] === step.value && decodeSummary(frame.summary)?.[step.field] === step.value);
      sameness.steps += 1;
      sameness.frames += frames.length;
      sameness.inconsistent += bad.length;
      check(`${id}:cross-surface-sameness-every-frame`, frames.length > 0 && bad.length === 0 && showsNew, { frames: frames.length, inconsistent: bad.slice(0, 3), showsNew });
    }
    const warning = await warn();
    check(`${id}:no-unload-warning-after-save`, warning.warned === false && warning.attempts === 0, warning);
    if (step.surface === "topbar" && index === STEPS.length - 1) await closeTopbar(id);
    stored = next;
    record("value", { n: index + 1, surface: step.surface, field: step.field, value: step.value, via: step.via, raw: changedKeys.map((key) => `${key}=${raw[key]}`), input, framesSampled: frames.length });
  }
  await closeTopbar("controls:after-forty");
  record("controls-forty-summary", { values: 40, pane: 33, topbar: 7, final: stored, sameness });

  // ---- New-document reload (same browser) ------------------------------------------------------------
  {
    const previous = await evaluate("verify.instance");
    await collectNetwork();
    session.navigating = true;
    await cdp("Page.reload", { ignoreCache: true });
    const current = session;
    setTimeout(() => { current.navigating = false; }, 2500);
    pre("controls:new-document-reload:new-instance", await waitUntil(`${READY_PANE} && verify.instance !== ${JSON.stringify(previous)}`, 20000));
    await delay(700);
    await freshLoadCheck("controls:new-document-reload", stored);
  }
  // ---- Graceful browser restart (bytes left the renderer) ---------------------------------------------
  {
    const restart = await closeSession();
    pre("controls:graceful-browser-close", restart.graceful, restart);
    await openSession();
    await mountApp("controls:after-browser-restart");
    await freshLoadCheck("controls:after-browser-restart", stored);
  }
  // ---- Seeded fresh documents (controller ruling 3; batch-39 pane-mirror observation) -----------------
  for (const [name, values] of [["en-dark-compact-1.1", { lang: "en", theme: "dark", density: "compact", fontScale: 1.1, accentHue: 230, railPos: "right", bgTone: "mist" }],
    ["zh-dark-compact-1.1", { lang: "zh", theme: "dark", density: "compact", fontScale: 1.1, accentHue: 230, railPos: "right", bgTone: "mist" }]]) {
    await seed(seedsOf(values), `controls:fresh-${name}`);
    await mountApp(`controls:fresh-${name}`);
    await freshLoadCheck(`controls:fresh-${name}`, values);
  }

  // ---- Source-only state for each key (invalid and unreadable bytes) ---------------------------------
  const VALID = { lang: "en", theme: "dark", density: "compact", accentHue: 230, bgTone: "mist", railPos: "right", fontScale: 1.1 };
  const INVALID = { lang: '"fr"', theme: '"neon"', density: "{}", fontScale: '"1"', accentHue: "Infinity", railPos: "diagonal", bgTone: "sage" };
  const UNREADABLE_VALUE = { lang: "zh", theme: "dark", density: "compact", accentHue: 230, bgTone: "mist", railPos: "right", fontScale: 1.1 };
  for (const field of FIELDS) {
    // Invalid bytes.
    {
      const id = `controls:source-invalid:${field}`;
      const others = { ...VALID };
      delete others[field];
      const seeds = { ...seedsOf(others), [KEY[field]]: INVALID[field] };
      await seed(seeds, id);
      await mountApp(id, { productCrash: true });
      const lang = field === "lang" ? "en" : VALID.lang;
      const shown = { ...VALID, [field]: DEFAULTS[field] };
      const raw = { ...rawOf(others), [KEY[field]]: INVALID[field] };
      await sourceOnlyChecks(id, field, lang, shown, raw);
      // Reload of a malformed field rereads, keeps its alert and its bytes, never writes.
      const reloadMark = await mark();
      await clickButton(COPY[lang].reloadName(COPY[lang].label[field]));
      await delay(400);
      const reloaded = await snap(reloadMark);
      check(`${id}:reload-rereads-keeps-alert-and-bytes-zero-writes`, isDeepStrictEqual(reloaded.pane.recovery, blocks(lang, { [field]: "unavailable" })) && isDeepStrictEqual(reloaded.physical, raw)
        && mutations(reloaded.attempts).length === 0 && opsOn(reloaded.attempts, "get", KEY[field]).length >= 1 && reloaded.pane.statusLine.text === "", { recovery: reloaded.pane.recovery, physical: reloaded.physical, reads: opsOn(reloaded.attempts, "get", KEY[field]).length });
      record("observation", { id: `${id}:focus-after-reload`, focus: reloaded.focus });
      // A source-only state never holds a departure; returning shows the same alert with zero writes.
      const leaveMark = await mark();
      await sidebarClick(labels[lang].about, `${id}:sidebar-about`);
      const left = await waitUntil("verify.location().pathname === '/app/settings/about' && !document.querySelector('.settings-departure-dialog')", 4000);
      check(`${id}:departure-not-held`, left, { location: await evaluate("verify.location()") });
      await sidebarClick(labels[lang].appearance, `${id}:sidebar-appearance`);
      pre(`${id}:appearance-pane-mounted-again`, await waitUntil(`${READY_PANE} && verify.location().pathname === '/app/settings/appearance'`, 4000));
      await delay(400);
      const back = await snap(leaveMark);
      check(`${id}:same-alert-after-return-zero-writes`, isDeepStrictEqual(back.pane.recovery, blocks(lang, { [field]: "unavailable" })) && mutations(back.attempts).length === 0 && isDeepStrictEqual(back.physical, raw),
        { recovery: back.pane.recovery, mutations: brief(mutations(back.attempts)) });
    }
    // Unreadable bytes (a throwing getItem armed before any page script).
    {
      const id = `controls:source-unreadable:${field}`;
      const values = { ...VALID, [field]: UNREADABLE_VALUE[field] };
      await seed(seedsOf(values), id);
      const { identifier } = await cdp("Page.addScriptToEvaluateOnNewDocument", { source: `window.__nativeFaultPlan = { get: [${JSON.stringify(KEY[field])}] };` });
      await mountApp(id, { productCrash: true });
      await cdp("Page.removeScriptToEvaluateOnNewDocument", { identifier });
      const plan = await evaluate("({ plan: __native.planApplied, faults: __native.faultState(), denied: __native.window(0).attempts.filter((entry) => entry.op === 'get' && entry.outcome === 'denied').map((entry) => entry.key) })");
      pre(`${id}:read-fault-plan-applied-before-mount-and-fired`, isDeepStrictEqual(plan.plan, { get: [KEY[field]] }) && plan.faults.get.includes(KEY[field]) && plan.denied.includes(KEY[field]), { plan });
      const lang = field === "lang" ? "en" : values.lang;
      const shown = { ...values, [field]: DEFAULTS[field] };
      const raw = rawOf(values);
      await sourceOnlyChecks(id, field, lang, shown, raw);
      // Reload while the read still throws keeps the alert; after the fault is lifted, Reload repairs without a Saved claim.
      const stillMark = await mark();
      await clickButton(COPY[lang].reloadName(COPY[lang].label[field]));
      await delay(400);
      const still = await snap(stillMark);
      check(`${id}:reload-while-unreadable-keeps-alert-zero-writes`, isDeepStrictEqual(still.pane.recovery, blocks(lang, { [field]: "unavailable" })) && mutations(still.attempts).length === 0, { recovery: still.pane.recovery });
      await evaluate("__native.restore()");
      const repairMark = await mark();
      const repairedLang = field === "lang" ? values.lang : lang;
      await clickButton(COPY[lang].reloadName(COPY[lang].label[field]));
      const repaired = await waitUntil(`(() => { const pane = __native.pane(); return !!pane && pane.recovery.length === 0; })()`, 4000);
      await delay(300);
      const after = await snap(repairMark);
      check(`${id}:reload-repairs-without-saved-claim-zero-writes`, repaired && paneMatches(after.pane.values, values) && htmlMatches(after.html, values) && after.uiLang === repairedLang
        && after.pane.statusLine.text === "" && mutations(after.attempts).length === 0 && isDeepStrictEqual(after.physical, raw), { pane: after.pane.values, statusLine: after.pane.statusLine, mutations: brief(mutations(after.attempts)) });
    }
  }
  // ZH: six malformed keys at once (other §5 item 2 values), localized Reload-only alerts.
  {
    const id = "controls:source-invalid:zh-six-at-once";
    const raw = { [KEY.lang]: '"zh"', [KEY.theme]: '"Dark"', [KEY.density]: "compact", [KEY.fontScale]: "0.5", [KEY.accentHue]: "abc", [KEY.railPos]: "Left", [KEY.bgTone]: "neon" };
    await seed({ [MARKER_KEY]: MARKER, ...raw }, id);
    await mountApp(id, { productCrash: true });
    const now = await snap(0);
    const shown = { ...DEFAULTS, lang: "zh" };
    check(`${id}:six-localized-reload-only-alerts`, isDeepStrictEqual(now.pane.recovery, blocks("zh", Object.fromEntries(RESET_FIELDS.map((field) => [field, "unavailable"])))), { recovery: now.pane.recovery });
    check(`${id}:defaults-displayed-and-applied-no-throw`, paneMatches(now.pane.values, shown) && htmlMatches(now.html, shown) && now.topbar.summary === summaryFor(shown) && now.routeError === null, { pane: now.pane.values, html: now.html });
    check(`${id}:mount-never-rewrites`, sevenMutations(now.attempts).length === 0 && isDeepStrictEqual(now.physical, raw) && isDeepStrictEqual(await devtoolsBytes(), raw), { physical: now.physical });
    check(`${id}:no-draft-no-export-no-status-no-warning`, now.pane.exportButton === null && now.pane.discardAll === null && now.pane.retryAll.ariaDisabled === "true" && now.pane.statusLine.text === "" && now.topbar.status === null && (await warn()).warned === false, { pane: now.pane });
  }
  // A valid edit over a malformed source is a failed draft that never overwrites the bytes.
  {
    const id = "controls:source-invalid:edit-over-malformed-railPos";
    const others = { ...VALID };
    delete others.railPos;
    const raw = { ...rawOf(others), [KEY.railPos]: "diagonal" };
    await seed({ ...seedsOf(others), [KEY.railPos]: "diagonal" }, id);
    await mountApp(id, { productCrash: true });
    const since = await mark();
    await clickPaneValue("railPos", "top", `${id}:rail-top`);
    const failed = await waitUntil(`JSON.stringify(__native.pane()?.recovery) === ${JSON.stringify(JSON.stringify(blocks("en", { railPos: "not-saved" })))}`, 5000);
    await delay(300);
    const now = await snap(since);
    const warning = await warn();
    check(`${id}:failed-draft-with-retry-discard-export-status-warning`, failed && draftPane(now.pane, "en", COPY.en.count(1), true) && topbarStatusShown(now.topbar, "en") && warning.warned === true, { pane: now.pane, status: now.topbar.status, warning });
    check(`${id}:edit-displayed-and-applied`, now.pane.values.railPos === "top" && now.html.railPos === "top" && now.html.appRailPos === "top", { values: now.pane.values, html: now.html });
    check(`${id}:malformed-bytes-never-overwritten`, isDeepStrictEqual(now.physical, raw) && sevenMutations(now.attempts).length === 0, { physical: now.physical, attempts: brief(sevenMutations(now.attempts)) });
    const retryMark = await mark();
    await clickButton(COPY.en.retryName(COPY.en.label.railPos));
    await delay(500);
    const retried = await snap(retryMark);
    check(`${id}:retry-refused-again-kept-never-overwrites`, isDeepStrictEqual(retried.pane.recovery, blocks("en", { railPos: "not-saved" })) && sevenMutations(retried.attempts).length === 0 && isDeepStrictEqual(retried.physical, raw), { recovery: retried.pane.recovery, attempts: brief(sevenMutations(retried.attempts)) });
    const discardMark = await mark();
    await clickButton(COPY.en.discardName(COPY.en.label.railPos));
    const back = await waitUntil(`JSON.stringify(__native.pane()?.recovery) === ${JSON.stringify(JSON.stringify(blocks("en", { railPos: "unavailable" })))}`, 4000);
    await delay(300);
    const discarded = await snap(discardMark);
    const discardWarning = await warn();
    check(`${id}:discard-returns-to-reload-only-zero-writes`, back && mutations(discarded.attempts).length === 0 && isDeepStrictEqual(discarded.physical, raw) && discarded.pane.exportButton === null && discarded.topbar.status === null
      && discardWarning.warned === false && discarded.html.railPos === "left", { recovery: discarded.pane.recovery, html: discarded.html, warning: discardWarning });
  }

  // ---- Natively held per-key Web Lock (a root key and a registered key) ------------------------------
  const BASE = { lang: "en", theme: "light", density: "comfortable", accentHue: 165, bgTone: "default", railPos: "left", fontScale: 1 };
  for (const [field, value] of [["theme", "dark"], ["railPos", "right"]]) {
    const id = `controls:held-lock:${field}`;
    await seed(seedsOf(BASE), id);
    await mountApp(id);
    const name = LOCK_OF(field);
    const holder = await evaluate(`__native.hold(${JSON.stringify(name)})`);
    const heldBefore = await evaluate("__native.lockQuery()");
    pre(`${id}:fixture-holds-the-real-lock`, holder === name && heldBefore.held.includes(name), { heldBefore });
    const since = await mark();
    await clickPaneValue(field, value, `${id}:edit`);
    const pending = await waitUntil(`JSON.stringify(__native.pane()?.recovery) === ${JSON.stringify(JSON.stringify(blocks("en", { [field]: "saving" })))}`, 4000);
    await delay(900);
    const during = await snap(since);
    const locksDuring = await evaluate("__native.lockQuery()");
    const dtDuring = await devtoolsBytes();
    const warning = await warn();
    const shownNew = { ...BASE, [field]: value };
    check(`${id}:pending-shown-no-saved-claim-retry-all-disabled-no-topbar-status`, pending && draftPane(during.pane, "en", "", false) && during.topbar.status === null, { pane: during.pane, status: during.topbar.status });
    check(`${id}:latest-choice-displayed-and-applied-while-held`, paneMatches(during.pane.values, shownNew) && htmlMatches(during.html, shownNew) && during.topbar.summary === summaryFor(shownNew), { pane: during.pane.values, html: during.html });
    check(`${id}:controls-stay-enabled`, await evaluate(`[...document.querySelectorAll(${JSON.stringify(`${PANE} [data-appearance-control="${field}"] button`)})].every((b) => !b.disabled && b.getAttribute("aria-disabled") !== "true")`), {});
    check(`${id}:bytes-unchanged-zero-writes-while-held`, isDeepStrictEqual(during.physical, rawOf(BASE)) && isDeepStrictEqual(dtDuring, rawOf(BASE)) && sevenMutations(during.attempts).length === 0, { physical: during.physical, attempts: brief(sevenMutations(during.attempts)) });
    check(`${id}:engine-waits-on-the-real-lock`, locksDuring.held.includes(name) && locksDuring.pending.includes(name) && appLocks(during.locks).filter((lock) => lock === name).length === 1, { locksDuring, appLocks: appLocks(during.locks) });
    check(`${id}:beforeunload-warns-while-pending`, warning.warned === true && warning.attempts === 0, warning);
    const retryMark = await mark();
    await clickButton(COPY.en.retryName(COPY.en.label[field]));
    await delay(400);
    const afterRetry = await snap(retryMark);
    check(`${id}:per-field-retry-while-pending-is-inert`, afterRetry.attempts.filter((entry) => isSeven(entry.key)).length === 0 && appLocks(afterRetry.locks).length === 0 && isDeepStrictEqual(afterRetry.pane.recovery, blocks("en", { [field]: "saving" })), { attempts: summarize(afterRetry.attempts), locks: afterRetry.locks });
    await evaluate(`__native.release(${JSON.stringify(name)})`);
    const persisted = await waitUntil(`__native.native.get(${JSON.stringify(KEY[field])}) === ${JSON.stringify(ENC[field](value))} && __native.pane().statusLine.text === ${JSON.stringify(COPY.en.saved)} && __native.pane().recovery.length === 0`, 6000);
    await delay(250);
    const after = await snap(since);
    const sets = opsOn(after.attempts, "set", KEY[field]);
    check(`${id}:exactly-one-write-after-release`, persisted && sets.length === 1 && sets[0].value === ENC[field](value) && sets[0].outcome === "ok" && sevenMutations(after.attempts).length === 1 && (await devtoolsBytes())[KEY[field]] === ENC[field](value), { sets: brief(sets), all: brief(sevenMutations(after.attempts)) });
    check(`${id}:saved-after-release-clean`, cleanPane(after.pane, "en", COPY.en.saved) && (await warn()).warned === false, { pane: after.pane });
  }

  // ---- Readback uncertainty: Retry reconciles with exactly one total write ----------------------------
  for (const [field, value] of [["density", "compact"], ["accentHue", 230]]) {
    const id = `controls:uncertainty:${field}`;
    await seed(seedsOf(BASE), id);
    await mountApp(id);
    await evaluate(`__native.uncertainSet(${JSON.stringify(KEY[field])})`);
    pre(`${id}:fault-armed`, (await evaluate("__native.faultState()")).readbackOnNextSet.includes(KEY[field]));
    const since = await mark();
    await clickPaneValue(field, value, `${id}:edit`);
    const failed = await waitUntil(`JSON.stringify(__native.pane()?.recovery) === ${JSON.stringify(JSON.stringify(blocks("en", { [field]: "not-saved" })))}`, 5000);
    await delay(300);
    const first = await snap(since);
    const sets = opsOn(first.attempts, "set", KEY[field]);
    const denied = first.attempts.filter((entry) => entry.op === "get" && entry.key === KEY[field] && entry.outcome === "readback-denied");
    pre(`${id}:readback-fault-fired-after-the-write`, sets.length === 1 && sets[0].outcome === "ok" && sets[0].value === ENC[field](value) && denied.length === 1 && denied[0].seq > sets[0].seq, { sets: brief(sets), denied: brief(denied) });
    const warning = await warn();
    const shownNew = { ...BASE, [field]: value };
    check(`${id}:uncertain-failure-shown-latest-kept-no-false-saved`, failed && draftPane(first.pane, "en", COPY.en.count(1), true) && paneMatches(first.pane.values, shownNew) && first.physical[KEY[field]] === ENC[field](value)
      && topbarStatusShown(first.topbar, "en") && warning.warned === true, { pane: first.pane, physical: first.physical, status: first.topbar.status });
    await clickButton(COPY.en.retryName(COPY.en.label[field]));
    const reconciled = await waitUntil(`__native.pane().recovery.length === 0 && __native.pane().statusLine.text === ${JSON.stringify(COPY.en.saved)}`, 5000);
    await delay(250);
    const after = await snap(since);
    const total = opsOn(after.attempts, "set", KEY[field]);
    check(`${id}:retry-reconciles-with-exactly-one-total-write`, reconciled && total.length === 1 && sevenMutations(after.attempts).length === 1 && after.physical[KEY[field]] === ENC[field](value) && (await devtoolsBytes())[KEY[field]] === ENC[field](value),
      { sets: brief(total), all: brief(sevenMutations(after.attempts)), status: after.pane.statusLine });
    check(`${id}:saved-clean-no-topbar-status-no-warning`, cleanPane(after.pane, "en", COPY.en.saved) && after.topbar.status === null && (await warn()).warned === false, { pane: after.pane });
  }

  // ---- Second-document conflicts: external bytes are preserved, never overwritten -------------------
  const CONFLICTS = [
    { name: "theme-restores-baseline", field: "theme", value: "dark", fault: "uncertain", external: `localStorage.setItem("xai_pref_theme", JSON.stringify("light")); localStorage.getItem("xai_pref_theme")`, externalRaw: '"light"', after: { theme: "light" } },
    { name: "railPos-removed", field: "railPos", value: "right", fault: "deny", external: `localStorage.removeItem("xai_rail_pos"); localStorage.getItem("xai_rail_pos")`, externalRaw: null, after: { railPos: "left" }, baseline: { railPos: "top" } },
    { name: "accentHue-replaced", field: "accentHue", value: 295, fault: "deny", external: `localStorage.setItem("xai_accent_hue", "35"); localStorage.getItem("xai_accent_hue")`, externalRaw: "35", after: { accentHue: 35 }, baseline: { accentHue: 230 } },
  ];
  for (const conflict of CONFLICTS) {
    const id = `controls:second-document-conflict:${conflict.name}`;
    const baseline = { ...BASE, ...(conflict.baseline ?? {}) };
    await seed(seedsOf(baseline), id);
    await mountApp(id);
    if (conflict.fault === "uncertain") await evaluate(`__native.uncertainSet(${JSON.stringify(KEY[conflict.field])})`);
    else await evaluate(`__native.denySet(${JSON.stringify(KEY[conflict.field])})`);
    const since = await mark();
    await clickPaneValue(conflict.field, conflict.value, `${id}:edit`);
    const failed = await waitUntil(`JSON.stringify(__native.pane()?.recovery) === ${JSON.stringify(JSON.stringify(blocks("en", { [conflict.field]: "not-saved" })))}`, 5000);
    await delay(300);
    const first = await snap(since);
    const firstSets = opsOn(first.attempts, "set", KEY[conflict.field]);
    pre(`${id}:fault-fired`, firstSets.length === 1 && (conflict.fault === "uncertain"
      ? firstSets[0].outcome === "ok" && first.attempts.some((entry) => entry.key === KEY[conflict.field] && entry.outcome === "readback-denied")
      : firstSets[0].outcome === "denied"), { firstSets: brief(firstSets) });
    check(`${id}:failed-draft-latest-choice-kept`, failed && first.pane.values[conflict.field] === conflict.value && topbarStatusShown(first.topbar, "en"), { recovery: first.pane.recovery, values: first.pane.values });
    const external = await secondDocument(conflict.external, id);
    pre(`${id}:second-document-wrote`, external.value === conflict.externalRaw, external);
    record("second-document-write", { id, key: KEY[conflict.field], result: conflict.externalRaw, targetId: external.targetId });
    await delay(500);
    const delivered = await snap(since);
    check(`${id}:native-keyed-trusted-storage-event-delivered`, delivered.received.some((entry) => entry.key === KEY[conflict.field] && entry.trusted && entry.newValue === conflict.externalRaw) && delivered.received.every((entry) => entry.key !== null)
      && storageDispatches(delivered.dispatches).length === 0, { received: delivered.received, dispatches: delivered.dispatches.slice(0, 4) });
    await evaluate("__native.restore()");
    const retryMark = await mark();
    await clickButton(COPY.en.retryName(COPY.en.label[conflict.field]));
    await delay(800);
    const afterRetry = await snap(retryMark);
    const dtRetry = await devtoolsBytes();
    const warning = await warn();
    check(`${id}:external-bytes-preserved-retry-never-overwrites`, afterRetry.physical[KEY[conflict.field]] === conflict.externalRaw && dtRetry[KEY[conflict.field]] === conflict.externalRaw && sevenMutations(afterRetry.attempts).length === 0,
      { physical: afterRetry.physical, devtools: dtRetry, mutations: brief(sevenMutations(afterRetry.attempts)) });
    check(`${id}:conflict-kept-latest-choice-displayed-no-saved`, isDeepStrictEqual(afterRetry.pane.recovery, blocks("en", { [conflict.field]: "not-saved" })) && afterRetry.pane.values[conflict.field] === conflict.value
      && afterRetry.pane.statusLine.text === COPY.en.count(1) && topbarStatusShown(afterRetry.topbar, "en") && warning.warned === true, { pane: afterRetry.pane, warning });
    const repeatMark = await mark();
    await clickButton(COPY.en.retryName(COPY.en.label[conflict.field]));
    await delay(800);
    const repeat = await snap(repeatMark);
    check(`${id}:repeated-retry-never-overwrites`, repeat.physical[KEY[conflict.field]] === conflict.externalRaw && sevenMutations(repeat.attempts).length === 0 && isDeepStrictEqual(repeat.pane.recovery, blocks("en", { [conflict.field]: "not-saved" })),
      { physical: repeat.physical, mutations: brief(sevenMutations(repeat.attempts)) });
    const discardMark = await mark();
    await clickButton(COPY.en.discardName(COPY.en.label[conflict.field]));
    const discarded = await waitUntil("__native.pane().recovery.length === 0", 4000);
    await delay(300);
    const final = await snap(discardMark);
    const shownExternal = { ...baseline, ...conflict.after };
    const finalWarning = await warn();
    check(`${id}:discard-zero-writes-shows-external-value`, discarded && mutations(final.attempts).length === 0 && paneMatches(final.pane.values, shownExternal) && htmlMatches(final.html, shownExternal)
      && final.physical[KEY[conflict.field]] === conflict.externalRaw && final.topbar.status === null && finalWarning.warned === false && final.pane.exportButton === null,
      { values: final.pane.values, html: final.html, physical: final.physical, warning: finalWarning });
    check(`${id}:discard-rereads-only-that-field`, final.attempts.filter((entry) => entry.op === "get" && isSeven(entry.key)).every((entry) => entry.key === KEY[conflict.field]), { reads: brief(final.attempts.filter((entry) => entry.op === "get")) });
    record("observation", { id: `${id}:status-line-after-discard`, statusLine: final.pane.statusLine });
  }
  record("controls-sameness-summary", { surfaces: "pane and Topbar (language, theme, density)", ...sameness });
}

/** Shared source-only assertions (contract §5 item 2, A6). */
async function sourceOnlyChecks(id, field, lang, shown, raw) {
  const now = await snap(0);
  const dt = await devtoolsBytes();
  check(`${id}:reload-only-alert`, isDeepStrictEqual(now.pane.recovery, blocks(lang, { [field]: "unavailable" })), { recovery: now.pane.recovery });
  check(`${id}:default-displayed-and-applied-others-unaffected`, paneMatches(now.pane.values, shown) && htmlMatches(now.html, shown) && now.topbar.summary === summaryFor(shown) && now.uiLang === shown.lang,
    { pane: now.pane.values, html: now.html, summary: now.topbar.summary, expected: shown });
  check(`${id}:no-throw-no-route-error`, now.routeError === null && runtimeErrors.length === 0, { routeError: now.routeError, runtimeErrors: runtimeErrors.slice(0, 3) });
  check(`${id}:mount-never-rewrites-purges-or-normalizes`, sevenMutations(now.attempts).length === 0 && isDeepStrictEqual(now.physical, raw) && isDeepStrictEqual(dt, raw), { physical: now.physical, devtools: dt, expected: raw });
  const warning = await warn();
  check(`${id}:no-draft-no-export-no-saved-claim-no-topbar-status-no-warning`, now.pane.exportButton === null && now.pane.discardAll === null && now.pane.retryAll.ariaDisabled === "true" && now.pane.retryAll.describedBy === null
    && now.pane.statusLine.text === "" && now.topbar.status === null && warning.warned === false && warning.attempts === 0 && !now.pane.oldFooter, { pane: now.pane, status: now.topbar.status, warning });
}

// ---------------------------------------------------------------------------------------------------
// E10: Reset to defaults (production App composition)
// ---------------------------------------------------------------------------------------------------
async function runReset() {
  const UNRELATED = {
    xai_pref_features_habits: "false",
    xai_pet_id: "pip",
    xai_pet_pos: JSON.stringify({ x: 1150, y: 700 }),
    xai_rail_order: JSON.stringify(["calendar", "tasks", "board", "dashboard", "matrix", "pomodoro", "timetrack", "habits", "meditation", "countdown", "ai", "statistics"]),
    xai_pref_sticky_color: "mint",
    xai_native_unrelated_probe: "keep",
  };
  const STORED = { lang: "en", theme: "dark", density: "compact", accentHue: 230, bgTone: "mist", railPos: "right", fontScale: 1.1 };
  const totals = { scenarios: 0, storageDispatches: 0, prefChanged: 0, keyNullReceived: 0, relocks: 0, scopeTransitions: 0, gateInsertions: 0, watchedRemovals: 0, replacedNodes: 0, restoredFramesWithWork: 0 };

  async function scenario(name, stored, act) {
    const lang = stored.lang ?? "en";
    await seed(seedsOf(stored, UNRELATED), `reset:${name}:seed`);
    await mountApp(`reset:${name}:mount`);
    await freshLoadCheck(`reset:${name}:mount`, stored, { popover: false });
    const unrelatedBefore = await nonSevenSnapshot();
    const marked = await evaluate("__native.markElements()");
    pre(`reset:${name}:host-elements-marked`, ["app", "topbar", "rail", "pet", "settingsShell", "sidebar", "detail", "pane"].every((part) => marked.includes(part)), { marked });
    await evaluate("__native.startDom() && __native.startFrames()");
    const since = await mark();
    await act(since, lang);
    await delay(300);
    const frames = await stopFrames();
    const dom = await evaluate("__native.stopDom()");
    const fates = await evaluate("__native.elementFates()");
    const tail = await snap(since);
    const scopeAfter = await evaluate(`verify.scopeAfter(${since})`);
    const unrelatedAfter = await nonSevenSnapshot();
    const gateInsertions = dom.filter((entry) => entry.kind === "added" && entry.what.includes("gate")).length;
    const watchedRemovals = dom.filter((entry) => entry.kind === "removed").length;
    const replaced = Object.entries(fates).filter(([, fate]) => fate.marked && !fate.sameNode).map(([part]) => part);
    const restoredText = COPY[lang].restored;
    const restoredFrames = frames.filter((frame) => frame.statusLine === restoredText);
    const restoredWithWork = restoredFrames.filter((frame) => frame.recoveryBlocks !== 0 || frame.retryAllDisabled !== true || frame.topbarStatus);
    totals.scenarios += 1;
    totals.storageDispatches += storageDispatches(tail.dispatches).length;
    totals.prefChanged += prefChangedEvents(tail.dispatches).length;
    totals.keyNullReceived += tail.received.filter((entry) => entry.key === null).length;
    totals.relocks += scopeAfter.filter((entry) => entry.kind === "locked").length;
    totals.scopeTransitions += scopeAfter.length;
    totals.gateInsertions += gateInsertions;
    totals.watchedRemovals += watchedRemovals;
    totals.replacedNodes += replaced.length;
    totals.restoredFramesWithWork += restoredWithWork.length;
    check(`reset:${name}:zero-storage-event-and-preference-broadcast`, storageDispatches(tail.dispatches).length === 0 && prefChangedEvents(tail.dispatches).length === 0 && tail.received.every((entry) => entry.key !== null), { dispatches: tail.dispatches.slice(0, 6), received: tail.received.slice(0, 6) });
    check(`reset:${name}:no-account-relock-or-scope-transition`, scopeAfter.length === 0 && tail.scope.kind === "account" && tail.scope.accountId === OWNER, { scopeAfter, scope: tail.scope });
    check(`reset:${name}:no-host-remount-no-gate-screen`, gateInsertions === 0 && watchedRemovals === 0 && replaced.length === 0, { dom: dom.slice(0, 8), replaced });
    check(`reset:${name}:unrelated-key-snapshot-unchanged`, isDeepStrictEqual(unrelatedAfter, unrelatedBefore) && Object.entries(UNRELATED).every(([key, value]) => unrelatedAfter[key] === value), { before: unrelatedBefore, after: unrelatedAfter });
    check(`reset:${name}:language-bytes-unchanged-never-written`, tail.physical[KEY.lang] === (stored.lang === undefined ? null : ENC.lang(stored.lang)) && mutations(tail.attempts).filter((entry) => entry.key === KEY.lang).length === 0, { lang: tail.physical[KEY.lang], langMutations: brief(mutations(tail.attempts).filter((entry) => entry.key === KEY.lang)) });
    check(`reset:${name}:defaults-restored-never-shown-with-unresolved-work`, restoredWithWork.length === 0, { frames: frames.length, restoredFrames: restoredFrames.length, offending: restoredWithWork.slice(0, 3) });
    check(`reset:${name}:never-writes`, tail.attempts.filter((entry) => entry.op === "set" && isSeven(entry.key)).length === 0, { writes: brief(tail.attempts.filter((entry) => entry.op === "set")) });
    record("observation", { id: `reset:${name}:integrity`, renderedFrames: frames.length, restoredFrames: restoredFrames.length, focus: tail.focus, langReadsInScenario: opsOn(tail.attempts, "get", KEY.lang).length, globalAttempts: summarize(tail.attempts) });
  }
  async function clickReset(accept, label, lang) {
    const names = await evaluate(`[...document.querySelectorAll(${JSON.stringify(`${PANE} [data-testid="appearance-reset-defaults"]`)})].map((button) => button.textContent.trim())`);
    pre(`${label}:reset-control-by-testid-and-name`, isDeepStrictEqual(names, [COPY[lang].reset]), { names });
    const before = dialogs.length;
    dialogPlan.push({ accept });
    const point = await trustedClick(`${PANE} [data-testid="appearance-reset-defaults"]`, `${label}:reset`);
    const opened = await waitFor(() => dialogs.length > before, 6000);
    if (!opened) dialogPlan.length = 0;
    return { point, opened, dialogs: dialogs.slice(before) };
  }
  const confirmed = (id, run, accepted, lang) => {
    check(`${id}:normative-confirmation-asked-once`, run.opened && run.dialogs.length === 1 && run.dialogs[0].type === "confirm" && run.dialogs[0].message === COPY[lang].confirmReset && run.dialogs[0].accepted === accepted, { dialogs: run.dialogs });
  };
  const absentExpr = (keys) => keys.map((key) => `__native.native.get(${JSON.stringify(key)}) === null`).join(" && ");
  const recoveryExpr = (expected) => `JSON.stringify(__native.pane()?.recovery) === ${JSON.stringify(JSON.stringify(expected))}`;
  const statusExpr = (text) => `__native.pane()?.statusLine.text === ${JSON.stringify(text)}`;
  /** The six fields return to their defaults (pane, <html>, Topbar); the language stays. */
  const defaultsShown = (now, lang) => {
    const shown = { ...DEFAULTS, lang };
    return paneMatches(now.pane.values, shown) && htmlMatches(now.html, shown) && now.topbar.summary === summaryFor(shown) && now.uiLang === lang;
  };
  const sixLocksOnly = (locks, fields = RESET_FIELDS) => fields.every((field) => locks.includes(LOCK_OF(field))) && !locks.includes(LOCK_OF("lang")) && accountLocks(locks).length === 0;

  // ---- R0 declined: zero attempts from activation to the confirm return; no state change ---------------
  await scenario("r0-declined", STORED, async (since, lang) => {
    const id = "reset:r0-declined";
    const run = await clickReset(false, id, lang);
    await delay(600);
    const after = await snap(since);
    confirmed(id, run, false, lang);
    const click = after.events.find((event) => event.type === "click" && event.trusted && event.target.testid === "appearance-reset-defaults");
    const returned = after.confirm.find((entry) => entry.phase === "return");
    pre(`${id}:activation-and-confirm-return-traced`, click && returned && returned.seq > click.seq && returned.result === false, { click, confirm: after.confirm });
    const activation = after.attempts.filter((entry) => entry.seq > click.seq && entry.seq <= returned.seq);
    check(`${id}:zero-get-set-remove-from-activation-to-return`, activation.length === 0, { activation: brief(activation) });
    check(`${id}:zero-attempts-on-the-seven-keys-in-the-whole-window`, after.attempts.filter((entry) => isSeven(entry.key)).length === 0, { seven: brief(after.attempts.filter((entry) => isSeven(entry.key))), global: summarize(after.attempts) });
    const warning = await warn();
    check(`${id}:no-state-change`, cleanPane(after.pane, lang, "") && paneMatches(after.pane.values, shownOf(STORED)) && htmlMatches(after.html, shownOf(STORED)) && isDeepStrictEqual(after.physical, rawOf(STORED))
      && after.topbar.status === null && warning.warned === false, { pane: after.pane, physical: after.physical, warning });
    record("observation", { id: `${id}:focus`, focus: after.focus });
  });

  // ---- R1 accepted (EN): six verified absences, language bytes unchanged, never a write ----------------
  await scenario("r1-accepted-en", STORED, async (since, lang) => {
    const id = "reset:r1-accepted-en";
    const run = await clickReset(true, id, lang);
    const done = await waitUntil(`${absentExpr(SIX)} && ${statusExpr(COPY[lang].restored)} && __native.pane().recovery.length === 0`, 8000);
    const activationEnd = await mark();
    await delay(300);
    const after = await snap(since);
    const dt = await devtoolsBytes();
    confirmed(id, run, true, lang);
    const removes = after.attempts.filter((entry) => entry.op === "remove");
    const window = after.attempts.filter((entry) => entry.seq <= activationEnd);
    check(`${id}:six-verified-removes`, done && removes.length === 6 && isDeepStrictEqual([...new Set(removes.map((entry) => entry.key))].sort(), [...SIX].sort()) && removes.every((entry) => entry.outcome === "ok"), { removes: brief(removes) });
    check(`${id}:six-keys-absent-language-bytes-unchanged`, SIX.every((key) => after.physical[key] === null && dt[key] === null) && after.physical[KEY.lang] === '"en"' && dt[KEY.lang] === '"en"', { physical: after.physical, devtools: dt });
    check(`${id}:reset-never-reads-writes-or-removes-language`, window.filter((entry) => entry.key === KEY.lang).length === 0, { langAttempts: brief(window.filter((entry) => entry.key === KEY.lang)) });
    const warning = await warn();
    check(`${id}:defaults-displayed-applied-and-truthful-defaults-restored`, defaultsShown(after, lang) && cleanPane(after.pane, lang, COPY[lang].restored) && after.topbar.status === null && warning.warned === false, { pane: after.pane, html: after.html, summary: after.topbar.summary, warning });
    check(`${id}:device-key-locks-only-no-account-machinery`, sixLocksOnly(appLocks(after.locks)) && accountMutations(after.attempts).length === 0, { appLocks: appLocks(after.locks) });
    record("observation", { id: `${id}:focus-after-accepted-reset`, focus: after.focus });
  });

  // ---- R1 accepted (ZH): one key already absent = verified no-op; ZH confirmation and status ----------
  {
    const storedZh = { ...STORED, lang: "zh" };
    delete storedZh.fontScale;
    await scenario("r1-accepted-zh-one-absent", storedZh, async (since, lang) => {
      const id = "reset:r1-accepted-zh-one-absent";
      const run = await clickReset(true, id, lang);
      const done = await waitUntil(`${absentExpr(SIX)} && ${statusExpr(COPY[lang].restored)} && __native.pane().recovery.length === 0`, 8000);
      const activationEnd = await mark();
      await delay(300);
      const after = await snap(since);
      confirmed(id, run, true, lang);
      const removes = after.attempts.filter((entry) => entry.op === "remove");
      const present = SIX.filter((key) => key !== KEY.fontScale);
      check(`${id}:five-verified-removes-and-one-verified-no-op`, done && removes.length === 5 && isDeepStrictEqual([...new Set(removes.map((entry) => entry.key))].sort(), [...present].sort()) && removes.every((entry) => entry.outcome === "ok")
        && opsOn(after.attempts, "remove", KEY.fontScale).length === 0, { removes: brief(removes) });
      check(`${id}:six-keys-absent-language-bytes-unchanged`, SIX.every((key) => after.physical[key] === null) && after.physical[KEY.lang] === '"zh"', { physical: after.physical });
      check(`${id}:reset-never-reads-writes-or-removes-language`, after.attempts.filter((entry) => entry.seq <= activationEnd && entry.key === KEY.lang).length === 0, {});
      check(`${id}:defaults-displayed-and-zh-defaults-restored`, defaultsShown(after, lang) && cleanPane(after.pane, lang, COPY[lang].restored) && after.topbar.status === null && (await warn()).warned === false, { pane: after.pane });
    });
  }

  // ---- R2 one-key removeItem fault (accent): per-field result, targeted Retry ---------------------------
  await scenario("r2-one-key-fault", STORED, async (since, lang) => {
    const id = "reset:r2-one-key-fault";
    await evaluate(`__native.denyRemove(${JSON.stringify(KEY.accentHue)})`);
    const run = await clickReset(true, id, lang);
    const partial = await waitUntil(`${recoveryExpr(blocks(lang, { accentHue: "not-reset" }))} && ${absentExpr(SIX.filter((key) => key !== KEY.accentHue))}`, 8000);
    await delay(300);
    const after = await snap(since);
    confirmed(id, run, true, lang);
    const removes = after.attempts.filter((entry) => entry.op === "remove");
    pre(`${id}:fault-armed-and-fired`, opsOn(after.attempts, "remove", KEY.accentHue).some((entry) => entry.outcome === "denied"), { removes: brief(removes) });
    const warning = await warn();
    check(`${id}:per-field-result-reset-draft-for-accent-only`, partial && isDeepStrictEqual(after.pane.recovery, blocks(lang, { accentHue: "not-reset" })) && after.pane.values.accentHue === 165 && after.html.accentHue === "165" && after.physical[KEY.accentHue] === "230",
      { recovery: after.pane.recovery, values: after.pane.values, physical: after.physical });
    check(`${id}:other-five-removed`, removes.length === 6 && removes.filter((entry) => entry.outcome === "ok").length === 5 && SIX.filter((key) => key !== KEY.accentHue).every((key) => after.physical[key] === null), { removes: brief(removes) });
    check(`${id}:no-defaults-restored-while-unresolved`, draftPane(after.pane, lang, COPY[lang].count(1), true) && topbarStatusShown(after.topbar, lang) && warning.warned === true, { pane: after.pane, status: after.topbar.status, warning });
    const repeatMark = await mark();
    await clickButton(COPY[lang].retryName(COPY[lang].label.accentHue));
    await delay(500);
    const repeat = await snap(repeatMark);
    const repeatRemoves = repeat.attempts.filter((entry) => entry.op === "remove");
    check(`${id}:refused-retry-targets-only-accent`, repeatRemoves.length === 1 && repeatRemoves[0].key === KEY.accentHue && repeatRemoves[0].outcome === "denied" && sevenMutations(repeat.attempts).length === 1
      && isDeepStrictEqual(repeat.pane.recovery, blocks(lang, { accentHue: "not-reset" })) && repeat.pane.statusLine.text === COPY[lang].count(1), { removes: brief(repeatRemoves), recovery: repeat.pane.recovery });
    await evaluate("__native.restore()");
    const retryMark = await mark();
    await clickButton(COPY[lang].retryName(COPY[lang].label.accentHue));
    const restored = await waitUntil(`${statusExpr(COPY[lang].restored)} && __native.pane().recovery.length === 0`, 6000);
    await delay(250);
    const final = await snap(retryMark);
    const finalRemoves = final.attempts.filter((entry) => entry.op === "remove");
    check(`${id}:targeted-retry-one-remove-successful-fields-not-removed-again`, restored && finalRemoves.length === 1 && finalRemoves[0].key === KEY.accentHue && finalRemoves[0].outcome === "ok" && sevenMutations(final.attempts).length === 1, { removes: brief(finalRemoves) });
    check(`${id}:defaults-restored-only-after-every-field`, cleanPane(final.pane, lang, COPY[lang].restored) && SIX.every((key) => final.physical[key] === null) && defaultsShown(final, lang) && final.topbar.status === null && (await warn()).warned === false, { pane: final.pane, physical: final.physical });
  });

  // ---- R3 two-key removeItem faults (theme, railPos): independent targeted Retry -----------------------
  await scenario("r3-two-key-fault", STORED, async (since, lang) => {
    const id = "reset:r3-two-key-fault";
    await evaluate(`__native.denyRemove(${JSON.stringify([KEY.theme, KEY.railPos])})`);
    const run = await clickReset(true, id, lang);
    const partial = await waitUntil(`${recoveryExpr(blocks(lang, { theme: "not-reset", railPos: "not-reset" }))} && ${absentExpr(SIX.filter((key) => key !== KEY.theme && key !== KEY.railPos))}`, 8000);
    await delay(300);
    const after = await snap(since);
    confirmed(id, run, true, lang);
    const removes = after.attempts.filter((entry) => entry.op === "remove");
    pre(`${id}:faults-armed-and-fired`, opsOn(after.attempts, "remove", KEY.theme).some((entry) => entry.outcome === "denied") && opsOn(after.attempts, "remove", KEY.railPos).some((entry) => entry.outcome === "denied"), { removes: brief(removes) });
    check(`${id}:two-per-field-results-four-removed`, partial && removes.length === 6 && removes.filter((entry) => entry.outcome === "ok").length === 4 && after.physical[KEY.theme] === '"dark"' && after.physical[KEY.railPos] === "right"
      && after.html.theme === "light" && after.html.railPos === "left", { recovery: after.pane.recovery, removes: brief(removes), physical: after.physical });
    check(`${id}:no-defaults-restored-two-unresolved`, draftPane(after.pane, lang, COPY[lang].count(2), true) && topbarStatusShown(after.topbar, lang), { pane: after.pane });
    await evaluate(`__native.restore(); __native.denyRemove(${JSON.stringify(KEY.railPos)})`);
    const themeMark = await mark();
    await clickButton(COPY[lang].retryName(COPY[lang].label.theme));
    const oneLeft = await waitUntil(`${recoveryExpr(blocks(lang, { railPos: "not-reset" }))} && __native.native.get(${JSON.stringify(KEY.theme)}) === null`, 6000);
    await delay(300);
    const afterTheme = await snap(themeMark);
    const themeRemoves = afterTheme.attempts.filter((entry) => entry.op === "remove");
    check(`${id}:retry-theme-one-remove-sidebar-still-unresolved`, oneLeft && themeRemoves.length === 1 && themeRemoves[0].key === KEY.theme && themeRemoves[0].outcome === "ok" && afterTheme.physical[KEY.railPos] === "right"
      && draftPane(afterTheme.pane, lang, COPY[lang].count(1), true) && (await warn()).warned === true, { removes: brief(themeRemoves), pane: afterTheme.pane });
    await evaluate("__native.restore()");
    const railMark = await mark();
    await clickButton(COPY[lang].retryName(COPY[lang].label.railPos));
    const restored = await waitUntil(`${statusExpr(COPY[lang].restored)} && __native.pane().recovery.length === 0`, 6000);
    await delay(250);
    const final = await snap(railMark);
    const finalRemoves = final.attempts.filter((entry) => entry.op === "remove");
    check(`${id}:retry-sidebar-one-remove-then-defaults-restored`, restored && finalRemoves.length === 1 && finalRemoves[0].key === KEY.railPos && finalRemoves[0].outcome === "ok" && SIX.every((key) => final.physical[key] === null)
      && cleanPane(final.pane, lang, COPY[lang].restored) && defaultsShown(final, lang), { removes: brief(finalRemoves), pane: final.pane });
  });

  // ---- R4 readback uncertainty after a successful remove (density): exactly one remove -----------------
  await scenario("r4-uncertainty", STORED, async (since, lang) => {
    const id = "reset:r4-uncertainty";
    await evaluate(`__native.uncertainRemove(${JSON.stringify(KEY.density)})`);
    const run = await clickReset(true, id, lang);
    const partial = await waitUntil(`${recoveryExpr(blocks(lang, { density: "not-reset" }))} && ${absentExpr(SIX)}`, 8000);
    await delay(300);
    const after = await snap(since);
    confirmed(id, run, true, lang);
    const removes = opsOn(after.attempts, "remove", KEY.density);
    const denied = after.attempts.filter((entry) => entry.op === "get" && entry.key === KEY.density && entry.outcome === "readback-denied");
    pre(`${id}:readback-fault-fired-after-the-remove`, removes.length === 1 && removes[0].outcome === "ok" && denied.length === 1 && denied[0].seq > removes[0].seq, { removes: brief(removes), denied: brief(denied) });
    check(`${id}:uncertain-reset-keeps-its-draft-no-defaults-restored`, partial && draftPane(after.pane, lang, COPY[lang].count(1), true) && topbarStatusShown(after.topbar, lang) && (await warn()).warned === true, { pane: after.pane });
    await clickButton(COPY[lang].retryName(COPY[lang].label.density));
    const restored = await waitUntil(`${statusExpr(COPY[lang].restored)} && __native.pane().recovery.length === 0`, 6000);
    await delay(250);
    const final = await snap(since);
    check(`${id}:retry-verifies-absence-with-exactly-one-total-remove`, restored && opsOn(final.attempts, "remove", KEY.density).length === 1 && final.attempts.filter((entry) => entry.op === "set" && isSeven(entry.key)).length === 0
      && SIX.every((key) => final.physical[key] === null) && cleanPane(final.pane, lang, COPY[lang].restored), { removes: brief(opsOn(final.attempts, "remove", KEY.density)), pane: final.pane });
  });

  // ---- R5 conflict (background palette): another document replaces the bytes; preserved ---------------
  await scenario("r5-conflict", STORED, async (since, lang) => {
    const id = "reset:r5-conflict";
    await evaluate(`__native.denyRemove(${JSON.stringify(KEY.bgTone)})`);
    const run = await clickReset(true, id, lang);
    const partial = await waitUntil(`${recoveryExpr(blocks(lang, { bgTone: "not-reset" }))} && ${absentExpr(SIX.filter((key) => key !== KEY.bgTone))}`, 8000);
    confirmed(id, run, true, lang);
    const setup = await snap(since);
    pre(`${id}:fault-armed-and-fired`, opsOn(setup.attempts, "remove", KEY.bgTone).some((entry) => entry.outcome === "denied"), { removes: brief(setup.attempts.filter((entry) => entry.op === "remove")) });
    check(`${id}:refused-reset-keeps-a-reset-draft`, partial && setup.physical[KEY.bgTone] === "mist", { recovery: setup.pane.recovery, physical: setup.physical });
    const external = await secondDocument(`localStorage.setItem("xai_bg_tone", "peach"); localStorage.getItem("xai_bg_tone")`, id);
    pre(`${id}:second-document-replaced-bytes`, external.value === "peach", external);
    record("second-document-write", { id, key: KEY.bgTone, value: "peach", targetId: external.targetId });
    await delay(400);
    const delivered = await snap(since);
    check(`${id}:native-keyed-trusted-storage-event-delivered`, delivered.received.some((entry) => entry.key === KEY.bgTone && entry.trusted && entry.newValue === "peach"), { received: delivered.received });
    await evaluate("__native.restore()");
    const retryMark = await mark();
    await clickButton(COPY[lang].retryName(COPY[lang].label.bgTone));
    await delay(800);
    const afterRetry = await snap(retryMark);
    const dt = await devtoolsBytes();
    check(`${id}:external-bytes-preserved-no-remove-no-write`, afterRetry.physical[KEY.bgTone] === "peach" && dt[KEY.bgTone] === "peach" && sevenMutations(afterRetry.attempts).length === 0, { physical: afterRetry.physical, devtools: dt, mutations: brief(sevenMutations(afterRetry.attempts)) });
    check(`${id}:reset-draft-kept-no-defaults-restored`, isDeepStrictEqual(afterRetry.pane.recovery, blocks(lang, { bgTone: "not-reset" })) && afterRetry.pane.statusLine.text === COPY[lang].count(1) && (await warn()).warned === true, { pane: afterRetry.pane });
    const repeatMark = await mark();
    await clickButton(COPY[lang].retryName(COPY[lang].label.bgTone));
    await delay(800);
    const repeat = await snap(repeatMark);
    check(`${id}:repeated-retry-never-removes`, repeat.physical[KEY.bgTone] === "peach" && sevenMutations(repeat.attempts).length === 0 && isDeepStrictEqual(repeat.pane.recovery, blocks(lang, { bgTone: "not-reset" })), { mutations: brief(sevenMutations(repeat.attempts)) });
    const discardMark = await mark();
    await clickButton(COPY[lang].discardName(COPY[lang].label.bgTone));
    const discarded = await waitUntil("__native.pane().recovery.length === 0", 4000);
    await delay(300);
    const final = await snap(discardMark);
    const finalWarning = await warn();
    check(`${id}:discard-zero-writes-shows-external-value`, discarded && mutations(final.attempts).length === 0 && final.pane.values.bgTone === "peach" && final.html.bgTone === "peach" && final.physical[KEY.bgTone] === "peach"
      && final.pane.exportButton === null && final.topbar.status === null && finalWarning.warned === false, { values: final.pane.values, html: final.html, warning: finalWarning });
    check(`${id}:defaults-restored-never-claimed-after-the-conflict`, final.pane.statusLine.text !== COPY[lang].restored, { statusLine: final.pane.statusLine });
    record("observation", { id: `${id}:status-line-after-discard`, statusLine: final.pane.statusLine });
  });

  record("reset-throughout", totals);
  check("reset:throughout:zero-broadcast-zero-relock-zero-remount-truthful-restored", totals.scenarios === 7 && totals.storageDispatches === 0 && totals.prefChanged === 0 && totals.keyNullReceived === 0 && totals.relocks === 0
    && totals.scopeTransitions === 0 && totals.gateInsertions === 0 && totals.watchedRemovals === 0 && totals.replacedNodes === 0 && totals.restoredFramesWithWork === 0, totals);
}

// ---------------------------------------------------------------------------------------------------
// E11: on-disk export (production App composition)
// ---------------------------------------------------------------------------------------------------
async function runExport() {
  const envelope = (device) => ({ version: 1, kind: "appearance-draft", changes: { device } });
  const SET = (value) => ({ operation: "set", value });
  const RESET_OP = { operation: "reset" };
  const BASE = { lang: "en" };
  const STORED = { lang: "en", theme: "dark", density: "compact", accentHue: 230, bgTone: "mist", railPos: "right", fontScale: 1.1 };
  const recoveryExpr = (expected) => `JSON.stringify(__native.pane()?.recovery) === ${JSON.stringify(JSON.stringify(expected))}`;
  const summary = [];

  /** One export under total Storage denial with every §8 assertion. */
  async function exportUnderDenial(shape, expectedDevice, options) {
    const { lang = "en", expectedRecovery, statusLine, retryEnabled, topbarStatus, failure = null, baseFaults = "", extra = null } = options;
    const id = `export:${shape}`;
    await evaluate("__native.restore(); __native.denyAll()");
    const probe = await evaluate("__native.probeStorage()");
    pre(`${id}:total-denial-armed-injector-fires`, probe.threw === true && probe.logged === 1 && probe.last?.outcome === "denied" && (await evaluate("__native.faultState()")).all === true, { probe });
    pre(`${id}:download-directory-empty`, visibleDownloads().length === 0, { names: readdirSync(downloads) });
    if (failure === "click") await evaluate("__native.failNextClick()");
    if (failure === "create") await evaluate("__native.failNextCreate()");
    const before = await evaluate("({ mark: __native.mark(), url: __native.urlTrace(), click: __native.clickTrace(), anchors: __native.anchorTrace(), location: verify.location(), physical: __native.native.bytes(" + JSON.stringify(SEVEN) + ") })");
    const point = await clickTestId("appearance-export-draft", `${id}:export`);
    let download = null;
    if (failure) {
      const shown = await waitUntil(`__native.pane()?.statusLine.text === ${JSON.stringify(COPY[lang].exportFailed)}`, 4000);
      check(`${id}:localized-export-error-shown`, shown, { statusLine: (await evaluate("__native.pane()")).statusLine });
      await delay(1500);
      check(`${id}:no-download-written`, visibleDownloads().length === 0, { names: readdirSync(downloads) });
    } else {
      download = await awaitDownload();
      check(`${id}:actual-chrome-download-on-disk`, download !== null, { names: readdirSync(downloads) });
    }
    await delay(150);
    const after = await evaluate(`({ window: __native.window(${before.mark}), url: __native.urlTrace(), click: __native.clickTrace(), anchors: __native.anchorTrace(), anchorsInDom: __native.anchorsInDom(),
      location: verify.location(), pane: __native.pane(), topbar: __native.topbar(), physical: __native.native.bytes(${JSON.stringify(SEVEN)}), pendingFailures: __native.pendingFailures() })`);
    const counts = summarize(after.window.attempts);
    check(`${id}:attempt-level-counters-zero-reads-writes-removes`, after.window.attempts.length === 0, { counts, first: brief(after.window.attempts) });
    const createAttempts = after.url.createAttempts - before.url.createAttempts;
    const created = after.url.created.slice(before.url.created.length);
    const revoked = after.url.revoked.slice(before.url.revoked.length);
    const clicks = after.click.hrefs.slice(before.click.hrefs.length);
    const clickDownloads = after.click.downloads.slice(before.click.downloads.length);
    const clickConnected = after.click.connected.slice(before.click.connected.length);
    const added = after.anchors.added.slice(before.anchors.added.length);
    const removed = after.anchors.removed.slice(before.anchors.removed.length);
    pre(`${id}:failure-hook-consumed`, !after.pendingFailures.click && !after.pendingFailures.create, after.pendingFailures);
    if (failure === "create") {
      check(`${id}:create-failure-no-url-no-anchor-no-click`, createAttempts === 1 && after.url.createThrows - before.url.createThrows === 1 && created.length === 0 && revoked.length === 0 && clicks.length === 0 && added.length === 0 && after.anchorsInDom === 0,
        { createAttempts, created, revoked, clicks, added });
    } else {
      check(`${id}:exactly-one-object-url-created-and-the-same-revoked`, createAttempts === 1 && created.length === 1 && revoked.length === 1 && revoked[0] === created[0], { createAttempts, created, revoked });
      check(`${id}:anchor-download-attribute-one-click-and-removed`, clicks.length === 1 && clicks[0] === created[0] && isDeepStrictEqual(clickDownloads, ["appearance-draft.json"]) && isDeepStrictEqual(clickConnected, [true])
        && added.length === 1 && added[0].href === created[0] && added[0].download === "appearance-draft.json" && removed.length === 1 && removed[0].href === created[0] && after.anchorsInDom === 0,
        { clicks, clickDownloads, added, removed, anchorsInDom: after.anchorsInDom });
      if (failure === "click") check(`${id}:click-failure-fired`, after.click.throws - before.click.throws === 1, { throws: after.click.throws });
    }
    if (download) {
      const text = download.raw.toString("utf8");
      const payload = JSON.parse(text);
      check(`${id}:disk-json-deep-equals-the-whole-envelope`, isDeepStrictEqual(payload, envelope(expectedDevice)), { payload, expected: envelope(expectedDevice) });
      check(`${id}:single-download-file-appearance-draft-json`, download.names.length === 1 && download.names[0] === "appearance-draft.json", { names: download.names });
      check(`${id}:no-account-bucket-physical-key-account-id-or-timestamp`, !/xai_pref_|xai_accent|xai_rail|xai_bg|xai:account|xai:demo|appearance-native|"account|timestamp|savedAt|"at"|"time"/.test(text) && isDeepStrictEqual(Object.keys(payload.changes), ["device"]), { text });
      const artifact = `native-${short}-${suffix}-export-${shape}-appearance-draft.json`;
      pre(`${id}:artifact-not-overwritten`, !existsSync(join(evidenceDir, artifact)), { artifact });
      copyFileSync(download.file, join(evidenceDir, artifact));
      rmSync(download.file);
      const item = { shape, artifact, sha256: sha256(download.raw), bytes: download.raw.length, raw: text };
      artifacts.push(item);
      record("disk-export", { ...item, payload });
    }
    const expectedLine = failure ? COPY[lang].exportFailed : statusLine;
    check(`${id}:drafts-kept-and-pane-status-line`, isDeepStrictEqual(after.pane.recovery, expectedRecovery) && draftPane(after.pane, lang, expectedLine, retryEnabled), { recovery: after.pane.recovery, pane: after.pane, expectedLine });
    check(`${id}:topbar-status-${topbarStatus ? "still-shown-for-settled-failures" : "absent-while-only-pending"}`, topbarStatus ? topbarStatusShown(after.topbar, lang) : after.topbar.status === null, { status: after.topbar.status });
    check(`${id}:no-storage-event-or-preference-broadcast`, storageDispatches(after.window.dispatches).length === 0 && prefChangedEvents(after.window.dispatches).length === 0, { dispatches: after.window.dispatches.slice(0, 4) });
    check(`${id}:location-and-bytes-unchanged`, after.location.pathname === before.location.pathname && after.location.key === before.location.key && isDeepStrictEqual(after.physical, before.physical), { before: before.location, after: after.location });
    if (extra) await extra(id);
    const warning = await warn();
    check(`${id}:unload-warning-still-active-zero-handler-attempts`, warning.warned === true && warning.attempts === 0, warning);
    await evaluate(`__native.restore(); ${baseFaults}`);
    record("export-step", { shape, point, failure, counts, statusLine: after.pane.statusLine, topbarStatus: after.topbar.status });
    summary.push({ shape, failure, file: artifacts.at(-1)?.shape === shape ? artifacts.at(-1).artifact : null });
  }
  async function editFails(field, value, label, lang = "en") {
    await clickPaneValue(field, value, label);
    const ok = await waitUntil(`(() => { const pane = __native.pane(); const item = pane && pane.recovery.find((entry) => entry.id === ${JSON.stringify(field)}); return !!item && item.text === ${JSON.stringify(block(lang, field, "not-saved").text)}; })()`, 6000);
    pre(`${label}:edit-settled-as-a-failed-draft`, ok, { pane: await evaluate("__native.pane()") });
  }

  // X1: a sparse set left by a Topbar failure (theme).
  await seed(seedsOf(BASE), "export:x1");
  await mountApp("export:x1");
  {
    await evaluate(`__native.denySet(${JSON.stringify(KEY.theme)})`);
    const since = await mark();
    await chooseTopbar("theme", "dark", "export:x1:topbar-dark");
    await closeTopbar("export:x1");
    await parkMouse();
    const ok = await waitUntil(recoveryExpr(blocks("en", { theme: "not-saved" })), 5000);
    const now = await snap(since);
    pre("export:x1:topbar-write-fault-fired", ok && opsOn(now.attempts, "set", KEY.theme).some((entry) => entry.value === '"dark"' && entry.outcome === "denied"), { attempts: brief(now.attempts.filter((entry) => entry.op === "set")) });
  }
  await exportUnderDenial("x1-sparse-set-topbar-theme", { theme: SET("dark") }, { expectedRecovery: blocks("en", { theme: "not-saved" }), statusLine: COPY.en.count(1), retryEnabled: true, topbarStatus: true, baseFaults: `__native.denySet(${JSON.stringify(KEY.theme)})` });

  // X2: a sparse registered set (accent).
  await seed(seedsOf(BASE), "export:x2");
  await mountApp("export:x2");
  await evaluate(`__native.denySet(${JSON.stringify(KEY.accentHue)})`);
  await editFails("accentHue", 230, "export:x2:accent-ocean");
  await exportUnderDenial("x2-sparse-registered-set-accent", { accentHue: SET(230) }, { expectedRecovery: blocks("en", { accentHue: "not-saved" }), statusLine: COPY.en.count(1), retryEnabled: true, topbarStatus: true, baseFaults: `__native.denySet(${JSON.stringify(KEY.accentHue)})` });

  // X3: a background choice with both writes failing.
  await seed(seedsOf(BASE), "export:x3");
  await mountApp("export:x3");
  {
    const faults = `__native.denySet(${JSON.stringify([KEY.bgTone, KEY.accentHue])})`;
    await evaluate(faults);
    await clickPaneValue("bgTone", "lavender", "export:x3:bg-lavender");
    pre("export:x3:both-writes-failed", await waitUntil(recoveryExpr(blocks("en", { accentHue: "not-saved", bgTone: "not-saved" })), 6000), { pane: await evaluate("__native.pane()") });
    await exportUnderDenial("x3-background-both-writes-failing", { bgTone: SET("lavender"), accentHue: SET(295) }, { expectedRecovery: blocks("en", { accentHue: "not-saved", bgTone: "not-saved" }), statusLine: COPY.en.count(2), retryEnabled: true, topbarStatus: true, baseFaults: faults });
  }

  // X4: mixed set and reset (a failed sidebar removal from Reset, then a failed density set).
  await seed(seedsOf(STORED), "export:x4");
  await mountApp("export:x4");
  {
    await evaluate(`__native.denyRemove(${JSON.stringify(KEY.railPos)})`);
    dialogPlan.push({ accept: true });
    const before = dialogs.length;
    await clickTestId("appearance-reset-defaults", "export:x4:reset");
    pre("export:x4:reset-confirmed", await waitFor(() => dialogs.length > before, 6000) && dialogs.at(-1).message === COPY.en.confirmReset, { dialogs: dialogs.slice(before) });
    pre("export:x4:partial-reset-leaves-sidebar", await waitUntil(`${recoveryExpr(blocks("en", { railPos: "not-reset" }))} && ${SIX.filter((key) => key !== KEY.railPos).map((key) => `__native.native.get(${JSON.stringify(key)}) === null`).join(" && ")}`, 8000));
    const faults = `__native.denyRemove(${JSON.stringify(KEY.railPos)}); __native.denySet(${JSON.stringify(KEY.density)})`;
    await evaluate(faults);
    await editFails("density", "compact", "export:x4:density-compact");
    await exportUnderDenial("x4-mixed-set-and-reset", { density: SET("compact"), railPos: RESET_OP }, { expectedRecovery: blocks("en", { density: "not-saved", railPos: "not-reset" }), statusLine: COPY.en.count(2), retryEnabled: true, topbarStatus: true, baseFaults: faults });
  }

  // X5: all six pending resets (every real per-key lock held, then Reset accepted).
  await seed(seedsOf(STORED), "export:x5");
  await mountApp("export:x5");
  {
    const names = RESET_FIELDS.map(LOCK_OF);
    for (const name of names) await evaluate(`__native.hold(${JSON.stringify(name)})`);
    const heldBefore = await evaluate("__native.lockQuery()");
    pre("export:x5:fixture-holds-all-six-real-locks", names.every((name) => heldBefore.held.includes(name)), { heldBefore });
    dialogPlan.push({ accept: true });
    const before = dialogs.length;
    await clickTestId("appearance-reset-defaults", "export:x5:reset");
    pre("export:x5:reset-confirmed", await waitFor(() => dialogs.length > before, 6000) && dialogs.at(-1).message === COPY.en.confirmReset, { dialogs: dialogs.slice(before) });
    const pending = blocks("en", Object.fromEntries(RESET_FIELDS.map((field) => [field, "resetting"])));
    pre("export:x5:six-resets-pending", await waitUntil(recoveryExpr(pending), 6000), { pane: await evaluate("__native.pane()") });
    const locks = await evaluate("__native.lockQuery()");
    pre("export:x5:engine-waits-on-all-six-real-locks", names.every((name) => locks.held.includes(name) && locks.pending.includes(name)), { locks });
    await exportUnderDenial("x5-all-six-pending-resets", Object.fromEntries(RESET_FIELDS.map((field) => [field, RESET_OP])), {
      expectedRecovery: pending, statusLine: "", retryEnabled: false, topbarStatus: false,
      extra: async (id) => {
        const held = await evaluate("__native.lockQuery()");
        check(`${id}:export-never-releases-the-held-resets-bytes-unchanged`, names.every((name) => held.held.includes(name) && held.pending.includes(name)) && isDeepStrictEqual(await bytesOf(), rawOf(STORED)), { held });
      },
    });
    const since = await mark();
    for (const name of names) await evaluate(`__native.release(${JSON.stringify(name)})`);
    const restored = await waitUntil(`__native.pane().statusLine.text === ${JSON.stringify(COPY.en.restored)} && __native.pane().recovery.length === 0 && ${SIX.map((key) => `__native.native.get(${JSON.stringify(key)}) === null`).join(" && ")}`, 8000);
    await delay(250);
    const now = await snap(since);
    check("export:x5:released-resets-complete-six-removes-defaults-restored", restored && now.attempts.filter((entry) => entry.op === "remove").length === 6 && now.attempts.filter((entry) => entry.op === "set" && isSeven(entry.key)).length === 0
      && now.physical[KEY.lang] === '"en"' && cleanPane(now.pane, "en", COPY.en.restored), { removes: brief(now.attempts.filter((entry) => entry.op === "remove")), pane: now.pane });
  }

  // X6: all seven sets, including language (every write refused; the language draft switches the UI to ZH).
  await seed(seedsOf(BASE), "export:x6");
  await mountApp("export:x6");
  {
    const faults = `__native.denySet(${JSON.stringify(SEVEN)})`;
    await evaluate(faults);
    await editFails("lang", "zh", "export:x6:lang-zh", "zh");
    await editFails("theme", "dark", "export:x6:theme-dark", "zh");
    await editFails("density", "compact", "export:x6:density-compact", "zh");
    await clickPaneValue("bgTone", "mist", "export:x6:bg-mist");
    pre("export:x6:bg-and-accent-failed", await waitUntil(`(() => { const ids = __native.pane().recovery.map((entry) => entry.id); return ids.includes("bgTone") && ids.includes("accentHue"); })()`, 6000));
    await editFails("accentHue", 295, "export:x6:accent-violet", "zh");
    await editFails("railPos", "top", "export:x6:rail-top", "zh");
    await focusSlider("fontScale", "export:x6:font");
    await press("ArrowLeft");
    pre("export:x6:font-failed", await waitUntil(`(() => { const item = __native.pane().recovery.find((entry) => entry.id === "fontScale"); return !!item && item.text === ${JSON.stringify(block("zh", "fontScale", "not-saved").text)}; })()`, 6000));
    const all = blocks("zh", Object.fromEntries(FIELDS.map((field) => [field, "not-saved"])));
    pre("export:x6:seven-failed-set-drafts", await waitUntil(recoveryExpr(all), 4000), { pane: await evaluate("__native.pane()") });
    const now = await snap(0);
    pre("export:x6:latest-choices-displayed-in-zh", now.uiLang === "zh" && now.pane.values.lang === "zh" && now.pane.values.theme === "dark" && now.pane.values.density === "compact" && now.pane.values.accentHue === 295
      && now.pane.values.bgTone === "mist" && now.pane.values.railPos === "top" && now.pane.values.fontScale === 0.95, { values: now.pane.values });
    await exportUnderDenial("x6-all-seven-sets-including-language", { lang: SET("zh"), theme: SET("dark"), density: SET("compact"), accentHue: SET(295), bgTone: SET("mist"), railPos: SET("top"), fontScale: SET(0.95) },
      { lang: "zh", expectedRecovery: all, statusLine: COPY.zh.count(7), retryEnabled: true, topbarStatus: true, baseFaults: faults });
  }

  // X7: an export while one operation is held behind a real lock (plus a settled theme failure).
  await seed(seedsOf(BASE), "export:x7");
  await mountApp("export:x7");
  {
    const faults = `__native.denySet(${JSON.stringify(KEY.theme)})`;
    await evaluate(faults);
    await editFails("theme", "dark", "export:x7:theme-dark");
    const name = LOCK_OF("railPos");
    await evaluate(`__native.hold(${JSON.stringify(name)})`);
    pre("export:x7:fixture-holds-the-real-sidebar-lock", (await evaluate("__native.lockQuery()")).held.includes(name));
    await clickPaneValue("railPos", "right", "export:x7:rail-right");
    const expected = blocks("en", { theme: "not-saved", railPos: "saving" });
    pre("export:x7:sidebar-pending-behind-the-lock", await waitUntil(recoveryExpr(expected), 5000) && (await evaluate("__native.lockQuery()")).pending.includes(name), { pane: await evaluate("__native.pane()") });
    await exportUnderDenial("x7-one-operation-held-behind-a-real-lock", { theme: SET("dark"), railPos: SET("right") }, {
      expectedRecovery: expected, statusLine: COPY.en.count(1), retryEnabled: true, topbarStatus: true, baseFaults: faults,
      extra: async (id) => {
        const held = await evaluate("__native.lockQuery()");
        check(`${id}:export-never-releases-the-held-operation`, held.held.includes(name) && held.pending.includes(name) && (await bytesOf([KEY.railPos]))[KEY.railPos] === null, { held });
      },
    });
    const since = await mark();
    await evaluate(`__native.release(${JSON.stringify(name)})`);
    const persisted = await waitUntil(`__native.native.get(${JSON.stringify(KEY.railPos)}) === "right" && ${recoveryExpr(blocks("en", { theme: "not-saved" }))}`, 6000);
    await delay(250);
    const now = await snap(since);
    const sets = opsOn(now.attempts, "set", KEY.railPos);
    check("export:x7:held-operation-persists-once-after-release", persisted && sets.length === 1 && sets[0].value === "right" && sets[0].outcome === "ok", { sets: brief(sets), recovery: now.pane.recovery });
  }

  // X8: an export after navigating away from the pane and back (App-lifetime drafts), then setup failures.
  await seed(seedsOf(BASE), "export:x8");
  await mountApp("export:x8");
  {
    const faults = `__native.denySet(${JSON.stringify([KEY.density, KEY.accentHue])})`;
    await evaluate(faults);
    await editFails("density", "compact", "export:x8:density-compact");
    await editFails("accentHue", 230, "export:x8:accent-ocean");
    const expected = blocks("en", { density: "not-saved", accentHue: "not-saved" });
    const awayMark = await mark();
    await railClick(labels.en.calendar, "export:x8:rail-calendar");
    const away = await waitUntil("verify.location().pathname === '/app/calendar' && !document.querySelector('.appearance-pane') && !document.querySelector('.settings-departure-dialog')", 5000);
    await delay(400);
    const there = await snap(awayMark);
    check("export:x8:leaving-the-pane-is-not-held-drafts-live-on", away && there.pane === null && topbarStatusShown(there.topbar, "en") && there.html.density === "compact" && there.html.accentHue === "230" && sevenMutations(there.attempts).length === 0,
      { location: there.location, status: there.topbar.status, html: there.html });
    await clickTestId("appearance-status", "export:x8:topbar-status-review");
    pre("export:x8:back-on-the-pane", await waitUntil(`${READY_PANE} && verify.location().pathname === '/app/settings/appearance'`, 5000));
    await delay(400);
    const back = await snap(awayMark);
    check("export:x8:drafts-intact-after-return", isDeepStrictEqual(back.pane.recovery, expected) && back.pane.values.density === "compact" && back.pane.values.accentHue === 230 && sevenMutations(back.attempts).length === 0, { recovery: back.pane.recovery });
    const device = { density: SET("compact"), accentHue: SET(230) };
    const common = { expectedRecovery: expected, statusLine: COPY.en.count(2), retryEnabled: true, topbarStatus: true, baseFaults: faults };
    await exportUnderDenial("x8-after-navigating-away-and-back", device, common);
    // Native setup failures under total denial, and a recovered export in between.
    await exportUnderDenial("x9a-anchor-click-failure", null, { ...common, failure: "click" });
    await exportUnderDenial("x9b-recovered-after-click-failure", device, common);
    await exportUnderDenial("x9c-create-object-url-failure", null, { ...common, failure: "create" });
  }
  record("export-summary", { shapes: summary, artifacts: artifacts.map((item) => ({ shape: item.shape, artifact: item.artifact, sha256: item.sha256, bytes: item.bytes })) });
  await evaluate("__native.restore()");
}
