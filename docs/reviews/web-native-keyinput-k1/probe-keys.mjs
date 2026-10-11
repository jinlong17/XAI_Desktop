/**
 * CP-APPEARANCE-01 batch 44, evidence-integrity issue K-1: does sending Windows virtual-key codes as CDP
 * Input.dispatchKeyEvent `nativeVirtualKeyCode` on macOS make headless Chrome emit trusted key events that the runner
 * never sent? Verification only. It loads no product code, touches no storage and changes no existing file.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   node docs/reviews/web-native-keyinput-k1/probe-keys.mjs <group> <suffix>
 *   group: runner | reference | mechanism | followup | all
 *
 * - Page: ./probe-page.html (product-free) served by this script on 127.0.0.1 (ephemeral port). A document-level
 *   capture recorder logs keydown, keypress, keyup, beforeinput, input, change, click, cancel, close and focusin with
 *   isTrusted, key, code, keyCode and receipt time, and exposes the state of a text input, a range slider, two selects,
 *   a native modal dialog and two dialog-like containers.
 * - Browser: /Applications/Google Chrome.app headless (--headless=new), a fresh isolated profile and a fresh process
 *   for every trial, CDP over the DevTools WebSocket as in the three frozen runners, with the frozen runner's exact
 *   Chrome flags (FLAGS below, copied verbatim), Emulation.setFocusEmulationEnabled and Page.bringToFront as they do.
 * - Dispatch: the key-sending functions are verbatim copies of the frozen runners (DISPATCH below; source lines cited)
 *   plus the corrected press() of ../web-appearance-recovery-native/verify-native-fixed.mjs as the reference.
 *   Mechanism variants are labelled as such and are not runner forms.
 * - Per trial: a trusted click on a neutral pad, the focus context, one dispatch, then the recorder is read 250 ms,
 *   1000 ms and 2500 ms after the dispatch began. "Stray" = every keyboard event beyond the runner's own (one keydown
 *   and one keyup per press, plus one keypress for a text key, each with the dispatched key value). When stray events
 *   are present at 2.5 s the default variant ("observe") reads again at 7.5 s; the follow-up group (all on the frozen
 *   before-runner Escape in the popover context) instead runs one variant each: "long" (per-second rate for 30 s),
 *   "reach" (focus moved in turn to a text input, the slider, both selects, a button and an open modal dialog, 1 s
 *   each, with per-target attribution and value/click/cancel effects), "click" (a trusted click on a button),
 *   "navigate" and "reload" (a new document in the same tab), "newtab" and "close" (a second tab B, opened before the
 *   dispatch as h10 opens its document B, brought to front, then A brought back; or A closed), "fixedkey" (one
 *   corrected Escape), "prevent" (a page-level preventDefault on the stray keydowns), "confirm-accept" and
 *   "confirm-cancel" (a real window.confirm opened during the stream and answered through
 *   Page.handleJavaScriptDialog, as the F1 runner answers the Appearance sign-out step).
 * - Log: JSON lines `probe-<group>-<suffix>.log` in this directory, never overwritten. Development probes may redirect
 *   with XAI_K1_EVIDENCE_DIR (refused inside the repository) and select trials with XAI_K1_ONLY (development only).
 */
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const output = fileURLToPath(new URL("./", import.meta.url));
const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
const evidenceDir = process.env.XAI_K1_EVIDENCE_DIR ?? output;
if (process.env.XAI_K1_EVIDENCE_DIR && realpathSync(evidenceDir).startsWith(realpathSync(repositoryRoot))) throw Error("Development probes must write outside the repository");
const [group = "all", suffix] = process.argv.slice(2);
if (!["runner", "reference", "mechanism", "followup", "all", "smoke"].includes(group)) throw Error("group: runner|reference|mechanism|followup|all|smoke");
if (!suffix || !/^[a-z0-9][a-z0-9-]*$/.test(suffix)) throw Error("A suffix ([a-z0-9-]) is required");
const evidencePath = join(evidenceDir, `probe-${group}-${suffix}.log`);
if (existsSync(evidencePath)) throw Error("Evidence exists; use a distinct suffix");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const pageSource = readFileSync(join(output, "probe-page.html"), "utf8");
const scriptSource = readFileSync(fileURLToPath(import.meta.url));
const records = [];
const record = (name, value = {}) => { records.push({ name, ...value }); };

// ---------------------------------------------------------------------------------------------------
// Chrome flags, verbatim from each frozen runner's launch() (profile path substituted)
// ---------------------------------------------------------------------------------------------------
const FLAGS = {
  // web-appearance-recovery-native/verify-native-before.mjs:232-239
  before: (profile) => [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
    "--disable-component-update", "--disable-sync", "--disable-default-apps", "--disable-domain-reliability",
    "--disable-client-side-phishing-detection", "--metrics-recording-only", "--use-mock-keychain",
    "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
    "--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--window-size=1280,900", "about:blank",
  ],
  // web-appearance-recovery-f1/verify-f1-appearance.mjs:185-190
  f1: (profile) => [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
    "--disable-component-update", "--disable-sync", "--disable-default-apps", "--disable-domain-reliability",
    "--disable-client-side-phishing-detection", "--metrics-recording-only", "--use-mock-keychain",
    "--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--window-size=1280,900", "about:blank",
  ],
  // web-date-time-recovery-native/verify-native.mjs:30
  dt: (profile) => ["--headless=new", "--disable-gpu", "--no-first-run", "--disable-background-networking", "--remote-debugging-port=0", "--user-data-dir=" + profile, "about:blank"],
};

// ---------------------------------------------------------------------------------------------------
// Key dispatch: verbatim copies. Each receives the session's CDP sender under the identifier its source uses.
// ---------------------------------------------------------------------------------------------------
const DISPATCH = {
  // web-appearance-recovery-native/verify-native-before.mjs:509-519 (KEYS and press, verbatim)
  before: async (page, key) => {
    const KEYS = {
      Tab: { code: "Tab", vk: 9 },
      Escape: { code: "Escape", vk: 27 },
      ArrowRight: { code: "ArrowRight", vk: 39 },
    };
    async function press(page, key) {
      const def = KEYS[key];
      await page.cdp("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code: def.code, windowsVirtualKeyCode: def.vk, nativeVirtualKeyCode: def.vk });
      await page.cdp("Input.dispatchKeyEvent", { type: "keyUp", key, code: def.code, windowsVirtualKeyCode: def.vk, nativeVirtualKeyCode: def.vk });
      await delay(60);
    }
    await press(page, key);
  },
  // web-appearance-recovery-f1/verify-f1-appearance.mjs:313-317 (pressEscape, verbatim)
  f1: async (page) => {
    const cdp = page.cdp;
    async function pressEscape() {
      await cdp("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
      await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
      await delay(80);
    }
    await pressEscape();
  },
  // web-date-time-recovery-native/verify-native.mjs:41 (the typeahead loop of change(0), verbatim; identical in every
  // committed version ff865fb..6b0694b). mode "controls" sends "s", mode "visual-zh" sends "周".
  dtTypeahead: async (page, mode) => {
    const cdp = page.cdp;
    for(const [key,code,n,text] of (mode==='visual-zh'?[['周','',0,'周']]:[['s','KeyS',83,'s']])){await cdp('Input.dispatchKeyEvent',{type:text?'keyDown':'rawKeyDown',key,code,windowsVirtualKeyCode:n,nativeVirtualKeyCode:key==='s'?1:36,...(text?{text,unmodifiedText:text}:{})});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:n})}
  },
  // web-date-time-recovery-native/verify-native.mjs:84 (focus mode: Shift+Tab, Tab, Escape; verbatim, no nativeVirtualKeyCode)
  dtFocus: async (page, which) => {
    const cdp = page.cdp;
    if (which === "ShiftTab") { await cdp('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8}); }
    if (which === "Tab") { await cdp('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9}); }
    if (which === "Escape") { await cdp('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27}); }
  },
  // web-appearance-recovery-native/verify-native-fixed.mjs:675-688 (KEYDEFS and press, verbatim; `input` is its CDP sender)
  fixed: async (page, key) => {
    const input = page.cdp;
    let pressesThisDocument = 0;
    const KEYDEFS = { Tab: { code: "Tab", vk: 9 }, Escape: { code: "Escape", vk: 27 }, ArrowRight: { code: "ArrowRight", vk: 39 }, ArrowLeft: { code: "ArrowLeft", vk: 37 }, Home: { code: "Home", vk: 36 }, End: { code: "End", vk: 35 } };
    async function press(key) {
      const def = KEYDEFS[key];
      pressesThisDocument += 1;
      await input("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code: def.code, windowsVirtualKeyCode: def.vk });
      await input("Input.dispatchKeyEvent", { type: "keyUp", key, code: def.code, windowsVirtualKeyCode: def.vk });
      await delay(60);
    }
    await press(key);
  },
  // Mechanism variants (NOT runner forms): which half carries the field, and the macOS-correct codes.
  mechanism: async (page, variant) => {
    const cdp = page.cdp;
    const V = {
      "escape-down-only-27": [{ type: "rawKeyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 }, { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }],
      "escape-up-only-27": [{ type: "rawKeyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }, { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 }],
      "escape-both-53-mac": [{ type: "rawKeyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 53 }, { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 53 }],
      "tab-both-48-mac": [{ type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 48 }, { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 48 }],
      "arrowright-both-124-mac": [{ type: "rawKeyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39, nativeVirtualKeyCode: 124 }, { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39, nativeVirtualKeyCode: 124 }],
      "s-both-1": [{ type: "keyDown", key: "s", code: "KeyS", windowsVirtualKeyCode: 83, nativeVirtualKeyCode: 1, text: "s", unmodifiedText: "s" }, { type: "keyUp", key: "s", code: "KeyS", windowsVirtualKeyCode: 83, nativeVirtualKeyCode: 1 }],
      "s-raw-83": [{ type: "rawKeyDown", key: "s", code: "KeyS", windowsVirtualKeyCode: 83, nativeVirtualKeyCode: 83 }, { type: "keyUp", key: "s", code: "KeyS", windowsVirtualKeyCode: 83, nativeVirtualKeyCode: 83 }],
    }[variant];
    for (const params of V) await cdp("Input.dispatchKeyEvent", params);
    await delay(60);
  },
};

// ---------------------------------------------------------------------------------------------------
// Trials
// ---------------------------------------------------------------------------------------------------
const CONTEXTS = ["body", "button", "text", "range", "select", "selectzh", "popover", "popover-prevent", "dialog", "deptrap", "tablast"];
const trials = [];
const add = (trial) => trials.push({ variant: "observe", ...trial });
if (group === "runner" || group === "all") {
  for (const key of ["Tab", "Escape", "ArrowRight"]) for (const ctx of CONTEXTS) add({ id: `before:${key}:${ctx}`, form: "before", flags: "before", key, ctx, expect: [{ key, presses: 1 }] });
  for (const ctx of CONTEXTS) add({ id: `f1:Escape:${ctx}`, form: "f1", flags: "f1", key: "Escape", ctx, expect: [{ key: "Escape", presses: 1 }] });
  for (const [mode, key] of [["controls", "s"], ["visual-zh", "周"]]) for (const ctx of CONTEXTS) add({ id: `dt-typeahead:${key}:${ctx}`, form: "dtTypeahead", flags: "dt", key, mode, ctx, expect: [{ key, presses: 1, text: true }] });
  for (const which of ["ShiftTab", "Tab", "Escape"]) for (const ctx of CONTEXTS) add({ id: `dt-focus:${which}:${ctx}`, form: "dtFocus", flags: "dt", key: which, ctx, expect: [{ key: which === "ShiftTab" ? "Tab" : which, presses: 1 }] });
}
if (group === "reference" || group === "all") {
  for (const key of ["Tab", "Escape", "ArrowRight"]) for (const ctx of CONTEXTS) add({ id: `fixed:${key}:${ctx}`, form: "fixed", flags: "before", key, ctx, expect: [{ key, presses: 1 }] });
}
if (group === "mechanism" || group === "all") {
  for (const variant of ["escape-down-only-27", "escape-up-only-27", "escape-both-53-mac", "tab-both-48-mac", "arrowright-both-124-mac", "s-both-1", "s-raw-83"]) {
    for (const ctx of ["body", "button", "popover", "select"]) {
      const key = variant.startsWith("escape") ? "Escape" : variant.startsWith("tab") ? "Tab" : variant.startsWith("arrowright") ? "ArrowRight" : "s";
      add({ id: `mechanism:${variant}:${ctx}`, form: "mechanism", flags: "before", key, mechanism: variant, ctx, expect: [{ key, presses: 1, text: variant === "s-both-1" }] });
    }
  }
}
if (group === "smoke") {
  add({ id: "smoke:before:Escape:popover", form: "before", flags: "before", key: "Escape", ctx: "popover", expect: [{ key: "Escape", presses: 1 }] });
  add({ id: "smoke:fixed:Escape:popover", form: "fixed", flags: "before", key: "Escape", ctx: "popover", expect: [{ key: "Escape", presses: 1 }] });
  add({ id: "smoke:dt-typeahead:s:select", form: "dtTypeahead", flags: "dt", key: "s", mode: "controls", ctx: "select", expect: [{ key: "s", presses: 1, text: true }] });
}
if (group === "followup" || group === "all") {
  for (const variant of ["long", "reach", "click", "navigate", "reload", "newtab", "close", "fixedkey", "prevent", "confirm-accept", "confirm-cancel"]) {
    add({ id: `followup:${variant}:before-Escape-popover`, form: "before", flags: "before", key: "Escape", ctx: "popover", expect: [{ key: "Escape", presses: 1 }], variant });
  }
}

// ---------------------------------------------------------------------------------------------------
// Browser and server
// ---------------------------------------------------------------------------------------------------
const server = createServer((request, response) => {
  const path = new URL(request.url, "http://127.0.0.1").pathname;
  response.setHeader("Cache-Control", "no-store");
  if (path === "/favicon.ico") { response.statusCode = 204; response.end(); return; }
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.end(pageSource);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

async function launch(flagSet) {
  const directory = mkdtempSync(join(process.env.XAI_NATIVE_TMPDIR ?? tmpdir(), "xai-k1-probe-"));
  const profile = join(directory, "profile");
  const proc = spawn(CHROME, FLAGS[flagSet](profile), { stdio: "ignore" });
  const exited = new Promise((resolve) => proc.once("exit", (code, signal) => resolve({ code, signal })));
  let port = 0;
  for (let attempt = 0; attempt < 300 && !port; attempt += 1) {
    try { const candidate = Number(readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]); if (candidate > 0) port = candidate; } catch { /* not yet */ }
    if (!port) await delay(50);
  }
  if (!port) throw Error("Chrome DevToolsActivePort never became positive");
  return { proc, exited, port, directory };
}
async function attach(target, name) {
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", (event) => reject(Error(`WebSocket error attaching ${name} (${target.webSocketDebuggerUrl}): ${event?.message ?? event?.error?.message ?? "unknown"}`)), { once: true });
  });
  const pending = new Map();
  let commandId = 0;
  const page = { name, id: target.id, socket, dialogs: [] };
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Page.javascriptDialogOpening") page.dialogs.push({ type: message.params.type, message: message.params.message, at: Date.now() });
    if (message.id && pending.has(message.id)) {
      const job = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) job.reject(Error(JSON.stringify(message.error))); else job.resolve(message.result);
    }
  });
  socket.addEventListener("close", () => { for (const job of pending.values()) job.reject(Error("CDP socket closed")); pending.clear(); });
  page.cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(Error(`CDP timeout ${method}`)); } }, 20000);
  });
  page.ev = async (expression) => {
    const result = await page.cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw Error(`evaluate failed: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`);
    return result.result.value;
  };
  await page.cdp("Runtime.enable");
  await page.cdp("Page.enable");
  await page.cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
  return page;
}
async function closeBrowser(browser, pages) {
  try { pages[0]?.socket.send(JSON.stringify({ id: 999999, method: "Browser.close" })); } catch { /* gone */ }
  const graceful = await Promise.race([browser.exited.then(() => true), delay(8000).then(() => false)]);
  if (!graceful) { browser.proc.kill("SIGKILL"); await Promise.race([browser.exited, delay(3000)]); }
  for (const page of pages) { try { page.socket.close(); } catch { /* closed */ } }
  rmSync(browser.directory, { recursive: true, force: true });
  return graceful;
}
async function load(page, url) {
  await page.cdp("Page.navigate", { url });
  for (let i = 0; i < 200; i += 1) {
    try { if (await page.ev("document.readyState === 'complete' && !!window.__k1")) return true; } catch { /* not yet */ }
    await delay(25);
  }
  return false;
}
async function trustedClick(page, selector) {
  const point = await page.ev(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await page.cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await page.cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await page.cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(80);
}

/** Splits recorded keyboard counts into the runner's own events and stray events. */
function classify(counts, expect) {
  const own = {}; const stray = {}; let ownTotal = 0; let strayTotal = 0;
  const budget = {};
  for (const { key, presses, text } of expect) {
    budget[`keydown|${key}`] = (budget[`keydown|${key}`] ?? 0) + presses;
    budget[`keyup|${key}`] = (budget[`keyup|${key}`] ?? 0) + presses;
    if (text) budget[`keypress|${key}`] = (budget[`keypress|${key}`] ?? 0) + presses;
  }
  for (const [id, n] of Object.entries(counts)) {
    const [type, key] = id.split("|");
    const slot = `${type}|${key}`;
    const allowed = Math.min(n, budget[slot] ?? 0);
    if (allowed > 0) { own[id] = allowed; ownTotal += allowed; budget[slot] -= allowed; }
    if (n - allowed > 0) { stray[id] = n - allowed; strayTotal += n - allowed; }
  }
  return { own, ownTotal, stray, strayTotal };
}
const keyboardTotal = (perType) => (perType.keydown ?? 0) + (perType.keypress ?? 0) + (perType.keyup ?? 0);

async function runTrial(trial) {
  const browser = await launch(trial.flags);
  const pages = [];
  const out = { id: trial.id, form: trial.form, flags: trial.flags, key: trial.key, ctx: trial.ctx, variant: trial.variant, mechanism: trial.mechanism ?? null, mode: trial.mode ?? null };
  try {
    const targets = await (await fetch(`http://127.0.0.1:${browser.port}/json/list`)).json();
    const page = await attach(targets.find((target) => target.type === "page"), "A");
    pages.push(page);
    await page.cdp("Page.bringToFront");
    if (trial.flags === "dt") await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    else await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    out.browser = (await page.cdp("Browser.getVersion")).product;
    if (!(await load(page, `${origin}/probe?trial=${encodeURIComponent(trial.id)}`))) throw Error("probe page did not load");
    // Second-tab variants open tab B BEFORE the dispatch, as verify-native-before.mjs h10 opens its document B
    // before any key press (a WebSocket attach while a stream runs in another tab of the browser fails; probe-followup-k1.log).
    let second = null;
    if (trial.variant === "newtab" || trial.variant === "close") {
      const response = await fetch(`http://127.0.0.1:${browser.port}/json/new?about:blank`, { method: "PUT" });
      second = await attach(await response.json(), "B");
      pages.push(second);
      if (!(await load(second, `${origin}/probe?tab=2`))) throw Error("second tab did not load");
      await page.cdp("Page.bringToFront");
      await delay(200);
    }
    await trustedClick(page, "#pad");
    out.focusBefore = await page.ev(`__k1.setup(${JSON.stringify(trial.ctx)})`);
    out.stateBefore = await page.ev("__k1.state()");
    const base = await page.ev("({ perType: __k1.perType, counts: __k1.counts, now: __k1.now(), seq: __k1.seq })");
    const t0 = base.now;
    // ---- one dispatch, exactly as the frozen runner sends it
    if (trial.form === "before") await DISPATCH.before(page, trial.key);
    else if (trial.form === "f1") await DISPATCH.f1(page);
    else if (trial.form === "dtTypeahead") await DISPATCH.dtTypeahead(page, trial.mode);
    else if (trial.form === "dtFocus") await DISPATCH.dtFocus(page, trial.key);
    else if (trial.form === "fixed") await DISPATCH.fixed(page, trial.key);
    else if (trial.form === "mechanism") await DISPATCH.mechanism(page, trial.mechanism);
    const sample = async (label) => {
      const s = await page.ev("({ perType: __k1.perType, counts: __k1.counts, now: __k1.now(), state: __k1.state(), effects: __k1.effects })");
      const delta = {};
      for (const [id, n] of Object.entries(s.counts)) { const d = n - (base.counts[id] ?? 0); if (d > 0) delta[id] = d; }
      const split = classify(delta, trial.expect);
      return { label, atMs: Math.round(s.now - t0), keyboardEvents: keyboardTotal(s.perType) - keyboardTotal(base.perType), ...split, state: s.state, clicks: s.effects.clicks, inputs: s.effects.inputs, changes: s.effects.changes, cancels: s.effects.cancels, closes: s.effects.closes };
    };
    const waitUntilMs = async (ms) => { const now = await page.ev("__k1.now()"); if (now - t0 < ms) await delay(ms - (now - t0)); };
    await waitUntilMs(250); out.at250 = await sample("250ms");
    await waitUntilMs(1000); out.at1000 = await sample("1000ms");
    await waitUntilMs(2500); out.at2500 = await sample("2500ms");
    out.firstEvents = await page.ev(`__k1.detail.filter((e) => e.t >= ${t0}).slice(0, 12)`);
    out.keydownLog = await page.ev("__k1.log.slice(0, 6)");
    const strayNow = out.at2500.strayTotal;
    out.stream = strayNow > 0;
    if (out.stream) {
      // Onset: the first keydown after the dispatch that is not one of the runner's own (another key value, or a
      // keydown beyond the runner's press count, which covers replays of the runner's own key).
      out.onsetMs = await page.ev(`(() => { const budget = ${JSON.stringify(Object.fromEntries(trial.expect.map((e) => [e.key, e.presses])))}; for (const d of __k1.detail) { if (d.t < ${t0} || d.type !== "keydown") continue; if ((budget[d.key] ?? 0) > 0) { budget[d.key] -= 1; continue; } return Math.round((d.t - ${t0}) * 10) / 10; } return null; })()`);
      out.rateHzWindow1000to2500 = Math.round((await page.ev(`__k1.windowCount(${t0 + 1000}, ${t0 + 2500})`)) / 1.5);
      out.sampleStray = await page.ev(`__k1.detail.filter((d) => d.t >= ${t0} && d.timeStamp === 0 && (d.type === "keydown" || d.type === "keypress")).slice(0, 3)`);
      out.keyboardEventsByTarget = await page.ev("__k1.byTarget");
    }
    // ---- variant follow-ups (only meaningful when a stream exists; recorded either way)
    const rate = async (fromRel, toRel) => Math.round((await page.ev(`__k1.windowCount(${t0 + fromRel}, ${t0 + toRel})`)) * 1000 / (toRel - fromRel));
    if (trial.variant === "observe" && out.stream) {
      await waitUntilMs(7500);
      out.at7500 = await sample("7500ms");
      out.rateHz2500to7500 = await rate(2500, 7500);
    }
    if (trial.variant === "long") {
      const perSecond = [];
      for (let second = 3; second <= 30; second += 1) { await waitUntilMs(second * 1000); perSecond.push(await rate((second - 1) * 1000, second * 1000)); }
      out.perSecondRateHz3to30 = perSecond;
      out.at30s = await sample("30s");
    }
    if (trial.variant === "reach") {
      const phases = [];
      for (const [label, script, settle] of [
        ["text", "document.getElementById('text').focus()", 1000],
        ["range", "document.getElementById('range').focus()", 1000],
        ["select", "document.getElementById('sel').focus()", 1000],
        ["selectzh", "document.getElementById('selzh').focus()", 1000],
        ["button", "document.getElementById('btn').focus()", 1000],
        ["dialog", "(() => { const d = document.getElementById('dlg'); if (!d.open) d.showModal(); document.getElementById('dlgbtn').focus(); })()", 1000],
      ]) {
        const before = await page.ev("({ now: __k1.now(), state: __k1.state(), effects: JSON.parse(JSON.stringify(__k1.effects)), byTarget: JSON.parse(JSON.stringify(__k1.byTarget)) })");
        await page.ev(script);
        await delay(settle);
        const after = await page.ev("({ now: __k1.now(), state: __k1.state(), effects: JSON.parse(JSON.stringify(__k1.effects)), byTarget: JSON.parse(JSON.stringify(__k1.byTarget)) })");
        const keydowns = await page.ev(`__k1.windowCount(${before.now}, ${after.now})`);
        const targets = {};
        for (const [at, n] of Object.entries(after.byTarget)) { const d = n - (before.byTarget[at] ?? 0); if (d > 0) targets[at] = d; }
        phases.push({ phase: label, keyboardEventsInWindow: keydowns, rateHz: Math.round(keydowns * 1000 / (after.now - before.now)), active: after.state.active, keyboardEventsByTargetInWindow: targets, before: before.state, after: after.state,
          newClicks: after.effects.clicks, newInputs: after.effects.inputs, newChanges: after.effects.changes, cancels: after.effects.cancels - before.effects.cancels, closes: after.effects.closes - before.effects.closes });
      }
      out.reach = phases;
    }
    if (trial.variant === "click") {
      const before = await rate(1500, 2500);
      await trustedClick(page, "#btn");
      const tClick = (await page.ev("__k1.now()")) - t0;
      await delay(1500);
      out.click = { rateBeforeHz: before, rateAfterHz: await rate(tClick + 300, tClick + 1300), active: await page.ev("__k1.state().active"), clicks: await page.ev("__k1.effects.clicks") };
    }
    if (trial.variant === "fixedkey") {
      const before = await rate(1500, 2500);
      await DISPATCH.fixed(page, "Escape");
      const tKey = (await page.ev("__k1.now()")) - t0;
      await delay(1500);
      out.fixedkey = { rateBeforeHz: before, rateAfterHz: await rate(tKey + 300, tKey + 1300) };
    }
    if (trial.variant === "prevent") {
      const before = await rate(1500, 2500);
      await page.ev("__k1.preventStray = true");
      const tSet = (await page.ev("__k1.now()")) - t0;
      await delay(1500);
      out.prevent = { rateBeforeHz: before, rateAfterHz: await rate(tSet + 300, tSet + 1300), keydownLogTail: await page.ev("__k1.log.slice(-3)") };
    }
    if (trial.variant === "confirm-accept" || trial.variant === "confirm-cancel") {
      // A real window.confirm opened while the stream runs, answered through Page.handleJavaScriptDialog after 500 ms
      // (the F1 runner answers the Appearance sign-out step this way: OK in a3, Cancel in a4).
      const before = await rate(1500, 2500);
      await page.ev("setTimeout(() => { window.__confirmResult = window.confirm('K-1 probe confirm'); window.__confirmDone = performance.now() - __k1.t0; }, 0), true");
      let opened = false;
      for (let i = 0; i < 80 && !opened; i += 1) { opened = page.dialogs.length > 0; if (!opened) await delay(25); }
      await delay(500);
      const accept = trial.variant === "confirm-accept";
      await page.cdp("Page.handleJavaScriptDialog", { accept });
      await delay(400);
      const done = await page.ev("({ result: window.__confirmResult, doneAt: window.__confirmDone, now: __k1.now() })");
      await delay(1000);
      out[trial.variant] = { rateBeforeHz: before, dialogOpened: opened, dialogs: page.dialogs, answeredWith: accept, confirmReturned: done.result,
        keyboardEventsWhileDialogOpen: await page.ev(`__k1.windowCount(${done.doneAt - 500}, ${done.doneAt})`), rateAfterDialogHz: await rate(done.doneAt - t0 + 200, done.doneAt - t0 + 1200) };
    }
    if (trial.variant === "navigate" || trial.variant === "reload") {
      const before = await rate(1500, 2500);
      if (trial.variant === "navigate") await page.cdp("Page.navigate", { url: `${origin}/probe?second-document=1` });
      else await page.cdp("Page.reload", { ignoreCache: true });
      await delay(300);
      for (let i = 0; i < 200; i += 1) { try { if (await page.ev("document.readyState === 'complete' && !!window.__k1 && __k1.seq >= 0")) break; } catch { /* loading */ } await delay(25); }
      const n0 = await page.ev("({ now: __k1.now(), perType: __k1.perType })");
      await delay(2000);
      const n1 = await page.ev("({ now: __k1.now(), perType: __k1.perType, counts: __k1.counts, active: __k1.state().active, location: location.href })");
      out[trial.variant] = { rateBeforeHz: before, newDocument: n1.location, keyboardEventsInNewDocumentFirst2s: keyboardTotal(n1.perType) - keyboardTotal(n0.perType), keyboardEventsSinceLoad: keyboardTotal(n1.perType), counts: n1.counts, active: n1.active };
    }
    if (trial.variant === "newtab" || trial.variant === "close") {
      const before = await rate(1500, 2500);
      const b0 = await second.ev("({ perType: __k1.perType })");
      if (trial.variant === "close") {
        await second.cdp("Page.bringToFront");
        await fetch(`http://127.0.0.1:${browser.port}/json/close/${page.id}`);
        await delay(2000);
        const b = await second.ev("({ perType: __k1.perType, counts: __k1.counts })");
        out.close = { rateBeforeHzInA: before, secondTabKeyboardEventsBeforeTheSwitch: keyboardTotal(b0.perType), secondTabKeyboardEvents2sAfterClosingA: keyboardTotal(b.perType) - keyboardTotal(b0.perType), counts: b.counts };
      } else {
        await second.cdp("Page.bringToFront");
        const tFront = (await page.ev("__k1.now()")) - t0;
        await delay(2000);
        const b = await second.ev("({ perType: __k1.perType, counts: __k1.counts, active: __k1.state().active })");
        await page.cdp("Page.bringToFront");
        const tBack = (await page.ev("__k1.now()")) - t0;
        await delay(1500);
        out.newtab = { rateBeforeHzInA: before, secondTabKeyboardEventsBeforeTheSwitch: keyboardTotal(b0.perType), rateInAWhileBFrontHz: await rate(tFront + 300, tFront + 1800),
          secondTabKeyboardEvents2sWhileFront: keyboardTotal(b.perType) - keyboardTotal(b0.perType), secondTabCounts: b.counts, rateInAAfterABackToFrontHz: await rate(tBack + 200, tBack + 1200) };
      }
    }
    out.final = trial.variant === "close" ? "tab A closed by the variant" : await page.ev("__k1.state()").catch((error) => `unavailable: ${String(error).slice(0, 120)}`);
  } catch (error) {
    out.error = String(error?.stack ?? error).slice(0, 800);
  } finally {
    out.gracefulClose = await closeBrowser(browser, pages).catch(() => false);
  }
  return out;
}

if (process.env.XAI_K1_ONLY) {
  if (!process.env.XAI_K1_EVIDENCE_DIR) throw Error("XAI_K1_ONLY is for development probes outside the repository");
  const only = new RegExp(process.env.XAI_K1_ONLY);
  trials.splice(0, trials.length, ...trials.filter((trial) => only.test(trial.id)));
}
record("baseline", {
  group, suffix, node: process.version, platform: `${process.platform} ${process.arch}`, chromeBinary: CHROME,
  fileSha256: { "probe-keys.mjs": sha256(scriptSource), "probe-page.html": sha256(pageSource) },
  trials: trials.length, origin: "127.0.0.1 (ephemeral port)",
});
let failures = 0;
for (const trial of trials) {
  const result = await runTrial(trial);
  if (result.error) failures += 1;
  record("trial", result);
  const tail = result.stream ? `STREAM onset=${result.onsetMs}ms rate=${result.rateHzWindow1000to2500}/s stray@2.5s=${result.at2500?.strayTotal}` : `no-stray own=${result.at2500?.ownTotal} stray=${result.at2500?.strayTotal}`;
  console.log(`${result.id} ${result.error ? "ERROR " + result.error.split("\n")[0] : tail}`);
}
record("result", { trials: trials.length, errors: failures, streams: records.filter((entry) => entry.name === "trial" && entry.stream).map((entry) => entry.id) });
writeFileSync(evidencePath, `${records.map((entry) => JSON.stringify(entry)).join("\n")}\n`, { flag: "wx" });
server.closeAllConnections?.();
server.close();
console.log(`WROTE ${evidencePath} trials=${trials.length} errors=${failures}`);
