/**
 * CP-FEATURES-01 batch 28 (contract §14 E13): the fixed Settings Features caller in real headless Chrome, in the
 * production App composition (only the auth session is synthetic): contract §10 items 2–7 — rail truth, route
 * truth, search truth, cross-module isolation (zero key:null StorageEvents, no account relock, gate screen or host
 * remount, App appearance / AppRail order / DesktopPet unchanged in every rendered frame and in bytes, the AppRail
 * drag after a reset), unrelated keys and two-document propagation. Parent-role native verifier; verification
 * only: it repairs nothing, implements nothing, accepts nothing and changes no product file, contract, ledger or
 * existing evidence.
 *
 * Usage, from the root of a worktree whose HEAD carries this directory:
 *   XAI_DEPS_ROOT=<checkout with node_modules> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-features-recovery-native/verify-native-downstream.mjs <fixed revision> downstream <suffix>
 *
 * Composition: ./native-downstream.tsx (production App via the production router instance; the real
 * WebAuthSessionProvider with a synthetic session client). Instruments: ./native-host-prelude.js. Harness:
 * ./native-host-harness.mjs (archive, pin + guard, lockfile gate, local server, Chrome, log). The second document is
 * a second page target of the same browser profile loading the same production App page.
 * Input: CDP trusted mouse/key events after a centre hit-test; the real window.confirm answered by plan; the AppRail
 * drag through Input.setInterceptDrags + Input.dispatchDragEvent (pattern of ./verify-native-before.mjs).
 */
import { isDeepStrictEqual } from "node:util";
import { createRun, IDS, LABEL, keyOf, FEATURE_KEYS, LOCK_OF, PANE, SWITCH, RESET, COPY, entry, ACTIONS, summarize, mutationsOf, short, delay } from "./native-host-harness.mjs";

const REQUIRED = [
  "apps/web/src/App.tsx",
  "apps/web/src/routes/router.tsx",
  "apps/web/src/routes/RouteGateElements.tsx",
  "apps/web/src/providers/AppProviders.tsx",
  "apps/web/src/providers/AccountStorageGate.tsx",
  "apps/web/src/routes/modules/shellRegistrations.tsx",
  "apps/web/src/routes/modules/composedSettingsRegistration.tsx",
  "apps/web/src/routes/modules/departureCoordinator.tsx",
  "apps/web/src/routes/modules/settingsDeparture.ts",
  "apps/web/src/routes/modules/settingsPaneComposition.ts",
  "packages/plugin-web-storage/src/AccountDataGate.tsx",
  "packages/plugin-web-storage/src/internal/usePref.ts",
  "packages/plugin-web-storage/src/internal/storage.ts",
  "packages/plugin-web-storage/src/internal/sameTabBus.ts",
  "packages/plugin-web-storage/src/internal/accountScope.ts",
  "packages/plugin-web-storage/src/internal/registry.ts",
  "packages/plugin-web-storage/src/internal/codec.ts",
  "packages/plugin-web-storage/src/internal/prefMutation.ts",
  "packages/plugin-web-storage/src/internal/usePrefAsync.ts",
  "packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts",
  "packages/plugin-web-storage/src/internal/accountCoordination.ts",
  "packages/xai-web-settings-features-panel/src/FeaturesPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresPane.tsx",
  "packages/xai-web-settings-features-panel/src/internal/featuresRecovery.ts",
  "packages/xai-web-settings-features-panel/src/internal/featuresRecoveryCopy.ts",
  "packages/xai-web-settings-features-panel/src/useFeaturePrefs.ts",
  "packages/xai-web-settings-features-panel/src/filterModulesByFeaturePrefs.ts",
  "packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx",
  "packages/xai-web-settings-features-panel/src/DisabledFeatureFallback.tsx",
  "packages/xai-web-settings-features-panel/src/featureIds.ts",
  "packages/xai-web-settings-features-panel/src/styles.css",
  "packages/plugin-web-settings-shell/src/SettingsFooter.tsx",
  "packages/plugin-web-settings-shell/src/internal/confirmAction.ts",
  "packages/plugin-web-settings-shell/src/Toggle.tsx",
  "packages/xai-web-shell/src/AppRail.tsx",
  "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/Topbar.tsx",
  "packages/xai-web-pet/src/DesktopPet.tsx",
  "packages/xai-web-cmdk/src/CommandPalette.tsx",
  "packages/xai-web-cmdk/src/internal/readModuleStates.ts",
  "packages/xai-web-cmdk/src/internal/buildIndex.ts",
  "packages/xai-web-event-bus/src/emitter.ts",
  "packages/plugin-web-tokens/src/apply.ts",
  "packages/plugin-web-board-workspaces/src/registration.tsx",
  "packages/web-auth-device-session/src/session.tsx",
  "packages/web-auth-device-session/src/guards.tsx",
];
const run = createRun({ runnerUrl: import.meta.url, mode: "downstream", fixture: "native-downstream.tsx", requiredModules: REQUIRED });
const { pre, check, record } = run;
let page = null;
let doc2 = null;
const ev = (expression) => page.evaluate(expression);
const until = (expression, timeout) => page.waitUntil(expression, timeout);

const OWNER = "features-native-A";
const MARKER_KEY = `xai:account:v1:${encodeURIComponent(OWNER)}:committed-generation`;
const MARKER = JSON.stringify({ generation: "g1", migrationId: "features-native", previous: null });
const APPEARANCE_KEYS = ["xai_accent_hue", "xai_bg_tone", "xai_rail_pos", "xai_rail_order", "xai_pet_id", "xai_pet_pos"];
/** CmdK module-jump labels (EN) of the 8 toggleable modules: MODULE_LABEL.en in packages/xai-web-cmdk/src/adapters/*.ts. */
const CMDK_LABEL = { tasks: "Tasks", board: "Boards", dashboard: "Dashboard", calendar: "Calendar", matrix: "Matrix", pomodoro: "Pomodoro", habits: "Habits", meditation: "Meditation" };
const SEARCH_BOX = ".topbar button.search-box";
const READY_FEATURES = `(() => !!window.verify && !!window.__native && verify.composition === 'production-app' && !!document.querySelector('${PANE}')
  && document.querySelectorAll('${PANE} [data-feature-id] [role="switch"]').length === 8 && !document.querySelector('.account-data-gate') && verify.scope().kind === 'account'
  && document.querySelectorAll('.app-rail .rail-items .rail-btn').length > 0 && !!document.querySelector('.pet-wrap'))()`;
const READY_BOARD_ROUTE = `(() => !!window.verify && !!window.__native && verify.composition === 'production-app' && verify.scope().kind === 'account' && !document.querySelector('.account-data-gate')
  && document.querySelectorAll('.app-rail .rail-items .rail-btn').length > 0 && (!!document.querySelector('.disabled-feature-fallback') || !!document.querySelector('[data-testid="board-workspaces-module"]')))()`;
const recoveryIs = (expected) => `JSON.stringify(__native.features()?.recovery) === ${JSON.stringify(JSON.stringify(expected))}`;
const statusIs = (text) => `__native.features()?.status === ${JSON.stringify(text)}`;
const physicalIs = (raw) => `JSON.stringify(Object.fromEntries(${JSON.stringify(IDS)}.map((id) => [id, __native.native.get("xai_pref_features_" + id)]))) === ${JSON.stringify(JSON.stringify(raw))}`;
const allOf = (value) => Object.fromEntries(IDS.map((id) => [id, value]));
const opsOn = (list, op, id) => list.filter((item) => item.op === op && item.key === keyOf(id));

let NAV = null;
let CUSTOM = null;
let RAIL_IDS = null;
let BASE = null;
const labelOf = (id) => NAV[id] ?? id;
/** Rail labels derived from the stored custom order and the committed feature bytes (contract §10 items 2 and 5). */
const expectedRail = (bytes) => CUSTOM.filter((id) => !IDS.includes(id) || bytes[id] !== "false").map(labelOf);
const disabledOf = (bytes) => IDS.filter((id) => bytes[id] === "false");
/** A frame's rail keeps the stored order: a subsequence of the custom order, every non-toggleable module present. */
function railFrameOk(rail, allowedMissing) {
  const labels = rail === "" ? [] : rail.split("|");
  const order = CUSTOM.map(labelOf);
  let last = -1;
  for (const label of labels) {
    const index = order.indexOf(label);
    if (index <= last) return false;
    last = index;
  }
  const missing = order.filter((label) => !labels.includes(label));
  return missing.every((label) => allowedMissing.includes(label));
}
/** The App's displayed appearance, rail position and pet values (computed styles and inline position). */
const visual = (computed) => ({
  accentHue: computed.accentHue, accent: computed.accent, bgApp: computed.bgApp, bodyBackground: computed.bodyBackground, bgTone: computed.bgTone,
  htmlRailPos: computed.htmlRailPos, appRailPos: computed.appRailPos, railDataPos: computed.railDataPos, railGrid: computed.railGrid,
  railX: computed.railRect ? { left: computed.railRect.left, right: computed.railRect.right, width: computed.railRect.width } : null,
  petAnim: computed.petAnim, petArtFnv: computed.petArtFnv, petTransform: computed.petTransform, petPosition: computed.petPosition,
});

// ---------------------------------------------------------------------------------------------------
// Page helpers
// ---------------------------------------------------------------------------------------------------
const mark = (session = page) => session.evaluate("__native.mark()");
const featureBytes = (session = page) => session.evaluate(`Object.fromEntries(${JSON.stringify(IDS)}.map((id) => [id, __native.native.get("xai_pref_features_" + id)]))`);
const bytesOf = (keys, session = page) => session.evaluate(`Object.fromEntries(${JSON.stringify(keys)}.map((key) => [key, __native.native.get(key)]))`);
async function devtoolsBytes(keys, session = page) {
  const { entries } = await session.cdp("DOMStorage.getDOMStorageItems", { storageId: { storageKey: `${run.origin}/`, isLocalStorage: true } });
  const map = Object.fromEntries(entries);
  return Object.fromEntries(keys.map((key) => [key, Object.hasOwn(map, key) ? map[key] : null]));
}
const nonFeatureSnapshot = (session = page) => session.evaluate(`(() => { const all = __native.native.snapshot(); for (const key of ${JSON.stringify(FEATURE_KEYS)}) delete all[key]; return all; })()`);
const view = (session = page) => session.evaluate("__native.features()");
const clickSwitch = (field, session = page) => run.trustedClick(session, SWITCH(field), `${session.label}:switch:${field}`);
const paneAction = (name, session = page) => run.clickButton(session, name, PANE);

async function mountApp(session, label, path, ready = READY_FEATURES) {
  const errorsBefore = run.runtimeErrors.length;
  await session.cdp("Page.navigate", { url: `${run.origin}${path}` });
  const ok = await session.waitUntil(ready, 20000);
  if (!ok) {
    const diagnostics = await session.evaluate("({ path: location.pathname, text: (document.body.innerText || '').slice(0, 300), verify: !!window.verify, scope: window.verify ? verify.scope() : null })").catch((error) => ({ error: String(error) }));
    pre(`${label}:production-app-mounted`, false, { diagnostics, runtimeErrors: run.runtimeErrors.slice(errorsBefore, errorsBefore + 5) });
  }
  await delay(800);
  const facts = await session.evaluate(`({ composition: verify.composition, instance: verify.instance, scope: verify.scope(), auth: verify.authCalls(), markerKey: verify.markerKey,
    lockNames: Object.fromEntries(${JSON.stringify(IDS)}.map((id) => [id, verify.lockName(id)])), physicalKeys: verify.physicalKeys,
    rail: verify.rail(), pet: !!document.querySelector('.pet-wrap'), network: __native.network.filter((item) => !item.local).length, path: location.pathname })`);
  pre(`${label}:production-app-mounted`, true, { composition: facts.composition, instance: facts.instance, path: facts.path, doc: session.label });
  pre(`${label}:auth-session-context-served-by-real-provider`, facts.composition === "production-app" && facts.auth.getSession >= 1 && facts.markerKey === MARKER_KEY, { auth: facts.auth });
  pre(`${label}:account-data-gate-activated-account`, facts.scope.kind === "account" && facts.scope.accountId === OWNER && facts.scope.generation === "g1", { scope: facts.scope });
  pre(`${label}:production-surfaces-present`, facts.rail.length > 0 && facts.pet, { rail: facts.rail.length, pet: facts.pet });
  pre(`${label}:real-lock-names-and-unscoped-physical-keys`, IDS.every((id) => facts.lockNames[id] === LOCK_OF(id)) && isDeepStrictEqual(facts.physicalKeys, FEATURE_KEYS), { lockNames: facts.lockNames });
  pre(`${label}:no-non-local-network-attempt`, facts.network === 0);
  const exceptions = run.runtimeErrors.slice(errorsBefore).filter((item) => item.kind === "exception");
  pre(`${label}:no-uncaught-exception-at-mount`, exceptions.length === 0, { exceptions: exceptions.slice(0, 3) });
  return facts;
}
/** The mounted App shows the seeded appearance, rail position, custom rail order (filtered by committed bytes) and pet. */
async function mountMatchesBaseline(label, session = page) {
  const snapshot = await session.evaluate("__native.snapshot()");
  const bytes = await featureBytes(session);
  check(`${label}:appearance-pet-and-rail-position-displayed`, isDeepStrictEqual(visual(snapshot.computed), visual(BASE.computed)), { observed: visual(snapshot.computed), expected: visual(BASE.computed) });
  check(`${label}:rail-order-derived-from-stored-order-and-committed-bytes`, isDeepStrictEqual(snapshot.railOrder, expectedRail(bytes)), { observed: snapshot.railOrder, expected: expectedRail(bytes), bytes });
  return snapshot;
}
async function paletteLabels(session, id) {
  await run.trustedClick(session, SEARCH_BOX, `${id}:search-box`);
  const opened = await session.waitUntil("__native.cmdk().open && __native.cmdk().labels.length > 0", 4000);
  const palette = await session.evaluate("__native.cmdk()");
  const focusInModal = await session.evaluate("!!document.activeElement?.closest?.('.cmdk-modal')");
  pre(`${id}:palette-opened-by-trusted-search-click`, opened && focusInModal, { palette, focusInModal });
  await run.pressKey(session, "Escape", "Escape", 27);
  const closed = await session.waitUntil("!__native.cmdk().open", 3000);
  pre(`${id}:palette-closed-by-escape`, closed);
  return palette.labels;
}
/** Search truth: at palette open, the 8 toggleable modules are listed exactly when their committed bytes are not "false". */
async function searchTruth(id, session = page) {
  const labels = await paletteLabels(session, id);
  const bytes = await featureBytes(session);
  const listed = IDS.filter((field) => labels.includes(CMDK_LABEL[field]));
  const expected = IDS.filter((field) => bytes[field] !== "false");
  check(`${id}:cmdk-lists-toggleable-modules-by-committed-bytes-only`, isDeepStrictEqual(listed, expected), { listed, expected, bytes, labels });
  record("search", { id, doc: session.label, labels, listed, bytes });
  return listed;
}
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
}

/**
 * One Features operation in the production App with every cross-module isolation instrument armed around it
 * (contract §10 item 5): key:null StorageEvents, account scope transitions, gate screen, host remount, every
 * rendered frame's appearance / rail order / pet values, the displayed values and bytes afterwards.
 */
const totals = { operations: 0, keyNullDispatched: 0, keyNullReceived: 0, scopeTransitions: 0, gateInsertions: 0, watchedRemovals: 0, replacedNodes: 0, frames: 0, changedFrames: 0 };
async function isolatedOp(name, act, { unrelatedMustHold = false } = {}) {
  const committedBefore = await featureBytes();
  const appearanceBefore = await bytesOf(APPEARANCE_KEYS);
  const unrelatedBefore = await nonFeatureSnapshot();
  const marked = await ev("__native.markElements()");
  pre(`${name}:surfaces-marked`, ["shell", "rail", "pet", "settingsShell", "sidebar", "detail", "pane"].every((part) => marked.includes(part)), { marked });
  const instance = await ev("verify.instance");
  await ev("__native.startDom() && __native.startFrames()");
  const since = await mark();
  const outcome = await act(since);
  await delay(300);
  const frames = await ev("__native.stopFrames()");
  const dom = await ev("__native.stopDom()");
  const fates = await ev("__native.elementFates()");
  const w = await ev(`(() => { const w = __native.window(${since}); return { dispatched: w.storageDispatches, received: w.storageReceived, attempts: w.attempts }; })()`);
  const scopeAfter = await ev(`verify.scopeAfter(${since})`);
  const scope = await ev("verify.scope()");
  const snapshot = await ev("__native.snapshot()");
  const committedAfter = await featureBytes();
  const appearanceAfter = await bytesOf(APPEARANCE_KEYS);
  const appearanceDevtools = await devtoolsBytes(APPEARANCE_KEYS);
  const unrelatedAfter = await nonFeatureSnapshot();
  const keyNullDispatched = w.dispatched.filter((item) => item.key === null).length;
  const keyNullReceived = w.received.filter((item) => item.key === null).length;
  const gateInsertions = dom.dom.filter((item) => item.kind === "added" && item.what.includes("gate")).length;
  const watchedRemovals = dom.dom.filter((item) => item.kind === "removed").length;
  const replaced = Object.entries(fates).filter(([, fate]) => fate.marked && !fate.sameNode).map(([part]) => part);
  const allowedMissing = [...new Set([...disabledOf(committedBefore), ...disabledOf(committedAfter)])].map(labelOf);
  const base = BASE.probe;
  const changedFrames = frames.filter((frame) => frame.gate || !frame.pane || frame.hue !== base.hue || frame.tone !== base.tone || frame.railPos !== base.railPos || frame.railDataPos !== base.railDataPos
    || frame.petAnim !== base.petAnim || frame.petTransform !== base.petTransform || !railFrameOk(frame.rail, allowedMissing));
  const changedKeys = [...new Set([...Object.keys(unrelatedBefore), ...Object.keys(unrelatedAfter)])].filter((key) => unrelatedBefore[key] !== unrelatedAfter[key]);
  totals.operations += 1;
  totals.keyNullDispatched += keyNullDispatched;
  totals.keyNullReceived += keyNullReceived;
  totals.scopeTransitions += scopeAfter.length;
  totals.gateInsertions += gateInsertions;
  totals.watchedRemovals += watchedRemovals;
  totals.replacedNodes += replaced.length;
  totals.frames += frames.length;
  totals.changedFrames += changedFrames.length;
  check(`${name}:zero-key-null-storage-events`, keyNullDispatched === 0 && keyNullReceived === 0, { dispatched: w.dispatched.map((item) => String(item.key)), received: w.received.map((item) => `${item.key}:${item.trusted}`) });
  check(`${name}:no-account-relock-or-scope-transition`, scopeAfter.length === 0 && scope.kind === "account" && scope.accountId === OWNER && scope.generation === "g1", { scopeAfter, scope });
  check(`${name}:no-gate-screen-no-host-remount`, gateInsertions === 0 && watchedRemovals === 0 && replaced.length === 0 && (await ev("verify.instance")) === instance, { dom: dom.dom.slice(0, 6), replaced });
  check(`${name}:every-rendered-frame-keeps-appearance-pet-and-stored-rail-order`, frames.length > 0 && changedFrames.length === 0, { frames: frames.length, changed: changedFrames.slice(0, 3), allowedMissing });
  check(`${name}:displayed-appearance-pet-and-rail-position-unchanged-after`, isDeepStrictEqual(visual(snapshot.computed), visual(BASE.computed)), { observed: visual(snapshot.computed), expected: visual(BASE.computed) });
  check(`${name}:rail-order-after-derived-from-stored-order-and-committed-bytes`, isDeepStrictEqual(snapshot.railOrder, expectedRail(committedAfter)), { observed: snapshot.railOrder, expected: expectedRail(committedAfter), committedAfter });
  check(`${name}:appearance-rail-order-and-pet-bytes-unchanged`, isDeepStrictEqual(appearanceAfter, appearanceBefore) && isDeepStrictEqual(appearanceDevtools, appearanceBefore), { before: appearanceBefore, after: appearanceAfter, devtools: appearanceDevtools });
  if (unrelatedMustHold) check(`${name}:every-other-localstorage-key-unchanged`, changedKeys.length === 0, { changedKeys, keys: Object.keys(unrelatedBefore).length });
  record("operation", { op: name, frames: frames.length, changedFrames: changedFrames.length, committedBefore, committedAfter, rail: snapshot.railOrder, unrelatedKeysChanged: changedKeys,
    featureAttempts: summarize(w.attempts.filter((item) => FEATURE_KEYS.includes(item.key))), otherMutations: short(mutationsOf(w.attempts.filter((item) => !FEATURE_KEYS.includes(item.key)))) });
  return outcome;
}

// ---------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------
let harnessError = null;
try {
  page = await run.prepare();
  await runDownstream();
  pre("run:no-unexpected-javascript-dialogs", run.dialogs.every((item) => item.expected), { dialogs: run.dialogs });
  const network = await ev("__native.network").catch(() => []);
  pre("run:no-non-local-network-attempt", network.every((item) => item.local), { nonLocal: network.filter((item) => !item.local) });
  check("run:runtime-errors-zero", run.runtimeErrors.length === 0, { runtimeErrors: run.runtimeErrors.slice(0, 5) });
} catch (error) {
  harnessError = error;
} finally {
  if (doc2) await run.closeTarget(doc2).catch(() => {});
  await run.finish(harnessError);
}

async function runDownstream() {
  // =============================================================================================
  // D0: production rail ids, then the seeded App (appearance, custom rail order, pet, all 8 on)
  // =============================================================================================
  await run.seed(page, { [MARKER_KEY]: MARKER }, "d0:ids");
  await mountApp(page, "d0:ids-mount", "/app/settings/features");
  RAIL_IDS = await ev("verify.railIds");
  NAV = await ev("verify.nav.en");
  const railDefault = await ev("verify.railDefault");
  CUSTOM = [...RAIL_IDS].reverse();
  pre("d0:custom-order-differs-from-default", !isDeepStrictEqual(CUSTOM, railDefault) && IDS.every((id) => RAIL_IDS.includes(id)), { CUSTOM, railDefault });
  const SEEDS = {
    [MARKER_KEY]: MARKER,
    xai_accent_hue: "210",
    xai_bg_tone: "lavender",
    xai_rail_pos: "right",
    xai_rail_order: JSON.stringify(CUSTOM),
    xai_pet_id: "pip",
    xai_pet_pos: JSON.stringify({ x: 300, y: 200 }),
    xai_pref_sticky_color: "mint",
    xai_native_unrelated_probe: "keep",
  };
  await run.seed(page, SEEDS, "d0");
  await mountApp(page, "d0:mount", "/app/settings/features");
  {
    const snapshot = await ev("__native.snapshot()");
    const probe = await ev("__native.view()");
    const bytes = await featureBytes();
    const mountAttempts = await ev("__native.window(0).attempts");
    pre("d0:displays-seeded-appearance-rail-and-pet", snapshot.computed.accentHue === "210" && snapshot.computed.bgTone === "lavender" && snapshot.computed.htmlRailPos === "right"
      && snapshot.computed.appRailPos === "right" && snapshot.computed.railDataPos === "right" && snapshot.computed.petAnim === "pet-anim-hop" && snapshot.computed.petTransform === "translate(300px, 200px)"
      && isDeepStrictEqual(snapshot.railOrder, CUSTOM.map(labelOf)), { snapshot });
    pre("d0:seeded-bytes-features-absent", isDeepStrictEqual(await bytesOf(APPEARANCE_KEYS), Object.fromEntries(APPEARANCE_KEYS.map((key) => [key, SEEDS[key]]))) && isDeepStrictEqual(bytes, allOf(null)), { bytes });
    check("d0:zero-mount-write-remove-attempts-on-the-8-keys", mutationsOf(mountAttempts.filter((item) => FEATURE_KEYS.includes(item.key))).length === 0, { features: summarize(mountAttempts.filter((item) => FEATURE_KEYS.includes(item.key))) });
    BASE = { computed: snapshot.computed, probe };
    record("observation", { id: "d0:baseline", snapshot, probe, railIds: RAIL_IDS, custom: CUSTOM, railDefault });
  }
  await searchTruth("d0:search-all-on");

  // =============================================================================================
  // Items 2, 4, 5: rail truth, search truth and cross-module isolation during and after every operation
  // =============================================================================================
  await isolatedOp("o1-toggle-commit-boards-off", async () => {
    await clickSwitch("board");
    const ok = await until(`__native.native.get("xai_pref_features_board") === "false" && ${statusIs(COPY.saved)} && __native.features().recovery.length === 0`, 6000);
    await delay(200);
    const rail = await ev("verify.rail()");
    check("o1:committed-off-removes-rail-entry-same-tab-no-reload", ok && !rail.includes("Boards") && isDeepStrictEqual(rail, expectedRail(await featureBytes())), { rail });
  });
  await isolatedOp("o2-held-toggle-calendar-off", async () => {
    await ev(`__native.hold(${JSON.stringify(LOCK_OF("calendar"))})`);
    await clickSwitch("calendar");
    const pending = await until(recoveryIs([entry("calendar", "saving")]), 5000);
    const waiting = await until(`__native.lockQuery().then((query) => query.held.includes(${JSON.stringify(LOCK_OF("calendar"))}) && query.pending.includes(${JSON.stringify(LOCK_OF("calendar"))}))`, 4000);
    pre("o2:engine-waits-behind-real-calendar-lock", pending && waiting);
    await delay(500);
    const rail = await ev("verify.rail()");
    const bytes = await featureBytes();
    check("o2:pending-held-toggle-leaves-rail-unchanged", rail.includes("Calendar") && bytes.calendar === null && (await view()).switches.calendar === "false", { rail, calendar: bytes.calendar });
  });
  await isolatedOp("o3-failed-toggle-matrix-off", async () => {
    await ev(`__native.denySet(${JSON.stringify(keyOf("matrix"))})`);
    await clickSwitch("matrix");
    const failed = await until(recoveryIs([entry("calendar", "saving"), entry("matrix", "not-saved")]), 5000);
    await delay(300);
    const rail = await ev("verify.rail()");
    const bytes = await featureBytes();
    check("o3:failed-toggle-leaves-rail-unchanged", failed && rail.includes("Matrix") && bytes.matrix === null && (await view()).switches.matrix === "false", { rail, matrix: bytes.matrix });
  });
  {
    const listed = await searchTruth("s1:search-with-committed-pending-and-failed");
    check("s1:committed-off-excluded-pending-and-failed-still-listed", !listed.includes("board") && listed.includes("calendar") && listed.includes("matrix"), { listed });
  }
  await isolatedOp("o4-retry-success-matrix", async () => {
    await ev("__native.restore()");
    await paneAction("Retry Matrix");
    const ok = await until(`__native.native.get("xai_pref_features_matrix") === "false" && ${recoveryIs([entry("calendar", "saving")])}`, 6000);
    await delay(200);
    const rail = await ev("verify.rail()");
    check("o4:successful-retry-updates-rail", ok && !rail.includes("Matrix") && rail.includes("Calendar"), { rail });
  });
  await searchTruth("s2:search-after-retry");
  await isolatedOp("o5-release-held-calendar", async () => {
    await ev(`__native.release(${JSON.stringify(LOCK_OF("calendar"))})`);
    const ok = await until(`__native.native.get("xai_pref_features_calendar") === "false" && __native.features().recovery.length === 0 && ${statusIs(COPY.saved)}`, 6000);
    await delay(200);
    const rail = await ev("verify.rail()");
    check("o5:held-write-commits-then-rail-updates", ok && !rail.includes("Calendar"), { rail });
  });
  await isolatedOp("o6-failed-then-discard-tasks", async () => {
    await ev(`__native.denySet(${JSON.stringify(keyOf("tasks"))})`);
    await clickSwitch("tasks");
    const failed = await until(recoveryIs([entry("tasks", "not-saved")]), 5000);
    const railFailed = await ev("verify.rail()");
    const discardMark = await mark();
    await paneAction("Discard Tasks");
    const clean = await until("__native.features().recovery.length === 0", 4000);
    await delay(200);
    const attempts = await ev(`__native.window(${discardMark}).attempts`);
    const rail = await ev("verify.rail()");
    check("o6:discard-zero-writes-rail-unchanged-throughout", failed && clean && mutationsOf(attempts).length === 0 && railFailed.includes("Tasks") && rail.includes("Tasks") && (await view()).switches.tasks === "true", { mutations: short(mutationsOf(attempts)), rail });
    await ev("__native.restore()");
  });
  await isolatedOp("o7-discard-all", async () => {
    await ev(`__native.denySet(${JSON.stringify([keyOf("tasks"), keyOf("pomodoro")])})`);
    await clickSwitch("tasks");
    await clickSwitch("pomodoro");
    const failed = await until(recoveryIs([entry("tasks", "not-saved"), entry("pomodoro", "not-saved")]), 5000);
    const discardMark = await mark();
    await run.clickButton(page, COPY.discardAll, `${PANE} .features-recovery-actions`);
    const clean = await until("__native.features().recovery.length === 0", 4000);
    await delay(200);
    const attempts = await ev(`__native.window(${discardMark}).attempts`);
    const rail = await ev("verify.rail()");
    check("o7:discard-all-zero-writes-rail-unchanged", failed && clean && mutationsOf(attempts).length === 0 && rail.includes("Tasks") && rail.includes("Pomodoro"), { mutations: short(mutationsOf(attempts)), rail });
    await ev("__native.restore()");
  });
  await isolatedOp("o8-full-reset", async () => {
    const before = await featureBytes();
    pre("o8:three-modules-stored-off-before-reset", before.board === "false" && before.calendar === "false" && before.matrix === "false", { before });
    await clickReset(true, "o8");
    const ok = await until(`${physicalIs(allOf(null))} && ${statusIs(COPY.restored)} && __native.features().recovery.length === 0`, 8000);
    await delay(300);
    const rail = await ev("verify.rail()");
    check("o8:full-reset-restores-all-eight-in-the-rail", ok && IDS.every((id) => rail.includes(LABEL[id])) && isDeepStrictEqual(rail, expectedRail(allOf(null))), { rail });
  }, { unrelatedMustHold: true });
  await searchTruth("s3:search-after-full-reset");
  await isolatedOp("o9-commit-three-off", async () => {
    for (const field of ["board", "calendar", "habits"]) {
      await clickSwitch(field);
      const ok = await until(`__native.native.get(${JSON.stringify(keyOf(field))}) === "false" && __native.features().recovery.length === 0 && ${statusIs(COPY.saved)}`, 6000);
      pre(`o9:${field}-committed-off`, ok);
    }
    const rail = await ev("verify.rail()");
    check("o9:three-committed-off-leave-the-rail", !rail.includes("Boards") && !rail.includes("Calendar") && !rail.includes("Habits"), { rail });
  });
  await isolatedOp("o10-partial-reset-calendar-refused", async (since) => {
    await ev(`__native.denyRemove(${JSON.stringify(keyOf("calendar"))})`);
    await clickReset(true, "o10");
    const partial = await until(`${recoveryIs([entry("calendar", "not-reset")])} && ${physicalIs({ ...allOf(null), calendar: "false" })}`, 8000);
    await delay(300);
    const attempts = await ev(`__native.window(${since}).attempts`);
    pre("o10:remove-fault-fired", opsOn(attempts, "remove", "calendar").some((item) => item.outcome === "denied"), { removes: short(attempts.filter((item) => item.op === "remove")) });
    const rail = await ev("verify.rail()");
    check("o10:partial-reset-restores-only-the-succeeded-keys-in-the-rail", partial && rail.includes("Boards") && rail.includes("Habits") && !rail.includes("Calendar") && (await view()).status === "", { rail });
  }, { unrelatedMustHold: true });
  await searchTruth("s4:search-after-partial-reset");
  await isolatedOp("o11-retry-partial-reset-calendar", async () => {
    await ev("__native.restore()");
    await paneAction("Retry Calendar");
    const ok = await until(`${physicalIs(allOf(null))} && ${statusIs(COPY.restored)} && __native.features().recovery.length === 0`, 6000);
    await delay(200);
    const rail = await ev("verify.rail()");
    check("o11:successful-reset-retry-restores-the-rail-entry", ok && rail.includes("Calendar") && isDeepStrictEqual(rail, expectedRail(allOf(null))), { rail });
  }, { unrelatedMustHold: true });
  record("isolation-totals-first-document", { ...totals });

  // ---- Item 5 (last bullet): an AppRail drag-reorder after a Features reset persists the stored order ----
  {
    const storedBeforeDrag = (await bytesOf(["xai_rail_order"])).xai_rail_order;
    const displayed = await ev("verify.rail()");
    pre("drag:stored-custom-order-intact-before-drag", storedBeforeDrag === JSON.stringify(CUSTOM) && isDeepStrictEqual(displayed, CUSTOM.map(labelOf)), { storedBeforeDrag, displayed });
    const reorder = (items, fromId, toId) => {
      const next = [...items];
      const fromIndex = next.indexOf(fromId);
      const toIndex = next.indexOf(toId);
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, fromId);
      return next;
    };
    const railDefault = await ev("verify.railDefault");
    const validFrom = (stored) => [...stored.filter((id) => RAIL_IDS.includes(id)), ...RAIL_IDS.filter((id) => !stored.includes(id))];
    const storedValid = validFrom(CUSTOM);
    const defaultValid = validFrom(railDefault);
    const fromStored = reorder(storedValid, storedValid[0], storedValid[2]);
    const fromDefault = reorder(defaultValid, defaultValid[0], defaultValid[2]);
    const points = await ev(`(() => {
      const buttons = [...document.querySelectorAll('.app-rail .rail-items .rail-btn')];
      const centre = (element) => { const rect = element.getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, label: element.getAttribute("aria-label"), hit: element.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)) }; };
      return { source: centre(buttons[0]), target: centre(buttons[2]) };
    })()`);
    pre("drag:source-and-target-hit-tested", points.source.hit && points.target.hit, { points });
    const dragMark = await mark();
    const intercepted = [];
    const listener = (message) => { if (message.method === "Input.dragIntercepted") intercepted.push(message.params.data); };
    page.listeners.push(listener);
    await page.cdp("Input.setInterceptDrags", { enabled: true });
    await page.cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: points.source.x, y: points.source.y });
    await page.cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: points.source.x, y: points.source.y, button: "left", buttons: 1, clickCount: 1 });
    await page.cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: points.target.x, y: points.target.y, button: "left", buttons: 1 });
    const deadline = Date.now() + 4000;
    while (intercepted.length === 0 && Date.now() < deadline) await delay(25);
    pre("drag:browser-drag-started-and-intercepted", intercepted.length > 0, { intercepted: intercepted.length });
    const data = intercepted[0];
    await page.cdp("Input.dispatchDragEvent", { type: "dragEnter", x: points.target.x, y: points.target.y, data });
    await page.cdp("Input.dispatchDragEvent", { type: "dragOver", x: points.target.x, y: points.target.y, data });
    await delay(150);
    await page.cdp("Input.dispatchDragEvent", { type: "drop", x: points.target.x, y: points.target.y, data });
    await page.cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: points.target.x, y: points.target.y, button: "left", buttons: 0, clickCount: 1 });
    await page.cdp("Input.setInterceptDrags", { enabled: false });
    page.listeners.splice(page.listeners.indexOf(listener), 1);
    const persistedChanged = await until(`__native.native.get("xai_rail_order") !== ${JSON.stringify(JSON.stringify(CUSTOM))}`, 4000);
    await delay(300);
    const dragWindow = await ev(`__native.window(${dragMark})`);
    const persisted = (await bytesOf(["xai_rail_order"])).xai_rail_order;
    const railWrites = dragWindow.attempts.filter((item) => item.key === "xai_rail_order" && item.op === "set");
    pre("drag:trusted-dragstart-and-dragover-observed", dragWindow.drags.some((item) => item.type === "dragstart" && item.trusted && item.target === points.source.label)
      && dragWindow.drags.some((item) => item.type === "dragover" && item.trusted && item.target === points.target.label), { drags: dragWindow.drags });
    pre("drag:the-drag-persisted-a-changed-rail-order", persistedChanged && persisted !== null && railWrites.length >= 1, { persisted, railWrites: railWrites.length });
    const persistedIds = JSON.parse(persisted);
    check("drag:after-reset-drag-persists-order-derived-from-stored-custom-order", isDeepStrictEqual(persistedIds, fromStored), { persisted: persistedIds, derivedFromStored: fromStored, derivedFromDefault: fromDefault, matchesDefaultDerived: isDeepStrictEqual(persistedIds, fromDefault) });
    record("observation", { id: "drag", source: points.source.label, target: points.target.label, drags: dragWindow.drags.map((item) => `${item.type}:${item.target}:${item.trusted}`), railWrites: railWrites.map((item) => item.value), persisted: persistedIds, fromStored, fromDefault, railAfterDrag: await ev("verify.rail()") });
    // The drag intentionally changed the stored rail order; later expectations derive from the new stored order.
    CUSTOM = persistedIds;
  }

  // ---- Item 5: Reload (source-only state from a read fault armed before mount) ------------------
  {
    const { identifier } = await page.cdp("Page.addScriptToEvaluateOnNewDocument", { source: `window.__nativeFaultPlan = { get: [${JSON.stringify(keyOf("dashboard"))}] };` });
    await mountApp(page, "o12:mount-with-dashboard-read-fault", "/app/settings/features");
    await page.cdp("Page.removeScriptToEvaluateOnNewDocument", { identifier });
    const plan = await ev("({ plan: __native.planApplied, faults: __native.faultState() })");
    const deniedRead = (await ev("__native.window(0).attempts")).some((item) => item.op === "get" && item.key === keyOf("dashboard") && item.outcome === "denied");
    pre("o12:read-fault-plan-applied-before-mount-and-fired", isDeepStrictEqual(plan.plan, { get: [keyOf("dashboard")] }) && deniedRead, { plan });
    check("o12:source-only-dashboard-reload-only", isDeepStrictEqual((await view()).recovery, [entry("dashboard", "unavailable")]), { recovery: (await view()).recovery });
    await mountMatchesBaseline("o12:mount");
    await isolatedOp("o12-reload-source-only", async (since) => {
      await paneAction("Reload Dashboard");
      await delay(400);
      const still = await view();
      check("o12:reload-while-faulted-keeps-alert-no-write", isDeepStrictEqual(still.recovery, [entry("dashboard", "unavailable")]), { recovery: still.recovery });
      await ev("__native.restore()");
      await paneAction("Reload Dashboard");
      const repaired = await until("__native.features().recovery.length === 0", 4000);
      await delay(200);
      const attempts = await ev(`__native.window(${since}).attempts`);
      check("o12:reload-repairs-without-writes-or-saved-claim", repaired && mutationsOf(attempts.filter((item) => FEATURE_KEYS.includes(item.key))).length === 0 && (await view()).status === "", { mutations: short(mutationsOf(attempts)) });
    }, { unrelatedMustHold: true });
  }
  record("isolation-totals", { ...totals });
  check("isolation:zero-key-null-zero-relock-zero-remount-zero-changed-frames", totals.keyNullDispatched === 0 && totals.keyNullReceived === 0 && totals.scopeTransitions === 0 && totals.gateInsertions === 0
    && totals.watchedRemovals === 0 && totals.replacedNodes === 0 && totals.changedFrames === 0 && totals.frames > 0, totals);

  // =============================================================================================
  // Item 3: route truth (deep link to a module that is off; the original module after an "on" commit)
  // =============================================================================================
  {
    await clickSwitch("board");
    pre("r1:boards-committed-off", await until(`__native.native.get("xai_pref_features_board") === "false" && __native.features().recovery.length === 0`, 6000));
    await mountApp(page, "r1:deep-link-board-off", "/app/board", READY_BOARD_ROUTE);
    const route = await ev("verify.route()");
    const rail = await ev("verify.rail()");
    const attempts = await ev("__native.window(0).attempts");
    check("r1:deep-link-to-off-module-renders-disabled-feature-fallback", route.pathname === "/app/board" && route.fallback?.featureId === "board" && route.fallback?.title === "Boards" && route.boardsModule === false, { route });
    check("r1:rail-without-boards-zero-feature-writes", !rail.includes("Boards") && mutationsOf(attempts.filter((item) => FEATURE_KEYS.includes(item.key))).length === 0, { rail });
    await mountMatchesBaseline("r1:mount");
    await mountApp(page, "r2:features", "/app/settings/features");
    await clickSwitch("board");
    pre("r2:boards-committed-on", await until(`__native.native.get("xai_pref_features_board") === "true" && __native.features().recovery.length === 0 && ${statusIs(COPY.saved)}`, 6000));
    const instance = await ev("verify.instance");
    const navMark = await mark();
    await run.trustedClick(page, '.app-rail .rail-items [aria-label="Boards"]', "r2:rail Boards");
    const rendered = await until("verify.route().boardsModule === true && verify.route().fallback === null", 8000);
    await delay(400);
    const routeOn = await ev("verify.route()");
    const commits = await ev(`verify.commitsAfter(${navMark})`);
    check("r2:after-on-commit-the-original-module-renders-same-document", rendered && routeOn.pathname === "/app/board" && commits.length === 1 && commits[0].pathname === "/app/board" && (await ev("verify.instance")) === instance, { routeOn, commits });
    record("route", { r1: route, r2: routeOn, commits });
  }

  // =============================================================================================
  // Item 7: two documents (native storage events): rail, route and CmdK; a preserved conflict
  // =============================================================================================
  await mountApp(page, "t0:doc1-features", "/app/settings/features");
  await mountMatchesBaseline("t0:doc1");
  // The second target starts on the product-free seed page so CDP runtime capture is enabled before the App loads.
  doc2 = await run.openTarget("/seed", "doc2");
  await mountApp(doc2, "t0:doc2-board", "/app/board", READY_BOARD_ROUTE);
  await page.cdp("Page.bringToFront");
  await delay(300);
  {
    const route = await doc2.evaluate("verify.route()");
    pre("t0:doc2-shows-the-boards-module", route.boardsModule === true && route.fallback === null, { route });
  }
  const doc1Instance = await ev("verify.instance");
  const doc2Instance = await doc2.evaluate("verify.instance");
  const tMark1 = await mark();
  const tMark2 = await mark(doc2);
  const marked1 = await ev("__native.markElements()");
  const marked2 = await doc2.evaluate("__native.markElements()");
  pre("t0:surfaces-marked-in-both-documents", marked1.includes("pane") && marked1.includes("rail") && marked2.includes("rail") && marked2.includes("pet"), { marked1, marked2 });

  // T1: doc1 commits Boards off; doc2's rail, route and CmdK follow through the native storage event.
  {
    const m2 = await mark(doc2);
    await clickSwitch("board");
    pre("t1:doc1-committed-boards-off", await until(`__native.native.get("xai_pref_features_board") === "false" && __native.features().recovery.length === 0 && ${statusIs(COPY.saved)}`, 6000));
    const followed = await doc2.waitUntil("verify.route().fallback?.featureId === 'board' && !verify.rail().includes('Boards')", 6000);
    const received = await doc2.evaluate(`__native.window(${m2}).storageReceived`);
    const route = await doc2.evaluate("verify.route()");
    check("t1:doc2-rail-and-route-follow-committed-toggle", followed && route.boardsModule === false && (await doc2.evaluate("verify.instance")) === doc2Instance, { route, rail: await doc2.evaluate("verify.rail()") });
    check("t1:doc2-received-native-keyed-event-not-key-null", received.some((item) => item.key === keyOf("board") && item.trusted && item.newValue === "false") && received.every((item) => item.key !== null), { received });
    await doc2.cdp("Page.bringToFront");
    await delay(200);
    await searchTruth("t1:doc2-search", doc2);
    await page.cdp("Page.bringToFront");
    await delay(200);
  }
  // T2: doc1 resets to defaults; doc2 follows (Boards back in rail, route and CmdK).
  {
    const m2 = await mark(doc2);
    await clickReset(true, "t2");
    pre("t2:doc1-defaults-restored", await until(`${physicalIs(allOf(null))} && ${statusIs(COPY.restored)}`, 8000));
    const followed = await doc2.waitUntil("verify.route().boardsModule === true && verify.route().fallback === null && verify.rail().includes('Boards')", 8000);
    const received = await doc2.evaluate(`__native.window(${m2}).storageReceived`);
    check("t2:doc2-rail-and-route-follow-committed-reset", followed && (await doc2.evaluate("verify.instance")) === doc2Instance, { route: await doc2.evaluate("verify.route()"), rail: await doc2.evaluate("verify.rail()") });
    check("t2:doc2-received-native-keyed-removal-not-key-null", received.some((item) => item.key === keyOf("board") && item.trusted && item.newValue === null) && received.every((item) => item.key !== null), { received });
    await doc2.cdp("Page.bringToFront");
    await delay(200);
    await searchTruth("t2:doc2-search", doc2);
    await page.cdp("Page.bringToFront");
    await delay(200);
  }
  // Both documents: no key:null, no relock, no gate, no remount during T1–T2.
  {
    const w1 = await ev(`(() => { const w = __native.window(${tMark1}); return { dispatched: w.storageDispatches.filter((item) => item.key === null).length, received: w.storageReceived.filter((item) => item.key === null).length }; })()`);
    const w2 = await doc2.evaluate(`(() => { const w = __native.window(${tMark2}); return { dispatched: w.storageDispatches.filter((item) => item.key === null).length, received: w.storageReceived.filter((item) => item.key === null).length }; })()`);
    const scope1 = await ev(`verify.scopeAfter(${tMark1})`);
    const scope2 = await doc2.evaluate(`verify.scopeAfter(${tMark2})`);
    const fates1 = await ev("__native.elementFates()");
    const fates2 = await doc2.evaluate("__native.elementFates()");
    const replaced1 = Object.entries(fates1).filter(([, fate]) => fate.marked && !fate.sameNode).map(([part]) => part);
    const replaced2 = Object.entries(fates2).filter(([, fate]) => fate.marked && !fate.sameNode).map(([part]) => part);
    check("t1-t2:both-documents-zero-key-null-no-relock-no-remount", w1.dispatched === 0 && w1.received === 0 && w2.dispatched === 0 && w2.received === 0 && scope1.length === 0 && scope2.length === 0
      && replaced1.length === 0 && replaced2.length === 0 && (await ev("verify.instance")) === doc1Instance, { w1, w2, scope1, scope2, replaced1, replaced2 });
    await mountMatchesBaseline("t2:doc1-after");
    await mountMatchesBaseline("t2:doc2-after", doc2);
  }
  // T3: a failed draft for the same key in doc2 becomes a preserved conflict after doc1 commits.
  {
    await mountApp(doc2, "t3:doc2-features", "/app/settings/features");
    await doc2.cdp("Page.bringToFront");
    await delay(200);
    await doc2.evaluate(`__native.denySet(${JSON.stringify(keyOf("board"))})`);
    await clickSwitch("board", doc2);
    const failed = await doc2.waitUntil(recoveryIs([entry("board", "not-saved")]), 5000);
    pre("t3:doc2-failed-draft-boards-off", failed && (await featureBytes(doc2)).board === null && (await view(doc2)).switches.board === "false", { view: await view(doc2) });
    await page.cdp("Page.bringToFront");
    await delay(200);
    const m2 = await mark(doc2);
    await clickSwitch("board");
    pre("t3:doc1-committed-off", await until(`__native.native.get("xai_pref_features_board") === "false" && __native.features().recovery.length === 0`, 6000));
    await clickSwitch("board");
    pre("t3:doc1-committed-on", await until(`__native.native.get("xai_pref_features_board") === "true" && __native.features().recovery.length === 0`, 6000));
    const delivered = await doc2.waitUntil(`__native.window(${m2}).storageReceived.filter((item) => item.key === ${JSON.stringify(keyOf("board"))} && item.trusted).length >= 2`, 4000);
    pre("t3:doc2-received-both-native-keyed-events", delivered, { received: await doc2.evaluate(`__native.window(${m2}).storageReceived`) });
    await doc2.cdp("Page.bringToFront");
    await delay(200);
    await doc2.evaluate("__native.restore()");
    const retryMark = await mark(doc2);
    await paneAction("Retry Boards", doc2);
    await delay(800);
    const afterRetry = await doc2.evaluate(`({ view: __native.features(), attempts: __native.window(${retryMark}).attempts })`);
    const bytesAfterRetry = await featureBytes(doc2);
    check("t3:doc2-retry-preserves-doc1-bytes-no-overwrite", bytesAfterRetry.board === "true" && opsOn(afterRetry.attempts, "set", "board").length === 0 && opsOn(afterRetry.attempts, "remove", "board").length === 0, { board: bytesAfterRetry.board, attempts: short(afterRetry.attempts.filter((item) => item.key === keyOf("board"))) });
    check("t3:doc2-conflict-preserved-latest-choice-kept", isDeepStrictEqual(afterRetry.view.recovery, [entry("board", "not-saved")]) && afterRetry.view.switches.board === "false" && afterRetry.view.status === "", { view: afterRetry.view });
    const repeatMark = await mark(doc2);
    await paneAction("Retry Boards", doc2);
    await delay(800);
    const repeat = await doc2.evaluate(`({ view: __native.features(), attempts: __native.window(${repeatMark}).attempts })`);
    check("t3:doc2-repeated-retry-never-overwrites", (await featureBytes(doc2)).board === "true" && mutationsOf(repeat.attempts).length === 0 && isDeepStrictEqual(repeat.view.recovery, [entry("board", "not-saved")]), { mutations: short(mutationsOf(repeat.attempts)) });
    const discardMark = await mark(doc2);
    await paneAction("Discard Boards", doc2);
    const discarded = await doc2.waitUntil("__native.features().recovery.length === 0", 4000);
    await delay(200);
    const afterDiscard = await doc2.evaluate(`({ view: __native.features(), attempts: __native.window(${discardMark}).attempts })`);
    check("t3:doc2-discard-zero-writes-shows-doc1-value", discarded && mutationsOf(afterDiscard.attempts).length === 0 && afterDiscard.view.switches.board === "true" && (await featureBytes(doc2)).board === "true", { view: afterDiscard.view });
    await page.cdp("Page.bringToFront");
    await delay(200);
    const w1 = await ev(`__native.window(${tMark1}).storageDispatches.filter((item) => item.key === null).length + __native.window(${tMark1}).storageReceived.filter((item) => item.key === null).length`);
    const w2 = await doc2.evaluate("__native.window(0).storageDispatches.filter((item) => item.key === null).length + __native.window(0).storageReceived.filter((item) => item.key === null).length");
    const scope1 = await ev(`verify.scopeAfter(${tMark1})`);
    check("t3:zero-key-null-in-both-documents-no-relock-in-doc1", w1 === 0 && w2 === 0 && scope1.length === 0 && (await ev("verify.instance")) === doc1Instance, { w1, w2, scope1 });
    record("two-documents", { doc1Instance, doc2Instance, conflict: { bytes: bytesAfterRetry, recovery: afterRetry.view.recovery } });
  }
  await run.closeTarget(doc2);
  doc2 = null;
}
