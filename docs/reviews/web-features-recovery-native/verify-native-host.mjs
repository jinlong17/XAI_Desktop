/**
 * CP-FEATURES-01 batch 28 (contract §14 E12): the fixed Settings Features caller in real headless Chrome, in the
 * actual Settings composition with the full Shell and the production router: contract §9 host matrix rows a–n
 * and beforeunload, with history counters (pushState/replaceState/popstate, router commits), history-stack
 * integrity (CDP entry ids and Navigation API keys/ids), {pathname,key,state} deep equality and a runtime-error
 * gate per row. Parent-role native verifier; verification only: it repairs nothing, implements nothing, accepts
 * nothing and changes no product file, contract, ledger or existing evidence.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-features-recovery-native/verify-native-host.mjs <fixed revision> host <suffix>
 *
 * Composition: ./native-host-matrix.tsx (Settings host: production Shell + rail filter, ComposedSettings with
 * DepartureCoordinator and settingsDeparture, production createBrowserRouter under RouterProvider from
 * "react-router/dom", the real Features pane, engine and accountScope). Instruments: ./native-host-prelude.js.
 * Harness: ./native-host-harness.mjs (archive, pin + guard, lockfile gate, local server, Chrome, log).
 * Input: CDP trusted mouse/key events after a centre hit-test; browser Back/Forward through CDP
 * Page.navigateToHistoryEntry (the browser's own traversal, not page script), one page-script history.back()
 * case; programmatic intents through the production router; sign-out through the real departure preflight.
 * Row gates are recorded without stopping the run (any gate failure fails the run at the end gate).
 */
import { isDeepStrictEqual } from "node:util";
import { readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRun, IDS, LABEL, keyOf, FEATURE_KEYS, LOCK_OF, PANE, SWITCH, RESET, COPY, DIALOG, entry, ACTIONS, summarize, mutationsOf, short, sha256, delay } from "./native-host-harness.mjs";

const REQUIRED = [
  "apps/web/src/routes/modules/shellRegistrations.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/settingsDeparture.ts",
  "apps/web/src/routes/modules/settingsPaneComposition.ts",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/registry.ts",
  "packages/plugin-web-storage/src/internal/codec.ts",
  "packages/plugin-web-storage/src/internal/sameTabBus.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts",
  "packages/plugin-web-storage/src/internal/accountCoordination.ts",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/storage.ts",
  "packages/plugin-web-settings-shell/src/Toggle.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-settings-features-panel/src/FeaturesPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresRecovery.ts",
  "packages/xai-web-settings-features-panel/src/internal/featuresRecoveryCopy.ts",
  "packages/xai-web-settings-features-panel/src/styles.css",
  "packages/xai-web-settings-features-panel/src/useFeaturePrefs.ts",
  "packages/xai-web-settings-features-panel/src/filterModulesByFeaturePrefs.ts",
  "packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx",
  "packages/xai-web-settings-features-panel/src/DisabledFeatureFallback.tsx",
  "packages/xai-web-settings-features-panel/src/featureIds.ts",
];
const run = createRun({ runnerUrl: import.meta.url, mode: "host", fixture: "native-host-matrix.tsx", requiredModules: REQUIRED });
const { pre, check, checkDeferred, record } = run;
let page = null;
const ev = (expression) => page.evaluate(expression);
const until = (expression, timeout) => page.waitUntil(expression, timeout);

const STAY = "Stay";
const EXPORT = "Export current draft";
const DISCARD_LEAVE = "Discard local changes and leave";
const RAIL = (label) => `.app-rail .rail-items [aria-label="${label}"]`;
const triple = (location) => ({ pathname: location.pathname, key: location.key, state: location.state ?? null });
const sameTriple = (left, right) => isDeepStrictEqual(triple(left), triple(right));
const counters = (window) => ({
  pushState: window.history.filter((item) => item.method === "pushState").length,
  replaceState: window.history.filter((item) => item.method === "replaceState").length,
  popstate: window.pops.length,
  commits: window.commits.length,
});
const ZERO = { pushState: 0, replaceState: 0, popstate: 0, commits: 0 };
const pathFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.origin === run.origin ? parsed.pathname : url;
  } catch { return url; }
};
const recoveryIs = (expected) => `JSON.stringify(__native.features()?.recovery) === ${JSON.stringify(JSON.stringify(expected))}`;
const opsOn = (list, op, id) => list.filter((item) => item.op === op && item.key === keyOf(id));
const historyCounters = {};

// ---------------------------------------------------------------------------------------------------
// Page helpers
// ---------------------------------------------------------------------------------------------------
const mark = () => ev("__native.mark()");
const location = () => ev("verify.location()");
async function hostWindow(since) {
  return ev(`(() => { const w = __native.window(${since}); return { history: w.history, pops: w.pops, commits: verify.commitsAfter(${since}) }; })()`);
}
async function snap(since) {
  return ev(`(() => { const w = __native.window(${since}); return {
    location: verify.location(), windowPath: verify.windowPath(), historyState: __native.historyState(), pane: verify.paneId(),
    features: verify.featuresMounted(), view: __native.features(), dialog: __native.dialog(), physical: verify.physical(),
    unloadActive: __native.unloadActive(), scope: verify.scope(), signouts: { ...verify.signouts }, rail: verify.rail(), destination: verify.destination(),
    attempts: w.attempts, locks: w.locks, events: w.events, history: w.history, pops: w.pops, commits: verify.commitsAfter(${since}),
    keyNull: w.storageDispatches.filter((item) => item.key === null).length, unload: w.unload,
  }; })()`);
}
const recoveryOf = (state) => state.view?.recovery ?? null;
async function stack() {
  const browserHistory = await page.cdp("Page.getNavigationHistory");
  const pageView = await ev("({ length: __native.historyLength(), entries: __native.navEntries(), current: __native.navCurrent() })");
  return {
    currentIndex: browserHistory.currentIndex,
    browserEntries: browserHistory.entries.map((item) => ({ id: item.id, path: pathFromUrl(item.url) })),
    length: pageView.length,
    navEntries: pageView.entries,
    navCurrent: pageView.current,
  };
}
const sameEntries = (left, right) => isDeepStrictEqual(left.browserEntries, right.browserEntries) && isDeepStrictEqual(left.navEntries, right.navEntries) && left.length === right.length;
const stackView = (value) => ({ currentIndex: value.currentIndex, length: value.length, navIndex: value.navCurrent?.index ?? null, entries: value.browserEntries.map((item) => `${item.id}:${item.path}`) });
async function browserTraverse(id, direction) {
  const historyNow = await page.cdp("Page.getNavigationHistory");
  const index = historyNow.currentIndex + (direction === "back" ? -1 : 1);
  const target = historyNow.entries[index];
  pre(`${id}:traverse-${direction}-entry-exists`, Boolean(target), { currentIndex: historyNow.currentIndex, length: historyNow.entries.length });
  await page.cdp("Page.navigateToHistoryEntry", { entryId: target.id });
  return { fromIndex: historyNow.currentIndex, toIndex: index, entryId: target.id, path: pathFromUrl(target.url) };
}
/** Unguarded traversal onto a recorded entry; Features (when it is the target) remounts clean on the same key. */
async function traverseTo(id, direction, expected, features = true) {
  const step = await browserTraverse(id, direction);
  const ok = await until(`verify.location().key === ${JSON.stringify(expected.key)}${features ? " && verify.featuresMounted()" : ""}`, 6000);
  await delay(450);
  const state = await snap(await mark());
  check(`${id}:unguarded-traversal-restores-entry`, ok && sameTriple(state.location, expected) && state.dialog === null, { location: triple(state.location), expected: triple(expected), step });
  if (features) check(`${id}:features-remounts-clean`, recoveryOf(state)?.length === 0 && state.unloadActive === 0, { recovery: recoveryOf(state), unloadActive: state.unloadActive });
  return step;
}
const clickSwitch = (field) => run.trustedClick(page, SWITCH(field), `switch:${field}`);
const dialogAction = (name) => run.clickButton(page, name, ".settings-departure-dialog");
const paneAction = (name) => run.clickButton(page, name, PANE);
const sidebarClick = (label) => run.sidebarClick(page, label);
const railClick = (label) => run.trustedClick(page, RAIL(label), `rail ${label}`);
const pressEscape = () => run.pressKey(page, "Escape", "Escape", 27);
const displayedOf = async (field) => (await ev("__native.features()"))?.switches?.[field] ?? null;

/** A refused write: the field's set is denied by a per-key fault; its latest choice stays as a failed draft. */
async function failedEdit(id, field) {
  await ev(`__native.denySet(${JSON.stringify(keyOf(field))})`);
  const before = await displayedOf(field);
  const intended = before === "true" ? "false" : "true";
  const since = await mark();
  await clickSwitch(field);
  const failed = await until(`(() => { const view = __native.features(); const item = view?.recovery.find((candidate) => candidate.id === ${JSON.stringify(field)});
    return !!item && item.text === ${JSON.stringify(entry(field, "not-saved").text)} && view.switches[${JSON.stringify(field)}] === ${JSON.stringify(intended)}; })()`, 5000);
  const state = await snap(since);
  const denied = state.attempts.filter((item) => item.op === "set" && item.key === keyOf(field) && item.outcome === "denied");
  pre(`${id}:write-fault-fired-${field}`, failed && denied.length === 1 && denied[0].value === intended, { denied: short(denied), recovery: recoveryOf(state), physical: state.physical });
  return { state, intended };
}
/** A pending write genuinely held behind the real per-key lock (the fixture holds prefMutationLockName(key)). */
async function heldEdit(id, field) {
  const name = LOCK_OF(field);
  const held = await ev(`__native.hold(${JSON.stringify(name)})`);
  const before = await displayedOf(field);
  const intended = before === "true" ? "false" : "true";
  const since = await mark();
  await clickSwitch(field);
  const pending = await until(`(() => { const view = __native.features(); const item = view?.recovery.find((candidate) => candidate.id === ${JSON.stringify(field)});
    return !!item && item.text === ${JSON.stringify(entry(field, "saving").text)} && view.switches[${JSON.stringify(field)}] === ${JSON.stringify(intended)}; })()`, 5000);
  const waiting = await until(`__native.lockQuery().then((query) => query.held.includes(${JSON.stringify(name)}) && query.pending.includes(${JSON.stringify(name)}))`, 4000);
  const appRequests = (await ev(`__native.window(${since}).locks`)).filter((item) => item.by === "app" && item.name === name);
  pre(`${id}:engine-waits-behind-real-lock-${field}`, held === name && pending && waiting && appRequests.length === 1, { lockName: name, pending, waiting, appRequests });
  return { name, intended };
}
async function awaitHeld(id, expected, pop) {
  const opened = await until("__native.dialog() !== null", 4000);
  if (pop) {
    const restored = await until(`verify.windowPath() === ${JSON.stringify(expected.pathname)} && __native.historyState()?.key === ${JSON.stringify(expected.key)}`, 4000);
    pre(`${id}:url-restored-after-blocked-pop`, restored, { windowPath: await ev("verify.windowPath()"), historyState: await ev("__native.historyState()") });
  }
  await delay(250);
  const state = await snap(await mark());
  check(`${id}:held-dialog-open`, opened && isDeepStrictEqual(state.dialog, DIALOG), { dialog: state.dialog });
  check(`${id}:held-location-unchanged`, sameTriple(state.location, expected) && state.windowPath === expected.pathname && state.pane === "features" && state.features, { location: triple(state.location), windowPath: state.windowPath, pane: state.pane });
  return state;
}
/**
 * Per-row runtime gate: the page's sequence-stamped console.error trace, the error-element detector and the
 * CDP runtime errors (exceptions, console.error/assert) from the previous gate to now (no gaps).
 */
let runtimeMark = 0;
let cdpErrorsSeen = 0;
async function runtimeClean(id) {
  await delay(150);
  const view = await ev(`(() => { const w = __native.window(${runtimeMark}); return { errors: w.consoleErrors, ui: w.errorUi, now: __native.mark() }; })()`);
  const from = runtimeMark;
  runtimeMark = view.now;
  const cdpErrors = run.runtimeErrors.slice(cdpErrorsSeen);
  cdpErrorsSeen = run.runtimeErrors.length;
  const clean = view.errors.length === 0 && view.ui.length === 0 && cdpErrors.length === 0;
  checkDeferred(`${id}:zero-runtime-errors-no-error-element`, clean, { window: [from, view.now], consoleErrors: view.errors, errorUi: view.ui, cdpErrors });
  if (!clean) record("product-failure", { block: id, window: [from, view.now], consoleErrors: view.errors, errorUi: view.ui, cdpErrors, location: triple(await location()) });
  return view;
}
const expectWarn = async (id, expected) => {
  const warning = await ev("__native.warn()");
  const active = await ev("__native.unloadActive()");
  check(`${id}:beforeunload-${expected ? "warns" : "silent"}-zero-handler-attempts`, warning.warned === expected && warning.attempts === 0 && active === (expected ? 1 : 0), { warning, unloadListeners: active });
  return { ...warning, listeners: active };
};
/** Trusted activation of the Features-local "Reset to defaults"; the real window.confirm is answered by plan. */
async function clickReset(accept, id) {
  const names = await ev(`[...document.querySelectorAll(${JSON.stringify(RESET)})].map((button) => button.textContent.trim())`);
  pre(`${id}:reset-control-by-testid-and-name`, isDeepStrictEqual(names, [COPY.reset]), { names });
  const before = run.dialogs.length;
  run.dialogPlan.push({ accept });
  await run.trustedClick(page, RESET, `${id}:reset`);
  const deadline = Date.now() + 6000;
  while (run.dialogs.length === before && Date.now() < deadline) await delay(25);
  if (run.dialogs.length === before) run.dialogPlan.length = 0;
  const shown = run.dialogs.slice(before);
  check(`${id}:normative-confirmation-asked-once`, shown.length === 1 && shown[0].type === "confirm" && shown[0].message === COPY.confirm && shown[0].accepted === accept, { dialogs: shown });
  return shown;
}
/** A fresh Features entry pushed by a trusted sidebar click; it must mount clean with zero writes. */
async function newFeaturesEntry(id) {
  const before = await mark();
  await sidebarClick("Features");
  const ok = await until("verify.featuresMounted() && verify.location().pathname === '/app/settings/features'", 6000);
  await delay(450);
  const state = await snap(before);
  pre(`${id}:features-entry-mounted-clean`, ok && counters(state).pushState === 1 && recoveryOf(state)?.length === 0
    && mutationsOf(state.attempts.filter((item) => FEATURE_KEYS.includes(item.key))).length === 0, { counters: counters(state), recovery: recoveryOf(state) });
  return state.location;
}
/** A fresh Features entry pushed by the production router (from outside Settings). */
async function routerToFeatures(id) {
  const before = await mark();
  await ev('void verify.router.navigate("/app/settings/features"), true');
  const ok = await until("verify.featuresMounted() && verify.location().pathname === '/app/settings/features'", 6000);
  await delay(450);
  const state = await snap(before);
  pre(`${id}:features-entry-mounted-clean`, ok && counters(state).pushState === 1 && recoveryOf(state)?.length === 0
    && mutationsOf(state.attempts.filter((item) => FEATURE_KEYS.includes(item.key))).length === 0, { counters: counters(state), recovery: recoveryOf(state) });
  return state.location;
}
const visibleDownloads = () => readdirSync(run.downloads).filter((name) => !name.startsWith("."));
async function awaitDownload(timeout = 10000) {
  const file = join(run.downloads, "features-draft.json");
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const names = visibleDownloads();
    if (names.includes("features-draft.json") && !names.some((name) => name.endsWith(".crdownload"))) {
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
let harnessError = null;
try {
  page = await run.prepare();
  await runMatrix();
  pre("run:no-unexpected-javascript-dialogs", run.dialogs.every((item) => item.expected), { dialogs: run.dialogs });
  const network = await ev("__native.network").catch(() => []);
  pre("run:no-non-local-network-attempt", network.every((item) => item.local), { nonLocal: network.filter((item) => !item.local) });
  record("history-counters", historyCounters);
  check("run:deferred-row-gates-zero-failures", run.deferredFailures.length === 0, { deferredFailures: run.deferredFailures });
  check("run:runtime-errors-zero", run.runtimeErrors.length === 0, { runtimeErrors: run.runtimeErrors.slice(0, 5) });
} catch (error) {
  harnessError = error;
} finally {
  await run.finish(harnessError);
}

async function runMatrix() {
  // =============================================================================================
  // Setup: Settings host at About; baseline instruments
  // =============================================================================================
  await run.seed(page, {}, "setup");
  await page.cdp("Page.navigate", { url: `${run.origin}/app/settings/about` });
  pre("setup:host-mounted-at-about", await until("!!window.verify && verify.composition === 'settings-host-matrix' && verify.paneId() === 'about'", 20000));
  await delay(500);
  {
    const viewport = await ev("({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio })");
    const facts = await ev(`({ lockNames: Object.fromEntries(${JSON.stringify(IDS)}.map((id) => [id, verify.lockName(id)])), physicalKeys: verify.physicalKeys, scope: verify.scope(),
      historyWrapped: __native.historyWrapped(), navigateWrapped: verify.navigateWrapped(), navigationApi: __native.navigationApiPresent(),
      initialReplace: __native.window(0).history.filter((item) => item.method === 'replaceState' && item.idx === 0).length, physical: verify.physical(), rail: verify.rail() })`);
    const probe = await ev("__native.probe()");
    const unloadSelf = await ev("__native.unloadSelfTest()");
    record("host-baseline", { viewport, facts, probe, unloadSelf });
    pre("baseline:no-mount-runtime-errors", run.runtimeErrors.length === 0, { runtimeErrors: run.runtimeErrors.slice(0, 3) });
    pre("baseline:real-lock-names-and-unscoped-physical-keys", IDS.every((id) => facts.lockNames[id] === LOCK_OF(id)) && isDeepStrictEqual(facts.physicalKeys, FEATURE_KEYS), { lockNames: facts.lockNames });
    pre("baseline:storage-injector-fires", probe.logged === 1 && probe.threw === false && probe.last?.op === "get", { probe });
    pre("baseline:unload-listener-tracker-fires", isDeepStrictEqual(unloadSelf, { before: 0, during: 1, after: 0 }), { unloadSelf });
    pre("baseline:history-wrappers-intercept-router", facts.historyWrapped && facts.initialReplace === 1, facts);
    pre("baseline:coordinator-wraps-router-navigate-while-mounted", facts.navigateWrapped === true, facts);
    pre("baseline:navigation-api-present", facts.navigationApi === true, facts);
    pre("baseline:account-a-active", facts.scope.kind === "account" && facts.scope.accountId === "features-host-A", { scope: facts.scope });
    pre("baseline:features-bytes-absent-rail-complete", Object.values(facts.physical).every((value) => value === null) && IDS.every((id) => facts.rail.includes(LABEL[id])), { physical: facts.physical, rail: facts.rail });
  }
  runtimeMark = await mark();
  cdpErrorsSeen = run.runtimeErrors.length;

  // =============================================================================================
  // Phase 0: P entry; beforeunload source-only / clean
  // =============================================================================================
  const startEntry = await location();
  let since = await mark();
  await ev('void verify.router.navigate("/app/settings/date_time", { state: { token: "host-P" } }), true');
  pre("setup:p-mounted", await until("verify.paneId() === 'date_time'", 6000));
  const P = await location();
  {
    const w = await hostWindow(since);
    pre("setup:router-commit-and-push-trace-fire", counters(w).commits === 1 && counters(w).pushState === 1 && w.history[0].key === P.key
      && isDeepStrictEqual(w.history[0].usr, { token: "host-P" }) && isDeepStrictEqual(P.state, { token: "host-P" }) && P.key !== startEntry.key, { w, P });
  }
  // Source-only: malformed bytes for Tasks and a throwing getItem for Boards.
  await ev(`verify.seedRaw("tasks", "TRUE"), __native.denyGet([${JSON.stringify(keyOf("board"))}])`);
  since = await mark();
  await sidebarClick("Features");
  pre("setup:s-mounted-by-trusted-sidebar", await until("verify.featuresMounted() && verify.location().pathname === '/app/settings/features'", 6000));
  await delay(450);
  const S = await location();
  {
    const state = await snap(since);
    const featureMutations = mutationsOf(state.attempts.filter((item) => FEATURE_KEYS.includes(item.key)));
    const deniedBoardReads = state.attempts.filter((item) => item.op === "get" && item.key === keyOf("board") && item.outcome === "denied");
    pre("bu:source-only:faults-observed", state.physical.tasks === "TRUE" && deniedBoardReads.length >= 1, { physical: state.physical, deniedBoardReads: deniedBoardReads.length });
    check("bu:source-only:reload-only-alerts", isDeepStrictEqual(recoveryOf(state), [entry("tasks", "unavailable"), entry("board", "unavailable")]) && state.view.actions === null && state.view.status === "", { recovery: recoveryOf(state), actions: state.view.actions, status: state.view.status });
    check("bu:source-only:zero-mount-writes", featureMutations.length === 0 && state.physical.tasks === "TRUE", { featureMutations: short(featureMutations) });
    check("setup:s-has-own-key", S.key !== P.key && S.key !== "default" && S.state === null, { S });
    const warning = await expectWarn("bu:source-only", false);
    await ev('verify.signout("source-only")');
    const resolved = await until('verify.signouts["source-only"] === "true"', 3000);
    const dialog = await ev("__native.dialog()");
    check("bu:source-only:no-guard-sign-out-preflight-true", resolved && dialog === null, { signout: await ev('verify.signouts["source-only"]'), dialog });
    record("row", { row: "beforeunload", case: "source-only", recovery: recoveryOf(state), physical: state.physical, warning, signout: "true" });
    await runtimeClean("bu:source-only");
  }
  {
    await ev('__native.restore(), verify.seedRaw("tasks", null)');
    const before = await mark();
    await paneAction("Reload Tasks");
    await paneAction("Reload Boards");
    const cleared = await until(recoveryIs([]), 4000);
    await delay(200);
    const state = await snap(before);
    check("bu:clean:reload-repair-zero-writes-no-saved-claim", cleared && mutationsOf(state.attempts).length === 0 && state.view.status === "", { recovery: recoveryOf(state), mutations: short(mutationsOf(state.attempts)), status: state.view.status });
    const warning = await expectWarn("bu:clean", false);
    record("row", { row: "beforeunload", case: "clean", recovery: recoveryOf(state), warning });
    await runtimeClean("bu:clean");
  }

  // =============================================================================================
  // Row c: Back and guarded Forward with {pathname,key,state} identity (stack [.., P, S, X])
  // =============================================================================================
  since = await mark();
  await ev('void verify.router.navigate("/app/settings/hotkeys", { state: { token: "host-X" } }), true');
  pre("c:setup:x-mounted", await until("verify.paneId() === 'hotkeys'", 6000));
  const X = await location();
  pre("c:setup:x-pushed", counters(await hostWindow(since)).pushState === 1 && isDeepStrictEqual(X.state, { token: "host-X" }), { X });
  await traverseTo("c:setup:back-to-s", "back", S);
  const E0 = await stack();
  {
    const at = E0.currentIndex;
    pre("c:setup:stack-p-s-x", E0.browserEntries[at - 1]?.path === "/app/settings/date_time" && E0.browserEntries[at]?.path === "/app/settings/features"
      && E0.browserEntries[at + 1]?.path === "/app/settings/hotkeys" && E0.browserEntries.length === at + 2 && E0.navCurrent?.key && E0.navEntries.length >= 3, { stack: stackView(E0) });
    record("history-entries", { P: triple(P), S: triple(S), X: triple(X), stack: stackView(E0), navEntries: E0.navEntries });
  }
  const atIndex = (value, index) => value.currentIndex === index && value.navCurrent?.index === E0.navCurrent.index + (index - E0.currentIndex);
  async function guardedTraversal(id, direction) {
    const before = await mark();
    const step = await browserTraverse(id, direction);
    await awaitHeld(id, S, true);
    const heldStack = await stack();
    const heldWindow = counters(await hostWindow(before));
    check(`${id}:held-history-stack-intact`, sameEntries(heldStack, E0) && atIndex(heldStack, E0.currentIndex), { stack: stackView(heldStack) });
    check(`${id}:held-zero-push-replace-commit`, heldWindow.pushState === 0 && heldWindow.replaceState === 0 && heldWindow.commits === 0, { heldWindow });
    return { step, before, heldWindow };
  }
  const rowC = [];

  // c1 Back + Stay
  await failedEdit("c1", "tasks");
  {
    const { step, before, heldWindow } = await guardedTraversal("c1:back-stay", "back");
    await dialogAction(STAY);
    const closed = await until("__native.dialog() === null", 3000);
    await delay(200);
    const state = await snap(before);
    const after = await stack();
    check("c1:back-stay:location-deep-equal-s", closed && sameTriple(state.location, S) && state.windowPath === S.pathname, { location: triple(state.location), expected: triple(S) });
    check("c1:back-stay:history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex), { stack: stackView(after) });
    check("c1:back-stay:pane-and-draft-kept", state.pane === "features" && isDeepStrictEqual(recoveryOf(state), [entry("tasks", "not-saved")]) && state.view.switches.tasks === "false", { recovery: recoveryOf(state) });
    check("c1:back-stay:no-history-mutation", counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).commits === 0, counters(state));
    const warning = await expectWarn("c1:back-stay", true);
    rowC.push({ case: "c1 back-stay", counters: counters(state), heldWindow });
    record("row", { row: "c", case: "back-stay", target: step, expected: triple(S), observed: triple(state.location), heldWindow, counters: counters(state), stack: stackView(after), warning });
    await runtimeClean("c1");
  }
  // c2 Back + discard-and-leave
  {
    const { step, before } = await guardedTraversal("c2:back-discard", "back");
    await dialogAction(DISCARD_LEAVE);
    const left = await until(`verify.location().key === ${JSON.stringify(P.key)}`, 5000);
    await delay(300);
    const state = await snap(before);
    const after = await stack();
    check("c2:back-discard:location-deep-equal-p", left && sameTriple(state.location, P) && state.windowPath === P.pathname, { location: triple(state.location), expected: triple(P) });
    check("c2:back-discard:history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex - 1), { stack: stackView(after) });
    check("c2:back-discard:pop-release-once-no-push-replace", counters(state).commits === 1 && state.commits[0].key === P.key && counters(state).pushState === 0 && counters(state).replaceState === 0, counters(state));
    check("c2:back-discard:zero-writes-zero-removes", mutationsOf(state.attempts).length === 0 && state.physical.tasks === null && state.dialog === null && state.unloadActive === 0, { mutations: short(mutationsOf(state.attempts)), physical: state.physical.tasks });
    rowC.push({ case: "c2 back-discard-and-leave", counters: counters(state) });
    record("row", { row: "c", case: "back-discard-and-leave", target: step, expected: triple(P), observed: triple(state.location), counters: counters(state), commits: state.commits, stack: stackView(after), writes: mutationsOf(state.attempts).length });
    await runtimeClean("c2");
  }
  await traverseTo("c2:forward-to-s", "forward", S);
  // c3 Back + latest-completion release (the write held behind the real lock completes)
  await ev("__native.restore()");
  await heldEdit("c3", "board");
  {
    const { step, heldWindow } = await guardedTraversal("c3:back-latest", "back");
    const released = await mark();
    await ev(`__native.release(${JSON.stringify(LOCK_OF("board"))})`);
    const left = await until(`verify.location().key === ${JSON.stringify(P.key)}`, 6000);
    await delay(400);
    const state = await snap(released);
    const after = await stack();
    const sets = opsOn(state.attempts, "set", "board");
    check("c3:back-latest:location-deep-equal-p", left && sameTriple(state.location, P), { location: triple(state.location), expected: triple(P) });
    check("c3:back-latest:history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex - 1), { stack: stackView(after) });
    check("c3:back-latest:pop-release-once-no-push-replace", counters(state).commits === 1 && state.commits[0].key === P.key && counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).popstate === 1, counters(state));
    check("c3:back-latest:latest-persisted-once-dialog-closed", sets.length === 1 && sets[0].value === "false" && sets[0].outcome === "ok" && state.physical.board === "false" && state.dialog === null, { sets: short(sets), physical: state.physical.board });
    rowC.push({ case: "c3 back-latest-completion-release", heldWindow, counters: counters(state) });
    record("row", { row: "c", case: "back-latest-completion-release", target: step, expected: triple(P), observed: triple(state.location), counters: counters(state), commits: state.commits, stack: stackView(after), write: sets[0] });
    await runtimeClean("c3");
  }
  await traverseTo("c3:forward-to-s", "forward", S);
  // c4 guarded Forward + Stay
  await failedEdit("c4", "dashboard");
  {
    const { step, before, heldWindow } = await guardedTraversal("c4:forward-stay", "forward");
    await dialogAction(STAY);
    const closed = await until("__native.dialog() === null", 3000);
    await delay(200);
    const state = await snap(before);
    const after = await stack();
    check("c4:forward-stay:location-deep-equal-s", closed && sameTriple(state.location, S) && state.windowPath === S.pathname, { location: triple(state.location) });
    check("c4:forward-stay:history-stack-intact-forward-entry-kept", sameEntries(after, E0) && atIndex(after, E0.currentIndex), { stack: stackView(after) });
    check("c4:forward-stay:pane-and-draft-kept", state.pane === "features" && isDeepStrictEqual(recoveryOf(state), [entry("dashboard", "not-saved")]) && state.view.switches.dashboard === "false", { recovery: recoveryOf(state) });
    check("c4:forward-stay:no-history-mutation", counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).commits === 0, counters(state));
    const warning = await expectWarn("c4:forward-stay", true);
    rowC.push({ case: "c4 guarded-forward-stay", counters: counters(state), heldWindow });
    record("row", { row: "c", case: "guarded-forward-stay", target: step, expected: triple(S), observed: triple(state.location), heldWindow, counters: counters(state), stack: stackView(after), warning });
    await runtimeClean("c4");
  }
  // c5 guarded Forward + discard-and-leave
  {
    const { step, before } = await guardedTraversal("c5:forward-discard", "forward");
    await dialogAction(DISCARD_LEAVE);
    const left = await until(`verify.location().key === ${JSON.stringify(X.key)}`, 5000);
    await delay(300);
    const state = await snap(before);
    const after = await stack();
    check("c5:forward-discard:location-deep-equal-x", left && sameTriple(state.location, X) && state.windowPath === X.pathname, { location: triple(state.location), expected: triple(X) });
    check("c5:forward-discard:history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex + 1), { stack: stackView(after) });
    check("c5:forward-discard:pop-release-once-no-push-replace", counters(state).commits === 1 && state.commits[0].key === X.key && counters(state).pushState === 0 && counters(state).replaceState === 0, counters(state));
    check("c5:forward-discard:zero-writes-zero-removes", mutationsOf(state.attempts).length === 0 && state.physical.dashboard === null && state.dialog === null, { mutations: short(mutationsOf(state.attempts)) });
    rowC.push({ case: "c5 guarded-forward-discard-and-leave", counters: counters(state) });
    record("row", { row: "c", case: "guarded-forward-discard-and-leave", target: step, expected: triple(X), observed: triple(state.location), counters: counters(state), commits: state.commits, stack: stackView(after), writes: mutationsOf(state.attempts).length });
    await runtimeClean("c5");
  }
  await traverseTo("c5:back-to-s", "back", S);
  // c6 guarded Forward + latest-completion release
  await ev("__native.restore()");
  await heldEdit("c6", "calendar");
  {
    const { step, heldWindow } = await guardedTraversal("c6:forward-latest", "forward");
    const released = await mark();
    await ev(`__native.release(${JSON.stringify(LOCK_OF("calendar"))})`);
    const left = await until(`verify.location().key === ${JSON.stringify(X.key)}`, 6000);
    await delay(400);
    const state = await snap(released);
    const after = await stack();
    const sets = opsOn(state.attempts, "set", "calendar");
    check("c6:forward-latest:location-deep-equal-x", left && sameTriple(state.location, X), { location: triple(state.location), expected: triple(X) });
    check("c6:forward-latest:history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex + 1), { stack: stackView(after) });
    check("c6:forward-latest:pop-release-once-no-push-replace", counters(state).commits === 1 && state.commits[0].key === X.key && counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).popstate === 1, counters(state));
    check("c6:forward-latest:latest-persisted-once-dialog-closed", sets.length === 1 && sets[0].value === "false" && sets[0].outcome === "ok" && state.physical.calendar === "false" && state.dialog === null, { sets: short(sets) });
    rowC.push({ case: "c6 guarded-forward-latest-completion-release", heldWindow, counters: counters(state) });
    record("row", { row: "c", case: "guarded-forward-latest-completion-release", target: step, expected: triple(X), observed: triple(state.location), counters: counters(state), commits: state.commits, stack: stackView(after), write: sets[0] });
    await runtimeClean("c6");
  }
  await traverseTo("c6:back-to-s", "back", S);
  // c7 programmatic router.navigate(-1) + discard-and-leave; c8 router.navigate(1) + Stay
  await failedEdit("c7", "matrix");
  {
    const before = await mark();
    await ev("void verify.router.navigate(-1), true");
    await awaitHeld("c7:delta-back-discard", S, false);
    await dialogAction(DISCARD_LEAVE);
    const left = await until(`verify.location().key === ${JSON.stringify(P.key)}`, 5000);
    await delay(300);
    const state = await snap(before);
    const after = await stack();
    check("c7:delta-back-discard:location-deep-equal-p", left && sameTriple(state.location, P), { location: triple(state.location) });
    check("c7:delta-back-discard:history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex - 1), { stack: stackView(after) });
    check("c7:delta-back-discard:pop-release-once-no-push-replace-zero-writes", counters(state).commits === 1 && counters(state).pushState === 0 && counters(state).replaceState === 0 && mutationsOf(state.attempts).length === 0, { counters: counters(state), mutations: short(mutationsOf(state.attempts)) });
    rowC.push({ case: "c7 navigate(-1) discard", counters: counters(state) });
    record("row", { row: "c", case: "programmatic-navigate(-1)-discard", expected: triple(P), observed: triple(state.location), counters: counters(state), stack: stackView(after) });
    await runtimeClean("c7");
  }
  await traverseTo("c7:forward-to-s", "forward", S);
  await failedEdit("c8", "matrix");
  {
    const before = await mark();
    await ev("void verify.router.navigate(1), true");
    await awaitHeld("c8:delta-forward-stay", S, false);
    await dialogAction(STAY);
    const closed = await until("__native.dialog() === null", 3000);
    await delay(200);
    const state = await snap(before);
    const after = await stack();
    check("c8:delta-forward-stay:location-deep-equal-s-stack-intact", closed && sameTriple(state.location, S) && sameEntries(after, E0) && atIndex(after, E0.currentIndex), { location: triple(state.location), stack: stackView(after) });
    check("c8:delta-forward-stay:no-history-mutation-draft-kept", isDeepStrictEqual(counters(state), ZERO) && isDeepStrictEqual(recoveryOf(state), [entry("matrix", "not-saved")]), { counters: counters(state), recovery: recoveryOf(state) });
    rowC.push({ case: "c8 navigate(1) stay", counters: counters(state) });
    record("row", { row: "c", case: "programmatic-navigate(1)-stay", expected: triple(S), observed: triple(state.location), counters: counters(state), stack: stackView(after) });
    await runtimeClean("c8");
    const discardMark = await mark();
    await paneAction("Discard Matrix");
    const clean = await until(recoveryIs([]), 3000);
    const discarded = await snap(discardMark);
    pre("c8:cleanup:targeted-discard-zero-writes", clean && mutationsOf(discarded.attempts).length === 0, { mutations: short(mutationsOf(discarded.attempts)) });
    await ev("__native.restore()");
  }
  // c9–c11: latest-completion release by the user's Retry of an ordinary failed edit while a POP is held.
  async function retryRelease(id, field, direction, target, how) {
    const { intended } = await failedEdit(id, field);
    const before = await mark();
    const step = how === "browser" ? await browserTraverse(id, direction) : (await ev(direction === "back" ? "history.back(), true" : "history.forward(), true"), { script: `history.${direction}()` });
    await awaitHeld(id, S, true);
    const heldStack = await stack();
    const heldWindow = counters(await hostWindow(before));
    check(`${id}:held-history-stack-intact`, sameEntries(heldStack, E0) && atIndex(heldStack, E0.currentIndex) && heldWindow.commits === 0 && heldWindow.pushState === 0 && heldWindow.replaceState === 0, { stack: stackView(heldStack), heldWindow });
    await ev("__native.restore()");
    const released = await mark();
    await paneAction(`Retry ${LABEL[field]}`);
    const left = await until(`verify.location().key === ${JSON.stringify(target.key)}`, 6000);
    await delay(600);
    const state = await snap(released);
    const after = await stack();
    const sets = opsOn(state.attempts, "set", field);
    const targetIndex = E0.currentIndex + (direction === "back" ? -1 : 1);
    check(`${id}:location-deep-equal-target`, left && sameTriple(state.location, target) && state.windowPath === target.pathname, { location: triple(state.location), expected: triple(target) });
    check(`${id}:history-stack-intact`, sameEntries(after, E0) && atIndex(after, targetIndex), { stack: stackView(after) });
    check(`${id}:pop-release-once-no-push-replace`, counters(state).commits === 1 && state.commits[0].key === target.key && counters(state).pushState === 0 && counters(state).replaceState === 0 && counters(state).popstate === 1, counters(state));
    check(`${id}:latest-persisted-once-dialog-closed`, sets.length === 1 && sets[0].value === intended && sets[0].outcome === "ok" && state.physical[field] === intended && state.dialog === null, { sets: short(sets), intended });
    rowC.push({ case: `${id} retry-release (${how} ${direction})`, heldWindow, counters: counters(state) });
    record("row", { row: "c", case: `${id}:retry-release`, target: step, expected: triple(target), observed: triple(state.location), counters: counters(state), commits: state.commits, stack: stackView(after), write: sets[0] });
    await runtimeClean(id);
  }
  await retryRelease("c9:back-retry", "pomodoro", "back", P, "browser");
  await traverseTo("c9:forward-to-s", "forward", S);
  await retryRelease("c10:forward-retry", "habits", "forward", X, "browser");
  await traverseTo("c10:back-to-s", "back", S);
  await retryRelease("c11:script-back-retry", "meditation", "back", P, "script");
  await traverseTo("c11:forward-to-s", "forward", S);
  historyCounters.c = rowC;

  // =============================================================================================
  // Row i: same-field ordering; latest held behind the real lock; latest fails by an injected setItem
  // fault; Retry releases exactly once (POP variant: browser Back; PUSH variant: trusted sidebar)
  // =============================================================================================
  const rowI = [];
  async function sameFieldSetup(id, field) {
    const { name } = await heldEdit(`${id}:predecessor`, field);
    const queued = await ev(`__native.queueMiddle(${JSON.stringify(name)})`);
    const middleQueued = await until(`__native.lockQuery().then((query) => query.pending.filter((item) => item === ${JSON.stringify(name)}).length === 2)`, 3000);
    pre(`${id}:middle-request-queued-behind-engine`, queued === name && middleQueued && (await ev(`__native.middleAcquired(${JSON.stringify(name)})`)) === false, { queued });
    const before = await mark();
    await clickSwitch(field);
    await delay(300);
    const state = await snap(before);
    const appRequests = state.locks.filter((item) => item.by === "app" && item.name === name);
    pre(`${id}:latest-queued-in-hook-not-yet-at-engine`, appRequests.length === 0 && isDeepStrictEqual(recoveryOf(state), [entry(field, "saving")]), { appRequests, recovery: recoveryOf(state) });
    check(`${id}:latest-intent-displayed-while-held`, state.view.switches[field] === "true", { switches: state.view.switches });
    return name;
  }
  async function sameFieldOrdering(id, field, name, heldLocation, heldStack) {
    const m1 = await mark();
    await ev(`__native.denySetValue(${JSON.stringify(keyOf(field))}, "true")`);
    await ev(`__native.release(${JSON.stringify(name)})`);
    const predecessorDone = await until(`verify.physical()[${JSON.stringify(field)}] === "false" && __native.middleAcquired(${JSON.stringify(name)}) === true
      && __native.window(${m1}).locks.some((item) => item.by === "app" && item.name === ${JSON.stringify(name)})`, 6000);
    const latestWaiting = await until(`__native.lockQuery().then((query) => query.held.includes(${JSON.stringify(name)}) && query.pending.includes(${JSON.stringify(name)}))`, 3000);
    pre(`${id}:predecessor-completed-latest-genuinely-held-behind-real-lock`, predecessorDone && latestWaiting, { physical: await ev("verify.physical()"), locks: await ev("__native.lockQuery()") });
    await delay(300);
    const s1 = await snap(m1);
    const s1Stack = await stack();
    const predecessorSets = opsOn(s1.attempts, "set", field);
    check(`${id}:step1-predecessor-completed-one-write`, predecessorSets.length === 1 && predecessorSets[0].value === "false" && predecessorSets[0].outcome === "ok", { predecessorSets: short(predecessorSets) });
    check(`${id}:step2-location-held`, sameTriple(s1.location, heldLocation) && s1.windowPath === heldLocation.pathname && s1.pane === "features", { location: triple(s1.location) });
    check(`${id}:step2-dialog-open`, isDeepStrictEqual(s1.dialog, DIALOG), { dialog: s1.dialog });
    check(`${id}:step2-zero-history-mutations`, isDeepStrictEqual(counters(s1), ZERO) && sameEntries(s1Stack, heldStack) && s1Stack.currentIndex === heldStack.currentIndex, { counters: counters(s1), stack: stackView(s1Stack) });
    check(`${id}:step2-latest-pending-shown-no-saved-claim`, isDeepStrictEqual(recoveryOf(s1), [entry(field, "saving")]) && s1.view.status === "" && s1.view.switches[field] === "true", { recovery: recoveryOf(s1), status: s1.view.status });
    rowI.push({ case: `${id} step 2 (predecessor complete, latest held)`, counters: counters(s1) });
    record("row", { row: "i", case: `${id}:predecessor-complete-latest-held`, physical: s1.physical[field], location: triple(s1.location), dialog: s1.dialog !== null, counters: counters(s1), predecessorWrite: predecessorSets[0] });

    const m1b = await mark();
    await ev(`__native.releaseMiddle(${JSON.stringify(name)})`);
    const failed = await until(recoveryIs([entry(field, "not-saved")]), 6000);
    await delay(250);
    const s2 = await snap(m1b);
    const s2All = await snap(m1);
    const latestSets = opsOn(s2.attempts, "set", field);
    const latestReads = opsOn(s2.attempts, "get", field);
    pre(`${id}:step3-injected-setitem-fault-fired-on-latest-value`, failed && latestSets.length === 1 && latestSets[0].value === "true" && latestSets[0].outcome === "denied-value", { latestSets: short(latestSets) });
    check(`${id}:step3-latest-fails-through-setitem-fault-not-conflict`, latestReads.length >= 1 && latestReads[0].seq < latestSets[0].seq && s2.physical[field] === "false" && s2.view.status === "" && s2.view.switches[field] === "true", { latestReads: latestReads.length, physical: s2.physical[field] });
    check(`${id}:step3-still-held-zero-history-mutations`, sameTriple(s2.location, heldLocation) && isDeepStrictEqual(s2.dialog, DIALOG) && isDeepStrictEqual(counters(s2All), ZERO), { location: triple(s2.location), counters: counters(s2All) });
    rowI.push({ case: `${id} step 3 (latest failed by setItem fault)`, counters: counters(s2All) });
    record("row", { row: "i", case: `${id}:latest-failed-setitem-fault`, physical: s2.physical[field], latestWrite: latestSets[0], location: triple(s2.location), dialog: s2.dialog !== null, counters: counters(s2All) });
    await ev("__native.restore()");
    const m2 = await mark();
    await paneAction(`Retry ${LABEL[field]}`);
    return { m1, m2 };
  }

  pre("i-pop:setup:at-s-clean-tasks-absent", sameTriple(await location(), S) && (await ev("__native.features().recovery")).length === 0 && (await ev("verify.physical().tasks")) === null);
  {
    const name = await sameFieldSetup("i-pop", "tasks");
    const before = await mark();
    await browserTraverse("i-pop:back", "back");
    await awaitHeld("i-pop:back", S, true);
    const heldStack = await stack();
    pre("i-pop:held-stack", sameEntries(heldStack, E0) && heldStack.currentIndex === E0.currentIndex, { stack: stackView(heldStack) });
    const blockedTraversal = counters(await hostWindow(before));
    const { m2 } = await sameFieldOrdering("i-pop", "tasks", name, S, heldStack);
    const left = await until(`verify.location().key === ${JSON.stringify(P.key)}`, 6000);
    await delay(600);
    const s3 = await snap(m2);
    const after = await stack();
    const retrySets = opsOn(s3.attempts, "set", "tasks");
    check("i-pop:step4-retry-releases-exactly-once-to-intended-entry", left && counters(s3).commits === 1 && s3.commits[0].key === P.key && sameTriple(s3.location, P), { commits: s3.commits, location: triple(s3.location) });
    check("i-pop:step4-pop-release-zero-push-replace", counters(s3).pushState === 0 && counters(s3).replaceState === 0 && counters(s3).popstate === 1, counters(s3));
    check("i-pop:step4-dialog-closed-latest-persisted-once", s3.dialog === null && retrySets.length === 1 && retrySets[0].value === "true" && retrySets[0].outcome === "ok" && s3.physical.tasks === "true", { retrySets: short(retrySets), physical: s3.physical.tasks });
    check("i-pop:step4-history-stack-intact", sameEntries(after, E0) && atIndex(after, E0.currentIndex - 1), { stack: stackView(after) });
    rowI.push({ case: "i-pop blocked traversal", counters: blockedTraversal }, { case: "i-pop step 4 (Retry release)", counters: counters(s3) });
    record("row", { row: "i", case: "i-pop:retry-release", blockedTraversal, counters: counters(s3), commits: s3.commits, expected: triple(P), observed: triple(s3.location), stack: stackView(after), retryWrite: retrySets[0] });
    await runtimeClean("i-pop");
  }
  await traverseTo("i-pop:forward-to-s", "forward", S);
  pre("i-push:setup:dashboard-absent-clean", (await ev("verify.physical().dashboard")) === null && (await ev("__native.features().recovery")).length === 0);
  {
    const name = await sameFieldSetup("i-push", "dashboard");
    const before = await mark();
    await sidebarClick("Hotkeys");
    await awaitHeld("i-push:sidebar", S, false);
    const heldStack = await stack();
    const blockedSidebar = counters(await hostWindow(before));
    pre("i-push:held-no-mutation", blockedSidebar.commits === 0 && blockedSidebar.pushState === 0, blockedSidebar);
    const { m2 } = await sameFieldOrdering("i-push", "dashboard", name, S, heldStack);
    const left = await until("verify.location().pathname === '/app/settings/hotkeys'", 6000);
    await delay(600);
    const s3 = await snap(m2);
    const retrySets = opsOn(s3.attempts, "set", "dashboard");
    const pushes = s3.history.filter((item) => item.method === "pushState");
    check("i-push:step4-retry-releases-exactly-once-to-intended-entry", left && counters(s3).commits === 1 && s3.commits[0].pathname === "/app/settings/hotkeys" && s3.commits[0].key !== S.key && s3.commits[0].state === null && s3.commits[0].action === "PUSH", { commits: s3.commits });
    check("i-push:step4-one-push-for-the-commit-no-replace-no-pop", counters(s3).pushState === 1 && pushes[0].key === s3.commits[0].key && pushes[0].url === "/app/settings/hotkeys" && counters(s3).replaceState === 0 && counters(s3).popstate === 0, { counters: counters(s3), pushes });
    check("i-push:step4-dialog-closed-latest-persisted-once", s3.dialog === null && retrySets.length === 1 && retrySets[0].value === "true" && retrySets[0].outcome === "ok" && s3.physical.dashboard === "true", { retrySets: short(retrySets) });
    rowI.push({ case: "i-push blocked sidebar", counters: blockedSidebar }, { case: "i-push step 4 (Retry release)", counters: counters(s3) });
    record("row", { row: "i", case: "i-push:retry-release", blockedSidebar, counters: counters(s3), commits: s3.commits, pushes, observed: triple(s3.location), retryWrite: retrySets[0] });
    await runtimeClean("i-push");
  }
  historyCounters.i = rowI;

  // =============================================================================================
  // Row a: trusted, hit-tested production sidebar; ignored second activation while pending
  // =============================================================================================
  let current = await newFeaturesEntry("a:setup");
  await failedEdit("a", "matrix");
  {
    const stackBefore = await stack();
    const before = await mark();
    const point = await sidebarClick("Hotkeys");
    await awaitHeld("a:sidebar", current, false);
    const state = await snap(before);
    const trusted = state.events.some((item) => item.type === "click" && item.trusted && item.target === "sidebar:Hotkeys");
    check("a:sidebar:trusted-hit-tested-activation", trusted, { events: state.events.map((item) => `${item.type}:${item.target}:${item.trusted}`) });
    check("a:sidebar:no-history-mutation", isDeepStrictEqual(counters(state), ZERO) && sameEntries(await stack(), stackBefore), counters(state));
    const rows = await ev("verify.sidebarRows()");
    const second = rows.find((row) => row.label === "Date & Time" && row.uncovered) ?? rows.find((row) => row.uncovered && !["Features", "Hotkeys"].includes(row.label));
    pre("a:second-row-uncovered", Boolean(second), { rows });
    const secondMark = await mark();
    await sidebarClick(second.label);
    await delay(400);
    const ignored = await snap(secondMark);
    check("a:second-activation-ignored-while-pending", ignored.events.some((item) => item.type === "click" && item.trusted && item.target === `sidebar:${second.label}`)
      && isDeepStrictEqual(ignored.dialog, DIALOG) && sameTriple(ignored.location, current) && isDeepStrictEqual(counters(ignored), ZERO), { location: triple(ignored.location), counters: counters(ignored) });
    const discardMark = await mark();
    await dialogAction(DISCARD_LEAVE);
    const left = await until("verify.location().pathname !== '/app/settings/features'", 5000);
    await delay(300);
    const after = await snap(discardMark);
    check("a:first-intent-released-once-to-hotkeys", left && counters(after).commits === 1 && after.commits[0].pathname === "/app/settings/hotkeys" && counters(after).pushState === 1 && after.history[0].key === after.commits[0].key && counters(after).replaceState === 0, { commits: after.commits, counters: counters(after) });
    check("a:discard-zero-writes-zero-removes", mutationsOf(after.attempts).length === 0 && after.physical.matrix === null, { mutations: short(mutationsOf(after.attempts)), physical: after.physical.matrix });
    record("row", { row: "a", case: "trusted-sidebar-held-second-ignored-discard-release", point, heldLocation: triple(state.location), dialog: state.dialog, ignoredSecondRow: second.label, release: after.commits, counters: counters(after), writes: mutationsOf(after.attempts).length });
    await runtimeClean("a");
  }

  // =============================================================================================
  // Rows g and b: Stay, Escape, dialog export; fresh intents; AppRail and programmatic navigation
  // =============================================================================================
  current = await newFeaturesEntry("g:setup");
  await failedEdit("g", "matrix");
  {
    const stackBefore = await stack();
    const keep = async (id, since, dialogExpected) => {
      const state = await snap(since);
      const nowStack = await stack();
      check(`${id}:url-history-pane-kept`, sameTriple(state.location, current) && state.windowPath === current.pathname && sameEntries(nowStack, stackBefore) && nowStack.currentIndex === stackBefore.currentIndex
        && state.pane === "features" && isDeepStrictEqual(recoveryOf(state), [entry("matrix", "not-saved")]), { location: triple(state.location), recovery: recoveryOf(state), stack: stackView(nowStack) });
      check(`${id}:no-history-mutation`, isDeepStrictEqual(counters(state), ZERO), counters(state));
      check(`${id}:dialog-${dialogExpected ? "kept" : "closed"}`, dialogExpected ? isDeepStrictEqual(state.dialog, DIALOG) : state.dialog === null, { dialog: state.dialog });
      return state;
    };
    // g1 Stay, then a fresh intent prompts again.
    let since = await mark();
    await sidebarClick("Hotkeys");
    await awaitHeld("g1:intent", current, false);
    await dialogAction(STAY);
    await until("__native.dialog() === null", 3000);
    await delay(200);
    const g1 = await keep("g1:stay", since, false);
    check("g1:stay-trusted", g1.events.some((item) => item.type === "click" && item.trusted && item.target === "dialog:Stay"), {});
    await expectWarn("g1:stay", true);
    since = await mark();
    await sidebarClick("Hotkeys");
    await awaitHeld("g1:fresh-intent-after-stay-prompts-again", current, false);
    record("row", { row: "g", case: "stay-then-fresh-intent", location: triple(g1.location), counters: counters(g1), reprompted: true });
    await runtimeClean("g1");
    // g2 Escape (focus is inside the dialog), then a fresh AppRail intent (row b1).
    pre("g2:focus-inside-dialog", await ev("__native.focusInDialog()"));
    since = await mark();
    await pressEscape();
    await until("__native.dialog() === null", 3000);
    await delay(200);
    const g2 = await keep("g2:escape", since, false);
    check("g2:escape-trusted", g2.events.some((item) => item.type === "keydown" && item.trusted && item.key === "Escape"), { events: g2.events.map((item) => `${item.type}:${item.target}:${item.key ?? ""}:${item.trusted}`) });
    await expectWarn("g2:escape", true);
    record("row", { row: "g", case: "escape", location: triple(g2.location), counters: counters(g2) });
    await runtimeClean("g2");
    since = await mark();
    const railPoint = await railClick("Tasks");
    await awaitHeld("b1:apprail", current, false);
    const b1 = await keep("b1:apprail-held", since, true);
    check("b1:apprail-trusted", b1.events.some((item) => item.type === "click" && item.trusted && item.target === "rail:Tasks"), { events: b1.events.map((item) => `${item.type}:${item.target}:${item.trusted}`) });
    record("row", { row: "b", case: "apprail-tasks", point: railPoint, location: triple(b1.location), counters: counters(b1), dialog: b1.dialog });
    await runtimeClean("b1");
    await dialogAction(STAY);
    await until("__native.dialog() === null", 3000);
    // b2 programmatic module navigation.
    since = await mark();
    await ev('void verify.router.navigate("/app/tasks"), true');
    await awaitHeld("b2:programmatic-module", current, false);
    const b2 = await keep("b2:programmatic-held", since, true);
    record("row", { row: "b", case: "programmatic-/app/tasks", location: triple(b2.location), counters: counters(b2), dialog: b2.dialog });
    await runtimeClean("b2");
    // g3 export from the dialog keeps URL, history, pane and dialog.
    since = await mark();
    const traceBefore = await ev("({ url: __native.urlTrace(), anchors: __native.anchorTrace() })");
    pre("g3:download-directory-empty", visibleDownloads().length === 0, { names: readdirSync(run.downloads) });
    await dialogAction(EXPORT);
    const download = await awaitDownload();
    await delay(150);
    const g3 = await keep("g3:export", since, true);
    const traceAfter = await ev("({ url: __native.urlTrace(), anchors: __native.anchorTrace(), inDom: __native.anchorsInDom() })");
    const created = traceAfter.url.created.slice(traceBefore.url.created.length);
    const revoked = traceAfter.url.revoked.slice(traceBefore.url.revoked.length);
    const removed = traceAfter.anchors.removed.slice(traceBefore.anchors.removed.length);
    const payload = download ? JSON.parse(download.raw.toString("utf8")) : null;
    check("g3:export:actual-download-envelope", download !== null && isDeepStrictEqual(payload, { version: 1, kind: "features-draft", changes: { device: { matrix: { operation: "set", value: false } } } }), { payload, names: readdirSync(run.downloads) });
    check("g3:export:memory-only-one-url-revoked-anchor-removed", g3.attempts.length === 0 && created.length === 1 && revoked.length === 1 && revoked[0] === created[0] && removed.length === 1 && traceAfter.inDom === 0, { attempts: summarize(g3.attempts), created, revoked, removed });
    check("g3:export-trusted", g3.events.some((item) => item.type === "click" && item.trusted && item.target === `dialog:${EXPORT}`), {});
    record("row", { row: "g", case: "dialog-export", location: triple(g3.location), counters: counters(g3), dialog: g3.dialog, download: download ? { sha256: sha256(download.raw), bytes: download.raw.length, payload } : null, attempts: summarize(g3.attempts) });
    await runtimeClean("g3");
    if (download) rmSync(download.file);
    await dialogAction(STAY);
    await until("__native.dialog() === null", 3000);
    // A fresh intent after the export and Stay prompts again.
    since = await mark();
    await sidebarClick("Hotkeys");
    await awaitHeld("g3:fresh-intent-after-export-and-stay-prompts-again", current, false);
    await dialogAction(STAY);
    await until("__native.dialog() === null", 3000);
    await keep("g3:after-final-stay", since, false);
    await runtimeClean("g3-final");
  }

  // =============================================================================================
  // Row d: relative navigation, state and options replayed exactly
  // =============================================================================================
  {
    let since = await mark();
    await ev('void verify.router.navigate("../hotkeys", { relative: "path", state: { token: "host-d1" } }), true');
    await awaitHeld("d1:relative-push", current, false);
    const held = counters(await hostWindow(since));
    check("d1:held-no-history-mutation", isDeepStrictEqual(held, ZERO), held);
    await ev("__native.restore()");
    const m = await mark();
    await paneAction("Retry Matrix");
    const left = await until("verify.location().pathname === '/app/settings/hotkeys'", 6000);
    await delay(400);
    const state = await snap(m);
    const pushes = state.history.filter((item) => item.method === "pushState");
    check("d1:relative-path-and-state-replayed", left && counters(state).commits === 1 && state.commits[0].pathname === "/app/settings/hotkeys" && isDeepStrictEqual(state.commits[0].state, { token: "host-d1" }) && state.commits[0].action === "PUSH", { commits: state.commits });
    check("d1:one-push-with-state-no-replace", counters(state).pushState === 1 && isDeepStrictEqual(pushes[0].usr, { token: "host-d1" }) && pushes[0].key === state.commits[0].key && counters(state).replaceState === 0 && counters(state).popstate === 0, { pushes, counters: counters(state) });
    check("d1:latest-persisted-dialog-closed", state.dialog === null && state.physical.matrix === "false", { physical: state.physical.matrix });
    record("row", { row: "d", case: "relative-path-state-push", call: { to: "../hotkeys", options: { relative: "path", state: { token: "host-d1" } } }, commits: state.commits, pushes, counters: counters(state) });
    await runtimeClean("d1");
    await traverseTo("d1:back-to-features", "back", current);
    const { intended } = await failedEdit("d2", "habits");
    const lengthBefore = await ev("__native.historyLength()");
    const physicalBefore = await ev("verify.physical()");
    const stackBefore = await stack();
    since = await mark();
    await ev('void verify.router.navigate("../date_time", { relative: "path", state: { token: "host-d2" }, replace: true }), true');
    await awaitHeld("d2:relative-replace", current, false);
    const m2 = await mark();
    await dialogAction(DISCARD_LEAVE);
    const left2 = await until("verify.location().pathname === '/app/settings/date_time'", 6000);
    await delay(400);
    const state2 = await snap(m2);
    const replaces = state2.history.filter((item) => item.method === "replaceState");
    const stackAfter = await stack();
    check("d2:relative-path-state-replace-replayed", left2 && counters(state2).commits === 1 && state2.commits[0].pathname === "/app/settings/date_time" && isDeepStrictEqual(state2.commits[0].state, { token: "host-d2" }) && state2.commits[0].action === "REPLACE", { commits: state2.commits });
    check("d2:one-replace-with-state-no-push", counters(state2).replaceState === 1 && isDeepStrictEqual(replaces[0].usr, { token: "host-d2" }) && replaces[0].key === state2.commits[0].key && counters(state2).pushState === 0, { replaces, counters: counters(state2) });
    check("d2:history-length-and-index-unchanged", stackAfter.length === lengthBefore && stackAfter.currentIndex === stackBefore.currentIndex && stackAfter.browserEntries.length === stackBefore.browserEntries.length, { lengthBefore, stack: stackView(stackAfter) });
    check("d2:discard-zero-writes", mutationsOf(state2.attempts).length === 0 && isDeepStrictEqual(state2.physical, physicalBefore), { mutations: short(mutationsOf(state2.attempts)), physical: state2.physical, intendedDiscarded: intended });
    record("row", { row: "d", case: "relative-path-state-replace", call: { to: "../date_time", options: { relative: "path", state: { token: "host-d2" }, replace: true } }, commits: state2.commits, replaces, counters: counters(state2), historyLength: { before: lengthBefore, after: stackAfter.length } });
    await runtimeClean("d2");
    await ev("__native.restore()");
  }

  // =============================================================================================
  // Row e: voluntary sign-out through the real departure preflight
  // =============================================================================================
  current = await newFeaturesEntry("e:setup");
  {
    await ev('verify.signout("e1-clean")');
    const clean = await until('verify.signouts["e1-clean"] === "true"', 3000);
    check("e1:clean-sign-out-preflight-true-no-dialog", clean && (await ev("__native.dialog()")) === null, { signout: await ev('verify.signouts["e1-clean"]') });
    const { intended } = await failedEdit("e2", "tasks");
    let since = await mark();
    await ev('verify.signout("e2-stay")');
    await awaitHeld("e2:sign-out", current, false);
    pre("e2:sign-out-pending-while-held", (await ev('verify.signouts["e2-stay"]')) === "pending");
    await dialogAction(STAY);
    const resolved = await until('verify.signouts["e2-stay"] === "false"', 3000);
    await delay(200);
    const state = await snap(since);
    check("e2:stay-resolves-false", resolved && state.dialog === null, { signout: state.signouts["e2-stay"] });
    check("e2:stay-keeps-location-and-device-draft", sameTriple(state.location, current) && isDeepStrictEqual(recoveryOf(state), [entry("tasks", "not-saved")]) && state.view.switches.tasks === intended
      && isDeepStrictEqual(counters(state), ZERO) && state.physical.tasks === "true", { location: triple(state.location), recovery: recoveryOf(state), physical: state.physical.tasks });
    await expectWarn("e2:after-stay-draft-survives", true);
    record("row", { row: "e", case: "sign-out-stay", result: state.signouts["e2-stay"], cleanControl: "true", location: triple(state.location), counters: counters(state) });
    await runtimeClean("e2");
    since = await mark();
    await ev('verify.signout("e3-discard")');
    await awaitHeld("e3:sign-out", current, false);
    await dialogAction(DISCARD_LEAVE);
    const allowed = await until('verify.signouts["e3-discard"] === "true"', 3000);
    await delay(200);
    const discarded = await snap(since);
    check("e3:discard-resolves-true-zero-writes", allowed && mutationsOf(discarded.attempts).length === 0 && recoveryOf(discarded).length === 0 && sameTriple(discarded.location, current) && isDeepStrictEqual(counters(discarded), ZERO), { signout: discarded.signouts["e3-discard"], mutations: short(mutationsOf(discarded.attempts)) });
    await expectWarn("e3:after-discard", false);
    record("row", { row: "e", case: "sign-out-discard", result: discarded.signouts["e3-discard"], writes: mutationsOf(discarded.attempts).length });
    await runtimeClean("e3");
    await ev("__native.restore()");
  }

  // =============================================================================================
  // Row f: first same-turn intent wins (route vs route, route vs sign-out, sign-out vs route)
  // =============================================================================================
  await failedEdit("f1", "tasks");
  {
    const since = await mark();
    await ev('void verify.router.navigate("/app/settings/hotkeys"), void verify.router.navigate("/app/settings/date_time"), true');
    await awaitHeld("f1:route-vs-route", current, false);
    await dialogAction(DISCARD_LEAVE);
    const left = await until("verify.location().pathname !== '/app/settings/features'", 5000);
    await delay(400);
    const state = await snap(since);
    check("f1:first-route-wins-released-once", left && counters(state).commits === 1 && state.commits[0].pathname === "/app/settings/hotkeys" && counters(state).pushState === 1 && !state.history.some((item) => item.url.includes("date_time")), { commits: state.commits, history: state.history });
    check("f1:zero-writes", mutationsOf(state.attempts).length === 0, { mutations: short(mutationsOf(state.attempts)) });
    record("row", { row: "f", case: "route-vs-route", calls: ["/app/settings/hotkeys", "/app/settings/date_time"], commits: state.commits, counters: counters(state) });
    await runtimeClean("f1");
    await ev("__native.restore()");
  }
  current = await newFeaturesEntry("f2:setup");
  await failedEdit("f2", "tasks");
  {
    const since = await mark();
    await ev('void verify.router.navigate("/app/settings/hotkeys"), verify.signout("f2-later"), true');
    await awaitHeld("f2:route-vs-sign-out", current, false);
    const lost = await until('verify.signouts["f2-later"] === "false"', 3000);
    check("f2:later-sign-out-resolves-false-while-route-held", lost, { signout: await ev('verify.signouts["f2-later"]') });
    await dialogAction(DISCARD_LEAVE);
    const left = await until("verify.location().pathname === '/app/settings/hotkeys'", 5000);
    await delay(300);
    const state = await snap(since);
    check("f2:first-route-is-the-held-intent", left && counters(state).commits === 1 && state.commits[0].pathname === "/app/settings/hotkeys" && state.signouts["f2-later"] === "false" && mutationsOf(state.attempts).length === 0, { commits: state.commits, signout: state.signouts["f2-later"] });
    record("row", { row: "f", case: "route-vs-sign-out", signout: state.signouts["f2-later"], commits: state.commits, counters: counters(state) });
    await runtimeClean("f2");
    await ev("__native.restore()");
  }
  current = await newFeaturesEntry("f3:setup");
  await failedEdit("f3", "tasks");
  {
    const since = await mark();
    await ev('verify.signout("f3-first"), void verify.router.navigate("/app/settings/hotkeys"), true');
    await awaitHeld("f3:sign-out-vs-route", current, false);
    pre("f3:sign-out-pending", (await ev('verify.signouts["f3-first"]')) === "pending");
    await dialogAction(DISCARD_LEAVE);
    const allowed = await until('verify.signouts["f3-first"] === "true"', 3000);
    await delay(700);
    const state = await snap(since);
    check("f3:first-sign-out-wins-later-route-dropped", allowed && sameTriple(state.location, current) && isDeepStrictEqual(counters(state), ZERO) && mutationsOf(state.attempts).length === 0, { location: triple(state.location), counters: counters(state) });
    record("row", { row: "f", case: "sign-out-vs-route", signout: state.signouts["f3-first"], location: triple(state.location), counters: counters(state) });
    await runtimeClean("f3");
    await ev("__native.restore()");
  }

  // =============================================================================================
  // Row h: partial work; repairing one keeps holding; a newer edit and offscreen/hidden recovery hold
  // =============================================================================================
  pre("h:setup:clean-board-false-dashboard-true-calendar-false", (await ev("__native.features().recovery")).length === 0
    && isDeepStrictEqual(await ev("({ board: verify.physical().board, dashboard: verify.physical().dashboard, calendar: verify.physical().calendar })"), { board: "false", dashboard: "true", calendar: "false" }));
  await failedEdit("h", "board");
  await failedEdit("h", "dashboard");
  {
    pre("h:two-failing-fields", isDeepStrictEqual(await ev("__native.features().recovery"), [entry("board", "not-saved"), entry("dashboard", "not-saved")]));
    // Offscreen recovery: a shorter viewport and the pane scrolled to its end.
    await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1280, height: 420, deviceScaleFactor: 1, mobile: false });
    await delay(300);
    const scrolled = await ev("verify.scrollPaneToEnd()");
    await delay(200);
    const geometry = await ev('({ board: verify.recoveryGeometry("board"), dashboard: verify.recoveryGeometry("dashboard") })');
    pre("h:offscreen:both-recovery-blocks-out-of-view", geometry.board?.offscreen === true && geometry.dashboard?.offscreen === true, { scrolled, geometry });
    let since = await mark();
    await railClick("Tasks");
    await awaitHeld("h:offscreen", current, false);
    const offscreenState = await snap(since);
    const geometryWhileHeld = await ev('({ board: verify.recoveryGeometry("board"), dashboard: verify.recoveryGeometry("dashboard") })');
    check("h:offscreen:recovery-out-of-view-still-holds", counters(offscreenState).commits === 0 && counters(offscreenState).pushState === 0 && geometryWhileHeld.board?.offscreen === true && geometryWhileHeld.dashboard?.offscreen === true, { counters: counters(offscreenState), geometryWhileHeld });
    record("row", { row: "h", case: "offscreen-recovery-holds", geometry, geometryWhileHeld, scrolled, location: triple(offscreenState.location), counters: counters(offscreenState) });
    await runtimeClean("h-offscreen");
    await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await delay(300);
    await dialogAction(STAY);
    await until("__native.dialog() === null", 3000);
    // Hidden document: another foreground tab hides this page while a programmatic intent arrives.
    await page.cdp("Emulation.setFocusEmulationEnabled", { enabled: false });
    const { targetId } = await page.cdp("Target.createTarget", { url: "about:blank", background: false });
    await delay(500);
    const hidden = await ev("verify.visibility()");
    pre("h:hidden:page-hidden-by-foreground-tab", hidden === "hidden", { hidden });
    since = await mark();
    await ev('void verify.router.navigate("/app/tasks"), true');
    await delay(400);
    const hiddenState = await snap(since);
    check("h:hidden:intent-held-while-hidden", isDeepStrictEqual(hiddenState.dialog, DIALOG) && sameTriple(hiddenState.location, current) && counters(hiddenState).commits === 0, { dialog: hiddenState.dialog, location: triple(hiddenState.location) });
    await page.cdp("Target.closeTarget", { targetId });
    await page.cdp("Page.bringToFront");
    await delay(400);
    await page.cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
    const visible = await ev("verify.visibility()");
    const shown = await snap(since);
    check("h:hidden:still-held-when-visible-again", visible === "visible" && isDeepStrictEqual(shown.dialog, DIALOG) && sameTriple(shown.location, current) && counters(shown).commits === 0, { visible, location: triple(shown.location) });
    record("row", { row: "h", case: "hidden-document-holds", visibilityWhileHidden: hidden, visibilityAfter: visible, location: triple(shown.location), counters: counters(shown) });
    await runtimeClean("h-hidden");
    // Repair one of the two failing fields: still holding.
    await ev(`__native.restore(), __native.denySet([${JSON.stringify(keyOf("dashboard"))}])`);
    await paneAction("Retry Boards");
    const repaired = await until(recoveryIs([entry("dashboard", "not-saved")]), 5000);
    await delay(300);
    const one = await snap(since);
    check("h:repair-one-keeps-holding", repaired && one.physical.board === "true" && isDeepStrictEqual(one.dialog, DIALOG) && sameTriple(one.location, current) && counters(one).commits === 0 && counters(one).pushState === 0, { physical: one.physical.board, location: triple(one.location), counters: counters(one) });
    record("row", { row: "h", case: "repair-one-of-two", recovery: recoveryOf(one), physical: one.physical, counters: counters(one) });
    await runtimeClean("h-repair-one");
    // A newer edit (held behind the real lock) keeps holding after the last failure is repaired.
    await heldEdit("h:newer", "calendar");
    await ev("__native.restore()");
    await paneAction("Retry Dashboard");
    const dashboardRepaired = await until(recoveryIs([entry("calendar", "saving")]), 5000);
    await delay(300);
    const newer = await snap(since);
    check("h:newer-edit-keeps-holding", dashboardRepaired && newer.physical.dashboard === "false" && isDeepStrictEqual(newer.dialog, DIALOG) && sameTriple(newer.location, current) && counters(newer).commits === 0 && counters(newer).pushState === 0, { physical: newer.physical, counters: counters(newer) });
    record("row", { row: "h", case: "newer-edit-holds", recovery: recoveryOf(newer), physical: newer.physical, counters: counters(newer) });
    await runtimeClean("h-newer-edit");
    const m = await mark();
    await ev(`__native.release(${JSON.stringify(LOCK_OF("calendar"))})`);
    const left = await until("verify.location().pathname === '/app/tasks'", 6000);
    await delay(400);
    const released = await snap(m);
    check("h:last-work-releases-held-intent-once", left && counters(released).commits === 1 && released.commits[0].pathname === "/app/tasks" && counters(released).pushState === 1 && counters(released).replaceState === 0 && released.physical.calendar === "true", { commits: released.commits, counters: counters(released) });
    check("h:destination-rendered", released.destination.placeholder === "tasks" && released.destination.fallback === null, { destination: released.destination });
    record("row", { row: "h", case: "release-after-all-work-settles", commits: released.commits, counters: counters(released), physical: released.physical });
    await runtimeClean("h-release");
  }

  // =============================================================================================
  // Row j: Discard all and leave (dialog), and pane "Discard all changes" during a held intent
  // =============================================================================================
  current = await routerToFeatures("j:setup");
  {
    await ev(`__native.denySet(${JSON.stringify(FEATURE_KEYS)})`);
    for (const field of IDS) await failedEdit("j1", field);
    pre("j1:all-eight-failing", isDeepStrictEqual(await ev("__native.features().recovery"), IDS.map((field) => entry(field, "not-saved"))));
    const physicalBefore = await ev("verify.physical()");
    await sidebarClick("Hotkeys");
    await awaitHeld("j1:intent", current, false);
    const m = await mark();
    await dialogAction(DISCARD_LEAVE);
    const left = await until("verify.location().pathname === '/app/settings/hotkeys'", 5000);
    await delay(400);
    const state = await snap(m);
    check("j1:releases-once", left && counters(state).commits === 1 && state.commits[0].pathname === "/app/settings/hotkeys" && counters(state).pushState === 1 && counters(state).replaceState === 0 && counters(state).popstate === 0, { commits: state.commits, counters: counters(state) });
    check("j1:zero-writes-zero-removes-any-key", mutationsOf(state.attempts).length === 0 && isDeepStrictEqual(state.physical, physicalBefore), { mutations: short(mutationsOf(state.attempts)), physical: state.physical });
    check("j1:dialog-closed-unload-listener-gone", state.dialog === null && state.unloadActive === 0, { unloadActive: state.unloadActive });
    record("row", { row: "j", case: "dialog-discard-all-and-leave", drafts: 8, commits: state.commits, counters: counters(state), attempts: summarize(state.attempts), physical: state.physical });
    await runtimeClean("j1");
    await ev("__native.restore()");
  }
  current = await newFeaturesEntry("j2:setup");
  {
    await failedEdit("j2", "tasks");
    await failedEdit("j2", "pomodoro");
    const physicalBefore = await ev("verify.physical()");
    await ev('void verify.router.navigate("/app/settings/date_time"), true');
    await awaitHeld("j2:intent", current, false);
    const m = await mark();
    await run.clickButton(page, COPY.discardAll, `${PANE} .features-recovery-actions`);
    const left = await until("verify.location().pathname === '/app/settings/date_time'", 5000);
    await delay(400);
    const state = await snap(m);
    check("j2:pane-discard-all-releases-held-intent-once-zero-writes", left && counters(state).commits === 1 && counters(state).pushState === 1 && counters(state).replaceState === 0 && mutationsOf(state.attempts).length === 0
      && isDeepStrictEqual(state.physical, physicalBefore) && state.dialog === null, { commits: state.commits, counters: counters(state), mutations: short(mutationsOf(state.attempts)) });
    record("row", { row: "j", case: "pane-discard-all-during-held-intent", commits: state.commits, counters: counters(state), attempts: summarize(state.attempts) });
    await runtimeClean("j2");
    await ev("__native.restore()");
  }

  // =============================================================================================
  // Row m: reset batch release (two removeItem faults; Back in one run, AppRail in a second run)
  // =============================================================================================
  const rowM = [];
  async function resetBatch(id) {
    await ev('verify.seedRaw("calendar", "false"), verify.seedRaw("habits", "false")');
    const entryLocation = await newFeaturesEntry(`${id}:setup`);
    const seeded = await ev("verify.physical()");
    pre(`${id}:seeded-calendar-and-habits-false`, seeded.calendar === "false" && seeded.habits === "false", { seeded });
    await ev(`__native.denyRemove(${JSON.stringify([keyOf("calendar"), keyOf("habits")])})`);
    const since = await mark();
    await clickReset(true, id);
    const partial = await until(`${recoveryIs([entry("calendar", "not-reset"), entry("habits", "not-reset")])} && Object.entries(verify.physical()).every(([field, value]) => (field === "calendar" || field === "habits") ? value === "false" : value === null)`, 8000);
    await delay(300);
    const state = await snap(since);
    const removes = state.attempts.filter((item) => item.op === "remove");
    pre(`${id}:remove-faults-fired`, opsOn(state.attempts, "remove", "calendar").some((item) => item.outcome === "denied") && opsOn(state.attempts, "remove", "habits").some((item) => item.outcome === "denied"), { removes: short(removes) });
    check(`${id}:partial-reset-two-reset-drafts-no-writes`, partial && state.attempts.filter((item) => item.op === "set").length === 0 && state.view.status === "" && state.keyNull === 0, { recovery: recoveryOf(state), physical: state.physical, keyNull: state.keyNull });
    return entryLocation;
  }
  async function resetRelease(id, heldLocation, expectRelease) {
    const heldStack = await stack();
    const m1 = await mark();
    await ev(`__native.restore(), __native.denyRemove([${JSON.stringify(keyOf("habits"))}])`);
    await paneAction("Retry Calendar");
    const oneLeft = await until(recoveryIs([entry("habits", "not-reset")]), 6000);
    await delay(400);
    const s1 = await snap(m1);
    const s1Stack = await stack();
    const calendarRemoves = opsOn(s1.attempts, "remove", "calendar");
    check(`${id}:retry-first-faulted-field-succeeds`, oneLeft && calendarRemoves.length === 1 && calendarRemoves[0].outcome === "ok" && s1.physical.calendar === null && s1.attempts.filter((item) => item.op === "set").length === 0, { removes: short(calendarRemoves) });
    check(`${id}:departure-keeps-holding`, isDeepStrictEqual(s1.dialog, DIALOG) && sameTriple(s1.location, heldLocation) && isDeepStrictEqual(counters(s1), ZERO) && sameEntries(s1Stack, heldStack), { location: triple(s1.location), counters: counters(s1) });
    rowM.push({ case: `${id} after first Retry (still held)`, counters: counters(s1) });
    await runtimeClean(`${id}:first-retry`);
    await ev("__native.restore()");
    const m2 = await mark();
    await paneAction("Retry Habits");
    const left = await expectRelease.wait();
    await delay(600);
    const s2 = await snap(m2);
    const habitsRemoves = opsOn(s2.attempts, "remove", "habits");
    check(`${id}:retry-second-releases-exactly-once`, left && counters(s2).commits === 1 && expectRelease.commitOk(s2.commits[0]), { commits: s2.commits });
    check(`${id}:release-history-counters`, expectRelease.countersOk(counters(s2), s2), counters(s2));
    check(`${id}:dialog-closed-second-removed-once-no-writes`, s2.dialog === null && habitsRemoves.length === 1 && habitsRemoves[0].outcome === "ok" && s2.physical.habits === null && s2.attempts.filter((item) => item.op === "set").length === 0, { removes: short(habitsRemoves) });
    rowM.push({ case: `${id} after second Retry (released)`, counters: counters(s2), commits: s2.commits });
    record("row", { row: "m", case: id, firstRetry: counters(s1), release: counters(s2), commits: s2.commits });
    await runtimeClean(`${id}:release`);
    return s2;
  }
  // m1: Back departure.
  {
    const F = await resetBatch("m1-back");
    const back = await stack();
    const previous = back.browserEntries[back.currentIndex - 1];
    pre("m1-back:previous-entry-is-date-time", previous?.path === "/app/settings/date_time", { stack: stackView(back) });
    const before = await mark();
    await browserTraverse("m1-back:back", "back");
    await awaitHeld("m1-back:held", F, true);
    const blocked = counters(await hostWindow(before));
    pre("m1-back:held-no-commit", blocked.commits === 0 && blocked.pushState === 0 && blocked.replaceState === 0, blocked);
    rowM.push({ case: "m1-back blocked traversal", counters: blocked });
    let previousLocation = null;
    const s2 = await resetRelease("m1-back", F, {
      wait: async () => {
        const ok = await until("verify.location().pathname === '/app/settings/date_time'", 6000);
        previousLocation = await location();
        return ok;
      },
      commitOk: (commit) => commit.pathname === "/app/settings/date_time" && commit.action === "POP",
      countersOk: (value) => value.pushState === 0 && value.replaceState === 0 && value.popstate === 1,
    });
    const after = await stack();
    check("m1-back:history-stack-intact-at-previous", sameEntries(after, back) && after.currentIndex === back.currentIndex - 1, { stack: stackView(after) });
    record("row", { row: "m", case: "m1-back:released-to", location: previousLocation ? triple(previousLocation) : null, commits: s2.commits });
  }
  // m2: AppRail departure.
  {
    const F = await resetBatch("m2-apprail");
    const before = await mark();
    await railClick("Tasks");
    await awaitHeld("m2-apprail:held", F, false);
    const blocked = counters(await hostWindow(before));
    pre("m2-apprail:held-no-commit", isDeepStrictEqual(blocked, ZERO), blocked);
    rowM.push({ case: "m2-apprail blocked rail click", counters: blocked });
    await resetRelease("m2-apprail", F, {
      wait: () => until("verify.location().pathname === '/app/tasks'", 6000),
      commitOk: (commit) => commit.pathname === "/app/tasks" && commit.action === "PUSH",
      countersOk: (value, state) => value.pushState === 1 && state.history.find((item) => item.method === "pushState")?.key === state.commits[0].key && value.replaceState === 0 && value.popstate === 0,
    });
  }
  historyCounters.m = rowM;

  // =============================================================================================
  // Row n: held target turned off (AppRail departure to Boards; Boards turned off and committed)
  // =============================================================================================
  current = await routerToFeatures("n1:setup");
  {
    pre("n1:setup:boards-on-in-rail", (await ev("verify.physical().board")) === null && (await ev("verify.rail()")).includes("Boards"));
    await failedEdit("n1", "matrix");
    const since = await mark();
    await railClick("Boards");
    await awaitHeld("n1:apprail-boards", current, false);
    const held = await snap(since);
    check("n1:apprail-departure-to-boards-held", held.events.some((item) => item.type === "click" && item.trusted && item.target === "rail:Boards") && isDeepStrictEqual(counters(held), ZERO), { counters: counters(held) });
    const offMark = await mark();
    await clickSwitch("board");
    const committed = await until(`verify.physical().board === "false" && ${recoveryIs([entry("matrix", "not-saved")])}`, 6000);
    await delay(400);
    const off = await snap(offMark);
    const boardSets = opsOn(off.attempts, "set", "board");
    check("n1:boards-turned-off-write-committed", committed && boardSets.length === 1 && boardSets[0].value === "false" && boardSets[0].outcome === "ok", { sets: short(boardSets) });
    check("n1:still-held-after-target-turned-off", isDeepStrictEqual(off.dialog, DIALOG) && sameTriple(off.location, current) && isDeepStrictEqual(counters(off), ZERO), { location: triple(off.location), counters: counters(off) });
    check("n1:rail-no-longer-lists-boards", !off.rail.includes("Boards"), { rail: off.rail });
    await ev("__native.restore()");
    const m = await mark();
    await paneAction("Retry Matrix");
    const left = await until("verify.location().pathname === '/app/board'", 6000);
    await delay(500);
    const released = await snap(m);
    check("n1:releases-exactly-once-to-original-target-no-retargeting", left && counters(released).commits === 1 && released.commits[0].pathname === "/app/board" && released.commits[0].action === "PUSH"
      && counters(released).pushState === 1 && released.history[0].url === "/app/board" && counters(released).replaceState === 0 && counters(released).popstate === 0, { commits: released.commits, history: released.history });
    check("n1:route-renders-disabled-feature-fallback", released.destination.fallback?.featureId === "board" && released.destination.fallback?.title === "Boards" && released.destination.placeholder === null, { destination: released.destination });
    check("n1:matrix-persisted-dialog-closed", released.physical.matrix === "false" && released.dialog === null, { physical: released.physical.matrix });
    record("row", { row: "n", case: "n1:boards-turned-off-while-held", commits: released.commits, counters: counters(released), destination: released.destination, rail: released.rail });
    await runtimeClean("n1");
  }
  // n2: the held write itself turns the target off (Habits pending behind the real lock, AppRail to Habits).
  current = await routerToFeatures("n2:setup");
  {
    pre("n2:setup:habits-on-in-rail", (await ev("verify.physical().habits")) === null && (await ev("verify.rail()")).includes("Habits"));
    await heldEdit("n2", "habits");
    const since = await mark();
    await railClick("Habits");
    await awaitHeld("n2:apprail-habits", current, false);
    const held = await snap(since);
    check("n2:held-while-target-write-pending", isDeepStrictEqual(counters(held), ZERO) && isDeepStrictEqual(recoveryOf(held), [entry("habits", "saving")]), { counters: counters(held) });
    const m = await mark();
    await ev(`__native.release(${JSON.stringify(LOCK_OF("habits"))})`);
    const left = await until("verify.location().pathname === '/app/habits'", 6000);
    await delay(500);
    const released = await snap(m);
    const sets = opsOn(released.attempts, "set", "habits");
    check("n2:write-commits-then-releases-exactly-once-to-original-target", left && sets.length === 1 && sets[0].value === "false" && sets[0].outcome === "ok" && counters(released).commits === 1
      && released.commits[0].pathname === "/app/habits" && counters(released).pushState === 1 && counters(released).replaceState === 0, { commits: released.commits, sets: short(sets) });
    check("n2:route-renders-disabled-feature-fallback", released.destination.fallback?.featureId === "habits" && released.destination.placeholder === null && !released.rail.includes("Habits"), { destination: released.destination, rail: released.rail });
    record("row", { row: "n", case: "n2:held-write-turns-target-off", commits: released.commits, counters: counters(released), destination: released.destination });
    await runtimeClean("n2");
  }

  // =============================================================================================
  // Row k: epoch change cancels the old intent; fresh device protection still guards
  // =============================================================================================
  current = await routerToFeatures("k:setup");
  const { intended: kIntended } = await failedEdit("k", "tasks");
  {
    const start = await mark();
    const scopeA = await ev("verify.scope()");
    pre("k:starts-in-account-a", scopeA.kind === "account" && scopeA.accountId === "features-host-A", scopeA);
    await sidebarClick("Hotkeys");
    await awaitHeld("k1:intent", current, false);
    const toB = await ev("verify.activateB()");
    const cancelled = await until("__native.dialog() === null", 3000);
    await delay(300);
    const state = await snap(start);
    pre("k1:scope-b", toB.kind === "account" && toB.accountId === "features-host-B" && toB.epoch > scopeA.epoch, toB);
    check("k1:old-route-intent-cancelled", cancelled && sameTriple(state.location, current) && state.commits.length === 0 && counters(state).pushState === 0, { location: triple(state.location), counters: counters(state) });
    check("k1:device-draft-survives", isDeepStrictEqual(recoveryOf(state), [entry("tasks", "not-saved")]) && state.view.switches.tasks === kIntended, { recovery: recoveryOf(state) });
    await expectWarn("k1:after-epoch", true);
    await sidebarClick("Hotkeys");
    await awaitHeld("k1:fresh-device-protection-guards", current, false);
    await dialogAction(STAY);
    await until("__native.dialog() === null", 3000);
    await delay(600);
    const later = await snap(start);
    check("k1:old-intent-never-replayed", sameTriple(later.location, current) && later.commits.length === 0 && counters(later).pushState === 0, { counters: counters(later) });
    record("row", { row: "k", case: "route-epoch-a-to-b", from: scopeA, to: toB, location: triple(later.location), counters: counters(later), freshGuard: true });
    await runtimeClean("k1");

    await ev('verify.signout("k2-old")');
    await awaitHeld("k2:sign-out", current, false);
    const locked = await ev("verify.lockScope()");
    const resolved = await until('verify.signouts["k2-old"] === "false" && __native.dialog() === null', 3000);
    pre("k2:scope-locked", locked.kind === "locked" && locked.epoch > toB.epoch, locked);
    check("k2:old-sign-out-resolves-false", resolved, { signout: await ev('verify.signouts["k2-old"]') });
    check("k2:device-draft-survives", isDeepStrictEqual(await ev("__native.features().recovery"), [entry("tasks", "not-saved")]), {});
    await ev('verify.signout("k2-fresh")');
    await awaitHeld("k2:fresh-sign-out-guarded", current, false);
    await dialogAction(STAY);
    const freshFalse = await until('verify.signouts["k2-fresh"] === "false"', 3000);
    check("k2:fresh-sign-out-stay-false", freshFalse, {});
    record("row", { row: "k", case: "sign-out-epoch-b-to-locked", to: locked, oldResult: "false", freshResult: "false" });
    await runtimeClean("k2");

    const stackBefore = await stack();
    const popMark = await mark();
    await browserTraverse("k3:back", "back");
    await awaitHeld("k3:pop-intent", current, true);
    const toA = await ev("verify.activateA()");
    const popCancelled = await until("__native.dialog() === null", 3000);
    await delay(400);
    const popState = await snap(popMark);
    const popStack = await stack();
    check("k3:old-pop-intent-reset", popCancelled && sameTriple(popState.location, current) && popState.commits.length === 0 && counters(popState).pushState === 0 && sameEntries(popStack, stackBefore) && popStack.currentIndex === stackBefore.currentIndex, { location: triple(popState.location), counters: counters(popState), stack: stackView(popStack) });
    await browserTraverse("k3:back-fresh", "back");
    await awaitHeld("k3:fresh-pop-guarded", current, true);
    await dialogAction(STAY);
    await until("__native.dialog() === null", 3000);
    await delay(300);
    const final = await snap(popMark);
    check("k3:fresh-stay-keeps-entry-and-draft", sameTriple(final.location, current) && final.commits.length === 0 && isDeepStrictEqual(recoveryOf(final), [entry("tasks", "not-saved")]), { location: triple(final.location) });
    record("row", { row: "k", case: "pop-epoch-locked-to-a", to: toA, location: triple(final.location), counters: counters(final), stack: stackView(popStack) });
    await runtimeClean("k3");
  }

  // =============================================================================================
  // Row l: unmount removes the guard and the unload listener
  // =============================================================================================
  {
    await ev('verify.signout("l-pending")');
    await awaitHeld("l:sign-out-pending", current, false);
    await expectWarn("l:before-unmount", true);
    const physicalBefore = await ev("verify.physical()");
    const m = await mark();
    const children = await ev("verify.unmount()");
    const resolved = await until('verify.signouts["l-pending"] === "false"', 3000);
    await delay(200);
    const state = await ev(`({ unload: __native.window(${m}).unload, active: __native.unloadActive(), wrapped: verify.navigateWrapped(), attempts: __native.window(${m}).attempts, physical: verify.physical(), children: document.getElementById("root").childElementCount })`);
    const warning = await ev("__native.warn()");
    check("l:unmount-settles-pending-sign-out-false", children === 0 && state.children === 0 && resolved, { children, signout: await ev('verify.signouts["l-pending"]') });
    check("l:unload-listener-removed", state.active === 0 && state.unload.some((item) => item.op === "remove") && warning.warned === false && warning.attempts === 0, { unload: state.unload, warning });
    check("l:coordinator-router-wrapper-removed", state.wrapped === false, { wrapped: state.wrapped });
    check("l:unmount-zero-writes-committed-bytes-kept", mutationsOf(state.attempts).length === 0 && isDeepStrictEqual(state.physical, physicalBefore), { mutations: short(mutationsOf(state.attempts)) });
    await ev('verify.signout("l-after")');
    const afterSignout = await until('verify.signouts["l-after"] === "true"', 3000);
    check("l:guard-removed-sign-out-preflight-true", afterSignout, { signout: await ev('verify.signouts["l-after"]') });
    const navMark = await mark();
    await ev('void verify.router.navigate("/app/tasks"), true');
    const moved = await until("verify.location().pathname === '/app/tasks'", 3000);
    const w = counters(await hostWindow(navMark));
    check("l:no-blocker-remains-navigation-commits", moved && w.commits === 1 && w.pushState === 1, w);
    record("row", { row: "l", case: "unmount", signoutPending: "false", unloadListeners: state.active, warning, navigateWrapped: state.wrapped, signoutAfter: "true", navigationAfter: w });
    await runtimeClean("l");
  }
  const tail = await ev("__native.window(0).storageDispatches.filter((item) => item.key === null).length");
  check("run:zero-key-null-storage-event-dispatches", tail === 0, { keyNull: tail });
}
